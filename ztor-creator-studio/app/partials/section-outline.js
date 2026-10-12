/* partials/section-outline.js — 本頁大綱（長表單區段導覽）的行為層（2026-10-12）
   ============================================================================
   樣式在 ds-components/section-outline.css；這支負責：
     1. 依「頁面目前實際顯示的節」畫出清單（節標題照 DOM 現況讀，跟著 i18n 語言切換）
     2. 每一節前面的狀態圓：必填未填（todo）／已完成（done）／選填（opt），隨填寫即時更新
     3. 清單頂部「必填 N／M」摘要＋進度條（M＝目前顯示的節裡有必填欄位的節數，N＝其中已完成者）
     4. scroll-spy：捲動時目前所在節亮起（aria-current="location"）；點擊平滑捲到該節，尊重 prefers-reduced-motion
     5. 節增減（hidden 屬性／class 改變）、語言切換、輸入與變更後自動刷新（MutationObserver＋事件，節流；不輪詢）

   用法（輸入＝節容器清單＋標題＋必填判斷函式，輸出＝導覽）：

     const outline = window.ztorSectionOutline.mount({
       host:     el,                     // 導覽掛在哪（會加 .section-outline-host；--gutter 變體相對它定位）
       sections: () => [el, el, ...],    // 候選節（含目前被藏起來的）；元件自己濾掉不可見的
       title:    el => '節標題',          // 選配；預設取 .form-section__title 的文字
       group:    el => '群組標題',        // 選配（2026-10-12）：節所屬的分類；相鄰兩節群組不同時，清單在中間插一列群組標題
                                          //   （不是按鈕、不計入必填 N／M）。預設讀節的 data-outline-group；回空字串＝不分組
       status:   els => ['todo'|'done'|'opt', ...],   // 必填判斷函式：吃目前可見的節陣列，回同長度的狀態
       labels:   () => ({ title, required: 'Required {n}/{m}', todo, done, opt }),  // 文案（頁面走 i18n）
       offset:   () => px,               // 選配：頁首遮住的高度，scroll-spy 與跳節都扣掉
       observe:  el,                     // 選配：監看 hidden／class 的根（預設 host 的父層）
       gutter:   true                    // 選配：掛 .section-outline--gutter（放進頁面左側空白欄）
     });
     outline.refresh();                  // 頁面狀態變了（例如就緒檢查重算）時主動叫一次
     outline.destroy();

   判斷「必填」與「已完成」是頁面的事（status），這支不訂規則：create-product 直接讀既有的
   「Ready to sell?」就緒檢查（buildChecks），哪一節有就緒項、項目都過了沒。 */
