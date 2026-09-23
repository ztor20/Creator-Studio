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
 *   側欄＝三段：
 *     1 語言    四個語系一列一個，標狀態（預設／自動翻譯／已修改 N 欄），點選切換預覽語系；
 *               有「還原自動翻譯」；段底「逐欄位對照」開右側滑出的**翻譯表**
 *     2 幣別    基準＋四個換算幣別，標狀態（基準／換算／已覆寫 N 項），點選切換預覽幣別；
 *               預覽裡的價格點下去開右側滑出的**價格表**
 *     3 依 mode：'publish' ＝發布前檢核（宿主給 checks()，每項可點跳回該步驟）
 *                'save'    ＝未儲存的變更摘要（本語系改了 N 欄、覆寫了 N 項）
 *   側欄底部＝主鈕（發布活動／儲存）＋次鈕（上一步／取消）
 *
 * 草稿模型延續 publish-preview.js（本檔是活動側的繼承者）：DRAFTS 每個欄位每個語系
 * 一份草稿、EDITED 記非預設語系是否被手動改過、PRICES 記每個價格的基準與逐幣別覆寫。
 * 三份都是模組變數，故意不隨每次 mount() 重置——第 8 步與其他步驟之間來回走、或
 * 「上一步」回去改一個字再回來，改過的翻譯與覆寫都還在。
 *
 * 用法（宣告式，同站上其他共用渲染器）：
 *   var stage = window.ztorPublishStage.mount(hostEl, {
 *     fields: [{ key, el:{value}, kind:'input'|'textarea', labelKey, labelFallback, group }],
 *     prices: [{ key, label, labelKey, groupKey, groupFallback, priceObj:{base,amount,override}, locked }],
 *     currencies: ['USD','TWD','HKD','SGD','JPY'], baseCurrency: 'TWD',
 *     views:   [{ key:'ticket' }, { key:'bundles' }],       // 給渲染器的視圖清單
 *     previewRender: function (host, api) {},               // 必填：主區怎麼畫
 *     mode: 'publish' | 'save',
 *     translation: 'auto' | 'manual',                       // 選填，預設 'auto'＝現行行為（原文抄成譯文）。
 *       'manual'（D312，活動側）＝非預設語系不自動帶原文，只存使用者填的譯文；沒填時預覽/表格
 *       fallback 顯示原文，翻譯表格子沒填時以原文當 placeholder（不預填值）。
 *     priceOverrides: true | false,                          // 選填，預設 true＝現行行為（各幣別皆可覆寫）。
 *       false（2026-09-23 裁示，電子商店側）＝非基準幣別全面唯讀，只顯示換算值：無輸入框／
 *       「已覆寫」徽章／重設鈕，側欄幣別段不計覆寫筆數。prices[] 每列可用 overridable:true/false
 *       個別覆寫這個全域設定（列級優先於全域）——活動側（D306）不傳這個選項，維持可覆寫。
 *     editZones: [{ sel:'.pdp-buy__title', step:2 }],       // 選填：hover 出現「編輯」跳回哪一步
 *     onEdit: function (step) {},                           // editZones 的點擊行為
 *     checks: function () { return [{ key, label, ok, step }]; },   // mode:'publish'
 *     primaryKey / secondaryKey: i18n key（不給就用 mode 的預設）
 *     onPrimary: function (result) {},   // result = { translations, prices, mode }
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
  var PRICES = {};

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
  /* 兩軸的「使用者動過了沒」：沒動過就跟著宿主的預設走（預覽語系＝介面語言、幣別＝基準幣別），
     動過就尊重使用者的選擇，第 8 步與其他步驟來回走不會被打回預設。 */
  var langPicked = false;
  var curPicked = false;
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

  /* ── 價格草稿（D306 規則不變，換算與格式化都問 events-store）──── */
  function store() { return window.ztorEvents || null; }
  function currencies() { return (opts && opts.currencies) || []; }
  function priceRec(key) { return PRICES[key]; }
  function priceIn(po, key) {
    var rec = key ? priceRec(key) : null;
    var obj = rec ? { base: rec.base, amount: rec.amount, override: rec.override } : po;
    var s = store();
    if (!s || !obj) return 0;
    return s.priceIn(obj, currentCurrency);
  }
  function fmtAmount(n, cur) {
    var s = store();
    return s ? s.fmtMoney(cur || currentCurrency, n) : String(n);
  }
  function money(po, key) { return fmtAmount(priceIn(po, key), currentCurrency); }
  function convertedOf(rec, cur) { var s = store(); return s ? s.fx(rec.base, cur, rec.amount) : rec.amount; }
  function isOverridden(rec, cur) {
    var v = rec.override && rec.override[cur];
    return v != null && v !== '' && !isNaN(Number(v));
  }
  /* priceOverrides（全域）／prices[i].overridable（列級，優先於全域）：該列非基準幣別
     能不能覆寫。electronic 商店側傳 priceOverrides:false 全關；活動側不傳＝現行可覆寫。 */
  function rowOverridable(p) {
    if (p && p.overridable === false) return false;
    if (p && p.overridable === true) return true;
    return opts.priceOverrides !== false;
  }
  function overrideCount(cur) {
    var n = 0;
    (opts.prices || []).forEach(function (p) {
      var rec = priceRec(p.key);
      if (rec && rec.base !== cur && rowOverridable(p) && isOverridden(rec, cur)) n++;
    });
    return n;
  }
  function overrideTotal() {
    var n = 0;
    (opts.prices || []).forEach(function (p) {
      var rec = priceRec(p.key);
      if (!rec || !rowOverridable(p)) return;
      currencies().forEach(function (c) { if (c !== rec.base && isOverridden(rec, c)) n++; });
    });
    return n;
  }

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
    /* 基準價變了 → 該列覆寫清空重算（§7.15 重算規則，比照 §7.4 翻譯） */
    (opts.prices || []).forEach(function (p) {
      var po = p.priceObj || {};
      var rec = PRICES[p.key];
      var amount = Math.round(Number(po.amount) || 0);
      if (!rec || rec.base !== po.base) {
        PRICES[p.key] = { base: po.base, amount: amount, override: JSON.parse(JSON.stringify(po.override || {})) };
      } else if (rec.amount !== amount) {
        PRICES[p.key] = { base: po.base, amount: amount, override: {} };
      }
    });
    var list = currencies();
    if (!curPicked || list.indexOf(currentCurrency) < 0) {
      currentCurrency = (opts.baseCurrency && list.indexOf(opts.baseCurrency) >= 0) ? opts.baseCurrency : (list[0] || 'TWD');
    }
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
  function rowBtn(active, name, state, attr, val, codeName) {
    var li = el('li');
    var b = el('button', 'pstage-row' + (active ? ' pstage-row--active' : ''));
    b.type = 'button';
    b.setAttribute(attr, val);
    b.innerHTML = '<span class="pstage-row__name' + (codeName ? ' pstage-row__name--code' : '') + '">' + esc(name) + '</span>' +
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

  function currencySection() {
    var list = currencies();
    if (!list.length) return null;
    var sec = el('section', 'pstage-sec');
    sec.appendChild(el('h3', 'pstage-sec__title', esc(T('pstage.sec.currency', 'Currency'))));
    var ul = el('ul', 'pstage-list');
    var base = opts.baseCurrency;
    list.forEach(function (c) {
      var n = overrideCount(c);
      var state = c === base ? T('pstage.cur.base', 'Base')
        : (n ? T('pstage.cur.overridden', '{n} overridden').replace('{n}', n) : T('pstage.cur.converted', 'Converted'));
      ul.appendChild(rowBtn(c === currentCurrency, c, state, 'data-stage-currency', c, true));
    });
    sec.appendChild(ul);
    var foot = el('div', 'pstage-sec__foot');
    var tbl = el('button', 'btn btn--outline btn--sm');
    tbl.type = 'button';
    tbl.setAttribute('data-stage-drawer-open', 'price');
    tbl.textContent = T('pstage.cur.table', 'Price table');
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
    var prices = overrideTotal();
    if (!fields && !prices) {
      sec.appendChild(el('p', 'pstage-sum__none', esc(T('pstage.changes.none', 'Nothing changed yet'))));
      return sec;
    }
    var box = el('div', 'pstage-sum');
    function row(k, v) {
      box.appendChild(el('div', 'pstage-sum__row',
        '<span class="pstage-sum__k">' + esc(k) + '</span><span class="pstage-sum__v">' + esc(v) + '</span>'));
    }
    row(T('pstage.changes.fields', 'Text fields'), String(fields));
    row(T('pstage.changes.prices', 'Price overrides'), String(prices));
    sec.appendChild(box);
    return sec;
  }

  function renderSide() {
    if (!sideEl) return;
    var inner = sideEl.querySelector('[data-stage-side-inner]');
    inner.innerHTML = '';
    inner.appendChild(langSection());
    var cur = currencySection();
    if (cur) inner.appendChild(cur);
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

  /* ── 抽屜：翻譯表／價格表 ─────────────────────────────────────── */
  function ensureDrawer(key, titleKey, titleFb) {
    if (drawers[key]) return drawers[key];
    /* 翻譯表、價格表都整頁（2026-09-23 使用者：「翻譯表的 popup 要整頁，同時裡面的每一個欄位都要變大」，
       價格表隨後「可以統一」）：880 的抽屜把每格壓成一小塊，兩張表同一種殼。 */
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
  function openDrawer(key, priceKey) {
    var d = key === 'price'
      ? ensureDrawer('price', 'pstage.drawer.price', 'Prices')
      : ensureDrawer('trans', 'pstage.drawer.trans', 'Translations');
    if (key === 'price') renderPriceTable(d.body); else renderTransTable(d.body);
    d.wrap.classList.add('is-open');
    d.wrap.setAttribute('aria-hidden', 'false');
    if (key === 'price' && priceKey) {
      var cell = d.body.querySelector('[data-pp-price-key="' + priceKey + '"]');
      if (cell) {
        var tr = cell.closest('tr');
        if (tr) tr.classList.add('pstage-trow--focus');
        cell.focus();
        cell.select && cell.select();
      }
    }
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
    var hint = el('p', 'field__hint pstage-drawer__hint');
    hint.textContent = T('pstage.drawer.trans-hint', 'The default language is read-only — edit it in the form.');
    host.appendChild(hint);
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
      tr.appendChild(el('td', 'ztor-table__feature', esc(f.labelKey ? T(f.labelKey, f.labelFallback || f.key) : (f.labelFallback || f.key))));
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
  }

  /* 價格表（列＝票種／組合包、欄＝五幣別；基準欄唯讀、bookyay 鎖定列標鎖） */
  function syncPriceCellState(td, rec, cur) {
    if (!td) return;
    var on = isOverridden(rec, cur);
    td.classList.toggle('pp-cell--overridden', on);
    var tag = td.querySelector('[data-pp-price-tag]');
    var reset = td.querySelector('[data-pp-price-reset]');
    if (tag) tag.hidden = !on;
    if (reset) reset.hidden = !on;
  }
  function renderPriceTable(host) {
    host.innerHTML = '';
    var list = currencies();
    var base = opts.baseCurrency;
    var rows = opts.prices || [];
    /* 全部列都唯讀（電子商店）才換提示句；有些列可覆寫、有些不行（混合）時沿用舊句，
       因為舊句「其餘幣別是換算值，輸入數字即覆寫」對可覆寫的列仍然成立。 */
    var allReadonly = rows.length > 0 && rows.every(function (p) { return !rowOverridable(p); });
    var hint = el('p', 'field__hint pstage-drawer__hint');
    hint.textContent = allReadonly
      ? T('pstage.drawer.price-hint-readonly', 'Other currencies convert automatically at the exchange rate — the store can’t adjust them individually.')
      : T('pp.table.prices-hint', 'Base currency is read-only — change the price in the form. Other currencies are converted; type a number to override it.');
    host.appendChild(hint);
    var scroll = el('div', 'ztor-table-scroll');
    var table = el('table', 'ztor-table pp-table pp-price-table');
    var thead = el('thead');
    var hr = el('tr');
    hr.appendChild(el('th', '', esc(T('pp.table.item', 'Item'))));
    list.forEach(function (c) {
      hr.appendChild(el('th', '', esc(c) + (c === base ? ' <span class="badge badge--neutral">' + esc(T('pp.price.base', 'Base')) + '</span>' : '')));
    });
    thead.appendChild(hr);
    table.appendChild(thead);
    var tbody = el('tbody');
    var lastGroup = null;
    (opts.prices || []).forEach(function (p) {
      var rec = priceRec(p.key);
      if (!rec) return;
      var group = p.groupKey ? T(p.groupKey, p.groupFallback || '') : (p.group || null);
      if (group && group !== lastGroup) {
        var gr = el('tr', 'pp-group-row');
        var gtd = el('td', '', esc(group));
        gtd.colSpan = 1 + list.length;
        gr.appendChild(gtd);
        tbody.appendChild(gr);
      }
      lastGroup = group || null;
      var overridable = rowOverridable(p);
      var tr = el('tr');
      tr.appendChild(el('td', 'ztor-table__feature', esc(p.labelKey ? T(p.labelKey, p.label || p.key) : (p.label || p.key))));
      list.forEach(function (c) {
        var td = el('td');
        if (c === rec.base) {
          td.className = 'pp-cell pp-cell--readonly pp-cell--base';
          td.innerHTML = '<span class="pp-price-num">' + esc(fmtAmount(rec.amount, c)) + '</span>' +
            (p.locked ? '<span class="pp-price-lock" title="' + esc(T('pp.price.locked', 'Set by bookyay')) + '"><i data-lucide="lock" class="ztor-icon"></i></span>' : '');
        } else if (!overridable) {
          /* priceOverrides:false（或該列 overridable:false）＝只顯示換算值，沿用基準格
             同一套唯讀樣式（.pp-cell--base 負責右對齊與列高對齊），不掛鎖圖示（不是
             bookyay 鎖定，是電子商店規則本身不給覆寫）。 */
          td.className = 'pp-cell pp-cell--readonly pp-cell--base';
          td.innerHTML = '<span class="pp-price-num">' + esc(fmtAmount(convertedOf(rec, c), c)) + '</span>';
        } else {
          td.className = 'pp-cell pp-cell--price';
          var input = document.createElement('input');
          input.className = 'input pp-cell-field pp-price-input';
          input.type = 'number';
          input.min = '0';
          input.step = '1';
          input.inputMode = 'numeric';
          input.value = isOverridden(rec, c) ? rec.override[c] : convertedOf(rec, c);
          input.setAttribute('data-pp-price-key', p.key);
          input.setAttribute('data-pp-price-cur', c);
          input.setAttribute('aria-label', c);
          td.appendChild(input);
          var meta = el('div', 'pp-price-meta');
          meta.innerHTML =
            '<span class="badge badge--orange badge--inline" data-pp-price-tag hidden>' + esc(T('pp.price.overridden', 'Overridden')) + '</span>' +
            '<button class="btn btn--ghost btn--sm pp-price-reset" type="button" data-pp-price-reset="' + esc(p.key) + '" data-pp-price-cur="' + esc(c) + '" hidden>' +
              esc(T('pp.price.reset', 'Reset to converted')) + '</button>';
          td.appendChild(meta);
          syncPriceCellState(td, rec, c);
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    host.appendChild(scroll);
    if (window.ztorIcons) window.ztorIcons.applyIcons(host);
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
  function setCurrency(cur) {
    if (!cur || currencies().indexOf(cur) < 0) return;
    curPicked = true;
    if (cur === currentCurrency) return;
    currentCurrency = cur;
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
    var prices = {};
    (opts.prices || []).forEach(function (p) {
      var rec = priceRec(p.key);
      if (!rec) return;
      var out = {};
      /* 唯讀列（priceOverrides:false 或該列 overridable:false）不輸出覆寫——即使草稿裡
         殘留舊值（例如全域選項中途切換），落地結果也不帶出來。 */
      if (rowOverridable(p)) {
        currencies().forEach(function (c) { if (c !== rec.base && isOverridden(rec, c)) out[c] = Math.round(Number(rec.override[c])); });
      }
      prices[p.key] = out;
    });
    return { translations: translations, prices: prices, mode: opts.mode || 'publish' };
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
      if (openBtn) { e.preventDefault(); openDrawer(openBtn.getAttribute('data-stage-drawer-open')); return; }
      var langBtn = e.target.closest('[data-stage-lang]');
      if (langBtn) { setLang(langBtn.getAttribute('data-stage-lang')); return; }
      var resetBtn = e.target.closest('[data-stage-lang-reset]');
      if (resetBtn) { resetLang(currentLang); renderPreview(); renderSide(); return; }
      var curBtn = e.target.closest('[data-stage-currency]');
      if (curBtn) { setCurrency(curBtn.getAttribute('data-stage-currency')); return; }
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
      /* 預覽裡的價格 → 開價格表（D310：價格不就地改） */
      var priceHit = mainEl && mainEl.contains(e.target) ? e.target.closest('[data-fep-price-key]') : null;
      if (priceHit) { e.preventDefault(); openDrawer('price', priceHit.getAttribute('data-fep-price-key')); return; }
      var priceReset = e.target.closest('[data-pp-price-reset]');
      if (priceReset) {
        var rec = priceRec(priceReset.getAttribute('data-pp-price-reset'));
        if (rec) {
          delete rec.override[priceReset.getAttribute('data-pp-price-cur')];
          if (drawers.price) renderPriceTable(drawers.price.body);
          renderPreview();
          renderSide();
        }
        return;
      }
    });

    /* 預覽裡就地編輯 ＋ 兩張表的輸入 */
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
      var pcell = e.target.closest('[data-pp-price-key]');
      if (pcell) {
        var rec = priceRec(pcell.getAttribute('data-pp-price-key'));
        var cur = pcell.getAttribute('data-pp-price-cur');
        if (!rec) return;
        var v = pcell.value.trim();
        if (v === '' || isNaN(Number(v))) delete rec.override[cur];
        else rec.override[cur] = Math.round(Number(v));
        /* 只更新該格狀態，不重畫整張表（重畫會搶走焦點） */
        syncPriceCellState(pcell.closest('td'), rec, cur);
        renderSide();
      }
    });
    document.addEventListener('change', function (e) {
      if (!rootEl) return;
      var pcell = e.target.closest('[data-pp-price-key]');
      if (!pcell) return;
      var rec = priceRec(pcell.getAttribute('data-pp-price-key'));
      var cur = pcell.getAttribute('data-pp-price-cur');
      if (!rec) return;
      pcell.value = isOverridden(rec, cur) ? rec.override[cur] : convertedOf(rec, cur);
      syncPriceCellState(pcell.closest('td'), rec, cur);
      renderPreview();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawers();
    });
    /* hover 出現「編輯」：委派在主區上，滑到別處就收起 */
    document.addEventListener('mouseover', function (e) {
      if (!rootEl || !mainEl || !(opts.editZones || []).length) return;
      if (!mainEl.contains(e.target)) { hideEdit(); return; }
      if (editBtn.contains(e.target)) return;
      var zone = zoneOf(e.target);
      if (zone) showEdit(zone); else hideEdit();
    });
  }

  /* ── 掛載 ─────────────────────────────────────────────────────── */
  function mount(host, options) {
    if (!host || !options) return null;
    opts = options;
    host.innerHTML = '';
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
    drafts: function () { return { translations: JSON.parse(JSON.stringify(DRAFTS)), prices: JSON.parse(JSON.stringify(PRICES)) }; }
  };
})();
