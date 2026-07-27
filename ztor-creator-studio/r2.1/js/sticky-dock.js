/* ============================================================
   Sticky list dock — 清單頁工作列的貼頂行為，全站一致。

   使用者裁示 2026-07-28：「我的 IP 和 IP 市場的 nav bar 沒有貼頂；電子商店有貼頂
   但很醜。重新設計貼頂狀態、盡量少佔空間、用動畫轉場，然後全站的 nav 都套同一套。」

   全站涵蓋方式：比照 js/sticky-actions.js 的做法——站上的清單控制列只有一種骨架
   （.list-toolbar ＋ .list-status-row，見 ds-components/list-toolbar.css），
   所以一支共用腳本掛一個選擇器就五頁到位，不必逐頁改版型。

   這支只做一件事：判斷「捲到貼頂了沒」，然後在外層 .list-dock 上開關 .is-snapped。
   長什麼樣子全部歸 CSS（list-toolbar.css 的 Snap dock 段）。

   ── 為什麼要哨兵，不能直接觀察 dock 自己 ──────────────
   position:sticky 的元素貼住之後仍然「在視窗內」，IntersectionObserver 永遠回報
   isIntersecting:true，量不到狀態改變。標準解法是在它正上方放一個 1px 的哨兵：
   哨兵被捲出去 ＝ dock 已經貼到頂。

   ── 捲動容器不是視窗 ────────────────────────────────
   這個 app 捲的是 .main（.app 為 overflow:hidden）。IntersectionObserver 用預設的
   視窗當 root 的話永遠不會觸發，所以要往上找出真正的捲動容器當 root——
   和 sticky-actions.js 踩過的是同一個坑，做法一致。

   opt out：容器或 <body> 上加 data-no-sticky-dock。
   ============================================================ */
(function () {
  'use strict';

  var SELECTOR = '.list-dock';

  function scrollRootOf(el) {
    var n = el.parentElement;
    while (n && n !== document.body) {
      var oy = getComputedStyle(n).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight) return n;
      n = n.parentElement;
    }
    return null;   /* null＝退回視窗 */
  }

  function init() {
    if (document.body.hasAttribute('data-no-sticky-dock')) return;
    if (!('IntersectionObserver' in window)) return;   /* 不支援就維持不貼頂，不硬做 */

    document.querySelectorAll(SELECTOR).forEach(function (dock) {
      if (dock.hasAttribute('data-no-sticky-dock')) return;
      if (dock.dataset.stickyDockReady === '1') return;
      dock.dataset.stickyDockReady = '1';

      var sentinel = document.createElement('div');
      sentinel.className = 'list-dock__sentinel';
      sentinel.setAttribute('aria-hidden', 'true');
      dock.parentNode.insertBefore(sentinel, dock);

      var scrollRoot = scrollRootOf(dock);
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          dock.classList.toggle('is-snapped', !e.isIntersecting);
        });
      }, { root: scrollRoot, threshold: 0 });
      observer.observe(sentinel);

      /* 導覽在頂列／側欄之間切換時，.main 會換一個捲動容器；observer 的 root
         建立後不能改，所以重新建一顆（同 sticky-actions.js 的處置）。 */
      document.addEventListener('ztor:navmode-changed', function () {
        observer.disconnect();
        scrollRoot = scrollRootOf(dock);
        observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            dock.classList.toggle('is-snapped', !e.isIntersecting);
          });
        }, { root: scrollRoot, threshold: 0 });
        observer.observe(sentinel);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
