/* ============================================================
   view-mode.js — 兩段式編輯面板的檢視態讀數（2026-09-21，STYLE-DECISIONS Q119）

   使用者裁決：兩段式面板（[data-editable] ＋ data-mode="view"|"edit"）在檢視態的**表單欄位**
   一律是純文字——「檢視就是看、不該長得像能填」；按「編輯」才變回輸入框。與表格那邊的 Q118
   同一個原則（product-detail 的 ecText／renderEditCombos(m, editable)）。

   ── 做法：讀數節點，不是把輸入框藏起來裝作文字 ──────────────
   每個「控件根」（見下）後面插一顆 <span class="field-readout" data-vm-readout>，
   檢視態由 shared.css 顯示讀數、藏控件；編輯態反過來。控件本身留在 DOM、值不動、
   各頁既有的 readonly／快照／還原／儲存邏輯一行都不用改——這支只負責「把現值寫成字」。

   控件根（一格一顆讀數）：
     · [data-vm-group]：把一組並排的輸入框（長 × 寬 × 高）併成一句——屬性值是分隔字串，
       子輸入框各自取值後串起來；[data-vm-suffix] 可補單位（" cm"）
     · .amount-field（含 .zstep 步進器）：整格，文字＝前綴單位＋數字（千分位）或數字＋後綴單位
     · .date-input（partials/date-input.js 包起來的 date／time／datetime-local）：整格，
       文字＝值原樣（datetime-local 的 T 換成空白），不做地區化——站上日期一律 ISO
     · 其餘 input（text／number／url／email…）與 textarea：自己就是根
   不碰（各有自己的檢視態規則或本來就是「狀態展示」）：
     · .variant-table 裡的格子（Q118，由頁面 JS 畫 .variant-cell--ro）
     · .tag-input（chips 本身就是值，shared.css 只收掉框與 ×；一顆 chip 都沒有時才補一個「—」）
     · .zselect__native／.select（下拉：觸發鈕上的字就是目前值，shared.css 把它畫成純文字）
     · checkbox／radio／.switch／.segmented／.radio-list／.selection-card／.zcheck（開關與單選＝狀態展示，Q119 例外）
     · [data-edit-exempt] 區段（方案編輯器、活動準備清單——自己有編輯態，不歸兩段式管）
     · file／hidden 型 input、[data-vm-skip] 標記的元素

   文字規則：空值「—」；placeholder 永遠不當值顯示；金額可由頁面掛 format(root, input) 走
   該頁既有的格式函式（product-detail 傳 money()，維持與表格同一種寫法）。

   ── 什麼時候重算 ─────────────────────────────────────────
   · 面板 data-mode 變成 view（MutationObserver，微任務時機——在同一個 click handler 裡
     「先還原值再切模式」或「先切模式再還原值」都來得及）
   · 面板子樹被重畫（社群連結列、選項編輯器這類 innerHTML 重建的區塊）
   · i18n:applied（textarea 帶 data-i18n、input 帶 data-i18n-value 的值會被換掉）
   · 頁面自己呼叫 ZtorViewMode.sync(panel)（各頁 applyReadonly 補一行，讓流程看得見）
   編輯態不動讀數（CSS 已藏），切回檢視態時整批重算。

   API：window.ZtorViewMode = { mount(scope), sync(panel), configure(panel, { format }) }
   載入順序：放在 i18n.js、date-input.js、stepper.js 之後（讀數要看到包好的 .date-input）。
   ============================================================ */
