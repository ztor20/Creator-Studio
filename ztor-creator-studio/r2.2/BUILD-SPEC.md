# Ztor Creator Studio · R 2.1 BUILD-SPEC

> **2026-07-16 · 電影關聯（BR-NEW-1）＋Admin 平台費率設定頁（BR-NEW-4）**：**電影關聯**（2026-07-16 D140 精修）——新增 `js/films-store.js`（前台已上架電影 mock）＋共用元件 `partials/film-picker.js`（**可搜尋多選**，建於 tag-input＋chip 之上、無自帶 CSS）。create-product §4.5 為**獨立 `form-section--outlined`**（自共用設定拆出）掛空選取的 picker；product-detail §2.14 掛預設示意 2 部；兩頁改用同一 picker（取代早期各自 inline）。搜尋以電影名稱過濾候選（BR-NEW-1），i18n `films.search`/`films.suggest`/`films.none`。design-system.md 元件表新增 Film picker 條目。無新元件 CSS。**平台費率設定頁**——新增 `admin-platform-fees.html`，仿 `ip-bank-reporting.html` 目的地外殼（app 頁框＋breadcrumb＋page-intro）、內容為可編輯設定型（`form-section--outlined`＋`ztor-table`＋`amount-field--suffix` %＋`info-banner`＋`badge`），Save 按鈕 demo「儲存即發版、append-only 版本歷史」；`sidebar.js` 掛第四 Admin 目的地（icon `percent`）。全部復用既有元件與 token、無新元件 CSS、無新裸值（check_ds_sync 5/10 基準未動）；費率數值全標示意（UIA-054）、電影候選為 mock（UIA-053）。收益拆解 E22 於 earnings 既有實作、本輪只驗收。
>
> **2026-07-15 · Owner lookup prototype**：Admin IP Entry 將 Owner 欄位拆成 SiteSpecific owner-lookup component（同一輸入搜尋 display name／username／email）。component 輸出 linked user 或 invite email union；Entry 頁保有 Share 與送出驗證。有效但未註冊的 email 在本機儲存為 pending invitation metadata，清單沿用 Invited (Pending) 顯示；不宣稱已寄送 email。

> **文件角色：UI／前端實作快照。** 本文件只記錄 R 2.1 已採用的佈局、元件、視覺、動效、響應式與工程做法，不是產品需求來源。
>
> 產品權威依序為 `requirement/`、`documents/decisions.md` 的有效決策、`documents/`。本文件若與上游衝突，應更新實作或記入 [ASSUMPTIONS.md](ASSUMPTIONS.md)，不得把既有 UI 靜默反向同步到上游。
>
> 本文件保留的功能名稱、狀態、費率或流程描述，只代表建立當時的實作快照；除非能連回上游來源，不得據此新增產品規則。

| 欄位 | 內容 |
|---|---|
| **版本** | v2.1.0-preview · minimum-viewable build |
| **最後更新** | 2026-06-11 |
| **負責人** | Yves |
| **設計系統** | ztor yellow — canonical source（不是 R 2.0 fork 改名的 `ztor`） |
| **產品來源** | `../../requirement/`、`../../documents/0-設計規格書.md` 與 5.1.x 子規格 |
| **呈現範圍** | R 2.1 的 UI 與前端實作選擇 |
| **R 2.0 對照** | `../R 2.0/` — 相同上游需求、不同呈現探索 |
| **相關文件** | [ASSUMPTIONS.md](ASSUMPTIONS.md)、[requirements-map.md](requirements-map.md)、[design-system.html](design-system.html)、[design-system.md](design-system.md)、[component-library.md](component-library.md)、[UI-CHANGES.md](UI-CHANGES.md) |

> R 2.1 是以相同上游需求重新探索設計語言的另一次嘗試（不是 R 2.0 的迭代版本）。兩個版本都不能反向決定產品規則。

> **2026-07-14 · 版本切割工程**：Cheat Codes 以 `feature-scope-map.md` 為功能 tier 單一真相。P1/P2/P3 只呈現明列 tier；未列產品功能以 `data-feat="full"`／`data-page-feat="full"` 留在 Phase 4，低版本的連結與直連 route 均不放行。funding-test 除建立項目改接外同 Phase 4。

> **2026-07-13 · 元件對齊快照**：Create Product 採用 Lucide icon atom（12／14／16／20／24px）取代文字與自製 SVG；輸入控件使用 1px 陰影邊線＋4px focus glow。此輪為純呈現更新，不改產品流程。`.card` 維持主分支 1px border、無陰影；按鈕 hover 維持 `--accent`。

> **2026-07-14 · Admin Creator Studio**：新增三個同層 Admin 目的地（Creator 管理、Admin IP Bank、IP Bank Reporting），切換固定收在 Admin 左側欄；Artist Creator Studio 的 `index.html`／`my-ip.html` 沿用原本導航。`admin-ip-bank-entry.html` 是 Admin 子流程，採既有單頁建立 shell（頂部儲存、底部取消／提交），不載入 Artist 導覽。Reporting 將 Film 與可操作的起始／結束日期收在同一篩選列，篩選後重繪摘要與列表。IP Bank 的 localStorage mock 僅為原型跨頁資料呈現。

---

## 0. 與 R 2.0 的關鍵差異

| 面向 | R 2.0 | R 2.1 |
|---|---|---|
| **Design system 來源** | 從 ztor yellow fork → 改名 `ztor`（住在 R 2.0 內部） | 直接拷貝 `Design/Design System/ztor yellow/` 作為 source of truth |
| **App 框架** | Slim topbar + 內容滿版 | **Canonical ztor-header topbar 64 px sticky · 邊到邊**（padding 0 32px）+ hover dropdown nav 對應 spec §3.2.2 |
| **首屏節奏** | Page-intro → KPI strip → 大量 patterns | **全屏 Hero banner 輪播**（spec §5.1.1.1，`.hero--fullbleed` 邊到邊）→ Page intro → KPI bento → 模組化卡片群 |
| **資料呈現偏好** | Card-per-row · shadow-heavy | **Row-divider 為主**（`.data-list`）· 卡片只用於資訊區塊 |
| **Orange 使用** | 主要在 CTA + active states | **結構性使用**：active nav orange underline、kpi--highlight、hero visual fill；資訊提示維持中性灰 |
| **Typography weight** | H1 32–40 px Geist 500 | **H1 44 px / Hero title 56 px / Geist 500 / tracking −1px**（更編輯感） |
| **Info banner pattern** | 沒有 | 新增 `.info-banner` — 緊湊中性灰底、圓形 `info` 圖示，用於情境資訊提示 |
| **Wizard 結構** | Topbar 內嵌 stepper（圓圈 + 直線） | **獨立 wizard top**（不顯示主導航）· stepper 在中央 · 底部 sticky action bar |
| **元件覆蓋** | 14 頁全部產品化 + Light/Dark 完整實作 | 初版 6 完整＋8 stub，把心力集中在 IA + 設計語言展示；**現況 18 頁（9 完整、8 structure/step-1、1 重導 stub，見 §2）** |

> **2026-05-25 pivot**: 初版 R 2.1 用了左側 240 px sidebar；經反饋後改回 canonical 横向 topbar（spec §3.2.2 / ds-components/header.css 的標準），並把 Dashboard Hero 改為 `--fullbleed` 邊到邊。Sidebar 當時完全移除。
> **2026-06-09 更新**: Sidebar 以「可切換顯示模式」重新納入（topbar 仍是預設）——採 spec §6.9 / D016 的 Topbar↔Sidebar 切換、同一套 IA（不是回到舊版的固定 sidebar）。見 §5.2a。
> **2026-06-14 更新**: Topbar 模式也套上 app shell（與 sidebar 同一套 shell token）——`.app` 用 `--surface-shell`、`.app-topbar` 坐 shell 底、`.main` 上方留 gutter ＋ `--radius-shell` 圓**上方兩角** ＋ `--surface-page` 底 ＋ `overflow:clip`，Dashboard Hero 收進面板。只作用於有 `.app` 的 topbar 頁；wizard（`.wizard`）不受影響；≤900px 收掉 shell。見 shared.css「Topbar-mode app shell」。
> **2026-07-07 更新（陰影系統化）**: 陰影收斂為 **E0–E4 海拔階梯**（使用者裁示：扁平為底＋柔和浮起分層）——E0 貼底（hairline）／E1 微浮（raise）／E2 卡片（card）／E3 懸浮（新 `--shadow-float`：下拉、popover、tooltip、拖曳列）／E4 覆蓋（新 `--shadow-overlay`：modal、對話框）。規則：一元件一階、互動借上一階（`--shadow-card-hover` 改為 float 別名）、同層分隔不用陰影、越高越大而淡；`--shadow-popover` 淘汰（原 9 處改指 float／overlay）、低庫存 sticky 條裸值改 `--shadow-header`。深淺模式成對定義。見 design-system.html §1.5／§2.5。
> **2026-06-29 更新**: 新增**平台營運（Admin）層**（spec §4.1／§3.2.1 Tier 0-1／D086）。`creators.html` 為 Tier 0 Admin 落地（creator 名冊＋建立，roster／data-list＋badge＋button 組成，建立用 inline card 表單）；現有頁＝Tier 1 creator scope。`sidebar.js` 依 `window.ztorCreator`（活躍 creator 存 localStorage `ztor.activeCreator`）渲染：roster 頁只露 Creator 管理 marker＋Tier 1 模組鎖定（`.app-topbar__link--locked`）；creator scope 在 logo 前加返回名冊 icon（`.app-topbar__back`，使用者裁示固定此位）＋「管理中 <creator>」chip（`.app-topbar__context`），導航解鎖。切換 creator 走 `devtools.js`「Creator · Admin」cheat code（呼叫 `window.ztorCreator.set`，派 `ztor:creator-changed` 重繪）。新增 icon arrow-left／shield-check。樣式住 shared.css（隨 nav shell），DS 頁 Header 段說明。
>
> **2026-06-30 更新（使用者反饋＋D097）**: `creators.html` 大改——(1) **建立改 popup**：原 inline card 表單改 modal，重用 canonical 對話框外殼 `.payout-modal`／`.payout-dialog`（比照 message-modal），✕／Esc／點遮罩關閉、開啟聚焦 name；(2) **狀態兩值**：撤除無依據的 published／draft，改 **active（`badge--success`）／disabled（`badge--neutral`＋列淡化 `.is-disabled`）**，新建預設 active（spec F1／D097）；(3) **停用／啟用**：列尾 ⋯ 溢出選單（`dropdown`）切換 in-memory 狀態（spec F4）——已停用列本輪仍可 Manage（F4 待確認，未閘控，見 UIA-036）；(4) **搜尋／篩選**（名稱/識別＋狀態 All/Active/Disabled，view-only）＋**名冊摘要列**（i18nT 組字、掛 `i18n:applied` 重譯）＋**整列可點**進管理；(5) 新連入 `dropdown-menu.css`、`payout-modal.css`，icons.js 補 `more-horizontal`，sidebar.js demo roster 狀態改 active/active/disabled。全站資產版本 bump `20260629o`→`20260630a`。
>
> **2026-06-30 二次更新（對齊電子商店元件＋D098 F 重編號）**: creators.html 改吃 e-shop 同款元件——(1) **摘要改 bento**：三張 `.kpi.bento--span-4`（總數/啟用中/已停用）取代文字摘要列（F2 概覽）；(2) **搜尋改 `field-pill`**（取代 `.input`）；(3) **狀態篩選改 `filter-tabs filter-tabs--brand`**（淡橘 pill＋每項數量，取代 native `<select>`）；(4) **列改 `product-list`**（取代 `data-list`，retarget 欄位 avatar/名稱+識別/狀態/列操作，含 `product-list__head` 欄位表頭 Creator/狀態、欄寬固定 `52px/1fr/104px/140px` 對齊；無分類/價格/庫存/拖曳欄；**工作列/清單不包 `.card`**——比照 e-shop 直接落頁，移除 card.css 連結，bento 概覽 tile 保留）；(5) 管理鈕 i18n 改 **Enter／前往**。連入 `kpi.css`/`bento.css`/`field-pill.css`/`filter-tabs.css`/`product-list.css`、移除 `data-list.css`，新增 i18n `creators.metric-total`。規格 5.1.0 F 項依 5.1.5 分類重編號（F1 頁首/F2 概覽/F3 工作列/F4 名冊/F5 進入返回，D098）。全站版本 bump `20260630a`→`20260630b`。
>
> **2026-06-30 三次更新（D099，部分撤銷 D098）**: 依使用者裁示——(1) **移除 bento 名冊概覽**（三張 kpi tile 整塊拿掉，各狀態數量改由 filter-tabs count 承載），移除 `kpi.css`/`bento.css` 連結與 i18n `creators.metric-total`；(2) **狀態篩選與搜尋改同列**（篩選左、搜尋右，`.creators-toolbar` flex `space-between`、搜尋 `flex:0 1 320px`，取代原本分兩列）。規格 5.1.0 隨之移除 F2 概覽、F 重編號為 F1 頁首/F2 工作列/F3 名冊/F4 進入返回。全站版本 bump `20260630b`→`20260630c`。

---

## 1. 呈現目標

獨立創作者的內容變現中後台。把 IP、項目、活動、商品、粉絲、收入收在同一個 studio。設計目標承襲 `0-設計規格書.md §1`：

1. **透明** — 收入、費率、扣項、分潤、驗證狀態必須清楚可查。
2. **降低門檻** — 財務、IP 授權、跨境收入用白話、預設值、檢核邏輯協助理解。
3. **任務導向** — 每個頁面說明此刻能完成什麼。
4. **連動一致** — 同一筆資料在不同頁面用同一口徑、同一狀態語言。
5. **合規保守** — 涉及粉絲支持、收益分潤、稅務時文案保守可查核。

R 2.1 的視覺取向：**highlighter-orange 沒有藏起來。** 它在 active nav、KPI highlight tile、Hero visual fill、Pre-order pill 直接出場；Info banner 維持中性灰，避免說明資訊與主操作搶注意力。這是 ztor yellow design system 的精神延續。

---

## 2. 全站結構（Sitemap）

