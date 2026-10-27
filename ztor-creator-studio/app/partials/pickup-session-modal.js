window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* Pickup session modal · spec 5.1.5.11 F3 (E-Shop · Pickup Management · D111).
   The ONE shared create/edit popup, loaded as a <script> on pickup.html,
   create-product.html and product-detail.html (file:// safe). From a product
   context it pre-adds that product to "pickup items" but the creator can still
   add other items and event tickets.

   2026-08-01 改版（使用者裁決）：三頁籤 → 兩步流程，result step 撤除。
     · step 1「這場是什麼」— 名稱／地點／起訖／說明，加上**必填**的掃碼密碼（D455；已預先
       產生一組）；編輯場次時多出掃碼網址的重設與停用（原本在詳情頁 F2 那張卡上）。
     · step 2「可以領什麼」— ONE search-to-add combobox（已選項目是可移除的 chip）。
   刻意不放 stepper：只有兩步，dialog 副標與「上一步／下一步」已經說明位置。
   建立成功不再顯示 result（QR＋URL），改由 hooks.onCreate 讓 consumer 落地到場次詳情頁——
   那頁的行動卡右欄本來就有同一組網址與密碼，再做一次是重複的 UI。
   Fields use the canonical .field / .form-grid system (field-system.css /
   form-grid.css); the retired .payout-field* classes were dropped 2026-07-17.
   The item picker reuses .tag-input (field + chips) + .combobox (dropdown).

   createPickupSession(host, hooks) → { openBlank, openExisting,
   openForProduct(id | { name, meta }), close }. hooks: { onCreate(session) }.
   UI chrome = data-i18n; sample item/ticket lists are literals. */
(function () {
  /* 2026-10-10（D393）：組合包不可直接加入取貨場次，清單不放組合商品。組合下單時展開成
     成員原子商品的領取單位（D240），成員各自沿用自己商品的場次（一商品一場次，D339）；
     成員可能分屬不同場次，組合包無法同時屬於兩場，所以場次沒有組合包的入口。 */
  /* 2026-09-30（D339 一商品一場次）：`session`＝這件商品目前綁在哪一場（key 同下方 KNOWN：
     tpe＝台北簽書會、khh＝高雄見面會），沒寫＝還沒綁。建立或編輯「別的」場次時，已綁定的商品
     仍列在下拉裡，但停用並標「已綁定」；編輯本場次時，本場次自己的商品照常可選可移除。
     樣本分配與編輯示範對齊：編輯的是 tpe，所以 zine／tee 屬 tpe；poster 屬 khh，
     讓建立與編輯兩種情境都看得到停用列；lp 留白，建立新場次時仍有一件可選。 */
  /* 2026-10-22（D470 取貨方式改勾選；D471 修訂 D470）：商品來源＝取貨方式勾了現場 QR 領取的單售商品（`delivery` 含 'qr'，
     可同時勾物流配送）；只勾物流配送的不列（下面的 pin 就是對照）。單售商品仍只屬於一個場次——上面 D339 的
     「已綁定」標示與停用照舊（D471 保留）。 */
  var PRODUCTS = [
    { id: 'zine', kind: 'product', name: 'Pirate Queen zine vol. 02', meta: 'Books · 40 sold', delivery: ['ship', 'qr'], session: 'tpe' },
    { id: 'tee',  kind: 'product', name: 'Kowloon After Dark tee · M / L', meta: 'Apparel · 22 sold', delivery: ['qr'], session: 'tpe' },
    { id: 'lp',   kind: 'product', name: 'Kowloon After Dark vinyl LP', meta: 'Music · numbered', delivery: ['qr'] },
    { id: 'poster', kind: 'product', name: 'Kowloon After Dark tour poster', meta: 'Prints · 60 sold', delivery: ['ship', 'qr'], session: 'khh' },
    { id: 'pin',  kind: 'product', name: 'Neon sign enamel pin', meta: 'Accessories · shipping only', delivery: ['ship'] }
  ].filter(function (p) { return p.delivery.indexOf('qr') >= 0; });
  var TICKETS = [
    { id: 'sign', kind: 'ticket', name: 'Signing session · GA entry', meta: 'Taipei signing · on-site entry' },
    { id: 'meet', kind: 'ticket', name: 'Fan-meet · VIP', meta: 'Kaohsiung fan-meet · on-site entry' }
  ];
  var ITEMS = PRODUCTS.concat(TICKETS);
  /* 2026-09-14（使用者：「預設應該要有當前創建的商品」）：從建立商品／商品細節開彈窗時，
     預選的是**這件商品本身**（名字取自頁面），不再拿樣本清單的第一顆充數。它不在 ITEMS 裡，
     用 CURRENT 掛著；只會出現在 chip，不會出現在下拉（開場就已選中）。 */
  var CURRENT = null;

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
         step 1「這場是什麼」＝名稱／地點／起訖／說明＋必填掃碼密碼（編輯時多出掃碼網址的
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
        <!-- 掃碼密碼＝工作人員那支掃碼器網址的鎖，屬於這場的基本設定。已預先產生一組。
             2026-10-20 D455（B10，5.1.5.12 F3）：必填——清空就不能按「下一步」。 -->
        <label class="field mt-16">
          <span class="field__label"><span data-i18n="pks.f.pw">Scanner password</span> <span class="field__req">*</span></span>
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
    var modal = null, lastFocused = null, selected = [], step = 1, editingSession = null;

    function chrome(el) {
      if (window.ztorIcons) window.ztorIcons.applyIcons(el);
      if (window.applyI18n) window.applyI18n(el);
    }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function itemById(id) { if (CURRENT && CURRENT.id === id) return CURRENT; for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i]; return null; }
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
        /* 可選的排前面、已綁定的沉到組尾（D339） */
        avail.sort(function (a, b) { return isBound(a) - isBound(b); });
        if (!avail.length) return;
        total += avail.length;
        html += '<div class="combobox__group" data-i18n="' + g[1] + '"></div>';
        avail.forEach(function (it) {
          var bound = isBound(it);
          html += '<button type="button" class="combobox__opt"' +
            (bound ? ' disabled aria-disabled="true"' : ' data-pks-add="' + esc(it.id) + '"') + '>' +
            '<span class="combobox__opt-icon"><i data-lucide="' + iconFor(it.kind) + '" class="ztor-icon" style="width:16px;height:16px"></i></span>' +
            '<span class="combobox__opt-text"><span class="combobox__opt-name">' + esc(it.name) + '</span>' +
            '<span class="combobox__opt-meta">' + esc(it.meta) + '</span></span>' +
            (bound ? '<span class="badge badge--neutral combobox__opt-tag"><span data-i18n="pks.bound">Assigned</span></span>' : '') +
            '</button>';
        });
      });
      if (!total) html = '<div class="combobox__empty" data-i18n="pks.search.empty">No items match your search.</div>';
      menu.innerHTML = html;
      chrome(menu);
    }
    /* D339：商品已綁在「另一場」就不能再加；編輯中的這一場（editingSession）自己的商品不算 */
    function isBound(it) { return !!(it.session && it.session !== editingSession); }
    function openMenu() { renderMenu(); var m = modal.querySelector('[data-pks-menu]'); if (m) m.hidden = false; setExpanded(true); }
    function closeMenu() { var m = modal.querySelector('[data-pks-menu]'); if (m) m.hidden = true; setExpanded(false); }
    function setExpanded(on) { var s = modal.querySelector('[data-pks-search]'); if (s) s.setAttribute('aria-expanded', on ? 'true' : 'false'); }
    function addItem(id) { if (id && selected.indexOf(id) < 0) selected.push(id); var s = modal.querySelector('[data-pks-search]'); if (s) s.value = ''; renderChips(); renderMenu(); syncCreateEnabled(); }
    function removeItem(id) { var i = selected.indexOf(id); if (i >= 0) selected.splice(i, 1); renderChips(); renderMenu(); syncCreateEnabled(); }
    /* 兩步各自檢查自己的必填：step 1 名稱＋地點＋時間先後，step 2 至少 1 個項目
       （D112 無草稿態）。掃碼密碼 2026-10-20 起改回必填（D455 B10），一起檢查。 */
    function syncCreateEnabled() {
      var ok = step === 1
        ? (!!val('[data-pks-name]') && !!val('[data-pks-loc]') && validTime() && !!val('[data-pks-pw]'))
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
      /* 2026-09-14（使用者：「預設不用把下拉點開，現在點擊下一步就會是展開的」）：
         進到第二步不再自動把游標放進搜尋框、也不展開建議清單——從商品開的場次已經帶著
         這件商品，先讓人看到已選的 chip；要加別的再點搜尋框（focusin 才展開）。 */
      if (n === 2) closeMenu();
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
        /* 2026-09-11：建立商品要在選單下方列出剛建的場次資訊，所以地點、起訖與說明也交出去。 */
        loc: val('[data-pks-loc]'),
        start: val('[data-pks-start]'),
        end: val('[data-pks-end]'),
        instr: val('[data-pks-instr]'),
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
        syncCreateEnabled();   /* 密碼必填（D455）：清空後按重新產生要即時解鎖「下一步」 */
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
      editingSession = isEdit ? 'tpe' : null;
      updateTimeErr();
      /* 編輯既有場次＝台北簽書會那一場，項目已經選好（單售商品；組合包不可直接加入，D393）；
         建立新場次則從空的開始。 */
      selected = preselectId ? [preselectId] : (isEdit ? ['zine', 'tee'] : []);
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
      /* openForProduct('zine') 仍可用（樣本 id）；傳 { name, meta? } 就以那件商品當預選（見 CURRENT） */
      openForProduct: function (idOrItem) {
        if (!ensure()) return;
        if (idOrItem && typeof idOrItem === 'object') {
          CURRENT = { id: 'current', kind: 'product', name: idOrItem.name || '', meta: idOrItem.meta || '' };
          open('current', 'pks.title');
        } else { CURRENT = null; open(idOrItem || 'zine', 'pks.title'); }
      },
      close: close
    };
  };
})();

