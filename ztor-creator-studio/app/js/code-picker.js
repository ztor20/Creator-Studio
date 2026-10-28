/* ============================================================
   code-picker.js · 商品端優惠碼選擇欄（D458，2026-10-20）
   ------------------------------------------------------------
   window.ztorCodePicker.mount(host, opts) → 實例。
   2026-10-28 D486：「使用優惠碼」總開關移除——全店碼一律適用，消費頁直接放 host（不再有開關、不再收合）。host 裡面就是本元件：
     「優惠碼」卡片列表（2026-10-28 起；原勾選表、再早是下拉多選）：只列這個商品實際會套用的碼——全店碼（固定、不能移除）＋已加入的特定商品碼（可 ✕ 移除）；每個碼一張框，欄位平行對齊；底下整塊框線按鈕「新增優惠碼」。
     已建立但還沒加入的碼不在上層列出，按「新增優惠碼」開彈窗：預設是清單（勾選後按「加入（N）」），清單底部「建立新的優惠碼」在同一個彈窗換到建立畫面（可返回）。資料讀寫都走 js/discount-codes-store.js（window.ztorCodes）。

   opts
     pending  （選填）重畫時帶回上次暫存的新碼（活動建立流程的組合包編輯器每次重畫都重新 mount）
     key      商品或組合包 id；建立流程（還沒有 id）傳 null——選取與新碼暫存在元件裡，儲存時 commit(key, label)
     label    () => 顯示名稱（新碼彈窗的「特定商品：…」與碼端範圍清單用）
     hideLabel（選填）true＝不畫欄位標籤「優惠碼」——外層分卡／價格階梯已經寫了「優惠碼」，欄位上再寫一次是重述（D486 同輪）
     locked   組合包上架中＝true：不能選、不能移除、不能建立
     onChange (state) => void   選取或新碼變動時（state.codes＝目前選取）
   實例
     get()            { codes: [...], pending: [...] }
     setLocked(b)     切換鎖定（組合包上架中；說明要先下架）
     setReadonly(b)   切換唯讀（詳情頁檢視態；不說明原因）
     setKey(k)        換商品／組合包（詳情頁載入資料後）
     commit(key, label)  儲存時呼叫：新碼（暫存的）建立、選取結果寫進各碼的特定商品範圍
     reset()          取消編輯：回到碼端現況、丟掉暫存
     refresh()        重畫
   選取結果隨商品儲存才寫入碼端（尚未 commit 的不影響優惠碼）；新碼在已有 id 的商品上先建在碼端（沒有範圍），
   選入後同樣等 commit 才綁定；建立流程裡的新碼整個暫存到 commit。
   ============================================================ */
