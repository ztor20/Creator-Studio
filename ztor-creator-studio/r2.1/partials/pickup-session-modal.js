window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* Pickup session modal · spec 5.1.5.11 F3 (E-Shop · Pickup Management · D111).
   The ONE shared create/edit popup, loaded as a <script> on pickup.html,
   create-product.html and product-detail.html (file:// safe). From a product
   context it pre-adds that product to "pickup items" but the creator can still
   add other items and event tickets.

   Two steps in one dialog:
     · form   — name / location / start·end time / instructions / verifiable
                items (products + tickets, multi-select) / scanner password.
     · result — generated scanner URL + QR + copy, shown after Create.

   createPickupSession(host, hooks) → { openBlank, openExisting,
   openForProduct(name), close }. hooks: { onCreate(session) }.
   UI chrome = data-i18n; sample item/ticket lists are literals. */
(function () {
  var PRODUCTS = [
    { id: 'zine', name: 'Tour zine vol. 02', meta: 'Books · 40 sold', img: '' },
    { id: 'tee',  name: 'Coastline tee · M / L', meta: 'Apparel · 22 sold', img: '' },
    { id: 'lp',   name: 'Coastline acetate LP', meta: 'Music · numbered', img: '' }
  ];
  var TICKETS = [
    { id: 'sign', name: 'Signing session · GA entry', meta: 'Taipei signing · on-site entry' },
    { id: 'meet', name: 'Fan-meet · VIP', meta: 'Kaohsiung fan-meet · on-site entry' }
  ];

  window.ZTOR_PARTIALS.pickupSessionModal = `
<div class="payout-modal" data-pickup-modal hidden>
  <section class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="pickup-dialog-title">
    <div class="payout-dialog__head">
      <div>
        <h2 class="payout-dialog__title" id="pickup-dialog-title" data-i18n="pks.title">Create pickup session</h2>
        <p class="text-sub" style="margin:6px 0 0;font-size:13px" data-i18n="pks.sub">Set a time window, add the items and event tickets this session can redeem, and protect the scanner with a password.</p>
      </div>
      <button class="btn btn--icon" type="button" aria-label="Close" data-i18n-aria-label="pks.close" data-pks-close><i data-lucide="x" class="ztor-icon"></i></button>
    </div>

    <!-- STEP 1 · form -->
    <div class="payout-dialog__body" data-pks-form>
      <div class="form-grid">
        <label class="field">
          <span class="field__label"><span data-i18n="pks.f.name">Session name</span> <span class="field__req">*</span></span>
          <input class="input" data-pks-name placeholder="e.g., Taipei signing — pickup" data-i18n-placeholder="pks.f.name.ph">
        </label>
        <label class="field">
          <span class="field__label"><span data-i18n="pks.f.loc">Pickup location</span> <span class="field__req">*</span></span>
          <input class="input" data-pks-loc placeholder="Venue, booth or entrance" data-i18n-placeholder="pks.f.loc.ph">
        </label>
        <label class="field">
          <span class="field__label"><span data-i18n="pks.f.start">Start time</span> <span class="field__req">*</span></span>
          <input class="input" type="datetime-local" data-pks-start value="2026-07-12T13:00">
        </label>
        <label class="field">
          <span class="field__label"><span data-i18n="pks.f.end">End time</span> <span class="field__req">*</span></span>
          <input class="input" type="datetime-local" data-pks-end value="2026-07-12T17:00">
        </label>
      </div>
      <span class="field__hint" data-pks-time-err hidden style="color:var(--destructive)" data-i18n="pks.f.time.err">End time must be later than start time.</span>

      <label class="field mt-16">
        <span class="field__label" data-i18n="pks.f.instr">Pickup instructions (optional)</span>
        <textarea class="textarea" data-pks-instr placeholder="Queue location, ID needed, limits…" data-i18n-placeholder="pks.f.instr.ph"></textarea>
      </label>

      <div class="field__label mt-16"><span data-i18n="pks.items">Pickup items</span> <span class="text-sub" style="font-weight:var(--fw-regular)" data-i18n="pks.items.hint">— physical items set to on-site QR pickup</span></div>
      <div class="pickup-select" data-pks-products></div>

      <div class="field__label mt-16"><span data-i18n="pks.tickets">Event tickets</span> <span class="text-sub" style="font-weight:var(--fw-regular)" data-i18n="pks.tickets.hint">— redeem event tickets with the same scanner</span></div>
      <div class="pickup-select" data-pks-tickets></div>

      <label class="field mt-16">
        <span class="field__label"><span data-i18n="pks.f.pw">Scanner password</span> <span class="field__req">*</span></span>
        <input class="input" type="password" data-pks-pw placeholder="Staff enter this to scan" data-i18n-placeholder="pks.f.pw.ph" autocomplete="new-password">
        <span class="field__hint" data-i18n="pks.f.pw.hint">Staff type this after opening the scanner URL. Changing it later signs out active scanners.</span>
      </label>

      <div class="info-banner mt-16">
        <i data-lucide="info" class="ztor-icon info-banner__icon"></i>
        <span data-i18n="pks.note">Add at least one item or ticket before you can create the session — that also enables the scanner. Creating it generates a password-protected scanner URL you hand to staff.</span>
      </div>
    </div>

    <!-- STEP 2 · result -->
    <div class="payout-dialog__body" data-pks-result hidden>
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;padding:8px 0">
        <div class="qr-box qr-box--lg" data-qr></div>
        <div>
          <div style="font-size:var(--fs-16);font-weight:var(--fw-semibold)" data-i18n="pks.done.title">Session created</div>
          <p class="text-sub" style="font-size:var(--fs-13);margin:6px 0 0" data-i18n="pks.done.sub">Hand this scanner URL to your on-site staff. They open it, enter the password and scan.</p>
        </div>
        <div class="scanner-access__url" style="width:100%">
          <code data-pks-url>ztor.app/scan/tpe-signing-7f3a2</code>
          <button class="btn btn--outline btn--sm" type="button" data-pks-copy><i data-lucide="copy" class="ztor-icon"></i> <span data-i18n="pks.done.copy">Copy</span></button>
        </div>
      </div>
    </div>

    <div class="payout-dialog__foot" data-pks-foot-form>
      <button class="btn btn--ghost" type="button" data-pks-close data-i18n="payout.cancel">Cancel</button>
      <button class="btn btn--primary" type="button" data-pks-create data-i18n="pks.create" disabled>Create session</button>
    </div>
    <div class="payout-dialog__foot" data-pks-foot-result hidden>
      <button class="btn btn--primary" type="button" data-pks-close style="margin-left:auto" data-i18n="pks.done.ok">Done</button>
    </div>
  </section>
</div>`;

  window.ZTOR_PARTIALS.createPickupSession = function (host, hooks) {
    hooks = hooks || {};
    var modal = null, lastFocused = null;

    function chrome(el) {
      if (window.ztorIcons) window.ztorIcons.applyIcons(el);
      if (window.applyI18n) window.applyI18n(el);
    }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function rowHTML(kind, it) {
      var img = it.img
        ? '<span class="pickup-select__img"><img src="' + esc(it.img) + '" alt=""></span>'
        : '<span class="pickup-select__img"><i data-lucide="' + (kind === 'ticket' ? 'ticket' : 'package') + '" class="ztor-icon" style="width:16px;height:16px"></i></span>';
      return '<label class="pickup-select__row" data-pks-item data-id="' + esc(it.id) + '">' +
        '<span class="pickup-select__box"><i data-lucide="check" class="ztor-icon"></i></span>' + img +
        '<span class="pickup-select__text"><span class="pickup-select__name">' + esc(it.name) + '</span>' +
        '<span class="pickup-select__meta">' + esc(it.meta) + '</span></span>' +
        '<input type="checkbox" hidden></label>';
    }
    function renderLists() {
      modal.querySelector('[data-pks-products]').innerHTML = PRODUCTS.map(function (p) { return rowHTML('product', p); }).join('');
      modal.querySelector('[data-pks-tickets]').innerHTML = TICKETS.map(function (t) { return rowHTML('ticket', t); }).join('');
      chrome(modal.querySelector('[data-pks-products]'));
      chrome(modal.querySelector('[data-pks-tickets]'));
    }
    function setChecked(row, on) {
      row.classList.toggle('is-checked', on);
      var cb = row.querySelector('input[type=checkbox]'); if (cb) cb.checked = on;
    }
    function checkedCount() {
      return modal.querySelectorAll('[data-pks-item].is-checked').length;
    }
    /* No draft state (D112) — a session needs ≥1 item/ticket before it can be created. */
    function syncCreateEnabled() {
      var btn = modal.querySelector('[data-pks-create]');
      if (btn) btn.disabled = checkedCount() === 0;
    }
    function validTime() {
      var s = modal.querySelector('[data-pks-start]').value;
      var e = modal.querySelector('[data-pks-end]').value;
      return !s || !e || e > s;
    }
    function updateTimeErr() {
      var ok = validTime();
      modal.querySelector('[data-pks-time-err]').hidden = ok;
      return ok;
    }
    function step(which) {
      modal.querySelector('[data-pks-form]').hidden = which !== 'form';
      modal.querySelector('[data-pks-result]').hidden = which !== 'result';
      modal.querySelector('[data-pks-foot-form]').hidden = which !== 'form';
      modal.querySelector('[data-pks-foot-result]').hidden = which !== 'result';
    }
    function fillQr(seed) {
      var box = modal.querySelector('[data-pks-result] .qr-box');
      if (box && window.ztorFauxQr) box.innerHTML = window.ztorFauxQr(seed || 9);
    }
    function create() {
      if (checkedCount() === 0) { syncCreateEnabled(); return; }
      if (!updateTimeErr()) return;
      var name = (modal.querySelector('[data-pks-name]').value || '').trim();
      var slug = (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'session').slice(0, 18);
      modal.querySelector('[data-pks-url]').textContent = 'ztor.app/scan/' + slug + '-' + Math.random().toString(36).slice(2, 7);
      fillQr(Math.floor(Math.random() * 40) + 5);
      step('result');
      if (hooks.onCreate) hooks.onCreate({ name: name, items: checkedCount() });
    }

    function onClick(e) {
      if (e.target === modal) { close(); return; }
      var row = e.target.closest('[data-pks-item]');
      if (row) { e.preventDefault(); setChecked(row, !row.classList.contains('is-checked')); syncCreateEnabled(); return; }
      if (e.target.closest('[data-pks-close]')) { close(); return; }
      if (e.target.closest('[data-pks-create]')) { create(); return; }
      if (e.target.closest('[data-pks-copy]')) {
        var url = modal.querySelector('[data-pks-url]').textContent;
        if (navigator.clipboard) navigator.clipboard.writeText(url).catch(function () {});
        return;
      }
    }
    function onKey(e) { if (e.key === 'Escape' && modal && !modal.hidden) close(); }

    function ensure() {
      if (modal) return true;
      var html = window.ZTOR_PARTIALS && window.ZTOR_PARTIALS.pickupSessionModal;
      if (!html) { console.warn('[pickup] template missing — is partials/pickup-session-modal.js loaded?'); return false; }
      host.innerHTML = html;
      chrome(host);
      modal = host.querySelector('[data-pickup-modal]');
      renderLists();
      modal.addEventListener('click', onClick);
      modal.addEventListener('change', function (e) {
        if (e.target.matches('[data-pks-start],[data-pks-end]')) updateTimeErr();
      });
      document.addEventListener('keydown', onKey);
      return true;
    }
    function open(preselectId, titleKey) {
      lastFocused = document.activeElement;
      step('form');
      updateTimeErr();
      modal.querySelectorAll('[data-pks-item]').forEach(function (r) { setChecked(r, false); });
      if (preselectId) {
        var row = modal.querySelector('[data-pks-item][data-id="' + preselectId + '"]');
        if (row) setChecked(row, true);
      }
      syncCreateEnabled();
      var title = modal.querySelector('#pickup-dialog-title');
      title.setAttribute('data-i18n', titleKey || 'pks.title');
      if (window.applyI18n) window.applyI18n(title);
      modal.hidden = false;
      document.body.classList.add('is-modal-open');
      var f = modal.querySelector('[data-pks-name]');
      if (f) f.focus();
    }
    function close() {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove('is-modal-open');
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    return {
      openBlank: function () { if (ensure()) open(null, 'pks.title'); },
      openExisting: function () { if (ensure()) open(null, 'pks.title.edit'); },
      /* from a product context: pre-add that product (id: zine/tee/lp) */
      openForProduct: function (id) { if (ensure()) open(id || 'zine', 'pks.title'); },
      close: close
    };
  };
})();
