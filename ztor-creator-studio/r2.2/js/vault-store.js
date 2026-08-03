/* vault-store.js — Media Vault 的示範資料源與「誰進得來」的計算。
   ============================================================
   為什麼需要這支：
     Media Vault 的每一座庫房都掛著解鎖條件（列出幾種進得來的方法，達成任一種即可），
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
     名稱不在此複製，一律引用 tier-settings.tier.* 的 i18n key。
     2026-07-31：人數改由 js/tier-population.js 供給（電子商店的分級門檻也要問同一份
     人口，數字不該有第二份宣告）。本檔內部沿用 "super" 這個 key——reach 系列與存下來的
     假資料都以它為準，改名的連鎖比映射一行大得多，所以在這裡映射、不動內部命名。 */
  var POP = (window.ztorTierPopulation && window.ztorTierPopulation.tiers) || [];
  var LOCAL_KEY = { inner: "inner", superfan: "super", devoted: "devoted", fan: "fan" };
  var TIERS = POP.map(function (t) {
    return { key: LOCAL_KEY[t.key] || t.key, i18n: t.i18n, count: t.count };
  });
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
        { id: "acetate", cap: 21,  w: [1.0, 0.45, 0.12, 0.03], label: { en: "Kowloon After Dark vinyl · numbered 1/50", zh: "九龍夜行 原聲黑膠 1/50" } },
        { id: "album",   rate: [0.86, 0.58, 0.24, 0.07],       label: { en: "Kowloon After Dark OST — digital download",   zh: "九龍夜行 原聲帶 數位下載" } },
        { id: "hoodie",  rate: [0.54, 0.29, 0.09, 0.02],       label: { en: "Kowloon After Dark hoodie",                  zh: "九龍夜行 連帽外套" } },
        { id: "movie",   rate: [0.71, 0.38, 0.14, 0.04],       label: { en: "Pirate Queen — Behind the Scenes",                  zh: "巡迴紀錄片" } }
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

  /* ── Persona 標籤覆蓋（2026-08-03）──────────────────────────
     本檔沒有 persona 分支，內容是 default 世界觀（港片＋九龍夜行周邊），
     切到周湯豪時，媒體庫「誰進得來」的解鎖條件會顯示別人的作品——使用者
     在「我的 IP」發現同類問題後要求全面檢查。這裡不重寫資料結構（機率、
     cap、集合運算都與 id 綁定，動了會改變人數），只在 nick persona 下
     把**標籤**換成他實際的發行物；id 與權重完全不動，數字不會漂移。
     attended 那組本來就是他的巡演與見面會，故不需覆蓋。 */
  var VAULT_PERSONA = (function () {
    try { return localStorage.getItem("ztor.persona") === "nick" ? "nick" : "default"; }
    catch (e) { return "default"; }
  })();
  var NICK_LABELS = {
    acetate: { en: "LOVE RAGE HOPE vinyl · numbered 1/500", zh: "LOVE RAGE HOPE 限量黑膠 1/500" },
    album:   { en: "LOVE RAGE HOPE — digital album",        zh: "LOVE RAGE HOPE — 數位專輯" },
    hoodie:  { en: "Wish You A Good Life hoodie",           zh: "祝你好命 連帽外套" },
    movie:   { en: "REALIVE (R2) concert film",             zh: "REALIVE (R2) 演唱會影像" },
    "shamshuipo-moonlight": { en: "LOVE RAGE HOPE",               zh: "LOVE RAGE HOPE" },
    "dragon-tiger-gate":    { en: "REALIVE",                      zh: "REALIVE" },
    "pirate-queen":         { en: "Too Handsome to Stay (MV)",    zh: "帥到分手 MV" }
  };
  if (VAULT_PERSONA === "nick") {
    Object.keys(CATALOGUE).forEach(function (k) {
      CATALOGUE[k].opts.forEach(function (o) { if (NICK_LABELS[o.id]) o.label = NICK_LABELS[o.id]; });
    });
  }

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
     2026-07-31 起 rules 是「進得來的方法」的清單，不再是單層條件陣列：

       rules ＝ [ { items:[ {t,v}, … ] }, … ]      ← 一個 { } 就是一種方法
       單一條件 ＝ { t:'tier'|'bought'|'backed'|'attended'|'earned', v:<id> }

     講白話：**任何一種方法達成，粉絲就進得來；同一種方法裡的條件要全部達成。**
     例：方法一＝「核心圈 而且 買過黑膠」，方法二＝「出席過簽名會」——
        兩種只要中一種就開得了門。

     為什麼是這個方向（外層任一、內層全部）：創作者腦中的東西是「我開了幾條路
     給粉絲走」，每條路各有幾個門檻。反過來（外層全部、內層任一）同樣算得出
     結果，但要人自己在腦中補括號，畫面上寫不清楚。

     舊資料（單層、語意為任一）的搬遷＝每個條件各自成為一種方法，語意不變。

     ⚠️ 這是權限規則的變更，屬產品決策。原型先行實作供裁決，尚未寫回 documents/，
        提案記在 site/r2.2/ASSUMPTIONS.md（PG-025）。 */
  function matches(rule, fan) {
    if (rule.t === "tier") return TIER_RANK[fan.tier] >= TIER_RANK[rule.v];
    var bag = fan[rule.t];
    return !!(bag && bag[rule.v]);
  }
  /* 一種方法：裡面的條件要全部達成。空的方法一律不算達成——「還沒填完」不能
     等於「誰都進得來」，否則剛加一種方法還沒選條件，門就對全站開了。 */
  function groupMatches(g, fan) {
    var items = (g && g.items) || [];
    if (!items.length) return false;
    for (var j = 0; j < items.length; j++) if (!matches(items[j], fan)) return false;
    return true;
  }
  /* 整座庫房：任何一種方法達成就算數。 */
  function ruleMatches(vault, fan) {
    var gs = vault.rules || [];
    for (var i = 0; i < gs.length; i++) if (groupMatches(gs[i], fan)) return true;
    return false;
  }
  /* 這座庫房總共掛了幾條條件（不分方法）。判斷「有沒有設條件」用它，不要用
     rules.length——那數的是方法數，一個空方法會讓它變成 1。 */
  function ruleCount(vault) {
    var gs = vault.rules || [], n = 0;
    for (var i = 0; i < gs.length; i++) n += ((gs[i].items || []).length);
    return n;
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

  /* ── 鑰匙（加密連結／NFC）─────────────────────────────────
     2026-07-29 使用者裁示：創作者可以發出一條加密連結，直接送給某位粉絲
     當禮物，或把它寫進 NFC 商品（鑰匙圈、小家具），粉絲買到之後手機一碰
     就取得這座庫房的權限。

     鑰匙是「持有者憑證」(bearer credential)，跟條件不是同一種東西：
       · 條件回答「哪一群人符合」——是可以算的集合。
       · 鑰匙回答「誰拿到了這一把」——在有人領取之前，它不對應任何人。
     所以未領取的次數永遠不進人數；`uses` 是產能，`claimed` 才是人。
     已領取的那些是真的指向母體裡的某幾筆粉絲紀錄，所以「條件 ∪ 鑰匙」
     仍然是一次真的聯集，重疊會自己去掉（有人本來就符合條件，又拿到鑰匙，
     只會被算一次）。

     revoked ＝ 連結外流時的煞車。撤銷後那把鑰匙的持有者立刻失去權限，
     所以人數會往下掉——這正是撤銷該有的樣子。 */
  function keyHolders(vault) {
    var set = {};
    (vault.keys || []).forEach(function (k) {
      if (k.revoked) return;
      (k.claimed || []).forEach(function (idx) { set[idx] = 1; });
    });
    return set;
  }
  /* 這座庫房現在真正打得開的人數＝符合條件（每一組都要過）∪ 持有有效鑰匙。
     鑰匙一直是疊在條件之上的另一條路，不受組的「且」影響——它是持有者憑證，
     拿到就進得來，不必再符合任何條件。 */
  function reachAll(vault) {
    var held = keyHolders(vault);
    var n = 0;
    for (var i = 0; i < FANS.length; i++) {
      if (held[i] || ruleMatches(vault, FANS[i])) n++;
    }
    return n;
  }
  /* 拆給門條讀的三個數：條件帶進來的、鑰匙帶進來的、兩者重疊的。
     重疊要單獨報出來，否則 513 ＋ 137 看起來像 650，實際上不是。 */
  function reachSplit(vault) {
    var held = keyHolders(vault);
    var byRule = 0, byKey = 0, both = 0;
    for (var i = 0; i < FANS.length; i++) {
      var r = ruleMatches(vault, FANS[i]);
      var k = !!held[i];
      if (r) byRule++;
      if (k) byKey++;
      if (r && k) both++;
    }
    return { byRule: byRule, byKey: byKey, both: both, total: byRule + byKey - both };
  }
  function reachInTierAll(vault, tierKey) {
    var held = keyHolders(vault);
    var n = 0;
    for (var i = 0; i < FANS.length; i++) {
      if (FANS[i].tier !== tierKey) continue;
      if (held[i] || ruleMatches(vault, FANS[i])) n++;
    }
    return n;
  }
  /* 鑰匙統計：發出的次數、已領取、還剩幾次。 */
  function keyStats(vault) {
    var issued = 0, claimed = 0, live = 0;
    (vault.keys || []).forEach(function (k) {
      if (k.revoked) return;
      live++;
      issued += k.uses;
      claimed += (k.claimed || []).length;
    });
    return { live: live, issued: issued, claimed: claimed, left: issued - claimed };
  }

  /* 鑰匙代號：人要唸得出來、也要能印在鑰匙圈背面，所以不用 UUID。
     去掉 0/O/1/I 這幾個在雷射雕刻上分不出來的字元。 */
  var CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var codeSeq = 0;
  function newCode(seedRnd) {
    var r = seedRnd || Math.random;
    var out = "";
    for (var i = 0; i < 8; i++) out += CODE_ALPHABET[Math.floor(r() * CODE_ALPHABET.length)];
    codeSeq++;
    return out.slice(0, 4) + "-" + out.slice(4);
  }
  /* 展示用的連結。原型沒有後端，網域固定寫成粉絲端的正式網域，讓創作者
     看到的就是他真的會貼出去的那一串，而不是 localhost。 */
  function keyUrl(code) { return "https://ztor.com/k/" + code.replace("-", "").toLowerCase(); }

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
      rules: [{ items: [{ t: "tier", v: "super" }] }, { items: [{ t: "bought", v: "acetate" }] }],
      /* 送出去當禮物的單次鑰匙：uses 1、已被領走。 */
      keys: [
        { id: "k-demo-1", code: "HQ7M-3XKD", uses: 1, claimedN: 1, born: "2026/07/26",
          label: { en: "Gift · for the fan who mailed the tape", zh: "禮物 · 給那位寄卡帶來的粉絲" } }
      ],
      items: [
        { id: "d1", kind: "audio", name: { en: "Neon Crossing — rough mix v4", zh: "Neon Crossing 粗混 v4" }, dur: "4:12", size: "9.8 MB", added: "2026/07/22" },
        { id: "d2", kind: "audio", name: { en: "Undertow — drum stem", zh: "Undertow 鼓組分軌" }, dur: "5:03", size: "12.1 MB", added: "2026/07/22" },
        { id: "d3", kind: "audio", name: { en: "Rooftop Wind — demo (voice memo)", zh: "Rooftop Wind Demo（語音備忘）" }, dur: "1:47", size: "3.4 MB", added: "2026/07/18" },
        { id: "d4", kind: "image", name: { en: "Mastering room whiteboard", zh: "母帶室白板" }, img: "images/products/coastline-acetate.webp", size: "2.6 MB", added: "2026/07/16" },
        { id: "d5", kind: "image", name: { en: "EP cover — rejected direction", zh: "EP 封面 未採用版" }, img: "images/products/coastline-ep.webp", size: "3.1 MB", added: "2026/07/11" }
      ]
    },
    {
      id: "backstage", icon: "camera",
      name: { en: "East-coast tour · backstage", zh: "東岸巡迴 · 幕後" },
      note: { en: "Everything that did not make the documentary.", zh: "沒有進紀錄片的那些。" },
      rules: [{ items: [{ t: "tier", v: "devoted" }] }],
      /* NFC 鑰匙圈的量產批次（500 支）＋ 一把外流後被撤銷的連結。
         撤銷那把刻意留在資料裡：撤銷不是把紀錄刪掉，創作者要看得到
         「這把發生過、現在停用了、當時有 12 個人領過」。 */
      keys: [
        { id: "k-bs-1", code: "KC26-A4VP", uses: 500, claimedN: 137, born: "2026/07/12",
          label: { en: "NFC keychain · east-coast tour", zh: "NFC 鑰匙圈 · 東岸巡迴" },
          product: { id: "nfc-keychain", name: VAULT_PERSONA === "nick"
            ? { en: "REALIVE NFC keychain", zh: "REALIVE NFC 鑰匙圈" }
            : { en: "Kowloon After Dark NFC keychain", zh: "九龍夜行 NFC 鑰匙圈" } } },
        { id: "k-bs-2", code: "TMP9-2QRS", uses: 50, claimedN: 12, born: "2026/06/30", revoked: "2026/07/08",
          label: { en: "Press preview · leaked, revoked", zh: "媒體預覽 · 外流後已撤銷" } }
      ],
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
      name: VAULT_PERSONA === "nick"
        ? { en: "On set · Too Handsome to Stay (MV)", zh: "《帥到分手》MV 拍攝現場" }
        : { en: "On set · Moonlight Over Sham Shui Po", zh: "《深水埗的月光》片場" },
      note: { en: "Set photography and dailies for the backers of this film.", zh: "本片支持者專屬的片場照與毛片。" },
      rules: [{ items: [{ t: "backed", v: "shamshuipo-moonlight" }] }, { items: [{ t: "tier", v: "inner" }] }],
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
      rules: [{ items: [{ t: "attended", v: "album-signing-taipei" }] }],
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
      rules: [{ items: [{ t: "tier", v: "inner" }] }, { items: [{ t: "earned", v: "hof" }] }],
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
      rules: [{ items: [{ t: "tier", v: "fan" }] }],
      items: [
        { id: "o1", kind: "clip",  name: { en: "EP announcement, uncut", zh: "EP 公布 未剪版" }, img: "images/products/coastline-starter-pack.webp", dur: "1:12", size: "88 MB", added: "2026/07/27" },
        { id: "o2", kind: "image", name: { en: "Tour poster, final", zh: "巡迴海報 定稿" }, img: "images/products/vinyl-poster-set.webp", size: "2.2 MB", added: "2026/07/12" }
      ]
    }
  ];

  /* ── 把 claimedN 展開成真的「哪幾個粉絲領走了」──────────────
     只存一個數字的話，「條件 ∪ 鑰匙」就沒辦法去重，門條上那個數字會變成
     兩個數字硬加起來的假貨。所以這裡把它展開成母體裡的實際索引。

     權重刻意偏向低分級：NFC 鑰匙圈存在的意義，就是讓一個爬不上分級階梯
     的人也能進來。權重若偏向核心圈，重疊會大到讓這條路看起來沒有用——
     那不是這個功能在現實中的樣子。 */
  (function assignClaims() {
    var r = rng(80260729);
    var w = [0.15, 0.5, 1.0, 1.2];          /* inner · super · devoted · fan */
    VAULTS.forEach(function (v) {
      (v.keys || []).forEach(function (k) {
        var want = Math.min(k.claimedN || 0, k.uses);
        var scored = FANS.map(function (f, i) { return { i: i, s: w[f.ti] * r() }; });
        scored.sort(function (a, b) { return b.s - a.s; });
        k.claimed = scored.slice(0, want).map(function (x) { return x.i; });
      });
    });
  })();

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
    ruleMatches: ruleMatches,
    ruleCount: ruleCount,
    reachAll: reachAll,
    reachSplit: reachSplit,
    reachInTierAll: reachInTierAll,
    keyStats: keyStats,
    newCode: newCode,
    keyUrl: keyUrl,
    ruleLabel: ruleLabel,
    ruleText: ruleText,
    cover: cover,
    counts: counts,
    t: t
  };
})();
