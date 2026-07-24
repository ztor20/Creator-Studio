/* projects-store.js · 專案 demo 資料的單一來源（2026-07-24）
   ------------------------------------------------------------------
   在此之前，專案清單的資料寫死在 projects.html 的 inline script，而
   project-detail.html 是一個寫死的 Late Bloom 樣本、用一顆「影視／音樂」
   segmented 假裝切換專案類型。使用者指出專案類型本來就有很多種，該由
   「清單上選哪一個專案」決定，不是詳情頁裡自己切——所以資料抽成這支共用
   store，清單與詳情頁同吃一份。

   內容類型（cat）沿用上游 spec 5.1.2.1 §4.1 F3 的創作者可見選項：
   電影 movie／短劇 short／影集 series／音樂 song／音樂專輯 album／MV mv／
   活動 event／其他商品 merch／文檔 document／自訂 custom。
   family 是把上述收成三個家族（film／music／other），只用於呈現層分組與
   「哪些區塊要出現」的判斷（例如音樂家族才有版稅分析）。

   名稱、簡介與圖片皆為 demo 素材，取自 ztor 公開端共創計畫預覽站
   （ztor-cocreate-preview.vercel.app/cocreate.html）；非影視／音樂的
   類型該站沒有樣本，名稱為配合同一世界觀補寫的示意資料（見 ASSUMPTIONS）。
   金額、人數、進度同樣是示意值，不代表真實專案。

   ── Persona（2026-07-24）──────────────────────────────────────────
   cheat code 的「User」切換會改 localStorage 的 'ztor.persona'：
     default＝原本這批（Maya Chou 世界觀，港片／華語為主）
     nick   ＝周湯豪 NICKTHEREAL（嘻哈／R&B 音樂人世界觀，全新一批 demo）
     userB  ＝佔位空殼，沿用 default
   list()/get()/first()/owner() 依當前 persona 回傳對應資料集，projects.html 與
   project-detail.html 在切換後 reload 即自動改吃該集，無需改頁面。
   ⚠ nick 的圖片沿用現有 images/projects/ 檔（避免 404），非周湯豪本人素材，
     之後可替換；金額／人數／日期同為示意值。
   ------------------------------------------------------------------ */
