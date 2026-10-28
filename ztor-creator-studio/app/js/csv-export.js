/* csv-export.js · 匯出 CSV 的共用工具（D416，2026-10-15）
   ------------------------------------------------------------------
   兩處匯出共用：訂單管理（orders.html）與活動詳情的交易明細（event-detail.html）。
   規格：5.1.5.3 F2「匯出」、5.1.6.3 §2.7「匯出」。

   window.ztorCsv
     · build(headers, rows)   → 完整 CSV 字串：UTF-8 BOM 開頭、逗號分隔、列以 CRLF 結尾；
                                含逗號、雙引號、換行的欄位加雙引號，內部雙引號重複一次（RFC 4180）。
     · download(name, text)   → 瀏覽器端產檔下載（Blob + <a download>）。
     · confirm(opts)          → 匯出視窗：這次匯出什麼（筆數＋篩選條件）、（訂單管理才有）「包含收件資料」核取框、
                                這個範圍的匯出紀錄（最近 3 筆，可展開全部）、匯出 N 筆／取消。
                                opts: { title, count, withShip, note, scope, filters, onExport(includeShip) }
                                2026-10-28 使用者：匯出紀錄改在這個視窗看，工具列的「匯出紀錄」鈕退場（openLog 保留給舊呼叫）。
     · fileRange(from, to)    → 檔名用的起訖日期字串；兩邊都沒填回傳「全部」。
     · safeName(s)            → 檔名不能含的字元換成空白。
     · run(opts)              → 匯出中提示＋產檔下載＋寫一筆匯出紀錄（D424 決定 3、4，2026-10-15）。
                                opts: { scope, name, count, filters, make() → CSV 文字 }
                                右下角 toast「匯出中…」（ztorToast place:'corner' tone:'busy'），約 1 秒後原地轉成
                                「匯出完成」並觸發下載；同一刻寫進匯出紀錄。版本閘 O41 關閉時不顯示匯出中提示、
                                直接下載＋底部完成 toast（O39 原行為）；O42 關閉時不寫紀錄。
     · openLog(opts)          → 匯出紀錄視窗：誰、何時、篩選條件、筆數、檔名，新的在上。opts: { scope, title }
     · log(scope)             → 讀某個範圍的紀錄陣列（新的在前）。

   匯出紀錄（D424 決定 4）：創作者與 Admin 都看得到；原型存在 localStorage（key ztor.export.log，重新整理保留，
   上限 200 筆）。scope 區分來源：'orders'＝訂單管理、'tx:<活動 id>'＝那一場活動的交易明細。
   「誰」記目前的身分與名稱：創作者本人＝persona 名稱；Admin 代管＝「Admin · 代管 <創作者>」。
   篩選條件存成結構（[{ k: 標籤 key, v: 值, vk: 值的 key }]），顯示時才翻譯——切語言後舊紀錄跟著換。

   視窗沿用既有 canonical 對話框殼（.payout-modal／.payout-dialog，站上所有確認彈窗同一套）
   ＋ .zcheck 核取框，沒有新 CSS；組裝規則寫在 design-system.md §5.1.12（Export confirm）。
   視窗在第一次開啟時才建立，整頁共用一份；文字每次開啟都重讀 i18n，語言切換後立即生效。
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  var T = function (k, fb) { return (window.i18nT && window.i18nT(k)) || fb; };

  function cell(v) {
    if (v == null) return '';
    var s = String(v);
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function build(headers, rows) {
    var lines = [headers].concat(rows).map(function (r) { return r.map(cell).join(','); });
    return '﻿' + lines.join('\r\n') + '\r\n';
  }

  function download(name, text) {
    var blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name; a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
  }

  function safeName(s) { return String(s || '').replace(/[\\\/:*?"<>|\r\n]+/g, ' ').replace(/\s+/g, ' ').trim(); }

  function fileRange(from, to) {
    if (from && to) return from + T('csv.file.to', '_to_') + to;
    if (from) return from + T('csv.file.onward', '_onward');
    if (to) return T('csv.file.until', 'until_') + to;
    return T('csv.file.all', 'all');
  }

  /* ── 確認視窗 ─────────────────────────────────────────────── */
  var modal = null, cur = null;

  function ensure() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'payout-modal';
    modal.hidden = true;
    modal.innerHTML =
      /* 2026-10-28：寬度回到預設 620（原 --narrow 460）——下半部要放匯出紀錄，一列要裝檔名與兩行小字 */
      '<div class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="csv-title">' +
        '<div class="payout-dialog__head">' +
          '<h3 class="payout-dialog__title" id="csv-title" data-csv-title></h3>' +
          '<button class="btn btn--icon btn--sm" type="button" data-csv-close aria-label="Close"><i data-lucide="x" class="ztor-icon"></i></button>' +
        '</div>' +
        '<div class="payout-dialog__body">' +
          '<div class="export-summary">' +
            '<div class="export-summary__count"><span class="export-summary__num" data-csv-num></span><span class="export-summary__unit" data-csv-unit></span></div>' +
            '<p class="export-summary__filters" data-csv-filters></p>' +
          '</div>' +
          '<div class="field mt-16" data-csv-ship-wrap hidden>' +
            '<label class="zcheck"><span class="zcheck__control"><input class="zcheck__input" type="checkbox" data-csv-ship><span class="zcheck__box"></span></span>' +
              '<span class="zcheck__label" data-csv-ship-label></span></label>' +
            '<div class="field__hint mt-8" data-csv-ship-hint></div>' +
          '</div>' +
          '<div class="field__hint mt-16" data-csv-note hidden></div>' +
          '<section class="export-history" data-csv-hist aria-labelledby="csv-hist-title">' +
            '<div class="export-history__head"><h4 class="export-history__title" id="csv-hist-title" data-csv-hist-title></h4>' +
              '<p class="export-history__sub" data-csv-hist-sub></p></div>' +
            '<div class="data-list" data-csv-hist-list></div>' +
            '<p class="field__hint" data-csv-hist-empty hidden></p>' +
            '<button class="btn btn--ghost btn--sm export-history__more" type="button" data-csv-hist-more hidden></button>' +
          '</section>' +
        '</div>' +
        '<div class="payout-dialog__foot">' +
          '<button class="btn btn--ghost btn--sm" type="button" data-csv-close data-csv-cancel></button>' +
          '<button class="btn btn--primary btn--sm" type="button" data-csv-go></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(modal);
    modal.querySelectorAll('[data-csv-close]').forEach(function (el) { el.addEventListener('click', close); });
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
    modal.querySelector('[data-csv-hist-more]').addEventListener('click', function () { if (cur) { cur.histAll = !cur.histAll; renderHist(); } });
    modal.querySelector('[data-csv-go]').addEventListener('click', function () {
      if (!cur) return;
      var fn = cur.onExport, ship = !!(cur.withShip && modal.querySelector('[data-csv-ship]').checked);
      close();
      if (fn) fn(ship);
    });
    return modal;
  }

  function close() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('is-modal-open');
    cur = null;
  }

  function confirm(opts) {
    var m = ensure();
    cur = opts;
    var n = opts.count || 0;
    m.querySelector('[data-csv-title]').textContent = opts.title;
    /* 這次匯出什麼：大字筆數＋單位；下一行寫「照目前的篩選結果」＋篩選條件（同紀錄列的寫法，上下讀法一致） */
    m.querySelector('[data-csv-num]').textContent = n.toLocaleString('en-US');
    m.querySelector('[data-csv-unit]').textContent = T('csv.unit', 'orders');
    m.querySelector('[data-csv-filters]').textContent = n
      ? T('csv.scope', 'Following your current filters — {filters}').replace('{filters}', filterText(opts.filters))
      : T('csv.none', 'No orders match your current filters, so there is nothing to export.');
    var shipWrap = m.querySelector('[data-csv-ship-wrap]');
    shipWrap.hidden = !opts.withShip;
    m.querySelector('[data-csv-ship]').checked = false;     /* 預設不勾：個資預設不外流（D416） */
    m.querySelector('[data-csv-ship-label]').textContent = T('csv.ship', 'Include shipping details (name, phone, address)');
    m.querySelector('[data-csv-ship-hint]').textContent = T('csv.ship.hint', 'By default only the buyer name and email are exported.');
    var note = m.querySelector('[data-csv-note]');
    note.hidden = !opts.note;
    note.textContent = opts.note || '';
    m.querySelector('[data-csv-cancel]').textContent = T('csv.cancel', 'Cancel');
    cur.histAll = false;
    renderHist();
    var go = m.querySelector('[data-csv-go]');
    go.textContent = n ? T('csv.go.n', 'Export {n}').replace('{n}', n.toLocaleString('en-US')) : T('csv.go', 'Export');
    go.disabled = !n;
    m.querySelector('[data-csv-close][aria-label]').setAttribute('aria-label', T('csv.close', 'Close'));
    m.hidden = false;
    document.body.classList.add('is-modal-open');
    (n ? go : m.querySelector('[data-csv-cancel]')).focus();
  }

  /* 匯出視窗下半部：這個範圍的匯出紀錄（D424 決定 4；版本閘 O42 關閉時整塊不出現）。
     預設只露最近 3 筆、其餘用「顯示全部 N 筆」展開；和這次篩選相同的紀錄標「同樣的篩選」（比對時不看收件資料那一項——
     那是匯出選項、不是篩選），讓人在按匯出前就看得到「剛剛是不是已經匯過同一份」。 */
  var HIST_PEEK = 3;
  function filterKey(list) {
    return JSON.stringify((list || []).filter(function (f) { return f.k !== 'csv.log.f.ship'; }).map(function (f) { return [f.k, f.v]; }));
  }
  function renderHist() {
    var m = modal, sec = m.querySelector('[data-csv-hist]');
    sec.hidden = !(cur && cur.scope && featOn('O42'));
    if (sec.hidden) return;
    var rows = log(cur.scope), mine = filterKey(cur.filters);
    var shown = cur.histAll ? rows : rows.slice(0, HIST_PEEK);
    m.querySelector('[data-csv-hist-title]').textContent = T('csv.log.title', 'Export history');
    m.querySelector('[data-csv-hist-sub]').textContent = T('csv.log.sub', 'Who exported, when, with which filters, how many orders and the file name — newest first.');
    m.querySelector('[data-csv-hist-list]').innerHTML = shown.map(function (r) { return logRowHTML(r, filterKey(r.filters) === mine); }).join('');
    m.querySelector('[data-csv-hist-list]').hidden = !rows.length;
    var empty = m.querySelector('[data-csv-hist-empty]');
    empty.hidden = !!rows.length;
    empty.textContent = T('csv.log.empty.here', 'No exports yet — this export will be the first one listed here.');
    var more = m.querySelector('[data-csv-hist-more]');
    more.hidden = rows.length <= HIST_PEEK;
    more.textContent = cur.histAll ? T('csv.log.less', 'Show recent only') : T('csv.log.all', 'Show all {n}').replace('{n}', rows.length);
  }

  /* ── 匯出中提示＋匯出紀錄（D424 決定 3、4）──────────────────────────── */
  var BUSY_MS = 1000;              /* 匯出中停留約 1 秒再轉完成：原型產檔是瞬間的，留一拍讓人看得到「正在匯出」 */
  var LOG_KEY = 'ztor.export.log';
  var LOG_MAX = 200;
  var featOn = function (id) { var d = window.ztorDevState; return !(d && d.featOn && !d.featOn(id)); };

  /* 種子紀錄（2026-10-16 示範資料補齊，note/release2.4 假資料覆蓋稽核 S6）：瀏覽器還沒存過任何匯出紀錄時（key 不存在），
     先放幾筆示範，讓匯出紀錄視窗一打開就看得到兩種「誰」——創作者本人、Admin 代管——以及訂單管理與活動交易明細兩種範圍。
     第一次真的匯出就把新紀錄疊在這些種子上一起存起來（addLog 讀的是同一份）；清掉 localStorage 會回到種子。
     「誰」的名稱跟目前 persona 走（顯示時才補，同 whoNow）；檔名照實際匯出的英文命名規則。內容是原型自擬的示範，不是真實紀錄。 */
  var LOG_SEED = [
    { scope: 'tx:nick-live-taoyuan-bky', at: '2026-10-15 18:40', who: { role: 'admin' }, filters: [{ k: 'csv.log.f.status', v: 'paid', vk: 'event-detail.tx.f.paid' }],
      count: 120, file: 'Transactions_NICKTHEREAL LIVE 2026 — Taoyuan_all.csv' },
    { scope: 'tx:nick-live-taoyuan-bky', at: '2026-10-12 11:05', who: { role: 'creator' }, filters: [],
      count: 128, file: 'Transactions_NICKTHEREAL LIVE 2026 — Taoyuan_all.csv' },
    { scope: 'orders', at: '2026-10-14 16:20', who: { role: 'admin' }, filters: [{ k: 'orders.filter.type', v: 'ticket', vk: 'orders.type.ticket' }],
      count: 14, file: 'Orders_all.csv' },
    { scope: 'orders', at: '2026-06-12 09:30', who: { role: 'creator' },
      filters: [{ k: 'csv.log.f.status', v: 'paid', vk: 'orders.status.paid' }, { k: 'orders.filter.date', v: '2026-06-01 – 2026-06-11' }, { k: 'csv.log.f.ship', v: 'yes', vk: 'csv.log.f.ship.yes' }],
      count: 21, file: 'Orders_2026-06-01_to_2026-06-11.csv' }
  ];
  function seedLog() {
    var name = whoNow().name;
    return LOG_SEED.map(function (r) { var o = JSON.parse(JSON.stringify(r)); o.who.name = name; o.seed = true; return o; });
  }
  function readAll() {
    try {
      var raw = localStorage.getItem(LOG_KEY);
      if (raw == null) return seedLog();
      var a = JSON.parse(raw || '[]'); return Array.isArray(a) ? a : [];
    }
    catch (e) { return seedLog(); }
  }
  function log(scope) { return readAll().filter(function (r) { return r && r.scope === scope; }); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function nowText() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  /* 誰：Role · 身分（sidebar.js 的 window.ztorCreator）＋目前 persona 的名稱 */
  function whoNow() {
    var C = window.ztorCreator, admin = !!(C && C.adminScope && C.adminScope());
    var pid = typeof window.ztorPersonaId === 'function' ? window.ztorPersonaId() : 'default';
    var me = C && C.list ? C.list.filter(function (c) { return c.handle === pid; })[0] : null;
    return { role: admin ? 'admin' : 'creator', name: me ? me.name : '' };
  }
  function addLog(rec) {
    var all = readAll();
    all.unshift(rec);
    try { localStorage.setItem(LOG_KEY, JSON.stringify(all.slice(0, LOG_MAX))); } catch (e) {}   /* 存不了（無痕、配額）就安靜放棄，不擋下載 */
  }

  function run(opts) {
    var n = opts.count || 0;
    var finish = function () {
      download(opts.name, opts.make());
      if (featOn('O42')) addLog({ scope: opts.scope, at: nowText(), who: whoNow(), filters: opts.filters || [], count: n, file: opts.name });
      if (opts.onDone) opts.onDone();
    };
    var doneText = function () { return T('csv.done', 'Export complete · {n} orders').replace('{n}', n.toLocaleString('en-US')); };
    var Toast = window.ztorToast;
    if (!featOn('O41') || !Toast) {           /* 版本閘關閉：沿用 O39 原行為——直接下載、底部完成提示 */
      finish();
      if (Toast) Toast.show(T('csv.toast', 'Exported {n} orders').replace('{n}', n), { tone: 'success' });
      return;
    }
    var t = Toast.show(T('csv.busy', 'Exporting {n} orders…').replace('{n}', n.toLocaleString('en-US')), { place: 'corner', tone: 'busy', hold: 0 });
    setTimeout(function () {
      finish();
      t.update(doneText(), { tone: 'success' });
    }, BUSY_MS);
  }

  /* ── 匯出紀錄視窗 ─────────────────────────────────────────────
     沿用 canonical 對話框殼（.payout-modal／.payout-dialog）＋ .data-list 列（同訂單詳情撤銷視窗的品項清單）：
     一筆一列，標題＝檔名；第一行小字＝時間 · 誰；第二行＝篩選條件 · 筆數。沒有紀錄時一句空狀態。 */
  var logModal = null;
  function escH(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function whoText(w) {
    w = w || {};
    if (w.role === 'admin') return w.name ? T('csv.log.who.admin.for', 'Admin · managing {name}').replace('{name}', w.name) : 'Admin';
    var role = T('csv.log.who.creator', 'Creator');
    return w.name ? w.name + ' · ' + role : role;
  }
  function filterText(list) {
    if (!list || !list.length) return T('csv.log.nofilter', 'No filters (everything)');
    return list.map(function (f) {
      var v = f.vk ? T(f.vk, f.v) : f.v;
      return T(f.k, f.k) + T('csv.log.sep', ': ') + v;
    }).join(T('csv.log.join', ' · '));
  }
  /* 一筆紀錄一列：標題＝檔名；第一行小字＝時間 · 誰；第二行＝篩選條件 · 筆數；same＝和這次篩選相同時右側一個中性徽章 */
  function logRowHTML(r, same) {
    return '<div class="data-list__row" data-csv-log-row><div class="data-list__row-main"><div class="data-list__body">' +
      '<div class="data-list__title">' + escH(r.file) + '</div>' +
      '<div class="data-list__meta">' + escH(r.at) + ' · ' + escH(whoText(r.who)) + '</div>' +
      '<div class="data-list__meta">' + escH(filterText(r.filters)) + ' · ' +
        escH(T('csv.log.count', '{n} orders').replace('{n}', Number(r.count || 0).toLocaleString('en-US'))) + '</div>' +
    '</div></div>' +
    (same ? '<span class="badge badge--neutral">' + escH(T('csv.log.same', 'Same filters')) + '</span>' : '') +
    '</div>';
  }
  function ensureLog() {
    if (logModal) return logModal;
    logModal = document.createElement('div');
    logModal.className = 'payout-modal';
    logModal.hidden = true;
    logModal.innerHTML =
      '<div class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="csv-log-title">' +
        '<div class="payout-dialog__head">' +
          '<h3 class="payout-dialog__title" id="csv-log-title" data-csv-log-title></h3>' +
          '<button class="btn btn--icon btn--sm" type="button" data-csv-log-close aria-label="Close"><i data-lucide="x" class="ztor-icon"></i></button>' +
        '</div>' +
        '<div class="payout-dialog__body">' +
          '<p class="field__hint" data-csv-log-sub></p>' +
          '<div class="data-list mt-16" data-csv-log-list></div>' +
          '<p class="field__hint mt-16" data-csv-log-empty hidden></p>' +
        '</div>' +
        '<div class="payout-dialog__foot">' +
          '<button class="btn btn--ghost btn--sm" type="button" data-csv-log-close data-csv-log-done></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(logModal);
    if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(logModal);
    var closeLog = function () { logModal.hidden = true; document.body.classList.remove('is-modal-open'); };
    logModal.querySelectorAll('[data-csv-log-close]').forEach(function (el) { el.addEventListener('click', closeLog); });
    logModal.addEventListener('click', function (e) { if (e.target === logModal) closeLog(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !logModal.hidden) closeLog(); });
    return logModal;
  }
  function openLog(opts) {
    var m = ensureLog();
    var rows = log(opts.scope);
    m.querySelector('[data-csv-log-title]').textContent = opts.title || T('csv.log.title', 'Export history');
    m.querySelector('[data-csv-log-sub]').textContent = T('csv.log.sub', 'Every export from this page — who, when, which filters, how many orders and the file name. Creators and Admins both see it.');
    m.querySelector('[data-csv-log-list]').innerHTML = rows.map(function (r) { return logRowHTML(r, false); }).join('');
    m.querySelector('[data-csv-log-list]').hidden = !rows.length;
    var empty = m.querySelector('[data-csv-log-empty]');
    empty.hidden = !!rows.length;
    empty.textContent = T('csv.log.empty', 'No exports yet. Each export you make shows up here.');
    m.querySelector('[data-csv-log-done]').textContent = T('csv.close', 'Close');
    m.querySelector('[data-csv-log-close][aria-label]').setAttribute('aria-label', T('csv.close', 'Close'));
    m.hidden = false;
    document.body.classList.add('is-modal-open');
    m.querySelector('[data-csv-log-done]').focus();
  }

  window.ztorCsv = { build: build, download: download, confirm: confirm, fileRange: fileRange, safeName: safeName, cell: cell,
                     run: run, log: log, openLog: openLog };
})();
