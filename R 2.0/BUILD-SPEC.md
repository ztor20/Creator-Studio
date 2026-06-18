# Ztor Creator Studio · R 2.0 BUILD-SPEC

> **歷史 UI／前端實作快照。** 本文件只描述 R 2.0 當時的呈現與工程做法，不是產品需求來源。
>
> 產品規則以 `../../requirement/`、`../../documents/decisions.md` 與 `../../documents/` 為準。若本文件與上游不同，記入 [ASSUMPTIONS.md](ASSUMPTIONS.md) 並更新實作；禁止把 R 2.0 畫面反向同步成產品決策。

| 欄位 | 內容 |
|---|---|
| **版本** | v2.0.0-beta · all 5 phases complete · prototype shippable |
| **最後更新** | 2026-05-25 |
| **負責人** | Yves |
| **參考來源** | `requirement/02-PRD-產品需求規格書.md`、`documents/0-設計規格書.md` 與 5.1.x 子規格 |
| **設計系統** | [R 2.0 design system snapshot](design-system.md) — 原始 `ztor` 來源已不存在 |
| **相關文件** | [design-system.html](design-system.html)（元件預覽）、[UI-CHANGES.md](UI-CHANGES.md)（變更紀錄）|
| **R 1.0 對照** | [`../R 1.0/`](../R%201.0/) — 歷史呈現版本，只作視覺與工程對照 |

> 本檔保留 R 2.0 當時的 app 樣貌與呈現選擇。功能名稱、文案與流程若沒有上游引用，只能視為歷史實作。

---

## 0. 與 R 1.0 的關鍵差異

| 面向 | R 1.0 | R 2.0 |
|---|---|---|
| **Design system** | ztor-minimalist-v2（內部初版） | [R 2.0 design system snapshot](design-system.md)（原始 `ztor` 來源已不存在） |
| **Light/Dark** | 僅 Light | **Light + Dark 兩套**（`[data-theme]` 屬性） |
| **主要字型** | Space Grotesk + Inter | **Geist Variable + Geist + Inter**（CJK 仍 Taipei Sans TC Beta） |
| **Radii** | 偏大 | **Subtle 6-7px**（按鈕 6 / 卡片 7 / panel 8 / cookie 16） |
| **Shadow** | Hairline border 主導 | **rim + drop 多層 shadow**（無實體 border 也能分層） |
| **元件命名** | BEM `.ztor-btn` `.app-topbar` | 維持 BEM；project-level 加 `.app-*` prefix |
| **Theme 切換** | 無 | Settings Appearance 三選一 + topbar sun/moon 快捷按鈕 |
| **Spec 對齊** | 03 系列首版 | 03 系列 + 5.1.x 子規格（更完整覆蓋） |

---

## 1. 產品定位

給獨立創作者用的內容變現中後台 — 把 IP、專案、活動、商品、粉絲、收入收在同一個工作台。後台優先；粉絲端（Fan Shop）為下游消費端，本 app 是「後台 / Studio」這一面。

（當時參考 R 1.0；現行產品定位以上游 `requirement/` 與 `documents/` 為準。）

## 2. 目標使用者 · JTBD

（當時參考 R 1.0；現行使用者與任務以上游文件為準。）

---

## 3. 全站結構（Sitemap）

```
/index.html              · 總覽 / Dashboard         · 主導航 #1
/projects.html           · 專案 / Projects          · 主導航 #2
/create-project.html     · 建立專案 4-step wizard  · 從 projects 進入
/my-ip.html              · 我的 IP                  · 主導航 #3 (IP Bank dropdown)
/ip-market.html          · IP 市場                  · 主導航 #3 (IP Bank dropdown)
/ip-detail.html          · IP 詳情頁                · 從 ip-market / my-ip 進入
/e-shop.html             · 電子商店                 · 主導航 #4 (E-Shop dropdown)
/product-detail.html     · 商品細節頁               · 從 e-shop 進入
/create-product.html     · 建立商品 4-step wizard  · 從 e-shop 進入
/events.html             · 活動                     · 主導航 #5
/create-event.html       · 建立活動                 · 從 events 進入
/fans-crm.html           · 粉絲 / Fans              · 主導航 #6 (dropdown: Fans List / Loyalty / Announcements / Campaigns)
/earnings.html           · 收入管理 / Earnings      · 主導航 #7
/settings.html           · 設定                     · 帳戶選單入口（含 Appearance Light/Dark 三選一）
/design-system.html      · 元件預覽（內部用）       · 不在主導航
/sample.html             · ztor sample page  · 不在主導航
```

7 個頂層導航群組，3 個 dropdown 群（IP Bank ▾ / E-Shop ▾ / Fans ▾），4 個獨立 link（Dashboard / Projects / Events / Earnings）。

---

## 4. 技術骨架

### 4.1 檔案結構

```
site/R 2.0/
├── BUILD-SPEC.md            · 本檔
├── ASSUMPTIONS.md           · 假設與產品缺口
├── UI-CHANGES.md            · 變更紀錄
├── design-system.md         · ztor design system 完整文件
├── design-system.html       · 互動式元件預覽（內部用）
├── sample.html              · 範例頁（marketing surface）
│
├── theme.js                 · Dark mode 控制器（必須在 ds tokens 之前載入）
├── icons.js                 · Lucide 本地 SVG registry
├── topbar.js                · Topbar 互動（dropdown / search / lang toggle）
├── i18n.js                  · 繁中/English 翻譯字典
│
├── dashboard.css            · Project-level styles（topbar / app shell / patterns）
│
├── ds-components/           · ztor 設計系統元件
│   ├── _tokens.css          · CSS variables（Light + Dark）
│   ├── fonts.css            · @font-face + font-family stacks
│   ├── button.css badge.css card.css input.css ...（11 個基礎元件）
│   └── ... (Phase 2 會補出 ~30 個缺的)
│
├── fonts/                   · 自架字型
│   ├── Geist-Variable.woff2
│   ├── Geist-Mono.woff2
│   ├── Inter.woff2
│   ├── TaipeiSansTCBeta-Light.ttf
│   ├── TaipeiSansTCBeta-Regular.ttf
│   └── TaipeiSansTCBeta-Bold.ttf
│
├── screenshots/             · Playwright 驗證快照
│
└── index.html · projects.html · ... · settings.html  (14 個產品頁，Phase 4 才建)
```

