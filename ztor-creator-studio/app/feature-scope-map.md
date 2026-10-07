# Ztor eShop · Feature Scope Map — release2.3／release2.4

> Creator Studio × eShop 完整功能盤點與版本切割。每個節點都歸入三個 tier 之一；非 release2.3 的項目也全部列出，供商務團隊排優先序。

- **日期**：2026-06-29
- **來源**：Ztor功能點.md + Phase 1 handoff
- **範圍**：internal use only
- **2026-10-07 改名**：Phase 1 改稱 release2.3（E-Shop，已凍結交付）、下一版改稱 release2.4；Tier 欄與版本鍵同步改名，下方 2026-10-07 以前的段落保留當時寫法
- **功能總數**：129（2026-10-05 補登 S68–S71、O33，D360；2026-09-29 補登 S52–S56；同日補登 S58；2026-09-30 補登 S59–S61，D340；2026-10-01 補登 S62–S64，D342；2026-10-02 補登 S65–S66，D347；2026-10-05 補登 S67，D354；同日 S54（D353）、S57、S60（D354）改 ⚫ 退場）

## Tier 圖例

| Tier | 意義 |
|---|---|
| 🟢 release2.3（已交付） | 已交付開發的範圍（E-Shop），凍結在 monorepo 的 `release2.3` 分支（2026-09-23 切出，原名 `phase1`） |
| 🔵 release2.4（下一版） | 下一期要交付的功能；標上去就會出現在面板的「release2.4」預覽 |
| ⚪ TBD（未排定） | 商務團隊待定；release2.4 預覽不顯示，只在最終版出現 |
| ⚫ 退場 | retired（產品決策已全面撤除，不再規劃／不計入 release2.3／release2.4／TBD 三態，2026-09-09 起新增） |

Tier 欄的 release 編號就是程式用的 tier 代號：`devtools.js` 讀到 `🟢 release2.3` 就把該功能歸到 `release2.3`。之後交付 release2.4 時，那批功能改標 `🟢 release2.4`（保留它是哪一版交付的），新的下一版標 `🔵 release2.5`。

本期統計：🟢 release2.3 92 · 🔵 release2.4 23 · ⚪ TBD 32 · ⚫ 退場 5（2026-10-07 依功能表逐列重數，同日補登 S82〔D366〕；各模組小計與功能總數另待校正）

## Build 狀態圖例

相對兩份 prototype 的落地狀態（2026-06-29 盤點，預設 built，僅列例外）。

| 狀態 | 意義 |
|---|---|
| ✅ built | 已建置 |
| 🟡 gap | 部分落地、有缺口 |
| ❌ missing | 未建置 |
| ✅⬆ ahead | 超前建置（prototype 已有，規格尚未涵蓋） |
| ⏳ deferred | 已延後 |

Build 統計：✅ 87 built · 🟡 6 gap · ✅⬆ 29 ahead · ⏳ 2 deferred

**Feature ID** — `S` Shop · `O` Orders · `E` Earnings · `B` Buyer storefront（例：`E07`），跨團隊引用用，編號穩定不變。

## 開發版本配置

cheat code（Alt＋右鍵開啟）的「版本」切換讀這張表生成選項；改這張表、重整頁面即重新配置，不必動程式。「類型」欄同時是面板分組鍵：`開發`→「開發版本」、`測試`→「測試版」、`Demo`→「Presentation demo」。純減功能（`tier:`）的開發版只改表即可；但**以 Phase 4 為基底、只改接個別頁面的特殊版**（`route:`／`page:`，如 `funding-test`、`deck-for-sony`）另需在**兩處**白名單登記其鍵——`js/devtools.js` 的 `isFullBaseVersion()` 與 `js/sidebar.js` 的 `fullVersion()`（navbar 有獨立的 route gate），漏一處就會被當低版本、藏掉 full-only 頁面或 navbar 選項。新分組若要友善標題，在 devtools.js 的 `VER_GROUP_LABEL`／`VER_GROUP_ORDER` 補一筆；未登記者面板直接以類型字串當標題。

| 鍵 | 顯示名 | 類型 | 規則 | 說明 |
|---|---|---|---|---|
| `full` | 最終版 | 開發 | `all` | 全部功能（預設）；日常編修都改這一版 |
| `release2.4` | release2.4 | 開發 | `tier:release2.3,release2.4` | 已交付（🟢 release2.3）＋下一版（🔵 release2.4）；⚪ 未排定、`full` 保留 gate 與未標記的新功能都隱藏 |
| `funding-test` | funding-test | 測試 | `route:create-project.html=funding-test/create-campaign.html` | 建立專案改接募資建立流程（create-campaign 部署複本），其餘同最終版 |
| `deck-for-sony` | Deck for Sony | Demo | `route:earnings.html=earnings-sony.html` | 收入管理改接 Sony 簡報版（earnings-sony.html），其餘同最終版 |

**交付輪替（2026-09-23 起；2026-10-07 改用 release 編號）**：已交付的版本不留在 `main` 的面板上，改由 monorepo 的凍結分支代表——release2.3＝`release2.3` 分支（原名 `phase1`；版本鎖死、獨立網址、只收明確要進 release2.3 的修正，升版記在該分支的 `RELEASE2.3-CHANGES.md`）。下一期範圍確定時：
1. 把要做的功能標 `🔵 release2.4`
2. 用面板的「release2.4」確認畫面
3. 從 `main` 切 `release2.4` 分支鎖定並開新網址
4. 交付後把那批功能改標 `🟢 release2.4`
5. 本表的開發版本配置把 `release2.4` 列換成 `release2.5`（規則 `tier:release2.3,release2.4,release2.5`），同步 `js/devtools.js` 的 `VERSIONS` 後備、`TIER_EMOJI` 的 🔵 改對到 release2.5；新標 🔵 的功能在 `FEAT_TIER` 後備補一筆，已交付的 `release2.4` 值不用改

**新功能做出來的當下就要掛 `data-feat` 標記並在本表登記（預設 ⚪ 未排定）**，否則沒有標記的元素每個版本都會顯示，release2.4 預覽就會多出不在範圍的東西。

> 2026-10-07 改名：版本鍵 `next`（下一版預覽）改成 `release2.4`，tier 代號 `p1`→`release2.3`、`next`→`release2.4`。舊瀏覽器存著的 `next` 由 `devtools.js` 的 `VERSION_ALIAS` 直接對到 `release2.4`。

> 2026-09-23 退場：`p1`／`p1-next`／`p1-next-tbd`（Phase 1／2／3）與 `golive-4step`（其目標頁 `golive-4step/` 已一併刪除）。舊瀏覽器 devstate 若存著這些鍵或 2026-08-31 退場的 `home-canvas`，`devtools.js` 的 `load()` 會把未知鍵改寫成 `full`，`isFullBaseVersion()`／`fullVersion()` 兩份白名單因此不再需要兜底。

