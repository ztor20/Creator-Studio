# Ztor Creator Studio · R 1.0 BUILD-SPEC

> **歷史 UI／前端實作快照。** 本文件只描述 R 1.0 當時的呈現與工程做法，不是產品需求來源。
>
> 產品規則以 `../../requirement/`、`../../documents/decisions.md` 與 `../../documents/` 為準。若本文件與上游不同，記入 [ASSUMPTIONS.md](ASSUMPTIONS.md) 並更新實作；禁止把 R 1.0 畫面反向同步成產品決策。

| 欄位 | 內容 |
|---|---|
| **版本** | v0.1（初版 · 實作對齊） |
| **最後更新** | 2026-05-21 |
| **負責人** | Yves |
| **參考來源** | `requirement/02-PRD-產品需求規格書.md`、`documents/0-設計規格書.md` 與 5.1.x 子規格 |
| **相關文件** | [design-system.html](design-system.html)（元件預覽）、[UI-CHANGES.md](UI-CHANGES.md)（變更紀錄）|

> 本檔保留當時 app 樣貌與呈現選擇。功能名稱、文案與流程若沒有上游引用，只能視為歷史實作，不得當成現行產品規則。

---

## 0. 相關規格（Related Specs）

| 規格 | 路徑 | 涵蓋 |
|---|---|---|
| PRD | [`../../requirement/02-PRD-產品需求規格書.md`](../../requirement/02-PRD-產品需求規格書.md) | 產品需求 |
| 設計總綱 | [`../../documents/0-設計規格書.md`](../../documents/0-設計規格書.md) | 全站結構 / 視覺 / 跨模組規則 |
| 建立專案流程 | [`../../documents/5.1.2.1-建立專案流程.md`](../../documents/5.1.2.1-建立專案流程.md) | 4-step wizard |
| IP 詳情頁 | [`../../documents/5.1.3.1-IP詳情頁.md`](../../documents/5.1.3.1-IP詳情頁.md) | 單一 IP 管理頁 |
| 建立活動流程 | [`../../documents/5.1.6.1-建立活動流程.md`](../../documents/5.1.6.1-建立活動流程.md) | 活動建檔 |
| 商品細節頁 | [`../../documents/5.1.5.1-商品細節頁.md`](../../documents/5.1.5.1-商品細節頁.md) | 單一商品管理頁 |
| 建立商品流程 | [`../../documents/5.1.5.2-建立商品流程.md`](../../documents/5.1.5.2-建立商品流程.md) | 4-step wizard |

---

## 1. 產品定位

給獨立創作者用的內容變現中後台 — 把 IP、專案、活動、商品、粉絲、收入收在同一個工作台。後台優先；粉絲端（Fan Shop）為下游消費端，本 app 是「後台 / Studio」這一面。

## 2. 目標使用者 · 主要 JTBD

| 使用者 | 場景 | 主要 job | 痛點 |
|---|---|---|---|
| 獨立音樂創作者 | 發行專輯 / 黑膠 / MV | 從建專案 → 募資 / 預購 → 商品 → 結算，一條龍 | 工具散落、結算對不上 |
| 短劇 / 影集導演 | 發行單集 / 季度作品 | 收入計算、IP 後續授權、粉絲分級 | 對外授權沒地方記 |
| IP 權利人 | 把 IP 上架可授權 | 設定條款、版稅、租用期，被動接案 | 缺乏制式平台 |

## 3. 全站結構（Sitemap）

```
/index.html              · 總覽 / Overview            · 主導航第 1 群
/ip-market.html          · IP 市場 / IP Market        · 主導航第 2 群「探索」
/ip-detail.html          · IP 詳情頁                  · 從 ip-market 或 my-ip 點入
/projects.html           · 專案清單 / Projects        · 主導航第 3 群「創作管理」
/create-project.html     · 建立專案 4-step wizard    · 從 projects 進入
/my-ip.html              · 我的 IP / My IP            · 主導航第 3 群
/e-shop.html             · 電子商店 / E-Shop          · 主導航第 4 群「商務營運」
/product-detail.html     · 商品細節頁                · 從 e-shop 進入
/create-product.html     · 建立商品 4-step wizard    · 從 e-shop 進入
/events.html             · 活動清單 / Events          · 主導航第 4 群
/create-event.html       · 建立活動（單頁 form）      · 從 events 進入
/earnings.html           · 收入管理 / Earnings        · 主導航第 4 群
/fans-crm.html           · 粉絲經營 / Fans CRM        · 主導航第 5 群
/settings.html           · 設定 / Settings            · avatar dropdown 進入
/design-system.html      · 元件預覽（內部用）        · 不在主導航
```

