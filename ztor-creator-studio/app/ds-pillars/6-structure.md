> 本檔是 [design-system.md](../design-system.md) 的 Pillar 6，入口與對照表在那裡。

## Pillar 6 · Structure

> Layout templates and page-level structure decisions. Components and Patterns are reusable building blocks; Structure assembles them into pages.

### 6.0.1 表面階層：疊上去的一層要比父層亮（Q66，2026-08-13）

模型出自 Figma `856:27798`（`design-layers.html` 是它的定案示範頁，2026-09-16 起只吃正式 `--layer-*` token；階梯總表、四階相套、疊到第幾層停、三條相關規則實例都在那一頁）：**L0 畫布實色 → L1 卡片實色 → 卡裡最多再疊一層半透明薄膜（疊在誰身上就跟著誰亮一階）→ 其餘層級只用線框**。

**卡內分組的順序（Q161，2026-11-09）**：卡裡第 2 層用線框（`.control-group`）、第 3 層用填色（`.nest`，吃 `--layer-2-surface` 薄膜）；Q66 原本的「L2 填色、L3 線框」順序作廢，Q66 留下的只有「疊上去要比父層亮」與下面的方向規則。超過 3 層拆成彈窗、抽屜或另一張卡。token 名裡的 L2／L3 是亮度階（第幾道填色），不是卡內第幾層。

**兩個方向相反的角色，不要混用**：

- **分組面（疊上去的一層）往亮**：`--nest-surface`（深色 `rgba(222,223,233,.04)`／亮色 `transparent`）＋ `--nest-line`（深色 `transparent`／亮色 `rgba(16,17,20,.08)`）。消費者：`.nest`（模式切換長出來的整層）、`.card--muted`（卡片裡的一段分組）、`.bd-sec`（組合包彈窗的分卡）。亮色兩層同為白，靠 `--nest-line` 才分得出來。
- **凹槽與襯底往暗**：`--muted` `#161718`。消費者：`.segmented` 的軌道（軌道凹、滑塊才浮）、媒體井（圖片未載入的佔位格）、進度條底。**這一類不在翻向範圍**。

- **控件（浮在表面上的按鈕）往亮**：`--control-raise`（深色 `rgba(222,223,233,.04)`／亮色 `var(--card)`）。消費者：`.btn--outline`。**不要用絕對表面色**——寫死 `--card` 時，同一顆按鈕在畫布上比底亮、在卡裡同色、在 L2 分組面裡反而更暗（Q67）。
- **可點卡片 hover（上浮＋換底）**：`--clickable-card-lift`（`-4px`）＋ `--clickable-card-hover-bg`（別名 `--control-raise-hover`，所以也是「往亮」的控件階）。亮暗兩個主題區塊都宣告。消費者與例外見 5.3「可點卡片 hover」。

判斷句：這塊東西是「疊在容器上的一層」還是「容器上挖出來的一個凹槽」？前者往亮，後者往暗。控件一律往亮。

**`.form-section--outlined` 是頁面層的分組，不放進卡或彈窗**：它吃絕對色 `--surface-shell` `#1C1D1E`，坐在畫布 `#0C0D0D` 上方向正確，但比 `--card` `#212223` **暗**——放進卡或彈窗就會往下沉一階。卡／彈窗內要分組，用上面那組往亮的。

證據與稽核：`docs/階層稽核-2026-08-13.md`（53 頁逐頁量合成後亮度）、STYLE-DECISIONS Q24／Q42／Q66。

### 6.0.2 卡內分組的間距階梯（Q71，2026-08-25）

同一條「多組資訊要不要疊層」的判準軸線，分頁面級（L0，直接畫在畫布上）與卡片級（L1，見 [Card group §4.133](../ds-specs/card-group.md)）兩種版面各自的定案間距值。判準本身、三級制（排版→線框→新層）見 Card group 條目，本節只記兩種版面各自的數字，供沒有現成元件可套、要手動疊間距時對齊。

**L0 畫布版**（直接落在畫布上、不是卡片內部）：

