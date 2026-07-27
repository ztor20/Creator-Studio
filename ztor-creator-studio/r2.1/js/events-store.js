/* events-store.js — 已建立活動的 mock 紀錄（編輯活動流程 edit-event.html 的預填來源）
   為什麼需要這支（2026-07-27）：
     編輯態的每個欄位都必須帶「使用者當初建立時填的值」。在此之前，活動事實只存在於
     events.html 的靜態列與 event-detail.html 的靜態卡；編輯頁若再抄一份，同一場活動
     的名稱／場地／票數就會有三份會各自漂移的副本。故比照 products-store／projects-store
     ／films-store 的既有作法，把活動紀錄收斂成一份可查詢的 mock。

   目前消費者：edit-event.html（?id=）。
   尚未接線：events.html 的清單列與 event-detail.html 仍是靜態 HTML——值刻意與本檔一致，
   但尚未改由本檔渲染（屬後續重構，見 UI-CHANGES 2026-07-27 該筆的「已知債」）。

   images 是「已上傳素材」的真實路徑（不是 true/false）：編輯頁必須顯示創作者當初上傳的圖，
   而不是四個空的上傳框；gallery 是 1–8 張的陣列。每筆刻意沿用活動清單那一列在用的圖檔，
   同一場活動不該在兩個畫面長著兩張不同的臉。

   category ＝ 活動清單第二排篩選的三分法（2026-07-27，使用者裁示）。判準是「核心是不是一場
   實體聚集」：實體演出的線上直播仍算演唱會（錨點是那場實體演出），純線上才算線上活動。
   建立流程的六個 type 對應到三個 category（**此表是唯一出處**，events.html 的列只帶結果）：
     concert  → concert     ｜ festival → concert      （實體現場演出）
     meet     → fans-meet   ｜ launch   → fans-meet    （近距離接觸／發片慶祝；launch 屬判斷題，見 UI-CHANGES）
     virtual  → online      ｜ watchparty → online     （純線上）
   邊界說明：fans-meet 是以「實體的近距離接觸」定義，online 是以「媒介」定義，故線上的粉絲互動
   依使用者的定義歸 online。

   sold／status 是編輯態的行為輸入、不只是顯示值：
     · sold > 0  → 場次已售出，容量不得低於 sold、已售票種不可刪。
     · status='on-sale' → 已公開販售，改日期／場地屬「會通知到購票者」的高影響欄位。
   資料為原型 mock，非真實票務數字（見 ASSUMPTIONS.md）。 */
