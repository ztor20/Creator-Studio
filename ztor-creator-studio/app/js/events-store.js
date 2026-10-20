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
   而不是三個空的上傳框；gallery 是 1–10 張的陣列（2026-09-04 D243）。每筆刻意沿用活動清單那一列在用的圖檔，
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

   highlight（2026-09-22 D300 / 5.1.6.1 F2）：名稱下方的一句特殊訊息（例「台北唯一一場」），選填、
   一場只有一句；沒寫＝沒有。示範只放三筆，其餘留空——這是行銷語、不是每場都有。bookyay 帶入的
   活動沒有這欄（bookyay 沒有對應資料，create-event 的帶入草稿亮點留空、不鎖）。

   描述的區塊（2026-10-05 D354 / 5.1.6.1 F2；前身 D335 內文夾圖、D340 粗體與清單）：描述＝一串照運營排定順序的區塊，
     descBlocks: [{ type:'text', html | text }, { type:'image'|'video', src }, …]
   每個文字區塊各自一筆（沒有標題、各是一個可翻譯欄位），圖片與影片各自一個區塊；整份媒體合計最多 10 個。
   只有一段純文字的活動照舊只有字串 desc（讀者用 ztorRichBody.migrate(descBlocks || desc, infoSections) 收成區塊）。
   desc 是給舊讀者的純文字（示範資料放第一段）；有 descBlocks 時以 descBlocks 為準。
   墓碑 2026-10-05（D354 決定八）：infoSections（D334 說明區塊，[{ title, body, blocks? }]）退場——兩筆示範
   （realive-asia-taipei 兩塊、album-signing-taipei 一塊）已轉成 descBlocks 的文字區塊：原標題併進該區塊第一行並設粗體，
   第一塊原本夾在兩段文字之間的圖片成為獨立的圖片區塊、位置不變。內容是原型自擬的中文示範。

   sold／status 是編輯態的行為輸入、不只是顯示值：
     · sold > 0  → 場次已售出，該票種張數不得低於它的 sold、已售票種不可刪。
   容量（capacity）2026-09-30 隨 D340 刪除（5.1.6.1 F8 退場）：活動的總量＝本活動所有門票的張數合計（Σ tiers[].qty，
   含隱藏的門票），為計算值、不另存——清單票券欄、詳情 KPI 的分母都用它（totalQty()）。共看派對的人數上限在 room.capacity，
   是另一個概念（房間同時能進幾人），保留。
   publish（D340）：{ pickup, shown }——開賣設定＝上面的 sale（from 開賣、to 停售，皆選填；from 缺＝上架即開賣、
   to 缺＝賣到活動開始），取代「直接販售／限時販售」二選一的 onsale；顯示設定＝shown（true 顯示／false 隱藏，
   隱藏＝只能經活動連結進入），取代「公開／私人」的 visibility。
     · status='on-sale' → 已開賣（顯示或隱藏都可能；D341 用詞統一），改日期／場地屬「會通知到購票者」的高影響欄位。
   資料為原型 mock，非真實票務數字（見 ASSUMPTIONS.md）。

   2026-08-19 修正：status:'live' 的 date 一律動態＝今天（見下方 todayStr()），不得寫死日期。
   起因——6 筆 live 活動先前把 date 釘死在 2026-07-27（寫檔那天），寫檔一過就與「進行中」
   狀態自相矛盾（進行中的活動理當就是今天開演）。改用 todayStr() 之後這批 mock 不會再老化；
   這是本檔唯一允許用 new Date() 的地方——「今天」錨點本來就該跟著使用者系統時間走，
   不受檔頭「deterministic、不用 Math.random」原則管轄（那條原則管的是抽樣邏輯，不是日期錨）。 */
