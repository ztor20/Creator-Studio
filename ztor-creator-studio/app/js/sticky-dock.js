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
      /* 工作列是必要的；狀態列選配（2026-08-01）——站上出現了第二種骨架：
         只有分頁、沒有次層篩選的工作列（earnings-sony 的總覽／版稅）。原本要求
         兩排俱全，那種頁面就完全吃不到這套貼頂，只能各自手刻一份貼頂樣式，
         正是「同一視覺角色兩種做法」。放寬成選配即可共用，setupFilters()
         本來就會在找不到狀態列時自己返回。 */
      if (!toolbar) return;   /* 骨架不符就不貼頂，也不要弄壞版面 */
      var bars = document.createElement('div');
      bars.className = 'list-dock__bars';
      dock.insertBefore(bars, toolbar);
      bars.appendChild(toolbar);
      if (statusRow) bars.appendChild(statusRow);

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

      setupFilters(dock);
    });
  }

  /* ── 貼頂態的次層篩選：一律收進篩選鈕（2026-07-29 L 裁示）───────────────────
     取代 2026-07-28 的量測版（放得下靠右、放不下才收）。那一版要在執行期比對
     「篩選段要多寬」與「這一行還剩多寬」，為此帶著遲滯、三道迴圈防護、rAF 與
     visibilitychange 補量——全部是為了馴服一個答案會變的設計：同一個元件在不同頁、
     不同語系、不同資料下長成不同的樣子。現在規則是常數（貼頂＝收合），那些全部不需要，
     這支只剩「開關浮層」與「把浮層錨到鈕下面」兩件事。

     這裡不再有 is-filters-collapsed：狀態少一個，CSS 也少一層組合。 */
  function setupFilters(dock) {
    var bars = dock.querySelector('.list-dock__bars') || dock;
    var row  = dock.querySelector('.list-status-row');
    var btn  = dock.querySelector('.list-toolbar__filter');
    if (!row || !btn) return;

    var badge = btn.querySelector('.list-toolbar__filter-count');

    function close() {
      dock.classList.remove('is-filters-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    /* 浮層錨點：鈕在 bars 內的左緣。鈕移到 tab 旁之後位置會隨 tab 文字寬變動
       （語系、計數都會改），所以量一次寫進 CSS 變數，而不是猜一個固定值。
       只在貼頂態量得到——非貼頂時鈕是 display:none，offsetLeft 為 0。 */
    function anchor() {
      if (!dock.classList.contains('is-snapped')) return;
      var x = btn.offsetLeft;
      var host = btn.offsetParent;
      while (host && host !== bars) { x += host.offsetLeft; host = host.offsetParent; }
      bars.style.setProperty('--dock-filter-x', x + 'px');
    }

    /* 有幾個篩選正在生效——收起來的東西如果正在作用卻看不出來，那不是收納是隱瞞。
       「生效」＝偏離預設，不是「有值」。
       2026-07-29 修：原本數的是 select.value !== 'all'。那條規則是照 projects 的分類
       下拉寫的（它真的有一個 value='all' 的選項），IP 市場的條件併進本列之後就失準——
       租金上限 12%、地區 Worldwide 都是預設值，卻各被算成一個生效中的篩選，
       徽章在什麼都沒篩的情況下顯示 2（實測截圖）。改成比對 defaultSelected／
       defaultChecked：不管那一頁的選項叫什麼，「跟預設不一樣」才算數。
       pill 的鍵各頁不同（projects 用 data-state、IP 市場用 data-status-val），兩個都認。 */
    function syncCount() {
      if (!badge) return;
      var n = 0;
      var active = row.querySelector('.filter-tabs__item--active');
      if (active) {
        var v = active.dataset.state || active.dataset.statusVal;
        if (v && v !== 'all') n++;
      }
      row.querySelectorAll('select').forEach(function (s) {
        var def = 0;
        for (var i = 0; i < s.options.length; i++) if (s.options[i].defaultSelected) { def = i; break; }
        if (s.selectedIndex !== def) n++;
      });
      row.querySelectorAll('input[type="checkbox"]').forEach(function (c) {
        if (c.checked !== c.defaultChecked) n++;
      });
      badge.textContent = String(n);
      badge.hidden = n === 0;
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !dock.classList.contains('is-filters-open');
      if (open) anchor();          /* 開之前重量一次：tab 計數／語系可能已經改過鈕的位置 */
      dock.classList.toggle('is-filters-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
    /* 點外面關掉；Esc 關掉並把焦點還給鈕（浮層的標準行為，同 dropdown）。 */
    document.addEventListener('click', function (e) {
      if (!dock.classList.contains('is-filters-open')) return;
      if (row.contains(e.target) || btn.contains(e.target)) return;
      close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dock.classList.contains('is-filters-open')) { close(); btn.focus(); }
    });
    /* 選了一個篩選就關起來——浮層的工作結束了，繼續擋著清單只會礙事。 */
    row.addEventListener('click', function (e) {
      if (e.target.closest('.filter-tabs__item')) { syncCount(); close(); }
    });
    row.addEventListener('change', syncCount);

    window.addEventListener('resize', anchor);
    /* 換語系 tab 字寬會變，鈕跟著移位，錨點要重量。 */
    document.addEventListener('i18n:applied', function () { anchor(); syncCount(); });
    /* 脫黏時把浮層關掉——靜止態那兩排本來就攤開了，留一個開著的浮層蓋在上面沒有意義。 */
    var wasSnapped = dock.classList.contains('is-snapped');
    new MutationObserver(function () {
      var now = dock.classList.contains('is-snapped');
      if (now === wasSnapped) return;
      wasSnapped = now;
      if (now) anchor(); else close();
    }).observe(dock, { attributes: true, attributeFilter: ['class'] });
    syncCount();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