| 路徑 | 名稱 | 狀態 | 對應 03.x |
|---|---|---|---|
| `index.html` | 總覽 | ✓ 已建 | 03 §5.1.1 |
| `projects.html` | 專案 | ✓ 已建 | — |
| `create-project.html` | 建立專案 | ✓ 已建 + spec audit 完成 | 03.1 |
| `events.html` | 活動 | ✓ 已建 | — |
| `create-event.html` | 建立活動 | ✓ 已建 + spec audit 完成 | 03.3 |
| `ip-market.html` | IP 市場 | ✓ 已建 | — |
| `ip-detail.html` | IP 詳情 | ✓ 已建 + spec audit 完成 | 03.2 |
| `e-shop.html` | 電子商店 | ✓ 已建（基本） | — |
| `product-detail.html` | 商品細節 | ✓ 已建 | 03.4 |
| `create-product.html` | 建立商品 | ✓ 已建 | 03.5 |
| `my-ip.html` | 我的 IP | ✓ 已建 | 03 §5.1.4 |
| `earnings.html` | 收入管理 | ✓ 已建 | 03 §5.1.8 |
| `fans-crm.html` | 粉絲經營 | ✓ 已建 | 03 §5.1.7 |
| `settings.html` | 設定 | ✓ 已建 | 03 §5.1.9 |
| `design-system.html` | 元件預覽 | ✓ 已建（內部用）| — |

## 4. 導覽模型

### 4.1 主導航（top app bar，5 群分組）

| # | 群 | 直接連結 | Dropdown 子項 |
|---|---|---|---|
| 1 | 總覽 | `index.html` | — |
| 2 | 探索 | `ip-market.html` | — |
| 3 | 創作管理 | — | 專案 / 我的 IP |
| 4 | 商務營運 | — | 電子商店 / 活動 / 收入管理 |
| 5 | 粉絲經營 | `fans-crm.html` | — |

Group 入口為 `<button>` + chevron-down，hover 開啟 dropdown。離開按鈕 + dropdown 區後關閉（CSS `:hover` + `::after` 8px 隱形 bridge）。

### 4.2 全域工具（topbar 右側）

| 元素 | 行為 |
|---|---|
| 搜尋（icon-only）| 點開展開 search panel（input + ESC 提示），跨資料搜尋（demo 為靜態）|
| 通知與待辦（bell + dot）| 點開待辦面板（未實作）|
| 語言切換（繁中 / EN）| ✓ 已實作 · 點按切換 `html.lang` + localStorage 持久化，跑 `applyI18n()` 換 DOM 文案 |
| Avatar | dropdown：Profile / Settings / 登出（3 項） |

### 4.3 Wizard 頂部

`wizard-topbar`：左關閉 X + 中央 stepper（1-2-3-4，點數字可跳）+ 右「草稿 · 自動儲存」標示。

## 5. 全站規則

