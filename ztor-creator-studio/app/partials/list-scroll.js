/* partials/list-scroll.js — 清單橫捲包層的兩端狀態（2026-09-11）
   ============================================================================
   `.product-list-scroll` 內的握把與動作欄是 sticky（ds-components/product-list.css），
   內容從它們底下滑過去時要在靠近釘住格的地方漸變透明。CSS 自己判斷不了「現在有沒有東西
   滑到底下」、也不知道每一格在清單裡的位置，所以由這支算好寫成屬性與變數：

     data-scrolled-left   已經往右捲了 → 左邊的握把底下有內容
     data-scrolled-right  右邊還有內容沒露出 → 動作欄底下有內容
     --pls-lx / --pls-rx  容器上：左右淡出帶的起點（清單本體座標＝釘住格內緣＋scrollLeft）；
                          那一側沒被遮就寫 ±99999px，把帶子推出視野＝關掉
     --cell-x             中間每一格：自己在清單本體裡的 x（不隨捲動變，只在版面變時重量）

   淡出 mask 本身寫在 product-list.css（掛在中間每一格上、以這些變數定位）。
   兩個屬性都沒有＝清單放得下、或還停在起點且右邊已經是末端，什麼都不畫。
   捲動只改容器上的兩個變數；版面變（視窗、分頁切換換掉整張表、欄位顯隱）才重量每一格。 */
(function () {
  'use strict';
  var EDGE_L = '.product-list__drag, .product-list__head > [role="columnheader"]:first-child';
  var EDGE_R = '.product-list__actions, .product-list__head > [role="columnheader"]:last-child';
  var MID = '.product-list__row > :not(.product-list__drag):not(.product-list__actions), ' +
            '.product-list__head > [role="columnheader"]:not(:first-child):not(:last-child)';

  function widthOf(el, sel) {
    var n = el.querySelector(sel);
    return n ? n.getBoundingClientRect().width : 0;
  }
  function fadeOf(el) {
    var v = parseFloat(getComputedStyle(el).getPropertyValue('--pls-fade'));
    return isNaN(v) ? 56 : v;
  }

  /* 捲動：只更新兩個屬性與兩個變數 */
  function sync(el) {
    var max = el.scrollWidth - el.clientWidth;
    var left = el.scrollLeft > 1;
    var right = max > 1 && el.scrollLeft < max - 1;
    if (left) el.setAttribute('data-scrolled-left', ''); else el.removeAttribute('data-scrolled-left');
    if (right) el.setAttribute('data-scrolled-right', ''); else el.removeAttribute('data-scrolled-right');
    el.style.setProperty('--pls-lx', left ? (el.__plsL + el.scrollLeft) + 'px' : '-99999px');
    el.style.setProperty('--pls-rx', right ? (el.clientWidth - el.__plsR - el.__plsFade + el.scrollLeft) + 'px' : '99999px');
    el.style.setProperty('--pls-w', el.clientWidth + 'px');
    /* 代理拉桿：有東西被遮才出現，內容寬跟著清單本體，捲動位置跟著容器 */
    var bar = el.__plsBar;
    if (bar) {
      bar.hidden = !(max > 1);
      bar.firstChild.style.width = el.scrollWidth + 'px';
      if (Math.abs(bar.scrollLeft - el.scrollLeft) > 0.5) bar.scrollLeft = el.scrollLeft;
    }
  }

  /* 版面變：重量釘住格的寬與每一格的 x，再 sync 一次 */
  function layout(el) {
    var grid = el.querySelector('.product-list');
    if (!grid) return;
    el.__plsL = widthOf(el, EDGE_L);
    el.__plsR = widthOf(el, EDGE_R);
    el.__plsFade = fadeOf(el);
    var gx = grid.getBoundingClientRect().left;
    grid.querySelectorAll(MID).forEach(function (cell) {
      var r = cell.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;   /* [hidden] 列不量 */
      cell.style.setProperty('--cell-x', (r.left - gx) + 'px');
    });
    sync(el);
  }

  /* 橫捲拉桿（2026-09-11 使用者：「當有遮蔽時，下方要有一條拉吧」）：清單自己的捲軸在整張表最底下、
     搆不到；補一條只有橫向捲軸的代理容器，sticky 在頁面底緣，兩邊 scrollLeft 互相同步。 */
  function makeBar(el) {
    var bar = document.createElement('div');
    bar.className = 'product-list-scrollbar';
    bar.setAttribute('aria-hidden', 'true');
    bar.hidden = true;
    bar.appendChild(document.createElement('div'));
    el.parentNode.insertBefore(bar, el.nextSibling);
    bar.addEventListener('scroll', function () {
      if (Math.abs(el.scrollLeft - bar.scrollLeft) > 0.5) el.scrollLeft = bar.scrollLeft;
    }, { passive: true });
    return bar;
  }
  function bind(el) {
    if (el.__listScroll) return; el.__listScroll = true;
    el.__plsBar = makeBar(el);
    el.addEventListener('scroll', function () { sync(el); }, { passive: true });
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { layout(el); });
      ro.observe(el);
      var grid = el.querySelector('.product-list');
      if (grid) ro.observe(grid);
    }
    /* 分頁切換／篩選會把列藏掉或換掉整張表，寬度與每格位置跟著變 */
    if (window.MutationObserver) new MutationObserver(function () { layout(el); }).observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
    layout(el);
  }
  function all() { return document.querySelectorAll('.product-list-scroll'); }
  function mount(root) { (root || document).querySelectorAll('.product-list-scroll').forEach(bind); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); });
  else mount();
  window.addEventListener('load', function () { mount(); all().forEach(layout); });
  window.addEventListener('resize', function () { all().forEach(layout); });
  /* 字型載入完欄寬會微變 */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { all().forEach(layout); });
  window.ztorListScroll = { mount: mount, sync: function () { all().forEach(layout); } };
})();
