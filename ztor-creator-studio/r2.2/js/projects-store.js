/* projects-store.js · 項目 demo 資料的單一來源（2026-07-24）
   ------------------------------------------------------------------
   在此之前，項目清單的資料寫死在 projects.html 的 inline script，而
   project-detail.html 是一個寫死的 Moonlight Over Sham Shui Po 樣本、用一顆「影視／音樂」
   segmented 假裝切換項目類型。使用者指出項目類型本來就有很多種，該由
   「清單上選哪一個項目」決定，不是詳情頁裡自己切——所以資料抽成這支共用
   store，清單與詳情頁同吃一份。

   內容類型（cat）沿用上游 spec 5.1.2.1 §4.1 F3 的創作者可見選項：
   電影 movie／短劇 short／影集 series／音樂 song／音樂專輯 album／MV mv／
   活動 event／其他商品 merch／文檔 document／自訂 custom。
   family 是把上述收成三個家族（film／music／other），只用於呈現層分組與
   「哪些區塊要出現」的判斷（例如音樂家族才有版稅分析）。

   名稱、簡介與圖片皆為 demo 素材，取自 ztor 公開端共創計畫預覽站
   （ztor-cocreate-preview.vercel.app/cocreate.html）；非影視／音樂的
   類型該站沒有樣本，名稱為配合同一世界觀補寫的示意資料（見 ASSUMPTIONS）。
   金額、人數、進度同樣是示意值，不代表真實項目。

   ── Persona（2026-07-24）──────────────────────────────────────────
   cheat code 的「User」切換會改 localStorage 的 'ztor.persona'：
     default＝原本這批（Gary Lin 世界觀，港片／華語為主）
     nick   ＝周湯豪 NICKTHEREAL（嘻哈／R&B 音樂人世界觀，全新一批 demo）
     userB  ＝佔位空殼，沿用 default
   list()/get()/first()/owner() 依當前 persona 回傳對應資料集，projects.html 與
   project-detail.html 在切換後 reload 即自動改吃該集，無需改頁面。
   ⚠ nick 的圖片沿用現有 images/projects/ 檔（避免 404），非周湯豪本人素材，
     之後可替換；金額／人數／日期同為示意值。
   ------------------------------------------------------------------ */
/* ── 狀態模型（2026-07-27，L 裁示：重構）──────────────────────────────
   在此之前 status 混用了兩件事，語意剛好相反：`published` 被當成「作品已上線」、
   `live` 被當成「共創進行中」。L 的定義是：

     live      ＝作品已上線、正在賺錢（終點狀態）
     published ＝共創／預購「開放支持中」，作品還沒出來
                 （畫面字樣 2026-08-06 起為「進行中／In progress」，使用者裁示改中立：
                  同一個狀態同時服務共創與預購，字樣不能綁其中一種）

   所以這裡拆成兩個欄位，因為「一個項目同時只會有一個狀態」與「共創成功這件事
   永遠留著」兩句話並不衝突——它們講的是不同欄位：

     status    ＝現在在哪裡（唯一、單向前進）
                 draft → scheduled → published → succeeded → live
                 直接發佈（go-live）沒有共創階段：draft → scheduled → live
                 cancelled ＝死路（共創失敗或創作者中止），取代舊的 failed
     goalMet   ＝共創是否達標。**達標後活動仍在進行、仍在收單**（常見超募），
                 所以它是 published 上的旗標，不是一個會把項目移出 published 的狀態。
     delivered ＝是否已交付給支持者。這是 succeeded 與 live 的唯一分界：
                 達標＋已結束＋未交付 ⇒ succeeded（你還欠支持者東西）
                 已交付            ⇒ live（作品在賺錢；succeeded 變成隨身的徽章）

   舊值對照：published(作品已上線)→live · funded→live/succeeded(看 delivered) ·
             completed→live · failed→cancelled · live(共創中)→published
   ──────────────────────────────────────────────────────────────────── */