| 規則 | 設定 |
|---|---|
| 語言 | 預設繁中（`html lang="zh-Hant"`），可切 EN（`html lang="en"`）|
| i18n 機制 | `data-i18n` / `data-i18n-placeholder` / `data-i18n-aria-label` + `i18n.js` 中央字典 |
| 時區 | Asia/Taipei（demo 寫死）|
| 貨幣 | 預設 TWD，外幣依資料源（USD / JPY）|
| 數字千分位 | 是（`Number.toLocaleString`）|
| 專案級 token | `--surface-subtle: #F0F0EC`（dashboard.css :root；ztor-minimalist-v2 base 無此 token）— 比 `--surface-secondary` 更輕，用於 dropdown rich option 的 hover / active 列底 |
| Base 字級 token | `--font-size-micro: 12px`（定義在 base `ztor-minimalist-v2/components/page.css` :root；2026-05-21 由原本散落各處的 `font-size: 10px` 集中改成 token、整套 base + 本專案 dashboard.css 共用同一個變數）— 任何 micro / caption / table-head / nav-label-secondary 字級都引用此 token，不再寫死 px |
| Currency 顯示 | 後綴 `TWD`（中後台），非前綴 NT$ |
| H1 / H2 / H3 句號 | 預設**無**；句號為 opt-in，僅 hero copy / editorial 完整句子 |
| Eyebrow | 純文字、無 `[ ]` 方括號 |
| 空狀態 | 一律提供 CTA |
| 錯誤狀態 | inline alert + 重試動作 |
| Loading | skeleton 或 placeholder，不 spinner-only |
| 收入數字一致性 | 商品 / 專案頁的收入摘要必須與收入管理（Earnings）同源，不另行計算 |
| 平台費 | 全站固定 15%，標示於建立流程與發布確認頁 |
| Cache buster | 靜態原型用 `?v=N`，CSS 改一次 +1，HTML 各檔都要更新 |

## 6. 頁面規格

### 6.1 · 總覽 / Dashboard（`index.html`）

**用途**：創作者每天打開看狀態的首頁 — Hero 重點導流、收入摘要、待辦警示、近期活動。

**進入點**：登入後預設、topbar「總覽」、logo。

**權限**：所有登入創作者。

**區段**：

| # | Section | 內容 | 元件 |
|---|---|---|---|
| 1 | Hero Banner（全屏）| 2-slide 輪播（活動 / IP 引導）| `.hero-carousel--fullscreen`、`.hero-slide` |
| 2 | 收入摘要 | 4 卡片（毛利 / 淨利 / 待結算 / 可提領）+ 說明 hint | `.stat-grid` + `.stat-cell` + `.stat-cell__hint` |
| 3 | 近期收入 + 警示 | 雙欄 | `.two-col` |
| 4 | 創作管理 cards | 3 個 entity-card | `.cards-row` |
| 5 | 系統活動時間軸 | 5 筆事件（內容 + 模組標籤 + 時間靠右）| `.activity-list` + `.activity-row` |

**狀態變體**：靜態 demo，無真實 loading / empty。

**文案重點**：H1 為 hero overlay，section H3 無句號；time 用「09:42 · 今天」「昨天」「17 May」並列格式。

---

### 6.2 · IP 市場 / IP Market（`ip-market.html`）

**用途**：瀏覽、評估、租用可授權 IP。

**進入點**：topbar「探索」。

**區段**：page-intro H1 → 大型搜尋 bar → 6 個下拉篩選（IP 類型 / 可租用狀態 / 價格上限 / 版稅上限 / 地區 / 期限）→ results-summary（count + sort）→ entity-card grid → 載入更多。

**篩選**：全下拉設計（chip 版本已撤、保留在元件庫）。

**文案**：filter 標籤格式 `<label> ·`（含中點分隔）。

---

### 6.3 · IP 詳情頁（`ip-detail.html`）對應 [5.1.3.1](../../documents/5.1.3.1-IP詳情頁.md)

**用途**：租用 / 引用 IP 前確認條件 + 從 My IP 進入時的單一 IP 管理。

**進入點**：ip-market.html 卡片、未來的 my-ip.html。

**權限**：登入用戶可看公開 IP；My IP 視角僅權利人。

**區段（左主欄）**：
- breadcrumb（IP 市場 > IP 名稱）
- page-intro：H1 + status pill「可租用」+ 類型 badge
- detail-cover（主視覺）
- 可用狀態（slots / 排他）
- 基本資料（名稱 / 類型 / 權利人 / 素材完整度）
- 允許用途 + 禁止用途
- **§2.5 從我的 IP 進入時顯示** — 登記資料 / 租入資訊 / 市場設定 / 到期處理 / 法律提示（標 `My IP 視角` badge，視覺以 `--surface-secondary` 區隔）
- 授權條款（版稅 / 地區 / 期限 / 排他）+ 法律 alert

**區段（右側 sticky）**：
- pricing-box：租用總額 + 期間選擇（3 / 6 / 12 月 + 自訂月份 panel）+ 排他開關 + 費用明細 + 送出
- 競標模式 reference panel（若為競標 IP，會取代上方 pricing-box）