| 項目 | 值 | 說明 |
|---|---|---|
| 列距（同組內） | `--sp-40`（40px） | 卡片版是 14+14；L0 少了卡緣可以代替留白說話，值放大近三倍 |
| 組分隔線上下留白 | 各 `--sp-56`（56px） | 卡片版是各 32px |
| 組分隔線寬度 | 滿版（畫到畫布最外緣） | 讀成「跨過整個版面的斷點」，不是某一組自己的下框 |
| 組內內容左右內縮 | `--sp-16`（16px） | 線畫到最外緣、內容退進來一階，兩者才不會擠在同一條邊上 |

**卡片版（L1，`.card`/`.ztor-card` 內部）** — 完整定義見 [Card group §4.133](../ds-specs/card-group.md)，摘要：

| 項目 | 值 |
|---|---|
| 小標 → 內容 | 32px（合併值） |
| 組分隔線上下留白 | 各 32px＋線（總留白 64＋線） |
| 卡頭（T-A2）標題上距 | 24px |
| 卡頭（T-A2）線下距 | 32px |

兩種版面刻意不同軌：L0 沒有卡片邊界可以借力，得靠更大的留白與滿版線自己把「這裡換一組了」講清楚；L1 有卡緣幫忙分界，同樣的訊號可以用小一截的值傳達。**不要把兩套數字混用**——卡片內部出現 40／56 這種 L0 尺度會顯得鬆散失焦，畫布上直接用 14／32 這種 L1 尺度則分不出組界。

### 6.0 Grid & templates (token form)

> DSS v1.4 canonical token form for grid + page templates. Narrative renditions in §6.1–§6.5 below.

**Grid system:**

| Key | Value | Notes |
|---|---|---|
| `grid.columns` | `12` | Standard 12-col bento (`.bento`) |
| `grid.gutter` | `16px` | `gap: 16px` between bento children |
| `grid.margin` | `32px / 24px` | Page x-padding desktop / mobile |
| `grid.max-width` | `1280px` | Container cap — `.page` max-width。窄版變體 `.page--narrow` = `1056px`（兩欄詳情頁專用，見 §6.1） |
| `grid.breakpoints.lg` | `900px` | **R 2.2 canonical breakpoint** — topbar nav collapses, bento children fall back to span-12, hero single-column |
| `grid.breakpoints.xl` | `1280px` | Above which max-width caps |
| `grid.adaptive` | `null` | Web only — no iOS / iPad / Mac native |
| `grid.safe-area` | `null` | No iOS PWA |

**Page templates (token form):**

| Template | Regions | Key components |
|---|---|---|
| `app-dashboard` | topbar · full-bleed hero · KPI bento · data-list + alerts pair · trend + source pair · activity row | Header · Alert · KPI · Data list · Chart · Bento |
| `app-tabbed` | topbar · page-intro · tabs · 4 tab-panel | Header · Tabs · Card · KPI · Table |
| `wizard-focus` | NO topbar · close X + stepper · step body · sticky bottom action bar | Stepper · Selection card · Input · Button |
| `settings-sidebar` | topbar · page-intro · sidebar nav + scrollable content | Header · Card · Selection card · Switch · Footer |
| `empty-stub` | topbar · page-intro · centered empty-stub block | Header · Empty stub · Chip (static refs) |

### 6.1 Grid System (narrative)

- **12-col bento grid** (`.bento`) — primary layout for dashboard / earnings rows. Children use `.bento--span-{3,4,5,6,7,8,9,12}` to set columns. Below 900px breakpoint all children fall back to span 12 (mobile single-column). See [§4.25 Bento grid](../ds-specs/4.25-bento-grid.md).
- **Page container** — `max-width: 1280px`, centered; padding 32 24 96 (top-x-bottom).
- **`.page--narrow` 窄版變體** — `max-width: 1056px`（2026-07-20 Q21）。**用途**：只給「主欄＋右側常駐 meta 欄」的兩欄詳情頁（Detail rail §4.52）。**為什麼需要**：右欄固定 300px，容器若維持 1280，左欄會寬到行長過長、讀起來吃力；收成 1056 讓左欄回到舒適行長，右欄寬度不變。**基準不動**：其餘所有頁面維持 1280——Q21 原本裁定全站 1280→1056，同日經使用者實看結果後改為僅此變體套用。**Consumer**：`product-detail.html`、`order-detail.html`、`bundle-detail.html`、`auction-detail.html`（皆 `<div class="page page--narrow">`；後兩者 2026-07-27 改用同一套詳情頁殼）。定義在 `shared.css`。
- **Section vertical rhythm** — `mt-24` (24px) for top-level section gap; `gap: 16px` for bento children; `gap: 8px` for topbar action cluster.

