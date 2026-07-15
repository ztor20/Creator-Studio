# Ztor Creator Studio · R 2.1 — Design System

> **Structure aligned with DSS v1.4 7-Pillar architecture** (Pillar 0 Record · 1 Foundation · 2 Role · 3 Mode · 4 Component · 5 Pattern · 6 Structure · Appendix A/B). Restructured from the previous 5-pillar layout on 2026-05-26.

> **Differs from ztor**: two light-mode tokens shift to give the system a single, attention-grabbing brand color where ztor was deliberately near-monochrome.
>
> | Token | ztor | ztor-orange |
> |---|---|---|
> | `background-canvas` | `#F7F7F7` | **`#FFFFFF`** (clean white since 2026-06-09; was `#FAFAF7` warm paper, since neutralised) |
> | `border-soft` | `#E5E5E5` | `#E5E5E5` (cooler hairline retained — was briefly `#D1D1C7` 2026-05-22→25, reverted on user feedback) |
> | `primary` | `#171717` | **`#ffa33f`** (highlighter orange) |
> | `primary-foreground` | `#FFFFFF` | **light `#FFFFFF` / dark `#171717`** (使用者指定 2026-06-22：白天白字、黑夜黑字；白字在淡橘上對比 ~1.9:1，低於 WCAG AA) |
> | `primary-hover` | `#000000` | **`#ffb866`** (brighter orange) |
> | `ring` | `#ffa33f` (light, =primary) · `#FDFDFD` (dark) | orange focus ring (=primary), by request 2026-06-02 |
>
> Dark-mode `primary` also moves to `#ffa33f` to keep the orange voice paired across modes. Every other ztor token (surface, foreground, status accents, radii, shadows, motion, typography) is preserved as-is. All `ds-components/*.css` are 100% token-driven, so the visual flip happens entirely in `ds-components/_tokens.css`.

> **2026-06-25 · 命名對齊 shadcn + 暗色實色 + 控件尺寸 + focus（issue #11 — ztor 工程端 jaskang 反饋）**
> - **Token 改名 → shadcn role**：`--surface→--card` · `--surface-muted→--muted` · `--foreground-subtle→--muted-foreground` · `--surface-rail→--sidebar` · `--surface-rail-hover→--accent` · `--status-error→--destructive`；補齊 shadcn 全集（`card-foreground` / `popover(-foreground)` / `secondary(-foreground)` / `accent-foreground` / `destructive-foreground` / `input` / `chart-1..5` / `sidebar-*` 整組）。creator 獨有的（`surface-shell` / `surface-page` / `primary-hover` / `status-{success,info,warning,accent}` / `gradient-brand` / `sidebar-active`）保留為 `[ext]`。**對齊語意、值不變**，品牌橘仍是 `--primary`。
> - **暗色實色面**：`--background` / `--foreground` 與 card / muted / sidebar / border 改實色 hex（值由原 `rgba` 疊層在 `#191A1A` / `#2B2B2C` 上算出，外觀不變）；半透明只剩 `backdrop-blur` overlay。`--ring` 暗色不再覆寫成白、改繼承品牌橘（亮暗同色）。
> - **控件尺寸**：新增 `--control-h-{xs,sm,md,lg,xl}` = `28/36/44/52/60`（皆 ÷4），button / input / field 共用、同尺寸等高；新增 4px `--space-1..16`（後於 2026-07-02 退役、由 `--sp-*` px 尺標取代，見 §2.3）。default 維持 44。
> - **focus 統一**：全控件＋亮暗一律 `outline: 2px solid var(--ring); outline-offset: 2px`（清單列 `-2px` 內嵌）。
> - **小數收斂**：裝飾邊框 1.5 / 2.5px → 整數、陰影次像素 → 整數。
> - **無障礙＝最低優先、只建議**：依使用者裁示，橘 ring 低對比等 a11y 議題僅記風險、不阻擋交付、不改品牌決策。

---

## Identity

**Tagline** — *The back-office where independent creators turn IP, projects, and fans into income — transparently.*

**Category** — Creator-economy operations dashboard. A single studio for independent creators to manage IP licensing, projects, events, products, fans (CRM), and earnings — with finance, royalties, splits, and verification states kept legible. Theme: light / dark / system.

**Locales** — `en (primary) · zh-Hant (secondary)`, toggled in the topbar and persisted. CJK fallback font `Noto Sans TC` (self-hosted, subsetted woff2) is appended to every `--font-*` stack so Traditional Chinese never falls back to a system serif.

**Tags** — `creator-economy`, `operations-dashboard`, `geist-stack`, `clean-white-canvas`, `neutral-surfaces`, `subtle-radii`, `multi-layer-shadows`, `dashboard-hero`, `row-divider-data`, `light-and-dark`, `highlighter-orange-primary`.

**Overview** — Ztor Creator Studio · R 2.1 is a clean, editorial take on a creator-economy operations dashboard: a white canvas (`#FFFFFF`) with near-white neutral surfaces — default cards and controls separate by a flat 1px `--border` (Q3/Q4 2026-07-13), and the sidebar display-mode rail uses a quieter `#FBFBFB`. Geist for UI / Inter for body, subtle 6px radii, and multi-layer rim+drop shadows reserved for popovers/overlays and for the hover state of clickable/selection cards. Its one high-saturation move is **a highlighter-orange primary (`#ffa33f`) with near-black text** — used structurally for CTAs, active tabs, selection-card selected state, hero fills and pre-order pills (nav active states stay neutral gray — Q8). Informational banners stay neutral gray. Hairlines stay at `#EAEAEA`. The voice is task-oriented and finance-honest: every page states what you can do now, and money / royalties / verification states are always spelled out.

