/* ============================================================
   discount-codes-store.js · 商店優惠碼的示範資料層（D458，2026-10-20）
   ------------------------------------------------------------
   window.ztorCodes：優惠碼端（5.1.5.5 F8）的資料來源。商品端（建立商品／商品細節頁／建立組合／組合細節頁）的
   「優惠碼」選擇欄（js/code-picker.js）與商店設定的優惠碼清單讀寫同一份，所以兩邊看到的是同一份資料：
     勾選＝把這個商品加進該碼的「特定商品」範圍；取消勾選＝從該碼的特定商品範圍移除（資料仍存在碼這一邊）。

   資料
     SEED       與 store-settings.html 優惠碼清單的示範列一一對應（code／折扣／狀態／範圍）。
                scope.all＝全部商店；scope.items＝特定商品（字串＝商品或組合包 id；物件 { label, kind }＝只有名稱的示範條目）。
                full:true 的碼只在最終版（Phase 4）看得到——代理碼與次數用完的示範，Phase 1 沒有。
     overlay    localStorage 'ztor.codes.v1'：
                  created  商品端或優惠碼端新建的碼（Phase 1 只有自用碼）
                  scope    { 碼: { add:[商品 key], rem:[商品 key] } } 對 SEED 範圍的增減
                  sw       { 商品 key: bool } 商品端優惠碼總開關（沒記＝讀商品資料的預設）
                  names    { 商品 key: 名稱 } 建立流程裡新建商品的顯示名稱（商品本身不在 ProductsStore）
                關掉分頁不會清掉（localStorage）；ztorCodes.reset() 回到 SEED。

   開關語意（D458）：關閉＝這個商品／組合包不能用任何商店優惠碼（連「全部商店」的碼也不適用）；
   開啟＝全部商店的碼自動適用，再加上選取的碼；開啟但沒選碼成立。applicable(key) 回傳實際可用的碼清單，
   價格示範若要算碼就問它——關閉回空陣列。

   事件：寫入後在 document 上發 'ztor:codes-changed'。
   ============================================================ */
