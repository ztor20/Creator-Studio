/* work-review-store.js · 作品送審件的單一來源（2026-08-07）
   ------------------------------------------------------------------
   規格：documents/5.1.0.4-影片上架審核.md（審核頁權威）、
        documents/5.1.2.2.1-作品上架流程.md §3.3、
        documents/5.1.2.2-專案詳情.md §2.2.9、主規格 §7.2「作品審核」列。

   為什麼要有這支：一件送審作品會被三個頁面各看一眼——創作者在上架流程送出
   （publish-work）、創作者在項目詳情看結果（project-detail）、Admin 在審核頁
   裁決（admin-video-review）。三頁如果各自寫一份狀態字彙與流轉規則，站上就會
   出現三種「待審核」。所以狀態機、字彙與流轉只寫在這裡，三頁都只呼叫它。

   狀態枚舉照主規格 §7.2 作品審核列，不自創：
     draft（草稿，尚未送出，不進審核清單）
     pending（待審核）→ inreview（審核中）→ approved（審核通過）／rejected（審核不通過）
     rejected 之後創作者修改重送 ⇒ 回到 pending，送出次數 +1。

   審核通過的那一刻才一次完成三件事（作品上架、發布完成作品更新、項目
   Succeeded → Live）。本檔只負責記錄「通過了」與「該發哪一則貼文」；
   三件事的畫面呈現由 project-detail 自己執行（狀態徽章與更新清單都在那一頁）。

   落地方式：localStorage（原型 demo）。真實系統由後端持有，本檔的 API 形狀
   刻意做成「換成 fetch 也不用改呼叫端」。清空 demo 資料：ztorWorkReview.reset()。
   ------------------------------------------------------------------ */
