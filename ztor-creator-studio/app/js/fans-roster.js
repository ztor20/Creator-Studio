/* ============================================================
   Ztor — 粉絲示範母體：名冊、粉絲詳情、媒體庫分級人數的單一來源
   2026-11-02 建立（D497；UI-CHANGES 四百四十一、ASSUMPTIONS UIA-324）。
   2026-11-02 改寫（UI-CHANGES 四百六十、ASSUMPTIONS UIA-332）：
     從 9 位示範粉絲擴成完整母體（1,340 位），每一位都有自己的點數明細（P0 事件），
     點數、最近一次有效動作、近 N 天營收都由明細算出；分級、名次、狀態、KPI 再由
     平台忠誠點數設定（js/loyalty-settings.js）的 S_floor、前 % 名、KPI 視窗算出。

   ⚠ 這是原型示範資料，不是產品資料。正式環境的分數、名次、各級最低分由
   Loyalty 引擎（Read API）提供，後台不自算；這裡自算只是讓示範數字彼此對得上。

   母體怎麼排（預設設定下，前 % 名 1／10／30、S_floor 500）：
     - 共 1,340 位、全部點數 > 0（D474：前 % 名的分母只計點數 > 0 的粉絲）。
       ⌊1%⌋＝13、⌊10%⌋＝134、⌊30%⌋＝402（D476 名額捨去）。
     - 名次 1–13 核心圈（821–874）、14–134 超級粉絲（655–820）、135–402 上榜粉絲（512–654）、
       其餘一般粉絲（50–499，全都低於 S_floor）。
     - 名冊原本的 9 位示範粉絲保留原點數：林詩涵 874 是第 1 名、陳柏宇 821 是核心圈最低分、
       黃于潔 655 是超級粉絲最低分、李佳恩 512 是上榜粉絲最低分；其餘依點數落在各自名次。
     - 近 90 天沒有任何有效動作的 57 位（超級粉絲 6、上榜粉絲 11、一般粉絲 40）不算活躍，
       所以預設的活躍分級人數＝13／115／257／898（合計 1,283），與改版前媒體庫、電子商店的數字相同。
   改了平台設定（例如 S_floor 600、流失風險 20 天）後，分級、人數、狀態都會跟著重算。

   API（window.ztorFans）：
     list            名冊順序（依名次）的粉絲陣列；每位：
                     { id, gen, points, rank, tier, quietDays, recovered, active, rev, name(lang), email, country(lang), tags }
     get(id)         取一位（id：名冊示範粉絲 '1'–'9'，生成的 'g10'…）
     ledger(id)      這位粉絲的點數明細（新到舊）：[{ code, cat, title, sub, t, amount, pts, cap, feat }]
     progress(fan, points)  升級進度 { top } 或 { top:false, D, pct, need, next }
     status(fan)     'active'｜'risk'｜'recovered'
     summary(over)   （over＝暫時覆寫的設定，例如 { topPct:[2,10,30] }，預覽用）
                     { total, active, risk, riskGroups, revenue, avg, tiers:{ inner:{ all, active, rev } … } }
     tierMin(tier)   某一級目前最低分（沒人回 null）
     settings()      目前生效的平台設定（js/loyalty-settings.js 的 get()；沒載入就用預設）
     daysAgo(t)      距示範「今天」（2026-11-02）幾天
     S_FLOOR / RISK_DAYS / ACTIVE_DAYS / RECENT_DAYS（讀設定的 getter）、TIERS、NOW
   ============================================================ */
