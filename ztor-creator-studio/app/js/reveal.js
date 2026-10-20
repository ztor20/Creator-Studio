// Scroll reveal — fade + slight rise for block-level content as it enters the
// viewport (IntersectionObserver). Above-the-fold blocks animate on load;
// below-the-fold blocks animate when scrolled into view. Each block reveals
// once. Honors prefers-reduced-motion (does nothing → content stays visible).
//
// Pairs with the `.reveal-on / .reveal / .is-in` CSS in shared.css.
(function () {
  var root = document.documentElement;

  // Reduced motion: leave everything visible, never hide.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Block-level targets only (avoid animating every small element). .card also
  // covers .chart-card (it carries the .card class).
  /* Audience-slide hero copy children and .hero__layer are NOT in this list —
     they're animated by hero.js runHeroIntro() via WAAPI (CSS animations on
     <h2>/<img> were unreliable in this engine, stuck at "from" values). */
  var SELECTOR = [
    '.hero__copy', '.section-head', '.kpi', '.card',
    '.tabs', '.info-banner', '.ztor-table', '.alert--row',
    '.filter-row', '.empty-stub'
  ].join(',');

  function run() {
    root.classList.add('reveal-on');

    var els = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));

    /* 2026-07-28（L 回報 create-project 有兩條捲軸；追下去才發現是這裡）
       只處理「此刻真的有被渲染」的元素。載入當下位於 display:none 子樹裡的目標
       （多步驟表單裡尚未輪到的步驟、分頁面板、預設收合的區塊）永遠不會 intersect，
       於是被永久留在起始狀態：opacity:0 ＋ translateY(10px)。
       兩個後果，都在 create-project 的募資步驟上同時發生：
         · 那張 Setup overview 卡片切過去之後是「看不見」的——不是動畫沒播，是沒播完；
         · 那 10px 位移讓卡片底部超出 .wizard-split__rail 十個像素，
           rail 因此長出一條只捲 10px 的捲軸，疊在 sheet 的捲軸旁邊＝使用者看到的兩條。
       不 tag 它們＝它們維持完全可見的預設狀態。少一次進場動畫，換掉一整類
       「切到那一步就是空白」的 bug；反正使用者也不是在捲動中遇見它們的。 */
    els = els.filter(function (el) { return el.getClientRects().length > 0; });

    // Drop any element nested inside another matched target (avoid double fade).
    els = els.filter(function (el) {
      var p = el.parentElement;
      while (p) {
        if (p.matches && p.matches(SELECTOR)) return false;
        p = p.parentElement;
      }
      return true;
    });

    // Tag + stagger by index within the same parent group.
    var groupCount = new Map();
    els.forEach(function (el) {
      el.classList.add('reveal');
      var key = el.parentNode;
      var i = groupCount.get(key) || 0;
      if (i > 0) el.style.transitionDelay = Math.min(i * 60, 240) + 'ms';
      groupCount.set(key, i + 1);
    });

    /* 進場播完就卸掉 `.reveal`／`.is-in`／行內 transition-delay（2026-10-20，可點卡片 hover 上浮的前提）：
       `html.reveal-on .reveal.is-in { transform: none }` 的權重高於任何元件的 `:hover`，
       `.kpi.reveal` 的 kpiRise 動畫又以 fill-mode `both` 永遠把 transform 釘在 translateY(0)——
       於是所有被 reveal 標到的 `.card`／`.kpi`（可點卡片的 hover 位移）一輩子上浮不了，
       行內 transition-delay（最多 240ms）還會讓 hover 的底色變化慢半拍。
       進場是一次性的，終態（opacity 1、無位移）與沒有 `.reveal` 的預設態相同，所以播完卸掉不改變畫面。
       1400ms ＝ 最長的一條（kpiRise 0.7s ＋ 最晚的 delay 0.5s）再留餘裕。 */
    function settle(el) {
      setTimeout(function () {
        el.classList.remove('reveal', 'is-in');
        el.style.transitionDelay = '';
      }, 1400);
    }

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); settle(el); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
          settle(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
