/* publish-stage.js — 發布前預覽確認的全頁畫面（D310，2026-09-22）
 *
 * D223 把「發布前看一次」做成浮層、D305 把浮層內容擴成前台 1:1 的粉絲頁，結果是
 * 一整頁前台被塞進對話框、第 8 步的摘要卡與浮層變成兩層確認。D310 裁決改成全頁：
 *   · 多步驟流程＝流程的最後一步（建立活動第 8 步「預覽與發布」）
 *   · 發布後再開＝一個獨立全頁（event-localization.html），主鈕「儲存」
 * 兩邊用的是同一支：本檔。浮層（partials/publish-preview.js）已於 2026-09-23 在所有單頁表單
 * （create-product／create-bundle／create-project／publish-work）退場，改走這裡；浮層目前僅剩
 * design-system.html／design-components.html 的 demo 卡在用，屬退場候選。
 *
 * 畫面（版型見 ds-components/publish-stage.css）：
 *   主區＝粉絲視角前台預覽（宿主用 previewRender 把 js/fan-event-page.js 畫進來；
 *         票券頁／票務商品頁的切換由渲染器畫在預覽頂端）
 *   側欄＝兩段（價格只用創作者幣別＝基準幣別顯示，其他幣別的換算價在粉絲端才出現）：
 *     1 語言    四個語系一列一個，標狀態（預設／自動翻譯／已修改 N 欄），點選切換預覽語系；
 *               有「還原自動翻譯」；段底「逐欄位對照」開右側滑出的**翻譯表**
 *     2 依 mode：'publish' ＝發布前檢核（宿主給 checks()，每項可點跳回該步驟）
 *                'save'    ＝未儲存的變更摘要（改了 N 欄）
 *   墓碑 2026-11-05（D514）：**價格表**抽屜、逐幣別覆寫、預覽價格點開價格表退場；
 *   墓碑 2026-11-05（D514 決定三）：側欄「幣別」段（基準／換算／bookyay 原價標記）與預覽幣別切換退場。
 *   側欄底部＝主鈕（發布活動／儲存）＋次鈕（上一步／取消）
 *
 * 草稿模型延續 publish-preview.js（本檔是活動側的繼承者）：DRAFTS 每個欄位每個語系
 * 一份草稿、EDITED 記非預設語系是否被手動改過。
 * 兩份都是模組變數，故意不隨每次 mount() 重置——第 8 步與其他步驟之間來回走、或
 * 「上一步」回去改一個字再回來，改過的翻譯都還在。價格不存草稿：每次都由宿主給的
 * priceObj 即時換算（events-store priceIn）。
 *
 * 用法（宣告式，同站上其他共用渲染器）：
 *   var stage = window.ztorPublishStage.mount(hostEl, {
 *     fields: [{ key, el:{value}, kind:'input'|'textarea', labelKey, labelFallback, group, locked }],   // locked（D445）＝bookyay 匯入、原文鎖定：欄位名後標小鎖頭（譯文仍可填）
 *     baseCurrency: 'TWD',                                  // 創作者幣別；預覽價格一律用它顯示（D514 決定三）
 *     views:   [{ key:'ticket' }, { key:'bundles' }],       // 選填：給渲染器的視圖清單。2026-10-16（D443）起活動兩個宿主不再傳（門票與套組合成一頁），
 *                                                          //   目前沒有消費者；機制留著，不傳就是 null
 *     previewRender: function (host, api) {},               // 必填：主區怎麼畫
 *     mode: 'publish' | 'save',
 *     translation: 'auto' | 'manual',                       // 選填，預設 'auto'＝現行行為（原文抄成譯文）。
 *       'manual'（D312，活動側）＝非預設語系不自動帶原文，只存使用者填的譯文；沒填時預覽/表格
 *       fallback 顯示原文，翻譯表格子沒填時以原文當 placeholder（不預填值）。
 *     editZones: [{ sel:'.pdp-buy__title', step:2 }],       // 選填：hover 出現「編輯」跳回哪一步
 *     onEdit: function (step) {},                           // editZones 的點擊行為
 *     checks: function () { return [{ key, label, ok, step }]; },   // mode:'publish'
 *     primaryKey / secondaryKey: i18n key（不給就用 mode 的預設）
 *     onPrimary: function (result) {},   // result = { translations, mode }
 *     onSecondary: function () {}
 *   });
 *   stage.refresh();          // 宿主資料變了（例如回到第 8 步）重新掛一次
 *   stage.syncChecks();       // 只重畫檢核段（每次輸入都跑，不重畫整個預覽）
 *   stage.result();           // 取目前草稿（宿主要在別處落地時用）
 */
