# Ztor Creator Studio — Design System

> **Identity**: 創作者商業營運後台的 design system
> **Base**: [`ztor-minimalist-v2`](../../../Design/Design%20System/ztor-minimalist-v2/design-system.md)（editorial × precision instrument）
> **Extensions**: [`dashboard.css`](dashboard.css) — app-shell 延伸（topbar、stat grid、data list、alert row、entity card、split block、integration grid）
> **Live viewer**: [`design-system.html`](design-system.html)
> **Last updated**: 2026-05-19

---

## 0. 文件定位

本文件是 Ztor Creator Studio 專案的 design system，定義整個專案的視覺、互動、用語與可及性規範。所有 page 與 component 必須引用本文件的 token 與規範。

本專案以 [`ztor-minimalist-v2`](../../../Design/Design%20System/ztor-minimalist-v2/design-system.md) 為視覺基底。**ztor-v2 的 5 支柱於本文件全部沿用，僅在 § Project Extensions 標註本專案延伸**：

- 採用 ztor-v2 的全部 token（顏色、字體、間距、半徑、邊框、動畫）— 不另立私有 token
- 採用 ztor-v2 的全部 base components（按鈕、輸入、卡片、徽章、警示、頂列⋯⋯）— 透過 `ds-components/` symlink 直接 link 到 base，不複製
- 在 `dashboard.css` 中**延伸 app-shell 專用元件與 layout pattern**（base 沒有的部份）— 嚴守 ztor-v2 視覺簽名（0.5px hairline · 無 shadow · 黃 `#FFDB29` 為唯一彩度 · UPPER + 0.1em tracking label）
- 補上 ztor-v2 在 "Not Observed" 章節列出的缺口：app shell、多語系（zh-Hant 預設）、CJK fallback font（Taipei Sans TC Beta）

設計規格書（[`documents/0-設計規格書.md`](../documents/0-設計規格書.md)）負責「畫面要放什麼資訊」；本文件負責「視覺與互動怎麼呈現」。兩份文件不重疊、互不取代。

---

## Pillar 1 — Foundations & Tokens

### 1.1 Colors

完全沿用 ztor-v2 的「6 色制 + 單一彩度」哲學 — 5 個中性 + 1 個黃。所有強調、selection、active state 一律靠黃 `#FFDB29` + 深 `#0A0A0A` 文字 + hairline `#E5E5E0` 邊框三件套。本專案在中性色上加了 3 階 neutral ramp（`--neutral-300/400/500`）給 categorical data viz 用、加 1 個 `--surface-subtle` 給 dropdown 列底 — 仍維持「中性 + 單一黃」結構，沒引入新彩度。

#### Surface

| Token | Value | Role |
|---|---|---|
| `--surface-canvas` | `#FAFAF7` | 全站底色、topbar 底、card 底 |
| `--surface-secondary` | `#E5E5E0` | 圖片占位、hover 底、divider tint、stat cell 進度條軌道 |
| `--surface-inverse` | `#1A1A18` | 暗色面（本專案中為 hero IP slide 視覺背景） |
| `--surface-dark-cta` | `#0A0A0A` | 深色 button bg、avatar bg、IconButton bg |
| `--surface-accent` | `#FFDB29` | Yellow CTA pill、hero event slide bg、status pill (live/available) |

#### Text

| Token | Value | Role | Contrast (on `#FAFAF7`) |
|---|---|---|---|
| `--text-primary` | `#0A0A0A` | H1-H3、body、stat 大數字 | 19.5:1 ✓ AAA |
| `--text-secondary` | `#5F5E5A` | label、caption、stat caption、disabled link | 6.7:1 ✓ AAA |
| `--text-invert` | `#FAFAF7` | 暗色面文字、avatar 字、IconButton 字 | — |
| `--text-accent-on` | `#0A0A0A` | 黃底上的文字（CTA pill、stat 黃條） | 16.4:1 ✓ AAA on `#FFDB29` |

#### Border / Accent

