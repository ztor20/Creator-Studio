/* ============================================================
   section-tabs.js · 分節分頁的行為：點了捲到那一段、捲動時亮目前那一段（2026-09-21）

   外觀在 ds-components/section-tabs.css；本檔只管三件事：
     1. 點分頁 → 平滑捲到對應的段（捲動容器可以是元素或 window；扣掉蓋在上緣的固定列）
     2. scrollspy → 捲動時把「最靠近上緣的那一段」標成目前段（捲到底就算最後一段，
        否則太短的末段永遠選不到）
     3. 鍵盤 → ←／→／Home／End 在分頁之間移焦點，Enter／Space 是 <button> 原生行為

   ── 用法 ────────────────────────────────────────────────────
     <nav class="section-tabs" data-section-tabs
          data-st-scroller=".payout-dialog__body"     選配：捲動容器（nav.closest → 同層查詢 → 全文件）
          data-st-offset=".wizard__top"               選配：蓋在捲動區上緣的固定列，可逗號分隔多個
          aria-label="…">
       <div class="tabs tabs--underline-short tabs--underline-label">
         <button type="button" class="tabs__item" data-st-tab="content"><span>內容物</span></button>
         …
       </div>
     </nav>
     捲動區裡：<section data-st-section="content">…</section>

     ZtorSectionTabs.init(root?)   掃 root（預設 document）底下還沒接線的 [data-section-tabs]；
                                   動態重畫的宿主（bundle-editor 每次 render 換 innerHTML）畫完再呼叫一次
     ZtorSectionTabs.sync(root?)   外部重排後要求重新定位（通常不必，scroll 事件自己會跑）

   ── 為什麼不用 IntersectionObserver ─────────────────────────
   要的是「哪一段最靠近上緣」這個順序關係，IO 回報的是「有沒有露出來」；三段長短差很多
   （內容段可能佔兩個畫面、命名段只有半個），用 IO 得再自己算一次位置。直接讀位置最直白，
   scroll 事件用 rAF 節流，一次捲動只算一輪。

   ── 沒有固定列在捲動區裡 ────────────────────────────────
   兩個消費處都把這一排併進既有的頂列（見 CSS 檔頭），列不在捲動區內，偏移量通常是 0；
   data-st-offset 是給「頂列本身就 sticky 在捲動區裡」的宿主（建立流程的 .wizard__top）用的：
   把它的下緣到捲動區上緣的距離扣掉，段落標題才不會捲到頂列底下。
   ============================================================ */
