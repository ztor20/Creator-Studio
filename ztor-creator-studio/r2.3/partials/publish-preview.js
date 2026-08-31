/* partials/publish-preview.js — D223（2026-08-24）發布前預覽確認層。
 *
 * 撤除 D220 的頁級「內容檢視語言」分頁（partials/lang-switch.js，掛在表單頂部，
 * 邊填邊切語系）；D223 把翻譯檢視整個挪到「按下發布」之後：四個建立／發布流程
 * （create-product／create-event／create-project／publish-work）在真的送出新內容
 * 之前，先彈出這一層，讓創作者用當前語系看一次渲染後的內容、直接在預覽裡改，
 * 或切成表格一次核對所有語系。跟 lang-switch.js 一樣，這不是新的下拉／彈窗元件：
 * 彈窗殼沿用 payout-modal.css 的 .payout-modal / .payout-dialog--xwide（STYLE-DECISIONS
 * Q27 唯一殼層裁決——粉絲分級設定整畫面裝進浮層是先例）；分頁用 .tabs、預覽/列表
 * 切換用 .segmented（Q8：主要檢視切換用 tabs、控件層 toggle 用 segmented——這裡兩者
 * 分工不同：語言是「看哪一份」的主要切換，預覽/列表是同一份資料的兩種檢視方式）；
 * 列表用 .ztor-table，儲存格塞 input/textarea 沿用 admin-platform-fees.html 的費率
 * 表格先例。
 *
 * 翻譯資料模型延續 lang-switch.js 的做法（本檔是它的唯一繼承者，lang-switch.js
 * 已刪除）：每個欄位、每個語系各自一份記憶體草稿；某語系從未被手動編輯過時，
 * 即時鏡射「預設語言目前的值」（示意重新生成翻譯，原型無真翻譯，呈現假設見
 * ASSUMPTIONS.md）。草稿存在本檔的模組變數裡，只要頁面沒有整頁重新整理，
 * 「返回編輯」關掉這層之後草稿仍在，再次打開發布預覽會看到同一份修改。
 *
 * 用法（宣告式，跟站上其他 partials 同一套慣例）：
 *   window.ztorPublishPreview.open({
 *     fields: [
 *       { key: 'name', el: document.getElementById('cp-f-name'), kind: 'input',
 *         labelKey: 'pp.field.name', labelFallback: 'Name' },
 *       { key: 'desc', el: document.getElementById('cp-f-desc'), kind: 'textarea',
 *         labelKey: 'pp.field.desc', labelFallback: 'Description' }
 *     ],
 *     previewClone: someDomNode,           // 選填：要複製進預覽層的既有預覽卡（例如
 *                                           // create-product 的 .preview-card）；不給
 *                                           // 就用內建的 generic 卡（名稱＋描述）
 *     previewSlots: { name: '#cp-pv-name', desc: '#cp-pv-desc' },  // 選填：previewClone
 *                                           // 內對應每個欄位的節點選擇器（在複製後的
 *                                           // 子樹裡找，即使原節點有 id 也安全）；
 *                                           // 沒給 previewClone 時改用內建卡的
 *                                           // [data-pp-slot="<key>"]，不必傳這個選項
 *     onConfirm: function () { ... }        // 必填：使用者按「確認發布」之後，原本
 *                                           // 那頁的發布行為（原封不動搬進來）
 *   });
 *
 * 只攔「新發布」路徑——四個宿主頁各自在編輯已上架內容的分支（Save changes／
 * saveEdit）不呼叫這裡，直接走原本的儲存邏輯，見 ASSUMPTIONS.md 呈現假設。
 */
