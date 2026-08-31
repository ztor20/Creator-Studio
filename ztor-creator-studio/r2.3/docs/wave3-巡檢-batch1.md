# Wave 3 全站巡檢 · Batch 1

日期：2026-08-28　巡檢範圍：20 頁（見 §0）　方式：Claude Browser 逐頁截圖 + `getComputedStyle` 抽查（背景色／`backdrop-filter`／console error／橫向溢出）+ 目視滾動中段與底部

判準來源：`STYLE-DECISIONS.md` Q77–Q82、`docs/wave2-熔接紀錄.md` 開頭總則、三頁黃金樣板（`e-shop.html`／`product-detail.html`／`create-product.html`）實測。

**重要修正說明**：本輪巡檢發現「create 系列精靈頁」（`create-product.html` 等黃金樣板本身也是如此）刻意維持不透明畫布＋不透明卡片、不套用 Q77 玻璃化，這是既有設計、不是漏做。判定時已把這條排除在外，只在**列表／詳情／儀表板類頁面**沿用 Q77 卡片家族判準。

---

## 01 · admin-ip-bank-entry.html — OK

- `.form-section.form-section--outlined`（IP 資料／Owner 連結／分潤配置三卡）：`background: rgba(255,255,255,0.07)`、`backdrop-filter: blur(24px)`，符合 Q77 玻璃卡配方。
- `body::before` 星空層存在（`radial-gradient` 疊圖），符合 Q81。
- console 乾淨，無橫向溢出。

## 02 · admin-ip-bank.html — B

- **B1**：主表格外框 `.admin-table-wrap`（`ds-components/admin-ip-bank-table.css:2`）`background: var(--card)`、無 `backdrop-filter`，仍是舊版不透明卡，未套 Q77 玻璃配方；巢狀的 `.ztor-table` 本身透明，靠外層 wrap 顯色，同樣受影響。
- 側欄「Admin IP Bank」選中態＝橘玻璃膠囊，符合 Q80。
- console 乾淨，無橫向溢出。
- 建議歸類：機械套用（把 `.admin-table-wrap` 併入 Q77 五件套配方，或改用 `.card` 包裹再讓 `.ztor-table` 走 `ds-components/table.css:75` 既有的 flush 規則）。

## 03 · admin-platform-fees.html — B

- **B1**（同 02）：`.admin-table-wrap` / `.ztor-table` 未玻璃化，本頁「E-SHOP／OTT・STREAMING／IP・IP BANK」三個費率子表格都受影響。
- **B2**：`.info-banner`（`ds-components/info-banner.css:2`）`background: var(--accent)`、無 blur，未跟進 Q77；本頁若有使用（需再核）。
- 上層 `.form-section--outlined`（Payment fee／Platform fee／Version history／Rate exceptions）四張卡皆正確玻璃化。
- Dropdown（貨幣切換等）不透明，符合 Q78。
- console 乾淨，無橫向溢出。

## 04 · admin-video-review.html — B

- **B1**（同 02）：`.admin-table-wrap` / `.ztor-table` 未玻璃化，審核列表主表格受影響。
- **B2**：`.info-banner`（`background: rgb(42,43,44)` 實測）未玻璃化，用於頁面說明列。
- `admin-table__thumb`、`review-status__note` 為表格內縮圖／備註的巢狀薄膜，色值 `rgb(22,23,24)` 是舊配方（應併入外層修復後一起改用 `--ztu-film`）。
- `payout-dialog` 不透明，符合 Q78（彈出層規則）。
- console 乾淨，無橫向溢出。

## 05 · auction-detail.html — OK

- BIDDING STATS／AUCTION STATUS／ITEM SUMMARY 三卡皆玻璃化（未被抓到未 blur 的異常）。
- 通知面板 `app-notif__panel`、`preview-panel__sheet` 不透明，符合 Q78。
- `fan-store__*`（「NOW FANS SEE IT」手機模擬器）沿用自己一套暖色 mockup 配色，屬裝置模擬框、非表面材質範疇，不套用 Q77。
- console 乾淨，無橫向溢出。

## 06 · audience-report.html — OK

- TOTAL PLAYS 等 KPI 卡、TOP 10 BY VIEWS／BY PLATFORM／STAR SIGN／MBTI／CHINESE ZODIAC 卡皆玻璃化。
- 圖表色塊（`perf-rank__fill`／`source-row__swatch`）為資料色，非表面色，正常。
- `payout-dialog` 不透明，符合 Q78。
- console 乾淨，無橫向溢出。

## 07 · brand-campaign-detail.html — B

- **B1**：`.info-banner`（頁尾「Prototype figures for illustration…」提示列）`background: rgb(42,43,44)`、無 blur，未跟進 Q77。
- KPI 四卡、「DID THEY CHOOSE YOU」／「LOYALTY POINTS ISSUED」／「NOT MEASURED HERE」卡皆玻璃化，正常。
- `explain__dialog`（「How this works」說明彈窗）不透明，符合 Q78。
- console 乾淨，無橫向溢出。

## 08 · brand-campaigns.html — B

