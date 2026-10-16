/* ============================================================
   purchase-limits.js · 限購（共用 vanilla JS 元件；D398 建，2026-10-12；D427 收斂成一種，2026-10-16）
   ------------------------------------------------------------
   規格：主規格 §7.2（商品）、§7.14「組合包的限購」（組合包，全庫唯一定義處）、5.1.6.1 F22（活動門票）；
   欄位落點 5.1.5.2 F9、5.1.5.1 §2.12、5.1.5.4 §4 F2、5.1.5.9 §2.3。
   D427（2026-10-16）：限購只留「每人總限購數量」——「每次交易限購數量」「限購次數」整組移除
   （修訂 D398 的三種上限、D400 組合包限購、D417 的 bookyay 每次交易帶入）。舊資料若帶 order／times 一律忽略（norm 只取 person）。
   三處（活動門票／商品／組合包）同一欄，句型一致、只換單位：
     tix＝張（活動門票）、item＝件（商品）、set＝組（組合包）。
   欄位名稱與每欄一句輔助說明（hint）都住在 js/i18n.js 的 pl.<unit>.<欄位>（＋ .hint），
   這支只負責畫與算，不另存一份字；元素帶 data-i18n，換語言時 i18n.js 直接換字、不必重畫。

   消費者：
     · js/purchase-conds.js   活動的「限購」條件卡（create-event 第 4 步、event-detail 活動層與門票彈窗）——只借 hintHTML()
     · create-product.html／product-detail.html   商品的限購開關底下那一欄（fieldsHTML，unit=item）
     · create-bundle.html／bundle-detail.html     組合包的「限購」區塊（blockHTML，unit=set：跟隨成員／覆寫）
     · js/bundle-editor.js（create-event 組合包彈窗 layout:'split'）  同上（2026-10-12 改接，UI-CHANGES 一百八十八；存在 b.limits）

   對外 API（window.ztorPurchaseLimits）：
     KEYS                                     ['person']（D427 起只剩每人總限購）
     （墓碑 2026-10-16 D427：KEYS_BKY〔bookyay 自動組合包只畫每人總限購＋每次交易〕退場——三處都只剩一欄，不必另給一組）
     norm(v)                                  → { person }（字串）｜null；舊資料的單一數字＝每人總限購，舊的 order／times 忽略
     has(v) / posInt(v)                       有沒有填任何一種／正整數或 null
     text(v, unit, T)                         一行摘要：「每人 3 件」（沒設＝不限）
     hintHTML(field, unit)                    一句輔助說明（purchase-conds 的條件卡用）
     fieldsHTML(o)                            一欄（標籤＋輸入框＋輔助說明＋就地錯誤）；o 見函式說明
     read(root, attr)                         從畫好的欄位讀回 { person }
     derive(members)                          組合包預設＝成員交集（取最嚴）＋門票上限（只能收窄的那條天花板）
     fromRules(rules)                         舊的票務商品 rules（cap='cap' 時）或條件清單形狀（rules.conds.cap）→ 已覆寫的值
     errors(lim, der, T)                      組合包限購的擋存錯誤 { 欄位: 訊息 }（lim＝null 是跟隨成員）
     blockHTML(lim, der, T, opts)             組合包的限購區塊（跟隨成員／已覆寫＋每人總限購一欄＋取自誰）
     onClick(e, holder, der) / onInput(e, holder)   互動（holder.limits：null＝跟隨、物件＝覆寫）；回傳 true＝要重畫／有處理
     syncErrors(root, holder, der, T)         把錯誤寫進就地的 [data-pl-err]，回傳錯誤數

   組合包預設的算法（§7.14「組合包的限購」）：
     · 每人總限購：成員上限（商品以件、門票以張）÷ 該成員每組用量，取整數部分；取所有成員的最小值。
     · 墓碑 2026-10-16（D427）：每次交易限購（同上換算）與限購次數（不換算、直接取最小值）兩條算法隨欄位退場。
     · 成員沒設該項的不參與；所有成員都沒設＝不限。
     · 門票成員換算出的值另記一份 ceil（天花板）：覆寫只能收窄到它以內（D342、D390 第 25 題）；商品成員推導的值可放寬也可收窄。
     · 跟隨成員時任一成員換算不足 1 組 → 擋存並就地說明是誰、怎麼改〔推導，比照 D342「限購最低 1 組」〕；覆寫值最低 1 組。
     · 覆寫（設上限）時每人總限購必填（D428 定案，2026-10-16）：空白擋存、就地「請填上限。」。
   ============================================================ */
