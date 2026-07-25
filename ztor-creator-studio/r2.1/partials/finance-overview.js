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
  var state = { type: 'all', cat: 'all' };

  /* ---------- 我的項目：依 persona 從 projects-store 產生列 ----------
     2026-07-26：原本 6 列名稱寫死在 markup（港片那批＝default persona），切到
     周湯豪（nick）persona 時名稱不會跟著換。改由 window.ztorProjects.list() 取
     當前 persona 的前 6 個專案渲染；收益類型／金額仍用固定示意值（SLOTS，依序
     套用），好讓上方的類型 chips 維持可用。類別欄用專案自己的 cat
     （movie/song/album…），data-fin-cat 與下拉選項一律用 cat 代碼比對，所以換
     persona 也不會對不上。persona 切換由 cheat code 觸發整頁 reload。
     2026-07-26 使用者：拿掉「身分」（發起人／支持者／影評人）——Creator Studio
     底下列出的都是使用者自己發起的專案，不需要身分區分，SLOTS 隨之簡化。 */
  var CAT_I18N = {
    movie: 'fin.cat.film', short: 'fin.cat.short', series: 'fin.cat.series',
    song: 'fin.cat.single', album: 'fin.cat.album', mv: 'fin.cat.mv',
    event: 'fin.cat.event', merch: 'fin.cat.merch', document: 'fin.cat.doc',
    custom: 'fin.cat.custom'
  };
  var SLOTS = [
    { types: 'cocreate ott licence',   amt: 'NTD 1,000' },
    { types: 'ott commission party',   amt: 'NTD 1,000' },
    { types: 'ott commission advance', amt: 'NTD 100'   },
    { types: 'ott',                    amt: 'NTD 100'   },
    { types: 'cocreate licence',       amt: 'NTD 100'   },
    { types: 'cocreate',               amt: 'NTD 1,590' }
  ];
  function renderMyItems(tableEl) {
    var store = window.ztorProjects;
    var body = tableEl && tableEl.querySelector('[data-fin-rows]');
    if (!store || !body) return;                 /* 沒有 store 就保留 markup 既有列 */
    var projects = store.list().slice(0, SLOTS.length);
    if (!projects.length) return;
    var html = '', cats = [];
    projects.forEach(function (p, i) {
      var slot = SLOTS[i];
      var key = CAT_I18N[p.cat] || 'fin.cat.custom';
      var label = store.catLabel(p.cat);
      if (cats.indexOf(p.cat) < 0) cats.push(p.cat);
      var img = p.poster || p.cover || '';
      html += '<tr class="fin-rowlink" data-fin-cat="' + p.cat +
              '" data-fin-types="' + slot.types + '" data-fin-go="project-detail.html?id=' + p.id + '#earnings">' +
              '<td class="ztor-table__feature"><span class="ztor-table__media">' +
                (img ? '<img class="ztor-table__thumb" src="' + img + '" alt="" loading="lazy">'
                     : '<span class="ztor-table__thumb"></span>') +
                '<span>' + p.name + '</span>' +
              '</span></td>' +
              '<td data-i18n="' + key + '">' + label.en + '</td>' +
              '<td class="fin-amt">' + slot.amt + '</td>' +
              '<td class="ztor-table__chevcell"><i data-lucide="chevron-right" class="ztor-icon ztor-icon--sm"></i></td></tr>';
    });
    body.innerHTML = html;

    /* 類別下拉重建：只列出當前 persona 這幾列真正出現的類別 */
    var menu = tableEl.querySelector('[data-fin-dd="cat"] .dropdown__menu');
    if (menu) {
      var opts = '<button class="dropdown__item" type="button" role="option" data-fin-opt="all" data-i18n="fin.cat.all">All categories</button>';
      cats.forEach(function (c) {
        var k = CAT_I18N[c] || 'fin.cat.custom';
        opts += '<button class="dropdown__item" type="button" role="option" data-fin-opt="' + c +
                '" data-i18n="' + k + '">' + store.catLabel(c).en + '</button>';
      });
      menu.innerHTML = opts;
    }
    if (window.ztorIcons) window.ztorIcons.applyIcons(tableEl);
    if (window.applyI18n) window.applyI18n(tableEl);
  }
  renderMyItems(table);

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
      if (state.type !== 'all' && types.indexOf(state.type) < 0) return false;
      if (state.cat !== 'all' && r.getAttribute('data-fin-cat') !== state.cat) return false;
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
          if (kind !== 'date') refilter();   // 日期為展示用，不改列
        });
      });
    });
  }

  /* ---------- 我的項目：整列可點 → 該專案的「我的收益」分頁 ----------
     列上帶 data-fin-go（project-detail.html?id=<專案>#earnings）。2026-07-26：
     屬性原本就在 markup 上、但從來沒有接線，所以列點了沒反應。 */
  document.addEventListener('click', function (e) {
    var row = e.target.closest('[data-fin-go]');
    if (!row) return;
    /* 列內若有連結／按鈕，讓它自己處理，不搶走 */
    if (e.target.closest('a[href], button')) return;
    var href = row.getAttribute('data-fin-go');
    if (href) window.location.href = href;
  });

  /* ---------- 類型分段篩選（圖表聚焦 + 表格篩選）---------- */
  if (legend) {
    legend.querySelectorAll('[data-fin-type]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        legend.querySelectorAll('[data-fin-type]').forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('filter-tabs__item--active', on);
          c.setAttribute('aria-selected', on ? 'true' : 'false');
        });
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
