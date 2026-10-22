/* ZtorTixTierTable — 組合包「允許的門票」勾選表（D296／D380；2026-10-16 D433 抽成共用）
 *
 * 建立組合包（create-bundle 票券列的展開區）與組合商品細節頁（bundle-detail 編輯模式的票券列下方）
 * 畫同一張表、同一份 markup：.bd-tbl.bd-tbl--tix（樣式在 ds-components/bundle-editor.css，
 * 放進 .member-table__exp 時的欄軌在 ds-components/member-table.css）。原本只有 create-bundle 的
 * renderTierTable() 內嵌一份，bundle-detail 要補「改允許的門票」時抽出來，兩頁不各寫一套。
 *
 * ZtorTixTierTable.html(opts) → HTML 字串（勾選框｜門票名（獨立票加徽章）｜單價｜剩餘＋不足 n 張）
 *   tiers   門票陣列（events-store 的 tier：id／name／price／qty／sold／standalone）
 *   picked  已勾選的 tier id 陣列
 *   qty     每組張數 n——已勾、剩餘不足 n 張的列整列灰化（.bd-tbl__row--short）＋「不足 n 張」
 *   attr    勾選框身上的 data 屬性名，值＝tier id（create-bundle 用 data-cb-tier-check、bundle-detail 用 data-bd-tier-check）
 *   locked  true＝整表鎖定：勾選框 disabled、表加 .bd-tbl--locked（已售出後不能改，5.1.5.9 §2.3）
 *   T(k, fb) 翻譯；esc 跳脫；name(t) 顯示名；money(t) 單價字串；left(t) 剩餘張數；fmtInt 千分位
 *   ev      選填（D465，2026-10-21）：所屬活動。有給就以 ztorEvents.tierLeftForBundle(ev, t, bundleId) 算剩餘張數，
 *           取代呼叫端的 left(t)——剩餘張數＝張數 − 已售 − 單售鎖定 − 其他組合包已鎖定 − 未鎖定格的保留
 *           （主規格 §7.14「組合包：鎖定套數」；舊算法只扣已售）。bundleId＝本組合包 id（自己的鎖定不算「其他」）
 */
(function () {
  function html(o) {
    var T = o.T, esc = o.esc, q = o.qty || 1, picked = o.picked || [], attr = o.attr || 'data-tix-tier-check';
    var locked = !!o.locked;
    var S = window.ztorEvents;
    var leftOf = (o.ev && S && S.tierLeftForBundle) ? function (t) { return S.tierLeftForBundle(o.ev, t, o.bundleId); } : o.left;
    return '<div class="bd-tbl bd-tbl--tix' + (locked ? ' bd-tbl--locked' : '') + '">' +
      '<div class="bd-tbl__head"><span></span>' +
        '<span class="bd-tbl__col">' + esc(T('cpp.bd.tbl.tier', 'Tier')) + '</span>' +
        '<span class="bd-tbl__col bd-tbl__col--num">' + esc(T('cpp.bd.tbl.price', 'Price')) + '</span>' +
        '<span class="bd-tbl__col bd-tbl__col--num">' + esc(T('cpp.bd.tbl.qty', 'Left')) + '</span></div>' +
      (o.tiers || []).map(function (t) {
        var on = picked.indexOf(t.id) >= 0, left = leftOf(t), short = on && left < q;
        /* 2026-09-22 方案 A：不足一組改用畫面表達——整列灰化（`--short`）＋「不足 n 張」徽章。 */
        return '<label class="bd-tbl__row bd-tbl__row--pick' + (on ? '' : ' bd-tbl__row--off') + (short ? ' bd-tbl__row--short' : '') + '">' +
          '<span class="zcheck__control"><input class="zcheck__input" type="checkbox" ' + attr + '="' + esc(t.id) + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + '><span class="zcheck__box"></span></span>' +
          '<span class="bd-tbl__name">' + esc(o.name(t)) +
            (t && t.standalone ? ' <span class="badge badge--neutral">' + esc(T('cpp.bd.tbl.solo', 'Standalone')) + '</span>' : '') + '</span>' +
          '<span class="bd-tbl__num">' + esc(o.money(t)) + '</span>' +
          '<span class="bd-tbl__num">' + (left === 0 ? '<span class="text-error">0</span>' : esc(o.fmtInt(left))) + (short ? '<span class="ztor-badge bd-tbl__short">' + esc(T('cpp.bd.sp.tix.short', 'under {n}').replace('{n}', String(q))) + '</span>' : '') + '</span>' +
        '</label>';
      }).join('') +
      '</div>';
  }
  window.ZtorTixTierTable = { html: html };
})();