```
索引     index.html              · Dashboard           · 完整 ✓
        projects.html           · 項目清單             · 列表＋卡片雙檢視 · 狀態×類型篩選 · 搜尋 ✓（detail → 5.1.2.2 另案）
        create-project.html     · 建立項目（依類型分流）· 完整 ✓（spec 5.1.2.1 v3）
        my-ip.html              · 我的 IP 清單         · 結構 + 範例 ✓
        ip-market.html          · IP 市場              · grid + 篩選 ✓（spec 03 §5.1.3）
        ip-detail.html          · IP 詳情頁            · 完整 ✓（spec 03.2）
        e-shop.html             · 商品管理 Products / Bundles / Auctions · 互動 tab＋搜尋/狀態篩選＋Shop 開關→Hidden＋See as fan 分割預覽＋低庫存橫條＋補貨入口 ✓（spec 5.1.5 / 5.1.5.6）
                                  · F4 狀態徽章 Live(success)/Low Stock(error)/Sold Out·Draft·Hidden(neutral)（D093）；草稿列每欄空值占位「未命名／—」（D092）；分批載入 批量 25（spec 預設，使用者裁示）＋載入更多（僅 >25 筆出現）＋end-cap「已顯示全部 N 筆」（樣本 <25 直接 end-cap、無載入更多），排序達任一位置門檻待工程；縮圖 lazy load＝真實縮圖 `.product-list__image img` 用 `loading="lazy"`（demo 無圖佔位、無可見效果，記為慣例）（D094 / UIA-036）
                                  · **F4 釘選（2026-08-04，spec 5.1.5 F4／D172）**：三分頁各有「釘選區 → `.product-list__divider` → 其餘」三段，釘選與否＝在分隔列哪一側，故拖曳跨線即釘選／取消釘選，列操作選單另有入口；上限 10 各分頁獨立計（計數常駐分隔列、額滿擋兩路並閃 `--destructive`）；創作者端標記＝分段＋`.product-list__pin-mark`，不掛粉絲端徽章；草稿不可釘選且永遠排在整張清單最前；搜尋／篩選中分隔列收起；零釘選時同一條線改講引導文案（「把主打商品放到商店最前。」＋右端計數位置改放無外框按鈕「立即釘選」、`0/10` 收起）；分隔列兩態——有釘選＝一條有字的分隔線，零釘選＝`--empty` 圓角方框（1px `--border-soft`、收掉上一列分隔線）、位置即釘選區將來出現的位置；點連結＝捲到第一件可釘選商品、開其操作選單並以 `.dropdown__item.is-hinted` 圈出「釘選」，不代按。狀態純前端、不持久化（demo）
        store-settings.html     · 商店設定（電子商店 F3 popup 入口，D065）· 店面門面常駐＋商品陳列/付款/出貨 tab 群組＋See as fan 畫面分割預覽 ✓（spec 5.1.5.5 / D035 / D065）
        product-detail.html     · 商品細節頁           · 結構 + 銷售摘要 ✓（spec 03.4）
        create-product.html     · 建立商品 Add new item · 單頁三型表單 ✓（spec 5.1.5.2 v2.1）
        create-bundle.html      · 建立套組 Create bundle · picker + 定價兩模式 ✓（spec 5.1.5.4）
        orders.html             · 訂單管理（E-Shop ▾） · F1 摘要 + F2 篩選 + F3 清單 ✓（spec 5.1.5.3）
        order-detail.html       · 訂單詳情             · 品項/金額拆解 + 履約 + 退款爭議 + Earnings 對帳 ✓（spec 5.1.5.3.1；D111 品項層取貨狀態＋QR 分支改指取貨管理）
        pickup.html             · 取貨管理（E-Shop ▾） · F1 頁首 + F2 摘要 + F3 清單工作列 + F4 取貨清單 ✓（spec 5.1.5.11 / D111，2026-07-06 拆頁見下）
        pickup-detail.html      · 取貨場次詳情 · 場次基本資訊 + Scanner URL 與密碼 + 核銷紀錄 ✓（spec 5.1.5.15，2026-07-06 新增）
        pickup-roster.html      · 已刪除（2026-07-06 D121：5.1.5.13 整份退役，內容分配至 scanner.html F2 可核銷項目、pickup-detail.html F4 取貨/入場名單）
        scanner.html            · 手機 scanner（獨立 URL）· 密碼閘（含場次身分＋工作人員標示）→相機主畫面→bottom sheet 結果→確認核銷（無主導航）✓（spec 5.1.5.14 / D111，2026-08-19 流程重規劃）
        events.html             · 活動清單             · 結構 + KPI ✓（spec 03 §5.1.6）
        create-event.html       · 建立活動 5 步精靈     · Type/Details/Venue & Time/Tickets/Review ✓（spec 5.1.6.1）
        fans-crm.html           · Fans CRM · Leaderboard / Hall of fame · 結構 + KPI ✓（spec 03 §5.1.7）
        earnings.html           · Earnings · 4 tabs    · Overview + Transactions + Payouts + Tax docs ✓（spec 03 §5.1.8）
        settings.html           · 設定 (6 section)    · 完整 ✓（spec 03 §5.1.9）
        request-payout.html      · 重導 stub → earnings.html#payouts · 提款流程已由 payout modal 接手，保留為手動深連結 fallback
        login.html              · 登入（未登入層，獨立 URL）· 方式選擇→電子郵件／手機號碼→忘記密碼，四畫面同卡互切 ✓（spec 5.1.10 / D170）
                                  · 骨架照 scanner.html：不載 sidebar.js／components.js；body 尾端 icons.js → i18n.js → zselect.js → devtools.js
                                  · 註冊入口掛 `data-feat="full"`（phase 1–3 隱藏，見 feature-scope-map「保留 gate `full` 的登記」）

文件     design-system.html      · browser-readable design system + component graph + integrity check
        design-system.md        · authoritative DSS v1.4 text spec
        component-library.md    · CSS / component ownership index

骨架     ds-components/         · base 由 ztor yellow components/ 拷貝（10 個基礎元件：accordion · badge · button · card · cookie-banner · footer · header · input · navigation-menu · table）+ _tokens.css + fonts.css；R 2.1 另 promote app-tier 與 project-owned 元件，完整清單以 design-system.md §4.1 Inventory / component-library.md 為準
        fonts/                  · 自架 Geist / Geist Mono / Inter woff2；Taipei Sans TC Beta 已移除，CJK 用自架 subset 的 Noto Sans TC（woff2 在 fonts/）
        images/                 · Hero banner 全屏照片（unsplash placeholder × 3）
        shared.css              · project-level patterns（R 2.0 canonical topbar / bento / wizard / IP hero / fullbleed hero / linechart / alert-card / chip / tab-panel）
        sidebar.js              · 注入全域導航框架（spec §5.2.1）。依 html[data-nav-mode] 兩模式渲染：topbar（R 2.0 canonical `.app-topbar__*`，預設）或 sidebar（248px 直向 `.app-sidebar__*`，下拉變可展開群組）。同一套 NAV，IA 不變（spec §6.9 / D016）。通知與待辦中心同源渲染：topbar 為右側下拉，sidebar 為貼 rail 右側 flyout；官方公告併入中心。檔名保留為 sidebar.js 維持 HTML 相容
        hero.js                 · Dashboard hero banner 輪播控制
        components.js           · runtime-injected content blocks（同 sidebar.js 注入模式）；Dashboard F2–F8 區塊 + 跨頁共用的 transaction-list（index.html F3 與 earnings.html 共用同一 renderer）。詳見 component-library.md
        theme.js                · 主題（[data-theme] cycle light / dark / system，window.ztorTheme）＋顯示模式（[data-nav-mode] topbar / sidebar，window.ztorNavMode）；皆在 <head> 早期套用避免 FOUC、localStorage 持久化（spec §6.9 / D016）
        icons.js                · Tabler SVG registry，**全頁面 active 載入**；新增 icon 必須先進 REGISTRY
        i18n.js                 · 雙語字典（EN / zh-Hant）+ data-i18n / data-i18n-placeholder / data-i18n-aria-label apply 機制 + 透過 .app-topbar__lang 切換 + localStorage 持久化
        devtools.js             · 「Cheat Codes」原型情境工具（Alt＋右鍵開、無常駐鈕）；自包含、DS tokens 樣式。Skip validation／Onboarding／Event Day 狀態存 localStorage `ztor.devstate`＋同步 URL＋反映 `<html data-onboarding/data-event-day>`；內建元素 inspector（hover 標元件/非元件、可拖移調高）。對外 `window.ztorDevState` + 事件 `ztor:devstate-changed`。掛在全部產品頁（design-system.html 除外）。**「版本」切換**讀 feature-scope-map，依 `data-feat`（功能在版本內才顯示）／`data-feat-off`（功能不在版本內才顯示＝base 呈現）成對切換元素；2026-07-02 補：ID 解析支援小數點子 ID（`S31.1`）＋新增 `data-feat-off` 反向閘（首用於 S31.1 低庫存門檻自訂）。**2026-07-16 補 page-scoped 預覽開關**：頁面在載入 devtools 前設 `window.ZTOR_DEV_PAGE_GROUPS = [{key,label,options,def},…]`，面板即在版本組下渲染對應單選組（`data-kind=page`），選值存 `state.pageOpts[key]`（localStorage 持久化）並經 `ztor:devstate-changed` 的 `detail.pageOpts` 派給該頁自行套用；未設定即不渲染、其他頁零影響。首用於 product-detail 的 D137 鎖定欄位替代版面預覽（`pd-cat`／`pd-var`／`pd-edition`）
        scenario.js             · 把 devstate 接到頁面：Dashboard 吃 Onboarding Flow、Events 吃 Event Day，頂部顯示情境提示橫幅。自包含、DS tokens；掛在 index.html／events.html
```

**完整 vs Stub 的判斷**（2026-06-11 計數更新）：
- **完整 (9)**：能完成 spec 中的核心任務（index / projects / create-project / ip-detail / orders / order-detail / earnings / settings / store-settings）
- **Structure · Step 1 (8)**：結構、IA、tabs、KPI 卡都對齊 spec，但 detail-view / 內嵌 wizard / 進階篩選未實作
- **重導 stub (1)**：request-payout.html → earnings.html#payouts

---

## 3. 設計語言

### 3.1 來源

完全套用 `Design/Design System/ztor yellow/` 的 design system，文件結構對齊 **DSS v1.4 7-Pillar 架構**（Pillar 0 Record · 1 Foundation · 2 Role · 3 Mode · 4 Component · 5 Pattern · 6 Structure + Appendix A/B）。重點 tokens：

- **Foundation**（raw）：`#FAFAF7` warm paper · `#ffa33f` highlighter orange · `#171717` dark text on orange
- **Role**（semantic）：`--background / --card / --primary / --foreground-muted / --status-{success|error|info|warning}` 在 `_tokens.css` 統一注入
- **Mode**：`[data-theme="dark"]` 13 個 role 覆寫，`theme.js` 切換 + localStorage 持久化
- **Typography**：Geist (display) · Geist (UI) · Inter (body) · Noto Sans TC（CJK fallback，自架 subset woff2；R 2.1.39 起取代 Taipei Sans TC Beta、R 2.1.40 起自架）
- **Component**：28 個元件已 promote 進 `ds-components/` 成獨立 CSS（完整清單與 anatomy 見 design-system.md §4.1 Inventory；index 見 component-library.md）；另有 App shell 等 project-owned 元件仍住 `shared.css`。全部元件（含 shared.css 持有者）在 design-system.html 都有 demo 卡——這是設計師檢視元件的唯一入口，新增/修改元件必同步
- **Pattern**：5.1 Pattern 卡（Layout / Interaction / Lifecycle / Workflow 四類）/ 5.2 Voice / 5.3 States / 5.4 Data viz / 5.5 Workflow
- **Structure**：12-col bento + 5 page templates（Dashboard / Earnings 4-tab / Wizard / Settings / Empty stub）

### 3.2 R 2.1 新增的 project-level patterns

