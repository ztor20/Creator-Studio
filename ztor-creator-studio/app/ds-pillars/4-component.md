> 本檔是 [design-system.md](../design-system.md) 的 Pillar 4，入口與對照表在那裡。

> 速查版（元件、主要 class、用途、規格檔）見 [ds-index.md](../ds-index.md) 的「Pillar 4 速查」，用途那句從本檔 4.1 總表抓；本檔是元件登記冊與分類規則。

## Pillar 4 · Component

> **Renamed from §2 Components.** Components reference Pillar 2 Role tokens (not raw Pillar 1 palette). Importable base components live in [`ds-components/{name}.css`](../ds-components/). Product-owned components that are reused but not yet split into standalone CSS are explicitly registered as `shared.css` owned.

**元件規格一支一檔，放在 [`ds-specs/`](../ds-specs/)**（2026-11-07 從本檔拆出，內容逐字搬移）。本檔只留分類、總表與索引；改元件時讀該元件的規格檔就好。

- `§4.x` 引用對應 `ds-specs/4.x-*.md`；找不到檔案時，那是 `design-system.html` 的小節編號或舊編號，改用元件名稱在總表查。
- 總表每列的元件名稱連到規格檔；總表原本的長敘述在規格檔的「總表紀錄」段。
- 新元件在 `ds-specs/` 開新檔，並在總表加一列。

### 4.0 Classification

> Two orthogonal axes organize the system. **Layer** (atom → molecule → organism → template) tells you how big a unit is. **Component vs Pattern** tells you whether it's a thing you import (Pillar 4) or a recipe you follow (Pillar 5).
>
> **Preview discipline（展示判準，2026-07-08）**: a component section's rendered preview shows **one instance of the component itself** (as a variant × state matrix where meaningful). Any demo assembling multiple distinct components is labelled **In context** and links to the matching Pillar 5 pattern card. Assembly rules (what sits above what, order, rhythm, triggers) live in Pillar 5 only — never duplicated in a component section. Litmus test: 「把這個元件的 CSS 刪掉，這條規則還成立嗎？」成立 → 它是 pattern，不是這個元件的。

**The four build pillars (DSS v1.4):**

| Pillar | What it holds |
|---|---|
| **Pillar 1 Foundation** | Tokens — color, typography, spacing, radius, shadow, motion, iconography, brand, responsive |
| **Pillar 4 Component** | Concrete, importable UI units — atoms, molecules, organisms in one flat list, distinguished by a per-card layer tag |
| **Pillar 5 Pattern** | Recipes — layout, voice, accessibility, state behavior, data viz conventions |
| **Pillar 6 Structure** | Page-skeleton compositions — app surface + reference page templates |

**Layer tags inside Pillar 4 Component:**

| Layer | Definition | R 2.2 examples |
|---|---|---|
| 🟢 atom | Single indivisible UI primitive — typically one HTML element | Button · Badge · Status dot · Chip · Switch · Info banner · Upload tile · Input · Icon · Meta cell · Form grid |
| 🟡 molecule | 2–4 atoms cooperating on one job, can't stand alone in a page | NavigationMenu · Card · KPI · Alert · Accordion · Tabs · Filter tabs · Cookie banner · Empty stub · Selection card · Page intro · Field system · Form section · Radio card · Control row · Filter row · Stepper · Progress stepper · Settings row · Rental card |
| 🟠 organism | Multiple molecules forming a complete page region | Header · Footer · Chart family · Data list · Table · Bento grid · App shell · Wizard frame · Hero slideshow · IP hero · Chart card |
| 🟣 template | Page-skeleton composition — lives in Pillar 6 Structure, not Pillar 4 | Dashboard · Earnings 4-tab · Wizard · Settings · Empty stub |

**Pattern vs Component decision:**

| Question | Component (Pillar 4) | Pattern (Pillar 5) |
|---|---|---|
| Can I import it? | Yes — `<Button>`, `<Alert>` | No — it's a recipe |
| Is it a file? | Yes — `ds-components/alert.css` | No — it's a rule the team follows |
| How does another team adopt it? | Copy the file | Write the convention into the team wiki |
| R 2.2 example | Alert organism (§4.13) | "Dashboard-as-hero" layout pattern (§5.1) |

**Status tags (orthogonal to layer):**

- **✓ App** — R 2.2 has custom code in `ds-components/*.css`
- **🟡 Variant** — Same primitive, different config (e.g., Button Primary vs Button Outline)
- **◎ Default** — shadcn baseline used unchanged
- **◎ Composition** — Pattern listed but not promoted to full sub-section

### 4.1 Inventory

Rows are split by source ownership. `ds-components/` rows are independently importable; `shared.css` rows are real product components reused today but not yet split into one-file CSS. `_layer` tags each unit's size (🟢 atom / 🟡 molecule / 🟠 organism); it is orthogonal to `variant`.

**無自帶 CSS 的 JS 元件也要進 `design-system.html`**（2026-08-11 使用者裁決，取代先前「只寫進本檔」的慣例）。這類元件（`partials/work-fields.js`、`js/work-taxonomy.js`、`partials/film-picker.js`、三支彈窗模板模組、`js/components.js`）建在既有元件的 class 之上、不擁有任何樣式，過去因此只登記在本檔。改的理由：使用者檢視元件的唯一入口是 `design-system.html`，只寫進本檔等於他看不到這個元件存在。做法——

- 本檔給一列（CSS 欄放那支 JS 檔的連結，不留空）。
- `design-system.html` 給 TOC 項、元件總表列與 demo 卡，內容與本檔這一列及對應的 `ds-specs/` 規格檔對齊。
- demo 卡一律**載入那支 JS 當場產生**，不照著模組的模板手抄一份靜態 markup——手抄的那一刻起兩邊就開始分岔。
- 做不出互動 demo 的純資料模組（例如只提供值域的 Work taxonomy），改用「值域一覽」呈現，並在卡片裡寫明它為什麼沒有互動 demo。
- 彈窗類模組的覆蓋層在 demo 卡內以頁面級樣式壓回文件流（`.demo--inline-modal`），元件本身不動。

`check_ds_sync.py` 抓不到這一類（它的檢查以 `ds-components/*.css` 為起點），所以這條慣例只能靠人維護：新增這類 JS 元件時，兩份文件一起補。

