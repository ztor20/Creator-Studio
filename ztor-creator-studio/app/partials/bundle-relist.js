/* bundle-relist.js — 組合包上架的成員閘門（spec 0-設計規格書 §7.14 · D289／D298；2026-09-23 抽共用）
   規格：組合包從已下架回到上架時，成員一律要跟著在上架中（§7.14「組合包成交條件」不變式）。
     成員已封存（或草稿、查不到）→ 擋下，什麼都不改，提示先各自解除封存（D298）；
     成員只是已下架     → 先列出來請創作者確認，確認後連帶重新上架，再上架組合包（D289）；
     成員都在上架中     → 直接上架。
   為什麼有這支：同一套閘門有兩個入口——組合包詳情頁的上架開關與頁首「上架」鈕（bundle-detail.html），
   以及電子商店清單已下架列的「上架」（e-shop.html）。D298 曾把清單那個入口退場、邏輯只剩詳情頁一份；
   2026-09-23 使用者裁決清單要重新提供「上架」，兩處就必須共用同一份判斷，不再各寫一次。
   純 vanilla、零相依（只用 window.ListingState）。彈窗殼由呼叫端提供——清單與詳情頁各有自己的確認彈窗。

   用法：
     window.ZtorBundleRelist.run({
       bundle,                  // 組合包資料物件（ListingState 的欄位契約）
       getProduct: id => …,     // 成員查詢（通常是 ProductsStore.get）
       name,                    // 彈窗標題要帶的組合包名稱（省略＝bundle.name）
       askConfirm,              // 呼叫端的確認彈窗：{ title, body, items, okKey, okFallback, noCancel, onConfirm }
       T,                       // 可省略的翻譯函式 (key, fallback)
       commit,                  // 可省略：上架成功後逐一寫回工作階段（組合包＋連帶上架的成員）
       onDone,                  // 可省略：上架成功後重畫，收到 ListingState.relistBundle 的回傳
       ticketBlocked            // 可省略：(ticketPlanItem) => true 表示這筆票券成員現在不能賣；省略＝用下方 defaultTicketBlocked
     })
   票券成員（活動組合包，2026-10-16 修正）：票券不是商品，不查封存／下架——ListingState.bundleRelistPlan 把它放在 plan.tickets。
     可不可賣看活動與門票本身，口徑沿用 bundle-detail 的 evBoundsOf().canList 與 e-shop 的 eventBundleModel()（D292／D363）：
       活動狀態為已排程／售票中／進行中且未下架 → 可上架；草稿、已結束、已取消、活動已下架、活動查不到 → 擋；
       （D437 決定一，2026-10-16：已結束移出可上架，與 D352「活動結束自動下架」一致；已結束／已取消擋下時改用 ticket-ended-body 那一句）
       允許的門票全部已隨場次刪除（D391 第 13 題 goneAllOf）→ 擋。擋下時用另一組文案（不是「先解除封存」）。
   已封存的組合包不從這裡走（要先按「解除封存」回到已下架，D298）——傳進來一律直接 return。
   consumer：bundle-detail.html、e-shop.html。 */
