# UI Changes Log

> Spec-driven adjustments and user-feedback UX changes only. Bug fixes go in commit messages, not here.
>
> **Reference**: [documents/0-設計規格書.md](../../documents/0-設計規格書.md)

---

## 2026-05-22 (newest)

### B. User-feedback adjustments

| 反饋 | 修改 |
|---|---|
| Earnings 頁面設計變更：Revenue Trend 自己一行 / Source + Recent Tx 並排 + stat-cell 加 hover：period 取代 hint | **1. 版面重排**：原本 `Revenue Trend` 與 `Revenue by Source` 在同一個 `.two-col`（1.4fr / 1fr），`Recent Transactions` 自己一行。新版改成 `Revenue Trend` 獨佔一行（全寬、柱狀更舒展），下方再用 `.two-col` `grid-template-columns: 1fr 1fr` 等寬兩欄並排 `Revenue by Source` + `Recent Transactions`。**2. stat-cell 元件升級**（共用 [dashboard.css](dashboard.css) 規則，影響 Earnings + Dashboard + design-system viewer）：新增 `.stat-cell__footer` wrapper（grid stacking — `grid-template-columns: 1fr` 把 hint 跟 period 疊在同一 cell），hint 與 period 都 `grid-area: 1 / 1` 共用底部空間。**反饋對調方向**：第一輪做成「default hint / hover period」，第二輪用戶說 period 是主資訊（spec §5.1.8 #3 強調「資料期間必須清楚標示」）、hint 才是 hover 補充。對調後：預設 `period` opacity:1、`hint` opacity:0；hover 觸發 `period → 0 / hint → 1`（180ms ease 漸變），border 加深至 `--border-emphasis`。`:has(.stat-cell__period)` gate 確保沒有 period 的 stat-cell 不受影響、`__hint` 仍預設可見（向後相容）。**3. 元件一致化**：Earnings 4 張 KPI 卡與 Dashboard 4 張 KPI 卡都套上同樣的 `__footer > __hint + __period` 結構 — Earnings 4 卡（Gross / Net = 本月 · Feb 2026、Pending / Available = 目前快照 · As of today），Dashboard 4 卡也補對應 period（同樣 month / now 兩組）。**4. design-system viewer 同步**：[design-system.html](design-system.html) §5.1.1 #2 Stat grid demo 4 張卡升級成新結構，meta 行加註 hover 行為說明。**5. 舊版 chip 刪除**：原本 `.stat-cell__period` 是獨立 chip（caption 跟 value 中間插入），現在已從 stack 結構替代，舊 CSS rule 整段刪除。**Cache 同步**：`dashboard.css v=43 → 45` 跨 15 頁（45 = 對調方向後再 bump）。**Playwright 驗證**：default 第 1 卡 → period opacity:1、hint opacity:0；hover → period:0、hint:1、border 加深；其他三卡未 hover 維持 period 顯示。 |

### A. Spec adjustments

| Spec § | 修改 |
|---|---|
| §5.1.8 Earnings 從「Overview 單頁」擴成「4 分頁完整模組」 | spec §5.1.8 更新後，將 [earnings.html](earnings.html) 從原本只有 Overview 內容、4 個 tab button 點不出東西的狀態，重做成完整 4 panel 切換的模組。詳見下方逐項說明：**a. KPI cards 加資料期間 chip**：新增 `.stat-cell__period` class（小寫 caps + calendar/clock icon 12px + 期間文字），4 張 KPI cards 都加上（Gross/Net = 本月 · Feb 2026、Pending/Available = 目前快照 · As of today）；spec 強制要求「不得只顯示數字」。**b. 移走「已付款 NT$ 720k」**：原本混在 Available card hint 裡的「已付款」按 spec 拿掉、Paid 已經在 Payouts panel 有獨立卡片不需要重複。i18n `earnings.stat.available.hint` 重寫成「可立即申請 Payout」。**c. Recent Transactions 加日期欄位**：新增 `.activity-row__date` class（micro caps，flex 推到右側、margin-left: auto），時間欄改用 `+ .activity-row__time { margin-left: 16px }` 緊跟在後；6 筆 activity-row 全部加 Feb 18 / 17 / 16 / 15 / 13 / 10 日期 chip。**d. 4 分頁實際切換**：tab button 加 `id` + `aria-controls`，4 panel 加 `id` + `aria-labelledby` + 預設 `hidden`（除 Overview）；底部新增 IIFE 處理 click / 鍵盤 / hash / `data-tab-link` 深連結 / chip group single-select。`View All Transactions →` 從 `<a href="#transactions">` 改成 `<button data-tab-link="tab-transactions">` 跳分頁。**e. Transactions panel**（新）：`.tx-filter-row` 7 chip + Export 按鈕；`.tx-table` 8 欄表（來源 / 日期 / 原始幣種 / 匯率 / 狀態 / 毛利 / 扣項 / 淨利 TWD），含 `.tx-table__source` 內嵌 icon + 兩行（名稱 + sub）、`.tx-table__rate` mono font、`.tx-table__status` 4 種 dot 顏色（--paid/--pending/--refund/--manual），`.tx-table__amount--gain/--loss` 對應正負色；< 900px breakpoint 表頭隱藏 + 每列堆疊。7 row sample 含跨幣種（USD/TWD/EUR）+ 1 row Manual 狀態示範手動補登在表中的呈現。**f. Payouts panel**：6 status grid 從 Overview 搬過來，每張卡升級成 `--ok` / `--pending` / `--alert` 三 variant（左側 2px accent rail，原 `--alert` 黃邊保留）+ 新增 `.payout-card__icon` 28px 圓角 icon container；新增 `.payout-flow-card` Request Payout 流程卡，header 主要按鈕 + summary 3 欄（付款帳戶 / 手續費 NT$ 30 / 預估入帳 3-5 工作日）含 sub-text。**g. Tax Documents panel**（新）：`.tx-filter-row` 2 chip（By Year / By Quarter）+ 年度下拉；`.tax-doc-list` + `.tax-doc-row` grid `auto 1fr auto auto`（36px file-text icon + 標題 + meta + 期間 chip + Download 按鈕）4 row 範例（2025 Annual / Q4 / Q3 + 2024 Annual）；`.region-strip` 顯示支援地區（Taiwan / Japan / United States / European Union）。**h. 手動補登收入區塊**：Transactions panel 底新增 `Manual Entries` section，用 `ztor-alert--info` + `.manual-marker` chip（pencil icon + 「手動 · Manual」micro caps）強調，含「新增手動補登」按鈕；tx-table 也有一筆 Manual 狀態示範 row。**i. 專案收益拆解區塊**：Overview panel 底新增 `Project Income Breakdown` section，用 `.project-breakdown-card` 含 header（標題 + sub + 開啟專案按鈕）+ `.project-breakdown-table` 5 row 對照表（毛收入 / 平台費 8% / 支付費 2.5% / 物流費 / 合作者分潤 15%）+ tfoot 淨利列 + `.project-breakdown-table__delta--gain/--loss/--flat` 三色差異欄。**新增 icons**（icons.js）：`download` / `file-text` / `clock` / `check` / `alert-circle` / `globe` / `external-link` / `receipt` / `repeat-2` / `arrow-up-right` 共 10 個。**i18n 補完**（i18n.js）：~50 個新 key（earnings.period.* / earnings.breakdown.* × 11 / earnings.tx.col.* × 8 / earnings.filter.* × 7 / earnings.status.* × 4 / earnings.manual.* × 3 / earnings.flow.* × 8 / earnings.tax.* × 4 / earnings.section.* × 4 / earnings.view-all-projects）；earnings.stat.available.hint / earnings.stat.gross.hint / earnings.source.other 3 個現有 key 改寫對齊新 spec。**Cache 同步**：`dashboard.css v=42 → 43`、`icons.js v=5 → 6`、`i18n.js v=8 → 9` 跨 15 頁。**Playwright 驗證**：4 個 tab 各別截圖 — Overview 顯示 KPI + Trend + Source + Recent Tx + Project Breakdown 五區塊；Transactions 顯示 filter chips + 8 欄表 + Manual Entries；Payouts 顯示 6 status cards + Request Payout flow；Tax Documents 顯示 By Year/Quarter 切換 + 4 doc rows + supported regions strip。spec 11 條全部覆蓋。 |


