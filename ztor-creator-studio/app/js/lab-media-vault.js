/* lab-media-vault.js — 媒體庫 UX 改版 demo（2026-10-29）。
   設計探索頁，不碰正式頁 media-vault.html 與 vault-store.js；資料只活在這一頁，重新整理就回到示範狀態。
   規則依 documents/5.1.7.3-媒體庫.md（F1–F10）、D376／D377／D477／D483／D488；呈現假設寫在 note/媒體庫UX重新規劃.md。

   畫面分四塊，全部從同一份 state 重畫：
   1. 庫房列（F1）
   2. 標頭＋檢查表（F10）
   3. 照建立順序排兩區（2026-10-30 使用者：「建立倉庫 > 加東西 > 設定誰開得了的權限」）：
      放了哪些內容（F5 內容、F8 任務）→ 誰開得了（F2 進庫方法、F3 觸及、F4 鑰匙、F9 分享連結）
      新增庫房走三步精靈：取名 → 放內容 → 誰開得了，最後存成草稿或發布
   4. 右欄「粉絲看到的樣子」（F6 檢視身分）＋整座庫房的三個數字 */
(function () {
  "use strict";

  /* ── 分級與粉絲母體 ───────────────────────────────── */
  var TIERS = [
    { k: "inner", n: "核心圈", c: 13 },
    { k: "super", n: "超級粉絲", c: 115 },
    { k: "ranked", n: "上榜粉絲", c: 257 },
    { k: "fan", n: "一般粉絲", c: 898 }
  ];
  var TOTAL = 1283;

  /* 五種條件（F2）。rate＝各分級符合的機率；cap＝限量（售出數、報到數），只取前 N 位 */
  var KINDS = [
    { t: "tier", n: "分級" },
    { t: "bought", n: "買過" },
    { t: "backed", n: "支持過" },
    { t: "attended", n: "出席過" },
    { t: "earned", n: "達成過" }
  ];
  var OPTS = {
    tier: TIERS.map(function (t, i) { return { id: "t" + i, n: t.n + (i === 0 ? "" : "以上"), tier: i }; }),
    bought: [
      { id: "b-vinyl", n: "《Coastline》黑膠", rate: [0.9, 0.6, 0.25, 0.05] },
      { id: "b-zine", n: "巡迴誌 Vol.2", rate: [0.7, 0.4, 0.15, 0.03] },
      { id: "b-jacket", n: "舞台外套（限量 50）", cap: 50 }
    ],
    backed: [
      { id: "k-tour", n: "東岸巡迴計畫", rate: [0.95, 0.7, 0.3, 0.06] },
      { id: "k-mv", n: "《醉別分手》MV 計畫", rate: [0.6, 0.35, 0.12, 0.02] }
    ],
    attended: [
      { id: "a-sign", n: "簽名會・台北", cap: 118 },
      { id: "a-live", n: "Realive 演唱會", cap: 420 }
    ],
    earned: [
      { id: "e-hof", n: "名人堂", rate: [0.8, 0.2, 0, 0] },
      { id: "e-score", n: "Ztor Score 800 以上", rate: [1, 0.5, 0.1, 0] },
      { id: "e-streak", n: "連續支持 6 個月", rate: [0.9, 0.55, 0.2, 0.02] }
    ]
  };
  function optById(id) {
    for (var k in OPTS) for (var i = 0; i < OPTS[k].length; i++) if (OPTS[k][i].id === id) return { kind: k, o: OPTS[k][i] };
    return null;
  }

  var seed = 20261029;
  function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }

  var FANS = [];
  TIERS.forEach(function (t, ti) { for (var i = 0; i < t.c; i++) FANS.push({ ti: ti, has: {}, done: {} }); });
  var W = [1, 0.7, 0.35, 0.08];
  Object.keys(OPTS).forEach(function (k) {
    if (k === "tier") return;
    OPTS[k].forEach(function (o) {
      if (o.cap) {
        FANS.map(function (f, i) { return { i: i, s: rnd() * W[f.ti] }; })
          .sort(function (a, b) { return b.s - a.s; })
          .slice(0, o.cap)
          .forEach(function (x) { FANS[x.i].has[o.id] = true; });
      } else {
        FANS.forEach(function (f) { if (rnd() < o.rate[f.ti]) f.has[o.id] = true; });
      }
    });
  });

  /* 指定一位粉絲（F6）：示範名單，覆寫母體裡同分級的某一位，數字仍是 1,283 */
  var DIRECTORY = [
    { name: "林小魚", mail: "fish.lin@mail.com", ti: 2, has: { "a-sign": 1 }, done: {} },
    { name: "陳阿傑", mail: "jay.chen@mail.com", ti: 1, has: { "b-vinyl": 1, "k-tour": 1, "e-streak": 1 }, done: { shop: 1 } },
    { name: "Mina Ko", mail: "mina.ko@mail.com", ti: 0, has: { "b-vinyl": 1, "b-zine": 1, "k-tour": 1, "k-mv": 1, "e-hof": 1, "e-score": 1, "e-streak": 1 }, done: { follow: 1, shop: 1 } },
    { name: "王大明", mail: "daming@mail.com", ti: 3, has: {}, done: {} },
    { name: "Sky 周", mail: "sky.chou@mail.com", ti: 3, has: { "b-zine": 1 }, done: { follow: 1 } },
    { name: "黃怡君", mail: "ijun.h@mail.com", ti: 2, has: { "b-vinyl": 1, "k-tour": 1 }, done: {} }
  ];
  DIRECTORY.forEach(function (d, n) {
    var start = TIERS.slice(0, d.ti).reduce(function (s, t) { return s + t.c; }, 0);
    d.idx = start + n;
    FANS[d.idx] = { ti: d.ti, has: d.has, done: d.done };
  });

  /* ── 任務（F8）：九種行動任務；只有「商城消費・指定商品」有逐人資料 ── */
  var ACTIONS = [
    { k: "follow", n: "追蹤創作者", miss: ["缺逐人追蹤狀態與開始時間的定義"] },
    { k: "join", n: "加入社群", miss: ["社群在站內或站外尚未決定"] },
    { k: "shareVault", n: "分享庫房頁面給 N 位朋友", param: "n", miss: ["沒有分享事件與被分享對象的紀錄"] },
    { k: "sharePost", n: "分享指定貼文給 N 人", param: "n", miss: ["只有貼文層級的彙總，沒有逐人資料"] },
    { k: "invite", n: "邀請 N 位朋友加入社群", param: "n", miss: ["社群與合格的定義都還沒有"] },
    { k: "watch", n: "看完指定影片", miss: ["沒有逐人看完紀錄", "「看完」的門檻未定"] },
    { k: "watchParty", n: "參加過一場 Watch Party", miss: ["出席判定未定義"] },
    { k: "shop", n: "商城消費", ready: true, miss: ["「任一商品」的口徑待確認", "完成時點（下單、付款完成或過了退款期）待確認"] },
    { k: "tip", n: "爆米花打賞累積 N", param: "n", miss: ["打賞功能本身還沒有規格"] }
  ];
  function actionOf(k) { for (var i = 0; i < ACTIONS.length; i++) if (ACTIONS[i].k === k) return ACTIONS[i]; return ACTIONS[0]; }

  /* ── 庫房示範資料 ─────────────────────────────────── */
  var IMG = "images/";
  function claimSome(n) {   /* 鑰匙領取者：偏低分級，讓去重有意義 */
    var out = [];
    while (out.length < n) { var i = Math.floor(Math.pow(rnd(), 0.5) * TOTAL); if (out.indexOf(i) < 0) out.push(i); }
    return out;
  }
  var uid = 100;
  function nid(p) { uid += 1; return p + uid; }

  var VAULTS = [
    {
      id: "v1", name: "未發行 Demo 與分軌", note: "粗混與分軌檔，未授權再散布。", status: "listed",
      unlistAt: "", paused: null, ever: 214,
      routes: [[{ v: "t1" }], [{ v: "t3" }, { v: "a-sign" }]],
      keys: [],
      items: [
        { id: "i1", kind: "image", name: "母帶室白板", img: IMG + "products/coastline-acetate.webp", size: "2.6 MB", added: "2026/07/16", task: null, ever: 140 },
        { id: "i2", kind: "image", name: "EP 封面未採用版", img: IMG + "products/coastline-ep.webp", size: "3.1 MB", added: "2026/07/16", task: { type: "action", k: "shop", target: "b-vinyl" }, grand: true, ever: 61 },
        { id: "i3", kind: "audio", name: "Neon Crossing 粗混 v4", size: "9.8 MB", added: "2026/07/22", dur: "4:12", task: { type: "tier", tier: 1 }, ever: 128 },
        { id: "i4", kind: "audio", name: "Undertow 鼓組分軌", size: "13.1 MB", added: "2026/07/22", dur: "5:03", task: { type: "action", k: "follow" }, ever: 0 },
        { id: "i5", kind: "audio", name: "Rooftop Wind Demo（語音備忘）", size: "2.4 MB", added: "2026/07/18", dur: "1:47", task: null, ever: 129 }
      ]
    },
    {
      id: "v2", name: "東岸巡迴・幕後", note: "巡迴路上的照片與短片。", status: "listed", unlistAt: "2026-12-31T23:59", paused: null, ever: 610,
      routes: [[{ v: "k-tour" }]],
      keys: [
        { id: "k1", code: "HQ7M-3XKD", type: "nfc", label: "巡迴鑰匙圈（NFC）", uses: 300, claimed: claimSome(118), revoked: false, born: "2026/07/26" },
        { id: "k2", code: "PL4R-8WZN", type: "gift", label: "送給攝影師阿哲", uses: 1, claimed: claimSome(1), revoked: false, born: "2026/08/02" }
      ],
      items: [
        { id: "i6", kind: "image", name: "台中場後台", img: IMG + "projects/nick-lrh-tour.jpg", size: "4.2 MB", added: "2026/08/03", task: null, ever: 520 },
        { id: "i7", kind: "image", name: "舞台外套特寫", img: IMG + "products/stage-worn-jacket.webp", size: "3.8 MB", added: "2026/08/03", task: { type: "tier", tier: 1 }, ever: 133 },
        { id: "i8", kind: "image", name: "簽名海報", img: IMG + "products/signed-tour-poster.webp", size: "2.9 MB", added: "2026/08/04", task: { type: "tier", tier: 0 }, ever: 15 },
        { id: "i9", kind: "clip", name: "台北場彩排", img: IMG + "projects/nick-realive.jpg", size: "88 MB", added: "2026/08/05", dur: "2:31", task: { type: "action", k: "watch" }, ever: 0 },
        { id: "i10", kind: "image", name: "巡迴誌內頁", img: IMG + "products/tour-zine-vol-02.webp", size: "5.0 MB", added: "2026/08/06", task: null, ever: 498 }
      ]
    },
    {
      id: "v3", name: "《醉別分手》MV 拍攝現場", note: "", status: "draft", listAt: "2026-11-07T20:00", unlistAt: "", paused: null, ever: 0,
      routes: [[{ v: "k-mv" }], [{ v: "t0" }]],
      keys: [{ id: "k3", code: "MV9T-2QHA", type: "nfc", label: "MV 小卡（NFC）", uses: 200, claimed: [], revoked: false, born: "2026/10/20" }],
      items: [
        { id: "i11", kind: "image", name: "深水埗月光場景", img: IMG + "projects/shamshuipo-moonlight.jpg", size: "3.3 MB", added: "2026/10/18", task: null, ever: 0 },
        { id: "i12", kind: "image", name: "冰室分鏡", img: IMG + "projects/kowloon-bingsutt.jpg", size: "2.7 MB", added: "2026/10/18", task: null, ever: 0 },
        { id: "i13", kind: "clip", name: "旺角槍戰 NG 片段", img: IMG + "projects/mong-kok-shootout-card.webp", size: "64 MB", added: "2026/10/19", dur: "1:12", task: { type: "action", k: "shareVault", n: 3 }, ever: 0 }
      ]
    },
    {
      id: "v4", name: "簽名會現場・台北", note: "", status: "unlisted", unlistAt: "", paused: { unlistAt: "2026-09-30T22:00" }, ever: 118,
      routes: [[{ v: "a-sign" }]],
      keys: [],
      items: [
        { id: "i14", kind: "image", name: "簽名桌", img: IMG + "products/nick-single.jpg", size: "2.1 MB", added: "2026/09/02", task: null, ever: 118 },
        { id: "i15", kind: "image", name: "合照牆", img: IMG + "products/nick-album.jpg", size: "2.5 MB", added: "2026/09/02", task: null, ever: 117 }
      ]
    },
    {
      id: "v5", name: "核心圈語音信", note: "", status: "draft", unlistAt: "", paused: null, ever: 0,
      routes: [[]],
      keys: [],
      items: []
    }
  ];

  /* ── 狀態 ─────────────────────────────────────────── */
  var state = {
    vid: "v1",
    mode: "setup",
    lens: null,           // null｜{type:"tier",ti}｜{type:"fan",d}
    lensKind: "me",
    menu: false,
    renaming: false,
    openTab: "cond",      // 開啟方式分頁：cond｜key
    wizard: null          // null｜{step:1–3, name, vid}
  };
  function vault() { for (var i = 0; i < VAULTS.length; i++) if (VAULTS[i].id === state.vid) return VAULTS[i]; return VAULTS[0]; }

  /* ── 計算（F3）：真集合運算，一人只算一次 ───────────── */
  function meets(f, c) {
    var o = optById(c.v);
    if (!o) return false;
    if (o.kind === "tier") return f.ti <= o.o.tier;
    return !!f.has[c.v];
  }
  function routeSet(r) {
    var s = new Set();
    if (!r.length) return s;     // 空的方法不算任何人達成
    FANS.forEach(function (f, i) { if (r.every(function (c) { return meets(f, c); })) s.add(i); });
    return s;
  }
  function keyHolders(v) {
    var s = new Set();
    v.keys.forEach(function (k) { if (!k.revoked) k.claimed.forEach(function (i) { s.add(i); }); });
    return s;
  }
  function reach(v) {
    var byRoute = new Set();
    v.routes.forEach(function (r) { routeSet(r).forEach(function (i) { byRoute.add(i); }); });
    var byKey = keyHolders(v);
    var all = new Set(byRoute);
    var overlap = 0;
    byKey.forEach(function (i) { if (byRoute.has(i)) overlap += 1; all.add(i); });
    return { all: all, route: byRoute.size, key: byKey.size, overlap: overlap };
  }
  function hasPath(v) { return v.routes.some(function (r) { return r.length > 0; }) || v.keys.some(function (k) { return !k.revoked; }); }
  function tierFloor(v) {   /* 等級任務可選範圍（D377）：回傳最低可選的分級 index */
    var real = v.routes.filter(function (r) { return r.length; });
    if (!real.length || v.keys.some(function (k) { return !k.revoked; })) return 3;
    var floor = 0;
    for (var i = 0; i < real.length; i++) {
      var tc = real[i].map(optById).filter(function (o) { return o && o.kind === "tier"; });
      if (!tc.length) return 3;
      var low = Math.min.apply(null, tc.map(function (o) { return o.o.tier; }));   /* 同一種方法內條件全部達成，取最嚴的那條 */
      floor = Math.max(floor, low);
    }
    return floor;
  }
  /* 這件內容此刻看得到的人；null＝沒有逐人資料，算不出來 */
  function itemVisible(v, it, R) {
    R = R || reach(v).all;
    if (!it.task) return R.size;
    if (it.task.type === "tier") { var n = 0; R.forEach(function (i) { if (FANS[i].ti <= it.task.tier) n += 1; }); return n; }
    if (it.task.k === "shop" && it.task.target) { var m = 0; R.forEach(function (i) { if (FANS[i].has[it.task.target]) m += 1; }); return m; }
    return null;
  }
  function itemEver(v, it, R) {
    var now = itemVisible(v, it, R);
    return v.status === "listed" && now != null ? Math.max(it.ever || 0, now) : (it.ever || 0);
  }
  function vaultNow(v, R) {    /* 目前看得到至少一件的人（一人只算一次） */
    R = R || reach(v).all;
    var s = new Set();
    v.items.forEach(function (it) {
      if (!it.task) R.forEach(function (i) { s.add(i); });
      else if (it.task.type === "tier") R.forEach(function (i) { if (FANS[i].ti <= it.task.tier) s.add(i); });
      else if (it.task.k === "shop" && it.task.target) R.forEach(function (i) { if (FANS[i].has[it.task.target]) s.add(i); });
    });
    return s.size;
  }
  /* 單件對某個視角的狀態：open 已解開／need 需要條件／todo 未解開 */
  function itemState(it, lens) {
    if (!it.task) return { s: "open" };
    if (it.task.type === "tier") {
      var ti = lens.type === "tier" ? lens.ti : FANS[lens.d.idx].ti;
      return ti <= it.task.tier ? { s: "open" } : { s: "need", t: "需要" + TIERS[it.task.tier].n + (it.task.tier ? "以上" : "") };
    }
    if (lens.type === "fan" && FANS[lens.d.idx].done[it.task.k]) return { s: "open" };
    return { s: "todo", t: taskLabel(it.task) };
  }
  function lensReach(v, R) {
    R = R || reach(v).all;
    if (!state.lens) return null;
    if (state.lens.type === "tier") {
      var n = 0; R.forEach(function (i) { if (FANS[i].ti === state.lens.ti) n += 1; });
      return { n: n, of: TIERS[state.lens.ti].c, can: n > 0 };
    }
    var idx = state.lens.d.idx, how = [];
    v.routes.forEach(function (r, ri) { if (r.length && r.every(function (c) { return meets(FANS[idx], c); })) how.push("進庫方法 " + (ri + 1)); });
    v.keys.forEach(function (k) { if (!k.revoked && k.claimed.indexOf(idx) >= 0) how.push("鑰匙 " + k.code); });
    return { can: how.length > 0, how: how };
  }

  /* ── 小工具 ───────────────────────────────────────── */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmt(n) { return n == null ? "—" : Number(n).toLocaleString("en-US"); }
  function ico(n, cls) { return '<i data-lucide="' + n + '" class="ztor-icon' + (cls ? " " + cls : "") + '"></i>'; }
  function q(s, r) { return (r || document).querySelector(s); }
  function toast(m, tone) { if (window.ztorToast) window.ztorToast.show(m, { tone: tone || "success" }); }
  function when(dt) { return dt ? dt.replace("T", " ").replace(/-/g, "/") : ""; }
  function past(dt) { return dt && new Date(dt) < new Date(); }
  function isLive(v) { return v.status === "listed"; }
  var STATUS = {
    draft: { n: "草稿", b: "badge--neutral" },
    listed: { n: "上架中", b: "badge--success" },
    unlisted: { n: "已下架", b: "badge--warning" }
  };
  function taskLabel(t) {
    if (!t) return "不設任務";
    if (t.type === "tier") return TIERS[t.tier].n + (t.tier ? "以上" : "");
    var a = actionOf(t.k), n = a.n.replace("N", t.n || "N");
    if (t.k === "shop" && t.target) n = "買過 " + optById(t.target).o.n;
    return n;
  }
  function coverOf(v) { for (var i = 0; i < v.items.length; i++) if (v.items[i].img) return v.items[i].img; return ""; }
  function kindIcon(k) { return k === "image" ? "image" : k === "clip" ? "film" : "music"; }
  function condName(c) { var o = optById(c.v); if (!o) return "?"; var kn = KINDS.filter(function (k) { return k.t === o.kind; })[0].n; return o.kind === "tier" ? o.o.n : kn + " " + o.o.n; }

  /* ── 1. 庫房列 ────────────────────────────────────── */
  function renderStrip() {
    /* 新增庫房：跟下面的庫房列同一個形狀（同寬、同高、同圓角、同封面位置），用虛線外框表示「這是動作、不是庫房」。
       滑過、聚焦的狀態與庫房列相同；按下進入三步建立流程。 */
    var html = '<button class="lab-vcard lab-vcard--new" type="button" data-act="new-vault"><span class="lab-vcard__cover">' + ico("plus", "ztor-icon--lg") + '</span><span class="lab-vcard__text"><span class="lab-vcard__name">新增庫房</span></span></button>';
    VAULTS.forEach(function (v) {
      var R = reach(v), lr = lensReach(v, R.all), cover = coverOf(v);
      var n = lr ? (lr.n != null ? lr.n : (lr.can ? "進得來" : "進不來")) : R.all.size;
      var st = STATUS[v.status], on = v.id === state.vid, locked = lr && !lr.can;
      /* 第二行一條龍：狀態圓點＋狀態字・人數。選中＝整列淡橘底（站上選中態語彙 --selected-surface），不再畫橘框。 */
      var count = typeof n === "number" ? (isLive(v) ? fmt(n) + " 人" : "上架後 " + fmt(n) + " 人") : n;
      html += '<button class="lab-vcard' + (on ? " lab-vcard--active" : "") + (locked ? " lab-vcard--dim" : "") + '" type="button" data-act="pick" data-v="' + v.id + '"' + (on ? ' aria-current="true"' : "") + '>' +
        '<span class="lab-vcard__cover" style="' + (cover ? "background-image:url(" + cover + ")" : "") + '">' + (cover ? "" : ico(locked ? "lock" : "archive")) + "</span>" +
        '<span class="lab-vcard__text"><span class="lab-vcard__name">' + esc(v.name) + "</span>" +
        '<span class="lab-vcard__meta"><span class="lab-vcard__st lab-vcard__st--' + v.status + '"><i class="lab-vcard__dot"></i>' + st.n + (v.listAt ? " " + ico("clock", "ztor-icon--xs") : "") + "</span>" +
        '<span class="lab-vcard__sep">·</span><span class="lab-num" title="' + (isLive(v) ? "現在打得開" : "上架後打得開") + '">' + (locked ? ico("lock", "ztor-icon--xs") + " " : "") + count + "</span></span></span></button>";
    });
    q("[data-strip]").innerHTML = html;
  }
  function lensName() { return state.lens ? (state.lens.type === "tier" ? TIERS[state.lens.ti].n : state.lens.d.name) : "我"; }

  /* ── 2. 標頭＋檢查表 ─────────────────────────────── */
  function renderHead(v) {
    var st = STATUS[v.status];
    var sched = "";
    if (v.listAt) sched = "排程 " + when(v.listAt) + " 上架";
    if (v.status === "listed" && v.unlistAt) sched = "排程 " + when(v.unlistAt) + " 下架";
    if (v.status === "unlisted" && v.paused && v.paused.unlistAt) sched = "保存的下架時間 " + when(v.paused.unlistAt) + (past(v.paused.unlistAt) ? "（已過）" : "");
    var primary = "";
    var noContent = !v.items.length;
    if (v.listAt) primary = '<button class="btn btn--outline" type="button" data-act="cancel-sched">' + ico("clock") + "取消排程</button>";
    else if (v.status === "draft") primary = '<button class="btn btn--primary" type="button" data-act="publish"' + (noContent ? ' disabled title="至少放一件內容才能發布"' : "") + ">" + ico("send") + "發布</button>";
    else if (v.status === "listed") primary = '<button class="btn btn--outline" type="button" data-act="unlist">' + ico("eye-off") + "下架</button>";
    else primary = '<button class="btn btn--primary" type="button" data-act="relist"' + (noContent ? " disabled" : "") + ">" + ico("refresh-cw") + "重新上架</button>";

    var name = state.renaming
      ? '<input class="input lab-head__nameinput" data-rename value="' + esc(v.name) + '" aria-label="庫房名稱">'
      : '<button class="lab-head__name" type="button" data-act="rename" title="點一下改名">' + esc(v.name) + "</button>";

    q("[data-head]").innerHTML =
      '<div style="min-width:0"><div class="lab-head__title">' + name + '<span class="badge ' + st.b + '">' + st.n + "</span>" +
      (sched ? '<span class="lab-note">' + ico("clock", "ztor-icon--xs") + " " + sched + "</span>" : "") + "</div>" +
      "</div>" +
      '<div class="lab-head__actions"><button class="btn btn--outline" type="button" data-act="share">' + ico("share") + "分享</button>" + primary +
      '<button class="btn btn--icon btn--outline" type="button" data-act="menu" aria-label="更多動作">' + ico("more-horizontal") + "</button>" +
      (state.menu ? menuHtml(v) : "") + "</div>";
    var ri = q("[data-rename]");
    if (ri) { fitRename(ri); ri.focus(); ri.select(); }
  }
  /* 改名輸入框的寬度＝名稱文字量出來的寬度（用同樣字體量），輸入時跟著長，才不會比名稱寬一大截把徽章擠到下一行 */
  function fitRename(inp) {
    var m = document.createElement("span"), cs = getComputedStyle(inp);
    m.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font:" + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    m.textContent = inp.value || " ";
    document.body.appendChild(m);
    inp.style.width = Math.ceil(m.getBoundingClientRect().width) + 2 + "px";
    document.body.removeChild(m);
  }
  function menuHtml(v) {
    var live = isLive(v);
    return '<div class="lab-menu" role="menu">' +
      '<button class="lab-menu__item lab-menu__item--danger" type="button" data-act="delete"' + (live ? " disabled" : "") + ">" + ico("trash-2") + "刪除庫房</button>" +
      (live ? '<p class="lab-menu__hint">上架中不能直接刪，要先下架。</p>' : "") + "</div>";
  }
  /* ── 3a. 第一道門：誰進得來 ──────────────────────── */
  /* 權限區：照原型原本的「存取權限」分頁（2026-11-02 使用者：「現在的原型做的還比這個好」）。
     即時人數句 → 條件開放（每種進庫方法一張「方法 N」小卡、「或是」分隔、白話總結）→ 直接開放（鑰匙）→ 分享連結。
     文案取自原型的 i18n（vault.ac.*）。 */
  var ZH = {
    method: "方法 {n}", count: "這種方法有 <b>{n}</b> 人符合", all: "這些要一起達成", or: "或是", add: "再加一個", addAria: "在這一種方法裡再加一個條件",
    addway: "再加一種方法", rules: "條件開放", rulesHelp: "條件開放怎麼算", sumAny: "達成任一種方法就進得來。", sumZero: "已設定條件，但目前 0 人符合任一種方法。",
    noRules: "目前沒有人進得來——還沒設定條件。", noRulesKeys: "還沒設定條件——目前只有持鑰匙的人進得來。", direct: "直接開放", gift: "送給一位粉絲", nfc: "做成 NFC 商品",
    keysOff: "上架前粉絲不能領取鑰匙：領取只會看到「尚未開放」，不扣次數。現在仍可先發鑰匙。", keysEmpty: "還沒發出任何鑰匙。", colKey: "代碼・用途", colUses: "已領取／總次數", colStatus: "狀態",
    active: "有效", revoked: "已撤銷", revoke: "撤銷", link: "分享連結", copy: "複製連結",
    linkHint: "連結只帶粉絲到這座庫房，不會讓他進得來——進庫仍要符合條件或持有鑰匙。",
    linkOffDraft: "草稿不能分享：粉絲還看不到這座庫房，發布後才能分享。", linkOffUnlisted: "已下架不能分享：粉絲看不到這座庫房，重新上架後才能分享。"
  };
  function Z(k, vars) { var t = ZH[k]; if (vars) Object.keys(vars).forEach(function (x) { t = t.replace("{" + x + "}", vars[x]); }); return t; }
  var RULE_ICON = { tier: "layers", bought: "package", backed: "heart", attended: "calendar", earned: "award" };
  var RULE_VERB = { tier: "分級 ≥", bought: "買過", backed: "支持過", attended: "出席過", earned: "達成過" };
  function ruleChip(c, ri, ci) {
    var o = optById(c.v); if (!o) return "";
    var text = o.kind === "tier" ? '<span class="vault-rule__verb">分級 ≥ </span>' + esc(TIERS[o.o.tier].n) : '<span class="vault-rule__verb">' + RULE_VERB[o.kind] + " · </span>" + esc(o.o.n);
    return '<span class="chip chip--static chip--removable vault-rule">' + ico(RULE_ICON[o.kind]) + text +
      '<button type="button" class="chip__remove" data-act="rm-cond" data-r="' + ri + '" data-c="' + ci + '" aria-label="移除條件">' + ico("x") + "</button></span>";
  }
  function renderGate1(v, el, bare) {
    el = el || q("[data-gate1]");
    var R = reach(v), live = isLive(v), activeKeys = v.keys.filter(function (k) { return !k.revoked; });
    var nRules = v.routes.reduce(function (n, r) { return n + r.length; }, 0);
    /* 「開啟方式」只有兩種，並排當兄弟（2026-11-02 使用者：這裡是開啟方式，有條件開啟與鑰匙直接開啟兩種）：
       左＝條件開啟（符合任一種方法就能開），右＝鑰匙開啟（拿到鑰匙就能開，不看條件）。兩邊都沒設時才出一句警示。 */

    /* 條件開啟 */
    var onlyEmpty = v.routes.length === 1 && !v.routes[0].length;
    var condBody;
    if (onlyEmpty) {
      condBody = '<div class="lab-way__empty"><button type="button" class="btn btn--outline" data-act="add-cond" data-r="0">' + ico("plus") + "加條件</button></div>";
    } else {
      condBody = '<div class="lab-way__list">' + v.routes.map(function (r, ri) {
        var n = routeSet(r).size;
        return (ri ? '<div class="vault-door__sep"><span>' + Z("or") + "</span></div>" : "") +
          '<div class="lab-way__item"><div class="lab-way__item-head"><span class="lab-way__item-name">' + Z("method", { n: ri + 1 }) + "</span>" +
          (r.length ? '<span class="lab-way__item-n' + (n ? "" : " lab-way__item-n--zero") + '">' + fmt(n) + " 人符合</span>" : "") + "</div>" +
          (r.length >= 2 ? '<div class="vault-door__all">' + Z("all") + "</div>" : "") +
          '<div class="vault-door__chips">' + r.map(function (c, ci) { return ruleChip(c, ri, ci); }).join("") +
          '<button type="button" class="vault-door__add" data-act="add-cond" data-r="' + ri + '" aria-label="' + Z("addAria") + '">' + ico("plus") + Z("add") + "</button></div></div>";
      }).join("") + '</div><button type="button" class="btn btn--ghost btn--sm lab-way__more" data-act="add-route">' + ico("plus") + Z("addway") + "</button>";
    }
    /* 空畫面只留一顆按鈕（2026-11-02 使用者）：沒有條件時不放說明、警示、「還沒有條件」 */
    var cond = onlyEmpty ? '<div class="lab-way">' + condBody + "</div>"
      : '<div class="lab-way"><div class="lab-way__head"><p class="lab-way__desc">符合任一種方法就能開</p>' +
        (nRules ? '<span class="lab-way__n">' + fmt(R.route) + " 人符合任一種</span>" : "") + "</div>" + condBody + "</div>";

    /* 鑰匙開啟 */
    var keyList = v.keys.length
      ? '<div class="lab-way__list">' + v.keys.slice().reverse().map(function (k) {
          return '<div class="lab-key' + (k.revoked ? " lab-key--revoked" : "") + '"><div class="lab-key__main"><span class="lab-key__code">' + esc(k.code) + '</span><span class="lab-key__label">' + esc(k.label) + "</span></div>" +
            '<span class="lab-key__uses">已領 ' + k.claimed.length + " / " + k.uses + "</span>" +
            (k.revoked ? '<span class="badge badge--neutral">' + Z("revoked") + "</span><span></span>" : '<button type="button" class="btn btn--icon btn--ghost btn--sm" data-act="vkey-copy" data-v="' + esc(keyUrl(k.code)) + '" aria-label="複製連結" title="複製連結">' + ico("copy") + '</button><button type="button" class="btn btn--ghost btn--sm" data-act="revoke" data-v="' + k.id + '">' + Z("revoke") + "</button>") + "</div>";
        }).join("") + "</div>"
      : '<div class="lab-way__empty"><p>還沒發鑰匙</p></div>';
    /* 鑰匙開啟：空的時候只有兩顆入口按鈕；有鑰匙之後，所有動作收在清單下面同一排：
       送給一位粉絲、做成 NFC 商品，最右邊「管理鑰匙」（開抽屜，看全部鑰匙與連結）。每把鑰匙自己帶複製連結與撤銷。 */
    var giftBtn = '<button class="btn btn--outline' + (v.keys.length ? " btn--sm" : "") + '" type="button" data-act="key" data-v="gift">' + ico("gift") + "<span>" + Z("gift") + "</span></button>";
    var nfcBtn = '<button class="btn btn--outline' + (v.keys.length ? " btn--sm" : "") + '" type="button" data-act="key" data-v="nfc">' + ico("scan") + "<span>" + Z("nfc") + "</span></button>";
    var keyWay = !v.keys.length
      ? '<div class="lab-way"><div class="lab-way__actions">' + giftBtn + nfcBtn + "</div></div>"
      : '<div class="lab-way"><div class="lab-way__head"><p class="lab-way__desc">拿到鑰匙就能開，不看條件</p>' + (activeKeys.length ? '<span class="lab-way__n">已領 ' + fmt(R.key) + " 人</span>" : "") + "</div>" + keyList +
        '<div class="lab-way__actions">' + giftBtn + nfcBtn + '<button class="btn btn--ghost btn--sm lab-way__manage" type="button" data-act="keys-manage">' + ico("key") + "<span>管理鑰匙</span></button></div></div>";

    /* 開啟方式只有兩種，用分頁切換（2026-11-02 使用者：「這邊改成 tab：條件開啟、鑰匙開啟」）：標題拿掉，分頁就是標題 */
    var tab = state.openTab === "key" ? "key" : "cond";
    el.innerHTML = '<section class="lab-open"><div class="lab-open__head"><div class="tabs lab-open__tabs" role="tablist" aria-label="開啟方式">' +
      '<button class="tabs__item' + (tab === "cond" ? " tabs__item--active" : "") + '" type="button" role="tab" aria-selected="' + (tab === "cond") + '" data-act="open-tab" data-v="cond">' + "條件開啟" + (nRules ? ' <span class="tabs__item-count">' + v.routes.filter(function (r) { return r.length; }).length + "</span>" : "") + "</button>" +
      '<button class="tabs__item' + (tab === "key" ? " tabs__item--active" : "") + '" type="button" role="tab" aria-selected="' + (tab === "key") + '" data-act="open-tab" data-v="key">' + "鑰匙開啟" + (activeKeys.length ? ' <span class="tabs__item-count">' + activeKeys.length + "</span>" : "") + "</button></div>" +
      '<button class="explain-btn" type="button" data-explain="explain-vault-rules" aria-label="' + Z("rulesHelp") + '">' + ico("info") + "</button></div>" +
      '<div class="tab-panel tab-panel--active" role="tabpanel">' + (tab === "cond" ? cond : keyWay) + "</div></section>";
  }

  /* ── 3b. 第二道門：進來後看得到哪幾件 ─────────────── */
  var GROUPS = [{ k: "image", n: "圖片" }, { k: "clip", n: "影片" }, { k: "audio", n: "音檔" }];
  function renderGate2(v, el, bare) {
    el = el || q("[data-gate2]");
    var R = reach(v).all, floor = tierFloor(v);
    /* 內容區只有內容卡片與上傳卡（2026-11-02 使用者：不用篩選）（2026-11-02 使用者）。上傳卡與內容卡同一套卡片外觀。 */
    var uploadCard = '<div class="lab-mcard lab-mcard--add" data-act="upload" data-drop role="button" tabindex="0" aria-label="添加內容（照片、影片、音檔）"><div class="lab-mcard__thumb">' + ico("plus", "ztor-icon--lg") + '</div><div class="lab-mcard__body"><div class="lab-mcard__name">添加</div><div class="lab-mcard__line">&nbsp;</div></div></div>';
    if (!v.items.length) {
      el.innerHTML = '<div class="lab-mgrid">' + uploadCard + '</div><button class="btn btn--ghost btn--sm" type="button" data-act="demo-files" style="justify-self:start">' + ico("sparkles") + "demo 用：放入 3 件示範內容</button>";
      return;
    }
    /* 版型照使用者的線框（2026-11-02「像這樣」）：上面三個 bento，下面一個灰底容器，容器裡是固定三欄的內容卡片，
       「添加」卡接在最後一張後面。不分組、沒有區塊標題；影片與音檔靠縮圖上的時長標記分辨。 */
    var items = [];
    GROUPS.forEach(function (g) { v.items.forEach(function (it) { if (it.kind === g.k) items.push(it); }); });
    var cards = items.map(function (it) {
        var now = itemVisible(v, it, R), ever = itemEver(v, it, R);
        var low = it.task && it.task.type === "tier" && it.task.tier > floor;
        var pending = it.task && it.task.type === "action" && now == null && it.task.k !== "shop";
        /* 第一層（卡片）只回答兩件事：這是什麼、誰拿得到。主要動作＝點開設任務。
           檔案大小、日期、累計解開過都移進設定視窗；任務不再畫成按鈕（整張卡就是按鈕）。 */
        var status;
        if (state.lens) {
          var lr = lensReach(v, R);
          var s2 = !lr.can ? { s: "lock" } : itemState(it, state.lens);
          status = s2.s === "lock" ? '<span class="badge badge--neutral">' + ico("lock", "ztor-icon--xs") + " 庫房上鎖</span>"
            : s2.s === "open" ? '<span class="badge badge--success">已解開</span>'
            : s2.s === "need" ? '<span class="badge badge--warning">' + esc(s2.t) + "</span>"
            : '<span class="badge badge--neutral">未解開</span>';
        } else {
          var noTarget = it.task && it.task.k === "shop" && !it.task.target;
          status = '<span class="lab-mcard__n lab-num" title="' + (pending || noTarget ? "這種任務目前算不出人數" : "目前看得到的人數") + '">' + ico("users", "ztor-icon--xs") + " " + (pending || noTarget ? "—" : fmt(now)) + "</span>";
        }
        var taskLine = '<span class="lab-mcard__task' + (it.task ? " lab-mcard__task--set" : "") + (low ? " lab-mcard__task--warn" : "") + '">' + ico(it.task ? (it.task.type === "tier" ? "award" : "check-circle") : "circle", "ztor-icon--xs") + '<span class="lab-mcard__task-t">' + esc(taskLabel(it.task)) + "</span></span>";
        return '<div class="lab-mcard" data-act="open-item" data-v="' + it.id + '">' +
          '<div class="lab-mcard__thumb" style="' + (it.img ? "background-image:url(" + it.img + ")" : "") + '">' + (it.img ? "" : ico(it.kind === "audio" ? "music" : kindIcon(it.kind), "ztor-icon--lg")) +
          (it.dur ? '<span class="lab-mcard__dur">' + (it.kind === "audio" ? "" : ico("play", "ztor-icon--xs") + " ") + it.dur + "</span>" : "") +
          (it.grand ? '<span class="lab-mcard__grand" title="大彩蛋">' + ico("star", "ztor-icon--xs") + "</span>" : "") + "</div>" +
          '<div class="lab-mcard__body"><div class="lab-mcard__name">' + esc(it.name) + "</div>" +
          '<div class="lab-mcard__line">' + taskLine + status + "</div></div></div>";
    }).join("");
    el.innerHTML = '<div class="lab-mgrid">' + cards + uploadCard + "</div>";
  }

  /* ── 4. 右欄：粉絲看到的樣子 ───────────────────── */
  function renderSide(v, el) {
    var R = reach(v), lr = lensReach(v, R.all), live = isLive(v);
    var kinds = '<div class="segmented" role="tablist" aria-label="以誰來看">' + [["me", "我"], ["tier", "某個分級"], ["fan", "指定粉絲"]].map(function (k) {
      return '<button class="segmented__btn' + (state.lensKind === k[0] ? " segmented__btn--active" : "") + '" type="button" data-act="lens-kind" data-v="' + k[0] + '">' + k[1] + "</button>";
    }).join("") + "</div>";
    var sub = "";
    if (state.lensKind === "tier") {
      sub = '<div class="lab-pv__tiers">' + TIERS.map(function (t, ti) {
        var on = state.lens && state.lens.type === "tier" && state.lens.ti === ti;
        return '<button class="chip' + (on ? " chip--active" : "") + '" type="button" data-act="lens-tier" data-v="' + ti + '">' + t.n + "</button>";
      }).join("") + "</div>";
    } else if (state.lensKind === "fan") {
      sub = state.lens && state.lens.type === "fan"
        ? '<div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-8)"><span>' + ico("user", "ztor-icon--xs") + " <b>" + esc(state.lens.d.name) + '</b> <span class="lab-note">' + TIERS[state.lens.d.ti].n + '</span></span><button class="btn btn--ghost btn--sm" type="button" data-act="lens-fan-clear">換人</button></div>'
        : '<input class="input" data-fan-q placeholder="搜尋名字或 email" aria-label="搜尋粉絲"><div class="lab-fans" data-fan-list>' + fanList("") + "</div>";
    }

    /* 示意畫面 */
    var cover = coverOf(v);
    var body;
    var lensOn = !!state.lens;
    var canEnter = !lensOn || lr.can;
    if (!canEnter) {
      var routes = v.routes.filter(function (r) { return r.length; });
      body = '<div class="lab-lock"><div class="lab-lock__t">' + ico("lock") + "這座庫房目前打不開</div>" +
        (routes.length ? "<span>符合任一種就能進：</span>" + routes.map(function (r, i) { return '<div class="lab-lock__route">' + (i ? "或　" : "") + r.map(condName).map(esc).join(" 且 ") + "</div>"; }).join("") : "<span>目前沒有任何進庫方法。</span>") +
        "</div>";
    } else if (!v.items.length) {
      body = '<div class="lab-lock"><span>這座庫房還沒有內容。</span></div>';
    } else {
      body = '<div class="lab-phone__grid">' + v.items.map(function (it) {
        var s = lensOn ? itemState(it, state.lens) : { s: "open" };
        var tag = !lensOn ? (it.task ? taskLabel(it.task) : "") : s.s === "need" ? s.t : s.s === "todo" ? "去完成：" + s.t : "";
        return '<div class="lab-tile' + (s.s !== "open" ? " lab-tile--veil" : "") + '" style="' + (it.img ? "background-image:url(" + it.img + ")" : "") + '">' +
          (it.img && s.s === "open" ? "" : '<span class="lab-tile__ico">' + ico(s.s === "open" ? (it.kind === "audio" ? "music" : "film") : "lock") + "</span>") +
          (it.grand ? '<span class="lab-tile__star">' + ico("star", "ztor-icon--xs") + "</span>" : "") +
          (tag ? '<span class="lab-tile__tag">' + esc(tag) + "</span>" : "") + "</div>";
      }).join("") + "</div>";
    }
    var note = lensOn && state.lens.type === "tier" && lr.can ? '<span class="lab-note" style="color:var(--on-media-muted)">這一級 ' + fmt(lr.n) + " / " + fmt(lr.of) + " 位打得開；以下是打得開的人看到的樣子。</span>" : "";
    if (lensOn && state.lens.type === "fan" && lr.can) note = '<span class="lab-note" style="color:var(--on-media-muted)">靠 ' + lr.how.join("、") + " 進來</span>";
    var ribbon = live ? "" : '<span class="badge badge--neutral lab-phone__ribbon">尚未開放 · 以下是上架後的樣子</span>';

    (el || q("[data-side]")).innerHTML =
      '<div class="card lab-pv__lens"><div class="card__head" style="margin:0"><div class="card__title-group"><span class="card__title-icon">' + ico("eye") + '</span><h3 class="card__title">粉絲看到的樣子</h3></div>' +
      (lensOn ? '<button class="btn btn--ghost btn--sm" type="button" data-act="lens-reset">回到我的視角</button>' : "") + "</div>" + kinds + sub + "</div>" +
      '<div class="lab-phone"><div class="lab-phone__cover" style="' + (cover ? "background-image:url(" + cover + ")" : "") + '">' + ribbon + '</div><div class="lab-phone__body"><div class="lab-phone__name">' + esc(v.name) + "</div>" + note + body + "</div></div>" +
      '<p class="lab-note">示意：粉絲端庫房頁的畫面還沒有規格（§8.31 第 15 項），這裡只用來確認誰看得到哪幾件。</p>';
  }
  function fanList(term) {
    term = (term || "").toLowerCase();
    return DIRECTORY.filter(function (d) { return !term || d.name.toLowerCase().indexOf(term) >= 0 || d.mail.indexOf(term) >= 0; }).map(function (d) {
      return '<button class="lab-fan" type="button" data-act="lens-fan" data-v="' + d.idx + '"><span>' + esc(d.name) + ' <span class="lab-fan__t">' + d.mail + '</span></span><span class="lab-fan__t">' + TIERS[d.ti].n + "</span></button>";
    }).join("") || '<p class="lab-note">找不到這位粉絲</p>';
  }

  /* ── 成效 ─────────────────────────────────────── */
  /* 成效放在最上面（2026-10-30 使用者：「成效可以放在上面」；11-02「不需要一個 section 包起來，只列三個 bento」）：整座庫房的三個數字只住這裡。
     內容摘要不放；鑰匙使用情況留在「誰開得了」的鑰匙卡（同日使用者指示）。
     每件內容的兩個數字在各自的卡片上，不再另開一個分頁重列一次。 */
  function renderStats(v) {
    var R = reach(v), lr = lensReach(v, R.all), live = isLive(v), lensOn = !!state.lens;
    var now = vaultNow(v, R.all);
    var n1 = lensOn ? (state.lens.type === "tier" ? fmt(lr.n) + '<span class="lab-stat__of"> / ' + fmt(lr.of) + "</span>" : (lr.can ? "進得來" : "進不來")) : fmt(R.all.size);
    var tile = function (val, label, sub) { return '<div class="lab-stat"><div class="lab-stat__v lab-num">' + val + '</div><div class="lab-stat__l">' + label + "</div>" + (sub ? '<div class="lab-stat__s">' + sub + "</div>" : "") + "</div>"; };
    q("[data-stats]").innerHTML =
      tile(n1, lensOn ? (state.lens.type === "tier" ? TIERS[state.lens.ti].n + "打得開" : esc(state.lens.d.name)) : (live ? "現在打得開" : "上架後打得開"), "共 " + fmt(TOTAL) + " 位粉絲") +
      tile(fmt(v.ever), "累計解開過", "只增不減") +
      tile(fmt(now), live ? "目前看得到" : "上架後看得到", "至少一件");
  }

  /* 版型照站上的建立流程（建立專案、建立活動）：全畫面 .wizard，頂列＝返回＋標題＋分段進度條＋已存草稿，
     中間 .wizard__body，底列 .wizard__bottom 放上一步／下一步；不放粉絲預覽（2026-10-30 使用者）。 */
  var WIZ_STEPS = [
    { t: "取名", h: "幫庫房取個名字", sub: "粉絲會看到這個名字，之後可以改。" },
    { t: "放內容", h: "放進要給粉絲的內容", sub: "照片、影片、音檔都可以，會自動分組。每件可以順手設任務，也可以之後再設。" },
    { t: "誰開得了", h: "誰開得了這座庫房", sub: "符合任一種進庫方法、或拿到鑰匙，就能打開。打開之後，每件內容的任務照常。" }
  ];
  function renderWizard() {
    var w = state.wizard, el = q("[data-wiz]"), v = w.vid ? vault() : null;
    var cur = w.step - 1;
    var stepper = '<div class="progress-stepper progress-stepper--segmented progress-stepper--anystep" style="--steps:3;--at:' + w.step + ";--progress:" + (cur / 3 * 100) + '%"><div class="progress-stepper__track"><div class="progress-stepper__fill"></div></div><div class="progress-stepper__labels">' +
      WIZ_STEPS.map(function (st, i) {
        var cls = i < cur ? " progress-stepper__label--done" : i === cur ? " progress-stepper__label--current" : "";
        var state2 = i < cur ? ico("check") + "已完成" : i === cur ? "編輯中" : "未完成";
        return '<span class="progress-stepper__label' + cls + '"' + (v ? ' role="button" tabindex="0" data-act="wiz-go" data-v="' + (i + 1) + '"' : "") + (i === cur ? ' aria-current="step"' : "") + "><span>" + st.t + '</span><span class="progress-stepper__state">' + state2 + "</span></span>";
      }).join("") + "</div></div>";
    q("[data-wiz-sub]").textContent = v ? v.name : "新庫房";
    q("[data-wiz-progress]").innerHTML = stepper;
    q("[data-wiz-saved]").hidden = !v;

    var st = WIZ_STEPS[cur];
    var head = '<div class="wizard__step-head"><div class="wizard__step-head-titles"><h1 class="wizard__step-title">' + st.h + '</h1><p class="wizard__step-sub">' + st.sub + "</p></div></div>";
    var body;
    if (w.step === 1) {
      body = head + '<section class="form-section form-section--outlined"><div class="field"><label class="field__label" for="lab-wname">名稱 <span class="field__req">*</span></label><input class="input" id="lab-wname" data-wiz-name value="' + esc(w.name || (v ? v.name : "")) + '" placeholder="例如：未發行 Demo 與分軌"></div></section>';
    } else {
      body = head + '<section class="form-section form-section--outlined lab-gate" data-wiz-body></section>';   /* 2026-10-30 使用者：建立流程不放粉絲預覽 */
    }
    q("[data-wiz-body-wrap]").innerHTML = body;
    if (w.step === 2) renderGate2(v, q("[data-wiz-body]"), true);
    if (w.step === 3) renderGate1(v, q("[data-wiz-body]"), true);

    var hint = "", btns;
    if (w.step === 1) btns = '<button class="btn btn--primary" type="button" data-act="wiz-next">繼續：放內容</button>';
    else if (w.step === 2) btns = '<button class="btn btn--outline" type="button" data-act="wiz-go" data-v="1">上一步</button><button class="btn ' + (v.items.length ? "btn--primary" : "btn--outline") + '" type="button" data-act="wiz-next">' + (v.items.length ? "繼續：誰開得了" : "先跳過") + "</button>";
    else {
      if (!v.items.length) hint = "還沒放內容，不能發布；可以先存成草稿。";
      else if (!hasPath(v)) hint = "還沒設誰開得了：發布後沒有人打得開，仍然可以發布。";
      btns = '<button class="btn btn--outline" type="button" data-act="wiz-go" data-v="2">上一步</button><button class="btn btn--outline" type="button" data-act="wiz-draft">存成草稿</button><button class="btn btn--primary" type="button" data-act="publish"' + (v.items.length ? "" : " disabled") + ">發布…</button>";
    }
    q("[data-wiz-foot]").innerHTML = '<p class="wizard__bottom-hint' + (hint ? "" : " hidden") + '">' + hint + "</p>" + btns;
    var nm = q("[data-wiz-name]");
    if (nm && document.activeElement !== nm) nm.focus();
    if (window.ztorIcons) window.ztorIcons.applyIcons(el);
  }
  function wizNext() {
    var w = state.wizard;
    if (w.step === 1) {
      var nm = q("[data-wiz-name]"), name = nm ? nm.value.trim() : "";
      if (!name) { toast("先取個名字", "error"); if (nm) nm.focus(); return; }
      if (w.vid) vault().name = name;
      else {
        var nv = { id: nid("v"), name: name, note: "", status: "draft", unlistAt: "", paused: null, ever: 0, routes: [[]], keys: [], items: [] };
        VAULTS.unshift(nv); state.vid = nv.id; w.vid = nv.id;
      }
    }
    w.step = Math.min(3, w.step + 1);
    render();
    var sh = q("[data-wiz] .wizard__sheet"); if (sh) sh.scrollTop = 0;
  }

  /* ── 全部重畫 ─────────────────────────────────── */
  function render() {
    var none = !VAULTS.length;
    q("[data-none]").hidden = !none;
    q("[data-work]").hidden = none;
    renderStrip();
    if (none) { icons(); return; }
    var wiz = state.wizard;
    q("[data-wiz]").hidden = !wiz;
    document.documentElement.classList.toggle("lab-wiz-open", !!wiz);
    if (wiz) renderWizard();
    if (!VAULTS.length) { icons(); return; }
    var v = vault();
    renderHead(v);
    renderStats(v); renderGate2(v); renderGate1(v);
    /* 右欄「粉絲看到的樣子」2026-11-02 使用者要求移除，renderSide 與檢視身分的程式先留著不掛載（規格 F6 的入口待決定放哪） */
    icons();
  }
  function icons() { if (window.ztorIcons) window.ztorIcons.applyIcons(q("[data-item-sheet]")); if (window.ztorIcons) window.ztorIcons.applyIcons(document.getElementById("lab")); if (window.ztorIcons) window.ztorIcons.applyIcons(q("[data-modal]")); if (window.ztorIcons) window.ztorIcons.applyIcons(q("[data-pop]")); }

  /* ── 彈窗 ─────────────────────────────────────── */
  var modalOk = null;
  function openModal(title, html, onOk) {
    q("[data-modal-title]").textContent = title;
    q("[data-modal-body]").innerHTML = html;
    modalOk = onOk || null;
    q("[data-modal]").hidden = false;
    icons();
  }
  function closeModal() { q("[data-modal]").hidden = true; modalOk = null; }
  function foot(okLabel, okCls, okDisabled) {
    return '<div class="lab-dlg__foot"><div class="lab-dlg__btns"><button class="btn btn--ghost" type="button" data-act="modal-close">取消</button><button class="btn ' + (okCls || "btn--primary") + '" type="button" data-act="modal-ok"' + (okDisabled ? " disabled" : "") + ">" + okLabel + "</button></div></div>";
  }
  /* 統一的破壞性確認：後果逐條列出 */
  function confirmDanger(title, lines, okLabel, onOk) {
    openModal(title, '<div class="lab-dlg"><ul class="lab-list">' + lines.map(function (l) { return "<li>" + l + "</li>"; }).join("") + "</ul>" + foot(okLabel, "btn--destructive") + "</div>", onOk);
  }

  /* 任務編輯（單件與批次共用）。批次只開放不設任務與等級任務：行動任務帶各自的參數，逐件設 */
  var editId = null;

  /* ── 單件設定：照原型原本的右側抽屜（2026-11-02 使用者：「這個要改回原本原型的」）──
     預覽 → 粉絲只能線上看 → 名稱 → 唯讀事實 → 任務（單選列＋參數＋判定狀態＋兩個數字）→ 大彩蛋 → 刪除。
     沒有「儲存」鈕：任務與大彩蛋即時生效，名稱在關閉時寫回。 */
  var itemSheet = function () { return q("[data-item-sheet]"); };
  var KIND_LABEL = { image: "圖片", clip: "影片", audio: "音檔" };
  function Li(key, fb, vars) {
    var t = window.i18nT && window.i18nT(key);
    t = t || fb;
    if (vars) Object.keys(vars).forEach(function (k) { t = t.replace("{" + k + "}", vars[k]); });
    return t;
  }
  function itemById(id) { return vault().items.filter(function (i) { return i.id === id; })[0]; }

  var preview = { timer: null, at: 0, len: 0 };
  function durSec(d) { var p = String(d || "").split(":").map(Number); if (p.some(isNaN) || !p.length) return 0; return p.reduce(function (acc, n) { return acc * 60 + n; }, 0); }
  function clock(sec) { sec = Math.max(0, Math.floor(sec)); var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), r = sec % 60; return (h ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (r < 10 ? "0" : "") + r; }
  function previewHtml(it) {
    var cover = it.img ? '<img src="' + esc(it.img) + '" alt="">' : '<span class="mpreview__glyph">' + ico(kindIcon(it.kind)) + "</span>";
    if (it.kind === "image") return '<div class="mpreview mpreview--image lab-portrait vault-item__preview"><div class="mpreview__stage">' + cover + "</div></div>";
    var play = esc(Li("vault.item.preview.play", "播放")), len = durSec(it.dur);
    return '<div class="mpreview mpreview--' + it.kind + ' lab-portrait vault-item__preview" data-preview data-len="' + len + '">' +
      (it.kind === "clip" ? '<div class="mpreview__stage">' + cover + '<button type="button" class="mpreview__bigplay" data-act="preview-toggle" aria-label="' + play + '">' + ico("play") + "</button></div>" : "") +
      '<div class="mpreview__bar"><button type="button" class="mpreview__toggle" data-act="preview-toggle" aria-label="' + play + '">' + ico("play") + '</button><span class="mpreview__track"><span class="mpreview__fill"></span></span><span class="mpreview__time" data-preview-time>' + clock(0) + " / " + (len ? clock(len) : "—") + "</span></div></div>";
  }
  function paintPreview(root) {
    root.style.setProperty("--mp-progress", (preview.len ? Math.min(100, preview.at / preview.len * 100) : 0) + "%");
    var t = root.querySelector("[data-preview-time]"); if (t) t.textContent = clock(preview.at) + " / " + (preview.len ? clock(preview.len) : "—");
  }
  function setPlaying(root, on) {
    root.classList.toggle("is-playing", on);
    var btn = root.querySelector(".mpreview__toggle");
    if (btn) { btn.innerHTML = ico(on ? "pause" : "play"); if (window.ztorIcons) window.ztorIcons.applyIcons(btn); }
  }
  function stopPreview() {
    if (preview.timer) clearInterval(preview.timer); preview.timer = null;
    var root = q("[data-item-body] [data-preview]"); if (root) setPlaying(root, false);
  }
  function togglePreview(root) {
    if (preview.timer) { stopPreview(); return; }
    preview.len = Number(root.getAttribute("data-len")) || 0; if (!preview.len) return;
    if (preview.at >= preview.len) preview.at = 0;
    setPlaying(root, true);
    preview.timer = setInterval(function () { preview.at += 1; paintPreview(root); if (preview.at >= preview.len) stopPreview(); }, 1000);
  }

  function newActionTask(k) {
    var d = actionOf(k), t = { type: "action", k: d.k };
    if (d.param === "n") t.n = 3;
    if (d.k === "shop") { t.scope = "item"; t.target = OPTS.bought[0].id; }
    return t;
  }
  function taskReady(t) { return !!(t && t.type === "action" && t.k === "shop" && t.scope !== "any" && t.target); }
  function tierAtLeast(i) { return TIERS[i].n + (i ? "以上" : ""); }

  function actionParamsHtml(task) {
    var d = actionOf(task.k), out = '<div class="vault-task__params"><div class="field"><label class="field__label" for="vt-kind">種類</label><select class="select" id="vt-kind" data-item-kind>' +
      ACTIONS.map(function (a) { return '<option value="' + a.k + '"' + (a.k === task.k ? " selected" : "") + ">" + esc(a.n) + "</option>"; }).join("") + "</select></div>";
    if (d.k === "shop") {
      var item = task.scope !== "any";
      out += '<div class="field"><span class="field__label">商品範圍</span><div class="segmented" role="radiogroup" aria-label="商品範圍">' +
        '<button type="button" class="segmented__btn' + (!item ? " segmented__btn--active" : "") + '" role="radio" aria-checked="' + !item + '" data-act="item-scope" data-v="any">任一商品</button>' +
        '<button type="button" class="segmented__btn' + (item ? " segmented__btn--active" : "") + '" role="radio" aria-checked="' + item + '" data-act="item-scope" data-v="item">指定商品</button></div></div>';
      if (item) out += '<div class="field"><label class="field__label" for="vt-product">商品</label><select class="select" id="vt-product" data-item-target>' +
        OPTS.bought.map(function (o) { return '<option value="' + o.id + '"' + (o.id === task.target ? " selected" : "") + ">" + esc(o.n) + "</option>"; }).join("") + "</select></div>";
    }
    if (d.param === "n") out += '<div class="field"><label class="field__label" for="vt-n">數量</label><input class="input" id="vt-n" type="number" min="1" step="1" inputmode="numeric" value="' + esc(task.n || "") + '" data-item-n><p class="field__hint">1 以上的整數；可填範圍與上限尚待確認。</p><p class="field__error" data-item-n-error hidden>請填 1 以上的整數。</p></div>';
    out += "</div>";
    var ready = taskReady(task);
    out += '<div class="vault-task__status vault-task__status--' + (ready ? "ready" : "pending") + '">' +
      (ready ? '<span class="badge badge--success">可判定</span><p class="vault-task__status-text">有逐人購買資料，與進庫條件「買過」同一份。</p>'
             : '<span class="badge badge--warning">判定方式待確認</span><p class="vault-task__status-text">現在可以先設定；正式啟用前，規格還缺：</p>') +
      (d.miss && (!ready || task.scope === "any") ? '<ul class="vault-task__missing">' + (ready ? "" : d.miss.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("")) + "</ul>" : "") + "</div>";
    return out;
  }
  function tierParamsHtml(v, task) {
    var floor = tierFloor(v), under = task.tier > floor;
    var hint = floor === 3 ? "第一層有不看分級的進庫方法（或只靠鑰匙進庫），四級都能選。" : "第一層每一種進庫方法都要求" + tierAtLeast(floor) + "，所以只能選這一級或更高。";
    return '<div class="vault-task__params"><div class="field"><label class="field__label" for="vt-tier">等級</label><select class="select" id="vt-tier" data-item-tier>' +
      TIERS.map(function (t, i) { return '<option value="' + i + '"' + (i === task.tier ? " selected" : "") + (i > floor && i !== task.tier ? " disabled" : "") + ">" + esc(tierAtLeast(i)) + "</option>"; }).join("") +
      '</select><p class="field__hint">' + esc(hint) + "</p>" +
      (under ? '<p class="field__hint field__hint--warn">這一級已低於第一層目前的下限；第一層改動後既有的等級任務怎麼處理，尚待確認。</p>' : "") +
      '<p class="field__hint">靠不看分級的方式進來、但分級不夠的粉絲，會看到「需要」這一級。</p></div></div>';
  }
  function reachHtml(v, it) {
    var R = reach(v).all, n = itemVisible(v, it, R), e = itemEver(v, it, R), listed = isLive(v);
    var sub = !it.task ? "等於進得了庫的全部人數。" : n == null ? "這種任務還沒有逐人資料，人數尚待確認。" : "進得了庫的 " + fmt(R.size) + " 位之中。";
    function cell(label, val, pending, note) {
      return '<div class="vault-task__reach-cell"><span class="vault-task__reach-label">' + esc(label) + '</span><span class="vault-task__reach-num' + (pending ? " vault-task__reach-num--pending" : "") + '">' + val + "</span>" + (note ? '<span class="vault-task__reach-sub">' + esc(note) + "</span>" : "") + "</div>";
    }
    return '<div class="vault-task__reach vault-task__reach--pair">' +
      cell(listed ? "目前看得到" : "上架後看得到", n == null ? "待確認" : fmt(n), n == null, sub) +
      cell("累計解開過", fmt(e), false, v.status === "draft" ? "還沒上架過。" : "之後收回也不減。") + "</div>" +
      (listed ? "" : '<p class="vault-task__trial">這是上架後的數字，粉絲現在還看不到。</p>');
  }
  function taskSectionHtml(it) {
    var v = vault(), task = it.task, type = task ? task.type : "none";
    var types = [["none", "不設任務", "進得了庫就看得到。"], ["action", "行動任務", "粉絲去做一件事就解開，完成一次就永久解開。"], ["tier", "等級任務", "分級達到指定等級自動解開，掉級就收回。"]];
    var out = '<section class="vault-task" data-item-task><div class="vault-task__head"><h4 class="vault-task__title" id="vault-task-title">任務</h4><p class="vault-task__lead">粉絲進庫之後，還要做到什麼才看得到這一件；一件只設一個。鑰匙只管進庫，持鑰匙的人一樣要完成任務。</p></div>' +
      '<div class="radio-list" role="radiogroup" aria-labelledby="vault-task-title">' + types.map(function (o) {
        var on = o[0] === type;
        return '<button type="button" class="radio-list__item' + (on ? " radio-list__item--active" : "") + '" role="radio" aria-checked="' + on + '" data-act="item-type" data-v="' + o[0] + '"><span class="radio-list__dot"></span><span class="radio-list__text"><span class="radio-list__title">' + o[1] + '</span><span class="radio-list__sub">' + o[2] + "</span></span></button>";
      }).join("") + "</div>";
    if (type === "action") out += actionParamsHtml(task);
    if (type === "tier") out += tierParamsHtml(v, task);
    return out + reachHtml(v, it) + "</section>";
  }
  function grandRowHtml(it) {
    return '<div class="control-row vault-task__flag"><div><div class="control-row__main" id="vault-grand-label">大彩蛋</div><div class="control-row__sub">只是標記，不影響這一件怎麼解開。</div></div><button type="button" class="switch' + (it.grand ? " switch--on" : "") + '" role="switch" aria-checked="' + !!it.grand + '" aria-labelledby="vault-grand-label" data-act="item-grand"></button></div>';
  }
  function renderItemSheet(it) {
    var rows = [["類型", KIND_LABEL[it.kind]], ["大小", it.size || "—"], ["加入日期", it.added || "—"]];
    if (it.dur) rows.splice(1, 0, ["長度", it.dur]);
    stopPreview();
    q("[data-item-body]").innerHTML = previewHtml(it) +
      '<p class="vault-item__online">' + ico("eye") + "<span>" + esc(Li("vault.item.online", "粉絲只能線上看與播放，不提供下載。")) + "</span></p>" +
      '<label class="field"><span class="field__label">名稱</span><input class="input" type="text" data-item-name value="' + esc(it.name) + '"></label>' +
      '<dl class="vault-item__facts">' + rows.map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("") + "</dl>" +
      taskSectionHtml(it) + grandRowHtml(it) +
      '<div class="vault-item__actions"><button type="button" class="btn btn--outline btn--sm" data-act="item-del">' + ico("trash-2") + "刪除</button></div>";
    icons();
    var pr = q("[data-item-body] [data-preview]"); if (pr) { preview.len = Number(pr.getAttribute("data-len")) || 0; paintPreview(pr); }
  }
  function refreshTask(it) {
    var sec = q("[data-item-task]"); if (!sec) return;
    var wrap = document.createElement("div"); wrap.innerHTML = taskSectionHtml(it);
    sec.replaceWith(wrap.firstChild); icons();
    var flag = q("[data-item-body] .vault-task__flag"); if (flag) { var f2 = document.createElement("div"); f2.innerHTML = grandRowHtml(it); flag.replaceWith(f2.firstChild); icons(); }
    render();
  }
  function openItem(id) {
    var it = itemById(id); if (!it) return;
    editId = id; preview.at = 0;
    renderItemSheet(it);
    var sh = itemSheet(); sh.classList.add("is-open"); sh.setAttribute("aria-hidden", "false");
    var input = q("[data-item-name]"); if (input) input.focus();
  }
  function closeItem() {
    stopPreview();
    var it = itemById(editId), input = q("[data-item-name]");
    if (it && input && input.value.trim()) it.name = input.value.trim();
    editId = null;
    var sh = itemSheet(); sh.classList.remove("is-open"); sh.setAttribute("aria-hidden", "true");
    render();
  }
  /* 發布／重新上架（F10、D488） */
  var pub = { mode: "now", listAt: "", unlistOn: false, unlistAt: "" };
  function openPublish(relist) {
    var v = vault();
    pub = { mode: "now", listAt: "", unlistOn: false, unlistAt: "" };
    if (relist && v.paused && v.paused.unlistAt) { pub.unlistOn = true; pub.unlistAt = v.paused.unlistAt; }
    drawPublish(relist);
  }
  function drawPublish(relist) {
    var v = vault(), path = hasPath(v);
    var blocked = pub.unlistOn && past(pub.unlistAt);
    var checks = (!v.items.length ? '<div class="alert alert--row alert--error"><span class="alert__icon">' + ico("x-circle") + '</span><div class="alert__body">還沒有任何內容，不能' + (relist ? "重新上架" : "發布") + "。</div></div>" : "") +
      (!path ? '<div class="alert alert--row alert--warning"><span class="alert__icon">' + ico("alert-triangle") + '</span><div class="alert__body">發布後沒有人進得來：還沒有進庫方法，也沒有鑰匙。仍然可以發布。</div></div>' : "");
    var restore = relist && v.paused && v.paused.unlistAt
      ? (past(v.paused.unlistAt) && blocked ? '<div class="alert alert--row alert--error"><span class="alert__icon">' + ico("clock") + '</span><div class="alert__body">下架時保存的下架時間 ' + when(v.paused.unlistAt) + " 已經過了。請改成未來的時間，或關掉定時下架。</div></div>"
        : (!past(v.paused.unlistAt) ? '<p class="lab-note">' + ico("clock", "ztor-icon--xs") + " 保存的下架時間 " + when(v.paused.unlistAt) + " 會照舊。</p>" : ""))
      : "";
    openModal(relist ? "重新上架" : "發布庫房",
      '<div class="lab-dlg">' + checks + restore +
      '<div class="segmented radio-cards" role="radiogroup" aria-label="上架方式">' +
      '<button class="segmented__btn' + (pub.mode === "now" ? " segmented__btn--active" : "") + '" type="button" role="radio" aria-checked="' + (pub.mode === "now") + '" data-act="pub-mode" data-v="now"><span class="radio-card__text"><span class="radio-card__title">立刻上架</span><span class="radio-card__sub">確認後粉絲就看得到</span></span></button>' +
      '<button class="segmented__btn' + (pub.mode === "sched" ? " segmented__btn--active" : "") + '" type="button" role="radio" aria-checked="' + (pub.mode === "sched") + '" data-act="pub-mode" data-v="sched"><span class="radio-card__text"><span class="radio-card__title">排定時間</span><span class="radio-card__sub">時間到自動上架</span></span></button></div>' +
      (pub.mode === "sched" ? '<div class="field"><label class="field__label" for="lab-lt">上架日期與時間</label><input class="input" id="lab-lt" type="datetime-local" data-pub-lt value="' + pub.listAt + '"></div>' : "") +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:var(--sp-12)"><span>定時下架<br><span class="lab-note">不設就一直上架，直到你手動下架</span></span><button class="switch' + (pub.unlistOn ? " switch--on" : "") + '" type="button" role="switch" aria-checked="' + pub.unlistOn + '" data-act="pub-unlist" aria-label="定時下架"></button></div>' +
      (pub.unlistOn ? '<div class="field"><label class="field__label" for="lab-ut">下架日期與時間</label><input class="input" id="lab-ut" type="datetime-local" data-pub-ut value="' + pub.unlistAt + '"' + (blocked ? ' aria-invalid="true"' : "") + "></div>" : "") +
      foot(pub.mode === "sched" ? "排定上架" : (relist ? "重新上架" : "發布"), "btn--primary", !v.items.length || blocked) + "</div>",
      function () {
        readPub();
        if (pub.unlistOn && past(pub.unlistAt)) { drawPublish(relist); return; }
        if (pub.mode === "sched" && (!pub.listAt || past(pub.listAt))) { toast("上架時間要晚於現在", "error"); return; }
        v.paused = null;
        v.unlistAt = pub.unlistOn ? pub.unlistAt : "";
        if (pub.mode === "sched") { v.listAt = pub.listAt; toast("已排定 " + when(pub.listAt) + " 上架"); }
        else { v.status = "listed"; v.listAt = ""; toast(relist ? "已重新上架，原本的解開紀錄恢復" : "已發布，粉絲看得到了"); }
        state.wizard = null;
        closeModal(); render();
      });
  }
  function readPub() { var a = q("[data-pub-lt]"), b = q("[data-pub-ut]"); if (a) pub.listAt = a.value; if (b) pub.unlistAt = b.value; }

  /* 鑰匙（F4） */
  /* ── 管理鑰匙：照原型原本的分享抽屜（2026-11-02 使用者：「鑰匙開啟好像有缺少原型的管理鑰匙」）──
     上面「發一把新鑰匙」（意圖兩選一、用途、批量、產生）→ 剛產生的連結＋複製＋到 E-Shop 建立商品 →
     下面「已發出的鑰匙」（每把可複製連結、撤銷）→ 規則說明。 */
  var share = { intent: "gift", created: null };
  function keyUrl(code) { return "https://ztor.com/k/" + code.replace("-", "").toLowerCase(); }
  function shareHtml(v) {
    var isGift = share.intent === "gift", keys = v.keys.slice().reverse();
    var out = '<div class="vshare"><div class="vshare__section"><div class="vshare__label">' + ico("plus") + "發一把新鑰匙</div>" +
      '<div class="vshare__intent">' +
        '<button type="button" class="vshare__opt' + (isGift ? " vshare__opt--active" : "") + '" data-act="share-intent" data-v="gift"><span class="vshare__opt-icon">' + ico("gift") + '</span><span class="vshare__opt-title">送給一位粉絲</span><span class="vshare__opt-sub">一次性。第一個打開的人就拿到權限。</span></button>' +
        '<button type="button" class="vshare__opt' + (!isGift ? " vshare__opt--active" : "") + '" data-act="share-intent" data-v="nfc"><span class="vshare__opt-icon">' + ico("scan") + '</span><span class="vshare__opt-title">做成 NFC 商品</span><span class="vshare__opt-sub">一批可用次數，寫進鑰匙圈或家具裡。</span></button>' +
      "</div>" +
      '<div class="field"><label class="field__label" for="vshare-name">這把鑰匙是做什麼用的？</label><input class="input" id="vshare-name" type="text" placeholder="' + esc(isGift ? "例：給那位寄卡帶來的粉絲" : "例：NFC 鑰匙圈 · 東岸巡迴") + '"></div>' +
      (isGift ? "" : '<div class="field"><label class="field__label" for="vshare-uses">這一批要做幾件商品？</label><input class="input" id="vshare-uses" type="number" min="1" max="100000" value="500"><span class="field__hint">一件商品＝一次。未領取的次數是庫存、不是人，永遠不會被算進「誰進得來」。</span></div>') +
      '<button class="btn btn--primary" type="button" data-act="share-create">' + ico("key") + (isGift ? "產生鑰匙" : "產生這一批") + "</button>";
    if (share.created) {
      var k = share.created;
      out += '<div class="vshare__link"><input class="input" type="text" readonly value="' + esc(keyUrl(k.code)) + '" aria-label="鑰匙連結"><button class="btn btn--primary vshare__copy" type="button" data-act="vkey-copy" data-v="' + esc(keyUrl(k.code)) + '">' + ico("copy") + "<span>複製</span></button></div>" +
        (k.type === "nfc" ? '<a class="btn btn--outline" href="create-product.html?vaultkey=' + encodeURIComponent(k.code) + "&vault=" + encodeURIComponent(v.id) + '">' + ico("shopping-bag") + "到 E-Shop 建立這件商品</a>" : "") +
        '<p class="vshare__hint">' + esc(k.code) + " · 拿到這條連結的人都能用掉 " + fmt(k.uses) + " 次裡的一次。外流的話，在下面撤銷它。</p>";
    }
    out += '</div><div class="vshare__section"><div class="vshare__label">' + ico("key") + "已發出的鑰匙</div>";
    if (!keys.length) out += '<p class="vshare__hint">還沒有鑰匙。目前進得來的人都是靠條件進來的。</p>';
    else out += '<div class="vshare__keys">' + keys.map(function (k) {
      var claimed = k.claimed.length, pct = k.uses ? claimed / k.uses : 0;
      return '<div class="vkey' + (k.revoked ? " vkey--revoked" : "") + '"><div class="vkey__head"><span class="vkey__name">' + esc(k.label) + '</span><span class="vkey__code">' + esc(k.code) + " · " + esc(k.born) + (k.revoked ? " · 已撤銷" : "") + "</span></div>" +
        '<div class="vkey__actions">' + (k.revoked ? "" : '<button type="button" class="vkey__act" data-act="vkey-copy" data-v="' + esc(keyUrl(k.code)) + '" aria-label="複製連結">' + ico("copy") + '</button><button type="button" class="vkey__act vkey__act--danger" data-act="revoke" data-v="' + esc(k.id) + '" aria-label="撤銷">' + ico("x-circle") + "</button>") + "</div>" +
        '<div class="vkey__meter"><span class="vkey__track"><span class="vkey__fill" data-fill="' + pct + '"></span></span><span class="vkey__count">' + fmt(claimed) + " / " + fmt(k.uses) + " 已領取</span></div></div>";
    }).join("") + "</div>";
    out += "</div>";
    if (!isLive(v)) out += '<div class="info-banner">' + ico("clock", "info-banner__icon") + "<span>" + Z("keysOff") + "</span></div>";
    out += '<div class="info-banner">' + ico("info", "info-banner__icon") + "<span>鑰匙是持有者憑證：拿到連結的人就能用掉其中一次，用掉之後權限綁定在那位粉絲的帳號上。鑰匙只管進庫，進庫之後每件內容的任務照常要完成。撤銷一把鑰匙，所有靠它進來的人會立刻失去權限——粉絲人數會當場往下掉。</span></div></div>";
    return out;
  }
  function renderShare() {
    var v = vault(), body = q("[data-share-body]");
    body.innerHTML = shareHtml(v);
    q("[data-share-title]").textContent = "管理鑰匙 · " + v.name;
    icons();
    requestAnimationFrame(function () { body.querySelectorAll(".vkey__fill").forEach(function (e) { e.style.transform = "scaleX(" + parseFloat(e.getAttribute("data-fill")) + ")"; }); });
  }
  function shareOpen() { var d = q("[data-share-drawer]"); return d.classList.contains("is-open"); }
  function openShare(intent, manage) {
    share.created = null;
    if (intent === "gift" || intent === "nfc") share.intent = intent;
    renderShare();
    var d = q("[data-share-drawer]"); d.classList.add("is-open"); d.setAttribute("aria-hidden", "false");
    if (manage) { var sec = q("[data-share-body] .vshare__section:nth-of-type(2)"); if (sec) sec.scrollIntoView({ block: "start" }); }
  }
  function closeShare() { var d = q("[data-share-drawer]"); d.classList.remove("is-open"); d.setAttribute("aria-hidden", "true"); }

  /* 加條件選單（F2）：每項帶「這條單獨幾人」 */
  var popRoute = -1;
  function openPop(btn, ri) {
    var v = vault(), have = v.routes[ri].map(function (c) { return c.v; });
    popRoute = ri;
    var pop = q("[data-pop]");
    pop.innerHTML = KINDS.map(function (k) {
      return '<div class="lab-pop__g">' + k.n + "</div>" + OPTS[k.t].map(function (o) {
        var n = routeSet([{ v: o.id }]).size;
        return '<button class="lab-pop__i" type="button" data-act="pick-cond" data-v="' + o.id + '"' + (have.indexOf(o.id) >= 0 ? " disabled" : "") + "><span>" + esc(o.n) + '</span><span class="lab-pop__c lab-num">' + fmt(n) + " 人</span></button>";
      }).join("");
    }).join("");
    var r = btn.getBoundingClientRect();
    pop.hidden = false;
    var top = Math.min(window.innerHeight - pop.offsetHeight - 8, r.bottom + 6);
    pop.style.top = Math.max(8, top) + "px";
    pop.style.left = Math.min(window.innerWidth - pop.offsetWidth - 8, r.left) + "px";
  }
  function closePop() { q("[data-pop]").hidden = true; popRoute = -1; }

  /* 上傳（F5）：依檔案型別自動分組 */
  function addFiles(files) {
    var v = vault(), n = 0;
    Array.prototype.forEach.call(files, function (f) {
      var kind = /^image\//.test(f.type) ? "image" : /^video\//.test(f.type) ? "clip" : /^audio\//.test(f.type) ? "audio" : null;
      if (!kind) return;
      n += 1;
      v.items.push({ id: nid("i"), kind: kind, name: f.name.replace(/\.[^.]+$/, ""), img: kind === "image" ? URL.createObjectURL(f) : "", size: (f.size / 1048576).toFixed(1) + " MB", added: "2026/10/29", dur: kind === "image" ? "" : "—", task: null, ever: 0 });
    });
    if (n) { toast("已加入 " + n + " 件"); render(); } else toast("只收照片、影片、音檔", "error");
  }

  /* ── 事件 ─────────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var pop = q("[data-pop]");
    if (!pop.hidden && !pop.contains(e.target) && !e.target.closest('[data-act="add-cond"]')) closePop();
    if (state.menu && !e.target.closest(".lab-head__actions")) { state.menu = false; renderHead(vault()); icons(); }

    var t = e.target.closest("[data-act]");
    if (!t) return;
    if (e.target.closest("[data-stop]") && t.getAttribute("data-act") === "open-item") return;
    var act = t.getAttribute("data-act"), val = t.getAttribute("data-v");
    var v = VAULTS.length ? vault() : null;

    switch (act) {
      case "pick": state.wizard = null; state.vid = val; state.renaming = false; state.menu = false; render(); break;
      case "new-vault": state.wizard = { step: 1, name: "", vid: null }; state.lens = null; state.lensKind = "me"; render(); break;
      case "wiz-next": wizNext(); break;
      case "wiz-go": { var nm0 = q("[data-wiz-name]"); if (nm0 && nm0.value.trim() && state.wizard.vid) vault().name = nm0.value.trim(); state.wizard.step = +val; render(); break; }
      case "wiz-exit": var had = state.wizard && state.wizard.vid; state.wizard = null; render(); if (had) toast("已存成草稿，之後可以從庫房列表打開繼續"); break;
      case "wiz-draft": state.wizard = null; render(); toast("已存成草稿，之後可以從庫房列打開繼續"); break;
      case "rename": state.renaming = true; renderHead(v); icons(); break;
      case "menu": state.menu = !state.menu; renderHead(v); icons(); break;
      case "share": {
        var liveS = isLive(v);
        openModal("分享連結", '<div class="lab-dlg"><div class="linkf' + (liveS ? "" : " linkf--disabled") + '"><div class="linkf__row"><input class="input linkf__input" type="text" readonly value="https://ztor.com/v/' + v.id + '" aria-label="分享連結"' + (liveS ? "" : " disabled") + '><button class="btn btn--outline btn--sm linkf__act linkf__act--copy" type="button" data-act="copy-link"' + (liveS ? "" : " disabled") + ">" + ico("copy") + "<span>複製連結</span></button></div>" +
          '<p class="linkf__hint">' + (liveS ? "連結只帶粉絲到這座庫房，不會讓他進得來——進庫仍要符合條件或持有鑰匙。" : (v.status === "draft" ? "草稿不能分享：粉絲還看不到這座庫房，發布後才能分享。" : "已下架不能分享：粉絲看不到這座庫房，重新上架後才能分享。")) + "</p></div></div>");
        break;
      }
      case "copy-link":
        if (!isLive(v)) return;
        if (navigator.clipboard) navigator.clipboard.writeText("https://ztor.com/v/" + v.id).catch(function () {});
        toast("已複製分享連結"); break;
      case "delete": {
        if (isLive(v)) return;
        var R = reach(v).all, lose = new Set();
        v.items.forEach(function (it) { var now = itemVisible(v, it, R); if (now != null) R.forEach(function (i) { if (!it.task || (it.task.type === "tier" && FANS[i].ti <= it.task.tier) || (it.task.k === "shop" && FANS[i].has[it.task.target])) lose.add(i); }); });
        state.menu = false;
        var neverListed = v.status === "draft" && !v.ever;   /* D477：從沒上架過的草稿沒有人會失去內容，不寫這一條 */
        var lines = neverListed ? [] : ["將有 <b>" + fmt(lose.size) + "</b> 位粉絲失去這些內容（重新上架後會看得到至少一件的人）"];
        confirmDanger("刪除「" + v.name + "」", lines.concat([v.keys.length ? "已發出的 " + v.keys.length + " 把鑰匙一併失效" : "這座庫房沒有發過鑰匙", "刪除後不能復原"]), "刪除庫房", function () {
          VAULTS = VAULTS.filter(function (x) { return x.id !== v.id; });
          if (VAULTS.length) state.vid = VAULTS[0].id;
          closeModal(); render(); toast("已刪除庫房");
        });
        break;
      }
      case "publish": openPublish(false); break;
      case "relist": openPublish(true); break;
      case "unlist":
        confirmDanger("下架「" + v.name + "」", ["粉絲會看不到這座庫房，已解開過的也看不到", "下架期間不會產生新的解開紀錄", v.unlistAt ? "已設的下架時間 " + when(v.unlistAt) + " 會保存並暫停" : "之後可以重新上架，解開紀錄會恢復"], "下架", function () {
          v.status = "unlisted"; v.paused = v.unlistAt ? { unlistAt: v.unlistAt } : null; v.unlistAt = "";
          closeModal(); render(); toast("已下架");
        });
        break;
      case "cancel-sched": v.listAt = ""; render(); toast("已取消排程"); break;
      case "add-route": v.routes.push([]); render(); openPop(document.querySelectorAll('[data-act="add-cond"]')[v.routes.length - 1], v.routes.length - 1); icons(); break;
      case "add-cond": e.stopPropagation(); openPop(t, +t.getAttribute("data-r")); icons(); break;
      case "pick-cond": v.routes[popRoute].push({ v: val }); closePop(); render(); break;
      case "rm-cond": { var rr = +t.getAttribute("data-r"); v.routes[rr].splice(+t.getAttribute("data-c"), 1); if (!v.routes[rr].length && v.routes.length > 1) v.routes.splice(rr, 1); render(); break; }
      case "key": openShare(val, false); break;
      case "open-tab": state.openTab = val; render(); if (state.wizard) renderWizard(); break;
      case "keys-manage": openShare(null, true); break;
      case "share-close": closeShare(); break;
      case "share-intent": share.intent = val; share.created = null; renderShare(); break;
      case "share-create": {
        var nmI = q("#vshare-name"), usI = q("#vshare-uses"), isG = share.intent === "gift";
        var labK = (nmI && nmI.value.trim()) || (isG ? "送給一位粉絲" : "NFC 商品");
        var usesK = isG ? 1 : Math.max(1, parseInt(usI && usI.value, 10) || 1);
        var codeK = Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
        var kk = { id: nid("k"), code: codeK, type: share.intent, label: labK, uses: usesK, claimed: [], revoked: false, born: "2026/11/02" };
        v.keys.push(kk); share.created = kk; renderShare(); render();
        break;
      }
      case "vkey-copy": if (navigator.clipboard) navigator.clipboard.writeText(val).catch(function () {}); toast("已複製連結"); break;
      case "revoke": {
        var k = v.keys.filter(function (x) { return x.id === val; })[0];
        var others = new Set(); v.routes.forEach(function (r) { routeSet(r).forEach(function (i) { others.add(i); }); });
        var lose2 = k.claimed.filter(function (i) { return !others.has(i); }).length;
        confirmDanger("撤銷鑰匙 " + k.code, ["靠這把鑰匙進來的 <b>" + fmt(lose2) + "</b> 位粉絲會立刻失去存取", "發放與領取紀錄會保留"], "撤銷", function () { k.revoked = true; closeModal(); render(); if (shareOpen()) renderShare(); toast("已撤銷鑰匙"); });
        break;
      }
      case "upload": q("[data-file]").click(); break;
      case "demo-files":   /* 只為了 demo 不用真的找檔案 */
        v.items.push({ id: nid("i"), kind: "image", name: "後台合照", img: IMG + "projects/miujie-fungwan.jpg", size: "3.4 MB", added: "2026/10/30", task: null, ever: 0 },
          { id: nid("i"), kind: "clip", name: "彩排片段", img: IMG + "products/nick-realive-cd.jpg", size: "72 MB", added: "2026/10/30", dur: "1:58", task: null, ever: 0 },
          { id: nid("i"), kind: "audio", name: "新歌 Demo（語音備忘）", size: "2.2 MB", added: "2026/10/30", dur: "2:05", task: null, ever: 0 });
        render(); toast("已加入 3 件"); break;
      case "open-item": if (!e.target.closest("[data-stop]")) { openItem(val); } break;
      case "item-close": closeItem(); break;
      case "preview-toggle": togglePreview(q("[data-item-body] [data-preview]")); break;
      case "item-type": {
        var cit = itemById(editId);
        cit.task = val === "none" ? null : val === "tier" ? { type: "tier", tier: Math.min(1, tierFloor(v)) } : newActionTask("follow");
        refreshTask(cit); break;
      }
      case "item-scope": { var sit = itemById(editId); sit.task.scope = val; if (val === "any") delete sit.task.target; else sit.task.target = sit.task.target || OPTS.bought[0].id; refreshTask(sit); break; }
      case "item-grand": { var git = itemById(editId); git.grand = !git.grand; t.classList.toggle("switch--on", git.grand); t.setAttribute("aria-checked", git.grand); render(); break; }
      case "item-del": {
        var it2 = itemById(editId), delId = editId;
        stopPreview(); itemSheet().classList.remove("is-open"); itemSheet().setAttribute("aria-hidden", "true"); editId = null;
        confirmDanger("刪除「" + it2.name + "」", ["粉絲會立刻失去這件內容", it2.ever ? "已有 " + fmt(it2.ever) + " 人解開過" : "還沒有人解開過", "刪除後不能復原"], "刪除", function () {
          v.items = v.items.filter(function (x) { return x.id !== delId; }); closeModal(); render(); toast("已刪除");
        });
        break;
      }
      case "pub-mode": readPub(); pub.mode = val; drawPublish(q("[data-modal-title]").textContent === "重新上架"); break;
      case "pub-unlist": readPub(); pub.unlistOn = !pub.unlistOn; drawPublish(q("[data-modal-title]").textContent === "重新上架"); break;
      case "lens-kind":
        state.lensKind = val;
        if (val === "me") state.lens = null;
        else if (val === "tier") state.lens = { type: "tier", ti: state.lens && state.lens.type === "tier" ? state.lens.ti : 1 };
        else state.lens = null;
        render(); break;
      case "lens-tier": state.lens = { type: "tier", ti: +val }; render(); break;
      case "lens-fan": state.lens = { type: "fan", d: DIRECTORY.filter(function (d) { return d.idx === +val; })[0] }; render(); break;
      case "lens-fan-clear": state.lens = null; render(); break;
      case "lens-reset": state.lens = null; state.lensKind = "me"; render(); break;
      case "modal-close": closeModal(); break;
      case "modal-ok": if (modalOk) modalOk(); break;
    }
  });
  document.addEventListener("input", function (e) {
    if (e.target.matches("[data-rename]")) fitRename(e.target);
    if (e.target.matches("[data-item-n]")) {
      var nit = itemById(editId), nv = parseInt(e.target.value, 10), bad = !(nv >= 1);
      var er = q("[data-item-n-error]"); if (er) er.hidden = !bad;
      if (!bad) nit.task.n = nv;
      return;
    }
    if (e.target.matches("[data-fan-q]")) { q("[data-fan-list]").innerHTML = fanList(e.target.value); }
    if (e.target.matches("[data-pub-ut]")) { pub.unlistAt = e.target.value; }
  });
  document.addEventListener("change", function (e) {
    if (e.target.matches("[data-item-kind]")) { var kit = itemById(editId); kit.task = newActionTask(e.target.value); refreshTask(kit); return; }
    if (e.target.matches("[data-item-target]")) { var tit = itemById(editId); tit.task.target = e.target.value; refreshTask(tit); return; }
    if (e.target.matches("[data-item-tier]")) { var rit = itemById(editId); rit.task.tier = +e.target.value; refreshTask(rit); return; }
    if (e.target.matches("[data-file]")) { addFiles(e.target.files); e.target.value = ""; }
    if (e.target.matches("[data-pub-ut]")) { readPub(); drawPublish(q("[data-modal-title]").textContent === "重新上架"); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("[data-rename]")) {
      if (e.key === "Enter") { var nmv = e.target.value.trim(); if (nmv) vault().name = nmv; state.renaming = false; render(); }
      else if (e.key === "Escape") { state.renaming = false; render(); }
    }
    if (e.target.matches("[data-wiz-name]") && e.key === "Enter") wizNext();
    if (e.target.matches('.lab-mcard--add') && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); q("[data-file]").click(); }
    if (e.key === "Escape" && !q("[data-modal]").hidden) closeModal();
    else if (e.key === "Escape" && editId) closeItem();
    else if (e.key === "Escape" && shareOpen()) closeShare();
  });
  document.addEventListener("focusout", function (e) {
    if (e.target.matches("[data-rename]")) { var nmv = e.target.value.trim(); if (nmv) vault().name = nmv; state.renaming = false; setTimeout(render, 0); }
  });
  /* 拖放 */
  document.addEventListener("dragover", function (e) { var d = e.target.closest("[data-drop]"); if (d) { e.preventDefault(); d.classList.add("lab-drop--over"); } });
  document.addEventListener("dragleave", function (e) { var d = e.target.closest("[data-drop]"); if (d) d.classList.remove("lab-drop--over"); });
  document.addEventListener("drop", function (e) { var d = e.target.closest("[data-drop]"); if (d) { e.preventDefault(); addFiles(e.dataTransfer.files); } });

  render();
})();
