// partials/size-guide-modal.js — 尺寸指南編輯器（規格 5.1.5.5 F7.2 / D171、D211）
//
// 兩個地方在編同一張表，所以編輯器住在這裡、不住在任何一頁：
//   商店設定 · 尺寸指南設定（store-settings.html）＝這間店的尺寸指南，建了就出現在所有商品上；
//   建立商品 · 商品資訊（create-product.html）＝這件商品專屬的一份，設了就蓋掉商店那幾份。
// 欄位定義同一套（尺碼制／量測單位／尺寸表／版型建議／身高體重／量測方式／免責），
// 差別只有「要不要問名字」——商品專屬那份沒有名字（它只屬於那一件商品）。
//
// 用法：
//   window.ztorSizeGuide.open({
//     titleKey: 'store-settings.specs.new',   // 彈窗標題的 i18n key
//     showName: true,                         // 商品專屬指南傳 false（不問名字）
//     name: '衣服', nameKey: 'store-settings.specs.row.tops',  // 帶入名稱（可省）
//     blank: false,                           // true＝清空示範值（新增）
//     onSave: (data) => {}                    // 按「儲存」時呼叫，data = { name }
//   })
//
// 全前端 demo：不落地、不上傳；關閉即丟。示範值與 demo 手法見 ASSUMPTIONS UIA-106。
(function () {
  var MARKUP = '<div class="payout-modal" id="sg-modal" hidden>\n' +
    '  <section class="payout-dialog payout-dialog--wide" role="dialog" aria-modal="true" aria-labelledby="sg-modal-title">\n' +
    '    <div class="payout-dialog__head">\n' +
    '      <h2 class="payout-dialog__title" id="sg-modal-title" data-i18n="store-settings.specs.new">Add size guide</h2>\n' +
    '      <button class="btn btn--icon" type="button" data-spec-close aria-label="Close" data-i18n-aria-label="store-settings.specs.close"><i data-lucide="x" class="ztor-icon"></i></button>\n' +
    '    </div>\n' +
    '    <div class="payout-dialog__body">\n' +
    '            <div class="field" data-sg-namefield>\n' +
    '              <label class="field__label" for="sg-name"><span data-i18n="store-settings.specs.f.name">Name</span> <span class="field__req">*</span></label>\n' +
    '              <input class="input" id="sg-name" type="text" value="Tops" data-i18n-value="store-settings.specs.row.tops" placeholder="e.g. Tops" data-i18n-placeholder="store-settings.specs.f.name.ph">\n' +
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
    '                <div class="sce__table" data-spec-chart>\n' +
    '                  <div class="sce__head">\n' +
    '                    <div class="sce__col"><span class="sce__col-label" data-i18n="store-settings.specs.chart.size">Size</span></div>\n' +
    '                    <div class="sce__col">\n' +
    '                      <input class="input sce__col-input" type="text" value="Chest width" aria-label="Measurement name" data-i18n-aria-label="store-settings.specs.chart.colname">\n' +
    '                      <button class="sce__col-remove" type="button" data-spec-colrm><i data-lucide="x" class="ztor-icon"></i></button>\n' +
    '                    </div>\n' +
    '                    <div class="sce__col">\n' +
    '                      <input class="input sce__col-input" type="text" value="Length" aria-label="Measurement name" data-i18n-aria-label="store-settings.specs.chart.colname">\n' +
    '                      <button class="sce__col-remove" type="button" data-spec-colrm><i data-lucide="x" class="ztor-icon"></i></button>\n' +
    '                    </div>\n' +
    '                    <div class="sce__col">\n' +
    '                      <input class="input sce__col-input" type="text" value="Sleeve" aria-label="Measurement name" data-i18n-aria-label="store-settings.specs.chart.colname">\n' +
    '                      <button class="sce__col-remove" type="button" data-spec-colrm><i data-lucide="x" class="ztor-icon"></i></button>\n' +
    '                    </div>\n' +
    '                    <div></div>\n' +
    '                  </div>\n' +
    '                  <div class="sce__row">\n' +
    '                    <input class="input sce__cell sce__cell--size" type="text" value="S" aria-label="Size" data-i18n-aria-label="store-settings.specs.chart.size">\n' +
    '                    <input class="input sce__cell" type="text" inputmode="decimal" value="55" aria-label="Measurement" data-i18n-aria-label="store-settings.specs.chart.value">\n' +
    '                    <input class="input sce__cell" type="text" inputmode="decimal" value="66" aria-label="Measurement" data-i18n-aria-label="store-settings.specs.chart.value">\n' +
    '                    <input class="input sce__cell" type="text" inputmode="decimal" value="60" aria-label="Measurement" data-i18n-aria-label="store-settings.specs.chart.value">\n' +
    '                    <button class="sce__row-remove" type="button" data-spec-rowrm><i data-lucide="trash-2" class="ztor-icon"></i></button>\n' +
    '                  </div>\n' +
    '                  <div class="sce__row">\n' +
    '                    <input class="input sce__cell sce__cell--size" type="text" value="M" aria-label="Size" data-i18n-aria-label="store-settings.specs.chart.size">\n' +
    '                    <input class="input sce__cell" type="text" inputmode="decimal" value="58" aria-label="Measurement" data-i18n-aria-label="store-settings.specs.chart.value">\n' +
    '                    <input class="input sce__cell" type="text" inputmode="decimal" value="68" aria-label="Measurement" data-i18n-aria-label="store-settings.specs.chart.value">\n' +
    '                    <input class="input sce__cell" type="text" inputmode="decimal" value="62" aria-label="Measurement" data-i18n-aria-label="store-settings.specs.chart.value">\n' +
    '                    <button class="sce__row-remove" type="button" data-spec-rowrm><i data-lucide="trash-2" class="ztor-icon"></i></button>\n' +
    '                  </div>\n' +
    '                  <div class="sce__row">\n' +
    '                    <input class="input sce__cell sce__cell--size" type="text" value="L" aria-label="Size" data-i18n-aria-label="store-settings.specs.chart.size">\n' +
    '                    <input class="input sce__cell" type="text" inputmode="decimal" value="61" aria-label="Measurement" data-i18n-aria-label="store-settings.specs.chart.value">\n' +
    '                    <input class="input sce__cell" type="text" inputmode="decimal" value="70" aria-label="Measurement" data-i18n-aria-label="store-settings.specs.chart.value">\n' +
    '                    <input class="input sce__cell" type="text" inputmode="decimal" value="64" aria-label="Measurement" data-i18n-aria-label="store-settings.specs.chart.value">\n' +
    '                    <button class="sce__row-remove" type="button" data-spec-rowrm><i data-lucide="trash-2" class="ztor-icon"></i></button>\n' +
    '                  </div>\n' +
    '                </div>\n' +
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
    '            <textarea class="textarea" id="sg-fit" style="min-height:78px" placeholder="e.g. Regular fit. Size up if you layer a hoodie underneath. Model is 180 cm / 72 kg, wearing L." data-i18n-placeholder="store-settings.specs.f.fit.ph">Regular fit. Size up if you layer a hoodie underneath. Model is 180 cm / 72 kg, wearing L.</textarea>\n' +
    '          </div>\n' +
    '\n' +
    '          <!-- 身高體重參考：同一支 .sce，欄固定兩欄、表頭不給刪除鈕 -->\n' +
    '          <div class="sce-block">\n' +
    '            <div class="settings-row__label" data-i18n="store-settings.specs.f.body">Height &amp; weight guide</div>\n' +
    '            <div class="settings-row__hint" style="margin-bottom:var(--sp-8)" data-i18n="store-settings.specs.f.body.hint">Optional. Helps fans who can\'t measure a garment they don\'t own yet.</div>\n' +
    '            <div class="sce">\n' +
    '              <div class="sce__wrap">\n' +
    '                <div class="sce__table" style="--sce-cols: 112px minmax(120px, 1fr) minmax(120px, 1fr) 34px">\n' +
    '                  <div class="sce__head">\n' +
    '                    <div class="sce__col"><span class="sce__col-label" data-i18n="store-settings.specs.chart.size">Size</span></div>\n' +
    '                    <div class="sce__col"><span class="sce__col-label" data-i18n="store-settings.specs.body.height">Height</span></div>\n' +
    '                    <div class="sce__col"><span class="sce__col-label" data-i18n="store-settings.specs.body.weight">Weight</span></div>\n' +
    '                    <div></div>\n' +
    '                  </div>\n' +
    '                  <div class="sce__row">\n' +
    '                    <input class="input sce__cell sce__cell--size" type="text" value="S" aria-label="Size" data-i18n-aria-label="store-settings.specs.chart.size">\n' +
    '                    <input class="input sce__cell" type="text" value="155 – 165 cm" aria-label="Height" data-i18n-aria-label="store-settings.specs.body.height">\n' +
    '                    <input class="input sce__cell" type="text" value="45 – 55 kg" aria-label="Weight" data-i18n-aria-label="store-settings.specs.body.weight">\n' +
    '                    <button class="sce__row-remove" type="button" data-spec-rowrm><i data-lucide="trash-2" class="ztor-icon"></i></button>\n' +
    '                  </div>\n' +
    '                  <div class="sce__row">\n' +
    '                    <input class="input sce__cell sce__cell--size" type="text" value="M" aria-label="Size" data-i18n-aria-label="store-settings.specs.chart.size">\n' +
    '                    <input class="input sce__cell" type="text" value="163 – 173 cm" aria-label="Height" data-i18n-aria-label="store-settings.specs.body.height">\n' +
    '                    <input class="input sce__cell" type="text" value="53 – 65 kg" aria-label="Weight" data-i18n-aria-label="store-settings.specs.body.weight">\n' +
    '                    <button class="sce__row-remove" type="button" data-spec-rowrm><i data-lucide="trash-2" class="ztor-icon"></i></button>\n' +
    '                  </div>\n' +
    '                </div>\n' +
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
    '            <div data-spec-howto>\n' +
    '              <div class="spec-row">\n' +
    '                <input class="input" type="text" value="Chest" aria-label="Body part" data-i18n-aria-label="store-settings.specs.howto.part">\n' +
    '                <input class="input" type="text" value="Around the fullest part, tape flat, not pulled tight." aria-label="How to measure it" data-i18n-aria-label="store-settings.specs.howto.body">\n' +
    '                <button class="btn btn--icon btn--sm" type="button" data-spec-howtorm aria-label="Remove" data-i18n-aria-label="store-settings.specs.howto.remove"><i data-lucide="trash-2" class="ztor-icon"></i></button>\n' +
    '              </div>\n' +
    '              <div class="spec-row">\n' +
    '                <input class="input" type="text" value="Waist" aria-label="Body part" data-i18n-aria-label="store-settings.specs.howto.part">\n' +
    '                <input class="input" type="text" value="Around the narrowest part, just above the navel." aria-label="How to measure it" data-i18n-aria-label="store-settings.specs.howto.body">\n' +
    '                <button class="btn btn--icon btn--sm" type="button" data-spec-howtorm aria-label="Remove" data-i18n-aria-label="store-settings.specs.howto.remove"><i data-lucide="trash-2" class="ztor-icon"></i></button>\n' +
    '              </div>\n' +
    '            </div>\n' +
    '            <button class="sce__add" type="button" style="margin-top:var(--sp-8)" data-spec-addhowto><i data-lucide="plus" class="ztor-icon"></i><span data-i18n="store-settings.specs.howto.add">Add body part</span></button>\n' +
    '          </div>\n' +
    '\n' +
    '          <div class="sce-block">\n' +
    '            <label class="settings-row__label" for="sg-note" data-i18n="store-settings.specs.f.note">Disclaimer</label>\n' +
    '            <div class="settings-row__hint" style="margin-bottom:var(--sp-8)" data-i18n="store-settings.specs.f.note.hint">Shown under the chart. Sets expectations before a return request.</div>\n' +
    '            <textarea class="textarea" id="sg-note" style="min-height:56px" placeholder="e.g. Measured flat in cm. Fabric may vary by 1–2 cm." data-i18n-placeholder="store-settings.specs.f.note.ph">Measured flat in cm. Fabric may vary by 1–2 cm.</textarea>\n' +
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

  function ensure() {
    if (modal) return modal;
    var host = document.createElement('div');
    host.innerHTML = MARKUP;
    modal = host.firstElementChild;
    document.body.appendChild(modal);
    bind();
    if (window.ztorIcons) window.ztorIcons.applyIcons(modal);
    if (window.applyI18n) window.applyI18n(modal);
    /* 示範值只採一次：之後的「新增」清空、「編輯」填回這一份 */
    seedValues = [].map.call(modal.querySelectorAll('input, textarea'), function (i) { return i.value; });
    return modal;
  }

  var seedValues = [];
  var onSave = null;

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

    if (opts.blank) clearValues(); else fillValues();
    resetSystems(!!opts.blank);

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

  /* 編輯＝把示範值填回去；沒有這一步的話「新增過一次之後再點編輯」會看到空白表單 */
  function fillValues() {
    [].forEach.call(modal.querySelectorAll('input, textarea'), function (i, n) {
      if (n < seedValues.length) i.value = seedValues[n];
    });
  }

  /* 新增＝清掉示範值，量測欄名保留（那是欄位定義、不是資料） */
  function clearValues() {
    [].forEach.call(modal.querySelectorAll('.sce__cell, .spec-row .input, #sg-name, #sg-fit, #sg-note'), function (i) { i.value = ''; });
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

  /* 開啟彈窗時重置成第一個分頁：示範值是國際制，其餘三制留空等創作者填 */
  function resetSystems(blank) {
    sysLabels = {};
    curSys = 'intl';
    [].forEach.call(modal.querySelectorAll('[data-spec-sys-tabs] [data-spec-system]'), function (tab) {
      var on = tab.getAttribute('data-spec-system') === 'intl';
      tab.classList.toggle('tabs__item--active', on);
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (blank) sizeCells().forEach(function (c) { c.value = ''; });
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
    var n = parseFloat(cell.value);
    if (isNaN(n)) { delete cell.dataset.cm; return; }
    cell.dataset.cm = String(currentUnit() === 'in' ? n * 2.54 : n);
  }

  function renderChart(unit) {
    chartCells().forEach(function (cell) {
      if (cell.dataset.cm == null) {
        var n0 = parseFloat(cell.value);
        if (isNaN(n0)) return;
        /* 還沒有真值的格子＝載入時的示範值，當時的單位一定是公分（預設） */
        cell.dataset.cm = String(n0);
      }
      var cm = parseFloat(cell.dataset.cm);
      cell.value = unit === 'in' ? trim(cm / 2.54) : trim(cm);
    });
  }

  /* 依目前欄數重寫 --sce-cols：首欄尺碼、中間量測欄均分、末欄列刪除鈕 */
  function syncCols(chart) {
    var measures = chart.querySelector('.sce__head').children.length - 2;
    chart.style.setProperty('--sce-cols', '112px repeat(' + measures + ', minmax(88px, 1fr)) 34px');
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
        [].forEach.call(fresh.querySelectorAll('input'), function (i) { i.value = ''; });
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
          /* 其他三制存的是「第幾列」，刪了一列就要把它們的那一格也拿掉，否則對不回去 */
          SYSTEMS.forEach(function (sys) { if (sysLabels[sys]) sysLabels[sys].splice(idx, 1); });
          paintSysTabs();
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