### 6.2 Page Templates

R 2.2 has 5 canonical page templates. Each composes Pillar 4 components in a specific Pillar 6 structure:

| Template | Used by | Composition |
|---|---|---|
| **Dashboard** | [`index.html`](../index.html) | `app-topbar` → full-bleed `hero` carousel → `bento` (4 KPI) → `bento` (data-list + alerts panel) → `bento` (linechart + stacked-bar) → `bento` (3-column footer summary) |
| **Earnings (4-tab)** | [`earnings.html`](../earnings.html) | `app-topbar` → `page-intro` → `tabs` → 4 `tab-panel` (Overview / Transactions / Payouts / Tax) |
| **Wizard (focus mode)** | `create-project.html` / `create-event.html` / `create-product.html` | NO topbar → wizard chrome (close X + `stepper`) → step body → sticky bottom action bar |
| **Settings (sidebar)** | [`settings.html`](../settings.html) | `app-topbar` → `page-intro` → `.settings-layout` (250px sidebar nav + 1fr content with `settings-section` blocks) |
| **Empty stub** | `e-shop.html` (partial) / `events.html` / `ip-market.html` / `projects.html` | `app-topbar` → `page-intro` → `.empty-stub` block centered |

### 6.3 Page-intro pattern

All non-wizard pages start with a `.page-intro` block (left: eyebrow + h1 + sub; right: actions). Reserved for top-of-page header — not used mid-page. Eyebrow is `text-transform: uppercase` UI font 11px, title is `font-display` 36px, sub is body 14 muted.

**Actions cluster holds actions only** (2026-07-31 user ruling). `.page-intro__actions` is reserved for controls that change data — save, create, export, discard. Contextual help ("Learn how fans work" / 「認識粉絲系統」) lives outside it as `.page-intro__help`. **Consumers (2026-11-02, D507 user ruling, correcting D505):** the Fan roster `fans-crm.html` is the only page that carries this entry; Media Vault, Tier settings, Tier benefits, Brand campaigns, Campaign report, Audience report and Fan detail carry none.

**2026-10-27 final ruling (after five same-day iterations — accent link → grey+arrow → white → own line → inline):** `.page-intro__help` is an **outline button** (`<a class="btn btn--outline page-intro__help">`), a **direct child of `.page-intro`** placed after the left text block and before `.page-intro__actions`, pushed to the right by `.page-intro > .page-intro__help { margin-left: auto }`. It is not inside `.page-intro__lede` (so it stays out of the sentence and survives `applyI18n`) and not inside `.page-intro__actions` (so the sticky bottom bar, which copies every button of the actions cluster, never repeats it). The `.page-intro__lede--wide` modifier added earlier the same day was removed. **2026-10-28 (user ruling):** the button ends with an arrow icon (`.page-intro__help::after`, a CSS-masked lucide `arrow-right`, 14px, `currentColor`) — it says the link leaves the page; done in CSS so consumer pages need no markup change.

- `.page-intro__lede` wraps `.page-intro__sub` and carries the 560px measure (moved off `__sub`, which becomes `display: inline`).
- The link cannot be nested inside `__sub`: `applyI18n` replaces the whole `innerHTML` of any `[data-i18n]` node, so anything written inside would be wiped on language switch.
- `fan-detail.html` has no `.page-intro` and, since 2026-10-27, no help link at all (its header was redesigned; see UIA-309).
- `.page-intro__actions` is `flex-wrap: wrap` so an unusually wide control drops to the next line instead of crushing the row.