**狀態變體**：
- 不可租用：明示原因（名額已滿 / 授權暫停 / 競標已結束 / 權利資料待確認）
- 競標：剩餘時間 / 最高出價 / 出價人數 / 最低出價
- 自訂期間：即時換算（base 12,000/月 × 月份 × 折扣 6+/12+ 月）

---

### 6.4 · 專案清單 / Projects（`projects.html`）

**用途**：管理所有專案的生命週期。

**進入點**：topbar 創作管理 → 專案。

**區段**：page-intro（H1 + `+ 建立專案`）→ toolbar（狀態下拉 + 內容類型下拉 + 排序 + 卡片 / 列表切換）→ entity-card grid（4 欄）→ 載入更多。

**文案**：H1「專案」/「Projects」；CTA「＋ 建立專案」。

---

### 6.5 · 建立專案流程（`create-project.html`）對應 [5.1.2.1](../../documents/5.1.2.1-建立專案流程.md)

**用途**：4-step wizard，建立可上線 / 募資 / 預購的內容專案。

**Step 1 · 關於專案**：專案類型 radio（Go live / Fund it first / Pre-order）+ 基本資料（名稱 / 類型 / 語言 / 描述）+ 內容類型相關欄位（音樂專輯範例）+ IP 租借入口。

**Step 2 · 展示內容**：4 種圖片上傳 zone（縮圖 / 海報 / 橫幅 / 圖庫）+ 影片 + 故事 textarea。

**Step 3 · 營利設定**：存取模式（3 選）+ 價格 + **平台費 15% alert** + **廣告 toggle（啟用後展開 4 位置 checkbox-card）** + **品牌合作 toggle（啟用後展開可動態新增品牌條目）** + 預期收益估算 box + 發布時間。

**Step 4 · 發布確認**：摘要清單（3 區塊，各有編輯入口）+ **What happens next（依專案類型動態切 3 套文案）** + 發布前 7 項檢查 + footer 4 個操作（儲存草稿 ghost / 返回 / 發布專案 / 關閉於 topbar）。

---

### 6.6 · 活動清單 / Events（`events.html`）

**用途**：管理活動（演唱會 / 見面會 / 發表會 / 線上活動）。

**結構**：page-intro + toolbar（狀態 + 類型 + 排序）+ entity-card 4 欄。

---

### 6.7 · 建立活動（`create-event.html`）對應 [5.1.6.1](../../documents/5.1.6.1-建立活動流程.md)

**用途**：單頁 form（非 wizard），承載活動初始建檔（5 個必填區塊）。

**區段**：活動類型 radio（4 選）+ 時間（日期 / 跨日 / 開始 / 結束）+ 地點或線上連結（toggle 切現場 / 線上欄位）+ 描述 + 注意事項 + 封面上傳 + 後續設定提醒 alert（票種 / 名單 / 通知 / 報到 / 成本將於建立後進入）。

---

### 6.8 · 電子商店 / E-Shop（`e-shop.html`）

**用途**：管理所有可販售商品（實體 / 數位 / 限定 / 套組 / 拍賣 / 體驗）。

**結構**：page-intro（H1 + `+ 建立商品`）→ **主篩選 tabs（Products / Bundles / Auctions）** → toolbar（狀態 + 次分類 + 排序 + 卡片 / 列表）→ entity-card grid（4 欄、卡片可點進 product-detail）→ 載入更多。

**狀態示意**：Live / Low Stock / Sold Out / Draft 都有範例卡。

---

### 6.9 · 商品細節頁（`product-detail.html`）對應 [5.1.5.1](../../documents/5.1.5.1-商品細節頁.md)

**用途**：單一商品的管理頁 — 資料 / 素材 / 價格庫存 / 銷售摘要（引用 Earnings）/ 專案引用。

**進入點**：e-shop 卡片。