| Component | `_layer` | Status | Where seen (Ztor Creator Studio) | CSS |
|---|---|---|---|---|
| [Button](../ds-specs/4.2-button.md) | 🟢 atom | ✓ App | 主要行動、步驟列與頁首動作用的按鈕，有 primary、outline、ghost 等樣式 | [button.css](../ds-components/button.css) |
| [Badge / Status pill](../ds-specs/4.3-badge-status-pill.md) | 🟢 atom | ✓ App | 儀表板、收入與撥款頁的狀態徽章和分類標籤，有橘、綠、紅、藍等語意色 | [badge.css](../ds-components/badge.css) |
| [Status dot](../ds-specs/4.4-status-dot.md) | 🟢 atom | ✓ App | Dashboard status / source dots | [badge.css](../ds-components/badge.css) |
| [Chip](../ds-specs/4.5-chip.md) | 🟢 atom | ✓ App | Earnings transactions filter, Tax year filter, supported regions | [chip.css](../ds-components/chip.css) |
| [Switch](../ds-specs/4.6-switch.md) | 🟢 atom | ✓ App | 設定頁通知、商店顯示、自動撥款等二選一開關的切換控件 | [switch.css](../ds-components/switch.css) |
| [Info banner](../ds-specs/4.7-info-banner.md) | 🟢 atom | ✓ App | Contextual explanations (timing, region note, legal hint) | [info-banner.css](../ds-components/info-banner.css) |
| [Upload tile](../ds-specs/4.7b-upload-tile.md) | 🟢 atom | ✓ App | Create-flow upload slots（hero／thumbs／file drop，Add new item） | [upload-tile.css](../ds-components/upload-tile.css) |
| [Bundle editor](../ds-specs/bundle-editor.md) | 🟠 molecule | ✓ Project | 建立組合包時的編輯區，含商品挑選、庫存開關與販售設定 | [bundle-editor.css](../ds-components/bundle-editor.css) |
| [Album tracks](../ds-specs/album-tracks.md) | 🟠 organism | ✓ App | 數位音樂專輯的多曲目管理，可上傳、拖曳排序、改名與換封面 | [album-tracks.css](../ds-components/album-tracks.css) |
| [VIP card](../ds-specs/vip-card.md) | 🟠 organism | ✓ App | 數位會員卡的卡面自訂區，左邊設定名稱與圖像，右邊即時預覽 | [vip-card.css](../ds-components/vip-card.css) |
| [Input](../ds-specs/4.8-input.md) | 🟢 atom | ✓ App | Wizard fields, settings forms, search | [input.css](../ds-components/input.css) |
| [Icon](../ds-specs/4.9-icon.md) | 🟢 atom | ✓ App | 全站按鈕、導覽、提示與資料列共用的圖示集（Tabler） | [icon.css](../ds-components/icon.css) · [icons.js](../js/icons.js) · [icons-all.js](../js/icons-all.js) |
| [NavigationMenu](../ds-specs/4.10-navigationmenu.md) | 🟡 molecule | ✓ App | 頂部導覽的選單項目與下拉選單，側欄模式下展開成群組 | [header.css](../ds-components/header.css) |
| [Card group](../ds-specs/card-group.md) | 🔵 atom | ✓ App | 卡片內的資訊分組，用次級標題或分隔線區分不同組內容 | [card-group.css](../ds-components/card-group.css) |
| [Card](../ds-specs/4.11-card.md) | 🟡 molecule | ✓ App | Section wrappers w/ head row across all product pages | [card.css](../ds-components/card.css) |
| [KPI](../ds-specs/4.12-kpi.md) | 🟡 molecule | ✓ App | 儀表板與收入頁的關鍵指標卡，以大字顯示單一數字 | [kpi.css](../ds-components/kpi.css) |
| [Admin IP Bank table](../ds-specs/admin-ip-bank-table.md) | 🟠 organism | ✓ SiteSpecific | Admin IP Bank 與 Reporting 的 Film／Owner 分配表與報表篩選列 | [admin-ip-bank-table.css](../ds-components/admin-ip-bank-table.css) |
| [Alert](../ds-specs/4.13-alert.md) | 🟡 molecule | ✓ App | 儀表板提示面板、頁內警示與頁面公告共用的提示條 | [alert.css](../ds-components/alert.css) |
| [Accordion](../ds-specs/4.14-accordion.md) | 🟡 molecule | ✓ App | Collapsible sections (chevron-rotate, height transition) | [accordion.css](../ds-components/accordion.css) |
| [Tabs](../ds-specs/4.15-tabs.md) | 🟡 molecule | ✓ App | 頁面內切換檢視的分頁籤，用於收入、商品類型與專案狀態 | [tabs.css](../ds-components/tabs.css) |
| [Filter tabs](../ds-specs/filter-tabs.md) | 🟡 molecule | ✓ App | 主分頁下方的次級狀態篩選膠囊，附即時筆數 | [filter-tabs.css](../ds-components/filter-tabs.css) |
| [~~Cookie banner~~](../ds-specs/4.16-cookie-banner.md) | — | **已退場 2026-08-03** | 從未被任何產品頁消費（零消費連續被 check 11 標記），使用者裁示「沒用就刪」 | [cookie-banner.css](../ds-components/cookie-banner.css)（tombstone） |
| [Empty stub](../ds-specs/4.17-empty-stub.md) | 🟡 molecule | ✓ App | Routes not yet built (orange mark + display title + spec refs) | [empty-stub.css](../ds-components/empty-stub.css) |
| [Selection card](../ds-specs/4.18-selection-card.md) | 🟡 molecule | ✓ App | 嚮導選項卡與設定頁主題、顯示模式的單選卡片 | [selection-card.css](../ds-components/selection-card.css) |
| [~~Composer~~](../ds-specs/4.19-composer.md) | — | **已退場 2026-08-25** | 已退場：原為拖放輸入卡的展示元件，從未被任何頁面使用 | [composer.css](../ds-components/composer.css)（tombstone） |
| [Dropdown menu](../ds-specs/4.26-dropdown-menu.md) | 🟡 molecule | ✓ App | 點開後列出動作的下拉選單，觸發鈕可為主要按鈕或更多圖示鈕 | [dropdown-menu.css](../ds-components/dropdown-menu.css) |
| [Header (topbar)](../ds-specs/4.20-header.md) | 🟠 organism | ✓ App | 所有頁面共用的 64px 頂部導覽列，含下拉選單與動作群 | [header.css](../ds-components/header.css) |
| [Global nav · sidebar mode](../ds-specs/global-nav-sidebar-mode.md) | 🟠 organism | ✓ App | 取代頂部導覽的 248px 左側導覽列，下拉選單改為可展開群組 | [shared.css](../shared.css) · [sidebar.js](../js/sidebar.js) |
| [Admin-layer nav · Tier 0/1](../ds-specs/admin-layer-nav-tier-0-1.md) | 🟠 organism | ✓ App | 平台管理端的頂部導覽，標示創作者管理並鎖定第一層項目 | [shared.css](../shared.css) · [sidebar.js](../js/sidebar.js) |
| [~~Footer~~](../ds-specs/4.21-footer.md) | — | **已退場 2026-08-03** | 同上：7 個 class 零消費，`index.html`／`creators.html` 只掛了 `<link>`、沒有對應 markup | [footer.css](../ds-components/footer.css)（tombstone） |
| [Data list](../ds-specs/4.22-data-list.md) | 🟠 organism | ✓ App | 收入、交易、撥款與商品等清單用的資料列，一列一筆資料 | [data-list.css](../ds-components/data-list.css) |
| [~~Avatar stack~~](../ds-specs/avatar-stack.md) | — | **已退場 2026-08-25** | 已退場：原為重疊頭像堆疊，從未被任何頁面使用 | [avatar-stack.css](../ds-components/avatar-stack.css)（tombstone） |
| [Drawer](../ds-specs/drawer.md) | 🟠 organism | ✓ App | 從右側滑出的面板，用於不離開當前頁就查看詳情、歷史或說明 | [drawer.css](../ds-components/drawer.css) |
| [Pager](../ds-specs/pager.md) | 🟡 molecule | ✓ App | 清單底部的數字分頁器，放在表格下方切換頁數 | [pager.css](../ds-components/pager.css) |
| [Picker](../ds-specs/4.22b-picker.md) | 🟠 organism | ✓ App | Search + scrollable pick-list（Create bundle items、IP linker） | [picker.css](../ds-components/picker.css) |
| [Field pill](../ds-specs/4.22c-field-pill.md) | 🟡 molecule | ✓ App | Inline filter pill — search / select / dropdown-trigger | [field-pill.css](../ds-components/field-pill.css) |
| [Search (collapsible)](../ds-specs/search.md) | 🟡 molecule | ✓ App | 收合於工具列的搜尋：平常只見放大鏡、點擊滑開成 field-pill（重用 field-pill、不重造輸入） | [search-collapse.css](../ds-components/search-collapse.css) |
| [Search collapse](../ds-specs/search-collapse.md) | 🟡 molecule | ✓ App | 工具列上的收合式搜尋，平時只見放大鏡，點開後展開成輸入框 | [search-collapse.css](../ds-components/search-collapse.css) |
| [List toolbar](../ds-specs/4.90-list-toolbar.md) | 🟠 organism | ✓ App | 清單頁頭的工作列，左放主軸分頁、右放動作按鈕群 | [list-toolbar.css](../ds-components/list-toolbar.css) |
| [Segmented](../ds-specs/4.22d-segmented.md) | 🟡 molecule | ✓ App | 2/3-way text toggle | [segmented.css](../ds-components/segmented.css) |
| [Amount field](../ds-specs/amount-field.md) | 🟡 molecule | ✓ App | 附單位符號的金額輸入欄，單位可為固定符號或可切換的開關 | [amount-field.css](../ds-components/amount-field.css) |
| [Review row](../ds-specs/4.49-review-row.md) | 🟡 molecule | ✓ App | 流程 Review 步驟的摘要列，顯示欄位名、值與右側編輯連結 | [review-row.css](../ds-components/review-row.css) |
| [Preview card](../ds-specs/4.22e-preview-card.md) | 🟡 molecule | ✓ App | 粉絲端即時預覽卡（商品／拍賣，§5.2.5） | [preview-card.css](../ds-components/preview-card.css) |
| [PDP preview](../ds-specs/4.54b-pdp-preview.md) | 🟠 organism | SiteSpecific | 粉絲端商品頁的手機版鏡像（建立商品的即時預覽，D248） | [pdp-preview.css](../ds-components/pdp-preview.css) |
| [Preview column](../ds-specs/preview-column.md) | 🟡 molecule | ✓ Project | 建立流程「表單｜預覽」兩欄版面＋右側 sticky 預覽欄 | [preview-column.css](../ds-components/preview-column.css) |
| [Preview panel](../ds-specs/4.22f-preview-panel.md) | 🟠 organism | ✓ App | 右側畫面分割面板承載即時預覽——壓窄 wizard、非浮層（§5.2.5） | [preview-panel.css](../ds-components/preview-panel.css) |
| [Fan store preview](../ds-specs/fan-store-preview.md) | 🟠 organism | ✓ App | 電子商店與商店設定預覽用的粉絲端創作者頁手機版鏡像 | [fan-store.css](../ds-components/fan-store.css) |
| [Pickup management](../ds-specs/pickup-management.md) | 🟠 organism | SiteSpecific | 現場 QR 核銷工作區（spec 5.1.5.11 · D111），E-Shop 下與訂單管理並列 | [pickup.css](../ds-components/pickup.css) |
| [Mobile scanner](../ds-specs/mobile-scanner.md) | 🟠 organism | SiteSpecific | 獨立手機 scanner（spec 5.1.5.14 · D111/D121/D122/D240）——獨立 URL、無主工作台導航 | [scanner.css](../ds-components/scanner.css) |
| [Auth shell](../ds-specs/4.113-auth-shell.md) | 🟠 organism | SiteSpecific | 未登入層的置中表單殼（spec 5.1.10 · D170）——站上第二個無工作台導航的整頁殼，無卡片 | [auth.css](../ds-components/auth.css) |
| [Ticket preview](../ds-specs/4.116-ticket-preview.md) | 🟡 molecule | ✓ App | 粉絲收到的那張票的即時預覽（建立活動步驟 5 票券銷售 › 票券設計的右軌）：識別半張（時間／票名或 logo／票種）＋撕線＋QR 半張 | [ticket-preview.css](../ds-components/ticket-preview.css) |
| [Session list](../ds-specs/4.117-session-list.md) | 🟡 molecule | ✓ App | 系列場次清單：一活動辦好幾場時逐場列出日期與場地 | [session-list.css](../ds-components/session-list.css) |
| [Review status](../ds-specs/4.119-review-status.md) | 🟡 molecule | ✓ App | 送審件的狀態面板，顯示審核狀態、退件理由與可用的動作 | [review-status.css](../ds-components/review-status.css) |
| [Ticket tier card](../ds-specs/4.114-ticket-tier-card.md) | 🟡 molecule | ✓ App | 建立活動時的票種卡，可收合檢視價格與數量，展開後編輯 | [ticket-tier-card.css](../ds-components/ticket-tier-card.css) |
| [Readiness card](../ds-specs/4.22g-readiness-card.md) | 🟡 molecule | ✓ App | 上架前就緒檢查＋還差幾項 banner | [readiness.css](../ds-components/readiness.css) |
| [Post composer](../ds-specs/post-composer.md) | 🟡 molecule | ✓ App | 發文框，用於進度時間軸、發布更新彈窗與總覽進度摘要的入口 | [post-composer.css](../ds-components/post-composer.css) |
| [Fact list](../ds-specs/fact-list.md) | 🔵 atom | ✓ App | 唯讀事實列，左邊放欄目名、右邊放值，用於詳情彈窗 | [fact-list.css](../ds-components/fact-list.css) |
| [Progress mark](../ds-specs/progress-mark.md) | 🔵 atom | ✓ App | 進度記號：一顆記號、兩個消費者共用（時間軸與總覽的進度摘要） | [progress-mark.css](../ds-components/progress-mark.css) |
| [Step list](../ds-specs/step-list.md) | 🟡 molecule | ✓ App | 階段清單：一串回答「走到第幾步」的列，不是時間軸——沒有日期欄、沒有今天、不能往回捲 | [step-list.css](../ds-components/step-list.css) |
| [Progress timeline](../ds-specs/4.51b-progress-timeline.md) | 🟠 organism | ✓ App | 交付時間軸：一條由真實日期驅動的垂直時間流，未來在上、今天在中、過去在下 | [progress-timeline.css](../ds-components/progress-timeline.css) |
| [Section nav](../ds-specs/4.22h0-section-nav.md) | 🟡 molecule | ✓ App | 分頁內的側欄分節導覽 | [section-nav.css](../ds-components/section-nav.css) |
| [Section outline](../ds-specs/4.233-section-outline.md) | 🟡 molecule | ✓ App | 長表單的本頁大綱：直排細字清單，目前節亮起＋左側細線（scroll-spy），點擊平滑捲到該節 | [section-outline.css](../ds-components/section-outline.css) |
| [Limit set](../ds-specs/4.234-limit-set.md) | 🟡 molecule | ✓ App | 限購：一欄＋一句輔助說明、只換單位（件／組／張） | [limit-set.css](../ds-components/limit-set.css) |
| [Rules group](../ds-specs/4.240-rules-group.md) | 🟡 molecule | ✓ App | 購買條件群組，把購買條件與限購整併在同一個細框內 | [rules-group.css](../ds-components/rules-group.css) |
| [Form steps](../ds-specs/4.241-form-steps.md) | 🟢 atom | ✓ App | 把同一張表單分成多步顯示，用於建立商品與建立組合包 | [form-steps.css](../ds-components/form-steps.css) |
| [Price ladder](../ds-specs/4.235-price-ladder.md) | 🟡 molecule | ✓ App | 價格階梯，由上往下列出原價、各項折扣到粉絲實付的算法 | [price-ladder.css](../ds-components/price-ladder.css) |
| [Member table](../ds-specs/4.236-member-table.md) | 🟡 molecule | ✓ App | 組合物表：商品與活動票券成員同一張表，五欄（展開｜名稱｜原價・剩餘｜每組數量｜移除），票券列可展開、展開入口兩處同步。詳見 §4.236 | [member-table.css](../ds-components/member-table.css) |
| [Form ask](../ds-specs/4.237-form-ask.md) | 🟡 molecule | ✓ App | 問句式設定塊，依序呈現問句、說明與二選一選項，並附標題列讀數 | [form-ask.css](../ds-components/form-ask.css) |
| [Export dialog](../ds-specs/export-dialog.md) | 🟡 molecule | ✓ App | 匯出視窗的內容區，上方顯示這次匯出摘要，下方列匯出紀錄 | [export-dialog.css](../ds-components/export-dialog.css) |
| [Date range](../ds-specs/4.238-date-range.md) | 🟡 molecule | ✓ App | 清單篩選列上的日期區間欄，兩個日期欄並排、可只填一邊 | [date-range.css](../ds-components/date-range.css) |
| [Code picker](../ds-specs/4.239-code-picker.md) | 🟡 molecule | ✓ App | 商品與組合包的優惠碼選擇欄，以卡片列表呈現並可彈窗新增 | [code-picker.css](../ds-components/code-picker.css) |
| [Member picker](../ds-specs/4.244-member-picker.md) | 🟡 molecule | ✓ App | 組合物挑選：空狀態大按鈕＋「加入更多」，點開彈窗搜尋、篩選、一次勾多個。詳見 §4.244 | [member-picker.css](../ds-components/member-picker.css) |
| [Vault list](../ds-specs/4.245-vault-list.md) | 🟡 molecule | ✓ App | 媒體庫左欄：庫房一列（直式封面、名稱、狀態圓點・狀態字・人數）與同形狀的虛線「新增庫房」；選中只靠底色。詳見 §4.245 | [vault-list.css](../ds-components/vault-list.css) |
| [Vault stage](../ds-specs/4.246-vault-stage.md) | 🟠 organism | ✓ App | 媒體庫主欄：庫房標頭、成效三格、灰底容器內固定三欄的直式內容卡片與「添加」卡。詳見 §4.246 | [vault-stage.css](../ds-components/vault-stage.css) |
| [Vault open](../ds-specs/4.247-vault-open.md) | 🟡 molecule | ✓ App | 媒體庫開啟方式：條件開啟、鑰匙開啟兩列開關、方法小卡、鑰匙列。詳見 §4.247 | [vault-open.css](../ds-components/vault-open.css) |
| [Vault wizard](../ds-specs/4.248-vault-wizard.md) | 🟠 organism | ✓ App | 媒體庫三步建立流程：取名 → 放內容 → 誰開得了，全畫面 .wizard 蓋在頁面上。詳見 §4.248 | [vault-wizard.css](../ds-components/vault-wizard.css) |
| [Roster picker](../ds-specs/4.203-roster-picker.md) | 🟠 organism | ⚠ 退場候選（2026-10-08 D372 起零消費，待使用者裁決） | 上面選人、下面看那一位：上段是一張卡一個對象的網格（可換行、窄畫面掉成一欄），下段是選定那一位的內容、佔整個內容寬度 | [roster-picker.css](../ds-components/roster-picker.css) |
| [Row disclosure](../ds-specs/4.204-row-disclosure.md) | 🟡 molecule | ✓ App | 母列收成一列、點開才看到底下每一筆 | [row-disclosure.css](../ds-components/row-disclosure.css) |
| [Listing controls](../ds-specs/4.205-listing-controls.md) | 🟠 organism | ✓ App | 上架、顯示於商店與開賣三個獨立開關並列的設定區塊 | [listing-controls.css](../ds-components/listing-controls.css) |
| [Link field](../ds-specs/4.206-link-field.md) | 🟡 molecule | ✓ App | 系統產生、不可編輯、要能整條帶走的連結：唯讀等寬輸入框吃滿寬、行尾複製與重置、底下一行說明 | [link-field.css](../ds-components/link-field.css) |
| [Stock allocation](../ds-specs/4.207-stock-allocation.md) | 🟠 organism | ✓ App | 說明一個庫存池如何分配給各販售管道，逐列顯示鎖定量與可售量 | [stock-allocation.css](../ds-components/stock-allocation.css) |
| [Avatar](../ds-specs/4.202-avatar.md) | 🟢 atom | ✓ App | 姓名首字的識別圓，40px（`.ztor-avatar`）、32px（`--sm`）與 64px（`--lg`）三尺寸 | [avatar.css](../ds-components/avatar.css) |
| [Stat row](../ds-specs/4.22h1-stat-row-meter-list-day-bars.md) | 🟡 molecule | ✓ App | 卡內大數字排（取代把 `.kpi` 塞進卡片） | [stat-row.css](../ds-components/stat-row.css) |
| [Todo list](../ds-specs/todo-list.md) | 🟡 molecule | ✓ App | 可編輯的待辦清單（勾選＋自行增刪） | [todo-list.css](../ds-components/todo-list.css) |
| [Meter list](../ds-specs/meter-list.md) | 🟡 molecule | ✓ App | 逐項水位清單（名稱 → 量條 → 數字，三欄一線） | [meter-list.css](../ds-components/meter-list.css) |
| [Next step](../ds-specs/next-step.md) | 🟡 molecule | ✓ App | 一句話＋一顆主要動作，放在卡的最後一段 | [next-step.css](../ds-components/next-step.css) |
| [Empty card](../ds-specs/4.22h-empty-card.md) | 🟡 molecule | ✓ App | 卡片內「已載入但無資料」空狀態 | [empty-card.css](../ds-components/empty-card.css) |
| [Staged change](../ds-specs/4.232-staged-change.md) | 🟢 atom | ✓ App | 就地編輯時標示已修改、新增與待刪除項目的狀態標記 | [staged-change.css](../ds-components/staged-change.css) |
| [Notification matrix](../ds-specs/4.22i-notification-matrix.md) | 🟠 organism | ✓ App | 事件×管道逐格開關矩陣（含鎖定通道） | [notification-matrix.css](../ds-components/notification-matrix.css) |
| [Completeness meter](../ds-specs/4.22j-completeness-meter.md) | 🟡 molecule | ✓ App | label＋x/y＋進度條（素材包完整度） | [completeness.css](../ds-components/completeness.css) |
| [Insight row](../ds-specs/4.22k-insight-row.md) | 🟡 molecule | ✓ App | 圖表下單行自動洞察（無洞察隱藏） | [insight-row.css](../ds-components/insight-row.css) |
| [Finding card](../ds-specs/4.111-finding-card.md) | 🟠 organism | ✓ App | 一則帶著支撐數字的結論（結論＋數字＋依據＋追查入口） | [finding-card.css](../ds-components/finding-card.css) |
| [Source status](../ds-specs/4.112-source-status.md) | 🟠 organism | ✓ App | 不占版位的資料涵蓋指示＋來源明細面板 | [source-status.css](../ds-components/source-status.css) |
| [List footer](../ds-specs/4.22l-list-footer.md) | 🟡 molecule | ✓ App | 清單分頁頁尾（Showing N of M＋Load more） | [list-footer.css](../ds-components/list-footer.css) |
| [Message composer](../ds-specs/4.22m-message-composer.md) | 🟠 organism | ✓ App | 群發撰寫 modal（Compose＋History） | [message-modal.css](../ds-components/message-modal.css) |
| [Char counter](../ds-specs/4.22n-char-counter.md) | 🟡 molecule | ✓ App | 限長輸入即時字數 | [message-modal.css](../ds-components/message-modal.css) |
| [Token chip](../ds-specs/4.22o-token-chip.md) | 🟡 molecule | ✓ App | 點擊插入個人化變數 | [message-modal.css](../ds-components/message-modal.css) |
| [Event preview card](../ds-specs/4.22p-event-preview-card.md) | 🟡 molecule | ✓ App | 建立活動粉絲視角活動卡（即時預覽） | [event-preview-card.css](../ds-components/event-preview-card.css) |
| [Product list](../ds-specs/4.27-product-list.md) | 🟠 organism | ✓ App | 電子商店庫存清單，顯示商品、狀態、庫存、可見性與編輯動作 | [product-list.css](../ds-components/product-list.css) |
| [Project list](../ds-specs/4.28-project-list.md) | 🟠 organism | ✓ App | 專案清單表格，顯示目標進度、剩餘時間、類別與狀態，整列可點入明細 | [project-list.css](../ds-components/project-list.css) |
| [Table](../ds-specs/4.23-table.md) | 🟠 organism | ✓ App | Earnings transactions 9-col table | [table.css](../ds-components/table.css) |
| [Sparkline](../ds-specs/sparkline.md) | 🟢 atom | ✓ App | 數字的附註型微型走勢圖 | [sparkline.css](../ds-components/sparkline.css) |
| [Issue panel](../ds-specs/issue-panel.md) | 🟠 organism | ✓ App | 待辦事項面板：把「還等著創作者處理的事」整批攤開，依來源模組分組、一次展開一則 | [issue-panel.css](../ds-components/issue-panel.css) |
| [Work card](../ds-specs/work-card.md) | 🟡 molecule | ✓ App | 儀表板的封面磚列 | [work-card.css](../ds-components/work-card.css) |
| [Earnings feed](../ds-specs/earnings-feed.md) | 🟡 molecule | ✓ App | 儀表板第一屏右欄的「近期收入」：一筆交易一個框 | [earnings-feed.css](../ds-components/earnings-feed.css) |
| [Canvas stage](../ds-specs/canvas-stage.md) | 🟠 organism | ✓ App | 一屏不捲展示版（`index.html`）的滿版底圖 | [canvas-stage.css](../ds-components/canvas-stage.css) |
| [Split bar](../ds-specs/split-bar.md) | 🟡 molecule | ✓ App | 一個總數＋它的組成：分段長條與圖例 | [split-bar.css](../ds-components/split-bar.css) |
| [Donut mix](../ds-specs/donut-mix.md) | 🟡 molecule | ✓ App | 一個總數拆成幾塊、畫成圓環 | [donut-mix.css](../ds-components/donut-mix.css) |
| [Tier arc](../ds-specs/tier-arc.md) | 🟡 molecule | ✓ App | 層層包含的分層弧，呈現一般粉絲到核心圈的粉絲分層 | [tier-arc.css](../ds-components/tier-arc.css) |
| [KPI rotator](../ds-specs/kpi-rotator.md) | 🟡 molecule | ✓ App | 展示版左欄的輪播卡，輪流顯示收入走勢與粉絲分布 | [kpi-rotator.css](../ds-components/kpi-rotator.css) |
| [Canvas home](../ds-specs/canvas-home.md) | 🟠 organism | SiteSpecific | `index.html` 的版型層：窄的左欄三格（收入輪播／兩個進行中項目／三則待處理）浮在鋪滿整個視窗的底圖上，整頁釘在視窗高度、不捲 | [canvas-home.css](../ds-components/canvas-home.css) |
| [Live item](../ds-specs/live-item.md) | 🟡 molecule | ✓ App | 展示版第二屏的主角：一件正在跑的事，講在一張佔掉大半屏高度的海報旁邊 || [live-item.css](../ds-components/live-item.css) |
| [Chart](../ds-specs/4.24-chart.md) | 🟠 organism | ✓ App | 折線圖、堆疊長條、來源圖例與排名長條等 SVG 圖表群 | [chart.css](../ds-components/chart.css) |
| [Earnings waterfall](../ds-specs/4.24b-earnings-waterfall.md) | 🟡 molecule | ✓ App | 收入頁的損益瀑布表，從總收入逐項扣除到可分配利潤 | [waterfall.css](../ds-components/waterfall.css) |
| [Detail overview](../ds-specs/detail-overview.md) | 🟠 organism | ✓ App | 詳情頁總覽的三欄骨架 | [detail-overview.css](../ds-components/detail-overview.css) |
| [Bento grid](../ds-specs/4.25-bento-grid.md) | 🟠 organism | ✓ App | 12-col responsive grid · KPI rows, dashboard pairs, settings layouts | [bento.css](../ds-components/bento.css) |
| [Payout picker & dialog](../ds-specs/4.29-payout-bank-picker-dialog.md) | 🟠 organism | ✓ App | 撥款銀行選擇卡與申請撥款彈窗，含金額輸入與費用摘要 | [payout-modal.css](../ds-components/payout-modal.css) |
| [Restock order (table)](../ds-specs/4.29c-restock-order.md) | 🟡 molecule | ✓ App | E-Shop restock popup (spec §5.1.5.6, D104 order + D106 member tabs); plus an adjust-stock mode since D525 (set the new stock, up or down). | [restock-modal.css](../ds-components/restock-modal.css) |
| [Store settings page](../ds-specs/4.48-store-settings-page.md) | 🟠 organism | ✓ SiteSpecific | E-Shop 商店層級設定頁（`store-settings.html`） | [store-settings.css](../ds-components/store-settings.css) |
| [Variant builder](../ds-specs/variant-builder.md) | 🟠 organism | ✓ App | 建立商品多選項（spec 5.1.5.2 §4.1④，僅實體） | [variant-builder.css](../ds-components/variant-builder.css) |
| [Tag input](../ds-specs/tag-input.md) | 🟡 molecule | ✓ App | 商品標籤輸入欄，已選標籤以 chip 呈現並提供建議標籤 | [tag-input.css](../ds-components/tag-input.css) |
| [Combobox](../ds-specs/combobox.md) | 🟡 molecule | ✓ App | 可輸入搜尋並多選的下拉建議欄，已選項目以 chip 呈現 | [combobox.css](../ds-components/combobox.css) |
| [Film picker](../ds-specs/film-picker.md) | 🟡 molecule | ✓ App | 電影關聯的可搜尋多選元件，建於標籤輸入與 chip 之上 | [partials/film-picker.js](../partials/film-picker.js) |
| [Work fields](../ds-specs/work-fields.md) | 🟠 organism | ✓ App | 影片作品欄位區塊，由多個既有表單元件組成的 JS 元件 | [partials/work-fields.js](../partials/work-fields.js) |
| [~~Lang switch~~](../ds-specs/lang-switch.md) | — | **已退場 2026-08-24（D223）** | 頁級「內容檢視語言」切換 | （已刪除） |
| [Publish preview](../ds-specs/publish-preview.md) | 🟠 organism | ✓ App | 發布前預覽確認層，以彈窗顯示各語言版本的預覽內容 | [publish-preview.css](../ds-components/publish-preview.css) · [partials/publish-preview.js](../partials/publish-preview.js) |
| [Archived gate](../ds-specs/archived-gate.md) | 🟢 atom | ✓ App | 封存態唯讀的事件層閘門：純 JS 元件 `partials/archived-gate.js`，無自帶 CSS、不畫任何東西 | [partials/archived-gate.js](../partials/archived-gate.js) |
| [Work taxonomy](../ds-specs/work-taxonomy.md) | 🟢 atom | ✓ App | 題材與年齡分級的值域單一來源 JS 模組，供多處畫面共用 | [js/work-taxonomy.js](../js/work-taxonomy.js) |
| [Manual entry modal](../ds-specs/manual-entry-modal.md) | 🟠 organism | ✓ App | 補登站外收入的彈窗，重用共用彈窗殼與表單 helper | [partials/manual-entry-modal.js](../partials/manual-entry-modal.js) |
| [Source upload modal](../ds-specs/source-upload-modal.md) | 🟠 organism | ✓ App | 上傳外部平台匯出資料檔的彈窗，重用共用彈窗殼 | [partials/source-upload-modal.js](../partials/source-upload-modal.js) |
| [Fee exception modal](../ds-specs/fee-exception-modal.md) | 🟠 organism | ✓ App | 逐位創作者覆寫平台費率的彈窗，有新增與編輯兩種模式 | [partials/fee-exception-modal.js](../partials/fee-exception-modal.js) |
| [Login lang prompt](../ds-specs/login-lang-prompt.md) | 🟠 organism | ✓ App | 登入後詢問「登入畫面剛選的語言」是否要成為帳號預設語言 | [partials/login-lang-prompt.js](../partials/login-lang-prompt.js) |
| [Loyalty settings](../ds-specs/loyalty-settings.md) | 🟢 atom | ✓ App | 平台忠誠點數設定的已儲存值模組，作為原型的單一資料來源 | [js/loyalty-settings.js](../js/loyalty-settings.js) |
| [Fans roster](../ds-specs/fans-roster.md) | 🟢 atom | ✓ App | 粉絲示範母體：純資料模組 `js/fans-roster.js`，無自帶 CSS | [js/fans-roster.js](../js/fans-roster.js) |
| [Content block injector](../ds-specs/content-block-injector.md) | 🟠 organism | ✓ App | 儀表板與收入管理反覆出現的內容區塊，由同一支渲染器產生 | [js/components.js](../js/components.js) |
| [Status axes](../ds-specs/status-axes.md) | 🟡 molecule | ✓ App | 訂單兩條獨立狀態軸（spec 5.1.5.3.1 §2.2 / PCR-001）：履約 vs 付款·結算，不併成單一 badge | [status-axes.css](../ds-components/status-axes.css) |
| [Embed modal](../ds-specs/4.97-detail-sheet.md) | 🟠 organism | ✓ App | 全螢幕彈窗內嵌另一頁，不離開清單就能開啟商店設定等頁面 | [embed-modal.css](../ds-components/embed-modal.css) |
| [Leave dialog](../ds-specs/leave-dialog.md) | 🟠 organism | ✓ App | 建立／編輯流程的返回離開確認彈窗（spec §5.2.4），由 `partials/wizard-chrome.js` 注入、6 建立頁共用 | [leave-dialog.css](../ds-components/leave-dialog.css) |
| [Schedule restore](../ds-specs/schedule-restore.md) | 🟡 molecule | ✓ App | 重新上架被擋下時的提示區塊，逐列列出已過期或未通過檢查的時間 | [sched-restore.css](../ds-components/sched-restore.css) |
| [Spec row](../ds-specs/spec-row.md) | 🟡 molecule | ✓ App | 建立商品時可重複新增的詳細規格列，每列有規格名稱、值與刪除鈕 | [spec-row.css](../ds-components/spec-row.css) |
| [Split button](../ds-specs/4.2-button.md) | 🟡 molecule | ✓ App | 主操作加箭頭下拉相關動作的按鈕 | [split-button.css](../ds-components/split-button.css) |
| [New product post](../ds-specs/new-product-post.md) | 🟠 organism | ✓ App | 建立商品後在電子商店清單彈出的撰寫彈窗，可附上商品卡 | [product-post-modal.css](../ds-components/product-post-modal.css) |
| [App shell](../ds-specs/app-shell.md) | 🟠 organism | ✓ Project | 整個頁面的外框，包含側欄、主內容區與頁面寬度設定 | [shared.css](../shared.css) |
| [Page intro](../ds-specs/page-intro.md) | 🟡 molecule | ✓ Project | 頁面頂部的標題區，含 H1、副標題與可選動作，可在左側放主視覺 | [page-intro.css](../ds-components/page-intro.css) |
| [Field more](../ds-specs/field-more.md) | 🟡 molecule | ✓ Project | 把次要欄位收在「顯示更多」按鈕後面的表單收合區 | [field-more.css](../ds-components/field-more.css) |
| [Field system](../ds-specs/field-system.md) | 🟡 molecule | ✓ Project | ONE form field = label / hint / control slot（控件重用 atom） | [field-system.css](../ds-components/field-system.css) |
| [Form section](../ds-specs/form-section.md) | 🟠 organism | ✓ Project | 建立流程中的表單區段，含標題、說明與分隔線，可用外框變體 | [form-section.css](../ds-components/form-section.css) |
| [Radio card](../ds-specs/radio-card.md) | 🟡 molecule | ✓ Project | 並排的可選卡片，標題加說明，選取時以橘色小圓點標示 | [radio-card.css](../ds-components/radio-card.css) |
| [Check card](../ds-specs/check-card.md) | 🟡 molecule | ✓ App | Multi-select pill card . | [check-card.css](../ds-components/check-card.css) |
| [Radio list](../ds-specs/4.96-checkbox.md) | 🟡 molecule | ✓ Project | 輕量的垂直單選清單，每列有單選圓點、標題與可選說明 | [radio-list.css](../ds-components/radio-list.css) |
| [Date input placeholder](../ds-specs/date-input-placeholder.md) | 🔵 atom | ✓ Project | 為日期與時間欄位加上「選擇日期」佔位字的裝飾層 | [date-input.css](../ds-components/date-input.css) |
| [Collapse group](../ds-specs/collapse-group.md) | 🟡 molecule | ✓ Project | 可收合的欄位群組，折疊時只留一行標題與值的摘要，用於活動場次 | [collapse-group.css](../ds-components/collapse-group.css) |
| [Control row](../ds-specs/4.29-payout-bank-picker-dialog.md) | 🟡 molecule | ✓ Project | 一列式設定框，左邊放標籤與說明、右邊放開關、數字或按鈕 | [control-row.css](../ds-components/control-row.css) |
| [Form grid](../ds-specs/form-grid.md) | 🟢 atom | ✓ Project | 2 欄或 3 欄的表單欄位排版輔助，窄螢幕自動改單欄 | [form-grid.css](../ds-components/form-grid.css) |
| [Filter row](../ds-specs/filter-row.md) | 🟡 molecule | ✓ Project | Chip filters and inline actions above lists / grids | [shared.css](../shared.css) |
| [Edge shadow（工具）](../ds-specs/edge-shadow.md) | ⚪ utility | ✓ Project | 只露出下緣的邊緣陰影工具，用於電子商店庫存條 | [shared.css](../shared.css) |
| [Shell 補角／接縫（頁級技法）](../ds-specs/shell.md) | ⚪ utility | — SiteSpecific | 分割與捲動容器的圓角補位技法，目前只用在電子商店頁 | [e-shop.html](../e-shop.html) |
| [Segmented control](../ds-specs/segmented-control.md) | 🟡 molecule | ✓ Project | Compact chart view switcher and mode toggles | [chart.css](../ds-components/chart.css) |
| [Stepper](../ds-specs/stepper.md) | 🟡 molecule | ✓ Project | Wizard 進度條（數字圓圈） | [shared.css](../shared.css) |
| [Progress stepper](../ds-specs/progress-stepper.md) | 🟡 molecule | ✓ Project | 嚮導的進度條，細軌加品牌漸層填充，下方列出各步驟標籤 | [progress-stepper.css](../ds-components/progress-stepper.css) |
| [Wizard frame](../ds-specs/wizard-frame.md) | 🟠 organism | ✓ Project | 多步驟建立流程的外框，含頂列、底列膠囊與全頁預覽區 | [preview-dock.css](../ds-components/preview-dock.css) · [shared.css](../shared.css) |
| [Stack](../ds-specs/stack.md) | ⚪ utility | ✓ Project | 區塊之間垂直間距的唯一規則：間距由容器承擔（`gap`），子元素不各自加 margin | [stack.css](../ds-components/stack.css) |
| [Settings nav](../ds-specs/4.48-store-settings-page.md) | 🟡 molecule | ✓ Project | Sticky local navigation inside Settings | [settings.css](../ds-components/settings.css) |
| [Settings row](../ds-specs/4.48-store-settings-page.md) | 🟡 molecule | ✓ Project | Dense label + hint + value/control/action row | [settings.css](../ds-components/settings.css) |
| [Hero slideshow](../ds-specs/hero-slideshow.md) | 🟠 organism | ✓ Project | Dashboard full-bleed carousel | [shared.css](../shared.css) · [hero.js](../js/hero.js) |
| [Rent block](../ds-specs/rent-block.md) | 🟡 molecule | ✓ Project | IP 詳情頁的租用配置區，分租期、獨家、費用明細與結算兩組 | [rent-block.css](../ds-components/rent-block.css) |
| [IP hero](../ds-specs/ip-hero.md) | 🟠 organism | ✓ Project | IP detail cover + usage + rental composition（ip-detail 專用） | [shared.css](../shared.css) |
| [IP market card cover](../ds-specs/ip-market-card-cover.md) | 🟢 atom | ✓ Project | IP 市集上架卡的封面，無圖時顯示品牌漸層佔位與 IP 名 | [shared.css](../shared.css) |
| [Funding panel](../ds-specs/4.91-funding-panel.md) | 🟡 molecule | ✓ Project | 募資概況面板：已募金額＋支持人數／目標／進度條＋百分比藥丸／倒數＋募資期間／口徑註記，一個區塊講完 | [funding-panel.css](../ds-components/funding-panel.css) |
| [Rental card](../ds-specs/rental-card.md) | 🟡 molecule | ✓ Project | Rental / bidding terms and CTA card | [shared.css](../shared.css) |
| [Meta cell](../ds-specs/meta-cell.md) | 🟢 atom | ✓ Project | Compact label/value stack in dense commercial panels | [shared.css](../shared.css) |
| [KV list](../ds-specs/4.50-kv-list.md) | 🟢 atom | ✓ Project | 唯讀鍵值列（鍵左值右、逐列 hairline）：詳情頁 meta 卡、狀態摘要 | [kv-list.css](../ds-components/kv-list.css) |
| [Calc list](../ds-specs/4.217-calc-list.md) | 🟡 molecule | ✓ App | 算式列表：一行一項、列首一個運算子（＋ − ＝）、末列是結果 | [calc-list.css](../ds-components/calc-list.css) |
| [Stock bar](../ds-specs/4.51-stock-bar.md) | 🟢 atom | ✓ Project | 5px 細長量條（庫存水位／用量比例），必與精確數字並列 | [stock-bar.css](../ds-components/stock-bar.css) |
| [Points QR card](../ds-specs/4.51c-points-qr-card.md) | 🟡 molecule | ✓ Project | 掃碼領點的 QR 卡，含 QR 名稱、每次點數、用量條與下載鈕 | [points-qr.css](../ds-components/points-qr.css) |
| [Detail rail](../ds-specs/4.52-detail-rail.md) | 🟠 organism | ✓ Project | 詳情頁兩欄殼，左邊是可編輯主欄，右邊是固定的唯讀資訊欄 | [detail-rail.css](../ds-components/detail-rail.css) |
| [Stock readout](../ds-specs/4.54-stock-readout.md) | 🔵 atom | ✓ Project | 唯讀的數量讀數，用於只能透過補貨等動作改變的庫存值 | [stock-readout.css](../ds-components/stock-readout.css) |
| [Stock split](../ds-specs/stock-split.md) | 🟡 molecule | ✝ 退場 | 庫存分配長條。`stock-split.css` 留墓碑，原始內容見 git 歷史。 |  |
| [Restock log](../ds-specs/4.55-restock-log.md) | 🟡 molecule | ✝ 退場 | 補貨紀錄表。`restock-log.css` 留墓碑。 |  |
| [Stock history](../ds-specs/4.208-stock-history.md) | 🟡 molecule | ✓ Project | 庫存歷史紀錄，每筆補貨或鎖定一列，可展開看逐組合明細 | [stock-history.css](../ds-components/stock-history.css) |
| [Lock sets](../ds-specs/4.210-lock-sets.md) | 🟠 organism | ✓ Project | 組合包鎖定套數區，設定鎖定幾套並逐項檢視各商品庫存分配 | [lock-sets.css](../ds-components/lock-sets.css) |
| [Profile avatar row](../ds-specs/4.211-profile-avatar-row.md) | 🟡 molecule | ✓ Project | 頭像＋名字＋「變更相片」橫條：薄膜底、圓形頭像 56px、名字跟顯示名稱欄位同步；首用商店設定「店面」分頁。demo 見 §4.211 | [profile-avatar-row.css](../ds-components/profile-avatar-row.css) |
| [Social links](../ds-specs/4.212-social-links.md) | 🟠 organism | ✓ Project | 社群連結清單：平台一列一格（平台名＋垃圾桶／網址欄）、虛線「新增」鈕展開未加平台清單 | [social-links.css](../ds-components/social-links.css) |
| [Bundle preview card](../ds-specs/4.213-bundle-preview-card.md) | 🟡 molecule | ✓ Project | 組合包編輯器右欄的粉絲端預覽卡，顯示內含清單、價格與加入購物車鈕 | [bundle-preview-card.css](../ds-components/bundle-preview-card.css) |
| [Fan event page](../ds-specs/4.215-fan-event-page.md) | 🟠 organism | ✓ Project | 粉絲視角活動頁＝前台 shop-item 頁的 1:1 鏡像：發布前預覽確認與活動詳情「預覽與在地化」的預覽檢視，票券頁／票務商品頁兩視圖 | [fan-shop.css](../ds-components/fan-shop.css) |
| [Fan product page](../ds-specs/4.218-fan-product-page.md) | 🟠 organism | ✓ Project | 粉絲視角的商品頁，是前台商品頁的 1:1 鏡像預覽 | [fan-shop.css](../ds-components/fan-shop.css) |
| [Fan bundle page](../ds-specs/4.219-fan-bundle-page.md) | 🟠 organism | ✓ Project | 粉絲視角的組合包頁，是前台兩種組合分支的 1:1 鏡像預覽 | [fan-shop.css](../ds-components/fan-shop.css) |
| [Fan project page](../ds-specs/4.220-fan-project-page.md) | 🟠 organism | ✓ Project | 粉絲視角的專案頁，是前台共創、預購與標題頁的 1:1 鏡像預覽 | [fan-shop.css](../ds-components/fan-shop.css) |
| [Info sections](../ds-specs/4.221-info-sections.md) | 🟡 molecule | ✝ 退場 | 說明區塊編輯器。`info-sections.css`、`partials/info-sections.js` 留墓碑。 | [info-sections.css](../ds-components/info-sections.css) |
| [Rich body](../ds-specs/4.222-rich-body.md) | 🟡 molecule | ✓ Project | 描述區塊編輯器：描述＝一串可排序的區塊，三種型別——文字／圖片／影片 | [rich-body.css](../ds-components/rich-body.css) |
| [Follow field](../ds-specs/4.223-follow-field.md) | 🟡 molecule | ✓ Project | 跟隨活動或另設時間的設定列，用於票務商品的上架、下架、開賣與停售 | [follow-field.css](../ds-components/follow-field.css) |
| [Size mix](../ds-specs/4.224-size-mix.md) | 🟡 molecule | ✓ Project | 各尺寸占比：每個尺寸一格固定寬的小直條，依尺寸順序排，整張表同一尺寸落在同一欄、上下列可直接比 | [size-mix.css](../ds-components/size-mix.css) |
| [Demand table](../ds-specs/4.225-demand-table.md) | 🟠 organism | ✓ Project | 市場需求表，列出各市場的需求指數、建議與計畫生產量及差距 | [demand-table.css](../ds-components/demand-table.css) |
| [Demand focus](../ds-specs/4.226-demand-focus.md) | 🟠 organism | ✓ Project | 選定市場後的常駐面板，顯示預測售罄天數與各尺寸計畫生產量 | [demand-focus.css](../ds-components/demand-focus.css) |
| [Section tabs](../ds-specs/4.214-section-tabs.md) | 🟡 molecule | ✓ App | 長表單頂端的分節分頁：點了平滑捲到那一段、捲動時亮目前那一段（scrollspy）、←／→／Home／End 鍵盤可移 | [section-tabs.css](../ds-components/section-tabs.css) |
| [State check](../ds-specs/4.209-state-check.md) | 🟡 molecule | ✓ Project | 唯讀的開關狀態排，以圓形勾選標記顯示各項目的開或關 | [state-check.css](../ds-components/state-check.css) |
| [Stock tip](../ds-specs/4.56-stock-tip.md) | 🟢 atom | ✓ App | 電子商店清單中狀態與庫存欄 hover 時浮出的資訊卡 | [stock-tip.css](../ds-components/stock-tip.css) |
| [Nest](../ds-specs/4.53-nest.md) | 🔵 atom | ✓ Project | 嵌在卡片底緣的滿版子層（左右下三邊切齊母卡外緣），用於「切換模式後長出一整組設定」 | [nest.css](../ds-components/nest.css) |
| [Chart card](../ds-specs/chart-card.md) | 🟠 organism | ✓ Project | Chart surface with title, controls, body | [chart.css](../ds-components/chart.css) |
| [Rank bars / source breakdown](../ds-specs/rank-bars-source-breakdown.md) | 🟡 molecule | ✓ Project | Ranked bar rows and source distribution legends | [chart.css](../ds-components/chart.css) |
| [Tooltip](../ds-specs/tooltip.md) | — | ◎ Default | shadcn baseline — not promoted to a project CSS file | — |
| [Toast](../ds-specs/4.107-toast.md) | 🟢 atom | ✓ App | 畫面底部中央的短暫確認提示（由下往上滑入）＋「未儲存/已儲存」狀態列（`.save-status`） | [toast.css](../ds-components/toast.css) |
| [Artist picker](../ds-specs/4.92-artist-picker.md) | 🟡 molecule | ⚠ Orphan（0 consumers，2026-07-29 盤點） | 「＋ 新增藝人」流程已加入藝人清單列＋pending 邀請列，沿用 owner-lookup 搜尋殼 | [artist-picker.css](../ds-components/artist-picker.css) |
| [Benefit matrix](../ds-specs/4.93-benefit-matrix.md) | 🟠 organism | ✓ App | 權益比較矩陣：一份權益目錄（列）× 四個粉絲分級（欄），取代舊版四張獨立分級卡。詳見 §4.93 | [benefit-matrix.css](../ds-components/benefit-matrix.css) |
| [Tier overview](../ds-specs/4.93b-tier-overview.md) | 🟡 molecule | ✓ App | 分級對照表（唯讀）：四個分級並排成欄、每列一個比較項目（門檻／人數／權益） | [tier-overview.css](../ds-components/tier-overview.css) |
| [Brand card](../ds-specs/4.94-brand-card.md) | 🟡 molecule | ✓ App | 品牌合作目錄卡，分開陳列鎖定的合作條款與創作者可編輯的活動 | [brand-card.css](../ds-components/brand-card.css) |
| [Chart tip](../ds-specs/4.95-chart-tip.md) | 🟡 molecule | ✓ App | 折線圖滑過時的浮層與熱區，點擊可開啟明細 | [chart-tip.css](../ds-components/chart-tip.css) |
| [Checkbox](../ds-specs/4.96-checkbox.md) | 🟢 atom | ✓ App | 全站自繪的核取方塊，取代原生方塊並支援不確定狀態 | [checkbox.css](../ds-components/checkbox.css) |
| [Detail sheet](../ds-specs/4.97-detail-sheet.md) | 🟠 organism | ✓ App | 清單頁點列開細節頁的全螢幕 iframe 覆蓋層，取代整頁導航 | [detail-sheet.css](../ds-components/detail-sheet.css) |
| [Explainer](../ds-specs/4.98-explainer.md) | 🟡 molecule | ✓ App | 欄位旁 info 圖示開正式說明彈窗，取代重複提示 | [explainer.css](../ds-components/explainer.css) |
| [Fans guide](../ds-specs/4.99-fans-guide.md) | 🟠 organism | ✓ App | 「粉絲經營怎麼玩」整頁式說明，四幕各自用自己真實資料形狀呈現。詳見 §4.99 | [fans-guide.css](../ds-components/fans-guide.css) |
| [Inline edit](../ds-specs/4.100-inline-edit.md) | — | ✝ Tombstone（0 consumers，刻意留空） | 空檔，僅存一段棄用註解；`shared.css` 已內建等效行為，全站未曾 `<link>` 過。詳見 §4.100 | [inline-edit.css](../ds-components/inline-edit.css) |
| [Manage IP](../ds-specs/4.101-manage-ip.md) | 🟡 molecule | ✓ SiteSpecific | 「管理我的 IP」頁專屬的版面補丁，含狀態徽章、驗證橫幅與授權範圍 | [manage-ip.css](../ds-components/manage-ip.css) |
| [Media vault](../ds-specs/4.102-media-vault.md) | 🟠 organism | ✓ App | 加密媒體庫：門條（解鎖條件＋觸及讀數）＋圖片/影片/音檔三種原生內容分區。詳見 §4.102 | [media-vault.css](../ds-components/media-vault.css) |
| [Perf rank](../ds-specs/4.103-perf-rank.md) | 🟡 molecule | ✓ App | 「表現排行」統一列語法，給 8–11 列的長排行榜用；`.rank-bar` 仍留給 4–6 列的佔比場景。詳見 §4.103 | [perf-rank.css](../ds-components/perf-rank.css) |
| [Sortable](../ds-specs/4.104-sortable.md) | 🟡 molecule | ✓ App | 全站表格排序互動：欄位標題包成按鈕，靜止態與純文字標題一致 | [sortable.css](../ds-components/sortable.css) |
| [Numeric stepper](../ds-specs/4.105-numeric-stepper.md) | 🟢 atom | ✓ App | 數字輸入框的上下增減鈕，取代原生 spin button | [stepper.css](../ds-components/stepper.css) |
| [Sticky actions](../ds-specs/4.106-sticky-actions.md) | 🟡 molecule | ✓ App | 頂部 CTA 捲出畫面後在底部浮現複製版動作列；全站消費最廣的元件之一（15 頁）。詳見 §4.106 | [sticky-actions.css](../ds-components/sticky-actions.css) |
| [Vault item task](../ds-specs/4.229-vault-item-task.md) | 🟡 molecule | ✓ App | 媒體庫每件內容的任務小標與單件抽屜的任務設定區 | [vault-task.css](../ds-components/vault-task.css) |
| [Vault overview](../ds-specs/4.230-vault-overview.md) | 🟡 molecule | ✓ App | 媒體庫「總覽」分頁的卡內版面：兩卡並排、檢視身分那一行、每件清單的名稱與小標欄、鑰匙三格、內容摘要兩組小表。詳見 §4.230 | [vault-overview.css](../ds-components/vault-overview.css) |
| [Vault access](../ds-specs/4.231-vault-access.md) | 🟡 molecule | ✓ App | 媒體庫的存取權限分頁，顯示即時人數、各方法符合人數與分享連結 | [vault-access.css](../ds-components/vault-access.css) |
| [Media preview](../ds-specs/4.242-media-preview.md) | 🟡 molecule | ✓ App | 單件媒體預覽，可放大照片、播放影片封面或音檔進度條 | [media-preview.css](../ds-components/media-preview.css) |
| [Vault share](../ds-specs/4.108-vault-share.md) | 🟠 organism | ✓ App | 媒體庫的加密連結／NFC 鑰匙發放面板，住在 drawer 裡；送禮與 NFC 商品共用同一個物件。詳見 §4.108 | [vault-share.css](../ds-components/vault-share.css) |
| [Wizard split](../ds-specs/4.109-wizard-split.md) | 🟠 organism | ✓ App | 精靈流程的「內容欄＋貼頂摘要側欄」兩欄版面，供 create-project 兩步共用。詳見 §4.109 | [wizard-split.css](../ds-components/wizard-split.css) |
| [Zselect](../ds-specs/4.110-zselect.md) | 🟡 molecule | ✓ App | 自製下拉選單，取代無法被樣式化的原生 `<select>` 展開清單 | [zselect.css](../ds-components/zselect.css) |
| [Condition list](../ds-specs/4.227-condition-list.md) | 🟡 molecule | ✓ App | 「好幾種條件各加一次」的清單，從新增條件選單挑一種加入，加過的種類不再出現 | [cond-list.css](../ds-components/cond-list.css) |
| [Entry list](../ds-specs/4.118-entry-list.md) | 🟡 molecule | ✓ App | 一個欄位收不定筆數的同型短文字，一列一格輸入框加刪除鈕，下方新增一列 | [entry-list.css](../ds-components/entry-list.css) |
| [Fan phone](../ds-specs/4.243-fan-phone.md) | 🟠 organism | ✓ App | 建立流程右欄的粉絲頁手機版鏡像框，商品與活動預覽共用 | [fan-phone.css](../ds-components/fan-phone.css) |
| [Field source tag](../ds-specs/4.121-field-source-tag.md) | 🟢 atom | ✓ App | 欄位標籤旁標出這一格從哪裡帶進來（例如 bookyay），欄位被鎖定時仍可讀 | [field-source-tag.css](../ds-components/field-source-tag.css) |
| [Owner lookup](../ds-specs/4.??-owner-lookup.md) | 🟡 molecule | ✓ App | 依顯示名稱、帳號或 email 搜尋平台使用者，結果是連結帳號或待邀請的 email | [owner-lookup.css](../ds-components/owner-lookup.css) |
| [Publish stage](../ds-specs/4.216-publish-stage.md) | 🟠 organism | ✓ App | 發布前預覽確認的全頁畫面，多步驟流程的最後一步 | [publish-stage.css](../ds-components/publish-stage.css) |
| [Quick result list](../ds-specs/4.122-quick-result-list.md) | 🟡 molecule | ✓ App | 批次設定產生結果的唯讀預覽，一列一項，可依場次分組 | [quick-result-list.css](../ds-components/quick-result-list.css) |
| [Size chart editor](../ds-specs/4.115-size-chart-editor.md) | 🟠 organism | ✓ App | 兩個維度都能增減的尺寸表編輯器，商店與商品的尺寸指南共用 | [size-chart-editor.css](../ds-components/size-chart-editor.css) |
| [Source import](../ds-specs/4.120-source-import.md) | 🟠 organism | ✓ App | 從外部平台搜尋一筆紀錄帶入表單的一頁式閘門，可略過或帶入 | [source-import.css](../ds-components/source-import.css) |
| [Venue map](../ds-specs/4.228-venue-map.md) | 🟡 molecule | ✓ App | 依完整地址自動產生的活動地點地圖，定位針不能手動拖動 | [venue-map.css](../ds-components/venue-map.css) |

### 4.2+ 未進總表的規格檔

這些規格檔還沒有總表列（多半是沒有獨立 CSS 的元件）；補上總表列後從這裡移除。其餘規格檔一律從 4.1 總表連過去，速查版見 [ds-index.md](../ds-index.md) 的「Pillar 4 速查」。

- [4.11b Section card](../ds-specs/4.11b-section-card.md)
