# r2.1 版本切割施工盤點

> 施工依據：使用者裁決（2026-07-14）——Phase 1、2、3 僅顯示 `feature-scope-map.md` 明確納入的功能；scope 未提到的功能一律僅 Phase 4 顯示。本檔是施工清單，不改寫上游產品規則。

## 先修版本機制

目前 `data-feat` 只能辨識 map 中的 `p1`／`next`／`tbd`；未知 ID 在 `devtools.js` 被預設當 `p1`，因此無法直接表達「僅 Phase 4」。

- 最小改法：在 `js/devtools.js` 加保留 ID，例如 `full`，讓 `data-feat="full"` 的 tier 為 `full`；`tier:*` 規則永遠不包含 `full`，而 `all`（Phase 4／funding-test）維持全部顯示。
- 不要把 `full` 寫進既有功能表：它是版本 gate 保留值，不是產品 Feature ID。需在 `feature-scope-map.md` 第 48 行的規則說明補註。
- `data-feat` 只藏目前 document 的元素，不能阻擋直開網址。需在 `devtools.js` 加「整頁功能被 gate 時導回可用首頁」或在每個完整 Phase-4 頁顯示既有 empty/不可用畫面；只包住 `<main>` 會留下可直開的空殼。

## 不可隱藏的結構殼

- 保留 `<body>`、`.app`、`#sidebar`／`.app-topbar`、全域 `js/devtools.js`、語言／主題／版面設定與 CSS/JS 載入。
- 一般頁只對 `.main` 內的「頁面內容 wrapper」加 gate；不要把 header、sidebar 或 devtools 包入 `data-feat`。
- Wizard 頁沒有 `.main`，應新增一個只包 `.wizard` 內容區的 wrapper；保留 wizard-chrome、共用 script 與頁面載入殼。
- `design-system.html`、`section-test.html`、`docs/*.html` 是開發/文件工具，非產品頁，排除版本產品篩選。

## Scope 已列的產品頁

| 頁面 | 既有 scope | 待補／確認的 gate |
|---|---|---|
| `e-shop.html` | S01–S21；S11=TBD 已標入口、tab、清單與橫條 | 補檢查所有 Auction 列內連結與 action；S11 隱藏後不得留下可開 `auction-detail.html` 的連結。Shop shell、Products/Bundles、搜尋與篩選維持 P1。 |
| `store-settings.html` | S03/S04/S07/S08=P1；S05/S06=Next 已標 | 維持既有 S05/S06 gate；檢查 `data-feat="S05,S06"` 共用卡在 P1 隱藏後不留空白。 |
| `create-product.html` | S26–S39=P1；S31.1=Next 已標 | 維持 S31.1 gate；其餘表單功能都有 scope，不以 `full` 包整頁。 |
| `product-detail.html` | S21–S25、S31–S39=P1；S24=TBD、S31.1=Next 已標 | 維持既有 S24/S31.1 gate；把 S24 導向 `create-project.html` 的 route 一併做版本可達性檢查。 |
| `create-bundle.html` | S41–S46=P1，S45=TBD | 對「Limited」選擇卡及 hard-cap 欄加 `data-feat="S45"`；P1/P2 僅保留 Unlimited 與成員最小庫存。 |
| `bundle-detail.html` | S47–S50=P1；其中重用的組合限量=S45 TBD | 對「Limited」選擇卡及 hard-cap 欄加 `data-feat="S45"`；不要隱藏整個 Stock 卡（S49 P1）。 |
| `create-auction.html` | S11=TBD | 整個 wizard 功能內容加 `data-feat="S11"`，並由頁級 route guard 避免 P1/P2 直開。 |
| `auction-detail.html` | S11=TBD | `.main` 的拍賣內容加 `data-feat="S11"`，並由頁級 route guard 避免 P1/P2 直開。 |
| `orders.html` | O01–O10=P1；O04/O09=TBD 已標 | 維持兩處 gate；檢查 O04 KPI 隱藏後 KPI grid 不破版。 |
| `order-detail.html` | O11–O16/O19–O21=P1；O17=Next、O18=TBD、O22/O23=Next 已標 | 維持既有 gate；P1 的 pickup 連結是否可跨到完整 Phase-4 pickup 模組，需依「跨模組連結」統一策略處理。 |
| `earnings.html` | E01–E07/E10–E12/E19/E21=P1；E08/E09/E20/E23=Next；E22/E24=TBD 已標 | 補六個交易來源 chip：E13–E17 分別標 E13…E17，E18 標 E18；並讓相應交易列／Overview source 資料在不屬於版本時不顯示或改為 P1 可用資料。 |
| `request-payout.html` | E08=Next 的舊 route | 目前只是「Request payout moved to Earnings」stub；若仍保留路由，整個通知內容標 E08，或由 route guard 導回 Earnings。 |

## Scope 未列：整頁 Phase 4-only

下列功能不在 feature scope，因此依本次裁決，頁面內容 wrapper 一律標 `data-feat="full"`，並加入頁級 route guard；topbar/sidebar 與 devtools 保留。