| Pattern | CSS class | 用途 |
|---|---|---|
| Topbar (canonical) | `.app-topbar` | **64 px** 高 · sticky · `--card` bg · padding 0 32px · flex（actions 用 `margin-left:auto` 推右）· 對齊 design-system.html 的 `.dm-header` |
| Brand | `.app-brand / .app-brand__mark` | Geist UI 18px / 500 + 22 px orange Z mark（小，配 18 px wordmark） |
| Main nav | `.app-topbar__nav / .app-topbar__link` | 14 px / 500 · foreground-muted · hover/active 底色由**共用滑動高亮 pill** `.app-topbar__nav-highlight` 提供（一顆 `--muted` pill 在項目間滑動跟游標、離開 nav 滑回 active 頁；Motion mega-menu shared-element 風格，vanilla 實作）；link 自身背景透明避免雙重底（**不**用 orange underline，orange 留給 CTA / hero）|
| Dropdown panel | `.app-topbar__nav-group[data-dropdown] / .app-topbar__dropdown--mega` | **Hover-open**（140 ms 關閉延遲讓游標進得了 panel；click 仍可切換）· 開關用 `data-state="open\|closed"` 跑 fade+slide(-6px)+scale(0.98) 進出場動畫 · **下拉＝IP Bank（My IP / IP Market）與 E-Shop（電子商店 / 訂單管理；商店設定 2026-06-15 移出下拉、改 F3 popup，D065）**（Events / Fans 平鋪；spec §3.2.1 / decisions D013 + D014）· sidebar 顯示模式下這兩個下拉改為可展開群組（`.app-sidebar__group`） · **bg 比照 header 用 `--card`**（2026-06-09 反饋：下拉底色要和 header 一致；移除先前 `--background` + dark `#1F1F1F` 寫法）· 面板頂距 header(64px) 底 +4px（`top: calc(100% + 18px)`）· **frosted glass**：加 `backdrop-filter: blur(14px) saturate(140%)`（同 scrolled header），dark 下 `--card` 半透明時把背後 hero/content 模糊成霧面、文字仍清楚；light 下 `--card` 不透明，blur 自然 no-op |
| Topbar actions | `.app-actions / .app-icon-btn / .app-icon-btn__dot / .app-search / .app-notif` | 8 px gap · icon button 36×36 transparent，hover `--muted` · notification 帶 orange unread dot · search icon 點開內嵌 input · 通知與待辦中心分「需要你處理」與「狀態更新」兩區，官方公告併入 |
| Language pill | `.app-lang` | 32 px pill + hairline border · `EN · 中` 雙語 toggle · 對齊 R 2.0 寫法 |
| Avatar | `.app-avatar` | 32×32 圓形 · `--foreground` bg / `--background` text（inverse colors，**不**用 orange）|
| Account menu | `.app-account__wrap / .app-account__panel` | Avatar 下拉 · Profile / Settings / Payments / Logout（Settings 入口在帳戶選單 ≠ 主導航，spec §3.2.2.5）· 同樣 `--background` bg |
| Hero full-bleed | `.hero / .hero--fullbleed / .hero__slide` | Dashboard 專用 · `width:100vw + margin-left:-50vw` trick · 邊到邊 · **720 px 高** · **置中設計**（copy / CTA / dots 全部水平置中，760 px 置中欄）· **進場動畫**：title → subtext → CTA 由下往上（+24px）staggered 淡入，沿用 reveal.js 的 `.is-in` 觸發（載入時 + 每張 slide 首次出現時各播一次；reduced-motion 下直接顯示）· **4 slide** 自動輪播 8 s：<br>Create Project = 「audience」分層合成圖（空景長廊 + 3 個去背表演者層 `.hero__layer` 依 assembly 構圖疊出）<br>Create Project = `Video/hero-project.mp4` Veo 影片背景<br>IP Market<br>Create Event<br>· 輪播控制 = **Framer video-slideshow 風格指示器**：霧面深色膠囊（`rgba(20,20,22,0.62)` + blur）裝 dots，**active dot 展開成進度 capsule**（白色 fill 與 8s 換頁由同一個 `requestAnimationFrame` 時鐘驅動），旁邊一顆獨立 **play/pause 圓鈕**（暫停同時凍結進度與換頁、圖示切換；reduced-motion 下不自動播、起始即暫停）· 每 slide 用 `background-image` 載入 `images/hero-*.jpg`，**置中 radial veil**（中心 0.62 → 邊緣 0.18）保證置中白字 ≥ 5:1 對比、邊緣照片仍可見 |
| Bento grid | `.bento / .bento--span-{3,4,5,6,7,8,12}` | 12-col responsive bento |
| KPI tile | `.kpi / .kpi--highlight` | `.kpi--highlight` = orange 22% tinted bg |
| Data list | `.data-list / .data-list__row` | Row-divider 為主，沒有 card-per-row；`.data-list__end` 右欄堆疊金額 + 狀態 pill（Dashboard F3）|
| Insight split | `.insight-split / .insight-split__col / .insight-eyebrow` | Dashboard F7 一卡雙洞察欄（粉絲關係 Fans CRM ｜ 受眾趨勢 Audience Intelligence）· 中央 hairline 分隔 · <900px 收合單欄 |
| Info banner | `.info-banner` | 中性灰底 + `info` 圖示 · inline 情境資訊提示 |
| Upload tile | `.upload-tile / --portrait / --file / --16x9 / .upload-assets(--fill) / .upload-tile-aside(--stacked)` | 虛線上傳格。**直式圖片槽只有一套**（2026-08-09）：`.upload-assets--fill`＝`--upload-asset-cols`（預設 4）格撐滿一整列、第五格換行，容器層 opt-in `[data-upload-reveal]`＝一次只露出一個空格。`--hero`／`.upload-grid`／`.upload-showcase` 已退場 · spec 5.1.5.2 |
| Picker | `.picker / __search / __search-input / __new / __list` | 搜尋＋可捲動挑選清單（列復用 data-list）· spec 5.1.5.4 |
| Preview card | `.preview-card / __media / __row / __name / __price / __desc / __dots / __meta / __cta / .is-empty` | 粉絲端即時預覽卡（商品／拍賣）· spec §5.2.5 |
| Preview panel | `.preview-panel / .is-open / --inset / __sheet / __head / __title / __body` + `body.preview-open` | 畫面分割預覽面板（非浮層遮蓋）：開啟時壓窄頁面——建立流程壓 `.wizard`（Preview 鈕，§5.2.5）、商店設定壓 `.main` 並以 `--inset` 自 64px topbar 下展開（See as fan，5.1.5.5 F1）。**E-Shop 也重用**（See as fan，5.1.5 F3，`.preview-panel--inset`＋`.ss-fan`）|
| Restock order (lines) | `.restock-lines / .restock-lines__group / .restock-line(__main/__img/__text/__name/__meta) / .input.restock-line__qty / .restock-line__after` + 重用 `.payout-dialog` 外殼・`.segmented`・`.tabs`・`.data-list` | 補貨彈窗（spec 5.1.5.6，D104 補貨單＋D106 成員 tab）：一次補貨＝一張補貨單——<br>單據層（整單填一次）＝方式 `.segmented`（立即/計時）＋供應商/預計到貨/備註（`.payout-field`）；<br>品項層 `.restock-lines`＝每個要補的品項一列 `.restock-line`（識別＋狀態 badge＋目前庫存/門檻＋數量輸入＋即時補後讀數）。商品的規格＝矩陣列（多規格 2 選項以 `.restock-lines__group` 分組），不用 tab；**組合成員商品＝`.tabs`（重用 tabs.css，一成員一 `.tab-panel`），tab 內為該成員規格矩陣**（D106；`[data-restock-tabs][hidden]` 補回單品時隱藏）。數量留空＝不補、跨 tab 保留。方式立即→隱藏 ETA/到貨確認、計時→顯示 ETA(必填)+到貨確認。`[data-restock-modal] .payout-field[hidden]{display:none}` 補回 ETA 隱藏。由 `partials/restock-modal.js` 的 `createRestock()`（openSingle/openVariants/openBundle→openOrder）掛載於 e-shop.html、product-detail.html。送出對數量＞0 的品項生效、商品細節頁逐品項 append 補貨紀錄（`.data-list`），皆 demo（口徑依上游 §7.2，UIA-006/007；同單混合方式、部分收貨待確認）。**D105**：列 `__meta` 的低庫存門檻由 e-shop 控制器 `lowThr(cap)=ceil(cap×10%)` 逐品項導出（取代寫死 5），無 cap 列隱藏該 meta（UIA-042）|
| Readiness card | `.readiness / __list / __item / --done / __mark / __banner / --ready` | 上架前就緒檢查＋還差幾項 banner（Ready to sell?）· spec 5.1.5.2 §4.4 |
| Variant builder | `.variant-builder / .variant-option(__head/__name/__remove/__values/__add) / .variant-table-wrap / .variant-table(.--limited) / __head / __row(.is-excluded) / .variant-cell--variant / --total / .variant-row__remove` | 建立商品多規格（spec 5.1.5.2 §4.1④，僅實體）：`.segmented` 切單一/多規格 + 選項建構器（名稱＋值 chip）+ 逐規格表（價格/庫存/SKU/成本，`.--limited` 多上限欄、`.is-excluded` 排除組合）；值 chip 重用 `.chip--removable`、格重用 `.input`。組合/逐格資料/排除為前端 demo（UIA-016）|
| Tag input | `.tag-input / __field / __entry / __suggest-label` + 重用 `.chip--removable`/`.chip-group` | 建立商品商品標籤（spec 5.1.5.2 §4.5）：框內已選/自建標籤（`.chip--removable`）＋無框輸入（Enter 新增）＋建議 chip-group（點擊切換）；組合自 chip，可重用於項目/粉絲標籤 |
| Chip（補 removable） | `.chip--removable / .chip__remove` | chip 新增可移除變體（行內 ×，色彩繼承 chip）：tag-input 與 variant 選項值共用 |
| Status axes | `.status-axes / .status-axes--split` | 訂單兩條獨立狀態軸（履約 vs 付款·結算，spec 5.1.5.3.1 §2.2 / PCR-001）不併成單一 badge：`.status-axes`＝並排 badge、`--split`＝詳情頁首一列、每軸各是一個內嵌 `.status-axes` 群組、群組間 `border-left` 細線分隔。badge 取自 badge.css。用於 order-detail.html §2.2（詳情頁）與 design-system.html demo。**2026-08-07 使用者裁示**：兩個軸標籤（`od.axis.fulfil`「履約狀態」／`od.axis.payment`「收入結算」）移除，改用細分隔線區隔——PCR-001 要的是「兩軸不可混成一顆徽章」，分隔線已達成；徽章文字本身已說明所屬軸，標籤重述同一件事，且「收入結算」與徽章「已付款」用詞不一致。原 `--labeled`／`.status-axis`／`.status-axis__label` 隨之零消費、同輪退場（C 類）。**2026-07-23 使用者裁示**：orders.html 清單列不再用 `.status-axes` 把兩軸並排——改成出貨狀態（`__ship`）／付款狀態（`__pay`）各自獨立成欄（`product-list--orders` 9 欄化，見 UI-CHANGES 2026-07-23）；兩軸仍分離、不混用，只是由「同格並排」改為「相鄰兩欄」。**同日續**：欄序調為 訂單編號／訂單內容／買家／金額／付款狀態／出貨狀態／日期；出貨狀態欄（`__ship`）改承載履約雙值——配送（待出貨/已出貨/已交付）＋現場取貨（待取貨 `orders.status.pickup`），混合訂單兩顆徽章 `gap＋nowrap` 水平並排（欄寬 minmax 148）；取貨徽章由品項層 meta 升為履約軸狀態值＝重新詮釋 D111（ASSUMPTIONS UIA-080）。**2026-07-16 爭議降為狀態**：dispute 不再是常駐操作區塊，改為 Payment·settlement 軸的 disputed 狀態值（示範訂單 #ZT-10482＝Paid、不觸發顯示），守 PCR-001 兩軸不混用（UIA-057c）|
| Order refund modal | `#od-refund-modal / .od-refund-check / .od-amt / .od-subhead` + 重用 `.payout-modal`／`.payout-dialog` 外殼・`.segmented`・`.data-list`・`.field__hint` | 訂單詳情退款彈窗（spec 5.1.5.3.1，2026-07-16 對齊）：原常駐「Refund & dispute」card 撤除，改彈窗——**重用 payout 對話框外殼**（比照出貨彈窗 `#od-ship-modal`，零新 modal 元件 CSS）。內容＝退款範圍 `.segmented`（整筆 Full／部分 Partial）、部分退款以 `.data-list`＋`.zcheck`（`.od-refund-check` 掛在 `.zcheck__input` 上；2026-07-27 由原生 checkbox 改為共用元件）勾選品項、`.od-amt` 即時試算退款金額、庫存回補／收入影響／爭議區隔以 `.field__hint` 說明。頁末 IIFE 控開關（比照 od-ship）＋segmented 切 Full／Partial 分支＋checkbox change 重算金額；confirm 為 demo（關窗，真實退款經 Earnings §7.3）。頁首 Refund 鈕 `#od-refund-open`（保留 `data-feat="O18"`）移除 disabled＝最終形態可操作，**Phase 1 由 O18 gate 隱藏＝守 D041「v1 不開放創作者主動退款」**（UIA-057a/b）。`.od-subhead`＝§2.3 卡內三子標題（品項明細／金額拆解／收入對帳，§2.3.1–§2.3.3）的 **page-specific 局部 class**（頁面 `<style>`、token 化、非 DS 元件，UIA-057d）。i18n 新增 `od.items.sub.*`／`od.refund.*`（`od.refund.title` 改「Refund」）|
| Pickup management | `.pickup-board(欄間分隔線 only; __stage/__bar/__pct/__acts) / .pickup-detail__meta--stack / .scanner-hand(__row/__k) / .pickup-roster(__num/__none/__act) / .pks-step(__intro) / .scanner-access(__qr/__main/__label/__url/__actions/__pw) / .qr-box(--lg/--disabled) / .pickup-detail__header/__meta / .pickup-stats / .pickup-select__row(.is-checked · __box/__img/__text)` | 取貨管理工作區（spec 5.1.5.11／5.1.5.14／5.1.5.15、D111）SiteSpecific organism：Scanner 存取卡（URL＋密碼＋faux-QR，於 pickup-detail.html）＋建立場次多選列。QR＝`window.ztorFauxQr()` 生成 finder+偽隨機模組（UIA-046，非真碼）。場次清單/可核銷項目/名單/核銷紀錄重用 `.data-list`、KPI 用 `.kpi.bento`、狀態篩選 `.filter-tabs`。全 token 化、無裸色。**2026-07-06 拆真實獨立頁**（原單頁 tab 切換改真連結+真檔案）：pickup.html（清單，F1–F4）／pickup-detail.html（場次詳情，5.1.5.15：場次資訊+Scanner存取+核銷紀錄+**F4 取貨/入場名單完整管理版**）／scanner.html（手機 scanner，5.1.5.14：F1 掃描+**F2 可核銷項目正式定義+F3 唯讀簡化名單**，Scan/Items/Roster 分頁互切、不連出其他頁）。**2026-07-06 D121**：5.1.5.13 整份退役，`pickup-roster.html` 刪除，兩部分內容分別併入上述兩頁；建立場次 popup `partials/pickup-session-modal.js` 於 pickup.html F3、pickup-detail.html F1 共用開啟入口 · **2026-07-17（UIA-059）**：該 popup 由退役 `.payout-field*` 遷至 canonical `.field`/`.form-grid`，STEP 1 依 spec 5.1.5.12 §4 分三 `.form-section--modal` 區塊；F2「加入取貨項目」用單框 combobox（新 `combobox.css`，重用 `.tag-input`＋`.chip`：已選 chip＋focus 下拉建議），F3 改「設置密碼」；`.form-section--modal` 改為 `--muted` 填色面板＋`--border` 邊框（細線在 `--card` dialog 暗色下讀不出，改填色分區）；補齊 pickup.html 漏掛的 `form-section.css`／`chip.css`；移除舊 F2 副標與底部 stickynote。UI 文案「加入取貨項目／設置密碼」與 spec 標題「可核銷項目／Scanner 存取」有分歧（見 UIA-059(d)）。**2026-07-17（UIA-059 三輪，參考 Mobbin Vapi 頂部分頁 dialog）**：STEP 1 三區改頁籤式——重用 `.tabs`＋`.tab-panel`（基本資訊／取貨項目／密碼，`[data-pks-panels]` 保 min-height、`.pks-panel__intro` 引言），**退場已無消費者的 `.form-section--modal` 填色面板變體**；取貨項目頁加 `.tabs__item-count` 即時計數、按「建立」時驗證並自動跳到出錯頁籤（D112「需 ≥1 項」仍以停用鈕落地）；pickup.html／create-product.html 補掛原漏的 `tabs.css`  · **2026-08-01（UIA-100，使用者裁決）**：pickup-detail 第一屏由「page-intro 說明段＋`.scanner-access` 整張卡＋獨立進度區」三塊平鋪，收斂成單張 `.form-section--outlined`＋`.form-grid` 兩欄（**整套骨架沿用 product-detail：卡＝form-section--outlined、標題＝form-section__head/__title、大數字＝bento 內的 kpi--compact、鍵值＝kv**，`.pickup-board` 只補欄間分隔線與 `__stage`/`__bar`/`__pct`）——左欄＝領取的活動與物品（`.pickup-detail__meta--stack` 地點時間＋`.kv` 領取項目），右欄＝工作人員操作取貨要知道的（上半 `__stage` 隨場次狀態換核銷數字、下半 `.scanner-hand` 唯讀網址密碼＋圖示複製鍵）；名單由 `.data-list` 改 `.ztor-table`＋`.pickup-roster` 八欄表格（對齊 5.1.5.15 F4 欄位）；核銷紀錄由同級分頁改 `.payout-dialog` popup；建立編輯 popup 由三頁籤改**兩步**（`.pks-step`，不放 stepper），密碼改選填並預先產生、掃碼網址重設／停用移入編輯模式，**退場 `[data-pks-panels]`／`.pks-panel__intro`／result step**；pickup-detail 補掛 `kv-list.css`／`form-section.css`／`bento.css`／`kpi.css`／`stock-bar.css`／`payout-modal.css`／`table.css`  · **2026-08-01（列表）**：`pickup.html` 撤 Scanner 欄（8→7 欄，`--pickup` grid 模板同步）；整列可點進詳情頁（`.product-list__row--link`＋`data-pk-open`，`tabindex=0`／focus-visible／讓出列內互動元素）；列選單只留「開始掃描（另開視窗）／複製 URL／封存」，撤「開啟／顯示 QR／編輯場次」；封存 icon 由 `inbox` 換成新註冊的 `archive` |
| Mobile scanner | `.scanner-page(grid 1fr auto 1fr，手機框恆置中) > .scanner-frame > .scanner-top(__name，解鎖後才出現) / .scanner-brand / .scanner-pw(__err)+.scanner-session(__name/__meta) / .scanner-lockout(__icon/__title/__count/__body) / .scanner-counts > .scanner-count(--done) / .scanner-body(.scanner-cam(__hint/__reticle/__line)、名單/項目吃 data-list＋stock-bar、名單列 .scanner-rosterrow) / 覆蓋層 .scanner-scrim + .scanner-sheet(--ok/--warn/--bad · __band/__body/__foot；.scanner-buyer/.scanner-claims>.scanner-claim/.scanner-result__rows(__row)) + .scanner-flash(__inner) + .scanner-block(__inner/__title/__body) + .scanner-offline(__queue) / .scanner-tabbar > __btn(.is-on) / .scanner-demo(__title/__note)` | 獨立手機 scanner（spec 5.1.5.14 / D111/D121/D122）SiteSpecific organism：獨立 URL、無主工作台導航。**2026-08-19 流程重規劃**：相機即主畫面、結果改框內 bottom sheet（確認後直接回相機、支撐連續掃描）、密碼閘門先亮場次身分＋選填工作人員標示、頂部即時計數、底部三分頁；未開始/已結束整層 blocked、離線保留佇列（呈現假設 SCAN-002）、五次錯誤鎖定（demo 以 10 秒代替 10 分鐘）。相機區維持手機框自身底色（正式產品由實際相機畫面填滿），原型只畫四角括號與掃描線、手動輸入鈕浮於其上（`.scanner-screen--cam` 去內距讓相機滿版）；sheet 遮罩＝`--overlay-tint`（同 drawer）；掃描線 respects `prefers-reduced-motion`。前端 demo：密碼接受任意非空；情境切換集中在畫面旁的 `.scanner-demo` 側欄（prototype-only）：成功/重複/不屬此場次/已取消退款/離線/場次時間/鎖定/重設；名單為內存資料，核銷後名單、項目統計與計數即時連動；名單點列預填手動輸入代碼（核銷仍走 F1.1）。用於 scanner.html |
| Embed modal | `.embed-modal / __sheet / __head / __title / __close / __frame` | 全螢幕 popup 以 iframe 內嵌另一頁、就地開啟（spec 5.1.5 F3 / D065）：電子商店「商店設定」開 store-settings.html popup，不離開清單；模糊背景、有上限 sheet、lazy 設 src、Esc/backdrop/× 關閉、`body.is-modal-open` 鎖捲動 |
| Split button | `.split-button / __main / __caret` + 重用 `.btn`/`.dropdown` | 主操作＋箭頭下拉相關動作（spec 5.1.5 F3 / D066，ref. Add Event ▾）：電子商店 F3「建立」context-aware——主鈕標籤/連結隨目前 tab（商品 5.1.5.2／組合 5.1.5.4／拍賣 待補），箭頭下拉一律列全部三類；主鈕只留左圓角、`__caret` 只留右圓角＋inset 細線相連，選單右對齊。分割按鈕為非約束呈現參考 |
| New product post | `.npp-product(__thumb/__info/__name/__meta/__price/__link)` + `.npp-intro` + 重用 `.payout-dialog` 外殼與 `.msg-*`（message-modal）| 建立商品後在電子商店清單彈出的撰寫彈窗（spec 5.1.5.7 / D068）：**重用群發 composer**（受眾·標題≤120·內文≤2000·個人化 token·排程，不重定義發送機制），本檔只加 F2 商品附件卡與略過路徑。由 `partials/product-post-modal.js` 掛於 e-shop.html、`?posted=1` 開啟；標題/關閉在彈窗外框（無頁首，D067）。發布為 demo（通知粉絲＋Fans CRM 引用 5.1.7.1／5.1.2.2 §4.9）|
| Choice card grid | `.choice-grid / .choice-card / .choice-card--active` | Radio-style 選擇器（項目類型、access model、event type） |
| Wizard frame | `.wizard / .wizard__top / .stepper / .wizard__bottom` | 4-step wizard 專用 layout（無 sidebar）。**2026-07-09**：7 個建立頁重複的 `.wizard__body` 頂距／內容寬頁內覆寫 promote 成 `.wizard__body--form/--narrow/--wide` 修飾類；funding-simulate／funding-test 頁的分岔值維持頁內，未強行統一 |
| Sectioned create form | `.wizard__sheet--sectioned / .form-section--outlined` | 建立流程共用區塊式表單：sheet 底使用 `--surface-page`；outlined section 以 `--card`（light）／`--muted`（dark）、`--border` 組成，所有可見 outlined siblings 以 `--sp-24` 分隔並跨越 `[hidden]` 條件 section。採用於 create-product／-auction／-bundle／-event／-project／register-ip／admin-ip-bank-entry；不改欄位、驗證或流程行為 |
| IP hero | `.ip-hero / .ip-hero__cover / .rental-card / .duration-grid` | IP 詳情頁專用三欄 hero |
| Stacked bar | `.stacked-bar / .source-list` | Revenue by Source 共用 |
| Tabs | `.tabs / .tabs__item / .tabs__item--active` | Orange 底線 active state · **`.tabs--brand` 變體**＝淡橘（`--primary` 18%）填色 active pill、無底線（opt-in，僅 E-Shop F3 類型切換，不動全站 `.tabs`，2026-06-15）|
| Filter tabs | `.filter-tabs / __item / __item--active / __count` | 次級狀態篩選 pill 列（spec 5.1.5 F3）：每顆 pill 一個狀態＋即時數量徽章，active＝淡 `--muted` 填底、刻意不用品牌色，放主 tabs 下一行形成主次層級；數量由前端讀清單 `data-status` 計算（切 tab 重算）。E-Shop F3 狀態篩選由原 `field-pill` select 改用（2026-06-15）|
| Alert（`--bar`）| `.alert--bar` + `.alert__icon/__body/__title/__cta/__dismiss` | 全寬頂部通知條變體（spec 5.1.5 F2）：白底、底部細線、單行、⚠ 警示色 chip＋深色文字連結 CTA＋圓形關閉；置於 `.main` 頂端、`position:sticky` 常駐、可關閉。E-Shop 低庫存提醒由原 `.alert--banner` 卡片改用（2026-06-15）|
| Settings layout | `.settings-layout / .settings-nav / .settings-section / .settings-row` | 220 px sticky 左側 + 右側單一 active section；左側選項以 URL hash 切換，其他 section 不佔頁面高度 |
| Theme controller | `[data-theme-toggle] / [data-theme-set]` | `theme.js` 的 light / dark / system 偏好控制；無儲存值預設 dark，URL `?theme=` 僅當頁覆寫 |
| Pills | `.pill / .pill--orange / --success / --error / --info` | 統一狀態語言 |
| Store settings 版面與欄位 | `.ss-stack / .ss-identity-card / .ss-band__* / .ss-edit / .ss-url / .ss-amount / .ss-status / .ss-order / .ss-tabpanel / .ss-fan` | 商店設定頁（spec 5.1.5.5 v8 / D035 IA + D036 功能頁 F1~F5）：`.ss-stack` 滿版（≤1280px，同其他頁）；門面（F2）`.ss-identity-card` 常駐用 **Base44/FB 式身分帶**（封面 `.ss-band__cover` ＋疊加 logo 頭像 `.ss-band__avatar` ＋店名／網址／簡介），**逐欄就地編輯** `.ss-edit`（文字態 ↔ 內嵌控制項，✓/Enter 確認、✕/Esc 取消；品牌素材＝封面＋頭像，不另設上傳框）+ 設定群組 `.card` 用 `.tabs` 切 `.ss-tabpanel`（F3 商品陳列/F4 付款/F5 出貨，出貨 tab 用 `.settings-row`）；補基礎控制項沒有的欄位（網址前綴 `.ss-url`、$ 金額前綴 `.ss-amount`、唯讀 Stripe 卡 `.ss-status`）＋拖曳排序 `.ss-order`（F3 / D031）＋ See as fan 預覽 `.ss-fan`（F1，`.preview-panel--inset` 畫面分割）＋底部提交列 `.ss-actionbar`（D067 popup 提交區，sticky）。**D067：popup-only，無全域導航/麵包屑/page-intro**，標題與關閉由 embed-modal 外框承擔。逐欄編輯為前端 demo，最終由底部 `.ss-actionbar` 的 Save 提交（postMessage 關閉 popup）。**See-as-fan 預覽內容 2026-06-16 改用 Fan store 元件**（見下行，取代 `.ss-fan`） |
| Fan store（粉絲端店面·手機版） | `.fan-store / __overline / __phone（scoped --fst-*）> __screen（自捲動）> __appbar(__wordmark/__appbar-end) / __hero(__artist/__tagline/__meta/__role/__socials/__social/__follow) / __nav(__nav-item--active，sticky) / __content > __featured(-media/-info/-tag/-title/-price/-cta) · __tabs/__tab(--active，底線式) · __grid > __card(--out)(__thumb/__card-title/__card-foot(__card-price+__cart)/__card-status) · __fans(__section-head/__section-title/__link/__fans-row > __fan(__fan-ava--r1..r5/__fan-rank/__fan-name/__fan-pts)) · __about(__about-text) / __tabbar(__tabbar-item--active，sticky bottom)` | See-as-fan 預覽的粉絲端店面（**E-Shop F5＋商店設定 F1 共用** `partials/fan-store.js`，§6.7 同源、差異即缺陷）。**2026-07-02 改「深色手機」呈現**（使用者裁示，版型參考 endgame creator 商店手機版原型、僅視覺證據）：面板中央深色手機外殼＋560–640px 自捲動螢幕＝粉絲 app 商店頁——app 頂列（sticky）＋hero（名字壓深色漸層＋社群 YT/IG/TH/X＋加入社群橘 pill）＋sticky app 分頁列（商店/活動/排行榜/貼文/關於）＋本月精選（橘 overline＋橘框 Buy now）＋商品/組合/拍賣底線子分頁＋雙欄商品格（橘購物車圓鈕；售完無鈕）＋頭號粉絲（名次圈 r1 橘=var(--primary)/r2 紫/r3 綠…）＋關於＋sticky 底部 app 導航。**螢幕＝fan app 固定深色面**（scoped `--fst-*` 主題例外，同 vip-card；登記 design-system.md Raw-color exceptions）；空店面 `.when-empty`＋`.empty-card`（螢幕內深色覆寫），grid/featured/tabs 隨 `html[data-data-state="empty"]` 收起。icons 新增 menu/user/shopping-cart。**追蹤數/社群/加入社群/本月精選/立即購買/售完補貨中/app 分頁列/頭號粉絲/關於/購物車/底部導航＝產品變更提案（UIA-026 共 12 項，待上游核准、未寫回 documents/）**；display-only，預覽不改資料 |

