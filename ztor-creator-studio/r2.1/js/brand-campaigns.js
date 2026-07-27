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

  /* The real mark when we have it, the monogram when we don't — decided
     by the browser, not by a flag we'd have to keep in sync with the
     contents of assets/brands/. onload marks the well so the fallback
     hides; onerror drops the broken image so it never shows a torn icon. */
  function logo(b, size) {
    return '<span class="brand-card__logo" style="width:' + size + 'px;height:' + size + 'px;background:' + b.colour + '">' +
      '<img src="assets/brands/' + b.id + '.svg" alt="" ' +
        'onload="this.parentElement.classList.add(\'has-logo\')" ' +
        'onerror="this.remove()">' +
      '<span class="brand-card__mark">' + b.mark + '</span>' +
    '</span>';
  }

  /* ── Brand picker ──────────────────────────────────────────────
     Folded into this page (使用者裁示): one destination for brand
     collabs, no second page and no nav accordion. Your campaigns sit
     above, the brands you could add sit below. */
  var CAT = {
    "cat.food":       { en: "Food & drink",  zh: "餐飲" },
    "cat.sportswear": { en: "Sportswear",    zh: "運動服飾" },
    "cat.fashion":    { en: "Fashion",       zh: "時尚" }
  };
  var PER = {
    "per.coffee": { en: "coffee", zh: "杯" },
    "per.sleeve": { en: "sleeve", zh: "條" }
  };
  var BLURB = {
    "brand.starbucks.blurb": {
      en: "Fans buy coffee as usual. Every $10 earns them a reward code — they scan it, collect points, and you take a cut.",
      zh: "粉絲照常買咖啡。每消費 $10 就拿到一組回饋碼——掃碼集點，你抽成。" },
    "brand.nike.blurb": {
      en: "Codes print on the receipt at checkout, so your share tracks the actual basket value.",
      zh: "回饋碼在結帳時印在收據上，你的分潤依實際消費金額計算。" },
    "brand.adidas.blurb": {
      en: "Receipt-printed codes across all stores in the campaign region.",
      zh: "活動地區所有門市皆於收據列印回饋碼。" },
    "brand.zara.blurb": {
      en: "Seasonal drops pair well with lookbook content — codes print at the till.",
      zh: "換季新品與穿搭內容相得益彰——回饋碼於櫃檯列印。" },
    "brand.nespresso.blurb": {
      en: "Pre-printed cards handed out with every sleeve. Simple for stores, no POS work.",
      zh: "隨每條膠囊附上預印卡片。門市作業簡單，不需改 POS。" }
  };
  function tr(map, key) { var e = map[key]; return e ? (isZh() ? e.zh : e.en) : key; }

  function fullShare(b) {
    if (b.share.type === "percent") return isZh() ? (b.share.value + "% 分潤") : (b.share.value + "% of purchase");
    var per = tr(PER, b.share.per);
    return isZh() ? ("每" + per + " $" + b.share.value) : ("$" + b.share.value + " per " + per);
  }
  function shortDate(s) { var p = s.split("-"); return isZh() ? (p[0] + "/" + p[1]) : (p[1] + "/" + p[0].slice(2)); }
  /* icon 由 printer 改 id-card：printer 沒有註冊在 js/icons.js 的 REGISTRY 裡，
     每張卡都會在 console 丟一次 unknown icon（實測 10 次）。id-card 已註冊，
     語意也更準——這裡講的是「一張預先印好、發到客人手上的卡」，不是列印這個動作。 */
  function methodText(b) {
    if (b.method === "batch") {
      return { icon: "id-card", text: isZh() ? "預印卡片，門市直接發放" : "Pre-printed cards, handed out in store" };
    }
    return { icon: "receipt", text: isZh() ? "結帳時印在收據上" : "Printed on the receipt at checkout" };
  }

  function brandCard(b) {
    var m = methodText(b);
    var perSpend = isZh() ? ("每消費 $" + b.issue.perSpend + " 發一組") : ("1 code per $" + b.issue.perSpend + " spent");
    return '<article class="brand-card">' +
      '<div class="brand-card__head">' + logo(b, 48) +
        '<span class="brand-card__title">' +
          '<span class="brand-card__name">' + b.name + '</span>' +
          '<span class="brand-card__cat">' + tr(CAT, b.category) + '</span>' +
        '</span>' +
      '</div>' +
      '<p class="brand-card__blurb">' + tr(BLURB, b.blurb) + '</p>' +
      '<div class="brand-deal">' +
        '<span class="brand-deal__head"><i data-lucide="lock" class="ztor-icon"></i>' +
          '<span>' + (isZh() ? "Ztor 與品牌的既定條件" : "Set by Ztor & the brand") + '</span></span>' +
        '<span class="brand-deal__row brand-deal__row--share">' +
          '<span>' + (isZh() ? "你的分潤" : "Your cut") + '</span>' +
          '<span class="brand-deal__value">' + fullShare(b) + '</span></span>' +
        '<span class="brand-deal__row"><span>' + (isZh() ? "發放規則" : "Code issued") + '</span>' +
          '<span class="brand-deal__value">' + perSpend + '</span></span>' +
        '<span class="brand-deal__row"><span>' + (isZh() ? "粉絲可得點數" : "Fan earns") + '</span>' +
          '<span class="brand-deal__value">' + b.points + (isZh() ? " 點" : " pts") + '</span></span>' +
        /* 「品牌開放期間」不是「你的活動期間」（2026-07-28 使用者指出）。
           這一欄是 Ztor 與品牌簽的合約窗，唯讀；創作者自己的活動期間是另一個值，
           在發起活動時才決定，而且必須落在這個範圍內。原本寫「合作期間」，
           在一張全是唯讀條件的卡上，很容易被讀成「我這檔要跑這麼久」。 */
        '<span class="brand-deal__row"><span>' + (isZh() ? "品牌開放期間" : "Brand available") + '</span>' +
          '<span class="brand-deal__value">' + shortDate(b.contract.from) + " – " + shortDate(b.contract.to) + '</span></span>' +
      '</div>' +
      '<div class="brand-card__foot">' +
        /* 中英文原本各說各話：中文「發起合作」、英文「Start a campaign」。
           統一成「發起活動 / Start event」（2026-07-28 使用者裁示）。
           不用「合作」是因為這個模型裡沒有合作可談——不需品牌同意、無合約、
           無獨佔（見 brand-store.js 開頭）；叫合作會讓創作者以為要等品牌點頭。 */
        '<button class="btn btn--primary btn--sm" type="button" data-brand-start="' + b.id + '">' +
          (isZh() ? "發起活動" : "Start event") + '</button>' +
        '<span class="brand-card__method"><i data-lucide="' + m.icon + '" class="ztor-icon"></i>' + m.text + '</span>' +
      '</div>' +
    '</article>';
  }

  function renderBrands() {
    var grid = document.querySelector("[data-brand-grid]");
    if (!grid || !window.ztorBrands) return;
    grid.innerHTML = window.ztorBrands.brands.map(brandCard).join("");
    if (window.ztorIcons) window.ztorIcons.applyIcons(grid);
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

  function boot() { renderList(); renderBrands(); renderDetail(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  document.addEventListener("i18n:applied", boot);
})();
