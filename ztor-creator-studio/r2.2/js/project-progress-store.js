/* 進度（里程碑＋更新）的資料源 · 規格 5.1.2.2 §2.2.10（2026-08-17，D193／D194）
   ---------------------------------------------------------------------------
   這一支只服務「進度」分頁：里程碑是骨架、更新是內容、最後一顆是完成作品。
   三件事刻意分開放：

     里程碑    住這裡（初值來自建立流程 §4.3 F10 的交付時程，原型以本檔種子替代）
     更新      住這裡（受眾、發文類型的定義在 §2.2.9，本檔只記「發了什麼、掛在哪」）
     完成作品  **不住這裡**——它讀 js/work-review-store.js 的送審件（§2.2.10 明講
               「節點不另存一份狀態，直接讀該筆送審件」）。本檔連一個欄位都不留，
               留了就會有第二份狀態，總覽、進度與作品三處遲早各說各話。

   ── 2026-08-17 D194：日期改成真實日期型別 ─────────────────────────────
   改寫前里程碑的日期是顯示字串（'Apr 2026' / '2026/04'），兩邊都無法比較，
   所以排序只能靠人工上下移、畫面上也算不出倒數與逾期。現在：

     milestone.date        Date | null   預計日期（可留白）
     milestone.completedAt Date | null   完成日，狀態轉已完成時由系統寫入
     update.publishedAt    Date          發布時間，發出當下寫入
     project.createdAt     Date          項目建立時間（軸底節點與「建立當天」讀它）

   顯示格式是呈現決策，不在本檔——本檔只存單一真實日期，由頁面依語系格式化。
   **順序欄位已移除**（D194）：順序一律由預計日期推導，沒有日期的排在未來段最上方。

   原型層級：純記憶體，重整還原（與 js/projects-store.js 同一種做法）。

   ── 「今天」是釘死的常數，**不讀系統時間**（2026-08-17 使用者裁決）──────────
   下面的 TODAY_ISO 就是這個原型認定的今天。為什麼要釘死：demo 的里程碑排在 2026 年
   某幾個月，若「今天」跟著系統時鐘走，過一陣子所有里程碑都會掉進過去段，倒數、
   逾期、「今天就是里程碑日」這些狀態在畫面上再也看不到，示範就少了一半。
   **要改就改 TODAY_ISO 這一行**，其餘全部從它推導（種子日期一律寫成「相對今天幾天」，
   不寫死年月日）。日期的**值**是假的沒關係，**型別**是真的 Date、可比較可相減——
   倒數、逾期、按天收合與排序都靠這一點成立。 */