(function () {
  'use strict';
  var KEY = 'ztor.codes.v1';

  var SEED = [
    { code: 'SUMMER25',    kind: 'own',     pct: 25, status: 'active',    period: '7/1 – 8/31',   scope: { all: true } },
    { code: 'TOURVIP15',   kind: 'own',     pct: 15, status: 'active',    period: '9/1 – 10/31',
      scope: { items: ['hoodie', 'zine',
        { label: 'REALIVE World Tour — Asia leg 9/12 · VIP', kind: 'ticket' },
        { label: 'VIP ＋ 巡演官方 Tee', kind: 'bundle' }] } },
    { code: 'FANDAY20',    kind: 'own',     pct: 20, status: 'active',    period: '10/1 – 12/31', scope: { items: [{ label: 'Coaster set', kind: 'product' }] } },   /* 沒有預選任何現有商品（既有「開啟」的商品轉開關開啟、不選碼） */
    { code: 'EARLYBIRD10', kind: 'own',     pct: 10, status: 'scheduled', period: '11/15 – 12/15', scope: { all: true } },
    { code: 'SPRING2026',  kind: 'own',     pct: 20, status: 'ended',     period: '3/1 – 3/31',   scope: { all: true } },
    { code: 'FANCLUB30',   kind: 'own',     pct: 30, status: 'disabled',  period: '9/1 – 12/31',  scope: { all: true } },
    { code: 'AIKO10',      kind: 'partner', pct: 10, status: 'active',    period: '8/1 – 9/30',   full: true, scope: { items: ['hoodie'] } },
    { code: 'LAUNCH50',    kind: 'own',     pct: 50, status: 'exhausted', period: '6/1 – 6/30',   full: true, scope: { items: [] } }
  ];

  function load() {
    try { var o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && typeof o === 'object') return o; } catch (e) {}
    return {};
  }
  function ov() { var o = load(); o.created = o.created || []; o.scope = o.scope || {}; o.sw = o.sw || {}; o.names = o.names || {}; return o; }
  function save(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function changed() { try { document.dispatchEvent(new CustomEvent('ztor:codes-changed')); } catch (e) {} }

  function isFull() { return !window.ztorDevState || !window.ztorDevState.featOn || window.ztorDevState.featOn('full'); }
  function visible(c) { return !c.full || isFull(); }
  function bare(it) { return typeof it === 'string' ? it : null; }

  /* 範圍裡的商品 key 清單（SEED 範圍 ＋ overlay 增減；{label,kind} 示範條目原樣保留） */
  function items(c) {
    var o = ov(), s = o.scope[c.code] || { add: [], rem: [] };
    var base = (c.scope && c.scope.items ? c.scope.items : []).filter(function (it) { return typeof it !== 'string' || (s.rem || []).indexOf(it) < 0; });
    (s.add || []).forEach(function (k) { if (base.indexOf(k) < 0) base.push(k); });
    return base;
  }
  function all() {
    var o = ov();
    return SEED.concat(o.created).filter(visible).map(function (c) {
      var copy = Object.assign({}, c);
      copy.items = c.scope && c.scope.all ? [] : items(c);
      copy.all = !!(c.scope && c.scope.all);
      return copy;
    });
  }
  function byCode(code) { return all().filter(function (c) { return c.code === code; })[0] || null; }

  var USABLE = { active: 1, scheduled: 1 };
  function usable(c) { return !!USABLE[c.status]; }

  /* 這個商品能用的碼（D458）：開關關閉＝空；開啟＝全部商店的碼＋選取的碼 */
  /* 商品資料的預設開關（D458 推導 15）：明寫 codesOn 優先；否則沿用舊欄位 discount.stack
     （既有「開啟疊加」→ 開、其餘 → 關）。查不到商品（建立流程的暫時 key、活動組合包）＝關 */
  function defaultOn(key) {
    var P = window.ProductsStore;
    var e = P && ((P.get && P.get(key)) || (P.getBundle && P.getBundle(key)));
    if (!e) return false;
    if (e.codesOn != null) return !!e.codesOn;
    return !!(e.discount && e.discount.stack);
  }
  function switchOn(key, fallback) {
    var o = ov();
    if (key in o.sw) return !!o.sw[key];
    return fallback === undefined ? defaultOn(key) : !!fallback;
  }
  function selectedFor(key) {
    return all().filter(function (c) { return !c.all && c.items.indexOf(key) >= 0; }).map(function (c) { return c.code; });
  }
  function autoApplied() { return all().filter(function (c) { return c.all && usable(c); }); }
  function applicable(key, fallbackOn) {
    if (!switchOn(key, fallbackOn)) return [];   /* 關閉＝一律不適用，連「全部商店」的碼也不算（D458） */
    var sel = selectedFor(key);
    return all().filter(function (c) { return usable(c) && (c.all || sel.indexOf(c.code) >= 0); });
  }

  /* 可新選的碼（範圍含「特定商品」、狀態可用）；已選過的一律保留（標狀態） */
  function selectable(selected) {
    selected = selected || [];
    return all().filter(function (c) { return !c.all && (usable(c) || selected.indexOf(c.code) >= 0); });
  }

  /* 商品端選碼結果寫回碼端範圍：只動這個 key 在各碼 add／rem 的紀錄 */
  function setSelected(key, codes, label) {
    var o = ov(); codes = codes || [];
    if (label) o.names[key] = label;
    all().forEach(function (c) {
      if (c.all) return;
      var want = codes.indexOf(c.code) >= 0, has = c.items.indexOf(key) >= 0;
      if (want === has) return;
      var isCreated = o.created.some(function (x) { return x.code === c.code; });
      if (isCreated) {
        var cc = o.created.filter(function (x) { return x.code === c.code; })[0];
        cc.scope = cc.scope || { items: [] }; cc.scope.items = cc.scope.items || [];
        var i = cc.scope.items.indexOf(key);
        if (want && i < 0) cc.scope.items.push(key); if (!want && i >= 0) cc.scope.items.splice(i, 1);
        return;
      }
      var s = o.scope[c.code] = o.scope[c.code] || { add: [], rem: [] };
      s.add = s.add || []; s.rem = s.rem || [];
      var ia = s.add.indexOf(key), ir = s.rem.indexOf(key);
      if (want) { if (ia < 0 && !(c.scope && (c.scope.items || []).indexOf(key) >= 0)) s.add.push(key); if (ir >= 0) s.rem.splice(ir, 1); }
      else { if (ia >= 0) s.add.splice(ia, 1); if (ir < 0 && (c.scope && (c.scope.items || []).indexOf(key) >= 0)) s.rem.push(key); }
    });
    save(o); changed();
  }
  function setSwitch(key, on) { var o = ov(); o.sw[key] = !!on; save(o); changed(); }

  /* 新建自用碼（Phase 1 只有自用碼）。字串已由呼叫端驗過格式；重複回 null */
  function create(spec) {
    var code = String(spec.code || '').toUpperCase();
    if (!code || byCode(code) || SEED.some(function (c) { return c.code === code; })) return null;
    var o = ov();
    var rec = { code: code, kind: 'own', pct: Number(spec.pct) || 0, status: spec.status || 'active', period: spec.period || '—',
                scope: spec.all ? { all: true } : { items: spec.items ? spec.items.slice() : (spec.key ? [spec.key] : []) }, fresh: true };
    o.created.push(rec);
    if (spec.key && spec.label) o.names[spec.key] = spec.label;
    save(o); changed();
    return byCode(code);
  }
  function exists(code) { code = String(code || '').toUpperCase(); return SEED.some(function (c) { return c.code === code; }) || ov().created.some(function (c) { return c.code === code; }); }
  function labelFor(key) {
    var o = ov(); if (o.names[key]) return o.names[key];
    var P = window.ProductsStore, p = P && P.get && P.get(key);
    if (p && p.name) return p.name;
    var b = P && P.getBundle && P.getBundle(key);
    return b && b.name ? b.name : key;
  }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} changed(); }

  window.ztorCodes = {
    SEED: SEED, all: all, get: byCode, usable: usable, items: items, isFull: isFull,
    switchOn: switchOn, setSwitch: setSwitch, defaultOn: defaultOn,
    selectedFor: selectedFor, setSelected: setSelected, selectable: selectable,
    autoApplied: autoApplied, applicable: applicable,
    create: create, exists: exists, labelFor: labelFor, reset: reset
  };
})();
