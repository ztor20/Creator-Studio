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
   而不是三個空的上傳框；gallery 是 1–8 張的陣列。每筆刻意沿用活動清單那一列在用的圖檔，
   同一場活動不該在兩個畫面長著兩張不同的臉。
   2026-07-31（D164 / documents 5.1.6.1 F4）：素材槽由四個收斂為三個——原本的 thumb（縮圖）與
   poster（直式海報）比例統一後形狀相同、素材同源，併成單一 keyvisual（主視覺）；banner（橫式
   橫幅 1920×1080）是全站唯一保留的橫式例外；gallery 不變。舊 key thumb／poster 已退場。

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
      id: 'realive-asia-kaohsiung',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      /* 系列的第 1 場（2026-08-06）。`series.id` 是同日新增的欄位：有了它，活動詳情的
         「系列」分頁才能從 store 撈出同系列的其他場，不必再掛示例資料。同一個系列的三場
         **共用同一組票種設定、數量各場獨立**（使用者裁決），所以三筆的 tiers 價格與 qty 完全相同，
         只有 sold 不同；名稱也刻意三場相同，靠日期與場地分辨（SER-001 ⑥）。 */
      series: { id: 'realive-asia', hasPage: true, name: 'REALIVE World Tour — Asia leg', index: 1, total: 3 },
      name: 'REALIVE World Tour — Asia leg',
      desc: 'The Asia leg — three cities, one setlist.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Kaohsiung Arena',
      city: 'Kaohsiung, Taiwan',
      address: '',
      date: '2026-09-12',
      start: '19:30',
      end: '22:00',
      doors: '18:30',
      /* 早到政策（2026-08-11 與建立流程同步）：比自己那張票的入場時間早到的人怎麼辦。
         沒寫的活動預設 'warn'（仍可入場）；這一場示範 'block'。 */
      early: 'block',
      capacity: 600,
      /* fee＝手續費、earlyMin＝比開放入場提早幾分鐘（皆 2026-08-11 新欄，沒寫＝無）。 */
      tiers: [
        { id: 'tier-vip',   name: 'VIP',    price: 4200, qty: 100, sold: 100, fee: 100, earlyMin: 30 },
        { id: 'tier-floor', name: 'Floor',  price: 3300, qty: 200, sold: 200, fee: 100 },
        { id: 'tier-seat',  name: 'Seated', price: 2400, qty: 300, sold: 300 }
      ],
      /* 票務商品（2026-08-11）：建立流程第 6 步綁出來的組合包。與單賣的票共用同一個
         數量池——賣掉一組就從它含的那張票扣一張（BDL-001，編輯規則待上游）。
         2026-08-17：`products` 由字串陣列改為 `{ name, img }`——售票進度卡要把「這一組裡面
         裝了什麼」用圖顯示出來，光有名字排不出那排縮圖。商品名與圖沿用 js/products-store.js
         的 nick 批（同一件商品在電子商店與這裡不該長兩張臉）；圖路徑直接寫在這裡而不是
         跨檔去查 products-store，理由同 images.keyvisual——那支是 persona 綁定的，
         活動資料不該跟著 persona 切換而換掉組合包內容。 */
      bundles: [
        { id: 'bd-vip-tee', name: 'VIP ＋ 巡演官方 Tee', tickets: [{ tier: 'tier-vip', n: 1 }],
          products: [{ name: 'REALIVE 白趴 官方 Tee', img: 'images/products/tee-black.webp' }],
          price: 4800, sold: 12, cap: 50 }
      ],
      /* 發布設定（2026-08-11 新欄）：建立流程第 7 步的三個選擇，沒寫＝直接開賣／電子門票／公開。 */
      publish: { onsale: 'now', pickup: 'eticket', visibility: 'public' },
      sold: 600,
      revenue: 1800000,
      status: 'on-sale',
      images: { keyvisual: 'images/projects/nick-realive.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'realive-asia-taichung',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      /* 系列的第 2 場（2026-08-06）。`series.id` 是同日新增的欄位：有了它，活動詳情的
         「系列」分頁才能從 store 撈出同系列的其他場，不必再掛示例資料。同一個系列的三場
         **共用同一組票種設定、數量各場獨立**（使用者裁決），所以三筆的 tiers 價格與 qty 完全相同，
         只有 sold 不同；名稱也刻意三場相同，靠日期與場地分辨（SER-001 ⑥）。 */
      series: { id: 'realive-asia', hasPage: true, name: 'REALIVE World Tour — Asia leg', index: 2, total: 3 },
      name: 'REALIVE World Tour — Asia leg',
      desc: 'The Asia leg — three cities, one setlist.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Taichung Intercontinental',
      city: 'Taichung, Taiwan',
      address: '',
      date: '2026-09-26',
      start: '19:30',
      end: '22:00',
      doors: '18:30',
      capacity: 600,
      tiers: [
        { id: 'tier-vip',   name: 'VIP',    price: 4200, qty: 100, sold: 80 },
        { id: 'tier-floor', name: 'Floor',  price: 3300, qty: 200, sold: 140 },
        { id: 'tier-seat',  name: 'Seated', price: 2400, qty: 300, sold: 220 }
      ],
      sold: 440,
      revenue: 1326000,
      status: 'on-sale',
      images: { keyvisual: 'images/projects/nick-realive.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'realive-asia-taipei',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      /* 系列的第 3 場（2026-08-06）。`series.id` 是同日新增的欄位：有了它，活動詳情的
         「系列」分頁才能從 store 撈出同系列的其他場，不必再掛示例資料。同一個系列的三場
         **共用同一組票種設定、數量各場獨立**（使用者裁決），所以三筆的 tiers 價格與 qty 完全相同，
         只有 sold 不同；名稱也刻意三場相同，靠日期與場地分辨（SER-001 ⑥）。 */
      series: { id: 'realive-asia', hasPage: true, name: 'REALIVE World Tour — Asia leg', index: 3, total: 3 },
      name: 'REALIVE World Tour — Asia leg',
      desc: 'The Asia leg — three cities, one setlist.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Taipei Arena',
      city: 'Taipei, Taiwan',
      address: '',
      date: '2026-10-03',
      start: '19:30',
      end: '22:00',
      doors: '18:30',
      capacity: 600,
      tiers: [
        /* reserved＝下單未付款佔走的、paused＝暫停販售（2026-08-11 新欄，示範營運列表用）。 */
        { id: 'tier-vip',   name: 'VIP',    price: 4200, qty: 100, sold: 40, fee: 100, earlyMin: 30, reserved: 6 },
        { id: 'tier-floor', name: 'Floor',  price: 3300, qty: 200, sold: 60, fee: 100, reserved: 11 },
        { id: 'tier-seat',  name: 'Seated', price: 2400, qty: 300, sold: 100, paused: true }
      ],
      bundles: [
        { id: 'bd-vip-tee', name: 'VIP ＋ 巡演官方 Tee', tickets: [{ tier: 'tier-vip', n: 1 }],
          products: [{ name: 'REALIVE 白趴 官方 Tee', img: 'images/products/tee-black.webp' }],
          price: 4800, sold: 3, cap: 50 },
        { id: 'bd-vip-zine', name: 'VIP ＋ 精裝寫真誌', tickets: [{ tier: 'tier-vip', n: 1 }],
          products: [{ name: 'REALIVE 巡演精裝寫真誌', img: 'images/products/tour-zine-vol-02.webp' }],
          price: 5200, sold: 7, cap: 40 }
      ],
      publish: { onsale: 'scheduled', pickup: 'sf', visibility: 'public' },
      sold: 200,
      revenue: 606000,
      status: 'on-sale',
      images: { keyvisual: 'images/projects/nick-realive.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'realive-chongqing',
      type: 'concert',                       // 對應 create-event 的 selection-card data-choice
      typeLabelKey: 'ce.type.concert',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      /* 2026-08-13：補上 series.id——原本只有名稱與序號，麵包屑長不出系列層、系列分頁
         也撈不到同系列其他場，等於「看得到 2/3、點不進去」。三場共用同一個 id。
         沒有 `hasPage`：原型只替 realive-asia 做了系列母頁（series-detail.html）。有母頁的
         系列，子場的共用設定改在母頁（詳情頁收起編輯鈕）；沒有母頁的系列就地編輯，
         麵包屑那一層也只顯示名稱、不做成連結——連到一個不存在的母頁比沒有連結更糟。 */
      series: { id: 'realive-world-tour', name: 'REALIVE World Tour', index: 2, total: 3 },
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
        { id: 'tier-ga',  name: 'General admission', price: 25, qty: 100, sold: 72 },
        { id: 'tier-vip', name: 'VIP · soundcheck',  price: 60, qty: 20,  sold: 12 }
      ],
      sold: 84,
      revenue: 2520,
      status: 'on-sale',
      images: { keyvisual: 'images/projects/nick-realive.jpg', banner: 'images/projects/nick-asn.jpg', gallery: ['images/projects/nick-i.jpg', 'images/projects/nick-lwh.jpg'] },
      video: false
    },
    {
      id: 'taiwan-fest-kenting',
      type: 'festival',
      typeLabelKey: 'ce.type.festival',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      series: null,
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
      images: { keyvisual: 'images/projects/nick-wln.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'lrh-taichung-watchback',
      type: 'watchparty',
      typeLabelKey: 'ce.type.watchparty',
      category: 'online',                  // 見檔頭 TYPE→CATEGORY 對應表
      series: null,
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
      /* 線上房間（2026-08-13，D149 落地）：共看派對不套票種頁與取票方式，但入場方式與
         付費門檻總得有個地方看。room.url＝觀眾進的房間、entry＝單一入場券的價格（同 tiers[0]，
         此處不另存一份金額）、chat＝是否開聊天室。實際房控功能仍待上游（見 ASSUMPTIONS WP-001）。 */
      room: { url: 'ztor.live/w/lrh-taichung-watchback', chat: true, capacity: 300 },
      tiers: [{ id: 'tier-entry', name: 'Admission', price: 5, qty: 300, sold: 38 }],
      sold: 38,
      revenue: 190,
      status: 'on-sale',
      images: { keyvisual: 'images/projects/nick-lrh-tour.jpg', banner: 'images/projects/nick-lrh.jpg', gallery: [] },
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
      series: null,
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
      images: { keyvisual: 'images/projects/nick-asn.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'album-signing-taipei',
      type: 'meet',
      typeLabelKey: 'ce.type.meet',
      category: 'fans-meet',
      series: null,
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
      /* 場次陣列（2026-08-11 使用者指示）：**定點活動的多場次收進同一筆活動**——場地共用一份，
         每場自己的日期時間與早到政策。單值的 date/start/end/doors 維持＝第 1 場的鏡像
         （頁首、清單列等舊消費端照讀）。多站活動（每站不同場地）才拆成系列母子頁。 */
      sessions: [
        { id: 's1', date: '2026-09-12', start: '14:00', end: '16:00', doors: '13:30', early: 'warn' },
        { id: 's2', date: '2026-09-13', start: '14:00', end: '16:00', doors: '13:30', early: 'warn' },
        { id: 's3', date: '2026-09-14', start: '19:00', end: '21:00', doors: '18:00', early: 'block' }
      ],
      capacity: 150,
      tiers: [{ id: 'tier-slot', name: 'Signing slot', price: 5, qty: 150, sold: 118 }],
      /* 2026-08-13：多一筆組合包示範，讓「票券綁商品」不是只有巡演那兩場看得到
         （組合包與單賣的票共用同一個數量池，賣掉一組就從它含的那張票扣一張，BDL-001）。 */
      bundles: [
        { id: 'bd-slot-vinyl', name: '簽名場次 ＋ 限量黑膠', tickets: [{ tier: 'tier-slot', n: 1 }],
          products: [{ name: 'LOVE RAGE HOPE 限量黑膠 1/500', img: 'images/products/coastline-acetate.webp' }],
          price: 45, sold: 26, cap: 60 }
      ],
      sold: 118,
      revenue: 590,
      status: 'on-sale',
      images: { keyvisual: 'images/projects/nick-baipa-goods.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'pingtung-bluefin',
      type: 'festival',
      typeLabelKey: 'ce.type.festival',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      series: null,
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
      images: { keyvisual: 'images/projects/nick-flames.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'taipei-nye',
      type: 'festival',
      typeLabelKey: 'ce.type.festival',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      series: null,
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
      /* 2026-08-13：這一場備好票種，當「準備中 → 開賣」那條動線的完整示範——
         其餘準備中的活動票種仍為空，示範的是「還不能開賣、缺什麼直接列出來」那一半。 */
      tiers: [
        { id: 'tier-early', name: 'Early bird', price: 800, qty: 400, sold: 0 },
        { id: 'tier-ga',    name: 'General admission', price: 1200, qty: 1600, sold: 0 }
      ],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { keyvisual: 'images/hero-event.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'realive-r2-watchparty',
      type: 'watchparty',
      typeLabelKey: 'ce.type.watchparty',
      category: 'online',                  // 見檔頭 TYPE→CATEGORY 對應表
      series: null,
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
      /* 線上房間（2026-08-13，D149 落地）：共看派對不套票種頁與取票方式，但入場方式與
         付費門檻總得有個地方看。room.url＝觀眾進的房間、entry＝單一入場券的價格（同 tiers[0]，
         此處不另存一份金額）、chat＝是否開聊天室。實際房控功能仍待上游（見 ASSUMPTIONS WP-001）。 */
      room: { url: 'ztor.live/w/realive-r2-watchparty', chat: true, capacity: 200 },
      tiers: [{ id: 'tier-entry', name: 'Admission', price: 5, qty: 200, sold: 142 }],
      sold: 142,
      revenue: 710,
      status: 'on-sale',
      images: { keyvisual: 'images/projects/nick-realive.jpg', banner: 'images/projects/nick-r2.jpg', gallery: [] },
      video: false
    },
    {
      id: 'lrh-taichung',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      series: { name: 'LOVE·RAGE·HOPE Live House Tour', index: 3, total: 6 },
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
      images: { keyvisual: 'images/projects/nick-lrh.jpg', banner: 'images/projects/nick-lrh-tour.jpg', gallery: ['images/projects/nick-realive.jpg'] },
      video: false
    },
    {
      id: 'realive-r2-arena',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      series: { id: 'realive-world-tour', name: 'REALIVE World Tour', index: 1, total: 3 },
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
      images: { keyvisual: 'images/projects/nick-r2.jpg', banner: 'images/projects/nick-r2-special.jpg', gallery: ['images/projects/nick-real-life.jpg'] },
      video: false
    },
    {
      id: 'next-leg-draft',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      series: { id: 'realive-world-tour', name: 'REALIVE World Tour', index: 3, total: 3 },
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
      images: { keyvisual: '', banner: '', gallery: [] },
      video: false
    },

    /* ══ 六個狀態 × 五個類型的完整矩陣（2026-08-17 使用者指示）══════════════════
       在此之前，可挑的組合有一半是空的：線上活動（virtual）全站一筆都沒有、已取消整個
       狀態沒有任何活動、進行中只有一場見面會。要看「售票中的多站巡演長什麼樣」可以，
       要看「已取消的共看派對長什麼樣」就沒有東西可看——而那正是原型要拿來評估的地方。

       矩陣的兩條軸：
         狀態＝已排程／售票中／進行中／已結束／已取消／草稿（清單上的六個分頁）
         類型＝演唱會／多站演唱會／粉絲見面會／線上活動／共看派對（使用者指定的五種）
       多站演唱會每個狀態一個系列、各 2 站（使用者裁決）；同一個系列的兩站共用票種設定，
       數量各站獨立，與既有的 realive-asia 同一套規則。

       數字的內部一致性：`sold` 與 `revenue` 一律等於票種的加總（sold＝Σsold，
       revenue＝Σ price×sold），清單那一列的數字與詳情頁票種表因此不可能對不起來。
       非真實票務數字，同全檔口徑（見 ASSUMPTIONS.md）。 */
    {
      id: 'nick-symphonic-taipei',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: null,
      name: 'NICK Symphonic Night — Taipei',
      desc: 'The catalogue rearranged for a full orchestra. One night, seated only.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Taipei Music Center',
      city: 'Taipei, Taiwan',
      address: '',
      date: '2026-12-05',
      start: '19:30',
      end: '21:30',
      doors: '18:30',
      capacity: 600,
      tiers: [
        { id: 'tier-lower', name: 'Lower level', price: 2800, qty: 400, sold: 0 },
        { id: 'tier-upper', name: 'Upper level', price: 1800, qty: 200, sold: 0 }
      ],
      publish: { onsale: 'scheduled', pickup: 'eticket', visibility: 'public' },
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { keyvisual: 'images/projects/nick-lwh.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'realive-sea-singapore',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: { id: 'realive-sea', name: 'REALIVE World Tour — Southeast Asia leg', index: 1, total: 2 },
      name: 'REALIVE World Tour — Southeast Asia leg',
      desc: 'Two cities, one setlist — the Southeast Asia run.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Capitol Theatre',
      city: 'Singapore',
      address: '',
      date: '2027-01-16',
      start: '20:00',
      end: '22:00',
      doors: '19:00',
      capacity: 800,
      tiers: [
        { id: 'tier-early', name: 'Early bird', price: 1800, qty: 300, sold: 0 },
        { id: 'tier-ga', name: 'General admission', price: 2400, qty: 500, sold: 0 }
      ],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { keyvisual: 'images/projects/nick-realive.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'realive-sea-kl',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: { id: 'realive-sea', name: 'REALIVE World Tour — Southeast Asia leg', index: 2, total: 2 },
      name: 'REALIVE World Tour — Southeast Asia leg',
      desc: 'Two cities, one setlist — the Southeast Asia run.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Zepp Kuala Lumpur',
      city: 'Kuala Lumpur, Malaysia',
      address: '',
      date: '2027-01-23',
      start: '20:00',
      end: '22:00',
      doors: '19:00',
      capacity: 800,
      tiers: [
        { id: 'tier-early', name: 'Early bird', price: 1800, qty: 300, sold: 0 },
        { id: 'tier-ga', name: 'General admission', price: 2400, qty: 500, sold: 0 }
      ],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { keyvisual: 'images/projects/nick-realive.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'lrh-signing-taichung',
      type: 'meet',
      typeLabelKey: 'ce.type.meet',
      category: 'fans-meet',
      series: null,
      name: 'LOVE RAGE HOPE signing — Taichung',
      desc: 'In-store signing for the fifth album. 120 numbered slots, one item signed per slot.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Eslite Park Lane',
      city: 'Taichung, Taiwan',
      address: '',
      date: '2026-11-08',
      start: '14:00',
      end: '16:00',
      doors: '13:30',
      capacity: 120,
      tiers: [
        { id: 'tier-slot', name: 'Signing slot', price: 600, qty: 120, sold: 0 }
      ],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { keyvisual: 'images/projects/nick-lrh.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'lrh-writing-class',
      type: 'virtual',
      typeLabelKey: 'ce.type.virtual',
      category: 'online',
      series: null,
      name: 'LOVE RAGE HOPE — Writing session, online',
      desc: 'Two hours on how the album was written, starting from the demo of the opening track.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Online',
      city: '',
      address: '',
      date: '2026-11-20',
      start: '21:00',
      end: '23:00',
      doors: '',
      capacity: 500,
      room: { url: 'ztor.live/v/lrh-writing-class', chat: true, capacity: 500 },
      tiers: [
        { id: 'tier-stream', name: 'Live stream', price: 300, qty: 400, sold: 0 },
        { id: 'tier-qa', name: 'Stream + Q and A seat', price: 600, qty: 100, sold: 0 }
      ],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { keyvisual: 'images/projects/nick-wln.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'flames-mv-premiere',
      type: 'watchparty',
      typeLabelKey: 'ce.type.watchparty',
      category: 'online',
      series: null,
      name: 'FLAMES MV (remastered) — Premiere watch party',
      desc: 'Premiere the remastered video together, with the director in chat.',
      lineup: [],
      venue: 'Online',
      city: '',
      address: '',
      date: '2026-12-24',
      start: '21:00',
      end: '',
      doors: '',
      capacity: 500,
      room: { url: 'ztor.live/w/flames-mv-premiere', chat: true, capacity: 500 },
      tiers: [
        { id: 'tier-entry', name: 'Admission', price: 150, qty: 500, sold: 0 }
      ],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { keyvisual: 'images/projects/nick-flames.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'nantou-lantern-opening',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: null,
      name: 'Nantou Lantern Festival — Opening night',
      desc: 'The opening-night stage of the city lantern festival. One set, no support act.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Nantou Expo Center',
      city: 'Nantou, Taiwan',
      address: '',
      date: '2027-01-25',
      start: '19:00',
      end: '20:30',
      doors: '18:00',
      capacity: 3000,
      tiers: [
        { id: 'tier-front', name: 'Front block', price: 1200, qty: 1000, sold: 642 },
        { id: 'tier-rear', name: 'Rear block', price: 800, qty: 2000, sold: 1198 }
      ],
      bundles: [
        { id: 'bd-front-vinyl', name: '前區票 ＋ 限量黑膠', tickets: [{ tier: 'tier-front', n: 1 }],
          products: [{ name: 'LOVE RAGE HOPE 限量黑膠 1/500', img: 'images/products/coastline-acetate.webp' }],
          price: 1900, sold: 63, cap: 200 }
      ],
      publish: { onsale: 'now', pickup: 'eticket', visibility: 'public' },
      sold: 1840,
      revenue: 1728800,
      status: 'on-sale',
      images: { keyvisual: 'images/projects/nick-flames.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'lrh-studio-live',
      type: 'virtual',
      typeLabelKey: 'ce.type.virtual',
      category: 'online',
      series: null,
      name: 'LOVE RAGE HOPE — Studio session, online',
      desc: 'A live broadcast from the studio: three songs from the album, then the room picks the fourth.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Online',
      city: '',
      address: '',
      date: '2026-09-20',
      start: '21:00',
      end: '22:30',
      doors: '',
      capacity: 800,
      room: { url: 'ztor.live/v/lrh-studio-live', chat: true, capacity: 800 },
      tiers: [
        { id: 'tier-stream', name: 'Live stream', price: 350, qty: 700, sold: 402 },
        { id: 'tier-bts', name: 'Stream + behind the scenes', price: 650, qty: 100, sold: 71 }
      ],
      bundles: [
        { id: 'bd-stream-album', name: '直播票 ＋ 數位專輯', tickets: [{ tier: 'tier-stream', n: 1 }],
          products: [{ name: 'LOVE RAGE HOPE — 數位專輯', img: 'images/products/nick-album.jpg' }],
          price: 520, sold: 88, cap: 150 }
      ],
      publish: { onsale: 'now', pickup: 'eticket', visibility: 'public' },
      sold: 473,
      revenue: 186850,
      status: 'on-sale',
      images: { keyvisual: 'images/projects/nick-lrh.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'fubon-postgame-taipei',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: null,
      name: 'Fubon Guardians post-game show — Taipei Dome',
      desc: 'The post-game stage at the Dome. Doors open as the ninth inning ends.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Taipei Dome',
      city: 'Taipei, Taiwan',
      address: '',
      date: '2026-07-27',
      start: '19:30',
      end: '21:00',
      doors: '18:30',
      capacity: 1200,
      tiers: [
        { id: 'tier-infield', name: 'Infield', price: 1200, qty: 800, sold: 800 },
        { id: 'tier-outfield', name: 'Outfield', price: 900, qty: 400, sold: 372 }
      ],
      bundles: [
        { id: 'bd-infield-tee', name: '內野票 ＋ 官方 Tee', tickets: [{ tier: 'tier-infield', n: 1 }],
          products: [{ name: 'REALIVE 白趴 官方 Tee', img: 'images/products/tee-black.webp' }],
          price: 1700, sold: 41, cap: 120 }
      ],
      sold: 1172,
      revenue: 1294800,
      status: 'live',
      startedMinutesAgo: 25,
      arrivedAtOpen: 774,
      images: { keyvisual: 'images/projects/nick-lrh-tour.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'lrh-campus-ntu',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: { id: 'lrh-campus', name: 'LOVE·RAGE·HOPE Campus Tour', index: 1, total: 2 },
      name: 'LOVE·RAGE·HOPE Campus Tour',
      desc: 'Two campuses in one day — a short set and an open mic with students.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'NTU Sports Centre',
      city: 'Taipei, Taiwan',
      address: '',
      date: '2026-07-27',
      start: '12:20',
      end: '13:30',
      doors: '12:00',
      capacity: 400,
      tiers: [
        { id: 'tier-entry', name: 'Entry', price: 100, qty: 400, sold: 400 }
      ],
      sold: 400,
      revenue: 40000,
      status: 'live',
      startedMinutesAgo: 65,
      arrivedAtOpen: 291,
      images: { keyvisual: 'images/projects/nick-lrh.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'lrh-campus-nccu',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: { id: 'lrh-campus', name: 'LOVE·RAGE·HOPE Campus Tour', index: 2, total: 2 },
      name: 'LOVE·RAGE·HOPE Campus Tour',
      desc: 'Two campuses in one day — a short set and an open mic with students.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'NCCU Arts Hall',
      city: 'Taipei, Taiwan',
      address: '',
      date: '2026-07-27',
      start: '18:30',
      end: '19:40',
      doors: '18:00',
      capacity: 400,
      tiers: [
        { id: 'tier-entry', name: 'Entry', price: 100, qty: 400, sold: 356 }
      ],
      sold: 356,
      revenue: 35600,
      status: 'live',
      startedMinutesAgo: 10,
      arrivedAtOpen: 208,
      images: { keyvisual: 'images/projects/nick-lrh.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'lrh-listening-party',
      type: 'virtual',
      typeLabelKey: 'ce.type.virtual',
      category: 'online',
      series: null,
      name: 'LOVE RAGE HOPE — Listening party, online',
      desc: 'Playing the album end to end, talking through each track as it goes.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Online',
      city: '',
      address: '',
      date: '2026-07-27',
      start: '13:00',
      end: '15:00',
      doors: '',
      capacity: 1000,
      room: { url: 'ztor.live/v/lrh-listening-party', chat: true, capacity: 1000 },
      tiers: [
        { id: 'tier-stream', name: 'Live stream', price: 200, qty: 1000, sold: 731 }
      ],
      sold: 731,
      revenue: 146200,
      status: 'live',
      images: { keyvisual: 'images/projects/nick-lrh.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'lrh-doc-watchparty',
      type: 'watchparty',
      typeLabelKey: 'ce.type.watchparty',
      category: 'online',
      series: null,
      name: 'LOVE·RAGE·HOPE tour documentary — Watch party',
      desc: 'Watching the tour documentary together, with the director answering in chat.',
      lineup: [],
      venue: 'Online',
      city: '',
      address: '',
      date: '2026-07-27',
      start: '13:30',
      end: '',
      doors: '',
      capacity: 600,
      room: { url: 'ztor.live/w/lrh-doc', chat: true, capacity: 600 },
      tiers: [
        { id: 'tier-entry', name: 'Admission', price: 120, qty: 600, sold: 418 }
      ],
      sold: 418,
      revenue: 50160,
      status: 'live',
      images: { keyvisual: 'images/projects/nick-lrh-tour.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'sdfs-tour-taipei',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: { id: 'sdfs-tour', name: 'Too Handsome to Stay — Party Tour (revival)', index: 1, total: 2 },
      name: 'Too Handsome to Stay — Party Tour (revival)',
      desc: 'The 2017 party tour, replayed in the two rooms it opened and closed in.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'A Station',
      city: 'Taipei, Taiwan',
      address: '',
      date: '2026-03-14',
      start: '20:00',
      end: '22:00',
      doors: '19:00',
      capacity: 500,
      tiers: [
        { id: 'tier-ga', name: 'General admission', price: 900, qty: 500, sold: 500 }
      ],
      sold: 500,
      revenue: 450000,
      status: 'ended',
      images: { keyvisual: 'images/projects/nick-sdfs.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'sdfs-tour-chengdu',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: { id: 'sdfs-tour', name: 'Too Handsome to Stay — Party Tour (revival)', index: 2, total: 2 },
      name: 'Too Handsome to Stay — Party Tour (revival)',
      desc: 'The 2017 party tour, replayed in the two rooms it opened and closed in.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Zhenghuo Art Center',
      city: 'Chengdu, China',
      address: '',
      date: '2026-03-21',
      start: '20:00',
      end: '22:00',
      doors: '19:00',
      capacity: 500,
      tiers: [
        { id: 'tier-ga', name: 'General admission', price: 900, qty: 500, sold: 468 }
      ],
      sold: 468,
      revenue: 421200,
      status: 'ended',
      images: { keyvisual: 'images/projects/nick-sdfs.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'reallife-signing-kaohsiung',
      type: 'meet',
      typeLabelKey: 'ce.type.meet',
      category: 'fans-meet',
      series: null,
      name: 'REAL LIFE signing — Kaohsiung',
      desc: 'In-store signing, 150 numbered slots, one item signed per slot.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Talee Department Store',
      city: 'Kaohsiung, Taiwan',
      address: '',
      date: '2026-05-10',
      start: '14:00',
      end: '16:00',
      doors: '13:30',
      capacity: 150,
      tiers: [
        { id: 'tier-slot', name: 'Signing slot', price: 350, qty: 150, sold: 150 }
      ],
      sold: 150,
      revenue: 52500,
      status: 'ended',
      images: { keyvisual: 'images/projects/nick-real-life.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'reallife-full-album-online',
      type: 'virtual',
      typeLabelKey: 'ce.type.virtual',
      category: 'online',
      series: null,
      name: 'REAL LIFE — Full album, online',
      desc: 'The 2022 album played front to back, streamed only.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Online',
      city: '',
      address: '',
      date: '2026-06-20',
      start: '21:00',
      end: '23:00',
      doors: '',
      capacity: 2000,
      room: { url: 'ztor.live/v/reallife-full-album', chat: true, capacity: 2000 },
      tiers: [
        { id: 'tier-stream', name: 'Live stream', price: 400, qty: 1800, sold: 1642 },
        { id: 'tier-archive', name: 'Stream + 30-day replay', price: 800, qty: 200, sold: 187 }
      ],
      sold: 1829,
      revenue: 806400,
      status: 'ended',
      images: { keyvisual: 'images/projects/nick-real-life.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'sdfs-mv-watchback',
      type: 'watchparty',
      typeLabelKey: 'ce.type.watchparty',
      category: 'online',
      series: null,
      name: 'Too Handsome to Stay MV — 10-year watch-back',
      desc: 'Watching the 2016 video back, ten years on.',
      lineup: [],
      venue: 'Online',
      city: '',
      address: '',
      date: '2026-02-14',
      start: '21:00',
      end: '',
      doors: '',
      capacity: 400,
      room: { url: 'ztor.live/w/sdfs-mv-watchback', chat: true, capacity: 400 },
      tiers: [
        { id: 'tier-entry', name: 'Admission', price: 100, qty: 400, sold: 313 }
      ],
      sold: 313,
      revenue: 31300,
      status: 'ended',
      images: { keyvisual: 'images/projects/nick-sdfs.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'hualien-summer-love',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: null,
      name: 'Hualien Summer Love Festival — NICKTHEREAL set',
      desc: 'Lakeside stage at Liyu Lake. Cancelled on a typhoon warning.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Liyu Lake',
      city: 'Hualien, Taiwan',
      address: '',
      date: '2026-08-30',
      start: '18:00',
      end: '21:00',
      doors: '17:00',
      capacity: 1500,
      tiers: [
        { id: 'tier-ga', name: 'General admission', price: 1000, qty: 1500, sold: 892 }
      ],
      sold: 892,
      revenue: 892000,
      status: 'cancelled',
      images: { keyvisual: 'images/projects/nick-flames.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'realive-china-fuzhou',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: { id: 'realive-china-2027', name: 'REALIVE World Tour — China leg (2027)', index: 1, total: 2 },
      name: 'REALIVE World Tour — China leg (2027)',
      desc: 'Two added China dates. Cancelled when the venue partner withdrew.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Strait Culture and Art Centre',
      city: 'Fuzhou, China',
      address: '',
      date: '2026-11-14',
      start: '19:30',
      end: '21:30',
      doors: '18:30',
      capacity: 700,
      tiers: [
        { id: 'tier-ga', name: 'General admission', price: 1100, qty: 700, sold: 421 }
      ],
      sold: 421,
      revenue: 463100,
      status: 'cancelled',
      images: { keyvisual: 'images/projects/nick-realive.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'realive-china-hangzhou',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: { id: 'realive-china-2027', name: 'REALIVE World Tour — China leg (2027)', index: 2, total: 2 },
      name: 'REALIVE World Tour — China leg (2027)',
      desc: 'Two added China dates. Cancelled when the venue partner withdrew.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'CH8 Livehouse',
      city: 'Hangzhou, China',
      address: '',
      date: '2026-11-21',
      start: '19:30',
      end: '21:30',
      doors: '18:30',
      capacity: 700,
      tiers: [
        { id: 'tier-ga', name: 'General admission', price: 1100, qty: 700, sold: 318 }
      ],
      sold: 318,
      revenue: 349800,
      status: 'cancelled',
      images: { keyvisual: 'images/projects/nick-realive.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'lrh-meet-tokyo',
      type: 'meet',
      typeLabelKey: 'ce.type.meet',
      category: 'fans-meet',
      series: null,
      name: 'LOVE RAGE HOPE — Tokyo pop-up meet',
      desc: 'A pop-up meet at Shibuya Loft. Cancelled when the visa schedule slipped.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Shibuya Loft',
      city: 'Tokyo, Japan',
      address: '',
      date: '2026-10-12',
      start: '18:00',
      end: '20:00',
      doors: '17:30',
      capacity: 100,
      tiers: [
        { id: 'tier-slot', name: 'Meet slot', price: 900, qty: 100, sold: 74 }
      ],
      sold: 74,
      revenue: 66600,
      status: 'cancelled',
      images: { keyvisual: 'images/projects/nick-lrh.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'lrh-backers-briefing',
      type: 'virtual',
      typeLabelKey: 'ce.type.virtual',
      category: 'online',
      series: null,
      name: 'LOVE RAGE HOPE — Backers briefing, online',
      desc: 'A progress briefing for backers. Cancelled and folded into the next project update.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Online',
      city: '',
      address: '',
      date: '2026-09-05',
      start: '21:00',
      end: '22:00',
      doors: '',
      capacity: 600,
      room: { url: 'ztor.live/v/lrh-backers-briefing', chat: true, capacity: 600 },
      tiers: [
        { id: 'tier-stream', name: 'Live stream', price: 200, qty: 600, sold: 233 }
      ],
      sold: 233,
      revenue: 46600,
      status: 'cancelled',
      images: { keyvisual: 'images/projects/nick-lrh.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'r2-rehearsal-watchparty',
      type: 'watchparty',
      typeLabelKey: 'ce.type.watchparty',
      category: 'online',
      series: null,
      name: 'REALIVE (R2) rehearsal footage — Watch party',
      desc: 'Watching the R2 rehearsal footage together. Cancelled with the tour date.',
      lineup: [],
      venue: 'Online',
      city: '',
      address: '',
      date: '2026-09-19',
      start: '21:00',
      end: '',
      doors: '',
      capacity: 300,
      room: { url: 'ztor.live/w/r2-rehearsal', chat: true, capacity: 300 },
      tiers: [
        { id: 'tier-entry', name: 'Admission', price: 120, qty: 300, sold: 96 }
      ],
      sold: 96,
      revenue: 11520,
      status: 'cancelled',
      images: { keyvisual: 'images/projects/nick-r2-special.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'realive-japan-draft-1',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: { id: 'realive-japan', name: 'REALIVE World Tour — Japan leg (planning)', index: 1, total: 2 },
      name: 'REALIVE World Tour — Japan leg (planning)',
      desc: '',
      lineup: ['NICKTHEREAL 周湯豪'],
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
      images: { keyvisual: 'images/projects/nick-realive.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'realive-japan-draft-2',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: { id: 'realive-japan', name: 'REALIVE World Tour — Japan leg (planning)', index: 2, total: 2 },
      name: 'REALIVE World Tour — Japan leg (planning)',
      desc: '',
      lineup: ['NICKTHEREAL 周湯豪'],
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
      images: { keyvisual: 'images/projects/nick-realive.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'onstage-encore-draft',
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      series: null,
      name: 'ON STAGE encore show (planning)',
      desc: '',
      lineup: ['NICKTHEREAL 周湯豪'],
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
      images: { keyvisual: 'images/projects/nick-lwh.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'lrh-meet-draft',
      type: 'meet',
      typeLabelKey: 'ce.type.meet',
      category: 'fans-meet',
      series: null,
      name: 'LOVE RAGE HOPE fan meet (planning)',
      desc: '',
      lineup: ['NICKTHEREAL 周湯豪'],
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
      images: { keyvisual: 'images/projects/nick-lrh.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'nick-online-draft',
      type: 'virtual',
      typeLabelKey: 'ce.type.virtual',
      category: 'online',
      series: null,
      name: 'NICKTHEREAL online show (planning)',
      desc: '',
      lineup: ['NICKTHEREAL 周湯豪'],
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
      images: { keyvisual: 'images/projects/nick-nsddd.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'onstage-film-watchparty-draft',
      type: 'watchparty',
      typeLabelKey: 'ce.type.watchparty',
      category: 'online',
      series: null,
      name: 'ON STAGE concert film — Watch party (planning)',
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
      images: { keyvisual: 'images/projects/nick-r2.jpg', banner: '', gallery: [] },
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
  /* 票種名取自這場活動自己的 tiers（2026-08-17 修正）：此前寫死成內圈見面會的兩個票種名，
     所以只要換一場進行中的活動來看，報到名單上每一列都掛著別場活動的票種——在「進行中」
     從一場擴充到五場之後這件事會直接被看到。
     配法：每一位挑「剩餘比例最高」的票種——比的是剩餘張數佔自己總數的比例，不是絕對張數。
     用絕對張數會讓 180 張／20 張的活動先發完 160 張大票種才輪到小的，而到場的是名單前段，
     「誰到了」的票種分佈就整個失真；用比例則是每十位出現一位小票種，比例才對得起來。 */
  /* 到場時間（2026-08-17 改寫）：以「開放入場」為起點、開演後 30 分鐘為終點，
     密度做成開演前十幾分鐘達到尖峰、開演後迅速收尾的形狀。
     此前是 `13*60+30 + i*0.62`——兩個問題：
       · 13:30 是內圈見面會的開放入場時間，寫死在這裡，換一場活動時間全是錯的；
       · 等速直線把「開場前的排隊尖峰」抹平了，畫成到場節奏圖只會是一排等高的柵欄，
         而那張圖存在的理由正是回答「門口現在是尖峰還是收尾」。
     權重是九段固定值、不用亂數，同一場活動每次載入都得到同一條曲線。 */
  var ARRIVAL_SHAPE = [3, 6, 11, 17, 21, 18, 12, 8, 4];
  function hhmmMin(s) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(s == null ? '' : s).trim());
    return m ? (+m[1]) * 60 + (+m[2]) : null;
  }
  function arrivalTimes(ev, n) {
    if (!n) return [];
    var start = hhmmMin(ev.start);
    if (start == null) start = 19 * 60;
    var doors = hhmmMin(ev.doors);
    if (doors == null || doors >= start) doors = start - 60;
    var from = doors, to = start + 30, span = to - from;
    var total = ARRIVAL_SHAPE.reduce(function (a, b) { return a + b; }, 0);
    var out = [], seg = span / ARRIVAL_SHAPE.length, done = 0;
    for (var b = 0; b < ARRIVAL_SHAPE.length; b++) {
      // 這一段該有幾位＝權重比例；最後一段補足餘數，加總才會剛好等於 n
      var want = (b === ARRIVAL_SHAPE.length - 1)
        ? n - done
        : Math.round(n * ARRIVAL_SHAPE[b] / total);
      for (var k = 0; k < want; k++) {
        /* 回傳「秒」而不是「分」（2026-08-17）：進場頻率那張圖有「秒」這個檔位，
           分鐘解析度的資料在那個檔位下會變成每分鐘一根、中間全是零的梳子。
           段內用 k/want 均分再乘上 60，同一個人永遠落在同一秒。 */
        out.push(Math.round((from + seg * (b + (want > 1 ? k / want : 0.5))) * 60));
      }
      done += want;
    }
    return out;
  }

  function tierPicker(ev) {
    var pool = (ev.tiers || []).map(function (t) {
      return { name: t.name, left: t.sold || 0, tot: (t.sold || 0) || 1 };
    });
    return function () {
      var best = null;
      for (var k = 0; k < pool.length; k++) {
        if (pool[k].left > 0 && (!best || pool[k].left / pool[k].tot > best.left / best.tot)) best = pool[k];
      }
      if (!best) return '';
      best.left--;
      return best.name;
    };
  }

  function buildRoster(ev) {
    var n = ev.sold || 0, arrived = ev.arrivedAtOpen || 0, out = [];
    var pickTier = tierPicker(ev);
    var times = arrivalTimes(ev, arrived);
    for (var i = 0; i < n; i++) {
      var g = GIVEN[i % GIVEN.length];
      var f = FAMILY[(i * 7 + 3) % FAMILY.length];
      out.push({
        seq: i + 1,
        name: g + ' ' + f,
        tier: pickTier(),
        code: 'ZT-' + String(4200 + i * 13).slice(-4),
        arrived: i < arrived,
        // 到場時間：見 arrivalTimes()。at＝分（既有消費端用），atSec＝秒（進場頻率圖用）
        at: i < arrived ? Math.floor(times[i] / 60) : null,
        atSec: i < arrived ? times[i] : null
      });
    }
    return out;
  }


  /* ── 交易明細（transactions）───────────────────────────────
     回答的問題與其他分頁不同：名單問「誰會來」、收支問「這場賺不賺」，
     交易明細問「KPI 上那個數字是由哪些筆款項組成、每一筆後來怎麼了」——對帳與爭議處理面。

     產生規則（決定性，不用 Math.random）：
       · 逐票種走過 sold，每 1–2 張併成一筆訂單（真實世界很少一人一張）。
       · 金額＝票種單價 × 張數；平台費 10%；淨額＝金額－平台費。
       · **已結算金額加總必須等於該場次的 revenue**，否則這張表會跟收入 KPI 互相打架。
         因此退款筆是「額外」的交易（退掉的票已回到庫存、不在 sold 裡），不影響加總。
       · 買家名字取自 roster 同一個名單池：名單與交易是同一場活動的兩個視角，不是兩套虛構。 */
  function buildTx(ev) {
    var out = [], seq = 0, day = ev.date || '2026-01-01';
    (ev.tiers || []).forEach(function (t, ti) {
      var left = t.sold || 0;
      while (left > 0) {
        var qty = (seq % 3 === 0 && left >= 2) ? 2 : 1;      // 每三筆有一筆是兩張
        if (qty > left) qty = left;
        var gross = (t.price || 0) * qty;
        var fee = Math.round(gross * 0.10);
        out.push({
          id: 'TX-' + String(10240 + seq * 7).slice(-5),
          buyer: GIVEN[(seq * 3) % GIVEN.length] + ' ' + FAMILY[(seq * 5 + ti) % FAMILY.length],
          tier: t.name, qty: qty, gross: gross, fee: fee, net: gross - fee,
          method: ['Card', 'Apple Pay', 'LINE Pay'][seq % 3],
          status: 'paid',
          at: day, atMin: (10 * 60 + (seq * 37) % 720)        // 顯示用；原型不接真實時鐘
        });
        left -= qty; seq++;
      }
    });
    /* 退款筆：額外附加，不列入已結算加總（退掉的票不在 sold 裡）。每場固定兩筆，
       金額取第一個票種單價，讓「退款」在明細與退款分頁都有東西可看。 */
    var t0 = (ev.tiers || [])[0];
    if (t0 && (ev.sold || 0) > 4) {
      for (var k = 0; k < 2; k++) {
        var g = t0.price || 0;
        out.push({
          id: 'TX-' + String(90100 + k * 11).slice(-5),
          buyer: GIVEN[(k * 11) % GIVEN.length] + ' ' + FAMILY[(k * 9) % FAMILY.length],
          tier: t0.name, qty: 1, gross: g, fee: Math.round(g * 0.10), net: g - Math.round(g * 0.10),
          method: 'Card', status: 'refunded', at: day, atMin: 9 * 60 + k * 25
        });
      }
    }
    return out;
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ── 階段覆寫（2026-08-13）───────────────────────────────────
     活動詳情頁新增了狀態轉換動作（發布開賣／取消活動），按下去必須真的改變這一頁的
     階段，否則「按了沒事發生」比沒有按鈕更糟。原型沒有後端，故把改過的階段寫進
     localStorage，`get()` 讀出來時套用；清空鍵（`reset()`）即回到 mock 原值。
     只覆寫 `status` 這一個欄位——它是驅動分頁可見性與頁首徽章的唯一輸入。
     已知限制：`events.html` 清單是靜態 HTML、不吃本檔，改過階段的活動在清單上仍是原值
     （見 site/r2.2/ASSUMPTIONS.md STAGE-001）。 */
  var STAGE_KEY = 'ztor.event-stage';
  function stageMap() {
    try { return JSON.parse(localStorage.getItem(STAGE_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function writeStage(id, status) {
    var m = stageMap();
    if (status) m[id] = status; else delete m[id];
    try { localStorage.setItem(STAGE_KEY, JSON.stringify(m)); } catch (e) {}
  }

  window.ztorEvents = {
    list: function () {
      var m = stageMap();
      return clone(EVENTS).map(function (e) {
        if (m[e.id]) e.status = m[e.id];
        return e;
      });
    },
    /* id 有帶但查不到 → 回 null，由呼叫端顯示「找不到活動」。
       2026-07-30 修正：原本一律退回首筆，等於把「別人的活動」當成使用者點的那一場
       靜默顯示出來——在編輯頁與 scanner 上尤其危險（會改到／掃到錯的場次）。
       完全沒帶 id 仍回首筆，那是原型的示例頁預設值、不是查詢失敗。 */
    get: function (id) {
      var m = stageMap(), ev = null;
      if (!id) ev = clone(EVENTS[0]);        // 無 id＝示例頁預設
      else {
        for (var i = 0; i < EVENTS.length; i++) {
          if (EVENTS[i].id === id) { ev = clone(EVENTS[i]); break; }
        }
      }
      if (!ev) return null;                  // 有 id 但查不到＝查詢失敗
      if (m[ev.id]) ev.status = m[ev.id];    // 本機改過階段的活動以覆寫值為準
      return ev;
    },
    /* 階段轉換（原型層級）：寫進 localStorage，下一次 get() 就是新階段。
       允許哪些轉換由呼叫端（event-detail.html）依 §7.2 狀態機判斷，本檔只負責存。 */
    setStage: function (id, status) { if (id) writeStage(id, status); },
    resetStage: function (id) { if (id) writeStage(id, null); },
    /* 交易明細：有金流的階段才有（售票中／進行中／已結束／已取消）。
       已取消也要有——取消的活動照樣要對帳「賣過多少、退了多少」。 */
    transactions: function (id) {
      var ev = window.ztorEvents.get(id);
      if (!ev || ['on-sale', 'live', 'ended', 'cancelled'].indexOf(ev.status) < 0) return [];
      return buildTx(ev);
    },
    /* 最終報到統計（2026-08-13）：現場報到台只在進行中出現，活動結束後那張報到快照卡
       仍要回答「這場最後到了多少人」——結束後還顯示「開演當天才開放」是錯的。
       決定性推導自售出張數（不用 Math.random），非真實票務數字，同 buildRoster 的口徑。 */
    checkinSummary: function (id) {
      var ev = window.ztorEvents.get(id);
      if (!ev || ev.status !== 'ended') return null;
      var sold = ev.sold || 0;
      var valid = Math.round(sold * 0.91);          // 正常核銷入場
      var used = Math.round(sold * 0.015);          // 重複掃描（第二次起回黃燈）
      var invalid = Math.round(sold * 0.004);       // 無效票（作廢／非本場）
      return { sold: sold, valid: valid, used: used, invalid: invalid,
               rate: sold ? Math.round(valid / sold * 100) : 0 };
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
