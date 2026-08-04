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

  var state = { vaultId: V.vaults[0].id, viewer: "", itemId: null };
  var lastReach = null;
  var lastFocus = null;        /* 抽屜關掉之後焦點要回到打開它的那顆鈕 */
  var els = {};

  function vault() {
    var hit = V.vaults.filter(function (v) { return v.id === state.vaultId; })[0];
    return hit || V.vaults[0];
  }
  function tierName(key) {
    var el = document.querySelector('[data-tier-name="' + key + '"]');
    return el ? el.textContent.trim() : key;
  }
  function vaultName(v) { return v.custom ? v.custom : V.t(v.name); }

  /* ── 側欄 ───────────────────────────────────────────────── */
  /* ── demo A：庫房總覽卡片牆 ────────────────────────────────
     側欄 276px 擠著的封面在這裡放得大，「哪座門開得最大」比清單更一眼看得出來。 */
  function renderOverview() {
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
                ? icon("lock") + tx("Locked", "打不開")
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

     這裡只放這座原型真的有的欄位（檔名、類型、大小、加入日期、長度）與已經存在的
     兩個動作（改名、刪除）。權限、有效期、浮水印這類還沒有上游規格的東西不擅自
     生出來——那會把「呈現探索」偷渡成產品功能。 */
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

    els.itemBody.innerHTML =
      '<div class="vault-item__preview">' +
        (it.img
          ? '<img src="' + it.img + '" alt="">'
          : '<span class="vault-item__glyph">' + icon(k.icon) + "</span>") +
      "</div>" +
      '<label class="field">' +
        '<span class="field__label">' + tx("Name", "名稱") + "</span>" +
        '<input class="input" type="text" data-item-name value="' + esc(V.t(it.name)) + '">' +
      "</label>" +
      '<dl class="vault-item__facts">' +
        rows.map(function (r) {
          return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>";
        }).join("") +
      "</dl>" +
      '<div class="vault-item__actions">' +
        '<button type="button" class="btn btn--outline btn--sm" data-item-sheet-delete>' +
          icon("trash-2") + tx("Delete", "刪除") + "</button>" +
      "</div>";
    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.itemBody);
  }

  function openItem(id) {
    var it = itemById(id);
    if (!it) return;
    state.itemId = id;
    renderItemSheet(it);
    els.itemSheet.classList.add("is-open");
    els.itemSheet.setAttribute("aria-hidden", "false");
    var input = els.itemBody.querySelector("[data-item-name]");
    if (input) input.focus();
  }
  function closeItem() {
    /* 名字即時生效，不設「儲存」鈕：這一格只有一個可改的欄位，關掉抽屜就是收工。 */
    var it = itemById(state.itemId);
    var input = els.itemBody.querySelector("[data-item-name]");
    if (it && input && input.value.trim()) {
      var v = input.value.trim();
      it.name = { en: v, zh: v };
      renderMain(); renderRail(); renderOverview();
    }
    state.itemId = null;
    els.itemSheet.classList.remove("is-open");
    els.itemSheet.setAttribute("aria-hidden", "true");
  }

  function renderRail() {
    var html = V.vaults.map(function (v) {
      var cover = V.cover(v);
      /* 檢視器開著時，鑰匙數改成「這一級裡有幾個人打得開」，不是全站人數。
         「以一般粉絲檢視」卻顯示 653，會讓人以為那 653 個都是一般粉絲。
         打不開＝該級一個人都進不來（0），不是「不是每個人都進得來」。 */
      var reach = state.viewer ? V.reachInTierAll(v, state.viewer) : V.reachAll(v);
      var locked = !!state.viewer && reach === 0;
      var c = V.counts(v);
      var parts = [];
      if (c.image) parts.push(plural(c.image, "photo", "photos", "圖"));
      if (c.clip)  parts.push(plural(c.clip,  "clip",  "clips",  "片"));
      if (c.audio) parts.push(plural(c.audio, "audio", "audio",  "音"));

      var keys = locked
        ? '<span class="vault-row__keys">' + icon("lock") + tx("Locked", "打不開") + "</span>"
        : '<span class="vault-row__keys' + (reach === 0 ? " vault-row__keys--none" : "") + '">' +
            icon(reach === 0 ? "lock" : "key") + num(reach) + "</span>";

      return '<button type="button" class="vault-row' +
          (v.id === state.vaultId ? " vault-row--active" : "") +
          (locked ? " is-locked" : "") + '" data-vault="' + v.id + '">' +
          '<span class="vault-row__cover">' +
            (cover ? '<img src="' + cover + '" alt="" loading="lazy">' : icon(v.icon)) +
          "</span>" +
          '<span class="vault-row__text">' +
            '<span class="vault-row__name">' + esc(vaultName(v)) + "</span>" +
            '<span class="vault-row__meta">' + (parts.join(" · ") || tx("Empty", "尚無內容")) + "</span>" +
          "</span>" +
          keys +
        "</button>";
    }).join("");

    if (els.list) els.list.innerHTML = html;
    /* 側欄標題列的右側是「這些鑰匙數是對誰算的」的說明——沒開檢視器時是
       庫房數，開了就換成那一級的母體大小，否則 17 這個數字沒有分母。 */
    if (els.count) {
      if (state.viewer) {
        var tier = V.tiers.filter(function (x) { return x.key === state.viewer; })[0];
        els.count.textContent = tierName(state.viewer) + " · " + num(tier.count);
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
  function doorGroupHtml(g, gi) {
    var items = g.items || [];
    var lead = items.length >= 2
      ? '<div class="vault-door__all">' + tx("Meet all of these", "這些要一起達成") + "</div>"
      : "";
    var chips = items.map(function (r, ri) { return ruleChip(r, gi, ri, true); }).join("");
    return '<div class="vault-door__group' + (items.length >= 2 ? " vault-door__group--boxed" : "") + '">' + lead +
      '<div class="vault-door__chips">' + chips +
        '<button type="button" class="vault-door__add" data-rule-add="' + gi + '" ' +
          'aria-label="' + esc(tx("Add a condition to this way in", "在這一種方法裡再加一個條件")) + '">' +
          icon("plus") + tx("Add", "再加一個") + "</button>" +
      "</div>" +
    "</div>";
  }

  /* 白話總結。畫面上的框線與「或是」講的是結構，這一句講的是結果——一句話說完
     誰進得來，不必先看懂上面的排版。 */
  function doorSummary(f, noKey) {
    var gs = f.rules || [];
    var n = V.ruleCount(f);
    if (!n) {
      return noKey
        ? tx("No condition and no key yet — nobody can open this vault.", "還沒有條件、也沒有鑰匙——目前沒有人打得開這座庫房。")
        : tx("No condition — only fans holding a key get in.", "沒有條件——只有持鑰匙的人進得來。");
    }
    if (gs.length > 1) {
      return tx("Any one of these ways gets a fan in.", "上面任何一種達成，粉絲就進得來。");
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

    /* 框只在「這一種方法有兩個以上條件」時才畫——一個條件就是一個條件，圈起來
       只是多一層線。「或是」則是有兩種方法就出現，因為那時真的有選擇。 */
    var multi = gs.length > 1;
    els.doorRules.innerHTML =
      gs.map(function (g, gi) { return doorGroupHtml(g, gi); })
        .join('<div class="vault-door__sep"><span>' + tx("or", "或是") + "</span></div>") +
      '<button type="button" class="vault-door__addgroup" data-group-add>' + icon("plus") +
        tx("Another way in", "多一種進得來的方法") + "</button>";
    els.doorRules.classList.toggle("is-grouped", multi);

    els.doorAny.textContent = doorSummary(f, stats.live === 0);

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

  /* 圖片／影片格：有影格就鋪影格，沒有就走「標籤紙」版面（檔名排大、
     圖示在角）。剛上傳的影片沒有縮圖——瀏覽器不會替圖片標籤抽影格，要等
     轉檔服務；這時候塞一個空 src 會得到一個破圖框，比誠實的檔名版難看
     也更沒用。播放鈕只給 clip：圖片不是可播放的媒體。 */
  function tileHtml(it) {
    var k = KIND[it.kind];
    var body;
    if (it.img) {
      body = '<img class="vault-tile__img" src="' + esc(it.img) + '" alt="" loading="lazy">' +
        '<span class="vault-tile__name">' + esc(V.t(it.name)) + "</span>";
    } else {
      body = '<span class="vault-tile__labelmark">' + icon(k.icon) + "</span>" +
        '<span class="vault-tile__label"><span class="vault-tile__labeltitle">' + esc(V.t(it.name)) + "</span></span>";
    }
    var dur = it.dur ? '<span class="vault-tile__chip vault-tile__chip--dur">' + it.dur + "</span>" : "";
    var play = it.kind === "clip"
      ? '<button type="button" class="vault-tile__act" aria-label="' + esc(tx("Play", "播放")) + '">' + icon("play") + "</button>"
      : "";
    return '<div class="vault-tile vault-tile--' + it.kind + (it.img ? "" : " vault-tile--label") +
      '" data-item="' + it.id + '">' + body +
      '<span class="vault-tile__chip vault-tile__chip--kind">' + icon(k.icon) + V.t(k.label) + "</span>" + dur +
      '<span class="vault-tile__actions">' + play +
        '<button type="button" class="vault-tile__act" aria-label="' + esc(tx("Rename", "重新命名")) + '" data-item-rename="' + it.id + '">' + icon("pencil") + "</button>" +
        '<button type="button" class="vault-tile__act vault-tile__act--danger" aria-label="' + esc(tx("Delete", "刪除")) + '" data-item-delete="' + it.id + '">' + icon("trash-2") + "</button>" +
      "</span>" +
    "</div>";
  }

  /* 音檔列：格子裝著文字方塊是聲音最差的容器——一列「播放 · 曲名 · 長度」
     才是這個媒介本來的樣子。size／added 當第二行小字，dur 走等寬數字欄。 */
  function trackHtml(it) {
    var meta = [it.size, it.added].filter(Boolean).join(" · ");
    return '<div class="vault-track" data-item="' + it.id + '">' +
      '<button type="button" class="vault-track__play" aria-label="' + esc(tx("Play", "播放")) + '">' + icon("play") + "</button>" +
      '<span class="vault-track__text">' +
        '<span class="vault-track__name">' + esc(V.t(it.name)) + "</span>" +
        (meta ? '<span class="vault-track__meta">' + esc(meta) + "</span>" : "") +
      "</span>" +
      (it.dur ? '<span class="vault-track__dur">' + esc(it.dur) + "</span>" : "<span></span>") +
      '<span class="vault-track__actions">' +
        '<button type="button" class="vault-track__act" aria-label="' + esc(tx("Rename", "重新命名")) + '" data-item-rename="' + it.id + '">' + icon("pencil") + "</button>" +
        '<button type="button" class="vault-track__act vault-track__act--danger" aria-label="' + esc(tx("Delete", "刪除")) + '" data-item-delete="' + it.id + '">' + icon("trash-2") + "</button>" +
      "</span>" +
    "</div>";
  }

  /* 只長出有東西的分區，順序固定（照片 → 影片 → 音檔）。空的那一種整個不出現。 */
  function groupHtml(items) {
    return GROUPS.map(function (g) {
      var list = items.filter(function (i) { return i.kind === g.kind; });
      if (!list.length) return "";
      var inner = g.kind === "audio"
        ? '<div class="vault-tracks">' + list.map(trackHtml).join("") + "</div>"
        : '<div class="vault-grid vault-grid--' + g.kind + '">' + list.map(tileHtml).join("") + "</div>";
      return '<div class="vault-group">' +
        '<div class="vault-group__head">' +
          '<span class="vault-group__icon">' + icon(g.icon) + "</span>" +
          '<span class="vault-group__title">' + tx(g.title.en, g.title.zh) + "</span>" +
          '<span class="vault-group__count">' + list.length + "</span>" +
        "</div>" + inner +
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
  function renderMain() {
    var f = vault();
    els.title.textContent = vaultName(f);
    els.note.textContent = f.custom ? tx("New vault — set who gets in, then add media.", "新庫房——先決定誰進得來，再放內容。") : V.t(f.note);

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

    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.main);
  }

  /* ── 上鎖遮罩 ───────────────────────────────────────────────
     側欄按分級把打不開的庫房壓暗，但壓暗只回答「打不開」；點進去之後還要
     回答「那要怎樣才打得開」。所以主欄把門條與內容整塊打模糊，蓋一張說明卡
     寫出解鎖條件——粉絲那一側看到的正是這個：東西在，但我進不去。

     只在檢視器開著時發生。創作者以自己的身分看，任何庫房都打得開。 */
  function renderGate() {
    var f = vault();
    var locked = !!state.viewer && V.reachInTierAll(f, state.viewer) === 0;

    els.body.classList.toggle("is-gated", locked);
    els.gate.hidden = !locked;
    if (!locked) { els.gate.innerHTML = ""; return; }

    var who = tierName(state.viewer);
    var liveKeys = (f.keys || []).filter(function (k) { return !k.revoked; }).length;

    /* 條件在這裡是唯讀的：粉絲看得到門上寫什麼，但門不是他能改的。
       所以用 chip--static、沒有移除鈕，跟門條那組可編輯的 chips 不同。
       一種方法一行、同一行裡用「＋」串起來，行與行之間寫「或是」——門上寫的
       規則怎麼組合，看的人要一眼看懂，不必先學會什麼是「且」。 */
    var gs = f.rules || [];
    var chips = gs.map(function (g) {
      var inner = (g.items || []).map(function (r) {
        var l = V.ruleLabel(r);
        var text = r.t === "tier"
          ? '<span class="vault-gate__rule-verb">' + tx("Tier", "分級") + " ≥ </span>" + esc(tierName(r.v))
          : '<span class="vault-gate__rule-verb">' + esc(V.t(l.verb)) + " · </span>" + esc(V.t(l.text));
        return '<span class="chip chip--static">' + icon(l.icon) + text + "</span>";
      }).join('<span class="vault-gate__join">＋</span>');
      return '<span class="vault-gate__group">' + inner + "</span>";
    }).join('<span class="vault-gate__join vault-gate__join--or">' + tx("or", "或是") + "</span>");

    var n = V.ruleCount(f);
    var keyLine = liveKeys ? tx(" Holding a key also gets you in.", "持有鑰匙的人也進得來。") : "";
    var foot = !n
      ? (liveKeys
          ? tx("No condition on this vault — only fans holding a key get in.",
               "這座庫房沒有設條件——只有持鑰匙的人進得來。")
          : tx("No condition and no key yet — nobody can open this vault.",
               "還沒有條件、也沒有鑰匙——目前沒有人打得開這座庫房。"))
      : gs.length > 1
        ? tx("Any one of these gets you in." + keyLine, "上面任何一種達成就打得開。" + keyLine)
        : n === 1
          ? tx("Meet this to open it." + keyLine, "達成這個條件就打得開。" + keyLine)
          : tx("Meet all of these to open it." + keyLine, "上面的條件全部達成才打得開。" + keyLine);

    els.gate.innerHTML =
      '<div class="vault-gate__panel">' +
        '<span class="vault-gate__icon">' + icon("lock") + "</span>" +
        '<h3 class="vault-gate__title">' + tx("This vault is locked", "此媒體庫已上鎖") + "</h3>" +
        '<p class="vault-gate__sub">' +
          esc(tx("Viewing as " + who + " · nobody at this tier gets in", "正在以「" + who + "」檢視・這一級沒有人進得來")) +
        "</p>" +
        (n
          ? '<span class="vault-gate__label">' + icon("key") + tx("Unlock conditions", "解鎖條件") + "</span>" +
            '<div class="vault-gate__rules">' + chips + "</div>"
          : "") +
        '<p class="vault-gate__foot">' + esc(foot) + "</p>" +
      "</div>";

    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.gate);
  }

  /* ── 檢視器那一列 ───────────────────────────────────────────
     檢視中的狀態不另外寫成一句話（2026-07-31 使用者裁示撤掉）：側欄逐列標「打不開」、
     主欄蓋遮罩、下拉自己轉橘，畫面已經把狀態說完了。這裡只開關下拉的上色與離開鈕。 */
  function renderLens() {
    var on = !!state.viewer;
    els.viewerWrap.classList.toggle("is-on", on);
    els.lensReset.hidden = !on;
  }

  /* 「誰進得來」吸住了沒有——吸住才讓它上面那塊遮罩現身（沒吸住時遮罩會把頁首
     蓋掉）。捲動容器在正式頁是 .main、在彈窗版是 .vault-modal__body，所以往上找，
     不寫死。 */
  function bindStuckWatch() {
    var el = els.reach;
    if (!el) return;
    var scroller = el.closest(".vault-modal__body") || el.closest(".main") || document.scrollingElement;
    var offset = parseFloat(getComputedStyle(el).top) || 0;
    function check() {
      var top = el.getBoundingClientRect().top;
      var base = scroller === document.scrollingElement ? 0 : scroller.getBoundingClientRect().top;
      el.classList.toggle("is-stuck", top - base <= offset + 1);
    }
    (scroller === document.scrollingElement ? window : scroller)
      .addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
  }

  function render() {
    renderLens(); renderRail(); renderOverview();
    renderDoor(); renderMain(); renderGate();
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

    /* — 這個機制的規則，寫在畫面上 — */
    out += '<div class="info-banner">' + icon("info", "info-banner__icon") + "<span>" +
      tx("A key is a bearer link: whoever holds it can use one of its uses, and access binds to that fan's account once used. Revoking a key removes access from everyone who claimed it — the fan count drops immediately.",
         "鑰匙是持有者憑證：拿到連結的人就能用掉其中一次，用掉之後權限綁定在那位粉絲的帳號上。撤銷一把鑰匙，所有靠它進來的人會立刻失去權限——粉絲人數會當場往下掉。") +
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
  function openShare(intent) {
    share.created = null;
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
      V.vaults.unshift({ id: id, icon: "package", custom: name, name: { en: name, zh: name }, note: { en: "", zh: "" }, rules: [{ items: [] }], items: [] });
      if (els.modal.hidden) openVault(id); else { state.vaultId = id; lastReach = null; render(); }
      if (window.ztorToast) window.ztorToast.show(tx("Vault created — now set who gets in", "庫房已建立——接著決定誰進得來"), { tone: "success" });
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
        g.items.splice(ri, 1);
        /* 刪到空的方法自動消失，不必再給一顆「移除」——除非它是最後一種，
           那一種要留著當加條件的落點，否則畫面上會沒有任何入口。 */
        if (!g.items.length && f.rules.length > 1) f.rules.splice(gi, 1);
        renderDoor(); renderRail(); renderGate();
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
      renderDoor(); renderRail(); renderGate();
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
      if (e.target.closest("[data-item-sheet-delete]")) {
        var it = itemById(state.itemId);
        var f = vault();
        f.items = f.items.filter(function (x) { return x.id !== state.itemId; });
        state.itemId = null;
        els.itemSheet.classList.remove("is-open");
        els.itemSheet.setAttribute("aria-hidden", "true");
        renderMain(); renderRail(); renderOverview();
        if (it && window.ztorToast) window.ztorToast.show(tx("Deleted", "已刪除"), { tone: "neutral" });
      }
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

    /* ── 分享抽屜 ─────────────────────────────────────────── */
    document.addEventListener("click", function (e) {
      var sh = e.target.closest("[data-vault-share]");
      if (sh) { openShare(sh.getAttribute("data-vault-share")); return; }
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
      if (revoke) {
        var f = vault();
        var k = (f.keys || []).filter(function (x) { return x.id === revoke.getAttribute("data-vkey-revoke"); })[0];
        if (!k) return;
        var lost = (k.claimed || []).length;
        /* 撤銷會讓人失去權限，所以要說出來會失去幾個人，不能只說「確定嗎」。 */
        if (!window.confirm(tx(
          "Revoke " + k.code + "? " + num(lost) + " fans lose access to this vault immediately, and its remaining uses stop working.",
          "撤銷 " + k.code + "？已靠它進來的 " + num(lost) + " 位粉絲會立刻失去這座庫房的權限，剩下的次數也會失效。"))) return;
        k.revoked = todayStr();
        renderShare(); renderDoor(); renderRail();
        if (window.ztorToast) window.ztorToast.show(tx("Key revoked", "鑰匙已撤銷"), { tone: "neutral" });
        return;
      }

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
        renderShare(); renderDoor(); renderRail();
        var urlField = els.drawerBody.querySelector("[data-vshare-url]");
        if (urlField) { urlField.focus(); urlField.select(); }
      }
    });

    els.viewer.addEventListener("change", function () {
      state.viewer = els.viewer.value;
      renderLens(); renderRail(); renderGate();
    });

    els.lensReset.addEventListener("click", function () {
      els.viewer.value = "";
      /* zselect 用自己的觸發鈕顯示標籤，程式改 value 不會通知它——補一個 change
         讓它跟著更新，順帶走同一條渲染路徑，不必把邏輯抄兩份。 */
      els.viewer.dispatchEvent(new Event("change", { bubbles: true }));
      els.viewer.focus();
    });

    document.addEventListener("i18n:applied", function () { lastReach = null; render(); });
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

    render();
    wire();
    bindStuckWatch();
    if (window.applyI18n) {
      if (els.rail) window.applyI18n(els.rail);
      window.applyI18n(els.lens);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
