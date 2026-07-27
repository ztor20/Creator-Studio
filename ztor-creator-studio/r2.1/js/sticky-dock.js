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

      /* ── 把兩排包進一層 .list-dock__bars（2026-07-28 修）──────────────
         使用者回報：電子商店捲到貼頂時整個清單被擠成一條窄柱、篩選 pill 直排。

         原因：貼頂態的 CSS 是 `.list-dock.is-snapped { display: flex }`，而
         .list-dock 在電子商店身上並不是「只包兩排」的薄殼——那一層是刻意往下
         併吞整個商品清單的（見 e-shop.html 的註解：sticky 的可黏貼範圍受親層
         box 高度限制，親層要跟清單一樣高才黏得住整段捲動）。所以 display:flex
         一下去，三個 product-list 分頁、footer、空狀態卡全部變成同一列的 flex
         item：工作列被壓到 124px、狀態列 92px 於是 pill 直排，清單佔走其餘寬度。

         修法不是把那層改小（會讓貼頂只撐 120px 就脫黏，退回舊 bug），
         而是分工：外層繼續當「可黏貼範圍」——高、包住整個清單；
         真正 sticky 且會變成 dock 的是新的內層 .list-dock__bars，它只包兩排。

         在 JS 裡包而不是改五份 HTML：這是元件的內部結構，不是頁面的內容決定；
         而且是「移動」既有節點、不是重建，所以既有的事件監聽與
         `.myip-list-controls .list-status-row` 這類後代選擇器都不受影響。 */
      var toolbar = dock.querySelector(':scope > .list-toolbar');
      var statusRow = dock.querySelector(':scope > .list-status-row');
      if (!toolbar || !statusRow) return;   /* 骨架不符就不貼頂，也不要弄壞版面 */
      var bars = document.createElement('div');
      bars.className = 'list-dock__bars';
      dock.insertBefore(bars, toolbar);
      bars.appendChild(toolbar);
      bars.appendChild(statusRow);

      /* ── 兩種殼，兩個 sticky 落點（2026-07-28）──────────────────
         sticky 元素只能在「親層的 box」裡移動，所以貼頂該掛在哪一層，取決於這頁的
         .list-dock 到底包到哪裡——兩種都真實存在，不能一套打死：

           · 厚殼（電子商店／活動）：外層刻意往下包住整個清單（這樣可黏貼範圍才夠長）。
             這種若把外層自己設成 sticky，等於整包清單一起釘住＝畫面凍結；
             所以 sticky 掛內層 .list-dock__bars，外層只當「可黏貼範圍」。
           · 薄殼（我的 IP／IP 市場／專案）：外層只包兩排、高度約 106px。
             這種若把 sticky 掛內層，內層捲過那 106px 就脫黏；
             所以 sticky 掛外層自己，讓它在 .page 這個高容器裡travel。

         用「這個殼裡有沒有清單」來判斷，而不是寫死頁面名單——之後新增清單頁自動歸類。 */
      var isTall = !!dock.querySelector('.product-list, .project-list, .bento, [id$="-grid"]');
      dock.classList.add(isTall ? 'list-dock--tall' : 'list-dock--thin');

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