(function () {
  'use strict';

  function memberName(m) { return (m.product && m.product.name) || m.productId; }

  /* 票券成員的 id 形如 tix:<活動 id>:<門票 id>+<門票 id>（bundle-detail tixKey）；成員物件有 eventId／tierIds 時優先用 */
  function ticketRef(t) {
    var m = t.member || {}, id = String(t.productId || ''), parts = id.split(':');
    return {
      eventId: m.eventId || (parts.length >= 3 ? parts[1] : ''),
      tierIds: (m.tierIds && m.tierIds.length) ? m.tierIds : (parts.length >= 3 ? parts.slice(2).join(':').split('+').filter(Boolean) : [])
    };
  }
  function defaultTicketBlocked(t) {
    var EV = window.ztorEvents;
    if (!EV || !EV.get) return false;   /* 沒有活動資料可查就不擋（原型的頁面一定有載 events-store） */
    var ref = ticketRef(t), ev = ref.eventId ? EV.get(ref.eventId) : null;
    if (!ev) return true;
    var st = ev.status;
    var canList = (st === 'on-sale' || st === 'live' || st === 'scheduled') && !ev.unlisted;   /* D437 決定一：已結束不能重新上架 */
    if (!canList) return true;
    var tiers = ev.tiers || [];
    if (ref.tierIds.length && !ref.tierIds.some(function (id) { return tiers.some(function (x) { return x.id === id; }); })) return true;
    return false;
  }

  /* D437 決定一：這筆票券成員被擋，是因為活動已結束或已封存（不是活動暫時下架、門票被刪）——文案講「不能重新上架」，不叫人先讓活動回到上架 */
  function ticketEventOver(t) {
    var EV = window.ztorEvents, ref = ticketRef(t), ev = (EV && EV.get && ref.eventId) ? EV.get(ref.eventId) : null;
    return !!ev && (ev.status === 'ended' || !!ev.archived);   /* D457：已取消階段退場，已封存取代 */
  }

  function run(opts) {
    var o = opts || {};
    var LS = window.ListingState;
    var bundle = o.bundle, ask = o.askConfirm;
    if (!LS || !bundle || typeof ask !== 'function') return;
    if (LS.isArchived(bundle)) return;
    var T = o.T || function (k, fb) { return (window.i18nT ? window.i18nT(k) : null) || fb; };
    var getP = o.getProduct || function () { return null; };
    var name = o.name || bundle.name || '';

    var plan = LS.bundleRelistPlan(bundle, getP);
    var tixBlocked = typeof o.ticketBlocked === 'function' ? o.ticketBlocked : defaultTicketBlocked;
    var tixStops = (plan.tickets || []).filter(function (t) { return tixBlocked(t); });

    /* 擋下：純告知，只有一顆「知道了」，什麼都不改 */
    if (plan.blocked.length) {
      ask({
        title: T('e-shop.relist.blocked-title', '“{n}” has archived items').replace('{n}', name),
        body: T('e-shop.relist.blocked-body', 'Unarchive these items first, then list the bundle:'),
        items: plan.blocked.map(memberName),
        okKey: 'e-shop.relist.blocked-ok', okFallback: 'Got it', noCancel: true,
        onConfirm: null
      });
      return;
    }

    /* 票券擋下：活動或門票現在不能賣（不是封存，不叫創作者去解除封存） */
    if (tixStops.length) {
      var over = tixStops.every(ticketEventOver);
      ask({
        title: (over ? T('e-shop.relist.ticket-ended-title', '“{n}” can’t be listed again') : T('e-shop.relist.ticket-blocked-title', '“{n}” can’t be listed yet')).replace('{n}', name),
        body: over
          ? T('e-shop.relist.ticket-ended-body', 'The event has ended or is archived, so a bundle with its tickets can’t be listed again:')
          : T('e-shop.relist.ticket-blocked-body', 'The event or its tickets can’t be sold right now. List the event again (or keep at least one allowed ticket), then list the bundle:'),
        items: tixStops.map(memberName),
        okKey: 'e-shop.relist.blocked-ok', okFallback: 'Got it', noCancel: true,
        onConfirm: null
      });
      return;
    }

    var go = function () {
      var r = LS.relistBundle(bundle, getP);
      if (typeof o.commit === 'function' && r.ok) {
        o.commit(bundle);
        r.relisted.forEach(o.commit);
      }
      if (typeof o.onDone === 'function') o.onDone(r);
    };

    /* 連帶上架先確認：列出會被一起拉上來的已下架成員 */
    if (plan.unlisted.length) {
      ask({
        title: T('e-shop.relist.title', 'Relist “{n}”?').replace('{n}', name),
        body: T('e-shop.relist.members-body', 'These unlisted items are relisted with it:'),
        items: plan.unlisted.map(memberName),
        okKey: 'e-shop.relist.members-confirm', okFallback: 'Relist all',
        onConfirm: go
      });
      return;
    }

    go();
  }

  window.ZtorBundleRelist = { run: run };
})();