規則語法：`all` 全部可見｜`tier:release2.3,release2.4` 只顯示這些 tier 的功能｜`feat:S30`／`-feat:S30` 額外加入／排除特定功能｜`route:來源頁=目標` 把指向「來源頁」的連結改接到「目標」，並在你「已停在來源頁」（含直接輸入 URL、或切版本時正停在該頁）時把整頁換到目標；切回非此版本時，停在目標頁會自動導回來源頁（雙向、保留 query／hash）。特殊版用；標 `data-route-keep` 的連結不改接｜`page:原頁=變體` 換整頁。tier 對照取自下方各模組功能表的 Tier 欄（欄內的 release 編號優先，沒寫編號時 🟢＝release2.3、🔵＝release2.4、⚪＝tbd）；頁面元素需標 `data-feat="S30"` 才會被版本切換控制，外殼元素包多個功能時可寫逗號多值 `data-feat="S05,S06"`（任一在版本內即顯示）。`data-feat="full"` 是保留 gate，表示 scope 未列功能，只在 `all`／funding-test 顯示；整頁用 `data-page-feat`，低版本直連會回到 E-Shop。作用中分頁被版本藏掉時，cheat code 會自動切到第一個可見分頁。

**登入頁的自助註冊入口：已整段移除，待註冊規格補齊後再議（2026-08-04 使用者裁示）**。原本的登記是：規格 5.1.10 要求自助註冊入口 phase 1–3 完全不出現，上表三個 tier（🟢 Phase 1／🔵 Next／⚪ TBD）沒有一個能表達（⚪ TBD 在 Phase 3 就看得到），所以沿用保留 gate `data-feat="full"` 掛在 `login.html` F1 方式選擇底下的「還沒有帳號？註冊」那一列。**現況**：使用者裁示直接整段拿掉那一列，原型任何版本都不出現註冊入口，因此**本表不再登記任何 `full` gate 給註冊**——沒有對應元素的閘門只會誤導後續 session。等自助註冊真的要做時，連同上游規格一起補，再決定要用哪個閘門。`login.html` 整頁**不掛** `data-page-feat`、也不進 `js/devtools.js` 與 `js/sidebar.js` 的 `FULL_ROUTES` 清單——登入本身是 phase 1 能力（D170），各版本都要進得去。

**取貨管理三頁的頁級閘門（2026-08-11 修）**：`pickup.html`／`pickup-detail.html`／`scanner.html` 的 `data-page-feat` 原本停在 `full`，但 D157 已在 2026-07-30 把 O24–O30 併入 Phase 1，`sidebar.js` 與 `devtools.js` 的 `FULL_ROUTES` 當時也同步移除了這三頁。結果是 Phase 1 側欄看得到「取貨管理」、點下去卻被頁級閘門導回 E-Shop。三頁改標各自的功能編號（O24／O27／O29）後恢復正常。**教訓**：把一個模組併進低 tier 時，要同時掃三處——功能表的 Tier 欄、兩份 `FULL_ROUTES`、以及該模組每一頁的 `data-page-feat`。

**商店設定的 S05／S06 閘門在改版時掉了（2026-08-13 修）**：D184 把商店設定從彈窗改成獨立頁時，分區容器由 `[data-ss-panel]` 換成 `#sec-*`，重寫的 markup 沒把原本掛在付款與出貨上的 `data-feat="S05"`／`"S06"` 帶過去，Phase 1 因此看得到收款分頁與出貨預設卡。已補回三處：收款分頁（`[data-sec="payment"]`）、`#sec-payment` 整區、`#sec-selling` 裡的出貨那張卡（幣別那張不屬 S06，留著）。同一次改版還把 F7 商品規格的互動 JS 打斷了（它查的還是舊的 `[data-ss-panel="specs"]`，整段被開頭的 early return 擋掉、按鈕全部沒反應），一併改用 `#sec-specs`。**教訓**：換容器選擇器是全頁性的改動，要連 `data-feat` 閘門與所有靠選擇器綁事件的 JS 一起掃，不能只看畫面長得對不對。

**粉絲分級欄只在 Phase 4（2026-08-13 使用者裁示 / D187）**：電子商店商品清單與組合清單的「粉絲分級」欄（誰買得到）Phase 1–3 不出現。這一欄沒有規格出處（PG-021，2026-07-29 直接在原型上長出來的），所以歸「scope 未列」、走保留 gate `data-feat="full"`；欄頭與每一格另外標 `data-col="tier"`，`product-list.css` 用 `:has([data-col="tier"].ztd-ver-hidden)` 換掉整條欄寬——格線是固定軌數，只把格子藏起來會讓後面每一欄往左錯一格。

**Admin 平台層與帳戶設定列入 Phase 1（2026-09-24 使用者裁示／D324）**：Creator 管理（`creators.html`、`creator-detail.html`）、創作者活動管理（`admin-creator-events.html`）、影片上架審核（`admin-video-review.html`）、Admin IP Bank（`admin-ip-bank.html`、`admin-ip-bank-entry.html`）、IP Bank Reporting（`ip-bank-reporting.html`）、平台費率設定（`admin-platform-fees.html`）與帳戶設定（`settings.html`）拿掉頁級 `data-page-feat="full"`，並移出 `js/devtools.js`／`js/sidebar.js` 兩份 `FULL_ROUTES`——這些頁沒有 scope 功能編號，不掛閘門＝各版本都顯示。**平台優惠設定仍 Phase 4**（D279），頁級閘門與兩份清單照舊（devtools 那份補登，兩份才一致）。頁內指向 Phase 4 模組的連結（活動詳情、IP 詳情、平台優惠等）由 route gate 照常在低版本藏起來。Admin 頁的 logo 在低版本也回名冊（`sidebar.js` 的 `applyVersionRoutes`）。

**平台忠誠點數設定的上線階段未定（2026-10-02 D347）**：Admin 第 8 個同層目的地 `admin-platform-loyalty.html`（規格 5.1.0.8）屬哪一期交付〔產品待確認〕（主規格 §8.29 第 16 項），所以登記為 S65 ⚪ 未排定：頁級 `data-page-feat="S65"`，並比照平台優惠設定放進 `js/sidebar.js`／`js/devtools.js` 兩份 `FULL_ROUTES`——「下一版預覽」看不到側欄入口、直連會導回 E-Shop，最終版照常顯示。分級設定新增的各購買品項的份量與互動推薦每 90 天最多得分掛 S66（⚪ 未排定）；所在的 `fans-crm.html` 本身是頁級 `full`，兩層閘門一致。上線階段定案後只改本表 Tier 欄，必要時移出兩份 `FULL_ROUTES`。

**平台滿額折扣與平台優惠碼是全平台協定（2026-09-15 D273／D277）**：Admin 平台優惠設定頁（`admin-platform-promotions.html`，原 `admin-platform-discounts.html`）與其他 Admin 目的地一樣不受開發版本 gate；創作者端沒有對應開關，只在訂單詳情看到「平台滿額折抵」扣項列（D274）。整頁 Phase 4（D279）。

