window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* Manual-entry modal markup · spec §5.1.8.2 (Earnings · F10).
   Loaded as a <script> on earnings.html (always available, file:// safe).
   Reuses the canonical dialog shell (.payout-modal / .payout-dialog) plus the
   shared form helpers — no manual-entry-specific CSS. UI chrome is bound via
   data-i18n; sample values stay literal. */
window.ZTOR_PARTIALS.manualEntryModal = String.raw`
<!-- Manual entry popup · spec §5.1.8.2 -->
<div class="payout-modal" data-manual-modal hidden>
  <section class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="manual-dialog-title">
    <div class="payout-dialog__head">
      <div>
        <h2 class="payout-dialog__title" id="manual-dialog-title" data-i18n="manual.title">Manual entry</h2>
        <p class="text-sub" style="margin:6px 0 0;font-size:13px" data-i18n="manual.sub">Log income earned outside Ztor or not yet synced. It stays marked unverified.</p>
      </div>
      <button class="btn btn--icon" type="button" aria-label="Close manual entry" data-i18n-aria-label="manual.close" data-manual-close><i data-lucide="x" class="ztor-icon"></i></button>
    </div>
    <div class="payout-dialog__body">
      <div class="form-grid">
        <label class="field">
          <span class="field__label" data-i18n="manual.f.item">Transaction item</span>
          <input class="input" placeholder="Neon Tide · live show merch">
        </label>
        <label class="field">
          <span class="field__label" data-i18n="manual.f.category">Revenue category</span>
          <select class="select">
            <option data-i18n="src.eshop">E-Shop sales</option>
            <option data-i18n="src.events">Event tickets</option>
            <option data-i18n="src.ip">IP royalties</option>
            <option data-i18n="src.licensing">Licensing</option>
            <option data-i18n="src.streaming">Platform / streaming</option>
          </select>
        </label>
        <label class="field">
          <span class="field__label" data-i18n="manual.f.date">Date</span>
          <input class="input" type="date" value="2026-06-14">
        </label>
        <label class="field">
          <span class="field__label" data-i18n="manual.f.amount">Amount</span>
          <input class="input" inputmode="decimal" placeholder="0.00">
        </label>
        <label class="field">
          <span class="field__label" data-i18n="manual.f.currency">Currency</span>
          <select class="select"><option>USD</option><option>TWD</option><option>EUR</option><option>JPY</option></select>
        </label>
        <label class="field">
          <span class="field__label" data-i18n="manual.f.note">Note (optional)</span>
          <input class="input" placeholder="—">
        </label>
      </div>

      <div class="control-row">
        <div>
          <div class="control-row__main" data-i18n="manual.f.attachment">Supporting attachment (optional)</div>
          <div class="control-row__sub" data-i18n="manual.f.attachment-hint">Receipt, statement, or contract as evidence.</div>
        </div>
        <button class="btn btn--outline btn--sm" type="button" data-i18n="manual.attach-btn">Add file</button>
      </div>

      <div class="stickynote mt-16">
        <span class="stickynote__mark">!</span>
        <span data-i18n="manual.note"><strong>Marked unverified.</strong> Manual income never counts toward Available, payouts, or tax documents — at most it shows in display stats (§7.3).</span>
      </div>
    </div>
    <div class="payout-dialog__foot">
      <button class="btn btn--ghost" type="button" data-manual-close data-i18n="payout.cancel">Cancel</button>
      <button class="btn btn--primary" type="button" data-manual-submit data-i18n="manual.submit">Add entry</button>
    </div>
  </section>
</div>
`;