| Auth shell（未登入層置中表單，無卡片） | `.auth-page / .auth-shell / .auth-brand / .auth-step / .auth-intro / .auth-head(__back) / .auth-title / .auth-sub / .auth-pw(__toggle) / .auth-inline(--lead) / .auth-actions / .auth-foot / .auth-link / .auth-note` | 登入頁的整頁殼（spec 5.1.10 / D170）。**2026-08-04 使用者裁示改成無卡片版**：頁底 `--background`、`.auth-shell` 只有 max 420 ＋ `--sp-24` 垂直節奏，沒有底色／邊框／陰影／圓角／內距（前身 `.auth-card` 帶 `--card`＋`--shadow-card`＋`--radius-xl`＋`--sp-32`）。四個畫面用 `.auth-step[hidden]` 互切。方式選擇卡重用 `.radio-cards--gate`、錯誤列重用 `.alert--row.alert--error`、返回鈕重用 `.btn.btn--icon`（Q43 裸箭頭），本檔不另造 |

### 3.3 Dark mode

繼承 R 2.0 / ztor yellow 的 `[data-theme="dark"]` 機制 — translucent white overlays on near-black canvas，orange primary 在兩種模式都保留。所有 R 2.1 patterns 都 100% token-driven，flip 主題不需任何 override。

主題偏好由 `theme.js` 的 `[data-theme-toggle]`／`[data-theme-set]` 控制，寫入 localStorage；無儲存偏好時預設黑夜。`?theme=light|dark|system` 是不寫入偏好的當頁覆寫；`section-test.html` 提供目前的外框與主題驗證入口。

---

## 4. 頁面實作對照（spec → 實作）