**區段（左主欄）**：
- breadcrumb（電子商店 > 商品 > 名稱）
- page-intro：H1 + status pills（Live + Low Stock）+ 類型 badge
- detail-cover
- 商品基本資料（名稱 / 主分類 / 次分類 / 狀態 / 粉絲端可見 / 建檔日期）
- 內容與素材（描述 + 圖庫狀態 + 交付說明 + 注意事項）
- 價格庫存交付（售價 / 幣別 / 庫存 / 低庫存門檻 / 履約狀態 / 物流 / 運費策略）
- 限定條件（總數 / 每人上限 / Top Fan 優先購 / 編號）
- **銷售摘要**（毛收入 / 平台費 / 支付費 / 物流費 / 退款爭議 / 淨利 — 註明「資料來源 · 收入管理」）+ 爭議結算 alert + 紀錄入口
- **專案引用**清單（影響專案方案的提示來源）

**區段（右側 sticky）**：
- pricing-box 變體：剩餘庫存 / 售價 / 本月銷量 / 本月淨利 / 退款率 + 編輯商品 + 補貨 + 粉絲端呈現檢查 alert + 預覽按鈕
- 上架檢查狀態 box（必填 / 主圖 / 交付 / 庫存 / 粉絲端可理解性 5 項）

---

### 6.X · 我的 IP（`my-ip.html`）對應 03 §5.1.4

**用途**：管理自有 IP / 租入 IP / 授權條款 / 到期提醒 / 版稅收入來源的工作區。

**進入點**：topbar 創作管理 → 我的 IP；專案發布也會自動建立 IP record 並回到此頁。

**結構**：
- page-intro：H1 `My IP` + 副標 `Your intellectual property on Ztor` + `+ Add your IP` button
- tabs：`My IP · 自有` / `Rented · 租入`
- 4 KPI 卡片：Total IP / Total rentals / Total IP revenue / 本月授權收入
- 提示條：「專案發布會自動建立 IP record」
- toolbar：類型 + Marketplace 篩選 + 排序
- 自有 IP 兩個分組區塊：`IP I made on Ztor` / `IP I own outside Ztor`，各區有 ip-table（IP / Owner / Rented / Revenue / Share % / Rental Price / Mktplace / Manage 8 欄）
- Marketplace 圖例（ON / OFF 含義）
- Row 點擊進 `ip-detail.html`（連動 03.2 的 My IP 視角區段）

**狀態變體**：Verifying / 已驗證 / 上架 ON / 上架 OFF / 0 rented / partial / fully rented。

---

### 6.Y · 粉絲經營（`fans-crm.html`）對應 03 §5.1.7

**用途**：理解個別粉絲價值 / 維繫關係 / 設定分級 / 管理粉絲福利。

**進入點**：topbar 粉絲經營。

**結構**：
- page-intro：H1 `Your fans, ranked` + 副標 `Leaderboard updates nightly` + `Export` + `Message` button
- tabs：`Leaderboard · 排行榜` / `Hall of fame · 名人堂`
- 4 KPI：Active fans / At risk / Revenue (active) / Avg Reputation
- **Who's who** 分級分布：4-segment 比例橫條（Inner Circle / Superfan / Devoted / Fan）+ 收入細節清單；右上 `Tier settings` / `Edit benefits` 入口
- **流失風險 alert**：橫幅 `5 fans at risk of dropping` + `Message them` button
- 搜尋 + 分級下拉 + 快速篩選下拉 + 排序
- Fans 表格（7 欄：Fan / Tier / Reputation / Spent / Progress / Status / action）：每列含 avatar + 姓名 + email/所在地、tier-pill、進度條與差距、status pill（Active / At risk）

**狀態變體**：Active / At risk / 分級 4 種 / 進度未滿。

---

### 6.Z · 收入管理（`earnings.html`）對應 03 §5.1.8

**用途**：收入管理 + 財務口徑的唯一來源 — 整合商品、活動、IP、授權、專案支持、合作者分潤與提款流程。

**進入點**：topbar Earnings。

**結構**：
- page-intro：H1 `Earnings` + 副標 + 期間下拉 + `Export` + `Request Payout`
- tabs：`Overview` / `Transactions` / `Payouts` / `Tax Documents`（Overview 為預設，4 分頁實際 show/hide 切換 + hash 同步 + 鍵盤 ArrowLeft/Right 導航）

