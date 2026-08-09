/* ============================================================
   audience-store.js — 粉絲分析（Fan Analytics）的 demo 資料與繪製器
   規格：documents/5.1.7.9-粉絲分析.md（D181）

   ── 這一頁在講什麼（與另外三個地方的分工）─────────────────────
   收入管理     ＝ 錢進來多少（含貼文帶貨收益，D181 裁定金額一律落在那裡）
   表現         ＝ 單一項目被看／聽了多少次（performance-store.js，項目詳情頁）
   粉絲分析：含外部 ＝ 跨 IG／TikTok／YouTube 的受眾彙整（fan-analytics.html，
                    目前資料拿不到、封存中）
   粉絲分析     ＝ ztor 現在真的拿得到的資料：作品被消費了多少次 ＋ 消費者是誰
                    ← 本檔

   ── 兩條軸：次數與人數（D181 定案）─────────────────────────────
   次數（counts）＝ 串流／觀看／瀏覽次數。來自發行商報表與平台回報的彙總數字，
                  認不出個別的人。
   人數（people）＝ 去重後的人數。只涵蓋 ztor 站上認得出身分的消費者。
   兩者不可互相加總或比較，畫面上每個數字都要標單位。

   為什麼性別／星座／MBTI／生肖只能用人數：這四項屬性只存在於 ztor 會員資料，
   Netflix 或 Spotify 回傳的是「這支影片被看了 71,200 次」，推不出任何一個人的
   星座。所以這四區的分母永遠是「認得出身分的那一群」，且必須把涵蓋率寫在畫面上
   ——不標的話，54.2% 會被讀成全體觀眾的性別比，那是假的。

   ── 資料從哪裡來（不重造一份）───────────────────────────────
   影視與音樂的「次數」全部轉引 performance-store.js 的 FILM／MUSIC：
     總次數、平台表現、地區表現、Top 10 作品
   本檔只補它沒有的那一半：人數、四項受眾屬性、以及整個貼文分頁。
   這樣做的理由跟 orders-store 一樣——同一份數字有兩份手寫副本，遲早會分岔。

   數字全為示意資料，非真實成效。
   ============================================================ */