| Spec section | 對應頁面 | 實作狀態 | 備註 |
|---|---|---|---|
| 5.1.10 登入（Login）| login.html | ✓ Full（demo） | 2026-08-04 新建（D170）。F1 方式選擇（六張 `.radio-cards--gate`，2 欄 × 3 列：電子郵件／手機號碼＋Apple／Google／Facebook／LINE，六張等高、四張第三方共用同一句副標）／F2 電子郵件（信箱＋密碼，可切顯示隱藏；欄位填妥前主要行動停用）／F3 手機號碼（國碼預設 TW +886＋號碼＋驗證碼＋取得驗證碼倒數）／F6 忘記密碼（只承諾入口）；F4 落地分流 Admin→`creators.html`、Artist→`index.html`；F5 憑證錯誤不分辨帳號或密碼、手機查無號碼顯示「尚未開通」且無任何通往註冊的路徑。無推薦碼、無同意條款、無自助註冊（註冊入口整段移除，任何版本都不出現）。第三方登入是 2026-08-04 使用者裁示新增的產品範圍變更，規格由上游同步。demo 手法與待上游項目見 ASSUMPTIONS UIA-105 |
| 5.1.0.4 影片上架審核 | admin-video-review.html | ✓ Full（demo） | 2026-08-07 新建（D179）。Admin 同層目的地第五個（`js/sidebar.js` 的 `ADMIN_ROUTES`／`ADMIN_NAV`／`FULL_ROUTES` 三處同步，icon `file-check`）。一頁兩檢視、由 `?id=` 切：**清單**＝`.list-toolbar` ＞ `.tabs--underline-short.--count-plain`（全部／待審核／審核中／審核通過／審核不通過，各帶件數）＋ `.list-toolbar__actions` 的 `.field-pill` 搜尋；表格用 `.admin-table-wrap` ＋ `.ztor-table`（九欄，封面走 `.admin-table__thumb` 背景圖），空狀態用 `.empty-card`（無送審件與查無符合兩種文案，後者附清除鈕）；排序 `ORDER = {pending:0, inreview:1, rejected:2, approved:3}`，同狀態內按送出時間由舊到新。**詳情**＝頁首用新元件 `.review-status`（狀態徽章＋創作者／最近送出／等待時間／送出次數／審核者＋退件理由或通過說明＋動作列），來源項目脈絡與四個步驟各一張 `.form-section--outlined`＋`.kv` 列，送審歷程用 `.data-list`，頁尾唯讀邊界用 `.info-banner`；兩個確認彈窗（通過／退件）用 `.payout-modal`＋`.payout-dialog`，退件理由 `textarea` 空白時不放行。無頁面 `<style>`。狀態機、字彙與流轉全在 `js/work-review-store.js`（localStorage `ztor.workReview.v1`，四筆種子涵蓋四態、含一筆送出次數 2 的重送件）；權限用 `window.ZTOR_DEV_PAGE_GROUPS` 的頁面級開關 `vrRole`（平台營運／創作者）演示無權限狀態。切語言時本頁自繪內容整段重畫（`i18n:applied` → `render()`，render 內不再回呼 `applyI18n` 以免無限迴圈）。呈現假設見 ASSUMPTIONS UIA-111 |
| 03 §5.1.1 Dashboard | index.html | ✓ Full | （2026-06-05 對齊改版 5.1.1）F1 Hero carousel → F2 營運摘要（總收入引用 Earnings ｜ 待處理數 ｜ 進行中項目數）→ F3 近期收入（含收入狀態）｜ F4 今日待處理（重要程度·關聯物件·處理狀態·CTA）→ F5 近期動態（類型·來源·狀態）｜ F6 近期活動與項目 → F7 粉絲關係與受眾趨勢（單卡雙欄）｜ F8 外部資料狀態。趨勢圖 / Revenue-by-source 已移除（屬 Earnings Overview）。2026-06-05 起 F2–F8 全部改由 `components.js` runtime 注入（單一 source of truth）；F3 的 transaction-list 與 earnings.html Overview 共用同一 renderer，列格式不再各頁漂移 |
| 03 §5.1.2 Projects | projects.html | ✓ List | 列表＋卡片雙檢視（view-switch）· 狀態分頁（All/Draft/Scheduled/Live/Completed/Failed·Cancelled，Funded 歸 Live；計數為無底色、較高對比文字）＋類型篩選（直接發佈／募資／預購）＋項目搜尋 · 每筆顯示依類型×狀態，清單檢視把類型置於名稱上方、不另設類型欄 · 募資／預購列的當前目標以小一級百分比、既有 6px `.project-bar`、已募／目標金額三排呈現（進度條為裝飾，文字仍是資訊來源）；桌機欄間距 20px，目標欄 144px、≤1180px 136px，格內左右各 4px · 未完成 hover tooltip · 空狀態 · 8 範例。單一項目詳情/編輯 → 5.1.2.2（project-detail.html 另案） |
| 03.1 建立項目（依類型分流）| create-project.html | ✓ Full | 依項目類型動態 stepper（spec 5.1.2.1 v3 §3）：Go live＝About/Showcase/Monetization/Review（4 步）· Fund it first＝About/Showcase/Funding/Tiers/Review（5 步）· Pre-order＝About/Showcase/Pre-order/Review（4 步）。共用步驟 About（含 chip 內容類型 + 依類型動態欄位組 + IP 租借）/ Showcase / Review（per-type 摘要＋交付時程＋What happens next＋發布前檢查）。平台費＝5% + 3% Stripe（修正前版 15% 誤抄，spec D029）。募資步驟含預算分配 100% 驗證 · Tiers 最少 3 · save draft · close 確認。**2026-07-24（B 反饋）**：流程前閘門與 About 內的項目類型，統一使用 `.radio-list--menu` 的圖示直列面板；選中以列底色與右側橘點提示，不用橘色外框。僅呈現調整，三種模式、FLOWS 與欄位規則不變。**2026-08-18（B 反饋）**：閘門改成兩關——第一關項目類型、第二關內容類型（`[data-gate2]`，十張 `.selection-card--icon` 磚配新增的 `.selection-grid--tiles` 密度變體：`minmax(124px)`、`min-height:108px`、內容垂直置中），兩關都選完才進主流程，因此 stepper 第一次畫出來就是最終步數；About 內的項目類型下拉 `#cpp-type` 退場，改選走標題列右側的切換鈕 `#cpp-type-switch`（把第一關叫回來，做法同 create-event 的 `#ce-type-switch`），閘門 ✕ 以 `enteredWizard` 分「離開流程 / 取消重選」兩種意思；內容類型移到項目標題之上、控制項改下拉 `#cpp-cat`（磚只留在閘門），閘門磚與下拉選項由同一份 `CATS` 清單渲染、閘門那組不畫已選態。FLOWS、FILM_CATS 與欄位規則不變；分流時機由「流程中途」提前到「進流程前」，規格待回寫。**同日第二輪（B 反饋）**：進度列改用建立活動那一版（`progress-stepper--segmented --anystep` ＋每步狀態小字，i18n `wiz.step.done`／`wiz.step.todo`）；閘門第二關給兩個出口（標題上方 chevron 回第一關、底下 ✕ 離開流程）；About 的 IP 租借那格收成標題＋一顆滿寬 `.btn--add`（文案「選擇綁定的 IP」，空狀態句／說明／hint 三段撤除）；全站 add／expand 按鈕改用新增的 `.btn--add`（36px 欄位級距，28 處） |
| 5.1.2.2.1 作品上架流程 | publish-work.html | ✓ Full（demo） | 2026-08-07 新建（D178）。四步 wizard：音訊與字幕（影片檔／原始語音／字幕檔＋各自語言，可增可刪）→ 封面與影音素材（封面圖直式 `--img-portrait`／劇照 4 格／花絮／預告片，順序同規格 §4）→ 影片詳情（多語言標題與說明：一張 `.card--muted` ＝ 一個語言組，卡頭語言選單＋移除鈕，預設繁中與英文兩組、可增可刪、至少留一組、同一語言不重複、片長 HH·MM·SS、上映日期 YYYY·MM·DD、分類 21 項 `chip` 多選、標籤 `tag-input`、年齡限制六選一、定價：`switch` 是否付費＋`segmented` 幣種＋畫質列可增刪、每畫質四個數值）→ 演職人員詳情（九角色各可多筆＋備註）。骨架沿用 create-project 的 `.wizard__sheet--sectioned`＋`progress-stepper`＋底部 back／next，頂列 `wizard-chrome.js` 的自動儲存與離開確認；上傳一律 `upload-tile` demo。新元件 `entry-list`（演職名單）；畫質列與字幕檔各用一張 `.card--muted`，無頁面 `<style>`。入口只有項目詳情發文彈窗（不進 sidebar），`?project=<id>` 帶項目、不帶也能開。**送出＝送審（2026-08-07 第二輪，D179）**：把送審內容（四步全部欄位）＋待發貼文寫進 `js/work-review-store.js`（`submit()`，狀態轉待審核、送出次數 +1）、`ztorToast.queue('pw.toast.submitted')`、導回 `project-detail.html?id=`；`sessionStorage['ztor.workRelease']` 交棒後即清掉，避免舊的續作邏輯誤讀。三件事改由審核通過觸發（見 5.1.0.4 那列）。送出前跑 §8 就緒檢查：九項（付費時十項）逐項對照，未通過即 `nextBtn.disabled` ＋ footer 的 `readiness__chip`／`__pop` 列出「步驟 · 欄位」，只在第四步顯示（送出只發生在那一步），Cheat Codes 的 Skip validation 照放行。三個沒有 `__title` 的影音／字幕格自帶 `aria-label`＋`data-i18n-aria-label`，不吃 `upload-tile.js` 的泛用退路。**2026-08-07 第二輪補三處落差**：F1 影片檔加 `data-upload-processing`（元件層新增 `.is-processing`），卡頭掛唯讀狀態徽章（`#pw-video-state`，四態吃 `badge--neutral／info／warning／success`），處理中 `filled` 為 false 故就緒檢查算未完成、送出鈕維持停用；F5 劇照改 `#pw-stills` 動態格（末格填滿即 `addStill()`、中間格清空即移出，沿用項目詳情相簿的 `upload:change` 監聽做法）；F6 花絮改 `#pw-bts` 一張卡一支（可增可刪、只剩一張時不給刪，做法同字幕卡）。未做：只剩上游自己標〔產品待確認〕的審核營運規則（見 ASSUMPTIONS UIA-109） **2026-08-11 新增編輯態（D182 第 11 題）**：`?mode=edit` 沿用同一組四步與同一份欄位，`ZtorWorkFields.fill()` 預帶現有內容；頂部 `info-banner` 隨改動說明會不會重新送審，最後一步主動作換字。送審分界照規格 §2.2.11（影片檔／定價／年齡限制要重送，文案／標籤／演職不用；其餘八欄上游未定，頁面明說「還沒定案」不代為歸邊）。詳見 §5.6、ASSUMPTIONS WEDIT-001 |
| 03 §5.1.3 IP Market | ip-market.html | ◑ Structure | Filter strip + 3 sample IP cards |
| 03 §5.1.4 My IP | my-ip.html | ◑ Structure | KPI（Total IP / Total rentals / Total revenue）+ tabs + 自有/外部 IP 分組 + Marketplace 開關 + 圖例 |
| 03.2 IP 詳情頁 | ip-detail.html | ✓ Full | IP hero · permitted usage · 法律提示 · rental + bidding 兩種模式 · owner manage panel |
| 03 §5.1.5 E-Shop | e-shop.html | ✓ | 低庫存通知條（含補貨入口）· Products/Bundles/Auctions tabs **互動切換**（`data-eshop-tab`/`-panel`）· **搜尋＋狀態篩選**作用於目前分頁（`data-name`/`data-status`，§7.2 Live/Low Stock/Sold Out/Draft）· **Shop 開關→狀態**（關＝Hidden，badge 即時換）· **See as fan** 分割預覽（重用 `.preview-panel--inset`＋`.ss-fan`）· **Bundles 清單**（`.product-list--bundles`，庫存＝min 成員 D031/UIA-008）· 低庫存/售罄實體列 **補貨**動作（→ restock popup）· 新增入口下拉（建立商品／建 bundle，Auctions 待 D026）· 分類顯示次分類（主分類＝badge 顏色）· 排序在商店設定 F3（D031，移除過時「Drag to reorder」字）· **2026-06-15 D065**：F3 加「商店設定」鈕，以 `embed-modal` 全螢幕 popup 內嵌 store-settings.html（不離開清單、關閉保留篩選）· **D064**：限量列 Stock 顯示在庫/上限進度（21/50）＋`data-edition`，多規格列加「N variants」neutral badge · **2026-06-15 D066 F3 改版**：狀態篩選每選項顯示目前類型商品數（All 4／Live 3…，切 tab 重算、不隨搜尋連動＝待確認）· 建立鈕改 **context-aware 分割按鈕**（`split-button`，主鈕隨 tab、箭頭列全部）· **See as fan 移出工作列 → F5 右側常駐欄**（`.eshop-layout` 左主欄＋右 aside，不收合，重用 `.ss-fan`）· **2026-06-15 F2/F3/F5 再改版（UIA-023）**：F2 低庫存改 `.alert--bar` 全寬細條（置於 `.main` 頂端、頂欄之下、`sticky` 常駐、只留數量＋CTA，取代 `.alert--banner` 卡片）· F3 狀態篩選由 `field-pill` select 改第二排 `filter-tabs`（pill＋數量）· F3 類型切換加 `.tabs--brand` 淡橘 active pill · **F5 商店預覽改常駐不可關閉的畫面分割**（重用 `.preview-panel--inset` 壓窄 `.main`、非浮層、永遠 `is-open`；移除「粉絲視角」切換鈕與 ✕／Esc；窄螢幕 ≤1100px 退化為靜態堆疊在清單下方；標題由「粉絲眼中的商店」改「商店預覽」；撤除 `.eshop-layout` 固定右欄）· **F5 視覺**＝灰底上的兩塊圓角面板（右欄內縮 `--space-shell-gutter` 灰隙、頂對齊 main、頂角 `--radius-shell`，使 main 右上角露出圓角）＋預覽內容包成白色圓角「店面頁」卡、商品平鋪磁磚（Mobbin Direction B；`#eshop-preview` scope 覆寫 `.ss-fan`，不動 store-settings）· **2026-06-16 新品貼文（5.1.5.7／D068）**：掛 `partials/product-post-modal.js`，`?posted=1`（建立商品完成後導回）自動彈出撰寫 popup、帶入剛建商品；重用群發 composer＋F2 商品附件卡，可發布／略過（見 New product post 元件）· **2026-06-16 F5 預覽改用 Fan store 元件（UIA-026）**：See-as-fan 內容由 `.ss-fan` 改注入共用 `partials/fan-store.js`（hero cover＋本月精選＋分頁＋商品格，與商店設定 F1 同源 §6.7）；右預覽欄與主面板頂/底齊平；新欄位（追蹤數/社群/加入社群/本月精選/立即購買/補貨中）為提案 · 互動皆 demo 無後端 · **2026-07-02 補貨改版（D100→D101→D104）**：商品列／組合（live bundle）列／多規格列（Coastline tee `data-variants`）kebab 皆加「補貨」→開同一補貨單 popup（`createRestock`→`openOrder`）。**補貨單模型（D104）**＝單據層（方式立即/計時＋供應商/ETA/備註填一次）＋品項數量列（`.restock-lines`／`.restock-line`）：單一規格 1 列、多規格逐規格列（`.restock-lines__group` 商品名）、組合逐成員（多規格成員展開規格列）；數量留空＝不補；取代先前 D100/D101 的 tab 面板。方式立即→In stock、計時→Restocking＋填 ETA/到貨確認→In stock；行為集中在 `partials/restock-modal.js`（見 Restock order 元件與 5.1.5.6 v1.4，UIA-006/007）· **2026-07-16 清單「實體→數位」呈現順序（D135 對應）**：Products 靜態列改排成 草稿置頂 → 實體各列 → 數位各列——把原本夾在實體列中間的 Coastline EP（Album）移到實體列之後，新增數位樣本 Song（`music`）／Movie（`film`）／Membership（`id-card`）三列（`data-type="digital"`、Live、∞ 庫存），最終數位順序＝單曲→電影→專輯→會員卡，四類覆蓋數位次分類；新增 icon `id-card`、i18n `e-shop.rowSong/Movie/Vip.*`（EP 重用 `e-shop.row3.*`）。純 demo 呈現排列＝**非強制排序**，`applyFilter()` 不加排序、`pinDrafts()` 不動；粉絲端陳列順序仍由拖曳決定（D083）；見 UIA-050|
| 5.1.5.5 商店設定 | store-settings.html | ✓ | popup IA（D067，回退 D028 的 header 子頁；D035 群組 IA + D036 功能頁 F1~F5）：**popup 不需頁首**——移除全域導航/麵包屑/page-intro，標題與關閉由 embed-modal 外框承擔；F1 設定動作與預覽＝內容底部 `.ss-actionbar` 提交列（See as fan/Discard/Save，sticky）· F2 店面門面常駐置頂（店名/簡介 200 字/品牌素材/`ztor.com/shop/` 網址/幣別載入預設未選）· F3~F5 以 tab 切換——F3 商品陳列＝拖曳排序已上架商品（粉絲端順序單一來源 D031）＋兩種空狀態、F4 付款＝唯讀 Stripe 卡（口徑依 Earnings §7.3）、F5 出貨＝出貨地址/免運門檻 · F1 See as fan 畫面分割預覽（門面＋商品陳列）· Save/Discard 以 `postMessage('ztor:storeset-close')` 通知 e-shop 關閉 popup · 皆 demo · **入口為電子商店 F3「商店設定」鈕，由 e-shop 以 `embed-modal` iframe 內嵌（D065）**；store-settings.html 為該 popup 的完整內容、popup-only · tab 與畫面分割為非約束呈現參考 · **2026-06-16 F1 See-as-fan 預覽改用 Fan store 元件（UIA-026）**：內容由 `.ss-fan` 改注入共用 `partials/fan-store.js`，與 E-Shop F5 同源（§6.7）；新欄位為提案 · **2026-08-04 新增 F7 商品規格（spec v17／D171）**：設定群組 3→4 tab（付款｜出貨｜幣別｜商品規格），第四組是**尺寸表範本庫**——同一 tabpanel 內兩個檢視用 `[hidden]` 互切（清單 `.ztor-table`＋`.admin-table__actions` kebab〔編輯／複製／刪除〕＋`.empty-card` 空狀態 ↔ 單一範本編輯）。不開次級 popup（本頁已在 embed-modal iframe 內）、不做行內展開（編輯內容量遠大於其他三組）。編輯欄位＝名稱／商品類型（唯讀 `.badge`，本版只有 Apparel）／尺碼制與單位（`.segmented`）／尺寸表（新元件 `.sce`）／版型建議／身高體重參考（`.sce` 第二實例，欄固定）／量測方式（`.spec-row`）／免責說明。頁面層新增 `.ss-spec-editor__head`／`.ss-spec-block`／`.ss-spec-editor__foot`（進 `store-settings.css`，不留頁面 `<style>`）。**兩個上游缺口未補**：商品層如何選用範本（PG-030，故「套用中」為假資料）、平量與圍度基準不一致（PG-031）；demo 手法見 UIA-106 |
| 03.4 商品細節頁 | product-detail.html | ✓ | breadcrumb · 內容編輯 · 銷售摘要（引用 Earnings）· 項目引用警告 · Restock 鈕（5.1.5.6）· **2026-06-15 §2.3/D064**：新增「庫存、取貨與購買設定」卡——庫存版本 Edition（不限量/限量 `.segmented`，限量補上限/在庫）· 取貨方式（物流 重量/尺寸/出貨分類/寄件地 ‖ QR 領取 `.segmented`）· 每人限購（switch＋上限）· 商品標籤（`tag-input`）；重用建立商品的元件與 `cp.*` i18n，條件顯示 `data-when-edition`/`-delivery`；皆 demo（UIA-018）· 多規格逐規格呈現待確認、media/交付細節 R2.1.1 待建 · **2026-06-29 §2.3/D095**：「商品內容」卡補詳細規格（Specifications，僅實體，`spec-row` 元件＋重用 `cp.spec.*`，預填 zine 範例、可增刪）；主分類移除已打散 Special/Premium（對齊 §7.1/D080）· **2026-06-29 §2.3/D096**：補完商品圖片／素材（`upload-showcase`/`upload-tile`，實體主圖＋附圖／數位封面＋附圖）· 數位內容檔案（`upload-tile--file`，§4.2 F11）· 數位交付說明（info-banner）· 主分類 `#pd-main-cat` 切換實體↔數位連動顯隱 `data-pd-cat`；spec 已移除「R 2.1.1 待建」字眼；皆 demo（無真上傳，真實上傳／存取防護待上游後端）· **2026-07-02 §2.3/D100**：新增「補貨紀錄（Restock history）」區（重用 `.data-list`，僅實體、最新在上，狀態 badge）；Restock 鈕開單一商品面板（立即/計時），送出即 append 一筆紀錄（demo）· **2026-07-02 §2.3/D105（＋S31.1 建置）**：低庫存門檻欄改**版本切換兩態**——base（`data-feat-off="S31.1"`）＝唯讀自動 10%＋提示；升級版（`data-feat="S31.1"`）＝可編輯數值＋覆寫提示；cheat code「版本」控制（Phase 1 顯示 base、Next+／最終版顯示可編輯）。`product-detail.threshold.hint`／`.custom.hint`；UIA-042 · **2026-07-02 §2.3–§2.5/D109**：卡片重分三張——「Product content」移除價格·庫存·低庫存門檻（只留內容）；**新增「Price & stock」卡 `#pd-pricestock`**＝價格/庫存/低庫存門檻 3 欄＋Edition＋Restock history（後兩者自 settings 卡移入）；原「Inventory, delivery & buyer settings」卡更名「Delivery & buyer settings」（`#pd-settings`，只留取貨/數位交付/每人限購/標籤）。`applyVis()` 的 `[data-when-edition]` 查詢改 `document` 範圍（子欄位已跨卡）；i18n 新增 `product-detail.price.title/.sub`、改 `.inv.title`；i18n.js buster 全站→`20260702m`；UIA-043 · **2026-07-16 §2 重排（D133/D134/D135）**：依上游 5.1.5.1 §2 13 節新順序重排——**銷售摘要前置（D134）**＝Sales summary（`bento--span-7`）＋Referenced by projects（`bento--span-5`，保留 `data-feat="S24"`）搬成 page-intro 後第一個 bento，Product content 卡改獨立 `card mt-16`；**主分類移除 Experiences（D133）**＝`#pd-main-cat` 只留 Physical/Digital（切換 JS `selectedIndex===1` 判 digital 不受影響）；**新增 §2.8 商品規格 Variations 卡（D135，`#pd-variations` `data-pd-cat="physical"`）**＝重用 `variant-builder`／`segmented`／`chip`，規格模式（單一/多規格 `data-pd-var`）＋示範選項建構器（Size/尺寸＋S/M/L chips，新增/remove 未接功能）＋靜態逐規格表 3 列（規格組合/價格/庫存/SKU/單件成本，價格與成本用現金 `$` 前綴 `amount-field--readonly`、無 POPCORN、上限欄從簡）；JS 擴充既有 settings 段 `applyVis`／`wireSeg` 加 `data-when-var`（預設 single）· **價格補原價/成本（D133）**＝Price & stock 卡價格區改三欄 `form-grid--3`＝價格/原價（`cp.original`）/成本價（`cp.cost`「僅自己可見」），一律現金 `$` 前綴 `amount-field--readonly`、不帶定價單位鈕；庫存/低庫存門檻改置其下獨立 2 欄 `form-grid`、內部 feature-gate 原封不動。新增 i18n `cp.var.single-note`；重用 `cp.var.*`/`cp.original*`/`cp.cost*`/`cp.optional-cap`。全用既有 token/元件、未新增元件 CSS/裸值；UIA-051 · **2026-07-16 §3/D136（form-section 風格＋佈局重排）**：依上游 5.1.5.1 §3 頁面佈局，全部區塊由 `.card` 改 `form-section form-section--outlined`（`.form-section__head > .form-section__title + .form-section__sub`）、補掛 `form-section.css`；顯示序重排 10 節＝**銷售摘要（首排獨立一區，不再與項目引用並排；「View sales & revenue log」由整寬按鈕降級為右下 `.card__link`＋`--fs-12` 小文字入口）→ 商品素材＋商品資訊並列（`bento` 兩欄 `bento--span-6`×2，一欄 Media 雙版 `data-pd-cat`／一欄 Title＋主·次分類＋描述＋詳細規格；窄螢幕疊）→ 數位內容檔案（獨立節僅數位 `data-pd-cat="digital"`）→ 商品規格 Variations（`#pd-variations`）→ 價格 → 庫存與補貨 → 取貨與交付 → 每人限購 → 商品標籤 → 項目引用置底（`data-feat="S24"`）**；舊 Price & stock 卡拆價格/庫存兩節，舊 `#pd-settings` 卡拆取貨/限購/標籤三節。JS：settings 段入口由 `#pd-settings` 改判 document 錨點（`#pd-limit-toggle`／`#pd-delivery`）、限購欄改 `document.querySelector('[data-pd-limit-fields]')`；`applyVis`/`wireSeg`/標籤/補貨/取貨場次/See as fan 拆節後照舊；清掉主分類 script 過時「體驗」註解。新增 i18n `product-detail.content.sub`/`.price2.*`/`.stock2.*`/`.delivery2.title`/`.limit2.*`。全用既有 token/元件、未新增元件 CSS/裸值（check 5/10 基準未動）；UIA-051 · **2026-07-16 §2.6/§2.8/§2.10 D137（建立後固定不可編輯欄位鎖定）＋版面反饋**：主分類 `#pd-main-cat` 改 `disabled` select、規格模式 `#pd-var-mode`＋庫存版本 `#pd-edition` 兩 segmented 改 `segmented--locked`（`aria-disabled`＋各 `__btn disabled`），皆下掛新 i18n `product-detail.locked.hint`（唯讀呈現、不可切換）；後端訂單約束（上限≥已售、已售規格不可刪、數位改次分類受限）原型不強制（UIA-052）。**demo 替代版面（數位／多規格／限量）改由 devtools 預覽**：管理 IIFE 移除 var/edition 的 `wireSeg`（改鎖定）、新增 `applyCat`（含同步 disabled select 顯示值）／`syncLocked`（鎖定 segmented 高亮）／`applyFromDev`（讀 `ztor:devstate-changed` 的 `detail.pageOpts`），並註冊 `window.ZTOR_DEV_PAGE_GROUPS`（三組 `pd-cat`／`pd-var`／`pd-edition`）；移除舊獨立主分類切換 IIFE。**銷售摘要去框（反饋）**＝由 `form-section--outlined` 改裸露 `.pd-sales`：三 KPI `bento--span-4`×3 一排＋右下 `.card__link` 小文字，保留 when-data/empty；**素材附圖移次行（反饋）**＝Media `.upload-showcase` 加 `.upload-showcase--stacked`（主圖上、附圖下，實體＋數位版都套）。元件層 promote：`segmented.css` `.segmented--locked`、`upload-tile.css` `.upload-showcase--stacked`、`input.css` `:disabled` 狀態，均同步 DS 文件；全用既有 token、check 5/10 基準未動；UIA-052 · **2026-07-16 分頁式佈局（B 反饋，呈現決策）**：單欄長捲改 5 tab（重用 `tabs.css`＝earnings canonical，無新元件）＝**總覽**（§2.3 銷售摘要＋庫存健康快照〔新，`kpi`＋`badge`＋`data-tab-jump` 深連結〕＋§2.4 項目引用〔自頁底移入，唯讀〕）／**基本資訊**（§2.5+§2.6+§2.7）／**定價與庫存**（§2.8+§2.9+§2.10，合併避免拆逐規格表）／**交付與取貨**（§2.11+§2.12）／**關聯**（§2.13+§2.14）；`<nav.tabs[data-tabs]>`＋`.tab-panel[data-panel]`＋inline 切換 JS（`data-tab-jump` 跨 tab＋`#hash` deep-link，比照 earnings、無共用 tabs.js）；See-as-fan 分割預覽不動。§2.x 產品內容/欄位/空狀態/D137 三鎖定欄位/devtools page-scoped 預覽邏輯零改動、只重新分組進 panel（`document` 範圍查詢照舊）。新增 i18n `product-detail.tab.*`／`.health.*`；`tabs.css` 補掛 head；無新元件 CSS/裸值（check 5/10/11 基準未動）；bump `20260716k` · **2026-07-16 商品資料驅動＋數位內容檔補齊（B 反饋，UIA-055／PG-017）**：改由 e-shop `?id=<key>` 開啟、讀新 `js/products-store.js`（9 單售商品 mock，`ztorGetProduct`）以 `applyProduct()` realize 對應組合（主分類×次分類×規格模式×庫存版本×數位內容檔），**移除 devtools `pd-cat/pd-var/pd-edition` 預覽組**（`ZTOR_DEV_PAGE_GROUPS`/`applyFromDev`/`ztor:devstate-changed` 刪除）；§2.7 內容檔補齊：影視/單曲/文檔＝單檔上傳格（`applyContentFile` 切 `data-i18n`）、專輯＝`album-tracks`（partial 加 `data-album-seed` seed 能力）、會員卡＝`vip-card`＋`vip-card.js`、IP＝素材槽 placeholder（PG-017）；資訊欄補數位次分類 select（`pd-sub-digi`，`data-sub` 選值）；head 補 `album-tracks.css`/`vip-card.css`、底部補 `products-store.js`/`album-tracks.js`/`vip-card.js`；e-shop 9 列 Edit 帶 `?id`。逐品內容為代表性樣本（UIA-055）；新增 i18n `product-detail.badge.low2/.soldout`/`pd.cfile.*`；無新元件 CSS/裸值（check 5/10/11 基準未動）；bump `20260716o` · **2026-07-16 多規格選項建立後鎖定（B 反饋，暫行，UIA-056）**：§2.8 選項建構器改鎖定唯讀——選項名 `input readonly`、選項值 `chip--static`（去 `chip__remove`）、移除新增選項值輸入／Add option／移除選項鈕；逐規格表價格/庫存/SKU/成本維持可編輯；新增提示 i18n `product-detail.var.opts-locked`。對齊 spec §2.8「加選項/值＝受限·D137 產品待確認」的保守鎖定，只鎖 product-detail、create-product 不動；重用 `chip--static` 無新元件 CSS/裸值；bump|
| 5.1.5.2 建立商品 | create-product.html | ✓ | Add new item 單頁三型（實體/數位/拍賣）· upload-tile · 描述字數計數（0/30、0/50）· 均價提示 · 拍賣 The story + Prove it's real · §5.2.4 頂部操作欄（無 stepper，主動作隨型）· §5.2.5 即時預覽面板（Preview 鈕開，畫面分割壓窄、非浮層）· Ready to sell? 就緒檢查（依**狀態動態**：多規格→每規格價格庫存、限量→上限≥在庫、物流→重量/尺寸/寄件地、限購→每人上限；pending 不擋）· Show in my shop · **2026-06-15 對齊 spec v2.6（D063/D064）**：§4.1④ 多規格 Variations（`variant-builder`，僅實體，單/多 `.segmented`，多規格取代單一價格庫存）· §4.1⑤/§4.2 庫存版本 Edition（不限量/限量 `.segmented`，限量補上限/剩餘份數）· §4.1⑥ 取貨方式（物流‖QR 領取 `.segmented`，僅實體）· §4.5 每人限購（switch＋每人上限）＋商品標籤（`tag-input`）· 統一條件顯示 `data-cp-show`/`data-when-var`/`-edition`/`-delivery`；互動 demo（UIA-016）· 競標設定待補（D026）· **2026-06-16**：「Start selling」就緒後點擊 → 導回 `e-shop.html?posted=1&name=&price=` 觸發新品貼文 popup（5.1.5.7／D068）· **2026-07-02 §4.1/D105（＋S31.1 建置）**：低庫存提醒開關加副說明（`.control-row__sub`＋`cp.lowstock.hint`）；下方加「自訂低庫存門檻」數值輸入格（`#cp-lowstock-thr`，`data-feat="S31.1"` 版本閘），由 cheat code「版本」控制（Phase 1 隱藏＝固定 10%、Next+ 顯示）。**互動（使用者回饋）**：輸入格只在「庫存快不夠時提醒我」開關開啟時顯示（`#cp-lowstock-toggle`→JS 控 `hidden`）＋預填基準 10%（限量＝總量、不限量＝目前在庫 demo 代理，即時重算；手改即停覆寫、清空回自動）。UIA-042|
| 5.1.5.4 建立套組 | create-bundle.html | ✓ | Create bundle 單頁 · picker 挑商品（≥2 解鎖）· In this bundle 計數 · 定價 Fixed/% off · 限量留空＝不限量 · % off 輸入待補 · **2026-06-15 §6.3/§6.4**：套組庫存＝min(成員) 即時顯示（`data-stock`，unlimited→不限量）· 固定價≤成員合計驗證＋省下金額提示（超過則 `.cb-warn` 擋 Create）· 成員限量/多規格相容性提示（`data-edition`/`data-variants`）· Create gating 加 name＋price≤sum；皆顯示層 demo（UIA-019）· 右側預覽/就緒檢查（§4⑥）spec 標存在與否待確認、未做 |
| 03 §5.1.6 Events | events.html | ◑ Structure | 4 KPI · 8 欄活動清單(縮圖｜活動｜日期時間｜場地｜票券進度｜收入｜狀態｜編輯/複製/刪除) · F3 可運作篩選(時段分頁×狀態切換×搜尋名稱/場地/Lineup, AND·即時·空狀態) · F5 詳情待 R2.1.1(§8.1) |
| 5.1.6.1 建立活動 | create-event.html | ◑ 5-step | Type · Details(名稱/描述/Lineup/4 圖+影片) · Venue & Time · Tickets(≥1) · Review+Quality check · Publish |
| 03 §5.1.7 Fans CRM | fans-crm.html | ◑ Structure | 4 KPI · Who's who 分布 · at-risk alert · Leaderboard/Hall of fame tabs · 3 sample fans |
| 03 §5.1.8 Earnings | earnings.html | ✓ Full | **5 tabs**（D050）· Overview（KPI / line chart / source / recent）/ Transactions（6 欄 ztor-table + filter chips + Manual entry + Export）/ **Breakdown（segmented「本期間 F12 金流瀑布 / 依項目 F11 收益拆解」一次顯示一個；報表式 waterfall——bar 只留里程碑、扣項純文字縮排列）**/ Payouts（4 status KPI + Request payout card + F8 淨利池/退款準備金摘要 + history）/ Tax docs（year chip + doc list + 7 regions）。F12＝`waterfall.css`（總收入→淨利池→Creator/NFT，§7.3，數字同 F3）；F11 重用 `waterfall` 做項目財務階梯（項目總收入→…→項目淨利）＋項目選單＋追溯/匯出入口。提款 popup 含不可逆確認閘門（§4.5）＋摘要結算來源/費率版本（§4.4）；**F10 手動補登 popup**（`partials/manual-entry-modal.js`，重用 payout dialog 外殼，§5.1.8.2）由 Transactions 觸發。**F7 逐筆可追溯**：交易表可展開列（`table.css` expandable-row variant），收入列展開＝Event ID（可複製）＋費率版本（cfg-2026.02）＋該筆金流瀑布（重用 `waterfall`），非收入列展開＝Event ID＋註記。F3 Net income 卡有 `.kpi__link`「View breakdown →」捷徑（`data-tab-jump="breakdown"`）。Earnings 全 F1–F12 已覆蓋 |
| 03 §5.1.9 Settings | settings.html | ✓ Full | Profile / Appearance / Notifications (Email + Push) / Privacy & Security / Payments / Integrations |
| 03 §5.3.1 商品分類 | create-product.html | ◑ | 類型卡三型（實體/數位/拍賣）+ Category 下拉；與 §7.1 主分類 taxonomy 的對應待協調（documents/decisions D026）|
| 03 §5.3.2 狀態語言 | 全站 | ✓ | 統一 pill 元件 + 同 token |
| 03 §5.3.3 財務術語 | earnings.html, index.html, product-detail.html | ✓ | 毛利/淨利/待結算/Available/Payout 全部分開呈現 |
| 03 §5.3.4 語言 | 全站 17 頁 body 完整 i18n | ✓ Full | i18n.js DICT 約 1,080 keys · `.app-topbar__lang` EN · 中 toggle · localStorage 持久化 · 預設 EN · 全站頁面 body 字串皆已覆蓋 |