**Panel · Overview**
- **4 KPI cards**（總收入 / 淨利 / 待結算 / 可提領）— 同 Dashboard 用 `.stat-grid > .stat-cell` 同一元件；`.stat-cell__footer` 同層裝 `__period`（**預設可見**，期間 chip 含 calendar / clock icon — 強制揭露資料期間以符合 spec §5.1.8 #3「不得只顯示數字」）與 `__hint`（hover 才顯示，提供補充描述）。Gross / Net 配「本月 · Feb 2026」、Pending / Available 配「目前快照 · As of today」。嚴格分開待結算與可提領；已付款移到 Payouts 分頁不再混入
- **Revenue Trend**：獨佔一行全寬，6 個月柱狀 + 圖例 + 期間註
- **Revenue by Source + Recent Transactions 並排**（`.two-col` 等寬 1fr 1fr）— Source 為 stacked bar 6 segments + source-list 含金額 + 百分比，「Other」合併 Collaborator + Fanvestor Royalties；Recent Tx 為 6 筆 activity-row（icon + 來源 + tag + **日期** + 金額帶顏色）+ `View All Transactions →`（按下跳至 Transactions 分頁）
- **Project Income Breakdown**：承接 Project Net Income，`project-breakdown-card` 含 5 列預期 vs 實際 + tfoot 淨利差異列

**Panel · Transactions**
- `tx-filter-row` 7 個類型 chip + Export 按鈕
- `tx-table` 8 欄表（來源 / 日期 / 原始幣種 / 匯率 / 狀態 / 毛利 / 扣項 / 淨利 TWD）— 區分 Paid / Processing / Refunded / **Manual** 狀態
- 區段「Manual Entries」用 `ztor-alert--info` + `manual-marker` chip 強調手動補登的未驗證屬性

**Panel · Payouts**
- **Payout Status**：6 卡片網格（Pending / Available / Payout Requested / Paid / Failed / Disputed），左側 2px accent rail 區分 `--ok` / `--pending` / `--alert` 三類；每張卡多了 `payout-card__icon` 圓角 icon 槽
- **Request Payout**：`payout-flow-card` — header + 3 列摘要（付款帳戶 / 手續費 / 預估入帳時間）+ 主要 Request Payout 按鈕

**Panel · Tax Documents**
- `tx-filter-row` 2 個切換 chip（By Year / By Quarter）+ 年度下拉
- `tax-doc-list` 4 列文件（file-text icon + 標題 + 描述 + 期間 chip + Download 按鈕）
- `region-strip` 顯示目前支援地區（Taiwan / Japan / United States / European Union）

**狀態變體**：收入正 / 負（提款 / 退款）顏色區分；payout-card `--ok` 綠 / `--pending` 黃 / `--alert` 紅；tx-table status dot 4 色。

**資料一致性**：本頁是全站收入的「**唯一口徑**」，其他頁（商品 / 專案）的收入摘要必須引用此處同源資料。手動補登標記為「未驗證」，不混入已驗證口徑。

---

### 6.S · 設定（`settings.html`）對應 03 §5.1.9

**用途**：帳戶、外觀、通知、隱私安全、付款與外部整合的管理區。

**進入點**：topbar avatar dropdown 的 Profile / Settings 連結。

**結構**：左側 sticky `settings-nav` 6 個分區錨點 + 右側 `settings-content` 內含 6 個 `settings-section`，scroll 時 active 自動同步。

**6 個分區**：
1. **Profile**：頭像上傳（5MB 上限）+ Basic Information 6 欄（Display Name / Username @prefix / Email / Bio + 字數 / Website / Location / Language Preference）+ Save Changes / Discard
2. **Appearance**：Theme Mode 3 個 radio-card（Light / Dark / System），即時套用
3. **Notifications**：3 分組 toggle list — Email（Sales / Events / Marketing 3 項）/ Push（Sales / Event / Fan / Promo 4 項）/ In-App（5 類別 pill 列示）
4. **Privacy & Security**：Privacy 4 toggles + Security 3 row（Password / 2FA Enabled / Data Export）+ **Danger Zone**（紅框框起、Delete Account 紅按鈕、不可逆說明）
5. **Payments**：Payout Method 2 row（Primary 標記 / Add New）+ Payment Settings 3 欄（排程 / 門檻 / 預設幣別）+ Tax Information 3 row（已驗證 status pill）
6. **Integrations**：Connected 3 個（Spotify / YouTube / Instagram 含同步失敗範例）+ Available 4 個（StreetVoice / TikTok / X / Discord）+ 狀態說明 alert