(function () {
  'use strict';

  var EVENTS = [
    {
      id: 'realive-chongqing',
      type: 'concert',                       // 對應 create-event 的 selection-card data-choice
      typeLabelKey: 'ce.type.concert',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      name: 'REALIVE World Tour (China) — Chongqing',
      desc: 'The China leg opener. Full band, new staging, and the first live airing of three unreleased tracks.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Feisheng Livehouse',
      city: 'Chongqing, China',
      address: 'No. 46 Jianxin North Rd, Jiangbei District',
      date: '2026-10-25',
      start: '20:00',
      end: '22:30',
      doors: '19:00',
      capacity: 120,
      tiers: [
        { id: 'tier-ga',  name: 'General admission', price: 30, qty: 100, sold: 72 },
        { id: 'tier-vip', name: 'VIP · soundcheck',  price: 60, qty: 20,  sold: 12 }
      ],
      sold: 84,
      revenue: 2520,
      status: 'on-sale',
      images: { thumb: 'images/projects/nick-baipa.jpg', poster: 'images/projects/nick-realive.jpg', banner: 'images/projects/nick-asn.jpg', gallery: ['images/projects/nick-i.jpg', 'images/projects/nick-lwh.jpg'] },
      video: false
    },
    {
      id: 'taiwan-fest-kenting',
      type: 'festival',
      typeLabelKey: 'ce.type.festival',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      name: 'Taiwan Fest Kenting — Guest set',
      desc: 'Guest appearance on the main stage, 40-minute set.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Kenting Dawan',
      city: 'Pingtung, Taiwan',
      address: '',
      date: '2026-10-04',
      start: '17:00',
      end: '',
      doors: '',
      capacity: 0,                           // 0 = unlimited（節慶場不由本方售票）
      tiers: [],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { thumb: 'images/projects/nick-wln.jpg', poster: '', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'lrh-taichung-watchback',
      type: 'watchparty',
      typeLabelKey: 'ce.type.watchparty',
      category: 'online',                  // 見檔頭 TYPE→CATEGORY 對應表
      name: 'LOVE·RAGE·HOPE Taichung — Watch-back party',
      desc: 'Watch the Taichung night back together, with the band in chat.',
      lineup: [],
      venue: 'Online',
      city: '',
      address: '',
      date: '2026-08-08',
      start: '21:00',
      end: '',
      doors: '',
      capacity: 300,
      tiers: [{ id: 'tier-entry', name: 'Admission', price: 5, qty: 300, sold: 38 }],
      sold: 38,
      revenue: 190,
      status: 'on-sale',
      images: { thumb: 'images/projects/nick-lrh-tour.jpg', poster: '', banner: 'images/projects/nick-lrh.jpg', gallery: [] },
      video: false
    },
    {
      /* 進行中的場次（2026-07-27）——今天就是開演日，所以 stage/status 是 'live'。
         必須是「今天」：日期寫未來卻標進行中，會跟它自己顯示的日期打架。
         這是唯一帶 roster（到場名單）的一筆，現場報到台面就靠它。 */
      id: 'inner-circle-taipei',
      type: 'meet',
      typeLabelKey: 'ce.type.meet',
      category: 'fans-meet',
      name: 'Inner Circle Fan Meet — Taipei',
      desc: 'Two hours with the inner circle: acoustic set, Q&A, and a signed polaroid for every guest.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Neo Studio',
      city: 'Taipei, Taiwan',
      address: 'No. 88 Bade Rd Sec 4, Songshan District',
      date: '2026-07-27',
      start: '14:00',
      end: '16:00',
      doors: '13:30',
      capacity: 200,
      tiers: [
        { id: 'tier-inner', name: 'Inner Circle seat', price: 250, qty: 180, sold: 180 },
        { id: 'tier-plus',  name: 'Inner Circle + polaroid', price: 250, qty: 20, sold: 20 }
      ],
      sold: 200,
      revenue: 50000,
      status: 'live',
      startedMinutesAgo: 42,          // 現場已進行時間（原型固定值，不接真實時鐘）
      arrivedAtOpen: 132,             // 開頁當下的到場數；其餘由頁面的即時計數往上跑
      images: { thumb: 'images/projects/nick-asn.jpg', poster: '', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'album-signing-taipei',
      type: 'meet',
      typeLabelKey: 'ce.type.meet',
      category: 'fans-meet',
      name: 'Album signing — Taipei',
      desc: 'In-store signing for the new record. 150 numbered slots, one item signed per slot.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Eslite Xinyi',
      city: 'Taipei, Taiwan',
      address: 'No. 11 Songgao Rd, Xinyi District',
      date: '2026-09-12',
      start: '14:00',
      end: '16:00',
      doors: '13:30',
      capacity: 150,
      tiers: [{ id: 'tier-slot', name: 'Signing slot', price: 5, qty: 150, sold: 118 }],
      sold: 118,
      revenue: 590,
      status: 'on-sale',
      images: { thumb: 'images/projects/nick-baipa-goods.jpg', poster: '', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'pingtung-bluefin',
      type: 'festival',
      typeLabelKey: 'ce.type.festival',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      name: 'Pingtung Bluefin Festival — Ocean concert',
      desc: 'Ocean-side stage as part of the Bluefin Tuna Cultural Tourism Festival.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Pingtung',
      city: 'Pingtung, Taiwan',
      address: '',
      date: '2026-11-02',
      start: '18:30',
      end: '',
      doors: '',
      capacity: 0,
      tiers: [],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { thumb: 'images/projects/nick-flames.jpg', poster: '', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'taipei-nye',
      type: 'festival',
      typeLabelKey: 'ce.type.festival',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      name: "Taipei New Year's Eve countdown",
      desc: "Countdown stage set for Taipei's New Year's Eve city party.",
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: "Taipei New Year's Eve",
      city: 'Taipei, Taiwan',
      address: '',
      date: '2026-12-31',
      start: '22:00',
      end: '',
      doors: '',
      capacity: 0,
      tiers: [],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { thumb: 'images/hero-event.jpg', poster: '', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'realive-r2-watchparty',
      type: 'watchparty',
      typeLabelKey: 'ce.type.watchparty',
      category: 'online',                  // 見檔頭 TYPE→CATEGORY 對應表
      name: 'REALIVE (R2) Concert Film — Watch party',
      desc: 'Stream the concert film together, with a live chat room.',
      lineup: [],
      venue: 'Online',
      city: '',
      address: '',
      date: '2027-02-01',
      start: '21:00',
      end: '',
      doors: '',
      capacity: 200,
      tiers: [{ id: 'tier-entry', name: 'Admission', price: 5, qty: 200, sold: 142 }],
      sold: 142,
      revenue: 710,
      status: 'on-sale',
      images: { thumb: 'images/projects/nick-r2.jpg', poster: 'images/projects/nick-realive.jpg', banner: 'images/projects/nick-r2.jpg', gallery: [] },
      video: false
    },
    {
      id: 'lrh-taichung',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      name: 'LOVE·RAGE·HOPE Live House Tour — Taichung',
      desc: 'Taichung stop of the LOVE·RAGE·HOPE live house tour.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Legacy Taichung',
      city: 'Taichung, Taiwan',
      address: '',
      date: '2026-04-11',
      start: '20:00',
      end: '22:30',
      doors: '19:00',
      capacity: 600,
      tiers: [{ id: 'tier-ga', name: 'General admission', price: 30, qty: 600, sold: 600 }],
      sold: 600,
      revenue: 18000,
      status: 'ended',
      images: { thumb: 'images/projects/nick-lrh-tour.jpg', poster: 'images/projects/nick-lrh.jpg', banner: 'images/projects/nick-lrh-tour.jpg', gallery: ['images/projects/nick-realive.jpg'] },
      video: false
    },
    {
      id: 'realive-r2-arena',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      name: 'REALIVE (R2) Special Ed. — Taipei Arena',
      desc: 'Hometown finale at Taipei Arena, presented with motorola.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Taipei Arena',
      city: 'Taipei, Taiwan',
      address: '',
      date: '2025-05-23',
      start: '20:00',
      end: '22:45',
      doors: '18:30',
      capacity: 10000,
      tiers: [{ id: 'tier-ga', name: 'General admission', price: 32, qty: 10000, sold: 10000 }],
      sold: 10000,
      revenue: 320000,
      status: 'ended',
      images: { thumb: 'images/projects/nick-r2-special.jpg', poster: 'images/projects/nick-r2.jpg', banner: 'images/projects/nick-r2-special.jpg', gallery: ['images/projects/nick-real-life.jpg'] },
      video: false
    },
    {
      id: 'next-leg-draft',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      name: 'REALIVE World Tour — Next leg (planning)',
      desc: '',
      lineup: [],
      venue: '',
      city: '',
      address: '',
      date: '',
      start: '',
      end: '',
      doors: '',
      capacity: 0,
      tiers: [],
      sold: 0,
      revenue: 0,
      status: 'draft',
      images: { thumb: '', poster: '', banner: '', gallery: [] },
      video: false
    }
  ];


  /* ── 到場名單（roster）─────────────────────────────────────
     現場報到台需要「誰到了、誰還沒到」，而不只是一個總數。200 筆手寫沒有意義，
     故由固定名單池決定性地生成（不用 Math.random：同樣的輸入永遠得到同樣的名單，
     截圖與計數斷言才穩定）。前 arrivedAtOpen 筆標記為已到場，其餘未到。
     真實資料來源是票務系統，此處為原型 mock（見 ASSUMPTIONS.md）。 */
  var GIVEN = ['Yuchen','Mika','Sora','Diego','Priya','Noel','Hana','Ken','Ada','Lucas',
               'Wei','Nina','Ravi','Sam','Iris','Tomo','Lena','Jun','Maya','Owen',
               'Chloe','Ethan','Rina','Kai','Vera','Leo','Suki','Marco','Yuki','Ines'];
  var FAMILY = ['Lin','Tanaka','Kim','Alvarez','Nair','Chen','Wu','Sato','Park','Silva',
                'Huang','Ito','Patel','Costa','Yang','Mori','Cheng','Ono','Reyes','Tsai'];
  var TIERS_LABEL = ['Inner Circle seat', 'Inner Circle + polaroid'];

  function buildRoster(ev) {
    var n = ev.sold || 0, arrived = ev.arrivedAtOpen || 0, out = [];
    for (var i = 0; i < n; i++) {
      var g = GIVEN[i % GIVEN.length];
      var f = FAMILY[(i * 7 + 3) % FAMILY.length];
      out.push({
        seq: i + 1,
        name: g + ' ' + f,
        tier: TIERS_LABEL[i % 17 === 0 ? 1 : 0],          // 約每 17 位一位是加購 polaroid
        code: 'ZT-' + String(4200 + i * 13).slice(-4),
        arrived: i < arrived,
        /* 到場時間：開場前後散開，僅供顯示（原型不接真實時鐘） */
        at: i < arrived ? (13 * 60 + 30 + Math.floor(i * 0.62)) : null
      });
    }
    return out;
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  window.ztorEvents = {
    list: function () { return clone(EVENTS); },
    get: function (id) {
      for (var i = 0; i < EVENTS.length; i++) {
        if (EVENTS[i].id === id) return clone(EVENTS[i]);
      }
      return clone(EVENTS[0]);               // 未知 id → 首筆，編輯頁永遠有東西可顯示
    },
    /* 到場名單：只有進行中的場次會用到（現場報到台面） */
    roster: function (id) {
      var ev = window.ztorEvents.get(id);
      return ev && ev.status === 'live' ? buildRoster(ev) : [];
    },
    /* 票種已售出的張數（容量下限與「可否刪除票種」都靠它） */
    soldOf: function (ev) {
      if (!ev || !ev.tiers) return 0;
      return ev.tiers.reduce(function (n, t) { return n + (t.sold || 0); }, 0);
    }
  };
}());