**優惠碼 Phase 1 只有期間、%／固定、全部或指定商品（2026-09-17 D279；2026-09-22 D299 把「指定商品」放寬成可多選、含活動票種）**：Phase 1 的藝人商店優惠碼只留三組欄位——生效期間、折扣型態（百分比或固定金額）、適用範圍（全部商店，或指定商品**可多選**：單售、組合包、活動票種；不選類型層）；碼字串本身當然也有（8–20 英數字、比對不分大小寫）。`store-settings.html` 優惠碼彈窗裡，**類型樹**、每張訂單可折件數／每人總次數／總兌換次數三格、固定金額折法、可與其他優惠碼疊加，一律掛 `data-feat="full"`（使用次數三格連同標籤包一個容器一起掛，固定金額折法與疊加開關各自的既有 `hidden`／JS 顯隱照常，閘門與 hidden 兩道各管各的）。Phase 1 的適用範圍是一組 `data-feat-off="full"` 的 `radio-list`（全部商店／指定商品（可多選））；**指定商品的多選 combobox（`#ss-scope-combo`）自 D299 起不掛任何閘門**——它坐在 Phase 4 那組（`data-feat="full"`）與 Phase 1 那組之外、兩個版本共用，何時露出由頁面 JS 依「哪一組看得見」算，候選同一份（`ProductsStore.all()`＋`bundles()`＋`ztorEvents.list()` 的票種）。清單同步：「已用」欄的「/ 上限」只在有次數上限時才有意義，包一個 `data-feat="full"` 的 span；LAUNCH50（已用完狀態）整列 `data-feat="full"`（Phase 1 沒有次數上限，不會有「已用完」）；「範圍」欄的混選示意（AIKO10「服飾＋2 件商品」）與 Phase 1 的單商品示意（「26MS Hoodie」）用 `data-feat`／`data-feat-off` 成對切換；TOURVIP15（指定多件含票種）無 gate、各版本都有。**平台優惠設定（5.1.0.7）整頁 Phase 4**，見上一段。

**代理優惠碼只在 Phase 4（2026-08-13 使用者裁示 / D185）**：商店設定的優惠碼分頁（S51）各版本都有，但「代理」這一支——彈窗裡的型別切換整列、推廣者與分成欄位、代理銷售紀錄，以及清單裡的代理碼示範列——Phase 1–3 都不出現。三個 tier 沒有一個能表達「只在 Phase 4」，所以沿用保留 gate `data-feat="full"`（同註冊入口那次的做法）。分頁開場白因此做成 `data-feat="full"`／`data-feat-off="full"` 成對：full 版講兩種碼的差別，低版本只講折扣本身；清單裡「自用」那個 meta 標籤也一起收起來——沒有第二種碼時，標它是自用只是廢話。彈窗預設就是以自用開場（`openModal('own', …)`），所以切換列藏掉不影響行為。

**商品專屬尺寸指南只在 Phase 4（2026-08-20 使用者裁示 / D213）**：建立商品 → 商品資訊 → 尺寸指南的「改用專屬指南」按鈕，以及按下去之後那一列「使用專屬尺寸指南」，Phase 1–3 都不出現（`create-product.html` 兩處 `data-feat="full"`）。這個能力是 D211 當天長出來的，功能表沒有它的編號，三個 tier 沒有一個能表達「只在 Phase 4」（⚪ TBD 在 Phase 3 就看得到），所以走保留 gate——同註冊入口（2026-08-04）與代理優惠碼（D185）那兩次。低版本那一格仍然看得到「沿用商店的尺寸指南」與目前有哪幾份，只是沒有覆寫的路。**商店層的尺寸指南設定（5.1.5.5 F7）不掛 gate**：各版本都要能把店裡的指南建起來。

**data-feat 標註現況（2026-07-14 全面切割）**：S05/S06 商店設定付款·出貨、S11 拍賣入口/頁級、S24 專案引用卡、S45 組合限量、O04/O09 已取消／爭議 KPI·篩選、O17/O18/O22/O23 訂單詳情升級功能、E08/E09/E13–E18/E20/E22/E23/E24 收入與提款功能皆有 gate。scope 未列的產品頁以 `data-page-feat="full"` 限為 Phase 4；跨頁連結在低版本隱藏。S31.1 保持 `data-feat`／`data-feat-off` 成對切換。

---

## S · 商店管理 — Shop Management

ID 起始 `S01…` ｜ 🟢 46 · 🔵 2 · ⚪ 14 · ⚫ 退場 3

