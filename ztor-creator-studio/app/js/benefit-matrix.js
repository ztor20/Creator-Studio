/* ============================================================
   Benefit matrix — catalogue × tiers.

   使用者裁示 2026-07-27：「once a content is added, users should see the
   content on every tier, so they can decide what tier has what benefits
   while doesn't have to enter the same thing for each tier.」

   That requirement is satisfied structurally, not by syncing: a benefit
   is ONE row, and a tier is a column, so a new row necessarily has a
   cell under every tier the moment it exists.

   Rows render from CATALOGUE below (demo data — the real list comes from
   the backend). Each row:
     { id, label, type: 'toggle'|'value', unit, tiers: {inner,super,devoted,fan} }
   toggle tiers hold true/false; value tiers hold a number or null.

   Tier order is the ladder, highest first — the ladder check depends on
   that order being authoritative.
   ============================================================ */
(function () {
  "use strict";

  var TIERS = [
    { key: "inner",   i18n: "tier-settings.tier.inner",    badge: "badge--orange"  },
    { key: "super",   i18n: "tier-settings.tier.superfan", badge: "badge--info"    },
    { key: "devoted", i18n: "tier-settings.tier.devoted",  badge: "badge--success" },
    { key: "fan",     i18n: "tier-settings.tier.fan",      badge: "badge--neutral" }
  ];

  /* Seeded catalogue. The graded rows carry the values the old per-tier
     cards already held (7/3/1 days, 20/10/5 %) — the redesign must not
     quietly discard working settings. */
  var CATALOGUE = [
    { id: "early",      i18n: "ben.item.early",      type: "value",  unit: "d", tiers: { inner: 7,  super: 3,  devoted: 1,  fan: null } },
    { id: "discount",   i18n: "ben.item.discount",   type: "value",  unit: "%", tiers: { inner: 20, super: 10, devoted: 5,  fan: null } },
    { id: "auction",    i18n: "ben.item.auction",    type: "toggle", tiers: { inner: true,  super: false, devoted: false, fan: false } },
    { id: "vipshop",    i18n: "ben.item.vipshop",    type: "toggle", tiers: { inner: true,  super: true,  devoted: false, fan: false } },
    { id: "vault",      i18n: "ben.item.vault",      type: "toggle", explain: "explain-vault",
      tiers: { inner: true,  super: true,  devoted: false, fan: false } },
    { id: "bdayvoice",  i18n: "ben.item.bdayvoice",  type: "toggle", tiers: { inner: true,  super: true,  devoted: false, fan: false } },
    { id: "bdayvideo",  i18n: "ben.item.bdayvideo",  type: "toggle", tiers: { inner: true,  super: false, devoted: false, fan: false } },
    { id: "demos",      i18n: "ben.item.demos",      type: "toggle", tiers: { inner: true,  super: true,  devoted: false, fan: false } },
    { id: "bts",        i18n: "ben.item.bts",        type: "toggle", tiers: { inner: true,  super: true,  devoted: false, fan: false } },
    { id: "livestream", i18n: "ben.item.livestream", type: "toggle", tiers: { inner: true,  super: false, devoted: false, fan: false } }
  ];

  var root, headEl, bodyEl, seq = 0;

  /* Read display names off the rendered DOM rather than a translation
     lookup: the badge in the column head is already localised by
     i18n.js, so this can never disagree with what the user is reading. */
  function tierName(tier) {
    var el = root && root.querySelector('[data-tier-count="' + tier.key + '"]');
    var badge = el && el.parentElement.querySelector(".badge");
    return badge ? badge.textContent.trim() : tier.key;
  }
  function rowName(item) {
    if (item.custom) return item.label;
    var el = root && root.querySelector('[data-row="' + item.id + '"] .bmx__label-text');
    return el ? el.textContent.trim() : item.id;
  }
  function isZh() { return document.documentElement.lang === "zh-Hant"; }

  /* ── Render ─────────────────────────────────────────────── */

  function renderHead() {
    var html = '<span class="bmx__head-label" data-i18n="ben.col.benefit">Benefit</span>';
    TIERS.forEach(function (tier) {
      html += '<span class="bmx__tier">' +
        '<span class="badge ' + tier.badge + '"><span data-i18n="' + tier.i18n + '">' + tier.key + '</span></span>' +
        '<span class="bmx__tier-count" data-tier-count="' + tier.key + '"></span>' +
      '</span>';
    });
    headEl.innerHTML = html;
  }

  function cellHtml(item, tier) {
    if (item.type === "value") {
      var v = item.tiers[tier.key];
      return '<span class="bmx__cell">' +
        '<span class="amount-field amount-field--suffix">' +
          '<input class="input amount-field__input" inputmode="numeric" value="' + (v == null ? "" : v) + '" ' +
            'data-cell="' + item.id + '" data-tier="' + tier.key + '" aria-label="' + tier.key + '">' +
          '<span class="amount-field__unit">' + (item.unit || "") + '</span>' +
        '</span></span>';
    }
    var on = !!item.tiers[tier.key];
    return '<span class="bmx__cell">' +
      '<button class="switch' + (on ? " switch--on" : "") + '" type="button" role="switch" ' +
        'aria-checked="' + on + '" data-cell="' + item.id + '" data-tier="' + tier.key + '"></button>' +
    '</span>';
  }

  function rowHtml(item) {
    var label = item.custom
      ? '<span class="bmx__label-text">' + escapeHtml(item.label) + '</span>' +
        '<span class="bmx__own" data-i18n="ben.own">· yours</span>'
      : '<span class="bmx__label-text" data-i18n="' + item.i18n + '">' + item.id + '</span>';

    var explain = item.explain
      ? '<button class="explain-btn" type="button" data-explain="' + item.explain + '" aria-label="What is this?"><i data-lucide="info" class="ztor-icon"></i></button>'
      : "";

    var html = '<div class="bmx__row" data-row="' + item.id + '">' +
      '<span class="bmx__label">' + label + explain +
        '<button class="bmx__remove" type="button" data-remove="' + item.id + '" aria-label="Remove benefit" data-i18n-aria-label="ben.remove"><i data-lucide="trash-2" class="ztor-icon"></i></button>' +
      '</span>';
    TIERS.forEach(function (tier) { html += cellHtml(item, tier); });
    html += '<span class="bmx__warn"><i data-lucide="alert-triangle" class="ztor-icon"></i><span data-warn-text></span></span>';
    return html + "</div>";
  }

  function render() {
    bodyEl.innerHTML = CATALOGUE.map(rowHtml).join("");
    if (window.ztorIcons) window.ztorIcons.applyIcons(root);
    if (window.applyI18n) window.applyI18n(root);
    refresh();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ── Derived state: per-tier counts + ladder coherence ──── */

  function granted(item, tierKey) {
    var v = item.tiers[tierKey];
    return item.type === "value" ? (v != null && v !== "" && +v > 0) : !!v;
  }

  function refresh() {
    TIERS.forEach(function (tier) {
      var n = CATALOGUE.filter(function (it) { return granted(it, tier.key); }).length;
      var el = root.querySelector('[data-tier-count="' + tier.key + '"]');
      if (el) el.textContent = isZh() ? (n + " 項") : (n === 1 ? "1 benefit" : n + " benefits");
    });

    /* A perk held by a lower tier but not by a higher one breaks the
       ladder. Flag it on the row; never block — the creator may mean it. */
    CATALOGUE.forEach(function (item) {
      var rowEl = root.querySelector('[data-row="' + item.id + '"]');
      if (!rowEl) return;
      var offender = null;
      for (var i = TIERS.length - 1; i > 0; i--) {
        if (!granted(item, TIERS[i].key)) continue;
        for (var j = i - 1; j >= 0; j--) {
          if (!granted(item, TIERS[j].key)) { offender = { low: TIERS[i], high: TIERS[j] }; break; }
        }
        if (offender) break;
      }
      rowEl.classList.toggle("is-broken", !!offender);
      if (offender) {
        var lowName = tierName(offender.low);
        var highName = tierName(offender.high);
        rowEl.querySelector("[data-warn-text]").textContent = isZh()
          ? (lowName + " 有這項，但更高的 " + highName + " 沒有。")
          : (lowName + " has this but " + highName + " does not.");
      }
    });
  }

  /* ── Editing ────────────────────────────────────────────── */

  function find(id) {
    for (var i = 0; i < CATALOGUE.length; i++) if (CATALOGUE[i].id === id) return CATALOGUE[i];
    return null;
  }

  function wire() {
    root.addEventListener("click", function (e) {
      var sw = e.target.closest(".switch[data-cell]");
      if (sw) {
        var item = find(sw.getAttribute("data-cell"));
        if (!item) return;
        var key = sw.getAttribute("data-tier");
        item.tiers[key] = !item.tiers[key];
        sw.classList.toggle("switch--on", item.tiers[key]);
        sw.setAttribute("aria-checked", item.tiers[key] ? "true" : "false");
        refresh();
        return;
      }
      var rm = e.target.closest("[data-remove]");
      if (rm) { removeRow(rm.getAttribute("data-remove")); return; }
      if (e.target.closest("[data-bmx-add]")) { addRow(); }
    });

    root.addEventListener("input", function (e) {
      var input = e.target.closest(".input[data-cell]");
      if (!input) return;
      var item = find(input.getAttribute("data-cell"));
      if (!item) return;
      var raw = input.value.trim();
      item.tiers[input.getAttribute("data-tier")] = raw === "" ? null : +raw;
      refresh();
    });

    document.addEventListener("i18n:applied", refresh);
  }

  /* Removing a row removes the perk from EVERY tier at once — that is the
     flip side of defining it once, so say so when it is actually granted
     somewhere. A row nobody has goes quietly. */
  function removeRow(id) {
    var item = find(id);
    if (!item) return;
    var live = TIERS.filter(function (tr) { return granted(item, tr.key); }).length;
    if (live > 0) {
      var name = rowName(item);
      var msg = isZh()
        ? ("「" + name + "」目前在 " + live + " 個分級啟用中。移除會從所有分級一起拿掉，確定嗎？")
        : ('“' + name + '” is live on ' + live + ' tier' + (live > 1 ? "s" : "") + ". Removing takes it off all of them. Continue?");
      if (!window.confirm(msg)) return;
    }
    CATALOGUE.splice(CATALOGUE.indexOf(item), 1);
    render();
  }

  /* Inline add: the row appears in the matrix immediately, already
     carrying a cell for all four tiers, with the name focused. No modal —
     naming a perk is one field, and seeing the four empty tier cells IS
     the explanation of how this page works. Everything starts OFF; a perk
     must be granted deliberately, never by default. */
  function addRow() {
    if (bodyEl.querySelector(".bmx__row--new")) {
      bodyEl.querySelector(".bmx__name-input").focus();
      return;
    }
    var el = document.createElement("div");
    el.className = "bmx__row bmx__row--new";
    var cells = TIERS.map(function () {
      return '<span class="bmx__cell"><button class="switch" type="button" role="switch" aria-checked="false" disabled></button></span>';
    }).join("");
    el.innerHTML =
      '<span class="bmx__label">' +
        '<input class="input bmx__name-input" maxlength="60" placeholder="' +
          (isZh() ? "權益名稱，例如：專屬語音留言" : "Name this benefit, e.g. Private soundcheck") + '">' +
      '</span>' + cells;
    bodyEl.appendChild(el);
    var input = el.querySelector(".bmx__name-input");
    input.focus();

    function commit() {
      var name = input.value.trim();
      if (!name) { el.remove(); return; }
      CATALOGUE.push({
        id: "custom-" + (++seq), label: name, custom: true, type: "toggle",
        tiers: { inner: false, super: false, devoted: false, fan: false }
      });
      el.remove();
      render();
      /* Land focus on the new row's top-tier switch: the next decision is
         "who gets this", and it is one keystroke away. */
      var rows = bodyEl.querySelectorAll(".bmx__row");
      var last = rows[rows.length - 1];
      if (last) last.querySelector(".switch").focus();
    }
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); commit(); }
      else if (e.key === "Escape") { e.preventDefault(); el.remove(); }
    });
    input.addEventListener("blur", commit);
  }

  function init() {
    root = document.querySelector("[data-benefit-matrix]");
    if (!root) return;
    headEl = root.querySelector(".bmx__head");
    bodyEl = root.querySelector(".bmx__body");
    if (!headEl || !bodyEl) return;
    renderHead();
    render();
    wire();
    if (window.applyI18n) window.applyI18n(root);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
