/* vault-store.js — Media Vault 的示範資料源與「誰進得來」的計算。
   ============================================================
   為什麼需要這支：
     Media Vault 的每一座庫房都掛著一組解鎖條件（符合任一即可進入），
     而創作者在畫面上唯一真正在乎的數字是「現在有幾個粉絲打得開」。那個
     數字不能用猜的——條件之間會重疊（買過黑膠的人多半也是核心圈），把
     「212 人買過」加上「154 人是核心圈」得到 366 是錯的，而隨手抓一個
     去重係數，等於把兩個猜測相乘後當成事實呈現（同 brand-campaigns.js
     拒絕虛構平均客單價的理由）。

     所以本檔不存「人數」，存「人」：以固定種子生成 1,283 筆粉絲紀錄，
     每筆帶 tier／買過什麼／支持過什麼／出席過什麼／拿到什麼成就，聯集
     由真正的集合運算算出來。同一顆種子每次載入結果完全相同，數字不會
     在兩次重整之間漂移。

   數字的出處（刻意對齊既有頁面，不另立一份）：
     · tier 人數 154 / 359 / 475 / 295 ＝ i18n `fans.tier.*-cnt`（fans-crm）。
     · 限量商品的擁有者數＝ products-store 的 sold（acetate 限量 50、已售 21，
       所以「買過手編號黑膠」這條規則的天花板就是 21 人，不是兩百人）。
     · 活動出席者數＝ events-store 各票種 sold 的總和。
     這些上限是硬的：規則的觸及人數不可能超過該商品／該場次真正賣出的數量。

   ⚠ 原型 mock：粉絲個體是生成的，不是真人紀錄（見 ASSUMPTIONS.md）。
     上面那些「總量」則對齊站內既有資料，不是隨手寫的。
   ============================================================ */