---

## 2026-05-21

### A. Spec adjustments

| Spec § | 修改 |
|---|---|
| §3.2.1 主導航重構成 7 個頂層（Dashboard / Projects / IP Bank▾ / E-Shop▾ / Events / Fans▾ / Earnings）| 舊版 5 組（總覽 / 探索 / 創作管理 / 商務營運 / 粉絲經營）以使用者行為分群，spec §3.2.1 改成以實際功能模組分群、Settings 仍只在帳戶選單。**新增三個 mega-dropdown 群組**：（1）**IP Bank ▾**：我的 IP（my-ip.html, icon `tag`）+ IP 市場（ip-market.html, icon `search`），兩個都從原本不同位置歸到同一個 IP 資產群；（2）**E-Shop ▾**：管理商店（e-shop.html, `shopping-bag`）+ 訂單（`#` placeholder, icon `package`，spec 新項、頁面待建）；（3）**Fans ▾**：粉絲列表（fans-crm.html, `users`）+ 忠誠計劃（`#`, `award`，待建）+ 公告（`#`, `megaphone`，待建）+ 粉絲活動（`#`, `rocket`，spec 標註「待定」）。**頂層 link（無 children）**：Dashboard / Projects / Events / Earnings 從原本巢在群組內變成獨立頂層。**Settings** 仍只在帳戶選單入口、不放主導航。**檔案動到**：[index.html](index.html)、[projects.html](projects.html)、[my-ip.html](my-ip.html)、[ip-market.html](ip-market.html)、[ip-detail.html](ip-detail.html)、[e-shop.html](e-shop.html)、[product-detail.html](product-detail.html)、[events.html](events.html)、[fans-crm.html](fans-crm.html)、[earnings.html](earnings.html)、[settings.html](settings.html)、[design-system.html](design-system.html) — 共 12 頁；wizard 3 頁（create-project / create-event / create-product）用 `wizard-topbar` 沒有主導航、不動。aria-current="page" 每頁正確標到頂層 + 對應子項。寫了 [tools/nav_rewrite.py](../../tools/nav_rewrite.py) 一次性 regex 替換 `<nav aria-label="主導航">...</nav>` 區塊。**icons.js** 新增 5 個 lucide icon: `package` / `users` / `award` / `megaphone` / `rocket`；**i18n.js** DICT 翻新 nav 區塊 — 移除 `nav.explore` / `nav.create` / `nav.business` 等舊群組 key、新增 `nav.ip-bank` / `nav.manage-eshop` / `nav.manage-eshop-sub` / `nav.orders` / `nav.orders-sub` / `nav.ip-market-sub` / `nav.fans-list` / `nav.fans-list-sub` / `nav.loyalty` / `nav.loyalty-sub` / `nav.announcements` / `nav.announcements-sub` / `nav.campaigns` / `nav.campaigns-sub`；`nav.overview` 的 en 從 `Overview` 改成 `Dashboard` 對齊 spec；`nav.fans` 從「粉絲經營」改成「粉絲」、`nav.ip-market` en 從 `IP Market` 改成 `IP Marketplace`。Cache `icons.js v=3 → 4`、`i18n.js v=7 → 8`。**未建頁面**：`nav.orders` / `nav.loyalty` / `nav.announcements` / `nav.campaigns` 四個 dropdown option 暫 `href="#"`，等對應頁面建立後填回 path。 |

### B. User-feedback adjustments

