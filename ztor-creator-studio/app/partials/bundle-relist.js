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
       onDone                   // 可省略：上架成功後重畫，收到 ListingState.relistBundle 的回傳
     })
   已封存的組合包不從這裡走（要先按「解除封存」回到已下架，D298）——傳進來一律直接 return。
   consumer：bundle-detail.html、e-shop.html。 */
(function () {
  'use strict';

  function memberName(m) { return (m.product && m.product.name) || m.productId; }

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
