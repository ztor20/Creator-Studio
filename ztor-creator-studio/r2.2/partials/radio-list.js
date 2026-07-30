/* ============================================================
   radio-list.js — 收合式 radio-list（.radio-list--collapsible）共用行為

   為什麼放共用檔：上架設定同時出現在五頁（建立商品／組合／拍賣、
   商品明細、組合明細），開合、觸發列同步、外點關閉這些行為若各頁自寫
   就會分岔。頁面只留「選了什麼要顯示哪個欄位」的頁面級邏輯，做法是
   監聽本檔派發的 radio-list:change（或照舊監聽選項列的 click）。

   接線方式：頁面放好 markup 後載入本檔即可，會自動 mount 全站所有
   .radio-list--collapsible。動態插入的節點呼叫
   window.ZtorRadioList.mount(scope) 補掛。

   載入順序：i18n.js 之後（切語言時觸發列靠 data-i18n 由 applyI18n 重填）。

   markup（見 design-system.html「Radio list」卡）
     .radio-list.radio-list--collapsible
       .radio-list__trigger        圓點＋標題／描述＋.radio-list__chevron
       .radio-list__options[hidden]  內含 .radio-list__item
   ============================================================ */
(function () {
  'use strict';

  var OPEN = 'data-open';

  /* 把目前選中的那一列的文字與 i18n key 複製到觸發列 */
  function syncTrigger(root) {
    var active = root.querySelector('.radio-list__item--active');
    var trigger = root.querySelector('.radio-list__trigger');
    if (!active || !trigger) return;
    ['title', 'sub'].forEach(function (part) {
      var src = active.querySelector('.radio-list__' + part);
      var dst = trigger.querySelector('.radio-list__' + part);
      if (!dst) return;
      if (!src) { dst.hidden = true; return; }
      dst.hidden = false;
      if (src.hasAttribute('data-i18n')) dst.setAttribute('data-i18n', src.getAttribute('data-i18n'));
      dst.textContent = src.textContent;
    });
  }

  function setOpen(root, open) {
    root.setAttribute(OPEN, open ? 'true' : 'false');
    var trigger = root.querySelector('.radio-list__trigger');
    var options = root.querySelector('.radio-list__options');
    if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (options) options.hidden = !open;
  }

  function isOpen(root) { return root.getAttribute(OPEN) === 'true'; }

  function closeAll(except) {
    document.querySelectorAll('.radio-list--collapsible[' + OPEN + '="true"]').forEach(function (root) {
      if (root !== except) setOpen(root, false);
    });
  }

  function init(root) {
    if (root.dataset.radioListReady) return;
    root.dataset.radioListReady = '1';

    setOpen(root, false);
    syncTrigger(root);

    var trigger = root.querySelector('.radio-list__trigger');
    if (trigger) trigger.addEventListener('click', function () {
      var next = !isOpen(root);
      closeAll(root);
      setOpen(root, next);
    });

    root.querySelectorAll('.radio-list__options .radio-list__item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.querySelectorAll('.radio-list__item').forEach(function (b) {
          b.classList.remove('radio-list__item--active');
        });
        btn.classList.add('radio-list__item--active');
        syncTrigger(root);
        setOpen(root, false);
        root.dispatchEvent(new CustomEvent('radio-list:change', { bubbles: true, detail: { item: btn } }));
      });
    });
  }

  function mount(scope) {
    (scope || document).querySelectorAll('.radio-list--collapsible').forEach(init);
  }

  /* 點到元件外面就收起；Esc 同理（收起後把焦點還給觸發列）*/
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.radio-list--collapsible')) closeAll(null);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelector('.radio-list--collapsible[' + OPEN + '="true"]');
    if (!open) return;
    setOpen(open, false);
    var trigger = open.querySelector('.radio-list__trigger');
    if (trigger) trigger.focus();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { mount(); });
  } else {
    mount();
  }

  window.ZtorRadioList = { mount: mount, setOpen: setOpen, syncTrigger: syncTrigger };
})();
