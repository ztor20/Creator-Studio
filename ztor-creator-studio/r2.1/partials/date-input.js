/* ============================================================
   date-input.js — 日期／時間欄位的 placeholder 接線（2026-07-21）

   為什麼放共用檔：站上有 40 個日期類 input 散在 17 個檔，若要每頁自己包一層
   wrapper 與 icon，markup 會分岔、日後改 placeholder 文案要動 17 個地方。
   這支在執行期統一加工，頁面 markup 一律維持乾淨的 <input class="input" type="date">。

   做什麼
     1. 掃 input[type=date|datetime-local|time]，各包一層 .date-input
     2. 注入常駐日曆 icon 與「選擇日期」placeholder（見 ds-components/date-input.css）
     3. 依 value 有無切 [data-empty]，空值才露 placeholder
     4. 點整格開原生日期選單（showPicker()，瀏覽器不支援就退回點原生欄位的預設行為）

   載入順序：icons.js 與 i18n.js 之後（注入的 icon 與文案要靠 applyIcons／applyI18n 渲染）。
   動態插入的節點（modal 等）呼叫 window.ZtorDateInput.mount(scope) 補掛。
   ============================================================ */
(function () {
  'use strict';

  var SELECTOR = 'input[type="date"], input[type="datetime-local"], input[type="time"]';

  function syncEmpty(wrap, input) {
    wrap.setAttribute('data-empty', input.value ? 'false' : 'true');
  }

  function enhance(input) {
    if (input.closest('.date-input')) return;

    var wrap = document.createElement('span');
    wrap.className = 'date-input';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    var icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'calendar');
    icon.className = 'ztor-icon date-input__icon';
    wrap.insertBefore(icon, input);

    var ph = document.createElement('span');
    ph.className = 'date-input__ph';
    ph.setAttribute('aria-hidden', 'true');
    ph.setAttribute('data-i18n', 'field.pick-date');
    ph.textContent = 'Pick a date';
    wrap.appendChild(ph);

    syncEmpty(wrap, input);
    ['input', 'change', 'blur'].forEach(function (evt) {
      input.addEventListener(evt, function () { syncEmpty(wrap, input); });
    });

    /* 整格可點開選單：原生的日曆鈕已被 CSS 攤平成整格的透明覆蓋層，
       點在上面會走這裡；showPicker 不支援時什麼都不做，原生行為照舊。 */
    input.addEventListener('click', function () {
      if (typeof input.showPicker === 'function' && !input.disabled && !input.readOnly) {
        try { input.showPicker(); } catch (e) { /* 使用者手勢以外的呼叫會被擋，忽略 */ }
      }
    });

    return wrap;
  }

  function mount(scope) {
    var root = scope || document;
    var added = [];
    root.querySelectorAll(SELECTOR).forEach(function (input) {
      var wrap = enhance(input);
      if (wrap) added.push(wrap);
    });
    if (!added.length) return;
    if (window.ztorIcons) added.forEach(function (w) { window.ztorIcons.applyIcons(w); });
    if (window.applyI18n) added.forEach(function (w) { window.applyI18n(w); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { mount(); });
  } else {
    mount();
  }

  /* modal 這類執行期才注入的區塊（補貨、取貨場次、手動登錄、新品貼文）也要加工，
     用 observer 接住就不必每支 partial 各自記得呼叫 mount。 */
  if (window.MutationObserver) {
    new MutationObserver(function (records) {
      records.forEach(function (r) {
        r.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(SELECTOR)) { mount(node.parentNode || document); return; }
          if (node.querySelector && node.querySelector(SELECTOR)) mount(node);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  window.ZtorDateInput = { mount: mount, SELECTOR: SELECTOR };
})();