(function () {
  'use strict';
  if (window.ztorPurchaseLimits) return;

  /* D427（2026-10-16）：限購只留每人總限購數量。
     墓碑：'order'（每次交易限購數量）、'times'（限購次數）兩欄，以及 KEYS_BKY（D417 bookyay 自動組合包的兩欄版）退場。 */
  var KEYS = ['person'];
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var tr = function (T, k) { var v = T ? T(k) : null; if (v == null || v === k) v = window.i18nT ? window.i18nT(k) : null; return v || k; };
  var Tdef = function (k) { return (window.i18nT && window.i18nT(k)) || k; };
  var posInt = function (v) {
    var s = String(v == null ? '' : v).trim();
    if (!/^\d+$/.test(s)) return null;
    var n = Number(s);
    return n > 0 ? n : null;
  };
  var zh = function () { return String(document.documentElement.lang || '').indexOf('zh') === 0; };
  var listSep = function () { return zh() ? '、' : ', '; };

  /* ── 資料形狀 ─────────────────────────────────────────────── */
  function norm(v) {
    if (v == null || v === '' || v === false) return null;
    if (typeof v === 'number' || typeof v === 'string') return { person: String(v) };
    var o = {};
    KEYS.forEach(function (k) { o[k] = v[k] == null ? '' : String(v[k]); });
    return o;
  }
  function has(v) {
    var n = norm(v);
    return !!n && KEYS.some(function (k) { return String(n[k]).trim() !== ''; });
  }
  function text(v, unit, T) {
    var n = norm(v), parts = [];
    if (n) KEYS.forEach(function (k) {
      var x = posInt(n[k]);
      if (x != null) parts.push(tr(T, 'pl.' + unit + '.' + k + '.v').replace('{n}', x));
    });
    return parts.length ? parts.join(' · ') : tr(T, 'pl.none');
  }

  /* ── 欄位（D427 起只剩每人總限購一欄）──────────────────────── */
  function hintHTML(f, unit) {
    var k = 'pl.' + unit + '.' + f + '.hint';
    return '<p class="field__hint" data-i18n="' + k + '">' + esc(Tdef(k)) + '</p>';
  }
  /* o：{ unit, vals, T, attr（輸入框的屬性名，預設 data-pl-f）, disabled, idPrefix（選填：輸入框 id 前綴）,
         extra(k)（選填：插在輔助說明下的一段 HTML，例如組合包的「取自誰」）, errs（true＝每欄留一個就地錯誤） }
     墓碑 2026-10-16（D427）：o.keys（只畫其中幾欄）隨 KEYS_BKY 退場。 */
  function fieldsHTML(o) {
    o = o || {};
    var unit = o.unit || 'item', vals = norm(o.vals) || {}, attr = o.attr || 'data-pl-f';
    return '<div class="limit-set__fields">' + KEYS.map(function (k) {
      var lk = 'pl.' + unit + '.' + k, id = o.idPrefix ? o.idPrefix + '-' + k : '';
      return '<div class="field limit-set__field" data-pl-field="' + k + '">' +
        '<label class="field__label"' + (id ? ' for="' + id + '"' : '') + ' data-i18n="' + lk + '">' + esc(tr(o.T, lk)) + '</label>' +
        '<input class="input limit-set__input" type="number" min="1" step="1" inputmode="numeric"' + (id ? ' id="' + id + '"' : '') +
          ' ' + attr + '="' + k + '" value="' + esc(vals[k] || '') + '" placeholder="' + esc(tr(o.T, 'pl.none')) + '" data-i18n-placeholder="pl.none"' +
          (o.disabled ? ' disabled' : '') + '>' +
        hintHTML(k, unit) +
        (o.extra ? (o.extra(k) || '') : '') +
        (o.errs ? '<p class="field__error" data-pl-err="' + k + '" hidden></p>' : '') +
      '</div>';
    }).join('') + '</div>';
  }
  function read(root, attr) {
    var o = { person: '' };
    if (!root) return o;
    attr = attr || 'data-pl-f';
    KEYS.forEach(function (k) {
      var el = root.querySelector('[' + attr + '="' + k + '"]');
      if (el) o[k] = String(el.value || '').trim();
    });
    return o;
  }

  /* ── 組合包：成員交集 ─────────────────────────────────────── */
  /* members：[{ kind:'product'|'ticket', name, per（每組用量，≥1）, lim（norm 形狀或 null） }] */
  function derive(members) {
    var d = { keys: {}, ceil: {}, short: {}, hasTicket: false, count: 0 };
    var list = (members || []).map(function (m) {
      return { kind: m.kind === 'ticket' ? 'ticket' : 'product', name: m.name || '', per: Math.max(1, Math.floor(Number(m.per) || 1)), lim: norm(m.lim) };
    });
    d.count = list.length;
    d.hasTicket = list.some(function (m) { return m.kind === 'ticket'; });
    KEYS.forEach(function (k) {
      var cands = list.filter(function (m) { return m.lim && posInt(m.lim[k]) != null; }).map(function (m) {
        var raw = posInt(m.lim[k]);
        return { kind: m.kind, name: m.name, per: m.per, raw: raw, sets: Math.floor(raw / m.per) };
      });
      if (!cands.length) { d.keys[k] = null; d.ceil[k] = null; d.short[k] = []; return; }
      var min = Math.min.apply(null, cands.map(function (c) { return c.sets; }));
      d.keys[k] = { sets: min, by: cands.filter(function (c) { return c.sets === min; }) };
      var tk = cands.filter(function (c) { return c.kind === 'ticket'; });
      d.ceil[k] = tk.length ? Math.min.apply(null, tk.map(function (c) { return c.sets; })) : null;
      d.short[k] = cands.filter(function (c) { return c.sets < 1; });
    });
    return d;
  }
  /* 跟隨時的值（字串；不限或不足 1 組＝空） */
  function followVals(der) {
    var o = {};
    KEYS.forEach(function (k) { var x = der && der.keys[k]; o[k] = x && x.sets >= 1 ? String(x.sets) : ''; });
    return o;
  }
  function fromRules(rules) {
    if (!rules) return null;
    if (rules.cap === 'cap') return { person: String(rules.person || '') };
    /* 2026-10-15（UI-CHANGES 二百三十四）：D366 起的條件清單形狀 rules.conds.cap 也讀（原本是 events-store 的 bookyay 自動組合包
       用的形狀，D429 起那批示範已刪；留著當舊資料的寬鬆讀取）。D427：只讀 person。 */
    var c = rules.conds && rules.conds.cap;
    if (c && typeof c === 'object') return { person: String(c.person || '') };
    return null;
  }
  /* 「取自誰」：商品寫名字＋件數算式，門票寫張數算式（墓碑 2026-10-16 D427：限購次數的「取自 {name}：{n} 次」pl.src.times 退場） */
  function whoText(k, c, T) {
    var u = tr(T, 'pl.u.' + (c.kind === 'ticket' ? 'tix' : 'item'));
    var key = c.per > 1 ? 'pl.src.conv' : 'pl.src.one';
    return tr(T, key).replace('{name}', c.name || '—').split('{n}').join(c.raw).split('{per}').join(c.per).split('{u}').join(u);
  }
  function srcText(k, der, T) {
    var x = der && der.keys[k];
    if (!x) return tr(T, 'pl.src.none');
    return x.by.map(function (c) { return whoText(k, c, T); }).join(listSep());
  }
  function shortMsg(c, T) {
    var u = tr(T, 'pl.u.' + (c.kind === 'ticket' ? 'tix' : 'item'));
    return tr(T, c.kind === 'ticket' ? 'pl.err.short.tix' : 'pl.err.short.item')
      .replace('{name}', c.name || '—').split('{n}').join(c.raw).split('{per}').join(c.per).split('{u}').join(u);
  }
  function errors(lim, der, T) {
    var e = {};
    if (!der) return e;
    var over = lim ? norm(lim) : null;
    KEYS.forEach(function (k) {
      var sh = (der.short[k] || []);
      if (!over) {                               // 跟隨成員：任一成員不足 1 組就擋
        if (sh.length) e[k] = sh.map(function (c) { return shortMsg(c, T); }).join(' ');
        return;
      }
      var tkShort = sh.filter(function (c) { return c.kind === 'ticket'; });
      if (tkShort.length) { e[k] = tkShort.map(function (c) { return shortMsg(c, T); }).join(' '); return; }   // 門票不足 1 組：覆寫解不開
      var raw = String(over[k] || '').trim();
      /* D428（2026-10-16 定案）：組合包的限購是「不限（跟隨成員都沒設），或設上限」——選了覆寫（設上限）就要填，空白擋存
         （原本只有含門票成員、有天花板時才擋，純商品組合包覆寫留空會被當成不限存過去） */
      if (!raw) { e[k] = tr(T, 'pl.err.required'); return; }
      if (posInt(raw) == null) { e[k] = tr(T, 'pl.err.int'); return; }
      var ceil = der.ceil[k];
      if (ceil != null && posInt(raw) > ceil) e[k] = tr(T, 'pl.err.ceil').split('{n}').join(ceil);
    });
    return e;
  }

  /* opts：{ disabled（檢視態：動作與欄位停用）,
             title（2026-10-12：true＝標題列左邊畫「限購」標題，頁面就不必在外面另放欄位標籤） }
     2026-10-12（使用者裁示，建立組合包改版）：「跟隨成員／已覆寫」由「徽章＋覆寫按鈕」改成標題列右側
     「跟隨成員預設」＋ on／off 開關（同購買條件的「跟隨活動預設」）：開＝跟隨成員、關＝覆寫。
     開關本身是 <button class="switch" role="switch">，鍵盤可操作；data-pl-act 照舊（開時按下＝override、關時按下＝follow），
     所以頁面的 onClick 委派不用改。
     墓碑 2026-10-16（D429）：locked／lockNote 兩個選項（bookyay 套票自動建立的組合包：不畫開關、改放「bookyay 帶入」徽章
     .limit-set__state〔pl.state.locked〕、說明句換成鎖定原因）隨自動組合包退場——已沒有消費者傳 locked。 */
  function blockHTML(lim, der, T, opts) {
    opts = opts || {};
    var over = lim ? norm(lim) : null;
    var state = over ? 'override' : 'follow';
    var vals = over || followVals(der);
    /* 說明句同時交代額度怎麼算（D400）：跟隨＝與成員共用額度、已覆寫＝獨立計算；含門票時門票部分永遠與單張門票共用 */
    var tix = !!(der && der.hasTicket);
    var sub = over ? (tix ? 'pl.sub.override.tix' : 'pl.sub.override') : (tix ? 'pl.sub.follow.tix' : 'pl.sub.follow');
    var act = '<span class="limit-set__follow"><span data-i18n="pl.follow.default">' + esc(tr(T, 'pl.follow.default')) + '</span>' +
          '<button type="button" class="switch' + (over ? '' : ' switch--on') + ' limit-set__switch" role="switch" aria-checked="' + (over ? 'false' : 'true') + '"' +
          ' data-pl-act="' + (over ? 'follow' : 'override') + '" aria-label="' + esc(tr(T, 'pl.follow.default')) + '" data-i18n-aria-label="pl.follow.default"' +
          (opts.disabled ? ' disabled aria-disabled="true"' : '') + '></button></span>';
    var extra = function (k) {
      if (!over) return '<p class="field__hint field__hint--fact limit-set__src" data-pl-src="' + k + '">' + esc(srcText(k, der, T)) + '</p>';
      var x = der && der.keys[k], parts = [];
      parts.push(tr(T, 'pl.src.was').replace('{v}', x && x.sets >= 1 ? String(x.sets) : tr(T, 'pl.none')));
      if (der && der.ceil[k] != null && der.ceil[k] >= 1) parts.push(tr(T, 'pl.src.ceil').split('{n}').join(der.ceil[k]));
      return '<p class="field__hint field__hint--fact limit-set__src" data-pl-src="' + k + '">' + esc(parts.join(' · ')) + '</p>';
    };
    return '<div class="limit-set limit-set--bundle" data-pl-block data-state="' + state + '">' +
      '<div class="limit-set__head">' +
        (opts.title ? '<span class="limit-set__title" data-i18n="tb.rules.cap">' + esc(tr(T, 'tb.rules.cap')) + '</span>' : '') +
        act +
      '</div>' +
      '<p class="limit-set__sub" data-i18n="' + sub + '">' + esc(tr(T, sub)) + '</p>' +
      fieldsHTML({ unit: 'set', vals: vals, T: T, disabled: !over || opts.disabled, extra: extra, errs: true }) +
    '</div>';
  }
  function onClick(e, holder, der) {
    var b = e.target.closest && e.target.closest('[data-pl-act]');
    if (!b || b.disabled) return false;
    if (b.dataset.plAct === 'override') holder.limits = followVals(der);   // 覆寫從跟隨的值起手
    else holder.limits = null;
    return true;
  }
  function onInput(e, holder) {
    var f = e.target.closest && e.target.closest('[data-pl-block] [data-pl-f]');
    if (!f || !holder.limits) return false;
    holder.limits[f.dataset.plF] = f.value;
    return true;
  }
  function syncErrors(root, holder, der, T) {
    var e = errors(holder && holder.limits, der, T);
    if (root) root.querySelectorAll('[data-pl-block] [data-pl-err]').forEach(function (p) {
      var m = e[p.dataset.plErr] || '';
      p.hidden = !m; p.textContent = m;
      var inp = p.parentNode && p.parentNode.querySelector('[data-pl-f]');
      if (inp) inp.setAttribute('aria-invalid', m ? 'true' : 'false');
    });
    return Object.keys(e).length;
  }

  window.ztorPurchaseLimits = {
    KEYS: KEYS, norm: norm, has: has, posInt: posInt, text: text,
    hintHTML: hintHTML, fieldsHTML: fieldsHTML, read: read,
    derive: derive, followVals: followVals, fromRules: fromRules, errors: errors,
    blockHTML: blockHTML, onClick: onClick, onInput: onInput, syncErrors: syncErrors
  };
})();