✓ Full = 滿足 spec 主要功能 · ◑ Structure = 結構齊全但 detail 未深入 · ◑ Step 1 = 多步驟流程只做第一步

---

## 5. 全站規則（Cross-cutting Rules）

### 5.1 導覽模型

- **主導航**：Dashboard · Projects · IP Bank ▾ · E-Shop ▾ · Events · Fans · Earnings（**下拉＝IP Bank（My IP / IP Market）與 E-Shop（電子商店 / 訂單管理；商店設定 2026-06-15 移出下拉、改 F3 popup，D065）**；其餘平鋪，子頁與建立流程頁內進入，spec §3.2.1 / decisions D013 + D014）
- **顯示模式**：主導航可在 Topbar（預設）與 Sidebar 間切換，同一套 nav／IA；導航上有快速切換鈕（`[data-nav-toggle]`）＋ Settings→外觀切換卡（spec §6.9 / D016，見 §5.2a）
- **Settings 不在主 nav**（spec §3.2.2.5）— 入口在 Avatar dropdown / sidebar 帳戶群組內
- **Active state**：`[aria-current="page"]` + `--muted` 背景（不用 orange underline）
- **Dropdown**：`.app-topbar__dropdown--mega` 360 px · icon box + title + sub 兩行 · **IP Bank + E-Shop 使用**（sidebar 模式改為 `.app-sidebar__group` 可展開群組）

