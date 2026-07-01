window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* Restock modal markup · spec §5.1.5.6 (E-Shop · Restock sub-flow).
   Loaded as a <script> on e-shop.html and product-detail.html (always
   available, file:// safe). Reuses the canonical dialog shell
   (.payout-modal / .payout-dialog) plus the shared form helpers — the only
   restock-specific CSS is the .restock-items checklist (restock-modal.css).
   UI chrome is bound via data-i18n; sample item names/metas stay literal. */
window.ZTOR_PARTIALS.restockModal = String.raw`
<!-- Restock popup · spec §5.1.5.6 -->
<div class="payout-modal" data-restock-modal hidden>
  <section class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="restock-dialog-title">
    <div class="payout-dialog__head">
      <div>
        <h2 class="payout-dialog__title" id="restock-dialog-title" data-i18n="restock.title">Restock</h2>
        <p class="text-sub" style="margin:6px 0 0;font-size:13px" data-i18n="restock.sub">Add stock for physical items below threshold. Digital / unlimited items don't apply.</p>
      </div>
      <button class="btn btn--icon" type="button" aria-label="Close restock" data-i18n-aria-label="restock.close" data-restock-close><i data-lucide="x" class="ztor-icon"></i></button>
    </div>
    <div class="payout-dialog__body">
      <div class="payout-field__label" data-i18n="restock.select">Select items to restock</div>
      <!-- 空狀態（§4①/§6.1）：無低於門檻品項時顯示；demo 有樣本故預設隱藏，單一商品入口亦隱藏 -->
      <div data-restock-empty hidden style="padding:16px;text-align:center;font-size:12.5px;color:var(--foreground-subtle)" data-i18n="restock.empty">All your products are sufficiently stocked.</div>
      <div class="restock-items">
        <label class="restock-item is-checked">
          <input class="restock-item__box" type="checkbox" data-restock-pick checked>
          <span class="restock-item__check" aria-hidden="true"><i data-lucide="check-circle-fill" class="ztor-icon"></i></span>
          <span class="restock-item__main">
            <span class="restock-item__title">Tour zine vol. 02</span>
            <span class="restock-item__meta">3 left · threshold 5</span>
          </span>
          <span class="badge badge--error"><span data-i18n="e-shop.row.low">Low Stock</span></span>
        </label>
        <label class="restock-item is-checked">
          <input class="restock-item__box" type="checkbox" data-restock-pick checked>
          <span class="restock-item__check" aria-hidden="true"><i data-lucide="check-circle-fill" class="ztor-icon"></i></span>
          <span class="restock-item__main">
            <span class="restock-item__title">Coastline tee (S)</span>
            <span class="restock-item__meta">2 left · threshold 5</span>
          </span>
          <span class="badge badge--error"><span data-i18n="e-shop.row.low">Low Stock</span></span>
        </label>
        <label class="restock-item">
          <input class="restock-item__box" type="checkbox" data-restock-pick>
          <span class="restock-item__check" aria-hidden="true"><i data-lucide="check-circle-fill" class="ztor-icon"></i></span>
          <span class="restock-item__main">
            <span class="restock-item__title">Salt &amp; Bitumen poster</span>
            <span class="restock-item__meta">0 left · threshold 5</span>
          </span>
          <span class="badge badge--neutral"><span data-i18n="e-shop.row.out">Sold Out</span></span>
        </label>
      </div>

      <div class="payout-form-grid mt-16">
        <label class="payout-field">
          <span class="payout-field__label"><span data-i18n="restock.f.qty">Quantity</span> <span style="color:var(--status-error)">*</span></span>
          <input class="input" inputmode="numeric" value="20">
          <span class="payout-field__hint" data-i18n="restock.f.qty-hint">Suggested: restock to about 2× the threshold (non-binding).</span>
        </label>
        <label class="payout-field">
          <span class="payout-field__label" data-i18n="restock.f.supplier">Supplier (optional)</span>
          <input class="input" placeholder="—">
        </label>
        <label class="payout-field">
          <span class="payout-field__label" data-i18n="restock.f.eta">Expected arrival (optional)</span>
          <span class="input-affix">
            <input class="input input-affix__field" type="text" inputmode="numeric" value="2026/06/28" aria-label="Expected arrival" data-i18n-aria-label="restock.f.eta">
            <span class="input-affix__icon" aria-hidden="true"><i data-lucide="calendar" class="ztor-icon"></i></span>
          </span>
        </label>
        <label class="payout-field">
          <span class="payout-field__label" data-i18n="restock.f.notes">Notes (optional)</span>
          <input class="input" placeholder="—">
        </label>
      </div>

      <div class="stickynote mt-16">
        <span class="stickynote__mark">!</span>
        <span data-i18n="restock.note"><strong>Submitting marks the item Restocking.</strong> Stock and status recompute when you Mark received (§7.2). Digital / unlimited items can't be restocked.</span>
      </div>
    </div>
    <div class="payout-dialog__foot">
      <button class="btn btn--ghost" type="button" data-restock-close data-i18n="payout.cancel">Cancel</button>
      <span style="display:flex;gap:10px">
        <button class="btn btn--outline" type="button" data-restock-receive data-i18n="restock.receive">Mark received</button>
        <button class="btn btn--primary" type="button" data-restock-submit data-i18n="restock.submit">Submit restock</button>
      </span>
    </div>
  </section>
</div>
`;
