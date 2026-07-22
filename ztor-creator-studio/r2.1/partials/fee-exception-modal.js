window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* 費率例外編輯彈窗 · spec 5.1.0.3 F3 / D141（逐 Creator 覆寫、逐葉粒度）。
   復用共用對話框殼（payout-modal.css：.payout-modal / .payout-dialog / __head/__title/__body）。
   本檔只給 template 字串，由 admin-platform-fees.html 注入 [data-fee-exc-modal-host] 並接開關/搜尋/儲存。
   兩種模式共用同一殼：
   - add：顯示 Creator 搜尋（data-fx-creator-field），標題＝新增費率例外。
   - edit：Creator 固定（藏搜尋），標題＝費率例外 · <Creator 名>。
   支付手續費一律唯讀顯示（全站統一、不逐 Creator，D141）；平台費樹由頁面 clone #fee-tree 注入 [data-fx-tree]。 */
window.ZTOR_PARTIALS.feeExceptionModal = String.raw`
<!-- 費率例外彈窗 · spec 5.1.0.3 F3 / D141 -->
<div class="payout-modal" data-fx-modal hidden>
  <section class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="fx-title">
    <div class="payout-dialog__head">
      <h2 class="payout-dialog__title" id="fx-title" data-fx-title data-i18n="fees.exc.modal-add">Add rate exception</h2>
      <button class="btn btn--icon" type="button" aria-label="Close" data-i18n-aria-label="fees.exc.cancel" data-fx-close><i data-lucide="x" class="ztor-icon"></i></button>
    </div>

    <div class="payout-dialog__body">

      <!-- 選擇創作者（僅 add 模式顯示）：field-pill 搜尋、打字才列出結果，不預設列出全部 -->
      <label class="field" data-fx-creator-field style="margin-bottom:var(--sp-18)">
        <span class="field__label" style="font-size:var(--fs-18);font-weight:var(--fw-semibold)" data-i18n="fees.exc.creator">Select creator</span>
        <span class="field-pill" style="width:100%;margin-top:var(--sp-8)">
          <i data-lucide="search" class="ztor-icon field-pill__icon"></i>
          <input class="field-pill__input" type="search" data-fx-search autocomplete="off" data-i18n-placeholder="fees.exc.search" placeholder="Search a Creator by name…">
        </span>
        <div data-fx-suggest style="margin-top:var(--sp-8);display:flex;flex-direction:column;gap:var(--sp-8)"></div>
        <p class="field__hint" data-fx-none hidden data-i18n="fees.exc.search-none">No matching Creator.</p>
      </label>

      <!-- 支付手續費：唯讀、全站統一（不逐 Creator，D141）-->
      <div class="field" style="margin-bottom:var(--sp-18)">
        <span class="field__label" style="font-size:var(--fs-18);font-weight:var(--fw-semibold)" data-i18n="fees.payment.title">Payment fee</span>
        <div style="display:flex;align-items:center;gap:var(--sp-8);flex-wrap:wrap">
          <span class="amount-field amount-field--suffix" style="width:110px"><input class="input amount-field__input" data-fx-payment type="number" value="3.4" disabled><span class="amount-field__unit">%</span></span>
          <span class="text-sub" aria-hidden="true">＋</span>
          <span class="amount-field amount-field--readonly" style="width:132px"><span class="amount-field__unit" data-fee-cur>HK$</span><input class="input amount-field__input" data-fx-payment-fixed type="number" value="2.40" style="padding-left:48px" disabled></span>
        </div>
      </div>

      <!-- 平台費：逐交易子類覆寫（樹由頁面注入）-->
      <div class="field">
        <span class="field__label" style="font-size:var(--fs-18);font-weight:var(--fw-semibold)" data-i18n="fees.tree.title">Platform fee</span>
        <p class="text-sub" style="margin:var(--sp-4) 0 var(--sp-8)" data-i18n="fees.exc.editor-hint">Blank inherits the default; enter a value to override just that transaction type.</p>
        <div data-fx-tree></div>
      </div>

    </div>

    <div class="payout-dialog__foot" style="display:flex;gap:var(--sp-8);justify-content:flex-end;padding:var(--sp-16) var(--sp-24) var(--sp-24)">
      <button class="btn btn--ghost" type="button" data-fx-close data-i18n="fees.exc.cancel">Cancel</button>
      <button class="btn btn--primary" type="button" data-fx-save data-i18n="fees.exc.save">Save exception</button>
    </div>
  </section>
</div>
`;