| 模組 | 頁面 | 內容 wrapper / 施工說明 |
|---|---|---|
| Dashboard | `index.html` | `.main` 的 Dashboard card、CTA、資料摘要；避免在 P1–P3 留下可進入未納 scope 模組的 CTA。 |
| Creator 管理 | `creators.html` | `.main` 的 Creator roster 與建立 popup。 |
| Projects / funding | `projects.html`、`project-detail.html`、`create-project.html`、`create-campaign.html`、`funding-simulate.html`、`funding-test/create-campaign.html` | 列表、詳情、wizard、試算內容皆 full-only；保留 funding-test 的 route 規則，但要決定測試版是否例外顯示。 |
| Events | `events.html`、`event-detail.html`、`create-event.html` | 列表、詳情與 wizard 內容 full-only。 |
| Fans | `fans-crm.html`、`fan-detail.html`、`tier-settings.html` | CRM、詳情與 tier 設定內容 full-only。 |
| IP | `my-ip.html`、`ip-detail.html`、`ip-market.html`、`register-ip.html` | IP bank、detail、market、register wizard 內容 full-only。 |
| Pickup | `pickup.html`、`pickup-detail.html`、`scanner.html` | 管理清單、詳情與獨立 scanner 工作流程 full-only；scanner 沒有 app shell，需做其自身的 route guard／不可用畫面。 |
| Account settings | `settings.html` | `.main` 的個人、外觀、通知、付款等設定內容 full-only。 |

## 共享檔與跨頁連結

- `js/devtools.js`：新增 `full` 保留 tier、頁級 route guard、`full` 的 future 預覽行為。
- `js/sidebar.js`：全域導航須按目前版本隱藏未可用模組入口；否則任何 P1–P3 都仍能進 Phase 4 頁。
- `partials/fan-store.js`：Buyer storefront 對應 B01–B10，須逐項映射；B07 COD=TBD、B10 discovery=Next 的實體 UI 若存在需補 gate，其餘 B01–B09 P1 保留。
- `feature-scope-map.md`：說明 `full` gate、補齊 E13–E18 標註現況；不應把未列功能逐一塞入此 map，因使用者裁決已定義其為 Phase 4-only。
- 需全庫掃描 `href`：P1–P3 可見頁不得連到 `data-feat="full"` 頁；同理 S11/S24/E08 等既有非 P1 route 需由版本重導或隱藏入口。

## 待主對話裁決

- `funding-test` 是「其餘同最終版」的測試版本；是否應豁免 `full` gate、顯示所有 Phase 4 專案/募資內容，或只顯示被改接的 `create-campaign`？目前規則與本次嚴格裁決有交界。
- Buyer storefront 沒有獨立 root HTML，主要由 `partials/fan-store.js` 嵌入 E-Shop/Store settings；需確認它是 P1 product surface 還是另列 Phase 4-only 的 preview。不能直接把整個 partial 標 full，否則會隱藏 B01–B06/B08/B09 的 P1 功能。
- `B07`、`B10` 在 scope 為 deferred，前次掃描未找到實體 UI；施工前再確認是否只需維持「未建置」，不應新增空 gate。
- 跨模組連結（例如 Order detail 的 Pickup、Product detail 的 Project）在來源功能可見而目標頁 full-only 時，應採「隱藏 link」或「導至不可用頁」；這是體驗決策，不可自行選。

## 估計施工範圍與風險

- 預估直接修改：24 個 full-only/route 頁、11 個 scope 頁或 route、3 個共用 JS/partial、1 個 scope 文件，約 39 檔；實際數量取決於頁級 guard 是否集中在 `devtools.js`。
- 文件：`feature-scope-map.md` 是切換單一真相；`BUILD-SPEC.md`、`ASSUMPTIONS.md`、`requirements-map.md`、`UI-CHANGES.md` 為施工前對照，不先改產品規則。
- 主要風險：把 app shell 一起隱藏、直接 URL 繞過、可見連結指向隱藏頁、Earnings filter 隱藏但資料/圖表仍洩露、wizard 沒有 `.main`、funding-test 例外與 full tier 語意衝突、partial 被多頁共用造成 P1 功能誤藏。

## 機械驗收清單

- `rg -n 'data-feat="full"|data-feat="S45"|data-feat="E1[3-8]"' -g '*.html' -g '*.js'` 覆核新增標記。
- 對 p1、p1-next、p1-next-tbd、full 各跑一次：P1 僅 p1，P2 加 next，P3 加 TBD，full 顯示全部。
- 逐頁驗：所有可見主導覽、CTA、row action 的目標 route 都在當前版本可用。
- 測 P1/P2 直開 `create-auction.html`、任一 `full` 頁、scanner，確認 route guard 行為。
- 改 HTML/JS 後依專案規則跑 `check_ds_sync.py`、全站 cache-bust、更新 `UI-CHANGES.md` 與 `requirements-map.md`，並派 fresh-context 驗收。
