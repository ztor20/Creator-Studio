window.ZTOR_PARTIALS = window.ZTOR_PARTIALS || {};
/* Restock modal · spec §5.1.5.6 (E-Shop · Restock sub-flow · D104 order model,
   D106 bundle member tabs). Loaded as a <script> on e-shop.html and
   product-detail.html (file:// safe).

   One restock = one ORDER. Two layers + one grouping rule (2026-07-22 Figma
   node 861-28842: method = radio-cards; item table sits right below it;
   supplier / ETA / notes moved BELOW the table):
     · DOCUMENT layer (filled once): method .segmented.radio-cards
       (now/scheduled) + supplier / ETA / notes.
     · ITEM layer: a .restock-table with 3 number columns (當前/補貨/補後數量).
   Grouping (D106):
     · A PRODUCT's variants are a MATRIX of rows (single-variant = 1 row;
       multi-variant = rows, sub-grouped by option-1 via
       .restock-table__group for a 2-option matrix). No tabs.
     · A BUNDLE separates its MEMBER PRODUCTS with .tabs (one tab per member);
       each tab panel holds that member's variant matrix. Only ONE tab level
       (members) — variants never use tabs. Quantities persist across tabs
       (all member panels stay in the DOM; .tab-panel toggles visibility).

   2026-11-09 D525（5.1.5.6 §8，取代 D523 的第三張卡）：同一個彈窗另有「修改庫存」模式（openAdjust*）——
   不顯示方式卡、供應商與預計到貨；三欄改成 目前數量｜新的在庫數（預填目前，可增可減）｜差額（+N／−N）。
   每列下限＝目前－item.max（呼叫端給該品項的未鎖定可賣；下限＝鎖定＋保留），低於下限該列紅框、整單不能送出；
   新的在庫數＝目前＝這列不改。onSubmit(entries, 'adjust')：entries 的 qty 是有正負的差額、to 是新的在庫數。

   createRestock(host, hooks) → { openProduct, openBundle, openSingle,
   openVariants, close }. hooks: { onSubmit(entries, mode) }；entries 每筆帶單據層的 supplier／eta／note（同一單相同）（onReceive 2026-09-11 撤除：到貨確認改在商品庫存分頁的「補貨中」卡逐單做）.
   Each entry = { member, name, qty, current, supplier }. UI chrome = data-i18n;
   sample data literal. */
