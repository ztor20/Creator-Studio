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
    { k: "follow", n: "追蹤創作者" },
    { k: "join", n: "加入社群" },
    { k: "shareVault", n: "分享庫房頁面給 N 位朋友", param: "n" },
    { k: "sharePost", n: "分享指定貼文給 N 人", param: "n" },
    { k: "invite", n: "邀請 N 位朋友加入社群", param: "n" },
    { k: "watch", n: "看完指定影片" },
    { k: "watchParty", n: "參加過一場 Watch Party" },
    { k: "shop", n: "商城消費・指定商品", ready: true },
    { k: "tip", n: "爆米花打賞累積 N", param: "n" }
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
    filter: "all",        // 庫房列狀態篩選
    taskFilter: "all",    // 內容任務篩選
    sel: {},              // 多選的內容 id
    lens: null,           // null｜{type:"tier",ti}｜{type:"fan",d}
    lensKind: "me",
    menu: false,
    drafting: false,
    renaming: false,
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
    var counts = { all: VAULTS.length, listed: 0, draft: 0, unlisted: 0 };
    VAULTS.forEach(function (v) { counts[v.status] += 1; });
    q("[data-strip-filter]").innerHTML = [["all", "全部"], ["listed", "上架中"], ["draft", "草稿"], ["unlisted", "已下架"]].map(function (f) {
      return '<button class="filter-tabs__item' + (state.filter === f[0] ? " filter-tabs__item--active" : "") + '" type="button" role="tab" data-act="strip-filter" data-v="' + f[0] + '">' + f[1] + ' <span class="filter-tabs__count">' + counts[f[0]] + "</span></button>";
    }).join("");
    q("[data-strip-count]").textContent = state.lens ? "人數＝" + lensName() + "打得開" : "人數＝打得開";

    var html = state.drafting
      ? '<div class="lab-vcard lab-vcard--new"><span class="lab-vcard__cover">' + ico("plus") + '</span><input class="input lab-vcard__input" data-draft placeholder="庫房名稱" aria-label="庫房名稱"></div>'
      : '<button class="lab-vcard lab-vcard--new" type="button" data-act="new-vault"><span class="lab-vcard__cover">' + ico("plus") + '</span><span class="lab-vcard__name">新增庫房</span></button>';
    VAULTS.filter(function (v) { return state.filter === "all" || v.status === state.filter; }).forEach(function (v) {
      var R = reach(v), lr = lensReach(v, R.all), cover = coverOf(v);
      var n = lr ? (lr.n != null ? lr.n : (lr.can ? "進得來" : "進不來")) : R.all.size;
      var st = STATUS[v.status];
      var sched = v.listAt ? ' <span class="lab-note">' + ico("clock", "ztor-icon--xs") + "</span>" : "";
      html += '<button class="lab-vcard' + (v.id === state.vid ? " lab-vcard--active" : "") + (lr && !lr.can ? " lab-vcard--dim" : "") + '" type="button" data-act="pick" data-v="' + v.id + '">' +
        '<span class="lab-vcard__cover" style="' + (cover ? "background-image:url(" + cover + ")" : "") + '">' + (cover ? "" : ico(lr && !lr.can ? "lock" : "archive")) + "</span>" +
        '<span style="min-width:0"><span class="lab-vcard__name" style="display:block">' + esc(v.name) + "</span>" +
        '<span class="lab-vcard__meta"><span><span class="badge ' + st.b + '">' + st.n + "</span>" + sched + "</span>" +
        '<span class="lab-num" title="' + (isLive(v) ? "現在打得開" : "上架後打得開") + '">' + (lr && !lr.can ? ico("lock", "ztor-icon--xs") : ico("users", "ztor-icon--xs")) + " " + (typeof n === "number" ? fmt(n) : n) + (isLive(v) || typeof n !== "number" ? "" : "*") + "</span></span></span></button>";
    });
    q("[data-strip]").innerHTML = html;
    var d = q("[data-draft]");
    if (d) d.focus();
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
    var sub = isLive(v) ? "粉絲現在看得到這座庫房；進不了庫的粉絲看到上鎖與進庫方法。" : v.status === "draft" ? "粉絲還看不到。下面的人數都是上架後的試算。" : "粉絲看不到，已解開過的也看不到；重新上架後解開紀錄會恢復。";

    q("[data-head]").innerHTML =
      '<div style="min-width:0"><div class="lab-head__title">' + name + '<span class="badge ' + st.b + '">' + st.n + "</span>" +
      (sched ? '<span class="lab-note">' + ico("clock", "ztor-icon--xs") + " " + sched + "</span>" : "") + "</div>" +
      '<p class="lab-head__sub">' + sub + "</p></div>" +
      '<div class="lab-head__actions">' + primary +
      '<button class="btn btn--icon btn--outline" type="button" data-act="menu" aria-label="更多動作">' + ico("more-horizontal") + "</button>" +
      (state.menu ? menuHtml(v) : "") + "</div>";
    var ri = q("[data-rename]");
    if (ri) { ri.focus(); ri.select(); }
  }
  function menuHtml(v) {
    var live = isLive(v);
    return '<div class="lab-menu" role="menu">' +
      '<button class="lab-menu__item" type="button" data-act="copy-link"' + (live ? "" : " disabled") + ">" + ico("link") + "複製分享連結</button>" +
      (live ? "" : '<p class="lab-menu__hint">上架中才能分享。</p>') +
      '<button class="lab-menu__item lab-menu__item--danger" type="button" data-act="delete"' + (live ? " disabled" : "") + ">" + ico("trash-2") + "刪除庫房</button>" +
      (live ? '<p class="lab-menu__hint">上架中不能直接刪，要先下架。</p>' : "") + "</div>";
  }
  function renderCheck(v) {
    var el = q("[data-check]");
    if (v.status === "listed" || v.listAt) { el.hidden = true; return; }
    el.hidden = false;
    var path = hasPath(v), items = v.items.length > 0;
    var steps = [
      { c: items ? "done" : "block", t: "放內容", s: items ? v.items.length + " 件" : "至少一件才能發布", go: "sec-content" },
      { c: path ? "done" : "warn", t: "誰開得了", s: path ? "已設 " + v.routes.filter(function (r) { return r.length; }).length + " 種進庫方法" + (v.keys.length ? "、" + v.keys.length + " 把鑰匙" : "") : "還沒設；可以先發布，但沒有人打得開", go: "sec-access" }
    ];
    if (v.status === "unlisted" && v.paused && v.paused.unlistAt) {
      steps.push(past(v.paused.unlistAt)
        ? { c: "block", t: "重新上架", s: "保存的下架時間 " + when(v.paused.unlistAt) + " 已過，重新上架時要先改掉或清除", go: "relist" }
        : { c: "done", t: "重新上架", s: "保存的下架時間 " + when(v.paused.unlistAt) + " 會照舊", go: "relist" });
    } else {
      steps.push({ c: items ? (path ? "done" : "warn") : "todo", t: v.status === "unlisted" ? "重新上架" : "發布", s: items ? "可以" + (v.status === "unlisted" ? "重新上架" : "發布") + "了" : "放了內容就能" + (v.status === "unlisted" ? "重新上架" : "發布"), go: v.status === "unlisted" ? "relist" : "publish" });
    }
    el.innerHTML = steps.map(function (s, i) {
      var mark = s.c === "done" ? ico("check", "ztor-icon--xs") : s.c === "warn" ? "!" : s.c === "block" ? ico("x", "ztor-icon--xs") : (i + 1);
      return '<button class="lab-step lab-step--' + s.c + '" type="button" data-act="step" data-v="' + s.go + '"><span class="lab-step__mark">' + mark + '</span><span><span class="lab-step__t">' + (i + 1) + ". " + s.t + '</span><span class="lab-step__s" style="display:block">' + s.s + "</span></span></button>";
    }).join("");
  }

  /* ── 3a. 第一道門：誰進得來 ──────────────────────── */
  function renderGate1(v, el, bare) {
    el = el || q("[data-gate1]");
    var R = reach(v), live = isLive(v);
    var covRows = TIERS.map(function (t, ti) {
      var n = 0; R.all.forEach(function (i) { if (FANS[i].ti === ti) n += 1; });
      var on = state.lens && state.lens.type === "tier" && state.lens.ti === ti;
      return '<div class="lab-cov__row"' + (on ? ' style="color:var(--foreground)"' : "") + "><span>" + t.n + '</span><span class="lab-cov__track"><span class="lab-cov__fill" style="width:' + (n / t.c * 100) + '%"></span></span><span class="lab-cov__v lab-num">' + fmt(n) + " / " + fmt(t.c) + "</span></div>";
    }).join("");
    var warn = "";
    if (!hasPath(v)) warn = '<div class="alert alert--row alert--warning"><span class="alert__icon">' + ico("alert-triangle") + '</span><div class="alert__body">還沒有路，沒有人進得來。加一種進庫方法，或發一把鑰匙。</div></div>';
    else if (R.all.size === 0) warn = '<div class="alert alert--row alert--info"><span class="alert__icon">' + ico("info") + '</span><div class="alert__body">有路，但目前沒有人符合。條件放寬一點，或另加一種方法。</div></div>';

    var routes = v.routes.map(function (r, ri) {
      var n = routeSet(r).size;
      var chips = r.map(function (c, ci) {
        return (ci ? '<span class="lab-and">且</span>' : "") + '<span class="chip chip--removable">' + esc(condName(c)) + '<button class="chip__remove" type="button" data-act="rm-cond" data-r="' + ri + '" data-c="' + ci + '" aria-label="移除條件">' + ico("x") + "</button></span>";
      }).join("");
      return '<div class="lab-route' + (v.routes.length > 1 ? " lab-route--x" : "") + '">' +
        '<div class="lab-route__head"><span class="lab-route__t">' + (ri ? '<span class="lab-or">或</span>' : "") + '進庫方法 ' + (ri + 1) + '</span><span class="lab-route__n lab-num">' + (r.length ? "單獨 " + fmt(n) + " 人" : "還沒有條件") + "</span></div>" +
        '<div class="lab-route__conds">' + (chips || '<span class="lab-route__empty">空的方法不算任何人達成</span>') + "</div>" +
        (r.length > 1 ? '<span class="lab-note">這些條件要一起達成</span>' : "") +
        '<button class="btn btn--ghost btn--sm" type="button" data-act="add-cond" data-r="' + ri + '" style="justify-self:start">' + ico("plus") + (r.length ? "再加一個條件" : "加條件") + "</button>" +
        (v.routes.length > 1 ? '<button class="btn btn--icon btn--ghost btn--sm lab-route__x" type="button" data-act="rm-route" data-r="' + ri + '" aria-label="移除這種方法">' + ico("x") + "</button>" : "") +
        "</div>";
    }).join("");
    var activeKeys = v.keys.filter(function (k) { return !k.revoked; });
    var keyCard = '<div class="lab-route lab-route--key">' +
      '<div class="lab-route__head"><span class="lab-route__t"><span class="lab-or">或</span>' + ico("key", "ztor-icon--xs") + ' 鑰匙</span><span class="lab-route__n lab-num">已領 ' + fmt(keyHolders(v).size) + " 人</span></div>" +
      '<span class="lab-note">不符合條件、但你想讓他進來的人。進庫後每件的任務照常。' + (live ? "" : "庫房還沒上架：粉絲現在領只會看到「尚未開放」、不扣次數，但你可以先發。") + "</span>" +
      v.keys.map(function (k) {
        return '<div class="lab-keyrow"><span><span class="lab-keyrow__code">' + k.code + "</span> · " + esc(k.label) + '<br><span class="lab-keyrow__m">' + (k.revoked ? "已撤銷" : "已領 " + k.claimed.length + " / " + k.uses) + "</span></span>" +
          (k.revoked ? "" : '<button class="btn btn--ghost btn--sm" type="button" data-act="revoke" data-v="' + k.id + '">撤銷</button>') + "</div>";
      }).join("") +
      '<div style="display:flex;gap:var(--sp-6);flex-wrap:wrap"><button class="btn btn--outline btn--sm" type="button" data-act="key" data-v="gift">' + ico("gift") + '送給一位粉絲</button><button class="btn btn--outline btn--sm" type="button" data-act="key" data-v="nfc">' + ico("scan") + "做成 NFC 商品</button></div></div>";
    var split = (R.key ? "靠進庫方法 " + fmt(R.route) + " · 靠鑰匙 " + fmt(R.key) + " · 重疊 " + fmt(R.overlap) + "（只算一次）" : "全部靠進庫方法") + (activeKeys.length && !R.key ? " · 鑰匙還沒有人領" : "");

    el.innerHTML =
      (bare ? "" : '<div class="lab-gate__head"><div><div class="lab-gate__eyebrow">權限</div><h2 class="lab-gate__title">誰開得了</h2><p class="lab-gate__sub">符合任一種進庫方法、或拿到鑰匙，就能打開這座庫房。打開之後，每件內容的任務照常。</p></div></div>') +
      '<div class="lab-reach"><div><div class="lab-reach__n lab-num">' + fmt(R.all.size) + '</div><div class="lab-reach__l">' + (live ? "現在打得開" : "上架後打得開") + " · 共 " + fmt(TOTAL) + ' 位粉絲</div></div><div class="lab-cov">' + covRows + '</div><div class="lab-split">' + split + "</div></div>" +
      warn +
      '<div class="lab-routes">' + routes + '<button class="lab-route lab-route--add" type="button" data-act="add-route">' + ico("plus") + "<span>新增一種進庫方法</span></button>" + keyCard + "</div>" +
      '<div class="linkf"><label class="field__label">分享連結</label><div class="linkf__row"><input class="input linkf__input" type="text" readonly value="https://ztor.com/v/' + v.id + '" aria-label="分享連結"' + (live ? "" : " disabled") + '><button class="btn btn--outline btn--sm linkf__act" type="button" data-act="copy-link"' + (live ? "" : " disabled") + ">" + ico("copy") + '複製</button></div><p class="field__hint">只帶粉絲到這座庫房的頁面，不給進庫權限，跟鑰匙不同。' + (live ? "" : "上架中才能分享。") + "</p></div>";
  }

  /* ── 3b. 第二道門：進來後看得到哪幾件 ─────────────── */
  var GROUPS = [{ k: "image", n: "圖片" }, { k: "clip", n: "影片" }, { k: "audio", n: "音檔" }];
  function renderGate2(v, el, bare) {
    el = el || q("[data-gate2]");
    var R = reach(v).all, floor = tierFloor(v);
    var nSel = Object.keys(state.sel).length;
    var tf = [["all", "全部"], ["none", "不設任務"], ["action", "行動任務"], ["tier", "等級任務"]];
    var filt = function (it) { return state.taskFilter === "all" || (state.taskFilter === "none" ? !it.task : it.task && it.task.type === state.taskFilter); };
    var head = '<div class="lab-gate__head">' + (bare ? "<span></span>" : '<div><div class="lab-gate__eyebrow">內容</div><h2 class="lab-gate__title">放了哪些內容</h2><p class="lab-gate__sub">每件可以再設一個任務，打開庫房後還要完成才看得到；不設任務的，打得開就看得到。任務之後再設也可以。</p></div>') +
      '<button class="btn btn--primary" type="button" data-act="upload">' + ico("upload") + "上傳內容</button></div>";
    if (!v.items.length) {
      el.innerHTML = head + '<div class="lab-drop" data-act="upload" data-drop>' + ico("upload", "ztor-icon--lg") + "<b>把照片、影片、音檔拖進來</b><span>一次可以放很多件，會自動分到圖片、影片、音檔。粉絲只能線上看，不能下載。</span></div>" +
        '<button class="btn btn--ghost btn--sm" type="button" data-act="demo-files" style="justify-self:start">' + ico("sparkles") + "demo 用：放入 3 件示範內容</button>";
      return;
    }
    var bar = nSel
      ? '<div class="lab-batch"><span class="lab-batch__n">已選 ' + nSel + ' 件</span><button class="btn btn--outline btn--sm" type="button" data-act="batch-task">' + ico("sliders-horizontal") + '設定任務</button><button class="btn btn--outline btn--sm" type="button" data-act="batch-grand">' + ico("star") + '標成大彩蛋</button><button class="btn btn--destructive btn--sm" type="button" data-act="batch-del">' + ico("trash-2") + '刪除</button><button class="btn btn--ghost btn--sm" type="button" data-act="sel-clear">取消選取</button></div>'
      : "";
    var tools = '<div class="lab-toolbar"><nav class="filter-tabs" role="tablist" aria-label="任務">' + tf.map(function (f) {
      var c = v.items.filter(function (it) { return f[0] === "all" || (f[0] === "none" ? !it.task : it.task && it.task.type === f[0]); }).length;
      return '<button class="filter-tabs__item' + (state.taskFilter === f[0] ? " filter-tabs__item--active" : "") + '" type="button" data-act="task-filter" data-v="' + f[0] + '">' + f[1] + ' <span class="filter-tabs__count">' + c + "</span></button>";
    }).join("") + "</nav>" + (state.lens ? '<span class="lab-note">' + ico("eye", "ztor-icon--xs") + " 卡片顯示「" + esc(lensName()) + "」的狀態</span>" : '<span class="lab-note">人數：目前看得到 · 累計解開過</span>') + "</div>";

    var groups = GROUPS.map(function (g) {
      var all = v.items.filter(function (it) { return it.kind === g.k; });
      var list = all.filter(filt);
      var head2 = '<div class="lab-group__head">' + ico(kindIcon(g.k), "ztor-icon--sm") + g.n + ' <span class="lab-note">' + all.length + "</span></div>";
      if (!all.length) return "";   /* 2026-10-30 使用者：只上傳一種，就只列那一種 */
      if (!list.length) return "";
      return '<div class="lab-group">' + head2 + '<div class="lab-mgrid' + (nSel ? " lab-mgrid--selecting" : "") + '">' + list.map(function (it) {
        var sel = !!state.sel[it.id];
        var now = itemVisible(v, it, R), ever = itemEver(v, it, R);
        var low = it.task && it.task.type === "tier" && it.task.tier > floor;
        var pending = it.task && it.task.type === "action" && now == null && it.task.k !== "shop";
        var right;
        if (state.lens) {
          var lr = lensReach(v, R);
          var blocked = state.lens.type === "fan" ? !lr.can : !lr.can;
          var s = blocked ? { s: "lock" } : itemState(it, state.lens);
          right = s.s === "lock" ? '<span class="badge badge--neutral">' + ico("lock", "ztor-icon--xs") + " 庫房上鎖</span>"
            : s.s === "open" ? '<span class="badge badge--success">已解開</span>'
            : s.s === "need" ? '<span class="badge badge--warning">' + esc(s.t) + "</span>"
            : '<span class="badge badge--neutral">未解開 · ' + esc(s.t) + "</span>";
          right = '<div class="lab-mcard__nums">' + right + "</div>";
        } else {
          var noTarget = it.task && it.task.k === "shop" && !it.task.target;
          right = '<div class="lab-mcard__nums">' + (noTarget ? '<span>還沒選指定商品</span>' : pending ? '<span title="這種任務目前沒有逐人資料，判定方式待確認">人數無法計算</span>' : "<b class='lab-num'>" + fmt(now) + "</b>") + ' · <span class="lab-num">' + fmt(ever) + "</span>" + (isLive(v) ? "" : " <span>（上架後）</span>") + "</div>";
        }
        /* 卡片橫排（2026-10-30 使用者：「每件內容用卡片橫的列出」）：上＝縮圖（勾選框、大彩蛋疊在角落），下＝名稱、檔案資訊、任務、人數 */
        return '<div class="lab-mcard' + (sel ? " lab-mcard--sel" : "") + '" data-act="open-item" data-v="' + it.id + '">' +
          '<div class="lab-mcard__thumb" style="' + (it.img ? "background-image:url(" + it.img + ")" : "") + '">' + (it.img ? "" : ico(it.kind === "audio" ? "music" : kindIcon(it.kind), "ztor-icon--lg")) +
          (it.dur ? '<span class="lab-mcard__dur">' + (it.kind === "audio" ? "" : ico("play", "ztor-icon--xs") + " ") + it.dur + "</span>" : "") +
          '<label class="zcheck__control lab-mcard__check" data-stop><input class="zcheck__input" type="checkbox" data-act="sel" data-v="' + it.id + '"' + (sel ? " checked" : "") + ' aria-label="選取 ' + esc(it.name) + '"><span class="zcheck__box"></span></label>' +
          (it.grand ? '<span class="badge badge--orange lab-mcard__grand">' + ico("star", "ztor-icon--xs") + " 大彩蛋</span>" : "") + "</div>" +
          '<div class="lab-mcard__body"><div class="lab-mcard__name">' + esc(it.name) + "</div>" +
          '<div class="lab-mcard__meta">' + it.size + " · " + it.added + "</div>" +
          '<button class="lab-taskpill' + (low ? " lab-taskpill--warn" : "") + '" type="button" data-act="open-item" data-v="' + it.id + '" title="' + (low ? "低於目前進庫方法的分級下限（處理方式待產品確認）" : "改任務") + '">' + ico(it.task ? (it.task.type === "tier" ? "award" : "check-circle") : "circle", "ztor-icon--xs") + '<span class="lab-taskpill__t">' + esc(taskLabel(it.task)) + (pending ? " · 判定方式待確認" : "") + (low ? " · 低於下限" : "") + "</span></button>" +
          right + "</div></div>";
      }).join("") + "</div></div>";
    }).join("");
    el.innerHTML = head + tools + bar + '<div style="display:grid;gap:var(--sp-4)">' + groups + "</div>" +
      '<div class="lab-drop" data-act="upload" data-drop style="padding:var(--sp-12)">' + ico("upload") + "<span>拖檔案到這裡繼續加</span></div>";
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
  /* 成效放在最上面（2026-10-30 使用者：「成效可以放在上面」）：整座庫房的三個數字只住這裡。
     內容摘要不放；鑰匙使用情況留在「誰開得了」的鑰匙卡（同日使用者指示）。
     每件內容的兩個數字在各自的卡片上，不再另開一個分頁重列一次。 */
  function renderStats(v) {
    var R = reach(v), lr = lensReach(v, R.all), live = isLive(v), lensOn = !!state.lens;
    var now = vaultNow(v, R.all);
    var n1 = lensOn ? (state.lens.type === "tier" ? fmt(lr.n) + '<span class="lab-stat__of"> / ' + fmt(lr.of) + "</span>" : (lr.can ? "進得來" : "進不來")) : fmt(R.all.size);
    var tile = function (val, label, sub) { return '<div class="lab-stat"><div class="lab-stat__v lab-num">' + val + '</div><div class="lab-stat__l">' + label + "</div>" + (sub ? '<div class="lab-stat__s">' + sub + "</div>" : "") + "</div>"; };
    q("[data-stats]").innerHTML =
      '<div class="lab-stats__head"><h3 class="card__title">成效</h3>' + (live ? "" : '<span class="badge badge--neutral">尚未上架・以下是上架後的試算</span>') + "</div>" +
      '<div class="lab-stats">' +
      tile(n1, lensOn ? (state.lens.type === "tier" ? TIERS[state.lens.ti].n + "打得開" : esc(state.lens.d.name)) : (live ? "現在打得開" : "上架後打得開"), "共 " + fmt(TOTAL) + " 位粉絲") +
      tile(fmt(v.ever), "累計解開過", "只增不減") +
      tile(fmt(now), live ? "目前看得到" : "上架後看得到", "至少一件") +
      "</div>" +
      '<p class="lab-note">觀看次數與熱門內容還沒有規格（§8.31 第 18 項），解開人數不等於觀看次數。</p>';
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
        VAULTS.unshift(nv); state.vid = nv.id; w.vid = nv.id; state.filter = "all";
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
    renderCheck(v);
    renderStats(v); renderGate2(v); renderGate1(v);
    renderSide(v);
    icons();
  }
  function icons() { if (window.ztorIcons) window.ztorIcons.applyIcons(document.getElementById("lab")); if (window.ztorIcons) window.ztorIcons.applyIcons(q("[data-modal]")); if (window.ztorIcons) window.ztorIcons.applyIcons(q("[data-pop]")); }

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
  function taskEditor(task, v, batch) {
    var type = task ? task.type : "none", floor = tierFloor(v);
    var opts = [["none", "不設任務", "進得來就看得到"], ["action", "行動任務", batch ? "帶參數，請逐件設定" : "粉絲做完一件事就解開"], ["tier", "等級任務", "分級達到就解開"]];
    var seg = '<div class="segmented radio-cards" role="radiogroup" aria-label="任務">' + opts.map(function (o) {
      var dis = batch && o[0] === "action";
      return '<button class="segmented__btn' + (type === o[0] ? " segmented__btn--active" : "") + '" type="button" role="radio" aria-checked="' + (type === o[0]) + '" data-act="task-type" data-v="' + o[0] + '"' + (dis ? " disabled" : "") + '><span class="radio-card__text"><span class="radio-card__title">' + o[1] + '</span><span class="radio-card__sub">' + o[2] + "</span></span></button>";
    }).join("") + "</div>";
    var detail = "";
    if (type === "tier") {
      var cur = task && task.tier != null ? task.tier : Math.min(1, floor);
      detail = '<div class="field"><span class="field__label">分級達到</span><div class="lab-tiers">' + TIERS.map(function (t, ti) {
        var dis = ti > floor;
        return '<button class="chip' + (cur === ti ? " chip--active" : "") + '" type="button" data-act="task-tier" data-v="' + ti + '"' + (dis ? " disabled" : "") + ">" + t.n + (ti ? "以上" : "") + "</button>";
      }).join("") + '</div><p class="field__hint">' + (floor < 3 ? "進庫方法都要求分級，所以最低只能選到" + TIERS[floor].n + "。" : "四級都能選。") + "</p></div>";
    } else if (type === "action") {
      var k = task && task.k || "follow";
      detail = '<div class="field"><span class="field__label">要做的事</span><div class="radio-list">' + ACTIONS.map(function (a) {
        return '<button class="radio-list__item' + (a.k === k ? " radio-list__item--active" : "") + '" type="button" role="radio" aria-checked="' + (a.k === k) + '" data-act="task-kind" data-v="' + a.k + '"><span class="radio-list__dot"></span><span class="radio-list__text"><span class="radio-list__title">' + a.n + '</span><span class="radio-list__sub">' + (a.ready ? "看得出誰完成" : "判定方式待確認，人數無法計算") + "</span></span></button>";
      }).join("") + "</div></div>";
      var a2 = actionOf(k);
      if (a2.param === "n") detail += '<div class="field"><label class="field__label" for="lab-n">N</label><input class="input" id="lab-n" type="number" min="1" value="' + (task && task.n || 3) + '" data-task-n style="max-width:8rem"><p class="field__hint">可填範圍待確認。</p></div>';
      if (k === "shop") detail += '<div class="field"><span class="field__label">指定商品</span><div class="lab-tiers">' + OPTS.bought.map(function (o) {
        return '<button class="chip' + (task && task.target === o.id ? " chip--active" : "") + '" type="button" data-act="task-target" data-v="' + o.id + '">' + o.n + "</button>";
      }).join("") + "</div></div>";
    }
    return seg + detail;
  }

  var draftTask = null, editId = null;
  function openItem(id) {
    var v = vault(), it = v.items.filter(function (x) { return x.id === id; })[0];
    if (!it) return;
    editId = id;
    draftTask = it.task ? JSON.parse(JSON.stringify(it.task)) : null;
    drawItem();
  }
  function drawItem() {
    var v = vault(), it = v.items.filter(function (x) { return x.id === editId; })[0];
    var R = reach(v).all;
    var tmp = { task: draftTask, ever: it.ever };
    var now = itemVisible(v, tmp, R);
    var pv = it.img ? '<div class="lab-dlg__pv" style="background-image:url(' + it.img + ')"></div>' : '<div class="lab-dlg__pv">' + ico(it.kind === "audio" ? "music" : "film", "ztor-icon--lg") + '<span class="lab-note">' + (it.dur || "") + " · 預覽播放</span></div>";
    openModal("內容設定",
      '<div class="lab-dlg">' + pv +
      '<div class="field"><label class="field__label" for="lab-iname">名稱</label><input class="input" id="lab-iname" value="' + esc(it.name) + '" data-iname></div>' +
      '<div class="lab-dlg__facts"><span>' + it.size + "</span>" + (it.dur ? "<span>" + it.dur + "</span>" : "") + "<span>加入 " + it.added + "</span><span>粉絲只能線上看，不能下載</span></div>" +
      '<div class="field"><span class="field__label">任務</span>' + taskEditor(draftTask, v, false) + "</div>" +
      '<div class="lab-dlg__facts"><span>目前看得到 <b class="lab-num">' + (now == null ? "無法計算" : fmt(now)) + '</b></span><span>累計解開過 <b class="lab-num">' + fmt(itemEver(v, it, R)) + "</b></span>" + (it.ever ? "<span>改任務後，已解開的人照樣看得到</span>" : "") + "</div>" +
      '<div class="control-row" style="display:flex;justify-content:space-between;align-items:center"><span>大彩蛋<br><span class="lab-note">只是標記，不影響誰看得到</span></span><button class="switch' + (it.grand ? " switch--on" : "") + '" type="button" role="switch" aria-checked="' + !!it.grand + '" data-act="grand" aria-label="大彩蛋"></button></div>' +
      '<div class="lab-dlg__foot"><button class="btn btn--ghost" type="button" data-act="item-del" style="color:var(--destructive-ink)">' + ico("trash-2") + '刪除這件</button><div class="lab-dlg__btns"><button class="btn btn--ghost" type="button" data-act="modal-close">取消</button><button class="btn btn--primary" type="button" data-act="modal-ok">儲存</button></div></div></div>',
      function () {
        var nm = q("[data-iname]");
        if (nm && nm.value.trim()) it.name = nm.value.trim();
        readN();
        it.task = draftTask;
        closeModal();
        render();
        toast("已儲存「" + it.name + "」");
      });
  }
  function readN() { var n = q("[data-task-n]"); if (n && draftTask && draftTask.type === "action") draftTask.n = Math.max(1, parseInt(n.value, 10) || 1); }
  function redrawTask(batch) { readN(); if (batch) drawBatch(); else { var nm = q("[data-iname]"); var keep = nm ? nm.value : null; drawItem(); if (keep != null) q("[data-iname]").value = keep; } }

  var batchMode = false;
  function drawBatch() {
    var v = vault(), ids = Object.keys(state.sel);
    var touched = v.items.filter(function (it) { return state.sel[it.id] && (it.ever || 0) > 0; });
    openModal("幫 " + ids.length + " 件設定任務",
      '<div class="lab-dlg"><p class="lab-note">每件仍只會有一個任務，會取代原本的設定。</p>' + taskEditor(draftTask, v, true) +
      (touched.length ? '<div class="alert alert--row alert--info"><span class="alert__icon">' + ico("info") + '</span><div class="alert__body">' + touched.map(function (it) { return "「" + esc(it.name) + "」"; }).join("") + " 已有人解開過，他們會照樣看得到。</div></div>" : "") +
      foot("套用到 " + ids.length + " 件") + "</div>",
      function () {
        v.items.forEach(function (it) { if (state.sel[it.id]) it.task = draftTask ? JSON.parse(JSON.stringify(draftTask)) : null; });
        state.sel = {};
        closeModal(); render();
        toast("已設定 " + ids.length + " 件的任務");
      });
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
  function openKey(type) {
    var v = vault();
    openModal(type === "gift" ? "送給一位粉絲" : "做成 NFC 商品",
      '<div class="lab-dlg"><div class="field"><label class="field__label" for="lab-kl">名稱</label><input class="input" id="lab-kl" data-kl placeholder="' + (type === "gift" ? "例如：送給攝影師阿哲" : "例如：巡迴鑰匙圈") + '"><p class="field__hint">只有你看得到，用來分辨每一把。</p></div>' +
      (type === "nfc" ? '<div class="field"><label class="field__label" for="lab-ku">可用次數</label><input class="input" id="lab-ku" data-ku type="number" min="1" value="300" style="max-width:8rem"><p class="field__hint">一批 NFC 商品的數量；領走才算人數。</p></div>' : '<p class="lab-note">只能用一次，第一個用掉的人進得來。</p>') +
      (isLive(v) ? "" : '<div class="alert alert--row alert--info"><span class="alert__icon">' + ico("info") + '</span><div class="alert__body">庫房還沒上架，粉絲現在領只會看到「尚未開放」，不扣次數。</div></div>') +
      foot("產生鑰匙") + "</div>",
      function () {
        var lab = (q("[data-kl]").value || "").trim() || (type === "gift" ? "送給一位粉絲" : "NFC 商品");
        var uses = type === "nfc" ? Math.max(1, parseInt(q("[data-ku]").value, 10) || 1) : 1;
        var code = Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
        v.keys.push({ id: nid("k"), code: code, type: type, label: lab, uses: uses, claimed: [], revoked: false, born: "2026/10/29" });
        closeModal(); render();
        toast(type === "gift" ? "鑰匙 " + code + " 已產生，連結已複製" : "鑰匙 " + code + " 已產生，下一步到電子商店建立這件商品");
      });
  }

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
      case "strip-filter": state.filter = val; renderStrip(); icons(); break;
      case "pick": state.wizard = null; state.vid = val; state.sel = {}; state.renaming = false; state.menu = false; render(); break;
      case "new-vault": state.wizard = { step: 1, name: "", vid: null }; state.sel = {}; state.lens = null; state.lensKind = "me"; state.taskFilter = "all"; render(); break;
      case "wiz-next": wizNext(); break;
      case "wiz-go": { var nm0 = q("[data-wiz-name]"); if (nm0 && nm0.value.trim() && state.wizard.vid) vault().name = nm0.value.trim(); state.wizard.step = +val; render(); break; }
      case "wiz-exit": var had = state.wizard && state.wizard.vid; state.wizard = null; render(); if (had) toast("已存成草稿，之後可以從庫房列表打開繼續"); break;
      case "wiz-draft": state.wizard = null; render(); toast("已存成草稿，之後可以從庫房列打開繼續"); break;
      case "rename": state.renaming = true; renderHead(v); icons(); break;
      case "menu": state.menu = !state.menu; renderHead(v); icons(); break;
      case "copy-link":
        if (!isLive(v)) return;
        if (navigator.clipboard) navigator.clipboard.writeText("https://ztor.com/v/" + v.id).catch(function () {});
        state.menu = false; render(); toast("已複製分享連結"); break;
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
      case "step":
        if (val === "publish") openPublish(false);
        else if (val === "relist") openPublish(true);
        else { render(); var el = document.getElementById(val); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }
        break;
      case "add-route": v.routes.push([]); render(); openPop(document.querySelectorAll('[data-act="add-cond"]')[v.routes.length - 1], v.routes.length - 1); icons(); break;
      case "rm-route": v.routes.splice(+t.getAttribute("data-r"), 1); render(); toast("已移除一種進庫方法"); break;
      case "add-cond": e.stopPropagation(); openPop(t, +t.getAttribute("data-r")); icons(); break;
      case "pick-cond": v.routes[popRoute].push({ v: val }); closePop(); render(); break;
      case "rm-cond": v.routes[+t.getAttribute("data-r")].splice(+t.getAttribute("data-c"), 1); render(); break;
      case "key": openKey(val); break;
      case "revoke": {
        var k = v.keys.filter(function (x) { return x.id === val; })[0];
        var others = new Set(); v.routes.forEach(function (r) { routeSet(r).forEach(function (i) { others.add(i); }); });
        var lose2 = k.claimed.filter(function (i) { return !others.has(i); }).length;
        confirmDanger("撤銷鑰匙 " + k.code, ["靠這把鑰匙進來的 <b>" + fmt(lose2) + "</b> 位粉絲會立刻失去存取", "發放與領取紀錄會保留"], "撤銷", function () { k.revoked = true; closeModal(); render(); toast("已撤銷鑰匙"); });
        break;
      }
      case "upload": q("[data-file]").click(); break;
      case "demo-files":   /* 只為了 demo 不用真的找檔案 */
        v.items.push({ id: nid("i"), kind: "image", name: "後台合照", img: IMG + "projects/miujie-fungwan.jpg", size: "3.4 MB", added: "2026/10/30", task: null, ever: 0 },
          { id: nid("i"), kind: "clip", name: "彩排片段", img: IMG + "products/nick-realive-cd.jpg", size: "72 MB", added: "2026/10/30", dur: "1:58", task: null, ever: 0 },
          { id: nid("i"), kind: "audio", name: "新歌 Demo（語音備忘）", size: "2.2 MB", added: "2026/10/30", dur: "2:05", task: null, ever: 0 });
        render(); toast("已加入 3 件"); break;
      case "task-filter": state.taskFilter = val; render(); break;
      case "sel": {
        if (t.checked) state.sel[val] = true; else delete state.sel[val];
        render(); break;
      }
      case "sel-clear": state.sel = {}; render(); break;
      case "open-item": if (!e.target.closest("[data-stop]")) { batchMode = false; openItem(val); } break;
      case "batch-task": batchMode = true; draftTask = null; drawBatch(); break;
      case "batch-grand": v.items.forEach(function (it) { if (state.sel[it.id]) it.grand = true; }); var nn = Object.keys(state.sel).length; state.sel = {}; render(); toast("已把 " + nn + " 件標成大彩蛋"); break;
      case "batch-del": {
        var ids = Object.keys(state.sel), had = v.items.filter(function (it) { return state.sel[it.id] && (it.ever || 0) > 0; });
        confirmDanger("刪除 " + ids.length + " 件內容", ["粉絲會立刻失去這 " + ids.length + " 件內容", had.length ? had.length + " 件已有人解開過：" + had.map(function (it) { return "「" + esc(it.name) + "」"; }).join("") : "這些內容還沒有人解開過", "刪除後不能復原"], "刪除 " + ids.length + " 件", function () {
          v.items = v.items.filter(function (it) { return !state.sel[it.id]; }); state.sel = {}; closeModal(); render(); toast("已刪除 " + ids.length + " 件");
        });
        break;
      }
      case "item-del": {
        var it2 = v.items.filter(function (x) { return x.id === editId; })[0];
        confirmDanger("刪除「" + it2.name + "」", ["粉絲會立刻失去這件內容", it2.ever ? "已有 " + fmt(it2.ever) + " 人解開過" : "還沒有人解開過", "刪除後不能復原"], "刪除", function () {
          v.items = v.items.filter(function (x) { return x.id !== editId; }); closeModal(); render(); toast("已刪除");
        });
        break;
      }
      case "task-type":
        if (val === "none") draftTask = null;
        else if (val === "tier") draftTask = { type: "tier", tier: Math.min(1, tierFloor(v)) };
        else draftTask = { type: "action", k: "follow" };
        redrawTask(batchMode); break;
      case "task-tier": draftTask.tier = +val; redrawTask(batchMode); break;
      case "task-kind": draftTask = { type: "action", k: val, n: actionOf(val).param ? 3 : undefined }; redrawTask(batchMode); break;
      case "task-target": draftTask.target = val; redrawTask(batchMode); break;
      case "grand": {
        var it3 = v.items.filter(function (x) { return x.id === editId; })[0];
        it3.grand = !it3.grand; t.classList.toggle("switch--on", it3.grand); t.setAttribute("aria-checked", it3.grand); render(); break;
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
    if (e.target.matches("[data-fan-q]")) { q("[data-fan-list]").innerHTML = fanList(e.target.value); }
    if (e.target.matches("[data-pub-ut]")) { pub.unlistAt = e.target.value; }
  });
  document.addEventListener("change", function (e) {
    if (e.target.matches("[data-file]")) { addFiles(e.target.files); e.target.value = ""; }
    if (e.target.matches("[data-pub-ut]")) { readPub(); drawPublish(q("[data-modal-title]").textContent === "重新上架"); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.target.matches("[data-draft]")) {
      if (e.key === "Enter" && e.target.value.trim()) {
        var nv = { id: nid("v"), name: e.target.value.trim(), note: "", status: "draft", unlistAt: "", paused: null, ever: 0, routes: [[]], keys: [], items: [] };
        VAULTS.unshift(nv); state.vid = nv.id; state.drafting = false; state.filter = "all"; state.sel = {}; render();
        toast("庫房已建立，接著決定誰進得來");
      } else if (e.key === "Escape") { state.drafting = false; renderStrip(); icons(); }
    }
    if (e.target.matches("[data-rename]")) {
      if (e.key === "Enter") { var nmv = e.target.value.trim(); if (nmv) vault().name = nmv; state.renaming = false; render(); }
      else if (e.key === "Escape") { state.renaming = false; render(); }
    }
    if (e.target.matches("[data-wiz-name]") && e.key === "Enter") wizNext();
    if (e.key === "Escape" && !q("[data-modal]").hidden) closeModal();
  });
  document.addEventListener("focusout", function (e) {
    if (e.target.matches("[data-draft]")) { setTimeout(function () { if (state.drafting) { state.drafting = false; renderStrip(); icons(); } }, 120); }
    if (e.target.matches("[data-rename]")) { var nmv = e.target.value.trim(); if (nmv) vault().name = nmv; state.renaming = false; setTimeout(render, 0); }
  });
  /* 拖放 */
  document.addEventListener("dragover", function (e) { var d = e.target.closest("[data-drop]"); if (d) { e.preventDefault(); d.classList.add("lab-drop--over"); } });
  document.addEventListener("dragleave", function (e) { var d = e.target.closest("[data-drop]"); if (d) d.classList.remove("lab-drop--over"); });
  document.addEventListener("drop", function (e) { var d = e.target.closest("[data-drop]"); if (d) { e.preventDefault(); addFiles(e.dataTransfer.files); } });

  render();
})();
