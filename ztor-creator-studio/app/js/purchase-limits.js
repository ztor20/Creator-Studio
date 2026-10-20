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
     · js/purchase-conds.js   活動的「限購」條件卡（create-event 第 4 步與 event-detail 的門票彈窗；D460 起沒有活動層）——只借 hintHTML()
     · create-product.html／product-detail.html   商品的限購開關底下那一欄（fieldsHTML，unit=item）
     · create-bundle.html／bundle-detail.html     組合包的「限購」區塊（blockHTML，unit=set：自己的設定、獨立計算）
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
     fromRules(rules)                         舊的票務商品 rules（cap='cap' 時）或條件清單形狀（rules.conds.cap）→ 組合包自己的限購值
     errors(lim, T)                           組合包限購的擋存錯誤 { 欄位: 訊息 }（空白＝不限，沒有錯）
     blockHTML(lim, T, opts)                  組合包的限購區塊（標題＋一句額度說明＋每人總限購一欄）
     onInput(e, holder)                       輸入（holder.limits：null＝不限、物件＝自己設的上限）；回傳 true＝有處理
     syncErrors(root, holder, T)              把錯誤寫進就地的 [data-pl-err]，回傳錯誤數

   組合包的限購（§7.14「組合包的限購」，D456，2026-10-20）：
     · 不繼承成員：預設不限，成員商品與門票的限購都不帶入，成員改了也不跟；沒有「跟隨成員／已覆寫」，也沒有開關。
     · 可以比成員寬或嚴；設上限時最低 1 組；空白＝不限（不再擋存）。
     · 額度一律獨立計算：買組合包不扣成員商品或單張門票的限購額度，反過來也一樣。
     · 墓碑 2026-10-20（D456）：derive／followVals（成員交集與跟隨值）、onClick（跟隨／覆寫開關）、取自誰（pl.src.*）、
       門票天花板（pl.err.ceil）、成員不足 1 組（pl.err.short.*）隨「不繼承」退場；D428「覆寫時必填」同時失效（空白＝不限）。
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

  /* ── 組合包：自己的設定（D456 起不繼承成員）──────────────────── */
  function fromRules(rules) {
    if (!rules) return null;
    if (rules.cap === 'cap') return { person: String(rules.person || '') };
    /* 2026-10-15（UI-CHANGES 二百三十四）：D366 起的條件清單形狀 rules.conds.cap 也讀（原本是 events-store 的 bookyay 自動組合包
       用的形狀，D429 起那批示範已刪；留著當舊資料的寬鬆讀取）。D427：只讀 person。 */
    var c = rules.conds && rules.conds.cap;
    if (c && typeof c === 'object') return { person: String(c.person || '') };
    return null;
  }
  /* 空白＝不限；有填就要是 1 以上的整數（最低 1 組）。不看成員、不看門票（D456） */
  function errors(lim, T) {
    var e = {};
    var n = lim ? norm(lim) : null;
    if (!n) return e;
    KEYS.forEach(function (k) {
      var raw = String(n[k] || '').trim();
      if (raw && posInt(raw) == null) e[k] = tr(T, 'pl.err.int');
    });
    return e;
  }

  /* opts：{ disabled（檢視態：欄位停用）,
             title（2026-10-12：true＝標題列左邊畫「限購」標題，頁面就不必在外面另放欄位標籤） }
     D456（2026-10-20）：標題列右側的「跟隨成員預設」開關與「取自誰」事實句整個拿掉；說明句固定交代額度獨立計算。
     墓碑 2026-10-16（D429）：locked／lockNote 兩個選項（bookyay 套票自動建立的組合包）隨自動組合包退場。 */
  function blockHTML(lim, T, opts) {
    opts = opts || {};
    var vals = norm(lim) || {};
    return '<div class="limit-set limit-set--bundle" data-pl-block>' +
      (opts.title ? '<div class="limit-set__head"><span class="limit-set__title" data-i18n="tb.rules.cap">' + esc(tr(T, 'tb.rules.cap')) + '</span></div>' : '') +
      '<p class="limit-set__sub" data-i18n="pl.sub">' + esc(tr(T, 'pl.sub')) + '</p>' +
      fieldsHTML({ unit: 'set', vals: vals, T: T, disabled: !!opts.disabled, errs: true }) +
    '</div>';
  }
  function onInput(e, holder) {
    var f = e.target.closest && e.target.closest('[data-pl-block] [data-pl-f]');
    if (!f) return false;
    if (!holder.limits) holder.limits = { person: '' };
    holder.limits[f.dataset.plF] = f.value;
    return true;
  }
  function syncErrors(root, holder, T) {
    var e = errors(holder && holder.limits, T);
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
    fromRules: fromRules, errors: errors,
    blockHTML: blockHTML, onInput: onInput, syncErrors: syncErrors
  };
})();
