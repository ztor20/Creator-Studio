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

  var KIND = {
    image: { icon: "image",  label: { en: "Photo", zh: "圖片" } },
    clip:  { icon: "film",   label: { en: "Clip",  zh: "影片" } },
    audio: { icon: "music",  label: { en: "Audio", zh: "音檔" } }
  };

  var state = { vaultId: V.vaults[0].id, viewer: "" };
  var lastReach = null;
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
  function renderRail() {
    var html = V.vaults.map(function (v) {
      var cover = V.cover(v);
      /* 檢視器開著時，鑰匙數改成「這一級裡有幾個人打得開」，不是全站人數。
         「以一般粉絲檢視」卻顯示 653，會讓人以為那 653 個都是一般粉絲。
         打不開＝該級一個人都進不來（0），不是「不是每個人都進得來」。 */
      var reach = state.viewer ? V.reachInTier(v.rules, state.viewer) : V.reach(v.rules);
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

    els.list.innerHTML = html;
    /* 側欄標題列的右側是「這些鑰匙數是對誰算的」的說明——沒開檢視器時是
       庫房數，開了就換成那一級的母體大小，否則 17 這個數字沒有分母。 */
    if (state.viewer) {
      var tier = V.tiers.filter(function (x) { return x.key === state.viewer; })[0];
      els.count.textContent = tierName(state.viewer) + " · " + num(tier.count);
    } else {
      els.count.textContent = plural(V.vaults.length, "vault", "vaults", "座");
    }
    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.list);
    else if (window.lucide && window.lucide.createIcons) window.lucide.createIcons({ nameAttr: "data-lucide" });
  }

  /* ── 門條 ───────────────────────────────────────────────── */
  function renderDoor() {
    var f = vault();
    var rules = f.rules;
    var reach = V.reach(rules);
    var empty = rules.length === 0;

    els.door.classList.toggle("vault-door--empty", empty);

    /* 條件 chips。移除鈕是每個 chip 自己的按鈕，不是列尾一個共用的垃圾桶
       ——刪掉「哪一條」必須在按下去之前就確定。 */
    var chips = rules.map(function (r, i) {
      var l = V.ruleLabel(r);
      var text = r.t === "tier"
        ? '<span class="vault-rule__verb">' + tx("Tier", "分級") + " ≥ </span>" + esc(tierName(r.v))
        : '<span class="vault-rule__verb">' + esc(V.t(l.verb)) + " · </span>" + esc(V.t(l.text));
      return '<span class="chip chip--static chip--removable vault-rule">' + icon(l.icon) + text +
        '<button type="button" class="chip__remove" data-rule-remove="' + i + '" ' +
        'aria-label="' + esc(tx("Remove condition", "移除條件")) + '">' + icon("x") + "</button></span>";
    }).join("");

    els.doorRules.innerHTML = chips +
      '<button type="button" class="vault-door__add" data-rule-add>' + icon("plus") +
      tx("Add condition", "新增條件") + "</button>";

    els.doorAny.textContent = empty
      ? tx("No condition yet — nobody can open this vault.", "還沒有任何條件——目前沒有人打得開這座庫房。")
      : tx("A fan gets in by meeting any one of these.", "粉絲符合以上任一條件即可進入。");

    /* 讀數：數字用滾動的，因為它是「我剛剛改了條件」的回饋，不是一個
       靜態指標；跳一下和滾上去，讀起來是兩件事。 */
    rollTo(els.doorNum, reach);
    els.doorOf.textContent = empty
      ? tx("fans can open it", "位粉絲打得開")
      : tx("of your " + num(V.totalFans) + " fans · " + Math.round(reach / V.totalFans * 100) + "%",
           "位粉絲・佔全部 " + num(V.totalFans) + " 位的 " + Math.round(reach / V.totalFans * 100) + "%");

    /* 分級覆蓋條：段寬＝分級人數佔比，填色＝該分級被涵蓋的比例。 */
    els.doorBar.innerHTML = V.tiers.map(function (t) {
      var inTier = V.reachInTier(rules, t.key);
      return '<span class="vault-door__seg" style="flex:' + t.count + '" ' +
        'title="' + esc(tierName(t.key) + " " + inTier + "/" + t.count) + '">' +
        '<span class="vault-door__seg-fill" data-fill="' + (t.count ? inTier / t.count : 0) + '"></span></span>';
    }).join("");
    els.doorLegend.innerHTML = V.tiers.map(function (t) {
      var inTier = V.reachInTier(rules, t.key);
      return '<span class="vault-door__leg">' + esc(tierName(t.key)) +
        " <b>" + inTier + "/" + t.count + "</b></span>";
    }).join("");
    /* 下一幀才寫比例，否則 0 → n 沒有起點、transition 不會跑。 */
    requestAnimationFrame(function () {
      els.doorBar.querySelectorAll(".vault-door__seg-fill").forEach(function (el) {
        el.style.transform = "scaleX(" + parseFloat(el.getAttribute("data-fill")) + ")";
      });
    });

    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.door);
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
    els.gridMeta.textContent = bits.length ? bits.join(" · ") : tx("Nothing in here yet", "這裡還沒有東西");

    var tiles = f.items.map(function (it) {
      var k = KIND[it.kind];
      var body;
      if (it.kind === "audio") {
        body = '<span class="vault-tile__labelmark">' + icon("music") + "</span>" +
          '<span class="vault-tile__label"><span class="vault-tile__labeltitle">' + esc(V.t(it.name)) + "</span></span>";
      } else {
        body = '<img class="vault-tile__img" src="' + it.img + '" alt="" loading="lazy">' +
          '<span class="vault-tile__name">' + esc(V.t(it.name)) + "</span>";
      }
      var dur = it.dur ? '<span class="vault-tile__chip vault-tile__chip--dur">' + it.dur + "</span>" : "";
      return '<div class="vault-tile vault-tile--' + it.kind + '" data-item="' + it.id + '">' + body +
        '<span class="vault-tile__chip vault-tile__chip--kind">' + icon(k.icon) + V.t(k.label) + "</span>" + dur +
        '<span class="vault-tile__actions">' +
          (it.kind === "image" ? "" : '<button type="button" class="vault-tile__act" aria-label="' + esc(tx("Play", "播放")) + '">' + icon("play") + "</button>") +
          '<button type="button" class="vault-tile__act" aria-label="' + esc(tx("Rename", "重新命名")) + '" data-item-rename="' + it.id + '">' + icon("pencil") + "</button>" +
          '<button type="button" class="vault-tile__act vault-tile__act--danger" aria-label="' + esc(tx("Delete", "刪除")) + '" data-item-delete="' + it.id + '">' + icon("trash-2") + "</button>" +
        "</span>" +
      "</div>";
    }).join("");

    els.grid.innerHTML =
      '<div class="upload-tile" data-vault-upload>' +
        '<span class="upload-tile__icon">' + icon("upload") + "</span>" +
        '<span class="upload-tile__title">' + tx("Add media", "新增內容") + "</span>" +
        '<span class="upload-tile__hint">' + tx("Images, clips or audio", "圖片、影片或音檔") + "</span>" +
      "</div>" + tiles;

    if (window.ztorIcons && window.ztorIcons.render) window.ztorIcons.render(els.main);
  }

  function render() { renderRail(); renderDoor(); renderMain(); }

  /* ── 條件選單 ───────────────────────────────────────────── */
  function ruleMenuHtml() {
    var f = vault();
    var has = function (t, v) { return f.rules.some(function (r) { return r.t === t && r.v === v; }); };
    var out = '<div class="vault-rulemenu__group">' + tx("Tier", "分級") + "</div>";
    out += V.tiers.map(function (t) {
      var n = V.reach([{ t: "tier", v: t.key }]);
      return '<button type="button" class="vault-rulemenu__opt" data-add="tier:' + t.key + '"' +
        (has("tier", t.key) ? " disabled" : "") + ">" + icon("chart-column") +
        "≥ " + esc(tierName(t.key)) + '<span class="vault-rulemenu__n">' + num(n) + "</span></button>";
    }).join("");

    ["bought", "backed", "attended", "earned"].forEach(function (kind) {
      var grp = V.catalogue[kind];
      out += '<div class="vault-rulemenu__group">' + esc(V.t(grp.label)) + "</div>";
      out += grp.opts.map(function (o) {
        var n = V.reach([{ t: kind, v: o.id }]);
        return '<button type="button" class="vault-rulemenu__opt" data-add="' + kind + ":" + o.id + '"' +
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

  /* ── 就地新增庫房 ─────────────────────────────────────── */
  function startDraft() {
    if (els.rail.querySelector(".vault-rail__draft")) return;
    var row = document.createElement("div");
    row.className = "vault-rail__draft";
    row.innerHTML = '<input class="input" type="text" placeholder="' +
      esc(tx("Vault name", "庫房名稱")) + '" aria-label="' + esc(tx("Vault name", "庫房名稱")) + '">';
    els.newBtn.insertAdjacentElement("beforebegin", row);
    var input = row.querySelector("input");
    input.focus();

    function commit() {
      var name = input.value.trim();
      row.remove();
      if (!name) return;
      var id = "f" + Date.now();
      /* 新庫房條件為空：預設是「沒有人進得來」，不是「所有人看得到」。 */
      V.vaults.push({ id: id, icon: "package", custom: name, name: { en: name, zh: name }, note: { en: "", zh: "" }, rules: [], items: [] });
      state.vaultId = id;
      lastReach = null;
      render();
      if (window.ztorToast) window.ztorToast.show(tx("Vault created — now set who gets in", "庫房已建立——接著決定誰進得來"), { tone: "success" });
      var add = els.doorRules.querySelector("[data-rule-add]");
      if (add) add.focus();
    }
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); commit(); }
      else if (e.key === "Escape") { e.preventDefault(); row.remove(); els.newBtn.focus(); }
    });
    input.addEventListener("blur", commit);
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
    els.list.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-vault]");
      if (!btn) return;
      state.vaultId = btn.getAttribute("data-vault");
      lastReach = null;
      closeRuleMenu();
      render();
    });

    els.newBtn.addEventListener("click", startDraft);
    /* 頁首的主要動作與側欄底部那顆是同一件事，所以走同一條路徑：
       捲到側欄、就地開一列草稿，而不是另外開一個對話框。 */
    var topNew = document.querySelector("[data-vault-new-top]");
    if (topNew) topNew.addEventListener("click", function () {
      els.rail.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "nearest" });
      startDraft();
    });

    els.doorRules.addEventListener("click", function (e) {
      var add = e.target.closest("[data-rule-add]");
      if (add) { els.menu.hidden ? openRuleMenu(add) : closeRuleMenu(); return; }
      var rm = e.target.closest("[data-rule-remove]");
      if (rm) {
        vault().rules.splice(parseInt(rm.getAttribute("data-rule-remove"), 10), 1);
        renderDoor(); renderRail();
      }
    });

    els.menu.addEventListener("click", function (e) {
      var opt = e.target.closest("[data-add]");
      if (!opt || opt.disabled) return;
      var parts = opt.getAttribute("data-add").split(":");
      vault().rules.push({ t: parts[0], v: parts[1] });
      closeRuleMenu();
      renderDoor(); renderRail();
    });
    document.addEventListener("click", function (e) {
      if (els.menu.hidden) return;
      if (e.target.closest(".vault-rulemenu") || e.target.closest("[data-rule-add]")) return;
      closeRuleMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !els.menu.hidden) { closeRuleMenu(); }
    });

    els.grid.addEventListener("click", function (e) {
      var del = e.target.closest("[data-item-delete]");
      if (del) {
        var id = del.getAttribute("data-item-delete");
        var f = vault();
        var item = f.items.filter(function (i) { return i.id === id; })[0];
        if (!item) return;
        if (!window.confirm(tx("Delete “" + V.t(item.name) + "”? Fans lose access to it immediately.",
                               "刪除「" + V.t(item.name) + "」？粉絲會立刻失去這個檔案。"))) return;
        f.items = f.items.filter(function (i) { return i.id !== id; });
        renderMain(); renderRail();
        if (window.ztorToast) window.ztorToast.show(tx("Deleted", "已刪除"), { tone: "neutral" });
        return;
      }
      var ren = e.target.closest("[data-item-rename]");
      if (ren) {
        var rid = ren.getAttribute("data-item-rename");
        var it = vault().items.filter(function (i) { return i.id === rid; })[0];
        if (it) startRename(ren.closest(".vault-tile"), it);
        return;
      }
      if (e.target.closest("[data-vault-upload]")) {
        /* 原型：真實上傳未接線，說清楚而不是假裝成功。 */
        if (window.ztorToast) window.ztorToast.show(tx("Upload is not wired in this prototype", "原型尚未接上真實上傳"), { tone: "neutral" });
      }
    });

    els.viewer.addEventListener("change", function () {
      state.viewer = els.viewer.value;
      els.viewerWrap.classList.toggle("is-on", !!state.viewer);
      renderRail();
    });

    document.addEventListener("i18n:applied", function () { lastReach = null; render(); });
    window.addEventListener("resize", closeRuleMenu);
  }

  function init() {
    els.rail = document.querySelector("[data-vault-rail]");
    if (!els.rail) return;
    els.list      = els.rail.querySelector("[data-vault-list]");
    els.count     = els.rail.querySelector("[data-vault-count]");
    els.newBtn    = els.rail.querySelector("[data-vault-new]");
    els.viewer    = els.rail.querySelector("[data-vault-viewer]");
    els.viewerWrap = els.rail.querySelector(".vault-viewer");
    els.main      = document.querySelector("[data-vault-main]");
    els.title     = els.main.querySelector("[data-vault-title]");
    els.note      = els.main.querySelector("[data-vault-note]");
    els.door      = els.main.querySelector("[data-vault-door]");
    els.doorRules = els.main.querySelector("[data-vault-rules]");
    els.doorAny   = els.main.querySelector("[data-vault-any]");
    els.doorNum   = els.main.querySelector("[data-vault-num]");
    els.doorOf    = els.main.querySelector("[data-vault-of]");
    els.doorBar   = els.main.querySelector("[data-vault-bar]");
    els.doorLegend = els.main.querySelector("[data-vault-legend]");
    els.grid      = els.main.querySelector("[data-vault-grid]");
    els.gridMeta  = els.main.querySelector("[data-vault-gridmeta]");
    els.menu      = document.querySelector("[data-vault-rulemenu]");

    render();
    wire();
    if (window.applyI18n) window.applyI18n(els.rail);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
