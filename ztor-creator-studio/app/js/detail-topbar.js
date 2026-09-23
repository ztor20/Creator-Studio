/* ============================================================
   detail-topbar.js · 詳情頁頂列的黏附行為（2026-09-01 抽成共用）

   起因：項目詳情與系列詳情各有一份一字不差的捲動判定，這一輪要改行為，
   不抽就得改兩處、而且遲早會分岔。第三支（活動詳情）之後接上來也走這裡。

   ── 行為（2026-09-01 使用者裁示重寫）────────────────────────────
   往下捲時：
     1. 麵包屑那一列**直接被推掉**（跟著內容捲走，不黏）
     2. 整個 hero（海報＋標題＋簡介）也捲掉
     3. 這時候才有一條精簡列從上緣滑進來（縮圖＋名稱＋頁面動作）

   ✝ 舊行為：這一列從一開始就 `position: sticky`，永遠釘在頂端，只是把內容
   由麵包屑換成縮圖＋名稱。使用者裁示改掉——頁首還在畫面上的時候，上面再壓一條
   同樣寫著項目名稱的列，等於同一件事同時出現兩次。

   ── 為什麼是 fixed 而不是 sticky ────────────────────────────────
   sticky 沒辦法「先捲走、之後再回來」：元素一旦捲出視窗上緣，sticky 就不再作用。
   所以靜止態改成一般流內元素（會被推掉），黏住態才切成 `position: fixed`。

   fixed 會讓元素離開文件流，內容會往上跳一整列的高度——所以本模組在頂列後面
   插一個 spacer，黏住時把它撐成原本那一列的高度。使用者不會看到跳動。

   fixed 的左右邊界不能寫死：全頁模式的捲動容器是 `main.main`（側欄不在裡面），
   內嵌模式是視窗本身。兩者的左右緣由 measure() 實測，寫進 CSS 變數；
   列內的左右內距再補到 `.page` 的內容框，精簡列的文字才與底下的內容切齊。

   ── 用法 ────────────────────────────────────────────────────
     ZtorDetailTopbar.init({
       bar,          頂列元素（.pd-detail__topbar／.detail-topbar）
       hero,         頁首區塊——整個捲掉之後精簡列才出現
       mini,         精簡列的內容（縮圖＋名稱），黏住時顯示
       crumb,        麵包屑，黏住時隱藏
       onStick       選配：第一次黏住時填縮圖與名稱（各頁資料來源不同）
     })
     ZtorDetailTopbar.resync()   分頁切換或內容重排後呼叫，重新判定收編

   ── Dock：收編分頁工具列（2026-09-11 使用者裁決「兩層固定要合併成一個」）──
   頂列裡有 [data-dock-tabs] 槽時啟用：黏住之後，目前分頁（.tab-panel--active）裡
   `[data-nav] > .list-toolbar`（或標了 [data-dock-source] 的 .list-toolbar）一旦捲到頂列底下，
   它的 .tabs 搬進 [data-dock-tabs]、.list-toolbar__actions 的子項搬進 [data-dock-actions]；
   原位留著高度（visibility hidden），往回捲或切分頁就還回去。tabs 的起點對齊內容欄：
   量工具列在流內時 tabs 的 x，寫成 --dock-id-w 給身分槽當寬度。
   黏住態的 [data-dock-icon] 按鈕只留 icon，文字複製到 title。CSS 在 shared.css「Dock」段。
   ============================================================ */