| ID    | 功能                              | English                                          | Tier       | Build    | 備註                                                        |
| ----- | ------------------------------- | ------------------------------------------------ | ---------- | -------- | --------------------------------------------------------- |
|       | **通用功能**                        | Common                                           |            |          |                                                           |
| `S01` | 　頂部庫存預警提示條                      | Low-stock alert bar                              | 🟢 release2.3 | ✅ built  |                                                           |
| `S02` | 　篩選                             | Filter                                           | 🟢 release2.3 | ✅ built  |                                                           |
| `S03` | 　商店設定                           | Store settings                                   | 🟢 release2.3 | ✅ built  |                                                           |
| `S04` | 　　編輯封面 / 頭像 / 名稱 / 連結 / 描述 / 幣種 | Edit cover/avatar/name/URL/desc/currency         | 🟢 release2.3 | ✅ built  |                                                           |
| `S05` | 　　付款設定                          | Payment settings                                 | 🔵 release2.4    | ✅ built  | Stripe status read-only; details TBD                      |
| `S06` | 　　出貨設定（出貨地址、免運門檻）               | Shipping defaults (address, free-ship threshold) | 🔵 release2.4    | ✅ built  | config fields only — no carrier integration               |
| `S07` | 　　粉絲預覽視角                        | See-as-fan preview                               | 🟢 release2.3 | ✅ built  |                                                           |
| `S08` | 　商店預覽頁面                         | Store preview                                    | 🟢 release2.3 | ✅ built  |                                                           |
|       | **　建立 商品 / 組合 / 拍賣**            | Create product / bundle / auction                |            |          |                                                           |
| `S09` | 　　建立商品（入口）                      | Create product entry                             | 🟢 release2.3 | ✅ built  |                                                           |
| `S10` | 　　建立組合（入口）                      | Create bundle entry                              | 🟢 release2.3 | ✅ built  |                                                           |
| `S11` | 　　建立拍賣（入口）                      | Create auction entry                             | ⚪ TBD      | ✅⬆ ahead | auctions deferred                                         |
|       | **商品**                          | Products                                         |            |          |                                                           |
| `S12` | 　商品列表                           | Product list                                     | 🟢 release2.3 | ✅ built  |                                                           |
| `S13` | 　　排序                            | Sort                                             | 🟢 release2.3 | 🟡 gap   |                                                           |
| `S14` | 　　欄位（圖片/名稱/分類/價格/狀態/庫存）         | Columns                                          | 🟢 release2.3 | ✅ built  |                                                           |
|       | **　　狀態**                        | Statuses                                         |            |          |                                                           |
| `S15` | 　　　已上架（上架／顯示／開賣三開關、編輯）           | Listed (three switches, edit)                    | 🟢 release2.3 | ✅ built  | 2026-09-03 D241：單一「上架」開關拆成上架／顯示／開賣三開關，見主規格 §7.14 |
| `S16` | 　　　已隱藏                          | Hidden                                           | 🟢 release2.3 | ✅ built  |                                                           |
| `S17` | 　　　庫存過低                         | Low stock                                        | 🟢 release2.3 | ✅ built  |                                                           |
| `S18` | 　　　補貨流程（數量/供應商/到貨日/備註/確認）       | Restock flow                                     | 🟢 release2.3 | ✅ built  |                                                           |
| `S19` | 　　　已售完                          | Sold out                                         | 🟢 release2.3 | ✅ built  | status shown; exact UI TBD                                |
| `S20` | 　　　草稿                           | Draft                                            | 🟢 release2.3 | ✅ built  |                                                           |
| `S21` | 　　商品詳情 / 編輯                     | Product detail / edit                            | 🟢 release2.3 | ✅ built  |                                                           |
| `S22` | 　　　顯示狀態 / 分類                    | Show status/category                             | 🟢 release2.3 | ✅ built  |                                                           |
| `S23` | 　　　銷售摘要（件數/毛收/淨利 → 收入管理）        | Sales summary                                    | 🟢 release2.3 | ✅ built  | reads from Earnings minimum                               |
| `S24` | 　　　被專案引用（引用列表 / 前往專案）           | Referenced by project                            | ⚪ TBD      | ✅⬆ ahead | needs project/crowdfund module                            |
| `S25` | 　　　以粉絲身份預覽                      | See-as-fan preview                               | 🟢 release2.3 | ✅ built  |                                                           |
| `S26` | 　建立商品                           | Create product                                   | 🟢 release2.3 | ✅ built  |                                                           |
| `S27` | 　　展示圖（主圖 / 副圖）                  | Media (main/sub)                                 | 🟢 release2.3 | ✅ built  |                                                           |
| `S28` | 　　商品資訊（名稱/描述/分類/規格）             | Info                                             | 🟢 release2.3 | ✅ built  |                                                           |
| `S29` | 　　商品規格（單一 / 多規格）                | Variants (single/multi)                          | 🟢 release2.3 | ✅ built  |                                                           |
| `S30` | 　　定價（價格 / 原價 + 爆米花價）            | Pricing + POPCORN price                          | 🟢 release2.3 | 🟡 gap   | POPCORN price is net-new                                  |
| `S31` | 　　庫存（不限量 / 限量 + 低庫存提醒）          | Inventory                                        | 🟢 release2.3 | ✅ built  |                                                           |
| `S31.1` | 　　　低庫存門檻自訂（逐商品／逐規格，覆寫預設 10%） | Custom low-stock threshold                | 🔵 release2.4   | ✅ built  | 已建 create-product／product-detail 自訂門檻輸入，cheat code「版本」以 `data-feat="S31.1"`／`data-feat-off` 控制（release2.3 隱藏＝固定 10%、release2.4 起顯示可編輯）；逐規格粒度未做（spec §8）。spec §7.2／D105 |
| `S32` | 　　多規格價格與庫存（SKU / 成本）            | Variant matrix (SKU/cost)                        | 🟢 release2.3 | ✅ built  |                                                           |
|       | **　　取貨方式**                      | Fulfillment method                               |            |          |                                                           |
| `S33` | 　　　物流配送（重量/分類/尺寸/寄件地）           | Logistics fields                                 | 🟢 release2.3 | ✅ built  | data entry only — no carrier API                          |
| `S34` | 　　　現場 QR 領取（領取說明）               | On-site QR pickup                                | 🟢 release2.3 | ✅ built  |                                                           |
| `S35` | 　　購買限制與標籤（每人限購 / 標籤）            | Purchase limit & tags                            | 🟢 release2.3 | ✅ built  |                                                           |
| `S36` | 　　預覽 / 上架開賣                     | Preview & publish                                | 🟢 release2.3 | ✅ built  |                                                           |
| `S37` | 　　稍後再存（草稿）                      | Save draft                                       | 🟢 release2.3 | ✅ built  |                                                           |
| `S38` | 　　開始售賣                          | Start selling                                    | 🟢 release2.3 | ✅ built  |                                                           |
| `S39` | 　　　發布貼文（標題/內容/收件對象/排程）          | Product-drop social post                         | 🟢 release2.3 | ✅ built  | reuses Ztor's existing social-post feature — no new build |
|       | **組合**                          | Bundles                                          |            |          |                                                           |
| `S40` | 　組合包列表（欄位 / 狀態）                 | Bundle list                                      | 🟢 release2.3 | ✅ built  |                                                           |
| `S41` | 　建立組合包                          | Create bundle                                    | 🟢 release2.3 | ✅ built  |                                                           |
| `S42` | 　　組合包名稱                         | Name                                             | 🟢 release2.3 | ✅ built  |                                                           |
| `S43` | 　　商品（新增 / 近期預覽）                 | Items                                            | 🟢 release2.3 | ✅ built  |                                                           |
| `S44` | 　　定價（固定價 / 折扣價）                 | Pricing (fixed/% off)                            | 🟢 release2.3 | ✅ built  |                                                           |
| `S45` | 　　限量                            | Quantity limit                                   | ⚪ TBD      | ✅⬆ ahead |                                                           |
| `S46` | 　　發布貼文                          | Publish post                                     | 🟢 release2.3 | ✅ built  | reuses Ztor's existing social-post feature                |
| `S47` | 　組合包詳情 / 編輯                     | Bundle detail / edit                             | 🟢 release2.3 | ✅ built  |                                                           |
| `S48` | 　　銷售摘要                          | Sales summary                                    | 🟢 release2.3 | ✅ built  | reads from Earnings                                       |
| `S49` | 　　庫存與成員影響（各成員可售量取最小，鎖定量優先）       | Stock = min(member sellable)                     | 🟢 release2.3 | ✅ built  | 2026-09-03 D241：取代舊「= 最少成員」，成員有鎖定用鎖定量、沒鎖定用沒有被鎖定的庫存量，見主規格 §7.14 |
| `S50` | 　　以粉絲身份預覽                       | See-as-fan preview                               | 🟢 release2.3 | ✅ built  |                                                           |
| `S51` | 　商店優惠碼（清單／新增／編輯／期間／停用）           | Store discount codes                             | 🟢 release2.3 | ✅ built  | D183；2026-09-15 D272 補範圍三級、每單件數／每人總次數／總兌換、已用完；2026-09-17 D279 Phase 1 只留期間／折扣／範圍；2026-09-22 D299 Phase 1 指定商品改可多選含票種、碼不分大小寫。自用碼各版本皆有；代理碼（推廣者／分成／代理銷售紀錄）只在 Phase 4，走保留 gate `full`（D185） |
|       | **活動（建立活動／活動詳情）**                 | Events (create / detail)                         |            |          | 2026-09-29 補登（D328）：這幾列登記活動模組內的個別元素。2026-10-07 release2.4 切割：活動清單／活動詳情／建立活動三頁改頁級 `data-page-feat="S72"`（🔵 release2.4），建立活動只留 bookyay 帶入（S73），其他建立方式與周邊功能見 S74–S78；bookyay 帶入會填寫的欄位（S52／S53／S56／S58／S59／S67）一起改 🔵 release2.4 |
| `S52` | 　活動語言複選（七選項）                     | Event languages (multi-select)                   | 🔵 release2.4| ✅⬆ ahead | D328；create-event 步驟 2 `[data-ce-lang-field]`；bookyay 帶入多值鎖定；2026-09-30 D340 改下拉複選（Zselect `--multi`）、必填至少 1 種 |
| `S53` | 　跨日活動（場次結束日期）                    | Multi-day date (end date)                        | 🔵 release2.4| ✅⬆ ahead | D328；create-event 步驟 3 與 event-detail 場次盒 `[data-sess-md-group]` |
| `S54` | 　門票簡介                            | Ticket description                               | ⚫ 退場      | ✅⬆ ahead | 2026-10-05（D353）已退場——撤銷 D328 決定二：bookyay「活動門票簡介」不帶入，單張門票彈窗的門票簡介整欄移除（create-event／event-detail／粉絲頁票列／翻譯表同輪拿掉）。原註： D328；單張門票彈窗基本區（create-event／event-detail）；可翻譯 |
| `S55` | 　門票顯示／隱藏                         | Ticket show / hide                               | ⚪ TBD      | ✅⬆ ahead | D328；單張門票彈窗顯示開關＋卡片「隱藏」標示；隱藏的票不在粉絲頁票價清單；2026-09-29 D329 補充／D330：發布後隱藏或刪除最後一張顯示中的門票、停售最後一組組合包，造成沒有可賣的東西時擋下（可賣性防呆）；2026-09-29 D331：下架、隱藏、封存最後一組仍在販售的組合包也擋（組合商品細節頁開關旁紅字 `#bd-list-stop-err`／`#bd-shown-stop-err`、頁首與電子商店清單列純告知彈窗），草稿不擋、售罄不擋 |
| `S56` | 　bookyay 帶入欄位規則（套票轉 1 人票＋組合包、只帶第一種票提示、早鳥轉折扣、跨日） | bookyay field mapping                | 🔵 release2.4| ✅⬆ ahead | D328／5.1.6.1 F21；略過提示 `#ce-bky-skip-note`；2026-09-29 D329：地點→場地名稱、地區→完整地址、1:1 原圖提示 `#ce-img-ratio-note`、早鳥分流並鎖定、自動組合包整組鎖定（限時折扣讀數與鎖定說明同掛 S56）；2026-09-29 D330：帶入金額換算成創作者幣別當基準價、價格表港幣欄鎖 bookyay 原價、其他幣別可覆寫；自動組合包不能刪除、不能加商品；2026-09-29 D331：創作者自建、含 bookyay 票券的組合包港幣欄依公式鎖定（建立活動、建立組合、在地化三處價格表）、清單與 KPI 用覆寫值、草稿活動刪除時自動組合包連動刪除（活動清單草稿列 `khh-countdown-draft`） |
| `S57` | 　說明區塊（標題＋內文，可增刪、可排序）           | Info sections                                    | ⚫ 退場      | ✅⬆ ahead | 2026-10-05（D354）已退場——說明區塊整組由描述的無標題文字區塊取代（見 S67），`partials/info-sections.js`／`info-sections.css` 留墓碑。原註： D334；create-event 步驟 2 描述下方 `[data-feat="S57"]`、event-detail 活動內容同一支（`partials/info-sections.js`）；取代已刪的「進階詳細資料」兩份清單；可翻譯（標題與內文各一格）；粉絲活動頁呈現暫不做（ASSUMPTIONS UIA-186） |
| `S58` | 　描述的圖片與影片區塊（插入、刪除；整份最多 10 個；bookyay 帶入保留） | Description media blocks | 🔵 release2.4| ✅⬆ ahead | D354（2026-10-05）：圖片與影片各自成一個區塊、排在插入它的文字區塊之後，上限改為整份描述合計 10 個；插入鈕群組 `.rich-body__ins[data-feat="S58"]`。前身 D335；`partials/rich-body.js` 的「插入圖片／插入影片」列掛 `[data-feat="S58"]`（create-event 描述、說明區塊內文，event-detail 同一支）；bookyay 活動詳情的圖片影片照段落帶入；翻譯表只列文字；粉絲活動頁描述下方最小呈現（ASSUMPTIONS UIA-187） |
| `S59` | 　描述文字區塊的格式：粗體、斜體、連結、清單、分隔線（bookyay 帶入保留格式） | Description text formatting                      | 🔵 release2.4| ✅⬆ ahead | D354（2026-10-05）補斜體、連結（只收 http／https、新分頁開啟）、分隔線；前身 D340；`partials/rich-body.js` 格式鈕群組 `.rich-body__fmt[data-feat="S59"]`（create-event 描述＋說明區塊、event-detail 描述＋說明區塊） |
| `S60` | 　粉絲活動頁呈現說明區塊（關於活動下方、太長收合）        | Info sections on the fan event page              | ⚫ 退場      | ✅⬆ ahead | 2026-10-05（D354）已退場——粉絲頁不再另畫說明區塊，描述的區塊照順序畫在「關於活動」（`.pdp-details__lead`）。原註： D340；`js/fan-event-page.js` `.pdp-info[data-feat="S60"]`（create-event 第 8 步、event-localization 預覽） |
| `S61` | 　活動顯示設定（顯示／隱藏＋隱藏時活動連結）            | Event display setting (shown / hidden + link)    | 🔵 release2.4| ✅⬆ ahead | D340；create-event 步驟 7、event-detail 設定 → 發布設定的「顯示設定」區塊 `[data-feat="S61"]`；2026-10-07 使用者指出 release2.4 的發布設定看不到顯示與隱藏，改 🔵 release2.4；同日 D363：售票中／進行中顯示設定仍可切換，活動隱藏時含其票券的組合包跟著隱藏（bundle-detail `[data-bd-event-hidden-lock]`、create-bundle `[data-cb-tshown-lock]` 同掛 S61）。 |
| `S62` | 　活動販售的時間層級＋票務商品上架與開賣跟隨／另設 | Event sales time layers + ticket-bundle follow / custom times | 🔵 release2.4| ✅⬆ ahead | D342；create-event 第 7 步售票期間紅字 `[data-ce-tl-err]`、第 5 步限時間紅字、第 6 步「上架與開賣」段；bundle-detail／create-bundle 含票券成員時的 `[data-tb-host]`；event-detail 開賣設定紅字 `[data-ed-tl-err]`；共用 `js/ticket-bundle.js`＋Follow field；2026-10-07 使用者重申「票務有提前販售時間時，定時上架不可晚於該時間」，改 🔵 release2.4；create-event 上架日期與時間下方新增紅字 `[data-ce-tl-err="list-from"]`（指出最早一筆販售時間）；同日 D363：販售結束不晚於活動停售（`js/ticket-bundle.js` `lateEnd()`）。 |
| `S63` | 　票務商品的購買條件與限購（預設取最嚴、只能收窄） | Ticket-bundle purchase rules & limits | ⚪ TBD      | ✅⬆ ahead | D342；create-event 第 6 步「購買條件與限購」段、bundle-detail `[data-tb-rules-sec]`、create-bundle 預設讀數 `[data-tb-host="cb-rules"]` |
| `S64` | 　建立活動第 6 步補齊的組合包欄位（素材、電影關聯、限時折扣、優惠碼疊加、逐票種分配） | Ticket-bundle fields in create-event step 6 | ⚪ TBD      | ✅⬆ ahead | D342／5.1.6.1 F20；`js/bundle-editor.js` SPLIT 的 `[data-feat="S64"]` 區塊 |
|       | **活動 release2.4 切割（2026-10-07）**          | Events — release2.4 slice                        |            |          | 使用者指示：release2.4 主要只交付「由 bookyay 帶入活動來建立」，其他建立方式先隱藏，看過切割畫面再調整 |
| `S72` | 　活動模組頁面（活動清單、活動詳情、建立活動）            | Events pages (list, detail, create)              | 🔵 release2.4 | ✅⬆ ahead | events.html／event-detail.html／create-event.html 頁級 `data-page-feat="S72"`；已從 `js/devtools.js`／`js/sidebar.js` 兩份 `FULL_ROUTES` 移出，側欄「活動」在 release2.4 出現 |
| `S73` | 　由 bookyay 帶入建立活動（搜尋 bookyay 活動→帶入→鎖定欄位） | Create an event by importing from bookyay       | 🔵 release2.4 | ✅⬆ ahead | create-event 第 1 步選類型後的 bookyay 帶入關卡 `[data-bgate]`／`#ce-bky-go`；Admin 創作者活動「繼續設定」帶 `?import=` 直接進入。只登記、不掛標記（關掉會沒有建立路徑） |
| `S74` | 　手動建立活動（略過 bookyay、切換活動類型）          | Create an event manually (skip bookyay)          | ⚪ TBD      | ✅⬆ ahead | create-event `#ce-bky-skip`「略過」、步驟頁頭的切換類型鈕 `#ce-type-switch`（切換後不再經過 bookyay 關卡） |
| `S75` | 　Watch Party 活動類型                    | Watch Party event type                           | 🔵 release2.4| ✅⬆ ahead | create-event 類型卡 `[data-gate-type="watchparty"]`；Watch Party 不經 bookyay、只能手動建立；2026-10-07 使用者裁示 release2.4 保留 |
| `S79` | 　其他線下活動類型入口（見面會、音樂節、發表會、線上活動） | Other offline event type entries | ⚪ TBD      | ✅⬆ ahead | create-event 類型卡 `[data-gate-type="meet|festival|launch|virtual"]`；這四類的建立表單與演唱會相同（只有 Watch Party 走專屬分支），release2.4 只留演唱會一個入口（2026-10-07 使用者裁示） |
| `S80` | 　條款與細則：直接促銷同意開關（接受主辦者用於直接促銷＋行銷同意文字） | Consent to direct marketing | ⚪ TBD      | ✅⬆ ahead | D340；create-event 步驟 2「條款與細則」的第一組 `.control-group[data-feat="S80"]`；release2.4 只留「條款及細則」開關（2026-10-07 使用者裁示）；2026-10-07 D362 起 event-detail 活動內容的「條款與細則」（`#ed-terms`）同一組也掛 S80 |
| `S76` | 　複製活動／再辦一次                         | Duplicate / run it again                         | ⚪ TBD      | ✅⬆ ahead | events.html 列選單「Duplicate」×50、event-detail `[data-ed-duplicate]`（頁首＋結束後總覽卡）；兩者都是不經 bookyay 的建立方式 |
| `S77` | 　舊版建立流程（對照用備份頁）                   | Create event (old flow)                          | ⚪ TBD      | ✅⬆ ahead | events.html 建立鈕下拉第二項 → create-event-legacy.html（該頁本身仍是頁級 `full`） |
| `S78` | 　活動預覽與在地化                          | Event preview & localization                     | ⚪ TBD      | ✅⬆ ahead | event-detail 頁首 `[data-ed-localize]`、設定子分頁「在地化」與其面板；event-localization.html 本身仍是頁級 `full` |
| `S81` | 　Admin 手動下架活動＋「已下架」徽章 | Admin unlists an event + Unlisted badge | ⚪ TBD      | ✅⬆ ahead | D361 決定五（2026-10-07）：event-detail 設定分頁 `#ed-unlist`（Admin 代管態才能按，創作者視角停用）、頁首 `#ed-unlisted-badge`；events.html 清單列狀態欄注入的 `[data-ev-unlisted]` 徽章。上架是階段以外的維度，下架不改階段 |
| `S82` | 　購票規則的粉絲分級條件（限粉絲分級購買、粉絲分級折扣、限時＋限粉絲分級折扣） | Fan-tier purchase conditions (fan tier only, fan tier discount, limited-time fan tier discount) | ⚪ TBD      | ✅⬆ ahead | D366 決定五／D367 決定三（2026-10-07）：create-event 購票規則「新增條件」選單的三個選項 `[data-cond-add][data-feat="S82"]` 與已加的條件卡 `.cond-list__item[data-feat="S82"]`（活動層票務設定彈窗、單張門票彈窗）；選單是 JS 畫的，畫完呼叫 `ztorDevState.regate()` 重跑 data-feat、換版本時重畫。其餘四種條件（限時購買、限購、折扣、限時折扣）隨 S72 進 release2.4 |
|       | **粉絲忠誠點數（D347，2026-10-02）**                 | Loyalty points scoring model                    |            |          | 規格 5.1.0.8（新頁）、5.1.7.6 F3；計分規則本體在主規格 §7.5。編號沿用 S 段（devtools 只解析 `S`／`O`／`E`／`B` 開頭的 ID），與活動段 S52–S64 同一做法 |
| `S65` | 　平台忠誠點數設定（Admin 第 8 個同層目的地：全站活動給分與上限、賽季加倍週、衰減與等級保留、平台常數唯讀、修改紀錄） | Platform Loyalty Settings (Admin) | ⚪ TBD      | ✅ built  | D347／5.1.0.8 F1–F6；上線階段〔產品待確認〕（主規格 §8.29 第 16 項）。`admin-platform-loyalty.html` 頁級 `data-page-feat="S65"`，並比照平台優惠設定登記進 `js/sidebar.js`／`js/devtools.js` 兩份 `FULL_ROUTES`（低版本藏側欄入口、直連導回） |
| `S66` | 　分級設定的計分設定：各購買品項的份量（5 項）與互動推薦每 90 天最多得分（4 項） | Tier settings: purchase type value & max points per 90 days | ⚪ TBD      | ✅ built  | D347／5.1.7.6 F3.2–F3.3；`fans-crm.html` 分級設定彈窗「計分設定」分頁與 `tier-settings.html` 備份頁的兩組 `[data-feat="S66"]`。四類各類行為的份量（預設改 1.0）與「外部平台訊號本版暫不計入」屬既有分級設定，不掛本編號 |
| `S67` | 　描述區塊（無標題文字區塊：新增描述、拖動排序、刪除） | Description blocks (add, reorder, remove) | 🔵 release2.4| ✅⬆ ahead | D354（2026-10-05）；`partials/rich-body.js` 的「新增描述」鈕 `[data-feat="S67"]`（create-event 步驟 2、event-detail 活動內容）；把手拖動／上下鍵排序、區塊刪除隨區塊本身；取代退場的 S57 說明區塊 |
|       | **潛在買家需求看板與服飾配件分類（D360，2026-10-05）** | Demand board & apparel taxonomy | | | 規格 5.1.5.16（新頁）、主規格 §7.1／§7.16／§7.17、§8.30（25 項待確認）；算法唯一定義處 §7.17。編號沿用 S／O 段（devtools 只解析 `S`／`O`／`E`／`B` 開頭的 ID），與活動段 S52–S67 同一做法 |
| `S68` | 　需求看板頁（E-Shop 第四個導覽目的地：篩選、摘要指標、市場需求表、計畫生產量與差距、資料不足與參考同類商品、資料來源說明） | Demand board page | ⚪ TBD      | ✅ built  | D360／5.1.5.16 F1–F5；整頁 `data-page-feat="S68"`，並登記進 `js/sidebar.js`／`js/devtools.js` 兩份 `FULL_ROUTES`（低版本藏側欄入口、直連導回）；資料與算法在 `js/demand-store.js`（示範資料）。上線階段〔產品待確認〕 |
| `S69` | 　商品層需求數據入口（商品細節頁開彈窗，看該商品自己的需求數據） | Product-level demand data entry | ⚪ TBD      | ✅ built  | D360／5.1.5.1 §2.19；與看板同一口徑（`ztorDemand.productSlice`）；入口適用範圍（草稿、數位商品）〔產品待確認〕（§8.30 第 17 項） |
| `S70` | 　服飾配件大類→次分類、適用對象、系統屬性＋自訂規格（建立商品、商品細節） | Apparel category, department & system attributes | ⚪ TBD      | ✅ built  | D360／5.1.5.2 F2、5.1.5.1 §2.6；13 大類、次分類、屬性清單在 `js/apparel-taxonomy.js`，商品記錄欄位見 `js/products-store.js`（group／category／subCategory／audience／attrs／customSpecs）；屬性值域與適用大類、既有商品遷移〔產品待確認〕（§8.30 第 8–10 項） |
| `S71` | 　尺寸顏色快捷預設擴充與自行輸入（建立商品選項建構器、商品細節選項） | Size & colour preset chips + custom values | ⚪ TBD      | ✅ built  | D360（修訂 D249）／5.1.5.2 F3.1、5.1.5.1 §2.8；標準清單在 `js/apparel-taxonomy.js` 的 sizes／colours；清單內容與色號〔產品待確認〕（§8.30 第 6 項）；自行輸入的尺寸跨商品歸「其他尺寸」 |

