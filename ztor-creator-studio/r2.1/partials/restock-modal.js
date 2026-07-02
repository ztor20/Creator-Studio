window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* Restock modal · spec §5.1.5.6 (E-Shop · Restock sub-flow).
   Loaded as a <script> on e-shop.html and product-detail.html (file:// safe).
   Reuses the canonical dialog shell (.payout-modal / .payout-dialog) + form
   helpers. Method switch reuses .segmented; bundle member switch reuses .tabs;
   the restock HISTORY log (product-detail) reuses .data-list. Restock-specific
   CSS is restock-modal.css (.restock-panel / .restock-identity / .restock-after).

   The single-product panel is the reusable core: a single-product entry shows
   ONE panel; a bundle entry clones one panel per physical member under tabs so
   each member is filled separately (§2/§4①). createRestock() wires method →
   ETA/hint, qty → after readout, tabs → panel, and the submit/receive foot.
   UI chrome is data-i18n; sample data stays literal. */
(function () {
  var RESTOCK_PANEL = `
<div class="restock-panel" data-restock-panel data-current="3">
  <div class="restock-identity">
    <span class="restock-identity__img" data-restock-img><i data-lucide="package" class="ztor-icon"></i></span>
    <span class="restock-identity__main">
      <span class="restock-identity__title" data-restock-name>Tour zine vol. 02</span>
      <span class="restock-identity__meta"><span data-i18n="restock.current">Current stock</span> <b data-restock-current>3</b> · <span data-i18n="restock.threshold">threshold</span> <span data-restock-threshold>5</span></span>
    </span>
    <span class="badge badge--error" data-restock-badge><span data-i18n="e-shop.row.low">Low Stock</span></span>
  </div>

  <div class="payout-field mt-16">
    <span class="payout-field__label"><span data-i18n="restock.method">Restock method</span> <span class="field__req">*</span></span>
    <div class="segmented" role="tablist" data-restock-method>
      <button class="segmented__btn segmented__btn--active" type="button" role="tab" aria-selected="true" data-restock-mode="now" data-i18n="restock.method.now">Restock now</button>
      <button class="segmented__btn" type="button" role="tab" aria-selected="false" data-restock-mode="scheduled" data-i18n="restock.method.scheduled">Scheduled</button>
    </div>
    <span class="payout-field__hint" data-restock-method-hint data-i18n="restock.method.now-hint">Stock is on hand — adds to inventory immediately.</span>
  </div>

  <div class="payout-form-grid mt-16">
    <label class="payout-field">
      <span class="payout-field__label"><span data-i18n="restock.f.qty">Restock quantity</span> <span class="field__req">*</span></span>
      <input class="input" inputmode="numeric" value="20" data-restock-qty>
      <span class="payout-field__hint" data-i18n="restock.f.qty-hint">Suggested: restock to about 2× the threshold (non-binding).</span>
    </label>
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

  <div class="restock-after">
    <span data-i18n="restock.after">After restock</span>
    <b><span data-restock-after>23</span> <span data-i18n="restock.units">units</span></b>
  </div>
</div>`;

  window.ZTOR_PARTIALS.restockPanel = RESTOCK_PANEL;
  window.ZTOR_PARTIALS.restockModal = `
<div class="payout-modal" data-restock-modal hidden>
  <section class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="restock-dialog-title">
    <div class="payout-dialog__head">
      <div>
        <h2 class="payout-dialog__title" id="restock-dialog-title" data-i18n="restock.title">Restock</h2>
        <p class="text-sub" style="margin:6px 0 0;font-size:13px" data-i18n="restock.sub">Add stock for a physical product. Digital / unlimited items don't apply.</p>
      </div>
      <button class="btn btn--icon" type="button" aria-label="Close restock" data-i18n-aria-label="restock.close" data-restock-close><i data-lucide="x" class="ztor-icon"></i></button>
    </div>
    <div class="payout-dialog__body">
      <!-- Bundle member switch — hidden for single-product entry; controller fills for bundles -->
      <div class="tabs" role="tablist" data-restock-tabs hidden></div>
      <!-- Empty state (§4①/§6.1): only from a low-stock reminder with nothing to restock -->
      <div data-restock-empty hidden style="padding:16px;text-align:center;font-size:12.5px;color:var(--foreground-subtle)" data-i18n="restock.empty">All your products are sufficiently stocked.</div>
      <!-- One panel for single-product; controller clones one per member for bundles -->
      <div data-restock-panels>${RESTOCK_PANEL}</div>

      <div class="stickynote mt-16">
        <span class="stickynote__mark">!</span>
        <span data-i18n="restock.note"><strong>Restock now</strong> adds stock immediately; <strong>Scheduled</strong> marks the item Restocking until you Mark received (§7.2). Every restock is logged on the product page. Digital / unlimited items can't be restocked.</span>
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

  /* Controller factory — mounts the modal into `host` and returns
     { openSingle(item,row), openBundle(members,row), close() }.
     hooks: { onSubmit(entry, mode), onReceive(entry) } (optional). */
  window.ZTOR_PARTIALS.createRestock = function (host, hooks) {
    hooks = hooks || {};
    var modal = null, lastFocused = null, originRow = null;

    function chrome(el) {
      if (window.ztorIcons) window.ztorIcons.applyIcons(el);
      if (window.applyI18n) window.applyI18n(el);
    }
    function activePanel() { return modal && modal.querySelector('.restock-panel:not([hidden])'); }
    function panelMode(panel) {
      var on = panel && panel.querySelector('.segmented__btn--active');
      return on ? on.getAttribute('data-restock-mode') : 'now';
    }
    function num(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
    function recalcAfter(panel) {
      if (!panel) return;
      var cur = num(panel.getAttribute('data-current'));
      var qEl = panel.querySelector('[data-restock-qty]');
      var out = panel.querySelector('[data-restock-after]');
      if (out) out.textContent = String(cur + num(qEl && qEl.value));
    }
    function syncFoot() {
      if (!modal) return;
      var recv = modal.querySelector('[data-restock-receive]');
      if (recv) recv.hidden = panelMode(activePanel()) !== 'scheduled';
    }
    function setMode(panel, mode) {
      panel.querySelectorAll('.segmented__btn').forEach(function (b) {
        var on = b.getAttribute('data-restock-mode') === mode;
        b.classList.toggle('segmented__btn--active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      var eta = panel.querySelector('[data-restock-eta]');
      if (eta) eta.hidden = mode !== 'scheduled';
      var hint = panel.querySelector('[data-restock-method-hint]');
      if (hint) {
        hint.setAttribute('data-i18n', mode === 'scheduled' ? 'restock.method.scheduled-hint' : 'restock.method.now-hint');
        if (window.applyI18n) window.applyI18n(hint);
      }
      syncFoot();
    }
    function fillIdentity(panel, item) {
      item = item || {};
      if (item.current != null) panel.setAttribute('data-current', item.current);
      var nm = panel.querySelector('[data-restock-name]');
      if (nm && item.name) nm.textContent = item.name;
      var cur = panel.querySelector('[data-restock-current]');
      if (cur && item.current != null) cur.textContent = item.current;
      var th = panel.querySelector('[data-restock-threshold]');
      if (th && item.threshold != null) th.textContent = item.threshold;
      var badge = panel.querySelector('[data-restock-badge]');
      if (badge) {
        /* stock-axis badge per item: out = Sold Out (neutral) · ok = In stock
           (success) · default low = Low Stock (error) — §7.2 stock axis */
        var st = item.status === 'out' ? ['badge--neutral', 'e-shop.row.out', 'Sold Out']
               : item.status === 'ok'  ? ['badge--success', 'e-shop.row.instock', 'In stock']
               :                         ['badge--error',   'e-shop.row.low', 'Low Stock'];
        badge.className = 'badge ' + st[0];
        badge.innerHTML = '<span data-i18n="' + st[1] + '">' + st[2] + '</span>';
        if (window.applyI18n) window.applyI18n(badge);
      }
      var img = panel.querySelector('[data-restock-img]');
      if (img && item.img) img.innerHTML = '<img src="' + item.img + '" alt="">';
      recalcAfter(panel);
    }
    function resetPanels(count) {
      var wrap = modal.querySelector('[data-restock-panels]');
      wrap.innerHTML = '';
      for (var i = 0; i < count; i++) wrap.insertAdjacentHTML('beforeend', window.ZTOR_PARTIALS.restockPanel);
      chrome(wrap);
      wrap.querySelectorAll('.restock-panel').forEach(function (p) { setMode(p, 'now'); });
      return Array.prototype.slice.call(wrap.querySelectorAll('.restock-panel'));
    }
    function showMember(idx) {
      var panels = Array.prototype.slice.call(modal.querySelectorAll('.restock-panel'));
      panels.forEach(function (p, i) { p.hidden = i !== idx; });
      modal.querySelectorAll('[data-restock-tab]').forEach(function (t, i) {
        t.classList.toggle('tabs__item--active', i === idx);
        t.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });
      syncFoot();
    }
    function setOriginBadge(cls, key, txt) {
      var b = originRow && originRow.querySelector('.product-list__status .badge');
      if (!b) return;
      b.className = 'badge ' + cls;
      b.innerHTML = '<span data-i18n="' + key + '">' + txt + '</span>';
      if (window.applyI18n) window.applyI18n(b);
    }
    function collect(panel) {
      var qEl = panel.querySelector('[data-restock-qty]');
      var supEl = panel.querySelector('[data-restock-supplier]');
      var nmEl = panel.querySelector('[data-restock-name]');
      return {
        name: nmEl ? nmEl.textContent : '',
        qty: num(qEl && qEl.value),
        current: num(panel.getAttribute('data-current')),
        supplier: (supEl && supEl.value) || '',
        mode: panelMode(panel)
      };
    }
    function submit() {
      var panel = activePanel(), mode = panelMode(panel);
      if (mode === 'scheduled') setOriginBadge('badge--warning', 'e-shop.row.restocking', 'Restocking');
      else setOriginBadge('badge--success', 'e-shop.row.instock', 'In stock');
      if (hooks.onSubmit) hooks.onSubmit(collect(panel), mode);
      close();
    }
    function receive() {
      var panel = activePanel();
      setOriginBadge('badge--success', 'e-shop.row.instock', 'In stock');
      if (hooks.onReceive) hooks.onReceive(collect(panel));
      close();
    }
    function onClick(e) {
      if (e.target === modal) { close(); return; }
      var modeBtn = e.target.closest('[data-restock-mode]');
      if (modeBtn) { setMode(modeBtn.closest('.restock-panel'), modeBtn.getAttribute('data-restock-mode')); return; }
      var tab = e.target.closest('[data-restock-tab]');
      if (tab) { showMember(num(tab.getAttribute('data-restock-tab'))); return; }
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
        if (e.target.closest('[data-restock-qty]')) recalcAfter(e.target.closest('.restock-panel'));
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

    function openSingle(item, row) {
      if (!ensure()) return;
      originRow = row || null;
      var tabs = modal.querySelector('[data-restock-tabs]');
      if (tabs) { tabs.hidden = true; tabs.innerHTML = ''; }
      var panels = resetPanels(1);
      fillIdentity(panels[0], item || {});
      showMember(0);
      open();
    }
    /* Tabbed mode — one panel per item, each filled separately. Two callers,
       same mechanic (spec 5.1.5.6 §2): bundle = tabs are physical MEMBERS;
       multi-variant product (5.1.5.2 §4.1 F3 route B) = tabs are enabled
       VARIANTS of one product. */
    function openTabbed(members, row) {
      if (!ensure()) return;
      originRow = row || null;
      members = (members && members.length) ? members : [];
      var tabs = modal.querySelector('[data-restock-tabs]');
      tabs.hidden = false;
      tabs.innerHTML = members.map(function (m, i) {
        return '<button class="tabs__item' + (i === 0 ? ' tabs__item--active' : '') + '" type="button" role="tab" aria-selected="' + (i === 0) + '" data-restock-tab="' + i + '">' + (m.tab || m.name || ('Item ' + (i + 1))) + '</button>';
      }).join('');
      var panels = resetPanels(members.length || 1);
      members.forEach(function (m, i) { fillIdentity(panels[i], m); });
      showMember(0);
      open();
    }

    return {
      openSingle: openSingle,
      openBundle: openTabbed,   /* bundle members */
      openVariants: openTabbed, /* multi-variant product's enabled variants */
      close: close
    };
  };
})();
