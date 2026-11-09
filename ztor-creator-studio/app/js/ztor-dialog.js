/* ============================================================
   ztorDialog — 全站共用的「確認」與「告知」彈窗（2026-11-09，STYLE-DECISIONS Q141／Q144，pattern 5.1.8 彈窗類型）

   取代瀏覽器原生 confirm()／alert()：外殼一律是 Modal shell（.payout-modal ＋ .payout-dialog--narrow），
   跟活動詳情的 openConfirm()、媒體庫的確認殼同一款。只做三類（5.1.8 的第 2、3、7 類），其他類型照 5.1.8 自己組：
     ztorDialog.confirm({ title, body, okLabel, cancelLabel, danger })  → Promise<boolean>   確認後執行／破壞性確認
       danger: true    → 紅框 .btn--destructive（5.1.11：入口是 ghost／圖示／選單項時與入口同級）
       danger: 'soft'  → 淡紅底 .btn--soft.btn--destructive（入口本身是淡紅底時）
       可以復原的動作不傳 danger（Q144），用一般主鈕。
     ztorDialog.notice({ title, body, okLabel })                         → Promise<void>      提示告知（只有「知道了」）
   body 傳純文字會自動轉義、換行變 <br>；要放 HTML 時傳 { html: '...' }。
   items: ['名稱', …]＋itemIcon（lucide 名，預設 package）→ 內文下方列出受影響的項目（.payout-dialog__list）。
   noCancel: true → 只留主鈕（擋下告知但主鈕要叫別的字時用）；cancel／×／Esc 一律回 false。
   樣式：ds-components/payout-modal.css（頁面要連它）。
   ============================================================ */
(function () {
  'use strict';
  function T(key, en) { return (window.i18nT && window.i18nT(key)) || en; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function bodyHtml(b) {
    if (b == null || b === '') return '';
    if (typeof b === 'object' && b.html != null) return b.html;
    return '<p>' + esc(b).replace(/\n/g, '<br>') + '</p>';
  }
  var seq = 0;
  function open(o, withCancel) {
    return new Promise(function (resolve) {
      var id = 'ztor-dlg-' + (++seq);
      var back = document.activeElement;   /* 關掉後焦點還回開啟前的元素（例：發布被擋時先聚焦的錯誤欄位） */
      var wrap = document.createElement('div');
      wrap.className = 'payout-modal';
      var okCls = o.danger === 'soft' ? 'btn--soft btn--destructive' : (o.danger ? 'btn--destructive' : 'btn--primary');
      wrap.innerHTML =
        '<section class="payout-dialog payout-dialog--narrow" role="dialog" aria-modal="true" aria-labelledby="' + id + '">' +
          '<div class="payout-dialog__head">' +
            '<h2 class="payout-dialog__title" id="' + id + '">' + esc(o.title || '') + '</h2>' +
            '<button class="btn btn--icon" type="button" data-dlg-x aria-label="' + esc(T('dlg.close', 'Close')) + '"><i data-lucide="x" class="ztor-icon"></i></button>' +
          '</div>' +
          '<div class="payout-dialog__body">' + bodyHtml(o.body) +
            ((o.items && o.items.length) ? '<ul class="payout-dialog__list">' + o.items.map(function (n) {
              return '<li class="payout-dialog__list-item"><i data-lucide="' + esc(o.itemIcon || 'package') + '" class="ztor-icon"></i><span>' + esc(n) + '</span></li>';
            }).join('') + '</ul>' : '') +
          '</div>' +
          '<div class="payout-dialog__foot">' +
            '<span style="flex:1"></span>' +
            ((withCancel && !o.noCancel) ? '<button class="btn btn--outline" type="button" data-dlg-cancel>' + esc(o.cancelLabel || T('dlg.cancel', 'Cancel')) + '</button>' : '') +
            '<button class="btn ' + okCls + '" type="button" data-dlg-ok>' + esc(o.okLabel || (withCancel ? T('dlg.confirm', 'Confirm') : T('dlg.ok', 'Got it'))) + '</button>' +
          '</div>' +
        '</section>';
      document.body.appendChild(wrap);
      document.body.classList.add('is-modal-open');
      if (window.ztorIcons) window.ztorIcons.applyIcons(wrap);
      var okBtn = wrap.querySelector('[data-dlg-ok]');
      okBtn.focus();
      function done(v) {
        document.removeEventListener('keydown', onKey, true);
        wrap.remove();
        if (!document.querySelector('.payout-modal:not([hidden])')) document.body.classList.remove('is-modal-open');
        if (back && back.focus && document.contains(back)) back.focus();
        resolve(v);
      }
      function onKey(e) {
        if (e.key === 'Escape') { e.stopPropagation(); done(false); }
        if (e.key === 'Tab') {   /* 焦點留在彈窗內 */
          var f = wrap.querySelectorAll('button'); var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
      document.addEventListener('keydown', onKey, true);
      wrap.addEventListener('click', function (e) {
        if (e.target.closest('[data-dlg-ok]')) done(true);
        else if (e.target.closest('[data-dlg-cancel],[data-dlg-x]')) done(false);
      });
    });
  }
  window.ztorDialog = {
    confirm: function (o) { return open(o || {}, true); },
    notice: function (o) { return open(o || {}, false).then(function () {}); }
  };
})();