## O · 訂單管理 — Order Management

ID 起始 `O01…` ｜ 🟢 25 · 🔵 2 · ⚪ 3 · ⚫ 退場 2

| ID | 功能 | English | Tier | Build | 備註 |
|---|---|---|---|---|---|
| `O01` | 資料統計 | KPI stats | 🟢 release2.3 | ✅ built |  |
| `O02` | 　待出貨 | To ship | 🟢 release2.3 | ✅ built |  |
| `O03` | 　待處理 | Pending | 🟢 release2.3 | ✅ built |  |
| `O04` | 　已取消 / 爭議 | Cancelled / dispute | ⚪ TBD | ✅⬆ ahead | 2026-09-09（D253）：由「退款 / 爭議」更名——平台不提供退款動作，KPI 改計已取消／爭議 |
| `O05` | 　已完成 · 30天 | Completed · 30d | 🟢 release2.3 | ✅ built |  |
| `O06` | 匯出 | Export | 🟢 release2.3 | ✅ built |  |
| `O07` | 搜尋訂單 | Search orders | 🟢 release2.3 | ✅ built |  |
| | **狀態列** | Status filter | | | |
| `O08` | 　全部 / 待付款 / 已付款 / 待出貨 / 已出貨 / 已完成 | All → Completed | 🟢 release2.3 | ✅ built | 原文「代付款」為筆誤，依規格 Unpaid＝待付款更正 |
| `O09` | 　已取消 / 爭議 | Cancelled / dispute | ⚪ TBD | ✅⬆ ahead | 2026-09-09（D253）：由「退款 / 爭議」更名，篩選新增獨立 Disputed tab |
| `O10` | 訂單列表欄位 | Order list fields | 🟢 release2.3 | ✅ built |  |
| `O11` | 訂單詳情 | Order detail | 🟢 release2.3 | ✅ built |  |
| | **　內容** | Content | | | |
| `O12` | 　　狀態 / 收入結算 | Status / settlement | 🟢 release2.3 | ✅ built |  |
| `O13` | 　　訂單商品列表 | Line items | 🟢 release2.3 | ✅ built |  |
| `O14` | 　　金額（商品 / 運費 / 平台費 / 支付費 / 淨額） | Amounts incl. platform fee | 🟢 release2.3 | ✅ built |  |
| `O15` | 　　在收入管理檢視 | View in Earnings | 🟢 release2.3 | ✅ built | link to Earnings minimum |
| `O16` | 　　買家資訊（名稱 / 地址 / 聯絡方式） | Buyer info | 🟢 release2.3 | ✅ built |  |
| `O17` | 　　檢視粉絲記錄 | View fan record | 🔵 release2.4 | ✅⬆ ahead | Fans CRM module out of scope |
| | **　功能** | Actions | | | |
| `O18` | 　　退款 | Refund | ⚫ 退場 | 🟡 gap | 2026-09-09（D253）已退場——平台不提供任何退款動作，取消訂單品項的唯一路徑改為 O31 作廢 |
| `O19` | 　　標記出貨 / 履約 | Mark shipped / fulfillment | 🟢 release2.3 | ✅ built |  |
| `O20` | 　　　物流配送（物流商 / 追蹤碼 / 標記出貨） | Logistics (manual) | 🟢 release2.3 | ✅ built | manual entry — no carrier API |
| `O21` | 　　　QR 領取（二維碼 / 標記已領取） | QR pickup | 🟢 release2.3 | ✅ built |  |
| `O22` | 　　　數位（下載） | Digital download | 🔵 release2.4 | ✅⬆ ahead | digital goods deferred |
| `O23` | 　　退款與爭議（部分 / 整單退款） | Refund & dispute | ⚫ 退場 | 🟡 gap | 2026-09-09（D253）已退場——平台不提供任何退款動作 |
|       | **　取貨管理（Pickup Management）** — 2026-07-03 新增模組（D111），2026-07-30 併入 Phase 1（D157） | Pickup management |            |          |                                          |
| `O24` | 　取貨管理入口（E-Shop 下拉第三個目的地）     | Pickup management entry          | 🟢 release2.3 | ✅ built | 規格 5.1.5.11 |
| `O25` | 　　取貨場次清單（篩選 / 搜尋 / 分批載入）     | Pickup session list              | 🟢 release2.3 | ✅ built | 5.1.5.11 F4 |
| `O26` | 　　建立取貨場次                          | Create pickup session            | 🟢 release2.3 | ✅ built | 5.1.5.12 |
| `O27` | 　　取貨場次詳情（名單 / 核銷紀錄 / 匯出）     | Pickup session detail            | 🟢 release2.3 | ✅ built | 5.1.5.15；名單一列一領取單位（D240） |
| `O28` | 　　Scanner URL 與密碼（交付 / 生命週期）    | Scanner URL & password           | 🟢 release2.3 | ✅ built | 5.1.5.15 F2 |
| `O29` | 　　手機 Scanner 掃碼核銷（二元核銷）        | Mobile scanner redemption        | 🟢 release2.3 | ✅ built | 5.1.5.14；二元核銷、一碼一件（D122／D240） |
| `O30` | 　　活動票券共用核銷（回寫 Events check-in）  | Event ticket redemption          | 🟢 release2.3 | ✅ built | 5.1.5.14 F2；票券狀態仍以 Events 為來源 |
| `O31` | 　　作廢品項（Admin 專屬、取貨型）           | Void item (admin only)           | 🟢 release2.3 | ✅ built | 2026-09-07 上游拍板列入 eShop 2.2；creator 態可見但停用（§4.4）；出貨型／數位待產品確認（§8.27） |
| `O32` | 　　平台費展開（依費率葉節點列出計費基準與平台費） | Platform fee breakdown | 🟢 release2.3 | ✅ built | 2026-09-29（D333）；同日使用者裁示列入 Phase 1；`order-detail.html` 平台費列的展開把手與展開列掛 `data-feat="O32"`；支付費不展開 |
| `O33` | 　　收件國家與城市（買家卡的兩個欄位，完整地址保留；沒值顯示未提供地區） | Shipping country & city | ⚪ TBD      | ✅ built  | D360／5.1.5.3.1 §2.4；資料層 `js/orders-store.js` 的 buyer.country（ISO 兩碼）／buyer.city；前台（粉絲結帳頁）同步新增前欄位先空著（需求看板「未提供地區」的來源） |

