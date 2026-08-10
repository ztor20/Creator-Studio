# Ztor Creator Studio · R 2.1 — Design System

> **Structure aligned with DSS v1.4 7-Pillar architecture** (Pillar 0 Record · 1 Foundation · 2 Role · 3 Mode · 4 Component · 5 Pattern · 6 Structure · Appendix A/B). Restructured from the previous 5-pillar layout on 2026-05-26.

> **Differs from ztor**: two light-mode tokens shift to give the system a single, attention-grabbing brand color where ztor was deliberately near-monochrome.
>
> | Token | ztor | ztor-orange |
> |---|---|---|
> | `background-canvas` | `#F7F7F7` | **`#FFFFFF`** (clean white since 2026-06-09; was `#FAFAF7` warm paper, since neutralised) |
> | `border-soft` | `#E5E5E5` | `#E5E5E5` (cooler hairline retained — was briefly `#D1D1C7` 2026-05-22→25, reverted on user feedback) |
> | `primary` | `#171717` | **`#ffa33f`** (highlighter orange) |
> | `primary-foreground` | `#FFFFFF` | **`#171717`（亮暗同值，2026-07-28 起）** (原 2026-06-22 指定白天白字／黑夜黑字，因白字在淡橘上對比僅 ~1.99:1、低於 WCAG AA，2026-07-28 改兩主題統一深墨) |
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

**Locales** — `en (primary) · zh-Hant (secondary)`, toggled in the topbar and persisted. CJK glyphs are split across two self-hosted, subsetted typefaces — `LINE Seed TW` for headings (`--font-cjk-display`) and `Chiron Hei HK` (昭源黑體) for body/UI (`--font-cjk`) — with `Noto Sans TC` appended as the final fallback in both stacks (2026-07-28), so Traditional Chinese never falls back to a system serif.

**Tags** — `creator-economy`, `operations-dashboard`, `satoshi-stack`, `clean-white-canvas`, `neutral-surfaces`, `subtle-radii`, `multi-layer-shadows`, `dashboard-hero`, `row-divider-data`, `light-and-dark`, `highlighter-orange-primary`.

**Overview** — Ztor Creator Studio · R 2.1 is a clean, editorial take on a creator-economy operations dashboard: a white canvas (`#FFFFFF`) with near-white neutral surfaces — default cards and controls separate by a flat 1px `--border` (Q3/Q4 2026-07-13), and the sidebar display-mode rail uses a quieter `#FBFBFB`. Satoshi for UI / display / body (Geist and Inter kept only as Latin fallbacks), LINE Seed TW for CJK headings / Chiron Hei HK for CJK body-UI (2026-07-28 rebrand), subtle 6px radii, and multi-layer rim+drop shadows reserved for popovers/overlays and for the hover state of clickable/selection cards. Its one high-saturation move is **a highlighter-orange primary (`#ffa33f`) with near-black text** — used structurally for CTAs, active tabs, selection-card selected state, hero fills and pre-order pills (nav active states stay neutral gray — Q8). Informational banners stay neutral gray. Hairlines stay at `#EAEAEA`. The voice is task-oriented and finance-honest: every page states what you can do now, and money / royalties / verification states are always spelled out.

**Similar systems** — [Notion](https://notion.so) (highlighter-orange accent, editorial chrome), [Linear](https://linear.app) (Geist + neutral tokens, dense data UI), [Vercel](https://vercel.com) (Geist origin, subtle radii, rim+drop shadows), [Attio](https://attio.com) (dashboard-as-hero, CRM-style data density), [Stripe Dashboard](https://stripe.com) (finance-honest tables, transparent money / payout states).

---

## Top-level Do / Don't

System-level discipline. Component-level Do / Don't lives inside each component spec card; what follows applies across the whole system.

### Do

- Use `Satoshi` (H1/H2 display headings render all-caps, `--font-display`) with `letter-spacing: -0.2px`; `Satoshi` 400 / 13–14 px for UI labels and nav (`--font-ui`). CJK headings use `LINE Seed TW` (`--font-cjk-display`), CJK UI/body uses `Chiron Hei HK` (`--font-cjk`).
- Reserve `--primary` (`#ffa33f`) for the primary CTA, hero accent and brand mark. Informational banners use neutral tokens; never use orange as a fill for nav chrome, KPI highlights, or status pills.
- Controls & buttons use `--radius` (6 px; `--radius-md` is an alias of `--radius`, merged Q2 2026-07-13). **Card / panel / dialog-level containers use `--radius-xl` (16 px)** (Q16 2026-07-17 — cards放大到與 form-section 一致). Dropdown / nav-panel浮層 use `--radius-lg` (8 px); `--radius-pill` for full-round.
- Separate top-level sections with `mt-24` (24 px); use `gap: 16px` for bento children and `gap: 8px` for tight topbar clusters.
- Use the `pill` taxonomy (`pill--orange / --success / --error / --info / --neutral`) for every status indicator. New colored backgrounds outside that set are forbidden.
- Use Tabler icons via the local `icons.js` registry, stroke-width `1.2`, `currentColor` inheritance. Never inline raw `<svg>` for chrome icons.
- Use `var(--font-display)` only for hero / page H1; `var(--font-ui)` for everything else (buttons, nav, labels, KPI titles, table headers).
- Pair `--primary` with `--foreground` for button text. For longer button copy add `white-space: nowrap` on the `.btn` base.

### Don't

- Do not use `--primary` as a **solid** fill for nav active states, KPI cards, or row accents — solid orange is reserved for the primary CTA and for discrete committed choices (`.pager` current page). Selected states use the **tint** form instead: `--selected-surface` fill + `--selected-ink` text (Q8, reversed to A on 2026-07-27 — was neutral `--sidebar-active` grey; that token is now unused / 待採用). Interactive hover is still `--accent` (Q9); KPI/row backgrounds stay neutral `--card`/`--muted`.
- Do not write `color: var(--primary)` for selected text on a light surface — it measures 1.92:1, far below WCAG AA. Always go through `--selected-ink`, which resolves to the deepened `#8F4E00` in light mode and `#ffa33f` in dark.
- Content surfaces top out at E2 `--shadow-card`; `--shadow-float` / `--shadow-overlay` are reserved for transient layers (dropdowns, dialogs) — never for resting content. Interaction borrows the rung above (card hover → float); no ad-hoc shadow values. Only the hero carries deep light and it does so via gradient veil, not box-shadow.
- Do not introduce fonts outside the current stack — Latin: `Satoshi` (primary) → `Geist` → `Inter` (body 2nd fallback) → `Geist Mono` (code); CJK: `LINE Seed TW` (headings, `--font-cjk-display`) / `Chiron Hei HK` (body/UI, `--font-cjk`) → `Noto Sans TC` (final fallback, both). The CJK fallback chain is non-negotiable (2026-07-28 rebrand — see Pillar 1 §1.2.1 for the full cascade and why `_tokens.css`'s Geist/Inter-only declaration is superseded by `fonts.css`).
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
- **Q2 控制項圓角統一 6px**
  `--radius` 與 `--radius-md` 同值（6px），`--radius-md` 是別名——用於控制項與按鈕。
  例外：`--radius-pill`（9999px）、shell（28px）、`--radius-lg`（8px，dropdown/nav 浮層）、`--radius-xl`（16px，卡片/面板級，見 Q16）。
- **Q16 卡片/面板級圓角＝16px（`--radius-xl`）**
  card／kpi／預覽卡／選擇卡／表格容器／資訊 banner／上傳卡／彈窗 dialog 等「內容容器」統一 16px，與 form-section 一致；控制項維持 6px（形狀＝角色，呼應 Q1）。
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
- **Q8 品牌橘範圍**（2026-07-27 使用者裁決反轉為 A，原 B 中性灰版作廢）
  **「已選中」一律用品牌橘**，一套配方三種形態、橘永遠在場：
  **tint**＝安靜的持續選取（sidebar／sub-link／settings-nav／filter-tabs／chip）→ `--selected-surface` 底＋`--selected-ink` 字。
  **underline**＝主要檢視切換（`.tabs`）→ 橘底線（或 `--underline-short` 的橘 `::after`）。
  **solid**＝離散且已提交的選擇（`.pager` 目前頁、主 CTA）→ 實色 `--primary`。
  導覽／篩選只走 tint，實色橘保留給 CTA 與 solid，橘不與 CTA 搶焦。
  橘不一定落在文字上：`.segmented` 保留白色浮起 pill 只換字色；`.radio-card` 的橘在右上標記點與 icon、標題維持 `--foreground`。
  `--sidebar-active` 已退居回退用途、目前全站無 `var()` 引用（**待採用**），不再是導覽已選的答案。

  **橘的三個意思，靠「機制」分辨，不靠色票（2026-07-27 補）：**

  | 意思 | 機制 | 尺度 | 範例 |
  |---|---|---|---|
  | 這是**動作／主角** | 實色橘填底 `--primary` ＋ 深墨 `--on-primary` | 按鈕 or 整張卡 | 主 CTA、`.pager` 目前頁、`.kpi--hero` |
  | 這是**已選中** | 橘 **tint** 填底 `--selected-surface` ＋ `--selected-ink` 字 | 只用在小控件 | sidebar／settings-nav／filter-tabs／chip |

  分辨靠**填底濃度＋尺度**，不是靠色相：**實色＝主角**、**tint＝已選中**。
  已選中永遠是半透明的、且永遠長在 pill／nav item 這種小控件上；主角是實色的。
  兩者不會混淆——沒有人會把一整張實色橘的卡讀成「這張卡被我點選了」。

  兩條橘色的墨水規則（都是為了避開 `--primary` 的對比陷阱）：
  - 橘**當字或 icon**（底不是橘）→ `--brand-ink`，**不得** `var(--primary)`（白底 1.92:1）
  - 字**鋪在實色橘上** → `--on-primary` 深墨，**不得** `--primary-foreground`（亮色是白字，白對橘 1.99:1）
- **Q9 hover 底色**
  互動 hover 一律 `--accent`（亮 `#F3F3F3` / 暗 `#2A2B2C`，2026-07-17 midnight-v2 壓暗）。
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
| `primary-foreground` | rgb 23 23 23 | `#171717`（亮暗同值，2026-07-28 起）⚡ |
| `ring` | rgb 255 219 41 | `#ffa33f` (=primary) |
| `border-soft` | rgb 229 229 229 | `#E5E5E5` |
| `status-success` | rgb 34 197 94 | `#22C55E` |
| `status-error` | rgb 218 49 74 | `#DA314A` |
| `status-info` | rgb 38 109 240 | `#266DF0` |
| `status-warning` | rgb 248 215 73 | `#F8D749` (note: visually close to `primary` — reserve status-warning for **status dots inside dashboard demos**, never as a UI fill, to avoid clashing with the yellow CTA) |

⚡ = changed from ztor

| Property | Value |
|---|---|
| Display font | `Satoshi`, all-caps (H1) · CJK `LINE Seed TW` |
| UI font | `Satoshi` (H2-H4, buttons, nav) · CJK `Chiron Hei HK` |
| Body font | `Satoshi` (paragraphs) · CJK `Chiron Hei HK`, `Noto Sans TC` fallback |
| Primary radius | `6px` controls/buttons · `16px` card/panel-level（`--radius-xl`, Q16 2026-07-17）· `8px` dropdown 浮層 |
| Pill radius | `1000px` / `100%` (status dots, avatars) |
| Base spacing | Dense scale — 1, 4, 6, 8, 10, 12, 14, 16, 24 |
| Card shadow | `0 2px 8px -1px rgba(12,10,9,0.05), 0 0 0 1px rgba(23,23,23,0.05)` (rim + drop, softened 2026-07-13 — more diffuse, lower alpha) — used at rest by selection-card / dropdown-item / table / composer / cookie-banner; **`.card`（連同 `.funding-panel--card`／`.fc-bundle`）與 `.kpi` 2026-07-26 起也改用 `--shadow-card`＋`--shadow-edge-top` 浮起（Q23 決 C，取代 Q3 的純邊框）；`.kpi` 疊在 `.card`／`.form-section--outlined`／`.ip-hero` 內的 8 處用 scoped override 維持 `--input-surface` 底避免糊色，其餘沿用新預設；`.ztor-card` 仍維持 Q3 的 1px `--border`（docs-only、產品頁未使用，未列入本輪），shadow 保留給 clickable hover** |
| Soft elevation | `0 4px 4px rgba(23,23,23,0.04)` (cards / popovers lift；outline 按鈕自 2026-06-12 改 1px `--border` 實線、不再用此陰影) |
| Theme | **Light + dark** (toggle inherited from ztor's 2026-05-25 dark-mode adapter; dark primary also orange) |
| H1 desktop | `64px / 300 / lh 1 / tracking -1.28px` (Satoshi) |
| Button label | `15px / 400 / tracking -0.3px` (Satoshi) |
| Icon system | Tabler (via `icons.js` registry) |
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
| `sidebar-active` | `#ECECEC` | ~~Sidebar selected item~~ — **退居回退用途（2026-07-27 Q8-A）**：導覽已選改吃 `--selected-surface` ＋ `--selected-ink`，本 token 不再是任何已選態的答案 |
| `brand-ink` | light `#8F4E00` · dark `#ffa33f` | **可當文字用的品牌橘（2026-07-27）** — `--primary` 對近白底僅 1.92:1，任何要當**字或 icon** 的橘一律走這個 token，不得直接寫 `var(--primary)`。亮色為同色相 32° 的壓深版。對比：`--sidebar` 6.23:1／14% tint 5.70:1／白卡 6.45:1／深卡 8.02:1。目前的語意別名：`--selected-ink`（已選中）。**注意分工**：`--brand-ink` 是「橘字放在非橘底上」；字要鋪在**實色橘底**上時走 `--on-primary`，不是這個 |
| `faint-ink` | `color-mix(--muted-foreground 72%, transparent)` | **比 `--muted-foreground` 再低一階的墨色（2026-08-09 抽出）** — 站上最低階的文字 token 就是 `--muted-foreground`，比它更輕的角色只能以它為基底調降不透明度。混 `transparent` 而不是某個面色，所以它坐在任何底上都是同一階暗度，也因此**在深色主題自動更深、在亮色主題自動更淡**，不需要逐主題各寫一次。抽出的原因：2026-07-31 為表頭做的 `--column-head-ink` 其實是同一個配方，第二個消費者出現時與其複製一份，不如把配方收成單一來源。消費者＝`--column-head-ink`（表頭，見下一列） |
| `locked-field-ink` | `color-mix(--muted-foreground 55%, transparent)` | **全站 disabled 欄位唯讀值的墨色（2026-08-09 兩輪定案）** — 寫法一律 `var(--locked-field-ink)`。第一輪只在來源鎖定欄位（`field-source-tag.css` 的 `.is-source-locked`）用；**第二輪（使用者裁示「整個元件庫只能有一個 disabled 樣子」）把它上收成 `input.css` 的 `.input:disabled`／`.textarea:disabled`／`.select:disabled` 全站基準**，`field-source-tag.css` 因此不再自己定義鎖定樣式（見 [Field source tag §4.121](#field-source-tag)）。全站最輕的文字。不直接把 `--faint-ink` 調更淡，是因為它同時是表頭墨色（10 支元件），表頭沒有要跟著變。**對比刻意低於 AA**：實測深色 `#606061` 對 `#1C1D1E` ＝ 2.69:1、亮色 `#AFAFAC` 對白 ＝ 2.20:1。成立前提是它只承載 disabled 的唯讀值，而不是本頁要讀的資訊——欄位標籤與「bookyay 帶入」來源標記都維持正常對比，「這格是什麼、為什麼不能改」靠那兩個回答。**不得**用在需要閱讀的文字上 |
| `column-head-ink` | `var(--faint-ink)` | **列表／表格欄位表頭的標籤墨色（2026-07-31，STYLE-DECISIONS Q41）** — 站上沒有比 `--muted-foreground` 更暗的文字 token（亮 `#6E6E68`／暗 `#979797` 已是最低階），故以它為基底調降不透明度。**2026-08-09 起改成 `var(--faint-ink)` 的語意別名**，值與行為不變。收成 token 是因為同一個角色原本跑了三種配方（裸 `--muted-foreground`、`color-mix(…68%, --card)`、`color-mix(…72%, transparent)`），正是 Q9 要收斂的「散落的即席灰」。混 `transparent` 而非 `--card`，表頭坐在任何底色上（有些表頭帶 `--muted` 底）都是同一階暗度。消費者＝ 10 支表頭元件，一律寫 `var(--column-head-ink)`、不再各自調配 |
| `status-success-fill`／`destructive-fill` | `color-mix(<狀態色> 12%, transparent)` | **染色膠囊的底（2026-07-27）** — 與墨色成對抽出來，讓「擁有某個面」的元件可以整組換掉，而不是去覆寫 `.kpi__delta` 的個別屬性。混 `transparent` 而非 `--card`：混 `--card` 等於把深卡色**烤進膠囊自己的底色**，換到別的面（如 `.kpi--hero` 的實色橘）就變黑斑。對深卡是數學上的 no-op |
| `status-success-deep`／`destructive-deep` | `#14532D`／`#881337` | **深階實色版（2026-07-27）** — 給「坐在實色暖底上」的膠囊用（`.kpi--hero` 以 90% alpha 引用）。12% 淡染在飽和橘上撐不起綠，改由深綠底承載色相、字換白 |
| `status-success-ink`／`destructive-ink` | dark `#4ADE80`／`color-mix(--status-error 88%, #fff)` · light `#052E16`／`#4C0519` | **染色膠囊的墨色（2026-07-27）** — `.kpi__delta` 這種「狀態色 12% 半透明底＋同色字」的膠囊只有在**底是深的**時候才成立。膠囊的真實背景是它坐的那個面，所以墨色**跟著面走、不跟著主題走**（實色橘卡在深色主題下依然是亮底 → `.kpi--hero` 自己覆寫這兩個 token）。色相不動、只降明度，維持「一眼看出是綠／紅」。**12px semibold 屬 normal text，門檻 4.5:1 不是 3:1** —— green-900 `#14532D` 在橘膠囊上只有 4.47:1，差一點就是不行，故取 green-950。紅色墨改走 `--status-error`（2026-07-21 新增它就是為了「深底小字徽章 `#E7000B` 太深」，delta 當初漏接）並再提亮一階才過 4.5 |
| `on-primary` | `#171717`（亮暗同值）| **鋪在實色橘上的墨色（2026-07-27 新增）** — 當時 `--primary-foreground` 亮色仍是白字（使用者 2026-06-22 指定），白對 `#ffa33f` 僅 **1.99:1**、連 large text 3:1 都不到，鋪滿一整張卡會不能讀，故另立本 token（深墨對橘 **9.02:1**，過 AAA），只給大面積橘底（`.kpi--hero`）用。**2026-07-28 起 `--primary-foreground` 也改成同值 `#171717`**（見上一列），兩支 token 現在亮暗值完全相同；仍保留兩個獨立名稱，語意上一支代表「小面積按鈕文字」、一支代表「大面積橘底墨色」，未來若 `--primary-foreground` 因故再度分色（例如恢復白字），`on-primary` 能繼續獨立保證大面積可讀 |
| `selected-surface` | `color-mix(--primary 14%, transparent)` | **已選態填色（Q8-A，2026-07-27）** — 所有 tint 形態的已選（sidebar／sub-link／settings-nav／filter-tabs／chip）共用；用 `transparent` 混色所以會自動貼合底下的 rail／card／page 任何底色 |
| `selected-surface-hover` | `color-mix(--primary 20%, transparent)` | 已選態的 hover：同色再深一階，讓「已選且滑過」仍有回饋 |
| `selected-ink` | `var(--brand-ink)` | **已選態字色／icon 色（Q8-A）** — 語意別名，值來自 `--brand-ink`。分成兩個名字是為了讓「這個橘代表已選中」與「這個橘只是可讀的品牌橘」在讀 code 時分得開 |
| `background-surface` | `#FFFFFF` | Cards, nav-dropdown panels, dashboard mockup frames |
| `background-card` | `#FAFAFA` | Muted card variant (slightly cooler than surface) |
| `background-footer` | `#000000` | Pure black footer — the only place black appears as a fill |
| `foreground` | `#1A1A1A` | Body text, headings (dominant — 415 occurrences on home; off-black, 2026-07-13 體檢：純黑殺層次) |
| `foreground-muted` | `rgba(0,0,0,0.7)` | Secondary copy, supporting sentences |
| `muted-foreground` | `#6E6E68` | Caption, metadata, meta-text（2026-07-13 微暖） |
| `primary` | `#ffa33f` ⚡ | Primary CTA fill — "Create project" / "Request payout" / "Publish". The signature color |
| `primary-hover` | `#ffb866` ⚡ | CTA hover — brighter (reverse of ztor's "darken on hover" pattern) |
| `primary-foreground` | `#171717`（亮暗同值，2026-07-28 起）⚡ | Text inside primary CTAs。原使用者 2026-06-22 指定「白天白字、黑夜黑字」，2026-07-28（/impeccable polish）43 頁掃描把「白字對比僅 ~1.9:1」量成實際缺陷——`.btn--primary` 標籤實測 1.99:1，連 large text 的 3:1 都不到，是全站按鈕文字的通病；改為兩主題統一 `#171717`（深墨對 `#ffa33f` 為 9.02:1，過 AAA），主要按鈕從此兩個主題長得一致。使用者當時裁示「只保留品牌橘，其餘可自行決定」，授權此次改動 |
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

**墨色配對（-ink，2026-07-28 補完文件，r2.2 元件盤點）** — 每一支狀態色都配一支同色相的「可當文字用」墨色，理由同 `status-success-ink`／`destructive-ink`（見上表）：飽和狀態色本身在亮底上常不過 WCAG AA，填色歸填色、墨色歸墨色。

| Token | Light | Dark | Where it lives |
|---|---|---|---|
| `status-warning-ink` | `#8A6D00` | `var(--status-warning)` = `#F3CF58` | 警示黃在亮色模式當文字先天不可能（`#F8D749` 對白僅 1.42:1），另立可讀墨色（對白 4.92:1，過 AA），同色相不換色相；深色模式飽和色在深卡上本來就高對比，不必壓深，直接引用 `--status-warning`。全站 9 個檔引用（`alert.css`／`card.css`／`benefit-matrix.css`／`table.css`／`badge.css`／`toast.css`／`scanner.css`／`stock-tip.css`／`empty-card.css`） |
| `status-accent-ink` | `#6D28D9` | `var(--status-accent)` = `#A78BFA` | 紫色分類徽章（`.badge--accent`）的文字色，同一套「填色 12–16% 淡染＋墨色配對」邏輯；目前僅 `badge.css` 的 `.badge--accent` 一處引用，其餘狀態色的墨色引用面較廣，此支屬「已定義且被引用，但消費面窄」，非虛構 token |

**Scrollbar（2026-07-27，2026-07-29 補完文件）** — 全站自訂捲軸，只定義一次、不分主題：顏色由 `--foreground` 混 `transparent` 推導，`--foreground` 本來就跟著主題翻，兩個主題因此自動成立。混 `transparent` 而非某個 surface token是關鍵——同一支捲軸會出現在側欄軌、白色 modal、深色卡、甚至實色橘的 hero 卡上，混死某個面等於把錯的底色烤進自己身上（同日 `.kpi__delta` 混 `--card` 就是這樣在橘卡上變成黑斑的教訓）。`size` 是軌道寬（可拖曳的命中區），thumb 的視覺寬度由透明 border 內縮出來，所以 hover 變粗是在固定寬度內長大、不會造成 reflow。

| Token | Value | Where it lives |
|---|---|---|
| `scrollbar-size` | `12px` | 捲軸軌道寬／命中區（`*::-webkit-scrollbar` 的 width/height，`_tokens.css`） |
| `scrollbar-thumb` | `color-mix(in srgb, var(--foreground) 14%, transparent)` | 捲軸滑塊預設色 |
| `scrollbar-thumb-hover` | `color-mix(in srgb, var(--foreground) 32%, transparent)` | 捲軸滑塊 hover 色（`*:hover` 觸發，滑塊在固定寬度內加深變粗） |

### 1.2 Typography

Effective stack, from `ds-components/fonts.css` (this is what actually renders — see the note below the table):

```css
--font-display: 'Satoshi', 'Geist', var(--font-cjk-display), system-ui, sans-serif;
--font-ui:      'Satoshi', 'Geist', var(--font-cjk), system-ui, sans-serif;
--font-body:    'Satoshi', 'Inter', var(--font-cjk), system-ui, sans-serif;
--font-cjk-display: 'LINE Seed TW', 'Chiron Hei HK', 'Noto Sans TC';
--font-cjk:         'Chiron Hei HK', 'Noto Sans TC';
```

- **Satoshi** — primary Latin face for all three roles (`--font-display` renders `<h1>` all-caps, `--font-ui` covers H2–H4/buttons/nav/eyebrow, `--font-body` covers paragraph copy). 5 static weights (300/400/500/700/900), no 600.
- **Geist** — Latin fallback only, if Satoshi fails to load (variable woff2, still self-hosted).
- **Inter** — second-tier fallback for `--font-body` only.
- **LINE Seed TW** — CJK headings (`--font-cjk-display`), thick geometric strokes, large sizes only.
- **Chiron Hei HK** (昭源黑體) — CJK body/UI (`--font-cjk`), stays legible at small sizes.
- **Noto Sans TC** — final CJK fallback in both stacks.

| Scale token | Family | Size | Weight | Line height (`--lh-*`) | Tracking |
|---|---|---|---|---|---|
| `display-64` | Satoshi | `64px` | 300 | `none` 1.0 | `-1.28px` |
| `display-44` | Satoshi | `44px` | 300 | `tight` 1.1 | `-1px` |
| `title-40` | Satoshi | `40px` | 400 | `tight` 1.1 | `-0.8px` |
| `title-32` | Satoshi | `32px` | 400 | `tight` 1.1 | `-0.6px` |
| `title-24` | Satoshi | `24px` | 400 | `snug` 1.2 | `-0.48px` |
| `label-15` | Satoshi | `15px` | 400 | `none` 1.0 | `-0.3px` |
| `label-14` | Satoshi | `14px` | 400 | `snug` 1.2 | normal |
| `body-16` | Satoshi | `16px` | 400 | `loose` 1.6 | normal |
| `body-14` | Satoshi | `14px` | 400 | `relaxed` 1.5 | normal |
| `caption-12` | Satoshi | `12px` | 400 | `normal` 1.3 | `0.05em` |

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

**Font families (`--font-*`)** — 三層疊法，別只看 `_tokens.css`：

1. `_tokens.css` 宣告拉丁優先的舊版 base（`--font-display`/`--font-ui` Geist、`--font-body` Inter、`--font-mono` Geist Mono，`--font-cjk` 單純 `Noto Sans TC`）——2026-07-28 rebrand 後只當備援尾巴留著，不是實際生效值。
2. `ds-components/fonts.css` 排在其後載入，**完整重新宣告**同一批 token：拉丁換 Satoshi 打頭（`Geist`／`Inter` 降為備援）、中文新增兩支角色分工——`--font-cjk-display`＝`LINE Seed TW`（標題）打頭、`--font-cjk`＝`Chiron Hei HK` 昭源黑體（內文／UI）打頭，兩者皆以 `Noto Sans TC` 收尾；並持有全部 `@font-face`。
3. `shared.css` 的 `:lang(zh-Hant)` 只影響拉丁／中文的排序（繁中模式把中文提到前面），不改變「用哪一支中文字面」——那是由 `fonts.css` 的 `--font-cjk`／`--font-cjk-display` 決定。

**實際生效的是第 2 層**（`fonts.css` 覆寫贏過 `_tokens.css`），文件與程式碼都要以它為準。

Tight negative tracking (`-1.28px` on H1, `-0.8px` on H2) carries over from the Geist-era signature and still applies under Satoshi.

### 1.3 Spacing — `--sp-*`

**px 直命名刻度（2026-07-02 起，數字＝px，與 `--fs-14`=14px 同邏輯）**，取自全庫實際 px 值統計（高頻在 12/10/8/16/14/6/4），20 階：

`--sp-2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 40 · 48 · 56 · 64 · 72 · 80 · 96`

元件的 `gap` / `padding` / `margin` 一律 `var(--sp-N)`（2026-07-02 已全面轉換 645+ 處，轉換採「值不變」驗證、零渲染變化；`fan-store.css` 因並行編輯中暫未轉，後續補）。**例外保留字面值**：奇數微調（1/3/5/7/9/11/13px，optical adjustment）、刻度外偶數（22/26px）、負值 margin、`calc()` 運算。

Section-level vertical rhythm is closer to `80–96px`. Card internal padding is typically `16–24px`. Footer uses `80px` vertical padding.

> 舊 `--space-1…16`（N×4 制、幾乎未被採用、缺 6/10/14/18）已於 2026-07-02 退役移除；`--space-shell-gutter` 屬 shell 幾何、保留。間距語意 role 層（component/layout 級別命名）仍未建立（見 §2.3）。

**Width — `--w-*`**（2026-07-10 起）— 欄位／小元件的 `max-width`（或 `flex-basis`）刻度家族，px 直命名、與 `--sp-*` 同邏輯，主題無關（只定義在 `:root`）。起點兩個值，後續依實際使用值按需擴充：

`--w-220 · 300`

用於窄欄位（如 create-product 的自訂低庫存門檻輸入、限購數量輸入、pickup session 下拉）的 `max-width` / `flex-basis`；元件寬度裸值一律改用 `var(--w-N)`。

**Aspect ratio — `--img-portrait`**（2026-07-31 使用者裁決，D164）— 全站作品圖的單一直式比例：

`--img-portrait: 2 / 3`（≈0.667）

創作者實際上傳的展示圖比例（2:3）。上傳槽（`ds-components/upload-tile.css` 的 `--upload-img-ratio: var(--img-portrait, 2 / 3)`）與顯示端（清單縮圖、卡片封面等 7 支顯示元件，見 Pillar 4）皆引用這一個變數；顯示框由同一張直式原圖 `object-fit: cover` 置中裁切填滿，不再各自另備方形／橫式素材。**唯一例外**：活動（Events）的橫式橫幅槽與橫式顯示版位不吃這個變數，走 `upload-tile.css` 的 `--16x9`（見 §4.15）。此前多比例模型（縮圖 1:1／直式海報 3:4／橫幅 16:9／相簿 3:2）已全面退場。

### 1.4 Radius

| Token | Value | Where |
|---|---|---|
| `radius-button-primary` | `6px` | "Create project", "Request payout" |
| `radius-button-secondary` | `6px` | "Back" / "Cancel" outline CTA (`--radius-md` merged into `--radius`, Q2 2026-07-13) |
| `radius-card` | `16px` (`--radius-xl`, card/panel/dialog level — Q16 2026-07-17；原 6px) · `8px` (dropdown 浮層, `--radius-lg`) | Cards, panels, dialogs / dropdown panels |
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
| `shadow-float` | `0 8px 24px -8px rgba(12,10,9,0.08), 0 2px 6px -2px rgba(12,10,9,0.05), 0 0 0 1px rgba(23,23,23,0.05)` | E3 floating — dropdowns, popovers, tooltips（2026-07-21：product-list 的 hover/drag 浮起改用去 rim 的 `shadow-lift-flat`，見下一列） |
| `shadow-lift-flat` | 亮 = `shadow-float` 去掉 `0 0 0 1px` 那層（`0 8px 24px -8px rgba(12,10,9,0.08), 0 2px 6px -2px rgba(12,10,9,0.05)`）；暗 = 與 `shadow-float` 相同 | E3 變體，僅 product-list 列 hover／drag 浮起用（2026-07-21，使用者反饋「hover 不要 border」）。亮色列表卡背景（`--card` 白）與頁面背景色差已夠明顯，rim 反而被誤讀成邊框；暗色仍需要 rim 才看得出浮起（深底陰影本身不夠明顯），故暗色不變 |
| `shadow-overlay` | `0 16px 40px -8px rgba(12,10,9,0.18), 0 0 0 1px rgba(23,23,23,0.08)` | E4 overlay — modals, dialogs, drawers |
| `shadow-card-hover` | `var(--shadow-float)` | Clickable card hover lift = borrow E3 (interaction rises one rung) |
| `shadow-raise` | `0 1px 2px rgba(0,0,0,0.06)` (dark `0.5`) | Low control raise — primary buttons, input drop, segmented active |
| `shadow-raise-strong` | `0 1px 2px rgba(0,0,0,0.16)` (dark `0.6`) | Floating control — switch knob, chart marker drop |
| `shadow-hairline` | `0 0 0.833px rgba(0,0,0,0.2)` | Sub-pixel border simulation |
| `shadow-header` | `0 3px 16px rgba(0,0,0,0.10)` (dark `0.45`) | Sticky wizard header 下緣柔和投影（由 header 後內縮圓角色塊投出，只露下緣） |
| `shadow-seam` | `7px 0 20px -4px rgba(12,10,9,0.16)` (dark `0.6`) | 上層主面板向右蓋向相鄰下層（E-Shop 主面板疊在預覽上） |
| `shadow-edge-top` | `inset 0 1px 0 rgba(255,255,255,0.5)` (dark `rgba(253,253,253,0.05)`) | 頂緣高光——疊在無邊框浮起卡上緣，與 `--shadow-card` 併用（`form-section--outlined`，Q18 2026-07-17）；亮色白底近乎不可見、深底顯上緣光。屬階梯外邊緣工具 |
| `shadow-nest-up` | `0 -6px 8px rgba(0,0,0,0.05)` (dark `0 -8px 8px rgba(0,0,0,0.08)`) | 向上投影——把嵌在卡片底部的巢狀層（`.nest`，§4.86）從卡面托起。⚠ 只有垂直位移、模糊會往左右外溢，母卡必須 `overflow:hidden`。亮色模式下卡與 nest 同為白，這道陰影是唯一的分層線索。屬階梯外邊緣工具（2026-07-21，Figma 856:27798）|

**Pattern** — Ztor uses **multi-layer shadows to define edges without ever drawing a border**. The `inset 0 0 0 1px rgba()` ring is a soft outline; the `0 2px 6px rgba()` is the drop. Together they replace what most systems would draw as a `border: 1px solid var(--border)`. This remains the pattern for dropdowns / popovers / dialogs / overlays, input controls, and the hover state of clickable / selection cards. **Exception (2026-06-12)**: outline buttons draw a real `border: 1px solid var(--border)` — on the clean-white canvas (06-09) a fill-only edge disappears. **Exception extended (Q2–Q3, 2026-07-13)**: default cards (`.card` / `.kpi` / `.ztor-card`) moved to a real 1px `--border`; `--shadow-card` is reserved for clickable/selection-card hover and for surfaces that retain their own elevation (base `.selection-card`, dropdown-item, table, composer, cookie-banner). **Exception extended (Q13, 2026-07-16)**: the create-flow choice cards — `.selection-card--icon` and `.radio-cards` — moved to a flat 1px `--border`, no shadow, aligned to Figma node 781-4166. **Exception extended (2026-07-21)**: product-list row hover/drag lift drops the rim entirely (`--shadow-lift-flat`, light mode only) — its lifted card background already reads against the page via color contrast, so the rim doubled as an unwanted border; dark mode keeps the full rim since it's the only visible lift cue there.

**Edge & overlay tokens (2026-06-15)** — `--border-inverse` (`rgba(255,255,255,0.1)`, same in both themes) was the hairline on always-dark / inverse surfaces (the footer slab); **待採用** since Footer retired on 2026-08-03 — defined but no longer referenced. `--overlay-tint` (`rgba(0,0,0,0.45)`) is the darkening mixed into modal backdrops (`.payout-modal`, paired with `--overlay-blur`).

**Raw-color exceptions (acknowledged WARN)** — `check_ds_sync` flags bare colors in three components, all intentional fixed artwork:
- `upload-tile.css` video letterbox (`.upload-tile__video { background: #000 }`) — **irreducible**: media playback matte is pure black regardless of light/dark theme (standard video letterbox), same rationale as an embedded image; not a themeable surface.
- `progress-stepper.css` segmented track mask (`repeating-linear-gradient(90deg, #000 …, transparent …)`) — **irreducible**: the `#000` here is a *mask stop*, not a paint colour — a CSS mask only reads alpha, so any opaque value works and none of them reaches the screen; the visible colour still comes from the track's own token. Swapping in a theme token would imply a colour decision that doesn't exist（2026-08-10 記錄，供 check_ds_sync 檢查 10 的基準對照）。
- `selection-card.css` theme-picker swatches (`--theme-light` / `--theme-dark` / `--theme-system`) — **irreducible**: each swatch must paint the *actual* literal theme colors (`#FAFAF7` / `#ffa33f` / `#191A1A`) so the preview shows what each mode looks like even when viewing a different mode; can't reference theme-reactive tokens.
- `vip-card.css` VIP-card template (`.vip-card__frame` holographic gradients + `.vip-card__plate`/`__logo`/`__plate-sub` white/rgba) — the membership-card face is a **fixed, theme-independent artwork** (a CSS approximation of the platform template); its colors deliberately do not follow light/dark tokens, same rationale as an embedded illustration/image. Real template asset TBD.
- `fan-store.css` phone screen (`.fan-store__phone` scoped `--fst-*` dark neutrals + bezel/hero-gradient/fan-ring hexes) — the See-as-fan phone renders the **fan app's fixed-dark surface** (theme-independent, same rationale as vip-card): the fan app is its own product with its own dark theme, so the phone must not flip with the creator-backoffice light/dark toggle. Brand accent stays `var(--primary)`; rank-ring colors (#A78BFA/#4ADE80/#2DD4BF/#86EFAC) are fixed decorative rank hues (2026-07-02).

All other former ad-hoc shadow/border colors were tokenized on 2026-06-15 (`--shadow-raise` / `--shadow-raise-strong` / `--border-inverse`（**待採用**，Footer 退場後無人引用）/ `--overlay-tint`).

**Page-scoped `[data-theme]` override exception（2026-07-23 已解除）** — `check_ds_sync` 檢查 8 原本標記 `e-shop.html` 的 `.eshop-list-topbar`（含 light-mode 覆寫留在頁內 `<style>`），當時的裁決是「全站唯一消費頁、沒有跨頁一致性風險，等第二個頁面要用同樣的樣式再抽共用元件」。2026-07-23 projects 整理頁頭時正好觸發那個條件，整組已 promote 成 [`list-toolbar.css`](./ds-components/list-toolbar.css)（`.list-toolbar` / `.list-toolbar__actions` / `.list-status-row`，見 Pillar 4 條目），light-mode 覆寫隨之進元件層，這條例外不再適用。

### 1.5b Raw-value exceptions — r2.2 新元件（2026-07-29 盤點）

外部協作者併入的 19 支新元件（Pillar 4 §4.92–§4.110）逐檔核對後，共 6 支＋ 1 支的字級用了裸值。判準沿用上方 §1.5 的既有原則：**疊在真實照片／素材縮圖上的黑色遮罩、陰影 rgba、`clamp()` 的排版級距**屬合理例外；**能用既有 token 表達的不算例外**，逐條記錄如下（檔名:行號 — 值 — 理由）：

- `brand-card.css:71` — `color: #fff` — `.brand-card__mark` monogram 文字色，疊在品牌自訂（使用者上傳、不可預期）的 logo 底色上，需要「永遠是白」而非跟主題翻轉；與 vip-card／fan-store 既有的「固定素材色不隨主題」判準同理，**判定：合理例外**。
- `chart-tip.css:65` — `box-shadow: 0 1px 5px rgba(0,0,0,.10), 0 6px 16px rgba(0,0,0,.08)` — 折線圖浮層陰影，屬固定投影而非疊圖遮罩，未走 `--shadow-*` token；**判定：合理例外（陰影 rgba），但建議下次治理輪收斂成 `--shadow-float` 家族**，非阻斷。
- `checkbox.css:118`／`checkbox.css:131` — `--zcheck-ink: #271302`（第 131 行為同值 fallback）— 勾號墨色，品牌橘在深淺兩個主題都偏亮，勾號必須「不隨主題翻轉」；現有 token 沒有一支「深色不隨主題翻轉的墨色」（`--brand-ink` 解的是反方向問題：橘色字不隨主題翻轉），**判定：合理例外，且目前無等價 token 可替代**（若要收斂需新增 token，屬 CSS 層改動，非本輪範圍）。
- `detail-sheet.css:34` — `background: color-mix(in srgb, #000 52%, transparent)` — 覆蓋層遮罩底色。**判定：非乾淨例外，建議收斂**——站上已有 `--overlay-tint`（`rgba(0,0,0,0.45)`，見 §1.5 Edge & overlay tokens）承擔同一種「modal/覆蓋層遮罩」角色，本檔用 52% 而非既有 `--overlay-tint` 的 45%，屬可以但尚未對齊既有 token 的裸值漂移，非「無法用 token 表達」的那一類。
- `detail-sheet.css:47` — `box-shadow: var(--shadow-overlay, 0 -8px 40px rgba(0,0,0,.45))` — 主路徑已引用 `--shadow-overlay`，`rgba(0,0,0,.45)` 只是 token 缺值時的 fallback 字面量，非實際生效值；**判定：不計入裸值，優先度最低**。
- `media-vault.css:604,607,660,661` — `color-mix(in srgb, #000 62%/76%, transparent)` ／ `color: #fff`（時長晶片與縮圖底部名稱漸層，共 4 處）— 全部疊在真實影音縮圖上，需要釘選黑底白字不隨主題翻轉；**判定：合理例外**，是本批「疊在真實照片上的黑色遮罩」判準的典型案例。
- `sticky-actions.css:31` — `box-shadow: 0 -6px 16px rgba(0, 0, 0, 0.08)` — 吸底列上緣陰影，未走 `--shadow-*` token；**判定：合理例外（陰影 rgba）**，與 chart-tip 同類，可排入未來 `--shadow-*` 收斂候選。
- `fans-guide.css:57,150` — `font-size: clamp(2.4rem, 6vw, 4.2rem)` ／ `clamp(1.4rem, 2.6vw, 2rem)` — 兩處大標字級，`ch` 單位在 CJK 下量測失真，改用 script-neutral 的 rem 級距；**判定：合理例外（`clamp()` 排版級距）**。

外部改版同時動到兩支**既有**元件（不在 19 支新元件之列），其棘輪基準也一併調高，理由記於此：

- `button.css:103` — `background: color-mix(in srgb, var(--destructive) 86%, #000)` — destructive 按鈕的 hover 壓深。`--primary` 有專屬的 `--primary-hover`，`--destructive` 沒有對應 token，只能就地用 `#000` 混色壓深；同手法在站上已重複出現多次。**判定：例外，但屬設計系統缺口**——建議下一輪治理新增 `--destructive-hover`（**尚未定義、待採用**），把這幾處一起收斂。
- `list-toolbar.css:270,274` — `box-shadow: 0 6px 20px -10px rgb(0 0 0 / 0.5)`（深色主題）／ `-12px rgb(0 0 0 / 0.28)`（淺色主題）— 新增的 Snap dock 浮起陰影，兩個主題各一組。與 chart-tip、sticky-actions 同類：投影而非疊圖遮罩，未走 `--shadow-*` token；**判定：合理例外（陰影 rgba）**，排入未來 `--shadow-*` 收斂候選。

**小結**：19 支中判定為「無法用既有 token 表達、應保留」的例外共 6 處（brand-card、checkbox、media-vault ×4、fans-guide ×2、sticky-actions、chart-tip）；`detail-sheet.css:34` 判定為**應收斂**、非合理例外，記錄於此供下一輪 CSS 治理處理（本次僅記錄，未動 CSS）。棘輪基準 `ds-baseline.json` 是否要為上述合理例外調高對應檔案的允許值，由下游負責 CSS／baseline 的 agent 決定。

### 1.6 Motion

Durations sit in the `150–300ms` range with ease-out curves; `transition: all` is common on interactive elements. Entrance animations are gated behind `@media (prefers-reduced-motion: reduce)` and shown immediately when motion is reduced.

### 1.7 Iconography

**Tabler** icon set (`@tabler/icons` 3.45.0), registered in `icons.js` and injected per page via `ztorIcons.applyIcons()`. Thin 1.2px outlined glyphs as inline SVG (no icon font). Any new icon must be added to the registry before use.

**品牌標記是唯一例外（2026-08-04）** — `brand-apple`／`brand-google`／`brand-facebook`／`brand-line` 取自 **Simple Icons（CC0）** 而非 Tabler：各家商標規範綁死了標記的形狀，Tabler 的重畫版對不上。同樣是 24×24 網格，路徑帶 `fill="currentColor" stroke="none"`（與 `*-fill` 同一套做法），**單色**、由外層控件的 `color` 決定顏色——站上不引入任何品牌彩色值。消費者：`login.html` F1 的四張第三方登入卡（`.radio-cards--gate` 內的 `.radio-card__lead`）。

**實心字符只給特定情境，不是全站選項**：站上預設是描邊，`*-fill` 只存在於實心真的在做事的地方——儀表板告警卡（`alert-triangle-fill`／`info-fill`／`check-circle-fill`／`x-circle-fill`），以及 `login.html` F1 方式卡的 `mail-fill`／`smartphone-fill`（2026-08-04 新增，取自 Tabler `filled/mail` 與 `filled/device-mobile`，MIT）。登入頁那一格改實心是刻意的局部例外：同一個 2 欄 grid 裡另外四張是品牌標記，品牌標記沒有描邊版，六顆並排時混兩種風格會看起來像沒對齊。兩顆的 `<g>` 從中心放大 1.14 倍（原圖信封 20×16、手機 14×20，品牌標記多半滿版 24），讓六顆的光學大小接近。描邊的 `mail` 與 `smartphone` 路徑未動：`smartphone` 仍是 `settings.html` 登入裝置列在用，`mail` 由 `partials/artist-picker.js` 引用（該元件目前零頁面載入、屬退場候選）。裁決見 `STYLE-DECISIONS.md` Q51。

**試做批次：儀表板整頁實心（2026-08-04，尚未採用、尚未裁決）**：另外 11 顆 `*-fill`（`layout-grid-fill`／`banknote-fill`／`receipt-fill`／`flag-fill`／`award-fill`／`tag-fill`／`bell-fill`／`lock-fill`／`calendar-fill`／`circle-fill`／`globe-fill`）只服務比較用示範頁 `demo-icons-filled.html`，正式頁面一顆都沒引用。該頁是 `index.html` 的複本，唯一差別是多掛一段別名腳本把 registry 的描邊 key 指到實心版，藉此在不動 `index.html`、`js/sidebar.js`、`js/components.js` 的前提下讓整頁（含側欄導航與動態渲染的卡片）換成實心。這批不加 `<g transform>` 縮放：量過幾何邊界，Tabler filled 版剛好比 outline 版每邊各大 1px（用來補償 stroke-width 2 的一半），站上 stroke-width 是 1.2，因此實心版視覺上只大 4–6%，與既有四顆告警實心的做法一致。首頁另有 18 顆字符 Tabler filled 集裡沒有（`menu`／`x`／`rocket`／`landmark`／`chevron-down`／`chevron-right`／`shopping-bag`／`ticket`／`users`／`search`／`package-x`／`upload`／`megaphone`／`trending-up`／`dollar-sign`／`refresh-ccw`／`bar-chart-3`／`link`），一律維持描邊、不手工描假的——所以示範頁必然是實心與描邊混排，那正是要給使用者判斷的東西。使用者裁決前不要把這批接到任何產品頁；決定不採用時連同示範頁一起刪除。

**兩檔分工（刻意設計，勿合併）**：`js/icons.js`（~36KB，策展 139 顆）＝產品頁 registry，30 頁都載、保持輕量；`js/icons-all.js`（~1.7MB，完整 Tabler 6166 顆＝outline 5112＋filled 1054，自動生成）**只有 `design-system.html` 載**（供「未使用」icon 總覽瀏覽），且必須排在 `icons.js` 之前——`icons.js` 會把 `window.ZTOR_ICONS_ALL` 中缺的 key 併入 REGISTRY。產品頁要用新 icon 仍走「補進 `icons.js` registry」流程，不掛全集。

**registry key 沿用舊名（2026-07-21 換庫後的刻意決定）**：2026-07-21 由 Lucide 換成 Tabler 時，key 名稱一律保持換庫前的舊名（`trash-2`、`more-horizontal`、`check-circle`…），HTML 的 `data-lucide="..."` 屬性名也未改，因此 39 頁、2,630 處引用完全不用動。代價是「屬性名與圖庫名不一致」——這是拿命名整潔換零改動風險的取捨，日後若要正名，走獨立的一次性機械改名（`data-lucide` → `data-icon`），不要跟換圖庫混在同一輪。

**換庫對照表（key → Tabler 檔名）**：71 顆同名直接對上，以下 53 顆需對照。

| registry key | Tabler | | registry key | Tabler |
|---|---|---|---|---|
| `alert-triangle-fill` | filled/`alert-triangle` | | `mic` | `microphone` |
| `badge-check` | `rosette-discount-check` | | `monitor` | `device-desktop` |
| `banknote` | `cash-banknote` | | `more-horizontal` | `dots` |
| `book-open` | `book` | | `more-vertical` | `dots-vertical` |
| `boxes` | `stack-2` | | `package-x` | `package-off` |
| `check-circle` | `circle-check` | | `panel-left` | `layout-sidebar` |
| `check-circle-fill` | filled/`circle-check` | | `panel-top` | `layout-navbar` |
| `disc-3` | `disc` | | `party-popper` | `confetti` |
| `film` | `movie` | | `pause` | `player-pause` |
| `gem` | `diamond` | | `percent` | `percentage` |
| `house` | `home` | | `play` | `player-play` |
| `id-card` | `id` | | `qr-code` | `qrcode` |
| `image` | `photo` | | `refresh-ccw` / `refresh-cw` | `refresh` |
| `info` | `info-circle` | | `repeat-2` | `repeat` |
| `info-fill` | filled/`info-circle` | | `rotate-ccw` | `rotate` |
| `landmark` | `building-bank` | | `search-x` | `search-off` |
| `megaphone` | `speakerphone` | | `sliders-horizontal` | `adjustments-horizontal` |
| `smartphone` | `device-mobile` | | `store` | `building-store` |
| `trash-2` | `trash` | | `x-circle` | `circle-x` |
| `x-circle-fill` | filled/`circle-x` | | `mail-fill` | filled/`mail` |
| `smartphone-fill` | filled/`device-mobile` | | `award-fill` | filled/`award` |
| `banknote-fill` | filled/`cash-banknote` | | `bell-fill` | filled/`bell` |
| `calendar-fill` | filled/`calendar` | | `circle-fill` | filled/`circle` |
| `flag-fill` | filled/`flag` | | `globe-fill` | filled/`globe` |
| `layout-grid-fill` | filled/`layout-grid` | | `lock-fill` | filled/`lock` |
| `receipt-fill` | filled/`receipt` | | `tag-fill` | filled/`tag` |

### 1.8 Theme mode

**Light + dark + system.** `<html data-theme="light|dark">` driven by `theme.js`, persisted in `localStorage["ztor.theme.preference"]`; `prefers-color-scheme` is followed when the preference is `system`. Toggle entry in the topbar (sun/moon cycle) + Settings → Appearance radio cards. The black footer is a deliberate hi-contrast slab in both modes. See Pillar 3 for the dark role overrides.

### 1.9 Grid / Layout

- Page container max-width 1280px, centered；窄版變體 `.page--narrow` = 1056px，只給兩欄詳情頁（見 §6.1）
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
| **Primary — foreground** (text on orange) | `--primary-foreground` | `#171717`（亮暗同值，2026-07-28 起） | 原使用者指定 2026-06-22「白天白字、黑夜黑字」；2026-07-28 impeccable-polish 掃描把白字對比 ~1.99:1（< WCAG AA 3:1）量成實測缺陷，改兩主題統一深墨（對 `#ffa33f` 9.02:1，過 AAA），與 `--on-primary` 現在同值（見 Pillar 1 §1.1） |
| **Border** (hairlines) | `--border` | `#EAEAEA` | cooler neutral（2026-07-13 體檢：更淡，配微暖畫布靠色階分層） |
| **Ring** (focus outline) | `--ring` | `#ffa33f` | orange (=primary), by request 2026-06-02 |
| **Status — success** | `--status-success` | `#22C55E` | green.500 [ext] |
| **Status — error** (badges/pills) | `--status-error` | `#DA314A`（dark `#FF3D47`）| 2026-07-21 對齊 Figma 845:11071：與破壞性操作色分開，暗色改較亮的紅（原 `#E7000B` 深底徽章小字不易讀）；亮色暫同 `--destructive` [ext] |
| **Destructive** (delete / danger actions) | `--destructive` | `#DA314A` | red.500；刪除鈕、danger dropdown item、破壞性確認——不用於狀態徽章（見上） |
| **Status — info** | `--status-info` | `#266DF0` | blue.500 [ext] |
| **Status — warning** (data dots only · NOT UI fill) | `--status-warning` | `#F8D749` | yellow-warning — visually close to `--primary`, reserved for dashboard status dots [ext] |
| **Status — accent** | `--status-accent` | `#8B5CF6` | purple — extra category hue [ext] |
| **Card — foreground** | `--card-foreground` | `#000000` | shadcn 對齊補的配對字色；元件現多直接用 `--foreground`（待採用） |
| **Popover** (dropdown / nav 浮層) | `--popover` / `--popover-foreground` | `#FFFFFF` / `#000000` | white tier；元件尚未改引用（待採用） |
| **Accent — foreground** | `--accent-foreground` | `#000000` | 配對字色（待採用） |
| **Destructive — foreground** | `--destructive-foreground` | `#FFFFFF` | 配對字色（待採用） |
| **Input** (控件邊) | `--input` | `#EAEAEA` | = border；元件現多直接用 `--border`（待採用） |
| **Input surface** (填色互動面) | `--input-surface` | `var(--card)`（dark `#262729`）| 暗色下比 `--card` 亮一階的「填色互動面」：`.input/.textarea/.select`（2026-07-17 Q19）＋型別選項卡 `.selection-card--icon`＋上傳投放區 `.upload-tile`（2026-07-18）皆用，讓這些互動面在 section 卡（`--card`）上浮得出來；亮色＝白卡靠 border 分界 |
| **Nest surface** (巢狀層薄膜) | `--nest-surface` | `transparent`（dark `rgba(222,223,233,.04)`）| 疊在 `--card` 上的第二層 surface（`.nest`，§4.53）。亮色＝透明，卡與 nest 同為白、單靠 `--shadow-nest-up` 分層就夠；深色才真的疊一層冷調薄膜（合成 ≈ `#292A2B`，刻意不用純白以免洗掉畫布冷調）。層級只有兩層填色，L3+ 改邊框 |
| **Charts** | `--chart-1..8` | 橘 `#ffa33f` · 藍 `#266DF0` · 綠 `#22C55E` · 黃 `#F8D749` · 紫 `#8B5CF6` · 玫紅 `#EC4899` · 青 `#06B6D4` · 赭 `#7C4A2D` | 收益類型與排行色相；6–7 於 2026-07-27 隨商品／門票收益加入，8 於 2026-08-09 隨貼文帶貨收益加入（D181） |
| **Sidebar family** | `--sidebar-*`（`-foreground` / `-primary(-foreground)` / `-accent(-foreground)` / `-border` / `-ring` / `-active` [ext]） | `#FBFBFB` + 整組 | rail 一家；其中 `--sidebar-primary(-foreground)` / `--sidebar-ring` / `--sidebar-accent-foreground` 元件尚未引用（待採用） |
| **Brand gradient** | `--gradient-brand` | 橘漸層（#ffd9a0 · #ffa33f · #ff7a4d） | 進度條品牌漸層 [ext] |

**Naming aligns with shadcn/ui** (issue #11): semantic tokens use shadcn's vocabulary so shadcn code + AI map directly; names shadcn lacks are kept as `[ext]`. (Primary-reserved usage rule moved to §2.6.)

### 2.2 Typography Roles

| Role | Token | Stack (effective, from `fonts.css`) | Used for |
|---|---|---|---|
| Display | `--font-display` | `'Satoshi', 'Geist', var(--font-cjk-display), system-ui, sans-serif` | H1 / page intros / KPI values (all-caps) |
| UI | `--font-ui` | `'Satoshi', 'Geist', var(--font-cjk), system-ui, sans-serif` | Buttons, nav, labels, badges, all chrome text |
| Body | `--font-body` | `'Satoshi', 'Inter', var(--font-cjk), system-ui, sans-serif` | Long-form prose, alert descriptions |
| Mono | `--font-mono` | `'Geist Mono', ui-monospace, …` | Code, tabular figures, dev tags |
| CJK headings | `--font-cjk-display` (inside `--font-display`) | `'LINE Seed TW', 'Chiron Hei HK', 'Noto Sans TC'` | 繁中 mode headings — self-hosted subset woff2 in `fonts/` |
| CJK body/UI | `--font-cjk` (inside `--font-ui`/`--font-body`) | `'Chiron Hei HK', 'Noto Sans TC'` | 繁中 mode body/UI — self-hosted subset woff2 in `fonts/` |

Concrete typography usage is assigned as role aliases that point back to the
neutral §1.2 type scale. Each role resolves the four raw dimensions into one
decision — family · size · weight · **leading** · tracking — where **leading
binds to the `--lh-*` scale** (§1.2). This matrix is the standard; component CSS
references the role, never raw values (html 版另有每個角色的即時渲染):

| Usage role | ← Foundation | Family | Size | Weight | Leading (`--lh-*`) | Tracking |
|---|---|---|---|---|---|---|
| `--type-display-1-*` | `display-64` | Satoshi | 64 | 300 | `none` 1 | `-1.28px` |
| `--type-page-title-*` | `display-44` | Satoshi | 44 | 300 | `tight` 1.1 | `-1px` |
| `--type-h2-*` | `title-40` | Satoshi | 40 | 400 | `tight` 1.1 | `-0.8px` |
| `--type-h3-*` | `title-32` | Satoshi | 32 | 400 | `tight` 1.1 | `-0.6px` |
| `--type-h4-*` | `title-24` | Satoshi | 24 | 400 | `snug` 1.2 | `-0.48px` |
| `--type-section-label-*` | `label-14` | Satoshi | 14 | 400 | `snug` 1.2 | normal |
| `--type-button-label-*` | `label-15` | Satoshi | 15 | 400 | `none` 1 | `-0.3px` |
| `--type-body-lg-*` | `body-16` | Satoshi | 16 | 400 | `loose` 1.6 | normal |
| `--type-body-*` | `body-14` | Satoshi | 14 | 400 | `relaxed` 1.5 | normal |
| `--type-caption-*` | `caption-12` | Satoshi | 12 | 400 | `normal` 1.3 | `0.05em` |

### 2.3 Spacing

間距自 2026-07-02 起走 Pillar 1 的 `--sp-*` px 直命名刻度（見 §1.3），元件 `gap` / `padding` / `margin` 直接引用 primitive——與字級直接用 `--fs-*` 同一模式。

- **語意 role 層（component/layout 級別命名）仍未建立**：這是誠實現況，不是缺陷宣稱；等有真實一致的用途分群再命名，不預先杜撰（先前虛構的 `--gap-tight/default/section/page` 已於 2026-06-30 移除，教訓見 anti-patterns #11）。
- 例外保留字面值：奇數微調（1/3/5/7/9/11/13px）、刻度外偶數（22/26px）、負值、`calc()`；`fan-store.css` 因並行編輯暫未轉換。

### 2.4 Control sizes

按鈕與表單控件共用一套高度級（全部 4 的倍數），同尺寸的 input 與 button 對齊。高度一律走 `--control-h-*`，不寫死。

**2026-07-21（Q25）**：站上單行控件實際預設是 **`--control-h-sm`(36)**，不是刻度層標為 default 的 md(44)。此前 `.input` 靠 padding 撐開＝39px、`.btn` 是 36px，「同尺寸等高」只是文件宣稱；各元件各自調 padding 還長出 41.5／37.5／35.5 三種對不齊的搜尋框（盤點見 [docs/input高度盤點-2026-07-21.md](./docs/input高度盤點-2026-07-21.md)）。裁決後單行控件一律 `height: var(--control-h-sm)`，**新增控件禁止用 padding 湊高度**——`padding×2 + font-size×line-height` 幾乎必然算出小數。`.textarea` 例外（多行靠 padding ＋ `min-height:100px`）。

| Token | Height | Use |
|---|---|---|
| `--control-h-xs` | 28px | 表格密集列（`.variant-table .input`）／compact toolbar |
| `--control-h-sm` | **36px** | **單行控件實際預設（Q25）** — `.input` / `.select` / `.btn` / field-pill / tag-input / 各處搜尋框 |
| `--control-h-md` | 44px | 刻度層命名為 default，非站上實際預設；目前只有 `.btn--lg` 在這階 |
| `--control-h-lg` / `--control-h-xl` | 52px / 60px | **待採用**——唯一消費者是已於 2026-07-21 退場的 `.ztor-btn` 大尺寸變體；定義保留備用、目前無元件使用 |
| `--control-h-lg` | 52px | prominent CTA（**待採用**，見上方說明）|
| `--control-h-xl` | 60px | hero CTA (optional)（**待採用**，見上方說明）|

### 2.5 Elevation

E0–E4 海拔階梯（見 Pillar 1 §1.5）：一元件一階、互動借上一階、同層分隔不用陰影（用 hairline／surface 色階）、越高越大而淡。

| Rung | Token | Used for |
|---|---|---|
| E0 貼底 | `--shadow-hairline` | No lift — page / rails / table rows; hairline is an edge, not elevation |
| E1 微浮 | `--shadow-raise` / `-strong` | Buttons, inputs, segmented, switch knob |
| E2 卡片 | `--shadow-card` | Base selection-card, dropdown-item, table, composer, cookie-banner — surfaces this rung still applies to at rest. **Not** `.card` / `.kpi` / `.ztor-card` (Q3 2026-07-13), nor `.selection-card--icon` / `.radio-cards` (Q13 2026-07-16) — those default to 1px `--border`, no shadow |
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
| `--background` | `#FFFFFF` | `#0C0D0D` | white canvas (light) · content-level body bg (dark；與 `--surface-page` 同階＝最深；2026-07-17 midnight-v2 壓暗，原 `#191A1A`) |
| `--card` | `#FFFFFF` | `#212223` | 浮在 content 上的卡；2026-06-25 改實色（原 rgba .10 疊層）；2026-07-17 midnight-v2（原 `#303131`） |
| `--muted` | `#FAFAFA` | `#161718` | 嵌套襯底、比卡深比 content 亮一階；2026-06-25 改實色（原 rgba .06）；2026-07-17 midnight-v2（原 `#272828`） |
| `--surface-inverse` | `#000000` | `#000000` | footer slab。Dark 純黑（content 為 `#0C0D0D`，footer 要更深才讀為分隔） |
| `--surface-page` | `#FAFAFA` | `#0C0D0D` | route page＝content 底、**最深**。Light 於 2026-07-14 降低明度；**Dark（2026-07-17 midnight-v2）**：維持 r2.1 原制的層次語意——content 最深、比較淺的外殼(`--surface-shell`)包住、圓角內凹；整體比原 r2.1 壓暗（原 content `#191A1A`）。（註：midnight-v1 一度反轉成殼最深/content 較亮且兩者相近，經使用者回饋改回。） |
| `--surface-shell` | `#F0F0EE` | `#1C1D1E` | sidebar-mode app shell（rail＋canvas），**明顯亮於 content、與其拉開**（內凹視覺）。Light 於 2026-07-14 再降一階；Dark 於 2026-07-17 midnight-v2 壓暗（原 `#2B2B2C`），Mobbin Whop/Posh 參照 |
| `--sidebar` | `#FBFBFB` | `#1C1D1E` | sidebar rail 與 shell canvas 同色（flush）＝外殼色；項目區分靠 hover/active 疊色（2026-07-17 midnight-v2 壓暗，原 `#2B2B2C`） |
| `--foreground` | `#1A1A1A` | `#FDFDFD` | 2026-07-13 light 改 off-black（原 `#000000`） |
| `--foreground-muted` | `#4D4D4D` | `#B9B9B9` | 中階文字；2026-06-25 改實色（原 rgba .7 疊層） |
| `--muted-foreground` | `#6E6E68` | `#757575` | 2026-07-13 light 微暖（原 `#737373`）；dark 2026-06-25 改實色（原 rgba .4） |
| `--primary` | `#ffa33f` | `#ffa33f` | **orange stays** — paired across modes for brand consistency |
| `--border` | `#EAEAEA` | `#2C2D2E` | hairline · 2026-07-13 light 更淡（原 `#E5E5E5`）；dark 2026-06-25 實色化、2026-07-17 midnight-v2（原 `#3A3A3C`） |
| `--ring` | `#ffa33f` | `#ffa33f` | 亮暗同色：dark 於 2026-06-25 起不再覆寫成白、改繼承品牌橘 |
| `--status-success` | `#22C55E` | `#4ADE80` | pure-RGB green for dark（2026-07-13 體檢提亮，原 `#00A63E`） |
| `--destructive` | `#DA314A` | `#E7000B` | pure-RGB red for dark；破壞性操作（刪除鈕等），不用於狀態徽章 |
| `--status-error` | `#DA314A` | `#FF3D47` | 2026-07-21 新增：狀態徽章專用紅，暗色比 `--destructive` 亮（對齊 Figma 845:11071，深底小字徽章的 `#E7000B` 太深不易讀） |
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
| Badge / Status pill | 🟢 atom | ✓ App | Dashboard / Earnings / Payouts + category chips — flat soft-tag look (no dot/ring), variants orange / success / error / info / warning / accent (purple) / neutral。`--inline`：接在標題文字後的安靜限定詞（regular 字重、middle 對齊、左 6px），如訂單「Limit 2/person」「Awaiting pickup」（2026-07-21：E-Shop 清單的「N variants／限量」用法已移除，規格數與限量狀態改由 `__meta` 副標與 `__stock` 欄本身呈現，見下方 Product list Variants） | [badge.css](./ds-components/badge.css) |
| Status dot | 🟢 atom | ✓ App | Dashboard status / source dots | [badge.css](./ds-components/badge.css) |
| Chip | 🟢 atom | ✓ App | Earnings transactions filter, Tax year filter, supported regions。變體：`.chip--active` 品牌橘 tint（篩選已選，Q8-A 2026-07-27；原反白黑底作廢）／`--static` 唯讀／`--removable` 帶行內 ×／**`--value`（2026-07-21 新增）** 中性淡填（`--input-surface` 底＋`--foreground` 字＋`--border` 邊）＝創作者剛輸入的值，用於多選項選項值——這種 chip 是正在輸入的資料、不是被選中的篩選條件，不該反白搶視覺（使用者裁示，參照 Webflow Designer 的 class chip）。分工（2026-07-27 Q8-A 後）：`.chip--value` 灰＝剛建立的值、`.chip--active` 橘 tint＝已選（篩選已選與 tag-input 的已套用分類現在同一個外觀，Q19 的專屬覆寫已刪）。**新消費情境（2026-08-09）**：建立活動 `create-event.html` 的「加入商品」清單，已加入商品改用 `.chip-group` ＋ `.chip--removable`，價格併進 chip 文字、不另立一欄 | [chip.css](./ds-components/chip.css) |
| Switch | 🟢 atom | ✓ App | Settings notifications, E-Shop visibility, My IP marketplace, Earnings auto-payout. **`.switch--locked`（2026-08-09 從 `notification-matrix.css` 上收進本檔）**：合規／來源鎖定的停用態（`cursor:not-allowed`＋`opacity:.65`）。上收原因——這個修飾類原本只定義在 `notification-matrix.css`，但 `tier-settings.html`／`create-event.html` 都只連 `switch.css`、沒連那支檔，掛了 class 卻吃不到任何視覺，只剩 JS 擋點擊；三個消費頁（settings／tier-settings／create-event）現在都連 `switch.css`，鎖定態理當定義在這裡，不必為借兩行樣式多連一支不相干的元件檔。Consumers：settings.html（合規通道鎖定開啟）、tier-settings.html、create-event.html（bookyay 帶入鎖住「發布後直接開賣」開關） | [switch.css](./ds-components/switch.css) |
| Info banner | 🟢 atom | ✓ App | Contextual explanations (timing, region note, legal hint) | [info-banner.css](./ds-components/info-banner.css) |
| Upload tile | 🟢 atom | ✓ App | Create-flow upload slots（hero／thumbs／file drop，Add new item）；opt-in 互動上傳（`[data-upload]`＋`partials/upload-tile.js`）：選圖→假進度→hover 替換／刪除（站上標準 2 鈕，`data-upload-ai` opt-in 第三鈕 AI 優化）。**2026-08-07 新增 `.is-processing`**（`data-upload-processing` opt-in）：檔案傳完、伺服器還在轉檔／檢查的那一段，沿用上傳中的 frosted 浮層但不給進度條，`upload:change` 的 `filled` 維持 false，所以就緒檢查照舊算它未完成、送出被擋（作品上架流程 F1 的上傳與處理狀態、§8 檔案就緒）；事件同時新增 `detail.state` 讓消費頁講得出「現在是哪一段」。**2026-07-31：全站圖片槽收斂單一直式 750×1125**（`--upload-img-ratio`），舊 `--1x1`／`--3x4`／`--3x2` 退場、`--16x9` 僅存於檔案槽。`--hero` 圖示外加圓角晶片框（`--accent` 底＋1px `--border`＋`--radius-lg`，2026-07-17 Q18）。投放區底色 `--input-surface`（暗色比 section 卡亮一階＝填色投放區、亮色白卡，2026-07-18，對齊 midnight；原 transparent）。**2026-08-09 新增撐滿型素材列**：`.upload-assets--fill`（`--upload-asset-cols` 決定一排幾格、寬度平分容器、第五格換行同尺寸）＋容器層 `[data-upload-reveal]`（一次只露出一個空格，填滿才長出下一格），建立商品「展示它」由「主圖大格＋附圖 2×2」改為五格同尺寸 | [upload-tile.css](./ds-components/upload-tile.css) |
| Bundle editor | 🟠 molecule | ✓ Project | 共創回饋套組編輯器（2026-07-24 promote → 2026-07-28 第二代改版〔create-project「回饋套組」步驟〕→ 2026-07-30 抽成共用行為模組 `js/bundle-editor.js` → 2026-07-30 第二批：價格改唯讀自動計算＋新增套組優惠欄位 → **2026-07-30 第三批：優惠改百分比欄位，卡片欄位重排，撤除左緣未完成色線**）。`window.ZtorBundleEditor.mount({list,addBtn,t,getPool\|poolInput\|pool,getPerSlot\|perSlotInput\|perSlot,initial,collapsedByDefault,shares,onChange})`，回傳 `{getBundles,setBundles,add,ensure,render,refresh,isValid,listPrice,finalPrice,maxDiscount,maxPct,perSlot,maxUnits,autoUnits,committedSlots,pool,num}`；**2026-08-03（D166）新增 `shares` 選項**（布林，預設 `true`；預購掛載傳 `false`）——共創與預購的方案是同一件事，差別只在預購不含分潤，`shares:false` 時關掉五個地方：<br>分潤名額欄位（`cpp.bd.slots`）整格不渲染。<br>販售上限的「自動」不出現，只剩「不限量」（內部值 `unlimited`）／「限量」兩個由創作者自己決定的選項（共創的非限量內部值是 `auto`，兩型故意用不同字串，讓狀態自己說得出「這是推導出來的」還是「這是真的沒有上限」，所有判斷式一律寫成「是不是 `limited`」）。<br>自動上限指向名額池的說明不出現。<br>價格算式（`priceHintText()`）的名額段落消失，只剩商品加總。<br>`isValid()` 判準改為「有名稱 ＋（至少一件商品或至少一項有內容的權益）」（共創版是「有名稱 ＋（至少一件商品或名額數 > 0）」），因為預購沒有名額可以當對價，權益要能算數，否則純體驗方案（如「一場線上見面會」）永遠是無效卡；價格空狀態文案也換一組（`cpp.bd.qty.price.empty` vs `cpp.bd.price.calc.empty`）。其餘欄位（名稱、一句話說明、商品、額外權益、套組優惠、價格計算）兩型完全相同、共用同一批 `cpp.bd.*` key。規格出處：`documents/5.1.2.1-建立專案流程.md` §5.3.2 F28／F29、`decisions.md` D166。名額池與每名額單價各自三種注入方式（即時 getter／讀某 input／固定數字）讓同一支模組同時服務「會即時變動」（create-project 讀 `#fd-slots`／`#fd-perslot`）與「固定值」（project-detail，`fund.goal÷200` 推導名額池、每名額單價固定 $200，原型假資料）兩種頁面；`refresh()` 供外部注入值變動時就地重算全部卡片，不重畫、不搶焦點。**計價規則**：原價＝名額數×每名額單價＋商品定價加總。**2026-07-30 第三批：套組優惠改百分比欄位**（0–100%，沿用既有 `.amount-field--suffix.amount-field--readonly` 做法，非新造百分比欄樣式）——套組價＝原價－min(優惠%×原價, 商品定價加總)，折抵範圍仍只吃商品那一段，地板仍是股份總價（分潤名額的價值不可折讓）；上限同樣改以百分比表達：新函式 `maxPct()`＝floor(商品定價加總÷原價×100)。純回饋（0 名額）卡可折到 $0，只含名額無商品的卡 `maxPct()` 為 0、一分都不能折；填超過上限時優惠欄下方 `.field__hint` 轉紅（`.field__hint.fc-hint--over`）並說出實際生效的百分比與金額，不默默截掉。每張套組＝`.card.fc-bundle`：收合態 `.fc-bundle--collapsed` 顯示摘要列 `.fc-sum`（序號 `.fc-bundle__index`＋`__name`／`__meta`／`__price`，有優惠時原價劃線並列於前，`.fc-sum__was`）＋`.fc-bundle__actions`（編輯或收合／移除）；**2026-07-30 第三批展開態欄位重排（由輸入到結果）**＝套組名稱＊／一句話說明／含分潤名額＋販售上限 `.segmented`（自動＝從名額池推導可賣份數／限量＝手動硬上限，`.fc-slotnote`／`--over` 超賣提示）／商品用**引用**不用自由輸入——`.fc-pick`（`__results`／`__opt`／`__opt-price`／`__empty`）挑選既有 E-Shop 商品成 `.fc-ref`（`__thumb`／`__name`／`__meta`）／額外權益仍為自由文字 `.fc-perk`／最後才是獨立的**定價區塊**（新增 `.fc-pricing`，卡片最後，上緣一條分隔線）：優惠%（`.fc-pricing__row` 窄欄）＋價格（唯讀 `.amount-field--readonly`，`.fc-pricing__out`）＋橫跨整列的組成說明與上限說明（`.field__hint.fc-pricing__note`，兩行，取代已移除的 `.field__hint.fc-pricecalc`；與 `.fc-hint--over` 同樣寫成 0,2,0 權重，因為 field-system.css 在本檔之後載入）。滿版加高鈕：`.fc-add`（56px，新增套組）／`.fc-add-item`（48px，本代重用作「新增權益」）。**卡片左緣「未完成」色線已依使用者裁決移除**（`.fc-bundle--invalid` 與其 `border-color` transition 一併刪除，CSS 留墓碑；`isValid()` 判準不變——缺名稱、或無名額也無商品仍為無效，仍驅動建立頁教練提示與 Continue 擋關，只是卡片自己不再顯示那條色線；`--status-warning` 在本元件已無引用）。`.fc-bundle__body > .form-grid` 補回格線與下一欄位的間距（2026-07-30 新增）。消費頁（**2026-08-03 由 2 個增為 4 個**，D166 新增預購方案掛載點）：create-project.html（回饋套組步驟，共創）、create-project.html（預購方案步驟，`shares:false`）、project-detail.html（方案與承諾›支持方案，共創，`collapsedByDefault:true`＋3 張種子套組）、project-detail.html（方案與承諾›預購方案，`shares:false`，`collapsedByDefault:true`＋2 張種子方案）。**create-campaign.html 仍保留自己的第一代頁內 `.fc-*` 副本**（僅自由輸入商品列 `.fc-item-row`／`.fc-item-fields`，無收合／引用挑選器／權益／名額推導／計價），未遷移到本模組（治理待辦）。**2026-07-30 第五批（使用者裁決）**：展開態的價格移到標題列右上角——復用第三批已有的 `.fc-sum__tag`（「套組價」小標，展開態才顯示）＋放大的 `.fc-sum__val`（`--fs-20`），有折扣時原價劃線 `.fc-sum__was` 仍並列在前；收合態摘要價格不變。展開態的動作同輪從標題列移到卡片底部——`.fc-bundle__head` 展開時右上角只留價格；卡片底部新增 `.fc-collapse`（滿寬可點的收合把手，`<button>`＋`<i data-lucide="chevron-up" class="ztor-icon">`＋文字，上緣一條分隔線，`:hover`/`:focus-visible` 均已定義）與 `.fc-bundle__foot`（右對齊容器，內含 `.btn.btn--destructive.btn--sm` 移除鈕，僅卡片數 >1 時出現）；收合態動作仍留在標題列右側（編輯／移除文字連結，行為不變）。卡內間距同輪對齊建立商品頁 `.form-section--outlined` 的節奏（使用者指定參考對象）：`.fc-bundle` 內距由 `--sp-16`/`--sp-18` 改 `--sp-24`（`margin-bottom` 維持 `--sp-12`）；`.fc-bundle--collapsed` 左右內距同步改 `--sp-24`（收合↔展開時名稱不左右位移）；新增 `.fc-bundle__body .field__label { font-size: var(--fs-14) }` 與 `.field__label + .field__hint { margin-top: calc(-1 * var(--sp-4)) }`，欄位間距本身仍吃基礎 `.field` 16px（Q6 已統一全站，本輪未動）。**移除鈕用 `.btn--destructive`**（非 `.btn--ghost.btn--destructive`）——Q37 曾裁決為實色紅底，**2026-08-06 使用者裁示全站改紅框紅字**（見 Button 與 STYLE-DECISIONS Q37 的推翻紀錄），本元件不必改 markup、跟著 button.css 一起變。i18n 新增 3 key（中英）：`cpp.bd.collapse.long`／`cpp.bd.remove.long`／`cpp.bd.price.tag`；既有 `cpp.bd.collapse`／`cpp.bd.remove` 仍供收合態短連結使用。 **2026-08-06 適用票種改用商品那一列的形式**（使用者指示）：原本的一排勾選框（`.bd-tickets` 容器＋`.bd-ticket__name`／`__price`，已墓碑）換成 `.fc-ref` 引用列——這一塊回答的是「這組裡面有什麼」，商品用引用列、票券也是內容物之一，長成另一種樣子會讓人以為那是設定不是內容。勾選框留著（一組可賣給多種票的持有者，仍是複選）、移到列首與縮圖並排，勾到的列加一條左緣橘線（`.bd-ticket--on`）。還沒建立票種時放一列虛線佔位（`.fc-ref--placeholder`），把「這裡將來會有一張票」畫出來，而不是只留一句提示文字。同輪修掉封面圖的尺寸——上傳格要包在 `.upload-assets` 裡才有固定高，少了外層會沿著 `.field` 撐滿整列寬再依比例長到半個畫面高。**2026-08-04 新增活動變體的三個選配旗標**（使用者裁決「活動套組、募資套組、電子商店組合包是同一件事的三個變體」，所以不開第二支編輯器）：`work:false` 收掉「作品」本體與含作品份數（活動賣的是票＋商品，不是一份作品的份數）；`cover:true` 每張卡加一格封面圖（活動每一組賣的東西不同，卡與卡要靠圖分辨，走 Q40 的共用上傳格產生路徑）；`tickets` 收陣列或 getter，長出「適用票種」複選清單（`.bd-tickets`／`.bd-ticket`，勾選框用正典 `.zcheck`），有票種時 `isValid()` 要求至少勾一個——活動套組一定含一張票。**預購字彙（方案／預購者）改跟著 `work` 走、不跟 `shares`**：活動同樣 `shares:false`，套上預購講法會讓每個標籤都說錯話。三個旗標都不傳時行為與先前完全相同，募資兩個消費頁不受影響（已實測共創仍有名額、預購仍有作品與份數）。**電子商店組合包（`create-bundle.html`）仍是另一套實作**，尚未併進本模組（治理待辦）。 | [bundle-editor.css](./ds-components/bundle-editor.css) |
| Album tracks | 🟠 organism | ✓ App | 數位「音樂專輯（Album）」多曲目管理（spec 5.1.5.2 §4.2 F11.1）：上傳 mp3/mp4→逐曲列（`.album-track`：`__grip`/`__cover`/`__main`(`__name`/`__meta`/`__bar`/`__lyrics`)/`.dropdown.album-track__menu`）；拖曳重排、改名(inline)、換封面、上傳歌詞(音訊限定→View Lyrics)、刪除；上傳中 `.is-uploading`。`partials/album-tracks.js` 增強、emit `albumtracks:change`；逐列選單重用 dropdown-menu.css。**`data-album-seed`（JSON `[{name,meta,type?,lyrics?}]`）可預置已完成曲目列**（2026-07-16，供 product-detail 呈現既有專輯內容；建立頁不帶＝空狀態）。呈現層 demo（假上傳/歌詞） | [album-tracks.css](./ds-components/album-tracks.css) |
| VIP card | 🟠 organism | ✓ App | 數位「會員卡（Membership / VIP card）」卡面自訂（spec 5.1.5.2 §4.2 F11.2）：`.vip-card`[data-vip-card]＞`__settings`（`.segmented.radio-cards` Text/Image＋`.input`名稱／`.upload-tile` logo）＋`__preview`（`__frame`公版場景＞`__plate`霧面卡＞`__logo`/`__logo-img`/`__plate-sub`）。Text→文字合成、Image→PNG logo 合成；`.vip-card--image` 切模式。`partials/vip-card.js` 綁定、emit `vipcard:change`。公版為 CSS 近似固定藝術（frame 漸層裸色＝記錄在案例外，見下）。呈現層 demo | [vip-card.css](./ds-components/vip-card.css) |
| Input | 🟢 atom | ✓ App | Wizard fields, settings forms, search。底色用 `--input-surface`（亮＝白卡、暗＝比卡亮一階＝filled 欄位浮出卡面，2026-07-17 Q19）；1px 陰影模擬邊 `--border`、focus 4px 橘環 | [input.css](./ds-components/input.css) |
| Icon | 🟢 atom | ✓ App | Every glyph — buttons, nav, alerts, data rows (full Tabler set in `icons-all.js`; 139 curated, rest registered) | [icon.css](./ds-components/icon.css) · [icons.js](./icons.js) · [icons-all.js](./icons-all.js) |
| NavigationMenu | 🟡 molecule | ✓ App | Nav item + mega dropdowns (IP Bank / E-Shop); sidebar mode renders these as expandable `.app-sidebar__group`（accordion，現役）。另有 **section-label 變體**（`.app-sidebar__section-label` ＋子項平鋪）保留在 CSS、可切回 | [header.css](./ds-components/header.css) |
| Card | 🟡 molecule | ✓ App | Section wrappers w/ head row across all product pages。圓角 `--radius-xl`（16px，Q16 2026-07-17；原 6px）。邊界 2026-07-26 由 1px 邊框改陰影浮起（Q23 決 C） | [card.css](./ds-components/card.css) |
| KPI | 🟡 molecule | ✓ App | Dashboard summary, Earnings tabs, page KPI rows (headline metric set in display size, not colour)。變體：`--compact`（去 min-height、內距收小，側欄/摘要用，如商品細節頁 Sales summary）／`--tappable`（整塊是 `<button>`、開 in-place popup）／狀態染色 `--success`｜`--warning`｜`--destructive`（染 `.kpi__value`＝這個數字的**狀態**好不好）／**`--hero`（2026-07-27 新增）** 整張卡實色橘 `--primary`＝這張卡是本頁**主角**（編輯權重，與狀態不同軸）。**一列只給一個 `--hero`**，否則沒有主角。與 Q8-A 的「已選中」不衝突：已選中是 **tint**（14% 半透明）且只出現在 pill／nav 小控件；`--hero` 是**實色**且是一整張卡，而實色橘在本系統一直代表「主角／主要動作」（主 CTA、`.pager` 目前頁），語彙一致。卡內文字一律 `--on-primary` 深墨（**不是 `--primary-foreground`**——後者亮色是白字，白對 `#ffa33f` 只有 1.99:1；深墨 9.02:1）；label/meta 用同一支深墨壓透明度做層級（6.33:1／6.85:1），不另挑灰（灰在橘底會發濁）。`.kpi__delta` 在 `--hero` 內＝**深綠半透明底＋白字**（形狀語彙不動：一樣的 pill、一樣的內距、一樣是半透明染色，改的是染多深與字色）。理由：12% 淡染疊在飽和橘上色相幾乎不位移（合成 `#e9aa47` vs 卡的 `#ffa33f`），綠撐不起來、只能靠墨色暗示；改成深綠底之後「綠」由**底本身**承載，字換白，識別與對比同時變強。**仍然半透明**（90% 而非 100%），讓橘透 10% 上來把綠暖化一點，像長在這張卡上而不是貼上去的色塊——這也是它與先前被否決的「純黑底」的本質差異：那是中性黑、讀起來就是黑斑，這是**有色相的深綠**，一眼還是綠的。實作是在 `.kpi--hero` 這一層重新定義 fill／ink 四個 token（`--status-success-fill`／`-ink`／`--destructive-fill`／`-ink`），custom property 往下繼承，亮暗兩主題同時成立、不必比特異性。**墨色跟著「坐在什麼面上」走，不是跟著主題走**——實色橘卡在深色主題下依然是亮底，主題型 token 解不了它。選擇器寫 `.kpi.kpi--hero`（0,2,0）以贏過 `.card .kpi` 巢狀底色覆寫。首用：儀表板總收入（`js/components.js` `kpiTile()` 的 `hero: true`）。圓角 `--radius-xl`（16px，Q16 2026-07-17）。`.kpi[hidden]` 已顯式歸零 display（元件為 flex，會蓋過 UA 對 hidden 的預設；2026-07-30 補上——在此之前凡靠 `el.hidden` 收 KPI 的地方都藏不掉，例如活動詳情依活動類型收起不適用的指標） | [kpi.css](./ds-components/kpi.css) |
| Admin IP Bank table | 🟠 organism | ✓ SiteSpecific | Admin IP Bank 與 Reporting 的 Film／Owner 分配表與報表篩選列；共用 token-driven table wrapper、owner identity 與日期範圍操作列。**2026-07-31 使用者：`.admin-table__thumb` 改直式**——原 36×36 正方，改「鎖高算寬」：`height:36px`／`width:calc(36px * var(--img-portrait))`（≈29px，29×36），與 `.ztor-table__thumb` 同一個推導邏輯 | [admin-ip-bank-table.css](./ds-components/admin-ip-bank-table.css) |
| Alert | 🟡 molecule | ✓ App | Dashboard alerts panel (`--card`) + inline page warnings (`--row`) + page announcement (`--banner`) + notification bar (`--bar` — rounded + shadow, flush in E-Shop low-stock F2) | [alert.css](./ds-components/alert.css) |
| Accordion | 🟡 molecule | ✓ App | Collapsible sections (chevron-rotate, height transition) | [accordion.css](./ds-components/accordion.css) |
| Tabs | 🟡 molecule | ✓ App | Earnings 4 tabs, E-Shop product types (`--brand` soft-orange pill; type-switch row uses `--underline-short` for the divider-off, shortened active underline), Projects status, Fans CRM views | [tabs.css](./ds-components/tabs.css) |
| Filter tabs | 🟡 molecule | ✓ App | Secondary status filter pills with live counts, row below the primary tabs (E-Shop F3). Base = grey-muted active (orders, auction-detail); `.filter-tabs--brand` = soft-orange active + orange/bubble-less counts (E-Shop, paired with underline type tabs); `.filter-tabs--source` = active pill tinted with the item's own `--dot` colour + optional `.filter-tabs__dot` leading dot, colourless items fall back to `--primary` (Earnings F5 revenue-source filter, colour shared with chart line + source list) | [filter-tabs.css](./ds-components/filter-tabs.css) |
| ~~Cookie banner~~ | — | **已退場 2026-08-03** | 從未被任何產品頁消費（零消費連續被 check 11 標記），使用者裁示「沒用就刪」。樣式已移除、檔案保留為墓碑；DS 頁的 demo 與 TOC 一併撤除。之後真要做同意橫條請重寫，不要復活舊實作 | [cookie-banner.css](./ds-components/cookie-banner.css)（tombstone）|
| Empty stub | 🟡 molecule | ✓ App | Routes not yet built (orange mark + display title + spec refs) | [empty-stub.css](./ds-components/empty-stub.css) |
| Selection card | 🟡 molecule | ✓ App | Wizard radio cards (3 wizards) + Settings theme picker + display-mode picker。`.selection-card--icon` 型別磚 2026-07-17 縮小（icon 晶片 42→36、內 icon 28→24、內距 22→`--sp-14`、gap→`--sp-8`，較 Figma 781-4166 更緊；Q18）。型別磚底色 `--input-surface`（暗色比 section 卡亮一階＝浮出的填色選項、亮色白卡，2026-07-18，對齊 midnight）；已選 icon 卡除橘 outline 外加淡橘底 `color-mix(--primary 5%, --input-surface)`（2026-07-18 Q19，對齊 midnight；icon 維持中性、無勾） | [selection-card.css](./ds-components/selection-card.css) |
| Composer | 🟡 molecule | ✓ App | Drop / type card + bottom action bar (tool icons · credit meter · circular send) | [composer.css](./ds-components/composer.css) |
| Dropdown menu | 🟡 molecule | ✓ App | Action menu (details/summary); trigger = any Button — primary "＋ New" or a `btn--icon` kebab (E-Shop product-row actions). Items `<a>` (navigate) or `<button>` (run JS); outside-click / select-to-close needs page JS。變體：`--toggle`（選單內開關列＝menuitemcheckbox，左短標籤＋右 switch，配 data-keep-open；E-Shop 列「在商店上架」）／`--choice`（值列＝menuitemcheckbox，領頭放 tier `.badge`、已選態靠尾端 `.dropdown__check` 不用底色；2026-07-29）／`--danger`（破壞性動作紅字 ghost，如草稿列「刪除」）。面板變體 `.dropdown__menu--ladder`（2026-07-31，E-Shop 粉絲分級門檻）：把一組 `--choice` 當一道階梯，已選列左緣加 2px `--selected-ink` 直線畫出「從頂端連續的一段」，配 `.dropdown__item--preview`（hover 預告，40% 透明 check）、`.dropdown__cap`（選單抬頭小字，非選項不可點）與 `.dropdown__meta`（值列尾端次要資訊，`margin-left:auto` 靠右、`tabular-nums`，用於分級選單的累計人數「988 人」＝門檻設在這一級有多少人買得到，資料來自 `js/tier-population.js`）；點一級＝門檻設在那一級、該級與其上自動包含，互動由頁面 JS 負責。**每個選項前面都要有對應 `.ztor-icon`（2026-07-21 使用者裁示），唯一例外是 `--toggle` 與 `--choice` 那兩種值列**——全站 7 個消費頁全數補齊 | [dropdown-menu.css](./ds-components/dropdown-menu.css) |
| Header (topbar) | 🟠 organism | ✓ App | All pages — canonical 64px app topbar (`.app-topbar`, injected by `sidebar.js`); hover mega-dropdown nav + action cluster. **≤900px：導覽收進 burger**（`.app-nav-burger`，2026-07-25）——兩種 shell（topbar／sidebar rail）在窄螢幕都只留 logo＋burger，展開為滿版直向面板（max 60vh 可捲）；開啟狀態＝shell 根元素的 `[data-nav-open]`（由 `js/sidebar.js` 切換，回到 >900px 自動清除）；topbar 面板內的 hover mega-dropdown 改為 inline 常開（觸控無 hover） | [header.css](./ds-components/header.css) |
| Global nav · sidebar mode | 🟠 organism | ✓ App | Display-mode alternative to the topbar (spec §6.9 / D016): 248px left rail (`.app-sidebar`, same `sidebar.js`) sits on `--surface-shell`; dropdowns → expandable groups（`.app-sidebar__group`，accordion，現役）。另保留 **section-label 變體**（`.app-sidebar__section-label` ＋子項平鋪）可切回。Driven by `data-nav-mode` (theme.js) | [shared.css](./shared.css) · [sidebar.js](./sidebar.js) |
| Admin-layer nav · Tier 0/1 | 🟠 organism | ✓ App | Platform-operator (Admin) variant of the topbar (spec §4.1 / D086): roster page shows a "Creator Management" marker + locked Tier-1 items (`.app-topbar__link--locked`); inside a creator workspace, a back-to-roster icon (`.app-topbar__back`) sits **before** the logo + "Managing &lt;creator&gt;" chip (`.app-topbar__context`). Active creator held in `window.ztorCreator` (localStorage `ztor.activeCreator`); switched via devtools "Creator · Admin" cheat code. Used by `creators.html` (Tier 0) and every Tier-1 page | [shared.css](./shared.css) · [sidebar.js](./sidebar.js) |
| ~~Footer~~ | — | **已退場 2026-08-03** | 同上：7 個 class 零消費，`index.html`／`creators.html` 只掛了 `<link>`、沒有對應 markup。連帶 `--border-inverse` 失去唯一消費者 | [footer.css](./ds-components/footer.css)（tombstone）|
| Data list | 🟠 organism | ✓ App | Recent earnings, transactions, payouts, products, projects (row-divider)。列圖示晶片 `__icon` 2026-07-20 三度修正後併入與 `.product-list__thumb` 同一組標準（52×52／`--muted` 底／1px `--border-soft`／icon 色 `--muted-foreground`），取消與 `.alert--card .alert__icon` 的尺寸家族關係（Q20）。註：`.project-list__icon` 曾同屬此家族，2026-07-24 project-list 改真圖縮圖後退出、不再是成員。**`.data-list__icon--sm`（2026-07-25 新增）**＝32px 小晶片（與同列 `.btn--icon.btn--sm` 等高）＋16px 圖示，用於「圖示是記號（＋／−／＝）而非內容縮圖」的列；52px 預設在那裡會讀成過大的框。**`.data-list__row--child`（2026-07-25 新增）**＝小計列展開後的明細子列：縮排由 `--data-list-child-indent` 控制（預設 64px＝對齊父列 52px icon＋12px gap；父列改用 `--sm` 圖示時容器覆寫，如 `.pd-deep` 用 44px）、無 icon、`--fs-13`／`--foreground-muted`、去下框線與父列連成一組，下一個非子列補回上框線；取代各頁 inline `padding-left:12px` 的散裝寫法。消費者：專案詳情 › 我的收益 › 計畫項目收益（收入／支出小計展開） | [data-list.css](./ds-components/data-list.css) |
| Avatar stack | 🟡 molecule | ✓ App | 重疊頭像＋可選 `+N` 更多膠囊（`.avatar-stack` ＞ `__item`*／`__more`），28px 圓、`--card` 分隔環、`--muted`／`--accent` 填。用於共創方案的支持者數、合作者列等「誰參與了」提示；`__more` 讀作計數不作人。Evidence／使用頁：project-detail（共創金流分頁） | [avatar-stack.css](./ds-components/avatar-stack.css) |
| Drawer | 🟠 organism | ✓ App | 右側滑出面板（`.drawer` 殼＋`.is-open` 開關 ＞ `__scrim`／`__panel` ＞ `__head`(`__title`/`__close`)／`__body`），用於不離開當前頁看詳情／歷史／說明；scrim/Esc/關閉鈕皆關，尊重減動效偏好。Token `--card`／`--border`／`--overlay-tint`／`--overlay-blur`／`--shadow-overlay`。Evidence／使用頁：earnings-sony（提領歷史／如何運作，由 `partials/finance-overview.js` 以 `data-drawer-*` 掛勾控制）。**2026-07-24 起 project-detail 不再使用 drawer**——該頁五個編輯／新增流程改用中央彈窗殼 `.payout-modal`／`.payout-dialog`（使用者裁示：編輯與新增一律走中央彈窗，不用側邊滑出） | [drawer.css](./ds-components/drawer.css) |
| Pager | 🟡 molecule | ✓ App | 數字分頁列（`.pager` 容器＋`.btn.btn--ghost.btn--sm` 頁碼，目前頁 `aria-current="page"` 實色底＋`.pager__ellipsis`）。頁碼沿用 Button 元件、不另造控件。Token `--primary`／`--primary-foreground`／`--muted-foreground`／`--sp-*`。Evidence／使用頁：earnings-sony（項目表／提領歷史，由 `partials/finance-overview.js` 依筆數渲染） | [pager.css](./ds-components/pager.css) |
| Picker | 🟠 organism | ✓ App | Search + scrollable pick-list（Create bundle items、IP linker） | [picker.css](./ds-components/picker.css) |
| Field pill | 🟡 molecule | ✓ App | Inline filter pill — search / select / dropdown-trigger | [field-pill.css](./ds-components/field-pill.css) |
| Search (collapsible) | 🟡 molecule | ✓ App | 收合於工具列的搜尋：平常只見放大鏡、點擊滑開成 field-pill（重用 field-pill、不重造輸入）；`.is-open` 由頁面切換、支援 reduced-motion。E-Shop F3 | [search-collapse.css](./ds-components/search-collapse.css) |
| Search collapse | 🟡 molecule | ✓ App | 工具列收合式搜尋（電子商店 F3）：收合只見放大鏡、`.is-open` 滑開成 `.field-pill`（內層重用 field-pill）；`.search-collapse__toggle`/`__field`/`__close`；開合由頁面 JS 切換、respects reduced-motion | [search-collapse.css](./ds-components/search-collapse.css) |
| List toolbar | 🟠 organism | ✓ App | 清單頁頭的兩層控制骨架：`.list-toolbar` 殼層工作列（實色 `--surface-shell`、四角 16px、固定 58px 高，左放主軸 tabs、右放 `.list-toolbar__actions` 動作群）＋ 殼層左右內距刻意不對稱——左 `--sp-8`、右 `--sp-20`（2026-07-26 使用者：建立鈕旁邊太擠）：第一個 tab 自己還有 14px 內距，左側視覺留白其實是 22px，右側動作群沒有內距，8px 會貼著邊。**右側主 CTA 一律用 `.btn.btn--primary` 基礎尺寸（36px／13px），不要加 `btn--sm`**——projects 原本掛了 `--sm` 變 28px，與 e-shop／my-ip／events 不一致，2026-07-26 修齊。`.list-status-row` 次層篩選列（透明、放 pill 篩選或 select；到清單的間距 `margin-bottom` 2026-07-26 依使用者指示由 24px 加大到 40px，訂單／取貨兩頁的頁內同構列 `.ord-list-controls`／`.pk-list-controls` 同步），`--end` 變體把篩選推到右側（projects 兩個下拉用）。2026-07-23 由 e-shop 頁內 `.eshop-list-topbar` promote（projects 為第二個消費者）；sticky 貼頂屬各頁捲動容器決定，留在頁面 `<style>`。詳見 §4.90。Evidence／使用頁：e-shop、projects | [list-toolbar.css](./ds-components/list-toolbar.css) **Snap dock 的骨架要求（2026-08-01 放寬）**：`.list-dock` 內只有 `.list-toolbar` 是必要的，`.list-status-row` 選配——站上出現了第二種骨架（只有分頁、沒有次層篩選的工作列，首例 `earnings-sony.html` 的總覽／版稅），原本兩排俱全才生效，那種頁面只能各自手刻一份貼頂樣式＝同一視覺角色兩種做法。**貼頂時通知條讓位**：`.main:has(.list-dock.is-snapped) .alert-inset` 解除 sticky，讓它隨頁面捲走；沒有這條時 dock 貼在 `top:0`、通知條貼在 `top:16`，兩者高度不同，通知條下緣會從 dock 底下探出約 15px（e-shop 舊有現象，一併修掉）。 |
| Segmented | 🟡 molecule | ✓ App | 2/3-way text toggle, white-raised active；`--icon` 變體為純圖示段（2026-07-23 接收退場的 `.view-switch`，清單／卡片檢視切換） | [segmented.css](./ds-components/segmented.css) |
| Amount field | 🟡 molecule | ✓ App | money input with a unit affix — normally a static read-only symbol (`$` prefix); built on Input. The affix can also be an interactive unit toggle (`[data-price-sync]` marks a shared-unit member and fixes the affix to a 46px centered column; `[data-amount-unit]` is the click hook on the affix `<button>` that page JS uses to switch the unit across the group); that toggle shipped for the cash/POPCORN pricing unit, **removed in spec 5.1.5.2 · D144** (was D127), so no page uses it today — the chrome is kept as a reusable capability。**Suffix mode**（2026-07-11）：`.amount-field--suffix` 把 `__unit` 移到右側（如 `50 [%]`、`6 [mo]`），搭 `--readonly` 給靜態非互動後綴（register-ip.html 版稅 % / 最短租期、bundle-detail.html 折扣 %）；input 內距改讓右邊。**Hero size**：`.amount-field--hero` 是彈窗主角級大尺寸（70px 高／32px display 字），視覺基準原 `payout-modal.css` 的 `.payout-amount-wrap`／`.payout-amount-prefix`／`.input.payout-amount-input`；2026-07-11 起 `partials/payout-request-modal.js` 已改用本變體，`payout-modal.css` 的舊規則已移除（留 tombstone 註解指回本檔）；`height:70px`／`padding-left:42px` 無對應 `--sp-N` 級距，記錄為 token 例外，其餘值皆走 token（`--fs-28`/`--fs-32`/`--sp-16`）。**Currency code**（2026-08-06）：`.amount-field--code` 把輸入框左內距由 40px 加寬到 62px，給三個字母的幣別代碼（NTD／HKD）用——代碼剛好填滿 `--readonly` 的 40px 內距，數字會貼著代碼起排，加寬一個字距才分得開；搭 `--readonly` 使用（幣別代碼不是可切換的單位）。代碼字串**不寫死在元件也不寫死在消費頁**，由消費頁在執行期取自該頁本來就在顯示的幣別（首個消費者：`earnings-sony.html` 捐贈彈窗，取自可提領金額那一格 `[data-fin-kpi="available"]`） | [amount-field.css](./ds-components/amount-field.css) |
| Review row | 🟡 molecule | ✓ App | 流程 Review 步驟摘要列（無卡片、hairline 分隔）：欄位名＋值＋右側 Edit →。正規化自 create-event.html `.ce-review-row`、register-ip.html `.ri-summary`、create-project.html Review 步驟的扁平化 `.card`（該頁 2026-06-25 註解已預告「這批歸第三批 review-row」）。詳見 §4.49 | [review-row.css](./ds-components/review-row.css) |
| Preview card | 🟡 molecule | ✓ App | 粉絲端即時預覽卡（商品／拍賣，§5.2.5） | [preview-card.css](./ds-components/preview-card.css) |
| Preview column | 🟡 molecule | ✓ Project | 建立流程「表單｜預覽」兩欄版面＋右側 sticky 預覽欄。**`.preview-split--narrow`（2026-08-10 使用者指示）**：右欄由 320px／間距 40 收成 **264px／間距 24**，數值直接取自建立活動在用的 `.wizard-split--narrow`——兩個建立流程並排看時右欄本來一寬一窄，收斂成同一組數字、不另立第三種寬度。首個消費頁＝create-product；其餘消費頁維持預設寬度（標題＋灰副標＋Preview card）；取代滑出式 Preview panel。**卡邊界 2026-07-21**：`.preview-col .card` 與 `.preview-col .preview-card` 改 `border:0` ＋ `--shadow-card, --shadow-edge-top`，與左欄 `form-section--outlined`（Q14／Q18 已去邊框改浮起）一致——原本左欄無邊框、右欄 1px 邊框，同一畫面兩種卡邊界（使用者裁示）。scope 限 `.preview-col` 內，全站其他 `.card` 仍照 Q3 用 1px 邊框、未推翻 Q3。消費頁＝create-product／create-bundle／create-auction（各 2 個盒子）＋create-campaign（僅預覽卡），4 頁共 7 處 | [preview-column.css](./ds-components/preview-column.css) |
| Preview panel | 🟠 organism | ✓ App | 右側畫面分割面板承載即時預覽——壓窄 wizard、非浮層（§5.2.5） | [preview-panel.css](./ds-components/preview-panel.css) |
| Fan store preview | 🟠 organism | ✓ App | See-as-fan 內的粉絲端店面（E-Shop F5＋商店設定 F1 共用 `partials/fan-store.js`，§6.7 同源），**2026-07-02 改呈現為深色手機**（`.fan-store__phone`＞`__screen` 自捲動；版型參考 endgame creator 商店手機版，僅視覺證據）：app 頂列＋hero（名字壓深色漸層＋社群＋加入社群）＋sticky app 分頁列＋本月精選＋商品/組合/拍賣底線子分頁＋雙欄商品格（購物車圓鈕）＋頭號粉絲＋關於＋sticky 底部 app 導航。螢幕＝fan app 固定深色面（scoped `--fst-*`，主題例外見 §1.5；accent＝`var(--primary)`）。追蹤數/社群/加入社群/精選/立即購買/補貨中/app 分頁列/頭號粉絲/關於/購物車/底部導航為提案欄位（ASSUMPTIONS UIA-026）。**2026-07-31 使用者：兩個展示圖框改直式 `--img-portrait`**——`.fan-store__featured-media`（本月精選大圖，原 4:3）與 `.fan-store__thumb`（雙欄商品格，原 1:1；手機雙欄下單格約 140px 寬→174px 高，仍一屏兩排）；兩者皆由同一張直式原圖置中裁切填滿 | [fan-store.css](./ds-components/fan-store.css) |
| Pickup management | 🟠 organism | SiteSpecific | 現場 QR 核銷工作區（spec 5.1.5.11 · D111），E-Shop 下與訂單管理並列。**場次詳情第一屏＝沿用 product-detail 的骨架**（2026-08-01，使用者裁決「以 E-Shop／建立商品用到的設計為主」）：分區卡＝`.form-section.form-section--outlined`、兩欄＝`.form-grid`、區段標題＝`.form-section__head`＋`__title`、大數字＝`.bento` 內的 `.kpi.kpi--compact`（`__label`/`__value`/`__meta`）、鍵值摘要＝`.kv`、地點時間＝既有 `.pickup-detail__meta` 加新的 `--stack` 直排變體。**`.pickup-board` 只補那套沒有的三件事**：欄間 1px `--border` 分隔線（`.form-grid` 只給欄不給界線，≤860px 轉上緣線＋堆疊）、`__stage`（隨場次狀態換的那一段，下緣 `--border-soft` 與交付列分開）、`__bar`＋`__pct`（量條與百分比同列，量條吃 `.stock-bar`，百分比是註腳小字＋`tabular-nums`）；另有 `__acts` 收尾動作列。分工固定——左欄＝領取的活動與物品，右欄＝工作人員操作取貨要知道的。**`.scanner-hand`**（同日 promote）＝唯讀「欄名＋值＋複製」的一列（`__row`/`__k` 固定寬對齊＋圖示複製鍵，`code.is-unset` 表示未設密碼）；**值的外觀與 `.scanner-access__url code` 共用同一條規則**，不另定義第二套，只負責唸出去與複製；重設網址／停用／改密碼已移進建立編輯彈窗。**`.pickup-roster`** ＝名單表格的密度調整，框型與表頭色階一律吃 `.ztor-table`（Q29／Q41），只收窄內距並定義 `__num`（右對齊等寬）/`__none`（—）/`__act`。`.scanner-access`（F6 完整設定卡：`__qr`/`__main`/`__label`/`__url`/`__actions`/`__pw`）＋`.qr-box`(`--lg`/`--disabled`，faux QR via `window.ztorFauxQr()`) 保留給獨立 scanner 頁。另有 `.pickup-detail__header`/`__meta`、`.pickup-stats`、`.pickup-select`＞`.pickup-select__row`(`.is-checked`·`__box`/`__img`/`__text`)。共用建立場次 popup＝`partials/pickup-session-modal.js`（F3，亦掛 create-product.html／product-detail.html）：**2026-08-01 由三頁籤改為兩步流程**（`.pks-step`＋`.pks-step__intro`，`[data-pks-form]` 保 `min-height` 免兩步高度落差）——step 1「這場是什麼」含選填掃碼密碼與（編輯時才有的）掃碼網址重設／停用，step 2「可以領什麼」；刻意不放 stepper，位置由 dialog 副標與上一步／下一步表達。result step（QR＋URL）撤除，建立成功由 `hooks.onCreate` 落地到場次詳情頁。場次清單／可核銷項目／核銷紀錄重用 `.data-list`；核銷紀錄改開 `.payout-dialog` popup。camera 視窗用 `--surface-inverse` role token、無裸色 | [pickup.css](./ds-components/pickup.css) |
| Mobile scanner | 🟠 organism | SiteSpecific | 獨立手機 scanner（spec 5.1.5.11 F7 · D111）——獨立 URL、無主工作台導航。`.scanner-page`＞`.scanner-frame`＞`.scanner-top`＋`.scanner-screen`（`.scanner-pw` 密碼閘／`.scanner-cam`(`__reticle`/`__line` 掃描動畫，respects `prefers-reduced-motion`)／`.scanner-result`(`__banner --ok/--warn/--bad`/`__rows`)）＋`.scanner-foot`。相機視窗＝`--surface-inverse` role token（theme-independent、非裸色）。`scanner.html` inline controller | [scanner.css](./ds-components/scanner.css) |
| Auth shell | 🟠 organism | SiteSpecific | 未登入層的置中表單殼（spec 5.1.10 · D170）——站上第二個無工作台導航的整頁殼，**無卡片**（2026-08-04 使用者裁示，比照 ztor 消費端登入頁）。`.auth-page`（`--background` 底、整頁置中）＞`.auth-shell`（純內容欄：max 420 ＋ `--sp-24` 垂直節奏，無底色／邊框／陰影／圓角）＞`.auth-brand`（wordmark ＋ Creator Studio 兩行，絕對定位左上角）＋`.auth-shell`＞多個 `.auth-step[data-auth-step]`（`[hidden]` 互切）；step 內＝`.auth-intro`(`.auth-head`＞`.auth-head__back`＋`.auth-title`／`.auth-sub`)、`.auth-pw`(`__toggle` 顯示隱藏)、`.auth-inline`(`--lead` 國碼在前)、`.auth-actions`（主要行動滿寬）、`.auth-foot`、`.auth-link`。六個登入方式（電子郵件／手機號碼／Apple／Google／Facebook／LINE）同一種卡、同一個 `.radio-cards--gate` 的 2 欄 grid（2026-08-04 使用者裁示），錯誤列重用 `.alert--row.alert--error`，本檔不另造 | [auth.css](./ds-components/auth.css) |
| Ticket preview | 🟡 molecule | ✓ App | 粉絲收到的那張票的即時預覽（建立活動步驟 5 票券銷售 › 票券設計的右軌）：識別半張（時間／票名或 logo／票種）＋撕線＋QR 半張。票面是永遠深色的物件，字色走 `--foreground-on-inverse(-muted)`，缺口用 `--surface-page` 遮邊；QR 沿用 `.qr-box` 與 `window.ztorFauxQr()`。詳見 §4.116 | [ticket-preview.css](./ds-components/ticket-preview.css) |
| Session list | 🟡 molecule | ✓ App | 系列場次清單（建立活動 › 場地與時間，2026-08-06）：一活動辦好幾場時逐場列出日期與場地。第 1 場是上面主欄位的**唯讀鏡像**（`__row--main` ＋ `__text`），第 2 場起才是這份清單自己的資料（`.input` 兩欄）；`__no` 固定寬序號讓多列欄位左緣對齊，`__end` 固定寬尾欄讓「有移除鈕」與「有徽章」兩種列的右緣也對齊。**2026-08-09 新增 `__head`（欄位標題列）與 `--detailed`（多欄變體，`create-event.html` 場次清單改用，含 `[data-multi]` 兩種欄寬與窄螢幕收合）**。詳見 §4.117 | [session-list.css](./ds-components/session-list.css) |
| Review status | 🟡 molecule | ✓ App | 送審件的狀態面板（2026-08-07，spec 5.1.0.4 F5／5.1.2.2 §2.2.9）：狀態徽章＋唯讀事實（送出時間／送出次數／審核者）＋退件理由（`__note`，`--rejected`／`--approved` 只改左側色條）＋動作列（只在真的有事可做時出現）。審核的兩端共用同一支——創作者在項目頁看結果、審核者在審核頁看同一塊；狀態字彙由 `js/work-review-store.js` 提供，元件不自帶。詳見 §4.119 | [review-status.css](./ds-components/review-status.css) |
| Ticket tier card | 🟡 molecule | ✓ App | 建立活動的票種卡（spec 5.1.6.1 F9）：收合態＝卡標＋⋮（複製／移除）＋唯讀價格／數量＋整寬 Edit，編輯態＝名稱／價格／數量三欄直排＋每欄清空 ✕＋卡底 Remove／Cancel／Save；`.tier-grid` 網格（無 List／Grid 切換；**2026-08-06 起固定三欄**，1100/720px 降級）、`.tier-toolbar` 批次編輯、`.tier-count`（`--over` 超過容量轉紅）。自訂規則開關 **2026-08-06 由卡內 switch 列改成標題列靠右的 `.tier-card__ownbtn` 按鈕**（`aria-pressed`，開啟態橘框橘字）。卡體吃 `.card`、不重畫。詳見 §4.114 | [ticket-tier-card.css](./ds-components/ticket-tier-card.css) |
| Readiness card | 🟡 molecule | ✓ App | 上架前就緒檢查＋還差幾項 banner。footer 變體：`__chip`（貼 footer 主動作的就緒指示 chip，`--ready` 轉綠）＋`__pop`（hover/focus 浮出完整 readiness 卡當 tooltip）；create-product／create-auction／publish-work footer 用（publish-work 只在最後一步顯示，因為送出只發生在那一步；create-campaign 另有自身 pill 變體，待後續收斂） | [readiness.css](./ds-components/readiness.css) |
| Empty card | 🟡 molecule | ✓ App | 卡片內「已載入但無資料」空狀態 | [empty-card.css](./ds-components/empty-card.css) |
| Notification matrix | 🟠 organism | ✓ App | 事件×管道逐格開關矩陣（含鎖定通道） | [notification-matrix.css](./ds-components/notification-matrix.css) |
| Completeness meter | 🟡 molecule | ✓ App | label＋x/y＋進度條（素材包完整度） | [completeness.css](./ds-components/completeness.css) |
| Insight row | 🟡 molecule | ✓ App | 圖表下單行自動洞察（無洞察隱藏） | [insight-row.css](./ds-components/insight-row.css) |
| Finding card | 🟠 organism | ✓ App | 一則帶著支撐數字的結論（結論＋數字＋依據＋追查入口） | [finding-card.css](./ds-components/finding-card.css) |
| Source status | 🟠 organism | ✓ App | 不占版位的資料涵蓋指示＋來源明細面板 | [source-status.css](./ds-components/source-status.css) |
| List footer | 🟡 molecule | ✓ App | 清單分頁頁尾（Showing N of M＋Load more）。變體：`--center`（Load more 置中＋加大上下留白，E-Shop F4 分批載入）。`[hidden]` 已顯式歸零（蓋 display:flex） | [list-footer.css](./ds-components/list-footer.css) |
| Message composer | 🟠 organism | ✓ App | 群發撰寫 modal（Compose＋History） | [message-modal.css](./ds-components/message-modal.css) |
| Char counter | 🟡 molecule | ✓ App | 限長輸入即時字數 | [message-modal.css](./ds-components/message-modal.css) |
| Token chip | 🟡 molecule | ✓ App | 點擊插入個人化變數 | [message-modal.css](./ds-components/message-modal.css) |
| Event preview card | 🟡 molecule | ✓ App | 建立活動粉絲視角活動卡（即時預覽） | [event-preview-card.css](./ds-components/event-preview-card.css) |
| Product list | 🟠 organism | ✓ App | E-Shop inventory table: product identity + status + stock + visibility + edit action, borderless row-divider layout。變體：`--eshop`/`--bundles`/`--auctions`/`--orders`/`--pickup`/`--ip`（2026-07-20 新增，spec 5.1.4 §F6：IP 清單欄位，8 欄——icon／名稱＋標籤／權利資訊／租出數／收入／租金／Mktplace 開關／Manage；`my-ip.html` 由原本 `.data-list` 卡片式清單改用此變體，對齊 e-shop 表格版面，同時把原本擠成一行的 meta 字串拆成獨立欄位）；拖曳握把 `__drag`（grip，抓它才重排）＋抬起態 `.product-list__row.is-dragging`（抬升陰影＋置頂，僅 --eshop Products 分頁；跟手 transform 由頁面 JS 控制）。草稿列（`[data-status="draft"]`）握把隱藏、不可拖曳（無粉絲端陳列順序），頁面 JS 置頂。列縮圖 `__thumb` 統一成描邊框，對齊 `__image--placeholder` 的**真實呈現值**：76×76（2026-07-26 使用者裁示：全站清單縮圖統一 76px，原 52×52）／`--muted` 底／1px `--border-soft`／icon 色 `--muted-foreground`（2026-07-20 二次修正——首版誤對齊 `__image` 從未單獨呈現過的基礎規則，已用 Playwright 逐項核對訂單/取貨與電子商店一致，Q20）；反白變體 `__thumb--cover` 邊框同色不露描邊。**2026-07-31 使用者：`.product-list__image` 改直式**——寬度維持 76px、高度由 `--img-portrait` 推導（不再從直式原圖裁一塊方形），列高隨之從 116 自然長高。**2026-08-05（D176／Q52）**：比例值由 750/930 改 `2 / 3`，縮圖成 76×114、列高 154；同日活動清單的方形例外撤除——原本 `.product-list--events .product-list__image` 覆寫回 `1 / 1`，使用者裁示改直式後整條刪除，**八支清單縮圖現在沒有例外、全部同一個比例**（原例外理由「活動素材有直有橫」不成立：清單取的是直式主視覺，橫幅另有 `event-preview-card--landscape` 版位）。取貨頁 QR 圖示用的是不同 class（`.product-list__thumb`，Q20 icon-chip 家族），不受本次收斂影響，仍是正方 chip。**2026-08-04 新增釘選區**（`__divider` ＋ `__divider-body` ／ `__divider-count` ／ `__pin-mark`，規格 5.1.5 F4／D172）：分隔線以上＝釘選並顯示在商店最前（上限 10），跨線拖曳即釘選／取消釘選，不掛粉絲端徽章，詳見 §4.26。**2026-08-06 新增橫向捲動包層 `.product-list-scroll`**（八個消費頁全數套用）：清單列有 7–9 欄、最窄 830–1160px，而 app 外殼的 `.main` 是 `overflow-x: hidden`，視窗一窄右側的「狀態」「操作」幾欄會被切掉**而且捲不到**——每一列的 ⋮ 在那個寬度區間整個點不到（既有 ≤760px 堆疊版型只救得了手機，760px 到各變體最小寬之間是漏的，筆電常見的 1280–1440 就落在裡面）。做法沿用站上既有的表格橫捲（`.ztor-table-scroll`／`.admin-table-wrap`／`.variant-table-wrap`）；`min-width: min-content` 讓清單撐到欄寬加總那麼寬，欄數少的變體不會長出捲軸。上下的 `padding-block` 是給 `:hover` 浮起陰影讓位（`overflow-x` 一旦不是 `visible`，`overflow-y` 也會被算成 `auto`），用等量負外距抵銷、版面高度不變。**2026-08-06 新增群組列**（`__row--group`＋`__group-chevron` 母列／`__row--child` 子列，見 §4.117）；同日新增頁內變體 `--series`（系列母頁的場次表，7 欄，欄數為該頁專屬故與 `--events` 同法留在頁內）：一筆清單項目其實是好幾筆時收成一列、點開才展開；首次用於活動的系列場次 | [product-list.css](./ds-components/product-list.css) |
| Project list | 🟠 organism | ✓ App | Projects table，欄位＝圖片／專案（`__kind` 類型＋名稱＋簡介）／當前目標（百分比＋金額＋既有 `.project-bar`）／剩餘時間／類別（內容＋家族）／狀態／chevron，整列連進明細，borderless row-divider。**2026-07-24 由單行 meta 拆成真欄位、並比照 e-shop 改真圖縮圖**：原 52×52 icon chip `__icon` 退場、改 76px `__image`（2026-07-26 使用者要求放大三分之一，原 56px；`poster||cover`，object-fit cover；無圖退 `--placeholder` muted 方塊＋類型 icon），**就此離開 Q20 icon-chip 家族**（`.product-list__thumb`／`.data-list__icon` 仍是純 icon chip、不受影響）。當前目標為 `__goal-pct`（粗大字）＋`__goal-amt`＋可重用進度條；非 campaign 列的目標／倒數用 `__cell--empty` 破折號。**待辦 tip 欄與獨立類型欄均於 2026-07-24 移除**。詳見 §4.28 | [project-list.css](./ds-components/project-list.css) |
| Table | 🟠 organism | ✓ App | Earnings transactions 9-col table。**表頭無底色、也無下框線**（2026-07-31 使用者裁示，同日兩段：先去底色——底色在卡片內會像另一個區塊；再去下框線——全站列表表頭一致，見 STYLE-DECISIONS Q41）。表頭與內容的分隔改由留白承擔，`tbody` 每一列的分隔線不動。伴生類：`.ztor-table-scroll`（橫向捲動容器，2026-07-31 自 project-detail 的行內 `overflow-x:auto` promote；坐在 `.card` 內時表格自框會被取消、避免框中框）、`.ztor-table__nowrap`（短值欄不換行——兩字詞會被逐字斷成直行）、`.ztor-table__sub`（主欄位第二行，放來源／模組／分類這類歸屬資訊，省下一整欄寬度）、`.ztor-table--truncate`（modifier：整張表一律單行，主欄位 `.ztor-table__namecell` 用 `max-width:0`＋`width:100%` 吃掉剩餘寬度，超出以 ellipsis 收掉而不撐寬表格；不用 `table-layout:fixed`，那會改掉站上所有表格的欄寬演算法）、`.ztor-table__mediatext`（`.ztor-table__media` 裡要放兩行文字時的包裝；flex item 預設 `min-width:auto` 不會縮，不歸零 ellipsis 永遠不觸發）。**縮圖一律用 `.ztor-table__media` 併進名稱格、不要自成一欄**——獨立欄會在圖兩側各吃一次 20px 儲存格內距，圖會浮在空欄中間（2026-07-31 使用者回報）。縮圖尺寸 **40px**、間距 `--sp-12`（2026-07-31 使用者：各再大一點點，覆蓋 07-26 的 32px 裁決）；40px 剛好等於資料列的內容高，列高不變。 | [table.css](./ds-components/table.css) |
| Chart | 🟠 organism | ✓ App | Linechart (Dashboard / Earnings trends) + stacked-bar + source-list legend + rank-bars + **donut**。`.donut`（2026-07-25 新增）＝兩段式比例圓環：外層設 `--donut-p`（第一段百分比 0–100），色彩 `--donut-a`／`--donut-b`（預設 `--chart-3` 綠／`--chart-5` 紫），尺寸 `--donut-size`（預設 220px），圓心挖空以 `::after` ＋ `--donut-thickness`（預設 28px）／`--donut-hole`（預設 `--card`，放在別的底色上要一併覆寫），中央 `.donut__center`（`__label`／`__value`）疊在挖空層之上；圖例沿用同檔 `.source-list`／`.source-row`。**兩段以上、且要放中央數字的比例用 `.stacked-bar`／`.rank-bar`，不要硬塞進 donut**。<br>`.pie`（2026-07-31 新增）＝N 段實心圓餅：外層行內設 `--pie-stops` 為 conic-gradient 色標串、段界寫累計百分比（每段起點一律寫 `0`，讓瀏覽器接續上一段終點），尺寸 `--pie-size`（預設 168px）；圓餅不帶文字，數字全由旁邊圖例承擔，故 consumer 必須給它 `aria-hidden="true"`。`.pie-figure` 是「圓餅＋圖例」的並排殼（`.pie-figure__legend` 內放 `.source-list`），560px 以下疊成單欄、圓餅置中。`.pie-figure--stack`（2026-08-09 新增）＝圓餅在上、圖例在下的直排版；並排版把圓餅擠在左半邊、卡片一窄就得跟著縮，直排讓圓餅吃滿卡片寬度可以畫大一點，圖例整排在底下也比擠在右側的窄欄好讀，段數少（三段以內）而卡片不寬時用它。`.pie--hollow`（2026-08-09 新增）＝中空版，厚度與挖空色沿用 `--donut-thickness`／`--donut-hole` 兩個變數，兩支的呼叫端不必記兩套；加在 `.pie` 而不是擴充 `.donut`，是因為 `.donut` 的引擎只吃兩段、要它做三段以上得整個換掉。消費者：粉絲分析 › 性別占比（女／男／其他三段）。**與 donut 的分工**：donut 只吃兩段且中心要放一個結果數字；三段以上、沒有單一結果數字要放的切分用 pie。**與 stacked-bar 的分工**：長條回答「誰比誰長」，圓餅回答「這一整塊是怎麼被分掉的」。消費者：粉絲總覽 › ztor 粉絲組成（四個分級的人數佔比）。<br>消費者：專案詳情 › 我的收益 › 淨收益分配（發起人／支持者 70/30） `.chart-card__foot` 為 space-between（左說明、右操作群）；**只有說明文字、沒有操作群時該文字靠右**（`> span:only-child` 補 `margin-left:auto`，2026-07-31）——否則單一子元素在 space-between 下等同靠左，看起來像漏了右邊那組。 | [chart.css](./ds-components/chart.css) |
| Earnings waterfall | 🟡 molecule | ✓ App | Earnings · Breakdown (spec §5.1.8 F12) — statement-style gross revenue → distributable profit ledger (bars on milestones, deductions plain indented rows); also reused for the F11 per-project profit ladder and F7 transaction mini-ladder | [waterfall.css](./ds-components/waterfall.css) |
| Bento grid | 🟠 organism | ✓ App | 12-col responsive grid · KPI rows, dashboard pairs, settings layouts | [bento.css](./ds-components/bento.css) |
| Payout picker & dialog | 🟠 organism | ✓ App | Earnings · Payouts bank picker card grid + request-payout modal (legacy dialog shell, predates Modal). `--embed` variant (2026-06-17) is a near-fullscreen, head/foot-less shell that hosts a whole page in an iframe — used by Create bundle's "New item" → `create-product.html?embed=1` popup。**寬度三階**：預設 620px ／ `--wide` 880px（裝五欄矩陣，2026-07-31）／ `--xwide` 1180px（裝「一整個設定畫面」，2026-08-01 新增，首個消費者＝粉絲管理的分級設定彈窗；它裡面是 7fr／3fr 兩欄，880px 會把右欄壓到 250px 左右、圖例的金額欄先被擠爛。1180px 沿用 `.embed-modal` 的上限，兩者都是「把一整頁裝進浮層」）。**`.payout-dialog__split`**（2026-08-09，首個消費者＝建立活動的門票編輯彈窗）把 `__body` 分成主欄（要填的欄位）與固定 200px 的側欄（只用看的圖片），`align-items:start` 避免側欄被主欄拉高，≤640px 收單欄 | [payout-modal.css](./ds-components/payout-modal.css) |
| Restock order (table) | 🟡 molecule | ✓ App | E-Shop restock popup (spec §5.1.5.6, D104 order + D106 member tabs). 2026-07-22 layout (Figma 861-28842): method as `.segmented.radio-cards` → product-name label → `.restock-table` (3 number columns current/restock/after, `__group`/`__row`/`__id`/`__img`/`__name`/`__col`/`__ro`) → supplier/notes/ETA below → footer pinned to dialog bottom (body scrolls); under-method hint + yellow stickynote removed. Product variants = matrix rows (2-option grouped), bundle members = Tabs (one `.tab-panel` each); reuses payout shell + Segmented + Tabs + Data-list (history) | [restock-modal.css](./ds-components/restock-modal.css) |
| Store settings page | 🟠 organism | ✓ SiteSpecific | E-Shop 商店層級設定 popup（`store-settings.html`，D035/D067，由 E-Shop F3 embed-modal 開啟、無頁首）：店面門面常駐（Base44/FB 式身分帶 `.ss-identity-card`/`.ss-band__*` + 逐欄就地編輯 `.ss-edit`）+ 商品陳列/付款/出貨 tab 群組 + 底部提交列 `.ss-actionbar` + See-as-fan 畫面分割預覽；含 `.ss-url`/`.amount-field`/`.ss-status`/`.ss-order`/`.ss-fan` | [store-settings.css](./ds-components/store-settings.css) |
| Variant builder | 🟠 organism | ✓ App | 建立商品多選項（spec 5.1.5.2 §4.1④，僅實體）。**2026-08-10 逐規格圖片（使用者指示，上游無此欄位，ASSUMPTIONS PG-025）**：`.variant-table--img` 在每列開頭加一個 34px 的直式小縮圖 `.variant-thumb`，實線＝這個規格自己的圖、虛線＝沿用商品主圖（沿用上傳格 Q59 的實線/虛線語彙，整列掃過去就知道哪幾個規格被單獨換過圖）；點開「規格圖片」彈窗換圖（`.payout-dialog--narrow` ＋ `.upload-tile-aside`，與建立活動的票種圖片同一個 pattern：這一列自己的圖，沒給就沿用上一層）。狀態只有一個來源（`varData[key].img`，有值＝自己的圖），商品主圖換掉時沿用中的列會跟著換。未掛 `--img` 的表（商品明細唯讀表）欄寬完全不受影響：`.segmented` 切單一/多選項 + `.option-set`（設定好的選項收成一行 `__row`，只有編輯中的展開成 `.variant-option`）+ `.variant-table`（逐規格價格/庫存/SKU/成本，`.--limited` 多出上限欄、`.is-excluded` 排除組合）；可編輯格重用 `.input`。**2026-07-21 庫存欄改唯讀**：庫存格是讀數 `.variant-cell--stock`（`--font-ui`／`--fs-13`／`--foreground`），低於低庫存門檻再加 `.variant-cell--stock-low` 轉 `--destructive` ＋ `--fw-medium`；庫存只能靠留有紀錄的補貨增加，做成 `.input` 會讓人以為可以直接打字覆蓋，轉紅則讓「哪一個規格快沒了」在表上一眼可見。**2026-07-21 逐值 input 改版（使用者裁示）**：值由 chip 膠囊改成「一個值一個 `.input`」（`__value` > `.input` ＋ `__value-remove`），可就地改字——設定選項時最常做的是改一個字，chip 得先刪再重打；底部 `__add-value` 虛線鈕再長一列，Enter 亦可。編輯態欄位加 `.field` 標籤（選項名稱／選項值），底部 `__actions` 靠右放「刪除」（`.btn--ghost.btn--destructive`，破壞性只用透明底）＋「儲存」（`.btn--outline`）。**列的外觀＝Q24 的 L3 規則首次落地**：整組坐在 `.nest`（L2）裡，所以 `__row`／`.variant-option` 去掉 `--input-surface` 填色改 `transparent` ＋ 1px 實線 `--border`；兩顆新增鈕（`__add`／`__add-value`）用 1px **虛線** `--border`（沿用 upload-tile／payout-modal 的「這裡還沒有東西」語彙）。表格外框貼齊內容寬靠左（`width:fit-content`＋`max-width:100%`）、選項組合欄＝內容寬（`max-content`＋110px 下限）不用 fr 吃滿剩餘寬度（2026-07-16）。**2026-07-22 列尾動作分兩種消費**：建立流程用 `.variant-row__remove`（X，把組合排除在建立集合外）；商品明細規格鎖定後不可移除，改列尾 `.dropdown` kebab 選單「單獨下架／重新上架」，下架列加 `.variant-table__row--delisted`（只壓「除下拉外的直接子代」灰階、輸入由 JS 加 `disabled`，kebab 仍可用來重新上架）。列尾用浮動選單的外框要加 `.variant-table-wrap--menu`：基礎 `.variant-table-wrap` 的 `overflow-x:auto` 會裁掉浮出的選單，此修飾在桌面寬度放行 `overflow:visible`（表格本就撐得下），只在 <560px 恢復 `overflow-x:auto` 橫捲。**放行 overflow 後外框圓角不再 clip 內容**（2026-07-23）：表頭（`--muted` 底）與末列的方角會戳出圓角，故改由內容自己貼齊——`--menu` 下給 `.variant-table__head` 上圓角、`.variant-table__row:last-child` 下圓角（半徑 `calc(--radius-xl - 1px)` 貼齊外框內緣）。**2026-07-22 商品明細整張表改唯讀**：價格／SKU／成本／總量欄由 `.input` 換成 `.variant-cell--ro`（純文字、與 `--stock` 同族、`text-overflow:ellipsis`），改值走「⋯ → 編輯」popup；每格加 `data-vc` 標角色（name/price/total/sku/cost）供 popup 讀寫回填。**2026-07-23 兩階層（顏色×尺寸）＋資料驅動**：商品明細的規格表改由 `products-store` 的 `options`／`variants` 驅動——單階層逐值一列、兩階層依第一個選項（顏色）用 `.variant-table__group`（撐滿整列的分組標題、同補貨矩陣語彙）分組、尺寸列在組底下。編輯 popup 用 `.variant-table--preview`（5 欄唯讀組合預覽：規格／價格／庫存／SKU／成本，無總量、無列尾動作），改選項值（加/改名/移除）時笛卡兒積即時重算 | [variant-builder.css](./ds-components/variant-builder.css) |
| Tag input | 🟡 molecule | ✓ App | 建立商品商品標籤（spec 5.1.5.2 §4.4 F10）：`.tag-input__field` 內已選/自建標籤（`.chip--removable`）＋無框輸入 `.tag-input__entry`＋建議 `.chip-group`；組合自 chip，可重用於專案/粉絲標籤。已選標籤 chip 用**品牌橘 tint**——Q19（2026-07-17）當初為此寫的 `.tag-input .chip--active` 專屬覆寫已於 **2026-07-27 Q8-A 刪除**：全站 `.chip--active` 本身就是橘了，覆寫變成純重複。Q19 的意圖（標籤＝已套用的分類，用橘標）完全保留，只是改由基底承接；順帶修掉原覆寫 `color: var(--primary)` 在亮色模式僅 1.92:1 的對比 bug（基底走 `--selected-ink`） | [tag-input.css](./ds-components/tag-input.css) |
| Combobox | 🟡 molecule | ✓ App | 多選 search-to-add typeahead：重用 `.tag-input__field`（已選 `.chip--removable` ＋無框 entry）當欄位，欄位右側 `.combobox__chevron`（開啟時翻轉）指示可展開，focus／輸入時彈出 `.combobox__menu` 下拉建議（`--sp-8` 間距浮於欄位下；`.combobox__group` 分組＋`.combobox__opt`＝icon＋名稱＋meta，`.combobox__empty` 空狀態），點選加入為 chip、已選項自建議移除。已選 chip 用中性灰（`--accent` 底，非 `.chip--active` 反白）。與 Tag input 差異＝建議改「focus 觸發浮層下拉」而非常駐 chip-group。首用：建立取貨場次 modal「加入取貨項目」（`partials/pickup-session-modal.js`，spec 5.1.5.12 §4 F2）。**新消費情境（2026-08-09）**：建立活動 `create-event.html` 的「票種」欄（選票種帶入門票）與「加入商品」欄（搜尋帶入 E-Shop 商品），選單與選項皆用 `.combobox`／`.combobox__menu`／`.combobox__opt`，取代原本頁內自造的一套下拉候選樣式；已加入的商品改用 Chip 的 `.chip-group` ＋ `.chip--removable`（見 Chip） | [combobox.css](./ds-components/combobox.css) |
| Film picker | 🟡 molecule | ✓ App | 電影關聯可搜尋多選（spec 5.1.5.2 §4.5 F12／5.1.5.1 §2.14／D140）：純 JS 元件 `partials/film-picker.js`，**建於 tag-input＋chip 之上、無自帶 CSS**——搜尋輸入格（`.tag-input__entry` type=search）過濾候選、建議 `.chip-group` 點選加入、已選 `.chip--active.chip--removable` 移除；候選來自 `window.ztorFilms`（films-store）。API `window.ZTOR_PARTIALS.createFilmPicker(host,{selected,onChange})`→`{getSelected()}`。consumer：create-product.html（§4.5 獨立區）、product-detail.html（§2.14）。候選為 mock（UIA-053）、可搜尋（BR-NEW-1） | [partials/film-picker.js](./partials/film-picker.js) |
| Work fields | 🟠 organism | ✓ App | 影片作品欄位區塊（spec 5.1.2.2.1 F1–F15）：純 JS 元件 `partials/work-fields.js`，**建於 form-section／form-grid／field-system／card／upload-tile／chip／tag-input／segmented／switch／control-row／amount-field／entry-list 之上、無自帶 CSS**。把「一個欄位區塊長什麼樣」收成單一來源，兩個宿主頁只給空容器＋順序：`publish-work.html`（共創／預購成立後的事後上架，四步）與 `create-project.html`（直接發佈 × 影片家族的建立流程，五步，2026-08-10 整併）。區塊 kind：`file`（含上傳與處理狀態徽章）／`audio`／`subs`／`cover`／`stills`／`bts`／`trailer`／`copy`（逐語言標題與說明）／`spec`（片長＋上映日期）／`genres`（21 值多選）／`tags`／`age`／`pricing`（是否付費＋幣種＋逐畫質四數值＋平台費揭露）／`credits`（九角色名單＋備註）。API `window.ZtorWorkFields.render(host, kind)`／`renderAll(host, kinds)`／`collect()`（收成送審內容）／`checks({stepOf, stepLabel})`（規格 §8 就緒檢查項）；chip 與開關這類沒有原生事件的互動統一補一顆 document 級 `workfields:change`。宿主頁在容器上寫 `data-wf="file,audio,subs"` 宣告要哪幾塊。為什麼是 JS 元件不是 HTML partial：每個區塊都會自己工作（字幕可增可刪、劇照填滿長下一格、語言組不准重複、幣種切換改所有金額符號）。**2026-08-10（D182）`genres` 與 `age` 兩塊的值域搬到 `js/work-taxonomy.js`**，本檔只負責畫外框與就緒檢查、不再自帶清單（見下一列） | [partials/work-fields.js](./partials/work-fields.js) |
| Work taxonomy | 🟢 atom | ✓ App | 題材（分類）與年齡分級的值域單一來源（主規格 §7.1.2 題材軸 21 值、§7.11 年齡分級六級，D182）：純 JS 元件 `js/work-taxonomy.js`，**無自帶 CSS**，畫面用既有的 `chip`（多選）與 `input.css` 的 `.select`（單選）。為什麼要獨立一支：這兩個值域各有三個落點（題材＝作品上架 F11、建立項目影視組 F4；年齡＝上架 F13、建立項目影視組 F4、項目公開資訊 §2.2.8），規格明講三處是同一份資料，實作也只能有一份清單——2026-08-10 前 `project-detail.html` 自己寫了一組 `PG-13／G／PG／R／NC-17`，同一部片在三個畫面可以顯示三個不同的分級。API `window.ZtorWorkTaxonomy.GENRES`／`AGES`／`genreKey(g)`／`ageOptionsHtml(selected)`／`genreChipsHtml(attr)`／`hydrate(root)`。宿主頁只留空殼：`<select data-taxonomy-age>` 與 `<div class="chip-group" data-taxonomy-genres>`，載入時就地填好、chip 開關走 document 委派，頁面不必寫 JS。載入順序要排在 `partials/work-fields.js` 之前（後者吃它的 `AGES` 與 `genreChipsHtml`），也要排在 `js/zselect.js` 之前（選項要先在，`<select>` 才升級得對）。消費頁：`publish-work.html`、`create-project.html`（影視組類型相關欄位＋影片路徑作品欄位）、`project-detail.html`（公開資訊年齡分級） | [js/work-taxonomy.js](./js/work-taxonomy.js) |
| Status axes | 🟡 molecule | ✓ App | 訂單兩條獨立狀態軸（spec 5.1.5.3.1 §2.2 / PCR-001）：履約 vs 付款·結算，不併成單一 badge。`.status-axes`＝清單列並排 badge；`.status-axes--split`＝詳情頁首一列，每軸各自是一個內嵌的 `.status-axes` 群組（混合訂單的履約軸得以在同一組並列兩顆徽章）、群組間以 `border-left` 細線分隔。**2026-08-07**：原 `.status-axes--labeled`／`.status-axis`／`.status-axis__label`（每軸上方大寫標籤）退場——分隔線已達成 PCR-001 的「兩軸不混成一顆徽章」，徽章文字本身已說明所屬軸，標籤重述同一件事，且「收入結算」與徽章「已付款」用詞不一致。用於 order-detail §2.2（orders 清單改為兩軸各自成欄，見 product-list--orders） | [status-axes.css](./ds-components/status-axes.css) |
| Embed modal | 🟠 organism | ✓ App | 全螢幕 popup 以 iframe 內嵌另一頁、就地開啟（spec 5.1.5 F3 / D065）：電子商店「商店設定」開 `store-settings.html` popup，不離開清單。`.embed-modal`＞`__sheet`＞`__head`(`__title`/`__close`)＋`__frame`(iframe)；lazy 設 src、Esc/backdrop/× 關閉 | [embed-modal.css](./ds-components/embed-modal.css) |
| Leave dialog | 🟠 organism | ✓ App | 建立／編輯流程的返回離開確認彈窗（spec §5.2.4），由 `partials/wizard-chrome.js` 注入、6 建立頁共用。兩態同殼：有未存編輯→問儲存（儲存並離開 primary／不儲存就離開 outline）；未編輯→純離開（離開 primary）。頂列無儲存入口的頁面加 `.wizard[data-leave-simple]` 可強制永遠走純離開態（2026-07-31，admin-ip-bank-entry）。`.leave-dialog`[data-open]＞`__scrim`＋`__card`＞`__close`/`__title`/`__body`/`__actions`（堆疊滿寬 btn）；Esc/scrim/× 取消。2026-06-29 自 shared.css `.wizard-leave*` promote | [leave-dialog.css](./ds-components/leave-dialog.css) |
| Spec row | 🟡 molecule | ✓ App | 可重複的詳細規格列（spec 5.1.5.2 §4.1② 建立商品／5.1.5.1 §2.3 商品細節）：`.spec-row`（grid 1fr 1fr auto）＞規格名稱 `.input`＋規格值 `.input`＋行尾 `.btn--icon` 刪除；多筆垂直堆疊，＋ 新增規格加空列。2026-06-29 自 create-product 內聯 `.cp-spec-row` promote、product-detail（D095）共用 | [spec-row.css](./ds-components/spec-row.css) |
| Split button | 🟡 molecule | ✓ App | 主操作＋箭頭下拉相關動作（spec 5.1.5 F3 / D066，ref. Add Event ▾）：電子商店 F3「建立」context-aware（主鈕隨 tab：商品/組合/拍賣），箭頭一律列全部類型。`.split-button`＞`__main`(左圓角)＋`.dropdown`＞`__caret`(右圓角、細線相連)；組合 btn＋dropdown-menu | [split-button.css](./ds-components/split-button.css) |
| New product post | 🟠 organism | ✓ App | 建立商品後在電子商店清單彈出的撰寫彈窗（spec 5.1.5.7 / D068）：重用群發撰寫器（受眾·標題≤120·內文≤2000·token·排程，message-modal.css）＋ payout dialog 外殼，本檔只加 F2 商品附件卡 `.npp-product`＋略過路徑；`?posted=1` 由 e-shop 開啟。組合 payout-modal＋message-modal | [product-post-modal.css](./ds-components/product-post-modal.css) |
| App shell | 🟠 organism | ✓ Project | Global page frame: `.app` + `.main` + `.page`（`.page` max-width 1280px）. Sidebar mode makes `.main` one continuous `--surface-page` sheet on `--surface-shell`, with a 16px top gap and 28px top-left corner。**窄版變體 `.page--narrow`（1056px，2026-07-20 Q21）**：只給 Detail rail（§4.52）的兩欄詳情頁——右欄固定 300px，容器留在 1280 會讓左欄行長過長；其餘頁面維持 1280。Q21 原裁全站收窄，同日改為僅變體套用。Consumer：product-detail.html、order-detail.html、bundle-detail.html、auction-detail.html | [shared.css](./shared.css) |
| Page intro | 🟡 molecule | ✓ Project | Product page H1 + sub + optional actions; eyebrow retired | [page-intro.css](./ds-components/page-intro.css) |
| Field more | 🟡 molecule | ✓ Project | 把一組欄位裡的次要欄位收在「顯示更多」按鈕後（2026-07-21）：`.field-more` > `.btn.btn--outline.field-more__toggle`（**2026-07-21 使用者裁示改滿寬線框鈕**，原為靠左無框文字鈕；外觀重用 Button atom，本元件只擁有 `width:100%` ＋ `justify-content:center`，不自刻邊框/hover）。`margin-bottom: --sp-16` 吃 `.field` 同一套表單節奏、`:last-child` 歸零免留尾巴（2026-07-21：改滿寬鈕後才浮現——原本只有上方靠前一個 `.field` 的下外距撐開、自己沒有下外距，後面元素會貼上來）（chevron ＋ `field.show-more`／`field.show-less` 文案）＋ `.field-more__body[hidden]`。**收合區內任一欄位已有值就自動展開**——建立商品是空表單、收起來合理；商品明細是編輯頁、欄位帶真實資料，藏起來等於藏使用者填過的東西。這個判斷是用 JS（[partials/field-more.js](./partials/field-more.js)）而非 `<details>` 的原因，兩頁因此能共用同一段 markup。首次用於建立商品／商品明細的取貨方式 ▸ 物流配送（只留「重量」在外，出貨分類／尺寸／寄件地收起來）；**商品明細已於 2026-07-22 依使用者裁決把物流欄位全部展開、不再有 `.field-more`**，「有值就自動展開」目前沒有活的消費頁，保留是因為建立商品同時當編輯頁用。收在裡面的必填欄仍保留 `*` 標記。**2026-08-06 新增選配的自訂按鈕文案**：在 `.field-more` 掛 `data-more-key`／`data-more-text`／`data-less-key`／`data-less-text` 即可換一組講法（建立活動的場地用「進階／收合」），不掛就維持預設的「顯示更多／收合」，既有消費頁不受影響。第二個消費頁：`create-event.html` 場地 ▸ 集合地點與交通 | [field-more.css](./ds-components/field-more.css) |
| Field system | 🟡 molecule | ✓ Project | ONE form field = label / hint / control slot（控件重用 atom）；多欄位怎麼成組、堆疊＝Pillar 5 · Form assembly，非本元件。單獨與 Form section 內皆維持基礎密度 gap 6／欄距 16；產品建立頁同樣遵守此節奏。`.field__hint` 顏色 2026-07-20（Q21）改回 `--muted-foreground`，推翻 2026-07-16 「提亮成 `--foreground-muted` 以便在卡填色上讀得清楚」的決定——說明文字要明確退到輔助層；全站用 `.field` 的頁面一併生效，並與同輪改成同色的 `.form-section__sub` 對齊。**2026-07-22 追加 `.field-readout`**：欄位改「只顯示、不可填」時用它取代 `.input`／`.amount-field`（ui 字體／`--fs-14`／`--foreground`、不畫框不留 input 內距，讀起來是文字不是空欄）；用於商品明細把價格／成本／總量上限改唯讀，改值一律走編輯 popup。**2026-08-06 追加 `.field__error`**：欄位級錯誤訊息，位置與字級同 `.field__hint`，顏色改 `--status-error`（可讀的狀態紅，非破壞性操作專用的 `--destructive`；與 bundle-editor 的 `.field__hint.fc-hint--over` 同一支色）；隱藏／顯示用 `[hidden]`，控件同步標 `aria-invalid="true"` 由既有的 `.input[aria-invalid="true"]`（shared.css）畫紅框。首個消費者＝`earnings-sony.html` 捐贈彈窗的金額欄（超過可提領金額／低於所選組織的最低捐款額） | [field-system.css](./ds-components/field-system.css) · [input.css](./ds-components/input.css) |
| Form section | 🟠 organism | ✓ Project | No-card section skeleton (title + sub + top divider + spacing) for create / wizard flows; scopes field label / hint presentation under `.form-section`（承載 Field 的組合殼，2026-07-08 自 🟡 重標；表單配方見 Pillar 5 · Form assembly）。`.form-section--outlined` 為建立流程正式採用的變體：白天以 `--surface-page` 作 sheet 底、`--card` 填色；黑夜改以 `--surface-shell`（`#1C1D1E`）填色浮在最深的 content（`--surface-page #0C0D0D`）上（2026-07-17 midnight-v2 先改 `--muted`→`--card`——壓暗後 `--muted` 與頁底過近、區塊會消失；2026-08-01 使用者比對同頁 `.list-toolbar`／`.alert-inset` 皆用 `--surface-shell`，裁示三者統一用 `#1C1D1E`，再改 `--card`→`--surface-shell`）；**無外框線**（2026-07-16 Q14 使用者裁示去 border，靠填色對比分區）；**浮起感**（2026-07-17 Q18 修訂 Q14）＝疊 `--shadow-card`（E2 resting）＋`--shadow-edge-top`（頂緣高光），仍無 1px 邊框、改由填色＋陰影＋上緣光共同分區；圓角 `--radius-xl`（16px）、內距 `--sp-16`（對齊 Figma node 781-4166；原圓角 6／內距 32）。可見 outlined siblings 用 `--sp-24` 分隔，跨過 `[hidden]` 條件區塊不留空白。採用頁：create-product／-auction／-bundle／-event／-project／register-ip／admin-ip-bank-entry；[section-test.html](./section-test.html) 保留作視覺驗證。`.form-section--modal` 已於 2026-07-17 退場：原採用它的建立取貨場次 modal（`partials/pickup-session-modal.js`）當日改成頁籤式分區（重用 Tabs 的 `.tabs` + `.tab-panel`，不再疊直填色面板），此變體無其他消費者故移除。**2026-07-20（Q21）字級拉平（全站 form-section 消費頁一起生效）**：`.form-section__title` `--fs-18`→`--fs-14`，與 `.field__label` 同級——區塊標題不再靠放大字級建立層級，改由卡片邊界承擔；`.form-section__sub` `--fs-14`→`--fs-11` 且色階由 `--foreground-muted` 壓暗成 `--muted-foreground`，與 `.field__hint` 同級——區塊副標與欄位說明本來就是同一種「輔助說明」角色。同檔尾追加 `.form-footnote`：表單底部置中小字說明（如 Stripe 保障文案），`--fs-12` / `--muted-foreground`，margin-top 22px 非 token（2026-07-09 自 create-product/auction 頁內樣式 promote，create-campaign 的 `.fc-footnote` 樣式不同、維持獨立）。**2026-07-22 追加 `.form-section__head--actions`**：標題列帶右側動作的變體——把標題群包進 `.form-section__head-titles`、動作群放 `.form-section__head-actions`（按鈕／⋯選單），head 改 flex 兩端對齊；只在需要動作的區段啟用（預設 head 仍是堆疊 title＋sub）。用於商品明細庫存卡（補貨紀錄鈕＋新增/編輯/補貨選單）。**2026-08-09 追加 `.form-section__subhead` 與 `.form-section__grouplabel`**（自 `create-event.html` 頁內 `.ce-subhead` promote）：一個 `.form-section` 裡有好幾組東西時（例：場次區段的「場次日期與時間」／「場次細節」）用 `__subhead` 分組，比拆成多張卡合適——它們回答的是同一個問題的幾個部分；字型與字級刻意跟 `.form-section__title` 完全一樣（`--font-display`／`--fs-14`，Q21 已裁決區塊標題與欄位標籤拉平成 14px，層級改由上緣 hairline 與留白承擔），卡片頂端第一個小標不畫分隔線（`.form-section__head + .form-section__subhead` 歸零 margin/border——上面就是區段標題本人）。`.form-section__grouplabel` 是小標底下的欄位分組（例如「每一場的人數」統轄最少／最多兩欄），Q21 之後與欄位標籤同字級，靠上方留白與網格分群，不另造第四種字級。**2026-08-10 追加 `.form-section > .segmented.radio-cards:has(~ :not([hidden]))` 補 16px 下距**：區段內垂直節奏一直靠 `.field` 自帶的 `margin-bottom` 16px 撐開，選項卡群組（`.segmented.radio-cards`）不是 `.field`、身上沒有那段留白，直接放進區段會與下一個元素貼成 0px——「選了才出現的欄位」最明顯，揭示出來的欄位標籤會貼在卡片下緣（建立活動「販售方式」二選一、「取票方式」三選一皆是）。**條件寫成「後面還有看得見的東西」而不是 `:not(:last-child)`**：這種卡片群組下面接的往往正是「選了才出現」的揭示區，收合時那些元素帶著 `hidden` 仍留在 DOM 上，`:not(:last-child)` 只看結構、看不出它們是隱形的，預設收合狀態下區段底部會白白多出 16px；`:has(~ :not([hidden]))` 問的是「後面有沒有任何一個還顯示著的兄弟」，同時也處理了「第一個揭示區藏著、第二個才是展開那個」的情形（取票方式選到店自取時，順豐那一塊是隱藏的），用相鄰選擇器 `+` 會漏掉。實測七種狀態：販售方式 直接販售 0px／限時販售 16px；取票方式 電子門票 0px／順豐 16px／到店自取 16px；建立商品 單一規格 0px／多選項 16px | [form-section.css](./ds-components/form-section.css) |
| Radio card | 🟡 molecule | ✓ Project | Side-by-side selectable cards (title/sub) built on Segmented; flat 1px `--border` card, no shadow, gap 12 (Q13 2026-07-16, Figma node 781-4386); selected = small centered orange dot (no ring, no card outline), unselected shows no marker; single-line cards (no sub) vertically center text + dot, title+sub cards stay top-aligned; optional icon-marker variant. **Hover (2026-08-09, per user)**: every radio card lifts its background to `color-mix(--foreground 6%, --accent)` on hover. That fill used to live only on `--gate`, so the plain cards (single/multiple options, unlimited/limited, pickup method) had no hover feedback at all — same component, the only difference being a lead icon, so the feedback shouldn't come in two grades. **The orange dot does not move down with it**: the gate has no persistent selection, so its hover dot is the only preview of what you're about to pick; on a plain radio card the selected one already carries a dot, and a second dot under the cursor would read as "both are selected". **`--3` variant (Q28, 2026-07-24)**: 3-column grid (overrides the default 2-up) for create-project's gate + in-flow「專案類型」picker. In the **in-flow form** (`--3` without `--gate`) the selected card keeps the Q13 orange dot **and** lifts its background to `color-mix(--foreground 6%, --accent)` (2026-07-25, per user, to make the in-flow selection clearer); the gate (`--gate`) has no persistent selection so it gets no such fill. **`--gate` variant (Q28, 2026-07-24)**: create-project gate only — each card stacks a lead icon (`.radio-card__lead`, constant `--muted-foreground` — no recolor when active) on top, then title + sub with a roomier gap (`--sp-6`); the gate is a click-to-proceed picker with **no persistent selection**, so cards show **no dot at rest** (the base active dot is overridden to none); the orange dot appears **top-right (`::after`) only on hover** — the brighter hover fill it used to declare for itself now lives on the base rule above (2026-08-09), so `--gate` only keeps the dot half; dot + brighter fill together remain the hover affordance. In-flow form uses plain `--3` (title-only, no icon). **`--list` variant (2026-08-09 promoted from create-event.html's page-local `#ce-bky-list` id override)**: single-column list (`grid-template-columns: 1fr`) instead of the default grid, for the bookyay import gate's search results (one row per venue, not a 2-up grid) — see §4.120 Source import. Reuses the `--gate` card face (same "pick and move on" semantics) but paints the selected row in the `--gate` **hover** look (brighter fill + orange dot) because this list still needs a visible "which one is picked" cue before the user presses Import, unlike the plain gate which has no persistent selection. `--list` and `--gate` stack on the same container without conflict. **⚠ 2026-08-10 起 `--list` 為退場候選（同日反覆兩次，最終狀態）**：bookyay 帶入閘門的結果清單改用 Owner lookup 下拉（見 §4.120 Source import），`--list` 因此失去唯一消費頁。同日一度被建立活動的「要怎麼建這些門票？」選擇彈窗接手，但使用者隨後指示那個彈窗改回並排兩欄（見下）——`--list` 因此再次沒有消費頁，只剩 design-system 展示。保留待使用者裁決，不自行退場。 **`align-items: stretch`（2026-08-09 修根因）**：三張並排卡高度曾對不齊（如「三選一取票方式」某張副標兩行、某張一行，卡就長不一樣高）——grid 的預設 `align-items` 本來就是 `stretch`，但 `segmented.css` 的 `.segmented { align-items: center }`（給軌道內文字置中用）沒被蓋掉：`.segmented.radio-cards`（0,2,0）這條規則本身沒設 `align-items`，瀏覽器照特異度回頭吃 `.segmented`（0,1,0）那條，等於把 grid 的 stretch 蓋成 center，同列的卡因此各自用自己內容的高度置中。修法是在 `.segmented.radio-cards` 顯式補回 `align-items: stretch`，卡片就會填滿所在列的最大高度 | [radio-card.css](./ds-components/radio-card.css) |
| Radio list | 🟡 molecule | ✓ Project | Lightweight vertical 1-of-N picker (2026-07-17): radio dot + title (optional one-line sub) per row. 指示器（2026-07-17 Q19 精修）：未選＝13px 細環（1.25px `--border`）、已選＝粗環消失只留 8px 實心橘點（`--primary`）；transparent rows, hover `--accent`（2026-07-21 由 `--muted` 改回 Q9 裁決值——暗色 `--muted` 比卡還深、hover 像凹下去）, no card frame/shadow. Data choice, not view switch (that's Segmented). Rows without `.radio-list__sub` vertically center dot + title. **`--menu`／`--menu-compact`／`--menu-row` 變體已於 2026-07-24 移除（Q28，tombstone 見 radio-list.css）**：曾用於 create-project 的「專案類型」picker，經使用者裁示改用建立商品同款 `.segmented.radio-cards`（見 Radio card，灰卡＋右上小橘點），list-menu 樣式全數退場。**變體 `--collapsible`（2026-07-21 · Figma 856-22782）**：收合式，`.radio-list__trigger`（圓點＋文字＋`.radio-list__chevron`）＋`.radio-list__options[hidden]`，外框 1px `--border` ＋ `--radius-xl`，展開時觸發列填 `--input-surface`、chevron 轉 180°、`[data-open]` 標開合；展開時已選項在觸發列與清單各出現一次（Figma 原設計、使用者裁示保留）。行為由 [partials/radio-list.js](./partials/radio-list.js) 統一接線（開合、觸發列文字＋`data-i18n` 同步、外點與 Esc 關閉、派發 `radio-list:change`），頁面只留自己的欄位揭示邏輯。其他 consumer：create-product/-bundle/-auction（Listing settings under the preview card）＋product-detail/bundle-detail（Listing settings in price-stock），五頁 2026-07-21 起一律用 `--collapsible`。**新消費情境（2026-08-09）**：`create-event.html` 票種卡購票規則區塊（購票條件／限購／折扣）的單選改用本元件（基準版，非 `--collapsible`）——原本這裡當日一度 promote 出 `.zradio`（drawn radio，見 Checkbox §4.96），同日使用者裁決「建活動頁的樣式一律以既有 design system 為主」，改吃既有 `.radio-list`，不留第二種單選視覺；元件定位擴大為「輕量單選列、資料選擇，**也含表單裡的規則選項**」 | [radio-list.css](./ds-components/radio-list.css) |
| Date input placeholder | 🔵 atom | ✓ Project | 原生 `<input type="date|datetime-local|time">` 的 placeholder 裝飾層（2026-07-21）：原生欄位不吃 `placeholder`、空值時自己畫「年/月/日 --:--」且用一般內文色，看起來像已填值。`[data-empty="true"]`＝日曆 icon（`--sp-12`）＋淡灰「選擇日期」（`--sp-40`、`--muted-foreground`），原生 `::-webkit-datetime-edit` 藏起來、input 內距推到 `--sp-40`；`[data-empty="false"]`＝icon 與 placeholder 都收掉、內距回基礎 `--sp-12`、日期用 `--foreground`（常駐 icon 會吃掉 28px，設定頁 120px 的窄時間欄會被切字）。date／datetime-local／time 三型共用同一句文案 `field.pick-date`（使用者 2026-07-21 裁示）。**2026-08-06 新增選配的自訂文案**：欄位掛 `data-ph-key`（字典 key）或 `data-ph`（直接給字）就換一組，不掛維持「選擇日期」，既有約 40 處不受影響；首個消費者＝建立活動售票規則的起訖兩格（「開始」「結束」）——兩格並排時各自說自己是哪一端，比重複寫同一句有用。原生日曆鈕攤平成整格透明覆蓋層，點整格用 `showPicker()` 開選單。由 [partials/date-input.js](./partials/date-input.js) 執行期自動包裝全站約 40 個欄位（含 MutationObserver 接住 modal 這類後注入的節點），頁面 markup 維持乾淨的 `.input`，不得手寫 `.date-input` 外層 | [date-input.css](./ds-components/date-input.css) |
| Control row | 🟡 molecule | ✓ Project | Bordered standalone row: left label/sub + right control (switch / number / button)。**`.control-group`（2026-07-21 新增）**：開關列＋它揭示出來的表單包成同一個外框（`--radius-xl` 外框、群組內的 `.control-row` 交出自己的框與圓角、揭示區 `.control-group__body` 帶 1px 上分隔線＋`--sp-16` 內距）——原本揭示欄位是裸的散在框外，讀起來像另一件事，包起來才看得出「這塊歸這個開關管」（使用者裁示）。可巢狀（開啟折扣 ▸ 開啟限時折扣）。寬度限制要下在內層欄位、不能下在 `__body`，否則分隔線會跟著縮短。12 組分佈於 create-product／create-bundle／bundle-detail／product-detail／create-event；沒有揭示表單的開關列維持單獨 `.control-row`（create-auction、create-project）。**`--plain` 與 `__body--top`（2026-08-10 新增）**：`.control-group--plain` 是「整塊就是內容、沒有開關列與揭示區兩段」的外框盒（自帶 `--sp-16` 內距），首個消費情境是建立活動票務那一步——一個場次一個框，門票一多才看得出哪幾張屬於同一場。**只有一場時不畫框（2026-08-10 第二輪，使用者指示）**：`create-event.html` 頁內邏輯改成場次數 > 1 才掛 `control-group control-group--plain`，只有一場時 `.ce-tiergroup` 只剩定位用的外層 div、沒有外框也沒有組標題——框與標題的職責都是「把這幾張圈成同一場、跟別場分開」，全部門票都屬於同一場時沒有要分辨的對象。`.control-group__body--top` 收掉上緣分隔線，給「揭示區是群組裡唯一一塊」的情形用。**新消費頁（2026-08-09）**：create-event.html 的「販售方式」——`.control-row` 開關「發布後直接開賣」＋ `.control-group__body` 放「開賣／停售時間」欄位，揭示方向與既有消費頁相反（**關掉**開關才展開時間欄，其餘消費頁一律**開啟**才展開）；元件本身只認 `__body` 的 `[hidden]`，揭示條件是哪個開關值一律由消費頁的行內邏輯決定，元件層不因此分岔 | [control-row.css](./ds-components/control-row.css) |
| Form grid | 🟢 atom | ✓ Project | 2- / 3-column field layout helper | [form-grid.css](./ds-components/form-grid.css) |
| Filter row | 🟡 molecule | ✓ Project | Chip filters and inline actions above lists / grids | [shared.css](./shared.css) |
| Edge shadow（工具）| ⚪ utility | ✓ Project | `.edge-shadow`：把 `--shadow-header` 變成「只露下緣、內縮、兩端漸淡」的邊緣陰影（`::before`＋clip）。wizard header／電子商店庫存條共用；其他元素加 class 即覆用 | [shared.css](./shared.css) |
| Shell 補角／接縫（頁級技法）| ⚪ utility | — SiteSpecific | 分割/捲動容器的圓角補位技法，與 `.edge-shadow`、`.alert--page-top::after` 同族，目前寫在 e-shop.html `<style>`（僅該頁用，隨 preview split 版式）：**corner-mask** 用同色 radial-gradient 補 `.main` 捲動容器右上被裁的方角（吃 `--surface-shell`／`--radius-shell`，公式與 `.alert--page-top::after` 一致、閾值統一 `-1px`）；**seam-shadow** 用透明真圓角輔助層投 `--shadow-seam`、蓋在接縫上（避免方角容器 box-shadow 走方角）。屬 shell 版式膠水、非通用元件，待其他分割頁複用時再抽 utility | [e-shop.html](./e-shop.html) |
| Segmented control | 🟡 molecule | ✓ Project | Compact chart view switcher and mode toggles | [chart.css](./ds-components/chart.css) |
| Stepper | 🟡 molecule | ✓ Project | Wizard 進度條（數字圓圈）。**2026-06-23 起由 Progress stepper 漸層條逐步取代**，仍存於 register-ip / create-project（過渡） | [shared.css](./shared.css) |
| Progress stepper | 🟡 molecule | ✓ Project | Wizard 進度條：細軌＋品牌漸層填充（`--progress`）＋下方步驟標籤（default／`--current`／`--done` 可回點）。多步驟建立流程用。<br>**2026-08-10（使用者反饋）三項**：<br>軌道 6 → **3px**（它是背景資訊，旁邊的步驟名稱與狀態小字已經在說同一件事）——全站消費頁一起變細。<br>**`--segmented` 變體**：加了它並設 `--steps`（看得到幾步）與 `--at`（現在第幾步，1 起算），軌道就切成一步一段、縫的位置＝步驟分界，**實色＝已完成、淡色＝正在走的那一段、空的＝還沒到**。原本是一條連續長條，填到 40% 這種位置在畫面上不對應任何東西。沒加這個修飾類的消費頁行為不變。<br>**`__state` 選配子元素**：步驟名下方的狀態小字（已完成打勾＋`--status-success-ink`／未完成灰字），消費頁自行決定要不要放。同輪標籤本身改成 `display:flex` 的可點量體（內距撐開命中區、圓角、`--done`／`--current` 才有 `--accent` hover），並補 `.progress-stepper__label[hidden]{display:none}`——display 會蓋掉 UA 的 `[hidden]`，被跳過的步驟得顯式收起。<br>**2026-08-10 第二輪（使用者反饋）兩項**：<br>**標籤與軌道對齊**——預設版的標籤列是 `space-between`（第一個貼左、最後一個貼右、中間平均分空隙，每個標籤佔多寬取決於自己的字數），軌道卻是等寬分段，兩套分法不可能對得上；`--segmented` 的標籤列因此改成 `grid-template-columns: repeat(var(--steps), minmax(0,1fr))`，一格＝一段，內距靠等量負外距抵銷，文字起點就是那一段的起點、hover 底色蓋住的就是那一段（實測 5 步：軌道 x=332 w=764，第二個標籤文字起點 485 對段起點 484.8）。<br>**正在走的那一段換成中性灰**（`color-mix(--foreground-muted 45%, transparent)`）——原本是 `--primary` 稀釋到 28%，在深色軌道 `#161718` 上混出 `#5c4a2a` 這種泥巴棕，既不是品牌橘也不是灰，看起來像沒渲染完的橘色，第一步（完成度 0%）整條軌道只剩它時最明顯。改中性之後色相被保留給「已完成」單獨使用：有顏色＝做完了，亮度只回答「你在哪」。<br>**`--segmented` 的填充不做寬度動畫（2026-08-10 第三輪，使用者反饋「第一個步驟中有一點橘色」）**：連續長條做寬度動畫是有意義的過場（40%→60% 在講「往前推進了」），分段軌道的填充卻永遠停在段的邊界上，動畫過程中的中間值只會畫出一段不存在的「半段橘色」；退回第一步（完成度 0%）時最明顯——填充從有寬度動畫縮到 0 的過程中，軌道最左端會殘留一小截橘色，讀起來像沒渲染完。補 `transition: none` 與 `border-radius: 0`（圓角已由軌道自己的 `--radius-pill` ＋ `overflow:hidden` 收好兩端，填充自己再圓一次在 2× 螢幕的近零寬度盒上會描出髮絲邊）。<br>**hover 範圍改成剛好一段（2026-08-10 第五輪，使用者反饋「目前 hover 的範圍看起來壞掉了」）**：`--segmented` 原本的寫法是「保留基底的左右內距、再用等量負外距抵銷」，文字確實貼齊了段的起點，但 hover 底色的盒子因此比所在的那一段左右各多 8px——底色與上方的分段對不起來，看起來像偏移了半格。負外距拿掉：格線本身就是一段的寬度，標籤盒填滿它，hover 底色正好覆蓋那一段（實測 5 步 1440px：每格 152.8px，五個標籤盒與所屬分段的 x 與寬度差皆為 0）。**左右內距保留**（2026-08-10 第三次修正，使用者反饋「要有左 padding」）：對齊的責任在**盒子**身上——一格＝一段由格線保證、hover 底色因此剛好蓋住那一段；文字則靠內距與盒子左緣拉開 8px，否則字直接貼著 hover 底色的邊、讀起來很擠。盒子貼齊分段、文字在盒子裡呼吸，兩件事不衝突。垂直內距不變，命中區仍有高度（45px）。<br>**`--anystep` 修飾類（2026-08-10 第五輪，使用者指示「這些步驟應該要都可以隨意點開」，選配）**：預設只有 `--done` 與 `--current` 給 hover 與 pointer，因為預設的點擊處理器只允許回點已完成或當前那一步、前進一律走「下一步」——未來的步驟看起來能按卻按不動更糟。加上 `--anystep` 代表消費頁的點擊處理器允許跳到任何一步，標籤的可點外觀就全部打開。**兩件事必須同時做**：只加 class 不改點擊邏輯＝看起來能按、按了沒反應；只改邏輯不加 class＝能按的步驟看不出來可以按。被跳過的步驟本來就 `[hidden]`、不在畫面上，不受影響。首個消費頁 `create-event.html`（同輪把點擊條件由 `n <= step` 放寬成 `n >= first && !skipped(n)`——原型要能直接翻到想看的那一段，發布前的必填把關本來就在 Review 那一步的檢核清單上，不靠「不准你跳過去」實現）。<br>首個 `--segmented` 消費頁：`create-event.html` | [progress-stepper.css](./ds-components/progress-stepper.css) |
| Wizard frame | 🟠 organism | ✓ Project | 建立流程聚焦版面，**六頁單一框架**（§5.2.4，create-product/-bundle/-auction/-project/-event/register-ip 一致）。**結構 v3（2026-06-24，對齊 `.main` 卡片語言）**：`.wizard`＝灰 canvas（`--surface-shell`，固定高不捲）＞ `.wizard__sheet`＝白色 content 卡（內部捲動、下緣圓角 28px＋向下投影、圓角歸自己）＋ `.wizard__bottom`＝其下 in-flow 平面灰 footer。**Header**（`.wizard__sheet` 內、sticky）：`.wizard__top-bar` grid 三欄＝`.wizard__back`(返回箭頭)＋`.wizard__top-titlewrap`(標題＋`.wizard__top-sub` 副標) 靠左（**2026-07-16：兩者合併為單一返回按鈕**——`.wizard__top-lead` 當膠囊面，hover 套 `--accent` 圓角底[`--radius-lg` 8px、內距 8/16/8/8，Figma 781:4142]、點標題也回上頁；命中區/焦點環由 `.wizard__back::after` stretched 撐滿整個 lead，markup 不變）｜中欄＝多步驟 `.wizard__progress`(漸層 Progress stepper)／單頁空｜`.wizard__top-actions`(自動儲存狀態＋Preview) 右。**三欄軌道（2026-07-24 修）**：`minmax(var(--wizard-lead-min), 1fr) minmax(0, 820px) minmax(min-content, 1fr)`——左欄補 180px 下限。原本兩側都是純 `1fr`，左欄標題塊有 `min-width:0`＋ellipsis 所以最小能縮到 0、右欄的儲存狀態與按鈕不能縮（約 196px），視窗一窄中欄的 820px 就把左欄吃成 0、標題溢出壓在進度條上（1058px 實測 col1=0）；補下限後擠壓改由進度條吸收，寬螢幕（1440px 實測 266/820/266）版面不變。**Footer**：`.wizard__bottom-actions`([Back 多步才有]＋主動作)＋左側次要動作（如 Save & exit）。**`.wizard__bottom--end`（2026-08-09 promote）**：沒有左側次要動作時整組靠右收齊。此前站上有十個 wizard footer 各自寫著同一段 inline `style="justify-content:flex-end"`——正是 Q9 要收斂的「散落的即席樣式」，本輪收成修飾類並把十個消費頁一次換掉（`create-project`／`-auction`／`-bundle`／`-campaign`／`-product`／`-event`／`publish-work`／`funding-simulate`／`admin-ip-bank-entry`／`funding-test/create-campaign`）。建立活動同輪撤掉「儲存並離開」（工作列已有儲存為草稿），因此成為這個修飾類的消費者。**`.wizard__bottom-hint`（2026-07-30 新增）**：主動作（如 Continue）被停用時，在它左側補一行「為什麼不能按」的原因（例：「還需要一個完整的套組才能繼續。」）；只在停用時出現，可按時 JS 加回 `.hidden` 整行清空、不留佔位（不用 `visibility:hidden` 是為了不占版面）。視覺與 `.field__hint`（欄位輔助說明）同級——刻意壓低、不與主動作按鈕搶視覺，靠右對齊、`max-width:320px` 避免長句擠壓按鈕。動機：先前主動作被擋關的原因只寫在步驟內的教練提示（如 Bundles 步驟右軌），使用者看的是 footer 那顆灰按鈕，兩者隔著整個表單、按鈕自己不解釋自己。首個消費頁：`create-project.html`（回饋套組步驟擋關時顯示 `cpp.bd.hint.blocked`）。**`.wizard__body` 表單版修飾類**（2026-07-09 自 7 個建立頁的頁內覆寫 promote）：`.wizard__body--form`（頂距 `--sp-72` 72px，取代逐頁寫死）／`.wizard__body--narrow`（1000px，create-auction/-bundle）／`.wizard__body--mid`（1140px，create-product〔2026-07-16：由 narrow→wide→mid，剛好容下多選項＋限量的逐規格表在 preview-split 表單欄完整展開，比 wide 收斂、floor≈1100〕）／`.wizard__body--wide`（1240px，create-campaign）；create-event/-project/register-ip 只掛 `--form`（維持基底 820px 寬）。已知分岔未收：funding-simulate.html（頂距 32px）、funding-test.html／create-campaign.html 內文其他覆寫（44px），仍留頁內。**`.wizard__step-head`（2026-08-04 新增）**：步驟標題列帶右側動作——`.wizard__step-head-titles`（標題＋副標成一組，靠左）與一顆動作按鈕靠右，兩者 `align-items:center` 垂直置中。**副標的下緣留白移到容器身上**（`.wizard__step-head-titles .wizard__step-sub { margin-bottom: 0 }`）：留在副標上會被算進標題組的高度，按鈕就會對齊到「含那段空白」的中線、看起來偏上。首個消費頁＝`create-event.html` 細節那一步的「切換活動類型」（switch icon＋目前類型名稱，點了把類型閘門叫回來重選；已填欄位不動、選完回到原本那一步）。此前站上 30 個 `.wizard__step-title` 全是單獨一行、右側沒有版位，這是第一個 | [shared.css](./shared.css) |
| Settings nav | 🟡 molecule | ✓ Project | Sticky local navigation inside Settings。`.settings-layout` 預設是「220px 直式導覽 ＋ 1fr 內容」；區段少、彼此平等時改用 `.settings-layout--stacked`（單欄）＋ 上方一個 **`.list-toolbar` 殼裝橫向分頁**——2026-07-31 分級設定就是這樣改的（3 段平等去處）。那個殼是必要的不是裝飾：`--underline-label` 的底線照容器下緣畫，沒有殼會變成浮在標籤下方一截無所依附的橘線（本輪第一版踩過，已作廢）。**判準**：像 settings.html 那樣 7 段以上、屬設定分類樹 → 留直式 `.settings-nav`；3 段左右、互為平行視圖 → `--stacked` ＋ `.list-toolbar` ＋ tabs | [settings.css](./ds-components/settings.css) |
| Settings row | 🟡 molecule | ✓ Project | Dense label + hint + value/control/action row | [settings.css](./ds-components/settings.css) |
| Hero slideshow | 🟠 organism | ✓ Project | Dashboard full-bleed carousel | [shared.css](./shared.css) · [hero.js](./hero.js) |
| Rent block | 🟡 molecule | ✓ Project | `.rent-block`（ip-detail hero 內的租用配置區，2026-07-25 Q31 promote）：垂直兩組，組 1＝租期（duration-chip）｜獨家（settings-row＋switch）、組 2＝費用明細（`rental-card__breakdown`）｜結算（總額＋CTA）；組內 `1.3fr 1fr`、620px 以下改單欄。取代原 280px 側欄 `.ip-hero__side > .rental-card`。 | [rent-block.css](./ds-components/rent-block.css) |
| IP hero | 🟠 organism | ✓ Project | IP detail cover + usage + rental composition（ip-detail 專用）。**2026-07-25（Q31）改兩欄 `200px minmax(0,1fr)`**：封面獨佔左欄，其餘（徽章／標題／權屬／四格事實／租用區）全走右欄；四格事實改用站上標準 `.bento > .kpi.bento--span-3`，租用改用 `.rent-block`——`.ip-hero__meta` 與 `.ip-hero__side` 已退場（shared.css 留墓碑）。封面 `.ip-hero__cover` 為品牌漸層佔位＋IP 名，加 `.ip-hero__cover-img`（`object-fit:cover`、疊在佔位上）即放真實封面圖（2026-07-25）。**專案詳情頁 2026-07-24 起改用 `.pd-hero` 版型（見 shared.css，參考 GoFundMe 募款預覽 wireframe），不再用 `.ip-hero`** | [shared.css](./shared.css) |
| IP market card cover | 🟢 atom | ✓ Project | `.ipm-card__cover`（ip-market.html 上架卡的封面，2026-07-25 由 inline 漸層 div promote）：與 `.ip-hero__cover` 同一套品牌漸層佔位（3:4），無圖時顯示佔位＋IP 名，加 `.ipm-card__cover-img` 放真實封面圖鋪滿（`object-fit:cover`），`<img>` 帶 `onerror` 自我移除→缺檔時乾淨退回佔位、不破圖。**封面一律等比滿版**（2026-07-25 使用者裁示）：全部用預設 `object-fit:cover` 鋪滿裁切，不留白、不分變體——當日一度新增的 `--contain` 變體同日退場（shared.css 留墓碑）；寬版素材裁切過頭時改換直式素材解決，不改 fit。封面圖由使用者自備放入 `images/ip/`（檔名＝IP slug）。 | [shared.css](./shared.css) |
| Funding panel | 🟡 molecule | ✓ Project | 募資概況面板（2026-07-24 promote）：已募金額＋支持人數／目標／進度條＋百分比藥丸／倒數＋募資期間／口徑註記，一個區塊講完。版型比照 ztor 公開端共創計畫詳情頁；坐在 `.ip-hero` 內＝L2 巢狀層（Q24：`--nest-surface` ＋ `--shadow-nest-up`、不加邊框）。數字一律引用收入管理 §7.3 口徑、面板不重算。**`--card` 變體**（2026-07-24）把巢狀襯底面板變成獨立有框卡（Q3 邊框、無疊色陰影），供 `.pd-hero` 當右側募資卡（此時它是 L1 卡、不在別的卡裡）。詳見 §4.91。Evidence／使用頁：project-detail `.pd-hero` | [funding-panel.css](./ds-components/funding-panel.css) |
| Rental card | 🟡 molecule | ✓ Project | Rental / bidding terms and CTA card | [shared.css](./shared.css) |
| Meta cell | 🟢 atom | ✓ Project | Compact label/value stack in dense commercial panels | [shared.css](./shared.css) |
| KV list | 🟢 atom | ✓ Project | 唯讀鍵值列（鍵左值右、逐列 hairline）：詳情頁 meta 卡、狀態摘要。值可編輯請改用 Field system；逐列 Edit 請用 Review row。`.kv--lead` 供有 `[hidden]` 條件列時手動指定群組首列；`.kv[hidden]` 已顯式歸零 display（元件為 flex，會蓋過 UA 對 hidden 的預設）。詳見 §4.50 | [kv-list.css](./ds-components/kv-list.css) |
| Stock bar | 🟢 atom | ✓ Project | 5px 細長量條（庫存水位／用量比例），必與精確數字並列；兩態＝正常 `--primary`／低於門檻 `--destructive`（`.stock-bar__fill--low`）。百分比由 consumer 以 inline `width` 提供、門檻判斷屬產品規則。比 Completeness meter 更原始（無標籤/計數表頭）。詳見 §4.51 | [stock-bar.css](./ds-components/stock-bar.css) |
| Detail rail | 🟠 organism | ✓ Project | 詳情頁兩欄殼：可編輯主欄（Tabs＋分頁）＋ sticky 唯讀 meta 右欄（1fr / 300px，≤1100px 收單欄並取消 sticky）。元件段只講殼；「何時用、右欄放什麼」見 Pillar 5 §5.1 *Detail + persistent rail*。詳見 §4.52 | [detail-rail.css](./ds-components/detail-rail.css) |
| Stock readout | 🔵 atom | ✓ Project | 唯讀數量讀數（`__num` 大數字＋`__unit` 單位/分母＋可選 Badge），用在「只能透過某個動作改變」的值——商品明細的庫存只能靠補貨增加（每筆留紀錄），做成 `.input` 會讓人以為可以打字覆蓋。不是 KPI（那是儀表列用的有框方塊，本元件是表單卡內的一行、無自有容器樣式）。詳見 §4.54 | [stock-readout.css](./ds-components/stock-readout.css) |
| Restock log | 🟡 molecule | ✓ Project | 補貨紀錄表：逐筆補貨一列、欄位各自成欄（選項組合／補貨數量／日期／供應商／狀態），數量走等寬數字方便跨列比對。外層 `.restock-log-wrap` 負責邊框、圓角與水平捲動。多選項商品掛 `.restock-log--with-option` 才開出「選項組合」欄（不掛時該欄含表頭整欄不顯示）。取代原本用 `.data-list` 把數量／日期／供應商擠成一行標題＋一行 meta 的寫法。詳見 §4.55 | [restock-log.css](./ds-components/restock-log.css) |
| Stock tip | 🟢 atom | ✓ App | E-Shop 商品清單「狀態」／「庫存」欄 hover/focus 浮出的資訊卡：多選項商品攤到單一選項組合、組合商品攤到「成員 · 選項組合」；單一選項商品顯示目前庫存一行（原本還有低庫存門檻，2026-07-23 使用者裁示移除）。列徽章為「急需補貨」時，選項清單只留真的需要補貨的項目（此規則不影響單一選項那一行）。定位由 JS 算（`position: fixed`），viewport 上半部往下開、下半部往上開，避免被 sticky 頂欄擋到或超出視窗。詳見 §4.56 | [stock-tip.css](./ds-components/stock-tip.css) |
| Nest | 🔵 atom | ✓ Project | 嵌在卡片底緣的滿版子層（左右下三邊切齊母卡外緣＋向上陰影），用於「切換模式後長出一整組設定」。層級系統只有兩層填色，L3+ 改邊框。與 `.card--muted`（卡片內單純換底色的靜態子區塊）分工不同、不可混用。詳見 §4.53 | [nest.css](./ds-components/nest.css) |
| Chart card | 🟠 organism | ✓ Project | Chart surface with title, controls, body | [chart.css](./ds-components/chart.css) |
| Rank bars / source breakdown | 🟡 molecule | ✓ Project | Ranked bar rows and source distribution legends | [chart.css](./ds-components/chart.css) |
| Tooltip | — | ◎ Default | shadcn baseline — not promoted to a project CSS file | — |
| Toast | 🟢 atom | ✓ App | 畫面底部中央的短暫確認提示（由下往上滑入）＋「未儲存/已儲存」狀態列（`.save-status`）；容器由 `js/toast.js` 於執行期建立，非靜態 markup（原行標記為未採用的 shadcn baseline，r2.2 併入外部改版後已有真實實作，2026-07-29 校正）。詳見 §4.107 | [toast.css](./ds-components/toast.css) |
| Artist picker | 🟡 molecule | ⚠ Orphan（0 consumers，2026-07-29 盤點）| 「＋ 新增藝人」流程已加入藝人清單列＋pending 邀請列，沿用 owner-lookup 搜尋殼。**CSS 與配套 `partials/artist-picker.js` 全站零消費**，未被任何頁面接上，退場候選、待使用者裁決。詳見 §4.92 | [artist-picker.css](./ds-components/artist-picker.css) |
| Benefit matrix | 🟠 organism | ✓ App | 權益比較矩陣：一份權益目錄（列）× 四個粉絲分級（欄），取代舊版四張獨立分級卡。詳見 §4.93 | [benefit-matrix.css](./ds-components/benefit-matrix.css) |
| Tier overview | 🟡 molecule | ✓ App | 分級對照表（唯讀）：四個分級並排成欄、每列一個比較項目（門檻／人數／權益）。是 Benefit matrix 的唯讀對照版——矩陣負責改，這支負責看。詳見 §4.93b | [tier-overview.css](./ds-components/tier-overview.css) |
| Brand card | 🟡 molecule | ✓ App | 品牌合作目錄卡：唯讀鎖住的 Ztor↔品牌條款（`.brand-deal`）＋創作者可編輯的活動區分開陳列。詳見 §4.94 | [brand-card.css](./ds-components/brand-card.css) |
| Chart tip | 🟡 molecule | ✓ App | 折線圖滑過浮層與熱區，點擊開明細；硬依賴 chart.css。`earnings-sony.html` 仍留一份同名內嵌複本未收斂。詳見 §4.95 | [chart-tip.css](./ds-components/chart-tip.css) |
| Checkbox | 🟢 atom | ✓ App | 全站自繪 checkbox（含 indeterminate），取代原生方塊；port 自既有統一設計系統。詳見 §4.96 | [checkbox.css](./ds-components/checkbox.css) |
| Detail sheet | 🟠 organism | ✓ App | 清單頁點列開細節頁的全螢幕 iframe 覆蓋層，取代整頁導航；10 頁共用，全站範圍最廣的元件之一。詳見 §4.97 | [detail-sheet.css](./ds-components/detail-sheet.css) |
| Explainer | 🟡 molecule | ✓ App | 欄位旁 info 圖示開正式說明彈窗，取代重複提示。`media-vault.html` 有 `<link>`/`<script>` 卻零實際用例（死引用）。詳見 §4.98 | [explainer.css](./ds-components/explainer.css) |
| Fans guide | 🟠 organism | ✓ App | 「粉絲經營怎麼玩」整頁式說明，四幕各自用自己真實資料形狀呈現。詳見 §4.99 | [fans-guide.css](./ds-components/fans-guide.css) |
| Inline edit | — | ✝ Tombstone（0 consumers，刻意留空）| 空檔，僅存一段棄用註解；`shared.css` 已內建等效行為，全站未曾 `<link>` 過。詳見 §4.100 | [inline-edit.css](./ds-components/inline-edit.css) |
| Manage IP | 🟡 molecule | ✓ SiteSpecific | 「管理我的 IP」頁專屬版面補丁（狀態徽章列／驗證橫幅／授權範圍 chip／定價預覽／刪除確認），元件本身沿用既有 ds-components。詳見 §4.101 | [manage-ip.css](./ds-components/manage-ip.css) |
| Media vault | 🟠 organism | ✓ App | 加密媒體庫：門條（解鎖條件＋觸及讀數）＋圖片/影片/音檔三種原生內容分區。詳見 §4.102 | [media-vault.css](./ds-components/media-vault.css) |
| Perf rank | 🟡 molecule | ✓ App | 「表現排行」統一列語法，給 8–11 列的長排行榜用；`.rank-bar` 仍留給 4–6 列的佔比場景。詳見 §4.103 | [perf-rank.css](./ds-components/perf-rank.css) |
| Sortable | 🟡 molecule | ✓ App | 全站表格排序互動：欄位標題包成按鈕，靜止態與純文字標題一致。`tier-benefits.html` 有 `<link>` 卻零實際用例（死引用）。詳見 §4.104 | [sortable.css](./ds-components/sortable.css) |
| Numeric stepper | 🟢 atom | ✓ App | 數字輸入框的上下增減鈕，取代原生 spin button；與既有「Stepper」（本表上方，wizard 進度圓圈）為不同元件，勿混淆。詳見 §4.105 | [stepper.css](./ds-components/stepper.css) |
| Sticky actions | 🟡 molecule | ✓ App | 頂部 CTA 捲出畫面後在底部浮現複製版動作列；全站消費最廣的元件之一（15 頁）。詳見 §4.106 | [sticky-actions.css](./ds-components/sticky-actions.css) |
| Vault share | 🟠 organism | ✓ App | 媒體庫的加密連結／NFC 鑰匙發放面板，住在 drawer 裡；送禮與 NFC 商品共用同一個物件。詳見 §4.108 | [vault-share.css](./ds-components/vault-share.css) |
| Wizard split | 🟠 organism | ✓ App | 精靈流程的「內容欄＋貼頂摘要側欄」兩欄版面，供 create-project 兩步共用。詳見 §4.109 | [wizard-split.css](./ds-components/wizard-split.css) |
| Zselect | 🟡 molecule | ✓ App | 自製下拉選單，取代無法被樣式化的原生 `<select>` 展開清單；全站消費最廣的元件（19 頁）。詳見 §4.110 | [zselect.css](./ds-components/zselect.css) |

### 4.2 Button

**`_layer`** · atom — Primary action control; solid highlighter-orange CTA, neutral outline, and quiet ghost for low-emphasis actions.

**Anatomy**

```
┌──────────────────────────────┐
│  [icon]   Label   [→]         │   ← inline-flex, 8px gap
└──────────────────────────────┘
   icon/arrow each own flex child
```

**Variants** — `.btn` 是全站唯一的按鈕（**2026-07-21 起**：原本並存的 docs/canonical 家族 `.ztor-btn` 已退場，見下方沿革）。`.btn` with `.btn--primary` (orange), `.btn--outline` (white surface + 1px `--border` hairline, flat — no shadow; 2026-06-12), `.btn--ghost` (transparent → tints on hover), `.btn--soft` (resting grey fill, no border — quiet secondary like toolbar Export).

**Sizes** — 高度一律取 `--control-h-*` 刻度（與 input 同一套；2026-07-21 Q25 起 input 也真的吃這套、不再 padding 撐開）。`.btn` default **36px** (`--control-h-sm`, 13px font) / `--sm` **28px** (`--control-h-xs`, 12px font) / `--lg` **44px** (`--control-h-md`, 14px font). Vertical padding is dropped and the label is vertically centred (`align-items:center`); `box-sizing:border-box` keeps the outline variant's 1px border inside the same height, so every variant lands exactly on its token height. (2026-07-03: replaced the old padding-driven 37.5 / 27.5px fractional heights.)

**Split button** (🟡 molecule) — a `.btn--primary` main action joined to a caret `<summary>` that opens a `.dropdown__menu` of related actions; composes Button + Dropdown. Main label is context-aware and follows the active tab (E-Shop F3, D066). Shown in the §4.2 rendered-preview gallery (context columns: Products / Bundles / Auctions). Full inventory entry above; CSS [`split-button.css`](./ds-components/split-button.css).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | bg `--primary`, text `--primary-foreground`, hairline `0 0 0 1px rgba(23,23,23,0.12)` |
| hover | `:hover` | bg `--primary-hover`; outline tints to `--muted`; ghost gets `color-mix(--foreground 6%)` fill |
| focus | `:focus-visible` | `outline: 2px solid var(--ring)`, offset 2px |
| disabled | `:disabled` / `[aria-disabled="true"]` | 非填色變體（ghost／outline／soft／icon）：`opacity: 0.45`、`pointer-events: none`<br>填色變體（`--primary`／`--destructive`）**改灰底灰字**（2026-08-04，Q50）：`background: var(--muted)`、`color: var(--muted-foreground)`、`border-color: var(--border)`、`opacity: 1`、`cursor: not-allowed`——把品牌橘調暗只會變成「暗一點的橘」，讀起來像另一種可按狀態；灰是站上唯一表示不可用的顏色，與 Input 的 disabled（`--muted` 底）同一套語彙 |

**Class API** (CSS classes — Props/API = N/A, this is a static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.btn` + `.btn--primary` | Product-density orange CTA |
| `.btn--outline` | White surface + 1px `--border` hairline，平面無陰影；padding −1px 補償保持尺寸（2026-06-12 取代「填色當邊」與多餘陰影） |
| `.btn--ghost` | Transparent, muted text; tints on hover |
| `.btn--ghost.btn--destructive` | Ghost + `--destructive` red text; hover tints red 10%. Compound（綁 `.btn--ghost`，不獨立成 `.btn--destructive`）防止誤掛在 `.btn--primary` 上做出紅色主按鈕；用於編輯態刪除（create-product / create-auction footer，完整確認 modal 待規格）。2026-07-09 自兩頁頁內樣式 promote |
| `.btn--soft` | Resting grey fill (`--foreground` 6% on surface), no border; quiet always-visible secondary（2026-06-12） |
| `.btn--sm` / `.btn--lg` | Compact 28px (`--control-h-xs`) / large 44px (`--control-h-md`); default `.btn` = 36px (`--control-h-sm`) |
| `.btn--block` | `width: 100%`——按鈕撐滿容器。用在只有單一動作的窄欄位（側欄卡片 CTA、對話框動作區、認證表單）。2026-08-10 promote：站上原本有十多處各寫各的 `style="width:100%"`，新寫的請改用這個 class，不要再寫行內樣式 |
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

> **`--icon-circle` 的底色有面向假設**：預設 `--muted` 底＋`--muted-foreground` 圖示，這組值假設鈕坐在 `--card`（#212223）之類的亮面上。坐到 `--surface-page`（#0C0D0D，全站最暗）時 `--muted`（#161718）與底只差一階、整顆會消失。這種情境要在消費端 scope 提亮，別改元件預設。已知案例：建立專案閘門的 `.wizard__gate-close`（2026-07-26 使用者反饋「太暗」，改 `--card` 底＋1px `--border`＋`--foreground-muted` 圖示，見 shared.css）；composer 的送出鈕坐在卡片上，不受影響。

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
| `.badge--orange` | `color-mix(--primary 16%, surface)` + `--primary` text (same soft-tag recipe as the status variants; 2026-07-24 fixed from 30% tint + `--primary-foreground` dark text) |
| `.badge--success` / `--error` / `--info` / `--accent` | Tinted soft tag, text = matching hue (`--accent` = purple `--status-accent`; `--error` = `--status-error`, **not** `--destructive`, since 2026-07-21) |
| `.badge--warning` | 22% warning tint; text = `color-mix(--status-warning 60%, --foreground)` (hue too light for direct text; 2026-07-16 對比優化 18→22% tint、50→60% text，text 與 checkin-stat 黃一致) — added 2026-06-11 |
| `.badge--neutral` | `--muted` background |
| `.ztor-badge` (+ `--success`/`--error`/`--info`/`--warning`) | Compact docs badge with status tints |
| `.ztor-metric-pill` / `.ztor-metric-pill__icon` | Inline metric pill + 14px glyph |

**Token usage** (→ Pillar 2 Role)

- bg `--muted` + `color-mix` of `--status-success` / `--status-error` / `--status-info` / `--status-accent` / `--primary` against `--card` (tints track light/dark automatically) · text = matching hue tokens (`--status-*` / `--primary` for orange) or darkened for warning / `--foreground-muted` for neutral · radius `--radius-md` (badge) / `--radius` (ztor-badge) · font `--font-ui` · **no box-shadow**

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

- color `--status-success` / `--status-error` / `--status-info` / `--status-warning` / `--foreground` (black variant) · fill via `currentColor` · radius `--radius-pill`

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

**Variants** — Base `.chip`, `.chip--active` (inverted), `.chip--static` (read-only, no hover), `.chip--value` (quiet fill for a creator-entered value, 2026-07-21). Container `.chip-group`; row wrapper `.filter-row` + `.filter-row__actions`.

**Sizes** — Single size (6 × 12px padding, 12px / 500).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | bg `--card`, text `--foreground-muted`, `1px solid --border`, `--radius-pill` |
| hover | `:hover` | bg `--muted`, text `--foreground` |
| active | `.chip--active` | bg `--selected-surface`, text `--selected-ink`, border `--primary` @45% (hover deepens to `--selected-surface-hover`) — 2026-07-27 Q8-A，原反白黑底作廢 |
| static | `.chip--static` | `cursor: default`, hover reverts to default look |
| value | `.chip--value` | bg `--input-surface`, text `--foreground`, border `--border` (hover unchanged — it is entered data, not a control) |

**Class API** (CSS classes — Props/API = N/A, this is a static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.chip-group` | inline-flex wrap container, 6px gap |
| `.chip-group--loose` | 2026-08-09 promoted from `create-event.html`（原 `.ce-lineup`）：一列陣容／參演者 chip 的容器，比預設 `.chip-group` 寬鬆——`display:flex`（非 inline-flex）、更大間距（8px）、底部留白（12px），用於表單裡自成一段的可移除 chip 清單 |
| `.chip` | Interactive filter pill |
| `.chip--active` | Selected state — brand-orange tint (Q8-A, 2026-07-27) |
| `.chip--static` | Read-only chip (e.g. supported-regions list) |
| `.chip--value` | A value the creator just entered — quiet fill, never inverted. Distinct from `.chip--active` (a chosen filter) and from `.tag-input .chip--active` (an applied tag, orange per Q19). **⚠ 零消費（2026-07-21）**：唯一消費者是建立商品的選項值，同日改成逐值 `.input`（見 Variant builder 條目）後這個變體失去用途，只剩 DS 頁 demo。**退場候選、待使用者裁決**，未經確認前不移除 |
| `.chip__count` | Faded count after a vertical separator |
| `.chip--removable` / `.chip__remove` | Selected / creator-added value with an inline × (tag-input、商品標籤、電影關聯 film-picker、取貨場次多選、**建立活動「加入商品」清單**（`.chip-group` ＋ `.chip--removable`，價格併進 chip 文字不另立一欄，2026-08-09）；2026-07-21 起不再用於選項值) |
| `.filter-row` / `.filter-row__actions` | Chip-group paired with right-aligned actions. The chip-group half is **optional**：低頻篩選收成 `.select` 時，整條列只留 `__actions`（放 select／`.field-pill` 搜尋），內容左靠（Projects 2026-07-23 起即此形） |

**Token usage** (→ Pillar 2 Role)

- bg `--card` / `--muted` · active bg `--selected-surface`, text `--selected-ink` · `--value` bg `--input-surface`, text `--foreground` · text `--foreground-muted` → `--foreground` · count `--muted-foreground` · border `--border` · radius `--radius-pill` · motion `--duration` / `--easing` · font `--font-ui`

**Usage** — Use for filterable taxonomies (Earnings transaction filters, Tax-docs year filter). Avoid for read-only status — use Badge (§4.3).

**Do & Don't**

- ✅ Do keep exactly one `.chip--active` per group at a time.
- ✅ Do use `.chip--static` when a chip is informational, not a filter.
- ✅ Do use `.chip--value` for values the creator just typed in; keep them quieter than the surrounding controls.
- ❌ Don't use a chip to display non-filterable status.
- ❌ Don't use `.chip--active` (orange tint) for a creator-entered value — the orange selected state is reserved for a chosen filter.
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
locked  ◖ ⊘  ●◗   .switch--locked  (any state, dimmed, not-allowed cursor)
```

**Variants** — `.switch` (off) and `.switch.switch--on` (on); `.switch--locked` stacks on either as a stopgap modifier (compliance/source-locked, e.g. `.switch.switch--on.switch--locked`).

**Sizes** — Single size (36 × 20px track, 16 × 16 knob).

**States**

| State | Selector | Change |
|---|---|---|
| default (off) | `.switch` | track `--muted`, ring `1px --border`, knob `--card` left:2px |
| checked (on) | `.switch--on` | track `--primary`, ring `rgba(23,23,23,0.12)`, knob `--primary-foreground` left:18px |
| locked | `.switch--locked` | `cursor: not-allowed`, `opacity: .65` — stacks on top of the off/on visual, does not replace it |

No separate hover/focus styling in CSS (state toggled via the `--on` class).

**Class API** (CSS classes — Props/API = N/A, this is a static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.switch` | Off track + knob (knob is `::after`) |
| `.switch--on` | On state: orange track + knob slid right |
| `.switch--locked` | Compliance/source-locked stopgap: `cursor: not-allowed` + `opacity: .65` on top of whatever on/off state it's paired with. **2026-08-09 promoted from `notification-matrix.css`** — it used to live only in that file, but `tier-settings.html` and `create-event.html` link `switch.css` without `notification-matrix.css`, so a switch there could carry the class and get zero visual change (JS still blocked the click, but nothing *looked* disabled). All three consumers now link `switch.css`, so the lock lives where every consumer already reaches it |

**Token usage** (→ Pillar 2 Role)

- off track `--muted`, ring `--border` · on track `--primary` · knob `--card` (off) / `--primary-foreground` (on) · radius `--radius-pill` · knob motion `left 150ms ease`, track `--duration` / `--easing`
- locked: no new tokens — reuses `opacity` + `cursor`, layered over the existing off/on token set

**Usage** — Use for immediate-apply binary settings (notifications, privacy, auto-payout, product/marketplace visibility). Avoid where a Save step is required — use a checkbox/form control instead. Use `.switch--locked` when the value is fixed by policy or by an upstream data source and the page's own JS already blocks the click (`classList.contains("switch--locked")` guard) — the class only supplies the "this can't be changed" visual, it does not itself prevent interaction.

**Do & Don't**

- ✅ Do label what "on" means next to the switch.
- ❌ Don't use a switch for actions that need confirmation.
- ✅ Do pair `.switch--locked` with the page's own click-guard — the class is cosmetic only.
- ❌ Don't reintroduce a second "locked switch" look in a page-local stylesheet — one component, one lock visual (Settings compliance channels, Tier settings, and create-event's bookyay-imported "go on sale immediately" toggle all share this one).

**Code example**

```html
<button class="switch switch--on" role="switch" aria-checked="true" aria-label="Auto-payout"></button>
<button class="switch switch--on switch--locked" role="switch" aria-checked="true" aria-disabled="true" aria-label="Payout confirmation email (required)"></button>
```

**CSS** — [`switch.css`](./ds-components/switch.css)

---

### 4.7 Info banner

**`_layer`** · atom — Neutral contextual information banner with a leading `info` icon. It explains a rule, timing, limitation, or next step without giving it warning priority.

**Anatomy**

The banner contains a Tabler `info` icon (`.info-banner__icon`) followed by the explanatory text. Use `<strong>` only for the clause people need to scan first.

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
| `.info-banner__icon` | Leading Tabler `info` icon, 20px desktop / 18px mobile |

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
│   Portrait 750 × 1125                   │ └ .upload-tile__hint
└╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌┘
```

**Variants**

| Variant | Class | Use |
|---|---|---|
| Base | `.upload-tile` | 虛線點擊／投放格（min-height 96px） |
| Portrait | `.upload-tile--portrait` | **直式圖片槽的唯一形狀**（2:3），一律配 `.upload-assets--fill` |
| File | `.upload-tile--file` | 檔案投放列（數位下載檔、證書；110px） |
| Video | `.upload-tile--video` | 影片投放格（16:9 等比、容器 2/3 寬；2026-08-10 使用者裁決：站上影片上傳只有這一套，default 與 hover 吃基底，與直式圖片格同一種手感） |
| Landscape | `.upload-tile--16x9` | 橫式媒體槽（project-detail 的 Demo 影片／音樂），非圖片上傳 |
| ~~Hero~~ | ~~`.upload-tile--hero`~~ | **已退場（2026-08-09）**，見下方墓碑 |

**Layout helper** — 直式圖片槽只有一套：`.upload-assets` ＋ `.upload-assets--fill`（2026-08-09 使用者裁決「直式上傳圖只用一套元件與一套排版規則」）。`.upload-assets` 是底：flex-wrap 的素材槽列，格子大小由固定高度 `--upload-asset-h`（200px，≤640px 收 148px）推導。`.upload-assets--fill` 反過來，由「一排放幾格剛好撐滿容器」推導：`--upload-asset-cols`（預設 4）把容器寬度平分給那幾格、高度由 `--portrait` 的比例推出，所以四格永遠撐滿一整列、第五格換行且尺寸相同，容器變寬變窄等比縮放（≤640px 降為一排兩格）。**退場（同日）**：`.upload-grid`／`--2x2`、`.upload-showcase`／`--stacked`、`.upload-tile--hero`——「主圖大格＋附圖列」整個模型收掉，主圖改由 `.upload-tile__flag` 自報身分。詳見下方墓碑段。

> 為什麼不用 grid `1fr`＋`aspect-ratio`（`.upload-assets` 底層採固定高度推寬度、`--fill` 採 flex 平分寬度，兩者都刻意避開 grid）：grid `1fr` 的最小尺寸是 auto，格子帶了 `aspect-ratio` 之後，瀏覽器會拿比例換算出的內容尺寸回頭撐開欄寬，四格互相拉扯就整排衝出容器（2026-07-24 create-project Showcase 溢出的成因）。固定高度沒有這條回饋迴路。

> **2026-07-31 全站比例收斂**：圖片上傳槽的比例由單一 CSS 變數 `--upload-img-ratio`（`var(--img-portrait, 2 / 3)`，Foundation 來源 `_tokens.css` 的 `--img-portrait`，≈0.667，`upload-tile.css:35`）供應，`--hero`、`.upload-grid .upload-tile`、`--portrait` 修飾詞皆讀它——這是使用者裁決，取代原本「縮圖 1:1／直式海報 3:4／橫幅 16:9／相簿 3:2」四套並存的模型（見 STYLE-DECISIONS 已裁決條目、ASSUMPTIONS 產品變更提案）。原本的形狀修飾詞 `--1x1`／`--3x4`／`--3x2` 已從圖片槽退場、CSS 宣告本日一併刪除；`--16x9` 仍服役，用途擴大為「project-detail 的 Demo 影片／音樂**檔案**槽」＋「活動（Events）唯一保留的橫式橫幅**圖片**槽」，兩者皆不受本次直式比例收斂規範。
>
> **同日第二輪（D164 落地）：具名槽位數量隨比例收斂**——槽名與形狀分離後，多格同源素材不再有意義：建立項目（縮圖／直式海報／橫式橫幅／圖庫 4 格）併為**主視覺＋圖庫** 2 格；建立活動併為**主視覺＋橫幅＋圖庫** 3 格（必填數 4→3）；編輯活動具名槽同步收斂為 2 格＋圖庫列。詳見 §4.15 demo 與 `documents/decisions.md` D164。

**States**

| State | Selector | Change |
|---|---|---|
| default | — | 1.5px dashed `--border`, radius `--radius-md`, text `--muted-foreground` |
| hover | `:hover` | border → `--muted-foreground`, bg → `--muted`；**還沒填的格子邊框同時收細成 `.5px`**（2026-08-09 使用者指示：hover 已經有底色在說「可以點」，邊框不必再加粗宣示）。已填的格子是實線邊，粗細不動 |

**Class API**

| Class / modifier | Effect |
|---|---|
| `.upload-tile` | 虛線上傳格（flex column 置中） |
| `.upload-tile--file` | 檔案投放列尺寸變體（min-height 110px） |
| `.upload-tile--video` | 影片投放格（`aspect-ratio:16/9`、`width:66.6667%`；≤640px 轉滿版）。消費頁：create-event／create-project／project-detail／publish-work（兩處） |
| ~~`.upload-tile--hero`~~ | **已退場（2026-08-09）**：主圖大格連同它的圓角晶片圖示框（Q18）一起收掉，直式圖片槽全部同尺寸 |
| `.upload-tile__icon` / `__title` / `__hint` | registered Tabler icon／主文案（`--foreground` 500）／限制說明；不用文字 `＋` 或自製 SVG |
| `.upload-tile.is-filled` | 已選檔狀態（非互動）：實線邊框（`border-style: solid`，取代空狀態的 dashed）＋中性 `--border`／`--foreground` 文字（含 `__title`）。**2026-08-09 使用者裁決「不該有這種綠框元件」，撤除 `--status-success` 綠**——已填／未填改由邊框樣式（實線 vs 虛線）辨別，不再靠顏色，與下方 `[data-upload].is-filled` 互動格既有的中性配方（`border-color: var(--border)`／`color: var(--foreground)`）對齊，統一成同一套「已填」語彙。create-auction／create-event／register-ip 的 toggle 共用（2026-06-16 promote 自頁內） |
| `.upload-grid` | 4 欄縮圖 grid（gap 10px） |
| `.upload-grid--2x2` | 縮圖 grid 改 2 欄（並排 showcase 用） |
| ~~`.upload-showcase`／`--stacked`~~ | **已退場（2026-08-09）**：主圖＋縮圖格的並排／堆疊版面，被 `.upload-assets--fill` 取代 |
| ~~`.upload-grid`／`--2x2`~~ | **已退場（2026-08-09）**：4 欄／2 欄縮圖列，被 `.upload-assets--fill` 取代 |
| `.upload-assets` | 具名素材槽列：flex-wrap，格子高度＝`--upload-asset-h`（200px／≤640px 148px）、寬度由 `--portrait` 推導。**槽位組合（D164）**：建立項目＝主視覺＋圖庫（2 格）；建立活動＝主視覺＋橫幅＋圖庫（3 格，橫幅走 `--16x9`） |
| `.upload-assets--fill`（`--upload-asset-cols`） | 撐滿容器的變體（2026-08-09，建立商品素材列）：`flex-wrap: wrap`＋`align-items: flex-start`＋`width: 100%`，格子 `flex: 0 0 calc((100% - var(--sp-12) * (cols - 1)) / cols)`／`height: auto`，高度改由 `--portrait` 推導。`--upload-asset-cols` 預設 4＝四格撐滿一整列、第五格換行同尺寸；≤640px 降為 2。`width: 100%` 不可省——格子帶 `min-width: 0`，這一列自己當 flex 子項時（如 DS 頁的 `.demo`）會被壓成窄帶 |
| `--upload-img-ratio` | 圖片上傳槽比例的單一來源，值為 `var(--img-portrait, 2 / 3)`（Foundation token `--img-portrait` 定義於 `_tokens.css`，見 Pillar 1 §1.3；`upload-tile.css:35`，2026-07-31 使用者裁決）。`--hero`、`.upload-grid .upload-tile`、`.upload-tile--portrait` 皆讀它 |
| `.upload-tile--portrait` | 圖片上傳槽的唯一形狀修飾詞，讀 `--upload-img-ratio`。只在有確定高度的容器（如 `.upload-assets`）內使用，別加在 grid `1fr` 的格子上 |
| ~~`.upload-tile--1x1` / `--3x4` / `--3x2`~~ | **已退場（2026-07-31）**：舊多比例模型的形狀修飾詞，CSS 宣告已刪除（唯一消費者是 design-system.html 示範卡，本輪已改用 `--portrait`）；不得再用於新的圖片上傳槽 |
| `.upload-tile--16x9` | 服役範圍擴大（2026-07-31）：project-detail 的 Demo 影片／音樂**檔案**槽＋活動（Events）唯一保留的橫式橫幅**圖片**槽（create-event／edit-event，1920×1080，D164）。兩者皆不受本次直式比例收斂規範；其他模組不得比照新增橫式圖片槽 |
| `.upload-tile__flag` | 靜態語意標記（如相簿第一格的「封面」、建立商品素材列第一格的「主圖」）。**互動格要等圖進來才掛**（2026-08-09 使用者指示，`[data-upload]:not(.is-filled):not(.is-optimized)` 收起）——空格子還沒有內容可以被稱作「主圖」，上傳中格子又被浮層蓋著，標籤浮在進度上只是噪音；手刻的已填格不受影響，2026-07-31 由 `shared.css` 的 `.pd-gallery__badge` 搬入元件層；與 `__badge`（AI 優化完成狀態、JS 產生）角色不同，刻意不同名。**同格兩者並存時**（建立商品主圖格：既掛 `__flag`、又開 `data-upload-ai`）`__badge` 讓到下緣（`.upload-tile:has(.upload-tile__flag) .upload-tile__badge`）——單排素材格只有約 126px 寬，左右並排仍會撞上，而下緣在優化完成時是空的（進度條只在上傳中出現） |
| `[data-upload-reveal]`（容器層） | 逐格顯示（2026-08-09，`partials/upload-tile.js` 的 `initReveal`）：容器內一次只露出一個空格，填滿目前這格才顯示下一格；把中間某格清空，後面的空格縮回去、該格自己變成那個開放的槽。用於「張數有上限、格子預先寫在 HTML」的素材列（建立商品：主圖 1＋附圖 4），格子各自的 `data-cp-asset`／`data-upload-ai` 原樣保留。與 publish-work 劇照那種「張數不設限、末格填滿就 append 一格」互補：那邊是長格子，這邊是既有格子的顯隱 |
| `.upload-tile-aside`（`__side`） | **2026-08-09 promote 自 `create-event.html` 頁內 `.ce-timg`**：直式上傳格＋右側一句說明並排，用於彈窗裡「現在用的是哪張圖」這類小面板——左邊固定寬（104px）的 `.upload-tile`，右邊 `.upload-tile-aside__side` 縱向堆疊說明文字與動作鈕 |
| `.upload-tile-aside--stacked` | 直排變體（2026-08-09，同日第二輪）：`.upload-tile-aside` 改上下堆疊（格子在上、說明在下，格子寬度改滿版），供窄欄用——並排版假設橫向有空間，放進窄欄（如 [Payout §4.61](#payout) 彈窗 `.payout-dialog__split` 那條 200px 側欄）會把說明擠成一行三、四個字的長條 |
| `data-upload-src` / `data-upload-key` | 編輯態預填屬性：`data-upload-src="<url>"` 讓格子初始直接進 `.is-filled` 並掛上該圖，跳過假上傳計時；`data-upload-key` 供 `upload:change` 事件的 `detail.key` 識別（沒有則退回既有的 `data-cp-asset`） |
| `[data-upload]`（互動上傳格） | opt-in 開啟互動上傳（`partials/upload-tile.js` 增強）。狀態：`.is-empty`（hover 現 `__sub`/`__hint` 更多資訊；**2026-08-09 起用 `display` 收放而非 `opacity`**——原本靠透明度藏、說明文字仍佔著位置，靜止態的圖示與標題被那塊空白往上推，看起來沒置中。改成不佔位之後靜止態與 hover 態各自依自己的內容高度置中，代價是 hover 時有一次版面變動，使用者裁示接受）→ `.is-uploading`（`__thumb`＋frosted `__overlay`＋`__progress`/`__bar`，假走 ~2.5s）→ `.is-filled`（`__thumb` 鋪滿；hover `__actions`：替換/刪除，站上標準 2 鈕）→ `.is-optimizing`/`.is-optimized`（`__badge`「已依規格優化」，只在掛 `data-upload-ai` 時才多出這顆鈕；**2026-08-09 起優化可反悔**——優化完成後第三顆鈕換成「還原成優化前」〔`__act--undo`，`rotate-ccw`〕，按下回到 `.is-filled`。兩顆互斥、同一個位置換一顆，因為優化與還原是同一個決定的正反面。原型的優化本來就沒真的改動圖檔，所以還原只是切狀態；真實實作要保留優化前的原檔）。就緒仍走 `upload:change` 事件（`detail: {key, filled}`，bubbles）。**AI 優化＝假動作＋產品變更提案（ASSUMPTIONS UIA-037，上游無此功能）**。**鍵盤可及性（2026-07-31）**：空狀態掛 `role="button"`＋`tabindex="0"`（填圖後拿掉，改由動作列兩顆真 `<button>` 進 tab 序）；Enter／Space 觸發同點擊（Space 不捲頁）；焦點環＝站上標準 `outline: 2px solid var(--ring)`；上傳／優化／刪除完成後把焦點交還（僅鍵盤觸發的互動才生效）。**沒有 `__title` 時的標籤退路依模式分兩種**（2026-08-07）：圖片格 `cp.media.add`（新增圖片）、內容檔格 `cp.cfile.add`（新增檔案）——影音／字幕格套「新增圖片」會誤導螢幕閱讀器使用者。要更精確的說法（「上傳預告片」）由消費頁自己寫 `aria-label` ＋ `data-i18n-aria-label`，元件會讓路 |
| `.upload-tile__thumb` / `__overlay` / `__spinner` / `__progress` / `__bar` / `__actions` / `__act`(`--ai` / `--undo`) / `__badge` | 互動上傳格的注入子元素（縮圖／進行中罩／spinner／進度條／hover 動作／AI 優化與還原／AI 優化徽章）；全 token 驅動，罩用 `color-mix(--foreground/--card)` 主題自適應。`__actions` 必須帶 `border-radius: inherit`（2026-08-09 修）——它的 `backdrop-filter` 會自己開一個裁切脈絡，父層的 `overflow: hidden` ＋圓角管不到它，hover 一浮出來整格就變直角 |
| `[data-upload="content"]`（內容檔模式） | 內容檔（音樂/影片/檔案，§4.2 F11）：上傳後可**播放**（音訊/影片，真實 `<audio>`/`<video>`）與刪除，操作比照顯示圖、**無 AI**。影片顯示影格（`.upload-tile__video`）、音訊/檔案顯示檔型圖示＋檔名（`.upload-tile__filemark`/`__filename`）；動作＝`__act--play`（播放/暫停切換）＋替換＋刪除；`accept` 由頁面以 `data-upload-accept` 指定（音樂→`audio/*`、影視→`video/*`）。`.upload-tile--playable` 才顯示播放鈕。呈現層 demo（不真上傳） |

**Token usage** (→ Pillar 2 Role)

- border `--border`(dashed) · radius `--radius-md` · text `--muted-foreground` / title `--foreground` · hover bg `--muted`
- 互動態：進度/徽章/AI 強調 `--primary`(+`--primary-foreground`) · 進行中罩 `color-mix(--card 82%)` · hover 動作罩 `color-mix(--foreground 42%)` · 動作鈕 `--card`/`--shadow-card`

**Usage** — 建立流程的上傳入口。限制（最小尺寸／檔型）一律寫進 `__hint`，不留光禿格。一般空狀態用 `empty-stub`，不用這個。需要真正「選圖→上傳→hover 動作」時加 `[data-upload]`（見 create-product「Show it off」），並在頁面監聽 `upload:change` 更新就緒。

**Do & Don't**

- ✅ Do 在 `__hint` 標明限制（750 × 1125 直式／檔型清單）。
- ✅ Do 直式圖片槽一律 `.upload-tile--portrait` 裝在 `.upload-assets.upload-assets--fill` 裡；主圖用 `__flag` 標身分，不靠尺寸。
- ✅ Do 想要「填滿才長出下一格」時，在容器加 `[data-upload-reveal]`。
- ❌ Don't 用 `--hero`／`.upload-grid`／`.upload-showcase`（2026-08-09 已退場，見上方 Class API 與 CSS 檔尾墓碑）。
- ❌ Don't 當一般空狀態容器（那是 `empty-stub`）。
- ❌ Don't 改實線或填色——虛線就是可上傳的訊號。

**Code example**

```html
<div class="upload-assets upload-assets--fill" data-upload-reveal>
  <div class="upload-tile upload-tile--portrait" data-upload>
    <span class="upload-tile__flag">主圖</span>
    <span class="upload-tile__icon"><i data-lucide="image" class="ztor-icon ztor-icon--md"></i></span>
    <span class="upload-tile__title">新增圖片</span>
    <span class="upload-tile__hint">直式 750 × 1125</span>
  </div>
  <!-- 其餘 4 格同樣寫法，各自帶 hidden，前一格填滿才顯示 -->
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

**Variants** — `.input` (line field), `.input--with-prefix` (extra left padding for a leading glyph), `.textarea` (multi-line, vertical resize), `.select` (native select, custom chevron, no OS arrow), `.select--bare` (2026-07-26: no border/fill, for a select sitting directly on the page/toolbar — not inside any card/section — see below), `.select--with-prefix` (2026-08-01: select 版的前置圖示左內距——先前只有 `.input` 有，select 想放圖示只能在外面包一層方框，結果是框中框；zselect 會把原 select 的 class 原封搬到觸發鈕，所以這個 modifier 對兩者都成立).

**Sizes** — Single size only across all three (no sm/lg/xl size variants — that ladder existed only in the deleted `.ztor-input` replica, never in the real component).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | bg `--card`, `0 0 0 1px var(--border)` shadow edge, text `--foreground` |
| focus | `:focus` | `outline: none`; `0 0 0 1px var(--ring)` + `0 0 0 4px color-mix(in srgb, var(--ring) 15%, transparent)` soft glow |
| disabled | `:disabled` | **透明底**、文字 `--locked-field-ink`、`cursor:not-allowed`、`opacity 1`（**2026-08-09 使用者裁示「整個元件庫只能有一個 disabled 樣子」收斂**：原本 `--muted` 填底＋`--foreground-muted` 字＋`opacity .75`，坐在卡片上會變成一塊比卡片還深的方塊；改成透明底之後欄位直接吃它所坐的那個面，全站僅此一種 disabled 呈現——來源鎖定欄位〔見 [Field source tag §4.121](#field-source-tag)〕不再自訂另一種）；鎖定欄位唯讀呈現（建立後固定不可編輯，D137，如商品細節頁的主分類 disabled select） |
| `.select--bare` default | — | 無邊框無填色（`box-shadow:none`、`background:transparent`）、pill 圓角、`--foreground-muted` 文字、`--fs-12`／`--fw-medium`（比照同列 `.filter-tabs__item`） |
| `.select--bare` hover | `:hover` | 浮出 `--muted` 底、文字轉 `--foreground` |

**狀態缺口** — `aria-invalid`（錯誤 ring）樣式尚未在 `input.css` 實作；design-system.html 不示範，待補。（`:disabled` 已於 2026-07-16 補上，見上表）

**Class API** (CSS classes — Props/API = N/A, this is a static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.input` | Single-line field |
| `.input--with-prefix` | Extra left padding (`--sp-32`) for a leading glyph (currency, unit) |
| `.select--with-prefix` | 同上，select 版（2026-08-01） |
| `.control-prefix` / `.control-prefix__icon` | 前置圖示的定位殼（2026-08-01 收成元件；先前只在 DS 頁用 inline style 拼過一次）。殼負責 `position: relative`，圖示絕對定位在左側 `--sp-12`、`pointer-events: none`——點下去要進到控件本身 |
| `.textarea` | Multi-line field, vertical resize, min-height 100px |
| `.select` | Native `<select>`, OS arrow dropped; pair with `.select-wrap` + `.select-wrap__icon` for a registered Tabler chevron |
| `.select--bare` | 2026-07-26 新增：疊加在 `.select` 上（`class="select select--bare"`），去邊框去填色、pill 圓角，只在 hover 浮出 `--muted` 底——給不在任何卡片／section 內、直接坐在頁面工具列上的 select（如 projects.html 列表工具列的內容類別篩選，跟旁邊 `.filter-tabs` 同列） |

**Token usage** (→ Pillar 2 Role)

- bg `--card` · text `--foreground` · edge `--border` (1px shadow) · radius `--radius` · focus `--ring` edge + soft glow ring · font `--font-body` · font size `--fs-14` · padding `--sp-12` (left/right prefix `--sp-32`)

**Usage** — Use `.input` for text/number entry in forms (settings, payout forms), `.textarea` for longer free text, `.select` for a native dropdown. The field uses a 1px visual edge without changing its box size.

**Do & Don't**

- ✅ Do pair with Field system for label + hint.
- ✅ Do use `.input--with-prefix` / `.select--with-prefix` ＋ `.control-prefix` when a fixed leading glyph sits inside the field.
- ❌ Don't wrap a select in your own bordered box just to fit an icon — that stacks a second frame around the control's own border and focus ring (媒體庫的檢視器踩過，2026-08-01 修掉)。
- ✅ Do rely on the component's 1px `--border` shadow edge; do not add a second border.
- ❌ Don't invent a size variant — the real component ships one size only.
- ✅ Do use `.select--bare` only when the select has no card/section ancestor (新設計規則 2026-07-26：border 只留給疊在卡片／section 內的控件；不在任何卡片內、直接坐在頁面或工具列上的控件改無邊框，貼合旁邊 filter-tabs 等同列元件）。
- ❌ Don't use `.select--bare` for a select sitting inside a `.card`/`.form-section--outlined`/form — it needs the 1px edge to read as a field there.


**Code example**

```html
<label for="email">Email</label>
<input id="email" class="input" type="email" placeholder="you@studio.com">
<textarea class="textarea" placeholder="Notes…"></textarea>
<select class="select"><option>Choose one</option></select>
<!-- 2026-07-26：不在卡片內、坐在工具列上的 select -->
<select class="select select--bare"><option>All categories</option></select>
```

**CSS** — [`input.css`](./ds-components/input.css)（原住 `shared.css`，2026-07-10 搬入）

---

### 4.9 Icon

**`_layer`** · atom — Tabler outline glyph as inline SVG, registered in `icons.js` and injected per page via `ztorIcons.applyIcons()` (no icon font, no network). The single icon primitive every other component reuses; it inherits `currentColor` and is sized by its context.

**Anatomy**

```
<i data-lucide="bell" class="ztor-icon"></i>
└ replaced in place with the registered inline SVG (stroke/fill = currentColor)
```

**Variants** — outline (default) · filled (`-fill` glyphs, e.g. `check-circle-fill`, `mail-fill`; scoped to the dashboard alert cards and the login F1 method cards — see §1.7 and STYLE-DECISIONS Q51).

**Sizes** — semantic scale: 12px (`--xs`) · 14px (`--sm`) · 16px base · 20px (`--md`) · 24px (`--lg`). Icon buttons (`.btn--icon`, `.btn--icon-circle`) use the 20px `--md` glyph — raised from 16px on 2026-07-21 because the base glyph read too small inside the 32／36px box. Exception: `.btn--icon-circle.btn--sm` (2026-08-02) is a 28px circle with a 16px glyph, for rows built around small type — 20px inside a 28px circle leaves 4px of margin and reads as boxed in rather than cushioned. First consumer is the detail-page breadcrumb back button, where a 36px circle would stand taller than the 12px crumb line it sits on. Elsewhere, size the icon for its meaning, not the button box.

**Registry** — hand-curated set in `icons.js` (139 glyphs) + the **full Tabler library (6,166 = 5,112 outline + 1,054 filled) in `icons-all.js`**, merged into the registry when that file is loaded (design-system.html only; product pages stay lean). The design-system gallery's "not in use" grid is **built at runtime** from whatever `icons-all.js` actually contains (lazily, on first expand) rather than hardcoded markup, so it never drifts from the shipped set. An icon renders as the literal tag if its name isn't registered.

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
 ├ ...section body...
 └ .card__note            (footnote, last child)
```

**Variants** — `.card--muted` (muted section wrapper, for nested sub-sections).

**Sizes** — Single size (padding `20px`).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | `--card` bg, no border, `--shadow-card` + `--shadow-edge-top`, `--radius-xl` (2026-07-26 Q23 決 C: 陰影浮起，取代 Q3 2026-07-13 的純邊框) |
| link hover | `.card__head .card__link:hover` | Link color → `--foreground` (chevron tracks via currentColor) |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.card` | Product section wrapper, 20px pad |
| `.card--muted` | Muted section bg (nested sub-sections) |
| `.card__head` | Baseline-aligned space-between head row, 14px bottom margin |
| `.card__title` | 15px / 500 section title |
| `.card__hint` | 12px subtle non-actionable hint |
| `.card__note` | 12px subtle footnote below the card body — the sentence that states the figures' basis, denominator or limitation (2026-08-06 promoted from fan-analytics' page-local `.aud-note`). Boundary vs `.card__hint`: hint is one short inline phrase in the head; note is a paragraph after the body, so it carries `--sp-12` top margin and `--lh-normal` |
| `.card__link` | 12px action link — underline by default; in `.card__head` becomes underline-less with trailing chevron icon |

**Token usage** (→ Pillar 2 Role)

- `--card`, `--muted` (bg) · `--foreground`, `--foreground-muted`, `--muted-foreground` (title / hint) · `--border` (link underline only, no longer the edge — see 2026-07-26) · `--shadow-card`, `--shadow-edge-top` (edge, 2026-07-26 Q23 C) · `--radius-xl` · `--font-ui`, `--font-body`

**Usage** — Use for every product-page section that needs a titled wrapper with an optional action link. Avoid when content is a flat row list — reach for Data list / Table instead.

**Do & Don't**

- ✅ Do put the section action in `.card__head .card__link` so it auto-renders the trailing chevron.
- ✅ Do use `.card--muted` for nested sub-sections to differentiate depth.
- ✅ Do rely on `--shadow-card` + `--shadow-edge-top` for the section edge — no 1px border by default (2026-07-26 Q23 決 C，取代 Q3 2026-07-13 的純邊框版本；`.funding-panel--card`／`.fc-bundle` 等 `.card` 系變體同步)。
- ❌ Don't use this for a standalone info block outside a page section — use `.ztor-card` instead.


**Code example**

```html
<section class="card">
  <div class="card__head">
    <h3 class="card__title">Recent earnings</h3>
    <a class="card__link" href="earnings.html">View all</a>
  </div>
  <!-- section body: data-list, kpi row, etc. -->
  <p class="card__note">Counted in people, not plays.</p>
</section>
```

**CSS** — [`card.css`](./ds-components/card.css)

**Evidence / usage** — e-shop, earnings, event-detail, auction-detail, bundle-detail, my-ip, fan-detail, create-campaign, create-event, create-project. `.card__note`: fan-analytics（作品榜／影響力／分群／漏斗／商業價值／建議行動）, index（ztor 粉絲組成）.

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
| default | — | `--card` bg（2026-07-26，還原 2026-07-20 Q21 的 `--input-surface`——多數 KPI 沒疊在卡內，跟外層同色才是常態）, 無邊框, `--shadow-card`＋`--shadow-edge-top`（Q23 決 C）, value in display font |
| nested-in-card | `.card .kpi`, `.form-section--outlined .kpi`, `.ip-hero .kpi` | bg 改回 `--input-surface`（scoped，避免疊在 `--card` 系容器內時跟外層糊色；8 處實際位置見 kpi.css 註解） |
| (delta sign) | `.kpi__delta--neg` | Delta color switches `--status-success` → `--destructive` |
| link hover | `.kpi__link:hover` | `--muted-foreground` → `--foreground` |

The tile itself is static; only the optional `.kpi__link` is interactive.

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.kpi` | Tile container — column, 6px gap, `--shadow-card`＋`--shadow-edge-top`（無邊框） |
| `.kpi__label` | Uppercase 12px / 0.4px tracking, subtle; flex for leading icon |
| `.kpi__value` | Display font 28px / 500 / -0.6px tracking |
| `.kpi__delta` | 12px UI semibold；染色膠囊 chip——`color-mix(--status-success 12%, --card)` 底＋success 字、radius-pill、`2px --sp-8` 內距（2026-07-17 midnight 使用者裁示，由純色文字升級；膠囊＝「趨勢指示 data-trend」新視覺角色，與 Q1 顯示型 badge 小圓角的狀態徽章角色區隔，見 STYLE-DECISIONS Q15） |
| `.kpi__delta--neg` | Overrides delta to `--destructive`（chip 底同構換 destructive tint） |
| `.kpi__meta` | 12px subtle neutral footnote (alternative to — or, on F2, alongside — delta); may wrap an `.card__link` for a deep-link |
| `.kpi__link` | Optional quiet "view more →" link pinned to the tile bottom (subtle → foreground on hover); pairs with `data-tab-jump` |
| `.kpi--success` | Tints `.kpi__value` `--status-success` |
| `.kpi--warning` | Tints `.kpi__value` `color-mix(in srgb, var(--status-warning) 60%, var(--foreground))` |
| `.kpi--destructive` | Tints `.kpi__value` `--destructive` |

**Token usage** (→ Pillar 2 Role)

- `--card` (bg — 2026-07-26 還原，多數 KPI 直接放在 `.bento`／`.tab-panel` 上、沒有卡包著；`.card`／`.form-section--outlined`／`.ip-hero` 內的 8 處用 scoped override 改回 `--input-surface` 避免糊色，見上表); `--shadow-card`、`--shadow-edge-top`（邊界，2026-07-26 Q23 決 C，取代 Q3 的 1px `--border`）; `--radius-xl` · `--muted-foreground` (label, meta) · `--status-success` (positive delta / `.kpi--success`), `--destructive` (negative delta / `.kpi--destructive`), `--status-warning` (`.kpi--warning`, color-mixed) · `--font-ui`, `--font-display`

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

**Variants** — Two density modifiers `.alert--card` (large, row-divider list, close button) and `.alert--row` (slim list row — no fill, hairline bottom divider, status carried by the icon glyph color). Four status modifiers `.alert--warning` / `.alert--error` / `.alert--success` / `.alert--info`, shared across densities. Dashboard F4 adds two state modifiers on `.alert--card`: `.alert--snoozed` (soft-closed info item, receded ~62%, reappears ~7d) and a blocking item whose close control is `disabled`/locked (resolve only in the source module) — spec 5.1.1 §F4.

**Sizes** — Density is the size axis: `--card` (40px icon, multi-line, `14px 4px` pad) vs `--row` (30px square icon footprint, single-line, `12px 0` pad).

**States**

| State | Selector | Change |
|---|---|---|
| default | — | Status icon tint + (card) bottom divider |
| stacked rows | `.alert--row + .alert--row` | `border-top` hairline between rows; a lone row gets no rule |
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
| `.alert--row` | Row density: `auto 1fr auto` grid, no fill, `12px 0` pad, hairline rule between stacked rows (2026-07-31: 3px left accent, muted fill and icon-chip fill all removed — reads as a list row, not a colored block; icon keeps its 30px square footprint so multi-row text edges stay aligned) |
| `.alert--bar` | Bar density: single-line rounded bar, soft shadow, no divider; `.alert__title` + inline `.alert__meta`, optional `.alert__cta`, `.alert__dismiss` ✕ |
| `.alert--page-top` | Positioning modifier on `.alert--bar`: sticky, full-bleed edge-to-edge flush page-top inside the app shell (must be `.main` first child), padding-inline aligned to the content column. `::after` masks the scroll-side top corner (≥901px). **Currently unused** — both page-top notification bars moved to `.alert-inset` (2026-07-26); kept as a preserved variant for full-bleed cases |
| `.alert-inset` ＋ `.alert--inset-card` | 收窄置中的頁面通知條（2026-07-26 promoted 自 e-shop `#eshop-stock-bar`，Figma 856:25546）。**兩層結構**：外層 `.alert-inset` 只管定位（sticky `top:--sp-16`、`max-width:1280` + `margin-inline:auto` + `padding-inline:28px`，與 `.page` 同配方，須為 `.main` 第一個子元素）；內層 `.alert.alert--bar.alert--inset-card` 才是視覺卡（`--surface-shell` 底＋`--radius-xl`＋12/16 內距；淺色改 `--card` 白底＋`--shadow-card`）。無 icon、無狀態色。分兩層的原因：單層 `margin-inline:max(...)` 在 `.main` flex 直欄容器裡寬螢幕會右側溢出。**黏頂遮罩 `.alert-inset::before`（2026-08-01 使用者裁示）**：卡片不透明，但上方那道 16px 空隙與卡片正下方是空的，往上捲時內容會從那兩處穿出來；補一層 `--surface-page` 同色底，上緣往上多蓋 200px（黏頂與過捲都不露）、下緣延伸 `--alert-inset-fade`（44px）做漸層淡出，內容在通知下方漸消而不是被硬邊切斷。`z-index:-1` 使它坐在卡片後面——外層有 z-index、自成堆疊脈絡，負值只落到該脈絡底層、仍蓋在頁面內容之上。**z-index 為 10**（2026-08-01 由 6 抬升）：6 與 `.list-toolbar` 同層，同層時 DOM 在後面的贏、整條分頁工作列會蓋過通知；10 高過一般頁面內容與工作列（6），仍低於黏頂的 `.list-dock`（20）／篩選浮層與下拉（30）／`app-topbar`（50）。**與黏頂工作列的接手**：頁面若讓 `.list-toolbar` 也 sticky 在同一個 `top`（屬各頁版面決定、寫在頁面 `<style>`，見 list-toolbar.css 檔頭），給它 `z-index: 12`，貼頂時工作列卡與通知條同寬同圓角、不透明且高 2px，剛好完整接手＝通知讓位（首例 `earnings-sony.html`）。Consumers：E-Shop 低庫存提醒（F2）、Events 情境提醒（`js/scenario.js` 注入）、Earnings Sony 版佣金提示 |
| `.alert--warning/-error/-success/-info` | Sets icon chip tint and CTA color |
| `.alert__icon` | Status-tinted chip holding a filled `.ztor-icon` |
| `.alert__body` | Title + desc/meta + optional CTA stack |
| `.alert__title` | 14px/600 (card) or 13px/500 (row) |
| `.alert__desc` / `.alert__meta` | 13px muted (card) / 12px subtle (row); `<em>` = emphasis |
| `.alert__cta` | Inline status-colored action link |
| `.alert__close` | 28px chevron-right dismiss button (card only) |

**Token usage** (→ Pillar 2 Role)

- `--status-warning`, `--destructive`, `--status-success`, `--status-info` (icon tint via `color-mix` on `--card`, glyph color on `--row`, CTA) · `--card`, `--muted` (card icon chip, close hover) · `--border` (card divider, rule between stacked rows); `--foreground`, `--foreground-muted`, `--muted-foreground` · `--radius-md`, `--radius-sm`; `--font-ui`

**Usage** — Use `.alert--card` in the dashboard alerts panel (stacked, dismissible, with renew/manage CTAs); use `.alert--row` for stacked inline notices inside a card or dialog (Fan analytics F8 suggested actions, Edit event consequence notes, Manage IP delete warning). Since 2026-07-31 the row carries no fill, so give it a card or dialog to sit in — it has no edge of its own. Avoid for a single editorial hint — use the Info banner instead.

**Do & Don't**

- ✅ Do match the status modifier to severity so the icon tint and CTA color stay coherent.
- ✅ Do use a filled Tabler glyph in `.alert__icon` (matches the card spec).
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

**Variants** — Base underline style, plus opt-in modifiers: `.tabs--brand` (soft orange pill active fill instead of the underline), `.tabs--underline-short` (base divider off, active underline shortened + centered to ~text width instead of full-width — E-Shop F3 type switch, Figma node 671-2337/671-2295; separator is left to the consuming context, e.g. a downward toolbar shadow), `.tabs--underline-label` (pairs with `--underline-short`; active underline hugs the label span only, **excluding a trailing `.tabs__item-count`**; needs the label wrapped in a child element, so tabs whose label is direct `<button>` text keep the full-item underline), and `.tabs--count-plain` (count as plain text in `--muted-foreground`, no pill). **清單頁工作列的標準寫法（2026-07-26 使用者裁示，見 STYLE-DECISIONS Q26）＝ `.tabs.tabs--underline-short.tabs--underline-label.tabs--count-plain`**——`.list-toolbar` 裡的主軸分頁一律這四個 class，四個消費頁（projects／my-ip／e-shop／events）不得各留一套；e-shop 沒有計數，`--count-plain` 在那裡不影響外觀，仍照寫以保持同一組配方。 Optional `.tabs__item-count` pill badge on an item. Items may render as `<button>` (programmatic) which strips default button chrome.

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
| `.tabs--underline-label` | Opt-in, pairs with `--underline-short`: active underline spans only the label span, excluding a trailing `.tabs__item-count`. Needs the label wrapped in a child element. **2026-07-26 起為 `.list-toolbar` 主軸分頁的標準配方之一**（projects／my-ip／e-shop／events／tier-settings）。**2026-07-31 使用者裁決升格為鐵律：這一組只能裝在 `.list-toolbar` 的 58px 實色殼裡**——底線是照容器下緣畫的（`bottom: calc(-1 * var(--sp-12))`），沒有殼就變成浮在標籤下方一截無所依附的橘線。要一排沒有殼的分頁，改用 `.tabs--card`（自己是一張卡）或 base `.tabs` 的 hairline |
| `.tabs--count-plain` | Opt-in: count keeps its label spacing but has no fill or pill padding; text uses `--muted-foreground`（2026-07-24 使用者「顏色再深一點」，原 `--foreground-muted`）。**2026-07-26 起為 `.list-toolbar` 主軸分頁的標準配方之一** |
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

### 4.16 Cookie banner（已退場 2026-08-03，tombstone）

> **2026-08-03 退場：** 使用者裁示「沒用就刪」。零消費（4 個 class 只在本頁 demo 出現），樣式已移除、檔案保留為墓碑。以下保留原始說明供追溯。


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

**Usage** — 兩種用途：(1) 路由在導航裡但畫面還沒建，讓人看到的是刻意的佔位；(2) **帶了 id 卻查不到那筆資料的整頁錯誤狀態**（D154 裁決，`__mark` 用 `!`，`__refs` 放一顆回列表的按鈕）。已載入但沒有資料的畫面不要用這支——那是真正的空狀態（「還沒有交易」）。

**Consumers** — `edit-event.html`（改版搬家的告示）· `event-detail.html`（查無活動 id）· `project-detail.html`（查無項目 id，2026-08-07）· `publish-work.html`（查無項目 id，2026-08-07）· `store-settings.html`（`.ss-order-empty` 排序空清單）。

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
| `.selection-card--icon` | Centered icon type-picker (create-product / create-event). **Flat 1px `--border`, no shadow**; parent grid gap tightens to `--sp-8`. Q3 partial ruling 2026-07-16, aligned to Figma node 781-4166; base `.selection-card` keeps its soft shadow |
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

- ✅ Do keep exactly one `.radio-card--active` card per group (single-select).
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
| `.composer__icon-btn` | 32×32 transparent icon button (upload/mic), 18px Tabler glyph |
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
   │   ├─ .data-list__icon (52×52, radius var(--radius), --muted bg, 1px --border-soft, --muted-foreground；2026-07-20 三度修正，併入 product-list/project-list 標準，圓角改用共用 token，Q20)
   │   │   └─ <i class="ztor-icon"> (20px outline Tabler)
   │   └─ .data-list__body (flex column, gap 2)
   │       ├─ .data-list__title (Geist 13.5/500, truncated ellipsis)
   │       └─ .data-list__meta   (12px --muted-foreground)
   └─ .data-list__amount (Display 15/500, right-aligned)
        └─ .data-list__amount--neg (--destructive)
last .data-list__row → border-bottom: 0
```

**Variants** — Icon semantic hooks only: `.data-list__icon--neutral|success|error|info` — all four render identical monochrome chips (`--muted` bg + 1px `--border-soft` + `--muted-foreground`; unified with product-list/project-list thumbnail family 2026-07-20, Q20); colored fills were retired 2026-05-25. Semantic color lives on the amount, not the chip.

The shared `transaction-list` renderer (components.js) composes this list with an optional trailing status badge. The status column is **per-call**: Earnings renders it; Dashboard F3 passes `hideStatus` to drop it, because F3 lists settled income only (status is always settled — spec 5.1.1 §F3).

**Sizes** — Single size (52px icon chip, `12px 0` rows; 2026-07-20 unified with product-list/project-list, was 40px, Q20).

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
| `.data-list__icon` | 52×52 `radius var(--radius)` neutral chip, `inline-grid` centered glyph（2026-07-20 併入 product-list/project-list 標準，原 40×40／`radius 10px`，Q20）|
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
- ✅ Do use 20px outline Tabler glyphs in `.ztor-icon` so chips match the `.alert--card` panel.
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
| `.segmented` | 灰軌道容器（`--muted` 底 + 1px `--border`；2026-07-16 由 `color-mix --foreground 5%` 改純 `--muted`＋加真 border，修正深色下軌道被提亮到接近 `--card`、控制融進 popover 背景的缺陷，落實 §Surface-layer contrast 通則），radius-lg，3px padding |
| `.segmented__btn` | 段；靜音文字 |
| `.segmented__btn--active` | 白浮起 pill |
| `.segmented__btn--icon` | 純圖示段（32px 正方、`--sp-6` 內距、18px icon）。文字段靠左右內距撐寬，圖示段得改正方，否則 14px 內距會把圖示擠扁。2026-07-23 取代已退場的 `.view-switch`（見下方退場註記），用於 projects 的清單／卡片檢視切換 |
| `.segmented--locked` | 鎖定修飾：整組不可點（`pointer-events:none`）、`opacity .6`，仍保留 `.segmented--active` 高亮呈現當前值。建立後固定不可編輯欄位（D137，如商品細節頁的規格模式／庫存版本）唯讀呈現用；搭 `aria-disabled="true"` ＋各 `__btn` 的 `disabled` |

**Token usage** — track `--muted` ＋ 1px `--border`（2026-07-16 由 `color-mix(--foreground 5%, --muted)` 改純 `--muted`＋加真 border，修正深色下軌道融進 popover 背景的缺陷）· active `--card` ＋ `--border` · text `--foreground-muted` → `--foreground` · radius `--radius-lg`/`--radius-md`

**接收 `.view-switch` 退場（2026-07-23）** — `shared.css` 原有一組 `.view-switch`／`.view-switch__btn`：膠囊外框、選中側實心填 `--foreground`，唯一消費者是 projects 的清單／卡片切換。使用者反饋「很醜、和 design system 不搭」。問題不在細節而在角色重複：實心填是站上第三種「已選中」畫法，與 segmented 的白浮起 pill 打架（見 [STYLE-DECISIONS](./STYLE-DECISIONS.md) 已選狀態一題），而「切換同一資料的視角」本來就是 segmented 的定義。故收斂成 `.segmented__btn--icon`，`shared.css` 規則移除、原處留墓碑註解，DS 頁 §4.60 改為墓碑段。

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
| `.preview-card__media` | 主圖直式 `--img-portrait`（2026-07-31 使用者：原 4:3 橫式改直式——建立流程的主圖槽已是 750×1125，預覽若維持橫式會把創作者剛上傳的直式圖切成橫帶，等於預覽騙人；拍賣／商品／組合／集資四個建立流程與訂單詳情共用本卡，一起跟上），空時放 icon 占位 |
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
| `.empty-card__icon` | 40×40 淡化 chip（`--muted` 底）內嵌 Tabler |
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
| `.notif-matrix__lock` / `.switch--locked` | 鎖頭色 `--muted-foreground`；鎖定 switch not-allowed、降透明。**`.switch--locked` 本身已於 2026-08-09 上收進 [Switch §4.6](#switch) 的 `switch.css`**——本檔只消費這個 class、不再定義它，理由見 §4.6 的說明（另兩個消費頁 tier-settings.html／create-event.html 只連 `switch.css`，鎖定態上收才三頁都吃得到） |

**響應式** — ≤560px 欄寬收窄不換行。

**Dependencies** — 鎖定 switch 重用 [Switch §4.6](#switch) 的 `.switch--locked`（定義在 `switch.css`，本檔僅消費）。

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
| `.insight-row__icon` | 16px Tabler |
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

**`_layer`** · organism — Self-framed data table (1px border + rounded surface) with muted header row, hairline row dividers, and check/cross/partial status cells. 2026-07-25 (Q29) converged the **frame only** to the `variant-table` treatment (own 1px border instead of shadow); **spacing/type stay roomy** (padding 16/20, header Geist 13, body Geist 14) — after seeing a demo the user kept the looser reading rhythm and only adopted the border. When placed flush as a direct child of a `.card` (`.card > .ztor-table`, e.g. earnings/event-detail table cards) the card supplies the frame and the table's own border is suppressed to avoid double-framing; standalone/inset tables (wrapped in an `overflow-x` container, e.g. project-detail 發布更新／合作者) keep their own border; inside `.admin-table-wrap` the wrap frames it and the table border is 0.

**Anatomy**

```
table.ztor-table (width 100%, border-collapse separate, --card, 1px --border, radius-xl, overflow hidden, body Geist 14)
├─ thead th (sp-16 sp-20, Geist 13/500, --muted-foreground, --muted bg, bottom hairline)
└─ tbody
   ├─ tr td (sp-16 sp-20, --foreground, bottom hairline, vertical-align middle)
   ├─ tr:last-child td → border-bottom: 0
   ├─ tr:hover td → background --accent
   frame suppression:
     .card > .ztor-table → border: 0; border-radius: 0 (flush in card; card frames)
     .admin-table-wrap .ztor-table → border: 0; border-radius: 0 (wrap frames)
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
| `.ztor-table__media` / `.ztor-table__thumb` / `.ztor-table__media-head` | Media feature cell — inner flex wrapper (gap `--sp-10`; must NOT be the `<td>` itself — `display:flex` on a cell drops it out of the table formatting context and collapses fixed column widths) leading the name + badge (`--radius`, `--muted` fill, 1px `--border`, `object-fit: cover`). Promoted 2026-07-25 from the sony finance table (`我的項目`); started from the admin IP-bank table's 36px thumb, shrunk to 32px with radius one step up on review; shared for any `.ztor-table`. **2026-07-31 user: turned portrait** — height locked at `--zt-thumb-h` (40px, one step back up from 32 per the same-day earlier decision so the thumb matches the row's content height), width derives from `var(--zt-thumb-w) = --zt-thumb-h * --img-portrait` (≈32px, 32×40) instead of being declared directly — locking height and deriving width keeps the row height from drifting if the ratio ever changes. `__media-head` on that column's `<th>` indents the header past the thumb (`--zt-thumb-w`) so it aligns with the name |
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
RANK-BARS  ul.rank-bars > li.rank-bar (grid 1fr 48px) > .rank-bar__track [__fill + __content(dot+label)] + .rank-bar__pct; variant .rank-bar--amount (grid 1fr auto 48px) inserts .rank-bar__amt value column (name · % · amount)
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
| `.rank-bar--amount` / `.rank-bar__amt` | Variant adding a value column between track and pct (name · % · amount) — royalty region / platform breakdowns |
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

**`_layer`** · molecule — Statement-style vertical ledger (spec §5.1.8 F12) that walks gross revenue down to distributable profit and its Creator / NFT split. Reads like a P&L: **milestones** (income / subtotal / pool / distribution) carry a running-balance bar so the descent is visible, while **deductions** are plain indented `name … −amount` rows (no bar — keeps it from becoming a wall of bars). Figures follow §7.3 (only settled income counts). Used on the Earnings · Breakdown tab (F12 full-period waterfall), and reused for the F11 per-project profit ladder.

**Anatomy**

```
.waterfall > .waterfall__row(--income|--deduct|--subtotal|--pool|--distribution)
  ├─ .waterfall__head > .waterfall__name + .waterfall__meta   (grid col 1)
  ├─ .waterfall__amt                                          (grid col 2, right)
  └─ .waterfall__bar > .waterfall__fill (inline width %)      (spans both cols, row 2)
.waterfall__empty   — no-settled-income state
```

**Variants** — Row types: `--income` (source, bold, bar), `--deduct` (a cut: plain indented row, − amount, **no bar**), `--subtotal` (milestone: top rule + bold + bar), `--pool` (distributable profit: orange bar), `--distribution` (indented allocation, bar). `--pool.waterfall__row--negative` flips the pool to an error-tinted warning (distribution paused, §7.3).

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

**Sizes** — Single size: panel `min-width: 230px`, 6px vertical padding only（水平不留白，2026-07-22 改，見下方 Class API）; items 9×16 padding, 13px text.

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
| `.dropdown__menu` | Floating panel — right-aligned, `min-width: 230px`, `--radius-lg`, `--shadow-float` (E3); padding `--sp-6` 上下、水平 0（2026-07-22 使用者裁示，Figma node 861:34183 比對——面板不留水平白，白留給選項自己） |
| `.dropdown__item` | Flex action row, 9×16 padding（水平由 `--sp-10` 改 `--sp-16`，2026-07-22，見上）, `--radius-md`; leads with a `.ztor-icon` (2026-07-21, 使用者裁示) — icon color inherits `currentColor`, no override needed even on `--danger`. Only exception: `.dropdown__item--toggle` (a switch row, not an action, e.g. E-Shop's List-in-shop toggle) |
| `.dropdown--left` | Panel anchors to the trigger's left edge instead |
| `.dropdown__item.is-hinted` | 指路態（2026-08-04）：頁面別處的入口替使用者打開這個選單、並指出該按哪一項時加上——`--accent` 底＋1px `--primary` 內環。意思是「被指到」不是「被選到」，所以不借用 hover／active 的底色（那兩個當下可能正被游標佔用）。由頁面 JS 加上，於選單收起、按下該項或逾時後移除。首個消費者：E-Shop 釘選區的「立刻前往」 |
| `.dropdown__item--toggle` | Switch row (menuitemcheckbox), no icon; 2026-07-21 使用者裁示加 `border-bottom` + `margin-bottom` — 跟後面的一般動作項分隔（切換狀態 vs. 會跑導頁／JS 的動作，語意不同）。分隔線色改 `--border`（2026-07-22，見下方 Token usage）；同輪再裁示 `border-radius: 0`（覆蓋掉繼承自 `.dropdown__item` 的 `--radius-md`）——這一列 hover 不用圓角，跟下面一般動作項的圓角 hover 高亮不同 |

**Token usage** (→ Pillar 2 Role)

- bg `--card` / hover `--muted` · text `--foreground` · radius `--radius-lg` / `--radius-md`（`.dropdown__item--toggle` 例外，顯式歸零，見上方 Class API）· shadow `--shadow-float`（面板邊緣靠這顆 token 內建的軟性描邊，2026-07-21 拿掉多餘的 `border`）· toggle 分隔線 `--border`（2026-07-22 使用者裁示，由 `--border-soft` 改：深色模式下 `--border-soft`＝`#202122` 跟面板底 `--card`＝`#212223` 只差 1 色階，線幾乎看不見；`--border` 是 Q22 已經為同理由全站提亮過的 hairline token（深色 `#333435`），比另開新色階或動 `--border-soft`（全站多處消費）風險小） · focus `--ring` · font `--font-ui` (inherited)

**Usage** — "Create / more actions" menus in toolbars (first consumer: E-Shop "＋ New" → product / bundle / auction). Avoid for nav mega-dropdowns — use NavigationMenu (§4.10) — and for form value selection — use a select / Input (§4.8).

**Do & Don't**

- ✅ Do use a real `.btn` variant as the summary trigger.
- ✅ Do keep items short, action-first, max ~6 entries.
- ✅ Do lead every item with a matching `.ztor-icon` (2026-07-21 使用者裁示) — the only exception is `.dropdown__item--toggle`.
- ❌ Don't rebuild it per page with inline styles — link `dropdown-menu.css`.
- ❌ Don't use it for navigation menus or form selects.

**Dependencies** — composes Button (§4.2, the summary trigger); used by E-Shop list toolbar.

**Code example**

```html
<details class="dropdown">
  <summary class="btn btn--primary">＋ New ▾</summary>
  <div class="dropdown__menu" role="menu">
    <a class="dropdown__item" role="menuitem" href="create-product.html"><i data-lucide="plus" class="ztor-icon"></i>Create new product</a>
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
├─ .product-list__divider              釘選區分隔列（2026-08-04 · D172）：**有釘選＝一條有字的分隔線**（`--sp-16/--sp-10` 內距＋1px `--border-soft` 下框線）；**零釘選＝`--empty` 變體**（同色 1px 外框＋`--radius-xl` 圓角、內距 --sp-16、上下外距 --sp-8、不填色，並收掉上一列的分隔線避免雙線）。> __divider-body > Icon + 說明 + __divider-count（n/10，零釘選時改放 __divider-cta）
└─ .product-list__row × N              88px, --border-soft divider, hover tint
   ├─ __image / __thumb(--cover)       76px image / 76px icon chip（2026-07-26 使用者：全站清單縮圖統一 76px，原 60／52px；有縮圖的變體列高改 116px、上下留白 --sp-20）
   ├─ __product > __body > __title (+ __pin-mark 已釘選時) + __meta (__category)
   ├─ __cell · __status (Badge) · __stock · __visibility (Switch)
   └─ __actions > __edit (Icon)
```

**Variants** — Base columns; page-level column layouts in `product-list.css` (layered on the base grid — not edits to it): `.product-list--eshop` (covers all three E-Shop panels — Products/Bundles/Auctions all share this class；**hover 浮起**——2026-07-21 使用者再次指定「hover 要跟 drag 的 style 一樣」，`:hover` 改 `--card` 底＋`--radius-md`＋`--shadow-float`，比照 `.is-dragging` 拖曳抬起態，為 Q5「清單列 hover 只換底色」的 scoped 例外，與 `--ip` 共用同一條規則；Products: drag / image / name / category / price / status / stock — 2026-07-20，Figma node 845-12576 三處內容規則：<br>`__meta`＝規格副標，單一選項商品固定顯示「單一選項」（`e-shop.variant.single`）、多選項顯示「維度（選項）× 維度（選項）」如「顏色（Black/Sand）× 尺寸（S/M/L）」，取代原本的商品格式描述文字；數位商品`__meta` 不變（沿用格式描述，數位商品無規格概念）；<br>`category-cell` 改兩行——`.product-list__cat-sub`（子分類，白字 `--foreground`）在上、`.product-list__cat-main`（主分類，灰字 `--muted-foreground`，共用 `e-shop.cat.physical`／`e-shop.cat.digital` 兩個 i18n key）在下；<br>`__stock` 改「剩餘數量 / ∞」（無限量）或「剩餘數量 / 上限」（限量），取代原本的「X left」；**數位商品庫存維持純 `∞`、不加剩餘數量**——Figma 稿子的數位列雖顯示「48 / ∞」，但三列數字相同、疑似佔位假資料，且數位商品無實體庫存概念，經使用者確認不採用，記入 UIA-066；2026-07-21：`__title` 內原掛在商品名稱後的「N variants／限量」`badge--inline` 已移除——規格數已由上述 `__meta` 副標呈現、限量狀態已由 `__stock` 的「剩餘/上限」格式呈現，徽章與兩者重複，使用者要求拿掉）, `.product-list--bundles` (Bundles: image / bundle / members / price / status / stock), `.product-list--auctions` (Auctions: image / item / category / bid / status / activity), `.product-list--orders` (Orders — **2026-07-23 使用者裁示，8 欄（訂單列表不放商品圖片，2026-07-23 移除縮圖欄）**，欄序＝訂單編號(`__order-id`，含很小的複製鈕 `__copy`) / 訂單內容(`__items`) / 買家(`__customer`) / 金額 / 付款狀態(`__pay`) / 出貨狀態(`__ship`) / 日期 / actions。**訂單內容欄** `__line` 每項商品一行、白字＋同欄字級(fs-13)、各行間距加大(`__line + __line` margin-top `--sp-6`)、最多 4 行超過以 … 截斷；**整列可點開啟訂單**（`__row` cursor:pointer，kebab／複製鈕 stopPropagation，比照 creators 列）。訂單身分與狀態雙軸各自成欄（原「編號+買家+商品」擠一格、「出貨+付款」`.status-axes` 並排一格）。**出貨狀態欄承載履約雙值**——配送用 待出貨/已出貨/已完成、現場取貨用 待取貨(`orders.status.pickup`)；混合訂單（配送＋取貨）兩顆徽章水平並排不換行(`__ship` gap＋nowrap、欄寬 minmax 148)；取貨徽章由原「品項層 meta」升為此軸的履約狀態值——**重新詮釋 D111，見 ASSUMPTIONS UIA**。付款軸仍與履約軸分離不混用（§7.2）), `.product-list--pickup` (Pickup sessions), `.product-list--ip` (2026-07-20，My IP: icon / IP name+badges / rights / rented / revenue / price / mktplace toggle / manage — spec 5.1.4 §F6 8 欄；`__mktplace` cell 為本變體專屬，`display:flex;justify-content:center` 置中開關；**hover 浮起**——`:hover` 改 `--card` 底＋`--radius-md`＋`--shadow-float`，比照 `.is-dragging` 拖曳抬起態，使用者裁示，為 Q5「清單列 hover 只換底色」的 scoped 例外（2026-07-21 起與 `--eshop` 共用同一條規則，見上）). E-Shop page-level behavior (drag-reorder, filter-empty, panel switching, row kebab) stays in `e-shop.html`. `__thumb--cover` inverts to foreground/background; `__image--placeholder` holds either the "ztor." text mark (generic) or a category icon (`.ztor-icon`, 20px, `--muted-foreground` — E-Shop rows map 服飾→shirt / 書籍→book-open / 音樂專輯→disc / 收藏品→gem / 配件→tag / 居家生活→house / 海報與印刷→image / 草稿→package). **2026-07-21**：商品清單縮圖改真實照片（`images/products/`，取自參考站 ztor-eshop-fe），`.product-list__image`／`--placeholder` 同步改 60×60、拿掉 1px 邊框（原 52×52＋`--border`／`--border-soft`；**2026-07-26 再依使用者指示統一到 76×76**，`__thumb` 同步 52→76）——此改動使 `.product-list__image` 與 Q20 統一的 `.product-list__thumb`／`.project-list__icon`／`.data-list__icon` 家族（見 Project list、Data list 條目）**視覺上分家**：後者角色是純 icon chip（orders/pickup/my-ip/projects/14 頁），前者現在要承載真實商品照，使用者指定改版、不回頭同步其餘家族成員。連動 `events.html`（唯一另一個消費 `.product-list__image` 的頁面）的 grid-template-columns 縮圖欄寬同步 52px→60px，避免裁切。同一輪：Products/Bundles/Auctions 分頁的 kebab 選單新增「複製商店連結」（`e-shop.a.copystorelink`），緊接在「在商店上架」開關之後、「編輯」之前；純展示、無實際複製邏輯（比照既有「編輯」等項目皆為 demo）；Auctions 分頁維持原有獨立的「複製連結」（`e-shop.a.copylink`）不變、未套用此新增項目。**2026-07-23 使用者反饋：整列可點開啟編輯**（比照 Orders／Creators 列既有的整列可點模式，見上方 `--orders` 條目）——`.product-list--eshop` 三個分頁（Products／Bundles／Auctions）點列即導頁，目的地讀該列 kebab 選單裡「編輯」那個 `<a href>`（跟選單本身同一份資料，不另開一份判斷邏輯）：草稿列進對應建立頁（`create-product.html`／`create-bundle.html`／`create-auction.html`），已建立商品進對應細節頁；沒有編輯項的列（如已出貨的 ended 拍賣，kebab 只有「追蹤履約」）點列不做任何事，不會誤導去追蹤履約頁。點擊排除握把（`.product-list__drag`）、operations 欄（`.product-list__actions`，含 kebab 選單本身與 stock tip 浮卡的觸發格）與任何 `<a>`/`<button>`。`cursor: pointer` 只加在 `--eshop`，`--ip` 沒有這個點擊行為、游標不共用。

**Status badges** (Products `__status` column, spec 5.1.5 F4 / D093) — uses Badge variants: Live → `badge--success`, Low Stock → `badge--error`, Sold Out / Draft / Hidden → `badge--neutral`. Sold Out (stock = 0) and Low Stock (below threshold, still in stock) are distinct states, never conflated.

**釘選（Pinned section，2026-08-04 · 規格 5.1.5 F4／D172）** — 清單分成「釘選區 → `.product-list__divider` → 其餘」三段，釘選與否＝在分隔列的哪一側，所以「固定」與「排序」是同一個操作：拖曳跨過分隔列即釘選／取消釘選（`.is-drop-target` 在拖曳中點亮該線），列操作選單另有「釘選／取消釘選」入口供窄螢幕與不拖曳者使用。上限 10、各分頁獨立計，數字放在 `__divider-count`（零釘選時收起、該位置改放指路連結）；額滿時選單項 disabled、拖曳被退回線下並以 `.is-full` 把計數閃成 `--destructive`。**不掛精選徽章**（使用者裁決：粉絲端強制置頂但不加標記）——創作者端的辨識靠分段本身，加上名稱前常駐的 `__pin-mark` 小圖釘（分隔線收起時，那顆圖釘是唯一還讀得出釘選狀態的線索）。草稿列不得固定（不對粉絲顯示），故不注入該選單項；草稿永遠排在整張清單最前、在釘選區之前。**零釘選時同一條線不收起、改講提示**（2026-08-04 使用者裁示）——此時它落在草稿之後、第一個商品之前，也就是釘選區將來會出現的位置，**外觀同時換成 `--empty` 方框變體**（兩種狀態是兩件不同的東西：有釘選時它是兩段之間的界線、一條線就對；零釘選時沒有上下兩段可分，實際在做的是邀請你去釘第一件，所以框起來）。文案改成「把主打商品放到商店最前。」，右端那一格改放指路入口（`e-shop.pin.hint`／`e-shop.pin.cta`；`__divider-cta` 只管推到右端，外觀走 `.btn.btn--ghost.btn--sm` 無外框按鈕，避免與外框變成框中框）、**計數收起**——零釘選時的 `0/10` 沒有在報告任何進度，只是把行動往旁邊擠（2026-08-04 使用者裁示）；釘選第一件後右端換回 `n/10`、連結收起，文案回到「以上釘選並顯示在商店最前」（`e-shop.pin.divider`）。一條線兩種說法，不另做提示元件。**分隔線在每一個篩選／搜尋狀態都成立**（2026-08-05 使用者反饋，改掉原本「一旦搜尋或篩選就整條收起」的規則）：reflowPins 讓釘選列排在最前，篩選只是把不相符的列 hidden 掉，留在畫面上的仍然是「釘選在上、其餘在下」。顯隱判準因此由「有沒有在篩選」改成「這個視野看不看得到釘選商品」——看得到就畫線（計數仍報全分頁的 `n/10`，那是分頁層級的額度、不隨篩選縮放），一件都看不到就整條收起（線上方空無一物卻寫著「以上釘選」才是說謊）。**零釘選時的 `--empty` 邀請方框則每一個篩選狀態都在**（2026-08-05 使用者裁示）：釘選是這張清單的能力、不是「全部商品」限定的能力，而且先篩出販售中再挑幾件主打是常見動線，入口在篩選時消失等於要人先切回全部才找得到；零釘選時沒有上下兩段可分，也就不會有「線上方空無一物」的說謊問題。唯一收起的是「立即釘選」連結——這個視野裡一件可釘選商品都沒有時（例如只篩草稿）它按下去不會有反應，收起只留說明。查無符合時整張清單走 `.is-filtered-empty`（`display:none`），方框連同清單一起退場，空狀態卡獨佔畫面。**「立刻前往」＝指路而不是代按**：點它會把第一件可釘選商品的列捲到視窗上方三分之一、打開該列的操作選單，並把「釘選」那一項加上 `.dropdown__item.is-hinted` 指路環（見 §4.26）；固定哪一件仍由創作者決定。DOM 順序仍是粉絲端陳列順序的唯一來源（D083），釘選區只是這條順序的前 10 名。三個 E-Shop 分頁（Products／Bundles／Auctions）都適用；拖曳重排仍只有 Products 分頁有。

**Thumbnail lazy-load** (spec 5.1.5 F4 / D094) — real thumbnails (`.product-list__image img`) carry `loading="lazy"` (fetch only when scrolled into view). The E-Shop demo lists use no-image CSS placeholders (`__image--placeholder`, self-hosted, no CDN), so lazy-load is a convention for real thumbnails with no visible effect in the demo. List batching defaults to 25/batch (spec); demo uses a smaller batch to surface "Load more".

**States**

| State | Selector | Change |
|---|---|---|
| hover | `.product-list__row:hover` | bg `--muted` |
| draft | `.product-list__title--draft` · `.product-list__empty` | Draft / unfilled cells show muted placeholder — name → "Untitled / 未命名", other cols → "—" (spec 5.1.5 F4 / D092, all three E-Shop panels) |
| pinned | `.product-list__row[data-pinned="true"]` | 列排進分隔列之上，名稱前顯示 `__pin-mark` 圖釘（D172） |
| 零釘選（任何篩選狀態） | `.product-list__divider.product-list__divider--empty`（文案切 `e-shop.pin.hint`） | 同一條線改成方框＋引導文案＋指路連結（計數收起），位置＝草稿之後、第一列商品之前；視野裡沒有可釘選商品時（如只篩草稿）連結一併收起（2026-08-05）|
| 篩選／搜尋中，視野看得到釘選商品 | `.product-list__divider` | 照常畫線，計數維持全分頁 `n/10`（2026-08-05）|
| 篩選／搜尋中，視野看不到釘選商品 | `.product-list__divider[hidden]` | 整條收起——線上方空無一物卻寫「以上釘選」會說謊；此時釘選狀態只剩 `__pin-mark` 讀得出來（2026-08-05）|
| 拖曳落點會改變釘選狀態 | `.product-list__divider.is-drop-target` | 分隔線改 `--primary`、說明字改 `--foreground` |
| 釘選額滿 | `.product-list__divider.is-full` | `__divider-count` 轉 `--destructive` 1.2 秒 |
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

**`_layer`** · organism — Borderless table list for Projects, sharing Product list's visual DNA (real image thumbnail, row-divider, `--accent` hover) but with project columns and whole-row `<a>` links to the detail page. Columns: image · project (type above name + one-line desc) · category (content type over family) · current goal · time left · status · chevron. **Current goal uses three visual rows**: a smaller bold percentage (`__goal-pct`, `fs-14`/bold), the existing 6px `.project-bar`, then raised/target amount (`__goal-amt`). The bar is decorative because the percentage and amount remain text. Only funding / pre-order campaigns carry a goal + countdown; every other kind shows a muted em-dash (`__cell--empty`) in the goal + time columns. The 76px-wide thumbnail (enlarged by a third from 56px on 2026-07-26 per user request) uses the same `poster||cover` source as the detail-page hero. This departs from the Q20 icon-chip family (`.data-list__icon` etc.) the row thumbnail once belonged to — the identity cell now leads with a real poster, matching `.product-list__image`. **2026-07-31 user decision: `.project-list__image` turned portrait** — width stays 76px, height now derives from `--img-portrait` (2/3) to 94px (76×94, same recipe as `.product-list__image`), row height grows from 116 to 134 accordingly; no square/landscape crop of the source art is kept. **2026-07-24**: the to-do tip column was removed (per user), the goal cell gained the reusable progress bar, and type moved into the project identity stack.

**Anatomy**

```
.project-list (grid table · 7 tracks · 20px column gap · goal 144px / 136px ≤1180px · 4px inline cell padding)
├─ .project-list__head                 44px column headers (__col-time/-category drop ≤1180px)
└─ <a>.project-list__row × N           116px link-row（--sp-20 上下留白）, --accent hover, focus ring
   ├─ __image (76px poster||cover · --placeholder = muted tile + 28px type icon)
   ├─ __project > __kind + __title + __desc
   ├─ __category > __cat-main + __cat-family    (content type over family; sits before goal 2026-07-24)
   ├─ __goal > __goal-pct + .project-bar[aria-hidden] + __goal-amt  (amt has 4px margin-top off the bar; or .__cell--empty em-dash when no campaign)
   ├─ __cell __time                     (__cell--empty → em-dash when no campaign)
   ├─ __cell __status (Badge)
   └─ __go (chevron Icon)
```

**Variants** — Single layout; status conveyed by Badge variants (Live / Draft / Ended…); goal/time cells take `__cell--empty` for non-campaign kinds.

**States**

| State | Selector | Change |
|---|---|---|
| hover | `.project-list__row:hover` | bg `--accent`; `__go` darkens to `--foreground` |
| focus-visible | `.project-list__row:focus-visible` | inset 2px `--ring` outline |
| ≤1180px | `@media (max-width: 1180px)` | time / category columns drop; type remains above the project name |
| ≤760px | `@media (max-width: 760px)` | header hidden; rows restack (goal owns the 2nd line; status and chevron use separate right-side tracks) |

**Token usage** (→ Pillar 2 Role)

- text `--foreground` / `--foreground-muted` / `--muted-foreground` · dividers `--border` / `--border-soft` · hover `--accent` · focus `--ring` · thumbnail `--card` (placeholder `--muted` + `--border-soft`) · radius `--radius` · motion `--duration`/`--easing` · font `--font-ui`

**Usage** — Projects page list view (projects.html; rows rendered by its inline JS from data). Card view is the separate `.project-card` page block（封面 `.project-card__cover` 有 `cover` 資料時放 `.project-card__cover-img` 真實海報、鋪滿裁切，沒有素材的專案退回 lucide 圖示佔位，2026-07-24；**2026-07-31 使用者：封面比例由 16:9 改直式 `--img-portrait`**——橫式框配直式原圖只能取中間一條橫帶，海報上下全被切掉，改直式後 auto-fill 280px 欄寬約長 347px 高，卡片變成海報牆讀法；活動不吃這條，活動未使用 `.project-card`）。

**Do & Don't**

- ✅ Do keep the whole row as one `<a>` — the chevron is a hint, not the only target.
- ❌ Don't nest buttons or other links inside the row link — the whole row is one target.

**Dependencies** — composes Badge (§4.3), Icon (§4.9); used by projects.html.

**CSS** — [`project-list.css`](./ds-components/project-list.css)

---

### 4.29 Payout bank picker & dialog

**`_layer`** · organism — Two-part payout flow (spec §5.1.8): a page-side bank picker card grid (`.payout-bank-*`) on Earnings · Payouts, plus the request-payout modal (`.payout-modal` blurred backdrop + `.payout-dialog` shell with head / body / foot, 34px display-type amount input, fee summary, step views and success view). Mounted from `partials/payout-request-modal.js`; promoted out of earnings.html inline styles on 2026-06-09. **2026-07-23 footer/header 釘住收斂到元件層**：`.payout-dialog` 改成 flex column＋`overflow:hidden`，`__head`／`__foot` `flex:none` 釘在上下、`__body` `flex:1＋overflow-y:auto` 只捲內容——原本整框 `overflow:auto` 會讓 footer 隨內容捲走，各 popup 得各自補救（restock 曾 scope 修過，已移除）；現在所有 `.payout-dialog` 消費者一次到位。

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
   │   ├─ .zcheck.mt-16 (§4.96 Checkbox) — irreversible-confirm gate; converged onto the shared Checkbox 2026-08-06 (was .payout-confirm > __box + __text, a framed row with a native checkbox — Q53)
   │   ├─ .control-row (Switch) — converged onto .control-row 2026-07-11 (was .payout-inline-control)
   │   └─ .payout-result (__icon success circle)
   └─ __foot (ghost + primary Buttons)
```

**Variants** — Bank card: default / `--selected` (inset 2px foreground ring) / `--add` (dashed). Form grid: 2-col / `--single`. **`.payout-dialog__split`** (2026-08-09; first consumer = the ticket edit dialog in `create-event.html`, §4.114 Ticket tier card) — splits `__body` into a main column (fields to fill in) + a fixed 200px side column (image, view-only), `align-items: start` so the side column never stretches to the main column's height; collapses to a single column ≤640px, side column falls to the end.

**States**

| State | Selector | Change |
|---|---|---|
| hidden | `.payout-modal[hidden]` / `.payout-view[hidden]` | `display: none` |
| open | `.payout-modal` + `body.is-modal-open` | fixed blurred backdrop + body scroll lock |
| selected | `--selected` / `.is-active` | white surface + inset 2px `--foreground` ring |
| confirm gate | `[data-payout-confirm]` (on `.zcheck__input`) → `[data-payout-submit][disabled]` | submit CTA disabled until the irreversible-confirmation box is ticked (spec §5.1.8.1 §4.5); resets on every open |
| ≤720px | `@media (max-width: 720px)` | dialog docks to bottom sheet (top radius only); form single column |

**Token usage** (→ Pillar 2 Role)

- surfaces `--card` / `--muted` · rings `--border` / `--foreground` (selected) · shadows `--shadow-card` / `--shadow-overlay` (dialog shell, E4) / `--shadow-hairline` · radius `--radius-md` / `--radius-lg` · success `color-mix(--status-success 14%, --card)` · fonts `--font-ui` / `--font-display` · backdrop `color-mix(--background 68%, black 45% alpha)`

**Usage** — Earnings · Payouts tab (earnings.html). The dialog shell is the project's canonical modal pattern — reuse it for future modals instead of re-rolling. Already reused by the F10 manual-entry modal (`partials/manual-entry-modal.js`), which mounts the same `.payout-modal` / `.payout-dialog` shell with form fields instead of payment steps; and by `partials/restock-modal.js` / `partials/pickup-session-modal.js` / `creators.html`'s inline create-creator form. All of these now build their fields from `.field` / `.form-grid` / `.control-row` (field-system.css / form-grid.css / control-row.css), not page-local `.payout-field*` markup — the page-local `.payout-field` / `.payout-form-grid` / `.payout-inline-control` classes have no remaining consumer and their rules were removed from `payout-modal.css` (2026-07-11). The ticket edit dialog in `create-event.html` also reuses this shell and is the first consumer of the `.payout-dialog__split` layout above.

**Do & Don't**

- ✅ Do mount via `partials/payout-request-modal.js` so every consumer gets the same dialog.
- ✅ Do keep the fee summary visible before confirm.
- ❌ Don't rebuild the dialog shell per page.
- ❌ Don't forget `.is-modal-open` scroll lock when opening.

**Dependencies** — composes Button (§4.2), Input (§4.8), Switch (§4.6), Badge (§4.3), Field system, Form grid, Control row, Amount field; used by earnings.html.

**CSS** — [`payout-modal.css`](./ds-components/payout-modal.css) · [`partials/payout-request-modal.js`](./partials/payout-request-modal.js) · shell reused by [`partials/manual-entry-modal.js`](./partials/manual-entry-modal.js) · fields use [`field-system.css`](./ds-components/field-system.css) · [`form-grid.css`](./ds-components/form-grid.css) · [`control-row.css`](./ds-components/control-row.css) · [`amount-field.css`](./ds-components/amount-field.css)

---

### 4.29c Restock order (table)

**`_layer`** · molecule — restock popup for the E-Shop restock sub-flow (spec §5.1.5.6, D104 order model + D106 member tabs). A restock = one **order**: a **document layer** (method + supplier / notes / ETA, filled once) and an **item layer** that is a **`.restock-table`** of variant rows. **2026-07-22 layout (Figma node 861-28842):** the method switched from a plain `.segmented` track to `.segmented.radio-cards` (two side-by-side cards + top-right orange dot); the item table sits **right below the method** (product-name label then table); supplier / notes / ETA move **below the table**; the footer is **pinned to the dialog bottom** and only the body scrolls (same footer-pin pattern as the platform-fee modal `[data-fx-modal]`); the old under-method hint row and the yellow stickynote were removed. Each row carries three number columns: **current** (read-only), **restock** (typeable), **after** (read-only, live = current + restock). A **product's variants are a matrix of rows** (single-variant = 1 row; 2-option = sub-grouped by option-1 via `.restock-table__group`) — no tabs. A **bundle separates its member products with `.tabs`** (one tab per member; each `.tab-panel` holds that member's variant table). Only one tab level (members) — variants never use tabs (D106); quantities persist across tabs (all member panels stay in the DOM). Blank restock quantity = skip that item. History log on product-detail reuses `.data-list`. Mounted from `partials/restock-modal.js`.

**Anatomy**

```
.payout-dialog (reused shell; flex column + footer pinned + body scrolls — 元件層 2026-07-23)
├─ document layer: .payout-field > .segmented.radio-cards (Restock now / Scheduled)
│                  product-name label + (bundle only) .tabs member switch
└─ item layer: .restock-table
│  ├─ .restock-table__head: <span/> + .restock-table__col ×3 (Current / Restock / After)
│  ├─ [PRODUCT] (.restock-table__group ×option-1, for 2-option) .restock-table__row × N  (no tabs)
│  └─ [BUNDLE]  .tabs (one .tabs__item per member)  →  .tab-panel × member
│         └─ .restock-table (that member's variant table; single member = 1 row)
│  .restock-table__row: __id > __img (40px chip) + __name · input(current, .__ro)
│                       · input(restock, typeable) · input(after, .__ro, → current + restock live)
├─ below the table: supplier / notes / ETA[scheduled only] on .payout-field
└─ footer = Cancel / Mark received (scheduled only) / Submit restock  (pinned to bottom)
   — restock HISTORY on product-detail = .data-list rows (+qty · date · supplier + status Badge)
```

**Variants** — Method (document layer, `.segmented.radio-cards`): Restock now (immediate) / Scheduled (Restocking until Mark received; adds the expected-arrival field). Item shape by entry: single-variant product (1 row) / multi-variant product (matrix rows, 2-option sub-grouped) — no tabs / bundle (`.tabs` per member product; each `.tab-panel` = that member's variant table).

**States**

| State | Selector | Change |
|---|---|---|
| method = now | `.segmented__btn--active` on "Restock now" | Expected-arrival hidden; Mark received hidden; Submit → In stock |
| method = scheduled | `.segmented__btn--active` on "Scheduled" | Expected-arrival shown (required, below the table); Mark received shown; Submit → Restocking |
| current / after cells | `.input.restock-table__ro` | Read-only (transparent surface, muted text, not typeable); after = current + restock |
| row skipped | empty restock `.input` in `.restock-table__row` | not restocked; after = current |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.restock-table` | Item layer of one order: bordered, `--radius-xl` table of variant rows with 3 number columns |
| `.restock-table__head` / `.restock-table__col` | Header row (grid: name · Current · Restock · After); each column label is a `.restock-table__col` on a `--muted` band |
| `.restock-table__group` | Sub-group header — option-1 value (Small / Medium) for a multi-variant product; also the bundle member context |
| `.restock-table__row` (`__id` / `__img` / `__name`) | One variant row: 40px image chip + option name, then three number inputs; rows divide with a top hairline |
| `.input.restock-table__ro` | Read-only number cell (current / after) — transparent surface, muted text; after = current + restock, live |
| (reuse) `.tabs` / `.tabs__item` / `.tab-panel` | Bundle only — one tab per member product; each panel a `.restock-table`. `[data-restock-tabs][hidden]` hides the bar for single-product restock (D106) |

**Token usage** (→ Pillar 2 Role)

- table border / row divider `--border` · corner `--radius-xl` · header band `--muted` · img chip `--input-surface` + inset `--border` + `--radius` · `--font-ui` · read-only cell text `--muted-foreground` · text `--foreground` / `--muted-foreground` · sizes `--fs-11` / `--fs-12` / `--fs-14` · spacing `--sp-4` / `--sp-6` / `--sp-8` / `--sp-10` / `--sp-14` / `--sp-20` · badges via badge.css · footer pin + ETA `[hidden]` handled by field-system.css / payout shell (no page-local override)

**Usage** — E-Shop restock popup (spec §5.1.5.6, D104 + D106): single-variant product row / product-detail = one row; multi-variant product row = matrix (no tabs); bundle row = `.tabs` per member product, each panel that member's variant table; each restocked row (restock>0) is logged to `.data-list` on product-detail. Reuse the payout dialog shell + Segmented (radio-cards) + Tabs + Data list; the table is restock-specific.

**Do & Don't**

- ✅ Do keep the 2026-07-22 order: method (radio-cards) → product-name label → `.restock-table` → supplier / notes / ETA below; footer pinned, body scrolls.
- ✅ Do keep current + after read-only (`.restock-table__ro`); only restock is typeable; group a multi-variant product or bundle member with `.restock-table__group`.
- ❌ Don't put method / supplier / ETA on each row, don't reintroduce per-item tabs, and don't bring back the under-method hint row or the yellow stickynote — the 2026-07-22 layout removed them.

**Dependencies** — composes Badge (§4.3), Field system, Form grid; reuses Segmented (§4.x, `.radio-cards`) + Data list (§4.x, history); mounts inside the Payout dialog shell (§4.29); used by E-Shop restock flow.

**CSS** — [`restock-modal.css`](./ds-components/restock-modal.css) · [`partials/restock-modal.js`](./partials/restock-modal.js) · document-layer fields use [`field-system.css`](./ds-components/field-system.css) · [`form-grid.css`](./ds-components/form-grid.css)

---

### 4.48 Store settings page

**`_layer`** · organism — E-Shop 商店層級設定的 **popup**（`store-settings.html`，spec 5.1.5.5 / D035 / D067），由 E-Shop F3「商店設定」按鈕以 **embed-modal iframe** 開啟；popup 外框承擔標題與關閉，**頁面本身無全域導航／麵包屑／頁首**，動作改置底部提交列（`.ss-actionbar`：See as fan ｜ Discard ｜ Save changes，sticky 底部；spec F1 設定動作與預覽）。IA：**店面門面**（`.ss-identity-card`）常駐置頂，用 **Base44／Facebook 式身分帶**（封面 `.ss-band__cover` ＋疊加 logo 頭像 `.ss-band__avatar` ＋店名／網址／簡介為文字），**逐欄就地編輯**（`.ss-edit`：文字態 ↔ 內嵌 input/textarea/select，✓/Enter 確認、✕/Esc 取消，`.is-editing` 切換）；品牌素材就是封面＋頭像（各自有編輯鈕），不另設上傳框；整頁用滿標準 1280px 的 `.page` 欄寬（非兩欄詳情頁，不套 `.page--narrow`）；其下**商品陳列／付款／出貨**三個對等設定群組以 **tab 切換**（`.tabs` + `.ss-tabpanel`，一次處理其一；出貨 tab 用 `.settings-row`）；另有 **粉絲視角預覽（See as fan）** 以畫面分割開啟（`.preview-panel--inset` + `.ss-fan`）。本元件補基礎控制項沒有的欄位型別：網址前綴（`.ss-url`）、`$` 金額前綴（`.amount-field`，見 Amount field 元件）、唯讀 Stripe 狀態卡（`.ss-status`）、品牌素材上傳（`.ss-brand` + Upload tile），以及**拖曳排序清單**（`.ss-order`）與粉絲預覽內容（`.ss-fan`）。

商品陳列（5.1.5.5 F3 / D031）：拖曳已上架商品調整粉絲端陳列順序——粉絲端順序的單一來源；上 / 下架（上架開關 Shop）仍在 E-Shop F4。只納入已上架（§7.2 可見）商品。兩種空狀態（`.empty-stub`）：完全沒商品 → 導向建立商品；有商品但全未上架 → 導向商品管理上架。

呈現參考（非約束，見 BUILD-SPEC）：門面置頂常駐、三群組 tab 切換、See as fan 畫面分割——spec §2 標為呈現參考，正式呈現由 project-ui-creator 決定。

```
store-settings.html  (popup body — D067: no global nav / breadcrumb / page header)
├─ .ss-stack (單欄, gap 18px, 滿版 ≤`.page` 寬＝1280px)
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
| hidden | `.review-row[hidden]` | `display: none` — guards the container's `display:flex` so a JS-toggled summary (e.g. 建立活動的一般活動 vs 共看派對兩份摘要) really disappears (2026-08-09) |

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

### 4.50 KV list

**`_layer`** · atom — Read-only key/value row: label left, value right, a hairline divider above every row but the first. The unit of a "look, don't touch" summary — detail-page meta cards, status snapshots, anything restating facts the user cannot edit here.

Distinct from its two nearest neighbours: unlike **Field system** (§ Inventory) it has no control slot and must never be dressed up as a form — if the value is editable it belongs in a `.field` / `.input`; unlike **Review row** (§4.49) it carries no per-row Edit action and no wizard-Review semantics. It also brings no card chrome of its own and expects to sit inside a Form section card.

**Anatomy**

```
.kv[.kv--lead]              one row — flex, space-between, baseline-aligned
 ├ .kv__k                   key   (--muted-foreground)
 └ .kv__v                   value (right-aligned, --fw-medium, default foreground)
```

**Variants** — One modifier, `.kv--lead`: treat this row as the lead of a group, dropping the top hairline and top padding (the same treatment `:first-child` gets automatically). It exists because `:first-child` is unreliable whenever rows are conditionally shown — a `[hidden]` row still matches `:first-child`, so the automatic rule fires on an invisible row and the first *visible* row keeps a stray divider. Any group whose opening rows can be hidden (e.g. a pickup-method pair where only one applies) must mark its lead row explicitly.

**Sizes** — Single size (`padding: var(--sp-8) 0`, `--fs-13`).

**States**

| State | Selector | Change |
|---|---|---|
| default | `.kv` | `1px solid var(--border)` top hairline, `--sp-8` vertical padding |
| first row | `.kv:first-child`, `.kv--lead` | Top hairline and top padding removed |
| hidden | `.kv[hidden]` | `display: none` — declared explicitly (see Notes) |

The component is entirely static; it has no interactive state.

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.kv` | One row — `display:flex`, `justify-content:space-between`, `align-items:baseline`, `--sp-12` gap, `--fs-13` |
| `.kv__k` | Key — `--muted-foreground` |
| `.kv__v` | Value — `text-align:right`, `--fw-medium`, inherits foreground |
| `.kv--lead` | Group lead row — removes top border and top padding |

**Token usage** (→ Pillar 2 Role)

- `--border` (row hairline) · `--muted-foreground` (key) · `--fs-13` · `--fw-medium` (value) · `--sp-8` (vertical padding) · `--sp-12` (key/value gap)

**Notes / gotchas**

- **`.kv[hidden]` must zero `display` explicitly.** The component is `display: flex`, which beats the user-agent default for the `hidden` attribute, so without an explicit `.kv[hidden] { display: none }` a "hidden" row still renders. The rule ships inside `kv-list.css` — consumers must not override it back.
- **No width ceiling.** The component deliberately sets no `max-width` on `.kv__v`; where values can run long, the consumer caps them.

**Usage** — Use for read-only fact lists inside a detail-page meta card or status card. Avoid when any value is editable (use Field system), when each row needs its own Edit action (use Review row §4.49), or for scannable record sets (use Data list).

**Do & Don't**

- ✅ Do mark the first visible row of a group `.kv--lead` when preceding rows may be `[hidden]`.
- ✅ Do cap value width yourself when values can be long.
- ❌ Don't put an input, switch, or button inside `.kv__v`.
- ❌ Don't rely on the browser's default `hidden` handling — see Notes.

**Code example**

```html
<div class="kv"><span class="kv__k">Category</span><span class="kv__v">Apparel</span></div>
<div class="kv"><span class="kv__k">SKU</span><span class="kv__v">ZT-TEE-0042</span></div>

<!-- conditional pair: only one shows, so the visible one is marked --lead -->
<div class="kv" hidden><span class="kv__k">Ship to</span><span class="kv__v">—</span></div>
<div class="kv kv--lead"><span class="kv__k">Pickup window</span><span class="kv__v">Aug 16 · 14:00–18:00</span></div>
```

**Consumers** — `product-detail.html` (the three right-rail meta cards); `bundle-detail.html` (right-rail "組合概況" card); `auction-detail.html` (right-rail "競標狀態" card).

**CSS** — [`kv-list.css`](./ds-components/kv-list.css)

---

### 4.51 Stock bar

**`_layer`** · atom — A 5px horizontal quantity bar reading "how much is left" at a glance: stock level, usage ratio. Always paired with the exact figure beside it (e.g. "3 / 50") — the bar carries the feel, the number carries the truth, and neither substitutes for the other.

Thinner and more primitive than **Completeness meter**, which owns its own label + count header and a `--ready` near-full state. Stock bar is bare track + fill; the surrounding card supplies all wording.

**Anatomy**

```
.stock-bar                         track (--muted, 5px, pill radius, overflow hidden)
 └ .stock-bar__fill[--low]         fill  (--primary; width from the consumer's inline style)
```

**Variants** — One modifier, `.stock-bar__fill--low`, switching the fill to `--destructive` when the quantity is under the low-stock threshold. There are exactly two colour states by design; a finer gradation would be a product rule, and product rules do not live in the component.

**Sizes** — Single size (`height: 5px`, `--sp-8` vertical margin).

**States**

| State | Selector | Change |
|---|---|---|
| default | `.stock-bar__fill` | `--primary` fill |
| low | `.stock-bar__fill--low` | Fill switches to `--destructive` |

Static; no interactive state.

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.stock-bar` | Track — 5px tall, `--muted` background, `--radius-pill`, `overflow:hidden`, `--sp-8` vertical margin |
| `.stock-bar__fill` | Fill — `display:block`, full height, `--primary`, `--radius-pill`; **no width** |
| `.stock-bar__fill--low` | Fill switches to `--destructive` |

**Token usage** (→ Pillar 2 Role)

- `--muted` (track) · `--primary` (fill) · `--destructive` (low fill) · `--radius-pill` · `--sp-8` (vertical margin)

**Notes / gotchas**

- **The percentage is supplied by the consumer as an inline `style="width:N%"` on `.stock-bar__fill`.** It is data, not styling; the component deliberately declares no width, so a fill without an inline width renders as zero.
- **The low threshold is a product rule.** The component only offers the modifier; deciding when "low" begins, and applying the class, is the consumer's job.

**Usage** — Use next to a stock or usage figure where the ratio should be felt instantly. Avoid as a task-progress indicator with its own label (use Completeness meter), and avoid as the only representation of a quantity — the number always accompanies it.

**Do & Don't**

- ✅ Do pass the percentage via inline `width` on the fill.
- ✅ Do show the exact figure alongside the bar.
- ❌ Don't invent a third colour state.
- ❌ Don't encode the low-stock threshold in CSS.

**Code example**

```html
<div class="kv kv--lead"><span class="kv__k">In stock</span><span class="kv__v">3 / 50</span></div>
<div class="stock-bar"><span class="stock-bar__fill stock-bar__fill--low" style="width:6%"></span></div>
```

**Consumers** — `product-detail.html` (right-rail "current stock" card).

**CSS** — [`stock-bar.css`](./ds-components/stock-bar.css)

---

### 4.52 Detail rail

**`_layer`** · organism — The two-column skeleton for a detail / edit page: an editable main column on the left (usually Tabs + tab panels) and a sticky read-only meta rail on the right that survives every tab switch, so the facts a user needs before changing anything are never a click away.

This section documents **the shell only** — column ratio, sticky behavior, nested spacing overrides, responsive breakpoint. Per §4.0, a component section demos a single instance's variants × states; *when* to reach for this layout and *what belongs in the rail* are assembly decisions and live in the Pillar 5 pattern card **Detail + persistent rail** (§5.1). Documenting them in both places would split the source of truth.

**Anatomy**

```
.detail-grid(.--full)         grid — minmax(0, 1fr) / 300px, --sp-16 gap, align-items:start
 ├ .detail-main               main column (min-width: 0)
 └ .detail-rail               right column (flex column, --sp-24 gap, sticky at --sp-24)
```

**Variants** — One modifier, `.detail-grid--full`, collapsing the shell to a single column and hiding the rail (`display:none`). It exists for two situations: a tab whose own content already carries the full status, so repeating it in the rail is duplication; a tab whose content needs the whole page width (wide tables). *When* to apply it is decided by the consumer's tab-switching logic — the component never inspects the current tab.

**Sizes** — Two configurations: `minmax(0, 1fr) 300px` (default) and `minmax(0, 1fr)` (`--full`).

**States**

| State | Selector | Change |
|---|---|---|
| default (≥1101px) | `.detail-grid` | Two columns; `.detail-rail` is `position: sticky; top: var(--sp-24)` |
| full-width | `.detail-grid--full` | Single column `minmax(0, 1fr)`; `.detail-rail` is `display: none` |
| ≤1100px | `@media (max-width: 1100px)` | Collapses to `minmax(0, 1fr)` single column; rail drops to `position: static` and falls in below the main column |

**Class API** (CSS classes — Props/API = N/A, static CSS prototype)

| Class / modifier | Effect |
|---|---|
| `.detail-grid` | Two-column grid `minmax(0,1fr) 300px`, `--sp-16` gap, `align-items:start` |
| `.detail-grid--full` | Single-column variant — grid collapses to `minmax(0,1fr)` and `.detail-rail` is hidden; applied by the consumer per tab |
| `.detail-main` | Main column; `min-width: 0` so wide tables or long unbroken strings can't burst the grid |
| `.detail-rail` | Right column — flex column, `--sp-24` gap, sticky |
| `.detail-rail .form-section` | Margin zeroed — spacing inside the rail is owned by the rail's `gap` |
| `.detail-rail .form-section--outlined:not([hidden]) ~ …` | The component-layer sibling `margin-top: var(--sp-24)` is zeroed here (see Notes) |
| `.detail-rail .form-section__head` | Head bottom margin tightened 24px → `--sp-12` |

**Token usage** (→ Pillar 2 Role)

- `--sp-16` (column gap) · `--sp-24` (rail card gap, sticky offset) · `--sp-12` (rail card head margin)

**Notes / gotchas**

- **The adjacent-sibling `margin-top` from `form-section.css` must be zeroed inside the rail.** Form section gives visible outlined siblings a `--sp-24` top margin; inside a flex column that already has a `--sp-24` gap, the two stack and rail cards end up spaced twice as far apart as intended. `detail-rail.css` zeroes the rule so spacing is owned by `gap` alone — consumers must not reintroduce per-card margins.
- **Rail card heads are tightened.** Form section's default 24px head bottom margin reads as slack in short rail cards, so it drops to `--sp-12` in this scope.
- **This shell expects the narrow page container.** Put it inside `.page.page--narrow` (1056px, §6.1): at the default 1280px the 300px rail leaves the main column wide enough that line length becomes uncomfortable. The variant exists for exactly this layout.
- **The rail is not guaranteed to be beside the content.** Below 1100px it falls in underneath, which is why nothing in the rail may be the only route to a task.
- **`--full` is toggled by the consumer, per tab.** The component collapses the grid and hides the rail whenever the class is present; deciding *which* tab deserves the full width is a page decision. `product-detail.html` applies it on the 定價與庫存 tab, whose panel already states stock and pricing in full. Since the rail disappears entirely in this mode, a tab that runs under `--full` must not depend on anything the rail was carrying.

**Usage** — Use for a detail / edit page whose editing surface is split across tabs while a small set of read-only constraints must stay visible. Avoid for single-column forms and for create wizards (use the `wizard-focus` template), and avoid when the "rail" content would need more than 3–4 cards.

**Do & Don't**

- ✅ Do keep the rail read-only.
- ✅ Do leave `min-width: 0` on `.detail-main` in place.
- ❌ Don't add per-card margins inside the rail.
- ❌ Don't restate rail composition rules here — they belong to the Pillar 5 pattern card.

**Code example**

```html
<div class="detail-grid">
  <div class="detail-main">
    <nav class="tabs" role="tablist">…</nav>
    <div class="tab-panel">…</div>
  </div>
  <aside class="detail-rail">
    <section class="form-section form-section--outlined">…</section>
    <section class="form-section form-section--outlined">…</section>
  </aside>
</div>
```

**Dependencies** — composes Form section, Tabs, KPI, KV list (§4.50), Stock bar (§4.51). Assembly rules: Pillar 5 §5.1 *Detail + persistent rail*.

**Consumers** — `product-detail.html` (tabbed editing main + read-only meta rail); `order-detail.html` (read-only order summary main + buyer-info rail — no tabs, but the same main + persistent read-only rail shell); `bundle-detail.html` (2026-07-27，分頁 總覽／銷售設定／成員，右欄＝上架設定＋唯讀組合概況；成員分頁掛 `--norail`); `auction-detail.html` (2026-07-27，分頁 總覽／出價／拍賣資訊，右欄＝唯讀競標狀態；出價分頁掛 `--norail`).

**CSS** — [`detail-rail.css`](./ds-components/detail-rail.css)

---

### 4.53 Nest

**`_layer`** · atom — 嵌在卡片「底部」的滿版子層：左右與下緣切齊母卡外緣，靠一道向上打的陰影跟卡面分開。用於「切換某個模式後，下方長出一整組設定表單」的情境。對齊 Figma node 856:27798（2026-07-21 使用者裁示）。

**Anatomy** — 單一區塊。負 margin `calc(var(--sp-16) * -1)` 抵銷母卡左／右／下三邊的 `--sp-16` 內距；上方保留 `--sp-16` 與前一個元素（如 `.segmented`）的間距。

**層級系統：只有兩層填色**

- **L1 卡片** `--card`：絕對色（亮 `#FFFFFF`／深 `#212223`）。**不參與疊加**——DevTools 檢視時看到的就是真正的顏色。
- **L2 巢狀層** `--nest-surface`：半透明疊加（亮 `transparent`／深 `rgba(222,223,233,.04)`，合成後 ≈ `#292A2B`）。
- **L3 以後**：不再往上疊填色（會愈疊愈糊、也把畫布色溫洗掉），改用 1px 邊框表達層級。**規則不寫在 `nest.css`，由消費端自己套**——`.nest` 不知道自己裡面會放什麼，硬寫 `.nest > *` 會誤傷。首個落地案例＝`variant-builder.css` 的 `.option-set__row`／`.variant-option`（2026-07-21 同日）：它們坐在 nest 裡＝L3，於是去掉 `--input-surface` 填色改 `transparent` ＋ 1px `--border`。**L3 邊框沒有專屬 token，就用 `--border`**，不為它另立一個新的邊框 token。

**為什麼深色用冷調薄膜、不用純白** — 純白疊加會把 midnight 畫布的冷色調洗掉（B−R 由 +2 掉到 +0.8）。改用 `rgb(222,223,233)` 這個 tint 疊上去反而把冷調推到 +3.0，與畫布同溫。Figma 獨立算出的也是同一個值（856:27796）。另有第三種寫法 `oklch(from var(--card) calc(l + .03) c h)` 在數學上完全不漂色，但相對色語法較新（Chrome 119+／Safari 16.4+）且需要「知道父層是誰」，交付前要評估瀏覽器支援，故本版未採用。

**與 `.card--muted` 的分工（同為「卡中卡」，不可混用）**

- `.card--muted` ＝ 卡片內部單純換底色的子區塊，維持母卡內距、四周留白、無方向性陰影。適合「一段內容需要被框起來」的靜態分組。
- `.nest` ＝ 滿版貼齊母卡底緣、有向上陰影的「疊上去的一層」。適合「模式切換後長出來的整組表單」，要讀起來像另一個平面。
- 判斷句：這塊東西是「卡片裡的一段」還是「疊在卡片上的另一層」？前者用 `--muted`，後者用 `.nest`。

**Behavior** — `border-radius` 取 `--radius-xl`，與母卡外圓角同值（三邊已重合，同值才會完全貼齊）。母卡以 `.form-section--outlined:has(> .nest) { overflow: hidden; }` 裁切——**這是必要的**：`--shadow-nest-up` 只有垂直位移，8px 模糊會往左右擴散到母卡圓角之外、漏到頁面底色上。`:has()` 只作用在真的含 nest 的卡，其餘 form-section 不受影響。⚠ 母卡內若同時有需要溢出的浮層（dropdown、popover）會被一併裁掉，放 nest 前先確認。`.nest[hidden]` 強制 `display:none`，蓋過消費端自帶的 `display:flex`（如 `.variant-builder`）。

**Token usage** — `--nest-surface`、`--shadow-nest-up`、`--radius-xl`、`--sp-16`。既有 `--card`／`--input-surface`／`--accent`／`--border` 完全不動。

**Consumers** — `create-product.html` 商品選項建構器 `#cp-var-builder`（多選項模式才顯示）。

**CSS** — [`nest.css`](./ds-components/nest.css)

---

### 4.54 Stock readout

**`_layer`** · atom — 唯讀的數量，用大數字而非輸入框呈現。適用於「只能透過某個特定動作改變」的值。

**Anatomy** — `.stock-readout` > `.stock-readout__num`（顯示字體 28px）＋ `.stock-readout__unit`（單位與分母，輔助色）＋ 可選 `.badge`（狀態徽章，由 consumer 決定要不要放）。baseline 對齊的 flex 列，本身無容器樣式（坐在 `.field` 裡）。

**為什麼不用 input** — 商品明細的庫存只能靠補貨增加、每筆留紀錄。做成 `.input` 會讓人以為可以打字覆蓋，等於用控件型式暗示了一個不存在的能力。

**為什麼不是 KPI** — `.kpi` 是有邊框的獨立方塊、用在儀表列；本元件是表單卡內的一行讀數。

**分母與單位一起放 `__unit`** — 讓數值本身維持單一焦點；限量版本的上限（`/ 50`）由 consumer 以 `[data-when-edition="limited"]` 控制顯隱。

**Token usage** — `--font-display`／`--fs-28`／`--fw-medium`／`--foreground`（數值）、`--fs-13`／`--muted-foreground`（單位）、`--sp-8`／`--sp-6`。letter-spacing −0.6px 為顯示字體的視覺補償、非 token。

**Consumers** — `product-detail.html`（單一選項的庫存）。

**CSS** — [`stock-readout.css`](./ds-components/stock-readout.css)

### 4.55 Restock log

**`_layer`** · molecule — 補貨紀錄表：每一筆補貨佔一列，欄位各自成欄地對齊。補貨紀錄是拿來比對的（這批比上批多幾件、上次補貨隔了多久），欄位對齊才掃得動，因此取代原本用 `.data-list` 把「數量／日期／供應商」擠成一行標題＋一行 meta 的寫法。

**Anatomy**

```
.restock-log-wrap                  邊框＋--radius-xl 圓角＋水平捲動的外殼
 └ .restock-log(.--with-option)    flex column，min-width 480px
    ├ .restock-log__head           欄位名列（--muted 底、--fs-11、--muted-foreground）
    └ .restock-log__row            一筆補貨（--card 底、--fs-13、逐列 hairline）
       ├ .restock-log__opt         選項組合（表頭與每列的該欄共用此 class，僅 --with-option 時顯示）
       ├ .restock-log__qty         補貨數量（+N，等寬數字）
       ├ .restock-log__muted       日期／供應商這類次要純文字
       └ .badge                    狀態
```

**Variants** — 一個修飾子 `.restock-log--with-option`。多選項商品掛上它才開出「選項組合」欄，欄數由四欄變五欄；不掛時該欄連同表頭整欄不顯示。

**Sizes** — 單一配置。欄寬由 grid 的 `minmax()` 決定，最小寬度 480px，窄視窗靠 `.restock-log-wrap` 水平捲動。

**States**

| State | Selector | Change |
|---|---|---|
| 單選項（預設） | `.restock-log` | 四欄：補貨數量／日期／供應商／狀態，`.restock-log__opt` 為 `display:none` |
| 多選項 | `.restock-log--with-option` | 五欄：最前面多一欄選項組合，`.restock-log__opt` 改為 `display:block` |
| 最後一列 | `.restock-log__row:last-child` | 下緣 hairline 歸零，避免與外殼邊框重疊 |

**Class API**（CSS classes — Props/API = N/A，靜態 CSS 原型）

| Class / modifier | Effect |
|---|---|
| `.restock-log-wrap` | 外殼——`--border` 邊框、`--radius-xl` 圓角、`overflow-x:auto` |
| `.restock-log` | 表身——flex column、`min-width: 480px` |
| `.restock-log--with-option` | 開出「選項組合」欄，欄樣板由四欄換成五欄 |
| `.restock-log__head` | 欄位名列——`--muted` 底、`--font-ui`、`--fs-11`、`--fw-medium`、`--muted-foreground` |
| `.restock-log__row` | 一筆補貨——`--card` 底、`--fs-13`、`--border` 下緣 hairline |
| `.restock-log__opt` | 選項組合儲存格——`--font-ui`、`--fw-medium`、`--foreground`；未掛修飾子時不顯示 |
| `.restock-log__qty` | 補貨數量——`--fw-medium`、`tabular-nums` 等寬數字，讓上下列的位數對齊 |
| `.restock-log__muted` | 次要文字（日期／供應商）——`--muted-foreground` |

**Token usage**（→ Pillar 2 Role）

- `--border`（外框、逐列 hairline）· `--radius-xl`（外殼圓角）· `--muted`（表頭底）· `--card`（列底）
- `--font-ui` · `--fs-11`（表頭）· `--fs-13`（列）· `--fw-medium` · `--foreground` · `--muted-foreground`
- `--sp-8`（欄間 gap）· `--sp-12`（左右內距）

**Notes / gotchas**

- **選項欄的顯隱由修飾子控制，不由 consumer 逐格加 `hidden`。** 表頭與每一列共用同一組 `grid-template-columns`，只在其中一處拿掉儲存格會讓欄位錯位；`.restock-log--with-option` 一掛就同時換掉表頭與所有列的欄樣板。
- **欄寬與 `.variant-table` 走同一套 grid 手法，兩者不共用。** 變體表是可編輯的設定、本元件是唯讀的歷史，欄位語意無關，共用只會讓兩邊互相牽制。
- **水平捲動歸外殼。** `.restock-log` 自己不捲，`min-width: 480px` 撐住欄寬後由 `.restock-log-wrap` 提供捲動，圓角才不會被內容切掉。

**Usage** — 用於商品明細的補貨紀錄卡這類「逐筆歷史、需要跨列比對數量與時間」的唯讀清單。純敘述型的活動紀錄（每筆是一句話、彼此不比對）請留在 `.data-list`。

**Do & Don't**

- ✅ 補貨數量用 `.restock-log__qty` 的等寬數字，讓位數上下對齊。
- ✅ 窄視窗讓外殼水平捲動，保持欄位對齊。
- ❌ 別為了塞更多欄位而改動 `grid-template-columns`——欄數只有四欄與五欄兩種。
- ❌ 別把可編輯控件放進列裡，本元件是唯讀歷史。

**Code example**

```html
<div class="restock-log-wrap">
  <div class="restock-log restock-log--with-option">
    <div class="restock-log__head">
      <span class="restock-log__opt">選項組合</span>
      <span>補貨數量</span><span>日期</span><span>供應商</span><span>狀態</span>
    </div>
    <div class="restock-log__row">
      <span class="restock-log__opt">黑色 / M</span>
      <span class="restock-log__qty">+120</span>
      <span class="restock-log__muted">2026-07-18</span>
      <span class="restock-log__muted">Tainan Studio</span>
      <span class="badge badge--success">已入庫</span>
    </div>
  </div>
</div>
```

**Dependencies** — composes Badge（狀態）。

**Consumers** — `product-detail.html`（補貨紀錄卡）。

**CSS** — [`restock-log.css`](./ds-components/restock-log.css)

### 4.56 Stock tip

**`_layer`** · atom — hover/focus E-Shop 商品清單一列的「狀態」或「庫存」儲存格，浮出一張卡列出額外的庫存細節。Promoted 2026-07-23（使用者反饋：想在這兩欄看到逐選項庫存，而不用另外開補貨彈窗才看得到）。全站每一列都掛這顆——2026-07-23 當天原本只打算給多選項／組合商品，使用者追問「為什麼不是每一列都有」後擴大到單一選項商品，內容依商品是否有選項資料分兩種。

**Anatomy** — `.stock-tip`（`position:relative` 的觸發格，直接掛在既有的 `.product-list__status`／`.product-list__stock` 儲存格上）> `.stock-tip__pop`（`position:fixed` 浮卡，`role="tooltip"`）> 逐行 `.stock-tip__row`（`__name` 標籤 ＋ `__qty` 數字，`--low`／`--out` 修飾子上色）。

**資料來源與範圍** — 內容由 `e-shop.html` 的 JS 產生，依商品是否有選項資料分兩種：

- **有選項資料**（讀 `PRODUCT_MATRIX`／`PRODUCT_VARIANTS`／`BUNDLE_MEMBERS`，跟補貨彈窗共用同一份，不是另外抄一份數字）：
  - 1 軸多選項（如 tee 的尺寸）→ 逐選項一行。
  - 2 軸矩陣（如 hoodie 的顏色×尺寸）→ 攤成單一選項組合一行（如 `S/Black`）。
  - 組合商品 → 攤到成員的選項組合（如 `Coastline hoodie · S/Black`），單一選項成員只列成員名稱。
- **無選項資料**（單一選項商品，如 zine／acetate／pin）：一行——**目前庫存**（讀該列狀態，`data-status="low"／"out"` 對應上色，其餘視為健康）。原本還多一行「低庫存門檻」，2026-07-23 當天先加後拆：先加是使用者反饋「應該要列出庫存數量」（原本只顯示門檻，跟列上「急需補貨」徽章的視覺語境對不上）；同一天使用者再指示整條門檻行移除，只留庫存數量本身——`lowThr()` 與門檻換算邏輯仍保留在共用資料層（補貨彈窗還在用），只是 stock-tip 這顆浮卡不再顯示。

**為什麼定位是 JS 算、不是純 CSS `:hover`** — 這份清單在一個會捲動、頂部有 sticky 篩選列（`.list-toolbar`／`.list-status-row`）的容器裡；固定往同一個方向開，viewport 上緣的列會被 sticky 頂欄蓋到、下緣的列會超出可視範圍。改用 JS 在 `mouseenter`／`focusin` 量測觸發格的 `getBoundingClientRect()`，viewport 上半部的列往下開、下半部的列往上開，並用 `position: fixed` 直接設座標（純 CSS 看不到 viewport 位置，做不到這層判斷）。

**Class API**

| Class / modifier | Effect |
|---|---|
| `.stock-tip` | 觸發格，`position: relative`；JS 在 `mouseenter`/`focusin` 加 `.is-open`、`mouseleave`/`focusout` 移除 |
| `.stock-tip__pop` | 浮卡本體，`position: fixed`、`--shadow-float`、`--radius-md`；預設 `opacity:0; visibility:hidden`，`.is-open` 時淡入 |
| `.stock-tip__row` | 一行——`flex; justify-content:space-between`，選項標籤靠左、數字靠右 |
| `.stock-tip__qty--low` / `--out` | 數字上色 `--status-warning` / `--status-error`；預設（充足）不額外上色 |

**Token usage**（→ Pillar 2 Role）

- bg `--card` · shadow `--shadow-float`（E3，跟 dropdown／readiness pop 同一階）· radius `--radius-md` · text `--foreground` / `--foreground-muted`（標籤）· status `--status-warning` / `--status-error` · font `--fs-12` / `--fw-medium` / `--lh-normal`

**Notes / gotchas**

- **兩個觸發格（狀態欄、庫存欄）內容目前故意一樣**——都是同一份逐選項清單，沒有依欄位分流成「狀態摘要」跟「數字明細」兩種內容（2026-07-23 使用者裁示先求一致，之後要分流再回來改）。
- **列徽章是「急需補貨」（`e-shop.row.low`）時，選項清單只留 `low`／`out` 的選項**（2026-07-23 使用者裁示）——這種列 hover 是要立刻看到哪裡出問題，健康（`ok`）的選項不佔位置；徽章是其他狀態（Live／Sold Out）時清單維持完整、不過濾。判斷依據是該列狀態格裡有沒有 `[data-i18n="e-shop.row.low"]`，不是看選項本身的 status——避免徽章語意以後改了但濾掉的條件沒跟著同步。**這條規則不適用單一選項商品**——那條只有「目前庫存」一行，跟「選項健不健康」無關，不會被這條規則濾掉。
- **`.stock-tip__pop` 是空殼，內容由 JS 在頁面載入時一次性填入兩個觸發格**（狀態欄與庫存欄各自的 `.stock-tip__pop`），不是每次 hover 才重算內容——只有座標是每次 hover 重算。
- **`data-i18n` 不能掛在 `.stock-tip` 本身**：i18n.js 用 `el.innerHTML = v` 套翻譯，會連 `.stock-tip__pop` 這個子節點一起清掉（同一個坑 2026-07-21 在 dropdown icon 上踩過一次）。庫存欄的可翻譯文字（如 `42 / ∞`）要包一層 `<span data-i18n="…">`，`.stock-tip__pop` 當它的手足、不當它的子節點的子節點。
- **別在掛了 `.stock-tip` 的儲存格上留原生 `title` 屬性**：acetate 列的庫存欄原本有 `title="In stock / edition cap"`（限量版說明文字），加了 `.stock-tip` 後兩套 hover 提示同時掛在同一格上會互相競爭、疊出瀏覽器原生 tooltip 跟自訂浮卡兩層（2026-07-23 使用者截圖抓到後移除）。

**Usage** — 掛在 E-Shop 商品清單每一列的「狀態」／「庫存」儲存格；別的頁面若要做類似「hover 看明細」，先確認資料是否真的有選項層級（或其他值得補充的資訊如門檻）可拆，沒有就別硬套。

**Do & Don't**

- ✅ 有選項資料的商品，內容一律從既有的選項資料即時產生，不手key第二份數字。
- ❌ 別把 `.stock-tip__pop` 直接當某個 `data-i18n` 元素的子節點塞——會被 i18n 的 `innerHTML` 覆寫清掉。

**Code example**

```html
<div class="product-list__cell product-list__stock stock-tip" role="cell" tabindex="0">
  <span data-i18n="e-shop.row2.stock">42 / ∞</span>
  <div class="stock-tip__pop" role="tooltip">
    <div class="stock-tip__row"><span class="stock-tip__name">S</span><span class="stock-tip__qty stock-tip__qty--low">2</span></div>
    <div class="stock-tip__row"><span class="stock-tip__name">M</span><span class="stock-tip__qty">18</span></div>
  </div>
</div>
```

**Consumers** — `e-shop.html`（Products 全部 5 列＋Bundles 兩列）。

**CSS** — [`stock-tip.css`](./ds-components/stock-tip.css)

### 4.90 List toolbar

**Purpose** — 清單頁（e-shop、projects）頁頭的控制骨架。把「主軸切換／搜尋／檢視切換／主 CTA／次要篩選」這些原本各自散在頁頭、tabs 列、篩選列的控制項，收成固定的兩層：一層殼層工作列、一層次要篩選列。

**Anatomy**

- `.list-toolbar` — 殼層工作列。實色 `--surface-shell`（淺色主題改 `--card` ＋ `--shadow-card`）、四角 `--radius-xl` 16px、固定 58px 高、`align-items: stretch`。
- `.list-toolbar > .tabs` — 主軸 tab，撐滿整個 58px；active 橘色底線因此貼齊容器下緣而不是浮在中間。
- `.perf-rank__row--click` — 整列可點時加上（游標＋focus 樣式）。排行榜預設唯讀，可點是例外、要看得出來（2026-07-31，內容收益的 Top 10 開內容詳情 popup 用）。
- `.perf-rank--tight` — 名稱欄由 `minmax(64px,148px)` 改成 `minmax(48px,max-content)`。基礎值是為作品名設計的，短標籤清單（星座／MBTI／生肖，2–4 字）在有空間時也會被撐到 148px，窄卡片（`bento--span-4`）裡長條只剩 18px、等於沒作用；本修飾詞把多的寬度全給長條（2026-07-31，實測 18px → 118px）。長名單不要用。
- `.list-toolbar__actions` — 右側動作群，絕對定位、垂直置中，所以 tab 數量變動不會推擠動作。
  - `[hidden]` 有專屬覆寫（`display:none`）：元件自己宣告了 `display:flex`，會蓋過 UA 的 `[hidden]{display:none}`，沒有這條的話 `el.hidden = true` 設得下去、畫面上照樣顯示。動作群要依分頁顯隱時（earnings 的 `[data-tab-actions]`）靠這條（2026-07-31 實測踩到）。
- `.list-status-row` — 次層篩選列，透明、行內流，放 pill 篩選（e-shop 狀態）或 select（projects 發行模式／內容類別）。

**為什麼工作列要釘選高度** — active 底線貼在 `.tabs__item` 下緣，只有讓 tabs 撐滿 58px，底線才會落在殼層最底部。

**不屬於本元件的部分** — sticky 貼頂（`position: sticky` ＋ top 位移）依各頁捲動容器的高度與層疊決定，留在各頁 `<style>`：e-shop 兩層都貼頂（狀態列 top 74px＝58px 工作列＋摺疊後 16px 間距），projects 目前不貼頂。

**Consumers** — `e-shop.html`（類型 tab ＋ 商店設定／預覽／建立分割按鈕 ＋ 狀態 pill 列）、`projects.html`（狀態 tab ＋ 收合搜尋／檢視切換／建立專案 ＋ 兩個篩選 select）。

**Code example**

```html
<div class="list-toolbar">
  <nav class="tabs tabs--underline-short" role="tablist">
    <div class="tabs__item tabs__item--active" role="tab" aria-selected="true">All <span class="tabs__item-count">8</span></div>
  </nav>
  <div class="list-toolbar__actions">
    <div class="search-collapse">…</div>
    <a class="btn btn--primary btn--sm" href="#">＋ New project</a>
  </div>
</div>
<div class="list-status-row">
  <select class="select">…</select>
</div>
```

**CSS** — [`list-toolbar.css`](./ds-components/list-toolbar.css)

### 4.91 Funding panel

**Purpose** — 專案詳情 hero 的募資概況。把「已募多少／目標多少／幾人支持／進度到哪／還剩多久／募資期間」收成一個區塊，取代原本四格 `meta-cell` ＋ 裸 `.project-bar` ＋ 註記各自散開的寫法。版型比照 ztor 公開端共創計畫詳情頁（`cocreate-project.html`），讓後台與粉絲端用同一種讀法看同一場募資。

**Anatomy**

- `.funding-panel` — 面板本體。`--radius-xl` 16px、`--nest-surface` 底、`--shadow-nest-up` 向上陰影；不設寬度上限，撐滿容器（hero 右欄多寬、面板就多寬）。
- `.funding-panel__amount-row` — 大金額列：左 `__amount`（已募金額，display 32px＝面板主角）、右 `__backers`（icon ＋ 支持人數）。
- `.funding-panel__goal` — 目標金額行（`--muted-foreground`、13px）。
- `.funding-panel__bar-row` — 進度條列：內層直接重用 `.project-bar`（不重造量條）＋ `__pct` 百分比藥丸。
- `.funding-panel__status-row` — 左 `__countdown` 倒數、右 `__period` 募資期間。
- `.funding-panel__note` — 底部口徑註記（`info` icon ＋ 文字）。

**層級與邊界做法** — 面板坐在 `.ip-hero`（L1 卡）裡＝L2 巢狀層，依 Q24 只用 `--nest-surface` 疊色 ＋ `--shadow-nest-up` 分層，**不加 1px 邊框**（亮色兩層皆白、單靠向上陰影分層）。參考來源的公開端面板有可見邊框，此處刻意不照抄，避免與 Q24 的層級規則產生第二種答案。

**品牌橘範圍** — `__pct` 藥丸沿用進度條本身的 `--primary`。兩者是同一個資料指示角色（進度讀數），不是新的 active 標示，故不觸及 Q8「橘只給主操作／主分類」的範圍。

**不屬於本元件的部分** — 金額、人數、百分比、天數全部由 consumer 提供；面板不做任何計算，數字一律引用收入管理（規格 §7.3）口徑。

**Consumers** — `project-detail.html`（hero 右欄）。

**Code example**

```html
<div class="funding-panel">
  <div class="funding-panel__amount-row">
    <div class="funding-panel__amount">$8,420</div>
    <span class="funding-panel__backers"><i data-lucide="users" class="ztor-icon ztor-icon--sm"></i> 134 backers</span>
  </div>
  <span class="funding-panel__goal">Goal $15,000</span>
  <div class="funding-panel__bar-row">
    <div class="project-bar"><div class="project-bar__fill" style="width:56%"></div></div>
    <span class="funding-panel__pct">56%</span>
  </div>
  <div class="funding-panel__status-row">
    <span class="funding-panel__countdown">21 days left</span>
    <span class="funding-panel__period">Campaign May 18 – Jul 06, 2026</span>
  </div>
  <p class="funding-panel__note"><i data-lucide="info" class="ztor-icon ztor-icon--xs"></i> Figures reference Earnings (spec §7.3).</p>
</div>
```

**CSS** — [`funding-panel.css`](./ds-components/funding-panel.css)

### 4.?? Owner lookup

- Source: ds-components/owner-lookup.css and partials/owner-lookup.js
- Layer and scope: SiteSpecific organism。站上唯一的「打字找一筆、下拉挑一個」語彙，消費頁：admin-ip-bank-entry.html（權利人）、creators.html（搜尋 ztor 帳號）、create-event.html（bookyay 帶入閘門，2026-08-10 起，見 §4.120 Source import）；artist-picker 亦沿用其搜尋殼。
- Purpose: searches registered Ztor users by display name, username, or email; it outputs a linked user or a pending invite email. No result, incomplete email, and duplicate pending email remain within the same control.
- Anatomy and states: input, result list, identity metadata (name / @username / email), Linked, Pending invite, no result, and duplicate pending.
- Tokens: --popover, --border, --accent, --shadow-float, --sp-*, --fs-*, --foreground, --muted-foreground, --destructive.
- Boundary: the component owns search and selection and exposes getValue() plus ownerlookup:change. The Entry page owns Share validation and localStorage prototype saving. The prototype does not send email.
- **`.owner-lookup__copy` 改成上下兩行（2026-08-10 修）**：這一層原本只設 `min-width: 0`，裡面的 `__name` 與 `__meta` 兩個 `<span>` 於是並排流成同一行——但 `__meta` 的 `margin-top` 與單行省略號（`white-space: nowrap` ＋ `text-overflow`）都是為「自己佔一行」寫的，inline 狀態下通通不生效。補 `display: flex; flex-direction: column` 回到原本設計的樣子。全站產出 `__copy` 的有 `creators.html`、`create-event.html`、`partials/owner-lookup.js`、`partials/artist-picker.js` 四處：前三處的結果列一併從擠成一行變回兩行；`artist-picker.js` 目前零消費（見 §4.92），畫面上沒有差別。
- **`.owner-lookup__result[aria-selected="true"]`（2026-08-10 新增）**：已選中的那一列上 `--accent` 底。給「選取會留著、清單還會再打開」的消費頁用（bookyay 閘門選完之後還能點回輸入框換一場）；creators／artist-picker 選完就收掉、不會重開，不受影響。

---

> **2026-07-29 — 19 支 r2.2 新元件批次 promote。** 以下 §4.92–§4.110 為外部協作者併入的改版帶進的新元件，逐支盤點見 `docs/`（元件盤點）；資料來源為 CSS 實檔＋全站 `grep` 交叉核對消費頁與 JS，不臆測。

### 4.92 Artist picker

**Purpose** — 「＋ 新增藝人」流程下方，已加入藝人的清單列，含尚未在平台上、僅留 email 邀請中的 pending 列。

**狀態：退場候選（2026-07-29 盤點）** — 全站零消費：`grep -rl "ds-components/artist-picker.css" *.html` 無結果；其唯一使用者 `partials/artist-picker.js` 本身也沒有任何頁面用 `<script>` 載入。CSS 與配套 JS 是同一對孤兒——「＋ 新增藝人」這條 2026-07-27 交辦的流程，程式碼寫了但沒有頁面接上。未經使用者裁決前不建議刪除，僅標記待處理。

**Anatomy**
- `.artist-picker__list` — 外層清單容器
- `.artist-picker__row` — 一列已加入的藝人
- `.artist-picker__row--pending` — 邀請中、尚未在平台上的列（虛線邊框、透明底，刻意視覺退一階：the person is not on the platform yet）
- `.artist-picker__remove` — 移除鈕，貼齊列尾
- `.owner-lookup__tag` / `.owner-lookup__result[disabled]` — 本檔補的樣式，class 屬 owner-lookup 家族

**Dependencies** — 搜尋欄與結果 popover 刻意共用 `ds-components/owner-lookup.css` 的 `.owner-lookup__*`，讓站上兩處 lookup 保持同一種視覺語言；本檔只補「已加入清單」那一段。

**Consumers** — 無（見上方狀態）。

**Code example**（依 `partials/artist-picker.js` 模板字串重建；該 JS 未被任何頁面載入，僅為程式碼實際會拼出的字串，非憑空推導）

```html
<div class="owner-lookup artist-picker">
  <div class="artist-picker__list" data-ap-list>
    <div class="artist-picker__row">
      <span class="owner-lookup__avatar"><i class="ztor-icon" data-lucide="user"></i></span>
      <span class="owner-lookup__meta">王小美</span>
      <button class="btn btn--icon btn--xs artist-picker__remove" type="button" data-ap-remove="0">
        <i class="ztor-icon" data-lucide="x"></i>
      </button>
    </div>
    <div class="artist-picker__row artist-picker__row--pending">
      <span class="owner-lookup__meta">pending@example.com</span>
    </div>
  </div>
</div>
```

**CSS** — [`artist-picker.css`](./ds-components/artist-picker.css)

---

### 4.93 Benefit matrix

**Purpose** — 權益比較矩陣：一份權益目錄（列）× 四個粉絲分級（欄）交叉出的表格，取代舊版「四張各自獨立的分級卡」；新增一列權益會自動出現在每一欄，因為欄與列本來就是同一份物件的兩種讀法，不是靠同步機制做到的。

**Anatomy**
- `.bmx__head` / `.bmx__tier` / `.bmx__tier-count` — 表頭：分級名稱＋即時解鎖數
- `.bmx__row` / `.bmx__cell` — 一列權益、列與欄交叉的格子
- `.bmx__label` / `.bmx__own` — 標記創作者自己新增的列
- `.bmx__remove` — 只在 hover/focus 浮現的移除鈕
- `.bmx__warn` / `.is-broken` — 「上層分級卻沒有下層有的權益」的非阻斷性警示
- `.bmx__add` / `.bmx__row--new` — 就地新增一列的輸入態

**Dependencies** — `js/benefit-matrix.js` 渲染全部列與格內容（頁面僅留 `.bmx__head`/`.bmx__body` 空殼）；格子內重用既有 `.amount-field`/`.input`；icon 用 `alert-triangle`（警示）、`trash-2`（移除）。grid 欄寬只宣告一次、表頭與每列共用同一組模板，防欄與標題錯位。

**Consumers** — `tier-benefits.html`（唯一）。

**Code example**

```html
<div class="bmx">
  <div class="bmx__head">
    <span class="bmx__head-label">Benefit</span>
    <span class="bmx__tier"><span class="bmx__tier-count">3</span></span>
  </div>
  <div class="bmx__row" data-row="vip-eshop">
    <span class="bmx__label"><span class="bmx__label-text">VIP e-shop</span></span>
    <span class="bmx__cell"><span class="input">on</span></span>
  </div>
</div>
<div class="bmx__add">
  <button class="btn btn--outline btn--sm" type="button" data-bmx-add>+ Add row</button>
</div>
```

**CSS** — [`benefit-matrix.css`](./ds-components/benefit-matrix.css)

---

### 4.93b Tier overview

**Purpose** — 分級對照表：四個分級並排成欄、每一列是一個比較項目（前 % 名、最低忠誠點數、目前人數，以及每一項權益）。粉絲管理 ▸ 粉絲分級設定用它把原本兩個獨立頁面（分級設定＋分級權益）攤成一張唯讀表。

**為什麼是一張表而不是四張卡** — 這裡的每個問題都是比較題：「核心圈比超級粉絲多什麼」「往下走條件有沒有越來越鬆」。四個分級並排在同一組欄位裡，答案是用看的；拆成四張卡或四個彈窗，答案就得靠記憶。門檻的單調性（往下走前 % 名遞增、最低點數遞減）是儲存的前提，尤其需要並排才驗得出來。

**Anatomy**
- `.tier-ov__head` — 欄頭列：空的列名格 ＋ 四個分級 badge
- `.tier-ov__row` / `.tier-ov__rowlabel` / `.tier-ov__cell` — 一列比較項目；列名可帶 `<small>` 補充
- `.tier-ov__yes` / `.tier-ov__no` — 有／沒有，用色不用圖示大小差異（一整欄掃下來要能立刻數出「這一階拿到幾項」）
- `.tier-ov--compact` — 窄容器變體（列名 132px、欄距 8px），放進兩欄版面的其中一欄時用
- `.tier-ov-scroll` — 640px 以下的橫向捲殼；不硬折行，折行會讓同一列的四個值錯開

**Variants / Sizes** — 預設列名 168px ＋ 四欄 `minmax(0,1fr)`；`--compact` 收窄到 132px。四欄一律等寬，這樣「往右走權益越來越少」才讀得出來。

**States** — 兩個狀態：**預設**（唯讀）與 **編輯**（`.tier-ov.is-editing`，格子換成 `.tier-ov__edit` 裡的輸入框／開關）。兩份內容都在 DOM 裡、用 `display` 切換，不是編輯時才生成——生成式會在切換那一幀重排整張表，而且捨棄時要把原值找回來。

**列高以較高的狀態為基準**（2026-08-01 使用者裁示）：`.tier-ov__cell` 恆為 `var(--control-h-sm)` 高，所以唯讀（一行文字約 19px）與編輯（36px 輸入框）共用同一個高度，切狀態時整張表不會抽高、下面的內容不會整片位移。實測兩態列高完全一致。

`.tier-ov__row--locked` 是編輯態下不可改的列（例如「目前人數」是算出來的）：降一階不給控制項，但不隱藏——它是判斷門檻要怎麼調的依據。

**Token usage** — `--border`（列分隔線）· `--foreground-muted`／`--muted-foreground`（列名、無值）· `--status-success`（有）· `--fs-13`／`--fs-11` · `--sp-8`／`--sp-10`／`--sp-12`

**Usage** — 用在「同一組項目要跨四個分級比較」的唯讀呈現。單一分級的細節不要用它（那是 `.settings-row` 的工作）；需要編輯就換 `.bmx`。

**Do & Don't**
- ✅ 四欄等寬，讓「往右走越來越少」用看的就成立
- ✅ 窄容器改 `--compact`，再窄就包 `.tier-ov-scroll` 橫向捲
- ❌ 別在這支上加輸入框或開關——唯讀是它與 `.bmx` 的分工
- ❌ 別讓四欄寬度不一（有值的欄會自己撐大，比較就失真）

**Evidence** — `fans-crm.html` ▸ 粉絲分級設定分頁（2026-07-31 新增，隨分級設定／分級權益兩頁併入）

### 4.94 Brand card

**Purpose** — 品牌合作目錄卡：創作者挑選聯名對象用，強制區分「Ztor↔品牌的商業條款（唯讀、鎖住）」與「創作者自己搭建的活動（可編輯）」——唯讀條款坐在凹陷面板、掛鎖頭圖示，讓這條界線一眼可辨。

**Anatomy**
- `.brand-grid` — 外層卡片網格；`.brand-card` — 單張卡
- `.brand-card__logo` / `.brand-card__mark` — 品牌 logo 方框，無真實素材時退回字母 monogram
- `.brand-card__title` / `.brand-card__name` / `.brand-card__cat` — 名稱與分類（強制分行，避免中文黏字）
- `.brand-deal` / `.brand-deal__row--share` — 唯讀鎖住的條款面板；抽成比例是本卡唯一放大強調的數字
- `.brand-card__foot` / `.brand-card__method` — 卡片底部動作列

**Dependencies** — `js/brand-campaigns.js` 渲染 `.brand-card__*`/`.brand-deal__*` 全部內容；icon `lock`（條款抬頭）＋依合作方式而定的動作圖示；品牌 logo 讀 `assets/brands/`。

**Consumers** — `brand-campaign-detail.html`、`brand-campaigns.html`。

**Code example**

```html
<div class="brand-grid">
  <div class="brand-card">
    <div class="brand-card__head">
      <span class="brand-card__logo has-logo"><span class="brand-card__mark">S</span></span>
      <span class="brand-card__title">
        <span class="brand-card__name">Starbucks</span>
        <span class="brand-card__cat">餐飲</span>
      </span>
    </div>
    <p class="brand-card__blurb">品牌介紹一句話。</p>
    <div class="brand-deal">
      <span class="brand-deal__head"><i class="ztor-icon" data-lucide="lock"></i>Locked terms</span>
      <span class="brand-deal__row brand-deal__row--share"><span>Your share</span><span class="brand-deal__value">15%</span></span>
    </div>
    <div class="brand-card__foot"><button class="btn btn--primary btn--sm">Start campaign</button></div>
  </div>
</div>
```

**裸值註記** — `.brand-card__mark` 的 monogram 文字色 `color:#fff`（第 71 行）為刻意例外，見 §1.5b。

**CSS** — [`brand-card.css`](./ds-components/brand-card.css)

---

### 4.95 Chart tip

**Purpose** — 折線圖的滑過浮層（tooltip）與可點擊熱區，把「哪一條線被點了」轉成「開哪個類型的明細」。通用的部分（熱區、導引線、標記點、浮層、聚焦淡化機制）進本檔；不通用的部分（每條線是什麼顏色）留在消費頁，由行內 `style="--hue:..."` 指定。

**狀態：待收斂** — `earnings-sony.html` 保留一份規則相同的內嵌 `<style>` 複本（約第 71–107 行），並未 `<link>` 本檔；`chart-tip.css` 檔頭註解自陳「沒有一併移除是為了不在同一輪動到那頁的互動」。下游治理時應排入收斂清單。

**Anatomy**
- `.fin-tip` — 浮層本體；`.fin-tip__row` — 浮層裡每一列都是按鈕，點擊開該類型明細
- `.fin-hitline` — 疊在 2px 線上的透明粗熱區（`pointer-events: stroke`）
- `.fin-dot` — 圖例圓點，色相吃 `--dot`/`--hue`
- `.fin-area` — 聚焦單一類型時才顯示的面積填色
- `.fin-detail__*` — 明細彈窗排版（總額、範圍、排行、佔比）

**Dependencies** — 硬依賴 `ds-components/chart.css`（`.linechart__line`/`.linechart__main`）；`js/project-earnings-chart.js` 產生 SVG 熱區、浮層與明細內容。浮層 `pointer-events:auto` 是因為它是 `.linechart__main` 的子層，滑進去不會觸發外層 mouseleave。

**Consumers** — `project-detail.html`（唯一經 `<link>` 引入者）。

**Code example**

```html
<div class="linechart__main" data-fin-plot>
  <svg><!-- linechart__line / fin-area / fin-hitline / fin-guide / fin-marker 由 JS 產生 --></svg>
  <div class="fin-tip" data-earn-tip hidden>
    <div class="fin-tip__date">2026-07-01</div>
    <button type="button" class="fin-tip__row" data-earn-open="streaming">
      <span class="fin-dot" style="--dot:var(--chart-1)"></span>
      <span>Streaming</span>
      <span class="fin-tip__amt">$12,400</span>
    </button>
    <div class="fin-tip__hint">Click a row for the breakdown</div>
  </div>
</div>
```

**裸值註記** — 浮層陰影 `box-shadow`（第 65 行）未走 `--shadow-*` token，見 §1.5b。

**CSS** — [`chart-tip.css`](./ds-components/chart-tip.css)

---

### 4.96 Checkbox

**Purpose** — 全站自繪 checkbox（含 indeterminate 態），取代瀏覽器原生方塊——原生方塊不吃主題色，深色底上是「灰盒配藍勾」的違和樣式。

**Anatomy**
- `.zcheck` — 根層；`.zcheck__control` / `.zcheck__input` / `.zcheck__box` — 三層結構，真實透明的原生 input 疊在自繪方塊上
- `.zcheck__box::after` — 勾號本體（旋轉 45° 的兩段邊框）
- `:indeterminate` 態 — 畫一條橫槓而非勾
- `.zcheck__label`
- 安全網：`input[type="checkbox"]:not(.zcheck__input)` — 未轉換成 `.zcheck` markup 的裸原生 checkbox，至少給 `accent-color`＋`color-scheme` 兜底

**Dependencies** — 無專屬 JS（原生 `<input>` 行為即可）；不依賴其他元件 CSS；不需要 icon（勾號是 CSS 畫的）。**這不是新設計，是既有統一設計系統既定 checkbox 的 port**，2026-07-28 使用者裁決三個尺寸調整（18→16px、2.5→2px 筆畫、6×10→5×9 勾），理由是量測事實（控件比它要說明的那行字還高），非品味判斷。

**Consumers** — `create-project.html`、`order-detail.html`、`ip-market.html`、`project-detail.html`、`brand-campaigns.html`、`create-event.html`、`manage-ip.html`、`register-ip.html`（定價的「請洽詢」勾選）、`earnings-sony.html`（捐贈確認）、`earnings.html`／`earnings-ztor.html`／`earnings-overview.html`（`partials/payout-request-modal.js` 的提款確認）。

**唯一的勾選控件（2026-08-06 Q53）** — 站上確認類勾選不另外加容器框。原本提款／捐贈彈窗的 `.payout-confirm` 是「灰底＋內描邊＋內距」的框住一整列，裡面又是一顆靠 `accent-color` 染色的原生 checkbox；2026-08-06 使用者裁示「不需要有一個框框，我們的元件樣式應該沒有這樣？有的話請統一改掉」，該族群連同 `manage-ip` 的 `.mi-onreq`、`register-ip` 的 `.ri-onreq` 一起退場，全部改吃本元件。要與上一個區塊拉開距離時用 `mt-8`／`mt-16` 工具類，不要為此新增變體。

**Radio（`.zradio`，⚰️ 已退場・tombstone）** — 2026-08-09 曾把 `create-event.html` 的頁內 `.zradio*`（與 `.zcheck` 同一套「畫出來的控件疊在真實原生 input 下」寫法，套用到 `<input type="radio">`）promote 進本檔，用於票種卡購票規則區塊（購票條件／限購／折扣）的單選。**同日使用者裁決「建活動頁的樣式一律以既有 design system 為主，不留頁內自造的平行做法」**，`.zradio*` 全數撤場，改用既有 [Radio list](#radio-list)（`ds-components/radio-list.css` 的 `.radio-list`），不留第二種單選視覺。CSS 已從本檔整段移除，原處只留 tombstone 註解（`ds-components/checkbox.css` 第 183 行附近）；勿再新增 `.zradio*`。原 anatomy 供追溯：`.zradio-group`（`role="radiogroup"`，直排容器）＞ `.zradio`（單一選項 `<label>`）＞ `.zradio__control`（`.zradio__input` 真實 `<input type="radio">` 透明疊底＋`.zradio__dot` 畫出來的圓環）＋ `.zradio__label`；間距規則（`.rule > .zradio-group`）已一併搬到 `ticket-tier-card.css` 並改名為 `.rule > .radio-list`。

**Code example**（擷取自 `create-project.html` 第 167 行）

```html
<label class="zcheck">
  <span class="zcheck__control">
    <input class="zcheck__input" type="checkbox" checked>
    <span class="zcheck__box"></span>
  </span>
  <span class="zcheck__label">Digital</span>
</label>
```

**裸值註記** — `--zcheck-ink: #271302`（第 118 行）與其 fallback（第 131 行）為刻意例外，見 §1.5b。

**CSS** — [`checkbox.css`](./ds-components/checkbox.css)

---

### 4.97 Detail sheet

**Purpose** — 清單頁點一列開「細節頁」時的全螢幕覆蓋層（iframe 內嵌同一頁 `?embed=1`），取代整頁導航，讓清單頁的篩選／分頁／捲動位置不被打斷。沿用站上已有的 embed-modal iframe 手法，而非重做一份頁面——覆蓋層裡的細節頁永遠不會跟直接開的那一份長得不一樣。

**Anatomy**
- `.detail-sheet` — 根層；`.detail-sheet__panel` — 由下往上推出的近全版卡片
- `.detail-sheet__head` / `.detail-sheet__back` — 帶「回哪裡」文字，不是孤零零的 ✕
- `.detail-sheet__frame` — 內嵌 iframe，`[data-loading]` 態避免白閃
- `.is-closing` — 反向收合動畫
- `[data-sheet-link]` — 標記可點開細節頁的清單列
- `body.has-detail-sheet` — 開啟時鎖住底層頁面捲動

**Dependencies** — `js/detail-sheet.js`；概念上是 `ds-components/embed-modal.css` 的全螢幕版本（各自獨立 class，無共用選擇器）。z-index 90，明確高於 zselect 面板(60)／embed-modal(80)，需與那兩支共存時留意堆疊順序。

**Consumers** — `pickup.html`、`earnings-sony.html`、`index.html`、`projects.html`、`ip-market.html`、`earnings.html`、`orders.html`、`events.html`、`fans-crm.html`、`e-shop.html`（10 頁，全站清單頁的共同覆蓋層）。

**Code example**

```html
<div class="detail-sheet" hidden>
  <div class="detail-sheet__panel">
    <div class="detail-sheet__head">
      <button class="detail-sheet__back"><i class="ztor-icon" data-lucide="arrow-left"></i>Back to Projects</button>
      <h2 class="detail-sheet__title">Project name</h2>
      <div class="detail-sheet__actions">
        <button class="detail-sheet__btn"><i class="ztor-icon" data-lucide="external-link"></i></button>
        <button class="detail-sheet__btn"><i class="ztor-icon" data-lucide="x"></i></button>
      </div>
    </div>
    <iframe class="detail-sheet__frame" data-loading></iframe>
  </div>
</div>
```

**裸值註記** — 遮罩底色（第 34 行）與 `--shadow-overlay` 的 fallback 字面量（第 47 行）為裸值，見 §1.5b（遮罩值判定為「應收斂」，非乾淨例外）。

**CSS** — [`detail-sheet.css`](./ds-components/detail-sheet.css)

---

### 4.98 Explainer

**Purpose** — 欄位標籤旁的 info 圖示，點開一個正式的說明彈窗——取代「同一句提示在畫面上重複出現 N 次」；完全相同的說明只該有一份，從一個 icon 進去，不該逐處內嵌。

**狀態：`media-vault.html` 為死引用（待清）** — 該頁 `<link>` 引入 `explainer.css` 且 `<script>` 載入 `js/explainer.js`，但頁面內 `explain-btn`／`data-explain` 用例為 0，連結了元件卻沒有實際用法。

**Anatomy**
- `.explain-btn` — 觸發鈕；`.explain` — 彈窗本體
- `.explain__dialog` / `.explain__head` / `.explain__title` / `.explain__close`
- `.explain__body` — 只有內文捲動，標題固定
- `.explain__steps` — 編號步驟（「怎麼算出來的」用步驟而非一段文字）
- `.explain__example` — 舉例框，與抽象規則分開
- `.explain__rule` — 讀者不能漏看的那句結論

**Dependencies** — `js/explainer.js` 開關彈窗；icon `info`（觸發鈕）、`x`（關閉鈕）；不依賴其他元件 CSS。

**Consumers** — `brand-campaign-detail.html`、`tier-settings.html`、`brand-campaigns.html`、`tier-benefits.html`（皆有實際用例）；`media-vault.html` 見上方狀態。

**Code example**（擷取自 `brand-campaigns.html` 第 103 行）

```html
<button class="explain-btn" type="button" data-explain="explain-howitworks" aria-label="How brand campaigns work">
  <i data-lucide="info" class="ztor-icon"></i>
</button>
<div class="explain" id="explain-howitworks" hidden>
  <div class="explain__dialog">
    <div class="explain__head">
      <h2 class="explain__title">How it works</h2>
      <button class="explain__close"><i data-lucide="x" class="ztor-icon"></i></button>
    </div>
    <div class="explain__body">
      <p class="explain__lead">一句結論。</p>
      <p class="explain__rule">最重要的那句話。</p>
    </div>
  </div>
</div>
```

**CSS** — [`explainer.css`](./ds-components/explainer.css)

---

### 4.99 Fans guide

**Purpose** — 「粉絲經營怎麼玩」整頁式說明頁（非操作手冊）：四個能力（排行、矩陣、階梯、流程）各自用自己真實的資料形狀呈現，捲動時逐一「登場」——四張一樣的卡片會是對產品的謊言，所以每一幕都長成它要說明的那個東西的形狀。

**Anatomy**
- `.fg` — 頁面根層級，掛動效變數；`.fg-climb` / `.fg-act` / `.fg-act__rung` — 連續攀爬軌道與掛在軌道上的每一幕
- `.fg-rank` — Act 1 排行列表（`.fg-rank__fill` 依序展開）
- `.fg-matrix` / `.fg-dot--on` — Act 2 權益矩陣
- `.fg-ladder` / `.fg-tier--top` — Act 3 分級階梯（`column-reverse`，從底部往上蓋牌）
- `.fg-flow` / `.fg-step--payoff` — Act 4 流程（由左至右，payoff 步驟最後抵達並獲得強調色）

**Dependencies** — 無獨立元件 JS；進場動畫（`.fg--motion`/`.is-in`）是 `fans-guide.html` 頁內自帶的 inline `<script>`（`IntersectionObserver`）。`js/fans-guide-firstrun.js` 是另一支功能（首次造訪橫幅），與本頁視覺內容非同一件事，只是同時被多頁載入。

**Consumers** — `fans-guide.html`（唯一，本身就是整頁元件）。

**Code example**（擷取自 `fans-guide.html` 第 46–50 行）

```html
<div class="fg fg--motion">
  <section class="fg-climb">
    <section class="fg-act" data-fg-act>
      <span class="fg-act__rung"></span>
      <div class="fg-act__head">
        <h2 class="fg-act__title">先知道誰是真的粉絲</h2>
        <p class="fg-act__body">追蹤數只告訴你有多少人……</p>
      </div>
      <div class="fg-demo">
        <ol class="fg-rank">
          <li class="fg-rank__row">
            <span class="fg-rank__n">1</span>
            <span class="fg-rank__name">王小美</span>
            <span class="fg-rank__bar"><span class="fg-rank__fill" style="--w:1"></span></span>
            <span class="fg-rank__val">2,400</span>
          </li>
        </ol>
      </div>
    </section>
  </section>
</div>
```

**裸值註記** — 兩處大標字級 `font-size: clamp(...)`（第 57、150 行）為 `clamp()` 排版級距的刻意例外，見 §1.5b。

**CSS** — [`fans-guide.css`](./ds-components/fans-guide.css)

---

### 4.100 Inline edit（已退場・墓碑檔）

**狀態：已退場（墓碑）** — 整份檔案只有一段棄用註解，不含任何實際樣式規則；檔頭第一行寫著「✝ SUPERSEDED — do not link this file, do not add rules here.」全站確實沒有任何 `<link>` 指向它，過去也從未被連結過。`shared.css` 已在其「檢視模式」段落（`.pd-tabbar` 附近）實作了等效行為，兩份檔案各自定義同一件事正是這個 codebase 反覆踩過的坑，故規則只留在 `shared.css`。

**方法論備忘** — 本檔曾一度被誤判為「已在使用」，原因是作者自己寫的「是否已連結」檢查只用字串比對搜尋 `project-detail.html` 是否出現 `"ds-components/inline-edit.css"` 這個字串——結果命中了一段中文程式碼註解（註解裡恰好提到這個路徑），檢查誤判通過，真正的 `<link>` 標籤從未被插入。教訓：對一整份檔案做子字串比對會誤中註解，檢查「是否被載入」應該找實際的 `<link ... href="...">`，不是字串比對本身。

**Anatomy** — 無（檔案內無任何 CSS 選擇器）。

**Consumers** — 無（零消費，且應保持零消費）。

**CSS** — [`inline-edit.css`](./ds-components/inline-edit.css)（勿連結、勿在此加規則）

---

### 4.101 Manage IP

**Purpose** — 「管理我的 IP」頁專屬版面補丁——只補既有元件拼不出來的排列（狀態徽章列、驗證橫幅、授權範圍 chip 列、定價預覽、刪除確認），元件本身沿用既有的 `ds-components` 家族，顏色／間距／字級全部走 token。

**Anatomy**
- `.mi-verify` — 兩行式驗證橫幅（疊在 `.info-banner` 上）；`.mi-verify__title` / `.mi-verify__text`
- `.mi-chips` / `.mi-dot` — 身分列下方的狀態徽章、類型分隔點
- `.mi-chiprow` — 授權範圍多值改成可換行的 chip 列
- `.mi-preview` — 「承租方會看到」的即時定價預覽（唯讀、虛線框）
- `.mi-danger` / `.mi-del-dialog` / `.mi-del-list` — 刪除區與刪除確認彈窗（殼借用全站 `.payout-dialog`）

**Dependencies** — 無獨立 `js/manage-ip.js`；行為分散在頁內 inline script 與 `js/ip-price.js`、`js/ip-store.js`。疊加在 `.info-banner`、`.payout-modal`/`.payout-dialog`、`.badge` 之上，本檔不重新定義這些殼；icon `alert-triangle`、`eye`、`x`。

**Consumers** — `manage-ip.html`（唯一）。

**Code example**（擷取自 `manage-ip.html` 第 51–71 行）

```html
<div class="info-banner mi-verify" id="mi-verify" hidden>
  <i data-lucide="alert-triangle" class="ztor-icon"></i>
  <div>
    <div class="mi-verify__title">尚待驗證</div>
    <div class="mi-verify__text">請提供證明文件以完成驗證。</div>
  </div>
</div>
<div class="mi-chips">
  <span class="badge badge--neutral">上架中</span>
  <span class="mi-dot">·</span>
  <span class="badge badge--neutral" id="mi-verify-badge">未驗證</span>
</div>
```

**CSS** — [`manage-ip.css`](./ds-components/manage-ip.css)

---

### 4.102 Media vault

**Purpose** — 加密媒體庫（Fans → 媒體庫）：把「這座庫房現在誰打得開」變成版面的一部分（門條、鑰匙數），而非藏在設定頁分頁裡；同時支援圖片／影片／音檔三種原生分區，三者刻意不是同一種格子，各自對應媒介本來的形狀。

**Anatomy**
- `.vault-overview` / `.vault-ovcard(__cover|__body|__name|__meta|__reach|__num)` / `--new` / `.is-locked` — 庫房總覽卡片牆。**2026-08-01 起只用於保存檔 `media-vault-popup.html`**（`<html data-vault-view="popup">`）：使用者試用後裁示正式頁改回清單與詳情並排的版本，理由是可以直接切換庫房、也直接編輯 media，不必先開再關一層彈窗。兩種版型共用同一支 `js/media-vault.js`。原本的用意——2026-07-31 使用者裁決取代常駐的左側清單欄——全站導覽已經是左欄，庫房清單再一欄就變兩條並排；清單天生垂直（縮圖／名稱／內容數／鑰匙數）轉橫排塞不下，所以改成不要同時出現。封面在卡片牆上放得比 276px 側欄大得多
- `.vault-modal` / `.vault-modal__sheet` / `.vault-modal__body` — 單一庫房＝彈窗（外殼沿用 `.embed-modal`，只換尺寸與內部捲動）。同樣只用於保存檔。彈窗裡沒有全站導覽，所以清單可以留在左邊：只有一條左欄，並排的問題就不存在，換庫房也不必關掉彈窗。庫房名字只寫在彈窗標題列（捲不走），內文不重複第二次；`.vault-rail` / `.vault-reach` 在彈窗內的貼頂高度歸零（捲動容器換成 `.vault-modal__body`）
- `.vault-item__preview` / `__facts` / `__glyph` / `__actions` — 單一內容的設定（2026-08-01）：點格子／音檔列打開右側 `.drawer`。用抽屜不用第二層彈窗——庫房本身已是一層彈窗，再疊一層會變成對話框中的對話框，也會蓋掉剛才點的那一格。內容只放這座原型真的有的欄位（名稱可改；類型／長度／大小／加入日期唯讀）與既有的刪除動作；權限、有效期、浮水印等沒有上游規格的東西不擅自生出來
- `.vault-viewer` — 檢視器只是「眼睛圖示＋一個標準 DS `.select`」的一列，**不外包自己的框**（2026-08-01：先前外層有邊框＋底色，內層 zselect 又有自己的邊框與聚焦環，疊成框中框）；檢視中的狀態由圖示轉品牌橘表示
- `.vault-lens` / `.vault-viewer` / `.vault-viewer.is-on` — 檢視器列：橫跨在庫房與內容正上方、靠右，選一個分級就把整座庫房換成那一級粉絲看到的樣子。並排版靠左、與內容切齊同一條左邊界，「回到我的視角」排在下拉右邊。2026-08-01 使用者裁示搬進彈窗標題列——它問的是「這座庫房從粉絲那一側長怎樣」，那是進到庫房裡才要問的問題；標題列捲不走，切了分級之後往下看內容時身分要一直在
- `.vault-layout` — 根層（2026-08-01 起清單靠右：`grid-template-columns: 1fr 276px` ＋ 用 `order` 換位置、不動 DOM 順序，讀屏與 Tab 仍先碰到清單；窄版收單欄時清單回到內容上方）；`.vault-rail` / `.vault-row` / `.vault-row--active` / `.is-locked` — 側欄庫房清單（打不開的庫房變暗）；`.vault-rail__new` 在清單之上，`.vault-rail__draft` — 新庫房名字欄，清單第一列
- `.vault-reach`（sticky, `top: --sp-16`；`.is-stuck` 由 JS 掛，吸住時才用 `::before`／`::after` 上下各鋪一塊方角的頁面底色（上補貼頂間距、下補與下一張卡之間的縫，否則捲上來的內容會從那道縫被看見一小截）。**不用 `box-shadow`**：它跟著元素圓角走，四個角補不到，下一張卡的圓角會從角落露出來。`left/right: -1px` 是因為絕對定位對齊的是內距框，會被 1px 邊框讓出縫——用 box-shadow 而不是 `::before`，因為前者貼的是邊框框、後者對齊內距框會被 1px 邊框讓出縫）— 「誰進得來」：讀數＋分級覆蓋條＋拆分讀數。2026-07-31 從門條的右欄搬出來自成一塊並吸頂——它是全頁唯一的即時回饋（改一條條件數字當場變），往下捲時要一直在；留在門條裡不行，`position: sticky` 只在自己父層還在畫面上時有效。`.is-shut` ＝ 沒有任何路進得來（紅字）
- `.vault-door` / `.vault-door__col` / `.vault-door__fine` — 門條（單欄）：解鎖條件＋細則。讀數搬走後並排的理由（左因右果）不存在，改成各佔一整行
- `.vault-keys` / `.vault-keys__head` — 「已發出的鑰匙」（區塊右上是「發一把鑰匙」，與庫房標頭的「分享權限」同一個抽屜、不同高度的入口；2026-08-01 去重，兩顆不再共用同一個標籤）：2026-07-31 使用者裁示從門條卡片下緣的一列升成獨立區塊（定義在 vault-share.css）。條件是「哪一群人自動符合」，鑰匙是「我親手把權限交給了誰」，塞在條件那張卡裡會被讀成條件的附註
- `.vault-door__label` — 這一頁的**區塊標題**（解鎖條件／誰進得來／已發出的鑰匙／這座庫房裡）。名字帶 `__label` 是歷史遺留，角色是標題：2026-07-31 使用者裁示從「12px 全大寫加字距 muted」的欄位標籤規格，改吃 `.card__title` 的既有規格（`--font-display` 18px Regular 前景色），與全站區塊標題一致；圖示 16px 維持 muted 色
- `.vault-door__group(--boxed)` / `.vault-door__all` / `.vault-door__sep` / `.vault-door__addgroup` — 「進得來的方法」：一個 group ＝ 一種方法，方法之間「或是」、方法內的條件要一起達成（2026-07-31，見下方 PG-025）
- `.vault-gridbar` / `.vault-gridbar__right` — 內容區標題列：右側是計數與「新增內容」鈕（庫房有內容時才出現）
- `.vault-empty` — 空庫房的唯一畫面（`.upload-tile` 的加高版，同時是說明與投放目標）
- `.vault-grid` / `.vault-tile` / `.vault-tile--label` — 內容格：圖片 1:1、影片 16:9、音檔改標籤紙
- `.vault-tracks` / `.vault-track` — 音檔改清單列而非格子
- `.vault-tile__rename` / `.vault-tile__confirm` — 就地改名／就地刪除確認（不用 `window.prompt`）
- `.vault-gate` / `.vault-gate[hidden]` — 上鎖遮罩；`[hidden]` 那條必須留著，否則沒上鎖的庫房也會被罩住

**2026-07-31 使用者裁決（版面重整，四條）**
1. 檢視器的作用範圍是整頁，所以自成一列放在庫房與內容之上、靠右對齊（與主欄的「分享權限」共用右邊界）；先前放側欄會被讀成清單篩選器、放頁首動作列會被讀成一顆按鈕。檢視中的狀態不另外寫成一句話——側欄逐列標「打不開」、主欄蓋遮罩、下拉自己轉品牌橘已經把狀態說完，這一列本身只是版面、不上底色（內容靠右之後整條上色會變成一大片空色塊）；「回到我的視角」排在下拉左邊，讓下拉守住最右邊界。
   同一輪撤掉頁首的 `.page-intro__actions`：建立庫房的入口只留側欄 `.vault-rail__new` 一顆，並移到 `.vault-rail__list` 之上，跟按下去長出來的第一列草稿連在一起。
2. 空的分區不再出現（`.vault-group--empty` / `__empty` 已退場）。一座新庫房原本會連續印出四塊「這裡沒有東西」；改成空庫房只給一張 `.vault-empty`，「三種媒體會各自歸位」那句教學在那裡講一次，分區有內容才長出來。
3. 上傳入口隨狀態換位置：空的時候是 `.vault-empty` 整塊，有內容之後收進 `.vault-gridbar` 右邊的 ghost 按鈕。兩者都掛 `[data-vault-upload]`，共用住在標題列裡的同一個 `<input type=file>`；拖放一律綁在 `[data-vault-grid]` 容器，跟長什麼樣子無關。
4. 說明各歸各位：條件細則（何時重算）貼著條件放成 `.vault-door__fine`，整頁的原型聲明降級為頁尾 `.page-note`。兩者都不再是壓在媒體清單下面的 `.info-banner`。
5. 上傳入口不縮成標題列上的小按鈕（2026-07-31 第三輪）：空的與有內容都是同一塊 `.vault-empty` 方框，只換標題（「這座庫房還是空的」／「新增內容」），有內容時矮一階（`--filled`）。方框同時是拖放目標，畫小等於把最省事的那條路藏起來。可放哪三種用 `.vault-empty__kind` 三顆圖示晶片講。

**「進得來的方法」（2026-07-31，原型先行、待上游裁決 — ASSUMPTIONS PG-025）**

`rules` 從單層條件陣列改成「方法」清單 `[{items:[{t,v},…]},…]`：**一個 `{}` ＝ 一種進得來的方法；任何一種達成就進得來，同一種方法裡的條件要全部達成。**

例：方法一＝「核心圈 ＋ 買過黑膠」，方法二＝「出席過簽名會」——兩種中一種就開得了門。

- **方向是外層任一、內層全部**（不是反過來）。創作者腦中的東西是「我開了幾條路給粉絲走」，每條路各有幾個門檻；反過來同樣算得出結果，但要人自己在腦中補括號。
- **措辭不用邏輯符號**：畫面上寫「這些要一起達成」「或是」「多一種進得來的方法」，不寫「且／或／AND／OR」。門條是給創作者看的，不是給工程師看的。
- **漸進顯示**：框只在該方法有兩個以上條件時才畫（一個條件不需要圈起來）；「或是」在有兩種方法時才出現。
- **空的方法不算達成**（`groupMatches` 回 false）：「還沒填完」不能等於「誰都進得來」，否則剛加一種方法還沒選條件，門就對全站開了。刪到空的方法自動消失（最後一種留著當落點）。
- **鑰匙不受影響**：它是持有者憑證，永遠疊在條件之上（`reachAll` 先看 `keyHolders`）。拆分讀數「靠條件／靠鑰匙／重疊」語意不變。
- **遮罩上的條件直排**：一種方法一行、同行條件用「＋」串起，行間寫「或是」——橫排時斷行會讓人看不出括號在哪。
- 資料層 API：`V.ruleMatches(vault, fan)`、`V.ruleCount(vault)`（判斷「有沒有設條件」用它，`rules.length` 數的是方法數）。
- 舊資料（單層、語意為任一）搬遷＝每個條件各自成為一種方法，語意不變。

---

### 4.103 Perf rank

**Purpose** — 「表現排行」統一列語法（序號·名稱·長條·[百分比]·數值），給 Dashboard 與 Performance 分頁的 8–11 列排行榜共用，取代原本壓在色塊上的 `.rank-bar`——那支名稱疊在色塊上面，適合 4–6 列的佔比，不適合需要「用眼睛沿著同一條基準線比長度」的長排行；兩者並存，各司其職。

**Anatomy**
- `.perf-rank__row` — grid 五欄（或 `.perf-rank--nopct` 四欄）
- `.perf-rank__track` / `.perf-rank__fill` — 長條軌道與填色（`--w` 為呼叫端算好的比例）
- `.perf-rank__row--rest` — 「其他」彙總列，降一階弱化
- `.perf-twin` — 雙欄排行並置（例如「依人數排」與「依時長排」對照）
- `.perf-hero__value` / `.perf-hero__sub` — Hero 大數字卡與其副指標
- `.perf-rank--animate` — 長條從 0 展開的進場動畫
- `.perf-rank--wide` — 名稱欄改吃比例（`2fr` 對長條的 `1fr`）、不設固定上限，給整句式的標題用（作品全名、貼文標題）；預設的 148px 是為片名／歌名／平台名訂的，一整句塞進去只剩省略號，而換成更大的固定值永遠會被更長的標題突破

**Dependencies** — `js/performance-store.js` 與 `js/audience-store.js`（產生 `.perf-rank__*`、`.perf-cap`、`.perf-hero__*` markup 的兩個來源）；不依賴其他元件 CSS，色相走 `--hue`（消費端指定 `--chart-*` token）。

**Consumers** — `index.html`、`project-detail.html`、`audience-report.html`、`fan-analytics.html`。

**Code example**

```html
<ol class="perf-rank">
  <li class="perf-rank__row" style="--w:100%; --hue:var(--chart-3)">
    <span class="perf-rank__idx">1</span>
    <span class="perf-rank__name">Spotify</span>
    <span class="perf-rank__track"><span class="perf-rank__fill"></span></span>
    <span class="perf-rank__pct">30.6%</span>
    <span class="perf-rank__val">486,200</span>
  </li>
</ol>
```

**CSS** — [`perf-rank.css`](./ds-components/perf-rank.css)

---

### 4.104 Sortable

**Purpose** — 全站表格唯一的排序互動：把欄位標題包成按鈕，靜止時與純文字標題完全一樣，只有 hover/聚焦或正在排序時才出現方向指示——表頭不該長得像工具列。

**狀態：`tier-benefits.html` 為死引用（待清）** — 該頁 `<link>` 引入 `sortable.css?v=r2.2`，但頁面內無 `.sort-th`/`.table-head`，也未載入 `js/table-sort.js`。

**Anatomy**
- `.sort-th` — 根層；`.sort-th--end` — 數字欄（右對齊，caret 在前）
- `.sort-th__ind` — 固定尺寸的指示井，caret 淡入淡出零位移
- `[data-sort-state]` × `[data-sort-first]` — 決定顯示 ▼ 或 ▲：看的是「這一欄第一次點是遞增還是遞減」，不是單純的排序方向——文字欄第一次點是遞增、數字欄第一次點是遞減，兩者卻都顯示 ▼
- `.table-head` — grid 表格家族的表頭列（與資料列共用同一組 `grid-template-columns`）
- `.table-scroll` — 寬表格在窄螢幕橫向捲動而非重排成卡片

**Dependencies** — `js/table-sort.js`（執行期把 `<th data-sort>` 或 `<span data-sort>` 包裝成 `<button class="sort-th">`，也負責實際排序邏輯）；兩種表格家族 `.ztor-table`（真 `<table>`）與 `.data-list`/`.msg-history`（grid 列）。

**Consumers** — `earnings-sony.html`、`brand-campaigns.html`、`fans-crm.html`；`tier-benefits.html` 見上方狀態。

**Code example**（`.ztor-table` 家族擷取自 `earnings-sony.html` 第 333 行；`data-sort` 屬性經 JS 於執行期轉為 `<button class="sort-th">`）

```html
<tr>
  <th data-sort="text">Item</th>
  <th data-sort="text">Category</th>
  <th class="sort-th--end" data-sort="num">Amount</th>
</tr>
```

grid 家族範例（擷取自 `fans-crm.html` 第 200–210 行）：

```html
<div class="table-head fan-row">
  <span data-sort-key="name">Fan</span>
  <span class="table-head__end" data-sort="num" data-sort-key="rep">Loyalty points</span>
</div>
```

**CSS** — [`sortable.css`](./ds-components/sortable.css)

---

### 4.105 Numeric stepper（`.zstep`）

> 與 §4.1 Inventory 中另一支「Stepper」（wizard 進度圓圈，`shared.css`）為不同元件，命名相近但不共用 CSS，勿混淆。

**Purpose** — 數字輸入框的上下增減鈕，取代瀏覽器原生 spin button——`input[type="number"]` 的原生灰色雙箭頭是 user-agent 控件，不吃站上任何 token；與 checkbox（§4.96）同屬「原生控件在深色底上違和」的問題家族。

**Anatomy**
- `.zstep` — 根層；`.zstep__btns` / `.zstep__btn` — 右側 28px 寬的按鈕欄，`tabindex="-1"`（不佔 Tab 順序，因為 input 本身已支援 ↑/↓，做成 tab stop 會多兩個重複停點）
- `.zstep--nounit` — 沒有單位字尾時的版型
- `.zstep__btn[disabled]` — 到極限時的「已耗盡」態
- `.zstep:has(.zstep__input:disabled)` / `[readonly]` — 唯讀／停用時整欄隱藏按鈕

**Dependencies** — `partials/stepper.js`（設定 disabled 態、實際增減邏輯）；**組合式依賴** `.amount-field`／`.amount-field--suffix`／`.amount-field--readonly`（單位字尾元件，定義在 `ds-components/amount-field.css`，本檔只加按鈕欄並把單位往左推）；icon `chevron-up`、`chevron-down`。

**Consumers** — `create-project.html`（唯一）。

**Code example**（擷取自 `create-project.html` 第 480–485 行）

```html
<div class="amount-field amount-field--suffix amount-field--readonly zstep">
  <span class="amount-field__unit"><span class="amount-field__sym">%</span></span>
  <input class="amount-field__input input zstep__input" type="number" min="0" max="100" step="1" value="10">
  <span class="zstep__btns">
    <button class="zstep__btn" type="button" data-step="up" tabindex="-1" aria-label="Increase"><i data-lucide="chevron-up" class="ztor-icon"></i></button>
    <button class="zstep__btn" type="button" data-step="down" tabindex="-1" aria-label="Decrease"><i data-lucide="chevron-down" class="ztor-icon"></i></button>
  </span>
</div>
```

**CSS** — [`stepper.css`](./ds-components/stepper.css)

---

### 4.106 Sticky actions

**Purpose** — 頁面頂部 CTA 捲出畫面後，在畫面底部浮現一條複製版動作列，讓「儲存」「發布」這類按鈕捲動後仍可觸及。**為什麼是吸底而不是吸頂**：app 外殼已有一條 `position:sticky` 的頂列，且 `position:sticky` 只在「父層還在畫面內」時有效，原本那排按鈕捲出畫面時複製一份到吸底列即可、版面零改動、行為全站一致。

**Anatomy**
- `.sticky-actions` — 根層；`.sticky-actions__inner` — 內容列（右對齊，與原本按鈕排列一致）
- `[hidden]` — 收起時整個移出無障礙樹與 Tab 順序
- `[data-enter]` — 進場前態（位移＋透明，供 JS 觸發轉場）
- `.main[data-sticky-pad]` — 顯示時把頁面內容墊高，避免蓋住底部內容

**Dependencies** — `js/sticky-actions.js`（偵測原始 CTA 是否捲出畫面、複製按鈕、動態設定 `left`/`right`/`padding`）；視覺語彙沿用 `.ss-actionbar`（同產品內另一處吸附式動作列），但獨立定義自己的 class，非硬性 import。

**Consumers** — `order-detail.html`、`admin-ip-bank.html`、`manage-ip.html`、`event-detail.html`、`creators.html`、`earnings.html`、`bundle-detail.html`、`project-detail.html`、`tier-benefits.html`、`settings.html`、`tier-settings.html`、`auction-detail.html`、`product-detail.html`、`pickup-detail.html`、`fans-crm.html`（15 頁，全站範圍最廣的元件之一）。

**Code example**

```html
<div class="sticky-actions" data-sticky-actions hidden>
  <div class="sticky-actions__inner">
    <button class="btn btn--outline">Cancel</button>
    <button class="btn btn--primary">Save</button>
  </div>
</div>
```

**裸值註記** — 吸底列上緣陰影 `box-shadow: 0 -6px 16px rgba(0, 0, 0, 0.08)`（第 31 行）未走 `--shadow-*` token，見 §1.5b。

**CSS** — [`sticky-actions.css`](./ds-components/sticky-actions.css)

---

### 4.107 Toast

> 本節同步校正 §4.1 Inventory 的「Toast」行——原標記為未採用的 shadcn baseline，r2.2 併入外部改版後已有真實實作，該行資訊過時，已於本輪一併更新。

**Purpose** — 畫面底部中央的短暫確認提示（由下往上滑入），並附帶 Save 按鈕的「未儲存/已儲存」狀態列（`.save-status`）。**為什麼是底部中央而不是角落**：被確認的東西活在頁面裡，觸發它的動作按鈕在頂部，底緣的 toast 永遠不會蓋住剛編輯過的內容。

**Anatomy**
- `.ztor-toasts` — 容器；`.ztor-toast` — 單則提示
- `.ztor-toast--error` — 錯誤色態（圖示轉 `--destructive`）
- `.ztor-toast.is-leaving` — 退場動畫（180ms，比進場 260ms 快）
- `.save-status` / `.save-status--dirty` — 「有未儲存變更」用琥珀色而非紅色（nothing is wrong yet）
- `.btn[data-save][disabled]` — 畫面乾淨時 Save 按鈕自我停用——一個成功儲存後仍亮著的 Save 按鈕是在說謊，因為已經沒有東西可存

**Dependencies** — `js/toast.js`（`window.ztorToast.show(...)`，動態建立 `.ztor-toasts` 容器與逐則 `.ztor-toast`，含 `aria-live="polite"`）；成功／錯誤圖示為 `js/toast.js` 內建的 inline SVG，非 `data-lucide` 屬性。

**跨頁佇列 `queue()`（2026-07-30 新增）** — `show()` 只活在當前頁：有些確認發生在「按下去就換頁」的動作上（例如建立流程按發布 → 導向專案詳情頁），換頁瞬間 toast 就被丟掉，使用者到了新頁面看不到剛才那一下有沒有成功。`queue(message, opts)` 把訊息寫進 `sessionStorage`（key `ztor.toast.queue`，只活在該分頁、關掉即消失），下一個載入 `js/toast.js` 的頁面在 `DOMContentLoaded` 時「先刪佇列再顯示」——這樣途中重整不會把同一則提示再跳一次。任何頁面只要 `<script src="js/toast.js">`，就自動具備這個接收能力，不必逐頁接線。

- 簽名：`window.ztorToast.queue(message, { key, tone, hold })`
- `opts.key` — i18n key。顯示時機在下一頁，語言可能已被切換，所以存 key、顯示時才查字典翻譯；查不到 key（打錯、字典未補）才退回 `message` 這個字串當保底，畫面上永遠不會出現 raw key。
- `opts.tone` / `opts.hold` — 與 `show()` 同義（`"success" | "error"`／毫秒），一併存進佇列供顯示時使用。
- 存不進去（無痕模式、配額滿）安靜放棄——原型不該因為存不了一句提示而中斷導向。

**Consumers** — `media-vault.html`、`tier-settings.html`、`tier-benefits.html`（三頁皆載入 `js/toast.js`；頁面本身無靜態 markup，容器由 JS 於執行期建立於 `<body>` 下，屬預期行為）。`create-project.html` 的建立流程發布動作（`publish()`）用 `queue()` 把成功提示交給導向後的 `project-detail.html` 顯示。

**Code example**（依 `js/toast.js` 的 `ensureHost()`/`show()` 邏輯重建，非憑空推導）

```html
<div class="ztor-toasts" role="status" aria-live="polite" aria-atomic="false">
  <div class="ztor-toast">
    <span class="ztor-toast__icon"><svg class="ztor-icon"><!-- success --></svg></span>
    <span class="ztor-toast__text">Benefits saved</span>
  </div>
</div>
<div class="save-status save-status--dirty">
  <span class="save-status__dot"></span> Unsaved changes
</div>
```

**CSS** — [`toast.css`](./ds-components/toast.css)

---

### 4.108 Vault share

**Purpose** — 媒體庫的加密連結／NFC 鑰匙發放面板，住在抽屜（`.drawer`）裡；「送給一位粉絲」（一次性連結）與「做成 NFC 商品」（多次鑰匙）共用同一個物件，只是預設值與收尾動作不同。**為什麼是抽屜不是 modal**：發鑰匙時創作者要一直看得到自己在對哪一座庫房動手、以及「誰進得來」的數字，modal 會把整個畫面蓋掉，等於在做權限決定的當下把上下文拿走。

**Anatomy**
- `.vshare` — 根層；`.vshare__intent` / `.vshare__opt--active` — 兩個意圖的選擇卡
- `.vshare__link` / `.vshare__copy` — 產生後的連結列（複製鈕自帶「已複製」文字，不用 toast）
- `.vkey` / `.vkey--revoked` — 已發出的鑰匙列，撤銷後保留紀錄、加刪除線
- `.vkey__meter` / `.vkey__fill` — 領取進度條，量的是「已變成人的比例」（claimed），而非單純可用次數（uses）
- `.vault-keys` / `.vault-keys__head` / `.vault-door__keychip` — 「已發出的鑰匙」獨立區塊（2026-07-31 起；`.vault-door__keyrow` / `__keyleft` 已退場）

**Dependencies** — `js/media-vault.js`（`.vshare__*`、`.vkey__*` 全由此檔的抽屜渲染函式產生，非獨立 `vault-share.js`）；殼依賴 `.drawer`（本檔只管抽屜內容）；icon `plus`、`gift`、`scan`、`key`、`shopping-bag` 等。

**Consumers** — `media-vault.html`（唯一）。

**Code example**（依 `js/media-vault.js` 第 348–431 行模板精簡）

```html
<div class="vshare">
  <div class="vshare__section">
    <div class="vshare__label"><i class="ztor-icon" data-lucide="plus"></i> New key</div>
    <div class="vshare__intent">
      <button type="button" class="vshare__opt vshare__opt--active" data-intent="gift">
        <span class="vshare__opt-icon"><i class="ztor-icon" data-lucide="gift"></i></span>
        <span class="vshare__opt-title">Send to one fan</span>
        <span class="vshare__opt-sub">Single use.</span>
      </button>
    </div>
  </div>
  <div class="vshare__keys">
    <div class="vkey">
      <div class="vkey__head">
        <span class="vkey__name">生日禮</span>
        <span class="vkey__code">AB12 · 2026-07-01</span>
      </div>
      <div class="vkey__meter">
        <span class="vkey__track"><span class="vkey__fill" style="width:40%"></span></span>
        <span class="vkey__count">2 / 5 claimed</span>
      </div>
    </div>
  </div>
</div>
```

**CSS** — [`vault-share.css`](./ds-components/vault-share.css)

---

### 4.109 Wizard split

**Purpose** — 精靈流程（wizard）的「內容欄＋貼頂摘要側欄」兩欄版面，用於 create-project 的「募資設定」與「回饋方案」兩步，右側即時顯示金額試算摘要卡。**為什麼是 grid 不是 `position: fixed`**：sticky 子層跟著捲動祖層自然貼齊，不需要魔法數字，也會自己 reflow。

**Anatomy**
- `.wizard-split` — 根層；`.wizard-split__main` / `.wizard-split__rail` — 主欄與側欄，皆固定 `grid-row:1`（否則側欄會掉到下一列）
- **側欄可疊多張卡（2026-08-09）**：`.wizard-split__rail` 改成 `display:flex; flex-direction:column; gap: var(--sp-16)`，讓一條軌上放兩張以上的卡有固定間距。首個消費情境是建立活動的票務那一步（預覽卡在上、收入試算卡在下）。**只有一張卡時的呈現與改動前相同**，`create-project.html` 與 `create-event-legacy.html` 這兩個單卡消費者不受影響
- `.fd-ov` — 摘要卡本體（Setup overview）；`.fd-ov__hero-value` — 卡片最上方「每份定價」大數字
- `.fd-ov__row--total` — 金額試算的最後一行（用粗細不用顏色強調）
- 響應式：`max-width:1023.98px` 以下側欄退回原生順序、取消 sticky

**Variants** — `.wizard-split--narrow`（2026-08-09 自 `create-event.html` 的頁內 `.ce-split-narrow` promote）：右軌欄寬由預設 320px 收窄到 264px。用於右軌內容本身較輕的情境（如收入試算：四列 `.kv` ＋一顆按鈕，撐不滿也用不到 320px 的完整寬度）；改成修飾類而不是直接改 `.wizard-split` 本身，因為這個基礎 class 同時被 create-project／create-event／design-system 共用，直接改會牽動其他消費頁。

**Dependencies** — 無獨立 `wizard-split.js`；`create-project.html` 頁面自身量測並設定 CSS 變數 `--wizard-top-h`（頂列高度因語系換行而變，寫死數字會悄悄失準，實測於該頁第 852 行 `bar.offsetHeight` 設定確認此依賴為真）；消費頁需把 `.wizard__body` 加寬到 `--mid`（1140px）；摘要卡列表沿用既有 `.data-list__row`。**Rail 在原始碼順序上排在最前**，讓小螢幕與螢幕報讀器先讀到它，`grid-column` 再把它視覺放到右側。**數值變化無 transition/animation**——金額隨每個按鍵變動，跳動或數字滾動效果在這裡會讀成抖動而非回饋。

**Consumers** — `create-project.html`（唯一，「募資設定」與「回饋方案」兩步各自有一份，共用同一份 CSS）。

**Code example**（擷取自 `create-project.html` 第 396–428 行）

```html
<section class="wizard-split">
  <aside class="wizard-split__rail">
    <div class="card fd-ov">
      <div class="fd-ov__title">Setup overview</div>
      <div class="fd-ov__hero">
        <div class="fd-ov__hero-label">Price per slot</div>
        <div class="fd-ov__hero-value">$120</div>
      </div>
      <div class="data-list fd-ov__list">
        <div class="data-list__row"><div class="data-list__row-main">You keep</div><div class="fd-ov__v">85%</div></div>
        <div class="data-list__row fd-ov__row--total"><div class="data-list__row-main">You receive if funded</div><div class="fd-ov__v">$10,200</div></div>
      </div>
    </div>
  </aside>
  <div class="wizard-split__main"><!-- 表單內容 --></div>
</section>
```

**CSS** — [`wizard-split.css`](./ds-components/wizard-split.css)

---

### 4.110 Zselect

**Purpose** — 自製下拉選單，取代瀏覽器原生 `<select>` 展開後的清單——那部分無法被任何瀏覽器樣式化（使用者看到的「藍底高亮、系統字」是作業系統畫的，不是漏寫 CSS）。

**Anatomy**
- `.zselect__trigger` — 觸發鈕；`.zselect__panel` — 展開面板
- `.zselect__native` — 原生 `<select>` 仍留在 DOM 當資料來源（`position:absolute` + `clip`，非 `display:none`，否則會退出可提交欄位與量測）
- `.zselect__caret` — 展開時旋轉 180°
- `.zselect__option` / `.zselect__option--active` / `[aria-selected="true"]` — 選項列，鍵盤與滑鼠共用同一種高亮
- `.zselect__check` — 目前選中的打勾（永遠佔位，避免選中時文字跳動）
- `.zselect__group` — `<optgroup>` 群組標題（全大寫小標）

**Dependencies** — `js/zselect.js`（執行期把 `<select class="select">` 升級成觸發鈕＋自繪 listbox；原生 select 留著照樣派發 `change`/`input`）；面板語彙抄自 `.dropdown__menu`（`--card` 底、`--radius-lg`、`--shadow-float`），非硬性 import。2026-07-28 修過 double-scroll-bar bug：`.zselect__native` 用 `position:absolute` 卻沒配 `top/left`，導致它停在文件流原始位置、把捲動容器撐高出一條看不見的捲軸；補上 `top:0;left:0` 解決，仍保持 `absolute`（非 `display:none`）以維持可提交／可量測。**2026-08-10 起原 `<select>` 的 `data-view-safe` 會一起搬到觸發鈕**：觸發鈕本體是 `<button>`，會被 `shared.css` 那條「`[data-mode="view"]` 底下藏掉所有按鈕」的規則掃到——那條規則針對的是動作鈕，表單控件在唯讀面板裡仍要看得見選到的值。所以坐在可切檢視／編輯的面板裡的 select 要自己標 `data-view-safe`（首個消費者：`project-detail.html` 公開資訊的年齡分級）；不標的維持原行為。

**Consumers** — `ip-bank-reporting.html`、`media-vault.html`、`create-project.html`、`create-auction.html`、`order-detail.html`、`projects.html`、`design-system.html`、`ip-market.html`、`project-detail.html`、`earnings.html`、`create-event.html`、`settings.html`、`admin-ip-bank-entry.html`、`brand-campaigns.html`、`create-product.html`、`product-detail.html`、`admin-platform-fees.html`、`store-settings.html`、`fans-crm.html`（19 頁，全站消費範圍最廣的元件）。

**Code example**（原生 `<select>` 擷取自 `settings.html` 第 251、354 行；升級後 DOM 為 `js/zselect.js` 執行期產生）

```html
<!-- 升級前（頁面原始碼實際寫法）-->
<select class="select" aria-label="Timezone">
  <option>UTC+8 Taipei</option>
</select>

<!-- 升級後（js/zselect.js 於執行期產生的 DOM）-->
<button class="zselect__trigger select" type="button" aria-expanded="false">
  <span class="zselect__label">UTC+8 Taipei</span>
  <svg class="zselect__caret"><!-- chevron --></svg>
</button>
<div class="zselect__panel">
  <div class="zselect__option" aria-selected="true">
    <span class="zselect__check">✓</span>UTC+8 Taipei
  </div>
</div>
```

**CSS** — [`zselect.css`](./ds-components/zselect.css)

### 4.111 Finding card

**Purpose** — 一則「帶得走證據的結論」：左邊是一句話的發現與依據，右邊是支撐它的數字。寫成一段文字時數字會埋進句子裡，讀的人要自己把兩個數字拉出來比，而那個落差正是整則結論的重點。規格 5.1.7.8 F7 要求四個組成缺一不可：結論句、可獨立掃視的支撐數字、依據與涵蓋範圍、追查入口。

**Anatomy**
- `.finding` — 兩欄 grid 容器（左結論／右數字），放在 `.card` 內
- `.finding__kicker` — 期間與類型的小標（如「Highlight · last 30 days」）
- `.finding__title` — 結論句；主詞必須是具體對象（某地區／平台／分群），不用泛稱
- `.finding__sub` — 一行補充，說明這個結論為什麼值得注意
- `.finding__basis` — 依據與涵蓋範圍（用了哪些來源、哪個期間）
- `.finding__figures` — 數字區，左邊界分隔；`__fig-label` / `__fig-val` / `__fig-meta` 為單一數字的三層
- `.finding__fig-val--up` / `--down` — 方向修飾詞，走 `--status-success` / `--destructive`
- `.finding__gap` — 兩個數字之間的落差標記；虛線框表示它是推算出來的關係、不是平台給的原始數字
- `.finding__cta` — 追查入口，連到造成該變化的區塊

**Dependencies** — `.card`（外殼）、`.btn`（CTA）、`.ztor-icon`（kicker 圖示）。無 JS。<900px 掉成單欄、數字區由左邊界改為上邊界分隔。

**與 Insight row 的分工** — `insight-row` 是單行自動計算提示（一句話就講完，沒有數字與去處）；結論需要數字支撐、而且要能追查下去時才用本元件。

**Consumers** — `fan-analytics.html`（F7 本月重點摘要）。

---

### 4.112 Source status

**Purpose** — 不占版位的資料涵蓋指示。坐在頁首操作區，用一顆膠囊講兩件事：數字涵蓋幾個來源、有沒有需要處理的異常；來源明細點開才展開。涵蓋範圍是判讀頁上每個數字的前提，必須隨時看得到；但它不是使用者來這頁要完成的任務，所以不能占掉一個區塊（規格 5.1.7.8 F1／D159）。

**Anatomy**
- `.src-status` — 定位容器；狀態由 `data-open`（展開）與 `data-alert`（異常）驅動
- `.src-status__pill` — 第一層常駐膠囊；`__dot` 狀態點、`__chevron` 展開時旋轉 180°
- `.src-status__panel` — 第二層來源明細，絕對定位於膠囊下方
- `.src-status__title` / `__note` — 面板標題與涵蓋範圍說明
- `.src-status__group` — 接入方式分組標題（官方串接組在前、自行上傳組在後；D165）
- `.src-status__mark` — 來源識別塊（只放縮寫）
- `.src-status__row--off` — 還沒有資料的來源，整列降權但仍可見
- `.src-status__foot` — 面板底部的補述（上傳就在本頁完成，設定只留唯讀副本）

**狀態規則** — `data-alert="true"` 時膠囊改用 `--destructive` 邊框與文字、`--destructive-fill` 底；規格要求異常排除前不得回到低調樣式。

**為什麼識別塊不用品牌色** — 品牌色會讓五列變成五種強度不一的視覺重量，而這裡要比較的是「狀態」不是「是哪一家」。

**Dependencies** — 明細列沿用 `settings.css` 的 `.settings-row`；面板 surface 語彙取自 `.dropdown__menu`。展開／收合與 Esc 關閉由消費頁的行內腳本處理（無獨立 JS 檔）。<600px 面板改 `fixed` 貼齊左右。

**Consumers** — `fan-analytics.html`（F1 平台連結與同步狀態）。

---

### 4.113 Auth shell

**Purpose** — 進站前那一份表單。站上第二個「沒有 Creator Studio 導航」的整頁殼（第一個是 `scanner`），角色不同：scanner 是給現場人員的手機工具、做成手機框；登入是一欄置中的表單，四個畫面（方式選擇／電子郵件／手機號碼／忘記密碼）住在同一欄裡互切，規格要求兩種登入方式互斥、不同時呈現（spec 5.1.10 §頁面佈局 · D170）。**2026-08-04 使用者裁示改成無卡片版**：內容直接置中在頁面底色上，比照 ztor 消費端 `ztor.com/zh-tw/login`。

**Anatomy**
- `.auth-page` — 整頁容器，底色 `--background`；水平置中、**垂直起點固定**（`align-items: flex-start` ＋ `calc(var(--sp-96) + var(--sp-72))` 上內距，2026-08-04 使用者裁示「內容再往上一點」）
- `.auth-shell` — 內容欄；`max-width: 420px` ＋ `--sp-24` 垂直節奏，**沒有底色、邊框、陰影與圓角**（2026-08-04 前為 `.auth-card`，帶 `--card` 底＋`--shadow-card`＋`--radius-xl`＋`--sp-32` 內距）
- `.auth-brand` — 品牌角標（識別用，不是導航，沒有連結目的地）：釘在 `.auth-page` 左上角、**在 `.auth-shell` 之外**（2026-08-04 使用者裁示，參考 Cursor 登入頁——shell 裝的是當前這一步、品牌是不變的產品身分，混在一起會讓每一步的標題都被品牌壓一次），`.auth-brand__logo`（ztor wordmark，與 `js/sidebar.js` 的 `LOGO_SVG` 同一份 path）疊上 `.auth-brand__name`（Creator Studio）
- `.auth-step[data-auth-step]` — 四個畫面之一；用 `[hidden]` 互切（已補 `.auth-step[hidden]{display:none}`）
- `.auth-intro` — 標題區；內含 `.auth-head`（`.auth-head__back` ＋ `.auth-title`）與 `.auth-sub`
- `.auth-head__back` — 返回鈕，**只留 flex 定位**，外觀全部來自 `.btn.btn--icon`
- `.auth-pw` / `.auth-pw__toggle` — 密碼欄外殼與右側的顯示／隱藏鈕（絕對定位疊在輸入框上）
- `.auth-inline`（`--lead`）— 「主欄位＋右側附帶動作」的一列；`--lead` 把左欄壓成 116px（國碼在前）
- `.auth-actions` — 主要行動區，內部 `.btn` 滿寬
- `.auth-foot` / `.auth-link` — 次要行動列與文字型行動（忘記密碼）

**為什麼底色從 `--surface-shell` 換成 `--background`** — `--surface-shell` 是「app 外殼」那一層，登入頁原本用它是為了襯托疊在上面的白卡（亮色下 `--surface-page` 的 `#FAFAFA` 與白卡只差 2%、讀不出邊界）。卡拿掉之後沒有東西需要被襯托，內容就該直接坐在頁面底色上——亮色 `#FFFFFF`、暗色 `#0C0D0D`。`scanner-page` 仍用 `--surface-shell`：它保留了手機框這個容器，理由沒有消失。

**沒有卡片，但方式選擇仍是方塊** — F1 的六個登入方式維持可點的 `.radio-cards--gate` 方塊；2026-08-04 拿掉的是最外層包住全部內容的那張卡，不是選擇器本身。

**不自造的部分** — 方式選擇的六張卡直接用 `.segmented.radio-cards.radio-cards--gate`（STYLE-DECISIONS Q28：選了就進下一步、無持久選取態、hover 才冒橘點）；表單級錯誤用 `.alert.alert--row.alert--error`；欄位用 `.field` ＋ `.input`；返回鈕用 `.btn.btn--icon`（Q43 裸箭頭）；國碼下拉是原生 `<select class="select">`，由 `js/zselect.js` 自動升級。

**Dependencies** — 組成 `.btn`（`--primary`／`--outline`／`--icon`）、`.input`、`.field`、`.alert--row`、`.segmented.radio-cards--gate`、`.ztor-icon`。無獨立 JS 檔；四畫面切換、欄位啟用條件、驗證碼倒數與落地分流由 `login.html` 的行內控制器處理。

**為什麼垂直起點是固定值而不是置中** — 四個畫面高度不同（方式選擇有六張卡、忘記密碼只有一個欄位）。基準若是置中，切畫面時標題就會上下跳：高的畫面往上、矮的往下，明明只換了內容，整塊卻在動。改成固定上內距之後標題永遠落在同一條線上，畫面只有下方在長高。168px（`--sp-96` ＋ `--sp-72`）的取法：要低到不跟左上角的品牌角標（`--sp-24` ＋ 約 42px 高）打架，又要明顯高於原本的置中位置（1440×900 下原為 318px）。

**第三方登入是產品範圍變更** — 規格 5.1.10 與 `decisions.md` D170 目前寫的是「第三方登入（Apple／Google／Facebook／LINE）不做」，2026-08-04 使用者裁示要加，原型先落地、規格由上游同步（見 `ASSUMPTIONS.md` UIA-105）。品牌標記走 `icons.js` 的 `brand-*`（Simple Icons CC0 單色路徑，吃 `currentColor`，不帶品牌彩色值）。**原型行為**：不接任何真的 OAuth，點了直接視為登入成功、落地 `index.html`。

**六個方式同一種卡（2026-08-04 第二輪使用者裁示「將第三方全部都用這種格式」）** — 第三方原本是一列四顆只有品牌標記的方塊（`.auth-oauth` / `.auth-oauth__btn`），本輪改成與電子郵件／手機號碼同款的卡，六張住同一個 `.radio-cards--gate` 的 2 欄 grid：

- **排法＝2 欄 × 3 列**，第 1 列電子郵件／手機號碼、第 2-3 列 Apple／Google／Facebook／LINE。用同一個 grid 而不是兩個相鄰區塊，是因為六者是同一個決定的六個答案；切成兩塊會冒出兩種垂直間距（區塊間 20px vs 卡間 12px）在描述同一件事。
- **六張都是「標題＋一行副標」，所以六張等高**（實測 1440 下皆 100.8px）。
- **副標一律回答「怎麼驗證」**：前兩張是密碼／簡訊驗證碼，四張第三方的對應事實是「不需另設密碼」，四張共用同一個 key `login.method.oauth.sub`。共用一句是刻意的——四個第三方彼此的差別已經由圖示與名稱說完，副標負責說這一整組跟前兩張差在哪；寫成四句不同的話會變成把 Apple／Google 這些名字再講一次（標籤不重述上下文），也會像在硬湊。
- **可讀名稱＝卡面上看得見的標題**（Apple／Google／Facebook／LINE），整組的 `aria-label` 走 `login.method.group`；原本五個只給螢幕閱讀器的 `login.oauth.*` key 與 `.auth-oauth` 兩條 CSS 規則零消費，一併刪除。
- 同輪順手把兩張既有卡的中文標題由「電子郵件登入」「手機號碼登入」收成「電子郵件」「手機號碼」——頁面標題已經寫了「登入」，六張卡一致地只寫方式本身。

**RWD** — ≤480px：上內距由 168 收回 96（畫面本來就矮，168 會把內容推到摺線以下），左右維持 16、下方 24；六張卡在 375px 下維持 2 欄（每張約 165px 寬），不塌成單欄。

**Consumers** — `login.html`（spec 5.1.10 F1／F2／F3／F6）。全站帳戶選單的「登出」（`js/sidebar.js` 的 `[data-logout]`，三個入口共用）導回這一頁。

**沒有註冊入口** — 2026-08-04 使用者裁示，原型任何版本都不出現自助註冊；原先掛 `data-feat="full"` 的那一列連同 `login.signup.*` 兩個 i18n key 已整段移除（規格 5.1.10 F6 只要求 phase 1–3 不出現，原型更嚴格，見 `ASSUMPTIONS.md` UIA-105）。

---

### 4.114 Ticket tier card

**Purpose** — 建立活動 Step 4 的票種卡（spec 5.1.6.1 F9／F9.1／F9.2）。一張卡＝一個票種，兩態：收合態把「這個票種是什麼」壓成三行（名稱／價格／數量）讓多張卡能一眼比大小；編輯態才攤開三個輸入欄與破壞性動作。分兩態而不是永遠攤開，是因為一場活動可以有多個票種，全部攤開時要捲很久才看得到全貌。

**Anatomy**
- `.tier-grid` — 網格容器（**2026-08-06 起固定一行三欄**：`repeat(3, minmax(0,1fr))`，`align-items: start`），票種卡與尾端的新增格排在同一張網格上；≤1100px 降兩欄、≤720px 降一欄
- `.tier-list` — 卡片的渲染容器，`display: contents`：卡片由 JS 重繪、新增格是靜態 markup，兩者要落在同一張網格上，中間這層就不能自己成為 grid item
- `.tier-add` — 網格最後一格的新增卡（沿用 `.upload-tile` 的虛線語彙），與票種卡等寬
- `.tier-toolbar`（`__actions`）— 網格上方靠右的批次編輯工具列
- `.card.tier-card` — 單張票種卡，卡體外觀全部來自 `.card`（Q32 的無邊框＋陰影），本元件不重畫
- `.tier-card--clickable`（2026-08-09 promote）— 加法修飾類，整張卡是開啟編輯的點擊區（`⋮` 選單與拖曳把手排除）。**opt-in，不寫進裸的 `.tier-card`**：本元件也給 `create-event-legacy.html` 用，那邊的卡從來不是「整卡可點」，直接改基礎 class 會讓 legacy 卡悄悄跟著變可點
- `.tier-card__grip`（2026-08-09 promote）— 卡標列的拖曳把手（排序不從 bookyay 帶入，直接在 UI 上拖），`cursor:grab`／拖曳中 `grabbing`；`--editing` 態收起（少了它票種名才能與下面自動生成的門票名稱左緣對齊）
- `.tier-card__head` ＞ `.tier-card__grip` ＋ `.tier-card__name`（卡標＝票種名稱，`--untitled` 為未命名時的降權態）＋ `.tier-card__badge`＋`.tier-card__ownbtn`（編輯態才出現的自訂規則按鈕）＋ `.tier-card__actions`（⋮ 選單）
- `.tier-card__thumb`（卡標小縮圖，2026-08-09 promote，方形裁切、非原圖比例）— **同日第二輪由卡標那一行移出，改坐在卡標下方自成一列**（使用者指示「圖片放下一行」）：擠在卡標列時只能當個記號（28px），獨立成列後放大到 40px（圖示 14px→18px），上下各加 `--sp-2`／`--sp-10` margin，才真的看得出圖裡是什麼
- `.tier-card__facts` ＞ `.tier-card__fact`（`<dt>` 標籤靠左／`<dd>` 值靠右）— 收合態的唯讀價格與數量，`tabular-nums` 讓並排卡片的位數對成一欄；含 `.tier-card__line`（2026-08-09 promote）時改逐項換行顯示「商品組合」多筆值，`dt` 改 `white-space:nowrap` 避免被壓縮擠斷字
- `.tier-card__edit` — 收合態卡底的整寬 Edit
- `.tier-card--editing` — 編輯態：顯示 `__body` 與 `__foot`，隱藏 `__facts` 與 `__edit`
- `.tier-card--group` — 批次編輯中的卡：`__foot` 收起（動作在工具列），`__actions` 保留（移除單張只剩這條路）
- `.tier-card__body` — 三個 `.field` 直排（窄卡放不下三欄並排）；空的 `.field__hint` 不佔行
- `.tier-card__badge` — 標題列的「自訂」徽章（吃 `.badge`），標出這張不跟隨活動預設；是 `__name` 的兄弟不是子節點——邊打字邊更新卡標會覆寫 `__name` 的文字，放裡面會被洗掉。編輯態隱藏（同一行的按鈕已經在說同一件事）
- `.tier-card__ownbtn` — 標題列靠右的「自訂規則」按鈕（吃 `.btn.btn--outline.btn--sm`），`aria-pressed` 表態；只在 `--editing` 出現，`--group` 時把 `__actions` 的 `margin-left:auto` 歸零，兩者才會靠右成一組
- `.tier-card__rules` — 卡內的自訂規則欄位本體（開關已移到標題列）
- `.rule`（`.rule-when` / `.rule-row` / `.rule-unit` / `.rule-sub`）— **2026-08-06 起活動層那份住在彈窗裡**（`.payout-modal`／`.payout-dialog`，入口是收入試算卡底部的「＋ 新增售票規則」；票種卡那份仍在卡內）。一條規則＝標籤＋**模式下拉**＋選到才展開的欄位（**2026-08-06 由 `.segmented` 改為 `.select`**：選項長到 4–5 個之後並排按鈕會擠成一長條，也沒有「已選的是什麼」這個單一落點可讀）；`--sub` 是折扣底下的條件，縮排一階並用左邊界標出從屬
- `.kv--input` ＋ `.calc-sum__cost` — 收入試算裡「支出」那一列自己是輸入格（2026-08-06）：其餘三列是算出來的、這一列是填進去的，放同一張表才看得出誰影響誰
- `.calc-sum`（`__out` / `__neg`）— 收入試算的四列 `.kv`，最後一列是結果
- `.tier-card__control` ＞ `.tier-card__clear` — 包住單一輸入框，右端疊一顆清空 ✕（`data-empty="true"` 時隱藏——沒東西可清時那顆 ✕ 只是雜訊）
- `.field__hint.tier-card__err` — 欄位級錯誤，疊在 `.field__hint` 上轉 `--status-error`
- `.tier-card__foot` — 左 Remove／右 Cancel＋Save，中間 `.tier-card__foot-spacer` 推開
- `.tier-count`（`--over`）— 清單尾端的計數列；數量加總超過容量時整行轉紅
- `.tier-card__ownrow`（2026-08-09 第二輪新增）— 規則區塊的狀態列：左邊「已自訂」徽章（`.badge.badge--neutral`）、右邊「改回跟隨活動預設」的 `.btn.btn--ghost.btn--sm`；只在這張票的規則已與活動預設脫鉤時出現（票種編輯彈窗的規則分頁，取代原本 `.field__hint`「跟隨活動預設」提示句那一行）
- 🪦 tombstone：`.tier-card__ownbtn--always` ／ `.tier-card__ownicon` ／整寬展開鈕覆寫（2026-08-09 當天新增、當天第二輪即退場）— 服務的是票種編輯彈窗裡那顆「新增購票規則」收合鈕：`--always` 是它在彈窗裡無條件顯示的變體（取代原本「用彈窗容器 id 提權蓋過元件」的做法），`__ownicon` 是它的箭頭圖示、`aria-expanded="true"` 時旋轉 180°。同日使用者第二輪裁示「攤開不需要折疊了」——規則一律列出、不再收合，這顆鈕連同箭頭一併撤除，CSS 原地留 tombstone 註解（`ticket-tier-card.css` 檔尾）。基礎 `.tier-card__ownbtn`（標題列靠右的小按鈕，見上）不受影響，仍由 `create-event-legacy.html` 消費

**Regulatory spacing（2026-08-09 promote，同日第二輪改用 `.radio-list`）** — 規則區塊內的間距補完（使用者指示「項目間距都要做出來」）：`.rule-sub` 內第二層 `.radio-list`（原為 `.zradio-group`，見 [Checkbox §4.96](#checkbox) 的 tombstone 與 [Radio list](#radio-list)）與它展開的欄位之間拉開、最後一個欄位不留尾巴；並排的兩欄（折扣％＋折後價、起訖時間，`.rule-row > .field`）各自平分一列；票種卡只有約 240px 寬，`.tier-card__rules .rule-row` 改上下堆疊（規則彈窗夠寬則維持並排）。

**Remove 的外觀** — 2026-08-06 起是**紅框紅字**（透明底＋1px `--destructive` 邊框，hover 才上 10% 紅底），與規格 F9.2 寫的「紅字」一致。此前依 Q37 是實色紅底＋白字，**2026-08-06 使用者裁示全站改紅框**推翻：刪除的分量由「紅」本身承擔就夠，實色紅塊在卡片裡比同一列的主要動作（儲存）還搶眼，等於把最不該先按的那顆做成視覺焦點。改動住在 `button.css` 的 `.btn--destructive:not(.btn--ghost)`，全站一次生效、消費頁不必逐一改。

**為什麼卡不再包一層 `form-section--outlined`** — 卡中卡在亮色是白疊白，而 Q24 把卡內填色上限壓在兩層。改成卡片直接坐在步驟面板上（L1），與建立募資流程的方案卡（`create-project` 的 `#bd-list`）同一種做法。

**為什麼是網格、沒有 List／Grid 切換** — 版型來源是 Beamco Artist Portal v3 的 Ticket Type Settings（Figma `0gWC6dR1yzdEu0g1LqvRvJ` node 1904-82978），那份設計有 List／Grid 兩種檢視，List 是橫向捲動。2026-08-04 使用者裁決只採用 Grid：橫向捲會把卡片推出畫面（設計稿自己的截圖就切掉了第一張），而這一步最需要一眼看到的正是「有幾種票、加起來幾張」。切換鈕因此整個不做——少一個沒人會切的控制項。

**規則與試算（2026-08-04 第三輪）** — 同一支渲染函式產出三種設定（購買條件／每人限購／折扣），在活動層（`#ce-rules`，所有票種的預設）與票種卡（`.tier-card__rules`，這張自訂）各用一次。範圍走**繼承＋覆寫**：票種卡上一個開關決定要不要有自己的一份，關掉就丟回去跟隨活動預設（不保留上次填的值，免得看起來還在生效）；不跟隨的卡在標題列掛 `.tier-card__badge`。**2026-08-06（使用者指示）該開關由卡內的 switch 列改成標題列靠右的按鈕 `.tier-card__ownbtn`**——原本它夾在數量欄與規則欄位之間，讀起來像「再一個要填的欄位」；移到卡標同一行後才看得出它是這張卡的模式開關。開啟態用橘框橘字而不是實色橘：同一張卡的卡底已經有一顆實色橘的「儲存」，兩顆實色橘會分不出哪顆是這一步的主要動作。關閉時卡內只留一行 `.field__hint` 說它跟著活動預設走（不再有 `.tier-card__rules` 那條分隔線與空區塊）。舊的 `.tier-card__own` 已無消費者，CSS 留墓碑。`.rule`／`.rule-when`／`.rule-row`／`.rule-sub`（折扣的條件縮排一階表示從屬）只排間距，欄位本身一律吃既有的 `.input`／`.select`／`.amount-field`／`.segmented`／`.switch`。收入試算 `.calc-sum` 用既有 `.kv`，最後一列 `.calc-sum__out` 加上分隔線與大一階的字；結果為負時 `.calc-sum__neg` 轉紅並照實顯示負數。**試算坐右軌**（2026-08-04 使用者指示）：沿用 `wizard-split`（左＝你在填的東西、右＝填出來的結果，捲動時結果一直跟著），消費頁需要三件事——載 `wizard-split.css`、在該步驟把 `.wizard__body` 加上 `--mid`（820 容不下網格＋320 右軌，其餘步驟維持 820 不動）、執行期量 `.wizard__top` 高度寫進 `--wizard-top-h`（sticky 才不會鑽進 header 底下；高度隨語言換行而變，硬寫會漂）。**餵給試算的輸入（活動支出）留在左欄**——站上右軌一律唯讀，不放正在編輯的欄位。

**踩過的坑：i18n 重繪的無限迴圈** — 規則區塊含 `datetime-local` 欄位，`partials/date-input.js` 的 MutationObserver 接到新節點會呼叫 `applyI18n()`，而 `i18n.js` 的 `apply()` 結尾一律 dispatch `i18n:applied`；消費頁若在該事件上重繪規則，就會「重繪 → 插入日期欄 → observer → dispatch → 再重繪」無窮下去（2026-08-04 實際卡死整頁）。消費端必須在重繪期間擋掉自己造成的那一輪（旗標＋`setTimeout(0)` 解除：observer callback 是 microtask，一定跑在該 macrotask 之前）。

**批次編輯（Group edit）** — 整段票種卡一起進編輯態，共用工具列上的一組取消／儲存；儲存時有一張不過驗證就整批不收（避免收一半、剩下的還開著）。刻意是選配模式、不是預設：票種一多，全部攤開這一頁會長到看不完。單張編輯維持一次只開一張（規格 F9.2）。工具列在一張票種都還沒建立時整條收起。

**與 Bundle editor 的分工** — 兩者都是「建立流程裡 JS 產生的可編輯卡清單」，`fc-bundle` 承載的是有子項、權益與定價推導的套組，本元件只有三個欄位。收合態的動作做法不同（本元件是 Edit 鈕＋⋮ 選單，`fc-bundle` 是兩個 `.card__link` 文字連結），已登記 STYLE-DECISIONS Q48 待裁決；欄位末端的清空 ✕ 只有本元件有，登記為 Q47。

**Dependencies** — `.card`（卡體）、`.btn`（`--outline`／`--primary`／`--destructive`／`--icon`）、`.dropdown`（⋮ 選單）、`.field` ／`.input`／`.amount-field--readonly`（價格的 `$` 綴詞）、`.upload-tile`（新增格）、`.ztor-icon`。**不吃 `.form-grid`**——2026-08-04 卡改窄之後三欄改直排，格線 helper 不再參與。無獨立 JS 檔；卡片渲染、驗證（名稱 1–40 字且不重複／價格整數 ≥ 0／數量整數 ≥ 1／Σ 數量 ≤ 容量）與草稿的 Save／Cancel 由 `create-event.html` 的行內控制器處理。

**Consumers** — `create-event.html`（spec 5.1.6.1 步驟 4）。

**文案例外（檢查 12 棘輪 +3）** — 建立活動新增的三個標籤含模組主詞「活動」：「活動人數」（場地與時間）、「活動內含物」與「活動須知」（細節 › 進階詳細資料），皆由使用者 2026-08-06 直接指定；後兩個是售票平台的通用欄目名稱（KKTIX／Accupass 同名），縮成「內含物」「須知」反而不像產業用語。同一步驟既有的「活動日期」「活動名稱」已是同類例外，三者是同一組講法，單獨把這一個縮成「人數」反而不一致。`ds-baseline.json` 的 `r2_label_restates_module` 因此由 11 調為 12（2026-08-06 第二次再調為 14）。

---

### 4.115 Size chart editor

**Purpose** — 兩個維度都能被使用者增減的資料表（spec 5.1.5.5 F7.2 · D171）。用在商店設定的尺寸表範本：列是尺碼、欄是量測項，而「這件衣服要量哪幾個部位」本來就因商品而異，所以欄不能寫死。站上其他表格的欄位都是已知固定集合，這是第一支欄數由使用者決定的表。

**Anatomy**
- `.sce` — 外層；表格與底部新增鈕之間的 8px 間距
- `.sce__wrap` — 1px `--border` 外框＋`--radius-xl`＋`overflow-x:auto`（窄視窗橫捲，沿用 `.variant-table-wrap` 的做法）
- `.sce__table` — **欄定義的唯一住處**：`--sce-cols` 宣告在這一層，`__head` 與每一個 `__row` 都讀它
- `.sce__head` — 表頭；`--muted` 底、`--column-head-ink` 字，不畫下框線（Q41）
- `.sce__col` ＞ `.sce__col-label`（固定欄，如「尺碼」）或 `.sce__col-input`（可改名的量測欄）＋ `.sce__col-remove`
- `.sce__row` ＞ `.sce__cell`（`.sce__cell--size` 為首欄的識別格，字重較重）＋ `.sce__row-remove`
- `.sce__foot` ＞ `.sce__add` — 底部虛線新增鈕（加列／加欄各一顆）

**為什麼欄定義只放一個 CSS 變數** — `__head` 與每個 `__row` 是各自獨立的 grid container，欄寬要一致就只能吃同一份 `grid-template-columns`。宣告在 `.sce__table` 上、下面都用 `var(--sce-cols)`，JS 增減欄時只要改這一個變數＋每列補一格 DOM，不必動 CSS。做法取自 `.bmx` 的 `--bmx-cols`。

**首欄一定要用固定寬，不能用 `max-content`** — 表頭與資料列是不同的 grid，`max-content` 會在各自的 grid 裡分別解析：表頭那格只有一行文字（算出 72px），資料列那格是輸入框（算出 152px），兩邊就錯開了。實測踩過，改成固定 `112px`。

**為什麼不擴充 `variant-builder` 的 `.variant-table`** — 那支的欄寬是三套寫死的 `grid-template-columns` 字面值，服務「規格組合＋價格＋庫存＋SKU＋成本」這組已知固定欄位。要讓欄數變成使用者可控，等於把它的 grid 模型整個換掉，那已經不是擴充。視覺語彙（外框、`--muted` 表頭、格子用 `.input`、列尾刪除鈕）仍然照抄，兩張表在站上讀起來是同一族。

**刪除鈕預設不顯示** — 欄與列的刪除鈕都是 `opacity:0`，hover 該欄／該列或 focus 才浮現（同 `.bmx__remove`、`.variant-row__remove`）。理由是兩個維度都可能長，常駐一整排刪除圖示會蓋過資料本身、也容易誤點。表頭的量測欄名輸入框同理：平常收起邊界（`.input` 的邊界是 `box-shadow` 環，所以是清 `box-shadow` 不是改 `border-color`），hover 或聚焦才顯形。

**Dependencies** — `.input`（格子與欄名）、`.ztor-icon`。無獨立 JS 檔；增刪列／欄、`--sce-cols` 同步與欄名改動時的 aria-label 同步由 `store-settings.html` 的行內控制器處理。

**Consumers** — `store-settings.html`（spec 5.1.5.5 F7.2 尺寸表與身高體重參考，同一支元件兩個實例；身高體重那張欄固定、不給欄刪除鈕）。


---

### 4.116 Ticket preview

**Purpose** — 粉絲最後拿到的那張票，創作者在左邊填、這裡即時長出來（建立活動步驟 5「票券銷售 › 票券設計」的右軌）。一條撕線把票分成兩半：上半是識別（時間、票名或 logo、哪一種票），下半是進場掃的 QR。撕線是這個物件唯一需要的隱喻——一眼說明哪半張給人看、哪半張給機器掃。

**Anatomy**
- `.ticket-preview`（`--custom-bg`）— 票面；上傳自訂底圖時由消費頁把縮圖寫進 `--ticket-bg` 並加修飾詞
- `.ticket-preview__top` ＞ `__when`／`__logo`(`--asset`)／`__kind` — 識別半張；上傳 logo 後 `--asset` 把票名那一格讓給圖
- `.ticket-preview__tear` — 撕線：兩側各一個 `--surface-page` 的圓形缺口＋中間虛線
- `.ticket-preview__bottom` ＞ `.qr-box.qr-box--lg` — QR 半張，沿用 `pickup.css` 的框與 `window.ztorFauxQr()` 產生的假 QR

**為什麼不是一張 `.card`** — 卡片是容器，這是一個「物品」的縮影：有自己的直式比例、底圖與撕線缺口，不吃卡片的內距與陰影規則。它只長在預覽位，不當任何內容的外框。

**字色的坑** — 票面**永遠是深色物件**，不是跟著主題翻的卡，所以字色走 `--foreground-on-inverse` 與 `--foreground-on-inverse-muted`（`scanner-cam` 用的是同一組）。第一版誤用 `--on-primary`——那是「疊在品牌橘上」的字色、本身是深色（`#171717`）——結果黑底黑字，實測抓到才發現。預設底圖是 `--primary`／`--ring` 兩團 `color-mix` 的光疊在 `--surface-inverse` 上，無裸色。

**Dependencies** — `.qr-box`（`pickup.css`）、`window.ztorFauxQr()`。無獨立 JS 檔；票名／日期／類型由 `create-event.html` 的行內控制器餵。

**Consumers** — `create-event.html`（步驟 5 票券銷售 › 票券設計）。版型來源＝Beamco Artist Portal v3（Figma `0gWC6dR1yzdEu0g1LqvRvJ` node 1904-82979）。

### 4.117 Session list（含 Product list 的群組列）

**Purpose** — 一個活動辦好幾場時（使用者說法「系列活動」），建立流程要能一場一場列出來，清單頁又不能因此爆量。兩件事分兩個地方做：**建立時**用 `.session-list` 逐場填日期與場地；**清單上**用 `.product-list__row--group` / `--child` 把整個系列收成一列、點開才展開。

**Anatomy（session-list）**
- `.session-list` — 直排容器
- `.session-list__row` ＞ `__no`（固定寬序號「第 N 場」）＋ `__fields`（日期｜場地兩欄）＋ `__end`（固定寬尾欄：移除鈕或徽章）
- `.session-list__row--main` — 第 1 場：`__fields` 改成單欄，內容是 `__text`（唯讀鏡像；沒填時 `--empty` 降一階色）
- `.session-list__add` — 清單下方的「新增場次」鈕（吃 `.btn--outline`）
- `.session-list__head`（選配，2026-08-09 promoted from `create-event.html` 的 `.ce-sess__head`）— 欄位標題列，跟 `__row` 同一套排版（flex＋`--sp-12` 間距），文字換成 `--muted-foreground` 小標色，讓多欄版一眼看懂每欄是什麼；與 `.session-list__row` 各自出現一次即可，不強制成對
- `.session-list--detailed`（修飾類，2026-08-09 promoted from `create-event.html` 的 `.ce-sess`）— 場次要問起訖時間與入場時間時的多欄變體，不動基準版兩欄行為（`create-event-legacy.html` 仍在消費基準版）：單場 4 欄（日期｜起｜訖｜入場）；多場時 `__row[data-multi="true"]`／`__head[data-multi="true"]` 多插一欄場次名成 5 欄，兩種欄寬各自定義；窄螢幕（≤640px）`__head` 隱藏、`__fields` 收成單欄或兩欄

**為什麼第 1 場是唯讀的** — 日期與場地在同一頁上面已經有一組正式欄位。這裡若再給一組可編輯的，同一筆資料就有兩個真相來源：使用者改了下面那格，上面那格、Review 摘要與發布前檢核到底該聽誰的沒有答案。改成鏡像後，只有「第 2 場起」是這份清單自己的資料，主欄位一改、鏡像跟著更新。

**為什麼開關在「場地與時間」不在確認頁** — 使用者最初指定放在最後的確認頁。確認頁的定位是「檢查每一項沒問題就發布」，在那裡開一個會生出 N 個活動的開關，等於在檢查步驟做重大建立動作；而且日期與場地都在前一步填過，要改得跳回去。2026-08-06 與使用者確認後移到「場地與時間」，前面填的那一場自然就是第 1 場。

**Anatomy（product-list 群組列）**
- `.product-list__row--group[data-group][aria-expanded]` — 母列；展開把手 `.product-list__group-toggle` **放在名稱前面**（母列的 `__product` 改 flex），`.product-list__group-chevron` 隨 `aria-expanded` 轉 180°
- `.product-list__row--child[data-group-child][hidden]` — 子列；縮排一階＋左緣一條 inset 線標出從屬

**為什麼子列的線用 inset shadow 不用 border-left** — `border` 會參與 grid 的欄寬計算，母列與子列的欄就會差 2px 對不齊。

**展開把手為什麼在最前面不在最後** — 清單頁的 `.main` 是 `overflow-x: hidden`，視窗窄一點時右側幾欄會被切掉且捲不到（既有問題，不只影響本元件）。把手收在最右的操作欄等於沒有入口；樹狀清單的展開三角本來也長在最前面。

**母頁入口要有名字** — 母列標題本身是連結（進系列母頁），但母列的整列點擊是「展開」，光靠標題沒人會發現那裡還能點去別的地方。所以操作欄的 ⋮ 另給一個具名項目「管理整個系列」，並在子場詳情頁的「系列」分頁也放一個。

**行為約定（消費頁負責）**

- 母列整列可點＝展開／收合（明確的展開鈕與 ⋮ 裡那一項一律有效，連結與選單本身放行）；子列點擊才進那一場。
- 子列**不進分頁計數**——它跟母列算同一筆。
- 子列可見 ＝ 母列通過篩選 **且** 展開；只看展開的話，篩掉母列後子列會孤零零留在畫面上。
- **搜尋中一律攤開**：搜到的字可能就長在某一場身上，收著等於「找到了但看不到」。

**Dependencies** — `.field`／`.input`（場次欄位）、`.btn`（`--outline`／`--icon`）、`.badge`、`.switch`（開關）、`.form-section--outlined`＋`__head--actions`（區段外框與標題列開關）、`.ztor-icon`。無獨立 JS 檔；場次資料、序號重編與收入試算的場次倍數由 `create-event.html` 的行內控制器處理，清單的展開／收合由 `events.html` 的行內控制器處理。

**三種活動詳情頁**（2026-08-06 使用者裁決）— 單場活動（`event-detail.html`，無系列）／系列母頁（`series-detail.html`，新頁）／系列子場（`event-detail.html`，有系列）。**階層要在麵包屑上讀得出來**：子場是「活動 / 系列母頁 / 這一場」三層，返回鈕回系列母頁而不是活動清單；末層寫「第 N 場 · 場地」不寫活動名稱——同系列各場刻意同名，用名稱三場的麵包屑會一模一樣。單場活動維持兩層。母頁承載**共用設定**：改一次同步所有場次；每場不同的東西（日期、場地）留在該場自己的頁面改。**判準是「這個欄位每一場一不一樣」**——一樣的（名稱、描述、陣容、圖片、人數、票種與票價）住母頁，不一樣的（日期、場地）住子場。2026-08-06 使用者回報母頁只有名稱與描述、其餘只在子場看得到（而子場不給編輯，等於誰都改不了），依此判準補齊四塊。母頁不是一場活動，所以頁首不掛日期與場地、也沒有報到與名單。入口有兩個：活動清單的母列標題、以及子場詳情頁「系列」分頁的「管理整個系列 →」。

**兩則規則說明刻意寫在頁面上**

- 已開賣的警示用 `.alert--row.--warning`，沿用編輯活動那頁「改動的後果」同一種說法（同一件事在兩頁不該長成兩種樣子）。
- 取消系列中的一場＝與取消一場獨立活動完全相同的退款規則（F5），屬於系列不改變對該場持票人的義務。

兩者在原型都只到「說出來」這一步，不接真流程。

**Consumers** — `create-event.html`（步驟 3 場地與時間 › 系列場次，用 `.session-list--detailed` ＋ `__head`）· `events.html`（活動清單的系列母列與子列）· `series-detail.html`（系列母頁，用 `product-list--series` 列場次）。產品規格缺口見 ASSUMPTIONS SER-001。

### 4.118 Entry list

**Purpose** — 一個欄位要收「不確定會有幾筆」的同型別短文字時用它。一列是一格 `.input` 加行尾刪除鈕，下方一顆新增鈕補一列空的。首見於作品上架流程的演職人員（spec 5.1.2.2.1 §4）：一部片可能掛一位導演，也可能掛三位。

**Anatomy**
- `.entry-list[data-last-empty]` — flex column 容器
- `.entry-list__row` ＞ `.input`（`flex:1 1 auto; min-width:0`，窄欄能真的縮、不把刪除鈕擠出容器）＋ `.btn.btn--icon`（刪除）
- `.entry-list__add` — `align-self: flex-start`，自己一行靠左，不跟著輸入列拉滿寬

**與 Spec row 的分工** — `.spec-row` 收「名稱＋值」的成對資料（如商品的「材質：無塗佈紙」）；`.entry-list` 收單欄的同質清單，每一列都是同一個問題的另一個答案。判斷句是「這一列本身需要欄位名稱嗎」——需要就用 Spec row。

**只剩一列時不給刪除鈕** — 清單至少留一格可填，由消費頁的 JS 切 `hidden`。元件負責的是「藏得掉」：`.btn` 自帶 `display`，`[hidden]` 單靠自己蓋不過去，所以有一條 `.entry-list__row .btn[hidden] { display: none }`。

**最後一列還沒填字就不給新增鈕**（2026-08-07 使用者反饋）— `.entry-list[data-last-empty="true"] .entry-list__add { display: none }`。理由是一頁上並排九份名單（演職人員的九個角色）時，九顆常駐的「＋ 再加一位」比名單本身還搶眼，而且最後一格還空著時按它也不會得到任何東西。

- **做成元件預設，不做成可選變體**：目前只有 `publish-work.html` 一個消費頁，而「上一格填了才問下一格」對任何同質清單都成立，沒有理由讓下一個消費頁重新發明一次。要退回常駐版的消費頁只要不設這個屬性——沒有 `[data-last-empty]` 的清單行為完全不變。
- **空／不空由消費頁的 JS 判斷**，與只剩一列時的刪除鈕同一種分工；屬性寫法沿用站上既有的 `[data-empty]`（`date-input`、票種卡的清空 ✕），不另立第三種「有值才出現」的機制。
- **焦點不能跟著按鈕消失**：按下新增後那一列是空的、新增鈕當場收起，焦點若留在原地就落在 `display:none` 的按鈕上，所以消費頁要在新增後把焦點交給新那一格的 `.input`；同理，刪除後把焦點交給鄰近一列（優先上一列）。兩者都在 `publish-work.html` 的 `bindRole()` 內。

**Surface** — 內容是 `.input` 與 `.btn--icon`，兩者各自對所在層有邊界，容器本身不填色，白底與灰底（`--card`／`--surface-shell`／`--muted`）都成立。

**Dependencies** — `.input`／`.btn`（`--icon`／`--outline`）／`.ztor-icon`。無獨立 JS 檔，增刪列、`[hidden]` 與 `[data-last-empty]` 的切換都由消費頁的行內控制器處理。

**Consumers** — `publish-work.html`（步驟 4 演職人員）。

### 4.119 Review status

**Purpose** — 把一件送審作品的四個問題收在同一塊：現在走到哪、支撐這個判斷的唯讀事實（送出時間、送出次數、審核者）、被退的話是為什麼、接下來能做什麼。為完成影片的平台審核而建（spec [5.1.0.4-影片上架審核.md](../../documents/5.1.0.4-影片上架審核.md) F5、[5.1.2.2-專案詳情.md](../../documents/5.1.2.2-專案詳情.md) §2.2.9），審核的兩端共用同一支——創作者在項目頁看結果，審核者在審核頁看同一塊。

**Anatomy**
- `.review-status` — 外框區塊（1px `--border` ＋ `--card` 底 ＋ `--radius-lg`）
- `__head` ＞ `.badge`（狀態）＋ `__title`
- `__meta` ＞ `__meta-item` × N（每項是「欄目名＋值」兩個 `span`，第一個吃 `--muted-foreground`）
- `__note` ＞ `__note-label` ＋ `__note-body`（`white-space: pre-line`——退件理由是自由文字）
- `__actions` — 重送、返回清單等出口

**Variants** — `--rejected`／`--approved` 只改 `__note` 的左側色條（`--destructive`／`--status-success`）；`--flat` 去掉外框與內距，供已經有卡片外框的容器內用。

**狀態字彙不住在元件裡** — 徽章的文字與色調由 `js/work-review-store.js` 的 `label()`／`tone()` 提供，元件只負責版面。理由是同一組「待審核／審核中／審核通過／審核不通過」在創作者端與 Admin 端都會出現，字彙寫進任何一頁都會長出第二份；枚舉的權威在主規格 §7.2「作品審核」列。

**刻意與項目狀態徽章分開** — 作品審核狀態講的是「這一件送審作品」，項目狀態講的是「整個項目」，規格明令兩套不得互相代用。所以這一塊坐在項目更新區段裡、有自己的徽章，不去改頁首那顆項目狀態徽章。

**條件顯示的成員都要能藏** — `__meta-item`、`__note`、`__actions` 各自宣告了 `display`，CSS 逐一補了 `[hidden] { display: none }`；不補的話 `el.hidden = true` 藏不掉（例如還沒有結果時會空著一個「審核完成」欄目名）。

**動作列只在真的有事可做時出現** — 常駐一顆停用的按鈕讀起來是「你被卡住了」，而不是「現在還沒有你的事」。創作者端只有審核不通過時給重送入口；Admin 端待審核給接手、審核中給通過與不通過、已審完只留返回。

**Surface** — `--card` 底＋1px `--border`，白底與灰底（`--surface-shell`／`--surface-page`）都成立；`__note` 用 `--muted` 填色，靠比容器深一階被看見。

**Dependencies** — `.badge`／`.btn`（`--primary`／`--outline`／`--ghost`，皆 `--sm`）。無獨立 JS 檔；狀態資料來自 `js/work-review-store.js`，DOM 由消費頁的行內控制器填。

**Consumers** — `project-detail.html`（項目更新區段的作品審核狀態）、`admin-video-review.html`（送審件頁首與審核動作）。產品缺口見 ASSUMPTIONS UIA-109／UIA-111。

---

### 4.120 Source import

**Purpose** — 從外部平台（bookyay）搜尋一筆既有紀錄帶入表單的一頁式閘門：搜尋 → 下拉結果 → 略過／帶入兩顆動作。2026-08-09 自 `create-event.html` 的頁內 `.ce-bky` / `.ce-bkyq*` promote。

**Anatomy**
- `.source-gate` — 閘門本體，靠左對齊（閘門殼 `.wizard__gate-inner` 預設置中，這裡拉回靠左——清單要一列一列掃過去，置中會讓每列起點不一樣）
- `.source-gate__head` ＞ `.source-gate__titles`（＋ `.wizard__step-title`）— 返回鍵與標題同一列、垂直置中
- 搜尋框＋結果 — `.owner-lookup` ＞ `.input[role=combobox]` ＋ `.owner-lookup__results`（見 §4.?? Owner lookup）
- `.source-gate__acts` — 略過｜帶入，靠右
- `.source-import`（選配）— 帶入後在表單頂端顯示的唯讀欄位列，內含一個佔滿寬度的 `.select`；欄位本身的來源標記與鎖定樣式見 §4.121 Field source tag

**結果清單改用 Owner lookup 下拉（2026-08-10，使用者指示）** — 原本是把結果常駐攤在頁面上的 `.radio-cards--gate.radio-cards--list` 清單，改成聚焦搜尋框才展開的下拉。兩個理由：

- 站上已經有一個「打字找一筆、下拉挑一個」的元件（`owner-lookup`，creators 的帳號查找、Admin IP Bank 的權利人、陣容藝人搜尋都是它），這一關沒有理由長成第二種樣子
- 常駐清單一進場就先給五筆要讀完才知道自己在做什麼決定，聚焦才展開才是搜尋該有的節奏

**聚焦時整份列出、不套用輸入框裡的關鍵字**——選過之後框裡放的是那一場的名稱，拿它當關鍵字會只剩一列，等於看不到其他選項。已選中的那一列在重開的清單裡以 `aria-selected="true"` 標出。連帶：`.source-gate__empty`（無結果說明文字）撤除，那句話改畫在下拉裡的 `.owner-lookup__result--empty`；`.radio-cards--list` 因此再次沒有消費頁（同日一度被建立活動的「要怎麼建這些門票？」選擇彈窗接手，隨後使用者指示那個彈窗改回並排兩欄），列為退場候選、待裁決，見 Radio card §4.1。

**返回鍵對齊標題（2026-08-10 第三輪，使用者反饋「這兩個要對齊」）** — `.source-gate__head` 是 `align-items: center` 的橫向排列，返回鍵與「標題＋副標」那個標題群置中對齊；但標題群兩行疊起來共 63px（標題行高 42px＋副標行高 21px），置中對齊只會把返回鍵放到這 63px 的正中央——比標題自己的中心低 10.5px，看起來偏低。改成 `align-items: flex-start`，再用 `margin-top: 3px` 把返回鍵的中心精準推到標題那一行的中心：`(標題行高 42px − 返回鍵直徑 36px) ÷ 2`。

**Dependencies** — `.owner-lookup`（`owner-lookup.css`）、`.input`、`.select`、`.btn`、`.wizard__step-title`。無獨立 JS 檔；搜尋、選取與帶入由 `create-event.html` 的行內控制器處理（聚焦展開／打字過濾／點選填回／Escape 與點外面收起）。帶入後的欄位鎖定樣式見 §4.121。

**Consumers** — `create-event.html`（bookyay 帶入閘門，場地資料）。

**CSS** — [`source-import.css`](./ds-components/source-import.css)

---

### 4.121 Field source tag

**Purpose** — 欄位標籤旁標記「這一格是從哪裡帶進來的」（bookyay 帶入後不可改），並讓被鎖定的欄位維持可讀——它的樣子要說出「這一格由別處管」，只降一點對比、游標改不可編輯。2026-08-09 自 `create-event.html` 的頁內 `.ce-src` / `.is-locked` promote。

**Anatomy**
- `.field-source` — 掛在 `.field__label` 內、靠右對齊（小鎖頭 icon＋「bookyay」字樣）；`.field__label:has(.field-source)` 才開 flex，避免壓掉一般欄名裡刻意留的空白
- `.is-source-locked` — 掛在欄位容器；**本身不再自己定義表單控件的鎖定樣式**（2026-08-09 第二輪，使用者裁示「整個元件庫只能有一個 disabled 樣子」）——內部的 `.input`／`.textarea`／`.select` 完全吃 [Input §4.8](#input) 的 `.input:disabled`（透明底＋`--locked-field-ink`）；`.segmented__btn`（含建在它上面的 [Radio card](#radio-card)）不是表單控件、吃不到 `:disabled`，鎖定樣式仍由本檔定義——`cursor: not-allowed`＋`pointer-events: none`（不可點），文字對比改由 `.radio-card__title`／`.radio-card__sub` 直接吃 `--locked-field-ink`（**2026-08-09 第三輪**，見下）

**鎖定態呈現的三輪修訂（皆 2026-08-09）** — 第一輪（使用者反饋「disable 的背景色要和外層的背景色一樣，文字不要這麼明顯」）：本檔一度自己定義來源鎖定的樣式——透明底＋文字降到 `--muted-foreground`，寫法下到 `:disabled` 這一層（`.is-source-locked .input:disabled`，0-3-0）蓋過元件層 `input.css` 的 `.input:disabled`（當時是 `--muted` 填底，同權重 0-2-0，坐在 `form-section` 上會變成一塊比卡片還深的方塊，讀起來像「這裡有東西壞了」）。**第二輪（使用者裁示「整個元件庫只能有一個 disabled 樣子」）**：把第一輪那組「透明底」值直接上收成 `input.css` 的 `.input:disabled` 全站基準（值改用 `--locked-field-ink`、`opacity` 拿掉改吃顏色控制對比），本檔因此不再自己定義**表單控件**的鎖定外觀——來源鎖定與其他 disabled 欄位長得一樣是刻意的，差別由標籤旁的來源標記（`.field-source`）說明，不靠兩種灰去暗示「這格為什麼不能改」。**第三輪**：`.segmented__btn`（[入場方式／取票方式](#source-import) 這類用 Radio card 呈現的欄位，bookyay 帶入後整組鎖住）原本還留著舊制的 `.is-source-locked .segmented__btn { opacity: .78 }`，等於同一頁同時存在「表單控件用顏色降對比」與「segmented 用透明度降對比」兩種鎖定語彙。改成同一套做法：`opacity` 拿掉，`.radio-card__title`／`.radio-card__sub` 文字直接吃 `--locked-field-ink`（不疊 opacity），卡面其餘部分（邊框、底色）不降對比——鎖定的是「內容不可改」，不是「整張卡消失」，與其他 disabled 欄位、與 [Upload tile](#upload-tile) 已填態撤除綠框的判斷同一個方向：**站上「不可改／已完成」一律靠顏色或邊框樣式表達，不疊 opacity 弱化整塊**。`pointer-events: none` 維持，滑鼠仍點不動。

**命名說明** — 這個 class 刻意不叫 `.is-locked`：該名字已被 `media-vault.css` 用在完全不同的語意（檢視器模式下某分級整列打不開，變暗＋灰階＋鎖頭），兩者都不在自己的命名空間裡，若同頁兩支元件同時服役會互相污染（誰的 `.is-locked`生效取決於載入順序，而非語意）。「來源鎖定」與「權限鎖定」是兩回事，各自留一個不會被對方覆寫的名字。

**Dependencies** — `.field__label`、`.field`、`.ztor-icon`、[Input §4.8](#input)（`.input:disabled` 提供鎖定欄位的實際外觀）。無獨立 JS 檔；隨 §4.120 Source import 的帶入流程一起出現，欄位 `disabled` 由消費頁在帶入當下設定。

**Consumers** — `create-event.html`（bookyay 帶入後鎖定的場地欄位）。

**CSS** — [`field-source-tag.css`](./ds-components/field-source-tag.css)

---

### 4.122 Quick result list

**Purpose** — 批次設定產生結果的唯讀預覽，一列一項：名稱｜金額｜數量｜跟隨預設／已自訂標籤｜重設動作，可依場次分組。欄位對齊票種卡（§4.114）同一張表的節奏。2026-08-09 自 `create-event.html` 的頁內 `.ce-qres*`（快速設定彈窗下半「生成的門票」預覽）promote。

**Anatomy**
- `.quick-result` — 直排容器
- `.quick-result__head`（選配）— 場次分組小標，單場時不出現
- `.quick-result__row` — grid 五欄（名稱／金額／數量／標籤／動作）
- `.quick-result__name` — 名稱，超長截字尾
- `.quick-result__num` — 出現兩次（金額、數量），等寬數字靠右
- `.quick-result__tag` — 「跟隨活動預設」或「已自訂」說明；`.quick-result__tag--own` 加深顏色標出已自訂（不會跟著活動預設走的那幾張要看得出來）
- `.quick-result__end`（選配）— 重設鈕

**Responsive** — ≤720px 收成兩欄（名稱／金額），標籤與動作各自佔滿下一行。

**Dependencies** — 無外部元件依賴，純 CSS 排版。無獨立 JS 檔；渲染與重設由 `create-event.html` 快速設定彈窗的行內控制器處理。

**Consumers** — `create-event.html`（快速設定彈窗「生成的門票」預覽）。

**CSS** — [`quick-result-list.css`](./ds-components/quick-result-list.css)

---

## Pillar 5 · Pattern

> Cross-component behavior conventions. Per DSS v1.4: layout patterns / voice / accessibility / interaction states / data viz live here, NOT in Component (which only defines per-component variants/states).

### 5.1 Pattern cards

Best-practice assembly recipes — how components combine to meet a creator's goal. A Pattern is not a component (Pillar 4) and not a wireframe (the page implementation). Each card has five grids: `trigger` (when to use) / `must` (≥2 non-negotiables) / `should` (advisable) / `must-not` (anti-patterns) / `_edge-cases` (empty / error / new-user / mobile / offline). Four categories, ten cards（頁面級 5 張＋中間層 4 張，2026-07-08；2026-07-20 新增 Detail + persistent rail，共十張）。Component sections demo the unit only — assembly rules live here（判準見 §4.0）。

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
- **must**: Every field is a `Field`（label + optional hint + exactly one control slot; the control reuses an atom — Input / Switch / Segmented / textarea）; group fields into `Form section`s（title + grey sub; sibling sections auto-divide via the component's own `+` rule; base gap 6 / field spacing 16）；side-by-side fields use `Form grid`, never hand-rolled columns. 建立流程的 `.wizard__sheet--sectioned` 使用 `--surface-page` 作底；`.form-section--outlined` 以 `--card` 填色形成區塊（亮暗一致；dark 原用 `--muted`、2026-07-17 midnight 改 `--card`）（**無外框線**，Q14），所有可見 outlined siblings 以 `--sp-24` 間隔並跨越 `[hidden]`。採用頁為 create-product／-auction／-bundle／-event／-project／register-ip／admin-ip-bank-entry。
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

#### Detail + persistent rail (Layout)

- **trigger**: An entity page where editing is split across tabs, but a handful of read-only facts must never leave view — product detail (stock on hand, delivery method, linked project); any future detail page with the same shape.
- **must**: Wrap the page in `.page.page--narrow`（1056px 窄版容器，§6.1——1280 的預設寬度配上 300px 右欄會讓左欄行長過長）; use the `Detail rail` shell (§4.52) — editable `Tabs` inside `.detail-main`, `.detail-rail` on the right holding **read-only** `Form section` cards built from `KV list` (§4.50) / `Stock bar` (§4.51) / `KPI`. The rail answers "what do I need to know before I change something", so it carries constraints and consequences, never the fields being edited. Every rail card must make sense from **every** tab — anything meaningful in only one tab belongs in that panel instead.
- **should**: Cap the rail at 3–4 cards（會捲動的右欄就不再是常駐）; order them by how often they block a decision (stock before provenance); pair every bar or meter with its exact figure（見 §4.51）; keep rail cards short enough that the head's tightened `--sp-12` spacing reads as deliberate.
- **must-not**: Never put a primary action or the only entry point to a task in the rail — below 1100px it falls in under the main column and stops being visible alongside the content; never make a rail value editable in place（可編輯就該回到主欄的 `.field`）; never add per-card margins inside the rail（間距由 `.detail-rail` 的 `gap` 擁有，見 §4.52 Notes）。
- **_edge-cases**: `empty` → a rail card with no data shows an em-dash value, never disappears (a vanishing card changes the page's shape between tabs); `error` → the card keeps its last-known value with a stale marker rather than blanking; `new-user` → rail renders with placeholder values so the layout is learnable from the first visit; `mobile` → single column, rail after main, so nothing in it may be the only route to a task; `offline` → rail values dim and carry a "last synced" note.

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
- Avoid the `不是 X，而是 Y` negation-contrast Chinese construction (per `feedback_writing_style_no_negation_contrast`) — write positive claims directly.

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
| `grid.max-width` | `1280px` | Container cap — `.page` max-width。窄版變體 `.page--narrow` = `1056px`（兩欄詳情頁專用，見 §6.1） |
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
- **Page container** — `max-width: 1280px`, centered; padding 32 24 96 (top-x-bottom).
- **`.page--narrow` 窄版變體** — `max-width: 1056px`（2026-07-20 Q21）。**用途**：只給「主欄＋右側常駐 meta 欄」的兩欄詳情頁（Detail rail §4.52）。**為什麼需要**：右欄固定 300px，容器若維持 1280，左欄會寬到行長過長、讀起來吃力；收成 1056 讓左欄回到舒適行長，右欄寬度不變。**基準不動**：其餘所有頁面維持 1280——Q21 原本裁定全站 1280→1056，同日經使用者實看結果後改為僅此變體套用。**Consumer**：`product-detail.html`、`order-detail.html`、`bundle-detail.html`、`auction-detail.html`（皆 `<div class="page page--narrow">`；後兩者 2026-07-27 改用同一套詳情頁殼）。定義在 `shared.css`。
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

**Actions cluster holds actions only** (2026-07-31 user ruling). `.page-intro__actions` is reserved for controls that change data — save, create, export, discard. Contextual help ("How this works", 8 pages across the Fans module) moved out: a bare link standing next to a primary button reads as a third action when all it does is explain the page. It now lives at the end of the explanatory copy as `.page-intro__help`, an inline accent link inside `.page-intro__lede`.

- `.page-intro__lede` wraps `.page-intro__sub` + `.page-intro__help` and carries the 560px measure (moved off `__sub`, which becomes `display: inline` so the link flows after the final sentence and wraps with it).
- The link cannot be nested inside `__sub`: `applyI18n` replaces the whole `innerHTML` of any `[data-i18n]` node, so anything written inside would be wiped on language switch. Sibling element, shared parent.
- Pages whose lede is not a plain sentence use the same idea against their own copy line — `fan-detail.html` puts `.page-intro__help` at the end of `.fan-hero__meta` (the identity line), not in `.fan-hero__actions`.
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

## Implementation Notes

Technical-stack landing for this design system. The studio is a **static prototype** — no build step, no framework.

| Concern | Decision |
|---|---|
| Markup / styling | Hand-written HTML + CSS; one CSS file per component in [`ds-components/`](./ds-components/), all token-driven (`var(--…)`) |
| Tokens | [`ds-components/_tokens.css`](./ds-components/_tokens.css) — Foundation + Role + Mode (`[data-theme="dark"]`) in one layer |
| Theme | `theme.js` — light / dark / system cycle, persisted in `localStorage["ztor.theme.preference"]`; `?theme=` one-time override |
| Icons | `icons.js` — Tabler registry, injected per page via `ztorIcons.applyIcons()`; new icons must be registered first |
| i18n | `i18n.js` — `en` / `zh-Hant` dictionary, `data-i18n*` bindings, topbar toggle, `localStorage` persisted |
| Fonts | self-hosted woff2 in [`fonts/`](./fonts/) — Satoshi (primary Latin) / Geist / Inter (Latin fallbacks) / Geist Mono / LINE Seed TW (CJK headings) / Chiron Hei HK (CJK body-UI) / Noto Sans TC (CJK fallback), all subset — no CDN |
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

  --font-display: 'Satoshi', 'Geist', var(--font-cjk-display), system-ui, sans-serif;
  --font-ui:      'Satoshi', 'Geist', var(--font-cjk), system-ui, sans-serif;
  --font-body:    'Satoshi', 'Inter', var(--font-cjk), system-ui, sans-serif;
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
        "display": "Satoshi, Geist, LINE Seed TW, system-ui, sans-serif",
        "ui":      "Satoshi, Geist, Chiron Hei HK, system-ui, sans-serif",
        "body":    "Satoshi, Inter, Chiron Hei HK, system-ui, sans-serif"
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

- **2026-08-09** — 建立活動第三輪：四支既有元件的視覺語彙收斂，全站生效。
  - **§4.7b Upload tile** — `.upload-tile.is-filled` 撤除 `--status-success` 綠框／綠字（使用者裁示「不該有這種綠框元件」），改實線中性邊＋`--foreground` 文字；已填／未填改由邊框樣式（solid vs dashed）辨別，不再靠顏色，與 `[data-upload].is-filled` 互動格既有配方對齊。全站生效（十幾個消費頁的上傳格皆吃此樣式）。
  - **§4.1 Inventory Radio card** — `.segmented.radio-cards` 補 `align-items: stretch`，修正三卡並排高度不一的根因：grid 預設 `align-items` 是 `stretch`，但 `segmented.css` 的 `.segmented { align-items: center }`（0,1,0）沒被同權重不足的 `.segmented.radio-cards`（0,2,0，本身未設此屬性）蓋掉，卡片因此各自用內容高度置中；本輪顯式補回 `stretch`。
  - **§4.121 Field source tag** — `.is-source-locked .segmented__btn` 撤除 `opacity: .78`，改 `.radio-card__title`／`.radio-card__sub` 直接吃 `--locked-field-ink`（不疊 opacity），與表單控件的 disabled 語彙、與 Upload tile 撤綠框同一個方向：不可改／已完成一律靠顏色或邊框表達，不疊 opacity 弱化整塊。`pointer-events: none` 維持。
  - **§4.6 Switch** — 新增 `.switch--locked` 的 Class API／Variants／States／Do-Don't 記載，並記錄它從 `notification-matrix.css` 上收進 `switch.css` 的原因（tier-settings.html／create-event.html 只連 `switch.css`，掛了 class 卻吃不到視覺）；§4.22i Notification matrix 同步改為只消費、不定義。
  - **§4.1 Inventory Control row** — `.control-group` 新增消費頁 create-event.html（販售方式：「發布後直接開賣」開關，關掉才展開「開賣／停售時間」欄位），計數 11→12 組、5 頁；記錄此消費頁的揭示方向與既有頁相反（關才展開，非開才展開），元件本身不因此分岔，揭示條件一律由消費頁決定。

- **2026-07-29** — 外部協作者併入改版帶進 19 支新元件，補齊 md 側文件（machine contract），html 側 demo 由另一 agent 同步處理。
  - **New §4.92–§4.110**（19 支）：artist-picker（⚠ 退場候選，全站零消費含配套 JS）、benefit-matrix、brand-card、chart-tip（⚠ earnings-sony.html 待收斂，仍留內嵌複本）、checkbox（port 自既有統一設計系統）、detail-sheet、explainer（⚠ media-vault.html 死引用）、fans-guide、inline-edit（✝ 已退場墓碑檔，0 consumers）、manage-ip、media-vault、perf-rank、sortable（⚠ tier-benefits.html 死引用）、numeric stepper（`.zstep`，與既有「Stepper」wizard 進度圓圈為不同元件）、sticky-actions、toast（同步校正 §4.1 Inventory 舊行的過時資訊）、vault-share、wizard-split、zselect。
  - **§4.1 Inventory** 新增對應 19 行＋校正 Toast 舊行。
  - **Pillar 1 §1.1** 修正 `--primary-foreground`（2026-07-28 由 light `#FFFFFF`/dark `#171717` 改為亮暗同值 `#171717`，隨附理由：白字對 `#ffa33f` 僅 1.99:1 不過 WCAG AA）、同步更新 `--on-primary` 說明；新增 `--status-warning-ink`／`--status-accent-ink` 文件化（先前已定義於 `_tokens.css` 但未寫入 md）；新增 Scrollbar token 小節（`--scrollbar-size`／`--scrollbar-thumb`／`--scrollbar-thumb-hover`）。
  - **Pillar 2 §2.1** 同步修正 `--primary-foreground` role 表列值。
  - **New §1.5b Raw-value exceptions — r2.2 新元件**：逐條記錄 8 處裸值（brand-card／chart-tip／checkbox／detail-sheet／media-vault ×4／sticky-actions／fans-guide ×2）之判準與理由；`detail-sheet.css:34` 的遮罩值判定為「應收斂」而非合理例外（與既有 `--overlay-tint` 概念重疊但值不同），記錄供下一輪 CSS 治理處理，本輪未動 CSS。

- **2026-07-21** — Product-detail 補貨紀錄與分頁寬度：一個新元件＋一個既有元件的新修飾子。
  - **New §4.55 Restock log** (`restock-log.css`, 🟡 molecule) — 補貨紀錄表，逐筆一列、欄位對齊（選項組合／補貨數量／日期／供應商／狀態），數量用等寬數字。外層 `.restock-log-wrap` 提供邊框、`--radius-xl` 圓角與水平捲動；`.restock-log--with-option` 供多選項商品開出「選項組合」欄，不掛時該欄含表頭整欄不顯示。取代原本用 `.data-list` 把數量／日期／供應商擠成一行標題＋一行 meta 的寫法——補貨紀錄是要跨列比對的，擠成句子只能一筆一筆讀。Consumer: product-detail.html。
  - **§4.52 Detail rail 新增 `.detail-grid--full`** — 兩欄殼收成單欄、右欄 `display:none`。用於「該分頁內容已自帶完整狀態，右欄再放一次等於重複」或「內容需要整頁寬度」的分頁；何時掛由 consumer 的分頁切換邏輯決定，元件層不判斷。product-detail 的「定價與庫存」分頁使用。

- **2026-07-20** — Product-detail round: three new components promoted + a site-wide type / surface / width adjustment (裁決編號 Q21).
  - **New §4.50 KV list** (`kv-list.css`, 🟢 atom) — read-only key/value row for detail-page meta cards. `.kv--lead` exists because `[hidden]` rows still match `:first-child`; `.kv[hidden]` zeroes `display` explicitly since the component is `display:flex`. Consumer: product-detail.html.
  - **New §4.51 Stock bar** (`stock-bar.css`, 🟢 atom) — 5px quantity bar, two colour states (normal / `--low`); percentage supplied by the consumer as inline `width`, low threshold owned by the product rule not the CSS. Consumer: product-detail.html.
  - **New §4.52 Detail rail** (`detail-rail.css`, 🟠 organism) — detail-page two-column shell (1fr / 300px, sticky rail, single column ≤1100px). Component section covers the shell only; assembly rules moved to a new Pillar 5 pattern card **Detail + persistent rail** (§5.1, now ten cards) per the §4.0 component-vs-pattern boundary. Consumer: product-detail.html.
  - **`form-section.css`** — `.form-section__title` `--fs-18` → `--fs-14` (level with `.field__label`; hierarchy now carried by the card edge, not by heading size); `.form-section__sub` `--fs-14` → `--fs-11` and `--foreground-muted` → `--muted-foreground` (level with `.field__hint` — section sub and field hint are the same supporting-explanation role). Affects every form-section consumer page at once.
  - **`field-system.css`** — `.field__hint` `--foreground-muted` → `--muted-foreground`, reversing the 2026-07-16 lightening decision; hints return to the supporting tier and re-align with `.form-section__sub`. Site-wide.
  - **`kpi.css`** — `.kpi` background `--card` → `--input-surface`. KPI tiles are frequently nested inside `--card`-filled outlined Form sections, where two identical fills merged into one flat surface; one step brighter lets the inner tile sit on top of the card (visible mainly in dark mode, where `--input-surface` is a step above `--card`).
  - **`shared.css`** — 頁寬**改為變體、不做全站收窄**（同日兩次裁決）：`.page` 的 `max-width` 維持 **1280px**；新增窄版變體 **`.page--narrow` = 1056px**，只給 Detail rail（§4.52）的兩欄詳情頁使用——右欄固定 300px，容器留在 1280 會讓左欄行長過長。Q21 原本裁定全站 1280→1056，使用者實看結果後同日改為僅此變體套用，其餘頁面一律維持 1280。consumer：`product-detail.html`、`order-detail.html`（2026-07-23 訂單明細改主欄＋買家資訊右欄）。文件連動：Pillar 1 §1.9、Pillar 6 §6.0 `grid.max-width`、§6.1（新增 `.page--narrow` 條目）、§4.1 Inventory 的 App shell 列；順帶校正這三處原本停留在更舊的 1248px 數字。

- **2026-06-01** — De-branded + cleaned of upstream-source residue to align with `project-ui-creator` skill rules (DSS v1.4).
  - Identity, §5.2 Voice, §5.1 patterns, §5.3 States, §5.5 Workflow rewritten from the upstream source-system (GEO) framing to **Ztor Creator Studio** (creator-economy operations dashboard).
  - §5.1 restructured into **Pattern cards** (5 cards across Layout / Interaction / Lifecycle / Workflow, each `trigger/must/should/must-not/_edge-cases`).
  - §4.0 de-branded (removed Material/Polaris/Brad Frost cross-reference column); §4.1 Inventory rebuilt against the real `ds-components/` files with a `_layer` column (dead `components/` links removed).
  - Similar Systems de-duplicated (kept in Identity); appendices renumbered (B→A Output formats, C→B JSON skeleton); JSON skeleton `record.source`, `component._layer`, and `pattern._cards` updated.
  - Removed the ~475-line upstream marketing/app crawl report (Source notes · Confirmed absent · Sources) — provenance of the upstream source system, not part of this product's design system.
