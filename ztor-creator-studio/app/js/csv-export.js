/* csv-export.js · 匯出 CSV 的共用工具（D416，2026-10-15）
   ------------------------------------------------------------------
   兩處匯出共用：訂單管理（orders.html）與活動詳情的交易明細（event-detail.html）。
   規格：5.1.5.3 F2「匯出」、5.1.6.3 §2.7「匯出」。

   window.ztorCsv
     · build(headers, rows)   → 完整 CSV 字串：UTF-8 BOM 開頭、逗號分隔、列以 CRLF 結尾；
                                含逗號、雙引號、換行的欄位加雙引號，內部雙引號重複一次（RFC 4180）。
     · download(name, text)   → 瀏覽器端產檔下載（Blob + <a download>）。
     · confirm(opts)          → 匯出確認視窗：顯示筆數、（訂單管理才有）「包含收件資料」核取框、匯出／取消。
                                opts: { title, count, withShip, note, onExport(includeShip) }
     · fileRange(from, to)    → 檔名用的起訖日期字串；兩邊都沒填回傳「全部」。
     · safeName(s)            → 檔名不能含的字元換成空白。

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
      '<div class="payout-dialog payout-dialog--narrow" role="dialog" aria-modal="true" aria-labelledby="csv-title">' +
        '<div class="payout-dialog__head">' +
          '<h3 class="payout-dialog__title" id="csv-title" data-csv-title></h3>' +
          '<button class="btn btn--icon btn--sm" type="button" data-csv-close aria-label="Close"><i data-lucide="x" class="ztor-icon"></i></button>' +
        '</div>' +
        '<div class="payout-dialog__body">' +
          '<div data-csv-count></div>' +
          '<div class="field mt-16" data-csv-ship-wrap hidden>' +
            '<label class="zcheck"><span class="zcheck__control"><input class="zcheck__input" type="checkbox" data-csv-ship><span class="zcheck__box"></span></span>' +
              '<span class="zcheck__label" data-csv-ship-label></span></label>' +
            '<div class="field__hint mt-8" data-csv-ship-hint></div>' +
          '</div>' +
          '<div class="field__hint mt-16" data-csv-note hidden></div>' +
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
    m.querySelector('[data-csv-count]').textContent = n
      ? T('csv.count', '{n} orders will be exported, following your current filters.').replace('{n}', n.toLocaleString('en-US'))
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
    var go = m.querySelector('[data-csv-go]');
    go.textContent = T('csv.go', 'Export');
    go.disabled = !n;
    m.querySelector('[data-csv-close][aria-label]').setAttribute('aria-label', T('csv.close', 'Close'));
    m.hidden = false;
    document.body.classList.add('is-modal-open');
    (n ? go : m.querySelector('[data-csv-cancel]')).focus();
  }

  window.ztorCsv = { build: build, download: download, confirm: confirm, fileRange: fileRange, safeName: safeName, cell: cell };
})();