## E · 收入管理 — Earnings / Income

ID 起始 `E01…` ｜ 🟢 12 · 🔵 6 · ⚪ 8

| ID | 功能 | English | Tier | Build | 備註 |
|---|---|---|---|---|---|
| `E01` | 資料統計 | KPI stats | 🟢 release2.3 | ✅ built | minimal slice only |
| `E02` | 　總輸入 | Gross | 🟢 release2.3 | ✅ built |  |
| `E03` | 　淨利（→ 收益拆分） | Net (→ breakdown) | 🟢 release2.3 | ✅ built | net p1; waterfall later |
| `E04` | 　待結算 | Pending settlement | 🟢 release2.3 | ✅ built |  |
| `E05` | 　可提領 | Available | 🟢 release2.3 | ✅ built | display p1; payout later |
| `E06` | 篩選（本月 / 季 / 年） | Filter (month/qtr/year) | 🟢 release2.3 | ✅ built |  |
| `E07` | 匯出 | Export | 🟢 release2.3 | ✅ built |  |
| `E08` | 申請提款 | Request payout | 🔵 release2.4 | ✅⬆ ahead | payout mechanics deferred |
| | **欄目** | Tabs | | | |
| `E09` | 　總覽（趨勢圖 / 近期交易 / 來源分佈） | Overview | 🔵 release2.4 | ✅⬆ ahead | charts deferred |
| `E10` | 　交易明細 | Transactions | 🟢 release2.3 | ✅ built |  |
| `E11` | 　　全部（欄位 + 展開詳情） | All (fields + expand) | 🟢 release2.3 | ✅ built |  |
| `E12` | 　　電子商店 | E-Shop tab | 🟢 release2.3 | ✅ built |  |
| `E13` | 　　電子票券 | E-Tickets | ⚪ TBD | ✅⬆ ahead |  |
| `E14` | 　　IP 版稅 | IP royalty | ⚪ TBD | ✅⬆ ahead |  |
| `E15` | 　　授權 | Licensing | ⚪ TBD | ✅⬆ ahead |  |
| `E16` | 　　平台 / 串流版稅 | Streaming royalty | ⚪ TBD | ✅⬆ ahead |  |
| `E17` | 　　專案支持 | Project support | ⚪ TBD | ✅⬆ ahead |  |
| `E18` | 　　提款與作廢沖銷 | Payout & void | 🔵 release2.4 | ✅⬆ ahead | 2026-09-09（D253）：由「提款與退款」更名——平台不提供退款動作；feature ID／`data-feat` 掛點不變 |
| `E19` | 　　載入更多 | Load more | 🟢 release2.3 | ✅ built |  |
| `E20` | 　　手動補登 | Manual entry | 🔵 release2.4 | ✅⬆ ahead |  |
| `E21` | 　　匯出 CSV | Export CSV | 🟢 release2.3 | ✅ built |  |
| `E22` | 　收益拆解（瀑布圖 / 依專案 · Ztor抽成·創作者·NFT） | Revenue breakdown waterfall | 🔵 release2.4 | ✅⬆ ahead | 收益拆解納入 scope（使用者 2026-07-16 裁示補上，D139）；平台費率設定入口見規格 5.1.0.3、費率凍結機制 §7.6，結構依 §7.3／5.1.8 F11·F12，**實際抽成比例數值仍待產品確認**。（原文「EFT」為筆誤，依規格 §7.3 淨利池 NFT 40% 更正） |
| `E23` | 　提款 | Payout | 🔵 release2.4 | ✅⬆ ahead |  |
| `E24` | 　稅務檔案 | Tax documents | ⚪ TBD | ✅⬆ ahead |  |
| `E25` | 　　合作者分潤 | Collaborator share | ⚪ TBD | ✅⬆ ahead | 2026-09-24 補登：交易明細已有此分類、先前漏掛 data-feat；分類定義見規格 §7.3 |
| `E26` | 　　推薦分潤 | Referral share | ⚪ TBD | ✅⬆ ahead | 2026-09-24 補登：交易明細已有此分類、先前漏掛 data-feat；分類定義見規格 §7.3 |

