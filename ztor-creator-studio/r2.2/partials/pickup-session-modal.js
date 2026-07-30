window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* Pickup session modal · spec 5.1.5.11 F3 (E-Shop · Pickup Management · D111).
   The ONE shared create/edit popup, loaded as a <script> on pickup.html,
   create-product.html and product-detail.html (file:// safe). From a product
   context it pre-adds that product to "pickup items" but the creator can still
   add other items and event tickets.

   Two steps in one dialog:
     · form   — three freely-switchable tabs (shared .tabs + .tab-panel), spec
                5.1.5.12 §4: "basic" session basics (name / location / start·end
                / instructions), "items" pickup items — ONE search-to-add
                combobox (selected items are removable chips; focus/typing opens
                a dropdown of products + tickets), "scanner" set password. The
                items tab carries a live count badge; Create validates and routes
                to the offending tab so a hidden required field is never silent.
     · result — generated scanner URL + QR + copy, shown after Create.
   Fields use the canonical .field / .form-grid system (field-system.css /
   form-grid.css); the retired .payout-field* classes were dropped 2026-07-17.
   The item picker reuses .tag-input (field + chips) + .combobox (dropdown).

   createPickupSession(host, hooks) → { openBlank, openExisting,
   openForProduct(name), close }. hooks: { onCreate(session) }.
   UI chrome = data-i18n; sample item/ticket lists are literals. */
(function () {
  var PRODUCTS = [
    { id: 'zine', kind: 'product', name: 'Tour zine vol. 02', meta: 'Books · 40 sold' },
    { id: 'tee',  kind: 'product', name: 'Coastline tee · M / L', meta: 'Apparel · 22 sold' },
    { id: 'lp',   kind: 'product', name: 'Coastline acetate LP', meta: 'Music · numbered' }
  ];
  var TICKETS = [
    { id: 'sign', kind: 'ticket', name: 'Signing session · GA entry', meta: 'Taipei signing · on-site entry' },
    { id: 'meet', kind: 'ticket', name: 'Fan-meet · VIP', meta: 'Kaohsiung fan-meet · on-site entry' }
  ];
  var ITEMS = PRODUCTS.concat(TICKETS);

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

    <!-- STEP 1 · form — three freely-switchable tabs: basics / items / scanner (spec 5.1.5.12 §4).
         The tab bar replaces the old stacked filled panels; only the active .tab-panel shows. -->
    <div class="payout-dialog__body" data-pks-form>
      <nav class="tabs" role="tablist" data-pks-tabs>
        <button class="tabs__item tabs__item--active" type="button" role="tab" aria-selected="true" data-pks-tab="basic"><span data-i18n="pks.tab.basic">Basics</span></button>
        <button class="tabs__item" type="button" role="tab" aria-selected="false" data-pks-tab="items"><span data-i18n="pks.tab.items">Items</span><span class="tabs__item-count" data-pks-item-count>0</span></button>
        <button class="tabs__item" type="button" role="tab" aria-selected="false" data-pks-tab="scanner"><span data-i18n="pks.tab.scanner">Password</span></button>
      </nav>

      <div data-pks-panels>
        <!-- Tab · basics -->
        <section class="tab-panel tab-panel--active" role="tabpanel" data-pks-panel="basic">
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
        </section>

        <!-- Tab · items — single search-to-add combobox (products + tickets); focus opens a suggestion dropdown -->
        <section class="tab-panel" role="tabpanel" data-pks-panel="items">
          <p class="pks-panel__intro" data-i18n="pks.sec.items.sub">Add at least one product or event ticket.</p>
          <div class="combobox" data-pks-combo>
            <div class="tag-input__field" data-pks-field>
              <input class="tag-input__entry" type="search" data-pks-search role="combobox" aria-expanded="false" aria-autocomplete="list" autocomplete="off" placeholder="Search products or tickets by name…" data-i18n-placeholder="pks.search.ph">
              <i data-lucide="chevron-down" class="combobox__chevron ztor-icon"></i>
            </div>
            <div class="combobox__menu" data-pks-menu hidden></div>
          </div>
        </section>

        <!-- Tab · scanner -->
        <section class="tab-panel" role="tabpanel" data-pks-panel="scanner">
          <label class="field">
            <span class="field__label"><span data-i18n="pks.f.pw">Scanner password</span> <span class="field__req">*</span></span>
            <input class="input" type="password" data-pks-pw placeholder="Staff enter this to scan" data-i18n-placeholder="pks.f.pw.ph" autocomplete="new-password">
            <span class="field__hint" data-i18n="pks.f.pw.hint">Staff type this after opening the scanner URL. Changing it later signs out active scanners.</span>
          </label>
        </section>
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
    var modal = null, lastFocused = null, selected = [];

    function chrome(el) {
      if (window.ztorIcons) window.ztorIcons.applyIcons(el);
      if (window.applyI18n) window.applyI18n(el);
    }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function itemById(id) { for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i]; return null; }
    function iconFor(kind) { return kind === 'ticket' ? 'ticket' : 'package'; }

    /* Search-to-add combobox (spec 5.1.5.12 §4 F2): ONE field. Selected items
       show as removable chips; focusing / typing opens a suggestion dropdown of
       not-yet-added products + tickets, filtered by name/meta. Reuses .tag-input
       (field + chips) + .combobox (menu). */
    function renderChips() {
      var field = modal.querySelector('[data-pks-field]');
      var search = field.querySelector('[data-pks-search]');
      field.querySelectorAll('.chip').forEach(function (c) { c.remove(); });
      selected.forEach(function (id) {
        var it = itemById(id); if (!it) return;
        var chip = document.createElement('span');
        chip.className = 'chip chip--removable';
        chip.innerHTML = '<span>' + esc(it.name) + '</span>' +
          '<button class="chip__remove" type="button" data-pks-remove="' + esc(id) + '" aria-label="Remove"><i data-lucide="x" class="ztor-icon"></i></button>';
        field.insertBefore(chip, search);
      });
      if (window.ztorIcons) window.ztorIcons.applyIcons(field);
    }
    function renderMenu() {
      var menu = modal.querySelector('[data-pks-menu]');
      var q = (modal.querySelector('[data-pks-search]').value || '').trim().toLowerCase();
      var groups = [['product', 'pks.items'], ['ticket', 'pks.tickets']];
      var html = '', total = 0;
      groups.forEach(function (g) {
        var avail = ITEMS.filter(function (it) {
          return it.kind === g[0] && selected.indexOf(it.id) < 0 &&
            (!q || (it.name + ' ' + it.meta).toLowerCase().indexOf(q) >= 0);
        });
        if (!avail.length) return;
        total += avail.length;
        html += '<div class="combobox__group" data-i18n="' + g[1] + '"></div>';
        avail.forEach(function (it) {
          html += '<button type="button" class="combobox__opt" data-pks-add="' + esc(it.id) + '">' +
            '<span class="combobox__opt-icon"><i data-lucide="' + iconFor(it.kind) + '" class="ztor-icon" style="width:16px;height:16px"></i></span>' +
            '<span class="combobox__opt-text"><span class="combobox__opt-name">' + esc(it.name) + '</span>' +
            '<span class="combobox__opt-meta">' + esc(it.meta) + '</span></span></button>';
        });
      });
      if (!total) html = '<div class="combobox__empty" data-i18n="pks.search.empty">No items match your search.</div>';
      menu.innerHTML = html;
      chrome(menu);
    }
    function openMenu() { renderMenu(); var m = modal.querySelector('[data-pks-menu]'); if (m) m.hidden = false; setExpanded(true); }
    function closeMenu() { var m = modal.querySelector('[data-pks-menu]'); if (m) m.hidden = true; setExpanded(false); }
    function setExpanded(on) { var s = modal.querySelector('[data-pks-search]'); if (s) s.setAttribute('aria-expanded', on ? 'true' : 'false'); }
    function addItem(id) { if (id && selected.indexOf(id) < 0) selected.push(id); var s = modal.querySelector('[data-pks-search]'); if (s) s.value = ''; renderChips(); renderMenu(); syncCreateEnabled(); }
    function removeItem(id) { var i = selected.indexOf(id); if (i >= 0) selected.splice(i, 1); renderChips(); renderMenu(); syncCreateEnabled(); }
    /* No draft state (D112) — a session needs ≥1 item/ticket before it can be created.
       Also refreshes the items-tab count badge so the requirement's location stays
       visible from any tab. */
    function syncCreateEnabled() {
      var btn = modal.querySelector('[data-pks-create]');
      if (btn) btn.disabled = selected.length === 0;
      var badge = modal.querySelector('[data-pks-item-count]');
      if (badge) badge.textContent = selected.length;
    }
    /* Switch the active tab + panel (shared .tabs / .tab-panel wiring). */
    function setTab(name) {
      modal.querySelectorAll('[data-pks-tab]').forEach(function (t) {
        var on = t.getAttribute('data-pks-tab') === name;
        t.classList.toggle('tabs__item--active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      modal.querySelectorAll('[data-pks-panel]').forEach(function (p) {
        p.classList.toggle('tab-panel--active', p.getAttribute('data-pks-panel') === name);
      });
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
      if (selected.length === 0) { setTab('items'); syncCreateEnabled(); return; }
      if (!updateTimeErr()) { setTab('basic'); return; }   /* route to the tab that holds the error */
      var name = (modal.querySelector('[data-pks-name]').value || '').trim();
      var slug = (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'session').slice(0, 18);
      modal.querySelector('[data-pks-url]').textContent = 'ztor.app/scan/' + slug + '-' + Math.random().toString(36).slice(2, 7);
      fillQr(Math.floor(Math.random() * 40) + 5);
      step('result');
      if (hooks.onCreate) hooks.onCreate({ name: name, items: selected.length });
    }

    function onClick(e) {
      if (e.target === modal) { close(); return; }
      var tab = e.target.closest('[data-pks-tab]');
      if (tab) { setTab(tab.getAttribute('data-pks-tab')); return; }
      var add = e.target.closest('[data-pks-add]');
      if (add) { addItem(add.getAttribute('data-pks-add')); var si = modal.querySelector('[data-pks-search]'); if (si) si.focus(); return; }
      var rm = e.target.closest('[data-pks-remove]');
      if (rm) { e.preventDefault(); removeItem(rm.getAttribute('data-pks-remove')); return; }
      if (e.target.closest('[data-pks-field]')) { var sf = modal.querySelector('[data-pks-search]'); if (sf) sf.focus(); return; }
      if (e.target.closest('[data-pks-close]')) { close(); return; }
      if (e.target.closest('[data-pks-create]')) { create(); return; }
      if (e.target.closest('[data-pks-copy]')) {
        var url = modal.querySelector('[data-pks-url]').textContent;
        if (navigator.clipboard) navigator.clipboard.writeText(url).catch(function () {});
        return;
      }
      if (!e.target.closest('[data-pks-combo]')) closeMenu();   /* click outside the picker closes the dropdown */
    }
    function onKey(e) {
      if (e.key !== 'Escape' || !modal || modal.hidden) return;
      var m = modal.querySelector('[data-pks-menu]');
      if (m && !m.hidden) { closeMenu(); return; }   /* Esc closes the dropdown first, then the modal */
      close();
    }

    function ensure() {
      if (modal) return true;
      var html = window.ZTOR_PARTIALS && window.ZTOR_PARTIALS.pickupSessionModal;
      if (!html) { console.warn('[pickup] template missing — is partials/pickup-session-modal.js loaded?'); return false; }
      host.innerHTML = html;
      chrome(host);
      modal = host.querySelector('[data-pickup-modal]');
      modal.addEventListener('click', onClick);
      modal.addEventListener('change', function (e) {
        if (e.target.matches('[data-pks-start],[data-pks-end]')) updateTimeErr();
      });
      modal.addEventListener('input', function (e) {
        if (e.target.matches('[data-pks-search]')) openMenu();
      });
      modal.addEventListener('focusin', function (e) {
        if (e.target.matches('[data-pks-search]')) openMenu();
      });
      document.addEventListener('keydown', onKey);
      return true;
    }
    function open(preselectId, titleKey) {
      lastFocused = document.activeElement;
      step('form');
      setTab('basic');   /* always land on the first tab */
      updateTimeErr();
      selected = preselectId ? [preselectId] : [];
      var search = modal.querySelector('[data-pks-search]');
      if (search) search.value = '';
      renderChips();
      closeMenu();
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