**狀態變體**：toggle on/off、Primary badge、已驗證 / 同步失敗、Danger zone 紅邊。

**重要 UX**：
- 高風險操作（密碼 / 2FA / 刪帳號 / 收款帳戶 / 提款幣種 / 稅務 / Data Export）皆有確認 / 狀態回饋
- Bio 即時字數計算（200 字上限）
- Sticky 側邊 nav，scroll 時 active 自動高亮

---

### 6.10 · 建立商品流程（`create-product.html`）對應 [5.1.5.2](../../documents/5.1.5.2-建立商品流程.md)

**用途**：4-step wizard。

**Step 1 · 類型 + 基本**：商品類型 radio（6 選：實體 / 數位 / 限定 / 套組 / 拍賣 / 體驗）+ 名稱 / SKU / 幣別 + **主分類 + 次分類兩者必填**（spec §5.1 檢核：主不能取代次）。

**Step 2 · 素材 + 描述**：4 種上傳 zone（主視覺 / 縮圖 / 圖庫 / 數位內容示意）+ 主描述 / 限定條件 / 注意事項 / 交付說明。

**Step 3 · 價格 + 庫存**（**依商品類型動態展開條件區塊**）：
- 共用：售價 + 會員 / Top Fan 價
- 實體 / 限定 / 套組：庫存 + 低庫存門檻 + 物流方式 + 運費策略
- 數位：交付方式 + 下載上限 + 存取期 + 檔案格式
- 限定：限量總數 + 每人上限 + Top Fan 優先購 + 編號
- 套組：子商品清單 + 加入子商品
- 拍賣：起標 + 加價 + 起標時間 + 結束時間

**Step 4 · 狀態 + 檢查**：商品狀態 radio（Draft / Scheduled / Live）+ 粉絲端可見 toggle + 允許專案引用 toggle + 上架前 7 項檢查 + 預覽粉絲端 + 後續可進入 alert。

---

## 7. 共用元件

| 元件 | 來源 | 變體 | 出現頁 |
|---|---|---|---|
| `app-topbar` | dashboard.css | 含 hover dropdown / search panel / avatar menu / lang toggle | 全站（wizard 例外）|
| `wizard-topbar` + `stepper` | dashboard.css | 4-step / 可點跳 | create-project / create-event / create-product |
| `wizard-footer` | dashboard.css | save hint + ghost「儲存草稿」 + 返回 + 下一步/發布 | 同上 |
| `page-intro` | dashboard.css | H1 + actions（無 eyebrow / 無 desc）| 所有 list / detail |
| `hero-carousel` | dashboard.css | default + `--fullscreen` modifier | index |
| `stat-grid` + `stat-cell` | dashboard.css | 4 卡片陣列 + 選用 hint | index |
| `entity-card` | dashboard.css | default + `--link` 可點變體 | projects / events / ip-market / e-shop / index |
| `filter-row__field` + `__select` | dashboard.css | 預設下拉設計（chip 版本保留） | projects / events / ip-market / e-shop |
| `filter-row--toolbar` + `__end` | dashboard.css | 合併篩選 + 排序 + view-toggle 在同列 | projects / events / e-shop |
| `tabs` + `tabs__item` | dashboard.css | 底線 active 標示 | e-shop |
| `detail-layout` + `detail-meta-block` | dashboard.css | 含 `--my-ip` 視角區隔 | ip-detail / product-detail |
| `pricing-box` | dashboard.css | 租用版本 / 商品管理版本 | ip-detail / product-detail |
| `radio-cards` + `radio-card` | dashboard.css | 2 / 3 / 多欄 | 所有 wizard |
| `conditional-panel` + `checkbox-card` + `brand-list` | dashboard.css | 啟用後展開的設定區 | create-project Step 3 |
| `conditional-by-type` | dashboard.css | 依商品類型 show/hide 區塊 | create-product Step 3 |
| `activity-list` + `activity-row` | dashboard.css | 內容 + 標籤 + 時間靠右 | index |
| `status-pill` | dashboard.css | live / draft / pending / available / soldout / funded / completed / cancelled / failed | 全站 |