| Token | Value | Role |
|---|---|---|
| `--border-hairline` | `#E5E5E0` | 預設 0.5px border、grid divider、topbar group divider |
| `--border-emphasis` | `#0A0A0A` | active nav underline、outline button、focus input |
| `--border-hairline-width` | `0.5px` | 所有 hairline 寬度，**唯一** border 寬度 |
| `--accent-yellow` | `#FFDB29` | CTA、強調、selection、active toggle、status (live/available) |
| `--accent-yellow-hover` | `#E6C525` | 黃色 CTA hover |

#### Status（§5.3.2 狀態語言對應顏色）

| Token | Value | 用途 |
|---|---|---|
| `--status-success` | `#2E7D32` | 收入 Paid / Funded / Scheduled / Completed status-pill 前的 dot、整合「已連結」、alert--success |
| `--status-error` | `#C62828` | 收入 Failed / Cancelled、整合「同步失敗」、`.alert-row--error` 背景 tint（`rgba(198,40,40,0.03)`）|
| `--status-info` | `#FFDB29` | Toast info、alert info — ztor-v2 用黃色當 info |

#### 1.1.x Project-level 擴充 token（base 沒有、只在 dashboard.css 宣告）

| Token | Value | 用途 |
|---|---|---|
| `--surface-subtle` | `#F0F0EC` | dropdown rich option 的 hover / active 列底、entity-card 列表模式 hover；介於 `--surface-canvas` (#FAFAF7) 與 `--surface-secondary` (#E5E5E0) 之間 |
| `--neutral-300` | `#D0D0C8` | data-series 「light」— tier-bar/-dot/-pill `--devoted` 不適用（用 `--neutral-400`），stacked-bar/source-dot `--support` |
| `--neutral-400` | `#C9C9C0` | data-series 「mid」— tier-bar/-dot/-pill `--devoted` 三件套 |
| `--neutral-500` | `#A8A8A0` | data-series 「deep」— stacked-bar/source-dot `--licensing` |

> Neutral ramp 是 categorical data viz 用的暖灰中間色階，介於 `--surface-secondary` (#E5E5E0) 與 `--text-secondary` (#5F5E5A) 之間，加上 `--surface-inverse` (#1A1A18) 共組成 5 階分層，足以區隔 tier-bar 4 級 + stacked-bar 3 段。

#### 1.1.y 半透明色（rgba）使用守則

base + dashboard.css 內所有 `rgba(...)` 取的都是現有 token 的 RGB 分量、只調 alpha，沒有引入「新的彩度」：

| RGB | 對應 token | 場景 |
|---|---|---|
| `255, 219, 41` | `--accent-yellow` (#FFDB29) | dropdown active row 背景 tint (0.06/0.08)、hero IP slide 漸層 overlay (0.92)、focus ring (0.16/0.2) — base |
| `229, 229, 224` | `--surface-secondary` (#E5E5E0) | data-list row hover (0.3)、其他 hover tint (0.4/0.5) |
| `10, 10, 10` | `--text-primary` / `--surface-dark-cta` (#0A0A0A) | mega dropdown soft shadow (0.12)、stripe pattern (0.04/0.05) 、hero event 漸層 overlay (0.85)、base modal scrim (0.55/0.65) |
| `198, 40, 40` | `--status-error` (#C62828) | `.alert-row--error` 背景 tint (0.03)、base destructive item tint (0.06) |
| `0, 0, 0` | 純黑 | shadow primitives (0.15) 與部分 stripe pattern；非 token 但符合「黑」語意 |

如要新增 hover / tint，**先檢查上表是否已涵蓋**；只在新色才考慮加 token。

#### 1.1.z 例外（不在 token 系統內、刻意保留）

| 色號 | 出現位置 | 原因 |
|---|---|---|
| `#14140F` | `.hero-slide--ip` 暗色背景 (`dashboard.css:731`) | hero IP slide 比 `--surface-inverse` (#1A1A18) 略暗的 one-off 視覺微調；單一使用，不入 token |
| `#1DB954` Spotify、`#FF0000` YouTube、`#FFD600 → #FF3D00 → #C2185B` Instagram gradient、`#ED5A1F` StreetVoice、`#000` TikTok、`#5865F2` Discord | `.integration-icon--*` | 第三方品牌指定色（brand-mandated），不屬於 DS 調色盤；不可改、不入 token |

### 1.2 Typography

雙字體系統 + CJK fallback：

```css
--font-display: "Space Grotesk", "Taipei Sans TC Beta", system-ui, -apple-system, sans-serif;
--font-body:    "Inter",         "Taipei Sans TC Beta", system-ui, -apple-system, sans-serif;
--font-label:   "Inter",         "Taipei Sans TC Beta", system-ui, -apple-system, sans-serif;
```

**Stack 原則**：拉丁字符走 Space Grotesk / Inter；CJK glyph 自動 fall-through 到 **Taipei Sans TC Beta**（self-hosted 於 [`fonts/`](fonts/)）。

| Role | Family | Size | Weight | Tracking | Case | 範例 |
|---|---|---|---|---|---|---|
| display / H1 | Space Grotesk / Taipei Sans TC Bold | 60-96px | 700 | -0.02em | UPPER (Latin) | page-level title，**預設不加結尾句號** `活動` / `IP MARKET`（句號為 opt-in，僅在 editorial / hero copy 場合刻意加；Space Grotesk 軸上限 700）|
| major heading / H2 | Space Grotesk / Taipei Sans TC Bold | 26-32px (clamp) | 700 | -0.015em | UPPER (Latin) | 長頁面（Earnings / Settings）的主分區，群組多個 H3，**不加結尾句號** `本月明細` / `Profile settings` |
| section heading / H3 | Space Grotesk / Taipei Sans TC Bold | 20px | 700 | -0.01em | UPPER (Latin) | page 內 block heading（預設層級），**不加結尾句號** `收入摘要` / `RECENT EARNINGS` |
| stat number | Space Grotesk / Taipei Sans TC Bold | 36px | 700 | -0.02em | — | `12,840` |
| logo / brand | Space Grotesk | 18px | 700 | -0.02em | UPPER | `ZTOR CREATOR STUDIO` |
| card title | Inter / Taipei Sans TC Regular | 17-18px | 500 | 0 | Title Case | `CARTRIDGE 04 — Quarterly Edition` |
| body | Inter / Taipei Sans TC Regular | 14-15px | 400 | 0 | sentence | 一般描述、alert desc |
| label / nav / button | Inter / Taipei Sans TC Regular | 11-12px | 500 | 0.1em | UPPER (Latin) | `儀表板` `DASHBOARD` `GET STARTED` |
| micro / caption | Inter / Taipei Sans TC Regular | `var(--font-size-micro)` (12px) | 500 | 0.1em | UPPER (Latin) | stat caption、card meta、filter、table head（2026-05-21 由 10px 上調至 12px；token 定義在 base `ztor-minimalist-v2/components/page.css` `:root`，整套系統共用） |

**CJK 注意**：UPPERCASE 對 CJK 字符無作用、letter-spacing 0.1em 會在 CJK 字之間加間距（古典中文編排手法，可接受）。`--tracking-display` 的 -0.02em 對 CJK 略偏緊但仍可讀，不另設規則。

### 1.3 Spacing

延用 Tailwind 數值。**Section vertical rhythm 大** — `64-96px` section gap、`24px` 標題到內容 gap。

| Token | Value | 用途 |
|---|---|---|
| `space.1-4` | 4-16px | 元件內部 padding |
| `space.6` | 24px | card padding · H3 到內容 gap |
| `space.8` | 32px | topbar 左右 padding · container padding |
| `space.10` | 40px | container x-padding (≥1024px) |
| Section gap | 64px | `.app-section` margin-bottom |
| Hero py | 48-56px | hero slide body padding |

#### Container

- Max width: **1200px**（topbar、main、footer 對齊）
- Padding x: `32px` (mobile) / `40px` (≥1024px)
- Topbar height: **80px** sticky

### 1.4 Radius

ztor-v2 的「4 階 + 一個 pill」哲學：

| Token | Value | 用途 |
|---|---|---|
| `--radius-chip` | `4px` | chip · icon button · status pill · badge · lang switch · topbar icon btn |
| `--radius-button` | `6px` | button (除 pill) · input · select · search bar · alert row · data list 上層 |
| `--radius-callout` | `8px` | hero carousel · stat grid 外框（已拆 hairline）· split block · integration grid · entity card |
| `--radius-pill` | `9999px` | primary CTA pill · avatar · progress bar · status active dot |

### 1.5 Borders & Shadows

- **All borders 0.5px** — ztor signature
- **No box-shadow** — 100% 元件無 elevation
- `--border-hairline`（`#E5E5E0`）= 預設 hairline color
- `--border-emphasis`（`#0A0A0A`）= active / focus / outline button

> HiDPI 注意：0.5px 在低密度螢幕可能 round 成 0 或 1px。對小於 1px 的獨立分隔元素（topbar group divider），使用 `width: 1px + opacity: 0.18` 模擬視覺等效。

### 1.6 Motion

| Pattern | Duration | Use |
|---|---|---|
| Quick | `200ms ease-out` | color / bg / border on hover, focus |
| Standard | `300ms ease-out` | carousel slide, section transitions |
| Transform | `500-700ms ease-out` | image hover scale, arrow slide |
| Active | `100ms ease-out` | button `:active` scale 0.97 |

`@media (prefers-reduced-motion: reduce)` — carousel auto-advance 停止、scale / translate hover 變 color shift。

### 1.7 Theme Mode

- **Light-only**（無 toggle）
- 全站 `#FAFAF7` 暖白為底
- 唯一暗色面：hero `IP Market` slide 視覺背景 `#14140F`
- **不採用 dark mode** — spec § Not Observed 列為未來考慮

---

## Pillar 2 — Components

### 2.1 Base Inventory (from ztor-minimalist-v2)

完整列表見 [`ztor-minimalist-v2/design-system.md` §2.1](../../../Design/Design%20System/ztor-minimalist-v2/design-system.md#21-component-inventory)。本專案 Dashboard 使用以下 base 元件（透過 `ds-components/` symlink）：

| 分類 | 已使用 |
|---|---|
| Form & Input | (Dashboard 暫無表單，IP / Projects 頁待補) |
| Action & Trigger | Button (primary / primary-rect / dark / outline / icon) · IconButton |
| Display & Feedback | Badge (default / outline-emphasis / dark) · Alert (warn / error / info — base 樣式擴展) · Eyebrow（本專案不沿用 base 的 `--auto-brackets` 方括號簽名）· Avatar |
| Overlay & Layer | — (Dashboard 無 dialog / drawer，後續頁面待用) |
| Navigation | — (本專案用 `.app-topbar` 取代 base navbar) |
| Data & Layout | Card (collection) · Separator |

### 2.2 Project Extensions（本專案延伸 — 都在 [`dashboard.css`](dashboard.css)）

App-shell 必要、ztor-v2 base 沒有的元件。所有元件嚴守 ztor-v2 視覺簽名。

#### `.app-topbar` — 全域頂列

**Anatomy**: 80px sticky · max-width-1200 對齊 · brand (left) · nav (center, 6-group divided) · actions (right: search · lang · notifications · avatar)

**§3.4 6 組分組**用 0.5px hairline 視覺分隔：
```
總覽 | 探索 | 創作管理 | 商務營運 | 粉絲經營 | 設定
儀表板 | IP 市場 | 專案 · 我的 IP | 電子商店 · 活動 · 收入管理 | 粉絲關係管理 | 設定
```

**Variants / States**：link default / hover / `aria-current="page"`（黑底 2px underline）· focus-visible
**Token usage**：`--surface-canvas` · `--border-hairline` group divider · `--text-secondary` idle / `--text-primary` active · Inter 12px / 500 / 0.1em

#### `.app-topbar__search` — 全域跨資料搜尋

**Anatomy**: 36h · 220px wide · hairline border · 內嵌 search icon + UPPER placeholder
**Token usage**：`--surface-canvas` · `--border-hairline` idle → `--border-emphasis` focus · `--radius-button`

#### `.app-topbar__lang` — 語言切換

**Anatomy**: 36h · 短 chip · `繁中 / EN` · `aria-current` 標記目前語言
**Token usage**：`--radius-chip` · `--border-hairline` · `--text-primary` active / `--text-secondary` idle

#### `.app-topbar__icon-btn` — 通知 / 動作 icon

**Anatomy**: 36px square · hairline border · `:hover` 變黑邊
**Token usage**：`--radius-chip` · `--border-hairline` · `--text-primary` icon
**子件**：`.app-topbar__badge-dot`（6×6px 黃點，提示未讀通知）

#### `.app-topbar__avatar` — 帳戶頭像

**Anatomy**: 36px round pill · 黑底 · 白字 initials
**Token usage**：`--surface-dark-cta` · `--text-invert` · `--radius-pill`

#### `.app-section__title` — H3 區塊標題（預設）

**Anatomy**: Space Grotesk 700 / Taipei Sans TC Bold · 20px · -0.01em tracking · **不加結尾句號**
**§5.1.1 對應 H3**: 收入摘要 / 近期收入 / 告警與動作 / 近期系統活動 / 近期活動與進行中專案 / 粉絲關係分析與受眾趨勢分析 / 第三方服務整合狀態

#### `.app-section__title--major` — H2 主分區標題

**Anatomy**: Space Grotesk 700 / Taipei Sans TC Bold · clamp(26-32px) · -0.015em tracking · **不加結尾句號** · margin-bottom 28px
**When to use**: 長頁面（Earnings 收入管理、Settings 設定）需要把多個 H3 區塊群組起來時用；短頁面（Dashboard / Events list）不需要用到
**範例**: `本月明細` 包裹 `近期收入 + 出帳記錄 + 提款` 三個 H3 / `Profile settings` 包裹 `基本資料 + 通知 + 安全` 三個 H3

#### `.hero-carousel` — Dashboard 首頁輪播

**Anatomy**: 全寬 callout-radius callout · 1.4fr/1fr split (body/visual) · indicators 左下 · controls 右下
**Variants**: `--event`（黃底）· `--ip`（黑底）
**Behavior**: auto-advance 8s · hover pause · 2 slides per §5.1.1 (建立活動 / IP 市場)
**Reduced motion**: auto-advance 停止 · controls 仍可用

#### `.stat-grid` + `.stat-cell` — 收入摘要 4 cell

**Anatomy**: 4 column grid · top/bottom hairline · 每 cell 右 hairline (last child 無) · caption + value (大數字 + 幣別 suffix)
**Token usage**：Space Grotesk 700 36px stat number · Inter `var(--font-size-micro)` UPPER caption · `--border-hairline` dividers
**Responsive**: ≥900px 4 col / <900px 2×2

#### `.data-list` + `.data-list__row` — Recent Earnings 5 列

**Anatomy**: 外框 callout-radius + hairline · 每 row 4 col grid (primary / status / amount / arrow) · row hover `bg #E5E5E0/30`
**Subparts**：`__primary` (項目 + secondary 來源/分類) · `__status` (status pill) · `__amount` (淨額 + FX 副資訊) · `__arrow`
**Token usage**：`--radius-callout` 外框 · `--radius-button` 內無 (clean callout)

#### `.alert-stack` + `.alert-row` — Alerts & Actions 4 條

**Anatomy**: vertical stack · 每 row 3 col grid (icon / content / cta)，左側 2px status accent
**Variants**：`--warn`（黃左邊）· `--info`（黑左邊）· `--error`（紅左邊）
**Subparts**：`__icon` (Space Grotesk 900) · `__title` (Inter 11 UPPER) · `__desc` (Inter 13) · `__source` (Inter 10 UPPER) · `__cta` (Inter 10 UPPER + hairline underline)

#### `.activity-list` + `.activity-row` — Recent Activity timeline

**Anatomy**: ul / li · 100px time col · flex content · auto tag · top + bottom hairline
**Token usage**：Inter 10 UPPER time + tag · Inter 14 body · `<strong>` font-weight 500（強調而非粗體）

#### `.cards-row` + `.entity-card` — 近期活動與進行中專案 3 卡

**Anatomy**: 3 col grid · 每卡 callout-radius + hairline · cover (16:10 striped placeholder + 左下 badge) · body (eyebrow / title / meta / progress / footer)
**Subparts**：`__cover` · `__eyebrow` (專案 / 活動類型) · `__title` (Inter 17) · `__meta` (Inter 10 UPPER) · `__progress` + `__bar` (4px height, yellow fill) · `__footer` (status pill + percent)
**Responsive**：<900px → 1 col

#### `.split-block` — 粉絲關係 + 受眾趨勢 2 panel

**Anatomy**: 2 col grid · callout-radius + hairline 外框 · 中間 hairline divider (vertical, mobile 變 horizontal)
**Subparts**：`__panel` (28px padding) · `__eyebrow` (Inter 10 UPPER) · `__title` (Space Grotesk 700 22px UPPER)
**Inner widgets**：`.tier-list`（粉絲分級 + bar + count）· `.kv-list`（key-value 表）· `.disclaimer`（資料限制注記，Inter 12 secondary）

#### `.integration-grid` + `.integration-cell` — 第三方服務整合 5 平台

**Anatomy**: 5 col grid · callout-radius + hairline 外框 · 每 cell 右 hairline + 22px padding · name / status pill / sync note 縱排
**Responsive**：<900px → 2 col

#### `.status-pill` — 跨段共用狀態徽章

**Anatomy**: 內含一個 6×6px 圓點（顏色語意化）+ UPPER 文字 · radius-chip + 0.5px inset shadow border
**Variants**（§5.3.2 狀態語言對應顏色）：
- `--available`（黃點）— 收入 Available
- `--pending`（灰點）— 收入「待結算」
- `--paid`（綠點）— 收入 Paid · 整合「已連結」
- `--failed`（紅點）— 收入 Failed · 整合「同步失敗」
- `--live`（黃點）— 專案 Live · 商品 Live · 活動 On Sale
- `--scheduled`（綠點）— 專案 Funded · 活動 Scheduled
- `--draft`（灰點）— Draft · 整合「未連結」
- `--lowstock`（紅點）— 商品 Low Stock

> **狀態語言混語**（§5.3.2 嚴格遵守）：收入用 `Available · 待結算 · Paid · Failed`（spec 寫死）· 專案 / 商品 / 活動全英 · 整合全中。**不在 UI 自行翻譯。**

---

## Pillar 3 — Patterns & Templates

### 3.1 Dashboard 主版型

**Used on**: `index.html`

```
.app-topbar (80h sticky)
  ─────────────────────────────────────────────
.app-main (max-w-1200 · padding 40px ≥1024)
  .hero-carousel          (§5.1.1 #1)
  .app-section ×7         (§5.1.1 #2-#8)
    > .app-section__title (H3 無結尾句號)
    > content
```

**規則**：
- 每 section 間 `margin-bottom: 64px`
- 無 page header / 無 greeting line（spec 未列；voice 不直呼讀者 §4.1）
- 無 footer（spec 未列；後續 marketing 頁才放）

### 3.2 Hero Carousel Pattern

**Used on**: Dashboard #1

- 2 slide 自動輪播 · 8s 間隔 · hover pause
- Slide 1 = action prompt（黃底 dark CTA）/ Slide 2 = exploration（黑底 yellow CTA）
- Indicators 左下 · prev/next controls 右下（icon button hairline）
- 1.4fr body / 1fr visual split · visual 為斜紋占位（striped linear-gradient）

### 3.3 Two-Column Data + Alerts Pattern

**Used on**: Dashboard #3 + #4 並排

- LEFT 1.4fr: 主要 data 表格（Recent Earnings）
- RIGHT 1fr: 次要 alert stack（Alerts & Actions）
- <900px → stack vertical
- 兩側皆 H3 + 內容區，無 view-all link（§5.1.1 任何深連結走 row-level）

### 3.4 Split Block Pattern

**Used on**: Dashboard #7

- 2 panel 並排 · 中間 hairline · callout 外框
- 每 panel 內：eyebrow + title + inner widget（tier-list / kv-list / disclaimer）
- 適合「同概念的兩個資料來源並陳」

### 3.5 Stat Grid Pattern

**Used on**: Dashboard #2

- 4 cell horizontal grid · top + bottom hairline · 內部 hairline
- 每 cell 縱排：caption (`var(--font-size-micro)` UPPER) → value (Space Grotesk 700 36) → optional delta（本專案目前未用，spec 沒要求）

---

## Pillar 4 — Content / Voice & Tone

### 4.1 Voice（沿用 ztor-v2）

- **Editorial-precise** — 雜誌 / 出版用語（issue, edition, collection）
- **Statement, not pitch** — declarative 句型 · 避免 "you'll love" / "blazing"
- **第三人稱與不直呼讀者** — 比 SaaS 客服腔冷靜一階
- **本專案明確不採用**「Good morning, {name}.」這類 SaaS 招呼語（違反不直呼讀者原則）

### 4.2 Tone

- **預設所有 heading（H1 / H2 / H3）不加結尾句號** — `活動` `收入摘要` `RECENT EARNINGS`
- **句號（。/ .）為 opt-in** — 僅在 hero copy / editorial 大字場合刻意保留，如「幾分鐘辦好第一場活動。」這類非標題文案
- **無 emoji · 無驚嘆號**
- **大小寫**：英文 heading UPPERCASE + tracking -0.02em · label UPPERCASE + tracking 0.1em
- **CJK 不適用 UPPERCASE**，但 tracking 仍套用（古典中文編排）

### 4.3 Microcopy 範例（Dashboard）

| 情境 | 文案 |
|---|---|
| Primary CTA (黃) | `進入 IP 市場 →` |
| Secondary CTA (深色 fill) | `建立活動 →` |
| Section H3 | `收入摘要` `近期收入` `告警與動作`（不加句號） |
| Alert CTA | `續租` `補貨` `前往` `重新授權` |
| Eyebrow (hero 編號) | `01 / 02`（不加方括號） |
| Search placeholder | `搜尋專案、粉絲、商品…` |
| Lang switcher | `繁中 / EN` |

### 4.4 Localization（§5.3.4）

- **預設語言**：zh-Hant（繁體中文）
- **支援語言**：zh-Hant + English
- **不自動翻譯**：使用者自填內容、人名、暱稱、專案名稱、商品名稱、IP 條款、法律文件、第三方平台名稱（YouTube / Spotify / StreetVoice / Instagram / TikTok）
- **狀態語言混語**：§5.3.2 spec 寫死的英文狀態（Available / Paid / Failed / Live / Funded / On Sale）即使在中文 UI 也保留英文，不自行翻譯
- **CJK fallback font**：Taipei Sans TC Beta（self-hosted `fonts/`）

---

## Pillar 5 — Accessibility

### 5.1 Estimated Level

承襲 ztor-v2 — **light theme 主文字 WCAG AAA（19.5:1 contrast）**。

### 5.2 Contrast Audit

| Foreground | Background | Ratio | WCAG |
|---|---|---|---|
| `#0A0A0A` text-primary | `#FAFAF7` canvas | 19.5:1 | ✓ AAA |
| `#5F5E5A` text-secondary | `#FAFAF7` canvas | 6.7:1 | ✓ AAA |
| `#0A0A0A` on yellow | `#FFDB29` | 16.4:1 | ✓ AAA |
| `#FAFAF7` invert | `#14140F` IP hero | 17.8:1+ | ✓ AAA |
| `#FFDB29` yellow | `#FAFAF7` canvas | 1.4:1 | ⚠ **不可用於文字**，僅 surface / border |

### 5.3 Topbar Accessibility

- `role="banner"` on `<header class="app-topbar">`
- `<nav aria-label="主導航">` 包裹主導航
- `aria-current="page"` 標記目前頁
- 全域 actions 個別 `aria-label`（搜尋 / 語言切換 / 通知與待辦 / 帳戶）
- 語言切換用 `aria-current="true|false"` 標記目前語言
- Keyboard：所有 nav link / action button 可 Tab 到、focus-visible 顯示 0.5px outline

### 5.4 Hero Carousel Accessibility

- Indicators 為 `<button role="tablist">` 對應 slides
- prev/next button 有 `aria-label`
- auto-advance 在 `prefers-reduced-motion: reduce` 下停止
- hover 暫停讓鍵盤 / 滑鼠 user 有時間閱讀

### 5.5 Status Pill Accessibility

- 顏色 + 文字並用，不單靠顏色傳遞狀態
- 灰點對 tritanopia / deuteranopia 仍與黃 / 綠 / 紅可區分

### 5.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .hero-carousel__track,
  .hero-carousel__dot,
  .data-list__row,
  .app-topbar__icon-btn,
  .app-topbar__link { transition: none; }
}
```

---

## 與來源系統的關係

| 來源 | 採納部分 | 本專案差異 |
|---|---|---|
| **ztor-minimalist-v2** | 全部 token + 全部 base components + 5 支柱 + voice / tone / a11y | 本專案新增 app-shell 元件（topbar / stat-grid / data-list / alert-row / entity-card / split-block / integration-grid）+ CJK fallback (Taipei Sans TC Beta) + zh-Hant 預設 |
| **設計規格書 03** | §3.4 全域導覽結構 · §5.1.1 dashboard 區塊 · §5.3.2 狀態語言 · §5.3.4 localization 規則 · §4.1-§4.4 voice | 視覺與互動實作層 |

ztor-creator-studio design system = ztor-minimalist-v2（視覺基底）+ dashboard.css（app-shell 延伸）+ 設計規格書 03（產品規則）

---

## 檔案結構

```
app/
├── design-system.md          ← 本檔（專案 design system 文件）
├── design-system.html        ← Live component gallery viewer
├── index.html                ← Dashboard 頁面
├── dashboard.css             ← App-shell 延伸 + CJK fallback @font-face
├── ds-components/            ← symlink → Design/Design System/ztor-minimalist-v2/components/
│   ├── page.css              ← :root tokens（base）
│   ├── button.css · card.css · input.css · …  (50 個 CSS)
└── fonts/
    ├── TaipeiSansTCBeta-Regular.ttf
    ├── TaipeiSansTCBeta-Bold.ttf
    └── TaipeiSansTCBeta-Light.ttf
```

### Sync 機制

| 變更來源 | 自動同步到 |
|---|---|
| `ds-components/*.css`（即 base ztor-v2/components/） | `index.html` Dashboard · `design-system.html` Viewer · 任何後續頁面 |
| `dashboard.css` | 同上 |
| `design-system.md`（本檔） | 文件改動需手動同步到 `design-system.html`（viewer 為元件畫廊，**不渲染本檔內容**） |

> ⚠️ **Viewer 的範圍**：design-system.html 只展示 token + 元件 live example。本檔（design-system.md）的 prose / 規則 / philosophy 不在 viewer 中渲染——viewer 是 "看 components 長什麼樣"，本檔是 "為什麼這樣做"。兩者並行，不互相替代。