(function () {
  'use strict';

  var GAP = 16;          /* 跳轉後段落標題離上緣的呼吸空間；也是定位判定線的下移量 */
  var HOLD_MAX_MS = 2500; /* 點分頁後 scrollspy 最多讓路多久：正常情況由「到達目標」或 scrollend 提前解除，
                             這只是平滑捲動被中斷（使用者反向捲、內容重排）時的保險 */

  function resolve(nav, sel) {
    if (!sel) return null;
    var el = nav.closest(sel);
    if (!el && nav.parentElement) el = nav.parentElement.querySelector(sel);
    return el || document.querySelector(sel);
  }
  function scrollRootOf(el) {
    var n = el.parentElement;
    while (n && n !== document.body) {
      var oy = getComputedStyle(n).overflowY;
      if (oy === 'auto' || oy === 'scroll') return n;
      n = n.parentElement;
    }
    return null;   /* null＝window */
  }
  function reduceMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setup(nav) {
    if (nav.dataset.stReady === '1') return;
    nav.dataset.stReady = '1';

    var scroller = resolve(nav, nav.dataset.stScroller) || scrollRootOf(nav);
    var scope = scroller || document;
    var tabs = Array.prototype.slice.call(nav.querySelectorAll('[data-st-tab]'));
    if (!tabs.length) return;
    var sections = {};
    var keys = [];
    tabs.forEach(function (t) {
      var k = t.dataset.stTab;
      var sec = scope.querySelector('[data-st-section="' + k + '"]');
      if (!sec) return;
      sections[k] = sec;
      keys.push(k);
    });
    if (!keys.length) return;

    var offEls = (nav.dataset.stOffset || '').split(',')
      .map(function (s) { return resolve(nav, s.trim()); })
      .filter(Boolean);
    /* nav 自己若坐在捲動區裡（第三種宿主：直接 sticky），它也蓋住上緣。 */
    if (scroller ? scroller.contains(nav) : true) offEls.push(nav);

    /* 幾何都以「捲動區的可視上緣」為原點：元素用 getBoundingClientRect 扣掉容器的 top；
       window 時容器 top 就是 0。 */
    function originTop() { return scroller ? scroller.getBoundingClientRect().top : 0; }
    function topOf(el) { return el.getBoundingClientRect().top - originTop(); }
    function offset() {
      var o = 0, origin = originTop();
      offEls.forEach(function (el) {
        var b = el.getBoundingClientRect().bottom - origin;
        if (b > o) o = b;
      });
      return o;
    }
    function scrollTop() { return scroller ? scroller.scrollTop : (window.scrollY || document.documentElement.scrollTop || 0); }
    function viewH() { return scroller ? scroller.clientHeight : window.innerHeight; }
    function scrollH() { return scroller ? scroller.scrollHeight : document.documentElement.scrollHeight; }

    var current = null;
    function setActive(key) {
      if (key === current) return;
      current = key;
      tabs.forEach(function (t) {
        var on = t.dataset.stTab === key;
        t.classList.toggle('tabs__item--active', on);
        if (on) t.setAttribute('aria-current', 'location'); else t.removeAttribute('aria-current');
      });
    }

    /* 點分頁後的讓路：平滑捲動途中會經過別的段，scrollspy 若照常跑，選中態會先跳回經過的段、
       到站再跳回來。以「到站」解除（|scrollTop − 目標| ≤ 2，或已捲到底）而不是固定毫秒——
       瀏覽器的平滑捲動時長不固定（分頁在背景時還會延後起跑），時間猜不準。 */
    var pending = null;   /* { key, target, until } */
    function atTarget() {
      if (!pending) return true;
      if (Math.abs(scrollTop() - pending.target) <= 2) return true;
      if (scrollTop() + viewH() >= scrollH() - 2) return true;
      return Date.now() > pending.until;
    }
    function sync() {
      if (pending) {
        if (!atTarget()) return;
        pending = null;
      }
      var line = offset() + GAP + 1;
      var cur = keys[0];
      if (scrollTop() + viewH() >= scrollH() - 2) {
        cur = keys[keys.length - 1];
      } else {
        keys.forEach(function (k) { if (topOf(sections[k]) <= line + 8) cur = k; });
      }
      setActive(cur);
    }

    function go(key) {
      var sec = sections[key];
      if (!sec) return;
      var target = Math.max(0, Math.min(scrollTop() + topOf(sec) - offset() - GAP, scrollH() - viewH()));
      pending = { key: key, target: Math.round(target), from: scrollTop(), until: Date.now() + HOLD_MAX_MS };
      setActive(key);
      var opts = { top: target, behavior: reduceMotion() ? 'auto' : 'smooth' };
      if (scroller) scroller.scrollTo(opts); else window.scrollTo(opts);
      setTimeout(function () { if (pending) { pending = null; sync(); } }, HOLD_MAX_MS + 20);
    }

    nav.addEventListener('click', function (e) {
      var b = e.target.closest('[data-st-tab]');
      if (!b || !nav.contains(b)) return;
      e.preventDefault();
      go(b.dataset.stTab);
    });
    nav.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = tabs.length - 1;
      if (j === null) return;
      e.preventDefault();
      tabs[j].focus();
    });

    /* rAF 節流的 scrollspy */
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; sync(); });
    }
    (scroller || window).addEventListener('scroll', onScroll, { passive: true });
    /* 支援 scrollend 的瀏覽器：平滑捲動一停就解除讓路（到站判定的補強，不支援就靠上面那條） */
    (scroller || window).addEventListener('scrollend', function () {
      /* 還沒動過（上一段捲動的 scrollend 晚到）就不算到站，繼續讓路 */
      if (pending && scrollTop() === pending.from) return;
      pending = null; sync();
    }, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    /* 把自己的高度寫給捲動容器（沒有容器就寫在 <html>），讓同一捲動區裡的其他 sticky 元件
       （例如右欄預覽卡 --preview-col-top）可以把這一排的高度算進去。 */
    (scroller || document.documentElement).style.setProperty('--section-tabs-h', nav.offsetHeight + 'px');

    nav._stSync = sync;
    sync();
  }

  function init(root) {
    (root || document).querySelectorAll('[data-section-tabs]').forEach(setup);
  }
  function sync(root) {
    (root || document).querySelectorAll('[data-section-tabs]').forEach(function (nav) {
      if (nav._stSync) nav._stSync();
    });
  }

  window.ZtorSectionTabs = { init: init, sync: sync };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();
