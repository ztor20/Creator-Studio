/* ============================================================
   code-picker.js · 商品端優惠碼選擇欄（D458，2026-10-20）
   ------------------------------------------------------------
   window.ztorCodePicker.mount(host, opts) → 實例。
   2026-10-28 D486：「使用優惠碼」總開關移除——全店碼一律適用，消費頁直接放 host（不再有開關、不再收合）。host 裡面就是本元件：
     「優惠碼」勾選表（2026-10-28 起；原下拉多選）：全店碼固定勾著列在最前面，特定商品的碼可勾，表尾「建立新的優惠碼」。資料讀寫都走 js/discount-codes-store.js（window.ztorCodes）。

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

  /* ── 新碼彈窗（整頁共用一顆；重用 payout-modal） ── */
  var modal = null, modalOwner = null;
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
        '<div class="payout-dialog__head"><h2 class="payout-dialog__title" id="cpk-modal-title"></h2>' +
          '<button class="btn btn--icon" type="button" data-cpk-close><i data-lucide="x" class="ztor-icon"></i></button></div>' +
        '<div class="payout-dialog__body"><div class="stack" style="gap:var(--sp-16)">' +
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
        '<div class="payout-dialog__foot"><p class="payout-dialog__foot-note" data-cpk-err hidden></p>' +
          '<div class="payout-dialog__foot-actions"><button class="btn btn--outline" type="button" data-cpk-close data-cpk-t="cpk.m.cancel"></button>' +
          '<button class="btn btn--primary" type="button" data-cpk-save data-cpk-t="cpk.m.save"></button></div></div>' +
      '</section>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) {
      var t = e.target;
      if (t === modal || t.closest('[data-cpk-close]')) { closeModal(); return; }
      if (t.closest('[data-cpk-gen]')) { document.getElementById('cpk-m-code').value = genCode(10); return; }
      if (t.closest('[data-cpk-save]')) { saveModal(); return; }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal && !modal.hidden) closeModal(); });
    return modal;
  }
  function paintModalText() {
    if (!modal) return;
    modal.querySelectorAll('[data-cpk-t]').forEach(function (el) { el.textContent = T(el.getAttribute('data-cpk-t')); });
    modal.querySelector('#cpk-modal-title').textContent = T('cpk.new');
    modal.querySelector('[data-cpk-gen]').textContent = T('cpk.m.gen');
    modal.querySelector('#cpk-m-code').placeholder = 'SUMMER25';
  }
  function openModal(owner) {
    ensureModal(); modalOwner = owner; paintModalText();
    modal.querySelector('#cpk-m-code').value = '';
    modal.querySelector('#cpk-m-pct').value = '10';
    modal.querySelector('#cpk-m-start').value = ''; modal.querySelector('#cpk-m-end').value = '';
    var nm = owner.opts.label ? owner.opts.label() : '';
    modal.querySelector('[data-cpk-scope]').textContent = T('cpk.m.scope.v').replace('{name}', nm || T('cpk.m.scope.this'));
    var err = modal.querySelector('[data-cpk-err]'); err.hidden = true;
    modal.hidden = false; document.body.classList.add('is-modal-open');
    if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(modal);
    modal.querySelector('#cpk-m-code').focus();
  }
  function closeModal() { if (modal) modal.hidden = true; document.body.classList.remove('is-modal-open'); modalOwner = null; }
  function saveModal() {
    var o = modalOwner; if (!o) return;
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
    o.addNew({ code: code.toUpperCase(), pct: pct, period: period, status: status });
    closeModal();
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
    /* ── 2026-10-28：下拉多選（combobox）改成勾選表（使用者在 lab-code-picker.html 選定方案 B）──
       一張表、五欄：勾選｜優惠碼｜適用範圍｜折扣｜期間｜狀態；表尾整列是「建立新的優惠碼」文字按鈕。
       全店碼（autoApplied）一律適用：勾選框固定勾著、停用（checkbox.css 的空心橘）。特定商品的碼（selectable＋選了的＋暫存新碼）可勾。
       沒勾的列整列淡掉、狀態徽章退成停用樣。鎖定（上架中）或唯讀（檢視態）時全部停用、表尾按鈕收起。
       墓碑：.combobox／.tag-input__field／chip 輸入框、menuHTML、data-cpk-search／-menu／-add／-rm、focusin／input／Esc 下拉處理。 */
    var BADGE = { active: 'success', scheduled: 'info', ended: 'neutral', disabled: 'neutral', exhausted: 'warning' };
    function badgeHTML(i) {
      var txt = i.pending ? T('cpk.pending') : (i.status === 'active' ? T('cpk.status.active') : statusText(i));
      return '<span class="badge badge--' + (i.pending ? 'neutral' : (BADGE[i.status] || 'neutral')) + '">' + esc(txt) + '</span>';
    }
    function rowHTML(i, on, fixed, scopeKey) {
      var dis = fixed || st.locked || st.ro;
      return '<label class="code-picker__row' + (on ? '' : ' code-picker__row--off') + (dis ? ' code-picker__row--fixed' : '') + '">' +
        '<span class="zcheck__control"><input class="zcheck__input" type="checkbox"' + (fixed ? '' : ' data-cpk-pick="' + esc(i.code) + '"') +
          (on ? ' checked' : '') + (dis ? ' disabled' : '') + ' aria-label="' + esc(i.code) + '"><span class="zcheck__box"></span></span>' +
        '<span class="code-picker__code">' + esc(i.code) + '</span>' +
        '<span class="code-picker__cell code-picker__scope">' + esc(T(scopeKey)) + '</span>' +
        '<span class="code-picker__num">' + esc(i.pct) + '%</span>' +
        '<span class="code-picker__cell code-picker__period">' + esc(i.period || '—') + '</span>' +
        '<span>' + badgeHTML(i) + '</span></label>';
    }
    function render() {
      var C2 = Codes(); if (!C2) return;
      var auto = C2.autoApplied();
      /* 可勾的碼：碼端可選的特定商品碼＋已選（含已結束的舊選取）＋暫存新碼；全店碼不重複列 */
      var autoCodes = auto.map(function (c) { return c.code; });
      var list = C2.selectable(st.sel).map(function (c) { return c.code; });
      st.sel.forEach(function (c) { if (list.indexOf(c) < 0) list.push(c); });
      st.pending.forEach(function (p) { if (list.indexOf(p.code) < 0) list.push(p.code); });
      list = list.filter(function (c) { return autoCodes.indexOf(c) < 0; });
      var html = '<div class="code-picker__field">' + (opts.hideLabel ? '' : '<div class="field__label">' + esc(T('cpk.title')) + '</div>') +
        '<div class="code-picker__tbl">' +
          '<div class="code-picker__head"><span></span><span>' + esc(T('cpk.col.code')) + '</span><span class="code-picker__cell">' + esc(T('cpk.col.scope')) + '</span>' +
            '<span class="code-picker__num">' + esc(T('cpk.col.pct')) + '</span><span class="code-picker__cell code-picker__period">' + esc(T('cpk.col.period')) + '</span><span>' + esc(T('cpk.col.status')) + '</span></div>' +
          auto.map(function (c) { return rowHTML({ code: c.code, pct: c.pct, period: c.period, status: c.status }, true, true, 'cpk.scope.all'); }).join('') +
          list.map(function (code) { return rowHTML(codeInfo(code), st.sel.indexOf(code) >= 0, false, 'cpk.scope.items'); }).join('') +
          (st.locked || st.ro ? '' : '<div class="code-picker__add"><button type="button" class="btn btn--ghost btn--block" data-cpk-new><i data-lucide="plus" class="ztor-icon"></i><span>' + esc(T('cpk.new')) + '</span></button></div>') +
        '</div>' +
        /* 墓碑 2026-10-28（使用者：「這兩個不需要」）：欄位下方兩行說明 cpk.hint／cpk.auto.hint 拿掉；只留鎖定時（cpk.locked）那一句 */
        (st.locked ? '<div class="field__hint">' + esc(T('cpk.locked')) + '</div>' : '') + '</div>';
      host.innerHTML = '<div class="code-picker"' + (st.locked || st.ro ? ' data-locked' : '') + '>' + html + '</div>';
      if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(host);
    }
    /* 重畫整塊後把焦點還給剛才那一格（鍵盤勾選後焦點才不會掉到 body，2026-10-28 驗收補） */
    function changed() {
      var ae = document.activeElement, key = host.contains(ae) && ae.getAttribute ? ae.getAttribute('data-cpk-pick') : null;
      render();
      if (key) { var back = host.querySelector('[data-cpk-pick="' + key.replace(/"/g, '\\"') + '"]'); if (back) back.focus(); }
      if (opts.onChange) opts.onChange({ codes: st.sel.slice(), pending: st.pending.slice() });
    }

    host.addEventListener('change', function (e) {
      var t = e.target; if (st.locked || st.ro || !t.hasAttribute || !t.hasAttribute('data-cpk-pick')) return;
      var code = t.getAttribute('data-cpk-pick');
      if (t.checked) { if (st.sel.indexOf(code) < 0) st.sel.push(code); }
      else {
        st.sel = st.sel.filter(function (x) { return x !== code; });
        st.pending = st.pending.filter(function (p) { return p.code !== code; });   /* 暫存的新碼取消勾＝不建立（同原本移除 chip） */
      }
      changed();
    });
    host.addEventListener('click', function (e) {
      if (st.locked || st.ro) return;
      if (e.target.closest('[data-cpk-new]')) openModal(self);
    });
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
