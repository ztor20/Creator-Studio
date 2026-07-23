window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* Single source of truth for the request-payout modal markup.
   Loaded as a <script> on earnings.html (always available, file:// safe).
   UI chrome is bound via data-i18n / data-i18n-aria-label; bank names and
   amounts are sample DATA and stay literal (set at runtime from data-* attrs). */
window.ZTOR_PARTIALS.payoutRequestModal = String.raw`
<!-- Request payout popup · spec §5.1.8.1 -->
<div class="payout-modal" data-payout-modal hidden>
  <section class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="payout-dialog-title">
    <div class="payout-view" data-payout-view="request">
      <div class="payout-dialog__head">
        <div>
          <h2 class="payout-dialog__title" id="payout-dialog-title" data-i18n="btn.request-payout">Request payout</h2>
          <p class="text-sub" style="margin:6px 0 0;font-size:13px" data-i18n="payout.request.sub">Choose a bank, enter an amount, then submit the request.</p>
        </div>
        <button class="btn btn--icon" type="button" aria-label="Close payout popup" data-i18n-aria-label="payout.close" data-payout-close><i data-lucide="x" class="ztor-icon"></i></button>
      </div>
      <div class="payout-dialog__body">
        <div class="field">
          <div class="field__label" data-i18n="payout.bank-label">Payout bank</div>
          <div class="payout-selected-bank">
            <span class="payout-bank-card__icon"><i data-lucide="landmark" class="ztor-icon"></i></span>
            <span class="payout-selected-bank__main">
              <span class="payout-selected-bank__title" data-payout-selected-title>First Commercial Bank · •••3417</span>
              <span class="payout-selected-bank__meta" data-payout-selected-meta>Maya Chou · USD · default · available</span>
            </span>
            <span class="badge badge--success"><span class="badge__dot"></span><span data-i18n="payout.selected">Selected</span></span>
          </div>
          <div class="payout-bank-options" aria-label="Available payout banks">
            <button class="payout-bank-option is-active" type="button" data-bank-option data-bank-title="First Commercial Bank · •••3417" data-bank-meta="Maya Chou · USD · default · available">
              <span class="payout-bank-card__icon"><i data-lucide="landmark" class="ztor-icon"></i></span>
              <span class="payout-bank-option__main">
                <span class="payout-bank-option__title">First Commercial Bank · •••3417</span>
                <span class="payout-bank-option__meta">Maya Chou · USD · default · available</span>
              </span>
            </button>
            <button class="payout-bank-option" type="button" data-bank-option data-bank-title="Wise transfer · USD → EUR" data-bank-meta="Maya Chou · EUR · verified">
              <span class="payout-bank-card__icon"><i data-lucide="landmark" class="ztor-icon"></i></span>
              <span class="payout-bank-option__main">
                <span class="payout-bank-option__title">Wise transfer · USD → EUR</span>
                <span class="payout-bank-option__meta">Maya Chou · EUR · verified</span>
              </span>
            </button>
            <button class="payout-bank-option" type="button" data-payout-add-inline>
              <span class="payout-bank-card__icon"><i data-lucide="plus" class="ztor-icon"></i></span>
              <span class="payout-bank-option__main">
                <span class="payout-bank-option__title" data-i18n="payout.add-bank-title">Add new bank</span>
                <span class="payout-bank-option__meta" data-i18n="payout.add-bank-meta">Add another bank, then return here with it selected.</span>
              </span>
            </button>
          </div>
        </div>

        <div class="field mt-24">
          <div class="field__label" data-i18n="payout.amount-label">Payout amount</div>
          <span class="amount-field amount-field--hero">
            <span class="amount-field__unit"><span class="amount-field__sym">$</span></span>
            <input class="input amount-field__input" type="text" inputmode="decimal" value="8,940" data-payout-amount>
          </span>
          <div class="field__hint" data-i18n="payout.amount-hint">Available balance: $8,940.00 · Minimum payout: $50.00</div>
        </div>

        <div class="payout-summary" aria-label="Payout summary" data-i18n-aria-label="payout.summary">
          <div class="payout-summary__row"><span data-i18n="payout.summary.to">Transfer to</span><strong data-payout-summary-bank>First Commercial Bank · •••3417</strong></div>
          <div class="payout-summary__row"><span data-i18n="payout.summary.amount">Request amount</span><strong data-payout-summary-amount>$8,940.00</strong></div>
          <div class="payout-summary__row"><span data-i18n="payout.summary.fee">Transfer fee</span><strong>$2.50</strong></div>
          <div class="payout-summary__row"><span data-i18n="payout.summary.deposit">Estimated deposit</span><strong>$8,937.50</strong></div>
          <div class="payout-summary__row"><span data-i18n="payout.summary.fx">FX rate</span><strong>1.00</strong></div>
          <div class="payout-summary__row"><span data-i18n="payout.summary.eta">ETA</span><strong>Nov 27 · T+3</strong></div>
          <div class="payout-summary__row"><span data-i18n="payout.summary.settled">Settled sources</span><strong>12 settled events · §7.3</strong></div>
          <div class="payout-summary__row"><span data-i18n="payout.summary.cfgver">Rate version</span><strong>cfg-2026.02</strong></div>
        </div>

        <label class="payout-confirm">
          <input type="checkbox" class="payout-confirm__box" data-payout-confirm>
          <span class="payout-confirm__text" data-i18n="payout.confirm">I confirm the amount and details above, and understand a payout request is irreversible.</span>
        </label>
      </div>
      <div class="payout-dialog__foot">
        <button class="btn btn--ghost" type="button" data-payout-close data-i18n="payout.cancel">Cancel</button>
        <button class="btn btn--primary" type="button" data-payout-submit disabled>Request payout · $8,940</button>
      </div>
    </div>

    <div class="payout-view" data-payout-view="add" hidden>
      <div class="payout-dialog__head">
        <div>
          <h2 class="payout-dialog__title" data-i18n="payout.add.title">Add payout bank</h2>
          <p class="text-sub" style="margin:6px 0 0;font-size:13px" data-i18n="payout.add.sub">Add a bank account for this payout request.</p>
        </div>
        <button class="btn btn--icon" type="button" aria-label="Close payout popup" data-i18n-aria-label="payout.close" data-payout-close><i data-lucide="x" class="ztor-icon"></i></button>
      </div>
      <div class="payout-dialog__body">
        <div class="form-grid">
          <div class="field">
            <div class="field__label" data-i18n="payout.field.holder">Account holder name</div>
            <input class="input" value="Maya Chou">
          </div>
          <div class="field">
            <div class="field__label" data-i18n="payout.field.bank">Bank name</div>
            <input class="input" value="Mega International Commercial Bank">
          </div>
          <div class="field">
            <div class="field__label" data-i18n="payout.field.swift">SWIFT / BIC ID</div>
            <input class="input" value="ICBCTWTP">
            <div class="field__hint" data-i18n="payout.field.swift-hint">Usually 8 to 11 characters. Confirm this with your bank.</div>
          </div>
          <div class="field">
            <div class="field__label" data-i18n="payout.field.account">Bank account number</div>
            <input class="input" value="009221449001">
          </div>
          <div class="field">
            <div class="field__label" data-i18n="payout.field.account-confirm">Confirm account number</div>
            <input class="input" value="009221449001">
          </div>
          <div class="control-row" style="grid-column:1/-1">
            <div>
              <div class="control-row__main" data-i18n="payout.field.default">Set as default account</div>
              <div class="control-row__sub" data-i18n="payout.field.default-hint">Future payout requests will use this account first.</div>
            </div>
            <div class="switch switch--on" role="switch" aria-checked="true"></div>
          </div>
        </div>
      </div>
      <div class="payout-dialog__foot">
        <button class="btn btn--ghost" type="button" data-payout-back data-i18n="payout.back">Back</button>
        <button class="btn btn--primary" type="button" data-payout-add-submit data-i18n="payout.add-submit">Add bank</button>
      </div>
    </div>

    <div class="payout-view" data-payout-view="result" hidden>
      <div class="payout-dialog__head">
        <div>
          <h2 class="payout-dialog__title" data-i18n="payout.result.title">Payout requested</h2>
          <p class="text-sub" style="margin:6px 0 0;font-size:13px" data-i18n="payout.result.sub">The request is now visible in payout history.</p>
        </div>
        <button class="btn btn--icon" type="button" aria-label="Close payout popup" data-i18n-aria-label="payout.close" data-payout-close><i data-lucide="x" class="ztor-icon"></i></button>
      </div>
      <div class="payout-dialog__body">
        <div class="payout-result">
          <span class="payout-result__icon"><i data-lucide="check" class="ztor-icon"></i></span>
          <div>
            <h3 class="card__title" style="margin:0" data-i18n="payout.result.heading">Request sent</h3>
            <p class="text-sub" style="margin:8px auto 0;max-width:360px;font-size:13px" data-i18n="payout.result.body">Estimated arrival is Nov 27. Available balance is reduced while the request is processing.</p>
          </div>
        </div>
      </div>
      <div class="payout-dialog__foot">
        <button class="btn btn--primary" type="button" data-payout-close data-i18n="payout.result.back">Back to payouts</button>
      </div>
    </div>
  </section>
</div>
`;
