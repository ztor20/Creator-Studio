/* ============================================================
   Sticky page actions — 共用行為，全站一致。

   使用者裁示 2026-07-27：「頁面上方的 CTA 捲下去就看不到了……site wide 都要檢查，
   有上方 CTA 的頁面，捲動後要嘛吸頂、要嘛收進吸底動作列。」

   全站涵蓋方式：站上上方動作列只有兩種容器——
     .page-intro__actions（17 個頁面）與 .pd-hero__actions（專案詳情）。
   因此不需要逐頁改版型，一支共用腳本掛這兩個選擇器就全站到位。
   建立流程頁（create-*／edit-*）用的是 wizard-chrome，本來就有自己的送出列，
   選擇器不相符 → 自動不套用，不必特別排除。

   opt out：容器或 <body> 上加 data-no-sticky-actions。

   ── 幾個一定要處理的陷阱 ──────────────────────────────
   1) 複製而不是搬移：搬移會在捲動時反覆改動 DOM、打斷焦點，也讓其他持有原始
      節點參照的程式碼失準。複製則兩份並存，因此點擊一律轉發給「原始那顆」，
      行為不可能和原本分岔。
   2) 轉發時要擋掉複製品自己的事件冒泡，否則 document 層的委派處理器會同時收到
      複製品與原始品兩次，一次點擊做兩次事（例如彈窗開了又開）。
   3) 複製品要拔掉 id——同一份 id 出現兩次會讓 getElementById 抓錯人。
   4) 收起時用 hidden（display:none），不是只調透明度：看不見卻仍可 Tab 到的
      隱形按鈕，是最惱人的無障礙缺陷。
   5) 左右位置依 .main 的實際位置量測，且要在 ztor:navmode-changed 時重量——
      這個 app 的導覽有「頂列」與「側欄」兩種模式且可即時切換，寫死側欄寬度
      會在其中一種模式下整條歪掉。
   ============================================================ */
(function () {
  'use strict';

  var SELECTOR = '.page-intro__actions, .pd-hero__actions';

  function init() {
    if (document.body.hasAttribute('data-no-sticky-actions')) return;
    var source = document.querySelector(SELECTOR);
    if (!source || source.hasAttribute('data-no-sticky-actions')) return;

    /* 只有真的有可按的東西才做；空的動作列不需要吸底列 */
    var controls = source.querySelectorAll('button, a[href]');
    if (!controls.length) return;
    if (!('IntersectionObserver' in window)) return;   /* 不支援就維持現狀，不硬做 */

    var main = document.querySelector('.main') || document.body;

    /* 這個 app 捲動的不是視窗，是 .main（.app 為 overflow:hidden、.main 為
       overflow-y:auto）。IntersectionObserver 若用預設的視窗當 root，永遠不會
       判定元素「離開畫面」——吸底列就一輩子不出現。所以要往上找出真正的
       捲動容器，拿它當 root。 */
    function scrollRootOf(el) {
      var n = el.parentElement;
      while (n && n !== document.body) {
        var oy = getComputedStyle(n).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight) return n;
        n = n.parentElement;
      }
      return null;   /* null＝退回視窗，一般捲動的頁面適用 */
    }
    var scrollRoot = scrollRootOf(source);

    var bar = document.createElement('div');
    bar.className = 'sticky-actions';
    bar.setAttribute('data-sticky-actions', '');
    bar.hidden = true;
    var inner = document.createElement('div');
    inner.className = 'sticky-actions__inner';
    bar.appendChild(inner);

    /* 複製每個控制項，並記住它對應的原始節點 */
    Array.prototype.forEach.call(controls, function (el, i) {
      var clone = el.cloneNode(true);
      clone.removeAttribute('id');
      Array.prototype.forEach.call(clone.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
      clone.setAttribute('data-sticky-clone', String(i));
      el.setAttribute('data-sticky-source', String(i));
      inner.appendChild(clone);
    });
    document.body.appendChild(bar);
    if (window.ztorIcons) window.ztorIcons.applyIcons(bar);
    if (window.applyI18n) window.applyI18n(bar);

    /* 點複製品 → 擋掉自己的冒泡，改由原始節點觸發，確保只做一次 */
    bar.addEventListener('click', function (e) {
      var clone = e.target.closest('[data-sticky-clone]');
      if (!clone) return;
      e.preventDefault();
      e.stopPropagation();
      var idx = clone.getAttribute('data-sticky-clone');
      var original = source.querySelector('[data-sticky-source="' + idx + '"]');
      if (original) original.click();
    });

    /* 位置：貼齊主內容區的左右邊界（避開側欄） */
    function place() {
      /* 左右貼齊主內容區——側欄模式下視窗左緣其實壓在側欄底下。 */
      var box = (scrollRoot || main).getBoundingClientRect();
      bar.style.left = Math.max(0, Math.round(box.left)) + 'px';
      bar.style.right = Math.max(0, Math.round(window.innerWidth - box.right)) + 'px';
      /* 底部：捲動的是內層容器時貼該容器底部；捲動的是整個視窗（窄螢幕版型）
         時就貼視窗底部——否則會停在畫面下緣上方一截，看起來像沒對齊。 */
      bar.style.bottom = scrollRoot
        ? Math.max(0, Math.round(window.innerHeight - box.bottom)) + 'px'
        : '0px';
      if (!bar.hidden) padMain();
    }
    function padMain() {
      main.setAttribute('data-sticky-pad', '');
      main.style.setProperty('--sticky-actions-pad', bar.offsetHeight + 'px');
    }
    function unpadMain() {
      main.removeAttribute('data-sticky-pad');
      main.style.removeProperty('--sticky-actions-pad');
    }

    function show() {
      if (!bar.hidden) return;
      bar.hidden = false;
      bar.setAttribute('data-enter', '');       /* 先擺在下方，下一幀再滑上來 */
      place();
      requestAnimationFrame(function () { bar.removeAttribute('data-enter'); padMain(); });
    }
    function hide() {
      if (bar.hidden) return;
      bar.hidden = true;
      unpadMain();
    }

    /* 原始動作列離開畫面才顯示吸底列；捲回去就收掉。
       頁面短到那排按鈕根本不會離開畫面時，observer 不會觸發＝不會憑空多一條列。 */
    /* IntersectionObserver 的 root 建立後不能改，但捲動容器會變：
       桌機是 .main 在捲，窄螢幕改成整個視窗在捲。只在初始化時偵測一次的話，
       換到另一種版型後 observer 就永遠不會觸發（實測：手機版捲到底吸底列仍不出現）。
       因此偵測到容器換人時，整個 observer 重新建立。 */
    var observer = null;
    function attachObserver() {
      var root = scrollRootOf(source);
      if (observer && root === scrollRoot) return;   /* 沒換就不重建 */
      scrollRoot = root;
      if (observer) observer.disconnect();
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { entry.isIntersecting ? hide() : show(); });
      }, { root: scrollRoot, threshold: 0 });
      observer.observe(source);
    }
    attachObserver();

    window.addEventListener('resize', function () { attachObserver(); place(); }, { passive: true });
    /* 導覽模式切換會改變主內容區的左邊界，也可能換掉捲動容器，兩者都要重來 */
    document.addEventListener('ztor:navmode-changed', function () {
      setTimeout(function () { attachObserver(); place(); }, 0);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