(function () {
  window.ZTOR_PARTIALS.restockModal = `
<div class="payout-modal" data-restock-modal hidden>
  <section class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="restock-dialog-title">
    <div class="payout-dialog__head">
      <div>
        <h2 class="payout-dialog__title" id="restock-dialog-title" data-i18n="restock.title">Restock</h2>
        <p class="text-sub" style="margin:6px 0 0;font-size:13px" data-restock-sub data-i18n="restock.sub">Add stock for physical items, limited or unlimited. Digital items don't apply.</p>
      </div>
      <button class="btn btn--icon" type="button" aria-label="Close restock" data-i18n-aria-label="restock.close" data-restock-close><i data-lucide="x" class="ztor-icon"></i></button>
    </div>
    <div class="payout-dialog__body">
      <!-- 補貨方式（radio-cards：兩張並排卡＋右上橘點，Figma node 861-28842）。body 為 flex 直列、gap 24
           （Figma 866-1179）；本區塊直接當 body 子項，不再包 .payout-field（已退役、無樣式）。 -->
      <div class="segmented radio-cards" role="tablist" data-restock-method>
        <button class="segmented__btn segmented__btn--active" type="button" role="tab" aria-selected="true" data-restock-mode="now"><span class="radio-card__text"><span class="radio-card__title" data-i18n="restock.method.now">Restock now</span></span></button>
        <button class="segmented__btn" type="button" role="tab" aria-selected="false" data-restock-mode="scheduled"><span class="radio-card__text"><span class="radio-card__title" data-i18n="restock.method.scheduled">Scheduled</span></span></button>
      </div>

      <!-- 商品名稱 + 逐選項表（商品名稱→表 gap 8，其餘區塊 gap 24；bundle members become tabs）-->
      <div class="field__label" data-i18n="restock.product-name">Product name</div>
      <div class="tabs" role="tablist" data-restock-tabs hidden></div>
      <div data-restock-members></div>
      <!-- D525：修改庫存時才出現——下限說明＋低於下限的錯誤（那一列本身另標 aria-invalid 紅框） -->
      <p class="field__hint" data-restock-adjust-hint hidden data-i18n="restock.adjust.hint">Stock can't go below what's locked to sales channels or reserved by unpaid orders. To go lower, lower the lock first.</p>
      <p class="field__error" data-restock-adjust-err hidden data-i18n="restock.adjust.err">Some items are below their minimum</p>
      <div data-restock-empty hidden style="padding:16px;text-align:center;font-size:12.5px;color:var(--foreground-subtle)" data-i18n="restock.empty">All your products are sufficiently stocked.</div>

      <!-- 預計到貨時間（僅計時補貨）→ 供應商 → 備註（Figma：表格下方，改用 .field＝有 label→input 間距）-->
      <label class="field" data-restock-eta hidden>
        <span class="field__label"><span data-i18n="restock.f.eta">Expected arrival</span> <span class="field__req">*</span></span>
        <input class="input" type="date" value="2026-07-08">
      </label>
      <label class="field" data-restock-supplier-field>
        <span class="field__label" data-i18n="restock.f.supplier">Supplier</span>
        <input class="input" placeholder="e.g., the print shop or factory" data-i18n-placeholder="restock.f.supplier.ph" data-restock-supplier>
      </label>
      <label class="field">
        <span class="field__label" data-i18n="restock.f.notes">Notes</span>
        <input class="input" placeholder="e.g., batch number, carrier" data-i18n-placeholder="restock.f.notes.ph" data-restock-notes>
      </label>
    </div>
    <div class="payout-dialog__foot">
      <button class="btn btn--ghost" type="button" data-restock-close data-i18n="payout.cancel">Cancel</button>
      <span style="display:flex;gap:10px">
        <!-- 2026-09-11 撤除彈窗裡的「到貨確認」：正在下一張新單的當下沒有東西可以收貨，而且已下的單現在在
             商品庫存分頁的「補貨中」卡逐單確認——同一件事兩個入口。 -->
        <button class="btn btn--primary" type="button" data-restock-submit><span data-restock-submit-label data-i18n="restock.submit">Submit restock</span></button>
      </span>
    </div>
  </section>
</div>`;

  window.ZTOR_PARTIALS.createRestock = function (host, hooks) {
    hooks = hooks || {};
    var modal = null, lastFocused = null, originRow = null;

    function chrome(el) {
      if (window.ztorIcons) window.ztorIcons.applyIcons(el);
      if (window.applyI18n) window.applyI18n(el);
    }
    function num(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
    function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    var kind = 'restock';   /* 'restock'＝補貨（立即／計時）；'adjust'＝修改庫存（D525） */
    function mode() {
      if (kind === 'adjust') return 'adjust';
      var on = modal && modal.querySelector('[data-restock-method] .segmented__btn--active');
      return on ? on.getAttribute('data-restock-mode') : 'now';
    }
    /* 一列＝一個選項組合：縮圖＋名稱 ｜ 當前數量(唯讀) ｜ 補貨數量(可填) ｜ 補後數量(唯讀，＝當前＋補貨)
       item.thumb（2026-09-11 D268）＝已經產好的唯讀縮圖 HTML（.variant-thumb--ro，由呼叫端用 ProductsStore.variantThumb 產），
       有它就放在名稱格 __id 裡取代 __img 方塊（2026-09-12 使用者裁決：縮圖併在名稱格、不另開欄，Q117）；沒有就照舊。
       修改庫存（D525）：第二欄預填目前數量、第三欄是差額；名稱後補一行「最低 N」（下限＞0 才有）。 */
    function lineHTML(item) {
      var cur = num(item.current);
      var adj = kind === 'adjust';
      /* D525 下限＝目前－未鎖定可賣（呼叫端給 max；沒給或 Infinity＝整個在庫都能動，下限 0） */
      var free = (item.max == null || !isFinite(item.max)) ? cur : Math.max(0, Math.min(cur, num(item.max)));
      var min = cur - free;
      var minTxt = ((window.i18nT && window.i18nT('restock.adjust.min')) || 'Min {n}').replace('{n}', min);
      var imgInner = item.img ? '<img src="' + esc(item.img) + '" alt="">' : '<i data-lucide="package" class="ztor-icon"></i>';
      return '' +
        '<div class="restock-table__row" data-restock-line data-current="' + cur + '" data-min="' + min + '" data-name="' + esc(item.name) + '"' + (item.vi != null ? ' data-vi="' + esc(item.vi) + '"' : '') + '>' +
          '<div class="restock-table__id">' +
            (item.thumb ? item.thumb : '<span class="restock-table__img">' + imgInner + '</span>') +
            '<span class="restock-table__name">' + esc(item.name) + (adj && min > 0 ? '<br><small class="text-sub">' + esc(minTxt) + '</small>' : '') + '</span>' +
          '</div>' +
          '<input class="input restock-table__ro" value="' + cur + '" readonly tabindex="-1" aria-label="Current stock">' +
          '<input class="input" inputmode="numeric" placeholder="0" data-restock-qty aria-label="' + (adj ? 'New stock' : 'Restock quantity') + '"' + (adj ? ' value="' + cur + '"' : '') + '>' +
          '<input class="input restock-table__ro" value="' + (adj ? '0' : cur) + '" readonly tabindex="-1" data-restock-after aria-label="' + (adj ? 'Difference' : 'After restock') + '">' +
        '</div>';
    }
    /* A member's variant matrix: groups = [{label, items}] → .restock-table（含一次欄名列） */
    function matrixHTML(groups) {
      var adj = kind === 'adjust';
      var head =
        '<div class="restock-table__head">' +
          '<span></span>' +
          '<span class="restock-table__col" data-i18n="restock.col.current">Current</span>' +
          '<span class="restock-table__col" data-i18n="' + (adj ? 'restock.col.new' : 'restock.col.qty') + '">' + (adj ? 'New stock' : 'Restock') + '</span>' +
          '<span class="restock-table__col" data-i18n="' + (adj ? 'restock.col.diff' : 'restock.col.after') + '">' + (adj ? 'Change' : 'After') + '</span>' +
        '</div>';
      var body = '';
      (groups || []).forEach(function (g) {
        if (g.label) body += '<div class="restock-table__group">' + esc(g.label) + '</div>';
        (g.items || []).forEach(function (it) { body += lineHTML(it); });
      });
      return '<div class="restock-table">' + head + body + '</div>';
    }
    /* members = [{name, groups}]; tabbed = bundle (member tabs) vs product (one panel) */
    function renderMembers(members, tabbed) {
      var tabs = modal.querySelector('[data-restock-tabs]');
      var wrap = modal.querySelector('[data-restock-members]');
      tabs.hidden = !tabbed;
      tabs.innerHTML = tabbed ? members.map(function (m, i) {
        return '<button class="tabs__item' + (i === 0 ? ' tabs__item--active' : '') + '" type="button" role="tab" aria-selected="' + (i === 0) + '" data-restock-tab="' + i + '">' + esc(m.name || ('Item ' + (i + 1))) + '</button>';
      }).join('') : '';
      wrap.innerHTML = members.map(function (m, i) {
        return '<div class="tab-panel' + (i === 0 ? ' tab-panel--active' : '') + '" data-restock-member data-name="' + esc(m.name || '') + '">' + matrixHTML(m.groups) + '</div>';
      }).join('');
      chrome(tabs); chrome(wrap);
    }
    function showMember(idx) {
      modal.querySelectorAll('[data-restock-member]').forEach(function (p, i) { p.classList.toggle('tab-panel--active', i === idx); });
      modal.querySelectorAll('[data-restock-tab]').forEach(function (t, i) {
        t.classList.toggle('tabs__item--active', i === idx);
        t.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });
    }
    /* 修改庫存那一列的新在庫數：留空＝不改（等於目前） */
    function newVal(line) {
      var el = line.querySelector('[data-restock-qty]');
      var raw = el ? String(el.value).trim() : '';
      return raw === '' ? num(line.getAttribute('data-current')) : num(raw);
    }
    function recalc(line) {
      var cur = num(line.getAttribute('data-current'));
      var qEl = line.querySelector('[data-restock-qty]');
      var out = line.querySelector('[data-restock-after]');
      if (kind !== 'adjust') {
        if (out) out.value = cur + num((qEl || {}).value);   /* 補後數量欄是唯讀 input，設 value 而非 textContent */
        return false;
      }
      /* D525：差額＝新的在庫數－目前；低於下限（鎖定＋保留）→ 該列紅框；沒有上限（D496） */
      var v = newVal(line), d = v - cur;
      if (out) out.value = d > 0 ? '+' + d : (d < 0 ? '−' + (-d) : '0');
      var bad = v < num(line.getAttribute('data-min'));
      if (qEl) { if (bad) qEl.setAttribute('aria-invalid', 'true'); else qEl.removeAttribute('aria-invalid'); }
      return bad;
    }
    /* 全表重算一次；修改庫存有列低於下限就停用送出 */
    function recalcAll() {
      var anyBad = false;
      modal.querySelectorAll('[data-restock-line]').forEach(function (l) { if (recalc(l)) anyBad = true; });
      var err = modal.querySelector('[data-restock-adjust-err]');
      if (err) err.hidden = !anyBad;
      var sub = modal.querySelector('[data-restock-submit]');
      if (sub) sub.disabled = anyBad;
      return anyBad;
    }
    function setKey(el, key) {
      if (!el) return;
      el.setAttribute('data-i18n', key);
      if (window.applyI18n) window.applyI18n(el.parentElement || el);
    }
    /* 補貨 ↔ 修改庫存：換標題、副標、送出字，收起方式卡／供應商／預計到貨，露出下限說明（D525） */
    function applyKind() {
      var adj = kind === 'adjust';
      var meth = modal.querySelector('[data-restock-method]');
      if (meth) meth.hidden = adj;
      var sup = modal.querySelector('[data-restock-supplier-field]');
      if (sup) sup.hidden = adj;
      var hint = modal.querySelector('[data-restock-adjust-hint]');
      if (hint) hint.hidden = !adj;
      setKey(modal.querySelector('#restock-dialog-title'), adj ? 'restock.adjust.title' : 'restock.title');
      setKey(modal.querySelector('[data-restock-sub]'), adj ? 'restock.adjust.sub' : 'restock.sub');
      setKey(modal.querySelector('[data-restock-submit-label]'), adj ? 'restock.adjust.submit' : 'restock.submit');
    }
    function setMode(m) {
      modal.querySelectorAll('[data-restock-method] .segmented__btn').forEach(function (b) {
        var on = b.getAttribute('data-restock-mode') === m;
        b.classList.toggle('segmented__btn--active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      var eta = modal.querySelector('[data-restock-eta]');
      if (eta) eta.hidden = kind === 'adjust' || m !== 'scheduled';
      /* 方式提示行已隨 radio-cards 改版移除（Figma 無此行），不再切換 hint 文案 */
      recalcAll();
    }
    function collect() {
      var adj = kind === 'adjust';
      var supEl = modal.querySelector('[data-restock-supplier]');
      var supplier = (!adj && supEl && supEl.value) || '';   /* 修改庫存沒有供應商（D525） */
      /* eta：計時補貨的預計到貨日（yyyy-mm-dd → yyyy/mm/dd），立即補貨不帶。商品詳情的「補貨中」卡用它（2026-09-11）。 */
      var etaEl = modal.querySelector('[data-restock-eta] input');
      var eta = (mode() === 'scheduled' && etaEl && etaEl.value) ? String(etaEl.value).replace(/-/g, '/') : '';
      var noteEl = modal.querySelector('[data-restock-notes]');
      var note = (noteEl && noteEl.value) || '';
      var entries = [];
      modal.querySelectorAll('[data-restock-member]').forEach(function (mem) {
        var mname = mem.getAttribute('data-name') || '';
        mem.querySelectorAll('[data-restock-line]').forEach(function (line) {
          var cur = num(line.getAttribute('data-current'));
          /* vi：呼叫端給的選項組合索引（同名組合分在不同群時靠它對回去），沒給就不帶 */
          var vi = line.hasAttribute('data-vi') ? num(line.getAttribute('data-vi')) : null;
          if (adj) {
            var v = newVal(line);
            if (v !== cur) entries.push({ member: mname, name: line.getAttribute('data-name'), vi: vi, qty: v - cur, to: v, current: cur, note: note });
            return;
          }
          var q = num((line.querySelector('[data-restock-qty]') || {}).value);
          if (q > 0) entries.push({ member: mname, name: line.getAttribute('data-name'), vi: vi, qty: q, current: cur, supplier: supplier, eta: eta, note: note });
        });
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
      if (recalcAll()) return;   /* 修改庫存有列低於下限：不送（D525） */
      var entries = collect();
      if (!entries.length) return;
      var m = mode();
      if (m === 'scheduled') setOriginBadge('badge--warning', 'e-shop.row.restocking', 'Restocking');
      else if (m === 'now') setOriginBadge('badge--success', 'e-shop.row.instock', 'In stock');
      /* 修改庫存：清單列的徽章由清單自己依新庫存重算，這裡不硬改 */
      if (hooks.onSubmit) hooks.onSubmit(entries, m);
      close();
    }
    function onClick(e) {
      if (e.target === modal) { close(); return; }
      var modeBtn = e.target.closest('[data-restock-mode]');
      if (modeBtn) { setMode(modeBtn.getAttribute('data-restock-mode')); return; }
      var tab = e.target.closest('[data-restock-tab]');
      if (tab) { showMember(num(tab.getAttribute('data-restock-tab'))); return; }
      if (e.target.closest('[data-restock-close]')) { close(); return; }
      if (e.target.closest('[data-restock-submit]')) { submit(); return; }
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
        if (line && e.target.closest('[data-restock-qty]')) recalcAll();
      });
      return true;
    }
    /* 高度鎖定：計時補貨會多出「預計到貨」欄而變高，彈窗又置中 → 切換方式時整框上下跳。
       開窗時先量「計時」狀態（最高）的實際高度，鎖成 .payout-dialog 的 min-height，之後切「立即」
       也維持這個高度（body flex 撐開、footer 仍釘底），不再跳。量測在 modal 顯示後、同一幀 paint 前
       同步完成，看不到閃動；每次開窗先歸零重量、自動適應單/多規格不同內容高度。修改庫存沒有方式可切，不鎖。 */
    function lockHeight() {
      var dlg = modal.querySelector('.payout-dialog');
      var eta = modal.querySelector('[data-restock-eta]');
      if (!dlg) return;
      dlg.style.minHeight = '';
      if (kind === 'adjust') return;
      var wasHidden = eta ? eta.hidden : true;
      if (eta) eta.hidden = false;               // 暫時展開「預計到貨」量最高狀態
      var h = dlg.offsetHeight;                  // 受 max-height 上限自動封頂
      if (eta) eta.hidden = wasHidden;           // 還原目前方式
      dlg.style.minHeight = h + 'px';
    }
    function open() {
      lastFocused = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('is-modal-open');
      applyKind();
      setMode('now');
      lockHeight();
      var supEl = modal.querySelector('[data-restock-supplier]');
      if (supEl) supEl.value = '';
      var noteEl = modal.querySelector('[data-restock-notes]');
      if (noteEl) noteEl.value = '';
      var f = modal.querySelector(kind === 'adjust' ? '[data-restock-qty]' : 'input, button');
      if (f) f.focus();
    }
    function close() {
      if (!modal) return;
      modal.hidden = true;
      document.body.classList.remove('is-modal-open');
      originRow = null;
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    /* A PRODUCT restock — variants as a matrix, NO member tabs.
       groups = [{label, items}] (single-variant → one groupless line;
       2-option → sub-grouped by option-1). */
    function openProduct(groups, row, k) {
      if (!ensure()) return;
      kind = k === 'adjust' ? 'adjust' : 'restock';
      originRow = row || null;
      renderMembers([{ name: '', groups: groups }], false);
      open();
    }
    /* A BUNDLE restock — member products as tabs, each a variant matrix.
       members accept a friendly shape: {name, variants:[...]} | {name, matrix:[{label,items}]}
       | {name, current, threshold, status} (single-variant). */
    function openBundle(members, row) {
      if (!ensure()) return;
      kind = 'restock';   /* 組合包沒有修改庫存（D525〔推導〕） */
      originRow = row || null;
      var norm = (members || []).map(function (m) {
        if (m.matrix) return { name: m.name, groups: m.matrix };
        if (m.variants) return { name: m.name, groups: [{ label: null, items: m.variants }] };
        return { name: m.name, groups: [{ label: null, items: [{ name: m.name, current: m.current, threshold: m.threshold, status: m.status, max: m.max }] }] };
      });
      renderMembers(norm, true);
      showMember(0);
      open();
    }
    return {
      openProduct: openProduct,
      openBundle: openBundle,
      /* conveniences */
      openSingle: function (item, row) { openProduct([{ label: null, items: [item || {}] }], row); },
      openVariants: function (product, variants, row) { openProduct([{ label: null, items: variants || [] }], row); },
      /* D525 修改庫存：同一張表，第二欄填新的在庫數 */
      openAdjust: function (groups, row) { openProduct(groups, row, 'adjust'); },
      openAdjustSingle: function (item, row) { openProduct([{ label: null, items: [item || {}] }], row, 'adjust'); },
      close: close
    };
  };
})();