(function () {
  const IMG = 'images/projects/';
  const PERSONA_KEY = 'ztor.persona';
  function persona() {
    try { const p = localStorage.getItem(PERSONA_KEY); if (p === 'nick' || p === 'userB') return p; } catch (_) {}
    return 'default';
  }

  /* ── default：原有資料集（Maya Chou）─────────────────────────── */
  const PROJECTS_DEFAULT = [
    {
      id: 'f-i-am-speed', created: '2026/03/02', fundFrom: '2026/05/18', name: '我要衝線',
      cat: 'movie', family: 'film', icon: 'film', type: 'fund', status: 'live',
      cover: IMG + 'f-i-am-speed-card.webp', poster: IMG + 'f-i-am-speed.webp',
      desc: { en: 'A farm kid muscles his way into motor racing — adapted from Noboru Rokuda\'s classic manga.', zh: '改編自六田登經典漫畫，農村青年憑勇氣闖入賽車世界。' },
      meta: { en: '$8,420 of $15,000 · 134 backers · 21 days left', zh: '$8,420 / $15,000 · 134 位支持者 · 剩 21 天' },
      fund: { raised: '$8,420', goal: '$15,000', backers: '134', pct: 56, left: { en: '21 days left', zh: '剩餘 21 天' }, period: { en: 'Campaign May 18 – Jul 06, 2026', zh: '募資期間 2026/05/18 – 07/06' } },
      list: { goal: { en: '$8,420 / $15,000', zh: '$8,420 / $15,000' }, left: { en: '21 days left', zh: '剩 21 天' } },
      bar: { pct: 56 }, todo: { en: 'Link IP rental', zh: '綁定 IP 租借' }
    },
    {
      id: 'adia-chan', created: '2026/04/18', fundFrom: '2026/06/01', name: '陳松伶精選',
      cat: 'album', family: 'music', icon: 'music', type: 'fund', status: 'live',
      cover: IMG + 'adia-chan-card.webp', poster: IMG + 'adia-chan.webp',
      desc: { en: 'Cantopop classics re-recorded with a new string arrangement, including live session takes.', zh: '經典重唱 × 全新弦樂編制，收錄 Live Session 現場版本。' },
      meta: { en: '$4,100 of $10,000 · 6 backers · 40 days left', zh: '$4,100 / $10,000 · 6 位支持者 · 剩 40 天' },
      fund: { raised: '$4,100', goal: '$10,000', backers: '6', pct: 41, left: { en: '40 days left', zh: '剩餘 40 天' }, period: { en: 'Campaign Jun 01 – Sep 01, 2026', zh: '募資期間 2026/06/01 – 09/01' } },
      list: { goal: { en: '$4,100 / $10,000', zh: '$4,100 / $10,000' }, left: { en: '40 days left', zh: '剩 40 天' } },
      bar: { pct: 41 }, todo: { en: 'Confirm string session studio', zh: '確認弦樂錄音室檔期' }
    },
    {
      id: 'mong-kok-shootout', created: '2025/12/08', fundFrom: '2026/02/10', name: '旺角狙擊',
      cat: 'movie', family: 'film', icon: 'film', type: 'fund', status: 'funded',
      cover: IMG + 'mong-kok-shootout-card.webp', poster: IMG + 'shuangyan-zhijian.webp',
      desc: { en: 'A rookie negotiator has 24 hours to close a kidnapping — against the mentor who vanished ten years ago.', zh: '一場 24 小時內必須結案的綁架案，菜鳥談判專家對上失蹤十年的師父。' },
      meta: { en: '$50,000 of $50,000 reached · delivery in progress', zh: '$50,000 / $50,000 已達標 · 交付進行中' },
      fund: { raised: '$50,000', goal: '$50,000', backers: '612', pct: 100, left: { en: 'Funding closed', zh: '募資已結束' }, period: { en: 'Campaign Feb 10 – May 10, 2026', zh: '募資期間 2026/02/10 – 05/10' } },
      list: { goal: { en: '$50,000 / $50,000', zh: '$50,000 / $50,000' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Post a backer update', zh: '發布支持者進度更新' }
    },
    {
      id: 'pirate-queen', created: '2025/09/20', name: '海上霸姬鄭一嫂',
      cat: 'series', family: 'film', icon: 'film', type: 'go-live', status: 'published',
      cover: IMG + 'pirate-queen-zheng-yi-sao-card.webp', poster: IMG + 'yangtai-shang-de-huai-nuhai.webp',
      desc: { en: 'From dance-hall girl to commander of seventy thousand — the true legend of a Qing-dynasty pirate queen.', zh: '清朝真實女海盜傳奇，從舞女到統領七萬眾的海上霸主。' },
      meta: { en: 'US$12,500 lifetime · 45,000 views', zh: '累計 US$12,500 · 45,000 次觀看' },
      bar: null, todo: null
    },
    {
      id: 'dragon-tiger-gate', created: '2026/02/14', fundFrom: '2026/05/02', name: '龍虎門外傳：九龍夜行',
      cat: 'movie', family: 'film', icon: 'film', type: 'preorder', status: 'live',
      cover: IMG + 'dragon-tiger-gate-kowloon-night-card.webp', poster: IMG + 'anyong-qingshi.webp',
      desc: { en: 'A new chapter of the classic martial-arts IP — old scores settled in neon back alleys.', zh: '經典武打 IP 新章，霓虹巷弄裡的江湖再起。' },
      meta: { en: '62 / 100 pre-orders · $28 each · 9 days left', zh: '62 / 100 筆預購 · 單價 $28 · 剩 9 天' },
      list: { goal: { en: '62 / 100', zh: '62 / 100 筆' }, left: { en: '9 days left', zh: '剩 9 天' } },
      bar: { pct: 62 }, todo: { en: 'Confirm collector edition quote', zh: '確認典藏版製作報價' }
    },
    {
      id: 'shamshuipo-moonlight', created: '2026/03/15', name: '深水埗的月光',
      cat: 'short', family: 'film', icon: 'film', type: 'fund', status: 'draft',
      cover: IMG + 'shamshuipo-moonlight.jpg', poster: IMG + 'meigui-muqin.webp',
      desc: { en: 'A bowl of wonton noodles at a late-night dai pai dong ties three generations together.', zh: '深夜大排檔的一碗雲吞麵，串起三代人的離散與重逢。' },
      meta: { en: 'Created Mar 15, 2026', zh: '建立於 2026/03/15' },
      bar: null, todo: { en: 'Add showcase assets', zh: '補上展示素材' }
    },
    {
      id: 'moonlight-mv', created: '2026/04/02', name: '深水埗的月光 主題曲 MV',
      cat: 'mv', family: 'music', icon: 'music', type: 'go-live', status: 'scheduled',
      cover: IMG + 'cc-video-1.jpg', poster: IMG + 'ruguo-wo-keyi-dongmian.webp',
      desc: { en: 'The title-track music video, shot on the same night market set as the short film.', zh: '主題曲 MV，與短片共用同一組夜市場景拍攝。' },
      meta: { en: 'Goes live Dec 01 · cover art uploaded', zh: '12/01 上線 · 封面已上傳' },
      bar: null, todo: { en: 'Set monetization', zh: '設定變現方式' }
    },
    {
      id: 'kowloon-night-theme', created: '2026/04/26', name: '九龍夜行 片尾曲',
      cat: 'song', family: 'music', icon: 'music', type: 'go-live', status: 'published',
      cover: IMG + 'cc-video-3.jpg', poster: null,
      desc: { en: 'The end-credits single from the martial-arts feature, released on its own.', zh: '武打片的片尾曲，單曲獨立發行。' },
      meta: { en: 'US$3,180 lifetime · 128,000 streams', zh: '累計 US$3,180 · 128,000 次串流' },
      bar: null, todo: null
    },
    {
      id: 'kowloon-premiere', created: '2026/05/06', name: '九龍冰室 十週年放映會',
      cat: 'event', family: 'other', icon: 'ticket', type: 'preorder', status: 'live',
      cover: IMG + 'kowloon-bingsutt.jpg', poster: null,
      desc: { en: 'A tenth-anniversary screening with a cast reunion talk.', zh: '十週年放映會，映後有原班人馬座談。' },
      meta: { en: '180 / 240 tickets · $35 each · 12 days left', zh: '180 / 240 張票 · 單價 $35 · 剩 12 天' },
      list: { goal: { en: '180 / 240', zh: '180 / 240 張' }, left: { en: '12 days left', zh: '剩 12 天' } },
      bar: { pct: 75 }, todo: { en: 'Confirm venue seating map', zh: '確認場地座位圖' }
    },
    {
      id: 'miujie-merch', created: '2025/08/11', name: '廟街風雲 週邊組合',
      cat: 'merch', family: 'other', icon: 'shopping-bag', type: 'preorder', status: 'completed',
      cover: IMG + 'miujie-fungwan.jpg', poster: null,
      desc: { en: 'Poster, enamel pin and tote from the street-market world.', zh: '海報、琺瑯徽章與帆布袋，取材自老街市井世界觀。' },
      meta: { en: 'Released Oct 14 · 38,402 views · US$6,318 gross', zh: '10/14 上線 · 38,402 次觀看 · 毛收 US$6,318' },
      bar: null, todo: null
    },
    {
      id: 'pirate-queen-doc', created: '2026/01/23', name: '海上霸姬 幕後紀錄',
      cat: 'document', family: 'other', icon: 'file-text', type: 'go-live', status: 'published',
      cover: IMG + 'cc-concept-2.jpg', poster: null,
      desc: { en: 'Production notes, storyboards and research from the pirate-queen shoot.', zh: '製作筆記、分鏡與史料考據，記錄海上霸姬的拍攝過程。' },
      meta: { en: 'US$1,240 lifetime · 3,180 reads', zh: '累計 US$1,240 · 3,180 次閱讀' },
      bar: null, todo: null
    },
    {
      id: 'vulgaria-sequel', created: '2025/11/30', fundFrom: '2026/01/05', name: '低俗喜劇之嗨仔番外篇',
      cat: 'custom', family: 'other', icon: 'sparkles', type: 'fund', status: 'failed',
      cover: IMG + 'vulgaria-luozai-card.webp', poster: null,
      desc: { en: 'The original cast returns — a format that does not fit any preset category.', zh: '原班人馬回歸，笑爆院線；發行形態不屬於既有分類，走自訂。' },
      meta: { en: "Didn't reach the minimum · refunded", zh: '未達最低門檻 · 已全額退款' },
      bar: null, todo: null
    }
  ];

  /* ── nick：周湯豪 NICKTHEREAL（嘻哈／R&B 音樂人）─────────────────
     全新一批專案，涵蓋各 cat 與各 type/status，方便展示不同版面。
     圖沿用現有檔（非本人素材），金額／日期為示意值。 */
  /* ── nick：周湯豪 NICKTHEREAL（真實作品，2026-07-24 換上）─────────────
     專輯/單曲/MV/巡演/周邊取自其真實作品年表（見 persona/NICKTHEREAL/資料彙整.md），
     封面為真實素材（Apple Music／官方售票／媒體，僅供 demo 參考）；金額／募資狀態
     為示意值（原型演示各版面用，非真實銷售）。 */
  const PROJECTS_NICK = [
    {
      id: 'nick-lrh', created: '2025/08/01', fundFrom: '2025/09/01', name: 'LOVE RAGE HOPE',
      cat: 'album', family: 'music', icon: 'music', type: 'fund', status: 'live',
      cover: IMG + 'nick-lrh.jpg', poster: IMG + 'nick-lrh.jpg',
      desc: { en: 'The fifth studio album — a ten-track rock concept record. Deluxe vinyl and signed edition crowdfunding.', zh: '第五張錄音室專輯，十軌搖滾概念作；豪華黑膠與親簽版集資。' },
      meta: { en: '$88,600 of $120,000 · 2,140 backers · 20 days left', zh: '$88,600 / $120,000 · 2,140 位支持者 · 剩 20 天' },
      fund: { raised: '$88,600', goal: '$120,000', backers: '2,140', pct: 74, left: { en: '20 days left', zh: '剩餘 20 天' }, period: { en: 'Campaign Sep 01 – Oct 30, 2025', zh: '募資期間 2025/09/01 – 10/30' } },
      list: { goal: { en: '$88,600 / $120,000', zh: '$88,600 / $120,000' }, left: { en: '20 days left', zh: '剩 20 天' } },
      bar: { pct: 74 }, todo: { en: 'Approve vinyl test pressing', zh: '確認黑膠試壓樣' }
    },
    {
      id: 'nick-realive', created: '2023/01/10', fundFrom: '2023/01/20', name: 'REALIVE',
      cat: 'album', family: 'music', icon: 'music', type: 'fund', status: 'funded',
      cover: IMG + 'nick-realive.jpg', poster: IMG + 'nick-realive.jpg',
      desc: { en: 'The REALIVE EP tied to the arena tour — five tracks including GET REAL and 走三關.', zh: '與小巨蛋巡演同名的 EP，收錄 GET REAL、走三關等五軌。' },
      meta: { en: '$60,000 of $60,000 reached · delivered', zh: '$60,000 / $60,000 已達標 · 已交付' },
      fund: { raised: '$60,000', goal: '$60,000', backers: '1,580', pct: 100, left: { en: 'Funding closed', zh: '募資已結束' }, period: { en: 'Campaign Jan 20 – Feb 10, 2023', zh: '募資期間 2023/01/20 – 02/10' } },
      list: { goal: { en: '$60,000 / $60,000', zh: '$60,000 / $60,000' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Post a backer update', zh: '發布支持者進度更新' }
    },
    {
      id: 'nick-real-life', created: '2021/12/01', name: 'REAL LIFE',
      cat: 'album', family: 'music', icon: 'music', type: 'go-live', status: 'published',
      cover: IMG + 'nick-real-life.jpg', poster: IMG + 'nick-real-life.jpg',
      desc: { en: 'The fourth studio album — ten C-pop / R&B tracks including 愛上你算我賤 and HEALTHY MIND.', zh: '第四張錄音室專輯，十軌華語 R&B，收錄〈愛上你算我賤〉〈HEALTHY MIND〉。' },
      meta: { en: 'US$42,800 lifetime · 3.6M streams', zh: '累計 US$42,800 · 360 萬次串流' },
      bar: null, todo: null
    },
    {
      id: 'nick-wo-de-i', created: '2025/08/10', name: '我的i',
      cat: 'song', family: 'music', icon: 'music', type: 'go-live', status: 'published',
      cover: IMG + 'nick-i.jpg', poster: IMG + 'nick-i.jpg',
      desc: { en: 'The lead single from LOVE RAGE HOPE — official MV released Aug 22.', zh: 'LOVE RAGE HOPE 首波主打，官方 MV 於 8/22 上線。' },
      meta: { en: 'US$9,200 lifetime · 620,000 streams', zh: '累計 US$9,200 · 620,000 次串流' },
      bar: null, todo: null
    },
    {
      id: 'nick-flames', created: '2025/09/05', name: 'FLAMES',
      cat: 'mv', family: 'music', icon: 'music', type: 'go-live', status: 'scheduled',
      cover: IMG + 'nick-flames.jpg', poster: IMG + 'nick-flames.jpg',
      desc: { en: 'FLAMES — second single off LOVE RAGE HOPE. Official MV scheduled Sep 19.', zh: 'FLAMES，LOVE RAGE HOPE 第二主打；官方 MV 9/19 上線。' },
      meta: { en: 'Goes live Sep 19 · cover art uploaded', zh: '9/19 上線 · 封面已上傳' },
      bar: null, todo: { en: 'Set monetization', zh: '設定變現方式' }
    },
    {
      id: 'nick-ni-shuo', created: '2024/08/20', name: '你說的都對',
      cat: 'mv', family: 'music', icon: 'music', type: 'go-live', status: 'published',
      cover: IMG + 'nick-nsddd.jpg', poster: IMG + 'nick-nsddd.jpg',
      desc: { en: 'The 2024 single later included on LOVE RAGE HOPE — official MV Sep 2024.', zh: '2024 單曲，後收入 LOVE RAGE HOPE；官方 MV 於 2024/09 發布。' },
      meta: { en: 'US$5,400 lifetime · 410,000 streams', zh: '累計 US$5,400 · 410,000 次串流' },
      bar: null, todo: null
    },
    {
      id: 'nick-wei-le-ni', created: '2024/07/25', name: '為了你',
      cat: 'song', family: 'music', icon: 'music', type: 'go-live', status: 'published',
      cover: IMG + 'nick-wln.jpg', poster: IMG + 'nick-wln.jpg',
      desc: { en: 'A 2024 standalone single — released Aug 02, 2024.', zh: '2024 獨立單曲，2024/08/02 發行。' },
      meta: { en: 'US$3,180 lifetime · 240,000 streams', zh: '累計 US$3,180 · 240,000 次串流' },
      bar: null, todo: null
    },
    {
      id: 'nick-ma-xing-wo', created: '2025/07/01', name: '罵醒我 (Reimagined)',
      cat: 'song', family: 'music', icon: 'music', type: 'fund', status: 'draft',
      cover: IMG + 'nick-mxw.jpg', poster: IMG + 'nick-mxw.jpg',
      desc: { en: 'A reimagined take on 罵醒我 for LOVE RAGE HOPE — reward tiers still being shaped.', zh: '為 LOVE RAGE HOPE 重新詮釋的〈罵醒我〉；回饋方案規劃中。' },
      meta: { en: 'Created Jul 01, 2025', zh: '建立於 2025/07/01' },
      bar: null, todo: { en: 'Add showcase assets', zh: '補上展示素材' }
    },
    {
      id: 'nick-r2', created: '2024/09/01', fundFrom: '2024/10/05', name: 'REALIVE (R2) 特仕版演唱會',
      cat: 'event', family: 'other', icon: 'ticket', type: 'preorder', status: 'live',
      cover: IMG + 'nick-r2.jpg', poster: IMG + 'nick-r2.jpg',
      desc: { en: 'motorola presents REALIVE (R2) — Taipei Arena, Nov 23–24, 2024. Full upgrade with 70+ stage looks.', zh: 'motorola 呈獻 REALIVE (R2) 特仕版，臺北小巨蛋 11/23–24；全面升級、逾 70 套舞台造型。' },
      meta: { en: '18,400 / 20,000 tickets · $95 each · 8 days left', zh: '18,400 / 20,000 張票 · 單價 $95 · 剩 8 天' },
      list: { goal: { en: '18,400 / 20,000', zh: '18,400 / 20,000 張' }, left: { en: '8 days left', zh: '剩 8 天' } },
      bar: { pct: 92 }, todo: { en: 'Confirm floor seating map', zh: '確認搖滾區座位圖' }
    },
    {
      id: 'nick-lwh-tour', created: '2025/08/15', fundFrom: '2025/09/01', name: 'LOVE·RAGE·HOPE Live House Tour',
      cat: 'event', family: 'other', icon: 'ticket', type: 'preorder', status: 'live',
      cover: IMG + 'nick-lwh.jpg', poster: IMG + 'nick-lwh.jpg',
      desc: { en: 'The album-concept live house tour — Taipei Legacy MAX / Kaohsiung / Taichung, Sep–Oct 2025.', zh: '圍繞新專輯概念的 Live House 巡演，台北 Legacy MAX／高雄／台中，2025/09–10。' },
      meta: { en: '1,240 / 1,600 tickets · $58 each · 12 days left', zh: '1,240 / 1,600 張票 · 單價 $58 · 剩 12 天' },
      list: { goal: { en: '1,240 / 1,600', zh: '1,240 / 1,600 張' }, left: { en: '12 days left', zh: '剩 12 天' } },
      bar: { pct: 78 }, todo: { en: 'Confirm venue seating map', zh: '確認場地座位圖' }
    },
    {
      id: 'nick-baipa-goods', created: '2022/10/20', name: 'REALIVE 白趴 官方周邊',
      cat: 'merch', family: 'other', icon: 'shopping-bag', type: 'preorder', status: 'completed',
      cover: IMG + 'nick-baipa-goods.jpg', poster: IMG + 'nick-baipa-goods.jpg',
      desc: { en: 'The eight-piece REALIVE arena goods — tee, caps, coach jacket and towels, designed with Wish You A Good Life.', zh: 'REALIVE 白趴八項官方周邊，Tee、帽 Tee、教練外套、毛巾，與「祝你好命」共同設計。' },
      meta: { en: 'Released Oct 28 · 42,300 views · US$8,640 gross', zh: '10/28 上線 · 42,300 次瀏覽 · 毛收 US$8,640' },
      bar: null, todo: null
    }
  ];

  const DATASETS = {
    default: { owner: 'Maya Chou', projects: PROJECTS_DEFAULT },
    nick:    { owner: '周湯豪 NICKTHEREAL', projects: PROJECTS_NICK }
    /* userB 未列＝沿用 default（佔位空殼）*/
  };
  function active() { return DATASETS[persona()] || DATASETS.default; }

  const CAT_LABEL = {
    movie:    { en: 'Movie',      zh: '電影' },
    short:    { en: 'Short film', zh: '短劇' },
    series:   { en: 'Series',     zh: '影集' },
    song:     { en: 'Song',       zh: '音樂' },
    album:    { en: 'Album',      zh: '音樂專輯' },
    mv:       { en: 'MV',         zh: 'MV' },
    event:    { en: 'Event',      zh: '活動' },
    merch:    { en: 'Merch',      zh: '其他商品' },
    document: { en: 'Document',   zh: '文檔' },
    custom:   { en: 'Custom',     zh: '自訂' }
  };

  /* cat → family（呈現層分組；音樂家族才顯示版稅分析區塊） */
  const FAMILY = { movie: 'film', short: 'film', series: 'film', song: 'music', album: 'music', mv: 'music' };

  window.ztorProjects = {
    list: () => active().projects.slice(),
    get: id => active().projects.find(p => p.id === id) || null,
    first: () => active().projects[0],
    owner: () => active().owner,
    catLabel: cat => CAT_LABEL[cat] || { en: cat, zh: cat },
    family: cat => FAMILY[cat] || 'other'
  };
})();
