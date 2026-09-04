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
      if (gone && !spacer.style.height) spacer.style.height = bar.offsetHeight + 'px';
      on = gone;
      mini.hidden = !gone;
      crumb.hidden = gone;
      if (gone) measure();
      bar.classList.toggle('is-stuck', gone);
      if (!gone) spacer.style.height = '';
      if (gone && typeof o.onStick === 'function') o.onStick();
    }

    (embed ? window : scroller).addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', function () { if (on) measure(); }, { passive: true });
    sync();
  }

  window.ZtorDetailTopbar = { init: init };
})();
