/* ============================================================
   code-picker.js · 商品端優惠碼選擇欄（D458，2026-10-20）
   ------------------------------------------------------------
   window.ztorCodePicker.mount(host, opts) → 實例。
   「使用優惠碼」開關由消費頁自己放；開關打開後才顯示 host，host 裡面就是本元件：
     「優惠碼」多選（已自動適用的全部商店碼以鎖定標籤放在輸入框最前面）＋「建立新的優惠碼」。資料讀寫都走 js/discount-codes-store.js（window.ztorCodes）。

   opts
     pending  （選填）重畫時帶回上次暫存的新碼（活動建立流程的組合包編輯器每次重畫都重新 mount）
     key      商品或組合包 id；建立流程（還沒有 id）傳 null——選取與新碼暫存在元件裡，儲存時 commit(key, label)
     label    () => 顯示名稱（新碼彈窗的「特定商品：…」與碼端範圍清單用）
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
      ro: !!opts.readonly,     /* 唯讀（檢視態）：同樣停用，但不說鎖定原因 */
      menu: false, q: ''
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
    function render() {
      var C2 = Codes(); if (!C2) return;
      var auto = C2.autoApplied();
      var html = '';
      html += '<div class="code-picker__field"><div class="field__label">' + esc(T('cpk.title')) + '</div>' +
        '<div class="combobox"><div class="tag-input__field" data-cpk-field>' +
        /* 2026-10-27：已自動適用的全部商店碼放進輸入框最前面，鎖定（沒有移除鈕）；原本欄位上方獨立的「已自動適用」群組退場 */
        auto.map(function (c) {
          var s = c.status !== 'active' && STATUS_KEY[c.status] ? '<span class="chip__tag">' + esc(T(STATUS_KEY[c.status])) + '</span>' : '';
          return '<span class="chip chip--static code-picker__auto-chip" title="' + esc(T('cpk.auto')) + '"><i data-lucide="lock" class="ztor-icon code-picker__lock"></i><span>' + esc(c.code) + '</span><span class="code-picker__pct">' + esc(c.pct) + '%</span>' + s + '</span>';
        }).join('') +
        st.sel.map(function (code) {
          var i = codeInfo(code), s = statusText(i);
          return '<span class="chip chip--removable"><span>' + esc(i.code) + '</span><span class="code-picker__pct">' + esc(i.pct) + '%</span>' +
            (s ? '<span class="chip__tag">' + esc(s) + '</span>' : '') +
            '<button class="chip__remove" type="button" data-cpk-rm="' + esc(code) + '" aria-label="Remove"><i data-lucide="x" class="ztor-icon"></i></button></span>';
        }).join('') +
        '<input class="tag-input__entry" type="search" data-cpk-search role="combobox" aria-expanded="false" autocomplete="off" placeholder="' + esc(T('cpk.select.ph')) + '"' + (st.locked || st.ro ? ' disabled' : '') + ' value="' + esc(st.q) + '">' +
        '<i data-lucide="chevron-down" class="combobox__chevron ztor-icon"></i></div>' +
        '<div class="combobox__menu" data-cpk-menu' + (st.menu && !st.locked && !st.ro ? '' : ' hidden') + '>' + menuHTML() + '</div></div>' +
        /* 墓碑 2026-10-28（使用者：「這兩個不需要」）：欄位下方兩行說明——cpk.hint「選了碼，就是把這個加進該碼的特定商品範圍；都不選時，只適用全部商店的碼」
           與 cpk.auto.hint「範圍是全部商店的碼，不必另外選」——都拿掉；只留鎖定時（cpk.locked）說明為什麼不能改的那一句 */
        (st.locked ? '<div class="field__hint">' + esc(T('cpk.locked')) + '</div>' : '') + '</div>';
      var wasFocus = host.contains(document.activeElement) && document.activeElement.hasAttribute && document.activeElement.hasAttribute('data-cpk-search');
      host.innerHTML = '<div class="code-picker"' + (st.locked || st.ro ? ' data-locked' : '') + '>' + html + '</div>';
      if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(host);
      if (wasFocus) { var inp = host.querySelector('[data-cpk-search]'); if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } }
    }
    function menuHTML() {
      var q = (st.q || '').trim().toLowerCase();
      var all = Codes().selectable(st.sel).filter(function (c) { return st.sel.indexOf(c.code) < 0 && (!q || c.code.toLowerCase().indexOf(q) >= 0); });
      var pend = st.pending.filter(function (p) { return st.sel.indexOf(p.code) < 0; });
      /* 2026-10-20：「建立新的優惠碼」是下拉裡的一個選項（固定在清單最上面（下拉常被卡片邊界裁掉，放最上面才看得到）），不再是欄位下方的獨立按鈕 */
      var newOpt = '<button type="button" class="combobox__opt code-picker__new-opt" data-cpk-new><i data-lucide="plus" class="ztor-icon"></i><span class="combobox__opt-text"><span class="combobox__opt-name">' + esc(T('cpk.new')) + '</span></span></button>';
      if (!all.length && !pend.length) return newOpt + '<div class="combobox__empty">' + esc(T('cpk.empty')) + '</div>';
      return newOpt + all.map(function (c) {
        return '<button type="button" class="combobox__opt" data-cpk-add="' + esc(c.code) + '"><span class="combobox__opt-text"><span class="combobox__opt-name">' + esc(c.code) + '</span>' +
          '<span class="combobox__opt-meta">' + esc(c.pct) + '% · ' + esc(c.period) + '</span></span></button>';
      }).join('');
    }
    function changed() { render(); if (opts.onChange) opts.onChange({ codes: st.sel.slice(), pending: st.pending.slice() }); }

    host.addEventListener('click', function (e) {
      var t = e.target;
      if (st.locked || st.ro) return;
      var add = t.closest('[data-cpk-add]');
      if (add) { var c = add.getAttribute('data-cpk-add'); if (st.sel.indexOf(c) < 0) st.sel.push(c); st.q = ''; st.menu = false; changed(); return; }
      var rm = t.closest('[data-cpk-rm]');
      if (rm) {
        var code = rm.getAttribute('data-cpk-rm');
        st.sel = st.sel.filter(function (x) { return x !== code; });
        st.pending = st.pending.filter(function (p) { return p.code !== code; });
        changed(); return;
      }
      if (t.closest('[data-cpk-new]')) { st.menu = false; openModal(self); return; }
      if (t.closest('[data-cpk-field]') && !t.closest('[data-cpk-rm]')) {
        var inp = host.querySelector('[data-cpk-search]'); if (inp && document.activeElement !== inp) inp.focus();
        /* 輸入框已有焦點（按過 Esc 或點外面關掉下拉）時再點欄位不會再觸發 focusin，要自己展開 */
        if (!st.menu) {
          st.menu = true; var m = host.querySelector('[data-cpk-menu]');
          if (m) { m.innerHTML = menuHTML(); m.hidden = false; if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(m); }
          if (inp) inp.setAttribute('aria-expanded', 'true');
        }
      }
    });
    host.addEventListener('focusin', function (e) {
      if (st.locked || st.ro || !e.target.hasAttribute || !e.target.hasAttribute('data-cpk-search') || st.menu) return;
      st.menu = true; var m = host.querySelector('[data-cpk-menu]'); if (m) { m.innerHTML = menuHTML(); m.hidden = false; if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(m); }
      e.target.setAttribute('aria-expanded', 'true');
    });
    host.addEventListener('input', function (e) {
      if (!e.target.hasAttribute || !e.target.hasAttribute('data-cpk-search')) return;
      st.q = e.target.value; st.menu = true;
      var m = host.querySelector('[data-cpk-menu]'); if (m) { m.innerHTML = menuHTML(); m.hidden = false; if (window.ztorIcons && window.ztorIcons.applyIcons) window.ztorIcons.applyIcons(m); }
    });
    document.addEventListener('click', function (e) {
      if (!st.menu || host.contains(e.target) || !document.body.contains(host)) return;
      st.menu = false; var m = host.querySelector('[data-cpk-menu]'); if (m) m.hidden = true;
    });
    host.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && st.menu) { st.menu = false; var m = host.querySelector('[data-cpk-menu]'); if (m) m.hidden = true; }
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
    self.setLocked = function (b) { b = !!b; if (st.locked === b) return; st.locked = b; if (b) st.menu = false; render(); };
    self.setReadonly = function (b) { b = !!b; if (st.ro === b) return; st.ro = b; if (b) st.menu = false; render(); };
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
      st.pending = []; st.q = ''; st.menu = false;
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
