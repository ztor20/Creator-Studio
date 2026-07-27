/* ============================================================
   Brand partners — renders the catalogue a creator picks a collab from.

   Every commercial figure on this page comes from the Ztor↔brand deal
   and is rendered read-only. The creator chooses WHICH brand and, later,
   their own window and batch size — never the rate.
   ============================================================ */
(function () {
  "use strict";

  function isZh() { return document.documentElement.lang === "zh-Hant"; }

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
  function tr(map, key) {
    var e = map[key]; if (!e) return key;
    return isZh() ? e.zh : e.en;
  }

  function money(n) { return "$" + n.toLocaleString("en-US"); }

  /* The creator's cut, phrased the way they would say it out loud. */
  function shareText(b) {
    if (b.share.type === "percent") {
      return isZh() ? (b.share.value + "% 分潤") : (b.share.value + "% of purchase");
    }
    var per = tr(PER, b.share.per);
    return isZh() ? ("每" + per + " $" + b.share.value) : ("$" + b.share.value + " per " + per);
  }

  function dateRange(a, b) {
    var f = function (s) {
      var p = s.split("-");
      return isZh() ? (p[0] + "/" + p[1]) : (p[1] + "/" + p[0].slice(2));
    };
    return f(a) + " – " + f(b);
  }

  /* Distribution method, said in terms of what the BRAND has to do —
     that is what decides whether a store will actually cooperate. */
  function methodText(b) {
    if (b.method === "batch") {
      return { icon: "printer", text: isZh()
        ? "預印卡片，門市直接發放"
        : "Pre-printed cards, handed out in store" };
    }
    return { icon: "receipt", text: isZh()
      ? "結帳時印在收據上"
      : "Printed on the receipt at checkout" };
  }

  function cardHtml(b) {
    var m = methodText(b);
    var perSpend = isZh()
      ? ("每消費 $" + b.issue.perSpend + " 發一組")
      : ("1 code per $" + b.issue.perSpend + " spent");

    return '<article class="brand-card">' +
      '<div class="brand-card__head">' +
        '<span class="brand-card__logo">' +
          '<img src="assets/brands/' + b.id + '.svg" alt="" ' +
               'onerror="this.remove()">' +
          '<span class="brand-card__mark" style="background:' + b.colour + '">' + b.mark + '</span>' +
        '</span>' +
        '<span style="min-width:0">' +
          '<span class="brand-card__name">' + b.name + '</span>' +
          '<span class="brand-card__cat">' + tr(CAT, b.category) + '</span>' +
        '</span>' +
      '</div>' +

      '<p class="brand-card__blurb">' + tr(BLURB, b.blurb) + '</p>' +

      '<div class="brand-deal">' +
        '<span class="brand-deal__head">' +
          '<i data-lucide="lock" class="ztor-icon"></i>' +
          '<span>' + (isZh() ? "Ztor 與品牌的既定條件" : "Set by Ztor & the brand") + '</span>' +
        '</span>' +
        '<span class="brand-deal__row brand-deal__row--share">' +
          '<span>' + (isZh() ? "你的分潤" : "Your cut") + '</span>' +
          '<span class="brand-deal__value">' + shareText(b) + '</span>' +
        '</span>' +
        '<span class="brand-deal__row">' +
          '<span>' + (isZh() ? "發放規則" : "Code issued") + '</span>' +
          '<span class="brand-deal__value">' + perSpend + '</span>' +
        '</span>' +
        '<span class="brand-deal__row">' +
          '<span>' + (isZh() ? "粉絲可得點數" : "Fan earns") + '</span>' +
          '<span class="brand-deal__value">' + b.points + (isZh() ? " 點" : " pts") + '</span>' +
        '</span>' +
        '<span class="brand-deal__row">' +
          '<span>' + (isZh() ? "合作期間" : "Deal runs") + '</span>' +
          '<span class="brand-deal__value">' + dateRange(b.contract.from, b.contract.to) + '</span>' +
        '</span>' +
      '</div>' +

      '<div class="brand-card__foot">' +
        '<a class="btn btn--primary btn--sm" href="brand-campaigns.html?brand=' + b.id + '">' +
          (isZh() ? "發起合作" : "Start a campaign") + '</a>' +
        '<span class="brand-card__method"><i data-lucide="' + m.icon + '" class="ztor-icon"></i>' + m.text + '</span>' +
      '</div>' +
    '</article>';
  }

  function render() {
    var grid = document.querySelector("[data-brand-grid]");
    if (!grid || !window.ztorBrands) return;
    grid.innerHTML = window.ztorBrands.brands.map(cardHtml).join("");
    if (window.ztorIcons) window.ztorIcons.applyIcons(grid);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
  document.addEventListener("i18n:applied", render);
})();