(function () {
  'use strict';
  if (window.ztorSectionOutline) return;

  var THROTTLE = 80;   /* ms：輸入與變更類事件的刷新節流 */

  function defTitle(el) {
    var t = el.querySelector('.form-section__title') || el.querySelector('h2, h3');
    return t ? t.textContent.replace(/\s+/g, ' ').trim() : '';
  }
  function isShown(el) { return !el.hidden && el.getClientRects().length > 0; }
  function scrollerOf(el) {
    for (var p = el.parentElement; p; p = p.parentElement) {
      var o = getComputedStyle(p).overflowY;
      if ((o === 'auto' || o === 'scroll') && p.scrollHeight > p.clientHeight + 1) return p;
    }
    return document.scrollingElement || document.documentElement;
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function mount(opts) {
    var host = opts.host;
    if (!host) return null;
    var getSections = opts.sections || function () { return []; };
    var getTitle = opts.title || defTitle;
    var getGroup = opts.group || function (el) { return el.getAttribute('data-outline-group') || ''; };
    var getStatus = opts.status || function (els) { return els.map(function () { return 'opt'; }); };
    var getLabels = opts.labels || function () { return {}; };
    var getOffset = opts.offset || function () { return 0; };
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

    host.classList.add('section-outline-host');
    var root = el('nav', 'section-outline' + (opts.gutter ? ' section-outline--gutter' : ''));
    root.hidden = true;
    var inner = el('div', 'section-outline__inner');
    var head = el('div', 'section-outline__head');
    var sum = el('div', 'section-outline__sum');
    var count = el('span', 'section-outline__count');
    var bar = el('div', 'section-outline__bar');
    bar.setAttribute('aria-hidden', 'true');
    sum.appendChild(count); sum.appendChild(bar);
    var list = el('div', 'section-outline__list');
    inner.appendChild(head); inner.appendChild(sum); inner.appendChild(list);
    root.appendChild(inner);
    host.insertBefore(root, host.firstChild);

    var items = [];          /* [{ sec, btn, mk, sr, title, st }] 目前畫出來的清單 */
    var sig = '';
    var cur = -1;
    var lockUntil = 0;
    var timer = 0, raf = 0, spyRaf = 0;
    var scroller = null;

    function L() {
      var l = getLabels() || {};
      return {
        title: l.title || 'On this page',
        required: l.required || 'Required {n}/{m}',
        todo: l.todo || 'Required, not filled',
        done: l.done || 'Done',
        opt: l.opt || 'Optional'
      };
    }

    function setCount(l, n, m) {
      count.textContent = '';
      l.required.split(/(\{n\}|\{m\})/).forEach(function (part) {
        if (part === '{n}') count.appendChild(el('b', null, String(n)));
        else if (part === '{m}') count.appendChild(document.createTextNode(String(m)));
        else if (part) count.appendChild(document.createTextNode(part));
      });
    }

    function build(vis, titles, groups) {
      list.textContent = '';
      items = vis.map(function (sec, i) {
        /* 群組標題列：進到新群組的第一節前插一列（純標示，不進 items、不可點） */
        if (groups[i] && groups[i] !== groups[i - 1]) list.appendChild(el('div', 'section-outline__group', groups[i]));
        var btn = el('button', 'section-outline__item');
        btn.type = 'button';
        btn.dataset.idx = String(i);
        var mk = el('span', 'section-outline__mk');
        var ic = document.createElement('i');
        ic.setAttribute('data-lucide', 'check');
        ic.className = 'ztor-icon';
        ic.setAttribute('aria-hidden', 'true');
        mk.appendChild(ic);
        var tx = el('span', 'section-outline__text', titles[i]);
        var sr = el('span', 'u-visually-hidden');
        btn.appendChild(mk); btn.appendChild(tx); btn.appendChild(sr);
        list.appendChild(btn);
        return { sec: sec, btn: btn, mk: mk, sr: sr, title: titles[i], st: '' };
      });
      if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(list);
      cur = -1;
    }

    function update() {
      raf = 0;
      var vis = getSections().filter(isShown);
      var titles = vis.map(function (s) { return getTitle(s); });
      var groups = vis.map(function (s) { return getGroup(s) || ''; });
      var l = L();
      head.textContent = l.title;
      root.setAttribute('aria-label', l.title);

      var nextSig = titles.join('\u0001') + '\u0002' + groups.join('\u0001');
      var rebuilt = false;
      if (nextSig !== sig || vis.length !== items.length || vis.some(function (s, i) { return items[i].sec !== s; })) {
        sig = nextSig;
        build(vis, titles, groups);
        rebuilt = true;
      }
      root.hidden = items.length === 0;
      if (!items.length) return;

      var sts = getStatus(vis) || [];
      var req = 0, ok = 0;
      items.forEach(function (it, i) {
        var st = sts[i] === 'todo' || sts[i] === 'done' ? sts[i] : 'opt';
        if (st !== 'opt') { req++; if (st === 'done') ok++; }
        if (it.st !== st || rebuilt) {
          it.st = st;
          it.mk.setAttribute('data-st', st);
          it.sr.textContent = ' · ' + l[st];
        }
        it.btn.title = it.title + ' · ' + l[st];
      });
      sum.hidden = req === 0;
      setCount(l, ok, req);
      root.style.setProperty('--section-outline-progress', (req ? Math.round(ok / req * 100) : 0) + '%');
      spy();
    }

    function schedule(now) {
      if (now) {
        if (!raf) raf = requestAnimationFrame(update);
        return;
      }
      if (timer) return;
      timer = setTimeout(function () { timer = 0; schedule(true); }, THROTTLE);
    }

    function setActive(i) {
      if (i === cur) return;
      cur = i;
      items.forEach(function (it, k) {
        var on = k === i;
        it.btn.classList.toggle('is-active', on);
        if (on) it.btn.setAttribute('aria-current', 'location'); else it.btn.removeAttribute('aria-current');
      });
      /* 清單比視窗長時（內層可捲），讓亮起的那一列保持可見 */
      var b = items[i] && items[i].btn;
      if (b && inner.scrollHeight > inner.clientHeight + 1) {
        var r = b.getBoundingClientRect(), ir = inner.getBoundingClientRect();
        if (r.top < ir.top || r.bottom > ir.bottom) b.scrollIntoView({ block: 'nearest' });
      }
    }

    function spy() {
      spyRaf = 0;
      if (!items.length || performance.now() < lockUntil) return;
      var line = getOffset() + 4;
      var idx = 0;
      items.forEach(function (it, i) { if (it.sec.getBoundingClientRect().top <= line) idx = i; });
      scroller = scroller && document.contains(scroller) ? scroller : scrollerOf(items[0].sec);
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2 && scroller.scrollHeight > scroller.clientHeight + 1) idx = items.length - 1;
      setActive(idx);
    }
    function onScroll() { if (!spyRaf) spyRaf = requestAnimationFrame(spy); }

    function goTo(i) {
      var it = items[i];
      if (!it) return;
      var smooth = !(reduce && reduce.matches);
      it.sec.style.scrollMarginTop = getOffset() + 'px';
      it.sec.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
      lockUntil = performance.now() + (smooth ? 800 : 0);
      setActive(i);
      if (smooth) setTimeout(function () { lockUntil = 0; spy(); }, 850);
    }
    function onClick(e) {
      var b = e.target.closest && e.target.closest('.section-outline__item');
      if (b && root.contains(b)) goTo(Number(b.dataset.idx));
    }
    root.addEventListener('click', onClick);

    /* 刷新時機：hidden／class 變動（節增減）、輸入與變更、語言切換、上傳；全部走節流，不輪詢 */
    var watchRoot = opts.observe || host.parentElement || document.body;
    var mo = new MutationObserver(function (recs) {
      var secs = getSections();
      for (var i = 0; i < recs.length; i++) {
        var t = recs[i].target;
        if (root.contains(t)) continue;                           /* 自己的 class 變動不算 */
        if (t === watchRoot || t.contains(watchRoot)) { schedule(); return; }
        for (var j = 0; j < secs.length; j++) {
          if (t === secs[j] || t.contains(secs[j])) { schedule(); return; }
        }
      }
    });
    mo.observe(watchRoot, { attributes: true, attributeFilter: ['hidden', 'class'], subtree: true });

    var evs = ['input', 'change', 'click', 'upload:change', 'i18n:applied', 'ztor:lang-changed'];
    var onEv = function () { schedule(); };
    evs.forEach(function (n) { document.addEventListener(n, onEv); });
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    schedule(true);

    return {
      refresh: function () { schedule(true); },
      destroy: function () {
        mo.disconnect();
        evs.forEach(function (n) { document.removeEventListener(n, onEv); });
        window.removeEventListener('scroll', onScroll, { capture: true });
        window.removeEventListener('resize', onScroll);
        root.removeEventListener('click', onClick);
        clearTimeout(timer);
        if (root.parentNode) root.parentNode.removeChild(root);
      }
    };
  }

  window.ztorSectionOutline = { mount: mount };
})();
