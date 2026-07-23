/* ============================================================
   field-more.js — 「顯示更多」收合欄位群的共用行為（2026-07-21）

   掛在 .field-more 上：切換 .field-more__body 的顯隱、同步 aria-expanded
   與按鈕文案（顯示更多 ⇄ 收合）。

   關鍵行為：**收起來的欄位若已經有值，初始就展開**。
   建立商品是空表單、收起來很合理；商品明細是編輯頁，同一段 markup 帶著
   真實資料，若照樣收起來等於把使用者填過的東西藏起來。用同一支元件、
   靠有沒有值決定初始狀態，兩頁就不必分岔成兩種寫法。

   載入順序：i18n.js 之後（按鈕文案靠 data-i18n 由 applyI18n 重填）。
   動態插入的區塊呼叫 window.ZtorFieldMore.mount(scope) 補掛。
   ============================================================ */
(function () {
  'use strict';

  function hasValue(body) {
    return Array.prototype.some.call(
      body.querySelectorAll('input, select, textarea'),
      function (el) {
        if (el.tagName === 'SELECT') return !!el.value;
        return !!(el.value && String(el.value).trim());
      }
    );
  }

  function setOpen(root, open) {
    var body = root.querySelector('.field-more__body');
    var toggle = root.querySelector('.field-more__toggle');
    var label = toggle && toggle.querySelector('[data-field-more-label]');
    root.setAttribute('data-open', open ? 'true' : 'false');
    if (body) body.hidden = !open;
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (label) {
      label.setAttribute('data-i18n', open ? 'field.show-less' : 'field.show-more');
      label.textContent = open ? 'Show less' : 'Show more';
      if (window.applyI18n) window.applyI18n(label.parentNode);
    }
  }

  function init(root) {
    if (root.dataset.fieldMoreReady) return;
    root.dataset.fieldMoreReady = '1';
    var body = root.querySelector('.field-more__body');
    var toggle = root.querySelector('.field-more__toggle');
    if (!body || !toggle) return;
    setOpen(root, hasValue(body));
    toggle.addEventListener('click', function () {
      setOpen(root, root.getAttribute('data-open') !== 'true');
    });
  }

  function mount(scope) {
    (scope || document).querySelectorAll('.field-more').forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { mount(); });
  } else {
    mount();
  }

  window.ZtorFieldMore = { mount: mount, setOpen: setOpen };
})();
