/* ============================================================
   Finance overview — Deck for Sony 版收入管理頁的互動
   移植自 ztor cocreate 站 finance-overview.html（ds.js 的 fin-filter /
   fin-drawer / ledger-pager），改寫成 R2.1 自包含 vanilla JS（無 fetch、
   file:// 可跑）。掛在 earnings-sony.html 尾端載入。

   負責四件事：
     1) 存入類型分段篩選（data-fin-legend）— 聚焦走勢圖對應線、依 data-fin-types
        篩「我的項目」列、改金額欄標題、無符合列時顯示對應類型的空狀態
     2) 類別／身分／日期下拉（data-fin-dd）— 疊加篩選「我的項目」列
     3) 兩張表的數字分頁（data-fin-pager / data-fin-histpager）
     4) 兩個抽屜（data-drawer-open / -close / scrim / Esc）開關
   全部只讀寫 class／attribute，不改頁面資料。
   ============================================================ */
(function () {
  'use strict';
  var T = function (k) { return (window.i18nT && window.i18nT(k)) || k; };

  /* ---------- 彈窗（canonical .payout-modal / .payout-dialog）---------- */
  function openModal(key) {
    var m = document.querySelector('.payout-modal[data-modal="' + key + '"]');
    if (!m) return;
    m.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModals() {
    document.querySelectorAll('.payout-modal[data-modal]').forEach(function (m) { m.hidden = true; });
    document.body.style.overflow = '';
  }
  document.addEventListener('click', function (e) {
    var open = e.target.closest('[data-drawer-open]');
    if (open) { e.preventDefault(); openModal(open.getAttribute('data-drawer-open')); return; }
    if (e.target.closest('[data-drawer-close]')) { e.preventDefault(); closeModals(); return; }
    /* 點遮罩（.payout-modal 本身、非對話框內）關閉 */
    var overlay = e.target.closest('.payout-modal[data-modal]');
    if (overlay && !e.target.closest('.payout-dialog')) closeModals();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.querySelector('.payout-modal[data-modal]:not([hidden])')) closeModals();
  });

  /* ---------- 通用數字分頁 ---------- */
  /* rows：要分頁的 <tr> 陣列；size：每頁筆數；nav：.pager 容器。
     回傳 render(page) 供外部呼叫；分頁只在該批 rows 上運作（篩選後可重建）。 */
  function makePager(getRows, size, nav) {
    if (!nav) return function () {};
    var page = 1;
    function render(p) {
      var rows = getRows();
      var pages = Math.max(1, Math.ceil(rows.length / size));
      if (p != null) page = p;
      if (page > pages) page = pages;
      rows.forEach(function (r, i) {
        r.hidden = !(i >= (page - 1) * size && i < page * size);
      });
      nav.innerHTML = '';
      if (pages <= 1) return;
      var prev = btn('‹', page > 1, function () { render(page - 1); });
      nav.appendChild(prev);
      for (var n = 1; n <= pages; n++) (function (n) {
        var b = btn(String(n), true, function () { render(n); });
        if (n === page) b.setAttribute('aria-current', 'page');
        nav.appendChild(b);
      })(n);
      nav.appendChild(btn('›', page < pages, function () { render(page + 1); }));
    }
    function btn(label, enabled, onClick) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn--ghost btn--sm';
      b.textContent = label;
      if (!enabled) b.disabled = true;
      else b.addEventListener('click', onClick);
      return b;
    }
    render(1);
    return render;
  }

  /* ---------- 我的項目：類型 × 類別 × 身分 篩選 ---------- */
  var table = document.querySelector('[data-fin-table]');
  var legend = document.querySelector('[data-fin-legend]');
  var chart = document.querySelector('.fin-chart');
  var state = { type: 'all', cat: 'all', role: 'all' };

  if (table) {
    var allRows = Array.prototype.slice.call(table.querySelectorAll('[data-fin-rows] > tr'));
    var scroll = table.querySelector('.fin-scroll');
    var emptyCard = table.querySelector('[data-fin-empty]');
    var emptyTitle = table.querySelector('[data-fin-empty-title]');
    var emptyText = table.querySelector('[data-fin-empty-text]');
    var countEl = table.querySelector('[data-fin-count]');
    var amtHead = table.querySelector('[data-fin-amt-head]');
    var pagerNav = table.querySelector('[data-fin-pager]');

    function rowMatches(r) {
      var types = (r.getAttribute('data-fin-types') || '').split(/\s+/);
      var roles = (r.getAttribute('data-fin-role') || '').split(/\s+/);
      if (state.type !== 'all' && types.indexOf(state.type) < 0) return false;
      if (state.cat !== 'all' && r.getAttribute('data-fin-cat') !== state.cat) return false;
      if (state.role !== 'all' && roles.indexOf(state.role) < 0) return false;
      return true;
    }
    var matched = allRows.slice();
    var pager = makePager(function () { return matched; }, 8, pagerNav);

    function applyEmptyCopy() {
      if (!emptyCard) return;
      var titleKey = state.type === 'all' ? 'fin.empty.title.all' : 'fin.empty.title.type';
      var textKey = 'fin.empty.text.' + state.type;
      if (emptyTitle) emptyTitle.setAttribute('data-i18n', titleKey);
      if (emptyText) emptyText.setAttribute('data-i18n', textKey);
      if (window.applyI18n) window.applyI18n(emptyCard);
    }
    function relabelAmount() {
      if (!amtHead) return;
      if (state.type === 'all') { amtHead.setAttribute('data-i18n', 'fin.col.amount'); }
      else {
        amtHead.removeAttribute('data-i18n');
        amtHead.textContent = T('fin.type.' + state.type) + ' ' + T('fin.col.amount');
      }
      if (window.applyI18n) window.applyI18n(amtHead.parentElement || amtHead);
    }
    function refilter() {
      matched = allRows.filter(rowMatches);
      allRows.forEach(function (r) { if (matched.indexOf(r) < 0) r.hidden = true; });
      if (countEl) countEl.textContent = String(matched.length);
      var empty = matched.length === 0;
      if (scroll) scroll.hidden = empty;
      if (pagerNav) pagerNav.hidden = empty;
      if (emptyCard) emptyCard.hidden = !empty;
      if (empty) applyEmptyCopy(); else pager(1);
      relabelAmount();
    }
    table.__refilter = refilter;   // 供 legend 區塊透過 fin:refilter 事件呼叫

    /* 類別／身分／日期下拉：設 label、更新 state、重篩 */
    table.querySelectorAll('[data-fin-dd]').forEach(function (dd) {
      var kind = dd.getAttribute('data-fin-dd');
      var label = dd.querySelector('[data-fin-dd-label]');
      dd.querySelectorAll('[data-fin-opt]').forEach(function (opt) {
        opt.addEventListener('click', function () {
          var val = opt.getAttribute('data-fin-opt');
          if (label) { label.textContent = opt.textContent; label.removeAttribute('data-i18n'); }
          dd.open = false;
          if (kind === 'cat') state.cat = val;
          else if (kind === 'role') state.role = val;
          if (kind !== 'date') refilter();   // 日期為展示用，不改列
        });
      });
    });
  }

  /* ---------- 類型分段篩選（圖表聚焦 + 表格篩選）---------- */
  if (legend) {
    legend.querySelectorAll('[data-fin-type]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        legend.querySelectorAll('[data-fin-type]').forEach(function (c) { c.classList.remove('chip--active'); });
        chip.classList.add('chip--active');
        state.type = chip.getAttribute('data-fin-type');
        /* 圖表聚焦：'all' 全亮；有線的類型只亮該線；無線的類型全暗 */
        if (chart) {
          chart.querySelectorAll('[data-fin-line]').forEach(function (l) { l.classList.remove('is-focus'); });
          if (state.type === 'all') { chart.removeAttribute('data-focus'); }
          else {
            chart.setAttribute('data-focus', state.type);
            chart.querySelectorAll('[data-fin-line="' + state.type + '"]').forEach(function (el) { el.classList.add('is-focus'); });
          }
        }
        if (table) { /* refilter 定義在 table 區塊內，透過事件重呼 */ }
        document.dispatchEvent(new CustomEvent('fin:refilter'));
      });
    });
  }
  /* 讓 legend 與 table 兩區塊解耦：table 監聽 fin:refilter */
  if (table) {
    document.addEventListener('fin:refilter', function () {
      /* refilter 在 table 閉包內；用一個掛在 table 的參照呼叫 */
      if (table.__refilter) table.__refilter();
    });
  }

  /* ---------- 圖表期間 tabs（純視覺切換）---------- */
  var period = document.querySelector('[data-fin-period]');
  if (period) {
    period.querySelectorAll('.segmented__item').forEach(function (t) {
      t.addEventListener('click', function () {
        period.querySelectorAll('.segmented__item').forEach(function (x) {
          x.classList.remove('segmented__item--active'); x.setAttribute('aria-selected', 'false');
        });
        t.classList.add('segmented__item--active'); t.setAttribute('aria-selected', 'true');
      });
    });
  }

  /* ---------- 提領歷史抽屜分頁 ---------- */
  var histRows = document.querySelectorAll('[data-fin-histrows] > tr');
  makePager(function () { return Array.prototype.slice.call(histRows); }, 6,
    document.querySelector('[data-fin-histpager]'));
})();