window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
(function () {
  'use strict';

  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var LANGS = [
    { code: 'en',      label: 'English' },
    { code: 'zh-Hant', label: '繁體中文' },
    { code: 'zh-Hans', label: '简体中文' },
    { code: 'id',      label: 'Bahasa Indonesia' }
  ];
  function normalize(lang) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === lang) return lang;
    if (lang === 'zh') return 'zh-Hant';
    return 'en';
  }

  /* 草稿存在模組變數，故意不隨每次 open() 重置——見檔頭「返回編輯保留草稿」說明。
     fieldKey -> { langCode: value }；EDITED 只記非預設語系是否被手動編輯過。 */
  var DRAFTS = {};
  var EDITED = {};

  var modalEl = null;
  var currentOpts = null;
  var currentLang = 'en';
  var defaultLang = 'en';
  var currentView = 'preview';

  function getFieldValue(key, lang) {
    return (DRAFTS[key] && DRAFTS[key][lang]) || '';
  }
  function setFieldValue(key, lang, val) {
    DRAFTS[key] = DRAFTS[key] || {};
    DRAFTS[key][lang] = val;
    if (lang !== defaultLang) {
      EDITED[key] = EDITED[key] || {};
      EDITED[key][lang] = true;
    }
  }

  function ensureModal() {
    if (modalEl) return modalEl;
    var wrap = document.createElement('div');
    wrap.className = 'payout-modal';
    wrap.setAttribute('data-pp-modal', '');
    wrap.hidden = true;
    wrap.innerHTML =
      '<section class="payout-dialog payout-dialog--xwide pp-dialog" role="dialog" aria-modal="true" aria-labelledby="pp-title">' +
        '<div class="payout-dialog__head">' +
          '<h2 class="payout-dialog__title" id="pp-title" data-i18n="pp.modal-title">Preview before publishing</h2>' +
          '<button class="btn btn--icon" type="button" aria-label="Close" data-i18n-aria-label="pp.close" data-pp-close><i data-lucide="x" class="ztor-icon"></i></button>' +
        '</div>' +
        '<div class="payout-dialog__body pp-body">' +
          '<div class="pp-toolbar">' +
            '<nav class="tabs pp-lang-tabs" role="tablist" data-i18n-aria-label="pp.tabs-label" aria-label="Translation language" data-pp-tabs></nav>' +
            '<div class="segmented pp-view-toggle" data-pp-view-toggle>' +
              '<button class="segmented__btn segmented__btn--active" type="button" data-pp-view="preview" data-i18n="pp.view.preview">Preview</button>' +
              '<button class="segmented__btn" type="button" data-pp-view="list" data-i18n="pp.view.list">List</button>' +
            '</div>' +
          '</div>' +
          '<div class="info-banner pp-banner" data-pp-banner hidden>' +
            '<i data-lucide="globe" class="ztor-icon info-banner__icon"></i>' +
            '<span data-i18n="pp.banner">This language’s content is auto-translated by the system — you can edit it directly here or in the list view.</span>' +
          '</div>' +
          '<div class="pp-panel pp-panel--preview" data-pp-panel="preview"><div class="pp-preview-slot" data-pp-preview></div></div>' +
          '<div class="pp-panel pp-panel--list" data-pp-panel="list" hidden><div class="ztor-table-scroll"><table class="ztor-table pp-table" data-pp-table></table></div></div>' +
        '</div>' +
        '<div class="payout-dialog__foot">' +
          '<button class="btn btn--ghost" type="button" data-pp-close data-i18n="pp.back">Back to editing</button>' +
          '<button class="btn btn--primary" type="button" data-pp-confirm data-i18n="pp.confirm">Confirm &amp; publish</button>' +
        '</div>' +
      '</section>';
    document.body.appendChild(wrap);
    modalEl = wrap;
    wireModal();
    return wrap;
  }

  function wireModal() {
    modalEl.addEventListener('click', function (e) {
      if (e.target.closest('[data-pp-close]')) { e.preventDefault(); close(); return; }
      if (e.target.closest('[data-pp-confirm]')) { e.preventDefault(); confirmAndPublish(); return; }
      var viewBtn = e.target.closest('[data-pp-view]');
      if (viewBtn) { setView(viewBtn.getAttribute('data-pp-view')); return; }
      var tabBtn = e.target.closest('[data-pp-lang]');
      if (tabBtn) { setLang(tabBtn.getAttribute('data-pp-lang')); return; }
      /* 點遮罩（.payout-modal 本身、非對話框內）關閉——沿用站上彈窗慣例 */
      if (e.target === modalEl) close();
    });
    /* 非預設語系的預覽卡欄位可直接編輯（contenteditable），委派監聽 input 事件 */
    modalEl.addEventListener('input', function (e) {
      var slot = e.target.closest('[data-pp-field-key]');
      if (slot && slot.isContentEditable) {
        setFieldValue(slot.getAttribute('data-pp-field-key'), currentLang, slot.textContent);
        return;
      }
      var cell = e.target.closest('[data-pp-row-field]');
      if (cell) {
        setFieldValue(cell.getAttribute('data-pp-row-field'), cell.getAttribute('data-pp-row-lang'), cell.value);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalEl && !modalEl.hidden) close();
    });
  }

  function setView(view) {
    if (view === currentView) return;
    currentView = view;
    modalEl.querySelectorAll('[data-pp-view]').forEach(function (b) {
      b.classList.toggle('segmented__btn--active', b.getAttribute('data-pp-view') === view);
    });
    renderPanels();
  }
  function setLang(lang) {
    lang = normalize(lang);
    if (lang === currentLang) return;
    currentLang = lang;
    updateTabsActive();
    renderPanels();
  }

  function buildTabs() {
    var tabs = modalEl.querySelector('[data-pp-tabs]');
    tabs.innerHTML = LANGS.map(function (l) {
      var badge = l.code === defaultLang ? ' <span class="badge badge--neutral" data-i18n="pp.default-badge">Default</span>' : '';
      return '<button class="tabs__item" type="button" role="tab" aria-selected="false" data-pp-lang="' + l.code + '">' + esc(l.label) + badge + '</button>';
    }).join('');
    if (window.applyI18n) window.applyI18n(tabs);
    updateTabsActive();
  }
  function updateTabsActive() {
    modalEl.querySelectorAll('[data-pp-lang]').forEach(function (btn) {
      var on = btn.getAttribute('data-pp-lang') === currentLang;
      btn.classList.toggle('tabs__item--active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
  }

  function buildGenericPreviewNode() {
    var node = document.createElement('div');
    node.className = 'preview-card';
    node.innerHTML =
      '<div class="preview-card__body">' +
        '<div class="preview-card__row"><h4 class="preview-card__name" data-pp-slot="name"></h4></div>' +
        '<p class="preview-card__desc" data-pp-slot="desc"></p>' +
      '</div>';
    return node;
  }

  /* 把一顆可翻譯欄位的目前語系值寫進某個 DOM 節點，並視語系決定要不要開放
     inline 編輯——clone 路徑（既有預覽卡）與自訂渲染路徑（previewRender）共用同一套
     判斷，不各自重寫一份。 */
  function applyFieldToSlot(el, key) {
    if (!el) return;
    var isDefault = currentLang === defaultLang;
    var val = getFieldValue(key, currentLang);
    /* 複製自既有頁面節點的欄位常帶 data-i18n（例如 cp-pv-name 的 placeholder 字典 key）：
       open() 稍後會對整個 modalEl 跑一次 applyI18n() 把新掛載的靜態字串（標題、按鈕…）
       翻好，若這裡不拿掉，可翻譯欄位剛寫入的真實值會被那次全域套用蓋回字典的預設
       placeholder 文字。 */
    el.removeAttribute('data-i18n');
    el.textContent = val;
    el.classList.toggle('is-empty', !val);
    if (isDefault) {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-pp-field-key');
      el.classList.remove('pp-slot--editable');
    } else {
      el.setAttribute('contenteditable', 'true');
      el.setAttribute('data-pp-field-key', key);
      el.classList.add('pp-slot--editable');
    }
  }

  function renderPreviewPanel() {
    var host = modalEl.querySelector('[data-pp-preview]');
    host.innerHTML = '';

    /* 自訂渲染路徑（目前只有 create-product 的 buyer-view mock 用）：宿主頁自己組
       整個結構，本檔只負責提供「目前語系的值」與「掛上 inline 編輯」兩個 API，不
       猜測頁面該長什麼樣。與 clone／generic 路徑互斥，給了 previewRender 就不再
       跑下面的 clone 邏輯。 */
    if (typeof currentOpts.previewRender === 'function') {
      var api = {
        lang: currentLang,
        isDefault: currentLang === defaultLang,
        getValue: function (key) { return getFieldValue(key, currentLang); },
        bindEditable: applyFieldToSlot
      };
      currentOpts.previewRender(host, api);
      /* 自訂渲染器可能用 data-i18n 標記靜態文字（例如買家前台 mock 的「尺寸」「加入
         購物車」）；bindEditable 已經在剛剛的呼叫裡把可翻譯欄位自己的 data-i18n
         拿掉了（見 applyFieldToSlot），這裡補跑一次全域套用是安全的——open() 只在
         掛載當下跑一次 applyI18n(modalEl)，語言／檢視切換時 renderPanels() 會整段
         重建這個容器，不補跑就會露出字典 key 的英文預設值，不會跟著頁面語言換。 */
      if (window.applyI18n) window.applyI18n(host);
      if (window.ztorIcons) window.ztorIcons.applyIcons(host);
      return;
    }

    var node = currentOpts.previewClone ? currentOpts.previewClone.cloneNode(true) : buildGenericPreviewNode();

    var slotEls = {};
    currentOpts.fields.forEach(function (f) {
      var sel = (currentOpts.previewSlots && currentOpts.previewSlots[f.key]) ||
        (!currentOpts.previewClone ? '[data-pp-slot="' + f.key + '"]' : null);
      if (sel) slotEls[f.key] = node.querySelector(sel);
    });
    /* 複製自既有頁面節點時原樣帶著 id；插回文件後會跟被蓋住的原節點重複 id，
       拿掉它，selector 已經在拿掉之前解析完成，不受影響。 */
    node.removeAttribute('id');
    node.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });

    host.appendChild(node);
    if (window.ztorIcons) window.ztorIcons.applyIcons(node);

    currentOpts.fields.forEach(function (f) { applyFieldToSlot(slotEls[f.key], f.key); });
  }

  function renderListPanel() {
    var table = modalEl.querySelector('[data-pp-table]');
    table.innerHTML = '';
    var thead = document.createElement('thead');
    var headRow = document.createElement('tr');
    var thField = document.createElement('th');
    thField.setAttribute('data-i18n', 'pp.table.field');
    thField.textContent = T('pp.table.field', 'Field');
    headRow.appendChild(thField);
    LANGS.forEach(function (l) {
      var th = document.createElement('th');
      th.textContent = l.label;
      if (l.code === defaultLang) {
        var badge = document.createElement('span');
        badge.className = 'badge badge--neutral';
        badge.setAttribute('data-i18n', 'pp.default-badge');
        badge.textContent = T('pp.default-badge', 'Default');
        th.appendChild(document.createTextNode(' '));
        th.appendChild(badge);
      }
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    var lastGroup = null;
    var colCount = 1 + LANGS.length;
    currentOpts.fields.forEach(function (f) {
      /* 動態欄位分組（規格列／選項組這類列數不定的清單）：連續欄位共用同一個
         f.group 字串時，只在開始那一列前插一次跨欄分組小標，不逐列重複——避免
         每列標籤都要再講一次「規格」「選項」（見鐵律「UI 文案不重述上下文」）。
         沒有 group 的欄位（例如固定的 name／desc）不受影響，維持原本平鋪列。 */
      if (f.group && f.group !== lastGroup) {
        var groupRow = document.createElement('tr');
        groupRow.className = 'pp-group-row';
        var groupTd = document.createElement('td');
        groupTd.colSpan = colCount;
        groupTd.textContent = f.group;
        groupRow.appendChild(groupTd);
        tbody.appendChild(groupRow);
      }
      lastGroup = f.group || null;

      var tr = document.createElement('tr');
      var tdLabel = document.createElement('td');
      tdLabel.className = 'ztor-table__feature';
      tdLabel.textContent = T(f.labelKey, f.labelFallback || f.key);
      tr.appendChild(tdLabel);
      LANGS.forEach(function (l) {
        var td = document.createElement('td');
        var val = getFieldValue(f.key, l.code);
        if (l.code === defaultLang) {
          /* 預設語言欄唯讀——它是母本，改母本要回表單（規格 D223） */
          td.className = 'pp-cell pp-cell--readonly';
          td.textContent = val;
        } else {
          td.className = 'pp-cell';
          var field = document.createElement(f.kind === 'textarea' ? 'textarea' : 'input');
          field.className = (f.kind === 'textarea' ? 'textarea' : 'input') + ' pp-cell-field';
          if (f.kind === 'textarea') { field.rows = 2; field.value = val; }
          else { field.type = 'text'; field.value = val; }
          field.setAttribute('data-pp-row-field', f.key);
          field.setAttribute('data-pp-row-lang', l.code);
          td.appendChild(field);
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
  }

  function renderPanels() {
    var tabsNav = modalEl.querySelector('[data-pp-tabs]');
    /* 列表檢視本身已經把四個語系並排成欄，語言分頁在那個模式下沒有動作意義，收起來 */
    tabsNav.hidden = currentView === 'list';
    modalEl.querySelector('[data-pp-panel="preview"]').hidden = currentView !== 'preview';
    modalEl.querySelector('[data-pp-panel="list"]').hidden = currentView !== 'list';
    modalEl.querySelector('[data-pp-banner]').hidden = !(currentView === 'preview' && currentLang !== defaultLang);
    if (currentView === 'preview') renderPreviewPanel(); else renderListPanel();
  }

  function close() {
    if (!modalEl) return;
    modalEl.hidden = true;
    document.body.style.overflow = '';
  }

  function confirmAndPublish() {
    close();
    if (currentOpts && typeof currentOpts.onConfirm === 'function') currentOpts.onConfirm();
  }

  function open(opts) {
    if (!opts || !opts.fields || !opts.fields.length) return;
    currentOpts = opts;
    ensureModal();
    defaultLang = normalize(window.ztorLang ? window.ztorLang.get() : 'en');
    currentLang = defaultLang;
    currentView = 'preview';

    /* 掛載當下：預設語言欄一律鏡射表單目前值；未手動編輯過的其他語系一併跟著換
       （示意「重新生成翻譯」，沿用 lang-switch.js 的既有邏輯）——見檔頭說明。 */
    opts.fields.forEach(function (f) {
      DRAFTS[f.key] = DRAFTS[f.key] || {};
      EDITED[f.key] = EDITED[f.key] || {};
      var defVal = f.el ? f.el.value : '';
      DRAFTS[f.key][defaultLang] = defVal;
      LANGS.forEach(function (l) {
        if (l.code !== defaultLang && !EDITED[f.key][l.code]) DRAFTS[f.key][l.code] = defVal;
      });
    });

    buildTabs();
    modalEl.querySelectorAll('[data-pp-view]').forEach(function (b) {
      b.classList.toggle('segmented__btn--active', b.getAttribute('data-pp-view') === 'preview');
    });
    renderPanels();
    if (window.applyI18n) window.applyI18n(modalEl);
    if (window.ztorIcons) window.ztorIcons.applyIcons(modalEl);

    modalEl.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  window.ztorPublishPreview = { open: open };
})();