(function () {
  'use strict';
  var T = function (k, fb) { return (window.i18nT && window.i18nT(k)) || fb || k; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var Codes = function () { return window.ztorCodes; };
  var instances = [];

  var STATUS_KEY = { scheduled: 'cpk.status.scheduled', ended: 'cpk.status.ended', disabled: 'cpk.status.disabled', exhausted: 'cpk.status.exhausted' };
  var STATUS_FB = { scheduled: 'Scheduled', ended: 'Ended', disabled: 'Disabled', exhausted: 'Used up' };

  /* ── 新增優惠碼彈窗（整頁共用一顆；重用 payout-modal）。
     兩個畫面、每個畫面一個主要按鈕：清單（預設）＝「加入（N）」；建立＝「建立並加入」。已建立的碼清單是主要路徑，
     建立是少用動作、收在清單底部一列，點了在同一個彈窗換畫面；沒有可加入的碼時直接進建立畫面。 ── */
  var modal = null, modalOwner = null, view = 'pick', picked = [];
  function shortDate(v) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v || ''); return m ? (Number(m[2]) + '/' + Number(m[3])) : ''; }
  function genCode(len) {
    var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '', buf = new Uint32Array(len);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    for (var i = 0; i < len; i++) out += A[buf[i] % A.length];
    return out;
  }
  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'payout-modal'; modal.hidden = true; modal.id = 'cpk-modal';
    modal.innerHTML =
      '<section class="payout-dialog" role="dialog" aria-modal="true" aria-labelledby="cpk-modal-title">' +
        '<div class="payout-dialog__head"><div class="code-picker-modal__head">' +
          '<button class="btn btn--icon btn--sm" type="button" data-cpk-back hidden><i data-lucide="chevron-left" class="ztor-icon"></i></button>' +
          '<h2 class="payout-dialog__title" id="cpk-modal-title"></h2></div>' +
          '<button class="btn btn--icon" type="button" data-cpk-close><i data-lucide="x" class="ztor-icon"></i></button></div>' +
        '<div class="payout-dialog__body">' +
          '<div data-cpk-view="pick">' +
            '<p class="code-picker-modal__hint" data-cpk-t="cpk.pick.hint"></p>' +
            '<div data-cpk-list></div>' +
            '<button class="btn btn--outline btn--block code-picker-modal__new" type="button" data-cpk-to-create><i data-lucide="plus" class="ztor-icon"></i><span data-cpk-t="cpk.new"></span></button>' +
          '</div>' +
          '<div data-cpk-view="create" hidden><div class="stack" style="gap:var(--sp-16)">' +
            '<div class="field"><div class="field__label"><span data-cpk-t="cpk.m.code"></span> <span class="field__req">*</span></div>' +
              '<div class="code-picker-modal__row"><input class="input" id="cpk-m-code" maxlength="20" autocomplete="off">' +
              '<button class="btn btn--outline btn--sm" type="button" data-cpk-gen></button></div>' +
              '<div class="field__hint" data-cpk-t="cpk.m.code.hint"></div></div>' +
            '<div class="field"><div class="field__label"><span data-cpk-t="cpk.m.pct"></span> <span class="field__req">*</span></div>' +
              '<span class="amount-field amount-field--suffix" style="width:132px"><input class="input amount-field__input" id="cpk-m-pct" value="10" inputmode="decimal"><span class="amount-field__unit">%</span></span></div>' +
            '<div class="code-picker-modal__dates">' +
              '<div class="field"><div class="field__label" data-cpk-t="cpk.m.start"></div><input class="input" type="date" id="cpk-m-start"></div>' +
              '<div class="field"><div class="field__label" data-cpk-t="cpk.m.end"></div><input class="input" type="date" id="cpk-m-end"></div>' +
            '</div>' +
            '<div class="field"><div class="field__label" data-cpk-t="cpk.m.scope"></div><div class="code-picker-modal__scope" data-cpk-scope></div></div>' +
          '</div></div>' +
        '</div>' +
        '<div class="payout-dialog__foot"><p class="payout-dialog__foot-note" data-cpk-err hidden></p>' +
          '<div class="payout-dialog__foot-actions"><button class="btn btn--outline" type="button" data-cpk-close data-cpk-t="cpk.m.cancel"></button>' +
          '<button class="btn btn--primary" type="button" data-cpk-confirm disabled></button></div></div>' +
      '</section>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) {
      var t = e.target;
      if (t === modal || t.closest('[data-cpk-close]')) { closeModal(); return; }
      if (t.closest('[data-cpk-gen]')) { document.getElementById('cpk-m-code').value = genCode(10); syncFoot(); return; }
      if (t.closest('[data-cpk-to-create]')) { setView('create'); return; }
      if (t.closest('[data-cpk-back]')) { setView('pick'); return; }
      if (t.closest('[data-cpk-confirm]')) { confirmModal(); }
    });
    modal.addEventListener('change', function (e) {
      var k = e.target.getAttribute && e.target.getAttribute('data-cpk-pick-m'); if (!k) return;
      var i = picked.indexOf(k);
      if (e.target.checked) { if (i < 0) picked.push(k); } else if (i >= 0) picked.splice(i, 1);
      paintList(); syncFoot();
    });
    modal.addEventListener('input', function (e) { if (e.target.id === 'cpk-m-code') syncFoot(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal && !modal.hidden) closeModal(); });
    return modal;
  }
  function paintList() {
    var host = modal.querySelector('[data-cpk-list]'), o = modalOwner; if (!o) return;
    var pool = o.pool();
    if (!pool.length) { host.innerHTML = '<p class="code-picker-modal__hint">' + esc(T('cpk.pick.none')) + '</p>'; return; }
    host.innerHTML = '<div class="code-picker__tbl">' +
      '<div class="code-picker__head"><span></span><span>' + esc(T('cpk.col.code')) + '</span><span class="code-picker__cell">' + esc(T('cpk.col.scope')) + '</span><span class="code-picker__num">' + esc(T('cpk.col.pct')) + '</span><span class="code-picker__cell code-picker__period">' + esc(T('cpk.col.period')) + '</span></div>' +
      pool.map(function (i) {
        var on = picked.indexOf(i.code) >= 0;
        return '<label class="code-picker__row' + (on ? '' : ' code-picker__row--off') + '"><span class="zcheck__control"><input class="zcheck__input" type="checkbox" data-cpk-pick-m="' + esc(i.code) + '"' + (on ? ' checked' : '') + ' aria-label="' + esc(i.code) + '"><span class="zcheck__box"></span></span>' +
          '<span class="code-picker__code">' + esc(i.code) + '</span><span class="code-picker__cell code-picker__scope">' + esc(T('cpk.scope.items')) + '</span>' +
          '<span class="code-picker__num">' + esc(i.pct) + '%</span><span class="code-picker__cell code-picker__period">' + esc(i.period || '—') + '</span></label>';
      }).join('') + '</div>';
  }
  function paintModalText() {
    if (!modal) return;
    modal.querySelectorAll('[data-cpk-t]').forEach(function (el) { el.textContent = T(el.getAttribute('data-cpk-t')); });
    modal.querySelector('[data-cpk-gen]').textContent = T('cpk.m.gen');
    modal.querySelector('#cpk-m-code').placeholder = 'SUMMER25';
    modal.querySelector('[data-cpk-back]').setAttribute('aria-label', T('cpk.back'));
    if (modalOwner) { paintList(); setView(view); }
  }
  function syncFoot() {
    var b = modal.querySelector('[data-cpk-confirm]');
    if (view === 'pick') { b.textContent = picked.length ? T('cpk.pick.confirm.n').replace('{n}', picked.length) : T('cpk.pick.confirm'); b.disabled = !picked.length; }
    else { b.textContent = T('cpk.create.confirm'); b.disabled = modal.querySelector('#cpk-m-code').value.trim() === ''; }
    modal.querySelector('[data-cpk-err]').hidden = true;
  }
  function setView(v) {
    view = v;
    modal.querySelectorAll('[data-cpk-view]').forEach(function (el) { el.hidden = el.getAttribute('data-cpk-view') !== v; });
    modal.querySelector('#cpk-modal-title').textContent = v === 'pick' ? T('cpk.pick.title') : T('cpk.new');
    modal.querySelector('[data-cpk-back]').hidden = !(v === 'create' && modalOwner && modalOwner.pool().length);   /* 沒有可加入的碼時，建立畫面就是起點、不放返回 */
    syncFoot();
  }
  function openModal(owner) {
    ensureModal(); modalOwner = owner; picked = [];
    modal.querySelector('#cpk-m-code').value = '';
    modal.querySelector('#cpk-m-pct').value = '10';
    modal.querySelector('#cpk-m-start').value = ''; modal.querySelector('#cpk-m-end').value = '';
    var nm = owner.opts.label ? owner.opts.label() : '';
    modal.querySelector('[data-cpk-scope]').textContent = T('cpk.m.scope.v').replace('{name}', nm || T('cpk.m.scope.this'));
    paintModalText(); paintList(); setView(owner.pool().length ? 'pick' : 'create');
    modal.hidden = false; document.body.classList.add('is-modal-open');
    if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(modal);
  }
  function closeModal() { if (modal) modal.hidden = true; document.body.classList.remove('is-modal-open'); modalOwner = null; picked = []; }
  function confirmModal() {
    var o = modalOwner; if (!o) return;
    if (view === 'pick') { var add = picked.slice(); closeModal(); o.addCodes(add); return; }
    var err = modal.querySelector('[data-cpk-err]');
    var fail = function (k) { err.textContent = T(k); err.hidden = false; };
    var code = modal.querySelector('#cpk-m-code').value.trim();
    if (!/^[A-Za-z0-9]{8,20}$/.test(code)) return fail('cpk.err.format');
    if (Codes().exists(code) || instances.some(function (i) { return i.st.pending.some(function (p) { return p.code === code.toUpperCase(); }); })) return fail('cpk.err.taken');
    var pct = parseFloat(modal.querySelector('#cpk-m-pct').value);
    if (!(pct >= 1 && pct <= 100)) return fail('cpk.err.pct');
    var s = modal.querySelector('#cpk-m-start').value, e = modal.querySelector('#cpk-m-end').value;
    if (s && e && e < s) return fail('cpk.err.range');
    var period = (s || e) ? ((shortDate(s) || '…') + ' – ' + (shortDate(e) || '…')) : '—';
    var today = new Date().toISOString().slice(0, 10);
    var status = s && s > today ? 'scheduled' : 'active';
    closeModal();
    o.addNew({ code: code.toUpperCase(), pct: pct, period: period, status: status });
    if (window.ztorToast) window.ztorToast.show(T('cpk.toast.created'), { tone: 'success' });
  }

  /* ── 元件本體 ── */
  function mount(host, opts) {
    opts = opts || {};
    var C = Codes();
    var st = {
      key: opts.key || null,
      sel: opts.key ? C.selectedFor(opts.key) : (opts.selected || []).slice(),
      pending: (opts.pending || []).slice(),      /* 建立流程暫存的新碼 { code, pct, period, status }；opts.pending＝重畫後帶回上次的暫存 */
      locked: !!opts.locked,   /* 鎖定（組合包上架中）：停用並說明原因 */
      ro: !!opts.readonly      /* 唯讀（檢視態）：同樣停用，但不說鎖定原因 */
    };
    var self = { host: host, opts: opts, st: st };

    function codeInfo(code) {
      var p = st.pending.filter(function (x) { return x.code === code; })[0];
      if (p) return { code: p.code, pct: p.pct, period: p.period, status: p.status, pending: true };
      var c = Codes().get(code);
      return c ? { code: c.code, pct: c.pct, period: c.period, status: c.status } : { code: code, pct: 0, period: '', status: 'active' };
    }
    function statusText(i) {
      if (i.pending) return T('cpk.pending');
      return STATUS_KEY[i.status] ? T(STATUS_KEY[i.status], STATUS_FB[i.status]) : '';
    }
    /* ── 2026-10-28：勾選表改成卡片列表（使用者要求，demo 見 lab-code-popup.html）──
       上層只列「這個商品實際會套用」的碼：全店碼（autoApplied，固定、沒有移除鈕）＋已加入的特定商品碼（sel＋暫存新碼，有 ✕）。
       每個碼一張框（.control-group--plain），欄位平行：優惠碼｜適用範圍｜折扣｜期間｜狀態｜移除；最後一格每張卡都留位置，沒有 ✕ 的全店碼狀態徽章才不會偏。
       底下整塊框線按鈕「新增優惠碼」開彈窗（清單／建立兩個畫面）。鎖定（上架中）或唯讀（檢視態）時沒有 ✕ 也沒有新增鈕。
       墓碑：.code-picker__row 勾選列放進上層的做法（原勾選表）、表尾 .code-picker__add 的「建立新的優惠碼」文字鈕、data-cpk-pick／-new 事件。 */
    var BADGE = { active: 'success', scheduled: 'info', ended: 'neutral', disabled: 'neutral', exhausted: 'warning' };
    function badgeHTML(i) {
      var txt = i.pending ? T('cpk.pending') : (i.status === 'active' ? T('cpk.status.active') : statusText(i));
      return '<span class="badge badge--' + (i.pending ? 'neutral' : (BADGE[i.status] || 'neutral')) + '">' + esc(txt) + '</span>';
    }
    function cardHTML(i, fixed, scopeKey) {
      var canRm = !fixed && !st.locked && !st.ro;
      return '<div class="control-group control-group--plain"><div class="code-picker__card">' +
        '<span class="code-picker__code">' + esc(i.code) + '</span>' +
        '<span class="code-picker__cell code-picker__scope">' + esc(T(scopeKey)) + '</span>' +
        '<span class="code-picker__num">' + esc(i.pct) + '%</span>' +
        '<span class="code-picker__cell code-picker__period">' + esc(i.period || '—') + '</span>' +
        '<span>' + badgeHTML(i) + '</span>' +
        '<span>' + (canRm ? '<button type="button" class="btn btn--icon btn--sm" data-cpk-rm="' + esc(i.code) + '" aria-label="' + esc(T('cpk.remove').replace('{code}', i.code)) + '"><i data-lucide="x" class="ztor-icon"></i></button>' : '') + '</span>' +
        '</div></div>';
    }
    /* 彈窗清單用：碼端可選的特定商品碼，扣掉已加入的與全店碼（全店碼一律適用不用選） */
    self.pool = function () {
      var C2 = Codes(); if (!C2) return [];
      var autoCodes = C2.autoApplied().map(function (c) { return c.code; });
      return C2.selectable(st.sel).map(function (c) { return codeInfo(c.code); })
        .filter(function (i) { return st.sel.indexOf(i.code) < 0 && autoCodes.indexOf(i.code) < 0; });
    };
    function render() {
      var C2 = Codes(); if (!C2) return;
      var auto = C2.autoApplied();
      var autoCodes = auto.map(function (c) { return c.code; });
      var sel = st.sel.filter(function (c) { return autoCodes.indexOf(c) < 0; });
      var head = '<div class="code-picker__cols"><span>' + esc(T('cpk.col.code')) + '</span><span>' + esc(T('cpk.col.scope')) + '</span>' +
        '<span class="code-picker__num">' + esc(T('cpk.col.pct')) + '</span><span class="code-picker__period">' + esc(T('cpk.col.period')) + '</span><span>' + esc(T('cpk.col.status')) + '</span><span></span></div>';
      var html = '<div class="code-picker__field">' + (opts.hideLabel ? '' : '<div class="field__label">' + esc(T('cpk.title')) + '</div>') +
        '<div class="code-picker__cards">' +
          ((auto.length || sel.length) ? head : '') +
          auto.map(function (c) { return cardHTML({ code: c.code, pct: c.pct, period: c.period, status: c.status }, true, 'cpk.scope.all'); }).join('') +
          sel.map(function (code) { return cardHTML(codeInfo(code), false, 'cpk.scope.items'); }).join('') +
        '</div>' +
        (st.locked || st.ro ? '' : '<button type="button" class="btn btn--outline btn--block code-picker__add" data-cpk-add><i data-lucide="plus" class="ztor-icon"></i><span>' + esc(T('cpk.add')) + '</span></button>') +
        (st.locked ? '<div class="field__hint">' + esc(T('cpk.locked')) + '</div>' : '') + '</div>';
      host.innerHTML = '<div class="code-picker"' + (st.locked || st.ro ? ' data-locked' : '') + '>' + html + '</div>';
      if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(host);
    }
    function changed() {
      render();
      if (opts.onChange) opts.onChange({ codes: st.sel.slice(), pending: st.pending.slice() });
    }

    host.addEventListener('click', function (e) {
      if (st.locked || st.ro) return;
      var rm = e.target.closest('[data-cpk-rm]');
      if (rm) {
        var code = rm.getAttribute('data-cpk-rm');
        st.sel = st.sel.filter(function (x) { return x !== code; });
        st.pending = st.pending.filter(function (p) { return p.code !== code; });   /* 暫存的新碼移除＝不建立 */
        changed(); return;
      }
      if (e.target.closest('[data-cpk-add]')) openModal(self);
    });
    self.addCodes = function (codes) {
      codes.forEach(function (c) { if (st.sel.indexOf(c) < 0) st.sel.push(c); });
      changed();
    };
    self.addNew = function (spec) {
      if (st.key && !opts.deferCreate) {
        /* 商品已有 id：碼先建在碼端（還沒綁商品），選入後等 commit 才寫進特定商品範圍 */
        Codes().create({ code: spec.code, pct: spec.pct, period: spec.period, status: spec.status });
      } else {
        st.pending.push(spec);
      }
      if (st.sel.indexOf(spec.code) < 0) st.sel.push(spec.code);
      changed();
    };
    self.get = function () { return { codes: st.sel.slice(), pending: st.pending.slice() }; };
    self.setLocked = function (b) { b = !!b; if (st.locked === b) return; st.locked = b; render(); };
    self.setReadonly = function (b) { b = !!b; if (st.ro === b) return; st.ro = b; render(); };
    self.setKey = function (k) { st.key = k || null; };
    self.isLocked = function () { return st.locked; };
    self.commit = function (key, label) {
      key = key || st.key; if (!key) return;
      st.pending.forEach(function (p) { Codes().create({ code: p.code, pct: p.pct, period: p.period, status: p.status, key: key, label: label }); });
      st.pending = [];
      Codes().setSelected(key, st.sel, label);
      st.key = key; render();
    };
    self.reset = function () {
      st.pending = [];
      st.sel = st.key ? Codes().selectedFor(st.key) : (opts.selected || []).slice();
      render();
    };
    self.refresh = render;
    instances = instances.filter(function (i) { return document.body.contains(i.host); });
    instances.push(self);
    render();
    return self;
  }

  function rerenderAll() { instances = instances.filter(function (i) { return document.body.contains(i.host); }); instances.forEach(function (i) { i.refresh(); }); paintModalText(); }
  document.addEventListener('i18n:applied', rerenderAll);
  document.addEventListener('ztor:lang-changed', rerenderAll);
  document.addEventListener('ztor:devstate-changed', rerenderAll);

  window.ztorCodePicker = { mount: mount };
})();