(function () {
  'use strict';

  function init(o) {
    var bar = o && o.bar, hero = o && o.hero, mini = o && o.mini, crumb = o && o.crumb;
    if (!bar || !hero || !mini || !crumb) return;

    var embed = document.documentElement.hasAttribute('data-embed');
    var main = document.querySelector('main.main');
    var scroller = embed ? document.scrollingElement : main;
    if (!scroller) return;

    /* 返回鍵跟著進精簡列（2026-09-11 使用者：「少了返回上一頁的 icon」）：麵包屑黏住時整個藏起來，
       裡面的「← 返回上一層」一起不見；複製一顆到縮圖前面，黏住態也回得去。 */
    var back = crumb.querySelector('.page-crumb__back');
    if (back && !mini.querySelector('.detail-topbar__back')) {
      var b2 = back.cloneNode(true);
      b2.classList.add('detail-topbar__back');
      mini.insertBefore(b2, mini.firstChild);
    }
    /* 黏住時頂替原位的佔位塊，避免內容往上跳一整列。 */
    var spacer = document.createElement('div');
    spacer.className = 'detail-topbar-spacer';
    if (bar.parentNode) bar.parentNode.insertBefore(spacer, bar.nextSibling);

    var on = null;

    /* 量出「捲動容器的左右緣」與「列內要補多少內距，內容才與 .page 切齊」。
       都以視窗座標計算——fixed 就是相對視窗定位的。 */
    function measure() {
      var page = bar.parentElement;
      if (!page) return;
      var pr = page.getBoundingClientRect();
      var ps = getComputedStyle(page);
      var padL = parseFloat(ps.paddingLeft) || 0;
      var padR = parseFloat(ps.paddingRight) || 0;
      var cLeft, cRight;   /* 容器內容區的左右緣（視窗座標） */
      if (embed || !main) {
        cLeft = 0;
        /* clientWidth 不含捲軸，用它才不會讓列比可視區寬。 */
        cRight = document.documentElement.clientWidth;
      } else {
        var mr = main.getBoundingClientRect();
        cLeft = mr.left;
        cRight = mr.left + main.clientWidth;
      }
      var st = bar.style;
      st.setProperty('--detail-bar-l', cLeft + 'px');
      /* 給寬度不給 right：right 得用 innerWidth 反推，而 innerWidth 含捲軸，
         內嵌模式下會跟實際容器差一個捲軸寬，右邊漏一條縫（實測 12px）。 */
      st.setProperty('--detail-bar-w', (cRight - cLeft) + 'px');
      /* 內距＝「.page 的內容框」減去「容器邊緣」，負值沒有意義（視窗比 page 窄時）夾到 0。 */
      st.setProperty('--detail-bar-pl', Math.max(0, (pr.left + padL) - cLeft) + 'px');
      st.setProperty('--detail-bar-pr', Math.max(0, cRight - (pr.right - padR)) + 'px');
    }

    function sync() {
      /* 門檻＝**整個 hero 都捲掉**（2026-09-01 使用者裁示）。
         舊版是 `hero.offsetTop + hero.offsetHeight − bar.offsetHeight`，
         少扣的那一列高度正是「頁首還在、精簡列已經壓上來」的那一段。
         hero.offsetTop 本來就含頂列的高度，所以不必另外加。 */
      var gone = scroller.scrollTop > hero.offsetTop + hero.offsetHeight;
      if (gone === on) return;
      /* 撐 spacer 要在切成 fixed **之前**量：切完之後元素已經離開文件流，
         offsetHeight 量到的是 fixed 之後的高度（內容換成精簡列、通常比較矮），
         用它撐 spacer 會讓內容往上跳一小段。 */
      /* 連同這一列的下外距一起撐（2026-09-11 修）：fixed 之後外距也跟著離開文件流，只撐列高
         會讓內容仍往上跳 20px；商品詳情從總覽跳到設定分頁某一節時，節首因此被橫列蓋掉一截。 */
      if (gone && !spacer.style.height) spacer.style.height = (bar.offsetHeight + (parseFloat(getComputedStyle(bar).marginBottom) || 0)) + 'px';
      on = gone;
      mini.hidden = !gone;
      crumb.hidden = gone;
      if (gone) measure();
      bar.classList.toggle('is-stuck', gone);
      if (!gone) spacer.style.height = '';
      /* 黏住態的高度寫到 .page（2026-09-11）：頁內另有吸頂的分節橫列（[data-nav] > .list-toolbar，
         商品詳情的商品設定分頁）時，它的 top 要讓出這一條，否則被壓在底下；規則在 section-nav.css。 */
      if (bar.parentElement) {
        /* 寫的是「頂列下緣到捲動容器上緣」的距離而不是列高：fixed 對視窗定位、sticky 對捲動容器定位，
           全頁模式的 main.main 上緣不在視窗 0，直接用列高會多讓出那一段。 */
        if (gone) requestAnimationFrame(function () {
          /* 用 offsetHeight 而不是 getBoundingClientRect：黏住態有從上緣滑入的動畫，動畫途中量到的下緣還在上面。
             fixed 的 top 是 0，所以下緣＝列高。 */
          var origin = (embed || !main) ? 0 : main.getBoundingClientRect().top;
          bar.parentElement.style.setProperty('--detail-bar-h', Math.max(0, bar.offsetHeight - origin) + 'px');
        });
        else bar.parentElement.style.removeProperty('--detail-bar-h');
      }
      if (gone && typeof o.onStick === 'function') o.onStick();
    }

    /* ── Dock：收編分頁工具列 ── */
    var tabsSlot = bar.querySelector('[data-dock-tabs]');
    var actSlot = bar.querySelector('[data-dock-actions]');
    var docked = null;
    function activeToolbar() {
      var panel = document.querySelector('.tab-panel--active');
      if (!panel) return null;
      return panel.querySelector('.list-toolbar[data-dock-source]') || panel.querySelector('[data-nav] > .list-toolbar');
    }
    function titleIcons() {
      bar.querySelectorAll('.btn[data-dock-icon]').forEach(function (b) {
        var sp = b.querySelector('span');
        if (sp && sp.textContent.trim()) b.title = sp.textContent.trim();
      });
    }
    function measureId(tb) {
      /* 身分槽寬度＝工具列裡 tabs 的左緣 − 頂列內容框的左緣（都以視窗座標量；工具列原位還在流內，量得到） */
      var tabs = tb.querySelector('.tabs') || tb;
      var tabsLeft = tabs.getBoundingClientRect().left;
      var br = bar.getBoundingClientRect();
      var pl = parseFloat(getComputedStyle(bar).paddingLeft) || 0;
      var w = Math.max(0, tabsLeft - (br.left + pl));
      bar.style.setProperty('--dock-id-w', w + 'px');
    }
    function dock(tb) {
      if (docked === tb) return;
      undock();
      measureId(tb);
      var nav = tb.querySelector('.tabs'), acts = tb.querySelector('.list-toolbar__actions');
      tb.style.height = tb.offsetHeight + 'px';
      if (nav && tabsSlot) tabsSlot.appendChild(nav);
      if (acts && actSlot) Array.prototype.slice.call(acts.children).forEach(function (c) { actSlot.appendChild(c); });
      tb.classList.add('is-docked');
      bar.classList.add('has-tabs');
      titleIcons();
      docked = tb;
    }
    function undock() {
      if (!docked) return;
      var nav = tabsSlot && tabsSlot.querySelector('.tabs'), acts = docked.querySelector('.list-toolbar__actions');
      if (nav) docked.insertBefore(nav, acts || null);
      if (actSlot && acts) Array.prototype.slice.call(actSlot.children).forEach(function (c) { acts.appendChild(c); });
      docked.classList.remove('is-docked');
      docked.style.height = '';
      bar.classList.remove('has-tabs');
      docked = null;
    }
    function syncDock() {
      if (!tabsSlot) return;
      var tb = on ? activeToolbar() : null;
      if (tb) {
        if (docked && docked !== tb) undock();
        var barBottom = bar.getBoundingClientRect().bottom;
        if (tb.getBoundingClientRect().top <= barBottom + 4) dock(tb); else undock();
      } else undock();
    }
    function syncAll() { sync(); syncDock(); }

    (embed ? window : scroller).addEventListener('scroll', syncAll, { passive: true });
    window.addEventListener('resize', function () { if (on) measure(); if (docked) measureId(docked); }, { passive: true });
    var origOnStick = o.onStick;
    o.onStick = function () { if (typeof origOnStick === 'function') origOnStick(); titleIcons(); };
    syncAll();
    window.ZtorDetailTopbar.resync = syncAll;
    window.ZtorDetailTopbar.isDocked = function () { return !!docked; };
  }

  window.ZtorDetailTopbar = { init: init, resync: function () {}, isDocked: function () { return false; } };
})();