### 4.2 載入順序（HTML head）

```html
<script src="theme.js"></script>                       <!-- 必須最早，避免 FOUC -->
<link rel="stylesheet" href="ds-components/_tokens.css?v=1">
<link rel="stylesheet" href="ds-components/fonts.css?v=1">
<link rel="stylesheet" href="ds-components/{component}.css?v=1">  <!-- 各別元件 -->
<link rel="stylesheet" href="dashboard.css?v=1">       <!-- project-level，必須在 ds 之後 -->

<script src="icons.js?v=1" defer></script>
<script src="topbar.js" defer></script>
<script src="i18n.js?v=1" defer></script>
```

### 4.3 Dark mode 機制

- `<html data-theme="light|dark">` 由 `theme.js` 寫入
- `<html data-theme-preference="light|dark|system">` 記錄使用者的 raw 偏好（system 會在套用時解析成 light/dark）
- 偏好持久化於 `localStorage["ztor.theme.preference"]`
- `prefers-color-scheme` media query 變動時，若使用者偏好為 system 會自動重套
- 切換入口：
  - **Topbar sun/moon icon 按鈕**（`[data-theme-toggle]`，循環 light → dark → system）
  - **Settings Appearance section**（三選一 radio cards，`[data-theme-set="light|dark|system"]`，Phase 4 建）
- URL `?theme=dark` 可一次性 override（debug 用，不寫入 localStorage）

---

## 5. Phase 進度

| Phase | 狀態 | 內容 |
|---|---|---|
| **1 · Bootstrap** | ✅ 完成 (2026-05-25) | R 2.0 結構、ztor 拷貝、fonts、theme.js、icons.js / i18n.js / topbar.js、骨架 dashboard.css、index.html hello-world、design-system viewer 可開 |
| **2 · 補齊基礎元件** | ✅ 完成 (2026-05-25) | Audit 後發現 R 1.0 實際只用 11 個 ds-components，缺口僅 7 個（不是原本估的 30）。已補：alert / avatar / checkbox / radio (+ radio-card) / eyebrow / separator / switch。全部 Light + Dark via tokens，`color-mix(in oklab, …)` 處理 tinted bg。集中預覽 [component-preview.html](component-preview.html) — bottom-right floating Light/Dark/System 控制 + radio-card 直接同步主題。**所謂的「30 個缺元件」其實多是 project-level patterns（dialog / dropdown / tabs / tooltip 等），歸 Phase 3 處理。** |
| **3 · Project-level patterns** | ✅ 完成 (2026-05-25) | 從 R 1.0 dashboard.css L630 之後（跳過 topbar + page-main）抽出 ~3880 行 patterns，sed 重寫 token 對齊 ztor，append 進 R 2.0 dashboard.css（295 → 4154 行）。涵蓋：page-intro / stat-grid / data-list / activity-row / alert-row / entity-card / cards-row / tabs / filter-row / view-toggle / breadcrumb / stepper / wizard-topbar / tx-table / payout-grid / payout-flow-card / project-breakdown-card / trend-chart / stacked-bar / source-list / tier-pill / fans-table / settings-layout / settings-section / toggle-list / integration-row 等。[patterns-preview.html](patterns-preview.html) Playwright 驗證 Light + Dark 都能正確 flip — 所有 patterns 全 token 引用，不需任何 dark-mode override。**注意**：Phase 3 動工時同步把 design system 從 `ztor-yellow` rename 為 `ztor`。 |
| **4 · 14 頁實作** | ✅ 完成 (2026-05-25) | 用 `_port_pages.py` 腳本批次處理：regex 換掉 `<head>` + 注入 topbar theme toggle 按鈕。14 頁全部成功移植：index / projects / create-project / my-ip / ip-market / ip-detail / e-shop / product-detail / create-product / events / create-event / fans-crm / earnings / settings。Settings 的 Appearance section 進階改造，3 radio cards 加 `data-theme-set` + IIFE 雙向同步監聽 `ztor:theme-changed`。Playwright 抽樣 5 頁兩套主題驗證皆通。 |
| **5 · 驗證 + 文件** | ✅ 完成 (2026-05-25) | Playwright 28 張截圖（14 頁 × 2 主題）全部存 `screenshots/`；i18n EN 模式 audit 12 頁零 CJK 殘留，2 個 leftover 是 intentional（earnings 交易 sample 用 mixed ZH/EN + settings 語言選項用原生名）；寫 [FINAL-CHECKLIST.md](FINAL-CHECKLIST.md) 收尾 9 大區驗證項。**Vercel 部署延後** — 等使用者明示允許再做。 |

---

## 6. 頁面細節（Phase 4 開始填）

詳細的每頁設計曾以 R 1.0 實作為參考並對齊 ztor 視覺語言重寫。後續維護一律先讀現行上游規格，不再以 R 1.0 作產品功能來源。