### 5.2 主題（Theme）

- Light / Dark / System 三選一，無儲存偏好時預設 dark
- `<html data-theme>` 屬性 driven，`theme.js` 管理 + localStorage 持久化；URL `?theme=` 優先且不寫入偏好
- Topbar 月亮 / 太陽 icon 透過 attribute selector 切換（light 顯示 moon，dark 顯示 sun — 顯示「下一個會切到」）
- `section-test.html` 提供 `data-theme-set` 測試控制；`.form-section--outlined` 是建立流程正式採用的區塊變體，使用 `--surface-page` sheet 底與 `--sp-24` 可見區塊間距（create-product／-auction／-bundle／-event／-project／register-ip／admin-ip-bank-entry）

### 5.2a 顯示模式（Display mode · spec §6.9 / D016）

- 導航有兩種顯示模式：**Topbar**（橫向頂列，預設）與 **Sidebar**（248px 左側直向 rail）。同一套 NAV、同一份 IA，只改擺放位置。
- 配色（2026-07-14）：Topbar 模式維持純白 `--background #FFFFFF`。Sidebar 模式使用 `--surface-shell #F0F0EE` 作較深一階的淡灰 App Shell，rail 直接融入 shell；item hover/active 仍用 `--accent #F3F3F3`。右側 `.main` 使用 `--surface-page #FAFAFA` 成為單一不透明內容頁。
- `<html data-nav-mode="topbar|sidebar">` 屬性 driven，`theme.js` 在 `<head>` 早期套用（避免版面閃爍）+ localStorage key `ztor.nav.mode` 持久化，API `window.ztorNavMode`。
- `sidebar.js` 依 `data-nav-mode` 渲染對應 markup（`.app-topbar__*` 或 `.app-sidebar__*`），並監聽 `ztor:navmode-changed` 即時重繪。版面切換規則在 `shared.css` 的 `[data-nav-mode="sidebar"]` 區塊。
- Sidebar 模式：頂層平鋪、IP Bank / E-Shop 為可展開群組（`.app-sidebar__group`，active 子頁時自動展開；現役）；全域操作（搜尋 / 通知 / 語言 / 主題 / 帳戶）收在 rail 底部。另有「分組標題＋子項平鋪」變體（`.app-sidebar__section-label`，2026-06-13 做過、使用者選擇改回 accordion）保留在 CSS／design-system，可隨時切回。
- Sidebar App Shell：`.main` 包含 route 的 header / hero / page body / footer，整體是一張連續頁面；上方留 `--space-shell-gutter 16px` 灰色間距，右側與底部貼齊 viewport，只保留左上 `--radius-shell 28px` 圓角。頁面區段不可再建立第二層 outer page card。
- **快速切換鈕**：導航 actions 區常駐一顆 `[data-nav-toggle]` 按鈕（比照主題鈕），由 theme.js 委派呼叫 `ztorNavMode.toggle()`；圖示隨模式互換——topbar 顯示 `panel-left`（暗示切到 sidebar）、sidebar 顯示 `panel-top`（暗示切到 topbar），可見性規則同主題鈕（在 shared.css）。
- Settings → Appearance 另提供 Topbar / Sidebar 兩張 selection-card 作完整入口。

### 5.2b 通知與待辦中心（Notification & To-do Center · spec §5.2.1 / D019）

- 入口常駐在全域導航 actions；使用 flag icon 與 orange unread dot，文案為 Notifications & to-dos / 通知與待辦。
- Topbar 模式：從右側通知 icon 下方展開 `.app-notif__panel` 下拉，靠右對齊。
- Sidebar 模式：同一份內容從 rail 底部通知項右側打開 flyout；小螢幕 sidebar 收成頂列時改為下拉。
- 面板分兩區：Needs action / 需要你處理 在上，Status updates / 狀態更新 在下。每則包含來源 icon、標題、摘要、時間與來源模組 pill；點擊導向來源頁處理。
- 官方公告不另設獨立入口；`notif.announce` 以 Official / 官方公告來源顯示在狀態更新區。
- `Mark all read` 會清除目前面板的未讀底色與入口 unread dot。此為 R 2.1 demo interaction；待辦解除仍由來源模組完成動作後處理。

### 5.3 語言（i18n）

- **預設 EN**，可切繁中（zh-Hant）。透過 topbar `.app-topbar__lang` 的 `EN · 中` toggle 切換
- 字典在 `i18n.js` 的 `DICT` 物件，約 1,080 keys（含顯示模式、orders、order-detail、payout modal）。三種 binding：`data-i18n`（textContent / innerHTML）、`data-i18n-placeholder`、`data-i18n-aria-label`
- localStorage key `ztor-r21-lang` 持久化，`<html lang>` 同步寫
- **覆蓋範圍**：全站 17 頁 body 完整覆蓋（topbar 通用 + Dashboard + Earnings + orders / order-detail + 其餘內容頁）。`applyI18n()` 以 `document.querySelectorAll('[data-i18n*]')` 全域套用，runtime 注入的區塊（sidebar / components.js）注入後再各自呼叫一次
- 切換後 `applyI18n()` 重新跑 query selectors，不需 reload
- **CJK fallback** 字型：自架 `Noto Sans TC`（subset woff2；R 2.1.39 起取代、R 2.1.40 起自架；Taipei Sans TC Beta 已移除）

### 5.4 響應式（Responsive）

- 主 breakpoint `@media (max-width: 900px)`：`.app-topbar` flex-wrap + 主 nav 隱藏（之後加 hamburger）、頁面 padding 縮到 16 px、hero 縮成單欄
- Sidebar 顯示模式在 < 900px 收成頂部橫列（`.app` 改回 column、rail 變 100% 寬橫向），並移除桌面 shell 灰底、上方 gap 與頁面圓角，讓內容保持滿版（基本響應 spec §6.8；完整抽屜/漢堡留 R 2.1.x）

### 5.5 元件關係與文件完整性

- `design-system.html` Pillar 4 必須同步 component inventory、layer、source owner、compose chips。
- `component-library.md` 是 CSS / component ownership 的快速索引；`design-system.md` 是正式文字規格。
- 仍在 `shared.css` 的高復用元件必須標為 project-owned component，不可因尚未拆檔而從 design system 消失。
- `design-system.html` 內建 integrity check，用於檢查 anchor、compose chip、duplicate id 與 CSS link 清單。
- 無障礙合規不是 R 2.1 預設交付範圍；若未來需要，另開 opt-in audit，不回寫成全站視覺規範。
- **2026-07-09**：破壞性 ghost 按鈕（`.btn--ghost.btn--destructive`）與表單 footnote（`.form-footnote`）兩組跨頁重複頁內樣式一併 promote 進 ds-components，零視覺變動；細節見 UI-CHANGES.md 同日條目。
- **2026-08-11（使用者裁決）：無自帶 CSS 的 JS 元件也要進 `design-system.html`**。這類元件建在既有元件的 class 之上、不擁有樣式，過去只登記在 `design-system.md`；但使用者檢視元件的唯一入口是 DS 頁，只寫進 `.md` 等於他看不到。全站七支（`partials/work-fields.js`、`js/work-taxonomy.js`、`partials/film-picker.js`、`partials/manual-entry-modal.js`、`partials/source-upload-modal.js`、`partials/fee-exception-modal.js`、`js/components.js`）各有 TOC 項、元件總表列與 demo 卡（§4.123–4.129）。**demo 一律載入那支 JS 當場產生**，不照模板手抄；純資料模組改用「值域一覽」並寫明為什麼沒有互動 demo；彈窗類的覆蓋層以 DS 頁的頁面級樣式（`.demo--inline-modal`）壓回文件流，元件本身不動。慣例與四條做法寫在 `design-system.md` §4.1 前言。`check_ds_sync.py` 以 `ds-components/*.css` 為起點，抓不到這一類，只能靠人維護。

### 5.6 作品欄位的跨頁共用（2026-08-10，直接發佈與作品上架整併）

規格 5.1.2.2.1 的 F1–F15 從此有兩個宿主：`publish-work.html`（共創／預購成立後的事後上架）與
`create-project.html`（直接發佈 × 影片家族的建立流程）。欄位規格只有一份權威，實作也只能有一份。

**做法**：新增純 JS 元件 `partials/work-fields.js`（`window.ZtorWorkFields`），由它渲染完整的
`.form-section` 區塊；兩個宿主頁只放空容器並在容器上宣告順序（`data-wf="file,audio,subs"`），
另外各自決定「哪個區塊落在第幾步」與「送出做什麼」。

**為什麼不是別的做法**：

- **不複製 markup**：純靜態站台沒有片段引用機制，複製一份等於讓同一份欄位規格長出兩個會分岔的實作——
  這正是 Close-out Verification 第 1 條（single source of truth）要防的事。
- **不用 `fetch()` 載 HTML partial**：這些區塊每一個都會自己工作（字幕可增可刪、劇照填滿長出下一格、
  語言組不准重複、幣種切換要改所有金額符號、就緒檢查要即時重算）。依 Frontend Architecture Strategy 的
  判斷口訣，「只是切出畫面」才用 partial，「自己會工作」用 component。partial 還會多一次網路往返，
  且原型偶爾用 `file://` 直開時 `fetch()` 會被擋。
- **不自帶 CSS**：所有外觀都由既有元件承接，模組只組裝 markup。新增樣式一律回那些元件改。

**連帶的共用**：送審內容（`collect()`）與就緒檢查項（`checks()`）也住在模組裡——兩頁若各算一份，
「算不算填好」就會有兩個答案。步驟切法是宿主頁的事，所以 `checks()` 收一張 `stepOf` 對照表。

**2026-08-10 第二輪：值域再往上抽一層**（D182 第 7／8 題）。主規格 §7.11 把年齡分級收成六級一套、
§7.1.2 把題材軸收成 21 值一套，兩者各有三個落點——年齡在作品上架 F13、建立項目影視組 F4、項目公開資訊
§2.2.8；題材在作品上架 F11 與建立項目影視組 F4。三處指同一份資料，清單自然也只能有一份。

**做法**：新增純資料元件 `js/work-taxonomy.js`（`window.ZtorWorkTaxonomy`），提供 `GENRES`／`AGES`
兩份清單與 `ageOptionsHtml()`／`genreChipsHtml()` 兩個產生器，並在載入時就地填好頁面上任何
`[data-taxonomy-age]` 的 `<select>` 與 `[data-taxonomy-genres]` 的容器（chip 開關走 document 委派）。
`partials/work-fields.js` 改成引用這一份、不再自帶副本。

**為什麼獨立成檔而不是掛在 `work-fields.js` 上**：後者是整組影片上架欄位的渲染器（八百多行），
而 `project-detail.html` 只需要那六個年齡值——為了一個陣列載進整支渲染器並不划算。這支沒有 CSS、
沒有版面，只有值域與兩個字串產生器。

**載入順序有兩個約束**：要排在 `partials/work-fields.js` 之前（後者取它的 `AGES` 與
`genreChipsHtml()`），也要排在 `js/zselect.js` 之前（選項要先在，`<select>` 才升級得對）。
模組本身立刻跑一次 hydrate、再補一次 `DOMContentLoaded`，對已有內容的節點會跳過。

**2026-08-11 第三輪：第三個使用場合＝編輯已上架作品**（規格 5.1.2.2 §2.2.11、D182 第 11 題）。
編輯不另建一套欄位，改為在同一頁開編輯態：`publish-work.html?project=<id>&mode=edit`。模組新增
`fill(work, opts)` 把既有內容寫回欄位——**每個區塊自己知道怎麼還原**（還原函式掛在該區塊的
`<section>` 上），`fill()` 只負責找出畫面上有哪些區塊並逐一呼叫，模組因此不必知道宿主頁放了哪幾塊、
排成幾步。比對基準取自畫面（填完之後跑一次 `collect()`）而不是 store 原始資料：兩邊要比的是同一種形狀，
否則「原本就存不進原型的東西」會被誤判成使用者改過。

**送審分界寫在宿主頁、不寫進模組**：哪些欄位要重新送審是產品規則（規格 §2.2.11），模組只提供
`collect()` 的結果；`publish-work.html` 比對前後差異後決定走 `ztorWorkReview.submit()`（重新送審）
或 `saveWork()`（只換內容）。規格未定歸屬的八個欄位在頁面上明說「還沒定案」，不靜默歸到任一邊。

### 5.6.1 項目詳情的「作品」分頁（2026-08-11）

規格 §2.2.11 給了已上架作品一個常駐落點。呈現上做成項目詳情的一個分頁（`data-tab="work"`），
理由是規格 §2 的資訊分群把「作品」與總覽／內容／公開資訊／承諾／金流並列，而 §3 明說分頁分組屬呈現決策。

- **出現條件寫成「有沒有這件作品」而不是「是什麼類型」**：影片家族 ＋ `js/work-review-store.js` 裡
  有這個項目的紀錄。直接發佈在建立當下就送審、共創與預購要等第一次送審——兩種時序自然落在同一條判斷上，
  不必在頁面裡再寫一次類型表。
