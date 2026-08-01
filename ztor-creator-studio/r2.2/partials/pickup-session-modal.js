window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* Pickup session modal · spec 5.1.5.11 F3 (E-Shop · Pickup Management · D111).
   The ONE shared create/edit popup, loaded as a <script> on pickup.html,
   create-product.html and product-detail.html (file:// safe). From a product
   context it pre-adds that product to "pickup items" but the creator can still
   add other items and event tickets.

   2026-08-01 改版（使用者裁決）：三頁籤 → 兩步流程，result step 撤除。
     · step 1「這場是什麼」— 名稱／地點／起訖／說明，加上**選填**的掃碼密碼（已預先
       產生一組）；編輯場次時多出掃碼網址的重設與停用（原本在詳情頁 F2 那張卡上）。
     · step 2「可以領什麼」— ONE search-to-add combobox（已選項目是可移除的 chip）。
   刻意不放 stepper：只有兩步，dialog 副標與「上一步／下一步」已經說明位置。
   建立成功不再顯示 result（QR＋URL），改由 hooks.onCreate 讓 consumer 落地到場次詳情頁——
   那頁的行動卡右欄本來就有同一組網址與密碼，再做一次是重複的 UI。
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
        <p class="text-sub" style="margin:6px 0 0;font-size:var(--fs-13)" data-pks-sub data-i18n="pks.step1.sub">First, set where and when this session runs.</p>
      </div>
      <button class="btn btn--icon" type="button" aria-label="Close" data-i18n-aria-label="pks.close" data-pks-close><i data-lucide="x" class="ztor-icon"></i></button>
    </div>

    <!-- STEP 1 / 2 · form — 兩步流程（spec 5.1.5.12 §4）：
         step 1「這場是什麼」＝名稱／地點／起訖／說明＋選填掃碼密碼（編輯時多出掃碼網址的
         重設與停用）；step 2「可以領什麼」＝項目 combobox。一次只顯示一步，不放 stepper。 -->
    <div class="payout-dialog__body" data-pks-form>
      <section class="pks-step" data-pks-step="basic">
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
        <!-- 掃碼密碼＝工作人員那支掃碼器網址的鎖，屬於這場的基本設定。已預先產生一組。 -->
        <label class="field mt-16">
          <span class="field__label" data-i18n="pks.f.pw.opt">Scanner password (optional)</span>
          <div class="input-action">
            <input class="input" type="text" data-pks-pw autocomplete="off">
            <button class="btn btn--outline btn--sm" type="button" data-pks-pwgen><i data-lucide="refresh-cw" class="ztor-icon"></i> <span data-i18n="pks.f.pw.gen">Regenerate</span></button>
          </div>
        </label>
        <!-- 掃碼網址的重設／停用：只在編輯場次時出現（建立當下網址還沒產生） -->
        <label class="field mt-16" data-pks-editonly hidden>
          <span class="field__label" data-i18n="pks.f.url">Scanner URL</span>
          <div class="input-action">
            <input class="input" data-pks-url readonly>
            <button class="btn btn--outline btn--sm" type="button" data-pks-urlreset><i data-lucide="refresh-cw" class="ztor-icon"></i> <span data-i18n="pks.f.url.reset">Reset</span></button>
            <button class="btn btn--outline btn--sm" type="button" data-pks-urltoggle data-i18n="pks.f.url.off">Disable</button>
          </div>
          <span class="field__hint" data-i18n="pks.f.url.hint">Resetting invalidates the old URL immediately; on-site devices must reopen the new one. Changing the password signs out active scanners.</span>
        </label>
      </section>

      <!-- step 2 — single search-to-add combobox (products + tickets); focus opens a suggestion dropdown -->
      <section class="pks-step" data-pks-step="items" hidden>
        <p class="pks-step__intro" data-i18n="pks.items.sub">Add at least one product or event ticket. What you add here is what you need to bring on the day.</p>
        <div class="combobox" data-pks-combo>
          <div class="tag-input__field" data-pks-field>
            <input class="tag-input__entry" type="search" data-pks-search role="combobox" aria-expanded="false" aria-autocomplete="list" autocomplete="off" placeholder="Search products or tickets by name…" data-i18n-placeholder="pks.search.ph">
            <i data-lucide="chevron-down" class="combobox__chevron ztor-icon"></i>
          </div>
          <div class="combobox__menu" data-pks-menu hidden></div>
        </div>
      </section>
    </div>

    <!-- 2026-08-01：原本的 result step（QR＋scanner URL）已撤除。建立成功直接落地到
         場次詳情頁，那頁的行動卡右欄本來就有同一組網址與密碼，這裡再做一次是重複的 UI。 -->

    <!-- 「Cancel」已移除：右上角的 × 就是取消，兩個出口是重複的。
         也不再寫「還差什麼」——必填星號＋灰掉的按鈕已經說明還不能送出。 -->
    <div class="payout-dialog__foot" data-pks-foot-form>
      <span style="margin-left:auto"></span>
      <button class="btn btn--ghost" type="button" data-pks-back hidden><i data-lucide="chevron-left" class="ztor-icon"></i> <span data-i18n="pks.back">Back</span></button>
      <button class="btn btn--primary" type="button" data-pks-next disabled><span data-i18n="pks.next">Next</span> <i data-lucide="chevron-right" class="ztor-icon"></i></button>
      <button class="btn btn--primary" type="button" data-pks-create data-i18n="pks.create" disabled hidden>Create session</button>
    </div>
  </section>
</div>`;

  window.ZTOR_PARTIALS.createPickupSession = function (host, hooks) {
    hooks = hooks || {};
    var modal = null, lastFocused = null, selected = [], step = 1;

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
    /* 兩步各自檢查自己的必填：step 1 名稱＋地點＋時間先後，step 2 至少 1 個項目
       （D112 無草稿態）。掃碼密碼自 2026-08-01 起是選填，不進這份檢查。 */
    function syncCreateEnabled() {
      var ok = step === 1
        ? (!!val('[data-pks-name]') && !!val('[data-pks-loc]') && validTime())
        : selected.length > 0;
      var btn = modal.querySelector(step === 1 ? '[data-pks-next]' : '[data-pks-create]');
      if (btn) btn.disabled = !ok;
    }
    function val(sel) { var el = modal.querySelector(sel); return el ? el.value.trim() : ''; }
    /* 一次只顯示一步；副標與上一步／下一步負責表達位置，不放 stepper。 */
    function setStep(n) {
      step = n;
      modal.querySelectorAll('[data-pks-step]').forEach(function (p) {
        p.hidden = p.getAttribute('data-pks-step') !== (n === 1 ? 'basic' : 'items');
      });
      var sub = modal.querySelector('[data-pks-sub]');
      /* applyI18n 只掃 root 的後代，所以要傳 sub 的父層進去（傳 sub 自己不會生效） */
      if (sub) { sub.setAttribute('data-i18n', n === 1 ? 'pks.step1.sub' : 'pks.step2.sub'); if (window.applyI18n) window.applyI18n(sub.parentNode); }
      modal.querySelector('[data-pks-back]').hidden = n !== 2;
      modal.querySelector('[data-pks-next]').hidden = n !== 1;
      modal.querySelector('[data-pks-create]').hidden = n !== 2;
      modal.querySelector('[data-pks-form]').scrollTop = 0;
      syncCreateEnabled();
      /* 進到第二步就把游標放進搜尋框並展開建議清單。延到下一輪 tick——在同一個 click
         事件裡對剛從 [hidden] 放出來的元素呼叫 focus()，瀏覽器會忽略。 */
      if (n === 2) setTimeout(function () {
        var s = modal.querySelector('[data-pks-search]');
        if (s) { s.focus(); openMenu(); }
      }, 0);
    }
    function genPw() { return Math.random().toString(36).slice(2, 8) + '26'; }
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
    /* 建立成功＝關閉彈窗、交給 consumer 落地到場次詳情頁（result step 已撤除）。 */
    function create() {
      if (selected.length === 0) { setStep(2); return; }
      if (!updateTimeErr()) { setStep(1); return; }
      var name = (modal.querySelector('[data-pks-name]').value || '').trim();
      var slug = (name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'session').slice(0, 18);
      close();
      if (hooks.onCreate) hooks.onCreate({
        name: name,
        items: selected.length,
        password: val('[data-pks-pw]'),
        url: 'ztor.app/scan/' + slug + '-' + Math.random().toString(36).slice(2, 7)
      });
    }

    function onClick(e) {
      if (e.target === modal) { close(); return; }
      if (e.target.closest('[data-pks-next]')) { setStep(2); return; }
      if (e.target.closest('[data-pks-back]')) { setStep(1); return; }
      if (e.target.closest('[data-pks-pwgen]')) {
        modal.querySelector('[data-pks-pw]').value = genPw();
        return;
      }
      if (e.target.closest('[data-pks-urlreset]')) {
        modal.querySelector('[data-pks-url]').value = 'ztor.app/scan/session-' + Math.random().toString(36).slice(2, 7);
        return;
      }
      var tgl = e.target.closest('[data-pks-urltoggle]');
      if (tgl) {
        var off = tgl.getAttribute('data-i18n') === 'pks.f.url.off';
        tgl.setAttribute('data-i18n', off ? 'pks.f.url.on' : 'pks.f.url.off');
        modal.querySelector('[data-pks-url]').style.opacity = off ? '.45' : '';
        if (window.applyI18n) window.applyI18n(tgl);
        return;
      }
      var add = e.target.closest('[data-pks-add]');
      if (add) { addItem(add.getAttribute('data-pks-add')); var si = modal.querySelector('[data-pks-search]'); if (si) si.focus(); return; }
      var rm = e.target.closest('[data-pks-remove]');
      if (rm) { e.preventDefault(); removeItem(rm.getAttribute('data-pks-remove')); return; }
      if (e.target.closest('[data-pks-field]')) { var sf = modal.querySelector('[data-pks-search]'); if (sf) sf.focus(); return; }
      if (e.target.closest('[data-pks-close]')) { close(); return; }
      if (e.target.closest('[data-pks-create]')) { create(); return; }
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
        syncCreateEnabled();   /* step 1 的名稱／地點也要即時解鎖「下一步」 */
      });
      modal.addEventListener('focusin', function (e) {
        if (e.target.matches('[data-pks-search]')) openMenu();
      });
      document.addEventListener('keydown', onKey);
      return true;
    }
    function open(preselectId, titleKey) {
      lastFocused = document.activeElement;
      var isEdit = titleKey === 'pks.title.edit';
      updateTimeErr();
      selected = preselectId ? [preselectId] : [];
      var search = modal.querySelector('[data-pks-search]');
      if (search) search.value = '';
      /* 掃碼密碼預先產生：創作者不想管就直接下一步；要自訂再改 */
      modal.querySelector('[data-pks-pw]').value = genPw();
      /* 掃碼網址的重設／停用只在編輯場次時出現——建立當下網址還沒產生 */
      modal.querySelectorAll('[data-pks-editonly]').forEach(function (el) { el.hidden = !isEdit; });
      if (isEdit) modal.querySelector('[data-pks-url]').value = 'ztor.app/scan/tpe-signing-7f3a2';
      modal.querySelector('[data-pks-create]').setAttribute('data-i18n', isEdit ? 'pks.save' : 'pks.create');
      renderChips();
      closeMenu();
      setStep(1);
      var title = modal.querySelector('#pickup-dialog-title');
      title.setAttribute('data-i18n', titleKey || 'pks.title');
      if (window.applyI18n) window.applyI18n(modal);
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
