/* ============================================================
   audience-store.js — 粉絲分析（Fan Analytics）的 demo 資料與計算
   規格：documents/5.1.7.9-粉絲分析.md（D181、D182）

   ── 這一頁在講什麼（與另外三個地方的分工）─────────────────────
   收入管理     ＝ 錢進來多少（含貼文帶貨收益，金額一律落在那裡）
   表現         ＝ 單一項目被看／聽了多少次（performance-store.js，項目詳情頁）
   粉絲分析：含外部 ＝ 跨 IG／TikTok／YouTube 的受眾彙整（fan-analytics.html，
                    目前沒有取得管道、封存中）
   粉絲分析     ＝ ztor 現在真的拿得到的資料：作品被消費了多少次 ＋ 消費者是誰
                    ← 本檔

   ── 單頁＋逐區切換（2026-08-09 使用者裁決，D182）─────────────
   原本是影視／音樂／貼文三個分頁，改成單頁：每個區塊右上角各自切
   全部／影視／音樂／貼文，預設全部。理由是創作者要比的是「同一個維度在三個
   類型之間怎麼不同」（我的音樂聽眾跟影視觀眾是不是同一群人），分頁會逼他
   來回跳、還會忘記上一頁長什麼樣。
   參考站每張卡右上角本來就有一個「依版稅／依串流」的切換器，版稅拿掉之後
   那個位置空出來，類型切換是接管既有的槽、不是新增一個東西。

   ── 量綱：三種「次」不是同一種次 ─────────────────────────────
   一次觀看＝看完一部電影或一集，一次串流＝聽一首歌，一次瀏覽＝載入一則貼文。
   投入程度差一個數量級，所以三者相加只看得出規模、不是表現指標。
   頁首 KPI 因此把總數攤成影視／音樂／貼文三個分項——總和旁邊就放著它的組成，
   讀者不會把 61% 的音樂佔比誤讀成「音樂表現最好」（那只是歌比較短）。

   ── 兩種分母，不可混用 ───────────────────────────────────────
   地區與平台：分母是「全部的次數」。平台報表會回報國別與播放通路，
              不需要認得出是誰。
   性別／星座／MBTI／生肖：分母是「認得出身分的人所產生的次數」，比全部的
              次數小很多。這四項屬性只存在於 ztor 會員資料，Netflix 回傳的是
              「這支影片被看了 71,200 次」，推不出任何一個人的星座。
              不標涵蓋率的話，54.2% 會被讀成全體觀眾的性別比，那是假的。

   ── 資料從哪裡來（不重造一份）───────────────────────────────
   影視與音樂的次數（總次數、平台、地區、Top 10）全部轉引 performance-store.js，
   本檔只補它沒有的那一半：人數、四項受眾屬性、以及整個貼文類型。
   理由跟 orders-store 一樣——同一份數字有兩份手寫副本，遲早會分岔。

   數字全為示意資料，非真實成效。
   ============================================================ */