(function () {
  'use strict';

  function T(k, fb) { return (window.i18nT && window.i18nT(k)) || fb; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

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

  /* 草稿：模組變數，見檔頭「故意不重置」說明 */
  var DRAFTS = {};
  var EDITED = {};

  var opts = null;
  var rootEl = null;      /* .pstage */
  var mainEl = null;
  var sideEl = null;
  var editBtn = null;
  var drawers = {};       /* key -> { wrap, body } */
  var hotZone = null;
  var currentLang = 'en';
  var defaultLang = 'en';
  var currentCurrency = 'TWD';
  /* 「使用者動過語系沒」：沒動過就跟著宿主的預設走（預覽語系＝介面語言），
     動過就尊重使用者的選擇，第 8 步與其他步驟來回走不會被打回預設。 */
  var langPicked = false;
  var currentView = null;

  /* ── 文案草稿 ─────────────────────────────────────────────────── */
  function isManual() { return !!(opts && opts.translation === 'manual'); }
  function getFieldValue(key, lang) { return (DRAFTS[key] && DRAFTS[key][lang]) || ''; }
  /* manual 模式：非預設語系沒填譯文時 fallback 顯示原文（僅供畫面用，草稿本身仍是空字串，
     見 collectResult 與 syncData）。auto 模式行為不變（getFieldValue 本身就是「譯文」）。 */
  function displayValue(key, lang) {
    var v = getFieldValue(key, lang);
    if (!v && lang !== defaultLang && isManual()) return getFieldValue(key, defaultLang);
    return v;
  }
  function setFieldValue(key, lang, val) {
    DRAFTS[key] = DRAFTS[key] || {};
    DRAFTS[key][lang] = val;
    if (lang !== defaultLang) {
      EDITED[key] = EDITED[key] || {};
      EDITED[key][lang] = true;
    }
  }
  function editedCount(lang) {
    if (lang === defaultLang) return 0;
    var n = 0;
    (opts.fields || []).forEach(function (f) { if (EDITED[f.key] && EDITED[f.key][lang]) n++; });
    return n;
  }
  /* manual 模式的「已翻譯 n／N 欄」：n＝實際填了譯文的欄位數（非空字串），N＝可翻譯欄位總數。
     跟 editedCount 分開算，因為 editedCount 只答「動過沒」，manual 模式要答「有沒有內容」。 */
  function filledCount(lang) {
    if (lang === defaultLang) return 0;
    var n = 0;
    (opts.fields || []).forEach(function (f) { if (getFieldValue(f.key, lang)) n++; });
    return n;
  }
  function totalFields() { return (opts.fields || []).length; }
  function resetLang(lang) {
    (opts.fields || []).forEach(function (f) {
      if (EDITED[f.key]) delete EDITED[f.key][lang];
      /* auto：回填原文（維持現行「還原自動翻譯」）。manual：清空譯文，交回 displayValue fallback 顯示原文，
         不是把原文寫回草稿——manual 的草稿本來就只存使用者自己填的內容。 */
      if (DRAFTS[f.key]) DRAFTS[f.key][lang] = isManual() ? '' : (DRAFTS[f.key][defaultLang] || '');
    });
  }

  /* ── 價格（D514：只有基準價一個值，其他幣別由 events-store 換算）──── */
  function store() { return window.ztorEvents || null; }
  function priceIn(po) {
    var s = store();
    if (!s || !po) return 0;
    return s.priceIn(po, currentCurrency);
  }
  function fmtAmount(n, cur) {
    var s = store();
    return s ? s.fmtMoney(cur || currentCurrency, n) : String(n);
  }
  function money(po) { return fmtAmount(priceIn(po), currentCurrency); }

  /* ── 把草稿灌進宿主資料（mount 與 refresh 都跑）──────────────── */
  function syncData() {
    defaultLang = normalize(window.ztorLang ? window.ztorLang.get() : 'en');
    if (!langPicked || LANGS.every(function (l) { return l.code !== currentLang; })) currentLang = defaultLang;
    (opts.fields || []).forEach(function (f) {
      DRAFTS[f.key] = DRAFTS[f.key] || {};
      EDITED[f.key] = EDITED[f.key] || {};
      var defVal = f.el ? f.el.value : '';
      DRAFTS[f.key][defaultLang] = defVal;
      if (isManual()) {
        /* manual：非預設語系只存使用者自己填的譯文，預設語言改動不覆蓋、也不代填原文——
           未填的欄位維持空字串，交給 displayValue() 在畫面上 fallback 顯示原文。 */
        LANGS.forEach(function (l) {
          if (l.code !== defaultLang && DRAFTS[f.key][l.code] == null) DRAFTS[f.key][l.code] = '';
        });
      } else {
        LANGS.forEach(function (l) {
          if (l.code !== defaultLang && !EDITED[f.key][l.code]) DRAFTS[f.key][l.code] = defVal;
        });
      }
    });
    /* 預覽價格固定用創作者幣別（基準幣別）；沒有幣別切換（D514 決定三）。 */
    currentCurrency = opts.baseCurrency || 'TWD';
    var views = (opts.views || []).map(function (v) { return v.key; });
    if (!currentView || views.indexOf(currentView) < 0) currentView = views[0] || null;
  }

  /* ── 主區：粉絲視角預覽 ───────────────────────────────────────── */
  function applyFieldToSlot(node, key) {
    if (!node) return;
    var isDefault = currentLang === defaultLang;
    node.removeAttribute('data-i18n');
    node.textContent = displayValue(key, currentLang);
    node.classList.toggle('is-empty', !node.textContent);
    if (isDefault) {
      node.removeAttribute('contenteditable');
      node.removeAttribute('data-pp-field-key');
      node.classList.remove('pp-slot--editable');
    } else {
      node.setAttribute('contenteditable', 'true');
      node.setAttribute('data-pp-field-key', key);
      node.classList.add('pp-slot--editable');
    }
  }
  function previewApi() {
    return {
      lang: currentLang,
      isDefault: currentLang === defaultLang,
      getValue: function (key) { return displayValue(key, currentLang); },
      bindEditable: applyFieldToSlot,
      currency: currentCurrency,
      priceIn: priceIn,
      money: money,
      fmt: function (n) { return fmtAmount(n, currentCurrency); },
      view: currentView,
      views: (opts.views || []).map(function (v) { return v.key; }),
      setView: setView
    };
  }
  function renderPreview() {
    if (!mainEl) return;
    mainEl.innerHTML = '';
    hotZone = null;
    if (typeof opts.previewRender === 'function') opts.previewRender(mainEl, previewApi());
    if (window.applyI18n) window.applyI18n(mainEl);
    if (window.ztorIcons) window.ztorIcons.applyIcons(mainEl);
    mainEl.appendChild(editBtn);
    hideEdit();
  }

  /* ── 側欄 ─────────────────────────────────────────────────────── */
  function rowBtn(active, name, state, attr, val) {
    var li = el('li');
    var b = el('button', 'pstage-row' + (active ? ' pstage-row--active' : ''));
    b.type = 'button';
    b.setAttribute(attr, val);
    b.innerHTML = '<span class="pstage-row__name">' + esc(name) + '</span>' +
      '<span class="pstage-row__state">' + esc(state) + '</span>';
    li.appendChild(b);
    return li;
  }

  function langSection() {
    var sec = el('section', 'pstage-sec');
    sec.appendChild(el('h3', 'pstage-sec__title', esc(T('pstage.sec.lang', 'Language'))));
    var list = el('ul', 'pstage-list');
    LANGS.forEach(function (l) {
      var state;
      if (l.code === defaultLang) {
        state = T('pstage.lang.default', 'Default');
      } else if (isManual()) {
        var filled = filledCount(l.code);
        state = filled
          ? T('pstage.lang.translated', '{n} of {total} translated').replace('{n}', filled).replace('{total}', totalFields())
          : T('pstage.lang.untranslated', 'Not translated');
      } else {
        var n = editedCount(l.code);
        state = n ? T('pstage.lang.edited', '{n} edited').replace('{n}', n) : T('pstage.lang.auto', 'Auto-translated');
      }
      list.appendChild(rowBtn(l.code === currentLang, l.label, state, 'data-stage-lang', l.code));
    });
    sec.appendChild(list);
    var foot = el('div', 'pstage-sec__foot');
    var canClear = currentLang !== defaultLang && (isManual() ? filledCount(currentLang) > 0 : editedCount(currentLang) > 0);
    if (canClear) {
      var reset = el('button', 'btn btn--ghost btn--sm');
      reset.type = 'button';
      reset.setAttribute('data-stage-lang-reset', '');
      reset.textContent = isManual() ? T('pstage.lang.clear', 'Clear translation') : T('pstage.lang.reset', 'Restore auto-translation');
      foot.appendChild(reset);
    }
    var tbl = el('button', 'btn btn--outline btn--sm');
    tbl.type = 'button';
    tbl.setAttribute('data-stage-drawer-open', 'trans');
    tbl.textContent = T('pstage.lang.table', 'Field-by-field');
    foot.appendChild(tbl);
    sec.appendChild(foot);
    return sec;
  }

  function checkSection() {
    var sec = el('section', 'pstage-sec pstage-check');
    sec.setAttribute('data-stage-sec', 'check');
    sec.appendChild(el('h3', 'pstage-sec__title', esc(T('pstage.sec.checks', 'Pre-publish checks'))));
    var box = el('div', 'readiness');
    var ul = el('ul', 'readiness__list');
    var items = (typeof opts.checks === 'function' ? opts.checks() : []) || [];
    var left = 0;
    items.forEach(function (c) {
      if (!c.ok) left++;
      var li = el('li', 'readiness__item' + (c.ok ? ' readiness__item--done' : ''));
      li.innerHTML = '<span class="readiness__mark"><i data-lucide="check" class="ztor-icon"></i></span>';
      var b = el('button', 'pstage-linkbtn');
      b.type = 'button';
      b.setAttribute('data-stage-goto', String(c.step || ''));
      b.textContent = c.label;
      li.appendChild(b);
      ul.appendChild(li);
    });
    box.appendChild(ul);
    var banner = el('div', 'readiness__banner' + (left ? '' : ' readiness__banner--ready'));
    banner.textContent = left ? T('ce.qc.left', '{n} items needed before publishing').replace('{n}', left)
                              : T('ce.qc.ready', 'All set — ready to publish');
    box.appendChild(banner);
    sec.appendChild(box);
    sec.dataset.stageBlocked = left ? '1' : '';
    return sec;
  }

  function changesSection() {
    var sec = el('section', 'pstage-sec');
    sec.setAttribute('data-stage-sec', 'changes');
    sec.appendChild(el('h3', 'pstage-sec__title', esc(T('pstage.sec.changes', 'Unsaved changes'))));
    var fields = 0;
    LANGS.forEach(function (l) { fields += editedCount(l.code); });
    if (!fields) {
      sec.appendChild(el('p', 'pstage-sum__none', esc(T('pstage.changes.none', 'Nothing changed yet'))));
      return sec;
    }
    var box = el('div', 'pstage-sum');
    function row(k, v) {
      box.appendChild(el('div', 'pstage-sum__row',
        '<span class="pstage-sum__k">' + esc(k) + '</span><span class="pstage-sum__v">' + esc(v) + '</span>'));
    }
    row(T('pstage.changes.fields', 'Text fields'), String(fields));
    sec.appendChild(box);
    return sec;
  }

  function renderSide() {
    if (!sideEl) return;
    var inner = sideEl.querySelector('[data-stage-side-inner]');
    inner.innerHTML = '';
    inner.appendChild(langSection());
    var third = opts.mode === 'save' ? changesSection() : checkSection();
    inner.appendChild(third);
    if (window.ztorIcons) window.ztorIcons.applyIcons(inner);
    syncPrimary();
  }
  function syncPrimary() {
    var btn = sideEl && sideEl.querySelector('[data-stage-primary]');
    if (!btn) return;
    var sec = sideEl.querySelector('[data-stage-sec="check"]');
    btn.disabled = !!(sec && sec.dataset.stageBlocked);
  }

  /* ── 抽屜：翻譯表 ─────────────────────────────────────────────── */
  function ensureDrawer(key, titleKey, titleFb) {
    if (drawers[key]) return drawers[key];
    /* 翻譯表整頁（2026-09-23 使用者：「翻譯表的 popup 要整頁，同時裡面的每一個欄位都要變大」）：880 的抽屜把每格壓成一小塊。 */
    var wrap = el('div', 'drawer drawer--full');
    wrap.setAttribute('data-stage-drawer', key);
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML =
      '<div class="drawer__scrim" data-stage-drawer-close></div>' +
      '<aside class="drawer__panel" role="dialog" aria-modal="true">' +
        '<div class="drawer__head">' +
          '<h2 class="drawer__title" data-i18n="' + titleKey + '">' + esc(T(titleKey, titleFb)) + '</h2>' +
          '<button class="drawer__close" type="button" data-stage-drawer-close aria-label="' + esc(T('pp.close', 'Close')) + '">' +
            '<i data-lucide="x" class="ztor-icon"></i></button>' +
        '</div>' +
        '<div class="drawer__body" data-stage-drawer-body></div>' +
      '</aside>';
    document.body.appendChild(wrap);
    if (window.ztorIcons) window.ztorIcons.applyIcons(wrap);
    drawers[key] = { wrap: wrap, body: wrap.querySelector('[data-stage-drawer-body]') };
    return drawers[key];
  }
  function openDrawer() {
    var d = ensureDrawer('trans', 'pstage.drawer.trans', 'Translations');
    renderTransTable(d.body);
    d.wrap.classList.add('is-open');
    d.wrap.setAttribute('aria-hidden', 'false');
  }
  function closeDrawers() {
    Object.keys(drawers).forEach(function (k) {
      drawers[k].wrap.classList.remove('is-open');
      drawers[k].wrap.setAttribute('aria-hidden', 'true');
    });
  }

  /* 翻譯表（欄位 × 四語；預設語言欄唯讀＝母本要回表單改，D223） */
  function renderTransTable(host) {
    host.innerHTML = '';
    /* 墓碑 2026-10-28（#382，使用者：「移除」）：表格上方的提示句「預設語言那一欄是來源，要改回原本的欄位改」退場（pstage.drawer.trans-hint 留著未用）；預設欄已有「預設」徽章。 */
    var scroll = el('div', 'ztor-table-scroll');
    var table = el('table', 'ztor-table pp-table');
    var thead = el('thead');
    var hr = el('tr');
    var th0 = el('th', '', esc(T('pp.table.field', 'Field')));
    hr.appendChild(th0);
    LANGS.forEach(function (l) {
      var th = el('th', '', esc(l.label) + (l.code === defaultLang ? ' <span class="badge badge--neutral">' + esc(T('pp.default-badge', 'Default')) + '</span>' : ''));
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);
    var tbody = el('tbody');
    var lastGroup = null;
    var colCount = 1 + LANGS.length;
    (opts.fields || []).forEach(function (f) {
      if (f.group && f.group !== lastGroup) {
        var gr = el('tr', 'pp-group-row');
        var gtd = el('td', '', esc(f.group));
        gtd.colSpan = colCount;
        gr.appendChild(gtd);
        tbody.appendChild(gr);
      }
      lastGroup = f.group || null;
      var tr = el('tr');
      /* D445：bookyay 匯入、原文鎖定的列（f.locked）在欄位名後標小鎖頭——鎖頭語彙 .pp-field-lock＋lock 圖示；
         原文欄本來就唯讀、譯文欄照常可填，鎖頭只是告訴創作者「原文要回 bookyay 改」。 */
      var lockTip = f.locked ? T('pp.field.locked', 'From bookyay, original text locked') : '';
      tr.appendChild(el('td', 'ztor-table__feature', esc(f.labelKey ? T(f.labelKey, f.labelFallback || f.key) : (f.labelFallback || f.key)) +
        (f.locked ? '<span class="pp-field-lock" role="img" data-pp-field-lock title="' + esc(lockTip) + '" aria-label="' + esc(lockTip) + '"><i data-lucide="lock" class="ztor-icon"></i></span>' : '')));
      LANGS.forEach(function (l) {
        var td = el('td');
        var val = getFieldValue(f.key, l.code);
        if (l.code === defaultLang) {
          td.className = 'pp-cell pp-cell--readonly';
          td.textContent = val;
        } else {
          td.className = 'pp-cell';
          var field = document.createElement(f.kind === 'textarea' ? 'textarea' : 'input');
          field.className = (f.kind === 'textarea' ? 'textarea' : 'input') + ' pp-cell-field';
          if (f.kind === 'textarea') { field.rows = 2; field.value = val; }
          else { field.type = 'text'; field.value = val; }
          /* manual：沒填譯文時 val 本來就是空字串（見 syncData），這裡只補 placeholder 讓創作者
             看得到原文可以參考翻什麼，不是把原文預填進去當值（D312：填了才算已翻譯）。 */
          if (isManual()) field.setAttribute('placeholder', getFieldValue(f.key, defaultLang));
          field.setAttribute('data-pp-row-field', f.key);
          field.setAttribute('data-pp-row-lang', l.code);
          td.appendChild(field);
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    host.appendChild(scroll);
    if (window.ztorIcons) window.ztorIcons.applyIcons(host);   // D445：欄位名後的小鎖頭
  }

  /* ── 預覽區塊的「編輯」入口（浮動鈕，見 CSS 檔頭）────────────── */
  function zoneOf(node) {
    var zones = opts.editZones || [];
    for (var i = 0; i < zones.length; i++) {
      var hit = node.closest(zones[i].sel);
      if (hit) return { node: hit, step: zones[i].step };
    }
    return null;
  }
  function hideEdit() {
    if (editBtn) editBtn.hidden = true;
    if (hotZone) { hotZone.classList.remove('pstage-zone--hot'); hotZone = null; }
  }
  function showEdit(zone) {
    if (hotZone === zone.node) return;
    hideEdit();
    hotZone = zone.node;
    hotZone.classList.add('pstage-zone--hot');
    var mr = mainEl.getBoundingClientRect();
    var zr = zone.node.getBoundingClientRect();
    editBtn.hidden = false;
    editBtn.style.left = (zr.right - mr.left + mainEl.scrollLeft) + 'px';
    editBtn.style.top = (zr.top - mr.top + mainEl.scrollTop) + 'px';
    editBtn.setAttribute('data-stage-goto', String(zone.step));
  }

  /* ── 切換 ─────────────────────────────────────────────────────── */
  function setLang(lang) {
    lang = normalize(lang);
    langPicked = true;
    if (lang === currentLang) return;
    currentLang = lang;
    renderPreview();
    renderSide();
  }
  function setView(v) {
    var views = (opts.views || []).map(function (x) { return x.key; });
    if (views.indexOf(v) < 0 || v === currentView) return;
    currentView = v;
    renderPreview();
  }

  function collectResult() {
    var translations = {};
    (opts.fields || []).forEach(function (f) { translations[f.key] = DRAFTS[f.key] ? JSON.parse(JSON.stringify(DRAFTS[f.key])) : {}; });
    return { translations: translations, mode: opts.mode || 'publish' };
  }

  /* ── 事件（委派一次，重畫不用重掛）───────────────────────────── */
  var wired = false;
  function wire() {
    if (wired) return;
    wired = true;

    document.addEventListener('click', function (e) {
      if (!rootEl) return;
      var close = e.target.closest('[data-stage-drawer-close]');
      if (close) { e.preventDefault(); closeDrawers(); return; }
      var openBtn = e.target.closest('[data-stage-drawer-open]');
      if (openBtn) { e.preventDefault(); openDrawer(); return; }
      var langBtn = e.target.closest('[data-stage-lang]');
      if (langBtn) { setLang(langBtn.getAttribute('data-stage-lang')); return; }
      var resetBtn = e.target.closest('[data-stage-lang-reset]');
      if (resetBtn) { resetLang(currentLang); renderPreview(); renderSide(); return; }
      var goBtn = e.target.closest('[data-stage-goto]');
      if (goBtn) {
        e.preventDefault();
        var step = Number(goBtn.getAttribute('data-stage-goto'));
        if (step && typeof opts.onEdit === 'function') opts.onEdit(step);
        return;
      }
      var primary = e.target.closest('[data-stage-primary]');
      if (primary) { e.preventDefault(); if (typeof opts.onPrimary === 'function') opts.onPrimary(collectResult()); return; }
      var secondary = e.target.closest('[data-stage-secondary]');
      if (secondary) { e.preventDefault(); if (typeof opts.onSecondary === 'function') opts.onSecondary(); return; }
    });

    /* 預覽裡就地編輯 ＋ 翻譯表的輸入 */
    document.addEventListener('input', function (e) {
      if (!rootEl) return;
      var slot = e.target.closest('[data-pp-field-key]');
      if (slot && slot.isContentEditable) {
        setFieldValue(slot.getAttribute('data-pp-field-key'), currentLang, slot.textContent);
        renderSide();
        return;
      }
      var cell = e.target.closest('[data-pp-row-field]');
      if (cell) {
        setFieldValue(cell.getAttribute('data-pp-row-field'), cell.getAttribute('data-pp-row-lang'), cell.value);
        renderSide();
        return;
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawers();
    });
    /* hover 出現「編輯」：委派在主區上，滑到別處就收起 */
    document.addEventListener('mouseover', function (e) {
      if (!rootEl || !mainEl || !(opts.editZones || []).length) return;
      if (!mainEl.contains(e.target)) { hideEdit(); return; }
      if (editBtn.contains(e.target)) return;
      /* 預覽裡的浮層（D443 看詳情彈窗，帶 data-pp-no-zone）不是可編輯區塊：滑進去就收起「編輯」 */
      if (e.target.closest('[data-pp-no-zone]')) { hideEdit(); return; }
      var zone = zoneOf(e.target);
      if (zone) showEdit(zone); else hideEdit();
    });
  }

  /* ── 掛載 ─────────────────────────────────────────────────────── */
  function mount(host, options) {
    if (!host || !options) return null;
    opts = options;
    host.innerHTML = '';
    /* 穩定的外層：預覽區重掛時（create-event 切語言）不變，fan-event-page 把看詳情彈窗開著哪一組記在這裡（D443） */
    host.setAttribute('data-pstage-host', '');
    rootEl = el('div', 'pstage');
    mainEl = el('div', 'pstage__main');
    mainEl.setAttribute('data-stage-main', '');
    sideEl = el('aside', 'pstage__side');
    sideEl.innerHTML =
      '<div class="pstage__side-inner" data-stage-side-inner></div>' +
      '<div class="pstage__foot">' +
        '<button class="btn btn--primary" type="button" data-stage-primary></button>' +
        '<button class="btn btn--ghost" type="button" data-stage-secondary></button>' +
      '</div>';
    rootEl.appendChild(mainEl);
    rootEl.appendChild(sideEl);
    /* 桌機／手機預覽尺寸切換（2026-10-28，使用者指著預覽上方右側：「這裡放一個切換桌機和手機預覽尺寸的切換鈕」）：
       鈕是 .pstage 的格線子項（疊在主欄右上角），不放進 mainEl——預覽重畫會清空 mainEl。狀態寫在 rootEl[data-device]，記 localStorage。 */
    var device = 'desktop';
    try { if (localStorage.getItem('ztor.pstage-device') === 'mobile') device = 'mobile'; } catch (e) {}
    rootEl.setAttribute('data-device', device);
    var devEl = el('div', 'pstage__device');
    devEl.setAttribute('role', 'group');
    devEl.setAttribute('aria-label', T('pstage.device', 'Preview size'));
    /* 圖示走站上的 icon registry（data-lucide → ztorIcons.applyIcons，mount 尾端會掃 rootEl）；自畫 inline SVG 的手機框上緣會被裁掉 */
    var SVG_DESK = '<i data-lucide="monitor" class="ztor-icon"></i>';
    var SVG_MOB = '<i data-lucide="smartphone" class="ztor-icon"></i>';
    [['desktop', SVG_DESK, 'pstage.device.desktop', 'Desktop'], ['mobile', SVG_MOB, 'pstage.device.mobile', 'Mobile']].forEach(function (d) {
      var b = el('button', 'pstage__device-btn');
      b.type = 'button'; b.setAttribute('data-device', d[0]);
      b.setAttribute('aria-label', T(d[2], d[3])); b.title = T(d[2], d[3]);
      b.setAttribute('aria-pressed', String(d[0] === device));
      b.innerHTML = d[1];
      b.addEventListener('click', function () {
        rootEl.setAttribute('data-device', d[0]);
        devEl.querySelectorAll('.pstage__device-btn').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        try { localStorage.setItem('ztor.pstage-device', d[0]); } catch (e) {}
      });
      devEl.appendChild(b);
    });
    rootEl.appendChild(devEl);
    host.appendChild(rootEl);

    editBtn = el('button', 'btn btn--outline btn--sm pstage-edit');
    editBtn.type = 'button';
    editBtn.hidden = true;
    editBtn.innerHTML = '<i data-lucide="pencil" class="ztor-icon"></i><span>' + esc(T('pstage.edit', 'Edit')) + '</span>';

    var isSave = opts.mode === 'save';
    var primary = sideEl.querySelector('[data-stage-primary]');
    primary.textContent = T(opts.primaryKey || (isSave ? 'pstage.save' : 'pstage.publish'), isSave ? 'Save' : 'Publish event');
    var secondary = sideEl.querySelector('[data-stage-secondary]');
    secondary.textContent = T(opts.secondaryKey || (isSave ? 'pstage.cancel' : 'pstage.back'), isSave ? 'Cancel' : 'Back');
    secondary.hidden = typeof opts.onSecondary !== 'function';

    wire();
    syncData();
    renderPreview();
    renderSide();
    if (window.ztorIcons) window.ztorIcons.applyIcons(rootEl);
    return api;
  }

  var api = {
    refresh: function () { if (!rootEl) return; syncData(); renderPreview(); renderSide(); },
    syncChecks: function () { if (rootEl) renderSide(); },
    result: collectResult,
    unmount: function () { rootEl = null; mainEl = null; sideEl = null; closeDrawers(); }
  };

  window.ztorPublishStage = {
    mount: mount,
    /* 讀模組草稿（宿主在確認之外的時機要看時用），回傳副本 */
    drafts: function () { return { translations: JSON.parse(JSON.stringify(DRAFTS)) }; }
  };
})();
