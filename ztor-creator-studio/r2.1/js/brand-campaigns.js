/* ============================================================
   Brand campaigns — the creator's list, and the per-campaign report.

   One file serves both pages; each renders only the hooks it finds.

   Metric choices are load-bearing and deliberate (see brand-store.js):
     · SHARE OF VOICE, not redemption rate — the fan picks who gets
       credited, so the creator competes for taps against every other
       creator running that brand. Their own scan count means little
       without that denominator.
     · CHOSEN vs DEFAULTED — a scan the fan actively switched to you is
       evidence the campaign persuaded someone; one that landed on you
       because you were pre-selected is not. Reporting only the total
       would let a creator mistake position for influence.
     · Percentage deals show NO revenue figure. The share depends on each
       basket, which lives in the brand's POS, not in Ztor. Inventing an
       average basket would present the product of two guesses as money.
   ============================================================ */
(function () {
  "use strict";

  function isZh() { return document.documentElement.lang === "zh-Hant"; }
  function money(n) { return "$" + Number(n).toLocaleString("en-US"); }
  function pct(x) { return (x * 100).toFixed(1) + "%"; }
  function num(n) { return Number(n).toLocaleString("en-US"); }

  var STATUS = {
    live:   { en: "Live",   zh: "進行中", badge: "badge--success" },
    paused: { en: "Paused", zh: "已暫停", badge: "badge--neutral" },
    ended:  { en: "Ended",  zh: "已結束", badge: "badge--neutral" }
  };

  function shareText(b) {
    if (b.share.type === "percent") return b.share.value + "%";
    return "$" + b.share.value;
  }
  function fmtDate(s) {
    var p = s.split("-");
    return isZh() ? (p[0] + "/" + p[1] + "/" + p[2]) : (p[2] + "/" + p[1] + "/" + p[0].slice(2));
  }

  function logo(b, size) {
    return '<span class="brand-card__logo" style="width:' + size + 'px;height:' + size + 'px">' +
      '<img src="assets/brands/' + b.id + '.svg" alt="" onerror="this.remove()">' +
      '<span class="brand-card__mark" style="background:' + b.colour + '">' + b.mark + '</span>' +
    '</span>';
  }

  /* ── List page ─────────────────────────────────────────────── */
  function renderList() {
    var body = document.querySelector("[data-campaign-rows]");
    if (!body || !window.ztorBrands) return;
    var S = window.ztorBrands;

    body.innerHTML = S.campaigns.map(function (c) {
      var b = S.brand(c.brandId);
      var st = STATUS[c.status] || STATUS.ended;
      var rev = S.revenueOf(c);
      return '<div class="data-list__row cmp-row">' +
        '<span class="cmp-row__brand">' + logo(b, 32) +
          '<span class="cmp-row__names">' +
            '<a class="data-list__title cmp-row__name" href="brand-campaign-detail.html?id=' + c.id + '" data-sort-key="name">' + c.name + '</a>' +
            '<span class="data-list__meta">' + b.name + '</span>' +
          '</span>' +
        '</span>' +
        '<span class="cmp-row__dates" data-sort-key="dates" data-sort-value="' + c.from.replace(/-/g, "") + '">' +
          fmtDate(c.from) + ' – ' + fmtDate(c.to) + '</span>' +
        '<span class="fan-row__num" data-sort-key="scans">' + num(c.scans) + '</span>' +
        '<span class="fan-row__num" data-sort-key="sov">' + pct(S.shareOfVoice(c)) + '</span>' +
        '<span class="fan-row__num" data-sort-key="fans">' + num(c.newFans) + '</span>' +
        '<span class="fan-row__num" data-sort-key="rev" data-sort-value="' + (rev == null ? -1 : rev) + '">' +
          (rev == null ? '<span class="cmp-row__na" title="Percentage deal — settled from the brand\'s sales data">—</span>' : money(rev)) + '</span>' +
        '<span data-sort-key="status" data-sort-value="' + (c.status === "live" ? 3 : c.status === "paused" ? 2 : 1) + '">' +
          '<span class="badge ' + st.badge + '">' + (isZh() ? st.zh : st.en) + '</span></span>' +
        '<span class="fan-row__actions">' +
          '<a class="btn btn--icon btn--xs" href="brand-campaign-detail.html?id=' + c.id + '" aria-label="Open report"><i data-lucide="chevron-right" class="ztor-icon"></i></a>' +
        '</span>' +
      '</div>';
    }).join("");

    /* Roll-up across every campaign. Revenue deliberately sums only the
       flat deals and says so, rather than silently under-reporting. */
    var totScans = 0, totFans = 0, totRev = 0, unknown = 0;
    S.campaigns.forEach(function (c) {
      totScans += c.scans; totFans += c.newFans;
      var r = S.revenueOf(c);
      if (r == null) unknown++; else totRev += r;
    });
    set("kpi-scans", num(totScans));
    set("kpi-fans", num(totFans));
    set("kpi-rev", money(totRev));
    set("kpi-rev-meta", unknown
      ? (isZh() ? ("不含 " + unknown + " 個分潤比例制活動") : ("excludes " + unknown + " % -based campaign" + (unknown > 1 ? "s" : "")))
      : (isZh() ? "全部活動" : "across all campaigns"));
    set("kpi-live", String(S.campaigns.filter(function (c) { return c.status === "live"; }).length));

    if (window.ztorIcons) window.ztorIcons.applyIcons(body);
    if (window.ztorTableSort) window.ztorTableSort.scan(document);
  }

  function set(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ── Detail / report page ──────────────────────────────────── */
  function renderDetail() {
    var root = document.querySelector("[data-campaign-report]");
    if (!root || !window.ztorBrands) return;
    var S = window.ztorBrands;

    var id = new URLSearchParams(location.search).get("id") || S.campaigns[0].id;
    var c = S.campaign(id) || S.campaigns[0];
    var b = S.brand(c.brandId);
    var st = STATUS[c.status] || STATUS.ended;
    var rev = S.revenueOf(c);

    set("rep-name", c.name);
    set("rep-dates", fmtDate(c.from) + " – " + fmtDate(c.to));
    var brandEl = document.getElementById("rep-brand");
    if (brandEl) {
      brandEl.innerHTML = logo(b, 40) +
        '<span><span class="brand-card__name">' + b.name + '</span>' +
        '<span class="brand-card__cat">' + shareText(b) +
          (b.share.type === "percent" ? (isZh() ? " 分潤" : " of purchase") : (isZh() ? " / 次" : " per code")) +
        '</span></span>';
    }
    var stEl = document.getElementById("rep-status");
    if (stEl) stEl.innerHTML = '<span class="badge ' + st.badge + '">' + (isZh() ? st.zh : st.en) + '</span>';

    set("rep-scans", num(c.scans));
    set("rep-sov", pct(S.shareOfVoice(c)));
    set("rep-sov-meta", isZh()
      ? ("此品牌期間共 " + num(c.brandScans) + " 次掃碼")
      : ("of " + num(c.brandScans) + " brand scans in your window"));

    set("rep-rev", rev == null ? "—" : money(rev));
    set("rep-rev-meta", rev == null
      ? (isZh() ? "比例制分潤由品牌銷售資料結算" : "% deal — settled from the brand’s sales data")
      : (isZh() ? (num(c.scans) + " 次 × $" + b.share.value) : (num(c.scans) + " scans × $" + b.share.value)));

    set("rep-points", num(S.pointsOf(c)));
    set("rep-fans", num(c.newFans));

    /* Chosen vs defaulted — the campaign's persuasion, isolated. */
    var chosenRate = S.chosenRate(c);
    var defaulted = c.scans - c.chosen;
    set("rep-chosen", pct(chosenRate));
    set("rep-chosen-meta", isZh()
      ? (num(c.chosen) + " 次主動選你 · " + num(defaulted) + " 次為預設")
      : (num(c.chosen) + " actively picked you · " + num(defaulted) + " took the default"));

    var bar = document.getElementById("rep-chosen-bar");
    if (bar) {
      bar.innerHTML =
        '<div class="stacked-bar__seg" style="width:' + (chosenRate * 100) + '%;background:var(--primary)"></div>' +
        '<div class="stacked-bar__seg" style="width:' + ((1 - chosenRate) * 100) + '%;background:var(--muted-foreground)"></div>';
    }

    if (window.ztorIcons) window.ztorIcons.applyIcons(root);
  }

  function boot() { renderList(); renderDetail(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  document.addEventListener("i18n:applied", boot);
})();