(function () {
  const IMG = 'images/projects/';
  const PERSONA_KEY = 'ztor.persona';
  function persona() {
    /* 單一真相見 js/theme.js 的 seedPersona()。原本這裡的退路是 'default'，
       而 i18n.js 是 'nick'——沒存過值時兩邊就會指向不同的人。 */
    if (typeof window.ztorPersonaId === 'function') return window.ztorPersonaId();
    try { const p = localStorage.getItem(PERSONA_KEY); if (p === 'nick' || p === 'userB') return p; } catch (_) {}
    return 'default';
  }

  /* ── default：原有資料集（Gary Lin）─────────────────────────── */
  const PROJECTS_DEFAULT = [
    {
      id: 'f-i-am-speed', created: '2026/03/02', fundFrom: '2026/05/18', name: '我要衝線', nameEn: "Crossing the Line",
      cat: 'movie', family: 'film', icon: 'film', type: 'fund', status: 'published', goalMet: false, delivered: false,
      cover: IMG + 'f-i-am-speed-card.webp', poster: IMG + 'f-i-am-speed.webp',
      desc: { en: 'A farm kid muscles his way into motor racing — adapted from Noboru Rokuda\'s classic manga.', zh: '改編自六田登經典漫畫，農村青年憑勇氣闖入賽車世界。' },
      meta: { en: '$8,420 of $15,000 · 134 backers · 21 days left', zh: '$8,420 / $15,000 · 134 位支持者 · 剩 21 天' },
      fund: { raised: '$8,420', goal: '$15,000', backers: '134', pct: 56, left: { en: '21 days left', zh: '剩餘 21 天' }, period: { en: 'Co-creation May 18 – Jul 06, 2026', zh: '共創期間 2026/05/18 – 07/06' } },
      list: { goal: { en: '$8,420 / $15,000', zh: '$8,420 / $15,000' }, left: { en: '21 days left', zh: '剩 21 天' } },
      bar: { pct: 56 }, todo: { en: 'Link IP rental', zh: '綁定 IP 租借' }
    },
    {
      id: 'adia-chan', created: '2026/04/18', fundFrom: '2026/06/01', name: '陳松伶精選', nameEn: "Nadia Chan: Greatest Hits",
      cat: 'album', family: 'music', icon: 'music', type: 'fund', status: 'live', goalMet: true, delivered: true,
      /* 表現彙總用（meta 未載明，依募資規模給一致的示意值）*/
      perf: { usd: 4200, audience: 96000, kind: 'streams' },
      cover: IMG + 'adia-chan-card.webp', poster: IMG + 'adia-chan.webp',
      desc: { en: 'Cantopop classics re-recorded with a new string arrangement, including live session takes.', zh: '經典重唱 × 全新弦樂編制，收錄 Live Session 現場版本。' },
      meta: { en: '$10,000 funded · 176 backers · Now released', zh: '$10,000 已募足 · 176 位支持者 · 現已上線' },
      fund: { raised: '$10,000', goal: '$10,000', backers: '176', pct: 100, left: { en: 'Released', zh: '已上線' }, period: { en: 'Co-creation Jun 01 – Sep 01, 2026 · Released', zh: '共創期間 2026/06/01 – 09/01 · 已上線' } },
      list: { goal: { en: '$10,000 / $10,000', zh: '$10,000 / $10,000' }, left: { en: 'Released', zh: '已上線' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Review Q2 royalty report', zh: '查看 Q2 版稅報表' }
    },
    {
      id: 'mong-kok-shootout', created: '2025/12/08', fundFrom: '2026/02/10', name: '旺角狙擊', nameEn: "Mong Kok Sniper",
      /* 2026-07-25：募資達標、交付完成後上線，是影視版版稅面板（募資＋已上線）
         唯一的樣本項目。2026-07-27 新模型下＝live（已交付），succeeded 留作徽章。 */
      cat: 'movie', family: 'film', icon: 'film', type: 'fund', status: 'live', goalMet: true, delivered: true,
      /* 表現彙總用（meta 未載明，依募資規模給一致的示意值）*/
      perf: { usd: 21400, audience: 187000, kind: 'views' },
      cover: IMG + 'mong-kok-shootout-card.webp', poster: IMG + 'shuangyan-zhijian.webp',
      desc: { en: 'A rookie negotiator has 24 hours to close a kidnapping — against the mentor who vanished ten years ago.', zh: '一場 24 小時內必須結案的綁架案，菜鳥談判專家對上失蹤十年的師父。' },
      meta: { en: '$50,000 funded · 612 backers · Now streaming', zh: '$50,000 已募足 · 612 位支持者 · 現已上線' },
      fund: { raised: '$50,000', goal: '$50,000', backers: '612', pct: 100, left: { en: 'Released', zh: '已上線' }, period: { en: 'Co-creation Feb 10 – May 10, 2026 · Released', zh: '共創期間 2026/02/10 – 05/10 · 已上線' } },
      list: { goal: { en: '$50,000 / $50,000', zh: '$50,000 / $50,000' }, left: { en: 'Released', zh: '已上線' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Review Q2 royalty report', zh: '查看 Q2 版稅報表' }
    },
    {
      id: 'pirate-queen', created: '2025/09/20', name: '海上霸姬鄭一嫂', nameEn: "Ching Shih: Pirate Queen",
      cat: 'series', family: 'film', icon: 'film', type: 'go-live', status: 'live',
      /* 表現彙總用（自身 meta 已載明）*/
      perf: { usd: 12500, audience: 45000, kind: 'views' },
      cover: IMG + 'pirate-queen-zheng-yi-sao-card.webp', poster: IMG + 'yangtai-shang-de-huai-nuhai.webp',
      desc: { en: 'From dance-hall girl to commander of seventy thousand — the true legend of a Qing-dynasty pirate queen.', zh: '清朝真實女海盜傳奇，從舞女到統領七萬眾的海上霸主。' },
      meta: { en: 'US$12,500 lifetime · 45,000 views', zh: '累計 US$12,500 · 45,000 次觀看' },
      bar: null, todo: null
    },
    {
      id: 'dragon-tiger-gate', created: '2026/02/14', fundFrom: '2026/05/02', name: '龍虎門外傳：九龍夜行', nameEn: "Dragon Tiger Gate: Kowloon After Dark",
      cat: 'movie', family: 'film', icon: 'film', type: 'preorder', status: 'published', goalMet: false, delivered: false,
      cover: IMG + 'dragon-tiger-gate-kowloon-night-card.webp', poster: IMG + 'anyong-qingshi.webp',
      desc: { en: 'A new chapter of the classic martial-arts IP — old scores settled in neon back alleys.', zh: '經典武打 IP 新章，霓虹巷弄裡的江湖再起。' },
      meta: { en: '62 / 100 pre-orders · $28 each · 9 days left', zh: '62 / 100 筆預購 · 單價 $28 · 剩 9 天' },
      list: { goal: { en: '62 / 100', zh: '62 / 100 筆' }, left: { en: '9 days left', zh: '剩 9 天' } },
      bar: { pct: 62 }, todo: { en: 'Confirm collector edition quote', zh: '確認典藏版製作報價' }
    },
    {
      id: 'shamshuipo-moonlight', created: '2026/03/15', name: '深水埗的月光', nameEn: "Moonlight Over Sham Shui Po",
      cat: 'short', family: 'film', icon: 'film', type: 'fund', status: 'draft',
      cover: IMG + 'shamshuipo-moonlight.jpg', poster: IMG + 'meigui-muqin.webp',
      desc: { en: 'A bowl of wonton noodles at a late-night dai pai dong ties three generations together.', zh: '深夜大排檔的一碗雲吞麵，串起三代人的離散與重逢。' },
      meta: { en: 'Created Mar 15, 2026', zh: '建立於 2026/03/15' },
      bar: null, todo: { en: 'Add showcase assets', zh: '補上展示素材' }
    },
    /* ✝ 2026-08-10 新增：直接發佈 × 影片家族 × 準備中的樣本。整併後的建立流程送出＝送審，
       落地狀態是「準備中」（規劃書 §5 第 1 題）；站上原本的兩筆同型項目（moonlight-mv、
       nick-flames）是整併前建立的 MV，demo 文案還停在「發布即上線」的舊模型，拿來當送審
       完成後的落點會讀起來自相矛盾。**沿用「新增而不是改既有樣本」的做法**——改現成項目的
       狀態會連帶改掉它在清單頁與各狀態頁籤的落點。nick persona 的對位樣本是 nick-onstage-film。
       金額、人數、日期為示意值。 */
    {
      id: 'elevator-14f', created: '2026/07/28', name: '十四樓的電梯', nameEn: "The Lift on Fourteen",
      cat: 'movie', family: 'film', icon: 'film', type: 'go-live', status: 'scheduled',
      cover: IMG + 'elevator-14f-card.webp', poster: IMG + 'elevator-14f-card.webp',
      desc: { en: 'A finished feature shot entirely in one Kowloon housing block — sent straight to release, no campaign.', zh: '整部戲都在同一棟九龍舊樓拍完的長片；作品已完成，直接發佈、不走共創。' },
      meta: { en: 'In review · goes live Sep 05', zh: '審核中 · 9/05 上映' },
      bar: null, todo: { en: 'Waiting on platform review', zh: '等待平台審核' }
    },
    {
      id: 'moonlight-mv', created: '2026/04/02', name: '深水埗的月光 主題曲 MV', nameEn: "Moonlight Over Sham Shui Po — Theme (MV)",
      cat: 'mv', family: 'film', icon: 'film', type: 'go-live', status: 'scheduled',
      cover: IMG + 'cc-video-1.jpg', poster: IMG + 'ruguo-wo-keyi-dongmian.webp',
      desc: { en: 'The title-track music video, shot on the same night market set as the short film.', zh: '主題曲 MV，與短片共用同一組夜市場景拍攝。' },
      meta: { en: 'Goes live Dec 01 · cover art uploaded', zh: '12/01 上線 · 封面已上傳' },
      bar: null, todo: { en: 'Set monetization', zh: '設定變現方式' }
    },
    {
      id: 'kowloon-night-theme', created: '2026/04/26', name: '九龍夜行 片尾曲', nameEn: "Kowloon After Dark — End Title",
      cat: 'song', family: 'music', icon: 'music', type: 'go-live', status: 'live',
      /* 表現彙總用（自身 meta 已載明）*/
      perf: { usd: 3180, audience: 128000, kind: 'streams' },
      cover: IMG + 'cc-video-3.jpg', poster: null,
      desc: { en: 'The end-credits single from the martial-arts feature, released on its own.', zh: '武打片的片尾曲，單曲獨立發行。' },
      meta: { en: 'US$3,180 lifetime · 128,000 streams', zh: '累計 US$3,180 · 128,000 次串流' },
      bar: null, todo: null
    },
    {
      id: 'kowloon-premiere', created: '2026/05/06', name: '九龍冰室 十週年放映會', nameEn: "Kowloon Café — 10th Anniversary Screening",
      cat: 'event', family: 'other', icon: 'ticket', type: 'preorder', status: 'published', goalMet: false, delivered: false,
      cover: IMG + 'kowloon-bingsutt.jpg', poster: null,
      desc: { en: 'A tenth-anniversary screening with a cast reunion talk.', zh: '十週年放映會，映後有原班人馬座談。' },
      meta: { en: '180 / 240 tickets · $35 each · 12 days left', zh: '180 / 240 張票 · 單價 $35 · 剩 12 天' },
      list: { goal: { en: '180 / 240', zh: '180 / 240 張' }, left: { en: '12 days left', zh: '剩 12 天' } },
      bar: { pct: 75 }, todo: { en: 'Confirm venue seating map', zh: '確認場地座位圖' }
    },
    {
      id: 'miujie-merch', created: '2025/08/11', name: '廟街風雲 週邊組合', nameEn: "Temple Street Story — Merch Bundle",
      cat: 'merch', family: 'other', icon: 'shopping-bag', type: 'preorder', status: 'live', goalMet: true, delivered: true,
      cover: IMG + 'miujie-fungwan.jpg', poster: null,
      desc: { en: 'Poster, enamel pin and tote from the street-market world.', zh: '海報、琺瑯徽章與帆布袋，取材自老街市井世界觀。' },
      meta: { en: 'Released Oct 14 · 38,402 views · US$6,318 gross', zh: '10/14 上線 · 38,402 次觀看 · 毛收 US$6,318' },
      bar: null, todo: null
    },
    {
      id: 'pirate-queen-doc', created: '2026/01/23', name: '海上霸姬 幕後紀錄', nameEn: "Pirate Queen — Behind the Scenes",
      cat: 'document', family: 'other', icon: 'file-text', type: 'go-live', status: 'live',
      cover: IMG + 'cc-concept-2.jpg', poster: null,
      desc: { en: 'Production notes, storyboards and research from the pirate-queen shoot.', zh: '製作筆記、分鏡與史料考據，記錄海上霸姬的拍攝過程。' },
      meta: { en: 'US$1,240 lifetime · 3,180 reads', zh: '累計 US$1,240 · 3,180 次閱讀' },
      bar: null, todo: null
    },
    {
      id: 'vulgaria-sequel', created: '2025/11/30', fundFrom: '2026/01/05', name: '低俗喜劇之嗨仔番外篇', nameEn: "Vulgaria — The Hyper Boy Side Story",
      cat: 'custom', family: 'other', icon: 'sparkles', type: 'fund', status: 'cancelled', goalMet: false, delivered: false,
      cover: IMG + 'vulgaria-luozai-card.webp', poster: null,
      desc: { en: 'The original cast returns — a format that does not fit any preset category.', zh: '原班人馬回歸，笑爆院線；發行形態不屬於既有分類，走自訂。' },
      meta: { en: "Didn't reach the minimum · refunded", zh: '未達最低門檻 · 已全額退款' },
      bar: null, todo: null
    },
    /* ── 2026-07-27 新增：補齊新模型缺樣本的兩個狀態 ───────────────────
       succeeded（達標、已結束、未交付）與 goalMet 超募（仍在收單）在原資料裡
       完全沒有樣本，chip 會因為計數為 0 永遠不出現。 */
    {
      id: 'pirate-queen-s2', created: '2026/02/01', fundFrom: '2026/03/01', name: '海上霸姬 第二季', nameEn: "Pirate Queen — Season Two",
      cat: 'series', family: 'film', icon: 'film', type: 'fund', status: 'succeeded', goalMet: true, delivered: false,
      cover: IMG + 'pirate-queen-zheng-yi-sao-card.webp', poster: IMG + 'yangtai-shang-de-huai-nuhai.webp',
      desc: { en: 'The second season — goal met and now in production; backers are waiting on delivery.', zh: '第二季，共創已成立、正在製作中；支持者尚未收到交付。' },
      meta: { en: '$80,000 of $80,000 reached · in production', zh: '$80,000 / $80,000 已達標 · 製作中' },
      fund: { raised: '$80,000', goal: '$80,000', backers: '1,020', pct: 100, left: { en: 'Co-creation closed', zh: '共創已結束' }, period: { en: 'Co-creation Mar 01 – Apr 30, 2026', zh: '共創期間 2026/03/01 – 04/30' } },
      list: { goal: { en: '$80,000 / $80,000', zh: '$80,000 / $80,000' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Post a backer update', zh: '發布支持者進度更新' }
    },

    {
      /* default persona 的「已成立 × 影視 × 還沒送過審」樣本（2026-08-07 補）。
         上一筆 pirate-queen-s2 被審核佇列的審核中種子佔走，理由同 nick-r2-film 的檔頭說明。 */
      id: 'kowloon-night-cut', created: '2026/01/09', fundFrom: '2026/02/20', name: '九龍夜行 導演剪輯版', nameEn: "Kowloon After Dark — Director's Cut",
      cat: 'movie', family: 'film', icon: 'film', type: 'fund', status: 'succeeded', goalMet: true, delivered: false,
      cover: IMG + 'dragon-tiger-gate-kowloon-night-card.webp', poster: IMG + 'anyong-qingshi.webp',
      desc: { en: 'Twenty-two minutes back in, a new score, and the ending test audiences never saw — goal met, mastering now.', zh: '補回二十二分鐘、重配配樂、換回試片場沒看過的結局；共創已成立，正在做母帶。' },
      meta: { en: '$36,000 of $36,000 reached · mastering', zh: '$36,000 / $36,000 已達標 · 母帶製作中' },
      fund: { raised: '$36,000', goal: '$36,000', backers: '540', pct: 100, left: { en: 'Co-creation closed', zh: '共創已結束' }, period: { en: 'Co-creation Feb 20 – Apr 05, 2026', zh: '共創期間 2026/02/20 – 04/05' } },
      list: { goal: { en: '$36,000 / $36,000', zh: '$36,000 / $36,000' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Publish the finished film', zh: '上架完成的作品' }
    },
    {
      id: 'miujie-merch-s2', created: '2026/05/20', fundFrom: '2026/06/20', name: '廟街風雲 復刻組合', nameEn: "Temple Street Story — Reissue Bundle",
      cat: 'merch', family: 'other', icon: 'shopping-bag', type: 'preorder', status: 'published', goalMet: true, delivered: false,
      cover: IMG + 'miujie-fungwan.jpg', poster: null,
      desc: { en: 'A reissue of the street-market set — already past its target and still taking pre-orders.', zh: '老街市井組合復刻版，已超過目標、仍在接受預購。' },
      meta: { en: '410 / 300 pre-orders · $32 each · 6 days left', zh: '410 / 300 筆預購 · 單價 $32 · 剩 6 天' },
      list: { goal: { en: '410 / 300', zh: '410 / 300 筆' }, left: { en: '6 days left', zh: '剩 6 天' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Confirm reprint quantity', zh: '確認加印數量' }
    }
  ];

  /* ── nick：周湯豪 NICKTHEREAL（嘻哈／R&B 音樂人）─────────────────
     全新一批項目，涵蓋各 cat 與各 type/status，方便展示不同版面。
     圖沿用現有檔（非本人素材），金額／日期為示意值。 */
  /* ── nick：周湯豪 NICKTHEREAL（真實作品，2026-07-24 換上）─────────────
     專輯/單曲/MV/巡演/周邊取自其真實作品年表（見 persona/NICKTHEREAL/資料彙整.md），
     封面為真實素材（Apple Music／官方售票／媒體，僅供 demo 參考）；金額／共創狀態
     為示意值（原型演示各版面用，非真實銷售）。 */
  /* 2026-07-25 使用者指定：以下五筆為指定要有的樣本，排在最前面（順序照指定）——
       直接上線三首單曲（已上線）／共創一張專輯（進行中）／MV 共創（已上線）。
     其中「你說的都對」由直接上線改為共創型，成為 MV（影視家族）＋已上線的版稅樣本。 */
  const PROJECTS_NICK = [
    /* ── ① 直接上線單曲 ×3（已上線）────────────────────────────── */
    {
      id: 'nick-wo-de-i', created: '2025/08/10', name: '帥到分手', nameEn: "Too Handsome to Stay",
      cat: 'song', family: 'music', icon: 'music', type: 'go-live', status: 'live',
      /* 表現彙總用（自身 meta 已載明）*/
      perf: { usd: 9200, audience: 620000, kind: 'streams' },
      /* 2026-07-26 改名後換上正確封面：persona/NICKTHEREAL/images/single_2016-09-30_x.jpg */
      cover: IMG + 'nick-sdfs.jpg', poster: IMG + 'nick-sdfs.jpg',
      desc: { en: 'The REAL-era breakout single — re-released on its own with a remastered MV.', zh: 'REAL 時期的代表單曲，獨立重新發行並重製 MV。' },
      meta: { en: 'US$9,200 lifetime · 620,000 streams', zh: '累計 US$9,200 · 620,000 次串流' },
      bar: null, todo: null
    },
    {
      id: 'nick-wei-le-ni', created: '2024/07/25', name: '罵醒我', nameEn: "Wake Me Up",
      cat: 'song', family: 'music', icon: 'music', type: 'go-live', status: 'live',
      /* 表現彙總用（自身 meta 已載明）*/
      perf: { usd: 3180, audience: 240000, kind: 'streams' },
      /* 2026-07-26：改名後換上 repo 裡本來就對應〈罵醒我〉的封面（原為〈為了你〉的 nick-wln.jpg）。
         與下方「罵醒我 (Reimagined)」共用同一張＝同一首歌的兩個版本，刻意相同。 */
      cover: IMG + 'nick-mxw.jpg', poster: IMG + 'nick-mxw.jpg',
      desc: { en: 'A 2024 standalone single — released Aug 02, 2024.', zh: '2024 獨立單曲，2024/08/02 發行。' },
      meta: { en: 'US$3,180 lifetime · 240,000 streams', zh: '累計 US$3,180 · 240,000 次串流' },
      bar: null, todo: null
    },
    {
      id: 'nick-zou-san-guan', created: '2023/02/14', name: '愛上你算我賤', nameEn: "Loving You Was My Mistake",
      cat: 'song', family: 'music', icon: 'music', type: 'go-live', status: 'live',
      /* 表現彙總用（自身 meta 已載明）*/
      perf: { usd: 6750, audience: 480000, kind: 'streams' },
      /* 2026-07-26 改名後換上正確封面：persona 素材庫的 Acoustic Version 單曲封面 */
      cover: IMG + 'nick-asn.jpg', poster: IMG + 'nick-asn.jpg',
      desc: { en: 'The REAL LIFE stand-out track released as its own single — a slow-burn R&B breakup cut.', zh: 'REAL LIFE 中最受歡迎的一軌獨立發行，慢燒 R&B 分手情歌。' },
      meta: { en: 'US$6,750 lifetime · 480,000 streams', zh: '累計 US$6,750 · 480,000 次串流' },
      bar: null, todo: null
    },

    /* ── ② 募資專輯（募資中）───────────────────────────────────── */
    {
      id: 'nick-lrh', created: '2025/08/01', fundFrom: '2025/09/01', name: 'LOVE RAGE HOPE', nameEn: "LOVE RAGE HOPE",
      cat: 'album', family: 'music', icon: 'music', type: 'fund', status: 'published', goalMet: false, delivered: false,
      cover: IMG + 'nick-lrh.jpg', poster: IMG + 'nick-lrh.jpg',
      desc: { en: 'The fifth studio album — a ten-track rock concept record. Deluxe vinyl and signed edition crowdfunding.', zh: '第五張錄音室專輯，十軌搖滾概念作；豪華黑膠與親簽版共創。' },
      meta: { en: '$88,600 of $120,000 · 2,140 backers · 20 days left', zh: '$88,600 / $120,000 · 2,140 位支持者 · 剩 20 天' },
      fund: { raised: '$88,600', goal: '$120,000', backers: '2,140', pct: 74, left: { en: '20 days left', zh: '剩餘 20 天' }, period: { en: 'Co-creation Sep 01 – Oct 30, 2025', zh: '共創期間 2025/09/01 – 10/30' } },
      list: { goal: { en: '$88,600 / $120,000', zh: '$88,600 / $120,000' }, left: { en: '20 days left', zh: '剩 20 天' } },
      bar: { pct: 74 }, todo: { en: 'Approve vinyl test pressing', zh: '確認黑膠試壓樣' }
    },

    /* ── ③ MV 募資（已上線）＝影視家族版稅樣本 ──────────────────── */
    {
      id: 'nick-ni-shuo', created: '2024/06/10', fundFrom: '2024/07/01', name: '帥到分手 MV', nameEn: "Too Handsome to Stay (MV)",
      cat: 'mv', family: 'film', icon: 'film', type: 'fund', status: 'live', goalMet: true, delivered: true,
      /* 表現彙總用（meta 未載明，依募資規模給一致的示意值）*/
      perf: { usd: 7300, audience: 2400000, kind: 'views' },
      /* MV 沿用單曲主視覺（同一首歌），與下方直接發佈版同圖 */
      cover: IMG + 'nick-sdfs.jpg', poster: IMG + 'nick-sdfs.jpg',
      desc: { en: 'A crowdfunded cinematic MV shot on 35mm — backers funded the full one-take production.', zh: '共創拍攝的電影感 MV，35mm 底片一鏡到底；製作費由支持者共同促成。' },
      meta: { en: '$45,000 funded · 980 backers · Now streaming', zh: '$45,000 已募足 · 980 位支持者 · 現已上線' },
      fund: { raised: '$45,000', goal: '$45,000', backers: '980', pct: 100, left: { en: 'Released', zh: '已上線' }, period: { en: 'Co-creation Jul 01 – Aug 15, 2024 · Released', zh: '共創期間 2024/07/01 – 08/15 · 已上線' } },
      list: { goal: { en: '$45,000 / $45,000', zh: '$45,000 / $45,000' }, left: { en: 'Released', zh: '已上線' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Review Q2 royalty report', zh: '查看 Q2 版稅報表' }
    },

    {
      /* 共創已成立、尚未交付的影視樣本（2026-08-07 補）。
         補這一筆的原因：作品上架流程（publish-work.html）只對「已成立 × 影視家族」開放，
         而 nick 是站上預設 persona，原本它名下唯一的 succeeded 是黑膠專輯（音樂家族）——
         不切 persona 就點不到任何一個能真的走進上架流程的項目。default persona 那邊
         對應的樣本是 pirate-queen-s2。 */
      id: 'nick-lrh-doc', created: '2025/10/12', fundFrom: '2025/11/10', name: 'LOVE·RAGE·HOPE 巡演紀錄片', nameEn: "LOVE·RAGE·HOPE — Tour Documentary",
      cat: 'movie', family: 'film', icon: 'film', type: 'fund', status: 'succeeded', goalMet: true, delivered: false,
      cover: IMG + 'nick-lrh-tour.jpg', poster: IMG + 'nick-lrh-tour.jpg',
      desc: { en: 'A feature-length documentary following the Live House tour — goal met, now in post-production; backers are waiting on the release.', zh: '跟拍 Live House 巡演的長片紀錄片；共創已成立、正在後期，支持者尚未收到交付。' },
      meta: { en: '$62,000 of $62,000 reached · in post-production', zh: '$62,000 / $62,000 已達標 · 後期製作中' },
      fund: { raised: '$62,000', goal: '$62,000', backers: '1,480', pct: 100, left: { en: 'Co-creation closed', zh: '共創已結束' }, period: { en: 'Co-creation Nov 10 – Dec 24, 2025', zh: '共創期間 2025/11/10 – 12/24' } },
      list: { goal: { en: '$62,000 / $62,000', zh: '$62,000 / $62,000' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Publish the finished film', zh: '上架完成的作品' }
    },

    {
      /* 「已成立 × 影視 × 還沒送過審」的樣本（2026-08-07 補）。
         上一筆 nick-lrh-doc 被審核佇列的待審核種子佔走了——已經送出去的作品不該再送一次，
         所以它的「完成作品」選項是灰的。兩個 persona 各留一筆沒有送審紀錄的，
         創作者從頭發起一次上架的路徑才走得到（default persona 的對位樣本是 kowloon-night-cut）。 */
      id: 'nick-r2-film', created: '2025/06/18', fundFrom: '2025/07/15', name: 'REALIVE (R2) 演唱會電影', nameEn: "REALIVE (R2) — The Concert Film",
      cat: 'movie', family: 'film', icon: 'film', type: 'fund', status: 'succeeded', goalMet: true, delivered: false,
      cover: IMG + 'nick-r2-special.jpg', poster: IMG + 'nick-r2-special.jpg',
      desc: { en: 'The R2 special edition night, cut into a feature — goal met, final grade in progress; backers are waiting on the release.', zh: '把 R2 特仕版那一夜剪成長片；共創已成立、正在調光，支持者尚未收到交付。' },
      meta: { en: '$54,000 of $54,000 reached · in post-production', zh: '$54,000 / $54,000 已達標 · 後期製作中' },
      fund: { raised: '$54,000', goal: '$54,000', backers: '1,120', pct: 100, left: { en: 'Co-creation closed', zh: '共創已結束' }, period: { en: 'Co-creation Jul 15 – Sep 12, 2025', zh: '共創期間 2025/07/15 – 09/12' } },
      list: { goal: { en: '$54,000 / $54,000', zh: '$54,000 / $54,000' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Publish the finished film', zh: '上架完成的作品' }
    },

    {
      /* 預購 × 影視 × 已成立的樣本（2026-08-07 補）。上架流程的前置條件看的是項目狀態
         與作品家族、不看發行模式，所以預購走到已成立時跟共創一樣能發起上架——但站上
         原本沒有任何一筆預購影片走到已成立（唯一的預購影片停在進行中），這條路徑因此
         無從驗證。預購沒有分潤名額，方案必含作品本身（D167）。 */
      id: 'nick-nsddd-film', created: '2025/12/02', fundFrom: '2026/01/08', name: '什麼都不必說 短片版', nameEn: "Nothing Left to Say — The Short Film",
      cat: 'short', family: 'film', icon: 'film', type: 'preorder', status: 'succeeded', goalMet: true, delivered: false,
      cover: IMG + 'nick-nsddd.jpg', poster: IMG + 'nick-nsddd.jpg',
      desc: { en: 'A twenty-minute short built around the song — pre-orders closed at target, now in final cut; buyers are waiting on the release.', zh: '以同名歌曲延伸的二十分鐘短片；預購已達標結束、正在定剪，預購者尚未收到交付。' },
      meta: { en: '900 / 900 pre-orders · $18 each · in final cut', zh: '900 / 900 筆預購 · 單價 $18 · 定剪中' },
      list: { goal: { en: '900 / 900', zh: '900 / 900 筆' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Publish the finished film', zh: '上架完成的作品' }
    },

    {
      /* 直接發佈型 MV（無版稅），與上面那筆募資型 MV 對照，補上 MV×直接發佈×已上線這一格樣本。
         2026-07-26 使用者：由原本的第二筆「帥到分手 MV」改成〈什麼都不必說〉，封面同步換成
         persona 素材庫的 single_2022-07-15_2022-remix.jpg。 */
      id: 'nick-sdfs-mv-live', created: '2025/08/22', name: '什麼都不必說', nameEn: "Nothing Left to Say",
      cat: 'mv', family: 'film', icon: 'film', type: 'go-live', status: 'live',
      /* 表現彙總用（自身 meta 已載明）*/
      perf: { usd: 5400, audience: 1900000, kind: 'views' },
      cover: IMG + 'nick-smdbbs.jpg', poster: IMG + 'nick-smdbbs.jpg',
      desc: { en: 'The official MV for 什麼都不必說 — self-funded, released straight to the channel.', zh: '〈什麼都不必說〉官方 MV，自費製作、直接上線頻道。' },
      meta: { en: 'US$5,400 lifetime · 1.9M views', zh: '累計 US$5,400 · 190 萬次觀看' },
      bar: null, todo: null
    },

    /* ── 其餘項目 ─────────────────────────────────────────────── */
    {
      id: 'nick-realive', created: '2023/01/10', fundFrom: '2023/01/20', name: 'REALIVE', nameEn: "REALIVE",
      /* meta 明寫「已交付」⇒ 新模型下是 live（succeeded 成為隨身徽章），不是 succeeded。 */
      cat: 'album', family: 'music', icon: 'music', type: 'fund', status: 'live', goalMet: true, delivered: true,
      /* 表現彙總用（meta 未載明，依募資規模給一致的示意值）*/
      perf: { usd: 18600, audience: 1450000, kind: 'streams' },
      cover: IMG + 'nick-realive.jpg', poster: IMG + 'nick-realive.jpg',
      desc: { en: 'The REALIVE EP tied to the arena tour — five tracks including GET REAL and 走三關.', zh: '與小巨蛋巡演同名的 EP，收錄 GET REAL、走三關等五軌。' },
      meta: { en: '$60,000 of $60,000 reached · delivered', zh: '$60,000 / $60,000 已達標 · 已交付' },
      fund: { raised: '$60,000', goal: '$60,000', backers: '1,580', pct: 100, left: { en: 'Co-creation closed', zh: '共創已結束' }, period: { en: 'Co-creation Jan 20 – Feb 10, 2023', zh: '共創期間 2023/01/20 – 02/10' } },
      list: { goal: { en: '$60,000 / $60,000', zh: '$60,000 / $60,000' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Post a backer update', zh: '發布支持者進度更新' }
    },
    {
      id: 'nick-real-life', created: '2021/12/01', name: 'REAL LIFE', nameEn: "REAL LIFE",
      cat: 'album', family: 'music', icon: 'music', type: 'go-live', status: 'live',
      /* 表現彙總用（自身 meta 已載明）*/
      perf: { usd: 42800, audience: 3600000, kind: 'streams' },
      cover: IMG + 'nick-real-life.jpg', poster: IMG + 'nick-real-life.jpg',
      desc: { en: 'The fourth studio album — ten C-pop / R&B tracks including 愛上你算我賤 and HEALTHY MIND.', zh: '第四張錄音室專輯，十軌華語 R&B，收錄〈愛上你算我賤〉〈HEALTHY MIND〉。' },
      meta: { en: 'US$42,800 lifetime · 3.6M streams', zh: '累計 US$42,800 · 360 萬次串流' },
      bar: null, todo: null
    },
    /* ✝ 2026-08-10 新增：nick persona 的「直接發佈 × 影片 × 準備中」樣本，
       理由同 default persona 的 elevator-14f 檔頭說明。 */
    {
      id: 'nick-onstage-film', created: '2026/07/30', name: 'ON STAGE 演唱會電影', nameEn: "ON STAGE — The Concert Film",
      cat: 'movie', family: 'film', icon: 'film', type: 'go-live', status: 'scheduled',
      cover: IMG + 'nick-i.jpg', poster: IMG + 'nick-i.jpg',
      desc: { en: 'The concert film is finished and goes straight to release — no campaign, no waiting on backers.', zh: '演唱會電影已完成，直接發佈上架；不走共創、不必等支持者。' },
      meta: { en: 'In review · goes live Sep 12', zh: '審核中 · 9/12 上映' },
      bar: null, todo: { en: 'Waiting on platform review', zh: '等待平台審核' }
    },
    {
      id: 'nick-flames', created: '2025/09/05', name: 'FLAMES', nameEn: "FLAMES",
      cat: 'mv', family: 'film', icon: 'film', type: 'go-live', status: 'scheduled',
      cover: IMG + 'nick-flames.jpg', poster: IMG + 'nick-flames.jpg',
      desc: { en: 'FLAMES — second single off LOVE RAGE HOPE. Official MV scheduled Sep 19.', zh: 'FLAMES，LOVE RAGE HOPE 第二主打；官方 MV 9/19 上線。' },
      meta: { en: 'Goes live Sep 19 · cover art uploaded', zh: '9/19 上線 · 封面已上傳' },
      bar: null, todo: { en: 'Set monetization', zh: '設定變現方式' }
    },
    {
      id: 'nick-ma-xing-wo', created: '2025/07/01', name: '罵醒我 (Reimagined)', nameEn: "Wake Me Up (Reimagined)",
      cat: 'song', family: 'music', icon: 'music', type: 'fund', status: 'draft',
      cover: IMG + 'nick-mxw.jpg', poster: IMG + 'nick-mxw.jpg',
      desc: { en: 'A reimagined take on 罵醒我 for LOVE RAGE HOPE — reward tiers still being shaped.', zh: '為 LOVE RAGE HOPE 重新詮釋的〈罵醒我〉；回饋方案規劃中。' },
      meta: { en: 'Created Jul 01, 2025', zh: '建立於 2025/07/01' },
      bar: null, todo: { en: 'Add showcase assets', zh: '補上展示素材' }
    },
    {
      id: 'nick-r2', created: '2024/09/01', fundFrom: '2024/10/05', name: 'REALIVE (R2) 特仕版演唱會', nameEn: "REALIVE (R2) Special Edition Concert",
      cat: 'event', family: 'other', icon: 'ticket', type: 'preorder', status: 'published', goalMet: false, delivered: false,
      cover: IMG + 'nick-r2.jpg', poster: IMG + 'nick-r2.jpg',
      desc: { en: 'motorola presents REALIVE (R2) — Taipei Arena, Nov 23–24, 2024. Full upgrade with 70+ stage looks.', zh: 'motorola 呈獻 REALIVE (R2) 特仕版，臺北小巨蛋 11/23–24；全面升級、逾 70 套舞台造型。' },
      meta: { en: '18,400 / 20,000 tickets · $95 each · 8 days left', zh: '18,400 / 20,000 張票 · 單價 $95 · 剩 8 天' },
      list: { goal: { en: '18,400 / 20,000', zh: '18,400 / 20,000 張' }, left: { en: '8 days left', zh: '剩 8 天' } },
      bar: { pct: 92 }, todo: { en: 'Confirm floor seating map', zh: '確認搖滾區座位圖' }
    },
    {
      id: 'nick-lwh-tour', created: '2025/08/15', fundFrom: '2025/09/01', name: 'LOVE·RAGE·HOPE Live House Tour', nameEn: "LOVE·RAGE·HOPE Live House Tour",
      cat: 'event', family: 'other', icon: 'ticket', type: 'preorder', status: 'published', goalMet: false, delivered: false,
      cover: IMG + 'nick-lwh.jpg', poster: IMG + 'nick-lwh.jpg',
      desc: { en: 'The album-concept live house tour — Taipei Legacy MAX / Kaohsiung / Taichung, Sep–Oct 2025.', zh: '圍繞新專輯概念的 Live House 巡演，台北 Legacy MAX／高雄／台中，2025/09–10。' },
      meta: { en: '1,240 / 1,600 tickets · $58 each · 12 days left', zh: '1,240 / 1,600 張票 · 單價 $58 · 剩 12 天' },
      list: { goal: { en: '1,240 / 1,600', zh: '1,240 / 1,600 張' }, left: { en: '12 days left', zh: '剩 12 天' } },
      bar: { pct: 78 }, todo: { en: 'Confirm venue seating map', zh: '確認場地座位圖' }
    },
    {
      id: 'nick-baipa-goods', created: '2022/10/20', name: 'REALIVE 白趴 官方周邊', nameEn: "REALIVE White Party — Official Merch",
      cat: 'merch', family: 'other', icon: 'shopping-bag', type: 'preorder', status: 'live', goalMet: true, delivered: true,
      cover: IMG + 'nick-baipa-goods.jpg', poster: IMG + 'nick-baipa-goods.jpg',
      desc: { en: 'The eight-piece REALIVE arena goods — tee, caps, coach jacket and towels, designed with Wish You A Good Life.', zh: 'REALIVE 白趴八項官方周邊，Tee、帽 Tee、教練外套、毛巾，與「祝你好命」共同設計。' },
      meta: { en: 'Released Oct 28 · 42,300 views · US$8,640 gross', zh: '10/28 上線 · 42,300 次瀏覽 · 毛收 US$8,640' },
      bar: null, todo: null
    },
    /* ── 2026-07-27 新增：補齊 succeeded／超募／cancelled 三個缺樣本的狀態 ── */
    {
      id: 'nick-lrh-vinyl', created: '2025/10/01', fundFrom: '2025/11/01', name: 'LOVE RAGE HOPE 黑膠典藏版', nameEn: "LOVE RAGE HOPE — Vinyl Collector’s Edition",
      cat: 'album', family: 'music', icon: 'music', type: 'fund', status: 'succeeded', goalMet: true, delivered: false,
      cover: IMG + 'nick-lrh.jpg', poster: IMG + 'nick-lrh.jpg',
      desc: { en: 'The deluxe vinyl pressing — funded and at the plant; backers have not received it yet.', zh: '豪華黑膠壓片版，共創已成立、正在壓片；支持者尚未收到。' },
      meta: { en: '$52,000 of $50,000 reached · at the pressing plant', zh: '$52,000 / $50,000 已達標 · 壓片中' },
      fund: { raised: '$52,000', goal: '$50,000', backers: '870', pct: 100, left: { en: 'Co-creation closed', zh: '共創已結束' }, period: { en: 'Co-creation Nov 01 – Dec 15, 2025', zh: '共創期間 2025/11/01 – 12/15' } },
      list: { goal: { en: '$52,000 / $50,000', zh: '$52,000 / $50,000' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Confirm vinyl shipping window', zh: '確認黑膠出貨時程' }
    },
    {
      id: 'nick-getreal-tee', created: '2026/06/01', fundFrom: '2026/07/01', name: 'GET REAL 聯名 Tee', nameEn: "GET REAL Collab Tee",
      cat: 'merch', family: 'other', icon: 'shopping-bag', type: 'preorder', status: 'published', goalMet: true, delivered: false,
      cover: IMG + 'nick-baipa-goods.jpg', poster: IMG + 'nick-baipa-goods.jpg',
      desc: { en: 'A collab tee already past target and still taking pre-orders — every extra unit is upside.', zh: '聯名 Tee 已超過目標、仍在接受預購；超出的每一件都是額外收益。' },
      meta: { en: '1,180 / 800 pre-orders · $42 each · 9 days left', zh: '1,180 / 800 筆預購 · 單價 $42 · 剩 9 天' },
      list: { goal: { en: '1,180 / 800', zh: '1,180 / 800 筆' }, left: { en: '9 days left', zh: '剩 9 天' } },
      bar: { pct: 100, variant: 'success' }, todo: { en: 'Confirm extra print run', zh: '確認追加印量' }
    },
    {
      id: 'nick-symphony', created: '2024/02/01', fundFrom: '2024/03/01', name: 'NICK 交響樂版演出', nameEn: "NICK Symphonic Live",
      cat: 'event', family: 'other', icon: 'ticket', type: 'fund', status: 'cancelled', goalMet: false, delivered: false,
      cover: IMG + 'nick-r2.jpg', poster: IMG + 'nick-r2.jpg',
      desc: { en: 'An orchestral reworking of the catalogue — the campaign missed its minimum and was refunded.', zh: '將作品重新編制為交響樂版本的演出；未達最低門檻，已全額退款。' },
      meta: { en: "$21,400 of $90,000 · didn't reach the minimum · refunded", zh: '$21,400 / $90,000 · 未達最低門檻 · 已全額退款' },
      list: { goal: { en: '$21,400 / $90,000', zh: '$21,400 / $90,000' } },
      bar: { pct: 24 }, todo: null
    }
  ];

  const DATASETS = {
    /* display ＝ 對「人」講話時用的名字（問候語、頭像縮寫），與 owner 分開。
       owner 是資料欄位（「創作者 X · 建立於…」），display 是招呼用的稱謂，
       兩者在中英文下的最佳寫法不同：周湯豪的英文是 Nick Chou（本名），
       NICKTHEREAL 是藝名——跟人打招呼不會叫藝名全稱。
       2026-07-28 使用者裁示：預設帳號的稱謂是 Gary。 */
    default: { owner: 'Gary Lin', display: { zh: 'Gary', en: 'Gary' }, projects: PROJECTS_DEFAULT },
    nick:    { owner: '周湯豪 NICKTHEREAL', display: { zh: '周湯豪', en: 'Nick Chou' }, projects: PROJECTS_NICK }
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

  /* cat → family（呈現層分組；音樂家族才顯示版稅分析區塊）。
     2026-07-24 使用者裁示：MV 歸影視家族（拍攝／製作屬性接近影視，非音樂發行本體）。 */
  const FAMILY = { movie: 'film', short: 'film', series: 'film', mv: 'film', song: 'music', album: 'music' };

  function dataset(personaId) { return DATASETS[personaId] || DATASETS.default; }

  /* ── 顯示標題 → 項目 ────────────────────────────────────────
     報表類頁面（粉絲分析的著作排行、收入管理的內容收益）拿到的是一個
     顯示用標題，要判斷「這件東西在平台上有沒有對應的項目」。用標題比對，
     不用一張手寫的對照表：對照表在切 persona 之後就會對不上（兩個 persona
     的作品完全不同），而標題本來就是同一份 i18n 字典餵出來的，比的是同一個字串。
     比不到＝這件東西沒有在平台建立項目（發行商報表匯入的曲目、專輯裡的單曲、
     前台貼文）。呼叫端據此顯示「未列為項目」並停用詳情連結，不要給一個點了會 404 的路徑。
     2026-08-10 從 audience-store 搬來這裡：判定依據是項目清單，本來就該住在項目 store，
     兩頁共用同一份實作才不會有一頁認得、另一頁不認得的情況。 */
  function projectFor(title) {
    if (!title) return null;
    const t = String(title).trim();
    return active().projects.find(p =>
      (p.name && p.name.trim() === t) || (p.nameEn && p.nameEn.trim() === t)) || null;
  }

  /* ── 這個項目有沒有版稅分頁 ────────────────────────────────
     版稅＝股份分潤的產物，只有共創型項目有股份（2026-07-25 使用者裁決），
     而且要作品已上線（live＝已交付、正在賺錢）才會有第一筆版稅。
     完整推導寫在 project-detail.html 的版稅分頁註解。
     2026-08-10 抽成共用判斷：收入管理的作品榜要決定連結要不要帶 `#royalty`，
     判斷條件與 project-detail 必須是同一條——各寫一份就會出現「這裡說有、
     點過去卻沒有那個分頁」。 */
  function hasRoyalty(p) { return !!p && p.type === 'fund' && p.status === 'live'; }

  window.ztorProjects = {
    list: () => active().projects.slice(),
    projectFor: projectFor,
    hasRoyalty: hasRoyalty,
    get: id => active().projects.find(p => p.id === id) || null,
    first: () => active().projects[0],
    owner: () => active().owner,
    /* 指名資料集查（2026-08-07）。給的是「不是目前這位創作者」的頁面用——影片上架
       審核頁一次看全平台的送審件，四筆分屬不同創作者，用 get() 查只會查到目前人格
       那一批、其餘一律 null。呼叫端要自己知道這一筆屬於誰（審核件有 persona 欄）。 */
    getIn: (personaId, id) => dataset(personaId).projects.find(p => p.id === id) || null,
    ownerIn: personaId => dataset(personaId).owner,
    /* 稱謂。依目前語系回傳；缺 display 就退回 owner，不會變成空字串。 */
    displayName: () => {
      const a = active();
      const zh = (document.documentElement.lang || '').toLowerCase().indexOf('zh') === 0;
      return (a.display && (zh ? a.display.zh : a.display.en)) || a.owner;
    },
    catLabel: cat => CAT_LABEL[cat] || { en: cat, zh: cat },
    /* 2026-07-28 使用者裁示：英文版要看到英文片名／歌名。作品名沿用 catLabel 的雙語物件
       形狀，英文缺漏時回退中文原名（本來就是英文的如 REALIVE 兩邊同值）。 */
    nameLabel: p => ({ en: (p && (p.nameEn || p.name)) || '', zh: (p && p.name) || '' }),
    family: cat => FAMILY[cat] || 'other'
  };
})();
