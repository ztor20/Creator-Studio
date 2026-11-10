/* ============================================================
   date-input.js — 日期／時間欄位的 placeholder 接線（2026-07-21）

   為什麼放共用檔：站上有 40 個日期類 input 散在 17 個檔，若要每頁自己包一層
   wrapper 與 icon，markup 會分岔、日後改 placeholder 文案要動 17 個地方。
   這支在執行期統一加工，頁面 markup 一律維持乾淨的 <input class="input" type="date">。

   做什麼
     1. 掃 input[type=date|datetime-local|time]，各包一層 .date-input
     2. 依 input 的 type 注入對應的常駐 icon 與 placeholder（見 ds-components/date-input.css）：
        date＝日曆／選擇日期、time＝時鐘／選擇時間、datetime-local＝日曆／選擇日期時間。
        （2026-08-13 修：此前三種一律日曆圖示＋「選擇日期」，於是只填時間的欄位上寫著
        「選擇日期」、旁邊還畫一個日曆——使用者圈出開放入場那一格。）
     3. 依 value 有無切 [data-empty]，空值才露 placeholder
     4. 點整格開原生日期選單（showPicker()，瀏覽器不支援就退回點原生欄位的預設行為）
     5. （2026-11-09 Q146）datetime-local 不再畫成一格：拆成「日期＋時間」兩格（.date-input-pair），
        原欄位留作值的載體，讀寫格式不變。見下方 splitDateTime。

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

    /* 這一格在問什麼，由 input 的 type 決定：只填時間的欄位配時鐘與「選擇時間」，
       日期＋時間的配日曆與「選擇日期時間」。圖示與文案一起換——只換一邊會更怪。 */
    var kind = (input.getAttribute('type') || 'date').toLowerCase();
    var BY_TYPE = {
      'time':           { icon: 'clock',    key: 'field.pick-time',     en: 'Pick a time' },
      'datetime-local': { icon: 'calendar', key: 'field.pick-datetime', en: 'Pick date & time' },
      'date':           { icon: 'calendar', key: 'field.pick-date',     en: 'Pick a date' }
    };
    var def = BY_TYPE[kind] || BY_TYPE.date;

    var icon = document.createElement('i');
    icon.setAttribute('data-lucide', def.icon);
    icon.className = 'ztor-icon date-input__icon';
    wrap.insertBefore(icon, input);

    /* placeholder 預設是「選擇日期」；欄位掛 data-ph-key（字典 key）或 data-ph（直接給字）
       就換一組——起訖兩格並排時，各自寫「開始」「結束」比兩格都寫「選擇日期」有用得多。
       （2026-08-06 新增，不掛就與先前完全相同。） */
    var ph = document.createElement('span');
    ph.className = 'date-input__ph';
    ph.setAttribute('aria-hidden', 'true');
    var phKey = input.getAttribute('data-ph-key');
    if (phKey) {
      ph.setAttribute('data-i18n', phKey);
      ph.textContent = (window.i18nT && window.i18nT(phKey)) || input.getAttribute('data-ph') || phKey;
    } else if (input.hasAttribute('data-ph')) {
      ph.textContent = input.getAttribute('data-ph');
    } else {
      ph.setAttribute('data-i18n', def.key);
      ph.textContent = (window.i18nT && window.i18nT(def.key)) || def.en;
    }
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

  /* ── Q146（2026-11-09）：日期時間一律「日期＋時間」兩格 ─────────────────────────
     頁面照舊寫 <input class="input" type="datetime-local">，它從此只當「值的載體」：
     執行期改成 type=hidden，前面長出一格 date、一格 time（.date-input-pair，與建立活動的兩格同樣子）。
     頁面 JS 讀寫載體的 .value 仍是 'YYYY-MM-DDTHH:MM'，input／change 事件也從載體發出（target 不變），
     所以各頁的存取、比較先後、預填、清空都不必改。合併規則照建立活動（create-event 的 ceDT）：
     有日期沒時間＝00:00；沒日期＝空字串。載體的 disabled／readonly／aria-invalid／required／hidden
     同步到兩格（archived-gate、鎖定、錯誤紅框照舊生效）；focus()、scrollIntoView() 轉給日期那格。 */
  var NATIVE_VALUE = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  var MIRROR_ATTRS = ['disabled', 'readonly', 'aria-invalid', 'required'];

  function splitDateTime(carrier) {
    if (carrier.__dtPair || !carrier.parentNode) return [];
    var initial = carrier.value || carrier.getAttribute('value') || '';

    var pair = document.createElement('div');
    pair.className = 'date-input-pair';
    var d = document.createElement('input');
    var t = document.createElement('input');
    d.className = t.className = 'input';
    d.type = 'date';
    t.type = 'time';
    /* 起訖兩格的自訂佔位（例：「開始」「結束」）放在日期那格；時間格用預設「選擇時間」。 */
    ['data-ph-key', 'data-ph'].forEach(function (a) { if (carrier.hasAttribute(a)) d.setAttribute(a, carrier.getAttribute(a)); });
    var al = carrier.getAttribute('aria-label');
    if (al) { d.setAttribute('aria-label', al); t.setAttribute('aria-label', al); }

    carrier.parentNode.insertBefore(pair, carrier);
    pair.appendChild(d);
    pair.appendChild(t);
    pair.appendChild(carrier);
    carrier.type = 'hidden';
    carrier.__dtPair = { pair: pair, date: d, time: t };

    var wraps = [enhance(d), enhance(t)];

    function paint(v) {
      var m = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}))?/.exec(v || '');
      d.value = m ? m[1] : '';
      t.value = m && m[2] ? m[2] : '';
      wraps.forEach(function (w, i) { if (w) syncEmpty(w, i ? t : d); });
    }

    Object.defineProperty(carrier, 'value', {
      configurable: true,
      get: function () { return NATIVE_VALUE.get.call(carrier); },
      set: function (v) {
        var s = v == null ? '' : String(v);
        NATIVE_VALUE.set.call(carrier, s);
        paint(s);
      }
    });

    function commit(e) {
      e.stopPropagation();   /* 頁面只看得到載體發出的事件，跟改版前一樣 */
      var dv = d.value, tv = t.value;
      NATIVE_VALUE.set.call(carrier, dv ? dv + 'T' + (tv || '00:00') : '');
      carrier.dispatchEvent(new Event(e.type, { bubbles: true }));
    }
    [d, t].forEach(function (c) {
      c.addEventListener('input', commit);
      c.addEventListener('change', commit);
    });

    function mirror() {
      MIRROR_ATTRS.forEach(function (a) {
        var on = carrier.hasAttribute(a);
        [d, t].forEach(function (c) {
          if (on) c.setAttribute(a, carrier.getAttribute(a)); else c.removeAttribute(a);
        });
      });
      pair.hidden = carrier.hasAttribute('hidden');
    }
    mirror();
    if (window.MutationObserver) {
      new MutationObserver(mirror).observe(carrier, { attributes: true, attributeFilter: MIRROR_ATTRS.concat('hidden') });
    }

    carrier.focus = function (o) { d.focus(o); };
    carrier.scrollIntoView = function (o) { pair.scrollIntoView(o); };

    paint(initial);
    return wraps.filter(Boolean);
  }

  function mount(scope) {
    var root = scope || document;
    var added = [];
    root.querySelectorAll(SELECTOR).forEach(function (input) {
      if ((input.getAttribute('type') || '').toLowerCase() === 'datetime-local') {
        added = added.concat(splitDateTime(input));
        return;
      }
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