- **B1**：`.brand-card`（`ds-components/brand-card.css:17`）`background: var(--card)`、無 blur，「START A NEW CAMPAIGN」下 Starbucks／Nike／Adidas／Zara／Nespresso 品牌磚未跟進 Q77；巢狀 `.brand-deal`（展開的合作條件卡）同樣是舊配方 `rgb(22,23,24)`。
- **B2**：同 07 的 `.info-banner` 問題（此頁「START A NEW CAMPAIGN」下方說明列）。
- 頂部 KPI 卡與活動列表（`.product-list` 家族）皆正確——列表本身無填色、只靠分隔線，這是與 e-shop 商品列表一致的既有正確樣式，非漏做。
- console 乾淨，無橫向溢出。

## 09 · bundle-detail.html — OK

- SALES SUMMARY／LISTING SETTINGS／BUNDLE AT A GLANCE／BUNDLE CONTENT／SHOW IT OFF 卡皆玻璃化。
- `preview-panel__sheet` 不透明，符合 Q78；`fan-store__*` 裝置模擬框同 05，不適用 Q77。
- 次要觀察（未在畫面上目視到問題，僅 DOM 掃到、未列入判定）：`.selection-card`／`sticky-actions` 類名存在但當前分頁（Overview）未見異常渲染，可能位於未造訪的 Members 分頁，建議下輪追查。
- console 乾淨，無橫向溢出。

## 10 · create-auction.html — OK（精靈頁，比照黃金樣板）

- `.wizard` 外殼不透明畫布＋`.readiness`／`.selection-card`／`.upload-tile`／`amount-field__unit`／`tag-input__field` 等控件不透明，逐一與 `create-product.html` 實測比對後**配方一致**（`.wizard` 同為 `rgb(28,29,30)`、`.readiness` 同為 `rgb(33,34,35)`），確認是精靈頁既定樣式、非漏做。
- console 乾淨，無橫向溢出。

## 11 · create-bundle.html — OK（精靈頁，比照黃金樣板）

- SHOW IT OFF／BUNDLE INFO／BUNDLE PREVIEW／LISTING SETTINGS 版面與配色與 create-auction／create-product 一致。
- console 乾淨。

## 12 · create-campaign.html — 未能巡檢（覆蓋缺口，非視覺判定）

- 直接以 `http://localhost:4326/create-campaign.html` 開啟（含全新分頁、`navigate` 與 `window.location.href` 兩種方式皆試過、共 3 次獨立驗證）一律以「新的 top-level navigation」（非 HTTP redirect、非 in-page redirect）落到 `create-project.html`（`performance` API 顯示 `redirectCount:0`，但 `document.referrer` 為 `create-campaign.html`，証實曾經短暫載入後又跳走）。
- 站內找不到正常操作路徑會進到這支檔案（`brand-campaigns.html` 的「START A NEW CAMPAIGN」磚只會展開既有活動列表，不會導去這支檔案）；本檔案內容為「共創創建（測試版）」，屬 `feature-scope-map.md` 記載的 `funding-test` 測試分支頁（`route:create-project.html=funding-test/create-campaign.html`），推測與 `devtools.js` 的版本切換 gate 有關，但未在 `devtools.js` 內找到對應的 on-load 重導程式碼，根因未查清。
- **本頁本輪未能實際檢視視覺內容，不列入 A/B/C/OK 判定**，建議下輪另外排查或請人工用瀏覽器直接開啟確認。

## 13 · create-event-legacy.html — OK（低優先，快速過）

- 「WHAT KIND OF EVENT？」選擇卡版面與 create-event.html 一致，無明顯破版。
- console 乾淨。

## 14 · create-event.html — OK（精靈頁，比照黃金樣板）

- 三步（What kind of event → Import from Bookyay？→ Basics/Dates/Tickets/Bundles/Publishing/Review）皆正常渲染，頂部步驟條、PREVIEW 卡與 create-product 同配方。
- console 乾淨，無橫向溢出。

## 15 · create-product.html — OK（黃金樣板，快速複核）

- 本輪用作精靈頁配方比對基準（`.wizard`／`.readiness`／`.selection-card` 的不透明配方），確認與 create-auction／create-bundle／create-event 一致。

## 16 · create-project.html — OK（精靈頁，比照黃金樣板）

- 「WHAT ARE YOU MAKING？」（Direct release／Co-create／Presale）首步卡片版面與其餘精靈頁一致。
- console 乾淨。

## 17 · creator-detail.html — OK（附一個待確認的品味點）

- 以 `?handle=denise` 帶入實際資料後（直接開啟無參數會顯示合理的「Creator not found」空狀態，非 bug），整頁是**無卡片外框的單欄表單**（ACCOUNT SOURCE／SHOP AND CONTACT 兩段直接落在星空背景上，只靠一條分隔線區分），與同站其他表單頁（如 admin-ip-bank-entry.html 用 `.form-section--outlined`）不同。
- 這不是「舊語彙沒跟上」（背景不是舊的不透明卡，而是完全沒有卡），是否要補一層玻璃卡把兩段圈起來，屬設計判斷（**C**），建議下輪請設計裁決。
- console 乾淨，無橫向溢出。

