> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Admin IP Bank table

#### 總表紀錄（原 §4.1 · Admin IP Bank table）

- `_layer`：🟠 organism
- Status：✓ SiteSpecific
- CSS：[admin-ip-bank-table.css](../ds-components/admin-ip-bank-table.css)

Admin IP Bank 與 Reporting 的 Film／Owner 分配表與報表篩選列；共用 token-driven table wrapper、owner identity 與日期範圍操作列。**2026-07-31 使用者：`.admin-table__thumb` 改直式**——原 36×36 正方，改「鎖高算寬」：`height:36px`／`width:calc(36px * var(--img-portrait))`（≈29px，29×36），與 `.ztor-table__thumb` 同一個推導邏輯 **`--menu`（2026-08-20 · D212）**：列尾動作是浮動下拉（kebab）的清單掛這個修飾子——外框的 `overflow-x:auto` 連縱向一起裁，選單長出去只剩半截（最後一列必中）；它放行 overflow（外框與 `.ztor-table` 兩層都要——表格自己也是 `overflow:hidden`，只放行外框選單仍然出不來）、並把 840px 最小寬歸零（那個寬度是給欄位多得多的 Admin IP 銀行表用的），overflow 放行後外框圓角不再 clip 內容，所以首列表頭與末列自己補圓角貼齊內緣。做法沿用 `variant-table-wrap--menu`。消費頁：商店設定的尺寸指南與優惠碼兩張清單（`store-settings.css` 原本那條 `#sec-codes … min-width:0` 隨之退場、留墓碑）。**ztorUI 換裝（2026-08-28 Wave 3 B 級巡檢補修）**：`.admin-table-wrap` 外框改玻璃四件套（`--ztu-glass-bg` ＋ `backdrop-filter: blur(var(--ztu-blur-glass))` ＋ 1px `--border` ＋ `--shadow-card`/`--shadow-edge-top`，配方同 `.card` 黃金基準／Q77 裁決），取代原本的實色底＋單層 `--shadow-card`；巢狀 `.ztor-table` 維持自己既有的表頭／hover token 不變，實測（admin-ip-bank／admin-platform-fees／admin-video-review／store-settings）表頭與 hover 列在玻璃底上仍可讀。**`--fluid`（2026-09-02）**：表格坐在比整頁窄的欄裡時用（首個消費者：創作者活動管理頁的活動表格）——840px 最小寬收成 560px，左右儲存格內距同時由 `--sp-20` 收到 `--sp-12`（六欄各吃 40px 內距＝240px，在 700px 的欄裡光內距就佔三分之一，欄位反而被逼換行）；上下內距不動，列高是閱讀節奏、不隨欄寬變擠。  **Q112（2026-09-11）**：`--radius-xl` 外框內的列左右內距下限 `--sp-16`（首欄文字不壓在圓弧上；右側 icon 欄不動）。 **2026-09-21 限量的上限欄（spec 5.1.5.1 §2.8／§2.10、§7.2）**：`--stock.--limited` 與 `--preview.--limited` 各多一軌——商品細節頁的限量商品在庫存分頁多一欄唯讀「上限」（`.variant-cell--ro.variant-cell--total`，在庫欄右邊、56px），商品設定的逐選項組合定價表多一欄可改的上限（`.variant-cell--input.variant-cell--total`，84px）；顯隱沿用建立商品的 `.variant-cell--total` ↔ `--limited` 那一組、不另造；不限量商品不掛 `--limited`。編輯規則（§2.10 上限不得低於已售）：違反的格 `aria-invalid="true"`（shared.css 紅框），表格底下一行 `.field__error` 點名列；單一規格的上限在 Edition 卡的欄位（`.field` ＋ `.field__hint--fact`「已售 n」＋ `.field__error`）。Edition 本身建立後鎖定（D137），細節頁用 `.segmented.radio-cards.segmented--locked`（各段 `disabled`＋`data-view-safe`）只呈現。
