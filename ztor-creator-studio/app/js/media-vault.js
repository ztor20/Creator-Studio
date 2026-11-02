/* media-vault.js — Media Vault 的渲染與互動。
   ============================================================
   版面契約（見 ds-components/media-vault.css 的檔頭）：
     側欄＝庫房清單，每列掛一個鑰匙數；主欄＝門條 ＋ 內容格。
     所有人數都向 vault-store.js 要，本檔一個數字都不自己算，
     也不快取——條件一改就重問，畫面上不會有算過一次就過期的數。

   三個刻意的行為決定：
     · 新增庫房就地做，不開 modal。只有一個必填欄位（名稱），為了問
       一個字把整個畫面蓋掉，是把中斷當成儀式。
     · 剛建立的庫房一種進庫方法都沒有＝「無條件」，上架後所有粉絲都能解鎖
       （D497，2026-11-02 取代原本「沒有條件就沒有人進得來」）。畫面直接寫出
       無條件，發布前再提醒一次「發布後所有粉絲都能解鎖」，只提醒、不擋。
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
  var state = { vaultId: V.vaults[0].id, viewer: "", person: null, itemId: null, openTab: "cond", renaming: false, wiz: null };
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
     該分頁 2026-11-02 已撤除。） */
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
      [tx("Added", "加入日期"), it.added || "—"],
      /* 查看／播放人數（F5，D497）：同一人重複不重複計；示範資料（UIA-323）。 */
      [L(it.kind === "image" ? "vault.plays.view" : "vault.plays.play"), L("vault.plays.n", { n: num(V.itemPlays(vault(), it)) })]
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
      return '<div class="mpreview mpreview--image mpreview--portrait vault-item__preview" data-feat="S106">' +
        '<div class="mpreview__stage">' + cover + "</div></div>";
    }
    var play = esc(L("vault.item.preview.play"));
    var len = durSec(it.dur);
    return '<div class="mpreview mpreview--' + it.kind + ' mpreview--portrait vault-item__preview" data-feat="S106" data-preview data-len="' + len + '">' +
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
      if (item) out += targetFieldHtml("vt-product", tx("Product", "商品"), V.shopProducts(), task.target, null);
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
      /* 縮圖只取自圖片或影片（D497）；只有音檔的庫房沒有縮圖、改放音檔圖示，空庫房放圖片圖示——庫房本身不另設圖示或徽章。 */
      var mix = V.counts(v);
      var fallback = mix.audio ? "music" : "image";
      var mixText = v.items.length ? L("vault.mix", { i: mix.image, c: mix.clip, a: mix.audio }) : L("vault.mix.none");
      /* 檢視器開著時，人數改成「這一級裡有幾個人打得開」，不是全站人數（「以一般粉絲檢視」卻顯示 653，
         會讓人以為那 653 個都是一般粉絲）。打不開＝該級一個人都進不來；指定一位粉絲（D477）只剩兩種答案：進得了、上鎖。 */
      var reach = lz.kind === "tier" ? V.reachInTierAll(v, lz.tier) : V.reachAll(v);
      var locked = lensLocked(v, lz);
      var who = locked ? icon("lock", "ztor-icon--xs") + esc(L("vault.st.locked"))
        : lz.kind === "person" ? esc(L("vault.rail.in"))
        : esc(L(V.isListed(v) ? "vault.rail.people" : "vault.rail.people.trial", { n: num(reach) }));
      var on = v.id === state.vaultId;
      return '<button type="button" class="vault-list__row' + (on ? " vault-list__row--active" : "") + (locked ? " vault-list__row--dim" : "") + '" data-vault="' + v.id + '"' + (on ? ' aria-current="true"' : "") + ">" +
        '<span class="vault-list__cover">' + (cover ? '<img src="' + esc(cover) + '" alt="" loading="lazy">' : icon(locked ? "lock" : fallback)) + "</span>" +
        '<span class="vault-list__text"><span class="vault-list__name">' + esc(vaultName(v)) + "</span>" +
          '<span class="vault-list__mix">' + esc(mixText) + "</span>" +
          /* 第二行一條龍：狀態圓點＋狀態字（排了時間的帶時鐘）・人數。狀態屬 S112，不在版本內時只剩人數。 */
          '<span class="vault-list__meta"><span class="vault-list__st vault-list__st--' + v.status + '" data-feat="S112"><i class="vault-list__dot"></i>' +
            esc(L("vault.status." + v.status)) + (V.isScheduled(v) ? icon("clock", "ztor-icon--xs") : "") + "</span>" +
          '<span class="vault-list__sep" data-feat="S112">·</span><span>' + who + "</span></span></span></button>";
    }).join("");

    if (els.list) els.list.innerHTML = html;
    /* 標題列右側是「這些人數是對誰算的」的說明：沒開檢視器時是庫房數，開了就換成那一級的母體大小，否則人數沒有分母。 */
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
    if (window.ztorDevState && window.ztorDevState.regate) window.ztorDevState.regate();
  }

  /* ── 門條 ───────────────────────────────────────────────── */
  /* 一條條件晶片。移除鈕是每個 chip 自己的按鈕，不是列尾一個共用的垃圾桶
     ——刪掉「哪一條」必須在按下去之前就確定。座標是「第幾組:第幾條」。 */
  function ruleChip(r, gi, ri, removable) {
    var l = V.ruleLabel(r);
    var text = r.t === "tier"
      ? '<span class="vault-rule__verb">' + tx("Tier", "分級") + " ≥ </span>" + esc(tierName(r.v))
      : l.solo ? esc(V.t(l.text))
      : '<span class="vault-rule__verb">' + esc(V.t(l.verb)) + " · </span>" + esc(V.t(l.text));
    return '<span class="chip chip--static' + (removable ? " chip--removable" : "") + ' vault-rule">' +
      icon(l.icon) + text +
      (removable
        ? '<button type="button" class="chip__remove" data-rule-remove="' + gi + ":" + ri + '" ' +
          'aria-label="' + esc(tx("Remove condition", "移除條件")) + '">' + icon("x") + "</button>"
        : "") +
      "</span>";
  }

  /* 一種進得來的方法的人數：同一支 reachAll，只餵「只有這一組、沒有鑰匙」的庫房。空的方法誰都不放行，不寫人數。 */
  function methodReach(g) {
    if (!g || !(g.items || []).length) return null;
    return V.reachAll({ rules: [g], keys: [] });
  }

  /* ── 開啟方式（2026-11-02 改版，note/媒體庫UX重新規劃.md 3.24–3.29）──────────
     只有兩種：條件開啟（符合任一種進庫方法就能開）｜鑰匙開啟（拿到鑰匙就能開，不看條件），用底線式分頁切換。
     頁面與建立流程第 3 步畫的是同一份（openHtml），所以事件一律掛在 document、靠 .vault-open 認出來。
     鑰匙（S123）不在版本內時只剩條件開啟，不出分頁列。 */
  function methodHtml(g, gi) {
    var items = g.items || [];
    var n = methodReach(g);
    return (gi ? '<div class="vault-door__sep"><span>' + esc(L("vault.ac.or")) + "</span></div>" : "") +
      '<div class="vault-way__item"><div class="vault-way__item-head"><span class="vault-way__item-name">' + esc(L("vault.ac.method", { n: gi + 1 })) + "</span>" +
        (n == null ? "" : '<span class="vault-way__item-n' + (n ? "" : " vault-way__item-n--zero") + '">' +
          L(n === 1 ? "vault.ac.method.count.one" : "vault.ac.method.count", { n: num(n) }) + "</span>") + "</div>" +
      (items.length >= 2 ? '<div class="vault-door__all">' + esc(L("vault.ac.all")) + "</div>" : "") +
      '<div class="vault-door__chips">' + items.map(function (r, ri) { return ruleChip(r, gi, ri, true); }).join("") +
        /* 一種方法最多 10 個條件（D497）：到上限「再加一個」停用，旁邊一句說明上限。 */
        (items.length >= V.limits.items
          ? '<button type="button" class="vault-door__add" disabled aria-label="' + esc(L("vault.ac.add.aria")) + '">' + icon("plus") + esc(L("vault.ac.add")) + "</button>" +
            '<span class="vault-way__note">' + esc(L("vault.ac.limit.items", { n: V.limits.items })) + "</span>"
          : '<button type="button" class="vault-door__add" data-rule-add="' + gi + '" aria-label="' + esc(L("vault.ac.add.aria")) + '">' +
            icon("plus") + esc(L("vault.ac.add")) + "</button>") + "</div></div>";
  }
  function condWayHtml(f) {
    var gs = f.rules || [];
    var nRules = V.ruleCount(f);
    /* 無條件（D497）：一種進庫方法都沒設＝全員可解。寫出來，再給一顆加條件的按鈕。 */
    if (!gs.length) {
      return '<div class="vault-way"><div class="vault-way__head"><p class="vault-way__desc">' + esc(L("vault.open.cond.none", { n: num(V.totalFans) })) + "</p></div>" +
        '<div class="vault-way__empty"><button type="button" class="btn btn--outline" data-rule-add="0">' +
        icon("plus") + "<span>" + esc(L("vault.open.cond.add")) + "</span></button></div></div>";
    }
    /* 一座庫房最多 5 種方法（D497）：到上限「再加一種方法」停用，旁邊一句說明上限。 */
    var full = gs.length >= V.limits.methods;
    return '<div class="vault-way"><div class="vault-way__head"><p class="vault-way__desc">' + esc(L("vault.open.cond.desc")) + "</p>" +
        (nRules ? '<span class="vault-way__n">' + esc(L("vault.open.cond.n", { n: num(V.reachSplit(f).byRule) })) + "</span>" : "") + "</div>" +
      '<div class="vault-way__list">' + gs.map(methodHtml).join("") + "</div>" +
      '<div class="vault-way__actions"><button type="button" class="btn btn--ghost btn--sm vault-way__more"' + (full ? " disabled" : " data-group-add") + ">" + icon("plus") + "<span>" + esc(L("vault.ac.addway")) + "</span></button>" +
        (full ? '<span class="vault-way__note">' + esc(L("vault.ac.limit.methods", { n: V.limits.methods })) + "</span>" : "") + "</div></div>";
  }
  function keyWayHtml(f) {
    var keys = (f.keys || []).slice().reverse();
    var stats = V.keyStats(f);
    var small = keys.length ? " btn--sm" : "";
    var gift = '<button type="button" class="btn btn--outline' + small + '" data-vault-share="new" data-share-intent="gift">' + icon("gift") + "<span>" + esc(L("vault.ac.direct.gift")) + "</span></button>";
    var nfc = '<button type="button" class="btn btn--outline' + small + '" data-vault-share="new" data-share-intent="nfc">' + icon("scan") + "<span>" + esc(L("vault.ac.direct.nfc")) + "</span></button>";
    /* 空的時候只有兩顆入口按鈕；有鑰匙之後所有動作收在清單下面同一排，最右「管理鑰匙」開抽屜看全部鑰匙與連結。 */
    if (!keys.length) return '<div class="vault-way"><div class="vault-way__actions">' + gift + nfc + "</div></div>";
    var list = keys.map(function (k) {
      return '<div class="vault-key' + (k.revoked ? " vault-key--revoked" : "") + '"><span class="vault-key__main"><span class="vault-key__code">' + esc(k.code) + "</span>" +
        '<span class="vault-key__label">' + esc(V.t(k.label)) + "</span></span>" +
        '<span class="vault-key__uses">' + esc(L("vault.key.claimed", { c: num((k.claimed || []).length), u: num(k.uses) })) + "</span>" +
        (k.revoked
          ? '<span class="badge badge--neutral">' + esc(L("vault.ac.keys.revoked")) + "</span><span></span>"
          : '<button type="button" class="btn btn--icon btn--ghost btn--sm" data-vkey-copy="' + esc(V.keyUrl(k.code)) + '" aria-label="' + esc(L("vault.ac.link.copy")) + '" title="' + esc(L("vault.ac.link.copy")) + '">' + icon("copy") + "</button>" +
            '<button type="button" class="btn btn--ghost btn--sm" data-vkey-revoke="' + esc(k.id) + '">' + esc(L("vault.ac.keys.revoke")) + "</button>") +
        "</div>";
    }).join("");
    return '<div class="vault-way"><div class="vault-way__head"><p class="vault-way__desc">' + esc(L("vault.open.key.desc")) + "</p>" +
        (stats.live ? '<span class="vault-way__n">' + esc(L("vault.open.key.n", { n: num(V.reachSplit(f).byKey) })) + "</span>" : "") + "</div>" +
      '<div class="vault-way__list">' + list + "</div>" +
      '<div class="vault-way__actions">' + gift + nfc +
        '<button type="button" class="btn btn--ghost btn--sm vault-way__manage" data-vault-share="keys">' + icon("key") + "<span>" + esc(L("vault.btn.share-links")) + "</span></button></div></div>";
  }
  function openHtml(f) {
    var keysOn = V.keysOn();
    var tab = keysOn && state.openTab === "key" ? "key" : "cond";
    var nCond = (f.rules || []).filter(function (g) { return (g.items || []).length; }).length;
    var nKeys = V.keyStats(f).live;
    function tabBtn(id, label, n) {
      return '<button type="button" class="tabs__item' + (tab === id ? " tabs__item--active" : "") + '" role="tab" aria-selected="' + (tab === id) + '" data-vault-opentab="' + id + '">' +
        esc(label) + (n ? ' <span class="tabs__item-count">' + n + "</span>" : "") + "</button>";
    }
    return '<div class="vault-open__head"><div class="tabs vault-open__tabs" role="tablist" aria-label="' + esc(L("vault.open.aria")) + '">' +
        tabBtn("cond", L("vault.open.cond"), nCond) + (keysOn ? tabBtn("key", L("vault.open.key"), nKeys) : "") + "</div>" +
        '<button class="explain-btn" type="button" data-explain="explain-vault-rules" aria-label="' + esc(L("vault.ac.rules.help")) + '">' + icon("info") + "</button></div>" +
      '<div class="tab-panel tab-panel--active" role="tabpanel">' + (tab === "key" ? keyWayHtml(f) : condWayHtml(f)) + "</div>";
  }

  /* ── 內容：灰底容器＋固定三欄直式卡片，最後一張是「添加」 ─────────────────────
     卡片只回答兩件事：這是什麼、誰拿得到。整張卡就是按鈕（點開單件設定抽屜）；名稱、任務、大彩蛋、刪除都在那裡改。
     不分組、沒有篩選、沒有批次；影片與音檔靠縮圖上的時長標記分辨。 */
  function cardHtml(f, it, lz) {
    var task = V.taskOf(it);
    var info = taskInfo(task);
    var under = !!task && task.type === "tier" && V.tierRank[task.tier] < V.tierRank[V.tierFloor(f)];
    var low = lz.kind !== "none" && (lensLocked(f, lz) || lensItem(f, it, lz).st === "condition");
    var status;
    if (lz.kind !== "none") status = lensTag("plain", f, it, lz);
    else {
      /* 卡片上的人數＝查看／播放人數（F5，D497；👁 N，同一人不重複計）。目前看得到與累計解開過（D477）留在提示與單件設定裡。 */
      var n = V.itemViewers(f, it), e = V.itemEver(f, it) || 0, pv = V.itemPlays(f, it);
      var tip = L(it.kind === "image" ? "vault.tag.plays.view" : "vault.tag.plays.play", { n: num(pv) }) + " · " +
        (n == null ? L("vault.tag.viewers.tbc") : L(V.isListed(f) ? "vault.tag.viewers" : "vault.tag.viewers.trial", { n: num(n), e: num(e) }));
      status = '<span class="vault-card__n" title="' + esc(tip) + '">' + icon("eye", "ztor-icon--xs") + num(pv) + "</span>";
    }
    var taskLine = '<span class="vault-card__task' + (info ? " vault-card__task--set" : "") + (under ? " vault-card__task--warn" : "") + '" data-feat="S86">' +
      icon(info ? info.icon : "circle", "ztor-icon--xs") + '<span class="vault-card__task-t">' + esc(info ? info.text : L("vault.ov.task.none")) + "</span></span>";
    var thumb = it.img ? '<img src="' + esc(it.img) + '" alt="" loading="lazy">' : icon(KIND[it.kind].icon, "ztor-icon--lg");
    return '<div class="vault-card' + (low ? " is-locked" : "") + '" data-item="' + it.id + '" role="button" tabindex="0" aria-label="' + esc(V.t(it.name)) + '">' +
      '<div class="vault-card__thumb">' + thumb +
        (it.dur && it.kind !== "image" ? '<span class="vault-card__dur">' + (it.kind === "clip" ? icon("play", "ztor-icon--xs") : "") + esc(it.dur) + "</span>" : "") +
        (it.grand ? '<span class="vault-card__grand" data-feat="S121" title="' + esc(tx("Grand surprise", "大彩蛋")) + '">' + icon("star", "ztor-icon--xs") + "</span>" : "") + "</div>" +
      '<div class="vault-card__body"><div class="vault-card__name">' + esc(V.t(it.name)) + '</div><div class="vault-card__line">' + taskLine + status + "</div></div></div>";
  }
  function addCardHtml() {
    return '<div class="vault-card vault-card--add" data-vault-upload role="button" tabindex="0" aria-label="' + esc(L("vault.pool.add.aria")) + '">' +
      '<div class="vault-card__thumb">' + icon("plus", "ztor-icon--lg") + '</div><div class="vault-card__body"><div class="vault-card__name">' + esc(L("vault.pool.add")) +
      '</div><div class="vault-card__line">&nbsp;</div></div></div>';
  }
  function poolHtml(f) {
    var lz = lens(), items = [];
    GROUPS.forEach(function (g) { f.items.forEach(function (it) { if (it.kind === g.kind) items.push(it); }); });
    return items.map(function (it) { return cardHtml(f, it, lz); }).join("") + addCardHtml();
  }

  /* ── 標頭（F10，D477）──────────────────────────────────────────
     名稱點一下就地改名（輸入框與名稱同字級、寬度跟著字量，徽章不會換行）；狀態與排程；
     右側：分享（彈窗，F9）、依狀態的主要動作、⋯（只剩刪除）。
     草稿：發布｜排程中：取消排程｜上架中：下架｜已下架：重新上架。上架中的刪除按下去會說明要先下架。 */
  function fitRename(inp) {
    var m = document.createElement("span"), cs = getComputedStyle(inp);
    m.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font:" + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    m.textContent = inp.value || " ";
    document.body.appendChild(m);
    inp.style.width = Math.ceil(m.getBoundingClientRect().width) + 2 + "px";
    document.body.removeChild(m);
  }
  function renderHead(f) {
    var sched = schedText(f);
    var empty = !f.items.length;
    var name = state.renaming
      ? '<input class="input vault-bar__nameinput" data-vault-rename value="' + esc(vaultName(f)) + '" aria-label="' + esc(L("vault.name.aria")) + '">'
      : '<button type="button" class="vault-bar__name" data-vault-act="rename" title="' + esc(L("vault.name.rename")) + '">' + esc(vaultName(f)) + "</button>";
    function btn(cls, act, ic, key, disabled) {
      return '<button type="button" class="btn ' + cls + '" data-feat="S112" data-vault-act="' + act + '"' + (disabled ? ' disabled title="' + esc(L("vault.act.publish.need")) + '"' : "") + ">" + icon(ic) + "<span>" + esc(L(key)) + "</span></button>";
    }
    var primary;
    if (V.isScheduled(f)) primary = btn("btn--outline", "cancel", "x", "vault.act.cancel");
    else if (f.status === "draft") primary = btn("btn--primary", "publish", "send", "vault.act.publish", empty);
    else if (f.status === "unlisted") primary = btn("btn--primary", "relist", "eye", "vault.act.relist", empty);
    else primary = btn("btn--outline", "unlist", "eye-off", "vault.act.unlist");
    els.head.innerHTML =
      '<div class="vault-bar__title">' + name + statusBadge(f).replace("<span ", '<span data-feat="S112" ') +
        (sched ? '<span class="vault-bar__sched" data-feat="S112">' + icon("calendar-clock", "ztor-icon--xs") + esc(sched) + "</span>" : "") + "</div>" +
      '<div class="vault-bar__actions">' +
        '<button type="button" class="btn btn--outline" data-feat="S106" data-vault-act="share">' + icon("share") + "<span>" + esc(L("vault.act.share")) + "</span></button>" + primary +
        '<details class="dropdown" data-feat="S112"><summary class="btn btn--icon btn--outline" aria-label="' + esc(L("vault.act.more")) + '">' + icon("more-horizontal") + "</summary>" +
          '<div class="dropdown__menu" role="menu"><button type="button" class="dropdown__item dropdown__item--danger" role="menuitem" data-vault-act="delete">' + icon("trash-2") + esc(L("vault.act.delete")) + "</button></div></details>" +
      "</div>";
    var ri = els.head.querySelector("[data-vault-rename]");
    if (ri) { fitRename(ri); ri.focus(); ri.select(); }
  }

  /* ── 成效三格（F3）：現在打得開、累計解開過、目前看得到（未上架寫「上架後」）─────────
     檢視身分開著時第一格換成那個角度的結果。每件內容的兩個數字在各自的卡片與單件設定裡。 */
  function renderBento(f) {
    var lz = lens(), listed = V.isListed(f);
    var u = V.vaultUnlocks(f);
    var v1, l1, s1, extra = "", plays = false;
    if (lz.kind === "tier") {
      var tier = V.tiers.filter(function (x) { return x.key === lz.tier; })[0];
      v1 = num(V.reachInTierAll(f, lz.tier)) + '<span class="vault-bento__of"> / ' + num(tier ? tier.count : 0) + "</span>";
      l1 = L("vault.bento.tier", { who: tierName(lz.tier) });
    } else if (lz.kind === "person") {
      v1 = esc(L(lensLocked(f, lz) ? "vault.st.locked" : "vault.rail.in"));
      l1 = lz.fan.name;
    } else {
      /* 已解鎖人數（F3，D497）：格內常駐「N 位粉絲・佔全部 M 位的 X%」；標題依狀態。
         四分級「已／總」改成滑過或 focus 這一格才浮出的提示（D505，使用者裁決 2026-11-02：次要資訊不常駐），
         沿用站上的 .stock-tip--anchored（與商店設定優惠碼「範圍」欄同一顆貼格浮卡）。
         四級的「已」加起來一定等於 N（同一份母體逐級算，見 vault-store reachInTierAll）。 */
      var N = V.reachAll(f), M = V.totalFans;
      v1 = num(N) + '<span class="vault-bento__of"> ' + esc(L("vault.ov.unlocked.unit")) + "</span>";
      l1 = L(listed ? "vault.ov.unlocked" : "vault.ov.unlocked.trial");
      s1 = L("vault.ov.unlocked.of", { m: num(M), p: M ? Math.round(N / M * 100) : 0 });
      extra = '<div class="stock-tip__pop" role="tooltip" id="vault-tier-tip">' + V.tiers.map(function (t) {
        return '<div class="stock-tip__row"><span class="stock-tip__name">' + esc(tierName(t.key)) + '</span><span class="stock-tip__qty">' + num(V.reachInTierAll(f, t.key)) + "/" + num(t.count) + "</span></div>";
      }).join("") + "</div>";
      /* 查看／播放（D506，使用者裁決 2026-11-02：次要資訊不常駐）：原本成效格下面那張常駐卡，改成點這一格開彈窗。
         掛在第一格是因為每件的百分比分母就是這格的已解鎖人數；滑過仍是上面的分級提示，點擊才開彈窗，兩者並存。
         只在預設檢視開放——檢視身分開著時這格換成那個角度的結果，跟全體的查看／播放對不上。 */
      plays = true;
    }
    function tile(feat, val, label, sub, more, open) {
      var cls = "vault-bento__tile" + (more ? " stock-tip stock-tip--anchored" : "") + (open ? " vault-bento__tile--open" : "");
      var attrs = (more ? ' tabindex="0" aria-describedby="vault-tier-tip"' : "") +
        (open ? ' role="button" aria-haspopup="dialog" data-vault-plays-open' : "");
      return '<div class="' + cls + '"' + attrs + ' data-feat="' + feat + '"><div class="vault-bento__v">' + val + '</div><div class="vault-bento__l">' + esc(label) +
        (open ? icon("chevron-right", "ztor-icon--xs vault-bento__go") : "") + "</div>" +
        (sub ? '<div class="vault-bento__s">' + esc(sub) + "</div>" : "") + (more || "") + "</div>";
    }
    els.bento.innerHTML = tile("S93", v1, l1, s1, extra, plays) +
      tile("S114", num(u.ever), L("vault.ov.unlock.ever"), L("vault.bento.ever.s")) +
      tile("S114", num(u.now), L(listed ? "vault.ov.unlock.now" : "vault.ov.unlock.now.trial"), L("vault.bento.now.s"));
    els.bento.querySelectorAll(".stock-tip").forEach(wireTip);
    var go = els.bento.querySelector("[data-vault-plays-open]");
    if (go) {
      go.addEventListener("click", function () { openPlays(f); });
      go.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPlays(f); }
      });
    }
  }

  /* 成效格的滑過提示：滑鼠移入、鍵盤 focus（觸控點一下也會 focus）時打開，移出、失焦或按 Esc 收起。
     開向照商店設定那顆：觸發格在視窗下半就往上開（.stock-tip--up）。 */
  function wireTip(trigger) {
    function open() {
      trigger.classList.toggle("stock-tip--up", trigger.getBoundingClientRect().top > window.innerHeight / 2);
      trigger.classList.add("is-open");
    }
    function close() { trigger.classList.remove("is-open"); }
    trigger.addEventListener("mouseenter", open);
    trigger.addEventListener("mouseleave", function () { if (document.activeElement !== trigger) close(); });
    trigger.addEventListener("focusin", open);
    trigger.addEventListener("focusout", close);
    trigger.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* 每件內容的查看／播放（F3，D497；D506 起改在彈窗裡）：每件一條量條（查看／播放過該件的人 ÷ 已解鎖本庫房的人）＋累計人數。
     沿用 meter-list（名稱｜量條｜數字一線）＋ stock-bar；彈窗沿用本頁的確認視窗殼（openConfirm，只留一顆關閉）。
     人數是示範資料（UIA-323）。庫房沒有內容時給空狀態，不留白。 */
  function playsBody(f) {
    var items = [];
    GROUPS.forEach(function (g) { f.items.forEach(function (it) { if (it.kind === g.kind) items.push(it); }); });
    if (!items.length) {
      return '<div class="empty-card"><span class="empty-card__icon">' + icon("eye") + "</span>" +
        '<p class="empty-card__title">' + esc(L("vault.plays.empty.title")) + "</p>" +
        '<p class="empty-card__text">' + esc(L("vault.plays.empty.text")) + "</p></div>";
    }
    var N = V.reachAll(f);
    return '<p class="vault-confirm__p">' + esc(L("vault.plays.total", { n: num(V.vaultPlays(f)) })) + "</p>" +
      '<div class="meter-list">' + items.map(function (it) {
        var pv = V.itemPlays(f, it);
        var pct = N ? Math.min(100, Math.round(pv / N * 100)) : 0;
        return '<div class="meter-list__row"><span class="meter-list__name"><span>' + esc(V.t(it.name)) + "</span></span>" +
          '<span class="stock-bar"><span class="stock-bar__fill" style="width:' + pct + '%"></span></span>' +
          '<span class="meter-list__num">' + L("vault.plays.row", { n: "<b>" + num(pv) + "</b>", p: pct }) + "</span></div>";
      }).join("") + "</div>";
  }
  function openPlays(f) {
    openConfirm({ title: L("vault.plays.title"), body: playsBody(f), ok: L("vault.plays.close"), noCancel: true, quiet: true });
  }

  /* 帳號下沒有任何庫房（頁面狀態「無庫房」）：主欄退位，只留建立的引導。 */
  function renderNone() {
    var none = !V.vaults.length;
    if (els.none) els.none.hidden = !none;
    els.main.hidden = none;
    return none;
  }

  /* 主欄全部重畫。建立流程開著時，第 2、3 步也跟著重畫（上傳、改任務、改條件都從這裡走）。 */
  function renderMain() {
    if (renderNone()) return;
    var f = vault();
    renderHead(f);
    renderBento(f);
    els.grid.innerHTML = poolHtml(f);
    els.open.innerHTML = openHtml(f);
    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.main);
    if (state.wiz) renderWizard(true);
    /* 卡片、成效格上的版本標記是畫完才出現的節點，要再跑一次版本閘。 */
    if (window.ztorDevState && window.ztorDevState.regate) window.ztorDevState.regate();
  }

  /* ── 分享連結彈窗（F9，D475）：標頭「分享」打開。網址格式是示範（UIA-295）。
     草稿與已下架不能分享（F9 其他狀態，D477 推導 2）：連結列停用，說明句換成原因。 */
  function paintSharePop(f) {
    var listed = V.isListed(f);
    if (els.shareLink && window.linkField) window.linkField.setValue(els.shareLink, "https://ztor.com/v/" + f.id);
    els.shareLink.classList.toggle("linkf--disabled", !listed);
    var copyBtn = els.shareLink.querySelector("[data-linkf-copy]");
    if (copyBtn) copyBtn.disabled = !listed;
    els.linkHint.hidden = !listed;
    /* 鑰匙（S123）不在版本內：說明句不提「持有鑰匙」。data-i18n 一起換，語言切換時才不會被蓋回去。 */
    var hintKey = V.keysOn() ? "vault.ac.link.hint" : "vault.ac.link.hint.nk";
    els.linkHint.setAttribute("data-i18n", hintKey);
    els.linkHint.textContent = L(hintKey);
    els.linkOff.hidden = listed;
    els.linkOff.textContent = listed ? "" : L(f.status === "draft" ? "vault.ac.link.off.draft" : "vault.ac.link.off.unlisted");
  }
  function openSharePop() {
    paintSharePop(vault());
    els.sp.hidden = false;
    document.body.classList.add("is-modal-open");
    lastFocus = document.activeElement;
    var b = els.sp.querySelector("[data-linkf-copy]");
    if (b && !b.disabled) b.focus();
  }
  function closeSharePop() {
    if (!els.sp || els.sp.hidden) return;
    els.sp.hidden = true;
    document.body.classList.remove("is-modal-open");
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  /* ── 新增庫房：三步建立流程（取名 → 放內容 → 誰開得了）────────────────────
     版型照站上的建立專案、建立活動（全畫面 .wizard）：頂列＝返回＋標題＋分段進度條＋已存草稿，
     中間內容，底列放上一步／繼續（第 3 步放存成草稿與發布）；不放粉絲預覽。
     第 1 步按「繼續」就建立草稿，之後隨時可以離開，庫房留在草稿。第 2、3 步畫的跟頁面是同一份。 */
  var WIZ_STEPS = ["name", "items", "open"];
  function openWizard() {
    state.wiz = { step: 1, vid: null };
    els.wiz.hidden = false;
    document.documentElement.classList.add("vault-wizard-open");
    renderWizard();
  }
  function closeWizard(silent) {
    var had = state.wiz && state.wiz.vid;
    state.wiz = null;
    els.wiz.hidden = true;
    document.documentElement.classList.remove("vault-wizard-open");
    renderRail(); renderMain();
    if (had && !silent && window.ztorToast) window.ztorToast.show(L("vault.wiz.toast.draft"), { tone: "success" });
  }
  function renderWizard(soft) {
    var w = state.wiz;
    if (!w || (soft && w.step === 1)) return;   /* 第 1 步的輸入框不重畫，打到一半的字才不會不見 */
    var f = w.vid ? vault() : null;
    var cur = w.step - 1;
    var wiz = els.wiz;
    var q = function (s) { return wiz.querySelector(s); };

    q("[data-wiz-sub]").textContent = f ? vaultName(f) : L("vault.wiz.sub.new");
    q("[data-wiz-saved]").hidden = !f;
    q("[data-wiz-progress]").innerHTML =
      '<div class="progress-stepper progress-stepper--segmented progress-stepper--anystep" style="--steps:3;--at:' + w.step + ";--progress:" + (cur / 3 * 100) + '%">' +
      '<div class="progress-stepper__track"><div class="progress-stepper__fill"></div></div><div class="progress-stepper__labels">' +
      WIZ_STEPS.map(function (k, i) {
        var cls = i < cur ? " progress-stepper__label--done" : i === cur ? " progress-stepper__label--current" : "";
        var st = i < cur ? icon("check") + esc(L("vault.wiz.step.done")) : esc(L(i === cur ? "vault.wiz.step.cur" : "vault.wiz.step.todo"));
        return '<span class="progress-stepper__label' + cls + '"' + (f ? ' role="button" tabindex="0" data-wiz-go="' + (i + 1) + '"' : "") + (i === cur ? ' aria-current="step"' : "") + ">" +
          "<span>" + esc(L("vault.wiz.s" + (i + 1))) + '</span><span class="progress-stepper__state">' + st + "</span></span>";
      }).join("") + "</div></div>";

    var n = w.step;
    var sub = n === 3 ? (V.keysOn() ? "vault.wiz.sub3" : "vault.wiz.sub3.nk") : "vault.wiz.sub" + n;
    var head = '<div class="wizard__step-head"><div class="wizard__step-head-titles"><h1 class="wizard__step-title">' + esc(L("vault.wiz.h" + n)) +
      '</h1><p class="wizard__step-sub">' + esc(L(sub)) + "</p></div></div>";
    var body;
    if (n === 1) {
      body = head + '<section class="form-section form-section--outlined"><div class="field"><label class="field__label" for="vault-wiz-name">' + esc(L("vault.wiz.name")) +
        ' <span class="field__req">*</span></label><input class="input" id="vault-wiz-name" data-wiz-name value="' + esc(w.draftName != null ? w.draftName : (f ? vaultName(f) : "")) + '" placeholder="' + esc(L("vault.wiz.name.ph")) + '"></div></section>';
    } else if (n === 2) {
      body = head + '<section class="vault-pool"><div class="vault-pool__grid" data-wiz-grid>' + poolHtml(f) + "</div></section>";
    } else {
      body = head + '<section class="vault-open" data-wiz-open>' + openHtml(f) + "</section>";
    }
    q("[data-wiz-body-wrap]").innerHTML = body;

    var hint = "", btns;
    function b(cls, attr, key, extra) { return '<button type="button" class="btn ' + cls + '" ' + attr + (extra || "") + ">" + esc(L(key)) + "</button>"; }
    if (n === 1) btns = b("btn--primary", 'data-wiz="next"', "vault.wiz.next1");
    else if (n === 2) btns = b("btn--outline", 'data-wiz-go="1"', "vault.wiz.prev") + (f.items.length ? b("btn--primary", 'data-wiz="next"', "vault.wiz.next2") : b("btn--outline", 'data-wiz="next"', "vault.wiz.skip"));
    else {
      var chk = V.publishCheck(f);
      if (chk.empty) hint = L("vault.wiz.hint.empty");
      else if (chk.noWay) hint = L(V.keysOn() ? "vault.wiz.hint.noway" : "vault.wiz.hint.noway.nk");
      else if (chk.open) hint = L("vault.wiz.hint.open");
      btns = b("btn--outline", 'data-wiz-go="2"', "vault.wiz.prev") + b("btn--outline", 'data-wiz="draft"', "vault.wiz.draft") +
        b("btn--primary", 'data-wiz="publish"', "vault.wiz.publish", chk.empty ? " disabled" : "");
    }
    q("[data-wiz-foot]").innerHTML = '<p class="wizard__bottom-hint' + (hint ? "" : " hidden") + '">' + esc(hint) + "</p>" + btns;

    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(wiz);
    if (window.ztorDevState && window.ztorDevState.regate) window.ztorDevState.regate();
    var nm = q("[data-wiz-name]");
    if (nm && document.activeElement !== nm) nm.focus();
  }
  function wizSaveName() {
    var nm = els.wiz.querySelector("[data-wiz-name]"), name = nm ? nm.value.trim() : "";
    if (name && state.wiz.vid) vault().custom = name;
    state.wiz.draftName = null;
  }
  function wizGo(step) {
    wizSaveName();
    state.wiz.step = step;
    renderRail();
    renderWizard();
    var sh = els.wiz.querySelector(".wizard__body"); if (sh) sh.scrollTop = 0;
  }
  function wizNext() {
    var w = state.wiz;
    if (w.step === 1) {
      var nm = els.wiz.querySelector("[data-wiz-name]"), name = nm ? nm.value.trim() : "";
      if (!name) {
        if (window.ztorToast) window.ztorToast.show(L("vault.wiz.name.req"), { tone: "error" });
        if (nm) nm.focus();
        return;
      }
      w.draftName = null;
      if (w.vid) vault().custom = name;
      else {
        var id = "f" + Date.now();
        /* 新庫房不帶任何進庫方法＝無條件，上架後全員可解（D497）；草稿，粉絲看不到（F1／F10，D477）。 */
        V.vaults.unshift({ id: id, icon: "package", status: "draft", custom: name, name: { en: name, zh: name }, note: { en: "", zh: "" }, rules: [], items: [] });
        state.vaultId = id; w.vid = id;
      }
      lastReach = null;
      renderRail(); renderMain();
    }
    wizGo(Math.min(3, w.step + 1));
  }

  /* 標頭的動作（F10，D477）：改名、分享、發布／重新上架、下架、取消排程、刪除。 */
  function headAct(b) {
    var act = b.getAttribute("data-vault-act"), f = vault();
    var dd = b.closest("details");
    if (dd) dd.removeAttribute("open");
    if (act === "rename") {
      state.renaming = true;
      renderHead(f);
      if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.head);
    }
    else if (act === "share") openSharePop();
    else if (act === "publish" || act === "relist") openPublish();
    else if (act === "unlist") askUnlist();
    else if (act === "cancel") doCancelSchedule();
    else if (act === "delete") askDeleteVault();
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
        : l.solo ? esc(V.t(l.text))
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
      var by = (w.open ? ['<span class="vault-viewas__way">' + esc(L("vault.vas.open")) + "</span>"] : []).concat(w.methods.map(function (gi) {
        return '<span class="vault-viewas__way">' + esc(L("vault.ac.method", { n: gi + 1 })) + ruleChipsRO(f.rules[gi]) + "</span>";
      }).concat(w.keys.map(function (k) {
        return '<span class="vault-viewas__way">' + icon("key") + esc(L("vault.vas.key", { code: k.code })) + "</span>";
      })));
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
    renderMain(); renderGate();
  }

  /* ── 發布／重新上架（F10，D477）──────────────────────────────────
     中央彈窗（Q27：編輯與新增用 .payout-modal）。版面沿用建立商品的上架區：
     並排兩張卡選「立刻上架／定時上架」→ 線框盒（上架日期與時間、分隔線、定時下架開關＋下架日期與時間）。
     發布前檢查放在最上面：沒有內容＝擋（確認鈕停用），沒有路進來＝提醒、可發布。 */
  var pub = { mode: "now", unlistOn: false, plan: null };
  /* D488（2026-10-29，修訂 D483；取代「恢復原本的排程／不恢復」兩選一）：重新上架時檢查下架時保存的下架日期與時間（上架時間不查）。
     媒體庫只有下架時間這一個要恢復，直接放進同一個對話框的定時下架欄位（不另跳一層，5.1.7.3 F10 交 UI）：
       還沒到 → 定時下架打開、欄位帶入保存的時間，按確認就恢復（不詢問；創作者也還能改，改了以新設的為準）。
       已過   → 同樣帶入，最上面用 partials/relist-restore.js 的 blockHTML 提示「已過、先改成未來的時間或關掉定時下架（清除）」，
                欄位亮錯、確認擋下，什麼都不改；創作者在欄位改好或關掉開關後提示收起、才能確認（ASSUMPTIONS 呈現假設）。
     媒體庫沒有 ListingState：檢查由 VaultStore.relistBlockers／restorableTimes 算，這裡自己組 plan 物件。 */
  function savedBlockPlan(f) {
    var items = V.relistBlockers ? V.relistBlockers(f) : [];
    return items.length ? { groups: [{ entity: f, name: vaultName(f), items: items }], any: true } : null;
  }
  /* 已過的保存時間還留在欄位裡、定時下架也還開著＝創作者還沒改 */
  function savedStillPassed() {
    return !!pub.plan && pub.unlistOn && els.pubUnlistTime && els.pubUnlistTime.value === pub.plan.groups[0].items[0].at;
  }
  function paintSaved(f) {
    if (!els.pubRestore) return;
    pub.plan = window.ZtorRelistRestore ? savedBlockPlan(f) : null;
    var ok = V.restorableTimes ? V.restorableTimes(f) : [];
    var at = pub.plan ? pub.plan.groups[0].items[0].at : (ok.length ? ok[0].at : "");
    if (at) { pub.unlistOn = true; els.pubUnlistTime.value = at; }
    els.pubRestore.innerHTML = pub.plan
      ? '<p class="vault-confirm__p">' + esc(L("vault.rr.blocked")) + "</p>" + window.ZtorRelistRestore.blockHTML(pub.plan, { T: function (k) { return k === "rr.times" ? L("vault.rr.times") : null; } })
      : "";
    els.pubRestore.hidden = !pub.plan;
  }
  function openPublish() {
    if (!els.pub) return;
    var f = vault();
    pub.mode = "now"; pub.unlistOn = false;
    els.pubTitle.textContent = L(f.status === "unlisted" ? "vault.pub.title.relist" : "vault.pub.title", { n: vaultName(f) });
    els.pubListTime.value = ""; els.pubUnlistTime.value = "";
    paintSaved(f);
    paintPublish();
    if (pub.plan) validatePublish(true);   /* D488：保存的下架時間已過——一打開就亮錯 */
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
      (chk.noWay ? alertRow("warning", "alert-triangle", L("vault.pub.check.noway.t"), L(V.keysOn() ? "vault.pub.check.noway.d" : "vault.pub.check.noway.d.nk")) : "") +
      /* 無條件（D497 推導）：提醒「發布後所有粉絲都能解鎖」，只提醒、不擋。 */
      (chk.open ? alertRow("warning", "users", L("vault.pub.check.open.t"), L("vault.pub.check.open.d")) : "");
    els.pubChecks.hidden = !(chk.empty || chk.noWay || chk.open);
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
    els.pubOk.disabled = chk.empty;
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
    if (els.pubRestore && pub.plan) els.pubRestore.hidden = !savedStillPassed();   /* D488：改好或關掉定時下架後提示收起 */
    return !errList && !errUnlist;
  }
  function confirmPublish() {
    var f = vault();
    if (V.publishCheck(f).empty) return;
    if (!validatePublish(true)) return;   /* D488：保存的下架時間已過時，欄位的「要晚於現在」就擋下 */
    var opt = {
      listAt: pub.mode === "schedule" ? els.pubListTime.value : null,
      unlistAt: pub.unlistOn ? els.pubUnlistTime.value : null
    };
    V.publish(f, opt);
    closePublish();
    if (state.wiz) closeWizard(true);
    lastReach = null;
    render();
    if (window.ztorToast) window.ztorToast.show(opt.listAt
      ? L("vault.toast.scheduled", { t: fmtWhen(opt.listAt) })
      : L("vault.toast.listed", { n: vaultName(f) }), { tone: "success" });
  }

  /* ── 確認視窗：下架、刪除、上架中要先下架（canonical 對話框殼，Pattern 5.1.11）──────
     刪除照破壞性確認的四段：動到哪一座 → 會發生什麼（幾位粉絲失去內容、鑰匙一併失效）→ 不可復原。
     下架可以再上架，但粉絲會看不到、排程會暫停（D483：保存起來；D488：重新上架時沒過的直接恢復、已過的要先改），所以照電子商店下架一樣先問一次。 */
  var confirmOk = null;
  function openConfirm(o) {
    if (!els.cf) { if (o.onOk) o.onOk(); return; }
    els.cfTitle.textContent = o.title;
    els.cfBody.innerHTML = o.body;
    els.cfOk.className = "btn " + (o.danger ? "btn--destructive" : o.quiet ? "btn--outline" : "btn--primary");
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
      /* 第二條講已設的下架時間會保存並暫停，重新上架時沒過就直接恢復、已過要先改（D483；D488）；
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
    renderRail(); renderMain();
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

    /* 五類可加的條件（D497）：分級、購買過（商品＋票券）、支持過（無選項，只有「曾支持過此藝人」）、
       出席過（含 Watch Party）、達成過（三項）。第六類「無條件」不是一條條件，是一種方法都不設的狀態。 */
    ["bought", "backed", "attended", "earned"].forEach(function (kind) {
      var grp = V.catalogue[kind];
      out += '<div class="vault-rulemenu__group" role="presentation">' + esc(V.t(grp.label)) + "</div>";
      out += grp.opts.map(function (o) {
        var n = V.reach([{ t: kind, v: o.id }]);
        return '<button type="button" role="menuitem" class="vault-rulemenu__opt" data-add="' + kind + ":" + o.id + '"' +
          (has(kind, o.id) ? " disabled" : "") + ">" + icon(o.ticket ? "ticket" : grp.icon) +
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

  /* 2026-11-02 撤除（墓碑）：`startDraft()`——側欄「新增庫房」就地長出一列輸入框。建立改走三步建立流程
     （openWizard／renderWizard，取名 → 放內容 → 誰開得了），入口仍是左欄那一顆「新增庫房」。 */

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

  /* 2026-11-02 撤除（墓碑）：`askDelete()`、`startRename()`——內容格子上就地確認刪除／就地改名。
     內容改成整張卡片都是按鈕、點開單件設定抽屜，改名（關閉時寫回）與刪除都在抽屜裡；
     .vault-tile__confirm／__rename 的樣式沒有呼叫端了，退場待元件巡檢。 */

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

    /* 建立庫房只有左欄這一個入口：進三步建立流程（取名 → 放內容 → 誰開得了）。 */
    if (els.newBtn) els.newBtn.addEventListener("click", openWizard);

    /* ── 標頭、開啟方式、內容卡片、建立流程 ───────────────────────────────
       頁面與建立流程的第 2、3 步畫的是同一份內容，所以事件掛在 document，靠 data 屬性與 .vault-open 認出來。 */
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-vault-act]");
      if (t && els.head.contains(t)) { headAct(t); return; }
      if (e.target.closest("[data-vault-upload]")) { els.file.click(); return; }
      t = e.target.closest("[data-vault-opentab]");
      if (t) { state.openTab = t.getAttribute("data-vault-opentab"); renderMain(); return; }

      var inOpen = e.target.closest(".vault-open");
      if (inOpen) {
        var f = vault();
        var add = e.target.closest("[data-rule-add]");
        if (add) {
          if (els.menu.hidden) {
            /* 條件要加進哪一種方法，是按下去的那一刻就決定的——選單本身不知道自己是被誰打開的，所以在這裡記下來。 */
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
          var doRemove = function () {
            /* 移除條件會讓人看不到：上架中先把當下看得到的人記進解開紀錄（F8，D477）。 */
            V.commitUnlocks(f);
            g.items.splice(ri, 1);
            /* 刪到空的方法自動消失（D497）：最後一種也拿掉，庫房回到「無條件」，畫面直接寫出全員可解並留一顆加條件的按鈕。 */
            if (!g.items.length) f.rules.splice(gi, 1);
            renderRail(); renderGate(); renderMain();
          };
          /* D500：這一刪會讓庫房變成無條件（一種方法都不剩）時，上架中先確認——確認後所有粉絲都能解鎖；
             取消就什麼都不動。草稿與已下架直接刪，畫面照「無條件」寫明全員可解，發布前提醒照舊。 */
          if (V.isListed(f) && f.rules.length === 1 && g.items.length === 1) {
            openConfirm({
              title: L("vault.open.confirm.title"),
              body: listHtml([esc(L("vault.open.confirm.li1")), esc(L("vault.open.confirm.li2"))]),
              ok: L("vault.open.confirm.ok"),
              onOk: doRemove
            });
            return;
          }
          doRemove();
          return;
        }
        if (e.target.closest("[data-group-add]")) {
          if (f.rules.length >= V.limits.methods) return;   /* 一座庫房最多 5 種方法（D497） */
          f.rules.push({ items: [] });
          renderMain();
          /* 新的方法是空的，直接把選單開在它的「再加一個」上——多開一種方法的意圖本來就是要放條件進去。 */
          var adders = (state.wiz && state.wiz.step === 3 ? els.wiz : els.main).querySelectorAll(".vault-open [data-rule-add]");
          var last = adders[adders.length - 1];
          if (last) { pendingGroup = f.rules.length - 1; openRuleMenu(last); }
          return;
        }
        var cp = e.target.closest("[data-vkey-copy]");
        if (cp) {
          copyLink(cp.getAttribute("data-vkey-copy"), null);
          if (window.ztorToast) window.ztorToast.show(tx("Link copied", "連結已複製"), { tone: "success" });
          return;
        }
        var rv = e.target.closest("[data-vkey-revoke]");
        if (rv) { revokeKey(rv.getAttribute("data-vkey-revoke")); return; }
      }

      /* 點在卡片上＝打開這一件的設定抽屜。 */
      var card = e.target.closest("[data-item]");
      if (card && (e.target.closest(".vault-pool"))) { openItem(card.getAttribute("data-item")); return; }

      /* 建立流程 */
      if (e.target.closest("[data-wiz-exit]")) { closeWizard(); return; }
      t = e.target.closest("[data-wiz-go]");
      if (t && state.wiz) { wizGo(parseInt(t.getAttribute("data-wiz-go"), 10)); return; }
      t = e.target.closest("[data-wiz]");
      if (t && state.wiz) {
        var a = t.getAttribute("data-wiz");
        if (a === "next") wizNext();
        else if (a === "draft") closeWizard();
        else if (a === "publish") openPublish();
        return;
      }

      /* 分享連結彈窗 */
      if (els.sp && !els.sp.hidden && (e.target.closest("[data-sp-close]") || e.target === els.sp)) closeSharePop();
    });
    /* 改名：Enter 存、Esc 取消、失焦視同存。 */
    function commitRename(input, save) {
      if (!state.renaming) return;
      state.renaming = false;
      var nm = input.value.trim();
      if (save && nm) vault().custom = nm;
      renderRail(); renderMain();
    }
    document.addEventListener("input", function (e) {
      if (e.target.matches("[data-vault-rename]")) fitRename(e.target);
      else if (e.target.matches("[data-wiz-name]") && state.wiz) state.wiz.draftName = e.target.value;
    });
    document.addEventListener("focusout", function (e) {
      if (!e.target.matches || !e.target.matches("[data-vault-rename]")) return;
      var input = e.target;
      setTimeout(function () { commitRename(input, true); }, 0);
    });
    document.addEventListener("keydown", function (e) {
      var t = e.target;
      if (t.matches && t.matches("[data-vault-rename]")) {
        if (e.key === "Enter") { e.preventDefault(); commitRename(t, true); }
        else if (e.key === "Escape") { e.preventDefault(); commitRename(t, false); }
        return;
      }
      if (t.matches && t.matches("[data-wiz-name]") && e.key === "Enter") { e.preventDefault(); wizNext(); return; }
      /* role="button" 的卡片與進度標籤要像按鈕：Enter／空白鍵觸發。 */
      var btn = t.closest && t.closest('.vault-card[role="button"], [data-wiz-go][role="button"]');
      if (btn && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); btn.click(); return; }
      if (e.key === "Escape" && els.sp && !els.sp.hidden) closeSharePop();
    });

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

    els.menu.addEventListener("click", function (e) {
      var opt = e.target.closest("[data-add]");
      if (!opt || opt.disabled) return;
      var parts = opt.getAttribute("data-add").split(":");
      var f = vault();
      var g = f.rules[pendingGroup] || f.rules[0];
      if (!g) { g = { items: [] }; f.rules.push(g); }
      if (g.items.length >= V.limits.items) { closeRuleMenu(); return; }   /* 一種方法最多 10 個條件（D497） */
      g.items.push({ t: parts[0], v: parts[1] });
      closeRuleMenu();
      renderRail(); renderGate(); renderMain();
    });
    document.addEventListener("click", function (e) {
      if (els.menu.hidden) return;
      if (e.target.closest(".vault-rulemenu") || e.target.closest("[data-rule-add]") || e.target.closest("[data-group-add]")) return;
      closeRuleMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !els.menu.hidden) {
        closeRuleMenu();
        var add = document.querySelector(".vault-open [data-rule-add]");
        if (add) add.focus();          /* 焦點掉到 body 是最常見的鍵盤陷阱 */
        return;
      }
      menuKeys(e);
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
        if (cur.task.scope === "item" && !cur.task.target) cur.task.target = V.shopProducts()[0].id;
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

    els.file.addEventListener("change", function (e) { addFiles(e.target.files); });

    /* 拖放到內容區（頁面與建立流程第 2 步）的任何位置都算——投放區是整座庫房，不是那一張「添加」卡。 */
    document.addEventListener("dragover", function (e) {
      var g = e.target.closest && e.target.closest(".vault-pool__grid");
      if (g) { e.preventDefault(); g.classList.add("is-dropping"); }
    });
    document.addEventListener("dragleave", function (e) {
      var g = e.target.closest && e.target.closest(".vault-pool__grid");
      if (g && !g.contains(e.relatedTarget)) g.classList.remove("is-dropping");
    });
    document.addEventListener("drop", function (e) {
      var g = e.target.closest && e.target.closest(".vault-pool__grid");
      if (!g) return;
      e.preventDefault();
      g.classList.remove("is-dropping");
      if (e.dataTransfer) addFiles(e.dataTransfer.files);
    });

    /* ── 分享這一頁（只剩保存檔 media-vault-popup.html 使用）────────────────
       正式頁 2026-10-22 起改成存取權限分頁的「分享連結」卡（F9，D475；Link field，
       網址由 paintSharePop 寫入）。這支只服務保存檔的舊按鈕：複製連結、跳 3 秒提示。 */
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
        renderShare(); renderRail(); renderMain();
        var urlField = els.drawerBody.querySelector("[data-vshare-url]");
        if (urlField) { urlField.focus(); urlField.select(); }
      }
    });

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

    document.addEventListener("i18n:applied", function () { lastReach = null; render(); if (state.wiz && state.wiz.step === 1) renderWizard(); });
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
    els.rail = document.querySelector("[data-vault-rail]");
    els.list      = document.querySelector("[data-vault-list]");
    els.count     = document.querySelector("[data-vault-count]");
    els.newBtn    = document.querySelector("[data-vault-new]");
    /* 保存檔 media-vault-popup.html 用的是舊版面（總覽卡片牆＋彈窗），2026-11-02 改版後這支 JS 不再驅動它。 */
    if (!document.querySelector("[data-vault-head]")) return;
    els.itemSheet = document.querySelector("[data-item-sheet]");
    els.itemBody  = els.itemSheet.querySelector("[data-item-body]");
    els.lens      = document.querySelector("[data-vault-lens]");
    els.viewer    = els.lens.querySelector("[data-vault-viewer]");
    els.viewerWrap = els.viewer.closest(".vault-viewer");
    els.lensReset = els.lens.querySelector("[data-vault-lens-reset]");
    els.main      = document.querySelector("[data-vault-main]");
    els.head      = els.main.querySelector("[data-vault-head]");
    els.bento     = els.main.querySelector("[data-vault-bento]");
    els.body      = els.main.querySelector("[data-vault-body]");
    els.gate      = els.main.querySelector("[data-vault-gate]");
    els.grid      = els.main.querySelector("[data-vault-grid]");
    els.file      = els.main.querySelector("[data-vault-file]");
    els.open      = els.main.querySelector("[data-vault-open]");
    els.none      = document.querySelector("[data-vault-none]");
    els.drawer    = document.querySelector("[data-vault-drawer]");
    els.drawerBody = els.drawer.querySelector("[data-vault-drawerbody]");
    els.drawerTitle = els.drawer.querySelector(".drawer__title");
    els.menu      = document.querySelector("[data-vault-rulemenu]");
    /* 分享連結彈窗（F9）與建立流程。 */
    els.sp        = document.querySelector("[data-vault-sharepop]");
    els.shareLink = els.sp.querySelector("[data-vault-sharelink]");
    els.linkHint  = els.sp.querySelector("[data-vault-link-hint]");
    els.linkOff   = els.sp.querySelector("[data-vault-link-off]");
    els.wiz       = document.querySelector("[data-vault-wiz]");
    /* 檢視身分那一列與指定一位粉絲（F6，D477）。 */
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
