// js/listing-state.js — 上架三開關 × 庫存池的單一推導層（spec 0-設計規格書 §7.14 · D241）
//
// 為什麼有這支：§7.14 之前，「這件東西現在是什麼狀態」與「組合包還能賣幾套」散在五個頁面
// 各寫一份（e-shop 的 renderStatus、product-detail 的徽章、bundle-detail 的 min(成員)、
// create-product 的兩軸四時間）。規則一改就要改五次，改漏一次就分岔。本檔把 §7.14 的
// 全部推導收成純函式：頁面只負責收欄位與畫畫面，「算出來的結果」一律問這裡。
//
// 純 vanilla、零相依。頁面用 <script src="js/listing-state.js?v=r2.2"></script> 載入，
// 掛在 window.ListingState；node 直接 require 也可以（自測用）。
//
// ── 資料模型（欄位名是對外契約，不得各頁自行改名）────────────────────────────
//   單售商品／組合包共有的三個開關與排程：
//     listed      boolean       上架／下架。總閘門：下架＝這個管道不能賣、連結全失效
//     listAt      string|null   上架日期與時間（ISO）。未到＝還沒上架
//     unlistAt    string|null   下架日期與時間（ISO）。已過＝已下架
//     shown       boolean       顯示於商店／隱藏。隱藏＝商店找不到，但非公開連結仍可買
//     privateLink string|null   非公開連結（只有隱藏時才有值）
//     saleStart   string|null   開賣日期與時間。null＝上架即開賣（onSale 為 true 時）
//     saleEnd     string|null   停售日期與時間。null＝不自動停售
//     onSale      boolean       開賣設定（2026-09-18 · D290）。缺值視為 true（沿用 D241「上架即開賣」）；
//                               false＝「未開賣」——上架、顯示都照舊，只是還沒開放結帳。下架（手動、定時到期、組合包連動、
//                               成員連動）一律把它退回 false 並清掉四個排程時間；重新上架後維持 false，要販售須再設開賣。
//                               推導：上架＋顯示＋未開賣 → coming（即將開賣，不帶日期）。拍賣同欄位＝「未開拍」。
//     lowThreshold number       低庫存門檻（0＝不提醒）
//     archived    boolean       已封存（2026-09-18 · D284，§7.14「封存與不可刪除」）。三開關之外的一態：
//                               只有已下架的可以封存；封存＝離開主清單、細節頁唯讀、三開關與排程不可調；
//                               唯一動作是解除封存（unarchive，2026-09-22 · D298 修訂 D284／D289）：archived 回 false、
//                               回到已下架（listed 維持 false）、設定照舊保留、不自動上架；要販售再走已下架→上架（relist）。
//                               封存必然是下架：isUnlisted() 對 archived 一律回 true。
//     unlistReason { type: 'member-unlisted', productId, productName, auto?: boolean } | null
//                               組合包被「一同下架」時記的原因（2026-09-18 · D288：成員單售下架時創作者確認一同下架，
//                               或成員定時下架到期自動連動＝auto:true；取代 D284 的 'member-archived'——封存不再檢查組合包）；
//                               重新上架時清掉。純資訊欄位，推導不看它。
//   拍賣（2026-09-18 · D285，§7.14「適用範圍」）：同一組三開關與 archived，欄位名完全相同，另加：
//     saleStart   對拍賣＝開拍時間（null＝跟著上架一起開拍，開拍時間＝實際上架時間）
//     duration    競標時長（天數）。停售時間＝結標時間＝開拍時間＋時長，由 auctionSaleEnd() 導出、不手填，
//                 所以拍賣物件上不存 saleEnd（存了也會被忽略）。
//     拍賣無庫存池、無鎖定量：推導一律 qty＝Infinity，soldout／low 不會出現。
//   單售商品另有庫存池：
//     pool = { total: number | 'unlimited',
//              locks: { single: number|null, bundles: { [bundleId]: number|null } } }
//     鎖定量兩態（2026-09-11 使用者裁決，對齊規格 5.1.5.4 F4／5.1.5.1 §2.10「0 或不填＝不鎖定」）：
//       null／欄位不存在／0 ＝ 這個管道沒鎖定，與其他未鎖定管道共用沒有被鎖定的庫存量
//       正數               ＝ 這個管道處於鎖定模式，只能賣這麼多
//     「賣完」是剩餘數量的事，不是鎖定欄位的事：鎖定量是配額，售罄由該管道還剩幾件決定
//     （原型沒有逐管道的已售數，鎖定量在示範上即等於剩餘配額）。舊版曾把 0 當「鎖定且賣完」，
//     與規格相反，已撤。
//   組合包沒有池，只有成員與自己的限量硬上限：
//     members = [{ productId, qty }]   qty 省略＝一套扣一件
//     cap     = number | null          限量硬上限（§7.2 版本型態軸）
//     lockSets = number | null         鎖定套數 N（2026-09-11 使用者重定義，規格 D266 待補）：
//                                      null／0＝不鎖定（各成員與單售共用未鎖定量）；正數＝鎖定 N 套
//     alloc   = { [productId]: { [variantIndex]: number|null } }
//                                      多選項成員「選填」的逐規格分配；Σ ≤ N × 每套用量，少分配＝只限總數、規格不拘
//   組合鎖定寫回成員商品的方式（applyBundleLock，唯一寫入口；成員商品身上的組合鎖定是導出值，不手改）：
//     單一選項成員   product.pool.locks.bundles[bundleId] = N × 每套用量
//     多選項成員     product.pool.locks.bundles[bundleId] = N × 每套用量（總量，含未指定規格的部分）
//                    variants[i].locks.bundles[bundleId] = alloc[productId][i]（有指定的規格）
//                    未指定的餘量 ＝ 總量 − Σ 已指定：從商品整體的未鎖定量扣、不落在任何一個規格上
//
// ── 兩條硬規則（§7.14）──────────────────────────────────────────────────────
//   1. 鎖定的管道不吃沒有被鎖定的庫存量：某管道鎖了 N 件，它就只能賣那 N 件，池裡還有沒鎖的也不給它。
//   2. 鎖定量 ≤ 沒有被鎖定的庫存量：表單層擋（validateLock）。
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ListingState = api;
}(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  var INF = Infinity;

  /* ── 小工具 ──────────────────────────────────────────────────────────── */

  /* 缺欄位不該把狀態翻面：listed／shown 沒填時視為「有」，其餘欄位沒填視為 null。
     產品頁的 seed 資料一定會補齊這兩個欄位，這裡的預設只是防呆。 */
  function flag(v, dflt) { return (v === undefined || v === null) ? dflt : !!v; }

  function time(v) {
    if (v === undefined || v === null || v === '') return null;
    var t = (v instanceof Date) ? v.getTime() : new Date(v).getTime();
    return isNaN(t) ? null : t;
  }

  function nowMs(now) {
    if (now === undefined || now === null) return Date.now();
    return (now instanceof Date) ? now.getTime() : new Date(now).getTime();
  }

  function passed(v, at) { var t = time(v); return t !== null && t <= at; }
  function future(v, at) { var t = time(v); return t !== null && t > at; }

  function num(v) {
    if (v === INF) return INF;
    var n = Number(v);
    return isNaN(n) ? 0 : n;
  }

  /* 鎖定量解讀：null／undefined／''／0 ＝ 沒鎖定；正數 ＝ 鎖定模式（規格「0 或不填＝不鎖定」，2026-09-11）。 */
  function lockVal(v) { if (v === undefined || v === null || v === '') return null; var n = num(v); return n > 0 ? n : null; }

  function pool(product) {
    var p = (product && product.pool) || {};
    var locks = p.locks || {};
    return { total: p.total, single: lockVal(locks.single), bundles: locks.bundles || {} };
  }

  /* ── 庫存池 ──────────────────────────────────────────────────────────── */

  /** 池裡所有管道的鎖定量合計（沒鎖定的管道不計）。 */
  function lockedTotal(product) {
    var p = pool(product), sum = p.single || 0, k, v;
    for (k in p.bundles) {
      if (!Object.prototype.hasOwnProperty.call(p.bundles, k)) continue;
      v = lockVal(p.bundles[k]);
      if (v !== null) sum += v;
    }
    return sum;
  }

  /* 多選項商品（2026-09-11）：鎖定住在 variants[i].locks，商品層的 pool.locks 只是加總（products-store 的
     seedListing 補的、給「鎖給單售／鎖給組合」這種彙總數字看）。可售量與「全鎖了嗎」不能拿加總算——
     M 鎖了、L 沒鎖時，單售仍拿得到 L 的剩餘量。所以 channelQty／freeQty／allChannelsLocked 遇到有 variants
     的多選項商品，一律改走逐組合版本（variantsChannelQty／variantsFree／variantsAllLocked），
     消費頁不必自己分支（product-detail 的 KPI 原本自己分支，結果與這裡一致）。 */
  function isMulti(product) {
    return !!(product && product.variant === 'multiple' && (product.variants || []).length);
  }

  /** 沒有被鎖定的庫存量＝目前在庫 − 所有鎖定量。不限量的池回 Infinity；不會回負數。 */
  /* 多選項商品：各組合鎖定裡「未指定規格」的餘量（商品層總量 − Σ 各規格已指定），這部分不落在任何規格上，
     但已經是組合的配額，商品整體的未鎖定量要扣掉它。 */
  function multiUnassigned(product, exceptBundle) {
    var p = pool(product), sum = 0, k, total, assigned;
    for (k in p.bundles) {
      if (!Object.prototype.hasOwnProperty.call(p.bundles, k)) continue;
      if (exceptBundle && k === exceptBundle) continue;
      total = lockVal(p.bundles[k]);
      if (total === null) continue;
      assigned = variantsChannelLocked(product.variants, { bundle: k }) || 0;
      if (total > assigned) sum += total - assigned;
    }
    return sum;
  }
  function freeQty(product) {
    if (isMulti(product)) return Math.max(0, variantsFree(product.variants) - multiUnassigned(product));
    var p = pool(product);
    if (p.total === 'unlimited' || p.total === INF) return INF;
    return Math.max(0, num(p.total) - lockedTotal(product));
  }

  /**
   * channel：'single'，或 { bundle: '<bundleId>' }（也接受直接給 bundleId 字串）。
   * 回這個管道目前的鎖定量；沒鎖定回 null。
   */
  function lockOf(product, channel) {
    var p = pool(product);
    if (channel === 'single' || channel === undefined || channel === null) return p.single;
    if (typeof channel === 'string') return lockVal(p.bundles[channel]);
    if (channel.bundle) return lockVal(p.bundles[channel.bundle]);
    return null;
  }

  /** 這個管道是不是鎖定模式（鎖 0 件也算鎖定）。 */
  function hasLock(product, channel) { return lockOf(product, channel) !== null; }

  /**
   * 某個管道現在能賣幾件。
   * 有鎖定（>0）就是鎖定量——鎖定的管道不吃沒有被鎖定的庫存量；沒鎖定就與其他未鎖定管道共用沒有被鎖定的庫存量。
   */
  function channelQty(product, channel) {
    if (isMulti(product)) {
      var bid = (channel && typeof channel === 'object') ? channel.bundle : ((typeof channel === 'string' && channel !== 'single') ? channel : null);
      /* 組合管道有商品層鎖定（＝N × 用量）就是那個數；其餘管道逐規格加總，再扣掉別的組合「未指定規格」的餘量 */
      if (bid) { var bl = lockOf(product, { bundle: bid }); if (bl !== null) return bl; }
      return Math.max(0, variantsChannelQty(product.variants, channel) - multiUnassigned(product, bid));
    }
    var locked = lockOf(product, channel);
    return locked === null ? freeQty(product) : locked;
  }

  /* ── 逐選項組合的鎖定（2026-09-09 使用者裁決；規格未定義粒度，見 ASSUMPTIONS UIA-146）──
     多選項商品的庫存住在每一個選項組合上，鎖定因此也逐組合各自記，形狀與池的鎖定相同：
       variant.locks = { single: n|null, bundles: { <bundleId>: n|null } }
     解讀不變（null／undefined／0＝沒鎖定，正數＝鎖定模式），規則也不變——
     鎖定的管道只吃自己那一份，沒鎖定的管道共用該組合剩下的量。
     商品層的 pool.locks 仍然只服務單一規格商品；多選項商品的管道分配表改讀這裡的加總，
     兩套數字不互相混算。 */
  function vLocks(variant) {
    var l = (variant && variant.locks) || {};
    return { single: lockVal(l.single), bundles: l.bundles || {} };
  }
  /** 這個選項組合在某個管道的鎖定量；沒鎖定回 null。channel 形狀同 lockOf。 */
  function variantLockOf(variant, channel) {
    var l = vLocks(variant);
    if (channel === 'single' || channel === undefined || channel === null) return l.single;
    if (typeof channel === 'string') return lockVal(l.bundles[channel]);
    if (channel.bundle) return lockVal(l.bundles[channel.bundle]);
    return null;
  }
  /** 這個選項組合所有管道的鎖定量合計。 */
  function variantLockedTotal(variant) {
    var l = vLocks(variant), sum = l.single || 0, k, v;
    for (k in l.bundles) {
      if (!Object.prototype.hasOwnProperty.call(l.bundles, k)) continue;
      v = lockVal(l.bundles[k]);
      if (v !== null) sum += v;
    }
    return sum;
  }
  function variantStock(variant) { return num(variant && variant.stock); }
  /** 這個選項組合還沒被鎖走的量；不會回負數。 */
  function variantFree(variant) {
    return Math.max(0, variantStock(variant) - variantLockedTotal(variant));
  }
  /** 這個選項組合在某個管道現在能賣幾件（規則同 channelQty，只是範圍縮到這一個組合）。 */
  function variantChannelQty(variant, channel) {
    var locked = variantLockOf(variant, channel);
    return locked === null ? variantFree(variant) : locked;
  }
  /* 商品層的加總：多選項商品的管道分配表是唯讀彙總，數字全部由這三個函式算。 */
  function variantsTotal(variants) {
    return (variants || []).reduce(function (a, v) { return a + variantStock(v); }, 0);
  }
  function variantsFree(variants) {
    return (variants || []).reduce(function (a, v) { return a + variantFree(v); }, 0);
  }
  function variantsChannelQty(variants, channel) {
    return (variants || []).reduce(function (a, v) { return a + variantChannelQty(v, channel); }, 0);
  }
  /** 某個管道在這件商品身上有沒有任何一個組合設了鎖定（決定彙總列要顯示數字還是「未鎖定」）。 */
  function variantsChannelLocked(variants, channel) {
    var any = false, sum = 0;
    (variants || []).forEach(function (v) {
      var l = variantLockOf(v, channel);
      if (l !== null) { any = true; sum += l; }
    });
    return any ? sum : null;
  }
  /**
   * 「未鎖定的量沒有人拿得到」的判定（多選項版）：只有當每一個還有剩餘量的組合，
   * 它的每一個管道都設了鎖定，剩下的才真的沒人能賣。
   * 只看加總會誤判——M 鎖了、L 沒鎖時，單售仍然拿得到 L 的剩餘量。
   */
  function variantsAllLocked(variants, channels) {
    var chs = channels || ['single'];
    var any = false, all = true;
    (variants || []).forEach(function (v) {
      if (variantFree(v) <= 0) return;
      any = true;
      if (!chs.every(function (c) { return variantLockOf(v, c) !== null; })) all = false;
    });
    return any && all;
  }

  /** 逐組合的鎖定上限＝該組合沒被別的管道鎖走的量（含這個管道自己現有的鎖定量）。 */
  function validateVariantLock(variant, channel, wanted) {
    var own = variantLockOf(variant, channel);
    var max = variantFree(variant) + (own === null ? 0 : own);
    if (wanted === null || wanted === '' || wanted === undefined) return { ok: true, max: max };
    var w = num(wanted);
    return { ok: w >= 0 && w <= max, max: max };
  }

  /**
   * 組合包可售量＝各成員在這個組合包的可售量取最小值，再與組合自己的限量硬上限取最小。
   * productsById：{ [productId]: product }。查不到的成員視為 0（不可售）。
   */
  function bundleQty(bundle, productsById) {
    var members = (bundle && bundle.members) || [];
    var map = productsById || {};
    var min = INF;
    var sets = bundleLockSets(bundle);
    for (var i = 0; i < members.length; i++) {
      var m = members[i];
      var p = map[m.productId || m.id];
      if (!p) return 0;
      /* 草稿成員（2026-09-11 示範資料補齊時定的規則；規格未寫）：草稿還沒定價、沒上架、庫存未確認，
         視同可售 0——含草稿成員的組合整組售罄，直到那件商品完成建立。與「查不到成員視為 0」同一精神。 */
      if (p.draft || p.isDraft || p.status === 'draft') return 0;
      /* §7.14／5.1.5.4 §6 ④（D087 語意由 D241 更新；2026-09-11 稽核補上）：任一成員下架、
         或不在販售窗口內（未到開賣／已停售）→ 組合不可售，視同可售 0。 */
      var at = nowMs();
      if (isUnlisted(p, at) || !isOnSale(p) || future(p.saleStart, at) || passed(p.saleEnd, at)) return 0;
      var per = num(m.qty) > 0 ? num(m.qty) : 1;   /* 一套要用到同一件商品好幾件時 */
      /* 成員是多選項商品時，這個組合拿得到的量＝各選項組合在本組合可售量之和
         （D258：組合包的鎖定逐選項組合設定；買家挑哪一個組合出貨仍是產品待確認）。 */
      /* 鎖定套數 N（2026-09-11）：有鎖定時組合可售量就是 N，不再逐成員取最小——成員身上的組合鎖定是由 N 導出的 */
      if (sets !== null) { if (sets < min) min = sets; continue; }
      var q = channelQty(p, { bundle: bundle.id });
      var s = (q === INF) ? INF : Math.floor(q / per);
      if (s < min) min = s;
    }
    var cap = (bundle && bundle.cap !== undefined && bundle.cap !== null) ? num(bundle.cap) : null;
    if (cap !== null && cap < min) min = cap;
    return min;
  }

  /* ── 組合包鎖定套數（2026-09-11 使用者重定義；規格 D266 待補）──────────── */
  function memberPer(m) { return num(m && m.qty) > 0 ? num(m.qty) : 1; }
  /** 組合目前鎖定幾套；不鎖定回 null。 */
  function bundleLockSets(bundle) { return lockVal(bundle && bundle.lockSets); }
  /** 某成員在這個組合的鎖定總量（＝N × 每套用量）；不鎖定回 null。 */
  function bundleMemberLock(bundle, m) {
    var n = bundleLockSets(bundle);
    return n === null ? null : n * memberPer(m);
  }
  /**
   * N 的上限＝各成員 floor((未鎖定 ＋ 本組合現有鎖定) ÷ 每套用量) 取最小。
   * 回 { max, by }：by＝壓出這個上限的成員商品（同上限取先遇到的）；不限量成員不參與。查不到的成員視為 0。
   */
  function bundleMaxSets(bundle, productsById) {
    var members = (bundle && bundle.members) || [], map = productsById || {};
    var max = INF, by = null;
    for (var i = 0; i < members.length; i++) {
      var m = members[i], p = map[m.productId || m.id];
      if (!p) return { max: 0, by: null };
      var free = freeQty(p);
      if (free === INF) continue;
      var own = lockOf(p, { bundle: bundle.id }) || 0;
      var n = Math.floor((free + own) / memberPer(m));
      if (n < max) { max = n; by = p; }
    }
    return { max: max, by: by };
  }
  /** 多選項成員的逐規格分配（選填）。回 { assigned, total, over, rows:[{vi, qty, max, bad}] } */
  function bundleAllocOf(bundle, m, product) {
    var total = bundleMemberLock(bundle, m);
    var a = ((bundle && bundle.alloc) || {})[m.productId] || {};
    var assigned = 0, rows = [];
    (product && product.variants || []).forEach(function (v, vi) {
      var q = lockVal(a[vi]);
      var own = variantLockOf(v, { bundle: bundle.id }) || 0;
      var max = variantFree(v) + own;
      if (q !== null) assigned += q;
      rows.push({ vi: vi, qty: q, max: max, bad: q !== null && q > max });
    });
    return { assigned: assigned, total: total, over: total !== null && assigned > total, rows: rows };
  }
  /**
   * 把組合的鎖定寫回各成員商品（唯一寫入口）。productsById 缺成員就跳過那一個。
   * 單一選項：pool.locks.bundles[id] = N × 用量；多選項：商品層寫總量、各規格寫 alloc（沒指定＝null）。
   */
  function applyBundleLock(bundle, productsById) {
    var members = (bundle && bundle.members) || [], map = productsById || {};
    for (var i = 0; i < members.length; i++) {
      var m = members[i], p = map[m.productId || m.id];
      if (!p) continue;
      if (!p.pool) p.pool = { total: 'unlimited', locks: { single: null, bundles: {} } };
      if (!p.pool.locks) p.pool.locks = { single: null, bundles: {} };
      if (!p.pool.locks.bundles) p.pool.locks.bundles = {};
      var total = bundleMemberLock(bundle, m);
      p.pool.locks.bundles[bundle.id] = total;
      if (isMulti(p)) {
        var a = ((bundle.alloc) || {})[m.productId] || {};
        p.variants.forEach(function (v, vi) {
          if (!v.locks) v.locks = { single: null, bundles: {} };
          if (!v.locks.bundles) v.locks.bundles = {};
          v.locks.bundles[bundle.id] = (total === null) ? null : lockVal(a[vi]);
        });
      }
    }
    return bundle;
  }

  /**
   * 所有管道都鎖定了嗎？——真的話沒有被鎖定的庫存量沒有人能賣，畫面要提醒創作者重新分配。
   * bundlesUsingIt：包含這件商品的組合包（物件或 id 字串皆可）。
   */
  function allChannelsLocked(product, bundlesUsingIt) {
    var list = bundlesUsingIt || [];
    if (isMulti(product)) {
      var chs = ['single'].concat(list.map(function (b) { return { bundle: (typeof b === 'string') ? b : b.id }; }));
      return variantsAllLocked(product.variants, chs);
    }
    if (!hasLock(product, 'single')) return false;
    for (var i = 0; i < list.length; i++) {
      var id = (typeof list[i] === 'string') ? list[i] : list[i].id;
      if (!hasLock(product, { bundle: id })) return false;
    }
    return true;
  }

  /* ── 狀態推導 ────────────────────────────────────────────────────────── */

  /* 八態的徽章樣式對照。tone 直接對上 badge.css 的既有變體（badge--<tone>）。 */
  var STATUS_META = {
    archived: { i18n: 'shop.status.archived', tone: 'neutral' },
    draft:    { i18n: 'shop.status.draft',    tone: 'neutral' },
    unlisted: { i18n: 'shop.status.unlisted', tone: 'neutral' },
    hidden:   { i18n: 'shop.status.hidden',   tone: 'neutral' },
    ended:    { i18n: 'shop.status.ended',    tone: 'neutral' },
    soldout:  { i18n: 'shop.status.soldout',  tone: 'error'   },
    coming:   { i18n: 'shop.status.coming',   tone: 'info'    },
    low:      { i18n: 'shop.status.low',      tone: 'warning' },
    live:     { i18n: 'shop.status.live',     tone: 'success' }
  };

  /** 徽章的 class 字串，省得每個消費頁自己拼。 */
  function badgeClass(status) {
    var meta = STATUS_META[status];
    return 'badge badge--' + ((meta && meta.tone) || 'neutral');
  }

  function isDraftOf(entity, ctx) {
    if (ctx && ctx.isDraft !== undefined) return !!ctx.isDraft;
    return !!(entity && (entity.isDraft || entity.draft || entity.status === 'draft'));
  }

  /* ── 封存（spec §7.14「封存與不可刪除」· D284，2026-09-18）──────────────────
     封存掛在販售管道上、與三開關同一層：封存單售不牽連組合包、封存組合包不牽連成員。
     這裡只放判斷與最小的狀態轉移；「要不要先問、彈窗長什麼樣」是頁面的事。 */
  function isArchived(entity) { return !!(entity && entity.archived); }

  /** 可以封存嗎＝已下架（含排定上架未到、定時下架已過）、不是草稿、還沒封存。上架中不可封存（要先下架）。 */
  function canArchive(entity, now) {
    if (!entity || isArchived(entity) || isDraftOf(entity, null)) return false;
    return isUnlisted(entity, nowMs(now));
  }

  /** 封存：archived＝true、總閘門關上、尚未生效的上架排程一併取消（§7.14 封存前提第三句）。顯示與開賣沿用原值、不動。
      封存只看「已下架」，不檢查組合包（D288 修正 D284 裁決四）：成員的連動在下架時已處理（unlistWithBundles）。 */
  function archive(entity) {
    if (!entity) return entity;
    entity.archived = true;
    entity.listed = false;
    entity.listAt = null;
    entity.unlistAt = null;
    return entity;
  }

  /** 開賣設定（D290）：缺值視為開賣（舊資料與 seed 沿用 D241「上架即開賣」）。 */
  function isOnSale(entity) { return flag(entity && entity.onSale, true); }

  /* 開賣退回「未開賣」＋四個排程時間清空（D290）。下架與重新上架共用：兩邊之後都是「沒有任何排程、未開賣」。 */
  function resetSale(entity) {
    entity.listAt = null;
    entity.unlistAt = null;
    entity.saleStart = null;
    entity.saleEnd = null;
    entity.onSale = false;
    if (entity.listedAt !== undefined) entity.listedAt = null;   /* 拍賣原型記的「實際上架時間」，這輪上架已結束 */
    return entity;
  }

  /** 解除封存（Unarchive，2026-09-22 · D298 修訂 D284／D289）：已封存 → 已下架。只把 archived 放回 false、listed 維持 false，
      其他一律不動——排程與開賣在下架時已依 D290 清掉並退回未開賣，顯示沿用；不自動上架，要販售再走 relist。
      不連動組合包（成員解除封存不會把含它的組合包拉上來；組合包解除封存也不動成員）。 */
  function unarchive(entity) {
    if (!entity || !isArchived(entity)) return entity;
    entity.archived = false;
    entity.listed = false;
    return entity;
  }

  /** 重新上架（Relist）：已下架 → 上架；顯示沿用。D298（2026-09-22）起只服務已下架——已封存的要先 unarchive，
      這裡對已封存一律不動（回原物件），不再順手解除封存。
      D290（2026-09-18）：不恢復開賣——回來是「上架＋顯示（沿用）＋未開賣」，四個排程時間維持空，要販售須再設開賣。 */
  function relist(entity) {
    if (!entity || isArchived(entity)) return entity;
    entity.listed = true;
    entity.unlistReason = null;
    resetSale(entity);
    return entity;
  }

  /** 下架（Unlist）：總閘門關上；D290：四個排程時間（listAt／unlistAt／saleStart／saleEnd）清空、開賣退回未開賣。
      顯示／隱藏、內容、價格、庫存、鎖定等其他設定保留。reason 給「一同下架」的組合包記原因用（可省略）。
      連動（unlistWithBundles）、定時到期（scheduledUnlistCascade／expireScheduled）都走這裡，規則只寫一次。
      拍賣同一支：清上架排程與開拍時間（saleStart），重新上架後為未開拍。 */
  function unlist(entity, reason) {
    if (!entity) return entity;
    entity.listed = false;
    entity.unlistReason = reason || null;
    resetSale(entity);
    return entity;
  }

  /**
   * 單售下架前的連動清單（§7.14「下架確認與組合包連動」· D288；D284 時掛在封存、D288 移到下架）：
   * 這件商品仍是哪些「上架中」組合包的成員。已下架、已封存、草稿的組合包不算（成員留在裡面、只是不能賣）。
   * bundles：候選組合包清單（通常是 ProductsStore.bundlesUsing(productId)）。回傳組合包物件陣列。
   */
  function listedBundlesUsing(productId, bundles, now) {
    var at = nowMs(now), out = [];
    (bundles || []).forEach(function (b) {
      if (!b || isArchived(b) || isDraftOf(b, null) || isUnlisted(b, at)) return;
      var inIt = (b.members || []).some(function (m) { return (m.productId || m.id) === productId; });
      if (inIt) out.push(b);
    });
    return out;
  }

  /* 墓碑（2026-09-18 · D288）：archiveWithBundles(product, bundles) 移除——封存不再檢查組合包，
     「一同下架這些組合包」整組搬到下架動作上（unlistWithBundles）。 */

  function memberReason(product, auto) {
    return { type: 'member-unlisted', productId: product && product.id, productName: product && product.name, auto: !!auto };
  }

  /**
   * 「一同下架這些組合包」（§7.14 · D288 裁決二）：先把每個上架中的組合包下架並記原因（因成員下架），再下架單售。
   * 呼叫端已經拿使用者確認過才呼叫；取消時什麼都不做即可。回傳被連動的組合包陣列（呼叫端拿去重畫／寫回）。
   */
  function unlistWithBundles(product, bundles) {
    var list = bundles || [];
    list.forEach(function (b) { unlist(b, memberReason(product, false)); });
    unlist(product);
    return list;
  }

  function resolveProduct(map, id) {
    if (!map) return null;
    if (typeof map === 'function') return map(id) || null;
    return map[id] || null;
  }

  /**
   * 組合包重新上架前的成員盤點（§7.14 不變式：上架中的組合包，成員一律在上架中 · D288 裁決三；做法依 D289）：
   *   unlisted＝目前已下架（含排定上架未到、定時下架已過）但未封存的成員——重新上架時會一起被拉上來（先確認）；
   *   blocked ＝已封存的成員（不可由組合包順手解除封存，要先各自解除封存 · D298）＋草稿或查不到的成員（沒有可上架的東西）。
   * productsById：{ [id]: product } 或 function(id)。兩個清單都是 [{ productId, product|null }]。
   */
  function bundleRelistPlan(bundle, productsById, now) {
    var at = nowMs(now), unlisted = [], blocked = [];
    ((bundle && bundle.members) || []).forEach(function (m) {
      var id = m.productId || m.id, p = resolveProduct(productsById, id);
      if (!p || isDraftOf(p, null) || isArchived(p)) blocked.push({ productId: id, product: p });
      else if (isUnlisted(p, at)) unlisted.push({ productId: id, product: p });
    });
    return { unlisted: unlisted, blocked: blocked };
  }
  /** 相容別名：不在上架中的成員（unlisted ＋ blocked）。 */
  function unlistedMembers(bundle, productsById, now) {
    var plan = bundleRelistPlan(bundle, productsById, now);
    return plan.blocked.concat(plan.unlisted);
  }

  /**
   * 組合包重新上架（自已下架；已封存的組合包要先 unarchive，D298），D289：
   *   有已封存（或草稿）成員 → 擋下，回 { ok:false, blockers }，什麼都不改（提示改成「先解除封存」· D298）；
   *   否則已下架的成員連帶重新上架（呼叫端已拿使用者確認過「這些單售會一起重新上架」才呼叫），再 relist 組合包，
   *   回 { ok:true, relisted:[product…] }。反方向不連動：單售重新上架不會把組合包拉上來。
   */
  function relistBundle(bundle, productsById, now) {
    var plan = bundleRelistPlan(bundle, productsById, now);
    if (plan.blocked.length) return { ok: false, blockers: plan.blocked, relisted: [] };
    var relisted = [];
    plan.unlisted.forEach(function (m) { if (m.product) { relist(m.product); relisted.push(m.product); } });
    relist(bundle);
    return { ok: true, blockers: [], relisted: relisted };
  }

  /**
   * 定時下架到期的自動連動（D288 裁決二後半）：成員單售的 unlistAt 已過，其「上架中」組合包一併自動下架、
   * 記 unlistReason（auto:true）。純推導、可重複呼叫（已下架的組合包會被跳過）。
   * 回傳 [{ bundle, product }]，呼叫端拿去寫回與通知。
   */
  function scheduledUnlistCascade(bundles, productsById, now) {
    var at = nowMs(now), out = [];
    (bundles || []).forEach(function (b) {
      if (!b || isArchived(b) || isDraftOf(b, null) || isUnlisted(b, at)) return;
      var hit = null;
      ((b.members || []).some(function (m) {
        var p = resolveProduct(productsById, m.productId || m.id);
        if (p && !isArchived(p) && flag(p.listed, true) && passed(p.unlistAt, at)) { hit = p; return true; }
        return false;
      }));
      if (!hit) return;
      unlist(b, memberReason(hit, true));
      out.push({ bundle: b, product: hit });
    });
    return out;
  }

  /**
   * 定時下架到期的落實（D290，2026-09-18）：unlistAt 已過的上架中東西，原本只靠 isUnlisted() 推導成「已下架」、
   * 欄位不動；D290 要求到期下架也清四個時間、退回未開賣，所以載入時把它真的 unlist() 一次（呼叫端寫回工作階段）。
   * 要在 scheduledUnlistCascade 之後跑——連動判斷靠「成員 listed 且 unlistAt 已過」找出觸發的成員。
   * entities：商品／組合包／拍賣任一清單。回傳被落實的實體陣列。
   */
  function expireScheduled(entities, now) {
    var at = nowMs(now), out = [];
    (entities || []).forEach(function (e) {
      if (!e || isArchived(e) || isDraftOf(e, null)) return;
      if (flag(e.listed, true) && passed(e.unlistAt, at)) { unlist(e); out.push(e); }
    });
    return out;
  }

  function isUnlisted(entity, at) {
    if (at === undefined) at = nowMs();   /* 對外（e-shop 顯示開關停用）呼叫時不帶時間 */
    if (isArchived(entity)) return true;                    /* 封存必然下架（§7.14） */
    if (!flag(entity && entity.listed, true)) return true;
    if (future(entity && entity.listAt, at)) return true;     /* 排定上架但還沒到 */
    if (passed(entity && entity.unlistAt, at)) return true;   /* 自動下架日期與時間已過 */
    return false;
  }

  /**
   * 清單徽章的主徽章。優先序固定，不得各頁自行調換：
   *   archived → draft → unlisted → hidden → ended → soldout → coming → low → live
   * （已封存優先於其他所有徽章，§7.14「清單徽章與篩選」· D284）
   * ctx = { qty: number|Infinity, lowThreshold?: number, isDraft?: boolean }
   * qty 由呼叫端先用 channelQty()／bundleQty() 算好傳進來——同一件商品在不同管道
   * 的狀態本來就不同，元件層不猜是哪個管道。
   */
  function deriveStatus(entity, ctx, now) {
    var at = nowMs(now);
    var c = ctx || {};
    if (isArchived(entity)) return 'archived';
    if (isDraftOf(entity, c)) return 'draft';
    if (isUnlisted(entity, at)) return 'unlisted';
    if (!flag(entity && entity.shown, true)) return 'hidden';
    return saleStatus(entity, c, at);
  }

  /* hidden 那一層之後的四態（細節頁與 deriveFlags 共用）。 */
  function saleStatus(entity, c, at) {
    /* D290：未開賣（上架＋顯示、尚未設開賣）→ 即將開賣，不帶日期；排在停售／售罄之前——沒開賣談不上賣完或停售 */
    if (!isOnSale(entity)) return 'coming';
    if (passed(entity && entity.saleEnd, at)) return 'ended';
    var qty = (c.qty === undefined) ? INF : c.qty;
    if (qty === 0) return 'soldout';
    if (future(entity && entity.saleStart, at)) return 'coming';
    var low = num(c.lowThreshold !== undefined ? c.lowThreshold : (entity && entity.lowThreshold));
    if (low > 0 && qty !== INF && qty <= low) return 'low';
    return 'live';
  }

  /**
   * 細節頁用：主徽章不含「已隱藏」那一層，隱藏另外用一顆徽章並排。
   * 清單頁只有一顆徽章的位置，所以用 deriveStatus（hidden 蓋掉售罄）；
   * 細節頁擺得下兩顆，「售罄」與「已隱藏」是兩件事，要同時看得到。
   */
  function deriveFlags(entity, ctx, now) {
    var at = nowMs(now);
    var c = ctx || {};
    if (isArchived(entity)) return { status: 'archived', hidden: false };
    if (isDraftOf(entity, c)) return { status: 'draft', hidden: false };
    if (isUnlisted(entity, at)) return { status: 'unlisted', hidden: false };
    return { status: saleStatus(entity, c, at), hidden: !flag(entity && entity.shown, true) };
  }

  /**
   * 粉絲此刻結得了帳嗎——上架中、在販售窗口內、還有量。
   * 與「看不看得到」無關：隱藏的東西拿著非公開連結照樣買得到（§7.14 私下販售）。
   */
  function canBuy(entity, qty, now) {
    var at = nowMs(now);
    if (isDraftOf(entity, null)) return false;
    if (isUnlisted(entity, at)) return false;
    if (!isOnSale(entity)) return false;   /* D290 未開賣 */
    if (future(entity && entity.saleStart, at)) return false;
    if (passed(entity && entity.saleEnd, at)) return false;
    return (qty === undefined ? INF : qty) > 0;
  }

  /* ── 非公開連結 ──────────────────────────────────────────────────────── */

  var LINK_BASE = 'https://ztor.example/s/';

  function key8() {
    var abc = 'abcdefghijkmnpqrstuvwxyz23456789', s = '';
    for (var i = 0; i < 8; i++) s += abc.charAt(Math.floor(Math.random() * abc.length));
    return s;
  }

  /** 產一條示意用的非公開連結（原型無後端，格式先固定下來讓五頁一致）。 */
  function privateLinkFor(entityId) {
    return LINK_BASE + encodeURIComponent(entityId == null ? 'item' : entityId) + '?k=' + key8();
  }

  /** 重置：舊連結即刻作廢、換一把新的 k。回傳新連結。 */
  function resetPrivateLink(entity) {
    var link = privateLinkFor(entity && (entity.id || entity.key));
    if (entity) entity.privateLink = link;
    return link;
  }

  /* ── 表單校驗 ────────────────────────────────────────────────────────── */

  /**
   * 鎖定量上限＝沒有被鎖定的庫存量 ＋ 這個管道目前已鎖定的量。
   * 加回自己那一份，是因為調整自己的鎖定量時，原本鎖著的件本來就能重新分配。
   */
  function validateLock(product, channel, wanted) {
    var free = freeQty(product);
    var mine = lockOf(product, channel) || 0;
    var max = (free === INF) ? INF : free + mine;
    var w = num(wanted);
    return { ok: w >= 0 && w <= max, max: max };
  }

  /**
   * 販售窗口只擋一件事：停售不得早於或等於開賣。
   * D241 起不再擋「開賣早於上架」或「停售晚於下架」——三個開關互相獨立，
   * 上架窗口與販售窗口不必互相包住（D239 的那條校驗只在活動與項目仍有效）。
   */
  function validateSaleWindow(saleStart, saleEnd) {
    var s = time(saleStart), e = time(saleEnd);
    if (s !== null && e !== null && e <= s) return { ok: false, reason: 'sale-end-before-start' };
    return { ok: true, reason: null };
  }


  /* ── 拍賣（spec §7.14「適用範圍」· D285，2026-09-18）────────────────────────
     拍賣用同一組三開關、同一套封存；差別只有兩件事：
       1. 開賣＝開拍：saleStart 就是開拍時間；沒填＝跟著上架一起開拍（＝實際上架時間）。
       2. 停售＝結標＝開拍時間＋競標時長（duration，天），由系統算、不可單獨手填。
     沒有庫存池，所以推導固定 qty＝Infinity，soldout／low 兩態不會出現。
     D290（2026-09-18）：下架清上架排程與開拍時間、onSale 退回 false；重新上架後為「未開拍」（onSale=false → coming＝Upcoming，
     不帶開拍時間），須再設開拍（選「跟著上架一起開拍」或「定時開拍」都會把 onSale 設回 true）。
     徽章文案對應（規格 §7.14「與 §7.2 狀態語言的關係」）：coming→Upcoming、live→Live（競標中）、ended→Sold（完售，2026-09-18 D286 改文案，key 名沿用 ended 不改）；
     archived／draft／unlisted／hidden 與商品同義、同一組 key。Sealed 是競標模式不是狀態，不進推導。
     2026-09-18（D287）流標：結標時「有無出價」分岔——deriveStatus 算出 ended 後，deriveAuctionStatus／
     deriveAuctionFlags 再依 auctionBidCount() 改判：有出價維持 ended（＝完售／Sold，key 名沿用不改）、
     無出價改成新 key unsold（＝流標／Unsold）。選這個做法而不是把 ended 整個改名，是因為 ended 已經是
     D286 剛定案的「完售」語意、且被三處消費（頁面徽章、篩選 tab、i18n），沒有理由再动它；流標只是
     新增一個同層的桶。未達保留價、流標能否重新開拍：待確認，不做 UI（見 ASSUMPTIONS UIA-153）。 */
  var AUCTION_STATUS_META = {
    archived: STATUS_META.archived,
    draft:    STATUS_META.draft,
    unlisted: STATUS_META.unlisted,
    hidden:   STATUS_META.hidden,
    ended:    { i18n: 'e-shop.astatus.ended',    tone: 'neutral' },
    unsold:   { i18n: 'e-shop.astatus.unsold',   tone: 'neutral' },
    coming:   { i18n: 'e-shop.astatus.upcoming', tone: 'info'    },
    live:     { i18n: 'e-shop.astatus.live',     tone: 'success' }
  };

  /** 開拍時間：saleStart 優先；跟著上架一起開拍時＝上架時間（listAt，或原型記的 listedAt）。都沒有回 null。 */
  function auctionStart(a) {
    if (!a || !isOnSale(a)) return null;   /* D290 未開拍：沒有開拍時間，也就沒有結標時間 */
    var t = time(a.saleStart);
    if (t !== null) return t;
    t = time(a.listAt);
    if (t !== null) return t;
    return time(a.listedAt);
  }

  /** 結標時間（＝停售時間）＝開拍時間＋競標時長；缺任一回 null。回 ISO 字串（與其他時間欄同型）。 */
  function auctionSaleEnd(a) {
    var start = auctionStart(a);
    var days = num(a && a.duration);
    if (start === null || days <= 0) return null;
    return new Date(start + days * 86400000).toISOString();
  }

  /* 把拍賣攤成 deriveStatus 看得懂的樣子：saleEnd 用導出值蓋掉、其餘欄位原樣。 */
  function auctionEntity(a) {
    var e = {}, k;
    for (k in (a || {})) if (Object.prototype.hasOwnProperty.call(a, k)) e[k] = a[k];
    e.saleEnd = auctionSaleEnd(a);
    /* 跟著上架一起開拍且還沒到上架時間：開拍時間＝上架時間，deriveStatus 會先判 unlisted，不必另補 */
    return e;
  }

  /** 出價數（D287）：bids／bidCount 任一欄位，缺值或非正數一律當 0（＝流標判斷用）。 */
  function auctionBidCount(a) {
    var n = num(a && (a.bids !== undefined ? a.bids : a.bidCount));
    return n > 0 ? n : 0;
  }

  /** 拍賣的單一狀態桶（清單篩選用）：archived → draft → unlisted → hidden → ended／unsold → coming → live。
      ended 再依有無出價拆成 ended（完售）／unsold（流標，D287）。 */
  function deriveAuctionStatus(a, now) {
    var st = deriveStatus(auctionEntity(a), { qty: INF, isDraft: isDraftOf(a, null) }, now);
    return (st === 'ended' && auctionBidCount(a) <= 0) ? 'unsold' : st;
  }

  /** 細節頁用：主徽章不含隱藏那一層，隱藏另外一顆。同樣把 ended 依出價數拆成 ended／unsold（D287）。 */
  function deriveAuctionFlags(a, now) {
    var flags = deriveFlags(auctionEntity(a), { qty: INF, isDraft: isDraftOf(a, null) }, now);
    if (flags.status === 'ended' && auctionBidCount(a) <= 0) return { status: 'unsold', hidden: flags.hidden };
    return flags;
  }

  /** 拍賣徽章的 class 字串（tone 與商品同一張 badge.css）。 */
  function auctionBadgeClass(status) {
    var meta = AUCTION_STATUS_META[status];
    return 'badge badge--' + ((meta && meta.tone) || 'neutral');
  }

  /** 競標已經開始了嗎（Live 或 Ended）——開拍後設定受限（5.1.5.8 §2.2 限度編輯）。 */
  function auctionStarted(a, now) {
    var start = auctionStart(a);
    return start !== null && start <= nowMs(now);
  }

  return {
    STATUS_META: STATUS_META,
    STATUS_ORDER: ['archived', 'draft', 'unlisted', 'hidden', 'ended', 'soldout', 'coming', 'low', 'live'],
    badgeClass: badgeClass,
    freeQty: freeQty,
    lockedTotal: lockedTotal,
    lockOf: lockOf,
    hasLock: hasLock,
    channelQty: channelQty,
    bundleQty: bundleQty,
    bundleLockSets: bundleLockSets,
    bundleMemberLock: bundleMemberLock,
    bundleMaxSets: bundleMaxSets,
    bundleAllocOf: bundleAllocOf,
    applyBundleLock: applyBundleLock,
    memberPer: memberPer,
    allChannelsLocked: allChannelsLocked,
    deriveStatus: deriveStatus,
    deriveFlags: deriveFlags,
    isUnlisted: isUnlisted,
    isArchived: isArchived,
    canArchive: canArchive,
    archive: archive,
    unarchive: unarchive,
    relist: relist,
    unlist: unlist,
    listedBundlesUsing: listedBundlesUsing,
    unlistWithBundles: unlistWithBundles,
    unlistedMembers: unlistedMembers,
    bundleRelistPlan: bundleRelistPlan,
    relistBundle: relistBundle,
    scheduledUnlistCascade: scheduledUnlistCascade,
    expireScheduled: expireScheduled,
    isOnSale: isOnSale,
    canBuy: canBuy,
    privateLinkFor: privateLinkFor,
    resetPrivateLink: resetPrivateLink,
    validateLock: validateLock,
    variantLockOf: variantLockOf,
    variantLockedTotal: variantLockedTotal,
    variantFree: variantFree,
    variantChannelQty: variantChannelQty,
    variantsTotal: variantsTotal,
    variantsFree: variantsFree,
    variantsChannelQty: variantsChannelQty,
    variantsChannelLocked: variantsChannelLocked,
    variantsAllLocked: variantsAllLocked,
    validateVariantLock: validateVariantLock,
    validateSaleWindow: validateSaleWindow,
    /* 拍賣（D285） */
    AUCTION_STATUS_META: AUCTION_STATUS_META,
    auctionStart: auctionStart,
    auctionSaleEnd: auctionSaleEnd,
    auctionStarted: auctionStarted,
    auctionBidCount: auctionBidCount,
    deriveAuctionStatus: deriveAuctionStatus,
    deriveAuctionFlags: deriveAuctionFlags,
    auctionBadgeClass: auctionBadgeClass
  };
}));
