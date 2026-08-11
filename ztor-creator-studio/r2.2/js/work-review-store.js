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
  var LS = 'ztor.workReview.v2';

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
        id: 'wr-1003',
        projectId: 'dragon-tiger-gate',
        persona: 'default',
        creator: 'Gary Lin',
        cover: IMG + 'dragon-tiger-gate-kowloon-night-card.webp',
        title: { zh: '龍虎門外傳：九龍夜行', en: 'Dragon Tiger Gate: Kowloon After Dark' },
        projectName: { zh: '龍虎門外傳：九龍夜行', en: 'Dragon Tiger Gate: Kowloon After Dark' },
        status: 'rejected',
        submittedAt: '2026-08-01 18:44',
        count: 1,
        reviewer: 'ztor Ops · Ray',
        decidedAt: '2026-08-02 10:15',
        reason: '年齡限制填「全部」，但片中有明顯暴力場面。請改為 16 歲以上後重送。',
        post: { title: '九龍夜行正式上線', audience: 'pd-edit.update.aud-everyone' },
        work: demoWork({
          file: 'dtg-kowloon_master.mp4', audio: 'pw.lang.yue',
          zhTitle: '龍虎門外傳：九龍夜行', zhDesc: '霓虹巷弄裡的舊帳，一夜之間全部翻出來。',
          enTitle: 'Dragon Tiger Gate: Kowloon After Dark', enDesc: 'Old scores, neon back alleys, and one night to settle all of them.',
          subs: [['pw.lang.zh', 'dtg_zh-hant.srt'], ['pw.lang.en', 'dtg_en.srt']],
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
          stills: 4, bts: 1, runtime: '02:04:00', release: '2026/05/10',
          genres: ['pw.genre.crime', 'pw.genre.thriller'], age: 'pw.age.16',
          paid: true, currency: 'HKD'
        }),
        history: [
          { at: '2026-05-09 13:00', action: 'submit', by: '', reason: '' },
          { at: '2026-05-10 09:40', action: 'start', by: 'ztor Ops · Ivy', reason: '' },
          { at: '2026-05-10 11:20', action: 'approve', by: 'ztor Ops · Ivy', reason: '' }
        ]
      }
    ];
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

    /* 項目狀態覆寫：審核通過＝項目 Succeeded → Live。projects-store 是純記憶體
       資料（重整還原），所以「已經通過的那些項目」要靠這裡記住，否則創作者
       重新整理項目詳情又會看回已成立。 */
    projectStatus: function (projectId) {
      var rec = this.forProject(projectId);
      return rec && rec.status === 'approved' ? 'live' : null;
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