(function () {
  'use strict';

  /* 「今天」錨點（2026-08-19 新增，回歸腳本 scripts/check_events_store.js 會驗證這條）：
     只給 status:'live' 的活動使用，回傳本機今天的 'YYYY-MM-DD'。 */
  function todayStr() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  /* 'YYYY-MM-DD' 加減天數（2026-10-13 D410／D411）：進行中活動的跨日結束日（今天＋1）與交易的下單日期都用它推。
     純日期運算、不讀時鐘，不違反 deterministic 原則。 */
  function addDays(ymd, n) {
    var p = String(ymd || '').split('-');
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]) + (n || 0));
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

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
      /* D370（2026-10-07）：活動國家／活動語言／集合地點（meetPoint）／交通（transit）——活動詳情「總覽」與「地點」可看可改（bookyay 帶入者鎖定）。
         沒寫 country＝不在國家清單內（中國、新加坡、馬來西亞）或線上；沒寫 meetPoint／transit＝選填未填。 */
      country: 'TW',
      languages: ['cmn'],
      meetPoint: '南側 1 號入口',
      transit: '捷運巨蛋站 5 號出口步行 3 分鐘',
      address: '',
      date: '2026-12-19',   // 2026-10-16 示範資料修正（UI-CHANGES 二百四十四）：原 09-12 已過、狀態卻是售票中；整個亞洲段往後移，排在東南亞段（2027-01）之前
      start: '19:30',
      end: '22:00',
      doors: '18:30',
      /* 早到政策（2026-08-11 與建立流程同步）：比自己那張票的入場時間早到的人怎麼辦。
         沒寫的活動預設 'warn'（仍可入場）；這一場示範 'block'。 */
      early: 'block',
      /* earlyMin＝比開放入場提早幾分鐘（2026-08-11 新欄，沒寫＝無）。2026-09-29：手續費種子 `fee` 清掉（D316 已退場，D327 決定八）。
         hidden＝顯示開關關閉（2026-09-29 D328 新欄，沒寫＝顯示）。墓碑 2026-10-05（D353）：desc（門票簡介）整欄移除。
         sale＝限時折扣 { pct, from, to }（2026-09-29 D329 新欄；D417 起 bookyay 早鳥不帶入）。
         墓碑 2026-10-16（D429）：hideFix（bookyay 套票轉出的 1 人票、鎖定為隱藏）與組合包的 fix（bookyay 自動建立、整組鎖定）兩欄退場——
         bookyay 的「每張門票人數」不帶入，套票帶入後就是一張普通門票，不再拆票、不再自動建組合包。 */
      tiers: [
        /* override（2026-09-22 D306）＝創作者在價格表手動改過的幣別：USD 換算值是 133（4200 ÷ 31.5），
           創作者覆寫成 135 讓數字好看；其餘幣別沒改＝顯示換算值。 */
        /* 墓碑 2026-09-23（D315）：`feeException`（D311 的逐門票例外平台費率，這一筆原本
           示範「Admin 為這張票談了 3%」）隨例外整組退場——平台費只剩 Admin 在費率設定頁
           設的兩層（General 預設 × 逐 creator 覆寫），門票資料不再帶自己的費率。 */
        { id: 'tier-vip',   name: 'VIP',    price: 4200, qty: 100, sold: 100, earlyMin: 30, override: { USD: 135 } },
        { id: 'tier-floor', name: 'Floor',  price: 3300, qty: 200, sold: 200 },
        { id: 'tier-seat',  name: 'Seated', price: 2400, qty: 300, sold: 300 }
      ],
      /* 票務商品（2026-08-11）：建立流程第 6 步綁出來的組合包。與單賣的票共用同一個
         數量池——賣掉一組就從它含的那張票扣一張（BDL-001，編輯規則待上游）。
         2026-09-18（D292）：票務商品＝電子商店的組合包（成員含本活動票券），這裡只是
         「含本活動票券的組合包」的篩選視圖資料；`tickets` 的形狀對齊 `js/bundle-editor.js`：
         2026-09-21（D296）起是**一個物件** `{ tierIds:[票種 id…], qty:n }`——tierIds＝允許票種
         （粉絲購買時任選一種）、qty＝整組張數（拿到該票種 × n）；只列一種＝鎖定票種。
         舊形狀 `[{ id, qty }]`（2026-09-18 D292，多筆＝同時內含）退場，讀取端（event-detail、
         e-shop、bundle-detail）用 `ztorEvents.bundleTickets(b)` 相容讀取，站上不留兩種形狀。`bundle-detail.html?id=<組合包 id>` 是它的細節頁（第 3 批接資料）。
         2026-08-17：`products` 由字串陣列改為 `{ name, img }`——售票進度卡要把「這一組裡面
         裝了什麼」用圖顯示出來，光有名字排不出那排縮圖。商品名與圖沿用 js/products-store.js
         的 nick 批（同一件商品在電子商店與這裡不該長兩張臉）；圖路徑直接寫在這裡而不是
         跨檔去查 products-store，理由同 images.keyvisual——那支是 persona 綁定的，
         活動資料不該跟著 persona 切換而換掉組合包內容。
         2026-09-18（D292 第 3 批）：`products[].price` 是該商品成員在這一組的示範單價——`bundle-detail.html`
         合流讀這裡時要算「原價合計＝Σ（票價 × 張數）＋Σ（商品價 × 件數）」，活動資料不跨檔查 products-store
         （同上理由：persona 綁定），示範值取「組合售價 − 票券小計」，等於這批組合都沒有另設組合折扣。
         同一個組合包 id（bd-vip-tee）在系列的高雄／台北兩場各出現一次＝「每場各一組」沿用同一份清單；
         細節頁沒帶 `&ev=` 時取第一場（示範資料的缺口，見 ASSUMPTIONS BDL-001 追記）。 */
      bundles: [
        { id: 'bd-vip-tee', name: 'VIP ＋ 巡演官方 Tee', desc: '一張 VIP 票加一件巡演官方 Tee，現場憑票一併領取。', tickets: { tierIds: ['tier-vip'], qty: 1 },
          products: [{ name: 'REALIVE 白趴 官方 Tee', img: 'images/products/tee-black.webp', price: 600 }],
          price: 4800, sold: 12, cap: 50, override: { HKD: 1188 } }   // HKD 換算 1,189 → 覆寫 1,188（D306 示範）
      ],
      /* 發布設定（2026-08-11 新欄）：建立流程第 7 步的三個選擇，沒寫＝直接開賣／電子門票／顯示（D341：可見性用詞統一為顯示／隱藏）。
         2026-09-29（D327）：電子門票底下的附屬設定值整組清掉——那組設定已刪除。 */
      publish: { pickup: 'eticket', shown: true },
      sold: 600,
      revenue: 1807200,   // 2026-10-16 示範資料修正（UI-CHANGES 二百四十四）：活動收入含組合包整組金額（5.1.6.3 §2.3、D408）＝門票 1,749,600（VIP 經組合包的 12 張不重算）＋組合包 12 × 4,800
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
      country: 'TW',
      languages: ['cmn'],
      meetPoint: '飯店 1 樓大廳',
      transit: '台中捷運市政府站步行 10 分鐘',
      address: '',
      date: '2027-01-02',   // 2026-10-16 示範資料修正（UI-CHANGES 二百四十四）：原 09-26 已過、狀態卻是售票中
      start: '19:30',
      end: '22:00',
      doors: '18:30',
      tiers: [
        { id: 'tier-vip',   name: 'VIP',    price: 4200, qty: 100, sold: 80 },
        { id: 'tier-floor', name: 'Floor',  price: 3300, qty: 200, sold: 140 },
        { id: 'tier-seat',  name: 'Seated', price: 2400, qty: 300, sold: 220 },
        /* D380（2026-10-09）獨立票示範：不掛任何票種、只屬於這一場（standalone: true）——活動詳情與票種門票排在同一張清單、
           名稱後掛「獨立票」標籤；報到、撤銷與票種門票相同（D380 決定四）。sold／revenue 已一併加進活動合計。 */
        { id: 'tier-signed', name: 'Signed VIP', price: 5200, qty: 20, sold: 5, standalone: true }
      ],
      sold: 445,
      revenue: 1352000,
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
      highlight: 'Asia leg finale — Taipei only',   // D300 亮點示範
      desc: 'The Asia leg — three cities, one setlist.',
      /* D354 描述區塊示範（原型自擬）：原 D334 兩塊說明區塊轉成文字區塊（原標題＝第一行粗體），圖片自成一個區塊 */
      descBlocks: [
        { type: 'text', html: '<p>The Asia leg — three cities, one setlist.</p>' },
        { type: 'text', html: '<p><strong>粉絲福利說明</strong></p><p>購買 VIP 票的粉絲可參加演出前的彩排參觀，並獲得巡演限定手環一條。</p>' },
        { type: 'image', src: 'images/projects/nick-realive.jpg' },
        { type: 'text', html: '<p>手環於入場時憑票領取，數量依售出的 VIP 票準備，<em>不另行販售</em>。</p>' },
        { type: 'text', html: '<p><strong>輪椅座位購票說明</strong></p><p>場館設有輪椅座位，每位輪椅使用者可另購一張陪同者票。<br>請於購票後 3 日內來信提供身心障礙證明影本，逾期將改為一般座位。</p>' }
      ],
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Taipei Arena',
      city: 'Taipei, Taiwan',
      country: 'TW',
      languages: ['cmn'],
      meetPoint: '2 號門售票口',
      transit: '捷運台北小巨蛋站 2 號出口步行 3 分鐘',
      address: '',
      date: '2027-01-09',   // 2026-10-16 示範資料修正（UI-CHANGES 二百四十四）：原 10-03 已過、狀態卻是售票中
      start: '19:30',
      end: '22:00',
      doors: '18:30',
      tiers: [
        /* reserved＝下單未付款佔走的（2026-08-11 新欄，示範營運列表用）。 */
        { id: 'tier-vip',   name: 'VIP',    price: 4200, qty: 100, sold: 40, earlyMin: 30, reserved: 6 },
        { id: 'tier-floor', name: 'Floor',  price: 3300, qty: 200, sold: 60, reserved: 11 },
        { id: 'tier-seat',  name: 'Seated', price: 2400, qty: 300, sold: 100 }
      ],
      bundles: [
        { id: 'bd-vip-tee', name: 'VIP ＋ 巡演官方 Tee', desc: '一張 VIP 票加一件巡演官方 Tee，現場憑票一併領取。', tickets: { tierIds: ['tier-vip'], qty: 1 },
          products: [{ name: 'REALIVE 白趴 官方 Tee', img: 'images/products/tee-black.webp', price: 600 }],
          price: 4800, sold: 3, cap: 50 },
        /* 2026-09-21（D296 示範）：允許兩種票種、粉絲任選——原價「從 $4,300 起」（最低票價 Floor 3,300 × 1 ＋ 1,000）。 */
        { id: 'bd-vip-zine', name: 'VIP／Floor 任選 ＋ 精裝寫真誌', tickets: { tierIds: ['tier-vip', 'tier-floor'], qty: 1 },
          products: [{ name: 'REALIVE 巡演精裝寫真誌', img: 'images/products/tour-zine-vol-02.webp', price: 1000 }],
          price: 4300, sold: 7, cap: 40 }
      ],
      publish: { pickup: 'sf', shown: true },
      /* 只設開賣、不設停售的示範（`to: ''`）——賣到開演為止。 */
      sale: { from: '2026-08-15 12:00', to: '' },
      sold: 200,
      revenue: 608500,   // 2026-10-16 示範資料修正（UI-CHANGES 二百四十四）：含組合包整組金額（D408）＝門票 564,000（VIP 經組合包的 10 張不重算）＋組合包 3 × 4,800＋7 × 4,300
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
      languages: ['cmn'],
      address: 'No. 46 Jianxin North Rd, Jiangbei District',
      date: '2026-10-25',
      start: '20:00',
      end: '22:30',
      doors: '19:00',
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
      country: 'TW',
      languages: ['cmn'],
      meetPoint: '大灣遊客中心',
      transit: '墾丁快線大灣站下車步行 5 分鐘',
      address: '',
      date: '2026-11-21',   // 2026-10-07 改：原 10-04 已過，已排程活動的日期不該在過去（組合包會顯示成已結束）
      start: '17:00',
      end: '',
      doors: '',
      /* 2026-08-18 修正（使用者：「是發布活動前至少要有一張票喔」）：這一筆原本是
         `tiers: []` ＋ 容量 0（容量欄 2026-09-30 D340 已刪），用來示範「已排程但還不能開賣」。但票種是**建立流程的
         必填**（規格 5.1.6.1「至少 1 種」），走完流程才會有已排程這個狀態——沒有票種的
         已排程活動在產品上生不出來，那是一份自相矛盾的示範資料。要示範「還缺東西」
         該用草稿，不是已排程。 */
      tiers: [
        { id: 'tier-ga', name: 'General admission', price: 600, qty: 1200, sold: 0 }
      ],
      /* 活動層預設購票規則（D387 示範，2026-10-09）：ztor 自建活動在建立流程票務設定裡設的條件——限購＋限時購買
         （形狀同 create-event eventRules `{ conds }`）。活動詳情票務分頁頂端唯讀列出全部條件、不掛來源標記；
         GA 沒有自己一組條件，照這組生效。其他自建活動沒有 rules＝空狀態示範。限時購買落在開賣 11/1 之後、活動 11/21 之前。 */
      rules: { conds: { buyTime: { from: '2026-11-01T12:00', to: '2026-11-20T23:59' }, cap: { person: '4' } } },
      /* D363 示範（2026-10-07）：活動顯示設定為隱藏（下方 publish.shown:false）→ 含本活動票券的組合包在電子商店跟著隱藏、
         組合商品細節頁的顯示開關停用並寫原因；組合包自己的顯示值保留（這一組自己是顯示）。 */
      bundles: [
        { id: 'bd-kenting-cap', name: 'GA ＋ 墾丁限定棒球帽', tickets: { tierIds: ['tier-ga'], qty: 1 },
          products: [{ name: 'Taiwan Fest 墾丁限定棒球帽', img: 'images/products/cap.webp', price: 450 }],
          price: 1000, sold: 0, cap: 60 }
      ],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { keyvisual: 'images/projects/nick-wln.jpg', banner: '', gallery: [] },
      video: false,
      publish: { pickup: 'eticket', shown: false },   // D327：電子門票附屬設定值已清
      /* D340 示範：開賣時間在未來（預告期）＋顯示設定為隱藏——詳情頁的「提前開賣」確認說明不寫「公開」、改說只能經活動連結進入。 */
      sale: { from: '2026-11-01 12:00', to: '' },   // 2026-10-07 改：原 10-01 已過，維持「開賣在未來（預告期）」的示範
      /* D389 示範（2026-10-09）：定時上架＋定時下架的上架區間——活動詳情改活動預設購票規則或單張門票的購買條件時，
         限時購買／限時折扣的期間超出這個區間就擋存並就地紅字（同建立流程）。開賣 11/1、既有限時購買 11/1–11/20 都落在區間內。 */
      listing: { from: '2026-10-20 12:00', to: '2026-11-21 23:59' },
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
      languages: ['cmn'],
      address: '',
      /* 2026-08-19 修正：date 原本是 '2026-08-08'，早於今天（2026-08-19），
         與 status:'on-sale'（仍在賣票）矛盾——賣票中的場次不該日期已過。
         改到 9 月中旬，跟 desc「一起回顧臺中那一夜」的語意相容（回顧場辦在
         正式場次結束後不久，不必是很久以後）。 */
      date: '2026-12-16',   // 2026-10-16 示範資料修正（UI-CHANGES 二百四十四）：09-16 又過期了（同上理由），往後移到 12 月
      start: '21:00',
      end: '',
      doors: '',
      /* 線上房間（2026-08-13，D149 落地）：共看派對不套票種頁與取票方式，但入場方式與
         付費門檻總得有個地方看。room.url＝觀眾進的房間、entry＝單一入場券的價格（同 tiers[0]，
         此處不另存一份金額）、chat＝是否開聊天室。實際房控功能仍待上游（見 ASSUMPTIONS WP-001）。 */
      /* 2026-10-13 D410 決定四（示範資料）：共看派對 F13–F19 的設定補齊（5.1.6.1 §4.9）——
         film＝播放內容（films-store id）、name＝房間名稱、endEst＝預估結束、capMode＝人數上限（limited／unlimited）、
         region＝可觀看地區（global／include／exclude ＋ 地區清單）、privacy＝隱私（public／private）；入場券＝tiers[0]。
         活動詳情的線上房間卡照 5.1.6.3 §2.4.3 只呈現連結、入場費、人數上限、聊天室；其餘值由建立流程續填草稿讀回。 */
      room: { url: 'ztor.live/w/lrh-taichung-watchback', chat: true, capacity: 300, capMode: 'limited',
              name: 'Taichung night, again', film: 'film-neon-harbor', endEst: '2026-12-16 23:00',
              region: { mode: 'include', list: ['TW', 'HK', 'MY'] }, privacy: 'public' },
      tiers: [{ id: 'tier-entry', name: 'Admission', price: 5, qty: 300, sold: 38 }],
      sold: 38,
      revenue: 190,
      status: 'on-sale',
      images: { keyvisual: 'images/projects/nick-lrh-tour.jpg', banner: 'images/projects/nick-lrh.jpg', gallery: [] },
      video: false
    },
    {
      /* 進行中的場次——今天就是開演日，所以 stage/status 是 'live'。
         必須是「今天」：日期寫未來卻標進行中，會跟它自己顯示的日期打架。
         2026-08-19 修正：date 原本釘死 '2026-07-27'（寫檔當天），改用 todayStr() 動態算，
         否則過幾天「進行中」就會變成「未來的進行中」，見檔頭同日新增的規則說明。
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
      country: 'TW',
      languages: ['cmn'],
      meetPoint: 'Neo Studio 1 樓櫃台',
      transit: '捷運市政府站 2 號出口步行 8 分鐘',
      address: 'No. 88 Bade Rd Sec 4, Songshan District',
      date: todayStr(),          // 2026-08-19：live 活動的日期一律動態＝今天，見檔頭規則
      start: '14:00',
      end: '16:00',
      doors: '13:30',
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
      highlight: '150 numbered slots only',   // D300 亮點示範
      desc: 'In-store signing for the new record. 150 numbered slots, one item signed per slot.',
      /* D354 描述區塊示範（原型自擬）：原 D334 一塊說明區塊轉成第二個文字區塊（原標題＝第一行粗體） */
      descBlocks: [
        { type: 'text', html: '<p>In-store signing for the new record. 150 numbered slots, one item signed per slot.</p>' },
        { type: 'text', html: '<p><strong>簽名流程</strong></p><p>依號碼牌順序入場，每個號碼可簽一件物品。<br>請提前準備好要簽名的物品，現場不提供代購。</p>' }
      ],
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Eslite Xinyi',
      city: 'Taipei, Taiwan',
      country: 'TW',
      languages: ['cmn'],
      meetPoint: '誠品信義 B2 活動區',
      transit: '捷運市政府站 2 號出口步行 3 分鐘',
      address: 'No. 11 Songgao Rd, Xinyi District',
      date: '2026-11-28',   // 2026-10-16 示範資料修正（UI-CHANGES 二百四十四）：原 09-12～09-14 已過、狀態卻是售票中；三場一起往後移，停售跟著移到第 1 場前一天
      start: '14:00',
      end: '16:00',
      doors: '13:30',
      /* 場次陣列（2026-08-11 使用者指示）：**定點活動的多場次收進同一筆活動**——場地共用一份，
         每場自己的日期時間與早到政策。單值的 date/start/end/doors 維持＝第 1 場的鏡像
         （頁首、清單列等舊消費端照讀）。每站不同場地的需求改用系列活動（每站一場獨立活動，D340）。 */
      sessions: [
        { id: 's1', date: '2026-11-28', start: '14:00', end: '16:00', doors: '13:30', early: 'warn' },
        { id: 's2', date: '2026-11-29', start: '14:00', end: '16:00', doors: '13:30', early: 'warn' },
        { id: 's3', date: '2026-11-30', start: '19:00', end: '21:00', doors: '18:00', early: 'block' }
      ],
      /* D380（2026-10-09）多場活動的獨立票示範：`sess`＝所屬場次（s3 晚場），只屬於那一場；
         活動詳情排在票種門票之後並寫出場次。 */
      tiers: [{ id: 'tier-slot', name: 'Signing slot', price: 5, qty: 150, sold: 118 },
              { id: 'tier-night', name: 'Night photo slot', price: 8, qty: 30, sold: 0, standalone: true, sess: 's3' }],
      /* 2026-08-13：多一筆組合包示範，讓「票券綁商品」不是只有巡演那兩場看得到
         （組合包與單賣的票共用同一個數量池，賣掉一組就從它含的那張票扣一張，BDL-001）。 */
      bundles: [
        { id: 'bd-slot-vinyl', name: '簽名場次 ＋ 限量黑膠', tickets: { tierIds: ['tier-slot'], qty: 1 },
          products: [{ name: 'LOVE RAGE HOPE 限量黑膠 1/500', img: 'images/products/coastline-acetate.webp', price: 40 }],
          price: 45, sold: 26, cap: 60 }
      ],
      /* 販售時間（2026-08-31 新欄 `sale`）：`from` 開賣、`to` 停售，皆為 'YYYY-MM-DD HH:MM'。
         `to` 留空＝只設開賣、賣到開演（見 ASSUMPTIONS SALE-001）；整個 `sale` 缺席＝不設開賣時間＝上架即開賣
         （D340 起沒有「直接販售／限時販售」二選一，開賣設定只剩這兩個選填時間）。
         這一筆示範「開賣＋停售」都設的完整區間。 */
      publish: { pickup: 'eticket', shown: true },   // D327：電子門票附屬設定值已清
      sale: { from: '2026-08-01 10:00', to: '2026-11-27 23:59' },
      sold: 118,
      revenue: 1630,   // 2026-10-16 示範資料修正（UI-CHANGES 二百四十四）：含組合包整組金額（D408）＝門票 92 × 5＋組合包 26 × 45
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
      country: 'TW',
      languages: ['cmn'],
      address: '',
      date: '2026-11-02',
      start: '18:30',
      end: '',
      doors: '',
      /* D391 第 5、13 題示範（2026-10-09）：已排程（還沒開賣）的兩場活動——活動詳情編輯模式可移除場次。移除 Day 2 會一併刪除
         「General admission · Day 2」與指定 Day 2 的獨立票「Sunset pit」，確認對話列出這兩張；Sunset pit 列在組合包
         bd-pt-sunset-tee 的允許清單，儲存後組合包保留、組合商品細節頁把它顯示為停用，允許清單只剩它＝整組不能賣。
         兩場＝多場次（S87 ⚪）：release2.4 由 list() 的多場過濾收起、活動清單那一列掛 data-feat="S87"。 */
      sessions: [
        { id: 's1', name: 'Day 1', date: '2026-11-02', start: '18:30', end: '', doors: '', early: 'warn' },
        { id: 's2', name: 'Day 2', date: '2026-11-03', start: '18:30', end: '', doors: '', early: 'warn' }
      ],
      /* 2026-08-18 修正：同 taiwan-fest-kenting——已排程代表建立流程已走完，而票種是流程的必填。 */
      tiers: [
        { id: 'tier-ga', name: 'General admission', price: 500, qty: 2000, sold: 0 },
        { id: 'tier-pt-sunset', name: 'Sunset pit', price: 900, qty: 200, sold: 0, standalone: true, sess: 's2' }
      ],
      bundles: [
        { id: 'bd-pt-sunset-tee', name: 'Sunset pit ＋ 黑鮪魚祭 T 恤', tickets: { tierIds: ['tier-pt-sunset'], qty: 1 },
          products: [{ name: '黑鮪魚祭限定 T 恤', img: 'images/products/coastline-tee.webp', price: 600 }],
          price: 1400, sold: 0, cap: 80 }
      ],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { keyvisual: 'images/projects/nick-flames.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      id: 'taipei-nye',
      /* 2026-10-13 D410 決定四（示範資料）：release2.4 只開放演唱會類型，原本的 festival 改成 concert；
         這一場是「已排程」的 bookyay 演唱會全選項示範（亮點、陣容、圖庫、影片預告、門票圖片另補，其餘原本就有）。 */
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',                  // 見檔頭 TYPE→CATEGORY 對應表
      series: null,
      /* bookyay 帶入的活動示範（2026-09-29 D330 改寫，取代 D306 起的「票種基準幣別強制港幣」）：
         帶入金額一律是港幣，基準價換算成創作者幣別（示範創作者＝TWD）後鎖定；價格表的港幣欄＝bookyay 原價（`hkd`）、
         鎖定，港幣以外——含創作者幣別欄 TWD——都可覆寫。所以本筆不再寫 `currency`（＝DEFAULT_CURRENCY 'TWD'），
         票種 `price` 是換算後的 TWD 基準價、`hkd` 是 bookyay 原價。這一筆是站上唯一的 source:'bookyay'。 */
      source: 'bookyay',
      /* bookyay 掃描器連結（2026-10-12 D394；D401 決定一：bookyay 建立活動時產生、匯入時直接帶入的欄位）：活動詳情的掃碼器卡顯示這條連結＋複製。
         網址格式是原型示意（ASSUMPTIONS BKY-SCAN-001）；這一筆沒有 bkyId，路徑用活動代號。
         墓碑（D401）：原本 hsinchu-vinyl-sf 刻意不給、示範「bookyay 還沒給連結」——連結改為必定帶入，兩筆都給；缺漏時的說明只留作防呆。 */
      bkyScanUrl: 'https://organizer.bookyay.com/scan/taipei-nye',
      name: "Taipei New Year's Eve countdown concert",
      highlight: 'Fireworks at midnight, encore after',   // D410 示範：亮點不在 bookyay 鎖定範圍，創作者帶入後自己補
      desc: "Countdown stage set for Taipei's New Year's Eve city party.",
      /* 描述（2026-10-09 D385 決定五示範）：bookyay 活動詳情（intros）多段帶入——第 1 段文字＋段內圖片、第 2 段起各成文字區塊
         （D354 決定六），整份鎖定（D362）。活動詳情的描述照這份區塊顯示並鎖住；內容是原型自擬的中文示範。 */
      descBlocks: [
        { type: 'text', html: "<p>Countdown stage set for Taipei's New Year's Eve city party.</p><p>跨年夜市府廣場主舞台，22:00 開唱一路唱到倒數，<strong>零點煙火</strong>後加碼安可。</p>" },
        { type: 'image', src: 'images/projects/nick-baipa.jpg' },
        { type: 'text', html: '<p><strong>入場須知</strong></p><ul><li>21:00 開放入場，限制提早入場（早到者請於廣場外排隊）</li><li>場內禁止攜帶自拍棒、雷射筆與玻璃瓶</li></ul>' },
        { type: 'text', html: '<p><strong>交通管制</strong></p><p>12/31 18:00 起信義區周邊道路管制，建議搭乘捷運；散場後市政府站單向進站。<br>詳見 <a href="https://example.com/taipei-nye/traffic">交通管制說明</a>。</p>' }
      ],
      lineup: ['NICKTHEREAL 周湯豪', 'Kai Band 凱樂團'],
      venue: "Taipei New Year's Eve",
      city: 'Taipei, Taiwan',
      meetPoint: '市府廣場服務台',
      transit: '捷運市政府站 2 號出口步行 5 分鐘',
      /* 完整地址（D329：bookyay「地區」原樣帶入、鎖定）。2026-10-07 補值——原本留空，活動詳情的鎖定標記看不出鎖的是什麼 */
      address: '信義區',
      country: 'TW',                        // 活動國家（bookyay 帶入、鎖定；活動詳情總覽同樣鎖定顯示，D370）
      date: '2026-12-31',
      /* 跨日活動（2026-09-29 D328 示範）：跨年場從 12/31 22:00 唱到 1/1 00:30——bookyay 時段的開始與結束不同天，
         帶入時自動開跨日並帶結束日期（5.1.6.1 F21／F7）。endDate 有值＝跨日；沒寫＝單日。 */
      endDate: '2027-01-01',
      start: '22:00',
      end: '00:30',
      /* 過早入場（2026-10-07 D365；5.1.6.1 F21）：bookyay「過早入場提示」60 分鐘 → 開放入場＝開演前 60 分鐘（21:00）；
         「過早入場的處理」＝限制操作 → 早於開放時間入場＝不能入場（block）。兩者帶入後鎖定（活動詳情也鎖）。
         「bookyay 沒設定過早入場」（開放入場留空並鎖定）的示範改由 create-event 匯入清單的 bky-5 承擔——
         khh-countdown-draft 自 2026-10-13（D410 示範資料）起改為有設定過早入場。 */
      doors: '21:00',
      early: 'block',
      /* 活動語言（D328）：活動現場用的語言，可複選；值＝語言碼（yue／cmn／en／ja／ko／th／vi），顯示字串走 ce.evlang.*。
         bookyay 帶入的多值、鎖定。其他示範活動沒寫＝未填。 */
      languages: ['cmn', 'en'],
      /* 條款與細則（2026-10-07 D362；5.1.6.1／5.1.6.2 F2）：{ tnc: { on, text } }，沒寫＝關（D340）。
         bookyay 帶入的活動：tnc 照 bookyay「顯示條款及細則」帶入（只留文字與換行）、鎖定。
         墓碑 2026-10-12（D395）：直接促銷同意（marketing）整組移除，假資料不再帶這個鍵。
         khh-countdown-draft 沒寫＝bookyay 沒勾，條款及細則帶入為關、同樣鎖定。 */
      terms: {
        tnc: { on: true, text: '本票券一經售出，除活動取消或延期外，恕不退換。\n每筆訂單限購 4 張；轉售票券不予入場。\n入場時須出示電子票券 QR Code 與身分證件。\n\n跨年活動為戶外場地，如遇天候因素將依主辦單位公告調整演出內容。' }
      },
      /* 2026-08-13：這一場備好票種，當「準備中 → 開賣」那條動線的完整示範。
         （2026-08-18 更正：原本這裡還寫著「其餘準備中的活動票種仍為空」——那批已於同日
         補上票種。票種是建立流程的必填，已排程卻沒有票種的活動在產品上生不出來。） */
      tiers: [
        /* D330：`hkd`＝bookyay 原價（港幣，可有小數）、鎖定；`price`＝換算成創作者幣別 TWD 的基準價（§7.15 票價整數、四捨五入）、鎖定。
           HK$300 → NT$1,212（示範匯率）；創作者幣別欄可覆寫——示範覆寫成整數好看的 NT$1,200（覆寫值＝粉絲以 TWD 買的實付價）。
           2026-10-16（D429 示範資料）：bookyay 二人套票帶入後就是一張普通門票——票價照 bookyay 現價 HK$550 → NT$2,221（HK$ ÷ 7.8 × 31.5，四捨五入）、
           張數照 bookyay 時段上限 400、本門票限購每人 2 張（鎖定，rulesFix）；ztor 一票一碼，這張在 ztor 算 1 張、1 個 QR。
           墓碑：原本拆成隱藏且鎖定的 1 人票（HK$275 × 400 張，hideFix）＋自動組合包 bd-nye-duo（D328／D329）。 */
        { id: 'tier-duo', name: 'Duo pass', price: 2221, hkd: 550, qty: 400, sold: 0, img: 'images/projects/nick-i.jpg',   // D410 示範：門票圖片
          rules: { conds: { cap: { person: '2', bky: true } } }, rulesFix: true },
        /* 購買條件（2026-10-09 D385 決定一示範；形狀同 create-event 的門票規則 { conds }，bky:true＝由 bookyay 帶入、鎖定）：
           本門票限購（每人 4 張；D417 起限購次數、折扣優惠、早鳥都不帶入，D427 起每次交易也不帶入）。有 bookyay 門票層條件＝這張票用自己那一組、整組鎖定（rulesFix，D367 決定五）。
           活動詳情單張門票彈窗唯讀呈現、掛 From bookyay。 */
        { id: 'tier-ga',    name: 'General admission', price: 1212, hkd: 300, qty: 1600, sold: 0, override: { TWD: 1200, USD: 38 }, img: 'images/projects/nick-baipa-goods.jpg',
          rules: { conds: { cap: { person: '4', bky: true } } },
          rulesFix: true },
        /* D414 示範資料裁決（2026-10-14）：一場 bookyay 演唱會可以放多種門票（不改 D328 產品規則）。下面兩種是 bookyay 時段裡的其他票種，
           各有自己的購買條件（鎖定）：站席限購、座席限購＋早鳥。這場還沒開賣，三種票 sold 都是 0。 */
        { id: 'tier-floor', name: 'Standing zone', price: 2020, hkd: 500, qty: 600, sold: 0, img: 'images/projects/nick-asn.jpg',
          rules: { conds: { cap: { person: '2', bky: true } } }, rulesFix: true },
        { id: 'tier-seat', name: 'Reserved seating', price: 1010, hkd: 250, qty: 800, sold: 0, img: 'images/projects/nick-wln.jpg',
          rules: { conds: { cap: { person: '4', bky: true } } },
          rulesFix: true }
      ],
      /* 活動層預設購票規則：D417 決定一（2026-10-15）起 bookyay 活動限購不帶入，活動層沒有條件、創作者也不能設定
         （原 D385 決定一示範的活動限購 6／4／2 移除）。 */
      rules: { conds: {} },
      /* 墓碑 2026-10-16（D429）：bookyay 二人套票自動建立的組合包 bd-nye-duo（1 人票 × 2、鎖定 200 套、整組鎖定 fix、港幣欄鎖 HK$550）刪除；
         套票限購改落在門票 tier-duo 本身。下面創作者自建的組合包保留。 */
      bundles: [
        /* 創作者自建、成員含 bookyay 匯入票券的組合包（2026-09-29 D331 決定六示範）：欄位照一般組合包
           可編輯；只有價格表港幣欄依公式鎖定——（GA 港幣原價 HK$300 × 1 ＋ 手環 NT$400 換算 HK$99）×（1 − 10%）＝HK$359.10
           （events-store bkyBundleHkd）。基準價＝（NT$1,212 ＋ NT$400）× 0.9＝NT$1,450.8 → NT$1,451；創作者把 TWD 欄覆寫成 NT$1,450，
           清單、摘要、KPI 顯示 NT$1,450（D331 決定一）。disc＝組合折扣 %（本輪新欄，見 bkyBundleHkd 說明）。 */
        { id: 'bd-nye-ga-band', name: 'GA + countdown wristband', tickets: { tierIds: ['tier-ga'], qty: 1 },
          /* pickup（D401 決定四，原型示意欄位，ASSUMPTIONS UIA-248）：這個商品在哪個取貨場次領取——s＝pickup-detail.html 的示範狀態、
             nameKey＝場次名稱（pickup.html 的示範列）。活動詳情「前往領取場次」依綁到的場次數分三種去處。 */
          products: [{ name: 'Countdown night wristband', img: 'images/products/wristband.webp', price: 400, pickup: { s: 'scheduled', nameKey: 'pk.row2.name' } }],
          disc: 10, price: 1451, sold: 0, cap: 300, override: { TWD: 1450 },
          /* 2026-10-16 示範資料補齊（note/release2.4 假資料覆蓋稽核 E6、E8；不是產品規則）：
             · sched.saleStart：開賣「另設」、早於活動開賣 11/01（仍在上架區間 10/25 起之內）——上架、下架、停售跟隨活動（S62）。
             · rules.conds.cap：組合包限購「覆寫」每人 1 組（S94，獨立計算；門票 tier-ga 換算上限 4 組）。活動組合包的
               bundle-detail 讀法只認 rules（evSeed 沒有 limits 欄），所以用 D366 條件清單形狀帶；release2.4 的購買條件區（S63 ⚪）收起，不受影響。 */
          sched: { saleStart: '2026-10-28T12:00' },
          rules: { conds: { cap: { person: '1' } } } }
      ],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      /* 圖片（D385 決定五）：bookyay 原圖 1:1（D328 不裁切、不鎖；不合 2:3 不擋發布，D329）。原本是 hero-event.jpg（橫幅），看不出 1:1 帶入 */
      images: { keyvisual: 'images/projects/nick-baipa.jpg', banner: '', gallery: ['images/projects/nick-realive.jpg', 'images/projects/nick-r2.jpg'] },
      video: 'images/events/teaser-demo.mp4',   // D410 示範：影片預告（原型自製的 4 秒示意影片）
      /* 發布設定：bookyay 帶入者的取票方式本身在詳情頁也鎖（值來自 bookyay、要改回 bookyay 改；
         D308 決定一經 D327 修訂為只剩取票方式本身）。 */
      publish: { pickup: 'eticket', shown: true },
      sale: { from: '2026-11-01 12:00', to: '' },   // D340：原 onsale:'scheduled' 沒有時間，補上開賣時間
      listing: { from: '2026-10-25 12:00', to: '2027-01-01 12:00' }   // D410 示範：上架時間（排程上架）
    },
    {
      /* bookyay 帶入、取票方式＝順豐寄送的示範（2026-10-09 D385 決定五）：單一時段，release2.4 也看得到（順豐不在 S89 到店自取的範圍）。
         取票方式本身與運費鎖定（D308 決定一經 D327 修訂）；運費 bookyay HK$30 → 換算成創作者幣別 NT$121 當基準值（D368 決定四，
         匯率同 taipei-nye 的示範 HK$300 → NT$1,212）。票價同口徑：HK$690 → NT$2,788；本門票限購每人 1 張（bookyay 帶入、鎖定；D417 起限購次數、D427 起每次交易都不帶入）。
         沒有活動限購（D417 起 bookyay 活動一律沒有活動層限購）。對應 create-event 匯入清單的已帶過列 bky-14。 */
      id: 'hsinchu-vinyl-sf',
      bkyId: 'bky-14',
      /* 2026-10-13 D410 決定四（示範資料）：release2.4 只開放演唱會，發表會改成演唱會（名稱同步改；順豐寄送示範不變） */
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      source: 'bookyay',
      bkyScanUrl: 'https://organizer.bookyay.com/scan/bky-14',   // D401 決定一：匯入時帶入（原型示意網址，BKY-SCAN-001）
      series: null,
      name: 'Vinyl release concert — Hsinchu',
      highlight: 'Signed collector ticket shipped to you',   // D410 示範：亮點
      desc: '新專輯黑膠發行演唱會，購票附一張實體收藏票券，以順豐寄送到府。',
      descBlocks: [
        { type: 'text', html: '<p>新專輯黑膠發行演唱會，購票附一張實體收藏票券，以順豐寄送到府。</p>' },
        { type: 'text', html: '<p><strong>寄送說明</strong></p><ul><li>開演前 10 天統一寄出，收件地址僅限台灣本島</li><li>票券遺失或毀損不補發</li></ul>' }
      ],
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'The Wall Hsinchu',
      city: 'Hsinchu, Taiwan',
      country: 'TW',
      languages: ['cmn'],
      meetPoint: '1 樓售票口',
      transit: '新竹火車站步行 10 分鐘',
      address: '東區',
      date: '2026-12-12',
      start: '19:00',
      end: '21:00',
      doors: '18:30',
      early: 'warn',
      terms: {
        tnc: { on: true, text: '實體收藏票券以順豐寄送，寄出後恕不退換。\n散場後簽名會每人限簽一件，限本場販售之黑膠商品。' }
      },
      tiers: [
        { id: 'tier-hc-sign', name: 'Concert entry', price: 2788, hkd: 690, qty: 300, sold: 0,
          rules: { conds: { cap: { person: '1', bky: true } } }, rulesFix: true }
      ],
      bundles: [],
      sold: 0,
      revenue: 0,
      status: 'scheduled',
      images: { keyvisual: 'images/projects/nick-real-life.jpg', banner: '', gallery: [] },
      video: false,
      /* 2026-10-16 示範資料補齊（稽核 E3）：顯示設定＝隱藏（S61）——只能經活動連結進入；這場沒有組合包。 */
      publish: { pickup: 'sf', shipFee: 121, shipFeeHkd: 30, shown: false },
      sale: { from: '2026-11-01 12:00', to: '2026-12-05 23:59' }
    },
    /* ── bookyay 演唱會：六個狀態的全選項示範（2026-10-13 D410 決定四，原型示範資料、不是產品規則）──────────────
       release2.4 只顯示 bookyay 匯入的活動與共看派對；每個狀態各一場「所有選項都填入或開啟」的 bookyay 演唱會：
         草稿＝khh-countdown-draft、已排程＝taipei-nye（另有順豐寄送 hsinchu-vinyl-sf）、售票中＝nick-live-taichung-bky
         ＋nick-acoustic-tainan-bky（已下架）、進行中＝nick-live-taoyuan-bky、已結束＝nick-live-kaohsiung-bky（另有已結束且已封存 nick-summer-pingtung-bky，D457）。
       金額口徑同 taipei-nye（D330）：hkd＝bookyay 港幣原價（鎖定）、price＝換算成創作者幣別 TWD 的基準價（HK$ ÷ 7.8 × 31.5，四捨五入）。
       門票：二人套票帶入後就是一張普通門票（D429，2026-10-16；票價照 bookyay 現價、張數照時段上限、本門票限購落在這張票，rulesFix；
       墓碑：原本拆成隱藏 1 人票＋自動組合包，D328／D329），另一張單人票帶自己的 bookyay 限購（D366、D367，rulesFix）。D417（2026-10-15）起折扣、早鳥、限購次數、活動限購都不帶入。⚠ 一個時段兩種票與 D328「只帶第一種門票」不一致，
       沿用 taipei-nye 的既有示範寫法（ASSUMPTIONS UIA-252 第 3 項待裁決）。
       已報到（D410 決定三）：bkyCheckin＝bookyay QR 掃描回傳的入場紀錄；received:true 才有人數（count），沒有這欄或 received:false＝暫無資料。
       tier.sold 含經組合包賣出的票（D408）；revenue＝直接買票＋組合包整組金額，與 event-detail edRevTotals() 同口徑。 */
    {
      id: 'nick-live-taichung-bky',
      bkyId: 'bky-16',   /* D414：對應 js/sidebar.js BOOKYAY_EVENTS 的 bky-16（Admin 創作者活動管理，已發布） */
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      source: 'bookyay',
      bkyScanUrl: 'https://organizer.bookyay.com/scan/nick-live-taichung-bky',
      series: null,
      name: 'NICKTHEREAL LIVE 2026 — Taichung',
      highlight: 'Taichung only — full band',
      desc: '全新編制樂團的台中站，專輯完整曲序演出，安可加碼未發表新歌。',
      descBlocks: [
        { type: 'text', html: '<p>全新編制樂團的台中站，專輯完整曲序演出，<strong>安可加碼未發表新歌</strong>。</p>' },
        { type: 'image', src: 'images/projects/nick-mxw.jpg' },
        { type: 'video', src: 'images/events/teaser-demo.mp4' },
        { type: 'text', html: '<p><strong>入場須知</strong></p><ul><li>開演前 60 分鐘開放入場，二人套票兩人須一起驗票</li><li>場內禁止攜帶自拍棒、雷射筆與玻璃瓶</li></ul>' },
        { type: 'text', html: '<p><strong>輪椅席</strong></p><p>開演前 7 天來信客服登記，每位輪椅使用者可有 1 位陪同者。<br>詳見 <a href="https://example.com/nick-live-taichung/access">無障礙說明</a>。</p>' }
      ],
      lineup: ['NICKTHEREAL 周湯豪', 'Kai Band 凱樂團'],
      venue: '臺中洲際棒球場',
      city: 'Taichung, Taiwan',
      country: 'TW',
      languages: ['cmn', 'en'],
      meetPoint: '1 號門售票口',
      transit: '台中捷運文心崇德站轉接駁車約 15 分鐘',
      address: '北屯區',
      date: '2026-11-21',
      endDate: '2026-11-22',   // D410 示範：跨日（bookyay 時段 11/21 19:30 → 11/22 00:30，安可後加演）
      start: '19:30',
      end: '00:30',
      doors: '18:30',
      early: 'warn',
      terms: {
        tnc: { on: true, text: '本票券一經售出，除活動取消或延期外，恕不退換。\n二人套票限兩人同行，須一起驗票入場。\n入場時須出示電子票券 QR Code 與身分證件；轉售票券不予入場。' }
      },
      tiers: [
        /* 二人套票（D429 示範資料）：一張普通門票 HK$880 → NT$3,554、張數照時段上限 301、賣出 60 張（＝原自動組合包的 60 組）；
           本門票限購每人 2 張（鎖定）。墓碑：原本 1 人票 HK$440 × 300 張（隱藏鎖定）＋自動組合包 bd-tc-duo。 */
        { id: 'tier-tc-duo', name: 'Duo pass', price: 3554, hkd: 880, qty: 301, sold: 60, img: 'images/projects/nick-i.jpg',
          rules: { conds: { cap: { person: '2', bky: true } } }, rulesFix: true },
        /* 單人票：本門票限購（每人 4；D427 起每次交易不帶入）；整組鎖定（rulesFix）。D417：折扣與早鳥不帶入（原示範的折扣 NT$1,938、早鳥 NT$1,777 移除）。
           門票圖片換成自己的圖（D383 決定五）；美元覆寫成 US$65（在地化覆寫，港幣欄鎖 HK$520）。 */
        { id: 'tier-tc-ga', name: 'General admission', price: 2100, hkd: 520, qty: 500, sold: 160, override: { USD: 65 }, img: 'images/projects/nick-lwh.jpg',
          rules: { conds: { cap: { person: '4', bky: true } } },
          rulesFix: true },
        /* D414 示範資料裁決（2026-10-14）：一場 bookyay 演唱會可以放多種門票（不改 D328 產品規則）。下面兩種是 bookyay 時段裡的其他票種，
           各有自己的購買條件（鎖定）：站席限購、座席限購＋早鳥。sold 由原本單人票的張數拆出，event.sold 不變、revenue 依三種票價重算。 */
        { id: 'tier-tc-floor', name: 'Standing zone', price: 3192, hkd: 790, qty: 300, sold: 110, img: 'images/projects/nick-asn.jpg',
          rules: { conds: { cap: { person: '2', bky: true } } }, rulesFix: true },
        /* 2026-10-16 示範資料補齊（稽核 E1；不是產品規則）：座席票設為隱藏（S92）——粉絲頁票價清單不列，持連結與組合包仍可賣；
           先前已售的 70 張照算。 */
        { id: 'tier-tc-seat', name: 'Reserved seating', price: 1495, hkd: 370, qty: 400, sold: 70, img: 'images/projects/nick-wln.jpg', hidden: true,
          rules: { conds: { cap: { person: '4', bky: true } } },
          rulesFix: true },
        /* 2026-10-16 示範資料補齊（稽核 S7）：bookyay 帶入的免費門票（同建立流程匯入候選 bky-9 的免費票；HK$0 → NT$0）——輪椅席陪同者，
           描述的「輪椅席」段落說每位輪椅使用者可有 1 位陪同者。金額 0 的交易就是訂單管理的免費門票訂單（D414）；
           排在最後，既有門票的訂單編號不位移。收入不變。 */
        { id: 'tier-tc-companion', name: 'Wheelchair companion', price: 0, hkd: 0, qty: 20, sold: 6, img: 'images/projects/nick-lwh.jpg',
          rules: { conds: { cap: { person: '1', bky: true } } }, rulesFix: true }
      ],
      rules: { conds: {} },   // D417 決定一（2026-10-15）：bookyay 活動限購不帶入，活動層沒有條件
      bundles: [
        /* 墓碑 2026-10-16（D429）：自動建立的套票組合包 bd-tc-duo（賣出 60 組）刪除，銷量改記在門票 tier-tc-duo。 */
        /* 2026-10-16 示範資料補齊（D435／D433 示範；不是產品規則）：創作者自建、已下架、尚未售出的組合包——
           活動發布後，組合包下架了才能改庫存以外的資料（D435）；尚未售出，所以允許的門票與張數也還能改（D433）。 */
        { id: 'bd-tc-floor-tee', name: 'Standing zone ＋ 巡演官方 Tee', desc: '站區票加一件巡演官方 Tee，演出當天現場領取。', tickets: { tierIds: ['tier-tc-floor'], qty: 1 },
          products: [{ name: 'REALIVE 白趴 官方 Tee', img: 'images/products/tee-black.webp', price: 600, pickup: { s: 'scheduled', nameKey: 'pk.row2.name' } }],
          disc: 10, price: 3413, sold: 0, cap: 100, listed: false },
        /* 創作者自建：單人票 ＋ 電子商店商品（官方 Tee，綁取貨場次）；組合折扣 10%、限量 200、美元覆寫 */
        { id: 'bd-tc-ga-tee', name: 'GA ＋ 巡演官方 Tee', tickets: { tierIds: ['tier-tc-ga'], qty: 1 },
          products: [{ name: 'REALIVE 白趴 官方 Tee', img: 'images/products/tee-black.webp', price: 600, pickup: { s: 'scheduled', nameKey: 'pk.row2.name' } }],
          disc: 10, price: 2430, sold: 25, cap: 200, override: { USD: 76 } }
      ],
      sold: 406,   // D429：原 460（套票 1 人票 120 張 → 套票門票 60 張）；收入不變。2026-10-16 ＋6（免費陪同票 tier-tc-companion）
      revenue: 1013260,
      status: 'on-sale',
      images: { keyvisual: 'images/projects/nick-mxw.jpg', banner: '', gallery: ['images/projects/nick-asn.jpg', 'images/projects/nick-i.jpg'] },
      video: 'images/events/teaser-demo.mp4',
      publish: { pickup: 'eticket', shown: true },
      sale: { from: '2026-09-15 12:00', to: '2026-11-20 23:59' },
      listing: { from: '2026-09-01 12:00', to: '2026-11-22 12:00' }
    },
    {
      /* 售票中＋已下架（D361 決定五／D371）：bookyay 演唱會版本；單一單人票、本門票限購。
         2026-10-14 D415 示範：下架原因＝bookyay 端改了場次開始時間（19:00 → 19:30），同步到 ztor 後自動下架並通知創作者，
         要創作者手動重新上架（bkySyncUnlist；活動詳情頁首下方顯示提示）。 */
      id: 'nick-acoustic-tainan-bky',
      bkyId: 'bky-17',   /* D414：對應 js/sidebar.js BOOKYAY_EVENTS 的 bky-17（Admin 創作者活動管理，已發布） */
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      source: 'bookyay',
      bkyScanUrl: 'https://organizer.bookyay.com/scan/nick-acoustic-tainan-bky',
      series: null,
      name: 'NICKTHEREAL Acoustic Night — Tainan',
      highlight: 'Just guitar and piano, all seated',   // D410 示範：亮點
      desc: '只有一把吉他與鋼琴的原聲之夜。',
      descBlocks: [
        { type: 'text', html: '<p>只有一把吉他與鋼琴的原聲之夜，全場座席。</p>' }
      ],
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: '台南文化中心 演藝廳',
      city: 'Tainan, Taiwan',
      country: 'TW',
      languages: ['cmn'],
      meetPoint: '演藝廳大廳',
      transit: '台鐵台南站轉公車約 20 分鐘',
      address: '東區',
      date: '2026-12-05',
      start: '19:30',
      end: '21:30',
      /* 2026-10-16 示範資料補齊（稽核 E10）：bookyay 沒設定過早入場 → 提前入場時間關閉（開放入場留空、帶入後鎖定；原 19:00＋仍可入場）。 */
      doors: '',
      terms: { tnc: { on: true, text: '全場座席，開演後依工作人員引導入座。' } },
      tiers: [
        { id: 'tier-tn-seat', name: 'Seated', price: 1615, hkd: 400, qty: 500, sold: 88,
          rules: { conds: { cap: { person: '2', bky: true } } }, rulesFix: true }
      ],
      bundles: [],
      sold: 88,
      revenue: 142120,
      status: 'on-sale',
      unlisted: true,
      /* D415 決定一～三：bookyay 修改同步後自動下架。field 對 i18n `ed.bkysync.f.<field>`（start／date／venue／price）；
         at＝同步時間。重新上架後 unlisted 由 localStorage `ztor.event-unlisted` 蓋成 false，提示跟著收起。 */
      bkySyncUnlist: { at: '2026/10/13 15:20', changes: [{ field: 'start', from: '19:00', to: '19:30' }] },
      images: { keyvisual: 'images/projects/nick-wln.jpg', banner: '', gallery: [] },
      video: false,
      publish: { pickup: 'eticket', shown: true },
      sale: { from: '2026-10-01 12:00', to: '2026-12-04 23:59' }
    },
    {
      /* 進行中：bookyay 已回傳入場紀錄（bkyCheckin.received），已報到＝1,236 人 */
      id: 'nick-live-taoyuan-bky',
      bkyId: 'bky-18',   /* D414：對應 js/sidebar.js BOOKYAY_EVENTS 的 bky-18（Admin 創作者活動管理，已發布） */
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      source: 'bookyay',
      bkyScanUrl: 'https://organizer.bookyay.com/scan/nick-live-taoyuan-bky',
      series: null,
      name: 'NICKTHEREAL LIVE 2026 — Taoyuan',
      highlight: 'Tour opener — first night',
      desc: '巡演首站，全新舞台與完整曲序。',
      descBlocks: [
        { type: 'text', html: '<p>巡演首站，全新舞台與完整曲序，<strong>安可加碼未發表新歌</strong>。</p>' },
        { type: 'image', src: 'images/projects/nick-realive.jpg' },
        { type: 'text', html: '<p><strong>入場須知</strong></p><ul><li>開演前 90 分鐘開放入場，提早到場不能入場</li><li>二人套票兩人須一起驗票</li></ul>' }
      ],
      lineup: ['NICKTHEREAL 周湯豪', 'Kai Band 凱樂團'],
      venue: '桃園巨蛋',
      city: 'Taoyuan, Taiwan',
      country: 'TW',
      languages: ['cmn', 'en'],
      meetPoint: '巨蛋 A 門',
      transit: '捷運桃園巨蛋站（施工中）改搭接駁車約 10 分鐘',
      address: '桃園區',
      date: todayStr(),          // live 活動的日期一律動態＝今天，見檔頭規則
      endDate: addDays(todayStr(), 1),   // D410 示範：跨日（今天 19:30 → 明天 00:30），結束日跟著今天走
      start: '19:30',
      end: '00:30',
      doors: '18:00',
      early: 'block',
      terms: {
        tnc: { on: true, text: '本票券一經售出，除活動取消或延期外，恕不退換。\n入場時須出示電子票券 QR Code；轉售票券不予入場。' }
      },
      tiers: [
        /* 二人套票（D429 示範資料）：一張普通門票 HK$880、張數照時段上限 400、賣出 200 張（＝原自動組合包 200 組）。 */
        { id: 'tier-ty-duo', name: 'Duo pass', price: 3554, hkd: 880, qty: 400, sold: 400, img: 'images/projects/nick-i.jpg',
          rules: { conds: { cap: { person: '2', bky: true } } }, rulesFix: true },
        { id: 'tier-ty-ga', name: 'General admission', price: 2100, hkd: 520, qty: 700, sold: 700, override: { USD: 65 }, img: 'images/projects/nick-lwh.jpg',
          rules: { conds: { cap: { person: '4', bky: true } } },
          rulesFix: true },
        /* D414 示範資料裁決（2026-10-14）：一場 bookyay 演唱會可以放多種門票（不改 D328 產品規則）。下面兩種是 bookyay 時段裡的其他票種，
           各有自己的購買條件（鎖定）：站席限購、座席限購＋早鳥。sold 由原本單人票的張數拆出，event.sold 不變、revenue 依三種票價重算。 */
        { id: 'tier-ty-floor', name: 'Standing zone', price: 3192, hkd: 790, qty: 350, sold: 350, img: 'images/projects/nick-asn.jpg',
          rules: { conds: { cap: { person: '2', bky: true } } }, rulesFix: true },
        { id: 'tier-ty-seat', name: 'Reserved seating', price: 1495, hkd: 370, qty: 250, sold: 250, img: 'images/projects/nick-wln.jpg',
          rules: { conds: { cap: { person: '4', bky: true } } },
          rulesFix: true }
      ],
      rules: { conds: {} },   // D417 決定一（2026-10-15）：bookyay 活動限購不帶入，活動層沒有條件
      bundles: [
        /* 墓碑 2026-10-16（D429）：自動建立的套票組合包 bd-ty-duo（賣出 200 組）刪除，銷量改記在門票 tier-ty-duo。 */
        { id: 'bd-ty-ga-tee', name: 'GA ＋ 巡演官方 Tee', tickets: { tierIds: ['tier-ty-ga'], qty: 1 },
          products: [{ name: 'REALIVE 白趴 官方 Tee', img: 'images/products/tee-black.webp', price: 600, pickup: { s: 'scheduled', nameKey: 'pk.row2.name' } }],
          /* 2026-10-16 示範資料補齊（稽核 E2；不是產品規則）：這組設為隱藏（S99，卡上「隱藏」徽章）——營運動作，sold 照算 */
          disc: 10, price: 2430, sold: 120, cap: 120, override: { USD: 76 }, shown: false }
      ],
      /* 2026-10-16 示範資料補齊（稽核 E4）：全部門票賣完＝「完售」徽章（S85）；組合包也賣到上限 120。
         原 1,304（D429：原 1,504，套票 1 人票 400 張 → 套票門票 200 張）。 */
      sold: 1700,
      revenue: 4422150,   // 2026-10-16 完售示範：原 3,310,690，依交易明細（直接買票＋組合包整組）重算
      status: 'live',
      bkyCheckin: { received: true, count: 1236 },
      images: { keyvisual: 'images/projects/nick-realive.jpg', banner: '', gallery: ['images/projects/nick-r2.jpg', 'images/projects/nick-asn.jpg'] },
      video: 'images/events/teaser-demo.mp4',
      publish: { pickup: 'eticket', shown: true },
      sale: { from: '2026-08-01 12:00', to: '' },
      listing: { from: '2026-07-25 12:00', to: '' }
    },
    {
      /* 已結束：bookyay 已回傳入場紀錄，最終已報到＝1,488 人（D429 起原 1,688 改小，不超過售出 1,590 張） */
      id: 'nick-live-kaohsiung-bky',
      bkyId: 'bky-19',   /* D414：對應 js/sidebar.js BOOKYAY_EVENTS 的 bky-19（Admin 創作者活動管理，已發布） */
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      source: 'bookyay',
      bkyScanUrl: 'https://organizer.bookyay.com/scan/nick-live-kaohsiung-bky',
      series: null,
      name: 'NICKTHEREAL LIVE 2026 — Kaohsiung',
      highlight: 'Harbour stage, sunset start',
      desc: '高雄港邊的露天場，日落開唱。',
      descBlocks: [
        { type: 'text', html: '<p>高雄港邊的露天場，<strong>日落開唱</strong>，安可後港邊煙火。</p>' },
        { type: 'image', src: 'images/projects/nick-baipa.jpg' },
        { type: 'text', html: '<p><strong>雨天備案</strong></p><p>小雨照常演出，請自備輕便雨衣；<em>現場禁止撐傘</em>。</p>' }
      ],
      lineup: ['NICKTHEREAL 周湯豪', 'Kai Band 凱樂團'],
      venue: '高雄流行音樂中心 海音館',
      city: 'Kaohsiung, Taiwan',
      country: 'TW',
      languages: ['cmn', 'en'],
      meetPoint: '海音館 1 樓大廳',
      transit: '輕軌真愛碼頭站步行 5 分鐘',
      address: '鹽埕區',
      date: '2026-09-26',
      endDate: '2026-09-27',   // D410 示範：跨日（日落 18:00 開唱 → 港邊煙火後 00:15 散場）
      start: '18:00',
      end: '00:15',
      doors: '17:00',
      early: 'block',
      terms: {
        tnc: { on: true, text: '本票券一經售出，除活動取消或延期外，恕不退換。\n戶外場地如遇天候因素，將依主辦單位公告調整演出內容。' }
      },
      tiers: [
        /* 二人套票（D429 示範資料）：一張普通門票 HK$880、張數照時段上限 400、賣出 190 張（＝原自動組合包 190 組）。 */
        { id: 'tier-kh-duo', name: 'Duo pass', price: 3554, hkd: 880, qty: 400, sold: 190, img: 'images/projects/nick-i.jpg',
          rules: { conds: { cap: { person: '2', bky: true } } }, rulesFix: true },
        { id: 'tier-kh-ga', name: 'General admission', price: 2100, hkd: 520, qty: 900, sold: 800, override: { USD: 65 }, img: 'images/projects/nick-lwh.jpg',
          rules: { conds: { cap: { person: '4', bky: true } } },
          rulesFix: true },
        /* D414 示範資料裁決（2026-10-14）：一場 bookyay 演唱會可以放多種門票（不改 D328 產品規則）。下面兩種是 bookyay 時段裡的其他票種，
           各有自己的購買條件（鎖定）：站席限購、座席限購＋早鳥。sold 由原本單人票的張數拆出，event.sold 不變、revenue 依三種票價重算。 */
        { id: 'tier-kh-floor', name: 'Standing zone', price: 3192, hkd: 790, qty: 400, sold: 380, img: 'images/projects/nick-asn.jpg',
          rules: { conds: { cap: { person: '2', bky: true } } }, rulesFix: true },
        { id: 'tier-kh-seat', name: 'Reserved seating', price: 1495, hkd: 370, qty: 300, sold: 220, img: 'images/projects/nick-wln.jpg',
          rules: { conds: { cap: { person: '4', bky: true } } },
          rulesFix: true }
      ],
      rules: { conds: {} },   // D417 決定一（2026-10-15）：bookyay 活動限購不帶入，活動層沒有條件
      bundles: [
        /* 墓碑 2026-10-16（D429）：自動建立的套票組合包 bd-kh-duo（賣出 190 組）刪除，銷量改記在門票 tier-kh-duo。 */
        { id: 'bd-kh-ga-tee', name: 'GA ＋ 巡演官方 Tee', tickets: { tierIds: ['tier-kh-ga'], qty: 1 },
          products: [{ name: 'REALIVE 白趴 官方 Tee', img: 'images/products/tee-black.webp', price: 600, pickup: { s: 'scheduled', nameKey: 'pk.row2.name' } }],
          disc: 10, price: 2430, sold: 90, cap: 120, override: { USD: 76 } }
      ],
      sold: 1590,   // D429：原 1,780（套票 1 人票 380 張 → 套票門票 190 張）；收入不變
      revenue: 3926820,
      status: 'ended',
      bkyCheckin: { received: true, count: 1488 },   // D429：原 1,688——售出張數降到 1,590 後，已報到改 1,488（不超過售出）
      images: { keyvisual: 'images/projects/nick-baipa.jpg', banner: '', gallery: ['images/projects/nick-realive.jpg'] },
      video: 'images/events/teaser-demo.mp4',
      publish: { pickup: 'eticket', shown: true },
      /* 2026-10-16 示範資料補齊（稽核 E9）：開賣方式＝立即開賣（from 留空＝上架即開賣，6/25 上架就開賣；原 7/1 12:00）。停售照舊。 */
      sale: { from: '', to: '2026-09-25 23:59' },
      listing: { from: '2026-06-25 12:00', to: '' }
    },
    {
      /* 已封存示範（D457）：原為 D375 決定二的「bookyay 取消同步成已取消」示範；bookyay 沒有取消活動，該規則整段退場，
         這一場改成已結束、已下架、已封存（封存後唯讀、離開主清單，只在「已封存」篩選看得到）。 */
      id: 'nick-summer-pingtung-bky',
      bkyId: 'bky-20',   /* D414：對應 js/sidebar.js BOOKYAY_EVENTS 的 bky-20（Admin 創作者活動管理，已發布） */
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      source: 'bookyay',
      bkyScanUrl: 'https://organizer.bookyay.com/scan/nick-summer-pingtung-bky',
      series: null,
      name: 'NICKTHEREAL Summer Live — Pingtung',
      highlight: 'Beachside, one night only',
      desc: '墾丁海邊的夏日場，日落開唱。',
      descBlocks: [
        { type: 'text', html: '<p>墾丁海邊的夏日場，日落開唱。</p>' }
      ],
      lineup: ['NICKTHEREAL 周湯豪', 'Kai Band 凱樂團'],   // D410 示範：表演陣容補第二組
      venue: '墾丁大灣沙灘',
      city: 'Pingtung, Taiwan',
      country: 'TW',
      languages: ['cmn'],
      meetPoint: '大灣遊客中心',
      transit: '墾丁快線大灣站步行 3 分鐘',
      address: '恆春鎮',
      date: '2026-08-29',
      endDate: '2026-08-30',   // D410 示範：跨日（海邊夜場 18:30 → 隔天 00:30）
      start: '18:30',
      end: '00:30',
      doors: '17:30',
      early: 'warn',
      terms: { tnc: { on: true, text: '戶外場地如遇天候因素，將依主辦單位公告調整。' } },
      tiers: [
        /* D410 示範（2026-10-13 驗收補缺）：兩張門票都補門票圖片；單人票補折扣與早鳥（bookyay 帶入、鎖定），
           單人票 sold 421 含經自建組合包賣出的 12 張（D408）。 */
        /* 二人套票（D429 示範資料）：一張普通門票 HK$400 → NT$1,615、張數照時段上限 200、賣出 30 張（＝原自動組合包 30 組）。 */
        { id: 'tier-pt-duo', name: 'Duo pass', price: 1615, hkd: 400, qty: 200, sold: 30, img: 'images/projects/nick-i.jpg',
          rules: { conds: { cap: { person: '2', bky: true } } }, rulesFix: true },
        { id: 'tier-pt-ga', name: 'General admission', price: 1615, hkd: 400, qty: 450, sold: 240, override: { USD: 50 }, img: 'images/projects/nick-lwh.jpg',
          rules: { conds: { cap: { person: '4', bky: true } } },
          rulesFix: true },
        /* D414 示範資料裁決（2026-10-14）：一場 bookyay 演唱會可以放多種門票（不改 D328 產品規則）。下面兩種是 bookyay 時段裡的其他票種，
           各有自己的購買條件（鎖定）：站席限購、座席限購＋早鳥。sold 由原本單人票的張數拆出，event.sold 不變、revenue 依三種票價重算。 */
        { id: 'tier-pt-floor', name: 'Standing zone', price: 2400, hkd: 595, qty: 150, sold: 100, img: 'images/projects/nick-asn.jpg',
          rules: { conds: { cap: { person: '2', bky: true } } }, rulesFix: true },
        { id: 'tier-pt-seat', name: 'Reserved seating', price: 1200, hkd: 297, qty: 200, sold: 81, img: 'images/projects/nick-wln.jpg',
          rules: { conds: { cap: { person: '4', bky: true } } },
          rulesFix: true }
      ],
      rules: { conds: {} },   // D417 決定一（2026-10-15）：bookyay 活動限購不帶入，活動層沒有條件
      bundles: [
        /* 墓碑 2026-10-16（D429）：自動建立的套票組合包 bd-pt-duo（取消前賣出 30 組）刪除，銷量改記在門票 tier-pt-duo。 */
        /* 創作者自建（D410 示範）：單人票＋電子商店商品（綁取貨場次），隨活動下架一併下架（D457：原「取消」連動改為下架） */
        { id: 'bd-pt-ga-tee', name: 'GA ＋ 巡演官方 Tee', tickets: { tierIds: ['tier-pt-ga'], qty: 1 },
          products: [{ name: 'REALIVE 白趴 官方 Tee', img: 'images/products/tee-black.webp', price: 600, pickup: { s: 'scheduled', nameKey: 'pk.row2.name' } }],
          disc: 10, price: 1994, sold: 12, cap: 100, listed: false, override: { USD: 62 } }
      ],
      sold: 451,   // D429：原 481（套票 1 人票 60 張 → 套票門票 30 張）
      revenue: 777798,   // D457：bookyay 沒有取消活動，原「取消後票券全撤銷、收入 0」退場；示範改為已結束＋已下架＋已封存，收入依四種票價與張數重算
      status: 'ended',
      unlisted: true,
      archived: true,   // D457 示範：已下架後封存（已結束的活動也要先下架才能封存）
      images: { keyvisual: 'images/projects/nick-smdbbs.jpg', banner: '', gallery: ['images/projects/nick-asn.jpg', 'images/projects/nick-wln.jpg'] },   // D410 示範：圖庫補兩張
      video: 'images/events/teaser-demo.mp4',   // D410 示範：影片預告
      publish: { pickup: 'eticket', shown: true },
      sale: { from: '2026-06-15 12:00', to: '2026-08-28 23:59' },
      listing: { from: '2026-06-10 12:00', to: '' }   // D410 示範：上架時間（D457：已下架＋已封存，見 unlisted／archived）
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
      languages: ['cmn'],
      address: '',
      date: '2027-02-01',
      start: '21:00',
      end: '',
      doors: '',
      /* 線上房間（2026-08-13，D149 落地）：共看派對不套票種頁與取票方式，但入場方式與
         付費門檻總得有個地方看。room.url＝觀眾進的房間、entry＝單一入場券的價格（同 tiers[0]，
         此處不另存一份金額）、chat＝是否開聊天室。實際房控功能仍待上游（見 ASSUMPTIONS WP-001）。 */
      room: { url: 'ztor.live/w/realive-r2-watchparty', chat: true, capacity: 200, capMode: 'limited',
              name: 'REALIVE R2 film night', film: 'film-last-typhoon', endEst: '2027-02-01 23:30',
              region: { mode: 'global', list: [] }, privacy: 'public' },   // D410 示範：F13–F19 補齊
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
      /* 2026-08-19 修正：原本 series 是 { name, index:3, total:6 }——缺 series.id（其他有系列的
         活動都靠 series.id 讓系列分頁撈出同系列場次，這筆沒有就撈不到），且宣稱「6 站巡演的
         第 3 站」，但全檔只有這一筆屬於這個系列，另外 5 站根本不存在。與全檔「series.total＝
         實際同系列筆數」的慣例（其餘 6 個系列 realive-asia／realive-sea／lrh-campus／sdfs-tour／
         realive-china-2027／realive-japan／realive-world-tour 皆滿足）牴觸。
         取捨：降為單場（series: null），不去新增另外 5 場沒人要求過的假活動去湊滿 6 站
         ——那會是憑空生資料。desc 順手微調，讀起來是一場獨立的 live house 專場，
         不再暗示「巡演的一站」。name 維持不動（events.html 既有列文字對齊，且「Live House Tour」
         在這裡讀作專有名稱／系列品牌字面，不是在宣稱這一筆本身有其他站）。 */
      series: null,
      name: 'LOVE·RAGE·HOPE Live House Tour — Taichung',
      desc: 'A one-off Live House night in Taichung, in the LOVE·RAGE·HOPE era.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Legacy Taichung',
      city: 'Taichung, Taiwan',
      country: 'TW',
      languages: ['cmn'],
      address: '',
      date: '2026-04-11',
      start: '20:00',
      end: '22:30',
      doors: '19:00',
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
      country: 'TW',
      languages: ['cmn'],
      address: '',
      date: '2025-05-23',
      start: '20:00',
      end: '22:45',
      doors: '18:30',
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
      tiers: [],
      sold: 0,
      revenue: 0,
      status: 'draft',
      images: { keyvisual: '', banner: '', gallery: [] },
      video: false
    },

    /* ══ 六個狀態 × 五個類型的完整矩陣（2026-08-17 使用者指示）══════════════════
       在此之前，可挑的組合有一半是空的：線上活動（virtual）全站一筆都沒有、已取消整個
       狀態沒有任何活動（D457：已取消階段退場，改以「已封存」旗標呈現）、進行中只有一場見面會。要看「售票中的多站巡演長什麼樣」可以，
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
      highlight: 'Encore: one unreleased song',   // D300 亮點示範
      desc: 'The catalogue rearranged for a full orchestra. One night, seated only.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Taipei Music Center',
      city: 'Taipei, Taiwan',
      country: 'TW',
      languages: ['cmn'],
      meetPoint: '表演廳 1 樓大廳',
      transit: '捷運昆陽站 4 號出口步行 10 分鐘',
      address: '',
      date: '2026-12-05',
      start: '19:30',
      end: '21:30',
      doors: '18:30',
      tiers: [
        /* hidden（D328 示範）：一樓票只透過下面的「一樓票 ＋ 交響夜場刊」組合包賣——活動頁票價清單不列、不能單張買，
           仍是組合包的票券成員、與組合包共用同一個數量池（5.1.6.1 F22「顯示」開關）。 */
        /* rules（2026-10-01 D342 示範；2026-10-07 D366 改成「新增條件」形狀 { conds }，舊形狀由 ticket-bundle.js 的 ruleConds 轉換）：單張門票的購買條件與限購，形狀同 create-event 的門票規則。
           兩張條件刻意不同，好示範票務商品「預設取最嚴」：一樓限超級粉絲以上、每人 4 張；
           二樓限時間 10/10 12:00–11/30 23:59（早於活動 10/15 開賣的預售，仍在上架區間內）、每人 6 張。
           D427（2026-10-16）：限購只留每人總限購，原示範的「每次 2 張」「限 3 次」移除。 */
        { id: 'tier-lower', name: 'Lower level', price: 2800, qty: 400, sold: 0, override: { JPY: 13900 }, hidden: true,   // JPY 換算 13,956 → 覆寫 13,900（D306）
          rules: { conds: { buyTier: { tier: 'superfan' }, cap: { person: '4' } } } },
        { id: 'tier-upper', name: 'Upper level', price: 1800, qty: 200, sold: 0,
          rules: { conds: { buyTime: { from: '2026-10-10T12:00', to: '2026-11-30T23:59' }, cap: { person: '6' } } } }
      ],
      /* 2026-09-21（D294 決定三示範）：已排程（發布、尚未開賣）的活動也掛一組組合包——
         電子商店 Bundles 清單要列它（活動已發布），細節頁的開賣設定則因活動未開賣而停用（只收窄不回寫）。 */
      bundles: [
        { id: 'bd-lower-program', name: '一樓票 ＋ 交響夜場刊', tickets: { tierIds: ['tier-lower'], qty: 1 },
          products: [{ name: 'NICK Symphonic Night 場刊', img: 'images/products/tour-zine-vol-02.webp', price: 400 }],
          price: 3200, sold: 0, cap: 100 },
        /* D342 示範（2026-10-01）：任選樓層的雙人組——允許票種兩種、每組 2 張；購買條件與限購預設取兩張門票最嚴
           （超級粉絲以上 · 10/15 12:00–11/30 23:59 · 每人 2 組；D427 起只剩每人總限購）；開賣另設 10/8 12:00＝組合包預售
           （早於活動 10/15 開賣、仍在上架區間 9/20 起之內）；上架、下架、停售跟隨活動。sched 的格子 null／缺＝跟隨。 */
        { id: 'bd-symph-pair', name: '雙人任選樓層 ＋ 場刊', tickets: { tierIds: ['tier-lower', 'tier-upper'], qty: 2 },
          products: [{ name: 'NICK Symphonic Night 場刊', img: 'images/products/tour-zine-vol-02.webp', price: 400 }],
          price: 4000, sold: 0, sched: { saleStart: '2026-10-08T12:00' } }
      ],
      publish: { pickup: 'eticket', shown: true },   // D327：電子門票附屬設定值已清
      sale: { from: '2026-10-15 12:00', to: '' },   // D340：原 onsale:'scheduled' 沒有時間，補上開賣時間
      /* 活動上架區間（D342 第一層，2026-10-01 示範欄位）：from＝上架日期與時間、to＝下架日期與時間（缺＝不自動下架）；
         整個 listing 缺席＝立刻上架（起點＝發布當下）。售票期間、門票限時間、票務商品的時間都要落在這裡面。 */
      listing: { from: '2026-09-20 12:00', to: '' },
      sold: 0,
      revenue: 0,
      /* 2026-10-09（D390 稽核第一節原型第 16 條）：組合包 bd-symph-pair 的預售 10/08 12:00 已開始＝任一票務商品開始能買，
         活動已進入售票中（D361 決定一），由已排程改成售票中（預售剛開始、還沒有成交，sold 維持 0）。ASSUMPTIONS UIA-210 關閉。 */
      status: 'on-sale',
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
      languages: ['en', 'cmn'],
      address: '',
      date: '2027-01-16',
      start: '20:00',
      end: '22:00',
      doors: '19:00',
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
      languages: ['en', 'cmn'],
      address: '',
      date: '2027-01-23',
      start: '20:00',
      end: '22:00',
      doors: '19:00',
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
      country: 'TW',
      languages: ['cmn'],
      address: '',
      date: '2026-11-08',
      start: '14:00',
      end: '16:00',
      doors: '13:30',
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
      languages: ['cmn'],
      address: '',
      date: '2026-11-20',
      start: '21:00',
      end: '23:00',
      doors: '',
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
      languages: ['cmn'],
      address: '',
      date: '2026-12-24',
      start: '21:00',
      end: '',
      doors: '',
      /* D410 示範：F13–F19 補齊；這一場示範「不限人數」（capMode unlimited，入場券張數＝平台單場硬上限 1,000）與「排除特定地區」 */
      room: { url: 'ztor.live/w/flames-mv-premiere', chat: true, capacity: null, capMode: 'unlimited',
              name: 'FLAMES premiere room', film: 'film-midnight-canton', endEst: '2026-12-24 22:30',
              region: { mode: 'exclude', list: ['CN'] }, privacy: 'public' },
      tiers: [
        { id: 'tier-entry', name: 'Admission', price: 150, qty: 1000, sold: 0 }
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
      country: 'TW',
      languages: ['cmn'],
      address: '',
      date: '2027-01-25',
      start: '19:00',
      end: '20:30',
      doors: '18:00',
      tiers: [
        { id: 'tier-front', name: 'Front block', price: 1200, qty: 1000, sold: 642 },
        { id: 'tier-rear', name: 'Rear block', price: 800, qty: 2000, sold: 1198 },
        /* D414 免費訂單示範（2026-10-14）：金額 0 的門票也算訂單——交易明細與訂單管理照常列出，付款資訊顯示「—」、不經金流。
           sold 36 張全是直接領取，所以活動 sold 加 36、revenue 不變。 */
        { id: 'tier-kids', name: 'Kids under 6 · free', price: 0, qty: 200, sold: 36 }
      ],
      bundles: [
        { id: 'bd-front-vinyl', name: '前區票 ＋ 限量黑膠', tickets: { tierIds: ['tier-front'], qty: 1 },
          products: [{ name: 'LOVE RAGE HOPE 限量黑膠 1/500', img: 'images/products/coastline-acetate.webp', price: 700 }],
          price: 1900, sold: 63, cap: 200 }
      ],
      publish: { pickup: 'eticket', shown: true },
      sold: 1876,
      revenue: 1772900,   // 2026-10-16 示範資料修正（UI-CHANGES 二百四十四）：含組合包整組金額（D408）＝門票 1,653,200＋組合包 63 × 1,900
      status: 'on-sale',
      sale: { from: '2026-09-20 12:00', to: '' },   // D414：補開賣時間——免費門票訂單的下單日期落在開賣日之後、不晚於昨天（沒寫時下單日期會落到未來）
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
      languages: ['cmn'],
      address: '',
      date: '2026-12-23',   // 2026-10-16 示範資料修正（UI-CHANGES 二百四十四）：原 09-20 已過、狀態卻是售票中
      start: '21:00',
      end: '22:30',
      doors: '',
      room: { url: 'ztor.live/v/lrh-studio-live', chat: true, capacity: 800 },
      tiers: [
        { id: 'tier-stream', name: 'Live stream', price: 350, qty: 700, sold: 402 },
        { id: 'tier-bts', name: 'Stream + behind the scenes', price: 650, qty: 100, sold: 71 }
      ],
      bundles: [
        { id: 'bd-stream-album', name: '直播票 ＋ 數位專輯', tickets: { tierIds: ['tier-stream'], qty: 1 },
          products: [{ name: 'LOVE RAGE HOPE — 數位專輯', img: 'images/products/nick-album.jpg', price: 170 }],
          price: 520, sold: 88, cap: 150 }
      ],
      publish: { pickup: 'eticket', shown: true },
      sold: 473,
      revenue: 201810,   // 2026-10-16 示範資料修正（UI-CHANGES 二百四十四）：含組合包整組金額（D408）＝門票 156,050＋組合包 88 × 520
      status: 'on-sale',
      unlisted: true,   // D361／D371 示範：已下架，仍留在售票中分頁、另掛「已下架」徽章；詳情頁可重新上架
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
      country: 'TW',
      languages: ['cmn'],
      address: '',
      date: todayStr(),          // 2026-08-19：live 活動的日期一律動態＝今天，見檔頭規則
      start: '19:30',
      end: '21:00',
      doors: '18:30',
      tiers: [
        { id: 'tier-infield', name: 'Infield', price: 1200, qty: 800, sold: 800 },
        { id: 'tier-outfield', name: 'Outfield', price: 900, qty: 400, sold: 372 }
      ],
      bundles: [
        /* 2026-09-21（D296 示範）：內野／外野任選 × 2 張——每組兩張同一票種；內野已售罄，只剩外野可選，整組仍可售（D296 決定四 a）。 */
        { id: 'bd-infield-tee', name: '內野／外野 任選 × 2 ＋ 官方 Tee', tickets: { tierIds: ['tier-infield', 'tier-outfield'], qty: 2 },
          products: [{ name: 'REALIVE 白趴 官方 Tee', img: 'images/products/tee-black.webp', price: 500 }],
          price: 2300, sold: 41, cap: 120 }
      ],
      sold: 1172,
      revenue: 1290700,   // 2026-10-16 示範資料修正（UI-CHANGES 二百四十四）：含組合包整組金額（D408）＝門票 1,196,400（內野經組合包的 82 張不重算）＋組合包 41 × 2,300
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
      country: 'TW',
      languages: ['cmn'],
      address: '',
      /* 2026-08-19：date 改用 todayStr()（見檔頭規則）。這站與 lrh-campus-nccu 是「同天雙場」
         設計（NTU 中午場、NCCU 傍晚場），兩筆都動態＝今天，兩站的日期依然相同、不會脫鉤。 */
      date: todayStr(),
      start: '12:20',
      end: '13:30',
      doors: '12:00',
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
      country: 'TW',
      languages: ['cmn'],
      address: '',
      date: todayStr(),          // 2026-08-19：同 lrh-campus-ntu，同天雙場、動態＝今天
      start: '18:30',
      end: '19:40',
      doors: '18:00',
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
      languages: ['cmn'],
      address: '',
      date: todayStr(),          // 2026-08-19：live 活動的日期一律動態＝今天，見檔頭規則
      start: '13:00',
      end: '15:00',
      doors: '',
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
      languages: ['cmn'],
      address: '',
      date: todayStr(),          // 2026-08-19：live 活動的日期一律動態＝今天，見檔頭規則
      start: '13:30',
      end: '',
      doors: '',
      room: { url: 'ztor.live/w/lrh-doc', chat: true, capacity: 600, capMode: 'limited',
              name: 'Tour doc — director in chat', film: 'film-silk-echo', endEst: '',
              region: { mode: 'include', list: ['TW', 'HK', 'SG', 'MY'] }, privacy: 'private' },   // D410 示範：F13–F19 補齊（私密房間）
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
      country: 'TW',
      languages: ['cmn'],
      address: '',
      date: '2026-03-14',
      start: '20:00',
      end: '22:00',
      doors: '19:00',
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
      languages: ['cmn'],
      address: '',
      date: '2026-03-21',
      start: '20:00',
      end: '22:00',
      doors: '19:00',
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
      country: 'TW',
      languages: ['cmn'],
      address: '',
      date: '2026-05-10',
      start: '14:00',
      end: '16:00',
      doors: '13:30',
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
      languages: ['cmn'],
      address: '',
      date: '2026-06-20',
      start: '21:00',
      end: '23:00',
      doors: '',
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
      languages: ['cmn'],
      address: '',
      date: '2026-02-14',
      start: '21:00',
      end: '',
      doors: '',
      room: { url: 'ztor.live/w/sdfs-mv-watchback', chat: true, capacity: 400, capMode: 'limited',
              name: 'Ten years on', film: 'film-fist-of-fury', endEst: '2026-02-14 23:00',
              region: { mode: 'global', list: [] }, privacy: 'public' },   // D410 示範：F13–F19 補齊
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
      desc: 'Lakeside stage at Liyu Lake. Taken down after the show and archived.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Liyu Lake',
      city: 'Hualien, Taiwan',
      country: 'TW',
      languages: ['cmn'],
      address: '',
      date: '2026-08-30',
      start: '18:00',
      end: '21:00',
      doors: '17:00',
      tiers: [
        { id: 'tier-ga', name: 'General admission', price: 1000, qty: 1500, sold: 892 }
      ],
      sold: 892,
      revenue: 892000,
      status: 'ended',
      unlisted: true,
      archived: true,   // D457 示範：已下架後封存
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
      desc: 'Two added China dates. Taken down and archived while the venue is reconsidered.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Strait Culture and Art Centre',
      city: 'Fuzhou, China',
      languages: ['cmn'],
      address: '',
      date: '2026-11-14',
      start: '19:30',
      end: '21:30',
      doors: '18:30',
      tiers: [
        { id: 'tier-ga', name: 'General admission', price: 1100, qty: 700, sold: 421 }
      ],
      sold: 421,
      revenue: 463100,
      status: 'on-sale',
      unlisted: true,
      archived: true,   // D457 示範：已下架後封存
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
      desc: 'Two added China dates. Taken down and archived while the venue is reconsidered.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'CH8 Livehouse',
      city: 'Hangzhou, China',
      languages: ['cmn'],
      address: '',
      date: '2026-11-21',
      start: '19:30',
      end: '21:30',
      doors: '18:30',
      tiers: [
        { id: 'tier-ga', name: 'General admission', price: 1100, qty: 700, sold: 318 }
      ],
      sold: 318,
      revenue: 349800,
      status: 'on-sale',
      unlisted: true,
      archived: true,   // D457 示範：已下架後封存
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
      desc: 'A pop-up meet at Shibuya Loft. Taken down and archived after the date passed.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Shibuya Loft',
      city: 'Tokyo, Japan',
      country: 'JP',
      languages: ['ja'],
      address: '',
      date: '2026-10-12',
      start: '18:00',
      end: '20:00',
      doors: '17:30',
      tiers: [
        { id: 'tier-slot', name: 'Meet slot', price: 900, qty: 100, sold: 74 }
      ],
      sold: 74,
      revenue: 66600,
      status: 'ended',
      unlisted: true,
      archived: true,   // D457 示範：已下架後封存
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
      desc: 'A progress briefing for backers. Taken down once folded into the next project update.',
      lineup: ['NICKTHEREAL 周湯豪'],
      venue: 'Online',
      city: '',
      languages: ['cmn'],
      address: '',
      date: '2026-09-05',
      start: '21:00',
      end: '22:00',
      doors: '',
      room: { url: 'ztor.live/v/lrh-backers-briefing', chat: true, capacity: 600 },
      tiers: [
        { id: 'tier-stream', name: 'Live stream', price: 200, qty: 600, sold: 233 }
      ],
      sold: 233,
      revenue: 46600,
      status: 'ended',
      unlisted: true,
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
      desc: 'Watching the R2 rehearsal footage together. Taken down with the tour date.',
      lineup: [],
      venue: 'Online',
      city: '',
      languages: ['cmn'],
      address: '',
      date: '2026-09-19',
      start: '21:00',
      end: '',
      doors: '',
      room: { url: 'ztor.live/w/r2-rehearsal', chat: true, capacity: 300, capMode: 'limited',
              name: 'R2 rehearsal room', film: 'film-zheng-yi-sao', endEst: '2026-09-19 23:00',
              region: { mode: 'exclude', list: ['CN', 'RU'] }, privacy: 'private' },   // D410 示範：F13–F19 補齊
      tiers: [
        { id: 'tier-entry', name: 'Admission', price: 120, qty: 300, sold: 96 }
      ],
      sold: 96,
      revenue: 11520,
      status: 'ended',
      unlisted: true,
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
      /* 2026-09-21（D294 決定二示範）：草稿活動也可以先設票種並把票種加進組合包——這一組同為草稿、
         跟著活動；活動發布前不出現在電子商店 Bundles 清單（含 Draft 篩選），細節頁整張上架卡顯示草稿態「隨活動發布」。
         票種是草稿存到一半的值（qty 已填、尚未賣出），續填草稿時會預填進建立流程。 */
      tiers: [
        { id: 'tier-encore-ga', name: 'General admission', price: 2200, qty: 800, sold: 0 }
      ],
      bundles: [
        { id: 'bd-encore-tee', name: '加場票 ＋ 官方 Tee', tickets: { tierIds: ['tier-encore-ga'], qty: 1 },
          products: [{ name: 'REALIVE 白趴 官方 Tee', img: 'images/products/tee-black.webp', price: 600 }],
          price: 2800, sold: 0, cap: 100 }
      ],
      sold: 0,
      revenue: 0,
      status: 'draft',
      images: { keyvisual: 'images/projects/nick-lwh.jpg', banner: '', gallery: [] },
      video: false
    },
    {
      /* bookyay 帶入後存成草稿的活動（2026-09-29 D331 決定四示範）。D429（2026-10-16）起：二人套票帶入後就是一張普通門票，
         沒有自動組合包；活動清單草稿列按「刪除」時，確認彈窗列出「一併刪除的組合包」＝創作者自建、含本草稿票券的那一組
         （D340 決定四；組合商品細節頁 `bundle-detail.html?id=bd-khh-duo-tee&ev=khh-countdown-draft` 刪除後變成查無資料）。
         墓碑：原本示範的是隱藏鎖定的 1 人票＋自動組合包 bd-khh-duo 隨活動一起刪除。
         金額口徑同 taipei-nye（D330）：hkd＝bookyay 港幣原價、price＝換算成創作者幣別 TWD 的基準價。 */
      id: 'khh-countdown-draft',
      bkyId: 'bky-12',   /* D374：對應到 js/sidebar.js BOOKYAY_EVENTS 的 bky-12（創作者活動管理那一列）；刪這份草稿＝解除對應 */
      /* 2026-10-13 D410 決定四（示範資料）：「草稿」狀態的 bookyay 演唱會全選項示範（原本是 festival）。
         續填時建立流程用 create-event BKY 的 bky-12 重跑帶入（D385 決定四），鎖定欄位一律以那份為準——這裡的鎖定欄位值與它對齊；
         亮點、表演陣容、圖片、上架方式、門票圖片、自建組合包等不鎖的欄位照這裡保留（D386 決定二，keepDraft）。
         票：bky-12 只有一個時段，release2.4 照 D328 只帶第一種門票（二人套票），第二種（General admission）帶入時略過並出現提示——
         所以草稿只有一張二人套票門票（D429：票價照 bookyay 現價、張數照時段上限 200、本門票限購每人 2 張落在這張票；D417 起折扣與早鳥不帶入）。 */
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      source: 'bookyay',
      bkyScanUrl: 'https://organizer.bookyay.com/scan/bky-12',
      series: null,
      name: 'Kaohsiung countdown concert',
      highlight: 'Harbour fireworks right after midnight',
      desc: '駁二港邊的跨年演唱會，21:00 開唱一路唱過零點，倒數後港邊煙火。',
      descBlocks: [
        { type: 'text', html: '<p>駁二港邊的跨年演唱會，21:00 開唱一路唱過零點，倒數後港邊煙火。</p>' },
        { type: 'image', src: 'images/projects/nick-asn.jpg' },
        /* 2026-10-16 示範資料補齊（稽核 E11）：編號清單＋分隔線（S59 其餘兩種格式）；與 create-event BKY bky-12 的 intros 第 2 段同一份（帶入鎖定） */
        { type: 'text', html: '<p><strong>入場與寄物</strong></p><ol><li>大義倉庫入口驗票，二人套票兩人須一起驗票入場</li><li>現場不提供寄物</li></ol><hr><p>大型背包請改放捷運鹽埕埔站置物櫃。</p>' },
        { type: 'text', html: '<p><strong>散場交通</strong></p><p>零點後輕軌加開班次至 01:30，<em>駁二大義站單向進站</em>。詳見 <a href="https://example.com/khh-countdown/traffic">交通說明</a>。</p>' }
      ],
      lineup: ['NICKTHEREAL 周湯豪', 'Kai Band 凱樂團'],
      venue: 'Kaohsiung Pier-2',
      city: 'Kaohsiung, Taiwan',
      country: 'TW',
      languages: ['cmn', 'en'],
      meetPoint: '駁二大義倉庫入口',
      transit: '輕軌駁二大義站步行 2 分鐘',
      address: '鹽埕區',   // 2026-10-09 D385：對齊 create-event BKY bky-12 的地區（帶入後鎖定）
      date: '2026-12-31',
      endDate: '2027-01-01',   // 跨日（bookyay 時段 12/31 21:00 → 1/1 00:30）
      start: '21:00',
      end: '00:30',
      doors: '20:00',          // bookyay 過早入場提示 60 分鐘 → 提前入場時間開啟（D396）
      early: 'block',
      terms: {
        tnc: { on: true, text: '二人套票限兩人同行，須一起驗票入場；單人持票恕不入場。\n票券一經售出，除活動取消或延期外，恕不退換。\n戶外場地如遇天候因素，將依主辦單位公告調整演出內容。' }
      },
      tiers: [
        /* D390（稽核第一節原型第 13 條）示範：草稿裡存過的門票圖片（不在鎖定範圍）——續填重跑帶入後照樣留著 */
        { id: 'tier-khh-duo', name: 'Duo pass', price: 2221, hkd: 550, qty: 200, sold: 0, img: 'images/projects/nick-i.jpg',
          rules: { conds: { cap: { person: '2', bky: true } } }, rulesFix: true }   // D429：原 1 人票 HK$275（隱藏鎖定 hideFix）
      ],
      /* 墓碑 2026-10-15（D417 決定一）：活動層限購（bookyay maxPurchaseCnt 6／EachTime 4／Time 2）不帶入，活動層沒有條件 */
      rules: { conds: {} },
      /* D390（稽核第一節原型第 13 條）示範：草稿裡存過、不在 bookyay 鎖定範圍的發布設定——續填時保留（create-event keepDraft）。
         墓碑 2026-10-12（D395）：原本一併示範的直接促銷同意（terms.marketing）隨欄位移除。 */
      listing: { mode: 'schedule', from: '2026-11-10 12:00', to: '2027-01-01 12:00' },
      bundles: [
        /* 墓碑 2026-10-16（D429）：自動建立的組合包 bd-khh-duo（1 人票 × 2、鎖定 100 套、整組鎖定 fix、套票限購落在這一組）刪除。 */
        /* D340 示範：創作者自己建立、成員含本草稿活動票券的草稿組合包——草稿活動刪除時同樣一起刪除，確認彈窗列出（5.1.6 F1）。
           D410 示範：商品成員綁取貨場次（前往領取場次）。D429：成員由「1 人票 × 2」改成「二人套票門票 × 1」；售價＝NT$2,221 ＋ NT$600＝NT$2,821（原 NT$2,822，差 1 是 1 人票換算取整的殘差）。 */
        { id: 'bd-khh-duo-tee', name: 'Duo pass ＋ 紀念 T 恤', tickets: { tierIds: ['tier-khh-duo'], qty: 1 },
          products: [{ name: '九龍夜行 紀念 T 恤', img: 'images/products/coastline-tee.webp', price: 600, pickup: { s: 'scheduled', nameKey: 'pk.row2.name' } }],
          price: 2821, sold: 0, override: { USD: 90 },
          /* 2026-10-16 示範資料補齊（稽核 E5、E7；不是產品規則）：草稿裡存過、不在 bookyay 鎖定範圍的組合包欄位——續填時照樣保留（D386 決定二）。
             · films：電影關聯（S97，建立活動第 6 步票務商品）。
             · sched.saleStart：開賣另設 11/12 12:00，早於活動正式開賣 11/15、在上架 11/10 之後——第 7 步「其他售票時間」摘要（S83）列出這一組。 */
          films: ['film-neon-harbor'],
          sched: { saleStart: '2026-11-12T12:00' } }
      ],
      sold: 0,
      revenue: 0,
      status: 'draft',
      /* D386 決定二示範：草稿裡創作者自己加的第二張圖（不在鎖定範圍）——續填重跑帶入後照樣留著，不被 bookyay 的圖覆蓋。 */
      images: { keyvisual: 'images/hero-event.jpg', banner: '', gallery: ['images/projects/nick-i.jpg', 'images/projects/nick-asn.jpg'] },
      video: 'images/events/teaser-demo.mp4',
      publish: { pickup: 'eticket', shown: true },
      sale: { from: '2026-11-15 12:00', to: '2026-12-31 18:00' }
    },
    {
      /* bky-2 的創作者端草稿（2026-10-09 D390 稽核第一節原型第 16 條）：Admin 創作者活動管理裡 bky-2 是「草稿」（已對應 Gary Lin、已存），
         創作者端活動清單原本卻沒有這份草稿——同一筆兩個答案。補上：bookyay 帶入、二人套票門票（D429 起不拆 1 人票、沒有自動組合包）。
         D440（2026-10-16）：bookyay 三個時段帶入合成同一場（日期與時間取第一個時段，D440 定案），每個時段的那一種門票各成一張、張數＝各自時段上限 151／200／200；
         同一種門票出現在三個時段，票名後補「· 時段 N」區分〔推導，ASSUMPTIONS UIA-271〕。一場＝release2.4 照常列出。
         墓碑 2026-10-16（D440）：原本三場（Day 1～3，多場次 S87，release2.4 收起）、一張二人套票張數＝三個時段合計 551。
         金額口徑同 khh-countdown-draft：hkd＝bookyay 港幣原價（二人套票 HK$399）、price＝換算成 TWD 的基準價。 */
      id: 'mirror-khh-draft',
      bkyId: 'bky-2',
      /* 2026-10-13 D410 決定四（示範資料）：見面會改成演唱會（release2.4 只開放演唱會） */
      type: 'concert',
      typeLabelKey: 'ce.type.concert',
      category: 'concert',
      source: 'bookyay',
      series: null,
      name: 'MIRROR LIVE 2026 高雄',
      desc: '三天三場的演唱會，每一場都有各自的主題歌單與抽選互動；購票即參加抽選，中選者上台合影。',
      lineup: [],
      venue: '高雄流行音樂中心',
      city: '',
      country: 'TW',
      languages: ['yue', 'cmn'],
      meetPoint: '海音館 1 樓大廳',
      transit: '輕軌真愛碼頭站步行 5 分鐘',
      address: '鹽埕區',
      date: '2026-10-02',
      start: '19:00',
      end: '21:30',
      doors: '18:00',
      sessions: [
        { id: 's1', name: '', date: '2026-10-02', start: '19:00', end: '21:30', doors: '18:00', doorsMin: '60', early: 'block' }
      ],
      tiers: [
        { id: 'tier-mirror-duo-1', name: '二人套票 · 時段 1', price: 1611, hkd: 399, qty: 151, sold: 0 },
        { id: 'tier-mirror-duo-2', name: '二人套票 · 時段 2', price: 1611, hkd: 399, qty: 200, sold: 0 },
        { id: 'tier-mirror-duo-3', name: '二人套票 · 時段 3', price: 1611, hkd: 399, qty: 200, sold: 0 }
      ],
      bundles: [],   // 墓碑 2026-10-16（D429）：自動組合包 bd-mirror-duo 刪除
      sold: 0,
      revenue: 0,
      status: 'draft',
      images: { keyvisual: 'images/ip/a-lin.webp', banner: '', gallery: [] },
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
      /* 2026-10-13 D410 決定四（示範資料）：草稿狀態的共看派對，F13–F19 七項全填（建立流程續填時由 dupFrom 讀回 room）。
         清單與草稿名稱沿用原本的「(planning)」；房間名稱另存 room.name。 */
      name: 'ON STAGE concert film — Watch party (planning)',
      desc: '',
      lineup: [],
      venue: 'Online',
      city: '',
      languages: ['cmn'],
      address: '',
      date: '2027-03-06',
      start: '20:00',
      end: '',
      doors: '',
      room: { url: 'ztor.live/w/onstage-film-watchparty-draft', chat: true, capacity: 250, capMode: 'limited',
              name: 'ON STAGE concert film — Watch party', film: 'film-neon-harbor', endEst: '2027-03-06 22:30',
              region: { mode: 'include', list: ['TW', 'HK'] }, privacy: 'private' },
      tiers: [{ id: 'tier-entry', name: 'Admission', price: 180, qty: 250, sold: 0 }],
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
      return { name: t.name, solo: !!t.standalone, left: t.sold || 0, tot: (t.sold || 0) || 1 };
    });
    return function () {
      var best = null;
      for (var k = 0; k < pool.length; k++) {
        if (pool[k].left > 0 && (!best || pool[k].left / pool[k].tot > best.left / best.tot)) best = pool[k];
      }
      if (!best) return { name: '', solo: false };
      best.left--;
      return { name: best.name, solo: best.solo };   // D390 決定二十七：名單上獨立票顯示票名＋「獨立票」標籤
    };
  }

  function buildRoster(ev) {
    var n = ev.sold || 0, arrived = ev.arrivedAtOpen || 0, out = [];
    /* D408：經組合包拿到門票的買家照常進名單，另標購買來源（viaBundle＝組合包名稱）；每個門票分到的組合包張數見 bundleSoldOfTier() */
    var viaLeft = {};
    ((ev && ev.bundles) || []).forEach(function (b) {
      var tk = bundleTickets(b), t = null;
      (ev.tiers || []).forEach(function (x) { if (x.id === tk.tierIds[0]) t = x; });
      if (t) (viaLeft[t.name] = viaLeft[t.name] || []).push({ name: b.name, left: (Number(b.sold) || 0) * (tk.qty || 1) });
    });
    var pickTier = tierPicker(ev);
    var times = arrivalTimes(ev, arrived);
    for (var i = 0; i < n; i++) {
      var g = GIVEN[i % GIVEN.length];
      var f = FAMILY[(i * 7 + 3) % FAMILY.length];
      var pk = pickTier();
      out.push({
        seq: i + 1,
        name: g + ' ' + f,
        tier: pk.name,
        solo: pk.solo,
        viaBundle: (function () {
          var q = (viaLeft[pk.name] || []).filter(function (v) { return v.left > 0; })[0];
          var nth = viaLeft['#' + pk.name] = (viaLeft['#' + pk.name] || 0) + 1;
          if (!q || (nth % 3) !== 2) return '';        // 同一張門票每 3 位標 1 位，散在名單裡、不全擠在前面
          q.left--; return q.name;
        })(),
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
         因此作廢筆是「額外」的交易（作廢的票已回到庫存、不在 sold 裡），不影響加總。
       · 買家名字取自 roster 同一個名單池：名單與交易是同一場活動的兩個視角，不是兩套虛構。
       · 2026-09-09（D253）：平台不提供退款動作，票券的取消一律由手動作廢執行。原本這裡
         固定產生 2 筆 status:'refunded' 的示例交易，只是把「退款」換成「作廢」的資料語意——
         demo 筆改成 status:'voided'，並補上 voidedAt／voidedBy 兩欄供作廢紀錄（§2.9.2）顯示；
         使用者透過 UI 執行的作廢（voidTicket／voidAllRemaining）也寫這兩欄，同一套欄位。 */
  /* ── 訂單編號與付款資訊（2026-10-13 · D411）────────────────────
     交易明細的每一列＝一筆訂單，要能打開電子商店的訂單詳情（直接購票的訂單共用同一頁）。
     訂單編號＝'ZT-' ＋ 活動在 EVENTS 的序號（100 起）＋ 4 碼流水：門票訂單 0000 起、組合包訂單 5000 起、
     作廢示範 9000 起；orders-store 的 get() 用 findOrder() 反查回「哪一場活動的哪一筆交易」。
     下單日期在開賣起日到活動前一天（不晚於今天）之間決定性散開，
     付款時間＝下單日期＋ atMin 的時刻；金流商一律 Stripe（D411 範例），付款編號為示意字串（原型、非真實）。 */
  function evIndex(ev) {
    for (var i = 0; i < EVENTS.length; i++) if (EVENTS[i].id === (ev && ev.id)) return i;
    return -1;
  }
  function orderNo(ev, n) {
    var i = evIndex(ev);
    return i < 0 ? '' : 'ZT-' + (100 + i) + ('000' + n).slice(-4);
  }
  function txDays(ev) {
    var from = String((ev.sale && ev.sale.from) || '').slice(0, 10) || addDays(ev.date || todayStr(), -45);
    var to = addDays(ev.date || todayStr(), -1);
    if (to >= todayStr()) to = addDays(todayStr(), -1);   // 下單日期最晚到昨天，付款時間不會落在「今天稍後」
    if (to < from) to = from;
    var span = Math.round((new Date(to + 'T00:00:00') - new Date(from + 'T00:00:00')) / 86400000);
    return { from: from, span: Math.max(0, span) };
  }
  function payFields(ev, n, atMin) {
    var w = txDays(ev);
    var day = addDays(w.from, w.span ? (n * 7) % (w.span + 1) : 0);
    var hh = String(Math.floor((atMin || 0) / 60) % 24).padStart(2, '0'), mm = String((atMin || 0) % 60).padStart(2, '0');
    var seed = ((evIndex(ev) + 3) * 2654435761 + (n + 1) * 40503 * 97) % 2821109907456;   // 36^8，示意字串用
    return {
      orderId: orderNo(ev, n), orderDate: day, paidAt: day + ' ' + hh + ':' + mm,
      provider: 'Stripe', paymentId: 'pi_3Q' + ('0000000' + seed.toString(36)).slice(-8) + String(n % 100).padStart(2, '0') + 'Zt'
    };
  }
  function withPay(t, f) {
    for (var k in f) t[k] = f[k];
    /* D414：金額 0 的免費訂單不經金流——訂單編號與下單日期照給，付款時間、金流商、付款編號、付款方式留空（畫面顯示「—」） */
    if (t.gross === 0) { t.paidAt = ''; t.provider = ''; t.paymentId = ''; t.method = '—'; }
    return t;
  }

  function buildTx(ev) {
    var out = [], seq = 0, day = ev.date || '2026-01-01';
    (ev.tiers || []).forEach(function (t, ti) {
      var left = Math.max(0, (t.sold || 0) - bundleSoldOfTier(ev, t.id));   // D408：經組合包賣出的票走組合包訂單，不重複算
      while (left > 0) {
        var qty = (seq % 3 === 0 && left >= 2) ? 2 : 1;      // 每三筆有一筆是兩張
        if (qty > left) qty = left;
        var gross = effAmount(priceOf(ev, t)) * qty;   // D331：收入用粉絲實付價（基準欄覆寫優先）
        var fee = Math.round(gross * 0.10);
        var atMin = (10 * 60 + (seq * 37) % 720);
        out.push(withPay({
          id: 'TX-' + String(10240 + seq * 7).slice(-5),
          buyer: GIVEN[(seq * 3) % GIVEN.length] + ' ' + FAMILY[(seq * 5 + ti) % FAMILY.length],
          tier: t.name, tierId: t.id, solo: !!t.solo, qty: qty, gross: gross, ticketGross: gross, fee: fee, net: gross - fee,
          method: ['Card', 'Apple Pay', 'LINE Pay'][seq % 3],
          status: 'paid',
          at: day, atMin: atMin        // 顯示用；原型不接真實時鐘
        }, payFields(ev, seq, atMin)));   // D411：訂單編號、下單日期、付款時間、金流商、付款編號
        left -= qty; seq++;
      }
    });
    /* 作廢筆（2026-09-09 由「退款筆」改寫，D253）：額外附加，不列入已結算加總
       （作廢的票不在 sold 裡）。每場固定兩筆，金額取第一個票種單價，讓「作廢」在
       明細與作廢紀錄分頁都有東西可看。voidedAt／voidedBy 供 §2.9.2 作廢紀錄顯示
       ——執行者上游未定義（〔產品待確認〕，見 decisions.md D253），示例資料暫依
       decisions.md 記載的過渡預設「比照 eShop 以 Admin 專屬處理」填 'Admin'，
       不代表已裁決創作者不可執行。 */
    var t0 = (ev.tiers || [])[0];
    if (t0 && (ev.sold || 0) > 4) {
      for (var k = 0; k < 2; k++) {
        var g = effAmount(priceOf(ev, t0));   // D331：同上
        out.push(withPay({
          id: 'TX-' + String(90100 + k * 11).slice(-5),
          buyer: GIVEN[(k * 11) % GIVEN.length] + ' ' + FAMILY[(k * 9) % FAMILY.length],
          tier: t0.name, tierId: t0.id, solo: !!t0.solo, qty: 1, gross: g, fee: Math.round(g * 0.10), net: g - Math.round(g * 0.10),
          method: 'Card', status: 'voided', at: day, atMin: 9 * 60 + k * 25,
          voidedAt: day + ' ' + (14 + k) + ':00', voidedBy: 'Admin'
        }, payFields(ev, 9000 + k, 9 * 60 + k * 25)));
        /* 撤銷原因（2026-10-16 示範資料補齊，D431：選填、只記在撤銷紀錄給 Admin 查）：每場第一筆有原因、第二筆沒填（畫面「—」）。
           bookyay 活動的直接購票由 bookyay 撤銷、同步回來（D375、D434），ztor 收不到原因，不編造。 */
        if (k === 0 && ev.source !== 'bookyay') out[out.length - 1].voidReason = '買家來信申請取消';
      }
    }
    return out;
  }

  /* 組合包訂單（2026-10-13 · D407）：活動詳情的交易明細也列「含這場活動門票的組合包」訂單。
     另起一支、不併進 buildTx()——撤銷全部與撤銷紀錄只處理門票（組合包到訂單詳情撤銷）；
     D408 起收入、持票人數與購票通知由各消費端自己合併兩支（event-detail 的 edRevTotals()、本檔 holdersOf()）。
     產生規則同 buildTx：決定性、每 1–2 組一筆；金額＝組合售價 × 組數〔推導〕；kind:'bundle' 供頁面分流。 */
  /* D408（2026-10-13）：門票的 sold 含經組合包賣出的票（5.1.6.3 §2.6「隱藏的票照常作為組合包成員售出並計入售出進度」）。
     示範口徑：每組扣允許清單第一張門票 × 每組張數〔推導〕。直接買票的訂單、名單的購買來源都靠它拆。 */
  function bundleSoldOfTier(ev, tierId) {
    return ((ev && ev.bundles) || []).reduce(function (n, b) {
      var tk = bundleTickets(b);
      return n + (tk.tierIds[0] === tierId ? (Number(b.sold) || 0) * (tk.qty || 1) : 0);
    }, 0);
  }
  /* D408：組合包金額裡屬於門票的部分〔推導〕＝組合售價 × 門票原價 ÷ 成員原價合計（門票取允許清單第一張）。 */
  function bundleTicketShare(ev, b) {
    var tk = bundleTickets(b), t = null;
    ((ev && ev.tiers) || []).forEach(function (x) { if (x.id === tk.tierIds[0]) t = x; });
    var tix = t ? effAmount(priceOf(ev, t)) * (tk.qty || 1) : 0;
    var goods = (b.products || []).reduce(function (n, p) { return n + (Number(p.price) || 0) * (Number(p.qty) || 1); }, 0);
    return tix + goods > 0 ? tix / (tix + goods) : 1;
  }
  function buildBundleTx(ev) {
    var out = [], seq = 0, day = ev.date || '2026-01-01';
    (ev.bundles || []).forEach(function (b, bi) {
      if (!bundleTickets(b).tierIds.length) return;
      var left = Number(b.sold) || 0, share = bundleTicketShare(ev, b);
      while (left > 0) {
        var qty = (seq % 4 === 1 && left >= 2) ? 2 : 1;
        var gross = (Number(b.price) || 0) * qty;
        var fee = Math.round(gross * 0.10);
        var atMin = (10 * 60 + (seq * 151 + 700) % 720);
        /* D411（2026-10-13）：每一筆組合包訂單有自己的訂單編號（原本一律連到 ZT-10489，UIA-250 已解）。bundleId 給訂單詳情展開成員用。 */
        out.push(withPay({
          id: 'TX-B' + String(3100 + seq * 13).slice(-4), kind: 'bundle', bundleId: b.id,
          buyer: GIVEN[(seq * 7 + 2) % GIVEN.length] + ' ' + FAMILY[(seq * 3 + bi) % FAMILY.length],
          tier: b.name, qty: qty, tickets: qty * (bundleTickets(b).qty || 1), ticketGross: Math.round(gross * share), gross: gross, fee: fee, net: gross - fee,
          method: ['Apple Pay', 'Card', 'LINE Pay'][seq % 3],
          status: 'paid', at: day, atMin: atMin
        }, payFields(ev, 5000 + seq, atMin)));
        left -= qty; seq++;
      }
    });
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

  /* ── 已下架（2026-10-07 · D361 決定五）──────────────────────────────
     上架／下架是階段以外的另一個維度：已下架的活動留在原本的階段（status 不動），另掛 `unlisted: true`，
     清單列與詳情頁首各多一顆「已下架」徽章。2026-10-08（D371 決定一）起創作者本人與 Admin 都能下架與重新上架
     （詳情頁設定分頁），寫進 localStorage `ztor.event-unlisted`（同階段覆寫的做法），`get()`／`list()` 讀出來時套用；
     mock 也可直接帶 `unlisted: true`。覆寫表存 true／false 兩值：重新上架要能蓋過 mock 寫死的 `unlisted: true`。 */
  var UNLIST_KEY = 'ztor.event-unlisted';
  function unlistMap() {
    try { return JSON.parse(localStorage.getItem(UNLIST_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function applyUnlist(ev) {
    var u = unlistMap();
    if (ev && Object.prototype.hasOwnProperty.call(u, ev.id)) ev.unlisted = !!u[ev.id];
    return applyArchive(ev);
  }

  /* ── 已封存（2026-10-20 · D457，比照商品封存 D284／D298）──────────────────────
     封存＝階段以外的另一個維度（同已下架）：只有已下架的活動能封存（已結束也要先下架），封存後整頁唯讀、離開主清單，
     只有「解除封存」一個動作，解除後回到已下架、不自動上架。活動的 `archived: true`（mock 可直接帶）；
     詳情頁與清單列的封存／解除封存寫進 localStorage `ztor.event-archived`（同下架的做法，存 true／false 兩值）。
     封存必然下架（archived 時 unlisted 一律為 true）；封存時一併取消尚未生效的上架排程（listing.from 清空）。 */
  var ARCHIVE_KEY = 'ztor.event-archived';
  function archiveMap() {
    try { return JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function applyArchive(ev) {
    var a = archiveMap();
    if (ev && Object.prototype.hasOwnProperty.call(a, ev.id)) ev.archived = !!a[ev.id];
    if (ev) { ev.archived = !!ev.archived; if (ev.archived) ev.unlisted = true; }
    return ev;
  }

  /* 完售（D375 決定七）：所有門票與票務商品都賣完。票務商品吃門票的庫存（賣一組扣它含的票），門票張數合計（含隱藏）賣光
     ＝票務商品也買不到，所以以門票合計判定（同 event-detail 系列卡既有口徑）。完售不是階段（D361 決定七），草稿不掛。 */
  function isSoldOut(ev) {
    if (!ev || ['draft'].indexOf(ev.status) >= 0) return false;
    var q = (ev.tiers || []).reduce(function (a, t) { return a + (Number(t.qty) || 0); }, 0);
    if (q > 0 && (Number(ev.sold) || 0) >= q) return true;
    /* D447 決定六〔推導〕：營運把庫存設為 0 也算賣完——每張門票庫存 0，且每個票務商品可售套數 0 或沒有票務商品 */
    var tiers = ev.tiers || [];
    if (!(q > 0) || !tiers.every(function (t) { return tierStock(ev, t) <= 0; })) return false;
    return (ev.bundles || []).every(function (b) { return !bundleTickets(b).tierIds.length || bundleLeft(ev, b) === 0; });
  }

  /* ── 庫存設為 0（D447，2026-10-19）──────────────────────────────────────────
     門票的庫存＝還能賣的張數＝張數 − 已售 − 保留 − 其他組合包已鎖定張數（算法沿用 D446：組合包鎖的張數＝鎖定套數 × 每套張數，
     先由它自己獨有的門票吸收，吸收不了的才壓在這張門票上；bundle-detail 的 otherTixLocks、bundle-editor 的 otherTixTaken 同口徑）。
     「庫存設為 0」＝把張數改成剛好等於已售＋保留＋已鎖定（tierZeroQty），之後不能再單獨買；調高張數就恢復販售。
     組合包的「庫存設為 0」＝切成限量（cap）並把總量收到已售，剩餘 0；不新增欄位（最終版，使用者改裁決併入既有限量）。 */
  function tierLocked(ev, t) {
    if (!ev || !t) return 0;
    var tiers = ev.tiers || [], taken = 0;
    (ev.bundles || []).forEach(function (o) {
      var n = Number(o && o.lockSets);
      if (!(n > 0)) return;
      var tk = bundleTickets(o);
      if (tk.tierIds.indexOf(t.id) < 0) return;
      var rest = Math.floor(n) * (tk.qty || 1);
      tk.tierIds.forEach(function (id) {
        if (id === t.id) return;
        var x = null;
        for (var i = 0; i < tiers.length; i++) if (tiers[i].id === id) { x = tiers[i]; break; }
        if (x) rest -= Math.max(0, (Number(x.qty) || 0) - (Number(x.sold) || 0));
      });
      if (rest > 0) taken += rest;
    });
    return Math.min(taken, Math.max(0, (Number(t.qty) || 0) - (Number(t.sold) || 0)));
  }
  function tierStock(ev, t) {
    return Math.max(0, (Number(t && t.qty) || 0) - (Number(t && t.sold) || 0) - (Number(t && t.reserved) || 0) - tierLocked(ev, t));
  }
  function tierZeroQty(ev, t) {
    return (Number(t && t.sold) || 0) + (Number(t && t.reserved) || 0) + tierLocked(ev, t);
  }
  /* 組合包實際可售量（D447 決定三）：限量剩餘（總量 cap − 已售 sold；沒設 cap＝不限量）與票券成員剩餘（各允許票種 floor(剩餘 ÷ 每套張數) 加總）取小；
     回 null＝沒有任何上限可算。「庫存設為 0」＝把 cap 改成剛好等於已售（bundleZeroCap），剩餘 0。 */
  function bundleLeft(ev, b) {
    var caps = [], c = b && b.cap;
    if (c !== null && c !== undefined && c !== '' && isFinite(Number(c))) caps.push(Math.max(0, Number(c) - (Number(b.sold) || 0)));
    var tk = bundleTickets(b);
    if (tk.tierIds.length) {
      var tiers = (ev && ev.tiers) || [], sum = 0;
      tk.tierIds.forEach(function (id) {
        for (var i = 0; i < tiers.length; i++) if (tiers[i].id === id) {
          sum += Math.floor(Math.max(0, (Number(tiers[i].qty) || 0) - (Number(tiers[i].sold) || 0) - (Number(tiers[i].reserved) || 0)) / (tk.qty || 1));
        }
      });
      caps.push(sum);
    }
    return caps.length ? Math.min.apply(null, caps) : null;
  }
  function bundleZeroCap(b) { return Number(b && b.sold) || 0; }

  /* 組合包票券成員的相容讀取（2026-09-21 D296）：一律回 `{ tierIds:[…], qty:n }`。
     舊 `[{ id, qty }]`／`['id']` 視為 tierIds＝各 id、qty＝第一筆的張數；沒有票券成員回空清單。 */
  function bundleTickets(b) {
    var v = b && b.tickets;
    if (Array.isArray(v)) {
      var ids = [], q = 1, first = true;
      v.forEach(function (x) {
        if (typeof x === 'string') ids.push(x);
        else if (x && x.id != null) { ids.push(x.id); if (first) { q = Number(x.qty) > 0 ? Math.floor(Number(x.qty)) : 1; first = false; } }
      });
      return { tierIds: ids, qty: q };
    }
    if (v && typeof v === 'object') return { tierIds: (v.tierIds || []).slice(), qty: Number(v.qty) > 0 ? Math.floor(Number(v.qty)) : 1 };
    return { tierIds: [], qty: 1 };
  }

  /* ── 定價幣別（2026-09-22 D306，主規格 §7.15）────────────────────
     基準幣別（base）＝建立當下創作者的預設幣別；其他四種幣別由系統依匯率換算；創作者可在
     發布前預覽確認畫面／活動詳情「預覽與在地化」的價格表逐幣別覆寫；基準價一改，沒覆寫的幣別跟著重新換算、
     手動覆寫過的幣別保留，「重設為換算值」讓該幣別回到跟隨（2026-10-14 D415 決定六，取代 §7.15 舊的整列重算規則）。
     資料怎麼放：
       · 活動層 `currency`（沒寫＝'TWD'，示範資料的創作者預設幣別）＝該活動票種的基準幣別。
       · bookyay 帶入的活動 `source:'bookyay'`（2026-09-29 D330 改寫，取代「`currency:'HKD'`、港幣當基準」）：
         基準幣別＝創作者幣別（同一般活動）；票種 `price`＝bookyay 港幣原價換算後的基準價（鎖定）、`hkd`＝港幣原價
         （可有小數）。價格表港幣欄＝`hkd`、鎖定、沒有重設；港幣以外的欄——含基準幣別欄（創作者幣別非港幣時）——可覆寫、
         可重設。priceObj 因此多兩個欄位：`pin`（`{ HKD: 原價 }`，鎖定的那一欄）與 `baseOpen`（基準欄可覆寫）。
         （墓碑 2026-10-16 D429：「自動建立的組合包 `hkd`＝bookyay 現價」隨自動組合包退場。）創作者幣別本身是港幣時 pin 落在基準欄上＝基準欄鎖定、保留小數。
         Creator Studio 的清單、摘要、KPI 用覆寫值（粉絲實付；沒覆寫＝基準價）——2026-09-29 D331 決定一，moneyIn 無 cur／effAmount。
       · 票種 `price` 仍是**基準幣別的整數金額**（既有讀取端 event-detail／e-shop／bundle-detail／
         check_events_store 全部照舊讀這個數字，不改形狀）；逐幣別覆寫放同一筆的 `override`
         `{ USD: 135 }`——只記「創作者手動改過的幣別」，換算值不落地（示範匯率固定，算得出來就不存）。
       · 組合包 `price`／`override` 同理；組合包是 ztor 端建立，基準幣別＝創作者預設幣別（'TWD'），
         即使活動本身是 bookyay 帶入（§7.15「含 bookyay 票券的組合包」）。
       · `priceOf(ev, tier)`／`bundlePriceOf(ev, b)` 把上述三樣收成一個 priceObj
         `{ base, amount, override, locked }`，`priceIn(priceObj, cur)` 依「覆寫優先、否則換算」取價。
     匯率是**固定示範值**（ASSUMPTIONS PG-035：1 USD = 31.5 TWD／157 JPY；本輪補 7.8 HKD／1.35 SGD），
     不隨時間變；匯率來源與時點上游待確認（§7.15）。取整：票價整數、四捨五入（§7.15）。
     覆寫值的持久化：活動詳情頁「儲存」後寫進 localStorage `ztor.event-fx`（同 stage 覆寫的做法），
     `get()`／`list()` 讀出時合併到 `tier.override`／`bundle.override`；沒有後端，清鍵即回 mock 原值。 */
  var CURRENCIES = ['USD', 'TWD', 'HKD', 'SGD', 'JPY'];
  var FX_PER_USD = { USD: 1, TWD: 31.5, HKD: 7.8, SGD: 1.35, JPY: 157 };
  var SYMBOL = { USD: 'US$', TWD: 'NT$', HKD: 'HK$', SGD: 'S$', JPY: '¥' };
  var DEFAULT_CURRENCY = 'TWD';
  function fx(from, to, amount) {
    var a = Number(amount) || 0;
    if (!FX_PER_USD[from] || !FX_PER_USD[to]) return Math.round(a);
    if (from === to) return Math.round(a);
    return Math.round(a / FX_PER_USD[from] * FX_PER_USD[to]);
  }
  /* 保留到分（bookyay 港幣原價可有小數，D330）；整數維持整數。 */
  function round2(v) { return Math.round((Number(v) || 0) * 100) / 100; }
  function pinOf(po, cur) {
    var v = po && po.pin && po.pin[cur];
    return (v != null && v !== '' && !isNaN(Number(v))) ? round2(v) : null;
  }
  /* 取某幣別的價（粉絲以該幣別看到、付的價）：鎖定欄（pin）優先 → 覆寫 → 基準價／換算值。
     基準幣別欄只有 baseOpen（bookyay 帶入者，D330）才吃覆寫；一般活動的基準欄唯讀、永遠回基準價。 */
  function priceIn(po, cur) {
    if (!po) return 0;
    cur = cur || po.base;
    var pin = pinOf(po, cur);
    if (pin != null) return pin;
    var ov = po.override && po.override[cur];
    var hasOv = ov != null && ov !== '' && !isNaN(Number(ov));
    if (cur === po.base) return (hasOv && po.baseOpen) ? Math.round(Number(ov)) : round2(po.amount);
    if (hasOv) return Math.round(Number(ov));
    return fx(po.base, cur, po.amount);
  }
  /* 基準價變更（2026-10-14 D415 決定六）：沒覆寫的幣別依新基準價重新換算（換算值不落地，priceIn 即時算）、
     手動覆寫過的幣別保留不覆寫。回新物件、不改原本；鎖定欄（pin）行為不變。 */
  function recalc(po, amount) {
    return { base: po.base, amount: amount == null ? po.amount : amount, override: JSON.parse(JSON.stringify(po.override || {})), locked: !!po.locked,
             pin: po.pin || null, baseOpen: !!po.baseOpen };
  }
  /* 不帶 cur＝Creator Studio 清單／摘要／KPI 用的價，以基準幣別顯示。2026-09-29 D331 決定一（關閉 D330 待確認）：
     一律用粉絲實際付的價——基準欄被覆寫（只有 baseOpen 的 bookyay 帶入者吃得到）就顯示覆寫值，沒覆寫沿用基準價。
     所以直接走 priceIn()：pin → 覆寫 → 基準價，與價格表、粉絲視角預覽同一支，不另寫一份。 */
  function moneyIn(po, cur) {
    var c = cur || (po && po.base) || DEFAULT_CURRENCY;
    return fmtMoney(c, priceIn(po, c));
  }
  /* 清單與 KPI 要拿來相乘的數字版（收入＝單價 × 張數、價格區間）：同上口徑，基準幣別。 */
  function effAmount(po) { return priceIn(po, (po && po.base) || DEFAULT_CURRENCY); }
  /* 有小數才留兩位（HK$199.50）；整數照舊不補 .00——站上其他金額都是整數，行為不變。 */
  function fmtMoney(cur, amount) {
    var a = Number(amount) || 0;
    if (Math.abs(a - Math.round(a)) < 0.005) return SYMBOL[cur] + Math.round(a).toLocaleString('en-US');
    return SYMBOL[cur] + a.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  /* bookyay 帶入者（D330）：pin＝{ HKD: bookyay 原價 }、baseOpen＝基準欄可覆寫。沒有 `hkd` 的票（創作者在 ztor 自己加的）照一般活動。 */
  function bkyPin(ev, row) {
    var bky = !!(ev && ev.source === 'bookyay') && row && row.hkd != null && row.hkd !== '';
    return bky ? { pin: { HKD: round2(row.hkd) }, baseOpen: true } : { pin: null, baseOpen: false };
  }
  function priceOf(ev, tier) {
    var base = (tier && tier.currency) || (ev && ev.currency) || DEFAULT_CURRENCY;
    var k = bkyPin(ev, tier);
    return { base: base, amount: Number(tier && tier.price) || 0, override: (tier && tier.override) || {},
             locked: !!(ev && ev.source === 'bookyay'), pin: k.pin, baseOpen: k.baseOpen };
  }
  function bundlePriceOf(ev, b) {
    var base = (b && b.currency) || (ev && ev.bundleCurrency) || DEFAULT_CURRENCY;
    var hk = bkyBundleHkd(ev, b, base);
    var k = hk != null ? { pin: { HKD: hk }, baseOpen: true } : { pin: null, baseOpen: false };
    return { base: base, amount: Number(b && b.price) || 0, override: (b && b.override) || {}, locked: !!k.pin,
             pin: k.pin, baseOpen: k.baseOpen };
  }
  /* 含 bookyay 票券的組合包，價格表港幣欄鎖定的值（2026-09-29 D331 決定六，主規格 §7.15、5.1.5.4 F3）：
       · 墓碑 2026-10-16（D429）：「自動建立的（`hkd` 有值）＝bookyay 現價（D330；D417／D424 再乘組合折扣）」一支隨自動組合包退場。
       · 創作者自建、成員含 bookyay 匯入票券的（沒有 `hkd`，但允許票種裡有帶 `hkd` 的票）：
         港幣欄＝（bookyay 票券港幣原價 × 張數 ＋ 商品成員換算成港幣的價）×（1 − 組合折扣%）。
         「商品換算成港幣」「乘組合折扣」是規格標明的推導（D331〔使用者可修正〕），照寫、不另加規則。
       · 允許多種票種（任選）時價格是區間，規格寫「區間兩端各算一次」；priceObj 只有一格數字，原型取下界（最低允許票價），
         與原價合計 bundleListAmount 取最低允許票價同一口徑（ASSUMPTIONS UIA-183）。
       · 商品成員先加總（基準幣別）再整筆換算成港幣（fx 取整＝§7.15「換算價」）；結果保留到分（bookyay 港幣可有小數，D330）。
         建立活動第 8 步（create-event bdPriceObj）用同一套算法。
       · `disc`＝組合折扣 %（活動資料的組合包原本沒有這一欄，售價直接寫在 price；本輪起創作者自建的示範組合包帶 disc）。
     不是 bookyay 帶入的活動、或成員沒有 bookyay 票＝null（照一般活動組合包，港幣是換算值、可覆寫）。 */
  function bkyBundleHkd(ev, b, base) {
    if (!b || !ev || ev.source !== 'bookyay') return null;
    var tk = bundleTickets(b), tiers = ev.tiers || [];
    var hks = tk.tierIds.map(function (id) {
      for (var i = 0; i < tiers.length; i++) if (tiers[i].id === id) return tiers[i];
      return null;
    }).filter(function (t) { return t && t.hkd != null && t.hkd !== ''; }).map(function (t) { return Number(t.hkd) || 0; });
    if (!hks.length) return null;
    var tix = Math.min.apply(null, hks) * tk.qty;
    var goods = fx(base || DEFAULT_CURRENCY, 'HKD', ((b.products) || []).reduce(function (n, x) {
      var q = Number(x && x.qty) > 0 ? Number(x.qty) : 1;
      return n + (Number(x && x.price) || 0) * q;
    }, 0));
    var d = Number(b.disc) || 0;
    return round2((tix + goods) * (1 - d / 100));
  }
  /* ── 可賣性防呆（5.1.6.1 F22，D330 → D331 補範圍 → 2026-09-30 D340 補排程、預告期、發布前後同口徑）────────
     活動發布之後，至少要有 1 張門票，或 1 組仍在販售的組合包。
     2026-10-16 D425 決定一：門票那一半從「顯示中的門票」改成「還在的門票」——未刪除的門票，顯示或隱藏都算
     （隱藏是暫時的營運動作，隨時可以再顯示；防呆只防刪光、停光、下架光）。門票全部隱藏後，組合包的停售、下架、封存、刪除不再被擋；
     刪除最後一張還在的門票（又沒有仍在販售的組合包）照舊擋。發布前檢核（5.1.6.1 F11 第五項，create-event 的 hasSellable）不變，仍看顯示中。
     「仍在販售」＝含本活動票券、未刪除、未封存，且上架、顯示，並處於開賣中或預告期。活動資料的組合包沒有三開關欄位
     （三開關的工作副本只在組合商品細節頁、電子商店清單列），以旗標代位：listed:false／shown:false／archived／stopped／
     deleted 任一成立＝不在販售；onSale:false 時只有「預告期」還算（D340：已上架、已顯示、尚未開賣，且開賣時間在未來——
     saleStart 在 now 之後）。沒有開賣排程的 onSale:false（例如重新上架後退回未開賣）算不算預告期〔產品待確認〕，
     原型不算（ASSUMPTIONS UIA-190）。示範資料都沒寫＝一律仍在販售。門票售罄不影響「還在」——售罄是正常結束，不擋。 */
  function bundleSelling(b, now) {
    if (!b || b.listed === false || b.shown === false || b.archived || b.stopped || b.deleted) return false;
    if (b.onSale !== false) return true;
    var t = now || Date.now();
    return !!(b.saleStart && new Date(String(b.saleStart).replace(' ', 'T')).getTime() > t);   // 預告期（D340）
  }
  /* 除了 exceptBundleId 那一組、exceptTier 那一張以外，活動還有沒有可賣的東西。
     opts.at（D340 排程檢查）：到那個時間點還有沒有——其他組合包自己排了下架或停售、且在 at 之前到期的，不算。 */
  function hasOtherSellable(ev, opts) {
    opts = opts || {};
    var tiers = opts.tiers || (ev && ev.tiers) || [];
    /* D425：還在的門票（在 tiers 裡＝未刪除），隱藏的也算；原本 `&& !t.hidden`（顯示中才算） */
    var hasTicket = tiers.some(function (t) { return t !== opts.exceptTier; });
    var at = opts.at ? new Date(String(opts.at).replace(' ', 'T')).getTime() : 0;
    var ends = function (v) { return v && new Date(String(v).replace(' ', 'T')).getTime() <= at; };
    var selling = ((ev && ev.bundles) || []).some(function (b) {
      if (b.id === opts.exceptBundleId || !bundleSelling(b)) return false;
      if (goneAllOf(ev, b, tiers)) return false;   // D391 第 13 題：允許的門票都隨場次刪了＝整組不能賣
      return !(at && (ends(b.unlistAt) || ends(b.saleEnd)));
    });
    return hasTicket || selling;
  }
  /* 隨場次刪除的門票（2026-10-09 · D391 第 13 題，5.1.5.9 §2.3「場次被刪除時的票券成員」）：開賣前移除場次、一併刪除的門票若列在
     組合包允許清單，活動詳情儲存時記進 ev.goneTiers（[{ id, name }]）。組合包保留；這些門票在組合商品細節頁顯示為停用、粉絲端看不到。
     goneTiersOf＝這一組允許清單裡已刪除的門票；goneAllOf＝允許清單的門票全部被刪（整組不能賣、標無法販售，D391 補充二定案）。 */
  function goneTiersOf(ev, b) {
    var ids = bundleTickets(b).tierIds, tiers = (ev && ev.tiers) || [];
    return ((ev && ev.goneTiers) || []).filter(function (g) {
      return ids.indexOf(g.id) >= 0 && !tiers.some(function (t) { return t.id === g.id; });
    });
  }
  function goneAllOf(ev, b, tiersOpt) {
    var ids = bundleTickets(b).tierIds, tiers = tiersOpt || (ev && ev.tiers) || [];
    if (!ids.length || !goneTiersOf(ev, b).length) return false;
    return !ids.some(function (id) { return tiers.some(function (t) { return t.id === id; }); });
  }
  /* 活動的總量（D340，5.1.6.1 F8 退場後的口徑）：本活動所有門票的張數合計——含隱藏的門票（隱藏的票照常作為組合包成員
     售出並計入售出進度，5.1.6.3 §2.6）、含獨立票；計算值、不另存。清單票券欄與詳情 KPI 的分母都用它。 */
  function totalQty(ev) {
    return ((ev && ev.tiers) || []).reduce(function (n, t) { return n + (Number(t.qty) || 0); }, 0);
  }
  /* 組合包的原價合計（基準幣別）：票券成員取最低允許票價、先由各票種的基準幣別換算成組合包的基準幣別，再 × 張數加總
     （§7.15「含 bookyay 票券的組合包」、5.1.5.4 F3）；商品成員照原數字加（活動資料沒有商品幣別，同 bundle-detail 既有做法）。
     2026-09-29 D330 同批修正：bundle-detail 頁首把票價直接相加、沒換算（$550 對 NT$2,221）。 */
  function bundleListAmount(ev, b) {
    var base = bundlePriceOf(ev, b).base;
    var tk = bundleTickets(b);
    var tiers = (ev && ev.tiers) || [];
    var unit = tk.tierIds.reduce(function (m, id) {
      var t = null;
      for (var i = 0; i < tiers.length; i++) if (tiers[i].id === id) { t = tiers[i]; break; }
      if (!t) return m;
      var po = priceOf(ev, t);
      var v = po.base === base ? Number(po.amount) || 0 : fx(po.base, base, po.amount);
      return Math.min(m, v);
    }, Infinity);
    var tix = (unit === Infinity ? 0 : unit) * (tk.tierIds.length ? tk.qty : 0);
    return tix + ((b && b.products) || []).reduce(function (n, x) { return n + (Number(x && x.price) || 0) * (Number(x && x.qty) > 0 ? Number(x.qty) : 1); }, 0);
  }
  var FX_KEY = 'ztor.event-fx';
  function fxMap() {
    try { return JSON.parse(localStorage.getItem(FX_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function writeFx(id, data) {
    var m = fxMap();
    if (data) m[id] = data; else delete m[id];
    try { localStorage.setItem(FX_KEY, JSON.stringify(m)); } catch (e) {}
  }
  /* 把本機儲存的覆寫合併進活動副本（tiers[].override／bundles[].override），沒有存過就原樣回傳。 */
  function applyFx(ev) {
    if (!ev) return ev;
    var m = fxMap(), d = m[ev.id];
    if (!d) return ev;
    (ev.tiers || []).forEach(function (t) { if (d.tiers && d.tiers[t.id]) t.override = d.tiers[t.id]; });
    (ev.bundles || []).forEach(function (b) { if (d.bundles && d.bundles[b.id]) b.override = d.bundles[b.id]; });
    return ev;
  }
  /* 刪除（2026-09-29 D331）：草稿活動刪除（活動清單草稿列，D294）與活動組合包刪除（組合商品細節頁，D307 零成交）
     記在 sessionStorage `ztor.events.removed`＝本分頁這一趟的工作階段（同 products-store 的刪除做法），
     `{ events: [活動 id…], bundles: { 活動 id: [組合包 id…] } }`；關掉分頁即回 mock 原值。
     草稿活動被刪除時，裡面的組合包隨活動一起消失（D331 決定四；D429 起只剩創作者自建的）——組合包住在活動資料裡，
     活動不在了、它也就查不到了；細節頁與電子商店都讀 get()／list()，連動不必各頁自己做。 */
  var RM_KEY = 'ztor.events.removed';
  function rmMap() {
    try { return JSON.parse(sessionStorage.getItem(RM_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function writeRm(m) { try { sessionStorage.setItem(RM_KEY, JSON.stringify(m)); } catch (e) {} }
  function isRemoved(id) { return (rmMap().events || []).indexOf(id) >= 0; }
  function applyRm(ev) {
    if (!ev) return ev;
    var gone = (rmMap().bundles || {})[ev.id];
    if (gone && gone.length && ev.bundles) ev.bundles = ev.bundles.filter(function (b) { return gone.indexOf(b.id) < 0; });
    return ev;
  }

  /* ── 活動詳情的編輯結果（2026-10-09 · D390 稽核第一節原型第 3、4 條）──────────────────────
     活動詳情（event-detail）原本按「儲存」只改頁面記憶體裡那一份，門票逐筆編輯更是完全沒寫回——重新整理或換頁就回到 mock 原值，
     「直接生效」只是看起來生效。改成寫進 localStorage `ztor.event-edits`＝{ 活動 id: { 欄位: 值 } }（同階段覆寫、下架的做法），
     get()／list() 讀出來時整欄覆蓋（淺合併：tiers、sessions、publish、sale、listing、rules 等都以整份為單位）。
     寫入端：頁面編輯的儲存（commitEdit）、門票逐筆編輯的儲存／刪除、活動預設購票規則的儲存、立即開賣改開賣時間。
     原型限制：清單頁（events.html）的列是靜態 HTML，名稱與場地欄不吃這份覆寫（同 STAGE-001 的既有限制）。 */
  var EDIT_KEY = 'ztor.event-edits';
  function editMap() {
    try { return JSON.parse(localStorage.getItem(EDIT_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function applyEdits(ev) {
    if (!ev) return ev;
    var p = editMap()[ev.id];
    if (p) Object.keys(p).forEach(function (k) { ev[k] = clone(p[k]); });
    return ev;
  }

  /* ── Admin 第一次儲存 bookyay 活動（2026-10-09 · D390 稽核第一節原型第 15 條，5.1.0.6 F3／F4）────────────
     Admin 在創作者活動管理按「繼續設定」進建立流程（create-event.html?import=<bky id>&handle=<創作者>），按「儲存為草稿」＝第一次儲存：
     這一場在 Admin 清單由「待設定」轉「草稿」，同時成為那位創作者的草稿（創作者活動清單出現、可續填）。
     記在 localStorage `ztor.bky-drafts`＝{ bky id: { id: 草稿活動 id, owner: 創作者 seed, name } }；
     js/sidebar.js 讀它把這一場加進該創作者的 bookyayDrafts（狀態＝草稿），list()／get() 把它補成一筆草稿活動。
     建立流程頁不載 sidebar.js，所以「按下儲存為草稿」的接線放在本檔（本檔建立流程頁有載）——只在帶 ?import= 與 &handle= 的那一趟生效，
     一般創作者自己建立、續填草稿都不受影響。解除對應（sidebar setBkyMap 為 null）時一併清掉。 */
  var BKY_DRAFT_KEY = 'ztor.bky-drafts';
  function bkyDraftMap() {
    try { return JSON.parse(localStorage.getItem(BKY_DRAFT_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function writeBkyDrafts(m) { try { localStorage.setItem(BKY_DRAFT_KEY, JSON.stringify(m)); } catch (e) {} }
  /* 一筆動態草稿的活動紀錄：最小欄位，日期與場地取 Admin 匯入清單（sidebar.js 有載時）；續填時由建立流程重跑帶入補齊 */
  function bkyDraftEvent(bkyId, rec) {
    var src = null;
    try { src = ((window.ztorCreator && window.ztorCreator.bookyayEvents) || []).filter(function (x) { return x.id === bkyId; })[0] || null; } catch (e) {}
    return {
      id: rec.id, bkyId: bkyId, source: 'bookyay', dynDraft: true,
      type: rec.type || 'concert', typeLabelKey: 'ce.type.' + (rec.type || 'concert'), category: 'concert', series: null,
      name: rec.name || (src && src.name) || '', desc: '', lineup: [],
      venue: (src && src.venue) || '', city: '', address: '', date: (src && src.date) || '', start: '', end: '', doors: '',
      tiers: [], bundles: [], sold: 0, revenue: 0, status: 'draft',
      images: { keyvisual: 'images/hero-event.jpg', banner: '', gallery: [] }, video: false
    };
  }
  function dynDrafts() {
    var m = bkyDraftMap(), out = [];
    Object.keys(m).forEach(function (bid) {
      var rec = m[bid];
      if (!rec || !rec.id) return;
      if (EVENTS.some(function (e) { return e.id === rec.id || e.bkyId === bid; })) return;   // 示範資料已有這一場的草稿就不重複
      out.push(bkyDraftEvent(bid, rec));
    });
    return out;
  }
  if (/create-event\.html$/.test(location.pathname || '')) {
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('[data-wizard-savedraft]')) return;
      var q = new URLSearchParams(location.search);
      var bid = q.get('import'), owner = q.get('handle');
      if (!bid || !owner) return;
      var m = bkyDraftMap();
      if (m[bid]) return;   // 只有第一次儲存才轉草稿；之後再存是同一份草稿
      var nm = document.querySelector('[data-ce="name"]');
      m[bid] = { id: 'bkydraft-' + bid, owner: owner, name: nm ? String(nm.value || '').trim() : '' };
      writeBkyDrafts(m);
    }, true);
  }

  /* ── 活動變更通知的寄送紀錄（2026-10-09 · D390 稽核第一節原型第 9 條，5.1.6.3 §2.10.1）──────────────
     售票中或進行中儲存了高影響變更（5.1.6.2 F12）＝真的寄出一次活動變更通知；記在 localStorage `ztor.event-change-notices`
     ＝{ 活動 id: [{ at, holders, fields:[…] }] }，通知分頁的寄送紀錄照實際寫（有寄過寫最近一次與次數，沒寄過才寫未寄出）。 */
  var NOTICE_KEY = 'ztor.event-change-notices';
  function noticeMap() {
    try { return JSON.parse(localStorage.getItem(NOTICE_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }

  /* release2.4 留下的示範活動（D410 決定四）：bookyay 匯入的活動與共看派對。其餘＝功能 S95「非 bookyay 的示範活動（2.4 隱藏）」。
     2026-10-15 D422 決定一：共看派對另受 S75 管（release2.4 不含，list() 另濾），這支只回答「是不是 S95 那一批」。 */
  function isRel24Demo(ev) { return !!ev && (ev.source === 'bookyay' || ev.type === 'watchparty'); }

  /* ── bookyay 活動的已報到（2026-10-13 · D410 決定三，5.1.6.3 §2.3）──────────────────────────
     bookyay 匯入的活動，門票入場由 bookyay QR 掃描（D375 決定五）；已報到人數來自 bookyay 回傳的入場紀錄。
     資料形狀：ev.bkyCheckin＝{ received: true, count: N }＝已收到、N 人已入場；沒有這欄或 received 不是 true＝還沒收到。
     還沒收到時，活動詳情所有顯示已報到數字的地方（現場報到台、結案卡、名單的報到統計與篩選計數、各票種到場、進場頻率）
     一律寫「暫無資料」，不寫 0——0 是「沒人到」，跟「還不知道」是兩件事。ztor 自建活動維持原本的推導（arrivedAtOpen、sold × 0.91）。 */
  function bkyArrived(ev) {
    if (!ev || ev.source !== 'bookyay') return null;
    var c = ev.bkyCheckin;
    if (!c || c.received !== true) return null;
    return Math.max(0, Math.min(Number(ev.sold) || 0, Number(c.count) || 0));
  }
  function checkinNoData(ev) { return !!ev && ev.source === 'bookyay' && bkyArrived(ev) == null; }
  /* 這一場「到場人數」的統一入口：bookyay＝回傳的人數（沒資料＝0，畫面另以 checkinNoData 改寫成暫無資料）；
     自建＝進行中 arrivedAtOpen、已結束 sold × 0.91（同 checkinSummary 原本的口徑）。 */
  function arrivedOf(ev) {
    if (!ev) return 0;
    if (ev.source === 'bookyay') return bkyArrived(ev) || 0;
    if (ev.status === 'ended') return Math.round((ev.sold || 0) * 0.91);
    return ev.arrivedAtOpen || 0;
  }

  window.ztorEvents = {
    bundleTickets: bundleTickets,
    isRel24Demo: isRel24Demo,             /* D410 決定四：release2.4 留下的示範活動（bookyay 匯入＋共看派對） */
    checkinNoData: function (evOrId) {    /* D410 決定三：bookyay 活動還沒收到入場紀錄＝暫無資料 */
      var ev = typeof evOrId === 'string' ? window.ztorEvents.get(evOrId) : evOrId;
      return checkinNoData(ev);
    },
    /* 定價幣別（D306）：常數與 helper，見上方說明區塊 */
    CURRENCIES: CURRENCIES,
    DEFAULT_CURRENCY: DEFAULT_CURRENCY,
    FX_PER_USD: FX_PER_USD,
    SYMBOL: SYMBOL,
    fx: fx,
    priceIn: priceIn,
    recalc: recalc,
    moneyIn: moneyIn,
    fmtMoney: fmtMoney,
    priceOf: priceOf,
    bundlePriceOf: bundlePriceOf,
    bundleListAmount: bundleListAmount,   /* D330 同批：組合包原價合計（票券成員先換算成組合包基準幣別） */
    effAmount: effAmount,                 /* D331：清單／KPI 用的單價（基準幣別，覆寫優先） */
    bkyBundleHkd: bkyBundleHkd,           /* D331：含 bookyay 票券的自建組合包港幣欄（公式；D429 起沒有自動建立的） */
    bundleSelling: bundleSelling,         /* D331／D340：組合包「仍在販售」（上架＋顯示＋開賣或預告期，未刪除／封存） */
    goneTiersOf: goneTiersOf,             /* D391 第 13 題：組合包允許清單裡已隨場次刪除的門票 */
    goneAllOf: goneAllOf,                 /* D391 第 13 題：允許清單的門票全部被刪＝整組不能賣 */
    hasOtherSellable: hasOtherSellable,   /* D331／D340：可賣性防呆——扣掉這一張／這一組後（或到 opts.at 那個時間點）活動還有沒有可賣的 */
    totalQty: totalQty,                   /* D340：活動總量＝所有門票張數合計（含隱藏），取代已刪的容量 */
    /* 草稿活動刪除（D294 → D331 決定四 → D340 決定四）：只收草稿；回傳隨活動一起刪除的組合包（給確認彈窗列名）——
       創作者自建、成員含本活動票券的都算（D340；D429 起已沒有 bookyay 自動建立的）。組合包住在活動資料裡，活動刪了一起消失。 */
    draftBundlesOf: function (id) {
      var ev = window.ztorEvents.get(id);
      return ev ? (ev.bundles || []).slice() : [];
    },
    /* 活動下架的連動下架（2026-10-05 · D352 稽核 B3／B16，主規格 §7.14「活動下架時連動組合包」，D292；D457：取消活動退場，只剩下架）：
       回傳會跟著一起下架的「上架中」組合包（給確認彈窗列名）；已下架、已封存、已刪除的不受影響、不列。
       活動詳情頁設定分頁與活動清單列操作的「下架」共用這一支，確認內容才會說同一件事。 */
    unlistBundlesOf: function (id) {
      var ev = window.ztorEvents.get(id);
      return ev ? (ev.bundles || []).filter(function (b) { return b.listed !== false && !b.archived && !b.deleted; }) : [];
    },
    /* D448（2026-10-19）：活動重新上架前，問要不要同時上架的組合包——含本活動票券、目前已下架的（已封存、已刪除的不列）。
       已結束的活動，組合包本來就不能重新上架（D437 決定一；D457：已封存的活動整頁唯讀、不會走到這裡），回空陣列、不問。活動詳情「重新上架」用這一支。 */
    relistBundlesOf: function (id) {
      var ev = window.ztorEvents.get(id);
      if (!ev || ev.status === 'ended' || ev.archived) return [];
      return (ev.bundles || []).filter(function (b) { return b.listed === false && !b.archived && !b.deleted; });
    },
    removeDraft: function (id) {
      var ev = window.ztorEvents.get(id);
      if (!ev || ev.status !== 'draft') return false;
      var m = rmMap(); m.events = (m.events || []).concat([id]); writeRm(m);
      /* D374 決定三：bookyay 匯入、已對應未發布的活動，刪草稿＝解除對應——與創作者活動管理的「解除對應」同一支，
         活動回到待對應創作者。原型這裡只有 status 為 draft 的才走得到（已發布的沒有刪除入口）。 */
      if (ev.source === 'bookyay' && ev.bkyId && window.ztorCreator && window.ztorCreator.bookyayUnmap) {
        window.ztorCreator.bookyayUnmap(ev.bkyId);
      }
      if (ev.bkyId) window.ztorEvents.clearBkyDraft(ev.bkyId);   // D390：Admin 第一次儲存產生的草稿記號一併清掉
      return true;
    },
    /* D390（稽核第一節原型第 3、4 條）：活動詳情的編輯結果寫回（淺合併，見上方 EDIT_KEY 說明）。patch 的每個欄位整份取代。 */
    saveEdits: function (id, patch) {
      if (!id || !patch) return;
      var m = editMap();
      m[id] = Object.assign({}, m[id], clone(patch));
      try { localStorage.setItem(EDIT_KEY, JSON.stringify(m)); } catch (e) {}
    },
    /* D390（稽核第一節原型第 15 條）：Admin 第一次儲存 bookyay 活動產生的草稿記號（見上方 BKY_DRAFT_KEY） */
    bkyDrafts: function () { return bkyDraftMap(); },
    clearBkyDraft: function (bkyId) {
      var m = bkyDraftMap();
      if (!m[bkyId]) return;
      delete m[bkyId]; writeBkyDrafts(m);
    },
    /* D390（稽核第一節原型第 9 條）：持票人數＝持有本活動有效票的粉絲人數，不是張數（一筆訂單可能兩張）。
       高影響確認的「會通知 N 位持票人」用它。原型的買家名是從小名單池決定性生成的、會重名，不能拿來去重——
       以有效（已付款、未撤銷）訂單筆數當持票人數，一筆訂單＝一位買家（呈現假設，ASSUMPTIONS UIA-238）。 */
    holdersOf: function (id) {
      /* D408：經組合包拿到門票的買家也是持票人，組合包訂單一筆＝一位 */
      return window.ztorEvents.transactions(id).concat(window.ztorEvents.bundleTransactions(id))
        .filter(function (t) { return t.status === 'paid'; }).length;
    },
    changeNotices: function (id) { return (noticeMap()[id] || []).slice(); },
    logChangeNotice: function (id, rec) {
      if (!id) return;
      var m = noticeMap();
      m[id] = (m[id] || []).concat([rec]);
      try { localStorage.setItem(NOTICE_KEY, JSON.stringify(m)); } catch (e) {}
    },
    removeBundle: function (evId, bId) {
      if (!evId || !bId) return;
      var m = rmMap(); m.bundles = m.bundles || {};
      m.bundles[evId] = (m.bundles[evId] || []).concat([bId]); writeRm(m);
    },
    isRemoved: isRemoved,
    round2: round2,
    /* 詳情頁「預覽與在地化」儲存覆寫：`{ tiers: { tierId: { USD: 135 } }, bundles: { bundleId: {…} } }`；
       只存有值的幣別，空物件＝該列沒有覆寫。傳 null 清掉。 */
    setOverrides: function (id, data) { if (id) writeFx(id, data); },
    getOverrides: function (id) { return (fxMap()[id]) || null; },
    resetOverrides: function (id) { if (id) writeFx(id, null); },
    list: function () {
      var m = stageMap();
      /* 2026-10-09 D383：release2.4 沒有多場次活動（S87 ⚪）——版本切換不含 S87 時，多場的示範活動（album-signing-taipei）
         不進清單，活動清單、計數與組合包示範都看不到它；最終版照舊。get() 不濾（直連照樣查得到，畫面上的多場元素由 data-feat 收起）。 */
      var multiOff = window.ztorDevState && window.ztorDevState.featOn && !window.ztorDevState.featOn('S87');
      /* 2026-10-13 D410 決定四（示範資料）：release2.4 只顯示 bookyay 匯入的活動與共看派對——其餘示範活動掛功能 S95（⚪），
         版本不含 S95 時不進清單（活動清單、計數、店鋪設定的活動候選、首頁畫布等 list() 的消費端一起收起）；get() 不濾（直連照樣查得到）。 */
      var demoOff = window.ztorDevState && window.ztorDevState.featOn && !window.ztorDevState.featOn('S95');
      /* 2026-10-15 D422 決定一：release2.4 不含共看派對（S75 改 ⚪）——版本不含 S75 時共看派對的示範活動也不進清單；
         與 events.html 靜態列掛 data-feat="S75" 同一個標記（最終版照舊）。get() 不濾。 */
      var wpOff = window.ztorDevState && window.ztorDevState.featOn && !window.ztorDevState.featOn('S75');
      return clone(EVENTS).concat(dynDrafts()).filter(function (e) {
        return !isRemoved(e.id) && !(multiOff && e.sessions && e.sessions.length > 1) &&
          !(demoOff && !isRel24Demo(e)) && !(wpOff && e.type === 'watchparty');
      }).map(function (e) {
        applyEdits(e);                       // D390：活動詳情的編輯結果
        if (m[e.id]) e.status = m[e.id];
        return applyUnlist(applyRm(applyFx(e)));
      });
    },
    /* bookyay 匯入、尚未首次儲存的活動（D361 決定六）不在這份清單裡：它們只住在 js/sidebar.js 的
       window.ztorCreator.bookyayEvents（Admin 創作者活動管理的「待設定」），創作者端清單與計數都讀這裡，
       所以看不到也不計數；第一次儲存後才以草稿出現（示範：khh-countdown-draft）。 */
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
        if (!ev) ev = dynDrafts().filter(function (e) { return e.id === id; })[0] || null;   // D390：Admin 第一次儲存產生的草稿
      }
      if (!ev) return null;                  // 有 id 但查不到＝查詢失敗
      applyEdits(ev);                        // D390：活動詳情的編輯結果（門票逐筆編輯、頁面儲存、發布設定）
      if (isRemoved(ev.id)) return null;     // 這一趟刪掉的草稿活動（D331）＝查不到
      if (m[ev.id]) ev.status = m[ev.id];    // 本機改過階段的活動以覆寫值為準
      return applyUnlist(applyRm(applyFx(ev)));   // 本機存過的逐幣別覆寫（D306）一併合併；刪掉的組合包濾掉（D331）；已下架（D361）
    },
    /* 下架／重新上架（D361 決定五 → D371 決定一：創作者與 Admin 都能做）：只寫上架記號，不改階段 */
    setUnlisted: function (id, on) {
      if (!id) return;
      var u = unlistMap();
      u[id] = !!on;
      try { localStorage.setItem(UNLIST_KEY, JSON.stringify(u)); } catch (e) {}
    },
    /* 封存／解除封存（D457）：只有已下架能封存（呼叫端把關）；封存時清掉尚未生效的上架排程、解除後回到已下架（unlisted 維持 true、不自動上架） */
    setArchived: function (id, on) {
      if (!id) return;
      var a = archiveMap();
      a[id] = !!on;
      try { localStorage.setItem(ARCHIVE_KEY, JSON.stringify(a)); } catch (e) {}
      if (on) { var u = unlistMap(); u[id] = true; try { localStorage.setItem(UNLIST_KEY, JSON.stringify(u)); } catch (e) {} }
    },
    isSoldOut: isSoldOut,
    tierLocked: tierLocked,
    tierStock: tierStock,
    tierZeroQty: tierZeroQty,
    bundleLeft: bundleLeft,
    bundleZeroCap: bundleZeroCap,
    /* 階段轉換（原型層級）：寫進 localStorage，下一次 get() 就是新階段。
       允許哪些轉換由呼叫端（event-detail.html）依 §7.2 狀態機判斷，本檔只負責存。 */
    setStage: function (id, status) { if (id) writeStage(id, status); },
    resetStage: function (id) { if (id) writeStage(id, null); },
    /* 交易明細：有金流的階段才有（售票中／進行中／已結束）。已封存的活動階段不變、交易照樣看得到（唯讀）。 */
    /* D361（2026-10-07）：售票中從「任一張門票或票務商品開始能買」起算，已排程＝已發布、還沒有任何東西能買，
       所以已排程沒有成交、這裡不給交易，與上面的階段清單一致。預售示範 nick-symphonic-taipei 的組合包預售
       10/08 已開始，2026-10-09 起改為售票中（D390 稽核原型第 16 條，UIA-210 關閉）。
       已報到（checkedIn）：進行中與已結束的已付款交易依到場比例決定性標記，供「已報到不能撤銷」（D361 決定四）。
       比例與名單同一套口徑（進行中＝arrivedAtOpen ÷ sold、已結束＝0.91），非真實核銷資料。 */
    transactions: function (id) {
      var ev = window.ztorEvents.get(id);
      if (!ev || ['on-sale', 'live', 'ended'].indexOf(ev.status) < 0) return [];
      var out = buildTx(ev);
      /* D410 決定三：bookyay 活動照回傳的入場人數（沒資料＝沒有任何一筆標已報到）；自建照舊 */
      var rate = (ev.status === 'ended' || ev.status === 'live') && ev.sold ? Math.min(1, arrivedOf(ev) / ev.sold) : 0;
      if (rate > 0) out.forEach(function (t, i) {
        if (t.status === 'paid' && ((i * 37) % 100) < rate * 100) t.checkedIn = true;
      });
      return out;
    },
    /* D407：含這場活動門票的組合包訂單，階段條件同 transactions() */
    bundleTicketShare: bundleTicketShare,
    bundleTransactions: function (id) {
      var ev = window.ztorEvents.get(id);
      if (!ev || ['on-sale', 'live', 'ended'].indexOf(ev.status) < 0) return [];
      var out = buildBundleTx(ev);
      return out;
    },
    /* 最終報到統計（2026-08-13）：現場報到台只在進行中出現，活動結束後那張報到快照卡
       仍要回答「這場最後到了多少人」——結束後還顯示「開演當天才開放」是錯的。
       決定性推導自售出張數（不用 Math.random），非真實票務數字，同 buildRoster 的口徑。 */
    checkinSummary: function (id) {
      var ev = window.ztorEvents.get(id);
      if (!ev || ev.status !== 'ended') return null;
      var sold = ev.sold || 0;
      /* D410 決定三：bookyay 活動還沒收到入場紀錄 → noData（數字一律不顯示，呼叫端改寫暫無資料） */
      if (checkinNoData(ev)) return { sold: sold, valid: 0, used: 0, invalid: 0, rate: 0, noData: true };
      var valid = arrivedOf(ev);                    // 正常核銷入場（bookyay＝回傳人數；自建＝sold × 0.91）
      var used = Math.round(sold * 0.015);          // 重複掃描（第二次起回黃燈）
      var invalid = Math.round(sold * 0.004);       // 無效票（作廢／非本場）
      return { sold: sold, valid: valid, used: used, invalid: invalid,
               rate: sold ? Math.round(valid / sold * 100) : 0 };
    },
    /* 持票人名單（2026-08-19 放寬）：原本只有進行中會生成，售票中／已結束的名單分頁
       因此永遠是空表。改成有金流即有名單——名單問的是「誰持票」，不是「誰到場」：
       · 售票中：無 arrivedAtOpen → 全員未報到（活動還沒發生，正確）
       · 進行中：照舊，用該場的 arrivedAtOpen
       · 已結束：到場數用 checkinSummary 同一條公式（sold × 0.91），
         名單表逐列的已到場加總才會等於結案卡與圖例的正常核銷數，不會兩處打架
       （D457：已取消階段退場，原「已取消不生成」註解隨之拿掉；已封存的活動照原階段決定。） */
    roster: function (id) {
      var ev = window.ztorEvents.get(id);
      if (!ev) return [];
      if (ev.status === 'on-sale') return buildRoster(ev);
      if (ev.status === 'live') {
        /* D410 決定三：bookyay 活動的到場＝回傳人數（沒資料＝全員未到，畫面另寫暫無資料） */
        if (ev.source !== 'bookyay') return buildRoster(ev);
        var lv = clone(ev); lv.arrivedAtOpen = arrivedOf(ev);
        return buildRoster(lv);
      }
      if (ev.status === 'ended') {
        var done = clone(ev);
        done.arrivedAtOpen = arrivedOf(ev);
        /* 掃描次數（2026-10-12）：掃描只有「已掃描／未掃描」兩種，重複掃描只是紀錄。
           已掃描的列掃了一次或兩次；兩次的筆數與 checkinSummary().used 同一個比例（sold×0.015），
           平均散落在已掃描列裡，非真實核銷資料。 */
        var rows = buildRoster(done);
        var repeats = Math.round((ev.sold || 0) * 0.015);
        var step = repeats ? Math.floor(done.arrivedAtOpen / repeats) : 0;
        rows.forEach(function (r, i) { if (r.arrived) r.scans = (step && i % step === 3) ? 2 : 1; });
        return rows;
      }
      return [];
    },
    /* 票種已售出的張數（容量下限與「可否刪除票種」都靠它） */
    soldOf: function (ev) {
      if (!ev || !ev.tiers) return 0;
      return ev.tiers.reduce(function (n, t) { return n + (t.sold || 0); }, 0);
    },

    /* ── 票券作廢（Void ticket，D253）───────────────────────────
       平台不提供退款動作，票券取消一律由手動作廢執行（逐票或整場）。
       txAll（event-detail.html 的交易明細）是頁面自己 fetch 一次後留在記憶體的陣列，
       這裡直接改傳入的 tx 物件（同 orders 模組 voidItem 對 order 物件的做法），
       不寫回 localStorage——原型沒有後端，重新整理即回到 demo 初始值。
       三種狀態：'ok'（可作廢）／'voided'（已作廢，終態、不可逆）／'redeemed'（已報到，終態、不可作廢）。
       2026-10-07（D361 決定四）：已報到（已使用）的票比照電子商店「已完成為終態」（D253 決定四）不能撤銷；
       已結束活動中未報到的票仍可撤銷。已報到的來源是 transactions() 依到場比例標的 checkedIn（見上方說明）。 */
    /* D411（2026-10-13）：由訂單編號反查「哪一場活動的哪一筆交易」，給 orders-store 的 get() 用
       （交易明細每一列都能打開訂單詳情）。編號格式見 orderNo()；查不到回 null。 */
    findOrder: function (orderId) {
      var m = /^ZT-(\d{3})(\d{4})$/.exec(String(orderId || '').replace(/^#/, '').trim().toUpperCase());
      if (!m) return null;
      var src = EVENTS[Number(m[1]) - 100];
      if (!src) return null;
      var ev = window.ztorEvents.get(src.id);
      if (!ev) return null;
      var all = window.ztorEvents.transactions(ev.id).concat(window.ztorEvents.bundleTransactions(ev.id));
      for (var i = 0; i < all.length; i++) if (all[i].orderId === m[0]) return { ev: ev, tx: all[i] };
      return null;
    },
    ticketVoidState: function (tx) {
      if (!tx) return 'ok';
      if (tx.status === 'voided') return 'voided';
      return tx.checkedIn ? 'redeemed' : 'ok';
    },
    /* reason（2026-10-16，D431 協調者補充）：選填的撤銷原因，比照訂單撤銷（D271）——只記在撤銷紀錄給 Admin 查，不寄信。 */
    voidTicket: function (tx, actor, reason) {
      if (!tx || tx.status === 'voided' || tx.checkedIn) return false;
      tx.status = 'voided';
      var d = new Date();
      tx.voidedAt = d.toISOString().slice(0, 16).replace('T', ' ');
      tx.voidedBy = actor || 'Admin';
      if (reason) tx.voidReason = String(reason).trim(); else delete tx.voidReason;
      return true;
    },
    /* 整場作廢：對傳入清單裡所有還未作廢的交易逐一作廢，回傳實際作廢筆數。原因（選填）套用到每一筆。 */
    voidAllRemaining: function (txList, actor, reason) {
      var n = 0, self = this;
      (txList || []).forEach(function (t) { if (self.voidTicket(t, actor, reason)) n++; });
      return n;
    }
  };
}());
