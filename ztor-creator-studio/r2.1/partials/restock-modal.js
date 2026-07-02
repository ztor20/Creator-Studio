window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* Restock modal · spec §5.1.5.6 v1.4 (E-Shop · Restock sub-flow · D104).
   Loaded as a <script> on e-shop.html and product-detail.html (file:// safe).

   Order model: ONE restock = one order. The popup reuses the canonical dialog
   shell (.payout-modal / .payout-dialog) + form helpers. The DOCUMENT layer
   (method .segmented + supplier / ETA / notes) is filled once. The ITEM layer
   is a list of quantity lines (.restock-line): single product = 1 line;
   multi-variant product = one line per enabled variant under a group header;
   bundle = one group per physical member (a multi-variant member expands to
   its variant lines). Quantity blank = that item isn't restocked. No tabs, no
   per-item re-entry — solves nested bundles + many-variant overflow.

   createRestock(host, hooks) returns { openSingle, openVariants, openBundle,
   openOrder, close }. hooks: { onSubmit(entries, mode), onReceive(entries) }.
   UI chrome is data-i18n; sample data stays literal. */
(function () {
  window.ZTOR_PARTIALS.restockModal = `
<div class="payout-modal" data-restock-modal hidden>
  <section class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="restock-dialog-title">
    <div class="payout-dialog__head">
      <div>
        <h2 class="payout-dialog__title" id="restock-dialog-title" data-i18n="restock.title">Restock</h2>
        <p class="text-sub" style="margin:6px 0 0;font-size:13px" data-i18n="restock.sub">Add stock for physical items. Digital / unlimited items don't apply.</p>
      </div>
      <button class="btn btn--icon" type="button" aria-label="Close restock" data-i18n-aria-label="restock.close" data-restock-close><i data-lucide="x" class="ztor-icon"></i></button>
    </div>
    <div class="payout-dialog__body">
      <!-- Document layer — method + supplier / ETA / notes, filled once per order -->
      <div class="payout-field">
        <span class="payout-field__label"><span data-i18n="restock.method">Restock method</span> <span class="field__req">*</span></span>
        <div class="segmented" role="tablist" data-restock-method>
          <button class="segmented__btn segmented__btn--active" type="button" role="tab" aria-selected="true" data-restock-mode="now" data-i18n="restock.method.now">Restock now</button>
          <button class="segmented__btn" type="button" role="tab" aria-selected="false" data-restock-mode="scheduled" data-i18n="restock.method.scheduled">Scheduled</button>
        </div>
        <span class="payout-field__hint" data-restock-method-hint data-i18n="restock.method.now-hint">Stock is on hand — adds to inventory immediately.</span>
      </div>
      <div class="payout-form-grid mt-16">
        <label class="payout-field" data-restock-eta hidden>
          <span class="payout-field__label"><span data-i18n="restock.f.eta">Expected arrival</span> <span class="field__req">*</span></span>
          <input class="input" type="date" value="2026-07-08">
        </label>
        <label class="payout-field">
          <span class="payout-field__label" data-i18n="restock.f.supplier">Supplier (optional)</span>
          <input class="input" placeholder="—" data-restock-supplier>
        </label>
        <label class="payout-field">
          <span class="payout-field__label" data-i18n="restock.f.notes">Notes (optional)</span>
          <input class="input" placeholder="—">
        </label>
      </div>

      <!-- Item layer — one quantity line per restockable item -->
      <div class="payout-field__label mt-16"><span data-i18n="restock.items">Items to restock</span> <span class="text-sub" style="font-weight:var(--fw-regular)" data-i18n="restock.items-hint">— leave blank to skip an item</span></div>
      <div class="restock-lines" data-restock-lines></div>
      <div data-restock-empty hidden style="padding:16px;text-align:center;font-size:12.5px;color:var(--foreground-subtle)" data-i18n="restock.empty">All your products are sufficiently stocked.</div>

      <div class="stickynote mt-16">
        <span class="stickynote__mark">!</span>
        <span data-i18n="restock.note"><strong>Restock now</strong> adds stock immediately; <strong>Scheduled</strong> marks items Restocking until you Mark received (§7.2). Each restocked item is logged on the product page. Digital / unlimited items can't be restocked.</span>
      </div>
    </div>
    <div class="payout-dialog__foot">
      <button class="btn btn--ghost" type="button" data-restock-close data-i18n="payout.cancel">Cancel</button>
      <span style="display:flex;gap:10px">
        <button class="btn btn--outline" type="button" data-restock-receive data-i18n="restock.receive" hidden>Mark received</button>
        <button class="btn btn--primary" type="button" data-restock-submit data-i18n="restock.submit">Submit restock</button>
      </span>
    </div>
  </section>
</div>`;

  /* Controller factory. */
  window.ZTOR_PARTIALS.createRestock = function (host, hooks) {
    hooks = hooks || {};
    var modal = null, lastFocused = null, originRow = null;

    function chrome(el) {
      if (window.ztorIcons) window.ztorIcons.applyIcons(el);
      if (window.applyI18n) window.applyI18n(el);
    }
    function num(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
    function mode() {
      var on = modal && modal.querySelector('.segmented__btn--active');
      return on ? on.getAttribute('data-restock-mode') : 'now';
    }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

    function badgeFor(status) {
      return status === 'out' ? ['badge--neutral', 'e-shop.row.out', 'Sold Out']
           : status === 'ok'  ? ['badge--success', 'e-shop.row.instock', 'In stock']
           :                    ['badge--error', 'e-shop.row.low', 'Low Stock'];
    }
    function lineHTML(item) {
      var cur = num(item.current);
      var b = badgeFor(item.status);
      var imgInner = item.img ? '<img src="' + esc(item.img) + '" alt="">' : '<i data-lucide="package" class="ztor-icon"></i>';
      return '' +
        '<div class="restock-line" data-restock-line data-current="' + cur + '" data-name="' + esc(item.name) + '">' +
          '<div class="restock-line__main">' +
            '<span class="restock-line__img">' + imgInner + '</span>' +
            '<div class="restock-line__text">' +
              '<div class="restock-line__name">' + esc(item.name) +
                ' <span class="badge ' + b[0] + '"><span data-i18n="' + b[1] + '">' + b[2] + '</span></span></div>' +
              '<div class="restock-line__meta"><span data-i18n="restock.current">Current stock</span> <b>' + cur + '</b> · <span data-i18n="restock.threshold">threshold</span> ' + num(item.threshold || 5) + '</div>' +
            '</div>' +
          '</div>' +
          '<input class="input restock-line__qty" inputmode="numeric" placeholder="0" data-restock-qty aria-label="Restock quantity">' +
          '<div class="restock-line__after">→ <b data-restock-after>' + cur + '</b></div>' +
        '</div>';
    }
    function renderLines(groups) {
      var wrap = modal.querySelector('[data-restock-lines]');
      var html = '';
      groups.forEach(function (g) {
        if (g.label) html += '<div class="restock-lines__group">' + esc(g.label) + '</div>';
        (g.items || []).forEach(function (it) { html += lineHTML(it); });
      });
      wrap.innerHTML = html;
      chrome(wrap);
    }
    function recalc(line) {
      var cur = num(line.getAttribute('data-current'));
      var q = num((line.querySelector('[data-restock-qty]') || {}).value);
      var out = line.querySelector('[data-restock-after]');
      if (out) out.textContent = cur + q;
    }
    function setMode(m) {
      modal.querySelectorAll('[data-restock-method] .segmented__btn').forEach(function (b) {
        var on = b.getAttribute('data-restock-mode') === m;
        b.classList.toggle('segmented__btn--active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      var eta = modal.querySelector('[data-restock-eta]');
      if (eta) eta.hidden = m !== 'scheduled';
      var hint = modal.querySelector('[data-restock-method-hint]');
      if (hint) {
        hint.setAttribute('data-i18n', m === 'scheduled' ? 'restock.method.scheduled-hint' : 'restock.method.now-hint');
        if (window.applyI18n) window.applyI18n(hint);
      }
      var recv = modal.querySelector('[data-restock-receive]');
      if (recv) recv.hidden = m !== 'scheduled';
    }
    function collect() {
      var supEl = modal.querySelector('[data-restock-supplier]');
      var supplier = (supEl && supEl.value) || '';
      var entries = [];
      modal.querySelectorAll('[data-restock-line]').forEach(function (line) {
        var q = num((line.querySelector('[data-restock-qty]') || {}).value);
        if (q > 0) entries.push({ name: line.getAttribute('data-name'), qty: q, current: num(line.getAttribute('data-current')), supplier: supplier });
      });
      return entries;
    }
    function setOriginBadge(cls, key, txt) {
      var b = originRow && originRow.querySelector('.product-list__status .badge');
      if (!b) return;
      b.className = 'badge ' + cls;
      b.innerHTML = '<span data-i18n="' + key + '">' + txt + '</span>';
      if (window.applyI18n) window.applyI18n(b);
    }
    function submit() {
      var entries = collect();
      if (!entries.length) return;   /* nothing entered */
      var m = mode();
      if (m === 'scheduled') setOriginBadge('badge--warning', 'e-shop.row.restocking', 'Restocking');
      else setOriginBadge('badge--success', 'e-shop.row.instock', 'In stock');
      if (hooks.onSubmit) hooks.onSubmit(entries, m);
      close();
    }
    function receive() {
      var entries = collect();
      setOriginBadge('badge--success', 'e-shop.row.instock', 'In stock');
      if (hooks.onReceive) hooks.onReceive(entries);
      close();
    }
    function onClick(e) {
      if (e.target === modal) { close(); return; }
      var modeBtn = e.target.closest('[data-restock-mode]');
      if (modeBtn) { setMode(modeBtn.getAttribute('data-restock-mode')); return; }
      if (e.target.closest('[data-restock-close]')) { close(); return; }
      if (e.target.closest('[data-restock-submit]')) { submit(); return; }
      if (e.target.closest('[data-restock-receive]')) { receive(); return; }
    }
    function ensure() {
      if (modal) return true;
      var html = window.ZTOR_PARTIALS && window.ZTOR_PARTIALS.restockModal;
      if (!html) { console.warn('[restock] template missing — is partials/restock-modal.js loaded?'); return false; }
      host.innerHTML = html;
      chrome(host);
      modal = host.querySelector('[data-restock-modal]');
      modal.addEventListener('click', onClick);
      modal.addEventListener('input', function (e) {
        var line = e.target.closest && e.target.closest('[data-restock-line]');
        if (line && e.target.closest('[data-restock-qty]')) recalc(line);
      });
      return true;
    }
    function open() {
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('is-modal-open');
      var f = modal.querySelector('input, button');
      if (f) f.focus();
    }
    function close() {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove('is-modal-open');
      originRow = null;
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    /* Core entry — groups = [{ label: string|null, items: [{name,current,threshold,status,img}] }] */
    function openOrder(groups, row) {
      if (!ensure()) return;
      originRow = row || null;
      groups = (groups && groups.length) ? groups : [{ label: null, items: [] }];
      renderLines(groups);
      setMode('now');
      var supEl = modal.querySelector('[data-restock-supplier]');
      if (supEl) supEl.value = '';
      open();
    }
    return {
      openOrder: openOrder,
      /* single-variant product → one groupless line */
      openSingle: function (item, row) { openOrder([{ label: null, items: [item || {}] }], row); },
      /* multi-variant product → group header (product) + one line per variant */
      openVariants: function (product, variants, row) { openOrder([{ label: product, items: variants || [] }], row); },
      /* bundle → one group per physical member; a multi-variant member expands
         to its variant lines (member.variants), else a single groupless-ish line */
      openBundle: function (members, row) {
        /* Plain single-variant members first (groupless lines), then
           multi-variant members as titled groups — so a group header clearly
           bounds its variant lines and no loose line trails under it. */
        var ordered = (members || []).slice().sort(function (a, b) {
          return (a.variants ? 1 : 0) - (b.variants ? 1 : 0);
        });
        var groups = ordered.map(function (m) {
          if (m.variants && m.variants.length) return { label: m.name, items: m.variants };
          return { label: null, items: [m] };
        });
        openOrder(groups, row);
      },
      close: close
    };
  };
})();