(function () {
  "use strict";

  function isZh() { return document.documentElement.lang === "zh-Hant"; }
  function t(o) { return isZh() ? o.zh : o.en; }

  /* ── 固定種子亂數（LCG）─────────────────────────────────────
     不用 Math.random：畫面上的人數若每次重整都不同，創作者無法判斷
     「數字變了」是因為我剛剛改了規則，還是因為它本來就會變。 */
  function rng(seed) {
    var s = seed >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  /* ── 分級階梯（最高在前）──────────────────────────────────
     順序即階梯，tier 規則是「≥ 此級」，所以這個順序是權威的。
     名稱不在此複製，一律引用 tier-settings.tier.* 的 i18n key。 */
  var TIERS = [
    { key: "inner",   i18n: "tier-settings.tier.inner",    count: 154 },
    { key: "super",   i18n: "tier-settings.tier.superfan", count: 359 },
    { key: "devoted", i18n: "tier-settings.tier.devoted",  count: 475 },
    { key: "fan",     i18n: "tier-settings.tier.fan",      count: 295 }
  ];
  var TIER_RANK = {}; TIERS.forEach(function (x, i) { TIER_RANK[x.key] = TIERS.length - i; });
  var TOTAL_FANS = TIERS.reduce(function (a, x) { return a + x.count; }, 0);   /* 1,283 */

  /* ── 規則可選項 ────────────────────────────────────────────
     cap ＝ 該條件在現實中的人數上限（限量售出／票券售出）。有 cap 的
     條件用「取前 N 名」指派，沒有 cap 的用機率指派；兩者的權重都偏向
     高分級——會買限量黑膠、會飛去簽名會的人本來就集中在上面幾級。 */
  var CATALOGUE = {
    bought: {
      icon: "shopping-bag",
      label: { en: "Bought", zh: "購買過" },
      opts: [
        { id: "acetate", cap: 21,  w: [1.0, 0.45, 0.12, 0.03], label: { en: "Coastline acetate · numbered 1/50", zh: "Coastline 手編號黑膠 1/50" } },
        { id: "album",   rate: [0.86, 0.58, 0.24, 0.07],       label: { en: "Coastline EP — digital download",   zh: "Coastline EP 數位下載" } },
        { id: "hoodie",  rate: [0.54, 0.29, 0.09, 0.02],       label: { en: "Coastline hoodie",                  zh: "Coastline 連帽衫" } },
        { id: "movie",   rate: [0.71, 0.38, 0.14, 0.04],       label: { en: "Tour documentary",                  zh: "巡迴紀錄片" } }
      ]
    },
    backed: {
      icon: "rocket",
      label: { en: "Backed", zh: "支持過" },
      opts: [
        { id: "shamshuipo-moonlight", rate: [0.63, 0.31, 0.11, 0.03], label: { en: "Moonlight Over Sham Shui Po", zh: "深水埗的月光" } },
        { id: "dragon-tiger-gate",    rate: [0.48, 0.22, 0.07, 0.02], label: { en: "Dragon Tiger Gate: Kowloon After Dark", zh: "龍虎門外傳：九龍夜行" } },
        { id: "pirate-queen",         rate: [0.41, 0.19, 0.06, 0.01], label: { en: "Ching Shih: Pirate Queen",    zh: "海上霸姬鄭一嫂" } }
      ]
    },
    attended: {
      icon: "ticket",
      label: { en: "Attended", zh: "出席過" },
      opts: [
        { id: "inner-circle-taipei",  cap: 200, w: [1.0, 0.35, 0.05, 0.01], label: { en: "Inner Circle Fan Meet — Taipei", zh: "Inner Circle 見面會 · 台北" } },
        { id: "album-signing-taipei", cap: 118, w: [0.9, 0.55, 0.14, 0.03], label: { en: "Album signing — Taipei",         zh: "專輯簽名會 · 台北" } },
        { id: "realive-chongqing",    cap: 84,  w: [0.6, 0.44, 0.20, 0.06], label: { en: "REALIVE World Tour — Chongqing", zh: "REALIVE 世界巡迴 · 重慶" } }
      ]
    },
    earned: {
      icon: "award",
      label: { en: "Earned", zh: "達成過" },
      opts: [
        { id: "hof",      cap: 24, w: [1.0, 0.30, 0.04, 0.00], label: { en: "Hall of Fame",                zh: "名人堂" } },
        { id: "score800", rate: [0.74, 0.26, 0.04, 0.00],      label: { en: "Ztor Score 800+",             zh: "Ztor Score 800 以上" } },
        { id: "streak12", rate: [0.58, 0.34, 0.13, 0.02],      label: { en: "12 months unbroken support",  zh: "連續 12 個月支持" } }
      ]
    }
  };

  /* ── 生成粉絲母體 ──────────────────────────────────────────
     一次建好，之後所有觸及人數都是對這個陣列做集合運算。 */
  var FANS = (function build() {
    var r = rng(20260729);
    var list = [];
    TIERS.forEach(function (tier, ti) {
      for (var i = 0; i < tier.count; i++) {
        list.push({ tier: tier.key, ti: ti, bought: {}, backed: {}, attended: {}, earned: {}, k: r() });
      }
    });

    Object.keys(CATALOGUE).forEach(function (kind) {
      CATALOGUE[kind].opts.forEach(function (opt) {
        if (opt.cap != null) {
          /* 有上限：依「分級權重 × 亂數」排序取前 cap 名。這樣人數
             精確等於現實售出量，而分佈仍偏向高分級。 */
          var scored = list.map(function (f) { return { f: f, s: opt.w[f.ti] * r() }; });
          scored.sort(function (a, b) { return b.s - a.s; });
          for (var i = 0; i < opt.cap && i < scored.length; i++) scored[i].f[kind][opt.id] = 1;
        } else {
          list.forEach(function (f) { if (r() < opt.rate[f.ti]) f[kind][opt.id] = 1; });
        }
      });
    });
    return list;
  })();

  /* ── 規則比對與觸及計算 ────────────────────────────────────
     rules ＝ [{ t:'tier'|'bought'|'backed'|'attended'|'earned', v:<id> }]
     語意固定為「符合任一」(any-of)，所以觸及＝聯集，用 .some()。 */
  function matches(rule, fan) {
    if (rule.t === "tier") return TIER_RANK[fan.tier] >= TIER_RANK[rule.v];
    var bag = fan[rule.t];
    return !!(bag && bag[rule.v]);
  }
  function reach(rules) {
    if (!rules || !rules.length) return 0;
    var n = 0;
    for (var i = 0; i < FANS.length; i++) {
      for (var j = 0; j < rules.length; j++) {
        if (matches(rules[j], FANS[i])) { n++; break; }
      }
    }
    return n;
  }
  /* 單一分級的觸及——「以粉絲身分檢視」用的判定。
     問的是「這一級裡有幾個人打得開」，不是「這一級打不打得開」：
     除了分級以外的條件（買過、支持過、出席過）在任何一級都可能只有
     部分人符合，所以布林值會說謊，人數不會。 */
  function reachInTier(rules, tierKey) {
    var n = 0;
    for (var i = 0; i < FANS.length; i++) {
      if (FANS[i].tier !== tierKey) continue;
      for (var j = 0; j < (rules || []).length; j++) {
        if (matches(rules[j], FANS[i])) { n++; break; }
      }
    }
    return n;
  }

  function ruleLabel(rule) {
    if (rule.t === "tier") {
      var tier = TIERS.filter(function (x) { return x.key === rule.v; })[0];
      return { verb: { en: "Tier", zh: "分級" }, i18n: tier && tier.i18n, prefix: "≥", icon: "chart-column" };
    }
    var grp = CATALOGUE[rule.t];
    var opt = grp && grp.opts.filter(function (o) { return o.id === rule.v; })[0];
    return { verb: grp.label, text: opt && opt.label, icon: grp.icon };
  }
  function ruleText(rule) {
    var l = ruleLabel(rule);
    if (rule.t === "tier") {
      var el = document.querySelector('[data-tier-name="' + rule.v + '"]');
      var name = el ? el.textContent.trim() : rule.v;
      return t(l.verb) + " ≥ " + name;
    }
    return t(l.verb) + " · " + t(l.text);
  }

  /* ── 庫房與內容 ──────────────────────────────────────────
     kind: image | clip | audio（一座庫房可混放，2026-07-29 使用者裁示）。
     img  ＝ 真實檔案路徑；clip 用同一張圖當影格，audio 不吃圖。
     dur  ＝ 時長（clip/audio）；size ＝ 檔案大小字串。 */
  var VAULTS = [
    {
      id: "demos", icon: "disc-3",
      name: { en: "Unreleased demos & stems", zh: "未發行 Demo 與分軌" },
      note: { en: "Rough mixes and separated stems. Not licensed for redistribution.", zh: "粗混與分軌檔。未授權再散布。" },
      rules: [{ t: "tier", v: "super" }, { t: "bought", v: "acetate" }],
      items: [
        { id: "d1", kind: "audio", name: { en: "Tidewater — rough mix v4", zh: "Tidewater 粗混 v4" }, dur: "4:12", size: "9.8 MB", added: "2026/07/22" },
        { id: "d2", kind: "audio", name: { en: "Undertow — drum stem", zh: "Undertow 鼓組分軌" }, dur: "5:03", size: "12.1 MB", added: "2026/07/22" },
        { id: "d3", kind: "audio", name: { en: "Harbor Lights — demo (voice memo)", zh: "Harbor Lights Demo（語音備忘）" }, dur: "1:47", size: "3.4 MB", added: "2026/07/18" },
        { id: "d4", kind: "image", name: { en: "Mastering room whiteboard", zh: "母帶室白板" }, img: "images/products/coastline-acetate.webp", size: "2.6 MB", added: "2026/07/16" },
        { id: "d5", kind: "image", name: { en: "EP cover — rejected direction", zh: "EP 封面 未採用版" }, img: "images/products/coastline-ep.webp", size: "3.1 MB", added: "2026/07/11" }
      ]
    },
    {
      id: "backstage", icon: "camera",
      name: { en: "East-coast tour · backstage", zh: "東岸巡迴 · 幕後" },
      note: { en: "Everything that did not make the documentary.", zh: "沒有進紀錄片的那些。" },
      rules: [{ t: "tier", v: "devoted" }],
      items: [
        { id: "b1", kind: "clip",  name: { en: "Soundcheck — full take", zh: "彩排 全片段" }, img: "images/projects/nick-lrh-tour.jpg", dur: "12:40", size: "840 MB", added: "2026/07/25" },
        { id: "b2", kind: "image", name: { en: "Stage-worn jacket, night 6", zh: "第六場 演出服" }, img: "images/products/stage-worn-jacket.webp", size: "4.2 MB", added: "2026/07/24" },
        { id: "b3", kind: "image", name: { en: "Poster wall, Hualien", zh: "花蓮 海報牆" }, img: "images/products/signed-tour-poster.webp", size: "3.8 MB", added: "2026/07/24" },
        { id: "b4", kind: "clip",  name: { en: "Bus, 3am, somewhere near Su-ao", zh: "凌晨三點的車上（蘇澳附近）" }, img: "images/projects/nick-realive.jpg", dur: "2:18", size: "196 MB", added: "2026/07/20" },
        { id: "b5", kind: "image", name: { en: "Zine layout, first proof", zh: "Zine 首校" }, img: "images/products/tour-zine-vol-02.webp", size: "5.5 MB", added: "2026/07/19" },
        { id: "b6", kind: "audio", name: { en: "Crowd, Taitung, before the encore", zh: "台東 安可前的人聲" }, dur: "0:52", size: "1.9 MB", added: "2026/07/18" }
      ]
    },
    {
      id: "onset", icon: "video",
      name: { en: "On set · Moonlight Over Sham Shui Po", zh: "《深水埗的月光》片場" },
      note: { en: "Set photography and dailies for the backers of this film.", zh: "本片支持者專屬的片場照與毛片。" },
      rules: [{ t: "backed", v: "shamshuipo-moonlight" }, { t: "tier", v: "inner" }],
      items: [
        { id: "s1", kind: "image", name: { en: "Night market build, day 3", zh: "夜市搭景 第三天" }, img: "images/projects/shamshuipo-moonlight.jpg", size: "6.1 MB", added: "2026/07/26" },
        { id: "s2", kind: "image", name: { en: "Bingsutt interior, lighting test", zh: "冰室內景 燈光測試" }, img: "images/projects/kowloon-bingsutt.jpg", size: "5.4 MB", added: "2026/07/26" },
        { id: "s3", kind: "clip",  name: { en: "Dailies — scene 14, take 2", zh: "毛片 第 14 場 第 2 次" }, img: "images/projects/miujie-fungwan.jpg", dur: "3:36", size: "412 MB", added: "2026/07/23" },
        { id: "s4", kind: "image", name: { en: "Street dressing, Tai Nan St.", zh: "大南街 街景陳設" }, img: "images/projects/mong-kok-shootout-card.webp", size: "4.9 MB", added: "2026/07/21" }
      ]
    },
    {
      id: "signing", icon: "pencil",
      name: { en: "Signing session · Taipei", zh: "簽名會現場 · 台北" },
      note: { en: "The photographer's full set — including the frames we never posted.", zh: "攝影師完整檔——包含沒有貼出來的那些。" },
      rules: [{ t: "attended", v: "album-signing-taipei" }],
      items: [
        { id: "g1", kind: "image", name: { en: "Queue, 10:40am", zh: "排隊 10:40" }, img: "images/products/nick-single.jpg", size: "3.3 MB", added: "2026/07/14" },
        { id: "g2", kind: "image", name: { en: "Table 2, first hour", zh: "第二桌 第一小時" }, img: "images/products/nick-album.jpg", size: "3.7 MB", added: "2026/07/14" },
        { id: "g3", kind: "image", name: { en: "The one with the dog", zh: "帶狗來的那位" }, img: "images/products/nick-realive-cd.jpg", size: "4.0 MB", added: "2026/07/14" },
        { id: "g4", kind: "clip",  name: { en: "Last five minutes", zh: "最後五分鐘" }, img: "images/products/nick-r2.jpg", dur: "5:00", size: "268 MB", added: "2026/07/15" }
      ]
    },
    {
      id: "voicenotes", icon: "mic",
      name: { en: "Inner Circle voice notes", zh: "核心圈語音信" },
      note: { en: "One a month, recorded for this room only. No transcript.", zh: "每月一封，只錄給這個房間。沒有逐字稿。" },
      rules: [{ t: "tier", v: "inner" }, { t: "earned", v: "hof" }],
      items: [
        { id: "v1", kind: "audio", name: { en: "July — on finishing the EP", zh: "七月 · 關於把 EP 做完" }, dur: "8:24", size: "16.2 MB", added: "2026/07/28" },
        { id: "v2", kind: "audio", name: { en: "June — the argument about track 4", zh: "六月 · 為了第四首吵的那次" }, dur: "6:11", size: "11.8 MB", added: "2026/06/30" },
        { id: "v3", kind: "audio", name: { en: "May — reading your letters", zh: "五月 · 讀你們的信" }, dur: "11:02", size: "21.4 MB", added: "2026/05/31" }
      ]
    },
    {
      id: "open", icon: "globe",
      name: { en: "Open reel", zh: "公開花絮" },
      note: { en: "No gate on this one — every fan can open it.", zh: "這一個沒有門檻——所有粉絲都打得開。" },
      rules: [{ t: "tier", v: "fan" }],
      items: [
        { id: "o1", kind: "clip",  name: { en: "EP announcement, uncut", zh: "EP 公布 未剪版" }, img: "images/products/coastline-starter-pack.webp", dur: "1:12", size: "88 MB", added: "2026/07/27" },
        { id: "o2", kind: "image", name: { en: "Tour poster, final", zh: "巡迴海報 定稿" }, img: "images/products/vinyl-poster-set.webp", size: "2.2 MB", added: "2026/07/12" }
      ]
    }
  ];

  /* 庫房封面＝第一張有圖的內容。沒有圖的庫房（純語音）走圖示，
     不放灰色佔位圖：一個永遠不會有封面的房間不該假裝它在等圖。 */
  function cover(vault) {
    var withImg = vault.items.filter(function (i) { return i.img; })[0];
    return withImg ? withImg.img : null;
  }
  function counts(vault) {
    var c = { image: 0, clip: 0, audio: 0 };
    vault.items.forEach(function (i) { c[i.kind]++; });
    return c;
  }

  window.ztorVault = {
    tiers: TIERS,
    totalFans: TOTAL_FANS,
    catalogue: CATALOGUE,
    vaults: VAULTS,
    reach: reach,
    reachInTier: reachInTier,
    ruleLabel: ruleLabel,
    ruleText: ruleText,
    cover: cover,
    counts: counts,
    t: t
  };
})();
