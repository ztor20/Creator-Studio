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
  /* 2026-11-02：場次詳情「管理領取項目」彈窗的「新增項目」只要第二步的加項目功能（使用者裁示），
     不開整個編輯彈窗；同一份可加入來源（含 session 綁定）交給它，規則一處維護（5.1.5.12 F2）。 */
  window.ZTOR_PARTIALS.pickupItemPool = function () { return ITEMS.slice(); };
  /* D503 掃碼領點（O43）：可領項目＝在彈窗裡逐列新增的點數 QR（名稱、每次領取點數、總名額），存進場次自己的 qrs[]
     （資料見下方 window.ztorScanEarn）。不再從電子商店挑商品。 */
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
      <!-- D499（5.1.5.12 F4）：場次類型。只在 Admin 代管態＋版本含 O43 時出現（JS 決定要不要停在這一步）；
           創作者本人、從商品脈絡開啟、編輯既有場次都直接進現場核銷／該場次自己的欄位。 -->
      <section class="pks-step" data-pks-step="type" data-feat="O43" hidden>
        <div class="segmented radio-cards" role="radiogroup" aria-label="Session type" data-i18n-aria-label="pk.lp.f.type" data-pks-type>
          <button type="button" class="segmented__btn segmented__btn--active" role="radio" aria-checked="true" data-pks-type-val="onsite"><span class="radio-card__text"><span class="radio-card__title" data-i18n="pk.lp.type.onsite">On-site redemption</span><span class="radio-card__sub" data-i18n="pk.lp.type.onsite.sub">Staff scan each fan’s pickup code. For physical items and event tickets.</span></span></button>
          <button type="button" class="segmented__btn" role="radio" aria-checked="false" data-pks-type-val="lp"><span class="radio-card__text"><span class="radio-card__title" data-i18n="pk.lp.type.lp">Scan to earn points</span><span class="radio-card__sub" data-i18n="pk.lp.type.lp.sub">Fans scan a QR code you print and earn loyalty points in the app.</span></span></button>
        </div>
      </section>
      <section class="pks-step" data-pks-step="basic">
        <!-- D499：編輯既有場次時類型唯讀（〔推導〕建立後不可改）；只在 Admin 代管態＋O43 顯示 -->
        <div class="field" data-pks-typero data-feat="O43" hidden>
          <span class="field__label" data-i18n="pk.lp.f.type">Session type</span>
          <div data-pks-typero-val data-i18n="pk.lp.type.onsite">On-site redemption</div>
          <span class="field__hint" data-i18n="pk.lp.f.type.hint">Set when the session was created. To use the other type, create a new session.</span>
        </div>
        <p class="field__hint field__hint--fact mb-16" data-pks-lp data-pks-lp-edithint data-feat="O43" hidden data-i18n="pk.lp.f.edithint">Changes apply to claims from now on. Points already given aren’t recalculated.</p>
        <div class="form-grid">
          <label class="field">
            <span class="field__label"><span data-i18n="pks.f.name">Session name</span> <span class="field__req">*</span></span>
            <input class="input" data-pks-name placeholder="e.g., Taipei signing — pickup" data-i18n-placeholder="pks.f.name.ph">
          </label>
          <label class="field">
            <span class="field__label"><span data-i18n="pks.f.loc" data-pks-loclabel>Pickup location</span> <span class="field__req" data-pks-onsite>*</span></span>
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
        <span class="field__hint" data-i18n="pks.f.time.hint">Only used to show the session status. It doesn’t affect scanning.</span>
        <span class="field__hint" data-pks-time-err hidden style="color:var(--destructive)" data-i18n="pks.f.time.err">End time must be later than start time.</span>
        <label class="field mt-16" data-pks-onsite>
          <span class="field__label" data-i18n="pks.f.instr">Pickup instructions (optional)</span>
          <textarea class="textarea" data-pks-instr placeholder="Queue location, ID needed, limits…" data-i18n-placeholder="pks.f.instr.ph"></textarea>
        </label>
        <!-- 掃碼密碼＝工作人員那支掃碼器網址的鎖，屬於這場的基本設定。已預先產生一組。
             2026-10-20 D455（B10，5.1.5.12 F3）：必填——清空就不能按「下一步」。 -->
        <label class="field mt-16" data-pks-onsite>
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
        <!-- D499（5.1.5.12 F5）：掃碼領點沒有 scanner 網址／密碼與取貨說明，改成啟用／停用開關（建立時預設啟用〔推導〕） -->
        <div class="control-row mt-16" data-pks-lp data-feat="O43" hidden>
          <div><div class="control-row__main" data-i18n="pk.lp.f.enabled">Enabled</div><div class="control-row__sub" data-i18n="pk.lp.f.enabled.sub">When disabled, no QR code in this session gives points.</div></div>
          <div class="switch switch--on" role="switch" aria-checked="true" tabindex="0" data-pks-enabled aria-label="Enabled" data-i18n-aria-label="pk.lp.f.enabled"></div>
        </div>
      </section>

      <!-- step 2 — single search-to-add combobox (products + tickets); focus opens a suggestion dropdown -->
      <section class="pks-step" data-pks-step="items" hidden>
        <p class="pks-step__intro" data-i18n="pks.items.sub" data-pks-items-intro>Add at least one product or event ticket. What you add here is what you need to bring on the day.</p>
        <div class="combobox" data-pks-combo data-pks-onsite>
          <div class="tag-input__field" data-pks-field>
            <input class="tag-input__entry" type="search" data-pks-search role="combobox" aria-expanded="false" aria-autocomplete="list" autocomplete="off" placeholder="Search products or tickets by name…" data-i18n-placeholder="pks.search.ph">
            <i data-lucide="chevron-down" class="combobox__chevron ztor-icon"></i>
          </div>
          <div class="combobox__menu" data-pks-menu hidden></div>
        </div>
        <!-- D503（5.1.5.12 F5）：掃碼領點逐列新增 QR——一列＝名稱（整列）＋每次領取點數＋總名額；至少一列。
             編輯時：有人領過的列沒有移除鈕（只能到詳情頁停用），總名額不能低於已領次數。 -->
        <div data-pks-qrs data-pks-lp data-feat="O43" hidden>
          <div class="stack" data-pks-qr-list></div>
          <button class="btn btn--outline btn--sm mt-16" type="button" data-pks-qr-add><i data-lucide="plus" class="ztor-icon"></i> <span data-i18n="pk.lp.qr.add">Add QR code</span></button>
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
    /* D503：彈窗裡的 QR 列（建立時全是新列；編輯時先帶出場次既有的 QR）。
       { id: 既有 QR id | null, name, points, total, claimed } */
    var qrRows = [], qrRemoved = [];
    /* D499：kind＝這一場的類型（onsite 現場核銷／lp 掃碼領點）；typeChoice＝這次開窗要不要先選類型
       （只有 Admin 代管態＋版本含 O43、從取貨管理建立新場次時）；lpEdit＝正在編輯的掃碼領點場次。 */
    var kind = 'onsite', typeChoice = false, lpEdit = null, isEditing = false, defaults = null;
    function T(k, fb) { var v = window.i18nT && window.i18nT(k); return (v && v !== k) ? v : (fb || ''); }
    function lpAllowed() { var SE = window.ztorScanEarn; return !!(SE && SE.visible()); }
    function pool() { return ITEMS; }
    function nameOf(it) { return it.name || (it.nameKey ? T(it.nameKey, it.id) : ''); }
    function metaOf(it) { return it.meta; }

    function chrome(el) {
      if (window.ztorIcons) window.ztorIcons.applyIcons(el);
      if (window.applyI18n) window.applyI18n(el);
    }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function itemById(id) { if (CURRENT && CURRENT.id === id) return CURRENT; for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i]; return null; }
    function iconFor(k) { return k === 'ticket' ? 'ticket' : 'package'; }

    /* ── D503 QR 列編輯器 ── */
    function qrErrText(code, row) {
      if (code === 'name') return T('pk.lp.qr.err.name', 'Enter a name.');
      if (code === 'points') return T('pk.lp.qr.err.points', 'Enter a whole number of 1 or more.');
      if (code === 'total') return T('pk.lp.qr.err.total', 'Enter a whole number from 1 to 999,999.');
      if (code === 'belowClaimed') return T('pk.lp.qr.err.below', 'Can’t be lower than the {n} claims so far.').replace('{n}', row.claimed);
      return '';
    }
    function qrErrs(row) { var SE = window.ztorScanEarn; return SE ? SE.validQr(row, row.claimed) : []; }
    function renderQrRows() {
      var list = modal.querySelector('[data-pks-qr-list]'); if (!list) return;
      list.innerHTML = qrRows.map(function (r, i) {
        var claimed = +r.claimed > 0;
        var rm = claimed ? '' : '<button class="btn btn--icon btn--sm" type="button" data-pks-qr-rm="' + i + '" aria-label="' + esc(T('pk.lp.qr.remove', 'Remove QR code')) + '" title="' + esc(T('pk.lp.qr.remove', 'Remove QR code')) + '"><i data-lucide="trash-2" class="ztor-icon"></i></button>';
        var f = function (key, labelKey, labelFb, type, extra) {
          return '<label class="field' + (key === 'name' ? ' form-grid__full' : '') + '"><span class="field__label"><span>' + esc(T(labelKey, labelFb)) + '</span> <span class="field__req">*</span></span>' +
            '<input class="input" ' + (type === 'num' ? 'type="number" inputmode="numeric" min="1" step="1" ' : '') + 'data-pks-qr-f="' + key + '" data-pks-qr-i="' + i + '" value="' + esc(r[key]) + '"' + (extra || '') + '>' +
            '<span class="field__error" data-pks-qr-err="' + key + '" hidden></span></label>';
        };
        return '<section class="form-section form-section--outlined" data-pks-qr-row="' + i + '">' +
          '<div class="form-section__head form-section__head--actions"><div class="form-section__head-titles"><h3 class="form-section__title">' + esc(T('pk.lp.qr.no', 'QR {n}').replace('{n}', i + 1)) + '</h3>' +
          (claimed ? '<p class="field__hint">' + esc(T('pk.lp.qr.keep', 'Claimed {n} times, so it can’t be removed. You can disable it on the session page.').replace('{n}', r.claimed)) + '</p>' : '') +
          '</div><div class="form-section__head-actions">' + rm + '</div></div>' +
          '<div class="form-grid">' +
            f('name', 'pk.lp.qr.f.name', 'QR name', 'text', ' placeholder="' + esc(T('pk.lp.qr.f.name.ph', 'e.g., Buy 1 bagel')) + '"') +
            f('points', 'pk.lp.qr.f.points', 'Points per scan', 'num') +
            f('total', 'pk.lp.qr.f.total', 'Total claims', 'num', claimed ? ' min="' + r.claimed + '"' : ' max="999999"') +
          '</div></section>';
      }).join('');
      if (window.ztorIcons) window.ztorIcons.applyIcons(list);
      qrRows.forEach(function (r, i) { paintQrErr(i, false); });
    }
    /* 錯誤只在動過那一格（touched）或按過送出之後才顯示；「總名額低於已領」一律即時顯示（擋下並說明） */
    function paintQrErr(i, force) {
      var r = qrRows[i], row = modal.querySelector('[data-pks-qr-row="' + i + '"]'); if (!r || !row) return;
      var errs = qrErrs(r);
      ['name', 'points', 'total'].forEach(function (k) {
        var code = k === 'total' ? (errs.indexOf('total') >= 0 ? 'total' : errs.indexOf('belowClaimed') >= 0 ? 'belowClaimed' : '') : (errs.indexOf(k) >= 0 ? k : '');
        var show = !!code && (force || (r.touched && r.touched[k]) || code === 'belowClaimed');
        var el = row.querySelector('[data-pks-qr-err="' + k + '"]'), inp = row.querySelector('[data-pks-qr-f="' + k + '"]');
        if (el) { el.hidden = !show; el.textContent = show ? qrErrText(code, r) : ''; }
        if (inp) { if (show) inp.setAttribute('aria-invalid', 'true'); else inp.removeAttribute('aria-invalid'); }
      });
    }
    function qrAllValid() { return qrRows.length > 0 && qrRows.every(function (r) { return qrErrs(r).length === 0; }); }
    function addQrRow() {
      qrRows.push({ id: null, name: '', points: '', total: '', claimed: 0, touched: {} });
      renderQrRows(); syncCreateEnabled();
      var inp = modal.querySelector('[data-pks-qr-row="' + (qrRows.length - 1) + '"] [data-pks-qr-f="name"]'); if (inp) inp.focus();
    }
    function removeQrRow(i) {
      var r = qrRows[i]; if (!r || +r.claimed > 0) return;
      if (r.id) qrRemoved.push(r.id);
      qrRows.splice(i, 1); renderQrRows(); syncCreateEnabled();
    }

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
        chip.innerHTML = '<span>' + esc(nameOf(it)) + '</span>' +
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
        var avail = pool().filter(function (it) {
          return it.kind === g[0] && selected.indexOf(it.id) < 0 &&
            (!q || (nameOf(it) + ' ' + metaOf(it)).toLowerCase().indexOf(q) >= 0);
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
            '<span class="combobox__opt-text"><span class="combobox__opt-name">' + esc(nameOf(it)) + '</span>' +
            '<span class="combobox__opt-meta">' + esc(metaOf(it)) + '</span></span>' +
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
    function removeItem(id) {
      var i = selected.indexOf(id); if (i >= 0) selected.splice(i, 1); renderChips(); renderMenu(); syncCreateEnabled();
    }
    /* 兩步各自檢查自己的必填：step 1 名稱＋地點＋時間先後，step 2 至少 1 個項目
       （D112 無草稿態）。掃碼密碼 2026-10-20 起改回必填（D455 B10），一起檢查。 */
    function syncCreateEnabled() {
      /* D499：類型那一步一定有選（預設現場核銷）；掃碼領點的地點選填、沒有掃碼密碼（5.1.5.12 F5） */
      var ok = step === 0 ? true : step === 1
        ? (kind === 'lp'
            ? (!!val('[data-pks-name]') && validTime())
            : (!!val('[data-pks-name]') && !!val('[data-pks-loc]') && validTime() && !!val('[data-pks-pw]')))
        : (kind === 'lp' ? qrAllValid() : selected.length > 0);
      var btn = modal.querySelector(step < 2 ? '[data-pks-next]' : '[data-pks-create]');
      if (btn) btn.disabled = !ok;
    }
    /* D499：依類型換欄位——現場核銷專屬（地點必填星號、取貨說明、掃碼密碼、掃碼網址）與掃碼領點專屬
       （啟用開關、編輯提示）互斥；文案 key 跟著換。切換類型時已填的項目不帶過去〔推導，5.1.5.12 F4〕。 */
    function applyKind() {
      var lp = kind === 'lp';
      modal.querySelectorAll('[data-pks-onsite]').forEach(function (el) { el.hidden = lp; });
      modal.querySelectorAll('[data-pks-lp]').forEach(function (el) { el.hidden = !lp; });
      var hint = modal.querySelector('[data-pks-lp-edithint]'); if (hint) hint.hidden = !(lp && isEditing);
      modal.querySelectorAll('[data-pks-editonly]').forEach(function (el) { el.hidden = !(isEditing && !lp); });
      var set = function (sel, attr, k) { var el = modal.querySelector(sel); if (el) el.setAttribute(attr, k); };
      set('[data-pks-loclabel]', 'data-i18n', lp ? 'pk.lp.f.loc' : 'pks.f.loc');
      set('[data-pks-name]', 'data-i18n-placeholder', lp ? 'pk.lp.f.name.ph' : 'pks.f.name.ph');
      set('[data-pks-loc]', 'data-i18n-placeholder', lp ? 'pk.lp.f.loc.ph' : 'pks.f.loc.ph');
      set('[data-pks-items-intro]', 'data-i18n', lp ? 'pk.lp.items.sub' : 'pks.items.sub');
      /* 類型唯讀列：編輯既有場次、且這個人看得到類型（Admin 代管態＋O43）才出現 */
      var ro = modal.querySelector('[data-pks-typero]');
      if (ro) ro.hidden = !(isEditing && lpAllowed());
      set('[data-pks-typero-val]', 'data-i18n', lp ? 'pk.lp.type.lp' : 'pk.lp.type.onsite');
      modal.querySelectorAll('[data-pks-type-val]').forEach(function (b) {
        var on = b.getAttribute('data-pks-type-val') === kind;
        b.classList.toggle('segmented__btn--active', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      if (window.applyI18n) window.applyI18n(modal);
    }
    function setEnabledSwitch(on) {
      var sw = modal.querySelector('[data-pks-enabled]'); if (!sw) return;
      sw.classList.toggle('switch--on', on); sw.setAttribute('aria-checked', on ? 'true' : 'false');
    }
    function enabledNow() { var sw = modal.querySelector('[data-pks-enabled]'); return !!(sw && sw.classList.contains('switch--on')); }
    function val(sel) { var el = modal.querySelector(sel); return el ? el.value.trim() : ''; }
    /* 一次只顯示一步；副標與上一步／下一步負責表達位置，不放 stepper。 */
    function setStep(n) {
      step = n;
      modal.querySelectorAll('[data-pks-step]').forEach(function (p) {
        p.hidden = p.getAttribute('data-pks-step') !== (n === 0 ? 'type' : n === 1 ? 'basic' : 'items');
      });
      var sub = modal.querySelector('[data-pks-sub]');
      var lp = kind === 'lp';
      var subKey = n === 0 ? 'pk.lp.step0.sub' : n === 1 ? (lp ? 'pk.lp.step1.sub' : 'pks.step1.sub') : (lp ? 'pk.lp.step2.sub' : 'pks.step2.sub');
      /* applyI18n 只掃 root 的後代，所以要傳 sub 的父層進去（傳 sub 自己不會生效） */
      if (sub) { sub.setAttribute('data-i18n', subKey); if (window.applyI18n) window.applyI18n(sub.parentNode); }
      /* 有類型那一步時，第一步也有「上一步」可以回去改類型 */
      modal.querySelector('[data-pks-back]').hidden = !(n === 2 || (n === 1 && typeChoice));
      modal.querySelector('[data-pks-next]').hidden = n === 2;
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
      if (!updateTimeErr()) { setStep(1); return; }
      if (kind === 'lp') {
        if (!qrAllValid()) { setStep(2); qrRows.forEach(function (r, i) { paintQrErr(i, true); }); return; }
        createLp(); return;
      }
      if (selected.length === 0) { setStep(2); return; }
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

    /* D499／D503 掃碼領點：建立＝寫進 ztorScanEarn（場次＋qrs）再交給 consumer 落地；編輯＝寫回基本欄位、QR 增改刪與啟用狀態。
       編輯時由啟用改成停用，存檔前先跑停用確認（5.1.5.15 F6.1；切回啟用不需確認〔推導〕）。 */
    function createLp() {
      var on = enabledNow();
      var payload = { kind: 'lp', id: lpEdit ? lpEdit.id : null, name: val('[data-pks-name]'), loc: val('[data-pks-loc]'),
        start: val('[data-pks-start]'), end: val('[data-pks-end]'), enabled: on,
        qrs: qrRows.map(function (r) { return { id: r.id, name: String(r.name).trim(), points: +r.points, total: +r.total }; }) };
      var SE = window.ztorScanEarn;
      function commit() {
        close();
        if (!SE) return;
        if (!lpEdit) {
          payload.id = SE.createSession(payload);
          if (hooks.onCreate) hooks.onCreate(payload);
          return;
        }
        /* 基本欄位：只寫有改的（沒改就留 i18n 鍵，切語言照常） */
        var patch = {};
        if (payload.name !== SE.sessionName(lpEdit)) patch.name = payload.name;
        var curLoc = lpEdit.loc != null && !lpEdit.locKey ? lpEdit.loc : (lpEdit.locKey ? T(lpEdit.locKey) : '');
        if (payload.loc !== curLoc) { patch.loc = payload.loc; patch.locKey = null; }
        if (payload.start !== lpEdit.start || payload.end !== lpEdit.end) { patch.start = payload.start; patch.end = payload.end; patch.timeKey = null; }
        if (Object.keys(patch).length) SE.updateSession(lpEdit.id, patch);
        qrRemoved.forEach(function (id) { SE.removeQr(id); });
        payload.qrs.forEach(function (q) {
          if (!q.id) { SE.addQr(lpEdit.id, q); return; }
          var cur = SE.qr(q.id);
          if (cur && (q.name !== SE.nameOf(cur) || q.points !== +cur.points || q.total !== +cur.total)) SE.updateQr(q.id, q);
        });
        SE.setEnabled(lpEdit.id, on);
        if (hooks.onSave) hooks.onSave(payload);
      }
      if (lpEdit && SE && SE.isEnabled(lpEdit.id) && !on && window.ZTOR_PARTIALS.lpConfirmDisable) {
        window.ZTOR_PARTIALS.lpConfirmDisable(payload.name, commit);
        return;
      }
      commit();
    }

    function onClick(e) {
      if (e.target === modal) { close(); return; }
      var tv = e.target.closest('[data-pks-type-val]');
      if (tv) {
        var nk = tv.getAttribute('data-pks-type-val');
        if (nk !== kind) { kind = nk; selected = []; renderChips(); if (kind === 'lp' && !qrRows.length) { qrRows = [{ id: null, name: '', points: '', total: '', claimed: 0, touched: {} }]; renderQrRows(); } }
        applyKind(); syncCreateEnabled(); return;
      }
      var sw = e.target.closest('[data-pks-enabled]');
      if (sw) { setEnabledSwitch(!sw.classList.contains('switch--on')); return; }
      if (e.target.closest('[data-pks-next]')) { setStep(step + 1); return; }
      if (e.target.closest('[data-pks-back]')) { setStep(step - 1); return; }
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
      if (e.target.closest('[data-pks-qr-add]')) { addQrRow(); return; }
      var qrm = e.target.closest('[data-pks-qr-rm]');
      if (qrm) { removeQrRow(+qrm.getAttribute('data-pks-qr-rm')); return; }
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
      if (modal && !modal.hidden && (e.key === ' ' || e.key === 'Enter') && e.target.matches && e.target.matches('[data-pks-enabled]')) {
        e.preventDefault(); setEnabledSwitch(!e.target.classList.contains('switch--on')); return;
      }
      if (e.key !== 'Escape' || !modal || modal.hidden) return;
      if (document.querySelector('[data-lp-confirm]:not([hidden])')) return;   /* 停用確認開著時，Esc 由確認視窗自己處理 */
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
      defaults = { start: modal.querySelector('[data-pks-start]').value, end: modal.querySelector('[data-pks-end]').value };
      modal.addEventListener('click', onClick);
      modal.addEventListener('change', function (e) {
        if (e.target.matches('[data-pks-start],[data-pks-end]')) updateTimeErr();
      });
      modal.addEventListener('input', function (e) {
        if (e.target.matches('[data-pks-search]')) openMenu();
        if (e.target.matches('[data-pks-qr-f]')) {
          var i = +e.target.getAttribute('data-pks-qr-i'), k = e.target.getAttribute('data-pks-qr-f'), r = qrRows[i];
          if (r) { r[k] = e.target.value; r.touched = r.touched || {}; r.touched[k] = true; paintQrErr(i, false); }
        }
        syncCreateEnabled();   /* step 1 的名稱／地點也要即時解鎖「下一步」 */
      });
      modal.addEventListener('focusin', function (e) {
        if (e.target.matches('[data-pks-search]')) openMenu();
      });
      document.addEventListener('keydown', onKey);
      return true;
    }
    function open(preselectId, titleKey, opts) {
      opts = opts || {};
      lastFocused = document.activeElement;
      var isEdit = titleKey === 'pks.title.edit';
      isEditing = isEdit;
      /* D499：要不要先選類型、這一場是哪一型、是不是在編輯掃碼領點場次 */
      var SE = window.ztorScanEarn;
      lpEdit = (isEdit && opts.lp && SE) ? SE.session(opts.lp) : null;
      typeChoice = !isEdit && !preselectId && lpAllowed();
      kind = lpEdit ? 'lp' : (typeChoice && opts.type === 'lp' ? 'lp' : 'onsite');
      editingSession = lpEdit ? lpEdit.id : (isEdit ? 'tpe' : null);
      /* 上一次開的是掃碼領點編輯（名稱／地點／時間被填過）→ 這次先還原成空白與預設時間 */
      if (modal.__lpFilled && !lpEdit) {
        modal.querySelector('[data-pks-name]').value = '';
        modal.querySelector('[data-pks-loc]').value = '';
        modal.querySelector('[data-pks-start]').value = defaults.start;
        modal.querySelector('[data-pks-end]').value = defaults.end;
        modal.__lpFilled = false;
      }
      if (lpEdit) {
        modal.querySelector('[data-pks-name]').value = SE.sessionName(lpEdit);
        modal.querySelector('[data-pks-loc]').value = lpEdit.locKey ? T(lpEdit.locKey) : (lpEdit.loc || '');
        modal.querySelector('[data-pks-start]').value = lpEdit.start;
        modal.querySelector('[data-pks-end]').value = lpEdit.end;
        modal.__lpFilled = true;
      }
      setEnabledSwitch(lpEdit ? SE.isEnabled(lpEdit.id) : true);
      updateTimeErr();
      /* 編輯既有場次＝台北簽書會那一場，項目已經選好（單售商品；組合包不可直接加入，D393）；
         建立新場次則從空的開始。 */
      selected = lpEdit ? [] : preselectId ? [preselectId] : (isEdit ? ['zine', 'tee'] : []);
      /* D503：QR 列——編輯帶出場次既有的 QR；建立掃碼領點時先給一列空白（至少一列才能建立） */
      qrRemoved = [];
      qrRows = lpEdit ? lpEdit.qrs.map(function (q) { return { id: q.id, name: SE.nameOf(q), points: String(q.points), total: String(q.total), claimed: +q.claimed || 0, touched: {} }; })
        : (kind === 'lp' ? [{ id: null, name: '', points: '', total: '', claimed: 0, touched: {} }] : []);
      renderQrRows();
      var skipType = false;
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
      applyKind();
      setStep(typeChoice && !skipType ? 0 : 1);
      var title = modal.querySelector('#pickup-dialog-title');
      title.setAttribute('data-i18n', titleKey || 'pks.title');
      if (window.applyI18n) window.applyI18n(modal);
      modal.hidden = false;
      document.body.classList.add('is-modal-open');
      var f = (typeChoice && !skipType) ? modal.querySelector('[data-pks-type-val].segmented__btn--active') : modal.querySelector('[data-pks-name]');
      if (f) f.focus();
    }
    function close() {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove('is-modal-open');
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    return {
      /* D499：openBlank({ type: 'lp' }) 預選類型（取貨管理篩在「掃碼領點」時，F4.3〔推導〕）；
         openExisting({ lp: 場次 id }) 編輯掃碼領點場次。兩個參數都可省略，省略＝原本的現場核銷行為。 */
      openBlank: function (o) { if (ensure()) open(null, 'pks.title', o); },
      openExisting: function (o) { if (ensure()) open(null, 'pks.title.edit', o); },
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

/* ── D499／D503 掃碼領點（O43）：示範資料＋停用確認視窗 ────────────────────────────────
   取貨場次的示範資料一向住在這支（上面的 PRODUCTS／KNOWN），所以掃碼領點的場次、場次裡的 QR 與領取紀錄也放這裡，
   三頁（pickup.html／pickup-detail.html／建立或編輯場次的彈窗）讀同一份。
   D503（2026-11-02）：點數 QR 只存在於掃碼領點場次裡（場次.qrs[]），不再是電子商店商品；原本 js/products-store.js 的
   忠誠點數商品與兩邊的雙向同步（D501）整段撤除。這裡是唯一正本。
   每個 QR：id（qr- 前綴）／nameKey 或 name（示範列走 i18n 鍵，新建與改名後用字面值）／points 每次領取點數／
     total 總名額（1～999,999）／claimed 已領次數／enabled 啟用（需求的「QR 未啟用」）／byKey 或 by 建立者／
     createdAt 建立時間／seed 假 QR 種子（js/faux-qr.js）。
   工作階段覆蓋存在 sessionStorage 'ztor.scanearn.v3'：
     { ses: { <場次 id>: { name, loc, start, end } }, created: [ 新建場次 ], qrPatch: { <qr id>: {...} },
       qrAdded: { <場次 id>: [ 新 QR ] }, qrDeleted: [ qr id ] }
   同一個分頁換頁看得到、關掉分頁回到示範。場次的啟用開關沿用 localStorage 'ztor.lp.enabled'（D499 起就在那）。
   window.ztorScanEarn
     visible()          Admin 代管態（window.ztorCreator.adminScope()）且版本含 O43——創作者本人一律看不到（D499 決定 6）
     a6Off()            A6「線下掃碼領點」事件開關是否關閉。原型以網址參數 ?a6=off 示範（呈現假設；正式值來自 5.1.0.8 F9）
     sessions()／session(id)／qr(id)／nameOf(qr)／sessionName(ses)／claims(sessionId)／claimedTotal(sessionId)
     createSession(o)／updateSession(id, o)／addQr(sesId, o)／updateQr(id, o)／setQrEnabled(id, on)／removeQr(id)
     validQr(o, claimed)  欄位檢查（回傳錯誤代碼陣列，空＝通過）
     isEnabled(id)／setEnabled(id, on)   場次啟用／停用（派 ztor:lp-changed） */
(function () {
  'use strict';
  var BY = 'pk.lp.s.bagel.by';   /* 示範的操作 Admin（新建的 QR 與場次也記這位，呈現假設） */
  var SEED = [
    { id: 'lps-bagel-xinyi', nameKey: 'pk.lp.s.bagel.name', locKey: 'pk.lp.s.bagel.loc', timeKey: 'pk.lp.s.bagel.time',
      start: '2026-11-01T10:00', end: '2026-11-30T22:00', status: 'active', enabled: true,
      byKey: BY, createdAt: '2026-10-28 15:20',
      qrs: [
        { id: 'qr-bagel-1', nameKey: 'pk.lp.qr.bagel1', points: 2,  total: 500, claimed: 128, enabled: true, byKey: BY, createdAt: '2026-10-28 15:22', seed: 11 },
        { id: 'qr-bagel-5', nameKey: 'pk.lp.qr.bagel5', points: 10, total: 200, claimed: 200, enabled: true, byKey: BY, createdAt: '2026-10-28 15:24', seed: 23 }
      ] }
  ];
  /* 領取紀錄（最近 12 筆；粉絲＝Fans CRM 示範名單 fans.rowN.name，連到 fan-detail.html?fan=N）。只記成功領取〔推導〕。qr＝QR id */
  var CLAIMS = [
    { at: '2026-11-02 18:42', fan: 3, qr: 'qr-bagel-1' },
    { at: '2026-11-02 18:05', fan: 7, qr: 'qr-bagel-1' },
    { at: '2026-11-02 17:31', fan: 1, qr: 'qr-bagel-5' },
    { at: '2026-11-02 16:58', fan: 5, qr: 'qr-bagel-1' },
    { at: '2026-11-02 15:20', fan: 9, qr: 'qr-bagel-5' },
    { at: '2026-11-02 13:47', fan: 2, qr: 'qr-bagel-1' },
    { at: '2026-11-02 12:09', fan: 6, qr: 'qr-bagel-1' },
    { at: '2026-11-02 11:16', fan: 4, qr: 'qr-bagel-5' },
    { at: '2026-11-01 21:30', fan: 8, qr: 'qr-bagel-1' },
    { at: '2026-11-01 19:52', fan: 1, qr: 'qr-bagel-1' },
    { at: '2026-11-01 16:04', fan: 3, qr: 'qr-bagel-5' },
    { at: '2026-11-01 10:27', fan: 2, qr: 'qr-bagel-5' }
  ].map(function (c) { c.session = 'lps-bagel-xinyi'; return c; });
  var SKEY = 'ztor.scanearn.v3', KEY = 'ztor.lp.enabled', MAX = 999999;
  function T(k, fb) { var v = window.i18nT && window.i18nT(k); return (v && v !== k) ? v : (fb || ''); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function read() { try { return JSON.parse(sessionStorage.getItem(SKEY) || '{}') || {}; } catch (e) { return {}; } }
  function write(o) { try { sessionStorage.setItem(SKEY, JSON.stringify(o)); } catch (e) {} }
  function changed(d) { document.dispatchEvent(new CustomEvent('ztor:lp-changed', { detail: d || {} })); }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function readMap() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function now() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function seedOf(id) { var n = 0; for (var i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) % 97; return n + 3; }
  /* 每次讀都從示範重建，再疊上工作階段 */
  function all() {
    var s = read(), sp = s.ses || {}, qp = s.qrPatch || {}, add = s.qrAdded || {}, del = s.qrDeleted || [];
    return SEED.map(clone).concat((s.created || []).map(clone)).map(function (ses) {
      Object.assign(ses, sp[ses.id] || {});
      ses.qrs = (ses.qrs || []).concat(add[ses.id] || [])
        .filter(function (q) { return del.indexOf(q.id) < 0; })
        .map(function (q) { return Object.assign({}, q, qp[q.id] || {}); });
      ses.items = ses.qrs.map(function (q) { return q.id; });
      return ses;
    });
  }
  function qrById(id) {
    var list = all();
    for (var i = 0; i < list.length; i++) { var q = find(list[i].qrs, id); if (q) return { qr: q, session: list[i] }; }
    return null;
  }
  /* 欄位檢查：名稱必填；每次領取點數＝正整數；總名額＝整數 1～999,999，且不低於已領次數（D503 推導） */
  function validQr(o, claimed) {
    var err = [], p = String(o.points == null ? '' : o.points).trim(), t = String(o.total == null ? '' : o.total).trim();
    if (!String(o.name || '').trim()) err.push('name');
    if (!/^\d+$/.test(p) || +p < 1) err.push('points');
    if (!/^\d+$/.test(t) || +t < 1 || +t > MAX) err.push('total');
    else if (+t < (+claimed || 0)) err.push('belowClaimed');
    return err;
  }
  function newQr(o) {
    var id = uid('qr-');
    return { id: id, name: String(o.name).trim(), points: +o.points, total: +o.total, claimed: 0, enabled: true,
             byKey: BY, createdAt: now(), seed: seedOf(id) };
  }
  window.ztorScanEarn = {
    MAX_TOTAL: MAX,
    sessions: function () { return all(); },
    session: function (id) { return find(all(), id); },
    qr: function (id) { var r = qrById(id); return r ? r.qr : null; },
    sessionOf: function (qrId) { var r = qrById(qrId); return r ? r.session : null; },
    /* 顯示名：改過名或新建的用字面值，否則走 i18n 鍵（中英文各自） */
    nameOf: function (q) { return q ? (q.name || T(q.nameKey, q.id)) : ''; },
    sessionName: function (ses) { return ses ? (ses.name || T(ses.nameKey, ses.id)) : ''; },
    byOf: function (o) { return o ? (o.by || T(o.byKey, '')) : ''; },
    claims: function (sid) { return CLAIMS.filter(function (c) { return !sid || c.session === sid; }); },
    claimedTotal: function (sid) {
      var s = find(all(), sid); if (!s) return 0;
      return s.qrs.reduce(function (n, q) { return n + (+q.claimed || 0); }, 0);
    },
    validQr: validQr,
    /* 建立場次（彈窗交來的欄位＋qrs:[{name, points, total}]）→ 回傳新場次 id */
    createSession: function (o) {
      var s = read(), id = uid('lps-');
      s.created = (s.created || []).concat([{ id: id, name: o.name, loc: o.loc || '', start: o.start, end: o.end,
        status: 'active', enabled: o.enabled !== false, byKey: BY, createdAt: now(),
        qrs: (o.qrs || []).map(newQr) }]);
      write(s);
      var m = readMap(); m[id] = o.enabled !== false; try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
      changed({ id: id, created: true });
      return id;
    },
    /* 編輯場次的基本欄位（只傳有改的：name／loc＋locKey:null／start＋end＋timeKey:null；只向後生效） */
    updateSession: function (id, patch) {
      var s = read(); s.ses = s.ses || {};
      s.ses[id] = Object.assign(s.ses[id] || {}, patch || {});
      write(s); changed({ id: id });
    },
    /* 新增 QR（場次已有人領過之後仍可新增，D503 推導）→ 回傳新 QR */
    addQr: function (sesId, o) {
      if (validQr(o, 0).length) return null;
      var s = read(); s.qrAdded = s.qrAdded || {};
      var q = newQr(o);
      s.qrAdded[sesId] = (s.qrAdded[sesId] || []).concat([q]);
      write(s); changed({ id: sesId, qr: q.id });
      return q;
    },
    /* 編輯 QR：名稱、每次領取點數、總名額（不能低於已領）；只向後生效 */
    updateQr: function (id, o) {
      var q = this.qr(id); if (!q) return ['missing'];
      var err = validQr(o, q.claimed); if (err.length) return err;
      var s = read(); s.qrPatch = s.qrPatch || {};
      var patch = s.qrPatch[id] || {};
      var nm = String(o.name).trim();
      if (q.nameKey && nm === T(q.nameKey, '')) delete patch.name; else patch.name = nm;
      patch.points = +o.points; patch.total = +o.total;
      s.qrPatch[id] = patch; write(s);
      var ses = this.sessionOf(id); changed({ id: ses && ses.id, qr: id });
      return [];
    },
    setQrEnabled: function (id, on) {
      var s = read(); s.qrPatch = s.qrPatch || {};
      s.qrPatch[id] = Object.assign(s.qrPatch[id] || {}, { enabled: !!on });
      write(s);
      var ses = this.sessionOf(id); changed({ id: ses && ses.id, qr: id, enabled: !!on });
    },
    /* 刪除：沒人領過才可以；有人領過回 false（只能停用，D503 推導） */
    removeQr: function (id) {
      var q = this.qr(id); if (!q || +q.claimed > 0) return false;
      var ses = this.sessionOf(id);
      var s = read(); s.qrDeleted = (s.qrDeleted || []).concat([id]); write(s);
      changed({ id: ses && ses.id, qr: id, removed: true });
      return true;
    },
    isEnabled: function (id) { var m = readMap(); if (Object.prototype.hasOwnProperty.call(m, id)) return !!m[id]; var s = find(all(), id); return !!(s && s.enabled); },
    setEnabled: function (id, on) {
      var m = readMap(); m[id] = !!on;
      try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {}
      changed({ id: id, enabled: !!on });
    },
    visible: function () {
      var admin = !!(window.ztorCreator && typeof window.ztorCreator.adminScope === 'function' && window.ztorCreator.adminScope());
      var inVer = !(window.ztorDevState && window.ztorDevState.featOn && !window.ztorDevState.featOn('O43'));
      return admin && inVer;
    },
    a6Off: function () { return /[?&]a6=off(&|$)/.test(location.search); }
  };

  /* 停用確認（5.1.5.15 F6.1）：切成停用前講清楚「場次內所有 QR 立刻停止發點」；切回啟用不確認〔推導〕。
     停用可以切回來，不是破壞性動作，所以確認鈕用一般主按鈕、不用紅色（Pattern 5.1.11 只管不可逆的動作）。 */
  var dlg = null, okFn = null, prevFocus = null;
  function shut(ok) {
    if (!dlg) return;
    dlg.hidden = true;
    if (!document.querySelector('.payout-modal:not([hidden])')) document.body.classList.remove('is-modal-open');
    var fn = okFn; okFn = null;
    if (prevFocus && prevFocus.focus) prevFocus.focus();
    if (ok && fn) fn();
  }
  function build() {
    dlg = document.createElement('div');
    dlg.className = 'payout-modal';
    dlg.setAttribute('data-lp-confirm', '');
    dlg.hidden = true;
    dlg.innerHTML =
      '<section class="payout-dialog payout-dialog--narrow" role="dialog" aria-modal="true" aria-labelledby="lp-confirm-title">' +
        '<div class="payout-dialog__head"><div>' +
          '<h2 class="payout-dialog__title" id="lp-confirm-title" data-i18n="pk.lp.off.title">Disable this session?</h2>' +
          '<p class="text-sub" style="margin:var(--sp-6) 0 0;font-size:var(--fs-13)" data-lp-confirm-name></p>' +
        '</div><button class="btn btn--icon" type="button" aria-label="Close" data-i18n-aria-label="pks.close" data-lp-confirm-cancel><i data-lucide="x" class="ztor-icon"></i></button></div>' +
        '<div class="payout-dialog__body">' +
          '<p style="margin:0 0 var(--sp-8)" data-i18n="pk.lp.off.body">Every QR code in this session stops giving points right away, whatever the start and end time.</p>' +
          '<p class="field__hint" style="margin:0" data-i18n="pk.lp.off.back">You can enable it again any time. Points already given stay.</p>' +
        '</div>' +
        '<div class="payout-dialog__foot"><span style="margin-left:auto"></span>' +
          '<button class="btn btn--ghost" type="button" data-lp-confirm-cancel data-i18n="pk.lp.off.cancel">Cancel</button>' +
          '<button class="btn btn--primary" type="button" data-lp-confirm-ok data-i18n="pk.lp.off.ok">Disable</button>' +
        '</div>' +
      '</section>';
    document.body.appendChild(dlg);
    if (window.ztorIcons) window.ztorIcons.applyIcons(dlg);
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-lp-confirm-cancel]')) { shut(false); return; }
      if (e.target.closest('[data-lp-confirm-ok]')) shut(true);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && dlg && !dlg.hidden) { e.stopPropagation(); shut(false); } }, true);
  }
  window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
  /* scope：'session'（預設，停用整個場次）或 'qr'（D503：停用單一 QR，規格 5.1.5.15 F6.2 停用前先確認〔推導〕）——只換標題與內文兩句 */
  window.ZTOR_PARTIALS.lpConfirmDisable = function (name, onOk, scope) {
    if (!dlg) build();
    prevFocus = document.activeElement;
    okFn = onOk;
    var qr = scope === 'qr';
    dlg.querySelector('#lp-confirm-title').setAttribute('data-i18n', qr ? 'pk.lp.qroff.title' : 'pk.lp.off.title');
    dlg.querySelector('[data-i18n="pk.lp.off.body"], [data-i18n="pk.lp.qroff.body"]').setAttribute('data-i18n', qr ? 'pk.lp.qroff.body' : 'pk.lp.off.body');
    var n = dlg.querySelector('[data-lp-confirm-name]');
    n.textContent = name || '';
    if (window.applyI18n) window.applyI18n(dlg);
    dlg.hidden = false;
    document.body.classList.add('is-modal-open');
    var ok = dlg.querySelector('[data-lp-confirm-ok]'); if (ok) ok.focus();
  };
})();