(function () {
  'use strict';

  var DASH = '—';
  var WRAP_SEL = '[data-vm-group], .amount-field, .date-input';
  var SKIP_SEL = '[data-edit-exempt], .variant-table, .tag-input, .zselect__native, .combobox, .todo-list, .zcheck, .switch, .segmented, .radio-list, .selection-card, [data-vm-skip]';
  var SKIP_TYPES = { checkbox: 1, radio: 1, file: 1, hidden: 1, submit: 1, button: 1, reset: 1, range: 1, color: 1, image: 1 };
  var OPTS = new WeakMap();

  /* 千分位：純數字才加，小數位照打的保留（24.00 → 24.00、1200 → 1,200）；非數字（「待確認」）原樣 */
  function fmtNum(raw) {
    var s = String(raw).trim();
    if (!/^-?\d+(\.\d+)?$/.test(s)) return s;
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function skippable(el) {
    if (el.tagName === 'INPUT') {
      var ty = (el.getAttribute('type') || 'text').toLowerCase();
      if (SKIP_TYPES[ty]) return true;
    }
    return !!el.closest(SKIP_SEL);
  }

  function rootOf(el) {
    var w = el.closest(WRAP_SEL);
    return w || el;
  }

  function roots(panel) {
    var list = [], seen = [];
    panel.querySelectorAll('input, textarea').forEach(function (el) {
      if (skippable(el)) return;
      var r = rootOf(el);
      if (seen.indexOf(r) >= 0) return;
      seen.push(r);
      list.push(r);
    });
    return list;
  }

  function kindOf(root) {
    if (root.hasAttribute('data-vm-group')) return 'group';
    if (root.classList.contains('amount-field')) return root.classList.contains('zstep') ? 'zstep' : 'amount';
    if (root.classList.contains('date-input')) return 'date';
    return root.tagName === 'TEXTAREA' ? 'textarea' : 'input';
  }

  function textOf(root, opts) {
    var suffix = root.getAttribute('data-vm-suffix') || '';
    if (root.hasAttribute('data-vm-group')) {
      var parts = [], filled = 0;
      root.querySelectorAll('input, textarea').forEach(function (el) {
        if (skippable(el)) return;
        var v = String(el.value == null ? '' : el.value).trim();
        if (v) filled++;
        parts.push(v ? fmtNum(v) : DASH);
      });
      return filled ? parts.join(root.getAttribute('data-vm-group') || ' · ') + suffix : DASH;
    }
    var input = root.matches('input, textarea') ? root : root.querySelector('input, textarea');
    if (!input) return DASH;
    if (opts && typeof opts.format === 'function') {
      var custom = opts.format(root, input);
      if (custom != null) return String(custom);
    }
    var val = String(input.value == null ? '' : input.value).trim();
    if (!val) return DASH;
    if (root.classList.contains('amount-field')) {
      var unitEl = root.querySelector('.amount-field__unit');
      var unit = unitEl ? unitEl.textContent.replace(/\s+/g, ' ').trim() : '';
      var n = fmtNum(val);
      if (!unit) return n + suffix;
      /* 後綴單位是字（pcs、KG）就隔一個空白，符號（%）貼著 */
      if (root.classList.contains('amount-field--suffix')) return n + (/^[A-Za-z\u4e00-\u9fff]/.test(unit) ? ' ' : '') + unit + suffix;
      return unit + n + suffix;
    }
    var ty = (input.getAttribute('type') || 'text').toLowerCase();
    if (ty === 'datetime-local') return val.replace('T', ' ') + suffix;
    return val + suffix;
  }

  /* 讀數坐進控件原本的格位：控件寫在 inline style 上的版面尺寸（flex:1／flex:2、width、max-width、
     grid-column…）原封抄給讀數，角色／姓名這種靠 flex 比例分欄的列在檢視態仍是兩欄對齊
     （2026-07-27 攤平會醜的那個原因——「框同時在做版面工作」——在這裡用同一份版面值解掉）。 */
  var LAYOUT_PROPS = ['flex', 'flex-grow', 'flex-shrink', 'flex-basis', 'width', 'min-width', 'max-width', 'grid-column', 'grid-row', 'grid-area', 'align-self', 'justify-self'];
  function copyLayout(root, ro) {
    LAYOUT_PROPS.forEach(function (prop) {
      var v = root.style.getPropertyValue(prop);
      if (ro.style.getPropertyValue(prop) !== v) { if (v) ro.style.setProperty(prop, v); else ro.style.removeProperty(prop); }
    });
  }

  function readoutFor(root) {
    var ro = root.nextElementSibling;
    if (!(ro && ro.hasAttribute('data-vm-readout'))) {
      ro = document.createElement('span');
      ro.className = 'field-readout';
      ro.setAttribute('data-vm-readout', '');
      root.insertAdjacentElement('afterend', ro);
    }
    copyLayout(root, ro);
    return ro;
  }

  function setAttr(el, name, value) {
    if (el.getAttribute(name) !== value) el.setAttribute(name, value);
  }

  function sync(panel) {
    if (!panel || !panel.hasAttribute('data-editable')) return;
    if (panel.getAttribute('data-mode') === 'edit') return;
    var opts = OPTS.get(panel);
    roots(panel).forEach(function (root) {
      setAttr(root, 'data-vm-control', '');
      var ro = readoutFor(root);
      setAttr(ro, 'data-vm-kind', kindOf(root));
      var txt = textOf(root, opts);
      if (ro.textContent !== txt) ro.textContent = txt;
      /* 控件自己藏著（限量才有的上限欄、開關關著時的日期欄）→ 讀數跟著藏 */
      var hide = root.hidden || root.style.display === 'none';
      if (ro.hidden !== hide) ro.hidden = hide;
    });
    /* 標籤輸入欄：chips 就是值、欄位本身不藏；一顆都沒有時在欄位後補「—」，有 chip 就收掉 */
    panel.querySelectorAll('.tag-input').forEach(function (tag) {
      if (tag.closest('[data-edit-exempt], [data-vm-skip]')) return;
      var ro = readoutFor(tag);
      setAttr(ro, 'data-vm-kind', 'tags');
      if (ro.textContent !== DASH) ro.textContent = DASH;
      var has = !!tag.querySelector('.chip');
      if (ro.hidden !== has) ro.hidden = has;
    });
    /* 控件被重畫掉了、讀數還留著（前面已經沒有控件）→ 清掉 */
    panel.querySelectorAll('[data-vm-readout]').forEach(function (ro) {
      var prev = ro.previousElementSibling;
      if (!prev || !(prev.hasAttribute('data-vm-control') || prev.classList.contains('tag-input'))) ro.remove();
    });
    if (panel.__vmObserver) panel.__vmObserver.takeRecords();
  }

  function schedule(panel) {
    if (panel.__vmPending) return;
    panel.__vmPending = true;
    Promise.resolve().then(function () {
      panel.__vmPending = false;
      sync(panel);
    });
  }

  function bind(panel) {
    if (panel.__vmBound) return;
    panel.__vmBound = true;
    var mo = new MutationObserver(function () { schedule(panel); });
    mo.observe(panel, { attributes: true, attributeFilter: ['data-mode', 'hidden'], childList: true, subtree: true });
    panel.__vmObserver = mo;
    /* 還原快照時各頁會補發 change；檢視態下收到就重算（編輯態 sync 自己會略過） */
    panel.addEventListener('change', function () { schedule(panel); });
    sync(panel);
  }

  function mount(scope) {
    (scope || document).querySelectorAll('[data-editable]').forEach(bind);
  }

  function configure(panel, opts) {
    if (!panel) return;
    OPTS.set(panel, opts || {});
    bind(panel);
    sync(panel);
  }

  function syncAll() { document.querySelectorAll('[data-editable]').forEach(sync); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); });
  else mount();
  window.addEventListener('load', syncAll);
  document.addEventListener('i18n:applied', syncAll);

  window.ZtorViewMode = { mount: mount, sync: sync, configure: configure, syncAll: syncAll };
})();
