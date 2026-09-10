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
//     saleStart   string|null   開賣日期與時間。null＝上架即開賣
//     saleEnd     string|null   停售日期與時間。null＝不自動停售
//     lowThreshold number       低庫存門檻（0＝不提醒）
//   單售商品另有庫存池：
//     pool = { total: number | 'unlimited',
//              locks: { single: number|null, bundles: { [bundleId]: number|null } } }
//     鎖定量是三態，不是「0 就等於沒鎖」：
//       null／欄位不存在 ＝ 這個管道沒鎖定，與其他未鎖定管道共用沒有被鎖定的庫存量
//       數字（含 0）     ＝ 這個管道處於鎖定模式，只能賣這麼多；0 ＝ 鎖定的份賣完了，
//                          在創作者「再鎖一次」之前它就是售罄，不會回頭吃沒有被鎖定的庫存量
//     §7.14 的「組合包賣光 60 → 組合售罄、單售照常 40」正是靠這個三態成立的：
//     賣掉一件同時扣池與扣該管道的鎖定量，鎖定量歸 0 時池裡還有 40 件未鎖定的。
//   組合包沒有池，只有成員與自己的限量硬上限：
//     members = [{ productId, qty }]   qty 省略＝一套扣一件
//     cap     = number | null          限量硬上限（§7.2 版本型態軸）
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

  /* 鎖定量的三態解讀：null／undefined ＝ 沒鎖定；數字（含 0）＝ 鎖定模式。 */
  function lockVal(v) { return (v === undefined || v === null || v === '') ? null : num(v); }

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

  /** 沒有被鎖定的庫存量＝目前在庫 − 所有鎖定量。不限量的池回 Infinity；不會回負數。 */
  function freeQty(product) {
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
    var locked = lockOf(product, channel);
    return locked === null ? freeQty(product) : locked;
  }

  /* ── 逐選項組合的鎖定（2026-09-09 使用者裁決；規格未定義粒度，見 ASSUMPTIONS UIA-146）──
     多選項商品的庫存住在每一個選項組合上，鎖定因此也逐組合各自記，形狀與池的鎖定相同：
       variant.locks = { single: n|null, bundles: { <bundleId>: n|null } }
     三態解讀不變（null／undefined＝沒鎖定，數字含 0＝鎖定模式），規則也不變——
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
    for (var i = 0; i < members.length; i++) {
      var m = members[i];
      var p = map[m.productId || m.id];
      if (!p) return 0;
      var per = num(m.qty) > 0 ? num(m.qty) : 1;   /* 一套要用到同一件商品好幾件時 */
      /* 成員是多選項商品時，這個組合拿得到的量＝各選項組合在本組合可售量之和
         （D258：組合包的鎖定逐選項組合設定；買家挑哪一個組合出貨仍是產品待確認）。 */
      var q = (p.variant === 'multiple' && (p.variants || []).length)
        ? variantsChannelQty(p.variants, { bundle: bundle.id })
        : channelQty(p, { bundle: bundle.id });
      var sets = (q === INF) ? INF : Math.floor(q / per);
      if (sets < min) min = sets;
    }
    var cap = (bundle && bundle.cap !== undefined && bundle.cap !== null) ? num(bundle.cap) : null;
    if (cap !== null && cap < min) min = cap;
    return min;
  }

  /**
   * 所有管道都鎖定了嗎？——真的話沒有被鎖定的庫存量沒有人能賣，畫面要提醒創作者重新分配。
   * bundlesUsingIt：包含這件商品的組合包（物件或 id 字串皆可）。
   */
  function allChannelsLocked(product, bundlesUsingIt) {
    if (!hasLock(product, 'single')) return false;
    var list = bundlesUsingIt || [];
    for (var i = 0; i < list.length; i++) {
      var id = (typeof list[i] === 'string') ? list[i] : list[i].id;
      if (!hasLock(product, { bundle: id })) return false;
    }
    return true;
  }

  /* ── 狀態推導 ────────────────────────────────────────────────────────── */

  /* 八態的徽章樣式對照。tone 直接對上 badge.css 的既有變體（badge--<tone>）。 */
  var STATUS_META = {
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

  function isUnlisted(entity, at) {
    if (!flag(entity && entity.listed, true)) return true;
    if (future(entity && entity.listAt, at)) return true;     /* 排定上架但還沒到 */
    if (passed(entity && entity.unlistAt, at)) return true;   /* 自動下架日期與時間已過 */
    return false;
  }

  /**
   * 清單徽章的主徽章。優先序固定，不得各頁自行調換：
   *   draft → unlisted → hidden → ended → soldout → coming → low → live
   * ctx = { qty: number|Infinity, lowThreshold?: number, isDraft?: boolean }
   * qty 由呼叫端先用 channelQty()／bundleQty() 算好傳進來——同一件商品在不同管道
   * 的狀態本來就不同，元件層不猜是哪個管道。
   */
  function deriveStatus(entity, ctx, now) {
    var at = nowMs(now);
    var c = ctx || {};
    if (isDraftOf(entity, c)) return 'draft';
    if (isUnlisted(entity, at)) return 'unlisted';
    if (!flag(entity && entity.shown, true)) return 'hidden';
    return saleStatus(entity, c, at);
  }

  /* hidden 那一層之後的四態（細節頁與 deriveFlags 共用）。 */
  function saleStatus(entity, c, at) {
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

  return {
    STATUS_META: STATUS_META,
    STATUS_ORDER: ['draft', 'unlisted', 'hidden', 'ended', 'soldout', 'coming', 'low', 'live'],
    badgeClass: badgeClass,
    freeQty: freeQty,
    lockedTotal: lockedTotal,
    lockOf: lockOf,
    hasLock: hasLock,
    channelQty: channelQty,
    bundleQty: bundleQty,
    allChannelsLocked: allChannelsLocked,
    deriveStatus: deriveStatus,
    deriveFlags: deriveFlags,
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
    validateSaleWindow: validateSaleWindow
  };
}));