(function () {
  'use strict';

  /* v2（2026-08-07）：每一筆多了 persona 欄位。留在 v1 的話，之前開過站的瀏覽器會
     帶著沒有 persona 的舊資料，來源項目連結就少了創作者身分——欄位形狀變了就換
     鍵名，讓舊資料自然被新種子取代，不寫遷移程式。 */
  /* v3（2026-08-17）：種子多了十筆（直接發佈影片的送審件與新增示範項目的送審件）。
     內容變了就換鍵名，讓之前開過站的瀏覽器自然吃到新種子，不寫遷移程式——同 v2 的做法。 */
  /* v4（2026-08-17 下午）：退件那一筆改掛已成功的項目（落差 L5），另補一筆文檔類的
     直接發佈送審件（落差 L2 把文檔歸回影片家族之後才成立）。同上，換鍵名取代遷移。 */
  /* v5（2026-08-19）：假資料盤查修復——補 nick-ni-shuo 的送審件（A11）、旺角狙擊
     上映日改 06/28 留出製作期（B11）。同上，換鍵名取代遷移。 */
  var LS = 'ztor.workReview.v5';

  /* 狀態字彙：中英各一份，站上任何頁都從這裡拿，不各自寫死。
     tone 對應 badge.css 的既有語意色，讓審核狀態與站上其他狀態徽章同一套配色。 */
  var STATUS = {
    draft:    { en: 'Draft',          zh: '草稿',     tone: 'badge--neutral', icon: 'file-text' },
    pending:  { en: 'Pending review', zh: '待審核',   tone: 'badge--info',    icon: 'clock' },
    inreview: { en: 'In review',      zh: '審核中',   tone: 'badge--warning', icon: 'eye' },
    approved: { en: 'Approved',       zh: '審核通過', tone: 'badge--success', icon: 'check-circle' },
    rejected: { en: 'Rejected',       zh: '審核不通過', tone: 'badge--error', icon: 'x-circle' }
  };
  /* 待處理＝還沒有結果的兩態。清單排序與計數都靠它，不要在頁面上再列一次。 */
  var OPEN = ['pending', 'inreview'];

  function zh() { return (document.documentElement.lang || '').toLowerCase().indexOf('zh') === 0; }

  function read() {
    try {
      var raw = localStorage.getItem(LS);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) return parsed.items;
      }
    } catch (e) {}
    return null;
  }
  function write(items) {
    try { localStorage.setItem(LS, JSON.stringify({ items: items })); } catch (e) {}
    document.dispatchEvent(new CustomEvent('ztor:work-review-changed'));
  }

  /* ── demo 種子 ─────────────────────────────────────────────────────
     沒有種子的話，Admin 第一次進審核頁只會看到空狀態，沒辦法走「通過／退件」
     兩條路徑。四筆涵蓋清單需要呈現的四種狀態，其中一筆是重送件（送出次數 2），
     用來示範送審歷程要讓審核者看到上一次為什麼被退。
     封面用站上既有的項目圖檔（不另外準備素材，也不會 404）。
     projectId 指向 projects-store 的既有項目；審核通過會影響那個項目的狀態顯示。

     persona ＝這件作品屬於哪一位創作者（2026-08-07 補）。審核佇列是全平台的，
     四筆分屬兩位創作者，而項目 demo 資料是逐創作者一份的——沒有這個欄位，
     「來源項目」的連結就只能用目前這位創作者的資料去查別人的項目 id，查不到。
     值域對齊 projects-store 的資料集鍵（default＝Gary Lin、nick＝周湯豪）。
     ⚠ 這是原型的資料分身機制，不是產品欄位：真實系統的送審件本來就帶著創作者
        帳號，不需要前端記一個資料集名稱。見 ASSUMPTIONS。 */
  function seed() {
    var IMG = 'images/projects/';
    return [
      {
        id: 'wr-1001',
        projectId: 'nick-lrh-doc',
        persona: 'nick',
        creator: '周湯豪 NICKTHEREAL',
        cover: IMG + 'nick-lrh-tour.jpg',
        title: { zh: 'LOVE·RAGE·HOPE 巡演紀錄片', en: 'LOVE·RAGE·HOPE — Tour Documentary' },
        projectName: { zh: 'LOVE·RAGE·HOPE 巡演紀錄片', en: 'LOVE·RAGE·HOPE — Tour Documentary' },
        status: 'pending',
        submittedAt: '2026-08-05 14:20',
        count: 1,
        reviewer: '',
        decidedAt: '',
        reason: '',
        post: { title: '紀錄片完成了，感謝每一位支持者', audience: 'pd-edit.update.aud-backers' },
        work: demoWork({
          file: 'lrh-tour-doc_master_4k.mov', audio: 'pw.lang.cmn',
          zhTitle: 'LOVE·RAGE·HOPE 巡演紀錄片', zhDesc: '跟拍三城 Live House 巡演的長片紀錄片，從排練室走到最後一場安可。',
          enTitle: 'LOVE·RAGE·HOPE — Tour Documentary', enDesc: 'A feature-length look at the three-city live house tour, from the rehearsal room to the final encore.',
          subs: [['pw.lang.zh', 'lrh_zh-hant.srt'], ['pw.lang.en', 'lrh_en.srt']],
          stills: 4, bts: 2, runtime: '01:42:00', release: '2026/09/12',
          genres: ['pw.genre.documentary', 'pw.genre.music'], age: 'pw.age.all',
          paid: true, currency: 'HKD'
        }),
        history: [{ at: '2026-08-05 14:20', action: 'submit', by: '', reason: '' }]
      },
      {
        id: 'wr-1002',
        projectId: 'pirate-queen-s2',
        persona: 'default',
        creator: 'Gary Lin',
        cover: IMG + 'pirate-queen-zheng-yi-sao-card.webp',
        title: { zh: '海上霸姬 第二季', en: 'Pirate Queen — Season Two' },
        projectName: { zh: '海上霸姬 第二季', en: 'Pirate Queen — Season Two' },
        status: 'inreview',
        submittedAt: '2026-08-04 09:05',
        count: 2,
        reviewer: 'ztor Ops · Ivy',
        decidedAt: '',
        reason: '',
        post: { title: '第二季完成，支持者搶先看', audience: 'pd-edit.update.aud-backers' },
        work: demoWork({
          file: 'pirate-queen-s2_master.mp4', audio: 'pw.lang.yue',
          zhTitle: '海上霸姬 第二季', zhDesc: '鄭一嫂統領七萬眾之後，真正的難題才開始。',
          enTitle: 'Pirate Queen — Season Two', enDesc: 'Commanding seventy thousand was the easy part. Holding them together is not.',
          subs: [['pw.lang.zh', 'pq-s2_zh-hant.srt']],
          stills: 6, bts: 1, runtime: '00:48:30', release: '2026/08/30',
          genres: ['pw.genre.drama', 'pw.genre.adventure'], age: 'pw.age.13',
          paid: true, currency: 'HKD'
        }),
        history: [
          { at: '2026-07-28 11:12', action: 'submit', by: '', reason: '' },
          { at: '2026-07-29 16:40', action: 'reject', by: 'ztor Ops · Ivy', reason: '封面圖比例不符 750 × 1125，前台版位會被裁掉字幕。請重新輸出後重送。' },
          { at: '2026-08-04 09:05', action: 'submit', by: '', reason: '' },
          { at: '2026-08-04 10:02', action: 'start', by: 'ztor Ops · Ivy', reason: '' }
        ]
      },
      {
        /* 2026-08-17：這一筆原本掛在 `dragon-tiger-gate`（預購、進行中）。送審的前置條件
           是項目已成功，所以那個組合在同一頁上會自相矛盾——作品區塊給一顆可按的
           「修改後重送」，發文彈窗卻說要等項目成功（矩陣盤點落差 L5）。改掛同為預購、
           狀態已成功的 `north-point-rain`，兩個入口才講同一句話；`dragon-tiger-gate`
           回到「預購 × 進行中 × 影片、還沒送過審」的正常樣本。 */
        id: 'wr-1003',
        projectId: 'north-point-rain',
        persona: 'default',
        creator: 'Gary Lin',
        cover: IMG + 'ruguo-wo-keyi-dongmian.webp',
        title: { zh: '北角的雨', en: 'Rain Over North Point' },
        projectName: { zh: '北角的雨', en: 'Rain Over North Point' },
        status: 'rejected',
        submittedAt: '2026-08-01 18:44',
        count: 1,
        reviewer: 'ztor Ops · Ray',
        decidedAt: '2026-08-02 10:15',
        reason: '年齡限制填「全部」，但片中有明顯暴力場面。請改為 16 歲以上後重送。',
        post: { title: '北角的雨完成了', audience: 'pd-edit.update.aud-backers' },
        work: demoWork({
          file: 'north-point-rain_master.mp4', audio: 'pw.lang.yue',
          zhTitle: '北角的雨', zhDesc: '一場雨下了三天，債主、警察與一個沒人記得的證人堵在同一條街上。',
          enTitle: 'Rain Over North Point', enDesc: 'Three days of rain, one street, and everyone who owes someone else.',
          subs: [['pw.lang.zh', 'npr_zh-hant.srt'], ['pw.lang.en', 'npr_en.srt']],
          stills: 3, bts: 0, runtime: '01:56:00', release: '2026/09/01',
          genres: ['pw.genre.action', 'pw.genre.crime'], age: 'pw.age.all',
          paid: true, currency: 'HKD'
        }),
        history: [
          { at: '2026-08-01 18:44', action: 'submit', by: '', reason: '' },
          { at: '2026-08-02 09:30', action: 'start', by: 'ztor Ops · Ray', reason: '' },
          { at: '2026-08-02 10:15', action: 'reject', by: 'ztor Ops · Ray', reason: '年齡限制填「全部」，但片中有明顯暴力場面。請改為 16 歲以上後重送。' }
        ]
      },
      {
        id: 'wr-1004',
        projectId: 'mong-kok-shootout',
        persona: 'default',
        creator: 'Gary Lin',
        cover: IMG + 'mong-kok-shootout-card.webp',
        title: { zh: '旺角狙擊', en: 'Mong Kok Sniper' },
        projectName: { zh: '旺角狙擊', en: 'Mong Kok Sniper' },
        status: 'approved',
        submittedAt: '2026-05-09 13:00',
        count: 1,
        reviewer: 'ztor Ops · Ivy',
        decidedAt: '2026-05-10 11:20',
        reason: '',
        /* 這一件是「早就審完也早就上線」的歷史紀錄，三件事在過去已經發生過；
           標成已播出，項目詳情才不會今天再補發一次貼文。 */
        released: true,
        post: { title: '旺角狙擊正式上線', audience: 'pd-edit.update.aud-everyone' },
        work: demoWork({
          file: 'mongkok_master.mp4', audio: 'pw.lang.yue',
          zhTitle: '旺角狙擊', zhDesc: '24 小時內必須結案的綁架案，菜鳥談判專家對上失蹤十年的師父。',
          enTitle: 'Mong Kok Sniper', enDesc: 'A rookie negotiator has 24 hours to close a kidnapping — against the mentor who vanished ten years ago.',
          subs: [['pw.lang.zh', 'mk_zh-hant.srt']],
          /* 2026-08-19（B11）：上映日由 2026/05/10 改 06/28——共創期迄日也是 05/10，
             募資結束當天就上映等於片在募資期間早已拍完，改成留出製作期。 */
          stills: 4, bts: 1, runtime: '02:04:00', release: '2026/06/28',
          genres: ['pw.genre.crime', 'pw.genre.thriller'], age: 'pw.age.16',
          paid: true, currency: 'HKD'
        }),
        history: [
          { at: '2026-05-09 13:00', action: 'submit', by: '', reason: '' },
          { at: '2026-05-10 09:40', action: 'start', by: 'ztor Ops · Ivy', reason: '' },
          { at: '2026-05-10 11:20', action: 'approve', by: 'ztor Ops · Ivy', reason: '' }
        ]
      }
    ].concat(EXTRA_SEED());
  }

  /* ── 2026-08-17 補的送審件 ──────────────────────────────────────────
     兩批，理由不同：
     (1) **直接發佈 × 影片家族的既有項目**。規格 5.1.2.2 §2.2.11 與主規格 §7.2 都寫
         這條路徑在建立流程送出當下就送審（作品上架段已內嵌在建立流程），站上卻
         一筆送審紀錄都沒有——創作者因此看不到任何審核進度，作品區段也長不出來
         （矩陣盤點落差 L1）。補上之後，那幾筆項目的畫面才跟它們自己的狀態一致。
     (2) **2026-08-17 補進 projects-store 的缺樣本**裡，要有送審件才成立的那幾筆
         （準備中＝審核通過但上映日未到；已上線＝審核通過且上映日已到）。
     直接發佈沒有「完成作品發文」那則貼文（D182 第 9 題），所以那幾筆的 post 留空。
     欄位形狀與上面四筆手寫的完全相同，只是改用 demoRec() 少抄一點。 */
  function EXTRA_SEED() {
    return [
      /* ── (1) 直接發佈 × 影片：建立流程送出＝送審 ── */
      demoRec({
        id: 'wr-1201', projectId: 'elevator-14f', persona: 'default', cover: 'elevator-14f-card.webp',
        zh: '十四樓的電梯', en: 'The Lift on Fourteen', status: 'inreview',
        at: '2026-08-08 10:12', reviewer: 'ztor Ops · Ray',
        file: 'lift14_master.mp4', audio: 'pw.lang.yue', runtime: '01:38:00', release: '2026/09/05',
        zhDesc: '整部戲都在同一棟九龍舊樓拍完的長片。', enDesc: 'A feature shot entirely inside one Kowloon housing block.',
        genres: ['pw.genre.drama'], age: 'pw.age.13'
      }),
      demoRec({
        id: 'wr-1202', projectId: 'moonlight-mv', persona: 'default', cover: 'cc-video-1.jpg',
        zh: '深水埗的月光 主題曲 MV', en: 'Moonlight Over Sham Shui Po — Theme (MV)', status: 'pending',
        at: '2026-08-14 16:30',
        file: 'moonlight-mv_master.mp4', audio: 'pw.lang.cmn', runtime: '00:04:20', release: '2026/12/01',
        zhDesc: '主題曲 MV，與短片共用同一組夜市場景拍攝。', enDesc: 'The title-track music video, shot on the short film’s night-market set.',
        genres: ['pw.genre.music'], age: 'pw.age.all'
      }),
      demoRec({
        id: 'wr-1203', projectId: 'pirate-queen', persona: 'default', cover: 'pirate-queen-zheng-yi-sao-card.webp',
        zh: '海上霸姬鄭一嫂', en: 'Ching Shih: Pirate Queen', status: 'approved',
        at: '2026-03-18 09:40', reviewer: 'ztor Ops · Ivy', decidedAt: '2026-03-20 14:05',
        file: 'pirate-queen_master.mp4', audio: 'pw.lang.yue', runtime: '00:46:00', release: '2026/03/28',
        zhDesc: '清朝真實女海盜傳奇，從舞女到統領七萬眾的海上霸主。', enDesc: 'From dance-hall girl to commander of seventy thousand.',
        genres: ['pw.genre.drama', 'pw.genre.adventure'], age: 'pw.age.13'
      }),
      demoRec({
        id: 'wr-1204', projectId: 'nick-onstage-film', persona: 'nick', cover: 'nick-i.jpg',
        zh: 'ON STAGE 演唱會電影', en: 'ON STAGE — The Concert Film', status: 'inreview',
        at: '2026-08-09 11:05', reviewer: 'ztor Ops · Ivy',
        file: 'onstage_master_4k.mov', audio: 'pw.lang.cmn', runtime: '01:52:00', release: '2026/09/12',
        zhDesc: '演唱會電影，收錄全場與後台。', enDesc: 'The full concert plus everything backstage.',
        genres: ['pw.genre.music', 'pw.genre.documentary'], age: 'pw.age.all'
      }),
      demoRec({
        id: 'wr-1205', projectId: 'nick-flames', persona: 'nick', cover: 'nick-flames.jpg',
        zh: 'FLAMES', en: 'FLAMES', status: 'pending',
        at: '2026-08-15 09:22',
        file: 'flames_master.mp4', audio: 'pw.lang.cmn', runtime: '00:03:48', release: '2026/09/19',
        zhDesc: 'LOVE RAGE HOPE 第二主打的官方 MV。', enDesc: 'The official MV for the album’s second single.',
        genres: ['pw.genre.music'], age: 'pw.age.all'
      }),
      demoRec({
        id: 'wr-1206', projectId: 'nick-sdfs-mv-live', persona: 'nick', cover: 'nick-smdbbs.jpg',
        zh: '什麼都不必說', en: 'Nothing Left to Say', status: 'approved',
        at: '2025-08-25 13:30', reviewer: 'ztor Ops · Ray', decidedAt: '2025-08-27 10:00',
        file: 'nsddd-mv_master.mp4', audio: 'pw.lang.cmn', runtime: '00:04:36', release: '2025/09/05',
        zhDesc: '〈什麼都不必說〉官方 MV，自費製作、直接上線。', enDesc: 'The official MV, self-funded and released straight to the channel.',
        genres: ['pw.genre.music'], age: 'pw.age.all'
      }),
      /* 文檔類（幕後紀錄）。2026-08-17 把 document 歸回影片家族之後（落差 L2），這一筆
         走的是與上面幾筆直接發佈影片相同的路徑，卻是唯一沒有送審件的——沒有送審件
         就長不出作品區塊，看起來像文檔類仍被排除在外。 */
      demoRec({
        id: 'wr-1207', projectId: 'pirate-queen-doc', persona: 'default', cover: 'pirate-queen-zheng-yi-sao-card.webp',
        zh: '海上霸姬 幕後紀錄', en: 'Pirate Queen — Behind the Scenes', status: 'approved',
        /* 上映日期對齊項目自己的 `releaseDate`（2026/02/11）：D180 說兩者是同一份資料，
           影片家族由送審件當出口，對不上會讓發布時程卡與項目資料各說一個日期。 */
        at: '2026-01-28 15:10', reviewer: 'ztor Ops · Ray', decidedAt: '2026-01-30 10:30',
        file: 'pq-bts_master.mp4', audio: 'pw.lang.yue', runtime: '00:38:00', release: '2026/02/11',
        zhDesc: '海上戲的拍攝紀錄，從搭船到最後一場戲。', enDesc: 'The making of the sea sequences, from the first boat call to the final shot.',
        genres: ['pw.genre.documentary'], age: 'pw.age.all'
      }),

      /* ── (2) 2026-08-17 新增示範項目要用到的送審件 ── */
      demoRec({
        id: 'wr-1101', projectId: 'harbour-lights', persona: 'default', cover: 'mong-kok-shootout-card.webp',
        zh: '維港燈火', en: 'Harbour Lights', status: 'approved',
        at: '2026-07-30 15:10', reviewer: 'ztor Ops · Ivy', decidedAt: '2026-08-02 11:40',
        file: 'harbour-lights_master.mp4', audio: 'pw.lang.yue', runtime: '01:47:00', release: '2026/12/18',
        zhDesc: '一個渡輪世家的三代人，故事收在同一個冬天。', enDesc: 'Three generations of a ferry family, told across one winter.',
        genres: ['pw.genre.drama'], age: 'pw.age.all',
        post: { title: '維港燈火完成了，12/18 上映', audience: 'pd-edit.update.aud-backers' }
      }),
      demoRec({
        id: 'wr-1102', projectId: 'victoria-noir', persona: 'default', cover: 'anyong-qingshi.webp',
        zh: '維多利亞的暗面', en: 'Victoria Noir', status: 'pending',
        at: '2026-08-13 20:05',
        file: 'victoria-noir_master.mp4', audio: 'pw.lang.yue', runtime: '01:29:00', release: '2026/08/09',
        zhDesc: '深夜電台主持人開始在節目上唸聽眾的告解。', enDesc: 'A late-night radio host starts reading listeners’ confessions on air.',
        genres: ['pw.genre.crime', 'pw.genre.thriller'], age: 'pw.age.16',
        post: { title: '維多利亞的暗面完成了', audience: 'pd-edit.update.aud-backers' }
      }),
      demoRec({
        id: 'wr-1103', projectId: 'pirate-queen-shorts', persona: 'default', cover: 'pirate-queen-zheng-yi-sao-card.webp',
        zh: '海上霸姬 番外短篇', en: 'Pirate Queen — Side Stories', status: 'approved',
        at: '2026-06-02 10:20', reviewer: 'ztor Ops · Ray', decidedAt: '2026-06-04 09:15',
        file: 'pq-shorts_master.mp4', audio: 'pw.lang.yue', runtime: '00:32:00', release: '2026/06/20',
        zhDesc: '從影集剪出來的三則番外。', enDesc: 'Three side stories cut from the series.',
        genres: ['pw.genre.adventure'], age: 'pw.age.13',
        post: { title: '番外短篇上線了', audience: 'pd-edit.update.aud-everyone' }
      }),
      /* 2026-08-19 補（盤查 A11）：nick-ni-shuo 是共創 MV、status=live——影視家族走到
         已上線必經審核通過，卻是唯一沒有送審件的，總覽作品卡與進度的完成作品節點
         因此長不出來。格式比照 wr-1206；上映日 2024/08/20，裁決日早於上映日。 */
      demoRec({
        id: 'wr-1208', projectId: 'nick-ni-shuo', persona: 'nick', cover: 'nick-sdfs.jpg',
        zh: '帥到分手 MV', en: 'Too Handsome to Stay (MV)', status: 'approved',
        at: '2024-08-10 11:20', reviewer: 'ztor Ops · Ivy', decidedAt: '2024-08-12 15:40',
        file: 'sdfs-mv_master.mp4', audio: 'pw.lang.cmn', runtime: '00:04:52', release: '2024/08/20',
        zhDesc: '共創拍攝的電影感 MV，35mm 底片一鏡到底。', enDesc: 'A crowdfunded cinematic MV shot on 35mm, in one take.',
        genres: ['pw.genre.music'], age: 'pw.age.all'
      }),
      demoRec({
        id: 'wr-1104', projectId: 'nick-rlh-live-film', persona: 'nick', cover: 'nick-lrh-tour.jpg',
        zh: 'LOVE·RAGE·HOPE 巡演實錄電影', en: 'LOVE·RAGE·HOPE — Tour Film', status: 'approved',
        at: '2026-07-18 14:00', reviewer: 'ztor Ops · Ivy', decidedAt: '2026-07-21 16:25',
        file: 'lrh-tour-film_master_4k.mov', audio: 'pw.lang.cmn', runtime: '01:58:00', release: '2026/11/07',
        zhDesc: '把巡演最後一夜剪成長片。', enDesc: 'The final night of the tour, cut into a feature.',
        genres: ['pw.genre.music', 'pw.genre.documentary'], age: 'pw.age.all',
        post: { title: '巡演實錄電影完成了，11/07 上映', audience: 'pd-edit.update.aud-backers' }
      })
    ];
  }

  /* 送審件的通用建構子。status 決定歷程有幾筆：待審核＝只有送出，審核中＝送出＋接手，
     審核通過＝送出＋接手＋通過。已通過的一律標 released——這些是「早就審完」的歷史
     紀錄，不標的話項目詳情會今天再補發一次貼文（同 wr-1004 的既有做法）。 */
  function demoRec(o) {
    var hist = [{ at: o.at, action: 'submit', by: '', reason: '' }];
    if (o.status === 'inreview' || o.status === 'approved') hist.push({ at: o.at, action: 'start', by: o.reviewer || '', reason: '' });
    if (o.status === 'approved') hist.push({ at: o.decidedAt || o.at, action: 'approve', by: o.reviewer || '', reason: '' });
    return {
      id: o.id,
      projectId: o.projectId,
      persona: o.persona,
      creator: o.persona === 'nick' ? '周湯豪 NICKTHEREAL' : 'Gary Lin',
      cover: 'images/projects/' + o.cover,
      title: { zh: o.zh, en: o.en },
      projectName: { zh: o.zh, en: o.en },
      status: o.status,
      submittedAt: o.at,
      count: 1,
      reviewer: o.reviewer || '',
      decidedAt: o.decidedAt || '',
      reason: '',
      released: o.status === 'approved',
      post: o.post || null,
      work: demoWork({
        file: o.file, audio: o.audio,
        zhTitle: o.zh, zhDesc: o.zhDesc, enTitle: o.en, enDesc: o.enDesc,
        subs: [['pw.lang.zh', o.id + '_zh-hant.srt']],
        stills: 4, bts: 1, runtime: o.runtime, release: o.release,
        genres: o.genres, age: o.age, paid: true, currency: 'HKD'
      }),
      history: hist
    };
  }

  /* 送審內容（F3 檢視範圍）的示意資料。欄位順序＝上架流程四個步驟的順序，
     審核者照原流程順序看完，不必自己對照。 */
  function demoWork(o) {
    return {
      file: { name: o.file, state: 'ready' },
      audio: o.audio,
      subs: (o.subs || []).map(function (s) { return { lang: s[0], name: s[1] }; }),
      cover: true,
      stills: o.stills,
      bts: o.bts,
      trailer: o.file.replace(/_master.*$/, '') + '_trailer.mp4',
      copy: [
        { lang: 'pw.lang.zh', title: o.zhTitle || '', desc: o.zhDesc || '' },
        { lang: 'pw.lang.enName', title: o.enTitle || '', desc: o.enDesc || '' }
      ],
      runtime: o.runtime,
      release: o.release,
      genres: o.genres,
      tags: [],
      age: o.age,
      paid: o.paid,
      currency: o.currency,
      qualities: o.paid ? [
        { name: '4K', price: '68', popcorn: '980', rent: '30', watch: '2' },
        { name: 'HD-1080P', price: '48', popcorn: '680', rent: '30', watch: '2' },
        { name: 'SD-720P', price: '38', popcorn: '520', rent: '30', watch: '2' }
      ] : [],
      credits: []
    };
  }

  function items() {
    var got = read();
    if (got) return got;
    var s = seed();
    write(s);
    return s;
  }
  function save(list) { write(list); }
  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function now() {
    var d = new Date(), p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  /* 目前是哪一位創作者在操作（單一真相在 js/theme.js 的 seedPersona()）。 */
  function currentPersona() {
    return (typeof window.ztorPersonaId === 'function') ? window.ztorPersonaId() : 'default';
  }

  window.ztorWorkReview = {
    STATUS: STATUS,
    OPEN: OPEN.slice(),

    list: function () { return items().slice(); },
    get: function (id) { return find(items(), id); },
    /* 這一筆屬於哪一位創作者。舊資料或外部送進來的紀錄沒填時退回目前這位——
       退路只影響原型呈現，不會讓別人的項目被端出來（查不到就是查不到）。 */
    personaOf: function (rec) { return (rec && rec.persona) || currentPersona(); },

    /* 一個項目最多只有一件在途的送審作品——重送是同一件的第 n 次，不是新開一件。 */
    forProject: function (projectId) {
      var list = items();
      for (var i = 0; i < list.length; i++) if (list[i].projectId === projectId) return list[i];
      return null;
    },

    label: function (status) {
      var s = STATUS[status];
      return s ? (zh() ? s.zh : s.en) : '';
    },
    tone: function (status) { return (STATUS[status] || {}).tone || 'badge--neutral'; },
    icon: function (status) { return (STATUS[status] || {}).icon || 'circle'; },
    isOpen: function (status) { return OPEN.indexOf(status) >= 0; },
    counts: function () {
      var list = items(), c = { all: list.length, pending: 0, inreview: 0, approved: 0, rejected: 0 };
      list.forEach(function (r) { if (c[r.status] != null) c[r.status]++; });
      return c;
    },

    /* 送出（創作者端）：草稿 → 待審核。同一個項目已有紀錄就是重送，送出次數 +1。 */
    submit: function (payload) {
      var list = items();
      var rec = null;
      for (var i = 0; i < list.length; i++) if (list[i].projectId === payload.projectId) { rec = list[i]; break; }
      var at = now();
      if (!rec) {
        rec = {
          id: 'wr-' + Date.now(),
          projectId: payload.projectId,
          persona: payload.persona || currentPersona(),
          creator: payload.creator || '',
          cover: payload.cover || '',
          title: payload.title || { zh: '', en: '' },
          projectName: payload.projectName || payload.title || { zh: '', en: '' },
          count: 0,
          history: []
        };
        list.unshift(rec);
      }
      rec.persona = payload.persona || rec.persona || currentPersona();
      rec.creator = payload.creator || rec.creator;
      rec.cover = payload.cover || rec.cover;
      rec.title = payload.title || rec.title;
      rec.projectName = payload.projectName || rec.projectName;
      rec.post = payload.post || rec.post || {};
      rec.work = payload.work || rec.work || {};
      rec.status = 'pending';
      rec.submittedAt = at;
      rec.count = (rec.count || 0) + 1;
      rec.reviewer = '';
      rec.decidedAt = '';
      rec.reason = '';
      rec.history = (rec.history || []).concat([{ at: at, action: 'submit', by: '', reason: '' }]);
      save(list);
      return rec;
    },

    /* 編輯已上架作品，但這次的變更不需要重新送審（規格 5.1.2.2 §2.2.11 的分界：
       文案、標籤、演職名單屬維護，不改變作品本體與交易條件）。內容換掉、審核狀態
       與送出次數都不動；歷程留一筆 edit，讓審核者看得出這件在通過之後被改過什麼時候。 */
    saveWork: function (projectId, work) {
      var list = items(), rec = null;
      for (var i = 0; i < list.length; i++) if (list[i].projectId === projectId) { rec = list[i]; break; }
      if (!rec) return null;
      var at = now();
      rec.work = work || rec.work;
      rec.editedAt = at;
      rec.history = (rec.history || []).concat([{ at: at, action: 'edit', by: '', reason: '' }]);
      save(list);
      return rec;
    },

    /* 接手審核：待審核 → 審核中，記下審核者（F4）。 */
    start: function (id, reviewer) {
      var list = items(), rec = find(list, id);
      if (!rec || rec.status !== 'pending') return rec;
      var at = now();
      rec.status = 'inreview';
      rec.reviewer = reviewer || '';
      rec.history.push({ at: at, action: 'start', by: rec.reviewer, reason: '' });
      save(list);
      return rec;
    },

    /* 審核通過：終態。三件事的執行由 project-detail 讀 pendingRelease() 後補做。 */
    approve: function (id, reviewer) {
      var list = items(), rec = find(list, id);
      if (!rec || (rec.status !== 'pending' && rec.status !== 'inreview')) return rec;
      var at = now();
      rec.status = 'approved';
      rec.reviewer = reviewer || rec.reviewer || '';
      rec.decidedAt = at;
      rec.reason = '';
      rec.released = false;   /* 三件事還沒在創作者那一頁播出來 */
      rec.history.push({ at: at, action: 'approve', by: rec.reviewer, reason: '' });
      save(list);
      return rec;
    },

    /* 審核不通過：退回創作者並附退件理由（必填）。 */
    reject: function (id, reason, reviewer) {
      var list = items(), rec = find(list, id);
      if (!rec || (rec.status !== 'pending' && rec.status !== 'inreview')) return rec;
      if (!String(reason || '').trim()) return rec;
      var at = now();
      rec.status = 'rejected';
      rec.reviewer = reviewer || rec.reviewer || '';
      rec.decidedAt = at;
      rec.reason = String(reason).trim();
      rec.history.push({ at: at, action: 'reject', by: rec.reviewer, reason: rec.reason });
      save(list);
      return rec;
    },

    /* 項目狀態覆寫：審核通過之後這個項目應該是哪一個狀態。projects-store 是純記憶體
       資料（重整還原），所以「已經通過的那些項目」要靠這裡記住，否則創作者
       重新整理項目詳情又會看回已成功。

       **落點看上映日期，不是一律 Live**（主規格 §7.2、5.1.2.2 §2.2.10，D182 第 1 題）：
       審核通過而且上映日期已到（或不填、或已經過去）⇒ Live（已上線）；
       上映日期還在未來 ⇒ Scheduled（準備中），到當天再轉 Live。
       共創與預購由 Succeeded 轉進來，直接發佈本來就在 Scheduled、維持不動——
       兩條路徑的落點規則相同，差別只在出發的狀態，所以這裡不分發行模式。
       「到當天再轉 Live」在原型不靠排程器：這一支每次載入都用今天重算，
       上映日一到，下次進頁面就自然變成已上線。
       日期比較借 projects-store 的 releaseReached()（上映日期＝排定上線日，D180 同一份
       資料，判定只該有一條）；那支 store 沒載入的頁面退回舊行為，不把人卡在準備中。 */
    projectStatus: function (projectId) {
      var rec = this.forProject(projectId);
      if (!rec || rec.status !== 'approved') return null;
      var date = (rec.work && rec.work.release) || '';
      var reached = (window.ztorProjects && window.ztorProjects.releaseReached)
        ? window.ztorProjects.releaseReached(date) : true;
      return reached ? 'live' : 'scheduled';
    },
    /* 通過後尚未在項目詳情播出「發貼文＋轉狀態」的那一件（只播一次）。 */
    pendingRelease: function (projectId) {
      var rec = this.forProject(projectId);
      return rec && rec.status === 'approved' && !rec.released ? rec : null;
    },
    markReleased: function (id) {
      var list = items(), rec = find(list, id);
      if (!rec) return;
      rec.released = true;
      save(list);
    },

    reset: function () { write(seed()); }
  };
})();
