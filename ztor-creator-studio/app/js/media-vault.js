/* media-vault.js — Media Vault 的渲染與互動。
   ============================================================
   版面契約（見 ds-components/media-vault.css 的檔頭）：
     側欄＝庫房清單，每列掛一個鑰匙數；主欄＝門條 ＋ 內容格。
     所有人數都向 vault-store.js 要，本檔一個數字都不自己算，
     也不快取——條件一改就重問，畫面上不會有算過一次就過期的數。

   三個刻意的行為決定：
     · 新增庫房就地做，不開 modal。只有一個必填欄位（名稱），為了問
       一個字把整個畫面蓋掉，是把中斷當成儀式。
     · 剛建立的庫房條件是空的，門條會亮紅：0 人打得開。這不是錯誤狀態
       在嚇人，是事實——沒有條件就是沒有人進得來，比預設「所有人可見」
       安全，未發行素材外流通常就是從那個預設開始的。
     · 條件選單裡每一項都附上「這條規則本身觸及幾人」。創作者要選的不是
       一個名詞，是一群人。
   ============================================================ */
(function () {
  "use strict";

  var V = window.ztorVault;
  if (!V) return;

  function isZh() { return document.documentElement.lang === "zh-Hant"; }
  function tx(en, zh) { return isZh() ? zh : en; }
  /* 2026-10-09 三分頁起新寫的字一律進 i18n.js 的 vault.*，這裡只負責查表與代入佔位
     （{n}、{tier}…）。代入的值由呼叫端先 esc／num 過；字串本身可以帶 <b>，因為兩種
     語言的數字位置不同。舊的 tx(en, zh) 內嵌雙語是本檔既有慣例，沒動到的字維持原樣。 */
  function L(key, vars) {
    var s = window.i18nT ? window.i18nT(key) : null;
    if (s == null) s = key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  function num(n) { return Number(n).toLocaleString("en-US"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function icon(name, cls) { return '<i data-lucide="' + name + '" class="ztor-icon' + (cls ? " " + cls : "") + '"></i>'; }
  function reduced() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  /* 英文要單複數，中文不用。「1 clips」是那種一眼就看得出是機器寫的字。 */
  function plural(n, one, many, zh) { return isZh() ? n + " " + zh : n + " " + (n === 1 ? one : many); }
  /* 站內日期一律 YYYY/MM/DD（同 projects-store／events-store 的既有格式）。 */
  function todayStr() {
    var d = new Date(), p = function (x) { return (x < 10 ? "0" : "") + x; };
    return d.getFullYear() + "/" + p(d.getMonth() + 1) + "/" + p(d.getDate());
  }

  var KIND = {
    image: { icon: "image",  label: { en: "Photo", zh: "圖片" } },
    clip:  { icon: "film",   label: { en: "Clip",  zh: "影片" } },
    audio: { icon: "music",  label: { en: "Audio", zh: "音檔" } }
  };

  /* 2026-07-29 使用者裁示：同一顆上傳鈕收所有媒體，但畫面要分三區。
     一顆按鈕丟進來的檔案，落地時已經知道自己該站哪一區；創作者不用先
     決定「這是要放哪一區」再上傳，分類是 MIME 幫他做的，不是他的操作。

     2026-07-31 使用者裁決修正：分區改成「有東西才長出來」。原本三區固定存在、
     空的印一句「尚無照片——拖進上面的上傳格」，理由是讓人知道東西會被分到哪；
     但一座新庫房因此會連續印出四塊「這裡沒有東西」（上傳格＋三個空分區），整頁
     都在宣告空白。那句教學改由空狀態講一次就好，講完就讓位給真的內容。 */
  var GROUPS = [
    { kind: "image", icon: "image", title: { en: "Photos", zh: "照片" } },
    { kind: "clip",  icon: "film",  title: { en: "Clips",  zh: "影片" } },
    { kind: "audio", icon: "music", title: { en: "Audio",  zh: "音檔" } }
  ];

  /* 版型旗標：<html data-vault-view="popup"> ＝ 總覽卡片牆＋單一庫房彈窗（保存在
     media-vault-popup.html）；沒有這個屬性＝清單與詳情並排，可以直接切換與編輯
     （正式頁，2026-08-01 使用者裁示改回這一種）。兩種版型共用這一支 JS。 */
  var POPUP = document.documentElement.getAttribute("data-vault-view") === "popup";

  /* viewer ＝ "" 創作者本人｜分級 key｜"person" 指定一位粉絲（F6，D477；person 是選中的那一位） */
  var state = { vaultId: V.vaults[0].id, viewer: "", person: null, itemId: null };
  var lastReach = null;
  var lastFocus = null;        /* 抽屜關掉之後焦點要回到打開它的那顆鈕 */
  var els = {};

  function vault() {
    var hit = V.vaults.filter(function (v) { return v.id === state.vaultId; })[0];
    return hit || V.vaults[0];
  }

  /* ── 檢視身分的三種角度（F6，D477）────────────────────────────
     tier：以某個分級；person：指定一位粉絲（還沒選人時等同創作者本人）。 */
  function lens() {
    if (state.viewer === "person") return state.person ? { kind: "person", fan: state.person } : { kind: "none" };
    if (state.viewer) return { kind: "tier", tier: state.viewer };
    return { kind: "none" };
  }
  /* 這個角度進不進得了這座庫房。分級＝那一級有沒有人進得來（人數會說真話，布林值不會）。 */
  function lensLocked(f, lz) {
    lz = lz || lens();
    if (lz.kind === "tier") return V.reachInTierAll(f, lz.tier) === 0;
    if (lz.kind === "person") return !V.fanWays(f, lz.fan.idx).inVault;
    return false;
  }
  /* 一件內容在這個角度下的結果：unlocked／condition／notyet（＋差哪一級、是否判定待確認）。 */
  function lensItem(f, it, lz) {
    lz = lz || lens();
    if (lz.kind === "tier") {
      var st = V.itemStatusForTier(it, lz.tier);
      return { st: st, tier: st === "condition" ? V.taskOf(it).tier : null };
    }
    if (lz.kind === "person") return V.itemStatusForFan(f, it, lz.fan.idx);
    return null;
  }
  function lensName(lz) { return lz.kind === "tier" ? tierName(lz.tier) : lz.kind === "person" ? lz.fan.name : ""; }

  /* ── 庫房狀態（F10，D477）──────────────────────────────────── */
  var STATUS_TONE = { draft: "neutral", listed: "success", unlisted: "neutral" };
  function statusBadge(v) {
    return '<span class="badge badge--' + (STATUS_TONE[v.status] || "neutral") + '">' + esc(L("vault.status." + v.status)) + "</span>";
  }
  /* datetime-local 字串 → 站內格式 YYYY/MM/DD HH:mm（時區與時間粒度待規格確認）。 */
  function fmtWhen(s) {
    if (!s) return "";
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    return m ? m[1] + "/" + m[2] + "/" + m[3] + " " + m[4] + ":" + m[5] : String(s);
  }
  /* 排程的白話：「2026/11/01 20:00 上架 · 2026/11/12 23:59 定時下架」。 */
  function schedText(v) {
    var bits = [];
    if (!V.schedOn()) return "";   /* 排程（S125）不在版本內：種子裡的排程時間不顯示 */
    if (v.status !== "listed" && v.listAt) bits.push(L("vault.sched.list", { t: fmtWhen(v.listAt) }));
    if (v.unlistAt) bits.push(L("vault.sched.unlist", { t: fmtWhen(v.unlistAt) }));
    return bits.join(" · ");
  }
  function tierName(key) {
    var el = document.querySelector('[data-tier-name="' + key + '"]');
    return el ? el.textContent.trim() : key;
  }
  function vaultName(v) { return v.custom ? v.custom : V.t(v.name); }

  /* ── 第二層：每件內容的任務（D377，2026-10-08）──────────────────
     命名規則：「鑰匙」只指第一層的進庫憑證；第二層一律叫「任務」。本檔所有第二層文案
     都照這條寫——任務、行動任務、等級任務、解開。 */
  function tierAtLeast(key) { return tx(tierName(key) + " and up", tierName(key) + "以上"); }
  /* 一個任務的白話：圖示＋短句（格子上的小標用）＋完整句（title／抽屜用）。 */
  function taskInfo(task) {
    if (!task) return null;
    if (task.type === "tier") {
      return { icon: "chart-column", text: tierAtLeast(task.tier),
               full: tx("Tier task · ", "等級任務・") + tierAtLeast(task.tier) };
    }
    var d = V.actionDef(task.kind);
    if (!d) return null;
    var text = (d.labelN && task.n) ? V.t(d.labelN).replace("{n}", num(task.n)) : V.t(d.label);
    if (d.id === "shop") {
      var tl = task.scope === "item" ? V.targetLabel(task) : null;
      text += " · " + (task.scope === "item" ? (tl ? V.t(tl) : tx("pick a product", "未選商品")) : tx("any product", "任一商品"));
    } else {
      var tg = V.targetLabel(task);
      if (tg) text += " · " + V.t(tg);
    }
    return { icon: d.icon, text: text, full: tx("Action task · ", "行動任務・") + text };
  }
  /* 一顆小標。tone：media＝壓在影像上；plain＝坐在薄膜／列上。 */
  function tagHtml(tone, mod, iconName, text, title, feat) {
    return '<span class="vault-tag vault-tag--' + tone + (mod ? " vault-tag--" + mod : "") + '"' +
      (title ? ' title="' + esc(title) + '"' : "") + (feat ? ' data-feat="' + feat + '"' : "") + ">" +
      (iconName ? icon(iconName) : "") + '<span class="vault-tag__text">' + esc(text) + "</span></span>";
  }
  /* 檢視身分下一件內容的狀態小標（F6，D477 三種用詞＋整座上鎖）。 */
  function lensTag(tone, f, it, lz) {
    var who = lensName(lz);
    if (lensLocked(f, lz)) return tagHtml(tone, "low", "lock", L("vault.st.locked"), L("vault.st.locked.title", { who: who }), "S113");
    var r = lensItem(f, it, lz);
    var info = taskInfo(V.taskOf(it));
    if (r.st === "unlocked") return tagHtml(tone, "ok", "check", L("vault.st.unlocked"), L("vault.st.unlocked.title", { who: who }), "S86");
    if (r.st === "condition") {
      var tn = tierName(r.tier);
      return tagHtml(tone, "low", "lock", L("vault.st.condition", { tier: tn }), L("vault.st.condition.title", { who: who, tier: tn }), "S86");
    }
    var task = info ? info.text : "";
    var title = lz.kind === "tier"
      ? L("vault.st.notyet.title.tier", { who: who, task: task })
      : L(r.pending ? "vault.st.notyet.title.pending" : "vault.st.notyet.title.person", { who: who, task: task });
    return tagHtml(tone, "action", "flag", L("vault.st.notyet"), title, "S86");
  }
  /* 一件內容的小標組：任務（左）／大彩蛋＋幾人看得到（右）。檢視身分開著時，右邊那顆換成
     那個角度的結果（已解開／需要條件／未解開；整座進不了是上鎖）。 */
  function itemTags(it, tone) {
    var f = vault();
    var info = taskInfo(V.taskOf(it));
    var start = info ? tagHtml(tone, null, info.icon, info.text, info.full, "S86") : "";
    /* 大彩蛋屬 S121（⚪，release2.4 不放）：小標掛 S121，畫完 regate 收起。 */
    var end = it.grand ? tagHtml(tone, "grand", "sparkles", tx("Grand surprise", "大彩蛋"), tx("Marked as a grand surprise — it does not change how this item unlocks", "標為大彩蛋——只是標記，不影響解開"), "S121") : "";
    var lz = lens();
    if (lz.kind !== "none") {
      end += lensTag(tone, f, it, lz);
    } else {
      var n = V.itemViewers(f, it), e = V.itemEver(f, it);
      var listed = V.isListed(f);
      end += n == null
        ? tagHtml(tone, "pending", "eye", L("vault.ov.tbc"), L("vault.tag.viewers.tbc"), "S86")
        : tagHtml(tone, null, "eye", num(n),
            L(listed ? "vault.tag.viewers" : "vault.tag.viewers.trial", { n: num(n), e: num(e || 0) }), "S86");
    }
    return { start: start, end: end };
  }

  /* ── 側欄 ───────────────────────────────────────────────── */
  /* ── 保存檔 media-vault-popup.html：庫房總覽卡片牆 ────────────────
     側欄 276px 擠著的封面在這裡放得大，「哪座門開得最大」比清單更一眼看得出來。
     （正式頁沒有 [data-vault-overview]，這支直接返回。與正式頁「總覽」分頁無關，
     那一支是 renderOverviewTab。） */
  function renderWall() {
    if (!els.overview) return;
    var html = V.vaults.map(function (v) {
      var cover = V.cover(v);
      var reach = state.viewer ? V.reachInTierAll(v, state.viewer) : V.reachAll(v);
      var locked = !!state.viewer && reach === 0;
      var c = V.counts(v), parts = [];
      if (c.image) parts.push(plural(c.image, "photo", "photos", "圖"));
      if (c.clip)  parts.push(plural(c.clip,  "clip",  "clips",  "片"));
      if (c.audio) parts.push(plural(c.audio, "audio", "audio",  "音"));
      return '<button type="button" class="vault-ovcard' + (locked ? " is-locked" : "") +
          '" data-vault="' + v.id + '">' +
          '<span class="vault-ovcard__cover">' +
            (cover ? '<img src="' + cover + '" alt="" loading="lazy">' : icon(v.icon)) +
          "</span>" +
          '<span class="vault-ovcard__body">' +
            '<span class="vault-ovcard__name">' + esc(vaultName(v)) + "</span>" +
            '<span class="vault-ovcard__meta">' + (parts.join(" · ") || tx("Empty", "尚無內容")) + "</span>" +
            '<span class="vault-ovcard__reach">' +
              (locked
                ? icon("lock") + esc(L("vault.st.locked"))
                : '<span class="vault-ovcard__num">' + num(reach) + "</span>" +
                  tx("fans can open it", "位粉絲打得開")) +
            "</span>" +
          "</span>" +
        "</button>";
    }).join("");
    els.overview.innerHTML = html +
      '<button type="button" class="vault-ovcard vault-ovcard--new" data-vault-new-ov>' +
        icon("plus") + tx("New vault", "新增庫房") + "</button>";
    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.overview);
  }

  /* ── 單一庫房彈窗 ─────────────────────────────────────────
     開／關只動 hidden 與焦點，不換網址：它是同一頁的下一層，不是另一個頁面。 */
  function openVault(id, from) {
    state.vaultId = id;
    if (!els.modal) { lastReach = null; render(); return; }
    lastReach = null;
    lastFocus = from || document.activeElement;
    render();
    els.modal.hidden = false;
    document.body.style.overflow = "hidden";
    var close = els.modal.querySelector("[data-vault-modal-close]");
    if (close) close.focus();
  }
  function closeVault() {
    if (!els.modal || els.modal.hidden) return;
    els.modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  /* ── 單一內容的設定（2026-08-01 使用者裁示「點進去每個 media 設定裡」）──
     用抽屜不用第二層彈窗：庫房本身已經是一層彈窗，再疊一層會變成對話框中的對話框，
     而且會蓋掉剛才點的那一格；抽屜從右邊推進來，被編輯的東西還看得見。

     這裡只放規格有的東西：檔名、類型、大小、加入日期、長度、改名、刪除；2026-10-08 起
     加上第二層的任務與大彩蛋標記（5.1.7.3 F8、F5，D377）。有效期、浮水印這類還沒有
     上游規格的東西不擅自生出來——那會把「呈現探索」偷渡成產品功能。 */
  function itemById(id) {
    return vault().items.filter(function (i) { return i.id === id; })[0];
  }

  function renderItemSheet(it) {
    var k = KIND[it.kind];
    var rows = [
      [tx("Kind", "類型"), V.t(k.label)],
      [tx("Size", "檔案大小"), it.size || "—"],
      [tx("Added", "加入日期"), it.added || "—"]
    ];
    if (it.dur) rows.splice(1, 0, [tx("Length", "長度"), it.dur]);

    stopPreview();
    els.itemBody.innerHTML =
      previewHtml(it) +
      /* 不提供下載（F5，D477）：一行講清楚粉絲端能做什麼。 */
      '<p class="vault-item__online" data-feat="S112">' + icon("eye") + "<span>" + esc(L("vault.item.online")) + "</span></p>" +
      '<label class="field">' +
        '<span class="field__label">' + tx("Name", "名稱") + "</span>" +
        '<input class="input" type="text" data-item-name value="' + esc(V.t(it.name)) + '">' +
      "</label>" +
      '<dl class="vault-item__facts">' +
        rows.map(function (r) {
          return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>";
        }).join("") +
      "</dl>" +
      taskSectionHtml(it) +
      grandRowHtml(it) +
      '<div class="vault-item__actions">' +
        '<button type="button" class="btn btn--outline btn--sm" data-item-sheet-delete>' +
          icon("trash-2") + tx("Delete", "刪除") + "</button>" +
      "</div>";
    afterSheetRender(els.itemBody);
    var pr = els.itemBody.querySelector("[data-preview]");
    if (pr) { preview.len = Number(pr.getAttribute("data-len")) || 0; paintPreview(pr); }
  }

  /* ── 單件預覽（5.1.7.3 F5，D475）─────────────────────────────
     照片看大圖、影片與音檔可以播放。純檢視：不改任何資料、不動任務與解開規則。
     原型沒有真的影音檔，影片用示範封面＋播放控制、音檔用播放條，按下播放只讓進度條
     照標示長度往前走（ASSUMPTIONS UIA-295）。樣式是 ds-components/media-preview.css。 */
  var preview = { timer: null, at: 0, len: 0 };
  function durSec(d) {
    var p = String(d || "").split(":").map(Number);
    if (p.some(isNaN) || !p.length) return 0;
    return p.reduce(function (acc, n) { return acc * 60 + n; }, 0);
  }
  function clock(sec) {
    sec = Math.max(0, Math.floor(sec));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), r = sec % 60;
    return (h ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (r < 10 ? "0" : "") + r;
  }
  function previewHtml(it) {
    var k = KIND[it.kind];
    var cover = it.img ? '<img src="' + esc(it.img) + '" alt="">' : '<span class="mpreview__glyph">' + icon(k.icon) + "</span>";
    if (it.kind === "image") {
      return '<div class="mpreview mpreview--image vault-item__preview" data-feat="S106">' +
        '<div class="mpreview__stage">' + cover + "</div></div>";
    }
    var play = esc(L("vault.item.preview.play"));
    var len = durSec(it.dur);
    return '<div class="mpreview mpreview--' + it.kind + ' vault-item__preview" data-feat="S106" data-preview data-len="' + len + '">' +
      (it.kind === "clip"
        ? '<div class="mpreview__stage">' + cover +
            '<button type="button" class="mpreview__bigplay" data-preview-toggle aria-label="' + play + '">' + icon("play") + "</button></div>"
        : "") +
      '<div class="mpreview__bar">' +
        '<button type="button" class="mpreview__toggle" data-preview-toggle aria-label="' + play + '">' + icon("play") + "</button>" +
        '<span class="mpreview__track"><span class="mpreview__fill"></span></span>' +
        '<span class="mpreview__time" data-preview-time>' + clock(0) + " / " + (len ? clock(len) : "—") + "</span>" +
      "</div></div>";
  }
  function paintPreview(root) {
    var pct = preview.len ? Math.min(100, preview.at / preview.len * 100) : 0;
    root.style.setProperty("--mp-progress", pct + "%");
    var t = root.querySelector("[data-preview-time]");
    if (t) t.textContent = clock(preview.at) + " / " + (preview.len ? clock(preview.len) : "—");
  }
  function setPreviewPlaying(root, on) {
    root.classList.toggle("is-playing", on);
    var label = esc(L(on ? "vault.item.preview.pause" : "vault.item.preview.play"));
    var btn = root.querySelector(".mpreview__toggle");
    if (btn) {
      btn.setAttribute("aria-label", label);
      btn.innerHTML = icon(on ? "pause" : "play");
      if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(btn);
    }
  }
  function stopPreview() {
    if (preview.timer) clearInterval(preview.timer);
    preview.timer = null;
    var root = els.itemBody && els.itemBody.querySelector("[data-preview]");
    if (root) setPreviewPlaying(root, false);
  }
  function togglePreview(root) {
    if (preview.timer) { stopPreview(); return; }
    preview.len = Number(root.getAttribute("data-len")) || 0;
    if (!preview.len) return;
    if (preview.at >= preview.len) preview.at = 0;
    setPreviewPlaying(root, true);
    preview.timer = setInterval(function () {
      preview.at += 1;
      paintPreview(root);
      if (preview.at >= preview.len) stopPreview();
    }, 1000);
  }

  /* 抽屜內容是 JS 畫的：圖示、下拉（zselect 升級）、功能標記（data-feat）都要在畫完之後補一次。 */
  function afterSheetRender(root) {
    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(root);
    if (window.ztorSelect && window.ztorSelect.mount) window.ztorSelect.mount(root);
    if (window.ztorDevState && window.ztorDevState.regate) window.ztorDevState.regate();
  }

  /* ── 抽屜裡的「任務」區（F8）───────────────────────────────
     三選一用 radio-list（互斥的資料選擇，Q17 的分工：窄欄直列）；選了行動任務才長出
     「種類」下拉與該種類的參數，選了等級任務才長出「等級」下拉。改了就生效，不設儲存鈕
     ——同名稱欄的做法，關掉抽屜就是收工。 */
  /* 數字參數 N 的欄位名稱與預設值（規格只要求正整數；範圍與上限〔產品待確認〕）。 */
  var N_FIELD = {
    shareVault: { label: { en: "Friends", zh: "朋友人數" },   dflt: 3 },
    sharePost:  { label: { en: "People", zh: "人數" },         dflt: 3 },
    invite:     { label: { en: "Friends", zh: "朋友人數" },   dflt: 3 },
    tip:        { label: { en: "Popcorn", zh: "爆米花數量" }, dflt: 100 }
  };
  function newActionTask(kind) {
    var d = V.actionDef(kind) || V.actionTasks[0];
    var t = { type: "action", kind: d.id };
    if (d.params.indexOf("n") >= 0) t.n = (N_FIELD[d.id] || {}).dflt || 1;
    if (d.params.indexOf("post") >= 0) t.target = V.taskTargets.post[0].id;
    if (d.params.indexOf("video") >= 0) t.target = V.taskTargets.video[0].id;
    if (d.params.indexOf("shop") >= 0) t.scope = "any";
    return t;
  }

  function taskSectionHtml(it) {
    var f = vault();
    var task = V.taskOf(it);   /* release2.4 下，用到不在版本內那六種行動任務的內容當成不設任務（UIA-300） */
    var type = task ? task.type : "none";
    var types = [
      ["none",   tx("No task", "不設任務"),       tx("Anyone who gets into the vault sees it.", "進得了庫就看得到。")],
      ["action", tx("Action task", "行動任務"),   tx("Fans do one thing to unlock it. Once done, it stays unlocked.", "粉絲去做一件事就解開，完成一次就永久解開。")],
      ["tier",   tx("Tier task", "等級任務"),     tx("Unlocks for fans at the tier or above, and locks again if they drop below.", "分級達到指定等級自動解開，掉級就收回。")]
    ];
    var out = '<section class="vault-task" data-item-task data-feat="S86">' +
      '<div class="vault-task__head">' +
        '<h4 class="vault-task__title" id="vault-task-title">' + tx("Task", "任務") + "</h4>" +
        '<p class="vault-task__lead">' + (V.keysOn()
          ? tx("What a fan must do, after getting into the vault, to see this item. One task per item. Keys only get fans into the vault — key holders still finish the task.",
               "粉絲進庫之後，還要做到什麼才看得到這一件；一件只設一個。鑰匙只管進庫，持鑰匙的人一樣要完成任務。")
          /* 鑰匙（S123）不在版本內：不提鑰匙。 */
          : tx("What a fan must do, after getting into the vault, to see this item. One task per item.",
               "粉絲進庫之後，還要做到什麼才看得到這一件；一件只設一個。")) + "</p>" +
      "</div>" +
      '<div class="radio-list" role="radiogroup" aria-labelledby="vault-task-title">' +
        types.map(function (o) {
          var on = o[0] === type;
          return '<button type="button" class="radio-list__item' + (on ? " radio-list__item--active" : "") + '" role="radio" aria-checked="' + on + '" data-task-type="' + o[0] + '">' +
            '<span class="radio-list__dot"></span>' +
            '<span class="radio-list__text"><span class="radio-list__title">' + o[1] + "</span>" +
            '<span class="radio-list__sub">' + o[2] + "</span></span></button>";
        }).join("") +
      "</div>";

    if (type === "action") out += actionParamsHtml(task);
    if (type === "tier") out += tierParamsHtml(f, task);
    out += reachHtml(f, it);
    return out + "</section>";
  }

  function actionParamsHtml(task) {
    var d = V.actionDef(task.kind);
    var out = '<div class="vault-task__params">' +
      '<div class="field"><label class="field__label" for="vt-kind">' + tx("Type", "種類") + "</label>" +
        '<select class="select" id="vt-kind" data-task-kind>' +
          /* release2.4（S122 不在版本內）只列追蹤創作者、加入社群、分享庫房頁面三種。 */
          V.actionTaskList().map(function (a) {
            return '<option value="' + a.id + '"' + (a.id === task.kind ? " selected" : "") +
              (V.isMvpAction(a.id) ? "" : ' data-feat="S122"') + ">" + esc(V.t(a.label)) + "</option>";
          }).join("") +
        "</select></div>";

    if (d.params.indexOf("shop") >= 0) {
      var item = task.scope === "item";
      out += '<div class="field"><span class="field__label">' + tx("Products", "商品範圍") + "</span>" +
        '<div class="segmented" role="radiogroup" aria-label="' + esc(tx("Products", "商品範圍")) + '">' +
          '<button type="button" class="segmented__btn' + (!item ? " segmented__btn--active" : "") + '" role="radio" aria-checked="' + !item + '" data-task-scope="any">' + tx("Any product", "任一商品") + "</button>" +
          '<button type="button" class="segmented__btn' + (item ? " segmented__btn--active" : "") + '" role="radio" aria-checked="' + item + '" data-task-scope="item">' + tx("A specific product", "指定商品") + "</button>" +
        "</div></div>";
      if (item) out += targetFieldHtml("vt-product", tx("Product", "商品"), V.catalogue.bought.opts, task.target, null);
    }
    if (d.params.indexOf("post") >= 0) {
      out += targetFieldHtml("vt-post", tx("Post", "貼文"), V.taskTargets.post, task.target, tx("Sample posts", "示意選項"));
    }
    if (d.params.indexOf("video") >= 0) {
      out += targetFieldHtml("vt-video", tx("Video", "影片"), V.taskTargets.video, task.target, tx("Sample videos", "示意選項"));
    }
    if (d.params.indexOf("n") >= 0) {
      var nf = N_FIELD[d.id] || { label: { en: "N", zh: "N" } };
      out += '<div class="field"><label class="field__label" for="vt-n">' + esc(V.t(nf.label)) + "</label>" +
        '<input class="input" id="vt-n" type="number" min="1" step="1" inputmode="numeric" value="' + esc(task.n || "") + '" data-task-n>' +
        '<p class="field__hint">' + tx("A whole number from 1. The allowed range is still to be confirmed.", "1 以上的整數；可填範圍與上限尚待確認。") + "</p>" +
        '<p class="field__error" data-task-n-error hidden>' + tx("Enter a whole number of 1 or more.", "請填 1 以上的整數。") + "</p></div>";
    }
    out += "</div>";
    out += statusHtml(task);
    return out;
  }

  function targetFieldHtml(id, label, list, cur, hint) {
    return '<div class="field"><label class="field__label" for="' + id + '">' + esc(label) + "</label>" +
      '<select class="select" id="' + id + '" data-task-target>' +
        list.map(function (o) {
          return '<option value="' + o.id + '"' + (o.id === cur ? " selected" : "") + ">" + esc(V.t(o.label)) + "</option>";
        }).join("") +
      "</select>" + (hint ? '<p class="field__hint">' + esc(hint) + "</p>" : "") + "</div>";
  }

  /* 判定狀態（F8 目錄表的「狀態」欄）。判定方式〔產品待確認〕的任務照樣可選（D377 決定四），
     但這裡要讓人一眼看出來：黃色徽章＋逐條列出規格寫的「缺什麼」。 */
  function statusHtml(task) {
    var ready = V.taskStatus(task) === "ready";
    var miss = V.taskMissing(task);
    return '<div class="vault-task__status vault-task__status--' + (ready ? "ready" : "pending") + '">' +
      (ready
        ? '<span class="badge badge--success">' + tx("Can be judged", "可判定") + "</span>" +
          '<p class="vault-task__status-text">' + tx("Per-fan purchase data exists — the same data as the “Bought” condition.", "有逐人購買資料，與進庫條件「購買過」同一份。") + "</p>"
        : '<span class="badge badge--warning">' + tx("How it is judged is TBC", "判定方式待確認") + "</span>" +
          '<p class="vault-task__status-text">' + tx("You can set it now. Before it goes live the spec still needs:", "現在可以先設定；正式啟用前，規格還缺：") + "</p>") +
      (miss.length
        ? (ready ? '<p class="vault-task__status-text">' + tx("Also still to be confirmed:", "另待確認：") + "</p>" : "") +
          '<ul class="vault-task__missing">' + miss.map(function (m) { return "<li>" + esc(V.t(m)) + "</li>"; }).join("") + "</ul>"
        : "") +
    "</div>";
  }

  /* 等級任務：可選等級依第一層的下限過濾（D377 決定五）。低於下限的選項停用；若這一件
     既有的任務等級已經低於下限（創作者事後改了第一層），選項保留可見並提示——那種情況
     怎麼處理〔產品待確認〕，原型不自動改它。 */
  function tierParamsHtml(f, task) {
    var floor = V.tierFloor(f);
    var floorRank = V.tierRank[floor];
    var lowest = V.tiers[V.tiers.length - 1].key;
    var under = V.tierRank[task.tier] < floorRank;
    var hint = floor === lowest
      ? (V.keysOn()
        ? tx("Some way into this vault does not ask for a tier (or fans only get in with a key), so all four tiers are available.",
             "第一層有不看分級的進庫方法（或只靠鑰匙進庫），四級都能選。")
        : tx("Some way into this vault does not ask for a tier, so all four tiers are available.",
             "第一層有不看分級的進庫方法，四級都能選。"))
      : tx("Every way into this vault asks for " + tierAtLeast(floor) + ", so only that tier or higher is available.",
           "第一層每一種進庫方法都要求" + tierAtLeast(floor) + "，所以只能選這一級或更高。");
    return '<div class="vault-task__params">' +
      '<div class="field"><label class="field__label" for="vt-tier">' + tx("Tier", "等級") + "</label>" +
        '<select class="select" id="vt-tier" data-task-tier>' +
          V.tiers.map(function (t) {
            var below = V.tierRank[t.key] < floorRank;
            return '<option value="' + t.key + '"' + (t.key === task.tier ? " selected" : "") +
              (below && t.key !== task.tier ? " disabled" : "") + ">" + esc(tierAtLeast(t.key)) + "</option>";
          }).join("") +
        "</select>" +
        '<p class="field__hint">' + esc(hint) + "</p>" +
        (under ? '<p class="field__hint field__hint--warn">' + tx(
          "This tier is now below the vault's lowest tier. How existing tier tasks are handled after the vault changes is still to be confirmed.",
          "這一級已低於第一層目前的下限；第一層改動後既有的等級任務怎麼處理，尚待確認。") + "</p>" : "") +
        '<p class="field__hint">' + esc(L(V.keysOn() ? "vault.item.tier.below" : "vault.item.tier.below.nk")) + "</p>" +
      "</div></div>";
  }

  /* 這一件的兩個數字（F3，D477；取代 D377 的單一「每件可看人數」）：目前看得到、累計解開過，
     分開呈現、不相加。算不出來就明說待確認，不編數字。不在上架中＝上架後的試算，標明尚未開放。 */
  function reachHtml(f, it) {
    var n = V.itemViewers(f, it), e = V.itemEver(f, it);
    var total = V.reachAll(f);
    var listed = V.isListed(f);
    var sub = !V.taskOf(it)
      ? tx("Same as everyone who can get into the vault.", "等於進得了庫的全部人數。")
      : n == null
        ? tx("This task has no per-fan data yet, so the count is still to be confirmed.", "這種任務還沒有逐人資料，人數尚待確認。")
        : tx("Of the " + num(total) + " fans who can get into the vault.", "進得了庫的 " + num(total) + " 位之中。");
    /* 改任務時保留下來的已解開粉絲（F8，D477）：講出來，免得創作者以為新任務沒生效。 */
    var keptN = Object.keys(it.kept || {}).length;
    if (keptN && n != null) sub += " " + L(keptN === 1 ? "vault.item.kept.one" : "vault.item.kept", { n: num(keptN) });
    function cell(label, value, pending, note) {
      return '<div class="vault-task__reach-cell">' +
        '<span class="vault-task__reach-label">' + esc(label) + "</span>" +
        '<span class="vault-task__reach-num' + (pending ? " vault-task__reach-num--pending" : "") + '">' + value + "</span>" +
        (note ? '<span class="vault-task__reach-sub">' + esc(note) + "</span>" : "") +
      "</div>";
    }
    return '<div class="vault-task__reach vault-task__reach--pair">' +
      cell(L(listed ? "vault.ov.unlock.now" : "vault.ov.unlock.now.trial"), n == null ? esc(L("vault.ov.tbc")) : num(n), n == null, sub) +
      cell(L("vault.ov.unlock.ever"), e == null ? esc(L("vault.ov.tbc")) : num(e), e == null,
        e == null ? "" : L(f.status === "draft" ? "vault.item.ever.draft" : "vault.item.ever.sub")) +
    "</div>" +
    (listed ? "" : '<p class="vault-task__trial" data-feat="S112">' + esc(L("vault.ov.trial.note")) + "</p>");
  }

  /* 大彩蛋（F5，D377）：只是標記，不影響解開。 */
  function grandRowHtml(it) {
    var on = !!it.grand;
    return '<div class="control-row vault-task__flag" data-feat="S121">' +
      "<div>" +
        '<div class="control-row__main" id="vault-grand-label">' + tx("Grand surprise", "大彩蛋") + "</div>" +
        '<div class="control-row__sub">' + tx("Just a marker. It does not change how this item unlocks.", "只是標記，不影響這一件怎麼解開。") + "</div>" +
      "</div>" +
      '<button type="button" class="switch' + (on ? " switch--on" : "") + '" role="switch" aria-checked="' + on + '" aria-labelledby="vault-grand-label" data-item-grand></button>' +
    "</div>";
  }

  /* 任務改了：只重畫任務區（名稱欄不動，打到一半的字不會不見），再重畫格子上的小標。
     focusSel ＝ 重畫後要把焦點還給哪一個控制項。 */
  function refreshTask(it, focusSel) {
    var sec = els.itemBody.querySelector("[data-item-task]");
    if (sec) {
      var wrap = document.createElement("div");
      wrap.innerHTML = taskSectionHtml(it);
      sec.replaceWith(wrap.firstChild);
      afterSheetRender(els.itemBody);
    }
    renderMain();
    if (focusSel) {
      var el = els.itemBody.querySelector(focusSel);
      /* zselect 把原生 select 視覺隱藏，焦點要給插在它前面的那顆觸發鈕。 */
      if (el && el.tagName === "SELECT" && el.previousElementSibling && el.previousElementSibling.classList.contains("zselect__trigger")) el = el.previousElementSibling;
      if (el && el.focus) el.focus();
    }
  }

  function openItem(id) {
    var it = itemById(id);
    if (!it) return;
    state.itemId = id;
    preview.at = 0;
    renderItemSheet(it);
    els.itemSheet.classList.add("is-open");
    els.itemSheet.setAttribute("aria-hidden", "false");
    var input = els.itemBody.querySelector("[data-item-name]");
    if (input) input.focus();
  }
  function closeItem() {
    stopPreview();
    /* 名字即時生效，不設「儲存」鈕：這一格只有一個可改的欄位，關掉抽屜就是收工。 */
    var it = itemById(state.itemId);
    var input = els.itemBody.querySelector("[data-item-name]");
    if (it && input && input.value.trim()) {
      var v = input.value.trim();
      it.name = { en: v, zh: v };
      renderMain(); renderRail(); renderWall();
    }
    state.itemId = null;
    els.itemSheet.classList.remove("is-open");
    els.itemSheet.setAttribute("aria-hidden", "true");
  }

  function renderRail() {
    var lz = lens();
    var html = V.vaults.map(function (v) {
      var cover = V.cover(v);
      /* 檢視器開著時，鑰匙數改成「這一級裡有幾個人打得開」，不是全站人數。
         「以一般粉絲檢視」卻顯示 653，會讓人以為那 653 個都是一般粉絲。
         打不開＝該級一個人都進不來（0），不是「不是每個人都進得來」。
         指定一位粉絲（D477）時只剩兩種答案：進得了、上鎖。 */
      var reach = lz.kind === "tier" ? V.reachInTierAll(v, lz.tier) : V.reachAll(v);
      var locked = lensLocked(v, lz);
      var trial = !V.isListed(v);
      var c = V.counts(v);
      var parts = [];
      if (c.image) parts.push(plural(c.image, "photo", "photos", "圖"));
      if (c.clip)  parts.push(plural(c.clip,  "clip",  "clips",  "片"));
      if (c.audio) parts.push(plural(c.audio, "audio", "audio",  "音"));

      var keys = locked
        ? '<span class="vault-row__keys">' + icon("lock") + esc(L("vault.st.locked")) + "</span>"
        : lz.kind === "person"
          ? '<span class="vault-row__keys">' + icon("check") + esc(L("vault.rail.in")) + "</span>"
          : '<span class="vault-row__keys' + (reach === 0 ? " vault-row__keys--none" : "") + (trial ? " vault-row__keys--trial" : "") + '"' +
              (trial ? ' title="' + esc(L("vault.rail.trial.title")) + '"' : "") + ">" +
              icon(reach === 0 ? "lock" : "key") + num(reach) +
              (trial ? '<span class="vault-row__trial">' + esc(L("vault.rail.trial")) + "</span>" : "") + "</span>";

      /* 狀態一列（F1，D477）：狀態徽章＋排程。排了上架時間的草稿／已下架看得出已排程。 */
      var sched = V.isScheduled(v)
        ? '<span class="vault-row__sched">' + icon("calendar-clock") + esc(L("vault.sched.list", { t: fmtWhen(v.listAt) })) + "</span>"
        : "";

      return '<button type="button" class="vault-row' +
          (v.id === state.vaultId ? " vault-row--active" : "") +
          (locked ? " is-locked" : "") + '" data-vault="' + v.id + '">' +
          '<span class="vault-row__cover">' +
            (cover ? '<img src="' + cover + '" alt="" loading="lazy">' : icon(v.icon)) +
          "</span>" +
          '<span class="vault-row__text">' +
            '<span class="vault-row__name">' + esc(vaultName(v)) + "</span>" +
            '<span class="vault-row__status" data-feat="S112">' + statusBadge(v) + sched + "</span>" +
            '<span class="vault-row__meta">' + (parts.join(" · ") || tx("Empty", "尚無內容")) + "</span>" +
          "</span>" +
          keys +
        "</button>";
    }).join("");

    if (els.list) els.list.innerHTML = html;
    /* 側欄標題列的右側是「這些鑰匙數是對誰算的」的說明——沒開檢視器時是
       庫房數，開了就換成那一級的母體大小，否則 17 這個數字沒有分母。 */
    if (els.count) {
      if (lz.kind === "tier") {
        var tier = V.tiers.filter(function (x) { return x.key === lz.tier; })[0];
        els.count.textContent = tierName(lz.tier) + " · " + num(tier.count);
      } else if (lz.kind === "person") {
        els.count.textContent = lz.fan.name + " · " + tierName(lz.fan.tier);
      } else {
        els.count.textContent = plural(V.vaults.length, "vault", "vaults", "座");
      }
    }
    if (els.list && window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.list);
    else if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ nameAttr: "data-lucide" });
  }

  /* ── 門條 ───────────────────────────────────────────────── */
  /* 一條條件晶片。移除鈕是每個 chip 自己的按鈕，不是列尾一個共用的垃圾桶
     ——刪掉「哪一條」必須在按下去之前就確定。座標是「第幾組:第幾條」。 */
  function ruleChip(r, gi, ri, removable) {
    var l = V.ruleLabel(r);
    var text = r.t === "tier"
      ? '<span class="vault-rule__verb">' + tx("Tier", "分級") + " ≥ </span>" + esc(tierName(r.v))
      : '<span class="vault-rule__verb">' + esc(V.t(l.verb)) + " · </span>" + esc(V.t(l.text));
    return '<span class="chip chip--static' + (removable ? " chip--removable" : "") + ' vault-rule">' +
      icon(l.icon) + text +
      (removable
        ? '<button type="button" class="chip__remove" data-rule-remove="' + gi + ":" + ri + '" ' +
          'aria-label="' + esc(tx("Remove condition", "移除條件")) + '">' + icon("x") + "</button>"
        : "") +
      "</span>";
  }

  /* 一種進得來的方法。裡面的條件要一起達成，所以兩條以上時在上面寫一句
     「這些要一起達成」——不用「且」「AND」這種符號式講法，直接說會發生什麼事。 */
  /* 2026-10-09 三分頁：每一種方法一張「方法 N」小卡（.vault-method，vault-access.css），
     頭上寫這種方法單獨有幾人符合——同一支 reachAll，只餵「只有這一組、沒有鑰匙」的庫房。
     空的方法（還沒放條件）誰都不放行，不寫人數。原本兩條以上才畫的外框由小卡取代。 */
  function methodReach(g) {
    if (!g || !(g.items || []).length) return null;
    return V.reachAll({ rules: [g], keys: [] });
  }
  function doorGroupHtml(g, gi) {
    var items = g.items || [];
    var lead = items.length >= 2
      ? '<div class="vault-door__all">' + L("vault.ac.all") + "</div>"
      : "";
    var chips = items.map(function (r, ri) { return ruleChip(r, gi, ri, true); }).join("");
    var n = methodReach(g);
    return '<div class="vault-method">' +
      '<div class="vault-method__head">' +
        '<span class="vault-method__name">' + L("vault.ac.method", { n: gi + 1 }) + "</span>" +
        (n == null ? "" : '<span class="vault-method__count' + (n ? "" : " vault-method__count--zero") + '">' +
          L(n === 1 ? "vault.ac.method.count.one" : "vault.ac.method.count", { n: num(n) }) + "</span>") +
      "</div>" +
      '<div class="vault-door__group">' + lead +
        '<div class="vault-door__chips">' + chips +
          '<button type="button" class="vault-door__add" data-rule-add="' + gi + '" ' +
            'aria-label="' + esc(L("vault.ac.add.aria")) + '">' +
            icon("plus") + L("vault.ac.add") + "</button>" +
        "</div>" +
      "</div>" +
    "</div>";
  }

  /* 白話總結。畫面上的框線與「或是」講的是結構，這一句講的是結果——一句話說完
     誰進得來，不必先看懂上面的排版。 */
  function doorSummary(f, noKey) {
    var gs = f.rules || [];
    var n = V.ruleCount(f);
    if (!n) {
      if (!V.keysOn()) return tx("No condition yet — nobody can open this vault.", "還沒有條件——目前沒有人打得開這座庫房。");
      return noKey
        ? tx("No condition and no key yet — nobody can open this vault.", "還沒有條件、也沒有鑰匙——目前沒有人打得開這座庫房。")
        : tx("No condition — only fans holding a key get in.", "沒有條件——只有持鑰匙的人進得來。");
    }
    if (gs.length > 1) {
      return tx("Meet any one of these ways in and a fan gets in.", "達成上面任一種進庫方法，粉絲就進得來。");
    }
    if (n === 1) return tx("A fan who meets this gets in.", "達成這個條件，粉絲就進得來。");
    return tx("A fan must meet all of these to get in.", "上面的條件全部達成，粉絲才進得來。");
  }

  function renderDoor() {
    var f = vault();
    var gs = f.rules;
    var stats = V.keyStats(f);
    var reach = V.reachAll(f);
    /* 「沒有路進來」＝一條條件都沒有，而且一把有效鑰匙也沒有。只看條件是
       不夠的：一座沒有條件但發過 NFC 鑰匙的庫房是進得去的，那不是紅字。
       數的是條件總數不是組數——一個空組不算「有條件」。 */
    var empty = V.ruleCount(f) === 0 && stats.live === 0;

    /* 「沒有路進來」的紅字標在讀數那一塊上，不在門條上——沒有人進得來是讀數的
       事實，門條只是它的原因。 */
    els.reach.classList.toggle("is-shut", empty);
    /* 草稿與已下架：人數照常試算，標明是上架後、尚未對粉絲開放（F1／F3，D477）。 */
    var trial = !V.isListed(f);
    if (els.reachLabel) els.reachLabel.textContent = L(trial ? "vault.ov.reach.trial" : "vault.ov.reach");
    if (els.reachTrial) els.reachTrial.hidden = !trial;

    /* 框只在「這一種方法有兩個以上條件」時才畫——一個條件就是一個條件，圈起來
       只是多一層線。「或是」則是有兩種方法就出現，因為那時真的有選擇。 */
    var multi = gs.length > 1;
    els.doorRules.innerHTML =
      gs.map(function (g, gi) { return doorGroupHtml(g, gi); })
        .join('<div class="vault-door__sep"><span>' + L("vault.ac.or") + "</span></div>") +
      '<button type="button" class="vault-door__addgroup" data-group-add>' + icon("plus") +
        L("vault.ac.addway") + "</button>";
    els.doorRules.classList.toggle("is-grouped", multi);

    /* 正式頁的總結句與「沒有條件」警示在 renderAccessTab；[data-vault-any] 只剩保存檔有。 */
    if (els.doorAny) els.doorAny.textContent = doorSummary(f, stats.live === 0);

    /* 讀數：數字用滾動的，因為它是「我剛剛改了條件」的回饋，不是一個
       靜態指標；跳一下和滾上去，讀起來是兩件事。 */
    rollTo(els.doorNum, reach);
    els.doorOf.textContent = empty
      ? tx("fans can open it", "位粉絲打得開")
      : tx("of your " + num(V.totalFans) + " fans · " + Math.round(reach / V.totalFans * 100) + "%",
           "位粉絲・佔全部 " + num(V.totalFans) + " 位的 " + Math.round(reach / V.totalFans * 100) + "%");

    /* 分級覆蓋條：段寬＝分級人數佔比，填色＝該分級被涵蓋的比例。 */
    els.doorBar.innerHTML = V.tiers.map(function (t) {
      var inTier = V.reachInTierAll(f, t.key);
      return '<span class="vault-door__seg" style="flex:' + t.count + '" ' +
        'title="' + esc(tierName(t.key) + " " + inTier + "/" + t.count) + '">' +
        '<span class="vault-door__seg-fill" data-fill="' + (t.count ? inTier / t.count : 0) + '"></span></span>';
    }).join("");
    els.doorLegend.innerHTML = V.tiers.map(function (t) {
      var inTier = V.reachInTierAll(f, t.key);
      return '<span class="vault-door__leg">' + esc(tierName(t.key)) +
        " <b>" + inTier + "/" + t.count + "</b></span>";
    }).join("");

    /* 拆解行只在真的有鑰匙時出現。條件 ＋ 鑰匙 ≠ 總數，因為有人兩邊都算，
       所以重疊必須自己寫出來，不能讓讀的人自己去減。 */
    if (stats.live > 0) {
      var sp = V.reachSplit(f);
      els.doorBreakdown.innerHTML =
        '<span>' + tx("by condition", "靠條件") + " <b>" + num(sp.byRule) + "</b></span>" +
        '<span>' + tx("by key", "靠鑰匙") + " <b>" + num(sp.byKey) + "</b></span>" +
        (sp.both ? '<span>' + tx("counted once", "重疊只算一次") + " <b>" + num(sp.both) + "</b></span>" : "");
      els.doorBreakdown.hidden = false;
    } else {
      els.doorBreakdown.hidden = true;
    }

    renderDoorKeys(f, stats);
    renderAccessTab(f);
    /* 下一幀才寫比例，否則 0 → n 沒有起點、transition 不會跑。 */
    requestAnimationFrame(function () {
      els.doorBar.querySelectorAll(".vault-door__seg-fill").forEach(function (el) {
        el.style.transform = "scaleX(" + parseFloat(el.getAttribute("data-fill")) + ")";
      });
    });

    if (window.ztorIcons && window.ztorIcons.render) { window.ztorIcons.render(els.door); window.ztorIcons.render(els.reach); }
  }

  /* 門條裡的鑰匙那一列：一把鑰匙一顆晶片，寫「已領/總數」。
     未領取的次數不進任何人數——它是產能，不是人。 */
  function renderDoorKeys(f, stats) {
    /* 正式頁 2026-10-09 起改用「存取權限」分頁的鑰匙清單（renderAccessTab），這一列晶片只剩保存檔有。 */
    if (!els.doorKeys) return;
    var live = (f.keys || []).filter(function (k) { return !k.revoked; });
    if (!live.length) {
      els.doorKeys.innerHTML = '<span class="vault-door__keychip vault-door__keychip--none">' +
        tx("None yet", "還沒發出任何鑰匙") + "</span>";
      return;
    }
    els.doorKeys.innerHTML = live.map(function (k) {
      var claimed = (k.claimed || []).length;
      return '<span class="vault-door__keychip" title="' + esc(V.t(k.label)) + '">' +
        icon(k.product ? "scan" : "gift") + esc(k.code) +
        " · " + num(claimed) + "/" + num(k.uses) + "</span>";
    }).join("") +
    (stats.left > 0
      ? '<span class="vault-door__keychip vault-door__keychip--none">' +
        tx(num(stats.left) + " uses unclaimed", "尚有 " + num(stats.left) + " 次未領取") + "</span>"
      : "");
    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.doorKeys);
  }

  /* ── 存取權限分頁（2026-10-09）──────────────────────────────
     旅程的第一步是「現在多少人進得來」，所以頂端是一條即時人數條；條件開放的
     「沒有條件」與「有條件但 0 人符合」分開講（規格 F2 其他狀態要求分得出來）；
     直接開放下面是已發鑰匙清單。renderDoor 每次重畫都會叫這一支，所以條件、
     鑰匙一改，這裡的數字跟著變。保存檔沒有這些節點，整支直接返回。 */
  function renderAccessTab(f) {
    if (!els.reachline) return;
    var listed = V.isListed(f);
    /* 分享連結（F9，D475）：每座庫房一條，跟著選中的庫房換。網址格式是示範（UIA-295）。
       草稿與已下架不能分享（F9 其他狀態，D477 推導 2）：連結列停用，說明句換成原因。 */
    if (els.shareLink && window.linkField) window.linkField.setValue(els.shareLink, "https://ztor.com/v/" + f.id);
    if (els.shareLink) {
      els.shareLink.classList.toggle("linkf--disabled", !listed);
      var copyBtn = els.shareLink.querySelector("[data-linkf-copy]");
      if (copyBtn) copyBtn.disabled = !listed;
      if (els.linkHint) {
        els.linkHint.hidden = !listed;
        /* 鑰匙（S123）不在版本內：說明句不提「持有鑰匙」。data-i18n 一起換，語言切換時才不會被蓋回去。 */
        var hintKey = V.keysOn() ? "vault.ac.link.hint" : "vault.ac.link.hint.nk";
        els.linkHint.setAttribute("data-i18n", hintKey);
        els.linkHint.textContent = L(hintKey);
      }
      if (els.linkOff) {
        els.linkOff.hidden = listed;
        els.linkOff.textContent = listed ? "" : L(f.status === "draft" ? "vault.ac.link.off.draft" : "vault.ac.link.off.unlisted");
      }
    }
    /* 上架前不能領鑰匙（F4，D477 第二輪第 4 題）：仍可先發，所以入口照留，只加一句。 */
    if (els.keysOff) els.keysOff.hidden = listed;
    var sp = V.reachSplit(f);
    /* 鑰匙（S123）不在版本內：只講總數，不拆「靠條件／靠鑰匙」（.nk 鍵）。 */
    var nk = V.keysOn() ? "" : ".nk";
    els.reachline.innerHTML = L(listed
      ? (sp.total === 1 ? "vault.ac.reachline.one" + nk : "vault.ac.reachline" + nk)
      : (sp.total === 1 ? "vault.ac.reachline.trial.one" + nk : "vault.ac.reachline.trial" + nk), {
      total: num(sp.total), rule: num(sp.byRule), key: num(sp.byKey),
      overlap: sp.both ? L("vault.ac.reachline.both", { n: num(sp.both) }) : L("vault.ac.reachline.none")
    });

    var nRules = V.ruleCount(f);
    var live = V.keyStats(f).live;
    if (!nRules) {
      els.noRules.hidden = false;
      els.noRulesTitle.textContent = L(live ? "vault.ac.norules.keys" : "vault.ac.norules");
      els.rulesSum.hidden = true;
      els.rulesSum.textContent = "";
    } else {
      els.noRules.hidden = true;
      els.rulesSum.hidden = false;
      els.rulesSum.textContent = L(sp.byRule ? "vault.ac.sum.any" : "vault.ac.sum.zero");
    }

    var keys = (f.keys || []).slice().reverse();
    if (!keys.length) {
      els.keylist.innerHTML = '<p class="vault-access__empty">' + L("vault.ac.keys.empty") + "</p>";
      return;
    }
    els.keylist.innerHTML =
      '<div class="vault-keyrow vault-keyrow--head"><span>' + L("vault.ac.keys.col.key") + "</span><span>" +
        L("vault.ac.keys.col.uses") + "</span><span>" + L("vault.ac.keys.col.status") + "</span><span></span></div>" +
      keys.map(function (k) {
        var claimed = (k.claimed || []).length;
        return '<div class="vault-keyrow' + (k.revoked ? " vault-keyrow--revoked" : "") + '">' +
          '<span class="vault-keyrow__main"><span class="vault-keyrow__code">' + esc(k.code) + "</span>" +
            '<span class="vault-keyrow__label">' + esc(V.t(k.label)) + "</span></span>" +
          '<span class="vault-keyrow__uses">' + num(claimed) + " / " + num(k.uses) + "</span>" +
          (k.revoked
            ? '<span class="ztor-badge">' + L("vault.ac.keys.revoked") + "</span><span></span>"
            : '<span class="ztor-badge ztor-badge--success">' + L("vault.ac.keys.active") + "</span>" +
              '<button type="button" class="btn btn--soft btn--destructive btn--sm" data-vkey-revoke="' + esc(k.id) + '">' + L("vault.ac.keys.revoke") + "</button>") +
        "</div>";
      }).join("");
  }

  /* ── 總覽分頁（2026-10-09）──────────────────────────────────
     只讀：每件幾人看得到、鑰匙用了多少、內容摘要，以及檢視身分開著時的那一行。
     renderMain 每次重畫都會叫這一支（上傳、改名、刪除、改任務、大彩蛋、條件與鑰匙
     改動、檢視身分切換都會走到 renderMain）。數字全部向 vault-store 現算。 */
  var KIND_ICON = { image: "image", clip: "film", audio: "music" };
  function ovTag(mod, iconName, text) {
    return tagHtml("plain", mod, iconName, text, null, null);
  }
  function renderOverviewTab(f) {
    if (!els.ovItems) return;
    var lz = lens();
    var listed = V.isListed(f);

    /* 整座庫房的解開紀錄（F3，D477）：累計解開過、目前看得到，兩個數字分開、不相加。 */
    if (els.ovUnlock) {
      var u = V.vaultUnlocks(f);
      function ustat(label, value, zero) {
        return '<div class="stat"><div class="stat__label">' + esc(label) + "</div>" +
          '<div class="stat__value' + (zero ? " stat__value--zero" : "") + '">' + value + "</div></div>";
      }
      els.ovUnlock.innerHTML =
        ustat(L("vault.ov.unlock.ever"), num(u.ever), !u.ever) +
        ustat(L(listed ? "vault.ov.unlock.now" : "vault.ov.unlock.now.trial"), num(u.now), !u.now);
      var notes = [];
      if (f.status === "draft") notes.push(L("vault.ov.unlock.draft"));
      else if (!listed) notes.push(L("vault.ov.unlock.unlisted"));
      if (u.pending) notes.push(L(u.pending === 1 ? "vault.ov.unlock.pending.one" : "vault.ov.unlock.pending", { n: num(u.pending) }));
      if (els.ovUnlockNote) {
        els.ovUnlockNote.hidden = !notes.length;
        els.ovUnlockNote.textContent = notes.join(" ");
      }
    }

    /* 每件內容的兩個數字（F3）。量條＝目前看得到／進得了庫的人；下一行＝累計解開過。
       沒有逐人資料的行動任務寫「待確認」、空條，不編數字。 */
    if (els.ovItemsTrial) els.ovItemsTrial.hidden = listed;
    if (!f.items.length) {
      els.ovItems.innerHTML = '<p class="vault-ov__empty">' + L("vault.ov.items.empty") + "</p>";
    } else {
      var total = V.reachAll(f);
      els.ovItems.innerHTML = f.items.map(function (it) {
        var thumb = (it.img && it.kind !== "audio")
          ? '<img class="meter-list__thumb" src="' + esc(it.img) + '" alt="" loading="lazy">'
          : '<span class="meter-list__thumb vault-ov__kindicon">' + icon(KIND_ICON[it.kind] || "file") + "</span>";
        var tags = [];
        var info = taskInfo(V.taskOf(it));
        tags.push(info ? ovTag(null, info.icon, info.full) : ovTag(null, "circle", L("vault.ov.task.none")));
        if (it.grand && V.featOn("S121")) tags.push(ovTag("grand", "sparkles", L("vault.ov.task.grand")));
        if (lz.kind !== "none") tags.push(lensTag("plain", f, it, lz));
        var n = V.itemViewers(f, it), e = V.itemEver(f, it);
        var ever = '<span class="vault-ov__ever" data-feat="S114">' +
          esc(L("vault.ov.items.ever", { n: e == null ? L("vault.ov.tbc") : num(e) })) + "</span>";
        var meter = n == null
          ? '<span class="meter-list__num vault-ov__pending">' + L("vault.ov.tbc") + '</span><div class="stock-bar"></div>' + ever
          : '<span class="meter-list__num"><b>' + num(n) + "</b> / " + num(total) + "</span>" +
            '<div class="stock-bar"><span class="stock-bar__fill" style="width:' + (total ? Math.round(n / total * 100) : 0) + '%"></span></div>' + ever;
        return '<div class="meter-list__row">' +
          '<span class="meter-list__thumbs">' + thumb + "</span>" +
          '<div class="meter-list__name meter-list__name--stack vault-ov__itemname">' +
            "<span>" + esc(V.t(it.name)) + "</span>" +
            '<span class="vault-ov__tags">' + tags.join("") + "</span>" +
          "</div>" +
          '<div class="meter-list__meter">' + meter + "</div>" +
        "</div>";
      }).join("");
    }

    /* 鑰匙使用情況（F4 鑰匙統計）：發出（有效的把數）／被領走（已領／總次數）／已撤銷。 */
    var ks = V.keyStats(f);
    var revoked = (f.keys || []).filter(function (k) { return k.revoked; }).length;
    function stat(label, value, of, zero) {
      return '<div><div class="stat__label">' + label + "</div>" +
        '<div class="stat__value' + (zero ? " stat__value--zero" : "") + '">' + value +
        (of ? ' <span class="stat__of">' + of + "</span>" : "") + "</div></div>";
    }
    function unit(n) { return L(n === 1 ? "vault.ov.keys.unit.one" : "vault.ov.keys.unit"); }
    els.ovKeys.innerHTML =
      stat(L("vault.ov.keys.issued"), num(ks.live), unit(ks.live), !ks.live) +
      stat(L("vault.ov.keys.claimed"), num(ks.claimed), ks.issued === 1 ? L("vault.ov.keys.of.one") : L("vault.ov.keys.of", { n: num(ks.issued) }), !ks.claimed) +
      stat(L("vault.ov.keys.revoked"), num(revoked), unit(revoked), !revoked);

    /* 內容摘要：類型與任務兩組，0 的那一列退墨。 */
    function kv(label, n) {
      return '<div class="vault-ov__kvrow' + (n ? "" : " vault-ov__kvrow--zero") + '"><span>' + label + "</span><b>" + num(n) + "</b></div>";
    }
    var c = V.counts(f);
    els.ovKinds.innerHTML =
      kv(L("vault.ov.kind.image"), c.image || 0) +
      kv(L("vault.ov.kind.clip"), c.clip || 0) +
      kv(L("vault.ov.kind.audio"), c.audio || 0);
    var none = 0, act = 0, tierN = 0, grand = 0;
    f.items.forEach(function (it) {
      var tk = V.taskOf(it);
      if (!tk) none++; else if (tk.type === "tier") tierN++; else act++;
      if (it.grand) grand++;
    });
    els.ovTasks.innerHTML =
      kv(L("vault.ov.task.none"), none) +
      kv(L("vault.ov.task.action"), act) +
      kv(L("vault.ov.task.tier"), tierN) +
      /* 大彩蛋（S121）不在版本內：摘要不列這一行。 */
      (V.featOn("S121") ? kv(L("vault.ov.task.grand"), grand) : "");
  }

  /* ── 分頁（2026-10-09）──────────────────────────────────────
     底線式分頁（tabs.css，Q38 連 .list-toolbar 殼）。網址 hash 可直達、上一頁／
     手改 hash 也跟著切（hashchange）；點分頁用 replaceState，不在歷史裡疊一堆紀錄。 */
  var TABS = ["overview", "content", "access"];
  function activateTab(name, focus) {
    if (!els.tablist || TABS.indexOf(name) < 0) return;
    els.tabs.forEach(function (t) {
      var on = t.getAttribute("data-vault-tab") === name;
      t.classList.toggle("tabs__item--active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.setAttribute("tabindex", on ? "0" : "-1");
      if (on && focus) t.focus();
    });
    els.panels.forEach(function (p) {
      p.classList.toggle("tab-panel--active", p.getAttribute("data-vault-panel") === name);
    });
    if ((location.hash || "").slice(1) !== name) {
      try { history.replaceState(null, "", "#" + name); } catch (_) {}
    }
  }
  function wireTabs() {
    if (!els.tablist) return;
    els.tablist.addEventListener("click", function (e) {
      var b = e.target.closest("[data-vault-tab]");
      if (b) activateTab(b.getAttribute("data-vault-tab"));
    });
    /* role="tablist" 承諾左右鍵切換。 */
    els.tablist.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var sel = els.tablist.querySelector('[aria-selected="true"]');
      var cur = TABS.indexOf(sel ? sel.getAttribute("data-vault-tab") : "overview");
      var next = (cur + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length;
      e.preventDefault();
      activateTab(TABS[next], true);
    });
    window.addEventListener("hashchange", function () { activateTab((location.hash || "").slice(1)); });
    var start = (location.hash || "").slice(1);
    if (TABS.indexOf(start) >= 0) activateTab(start);
  }

  function rollTo(el, target) {
    var from = lastReach == null ? target : lastReach;
    lastReach = target;
    if (reduced() || from === target) { el.textContent = num(target); return; }
    var t0 = performance.now(), dur = 420;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = num(Math.round(from + (target - from) * e));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* 2026-10-09 撤除（墓碑）：`tileHtml()`——照片／影片的格子（.vault-tile）。三分頁版面
     （使用者確認的示範頁）把三組內容都改成同一種列表，它沒有呼叫端了。.vault-tile 的
     CSS 仍在 media-vault.css（就地改名／刪除確認的 .vault-tile__rename／__confirm 列表
     也在用；整支格子樣式是否退場待元件巡檢）。

     一件內容一列（照片、影片、音檔三組都是這一種）：左欄 32px，照片與影片放縮圖
     （影片在影像上疊播放圖示；剛上傳、還沒有影格的影片放類型圖示，不塞空的圖片標籤），
     音檔放播放鈕；中間名稱、大小 · 日期、小標（任務與幾人看得到）；右欄時長。 */
  function trackLeadHtml(it) {
    var k = KIND[it.kind];
    if (it.kind === "audio") {
      return '<button type="button" class="vault-track__play" aria-label="' + esc(tx("Play", "播放")) + '">' + icon("play") + "</button>";
    }
    if (it.img) {
      return '<span class="vault-track__thumb"><img src="' + esc(it.img) + '" alt="" loading="lazy">' +
        (it.kind === "clip" ? '<span class="vault-track__thumb-play">' + icon("play") + "</span>" : "") + "</span>";
    }
    return '<span class="vault-track__thumb">' + icon(k.icon) + "</span>";
  }
  function trackHtml(it) {
    var meta = [it.size, it.added].filter(Boolean).join(" · ");
    var tags = itemTags(it, "plain");
    /* 檢視身分下：整座上鎖、或這一件需要條件（等級不夠）的那一列降一階。 */
    var lz = lens(), f = vault();
    var low = lz.kind !== "none" && (lensLocked(f, lz) || lensItem(f, it, lz).st === "condition");
    return '<div class="vault-track' + (low ? " is-locked" : "") + '" data-item="' + it.id + '">' +
      trackLeadHtml(it) +
      '<span class="vault-track__text">' +
        '<span class="vault-track__name">' + esc(V.t(it.name)) + "</span>" +
        (meta ? '<span class="vault-track__meta">' + esc(meta) + "</span>" : "") +
        '<span class="vault-track__badges">' + tags.start + tags.end + "</span>" +
      "</span>" +
      (it.dur && it.kind !== "image" ? '<span class="vault-track__dur">' + esc(it.dur) + "</span>" : "<span></span>") +
      '<span class="vault-track__actions">' +
        '<button type="button" class="vault-track__act" aria-label="' + esc(tx("Rename", "重新命名")) + '" data-item-rename="' + it.id + '">' + icon("pencil") + "</button>" +
        '<button type="button" class="vault-track__act vault-track__act--danger" aria-label="' + esc(tx("Delete", "刪除")) + '" data-item-delete="' + it.id + '">' + icon("trash-2") + "</button>" +
      "</span>" +
    "</div>";
  }

  /* 只長出有東西的分組，順序固定（照片 → 影片 → 音檔）。空的那一種整個不出現。
     三組都是同一種列表（2026-10-09）。 */
  function groupHtml(items) {
    return GROUPS.map(function (g) {
      var list = items.filter(function (i) { return i.kind === g.kind; });
      if (!list.length) return "";
      return '<div class="vault-group">' +
        '<div class="vault-group__head">' +
          '<span class="vault-group__icon">' + icon(g.icon) + "</span>" +
          '<span class="vault-group__title">' + tx(g.title.en, g.title.zh) + "</span>" +
          '<span class="vault-group__count">' + list.length + "</span>" +
        "</div>" +
        '<div class="vault-tracks">' + list.map(trackHtml).join("") + "</div>" +
      "</div>";
    }).join("");
  }

  /* 空庫房的唯一畫面。上傳格本身就是最誠實的空狀態——這一區要的就是「把東西放
     進來」，所以不另外畫一張空狀態卡再擺一個上傳格，讓同一個方框把話講完：
     它是說明，也是可以點、可以拖的目標。三種媒體會各自歸位那句教學在這裡講一次，
     講完之後分區自己會出現，不需要再重複。 */
  /* 上傳入口。空的與有內容都是同一塊方框（2026-07-31 使用者裁示：不要縮成標題列
     上的小按鈕），只換標題——空的時候先講「這裡還沒有東西」，有內容之後它就只是
     「再放一些進來」。方框比按鈕大得多，但它同時是拖放的目標，把目標畫小等於把
     最省事的那條路藏起來。

     收哪三種用圖示講：三個圖示配三個名字，一眼數得出來是三種、也看得出各自長什麼
     樣，比一句話把三種念過一遍好讀；剩下的句子只交代怎麼放進來。 */
  function uploadHtml(isEmpty) {
    var kinds = GROUPS.map(function (g) {
      return '<span class="vault-empty__kind">' + icon(g.icon) + tx(g.title.en, g.title.zh) + "</span>";
    }).join("");
    return '<div class="vault-empty upload-tile' + (isEmpty ? "" : " vault-empty--filled") +
        '" data-vault-upload tabindex="0" role="button" ' +
        'aria-label="' + esc(tx("Add media", "新增內容")) + '">' +
        '<span class="upload-tile__icon">' + icon("upload") + "</span>" +
        '<span class="upload-tile__title">' +
          (isEmpty ? tx("This vault is still empty", "這座庫房還是空的") : tx("Add media", "新增內容")) +
        "</span>" +
        '<span class="vault-empty__kinds">' + kinds + "</span>" +
        '<span class="upload-tile__hint">' +
          tx("Drop files here or click to pick — each kind lands in its own section.",
             "拖進來或點一下選檔——每一種會各自分到自己的分區。") +
        "</span>" +
      "</div>";
  }

  /* ── 主欄標頭與內容格 ───────────────────────────────────── */
  /* ── 庫房狀態與可用操作（F10，D477）────────────────────────────
     主要動作依狀態換，比照商品細節頁頁首（下架＝outline＋eye-off、上架＝primary、刪除＝紅框）：
       草稿：發布、刪除｜排程中：取消排程、刪除｜上架中：下架（刪除鈕留著，按了說明要先下架）
       已下架：重新上架、刪除。上架中能不能改下架時間〔產品待確認〕，所以這裡不給改。 */
  function renderStatus(f) {
    if (!els.status) return;
    var line = statusBadge(f);
    var sched = schedText(f);
    if (sched) line += '<span class="vault-head__sched">' + icon("calendar-clock") + esc(sched) + "</span>";
    var note = f.status === "draft" ? L("vault.head.draft") : f.status === "unlisted" ? L("vault.head.unlisted") : "";
    if (note) line += '<span class="vault-head__statusnote">' + esc(note) + "</span>";
    els.status.innerHTML = line;

    if (!els.actions) return;
    var btns = [];
    function b(cls, act, ic, key) {
      return '<button type="button" class="btn ' + cls + ' btn--sm" data-vault-act="' + act + '">' + icon(ic) + "<span>" + esc(L(key)) + "</span></button>";
    }
    if (V.isScheduled(f)) btns.push(b("btn--outline", "cancel", "x", "vault.act.cancel"));
    else if (f.status === "draft") btns.push(b("btn--primary", "publish", "send", "vault.act.publish"));
    else if (f.status === "unlisted") btns.push(b("btn--primary", "relist", "eye", "vault.act.relist"));
    else btns.push(b("btn--outline", "unlist", "eye-off", "vault.act.unlist"));
    btns.push(b("btn--destructive", "delete", "trash-2", "vault.act.delete"));
    els.actions.innerHTML = btns.join("");
  }

  /* 帳號下沒有任何庫房（頁面狀態「無庫房」）：主欄退位，只留建立的引導。 */
  function renderNone() {
    var none = !V.vaults.length;
    if (els.none) els.none.hidden = !none;
    els.main.hidden = none;
    return none;
  }

  function renderMain() {
    if (renderNone()) return;
    var f = vault();
    els.title.textContent = vaultName(f);
    els.note.textContent = f.custom ? tx("New vault — set who gets in, then add media.", "新庫房——先決定誰進得來，再放內容。") : V.t(f.note);
    renderStatus(f);

    var c = V.counts(f);
    var bits = [];
    if (c.image) bits.push(plural(c.image, "photo", "photos", "張圖片"));
    if (c.clip)  bits.push(plural(c.clip,  "clip",  "clips",  "段影片"));
    if (c.audio) bits.push(plural(c.audio, "audio file", "audio files", "個音檔"));
    /* 空的時候標題列右邊不報數——「0 張圖片」是廢話。上傳入口一律是下面那塊方框，
       標題列上不再放第二顆新增鈕（2026-07-31 使用者裁示）。拖放整區都吃，綁在
       [data-vault-grid] 容器上，跟長什麼樣子無關。

       原型沒有後端，檔案留在瀏覽器記憶體（createObjectURL），重整就沒了——這件事
       寫在頁尾的原型聲明裡，不假裝已經存到雲端。 */
    var empty = !f.items.length;
    els.gridMeta.textContent = bits.join(" · ");
    els.gridMeta.hidden = empty;

    els.grid.innerHTML = uploadHtml(empty) + (empty ? "" : groupHtml(f.items));
    if (els.tabCount) els.tabCount.textContent = empty ? "" : num(f.items.length);
    renderOverviewTab(f);

    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.main);
    /* 格子上的任務小標掛著 data-feat="S86"，是畫完才出現的節點，要再跑一次版本閘。 */
    if (window.ztorDevState && window.ztorDevState.regate) window.ztorDevState.regate();
  }

  /* ── 上鎖狀態（F2 可見性，D477）─────────────────────────────────
     上架中的庫房對所有粉絲可見；進不了庫的粉絲看到「上鎖」，以及要符合哪一種進庫方法
     才進得來。2026-10-23 起不再把整個分頁打模糊蓋上遮罩：上鎖卡排在分頁內容最上面，
     下面的內容照常看得到（每件小標寫「上鎖」），創作者一眼看得到「粉絲那一側缺了什麼」。

     只在檢視身分開著時發生。創作者以自己的身分看，任何庫房都打得開。 */
  function ruleChipsRO(g) {
    return (g.items || []).map(function (r) {
      var l = V.ruleLabel(r);
      var text = r.t === "tier"
        ? '<span class="vault-gate__rule-verb">' + tx("Tier", "分級") + " ≥ </span>" + esc(tierName(r.v))
        : '<span class="vault-gate__rule-verb">' + esc(V.t(l.verb)) + " · </span>" + esc(V.t(l.text));
      return '<span class="chip chip--static">' + icon(l.icon) + text + "</span>";
    }).join('<span class="vault-gate__join">＋</span>');
  }
  function renderGate() {
    var f = vault();
    var lz = lens();
    var locked = lz.kind !== "none" && lensLocked(f, lz);

    els.body.classList.toggle("is-gated", locked);
    els.gate.hidden = !locked;
    renderViewAs(f, lz, locked);
    if (!locked) { els.gate.innerHTML = ""; return; }

    var who = lensName(lz);
    var liveKeys = V.keyStats(f).live;   /* 鑰匙（S123）不在版本內時是 0 */

    /* 進庫方法在這裡是唯讀的：粉絲看得到門上寫什麼，但門不是他能改的。一種方法一行
       （「方法 N」＋條件用「＋」串起來），行與行之間寫「或是」。 */
    var gs = (f.rules || []).filter(function (g) { return (g.items || []).length; });
    var rows = gs.map(function (g) {
      var gi = f.rules.indexOf(g);
      return '<div class="vault-gate__way"><span class="vault-gate__wayname">' + esc(L("vault.ac.method", { n: gi + 1 })) + "</span>" +
        '<span class="vault-gate__group">' + ruleChipsRO(g) + "</span></div>";
    }).join('<span class="vault-gate__join vault-gate__join--or">' + esc(L("vault.ac.or")) + "</span>");

    var foot = !gs.length
      ? L(liveKeys ? "vault.gate.nokey" : V.keysOn() ? "vault.gate.none" : "vault.gate.none.nk")
      : liveKeys ? L("vault.gate.keyline") : "";
    var sub = lz.kind === "tier"
      ? L("vault.gate.sub.tier", { tier: who })
      : L("vault.gate.sub.person", { who: who, tier: tierName(lz.fan.tier) });
    var trial = V.isListed(f) ? "" : L(f.status === "draft" ? "vault.vas.trial.draft" : "vault.vas.trial.unlisted");

    els.gate.innerHTML =
      '<div class="vault-gate__panel">' +
        '<div class="vault-gate__head">' +
          '<span class="vault-gate__icon">' + icon("lock") + "</span>" +
          '<div class="vault-gate__titles">' +
            '<h3 class="vault-gate__title">' + esc(L("vault.gate.title")) + "</h3>" +
            '<p class="vault-gate__sub">' + esc(sub) + "</p>" +
          "</div>" +
        "</div>" +
        (gs.length
          ? '<span class="vault-gate__label">' + esc(L("vault.gate.label")) + "</span>" +
            '<div class="vault-gate__rules">' + rows + "</div>"
          : "") +
        (foot ? '<p class="vault-gate__foot">' + esc(foot) + "</p>" : "") +
        (trial ? '<p class="vault-gate__foot">' + esc(trial) + "</p>" : "") +
      "</div>";

    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.gate);
  }

  /* 檢視身分那一列（F6，D477）：分頁內容最上面一條 Alert row。
       分級：這一級裡有幾人打得開（原本在總覽讀數卡底下的那一行，搬上來對三個分頁都有效）
       一位粉絲且進得了：他靠哪種方法或哪把鑰匙進來（可能不只一種）
       草稿／已下架：多一句「粉絲看不到；以下是上架後的樣子」
     上鎖時這一列讓位給上鎖卡（上鎖卡自己講）。 */
  function renderViewAs(f, lz, locked) {
    if (!els.viewAs) return;
    if (lz.kind === "none" && state.viewer !== "person") { els.viewAs.hidden = true; return; }
    if (locked) { els.viewAs.hidden = true; return; }
    var title, desc = [];
    if (state.viewer === "person" && !state.person) {
      title = L("vault.person.pick");
    } else if (lz.kind === "tier") {
      var tier = V.tiers.filter(function (x) { return x.key === lz.tier; })[0];
      title = L("vault.ov.viewer", { tier: esc(tierName(lz.tier)), n: num(V.reachInTierAll(f, lz.tier)), total: num(tier ? tier.count : 0) });
    } else {
      var w = V.fanWays(f, lz.fan.idx);
      title = L("vault.vas.in", { who: esc(lz.fan.name) });
      var by = w.methods.map(function (gi) {
        return '<span class="vault-viewas__way">' + esc(L("vault.ac.method", { n: gi + 1 })) + ruleChipsRO(f.rules[gi]) + "</span>";
      }).concat(w.keys.map(function (k) {
        return '<span class="vault-viewas__way">' + icon("key") + esc(L("vault.vas.key", { code: k.code })) + "</span>";
      }));
      desc.push('<span class="vault-viewas__by">' + esc(L("vault.vas.by")) + "</span>" + by.join(""));
    }
    if (!V.isListed(f) && !(state.viewer === "person" && !state.person)) {
      desc.push(esc(L(f.status === "draft" ? "vault.vas.trial.draft" : "vault.vas.trial.unlisted")));
    }
    els.viewAsTitle.innerHTML = title;
    els.viewAsDesc.innerHTML = desc.map(function (d) { return '<span class="vault-viewas__line">' + d + "</span>"; }).join("");
    els.viewAsDesc.hidden = !desc.length;
    els.viewAs.hidden = false;
    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.viewAs);
  }

  /* ── 檢視器那一列 ───────────────────────────────────────────
     檢視中的狀態不另外寫成一句話（2026-07-31 使用者裁示撤掉）：側欄逐列標「打不開」、
     主欄蓋遮罩、下拉自己轉橘，畫面已經把狀態說完了。這裡只開關下拉的上色與離開鈕。 */
  function renderLens() {
    var on = !!state.viewer;
    els.viewerWrap.classList.toggle("is-on", on);
    els.lensReset.hidden = !on;
    /* 指定一位粉絲（F6，D477）：選了這一項才長出搜尋欄；選定的人名留在欄裡，可以再搜換人。 */
    if (els.person) {
      els.person.hidden = state.viewer !== "person";
      if (state.viewer !== "person") closePersonResults();
    }
  }

  /* ── 指定一位粉絲的搜尋（owner-lookup 的版型：輸入框＋下拉候選）────────────
     名單是示範資料（粉絲列表那九位，UIA-298）；比對名稱與 email，選了就整頁換成他的角度。 */
  function closePersonResults() {
    if (!els.personResults) return;
    els.personResults.hidden = true;
    els.personResults.innerHTML = "";
    if (els.personInput) els.personInput.setAttribute("aria-expanded", "false");
  }
  function renderPersonResults() {
    var q = els.personInput.value.trim().toLowerCase();
    var list = V.fans.filter(function (d) {
      return !q || d.name.toLowerCase().indexOf(q) >= 0 || d.handle.toLowerCase().indexOf(q) >= 0;
    });
    els.personResults.innerHTML = list.length
      ? list.map(function (d) {
          var on = state.person && state.person.id === d.id;
          return '<button type="button" class="owner-lookup__result" role="option" aria-selected="' + !!on + '" data-person="' + d.id + '">' +
            '<span class="owner-lookup__avatar">' + esc(d.name.slice(0, 1)) + "</span>" +
            '<span class="owner-lookup__copy"><span class="owner-lookup__name">' + esc(d.name) + "</span>" +
            '<span class="owner-lookup__meta">' + esc(tierName(d.tier)) + " · " + esc(d.handle) + "</span></span></button>";
        }).join("")
      : '<div class="owner-lookup__result owner-lookup__result--empty" role="status">' + esc(L("vault.person.empty")) + "</div>";
    els.personResults.hidden = false;
    els.personInput.setAttribute("aria-expanded", "true");
  }
  function pickPerson(id) {
    state.person = V.fanById(id);
    if (els.personInput && state.person) els.personInput.value = state.person.name;
    closePersonResults();
    lastReach = null;
    renderLens(); renderRail(); renderGate(); renderMain();
  }

  /* 2026-09-01 撤除（墓碑）：`bindStuckWatch()`——它負責在「誰進得來」吸頂時掛上
     `is-stuck`，好讓 CSS 補上下兩道縫。使用者裁示那張卡不吸頂了（釘住會蓋掉下一張卡
     的標題），CSS 的 sticky 與補縫虛擬元素同一輪退場，這支觀察器因此沒有對象。 */

  function render() {
    renderLens(); renderRail(); renderWall();
    if (renderNone()) return;
    renderDoor(); renderMain(); renderGate();
  }

  /* ── 發布／重新上架（F10，D477）──────────────────────────────────
     中央彈窗（Q27：編輯與新增用 .payout-modal）。版面沿用建立商品的上架區：
     並排兩張卡選「立刻上架／定時上架」→ 線框盒（上架日期與時間、分隔線、定時下架開關＋下架日期與時間）。
     發布前檢查放在最上面：沒有內容＝擋（確認鈕停用），沒有路進來＝提醒、可發布。 */
  var pub = { mode: "now", unlistOn: false, restore: null, plan: null };
  /* D483（2026-10-27，比照電子商店 D481）：重新上架時，下架時保存、還沒到的下架時間放在對話框最上面問
     「恢復原本的排程／不恢復」（partials/relist-restore.js 的 blockHTML＋bindChoice，sched-restore.css）。
     放在同一個對話框而不是先跳一層確認：媒體庫只有下架時間一個能恢復，選了就直接反映在下面的定時下架開關與欄位，
     創作者看得到恢復的結果、也還能再改。沒選之前確認鈕不可按（同 D481「一定要選一個」）。
     媒體庫沒有 ListingState：可恢復的時間由 VaultStore.restorableTimes 算，這裡自己組 plan 物件。 */
  function restorePlan(f) {
    var items = V.restorableTimes ? V.restorableTimes(f) : [];
    return items.length ? { groups: [{ entity: f, name: vaultName(f), items: items.map(function (it) { return { key: it.key, at: it.at, end: null, reason: null }; }) }], any: true } : null;
  }
  /* 兩個選項的說明改用媒體庫的文案（電子商店那句講的是開賣）。 */
  function restoreT(k) {
    var m = { "rr.restore.sub": "vault.rr.restore.sub", "rr.keep.sub": "vault.rr.keep.sub" };
    return m[k] ? L(m[k]) : null;
  }
  function paintRestore(f) {
    if (!els.pubRestore) return;
    pub.plan = window.ZtorRelistRestore ? restorePlan(f) : null;
    pub.restore = null;
    els.pubRestore.hidden = !pub.plan;
    els.pubRestore.innerHTML = pub.plan ? window.ZtorRelistRestore.blockHTML(pub.plan, { T: restoreT }) : "";
    if (!pub.plan) return;
    window.ZtorRelistRestore.bindChoice(els.pubRestore, function (restore) {
      pub.restore = restore;
      var at = pub.plan.groups[0].items[0].at;
      pub.unlistOn = restore;
      els.pubUnlistTime.value = restore ? at : "";
      paintPublish();
    });
  }
  function openPublish() {
    if (!els.pub) return;
    var f = vault();
    pub.mode = "now"; pub.unlistOn = false;
    els.pubTitle.textContent = L(f.status === "unlisted" ? "vault.pub.title.relist" : "vault.pub.title", { n: vaultName(f) });
    els.pubListTime.value = ""; els.pubUnlistTime.value = "";
    paintRestore(f);
    paintPublish();
    els.pub.hidden = false;
    document.body.classList.add("is-modal-open");
    lastFocus = document.activeElement;
    var first = els.pub.querySelector("[data-pub-mode].segmented__btn--active");
    /* 排程（S125）不在版本內時上架方式整塊收起，焦點改給確認鈕。 */
    if (first && first.offsetParent) first.focus();
    else if (els.pubOk) els.pubOk.focus();
  }
  function closePublish() {
    if (!els.pub || els.pub.hidden) return;
    els.pub.hidden = true;
    document.body.classList.remove("is-modal-open");
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  function alertRow(tone, iconName, title, desc) {
    return '<div class="alert alert--row alert--' + tone + '">' +
      '<span class="alert__icon">' + icon(iconName) + "</span>" +
      '<div class="alert__body"><div class="alert__title">' + esc(title) + "</div>" +
        (desc ? '<div class="alert__desc">' + esc(desc) + "</div>" : "") + "</div></div>";
  }
  function paintPublish() {
    var f = vault();
    var chk = V.publishCheck(f);
    els.pubChecks.innerHTML =
      (chk.empty ? alertRow("error", "alert-triangle", L("vault.pub.check.empty.t"), L("vault.pub.check.empty.d")) : "") +
      (chk.noWay ? alertRow("warning", "alert-triangle", L("vault.pub.check.noway.t"), L(V.keysOn() ? "vault.pub.check.noway.d" : "vault.pub.check.noway.d.nk")) : "");
    els.pubChecks.hidden = !(chk.empty || chk.noWay);
    els.pub.querySelectorAll("[data-pub-mode]").forEach(function (b) {
      var on = b.getAttribute("data-pub-mode") === pub.mode;
      b.classList.toggle("segmented__btn--active", on);
      b.setAttribute("aria-checked", String(on));
    });
    els.pubListField.hidden = pub.mode !== "schedule";
    els.pubRule.hidden = pub.mode !== "schedule";
    els.pubUnlistSwitch.classList.toggle("switch--on", pub.unlistOn);
    els.pubUnlistSwitch.setAttribute("aria-checked", String(pub.unlistOn));
    els.pubUnlistFields.hidden = !pub.unlistOn;
    els.pubOk.querySelector("span").textContent = L(pub.mode === "schedule" ? "vault.pub.ok.sched" : "vault.pub.ok.now");
    els.pubOk.disabled = chk.empty || (!!pub.plan && pub.restore === null);   /* D483：要先選恢復或不恢復 */
    validatePublish(false);
    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.pub);
  }
  /* 時間的檢查（F10 推導）：排定的上架時間要晚於現在；下架時間要晚於上架時間（立刻上架＝晚於現在）。
     show＝按下確認時才把錯誤亮出來，打字當下只清掉已修好的錯。 */
  function validatePublish(show) {
    var now = Date.now();
    var errList = null, errUnlist = null;
    var listMs = null;
    if (pub.mode === "schedule") {
      listMs = V.toMs(els.pubListTime.value);
      if (listMs == null) errList = "vault.pub.err.time.req";
      else if (listMs <= now) errList = "vault.pub.err.time.past";
    }
    if (pub.unlistOn) {
      var unMs = V.toMs(els.pubUnlistTime.value);
      if (unMs == null) errUnlist = "vault.pub.err.unlist.req";
      else if (unMs <= (listMs != null ? listMs : now)) errUnlist = listMs != null ? "vault.pub.err.unlist.early" : "vault.pub.err.time.past";
    }
    function paint(el, input, key) {
      var on = !!key && (show || !el.hidden);
      el.hidden = !on;
      if (on) el.textContent = L(key);
      input.setAttribute("aria-invalid", on ? "true" : "false");
    }
    paint(els.pubListErr, els.pubListTime, errList);
    paint(els.pubUnlistErr, els.pubUnlistTime, errUnlist);
    return !errList && !errUnlist;
  }
  function confirmPublish() {
    var f = vault();
    if (V.publishCheck(f).empty) return;
    if (pub.plan && pub.restore === null) return;
    if (!validatePublish(true)) return;
    var opt = {
      listAt: pub.mode === "schedule" ? els.pubListTime.value : null,
      unlistAt: pub.unlistOn ? els.pubUnlistTime.value : null
    };
    V.publish(f, opt);
    closePublish();
    lastReach = null;
    render();
    if (window.ztorToast) window.ztorToast.show(opt.listAt
      ? L("vault.toast.scheduled", { t: fmtWhen(opt.listAt) })
      : L("vault.toast.listed", { n: vaultName(f) }), { tone: "success" });
  }

  /* ── 確認視窗：下架、刪除、上架中要先下架（canonical 對話框殼，Pattern 5.1.11）──────
     刪除照破壞性確認的四段：動到哪一座 → 會發生什麼（幾位粉絲失去內容、鑰匙一併失效）→ 不可復原。
     下架可以再上架，但粉絲會看不到、排程會暫停（D483：保存起來，重新上架時可選恢復），所以照電子商店下架一樣先問一次。 */
  var confirmOk = null;
  function openConfirm(o) {
    if (!els.cf) { if (o.onOk) o.onOk(); return; }
    els.cfTitle.textContent = o.title;
    els.cfBody.innerHTML = o.body;
    els.cfOk.className = "btn " + (o.danger ? "btn--destructive" : "btn--primary");
    els.cfOk.querySelector("span").textContent = o.ok;
    els.cfCancel.hidden = !!o.noCancel;
    confirmOk = o.onOk || null;
    els.cf.hidden = false;
    document.body.classList.add("is-modal-open");
    lastFocus = document.activeElement;
    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.cf);
    (o.noCancel ? els.cfOk : els.cfCancel).focus();
  }
  function closeConfirm() {
    if (!els.cf || els.cf.hidden) return;
    els.cf.hidden = true;
    confirmOk = null;
    document.body.classList.remove("is-modal-open");
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  function listHtml(items) {
    return '<ul class="vault-confirm__list">' + items.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>";
  }
  function askUnlist() {
    var f = vault();
    openConfirm({
      title: L("vault.unlist.title", { n: vaultName(f) }),
      /* 第二條講已設的下架時間會保存並暫停、重新上架時可選恢復（D483 比照 D481）；
         排程（S125）不在版本內、或沒設下架時間時不列。 */
      body: listHtml([esc(L("vault.unlist.li1"))].concat(V.schedOn() && f.unlistAt ? [esc(L("vault.unlist.li2"))] : []).concat([esc(L("vault.unlist.li3"))])),
      ok: L("vault.act.unlist"),
      onOk: function () {
        V.unlist(f);
        lastReach = null; render();
        if (window.ztorToast) window.ztorToast.show(L("vault.toast.unlisted"), { tone: "neutral" });
      }
    });
  }
  function askDeleteVault() {
    var f = vault();
    if (V.isListed(f)) {
      openConfirm({ title: L("vault.del.listed.title"), body: '<p class="vault-confirm__p">' + esc(L("vault.del.listed.body")) + "</p>",
        ok: L("vault.del.listed.ok"), noCancel: true });
      return;
    }
    var imp = V.deleteImpact(f);
    openConfirm({
      title: L("vault.del.title", { n: vaultName(f) }),
      /* 從沒上架過的草稿沒有人解開過，刪除不會讓任何人失去內容（N＝0）：不寫「N 位粉絲失去」那一條，
         只留鑰匙一併失效與不可復原。已下架照原口徑（重新上架後看得到至少一件的人數）。 */
      body: listHtml((f.status === "draft" ? [] : [
          L(imp.fans === 1 ? "vault.del.fans.one" : "vault.del.fans", { n: num(imp.fans) }) +
            '<span class="vault-confirm__sub">' + esc(L("vault.del.fans.note")) + "</span>"
        ]).concat(V.keysOn() ? [
          esc(imp.keys ? L(imp.keys === 1 ? "vault.del.keys.one" : "vault.del.keys", { n: num(imp.keys) }) : L("vault.del.keys.none"))
        ] : [])) +   /* 鑰匙（S123）不在版本內：不列「鑰匙一併失效」 */
        alertRow("error", "alert-triangle", L("vault.del.irrev"), ""),
      ok: L("vault.act.delete"), danger: true,
      onOk: function () {
        var name = vaultName(f);
        V.removeVault(f.id);
        if (V.vaults.length) state.vaultId = V.vaults[0].id;
        lastReach = null; render();
        if (window.ztorToast) window.ztorToast.show(L("vault.toast.deleted", { n: name }), { tone: "neutral" });
      }
    });
  }
  function doCancelSchedule() {
    V.cancelSchedule(vault());
    render();
    if (window.ztorToast) window.ztorToast.show(L("vault.toast.cancelled"), { tone: "neutral" });
  }
  /* 時間到了自動上架／下架：原型沒有後端，每 30 秒看一次，有變動就重畫並說一聲。 */
  function tickSchedules() {
    var before = V.vaults.map(function (v) { return v.id + ":" + v.status; });
    if (!V.applySchedules()) return;
    V.vaults.forEach(function (v, i) {
      if (before[i] === v.id + ":" + v.status || !window.ztorToast) return;
      window.ztorToast.show(L(v.status === "listed" ? "vault.toast.auto.listed" : "vault.toast.auto.unlisted", { n: vaultName(v) }), { tone: "neutral" });
    });
    lastReach = null; render();
  }

  /* ── 分享抽屜：發鑰匙 ───────────────────────────────────────
     一把鑰匙就是一條加密連結。兩個意圖共用同一個物件，只差 uses 的預設值
     與收尾動作（使用者裁示 2026-07-29）：
       送給一位粉絲 → uses 1，收尾是「複製連結」
       做成 NFC 商品 → uses N，收尾是「到 E-Shop 建立商品」

     鑰匙是持有者憑證：連結落到誰手上，誰就能用掉一次。所以 uses 是上限、
     撤銷是煞車，這兩件事必須寫在畫面上，不能只寫在文件裡。 */
  var share = { intent: "gift", created: null };

  function shareHtml(f) {
    var isGift = share.intent === "gift";
    var keys = (f.keys || []).slice().reverse();

    var out = '<div class="vshare">';

    /* — 意圖 — */
    out += '<div class="vshare__section">' +
      '<div class="vshare__label">' + icon("plus") + tx("New key", "發一把新鑰匙") + "</div>" +
      '<div class="vshare__intent">' +
        '<button type="button" class="vshare__opt' + (isGift ? " vshare__opt--active" : "") + '" data-intent="gift">' +
          '<span class="vshare__opt-icon">' + icon("gift") + "</span>" +
          '<span class="vshare__opt-title">' + tx("Send to one fan", "送給一位粉絲") + "</span>" +
          '<span class="vshare__opt-sub">' + tx("Single use. The first fan to open it keeps the access.", "一次性。第一個打開的人就拿到權限。") + "</span>" +
        "</button>" +
        '<button type="button" class="vshare__opt' + (!isGift ? " vshare__opt--active" : "") + '" data-intent="nfc">' +
          '<span class="vshare__opt-icon">' + icon("scan") + "</span>" +
          '<span class="vshare__opt-title">' + tx("Make an NFC product", "做成 NFC 商品") + "</span>" +
          '<span class="vshare__opt-sub">' + tx("A batch of uses, written into a keychain or a piece of furniture.", "一批可用次數，寫進鑰匙圈或家具裡。") + "</span>" +
        "</button>" +
      "</div>";

    /* — 表單 — */
    out += '<div class="field"><label class="field__label" for="vshare-name">' +
      tx("What is this key for?", "這把鑰匙是做什麼用的？") + "</label>" +
      '<input class="input" id="vshare-name" type="text" placeholder="' +
      esc(isGift ? tx("e.g. for the fan who mailed the tape", "例：給那位寄卡帶來的粉絲")
                 : tx("e.g. NFC keychain · east-coast tour", "例：NFC 鑰匙圈 · 東岸巡迴")) + '"></div>';

    if (!isGift) {
      out += '<div class="field"><label class="field__label" for="vshare-uses">' +
        tx("How many products in this run?", "這一批要做幾件商品？") + "</label>" +
        '<input class="input" id="vshare-uses" type="number" min="1" max="100000" value="500">' +
        '<span class="field__hint">' + tx("One product = one use. Unclaimed uses are stock, not people — they never count toward who gets in.",
                                          "一件商品＝一次。未領取的次數是庫存、不是人，永遠不會被算進「誰進得來」。") + "</span></div>";
    }

    out += '<button class="btn btn--primary" type="button" data-vshare-create>' + icon("key") +
      (isGift ? tx("Create the key", "產生鑰匙") : tx("Create the batch", "產生這一批")) + "</button>";

    /* — 剛產生的那一把：連結 ＋ 收尾動作 — */
    if (share.created) {
      var k = share.created;
      out += '<div class="vshare__link">' +
        '<input class="input" type="text" readonly value="' + esc(V.keyUrl(k.code)) + '" ' +
        'aria-label="' + esc(tx("Key link", "鑰匙連結")) + '" data-vshare-url>' +
        '<button class="btn btn--primary vshare__copy" type="button" data-vshare-copy="' + esc(V.keyUrl(k.code)) + '">' +
          icon("copy") + '<span>' + tx("Copy", "複製") + "</span></button>" +
      "</div>";
      if (k.product || share.intent === "nfc") {
        out += '<a class="btn btn--outline" href="create-product.html?vaultkey=' + encodeURIComponent(k.code) +
          "&vault=" + encodeURIComponent(f.id) + '">' + icon("shopping-bag") +
          tx("Create the product in E-Shop", "到 E-Shop 建立這件商品") + "</a>";
      }
      out += '<p class="vshare__hint">' + esc(k.code) + " · " +
        tx("Anyone holding this link can use one of its " + num(k.uses) + " uses. Revoke it below if it leaks.",
           "拿到這條連結的人都能用掉 " + num(k.uses) + " 次裡的一次。外流的話，在下面撤銷它。") + "</p>";
    }
    out += "</div>";

    /* — 已發出的鑰匙 — */
    out += '<div class="vshare__section">' +
      '<div class="vshare__label">' + icon("key") + tx("Keys issued", "已發出的鑰匙") + "</div>";
    if (!keys.length) {
      out += '<p class="vshare__hint">' + tx("No keys yet. Everyone who gets in right now does so by meeting a condition.",
                                             "還沒有鑰匙。目前進得來的人都是靠條件進來的。") + "</p>";
    } else {
      out += '<div class="vshare__keys">' + keys.map(function (k) {
        var claimed = (k.claimed || []).length;
        var pct = k.uses ? claimed / k.uses : 0;
        return '<div class="vkey' + (k.revoked ? " vkey--revoked" : "") + '">' +
          '<div class="vkey__head">' +
            '<span class="vkey__name">' + esc(V.t(k.label)) + "</span>" +
            '<span class="vkey__code">' + esc(k.code) + " · " + esc(k.born) +
              (k.revoked ? " · " + tx("revoked " + k.revoked, "已於 " + k.revoked + " 撤銷") : "") + "</span>" +
          "</div>" +
          '<div class="vkey__actions">' +
            (k.revoked ? "" :
              '<button type="button" class="vkey__act" data-vkey-copy="' + esc(V.keyUrl(k.code)) + '" ' +
                'aria-label="' + esc(tx("Copy link", "複製連結")) + '">' + icon("copy") + "</button>" +
              '<button type="button" class="vkey__act vkey__act--danger" data-vkey-revoke="' + esc(k.id) + '" ' +
                'aria-label="' + esc(tx("Revoke", "撤銷")) + '">' + icon("x-circle") + "</button>") +
          "</div>" +
          '<div class="vkey__meter">' +
            '<span class="vkey__track"><span class="vkey__fill" data-fill="' + pct + '"></span></span>' +
            '<span class="vkey__count">' + num(claimed) + " / " + num(k.uses) + " " + tx("claimed", "已領取") + "</span>" +
          "</div>" +
          (k.product ? '<span class="vkey__product">' + icon("shopping-bag") + esc(V.t(k.product.name)) + "</span>" : "") +
        "</div>";
      }).join("") + "</div>";
    }
    out += "</div>";

    /* — 上架前不能領鑰匙（F4，D477）：草稿或已下架時，抽屜裡也講一次 — */
    if (f.status && !V.isListed(f)) {
      out += '<div class="info-banner" data-feat="S123">' + icon("clock", "info-banner__icon") + "<span>" + esc(L("vault.ac.keys.off")) + "</span></div>";
    }

    /* — 這個機制的規則，寫在畫面上 — */
    out += '<div class="info-banner">' + icon("info", "info-banner__icon") + "<span>" +
      tx("A key is a bearer link: whoever holds it can use one of its uses, and access binds to that fan's account once used. A key only gets a fan into the vault — each item's task still applies. Revoking a key removes access from everyone who claimed it — the fan count drops immediately.",
         "鑰匙是持有者憑證：拿到連結的人就能用掉其中一次，用掉之後權限綁定在那位粉絲的帳號上。鑰匙只管進庫，進庫之後每件內容的任務照常要完成。撤銷一把鑰匙，所有靠它進來的人會立刻失去權限——粉絲人數會當場往下掉。") +
      "</span></div>";

    out += "</div>";
    return out;
  }

  function renderShare() {
    var f = vault();
    els.drawerBody.innerHTML = shareHtml(f);
    els.drawerTitle.textContent = tx("Share access · ", "分享權限 · ") + vaultName(f);
    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.drawerBody);
    requestAnimationFrame(function () {
      els.drawerBody.querySelectorAll(".vkey__fill").forEach(function (el) {
        el.style.transform = "scaleX(" + parseFloat(el.getAttribute("data-fill")) + ")";
      });
    });
  }

  /* 抽屜有兩段：上面「發一把新鑰匙」（建立），下面「已發出的鑰匙」（每一把都能
     複製連結、撤銷）。兩個入口進來的意圖不同，所以停的位置也不同——從「分享連結」
     進來的人要的是既有的那幾條，不該還要自己往下捲過整個建立表單。 */
  /* preset：「存取權限」分頁的兩個入口（送給一位粉絲／做成 NFC 商品）直接預選意圖，
     抽屜打開就停在那一個，不必再在抽屜裡選一次。 */
  function openShare(intent, preset) {
    share.created = null;
    if (preset === "gift" || preset === "nfc") share.intent = preset;
    renderShare();
    els.drawer.classList.add("is-open");
    els.drawer.setAttribute("aria-hidden", "false");
    lastFocus = document.activeElement;

    if (intent === "keys") {
      var list = els.drawerBody.querySelectorAll(".vshare__section")[1];
      if (list) {
        list.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
        var copy = list.querySelector("[data-vkey-copy]");
        if (copy) { copy.focus(); return; }
      }
    }
    var first = els.drawerBody.querySelector(".vshare__opt");
    if (first) first.focus();
  }
  function closeShare() {
    els.drawer.classList.remove("is-open");
    els.drawer.setAttribute("aria-hidden", "true");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* 撤銷一把鑰匙：抽屜裡的撤銷鈕與「存取權限」分頁鑰匙清單的撤銷鈕共用這一支
     （同一段確認文字、同一份資料改動與重畫）。撤銷會讓人失去權限，所以要說出來
     會失去幾個人，不能只說「確定嗎」（規格 F4）。 */
  function revokeKey(id) {
    var f = vault();
    var k = (f.keys || []).filter(function (x) { return x.id === id; })[0];
    if (!k || k.revoked) return;
    var lost = (k.claimed || []).length;
    if (!window.confirm(tx(
      "Revoke " + k.code + "? " + num(lost) + " fans lose access to this vault immediately, and its remaining uses stop working.",
      "撤銷 " + k.code + "？已靠它進來的 " + num(lost) + " 位粉絲會立刻失去這座庫房的權限，剩下的次數也會失效。"))) return;
    V.commitUnlocks(f);
    k.revoked = todayStr();
    if (els.drawer.classList.contains("is-open")) renderShare();
    renderDoor(); renderRail(); renderMain();
    if (window.ztorToast) window.ztorToast.show(tx("Key revoked", "鑰匙已撤銷"), { tone: "neutral" });
  }

  function copyLink(text, btn) {
    function ok() {
      if (!btn) return;
      var label = btn.querySelector("span");
      if (!label) { return; }
      var was = label.textContent;
      label.textContent = tx("Copied", "已複製");
      setTimeout(function () { label.textContent = was; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else { fallback(); }
    /* 舊瀏覽器／非安全來源沒有 clipboard API。塞一個離屏 input 再 execCommand，
       比跳出「請手動複製」的訊息誠實：使用者要的是複製這個動作真的發生。 */
    function fallback() {
      var tmp = document.createElement("input");
      tmp.value = text;
      tmp.style.cssText = "position:fixed;top:-1000px;opacity:0";
      document.body.appendChild(tmp);
      tmp.select();
      try { document.execCommand("copy"); ok(); }
      catch (_) { if (window.ztorToast) window.ztorToast.show(tx("Could not copy — select the link and copy it", "複製失敗，請手動選取連結"), { tone: "neutral" }); }
      tmp.remove();
    }
  }

  /* ── 條件選單 ─────────────────────────────────────────────
     pendingGroup ＝ 這次要把條件加進第幾組。由按下「新增條件」的那一顆按鈕決定，
     選單本身看不到自己是被誰打開的。 */
  var pendingGroup = 0;

  function ruleMenuHtml() {
    var f = vault();
    /* 只擋「這一組裡已經有的」。同一條件出現在不同組是多餘但無害，擋掉反而會讓
       人以為系統壞了；同一組裡重複才是真的沒有意義。 */
    var cur = (f.rules[pendingGroup] && f.rules[pendingGroup].items) || [];
    var has = function (t, v) { return cur.some(function (r) { return r.t === t && r.v === v; }); };
    var out = '<div class="vault-rulemenu__group" role="presentation">' + tx("Tier", "分級") + "</div>";
    out += V.tiers.map(function (t) {
      var n = V.reach([{ t: "tier", v: t.key }]);
      return '<button type="button" role="menuitem" class="vault-rulemenu__opt" data-add="tier:' + t.key + '"' +
        (has("tier", t.key) ? " disabled" : "") + ">" + icon("chart-column") +
        "≥ " + esc(tierName(t.key)) + '<span class="vault-rulemenu__n">' + num(n) + "</span></button>";
    }).join("");

    ["bought", "backed", "attended", "earned"].forEach(function (kind) {
      var grp = V.catalogue[kind];
      out += '<div class="vault-rulemenu__group" role="presentation">' + esc(V.t(grp.label)) + "</div>";
      out += grp.opts.map(function (o) {
        var n = V.reach([{ t: kind, v: o.id }]);
        return '<button type="button" role="menuitem" class="vault-rulemenu__opt" data-add="' + kind + ":" + o.id + '"' +
          (has(kind, o.id) ? " disabled" : "") + ">" + icon(grp.icon) +
          esc(V.t(o.label)) + '<span class="vault-rulemenu__n">' + num(n) + "</span></button>";
      }).join("");
    });
    return out;
  }

  function openRuleMenu(anchor) {
    els.menu.innerHTML = ruleMenuHtml();
    els.menu.hidden = false;
    var r = anchor.getBoundingClientRect();
    var w = els.menu.offsetWidth, h = els.menu.offsetHeight;
    var left = Math.min(r.left, window.innerWidth - w - 12);
    var top = r.bottom + 6;
    if (top + h > window.innerHeight - 12) top = Math.max(12, r.top - h - 6);
    els.menu.style.left = Math.max(12, left) + "px";
    els.menu.style.top = top + "px";
    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.menu);
    var first = els.menu.querySelector(".vault-rulemenu__opt:not(:disabled)");
    if (first) first.focus();
  }
  function closeRuleMenu() { els.menu.hidden = true; }

  /* role="menu" 承諾的是方向鍵導覽，不是 Tab。只標 ARIA 而不接鍵盤，
     等於對輔助科技說謊——它會照著宣告的契約去唸操作方式。 */
  function menuKeys(e) {
    if (els.menu.hidden) return;
    var opts = Array.prototype.filter.call(
      els.menu.querySelectorAll(".vault-rulemenu__opt"),
      function (b) { return !b.disabled; });
    if (!opts.length) return;
    var i = opts.indexOf(document.activeElement);
    if (e.key === "ArrowDown")      { e.preventDefault(); opts[(i + 1 + opts.length) % opts.length].focus(); }
    else if (e.key === "ArrowUp")   { e.preventDefault(); opts[(i - 1 + opts.length) % opts.length].focus(); }
    else if (e.key === "Home")      { e.preventDefault(); opts[0].focus(); }
    else if (e.key === "End")       { e.preventDefault(); opts[opts.length - 1].focus(); }
  }

  /* ── 就地新增庫房 ─────────────────────────────────────── */
  /* 2026-07-31 使用者裁決，三輪累積：
     一、按鈕自己變成輸入欄，不是在按鈕旁邊多長一個。按下「新增庫房」之後那顆鈕就
        沒有第二個用途了，讓它留在原地當背景、旁邊又冒出一格，等於同一件事佔兩格。
        原地替換也讓打字的位置＝剛才按下去的位置。
     二、右邊給一個叉叉可以取消。原本只有 Esc 與「清空後失焦」兩條退路，兩條都是
        隱形的；反悔是常見動作，要有看得見的出口。
     三、輸入欄不畫外框：它本身就是 .input，DS 的邊框與聚焦光暈由元件負責。 */
  function startDraft(anchor) {
    anchor = anchor || els.newBtn;
    if (!anchor || document.querySelector(".vault-rail__draft")) return;

    var row = document.createElement("div");
    row.className = "vault-rail__draft";
    row.innerHTML =
      '<input class="input" type="text" placeholder="' + esc(tx("Vault name", "庫房名稱")) +
        '" aria-label="' + esc(tx("Vault name", "庫房名稱")) + '">' +
      '<button type="button" class="btn btn--icon btn--xs vault-rail__draft-x" ' +
        'aria-label="' + esc(tx("Cancel", "取消")) + '">' + icon("x") + "</button>";
    anchor.hidden = true;
    anchor.insertAdjacentElement("afterend", row);
    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(row);

    var input = row.querySelector("input");
    var done = false;
    input.focus();

    function close() { done = true; row.remove(); anchor.hidden = false; }

    function commit() {
      if (done) return;
      var name = input.value.trim();
      close();
      if (!name) return;
      var id = "f" + Date.now();
      /* 新庫房條件為空：預設是「沒有人進得來」，不是「所有人看得到」。
         插在清單最前面，跟剛才打字的位置同一格——輸入框在最上面、建好的庫房卻
         跑到第七列，會讓人以為自己按錯了。 */
      /* 新庫房是草稿（F1／F10，D477）：粉絲看不到，創作者按「發布」才上架。 */
      V.vaults.unshift({ id: id, icon: "package", status: "draft", custom: name, name: { en: name, zh: name }, note: { en: "", zh: "" }, rules: [{ items: [] }], items: [] });
      /* 正式頁沒有彈窗節點（els.modal＝null），只有保存檔 media-vault-popup.html 有；
         先判斷存在再讀 hidden，否則新增庫房在正式頁會拋 TypeError、畫面沒反應。 */
      if (els.modal && els.modal.hidden) openVault(id); else { state.vaultId = id; lastReach = null; render(); }
      if (window.ztorToast) window.ztorToast.show(tx("Vault created — now set who gets in", "庫房已建立——接著決定誰進得來"), { tone: "success" });
      /* 接下來要做的是決定誰進得來——那在「存取權限」分頁，先切過去再把焦點送到「再加一個」。 */
      activateTab("access");
      var add = els.doorRules.querySelector("[data-rule-add]");
      if (add) add.focus();
    }

    /* 叉叉走 mousedown ＋ preventDefault：等到 click 才處理的話，blur 會先跑、
       已經把名字送出去了——按取消卻建出一座庫房是最糟的結果。 */
    row.querySelector(".vault-rail__draft-x").addEventListener("mousedown", function (e) {
      e.preventDefault();
      close();
      anchor.focus();
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); commit(); }
      else if (e.key === "Escape") { e.preventDefault(); close(); anchor.focus(); }
    });
    input.addEventListener("blur", commit);
  }

  /* ── 收檔 ──────────────────────────────────────────────────
     混合媒體，所以檔型由 MIME 決定放進哪一種格子（image / clip / audio）。
     原型沒有後端：檔案用 createObjectURL 留在瀏覽器記憶體裡，重整就消失。
     這比「假裝上傳成功」誠實，也讓創作者真的看得到自己的素材排進格子後
     是什麼樣子——那才是這一頁要回答的問題。 */
  function kindOf(file) {
    if (/^image\//.test(file.type)) return "image";
    if (/^video\//.test(file.type)) return "clip";
    if (/^audio\//.test(file.type)) return "audio";
    return null;
  }
  function fmtSize(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
    return Math.max(1, Math.round(bytes / 1024)) + " KB";
  }
  function addFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    if (!files.length) return;
    var v = vault(), added = 0, skipped = 0;
    files.forEach(function (file) {
      var kind = kindOf(file);
      if (!kind) { skipped++; return; }
      var name = file.name.replace(/\.[^.]+$/, "");
      var item = {
        id: "u" + Date.now() + "-" + added,
        kind: kind,
        name: { en: name, zh: name },
        size: fmtSize(file.size),
        added: todayStr()
      };
      /* 只有圖片給得出 objectURL 縮圖。影片要抽影格得靠轉檔服務，還沒接，
         所以影片格先走檔名版（標籤紙），不是塞一個空的圖片標籤進去。 */
      if (kind === "image") item.img = URL.createObjectURL(file);
      v.items.unshift(item);
      added++;
    });
    renderMain(); renderRail();
    if (window.ztorToast && added) {
      window.ztorToast.show(
        tx(added + (added === 1 ? " file added" : " files added") + (skipped ? " · " + skipped + " skipped (not media)" : ""),
           "已加入 " + added + " 個檔案" + (skipped ? "，略過 " + skipped + " 個非媒體檔" : "")),
        { tone: "success" });
    } else if (window.ztorToast && skipped) {
      window.ztorToast.show(tx("Nothing added — those are not image, video or audio files",
                               "沒有加入任何東西——那些不是圖片、影片或音檔"), { tone: "neutral" });
    }
  }

  /* ── 就地刪除確認 ──────────────────────────────────────────
     不用 window.confirm（同改名不用 window.prompt 的理由）：確認要刪的是
     「這一格」，問句就該長在這一格上，而不是把視線拉到作業系統的對話框。
     刪除是不可逆的，所以確認鈕不預設 focus——手滑連按兩下不該刪掉東西。 */
  function askDelete(tile, item) {
    if (!tile || tile.querySelector(".vault-tile__confirm")) return;
    tile.classList.add("is-confirming");
    var box = document.createElement("div");
    box.className = "vault-tile__confirm";
    box.innerHTML =
      '<p class="vault-tile__confirm-q">' + tx("Delete this? Fans lose it immediately.", "刪掉？粉絲會立刻失去它。") + "</p>" +
      '<div class="vault-tile__confirm-row">' +
        '<button type="button" class="btn btn--ghost btn--sm" data-cancel>' + tx("Keep", "保留") + "</button>" +
        '<button type="button" class="btn btn--destructive btn--sm" data-confirm>' + tx("Delete", "刪除") + "</button>" +
      "</div>";
    tile.appendChild(box);
    box.addEventListener("click", function (e) { e.stopPropagation(); });

    function close() { tile.classList.remove("is-confirming"); box.remove(); }
    box.querySelector("[data-cancel]").addEventListener("click", close);
    box.querySelector("[data-cancel]").focus();
    box.querySelector("[data-confirm]").addEventListener("click", function () {
      var v = vault();
      v.items = v.items.filter(function (i) { return i.id !== item.id; });
      close();
      renderMain(); renderRail();
      if (window.ztorToast) window.ztorToast.show(tx("Deleted", "已刪除"), { tone: "neutral" });
    });
    box.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.preventDefault(); close(); } });
  }

  /* ── 就地改名一件內容 ───────────────────────────────────────
     輸入框長在那一格上，不開 window.prompt——改的是這一格的名字，視線
     不該被拉到畫面正中央的作業系統對話框上，而且那個框不是我們的樣式。
     Enter 存、Esc 取消、失焦視同存（同 benefit-matrix 新增列的手勢）。 */
  function startRename(tile, item) {
    if (!tile || tile.querySelector(".vault-tile__rename")) return;
    tile.classList.add("is-renaming");
    var box = document.createElement("div");
    box.className = "vault-tile__rename";
    box.innerHTML = '<input class="input" type="text" aria-label="' + esc(tx("Rename", "重新命名")) + '">';
    tile.appendChild(box);
    /* 這一層自己吃掉點擊，否則會冒泡回格子的 click 委派。 */
    box.addEventListener("click", function (e) { e.stopPropagation(); });

    var input = box.querySelector("input");
    input.value = V.t(item.name);
    input.focus();
    input.select();

    var done = false;
    function close(save) {
      if (done) return;
      done = true;
      var next = input.value.trim();
      tile.classList.remove("is-renaming");
      box.remove();
      if (!save || !next || next === V.t(item.name)) return;
      item.name = { en: next, zh: next };
      renderMain(); renderRail();
    }
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); close(true); }
      else if (e.key === "Escape") { e.preventDefault(); close(false); }
    });
    input.addEventListener("blur", function () { close(true); });
  }

  /* ── 事件接線 ───────────────────────────────────────────── */
  function wire() {
    if (els.list) els.list.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-vault]");
      if (!btn) return;
      state.vaultId = btn.getAttribute("data-vault");
      lastReach = null;
      closeRuleMenu();
      render();
    });

    /* 建立庫房只有側欄這一個入口（2026-07-31 使用者裁示撤掉頁首那顆）：就地開一列
       草稿，不開對話框——只有一個必填欄位（名稱），把整個畫面蓋掉去問一個字，是把
       中斷當成儀式。 */
    if (els.newBtn) els.newBtn.addEventListener("click", function () { startDraft(els.newBtn); });

    /* ── demo A：總覽 ↔ 詳情 ─────────────────────────────── */
    if (els.overview) {
      els.overview.addEventListener("click", function (e) {
        var nv = e.target.closest("[data-vault-new-ov]");
        if (nv) { startDraft(nv); return; }
        var card = e.target.closest("[data-vault]");
        if (card) openVault(card.getAttribute("data-vault"), card);
      });
    }

    /* 關閉：叉叉、點背景、Esc。三條路都要有——彈窗是「蓋在上面」的東西，
       離開它的方式不能只有一個角落的按鈕。 */
    if (els.modal) els.modal.addEventListener("click", function (e) {
      if (e.target.closest("[data-vault-modal-close]") || e.target === els.modal) closeVault();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (els.itemSheet.classList.contains("is-open")) { closeItem(); return; }
      if (!els.modal || els.modal.hidden) return;
      /* 抽屜／選單開著時，Esc 先關它們，不要一路關到彈窗。 */
      if (els.drawer && els.drawer.classList.contains("is-open")) return;
      if (els.menu && !els.menu.hidden) return;
      closeVault();
    });

    els.doorRules.addEventListener("click", function (e) {
      var f = vault();

      var add = e.target.closest("[data-rule-add]");
      if (add) {
        if (els.menu.hidden) {
          /* 條件要加進哪一種方法，是按下去的那一刻就決定的——選單本身不知道
             自己是被誰打開的，所以在這裡記下來。 */
          pendingGroup = parseInt(add.getAttribute("data-rule-add"), 10) || 0;
          openRuleMenu(add);
        } else closeRuleMenu();
        return;
      }

      var rm = e.target.closest("[data-rule-remove]");
      if (rm) {
        var at = rm.getAttribute("data-rule-remove").split(":");
        var gi = parseInt(at[0], 10), ri = parseInt(at[1], 10);
        var g = f.rules[gi];
        if (!g) return;
        /* 移除條件會讓人看不到：上架中先把當下看得到的人記進解開紀錄（F8，D477）。 */
        V.commitUnlocks(f);
        g.items.splice(ri, 1);
        /* 刪到空的方法自動消失，不必再給一顆「移除」——除非它是最後一種，
           那一種要留著當加條件的落點，否則畫面上會沒有任何入口。 */
        if (!g.items.length && f.rules.length > 1) f.rules.splice(gi, 1);
        renderDoor(); renderRail(); renderGate(); renderMain();
        return;
      }

      if (e.target.closest("[data-group-add]")) {
        f.rules.push({ items: [] });
        renderDoor();
        /* 新的方法是空的，直接把選單開在它的「再加一個」上——多開一種方法的
           意圖本來就是要放條件進去，多一次點擊只是儀式。 */
        var adders = els.doorRules.querySelectorAll("[data-rule-add]");
        var last = adders[adders.length - 1];
        if (last) { pendingGroup = f.rules.length - 1; openRuleMenu(last); }
      }
    });

    els.menu.addEventListener("click", function (e) {
      var opt = e.target.closest("[data-add]");
      if (!opt || opt.disabled) return;
      var parts = opt.getAttribute("data-add").split(":");
      var f = vault();
      var g = f.rules[pendingGroup] || f.rules[0];
      if (!g) { g = { items: [] }; f.rules.push(g); }
      g.items.push({ t: parts[0], v: parts[1] });
      closeRuleMenu();
      renderDoor(); renderRail(); renderGate(); renderMain();
    });
    document.addEventListener("click", function (e) {
      if (els.menu.hidden) return;
      if (e.target.closest(".vault-rulemenu") || e.target.closest("[data-rule-add]")) return;
      closeRuleMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !els.menu.hidden) {
        closeRuleMenu();
        var add = els.doorRules.querySelector("[data-rule-add]");
        if (add) add.focus();          /* 焦點掉到 body 是最常見的鍵盤陷阱 */
        return;
      }
      menuKeys(e);
    });

    els.grid.addEventListener("click", function (e) {
      var del = e.target.closest("[data-item-delete]");
      if (del) {
        var id = del.getAttribute("data-item-delete");
        var item = vault().items.filter(function (i) { return i.id === id; })[0];
        if (item) askDelete(del.closest(".vault-tile, .vault-track"), item);
        return;
      }
      var ren = e.target.closest("[data-item-rename]");
      if (ren) {
        var rid = ren.getAttribute("data-item-rename");
        var it = vault().items.filter(function (i) { return i.id === rid; })[0];
        if (it) startRename(ren.closest(".vault-tile, .vault-track"), it);
        return;
      }
    });

    /* 兩個上傳入口——空狀態那張大方框、有內容時標題列上的按鈕——都掛
       [data-vault-upload]，共用住在 .vault-gridbar 裡的同一個檔案選擇器。
       所以監聽掛在 .vault-gridwrap 這層（同時涵蓋標題列與格子），不是格子那層。 */
    els.gridWrap.addEventListener("click", function (e) {
      if (e.target.closest("[data-vault-upload]")) { els.file.click(); return; }
      /* 點在格子的空白處＝打開這一件的設定。格子上原有的動作鈕（播放／改名／刪除）
         各自 return 在前面，所以不會互相搶。 */
      var hit = e.target.closest("[data-item]");
      if (hit && !e.target.closest("button")) openItem(hit.getAttribute("data-item"));
    });

    els.itemSheet.addEventListener("click", function (e) {
      if (e.target.closest("[data-item-close]")) { closeItem(); return; }
      var pv = e.target.closest("[data-preview-toggle]");
      if (pv) { togglePreview(pv.closest("[data-preview]")); return; }

      /* ── 任務（F8）：三選一、商品範圍、大彩蛋 ── */
      var cur = itemById(state.itemId);
      var typeBtn = e.target.closest("[data-task-type]");
      if (typeBtn && cur) {
        var type = typeBtn.getAttribute("data-task-type");
        var was = V.taskOf(cur) ? V.taskOf(cur).type : "none";
        if (type !== was) {
          /* 改任務前先把已解開、此刻看得到的粉絲留下（F8 修改任務，D477 第二輪第 3 題）。 */
          V.retainOnTaskChange(vault(), cur);
          /* 一件只設一個任務：換設法就換掉整個任務物件，不保留另一種的參數。 */
          cur.task = type === "none" ? null
            : type === "action" ? newActionTask(V.actionTaskList()[0].id)
            : { type: "tier", tier: V.tierFloor(vault()) };
          refreshTask(cur, '[data-task-type="' + type + '"]');
        }
        return;
      }
      var scopeBtn = e.target.closest("[data-task-scope]");
      if (scopeBtn && cur && cur.task) {
        V.retainOnTaskChange(vault(), cur);
        cur.task.scope = scopeBtn.getAttribute("data-task-scope");
        if (cur.task.scope === "item" && !cur.task.target) cur.task.target = V.catalogue.bought.opts[0].id;
        if (cur.task.scope === "any") delete cur.task.target;
        refreshTask(cur, '[data-task-scope="' + cur.task.scope + '"]');
        return;
      }
      var grand = e.target.closest("[data-item-grand]");
      if (grand && cur) {
        cur.grand = !cur.grand;
        grand.classList.toggle("switch--on", cur.grand);
        grand.setAttribute("aria-checked", String(cur.grand));
        renderMain();
        return;
      }

      if (e.target.closest("[data-item-sheet-delete]")) {
        var it = itemById(state.itemId);
        var f = vault();
        f.items = f.items.filter(function (x) { return x.id !== state.itemId; });
        state.itemId = null;
        els.itemSheet.classList.remove("is-open");
        els.itemSheet.setAttribute("aria-hidden", "true");
        renderMain(); renderRail(); renderWall();
        if (it && window.ztorToast) window.ztorToast.show(tx("Deleted", "已刪除"), { tone: "neutral" });
      }
    });

    els.itemSheet.addEventListener("change", function (e) {
      var cur = itemById(state.itemId);
      if (!cur || !cur.task) return;
      if (e.target.matches("[data-task-kind], [data-task-target], [data-task-tier]")) V.retainOnTaskChange(vault(), cur);
      if (e.target.matches("[data-task-kind]")) {
        cur.task = newActionTask(e.target.value);
        refreshTask(cur, "[data-task-kind]");
      } else if (e.target.matches("[data-task-target]")) {
        cur.task.target = e.target.value;
        refreshTask(cur, "#" + e.target.id);
      } else if (e.target.matches("[data-task-tier]")) {
        cur.task.tier = e.target.value;
        refreshTask(cur, "[data-task-tier]");
      }
    });
    /* N：規格只要求正整數（範圍與上限〔產品待確認〕）。打字當下就判斷——合法就寫回、
       不合法就在欄位下方說，任務維持上一個合法值。不重畫任務區，打到一半的字才不會被吃掉。 */
    els.itemSheet.addEventListener("input", function (e) {
      if (!e.target.matches("[data-task-n]")) return;
      var cur = itemById(state.itemId);
      if (!cur || !cur.task) return;
      var raw = e.target.value.trim();
      var ok = /^\d+$/.test(raw) && parseInt(raw, 10) >= 1;
      var err = els.itemBody.querySelector("[data-task-n-error]");
      if (err) err.hidden = ok;
      e.target.setAttribute("aria-invalid", ok ? "false" : "true");
      if (ok) { V.retainOnTaskChange(vault(), cur); cur.task.n = parseInt(raw, 10); renderMain(); }
    });

    /* 鍵盤也要能開檔案選擇器——空狀態那張是 role=button，那就得像按鈕。 */
    els.gridWrap.addEventListener("keydown", function (e) {
      var tile = e.target.closest('[data-vault-upload][role="button"]');
      if (!tile) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); els.file.click(); }
    });

    els.file.addEventListener("change", function (e) { addFiles(e.target.files); });

    /* 拖放到格子上的任何位置都算——投放區是整座庫房，不是那一個虛線方框。 */
    ["dragenter", "dragover"].forEach(function (evt) {
      els.grid.addEventListener(evt, function (e) { e.preventDefault(); els.grid.classList.add("is-dropping"); });
    });
    ["dragleave", "drop"].forEach(function (evt) {
      els.grid.addEventListener(evt, function (e) {
        e.preventDefault();
        if (evt === "dragleave" && els.grid.contains(e.relatedTarget)) return;
        els.grid.classList.remove("is-dropping");
        if (evt === "drop" && e.dataTransfer) addFiles(e.dataTransfer.files);
      });
    });

    /* ── 分享這一頁（只剩保存檔 media-vault-popup.html 使用）────────────────
       正式頁 2026-10-22 起改成存取權限分頁的「分享連結」卡（F9，D475；Link field，
       網址由 renderAccessTab 寫入）。這支只服務保存檔的舊按鈕：複製連結、跳 3 秒提示。 */
    document.addEventListener("click", function (e) {
      if (!e.target.closest("[data-vault-share-page]")) return;
      copyLink("https://ztor.com/v/" + vault().id, null);
      if (window.ztorToast) {
        window.ztorToast.show(tx("Share link copied", "分享連結已複製"), { tone: "success", hold: 3000 });
      }
    });

    /* ── 分享抽屜 ─────────────────────────────────────────── */
    document.addEventListener("click", function (e) {
      var sh = e.target.closest("[data-vault-share]");
      if (sh) { openShare(sh.getAttribute("data-vault-share"), sh.getAttribute("data-share-intent")); return; }
      if (els.drawer.classList.contains("is-open") && e.target.closest("[data-drawer-close]")) closeShare();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && els.drawer.classList.contains("is-open")) closeShare();
    });

    els.drawerBody.addEventListener("click", function (e) {
      var intent = e.target.closest("[data-intent]");
      if (intent) {
        share.intent = intent.getAttribute("data-intent");
        share.created = null;
        renderShare();
        var focusBack = els.drawerBody.querySelector('[data-intent="' + share.intent + '"]');
        if (focusBack) focusBack.focus();
        return;
      }

      var copy = e.target.closest("[data-vshare-copy]");
      if (copy) { copyLink(copy.getAttribute("data-vshare-copy"), copy); return; }

      var rowCopy = e.target.closest("[data-vkey-copy]");
      if (rowCopy) {
        copyLink(rowCopy.getAttribute("data-vkey-copy"), null);
        if (window.ztorToast) window.ztorToast.show(tx("Link copied", "連結已複製"), { tone: "success" });
        return;
      }

      var revoke = e.target.closest("[data-vkey-revoke]");
      if (revoke) { revokeKey(revoke.getAttribute("data-vkey-revoke")); return; }

      if (e.target.closest("[data-vshare-create]")) {
        var vlt = vault();
        var nameEl = els.drawerBody.querySelector("#vshare-name");
        var usesEl = els.drawerBody.querySelector("#vshare-uses");
        var uses = share.intent === "gift" ? 1 : Math.max(1, parseInt(usesEl && usesEl.value, 10) || 1);
        var label = (nameEl && nameEl.value.trim()) ||
          (share.intent === "gift" ? tx("Gift key", "禮物鑰匙") : tx("NFC batch", "NFC 批次"));
        var key = {
          id: "k" + Date.now(),
          code: V.newCode(),
          uses: uses,
          claimed: [],
          born: todayStr(),
          label: { en: label, zh: label }
        };
        if (!vlt.keys) vlt.keys = [];
        vlt.keys.push(key);
        share.created = key;
        renderShare(); renderDoor(); renderRail(); renderMain();
        var urlField = els.drawerBody.querySelector("[data-vshare-url]");
        if (urlField) { urlField.focus(); urlField.select(); }
      }
    });

    /* 「存取權限」分頁鑰匙清單上的撤銷：直接走同一支 revokeKey。 */
    if (els.keylist) els.keylist.addEventListener("click", function (e) {
      var r = e.target.closest("[data-vkey-revoke]");
      if (r) revokeKey(r.getAttribute("data-vkey-revoke"));
    });

    wireTabs();

    els.viewer.addEventListener("change", function () {
      state.viewer = els.viewer.value;
      /* 每件內容的小標也要換成該角度的結果（F6，D477：已解開／需要條件／未解開；整座進不了＝上鎖）。
         換成「指定一位粉絲」時先清掉上一次選的人，焦點送到搜尋欄。 */
      if (state.viewer !== "person") state.person = null;
      renderLens(); renderRail(); renderGate(); renderMain();
      if (state.viewer === "person" && els.personInput) {
        els.personInput.value = state.person ? state.person.name : "";
        els.personInput.focus();
        renderPersonResults();
      }
    });

    /* 指定一位粉絲的搜尋欄（F6，D477）。 */
    if (els.personInput) {
      els.personInput.addEventListener("input", renderPersonResults);
      els.personInput.addEventListener("focus", renderPersonResults);
      els.personInput.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { closePersonResults(); return; }
        if (e.key === "ArrowDown") {
          var first = els.personResults.querySelector("[data-person]");
          if (first) { e.preventDefault(); first.focus(); }
        }
      });
      els.personResults.addEventListener("click", function (e) {
        var b = e.target.closest("[data-person]");
        if (b) pickPerson(b.getAttribute("data-person"));
      });
      els.personResults.addEventListener("keydown", function (e) {
        var opts = Array.prototype.slice.call(els.personResults.querySelectorAll("[data-person]"));
        var i = opts.indexOf(document.activeElement);
        if (e.key === "ArrowDown" && i >= 0) { e.preventDefault(); (opts[i + 1] || opts[0]).focus(); }
        else if (e.key === "ArrowUp" && i >= 0) { e.preventDefault(); if (i === 0) els.personInput.focus(); else opts[i - 1].focus(); }
        else if (e.key === "Escape") { closePersonResults(); els.personInput.focus(); }
      });
      document.addEventListener("click", function (e) {
        if (els.person && !els.person.contains(e.target)) closePersonResults();
      });
    }

    /* 庫房狀態的動作（F10，D477）。 */
    if (els.actions) els.actions.addEventListener("click", function (e) {
      var b = e.target.closest("[data-vault-act]");
      if (!b) return;
      var act = b.getAttribute("data-vault-act");
      if (act === "publish" || act === "relist") openPublish();
      else if (act === "unlist") askUnlist();
      else if (act === "cancel") doCancelSchedule();
      else if (act === "delete") askDeleteVault();
    });
    if (els.pub) {
      els.pub.addEventListener("click", function (e) {
        if (e.target.closest("[data-pub-close]") || e.target === els.pub) { closePublish(); return; }
        var m = e.target.closest("[data-pub-mode]");
        if (m) { pub.mode = m.getAttribute("data-pub-mode"); paintPublish(); if (pub.mode === "schedule") els.pubListTime.focus(); return; }
        if (e.target.closest("[data-pub-unlist]")) { pub.unlistOn = !pub.unlistOn; paintPublish(); if (pub.unlistOn) els.pubUnlistTime.focus(); return; }
        if (e.target.closest("[data-pub-ok]")) confirmPublish();
      });
      els.pubUnlistSwitch.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); pub.unlistOn = !pub.unlistOn; paintPublish(); }
      });
      els.pub.addEventListener("input", function () { validatePublish(false); });
      els.pub.addEventListener("change", function () { validatePublish(false); });
    }
    if (els.cf) els.cf.addEventListener("click", function (e) {
      if (e.target.closest("[data-cf-close]") || e.target === els.cf) { closeConfirm(); return; }
      if (e.target.closest("[data-cf-ok]")) { var fn = confirmOk; closeConfirm(); if (fn) fn(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (els.cf && !els.cf.hidden) closeConfirm();
      else if (els.pub && !els.pub.hidden) closePublish();
    });
    setInterval(tickSchedules, 30000);

    els.lensReset.addEventListener("click", function () {
      els.viewer.value = "";
      /* zselect 用自己的觸發鈕顯示標籤，程式改 value 不會通知它——補一個 change
         讓它跟著更新，順帶走同一條渲染路徑，不必把邏輯抄兩份。 */
      els.viewer.dispatchEvent(new Event("change", { bubbles: true }));
      els.viewer.focus();
    });

    document.addEventListener("i18n:applied", function () { lastReach = null; render(); });
    /* 2026-10-23 release2.4 範圍切分（UIA-300）：切版本時 JS 畫的內容（任務選單、鑰匙與排程字句、
       大彩蛋小標、人數）要照新版本重畫；單件設定開著就一起重畫。 */
    document.addEventListener("ztor:devstate-changed", function () {
      if (!els.main) return;
      lastReach = null; render();
      var open = state.itemId && els.itemSheet.classList.contains("is-open") && itemById(state.itemId);
      if (open) renderItemSheet(open);
    });
    window.addEventListener("resize", closeRuleMenu);
  }

  function init() {
    /* 清單容器在三種 demo 裡住的地方不一樣（側欄／切換面板／不存在），所以從整份
       文件找，不從側欄找；側欄本身可以不存在。 */
    els.rail = document.querySelector("[data-vault-rail]");
    els.list      = document.querySelector("[data-vault-list]");
    els.count     = document.querySelector("[data-vault-count]");
    els.newBtn    = document.querySelector("[data-vault-new]");
    if (!document.querySelector("[data-vault-main]")) return;
    /* 檢視器住在庫房與內容正上方那條 .vault-lens，不在側欄裡——它換的是整頁的
       檢視角度，不是庫房清單的篩選器。所以從 document 找，別從 els.rail 找。 */
    els.overview  = document.querySelector("[data-vault-overview]");
    els.modal     = document.querySelector("[data-vault-modal]");
    els.modalTitle = document.querySelector("[data-vault-modal-title]");
    els.itemSheet = document.querySelector("[data-item-sheet]");
    els.itemBody  = els.itemSheet.querySelector("[data-item-body]");
    els.lens      = document.querySelector("[data-vault-lens]");
    els.viewer    = els.lens.querySelector("[data-vault-viewer]");
    els.viewerWrap = els.viewer.closest(".vault-viewer");
    els.lensReset = els.lens.querySelector("[data-vault-lens-reset]");
    els.main      = document.querySelector("[data-vault-main]");
    els.body      = els.main.querySelector("[data-vault-body]");
    els.gate      = els.main.querySelector("[data-vault-gate]");
    /* 庫房名字：並排版寫在主欄標頭，彈窗版寫在彈窗標題列（那裡捲不走，內文就不重複）。 */
    els.title     = els.main.querySelector("[data-vault-title]") || els.modalTitle;
    els.note      = els.main.querySelector("[data-vault-note]");
    els.door      = els.main.querySelector("[data-vault-door]");
    els.reach     = els.main.querySelector("[data-vault-reach]");
    els.doorRules = els.main.querySelector("[data-vault-rules]");
    els.doorAny   = els.main.querySelector("[data-vault-any]");
    els.doorNum   = els.main.querySelector("[data-vault-num]");
    els.doorOf    = els.main.querySelector("[data-vault-of]");
    els.doorBar   = els.main.querySelector("[data-vault-bar]");
    els.doorLegend = els.main.querySelector("[data-vault-legend]");
    els.doorBreakdown = els.main.querySelector("[data-vault-breakdown]");
    els.doorKeys  = els.main.querySelector("[data-vault-keys]");
    els.drawer    = document.querySelector("[data-vault-drawer]");
    els.drawerBody = els.drawer.querySelector("[data-vault-drawerbody]");
    els.drawerTitle = els.drawer.querySelector(".drawer__title");
    els.gridWrap  = els.main.querySelector(".vault-gridwrap");
    els.grid      = els.main.querySelector("[data-vault-grid]");
    els.gridMeta  = els.main.querySelector("[data-vault-gridmeta]");
    els.file      = els.main.querySelector("[data-vault-file]");
    els.menu      = document.querySelector("[data-vault-rulemenu]");
    /* 三分頁（2026-10-09）。保存檔 media-vault-popup.html 沒有這些節點，全部可以是 null，
       用到的地方各自判斷。 */
    els.tablist   = els.main.querySelector("[data-vault-tabs]");
    els.tabs      = els.tablist ? Array.prototype.slice.call(els.tablist.querySelectorAll("[data-vault-tab]")) : [];
    els.panels    = Array.prototype.slice.call(els.main.querySelectorAll("[data-vault-panel]"));
    els.tabCount  = els.main.querySelector("[data-vault-tabcount]");
    els.ovViewer  = els.main.querySelector("[data-vault-ov-viewer]");
    els.ovItems   = els.main.querySelector("[data-vault-ov-items]");
    els.ovKeys    = els.main.querySelector("[data-vault-ov-keys]");
    els.ovKinds   = els.main.querySelector("[data-vault-ov-kinds]");
    els.ovTasks   = els.main.querySelector("[data-vault-ov-tasks]");
    els.reachline = els.main.querySelector("[data-vault-reachline]");
    els.noRules   = els.main.querySelector("[data-vault-norules]");
    els.noRulesTitle = els.main.querySelector("[data-vault-norules-title]");
    els.rulesSum  = els.main.querySelector("[data-vault-rules-sum]");
    els.keylist   = els.main.querySelector("[data-vault-keylist]");
    els.shareLink = els.main.querySelector("[data-vault-sharelink]");
    /* D477（2026-10-23）：庫房狀態與排程、解開紀錄、指定一位粉絲、上鎖卡。保存檔沒有這些節點。 */
    els.status    = els.main.querySelector("[data-vault-status]");
    els.actions   = els.main.querySelector("[data-vault-actions]");
    els.none      = document.querySelector("[data-vault-none]");
    els.reachLabel = els.main.querySelector("[data-vault-reach-label]");
    els.reachTrial = els.main.querySelector("[data-vault-trial]");
    els.ovUnlock  = els.main.querySelector("[data-vault-ov-unlock]");
    els.ovUnlockNote = els.main.querySelector("[data-vault-ov-unlock-note]");
    els.ovItemsTrial = els.main.querySelector("[data-vault-ov-items-trial]");
    els.linkHint  = els.main.querySelector("[data-vault-link-hint]");
    els.linkOff   = els.main.querySelector("[data-vault-link-off]");
    els.keysOff   = els.main.querySelector("[data-vault-keys-off]");
    els.viewAs    = els.main.querySelector("[data-vault-viewas]");
    els.viewAsTitle = els.viewAs && els.viewAs.querySelector(".alert__title");
    els.viewAsDesc  = els.viewAs && els.viewAs.querySelector(".alert__desc");
    els.person    = document.querySelector("[data-vault-person]");
    els.personInput = els.person && els.person.querySelector("input");
    els.personResults = els.person && els.person.querySelector(".owner-lookup__results");
    els.pub       = document.querySelector("[data-vault-pub]");
    if (els.pub) {
      els.pubTitle = els.pub.querySelector("[data-pub-title]");
      els.pubChecks = els.pub.querySelector("[data-pub-checks]");
      els.pubListField = els.pub.querySelector("[data-pub-listfield]");
      els.pubListTime = els.pub.querySelector("[data-pub-listtime]");
      els.pubListErr = els.pub.querySelector("[data-pub-listerr]");
      els.pubRule = els.pub.querySelector("[data-pub-rule]");
      els.pubUnlistSwitch = els.pub.querySelector("[data-pub-unlist]");
      els.pubUnlistFields = els.pub.querySelector("[data-pub-unlistfields]");
      els.pubUnlistTime = els.pub.querySelector("[data-pub-unlisttime]");
      els.pubUnlistErr = els.pub.querySelector("[data-pub-unlisterr]");
      els.pubOk = els.pub.querySelector("[data-pub-ok]");
      els.pubRestore = els.pub.querySelector("[data-pub-restore]");
    }
    els.cf        = document.querySelector("[data-vault-confirm]");
    if (els.cf) {
      els.cfTitle = els.cf.querySelector("[data-cf-title]");
      els.cfBody = els.cf.querySelector("[data-cf-body]");
      els.cfOk = els.cf.querySelector("[data-cf-ok]");
      els.cfCancel = els.cf.querySelector("[data-cf-cancel]");
    }

    V.applySchedules();
    render();
    wire();
    if (window.applyI18n) {
      if (els.rail) window.applyI18n(els.rail);
      window.applyI18n(els.lens);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