| 反饋 | 修改 |
|---|---|
| 頁面開場 page-intro 的按鈕尺寸跟元件庫不同 | 元件庫 demo 是 `<button class="ztor-btn ztor-btn--primary">`、瀏覽器 UA stylesheet 給 `<button>` 預設 `box-sizing: border-box`，所以 `height: 44px` 是總高 → 渲染 44px 沒問題。實際頁面（projects / earnings 等）用 `<a class="ztor-btn ztor-btn--primary">`，`<a>` 沒有 UA 的 box-sizing → fallback `content-box` → `height: 44px` 變成「內容區 44 + padding 10+10 + border」總共 65px。**根本修法**：base `ztor-minimalist-v2/components/button.css` 的 `.ztor-btn` 補上 `box-sizing: border-box`，讓元件不再依賴 element type（用在 `<button>` / `<a>` / `<input>` 都一致 44px）。同步複製到 `site/R 1.0/ds-components/button.css`，bumps `button.css?v=2 → v=3` 跨 15 頁。**驗證**：Playwright 量測 projects.html 的 page-intro primary CTA 渲染高度從 65px → 44px。 |
| Alert row 元件改版 — 圓形 icon + 同色淡底（風格不變、結構參考） | 舊版：白底 + 左側 2px accent bar（warn 黃 / info 灰 / error 紅）+ 24px 方框內小字 icon（`!` / `×` / `⏵`）。新版：**1. 整列同色淡底**：warn `rgba(255, 219, 41, 0.10)`、info `rgba(26, 26, 24, 0.04)`、error `rgba(198, 40, 40, 0.05)`；border 同色更淡（warn 0.35、info 0.10、error 0.20 alpha）；左側 2px accent bar 拿掉（因為整列底已經有色）。**2. 圓形實心 icon container**：32×32px、`border-radius: 50%`、bg 用實心狀態色（warn `--accent-yellow`、info `--surface-inverse`、error `--status-error`），裡面放 16px lucide SVG icon（白/深字看底色決定）— warn 黃底配 `--text-accent-on` 深字、info / error 深紅底配 `--text-invert` 白字。**3. lucide icon**：text symbol 換成正規 SVG — warn `alert-triangle`、info `info`、error `x`；icons.js REGISTRY 新增 `alert-triangle` + `info`。**4. grid**：`24px 1fr auto` → `32px 1fr auto` 配新 icon size。**保留**：title (caps 11px) / desc (body 13px) / source (micro caps) / cta (caps underline) 全部不動；只動 icon 與 row 視覺。**檔案**：[dashboard.css](dashboard.css)（重寫 `.alert-row` / `.alert-row--*` / `.alert-row__icon` 共 13 行 → 36 行）、[icons.js](icons.js)（+2 icons）、[index.html](index.html)（4 個 row 換 icon markup）、[design-system.html](design-system.html)（3 個 demo row 同步 + demo meta 改文案）。Cache `dashboard.css v=41 → 42`、`icons.js v=4 → 5` 跨 15 頁。**驗證**：Playwright 量測 4 個 row 在 index.html 都正確渲染（圓形 32px、淡色底、SVG icon `alert-triangle` / `x` / `info`）。 |
| design-system viewer 視覺改版 — sticky tab bar + sticky mini TOC + 全色票 + 字體雙樣本 | **1. Tab bar (`設計語彙 / Design Tokens` + `元件 / Components`) sticky 在頁面頂部**：`.ds-tabs` 加 `position: sticky; top: 0; z-index: 20; background: var(--surface-canvas); padding-top: 24px`；margin-bottom 從 64px → 0（mini-toc 接在下方）。**2. Mini TOC (Foundations / Colors / Typography / Spacing / Radius / Icons 等) sticky 在 tab bar 下方**：`.ds-mini-toc` 加 `position: sticky; top: 92px; z-index: 19; background: var(--surface-canvas)`；padding 從 `0 0 32px` 改 `16px 0`；加 `align-items: center` 讓兩排對齊。**3. anchor 跳轉補償**：`.ds-section { scroll-margin-top: 32px → 160px }` 給兩條 sticky bar 留空（tabs 99px + mini-toc 46px ≈ 145px）。**4. 顏色加 All / 全部使用色 區塊**：在 `#colors` section 最前面新增第一個 ds-sub，列出 20 個 swatch — dedup by hex 涵蓋 light surface ramp（FAFAF7 / F0F0EC / E5E5E0）、neutral data viz ramp（D0D0C8 / C9C9C0 / A8A8A0）、text mid（5F5E5A）、dark surface ramp（1A1A18 / 14140F / 0A0A0A）、唯一彩度（FFDB29 / E6C525）、status（2E7D32 / C62828）、6 個 brand exceptions（Spotify / YouTube / Instagram gradient / StreetVoice / TikTok / Discord）；每格列出指向同 hex 的所有 token name；下方原 Surface / Text / Border 分類保留作為角色拆解。**5. Typography 9 個 type-row 重做**：原 `[<code>EN font · spec</code>]` 內嵌格式拆成三段 — `.type-row__label-cn` / `.type-row__label-en` 中英 role；新 `.type-row__spec` 區塊用 3 個 monospace chip 分別列「EN · Space Grotesk / Inter · weight」、「CJK · Taipei Sans TC · weight」、「size · letter-spacing · case · 句號規則」；右側預覽從單一樣本擴成 `.type-row__samples`（flex column gap 8px）裝 Latin + CJK 兩個樣本（stat number / brand 只有 Latin 一份）讓兩種字體並列檢視。**6. Rogue inline style 清理**：ip-market.html 的 8 張 `class="entity-card" style="text-decoration:none;color:inherit"` 改用既有 `.entity-card--link` modifier（順便獲得 hover translateY(-2px)）；其他 inline style（page-context margin tweaks）屬合理範圍，留下。`design-system.html` 修改 230+ 行 viewer 結構與內容；非元件層動到，所以 dashboard.css / icons.js / i18n.js 沒動、不需要 bump 版本號。 |
|---|---|
| nav-group dropdown 改成 mega 設計（參考圖：icon + title + subtitle 卡片陣列）色系跟著調整 | `.app-topbar__dropdown--mega` modifier：min-width 420px、2 欄 grid、padding 12px、soft shadow；新 rich option `.app-topbar__dropdown-option--rich`：40×40 icon container（radius 10、`--surface-secondary` 預設 / hover 變 `--text-primary` 黑底 / 當頁變黃 `--accent-yellow`）+ title 14px/500 + sub 12px secondary；icons.js 新增 4 icons（`tag` / `shopping-bag` / `calendar` / `trending-up`）；i18n 加 5 個 sub key；avatar dropdown 保持簡單 list（rich 樣式只套 mega 變體）；12 個產品頁同步 |
| Typography 微標 / 說明文字 10px → 12px | 全站 micro / caption / label / eyebrow tier 統一上調 2px；dashboard.css 42 處 + 各 HTML inline style 多處（wizard topbar「草稿 · 自動儲存」、review-list 編輯入口、design-system viewer demo meta 等）全部換；design-system.md typography 表格的 micro / caption 行從 10px 改 12px、註記日期 |
| Typography 改從 base design system 源頭改（10 → 12 token 化）| 將前一筆「散點各自改 12」重構為單一 source of truth：**base 層** `ztor-minimalist-v2/components/page.css` :root 新增 `--font-size-micro: 12px` token；該 base 24 個 component css（navigation-menu / typography / drawer / chart / hover-card / sheet / slider / page / eyebrow / form / button / badge / sidebar / table / breadcrumb / avatar / calendar / command / card / aspect-ratio / dropdown-menu / data-table / context-menu / carousel / combobox / date-picker）+ sample.html 內所有 `font-size: 10px` 全部換成 `font-size: var(--font-size-micro)`；base `design-system.md` 5 處文案同步引用 token。**project 層** dashboard.css 42 處 12px micro 標籤改成 `var(--font-size-micro)`（不再寫死 px、和 base 共用同一個 token）；project `design-system.md` typography 表 + stat block anatomy 改寫成引用 token。現在改一個 token 整套（base + 本專案）一齊變。 |
| 專案頁面切換到列表 view 點了沒反應、卡片沒有變列表 | 補上實際的 list view 樣式與切換邏輯：dashboard.css 新增 `.cards-row--list` modifier（vertical stack of horizontal rows、cover 200px 縮圖在左、body 用 grid 把 eyebrow/title/meta 放左欄、footer 推到右欄垂直置中、progress bar 跨欄置底；< 700px 退回 column 堆疊）；projects.html + e-shop.html 的 view-toggle JS 從「只切 aria-pressed」升級成「同時 toggle `.cards-row--list` class on 同 section 的 `.cards-row`」；列表/卡片切換即時生效 |
| page-intro 下方底線拿掉 | `.page-intro` 移除 `border-bottom` + `padding-bottom: 24px`（H1 + primary action 直接接下方 filter row / cards，不再插入 hairline 分隔線；視覺更連貫、avoid divider 堆疊）|
| 列表 view 改成 table 形式（compact 表格列） | dashboard.css `.cards-row--list` 重寫成真表格佈局：欄寬 `80px 2fr 1fr 1.2fr 1.6fr`（狀態 / 名稱 / 類型 / 進度 / 數據），cover 隱藏、status-pill 透過 `display: contents` hoist 到第 1 欄；新增 `.cards-row__head` 表頭列（只在 `--list` 時 grid 顯示，淺灰底 `--surface-subtle`、small caps 欄位名）；projects.html cards-row 內第一個 child 加上 `.cards-row__head`；view-toggle JS 改以 icon (`[data-lucide="list"]`) 判斷模式，aria-label 翻譯不會破壞 toggle 行為 |
| 資料列表 Data list 高度太擠、間距太小、左右兩側排版要重做 | `.data-list__row` padding `16px 20px → 20px 24px`、`min-height: 96px`、`align-items: stretch`、`gap: 24px → 32px`；`.data-list__primary` 改成 column flex + `justify-content: space-between`，並用 CSS `order` 排序（text-node title=0、`.data-list__secondary` order=2、`.data-list__status` order=3 + `margin-top: auto`）→ 視覺順序變成 title → 副標 → status pill（HTML 不動）；`.data-list__amount-group` 跟 `.data-list__amount` 都加 `align-self: stretch`、amount group 自己變 column space-between，所以金額在上、原幣/匯率敘述在下、撐滿 row 高度；arrow 用 `align-self: center` 保持垂直置中。**設計 token 註記**：base design system 目前沒有 spacing token，這次仍用 literal（20/24/32px / min-height 96px），未來若多種列密度（compact / cozy / comfortable）會考慮加 `--row-density-*` token 化 |
| i18n 切換不完整、許多頁面中英文參雜 | projects.html 補齊：filter row 三組 select 的 label + 全部 `<option>`（status × 8、type × 10、sort × 4）、view-toggle 兩個 button aria-label + group aria-label、cards-row column header 5 欄、7 張 project card 的 cover badge / eyebrow / meta / detail-list k 標籤 / 部分 v 值都加 `data-i18n`；i18n.js DICT 一次補 80+ keys（status / type / col / badge / data / val / card.projN.* 多套），並把混 ZH/EN 的 `tab.products` 等 ZH 值清成純中文（"Products · 商品" → "商品"）。view-toggle JS 從「比對 aria-label 中文字串」改成「偵測 icon `[data-lucide="list"]`」避免翻譯破壞功能；其他頁面（events / e-shop / my-ip / fans-crm / earnings / settings / detail 頁）尚未補齊，下一輪繼續 |
| i18n 切換在 dashboard 仍壞掉、許多 CN 殘留 | 用 Playwright DOM walker 稽核發現 index.html 有 99 處 CJK 文字未掛 `data-i18n`（hero / stat-cell / data-list / alerts / activity / entity cards / split block / integration cells 全部沒掛）。一次補齊：用 python 批次替換 94 處 + 一處重複的 `已連結` 手動補；i18n.js DICT 一次補 ~85 keys（hero.* / section.* / stat.*.caption / stat.*.hint / status.* / dl.* / fx.* / alert.*.title / alert.*.desc / alert.src.* / alert.cta.* / activity.* / time.* / card.dashN.* / kv.* / integ.*）。**核心 i18n.js 改動**：`apply()` 對 `[data-i18n]` 元素從 `textContent = v` 改成 `innerHTML = v`，這樣 DICT 字典值可以含 `<strong>` / `<br>` 等 inline tag（DICT 是受控字典、不是使用者輸入，可信任）。view-toggle JS 同步從 aria-label 中文比對改成 `[data-lucide="list"]` icon 比對。**驗證**：Playwright 切到 EN 後再 walk DOM，CJK 殘留只剩「繁中」（語言切換按鈕的標籤、預期保留）。Cache `dashboard.css v=32 → 33`、`i18n.js v=2 → 3`。**其他頁面（e-shop / events / my-ip / ip-market / fans-crm / earnings / settings / 各 detail / wizard）**仍待補齊 |
| 全站 i18n 一次補完（剩下 14 頁全做完）| 兩波處理：**Wave 1（手動 + 結構標記）**covers e-shop / events / my-ip / ip-market / fans-crm / earnings / settings — 每頁用 python `re` 批次 wrap filter labels、`<option>` 元素、card eyebrows / metas / titles、stat-cell captions / hints、table rows、status pills、整合區塊等共 ~230 個 keys；對應 DICT 集中放在 `tools/manual_dict.py`，最後 emit 進 `i18n.js`。**Wave 2（自動 wrap）**covers product-detail / ip-detail / create-product / create-event / create-project — 寫了 `tools/auto_i18n.py`（用 BeautifulSoup walk text nodes、掃描含 CJK 字符的 NavigableString、parent 只有 text 就 tag parent / 否則 wrap `<span data-i18n="...">`、跳過 script/style/textarea/已在 data-i18n 內），五頁總共 wrap 出 592 個 text node，dedup 後 532 個 unique ZH 字串；翻譯字典寫在 `tools/translations.py` 共 532 條，再 emit_dict 進 `i18n.js`。i18n.js DICT 從 ~165 行成長到 1216 行。**驗證**：Playwright 跨 14 頁 DOM walk + setLang('en')，殘留 untagged CJK 統計 = `{每頁 1（"繁中" 語言按鈕標籤、預期保留）, product-detail = 0（按鈕標籤本身被 wrap 了）}`。`dashboard.css v=33 → 34`、`i18n.js v=3 → 5`、`ds-components ?v=2`（base 沒動）。**工具留下** `tools/auto_i18n.py` / `tools/translations.py` / `tools/manual_dict.py` 給之後新增頁面與調整翻譯用。 |
| 系統活動時間軸：內容+標籤靠左、時間靠右、每列加高一級 | `.activity-row` 從 `grid 1fr auto auto`（三欄分開排）改成 `flex` + `gap: 16px`，`.activity-row__text` + `.activity-row__tag` 自然並排（兩者一組，tag 緊跟在內容後面 16px gap），`.activity-row__time` 用 `margin-left: auto` 推到最右；padding `14px 0 → 20px 0`、新增 `min-height: 64px` 把列高加大一級 |
| IP 市場頁面「24 個可授權 IP」筆數刪除 | 移除 `.results-summary__count` 元素（results-summary 只留排序 dropdown）— 跟之前「專案 / 活動 不需要寫有多少個數量」一致 |
| 建立流程上方的步驟元件改成 rich column-strip 樣式（參考 Figma Beamco Artist Portal v3）| 整套 `.stepper` 從橫向「數字 pill + 標籤 + dash」改寫成全寬欄位 strip：每個 step 是一格獨立直欄，內含「狀態 label（Editing/Incomplete + 可選 icon）/ 步驟名稱（15px primary） / 子描述（12px secondary，最多兩行）」三層；step 之間用 hairline `border-right` 分隔；active step 底部有 2px 黃色橫線（蓋住 topbar 底邊框）。`.wizard-topbar` 從 `height: 80px` 改 `min-height: 88px`、`align-items: stretch`，close X 變成 88px 寬的左欄（含右 hairline、hover `--surface-subtle`），「草稿 · 自動儲存」變成 `.wizard-topbar__draft` 右欄（含左 hairline）。create-project / create-product 用各自原本的 4 個 step；create-event 之前是單頁、這次加上 4 個 step（活動基本資料 / 票種設定 / 通知與報到 / 發布確認）— 雖然目前實作只有第一個 step 是表單、後 3 個是 visual roadmap，但 stepper 樣式跟另外兩支對齊。i18n.js 新增 `step.status.editing / incomplete / completed` + 12 個 `step.{cpj/cp/ce}.N.sub` keys。`dashboard.css v=36 → 37`、`i18n.js v=5 → 6`。 |
| design-system.html 的 stepper / wizard 元件預覽沒同步、wizard footer 左側「保存並稍後回來」要拿掉 | 第一個是漏改：上一筆只更新了真實 wizard 頁、忘了 design-system viewer 的 `.stepper` + `.wizard-topbar` 兩個 demo block；這次把兩個 demo 改成新 rich-column 結構（status / name / sub 三層、active 底有黃線）、demo meta 文案同步。第二個改動：移除三個 create wizard footer 與 design-system wizard demo 的 `.wizard-footer__save` 元素（「保存並稍後回來 · Save and come back anytime」整段文字 + i18n key 一併拿掉），`.wizard-footer` 從 `justify-content: space-between` 改 `flex-end`、actions 自然靠右；`.wizard-footer__save` CSS 也刪掉（不再使用）。`dashboard.css v=37 → 38`。 |
| 結果摘要 Results summary 元件預覽 + CSS 對齊「不顯示筆數」現況 | design-system viewer 的 Results summary demo 之前還在示範舊版「24 個可授權 IP」計數，這次把 `.results-summary__count` 元素從 demo 拿掉、只留排序 dropdown；demo meta + section desc 也改寫成「Sort dropdown only · row count removed」並註記跟 projects / events / IP market 一致。dashboard.css 把 `.results-summary` 從 `justify-content: space-between` 改 `flex-end`（單一 child 直接靠右）、`.results-summary__count` + `__count strong` 兩段 CSS 規則整段刪除並留下註解避免之後又被加回來。`dashboard.css v=38 → 39`。 |
| Stepper 三個狀態（Completed / Editing / Incomplete）統一加 icon | 之前只有 Editing 有 pencil、Completed 與 Incomplete 純文字、視覺不一致。這次三個都加：**Completed** = `check-circle`、**Editing** = `pencil`（已有）、**Incomplete** = `circle`（空心圓）。icons.js REGISTRY 新增 `pencil` / `check-circle` / `circle` 三個 lucide SVG。design-system viewer 的 Stepper demo（4 格）+ Wizard demo（2 格）共 6 個 status span 全部包成 `icon + label`；create-project / create-product / create-event 三頁的 9 個 Incomplete span 也都加上 circle icon。`icons.js v=2 → 3`、`dashboard.css v=39 → 40`。 |
| 整理 dashboard.css 全部顏色、與 design tokens 對齊 | 稽核 dashboard.css 共 44 個 color literal，分四類處理。**A. token 化（替換 literal → `var(--token)`）**：`#2E7D32 → --status-success` (×4 status-pill dots)、`#1A1A18 → --surface-inverse` (×3 tier-bar/-dot/-pill inner)、`#FFDB29 → --accent-yellow` (×2 在 tier 元件)、`#5F5E5A → --text-secondary` (×2 stacked-bar/source-dot royalty)、`#0A0A0A → --surface-dark-cta` (integration-icon--x)、`#fff → --text-invert` (×2 整合 icon 文字)。**B. 新增 project 擴充 token** 寫進 dashboard.css :root：`--neutral-300: #D0D0C8` / `--neutral-400: #C9C9C0` / `--neutral-500: #A8A8A0`，這 3 階暖灰中間色用在 tier-bar/-dot/-pill `--devoted` (×3) 與 stacked-bar/source-dot `--licensing` / `--support` (×4)；介於 `--surface-secondary` (#E5E5E0) 與 `--text-secondary` (#5F5E5A) 之間、組成 5 階 categorical 灰階梯。**C. 規格化 rgba**：`rgba(220, 38, 38, 0.03) → rgba(198, 40, 40, 0.03)` 讓 `.alert-row--error` 背景 tint 跟 `--status-error` (#C62828) 同源；其他 rgba（accent-yellow / surface-secondary / text-primary 的不同 alpha）都已對應現有 token 不需動。**D. 例外**：`#14140F`（hero IP slide 暗色微調，single-use）+ 6 個第三方 brand color（Spotify / YouTube / Instagram gradient / StreetVoice / TikTok / Discord）保留 literal、加註解。project `design-system.md` §1.1 Colors 新增「project-level 擴充 token」「半透明色（rgba）使用守則」「例外」三個子表；引言段標明本專案沿用「中性 + 單一黃」、neutral ramp 屬於中性擴充、沒引入新彩度。`dashboard.css v=40 → 41`。 |
| Icon stroke-width 1.5 → 2 | icons.js 注入的 `stroke-width` 由 1.5 改 2（Lucide 預設值），讓 icon 線段更粗顯、與 12px 微標的視覺重量對齊；icons.js 加 `?v=2` cache buster |
| 已選的底色改更淺灰色 + icon container 的黑底換黃色 | 新增專案級 token `--surface-subtle: #F0F0EC`（介於 canvas `#FAFAF7` 與 secondary `#E5E5E0` 之間）並寫進 dashboard.css :root；rich option 的 hover + aria-current 列底改用此 token（取代原 `--surface-secondary`）；icon container hover 由原 `--text-primary` 黑底改用 `--accent-yellow` 黃底，等同 aria-current 的視覺，hover 與 active 統一表現 |
| Earnings 頁 i18n 補完（CN 模式下許多區塊只有單一語言、切到 EN 也不會動） | earnings.html 補上 27 處 `data-i18n`：page-intro 兩顆按鈕（Export / Request Payout）、4 個 `app-section__title`（Revenue Trend / Revenue by Source / Recent Transactions / Payout Status）、`View All Transactions →` link、`stacked-bar` 5 個 segment（E-Shop / Events / Royalty / Lic. / Sup.）、`source-list` 6 個 key 包成 span（E-Shop Sales / Event Tickets / IP Royalties / Licensing / Project Support / Other）、trend chart legend 的「Revenue」、activity-list 6 個 `activity-row__tag`（E-Shop / Events / Payout / IP Royalties / Refund / Licensing）、最後一列「Indie Wave Brand · Licensing fee · Indie Project」拆出 `earnings.tx.licensing-indie` span、payout-grid 6 個 `payout-card__label`（Pending / Available / Payout Requested / Paid / Failed / Disputed）、tabs 的 `aria-label` 加 `data-i18n-aria-label`；i18n.js DICT 加 30 keys（btn.export / btn.request-payout、tag.eshop/events/payout/royalties/refund/licensing、earnings.section.* × 4、earnings.legend.revenue、earnings.view-all-tx、earnings.bar.* × 5、earnings.source.* × 6、earnings.payout.label.* × 6、earnings.tx.licensing-indie、earnings.tabs-aria）。`i18n.js v=6 → 7`。 |
| Earnings 頁中英混排清理（CN 模式不再出現英文） | 反饋發現 Earnings 在 CN 模式下仍出現「總收入 · Gross」「Overview · 總覽」「Payout request #PR-0814 · 玉山銀行」這種中英混合、以及「EARNINGS」h1 / 月份縮寫 Sep-Feb 等純英文。**A. 清純 zh 值（不再「中 · 英」並列）**：i18n.js 共改 14 條 — `page.earnings.h1` (Earnings → 收入管理)、`stat.gross/net/pending/available.caption`（移除 「· Gross/Net/...」尾巴）、`stat.available.hint`（Payout → 提款）、`earnings.stat.available.hint`、`earnings.stat.gross.caption`、`earnings.subtitle`（移除 「· Track income...」）、`earnings.tab-overview / -transactions / -payouts / -tax-docs`（拿掉前綴英文）、`earnings.trend-note`（Feb → 2 月）、`earnings.tx.payout-pr0814`（Payout request → 提款請求）、`earnings.tx.licensing-indie`（Indie Project → 獨立專案）、`earnings.source.other`（Collab + Fanvestor → 合作 + 粉絲投資）。`NT$` / `IP` / `#PR-0814` / `#REF-0029` 等保留（貨幣、ID、普世術語）。**B. 月份縮寫加 i18n**：trend chart 6 個 bar label（Sep/Oct/Nov/Dec/Jan/Feb）加 `data-i18n="month.sep/oct/.../feb"`；i18n.js DICT 補 12 個 month.* keys（zh: '1 月'~'12 月', en: 'Jan'~'Dec'）以便未來使用。**C. 全站 cache 同步**：所有 15 頁的 `i18n.js?v=6 → v=7`（DICT 值改動，需要全站 invalidate）。 |

### D. Infrastructure（無視覺影響）

| 項目 | 動機 |
|---|---|
| `app/` 改名 + 搬到 `site/R 1.0/` 並部署 Vercel | 整套產出從 `Project/ztor-creator-studio/app/` 用 `git mv` 搬到 `Project/ztor-creator-studio/site/R 1.0/`（保留 git rename history）。Vercel 專案沿用 `prj_hPSAxbklBOHyUXBpfi9tscswJp3a`、改名為 `ztor-v2-creator-studio-r1.0`、`vercel link` + `vercel deploy --prod`。原乾淨網址 `https://ztor-v2-creator-studio.vercel.app/` 仍然繼續服務（同一 project alias 保留）。SPEC.md「目前實作中的 app 樣貌」路徑同步改成 `site/R 1.0/`。 |
| `ds-components/` 從 symlink 改成實體複製 | 第一次部署上去發現整站只剩 topbar、main 區塊空白：因為 `ds-components/` 是指向 `../../../Design/Design System/ztor-minimalist-v2/components` 的 symlink，搬路徑後相對層數變化、加上 Vercel CLI 不會 follow 走出 project 邊界的 symlink，導致 base design system 的 24 個 component CSS（page / button / card / badge / form…）全部 404、整站樣式崩潰。**處置**：刪除 symlink、用 `cp -R` 把整份實體檔複製進 `site/R 1.0/ds-components/`，重新 `vercel deploy --prod`，全部 200。**新慣例**：之後改動 base design system（`Design/Design System/ztor-minimalist-v2/components/`）後，必須手動同步：`cp -R "Design/Design System/ztor-minimalist-v2/components/." "Project/ztor-creator-studio/site/R 1.0/ds-components/"` 再重新部署。 |

---

## 2026-05-21 (last)

### A. Spec adjustments

| Spec § | 修改 | Files |
|---|---|---|
| 03 §5.1.9 全部 | 從零建 `settings.html` — 6 個分區（Profile / Appearance / Notifications / Privacy & Security / Payments / Integrations）+ sticky 側邊 nav（scroll 自動 active）+ 各分區依 spec 完整覆蓋：頭像上傳 + Basic info（6 欄含 username @prefix + Bio 字數即時計算）+ Theme 3 radio-card + 3 類通知（Email / Push / In-App）含 toggle-switch + Privacy 4 toggles + Security 3 row（Password / 2FA / Data Export）+ **Danger Zone**（紅框 + Delete Account 紅鍵 + 不可逆說明）+ Payout Method（Primary + Add New）+ Payment Settings + Tax Info 含已驗證 status + **Integrations**：Connected 3 個（含 Instagram 同步失敗範例）+ Available 4 個 + 7 個平台 logo（Spotify / YouTube / Instagram / StreetVoice / TikTok / X / Discord）| settings.html (新檔) + dashboard.css (`.settings-layout` / `.settings-nav` / `.settings-section` / `.settings-group` 含 `--danger` / `.toggle-switch` / `.settings-row` / `.settings-toggle-row` / `.integration-list` / `.integration-row` / `.integration-icon` 7 變體 / `.ztor-btn--danger` / `.field__prefix-wrap` / `.field__prefix`) |

---

## 2026-05-21 (later)

### A. Spec adjustments

| Spec § | 修改 | Files |
|---|---|---|
| 03 §5.1.4 全部 | 從零建 `my-ip.html` — page-intro（My IP / Your intellectual property on Ztor / + Add your IP）+ Leaderboard / Rented tabs + 4 KPI（Total IP / Total rentals / Total IP revenue / 本月授權收入）+ 自動建立 IP record 提示 + Marketplace toolbar + 兩個分組區塊（IP I made on Ztor / IP I own outside Ztor）含 ip-table 8 欄（IP / Owner / Rented / Revenue / Share % / Rental Price / Mktplace / Manage）+ Marketplace ON/OFF 圖例；row 連到 ip-detail | my-ip.html (新檔) + dashboard.css (`.ip-table` / `.toggle-pill` / `.app-section__title-meta` / `.page-intro__sub`) |
| 03 §5.1.7 全部 | 從零建 `fans-crm.html` — page-intro（Your fans, ranked / Leaderboard updates nightly / Export + Message）+ Leaderboard / Hall of fame tabs + 4 KPI（Active fans / At risk / Revenue active / Avg Reputation）+ **Who's who 4-tier 分級分布橫條**（Inner Circle / Superfan / Devoted / Fan 含收入細節）+ Tier settings / Edit benefits + **流失風險 alert（5 fans at risk of dropping + Message them）** + 搜尋 + 分級 + 快速篩選 + 排序 + Fans table 7 欄（Fan / Tier / Reputation / Spent / Progress / Status / action）| fans-crm.html (新檔) + dashboard.css (`.tier-bar` / `.tier-revenue` / `.tier-dot` / `.tier-pill` / `.fans-table` / `.ztor-avatar`) |
| 03 §5.1.8 全部 | 從零建 `earnings.html` — page-intro（Earnings + 期間下拉 + Export + Request Payout）+ 4 tabs（Overview / Transactions / Payouts / Tax Documents）+ **4 KPI cards 待結算可提領嚴格分開** + **Revenue Trend 6 月柱狀** + **Revenue by Source stacked bar + 6 來源清單** + Recent Transactions 6 筆（活動軸樣式、+ / − 顏色）+ **Payout Status 6 卡片**（Pending / Available / Payout Requested / Paid / Failed / Disputed）| earnings.html (新檔) + dashboard.css (`.trend-chart` / `.stacked-bar` / `.source-list` / `.payout-grid` / `.payout-card`) |

---

## 2026-05-21

### A. Spec adjustments

| Spec § | 修改 | Files |
|---|---|---|
| 03.2 §2.5 | 補「我的 IP 進入時顯示」區段 — 登記資料 / 租入資訊 / 市場設定 / 到期處理 / 法律提示 + 返回 My IP + 編輯市場設定 + 下架按鈕；視覺以 `--surface-secondary` 區隔、加 `My IP 視角` badge | ip-detail.html + dashboard.css (`.detail-meta-block--my-ip` / `.detail-meta-block__subtitle`) |
| 03.2 §3.1 | 租用期間加「自訂」radio + 月份輸入 panel + 即時計算（base 12,000/月、6+/12+ 月折扣）| ip-detail.html (script) |
| 03.4 全部 | 從零建 `product-detail.html` — breadcrumb + page-intro + cover + 商品基本資料 / 內容素材 / 價格庫存交付 / 限定條件 / 銷售摘要（引用 Earnings 標示）/ 專案引用 + sticky pricing-box 變體 + 上架檢查狀態 box | product-detail.html (新檔) + dashboard.css (`.detail-meta-block__source`) |
| 03.5 全部 | 從零建 `create-product.html` — 4-step wizard：類型 + 基本 / 素材 + 描述 / 價格 + 庫存（**依 6 種商品類型動態展開** 庫存物流 / 數位存取 / 限定 / 套組 / 拍賣 區塊）/ 狀態 + 檢查 | create-product.html (新檔) + dashboard.css (`.conditional-by-type` 利用既有 `.conditional-panel` pattern) |
| 導航 | 新建 `e-shop.html` 列表頁讓 03.4 / 03.5 可從 topbar 走到 — 主篩選 tabs (Products / Bundles / Auctions) + dropdown filter toolbar + 4 entity-card 範例（Live / Low Stock / Sold Out / Draft 四狀態）| e-shop.html (新檔) + dashboard.css (`.tabs` / `.tabs__item` / `.entity-card--link`) |

### B. User-feedback adjustments

| 反饋 | 修改 |
|---|---|
| 整個網站做英文版本，讓中英切換的 toggle 可用 | 建 `i18n.js`（中央字典 + `data-i18n` / `data-i18n-placeholder` / `data-i18n-aria-label` DOM walker + topbar lang button toggle + localStorage 持久化）；8 個 HTML 加 `<script src="i18n.js">`；topbar 14 個 i18n 屬性 × 8 頁 = 112 個 i18n tags；4 個 page H1 + 3 個 primary CTA 標記。深層 wizard 內容已有 inline 雙語（"Pay per view · 一次性購買"），維持並存 |

### D. Infrastructure

| 項目 | 動機 |
|---|---|
| 建立 `app/SPEC.md` | 依 `project-ui-creator` skill 的新 Edit Cycle Protocol 要求；描述「現在的真相」（已建頁面 / sitemap / 文案 / 全站規則 / 共用元件），不是 PRD 願景；未來編修先讀此檔、改完同步回此檔 |

---

## 2026-05-20 (later)

### A. Spec adjustments

| Spec § | 修改 | Files |
|---|---|---|
| §5.4 平台費 | 新增獨立區段顯示「固定 15%」alert（先前只在收益估算明細出現）| create-project.html (Step 3) |
| §5.5 廣告 | 啟用後展開位置選擇：前貼片 / 中貼片 / 後貼片 / 橫幅 4 個 checkbox-card | create-project.html + dashboard.css (`.checkbox-grid` / `.checkbox-card` / `.conditional-panel`) |
| §5.6 品牌合作 | 啟用後展開「合作品牌清單」可動態新增 / 移除條目（品牌名 / 類型 / 金額）| create-project.html + dashboard.css (`.brand-list`) |
| §6.3 What happens next | 改成依專案類型動態切換文案（Go live / Fund it first / Pre-order 3 套）| create-project.html (script) |
| §6.5 發布操作 | footer 新增顯式「儲存草稿」button（ghost 樣式），與「返回」「下一步 / 發布專案」並列 | create-project.html + dashboard.css (`.ztor-btn--ghost`) |

### B. User-feedback adjustments

| 反饋 | 修改 |
|---|---|
| 數據摘要格改成卡片方塊（參考截圖：每筆獨立卡、有說明文字） | `.stat-grid` 由 4 欄 hairline 連格改成 16px gap 卡片陣列；`.stat-cell` 加邊框 + radius-callout + 28px padding；新增 `.stat-cell__hint` 選用欄位顯示說明文字；響應式 4 → 2 → 1；index.html + design-system.html 同步 |
| 總覽 Hero Banner 改成全屏設計 | 新增 `.hero-carousel--fullscreen` modifier：移出 `.app-main` 容器到 viewport 全寬、高度 `calc(100vh - 80px)` / min-height 520px；改 grid stack 讓 `.hero-slide__visual` 鋪滿、`.hero-slide__overlay` 疊在上層做漸層遮罩；標題 clamp(40,6vw,72px)；indicators / controls 移到 64px 邊距 |
| 系統活動時間軸：前面內容 + 模組標籤、後面時間 | `.activity-row` grid 由 `100px 1fr auto` 改 `1fr auto auto` (text / tag / time)；time `justify-self: end`；index.html + design-system.html 5+2 筆 DOM 順序對齊 |
| 頁面開場的標題上下不需要文字 | `.page-intro` 移除 `<span class="ztor-eyebrow">` 與 `<p class="page-intro__desc">`；只留 H1 + primary action；CSS 刪 `.page-intro__desc`、H1 margin 歸零；影響 projects / events / ip-market / ip-detail / design-system 五處 |
| 專案 / 活動列表不需要寫有多少個數量 | `.results-summary` 移除 `<p class="results-summary__count">` (7 個專案 / 5 個活動)；保留排序與檢視切換靠右；CSS 的 `.results-summary__count` 規則暫保留為 dead code |
| 篩選改成下拉設計，原本的 chip 在元件庫保留 | 新增 `.filter-row__field` + `.filter-row__select`（native `<select>` + chevron + chip 高度）；projects (2 filter) / events (2 filter) / ip-market (6 filter) 全部改下拉；`.filter-chip` 樣式不動、HTML 保留在 design-system.html `#ext-filter-chip` 標 "preserved variant"；新節 `#ext-filter` 為預設 dropdown 樣式 |
| 篩選列 + 排序 / 檢視切換放同一行 | 新增 `.filter-row--toolbar` (padding-bottom + hairline) 與 `.filter-row__end` (margin-left: auto)；projects + events 合併為單行 toolbar：左 filter 下拉、右 sort 下拉 + view-toggle；移除中間 `.results-summary` wrapper |

### A. Spec adjustments

| Spec § | 修改 | Files |
|---|---|---|
| §3.2.1 | 主導航重做：5 個主分類（總覽 / 探索 / 創作管理 / 商務營運 / 粉絲經營），多子項 group 用 dropdown 揭露子頁 | 6 HTMLs + dashboard.css + topbar.js |
| §3.2.1 | 設定移出主導航，放進 avatar 帳戶選單 | 6 HTMLs |
| §3.2.2 #1 | Search icon-only button，點擊開啟 search panel（含 input、ESC 提示）| 6 HTMLs + dashboard.css + topbar.js |
| §3.2.2 #2 | 通知與待辦：Bell button + badge dot | 6 HTMLs + dashboard.css |
| §3.2.2 #4 | 語言切換：繁中 / EN toggle | 6 HTMLs + dashboard.css |
| §3.2.2 #5 | Avatar dropdown：Profile / Settings / 登出 三項（spec 明列）| 6 HTMLs + dashboard.css + topbar.js |
| §5.1.x | Status pill 多色系（available / pending / paid / failed / draft / live / scheduled / funded / completed / cancelled）| dashboard.css |
| §5.3.2 | 狀態語言混用（收入英中混 / 專案商品活動全英 / 外部整合全中）| 各頁面 |

### B. User-feedback adjustments

| 反饋 | 修改 |
|---|---|
| Section heading 不要結尾「。」、H2 改 H3 視重 | `.app-section__title` 改 20px + 無句號，影響 dashboard 7 個 section、design-system viewer 36 個 section |
| 完整三階字體 H1 / H2 / H3 | 新增 `.app-section__title--major` modifier 為 H2；H3 為預設區塊標題 |
| Eyebrow 去掉 `[ ]` 方括號 | 移除 `ztor-eyebrow--auto-brackets` modifier 與手打的 `[ TEXT ]` 包覆，全站 50+ 處 |
| Section head 結構：分類 / 中英文 title / 英文 desc | viewer 36 個 section 重組；中英文 title 同行；CN desc 刪除 |
| H1 預設無句號（句號改為 opt-in） | events / projects / ip-market / ip-detail / wizards 等 8 個 H1 拿掉「。」；typography 表更新 |
| Data list status 移到名稱下方、amount + arrow 緊貼 | grid 從 4 欄改 2 欄，新 `.data-list__amount-group` wrapper |
| Logo 改用 SVG | 取代 brand 文字；24h auto-w、`currentColor` |
| Nav font 12 → 15px | `.app-topbar__link` font-size |
| Active 底線寬度 = 2 字寬、中心對齊文字（不含 chevron）| `width: 2em`、`translateX(-50%)`，group button 額外 `-9px` 補償 chevron 位移 |
| Dropdown 改 hover 開啟 | CSS `:hover` / `:focus-within` 直接 show，加 `::after` 8px 隱形 bridge 跨 button-panel 間距，保留 click toggle 作 a11y fallback |

### C. Removed（我自己幻覺加的、spec 沒寫，撤掉）

| 撤除項 | 為何當初加 / 為何撤 |
|---|---|
| 帳戶切換 chip（Yves Lin ▾ + 3 sample creators + 新增入口） | 誤以為 §3.2.2 列了「帳戶切換」項，實際只有 5 項（導航層級 / 搜尋 / 通知 / 語言切換 / 帳戶選單），完全沒寫帳戶切換。撤掉 |
| Avatar 下拉的「Privacy & Security」 | spec §3.2.2 #5 只列 Profile / Settings / 登出，我多加一項。撤掉 |
| Group divider 之間的隱形分隔線 | 重做 nav 後改用顯式 group label，分隔線多餘 |

### D. Infrastructure（無視覺影響）

| 項目 | 動機 |
|---|---|
| Lucide icon CDN → 本地 SVG registry | 離線可用、所有 icon 集中在 [icons.js](icons.js) 的 `REGISTRY` 物件、強制走 registry 才能新增 |
| Google Fonts → self-hosted woff2 | 離線可用；Space Grotesk + Inter variable woff2 + Taipei Sans TC Beta（已 self-host）|
| font-weight 900 → 700 | Space Grotesk variable axis 上限是 700；CSS 寫 900 會 silently fallback；改成 700 比較誠實 |

---

## Convention

- **新加項目按 spec 章節編號 + 反饋日期累積**，最新在上
- **bug fix 不寫進這份檔案**（自己 CSS 寫錯、selector 衝突、overflow 切掉等都是內部除錯，commit message 即可）
- **撤除（C section）也要記**，方便日後追蹤「為什麼這條規則被拿掉」