- **狀態不重畫一套**：徽章文字與色調一律向 store 要（`label()`／`tone()`），與 §2.2.9 那一塊、Admin
  審核頁共用同一份字彙；兩塊讀同一筆紀錄，規格明講不得各記一套。
- **§2.2.9 那一塊對直接發佈項目隱藏**：它整段在講「那則完成作品貼文與作品一起等審核」，而直接發佈
  沒有這則貼文（D182 第 9 題）。狀態改由本分頁承載，資料仍是同一筆。
- **元件**：整塊用 `review-status --flat`（外框由 `.card` 提供，元件再畫一層會變成盒中盒），
  新增選配的 `__thumb`（40px 寬、2:3）讓創作者先認出是哪一件作品再讀狀態。

### 5.6.2 項目詳情的分頁分群與進度時間軸（2026-08-17，D193）

規格 §3 給了七個分群、§2.1.1 給了逐格的重點面板、§2.2.10 把里程碑與更新合成一條藍圖。
呈現上的落點：

- **一個分頁＝一件工作，不是一個規格章節**。分頁 id 與 §3 分群表一對一：`overview`／`progress`／
  `backers`／`setup`／`earnings`／`performance`／`royalty`。「這個類型有沒有這個區段」仍照 §2.0
  類型表寫進 `data-type`，頁面不自行判斷。支持者那一格的標籤隨發行模式換字（`[data-backers-tab]`）。
- **總覽逐格換內容由一支 `stage()` 產生**：它回傳同一個形狀（標題／追蹤條／送審件面板／營運摘要／
  事實列／說明／下一步／捷徑），套用的程式只有一份。逐格各寫一套渲染是分岔的開始——同一個「已上線」
  在共創與直接發佈底下只差捷徑一項，各寫一份遲早會長成兩種畫面。
- **追蹤條共用一條軌道**：直接發佈影片的上架五段與共創／預購的三段等待，講的都是「同一個準備中底下
  現在卡在哪一段」，所以用同一個 `progress-stepper --segmented`，只換段數與段名。
- **完成作品那一顆不存自己的狀態**：`completionNode()` 直接讀 `js/work-review-store.js`。這是規格
  §2.2.10 的硬要求，也是總覽的上架追蹤、進度的節點、作品編輯入口三者永遠一致的唯一做法。
  里程碑與更新另有 `js/project-progress-store.js`（純記憶體、重整還原，同 `projects-store` 的做法）。
- **設定整格套檢視／編輯兩段式（D155），方案編輯器例外**：`[data-edit-exempt]` 底下的欄位不受
  `applyReadonly()` 管轄。每張方案卡自己就有展開／收合的編輯態，被整格鎖成唯讀會讓卡片點得開卻改不動。
- **草稿導回建立流程照活動頁既有慣例**：清單指向 `create-project.html?draft=<id>`、詳情頁偵測到草稿
  就 `location.replace`、建立流程讀 `?draft=` 預填並顯示續填橫幅。**導回判定必須排在
  「直接發佈影片＋有送審件 ⇒ 準備中」那段狀態覆寫之後**，否則剛送完審的創作者會被踢回建立流程。

### 5.6.3 進度時間軸的日期化與頁首補位（2026-08-17 下午，D194）

同日下午 D194 把 §2.2.10 由「可手動排序的里程碑清單」改寫成 v3.0 的「由真實日期驅動的單軸時間流」。
呈現上的落點：

- **軸的組裝順序寫死在一支 `renderTimeline()` 裡**：完成作品（釘頂、不帶日期）→ 沒有預計日期的里程碑 →
  未來的里程碑（由遠而近）→ 今天 → 逾期（由近而遠）→ 過去（已完成里程碑落在完成日、其餘更新按天收合）
  → 項目建立。**排序只有一個依據就是日期**；`move()` 與兩顆上下移鈕同輪撤除。
- **日期是真實 `Date`，「今天」是釘死的常數**：`js/project-progress-store.js` 檔頭的 `TODAY_ISO`
  （使用者裁決，理由與改法見 ASSUMPTIONS PTL-001）。種子日期一律寫成「相對今天幾天」，所以逾期、
  倒數、里程碑當日這些狀態在畫面上永遠看得到，不會隨時間漂走。里程碑彈窗的預計日期改成
  `<input type="date">`（規格明寫「以日期選擇取得，不接受自由文字」），Date ↔ `YYYY-MM-DD` 的轉換
  各只有一份（`isoDay()` / `dayFromIso()`）。
- **今天那一格是唯一會換說法的位置**：`todayNode()` 的判定順序與 §2.2.10 狀態變體表同序（已取消 →
  建立當天 → 當天完成 → 今天是里程碑日 → 逾期 → 倒數 → 沒有里程碑 → 沒有日期 → 全部完成）。
  「全部完成」那一格的下一步**直接讀完成作品節點的 phase**，不另推導一次——`completionState()`
  與 `completionNode()` 因此拆開，狀態算一次、兩處共用。
- **發文框是活的 DOM，不進渲染字串**：`#pd-composer` 住在 `.ptl` 外面，每次重繪先摘下、重繪後掛回
  今天那一格的插槽。留在 innerHTML 裡的話，使用者打到一半的字與 zselect 的接線會被每一次重繪洗掉。
  送出走 `submitUpdate()`，與區段層級的彈窗同一條路徑（ASSUMPTIONS UIA-118）。
- **收合狀態存在頁面的 JS（`ptlFold`）不存在 DOM**：每次重繪都會重建 innerHTML，記在節點上的話會出現
  「展開某一天 → 發一則更新 → 那一天又收回去」。
- **頁首補位**：D193 把營運摘要與下一步搬進總覽之後，頁首右欄空掉一大半。封面欄由 300px 收到 220px，
  右欄補一列 `.data-list` 識別事實（創作者／內容類型／建立日期）。取用的三個值逐項目必有，所以三種
  發行模式 × 每一個狀態都不會空掉；隨狀態變動的數字一律留在總覽（ASSUMPTIONS HERO-001）。

### 5.6.4 項目詳情總覽的整格重排（2026-08-18）

規格 §2.1.1 給了三段骨架（重點面板／下一步／捷徑）與逐格的內容表，但明寫「實際擺法、要不要並排、
用什麼控制項，由 project-ui-creator 決定、非約束」。D193 落地時的擺法是「左 span-7 大卡＋右 span-5
兩張小卡」，六件不同性質的東西疊在左卡裡、支持者數同時出現在募資面板與右欄摘要。本輪整格重排。

- **由上而下六塊，一塊只講一件事**：① 重點面板（一列 `.kpi`）② 作品（`progress-stepper--segmented`
  追蹤條 ＋ `review-status--flat` 送審件面板）③ 狀態卡（終止說明／上線排程，`.data-list` 事實列）
  ④ 下一步（新元件 `.next-step`）⑤ 進度摘要（span-8）⑥ 支持者摘要（span-4）；直接發佈另有通知粉絲出口。
- **①②③ 互斥**：§2.1.1 的「重點面板」是單數，同一格只會有一個答案。有數字可盯的狀態走 KPI 列、
  準備中走追蹤卡（數字還不存在，該盯的是卡在哪一段）、已取消與非影片家族的排程走狀態卡。
- **`stage()` 的回傳形狀改版**：`{ kpis, kpiNote, work, panel, next, progress, backers }`。原本的
  `title / track / work / fund / facts / note / next / jumps` 退場——`fund` 那一項對應的募資面板已由
  KPI 列取代，`jumps` 從 D193 那一輪起就沒有任何地方畫它（死程式，本輪一併移除）。
- **KPI 欄位集中在一支 `kpi(key)`**，逐格只寫欄位鍵的陣列。加一格新狀態＝加一列陣列，不是再寫一套渲染。
- **同一個數字只有一個來源，機械保證**：`renderStage()` 把 `kpis` 用掉的鍵記進 `used`，進度摘要的
  完成度徽章與支持者摘要的候選列逐項比對後跳過。頁首那三列識別事實（HERO-001）因此也不進 KPI。
- **下一步長在它要操作的那一塊底下**（`next.owner` = `work` / `panel` / `progress` / `null`），
  那一塊沒出現才自成一卡。理由是同一顆按鈕不能在一頁上畫兩次——進度摘要自帶「發布更新」。
- **就地發布更新沿用既有路徑**：進度摘要那顆鈕是 `[data-modal-open="pd-edit-update"]`，與頁首那顆、
  進度分頁那顆共用同一個彈窗與同一支 `submitUpdate()`（UIA-118 的同一條規則）。
- **表現（§2.3.5）、版稅（§2.3.4）與進度分頁的時間軸本輪一字未動。**

### 5.7 版本變體頁的回程改接修正（2026-08-10）

cheat code 的 `route:` 規則在目標頁住在子目錄時（`funding-test/create-campaign.html`、
`golive-4step/create-project-4step.html`），回程從來沒有成立過：`js/devtools.js` 的 `guardRoutePage()`
用「當前檔名」比對帶路徑的目標，永遠對不上，切回其他版本仍停在變體頁。改成用目標的**檔名**比對，
並依目標路徑深度補 `../`（`location.replace` 是相對當前網址解析的）。同輪把
`feature-scope-map.md` 的 fetch 改用本檔 `<script src>` 推導的站台根目錄，變體頁不再留一筆 404。

---

## 5a. 已知缺口（R 2.1.x 候選）

- create-event 只實作 step 1（3-step 完整 flow 待建）；create-product 已改單頁三型完整表單（2026-06-12），2026-06-15 補多規格/庫存版本/取貨方式/每人限購/標籤（spec v2.6，D063/D064）
- 建立商品：競標設定（起標價/增額/結標）與 Condition 選項待 spec 5.1.5.2 補（D026）；多規格選項數上限、單件成本是否納毛利、限量 vs 建議的硬性必填劃分、QR 核銷機制、Shipping Categories 來源、每人限購 enforcement/退款回補、數位限量售罄後下載權＝spec 標待確認（D064 §8.12），本輪僅顯示層 demo
- E-Shop Auctions 建立流程 builder 待補（D026）（Bundles builder = create-bundle.html 已建 2026-06-12；Bundles 清單分頁已建 2026-06-14）
- 建立套組：% off 折扣輸入欄位與口徑、成員票券（Events）跨模組引用、成員移除控制待補（spec 5.1.5.4）
- Projects 詳情頁 5.1.2.2（project-detail.html：概覽＋分區編輯、collaborator splits、IP rental linker）— 清單頁列表/卡片雙檢視已於 2026-06-08 完成
- IP Market 全 grid + saved searches + 排序
- Fans CRM 粉絲詳情 drawer / route
- **Earnings 單一項目收益拆解（spec 5.1.8 F11 / §5.2.2 Project Net Income）**— 未實作；頁面位置與入口未定（2026-06-11 列管，原為沉默缺口）
- Playwright 截圖 + 兩主題 visual diff
- Vercel 部署 wiring
- Mobile hamburger menu（< 900 px 時 topbar 主 nav 隱藏，sidebar 模式則收成頂部橫列；完整抽屜/漢堡入口尚未做）
- ~~顯示模式 Sidebar（Topbar↔Sidebar 切換）~~ **已於 2026-06-09 實作**（spec §6.9 / D016 / D017）：theme.js 管 `data-nav-mode` + sidebar.js 雙模式渲染 + Settings→外觀切換卡，見 §5.2a
- ~~通知與待辦中心~~ **已於 2026-06-09 實作**（spec §5.2.1 / D019）：topbar 下拉、sidebar flyout、官方公告併入、雙語字典與 mark-all-read demo interaction，見 §5.2b

---

## 6. 技術骨架（同 R 2.0）

### 6.1 載入順序

```html
<head>
  <script src="theme.js"></script>                     <!-- 最早，避免 FOUC -->
  <link rel="stylesheet" href="ds-components/_tokens.css">
  <link rel="stylesheet" href="ds-components/fonts.css">
  <link rel="stylesheet" href="ds-components/button.css">
  <link rel="stylesheet" href="ds-components/badge.css">
  <link rel="stylesheet" href="ds-components/card.css">
  <link rel="stylesheet" href="ds-components/input.css">
  <link rel="stylesheet" href="ds-components/table.css">  <!-- earnings.html 用 -->
  <link rel="stylesheet" href="shared.css">            <!-- project-level，必須在 ds 之後 -->
</head>
<body>
  ...
  <script src="icons.js"></script>      <!-- 1. Tabler registry，先載入才能讓 applyIcons() 被使用 -->
  <script src="i18n.js"></script>       <!-- 2. DICT + 還原 localStorage 語言 + 標 <html lang> + 接 click toggle -->
  <script src="sidebar.js"></script>    <!-- 3. 注入 topbar HTML，inject 完呼叫 ztorIcons.applyIcons(root) + applyI18n(root) -->
  <script src="components.js"></script> <!-- 4. runtime 注入 Dashboard F2–F8 + 共用 transaction-list；index.html 與 earnings.html 載入 -->
  <script src="reveal.js"></script>     <!-- 5. .is-in 進場 / scroll reveal（IntersectionObserver，尊重 prefers-reduced-motion）；全頁面載入 -->
  <script src="hero.js"></script>       <!-- 只在 index.html 載入，carousel 控制 -->
</body>
```

> 頁面專屬 script（不在通用序列）：`chart.js`（僅 earnings，畫線圖，在 components.js 之前載入）、`partials/payout-request-modal.js`（僅 earnings，payout modal 模板）。
> CSS 區塊為示意：`_tokens.css` / `fonts.css` / `shared.css` 為全頁通用，其餘 component CSS 由各頁按需求挑選載入（不是每頁都載全部）。

### 6.2 Dark mode

`<html data-theme="light|dark">` 由 `theme.js` 寫入。儲存於 `localStorage["ztor.theme.preference"]`。`prefers-color-scheme` 變動會自動重套（當偏好為 system）。URL `?theme=dark` 一次性 override。

### 6.3 字型

自架 woff2 在 `fonts/`：Geist-Variable / Geist-Mono / Inter。CJK fallback 為自架 subset 的 `Noto Sans TC`（fonts.css 以 @font-face 自架並加進 `--font-display / --font-ui / --font-body` token 鏈；Taipei Sans TC Beta 已於 R 2.1.39 移除）。

---

## 7. Phase 進度

| Phase | 狀態 | 內容 |
|---|---|---|
| **1 · Bootstrap** | ✅ 2026-05-25 | 建目錄 · 拷貝 ztor yellow 元件 / design-system.html / fonts · 接 R 2.0 theme.js & icons.js |
| **2 · shared.css** | ✅ 2026-05-25 | 寫 ~700 行 project-level patterns（sidebar / topbar / bento / wizard / IP hero / info banner） |
| **3 · 6 完整頁** | ✅ 2026-05-25 | index / create-project / ip-detail / settings + 自動跑通 sidebar 與 stepper 互動 |
| **4 · 8 stub 頁** | ✅ 2026-05-25 | projects / my-ip / ip-market / e-shop / product-detail / create-product / events / create-event / fans-crm / earnings |
| **5 · 文件 + 驗證** | ✅ 2026-05-25 | BUILD-SPEC.md · ASSUMPTIONS.md · UI-CHANGES.md · 本機 smoke test |
| **6 · R 2.1.1 待辦** | ⏳ | 全 wizard step 2-4 · detail views · i18n · 兩主題 playwright 截圖 · Vercel 部署 |
