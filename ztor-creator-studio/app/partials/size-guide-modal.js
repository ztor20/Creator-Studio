// partials/size-guide-modal.js — 尺寸指南編輯器（規格 5.1.5.5 F7.2 / D171、D211）
//
// 兩個地方在編同一張表，所以編輯器住在這裡、不住在任何一頁：
//   商店設定 · 尺寸指南設定（store-settings.html）＝這間店的尺寸指南，建了就出現在所有商品上；
//   建立商品 · 商品資訊（create-product.html）＝這件商品專屬的一份，設了就蓋掉商店那幾份。
// 欄位定義同一套（尺碼制／量測單位／尺寸表／版型建議／身高體重／量測方式／免責），
// 差別只有「要不要問名字」——商品專屬那份沒有名字（它只屬於那一件商品）。
//
// 資料驅動（2026-10-29）：彈窗不再寫死示範值，依 js/size-guides-store.js 的 content 畫出
// 尺寸表／身高體重／版型建議／量測方式／免責；content 欄位說明見該檔 PRESETS 上方註解。
//
// 用法：
//   window.ztorSizeGuide.open({
//     titleKey: 'store-settings.specs.new',   // 彈窗標題的 i18n key
//     showName: true,                         // 商品專屬指南傳 false（不問名字）
//     guideId: 'sg-tee',                      // 要開哪一份（store 的 id）；沒帶＝用 T 恤內容當示範
//     name: 'T 恤', nameKey: 'store-settings.specs.row.tee',  // 帶入名稱（可省）
//     blank: false,                           // true＝空白範本（新增）
//     guides: ['sg-tee', …], guideKey: 'sg-tee',  // 帶 2 份以上＝顯示切換下拉（D216）
//     onSave: (data) => {}                    // 按「儲存」時呼叫，data = { name }
//   })
//
// 全前端 demo：不落地、不上傳；關閉即丟。示範值與 demo 手法見 ASSUMPTIONS UIA-106、UIA-316。
(function () {
  var MARKUP = '<div class="payout-modal" id="sg-modal" hidden>\n' +
    '  <section class="payout-dialog payout-dialog--wide" role="dialog" aria-modal="true" aria-labelledby="sg-modal-title">\n' +
    '    <div class="payout-dialog__head">\n' +
    '      <h2 class="payout-dialog__title" id="sg-modal-title" data-i18n="store-settings.specs.new">Add size guide</h2>\n' +
    '      <button class="btn btn--icon" type="button" data-spec-close aria-label="Close" data-i18n-aria-label="store-settings.specs.close"><i data-lucide="x" class="ztor-icon"></i></button>\n' +
    '    </div>\n' +
    '    <div class="payout-dialog__body">\n' +
    '      <p class="field__hint" data-sg-notice hidden></p>\n' +
    '      <!-- 指南切換（D216）：從建立商品的「點擊查看」開進來時，商店有幾份就列幾份，\n' +
    '           在彈窗裡直接換著看，不必為了看另一份退出去重點一次。 -->\n' +
    '      <div class="settings-row" data-sg-picker hidden>\n' +
    '        <div class="settings-row__label" data-i18n="cp.sg.shop.picker">Shop guide</div>\n' +
    '        <span class="select-wrap"><select class="select sg-picker__select" aria-label="Which guide" data-i18n-aria-label="cp.sg.shop.picker" data-sg-picker-select></select></span>\n' +
    '      </div>\n' +
    '            <div class="field" data-sg-namefield>\n' +
    '              <label class="field__label" for="sg-name"><span data-i18n="store-settings.specs.f.name">Name</span> <span class="field__req">*</span></label>\n' +
    '              <input class="input" id="sg-name" type="text" value="" placeholder="e.g. Tops" data-i18n-placeholder="store-settings.specs.f.name.ph">\n' +
    '              <p class="field__hint" data-i18n="store-settings.specs.f.name.hint">Only you see this — it\'s how you\'ll pick the guide when creating an item.</p>\n' +
    '            </div>\n' +
    '\n' +
    '          <!-- 商品類型：值取自 §7.1 的次分類群組層（D210 具名例外），本版只有「服飾配件」，\n' +
    '               做成假的可選清單只會讓人以為還有別的（規格 F7.1：其他群組欄位未由上游定義前不開放選取）。 -->\n' +
    '          <div class="settings-row">\n' +
    '            <div>\n' +
    '              <div class="settings-row__label" data-i18n="store-settings.specs.f.type">Item type</div>\n' +
    '              <div class="settings-row__hint" data-i18n="store-settings.specs.f.type.hint">Shoes and accessories need different measurements — not defined yet.</div>\n' +
    '            </div>\n' +
    '            <span class="badge" data-i18n="store-settings.specs.type.apparelacc">Apparel &amp; accessories</span>\n' +
    '          </div>\n' +
    '\n' +
    '          <!-- 尺寸表（F7.2 主資料）：列＝尺碼、欄＝量測項，兩軸都可增刪。\n' +
    '               右上的量測單位是絕對換算（公分↔英吋），切換＝換一種看法（D212）。\n' +
    '               尺碼制改成這張表的分頁（D214，2026-08-20 使用者裁示）：四種標示法都要填，\n' +
    '               切換只換尺碼欄，量測值四制共用——同一件衣服不會因為換一種標法就變大。 -->\n' +
    '          <div class="sce-block">\n' +
    '            <div class="sce-block__head">\n' +
    '              <div>\n' +
    '                <div class="settings-row__label" data-i18n="store-settings.specs.f.chart">Size chart</div>\n' +
    '                <div class="settings-row__hint" data-i18n="store-settings.specs.f.chart.hint">Garment laid flat, not body measurements.</div>\n' +
    '              </div>\n' +
    '              <div class="segmented" role="group" aria-label="Unit" data-i18n-aria-label="store-settings.specs.f.unit" data-spec-unit-group>\n' +
    '                <button class="segmented__btn segmented__btn--active" type="button" data-spec-unit="cm" data-i18n="store-settings.specs.unit.cm">cm</button>\n' +
    '                <button class="segmented__btn" type="button" data-spec-unit="in" data-i18n="store-settings.specs.unit.in">inch</button>\n' +
    '              </div>\n' +
    '            </div>\n' +
    '            <nav class="tabs tabs--count-plain sce-block__tabs" role="tablist" aria-label="Size labels" data-i18n-aria-label="store-settings.specs.f.system" data-spec-sys-tabs>\n' +
    '              <button class="tabs__item tabs__item--active" type="button" role="tab" aria-selected="true" data-spec-system="intl"><span data-i18n="store-settings.specs.system.intl">International</span><span class="tabs__item-count" data-spec-sys-todo hidden></span></button>\n' +
    '              <button class="tabs__item" type="button" role="tab" aria-selected="false" data-spec-system="us">US<span class="tabs__item-count" data-spec-sys-todo hidden></span></button>\n' +
    '              <button class="tabs__item" type="button" role="tab" aria-selected="false" data-spec-system="eu">EU<span class="tabs__item-count" data-spec-sys-todo hidden></span></button>\n' +
    '              <button class="tabs__item" type="button" role="tab" aria-selected="false" data-spec-system="jp">JP<span class="tabs__item-count" data-spec-sys-todo hidden></span></button>\n' +
    '            </nav>\n' +
    '            <p class="settings-row__hint sce-block__tabs-hint" data-i18n="store-settings.specs.f.system.hint">Fill in every system. Switching only swaps the size column — the measurements stay the same.</p>\n' +
    '            <div class="sce">\n' +
    '              <div class="sce__wrap">\n' +
    '                <div class="sce__table" data-spec-chart></div>\n' +
    '              </div>\n' +
    '              <div class="sce__foot">\n' +
    '                <button class="sce__add" type="button" data-spec-addrow><i data-lucide="plus" class="ztor-icon"></i><span data-i18n="store-settings.specs.chart.addrow">Add size</span></button>\n' +
    '                <button class="sce__add" type="button" data-spec-addcol><i data-lucide="plus" class="ztor-icon"></i><span data-i18n="store-settings.specs.chart.addcol">Add measurement</span></button>\n' +
    '              </div>\n' +
    '            </div>\n' +
    '          </div>\n' +
    '\n' +
    '          <div class="sce-block">\n' +
    '            <label class="settings-row__label" for="sg-fit" data-i18n="store-settings.specs.f.fit">Fit advice</label>\n' +
    '            <div class="settings-row__hint" style="margin-bottom:var(--sp-8)" data-i18n="store-settings.specs.f.fit.hint">What to do when someone falls between two sizes.</div>\n' +
    '            <textarea class="textarea" id="sg-fit" style="min-height:78px" placeholder="e.g. Regular fit. Size up if you layer a hoodie underneath. Model is 180 cm / 72 kg, wearing L." data-i18n-placeholder="store-settings.specs.f.fit.ph"></textarea>\n' +
    '          </div>\n' +
    '\n' +
    '          <!-- 身高體重參考：同一支 .sce，欄固定兩欄、表頭不給刪除鈕；襪子／鞋子／帽子不適用，整張表換成一句說明 -->\n' +
    '          <div class="sce-block" data-sg-hw-block>\n' +
    '            <div class="settings-row__label" data-i18n="store-settings.specs.f.body">Height &amp; weight guide</div>\n' +
    '            <div class="settings-row__hint" style="margin-bottom:var(--sp-8)" data-i18n="store-settings.specs.f.body.hint">Optional. Helps fans who can\'t measure a garment they don\'t own yet.</div>\n' +
    '            <p class="settings-row__hint" data-sg-hw-na hidden></p>\n' +
    '            <div class="sce" data-sg-hw-sce>\n' +
    '              <div class="sce__wrap">\n' +
    '                <div class="sce__table" data-spec-hw style="--sce-cols: 112px minmax(120px, 1fr) minmax(120px, 1fr) 34px"></div>\n' +
    '              </div>\n' +
    '              <div class="sce__foot">\n' +
    '                <button class="sce__add" type="button" data-spec-addrow><i data-lucide="plus" class="ztor-icon"></i><span data-i18n="store-settings.specs.chart.addrow">Add size</span></button>\n' +
    '              </div>\n' +
    '            </div>\n' +
    '          </div>\n' +
    '\n' +
    '          <!-- 量測方式：逐部位一列，沿用 .spec-row（建立商品的詳細規格同一套） -->\n' +
    '          <div class="sce-block">\n' +
    '            <div class="settings-row__label" data-i18n="store-settings.specs.f.howto">How to measure</div>\n' +
    '            <div class="settings-row__hint" style="margin-bottom:var(--sp-8)" data-i18n="store-settings.specs.f.howto.hint">Optional. Written for someone holding a tape measure for the first time.</div>\n' +
    '            <div data-spec-howto></div>\n' +
    '            <button class="sce__add" type="button" style="margin-top:var(--sp-8)" data-spec-addhowto><i data-lucide="plus" class="ztor-icon"></i><span data-i18n="store-settings.specs.howto.add">Add body part</span></button>\n' +
    '          </div>\n' +
    '\n' +
    '          <div class="sce-block">\n' +
    '            <label class="settings-row__label" for="sg-note" data-i18n="store-settings.specs.f.note">Disclaimer</label>\n' +
    '            <div class="settings-row__hint" style="margin-bottom:var(--sp-8)" data-i18n="store-settings.specs.f.note.hint">Shown under the chart. Sets expectations before a return request.</div>\n' +
    '            <textarea class="textarea" id="sg-note" style="min-height:56px" placeholder="e.g. Measured flat in cm. Fabric may vary by 1–2 cm." data-i18n-placeholder="store-settings.specs.f.note.ph"></textarea>\n' +
    '          </div>\n' +
    '    </div>\n' +
    '    <div class="payout-dialog__foot">\n' +
    '      <button class="btn btn--outline" type="button" data-spec-close data-i18n="store-settings.specs.cancel">Cancel</button>\n' +
    '      <button class="btn btn--primary" type="button" data-spec-close data-sg-save data-i18n="store-settings.specs.save">Save guide</button>\n' +
    '    </div>\n' +
    '  </section>\n' +
    '</div>';

  var modal = null;

  function T(k) { return (window.i18nT && window.i18nT(k)) || ''; }
  var SP = 'store-settings.specs.';
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function store() { return window.ZtorSizeGuides || null; }

  function ensure() {
    if (modal) return modal;
    var host = document.createElement('div');
    host.innerHTML = MARKUP;
    modal = host.firstElementChild;
    document.body.appendChild(modal);
    bind();
    if (window.ztorIcons) window.ztorIcons.applyIcons(modal);
    if (window.applyI18n) window.applyI18n(modal);
    return modal;
  }

  var onSave = null;

  /* ── 資料 → 畫面 ─────────────────────────────────────────────
     model ＝畫面上整份表單的樣子（全是已翻成當下語言的字串，量測值一律以公分存）：
       { unit, cols:[欄名], rows:[{ labels:{intl,us,eu,jp}, vals:[…] }],
         hw:[{size,h,w}] | null, hwNa:'不適用的說明', fit, howto:[{part,desc}], note }
     content（store 的資料）→ modelFromContent；使用者新增 → blankModel；
     畫面 → readForm（換份、換語言前存起來）；model → renderForm（畫出來）。 */
  function mwText(v) {
    if (v == null) return '';
    if (typeof v !== 'object') return String(v);
    var m = T(SP + 'sys.mw.m'), w = T(SP + 'sys.mw.w');
    var cjk = /[一-鿿]/.test(m);
    return m + ' ' + v.m + (cjk ? '／' : ' / ') + w + ' ' + v.w;
  }

  function modelFromContent(c) {
    return {
      unit: 'cm',
      cols: c.cols.map(function (id) { return T(SP + 'm.' + id); }),
      rows: c.rows.map(function (r) {
        return {
          labels: { intl: mwText(r.intl), us: mwText(r.us), eu: mwText(r.eu), jp: mwText(r.jp) },
          vals: r.vals.map(function (v) { return v == null ? '' : String(v); })
        };
      }),
      hw: c.hw ? c.hw.map(function (x) { return { size: x.size, h: x.h, w: x.w }; }) : null,
      hwNa: c.hw ? '' : T(SP + 'hw.na.' + (c.hwNa || 'foot')),
      fit: T(c.fit),
      howto: c.howto.map(function (id) { return { part: T(SP + 'h.' + id + '.part'), desc: T(SP + 'h.' + id + '.desc') }; }),
      note: T(c.note)
    };
  }

  /* 新增＝空白範本：三個常見量測欄名保留（那是欄位定義、不是資料），其餘清空（沿用原本的新增行為） */
  function blankModel() {
    var empty = { labels: { intl: '', us: '', eu: '', jp: '' }, vals: ['', '', ''] };
    return {
      unit: 'cm',
      cols: [T(SP + 'm.chest'), T(SP + 'm.length'), T(SP + 'm.sleeve')],
      rows: [0, 1, 2].map(function () { return JSON.parse(JSON.stringify(empty)); }),
      hw: [{ size: '', h: '', w: '' }, { size: '', h: '', w: '' }],
      hwNa: '', fit: '',
      howto: [{ part: '', desc: '' }, { part: '', desc: '' }],
      note: ''
    };
  }

  /* 只有「整格都是數字」才是能換算的量測值；「22.0–24.0」「55–60」這種區間／字串原樣顯示 */
  function isNum(v) { return /^\d+(\.\d+)?$/.test(String(v).trim()); }

  function sceRow(cells, removeAttr) {
    return '<div class="sce__row">' + cells + '<button class="sce__row-remove" type="button" data-spec-rowrm><i data-lucide="trash-2" class="ztor-icon"></i></button></div>';
  }
  function cellInput(cls, val, label, i18nKey, extra) {
    return '<input class="input sce__cell' + (cls ? ' ' + cls : '') + '" type="text"' + (extra || '') + ' value="' + esc(val) + '" placeholder="—" aria-label="' + esc(label) + '" data-i18n-aria-label="' + i18nKey + '">';
  }

  function renderForm(m) {
    var chart = modal.querySelector('[data-spec-chart]');
    var head = '<div class="sce__head"><div class="sce__col"><span class="sce__col-label" data-i18n="' + SP + 'chart.size">Size</span></div>'
      + m.cols.map(function (c) {
        return '<div class="sce__col"><input class="input sce__col-input" type="text" value="' + esc(c) + '" aria-label="Measurement name" data-i18n-aria-label="' + SP + 'chart.colname">'
          + '<button class="sce__col-remove" type="button" data-spec-colrm><i data-lucide="x" class="ztor-icon"></i></button></div>';
      }).join('') + '<div></div></div>';
    sysLabels = { intl: [], us: [], eu: [], jp: [] };
    var rows = m.rows.map(function (r) {
      SYSTEMS.forEach(function (s) { sysLabels[s].push(r.labels[s] || ''); });
      return sceRow(cellInput('sce__cell--size', r.labels.intl, 'Size', SP + 'chart.size').replace(' placeholder="—"', '')
        + r.vals.map(function (v, i) {
          return cellInput('', v, m.cols[i] || 'Measurement', SP + 'chart.value', ' inputmode="decimal"').replace(' data-i18n-aria-label="' + SP + 'chart.value"', '');
        }).join(''));
    }).join('');
    chart.innerHTML = head + rows;
    syncCols(chart);
    /* 公分真值：數字格記下來，之後切換單位才換得對 */
    chartCells().forEach(function (c) { delete c.dataset.cm; if (isNum(c.value)) c.dataset.cm = String(parseFloat(c.value)); });

    /* 身高體重：不適用就整張表換成一句說明 */
    var hwBlock = modal.querySelector('[data-sg-hw-block]');
    var hwNa = modal.querySelector('[data-sg-hw-na]');
    var hwSce = modal.querySelector('[data-sg-hw-sce]');
    var hwTable = modal.querySelector('[data-spec-hw]');
    if (m.hw) {
      hwNa.hidden = true; hwNa.textContent = ''; hwSce.hidden = false;
      hwTable.innerHTML = '<div class="sce__head"><div class="sce__col"><span class="sce__col-label" data-i18n="' + SP + 'chart.size">Size</span></div>'
        + '<div class="sce__col"><span class="sce__col-label" data-i18n="' + SP + 'body.height">Height</span></div>'
        + '<div class="sce__col"><span class="sce__col-label" data-i18n="' + SP + 'body.weight">Weight</span></div><div></div></div>'
        + m.hw.map(function (x) {
          return sceRow(cellInput('sce__cell--size', x.size, 'Size', SP + 'chart.size').replace(' placeholder="—"', '')
            + cellInput('', x.h, 'Height', SP + 'body.height') + cellInput('', x.w, 'Weight', SP + 'body.weight'));
        }).join('');
    } else {
      hwSce.hidden = true; hwTable.innerHTML = '';
      hwNa.textContent = m.hwNa; hwNa.hidden = false;
    }
    if (hwBlock) hwBlock.hidden = false;

    modal.querySelector('#sg-fit').value = m.fit || '';
    modal.querySelector('#sg-note').value = m.note || '';
    modal.querySelector('[data-spec-howto]').innerHTML = m.howto.map(function (h) {
      return '<div class="spec-row"><input class="input" type="text" value="' + esc(h.part) + '" aria-label="Body part" data-i18n-aria-label="' + SP + 'howto.part">'
        + '<input class="input" type="text" value="' + esc(h.desc) + '" aria-label="How to measure it" data-i18n-aria-label="' + SP + 'howto.body">'
        + '<button class="btn btn--icon btn--sm" type="button" data-spec-howtorm aria-label="Remove" data-i18n-aria-label="' + SP + 'howto.remove"><i data-lucide="trash-2" class="ztor-icon"></i></button></div>';
    }).join('');

    /* 單位與尺碼制分頁回到初始（單位依 model.unit，分頁回國際） */
    var unit = m.unit || 'cm';
    var group = modal.querySelector('[data-spec-unit-group]');
    if (group) {
      group.setAttribute('data-unit', unit);
      [].forEach.call(group.querySelectorAll('[data-spec-unit]'), function (b) {
        b.classList.toggle('segmented__btn--active', b.getAttribute('data-spec-unit') === unit);
      });
    }
    curSys = m.curSys && SYSTEMS.indexOf(m.curSys) >= 0 ? m.curSys : 'intl';
    [].forEach.call(modal.querySelectorAll('[data-spec-sys-tabs] [data-spec-system]'), function (tab) {
      var on = tab.getAttribute('data-spec-system') === curSys;
      tab.classList.toggle('tabs__item--active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    restore(curSys);
    if (unit === 'in') renderChart('in');
    paintSysTabs();
    if (window.ztorIcons) window.ztorIcons.applyIcons(modal);
    if (window.applyI18n) window.applyI18n(modal);
  }

  function readForm() {
    stash();
    var chart = modal.querySelector('[data-spec-chart]');
    var cols = [].map.call(chart.querySelectorAll('.sce__head .sce__col-input'), function (i) { return i.value; });
    var rows = [].map.call(chart.querySelectorAll('.sce__row'), function (row, n) {
      var vals = [].map.call(row.querySelectorAll('.sce__cell:not(.sce__cell--size)'), function (c) {
        return c.dataset.cm != null ? c.dataset.cm : c.value;
      });
      return { labels: { intl: sysLabels.intl[n] || '', us: sysLabels.us[n] || '', eu: sysLabels.eu[n] || '', jp: sysLabels.jp[n] || '' }, vals: vals };
    });
    var hwSce = modal.querySelector('[data-sg-hw-sce]');
    var hw = null;
    if (hwSce && !hwSce.hidden) {
      hw = [].map.call(modal.querySelectorAll('[data-spec-hw] .sce__row'), function (row) {
        var c = row.querySelectorAll('.sce__cell');
        return { size: c[0].value, h: c[1].value, w: c[2].value };
      });
    }
    return {
      unit: currentUnit(), curSys: curSys, cols: cols, rows: rows, hw: hw,
      hwNa: hw ? '' : modal.querySelector('[data-sg-hw-na]').textContent,
      fit: modal.querySelector('#sg-fit').value, note: modal.querySelector('#sg-note').value,
      howto: [].map.call(modal.querySelectorAll('[data-spec-howto] .spec-row'), function (row) {
        var i = row.querySelectorAll('input'); return { part: i[0].value, desc: i[1].value };
      })
    };
  }

  /* 這份指南的起始 model：新增＝空白；有 content 就依它畫；使用者自建的（沒有 content）＝空白範本；
     沒指定是哪份（商品專屬指南的示範）＝拿 T 恤內容當示範值。 */
  function initialModel(guideId, blank) {
    var S = store();
    if (blank) return blankModel();
    var c = null;
    if (guideId && S) c = S.contentOf(S.get(guideId));
    else if (S) c = S.preset('sg-tee');
    return c ? modelFromContent(c) : blankModel();
  }

  function open(opts) {
    opts = opts || {};
    ensure();
    var title = modal.querySelector('#sg-modal-title');
    if (title && opts.titleKey) {
      title.setAttribute('data-i18n', opts.titleKey);
      title.textContent = T(opts.titleKey) || title.textContent;
    }
    /* 名稱欄：商店的指南要有名字（清單靠它辨識），商品專屬那份不需要 */
    var namefield = modal.querySelector('[data-sg-namefield]');
    if (namefield) namefield.hidden = opts.showName === false;

    /* 提示位：從別的地方開這個編輯器時說清楚「你現在改的是誰」——
       建立商品那頁的「點擊查看」開的是商店的指南，改動會影響所有沿用中的商品（D215）。 */
    var notice = modal.querySelector('[data-sg-notice]');
    if (notice) {
      if (opts.noticeKey) {
        notice.setAttribute('data-i18n', opts.noticeKey);
        notice.textContent = T(opts.noticeKey) || '';
        notice.hidden = false;
      } else {
        notice.removeAttribute('data-i18n');
        notice.textContent = '';
        notice.hidden = true;
      }
    }

    var activeId = opts.guideKey || opts.guideId || '';
    renderForm(initialModel(activeId, opts.blank));
    buildPicker(opts.guides, opts.guideKey);

    var name = modal.querySelector('#sg-name');
    if (name && opts.showName !== false) {
      if (opts.blank) { name.value = ''; name.removeAttribute('data-i18n-value'); }
      if (opts.name != null) name.value = opts.name;
      if (opts.nameKey) name.setAttribute('data-i18n-value', opts.nameKey);
      else if (opts.name != null) name.removeAttribute('data-i18n-value');
    }
    onSave = typeof opts.onSave === 'function' ? opts.onSave : null;

    if (window.applyI18n) window.applyI18n(modal);
    modal.hidden = false;
    document.body.classList.add('is-modal-open');
    var focusTarget = opts.showName === false ? modal.querySelector('.sce__cell') : name;
    if (focusTarget) focusTarget.focus();
  }

  function close() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('is-modal-open');
    onSave = null;
  }

  /* ── 指南切換（D216）─────────────────────────────────────────
     商店有幾份指南就列幾份，在彈窗裡換著看。每一份的內容各自獨立，所以換之前先把
     現在畫面上的整份表單（含四制的尺碼欄與目前單位）收進 guideStore，換回來還在；
     沒看過的那一份依 store 的 content 畫。 */
  var guideStore = {};
  var curGuide = '';

  function buildPicker(guides, activeKey) {
    var row = modal.querySelector('[data-sg-picker]');
    var sel = modal.querySelector('[data-sg-picker-select]');
    guideStore = {};
    curGuide = '';
    if (!row || !sel) return;
    if (!guides || guides.length < 2) { row.hidden = true; sel.innerHTML = ''; return; }
    var S = store();
    curGuide = activeKey || guides[0];
    sel.innerHTML = guides.map(function (id) {
      var g = S && S.get(id);
      return '<option value="' + esc(id) + '">' + esc((S && g && S.labelOf(g)) || id) + '</option>';
    }).join('');
    sel.value = curGuide;
    row.hidden = false;
    /* 彈窗是後生成的，要自己叫 zselect 接手（enhance 有 ready 旗標，重複呼叫無害）；
       面板每次展開才依 <option> 現況重建，所以換過選項也不必特別 refresh。 */
    if (window.ztorSelect) window.ztorSelect.mount(modal);
  }

  function switchGuide(id) {
    if (!id || id === curGuide) return;
    guideStore[curGuide] = readForm();
    curGuide = id;
    renderForm(guideStore[id] || initialModel(id, false));
    var S = store(), g = S && S.get(id);
    var name = modal.querySelector('#sg-name');
    if (name && g) {
      if (g.nameKey) { name.setAttribute('data-i18n-value', g.nameKey); name.value = T(g.nameKey) || name.value; }
      else { name.removeAttribute('data-i18n-value'); name.value = g.name || ''; }
    }
    var sel = modal.querySelector('[data-sg-picker-select]');
    if (sel && sel.value !== id) sel.value = id;
  }


  /* ── 尺碼制分頁（D214）────────────────────────────────────────
     一列＝一個實體尺碼，四種標示法只是它的四個名字，所以每一制存一份「尺碼欄」，
     量測值那幾欄四制共用。切換分頁＝把現在畫面上的尺碼欄收進 sysLabels，
     再把目標那一制的填回去。分頁上的數字是「這一制還有幾格沒填」。 */
  var SYSTEMS = ['intl', 'us', 'eu', 'jp'];
  var sysLabels = {};
  var curSys = 'intl';

  function sizeCells() {
    var chart = modal.querySelector('[data-spec-chart]');
    if (!chart) return [];
    return [].slice.call(chart.querySelectorAll('.sce__cell--size'));
  }

  function stash() {
    sysLabels[curSys] = sizeCells().map(function (c) { return c.value; });
  }

  function restore(sys) {
    var vals = sysLabels[sys] || [];
    sizeCells().forEach(function (c, i) { c.value = vals[i] != null ? vals[i] : ''; });
  }

  function paintSysTabs() {
    var rows = sizeCells().length;
    [].forEach.call(modal.querySelectorAll('[data-spec-sys-tabs] [data-spec-system]'), function (tab) {
      var sys = tab.getAttribute('data-spec-system');
      var vals = sys === curSys ? sizeCells().map(function (c) { return c.value; }) : (sysLabels[sys] || []);
      var todo = 0;
      for (var i = 0; i < rows; i++) if (!vals[i] || !String(vals[i]).trim()) todo++;
      var badge = tab.querySelector('[data-spec-sys-todo]');
      if (!badge) return;
      badge.hidden = todo === 0;
      badge.textContent = todo ? String(todo) : '';
    });
  }

  function switchSystem(sys) {
    if (SYSTEMS.indexOf(sys) < 0 || sys === curSys) return;
    stash();
    curSys = sys;
    restore(sys);
    [].forEach.call(modal.querySelectorAll('[data-spec-sys-tabs] [data-spec-system]'), function (tab) {
      var on = tab.getAttribute('data-spec-system') === sys;
      tab.classList.toggle('tabs__item--active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    paintSysTabs();
  }

  /* 尺寸表的數值一律以公分存（cell.dataset.cm 是唯一真值），畫面依目前單位換算後顯示。
     不直接拿畫面上的數字乘來乘去——來回切換兩次就會因為四捨五入漂掉（55 → 21.7 → 55.1）。
     只動量測欄：尺碼欄是標示、身高體重參考是「155 – 165 cm」這種自由文字區間，換算會弄壞它。 */
  function chartCells() {
    var chart = modal.querySelector('[data-spec-chart]');
    if (!chart) return [];
    return [].filter.call(chart.querySelectorAll('.sce__cell'), function (c) {
      return !c.classList.contains('sce__cell--size');
    });
  }

  function trim(n) { return String(Math.round(n * 10) / 10); }

  function currentUnit() {
    var group = modal.querySelector('[data-spec-unit-group]');
    return (group && group.getAttribute('data-unit')) || 'cm';
  }

  /* 使用者打字時，把輸入值換回公分存進真值 */
  function syncCanonical(cell) {
    if (!isNum(cell.value)) { delete cell.dataset.cm; return; }
    var n = parseFloat(cell.value);
    cell.dataset.cm = String(currentUnit() === 'in' ? n * 2.54 : n);
  }

  function renderChart(unit) {
    chartCells().forEach(function (cell) {
      /* 只有純數字才換算；「22.0–24.0」這類區間字串、空格原樣留著 */
      if (!isNum(cell.value) && cell.dataset.cm == null) return;
      if (cell.dataset.cm == null) cell.dataset.cm = String(parseFloat(cell.value));
      var cm = parseFloat(cell.dataset.cm);
      cell.value = unit === 'in' ? trim(cm / 2.54) : trim(cm);
    });
  }

  /* 依目前欄數重寫 --sce-cols：首欄尺碼、中間量測欄均分、末欄列刪除鈕 */
  function syncCols(chart) {
    var measures = chart.querySelector('.sce__head').children.length - 2;
    chart.style.setProperty('--sce-cols', '112px ' + (measures > 0 ? 'repeat(' + measures + ', minmax(88px, 1fr)) ' : '') + '34px');
  }

  function bind() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && !modal.hidden) close();
    });
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });

    modal.addEventListener('click', function (e) {
      var t = e.target;

      var closeBtn = t.closest('[data-spec-close]');
      if (closeBtn) {
        if (closeBtn.hasAttribute('data-sg-save') && onSave) {
          var nameEl = modal.querySelector('#sg-name');
          onSave({ name: nameEl ? nameEl.value.trim() : '' });
        }
        close();
        return;
      }

      /* 尺碼制：這張表的分頁（D214）。四種標示法各自一份尺碼欄，量測值四制共用——
         國際／US／EU／JP 之間沒有換算公式（同一個 US 8 在不同品類與品牌對到的公分數
         並不一樣），所以只能逐制填；但同一件衣服不會因為換一種標法就變大，量測值共用。 */
      var tab = t.closest('[data-spec-system]');
      if (tab) {
        switchSystem(tab.getAttribute('data-spec-system'));
        return;
      }

      /* 量測單位：公分與英吋是絕對換算（1 inch = 2.54 cm），所以切換不是換一份資料、
         是換一種看法——直接把尺寸表的數值換過去，小數一位。空格與非數值原樣留著。 */
      var unit = t.closest('[data-spec-unit]');
      if (unit) {
        var group = unit.closest('[data-spec-unit-group]');
        var from = group.getAttribute('data-unit') || 'cm';
        var to = unit.getAttribute('data-spec-unit');
        [].forEach.call(group.querySelectorAll('.segmented__btn'), function (b) {
          b.classList.toggle('segmented__btn--active', b === unit);
        });
        if (from !== to) {
          group.setAttribute('data-unit', to);
          renderChart(to);
        }
        return;
      }

      /* 尺寸表：加一列尺碼（沿用該表目前的欄數） */
      var addRow = t.closest('[data-spec-addrow]');
      if (addRow) {
        var chart = addRow.closest('.sce').querySelector('.sce__table');
        var last = chart.querySelector('.sce__row:last-of-type');
        var fresh = last.cloneNode(true);
        [].forEach.call(fresh.querySelectorAll('input'), function (i) { i.value = ''; delete i.dataset.cm; });
        if (chart.hasAttribute('data-spec-chart')) SYSTEMS.forEach(function (sys) { if (sysLabels[sys]) sysLabels[sys].push(''); });
        last.after(fresh);
        if (window.ztorIcons) window.ztorIcons.applyIcons(fresh);
        paintSysTabs();
        fresh.querySelector('input').focus();
        return;
      }

      var rmRow = t.closest('[data-spec-rowrm]');
      if (rmRow) {
        var rchart = rmRow.closest('.sce__table');
        if (rchart.querySelectorAll('.sce__row').length > 1) {
          var idx = [].slice.call(rchart.querySelectorAll('.sce__row')).indexOf(rmRow.closest('.sce__row'));
          rmRow.closest('.sce__row').remove();
          /* 其他三制存的是「第幾列」，刪了一列就要把它們的那一格也拿掉，否則對不回去（身高體重那張表不在四制內） */
          if (rchart.hasAttribute('data-spec-chart')) {
            SYSTEMS.forEach(function (sys) { if (sysLabels[sys]) sysLabels[sys].splice(idx, 1); });
            paintSysTabs();
          }
        }
        return;
      }

      /* 尺寸表：加一個量測欄。欄定義只住在 --sce-cols 這一個變數上，
         所以增減欄＝改這個變數＋每列補一格，不必動 CSS。 */
      var addCol = t.closest('[data-spec-addcol]');
      if (addCol) {
        var cchart = addCol.closest('.sce').querySelector('.sce__table');
        var head = cchart.querySelector('.sce__head');
        var col = document.createElement('div');
        col.className = 'sce__col';
        col.innerHTML = '<input class="input sce__col-input" type="text" placeholder="—" aria-label="Measurement name">'
          + '<button class="sce__col-remove" type="button" data-spec-colrm><i data-lucide="x" class="ztor-icon"></i></button>';
        head.insertBefore(col, head.lastElementChild);
        [].forEach.call(cchart.querySelectorAll('.sce__row'), function (r) {
          var cell = document.createElement('input');
          cell.className = 'input sce__cell';
          cell.type = 'text';
          cell.inputMode = 'decimal';
          cell.setAttribute('aria-label', 'Measurement');
          r.insertBefore(cell, r.lastElementChild);
        });
        syncCols(cchart);
        if (window.ztorIcons) window.ztorIcons.applyIcons(head);
        col.querySelector('input').focus();
        return;
      }

      var rmCol = t.closest('[data-spec-colrm]');
      if (rmCol) {
        var mchart = rmCol.closest('.sce__table');
        var mhead = mchart.querySelector('.sce__head');
        var cols = [].slice.call(mhead.children);
        var idx = cols.indexOf(rmCol.closest('.sce__col'));
        if (cols.length <= 3) return;            /* 尺碼欄＋至少一個量測欄＋末欄 */
        cols[idx].remove();
        [].forEach.call(mchart.querySelectorAll('.sce__row'), function (r) {
          if (r.children[idx]) r.children[idx].remove();
        });
        syncCols(mchart);
        return;
      }

      /* 量測方式：逐部位增刪 */
      var addHowto = t.closest('[data-spec-addhowto]');
      if (addHowto) {
        var host = modal.querySelector('[data-spec-howto]');
        var row = host.lastElementChild.cloneNode(true);
        [].forEach.call(row.querySelectorAll('input'), function (i) { i.value = ''; });
        host.appendChild(row);
        if (window.ztorIcons) window.ztorIcons.applyIcons(row);
        if (window.applyI18n) window.applyI18n(row);
        row.querySelector('input').focus();
        return;
      }

      var rmHowto = t.closest('[data-spec-howtorm]');
      if (rmHowto) {
        var hhost = modal.querySelector('[data-spec-howto]');
        if (hhost.children.length > 1) rmHowto.closest('.spec-row').remove();
      }
    });

    /* 指南切換（D216，2026-08-21 改成下拉）：原生 select 的 change——zselect 選完之後
       也會派這個事件，所以兩種操作路徑（鍵盤／滑鼠、原生／自訂面板）共用同一段。 */
    modal.addEventListener('change', function (e) {
      var sel = e.target.closest('[data-sg-picker-select]');
      if (sel) switchGuide(sel.value);
    });

    /* 量測值改動時把真值（公分）跟著更新，之後切換單位才換得對；
       尺碼欄改動時重畫分頁上的待填數。 */
    modal.addEventListener('input', function (e) {
      var cell = e.target.closest('.sce__cell');
      if (!cell || !cell.closest('[data-spec-chart]')) return;
      if (cell.classList.contains('sce__cell--size')) { paintSysTabs(); return; }
      syncCanonical(cell);
    });

    /* 表頭欄名改動時同步該欄所有格子的 aria-label（i18n 是純靜態 key→字串、
       沒有插值機制，帶使用者自訂欄名只能靠 JS 拼） */
    modal.addEventListener('input', function (e) {
      var nameInput = e.target.closest('.sce__col-input');
      if (!nameInput) return;
      var head = nameInput.closest('.sce__head');
      var idx = [].slice.call(head.children).indexOf(nameInput.closest('.sce__col'));
      var label = nameInput.value.trim();
      [].forEach.call(nameInput.closest('.sce__table').querySelectorAll('.sce__row'), function (r) {
        if (r.children[idx]) r.children[idx].setAttribute('aria-label', label || 'Measurement');
      });
    });
  }

  window.ztorSizeGuide = { open: open, close: close };
})();
