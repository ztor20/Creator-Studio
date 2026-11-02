/* ============================================================
   Ztor — 平台忠誠點數設定的已儲存值（原型的單一來源）
   2026-11-02 建立（UI-CHANGES 四百六十、ASSUMPTIONS UIA-332）。

   平台忠誠點數設定（admin-platform-loyalty.html，規格 5.1.0.8）按「儲存」時把參數寫進
   localStorage 一個鍵；粉絲名冊、粉絲詳情、媒體庫等頁載入時讀這裡，數字就跟著設定走。
   正式環境的值來自 BO Global Setting，原型用瀏覽器本機儲存示範「改了設定、其他頁跟著變」。

   ⚠ 原型示範：存在這台瀏覽器，換瀏覽器或清除網站資料就回到預設。
   清除方法：平台忠誠點數設定 → 修改紀錄分頁底部「還原預設」，
   或在瀏覽器主控台執行 localStorage.removeItem('ztor.loyaltySettings')。

   API（window.ztorLoyalty）：
     get()            → 目前生效的設定（已儲存值蓋在預設值上），欄位見 DEFAULTS
     DEFAULTS         → 規格預設值（唯讀）
     raw()            → 已儲存的原始資料 { values, names, switches }
     save(raw)        → 寫入原始資料，廣播 ztor:loyalty-changed
     reset()          → 清除已儲存值，廣播 ztor:loyalty-changed
     tierName(tier)   → 自訂顯示名稱（沒有自訂就回 null；tier＝inner／super／devoted／fan）
     inputKey(label, field) → 平台設定頁輸入框在 values 裡的鍵

   另外向 js/i18n.js 註冊翻譯掛勾（window.ztorI18nHook）：
     - 分級名稱的 i18n 鍵（fans.tier.*、tier-settings.tier.*…）有自訂名稱就回自訂名稱，
       中英文介面都顯示同一個字（使用者輸入的字不翻譯）。
     - 字串裡的 [[token|預設]] 換成目前設定值，例如「近 [[active|90]] 天」。
   所有讀寫都包 try/catch：讀不到（私密視窗、封鎖儲存）就用預設值。
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'ztor.loyaltySettings';

  /* 規格預設值（5.1.0.8 F9–F11、§7.5）。 */
  var DEFAULTS = Object.freeze({
    KA: 10,                                   /* 基礎比率：每 1 元基準幣別 × γ × K_A */
    gamma: Object.freeze({ a3: 1.1, a4: 1.0 }),   /* 活動票券、電子商店商品 */
    pts: Object.freeze({ b1: 150, b4: 5, b5: 10, b3: 400 }),   /* 共創投票、按讚、收藏、邀請追蹤 */
    topPct: Object.freeze([1, 10, 30]),       /* 核心圈／超級粉絲／上榜粉絲（累積） */
    sFloor: 500,                              /* 全域最低忠誠點數 */
    grace: 14,                                /* 降級緩衝天數 */
    dormancy: 90,                             /* 多久沒有行為就往下掉一階（最終版 S132，流失風險小字的 M） */
    activeDays: 90,                           /* 活躍視窗（活躍粉絲收入同視窗） */
    riskDays: 30,                             /* 流失風險視窗 */
    recentDays: 7                             /* 入帳視窗：「近 N 天入帳 +X」 */
  });

  /* 平台設定頁輸入框（data-ploy-label｜data-ploy-field）→ get() 欄位 */
  function inputKey(label, field) { return String(label || '') + '|' + String(field || ''); }
  var MAP = [
    ['KA',         inputKey('ploy.ev.ka')],
    ['gamma.a3',   inputKey('ploy.ev.a3', 'ploy.ev.col.points')],
    ['gamma.a4',   inputKey('ploy.ev.a4', 'ploy.ev.col.points')],
    ['pts.b1',     inputKey('ploy.ev.b1', 'ploy.ev.col.points')],
    ['pts.b4',     inputKey('ploy.ev.b4', 'ploy.ev.col.points')],
    ['pts.b5',     inputKey('ploy.ev.b5', 'ploy.ev.col.points')],
    ['pts.b3',     inputKey('ploy.ev.b3', 'ploy.ev.col.points')],
    ['topPct.0',   inputKey('fans.tier.inner', 'ploy.tier.col.top')],
    ['topPct.1',   inputKey('fans.tier.super', 'ploy.tier.col.top')],
    ['topPct.2',   inputKey('fans.tier.devoted', 'ploy.tier.col.top')],
    ['sFloor',     inputKey('ploy.tier.floor')],
    ['grace',      inputKey('ploy.decay.grace')],
    ['dormancy',   inputKey('ploy.decay.active')],
    ['activeDays', inputKey('ploy.kpi.active')],
    ['riskDays',   inputKey('ploy.kpi.risk')],
    ['recentDays', inputKey('ploy.kpi.recent')]
  ];

  function readRaw() {
    try {
      var s = localStorage.getItem(KEY);
      if (!s) return { values: {}, names: {}, switches: {} };
      var o = JSON.parse(s) || {};
      return { values: o.values || {}, names: o.names || {}, switches: o.switches || {} };
    } catch (e) { return { values: {}, names: {}, switches: {} }; }
  }

  function num(v, fb) { var n = Number(v); return (v === '' || v == null || !isFinite(n)) ? fb : n; }

  function get() {
    var r = readRaw(), v = r.values;
    var out = {
      KA: DEFAULTS.KA,
      gamma: { a3: DEFAULTS.gamma.a3, a4: DEFAULTS.gamma.a4 },
      pts: { b1: DEFAULTS.pts.b1, b4: DEFAULTS.pts.b4, b5: DEFAULTS.pts.b5, b3: DEFAULTS.pts.b3 },
      topPct: DEFAULTS.topPct.slice(),
      sFloor: DEFAULTS.sFloor, grace: DEFAULTS.grace, dormancy: DEFAULTS.dormancy,
      activeDays: DEFAULTS.activeDays, riskDays: DEFAULTS.riskDays, recentDays: DEFAULTS.recentDays,
      names: {}, switches: {}
    };
    MAP.forEach(function (m) {
      if (!(m[1] in v)) return;
      var path = m[0].split('.');
      if (path.length === 1) out[path[0]] = num(v[m[1]], out[path[0]]);
      else out[path[0]][path[1]] = num(v[m[1]], out[path[0]][path[1]]);
    });
    ['inner', 'super', 'devoted', 'fan'].forEach(function (k) {
      var n = r.names[k];
      if (typeof n === 'string' && n.trim()) out.names[k] = n.trim();
    });
    Object.keys(r.switches).forEach(function (k) { out.switches[k] = !!r.switches[k]; });
    return out;
  }

  function broadcast() {
    try { document.dispatchEvent(new CustomEvent('ztor:loyalty-changed')); } catch (e) { /* ignore */ }
  }
  function save(raw) {
    try { localStorage.setItem(KEY, JSON.stringify({ values: raw.values || {}, names: raw.names || {}, switches: raw.switches || {} })); }
    catch (e) { /* 寫不進去就只在這次載入有效 */ }
    broadcast();
  }
  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    broadcast();
  }
  function tierName(tier) { var n = get().names[tier]; return n || null; }

  /* ── 給 js/i18n.js 的翻譯掛勾 ── */
  var NAME_KEYS = {
    'fans.tier.inner': 'inner', 'tier-settings.tier.inner': 'inner', 'fan-detail.tier.inner': 'inner', 'fg.tier.inner': 'inner',
    'dash.fans.tier.inner': 'inner', 'msg.to.inner.tag': 'inner',
    'fans.tier.super': 'super', 'tier-settings.tier.superfan': 'super', 'fg.tier.super': 'super',
    'dash.fans.tier.super': 'super', 'msg.to.super.tag': 'super',
    'fans.tier.devoted': 'devoted', 'tier-settings.tier.devoted': 'devoted', 'fg.tier.ranked': 'devoted',
    'dash.fans.tier.devoted': 'devoted', 'msg.to.devoted.tag': 'devoted',
    'fans.tier.fan': 'fan', 'tier-settings.tier.fan': 'fan', 'fg.tier.fan': 'fan', 'dash.fans.tier.fan': 'fan'
  };
  var cache = null;
  function cur() { if (!cache) cache = get(); return cache; }
  document.addEventListener('ztor:loyalty-changed', function () { cache = null; });
  window.addEventListener('storage', function (e) { if (e.key === KEY) { cache = null; broadcast(); } });

  function token(k) {
    var s = cur();
    switch (k) {
      case 'floor': return s.sFloor.toLocaleString('en-US');
      case 'p1': return String(s.topPct[0]);
      case 'p2': return String(s.topPct[1]);
      case 'p3': return String(s.topPct[2]);
      case 'active': return String(s.activeDays);
      case 'risk': return String(s.riskDays);
      case 'recent': return String(s.recentDays);
      case 'dormancy': return String(s.dormancy);
      case 'tier.inner': case 'tier.super': case 'tier.devoted': case 'tier.fan':
        return s.names[k.slice(5)] || null;   /* 沒有自訂名稱：用字串裡寫的預設名 */
      default: return null;
    }
  }
  window.ztorI18nHook = {
    name: function (key) { var t = NAME_KEYS[key]; return t ? (cur().names[t] || null) : null; },
    token: token
  };

  window.ztorLoyalty = {
    KEY: KEY,
    DEFAULTS: DEFAULTS,
    get: get,
    raw: readRaw,
    save: save,
    reset: reset,
    tierName: tierName,
    inputKey: inputKey
  };
})();