(function () {
  'use strict';

  var TIERS = ['inner', 'super', 'devoted', 'fan'];
  var NOW = new Date(2026, 10, 2, 21, 0);   /* 示範的「今天」：所有明細日期都相對這一天 */
  var DAY = 86400000;
  var FALLBACK = { KA: 10, gamma: { a3: 1.1, a4: 1.0 }, pts: { b1: 150, b4: 5, b5: 10, b3: 400 }, topPct: [1, 10, 30],
                   sFloor: 500, grace: 14, dormancy: 90, activeDays: 90, riskDays: 30, recentDays: 7, names: {}, switches: {} };
  function settings() { return window.ztorLoyalty ? window.ztorLoyalty.get() : FALLBACK; }
  /* 明細是已入帳的歷史分錄：點數照入帳當時的設定算（規格 5.1.0.8 F6：計分類參數只作用於之後的事件、不回算），
     原型把「當時」一律當成規格預設值。 */
  var BOOKED = window.ztorLoyalty ? window.ztorLoyalty.DEFAULTS : FALLBACK;

  function dayStart(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }
  var TODAY0 = dayStart(NOW);
  function daysAgo(t) { return Math.round((TODAY0 - dayStart(new Date(t))) / DAY); }
  function ago(d, hm) {
    var x = new Date(TODAY0 - d * DAY), p = String(hm || '12:00').split(':');
    x.setHours(+p[0], +p[1]);
    return x.getTime();
  }

  /* ── 明細分錄（P0 事件；規格 §7.5、5.1.0.8 F9） ──
     A3 活動票券、A4 電子商店商品：點數＝金額 × K_A × γ；B1 共創投票、B4 按讚、B5 收藏、B3 邀請追蹤：固定點數；
     A6 線下掃碼領點：QR 設定的每次點數（D499／D503，無金額）；ADJ：System Adjust。 */
  var CAT = { A3: 'purchase', A4: 'purchase', A6: 'event', B1: 'interact', B4: 'interact', B5: 'interact', B3: 'referral', ADJ: 'adjust' };
  function booked(code, amount) {
    if (code === 'A3') return Math.round(amount * BOOKED.KA * BOOKED.gamma.a3);
    if (code === 'A4') return Math.round(amount * BOOKED.KA * BOOKED.gamma.a4);
    if (code === 'B1') return BOOKED.pts.b1;
    if (code === 'B4') return BOOKED.pts.b4;
    if (code === 'B5') return BOOKED.pts.b5;
    if (code === 'B3') return BOOKED.pts.b3;
    return 0;
  }
  /* e(code, 標題 i18n 鍵, 時間, { amount, pts, sub, cap, feat, cat }) */
  function e(code, title, t, o) {
    o = o || {};
    var amount = o.amount == null ? null : o.amount;
    var pts = o.cap ? 0 : (o.pts != null ? o.pts : booked(code, amount));
    return { code: code, cat: o.cat || CAT[code] || 'interact', title: 'fan-detail.tl.' + title, sub: o.sub ? 'fan-detail.tl.' + o.sub : null,
             t: t, amount: amount, pts: pts, cap: !!o.cap, feat: o.feat || null };
  }
  function at(s) { var m = s.split(/[\/ :]/); return new Date(+m[0], +m[1] - 1, +m[2], +m[3], +m[4]).getTime(); }

  /* 第 1 位（林詩涵，粉絲詳情原本的示範對象）：P0 明細合計 874。
     掛 S118 的是最終版才有的事件（每日簽到、留言、分享、項目支持、推薦 N 位新粉絲、帶購票金額的報到…），
     release2.4 不顯示；最終版的點數另含衰減，總數本來就不等於明細加總（ASSUMPTIONS UIA-332）。 */
  var L1 = [
    e('A6', 'a6a', ago(0, '18:42'), { pts: 2, sub: 'a6a-sub', feat: 'O43' }),
    e('A6', 'a6b', ago(0, '17:31'), { pts: 10, sub: 'a6b-sub', feat: 'O43' }),
    e('A6', 'a6c', ago(1, '19:52'), { pts: 2, sub: 'a6c-sub', feat: 'O43' }),
    e('A4', 'eshop1', ago(8, '14:32'), { amount: 48 }),
    e('B4', 'like1', ago(9, '20:40')),
    e('B4', 'like2', ago(10, '22:10'), { cap: true }),
    e('B5', 'fav1', ago(12, '18:20')),
    e('B1', 'vote1', ago(35, '12:05')),
    e('A3', 'ticket1', ago(57, '19:00'), { amount: 15 }),
    e('ADJ', 'x', at('2026/02/10 10:00'), { pts: 50 }),
    /* ↓ 最終版才有（S118） */
    e('X', 'interact1', at('2026/10/24 21:05'), { pts: 5, feat: 'S118', cat: 'interact' }),
    e('X', 'checkin', at('2026/10/24 09:12'), { pts: 50, feat: 'S118', cat: 'platform' }),
    e('X', 'interact2', at('2026/10/23 22:47'), { cap: true, feat: 'S118', cat: 'interact' }),
    e('X', 's07', at('2026/10/22 21:48'), { pts: 5, feat: 'S118', cat: 'interact' }),
    e('X', 's08', at('2026/10/20 18:03'), { pts: 10, feat: 'S118', cat: 'interact' }),
    e('X', 's13', at('2026/10/17 08:50'), { pts: 50, feat: 'S118', cat: 'platform' }),
    e('X', 's14', at('2026/10/09 08:44'), { pts: 200, feat: 'S118', cat: 'platform' }),
    e('X', 's15', at('2026/10/02 09:05'), { pts: 50, feat: 'S118', cat: 'platform' }),
    e('X', 's09', at('2026/09/28 12:30'), { pts: 8, feat: 'S118', cat: 'interact' }),
    e('X', 's05', at('2026/09/06 19:10'), { pts: 60, feat: 'S118', cat: 'event' }),
    e('X', 's10', at('2026/09/02 22:15'), { pts: 12, feat: 'S118', cat: 'interact' }),
    e('X', 's11', at('2026/08/05 09:40'), { pts: 50, feat: 'S118', cat: 'referral' }),
    e('X', 's06', at('2026/07/19 14:20'), { pts: 65, amount: 25, feat: 'S118', cat: 'event' }),
    e('X', 's12', at('2026/04/28 17:55'), { pts: 150, feat: 'S118', cat: 'referral' }),
    e('X', 'event1', at('2026/04/12 19:30'), { pts: 210, amount: 60, feat: 'S118', cat: 'event' }),
    e('X', 'project1', at('2026/03/02 11:20'), { pts: 200, amount: 200, feat: 'S118', cat: 'purchase' }),
    e('X', 'referral1', at('2026/02/20 16:08'), { pts: 100, feat: 'S118', cat: 'referral' })
  ];
  L1.forEach(function (x) { if (x.code === 'ADJ') x.title = 'fan-detail.pts.adjust-title'; });

  /* 第 2–9 位：只有 P0 明細，合計＝原本的示範點數；最近一筆的天數＝原本的「距最近一筆有效動作」。 */
  var NAMED = {
    '1': L1,
    '2': [e('B1', 'vote1', ago(5, '21:14')), e('B3', 'invite1', ago(17, '13:02')), e('B1', 'vote1', ago(29, '20:31')), e('A3', 'ticket2', ago(44, '11:48'), { amount: 11 })],                          /* 821 */
    '3': [e('B4', 'like1', ago(34, '22:05')), e('A4', 's01', ago(40, '15:20'), { amount: 35 }), e('B1', 'vote1', ago(55, '19:42')), e('A3', 'ticket2', ago(71, '10:15'), { amount: 17 })],         /* 692 */
    '4': [e('B4', 'like1', ago(3, '23:01')), e('A4', 's04', ago(38, '13:15'), { amount: 54 }), e('A3', 'ticket1', ago(61, '18:30'), { amount: 10 })],                                               /* 655，沉默 35 天後回來＝已挽回 */
    '5': [e('B5', 'fav1', ago(8, '09:33')), e('A4', 's02', ago(19, '20:41'), { amount: 42 }), e('A3', 'ticket1', ago(44, '17:12'), { amount: 10 })],                                                /* 540 */
    '6': [e('B4', 'like1', ago(41, '21:40')), e('B5', 'fav2', ago(45, '12:03')), e('B4', 'like2', ago(50, '22:18')), e('B5', 'fav1', ago(53, '08:57')), e('A4', 's01', ago(60, '16:44'), { amount: 35 }), e('A3', 'ticket2', ago(88, '19:05'), { amount: 12 })],   /* 512 */
    '7': [e('B5', 'fav1', ago(12, '22:30')), e('B5', 'fav2', ago(18, '07:55')), e('B4', 'like1', ago(22, '23:10')), e('B4', 'like2', ago(30, '12:40')), e('B1', 'vote1', ago(45, '20:02')), e('A3', 'ticket1', ago(66, '14:25'), { amount: 12 })],             /* 312 */
    '8': [e('A4', 'sticker', ago(20, '18:16'), { amount: 8 }), e('A3', 'ticket2', ago(34, '19:48'), { amount: 8 }), e('A4', 'photobook', ago(57, '10:05'), { amount: 12 })],                         /* 288 */
    '9': [e('B4', 'like1', ago(6, '21:22')), e('B5', 'fav1', ago(13, '18:47')), e('B5', 'fav2', ago(27, '09:10')), e('B1', 'vote1', ago(40, '20:36')), e('A3', 'ticket1', ago(58, '15:03'), { amount: 6 })]   /* 241 */
  };
  var NAMED_ORDER = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  var NAMED_TAGS = { '1': 'vip high-spender', '2': 'high-spender', '3': 'event intl', '4': 'event', '5': 'intl', '6': '', '7': 'event', '8': 'intl', '9': '' };

  /* ── 生成的粉絲（固定種子，每次載入相同） ── */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var R = rng(20261102);
  function ri(lo, hi) { return lo + Math.floor(R() * (hi - lo + 1)); }
  function pick(a) { return a[Math.floor(R() * a.length)]; }

  var A4_POOL = [['eshop1', 48], ['s01', 35], ['s02', 42], ['s03', 64], ['s04', 54], ['photobook', 12], ['sticker', 8]];
  /* 把點數 p 拆成一串 P0 分錄（合計剛好 = p）。 */
  function decompose(p) {
    var out = [], left = p, m = left % 5;
    if (m) {   /* 票券 11 × a 吸收除以 5 的餘數 */
      var as = [m + 5, m + 10, m + 15].filter(function (a) { return 11 * a <= left; });   /* 票價至少 5 元，點數太少放不下時才退回 m */
      var a = as.length ? pick(as) : m;
      out.push({ code: 'A3', title: pick(['ticket1', 'ticket2']), amount: a });
      left -= 11 * a;
    }
    var guard = 0;
    while (left > 0 && guard++ < 60) {
      var opts = [];
      A4_POOL.forEach(function (x) { if (x[1] * 10 <= left && x[1] >= 35) opts.push({ code: 'A4', title: x[0], amount: x[1], w: 3 }); });
      if (left >= 400) opts.push({ code: 'B3', title: 'invite1', w: 1 });
      if (left >= 150) opts.push({ code: 'B1', title: 'vote1', w: 2 });
      var c;
      if (opts.length) {
        var tot = opts.reduce(function (s, o) { return s + o.w; }, 0), r = R() * tot;
        for (var i = 0; i < opts.length; i++) { r -= opts[i].w; if (r <= 0) { c = opts[i]; break; } }
        c = c || opts[opts.length - 1];
      } else if (left >= 120) c = { code: 'A4', title: 'photobook', amount: 12 };
      else if (left >= 80) c = { code: 'A4', title: 'sticker', amount: 8 };
      else if (left >= 10) c = { code: 'B5', title: pick(['fav1', 'fav2', 'fav3']) };
      else c = { code: 'B4', title: pick(['like1', 'like2', 'like3']) };
      var pts = booked(c.code, c.amount);
      out.push(c); left -= pts;
    }
    for (var j = out.length - 1; j > 0; j--) { var k = Math.floor(R() * (j + 1)), tmp = out[j]; out[j] = out[k]; out[k] = tmp; }
    return out;
  }
  function hm() { var h = ri(8, 23), mi = ri(0, 59); return (h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi; }
  function buildLedger(p, quiet, recovered) {
    var parts = decompose(p), d = quiet;
    return parts.map(function (c, i) {
      if (i > 0) d += (i === 1 && recovered) ? ri(31, 45) : ri(2, 14);
      return e(c.code, c.title, ago(d, hm()), { amount: c.amount == null ? null : c.amount });
    });
  }

  var SUR = [['陳', 'Chen'], ['林', 'Lin'], ['黃', 'Huang'], ['張', 'Chang'], ['李', 'Lee'], ['王', 'Wang'], ['吳', 'Wu'], ['劉', 'Liu'], ['蔡', 'Tsai'], ['楊', 'Yang'],
             ['許', 'Hsu'], ['鄭', 'Cheng'], ['謝', 'Hsieh'], ['郭', 'Kuo'], ['洪', 'Hung'], ['曾', 'Tseng'], ['邱', 'Chiu'], ['廖', 'Liao'], ['賴', 'Lai'], ['周', 'Chou']];
  var GIV = [['怡君', 'Yi-chun'], ['志明', 'Chih-ming'], ['雅婷', 'Ya-ting'], ['冠宇', 'Kuan-yu'], ['佳穎', 'Chia-ying'], ['承恩', 'Cheng-en'], ['詩婷', 'Shih-ting'],
             ['柏翰', 'Po-han'], ['宜蓁', 'Yi-chen'], ['家豪', 'Chia-hao'], ['欣妤', 'Hsin-yu'], ['彥廷', 'Yen-ting'], ['品妍', 'Pin-yen'], ['俊宏', 'Chun-hung'],
             ['思妤', 'Szu-yu'], ['子軒', 'Tzu-hsuan'], ['郁婷', 'Yu-ting'], ['建宏', 'Chien-hung'], ['佩珊', 'Pei-shan'], ['宇辰', 'Yu-chen']];
  var COUNTRY = [[70, 'Taiwan', '台灣'], [10, 'Hong Kong', '香港'], [6, 'Japan', '日本'], [6, 'Singapore', '新加坡'], [5, 'Malaysia', '馬來西亞'], [3, 'United States', '美國']];
  function country() { var r = R() * 100; for (var i = 0; i < COUNTRY.length; i++) { r -= COUNTRY[i][0]; if (r <= 0) return COUNTRY[i]; } return COUNTRY[0]; }

  /* 各分級帶的生成人數、點數範圍、不活躍人數（見檔頭「母體怎麼排」） */
  var BANDS = [
    { n: 11,  lo: 822, hi: 873, inactive: 0 },
    { n: 119, lo: 656, hi: 820, inactive: 6 },
    { n: 266, lo: 513, hi: 654, inactive: 11 },
    { n: 935, lo: 50,  hi: 499, inactive: 40, skew: true }
  ];
  var FANS = [];
  NAMED_ORDER.forEach(function (id) {
    var L = NAMED[id];
    FANS.push({ id: id, gen: false, tags: NAMED_TAGS[id], ledgerRaw: L });
  });
  var gi = 10;
  BANDS.forEach(function (b) {
    var idx = [];
    for (var i = 0; i < b.n; i++) idx.push(i);
    var off = {};   /* 隨機挑出不活躍的人 */
    for (var k = 0; k < b.inactive; k++) { var j = k + Math.floor(R() * (idx.length - k)), tmp = idx[k]; idx[k] = idx[j]; idx[j] = tmp; off[idx[k]] = 1; }
    for (var n = 0; n < b.n; n++) {
      var p = b.skew ? b.lo + Math.floor((b.hi - b.lo + 1) * Math.pow(R(), 1.6)) : ri(b.lo, b.hi);
      var quiet, rec = false;
      if (off[n]) quiet = ri(90, 290);
      else if (b !== BANDS[0] && R() < 0.06) quiet = ri(35, 89);
      else { quiet = Math.floor(30 * Math.pow(R(), 1.5)); if (quiet < 7 && R() < 0.03) rec = true; }
      var s = SUR[(gi * 7) % SUR.length], g = GIV[(gi * 13 + Math.floor(gi / 20)) % GIV.length], c = country();
      var tags = [];
      if (b === BANDS[0] && R() < 0.5) tags.push('vip');
      if (c[1] !== 'Taiwan') tags.push('intl');
      FANS.push({ id: 'g' + gi, gen: true, zhName: s[0] + g[0], enName: g[1] + ' ' + s[1],
                  email: g[1].toLowerCase().replace('-', '') + '.' + s[1].toLowerCase() + gi + '@mail',
                  zhCountry: c[2], enCountry: c[1], tags: tags, ledgerRaw: buildLedger(p, quiet, rec) });
      gi++;
    }
  });

  /* 由明細算：點數（P0 淨額）、最近一筆有效動作、上一筆的間隔、事件標記 */
  FANS.forEach(function (f, order) {
    var p0 = f.ledgerRaw.filter(function (x) { return !x.feat || x.feat === 'O43'; });
    f.order = order;
    f.points = p0.reduce(function (s, x) { return s + x.pts; }, 0);
    var acts = p0.filter(function (x) { return x.code !== 'ADJ'; }).map(function (x) { return daysAgo(x.t); }).sort(function (a, b) { return a - b; });
    f.quietDays = acts.length ? acts[0] : 9999;
    f.prevGap = acts.length > 1 ? acts[1] - acts[0] : 0;
    f.purchases = p0.filter(function (x) { return x.code === 'A3' || x.code === 'A4'; }).map(function (x) { return { code: x.code, d: daysAgo(x.t), amount: x.amount }; });
    if (f.gen && f.purchases.some(function (x) { return x.code === 'A3'; })) f.tags.push('event');
    if (Array.isArray(f.tags)) f.tags = f.tags.join(' ');
  });

  /* ── 依設定排名、分級、狀態（設定變了才重算） ── */
  var memo = null, memoKey = '';
  function compute(over) {
    var s = settings();
    if (over) s = Object.assign({}, s, over);   /* 預覽用（分級設定彈窗打字時）：只換這次的計算，下一次不帶 over 就切回生效值 */
    var key = JSON.stringify([s.topPct, s.sFloor, s.activeDays, s.riskDays]);
    if (memo && key === memoKey) return memo;
    var list = FANS.slice().sort(function (a, b) { return b.points - a.points || a.order - b.order; });
    var M = list.filter(function (f) { return f.points > 0; }).length;
    var cut = s.topPct.map(function (p) { return Math.floor(M * p / 100); });
    if (cut[0] < 1 && M > 0) cut[0] = 1;   /* D476：核心圈至少 1 人 */
    cut[1] = Math.max(cut[1], cut[0]); cut[2] = Math.max(cut[2], cut[1]);
    var mins = { inner: null, super: null, devoted: null, fan: null };
    list.forEach(function (f, i) {
      f.rank = i + 1;
      var t = 'fan';
      if (f.points >= s.sFloor && f.points > 0) t = f.rank <= cut[0] ? 'inner' : f.rank <= cut[1] ? 'super' : f.rank <= cut[2] ? 'devoted' : 'fan';
      f.tier = t;
      if (mins[t] === null || f.points < mins[t]) mins[t] = f.points;
      f.active = f.quietDays < s.activeDays;
      f.recovered = f.quietDays < s.riskDays && f.quietDays < 7 && f.prevGap >= s.riskDays;
      f.rev = f.purchases.reduce(function (sum, x) { return sum + (x.d < s.activeDays ? x.amount : 0); }, 0);
    });
    memo = { list: list, mins: mins, s: s };
    memoKey = key;
    return memo;
  }

  function get(id) {
    var l = compute().list;
    for (var i = 0; i < l.length; i++) if (l[i].id === String(id)) return l[i];
    return null;
  }
  function tierMin(tier) { return compute().mins[tier]; }
  function nextTier(tier) { var i = TIERS.indexOf(tier); return i > 0 ? TIERS[i - 1] : null; }

  /* 升級進度（5.1.7.7 §2.3，D497 第 9 項）：
     D＝目前點數 < S_floor 時為 S_floor；≥ S_floor 時為下一級目前最低分；進度＝點數 ÷ D（封頂 100%）。
     核心圈＝已達最高級；下一級目前無人＝視為已達該級（100%）。
     points 可傳入目前值（粉絲詳情裡 Admin 調整後的點數）。 */
  function progress(fan, points) {
    if (!fan) return null;
    var c = compute(), p = typeof points === 'number' ? points : fan.points;
    var next = nextTier(fan.tier);
    if (!next) return { top: true };
    var D;
    if (p < c.s.sFloor) D = c.s.sFloor;
    else {
      D = c.mins[next];
      if (D === null) return { top: false, D: null, pct: 100, need: 0, next: next };
    }
    var pct = Math.min(100, Math.round(p / D * 100));
    return { top: false, D: D, pct: pct, need: Math.max(0, D - p), next: next };
  }

  /* 狀態（5.1.7 F4）：近 N 天（流失風險視窗）沒有任何有效動作＝流失風險；
     流失風險粉絲重新出現一筆有效動作＝已挽回（〔推導〕：最近一筆在 7 天內、且與上一筆相隔 ≥ N 天）。 */
  function status(fan) {
    if (!fan) return 'active';
    var s = memo ? memo.s : compute().s;
    if (fan.quietDays >= s.riskDays) return 'risk';
    return fan.recovered ? 'recovered' : 'active';
  }

  function summary(over) {
    var c = compute(over), s = c.s, tiers = {}, total = c.list.length, active = 0, revenue = 0, sum = 0, groups = {};
    TIERS.forEach(function (t) { tiers[t] = { all: 0, active: 0, rev: 0 }; });
    c.list.forEach(function (f) {
      tiers[f.tier].all++;
      sum += f.points;
      revenue += f.rev;
      if (f.active) { active++; tiers[f.tier].active++; tiers[f.tier].rev += f.rev; }
      if (status(f) === 'risk') {
        var g = groups[f.tier] || (groups[f.tier] = { tier: f.tier, n: 0, days: Infinity });
        g.n++; g.days = Math.min(g.days, f.quietDays);
      }
    });
    var riskGroups = TIERS.filter(function (t) { return groups[t]; }).map(function (t) { return groups[t]; });
    return {
      total: total, active: active, revenue: revenue, avg: total ? Math.round(sum / total) : 0,
      risk: riskGroups.reduce(function (n, g) { return n + g.n; }, 0), riskGroups: riskGroups,
      tiers: tiers, settings: s
    };
  }

  /* 明細（新到舊），每次回傳新陣列 */
  function ledger(id) {
    var f = get(id);
    if (!f) return [];
    return f.ledgerRaw.slice().sort(function (a, b) { return b.t - a.t; }).map(function (x) { return Object.assign({}, x); });
  }

  function lang() { return String(document.documentElement.lang || 'en').indexOf('zh') === 0 ? 'zh' : 'en'; }
  FANS.forEach(function (f) {
    if (!f.gen) return;
    f.name = function () { return lang() === 'zh' ? f.zhName : f.enName; };
    f.countryName = function () { return lang() === 'zh' ? f.zhCountry : f.enCountry; };
  });

  document.addEventListener('ztor:loyalty-changed', function () { memo = null; });

  var api = {
    TIERS: TIERS, NOW: NOW,
    get list() { return compute().list; },
    get: get, ledger: ledger, tierMin: tierMin, progress: progress, status: status, summary: summary,
    settings: settings, daysAgo: daysAgo,
    get S_FLOOR() { return settings().sFloor; },
    get RISK_DAYS() { return settings().riskDays; },
    get ACTIVE_DAYS() { return settings().activeDays; },
    get RECENT_DAYS() { return settings().recentDays; }
  };
  window.ztorFans = api;
})();