(function () {
  'use strict';

  /* ⚠ 這一行就是原型的「今天」。改它會讓整條時間軸與所有狀態變體跟著位移。 */
  var TODAY_ISO = '2026-08-17';

  /* 里程碑三態。值域見規格 §2.2.10「里程碑」：未開始／進行中／已完成。 */
  var STATUS = {
    todo:  { en: 'Not started', zh: '未開始', icon: 'circle',       tone: '' },
    doing: { en: 'In progress', zh: '進行中', icon: 'clock',        tone: 'data-list__icon--info' },
    done:  { en: 'Done',        zh: '已完成', icon: 'check-circle', tone: 'data-list__icon--success' }
  };

  var DAY = 86400000;

  /* 今天的午夜。永遠回傳新的 Date 物件——回傳共用實例的話，任何一處 setDate()
     都會把全站的「今天」改掉。 */
  function today() {
    var p = TODAY_ISO.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  /* 「現在」＝系統寫入時間戳時用的那一刻（標成完成、發出更新）。同樣不讀系統時鐘：
     取釘死的今天，時分由一個只增不減的計數器給，讓同一次操作序列裡先發的排在前面。 */
  var tick = 0;
  function now() {
    var d = today();
    d.setHours(12, tick++, 0, 0);
    return d;
  }
  function shift(days, hour) {
    var d = today();
    d.setDate(d.getDate() + days);
    if (hour != null) d.setHours(hour, 0, 0, 0);
    return d;
  }
  /* 「差幾天」一律先把兩邊歸零到當地時間的午夜再相減。直接相減會被時分秒污染，
     同一天的兩個時間點會算出 0.4 天這種東西。時區以瀏覽器所在地為準——平台統一
     時區還是創作者所在地〔產品待確認〕，見主規格 §8.25 第 1 項。 */
  function midnight(d) { var x = new Date(d.getTime()); x.setHours(0, 0, 0, 0); return x; }
  function diffDays(a, b) { return Math.round((midnight(a) - midnight(b)) / DAY); }
  function sameDay(a, b) { return a && b && diffDays(a, b) === 0; }
  function dayKey(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  /* 交付藍圖的預設骨架。共創與預購共用同一組——兩者達標後同樣進入製作與交付
     （§2.0 界線清單）。名稱沿用建立流程 F10 的用法（「Pre-production complete」那種）。 */
  var BLUEPRINT = [
    { key: 'preprod', name: { en: 'Pre-production wrapped',  zh: '前期製作完成' }, desc: { en: 'Script locked, crew booked, locations secured.', zh: '劇本定稿、劇組到位、場景談定。' } },
    { key: 'shoot',   name: { en: 'Principal shoot wrapped', zh: '主體拍攝殺青' }, desc: { en: 'All scheduled shooting days are in the can.', zh: '排定的拍攝日全部完成。' } },
    { key: 'post',    name: { en: 'Final cut locked',        zh: '成片定剪' },     desc: { en: 'Picture, sound and grade are signed off.', zh: '畫面、聲音與調光都定稿。' } }
  ];

  /* 依項目狀態決定藍圖走到第幾顆。索引＝「目前正在進行的那一顆」，它之前的都完成。
       進行中（published）→ 才剛開募，前期在跑
       已成功（succeeded）→ 錢收了，主體製作中
       準備中（scheduled）／已上線（live）→ 藍圖走完了，剩下完成作品那一顆系統節點
       已取消（cancelled）→ 停在第一顆，之後的都不會發生（凍結見 §2.2.4） */
  var CURSOR = { published: 0, succeeded: 1, scheduled: 3, live: 3, cancelled: 1, draft: 0 };

  /* ── 示範資料：狀態變體 ────────────────────────────────────────────────
     §2.2.10「狀態變體」表列的情境，如果每個項目的種子都長一樣就一個也看不到。
     這張表只覆寫「里程碑的日期與完成狀況」，不動任何項目的狀態（projects-store
     完全沒被碰）。每一列的 ms 是逐顆的覆寫：
       d  ＝預計日期相對今天的天數（null ＝留白）
       s  ＝狀態
       cd ＝完成日相對今天的天數（省略時＝預計日期當天）
     posts ＝額外的更新種子（at ＝發布時間相對今天的天數）。

     每一把 key 都必須是共創或預購的項目——「進度」分頁只給這兩型（§2.0），
     掛在直接發佈項目上的變體永遠不會被畫出來。 */
  var VARIANTS = {
    /* 逾期：第一顆的預計日期已經過了六天還沒完成（§2.2.10「倒數、逾期與提前完成」）。 */
    'nick-lrh': {
      ms: [{ d: -6, s: 'doing' }, { d: 34, s: 'todo' }, { d: 94, s: 'todo' }]
    },
    'north-point-rain': {
      ms: [{ d: -11, s: 'doing' }, { d: 25, s: 'todo' }, { d: 80, s: 'todo' }]
    },
    /* 里程碑全部完成、作品還沒上線：今天那一格改成指向完成作品節點的下一步。 */
    'nick-r2-film': {
      ms: [{ d: -120, s: 'done', cd: -120 }, { d: -60, s: 'done', cd: -58 }, { d: -8, s: 'done', cd: -8 }]
    },
    'victoria-noir': {
      ms: [{ d: -140, s: 'done', cd: -140 }, { d: -75, s: 'done', cd: -70 }, { d: -14, s: 'done', cd: -14 }]
    },
    /* 今天就是里程碑日、尚未完成：該顆改由今天那一格承載，不在未來段重複出現。 */
    'nick-street-stage': {
      ms: [{ d: -70, s: 'done', cd: -70 }, { d: 0, s: 'doing' }, { d: 60, s: 'todo' }]
    },
    /* 提前完成：完成日早於預計日期，節點落在實際完成日並附註原定日期。 */
    'nick-lrh-doc': {
      ms: [{ d: -90, s: 'done', cd: -92 }, { d: -12, s: 'done', cd: -26 }, { d: 48, s: 'todo' }]
    },
    'kowloon-night-cut': {
      ms: [{ d: -100, s: 'done', cd: -104 }, { d: -20, s: 'done', cd: -33 }, { d: 40, s: 'todo' }]
    },
    /* 里程碑都沒有預計日期：沒有可倒數的對象，今天那一格改成提示句。 */
    'nick-lwh-tour': {
      ms: [{ d: null, s: 'todo' }, { d: null, s: 'todo' }, { d: null, s: 'todo' }]
    },
    'miujie-merch-s2': {
      ms: [{ d: null, s: 'todo' }, { d: null, s: 'todo' }, { d: null, s: 'todo' }]
    },
    /* 里程碑全部完成、作品已上線之後仍繼續發文：時間軸不關閉。 */
    'nick-ni-shuo': {
      posts: [{ at: 0, title: { en: 'Six months on — what the film paid for', zh: '上線半年，這部片養活了什麼' }, body: { en: 'A short accounting of where the money went, and what we are shooting next.', zh: '簡單交代錢花到哪裡，以及下一部要拍什麼。' }, aud: 'pd-edit.update.aud-everyone' }]
    },
    'adia-chan': {
      posts: [{ at: 0, title: { en: 'The remaster is streaming everywhere today', zh: '重製版今天全平台上線' }, body: { en: 'Thanks for waiting — every backer already has the lossless files.', zh: '謝謝久等，支持者的無損檔已經寄出。' }, aud: 'pd-edit.update.aud-everyone' }]
    }
  };

  var seq = 0;
  var store = {};          /* projectId → { ms: [], up: [], createdAt: Date } */

  function uid(p) { return p + '-' + (++seq); }

  /* 項目建立時間。projects-store 的 created 是 'YYYY/MM/DD' 字串，這裡轉成真日期；
     沒有這個欄位的（demo 遺漏）退回一年前，讓軸底至少有一個合理的起點。 */
  function createdAtOf(project) {
    var raw = project && project.created;
    if (raw) {
      var p = String(raw).split(/[\/\-]/);
      if (p.length === 3) {
        var d = new Date(+p[0], +p[1] - 1, +p[2]);
        if (!isNaN(d.getTime())) return d;
      }
    }
    return shift(-365);
  }

  function seedFor(project) {
    var cursor = CURSOR[project.status];
    if (cursor == null) cursor = 0;
    var v = VARIANTS[project.id] || {};
    var over = v.ms || null;

    var ms = BLUEPRINT.map(function (b, i) {
      var o = over ? (over[i] || {}) : {};
      var status = o.s || (i < cursor ? 'done' : (i === cursor ? 'doing' : 'todo'));
      /* 沒有覆寫時，日期由 cursor 推：正在跑的那一顆落在 30 天後，前面的每顆再往前
         60 天。這樣「已完成的在過去、進行中的在未來」永遠成立，不會出現「項目才
         剛開募、第一顆就已經逾期」這種自打嘴巴的畫面。 */
      var dd = over ? o.d : (i - cursor) * 60 + 30;
      var date = dd == null ? null : shift(dd);
      var completedAt = null;
      if (status === 'done') {
        var cd = o.cd != null ? o.cd : dd;
        completedAt = cd == null ? shift(-1, 11) : shift(cd, 11);
      }
      return {
        id: uid('ms'),
        name: { en: b.name.en, zh: b.name.zh },
        desc: { en: b.desc.en, zh: b.desc.zh },
        date: date,
        status: status,
        completedAt: completedAt,
        pub: true
      };
    });

    /* 更新種子：一則掛在**已完成的**里程碑上、其餘不掛。兩種掛法從一開始就在畫面上
       各有一筆，創作者不必先發一則才看得出差別（§2.2.10 兩種掛法）。不掛的那一則自
       D194 起也排進同一條軸，不再收進公告盒。
       2026-08-18（D197）：掛載的那一顆改成「第一顆已完成的里程碑」。里程碑更新就是
       那顆的完成宣告，發出去等於把它標記完成——所以「未完成的里程碑底下掛著一則已發
       的更新」這個狀態不可能存在，種子資料不能造出來。全部都未完成時就不掛。 */
    var firstDone = null;
    ms.forEach(function (m) { if (!firstDone && m.status === 'done') firstDone = m; });
    var up = [
      {
        id: uid('up'),
        title: { en: 'Pre-production is done — here is the shot list', zh: '前期收工，附上分鏡表' },
        body: { en: 'Storyboards for all 42 scenes are attached. Shooting starts on Monday.', zh: '四十二場戲的分鏡都在附件裡，週一開拍。' },
        audience: 'pd-edit.update.aud-backers',
        milestoneId: firstDone ? firstDone.id : null,
        publishedAt: (firstDone && firstDone.completedAt) || shift(-30, 15),
        notified: { en: '134 notified', zh: '通知 134 人' },
        kind: 'general'
      },
      {
        id: uid('up'),
        title: { en: 'The film festival picked us up', zh: '入選影展的消息' },
        body: { en: 'We are in the competition section this autumn — nothing to do with the shoot, but worth telling you.', zh: '今年秋天入選競賽單元。跟拍攝進度無關，但值得跟大家說一聲。' },
        audience: 'pd-edit.update.aud-everyone',
        milestoneId: null,
        publishedAt: shift(-38, 10),
        notified: null,
        kind: 'general'
      },
      {
        id: uid('up'),
        title: { en: 'Location scouting in Sham Shui Po', zh: '深水埗場勘紀錄' },
        body: { en: 'Three streets, one rooftop, and the tea house on the corner. Photos inside.', zh: '三條街、一個天台，還有轉角那間茶餐廳。照片在裡面。' },
        audience: 'pd-edit.update.aud-everyone',
        milestoneId: null,
        publishedAt: shift(-38, 16),
        notified: null,
        kind: 'general'
      }
    ];

    (v.posts || []).forEach(function (p) {
      up.push({
        id: uid('up'),
        title: { en: p.title.en, zh: p.title.zh },
        body: { en: p.body.en, zh: p.body.zh },
        audience: p.aud || 'pd-edit.update.aud-everyone',
        milestoneId: null,
        publishedAt: shift(p.at, 9),
        notified: null,
        kind: 'general'
      });
    });

    return { ms: ms, up: up, createdAt: createdAtOf(project) };
  }

  function bucket(project) {
    if (!project) return { ms: [], up: [], createdAt: shift(-365) };
    if (!store[project.id]) store[project.id] = seedFor(project);
    return store[project.id];
  }

  window.ztorProjectProgress = {
    STATUS: STATUS,

    /* 日期工具對外開放：頁面要算倒數、分組、格式化都走同一份，別各寫一套。 */
    today: today,
    diffDays: diffDays,
    sameDay: sameDay,
    dayKey: dayKey,

    milestones: function (project) { return bucket(project).ms.slice(); },
    updates: function (project) { return bucket(project).up.slice(); },
    createdAt: function (project) { return bucket(project).createdAt; },

    /* 掛載欄位的預設值（§2.2.10）：目前狀態為「進行中」的那一顆；沒有就「不掛」。 */
    defaultMilestoneId: function (project) {
      var ms = bucket(project).ms;
      for (var i = 0; i < ms.length; i++) if (ms[i].status === 'doing') return ms[i].id;
      return '';
    },

    /* 下一個目標（§2.2.10）：預計日期在今天或之後、尚未完成、日期最接近今天的那一顆。
       沒有預計日期的不列入。 */
    nextGoal: function (project) {
      var now = today(), best = null;
      bucket(project).ms.forEach(function (m) {
        if (m.status === 'done' || !m.date) return;
        if (diffDays(m.date, now) < 0) return;
        if (!best || m.date < best.date) best = m;
      });
      return best;
    },

    /* 逾期（§2.2.10）：預計日期早於今天且尚未完成。回傳依逾期最久排在最前。 */
    overdue: function (project) {
      var now = today();
      return bucket(project).ms.filter(function (m) {
        return m.status !== 'done' && m.date && diffDays(m.date, now) < 0;
      }).sort(function (a, b) { return a.date - b.date; });
    },

    /* 藍圖完成度摘要（總覽的交付面板與進度的頂部摘要共用一份，不各算一次）。 */
    summary: function (project) {
      var ms = bucket(project).ms;
      var done = ms.filter(function (m) { return m.status === 'done'; }).length;
      return { done: done, total: ms.length };
    },

    addMilestone: function (project, o) {
      var b = bucket(project);
      var m = {
        id: uid('ms'),
        name: { en: o.name || '', zh: o.name || '' },
        desc: { en: o.desc || '', zh: o.desc || '' },
        date: o.date || null,
        status: o.status || 'todo',
        completedAt: o.status === 'done' ? (o.date || now()) : null,
        pub: o.pub !== false
      };
      b.ms.push(m);
      return m;
    },

    patchMilestone: function (project, id, o) {
      var b = bucket(project), m = null;
      b.ms.forEach(function (x) { if (x.id === id) m = x; });
      if (!m) return null;
      if (o.name != null) m.name = { en: o.name, zh: o.name };
      if (o.desc != null) m.desc = { en: o.desc, zh: o.desc };
      if (o.date !== undefined) m.date = o.date || null;
      if (o.pub != null) m.pub = !!o.pub;
      if (o.status && STATUS[o.status]) {
        m.status = o.status;
        /* 完成日由系統寫入、創作者不手填（§2.2.10 里程碑欄位）：標成完成的那一刻
           就是完成日，所以是「現在」，不是預計日期——用預計日期會讓每一顆都剛好
           準時完成，提前與延後兩種狀態永遠出不來。 */
        m.completedAt = o.status === 'done' ? (m.completedAt || now()) : null;
      }
      return m;
    },

    removeMilestone: function (project, id) {
      var b = bucket(project);
      b.ms = b.ms.filter(function (m) { return m.id !== id; });
      /* 掛在被刪那顆底下的更新不能跟著消失——它真的發出去過。改成不掛里程碑，
         依自己的發布時間留在軸上。 */
      b.up.forEach(function (u) { if (u.milestoneId === id) u.milestoneId = null; });
    },

    /* 發一則更新。milestoneId 空字串／null ＝ 不掛（§2.2.10）。
       發布時間由系統於發出當下寫入，所以是 now()（釘死的今天＋遞增的分鐘），不是顯示字串。 */
    addUpdate: function (project, o) {
      var b = bucket(project);
      var u = {
        id: uid('up'),
        title: { en: o.title || '', zh: o.title || '' },
        body: { en: o.body || '', zh: o.body || '' },
        audience: o.audience || 'pd-edit.update.aud-everyone',
        milestoneId: o.milestoneId || null,
        publishedAt: now(),
        notified: null,
        notifiedKey: 'project-detail.updates.notification-sent',
        kind: o.kind || 'general'
      };
      b.up.push(u);
      return u;
    },

    /* 完成作品那則貼文（審核通過並上線時發出）。它掛在完成作品節點底下，
       所以 milestoneId 用保留字 'work'，不佔任何一顆真的里程碑。 */
    addWorkPost: function (project, o) {
      var b = bucket(project);
      if (b.up.some(function (u) { return u.kind === 'release'; })) return null;
      var u = {
        id: uid('up'),
        title: { en: o.title || '', zh: o.title || '' },
        body: { en: o.body || '', zh: o.body || '' },
        audience: o.audience || 'pd-edit.update.aud-everyone',
        milestoneId: 'work',
        publishedAt: o.at instanceof Date ? o.at : now(),
        notified: null,
        notifiedKey: 'project-detail.updates.notification-sent',
        kind: 'release'
      };
      b.up.push(u);
      return u;
    }
  };
})();