## 8. 文案語氣

- **基調**：專業 / 直接 / 不裝可愛
- **句末標點**：H1 / H2 / H3 預設無句號；句號為 opt-in
- **避免**：「不是 X，而是 Y」這類先否定再肯定的句型；直接寫正面主張
- **動詞偏好**：建立 / 申請 / 同步 / 結算 > 新增 / 提交 / 上傳資料
- **粉絲端 vs 後台 vs 法務語言**：收入英中混 / 專案商品活動全英 / 外部整合全中（依 03 §5.3.2）
- **錯誤訊息**：說明原因 + 提供下一步
- **平台費 / 法律提示**：必須明示「平台記錄不等同正式法律合約」、「可提領淨利 ≠ 顯示收入」

## 9. 國際化（i18n）

- **機制**：`i18n.js` 中央字典 + `data-i18n` / `data-i18n-placeholder` / `data-i18n-aria-label` 屬性 + topbar 繁中 / EN button 觸發 `toggleLang()`
- **持久化**：`localStorage.ztor-lang` 記 `zh-Hant` 或 `en`
- **目前覆蓋範圍**：
  - ✓ Topbar 全部（nav + dropdown + search + lang / bell / avatar aria-label）
  - ✓ Page H1（5 list 頁）
  - ✓ Primary CTA（`+ 建立 X` 三個）
  - ⚠ Wizard 內部已有 inline 雙語（"Pay per view · 一次性購買"），切換時雙語並存、不影響可讀
  - ✗ Detail 頁深層 meta（已記為 TBD，未來補）
- **覆蓋率測試**：在任一頁點繁中 / EN，topbar nav + dropdown 字串 + 主 CTA + H1 應即時切換

## 10. 待辦 / 開放問題

| # | 問題 | 處理 |
|---|---|---|
| 1 | i18n 深層覆蓋（detail meta / wizard 內部 / 表格欄位）| 待需要時再加 |
| 2 | 03.3 spec 自己僅 29 行，許多細節「後續可拆」 | 待 spec 補完再對齊 |
| 3 | 自訂內容類型（Custom）| spec 保留未開放 |
| 4 | my-ip / fans-crm / earnings / settings 沒有獨立 5.1.x 子規格 | 內容依 03 §5.1.4 / 5.1.7 / 5.1.8 / 5.1.9 對齊；未來可拆 03.6+ |
| 5 | Dark mode 實作 | Appearance section 已展示 Light / Dark / System radio，但實際 dark theme CSS 未做 |

## 11. 變更摘要

最近一輪結構 / 文案 / 流程變更摘要 — 細節見 [`UI-CHANGES.md`](UI-CHANGES.md)。

| Date | 主要變更 |
|---|---|
| 2026-05-20 | nav 重做 5 群 + dropdown hover、收入摘要改卡片、活動軸排序改、hero 改全屏、頁面開場簡化（無 eyebrow/desc）、列表移除 count、篩選改下拉 |
| 2026-05-20 (later) | 03.1 補 §5.4 平台費 / §5.5 廣告位置 / §5.6 品牌合作清單 / §6.3 動態 What-next / §6.5 儲存草稿 |
| 2026-05-21 | 03.2 補 §2.5 我的 IP 視角區段 + §3.1 自訂月份；新建 e-shop / product-detail / create-product；i18n 系統上線（topbar + H1 + CTA）|
| 2026-05-21 (later) | 依 03 §5.1.4 / 5.1.7 / 5.1.8 新建 my-ip.html / fans-crm.html / earnings.html — 三頁皆完整覆蓋對應 spec 區段（KPI / tabs / 表格 / 視覺化）|
| 2026-05-21 (last) | 依 03 §5.1.9 新建 settings.html — 6 個分區（Profile / Appearance / Theme / Notifications / Privacy & Security 含 Danger Zone / Payments / Integrations）+ sticky 側邊 nav + scroll 自動 active + toggle-switch + 高風險 Danger Zone 樣式 |