## 18 · creators.html — OK

- 頂部「Creator Management」列表用 `.product-list.product-list--creators`，逐層 `getComputedStyle` 確認**完全透明、無填色**——與 e-shop.html 商品列表同配方（只靠分隔線分列），是正確既有樣式；先前肉眼一度誤判為未玻璃化的實色卡，已用 DOM 掃描排除。
- 「⋯」操作選單（Edit／Import events／Disable）不透明，符合 Q78。
- 點「Enter」會整個切換成該 creator 的儀表板視角（`dashboard`／側欄變成該 creator 的選單），非本頁範圍，另行核過該畫面無異常。
- console 乾淨，無橫向溢出。

## 19 · demo-layer-system.html — N/A（低優先，設計參考頁，不適用巡檢判準）

- 頁面自述「這是提案 demo，不是正式頁面」，白底、獨立配色系統，非產品頁面，不套用 ztorUI 新語彙判準。
- console 乾淨。

## 20 · e-shop.html — OK（黃金樣板，快速複核）

- 側欄選中態橘玻璃膠囊、頂部分頁底線、篩選 chip、「Create product」按鈕、商品列表（無填色＋分隔線）與星空背景皆正常，作為本輪其餘頁面的比對基準。

---

## 統計

合計 20 頁：OK 13、B 5、N/A（非產品頁）1、覆蓋缺口（未能巡檢）1、A 0。C 為附註於 OK 頁內的設計待裁決點，不另計頁數。

| 判定 | 頁數 | 頁面 |
|---|---|---|
| OK | 13 | admin-ip-bank-entry、auction-detail、audience-report、bundle-detail、create-auction、create-bundle、create-event-legacy、create-event、create-product、create-project、creator-detail、creators、e-shop |
| B | 5 | admin-ip-bank、admin-platform-fees、admin-video-review、brand-campaign-detail、brand-campaigns |
| N/A（非產品頁，不列判定） | 1 | demo-layer-system |
| 覆蓋缺口（未能巡檢） | 1 | create-campaign |
| A | 0 | — |

## B 級發現彙總（可機械套用）

| 元件 | 定義位置 | 現況 | 應改為 | 影響頁面 | 狀態 |
|---|---|---|---|---|---|
| `.admin-table-wrap` | `ds-components/admin-ip-bank-table.css:2` | `background: var(--card)`，無 `backdrop-filter` | 併入 Q77 玻璃卡五件套（`--ztu-glass-bg` + `blur(var(--ztu-blur-glass))` + 1px `--border` + `--shadow-card`/`--shadow-edge-top`），或改用既有 `.card` 包裹讓 `.ztor-table` 走 `ds-components/table.css:75` 的 flush 規則 | admin-ip-bank.html、admin-platform-fees.html、admin-video-review.html | **已修（2026-08-28）**：改玻璃四件套，巢狀 `.ztor-table` 表頭／hover token 不變，四頁實測可讀（另含 store-settings.html） |
| `.info-banner` | `ds-components/info-banner.css:2` | `background: var(--accent)`，無 blur | 依 Q77 判斷是否併入玻璃卡家族（若定調維持不透明說明色塊則應在 STYLE-DECISIONS 補一條裁決記錄，而非留白） | admin-platform-fees.html、admin-video-review.html、brand-campaign-detail.html、brand-campaigns.html | 升級 C、待裁決（本輪不動，等使用者裁決） |
| `.brand-card` | `ds-components/brand-card.css:17` | `background: var(--card)` | 併入 Q77 玻璃卡五件套；巢狀 `.brand-deal` 改用 `--ztu-film` | brand-campaigns.html | **已修（2026-08-28）**：卡面改玻璃四件套＋hover 陰影升級，`.brand-deal` 改 `--ztu-film`，brand-campaigns.html 實測可讀 |

## Console error 清單

本輪 19 頁（扣除未能巡檢的 create-campaign.html）皆為 **0 console error**（favicon 404 已依指示忽略；本輪未觀察到 favicon 404 以外的任何 warning/error）。無橫向溢出（`scrollWidth > clientWidth`）案例。

---

## 覆蓋聲明

- **create-campaign.html**：3 次獨立嘗試（含 `navigate` 工具兩次、`window.location.href` 一次，皆用全新分頁）皆在載入後被導向 `create-project.html`，站內也找不到會連到這支檔案的正常操作路徑；根因疑似與 `devtools.js` 版本切換 gate 或 `funding-test` 測試分支有關但未查清，**本頁實際視覺內容本輪完全未檢視**，未列入 A/B/C/OK。
- **bundle-detail.html** 只巡檢了 Overview 分頁，Sales settings／Members 兩個分頁未進去看。
- **creator-detail.html** 只用單一 creator（`?handle=denise`）驗證過，未輪過 Disabled 狀態的 creator（如 KMT Collective）畫面是否一致。
- 其餘 17 頁（含 3 頁黃金樣板複核）都完整跑過：截圖（頂部＋滾動中段/底部）＋ console error 掃描＋ `getComputedStyle` 玻璃化抽查，视觉与结构均已核對。