/* ── 選單底下的場次資訊（2026-09-11 使用者指示）────────────────────────────
   建立商品／商品細節的「取貨場次」選了一個（或剛建好一個）之後，選單底下要列出那個場次
   的地點、時間、狀態與前往取貨管理的入口。同一份邏輯兩頁共用，放在這裡是因為建立場次的
   彈窗也住在這裡——「剛建好的場次長什麼樣」只有這支知道。

   用法：
     var info = window.ZTOR_PARTIALS.bindPickupSessionInfo(selectEl, hostEl);
     info.addCreated(session)   // 彈窗 onCreate 交來的物件 → 新增一個選項、選中並列出資訊

   host 是頁面放好的 .fact-list，裡面用 data-*-si-loc / -time / -status / -link 標出各格
   （前綴由 host 的 data-*-session-info 屬性決定）。
   已知的示範場次對應 pickup-detail 既有的 i18n key，切語言跟著換；剛建的場次是使用者輸入，
   直接顯示字面值。 */
(function () {
  'use strict';
  var T = function (k, fb) { return (window.i18nT && window.i18nT(k)) || fb || ''; };
  /* 示範資料：與 pickup-detail.html 的 SESSIONS 同一批 key。 */
  var KNOWN = {
    tpe: { loc: 'pk.detail.loc', time: 'pk.detail.time', st: 'pk.status.active', tone: 'success', s: 'active' },
    khh: { loc: 'pk.s2.loc',     time: 'pk.s2.time',     st: 'pk.st.scheduled',  tone: 'neutral', s: 'scheduled' }
  };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  /* datetime-local 兩個值 → 「7/12 13:00 – 17:00」；跨日就把日期各寫一次。 */
  function fmtRange(start, end) {
    var a = start ? new Date(start) : null, b = end ? new Date(end) : null;
    if (!a || isNaN(a)) return '';
    var day = function (d) { return (d.getMonth() + 1) + '/' + d.getDate(); };
    var hm = function (d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
    if (!b || isNaN(b)) return day(a) + ' ' + hm(a);
    var same = a.toDateString() === b.toDateString();
    return day(a) + ' ' + hm(a) + ' – ' + (same ? '' : day(b) + ' ') + hm(b);
  }

  window.ZTOR_PARTIALS.bindPickupSessionInfo = function (sel, host) {
    if (!sel || !host) return null;
    var attr = Array.prototype.filter.call(host.attributes, function (a) { return /^data-\w+-session-info$/.test(a.name); })[0];
    var pfx = attr ? attr.name.replace(/^data-(\w+)-session-info$/, '$1') : 'cp';
    var q = function (k) { return host.querySelector('[data-' + pfx + '-si-' + k + ']'); };
    var created = {};   /* value → 使用者剛建的場次 */

    function paint() {
      var v = sel.value;
      var k = KNOWN[v], c = created[v];
      if (!k && !c) { host.hidden = true; return; }
      host.hidden = false;
      var loc = q('loc'), time = q('time'), st = q('status'), link = q('link');
      if (k) {
        if (loc)  { loc.setAttribute('data-i18n', k.loc);   loc.textContent = T(k.loc); }
        if (time) { time.setAttribute('data-i18n', k.time); time.textContent = T(k.time); }
        if (st)   { st.className = 'badge badge--' + k.tone; st.firstElementChild.setAttribute('data-i18n', k.st); st.firstElementChild.textContent = T(k.st); }
        if (link) link.setAttribute('href', 'pickup-detail.html?s=' + k.s);
      } else {
        /* 使用者輸入的值是資料，不掛 i18n key——否則切語言會被抹掉。 */
        if (loc)  { loc.removeAttribute('data-i18n');  loc.textContent = c.loc || '—'; }
        if (time) { time.removeAttribute('data-i18n'); time.textContent = fmtRange(c.start, c.end) || '—'; }
        if (st)   { st.className = 'badge badge--neutral'; st.firstElementChild.setAttribute('data-i18n', 'pk.st.scheduled'); st.firstElementChild.textContent = T('pk.st.scheduled', 'Scheduled'); }
        if (link) link.setAttribute('href', 'pickup-detail.html?s=scheduled');
      }
    }
    sel.addEventListener('change', paint);
    document.addEventListener('i18n:applied', paint);
    paint();

    return {
      paint: paint,
      /* 剛建好的場次：加成一個選項、選中它、列出資訊。名字是使用者輸入，不進 i18n。 */
      addCreated: function (session) {
        var v = 'new-' + Date.now().toString(36);
        created[v] = session || {};
        var o = document.createElement('option');
        o.value = v;
        o.textContent = (session && session.name) || T('pks.title', 'New pickup session');
        sel.insertBefore(o, sel.querySelector('option[value="__new"]'));   /* 原生選單的「建立」選項（組合包頁）維持在最後 */
        sel.value = v;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        return v;
      }
    };
  };
})();

/* ── 組合包的取貨場次（D471，2026-10-22 使用者裁決，修訂 D470）──────────────────
   組合包沒有自己的取貨方式，成員照各自商品的設定；取貨場次預設「繼承」（各成員沿用自己商品的場次，
   每個成員有自己的場次），也可以改用組合包自己的一個場次——設了以後，這個組合包的成員領取單位都屬於
   這一場（D240 不變：領取單位仍逐成員各一個，組合包本身不產生領取碼）。
   建立組合包（create-bundle）與組合詳情（bundle-detail）的「取貨與核銷」區共用這一支：
     var api = window.ZTOR_PARTIALS.mountBundlePickup(host, {
       members: () => [{ name, product }],   // 目前的商品成員（product＝products-store 記錄，取貨方式經 ztorDelivery 讀）
       value: 'khh' | null,                   // 組合包自己的場次；null＝繼承
       onChange: function (key|null) {},      // 開關或選單改了
       onCreate: function (done) {},          // 選單底部「建立取貨場次」：頁面開彈窗，建好呼叫 done(session)
       confirm: function (chg, proceed, revert) {}   // 選填（D472）：有效場次要變之前先問；組合詳情給、建立組合包不給
     });
     api.refresh()   // 成員變了就重畫成員列
     api.get()       // 目前的值（開關關＝null）
   畫面：成員列（.data-list，每列寫出該成員勾的取貨方式與場次）＋開關列「改用組合包自己的場次」（.control-group，
   開了才出現場次下拉與場次資訊 .fact-list，沿用上面的 bindPickupSessionInfo）。
   開關開著但還沒選場次＝沒有自己的場次，存成 null（＝繼承；ASSUMPTIONS UIA-291）。 */
(function () {
  'use strict';
  var T = function (k, fb) { return (window.i18nT && window.i18nT(k)) || fb || ''; };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var SHELL =
    '<div class="data-list" data-bp-list></div>' +
    '<div class="control-group mt-16" data-feat="S34.1" data-bp-own>' +
      '<div class="control-row">' +
        '<div><div class="control-row__main" data-i18n="bd.pickup.own">Use the bundle’s own pickup session</div>' +
        '<div class="control-row__sub" data-i18n="bd.pickup.own.sub">Every member’s pickup units go to this session.</div></div>' +
        '<div class="switch" role="switch" aria-checked="false" tabindex="0" data-bp-toggle data-i18n-aria-label="bd.pickup.own" aria-label="Use the bundle’s own pickup session"></div>' +
      '</div>' +
      '<div class="control-group__body" data-bp-body hidden>' +
        '<div class="field" style="margin-bottom:0">' +
          '<div class="field__label" data-i18n="bd.pickup.own.label">Bundle pickup session</div>' +
          '<select class="select" data-bp-select data-zselect-action="new-session" data-zselect-action-i18n="cp.delivery.session.new" data-zselect-action-label="Create pickup session" data-zselect-action-icon="plus">' +
            '<option value="" data-i18n="cp.delivery.session.none">Not linked yet</option>' +
            '<option value="tpe" data-i18n="cp.delivery.session.tpe">Taipei signing — pickup (today)</option>' +
            '<option value="khh" data-i18n="cp.delivery.session.khh">Kaohsiung fan-meet — pickup (Jul 12)</option>' +
          '</select>' +
          '<div class="fact-list" data-bp-session-info hidden>' +
            '<div class="fact-list__item"><span data-i18n="cp.delivery.session.loc">Location</span><span data-bp-si-loc></span></div>' +
            '<div class="fact-list__item"><span data-i18n="cp.delivery.session.time">Time</span><span data-bp-si-time></span></div>' +
            '<div class="fact-list__item"><span data-i18n="cp.delivery.session.status">Status</span><span><span class="badge" data-bp-si-status><span></span></span></span></div>' +
            '<div class="fact-list__item"><span data-i18n="cp.delivery.session.manage">Pickup management</span><span><a class="card__link" href="pickup-detail.html" data-bp-si-link data-view-safe data-i18n="cp.delivery.session.view">View session</a></span></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  window.ZTOR_PARTIALS.mountBundlePickup = function (host, opts) {
    if (!host) return null;
    opts = opts || {};
    host.innerHTML = SHELL;
    if (window.applyI18n) window.applyI18n(host);
    var list = host.querySelector('[data-bp-list]');
    var tgl = host.querySelector('[data-bp-toggle]');
    var body = host.querySelector('[data-bp-body]');
    var sel = host.querySelector('[data-bp-select]');
    /* 「改用組合包自己的場次」只在最終版（S34.1 ⚪，D471 使用者補充：release2.3 不需要）——版本外整組收起，
       成員一律照自己的場次（繼承），組合記錄上既有的值也不採用。版本狀態由 js/devtools.js 給，它在頁尾才載入，
       所以每次重畫都重問一次（並在 load 後重畫）。 */
    var grp = host.querySelector('[data-bp-own]');
    function ownOk() { return !(window.ztorDevState && window.ztorDevState.featOn && !window.ztorDevState.featOn('S34.1')); }
    var on = !!opts.value;
    if (opts.value) sel.value = opts.value;
    /* 掛在兩段式編輯的檢視態裡（組合詳情設定分頁）時，選單先停用——頁面的 applyReadonly 進出編輯態時會統一開關 */
    if (host.closest('[data-mode="view"]')) sel.disabled = true;
    var info = window.ZTOR_PARTIALS.bindPickupSessionInfo ? window.ZTOR_PARTIALS.bindPickupSessionInfo(sel, host.querySelector('[data-bp-session-info]')) : null;
    if (window.ztorSelect && window.ztorSelect.mount) window.ztorSelect.mount();
    function get() { return ownOk() && on && sel.value ? sel.value : null; }
    function sessionName(key) {
      if (!key) return '';
      var o = sel ? Array.prototype.filter.call(sel.options, function (x) { return x.value === key; })[0] : null;
      return o ? o.textContent.trim() : T('cp.delivery.session.' + key, key);
    }
    function refresh() {
      tgl.classList.toggle('switch--on', on);
      tgl.setAttribute('aria-checked', on ? 'true' : 'false');
      body.hidden = !on;
      if (grp) grp.hidden = !ownOk();
      renderList(get());
    }
    function renderList(own) {
      var DL = window.ztorDelivery;
      list.innerHTML = (opts.members ? opts.members() : []).map(function (m) {
        var d = DL && m.product ? DL.of(m.product) : { ship: true, qr: false, session: null };
        var parts = [DL && m.product ? DL.label(m.product, T) : T('cp.delivery.shipping', 'Shipping')];
        if (d.qr) parts.push(own ? sessionName(own) : (d.session ? sessionName(d.session) : T('cp.delivery.session.none', 'Not linked yet')));
        return '<div class="data-list__row"><div class="data-list__row-main">' +
          '<div class="data-list__icon"><i data-lucide="' + (d.qr ? 'qr-code' : 'truck') + '" class="ztor-icon"></i></div>' +
          '<div class="data-list__body"><div class="data-list__title">' + esc(m.name) + '</div>' +
          '<div class="data-list__meta">' + esc(parts.join(' · ')) + '</div></div></div></div>';
      }).join('');
      if (window.ztorIcons) window.ztorIcons.applyIcons(host);
    }
    /* D472（2026-10-22 使用者裁決）：換場次、自設↔沿用互換會改到組合包的「有效場次」時，頁面給了 opts.confirm 就先問——
         opts.confirm({ from, to, fromName, toName }, proceed, revert)   from／to＝場次代號，null＝沿用各成員自己的場次
       確認＝proceed() 才寫入（onChange）；取消＝revert() 把開關與選單退回原樣。建立組合包不給 confirm（尚無已售件，D472〔推導〕）。
       開關開著但還沒選場次＝有效值仍是 null，不算換場次、不問。 */
    var quiet = false;
    function eff(o, v) { return o && v && v !== '__new' ? v : null; }
    function commit(was) {
      var from = eff(was.on, was.val), to = eff(on, sel.value);
      var done = function () { last = sel.value; refresh(); if (opts.onChange) opts.onChange(get()); };
      if (!opts.confirm || from === to) { done(); return; }
      refresh();   /* 先讓畫面停在新選擇上，彈窗問完再決定 */
      opts.confirm({ from: from, to: to, fromName: sessionName(from), toName: sessionName(to) }, done, function () {
        on = was.on; last = was.val;
        if (sel.value !== was.val) { sel.value = was.val; quiet = true; sel.dispatchEvent(new Event('change', { bubbles: true })); quiet = false; }
        refresh();
      });
    }
    function flip() { var was = { on: on, val: sel.value }; on = !on; commit(was); }
    tgl.addEventListener('click', flip);
    tgl.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); } });
    /* 頁面沒有載 zselect（組合包兩頁的下拉是原生的）時，「建立取貨場次」改成選單最後一個選項——選到它就開彈窗、選單退回原值 */
    var last = sel.value;
    function create() { if (opts.onCreate) opts.onCreate(function (session) { if (info) info.addCreated(session); }); }
    if (!window.ztorSelect) {
      var act = document.createElement('option');
      act.value = '__new'; act.setAttribute('data-i18n', 'cp.delivery.session.new'); act.textContent = T('cp.delivery.session.new', 'Create pickup session');
      sel.appendChild(act);
    }
    sel.addEventListener('change', function () {
      if (quiet) return;   /* 取消確認時的退回，不是使用者改的 */
      if (sel.value === '__new') { sel.value = last; if (info) info.paint(); create(); return; }
      commit({ on: on, val: last });
    });
    sel.addEventListener('zselect:action', function (e) { if (e.detail && e.detail.action === 'new-session') create(); });
    document.addEventListener('i18n:applied', refresh);
    window.addEventListener('load', refresh);
    refresh();
    return { refresh: refresh, get: get, el: host };
  };
})();