(function () {
  'use strict';

  var PERIODS = ['m', 'q', 'y'];
  var SCOPES = ['all', 'film', 'music', 'post'];

  /* ── 資料時點 ───────────────────────────────────────────────
     影視與音樂走發行商報表、有延遲；貼文是站內統計、昨天的資料今天就有。
     兩者不同是事實，不要為了畫面整齊寫成同一天。
     「全部」取最舊的那一個——混合資料的新鮮度只能是其中最舊的那份。 */
  var ASOF = { film: '2026-06-30', music: '2026-06-30', post: '2026-08-06' };
  ASOF.all = ASOF.film;

  /* ══════════════ 人數（去重後）══════════════
     reach      ＝ 該期間接觸到的總人數（含認不出身分的）
     identified ＝ 其中站上有帳號、對應得到具體會員的人數，是四項屬性的分母

     影視的涵蓋率最低（Netflix／Disney+ 這類封閉 OTT 只給彙總數字），
     音樂高一些（Ztor 自己有播放通路），貼文最高（貼文只發生在站上，
     看的人多半是登入狀態）。

     all 不是三者相加，是去重後的真人數——同一個人聽你的歌也看你的片，
     只算一個人。這正是「人」這個單位唯一能跨類型合併的理由，也是
     三個 identified 加起來（88,390）遠大於 all（68,400）的原因：
     重疊很大，代表這三批人其實高度是同一群。 */
  var PEOPLE = {
    film:  {
      reach:      { m:  61300, q: 188400, y:  574200 },
      identified: { m:  11400, q:  34700, y:  105800 }
    },
    music: {
      reach:      { m:  84600, q: 246300, y:  731500 },
      identified: { m:  17800, q:  51800, y:  153900 }
    },
    /* 貼文的人數必然小於瀏覽次數（一則貼文被同一個人看兩次算兩次瀏覽、
       但只算一個人）。第一版把觸及人數寫成 38,600、瀏覽卻只有 3,038，
       等於「用 3,038 次瀏覽碰到 38,600 個人」，物理上不可能，已修正。 */
    post: {
      reach:      { m: 1810, q: 2140, y: 2140 },
      identified: { m: 1600, q: 1890, y: 1890 }
    },
    all: {
      reach:      { m: 104900, q: 312700, y:  941800 },
      identified: { m:  23600, q:  68400, y:  208300 }
    }
  };

  /* ══════════════ 認得出身分的人產生了多少次 ══════════════
     這是四項屬性在「次數」軸上的分母，比總次數小很多。
     會員通常比路人黏，所以這個比例（影視 23%、音樂 36%）都高於
     人數的比例（影視 18%、音樂 21%）——同一群人貢獻的次數比他們的頭數多。 */
  var ID_COUNTS = {
    film:  { m:  29600, q:  96400, y: 306800 },
    music: { m:  76500, q: 238300, y: 754100 },
    post:  { m:   2237, q:   2682, y:   2682 }
  };
  ID_COUNTS.all = sumByPeriod([ID_COUNTS.film, ID_COUNTS.music, ID_COUNTS.post]);

  function sumByPeriod(list) {
    var out = {};
    PERIODS.forEach(function (p) {
      out[p] = list.reduce(function (a, o) { return a + (o[p] || 0); }, 0);
    });
    return out;
  }

  /* ══════════════ 受眾屬性的分布權重 ══════════════
     值是該群佔母體的權重，繪製時換算成絕對值與百分比，
     所以任一期間的各項加起來一定等於母體——不會出現分項加不回總數。

     三個類型刻意給不同的分布，不是同一組乘係數：
       影視偏男、天蠍與獅子居前
       音樂偏女、雙魚與天蠍居前（抒情曲的聽眾結構）
       貼文最偏女、天秤居前
     「全部」不另寫第四張表，由這三張依各自的 identified 人數混算——
     多寫一張表就是多一個會跟其他三張分岔的地方。 */
  var ATTRS = {
    film: {
      gender: [
        { i18n: 'ar.gender.f', w: 42.1 },
        { i18n: 'ar.gender.m', w: 54.2 },
        { i18n: 'ar.gender.x', w: 3.7 }
      ],
      zodiac: [
        { i18n: 'ar.zo.scorpio', w: 11.4 }, { i18n: 'ar.zo.leo', w: 10.3 },
        { i18n: 'ar.zo.capricorn', w: 9.4 }, { i18n: 'ar.zo.pisces', w: 9.1 },
        { i18n: 'ar.zo.libra', w: 8.6 },    { i18n: 'ar.zo.virgo', w: 8.2 },
        { i18n: 'ar.zo.cancer', w: 7.9 },   { i18n: 'ar.zo.aries', w: 7.6 },
        { i18n: 'ar.zo.sagittarius', w: 7.4 }, { i18n: 'ar.zo.taurus', w: 7.1 },
        { i18n: 'ar.zo.gemini', w: 6.8 },   { i18n: 'ar.zo.aquarius', w: 6.2 }
      ],
      mbti: [
        { i18n: 'ar.mb.ESTJ', w: 11.3 }, { i18n: 'ar.mb.INFP', w: 8.4 },
        { i18n: 'ar.mb.ENFP', w: 7.9 },  { i18n: 'ar.mb.INFJ', w: 7.2 },
        { i18n: 'ar.mb.INTJ', w: 6.9 },  { i18n: 'ar.mb.ENTP', w: 6.5 },
        { i18n: 'ar.mb.INTP', w: 6.2 },  { i18n: 'ar.mb.ENFJ', w: 5.9 },
        { i18n: 'ar.mb.ISFP', w: 5.7 },  { i18n: 'ar.mb.ENTJ', w: 5.4 },
        { i18n: 'ar.mb.ISTP', w: 5.2 },  { i18n: 'ar.mb.ESFP', w: 5.0 },
        { i18n: 'ar.mb.ISFJ', w: 4.9 },  { i18n: 'ar.mb.ESFJ', w: 4.7 },
        { i18n: 'ar.mb.ESTP', w: 4.5 },  { i18n: 'ar.mb.ISTJ', w: 4.3 }
      ],
      shengxiao: [
        { i18n: 'ar.sx.pig', w: 12.4 },    { i18n: 'ar.sx.tiger', w: 11.2 },
        { i18n: 'ar.sx.rabbit', w: 10.4 }, { i18n: 'ar.sx.dragon', w: 9.9 },
        { i18n: 'ar.sx.horse', w: 9.1 },   { i18n: 'ar.sx.monkey', w: 8.4 },
        { i18n: 'ar.sx.rat', w: 7.9 },     { i18n: 'ar.sx.snake', w: 7.2 },
        { i18n: 'ar.sx.goat', w: 6.9 },    { i18n: 'ar.sx.dog', w: 6.4 },
        { i18n: 'ar.sx.ox', w: 5.6 },      { i18n: 'ar.sx.rooster', w: 4.6 }
      ]
    },
    music: {
      gender: [
        { i18n: 'ar.gender.f', w: 58.6 },
        { i18n: 'ar.gender.m', w: 38.1 },
        { i18n: 'ar.gender.x', w: 3.3 }
      ],
      zodiac: [
        { i18n: 'ar.zo.capricorn', w: 14.8 }, { i18n: 'ar.zo.pisces', w: 12.1 },
        { i18n: 'ar.zo.scorpio', w: 11.2 },   { i18n: 'ar.zo.cancer', w: 9.9 },
        { i18n: 'ar.zo.leo', w: 9.2 },        { i18n: 'ar.zo.libra', w: 8.4 },
        { i18n: 'ar.zo.virgo', w: 7.7 },      { i18n: 'ar.zo.aries', w: 6.9 },
        { i18n: 'ar.zo.sagittarius', w: 6.2 },{ i18n: 'ar.zo.taurus', w: 5.4 },
        { i18n: 'ar.zo.gemini', w: 4.8 },     { i18n: 'ar.zo.aquarius', w: 3.4 }
      ],
      mbti: [
        { i18n: 'ar.mb.ESTJ', w: 17.5 }, { i18n: 'ar.mb.INFP', w: 10.3 },
        { i18n: 'ar.mb.ENFP', w: 9.5 },  { i18n: 'ar.mb.INFJ', w: 8.2 },
        { i18n: 'ar.mb.ISFP', w: 7.3 },  { i18n: 'ar.mb.ENFJ', w: 6.5 },
        { i18n: 'ar.mb.INTP', w: 5.8 },  { i18n: 'ar.mb.INTJ', w: 5.3 },
        { i18n: 'ar.mb.ESFP', w: 4.9 },  { i18n: 'ar.mb.ENTP', w: 4.5 },
        { i18n: 'ar.mb.ISFJ', w: 4.2 },  { i18n: 'ar.mb.ENTJ', w: 3.8 },
        { i18n: 'ar.mb.ISTP', w: 3.4 },  { i18n: 'ar.mb.ESFJ', w: 3.2 },
        { i18n: 'ar.mb.ESTP', w: 2.9 },  { i18n: 'ar.mb.ISTJ', w: 2.7 }
      ],
      shengxiao: [
        { i18n: 'ar.sx.rabbit', w: 11.6 }, { i18n: 'ar.sx.pig', w: 11.5 },
        { i18n: 'ar.sx.tiger', w: 10.9 },  { i18n: 'ar.sx.dragon', w: 9.9 },
        { i18n: 'ar.sx.snake', w: 9.0 },   { i18n: 'ar.sx.horse', w: 8.2 },
        { i18n: 'ar.sx.rat', w: 7.5 },     { i18n: 'ar.sx.monkey', w: 7.1 },
        { i18n: 'ar.sx.ox', w: 6.9 },      { i18n: 'ar.sx.goat', w: 6.4 },
        { i18n: 'ar.sx.rooster', w: 5.7 }, { i18n: 'ar.sx.dog', w: 5.3 }
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
        { i18n: 'ar.zo.capricorn', w: 6.3 },{ i18n: 'ar.zo.sagittarius', w: 6.0 },
        { i18n: 'ar.zo.taurus', w: 5.6 },   { i18n: 'ar.zo.aquarius', w: 4.6 }
      ],
      mbti: [
        { i18n: 'ar.mb.ENFP', w: 10.9 }, { i18n: 'ar.mb.INFP', w: 10.1 },
        { i18n: 'ar.mb.ENTP', w: 8.7 },  { i18n: 'ar.mb.INFJ', w: 8.1 },
        { i18n: 'ar.mb.ENFJ', w: 7.3 },  { i18n: 'ar.mb.ESTJ', w: 7.2 },
        { i18n: 'ar.mb.INTP', w: 6.5 },  { i18n: 'ar.mb.ESFJ', w: 6.0 },
        { i18n: 'ar.mb.ESFP', w: 5.9 },  { i18n: 'ar.mb.INTJ', w: 5.4 },
        { i18n: 'ar.mb.ISFP', w: 5.0 },  { i18n: 'ar.mb.ENTJ', w: 4.5 },
        { i18n: 'ar.mb.ESTP', w: 4.1 },  { i18n: 'ar.mb.ISFJ', w: 3.8 },
        { i18n: 'ar.mb.ISTP', w: 3.4 },  { i18n: 'ar.mb.ISTJ', w: 3.1 }
      ],
      shengxiao: [
        { i18n: 'ar.sx.horse', w: 12.4 },  { i18n: 'ar.sx.tiger', w: 11.3 },
        { i18n: 'ar.sx.rabbit', w: 10.2 }, { i18n: 'ar.sx.dragon', w: 9.1 },
        { i18n: 'ar.sx.pig', w: 8.7 },     { i18n: 'ar.sx.monkey', w: 8.4 },
        { i18n: 'ar.sx.rat', w: 7.6 },     { i18n: 'ar.sx.ox', w: 7.3 },
        { i18n: 'ar.sx.goat', w: 6.8 },    { i18n: 'ar.sx.rooster', w: 6.3 },
        { i18n: 'ar.sx.snake', w: 6.2 },   { i18n: 'ar.sx.dog', w: 5.7 }
      ]
    }
  };

  /* ══════════════ 著作（Top 10 用）══════════════
     不能用 performance-store 的 FILM.units——那是「一部劇的八集」，是項目層級；
     本頁是創作者層級，要的是「我全部的著作誰表現最好」。

     作品名與權重沿用收入管理已建立的 roy.work1–11（同一批作品、同一組 i18n key、
     同一組季播放數），所以兩頁講同一部作品時名次一致。
     type 依 persona 分兩套，對照表與 earnings-sony 的 data-roy-works.types 同一份：
     default 是影視為主的創作者、nick（周湯豪）是音樂為主。只取一套的話，
     切 persona 之後作品名換了、類型沒換，影視區塊就會列出一堆歌。 */
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

  /* ══════════════ 貼文 ══════════════
     金額一律不在本檔（帶貨收益落在收入管理）。這裡只有次數與人數。

     明細列是貼文唯一的原始資料——KPI、型別表、Top 10 全部由它推導。
     各自寫死的話，切期間時 KPI 動了、表格沒動，讀者一加就對不起來；
     參考站「各欄位由下方貼文報告明細彙總」那句話，只有真的彙總才成立。

     標題直接寫中文：這些是創作者自己寫的貼文標題，不是介面文案，
     跟 orders-store 的收件人姓名同一個道理，不進 i18n。
     mention 用既有的作品 i18n key，讓貼文與站上的作品是同一批東西。 */
  var POSTS = {
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

  var POST_WINDOW = { m: 30, q: 90, y: 365 };

  function postRows(period) {
    var end = new Date(ASOF.post + 'T00:00:00Z').getTime();
    var start = end - (POST_WINDOW[period] || 90) * 86400000;
    return POSTS.rows.filter(function (r) {
      var t = new Date(r.date + 'T00:00:00Z').getTime();
      return t >= start && t <= end;
    });
  }

  function postViews(period) {
    return postRows(period).reduce(function (a, r) { return a + r.views; }, 0);
  }

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

  /* ══════════════ 共用計算 ══════════════ */

  function T(key) {
    var s = window.i18nT ? window.i18nT(key) : null;
    return s && s !== key ? s : key;
  }
  function num(n) { return Math.round(n).toLocaleString('en-US'); }
  function pct(n, d) { return n.toFixed(d === undefined ? 1 : d) + '%'; }

  function perf(scope) {
    var store = window.ztorPerformance && window.ztorPerformance.data;
    if (!store) return null;
    return scope === 'music' ? store.music : store.film;
  }

  /* 該類型該期間的總次數。all 是三者相加——量綱不同、只看得出規模，
     所以頁首 KPI 一定要同時把三個分項擺出來（見檔頭）。 */
  function counts(scope, period) {
    if (scope === 'post') return postViews(period);
    if (scope === 'all') {
      return counts('film', period) + counts('music', period) + counts('post', period);
    }
    var fam = perf(scope);
    return fam ? fam.total[period] : 0;
  }

  /* 把權重表換算成絕對值＋佔比，用最大餘數法分配，
     所以各列加起來精確等於母體（逐列四捨五入會差個一兩次，讀者一加就看得見）。 */
  function distribute(rows, total) {
    var sum = rows.reduce(function (a, r) { return a + r.w; }, 0) || 1;
    var raw = rows.map(function (r) {
      var exact = r.w / sum * total;
      return { key: r.key || r.i18n, i18n: r.i18n, name: r.name, rest: !!r.rest,
               exact: exact, n: Math.floor(exact), w: r.w / sum * 100 };
    });
    var short = Math.round(total) - raw.reduce(function (a, r) { return a + r.n; }, 0);
    raw.slice().sort(function (a, b) {
      return (b.exact - Math.floor(b.exact)) - (a.exact - Math.floor(a.exact));
    }).slice(0, short).forEach(function (r) { r.n += 1; });
    /* 「其他」永遠排最後，不參與名次競爭——它是餘數不是一個地區。 */
    var rest = raw.filter(function (r) { return r.rest; });
    var main = raw.filter(function (r) { return !r.rest; }).sort(function (a, b) { return b.n - a.n; });
    return main.concat(rest);
  }

  /* 把 performance-store 的絕對值轉成權重表（供 distribute 與跨類型混算共用）。 */
  function weightsFrom(rows, period) {
    return rows.map(function (r) {
      return { key: r.i18n || r.name, i18n: r.i18n, name: r.name, rest: !!r.rest, w: r.v[period] };
    });
  }

  /* 跨類型混算：把幾張權重表依各自的母體大小合併成一張。
     這是「全部」不另寫第四張資料表的做法——多寫一張就是多一個會分岔的地方。 */
  function blend(parts) {
    var acc = {}, order = [];
    parts.forEach(function (part) {
      var sum = part.rows.reduce(function (a, r) { return a + r.w; }, 0) || 1;
      part.rows.forEach(function (r) {
        var k = r.key || r.i18n || r.name;
        if (!acc[k]) { acc[k] = { key: k, i18n: r.i18n, name: r.name, rest: !!r.rest, w: 0 }; order.push(k); }
        acc[k].w += r.w / sum * part.weight;
      });
    });
    return order.map(function (k) { return acc[k]; });
  }

  /* ══════════════ 對外唯一入口 ══════════════
     series(scope, period, dim) → { rows, unit, base, has }
       rows ＝ [{ label 用的 i18n／name, n, w, rest }]
       unit ＝ 'counts'（次）或 'people'（人）
       base ＝ 分母，供呈現層說明「這些數字加起來等於什麼」
     dim ∈ works｜region｜platform｜gender｜zodiac｜mbti｜shengxiao

     兩種分母不可混用（見檔頭）：
       works／region／platform → 全部的次數（平台報表會回報國別與通路）
       gender／zodiac／mbti／shengxiao → 認得出身分的人所產生的次數 */
  function series(scope, period, dim, opts) {
    opts = opts || {};
    var base = baseFor(scope, period, dim);
    var w = weightsFor(scope, period, dim);
    if (!w || !w.length || !base) return { rows: [], unit: 'counts', base: base || 0, total: 0, has: false };
    var rows = distribute(w, base);
    /* opts.limit＝卡片上只給前 N 名（著作／平台／地區都有「查看更多」，各自截到 10）。
       opts.all＝要完整清單，彈窗用。total 一律回母體件數，供「顯示前 10、共 N 件」。
       屬性四區不傳 limit——12 個星座就是 12 列，那是完整的分布、截斷沒有意義。 */
    if (opts.limit && !opts.all && rows.length > opts.limit) {
      return { rows: rows.slice(0, opts.limit), unit: 'counts', base: base, total: rows.length, has: true, capped: true };
    }
    return { rows: rows, unit: 'counts', base: base, total: rows.length, has: true, capped: false };
  }

  /* 每一維的分母不一樣，這裡是唯一決定的地方：
       著作／地區 → 該類型的全部次數
       平台      → 只算影視＋音樂（貼文沒有平台之分），「全部」不可含貼文的次數，
                  否則那 3,038 次會被平白分配到串流平台上
       四項屬性  → 認得出身分的人所產生的次數 */
  function baseFor(scope, period, dim) {
    if (['gender', 'zodiac', 'mbti', 'shengxiao'].indexOf(dim) >= 0) return idCounts(scope, period);
    if (dim === 'platform') {
      if (scope === 'post') return 0;
      return scope === 'all' ? counts('film', period) + counts('music', period) : counts(scope, period);
    }
    return counts(scope, period);
  }

  function idCounts(scope, period) {
    var t = ID_COUNTS[scope];
    return t ? t[period] : 0;
  }

  function weightsFor(scope, period, dim) {
    if (dim === 'works') return workWeights(scope, period);
    if (dim === 'region') return regionWeights(scope, period);
    if (dim === 'platform') return platformWeights(scope, period);
    /* 四項屬性 */
    if (scope !== 'all') {
      var tbl = ATTRS[scope] && ATTRS[scope][dim];
      return tbl ? tbl.map(function (r) { return { key: r.i18n, i18n: r.i18n, w: r.w }; }) : null;
    }
    return blend(['film', 'music', 'post'].map(function (s) {
      return { weight: idCounts(s, period),
               rows: ATTRS[s][dim].map(function (r) { return { key: r.i18n, i18n: r.i18n, w: r.w }; }) };
    }));
  }

  function regionWeights(scope, period) {
    if (scope === 'post') {
      return POSTS.regions.map(function (r) { return { key: r.i18n, i18n: r.i18n, w: r.w }; });
    }
    if (scope === 'all') {
      return blend([
        { weight: counts('film', period),  rows: regionWeights('film', period) },
        { weight: counts('music', period), rows: regionWeights('music', period) },
        { weight: counts('post', period),  rows: regionWeights('post', period) }
      ]);
    }
    var fam = perf(scope);
    return fam ? weightsFrom(fam.territories, period) : null;
  }

  /* 貼文只發布在 ztor 站上、沒有平台之分，所以平台這一維沒有貼文，
     「全部」也只混影視與音樂。切換器要據此少給一個選項，
     而不是給一個點下去空白的選項。 */
  function platformWeights(scope, period) {
    if (scope === 'post') return null;
    if (scope === 'all') {
      return blend([
        { weight: counts('film', period),  rows: platformWeights('film', period) },
        { weight: counts('music', period), rows: platformWeights('music', period) }
      ]);
    }
    var fam = perf(scope);
    return fam ? weightsFrom(fam.platforms, period) : null;
  }

  /* 著作排行。影視與音樂各自從 WORKS 依 persona 過濾，貼文用貼文標題。
     「全部」把三者混在同一份排行裡——量綱不同，但頁首 KPI 已經把
     影視與音樂的規模差距攤開了，讀者有脈絡判斷這份混排代表什麼。 */
  function workWeights(scope, period) {
    var pk = personaKey();
    if (scope === 'post') {
      return postRows(period).map(function (r) {
        return { key: r.title, name: r.title, w: r.views, kind: 'post' };
      });
    }
    if (scope === 'all') {
      return blend([
        { weight: counts('film', period),  rows: workWeights('film', period) },
        { weight: counts('music', period), rows: workWeights('music', period) },
        { weight: counts('post', period),  rows: workWeights('post', period) }
      ]);
    }
    if (scope === 'film') {
      return WORKS.filter(function (r) { return r.t[pk] === 'video'; })
                  .map(function (r) { return { key: r.i18n, i18n: r.i18n, w: r.w }; });
    }
    var fam = perf('music');
    return fam ? fam.units.map(function (u) { return { key: u.i18n, i18n: u.i18n, w: u.a }; }) : null;
  }

  /* ── 著作 → 項目詳情的對應 ─────────────────────────────────
     實作 2026-08-10 搬進 projects-store（判定依據是項目清單，住在項目 store 才對），
     收入管理的內容收益分頁也吃同一支。這裡只留轉發，呼叫端不用改。 */
  function projectFor(title) {
    var store = window.ztorProjects;
    return store && store.projectFor ? store.projectFor(title) : null;
  }

  function coverage(scope, period) {
    var p = PEOPLE[scope];
    if (!p) return null;
    return {
      identified: p.identified[period],
      reach: p.reach[period],
      ratio: p.reach[period] ? p.identified[period] / p.reach[period] * 100 : 0,
      idCounts: idCounts(scope, period),
      counts: counts(scope, period)
    };
  }

  window.ztorAudience = {
    PERIODS: PERIODS,
    SCOPES: SCOPES,
    asOf: ASOF,
    posts: POSTS,
    works: WORKS,
    T: T, num: num, pct: pct,
    counts: counts,
    idCounts: idCounts,
    projectFor: projectFor,
    coverage: coverage,
    series: series,
    postRows: postRows,
    postByType: postByType
  };
})();