(function () {
  'use strict';

  var PERIODS = ['m', 'q', 'y'];

  /* ══════════════ 人數（去重後，只算認得出身分的）══════════════
     identified ＝ 站上認得出身分的消費者人數，是下面四項屬性的分母。
     reach      ＝ 該期間的總觸及人數（含認不出身分的），用來算涵蓋率。
     涵蓋率 ＝ identified / reach，畫面上直接顯示這個比例。

     影視的涵蓋率低於音樂，是因為影視大宗在 Netflix／Disney+ 這類完全封閉的
     OTT，ztor 只拿得到彙總數字；音樂有 Ztor 自己的播放通路，比例高一些。 */
  var PEOPLE = {
    film:  {
      reach:      { m: 61300, q: 188400, y: 574200 },
      identified: { m: 11400, q:  34700, y: 105800 }
    },
    music: {
      reach:      { m: 84600, q: 246300, y: 731500 },
      identified: { m: 17800, q:  51800, y: 153900 }
    },
    /* 貼文的涵蓋率高得多：貼文只發生在 ztor 站上，看的人多半是登入狀態。
       剩下那一成是未登入的公開瀏覽。 */
    post: {
      reach:      { m: 12400, q: 38600, y: 121300 },
      identified: { m: 10900, q: 34100, y: 107200 }
    }
  };

  /* ══════════════ 受眾屬性（只有人數，沒有金額）══════════════
     值是「該群的人數佔 identified 的權重」，繪製時換算成人數與百分比，
     所以任一期間的各項加起來一定等於 identified——不會出現分項加不回總數。

     三個分頁刻意給不同的分布，不是同一組乘係數：
       影視偏男、天蠍與獅子居前
       音樂偏女、雙魚與天蠍居前（抒情曲的聽眾結構）
       貼文最偏女、天秤居前
     這樣切分頁才有意義；三張一模一樣的圖等於沒有分頁。 */
  var ATTRS = {
    film: {
      gender: [
        { i18n: 'ar.gender.f', w: 42.1 },
        { i18n: 'ar.gender.m', w: 54.2 },
        { i18n: 'ar.gender.x', w: 3.7 }
      ],
      zodiac: [
        { i18n: 'ar.zo.scorpio', w: 11.4 }, { i18n: 'ar.zo.leo', w: 10.3 },
        { i18n: 'ar.zo.pisces', w: 9.1 },  { i18n: 'ar.zo.libra', w: 8.6 },
        { i18n: 'ar.zo.virgo', w: 8.2 },   { i18n: 'ar.zo.cancer', w: 7.9 },
        { i18n: 'ar.zo.aries', w: 7.6 },   { i18n: 'ar.zo.sagittarius', w: 7.4 },
        { i18n: 'ar.zo.taurus', w: 7.1 },  { i18n: 'ar.zo.gemini', w: 6.8 },
        { i18n: 'ar.zo.aquarius', w: 6.2 },{ i18n: 'ar.zo.capricorn', w: 9.4 }
      ],
      mbti: [
        { i18n: 'ar.mb.INFP', w: 8.4 }, { i18n: 'ar.mb.ENFP', w: 7.9 },
        { i18n: 'ar.mb.INFJ', w: 7.2 }, { i18n: 'ar.mb.INTJ', w: 6.9 },
        { i18n: 'ar.mb.ENTP', w: 6.5 }, { i18n: 'ar.mb.INTP', w: 6.2 },
        { i18n: 'ar.mb.ENFJ', w: 5.9 }, { i18n: 'ar.mb.ISFP', w: 5.7 },
        { i18n: 'ar.mb.ENTJ', w: 5.4 }, { i18n: 'ar.mb.ISTP', w: 5.2 },
        { i18n: 'ar.mb.ESFP', w: 5.0 }, { i18n: 'ar.mb.ISFJ', w: 4.9 },
        { i18n: 'ar.mb.ESFJ', w: 4.7 }, { i18n: 'ar.mb.ESTP', w: 4.5 },
        { i18n: 'ar.mb.ISTJ', w: 4.3 }, { i18n: 'ar.mb.ESTJ', w: 11.3 }
      ],
      shengxiao: [
        { i18n: 'ar.sx.tiger', w: 11.2 },  { i18n: 'ar.sx.rabbit', w: 10.4 },
        { i18n: 'ar.sx.dragon', w: 9.9 },  { i18n: 'ar.sx.horse', w: 9.1 },
        { i18n: 'ar.sx.monkey', w: 8.4 },  { i18n: 'ar.sx.rat', w: 7.9 },
        { i18n: 'ar.sx.snake', w: 7.2 },   { i18n: 'ar.sx.goat', w: 6.9 },
        { i18n: 'ar.sx.dog', w: 6.4 },     { i18n: 'ar.sx.ox', w: 5.6 },
        { i18n: 'ar.sx.rooster', w: 4.6 }, { i18n: 'ar.sx.pig', w: 12.4 }
      ]
    },
    music: {
      gender: [
        { i18n: 'ar.gender.f', w: 58.6 },
        { i18n: 'ar.gender.m', w: 38.1 },
        { i18n: 'ar.gender.x', w: 3.3 }
      ],
      zodiac: [
        { i18n: 'ar.zo.pisces', w: 12.1 },  { i18n: 'ar.zo.scorpio', w: 11.2 },
        { i18n: 'ar.zo.cancer', w: 9.9 },   { i18n: 'ar.zo.leo', w: 9.2 },
        { i18n: 'ar.zo.libra', w: 8.4 },    { i18n: 'ar.zo.virgo', w: 7.7 },
        { i18n: 'ar.zo.aries', w: 6.9 },    { i18n: 'ar.zo.sagittarius', w: 6.2 },
        { i18n: 'ar.zo.taurus', w: 5.4 },   { i18n: 'ar.zo.gemini', w: 4.8 },
        { i18n: 'ar.zo.aquarius', w: 3.4 }, { i18n: 'ar.zo.capricorn', w: 14.8 }
      ],
      mbti: [
        { i18n: 'ar.mb.INFP', w: 10.3 }, { i18n: 'ar.mb.ENFP', w: 9.5 },
        { i18n: 'ar.mb.INFJ', w: 8.2 },  { i18n: 'ar.mb.ISFP', w: 7.3 },
        { i18n: 'ar.mb.ENFJ', w: 6.5 },  { i18n: 'ar.mb.INTP', w: 5.8 },
        { i18n: 'ar.mb.INTJ', w: 5.3 },  { i18n: 'ar.mb.ESFP', w: 4.9 },
        { i18n: 'ar.mb.ENTP', w: 4.5 },  { i18n: 'ar.mb.ISFJ', w: 4.2 },
        { i18n: 'ar.mb.ENTJ', w: 3.8 },  { i18n: 'ar.mb.ISTP', w: 3.4 },
        { i18n: 'ar.mb.ESFJ', w: 3.2 },  { i18n: 'ar.mb.ESTP', w: 2.9 },
        { i18n: 'ar.mb.ISTJ', w: 2.7 },  { i18n: 'ar.mb.ESTJ', w: 17.5 }
      ],
      shengxiao: [
        { i18n: 'ar.sx.rabbit', w: 11.6 }, { i18n: 'ar.sx.tiger', w: 10.9 },
        { i18n: 'ar.sx.dragon', w: 9.9 },  { i18n: 'ar.sx.snake', w: 9.0 },
        { i18n: 'ar.sx.horse', w: 8.2 },   { i18n: 'ar.sx.rat', w: 7.5 },
        { i18n: 'ar.sx.monkey', w: 7.1 },  { i18n: 'ar.sx.goat', w: 6.4 },
        { i18n: 'ar.sx.ox', w: 6.9 },      { i18n: 'ar.sx.dog', w: 5.3 },
        { i18n: 'ar.sx.rooster', w: 5.7 }, { i18n: 'ar.sx.pig', w: 11.5 }
      ]
    },
    post: {
      gender: [
        { i18n: 'ar.gender.f', w: 61.2 },
        { i18n: 'ar.gender.m', w: 35.4 },
        { i18n: 'ar.gender.x', w: 3.4 }
      ],
      zodiac: [
        { i18n: 'ar.zo.libra', w: 13.2 },   { i18n: 'ar.zo.scorpio', w: 12.1 },
        { i18n: 'ar.zo.gemini', w: 10.9 },  { i18n: 'ar.zo.leo', w: 9.9 },
        { i18n: 'ar.zo.pisces', w: 8.8 },   { i18n: 'ar.zo.virgo', w: 8.2 },
        { i18n: 'ar.zo.cancer', w: 7.6 },   { i18n: 'ar.zo.aries', w: 6.8 },
        { i18n: 'ar.zo.sagittarius', w: 6.0 }, { i18n: 'ar.zo.taurus', w: 5.6 },
        { i18n: 'ar.zo.aquarius', w: 4.6 }, { i18n: 'ar.zo.capricorn', w: 6.3 }
      ],
      mbti: [
        { i18n: 'ar.mb.ENFP', w: 10.9 }, { i18n: 'ar.mb.INFP', w: 10.1 },
        { i18n: 'ar.mb.ENTP', w: 8.7 },  { i18n: 'ar.mb.INFJ', w: 8.1 },
        { i18n: 'ar.mb.ENFJ', w: 7.3 },  { i18n: 'ar.mb.INTP', w: 6.5 },
        { i18n: 'ar.mb.ESFP', w: 5.9 },  { i18n: 'ar.mb.INTJ', w: 5.4 },
        { i18n: 'ar.mb.ISFP', w: 5.0 },  { i18n: 'ar.mb.ENTJ', w: 4.5 },
        { i18n: 'ar.mb.ESTP', w: 4.1 },  { i18n: 'ar.mb.ISFJ', w: 3.8 },
        { i18n: 'ar.mb.ESFJ', w: 6.0 },  { i18n: 'ar.mb.ISTP', w: 3.4 },
        { i18n: 'ar.mb.ISTJ', w: 3.1 },  { i18n: 'ar.mb.ESTJ', w: 7.2 }
      ],
      shengxiao: [
        { i18n: 'ar.sx.horse', w: 12.4 },  { i18n: 'ar.sx.tiger', w: 11.3 },
        { i18n: 'ar.sx.rabbit', w: 10.2 }, { i18n: 'ar.sx.dragon', w: 9.1 },
        { i18n: 'ar.sx.monkey', w: 8.4 },  { i18n: 'ar.sx.rat', w: 7.6 },
        { i18n: 'ar.sx.goat', w: 6.8 },    { i18n: 'ar.sx.snake', w: 6.2 },
        { i18n: 'ar.sx.dog', w: 5.7 },     { i18n: 'ar.sx.ox', w: 7.3 },
        { i18n: 'ar.sx.rooster', w: 6.3 }, { i18n: 'ar.sx.pig', w: 8.7 }
      ]
    }
  };

  /* ══════════════ 影視分頁的作品排行 ══════════════
     不能用 performance-store 的 FILM.units——那是「一部劇的八集」，是項目層級的
     資料；本頁是創作者層級，要的是「我全部的影視作品誰表現最好」。

     作品名與權重沿用收入管理已建立的 roy.work1–11（同一批作品、同一組 i18n key、
     同一組季播放數），所以兩頁講同一部作品時名次一致，不會一邊第一、一邊第三。

     type 依 persona 分兩套，跟 earnings-sony 的 data-roy-works.types 同一份對照：
     default 是影視為主的創作者、nick（周湯豪）是音樂為主，兩人的作品組合不同。
     這裡不能只取一套——切 persona 之後作品名會換成另一個人的，類型卻沒換，
     影視分頁就會列出一堆歌。

     音樂分頁不吃這一份：performance-store 的 MUSIC.units 本來就是十首歌
     （pd-roy.song.s1–s10），那正是「表現最佳歌曲」要的粒度。 */
  var WORKS = [
    { i18n: 'roy.work1',  w: 386200, t: { default: 'music', nick: 'music' } },
    { i18n: 'roy.work2',  w: 412800, t: { default: 'video', nick: 'music' } },
    { i18n: 'roy.work3',  w: 274500, t: { default: 'video', nick: 'music' } },
    { i18n: 'roy.work4',  w: 164700, t: { default: 'video', nick: 'music' } },
    { i18n: 'roy.work5',  w:  88600, t: { default: 'video', nick: 'music' } },
    { i18n: 'roy.work6',  w: 198300, t: { default: 'video', nick: 'video' } },
    { i18n: 'roy.work7',  w: 121400, t: { default: 'music', nick: 'video' } },
    { i18n: 'roy.work8',  w:  96400, t: { default: 'video', nick: 'music' } },
    { i18n: 'roy.work9',  w:  74800, t: { default: 'video', nick: 'video' } },
    { i18n: 'roy.work10', w:  61200, t: { default: 'video', nick: 'music' } },
    { i18n: 'roy.work11', w:  43500, t: { default: 'video', nick: 'music' } }
  ];

  function personaKey() {
    var p = window.ztorPersona && window.ztorPersona.get && window.ztorPersona.get();
    return p === 'nick' ? 'nick' : 'default';
  }

  /* ══════════════ 貼文分頁 ══════════════
     金額一律不在本檔（D181：帶貨收益落在收入管理）。這裡只有次數與人數。

     貼文的三個量綱各自獨立，不可互推：
       瀏覽（views）      ＝ 貼文被載入的次數
       有效觀看（dwell）  ＝ 停留超過 3 秒的次數，永遠 ≤ 瀏覽
       互動（engagements）＝ 留言、分享、收藏的次數
       內容租借（rentals）＝ 透過貼文專屬連結成交的次數 */
  var POSTS = {
    /* 明細列是這個分頁唯一的原始資料——KPI、型別表、Top 10 全部由它推導。
       第一版三者各自寫死，切期間時 KPI 動了、表格沒動，讀者一加就對不起來；
       參考站的「各欄位由下方貼文報告明細彙總」那句話，只有真的彙總才成立。

       標題直接寫中文：這些是創作者自己寫的貼文標題，不是介面文案，
       跟 orders-store 的收件人姓名同一個道理，不進 i18n。
       mention 用既有的作品 i18n key，讓貼文與站上的作品是同一批東西。
       kind ＝ 該貼文談的影片屬於哪一類，只有影片型貼文有。 */
    rows: [
      { title: '《海上霸姬鄭一嫂》為什麼是這五年最好的港產武打片', mention: 'roy.work5',  date: '2026-07-28', type: 'ar.pt.video', kind: 'ar.pt.k.review', views: 640, dwell: 512, eng: 118, rentals: 87 },
      { title: '深水埗那場雨戲，是怎麼在三個晚上拍完的',           mention: 'roy.work2',  date: '2026-07-25', type: 'ar.pt.image', views: 355, dwell: 260, eng: 71,  rentals: 33 },
      { title: '九龍夜行的片尾曲，我寫了十一個版本',               mention: 'roy.work7',  date: '2026-07-20', type: 'ar.pt.image', views: 305, dwell: 240, eng: 64,  rentals: 30 },
      { title: '【分鏡拆解】旺角狙擊開場那顆長鏡頭',               mention: 'roy.work4',  date: '2026-07-18', type: 'ar.pt.video', kind: 'ar.pt.k.review', views: 512, dwell: 430, eng: 96,  rentals: 41 },
      { title: '我要衝線：把賽車片拍成家庭片是不是搞錯了什麼',     mention: 'roy.work8',  date: '2026-07-15', type: 'ar.pt.image', views: 268, dwell: 189, eng: 47,  rentals: 26 },
      { title: '陳松伶精選重新母帶處理，差別在哪裡',               mention: 'roy.work1',  date: '2026-07-12', type: 'ar.pt.image', views: 240, dwell: 175, eng: 39,  rentals: 24 },
      { title: '海上霸姬第二季的美術，比第一季多花了三倍時間',     mention: 'roy.work9',  date: '2026-07-09', type: 'ar.pt.image', views: 214, dwell: 150, eng: 38,  rentals: 21 },
      { title: '低俗喜劇番外篇：為什麼要拍一部沒有主角的戲',       mention: 'roy.work11', date: '2026-07-05', type: 'ar.pt.image', views: 198, dwell: 141, eng: 42,  rentals: 19 },
      { title: '月光主題曲 MV 的水下攝影，全部是實拍',             mention: 'roy.work6',  date: '2026-07-02', type: 'ar.pt.image', views: 186, dwell: 132, eng: 35,  rentals: 15 },
      { title: '幕後紀錄片為什麼要自己剪',                         mention: 'roy.work10', date: '2026-06-28', type: 'ar.pt.image', views: 120, dwell: 100, eng: 76,  rentals: 12 }
    ],
    /* 型別表的列序固定，不依數量排——它是一張對照表不是排行榜，
       而且沒有資料的型別（文字）要留著，讓創作者看得出「我沒發過純文字貼文」。 */
    typeOrder: ['ar.pt.image', 'ar.pt.video', 'ar.pt.text'],
    /* 貼文的地區分布跟作品不同：貼文是中文寫的，台港的比重比串流更集中。 */
    regions: [
      { i18n: 'pd-roy.rg.tw', w: 40.0 }, { i18n: 'pd-roy.rg.hk', w: 19.1 },
      { i18n: 'pd-roy.rg.my', w: 11.1 }, { i18n: 'pd-roy.rg.us', w: 8.7 },
      { i18n: 'pd-roy.rg.jp', w: 7.0 },  { i18n: 'pd-roy.rg.sg', w: 5.2 },
      { i18n: 'pd-roy.rg.ca', w: 3.2 },  { i18n: 'pd-roy.rg.au', w: 2.3 },
      { i18n: 'pd-roy.rg.th', w: 2.0 },  { i18n: 'pd-roy.rg.kr', w: 1.4 }
    ]
  };

  /* ── 資料時點（參考站頁首那一行）─────────────────────────────
     影視與音樂走發行商報表，有延遲；貼文是站內統計，昨天的資料今天就有。
     兩者的時點不同是事實，不要為了畫面整齊寫成同一天。 */
  var ASOF = { film: '2026-06-30', music: '2026-06-30', post: '2026-08-06' };

  /* ══════════════ 計算 ══════════════ */

  function T(key) {
    var s = window.i18nT ? window.i18nT(key) : null;
    return s && s !== key ? s : key;
  }

  function num(n) { return Math.round(n).toLocaleString('en-US'); }

  function pct(n, digits) {
    return n.toFixed(digits === undefined ? 1 : digits) + '%';
  }

  /* 把權重表換算成「人數＋佔比」，並依人數由大到小排序。
     人數用最大餘數法分配，所以各列加起來精確等於 identified。 */
  function distribute(rows, total) {
    var sum = rows.reduce(function (a, r) { return a + r.w; }, 0);
    var raw = rows.map(function (r) { return { i18n: r.i18n, exact: r.w / sum * total, w: r.w / sum * 100 }; });
    var floored = raw.map(function (r) { return Object.assign({}, r, { n: Math.floor(r.exact) }); });
    var short = total - floored.reduce(function (a, r) { return a + r.n; }, 0);
    floored.slice().sort(function (a, b) {
      return (b.exact - Math.floor(b.exact)) - (a.exact - Math.floor(a.exact));
    }).slice(0, short).forEach(function (r) { r.n += 1; });
    return floored.sort(function (a, b) { return b.n - a.n; });
  }

  /* 涵蓋率＝認得出身分的人 ÷ 總觸及人數。四項屬性共用這個分母。 */
  function coverage(scope, period) {
    var p = PEOPLE[scope];
    return {
      identified: p.identified[period],
      reach: p.reach[period],
      ratio: p.identified[period] / p.reach[period] * 100
    };
  }

  /* 次數那一半轉引 performance-store；本檔不留第二份副本。
     取不到時回 null，呼叫端出空狀態，不要拿假數字頂上。 */
  function perf(scope) {
    var store = window.ztorPerformance && window.ztorPerformance.data;
    if (!store) return null;
    return scope === 'music' ? store.music : store.film;
  }

  /* 平台／地區：把 performance-store 的絕對值轉成排行列（含佔比）。 */
  function ranked(rows, period) {
    var vals = rows.map(function (r) {
      return { name: r.name, i18n: r.i18n, rest: !!r.rest, n: r.v[period] };
    });
    var sum = vals.reduce(function (a, r) { return a + r.n; }, 0);
    vals.forEach(function (r) { r.w = sum ? r.n / sum * 100 : 0; });
    /* 「其他」永遠排最後，不參與名次競爭——它是餘數不是一個地區。 */
    var rest = vals.filter(function (r) { return r.rest; });
    var main = vals.filter(function (r) { return !r.rest; }).sort(function (a, b) { return b.n - a.n; });
    return main.concat(rest);
  }

  /* ── 貼文：期間切片 ─────────────────────────────────────────
     以資料時點（ASOF.post）往回推：月＝30 天、季＝90 天、年＝365 天。
     KPI、型別表、Top 10 與地區全部吃同一份切片，所以任何一個數字被質疑時，
     都可以在下面的明細表逐列加回來。 */
  var POST_WINDOW = { m: 30, q: 90, y: 365 };

  function postRows(period) {
    var end = new Date(ASOF.post + 'T00:00:00Z').getTime();
    var start = end - (POST_WINDOW[period] || 90) * 86400000;
    return POSTS.rows.filter(function (r) {
      var t = new Date(r.date + 'T00:00:00Z').getTime();
      return t >= start && t <= end;
    });
  }

  function postKpi(period) {
    var rows = postRows(period);
    return {
      views:   rows.reduce(function (a, r) { return a + r.views; }, 0),
      rentals: rows.reduce(function (a, r) { return a + r.rentals; }, 0),
      count:   rows.length
    };
  }

  /* 型別表：欄位對齊參考站，但「帶貨收益」那一欄整欄拿掉（金額在收入管理）。 */
  function postByType(period) {
    var rows = postRows(period);
    return POSTS.typeOrder.map(function (t) {
      var g = rows.filter(function (r) { return r.type === t; });
      var kinds = g.map(function (r) { return r.kind; }).filter(Boolean);
      return {
        i18n: t,
        count: g.length,
        withRental: g.filter(function (r) { return r.rentals > 0; }).length,
        mentionsFilm: g.filter(function (r) { return !!r.mention; }).length,
        /* 同一型別裡混到兩種影片類型時不挑一個代表，留空由呈現層出「—」。 */
        filmKind: kinds.length && kinds.every(function (k) { return k === kinds[0]; }) ? kinds[0] : null,
        views: g.reduce(function (a, r) { return a + r.views; }, 0)
      };
    });
  }

  /* 作品排行：把權重表分配該期間的總次數。用最大餘數法而不是逐列四捨五入，
     所以各列加起來精確等於畫面上那個大數字——逐列 round 會差個一兩次，
     而讀者把欄位加起來是會發現的（第一版就差 1）。
     影視用本檔的 WORKS（跨作品、依 persona 過濾）、音樂用十首歌。
     回傳 { rows, total }：total 是過濾後的作品總數，供「顯示 N／共 M」用。 */
  function topWorks(scope, period) {
    var fam = perf(scope);
    if (!fam) return { rows: [], total: 0 };
    var pk = personaKey();
    var src = scope === 'music'
      ? fam.units.map(function (u) { return { i18n: u.i18n, w: u.a }; })
      : WORKS.filter(function (r) { return r.t[pk] === 'video'; })
             .map(function (r) { return { i18n: r.i18n, w: r.w }; });
    if (!src.length) return { rows: [], total: 0 };

    var pool = fam.total[period];
    var sum = src.reduce(function (a, r) { return a + r.w; }, 0) || 1;
    var raw = src.map(function (r) {
      var exact = r.w / sum * pool;
      return { i18n: r.i18n, exact: exact, n: Math.floor(exact), w: r.w / sum * 100 };
    });
    var short = pool - raw.reduce(function (a, r) { return a + r.n; }, 0);
    raw.slice().sort(function (a, b) {
      return (b.exact - Math.floor(b.exact)) - (a.exact - Math.floor(a.exact));
    }).slice(0, short).forEach(function (r) { r.n += 1; });

    return {
      rows: raw.sort(function (a, b) { return b.n - a.n; }).slice(0, 10),
      total: src.length
    };
  }

  window.ztorAudience = {
    PERIODS: PERIODS,
    asOf: ASOF,
    people: PEOPLE,
    attrs: ATTRS,
    posts: POSTS,
    works: WORKS,
    topWorks: topWorks,
    postRows: postRows,
    postKpi: postKpi,
    postByType: postByType,
    T: T,
    num: num,
    pct: pct,
    distribute: distribute,
    coverage: coverage,
    perf: perf,
    ranked: ranked
  };
})();
