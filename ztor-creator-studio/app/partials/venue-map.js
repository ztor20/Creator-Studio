/* venue-map.js — 依完整地址產生的活動地點地圖（D369 決定二，2026-10-07 建）
 *
 * 產品規則（D369）：地圖不另設欄位、不可手動拖動定位，依活動的「完整地址」自動產生；
 * bookyay 帶入的活動與自建活動同一套。
 * 原型呈現（ASSUMPTIONS UIA-216）：站上自給自足、不接外部地圖服務——不嵌 iframe、不載外部 script。
 * 畫面是一張靜態示意地圖：自繪街道底圖（依地址文字算出四種擺法之一）＋中央定位針＋地址一行＋
 * 「在地圖中開啟」連結（地址文字組成地圖搜尋網址，只是一個 <a>，不嵌入外部內容）。
 * 樣式：ds-components/venue-map.css。
 *
 * 用法：
 *   window.ztorVenueMap.html({ address, label, alt, strip })   // → markup 字串；address 空白時回 ''
 *     address：完整地址（必填，空白不畫）
 *     label：  連結文字（預設 i18n 'vmap.open'）
 *     alt：    地圖的替代文字（預設 i18n 'vmap.alt'，{a} 換成地址）
 *     strip：  true＝表單裡的扁長預覽（.venue-map--strip，3:1；地址已在上方欄位，說明列只留連結）
 *   window.ztorVenueMap.url(address)                     // → 地圖搜尋網址
 * 畫完後由宿主呼叫 ztorIcons.applyIcons() 補上連結的 icon（同站上其他動態 markup）。
 */
(function () {
  'use strict';

  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* 地址文字 → 0..3：同一個地址永遠同一張圖，換地址才換（只是視覺上的「依地址產生」，不代表真實位置） */
  function variant(address) {
    var h = 0, s = String(address || '');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 4;
  }
  var FLIP = ['', 'translate(320 0) scale(-1 1)', 'translate(0 180) scale(1 -1)', 'translate(320 180) scale(-1 -1)'];

  /* 自繪街道底圖（viewBox 320×180＝16:9）：一條河、一塊公園、兩條主幹道、幾條小路。
     顏色全由 CSS 角色變數決定（--vm-*），這裡只畫形狀。 */
  function streets(v) {
    return '<svg class="venue-map__streets" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<g' + (FLIP[v] ? ' transform="' + FLIP[v] + '"' : '') + '>' +
        '<path class="venue-map__water" d="M-10 140 C 60 120, 110 170, 190 150 S 290 120, 330 138 L 330 190 L -10 190 Z"/>' +
        '<rect class="venue-map__park" x="196" y="22" width="78" height="46" rx="8"/>' +
        '<path class="venue-map__minor" stroke-width="3" d="M0 30 H320 M0 64 H320 M0 104 H190 M60 0 V150 M128 0 V140 M250 70 V130 M290 0 V120"/>' +
        '<path class="venue-map__road" stroke-width="9" d="M-10 86 C 80 80, 200 92, 330 84"/>' +
        '<path class="venue-map__road" stroke-width="7" d="M176 -10 C 168 50, 186 110, 160 190"/>' +
      '</g>' +
    '</svg>';
  }
  var PIN = '<svg viewBox="0 0 32 40" aria-hidden="true" focusable="false">' +
    '<path class="venue-map__pin-body" d="M16 0C7.2 0 0 7 0 15.7 0 27.5 16 40 16 40s16-12.5 16-24.3C32 7 24.8 0 16 0z"/>' +
    '<circle class="venue-map__pin-dot" cx="16" cy="15.5" r="5.5"/></svg>';

  function url(address) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(String(address || '').trim());
  }

  function html(opts) {
    var o = opts || {};
    var a = String(o.address || '').trim();
    if (!a) return '';
    var alt = (o.alt || T('vmap.alt', 'Map: {a}')).replace('{a}', a);
    var label = o.label || T('vmap.open', 'Open in Maps');
    return '<figure class="venue-map' + (o.strip ? ' venue-map--strip' : '') + '" data-venue-map>' +
      '<div class="venue-map__canvas" role="img" aria-label="' + esc(alt) + '">' +
        streets(variant(a)) +
        '<span class="venue-map__pin">' + PIN + '</span>' +
      '</div>' +
      '<figcaption class="venue-map__caption">' +
        /* strip（表單預覽）：地址就在正上方的欄位裡，說明列不再重述、只留連結 */
        (o.strip ? '' : '<span class="venue-map__address">' + esc(a) + '</span>') +
        '<a class="venue-map__open" href="' + esc(url(a)) + '" target="_blank" rel="noopener noreferrer">' +
          '<span' + (o.label ? '' : ' data-i18n="vmap.open"') + '>' + esc(label) + '</span><i data-lucide="external-link" class="ztor-icon"></i></a>' +
      '</figcaption>' +
    '</figure>';
  }

  window.ztorVenueMap = { html: html, url: url };
})();
