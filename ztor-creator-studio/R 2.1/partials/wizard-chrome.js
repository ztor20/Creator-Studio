// partials/wizard-chrome.js — Wizard 共用：儲存狀態 + 返回離開確認（§5.2.4，2026-06-23）
//
// 行為（使用者裁示 2026-06-23）：
//  · 儲存狀態兩態：已儲存 / 儲存中（autosave 全頁啟用）。任何輸入 → 短暫「儲存中…」再回「已儲存」。
//    fallback：.wizard[data-autosave="false"] 的頁面，儲存狀態渲染成可點的「儲存」鈕，手動觸發。
//  · 返回（[data-wizard-back]）：編輯過 → 彈窗「儲存並離開／不儲存就離開」（取消＝右上 ✕）；
//    沒編輯過 → 彈窗「離開」（取消＝✕）。
//  · 驅動對象：[data-wizard-save]（沒有此屬性的頁，如 create-event 自有狀態 JS，本檔不碰其狀態，
//    仍負責編輯追蹤與離開彈窗）。
(function () {
  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }

  let started = false;
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  function init() {
    if (started) return; started = true;
    var wizard = document.querySelector('.wizard');
    if (!wizard) return;
    var autosave = wizard.dataset.autosave !== 'false';
    var edited = false;
    var state = 'saved';        // 'saved' | 'saving'
    var timer = null;

    var status = document.querySelector('[data-wizard-save]');
    var statusText = status && status.querySelector('[data-wizard-save-text]');
    var isButton = status && status.classList.contains('wizard__save-status--button');

    function renderStatus() {
      if (!status) return;
      if (isButton) {
        if (statusText) statusText.textContent = state === 'saving' ? T('wiz.saving', 'Saving…') : T('wiz.savebtn', 'Save');
        return;
      }
      status.dataset.state = state;
      if (statusText) statusText.textContent = state === 'saving' ? T('wiz.saving', 'Saving…') : T('wiz.saved.now', 'Saved · just now');
    }
    function saving() { state = 'saving'; renderStatus(); }
    function saved() { state = 'saved'; renderStatus(); }
    function autosaveTick() {
      if (!status) return;
      saving();
      clearTimeout(timer);
      timer = setTimeout(saved, 700);
    }

    // 編輯追蹤（所有頁，供離開彈窗判斷）；autosave 頁順帶觸發儲存示意
    function onEdit() {
      edited = true;
      if (autosave && status && !isButton) autosaveTick();
    }
    wizard.addEventListener('input', onEdit);
    wizard.addEventListener('change', onEdit);

    // 手動儲存鈕（fallback / 無 autosave）
    if (isButton) {
      status.addEventListener('click', function () { saving(); clearTimeout(timer); timer = setTimeout(saved, 700); });
    }

    document.addEventListener('i18n:applied', renderStatus);
    renderStatus();

    // ── 離開確認彈窗（注入一次）──
    var modal = document.createElement('div');
    modal.className = 'wizard-leave';
    modal.innerHTML =
      '<div class="wizard-leave__scrim" data-leave-cancel></div>' +
      '<div class="wizard-leave__card" role="dialog" aria-modal="true">' +
        '<button class="wizard-leave__close" type="button" data-leave-cancel aria-label="' + T('wiz.cancel', 'Cancel') + '"><i data-lucide="x" class="ztor-icon"></i></button>' +
        '<h2 class="wizard-leave__title" data-leave-title></h2>' +
        '<p class="wizard-leave__body" data-leave-body></p>' +
        '<div class="wizard-leave__actions" data-leave-actions></div>' +
      '</div>';
    document.body.appendChild(modal);
    var titleEl = modal.querySelector('[data-leave-title]');
    var bodyEl = modal.querySelector('[data-leave-body]');
    var actionsEl = modal.querySelector('[data-leave-actions]');
    if (typeof applyIcons === 'function') applyIcons(modal);

    function leave() { if (history.length > 1) history.back(); else location.href = 'index.html'; }
    function close() { modal.removeAttribute('data-open'); }
    function mkBtn(cls, label, fn) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = cls; b.textContent = label;
      b.addEventListener('click', fn);
      return b;
    }
    function open() {
      actionsEl.innerHTML = '';
      if (edited) {
        titleEl.textContent = T('wiz.leave.title.edited', 'Save before you leave?');
        bodyEl.textContent = T('wiz.leave.body.edited', 'You have edits on this page.');
        actionsEl.appendChild(mkBtn('btn btn--primary', T('wiz.leave.saveleave', 'Save and leave'), function () { if (autosave) autosaveTick(); leave(); }));
        actionsEl.appendChild(mkBtn('btn btn--ghost', T('wiz.leave.discard', 'Leave without saving'), leave));
      } else {
        titleEl.textContent = T('wiz.leave.title.clean', 'Leave this page?');
        bodyEl.textContent = T('wiz.leave.body.clean', 'You can come back anytime.');
        actionsEl.appendChild(mkBtn('btn btn--primary', T('wiz.leave.leave', 'Leave'), leave));
      }
      modal.setAttribute('data-open', '');
    }
    modal.querySelectorAll('[data-leave-cancel]').forEach(function (el) { el.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    document.querySelectorAll('[data-wizard-back]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
  }
})();