## B · 買家店面（Ztor eShop） — Buyer Storefront

> 來源：from Phase 1 handoff (not in 功能點.md)

ID 起始 `B01…` ｜ 🟢 8 · 🔵 1 · ⚪ 1

| ID | 功能 | English | Tier | Build | 備註 |
|---|---|---|---|---|---|
| `B01` | 創作者商店頁 | Creator shop page | 🟢 release2.3 | ✅ built |  |
| `B02` | 商品詳情頁 (PDP) | Product detail page | 🟢 release2.3 | ✅ built | net-new — designer proto has none |
| `B03` | 購物車 | Cart | 🟢 release2.3 | ✅ built |  |
| `B04` | 結帳 | Checkout | 🟢 release2.3 | ✅ built |  |
| `B05` | 　Apple Pay / 信用卡 (Stripe) | Apple Pay / card | 🟢 release2.3 | ✅ built |  |
| `B06` | 　爆米花付款 (Pay by POPCORN) | Pay by POPCORN | 🟢 release2.3 | 🟡 gap | net-new payment option |
| `B07` | 　貨到付款 (COD) | Cash on delivery | ⚪ TBD | ⏳ deferred | removed from Phase 1 |
| `B08` | 訂單確認 | Order confirmation | 🟢 release2.3 | ✅ built |  |
| `B09` | 取貨 QR（email + 訂單詳情，靜態） | Pickup QR (static, email + order) | 🟢 release2.3 | 🟡 gap |  |
| `B10` | 公開探索欄（/shops、首頁商品欄） | Public discovery rails | 🔵 release2.4 | ⏳ deferred | internal-only Phase 1 — no public discovery |

---

_由 https://ztor-eshop-proto.vercel.app/eshop-feature-scope-map.html 轉錄（2026-06-30）；ID 依原始 HTML 的編號邏輯重算（group 結構列不佔號）。2026-07-02 對源複核：源頁未更新（自標 2026-06-29），107 項 tier／build 零漂移；本檔僅就地更正兩處源頁筆誤（O08 代付款→待付款、E22 EFT→NFT，見各列備註），其餘忠實轉錄。_
