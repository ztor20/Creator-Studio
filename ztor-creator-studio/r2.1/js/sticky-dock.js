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

      setupFilterCollapse(dock);
    });
  }

  /* ── 貼頂態的篩選段：放得下靠右，放不下收進圖示鈕（2026-07-28 L 裁示）─────────
     量測而不是猜斷點：pill 的數量會隨模式改變（沒有符合的狀態會被藏起來），文字寬度
     又隨語系變，任何寫死的 media query 都會在某個組合上猜錯。這裡直接比對
     「篩選段要多寬」與「這一行還剩多寬」。 */
  function setupFilterCollapse(dock) {
    var bars   = dock.querySelector('.list-dock__bars') || dock;
    var row    = dock.querySelector('.list-status-row');
    var bar    = dock.querySelector('.list-toolbar');
    var btn    = dock.querySelector('.list-toolbar__filter');
    if (!row || !bar || !btn) return;

    var badge = btn.querySelector('.list-toolbar__filter-count');

    function close() {
      dock.classList.remove('is-filters-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    /* 迴圈防護，三道，缺一不可——第一版只有同步重入閘，實測直接把 renderer 卡死：
         1) measure() 會改 dock 的 class → 版面改變 → ResizeObserver 下一幀再叫一次
            measure()。ResizeObserver 是非同步的，同步閘擋不住跨幀的自我觸發。
         2) 所以真正的閘是「寬度沒變就什麼都不做」——自我觸發的那一次寬度必然相同，
            於是鏈條在第二次就斷掉。
         3) 再加遲滯（hysteresis）：收合後版面會空出空間，若用同一個門檻判斷就會
            立刻覺得「放得下」而展開、展開後又放不下……在臨界寬度上無限抖動。
            展開的門檻比收合的門檻多留 24px，臨界點附近就穩定了。 */
    var lastW = -1, raf = 0;
    function run() {
      var w = bars.clientWidth;
      if (w === lastW) return;
      lastW = w;
      doMeasure(w);
    }
    /* force ＝同步跑，不排 rAF。
       原因（實測）：分頁不在前景時瀏覽器會暫停 requestAnimationFrame，整條量測鏈
       就停在那裡——頁面在背景分頁載入、之後才被切到前景時，初次量測永遠不會發生，
       而那時也不會有 resize 事件來補救，於是 dock 一直停在未量測的狀態。
       非同步只用來合併 observer 的連發，那種情況本來就只在前景才有意義。 */
    function measure(force) {
      if (force) { lastW = -1; run(); return; }
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; run(); });
    }
    function doMeasure(w) {
      if (!dock.classList.contains('is-snapped')) {
        dock.classList.remove('is-filters-collapsed');
        close();
        return;
      }
      var collapsed = dock.classList.contains('is-filters-collapsed');
      /* 收合時 row 是浮層，量不到它在行內要多寬。用 nav + select 的內容寬相加代替，
         不必為了量測把 class 拆掉再裝回去（那本身就是一次會觸發 observer 的版面變動）。 */
      var need = 0;
      Array.prototype.forEach.call(row.children, function (c) { need += c.scrollWidth; });
      need += 24;                                  /* row 自己的 gap ＋ 左分隔線留白 */
      /* 工作列要多寬，不能直接讀 bar.scrollWidth：收合態它被拉滿整條（list-toolbar.css
         把 flex 改成 1 1 auto，動作群才會靠右），量到的是「這一行有多寬」而不是「它要
         多寬」，have 於是恆為負數、再寬的螢幕也回不到展開態。
         改成加總子項的內容寬——tabs 與動作群在兩種狀態下都維持內容寬，量到的是同一件事。 */
      var barNeed = 0;
      Array.prototype.forEach.call(bar.children, function (c) { barNeed += c.scrollWidth; });
      var have = w - barNeed - 28;
      var collapse = collapsed ? need > have - 24  /* 遲滯：展開要比收合多 24px 餘裕 */
                               : need > have;
      if (collapse === collapsed) return;
      dock.classList.toggle('is-filters-collapsed', collapse);
      if (!collapse) close();
    }

    /* 有幾個篩選正在生效——收起來的東西如果正在作用卻看不出來，那不是收納是隱瞞。
       只數「不是 all／不是預設」的：狀態 pill 的 active 值不是 all，加上分類下拉不是 all。 */
    function syncCount() {
      if (!badge) return;
      var n = 0;
      var active = row.querySelector('.filter-tabs__item--active');
      if (active && active.dataset.state && active.dataset.state !== 'all') n++;
      row.querySelectorAll('select').forEach(function (s) {
        if (s.value && s.value !== 'all') n++;
      });
      badge.textContent = String(n);
      badge.hidden = n === 0;
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !dock.classList.contains('is-filters-open');
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

    if (window.ResizeObserver) new ResizeObserver(function () { measure(); }).observe(bars);
    window.addEventListener('resize', function () { measure(true); });
    /* 語系換了字寬會變，但容器寬度不變 → 必須 force，否則被「寬度沒變」那道閘擋掉。 */
    document.addEventListener('i18n:applied', function () { measure(true); syncCount(); });
    /* 貼頂／脫黏改變可用寬度。只在 is-snapped 真的變了才重量，避免我們自己切
       is-filters-collapsed／is-filters-open 時又把自己叫醒一次。 */
    var wasSnapped = dock.classList.contains('is-snapped');
    new MutationObserver(function () {
      var now = dock.classList.contains('is-snapped');
      if (now === wasSnapped) return;
      wasSnapped = now;
      measure(true);
    }).observe(dock, { attributes: true, attributeFilter: ['class'] });
    /* 回到前景時補量一次：在背景分頁裡發生的寬度變化沒有 rAF 也沒有 resize 通知。 */
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) measure(true);
    });
    measure(true);
    syncCount();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