**Similar systems** — [Notion](https://notion.so) (highlighter-orange accent, editorial chrome), [Linear](https://linear.app) (Geist + neutral tokens, dense data UI), [Vercel](https://vercel.com) (Geist origin, subtle radii, rim+drop shadows), [Attio](https://attio.com) (dashboard-as-hero, CRM-style data density), [Stripe Dashboard](https://stripe.com) (finance-honest tables, transparent money / payout states).

---

## Top-level Do / Don't

System-level discipline. Component-level Do / Don't lives inside each component spec card; what follows applies across the whole system.

### Do

- Use `Geist` weight 500–700 with `letter-spacing: -0.2px` for H1/H2 display headings; `Geist` 500 / 13–14 px for UI labels and nav.
- Reserve `--primary` (`#ffa33f`) for the primary CTA, hero accent and brand mark. Informational banners use neutral tokens; never use orange as a fill for nav chrome, KPI highlights, or status pills.
- Apply `--radius` (6 px) to all controls, buttons, cards and surfaces; `--radius-md` is now an alias of `--radius` (merged to 6 px, Q2 2026-07-13). Use `--radius-lg` (8 px) for dropdowns / nav panels and `--radius-pill` for full-round.
- Separate top-level sections with `mt-24` (24 px); use `gap: 16px` for bento children and `gap: 8px` for tight topbar clusters.
- Use the `pill` taxonomy (`pill--orange / --success / --error / --info / --neutral`) for every status indicator. New colored backgrounds outside that set are forbidden.
- Use Lucide icons via the local `icons.js` registry, stroke-width `1.2`, `currentColor` inheritance. Never inline raw `<svg>` for chrome icons.
- Use `var(--font-display)` only for hero / page H1; `var(--font-ui)` for everything else (buttons, nav, labels, KPI titles, table headers).
- Pair `--primary` with `--foreground` for button text. For longer button copy add `white-space: nowrap` on the `.btn` base.

### Don't

- Do not use `--primary` as a fill for nav active states, KPI cards, or row accents — nav active states use `--sidebar-active` (neutral gray, Q8), interactive hover uses `--accent` (Q9), KPI/row backgrounds stay neutral `--card`/`--muted`.
- Content surfaces top out at E2 `--shadow-card`; `--shadow-float` / `--shadow-overlay` are reserved for transient layers (dropdowns, dialogs) — never for resting content. Interaction borrows the rung above (card hover → float); no ad-hoc shadow values. Only the hero carries deep light and it does so via gradient veil, not box-shadow.
- Do not introduce fonts outside the four-font stack (`Geist`, `Geist`, `Geist Mono`, `Inter`, `Noto Sans TC`). The CJK fallback is non-negotiable.
- Do not give data-list icons semantic color. List icons stay monochrome (`--muted` bg + `--foreground-muted` color); semantic color lives in the **amount** text, not the icon chip.
- Do not use `--status-warning` (`#F8D749`) as a UI fill — it reads too close to `--primary`. Reserve it for status dots inside dashboards only.
- Do not place dropdowns over the full-bleed hero with `var(--card)` background — in dark mode `--card` is translucent. Use `var(--background)` (always opaque) for any panel that overlaps imagery.
- Do not hardcode color hex values in page CSS. All visual decisions route through `_tokens.css`; new color needs go to `:root` overrides, not inline rules.
- Do not break button copy across lines — `.btn` base sets `white-space: nowrap`; long labels need a shorter copy decision, not a wrapped button.

### 風格裁決落地（2026-07-13，Q1–Q12）

以下 12 條是 2026-07-13 落地的風格裁決，CSS 已改完，此節是給後續新元件對齊用的規則摘要。逐條換行列出：

- **Q1 形狀＝可否互動的線索**
  可篩選／可點的膠囊（chip、filter-tabs）＝全圓 `--radius-pill`。
  純顯示徽章（badge、field-pill、metric-pill）＝小圓角矩形 `--radius`。
  新元件照此選形狀，不得混用。
- **Q2 圓角統一 6px**
  `--radius` 與 `--radius-md` 同值（6px），`--radius-md` 是別名。
  例外：`--radius-pill`（9999px）、shell（28px）、`--radius-lg`（8px）。
- **Q3 卡片預設＝1px 純邊框**
  `.card` / `.kpi` / `.ztor-card` 預設用 `border: 1px solid var(--border)`，不用陰影。
  只有可點／浮起的強調卡（`.ztor-card--clickable` hover、`.selection-card`）hover 時才升級成純陰影（`--shadow-card-hover`）。
- **Q4 控制項＝視覺邊線**
  `.input` / `.textarea` / `.select` 使用 `0 0 0 1px var(--border)` 陰影邊線，避免原生 border 影響控件尺寸。
  focus 改為 `--ring` 1px 邊線 + 4px 柔光環；`.ztor-metric-pill`、`.switch` 維持各自既有規則。
- **Q5 hover 浮起規則**
  可點卡片 hover 借 `--shadow-float` / `--shadow-card-hover` 浮起。
  清單列與表格列 hover 只換底色 `--accent`，不浮起。
  純預覽／展示卡（preview-card、kpi）不做 hover。
- **Q6 表單節奏**
  以基礎 `.field` 為準：描述↔控件 6px、欄位↔欄位 16px。
  `.form-section` 不再局部覆寫垂直節奏。
- **Q7 卡片內距對照表（維持各自密度，不硬統一）**
  `.kpi` 16/18px。
  `.card` 20px。
  `.ztor-card` 24px。
  `.selection-card` 14/16px。
  `.empty-card` 32/24px。
  未來新卡片對號入座，不要隨機挑數字。
- **Q8 品牌橘範圍**
  橘只給主操作／主分類（Tabs、選擇卡已選）。
  導覽／篩選的已選一律中性灰（`.settings-nav--active`、`.app-sidebar` 已對齊，用 `--sidebar-active`）。
- **Q9 hover 底色**
  互動 hover 一律 `--accent`（亮 `#F3F3F3` / 暗 `#383839`）。
  `--muted` 只給斑馬紋／襯底，不做 hover。
  `--secondary` 已退役（全站零消費，已自 `_tokens.css` 移除）。
  例外：`.filter-tabs__item:hover` 仍用 `--muted`（因其 active 也是灰 muted，hover 不可比已選更重）。
- **Q10 關閉鍵**
  `.alert__close`、`.leave-dialog__close` 的 20px/18px 覆寫已移除。
  全部關閉鍵回到基礎 `.ztor-icon` 16px。
- **Q11 已付款 Paid**
  orders／order-detail 的 Paid 徽章一律 `badge--success`（綠色），不再是 `badge--neutral`。
- **Q12 欄位標籤**
  用一般大小寫（`.settings-row__label`）。
  `tier-settings.html` 原本的大寫 `.gate-field__label` 已退役，不再新增大寫孤例。

---

## Quick Reference

| Token | Value | Hex |
|---|---|---|
| `background-canvas` | rgb 255 255 255 | `#FFFFFF` (clean white · 2026-06-09) |
| `background-surface` | rgb 255 255 255 | `#FFFFFF` |
| `background-card` | rgb 250 250 250 | `#FAFAFA` |
| `surface-shell` | rgb 240 240 238 | `#F0F0EE` (sidebar-mode App Shell canvas) |
| `surface-page` | rgb 250 250 250 | `#FAFAFA` (single opaque route page) |
| `sidebar` | rgb 251 251 251 | `#FBFBFB` (sidebar display-mode rail — near-white neutral) |
| `accent` | rgb 243 243 243 | `#F3F3F3` (rail item hover) |
| `sidebar-active` | rgb 236 236 236 | `#ECECEC` (rail selected pill, 2026-06-12) |
| `background-footer` | rgb 0 0 0 | `#000000` |
| `foreground` | rgb 26 26 26 | `#1A1A1A` |
| `foreground-muted` | rgba 0 0 0 / .7 | `rgba(0,0,0,0.7)` |
| `muted-foreground` | rgb 110 110 104 | `#6E6E68` |
| `primary` | rgb 255 219 41 | `#ffa33f` ⚡ |
| `primary-hover` | rgb 255 229 92 | `#ffb866` ⚡ |
| `primary-foreground` | rgb 23 23 23 | light `#FFFFFF` / dark `#171717` ⚡ |
| `ring` | rgb 255 219 41 | `#ffa33f` (=primary) |
| `border-soft` | rgb 229 229 229 | `#E5E5E5` |
| `status-success` | rgb 34 197 94 | `#22C55E` |
| `status-error` | rgb 218 49 74 | `#DA314A` |
| `status-info` | rgb 38 109 240 | `#266DF0` |
| `status-warning` | rgb 248 215 73 | `#F8D749` (note: visually close to `primary` — reserve status-warning for **status dots inside dashboard demos**, never as a UI fill, to avoid clashing with the yellow CTA) |

⚡ = changed from ztor

| Property | Value |
|---|---|
| Display font | `Geist` (H1) |
| UI font | `Geist` (H2-H4, buttons, nav) |
| Body font | `Inter` (paragraphs only) |
| Primary radius | `6px` (CTAs, cards, outline buttons — `--radius-md` merged into `--radius`, Q2 2026-07-13) |
| Pill radius | `1000px` / `100%` (status dots, avatars) |
| Base spacing | Dense scale — 1, 4, 6, 8, 10, 12, 14, 16, 24 |
| Card shadow | `0 2px 8px -1px rgba(12,10,9,0.05), 0 0 0 1px rgba(23,23,23,0.05)` (rim + drop, softened 2026-07-13 — more diffuse, lower alpha) — used at rest by selection-card / dropdown-item / table / composer / cookie-banner; `.card`/`.kpi`/`.ztor-card` default to a flat 1px `--border` instead (Q3 2026-07-13), shadow reserved for their clickable hover |
| Soft elevation | `0 4px 4px rgba(23,23,23,0.04)` (cards / popovers lift；outline 按鈕自 2026-06-12 改 1px `--border` 實線、不再用此陰影) |
| Theme | **Light + dark** (toggle inherited from ztor's 2026-05-25 dark-mode adapter; dark primary also orange) |
| H1 desktop | `64px / 400 / lh 1 / tracking -1.28px` (Geist) |
| Button label | `15px / 500 / tracking -0.3px` (Geist) |
| Icon system | Lucide (via `icons.js` registry) |
| Theme mode | both — light / dark / system |

**Assumptions** — sample data, names, copy, and money figures are illustrative placeholders. Product gaps and implementation drift are tracked in [`ASSUMPTIONS.md`](ASSUMPTIONS.md); presentation and engineering decisions are tracked in [`BUILD-SPEC.md`](BUILD-SPEC.md).

---

## Pillar 0 · Record

System metadata. No design values — just provenance.

| Field | Value |
|---|---|
| `name` | Ztor Creator Studio · R 2.1 |
| `source` | Ztor Creator Studio — creator-economy operations dashboard (this project, R 2.1) |
| `version` | R 2.1 |
| `date` | 2026-06-01 (de-branded + Pattern cards + provenance cleanup) |
| `base` | Ztor (parent design system) — three light-mode tokens diverged for highlighter-orange CTA |
| `notes` | `--border` reverted from `#D1D1C7` → `#E5E5E5` on 2026-05-25 (cooler hairline, per user feedback). Canvas neutralised to white `#FFFFFF` and warm surfaces removed 2026-06-09. Orange Z brand mark replaced with full Ztor wordmark SVG in R 2.1.6. 13 app-tier components promoted from `shared.css` to `ds-components/*.css` across Phase 0-4 (2026-05-26). |

---

## Pillar 1 · Foundation (raw tokens)

> **Renamed from §1 Foundations.** Foundation = the raw material layer: just values, no semantic meaning. Pillar 2 Role decides how these values get used.

### 1.1 Color

Ztor Creator Studio · R 2.1 runs on a **clean white canvas with neutral light-gray surfaces and a single high-saturation brand color** — highlighter orange `#ffa33f` plays the role of primary CTA and nothing else does. Status accents stay reserved for dashboard data dots.

> **Surface-layer contrast（全域通則，所有元件適用）** — 這些 surface 是一層階梯（白 `--card`/`--background` → 灰 `--muted`/`--surface-shell`/`--sidebar`）。任何元件靠「填色／邊框／陰影跟它所在那層的對比」被看見，**填色和背景同色就會消失**。所以：淺灰填（soft 按鈕、segmented 軌道、chip、hover 態）只在更亮的底成立；白填要靠 1px 邊框在白底成形；要跨層安全就用實線 border，別用「填色當邊」或「純陰影當邊」。做／改任何有填色的元件時，先確定它坐在哪幾層、並在**最深的那層**目視驗證。（按鈕的白/灰底實例見 §4.2 Button。）

| Role | Hex | Where it lives |
|---|---|---|
| `background-canvas` | `#FFFFFF` | Body / page — clean white (2026-06-09). Cards (`--card` #FFFFFF) now separate by shadow, not by canvas tint |
| `surface-shell` | `#F0F0EE` | Subtle Sidebar-mode outer canvas behind navigation and the route page（2026-07-14 再降一階，保留與 route page 的層次） |
| `surface-page` | `#FAFAFA` | One continuous opaque route page containing hero, content, and footer（2026-07-14 降低明度） |
| `sidebar` | `#FBFBFB` | Sidebar display-mode rail — near-white neutral (warmth removed 2026-06-09); separates from the white canvas via a very light tone + hairline |
| `accent` | `#F3F3F3` | Sidebar item hover — a controlled step darker so it reads on the near-white rail |
| `sidebar-active` | `#ECECEC` | Sidebar selected item — full-pill（9999px）capsule fill, one step deeper than hover so the current page is unmistakable（2026-06-12，dark: rgba 253/0.12） |
| `background-surface` | `#FFFFFF` | Cards, nav-dropdown panels, dashboard mockup frames |
| `background-card` | `#FAFAFA` | Muted card variant (slightly cooler than surface) |
| `background-footer` | `#000000` | Pure black footer — the only place black appears as a fill |
| `foreground` | `#1A1A1A` | Body text, headings (dominant — 415 occurrences on home; off-black, 2026-07-13 體檢：純黑殺層次) |
| `foreground-muted` | `rgba(0,0,0,0.7)` | Secondary copy, supporting sentences |
| `muted-foreground` | `#6E6E68` | Caption, metadata, meta-text（2026-07-13 微暖） |
| `primary` | `#ffa33f` ⚡ | Primary CTA fill — "Create project" / "Request payout" / "Publish". The signature color |
| `primary-hover` | `#ffb866` ⚡ | CTA hover — brighter (reverse of ztor's "darken on hover" pattern) |
| `primary-foreground` | light `#FFFFFF` / dark `#171717` ⚡ | Text inside primary CTAs (使用者指定 2026-06-22：白天白字、黑夜黑字；白字對比 ~1.9:1 < WCAG AA) |
| `ring` | `#ffa33f` | Focus ring — orange (=primary), by request 2026-06-02 |
| `border-soft` | `#E5E5E5` | Hairline rule (rare — usually swapped for shadow rim). Retained from base ztor for clean contrast on the white canvas |

⚡ = changed from ztor

**Status accents** drive the status language across the app — live / paid → green, failed → red, info → blue, low-stock / warning → yellow — as data dots and status pills, never as primary UI chrome:

| Status | Hex | HSL |
|---|---|---|
| Success | `#22C55E` | `142 71% 45%` |
| Error | `#DA314A` | `352 70% 57%` |
| Info | `#266DF0` | `218 87% 55%` |
| Warning | `#F8D749` | `49 93% 63%` |

### 1.2 Typography

```css
--font-display: 'Geist', 'Geist', system-ui, sans-serif;
--font-ui:      'Geist', system-ui, sans-serif;
--font-body:    'Inter', system-ui, sans-serif;
```

- **Geist** — used on `<h1>` only (variable axis for hero display)
- **Geist** — H2 / H3 / H4, buttons, nav, eyebrow text
- **Inter** — paragraph body copy (`<p>`), long-form descriptions, and alert text

| Scale token | Family | Size | Weight | Line height (`--lh-*`) | Tracking |
|---|---|---|---|---|---|
| `display-64` | Geist | `64px` | 400 | `none` 1.0 | `-1.28px` |
| `display-44` | Geist | `44px` | 500 | `tight` 1.1 | `-1px` |
| `title-40` | Geist | `40px` | 500 | `tight` 1.1 | `-0.8px` |
| `title-32` | Geist | `32px` | 500 | `tight` 1.1 | `-0.6px` |
| `title-24` | Geist | `24px` | 500 | `snug` 1.2 | `-0.48px` |
| `label-15` | Geist | `15px` | 500 | `none` 1.0 | `-0.3px` |
| `label-14` | Geist | `14px` | 700 | `snug` 1.2 | normal |
| `body-16` | Inter | `16px` | 400 | `loose` 1.6 | normal |
| `body-14` | Inter | `14px` | 400 | `relaxed` 1.5 | normal |
| `caption-12` | Geist | `12px` | 500 | `normal` 1.3 | `0.05em` |

Each scale token is available as CSS custom properties in `_tokens.css`, for
example `--type-title-40-size`, `--type-title-40-weight`,
`--type-title-40-line-height`, and `--type-title-40-tracking`. Product usage
names such as page title, section label, and button label are role aliases
defined in Pillar 2 or component rules, not the primary naming model for
Foundation.

**Font-size scale (`--fs-*`)** — 2026-06-23 起全站 `font-size` 一律引用整數級 primitive token `--fs-11 … --fs-64`，共 15 級：

`11 · 12 · 13 · 14 · 15 · 16 · 18 · 22 · 24 · 28 · 32 · 40 · 44 · 56 · 64`（px）

舊有的零散半 px（12.5 / 13.5 / 11.5 …）已收斂為整數：`.5` 無條件捨去（12.5→12、13.5→13、14.5→14）、小於 11 的併入 11。上方 Foundation 的 `--type-*-size` 都改為指向這層，`--fs-*` 是字級的唯一來源。

**Weight scale (`--fw-*`)** — 2026-06-23 起全站 `font-weight` 一律引用 4 階 primitive：`--fw-regular 400 · --fw-medium 500 · --fw-semibold 600 · --fw-bold 700`（舊有 1 個 650 已併入 semibold）。`--type-*-weight` 也改為指向這層。

**Line-height scale (`--lh-*`)** — 2026-06-30 起把行距收成第 4 個原始字型維度（繼字體／字級／字重），全站 `line-height` 一律引用這 7 階 unitless primitive（命名對齊 shadcn/Tailwind 的 `leading-*`，數值為這套資料密集 UI 調得更緊的版本；`comfy` 為 2026-07-02 補的第 7 階）：

`none 1 · tight 1.1 · snug 1.2 · normal 1.3 · comfy 1.4 · relaxed 1.5 · loose 1.6`

上方各 `--type-*-line-height` 都改為指向這層（例：`--type-body-14-line-height: var(--lh-relaxed)`）。哪個 role 綁哪一階見 §2.2。role 層收斂（2026-06-30）：3 個標題 1.05→1.1、`label-14` 1.25→1.2，其餘原值不動。元件層收斂（2026-07-02）：70 處硬寫行距全轉 `var(--lh-*)`，其中 53 處值完全不變、17 處 ±0.05（1.35/1.45→1.4、1.05→1.1、1.15/1.25→1.2）；`fan-store.css` 因並行編輯暫未轉。

**Font families (`--font-*`)** — 四個家族：`--font-display` Geist（H1/display）· `--font-ui` Geist（H2–H4/UI）· `--font-body` Inter（內文）· `--font-mono` Geist Mono。每個 stack 末端接自架 `Noto Sans TC`（CJK fallback；繁中模式由 `:lang(zh-Hant)` 提到第一位）。base 宣告在 `_tokens.css`、Noto fallback 與 `@font-face` 在 `ds-components/fonts.css`。

Tight negative tracking (`-1.28px` on H1, `-0.8px` on H2) is the Geist signature.

### 1.3 Spacing — `--sp-*`

**px 直命名刻度（2026-07-02 起，數字＝px，與 `--fs-14`=14px 同邏輯）**，取自全庫實際 px 值統計（高頻在 12/10/8/16/14/6/4），20 階：

`--sp-2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 40 · 48 · 56 · 64 · 72 · 80 · 96`

元件的 `gap` / `padding` / `margin` 一律 `var(--sp-N)`（2026-07-02 已全面轉換 645+ 處，轉換採「值不變」驗證、零渲染變化；`fan-store.css` 因並行編輯中暫未轉，後續補）。**例外保留字面值**：奇數微調（1/3/5/7/9/11/13px，optical adjustment）、刻度外偶數（22/26px）、負值 margin、`calc()` 運算。

Section-level vertical rhythm is closer to `80–96px`. Card internal padding is typically `16–24px`. Footer uses `80px` vertical padding.

> 舊 `--space-1…16`（N×4 制、幾乎未被採用、缺 6/10/14/18）已於 2026-07-02 退役移除；`--space-shell-gutter` 屬 shell 幾何、保留。間距語意 role 層（component/layout 級別命名）仍未建立（見 §2.3）。

**Width — `--w-*`**（2026-07-10 起）— 欄位／小元件的 `max-width`（或 `flex-basis`）刻度家族，px 直命名、與 `--sp-*` 同邏輯，主題無關（只定義在 `:root`）。起點兩個值，後續依實際使用值按需擴充：

`--w-220 · 300`

用於窄欄位（如 create-product 的自訂低庫存門檻輸入、限購數量輸入、pickup session 下拉）的 `max-width` / `flex-basis`；元件寬度裸值一律改用 `var(--w-N)`。

### 1.4 Radius

| Token | Value | Where |
|---|---|---|
| `radius-button-primary` | `6px` | "Create project", "Request payout" |
| `radius-button-secondary` | `6px` | "Back" / "Cancel" outline CTA (`--radius-md` merged into `--radius`, Q2 2026-07-13) |
| `radius-card` | `6px` (cards) `– 8px` (dropdown panels, `--radius-lg`) | Cards, dropdown panels |
| `radius-input` | `6px` | Form fields |
| `radius-small` | `2–5px` | Inner sub-radii on nested components |
| `radius-card-feature` | `12px` | Feature / highlight cards |
| `radius-media` | `16px` | Embedded media / hero video container |
| `radius-quote-card` | `24px` | Editorial / callout card (IP hero) |
| `radius-pill` | `1000px / 100%` | Status dots, avatar circles, badge chips |

Ztor's radius system is **fine-grained subtle** at the chrome layer (6–8px buttons / inputs / nav cards) but **escalates sharply** at the editorial layer — `12px → 16px → 24px` are reserved for content surfaces (callouts, editorial cards, media). Then a clean leap to full pills for round elements.

### 1.5 Shadow

| Token | Value | Use |
|---|---|---|
| `shadow-micro` | `0 4px 4px rgba(23,23,23,0.04)` | Soft edge（outline 按鈕 2026-06-12 起改 1px `--border` 平面線框，不用此陰影；階梯外邊緣工具） |
| `shadow-card` | `0 2px 8px -1px rgba(12,10,9,0.05), 0 0 0 1px rgba(23,23,23,0.05)` | E2 resting card — multi-layer rim + drop（2026-07-13 柔化：更擴散、更低透明） |
| `shadow-float` | `0 8px 24px -8px rgba(12,10,9,0.08), 0 2px 6px -2px rgba(12,10,9,0.05), 0 0 0 1px rgba(23,23,23,0.05)` | E3 floating — dropdowns, popovers, tooltips, dragged rows（2026-07-13 柔化：更擴散、更低透明） |
| `shadow-overlay` | `0 16px 40px -8px rgba(12,10,9,0.18), 0 0 0 1px rgba(23,23,23,0.08)` | E4 overlay — modals, dialogs, drawers |
| `shadow-card-hover` | `var(--shadow-float)` | Clickable card hover lift = borrow E3 (interaction rises one rung) |
| `shadow-raise` | `0 1px 2px rgba(0,0,0,0.06)` (dark `0.5`) | Low control raise — primary buttons, input drop, segmented active |
| `shadow-raise-strong` | `0 1px 2px rgba(0,0,0,0.16)` (dark `0.6`) | Floating control — switch knob, chart marker drop |
| `shadow-hairline` | `0 0 0.833px rgba(0,0,0,0.2)` | Sub-pixel border simulation |
| `shadow-header` | `0 3px 16px rgba(0,0,0,0.10)` (dark `0.45`) | Sticky wizard header 下緣柔和投影（由 header 後內縮圓角色塊投出，只露下緣） |
| `shadow-seam` | `7px 0 20px -4px rgba(12,10,9,0.16)` (dark `0.6`) | 上層主面板向右蓋向相鄰下層（E-Shop 主面板疊在預覽上） |

**Pattern** — Ztor uses **multi-layer shadows to define edges without ever drawing a border**. The `inset 0 0 0 1px rgba()` ring is a soft outline; the `0 2px 6px rgba()` is the drop. Together they replace what most systems would draw as a `border: 1px solid var(--border)`. This remains the pattern for dropdowns / popovers / dialogs / overlays, input controls, and the hover state of clickable / selection cards. **Exception (2026-06-12)**: outline buttons draw a real `border: 1px solid var(--border)` — on the clean-white canvas (06-09) a fill-only edge disappears. **Exception extended (Q2–Q3, 2026-07-13)**: default cards (`.card` / `.kpi` / `.ztor-card`) moved to a real 1px `--border`; `--shadow-card` is reserved for clickable/selection-card hover and for surfaces that retain their own elevation (selection-card default, dropdown-item, table, composer, cookie-banner, radio-card).

**Edge & overlay tokens (2026-06-15)** — `--border-inverse` (`rgba(255,255,255,0.1)`, same in both themes) is the hairline on always-dark / inverse surfaces (footer slab). `--overlay-tint` (`rgba(0,0,0,0.45)`) is the darkening mixed into modal backdrops (`.payout-modal`, paired with `--overlay-blur`).

**Raw-color exceptions (acknowledged WARN)** — `check_ds_sync` flags bare colors in three components, all intentional fixed artwork:
- `upload-tile.css` video letterbox (`.upload-tile__video { background: #000 }`) — **irreducible**: media playback matte is pure black regardless of light/dark theme (standard video letterbox), same rationale as an embedded image; not a themeable surface.
- `selection-card.css` theme-picker swatches (`--theme-light` / `--theme-dark` / `--theme-system`) — **irreducible**: each swatch must paint the *actual* literal theme colors (`#FAFAF7` / `#ffa33f` / `#191A1A`) so the preview shows what each mode looks like even when viewing a different mode; can't reference theme-reactive tokens.
- `vip-card.css` VIP-card template (`.vip-card__frame` holographic gradients + `.vip-card__plate`/`__logo`/`__plate-sub` white/rgba) — the membership-card face is a **fixed, theme-independent artwork** (a CSS approximation of the platform template); its colors deliberately do not follow light/dark tokens, same rationale as an embedded illustration/image. Real template asset TBD.
- `fan-store.css` phone screen (`.fan-store__phone` scoped `--fst-*` dark neutrals + bezel/hero-gradient/fan-ring hexes) — the See-as-fan phone renders the **fan app's fixed-dark surface** (theme-independent, same rationale as vip-card): the fan app is its own product with its own dark theme, so the phone must not flip with the creator-backoffice light/dark toggle. Brand accent stays `var(--primary)`; rank-ring colors (#A78BFA/#4ADE80/#2DD4BF/#86EFAC) are fixed decorative rank hues (2026-07-02).

All other former ad-hoc shadow/border colors were tokenized on 2026-06-15 (`--shadow-raise` / `--shadow-raise-strong` / `--border-inverse` / `--overlay-tint`).

### 1.6 Motion

Durations sit in the `150–300ms` range with ease-out curves; `transition: all` is common on interactive elements. Entrance animations are gated behind `@media (prefers-reduced-motion: reduce)` and shown immediately when motion is reduced.

### 1.7 Iconography

**Lucide** icon set, registered in `icons.js` and injected per page via `ztorIcons.applyIcons()`. Thin 1.2px outlined glyphs as inline SVG (no icon font). Any new icon must be added to the registry before use.

**兩檔分工（刻意設計，勿合併）**：`js/icons.js`（~27KB，策展 89 顆）＝產品頁 registry，30 頁都載、保持輕量；`js/icons-all.js`（~365KB，完整 Lucide 1713 顆，自動生成）**只有 `design-system.html` 載**（供「未使用」icon 總覽瀏覽），且必須排在 `icons.js` 之前——`icons.js` 會把 `window.ZTOR_ICONS_ALL` 中缺的 key 併入 REGISTRY。產品頁要用新 icon 仍走「補進 `icons.js` registry」流程，不掛全集。

### 1.8 Theme mode

**Light + dark + system.** `<html data-theme="light|dark">` driven by `theme.js`, persisted in `localStorage["ztor.theme.preference"]`; `prefers-color-scheme` is followed when the preference is `system`. Toggle entry in the topbar (sun/moon cycle) + Settings → Appearance radio cards. The black footer is a deliberate hi-contrast slab in both modes. See Pillar 3 for the dark role overrides.

### 1.9 Grid / Layout

- Page container max-width 1248px, centered
- Page gutter 24px desktop, 16px mobile (`@media (max-width: 900px)`)
- Topbar height 64px, `sticky` top (canonical app topbar + hover dropdown nav)
- Section vertical rhythm 80–96px
- Dashboard leads with a full-bleed hero band; other pages open with a page-intro
- Footer 80px padding · pure black

### 1.10 Imagery

**Full-bleed photographic hero on the Dashboard**, with a centered radial veil so white copy holds ≥5:1 contrast over the image. Elsewhere imagery is functional: IP cover art, product thumbnails, creator avatars. Data is shown through the chart family (line / stacked-bar / rank-bars), not decorative illustration. No stock photography in chrome.

---

## Pillar 2 · Role (semantic assignments)

> Where Pillar 1 says "this hex is `#FFFFFF`", Pillar 2 says "the canvas background uses that hex." This layer is what Components reference.
>
> In `_tokens.css` these are CSS custom properties whose **names already encode the semantic role** (`--background`, `--foreground-muted`, `--primary`, `--status-success`). The raw values from Pillar 1 are substituted at the `:root` level.

本層分六類，與 `design-system.html` 對齊：**2.1 顏色 · 2.2 字體 · 2.3 間距 · 2.4 控件尺寸 · 2.5 陰影 · 2.6 跨元件規則**。這裡的值為**亮色**（角色預設）；深色覆寫只記在 Pillar 3。html 版每一類都有即時渲染。

### 2.1 Color Roles

亮色值；深色見 §3.1。`[ext]` = creator 擴充（shadcn 無此名）。

| Role | Token | Light value | References Pillar 1 |
|---|---|---|---|
| **Canvas** background | `--background` | `#FFFFFF` | clean white |
| **Surface** (cards, popovers, panels) | `--card` | `#FFFFFF` | pure white |
| **Rail** (sidebar display mode) | `--sidebar` | `#FBFBFB` | near-white neutral |
| **Surface — muted** (alt cards, hover) | `--muted` | `#FAFAFA` | softer than canvas |
| **Surface — inverse** (footer slab) | `--surface-inverse` | `#000000` | pure black |
| **Foreground — default** (body / titles) | `--foreground` | `#1A1A1A` | off-black（2026-07-13 體檢：純黑殺層次） |
| **Foreground — muted** (descriptions) | `--foreground-muted` | `#4D4D4D` | [ext] |
| **Foreground — subtle** (meta, eyebrow) | `--muted-foreground` | `#6E6E68` | 2026-07-13 微暖 |
| **Foreground — on inverse** (footer text) | `--foreground-on-inverse` | `#FFFFFF` | [ext] |
| **Primary — fill** (CTA bg) | `--primary` | `#ffa33f` | orange.500 |
| **Primary — hover** | `--primary-hover` | `#ffb866` | orange.300 [ext] |
| **Primary — foreground** (text on orange) | `--primary-foreground` | light `#FFFFFF` / dark `#171717` | 使用者指定 2026-06-22：白天白字、黑夜黑字（白字 ~1.9:1 < WCAG AA） |
| **Border** (hairlines) | `--border` | `#EAEAEA` | cooler neutral（2026-07-13 體檢：更淡，配微暖畫布靠色階分層） |
| **Ring** (focus outline) | `--ring` | `#ffa33f` | orange (=primary), by request 2026-06-02 |
| **Status — success** | `--status-success` | `#22C55E` | green.500 [ext] |
| **Status — error** | `--destructive` | `#DA314A` | red.500 |
| **Status — info** | `--status-info` | `#266DF0` | blue.500 [ext] |
| **Status — warning** (data dots only · NOT UI fill) | `--status-warning` | `#F8D749` | yellow-warning — visually close to `--primary`, reserved for dashboard status dots [ext] |
| **Status — accent** | `--status-accent` | `#8B5CF6` | purple — extra category hue [ext] |
| **Card — foreground** | `--card-foreground` | `#000000` | shadcn 對齊補的配對字色；元件現多直接用 `--foreground`（待採用） |
| **Popover** (dropdown / nav 浮層) | `--popover` / `--popover-foreground` | `#FFFFFF` / `#000000` | white tier；元件尚未改引用（待採用） |
| **Accent — foreground** | `--accent-foreground` | `#000000` | 配對字色（待採用） |
| **Destructive — foreground** | `--destructive-foreground` | `#FFFFFF` | 配對字色（待採用） |
| **Input** (控件邊) | `--input` | `#EAEAEA` | = border；元件現多直接用 `--border`（待採用） |
| **Charts** | `--chart-1..5` | 橘 `#ffa33f` · 藍 `#266DF0` · 綠 `#22C55E` · 黃 `#F8D749` · 紫 `#8B5CF6` | chart series；chart.js 尚未讀 token（待採用） |
| **Sidebar family** | `--sidebar-*`（`-foreground` / `-primary(-foreground)` / `-accent(-foreground)` / `-border` / `-ring` / `-active` [ext]） | `#FBFBFB` + 整組 | rail 一家；其中 `--sidebar-primary(-foreground)` / `--sidebar-ring` / `--sidebar-accent-foreground` 元件尚未引用（待採用） |
| **Brand gradient** | `--gradient-brand` | 橘漸層（#ffd9a0 · #ffa33f · #ff7a4d） | 進度條品牌漸層 [ext] |

**Naming aligns with shadcn/ui** (issue #11): semantic tokens use shadcn's vocabulary so shadcn code + AI map directly; names shadcn lacks are kept as `[ext]`. (Primary-reserved usage rule moved to §2.6.)

### 2.2 Typography Roles

| Role | Token | Stack | Used for |
|---|---|---|---|
| Display | `--font-display` | `'Geist', system-ui, sans-serif` | H1 / page intros / KPI values |
| UI | `--font-ui` | `'Geist', system-ui, sans-serif` | Buttons, nav, labels, badges, all chrome text |
| Body | `--font-body` | `'Inter', system-ui, sans-serif` | Long-form prose, alert descriptions |
| Mono | `--font-mono` | `'Geist Mono', ui-monospace, …` | Code, tabular figures, dev tags |
| CJK fallback | `--font-cjk` (inside all stacks) | `'Noto Sans TC'` | 繁中 mode (i18n.js) — self-hosted subset woff2 in `fonts/` |

Concrete typography usage is assigned as role aliases that point back to the
neutral §1.2 type scale. Each role resolves the four raw dimensions into one
decision — family · size · weight · **leading** · tracking — where **leading
binds to the `--lh-*` scale** (§1.2). This matrix is the standard; component CSS
references the role, never raw values (html 版另有每個角色的即時渲染):

| Usage role | ← Foundation | Family | Size | Weight | Leading (`--lh-*`) | Tracking |
|---|---|---|---|---|---|---|
| `--type-display-1-*` | `display-64` | Geist | 64 | 400 | `none` 1 | `-1.28px` |
| `--type-page-title-*` | `display-44` | Geist | 44 | 500 | `tight` 1.1 | `-1px` |
| `--type-h2-*` | `title-40` | Geist | 40 | 500 | `tight` 1.1 | `-0.8px` |
| `--type-h3-*` | `title-32` | Geist | 32 | 500 | `tight` 1.1 | `-0.6px` |
| `--type-h4-*` | `title-24` | Geist | 24 | 500 | `snug` 1.2 | `-0.48px` |
| `--type-section-label-*` | `label-14` | Geist | 14 | 700 | `snug` 1.2 | normal |
| `--type-button-label-*` | `label-15` | Geist | 15 | 500 | `none` 1 | `-0.3px` |
| `--type-body-lg-*` | `body-16` | Inter | 16 | 400 | `loose` 1.6 | normal |
| `--type-body-*` | `body-14` | Inter | 14 | 400 | `relaxed` 1.5 | normal |
| `--type-caption-*` | `caption-12` | Geist | 12 | 500 | `normal` 1.3 | `0.05em` |

### 2.3 Spacing

間距自 2026-07-02 起走 Pillar 1 的 `--sp-*` px 直命名刻度（見 §1.3），元件 `gap` / `padding` / `margin` 直接引用 primitive——與字級直接用 `--fs-*` 同一模式。

- **語意 role 層（component/layout 級別命名）仍未建立**：這是誠實現況，不是缺陷宣稱；等有真實一致的用途分群再命名，不預先杜撰（先前虛構的 `--gap-tight/default/section/page` 已於 2026-06-30 移除，教訓見 anti-patterns #11）。
- 例外保留字面值：奇數微調（1/3/5/7/9/11/13px）、刻度外偶數（22/26px）、負值、`calc()`；`fan-store.css` 因並行編輯暫未轉換。

### 2.4 Control sizes

按鈕與表單控件共用一套高度級（全部 4 的倍數），同尺寸的 input 與 button 對齊。高度一律走 `--control-h-*`，不寫死。

| Token | Height | Use |
|---|---|---|
| `--control-h-xs` | 28px | compact toolbar (optional) |
| `--control-h-sm` | 36px | dense forms / inline |
| `--control-h-md` | **44px** | **default** — button / input / select |
| `--control-h-lg` | 52px | prominent CTA |
| `--control-h-xl` | 60px | hero CTA (optional) |

### 2.5 Elevation

E0–E4 海拔階梯（見 Pillar 1 §1.5）：一元件一階、互動借上一階、同層分隔不用陰影（用 hairline／surface 色階）、越高越大而淡。

| Rung | Token | Used for |
|---|---|---|
| E0 貼底 | `--shadow-hairline` | No lift — page / rails / table rows; hairline is an edge, not elevation |
| E1 微浮 | `--shadow-raise` / `-strong` | Buttons, inputs, segmented, switch knob |
| E2 卡片 | `--shadow-card` | Selection card, dropdown-item, table, composer, cookie-banner, radio-card — surfaces this rung still applies to at rest. **Not** `.card` / `.kpi` / `.ztor-card` (Q3 2026-07-13: those default to 1px `--border`, no shadow) |
| E3 懸浮 | `--shadow-float` | Dropdowns, popovers, tooltips, dragged rows; `--shadow-card-hover` aliases here (also the hover rung for `.ztor-card--clickable` / `.selection-card`) |
| E4 覆蓋 | `--shadow-overlay` | Modals, dialogs, drawers (above the scrim) |

Content surfaces top out at E2. Edge utilities（`--shadow-micro` / `--shadow-seam` / `--shadow-header`）屬方向性分隔手法、不在階梯內。Hero is the only deeply-shadowed surface and it does it via gradient overlay, not box-shadow.

### 2.6 Cross-component rules

Principles every component obeys (not a token scale; html 版各附 live 示例):

- **Focus**：全控件、兩模式單一配方 — `outline: 2px solid var(--ring); outline-offset: 2px`（清單列用 `-2px` 內嵌）。不再各元件 `outline`／`box-shadow` 各寫各的。
- **Surface-layer contrast**：元件靠「填色／邊框／陰影跟所在那層的對比」被看見，**填色和背景同色就會消失**。白填要靠 1px 邊框在白底成形；跨層安全用實線 border，別用填色當邊或純陰影當邊。做任何有填色的元件，在**最深**那層目視驗證（按鈕白/灰底實例見 §4.2）。
- **Reserved — `--primary`**：橘色**只**用於主要 CTA + 便利貼 + 品牌標記 + hero 強調。絕不用在 nav active、KPI 高亮或狀態 pill——那些用 `--muted`/`--accent`。

---

## Pillar 3 · Mode (dark / system overrides)

> Mode only encodes **differences from Role**. Light mode IS the Role defaults; dark mode overrides selected tokens.
>
> Activation: `[data-theme="dark"]` on `<html>` (driven by `theme.js`; persists in `localStorage["ztor.theme.preference"]`). Three preferences supported: `light` / `dark` / `system`.

### 3.1 Dark mode role overrides

| Role | Light | Dark | Notes |
|---|---|---|---|
| `--background` | `#FFFFFF` | `#191A1A` | white canvas (light) · content-level body bg (dark；與 `--surface-page` 同階，2026-06-22) |
| `--card` | `#FFFFFF` | `rgba(253,253,253,0.10)` | **translucent overlay**, not opaque grey |
| `--muted` | `#FAFAFA` | `rgba(253,253,253,0.06)` | lower elevation overlay |
| `--surface-inverse` | `#000000` | `#000000` | footer slab。Dark 改純黑（content 為 `#191A1A`，footer 要更深才讀為分隔） |
| `--surface-page` | `#FAFAFA` | `#191A1A` | route page。Light 於 2026-07-14 降低明度；**Dark 反轉**：content 是最深底色，比 app shell 更深、視覺上內凹（2026-06-22 依使用者指定 `#191A1A`） |
| `--surface-shell` | `#F0F0EE` | `#2B2B2C` | sidebar-mode app shell（rail＋canvas）。Light 於 2026-07-14 再降一階；Dark 用較淺的 `#2B2B2C`，襯托更深的 content（2026-06-22 依使用者指定） |
| `--sidebar` | `#FBFBFB` | `#2B2B2C` | sidebar rail 與 shell canvas 同色（flush）；項目區分靠 hover/active 疊色 |
| `--foreground` | `#1A1A1A` | `#FDFDFD` | 2026-07-13 light 改 off-black（原 `#000000`） |
| `--foreground-muted` | `rgba(0,0,0,0.7)` | `rgba(253,253,253,0.7)` | |
| `--muted-foreground` | `#6E6E68` | `rgba(253,253,253,0.4)` | 2026-07-13 light 微暖（原 `#737373`） |
| `--primary` | `#ffa33f` | `#ffa33f` | **orange stays** — paired across modes for brand consistency |
| `--border` | `#EAEAEA` | `rgba(253,253,253,0.12)` | inverted hairline · 2026-07-13 light 更淡（原 `#E5E5E5`） |
| `--ring` | `#ffa33f` | `#FDFDFD` | light: orange focus ring (by request); dark: white ring |
| `--status-success` | `#22C55E` | `#4ADE80` | pure-RGB green for dark（2026-07-13 體檢提亮，原 `#00A63E`） |
| `--destructive` | `#DA314A` | `#E7000B` | pure-RGB red for dark |
| `--status-info` | `#266DF0` | `#5896F3` | lighter blue for dark contrast |
| `--status-warning` | `#F8D749` | `#F3CF58` | slightly cooler yellow |
| `--shadow-card` | rim + drop on white | drop only on dark | white hairline rim inverted |
| `--shadow-float` / `--shadow-overlay` | soft dark drop | stronger alpha (0.5 / 0.6) + white rim (0.10 / 0.12) | 深底陰影失效，提高濃度＋亮框補輪廓 |

### 3.2 Translucent surface pitfall

Because `--card` is translucent in dark mode, any panel that floats **on top of content** (dropdown menus, slide-over panels, modals) bleeds the content behind it unless it frosts that background. This is governed in **one place**, not per-component: the `--overlay-blur` token (`blur(14px) saturate(140%)`) plus a centralized rule in `_tokens.css` that applies `backdrop-filter` to every floating surface together — `.dropdown__menu`, `.preview-panel__sheet`, `.payout-dialog`, and `.app-topbar__dropdown`.

**新增浮層** 只要加 class `.overlay-surface`（或把選擇器列進 `_tokens.css` 那條集中規則），就自動吃毛玻璃，不必各自硬寫 `backdrop-filter`。亮色模式 `--card` 不透明，blur 自動無作用。需要完全不透明（不要毛玻璃）的浮層才改用 `var(--background)`。（2026-06-12 從「只有 `.app-topbar__dropdown` 自己解」收斂為全域治理；舊的硬寫 `blur(14px) saturate(140%)` 已改引 `--overlay-blur`。）

### 3.3 High-contrast mode

Not implemented. Browser-level forced-colors will fall through to defaults; semantic role names degrade gracefully (no hex-only hacks).

---

## Pillar 4 · Component

> **Renamed from §2 Components.** Components reference Pillar 2 Role tokens (not raw Pillar 1 palette). Importable base components live in [`ds-components/{name}.css`](./ds-components/). Product-owned components that are reused but not yet split into standalone CSS are explicitly registered as `shared.css` owned.

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

| Layer | Definition | R 2.1 examples |
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
| R 2.1 example | Alert organism (§4.13) | "Dashboard-as-hero" layout pattern (§5.1) |

**Status tags (orthogonal to layer):**

- **✓ App** — R 2.1 has custom code in `ds-components/*.css`
- **🟡 Variant** — Same primitive, different config (e.g., Button Primary vs Button Outline)
- **◎ Default** — shadcn baseline used unchanged
- **◎ Composition** — Pattern listed but not promoted to full sub-section

### 4.1 Inventory

Rows are split by source ownership. `ds-components/` rows are independently importable; `shared.css` rows are real product components reused today but not yet split into one-file CSS. `_layer` tags each unit's size (🟢 atom / 🟡 molecule / 🟠 organism); it is orthogonal to `variant`.

| Component | `_layer` | Status | Where seen (Ztor Creator Studio) | CSS |
|---|---|---|---|---|
| Button | 🟢 atom | ✓ App | Primary CTAs, wizard action bar, header actions (primary / outline / ghost) | [button.css](./ds-components/button.css) |
| Badge / Status pill | 🟢 atom | ✓ App | Dashboard / Earnings / Payouts + category chips — flat soft-tag look (no dot/ring), variants orange / success / error / info / warning / accent (purple) / neutral。`--inline`：接在標題文字後的安靜限定詞（regular 字重、middle 對齊、左 6px），如清單「4 variants／限量」、訂單「Limit 2/person」 | [badge.css](./ds-components/badge.css) |
| Status dot | 🟢 atom | ✓ App | Dashboard status / source dots | [badge.css](./ds-components/badge.css) |
| Chip | 🟢 atom | ✓ App | Earnings transactions filter, Tax year filter, supported regions | [chip.css](./ds-components/chip.css) |
| Switch | 🟢 atom | ✓ App | Settings notifications, E-Shop visibility, My IP marketplace, Earnings auto-payout | [switch.css](./ds-components/switch.css) |
| Info banner | 🟢 atom | ✓ App | Contextual explanations (timing, region note, legal hint) | [info-banner.css](./ds-components/info-banner.css) |
| Upload tile | 🟢 atom | ✓ App | Create-flow upload slots（hero／thumbs／file drop，Add new item）；opt-in 互動上傳（`[data-upload]`＋`partials/upload-tile.js`）：選圖→假進度→hover 替換/AI 優化/刪除 | [upload-tile.css](./ds-components/upload-tile.css) |
| Album tracks | 🟠 organism | ✓ App | 數位「音樂專輯（Album）」多曲目管理（spec 5.1.5.2 §4.2 F11.1）：上傳 mp3/mp4→逐曲列（`.album-track`：`__grip`/`__cover`/`__main`(`__name`/`__meta`/`__bar`/`__lyrics`)/`.dropdown.album-track__menu`）；拖曳重排、改名(inline)、換封面、上傳歌詞(音訊限定→View Lyrics)、刪除；上傳中 `.is-uploading`。`partials/album-tracks.js` 增強、emit `albumtracks:change`；逐列選單重用 dropdown-menu.css。呈現層 demo（假上傳/歌詞） | [album-tracks.css](./ds-components/album-tracks.css) |
| VIP card | 🟠 organism | ✓ App | 數位「會員卡（Membership / VIP card）」卡面自訂（spec 5.1.5.2 §4.2 F11.2）：`.vip-card`[data-vip-card]＞`__settings`（`.segmented.radio-cards` Text/Image＋`.input`名稱／`.upload-tile` logo）＋`__preview`（`__frame`公版場景＞`__plate`霧面卡＞`__logo`/`__logo-img`/`__plate-sub`）。Text→文字合成、Image→PNG logo 合成；`.vip-card--image` 切模式。`partials/vip-card.js` 綁定、emit `vipcard:change`。公版為 CSS 近似固定藝術（frame 漸層裸色＝記錄在案例外，見下）。呈現層 demo | [vip-card.css](./ds-components/vip-card.css) |
| Input | 🟢 atom | ✓ App | Wizard fields, settings forms, search | [input.css](./ds-components/input.css) |
| Icon | 🟢 atom | ✓ App | Every glyph — buttons, nav, alerts, data rows (full Lucide set in `icons-all.js`; 38 in use, rest registered) | [icon.css](./ds-components/icon.css) · [icons.js](./icons.js) · [icons-all.js](./icons-all.js) |
| NavigationMenu | 🟡 molecule | ✓ App | Nav item + mega dropdowns (IP Bank / E-Shop); sidebar mode renders these as expandable `.app-sidebar__group`（accordion，現役）。另有 **section-label 變體**（`.app-sidebar__section-label` ＋子項平鋪）保留在 CSS、可切回 | [header.css](./ds-components/header.css) |
| Card | 🟡 molecule | ✓ App | Section wrappers w/ head row across all product pages | [card.css](./ds-components/card.css) |
| KPI | 🟡 molecule | ✓ App | Dashboard summary, Earnings tabs, page KPI rows (headline metric set in display size, not colour)。變體：`--compact`（去 min-height、內距收小，側欄/摘要用，如商品細節頁 Sales summary） | [kpi.css](./ds-components/kpi.css) |
| Admin IP Bank table | 🟠 organism | ✓ SiteSpecific | Admin IP Bank 與 Reporting 的 Film／Owner 分配表與報表篩選列；共用 token-driven table wrapper、owner identity 與日期範圍操作列 | [admin-ip-bank-table.css](./ds-components/admin-ip-bank-table.css) |
| Alert | 🟡 molecule | ✓ App | Dashboard alerts panel (`--card`) + inline page warnings (`--row`) + page announcement (`--banner`) + notification bar (`--bar` — rounded + shadow, flush in E-Shop low-stock F2) | [alert.css](./ds-components/alert.css) |
| Accordion | 🟡 molecule | ✓ App | Collapsible sections (chevron-rotate, height transition) | [accordion.css](./ds-components/accordion.css) |
| Tabs | 🟡 molecule | ✓ App | Earnings 4 tabs, E-Shop product types (`--brand` soft-orange pill; type-switch row uses `--underline-short` for the divider-off, shortened active underline), Projects status, Fans CRM views | [tabs.css](./ds-components/tabs.css) |
| Filter tabs | 🟡 molecule | ✓ App | Secondary status filter pills with live counts, row below the primary tabs (E-Shop F3). Base = grey-muted active (orders, auction-detail); `.filter-tabs--brand` = soft-orange active + orange/bubble-less counts (E-Shop, paired with underline type tabs) | [filter-tabs.css](./ds-components/filter-tabs.css) |
| Cookie banner | 🟡 molecule | ✓ App | Dismissible consent pill, bottom-right | [cookie-banner.css](./ds-components/cookie-banner.css) |
| Empty stub | 🟡 molecule | ✓ App | Routes not yet built (orange mark + display title + spec refs) | [empty-stub.css](./ds-components/empty-stub.css) |
| Selection card | 🟡 molecule | ✓ App | Wizard radio cards (3 wizards) + Settings theme picker + display-mode picker | [selection-card.css](./ds-components/selection-card.css) |
| Composer | 🟡 molecule | ✓ App | Drop / type card + bottom action bar (tool icons · credit meter · circular send) | [composer.css](./ds-components/composer.css) |
| Dropdown menu | 🟡 molecule | ✓ App | Action menu (details/summary); trigger = any Button — primary "＋ New" or a `btn--icon` kebab (E-Shop product-row actions). Items `<a>` (navigate) or `<button>` (run JS); outside-click / select-to-close needs page JS。變體：`--toggle`（選單內開關列＝menuitemcheckbox，左短標籤＋右 switch，配 data-keep-open；E-Shop 列「在商店上架」）／`--danger`（破壞性動作紅字 ghost，如草稿列「刪除」） | [dropdown-menu.css](./ds-components/dropdown-menu.css) |
| Header (topbar) | 🟠 organism | ✓ App | All pages — canonical 64px app topbar (`.app-topbar`, injected by `sidebar.js`); hover mega-dropdown nav + action cluster | [header.css](./ds-components/header.css) |
| Global nav · sidebar mode | 🟠 organism | ✓ App | Display-mode alternative to the topbar (spec §6.9 / D016): 248px left rail (`.app-sidebar`, same `sidebar.js`) sits on `--surface-shell`; dropdowns → expandable groups（`.app-sidebar__group`，accordion，現役）。另保留 **section-label 變體**（`.app-sidebar__section-label` ＋子項平鋪）可切回。Driven by `data-nav-mode` (theme.js) | [shared.css](./shared.css) · [sidebar.js](./sidebar.js) |
| Admin-layer nav · Tier 0/1 | 🟠 organism | ✓ App | Platform-operator (Admin) variant of the topbar (spec §4.1 / D086): roster page shows a "Creator Management" marker + locked Tier-1 items (`.app-topbar__link--locked`); inside a creator workspace, a back-to-roster icon (`.app-topbar__back`) sits **before** the logo + "Managing &lt;creator&gt;" chip (`.app-topbar__context`). Active creator held in `window.ztorCreator` (localStorage `ztor.activeCreator`); switched via devtools "Creator · Admin" cheat code. Used by `creators.html` (Tier 0) and every Tier-1 page | [shared.css](./shared.css) · [sidebar.js](./sidebar.js) |
| Footer | 🟠 organism | ✓ App | Black hi-contrast footer slab | [footer.css](./ds-components/footer.css) |
| Data list | 🟠 organism | ✓ App | Recent earnings, transactions, payouts, products, projects (row-divider) | [data-list.css](./ds-components/data-list.css) |
| Picker | 🟠 organism | ✓ App | Search + scrollable pick-list（Create bundle items、IP linker） | [picker.css](./ds-components/picker.css) |
| Field pill | 🟡 molecule | ✓ App | Inline filter pill — search / select / dropdown-trigger | [field-pill.css](./ds-components/field-pill.css) |
| Search (collapsible) | 🟡 molecule | ✓ App | 收合於工具列的搜尋：平常只見放大鏡、點擊滑開成 field-pill（重用 field-pill、不重造輸入）；`.is-open` 由頁面切換、支援 reduced-motion。E-Shop F3 | [search-collapse.css](./ds-components/search-collapse.css) |
| Search collapse | 🟡 molecule | ✓ App | 工具列收合式搜尋（電子商店 F3）：收合只見放大鏡、`.is-open` 滑開成 `.field-pill`（內層重用 field-pill）；`.search-collapse__toggle`/`__field`/`__close`；開合由頁面 JS 切換、respects reduced-motion | [search-collapse.css](./ds-components/search-collapse.css) |
| Segmented | 🟡 molecule | ✓ App | 2/3-way text toggle, white-raised active | [segmented.css](./ds-components/segmented.css) |
| Amount field | 🟡 molecule | ✓ App | money input with a unit-prefix toggle (cash $ / POPCORN 🍿) or static read-only symbol; built on Input; host shares one unit state so switching any price field updates all（create-product 定價單位 · spec 5.1.5.2 F3.2 / D127）。`[data-price-sync]` marks a field as a member of the shared-unit group and fixes the affix to a 46px centered column; `[data-amount-unit]` is the click hook on the affix `<button>` that page JS uses to toggle $ / 🍿 across the group。**Suffix mode**（2026-07-11）：`.amount-field--suffix` 把 `__unit` 移到右側（如 `50 [%]`、`6 [mo]`），搭 `--readonly` 給靜態非互動後綴（register-ip.html 版稅 % / 最短租期、bundle-detail.html 折扣 %）；input 內距改讓右邊。**Hero size**：`.amount-field--hero` 是彈窗主角級大尺寸（70px 高／32px display 字），視覺基準原 `payout-modal.css` 的 `.payout-amount-wrap`／`.payout-amount-prefix`／`.input.payout-amount-input`；2026-07-11 起 `partials/payout-request-modal.js` 已改用本變體，`payout-modal.css` 的舊規則已移除（留 tombstone 註解指回本檔）；`height:70px`／`padding-left:42px` 無對應 `--sp-N` 級距，記錄為 token 例外，其餘值皆走 token（`--fs-28`/`--fs-32`/`--sp-16`） | [amount-field.css](./ds-components/amount-field.css) |
| Review row | 🟡 molecule | ✓ App | 流程 Review 步驟摘要列（無卡片、hairline 分隔）：欄位名＋值＋右側 Edit →。正規化自 create-event.html `.ce-review-row`、register-ip.html `.ri-summary`、create-project.html Review 步驟的扁平化 `.card`（該頁 2026-06-25 註解已預告「這批歸第三批 review-row」）。詳見 §4.49 | [review-row.css](./ds-components/review-row.css) |
| Preview card | 🟡 molecule | ✓ App | 粉絲端即時預覽卡（商品／拍賣，§5.2.5） | [preview-card.css](./ds-components/preview-card.css) |
| Preview column | 🟡 molecule | ✓ Project | 建立流程「表單｜預覽」兩欄版面＋右側 sticky 預覽欄（標題＋灰副標＋Preview card）；取代滑出式 Preview panel | [preview-column.css](./ds-components/preview-column.css) |
| Preview panel | 🟠 organism | ✓ App | 右側畫面分割面板承載即時預覽——壓窄 wizard、非浮層（§5.2.5） | [preview-panel.css](./ds-components/preview-panel.css) |
| Fan store preview | 🟠 organism | ✓ App | See-as-fan 內的粉絲端店面（E-Shop F5＋商店設定 F1 共用 `partials/fan-store.js`，§6.7 同源），**2026-07-02 改呈現為深色手機**（`.fan-store__phone`＞`__screen` 自捲動；版型參考 endgame creator 商店手機版，僅視覺證據）：app 頂列＋hero（名字壓深色漸層＋社群＋加入社群）＋sticky app 分頁列＋本月精選＋商品/組合/拍賣底線子分頁＋雙欄商品格（購物車圓鈕）＋頭號粉絲＋關於＋sticky 底部 app 導航。螢幕＝fan app 固定深色面（scoped `--fst-*`，主題例外見 §1.5；accent＝`var(--primary)`）。追蹤數/社群/加入社群/精選/立即購買/補貨中/app 分頁列/頭號粉絲/關於/購物車/底部導航為提案欄位（ASSUMPTIONS UIA-026） | [fan-store.css](./ds-components/fan-store.css) |
| Pickup management | 🟠 organism | SiteSpecific | 現場 QR 核銷工作區（spec 5.1.5.11 · D111），E-Shop 下與訂單管理並列。`.scanner-access`（F6：`__qr`/`__main`/`__label`/`__url`/`__actions`/`__pw`）＋`.qr-box`(`--lg`/`--disabled`，faux QR via `window.ztorFauxQr()`)＋`.pickup-detail__header`/`__meta`＋`.pickup-stats`＋`.pickup-select`＞`.pickup-select__row`(`.is-checked`·`__box`/`__img`/`__text`)。場次清單／可核銷項目／名單／核銷紀錄重用 `.data-list`。共用建立場次 popup＝`partials/pickup-session-modal.js`（F3，亦掛 create-product.html／product-detail.html）。camera 視窗用 `--surface-inverse` role token、無裸色 | [pickup.css](./ds-components/pickup.css) |
| Mobile scanner | 🟠 organism | SiteSpecific | 獨立手機 scanner（spec 5.1.5.11 F7 · D111）——獨立 URL、無主工作台導航。`.scanner-page`＞`.scanner-frame`＞`.scanner-top`＋`.scanner-screen`（`.scanner-pw` 密碼閘／`.scanner-cam`(`__reticle`/`__line` 掃描動畫，respects `prefers-reduced-motion`)／`.scanner-result`(`__banner --ok/--warn/--bad`/`__rows`)）＋`.scanner-foot`。相機視窗＝`--surface-inverse` role token（theme-independent、非裸色）。`scanner.html` inline controller | [scanner.css](./ds-components/scanner.css) |
| Readiness card | 🟡 molecule | ✓ App | 上架前就緒檢查＋還差幾項 banner。footer 變體：`__chip`（貼 footer 主動作的就緒指示 chip，`--ready` 轉綠）＋`__pop`（hover/focus 浮出完整 readiness 卡當 tooltip）；create-product footer 用（create-campaign 另有自身 pill 變體，待後續收斂） | [readiness.css](./ds-components/readiness.css) |
| Empty card | 🟡 molecule | ✓ App | 卡片內「已載入但無資料」空狀態 | [empty-card.css](./ds-components/empty-card.css) |
| Notification matrix | 🟠 organism | ✓ App | 事件×管道逐格開關矩陣（含鎖定通道） | [notification-matrix.css](./ds-components/notification-matrix.css) |
| Completeness meter | 🟡 molecule | ✓ App | label＋x/y＋進度條（素材包完整度） | [completeness.css](./ds-components/completeness.css) |
| Insight row | 🟡 molecule | ✓ App | 圖表下單行自動洞察（無洞察隱藏） | [insight-row.css](./ds-components/insight-row.css) |
| List footer | 🟡 molecule | ✓ App | 清單分頁頁尾（Showing N of M＋Load more）。變體：`--center`（Load more 置中＋加大上下留白，E-Shop F4 分批載入）。`[hidden]` 已顯式歸零（蓋 display:flex） | [list-footer.css](./ds-components/list-footer.css) |
| Message composer | 🟠 organism | ✓ App | 群發撰寫 modal（Compose＋History） | [message-modal.css](./ds-components/message-modal.css) |
| Char counter | 🟡 molecule | ✓ App | 限長輸入即時字數 | [message-modal.css](./ds-components/message-modal.css) |
| Token chip | 🟡 molecule | ✓ App | 點擊插入個人化變數 | [message-modal.css](./ds-components/message-modal.css) |
| Event preview card | 🟡 molecule | ✓ App | 建立活動粉絲視角活動卡（即時預覽） | [event-preview-card.css](./ds-components/event-preview-card.css) |
| Product list | 🟠 organism | ✓ App | E-Shop inventory table: product identity + status + stock + visibility + edit action, borderless row-divider layout。變體：`--eshop`/`--bundles`/`--auctions` 欄位版型；拖曳握把 `__drag`（grip，抓它才重排）＋抬起態 `.product-list__row.is-dragging`（抬升陰影＋置頂，僅 --eshop Products 分頁；跟手 transform 由頁面 JS 控制）。草稿列（`[data-status="draft"]`）握把隱藏、不可拖曳（無粉絲端陳列順序），頁面 JS 置頂 | [product-list.css](./ds-components/product-list.css) |
| Project list | 🟠 organism | ✓ App | Projects table: project identity + type + status + to-do hint + detail action, borderless row-divider layout | [project-list.css](./ds-components/project-list.css) |
| Table | 🟠 organism | ✓ App | Earnings transactions 9-col table | [table.css](./ds-components/table.css) |
| Chart | 🟠 organism | ✓ App | Linechart (Dashboard / Earnings trends) + stacked-bar + source-list legend + rank-bars | [chart.css](./ds-components/chart.css) |
| Earnings waterfall | 🟡 molecule | ✓ App | Earnings · Breakdown (spec §5.1.8 F12) — statement-style gross revenue → net profit pool ledger (bars on milestones, deductions plain indented rows); also reused for the F11 per-project profit ladder and F7 transaction mini-ladder | [waterfall.css](./ds-components/waterfall.css) |
| Bento grid | 🟠 organism | ✓ App | 12-col responsive grid · KPI rows, dashboard pairs, settings layouts | [bento.css](./ds-components/bento.css) |
| Payout picker & dialog | 🟠 organism | ✓ App | Earnings · Payouts bank picker card grid + request-payout modal (legacy dialog shell, predates Modal). `--embed` variant (2026-06-17) is a near-fullscreen, head/foot-less shell that hosts a whole page in an iframe — used by Create bundle's "New item" → `create-product.html?embed=1` popup | [payout-modal.css](./ds-components/payout-modal.css) |
| Restock order (lines) | 🟡 molecule | ✓ App | E-Shop restock popup (spec §5.1.5.6, D104 order + D106 member tabs) — document layer (method + supplier/ETA/notes) + item quantity lines (`.restock-lines` / `.restock-line`); product variants = matrix (2-option grouped), bundle members = Tabs (one `.tab-panel` each); reuses payout shell + Segmented + Tabs + Data-list (history) | [restock-modal.css](./ds-components/restock-modal.css) |
| Store settings page | 🟠 organism | ✓ SiteSpecific | E-Shop 商店層級設定 popup（`store-settings.html`，D035/D067，由 E-Shop F3 embed-modal 開啟、無頁首）：店面門面常駐（Base44/FB 式身分帶 `.ss-identity-card`/`.ss-band__*` + 逐欄就地編輯 `.ss-edit`）+ 商品陳列/付款/出貨 tab 群組 + 底部提交列 `.ss-actionbar` + See-as-fan 畫面分割預覽；含 `.ss-url`/`.amount-field`/`.ss-status`/`.ss-order`/`.ss-fan` | [store-settings.css](./ds-components/store-settings.css) |
| Variant builder | 🟠 organism | ✓ App | 建立商品多規格（spec 5.1.5.2 §4.1④，僅實體）：`.segmented` 切單一/多規格 + `.variant-option`（選項名＋值 chip）+ `.variant-table`（逐規格價格/庫存/SKU/成本，`.--limited` 多出上限欄、`.is-excluded` 排除組合）；值 chip 重用 `.chip--removable`、格重用 `.input` | [variant-builder.css](./ds-components/variant-builder.css) |
| Tag input | 🟡 molecule | ✓ App | 建立商品商品標籤（spec 5.1.5.2 §4.5）：`.tag-input__field` 內已選/自建標籤（`.chip--removable`）＋無框輸入 `.tag-input__entry`＋建議 `.chip-group`；組合自 chip，可重用於專案/粉絲標籤 | [tag-input.css](./ds-components/tag-input.css) |
| Status axes | 🟡 molecule | ✓ App | 訂單兩條獨立狀態軸（spec 5.1.5.3.1 §2.2 / PCR-001）：履約 vs 付款·結算，不併成單一 badge。`.status-axes`＝清單列並排 badge；`.status-axes--labeled`＞`.status-axis`＞`.status-axis__label`＝詳情頁首大寫標籤堆疊。用於 orders/order-detail | [status-axes.css](./ds-components/status-axes.css) |
| Embed modal | 🟠 organism | ✓ App | 全螢幕 popup 以 iframe 內嵌另一頁、就地開啟（spec 5.1.5 F3 / D065）：電子商店「商店設定」開 `store-settings.html` popup，不離開清單。`.embed-modal`＞`__sheet`＞`__head`(`__title`/`__close`)＋`__frame`(iframe)；lazy 設 src、Esc/backdrop/× 關閉 | [embed-modal.css](./ds-components/embed-modal.css) |
| Leave dialog | 🟠 organism | ✓ App | 建立／編輯流程的返回離開確認彈窗（spec §5.2.4），由 `partials/wizard-chrome.js` 注入、6 建立頁共用。兩態同殼：有未存編輯→問儲存（儲存並離開 primary／不儲存就離開 outline）；未編輯→純離開（離開 primary）。`.leave-dialog`[data-open]＞`__scrim`＋`__card`＞`__close`/`__title`/`__body`/`__actions`（堆疊滿寬 btn）；Esc/scrim/× 取消。2026-06-29 自 shared.css `.wizard-leave*` promote | [leave-dialog.css](./ds-components/leave-dialog.css) |
| Spec row | 🟡 molecule | ✓ App | 可重複的詳細規格列（spec 5.1.5.2 §4.1② 建立商品／5.1.5.1 §2.3 商品細節）：`.spec-row`（grid 1fr 1fr auto）＞規格名稱 `.input`＋規格值 `.input`＋行尾 `.btn--icon` 刪除；多筆垂直堆疊，＋ 新增規格加空列。2026-06-29 自 create-product 內聯 `.cp-spec-row` promote、product-detail（D095）共用 | [spec-row.css](./ds-components/spec-row.css) |
| Split button | 🟡 molecule | ✓ App | 主操作＋箭頭下拉相關動作（spec 5.1.5 F3 / D066，ref. Add Event ▾）：電子商店 F3「建立」context-aware（主鈕隨 tab：商品/組合/拍賣），箭頭一律列全部類型。`.split-button`＞`__main`(左圓角)＋`.dropdown`＞`__caret`(右圓角、細線相連)；組合 btn＋dropdown-menu | [split-button.css](./ds-components/split-button.css) |
| New product post | 🟠 organism | ✓ App | 建立商品後在電子商店清單彈出的撰寫彈窗（spec 5.1.5.7 / D068）：重用群發撰寫器（受眾·標題≤120·內文≤2000·token·排程，message-modal.css）＋ payout dialog 外殼，本檔只加 F2 商品附件卡 `.npp-product`＋略過路徑；`?posted=1` 由 e-shop 開啟。組合 payout-modal＋message-modal | [product-post-modal.css](./ds-components/product-post-modal.css) |
| App shell | 🟠 organism | ✓ Project | Global page frame: `.app` + `.main` + `.page`. Sidebar mode makes `.main` one continuous `--surface-page` sheet on `--surface-shell`, with a 16px top gap and 28px top-left corner | [shared.css](./shared.css) |
| Page intro | 🟡 molecule | ✓ Project | Product page H1 + sub + optional actions; eyebrow retired | [page-intro.css](./ds-components/page-intro.css) |
| Field system | 🟡 molecule | ✓ Project | ONE form field = label / hint / control slot（控件重用 atom）；多欄位怎麼成組、堆疊＝Pillar 5 · Form assembly，非本元件。單獨與 Form section 內皆維持基礎密度 gap 6／欄距 16；產品建立頁同樣遵守此節奏 | [field-system.css](./ds-components/field-system.css) · [input.css](./ds-components/input.css) |
| Form section | 🟠 organism | ✓ Project | No-card section skeleton (title + sub + top divider + spacing) for create / wizard flows; scopes field label / hint presentation under `.form-section`（承載 Field 的組合殼，2026-07-08 自 🟡 重標；表單配方見 Pillar 5 · Form assembly）。`.form-section--outlined` 為建立流程正式採用的變體：白天以 `--surface-page` 作 sheet 底、`--card` 填色；黑夜以既有 `--surface-page`／`--muted` 層次呈現；兩模式共用 `--border` 外框。可見 outlined siblings 用 `--sp-24` 分隔，跨過 `[hidden]` 條件區塊不留空白。採用頁：create-product／-auction／-bundle／-event／-project／register-ip／admin-ip-bank-entry；[section-test.html](./section-test.html) 保留作視覺驗證。同檔尾追加 `.form-footnote`：表單底部置中小字說明（如 Stripe 保障文案），`--fs-12` / `--muted-foreground`，margin-top 22px 非 token（2026-07-09 自 create-product/auction 頁內樣式 promote，create-campaign 的 `.fc-footnote` 樣式不同、維持獨立） | [form-section.css](./ds-components/form-section.css) |
| Radio card | 🟡 molecule | ✓ Project | Side-by-side selectable cards (default radio dot + title/sub) built on Segmented; selected = card shadow + orange ring; optional icon-marker variant | [radio-card.css](./ds-components/radio-card.css) |
| Control row | 🟡 molecule | ✓ Project | Bordered standalone row: left label/sub + right control (switch / number / button) | [control-row.css](./ds-components/control-row.css) |
| Form grid | 🟢 atom | ✓ Project | 2- / 3-column field layout helper | [form-grid.css](./ds-components/form-grid.css) |
| Filter row | 🟡 molecule | ✓ Project | Chip filters and inline actions above lists / grids | [shared.css](./shared.css) |
| Edge shadow（工具）| ⚪ utility | ✓ Project | `.edge-shadow`：把 `--shadow-header` 變成「只露下緣、內縮、兩端漸淡」的邊緣陰影（`::before`＋clip）。wizard header／電子商店庫存條共用；其他元素加 class 即覆用 | [shared.css](./shared.css) |
| Shell 補角／接縫（頁級技法）| ⚪ utility | — SiteSpecific | 分割/捲動容器的圓角補位技法，與 `.edge-shadow`、`.alert--page-top::after` 同族，目前寫在 e-shop.html `<style>`（僅該頁用，隨 preview split 版式）：**corner-mask** 用同色 radial-gradient 補 `.main` 捲動容器右上被裁的方角（吃 `--surface-shell`／`--radius-shell`，公式與 `.alert--page-top::after` 一致、閾值統一 `-1px`）；**seam-shadow** 用透明真圓角輔助層投 `--shadow-seam`、蓋在接縫上（避免方角容器 box-shadow 走方角）。屬 shell 版式膠水、非通用元件，待其他分割頁複用時再抽 utility | [e-shop.html](./e-shop.html) |
| Segmented control | 🟡 molecule | ✓ Project | Compact chart view switcher and mode toggles | [chart.css](./ds-components/chart.css) |
| Stepper | 🟡 molecule | ✓ Project | Wizard 進度條（數字圓圈）。**2026-06-23 起由 Progress stepper 漸層條逐步取代**，仍存於 register-ip / create-project（過渡） | [shared.css](./shared.css) |
| Progress stepper | 🟡 molecule | ✓ Project | Wizard 進度條：細軌＋品牌漸層填充（`--progress`）＋下方步驟標籤（default／`--current`／`--done` 可回點）。多步驟建立流程用 | [progress-stepper.css](./ds-components/progress-stepper.css) |
| Wizard frame | 🟠 organism | ✓ Project | 建立流程聚焦版面，**六頁單一框架**（§5.2.4，create-product/-bundle/-auction/-project/-event/register-ip 一致）。**結構 v3（2026-06-24，對齊 `.main` 卡片語言）**：`.wizard`＝灰 canvas（`--surface-shell`，固定高不捲）＞ `.wizard__sheet`＝白色 content 卡（內部捲動、下緣圓角 28px＋向下投影、圓角歸自己）＋ `.wizard__bottom`＝其下 in-flow 平面灰 footer。**Header**（`.wizard__sheet` 內、sticky）：`.wizard__top-bar` grid 三欄＝`.wizard__back`(返回箭頭)＋`.wizard__top-titlewrap`(標題＋`.wizard__top-sub` 副標) 靠左｜中欄＝多步驟 `.wizard__progress`(漸層 Progress stepper)／單頁空｜`.wizard__top-actions`(自動儲存狀態＋Preview) 右。**Footer**：`.wizard__bottom-actions`([Back 多步才有]＋主動作)＋Save&exit。**`.wizard__body` 表單版修飾類**（2026-07-09 自 7 個建立頁的頁內覆寫 promote）：`.wizard__body--form`（頂距 `--sp-72` 72px，取代逐頁寫死）／`.wizard__body--narrow`（1000px，create-product/-auction/-bundle）／`.wizard__body--wide`（1240px，create-campaign）；create-event/-project/register-ip 只掛 `--form`（維持基底 820px 寬）。已知分岔未收：funding-simulate.html（頂距 32px）、funding-test.html／create-campaign.html 內文其他覆寫（44px），仍留頁內 | [shared.css](./shared.css) |
| Settings nav | 🟡 molecule | ✓ Project | Sticky local navigation inside Settings | [settings.css](./ds-components/settings.css) |
| Settings row | 🟡 molecule | ✓ Project | Dense label + hint + value/control/action row | [settings.css](./ds-components/settings.css) |
| Hero slideshow | 🟠 organism | ✓ Project | Dashboard full-bleed carousel | [shared.css](./shared.css) · [hero.js](./hero.js) |
| IP hero | 🟠 organism | ✓ Project | IP detail cover + usage + rental composition | [shared.css](./shared.css) |
| Rental card | 🟡 molecule | ✓ Project | Rental / bidding terms and CTA card | [shared.css](./shared.css) |
| Meta cell | 🟢 atom | ✓ Project | Compact label/value stack in dense commercial panels | [shared.css](./shared.css) |
| Chart card | 🟠 organism | ✓ Project | Chart surface with title, controls, body | [chart.css](./ds-components/chart.css) |
| Rank bars / source breakdown | 🟡 molecule | ✓ Project | Ranked bar rows and source distribution legends | [chart.css](./ds-components/chart.css) |
| Tooltip | — | ◎ Default | shadcn baseline — not promoted to a project CSS file | — |
| Toast | — | ◎ Default | shadcn baseline — project prefers route-level / inline states | — |

### 4.2 Button

**`_layer`** · atom — Primary action control; solid highlighter-orange CTA, neutral outline, and quiet ghost for low-emphasis actions.

**Anatomy**

```
┌──────────────────────────────┐
│  [icon]   Label   [→]         │   ← inline-flex, 8px gap
└──────────────────────────────┘
   icon/arrow each own flex child
```

**Variants** — Two namespaces both shipped in `button.css`. Docs/canonical `.ztor-btn` (+ `.ztor-btn--outline`); product-density `.btn` with `.btn--primary` (orange), `.btn--outline` (white surface + 1px `--border` hairline, flat — no shadow; 2026-06-12), `.btn--ghost` (transparent → tints on hover), `.btn--soft` (resting grey fill, no border — quiet secondary like toolbar Export).

**Sizes** — both namespaces pin height to the shared `--control-h` scale (same tokens as input). `.ztor-btn` default 44px (`--control-h-md`) / `--sm` 36px (`--control-h-sm`) / `--lg` 52px (`--control-h-lg`). `.btn` (product density, one rung denser) default **36px** (`--control-h-sm`, 13px font) / `--sm` **28px** (`--control-h-xs`, 12px font) / `--lg` **44px** (`--control-h-md`, 14px font). Vertical padding is dropped and the label is vertically centred (`align-items:center`); `box-sizing:border-box` keeps the outline variant's 1px border inside the same height, so every variant lands exactly on its token height. (2026-07-03: replaced the old padding-driven 37.5 / 27.5px fractional heights.)

**Split button** (🟡 molecule) — a `.btn--primary` main action joined to a caret `<summary>` that opens a `.dropdown__menu` of related actions; composes Button + Dropdown. Main label is context-aware and follows the active tab (E-Shop F3, D066). Shown in the §4.2 rendered-preview gallery (context columns: Products / Bundles / Auctions). Full inventory entry above; CSS [`split-button.css`](./ds-components/split-button.css).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | bg `--primary`, text `--primary-foreground`, hairline `0 0 0 1px rgba(23,23,23,0.12)` |
| hover | `:hover` | bg `--primary-hover`; `.ztor-btn` lifts `translateY(-1px)`; outline tints to `--muted`; ghost gets `color-mix(--foreground 6%)` fill |
| active | `:active` | `.ztor-btn` returns `translateY(0)` |
| focus | `:focus-visible` | `outline: 2px solid var(--ring)`, offset 2px |
| disabled | `:disabled` / `[aria-disabled="true"]` | `opacity: 0.5`, `pointer-events: none` |

**Class API** (CSS classes — Props/API = N/A, this is a static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.ztor-btn` | Canonical primary button (44px, orange) |
| `.ztor-btn--outline` | White surface + 1px `--border` hairline, flat (no shadow) |
| `.ztor-btn--sm` / `.ztor-btn--lg` | 36px / 52px sizes |
| `.btn` + `.btn--primary` | Product-density orange CTA |
| `.btn--outline` | White surface + 1px `--border` hairline，平面無陰影；padding −1px 補償保持尺寸（2026-06-12 取代「填色當邊」與多餘陰影） |
| `.btn--ghost` | Transparent, muted text; tints on hover |
| `.btn--ghost.btn--destructive` | Ghost + `--destructive` red text; hover tints red 10%. Compound（綁 `.btn--ghost`，不獨立成 `.btn--destructive`）防止誤掛在 `.btn--primary` 上做出紅色主按鈕；用於編輯態刪除（create-product / create-auction footer，完整確認 modal 待規格）。2026-07-09 自兩頁頁內樣式 promote |
| `.btn--soft` | Resting grey fill (`--foreground` 6% on surface), no border; quiet always-visible secondary（2026-06-12） |
| `.btn--sm` / `.btn--lg` | Compact 28px (`--control-h-xs`) / large 44px (`--control-h-md`); default `.btn` = 36px (`--control-h-sm`) |
| `.split-button` > `.split-button__main` + `.dropdown` > `.split-button__caret` | Split button (🟡 molecule): primary main (left-rounded) + caret (right-rounded, inset hairline) opening `.dropdown__menu`; context-aware main label (E-Shop F3, D066) — `split-button.css` |

**Token usage** (→ Pillar 2 Role)

- bg `--primary` · hover `--primary-hover` · text `--primary-foreground` · outline surface `--card` / `--muted` · outline border `--border`（平面，無 shadow） · ghost text `--foreground-muted` → `--foreground` · radius `--radius` (primary) / `--radius-md` (outline) · shadow `--shadow-raise`（primary lift） · focus ring `--ring` · motion `--duration` / `--easing` · font `--font-ui`

**Usage — 按鈕階層／什麼時候用哪個**

「一塊」＝畫面上各自獨立的一塊區域（一張卡片、一個彈窗／表單、工具列、列表的一列），不是整頁。

| 變體 | 強度 | 用在哪 | 同一塊可放幾個 | 例 |
|---|---|---|---|---|
| `--primary`（橘填） | 最強 CTA | 這一塊裡最重要的那一個動作 | **最多 1 個** | Create · Publish · Request payout |
| `--outline`（白底＋1px 線框） | 次要 | 內容區的次要／取消，需要明確邊界 | 想放幾個都行 | Back · Cancel · See as fan |
| `--soft`（灰填、無框） | 次要、更安靜 | 工具列／密集控制列，多個次要並排 | 想放幾個都行 | Export · Store settings |
| `--ghost`（透明→hover 上色） | 低強調 | 行內、輔助、不搶版面 | 想放幾個都行 | 列內動作 · Save draft |
| `--icon` / `--icon-circle` | 純操作 | 只有圖示（關閉、搜尋、設定齒輪、送出） | — | ✕ · 🔍 · ⚙ |

**規則**

1. 每一塊（卡片／彈窗／工具列…）只留 **1 個** 橘 primary 當最明顯的主按鈕；整頁可以有多個 primary，但別擠在同一塊。
2. **Outline vs Soft**＝「要不要框」：白內容區要邊界 → outline；工具列／密集區要安靜 → soft。
3. 破壞性動作（刪除）**不要**用橘 primary。⚠️ 目前**無紅色 destructive 變體**，是待補缺口——需要時補 `.btn--danger`。

**按鈕 × 背景層（白底 vs 灰底）**

原則：按鈕靠「填色或邊框跟背景的對比」被看見——**填色和背景同色就會消失**（outline 早期在白底消失即此故）。所以選變體要看它**坐在哪一層 surface 上**（surface 階梯見 Pillar 1：白 `--card`/`--background` → 灰 `--muted`/`--surface-shell`/`--sidebar`）。

| 坐在哪 | 能用 | 別用 |
|---|---|---|
| **白底**（卡片、route page、彈窗、表單） | primary · outline · soft · ghost · icon | — |
| **灰底**（app shell、muted 面板、表格底、rail） | primary · outline（白填＋框會跳出）· ghost · icon | **soft**（灰填在灰底會不見）→ 改用 outline |

一句話：**soft 只活在白底；要放灰底就改 outline。** outline 因為有實線框，白灰底都成立，是跨層最安全的次要。

**Do & Don't**

- ✅ Do keep one orange primary per view as the clear CTA.
- ✅ Do put the icon/arrow in its own flex child so the 8px gap applies.
- ❌ Don't bake the `→` into the label string (gap can't apply).
- ❌ Don't use transparent-fill or fill-only outline on the white canvas — it reads as "nothing there"; the 1px `--border` hairline is the edge.


**Code example**

```html
<button class="btn btn--primary">Create project <span class="btn__icon">→</span></button>
<button class="btn btn--outline btn--sm">Export CSV</button>
```

**CSS** — [`button.css`](./ds-components/button.css)

---

### 4.3 Badge / Status pill

**`_layer`** · atom — Read-only soft "category-tag" pill: flat tinted background + saturated same-hue text, rounded-rectangle corners, **no status dot, no ring**. Serves both live-status (payout / transaction / live·draft) and category/taxonomy (IP type, fan tier) roles. Plus an inline metric pill for prose.

> **2026-06-05 restyle:** moved from a dotted, ringed, full-pill capsule to the flat soft-tag look (per request, to match a Notion/Airtable-style select tag). `.badge__dot` is now `display:none` (markup kept for back-compat, renders nothing), corners are `--radius-md`, the hairline ring is removed, and a purple `--accent` variant was added.
>
> **2026-07-10:** `badge__dot` 已棄用（`display:none`），markup 不再需要——design-system.html 的 Badge demo（Status pill 表格 7 處）已移除 `<span class="badge__dot">`；其餘元件 demo 裡沿用 badge 的既有 markup 未動（保留不影響視覺）。

**Anatomy**

```
┌──────────────┐
│ Available    │   .badge .badge--success   (flat tint · saturated text · ~6px corners · no dot)
└──────────────┘

┌─────────────────────┐
│ [icon] 1,204 fans   │   .ztor-metric-pill (prose)
└─────────────────────┘
```

**Variants** — `.badge`: `--orange`, `--success`, `--error`, `--info`, `--warning`, `--accent` (purple), `--neutral`. `.ztor-badge` (docs): `--success`, `--error`, `--info`, `--warning`. Plus `.ztor-metric-pill` inline metric chip for hero/prose.

> **2026-07-10 標註：** `.ztor-metric-pill` 為行銷站遺留元件，admin 後台（本產品）未使用／marketing-site legacy, unused in the admin app。內容與 CSS 保留不刪。

**Sizes** — `.badge` 4×10 padding, 12px / 500, `--radius-md`. `.ztor-badge` 2×8 padding, 12px. `.ztor-metric-pill` 4×10 padding, 14px.

**States**

| State | Selector | Change |
|---|---|---|
| default | `.badge` | bg `--muted`, text `--foreground-muted`, no ring, no dot |
| (variant) | `.badge--success` etc. | bg `color-mix(--status 14%, surface)` (orange 30% · accent 16%), text = the saturated hue token |

No hover/focus/disabled — display-only.

**Class API** (CSS classes — Props/API = N/A, this is a static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.badge` | Flat neutral tag, `--radius-md`, no dot / no ring |
| `.badge__dot` | `display:none` (legacy; the soft-tag look carries no dot) |
| `.badge--orange` | `color-mix(--primary 30%, surface)` + dark text |
| `.badge--success` / `--error` / `--info` / `--accent` | Tinted soft tag, text = matching hue (`--accent` = purple `--status-accent`) |
| `.badge--warning` | 18% warning tint; text = `color-mix(--status-warning 50%, --foreground)` (hue too light for direct text) — added 2026-06-11 |
| `.badge--neutral` | `--muted` background |
| `.ztor-badge` (+ `--success`/`--error`/`--info`/`--warning`) | Compact docs badge with status tints |
| `.ztor-metric-pill` / `.ztor-metric-pill__icon` | Inline metric pill + 14px glyph |

**Token usage** (→ Pillar 2 Role)

- bg `--muted` + `color-mix` of `--status-success` / `--destructive` / `--status-info` / `--status-accent` / `--primary` against `--card` (tints track light/dark automatically) · text status tokens / `--primary-foreground` / `--foreground-muted` · radius `--radius-md` (badge) / `--radius` (ztor-badge) · font `--font-ui` · **no box-shadow**

**Usage** — Surface a state or a category at a glance (payout status, transaction state, live/draft; IP type, fan tier). Avoid for clickable filters — use Chip (§4.5) — and never as a button.

**Do & Don't**

- ✅ Do pick a variant hue that matches the meaning (status or category).
- ✅ Do reserve `--orange` for the highlight state, not generic info.
- ❌ Don't make a badge clickable (it has no interactive state).
- ❌ Don't invent ad-hoc status colors — use the variant tokens.


**Code example**

```html
<span class="badge badge--success">Available</span>
<span class="badge badge--accent">Reference</span>
<span class="ztor-metric-pill"><svg class="ztor-metric-pill__icon">…</svg>1,204 fans</span>
```

**CSS** — [`badge.css`](./ds-components/badge.css)

---

### 4.4 Status dot

**`_layer`** · atom — 8px solid circle used to color-code rows/items in dashboard demos.

**Anatomy**

```
● Label
└ .ztor-dot (8px, currentColor)
```

**Variants** — `--success`, `--error`, `--info`, `--warning`, `--black`.

**Sizes** — Single size (8 × 8px).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | 8px circle, `background: currentColor`, `--radius-pill` |
| (variant) | `.ztor-dot--success` etc. | sets `color` to the matching status token (drives `currentColor`) |

No interactive states — purely decorative.

**Class API** (CSS classes — Props/API = N/A, this is a static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.ztor-dot` | 8px inline-block circle filled with `currentColor` |
| `.ztor-dot--success` / `--error` / `--info` / `--warning` | Sets `color` to status token |
| `.ztor-dot--black` | Sets `color: var(--foreground)` (neutral dot, tracks light/dark) |

**Token usage** (→ Pillar 2 Role)

- color `--status-success` / `--destructive` / `--status-info` / `--status-warning` / `--foreground` (black variant) · fill via `currentColor` · radius `--radius-pill`

**Usage** — Use to tag/legend items in tables and lists (e.g. color-code brands in the dashboard demo). Avoid as a standalone status badge — pair with a text label.

**Do & Don't**

- ✅ Do reuse the same status colors as Badge for consistency.
- ❌ Don't resize it ad-hoc — it is a fixed 8px token.


**Code example**

```html
<span class="ztor-dot ztor-dot--success"></span> Settled
```

**CSS** — [`badge.css`](./ds-components/badge.css)

---

### 4.5 Chip

**`_layer`** · atom — Clickable filter pill with an active (inverted) state and optional count; distinct from Badge (display-only).

**Anatomy**

```
.chip-group ─────────────────────────────
┌──────────────┐ ┌──────────────┐
│ All  | 214   │ │ E-Shop | 96  │
└──────────────┘ └──────────────┘
 .chip--active     .chip
        └ .chip__count (│ + faded number)
```

**Variants** — Base `.chip`, `.chip--active` (inverted), `.chip--static` (read-only, no hover). Container `.chip-group`; row wrapper `.filter-row` + `.filter-row__actions`.

**Sizes** — Single size (6 × 12px padding, 12px / 500).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | bg `--card`, text `--foreground-muted`, `1px solid --border`, `--radius-pill` |
| hover | `:hover` | bg `--muted`, text `--foreground` |
| active | `.chip--active` | bg `--foreground`, text `--background`, border `--foreground` (hover unchanged) |
| static | `.chip--static` | `cursor: default`, hover reverts to default look |

**Class API** (CSS classes — Props/API = N/A, this is a static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.chip-group` | inline-flex wrap container, 6px gap |
| `.chip` | Interactive filter pill |
| `.chip--active` | Inverted selected state |
| `.chip--static` | Read-only chip (e.g. supported-regions list) |
| `.chip__count` | Faded count after a vertical separator |
| `.chip--removable` / `.chip__remove` | Selected / creator-added value with an inline × (tag-input, variant option values) |
| `.filter-row` / `.filter-row__actions` | Chip-group paired with right-aligned actions |

**Token usage** (→ Pillar 2 Role)

- bg `--card` / `--muted` · active bg `--foreground`, text `--background` · text `--foreground-muted` → `--foreground` · count `--muted-foreground` · border `--border` · radius `--radius-pill` · motion `--duration` / `--easing` · font `--font-ui`

**Usage** — Use for filterable taxonomies (Earnings transaction filters, Tax-docs year filter). Avoid for read-only status — use Badge (§4.3).

**Do & Don't**

- ✅ Do keep exactly one `.chip--active` per group at a time.
- ✅ Do use `.chip--static` when a chip is informational, not a filter.
- ❌ Don't use a chip to display non-filterable status.
- ❌ Don't put more than one active chip in a single-select group.
- ❌ Don't render an action (Export / Print / Download) as a chip — those are Buttons (§4.2). In a `.filter-row`, chips filter and the right-aligned action (e.g. Export CSV `.btn--outline`) is a Button.


**Code example**

```html
<div class="filter-row">
  <div class="chip-group" role="group">
    <button class="chip chip--active">All <span class="chip__count">214</span></button>
    <button class="chip">E-Shop <span class="chip__count">96</span></button>
  </div>
  <div class="filter-row__actions">
    <button class="btn btn--outline btn--sm">Export CSV</button>
  </div>
</div>
```

**CSS** — [`chip.css`](./ds-components/chip.css)

---

### 4.6 Switch

**`_layer`** · atom — Binary on/off toggle; 36 × 20 pill with a sliding 16px knob, on-state fills orange.

**Anatomy**

```
off  ◖○      ◗   .switch          (neutral track, knob left)
on   ◖      ●◗   .switch--on      (orange track, knob right)
                  └ ::after knob (16px)
```

**Variants** — `.switch` (off) and `.switch.switch--on` (on). Single visual form.

**Sizes** — Single size (36 × 20px track, 16 × 16 knob).

**States**

| State | Selector | Change |
|---|---|---|
| default (off) | `.switch` | track `--muted`, ring `1px --border`, knob `--card` left:2px |
| checked (on) | `.switch--on` | track `--primary`, ring `rgba(23,23,23,0.12)`, knob `--primary-foreground` left:18px |

No separate hover/focus styling in CSS (state toggled via the `--on` class).

**Class API** (CSS classes — Props/API = N/A, this is a static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.switch` | Off track + knob (knob is `::after`) |
| `.switch--on` | On state: orange track + knob slid right |

**Token usage** (→ Pillar 2 Role)

- off track `--muted`, ring `--border` · on track `--primary` · knob `--card` (off) / `--primary-foreground` (on) · radius `--radius-pill` · knob motion `left 150ms ease`, track `--duration` / `--easing`

**Usage** — Use for immediate-apply binary settings (notifications, privacy, auto-payout, product/marketplace visibility). Avoid where a Save step is required — use a checkbox/form control instead.

**Do & Don't**

- ✅ Do label what "on" means next to the switch.
- ❌ Don't use a switch for actions that need confirmation.


**Code example**

```html
<button class="switch switch--on" role="switch" aria-checked="true" aria-label="Auto-payout"></button>
```

**CSS** — [`switch.css`](./ds-components/switch.css)

---

### 4.7 Info banner

**`_layer`** · atom — Neutral contextual information banner with a leading `info` icon. It explains a rule, timing, limitation, or next step without giving it warning priority.

**Anatomy**

The banner contains a Lucide `info` icon (`.info-banner__icon`) followed by the explanatory text. Use `<strong>` only for the clause people need to scan first.

**Variants** — Single variant.

**Sizes** — Desktop uses 10 × 12px padding with 14px text; mobile keeps the compact padding and contracts to 13px text.

**States**

| State | Selector | Change |
|---|---|---|
| default | — | neutral `--accent` surface, `--border` hairline, `--foreground-muted` text, `--radius-lg` corners and a 10px icon gap |

Static callout — no interactive states.

**Class API** (CSS classes — Props/API = N/A, this is a static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.info-banner` | Neutral gray information banner (flex, centered vertically) |
| `.info-banner__icon` | Leading Lucide `info` icon, 20px desktop / 18px mobile |

**Token usage** (→ Pillar 2 Role)

- bg `--accent` · border `--border` · text `--foreground-muted` · icon `--foreground` · radius `--radius-lg` · type `--font-ui`

**Usage** — Use when context helps a person understand a rule, timing, limitation, or next step. Use `alert` for warnings, failures, or urgent action; use `.card__hint` for a short field-level hint.

**Do & Don't**

- ✅ Do keep it to 1–3 sentences and use `<strong>` for the key clause.
- ✅ Do use the same `info` icon for every instance so this role remains recognisable.
- ❌ Don't use it for urgent warnings or destructive consequences.
- ❌ Don't use it as a substitute for field-level help.


**Code example**

```html
<div class="info-banner">
  <i data-lucide="info" class="ztor-icon info-banner__icon"></i>
  <span><strong>Pending ≠ Available.</strong> Pending settlement holds funds for the T+7 dispute window.</span>
</div>
```

**CSS** — [`info-banner.css`](./ds-components/info-banner.css)

---

### 4.7b Upload tile

**`_layer`** · atom — Dashed upload affordance for create flows (spec 5.1.5.2 「Show it off」／「Prove it's real」／數位下載檔)。

**Anatomy**

```
┌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┐
│              ⬡ icon                    │
│   Hero image — the first thing…        │ └ .upload-tile__title
│   Min 800 x 800px                      │ └ .upload-tile__hint
└╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘
```

**Variants**

| Variant | Class | Use |
|---|---|---|
| Hero | `.upload-tile--hero` | 主圖大格（min-height 150px） |
| Base | `.upload-tile` | 縮圖格／證書格（96px；grid 內 84px） |
| File | `.upload-tile--file` | 檔案上傳列（數位下載檔、合照；110px） |

**Layout helper** — `.upload-grid`：4 欄縮圖列（附圖）；`.upload-grid--2x2` 改 2 欄（搭 showcase 並排用）。`.upload-showcase`：主圖（左）＋縮圖格（右）並排兩等寬欄，附圖排 2×2 對齊 1:1 主圖高度；窄於 880px 收成主圖在上、附圖 4 格在下（create-product 展示它）。

**States**

| State | Selector | Change |
|---|---|---|
| default | — | 1.5px dashed `--border`, radius `--radius-md`, text `--muted-foreground` |
| hover | `:hover` | border → `--muted-foreground`, bg → `--muted` |

**Class API**

| Class / modifier | Effect |
|---|---|
| `.upload-tile` | 虛線上傳格（flex column 置中） |
| `.upload-tile--hero` / `--file` | 大格／檔案列尺寸變體 |
| `.upload-tile__icon` / `__title` / `__hint` | registered Lucide icon／主文案（`--foreground` 500）／限制說明；不用文字 `＋` 或自製 SVG |
| `.upload-tile.is-filled` | 已選檔狀態（非互動）：實線邊框＋`--status-success`（含 `__title` 轉綠）。create-auction／create-event／register-ip 的 toggle 共用（2026-06-16 promote 自頁內） |
| `.upload-grid` | 4 欄縮圖 grid（gap 10px） |
| `.upload-grid--2x2` | 縮圖 grid 改 2 欄（並排 showcase 用） |
| `.upload-showcase` | 主圖＋縮圖格並排兩等寬欄（≤880px 收回堆疊） |
| `[data-upload]`（互動上傳格） | opt-in 開啟互動上傳（`partials/upload-tile.js` 增強）。狀態：`.is-empty`（hover 現 `__sub`/`__hint` 更多資訊）→ `.is-uploading`（`__thumb`＋frosted `__overlay`＋`__progress`/`__bar`，假走 ~2.5s）→ `.is-filled`（`__thumb` 鋪滿；hover `__actions`：替換/AI 優化/刪除）→ `.is-optimizing`/`.is-optimized`（`__badge`「已依規格優化」）。就緒仍走 `upload:change` 事件。**AI 優化＝假動作＋產品變更提案（ASSUMPTIONS UIA-037，上游無此功能）** |
| `.upload-tile__thumb` / `__overlay` / `__spinner` / `__progress` / `__bar` / `__actions` / `__act`(`--ai`) / `__badge` | 互動上傳格的注入子元素（縮圖／進行中罩／spinner／進度條／hover 動作／AI 優化徽章）；全 token 驅動，罩用 `color-mix(--foreground/--card)` 主題自適應 |
| `[data-upload="content"]`（內容檔模式） | 內容檔（音樂/影片/檔案，§4.2 F11）：上傳後可**播放**（音訊/影片，真實 `<audio>`/`<video>`）與刪除，操作比照顯示圖、**無 AI**。影片顯示影格（`.upload-tile__video`）、音訊/檔案顯示檔型圖示＋檔名（`.upload-tile__filemark`/`__filename`）；動作＝`__act--play`（播放/暫停切換）＋替換＋刪除；`accept` 由頁面以 `data-upload-accept` 指定（音樂→`audio/*`、影視→`video/*`）。`.upload-tile--playable` 才顯示播放鈕。呈現層 demo（不真上傳） |

**Token usage** (→ Pillar 2 Role)

- border `--border`(dashed) · radius `--radius-md` · text `--muted-foreground` / title `--foreground` · hover bg `--muted`
- 互動態：進度/徽章/AI 強調 `--primary`(+`--primary-foreground`) · 進行中罩 `color-mix(--card 82%)` · hover 動作罩 `color-mix(--foreground 42%)` · 動作鈕 `--card`/`--shadow-card`

**Usage** — 建立流程的上傳入口。限制（最小尺寸／檔型）一律寫進 `__hint`，不留光禿格。一般空狀態用 `empty-stub`，不用這個。需要真正「選圖→上傳→hover 動作」時加 `[data-upload]`（見 create-product「Show it off」），並在頁面監聽 `upload:change` 更新就緒。

**Do & Don't**

- ✅ Do 在 `__hint` 標明限制（Min 800 x 800px／檔型清單）。
- ✅ Do 主格用 `--hero`、次要角度用 `.upload-grid`。
- ❌ Don't 當一般空狀態容器（那是 `empty-stub`）。
- ❌ Don't 改實線或填色——虛線就是可上傳的訊號。

**Code example**

```html
<div class="upload-tile upload-tile--hero">
  <span class="upload-tile__icon"><i data-lucide="image" class="ztor-icon ztor-icon--lg"></i></span>
  <span class="upload-tile__title">Hero image — the first thing buyers see</span>
  <span class="upload-tile__hint">Min 800 x 800px</span>
</div>
```

**CSS** — [`upload-tile.css`](./ds-components/upload-tile.css)

---

### 4.8 Input

**`_layer`** · atom — Single-line text field, matching textarea, and native select; white surface with a 1px `--border` shadow edge, promoted to a `--ring` edge + soft 4px glow on focus.

> **2026-07-10 整併**：舊 `.ztor-input` / `.ztor-input--xs/sm/lg/xl` / `.ztor-textarea` 替身 class 已刪除（未被任何實頁使用）；design-system.html 的 demo 改用真身 `.input` / `.textarea` / `.select`。真身規則原住 `shared.css`，現搬進 `input.css`（屬性值原樣未動）。

**Anatomy**

```
┌──────────────────────────────────────┐
│ Placeholder text                      │   .input (single size)
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│                                       │
│                                       │   .textarea (min-height 100px, resize-y)
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Choose one                         ▾  │   .select (native, custom chevron)
└──────────────────────────────────────┘
```

**Variants** — `.input` (line field), `.input--with-prefix` (extra left padding for a leading glyph), `.textarea` (multi-line, vertical resize), `.select` (native select, custom chevron, no OS arrow).

**Sizes** — Single size only across all three (no `--sm`/`--lg`/`--xl` variants — that ladder existed only in the deleted `.ztor-input` replica, never in the real component).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | bg `--card`, `0 0 0 1px var(--border)` shadow edge, text `--foreground` |
| focus | `:focus` | `outline: none`; `0 0 0 1px var(--ring)` + `0 0 0 4px color-mix(in srgb, var(--ring) 15%, transparent)` soft glow |

**狀態缺口** — `:disabled` 與 `aria-invalid`（錯誤 ring）樣式尚未在 `input.css` 實作；design-system.html 不示範，待補。

**Class API** (CSS classes — Props/API = N/A, this is a static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.input` | Single-line field |
| `.input--with-prefix` | Extra left padding (`--sp-32`) for a leading glyph (currency, unit) |
| `.textarea` | Multi-line field, vertical resize, min-height 100px |
| `.select` | Native `<select>`, OS arrow dropped; pair with `.select-wrap` + `.select-wrap__icon` for a registered Lucide chevron |

**Token usage** (→ Pillar 2 Role)

- bg `--card` · text `--foreground` · edge `--border` (1px shadow) · radius `--radius` · focus `--ring` edge + soft glow ring · font `--font-body` · font size `--fs-14` · padding `--sp-12` (left/right prefix `--sp-32`)

**Usage** — Use `.input` for text/number entry in forms (settings, payout forms), `.textarea` for longer free text, `.select` for a native dropdown. The field uses a 1px visual edge without changing its box size.

**Do & Don't**

- ✅ Do pair with Field system for label + hint.
- ✅ Do use `.input--with-prefix` when a fixed leading glyph sits inside the field.
- ✅ Do rely on the component's 1px `--border` shadow edge; do not add a second border.
- ❌ Don't invent a size variant — the real component ships one size only.


**Code example**

```html
<label for="email">Email</label>
<input id="email" class="input" type="email" placeholder="you@studio.com">
<textarea class="textarea" placeholder="Notes…"></textarea>
<select class="select"><option>Choose one</option></select>
```

**CSS** — [`input.css`](./ds-components/input.css)（原住 `shared.css`，2026-07-10 搬入）

---

### 4.9 Icon

**`_layer`** · atom — Lucide outline glyph as inline SVG, registered in `icons.js` and injected per page via `ztorIcons.applyIcons()` (no icon font, no network). The single icon primitive every other component reuses; it inherits `currentColor` and is sized by its context.

**Anatomy**

```
<i data-lucide="bell" class="ztor-icon"></i>
└ replaced in place with the registered inline SVG (stroke/fill = currentColor)
```

**Variants** — outline (default) · filled (`-fill` glyphs, e.g. `check-circle-fill`).

**Sizes** — semantic scale: 12px (`--xs`) · 14px (`--sm`) · 16px base · 20px (`--md`) · 24px (`--lg`). Icon buttons use the 16px base glyph; size the icon for its meaning, not the button box.

**Registry** — hand-curated set in `icons.js` (the in-use glyphs) + the **full Lucide library (~1,713) in `icons-all.js`**, merged into the registry when that file is loaded (design-system.html only; product pages stay lean). Classified in §4.9 as **in use (38)** vs **not in use (~1,683)**. An icon renders as the literal tag if its name isn't registered.

**States**

| State | Selector | Change |
|---|---|---|
| default | — | size box, `currentColor` stroke/fill, `flex-shrink: 0`, `vertical-align: -2px` |
| (size) | `.ztor-icon--xs` / `--sm` / `--md` / `--lg` | 12px / 14px / 20px / 24px box |

Static, non-interactive — it reflects the host control's state via `currentColor`; no focus/keyboard role of its own.

**Class API** (CSS classes — Props/API = N/A, this is a static CSS prototype)

| Class / attribute | Effect |
|---|---|
| `data-lucide="name"` | Registry key; replaced with the inline SVG by `ztorIcons.applyIcons()` |
| `.ztor-icon` | 16px box, `currentColor`, `flex-shrink: 0`, `vertical-align: -2px` |
| `.ztor-icon--xs` / `.ztor-icon--sm` / `.ztor-icon--md` / `.ztor-icon--lg` | 12px / 14px / 20px / 24px boxes |

**Token usage** (→ Pillar 1 Foundation · Iconography)

- `currentColor` — stroke/fill source (inherited from host) · semantic size scale (12 / 14 / 16 / 20 / 24px)

**Usage** — Reused by [Button](#42-button) (icon variants), Badge (leading glyph), NavigationMenu, Alert, Composer, Header, Data list, Chart. Decorative icons are `aria-hidden`; icon-only controls carry an `aria-label` on the host `<button>`/`<a>`.

**Do & Don't**

- ✅ Do register the name in `icons.js` first, then use `<i data-lucide="name" class="ztor-icon">`.
- ✅ Do use the semantic size modifiers when the base 16px glyph is not appropriate.
- ❌ Don't hardcode a hex color or fixed px when the context already sets them.
- ❌ Don't use a glyph not in the registry (it renders as the literal tag).


**Code example**

```html
<i data-lucide="bell" class="ztor-icon"></i>
<script>ztorIcons.applyIcons();</script>
```

**CSS** — [`icon.css`](./ds-components/icon.css) (`.ztor-icon` base) · [`icons.js`](./icons.js) (registry + injector)

---

### 4.10 NavigationMenu

**`_layer`** · molecule — Hover-open mega-dropdown: a nav trigger that reveals a 2-column panel of icon links plus a promo card.

**Anatomy**

```
.app-topbar__nav
 └ .app-topbar__nav-group[data-dropdown]
     ├ .app-topbar__link.app-topbar__link--group
     │   └ <i class="ztor-icon" data-lucide="chevron-down">
     └ .app-topbar__dropdown.app-topbar__dropdown--mega[data-state]
         ├ .app-topbar__dropdown-col
         │   └ .app-topbar__dropdown-link
         │       ├ .app-topbar__dropdown-icon
         │       └ title / desc text
         └ .app-topbar__dropdown-promo
```

**Variants** — Single variant (one panel layout: link column + promo card).

**Sizes** — Single size (panel `min-width: 480px` / `max-width: 720px`; trigger height `40px`).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | Link transparent; dropdown hidden via `data-state="closed"` |
| hover | `.app-topbar__link:hover` | Link text moves to `--foreground`; shared nav highlight follows hover |
| expanded | `.app-topbar__link[aria-expanded="true"]` | Chevron icon rotates `180deg` |
| open | `.app-topbar__dropdown[data-state="open"]` | Mega panel fades/slides/scales in; close delayed by nav JS |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.app-topbar__nav-group[data-dropdown]` | Owns one dropdown group and hover/click behavior |
| `.app-topbar__link--group` | Nav trigger link with chevron icon |
| `.app-topbar__dropdown--mega` | Absolute mega panel; animates on `[data-state="open"]` |
| `.app-topbar__dropdown-col` | Vertical stack of dropdown links |
| `.app-topbar__dropdown-link` | Icon + title + desc row link |
| `.app-topbar__dropdown-icon` | 32px chip, `--muted` + token edge |
| `.app-topbar__dropdown-promo` | Right-column promo block |

**Token usage** (→ Pillar 2 Role)

- `--card`, `--muted` (trigger/panel/link/icon bg) · `--foreground`, `--muted-foreground` (text) · `--radius`, `--radius-lg` (trigger/link vs panel) · `--shadow-hairline`, `--shadow-card` (trigger hover vs panel elevation) · `--font-ui`, `--font-body` (titles/labels vs descriptions) · `--duration`, `--easing` (open/chevron transitions)

**Usage** — Use when a topbar section needs to expose several destinations with brief descriptions plus a promotional shortcut (IP Bank / E-Shop / Fans dropdowns). Avoid when there is only one destination — use a plain header link instead.

**Do & Don't**

- ✅ Do drive open/close via `[data-state="open"]` on the panel and `[aria-expanded]` on the trigger together.
- ✅ Do keep link descriptions short (the `__desc` is capped at 24ch).
- ❌ Don't add a panel border — elevation comes from `--shadow-card` only.
- ❌ Don't use orange fill inside the panel; chrome stays neutral surfaces.


**Code example**

```html
<a class="app-topbar__link app-topbar__link--group" href="#" aria-expanded="false">
  IP Bank
  <i data-lucide="chevron-down" class="ztor-icon"></i>
</a>
<div class="app-topbar__dropdown app-topbar__dropdown--mega" data-state="closed">
  <div class="app-topbar__dropdown-col">
    <a class="app-topbar__dropdown-link" href="my-ip.html">
      <span class="app-topbar__dropdown-icon"><!-- icon --></span>
      <span>
        <p>Browse marketplace</p>
        <small>Find IP to license for your next drop</small>
      </span>
    </a>
  </div>
  <div class="app-topbar__dropdown-promo">
    <p>License a brand</p>
    <a href="my-ip.html">Explore IP →</a>
  </div>
</div>
```

**CSS** — [`header.css`](./ds-components/header.css) — `.app-topbar__link` / `--group` / `__dropdown` (merged from `navigation-menu.css` 2026-06-01; the old `.ztor-nav-*` was a parallel implementation)

---

### 4.11 Card

> **2026-07-10 標註：** `.ztor-card` 產品頁未使用，僅展示保留／not used on product pages, kept for reference display. 產品頁的區段外框請見 **4.11b Section card**（`.card`）。

**`_layer`** · molecule — Canonical elevated-card reference: standalone content container with title / meta / body slots. Docs-only generic card shell — not the product-page section wrapper (see **4.11b Section card**).

**Anatomy**

```
.ztor-card  (or .ztor-card--clickable / --muted / --frame)
 ├ .ztor-card__title
 ├ .ztor-card__meta
 └ .ztor-card__body
```

**Variants** — `.ztor-card--clickable` (lift + focus ring), `.ztor-card--muted` (`--muted` bg), `.ztor-card--frame` (zero-pad, overflow-hidden, `--radius-lg` — wraps mockups).

**Sizes** — Single size (padding `24px`).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | `--card` bg, 1px `--border`, `--radius` (Q3 2026-07-13: flat border, no shadow at rest) |
| hover | `.ztor-card--clickable:hover` | `translateY(-2px)` + `--shadow-card-hover` (borrows E3) |
| focus | `.ztor-card--clickable:focus-visible` | `2px solid var(--ring)` outline, `2px` offset |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.ztor-card` | Base column container, 1px `--border`, 24px pad |
| `.ztor-card--clickable` | Adds hover lift + focus-visible ring |
| `.ztor-card--muted` | Swaps bg to `--muted` |
| `.ztor-card--frame` | Padding 0 + overflow hidden + `--radius-lg` (mockup frame) |
| `.ztor-card__title` / `__meta` / `__body` | 18px title / 13px subtle meta / 14px body |

**Token usage** (→ Pillar 2 Role)

- `--card`, `--muted` (bg) · `--foreground`, `--foreground-muted`, `--muted-foreground` (title / body / meta) · `--border` (1px, default edge — Q3) · `--radius-md`, `--radius-lg` (default vs frame) · `--shadow-card-hover` (clickable hover only, Q3); `--ring` (focus outline) · `--font-ui`, `--font-body`; `--duration`, `--easing`

**Usage** — Docs-only generic standalone card shell; not used on any product page today (kept as a documented reference). For product-page sections, use **4.11b Section card** (`.card`) instead.

**Do & Don't**

- ✅ Do use `.ztor-card--muted` for nested sub-blocks.
- ❌ Don't add `--clickable` lift to non-interactive cards.
- ❌ Don't use this for a product-page section wrapper — use `.card` (Section card) instead.


**Code example**

```html
<div class="ztor-card ztor-card--clickable">
  <div class="ztor-card__title">Project</div>
  <div class="ztor-card__meta">2h ago</div>
</div>
```

**CSS** — [`card.css`](./ds-components/card.css)

---

### 4.11b Section card

**`_layer`** · molecule — The product-page section wrapper: a titled outline with an optional head-row action link, used for every card-shaped section across the app (dashboard tiles, earnings panels, detail-page blocks). Boundary vs. **4.11 Card**: `.card` = section wrapper (this entry), `.ztor-card` = generic standalone content card (docs-only reference, unused on product pages).

**Anatomy**

```
.card  (or .card--muted)
 ├ .card__head
 │   ├ .card__title
 │   ├ .card__hint        (non-actionable)
 │   └ .card__link →      (chevron after, in head)
 └ ...section body...
```

**Variants** — `.card--muted` (muted section wrapper, for nested sub-sections).

**Sizes** — Single size (padding `20px`).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | `--card` bg, 1px `--border`, `--radius` (Q3 2026-07-13: flat border, no shadow) |
| link hover | `.card__head .card__link:hover` | Link color → `--foreground` (chevron tracks via currentColor) |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.card` | Product section wrapper, 20px pad |
| `.card--muted` | Muted section bg (nested sub-sections) |
| `.card__head` | Baseline-aligned space-between head row, 14px bottom margin |
| `.card__title` | 15px / 500 section title |
| `.card__hint` | 12px subtle non-actionable hint |
| `.card__link` | 12px action link — underline by default; in `.card__head` becomes underline-less with trailing chevron icon |

**Token usage** (→ Pillar 2 Role)

- `--card`, `--muted` (bg) · `--foreground`, `--foreground-muted`, `--muted-foreground` (title / hint) · `--border` (1px default edge, Q3; also link underline) · `--radius-md` · `--font-ui`, `--font-body`

**Usage** — Use for every product-page section that needs a titled wrapper with an optional action link. Avoid when content is a flat row list — reach for Data list / Table instead.

**Do & Don't**

- ✅ Do put the section action in `.card__head .card__link` so it auto-renders the trailing chevron.
- ✅ Do use `.card--muted` for nested sub-sections to differentiate depth.
- ✅ Do rely on the 1px `--border` for the section edge — no shadow by default (Q3 2026-07-13).
- ❌ Don't use this for a standalone info block outside a page section — use `.ztor-card` instead.


**Code example**

```html
<section class="card">
  <div class="card__head">
    <h3 class="card__title">Recent earnings</h3>
    <a class="card__link" href="earnings.html">View all</a>
  </div>
  <!-- section body: data-list, kpi row, etc. -->
</section>
```

**CSS** — [`card.css`](./ds-components/card.css)

**Evidence / usage** — e-shop, earnings, event-detail, auction-detail, bundle-detail, my-ip, fan-detail, create-campaign, create-event, create-project.

---

### 4.12 KPI

**`_layer`** · molecule — Flat metric tile: one uppercase label, one big display value, and a semantic delta or neutral meta line.

**Anatomy**

```
.kpi[.kpi--success|--warning|--destructive]   (optional color state, tints __value only)
 ├ .kpi__label   (uppercase 12px, optional leading icon)
 ├ .kpi__value   (display 28px)
 └ .kpi__delta   (+/- · success default; .kpi__delta--neg = error)
   — or —
   .kpi__meta    (neutral footnote)
 └ .kpi__link    (optional quiet "view more →" link, e.g. Net income → Breakdown)
```

**Variants** — Modifiers: `.kpi__delta--neg` (negative delta color) and `.kpi--compact` (drops the 96px min-height and tightens padding to 12px 14px, for side-column / summary use — Product detail Sales summary). No orange / highlight fill exists. A tile may carry a `.kpi__delta` AND a linked `.kpi__meta` together — Dashboard F2 total-revenue pairs a week-over-week delta with a freshness/deep-link meta line (spec 5.1.1 §F2).

Color-state modifiers `.kpi--success` / `.kpi--warning` / `.kpi--destructive` tint `.kpi__value` only (label/meta/delta stay neutral) — for a KPI tile whose whole number carries a status, not just its delta (e.g. a "valid check-ins" count). Visual baseline: event-detail.html's `.checkin-stats` three-color legend (valid green / already-used yellow / invalid red, spec 5.1.6 F5); `--warning` reuses the same `color-mix(in srgb, var(--status-warning) 60%, var(--foreground))` formula as `.checkin-stat--used` so both read as the same yellow.

**Sizes** — Single size (`padding: 16px 18px`, `min-height: 96px`).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | `--card` bg, 1px `--border`, value in display font (Q3 2026-07-13: flat border, no shadow) |
| (delta sign) | `.kpi__delta--neg` | Delta color switches `--status-success` → `--destructive` |
| link hover | `.kpi__link:hover` | `--muted-foreground` → `--foreground` |

The tile itself is static; only the optional `.kpi__link` is interactive.

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.kpi` | Tile container — column, 6px gap, 1px `--border` |
| `.kpi__label` | Uppercase 12px / 0.4px tracking, subtle; flex for leading icon |
| `.kpi__value` | Display font 28px / 500 / -0.6px tracking |
| `.kpi__delta` | 12px UI; default `--status-success` (positive) |
| `.kpi__delta--neg` | Overrides delta to `--destructive` |
| `.kpi__meta` | 12px subtle neutral footnote (alternative to — or, on F2, alongside — delta); may wrap an `.card__link` for a deep-link |
| `.kpi__link` | Optional quiet "view more →" link pinned to the tile bottom (subtle → foreground on hover); pairs with `data-tab-jump` |
| `.kpi--success` | Tints `.kpi__value` `--status-success` |
| `.kpi--warning` | Tints `.kpi__value` `color-mix(in srgb, var(--status-warning) 60%, var(--foreground))` |
| `.kpi--destructive` | Tints `.kpi__value` `--destructive` |

**Token usage** (→ Pillar 2 Role)

- `--card` (bg); `--border` (1px, default edge — Q3); `--radius-md` · `--muted-foreground` (label, meta) · `--status-success` (positive delta / `.kpi--success`), `--destructive` (negative delta / `.kpi--destructive`), `--status-warning` (`.kpi--warning`, color-mixed) · `--font-ui`, `--font-display`

**Usage** — Use for dashboard summary rows, earnings tabs, and page-header metric strips where one number per tile is the point. Avoid when the value needs a trend chart or multiple sub-figures — use the Chart organism.

**Do & Don't**

- ✅ Do use `.kpi__delta--neg` for declines so red signals direction without an icon.
- ✅ Do choose `.kpi__meta` instead of `.kpi__delta` when the footnote is informational (e.g. release date), not a change.
- ❌ Don't fill the tile orange or use a highlight background — orange is reserved for the primary CTA; a selected metric is shown by position, not color.
- ❌ Don't put more than one value in a single tile.


**Code example**

```html
<div class="kpi">
  <div class="kpi__label">Gross revenue</div>
  <div class="kpi__value">$24,830</div>
  <div class="kpi__delta">+18.4% MoM</div>
  <!-- decline: <div class="kpi__delta kpi__delta--neg">-4.2% MoM</div> -->
</div>

<!-- color-state: whole value carries a status, not just its delta -->
<div class="kpi kpi--success">
  <div class="kpi__label">Valid check-ins</div>
  <div class="kpi__value">312</div>
</div>
```

**CSS** — [`kpi.css`](./ds-components/kpi.css)

---

### 4.13 Alert

**`_layer`** · molecule — Inline notice with a status-tinted icon, title, description, optional CTA, and (card density) a chevron close button.

**Anatomy**

```
.alert .alert--{card|row} .alert--{warning|error|success|info}
 ├ .alert__icon     (status-tinted square, filled glyph)
 ├ .alert__body
 │   ├ .alert__title
 │   ├ .alert__desc   (or .alert__meta in --row)
 │   └ .alert__cta    (inline colored link, optional)
 └ .alert__close →    (chevron · --card only)
```

**Variants** — Two density modifiers `.alert--card` (large, row-divider list, close button) and `.alert--row` (slim single-line, left-border accent). Four status modifiers `.alert--warning` / `.alert--error` / `.alert--success` / `.alert--info`, shared across densities. Dashboard F4 adds two state modifiers on `.alert--card`: `.alert--snoozed` (soft-closed info item, receded ~62%, reappears ~7d) and a blocking item whose close control is `disabled`/locked (resolve only in the source module) — spec 5.1.1 §F4.

**Sizes** — Density is the size axis: `--card` (40px icon, multi-line, `14px 4px` pad) vs `--row` (30px icon, single-line, `12px 14px` pad).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | Status icon tint + (card) bottom divider / (row) left-border accent |
| cta hover | `.alert--card .alert__cta:hover` | Underline appears, `3px` offset |
| close hover | `.alert--card .alert__close:hover` | `--muted` bg, color → `--foreground` |
| last item | `.alert--card:last-child` | Drops `border-bottom` (clean list end) |
| snoozed | `.alert--snoozed.alert--card` | Receded to ~62% opacity; still listed (reappears ~7d) |
| blocking close | `.alert--card .alert__close:disabled` | Close control dimmed (0.4) + `not-allowed`; locked |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.alert--card` | Card density: `40px 1fr 28px` grid, bottom divider, close button |
| `.alert--snoozed` | F4 soft-closed info state — muted ~62%, still in list |
| `.alert--row` | Row density: `auto 1fr auto` grid, muted bg, 3px left accent |
| `.alert--bar` | Bar density: single-line rounded bar, soft shadow, no divider; `.alert__title` + inline `.alert__meta`, optional `.alert__cta`, `.alert__dismiss` ✕ |
| `.alert--page-top` | Positioning modifier on `.alert--bar`: sticky, full-bleed edge-to-edge flush page-top inside the app shell (must be `.main` first child), padding-inline aligned to the content column. `::after` masks the scroll-side top corner (≥901px). Two usages: Events' Event Day scenario banner (injected by `js/scenario.js`) uses the base as-is (full-bleed); E-Shop's low-stock bar (F2, `#eshop-stock-bar`) applies an instance override narrowing + centering it to the content column and swapping its shadow for `.edge-shadow` — a documented page-level exception (see e-shop.html) |
| `.alert--warning/-error/-success/-info` | Sets icon chip tint, CTA color, and (row) left-border color |
| `.alert__icon` | Status-tinted chip holding a filled `.ztor-icon` |
| `.alert__body` | Title + desc/meta + optional CTA stack |
| `.alert__title` | 14px/600 (card) or 13px/500 (row) |
| `.alert__desc` / `.alert__meta` | 13px muted (card) / 12px subtle (row); `<em>` = emphasis |
| `.alert__cta` | Inline status-colored action link |
| `.alert__close` | 28px chevron-right dismiss button (card only) |

**Token usage** (→ Pillar 2 Role)

- `--status-warning`, `--destructive`, `--status-success`, `--status-info` (icon tint via `color-mix`, CTA, row accent) · `--primary` (default `--row` left accent when no status) · `--card`, `--muted` (row bg, close hover) · `--border` (card divider); `--foreground`, `--foreground-muted`, `--muted-foreground` · `--radius-md`, `--radius-sm`; `--font-ui`

**Usage** — Use `.alert--card` in the dashboard alerts panel (stacked, dismissible, with renew/manage CTAs); use `.alert--row` for inline page warnings like low-stock or region banners. Avoid for a single editorial hint — use the Info banner instead.

**Do & Don't**

- ✅ Do match the status modifier to severity so the icon tint and CTA color stay coherent.
- ✅ Do use a filled lucide glyph in `.alert__icon` (matches the card spec).
- ❌ Don't add a close button to `.alert--row` — close styling exists for `--card` only.


**Code example**

```html
<div class="alert alert--card alert--warning">
  <div class="alert__icon"><i data-lucide="alert-triangle" class="ztor-icon"></i></div>
  <div class="alert__body">
    <div class="alert__title">IP rental expires in 6 days</div>
    <div class="alert__desc"><em>Neon Tide</em> license expires May 25.</div>
    <a class="alert__cta" href="my-ip.html">Renew</a>
  </div>
  <button class="alert__close" aria-label="Dismiss"><i data-lucide="chevron-right" class="ztor-icon"></i></button>
</div>
```

**CSS** — [`alert.css`](./ds-components/alert.css)

---

### 4.14 Accordion

> **2026-07-10 標註：** 行銷站遺留元件，admin 後台（本產品）未使用／marketing-site legacy, unused in the admin app。內容與 CSS 保留不刪。

**`_layer`** · molecule — Stack of collapsible items; each is a full-width trigger with a rotating chevron over a height-animated content panel (FAQ pattern).

**Anatomy**

```
.ztor-accordion
 └ .ztor-accordion__item [data-state="open|closed"]   (hairline dividers)
     ├ .ztor-accordion__trigger  (full-width button)
     │   ├ <text>
     │   └ .ztor-accordion__chevron ▾  (rotates 180° when open)
     └ .ztor-accordion__content
         └ <p>
```

**Variants** — Single variant.

**Sizes** — Single size (trigger pad `24px 0`; open content `max-height: 320px`, pad `0 0 24px`).

**States**

| State | Selector | Change |
|---|---|---|
| default / closed | — | `content` `max-height:0`, overflow hidden, chevron upright |
| hover | `.ztor-accordion__trigger:hover` | Trigger text → `--foreground-muted` |
| focus | `.ztor-accordion__trigger:focus-visible` | `2px solid var(--ring)` outline, `4px` offset |
| open | `.ztor-accordion__item[data-state="open"]` | Chevron rotates `180deg`; content expands to `320px` + pad |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.ztor-accordion` | Column container for items |
| `.ztor-accordion__item` | Row with top/bottom hairline dividers; carries `data-state` |
| `.ztor-accordion__trigger` | Full-width 16px/500 button, space-between layout |
| `.ztor-accordion__chevron` | 16px caret, rotates on open |
| `.ztor-accordion__content` | Overflow-hidden, height-animated panel (`<p>` body 14px) |

**Token usage** (→ Pillar 2 Role)

- `--border` (item dividers) · `--foreground`, `--foreground-muted`, `--muted-foreground` (trigger / hover / chevron) · `--ring` (focus outline) · `--font-ui`, `--font-body`; `--duration`, `--easing` (chevron + height transitions)

**Usage** — Use for collapsible Q&A / disclosure lists where only some items are open at a time. Avoid when all content must be visible at once, or when each section is a full navigable view — use Tabs.

**Do & Don't**

- ✅ Do toggle `data-state="open"` on the `.ztor-accordion__item` to drive both chevron rotation and content height.
- ✅ Do keep body copy within the `320px` open max-height (or raise it deliberately).
- ❌ Don't animate with display:none — the height transition relies on `max-height`/`overflow`.


**Code example**

```html
<div class="ztor-accordion">
  <div class="ztor-accordion__item" data-state="open">
    <button class="ztor-accordion__trigger" aria-expanded="true" aria-controls="faq-1">
      How do payouts work?
      <svg class="ztor-accordion__chevron"><!-- chevron --></svg>
    </button>
    <div class="ztor-accordion__content" id="faq-1">
      <p>Funds settle after a T+7 dispute window, then move to your payout balance.</p>
    </div>
  </div>
</div>
```

**CSS** — [`accordion.css`](./ds-components/accordion.css)

---

### 4.15 Tabs

**`_layer`** · molecule — Horizontal tab bar with a hairline underline and orange active accent, paired with `.tab-panel` one-at-a-time switching.

**Anatomy**

```
.tabs (role="tablist")
 ├ .tabs__item--active   (foreground + orange underline)
 │   └ .tabs__item-count  (optional pill badge)
 └ .tabs__item …
─────────────────────────────────────
.tab-panel               (display:none)
.tab-panel--active       (display:block)
```

**Variants** — Base underline style, plus two opt-in modifiers: `.tabs--brand` (soft orange pill active fill instead of the underline) and `.tabs--underline-short` (base divider off, active underline shortened + centered to ~text width instead of full-width — E-Shop F3 type switch, Figma node 671-2337/671-2295; separator is left to the consuming context, e.g. a downward toolbar shadow). Optional `.tabs__item-count` pill badge on an item. Items may render as `<button>` (programmatic) which strips default button chrome.

**Sizes** — Single size (`.tabs__item` pad `10px 14px`, 13px / 500).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | Item color `--muted-foreground`, transparent 2px bottom border |
| hover | `.tabs__item:hover` | Color → `--foreground` |
| active | `.tabs__item--active` | Color `--foreground` + `--primary` (orange) bottom border |
| focus | `button.tabs__item:focus-visible` | `2px solid var(--primary)` outline, 2px offset |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.tabs` | Flex tab bar with bottom hairline + 20px bottom margin |
| `.tabs__item` | Tab button/link, subtle by default, transparent underline |
| `.tabs__item--active` | Foreground color + orange `--primary` underline |
| `.tabs__item-count` | Optional 11px count pill in `--muted` |
| `.tabs--underline-short` | Opt-in modifier: base gray divider off, active underline shortened + centered (`--sp-12` inset each side) instead of full-width. Separator left to the consuming context (E-Shop F3 type switch) |
| `button.tabs__item` | Strips native button chrome when rendered as `<button>` |
| `.tab-panel` | Hidden panel (display:none) |
| `.tab-panel--active` | Shown panel (display:block) |

**Token usage** (→ Pillar 2 Role)

- `--primary` (active underline + focus ring) · `--foreground`, `--muted-foreground` (active/hover vs idle) · `--border` (tab-bar hairline) · `--muted` (count pill bg); `--radius-pill` · `--font-ui`

**Usage** — Use to switch between sibling views of one page section: Earnings (Overview / Transactions / Payouts / Tax), E-Shop (Products / Bundles / Auctions), Projects status filters, Fans CRM views. Avoid for disclosure of optional detail — use Accordion.

**Do & Don't**

- ✅ Do keep exactly one `.tabs__item--active` and its matching `.tab-panel--active` in sync.
- ✅ Do use `.tabs__item-count` for record counts (e.g. Transactions 214).
- ❌ Don't use the orange underline anywhere it isn't a structural active indicator — orange stays reserved.
- ❌ Don't leave native button borders on `<button>` tabs; apply `button.tabs__item` reset.


**Code example**

```html
<nav class="tabs" role="tablist">
  <button class="tabs__item tabs__item--active" data-tab="overview" role="tab" aria-selected="true">Overview</button>
  <button class="tabs__item" data-tab="transactions" role="tab" aria-selected="false">
    Transactions <span class="tabs__item-count">214</span>
  </button>
</nav>
<div class="tab-panel tab-panel--active" data-panel="overview" role="tabpanel">…</div>
<div class="tab-panel" data-panel="transactions" role="tabpanel">…</div>
```

**CSS** — [`tabs.css`](./ds-components/tabs.css)

---

### 4.16 Cookie banner

> **2026-07-10 標註：** 行銷站遺留元件，admin 後台（本產品）未使用／marketing-site legacy, unused in the admin app。內容與 CSS 保留不刪。

**`_layer`** · molecule — Bottom-right floating consent pill with a copy line, a primary "Okay" button, and an underlined "Cookie Settings" text link.

**Anatomy**

```
.ztor-cookie-banner                    (fixed bottom-right · radius-xl · shadow-float · E3)
  .ztor-cookie-banner__copy            (flex:1 muted consent prose)
  .ztor-cookie-banner__actions         (right cluster · gap 12)
    .btn.btn--primary                  ("Okay")
    .ztor-cookie-banner__settings      (underlined text link · "Cookie Settings")
```

**Variants** — Single variant.

**Sizes** — Single size (`max-width: 380px`; mobile ≤480px goes full-width edge-to-edge with `--radius-lg`).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | White `--card` pill, fixed `bottom:24px / right:24px`, `z-index:100` |
| settings hover | `.ztor-cookie-banner__settings:hover` | Link color shifts `--muted-foreground` → `--foreground` |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.ztor-cookie-banner` | Fixed bottom-right pill, `--radius-xl`, `--shadow-card`, `padding 16px 20px`, 13px body type |
| `.ztor-cookie-banner__copy` | `flex:1` muted consent text (`--foreground-muted`) |
| `.ztor-cookie-banner__actions` | Right-side flex cluster, `gap:12px`, `flex-shrink:0` |
| `.ztor-cookie-banner__settings` | Transparent text-link button, underlined with `text-underline-offset:2px` |

**Token usage** (→ Pillar 2 Role)

- `--card` (pill bg) · `--foreground` (text) · `--foreground-muted` (copy) · `--muted-foreground` (settings link idle) · `--radius-xl` (desktop) · `--radius-lg` (mobile) · `--shadow-card` · `--font-body` (copy) · `--font-ui` (settings link)

**Usage** — Use when first-visit consent must surface without blocking the page. Avoid when the message is blocking/legal-modal territory — use a dialog, not a corner pill.

**Do & Don't**

- ✅ Do keep the copy to one short sentence so the pill stays compact.
- ✅ Do pair a primary "Okay" with the low-emphasis "Cookie Settings" link.
- ❌ Don't stack more than two actions in `__actions`.
- ❌ Don't raise `z-index` above modal/toast layers — it must sit under them.


**Code example**

```html
<aside class="ztor-cookie-banner">
  <p class="ztor-cookie-banner__copy">We use cookies to remember your studio preferences.</p>
  <div class="ztor-cookie-banner__actions">
    <button class="btn btn--primary">Okay</button>
    <button class="ztor-cookie-banner__settings">Cookie Settings</button>
  </div>
</aside>
```

**CSS** — [`cookie-banner.css`](./ds-components/cookie-banner.css)

---

### 4.17 Empty stub

**`_layer`** · molecule — Centered placeholder page for routes reserved but not built yet; explicitly signals "this page is a stub" rather than a real empty state.

**Anatomy**

```
.empty-stub                            (grid place-items:center · min-height 70vh)
  .empty-stub__inner                   (max 460 · vertical stack · centered)
    .empty-stub__mark                  (56×56 orange chip · big display letter)
    .empty-stub__title                 (display 28 / 500)
    .empty-stub__sub                   (muted prose)
    .empty-stub__refs                  (optional · wrap of static chips)
```

**Variants** — Single variant (with/without the optional `.empty-stub__refs` chip row).

**Sizes** — Single size (`min-height: 70vh`, inner `max-width: 460px`).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | Static centered layout; no hover/active/disabled states |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.empty-stub` | `display:grid; place-items:center`, `min-height:70vh`, centered text, 40px padding |
| `.empty-stub__inner` | Column stack, `max-width:460px`, `gap:12px`, centered |
| `.empty-stub__mark` | 56×56 orange `--primary` chip, `--radius-md`, 24px display letter, 1px hairline ring |
| `.empty-stub__title` | Display 28px / 500, `letter-spacing:-0.5px` |
| `.empty-stub__sub` | `--foreground-muted` description |
| `.empty-stub__refs` | Optional centered wrap row (`gap:6px`) for static spec/source chips |

**Token usage** (→ Pillar 2 Role)

- `--primary` (mark bg) · `--primary-foreground` (mark letter) · `--foreground-muted` (sub) · `--radius-md` (mark) · `--font-display` (mark + title)

**Usage** — Use when a route exists in nav but the screen is not implemented, so the user/reviewer sees an intentional stub. Avoid for a built screen that simply has no data — use a real empty state ("No transactions yet") there instead.

**Do & Don't**

- ✅ Do put a single letter in `__mark` that signals the page (e.g. "M" for Messages).
- ✅ Do use `__refs` chips to point at the spec section that will fill the route.
- ❌ Don't use this for a loaded-but-empty data view.
- ❌ Don't add interactive controls — it's a non-actionable placeholder.


**Code example**

```html
<div class="empty-stub">
  <div class="empty-stub__inner">
    <div class="empty-stub__mark">M</div>
    <h2 class="empty-stub__title">Stub page</h2>
    <p class="empty-stub__sub">This route is reserved but not built yet.</p>
    <div class="empty-stub__refs">
      <span class="chip chip--static">spec §03 §5.1.X</span>
    </div>
  </div>
</div>
```

**CSS** — [`empty-stub.css`](./ds-components/empty-stub.css)

---

### 4.18 Selection card

**`_layer`** · molecule — Click-to-select 1-of-N card with composable slots (title + sub + tag + optional swatch); merged from the wizard radio card and the settings theme picker.

**Anatomy**

```
.selection-grid                        (auto-fit min 220px grid)
  OR .selection-grid--3                (forced 3 equal columns · theme picker)
  .selection-card                      (soft-shadow surface · cursor pointer)
    .selection-card__swatch            (optional · 64px preview block)
      .selection-card__swatch--theme-light|dark|system
    .selection-card__title             (required · 14px / 500)
    .selection-card__sub               (optional · 12px muted)
    .selection-card__tag               (optional · corner uppercase chip)
  .selection-card--active              (orange outline + tinted bg)
```

**Variants** — Two canonical compositions: (A) Wizard radio card = title + sub + tag (no swatch); (B) Settings theme picker = swatch + title (+ optional sub), with `--theme-light / --theme-dark / --theme-system` swatch fills.

**Sizes** — Single card size; grid density via `.selection-grid` (auto-fit min 220px) vs `.selection-grid--3` (forced 3 columns).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | `--card` bg + soft card shadow (`--shadow-card`) |
| hover | `.selection-card:hover` | Shadow lifts to `--shadow-card-hover` |
| active/selected | `.selection-card--active` | Tinted bg (`color-mix --primary 16%`) + 2px `--primary` outline + 1px shadow; `__tag` recolors to `--primary-foreground` |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.selection-grid` | Auto-fit `minmax(220px, 1fr)` grid, `gap:12px` |
| `.selection-grid--3` | Forces 3 equal columns (theme picker) |
| `.selection-card` | Column flex card, `--radius-md`, hairline ring, `cursor:pointer`, 150ms transitions |
| `.selection-card--active` | Selected state: tinted bg + double orange outline; recolors child `__tag` |
| `.selection-card__title` | Required label, `--font-ui` 14px / 500 |
| `.selection-card__sub` | Optional 12px muted description |
| `.selection-card__tag` | Absolute top-right uppercase chip, 11px, `letter-spacing:0.4px` |
| `.selection-card__swatch` | Optional 64px preview block, `--radius-sm`, 1px border |
| `.selection-card__swatch--theme-light/dark/system` | Diagonal-gradient theme previews |

**Token usage** (→ Pillar 2 Role)

- `--card` (bg) · `--border` (idle ring) · `--foreground-muted` (hover ring + sub) · `--muted-foreground` (tag) · `--primary` (active outline) · `--primary-foreground` (active tag) · `--radius-md` (card) · `--radius-sm` (swatch) · `--font-ui` (title/tag)
- **Token exception（記錄在案）**：`__swatch--theme-*` 的漸層用寫死 hex（`#FAFAF7` / `#191A1A` / `#ffa33f`）——縮圖畫的是「light / dark 主題長什麼樣」的固定預覽，本來就不該跟著當前主題變色。

**Usage** — Use when the user picks one option from a small visible set (account type, theme) and you want the choices laid out as tactile cards. Avoid for long lists or multi-select — use a list/checkboxes there.

**Do & Don't**

- ✅ Do keep exactly one `--active` card per group (single-select).
- ❌ Don't mix swatch and tag in the same card — they're for different compositions.
- ❌ Don't use it for multi-select; the active treatment reads as 1-of-N.


**Code example**

```html
<div class="selection-grid">
  <button class="selection-card selection-card--active">
    <div class="selection-card__title">Solo artist</div>
    <div class="selection-card__sub">Single creator profile</div>
    <span class="selection-card__tag">Recommended</span>
  </button>
  <button class="selection-card">
    <div class="selection-card__title">Studio / label</div>
    <div class="selection-card__sub">Multiple creators, shared payouts</div>
  </button>
</div>
```

**CSS** — [`selection-card.css`](./ds-components/selection-card.css)

---

### 4.19 Composer

**`_layer`** · molecule — Drop-or-type input card with a bottom action bar: left tool icons, right credit meter and a circular send button that flips to orange when there's content.

**Anatomy**

```
.composer                              (outer surface card · radius-xl · overflow hidden)
  .composer__drop                      (large drop / idle-copy zone · surface-muted)
   OR .composer__textarea              (typed-input variant of the same slot)
  .composer__bar                       (bottom action row · hairline top border)
    .composer__bar-group               (left slot · tool icons)
      .composer__icon-btn              (32×32 neutral icon affordance · 18px glyph)
    .composer__bar-group               (right slot)
      .composer__credits               (small muted meter text)
      .composer__send                  (36px circular submit · gray → orange)
```

**Variants** — Two input modes in the top slot: drop zone (`.composer__drop`) vs typed input (`.composer__textarea`). Send button: `.composer__send` (idle gray) vs `.composer__send--active` (primary orange when submittable).

**Sizes** — Single size; drop/textarea `min-height:132px`. Mobile ≤640px tightens to `min-height:104px`, shrinks bar padding, and hides `.composer__credits`.

**States**

| State | Selector | Change |
|---|---|---|
| default | — | `surface-muted` drop zone, subtle copy; gray idle send |
| dragover | `.composer.is-dragover .composer__drop` | Drop zone gets `--primary 12%` tint + inset 1px `--primary` ring; copy darkens to `--foreground` |
| icon hover | `.composer__icon-btn:hover` | Icon → `--foreground`, bg → `--muted` |
| send hover | `.composer__send:hover` | Bg darkens (`--foreground 10%` mix), color → `--foreground` |
| send active (has content) | `.composer__send--active` | Flips to `--primary` bg + `--primary-foreground` + 1px hairline |
| send press | `.composer__send:active` | `translateY(0.5px)` nudge |
| send disabled | `.composer__send:disabled` / `[aria-disabled="true"]` | `opacity:0.5`, `cursor:not-allowed`, pointer-events off |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.composer` | Outer surface card, `--radius-xl`, `--shadow-card`, column flex, `overflow:hidden` |
| `.composer__drop` | 132px drop zone, `surface-muted`, centered subtle idle copy |
| `.composer.is-dragover` | Activates the drag-over tint + ring on the inner `__drop` |
| `.composer__textarea` | Typed-input variant of the slot: borderless 132px textarea, `--font-body` 14px |
| `.composer__bar` | Bottom action row, space-between, 1px `--border` top divider |
| `.composer__bar-group` | Left/right flex slot inside the bar, `gap:8px` |
| `.composer__icon-btn` | 32×32 transparent icon button (upload/mic), 18px lucide glyph |
| `.composer__credits` | Small muted credit-meter text, no-wrap |
| `.composer__send` | 36px circular submit, idle gray |
| `.composer__send--active` | Flips send pill to primary orange when there's content |

**Token usage** (→ Pillar 2 Role)

- `--card` (card / bar / textarea text) · `--muted` (drop zone, idle send, icon hover) · `--border` (bar divider) · `--foreground` / `--muted-foreground` (copy, icons, credits) · `--primary` / `--primary-hover` / `--primary-foreground` (dragover tint + active send) · `--radius-xl` (card) · `--radius` / `--radius-sm` (icon btn) · `--shadow-card` · `--font-ui` (chrome) · `--font-body` (textarea)

**Usage** — Use when a creator submits a prompt or uploads an asset and you need a single card combining input, tool affordances, a credit meter, and submit. Avoid for plain single-line fields — use a standard input/textarea without the action bar.

**Do & Don't**

- ✅ Do add `.composer__send--active` only once there's real content to submit.
- ✅ Do show remaining credits in `.composer__credits` so the user knows the cost before sending.
- ❌ Don't leave the send button orange when the input is empty.
- ❌ Don't crowd the left `__bar-group` — keep it to a couple of tool icons.


**Code example**

```html
<div class="composer">
  <div class="composer__drop">Drop a file here, or type a prompt…</div>
  <div class="composer__bar">
    <div class="composer__bar-group">
      <button class="composer__icon-btn" aria-label="Upload"><i data-lucide="paperclip" class="ztor-icon"></i></button>
      <button class="composer__icon-btn" aria-label="Voice"><i data-lucide="mic" class="ztor-icon"></i></button>
    </div>
    <div class="composer__bar-group">
      <span class="composer__credits">120 credits left</span>
      <button class="composer__send composer__send--active" aria-label="Send"><i data-lucide="arrow-up" class="ztor-icon"></i></button>
    </div>
  </div>
</div>
```

**CSS** — [`composer.css`](./ds-components/composer.css)

---

### 4.20 Header (app topbar)

**`_layer`** · organism — Canonical 64px **sticky** app topbar: brand logo left, semantic nav with a sliding highlight pill + mega-dropdown groups, right action cluster (theme · search · language · notifications · avatar). This is the **real shipped topbar** (`.app-topbar`, injected by `sidebar.js`); product pages load it from `ds-components/header.css` via a `shared.css` `@import`, and `design-system.html` links it directly.

**Anatomy**

```
.app-topbar (64px, position:sticky top:0, bg --card, bottom 1px hairline, z 50)
├─ .app-topbar__brand > .app-topbar__brand-logo (24px SVG wordmark)
├─ nav > ul.app-topbar__nav
│  ├─ .app-topbar__nav-highlight (one sliding pill — rests on active, glides on hover)
│  ├─ .app-topbar__link (a)   ← [aria-current="page"] = active
│  └─ .app-topbar__nav-group > .app-topbar__link--group (+ chevron)
│        └─ .app-topbar__dropdown--mega > .app-topbar__dropdown-option (icon + title + sub)
└─ .app-topbar__actions (margin-left:auto)
   ├─ .app-topbar__icon-btn (theme · search · notifications + .app-topbar__badge-dot)
   ├─ .app-topbar__lang (EN · 中 pill)
   └─ .app-topbar__avatar (32px)
```

**Variants** — Single bar. Nav items: plain `.app-topbar__link` vs `--group` (mega-dropdown trigger). Dropdown panel: `.app-topbar__dropdown--mega` (wide) / `--right` (right-aligned).

**Sizes** — Single size: fixed `height: 64px`, `0 32px` padding, `24px` gap; links 36px tall.

**States**

| State | Selector | Change |
|---|---|---|
| default | `.app-topbar` | Sticky, `--card` fill, bottom `1px` hairline, `z-index: 50` |
| link hover / active | `:hover` / `[aria-current="page"]` | Text → `--foreground`; shared highlight pill slides under it (`--muted`) |
| group open | `[aria-expanded="true"]` | Chevron rotates 180°; `.app-topbar__dropdown[data-state="open"]` fades + slides in |
| scrolled (dark) | `.app-topbar.is-scrolled` | Dark mode only: frosted blur + slight darken so a hero photo doesn't bleed through |
| mobile (≤900px) | `@media (max-width: 900px)` | Bar wraps; `.app-topbar__nav` hidden (compact nav via JS) |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.app-topbar` / `__brand` / `__brand-logo` | 64px sticky bar / brand link / 24px SVG wordmark |
| `__nav` / `__link` (+ `--group`) / `__nav-highlight` | Semantic nav list / nav item / mega trigger / sliding highlight pill |
| `__dropdown` (+ `--mega` / `--right`) / `__dropdown-option` (+ `-icon` / `-text` / `-title` / `-sub`) | Panel + variants / option row |
| `__actions` / `__icon-btn` (+ `__badge-dot`) / `__lang` / `__avatar` | Right cluster / 36px icon button (+ unread dot) / language pill / 32px avatar |
| `__search-menu` / `__search-panel` / `__search-input` / `__search-kbd` | Search trigger + dropdown panel + input + ⌘K hint |

**Token usage** (→ Pillar 2 Role)

- `--card` (bar fill) · `--border` (bottom hairline + dropdown edge) · `--muted` (highlight pill, icon-btn hover, option hover) · `--foreground` / `--foreground-muted` / `--muted-foreground` (brand / links / sub-labels) · `--primary` (unread `__badge-dot`) · `--background` (dropdown panel fill — opaque over hero) · `--radius-md` / `--radius-lg` / `--radius-pill` · `--shadow-float` (dropdown panel, E3) · `--duration` / `--easing` · `--font-ui`

**Usage** — The single persistent topbar on every product page, injected by `sidebar.js` at `#sidebar`/`#topbar`. Nav order follows the sitemap; mega-dropdowns group IP Bank / E-Shop / Fans sub-routes. Promote new global actions into `__actions` rather than adding a second bar.

**Do & Don't**

- ✅ Do use the one sliding highlight pill for hover + active, not a per-link background.
- ✅ Do keep dropdown panels on `--background` so dark-mode translucency stays opaque over the hero.
- ❌ Don't put the orange primary in the bar — nav stays neutral; orange is for the unread dot only.
- ❌ Don't hard-code nav items per page — they come from one definition in `sidebar.js`.


**Code example**

```html
<header class="app-topbar" id="sidebar"></header>
<script src="sidebar.js"></script>  <!-- injects brand + nav + actions -->

<!-- rendered structure -->
<header class="app-topbar">
  <a class="app-topbar__brand"><svg class="app-topbar__brand-logo">…</svg></a>
  <nav><ul class="app-topbar__nav">
    <li><a class="app-topbar__link" aria-current="page">Dashboard</a></li>
    <li class="app-topbar__nav-group"><button class="app-topbar__link app-topbar__link--group">IP Bank</button>…</li>
  </ul></nav>
  <div class="app-topbar__actions">…</div>
</header>
```

**CSS** — [`header.css`](./ds-components/header.css) (canonical; product pages load it via `shared.css` `@import`)

### 4.21 Footer

> **2026-07-10 標註：** 行銷站遺留元件，admin 後台（本產品）未使用／marketing-site legacy, unused in the admin app。內容與 CSS 保留不刪。

**`_layer`** · organism — Pure-black hi-contrast brand epilogue: 2fr brand column + four link columns, white-on-black slab.

**Anatomy**

```
.ztor-footer (bg --surface-inverse, color --foreground-on-inverse, padding 80px 24px)
└─ .ztor-footer__inner (max-width 1248px, centered, grid 2fr repeat(4,1fr), gap 48)
   ├─ .ztor-footer__brand (flex column, gap 16)
   │   ├─ .ztor-footer__wordmark (Geist 32/500, letter-spacing -0.5)
   │   └─ .ztor-footer__tagline (body 14/1.5, muted, max 32ch)
   ├─ .ztor-footer__col ×4
   │   ├─ h4 (Geist 13/500)
   │   └─ ul > li > a (body 14, muted → full white on hover)
   └─ .ztor-footer__bottom (margin-top 48, border-top hairline, flex space-between, 12px)
```

**Variants** — Single variant.

**Sizes** — Single size (fixed `padding: 80px 24px`).

**States**

| State | Selector | Change |
|---|---|---|
| default | `.ztor-footer__col a` | `--foreground-on-inverse-muted` link color |
| hover | `.ztor-footer__col a:hover` | Brightens to `--foreground-on-inverse` (full white); `transition: color var(--duration) var(--easing)` |
| mobile (≤768px) | `@media (max-width: 768px)` | `.ztor-footer__inner` → 1 column, `gap: 32px`; `.ztor-footer__bottom` → column, `gap: 8px` |
| reduced-motion | `@media (prefers-reduced-motion: reduce)` | Link color `transition: none` |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.ztor-footer` | Black slab; `--surface-inverse` bg, `--foreground-on-inverse` text, `80px 24px` padding |
| `.ztor-footer__inner` | 1248px rail; grid `2fr repeat(4, 1fr)`, `gap: 48px` |
| `.ztor-footer__brand` | Brand column; flex column, `gap: 16px` |
| `.ztor-footer__wordmark` | Large brand mark; Geist 32/500, `letter-spacing: -0.5px` |
| `.ztor-footer__tagline` | Muted tagline; body 14/1.5, `max-width: 32ch` |
| `.ztor-footer__col` | Link column; `h4` heading + `ul` list (`gap: 8px`) of muted links |
| `.ztor-footer__bottom` | Bottom rule row; top hairline `rgba(255,255,255,0.1)`, flex space-between, 12px text |

**Token usage** (→ Pillar 2 Role)

- `--surface-inverse` (slab bg) · `--foreground-on-inverse` (headings, hover) · `--foreground-on-inverse-muted` (links, tagline, bottom) · `--font-ui` (wordmark, column headings) · `--font-body` (tagline, links, bottom) · `--duration` · `--easing` (link hover transition)

**Usage** — Use as the closing hi-contrast brand break / sitemap at page bottom. Avoid treating it as a dark theme — it is a one-off black slab, not a themeable surface.

**Do & Don't**

- ✅ Do keep links muted by default and let them brighten to full white only on hover.
- ✅ Do collapse to a single column at the 768px breakpoint for mobile.
- ❌ Don't put the highlighter-orange primary on the black slab — keep it white/muted-white only.
- ❌ Don't exceed four link columns; the grid is `2fr repeat(4, 1fr)`.


**Code example**

```html
<footer class="ztor-footer">
  <div class="ztor-footer__inner">
    <div class="ztor-footer__brand">
      <span class="ztor-footer__wordmark">Ztor</span>
      <p class="ztor-footer__tagline">The operations studio for creators.</p>
    </div>
    <div class="ztor-footer__col">
      <h4>Studio</h4>
      <ul><li><a href="projects.html">Projects</a></li><li><a href="earnings.html">Earnings</a></li></ul>
    </div>
    <!-- 3 more __col -->
  </div>
  <div class="ztor-footer__bottom"><span>© 2026 Ztor</span><span>Terms · Privacy</span></div>
</footer>
```

**CSS** — [`footer.css`](./ds-components/footer.css)

---

### 4.22 Data list

**`_layer`** · organism — Row-divider list (icon chip + body + right amount), no per-row card; for dense record rows like earnings, payouts, products, projects.

**Anatomy**

```
.data-list (flex column)
└─ .data-list__row (grid minmax(0,1fr) auto, gap 12, padding 12px 0, border-bottom --border)
   ├─ .data-list__row-main (flex, gap 12, min-width 0)
   │   ├─ .data-list__icon (40×40, radius 10, --muted bg, --foreground-muted)
   │   │   └─ <i class="ztor-icon"> (20px outline lucide)
   │   └─ .data-list__body (flex column, gap 2)
   │       ├─ .data-list__title (Geist 13.5/500, truncated ellipsis)
   │       └─ .data-list__meta   (12px --muted-foreground)
   └─ .data-list__amount (Display 15/500, right-aligned)
        └─ .data-list__amount--neg (--destructive)
last .data-list__row → border-bottom: 0
```

**Variants** — Icon semantic hooks only: `.data-list__icon--neutral|success|error|info` — all four render identical monochrome chips (`--muted` bg + `--foreground-muted`); colored fills were retired 2026-05-25. Semantic color lives on the amount, not the chip.

The shared `transaction-list` renderer (components.js) composes this list with an optional trailing status badge. The status column is **per-call**: Earnings renders it; Dashboard F3 passes `hideStatus` to drop it, because F3 lists settled income only (status is always settled — spec 5.1.1 §F3).

**Sizes** — Single size (40px icon chip, `12px 0` rows).

**States**

| State | Selector | Change |
|---|---|---|
| default | `.data-list__row` | Hairline `border-bottom: 1px solid var(--border)` |
| last row | `.data-list__row:last-child` | `border-bottom: 0` |
| negative amount | `.data-list__amount--neg` | Amount color → `--destructive` |
| filtered out | `.data-list__row[hidden]` | `display: none` — must win over the row's own `display: grid`, or a filtered row stays visible (promoted from a pickup-detail.html page-local override, 2026-07-11) |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.data-list` | Flex-column container of rows |
| `.data-list__row` | Grid `minmax(0,1fr) auto`; `padding: 12px 0`, bottom hairline |
| `.data-list__row-main` | Left group (icon + body); flex, `gap: 12px`, `min-width: 0` for truncation |
| `.data-list__icon` | 40×40 `radius 10px` neutral chip, `inline-grid` centered glyph |
| `.data-list__icon--neutral / --success / --error / --info` | Semantic hook only — visually identical neutral chip |
| `.data-list__body` | Title + meta stack; flex column, `gap: 2px`, `min-width: 0` |
| `.data-list__title` | Geist 13.5/500, ellipsis-truncated single line |
| `.data-list__meta` | 12px `--muted-foreground` secondary line |
| `.data-list__amount` | Display 15/500, `letter-spacing: -0.3px`, right-aligned |
| `.data-list__amount--neg` | Switches amount to `--destructive` |

**Token usage** (→ Pillar 2 Role)

- `--border` (row dividers) · `--muted` (icon chip bg) · `--foreground-muted` (chip glyph) · `--muted-foreground` (meta) · `--destructive` (negative amount) · `--font-ui` (title) · `--font-display` (amount)

**Usage** — Use when rows of records need vertical density without a card per row. Avoid when ≥3 data columns need column alignment — use `.ztor-table` instead.

**Do & Don't**

- ✅ Do keep the icon chip neutral and carry status via `.data-list__amount--neg` or the meta text.
- ✅ Do use 20px outline lucide glyphs in `.ztor-icon` so chips match the `.alert--card` panel.
- ❌ Don't re-introduce colored icon fills — the `--success/--error/--info` hooks are intentionally monochrome.
- ❌ Don't wrap each row in its own card; the divider list is the whole point of this organism.


**Code example**

```html
<div class="data-list">
  <div class="data-list__row">
    <div class="data-list__row-main">
      <div class="data-list__icon data-list__icon--success">
        <i data-lucide="receipt" class="ztor-icon"></i>
      </div>
      <div class="data-list__body">
        <div class="data-list__title">Pre-order · Coastline EP</div>
        <div class="data-list__meta">Project · 2 hours ago</div>
      </div>
    </div>
    <div class="data-list__amount">+$1,410.00</div>
  </div>
</div>
```

**CSS** — [`data-list.css`](./ds-components/data-list.css)

---

### 4.22b Picker

**`_layer`** · organism — 搜尋框＋可捲動挑選清單，用於從既有紀錄挑選（spec 5.1.5.4 建立套組「Items」；IP rental linker 等可復用）。

**Anatomy**

```
┌────────────────────────────────────────┐
│ 🔍 Search your products…   │ ＋ New item │ └ .picker__search（input + __new）
├────────────────────────────────────────┤
│ ⬡ Art Print   Posters & prints   $11.00 │ ┐
│ ⬡ Cassette    Music              $12.00 │ ┘ .picker__list（內含 .data-list rows）
└────────────────────────────────────────┘
```

**Composition** — 外框＝picker；列＝復用 `.data-list`（`__row` / `__icon` / `__body` / `__end`）。

**Class API**

| Class | Effect |
|---|---|
| `.picker` | 框線容器，`--radius-md`，overflow hidden |
| `.picker__search` / `__search-input` | 上方搜尋列（細邊底）＋無框 flex 輸入 |
| `.picker__new` | 右側動作（＋ New item），左細邊，accent 文字 |
| `.picker__list` | max-height 240px，縱向捲動 |

**Token usage** (→ Pillar 2 Role)

- border `--border` · radius `--radius-md` · 列復用 data-list tokens · hover `--muted`

**Usage** — 「從既有清單挑選 N 筆」的情境（建立套組、IP rental linker）。列一律復用 `.data-list`，picker 只負責搜尋列與捲動外框。一般資料表用 `data-list` / `table`，不用 picker。

**Do & Don't**

- ✅ Do 列內容複用 `.data-list`；picker 只負責搜尋與捲動外框。
- ✅ Do 主要新增動作放搜尋列右側的 `.picker__new`。
- ❌ Don't 當一般資料表用（那是 `data-list` / `table`）。

**Code example**

```html
<div class="picker">
  <div class="picker__search">
    <input class="picker__search-input" placeholder="Search your products…">
    <button class="picker__new">＋ New item</button>
  </div>
  <div class="picker__list">
    <div class="data-list"> … rows … </div>
  </div>
</div>
```

**CSS** — [`picker.css`](./ds-components/picker.css)

---

### 4.22c Field pill

**`_layer`** · molecule — 行內控制 pill（白底＋1px `--border`），篩選列用。2026-06-12 從 e-shop 工具列 promote，並補上參考圖缺的「下拉觸發」變體。

**Content variants（擇一）**

| 變體 | class | 用途 |
|---|---|---|
| 搜尋 | `.field-pill__input`（配 `--grow`） | 關鍵字搜尋框 |
| 下拉 | `.field-pill__select` | 原生 `<select>` 篩選（狀態等） |
| 選單觸發 | `.field-pill__label` + `__chevron` | 自管 click→menu（`All Tags ▾`） |

**Anatomy** — `.field-pill`（pill）→ `__icon`（前置）＋ 內容 ＋ `__chevron`（後置，下拉才放）。

**States**

| State | Selector | Change |
|---|---|---|
| default | — | bg `--card`, 1px `--border`, radius `--radius-md` |
| hover | `:hover` | bg `--muted` |
| focus | `:focus-within` | `--ring` ＋ 4px 橘暈 |

**Class API**

| Class / modifier | Effect |
|---|---|
| `.field-pill` | 白底＋1px 線框 pill |
| `.field-pill__icon` / `__chevron` | 前置 icon／後置 chevron（`--muted-foreground`） |
| `.field-pill__input` / `__select` / `__label` | 搜尋／原生 select／選單文字 |
| `.field-pill--grow` / `--block` | flex:1／width:100%（chevron 推右） |

**Token usage** — surface `--card` · border `--border` · hover `--muted` · icon `--muted-foreground` · focus `--ring` · radius `--radius-md`

**Usage** — 工具列的篩選／範圍控制。下拉一律前 icon、後 chevron；搜尋變體不放 chevron。主要動作用 `.btn--primary`，不用 field-pill。

**Code example**

```html
<label class="field-pill field-pill--grow">
  <i data-lucide="search" class="ztor-icon field-pill__icon"></i>
  <input class="field-pill__input" placeholder="Filter products">
</label>
<label class="field-pill">
  <i data-lucide="sliders-horizontal" class="ztor-icon field-pill__icon"></i>
  <select class="field-pill__select"><option>All status</option></select>
  <i data-lucide="chevron-down" class="ztor-icon field-pill__chevron"></i>
</label>
```

**CSS** — [`field-pill.css`](./ds-components/field-pill.css)

---

### 4.22d Segmented

**`_layer`** · molecule — 軌道內的互斥文字切換，選中段為白色浮起 pill。用於切換同一份資料的視角（Active／Suggested／Inactive）。與 §4.x Tabs（頁區導覽）不同。

**Anatomy**

```
┌─────────────────────────────────────┐  ← .segmented（灰軌道）
│ ▢ Active │  Suggested │  Inactive    │
└─────────────────────────────────────┘
   └ __btn--active（白浮起）  └ __btn
```

**States**

| State | Selector | Change |
|---|---|---|
| default | `.segmented__btn` | 透明底、`--foreground-muted` 文字 |
| hover | `:hover` | 文字 → `--foreground` |
| active | `.segmented__btn--active` | bg `--card`、1px `--border`、`0 1px 2px` 柔陰影 |

**Class API**

| Class | Effect |
|---|---|
| `.segmented` | 灰軌道容器（`color-mix --foreground 5%`），radius-lg，3px padding |
| `.segmented__btn` | 段；靜音文字 |
| `.segmented__btn--active` | 白浮起 pill |

**Token usage** — track `color-mix(--foreground 5%, --muted)` · active `--card` ＋ `--border` · text `--foreground-muted` → `--foreground` · radius `--radius-lg`/`--radius-md`

**Usage** — 同一資料 2–4 個互斥視角。頁面導覽用 `.tabs`；段數超過 ~4 改用 `.field-pill__select` 下拉。

**Code example**

```html
<div class="segmented" role="tablist">
  <button class="segmented__btn segmented__btn--active">Active</button>
  <button class="segmented__btn">Suggested</button>
  <button class="segmented__btn">Inactive</button>
</div>
```

**CSS** — [`segmented.css`](./ds-components/segmented.css)

---

### 4.22e Preview card

**`_layer`** · molecule — 粉絲端即時預覽卡（規格 §5.2.5），鏡像商店端商品卡／拍賣卡，在建立流程的預覽面板內依當下輸入即時渲染。未填欄位用 `.is-empty` 顯示斜體占位（`Product name`／`$0.00`／斜體 `Missing: description`）。

**surface 層** — 卡本體坐 `--card`（白）＋1px `--border`；放在預覽面板 `__body` 的 `--muted`（灰）底上浮起。

**Class API**

| Class | Effect |
|---|---|
| `.preview-card` | 白卡容器，1px border |
| `.preview-card__media` | 主圖 4:3，空時放 icon 占位 |
| `.preview-card__row / __name / __price / __desc` | 名稱｜價格同列、描述 |
| `.preview-card__dots / __meta / __cta` | 拍賣專用：輪播圓點／賣家分類／出價 CTA |
| `.is-empty` | 未填占位（斜體、subtle） |

**Usage** — 商品（實體／數位）用商品卡；拍賣用拍賣卡（多圖圓點＋狀態徽章＋Starting at＋Watch CTA）。徽章複用 `.badge`、CTA 複用 `.btn`。

**CSS** — [`preview-card.css`](./ds-components/preview-card.css)

---

### 4.22f Preview panel

**`_layer`** · organism — 建立流程即時預覽的右側**畫面分割面板**（規格 §5.2.5）——**非浮層遮蓋**。頂部操作欄 Preview 鈕按需開啟：佔版面、把 wizard 壓窄（`body.preview-open`），表單仍可見可編輯、無變暗遮罩；✕ 或 Esc 關閉復位。（2026-06-13 由 overlay+backdrop 改為畫面分割，依使用者反饋。）

**Anatomy**

```
.preview-panel(.is-open)          ← fixed 右側欄，寬 --preview-w，滑入/滑出
  .preview-panel__backdrop        ← 保留 DOM，display:none（分割版無遮罩）
  .preview-panel__sheet           ← 填滿欄（白）
    .preview-panel__head > __title + 關閉鈕
    .preview-panel__body          ← 灰底，襯白色 preview-card
body.preview-open .wizard         ← margin-right: --preview-w（壓窄表單側）
body.preview-open .wizard__bottom ← right: --preview-w（固定底欄同步右移）
```

**Class API**

| Class | Effect |
|---|---|
| `.preview-panel` | fixed 右側欄（寬 `--preview-w`），預設 translateX(100%) 收起 |
| `.is-open` | sheet 滑入 |
| `body.preview-open` | 把 `.wizard` 壓窄、`.wizard__bottom` 右移（畫面分割） |
| `.preview-panel__body` | 內容區，`--muted` 灰底 |

**Usage** — create-product 已接（單一 consumer）。JS 同時切 `.preview-panel.is-open` 與 `body.preview-open`；✕／Esc 關閉。≤760px 無法再壓縮 → 面板改覆蓋。全 token-driven、無遮罩裸色。

**CSS** — [`preview-panel.css`](./ds-components/preview-panel.css)

---

### 4.22g Readiness card

**`_layer`** · molecule — 上架前就緒檢查卡（規格 5.1.5.2 §4.4「Ready to sell?」）。逐項列出要備齊的內容：已備齊打勾（`--status-success` 實心）、未備齊空心圈；卡底 banner 統計還差幾項，全部備齊轉綠字「Ready to sell!」。

**Class API**

| Class | Effect |
|---|---|
| `.readiness` | 卡容器，1px border |
| `.readiness__list / __item(.--done)` | 檢查項；done 態文字轉深、mark 轉綠勾 |
| `.readiness__mark` | 狀態圈（空心 inset 邊框／done 實心綠勾） |
| `.readiness__banner(.--ready)` | 卡底統計；ready 轉 `--status-success` |

**Usage** — create-product 依類型換檢查項（實體 6／數位 5／拍賣 8）；待補項標 pending、不擋上架。建立流程共用。檢查項與硬性必填的對應見規格 §4.4（D026 待協調）。

**Token 例外** — done 勾用 `#fff`（白勾置於 `--status-success` 綠底上），屬固定前景白、非主題色。

**CSS** — [`readiness.css`](./ds-components/readiness.css)

---

### 4.22h Empty card

**`_layer`** · molecule — 卡片內「已載入但沒資料」的空狀態（規格 5.1.1 §F2–F8「其他狀態 · 無資料」）：淡化 icon + 短標題 + 一行引導 + 選配 CTA。與整頁用的 `empty-stub`（路由未建置）區分。儀表板透過 `<html data-data-state="empty">` 與資料視圖互切（`.dash-empty-only` / `.dash-data-only`，見 shared.css）。

**Class API**

| Class | Effect |
|---|---|
| `.empty-card` | 置中直欄堆疊，卡片內距 |
| `.empty-card__icon` | 40×40 淡化 chip（`--muted` 底）內嵌 lucide |
| `.empty-card__title / __text` | 14/600 標題、淡化說明（max 320） |
| `.empty-card__cta` | 選配，用 `.btn` |

**CSS** — [`empty-card.css`](./ds-components/empty-card.css)

---

### 4.22i Notification matrix

**`_layer`** · organism — 設定 → 通知的「事件型別(列) × 管道(欄)」逐格開關矩陣（規格 5.1.9 F3）。每個事件在 Email／Push／站內各自獨立開關。合規通道（`payout_confirmed`、`kyc_state_change`、`compliance_alert` 的 Email）鎖定為開啟，顯示鎖頭、原因寫在 `title`。

**Class API**

| Class | Effect |
|---|---|
| `.notif-matrix` | grid =「label 欄 + 3 管道欄」 |
| `.notif-matrix__corner / __chead` | 左上角格、欄表頭（`--muted` 底） |
| `.notif-matrix__label(__label-title/__label-hint)` | 事件列標題與說明 |
| `.notif-matrix__cell(.--locked)` | 開關格；鎖定格放鎖頭 |
| `.notif-matrix__lock` / `.switch--locked` | 鎖頭色 `--muted-foreground`；鎖定 switch not-allowed、降透明 |

**響應式** — ≤560px 欄寬收窄不換行。

**CSS** — [`notification-matrix.css`](./ds-components/notification-matrix.css)

---

### 4.22j Completeness meter

**`_layer`** · molecule — 緊湊「label + x/y 計數 + 進度條」，顯示資產目前完整度（§7.7 current 值，非凍結值）。近滿以 `--ready` 轉綠。用於 IP Market 卡片。

**Class API**

| Class | Effect |
|---|---|
| `.completeness` | 容器 |
| `.completeness__head / __label / __count` | 標題列：label + x/y |
| `.completeness__track / __fill` | 軌道（`--muted`）/ 填充（`--primary`，inline width 控制） |
| `.completeness--ready` | 近滿時填充與計數轉 `--status-success` |

**CSS** — [`completeness.css`](./ds-components/completeness.css)

---

### 4.22k Insight row

**`_layer`** · molecule — 置於圖表／分布下方的單行自動洞察 callout（如 Fans CRM F3 Pareto）。內容由頁面計算；無合格洞察時整行隱藏（不顯示假 0%）。橘色 tint 條 + 前導 icon + 一句平白結論。

**Class API**

| Class | Effect |
|---|---|
| `.insight-row` | 橘色 12% tint 條容器 |
| `.insight-row__icon` | 16px lucide |
| `.insight-row__text` | 一句結論 |

**CSS** — [`insight-row.css`](./ds-components/insight-row.css)

---

### 4.22l List footer

**`_layer`** · molecule — 分頁清單頁尾，配對「Showing N of M」計數與 Load more 鈕。計數文字與批次邏輯由頁面擁有；清單空時隱藏。用於分批載入的 data-list / product-list。

**Class API**

| Class | Effect |
|---|---|
| `.list-footer` | 左計數、右 Load more 的列容器 |
| `.list-footer__count` | 「Showing N of M」計數 |

**CSS** — [`list-footer.css`](./ds-components/list-footer.css)

---

### 4.22m Message composer

**`_layer`** · organism — 群發訊息「Message your fans」撰寫器（規格 5.1.7.1 v2 / D058）。重用 payout dialog 外殼（`.payout-modal` / `.payout-dialog.msg-dialog` / `__head|__body|__foot` / `.payout-view`）＋ `.tabs` / `.tab-panel`、`.input` / `.textarea` / `.select`、`.switch`、`.badge`、`.btn`。Compose 分頁＝收件分群（單選）＋主旨（≤120）＋內文（≤2000，含 token chip）＋排程開關；History 分頁＝Time／Subject／Audience／Recipients／Open rate／Status 的 data-list，Failed 顯示原因＋Retry。從 Fans CRM page-intro、流失提醒、列級 send icon 開啟。

| Class | 用途 |
|---|---|
| `.msg-dialog` | 加寬至 680px 的 dialog（套在 `.payout-dialog` 上） |
| `.msg-compose` / `.msg-field` | Compose 欄位容器與單一欄位 |
| `.msg-field__label / __label-text / __req` | 欄位標籤列／文字／必填星號 |
| `.msg-schedule` / `.msg-schedule-when` | 排程開關列／日期時間列（`[hidden]` 收合，`.switch` 切換） |
| `.msg-history__head` / `.msg-row` | History 表頭／資料列（6 欄 grid，建在 `.data-list` 上） |
| `.msg-row__time / __subject / __num(.--muted) / __audience / __status / __fail / __retry` | 列內各欄與失敗原因／重試 |
| `.msg-row.is-new` | 剛 push 的新列入場動畫 |

**CSS** — [`message-modal.css`](./ds-components/message-modal.css)

---

### 4.22n Char counter

**`_layer`** · molecule — 限長輸入欄的即時字數計數（主旨 ≤120、內文 ≤2000），到達上限以 `--destructive` 轉紅；計數值由頁面 JS 即時更新。

| Class | 用途 |
|---|---|
| `.char-counter` | 計數文字（tabular-nums） |
| `.char-counter.is-over` | 到達／超過上限的紅色狀態 |

**CSS** — [`message-modal.css`](./ds-components/message-modal.css)

---

### 4.22o Token chip

**`_layer`** · molecule — 點擊即插入的個人化變數 chip（`{{first_name}}` / `{{tier}}` / `{{last_active}}`），把字面 token 插入內文游標處，發送時逐收件者替換。

| Class | 用途 |
|---|---|
| `.msg-tokens` | chip 容器（含換行） |
| `.msg-tokens__hint` | 說明文字 |
| `.msg-token` | 單一 token chip（`data-token="{{…}}"`） |

**CSS** — [`message-modal.css`](./ds-components/message-modal.css)

---

### 4.22p Event preview card

**`_layer`** · molecule — 建立活動流程的粉絲視角活動卡即時預覽（規格 5.1.6.1 §4.6／§5.2.5）。鏡像粉絲端活動卡、依建立表單即時渲染；未填欄位斜體佔位。面板重用 `preview-panel.css`，類型徽章複用 `.badge`。

| Class | 用途 |
|---|---|
| `.event-preview-card` | 卡片容器（白底＋1px border） |
| `.event-preview-card--landscape` | 海報改 16:9（橫式 banner） |
| `.event-preview-card__poster` | 海報（預設 3:4，空時 icon 佔位） |
| `.event-preview-card__type-tag` | 類型徽章定位（疊海報左上，配 `.badge`） |
| `.event-preview-card__body / __name / __meta(__meta-row) / __tickets` | 內文、名稱、日期＋場地、票種摘要 |
| `.is-empty` | 未填佔位（斜體、subtle） |

**CSS** — [`event-preview-card.css`](./ds-components/event-preview-card.css)

---

### 4.23 Table

**`_layer`** · organism — Card-framed data table (rounded surface + shadow) with muted header row, hairline row dividers, and check/cross/partial status cells.

**Anatomy**

```
table.ztor-table (width 100%, border-collapse separate, --card, radius-md, shadow-card, overflow hidden)
├─ thead th (16px 20px, Geist 13/500, --muted-foreground, --muted bg, bottom hairline)
└─ tbody
   ├─ tr td (16px 20px, --foreground, bottom hairline, vertical-align middle)
   ├─ tr:last-child td → border-bottom: 0
   └─ tr:hover td → background --muted
   cell helpers:
     .ztor-table__feature (Geist 500 label cell)
     .ztor-table__check   (--status-success ✓)
     .ztor-table__cross   (--destructive ✗)
     .ztor-table__partial (--status-warning ~)
   expandable rows (Earnings transactions · F7):
     tr.ztor-table__row[aria-expanded] (clickable) > td > i.ztor-table__chev (rotates 90° when open)
     tr.ztor-table__detail[hidden] > td colspan=N > .tx-detail
       .tx-detail__meta > .tx-detail__id (code Event ID + .tx-detail__copy) + Rate version
       .tx-detail__ladder (reuses .waterfall) | .tx-detail__note
```

**Variants** — Base table + an **expandable-row** variant (Earnings transactions): a clickable `.ztor-table__row` toggles a sibling `.ztor-table__detail` row that carries the per-transaction trace — Event ID (copyable), applied rate version (§7.6), and the transaction's own money waterfall (reuses `.waterfall`).

**Sizes** — Single size (`16px 20px` cell padding, 14px body text).

**States**

| State | Selector | Change |
|---|---|---|
| default | `.ztor-table tbody td` | `--foreground` text, bottom hairline `--border` |
| last row | `.ztor-table tbody tr:last-child td` | `border-bottom: 0` |
| row hover | `.ztor-table tbody tr:hover td` | Row cells fill `--muted` |
| row expanded | `.ztor-table__row[aria-expanded="true"]` | Chevron rotates 90°, row cells fill `--muted`, sibling `.ztor-table__detail` shown (JS toggles `[hidden]`) |
| detail hidden | `.ztor-table__detail[hidden]` | `display: none` |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.ztor-table` | Card-framed table; `--card` bg, `radius-md`, `shadow-card`, `overflow: hidden`, separated borders |
| `thead th` | Muted header cell; `--muted` bg, Geist 13/500 `--muted-foreground`, bottom hairline |
| `tbody td` | Body cell; `16px 20px` padding, `--foreground`, middle-aligned, bottom hairline |
| `.ztor-table__feature` | Emphasized label cell — Geist `font-weight: 500` |
| `.ztor-table__check` | Inline-flex ✓ in `--status-success` |
| `.ztor-table__cross` | Inline-flex ✗ in `--destructive` |
| `.ztor-table__partial` | Partial mark in `--status-warning` |
| `.ztor-table__row` / `.ztor-table__chev` (in `.ztor-table__chevcell`) | Clickable row (`aria-expanded`) + trailing chevron in its own last column that rotates 90° when open (2026-07-13: moved leading→trailing so the date column keeps width and the header stays aligned) |
| `.ztor-table__detail` (`[hidden]`) | Sibling detail row (`<td colspan>`), `--muted` bg; `[hidden]` hides it |
| `.tx-detail` / `__meta` / `__id` / `__copy` / `__note` / `__ladder` | Trace block: Event ID `<code>` + copy button, rate version, note, and `.waterfall` mini-ladder |

**Token usage** (→ Pillar 2 Role)

- `--card` (table fill) · `--muted` (header bg + row hover + detail bg) · `--border` (dividers + header rule + code ring) · `--foreground` (cells) · `--muted-foreground` (header text + chevron) · `--foreground-muted` (detail note) · `--status-success` / `--destructive` / `--status-warning` (cell marks) · `--radius-md` / `--radius-sm` (code chip) · `--shadow-card` (card frame) · `--duration` / `--easing` (chevron) · `--font-ui` (header, feature) · `--font-body` (cells) · `--font-mono` (Event ID code)

**Usage** — Use when ≥3 data columns need aligned comparison (canonical use: Earnings transactions, feature-comparison grids). Avoid for single icon+body+amount rows — use `.data-list` for that density.

**Do & Don't**

- ✅ Do use `.ztor-table__check / __cross / __partial` for status cells so colors stay token-driven.
- ✅ Do keep the table inside its own rounded card frame — the shadow + `overflow:hidden` are part of the look.
- ❌ Don't add per-cell borders; the design uses only horizontal hairline dividers.


**Code example**

```html
<table class="ztor-table">
  <thead>
    <tr><th scope="col">Feature</th><th scope="col">Free</th><th scope="col">Pro</th></tr>
  </thead>
  <tbody>
    <tr>
      <td class="ztor-table__feature">Custom storefront</td>
      <td><span class="ztor-table__cross">✗</span></td>
      <td><span class="ztor-table__check">✓</span></td>
    </tr>
  </tbody>
</table>
```

**CSS** — [`table.css`](./ds-components/table.css)

---

### 4.24 Chart

**`_layer`** · organism — SVG-based visualization family with four sub-patterns (line chart, stacked bar, source-list legend, rank bars) plus a `.chart-card` composition shell.

**Anatomy**

```
LINECHART  .linechart > .linechart__svg (180px) [grid · area · line(--prev/--s1…s5) · dot(--accent)] + .linechart__labels
STACKED-BAR  .stacked-bar (14px pill) > .stacked-bar__seg ×N (inline width % + inline color)
SOURCE-LIST  .source-list > .source-row (grid 14px 1fr auto auto) [__swatch · label · __amt · __pct]
RANK-BARS  ul.rank-bars > li.rank-bar (grid 1fr 48px) > .rank-bar__track [__fill + __content(dot+label)] + .rank-bar__pct
CHART-CARD  .card.chart-card (pad 0) > __head (title-group + .segmented D/W/M + __icon-btn) · __body · __foot
```

**Variants** — Four sub-patterns: `.linechart` (single/two-series), `.stacked-bar`, `.source-list`, `.rank-bars`. Line series `.linechart__line--s1…s5` (primary / success / info / error / subtle); bar series `.barchart__bar--s1…s5`. Card view switches via `[data-chart-view="line"|"bar"]`.

**Sizes** — Plot height fixed at 180px (`.linechart__svg`, `.linechart__y-axis`, `.barchart`); stacked-bar 14px; rank-bar track 40px.

**States**

| State | Selector | Change |
|---|---|---|
| default segmented | `.segmented__item` | Subtle text on muted track |
| active segmented | `.segmented__item--active` | `--card` bg + `--foreground` + `--shadow-hairline` |
| segmented hover | `.segmented__item:hover` | Text → `--foreground` |
| icon-btn hover | `.chart-card__icon-btn:hover` | `--muted` bg + `--foreground` |
| line / bar view | `.chart-card[data-chart-view="line"\|"bar"]` | Hides `.barchart-wrap` / non-bar `.linechart` |
| tooltip / cursor (JS) | `.chart-tip--show` / `.chart-cursor--show` / `.chart-bar-cursor--show` | Floating value card / vertical cursor / column highlight shown |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.linechart__line` / `--prev` / `--s1…s5` | Primary trend / dashed comparison / multi-series colors |
| `.linechart__area` | Orange area fill (`--primary` 18% mix) under the line |
| `.linechart__dot` / `--accent` | Data marker / accent marker for latest point |
| `.linechart--axes` (+ `__y-axis` / `__main`) | 2-col layout adding y-tick axis |
| `.stacked-bar` / `__seg` | Proportion pill; segment width + color set inline |
| `.source-list` / `.source-row` / `__swatch` / `__amt` / `__pct` | Color-keyed legend rows below a stacked-bar |
| `.rank-bars` / `.rank-bar` / `__track` / `__fill` / `__content` / `__dot` / `__pct` | Ranked proportional list; fill scaled so max = 100% |
| `.barchart` / `__bar` / `--s1…s5` | Vertical bar view (gridlines baked into background) |
| `.chart-card` (`.card.chart-card`) | Full-bleed shell (`padding:0`); `__head` / `__body` / `__foot` |
| `.segmented` / `__item` / `__item--active` | D/W/M range toggle in the card head |
| `.chart-tip` / `.chart-cursor` / `.chart-bar-cursor` | JS-driven hover affordances |

**Token usage** (→ Pillar 2 Role)

- `--primary` (line, area mix, accent dot, swatch, s1 series) · `--status-success/info/error` + `--muted-foreground` (s2–s5 series) · `--border` (grid, dividers) · `--card` / `--muted` (cards, tracks, fills, gridlines) · `--foreground` / `--foreground-muted` / `--muted-foreground` (text, ticks, default bars) · `--radius` / `--radius-sm` / `--radius-pill` · `--shadow-card` / `--shadow-hairline` · `--font-ui` · `--duration` / `--easing`

**Usage** — Use `.linechart` for trends, `.stacked-bar` + `.source-list` for a single proportion breakdown, `.rank-bars` when each category deserves its own row with a visible proportion, and `.chart-card` to wrap a chart with head controls + footer. Avoid for exact tabular figures — use `.ztor-table` or `.data-list`.

**Do & Don't**

- ✅ Do set stacked-bar segment widths and palette inline (`style="width:42%;background:…"`) — the CSS only supplies the track.
- ✅ Do scale `.rank-bar__fill` so the largest value reads 100% (`row_pct / max_pct * 100`).
- ❌ Don't apply `.linechart__area` orange fill to multi-series charts — area is reserved for the single primary trend.
- ❌ Don't rely on hover tooltip/cursor for essential values; they are JS-driven and pointer-only.


**Code example**

```html
<section class="card chart-card" data-chart-view="line">
  <div class="chart-card__head">
    <div class="chart-card__title-group">
      <span class="chart-card__title-icon"><i data-lucide="trending-up" class="ztor-icon"></i></span>
      <h3 class="chart-card__title">Earnings</h3>
    </div>
    <div class="chart-card__controls">
      <div class="segmented" role="tablist">
        <button class="segmented__item segmented__item--active">D</button>
        <button class="segmented__item">W</button>
        <button class="segmented__item">M</button>
      </div>
      <button class="chart-card__icon-btn" aria-label="Export"><i data-lucide="upload" class="ztor-icon"></i></button>
    </div>
  </div>
  <div class="chart-card__body">
    <div class="linechart">
      <svg class="linechart__svg" viewBox="0 0 600 180" preserveAspectRatio="none">
        <polyline class="linechart__line" points="50,124 250,80 450,56 550,24" />
        <circle class="linechart__dot linechart__dot--accent" cx="550" cy="24" r="5" />
      </svg>
      <div class="linechart__labels"><span>Sep</span></div>
    </div>
  </div>
  <div class="chart-card__foot"><span>Showing data for 7 days</span></div>
</section>
```

**CSS** — [`chart.css`](./ds-components/chart.css)

---

### 4.24b Earnings waterfall

**`_layer`** · molecule — Statement-style vertical ledger (spec §5.1.8 F12) that walks gross revenue down to the distributable net profit pool and its Creator / NFT split. Reads like a P&L: **milestones** (income / subtotal / pool / distribution) carry a running-balance bar so the descent is visible, while **deductions** are plain indented `name … −amount` rows (no bar — keeps it from becoming a wall of bars). Figures follow §7.3 (only settled income counts). Used on the Earnings · Breakdown tab (F12 full-period waterfall), and reused for the F11 per-project profit ladder.

**Anatomy**

```
.waterfall > .waterfall__row(--income|--deduct|--subtotal|--pool|--distribution)
  ├─ .waterfall__head > .waterfall__name + .waterfall__meta   (grid col 1)
  ├─ .waterfall__amt                                          (grid col 2, right)
  └─ .waterfall__bar > .waterfall__fill (inline width %)      (spans both cols, row 2)
.waterfall__empty   — no-settled-income state
```

**Variants** — Row types: `--income` (source, bold, bar), `--deduct` (a cut: plain indented row, − amount, **no bar**), `--subtotal` (milestone: top rule + bold + bar), `--pool` (net profit pool: orange bar), `--distribution` (indented allocation, bar). `--pool.waterfall__row--negative` flips the pool to an error-tinted warning (distribution paused, §7.3).

**Sizes** — Bar track 8px; subtotal/pool top rule 1.5px.

**States**

| State | Selector | Change |
|---|---|---|
| deduction | `.waterfall__row--deduct` | Muted name/amount + `--muted-foreground` fill |
| milestone | `.waterfall__row--subtotal` / `--pool` | 1.5px `--foreground` top rule + bold |
| pool | `.waterfall__row--pool` | Orange `--primary` fill with inset foreground ring |
| pool negative | `.waterfall__row--pool.waterfall__row--negative` | Error-tinted bar + amount |
| empty | `.waterfall__empty` | Muted note, no bars |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.waterfall` / `.waterfall__row` / `__head` / `__name` / `__meta` / `__amt` | Ledger column; each row = label + meta + right amount + full-width bar |
| `.waterfall__bar` / `.waterfall__fill` | Muted track + fill; `width` set inline to the running balance % |
| `--income` / `--deduct` / `--subtotal` / `--pool` / `--distribution` | Row types (source / cut / milestone / pool / indented allocation) |
| `.waterfall__row--negative` (on `--pool`) | Pool-negative warning state |
| `.waterfall__empty` | No-settled-income empty state |

**Token usage** (→ Pillar 2 Role)

- fills `--foreground` (income/subtotal) / `--muted-foreground` (deduct) / `--primary` (pool) / `color-mix(--primary 58%, --card)` (distribution) · track `--muted` + `--border` · rules `--foreground` / `--border-soft` · text `--foreground` / `--foreground-muted` / `--muted-foreground` · warning `--destructive` · radius `--radius-pill` / `--radius-md` · `--font-ui` · `--duration` / `--easing`

**Usage** — Earnings · Breakdown tab: the F12 full-period waterfall above, and the F11 per-project profit ladder below (same component, project-scoped rows). Set each `__fill` width to the running balance as a % of gross so the staircase descends. Use `.waterfall__empty` (not $0 rows) when there is no settled income. Don't push unsettled / disputed amounts into the pool (§7.3).

**Do & Don't**

- ✅ Do mark milestones with `--subtotal` / `--pool` and allocations with `--distribution`.
- ✅ Do keep figures consistent with the §7.3 waterfall口徑 and the F3 summary cards.
- ❌ Don't fake a full waterfall with $0 rows — use `.waterfall__empty`.
- ❌ Don't recolor deduction bars as errors; red is reserved for the pool-negative warning.

**Dependencies** — self-contained (no atom children); used by earnings.html.

**CSS** — [`waterfall.css`](./ds-components/waterfall.css)

---

### 4.25 Bento grid

**`_layer`** · organism — 12-column dashboard/page layout utility; children default to full-row span and opt into N columns via `--span-N` modifiers.

**Anatomy**

```
.bento (display grid, grid-template-columns repeat(12, 1fr), gap 16)
└─ direct children .bento > *  → grid-column: span 12 (full row default)
   add modifier on any child:
     .bento--span-3 / -4 / -5 / -6 / -7 / -8 / -9 / -12  (≥ 900px only)
   below 900px → every child falls back to span 12 (single column)
```

**Variants** — Span modifiers (≥900px): `.bento--span-3`, `--span-4`, `--span-5`, `--span-6`, `--span-7`, `--span-8`, `--span-9`, `--span-12`.

**Sizes** — Single size (`gap: 16px`, 12-track grid).

**States**

| State | Selector | Change |
|---|---|---|
| default | `.bento > *` | Each child spans 12 (full row) |
| ≥900px | `@media (min-width: 900px)` | `--span-N` modifiers take effect (3/4/5/6/7/8/9/12 columns) |
| <900px | (no min-width match) | All modifiers fall back to span 12 — mobile single column |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.bento` | Grid container; `repeat(12, 1fr)`, `gap: 16px` |
| `.bento > *` | Direct children default to `grid-column: span 12` |
| `.bento--span-3 … --span-9`, `--span-12` | At ≥900px, set child to span that many of the 12 columns |

**Token usage** (→ Pillar 2 Role)

- No design tokens — pure layout utility (literal 12-track grid + 16px gap + 900px breakpoint).

**Usage** — Use for dashboard / page section layout (KPI rows, paired panel rows, trend + source rows, settings grids). Avoid for the divider-list interior of a panel (use `.data-list`) or for table column alignment (use `.ztor-table`).

**Do & Don't**

- ✅ Do place span modifiers directly on `.bento`'s direct children (e.g. `.kpi.bento--span-3`).
- ✅ Do keep span numbers summing to 12 per intended row (e.g. four `--span-3`).
- ❌ Don't expect modifiers below 900px — they collapse to a single full-width column by design.
- ❌ Don't use span values outside the active set (3, 4, 5, 6, 7, 8, 9, 12); others are undefined.


**Code example**

```html
<div class="bento">
  <div class="kpi bento--span-3">…</div>
  <div class="kpi bento--span-3">…</div>
  <div class="kpi bento--span-3">…</div>
  <div class="kpi bento--span-3">…</div>
</div>
```

**CSS** — [`bento.css`](./ds-components/bento.css)

---

### 4.26 Dropdown menu

**`_layer`** · molecule — Native `<details>/<summary>` action menu: any `.btn` as trigger, a floating panel of action links below-right. No JS — open/close is the native details toggle. Promoted from e-shop.html inline styles on 2026-06-11 (spec §5.1.5 F3 "＋ New" menu was the first consumer).

**Anatomy**

```
<details class="dropdown">
├─ <summary class="btn btn--primary">   trigger — a real Button atom
└─ .dropdown__menu (role="menu")        floating panel, below-right, z-index 30
   └─ .dropdown__item × N (role="menuitem")
```

**Variants** — `.dropdown` (default, panel right-aligned), `.dropdown--left` (panel anchors to the trigger's left edge).

**Sizes** — Single size: panel `min-width: 230px`, 6px padding; items 9×10 padding, 13px text.

**States**

| State | Selector | Change |
|---|---|---|
| closed | `details:not([open])` | Only the trigger button renders |
| open | `details[open]` | Panel floats below-right of trigger (`z-index: 30`) |
| hover | `.dropdown__item:hover` | Item bg `--muted` |
| focus-visible | `.dropdown__item:focus-visible` | Inset 2px `--ring` outline |

**Class API** (CSS classes — Props/API = N/A, this is a static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.dropdown` | Positioning context (`<details>`); strips native marker from summary |
| `.dropdown__menu` | Floating panel — right-aligned, `min-width: 230px`, `--radius-lg`, `--shadow-float` (E3) |
| `.dropdown__item` | Block action link, 9×10 padding, `--radius-md` |
| `.dropdown--left` | Panel anchors to the trigger's left edge instead |

**Token usage** (→ Pillar 2 Role)

- bg `--card` / hover `--muted` · border `--border` · text `--foreground` · radius `--radius-lg` / `--radius-md` · shadow `--shadow-card` · focus `--ring` · font `--font-ui` (inherited)

**Usage** — "Create / more actions" menus in toolbars (first consumer: E-Shop "＋ New" → product / bundle / auction). Avoid for nav mega-dropdowns — use NavigationMenu (§4.10) — and for form value selection — use a select / Input (§4.8).

**Do & Don't**

- ✅ Do use a real `.btn` variant as the summary trigger.
- ✅ Do keep items short, action-first, max ~6 entries.
- ❌ Don't rebuild it per page with inline styles — link `dropdown-menu.css`.
- ❌ Don't use it for navigation menus or form selects.

**Dependencies** — composes Button (§4.2, the summary trigger); used by E-Shop list toolbar.

**Code example**

```html
<details class="dropdown">
  <summary class="btn btn--primary">＋ New ▾</summary>
  <div class="dropdown__menu" role="menu">
    <a class="dropdown__item" role="menuitem" href="create-product.html">Create new product</a>
  </div>
</details>
```

**CSS** — [`dropdown-menu.css`](./ds-components/dropdown-menu.css)

---

### 4.27 Product list

**`_layer`** · organism — Borderless inventory table for E-Shop: product identity (image / icon thumb + title + one-line meta) + category + price + status badge + stock + visibility switch + edit action, on row-divider layout. The E-Shop page extends columns via the page-level `--eshop` modifier; below 760px the header hides and rows restack.

**Anatomy**

```
.product-list (grid table)
├─ .product-list__head                 44px column headers, --border bottom
└─ .product-list__row × N              88px, --border-soft divider, hover tint
   ├─ __image / __thumb(--cover)       52px image or 44px icon tile
   ├─ __product > __body > __title + __meta (__category)
   ├─ __cell · __status (Badge) · __stock · __visibility (Switch)
   └─ __actions > __edit (Icon)
```

**Variants** — Base columns; E-Shop column layouts in `product-list.css` (layered on the base grid — not edits to it): `.product-list--eshop` (Products: drag / image / name / category / price / status / stock), `.product-list--bundles` (Bundles: image / bundle / members / price / status / stock), `.product-list--auctions` (Auctions: image / item / category / bid / status / activity). E-Shop page-level behavior (drag-reorder, filter-empty, panel switching, row kebab) stays in `e-shop.html`. `__thumb--cover` inverts to foreground/background; `__image--placeholder` holds either the "ztor." text mark (generic) or a category icon (`.ztor-icon`, 20px, `--muted-foreground` — E-Shop rows map 服飾→shirt / 書籍→book-open / 音樂專輯→disc / 收藏品→gem / 配件→tag / 居家生活→house / 海報與印刷→image / 草稿→package).

**Status badges** (Products `__status` column, spec 5.1.5 F4 / D093) — uses Badge variants: Live → `badge--success`, Low Stock → `badge--error`, Sold Out / Draft / Hidden → `badge--neutral`. Sold Out (stock = 0) and Low Stock (below threshold, still in stock) are distinct states, never conflated.

**Thumbnail lazy-load** (spec 5.1.5 F4 / D094) — real thumbnails (`.product-list__image img`) carry `loading="lazy"` (fetch only when scrolled into view). The E-Shop demo lists use no-image CSS placeholders (`__image--placeholder`, self-hosted, no CDN), so lazy-load is a convention for real thumbnails with no visible effect in the demo. List batching defaults to 25/batch (spec); demo uses a smaller batch to surface "Load more".

**States**

| State | Selector | Change |
|---|---|---|
| hover | `.product-list__row:hover` | bg `--muted` |
| draft | `.product-list__title--draft` · `.product-list__empty` | Draft / unfilled cells show muted placeholder — name → "Untitled / 未命名", other cols → "—" (spec 5.1.5 F4 / D092, all three E-Shop panels) |
| ≤760px | `@media (max-width: 760px)` | header hidden; rows restack to 2-col grid |

**Token usage** (→ Pillar 2 Role)

- text `--foreground` / `--foreground-muted` / `--muted-foreground` · dividers `--border` / `--border-soft` · hover `--muted` · thumb `--muted` (cover: `--foreground`/`--background`) · radius `--radius` · motion `--duration`/`--easing` · fonts `--font-ui`/`--font-display`

**Usage** — E-Shop inventory (e-shop.html). Use Table (§4.24) instead for dense numeric ledgers.

**Do & Don't**

- ✅ Do use Badge for status and Switch for visibility — no bespoke pills.
- ✅ Do extend columns with a page-level modifier, not by editing the base grid.
- ❌ Don't add row borders — the system look is row-divider only.

**Dependencies** — composes Badge (§4.3), Switch (§4.6), Icon (§4.9); used by e-shop.html.

**CSS** — [`product-list.css`](./ds-components/product-list.css)

---

### 4.28 Project list

**`_layer`** · organism — Borderless table list for Projects: each row is a whole-row `<a>` link (icon tile + title + meta + type + status badge + to-do tip + chevron). Same row-divider DNA as Product list, but rows navigate to project detail. Below 760px the header hides and rows restack.

**Anatomy**

```
.project-list (grid table)
├─ .project-list__head                 44px column headers
└─ <a>.project-list__row × N           88px link-row, hover tint, focus ring
   ├─ __project > __icon + __body (__title + __meta > __category)
   ├─ __cell · __type · __status (Badge)
   └─ __actions > tip + __go (chevron Icon)
```

**Variants** — Single layout; status conveyed by Badge variants (Live / Draft / Ended…).

**States**

| State | Selector | Change |
|---|---|---|
| hover | `.project-list__row:hover` | bg `--muted`; `__go` darkens to `--foreground` |
| focus-visible | `.project-list__row:focus-visible` | inset 2px `--ring` outline |
| ≤760px | `@media (max-width: 760px)` | header hidden; rows restack to 2-col grid |

**Token usage** (→ Pillar 2 Role)

- text `--foreground` / `--foreground-muted` / `--muted-foreground` · dividers `--border` · hover `--muted` · focus `--ring` · icon tile `--muted` · radius `--radius` · motion `--duration`/`--easing` · font `--font-ui`

**Usage** — Projects page list view (projects.html; rows rendered by its inline JS from data). Card view is the separate `.project-card` page block.

**Do & Don't**

- ✅ Do keep the whole row as one `<a>` — the chevron is a hint, not the only target.
- ❌ Don't nest buttons inside the row link — use the tip pattern for hints.

**Dependencies** — composes Badge (§4.3), Icon (§4.9); used by projects.html.

**CSS** — [`project-list.css`](./ds-components/project-list.css)

---

### 4.29 Payout bank picker & dialog

**`_layer`** · organism — Two-part payout flow (spec §5.1.8): a page-side bank picker card grid (`.payout-bank-*`) on Earnings · Payouts, plus the request-payout modal (`.payout-modal` blurred backdrop + `.payout-dialog` shell with head / body / foot, 34px display-type amount input, fee summary, step views and success view). Mounted from `partials/payout-request-modal.js`; promoted out of earnings.html inline styles on 2026-06-09.

**Anatomy**

```
.payout-bank-grid > .payout-bank-card(--selected|--add) > __top(__icon) + __title + __meta
.payout-modal (fixed, z 80, blur backdrop)
└─ .payout-dialog (620px, --shadow-overlay · E4)
   ├─ __head (__title + close Button)
   ├─ __body > .payout-view × N steps
   │   ├─ .field (bank picker label/hint) · .field > .amount-field.amount-field--hero (amount, __unit "$" + __input) — converged onto the shared field-system/amount-field components 2026-07-11 (was .payout-field / .payout-amount-*)
   │   ├─ .form-grid > .field (__label/__hint) × 5 (add-bank fields) — converged onto .form-grid/.field 2026-07-11 (was .payout-form-grid / .payout-field)
   │   ├─ .payout-selected-bank / .payout-bank-options > .payout-bank-option(.is-active)
   │   ├─ .payout-summary > __row ×N (incl. settled-sources + rate-version)
   │   ├─ .payout-confirm > __box (checkbox) + __text   — irreversible-confirm gate
   │   ├─ .control-row (Switch) — converged onto .control-row 2026-07-11 (was .payout-inline-control)
   │   └─ .payout-result (__icon success circle)
   └─ __foot (ghost + primary Buttons)
```

**Variants** — Bank card: default / `--selected` (inset 2px foreground ring) / `--add` (dashed). Form grid: 2-col / `--single`.

**States**

| State | Selector | Change |
|---|---|---|
| hidden | `.payout-modal[hidden]` / `.payout-view[hidden]` | `display: none` |
| open | `.payout-modal` + `body.is-modal-open` | fixed blurred backdrop + body scroll lock |
| selected | `--selected` / `.is-active` | white surface + inset 2px `--foreground` ring |
| confirm gate | `[data-payout-confirm]` → `[data-payout-submit][disabled]` | submit CTA disabled until the irreversible-confirmation box is ticked (spec §5.1.8.1 §4.5); resets on every open |
| ≤720px | `@media (max-width: 720px)` | dialog docks to bottom sheet (top radius only); form single column |

**Token usage** (→ Pillar 2 Role)

- surfaces `--card` / `--muted` · rings `--border` / `--foreground` (selected) · shadows `--shadow-card` / `--shadow-overlay` (dialog shell, E4) / `--shadow-hairline` · radius `--radius-md` / `--radius-lg` · success `color-mix(--status-success 14%, --card)` · fonts `--font-ui` / `--font-display` · backdrop `color-mix(--background 68%, black 45% alpha)`

**Usage** — Earnings · Payouts tab (earnings.html). The dialog shell is the project's canonical modal pattern — reuse it for future modals instead of re-rolling. Already reused by the F10 manual-entry modal (`partials/manual-entry-modal.js`), which mounts the same `.payout-modal` / `.payout-dialog` shell with form fields instead of payment steps; and by `partials/restock-modal.js` / `partials/pickup-session-modal.js` / `creators.html`'s inline create-creator form. All of these now build their fields from `.field` / `.form-grid` / `.control-row` (field-system.css / form-grid.css / control-row.css), not page-local `.payout-field*` markup — the page-local `.payout-field` / `.payout-form-grid` / `.payout-inline-control` classes have no remaining consumer and their rules were removed from `payout-modal.css` (2026-07-11).

**Do & Don't**

- ✅ Do mount via `partials/payout-request-modal.js` so every consumer gets the same dialog.
- ✅ Do keep the fee summary visible before confirm.
- ❌ Don't rebuild the dialog shell per page.
- ❌ Don't forget `.is-modal-open` scroll lock when opening.

**Dependencies** — composes Button (§4.2), Input (§4.8), Switch (§4.6), Badge (§4.3), Field system, Form grid, Control row, Amount field; used by earnings.html.

**CSS** — [`payout-modal.css`](./ds-components/payout-modal.css) · [`partials/payout-request-modal.js`](./partials/payout-request-modal.js) · shell reused by [`partials/manual-entry-modal.js`](./partials/manual-entry-modal.js) · fields use [`field-system.css`](./ds-components/field-system.css) · [`form-grid.css`](./ds-components/form-grid.css) · [`control-row.css`](./ds-components/control-row.css) · [`amount-field.css`](./ds-components/amount-field.css)

---

### 4.29c Restock order (lines)

**`_layer`** · molecule — restock popup for the E-Shop restock sub-flow (spec §5.1.5.6, D104 order model + D106 member tabs). A restock = one **order**: a **document layer** (method via `.segmented` + supplier / ETA / notes on `.field`, filled once) and an **item layer** of `.restock-line` quantity rows. A **product's variants are always a matrix** (single-variant = 1 line; 2-option = sub-grouped by option-1 via `.restock-lines__group`) — no tabs. A **bundle separates its member products with `.tabs`** (one tab per member; each `.tab-panel` holds that member's variant matrix). Only one tab level (members) — variants never use tabs (D106); quantities persist across tabs (all member panels stay in the DOM). Blank quantity = skip that item. History log on product-detail reuses `.data-list`. Each line's `__meta` shows the low-stock **threshold**, whose default is **10% of that item's stock cap** (spec §7.2 / D105) — derived per item, not a flat number; hidden when a cap is unknown. Mounted from `partials/restock-modal.js`.

**Anatomy**

```
.payout-dialog (reused shell)
├─ document layer: .field > .segmented (Restock now / Scheduled) + hint
│                  .form-grid > .field × (Expected arrival[scheduled] / Supplier / Notes)
└─ item layer:
   ├─ [PRODUCT] .restock-lines  (no tabs)
   │      └─ (.restock-lines__group ×option-1, for 2-option) .restock-line × N
   └─ [BUNDLE]  .tabs (one .tabs__item per member product)  →  .tab-panel × member
          └─ .restock-lines  (that member's variant matrix; single member = 1 line)
   .restock-line: __main > __img (34px chip) + __text(__name + Badge, __meta: current/threshold)
                  · input.restock-line__qty (blank = skip) · .restock-line__after (→ current + qty, live)
   — footer = Cancel / Mark received (scheduled only) / Submit restock
   — restock HISTORY on product-detail = .data-list rows (+qty · date · supplier + status Badge)
```

**Variants** — Method (document layer): Restock now (immediate) / Scheduled (Restocking until Mark received). Item shape by entry: single-variant product (1 line) / multi-variant product (matrix lines, 2-option sub-grouped) — no tabs / bundle (`.tabs` per member product; each `.tab-panel` = that member's variant matrix).

**States**

| State | Selector | Change |
|---|---|---|
| method = now | `.segmented__btn--active` on "Restock now" | Expected-arrival hidden; Mark received hidden; Submit → In stock |
| method = scheduled | `.segmented__btn--active` on "Scheduled" | Expected-arrival shown (required); Mark received shown; Submit → Restocking |
| line status | `.restock-line__name > .badge--error / --neutral / --success` | Low Stock / Sold Out / In stock (stock axis §7.2) |
| line skipped | empty `.restock-line__qty` | not restocked; after = current |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.restock-lines` | Item list container (column of quantity rows) |
| `.restock-lines__group` | Group header — multi-variant product name / bundle member name |
| `.restock-line` (`__main` / `__img` / `__text` / `__name` / `__meta`) | One item: 34px chip + name + status badge + current/threshold; grid [identity · qty · after] |
| `.input.restock-line__qty` / `.restock-line__after` | Centered quantity input · live "→ N" after-restock readout (current + qty) |
| (reuse) `.tabs` / `.tabs__item` / `.tab-panel` | Bundle only — one tab per member product; each panel a `.restock-lines` matrix. `[data-restock-tabs][hidden]` hides the bar for single-product restock (D106) |

**Token usage** (→ Pillar 2 Role)

- chip `--muted` + inset `--border` · row divider `--border` · `--font-ui` / `--font-display` (qty/after) · text `--foreground` / `--muted-foreground` · badges via badge.css · ETA field hiding is `.field[hidden]{display:none}` from field-system.css (no page-local override needed)

**Usage** — E-Shop restock popup (spec §5.1.5.6, D104 + D106): single-variant product row / product-detail = one line; multi-variant product row = matrix (no tabs); bundle row = `.tabs` per member product, each panel that member's variant matrix; each restocked line (qty>0) is logged to `.data-list` on product-detail. Reuse the payout dialog shell + Segmented + Tabs + Data list; the lines are restock-specific.

**Do & Don't**

- ✅ Do keep method / supplier / ETA / notes at the document layer (filled once); per-item quantities on lines.
- ✅ Do group a multi-variant product or bundle member with `.restock-lines__group`.
- ❌ Don't put method / supplier / ETA on each line, and don't reintroduce per-item tabs — that's what the order model removed.

**Dependencies** — composes Badge (§4.3), Field system, Form grid; reuses Segmented (§4.x) + Data list (§4.x, history); mounts inside the Payout dialog shell (§4.29); used by E-Shop restock flow.

**CSS** — [`restock-modal.css`](./ds-components/restock-modal.css) · [`partials/restock-modal.js`](./partials/restock-modal.js) · document-layer fields use [`field-system.css`](./ds-components/field-system.css) · [`form-grid.css`](./ds-components/form-grid.css)

---

### 4.48 Store settings page

**`_layer`** · organism — E-Shop 商店層級設定的 **popup**（`store-settings.html`，spec 5.1.5.5 / D035 / D067），由 E-Shop F3「商店設定」按鈕以 **embed-modal iframe** 開啟；popup 外框承擔標題與關閉，**頁面本身無全域導航／麵包屑／頁首**，動作改置底部提交列（`.ss-actionbar`：See as fan ｜ Discard ｜ Save changes，sticky 底部；spec F1 設定動作與預覽）。IA：**店面門面**（`.ss-identity-card`）常駐置頂，用 **Base44／Facebook 式身分帶**（封面 `.ss-band__cover` ＋疊加 logo 頭像 `.ss-band__avatar` ＋店名／網址／簡介為文字），**逐欄就地編輯**（`.ss-edit`：文字態 ↔ 內嵌 input/textarea/select，✓/Enter 確認、✕/Esc 取消，`.is-editing` 切換）；品牌素材就是封面＋頭像（各自有編輯鈕），不另設上傳框；整頁用滿標準 1280px 欄寬；其下**商品陳列／付款／出貨**三個對等設定群組以 **tab 切換**（`.tabs` + `.ss-tabpanel`，一次處理其一；出貨 tab 用 `.settings-row`）；另有 **粉絲視角預覽（See as fan）** 以畫面分割開啟（`.preview-panel--inset` + `.ss-fan`）。本元件補基礎控制項沒有的欄位型別：網址前綴（`.ss-url`）、`$` 金額前綴（`.amount-field`，見 Amount field 元件）、唯讀 Stripe 狀態卡（`.ss-status`）、品牌素材上傳（`.ss-brand` + Upload tile），以及**拖曳排序清單**（`.ss-order`）與粉絲預覽內容（`.ss-fan`）。

商品陳列（5.1.5.5 F3 / D031）：拖曳已上架商品調整粉絲端陳列順序——粉絲端順序的單一來源；上 / 下架（上架開關 Shop）仍在 E-Shop F4。只納入已上架（§7.2 可見）商品。兩種空狀態（`.empty-stub`）：完全沒商品 → 導向建立商品；有商品但全未上架 → 導向商品管理上架。

呈現參考（非約束，見 BUILD-SPEC）：門面置頂常駐、三群組 tab 切換、See as fan 畫面分割——spec §2 標為呈現參考，正式呈現由 project-ui-creator 決定。

```
store-settings.html  (popup body — D067: no global nav / breadcrumb / page header)
├─ .ss-stack (單欄, gap 18px, 滿版 ≤1280px)
   ├─ .ss-identity-card 店面門面（常駐，身分帶＋逐欄就地編輯）
   │  ├─ .ss-band__cover（封面品牌素材＋編輯鈕）
   │  ├─ .ss-band__head: .ss-band__avatar（logo＋編輯鈕） + .ss-edit--name / .ss-edit--url
   │  └─ .ss-band__body: .ss-edit--bio + .ss-band__meta(.ss-edit--currency)
   │     每個 .ss-edit: .ss-edit__read(__value/__pencil) ↔ .ss-edit__form(控制項+__actions ✓/✕)
   └─ .card 設定群組
      ├─ .tabs（商品陳列 / 付款 / 出貨）→ 切換 .ss-tabpanel
      ├─ panel display: .ss-order > .ss-order__row[draggable]（+ .empty-stub.ss-order-empty）
      ├─ panel payment: .ss-status (__icon/__main/__title/__meta + Badge)
      └─ panel shipping: .settings-row（ships from / .amount-field 免運）
└─ .ss-actionbar（提交列：See as fan ｜ Discard ｜ Save changes，sticky 底部；Save/Discard postMessage 關閉 popup）
See as fan：.preview-panel.preview-panel--inset > .ss-fan（__header/__avatar/__name/__bio + __grid/__card）
```

**States**

| State | Selector | Change |
|---|---|---|
| tab | `.tabs__item--active` + `.ss-tabpanel[hidden]` | 切換顯示的設定群組（一次一個） |
| focus | `.ss-url:focus-within` | ring on the whole prefix+input unit |
| counter | `data-ss-counter` / `[data-ss-counter-label]` | repaints `len/max` on `input` |
| read-only | `.ss-status` | static card (Stripe managed in Earnings) |
| drag | `.ss-order__row.is-dragging` / `.is-over` | HTML5 drag-reorder；重排即粉絲端順序 |
| preview | `body.preview-open` + `.preview-panel.is-open` | See as fan 畫面分割：壓窄 `.main`、面板自 64px topbar 下展開 |

> 2026-06-13 改版（D035）：由四張卡堆疊改為「門面常駐 + 群組 tab + See as fan」；新增品牌素材、幣別移入門面。

**Token usage** — surfaces `--card` / `--muted` · border `--border` · ring `--ring` · radius `--radius` / `--radius-sm` / `--radius-md` · shadow `--shadow-card` / `--shadow-hairline` · fonts `--font-ui` / `--font-display` / `--font-body` · primary（fan avatar）· subtle `--muted-foreground`.

**Usage** — popup，由 E-Shop F3「商店設定」按鈕以 embed-modal iframe 開啟（spec D065 / D067）；頁面無頁首，標題與關閉由 modal 外框提供，Save / Discard 以 `postMessage('ztor:storeset-close')` 通知父頁關閉。截圖未定義的（幣別選項/預設、slug 規則、bio 必填、品牌素材種類）依規格「產品待確認」先留最小。商品陳列拖曳與 See as fan 為 demo 互動（無後端）。

**Do & Don't**

- ✅ Do keep Storefront identity persistent on top; group settings under tabs (D035 IA).
- ✅ Do keep payout schedule / currency口徑 read-only — Earnings (§7.3) is the single source.
- ✅ Do keep listing on/off (上架開關 Shop) in E-Shop F4 — this page only orders listed products (D031).
- ❌ Don't recompute payout or FX on this page.
- ❌ Don't promote `.ss-*` into Base — these are SiteSpecific to store settings.

**Dependencies** — composes Card (§4.10), Tabs (§4.21), Upload tile, Settings row (§4.38), Preview panel (§4.22f), Input (§4.8), Badge (§4.3), Empty stub (§4.22e); used by store-settings.html.

**CSS** — [`store-settings.css`](./ds-components/store-settings.css) (layout + field types + fan preview) · [`card.css`](./ds-components/card.css) · [`tabs.css`](./ds-components/tabs.css) · [`upload-tile.css`](./ds-components/upload-tile.css) · [`preview-panel.css`](./ds-components/preview-panel.css) · [`settings.css`](./ds-components/settings.css) · [`empty-stub.css`](./ds-components/empty-stub.css)

---

### 4.49 Review row

**`_layer`** · molecule — Flat, no-card wizard Review-step summary: a field/section name + value with a right-side "Edit →" action, rows separated by hairline dividers.

Normalizes three page-local versions into one component: create-event.html's `.ce-review-row` (name + value + per-row Edit, hairline — the closest match to the target shape, kept as the default stacked layout), register-ip.html's `.ri-summary` (label/value grid pairs, empty-state italic placeholder, no edit → `.review-row__item--kv`), and create-project.html's Review-step `.card` blocks (title + Edit heading a group of sub key/values — that page's 2026-06-25 comment, "全頁無卡片化…這批歸第三批 review-row 設計判斷，元件定案後再遷移", already flagged this exact consolidation; its `.card` is `!important`-flattened there to look like this component ahead of migration).

**Anatomy**

```
.review-row (flex column, no card bg/shadow)
└─ .review-row__item (padding 14px 0, hairline border-bottom --border-soft; none on :last-child)
   ├─ .review-row__head (flex, name + action, one line)
   │   ├─ .review-row__name (font-ui 15/500)
   │   └─ .review-row__action (right-aligned "Edit →" link, 12px, underline)
   └─ .review-row__value (font-ui 13px; wraps by default, no truncation)
      └─ .review-row__value--empty (placeholder — italic, --muted-foreground)

.review-row__item--kv (inline modifier — replaces __head/__value stacking with a
  130px-label / value grid on one line, no action; for grouped fields under one
  outer Edit; collapses to 1 column ≤480px)
```

**Variants** — `.review-row__item--kv` for compact inline label/value rows (no per-row Edit). A group's `.review-row__value` may also hold several sub label/value pairs as plain content (e.g. reusing `.meta-cell`) when one Edit action covers multiple fields, as in create-project's Review card — that's flexible content, not new CSS.

**Sizes** — Single size (`padding: 14px 0` per row).

**States**

| State | Selector | Change |
|---|---|---|
| default | `.review-row__item` | Hairline `border-bottom: 1px solid var(--border-soft)` |
| last row | `.review-row__item:last-child` | `border-bottom: 0` |
| empty value | `.review-row__value--empty` | Italic, `--muted-foreground` (e.g. "Not entered") |
| action hover | `.review-row__action:hover` | `--foreground-muted` → `--foreground` |
| long value | — (default) | Wraps to a second line; no truncation/ellipsis |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.review-row` | Flex-column container of rows; no background/shadow (flat, no card chrome) |
| `.review-row__item` | One row; `padding: 14px 0`, bottom hairline |
| `.review-row__head` | Flex row: name (left) + action (right), `justify-content: space-between` |
| `.review-row__name` | Field/section name — font-ui 15/500 |
| `.review-row__action` | "Edit →" link — font-ui 12/500, `--foreground-muted`, underline |
| `.review-row__value` | Value text below head — font-ui 13px, wraps by default |
| `.review-row__value--empty` | Placeholder state — italic, `--muted-foreground` |
| `.review-row__item--kv` | Inline modifier: grid `130px 1fr` label/value, single line, no action |

**Token usage** (→ Pillar 2 Role)

- `--border-soft` (row dividers) · `--muted-foreground` (empty state, kv label, action default) · `--foreground` (value, action hover) · `--foreground-muted` (action default) · `--border` (action underline) · `--font-ui` · `--lh-comfy`

**Usage** — Use for a wizard's Review step to show what will be submitted, each field/section with a one-click way back to edit it. Avoid for record lists (transactions, products) — use Data list; avoid when every row needs its own card surface — this component is deliberately flat.

**Do & Don't**

- ✅ Do let long values wrap to a second line — never truncate a Review value the user is about to confirm.
- ✅ Do use `.review-row__item--kv` for a cluster of short fields sharing one outer Edit action.
- ❌ Don't wrap `.review-row__item` in a `.card` — the whole point is a flat, hairline-divided list (see create-project's `!important` flatten, which this component replaces).
- ❌ Don't put more than one Edit action per stacked `.review-row__item`.

**Code example**

```html
<div class="review-row">
  <div class="review-row__item">
    <div class="review-row__head">
      <h3 class="review-row__name">Event name</h3>
      <a class="review-row__action" href="#">Edit →</a>
    </div>
    <div class="review-row__value review-row__value--empty">Not entered</div>
  </div>
  <div class="review-row__item">
    <div class="review-row__head">
      <h3 class="review-row__name">Venue &amp; time</h3>
      <a class="review-row__action" href="#">Edit →</a>
    </div>
    <div class="review-row__value">Legacy Books, Xinyi Rd. Sec 4 — Sat, Aug 16 · 14:00–18:00</div>
  </div>
</div>
```

**CSS** — [`review-row.css`](./ds-components/review-row.css)

---

## Pillar 5 · Pattern

> Cross-component behavior conventions. Per DSS v1.4: layout patterns / voice / accessibility / interaction states / data viz live here, NOT in Component (which only defines per-component variants/states).

### 5.1 Pattern cards

Best-practice assembly recipes — how components combine to meet a creator's goal. A Pattern is not a component (Pillar 4) and not a wireframe (the page implementation). Each card has five grids: `trigger` (when to use) / `must` (≥2 non-negotiables) / `should` (advisable) / `must-not` (anti-patterns) / `_edge-cases` (empty / error / new-user / mobile / offline). Four categories, nine cards（頁面級 5 張＋中間層 4 張，2026-07-08）。Component sections demo the unit only — assembly rules live here（判準見 §4.0）。

#### Dashboard home (Layout)

- **trigger**: The landing surface after login — the creator needs a one-glance read of money, alerts, and what to do next.
- **must**: Lead with the full-bleed Hero band, then a KPI bento row (earnings / pending / fans / live items) using `KPI` (headline metric carried by display size, not colour); pair an `Alert` panel ("Actions needed") beside a `Data list` of recent earnings; every money figure states its state (available vs pending) inline.
- **should**: Follow with a trend `Chart` + source breakdown pair; keep orange for one structural accent per viewport (hero fill OR a single highlight tile, not both competing).
- **must-not**: Never stack two orange highlight tiles side by side; never show a bare number without its currency + state; never push primary actions below the fold.
- **_edge-cases**: `empty` → first-run hero with "Create your first project" CTA, KPI tiles show `—` not `0`; `error` → KPI tile shows last-known value + a stale badge; `new-user` → checklist card replaces the trend pair; `mobile` → bento collapses to span-12 single column; `offline` → KPI tiles dim, banner "Showing last synced data".

#### Tabbed section view (Layout)

- **trigger**: One entity has parallel sub-views of the same dataset (Earnings: Overview / Transactions / Payouts / Tax · E-Shop: Products / Bundles / Auctions · Projects status · Fans views).
- **must**: Use `Tabs` with one active panel; sync the active tab to the URL hash so a view is deep-linkable; each panel opens with its own KPI row scoped to that view.
- **should**: Keep filters (`Chip` group) and export/primary actions in a sticky sub-header inside the panel; preserve scroll position per tab.
- **must-not**: Never load all panels' data eagerly; never let a tab switch silently drop an in-progress filter without telling the user.
- **_edge-cases**: `empty` → panel shows an `Empty stub` scoped to that tab; `error` → inline `Alert --row` at panel top, other tabs still usable; `new-user` → default to the most-actionable tab (Overview); `mobile` → tabs become a horizontally scrollable strip; `offline` → disable Export, keep read views.

#### Filter + list (Interaction)

- **trigger**: A long, filterable record set the creator scans and acts on (Earnings transactions, payouts, products, fans).
- **must**: Single-select `Chip` group drives a `Data list` (row-divider, not card-per-row); the active filter and result count are always visible; clearing all filters returns to the full set.
- **should**: Make filtering client-side-instant where the set is loaded; offer a Manual entry / Export affordance at the list header.
- **must-not**: Never apply a filter without updating the visible count; never hide the "active filter" state so a user mistakes a filtered list for the whole.
- **_edge-cases**: `empty` (no records) → `Empty stub` with the relevant create action; `error` → keep the filter bar, show retry in the list body; `new-user` → seed with a sample row + dismissible hint; `mobile` → filters collapse into a sheet; `offline` → freeze the set, disable mutating actions.

#### Lifecycle states (Lifecycle / State)

- **trigger**: Any data region that can be empty, loading, or failing — applies to every list, KPI, chart, and panel.
- **must**: Define all three of **Empty / Loading / Error** for the region; Empty uses the `Empty stub` with a single clear next action; Error uses `Alert --row` with a retry and never blanks already-loaded data.
- **should**: Use skeleton placeholders that match the final layout for Loading; distinguish "empty because new" (onboarding tone) from "empty because filtered" (clear-filter tone).
- **must-not**: Never show a spinner with no layout context; never replace a transient error with a full-page wipe; never use a toast as the only error signal.
- **_edge-cases**: `empty` → see Empty copy in §5.2; `error` → preserve last-known values + stale marker; `new-user` → onboarding-flavored empty; `mobile` → empty illustration scales down, copy stays; `offline` → dedicated "No connection" empty distinct from "No data".

#### Multi-step wizard (Workflow)

- **trigger**: A create flow with 3–4 dependent steps (create-project 4-step · create-event 3-step · create-product 4-step).
- **must**: Use the `wizard-focus` template (no main topbar) with a centered `stepper`, `Selection card` grids for branching choices, and a sticky bottom action bar (Back / Save draft / Next); save a draft at every step so progress is never lost.
- **should**: Show a Review step before commit that restates money / royalty / IP-rental disclosures; disable Next until the step's required fields validate (on-blur).
- **must-not**: Never trap the user (always offer Save draft + exit); never advance past a step with unresolved financial or licensing disclosures; never reset earlier steps when navigating back.
- **_edge-cases**: `empty` → step 1 prefilled with sensible defaults; `error` → validation inline on the offending field, stepper marks the step; `new-user` → first step carries a one-line explainer; `mobile` → stepper condenses to "Step 2 of 4", action bar stays sticky; `offline` → draft saves locally, banner "Will sync when back online".

#### Form assembly (Workflow)

- **trigger**: Any create / edit form — wizard steps, settings forms, create-product / -event / -project sections.
- **must**: Every field is a `Field`（label + optional hint + exactly one control slot; the control reuses an atom — Input / Switch / Segmented / textarea）; group fields into `Form section`s（title + grey sub; sibling sections auto-divide via the component's own `+` rule; base gap 6 / field spacing 16）；side-by-side fields use `Form grid`, never hand-rolled columns. 建立流程的 `.wizard__sheet--sectioned` 使用 `--surface-page` 作底；`.form-section--outlined` 以 `--card`（light）／`--muted`（dark）和 `--border` 形成區塊，所有可見 outlined siblings 以 `--sp-24` 間隔並跨越 `[hidden]`。採用頁為 create-product／-auction／-bundle／-event／-project／register-ip／admin-ip-bank-entry。
- **should**: Order fields identity → content → settings → risk disclosures; put character counts as right-aligned `field__hint--count`（form-section scope）; keep one sticky action bar per form for save / next.
- **must-not**: Never hand-roll a label/hint stack outside `.field`; never nest a second heading system inside a section; never mix card-wrapped and no-card sections in the same flow.
- **_edge-cases**: `empty` → fields show placeholders, never pre-filled fake data; `error` → inline validation on the field, section stays open; `new-user` → first section carries a one-line explainer; `mobile` → `Form grid` collapses to single column; `offline` → draft-save locally（同 wizard）.

#### Settings page (Layout)

- **trigger**: A page of read-mostly toggles and account values（Settings 主頁、店鋪設定、通知設定）.
- **must**: Group destinations with `Settings nav`; each group renders as a card of stacked `Settings row`s（last row no divider — owned by the component）; each row's right slot holds exactly one control（Switch / value text / Badge）.
- **should**: Per-row instant apply **or** one card-level save — pick one per card; risky rows（刪除、停用）isolate at the bottom in their own card.
- **must-not**: Never mix instant-apply and save-button rows in the same card; never put two controls in one row's right slot; never bury a destructive action mid-list.
- **_edge-cases**: `empty` → hide the group, not an empty card; `error` → row-level inline `Alert --row`; `new-user` → defaults pre-selected, no forced tour; `mobile` → nav collapses above the cards; `offline` → toggles disabled with a stale banner.

#### Modal shell (Interaction)

- **trigger**: Any interruptive, complete-one-thing task — request payout, broadcast message, new product post, manual entry.
- **must**: Reuse the single canonical dialog chrome（`.payout-dialog` head / body / foot, `payout-modal.css`）+ backdrop + `is-modal-open` scroll-lock; destructive / money actions add a confirm gate before commit.
- **should**: Focus-trap inside the dialog; primary action right-aligned in the foot; body reuses Field / Data-list rather than bespoke layouts.
- **must-not**: Never roll a new modal chrome per feature; never stack two modals; never let backdrop-click discard unsaved money input without confirm.
- **_edge-cases**: `empty` → open with sensible defaults; `error` → inline `Alert --row` inside the body, dialog stays open; `new-user` → helper line under the title; `mobile` → dialog goes full-width bottom-sheet-like; `offline` → submit disabled with reason.

#### Split preview (Layout)

- **trigger**: Editing where the creator needs a live fan-side view — create-product / create-auction preview, e-shop "See as fan", store settings.
- **must**: A right `Preview column` / `Preview panel` **compresses** the main column（no scrim, not an overlay — the form stays interactive）; entry point is "See as fan" / auto in create flows; closing restores the main width; the card inside reuses `Preview card`（`.is-empty` placeholders for unfilled fields）.
- **should**: Keep the preview sticky while the form scrolls; re-render on field input, not on save.
- **must-not**: Never make the preview a modal that blocks editing; never let preview content drift from form state; never fake data in the preview（用 `.is-empty` 占位）.
- **_edge-cases**: `empty` → preview shows the placeholder card; `error` → preview keeps last valid render; `new-user` → preview visible by default in create flows; `mobile` → preview collapses behind a toggle; `offline` → preview still renders（純前端）.

### 5.2 Voice & Microcopy

**Personality** — Task-oriented and finance-honest. Talks to an independent creator running their own business: plain about money, royalties, splits, and verification; never hides a fee or a pending state. Calm, concrete, second-person. Lowers the barrier on finance / IP / cross-border topics with defaults and plain words instead of jargon.

**Principles** (from SPEC §1)

1. **Transparent** — income, fee rates, deductions, splits, and verification states are always spelled out, never implied.
2. **Low-barrier** — finance, IP licensing, and cross-border income are explained in plain language with sensible defaults.
3. **Task-oriented** — every page says what you can do right now.
4. **Consistent** — the same record reads with the same wording and the same status language on every page.
5. **Compliance-careful** — copy around fan support, revenue splits, and tax stays conservative and checkable.

**Is / Is-not**

| Voice is | Voice is not |
|---|---|
| Plain about money — "You'll receive **$842.10** after a 12% platform fee" | Vague — "Earnings will be processed" |
| Specific about state — "Pending until 28 Jun" | Falsely settled — "Paid" (when only pending) |
| Action-first — "Request payout" | Feature-first — "Payout management module" |
| Second-person, calm — "You can edit this until the event goes live" | Hype / urgency — "Don't miss out!" |
| Honest about limits — "Bundles aren't available in your region yet" | Evasive — "Coming soon" with no reason |
| Conservative on compliance — "Tax documents are estimates; confirm with your advisor" | Over-promising — "We handle all your taxes" |

**Headline pattern** — State the task or the number, not a slogan: "Your earnings", "Create a project", "3 actions need attention".

**Subhead pattern** — One plain sentence of what the page lets you do + the key state: "Track income across products, IP rentals, and events. Pending amounts clear on the dates shown."

**Microcopy examples**

- CTA primary: `Create project` · `Request payout` · `Publish` · `Save draft`
- CTA secondary: `Back` · `Cancel` · `Export CSV`
- Success: "Project saved as draft." · "Payout requested — arrives in 2–3 business days."
- Warning: "This product is referenced by 2 live projects. Editing it updates them too."
- Error: "Couldn't save. Your draft is kept — try again." · "Enter a payout amount up to your available balance ($842.10)."
- Empty (new): "No projects yet. Create your first to start earning."
- Empty (filtered): "No transactions match these filters. Clear filters to see all."
- Guidance: "Available = cleared and ready to withdraw. Pending = still in the platform's hold window."
- Money state pair: "Available **$842.10** · Pending **$1,204.00**"

**Capitalization** — Sentence case for headings, paragraphs, and buttons ("Create project", not "Create Project"). Status pills lower-case.

**Tense / voice** — Imperative + active present for actions ("Create", "Request"); plain present for states ("Pending", "Cleared").

**Copy norms** (workspace conventions)
- Headings default to no terminal period (per `feedback_section_titles_no_period_h3`).
- Avoid the "不是 X，而是 Y" negation-contrast Chinese construction (per `feedback_writing_style_no_negation_contrast`) — write positive claims directly.

### 5.3 States & Interaction

Global interaction defaults — keyframes live here (state-driven), not in Pillar 1.

- **Nav dropdown**: hover-open with a 140ms close delay (cursor can reach the panel); click still toggles. `aria-haspopup` + `aria-expanded` + ESC-to-close. Panel bg uses `--background` (not `--card`) so dark-mode translucency never muddies it over a colored hero.
- **Theme toggle**: light / dark / system 3-state cycle. Persists in `localStorage["ztor.theme.preference"]`. URL `?theme=dark` is a one-time override.
- **Tab switching** (`.tabs / .tab-panel`): single active panel, URL hash sync via `history.replaceState`; deep-link load activates the target tab.
- **Filter chip selection** (`.chip / .chip--active`): single-select within a `.chip-group`; active chip inverts to `--foreground` bg; result count updates on every change.
- **Switch** (`.switch / --on`): 150ms knob slide; track `--muted` ↔ `--primary`.
- **Accordion**: chevron-rotate, height transition on expand/collapse.
- **Motion**: durations 150–240ms, ease-out; all entrance animations gated behind `@media (prefers-reduced-motion: reduce)` (shown immediately when reduced).
- **Lifecycle states** (see the Lifecycle pattern card in §5.1):
  - **404** — same chrome, single "Page not found" headline, link back to Dashboard.
  - **Empty stub** (`.empty-stub`) — routes not yet built (orange mark + display title + spec refs).
  - **Error** — inline `Alert --row`, retry available, already-loaded data preserved.

### 5.4 Data Visualization

R 2.1 chart family lives in [`ds-components/chart.css`](./ds-components/chart.css). Three sub-patterns:

- **Line chart** (`.linechart`) — single- or two-series polyline. Default series uses `var(--primary)`; comparison line uses `var(--muted-foreground)` with `stroke-dasharray: 4 4`. Area fill below line is `color-mix(--primary 18%, transparent)`. Accent dot on latest point.
- **Stacked bar** (`.stacked-bar`) — 14px tall horizontal proportion pill. Segment widths set inline (consumer controls proportion); segment colors set inline (palette = primary / black / status-success / status-info / neutral-grey).
- **Source list legend** (`.source-list / .source-row`) — 4-col `[10×10 swatch] [label 1fr] [amt auto] [pct auto]` grid; pairs below `.stacked-bar` to spell out segment palette.

**Color palette for source breakdown** (Dashboard / Earnings Revenue by Source):
1. `var(--primary)` — primary income source (e.g., E-Shop sales)
2. `#000000` — secondary major source
3. `var(--status-success)` — tertiary
4. `var(--status-info)` — quaternary
5. `#999` — other / aggregated remainder

### 5.5 Workflow patterns

Multi-step, cross-page flows. The canonical recipe is the **Multi-step wizard** card in §5.1; the concrete flows are:

- **Create project** — 4 steps (About → Showcase → Monetization → Review), with IP-rental disclosure surfaced before commit.
- **Create event** — 3 steps (Type → Date & venue → Cover).
- **Create product** — 4 steps; primary vs secondary category recorded separately.

All use the `wizard-focus` template (no main topbar), a centered `stepper`, a sticky bottom action bar, and draft-save at every step. Money / royalty / licensing disclosures must appear on the Review step before commit.

---

## Pillar 6 · Structure

> Layout templates and page-level structure decisions. Components and Patterns are reusable building blocks; Structure assembles them into pages.

### 6.0 Grid & templates (token form)

> DSS v1.4 canonical token form for grid + page templates. Narrative renditions in §6.1–§6.5 below.

**Grid system:**

| Key | Value | Notes |
|---|---|---|
| `grid.columns` | `12` | Standard 12-col bento (`.bento`) |
| `grid.gutter` | `16px` | `gap: 16px` between bento children |
| `grid.margin` | `32px / 24px` | Page x-padding desktop / mobile |
| `grid.max-width` | `1248px` | Container cap |
| `grid.breakpoints.lg` | `900px` | **R 2.1 canonical breakpoint** — topbar nav collapses, bento children fall back to span-12, hero single-column |
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

- **12-col bento grid** (`.bento`) — primary layout for dashboard / earnings rows. Children use `.bento--span-{3,4,5,6,7,8,9,12}` to set columns. Below 900px breakpoint all children fall back to span 12 (mobile single-column). See [§4.25 Bento grid](#424-bento-grid).
- **Page container** — `max-width: 1248px`, centered; padding 32 24 96 (top-x-bottom).
- **Section vertical rhythm** — `mt-24` (24px) for top-level section gap; `gap: 16px` for bento children; `gap: 8px` for topbar action cluster.

### 6.2 Page Templates

R 2.1 has 5 canonical page templates. Each composes Pillar 4 components in a specific Pillar 6 structure:

| Template | Used by | Composition |
|---|---|---|
| **Dashboard** | [`index.html`](./index.html) | `app-topbar` → full-bleed `hero` carousel → `bento` (4 KPI) → `bento` (data-list + alerts panel) → `bento` (linechart + stacked-bar) → `bento` (3-column footer summary) |
| **Earnings (4-tab)** | [`earnings.html`](./earnings.html) | `app-topbar` → `page-intro` → `tabs` → 4 `tab-panel` (Overview / Transactions / Payouts / Tax) |
| **Wizard (focus mode)** | `create-project.html` / `create-event.html` / `create-product.html` | NO topbar → wizard chrome (close X + `stepper`) → step body → sticky bottom action bar |
| **Settings (sidebar)** | [`settings.html`](./settings.html) | `app-topbar` → `page-intro` → `.settings-layout` (250px sidebar nav + 1fr content with `settings-section` blocks) |
| **Empty stub** | `e-shop.html` (partial) / `events.html` / `ip-market.html` / `projects.html` | `app-topbar` → `page-intro` → `.empty-stub` block centered |

### 6.3 Page-intro pattern

All non-wizard pages start with a `.page-intro` block (left: eyebrow + h1 + sub; right: actions). Reserved for top-of-page header — not used mid-page. Eyebrow is `text-transform: uppercase` UI font 11px, title is `font-display` 36px, sub is body 14 muted.

### 6.4 Topbar (sticky)

`app-topbar` is `position: sticky; top: 0; z-index: 50` — present on all product pages except wizards. 64px tall, three slots: brand SVG (left) · `app-topbar__nav` ul (center) · `app-topbar__actions` (right: theme + search panel + lang + notifications + avatar menu).

### 6.5 Hero band

Dashboard only. Full-bleed carousel (3 slides) immediately under topbar, before `.page`. Min-height 520px (fullbleed variant). Backed by photo `images/hero-*.jpg` with linear gradient overlay; copy is `position: absolute` over the gradient.

---

## Implementation Notes

Technical-stack landing for this design system. The studio is a **static prototype** — no build step, no framework.

| Concern | Decision |
|---|---|
| Markup / styling | Hand-written HTML + CSS; one CSS file per component in [`ds-components/`](./ds-components/), all token-driven (`var(--…)`) |
| Tokens | [`ds-components/_tokens.css`](./ds-components/_tokens.css) — Foundation + Role + Mode (`[data-theme="dark"]`) in one layer |
| Theme | `theme.js` — light / dark / system cycle, persisted in `localStorage["ztor.theme.preference"]`; `?theme=` one-time override |
| Icons | `icons.js` — Lucide registry, injected per page via `ztorIcons.applyIcons()`; new icons must be registered first |
| i18n | `i18n.js` — `en` / `zh-Hant` dictionary, `data-i18n*` bindings, topbar toggle, `localStorage` persisted |
| Fonts | self-hosted woff2 in [`fonts/`](./fonts/) (Geist / Inter / Noto Sans TC subset) — no CDN |
| Project chrome | `shared.css` — project-level patterns (topbar, bento, wizard, hero) on top of `ds-components/` |
| Component API | CSS classes only (no JS component API) — so spec cards use HTML examples, not JSX; Props/API is N/A |
| Self-contained | the folder runs standalone — no asset or link depends on anything outside this directory |

---

## Appendix A · Output formats

The DSS v1.4 standard is output-agnostic. Ztor Creator Studio · R 2.1 ships as CSS Custom Properties (the canonical implementation in [`ds-components/_tokens.css`](./ds-components/_tokens.css)). Below are equivalent representations for other targets.

### B.1 CSS Custom Properties (shipping format)

```css
:root {
  /* Pillar 1 → Pillar 2: raw value flows into role token */
  --background:        #FFFFFF;
  --primary:           #ffa33f;
  --primary-foreground:#171717;
  --status-success:    #22C55E;
  /* … see _tokens.css for the full list */
}

[data-theme="dark"] {
  /* Pillar 3 Mode: only the differences from Role */
  --background:        #171717;
  --card:           rgba(253,253,253,0.10);
  /* … */
}
```

### B.2 Tailwind v4 config (theoretical handoff)

```css
@theme {
  --color-background:        #FFFFFF;
  --color-primary:           #ffa33f;
  --color-primary-foreground:#171717;
  --color-status-success:    #22C55E;
  --color-status-error:      #DA314A;
  --color-status-info:       #266DF0;

  --radius-sm: 3px;
  --radius:   6px;
  --radius-md:6px;  /* merged alias of --radius (Q2 2026-07-13) */
  --radius-lg:8px;
  --radius-xl:16px;

  --font-display: 'Geist', 'Geist', system-ui, sans-serif;
  --font-ui:      'Geist', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
}
```

### B.3 W3C DTCG JSON (interchange format)

```json
{
  "color": {
    "background": { "$value": "#FFFFFF", "$type": "color" },
    "primary":    { "$value": "#ffa33f", "$type": "color" },
    "primary-foreground": { "$value": "#171717", "$type": "color" },
    "status-success": { "$value": "#22C55E", "$type": "color" }
  },
  "radius": {
    "sm": { "$value": "3px", "$type": "dimension" },
    "md": { "$value": "6px", "$type": "dimension" }
  }
}
```

---

## Appendix B · DSS v1.4 JSON skeleton

Filled with Ztor Creator Studio · R 2.1's actual values where the 7-Pillar structure maps cleanly. Empty / per-need fields left as placeholders.

```json
{
  "record": {
    "name": "Ztor Creator Studio · R 2.1",
    "source": "Ztor Creator Studio (creator-economy operations dashboard)",
    "version": "R 2.1",
    "date": "2026-06-01",
    "base": "Ztor (parent design system)",
    "notes": "Highlighter-orange primary used structurally (active tabs, selection-card selected state, hero and pre-order pills — nav active states stay neutral gray, Q8 2026-07-13). Info banners use neutral tokens. App-tier components promoted from project shared.css to ds-components/ across Phase 0-4."
  },
  "foundation": {
    "palette": {
      "neutral": { "50":"#FFFFFF", "100":"#FAFAFA", "500":"#6E6E68", "900":"#171717", "1000":"#000000" },
      "orange":  { "300":"#ffb866", "500":"#ffa33f" },
      "yellow":  { "warning":"#F8D749" },
      "green":   { "500":"#22C55E", "dark":"#4ADE80" },
      "red":     { "500":"#DA314A", "dark":"#E7000B" },
      "blue":    { "500":"#266DF0", "dark":"#5896F3" }
    },
    "scale": [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128],
    "type": {
      "family": {
        "display": "Geist, Geist, system-ui, sans-serif",
        "ui":      "Geist, system-ui, sans-serif",
        "body":    "Inter, system-ui, sans-serif"
      }
    },
    "effect": {
      "radius": { "sm":"3px", "default":"6px", "md":"6px", "lg":"8px", "xl":"16px", "pill":"9999px" },
      "shadow": {
        "micro":    "0 4px 4px rgba(23,23,23,0.04)",
        "card":     "0 2px 8px -1px rgba(12,10,9,0.05), 0 0 0 1px rgba(23,23,23,0.05)",
        "popover":  "0 1px 1.6px rgba(0,0,0,0.05), 0 0 0.83px rgba(0,0,0,0.2)",
        "hairline": "0 0 0.833px rgba(0,0,0,0.2)"
      }
    }
  },
  "role": {
    "color": {
      "bg": { "canvas":"palette.neutral.50", "surface":"#FFFFFF", "muted":"palette.neutral.100", "inverse":"palette.neutral.1000" },
      "fg": { "default":"palette.neutral.1000", "muted":"rgba(0,0,0,0.7)", "subtle":"palette.neutral.500" },
      "primary":     { "bg":"palette.orange.500", "fg":"palette.neutral.900", "hover":"palette.orange.300" },
      "border":      "#EAEAEA",
      "ring":        "palette.neutral.900",
      "status": {
        "success":"palette.green.500",
        "error":  "palette.red.500",
        "info":   "palette.blue.500",
        "warning":"palette.yellow.warning"
      }
    }
  },
  "mode": {
    "dark": {
      "color": {
        "bg": { "canvas":"palette.neutral.900", "surface":"rgba(253,253,253,0.10)", "inverse":"#0A0A0A" },
        "fg": { "default":"#FDFDFD", "muted":"rgba(253,253,253,0.7)", "subtle":"rgba(253,253,253,0.4)" },
        "border": "rgba(253,253,253,0.12)",
        "ring":   "#FDFDFD",
        "status": { "success":"palette.green.dark", "error":"palette.red.dark", "info":"palette.blue.dark" }
      }
    }
  },
  "component": {
    "_note": "see Pillar 4 §4.1 for the full inventory; each unit carries a _layer tag (atom/molecule/organism), orthogonal to variant",
    "button": { "_layer": "atom", "primary": {}, "outline": {}, "ghost": {} },
    "_inventory": "button · badge · status-dot · chip · switch · info-banner · input · icon · meta-cell (atoms) · card · kpi · alert · accordion · tabs · cookie-banner · empty-stub · selection-card · composer · page-intro · field-system · filter-row · segmented-control · stepper · progress-stepper · settings-nav · settings-row · rental-card · rank-bars (molecules) · header · footer · data-list · table · chart · bento · app-shell · wizard-frame · hero-slideshow · ip-hero · chart-card (organisms)"
  },
  "pattern": {
    "_cards": {
      "_note": "see Pillar 5 §5.1 — each card has trigger/must/should/must-not/_edge-cases",
      "dashboard-home": { "_category": "layout" },
      "tabbed-section-view": { "_category": "layout" },
      "filter-and-list": { "_category": "interaction" },
      "lifecycle-states": { "_category": "lifecycle" },
      "multi-step-wizard": { "_category": "workflow" }
    },
    "voice": "(see §5.2)", "states": "(see §5.3)", "dataviz": "(see §5.4)"
  },
  "structure": "(see Pillar 6: 6.1 Grid · 6.2 Page templates · 6.3 Page-intro · 6.4 Topbar · 6.5 Hero)"
}
```

---


---

## Changelog

- **2026-06-01** — De-branded + cleaned of upstream-source residue to align with `project-ui-creator` skill rules (DSS v1.4).
  - Identity, §5.2 Voice, §5.1 patterns, §5.3 States, §5.5 Workflow rewritten from the upstream source-system (GEO) framing to **Ztor Creator Studio** (creator-economy operations dashboard).
  - §5.1 restructured into **Pattern cards** (5 cards across Layout / Interaction / Lifecycle / Workflow, each `trigger/must/should/must-not/_edge-cases`).
  - §4.0 de-branded (removed Material/Polaris/Brad Frost cross-reference column); §4.1 Inventory rebuilt against the real `ds-components/` files with a `_layer` column (dead `components/` links removed).
  - Similar Systems de-duplicated (kept in Identity); appendices renumbered (B→A Output formats, C→B JSON skeleton); JSON skeleton `record.source`, `component._layer`, and `pattern._cards` updated.
  - Removed the ~475-line upstream marketing/app crawl report (Source notes · Confirmed absent · Sources) — provenance of the upstream source system, not part of this product's design system.