**Breadcrumb back button** (2026-08-02 user ruling, layout reference Lovable) — the 10 detail pages carry `.page-crumb__back` as the first child of `.page-crumb`, plus the `.page-crumb--back` modifier on the crumb itself.

- The button is a `.btn.btn--icon-circle.btn--sm` wrapping `chevron-left`; `.page-crumb__back` supplies the layout hook (`flex: 0 0 auto` + `margin-right: var(--sp-16)`) plus two **documented deviations from the atom**, both forced by where this instance sits. The gap went 10px → 16px on 2026-08-02 (user ruling): with the fill gone the circle's edge is invisible, so the 6px of empty box between glyph and edge stops reading as space and the arrow sits too close to the first crumb.
  - **Colour** — `.page-crumb a { color: inherit }` (0,1,1) outranks `.btn--icon-circle` (0,1,0), so without an override the glyph inherits the crumb's brand orange and picks up the crumb's hover underline beneath the SVG. `.page-crumb .page-crumb__back` (0,2,0) restores the standard icon-button pairing (`--muted-foreground` → `--foreground` on hover, `text-decoration: none`). The button is a control, not a crumb segment.
  - **No frame, no fill** (2026-08-02 user ruling: 「這個按鈕要用沒有外匡的」) — `background: transparent; border: 0`. `.btn--icon-circle`'s `--muted` fill was tuned for the composer, i.e. sitting inside a card. Dropping only the frame and keeping that fill would give the same button two different looks per theme: a visible grey disc in dark mode, and nothing at all in light mode, where `--muted` (#FAFAFA) against the white page leaves the glyph floating on its own. So the fill goes too — at rest this is just the chevron, and the circle only appears on hover via `.btn--icon-circle`'s `--accent` background. Measured identical in both themes: `rgba(0,0,0,0)` background, `0px` border, `rgb(110,110,104)` glyph.
- `.page-crumb--back` (not `.page-crumb` itself) switches the row to `display: flex`. `.page-crumb` has 30 consumer pages and 20 of them have no back button; flipping the base would turn every link and `/` separator on those pages into a flex item for no gain. Separator spacing is the inline `margin: 0 6px` already in each page's markup and survives the change.
- It is a real `<a>` pointing at the crumb's parent level (Pickup detail → `pickup.html`), **not** `history.back()`. Arriving from a bookmark, a shared link or a search result leaves no history entry to pop, so the button would silently do nothing; a link also keeps cmd-click and copy-address working.
- Hidden under `html[data-embed]` (rule lives in shared.css next to the other overlay suppressions). When a detail page is opened from a list it renders inside the `detail-sheet` iframe, whose header already carries "Back to X". Two back controls in one view make the user work out which goes where — and the crumb's is a full-page navigation, so pressing it inside the overlay would swap the iframe to the list page while the overlay stayed open.
- Standalone full-page mode is the case this exists for: there the app shell has no return path to the parent list at all.

**`.page-note`** (2026-07-31) — page-level footnote in the same file, the bookend to `.page-crumb`: crumb before the title, note after the content. 12px muted, `--sp-24` above. Use for whole-page disclaimers ("figures are prototype sample data"). Deliberately not an `.info-banner`: a banner says "read me", a footnote says "look this up if you need it", and a standing disclaimer is the second kind. Media Vault's demo-data notice moved from a bottom-of-content `.info-banner` to this.

### 6.4 Topbar (sticky)

`app-topbar` is `position: sticky; top: 0; z-index: 50` — present on all product pages except wizards. 64px tall, three slots: brand SVG (left) · `app-topbar__nav` ul (center) · `app-topbar__actions` (right: theme + search panel + lang + notifications + avatar menu).

### 6.5 Hero band

Dashboard only. Full-bleed carousel (3 slides) immediately under topbar, before `.page`. Min-height 520px (fullbleed variant). Backed by photo `images/hero-*.jpg` with linear gradient overlay; copy is `position: absolute` over the gradient.

---
