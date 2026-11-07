# Ztor Creator Studio · R 2.2 — Design System

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

**Overview** — Ztor Creator Studio · R 2.2 is a clean, editorial take on a creator-economy operations dashboard: a white canvas (`#FFFFFF`) with near-white neutral surfaces — default cards and controls separate by a flat 1px `--border` (Q3/Q4 2026-07-13), and the sidebar display-mode rail uses a quieter `#FBFBFB`. Satoshi for UI / display / body (Geist and Inter kept only as Latin fallbacks), LINE Seed TW for CJK headings / Chiron Hei HK for CJK body-UI (2026-07-28 rebrand), subtle 6px radii, and multi-layer rim+drop shadows reserved for popovers/overlays and for the hover state of clickable/selection cards. Its one high-saturation move is **a highlighter-orange primary (`#ffa33f`) with near-black text** — used structurally for CTAs, active tabs, selection-card selected state, hero fills and pre-order pills (nav active states stay neutral gray — Q8). Informational banners stay neutral gray. Hairlines stay at `#EAEAEA`. The voice is task-oriented and finance-honest: every page states what you can do now, and money / royalties / verification states are always spelled out.

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
  只有可點／浮起的強調卡（`.ztor-card--clickable` hover、`.selection-card`）才有 hover 回饋；2026-10-20 起回饋改為「上浮＋底色換按鈕 hover 階」，不再升級陰影（見 5.3「可點卡片 hover」）。
- **Q4 控制項＝視覺邊線**
  `.input` / `.textarea` / `.select` 使用 `0 0 0 1px var(--border)` 陰影邊線，避免原生 border 影響控件尺寸。
  focus 改為 `--ring` 1px 邊線 + 4px 柔光環；`.ztor-metric-pill`、`.switch` 維持各自既有規則。
- **Q5 hover 浮起規則**
  **2026-10-20 使用者更新**：整張卡是一個點擊區的卡片 hover ＝ 上浮 `--clickable-card-lift`（4px）＋底色 `--clickable-card-hover-bg`（＝按鈕 hover 階 `--control-raise-hover`），不換邊框、不換陰影；原「借 `--shadow-float` / `--shadow-card-hover` 浮起」退場。完整定義、消費者與例外見 5.3「可點卡片 hover」。
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
| `name` | Ztor Creator Studio · R 2.2 |
| `source` | Ztor Creator Studio — creator-economy operations dashboard (this project, R 2.2) |
| `version` | R 2.2 |
| `date` | 2026-06-01 (de-branded + Pattern cards + provenance cleanup) |
| `base` | Ztor (parent design system) — three light-mode tokens diverged for highlighter-orange CTA |
| `notes` | `--border` reverted from `#D1D1C7` → `#E5E5E5` on 2026-05-25 (cooler hairline, per user feedback). Canvas neutralised to white `#FFFFFF` and warm surfaces removed 2026-06-09. Orange Z brand mark replaced with full Ztor wordmark SVG in R 2.1.6. 13 app-tier components promoted from `shared.css` to `ds-components/*.css` across Phase 0-4 (2026-05-26). |

---

## Pillar 1 · Foundation (raw tokens)

> **Renamed from §1 Foundations.** Foundation = the raw material layer: just values, no semantic meaning. Pillar 2 Role decides how these values get used.
> **完整清單看 `design-tokens.html`（2026-09-14 新增）**：該頁執行期讀 `_tokens.css` 原文自動產生（亮色全部 token、暗色覆寫、每條上方註解、活的預覽）＋ `js/icons.js` registry；本節與 `design-system.html` Pillar 1 仍是人工策展的解說，兩者有出入時以 `_tokens.css` 為準。

### 1.1 Color

Ztor Creator Studio · R 2.2 runs on a **clean white canvas with neutral light-gray surfaces and a single high-saturation brand color** — highlighter orange `#ffa33f` plays the role of primary CTA and nothing else does. Status accents stay reserved for dashboard data dots.

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
| `locked-field-ink` | `color-mix(--muted-foreground 55%, transparent)` | **全站 disabled 欄位唯讀值的墨色（2026-08-09 兩輪定案）** — 寫法一律 `var(--locked-field-ink)`。第一輪只在來源鎖定欄位（`field-source-tag.css` 的 `.is-source-locked`）用；**第二輪（使用者裁示「整個元件庫只能有一個 disabled 樣子」）把它上收成 `input.css` 的 `.input:disabled`／`.textarea:disabled`／`.select:disabled` 全站基準**，`field-source-tag.css` 因此不再自己定義鎖定樣式（見 [Field source tag §4.121](./ds-specs/4.121-field-source-tag.md)）。全站最輕的文字。不直接把 `--faint-ink` 調更淡，是因為它同時是表頭墨色（10 支元件），表頭沒有要跟著變。**對比刻意低於 AA**：實測深色 `#606061` 對 `#1C1D1E` ＝ 2.69:1、亮色 `#AFAFAC` 對白 ＝ 2.20:1。成立前提是它只承載 disabled 的唯讀值，而不是本頁要讀的資訊——欄位標籤與「bookyay 帶入」來源標記都維持正常對比，「這格是什麼、為什麼不能改」靠那兩個回答。**不得**用在需要閱讀的文字上。**2026-09-11 起檢視態（`[data-mode="view"]`）的欄位也吃這支**：使用者裁示「全站檢視態都改成 disabled 外觀」——shared.css 的檢視態規則改成透明底＋本墨色＋not-allowed＋不可選取，幾何仍不動、屬性仍是 readonly；站上只有一種「鎖住」的樣子。**2026-09-21 起檢視態不再吃這支（Q119）**：檢視態的欄位改畫成純文字讀數（`.field-readout`，前景色），這支回到只承載 `:disabled` 控件（建立後鎖死的分類、來源鎖定欄位、`.linkf--disabled`）。**2026-10-12 起輸入框類的 `:disabled` 也不再吃這支（Q128，UI-CHANGES 一百七十六）**：`.input`／`.textarea`／`.select` 的 `:disabled` 與描述編輯器的鎖定改吃 `view-field-ink`（可讀）；這支只剩未選的鎖定選項卡（`check-card.css`、`field-source-tag.css` 的 segmented）與作廢連結 `.linkf--disabled` |
| `view-field-ink` | `var(--faint-ink)`（2026-10-27 Q137 由 `--foreground-muted` 降兩階） | **全站 disabled 輸入框的值墨色（2026-10-12 新增；同日 Q128 裁決擴大，UI-CHANGES 一百六十七、一百七十六）** — 三個情境同一支：①`input.css` 的 `.input:disabled`／`.textarea:disabled`／`.select:disabled`（建立後鎖死的分類、bookyay 帶入、依階段鎖的發布設定、永遠唯讀的事實格如類型與摘要）；②兩段式面板（`[data-editable][data-mode="view"]`）檢視態的框；③編輯態 `readonly` 鎖住的框（`shared.css`）。另有 `rich-body.css` 的 `.rich-body__text[aria-disabled="true"]`。深色 ≈ 白 70%（對 `#1C1D1E` 約 9:1）、亮色 `#4D4D4D`（對白約 8.6:1），都過 AA。不用 `locked-field-ink`：那一支低於 AA；鎖住的格仍是要讀的資訊，「不能改」由透明底、`not-allowed` 游標與鎖定提示（`.field-source`、hint）表達 |
| `disabled-field-bg` | `color-mix(in srgb, var(--layer-0-surface) 20%, transparent)` | **（`--disabled-field-bg`）全站 disabled 輸入框的底（2026-10-12 新增，STYLE-DECISIONS Q133，取代 Q58／Q128 的透明底）** — 坐在卡上比卡面暗一階、仍透出卡面；`.input`／`.textarea`／`.select` 的 `:disabled`（input.css）、檢視態與編輯態 readonly 的框（shared.css）、鎖定的描述編輯器（rich-body.css）同吃這支。 |
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

### 1.1b ztorUI 換裝 · Glass & Glow 原料層（2026-08-28 熔接，Wave 1–2b）

**這是什麼** — `site/r2.3` 從換皮沙盒 `demo/ztorui-skin` 熔接進來的一組新視覺語言：深色近黑檯面上的白色低透明玻璃、暖橘霧光、發光選中態。原料值集中定義在 `ds-components/_tokens.css:608–674`（`--ztu-*` 家族，28 支）＋同段內不加前綴的 `--bloom-surface`（規格書 §3.8 指名的字面），另有 `--font-dot` 定義在 `fonts.css`。上層語義 token（`--primary`、`--border`、`--shadow-card`…）改成引用這批原料，元件層再引用語義 token——原則不變，只是原料換了一批新值。詳細熔接對照見 [`docs/wave1-熔接紀錄.md`](docs/wave1-熔接紀錄.md) 與 [`docs/wave2-熔接紀錄.md`](docs/wave2-熔接紀錄.md)。

**⚠ 深色語彙、light 模式尚未調校** — 這整組原料是為 `[data-theme="dark"]` 的近黑畫布調的（白色低透明玻璃、深投影、暖橘光）。多數消費它們的元件規則（`.card`、`.btn--primary`、`.chip` 等）**不分主題、寫在基礎選擇器上**，所以 light 模式目前也會吃到同一批值——例如白色調上疊 7% 白玻璃幾乎不可見。這是 Wave 1 就已知並記錄的現況（light 模式調校排在後續波次），文件如實記載、不代為修正。

**Foundation · Glass 三階**

| Token | Value | 用途 | 消費者（實測 var() 引用數） |
|---|---|---|---|
| `--ztu-glass-bg` | `rgba(255,255,255,0.07)` | 玻璃卡半透明底 | `.card`／`.kpi`／`.alert--bar`／`.readiness`／`.preview-card`／`.form-section--outlined`／`.list-toolbar`／`.app-topbar`／`.wizard__top::before`（頂列膠囊）／filter-tabs 已選殼 等（13 處；`.wizard__bottom` 2026-09-23 改同色遮色片後不再吃玻璃） |
| `--ztu-glass-strong` | `rgba(255,255,255,0.12)` | 玻璃 hover 加強 | 上述玻璃卡的浮層內排除補丁 hover、`.field-pill:hover`、`.chip:hover`、`.upload-tile:hover` 等（6 處） |
| `--ztu-glass-rim` | `rgba(255,255,255,0.15)` | 頂緣內光／浮層邊框色 | `.dropdown__menu`／`.zselect__panel`／`.preview-panel__sheet`／`.payout-dialog` 的 `border`、breadcrumb hover 圓鈕的 inset 邊 等（9 處） |
| `--float-glass` | `color-mix(in srgb, var(--popover) 72%, transparent)` | 浮層玻璃底（2026-10-27，Q78 修訂） | 下拉選單、選擇器、popover、提示框、彈窗共用；`.payout-dialog` 也吃它（不掛 backdrop-filter） |
| `--float-blur` | `var(--ztu-blur-glass)`（24px） | 浮層背景模糊（2026-10-27，Q78 修訂） | 與 `--float-glass` 成對使用；沒有模糊的半透明浮層會讓底下的字透上來 |
| `--ztu-film` | `rgba(255,255,255,0.06)` | 巢狀薄膜——卡中卡、控件凹槽、縮圖框、中性徽章共用的「疊上去的一層」，比玻璃低一階、刻意不帶 `backdrop-filter` | `.card--muted`／`.kpi.card--muted`／`.nest`／form-section 巢狀內層／`.input`／`.textarea`／`.select`／`.field-pill`／`.upload-tile`／`.badge`／`.stock-bar` 軌道／`.chip`／側欄項 hover 等（全站最多消費者，29 處） |

**Foundation · App shell 檯面與外殼**

**側欄收合成只有 icon（2026-08-31 建，全站）** — `.app.is-nav-rail`，鈕由 `sidebar.js` 產出所以每一頁的側欄都有，**與品牌同一行**（`.app-sidebar__top`）：它是這一欄的控制、不是導覽的一項，跟 logo 並排才讀得出「這顆管的是整條側欄」，另起一列會被當成清單的第一項。**圖示要先登記進 registry**——第一版用 `chevrons-left`／`panel-left-close`，那幾個名字不在 `js/icons.js` 裡，`applyIcons` 不認得就把 `<i>` 原封不動留著，按鈕因此是一個看不見的空方塊（實測 32×32、`renderedAsSvg: false`）；改用新登記的 `sidebar-collapse`／`sidebar-expand`（面板輪廓＋箭頭，不用單純的雙箭頭——單獨的箭頭在站上已經是「上一張／下一張」與「查看更多」）。`aria-label` 要**直接查表寫值**，不能靠 `applyI18n(btn)`：那支只掃傳進去那個元素的後代，標籤掛在按鈕自己身上永遠掃不到。**品牌區橫向置中要用 `align-items` 不是 `justify-content`**：它是直向 flex（標誌在上、Creator Studio 在下），`justify-content` 在直向 flex 裡管的是垂直——寫了會顯示成 center 但記號仍貼左（實測偏 12px＝記號的半寬）。**收起時品牌在最上、收合鈕緊接在它底下自成一列，下面一條分隔線**（2026-08-31 三次裁示：先「移到上面」、再「縮小後可以放在下面」、最後「這個 icon 要移上去，並在下面加一條分隔線」）：76px 的欄裡那一行只放得下一樣東西（記號 24 ＋間距 8 ＋鈕 32 ＝ 64，扣掉內距只剩約 60，並排會折行且貼左），所以鈕自成一列。**分隔線畫在導覽清單的上緣、不是畫在鈕底下**：鈕只有 32px 寬，線跟著它就只有 32px，看起來像鈕的一部分而不是一條分界；掛在清單上，線才吃滿整條欄的寬度（實測 48px＝欄寬扣內距）。線在做什麼：鈕獨自站在導覽上方時會像「第一個導覽項」，一條線把「這一欄的控制」與「要去哪一頁」分成兩段。做法是收合時把包裝層設成 `display: contents`，讓品牌與鈕直接成為側欄的 flex 子項，排序才跟得上 DOM（品牌 → 鈕 → 導覽）。**未讀點改貼 icon 的右上角**（只在收合狀態）：展開時標籤還在，點跟在標籤後面讀得出「這一項有未讀」；收起後標籤沒了，點就變成 icon 旁邊一顆浮著的橘圓、看不出它在講誰。展開的側欄是全站每一頁在用的，這條不動它。狀態存 `localStorage['ztor.navRail']`，跨頁維持同一個選擇——每點一次導覽就重新展開的話，那顆鈕等於沒用。欄寬 248 → 76px。**收起時只藏字不藏路**：每個 icon 留在原位（圖示與名稱的對應關係不必重學）、子選單整段收起（它要靠名稱才讀得懂）、品牌換成只有記號的 `SYMBOL_SVG`（使用者 2026-08-31 提供）——ztor 的字標在 76px 裡扣掉內距只剩約 48px，硬縮會被切成「zto」。**兩個選擇器的坑**：① 欄寬要寫 `html[data-nav-mode="sidebar"] .app.is-nav-rail #sidebar` 並改 `flex-basis`——真正的來源是 shared.css 帶 id 的 `flex: 0 0 248px`，純 class 壓不過（實測改了 `width` 欄寬仍是 248px），而 flex row 裡只改 width 也不決定尺寸；② 字標的 class 是 `app-topbar__brand-logo`（兩個外殼共用同一支標誌），寫成 `app-sidebar__brand-logo` 完全選不到。**900px 以下這一整套退場**，那裡本來就由 burger 接手——兩套收合機制同時在，讀者不知道哪一顆管哪一件事。

| Token | Value | 用途 | 消費者 |
|---|---|---|---|
| `--ztu-canvas` | `#0a0a09` | app shell 檯面色——比任何面板都深，圓角玻璃面板浮在其上 | `body` 的 `background-color`（sidebar 模式） |
| `--ztu-shell-gutter` | `14px` | 玻璃外殼與視窗邊之間的留白，四邊等寬 | `.app` 的 `gap`／`height`（扣兩倍留白）／`padding` |
| `--ztu-shell-solid` | `#1c1c1b` | 外殼玻璃疊在檯面上換算出的實色等價——給「必須是實色但要跟外殼同一階」的填色用（background-image 吃不到 backdrop-filter） | `.list-dock.is-snapped .list-dock__bars` 兩塊向外凹角的徑向漸層填色 |
| `--ztu-blur-shell` | `14px` | **待採用**——與 `--ztu-blur-glass`／`--ztu-blur-heavy` 同段定義，全站目前無 `var()` 引用 | — |

**Foundation · 星空背景** — 四層星空以 CSS 偽元素（`html::before`／`::after` 等）與 `radial-gradient` 疊圖繪製，不是 token 化的顏色值（磚位與 alpha 一字不差照抄沙盒），詳見下方「App shell 與星空背景」一節；`--ztu-bloom-*` 是與星空同色系但用途不同的霧光色票，見下表。

**Foundation · 模糊、陰影與發光**

| Token | Value | 用途 | 消費者 |
|---|---|---|---|
| `--ztu-blur-glass` | `24px` | 玻璃卡的 `backdrop-filter` 模糊半徑 | 卡片家族、頂欄、浮層排除補丁等（全站最多消費，32 處） |
| `--ztu-blur-heavy` | `40px` | 加強模糊——貼頂捲動態需要更厚的毛玻璃 | `.app-topbar.is-scrolled` |
| `--ztu-shadow-card` | `0 24px 60px rgba(0,0,0,0.45)` | 玻璃卡投影原料 | **待採用**——`--shadow-card` 語義 token 在 dark 已改成完全相同的值，但走的是**改寫語義 token 本身**、不是 `var(--ztu-shadow-card)` 引用（Wave 2a 刻意決定：寫語義 token 比寫死值多留一條 light 模式的活路），故本 token 定義後全站無 `var()` 引用 |
| `--ztu-shadow-pop` | `0 12px 40px rgba(0,0,0,0.5)` | 一般浮起投影 | `.switch` 開／關滑塊 |
| `--ztu-shadow-pop-up` | `0 -12px 40px rgba(0,0,0,0.5)` | `--ztu-shadow-pop` 的向上版——給浮在內容之上、光從上方來的元件 | `.sticky-actions`（底部吸附操作列） |
| `--ztu-rim-soft` | `rgba(255,255,255,0.14)` | 頂緣內光弱階 | `.chip--active` |
| `--ztu-rim-strong` | `rgba(255,255,255,0.20)` | 頂緣內光強階——卡面比 chip 大，光要撐得住 | `.radio-cards .segmented__btn--active` |
| `--ztu-cool-white` | `#eaf2ff` | 涼白——帶藍相的白，給「要比中性白選中態更冷一階」的面用 | `.radio-cards .segmented__btn--active` 的選中卡面 |
| `--ztu-bloom-1` | `#d0553d` | 霧光色票 1（暖紅端） | 側欄選中 `::before` 霧光層 |
| `--ztu-bloom-2` | `#e8894f` | 霧光色票 2 | **待採用**——只在 `--bloom-surface` 的字面漸層值裡以 hex 出現，全站無 `var(--ztu-bloom-2)` 引用 |
| `--ztu-bloom-3` | `#f0a85e` | 霧光色票 3 | **待採用**（同上） |
| `--ztu-bloom-4` | `#f5cd80` | 霧光色票 4（暖黃端） | **待採用**（同上） |

**Foundation · 發光家族**（主要動作、側欄選中、segmented、switch 共用一份配方，不各寫各的）

| Token | Value | 用途 | 消費者 |
|---|---|---|---|
| `--ztu-accent-surface` | 150° 橘漸層（`#ffc178`→`#ffa33f`→`#f2871f`，各自 color-mix 透明化） | 發光面的底 | `.btn--primary`／`.segmented__btn--active`／`.switch--on` 軌道 等（7 處） |
| `--ztu-accent-blur` | `blur(16px) saturate(1.25)` | 發光面的 backdrop 模糊 | 同上（10 處） |
| `--ztu-accent-glow` | 4 層 `box-shadow`（外光暈＋雙 inset 高光暗邊＋外緣描邊） | 主要動作的光暈——四層裡最亮的一階 | `.btn--primary`／`.switch--on` |
| `--ztu-pill-active-glow` | 同配方、光暈與內光都調低一階（4px→2px、30%→24%、55–60%→60–70%） | 「選中」比「主要動作」安靜一階 | `.segmented__btn--active` |
| `--ztu-accent-fg` | `rgba(255,255,255,0.95)` | 發光面上的字色／滑塊色 | `--primary-foreground`／`--on-primary`（語義別名引用，另有 sidebar 家族的同名待採用別名）＋ `.switch--on` 滑塊 等（8 處） |
| `--bloom-surface` | 176° 六階暖漸層（`#d0553d`→`#e8894f`→`#f0a85e`→`#f5cd80`） | 主要按鈕 `::before` 霧光層——規格書 §3.8 指名的字面，刻意不加 `--ztu-` 前綴 | `.btn--primary::before` 及其 `--lg`／`--sm` 尺寸變體（3 處） |

**Foundation · 品牌橘三階**

| Token | Value | 用途 | 消費者 |
|---|---|---|---|
| `--ztu-orange` | `#ffa33f` | 品牌橘原色——實色按鈕、選中態 | `--primary`／`--chart-1` 等語義 token 改引用它（24 處，另有 sidebar 家族的同名待採用別名一併改寫但未實際消費） |
| `--ztu-orange-hi` | `#ffc178` | 橘的亮版——漸層頂端、當文字用的 accent-ink | `--primary-hover`／`--brand-ink` 等語義 token 引用（12 處） |
| `--ztu-orange-lo` | `#f2871f` | 橘的暗版——漸層底端、內陰影折射色 | **待採用**——`--gradient-brand` 等仍寫死同值 `#f2871f`，未透過 `var(--ztu-orange-lo)` 引用 |

**Foundation · 拉丁字面** — `--font-dot: "Doto", 'Poppins', var(--font-numeric), monospace`（定義於 `fonts.css`）。**待採用**——ztorUI 規格書把它列為 Creator 家族專屬，ztor mode（本站）明確不使用；`@font-face` 與字檔已備（Wave 2b），純粹「備而可用」，目前零消費端，`.kpi__value` 仍走 `--font-numeric`（Satoshi）。詳見 §1.2 Typography 的字面堆疊更新。

### 1.2 Typography

> **ztorUI 換裝（2026-08-28 熔接，Wave 1）**：拉丁字面從 Satoshi／Geist／Inter 換成 **Poppins**，三個角色（display/ui/body）共用同一支——ztorUI 的語言不靠「換字面」區分標題與內文，靠字級與字重。中文維持 `--font-cjk`（昭源黑體 → Noto Sans TC）；**`--font-cjk-display`（LINE Seed TW）本波退出 `--font-display` 的堆疊**，中文標題與內文現在同一支昭源黑體，`--font-cjk-display` 這支 token 仍定義著、但目前全站無 `var()` 引用（待採用）。`:lang(zh-Hant)` 的三條覆寫也同步改成同一份 Poppins 堆疊（見 `shared.css`），繁中模式不再把中文字面提到第一位——中文字的 `unicode-range` 仍釘死在 CJK 區塊、逐字落在 `--font-cjk`，改變的只有行高／基線改由 Poppins 決定。`--font-mono` 未動。以下為熔接後的現況：

Effective stack, from `ds-components/fonts.css` (this is what actually renders — see the note below the table):

```css
--font-display: 'Poppins', var(--font-cjk), system-ui, sans-serif;
--font-ui:      'Poppins', var(--font-cjk), system-ui, sans-serif;
--font-body:    'Poppins', var(--font-cjk), system-ui, sans-serif;
--font-cjk-display: 'LINE Seed TW', 'Chiron Hei HK', 'Noto Sans TC';   /* 待採用，見上方換裝說明 */
--font-cjk:         'Chiron Hei HK', 'Noto Sans TC';
```

- **Poppins** — primary Latin face for all three roles, 4 static weights self-hosted（300/regular/500/600；`ds-components/fonts.css:39–66`）. 幾何圓體，`--font-display`／`--font-ui`／`--font-body` 現在是同一支，不再靠換字面分標題與內文。
- **Satoshi** — 換裝前的主字面，現退為 `--font-numeric`（金額／KPI 數值等「要被讀成數量的字」）的字面，非 `--font-display`／`--font-ui`／`--font-body` 的備援鏈成員。
- **Geist / Inter** — 換裝前的拉丁備援，已從 `--font-display`／`--font-ui`／`--font-body` 的堆疊移除；`--font-mono`（Geist Mono）不受影響。
- **Chiron Hei HK** (昭源黑體) — CJK body/UI (`--font-cjk`)，換裝後同時承擔中文標題與內文，stays legible at small sizes.
- **LINE Seed TW** — 待採用（`--font-cjk-display`）：換裝前的 CJK 標題字面，本波退出 `--font-display` 堆疊，目前無消費端，token 仍保留備查。
- **Noto Sans TC** — final CJK fallback.
- **Doto** — 待採用（`--font-dot`，見 §1.1b）：ztorUI 規格書的點陣數字字面，Creator 家族專屬、ztor mode 不使用，`@font-face` 已備。

| Scale token | Family | Size | Weight | Line height (`--lh-*`) | Tracking |
|---|---|---|---|---|---|
| `display-64` | Poppins（原 Satoshi，2026-08-28 換裝） | `64px` | 300 | `none` 1.0 | `-1.28px` |
| `display-44` | Poppins | `44px` | 300 | `tight` 1.1 | `-1px` |
| `title-40` | Poppins | `40px` | 400 | `tight` 1.1 | `-0.8px` |
| `title-32` | Poppins | `32px` | 400 | `tight` 1.1 | `-0.6px` |
| `title-24` | Poppins | `24px` | 400 | `snug` 1.2 | `-0.48px` |
| `label-15` | Poppins | `15px` | 400 | `none` 1.0 | `-0.3px` |
| `label-14` | Poppins | `14px` | 400 | `snug` 1.2 | normal |
| `body-16` | Poppins | `16px` | 400 | `loose` 1.6 | normal |
| `body-14` | Poppins | `14px` | 400 | `relaxed` 1.5 | normal |
| `caption-12` | Poppins | `12px` | 400 | `normal` 1.3 | `0.05em` |

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
2. `ds-components/fonts.css` 排在其後載入，**完整重新宣告**同一批 token。2026-08-28 ztorUI 換裝前：拉丁換 Satoshi 打頭（`Geist`／`Inter` 降為備援）、中文兩支角色分工（`--font-cjk-display`＝`LINE Seed TW` 標題、`--font-cjk`＝`Chiron Hei HK` 昭源黑體 內文／UI）。**換裝後（現況）**：拉丁三個角色統一換成 `Poppins` 打頭（`--font-cjk-display` 退出 `--font-display` 堆疊，`--font-cjk` 不變），並新增 `--font-dot`（Doto，待採用）；持有全部 `@font-face`（含本波新增的 Poppins 四字重與 Doto 兩字重）。
3. `shared.css` 的 `:lang(zh-Hant)` 只影響拉丁／中文的排序，不改變「用哪一支中文字面」——那是由 `fonts.css` 的 `--font-cjk`／`--font-cjk-display` 決定。2026-08-28 換裝後這三條也改成 Poppins 打頭（與 `:root`／`fonts.css` 同一套堆疊），繁中模式不再把中文提到第一位，理由見本節開頭的換裝說明。

**實際生效的是第 2 層**（`fonts.css` 覆寫贏過 `_tokens.css`），文件與程式碼都要以它為準。

Tight negative tracking (`-1.28px` on H1, `-0.8px` on H2) carries over from the Geist-era signature and still applies under Poppins.

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

**六個具名 token（`_tokens.css` canonical，值以此為準）：**

| Token | Value | Note |
|---|---|---|
| `--radius-sm` | `3px` | Inner sub-radii on nested components (chips inside cards, code chips, swatches) |
| `--radius` | `6px` | Buttons, inputs, form controls — primary radius |
| `--radius-md` | `6px`（`--radius` 別名） | Q2 2026-07-13 併入 `--radius`；保留別名避免 67 處呼叫點 churn，原值曾為 7px |
| `--radius-lg` | `8px` | Nav panels, dropdown 浮層 |
| `--radius-xl` | `16px` | Card / panel / dialog-level containers（Q16 2026-07-17，原 6px 放大到與 form-section 一致） |
| `--radius-shell` | `28px` | Route-page corner inside the sidebar app shell |
| `--radius-pill` | `9999px` | Status dots, avatar circles, badge chips, full-round pills |

| Semantic role | Value | Where |
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
| `shadow-card-hover` | `var(--shadow-float)` | 舊「可點卡片 hover 借 E3」的別名；2026-10-20 起可點卡片 hover 改走 `--clickable-card-lift` / `--clickable-card-hover-bg`，此 token 僅剩 `.brand-card` 等少數處使用 |
| `shadow-raise` | `0 1px 2px rgba(0,0,0,0.06)` (dark `0.5`) | Low control raise — primary buttons, input drop, segmented active |
| `shadow-raise-strong` | `0 1px 2px rgba(0,0,0,0.16)` (dark `0.6`) | Floating control — switch knob, chart marker drop |
| `shadow-hairline` | `0 0 0.833px rgba(0,0,0,0.2)` | Sub-pixel border simulation |
| `shadow-header` | `0 3px 16px rgba(0,0,0,0.10)` (dark `0.45`) | 下緣柔和投影（由元素後內縮圓角色塊投出，只露下緣；`.edge-shadow` 工具）。原本也給 sticky wizard header 用，2026-09-23 頂列改膠囊後不再使用 |
| `shadow-seam` | `7px 0 20px -4px rgba(12,10,9,0.16)` (dark `0.6`) | 上層主面板向右蓋向相鄰下層（E-Shop 主面板疊在預覽上） |
| `shadow-edge-top` | `inset 0 1px 0 rgba(255,255,255,0.5)` (dark `rgba(253,253,253,0.05)`) | 頂緣高光——疊在無邊框浮起卡上緣，與 `--shadow-card` 併用（`form-section--outlined`，Q18 2026-07-17）；亮色白底近乎不可見、深底顯上緣光。屬階梯外邊緣工具 |
| `shadow-nest-up` | `0 -6px 8px rgba(0,0,0,0.05)` (dark `0 -8px 8px rgba(0,0,0,0.08)`) | 向上投影——把嵌在卡片底部的巢狀層（`.nest`，§4.86）從卡面托起。⚠ 只有垂直位移、模糊會往左右外溢，母卡必須 `overflow:hidden`。亮色模式下卡與 nest 同為白，這道陰影是唯一的分層線索。屬階梯外邊緣工具（2026-07-21，Figma 856:27798）|

**Pattern** — Ztor uses **multi-layer shadows to define edges without ever drawing a border**. The `inset 0 0 0 1px rgba()` ring is a soft outline; the `0 2px 6px rgba()` is the drop. Together they replace what most systems would draw as a `border: 1px solid var(--border)`. This remains the pattern for dropdowns / popovers / dialogs / overlays, input controls, and the hover state of clickable / selection cards. **Exception (2026-06-12)**: outline buttons draw a real `border: 1px solid var(--border)` — on the clean-white canvas (06-09) a fill-only edge disappears. **Exception extended (Q2–Q3, 2026-07-13)**: default cards (`.card` / `.kpi` / `.ztor-card`) moved to a real 1px `--border`; `--shadow-card` is reserved for clickable/selection-card hover and for surfaces that retain their own elevation (base `.selection-card`, dropdown-item, table, composer, cookie-banner). **Exception extended (Q13, 2026-07-16)**: the create-flow choice cards — `.selection-card--icon` and `.radio-cards` — moved to a flat 1px `--border`, no shadow, aligned to Figma node 781-4166. **Exception extended (2026-07-21)**: product-list row hover/drag lift drops the rim entirely (`--shadow-lift-flat`, light mode only) — its lifted card background already reads against the page via color contrast, so the rim doubled as an unwanted border; dark mode keeps the full rim since it's the only visible lift cue there.

**Edge & overlay tokens (2026-06-15)** — `--border-inverse` (`rgba(255,255,255,0.1)`, same in both themes) was the hairline on always-dark / inverse surfaces (the footer slab); **待採用** since Footer retired on 2026-08-03 — defined but no longer referenced. `--overlay-tint` (`rgba(0,0,0,0.45)`) is the darkening mixed into modal backdrops (`.payout-modal`, paired with `--overlay-blur`).

**壓在圖片上的字（2026-08-31）** — `--scrim-media`（`rgba(0,0,0,0.82)`）、`--on-media`（`#FFFFFF`）、`--on-media-muted`（`rgba(255,255,255,0.66)`）。這三支是**常數 token，不隨主題翻轉**：它們貼在照片上，而照片不會因為使用者切成亮色主題就變亮——文字色若接上 `--foreground`，亮色主題下就會變成白圖上的淺灰字。壓底的工作是保證圖片再亮也讀得到上面那行字。目前消費端：`canvas-wall.css` 的海報牆磚（`.canvas-tile__cap` / `__name` / `__kind`）與釘點的墨色。

**Raw-color exceptions (acknowledged WARN)** — `check_ds_sync` flags bare colors in three components, all intentional fixed artwork:
- `upload-tile.css` video letterbox (`.upload-tile__video { background: #000 }`) — **irreducible**: media playback matte is pure black regardless of light/dark theme (standard video letterbox), same rationale as an embedded image; not a themeable surface.
- `design-components.html`（2026-09-16 起，機器生成）— **irreducible（繼承）**：這一頁由 `scripts/gen_design_gallery.py` 從本頁（`design-system.html`）Pillar 4 逐字抽出渲染區，卡內 inline `style` 的裸值（主題色票 `#000000`／`#999`、品牌漸層 `#1b1b1b→#ffa33f` 等示範資料）全部來自規格全文的 demo markup，同一份內容；規格全文不受檢查 10 管轄，圖鑑作為它的投影也比照。要減少只能改規格全文的 demo，改了重跑腳本即同步。基準記 11（2026-09-16），只准降不准升。
- `design-layers.html`（2026-09-16 起）— 已無裸值：2026-08-11 的提案頁曾有 18 處作用域內的提案變數與固定亮色預覽，2026-09-16 依 Q61～Q64 定案改寫成只吃正式 `--layer-*` token 與正式元件的示範頁，那批例外全數消失（基準數字降為 0）。
- `progress-stepper.css` segmented track mask (`repeating-linear-gradient(90deg, #000 …, transparent …)`) — **irreducible**: the `#000` here is a *mask stop*, not a paint colour — a CSS mask only reads alpha, so any opaque value works and none of them reaches the screen; the visible colour still comes from the track's own token. Swapping in a theme token would imply a colour decision that doesn't exist（2026-08-10 記錄，供 check_ds_sync 檢查 10 的基準對照）。
- `selection-card.css` theme-picker swatches (`--theme-light` / `--theme-dark` / `--theme-system`) — **irreducible**: each swatch must paint the *actual* literal theme colors (`#FAFAF7` / `#ffa33f` / `#191A1A`) so the preview shows what each mode looks like even when viewing a different mode; can't reference theme-reactive tokens.
- `vip-card.css` VIP-card template (`.vip-card__frame` holographic gradients + `.vip-card__plate`/`__logo`/`__plate-sub` white/rgba) — the membership-card face is a **fixed, theme-independent artwork** (a CSS approximation of the platform template); its colors deliberately do not follow light/dark tokens, same rationale as an embedded illustration/image. Real template asset TBD.
- ~~`fan-store.css` phone screen (`.fan-store__phone` scoped `--fst-*` dark neutrals + bezel/hero-gradient/fan-ring hexes)~~ **2026-09-11 退場**：預覽改成粉絲端創作者頁的 token 鏡像，`--fst-*` 整組刪除、檔內零裸色；下面這段保留為沿革。原文：`fan-store.css` phone screen (`.fan-store__phone` scoped `--fst-*` dark neutrals + bezel/hero-gradient/fan-ring hexes) — the See-as-fan phone renders the **fan app's fixed-dark surface** (theme-independent, same rationale as vip-card): the fan app is its own product with its own dark theme, so the phone must not flip with the creator-backoffice light/dark toggle. Brand accent stays `var(--primary)`; rank-ring colors (#A78BFA/#4ADE80/#2DD4BF/#86EFAC) are fixed decorative rank hues (2026-07-02).

All other former ad-hoc shadow/border colors were tokenized on 2026-06-15 (`--shadow-raise` / `--shadow-raise-strong` / `--border-inverse`（**待採用**，Footer 退場後無人引用）/ `--overlay-tint`).

**`--overlay-scrim`（2026-09-01 新增）** — 浮層遮罩本身，值是 `color-mix(in srgb, var(--background) 40%, var(--overlay-tint))`。使用者裁示「後面的遮罩不用這麼暗，統一將所有 popup 後的黑色遮罩都改」：配方原本在 `payout-modal.css`／`embed-modal.css`／`explainer.css` 三處各抄一份，三份一樣的字串遲早會有一份沒跟上，所以收成一支。同一次把畫布色的比重由 68% 降到 40%——真正把後面那一頁壓死的是這一項，不是 `--overlay-tint`（68% 的實色畫布疊上去，合成 alpha 0.85；只調亮遮罩色也只降到 0.83，降比重之後是 0.68）。`--overlay-tint` 本身同時由 0.45／65% 調亮到 0.32／46%。**元件層的局部遮罩不吃這一支**（抽屜、掃描器、上傳格 hover、媒體庫）：它們蓋的是一個元件、不是整頁，仍單獨用 `--overlay-tint`。

**Page-scoped `[data-theme]` override exception（2026-07-23 已解除）** — `check_ds_sync` 檢查 8 原本標記 `e-shop.html` 的 `.eshop-list-topbar`（含 light-mode 覆寫留在頁內 `<style>`），當時的裁決是「全站唯一消費頁、沒有跨頁一致性風險，等第二個頁面要用同樣的樣式再抽共用元件」。2026-07-23 projects 整理頁頭時正好觸發那個條件，整組已 promote 成 [`list-toolbar.css`](./ds-components/list-toolbar.css)（`.list-toolbar` / `.list-toolbar__actions` / `.list-status-row`，見 Pillar 4 條目），light-mode 覆寫隨之進元件層，這條例外不再適用。

### 1.5b Raw-value exceptions — r2.2 新元件（2026-07-29 盤點）

外部協作者併入的 19 支新元件（Pillar 4 §4.92–§4.110）逐檔核對後，共 6 支＋ 1 支的字級用了裸值。判準沿用上方 §1.5 的既有原則：**疊在真實照片／素材縮圖上的黑色遮罩、陰影 rgba、`clamp()` 的排版級距**屬合理例外；**能用既有 token 表達的不算例外**，逐條記錄如下（檔名:行號 — 值 — 理由）：

- `brand-card.css:71` — `color: #fff` — `.brand-card__mark` monogram 文字色，疊在品牌自訂（使用者上傳、不可預期）的 logo 底色上，需要「永遠是白」而非跟主題翻轉；與 vip-card／fan-store 既有的「固定素材色不隨主題」判準同理，**判定：合理例外**。
- `chart-tip.css:65` — `box-shadow: 0 1px 5px rgba(0,0,0,.10), 0 6px 16px rgba(0,0,0,.08)` — 折線圖浮層陰影，屬固定投影而非疊圖遮罩，未走 `--shadow-*` token；**判定：合理例外（陰影 rgba），但建議下次治理輪收斂成 `--shadow-float` 家族**，非阻斷。
- `checkbox.css:118`／`checkbox.css:131` — `--zcheck-ink: #271302`（第 131 行為同值 fallback）— 勾號墨色，品牌橘在深淺兩個主題都偏亮，勾號必須「不隨主題翻轉」；現有 token 沒有一支「深色不隨主題翻轉的墨色」（`--brand-ink` 解的是反方向問題：橘色字不隨主題翻轉），**判定：合理例外，且目前無等價 token 可替代**（若要收斂需新增 token，屬 CSS 層改動，非本輪範圍）。
- ~~`detail-sheet.css:34` — `background: color-mix(in srgb, #000 52%, transparent)` — 覆蓋層遮罩底色~~ **已於 2026-08-31 殼層換裝收斂為 `--sheet-veil`（`color-mix(in srgb, var(--ztu-canvas) 60%, transparent)`），不再是裸值。** 原判定留存：**非乾淨例外，建議收斂**——站上已有 `--overlay-tint`（`rgba(0,0,0,0.45)`，見 §1.5 Edge & overlay tokens）承擔同一種「modal/覆蓋層遮罩」角色，本檔用 52% 而非既有 `--overlay-tint` 的 45%，屬可以但尚未對齊既有 token 的裸值漂移，非「無法用 token 表達」的那一類。
- ~~`detail-sheet.css:47` — `box-shadow: var(--shadow-overlay, 0 -8px 40px rgba(0,0,0,.45))`~~ **已於 2026-08-31 殼層換裝改為 `var(--ztu-shadow-card)`＋內光，fallback 字面量一併消失。** 原判定留存：主路徑已引用 `--shadow-overlay`，fallback 非實際生效值；**不計入裸值，優先度最低**。
- `media-vault.css:604,607,660,661` — `color-mix(in srgb, #000 62%/76%, transparent)` ／ `color: #fff`（時長晶片與縮圖底部名稱漸層，共 4 處）— 全部疊在真實影音縮圖上，需要釘選黑底白字不隨主題翻轉；**判定：合理例外**，是本批「疊在真實照片上的黑色遮罩」判準的典型案例。
- ~~`sticky-actions.css:31` — `box-shadow: 0 -6px 16px rgba(0, 0, 0, 0.08)`~~ — **已於 2026-08-28 ztorUI 換裝 Wave 2b 收斂**：改引用新增的 `--ztu-shadow-pop-up` token（見 §1.1b），這筆裸值例外已不存在，check_ds_sync 檢查 5 的存量計數同步下修（46→45）。
- `fans-guide.css:57,150` — `font-size: clamp(2.4rem, 6vw, 4.2rem)` ／ `clamp(1.4rem, 2.6vw, 2rem)` — 兩處大標字級，`ch` 單位在 CJK 下量測失真，改用 script-neutral 的 rem 級距；**判定：合理例外（`clamp()` 排版級距）**。

外部改版以外另有五支保留裸值（2026-11-07 盤點）：

- `fan-shop.css` — 前台活動頁鏡像，token 與色值逐字取自前台，不屬本 design system，改成本站 token 會與前台分岔。
- `vip-card.css` — 會員卡固定深色卡面，亮暗主題都不變。
- `selection-card.css` — 主題選擇的亮／暗／系統色票，色值就是資料。
- `progress-stepper.css` — mask 用的 `#000` 只決定遮罩透明度，不會顯示成顏色。
- `live-item.css` — `var(--ztu-canvas, #000)` 的 fallback，token 存在時不生效。

外部改版同時動到兩支**既有**元件（不在 19 支新元件之列），其棘輪基準也一併調高，理由記於此：

- `button.css:103` — `background: color-mix(in srgb, var(--destructive) 86%, #000)` — destructive 按鈕的 hover 壓深。`--primary` 有專屬的 `--primary-hover`，`--destructive` 沒有對應 token，只能就地用 `#000` 混色壓深；同手法在站上已重複出現多次。**判定：例外，但屬設計系統缺口**——建議下一輪治理新增 `--destructive-hover`（**尚未定義、待採用**），把這幾處一起收斂。
- `list-toolbar.css:270,274` — `box-shadow: 0 6px 20px -10px rgb(0 0 0 / 0.5)`（深色主題）／ `-12px rgb(0 0 0 / 0.28)`（淺色主題）— 新增的 Snap dock 浮起陰影，兩個主題各一組。與 chart-tip、sticky-actions 同類：投影而非疊圖遮罩，未走 `--shadow-*` token；**判定：合理例外（陰影 rgba）**，排入未來 `--shadow-*` 收斂候選。

**小結**：19 支中判定為「無法用既有 token 表達、應保留」的例外原共 6 處（brand-card、checkbox、media-vault ×4、fans-guide ×2、sticky-actions、chart-tip）；**sticky-actions 已於 2026-08-28 ztorUI 換裝收斂進 `--ztu-shadow-pop-up`，現餘 5 處**；`detail-sheet.css:34` 判定為**應收斂**、非合理例外——**已於 2026-08-31 殼層換裝時一併收斂（見 §4.97）**。棘輪基準 `ds-baseline.json` 是否要為上述合理例外調高對應檔案的允許值，由下游負責 CSS／baseline 的 agent 決定。

### 1.6 Motion

Durations sit in the `150–300ms` range with ease-out curves; `transition: all` is common on interactive elements. Entrance animations are gated behind `@media (prefers-reduced-motion: reduce)` and shown immediately when motion is reduced.

### 1.7 Iconography

**Tabler** icon set (`@tabler/icons` 3.45.0), registered in `icons.js` and injected per page via `ztorIcons.applyIcons()`. Thin 1.2px outlined glyphs as inline SVG (no icon font). Any new icon must be added to the registry before use.

**品牌標記是唯一例外（2026-08-04）** — `brand-apple`／`brand-google`／`brand-facebook`／`brand-line` 取自 **Simple Icons（CC0）** 而非 Tabler：各家商標規範綁死了標記的形狀，Tabler 的重畫版對不上。同樣是 24×24 網格，路徑帶 `fill="currentColor" stroke="none"`（與 `*-fill` 同一套做法），**單色**、由外層控件的 `color` 決定顏色——站上不引入任何品牌彩色值。消費者：`login.html` F1 的四張第三方登入卡（`.radio-cards--gate` 內的 `.radio-card__lead`）。

**實心字符只給特定情境，不是全站選項**：站上預設是描邊，`*-fill` 只存在於實心真的在做事的地方——儀表板告警卡（`alert-triangle-fill`／`info-fill`／`check-circle-fill`／`x-circle-fill`），以及 `login.html` F1 方式卡的 `mail-fill`／`smartphone-fill`（2026-08-04 新增，取自 Tabler `filled/mail` 與 `filled/device-mobile`，MIT）。登入頁那一格改實心是刻意的局部例外：同一個 2 欄 grid 裡另外四張是品牌標記，品牌標記沒有描邊版，六顆並排時混兩種風格會看起來像沒對齊。兩顆的 `<g>` 從中心放大 1.14 倍（原圖信封 20×16、手機 14×20，品牌標記多半滿版 24），讓六顆的光學大小接近。描邊的 `mail` 與 `smartphone` 路徑未動：`smartphone` 仍是 `settings.html` 登入裝置列在用，`mail` 由 `partials/artist-picker.js` 引用（該元件目前零頁面載入、屬退場候選）。裁決見 `STYLE-DECISIONS.md` Q51。

**自繪的第三顆例外：`archive-restore`（2026-09-22，D298）** — Tabler 沒有「從封存箱拿回來」的字符：`archive-off` 是斜線（讀成停用）、`restore` 是倒轉箭頭（讀成重做／還原）。做法是沿用 Tabler `archive` 的蓋子與箱身、只把提把換成往上的箭頭——同一顆箱子、東西往外走，與 Lucide 的 `archive-restore` 同義，跟旁邊的「封存」`archive` 一看就是一對。用在「解除封存」（已封存的販售管道回到已下架）：e-shop 已封存列的列操作、三個細節頁頁首的主要動作、§4.202 Archived gate 示範。

**自繪的第二顆例外：`check-bold`（2026-08-19）** — Tabler 沒有這個字符，是照使用者指定的圖案自繪的：粗體勾勾、兩段深淺（短撇 45%／長捺 100%，明度差＝筆順）。它不是狀態符號而是**「這裡有事要勾掉」**，所以刻意不長成驚嘆號或三角警示牌。用在儀表板告警通知條的左槽——嚴重度已經寫在標題裡（例：「提款已暫停」），再放一顆紅色警示符號是把同一件事講第二次，而深色介面上描邊的紅圈／紅三角一律讀成「一個框裡有東西」（實測退了三版才確定這條）。opacity 寫在各 path 上而不是分三個顏色，所以整組跟著 `currentColor` 走，中性與警示兩種情境共用同一支。

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

**App shell 檯面與星空背景（ztorUI 換裝，2026-08-28 熔接，Wave 1）** — sidebar 導覽模式下，`body` 底色改為 `--ztu-canvas`（`#0a0a09`，全站最深的檯面），玻璃化的 `.app` 外殼（見 §1.1b）以 `--ztu-shell-gutter`（14px）留白浮在檯面正中央，不再貼齊視窗邊。檯面疊三層裝飾，一律 CSS 繪製、不吃任何圖片素材：

- **兩團暖光**：檯面上兩個大範圍、低飽和的徑向漸層暈染（`--ztu-bloom-1` 系），只在 sidebar 模式生效，與外殼留白同一條規則寫在 `body` 上。
- **四層星空**：四組 `radial-gradient` 疊圖磚（620／680／740／810px 四種尺寸，各自的位置與 alpha 值），各自掛一組 `@keyframes ztu-star-a` ~ `-d`（7／11／9／13 秒，負延遲 0／−3／−5／−8 秒錯開），只動 `opacity`（合成器動畫、不佔用主執行緒），`position: fixed` 鋪滿全螢幕、`z-index: -1` 墊在最底。`prefers-reduced-motion: reduce` 時凍結在 `opacity: 0.85`，不播放呼吸動畫。
- **精靈頁靜態點陣**：`.wizard`／`.wizard__sheet--sectioned` 用固定 22px 格距的點陣背景（非動態），與四層星空是不同機制、不疊在一起。

**列表頁漸消**：帶 `.list-dock` 的頁面（列表型頁面），四層星空一起套 `mask`，由 36% 高度處開始往下線性淡出到 90% 完全透明——星空只在頁面上段可見，避免與下方密集的表格內容互相干擾閱讀。

**與換裝前的差異**：換裝前 app shell 檯面／sidebar 模式外殼是實色面板（`--surface-shell`／`--surface-page` 語義 token 的純色），沒有星空或暖光裝飾層；玻璃化與星空背景都是本波新增的視覺語彙，只在 `html[data-nav-mode="sidebar"]` 下生效，`topbar` 導覽模式的外殼另有獨立處理（見 §3.2）。

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
| **Input surface** (填色互動面) | `--input-surface` | `var(--card)`（dark `#2A2B2D`，2026-07-26 由 `#262729` 定案調整）| 暗色下比 `--card` 亮一階的「填色互動面」：`.input/.textarea/.select`（2026-07-17 Q19）＋型別選項卡 `.selection-card--icon`＋上傳投放區 `.upload-tile`（2026-07-18）皆用，讓這些互動面在 section 卡（`--card`）上浮得出來；亮色＝白卡靠 border 分界 |
| **Chip surface** (chip 未選填色) | `--chip-surface` | `color-mix(in srgb, var(--foreground) 6%, var(--card))`（dark `var(--ztu-film)`）| 2026-10-15 Q76 裁決 B：未選 `.chip` 的底。淺色的 `--input-surface`／`--ztu-film` 都與 `--card` 同色，chip 會融進卡面，給它一個比卡深一階的專用值；暗色沿用薄膜、外觀不變。淺色模式目前關閉（Q135） |
| **Nest surface** (巢狀層薄膜) | `--nest-surface` | `transparent`（dark `rgba(222,223,233,.04)`）| 疊在 `--card` 上的第二層 surface（`.nest`，§4.53）。亮色＝透明，卡與 nest 同為白、單靠 `--shadow-nest-up` 分層就夠；深色才真的疊一層冷調薄膜（合成 ≈ `#292A2B`，刻意不用純白以免洗掉畫布冷調）。層級只有兩層填色，L3+ 改邊框 |
| **Tier ramp**（分層色階） | `--tier-1..4` | 外 `#7a4a12` · `#c07a1e` · `#f0a83c` · 內 `#ffd9a0` | 2026-09-01 新增（調參器 `docs/chart-palette-tuner.html` 定案）。給**有順序、層層包含**的資料，目前唯一消費者是粉絲分層（一般粉絲 ⊇ 上榜粉絲 ⊇ 超級粉絲 ⊇ 核心圈；英文 Fan ⊇ Ranked Fans ⊇ Super Fans ⊇ Inner Circle，`js/components.js` 的 `TIER_COLORS`）。**與分類色的分工**：分類色是「幾個彼此獨立的類別」，挑色準則是兩兩拉開、沒有誰比較深；分層要的正好相反——同一個色相走深淺，深淺本身就是「第幾層」。用分類色畫分層，四層會讀成四群不相干的人。由外層（人最多）到內層（人最少、最重要）愈來愈亮。⚠ 四個值是在暗色上調的，`:root` 那一份兩個主題共用，亮色主題需要另外調一份覆寫（未做）。 |
| **Charts** | `--chart-1..8` | 橘 `#ffa33f` · 藍 `#266DF0` · 綠 `#22C55E` · 黃 `#F8D749` · 紫 `#8B5CF6` · 玫紅 `#EC4899` · 青 `#06B6D4` · 赭 `#7C4A2D` | 收益類型與排行色相；6–7 於 2026-07-27 隨商品／門票收益加入，8 於 2026-08-09 隨貼文帶貨收益加入（D181）。**2026-09-01 曾換成偏暖的一組、同日改回**（使用者裁示「分類色還是換回原本的」）：那一輪換的是兩件事——新增 `--tier-*`（保留）與重調分類色（撤回）。色階解掉的是「用分類色畫層層包含的資料」這個病，分類色本身沒有那個問題。撤回的那組（橘 `#ffa33f` · 赭紅 `#e0713f` · 芥黃 `#c9a227` · 苔綠 `#7fb069` · 鴨藍 `#5f9ea0` · 藕紫 `#8f7bb5` · 玫粉 `#c47ba0` · 玫褐 `#a8836a`）留在調參器 `docs/chart-palette-tuner.html` 裡，要再試隨時叫得回來。**這一組只負責彼此獨立的類別**，有順序的資料走上一列的 `--tier-*`。 |
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

**垂直節奏法（2026-09-01 立法，Q103）——直排兄弟之間的距離由「容器」持有，不由兄弟自己想辦法**：

- **建立節奏用容器 `gap`**（flex column／grid 的 `gap`），不用 `.x + .x { margin-top }` 相鄰選擇器、也不用「每個成員自帶 margin-bottom」。這兩種寫法的病是一樣的：距離綁在「成員是誰」上，**排進來一個異類鄰居就貼成 0**——實例三發：media-vault 的上傳格不是 `.vault-group`，與第一個分區貼死（2026-09-01 使用者回報）；form-section 的 radio-cards 不是 `.field`，身上沒有 `.field` 自帶的留白（2026-08-10，當時只補了那一處）；同日在區段裡的 `.form-grid` 也是同型風險。
- **相鄰選擇器只准用來「收緊」**：`margin-top: 0`／負值／貼齊配對（label＋hint 這種語意上是一組的），不准用來創造節奏。判別法：把兩個鄰居中的任何一個換成別種元件，距離還該存在嗎？該存在→那是容器的事。
- 既有的同類相鄰規則（`.stat + .stat`、`.rule + .rule` 等）列存量觀察，check_ds_sync 檢查 13 以 WARN 盤點；新增會讓數字上升，先想容器 gap。

**相鄰 margin 的存量例外（2026-11-07）**：垂直節奏預設由容器 `gap` 持有（Q103），下面三處保留相鄰選擇器：

- `.product-list__line + .product-list__line`：容器 `.product-list__items` 用 `-webkit-box` 做行數截斷，`gap` 在這種容器不生效。
- `.scanner-access__field + .scanner-access__field`：`design-system.html` 的 demo 仍是舊 markup，容器改 `gap` 會改變 demo 間距，等 demo 換新再收。
- `.rule + .rule`：同一組規則同時出現在 `create-event-legacy.html` 與 `js/ticket-bundle.js`，兩處容器不同，等舊頁退場再收。

### 2.4 Control sizes

按鈕與表單控件共用一套高度級（全部 4 的倍數），同尺寸的 input 與 button 對齊。高度一律走 `--control-h-*`，不寫死。

**2026-07-21（Q25）**：站上單行控件實際預設是 **`--control-h-sm`(36)**，不是刻度層標為 default 的 md(44)。此前 `.input` 靠 padding 撐開＝39px、`.btn` 是 36px，「同尺寸等高」只是文件宣稱；各元件各自調 padding 還長出 41.5／37.5／35.5 三種對不齊的搜尋框（盤點見 [docs/input高度盤點-2026-07-21.md](./docs/input高度盤點-2026-07-21.md)）。裁決後單行控件一律 `height: var(--control-h-sm)`，**新增控件禁止用 padding 湊高度**——`padding×2 + font-size×line-height` 幾乎必然算出小數。`.textarea` 例外（多行靠 padding ＋ `min-height:100px`）。

| Token | Height | Use |
|---|---|---|
| `--control-h-xs` | 32px | 表格密集列（`.variant-table .input`）／`.btn--sm`／compact toolbar。2026-09-11 由 28 調到 32（使用者：小控件要再高一點點、從 token 一次調），與 `.btn--icon.btn--xs` 的 32 邊長對齊 |
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
| E3 懸浮 | `--shadow-float` | Dropdowns, popovers, tooltips, dragged rows; `--shadow-card-hover` aliases here（2026-10-20 起可點卡片 hover 不再用它，改為上浮＋底色，見 5.3；此別名目前僅 `.brand-card` 與 fan 端鏡像仍引用） |
| E4 覆蓋 | `--shadow-overlay` | Modals, dialogs, drawers (above the scrim) |

Content surfaces top out at E2. Edge utilities（`--shadow-micro` / `--shadow-seam` / `--shadow-header`）屬方向性分隔手法、不在階梯內。Hero is the only deeply-shadowed surface and it does it via gradient overlay, not box-shadow.

### 2.5a Surface layers（表面階層 `--layer-*`，Q61 A／Q63 B，2026-09-15）

E0–E4 管「抬多高」（陰影），`--layer-*` 管「疊上去該多亮」（填色與線）——兩條正交的軸，同一個元件各取一階。級數寫在 token 名字裡，看名字就知道這塊面是第幾層。全部是 Role 別名、指向既有 Foundation，不帶新顏色、不另設暗色覆寫（亮暗跟著被指向的那支走）。模型出自 §6.0.1／Figma `856:27798`。

| 階 | Token | 指向 | 用在 |
|---|---|---|---|
| L0 檯面 | `--layer-0-surface` | `--ztu-canvas` | body 星空底（`shared.css` body，Q64 第一批已遷） |
| L1 卡片 | `--layer-1-surface` | `--ztu-glass-bg` | 玻璃卡本體：`.card`／`.ztor-card`／`.kpi`／`.form-section--outlined`／`.preview-card` 等 29 支（Q64 第一批已遷）。頂欄、側欄、hover 浮起、按鈕 hover 仍直接吃 `--ztu-glass-bg`——那是材質，不是層 |
| L2 薄膜 | `--layer-2-surface` | `--ztu-film` | `.nest`／`.card--muted`／`.kpi.card--muted`，以及 Q66 落地的 15 支分組面（`.funding-panel`、`.payout-bank-*`、`.scanner-access`、`.review-status`、`.ss-status`、`.msg-schedule`、`.bd-sec`…；Q64 第二批已遷，濃度由 4% 統一到 8.5%） |
| L2 邊 | `--layer-2-line` | `--nest-line` | L2 上緣髮絲線，亮色可見、暗色歸零（已採用） |
| L3 線框 | `--layer-3-surface` | `transparent` | 第三層起不再疊填色（待採用：L3 用例都只寫線、不寫底，這支目前無消費者） |
| L3 線 | `--layer-line` | `--border` | L3 的 1px 框：`.bd-pick`／`.bd-tbl`／`.variant-option`／`.control-group`／`.control-row`／`.album-tracks__list`／`.rowdis__frame` 等 9 支（Q64 第一批已遷）；Q63 選 B＝現行線色收進系統、不覆議亮度 |

規則不變：疊上去要比父層亮（Q66）、填色只疊兩層（Q24）、浮層玻璃＋模糊（Q78，2026-10-27 修訂）、玻璃裡不套玻璃（Q108）。Q64 遷移（2026-09-15）後 `--nest-surface`（4%）在產品 CSS 已無消費者（只剩 `design-layers.html` 對照組與本文件色票），L2 只剩 8.5% 一種濃度；`--nest-surface` 保留為退役中的 token，新寫法一律 `--layer-2-surface`。清單「不確定」的 9 支（`canvas-stage`／`fan-store`／`detail-sheet`／`preview-column` 的 `--ztu-canvas` 效果用法、`list-toolbar`／`.detail-bar` 的黏頂玻璃、`.lockset`／`.scanner-count` 的線框）判定為材質或效果、不屬層級系統，維持原 token。逐支清單：`docs/Q64-表面階層遷移清單-2026-09-15.md`。

### 2.6 Cross-component rules

Principles every component obeys (not a token scale; html 版各附 live 示例):

- **Focus**：全控件、兩模式單一配方 — `outline: 2px solid var(--ring); outline-offset: 2px`（清單列用 `-2px` 內嵌）。不再各元件 `outline`／`box-shadow` 各寫各的。
- **Surface-layer contrast**：元件靠「填色／邊框／陰影跟所在那層的對比」被看見，**填色和背景同色就會消失**。白填要靠 1px 邊框在白底成形；跨層安全用實線 border，別用填色當邊或純陰影當邊。做任何有填色的元件，在**最深**那層目視驗證（按鈕白/灰底實例見 §4.2）。
- **卡內表格與清單的表面（2026-09-11 立為機器檢查）**：表頭用薄膜 `--ztu-film`、列一律透明、靠 hairline 分隔——不用 `--muted`／`--card` 這類**實色表面**（Q24／Q71 的 L2 語彙：L1 卡是玻璃，實色疊上去是一塊不透明補丁）。同一種錯 09-09（逐選項組合表）與 09-11（庫存歷史紀錄）各被抓到一次，改由 `check_ds_sync` 檢查 14 以棘輪擋新的：元件 CSS 裡 `__head`／`__row`／`__group`／`th`／`tr` 這類選擇器的 background 不得新增實色表面 token；存量 7 處（列選態、凹槽等非表格用法：artist-picker、embed-modal、link-field、pickup、table 的展開列）留基準逐步清。
- **用了元件就要連它的 CSS（2026-09-11 立為機器檢查）**：元件 CSS 是逐頁 `<link>` 的，頁面用了某支元件的 class（含 `--` 變體）卻沒連那支 CSS，樣式會靜默失效——看起來只是「間距不見了」（product-detail 的 `.stack--tight` 沒連 `stack.css`、series-detail 的 `.stat-row` 沒連 `stat-row.css`，兩次都被使用者先看到）。`check_ds_sync` 檢查 15 掃頁面靜態 HTML 的 class 對照唯一擁有它的元件 CSS，漏連即 FAIL；JS 動態產生的 markup 掃不到，寫 partial 時自己確認。
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
| `--card` | `#FFFFFF` | `#212223` | 浮在 content 上的卡；2026-06-25 改實色（原 rgba .10 疊層）；2026-07-17 midnight-v2（原 `#303131`）。**token 本身的值未變**，但 2026-08-28 ztorUI 換裝後 `.card`／`.kpi`／`.alert--bar`／`.readiness`／`.preview-card` 等玻璃卡家族改直接引用 `--ztu-glass-bg`，不再把 `var(--card)` 畫成自己的底色（見 §1.1b、§3.2）；`--card` 仍是彈出層 `--popover` 等其他角色的來源值 |
| `--muted` | `#FAFAFA` | `#161718` | 嵌套襯底、比卡深比 content 亮一階；2026-06-25 改實色（原 rgba .06）；2026-07-17 midnight-v2（原 `#272828`） |
| `--surface-inverse` | `#000000` | `#000000` | footer slab。Dark 純黑（content 為 `#0C0D0D`，footer 要更深才讀為分隔） |
| `--surface-page` | `#FAFAFA` | `#0C0D0D` | route page＝content 底、**最深**。Light 於 2026-07-14 降低明度；**Dark（2026-07-17 midnight-v2）**：維持 r2.1 原制的層次語意——content 最深、比較淺的外殼(`--surface-shell`)包住、圓角內凹；整體比原 r2.1 壓暗（原 content `#191A1A`）。（註：midnight-v1 一度反轉成殼最深/content 較亮且兩者相近，經使用者回饋改回。） |
| `--surface-preview` | `#0A0A0A` | `#0A0A0A` | 前台預覽的畫布＝粉絲前台頁底色（`fan-shop.css` `.fep-shop` 的 `--neutral-900`），前台永遠是深色、兩主題同值。消費：預覽與發布全頁畫面（`.wizard__body--stage` 所在的 `.wizard`／`.wizard__sheet`，2026-09-23）|
| `--surface-shell` | `#F0F0EE` | `#1C1D1E` | sidebar-mode app shell（rail＋canvas），**明顯亮於 content、與其拉開**（內凹視覺）。Light 於 2026-07-14 再降一階；Dark 於 2026-07-17 midnight-v2 壓暗（原 `#2B2B2C`），Mobbin Whop/Posh 參照 |
| `--sidebar` | `#FBFBFB` | `#1C1D1E` | sidebar rail 與 shell canvas 同色（flush）＝外殼色；項目區分靠 hover/active 疊色（2026-07-17 midnight-v2 壓暗，原 `#2B2B2C`） |
| `--foreground` | `#1A1A1A` | `#FDFDFD` | 2026-07-13 light 改 off-black（原 `#000000`） |
| `--foreground-muted` | `#4D4D4D` | `#B9B9B9` | 中階文字；2026-06-25 改實色（原 rgba .7 疊層） |
| `--muted-foreground` | `#6E6E68` | `#979797` | 2026-07-13 light 微暖（原 `#737373`）；dark 2026-06-25 改實色（原 rgba .4），2026-07-28 全站 43 頁 WCAG 掃描再提亮（原 `#757575` 在 4 個面上全部不到 AA） |
| `--primary` | `#ffa33f` | `#ffa33f` | **orange stays** — paired across modes for brand consistency |
| `--border` | `#EAEAEA` | `#373839` | hairline（= `--input`）· 2026-07-13 light 更淡（原 `#E5E5E5`）；dark 2026-06-25 實色化、2026-07-17 midnight-v2（原 `#3A3A3C`）→ 2026-07-21 Q22 提亮至 `#333435`（原 `#2C2D2E`）→ 2026-07-26 再提亮一階定案 `#373839`（`--input-surface` 調亮後對比不夠，3 階候選選 B） |
| `--ring` | `#ffa33f` | `#ffa33f` | 亮暗同色：dark 於 2026-06-25 起不再覆寫成白、改繼承品牌橘 |
| `--status-success` | `#22C55E` | `#4ADE80` | pure-RGB green for dark（2026-07-13 體檢提亮，原 `#00A63E`） |
| `--destructive` | `#DA314A` | `#E7000B` | pure-RGB red for dark；破壞性操作（刪除鈕等），不用於狀態徽章 |
| `--status-error` | `#DA314A` | `#FF3D47` | 2026-07-21 新增：狀態徽章專用紅，暗色比 `--destructive` 亮（對齊 Figma 845:11071，深底小字徽章的 `#E7000B` 太深不易讀） |
| `--status-info` | `#266DF0` | `#5896F3` | lighter blue for dark contrast |
| `--status-warning` | `#F8D749` | `#F3CF58` | slightly cooler yellow |
| `--shadow-card` | rim + drop on white | drop only on dark | white hairline rim inverted |
| `--shadow-float` / `--shadow-overlay` | soft dark drop | stronger alpha (0.5 / 0.6) + white rim (0.10 / 0.12) | 深底陰影失效，提高濃度＋亮框補輪廓 |

### 3.2 Translucent surface pitfall

> **2026-10-27 再反轉（使用者裁示，Q78 修訂）：浮層改回半透明玻璃＋背景模糊，全站同一個配方。** 底＝`--float-glass`（`--popover` 的 72%）、模糊＝`--float-blur`（＝`--ztu-blur-glass`，24px），兩個 token 定義在 `_tokens.css`。套用範圍：`.dropdown__menu`、`.zselect__panel`、`.combobox__menu`、`.app-topbar__dropdown`、`.app-sidebar__lang-panel`、`.preview-panel__sheet`、`.owner-lookup__results`、`.src-status__panel`、`.readiness__pop .readiness`、`.vault-rulemenu`、`.list-dock` 貼頂篩選浮層、`.stock-tip__pop`、`.chart-tip`／`.fin-tip`（提示框）；彈窗 `.payout-dialog` 本來就是 72%（2026-09-01），改吃同一個 `--float-glass`，**不掛** `backdrop-filter`（遮罩 `.payout-modal` 已帶模糊、是背景根）。下面「Wave 2a 起」那段與 Q78「浮層一律不透明」的敘述已被取代，留著當歷史；**模糊是這個配方成立的條件**——沒有模糊的半透明浮層會讓底下的字原樣浮上來（Q78 當初擔心的看穿兩層玻璃），有模糊透過來的只是糊掉的色塊。釘在底的動作列（`.sticky-actions`／`.ss-actionbar`）不是浮層，沒動。

> **ztorUI 換裝反轉了本節的結論（2026-08-28，Wave 2a §3.6）**：換裝前的規則是「浮層一律吃毛玻璃」；換裝後的規則正好相反——**內容卡片改玻璃、彈出層改實色**。以下先記錄現況，換裝前的舊規則留在小節末尾備查。

**現況（Wave 2a 起）**：`.card`／`.kpi`／`.alert--bar`／`.readiness`／`.preview-card`／`.form-section--outlined`／`.list-toolbar`／`.app-topbar` 等內容表面改用 `--ztu-glass-bg` 半透明玻璃（見 §1.1b）；**2026-09-01 補漏十四處**（使用者回報「還是有一些頁面沒套用新的 DS」）——`.project-list__row:hover`、`.vault-reach`／`.vault-door`／`.vault-gridwrap`／`.vault-tracks`／`.vault-ovcard`、`.vault-keys`、`.notif-matrix`、`.funding-panel--card`、`.event-preview-card`、`.tabs--card`、`.selection-card`（含 `.x--active`）、`.fg-demo`、`.ss-fan__card` 當時沒跟上，還停在實色 `--card`，於是同一種卡在不同模組是兩種材質。**留著沒動的是刻意的**：彈出層（`.vault-gate__panel`／`.vault-ovcard` 以外的浮層、`.dropdown__menu` 那一批）依本節規則本來就不透明；巢狀在卡裡的小塊與控件（`.vkey`／`.vshare__opt`／`.fg-perk`／`.ss-url`／`.qr-box`／`.pickup-select__box` 等）不是內容卡，玻璃疊玻璃正是本節要避免的；`.ss-actionbar`（釘在底的動作列）改玻璃會讓底下的內容透上來壓到按鈕，屬待裁決。但**彈出層一律退回全不透明的 `--popover`，不做玻璃**——`.dropdown__menu`、`.zselect__panel`、`.preview-panel__sheet`、`.payout-dialog`、`.app-topbar__dropdown` 這批「浮在別的東西之上」的層級改成 `background: var(--popover)` ＋ `backdrop-filter: none` ＋ `border: 1px solid var(--ztu-glass-rim)`。理由：卡片已經是玻璃，浮層再疊一層透明就是「看穿兩張玻璃」，讀不出前後層次；讓浮層不透明才能穩定地蓋住底下的玻璃卡與星空背景。`_tokens.css:938–953` 原本「集中把 `backdrop-filter` 套進每個浮層」的治理段整段移除（只留說明註解）；`.overlay-surface` 這個掛牌 class 全站零消費，移除後沒有孤兒。`--overlay-blur` 這支 token 仍保留定義，但不再被上述四個浮層引用。

**例外**：`.readiness__pop .readiness`（懸浮版備齊度卡）與 `.preview-panel__backdrop`（遮罩層，半透明＋blur）維持浮層材質——前者是「浮層裡的內容仍是內容」，後者是遮罩本來就該半透明。

**換裝前的舊規則（2026-06-12 起，已由上述現況取代）** — Because `--card` was translucent in dark mode, any panel that floats **on top of content** (dropdown menus, slide-over panels, modals) bled the content behind it unless it frosted that background. This was governed in one place via the `--overlay-blur` token (`blur(14px) saturate(140%)`) plus a centralized rule in `_tokens.css` that applied `backdrop-filter` to every floating surface together. New floating layers only needed the `.overlay-surface` class to opt in. **This centralized rule and the `.overlay-surface` opt-in no longer exist as of 2026-08-28** — see 現況 above.

### 3.3 High-contrast mode

Not implemented. Browser-level forced-colors will fall through to defaults; semantic role names degrade gracefully (no hex-only hacks).

---

## Pillar 4 · Component

> **Renamed from §2 Components.** Components reference Pillar 2 Role tokens (not raw Pillar 1 palette). Importable base components live in [`ds-components/{name}.css`](./ds-components/). Product-owned components that are reused but not yet split into standalone CSS are explicitly registered as `shared.css` owned.

**元件規格一支一檔，放在 [`ds-specs/`](./ds-specs/)**（2026-11-07 從本檔拆出，內容逐字搬移）。本檔只留分類、總表與索引；改元件時讀該元件的規格檔就好。

- `§4.x` 引用對應 `ds-specs/4.x-*.md`。
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
| [Button](./ds-specs/4.2-button.md) | 🟢 atom | ✓ App | 主要行動、步驟列與頁首動作用的按鈕，有 primary、outline、ghost 等樣式 | [button.css](./ds-components/button.css) |
| [Badge / Status pill](./ds-specs/4.3-badge-status-pill.md) | 🟢 atom | ✓ App | 儀表板、收入與撥款頁的狀態徽章和分類標籤，有橘、綠、紅、藍等語意色 | [badge.css](./ds-components/badge.css) |
| [Status dot](./ds-specs/4.4-status-dot.md) | 🟢 atom | ✓ App | Dashboard status / source dots | [badge.css](./ds-components/badge.css) |
| [Chip](./ds-specs/4.5-chip.md) | 🟢 atom | ✓ App | Earnings transactions filter, Tax year filter, supported regions | [chip.css](./ds-components/chip.css) |
| [Switch](./ds-specs/4.6-switch.md) | 🟢 atom | ✓ App | 設定頁通知、商店顯示、自動撥款等二選一開關的切換控件 | [switch.css](./ds-components/switch.css) |
| [Info banner](./ds-specs/4.7-info-banner.md) | 🟢 atom | ✓ App | Contextual explanations (timing, region note, legal hint) | [info-banner.css](./ds-components/info-banner.css) |
| [Upload tile](./ds-specs/4.7b-upload-tile.md) | 🟢 atom | ✓ App | Create-flow upload slots（hero／thumbs／file drop，Add new item） | [upload-tile.css](./ds-components/upload-tile.css) |
| [Bundle editor](./ds-specs/bundle-editor.md) | 🟠 molecule | ✓ Project | 建立組合包時的編輯區，含商品挑選、庫存開關與販售設定 |  |
| [Album tracks](./ds-specs/album-tracks.md) | 🟠 organism | ✓ App | 數位音樂專輯的多曲目管理，可上傳、拖曳排序、改名與換封面 | [album-tracks.css](./ds-components/album-tracks.css) |
| [VIP card](./ds-specs/vip-card.md) | 🟠 organism | ✓ App | 數位會員卡的卡面自訂區，左邊設定名稱與圖像，右邊即時預覽 | [vip-card.css](./ds-components/vip-card.css) |
| [Input](./ds-specs/4.8-input.md) | 🟢 atom | ✓ App | Wizard fields, settings forms, search | [input.css](./ds-components/input.css) |
| [Icon](./ds-specs/4.9-icon.md) | 🟢 atom | ✓ App | 全站按鈕、導覽、提示與資料列共用的圖示集（Tabler） | [icon.css](./ds-components/icon.css) · [icons.js](./js/icons.js) · [icons-all.js](./js/icons-all.js) |
| [NavigationMenu](./ds-specs/4.10-navigationmenu.md) | 🟡 molecule | ✓ App | 頂部導覽的選單項目與下拉選單，側欄模式下展開成群組 | [header.css](./ds-components/header.css) |
| [Card group](./ds-specs/card-group.md) | 🔵 atom | ✓ App | 卡片內的資訊分組，用次級標題或分隔線區分不同組內容 | [card-group.css](./ds-components/card-group.css) |
| [Card](./ds-specs/4.11-card.md) | 🟡 molecule | ✓ App | Section wrappers w/ head row across all product pages | [card.css](./ds-components/card.css) |
| [KPI](./ds-specs/4.12-kpi.md) | 🟡 molecule | ✓ App | 儀表板與收入頁的關鍵指標卡，以大字顯示單一數字 | — |
| [Admin IP Bank table](./ds-specs/admin-ip-bank-table.md) | 🟠 organism | ✓ SiteSpecific | Admin IP Bank 與 Reporting 的 Film／Owner 分配表與報表篩選列 | [admin-ip-bank-table.css](./ds-components/admin-ip-bank-table.css) |
| [Alert](./ds-specs/4.13-alert.md) | 🟡 molecule | ✓ App | 儀表板提示面板、頁內警示與頁面公告共用的提示條 | [alert.css](./ds-components/alert.css) |
| [Accordion](./ds-specs/4.14-accordion.md) | 🟡 molecule | ✓ App | Collapsible sections (chevron-rotate, height transition) | [accordion.css](./ds-components/accordion.css) |
| [Tabs](./ds-specs/4.15-tabs.md) | 🟡 molecule | ✓ App | 頁面內切換檢視的分頁籤，用於收入、商品類型與專案狀態 | [tabs.css](./ds-components/tabs.css) |
| [Filter tabs](./ds-specs/filter-tabs.md) | 🟡 molecule | ✓ App | 主分頁下方的次級狀態篩選膠囊，附即時筆數 | [filter-tabs.css](./ds-components/filter-tabs.css) |
| [~~Cookie banner~~](./ds-specs/4.16-cookie-banner.md) | — | **已退場 2026-08-03** | 從未被任何產品頁消費（零消費連續被 check 11 標記），使用者裁示「沒用就刪」 | [cookie-banner.css](./ds-components/cookie-banner.css)（tombstone） |
| [Empty stub](./ds-specs/4.17-empty-stub.md) | 🟡 molecule | ✓ App | Routes not yet built (orange mark + display title + spec refs) | [empty-stub.css](./ds-components/empty-stub.css) |
| [Selection card](./ds-specs/4.18-selection-card.md) | 🟡 molecule | ✓ App | 嚮導選項卡與設定頁主題、顯示模式的單選卡片 | [selection-card.css](./ds-components/selection-card.css) |
| [~~Composer~~](./ds-specs/4.19-composer.md) | — | **已退場 2026-08-25** | 已退場：原為拖放輸入卡的展示元件，從未被任何頁面使用 | [composer.css](./ds-components/composer.css)（tombstone） |
| [Dropdown menu](./ds-specs/4.26-dropdown-menu.md) | 🟡 molecule | ✓ App | 點開後列出動作的下拉選單，觸發鈕可為主要按鈕或更多圖示鈕 | [dropdown-menu.css](./ds-components/dropdown-menu.css) |
| [Header (topbar)](./ds-specs/4.20-header.md) | 🟠 organism | ✓ App | 所有頁面共用的 64px 頂部導覽列，含下拉選單與動作群 | [header.css](./ds-components/header.css) |
| [Global nav · sidebar mode](./ds-specs/global-nav-sidebar-mode.md) | 🟠 organism | ✓ App | 取代頂部導覽的 248px 左側導覽列，下拉選單改為可展開群組 | [shared.css](./shared.css) · [sidebar.js](./js/sidebar.js) |
| [Admin-layer nav · Tier 0/1](./ds-specs/admin-layer-nav-tier-0-1.md) | 🟠 organism | ✓ App | 平台管理端的頂部導覽，標示創作者管理並鎖定第一層項目 | [shared.css](./shared.css) · [sidebar.js](./js/sidebar.js) |
| [~~Footer~~](./ds-specs/4.21-footer.md) | — | **已退場 2026-08-03** | 同上：7 個 class 零消費，`index.html`／`creators.html` 只掛了 `<link>`、沒有對應 markup | [footer.css](./ds-components/footer.css)（tombstone） |
| [Data list](./ds-specs/4.22-data-list.md) | 🟠 organism | ✓ App | 收入、交易、撥款與商品等清單用的資料列，一列一筆資料 | [data-list.css](./ds-components/data-list.css) |
| [~~Avatar stack~~](./ds-specs/avatar-stack.md) | — | **已退場 2026-08-25** | 已退場：原為重疊頭像堆疊，從未被任何頁面使用 | [avatar-stack.css](./ds-components/avatar-stack.css)（tombstone） |
| [Drawer](./ds-specs/drawer.md) | 🟠 organism | ✓ App | 從右側滑出的面板，用於不離開當前頁就查看詳情、歷史或說明 | [drawer.css](./ds-components/drawer.css) |
| [Pager](./ds-specs/pager.md) | 🟡 molecule | ✓ App | 清單底部的數字分頁器，放在表格下方切換頁數 | [pager.css](./ds-components/pager.css) |
| [Picker](./ds-specs/4.22b-picker.md) | 🟠 organism | ✓ App | Search + scrollable pick-list（Create bundle items、IP linker） | [picker.css](./ds-components/picker.css) |
| [Field pill](./ds-specs/4.22c-field-pill.md) | 🟡 molecule | ✓ App | Inline filter pill — search / select / dropdown-trigger | [field-pill.css](./ds-components/field-pill.css) |
| [Search (collapsible)](./ds-specs/search.md) | 🟡 molecule | ✓ App | 收合於工具列的搜尋：平常只見放大鏡、點擊滑開成 field-pill（重用 field-pill、不重造輸入） | [search-collapse.css](./ds-components/search-collapse.css) |
| [Search collapse](./ds-specs/search-collapse.md) | 🟡 molecule | ✓ App | 工具列上的收合式搜尋，平時只見放大鏡，點開後展開成輸入框 | [search-collapse.css](./ds-components/search-collapse.css) |
| [List toolbar](./ds-specs/4.90-list-toolbar.md) | 🟠 organism | ✓ App | 清單頁頭的工作列，左放主軸分頁、右放動作按鈕群 | [list-toolbar.css](./ds-components/list-toolbar.css) |
| [Segmented](./ds-specs/4.22d-segmented.md) | 🟡 molecule | ✓ App | 2/3-way text toggle | [segmented.css](./ds-components/segmented.css) |
| [Amount field](./ds-specs/amount-field.md) | 🟡 molecule | ✓ App | 附單位符號的金額輸入欄，單位可為固定符號或可切換的開關 | [amount-field.css](./ds-components/amount-field.css) |
| [Review row](./ds-specs/4.49-review-row.md) | 🟡 molecule | ✓ App | 流程 Review 步驟的摘要列，顯示欄位名、值與右側編輯連結 | [review-row.css](./ds-components/review-row.css) |
| [Preview card](./ds-specs/4.22e-preview-card.md) | 🟡 molecule | ✓ App | 粉絲端即時預覽卡（商品／拍賣，§5.2.5） | [preview-card.css](./ds-components/preview-card.css) |
| [PDP preview](./ds-specs/4.54b-pdp-preview.md) | 🟠 organism | SiteSpecific | 粉絲端商品頁的手機版鏡像（建立商品的即時預覽，D248） | [pdp-preview.css](./ds-components/pdp-preview.css) |
| [Preview column](./ds-specs/preview-column.md) | 🟡 molecule | ✓ Project | 建立流程「表單｜預覽」兩欄版面＋右側 sticky 預覽欄 | [preview-column.css](./ds-components/preview-column.css) |
| [Preview panel](./ds-specs/4.22f-preview-panel.md) | 🟠 organism | ✓ App | 右側畫面分割面板承載即時預覽——壓窄 wizard、非浮層（§5.2.5） | [preview-panel.css](./ds-components/preview-panel.css) |
| [Fan store preview](./ds-specs/fan-store-preview.md) | 🟠 organism | ✓ App | 電子商店與商店設定預覽用的粉絲端創作者頁手機版鏡像 | [fan-store.css](./ds-components/fan-store.css) |
| [Pickup management](./ds-specs/pickup-management.md) | 🟠 organism | SiteSpecific | 現場 QR 核銷工作區（spec 5.1.5.11 · D111），E-Shop 下與訂單管理並列 | [pickup.css](./ds-components/pickup.css) |
| [Mobile scanner](./ds-specs/mobile-scanner.md) | 🟠 organism | SiteSpecific | 獨立手機 scanner（spec 5.1.5.14 · D111/D121/D122/D240）——獨立 URL、無主工作台導航 | [scanner.css](./ds-components/scanner.css) |
| [Auth shell](./ds-specs/4.113-auth-shell.md) | 🟠 organism | SiteSpecific | 未登入層的置中表單殼（spec 5.1.10 · D170）——站上第二個無工作台導航的整頁殼，無卡片 | [auth.css](./ds-components/auth.css) |
| [Ticket preview](./ds-specs/4.116-ticket-preview.md) | 🟡 molecule | ✓ App | 粉絲收到的那張票的即時預覽（建立活動步驟 5 票券銷售 › 票券設計的右軌）：識別半張（時間／票名或 logo／票種）＋撕線＋QR 半張 | [ticket-preview.css](./ds-components/ticket-preview.css) |
| [Session list](./ds-specs/4.117-session-list.md) | 🟡 molecule | ✓ App | 系列場次清單：一活動辦好幾場時逐場列出日期與場地 | [session-list.css](./ds-components/session-list.css) |
| [Review status](./ds-specs/4.119-review-status.md) | 🟡 molecule | ✓ App | 送審件的狀態面板，顯示審核狀態、退件理由與可用的動作 | [review-status.css](./ds-components/review-status.css) |
| [Ticket tier card](./ds-specs/4.114-ticket-tier-card.md) | 🟡 molecule | ✓ App | 建立活動時的票種卡，可收合檢視價格與數量，展開後編輯 | [ticket-tier-card.css](./ds-components/ticket-tier-card.css) |
| [Readiness card](./ds-specs/4.22g-readiness-card.md) | 🟡 molecule | ✓ App | 上架前就緒檢查＋還差幾項 banner | [readiness.css](./ds-components/readiness.css) |
| [Post composer](./ds-specs/post-composer.md) | 🟡 molecule | ✓ App | 發文框，用於進度時間軸、發布更新彈窗與總覽進度摘要的入口 | [post-composer.css](./ds-components/post-composer.css) |
| [Fact list](./ds-specs/fact-list.md) | 🔵 atom | ✓ App | 唯讀事實列，左邊放欄目名、右邊放值，用於詳情彈窗 | [fact-list.css](./ds-components/fact-list.css) |
| [Progress mark](./ds-specs/progress-mark.md) | 🔵 atom | ✓ App | 進度記號：一顆記號、兩個消費者共用（時間軸與總覽的進度摘要） | [progress-mark.css](./ds-components/progress-mark.css) |
| [Step list](./ds-specs/step-list.md) | 🟡 molecule | ✓ App | 階段清單：一串回答「走到第幾步」的列，不是時間軸——沒有日期欄、沒有今天、不能往回捲 | [step-list.css](./ds-components/step-list.css) |
| [Progress timeline](./ds-specs/4.51b-progress-timeline.md) | 🟠 organism | ✓ App | 交付時間軸：一條由真實日期驅動的垂直時間流，未來在上、今天在中、過去在下 | [progress-timeline.css](./ds-components/progress-timeline.css) |
| [Section nav](./ds-specs/4.22h0-section-nav.md) | 🟡 molecule | ✓ App | 分頁內的側欄分節導覽 | [section-nav.css](./ds-components/section-nav.css) |
| [Section outline](./ds-specs/4.233-section-outline.md) | 🟡 molecule | ✓ App | 長表單的本頁大綱：直排細字清單，目前節亮起＋左側細線（scroll-spy），點擊平滑捲到該節 | [section-outline.css](./ds-components/section-outline.css) |
| [Limit set](./ds-specs/4.234-limit-set.md) | 🟡 molecule | ✓ App | 限購：一欄＋一句輔助說明、只換單位（件／組／張） | [limit-set.css](./ds-components/limit-set.css) |
| [Rules group](./ds-specs/4.240-rules-group.md) | 🟡 molecule | ✓ App | 購買條件群組，把購買條件與限購整併在同一個細框內 | [rules-group.css](./ds-components/rules-group.css) |
| [Form steps](./ds-specs/4.241-form-steps.md) | 🟢 atom | ✓ App | 把同一張表單分成多步顯示，用於建立商品與建立組合包 | [form-steps.css](./ds-components/form-steps.css) |
| [Price ladder](./ds-specs/4.235-price-ladder.md) | 🟡 molecule | ✓ App | 價格階梯，由上往下列出原價、各項折扣到粉絲實付的算法 | [price-ladder.css](./ds-components/price-ladder.css) |
| [Member table](./ds-specs/4.236-member-table.md) | 🟡 molecule | ✓ App | 組合物表：商品與活動票券成員同一張表，五欄（展開｜名稱｜原價・剩餘｜每組數量｜移除），票券列可展開、展開入口兩處同步。詳見 §4.236 | [member-table.css](./ds-components/member-table.css) |
| [Form ask](./ds-specs/4.237-form-ask.md) | 🟡 molecule | ✓ App | 問句式設定塊，依序呈現問句、說明與二選一選項，並附標題列讀數 | [form-ask.css](./ds-components/form-ask.css) |
| [Export dialog](./ds-specs/export-dialog.md) | 🟡 molecule | ✓ App | 匯出視窗的內容區，上方顯示這次匯出摘要，下方列匯出紀錄 | [export-dialog.css](./ds-components/export-dialog.css) |
| [Date range](./ds-specs/4.238-date-range.md) | 🟡 molecule | ✓ App | 清單篩選列上的日期區間欄，兩個日期欄並排、可只填一邊 | [date-range.css](./ds-components/date-range.css) |
| [Code picker](./ds-specs/4.239-code-picker.md) | 🟡 molecule | ✓ App | 商品與組合包的優惠碼選擇欄，以卡片列表呈現並可彈窗新增 | [code-picker.css](./ds-components/code-picker.css) |
| [Member picker](./ds-specs/4.244-member-picker.md) | 🟡 molecule | ✓ App | 組合物挑選：空狀態大按鈕＋「加入更多」，點開彈窗搜尋、篩選、一次勾多個。詳見 §4.244 | [member-picker.css](./ds-components/member-picker.css) |
| [Vault list](./ds-specs/4.245-vault-list.md) | 🟡 molecule | ✓ App | 媒體庫左欄：庫房一列（直式封面、名稱、狀態圓點・狀態字・人數）與同形狀的虛線「新增庫房」；選中只靠底色。詳見 §4.245 | [vault-list.css](./ds-components/vault-list.css) |
| [Vault stage](./ds-specs/4.246-vault-stage.md) | 🟠 organism | ✓ App | 媒體庫主欄：庫房標頭、成效三格、灰底容器內固定三欄的直式內容卡片與「添加」卡。詳見 §4.246 | [vault-stage.css](./ds-components/vault-stage.css) |
| [Vault open](./ds-specs/4.247-vault-open.md) | 🟡 molecule | ✓ App | 媒體庫開啟方式：條件開啟、鑰匙開啟兩列開關、方法小卡、鑰匙列。詳見 §4.247 | [vault-open.css](./ds-components/vault-open.css) |
| [Vault wizard](./ds-specs/4.248-vault-wizard.md) | 🟠 organism | ✓ App | 媒體庫三步建立流程：取名 → 放內容 → 誰開得了，全畫面 .wizard 蓋在頁面上。詳見 §4.248 | [vault-wizard.css](./ds-components/vault-wizard.css) |
| [Roster picker](./ds-specs/4.203-roster-picker.md) | 🟠 organism | ⚠ 退場候選（2026-10-08 D372 起零消費，待使用者裁決） | 上面選人、下面看那一位：上段是一張卡一個對象的網格（可換行、窄畫面掉成一欄），下段是選定那一位的內容、佔整個內容寬度 | [roster-picker.css](./ds-components/roster-picker.css) |
| [Row disclosure](./ds-specs/4.204-row-disclosure.md) | 🟡 molecule | ✓ App | 母列收成一列、點開才看到底下每一筆 | [row-disclosure.css](./ds-components/row-disclosure.css) |
| [Listing controls](./ds-specs/4.205-listing-controls.md) | 🟠 organism | ✓ App | 上架、顯示於商店與開賣三個獨立開關並列的設定區塊 | [listing-controls.css](./ds-components/listing-controls.css) |
| [Link field](./ds-specs/4.206-link-field.md) | 🟡 molecule | ✓ App | 系統產生、不可編輯、要能整條帶走的連結：唯讀等寬輸入框吃滿寬、行尾複製與重置、底下一行說明 | [link-field.css](./ds-components/link-field.css) |
| [Stock allocation](./ds-specs/4.207-stock-allocation.md) | 🟠 organism | ✓ App | 說明一個庫存池如何分配給各販售管道，逐列顯示鎖定量與可售量 | [stock-allocation.css](./ds-components/stock-allocation.css) |
| [Avatar](./ds-specs/4.202-avatar.md) | 🟢 atom | ✓ App | 姓名首字的識別圓，40px（`.ztor-avatar`）、32px（`--sm`）與 64px（`--lg`）三尺寸 | [avatar.css](./ds-components/avatar.css) |
| [Stat row](./ds-specs/4.22h1-stat-row-meter-list-day-bars.md) | 🟡 molecule | ✓ App | 卡內大數字排（取代把 `.kpi` 塞進卡片） | [stat-row.css](./ds-components/stat-row.css) |
| [Todo list](./ds-specs/todo-list.md) | 🟡 molecule | ✓ App | 可編輯的待辦清單（勾選＋自行增刪） | [todo-list.css](./ds-components/todo-list.css) |
| [Meter list](./ds-specs/meter-list.md) | 🟡 molecule | ✓ App | 逐項水位清單（名稱 → 量條 → 數字，三欄一線） | [meter-list.css](./ds-components/meter-list.css) |
| [Next step](./ds-specs/next-step.md) | 🟡 molecule | ✓ App | 一句話＋一顆主要動作，放在卡的最後一段 | [next-step.css](./ds-components/next-step.css) |
| [Empty card](./ds-specs/4.22h-empty-card.md) | 🟡 molecule | ✓ App | 卡片內「已載入但無資料」空狀態 | [empty-card.css](./ds-components/empty-card.css) |
| [Staged change](./ds-specs/4.232-staged-change.md) | 🟢 atom | ✓ App | 就地編輯時標示已修改、新增與待刪除項目的狀態標記 | [staged-change.css](./ds-components/staged-change.css) |
| [Notification matrix](./ds-specs/4.22i-notification-matrix.md) | 🟠 organism | ✓ App | 事件×管道逐格開關矩陣（含鎖定通道） | [notification-matrix.css](./ds-components/notification-matrix.css) |
| [Completeness meter](./ds-specs/4.22j-completeness-meter.md) | 🟡 molecule | ✓ App | label＋x/y＋進度條（素材包完整度） | [completeness.css](./ds-components/completeness.css) |
| [Insight row](./ds-specs/4.22k-insight-row.md) | 🟡 molecule | ✓ App | 圖表下單行自動洞察（無洞察隱藏） | [insight-row.css](./ds-components/insight-row.css) |
| [Finding card](./ds-specs/4.111-finding-card.md) | 🟠 organism | ✓ App | 一則帶著支撐數字的結論（結論＋數字＋依據＋追查入口） | [finding-card.css](./ds-components/finding-card.css) |
| [Source status](./ds-specs/4.112-source-status.md) | 🟠 organism | ✓ App | 不占版位的資料涵蓋指示＋來源明細面板 | [source-status.css](./ds-components/source-status.css) |
| [List footer](./ds-specs/4.22l-list-footer.md) | 🟡 molecule | ✓ App | 清單分頁頁尾（Showing N of M＋Load more） | [list-footer.css](./ds-components/list-footer.css) |
| [Message composer](./ds-specs/4.22m-message-composer.md) | 🟠 organism | ✓ App | 群發撰寫 modal（Compose＋History） | [message-modal.css](./ds-components/message-modal.css) |
| [Char counter](./ds-specs/4.22n-char-counter.md) | 🟡 molecule | ✓ App | 限長輸入即時字數 | [message-modal.css](./ds-components/message-modal.css) |
| [Token chip](./ds-specs/4.22o-token-chip.md) | 🟡 molecule | ✓ App | 點擊插入個人化變數 | [message-modal.css](./ds-components/message-modal.css) |
| [Event preview card](./ds-specs/4.22p-event-preview-card.md) | 🟡 molecule | ✓ App | 建立活動粉絲視角活動卡（即時預覽） | [event-preview-card.css](./ds-components/event-preview-card.css) |
| [Product list](./ds-specs/4.27-product-list.md) | 🟠 organism | ✓ App | 電子商店庫存清單，顯示商品、狀態、庫存、可見性與編輯動作 | [product-list.css](./ds-components/product-list.css) |
| [Project list](./ds-specs/4.28-project-list.md) | 🟠 organism | ✓ App | 專案清單表格，顯示目標進度、剩餘時間、類別與狀態，整列可點入明細 | [project-list.css](./ds-components/project-list.css) |
| [Table](./ds-specs/4.23-table.md) | 🟠 organism | ✓ App | Earnings transactions 9-col table | [table.css](./ds-components/table.css) |
| [Sparkline](./ds-specs/sparkline.md) | 🟢 atom | ✓ App | 數字的附註型微型走勢圖 | [sparkline.css](./ds-components/sparkline.css) |
| [Issue panel](./ds-specs/issue-panel.md) | 🟠 organism | ✓ App | 待辦事項面板：把「還等著創作者處理的事」整批攤開，依來源模組分組、一次展開一則 | [issue-panel.css](./ds-components/issue-panel.css) |
| [Work card](./ds-specs/work-card.md) | 🟡 molecule | ✓ App | 儀表板的封面磚列 | [work-card.css](./ds-components/work-card.css) |
| [Earnings feed](./ds-specs/earnings-feed.md) | 🟡 molecule | ✓ App | 儀表板第一屏右欄的「近期收入」：一筆交易一個框 | — |
| [Canvas stage](./ds-specs/canvas-stage.md) | 🟠 organism | ✓ App | 一屏不捲展示版（`index.html`）的滿版底圖 | [canvas-stage.css](./ds-components/canvas-stage.css) |
| [Split bar](./ds-specs/split-bar.md) | 🟡 molecule | ✓ App | 一個總數＋它的組成：分段長條與圖例 | [split-bar.css](./ds-components/split-bar.css) |
| [Donut mix](./ds-specs/donut-mix.md) | 🟡 molecule | ✓ App | 一個總數拆成幾塊、畫成圓環 | [donut-mix.css](./ds-components/donut-mix.css) |
| [Tier arc](./ds-specs/tier-arc.md) | 🟡 molecule | ✓ App | 層層包含的分層弧，呈現一般粉絲到核心圈的粉絲分層 | [tier-arc.css](./ds-components/tier-arc.css) |
| [KPI rotator](./ds-specs/kpi-rotator.md) | 🟡 molecule | ✓ App | 展示版左欄的輪播卡，輪流顯示收入走勢與粉絲分布 | [kpi-rotator.css](./ds-components/kpi-rotator.css) |
| [Canvas home](./ds-specs/canvas-home.md) | 🟠 organism | SiteSpecific | `index.html` 的版型層：窄的左欄三格（收入輪播／兩個進行中項目／三則待處理）浮在鋪滿整個視窗的底圖上，整頁釘在視窗高度、不捲 |  |
| [Live item](./ds-specs/live-item.md) | 🟡 molecule | ✓ App | 展示版第二屏的主角：一件正在跑的事，講在一張佔掉大半屏高度的海報旁邊 |  |
| [Chart](./ds-specs/4.24-chart.md) | 🟠 organism | ✓ App | 折線圖、堆疊長條、來源圖例與排名長條等 SVG 圖表群 | [chart.css](./ds-components/chart.css) |
| [Earnings waterfall](./ds-specs/4.24b-earnings-waterfall.md) | 🟡 molecule | ✓ App | 收入頁的損益瀑布表，從總收入逐項扣除到可分配利潤 | [waterfall.css](./ds-components/waterfall.css) |
| [Detail overview](./ds-specs/detail-overview.md) | 🟠 organism | ✓ App | 詳情頁總覽的三欄骨架 | [detail-overview.css](./ds-components/detail-overview.css) |
| [Bento grid](./ds-specs/4.25-bento-grid.md) | 🟠 organism | ✓ App | 12-col responsive grid · KPI rows, dashboard pairs, settings layouts | [bento.css](./ds-components/bento.css) |
| [Payout picker & dialog](./ds-specs/4.29-payout-bank-picker-dialog.md) | 🟠 organism | ✓ App | 撥款銀行選擇卡與申請撥款彈窗，含金額輸入與費用摘要 | [payout-modal.css](./ds-components/payout-modal.css) |
| [Restock order (table)](./ds-specs/4.29c-restock-order.md) | 🟡 molecule | ✓ App | E-Shop restock popup (spec §5.1.5.6, D104 order + D106 member tabs). | [restock-modal.css](./ds-components/restock-modal.css) |
| [Store settings page](./ds-specs/4.48-store-settings-page.md) | 🟠 organism | ✓ SiteSpecific | E-Shop 商店層級設定頁（`store-settings.html`） | [store-settings.css](./ds-components/store-settings.css) |
| [Variant builder](./ds-specs/variant-builder.md) | 🟠 organism | ✓ App | 建立商品多選項（spec 5.1.5.2 §4.1④，僅實體） | [variant-builder.css](./ds-components/variant-builder.css) |
| [Tag input](./ds-specs/tag-input.md) | 🟡 molecule | ✓ App | 商品標籤輸入欄，已選標籤以 chip 呈現並提供建議標籤 | [tag-input.css](./ds-components/tag-input.css) |
| [Combobox](./ds-specs/combobox.md) | 🟡 molecule | ✓ App | 可輸入搜尋並多選的下拉建議欄，已選項目以 chip 呈現 | [combobox.css](./ds-components/combobox.css) |
| [Film picker](./ds-specs/film-picker.md) | 🟡 molecule | ✓ App | 電影關聯的可搜尋多選元件，建於標籤輸入與 chip 之上 | [partials/film-picker.js](./partials/film-picker.js) |
| [Work fields](./ds-specs/work-fields.md) | 🟠 organism | ✓ App | 影片作品欄位區塊，由多個既有表單元件組成的 JS 元件 | [partials/work-fields.js](./partials/work-fields.js) |
| [~~Lang switch~~](./ds-specs/lang-switch.md) | — | **已退場 2026-08-24（D223）** | 頁級「內容檢視語言」切換 | （已刪除） |
| [Publish preview](./ds-specs/publish-preview.md) | 🟠 organism | ✓ App | 發布前預覽確認層，以彈窗顯示各語言版本的預覽內容 | [partials/publish-preview.js](./partials/publish-preview.js) |
| [Archived gate](./ds-specs/archived-gate.md) | 🟢 atom | ✓ App | 封存態唯讀的事件層閘門：純 JS 元件 `partials/archived-gate.js`，無自帶 CSS、不畫任何東西 | [partials/archived-gate.js](./partials/archived-gate.js) |
| [Work taxonomy](./ds-specs/work-taxonomy.md) | 🟢 atom | ✓ App | 題材與年齡分級的值域單一來源 JS 模組，供多處畫面共用 | [js/work-taxonomy.js](./js/work-taxonomy.js) |
| [Manual entry modal](./ds-specs/manual-entry-modal.md) | 🟠 organism | ✓ App | 補登站外收入的彈窗，重用共用彈窗殼與表單 helper | [partials/manual-entry-modal.js](./partials/manual-entry-modal.js) |
| [Source upload modal](./ds-specs/source-upload-modal.md) | 🟠 organism | ✓ App | 上傳外部平台匯出資料檔的彈窗，重用共用彈窗殼 | [partials/source-upload-modal.js](./partials/source-upload-modal.js) |
| [Fee exception modal](./ds-specs/fee-exception-modal.md) | 🟠 organism | ✓ App | 逐位創作者覆寫平台費率的彈窗，有新增與編輯兩種模式 | [partials/fee-exception-modal.js](./partials/fee-exception-modal.js) |
| [Login lang prompt](./ds-specs/login-lang-prompt.md) | 🟠 organism | ✓ App | 登入後詢問「登入畫面剛選的語言」是否要成為帳號預設語言 | [partials/login-lang-prompt.js](./partials/login-lang-prompt.js) |
| [Loyalty settings](./ds-specs/loyalty-settings.md) | 🟢 atom | ✓ App | 平台忠誠點數設定的已儲存值模組，作為原型的單一資料來源 | [js/loyalty-settings.js](./js/loyalty-settings.js) |
| [Fans roster](./ds-specs/fans-roster.md) | 🟢 atom | ✓ App | 粉絲示範母體：純資料模組 `js/fans-roster.js`，無自帶 CSS | [js/fans-roster.js](./js/fans-roster.js) |
| [Content block injector](./ds-specs/content-block-injector.md) | 🟠 organism | ✓ App | 儀表板與收入管理反覆出現的內容區塊，由同一支渲染器產生 | [js/components.js](./js/components.js) |
| [Status axes](./ds-specs/status-axes.md) | 🟡 molecule | ✓ App | 訂單兩條獨立狀態軸（spec 5.1.5.3.1 §2.2 / PCR-001）：履約 vs 付款·結算，不併成單一 badge | [status-axes.css](./ds-components/status-axes.css) |
| [Embed modal](./ds-specs/4.97-detail-sheet.md) | 🟠 organism | ✓ App | 全螢幕彈窗內嵌另一頁，不離開清單就能開啟商店設定等頁面 | [embed-modal.css](./ds-components/embed-modal.css) |
| [Leave dialog](./ds-specs/leave-dialog.md) | 🟠 organism | ✓ App | 建立／編輯流程的返回離開確認彈窗（spec §5.2.4），由 `partials/wizard-chrome.js` 注入、6 建立頁共用 | [leave-dialog.css](./ds-components/leave-dialog.css) |
| [Schedule restore](./ds-specs/schedule-restore.md) | 🟡 molecule | ✓ App | 重新上架被擋下時的提示區塊，逐列列出已過期或未通過檢查的時間 | [sched-restore.css](./ds-components/sched-restore.css) |
| [Spec row](./ds-specs/spec-row.md) | 🟡 molecule | ✓ App | 建立商品時可重複新增的詳細規格列，每列有規格名稱、值與刪除鈕 | [spec-row.css](./ds-components/spec-row.css) |
| [Split button](./ds-specs/4.2-button.md) | 🟡 molecule | ✓ App | 主操作加箭頭下拉相關動作的按鈕 | [split-button.css](./ds-components/split-button.css) |
| [New product post](./ds-specs/new-product-post.md) | 🟠 organism | ✓ App | 建立商品後在電子商店清單彈出的撰寫彈窗，可附上商品卡 | [product-post-modal.css](./ds-components/product-post-modal.css) |
| [App shell](./ds-specs/app-shell.md) | 🟠 organism | ✓ Project | 整個頁面的外框，包含側欄、主內容區與頁面寬度設定 | [shared.css](./shared.css) |
| [Page intro](./ds-specs/page-intro.md) | 🟡 molecule | ✓ Project | 頁面頂部的標題區，含 H1、副標題與可選動作，可在左側放主視覺 | [page-intro.css](./ds-components/page-intro.css) |
| [Field more](./ds-specs/field-more.md) | 🟡 molecule | ✓ Project | 把次要欄位收在「顯示更多」按鈕後面的表單收合區 | [field-more.css](./ds-components/field-more.css) |
| [Field system](./ds-specs/field-system.md) | 🟡 molecule | ✓ Project | ONE form field = label / hint / control slot（控件重用 atom） | — |
| [Form section](./ds-specs/form-section.md) | 🟠 organism | ✓ Project | 建立流程中的表單區段，含標題、說明與分隔線，可用外框變體 | [form-section.css](./ds-components/form-section.css) |
| [Radio card](./ds-specs/radio-card.md) | 🟡 molecule | ✓ Project | 並排的可選卡片，標題加說明，選取時以橘色小圓點標示 | [radio-card.css](./ds-components/radio-card.css) |
| [Check card](./ds-specs/check-card.md) | 🟡 molecule | ✓ App | Multi-select pill card . | [check-card.css](./ds-components/check-card.css) |
| [Radio list](./ds-specs/4.96-checkbox.md) | 🟡 molecule | ✓ Project | 輕量的垂直單選清單，每列有單選圓點、標題與可選說明 | [radio-list.css](./ds-components/radio-list.css) |
| [Date input placeholder](./ds-specs/date-input-placeholder.md) | 🔵 atom | ✓ Project | 為日期與時間欄位加上「選擇日期」佔位字的裝飾層 | [date-input.css](./ds-components/date-input.css) |
| [Collapse group](./ds-specs/collapse-group.md) | 🟡 molecule | ✓ Project | 可收合的欄位群組，折疊時只留一行標題與值的摘要，用於活動場次 | [collapse-group.css](./ds-components/collapse-group.css) |
| [Control row](./ds-specs/4.29-payout-bank-picker-dialog.md) | 🟡 molecule | ✓ Project | 一列式設定框，左邊放標籤與說明、右邊放開關、數字或按鈕 | [control-row.css](./ds-components/control-row.css) |
| [Form grid](./ds-specs/form-grid.md) | 🟢 atom | ✓ Project | 2 欄或 3 欄的表單欄位排版輔助，窄螢幕自動改單欄 | [form-grid.css](./ds-components/form-grid.css) |
| [Filter row](./ds-specs/filter-row.md) | 🟡 molecule | ✓ Project | Chip filters and inline actions above lists / grids | [shared.css](./shared.css) |
| [Edge shadow（工具）](./ds-specs/edge-shadow.md) | ⚪ utility | ✓ Project | 只露出下緣的邊緣陰影工具，用於電子商店庫存條 | [shared.css](./shared.css) |
| [Shell 補角／接縫（頁級技法）](./ds-specs/shell.md) | ⚪ utility | — SiteSpecific | 分割與捲動容器的圓角補位技法，目前只用在電子商店頁 | [e-shop.html](./e-shop.html) |
| [Segmented control](./ds-specs/segmented-control.md) | 🟡 molecule | ✓ Project | Compact chart view switcher and mode toggles | [chart.css](./ds-components/chart.css) |
| [Stepper](./ds-specs/stepper.md) | 🟡 molecule | ✓ Project | Wizard 進度條（數字圓圈） | [shared.css](./shared.css) |
| [Progress stepper](./ds-specs/progress-stepper.md) | 🟡 molecule | ✓ Project | 嚮導的進度條，細軌加品牌漸層填充，下方列出各步驟標籤 | [progress-stepper.css](./ds-components/progress-stepper.css) |
| [Wizard frame](./ds-specs/wizard-frame.md) | 🟠 organism | ✓ Project | 多步驟建立流程的外框，含頂列、底列膠囊與全頁預覽區 | [shared.css](./shared.css) |
| [Stack](./ds-specs/stack.md) | ⚪ utility | ✓ Project | 區塊之間垂直間距的唯一規則：間距由容器承擔（`gap`），子元素不各自加 margin | [stack.css](./ds-components/stack.css) |
| [Settings nav](./ds-specs/4.48-store-settings-page.md) | 🟡 molecule | ✓ Project | Sticky local navigation inside Settings | [settings.css](./ds-components/settings.css) |
| [Settings row](./ds-specs/4.48-store-settings-page.md) | 🟡 molecule | ✓ Project | Dense label + hint + value/control/action row | [settings.css](./ds-components/settings.css) |
| [Hero slideshow](./ds-specs/hero-slideshow.md) | 🟠 organism | ✓ Project | Dashboard full-bleed carousel | [shared.css](./shared.css) · [hero.js](./js/hero.js) |
| [Rent block](./ds-specs/rent-block.md) | 🟡 molecule | ✓ Project | IP 詳情頁的租用配置區，分租期、獨家、費用明細與結算兩組 | [rent-block.css](./ds-components/rent-block.css) |
| [IP hero](./ds-specs/ip-hero.md) | 🟠 organism | ✓ Project | IP detail cover + usage + rental composition（ip-detail 專用） | [shared.css](./shared.css) |
| [IP market card cover](./ds-specs/ip-market-card-cover.md) | 🟢 atom | ✓ Project | IP 市集上架卡的封面，無圖時顯示品牌漸層佔位與 IP 名 | [shared.css](./shared.css) |
| [Funding panel](./ds-specs/4.91-funding-panel.md) | 🟡 molecule | ✓ Project | 募資概況面板：已募金額＋支持人數／目標／進度條＋百分比藥丸／倒數＋募資期間／口徑註記，一個區塊講完 | [funding-panel.css](./ds-components/funding-panel.css) |
| [Rental card](./ds-specs/rental-card.md) | 🟡 molecule | ✓ Project | Rental / bidding terms and CTA card | [shared.css](./shared.css) |
| [Meta cell](./ds-specs/meta-cell.md) | 🟢 atom | ✓ Project | Compact label/value stack in dense commercial panels | [shared.css](./shared.css) |
| [KV list](./ds-specs/4.50-kv-list.md) | 🟢 atom | ✓ Project | 唯讀鍵值列（鍵左值右、逐列 hairline）：詳情頁 meta 卡、狀態摘要 | [kv-list.css](./ds-components/kv-list.css) |
| [Calc list](./ds-specs/4.217-calc-list.md) | 🟡 molecule | ✓ App | 算式列表：一行一項、列首一個運算子（＋ − ＝）、末列是結果 | [calc-list.css](./ds-components/calc-list.css) |
| [Stock bar](./ds-specs/4.51-stock-bar.md) | 🟢 atom | ✓ Project | 5px 細長量條（庫存水位／用量比例），必與精確數字並列 | [stock-bar.css](./ds-components/stock-bar.css) |
| [Points QR card](./ds-specs/4.51c-points-qr-card.md) | 🟡 molecule | ✓ Project | 掃碼領點的 QR 卡，含 QR 名稱、每次點數、用量條與下載鈕 | [points-qr.css](./ds-components/points-qr.css) |
| [Detail rail](./ds-specs/4.52-detail-rail.md) | 🟠 organism | ✓ Project | 詳情頁兩欄殼，左邊是可編輯主欄，右邊是固定的唯讀資訊欄 | [detail-rail.css](./ds-components/detail-rail.css) |
| [Stock readout](./ds-specs/4.54-stock-readout.md) | 🔵 atom | ✓ Project | 唯讀的數量讀數，用於只能透過補貨等動作改變的庫存值 | [stock-readout.css](./ds-components/stock-readout.css) |
| [Stock split](./ds-specs/stock-split.md) | 🟡 molecule | ✝ 退場 | 庫存分配長條。`stock-split.css` 留墓碑，原始內容見 git 歷史。 |  |
| [Restock log](./ds-specs/4.55-restock-log.md) | 🟡 molecule | ✝ 退場 | 補貨紀錄表。`restock-log.css` 留墓碑。 |  |
| [Stock history](./ds-specs/4.208-stock-history.md) | 🟡 molecule | ✓ Project | 庫存歷史紀錄，每筆補貨或鎖定一列，可展開看逐組合明細 |  |
| [Lock sets](./ds-specs/4.210-lock-sets.md) | 🟠 organism | ✓ Project | 組合包鎖定套數區，設定鎖定幾套並逐項檢視各商品庫存分配 | [lock-sets.css](./ds-components/lock-sets.css) |
| [Profile avatar row](./ds-specs/4.211-profile-avatar-row.md) | 🟡 molecule | ✓ Project | 頭像＋名字＋「變更相片」橫條：薄膜底、圓形頭像 56px、名字跟顯示名稱欄位同步；首用商店設定「店面」分頁。demo 見 §4.211 | [profile-avatar-row.css](./ds-components/profile-avatar-row.css) |
| [Social links](./ds-specs/4.212-social-links.md) | 🟠 organism | ✓ Project | 社群連結清單：平台一列一格（平台名＋垃圾桶／網址欄）、虛線「新增」鈕展開未加平台清單 | [social-links.css](./ds-components/social-links.css) |
| [Bundle preview card](./ds-specs/4.213-bundle-preview-card.md) | 🟡 molecule | ✓ Project | 組合包編輯器右欄的粉絲端預覽卡，顯示內含清單、價格與加入購物車鈕 | [bundle-preview-card.css](./ds-components/bundle-preview-card.css) |
| [Fan event page](./ds-specs/4.215-fan-event-page.md) | 🟠 organism | ✓ Project | 粉絲視角活動頁＝前台 shop-item 頁的 1:1 鏡像：發布前預覽確認與活動詳情「預覽與在地化」的預覽檢視，票券頁／票務商品頁兩視圖 | [fan-shop.css](./ds-components/fan-shop.css) |
| [Fan product page](./ds-specs/4.218-fan-product-page.md) | 🟠 organism | ✓ Project | 粉絲視角的商品頁，是前台商品頁的 1:1 鏡像預覽 | [fan-shop.css](./ds-components/fan-shop.css) |
| [Fan bundle page](./ds-specs/4.219-fan-bundle-page.md) | 🟠 organism | ✓ Project | 粉絲視角的組合包頁，是前台兩種組合分支的 1:1 鏡像預覽 | [fan-shop.css](./ds-components/fan-shop.css) |
| [Fan project page](./ds-specs/4.220-fan-project-page.md) | 🟠 organism | ✓ Project | 粉絲視角的專案頁，是前台共創、預購與標題頁的 1:1 鏡像預覽 | [fan-shop.css](./ds-components/fan-shop.css) |
| [Info sections](./ds-specs/4.221-info-sections.md) | 🟡 molecule | ✝ 退場 | 說明區塊編輯器。`info-sections.css`、`partials/info-sections.js` 留墓碑。 | [info-sections.css](./ds-components/info-sections.css) |
| [Rich body](./ds-specs/4.222-rich-body.md) | 🟡 molecule | ✓ Project | 描述區塊編輯器：描述＝一串可排序的區塊，三種型別——文字／圖片／影片 | [rich-body.css](./ds-components/rich-body.css) |
| [Follow field](./ds-specs/4.223-follow-field.md) | 🟡 molecule | ✓ Project | 跟隨活動或另設時間的設定列，用於票務商品的上架、下架、開賣與停售 | [follow-field.css](./ds-components/follow-field.css) |
| [Size mix](./ds-specs/4.224-size-mix.md) | 🟡 molecule | ✓ Project | 各尺寸占比：每個尺寸一格固定寬的小直條，依尺寸順序排，整張表同一尺寸落在同一欄、上下列可直接比 | [size-mix.css](./ds-components/size-mix.css) |
| [Demand table](./ds-specs/4.225-demand-table.md) | 🟠 organism | ✓ Project | 市場需求表，列出各市場的需求指數、建議與計畫生產量及差距 | [demand-table.css](./ds-components/demand-table.css) |
| [Demand focus](./ds-specs/4.226-demand-focus.md) | 🟠 organism | ✓ Project | 選定市場後的常駐面板，顯示預測售罄天數與各尺寸計畫生產量 | [demand-focus.css](./ds-components/demand-focus.css) |
| [Section tabs](./ds-specs/4.214-section-tabs.md) | 🟡 molecule | ✓ App | 長表單頂端的分節分頁：點了平滑捲到那一段、捲動時亮目前那一段（scrollspy）、←／→／Home／End 鍵盤可移 | [section-tabs.css](./ds-components/section-tabs.css) |
| [State check](./ds-specs/4.209-state-check.md) | 🟡 molecule | ✓ Project | 唯讀的開關狀態排，以圓形勾選標記顯示各項目的開或關 | [state-check.css](./ds-components/state-check.css) |
| [Stock tip](./ds-specs/4.56-stock-tip.md) | 🟢 atom | ✓ App | 電子商店清單中狀態與庫存欄 hover 時浮出的資訊卡 | [stock-tip.css](./ds-components/stock-tip.css) |
| [Nest](./ds-specs/4.53-nest.md) | 🔵 atom | ✓ Project | 嵌在卡片底緣的滿版子層（左右下三邊切齊母卡外緣），用於「切換模式後長出一整組設定」 | [nest.css](./ds-components/nest.css) |
| [Chart card](./ds-specs/chart-card.md) | 🟠 organism | ✓ Project | Chart surface with title, controls, body | [chart.css](./ds-components/chart.css) |
| [Rank bars / source breakdown](./ds-specs/rank-bars-source-breakdown.md) | 🟡 molecule | ✓ Project | Ranked bar rows and source distribution legends | [chart.css](./ds-components/chart.css) |
| [Tooltip](./ds-specs/tooltip.md) | — | ◎ Default | shadcn baseline — not promoted to a project CSS file | — |
| [Toast](./ds-specs/4.107-toast.md) | 🟢 atom | ✓ App | 畫面底部中央的短暫確認提示（由下往上滑入）＋「未儲存/已儲存」狀態列（`.save-status`） | [toast.css](./ds-components/toast.css) |
| [Artist picker](./ds-specs/4.92-artist-picker.md) | 🟡 molecule | ⚠ Orphan（0 consumers，2026-07-29 盤點） | 「＋ 新增藝人」流程已加入藝人清單列＋pending 邀請列，沿用 owner-lookup 搜尋殼 | [artist-picker.css](./ds-components/artist-picker.css) |
| [Benefit matrix](./ds-specs/4.93-benefit-matrix.md) | 🟠 organism | ✓ App | 權益比較矩陣：一份權益目錄（列）× 四個粉絲分級（欄），取代舊版四張獨立分級卡。詳見 §4.93 | [benefit-matrix.css](./ds-components/benefit-matrix.css) |
| [Tier overview](./ds-specs/4.93b-tier-overview.md) | 🟡 molecule | ✓ App | 分級對照表（唯讀）：四個分級並排成欄、每列一個比較項目（門檻／人數／權益） | [tier-overview.css](./ds-components/tier-overview.css) |
| [Brand card](./ds-specs/4.94-brand-card.md) | 🟡 molecule | ✓ App | 品牌合作目錄卡，分開陳列鎖定的合作條款與創作者可編輯的活動 | [brand-card.css](./ds-components/brand-card.css) |
| [Chart tip](./ds-specs/4.95-chart-tip.md) | 🟡 molecule | ✓ App | 折線圖滑過時的浮層與熱區，點擊可開啟明細 | [chart-tip.css](./ds-components/chart-tip.css) |
| [Checkbox](./ds-specs/4.96-checkbox.md) | 🟢 atom | ✓ App | 全站自繪的核取方塊，取代原生方塊並支援不確定狀態 | [checkbox.css](./ds-components/checkbox.css) |
| [Detail sheet](./ds-specs/4.97-detail-sheet.md) | 🟠 organism | ✓ App | 清單頁點列開細節頁的全螢幕 iframe 覆蓋層，取代整頁導航 | [detail-sheet.css](./ds-components/detail-sheet.css) |
| [Explainer](./ds-specs/4.98-explainer.md) | 🟡 molecule | ✓ App | 欄位旁 info 圖示開正式說明彈窗，取代重複提示 | [explainer.css](./ds-components/explainer.css) |
| [Fans guide](./ds-specs/4.99-fans-guide.md) | 🟠 organism | ✓ App | 「粉絲經營怎麼玩」整頁式說明，四幕各自用自己真實資料形狀呈現。詳見 §4.99 | [fans-guide.css](./ds-components/fans-guide.css) |
| [Inline edit](./ds-specs/4.100-inline-edit.md) | — | ✝ Tombstone（0 consumers，刻意留空） | 空檔，僅存一段棄用註解；`shared.css` 已內建等效行為，全站未曾 `<link>` 過。詳見 §4.100 | [inline-edit.css](./ds-components/inline-edit.css) |
| [Manage IP](./ds-specs/4.101-manage-ip.md) | 🟡 molecule | ✓ SiteSpecific | 「管理我的 IP」頁專屬的版面補丁，含狀態徽章、驗證橫幅與授權範圍 | [manage-ip.css](./ds-components/manage-ip.css) |
| [Media vault](./ds-specs/4.102-media-vault.md) | 🟠 organism | ✓ App | 加密媒體庫：門條（解鎖條件＋觸及讀數）＋圖片/影片/音檔三種原生內容分區。詳見 §4.102 | [media-vault.css](./ds-components/media-vault.css) |
| [Perf rank](./ds-specs/4.103-perf-rank.md) | 🟡 molecule | ✓ App | 「表現排行」統一列語法，給 8–11 列的長排行榜用；`.rank-bar` 仍留給 4–6 列的佔比場景。詳見 §4.103 | [perf-rank.css](./ds-components/perf-rank.css) |
| [Sortable](./ds-specs/4.104-sortable.md) | 🟡 molecule | ✓ App | 全站表格排序互動：欄位標題包成按鈕，靜止態與純文字標題一致 | [sortable.css](./ds-components/sortable.css) |
| [Numeric stepper](./ds-specs/4.105-numeric-stepper.md) | 🟢 atom | ✓ App | 數字輸入框的上下增減鈕，取代原生 spin button | [stepper.css](./ds-components/stepper.css) |
| [Sticky actions](./ds-specs/4.106-sticky-actions.md) | 🟡 molecule | ✓ App | 頂部 CTA 捲出畫面後在底部浮現複製版動作列；全站消費最廣的元件之一（15 頁）。詳見 §4.106 | [sticky-actions.css](./ds-components/sticky-actions.css) |
| [Vault item task](./ds-specs/4.229-vault-item-task.md) | 🟡 molecule | ✓ App | 媒體庫每件內容的任務小標與單件抽屜的任務設定區 | [vault-task.css](./ds-components/vault-task.css) |
| [Vault overview](./ds-specs/4.230-vault-overview.md) | 🟡 molecule | ✓ App | 媒體庫「總覽」分頁的卡內版面：兩卡並排、檢視身分那一行、每件清單的名稱與小標欄、鑰匙三格、內容摘要兩組小表。詳見 §4.230 | [vault-overview.css](./ds-components/vault-overview.css) |
| [Vault access](./ds-specs/4.231-vault-access.md) | 🟡 molecule | ✓ App | 媒體庫的存取權限分頁，顯示即時人數、各方法符合人數與分享連結 | [vault-access.css](./ds-components/vault-access.css) |
| [Media preview](./ds-specs/4.242-media-preview.md) | 🟡 molecule | ✓ App | 單件媒體預覽，可放大照片、播放影片封面或音檔進度條 | [media-preview.css](./ds-components/media-preview.css) |
| [Vault share](./ds-specs/4.108-vault-share.md) | 🟠 organism | ✓ App | 媒體庫的加密連結／NFC 鑰匙發放面板，住在 drawer 裡；送禮與 NFC 商品共用同一個物件。詳見 §4.108 | [vault-share.css](./ds-components/vault-share.css) |
| [Wizard split](./ds-specs/4.109-wizard-split.md) | 🟠 organism | ✓ App | 精靈流程的「內容欄＋貼頂摘要側欄」兩欄版面，供 create-project 兩步共用。詳見 §4.109 | [wizard-split.css](./ds-components/wizard-split.css) |
| [Zselect](./ds-specs/4.110-zselect.md) | 🟡 molecule | ✓ App | 自製下拉選單，取代無法被樣式化的原生 `<select>` 展開清單 | [zselect.css](./ds-components/zselect.css) |

### 4.2+ 元件規格索引

- [4.2 Button](./ds-specs/4.2-button.md)
- [4.3 Badge / Status pill](./ds-specs/4.3-badge-status-pill.md)
- [4.4 Status dot](./ds-specs/4.4-status-dot.md)
- [4.5 Chip](./ds-specs/4.5-chip.md)
- [4.6 Switch](./ds-specs/4.6-switch.md)
- [4.7 Info banner](./ds-specs/4.7-info-banner.md)
- [4.7b Upload tile](./ds-specs/4.7b-upload-tile.md)
- [4.8 Input](./ds-specs/4.8-input.md)
- [4.9 Icon](./ds-specs/4.9-icon.md)
- [4.10 NavigationMenu](./ds-specs/4.10-navigationmenu.md)
- [4.11 Card](./ds-specs/4.11-card.md)
- [4.11b Section card](./ds-specs/4.11b-section-card.md)
- [4.12 KPI](./ds-specs/4.12-kpi.md)
- [4.13 Alert](./ds-specs/4.13-alert.md)
- [4.14 Accordion](./ds-specs/4.14-accordion.md)
- [4.15 Tabs](./ds-specs/4.15-tabs.md)
- [4.16 Cookie banner（已退場 2026-08-03，tombstone）](./ds-specs/4.16-cookie-banner.md)
- [4.17 Empty stub](./ds-specs/4.17-empty-stub.md)
- [4.18 Selection card](./ds-specs/4.18-selection-card.md)
- [4.19 Composer（已退場 2026-08-25，tombstone）](./ds-specs/4.19-composer.md)
- [4.20 Header (app topbar)](./ds-specs/4.20-header.md)
- [4.21 Footer](./ds-specs/4.21-footer.md)
- [4.22 Data list](./ds-specs/4.22-data-list.md)
- [4.22b Picker](./ds-specs/4.22b-picker.md)
- [4.22c Field pill](./ds-specs/4.22c-field-pill.md)
- [4.22d Segmented](./ds-specs/4.22d-segmented.md)
- [4.22e Preview card](./ds-specs/4.22e-preview-card.md)
- [4.22f Preview panel](./ds-specs/4.22f-preview-panel.md)
- [4.22g Readiness card](./ds-specs/4.22g-readiness-card.md)
- [4.22h0 Section nav（側欄分節導覽，2026-08-17）](./ds-specs/4.22h0-section-nav.md)
- [4.22h1 Stat row · Meter list · Day bars（總覽階段主卡的三支，2026-08-17）](./ds-specs/4.22h1-stat-row-meter-list-day-bars.md)
- [4.22h Empty card](./ds-specs/4.22h-empty-card.md)
- [4.22i Notification matrix](./ds-specs/4.22i-notification-matrix.md)
- [4.22j Completeness meter](./ds-specs/4.22j-completeness-meter.md)
- [4.22k Insight row](./ds-specs/4.22k-insight-row.md)
- [4.22l List footer](./ds-specs/4.22l-list-footer.md)
- [4.22m Message composer](./ds-specs/4.22m-message-composer.md)
- [4.22n Char counter](./ds-specs/4.22n-char-counter.md)
- [4.22o Token chip](./ds-specs/4.22o-token-chip.md)
- [4.22p Event preview card](./ds-specs/4.22p-event-preview-card.md)
- [4.23 Table](./ds-specs/4.23-table.md)
- [4.24 Chart](./ds-specs/4.24-chart.md)
- [4.24b Earnings waterfall](./ds-specs/4.24b-earnings-waterfall.md)
- [4.25 Bento grid](./ds-specs/4.25-bento-grid.md)
- [4.26 Dropdown menu](./ds-specs/4.26-dropdown-menu.md)
- [4.27 Product list](./ds-specs/4.27-product-list.md)
- [4.28 Project list](./ds-specs/4.28-project-list.md)
- [4.29 Payout bank picker & dialog](./ds-specs/4.29-payout-bank-picker-dialog.md)
- [4.29c Restock order (table)](./ds-specs/4.29c-restock-order.md)
- [4.48 Store settings page](./ds-specs/4.48-store-settings-page.md)
- [4.49 Review row](./ds-specs/4.49-review-row.md)
- [4.50 KV list](./ds-specs/4.50-kv-list.md)
- [4.51 Stock bar](./ds-specs/4.51-stock-bar.md)
- [4.51b Progress timeline](./ds-specs/4.51b-progress-timeline.md)
- [4.51c Points QR card](./ds-specs/4.51c-points-qr-card.md)
- [4.52 Detail rail](./ds-specs/4.52-detail-rail.md)
- [4.53 Nest](./ds-specs/4.53-nest.md)
- [4.54 Stock readout](./ds-specs/4.54-stock-readout.md)
- [4.54b PDP preview（粉絲端商品頁鏡像）](./ds-specs/4.54b-pdp-preview.md)
- [4.55 Restock log（✝ 2026-09-11 退場）](./ds-specs/4.55-restock-log.md)
- [4.56 Stock tip](./ds-specs/4.56-stock-tip.md)
- [4.90 List toolbar](./ds-specs/4.90-list-toolbar.md)
- [4.91 Funding panel](./ds-specs/4.91-funding-panel.md)
- [4.?? Owner lookup](./ds-specs/4.??-owner-lookup.md)
- [4.92 Artist picker](./ds-specs/4.92-artist-picker.md)
- [4.93 Benefit matrix](./ds-specs/4.93-benefit-matrix.md)
- [4.93b Tier overview](./ds-specs/4.93b-tier-overview.md)
- [4.94 Brand card](./ds-specs/4.94-brand-card.md)
- [4.95 Chart tip](./ds-specs/4.95-chart-tip.md)
- [4.96 Checkbox](./ds-specs/4.96-checkbox.md)
- [4.97 Detail sheet](./ds-specs/4.97-detail-sheet.md)
- [4.98 Explainer](./ds-specs/4.98-explainer.md)
- [4.99 Fans guide](./ds-specs/4.99-fans-guide.md)
- [4.100 Inline edit（已退場・墓碑檔）](./ds-specs/4.100-inline-edit.md)
- [4.101 Manage IP](./ds-specs/4.101-manage-ip.md)
- [4.102 Media vault](./ds-specs/4.102-media-vault.md)
- [4.103 Perf rank](./ds-specs/4.103-perf-rank.md)
- [4.104 Sortable](./ds-specs/4.104-sortable.md)
- [4.105 Numeric stepper（`.zstep`）](./ds-specs/4.105-numeric-stepper.md)
- [4.106 Sticky actions](./ds-specs/4.106-sticky-actions.md)
- [4.107 Toast](./ds-specs/4.107-toast.md)
- [4.108 Vault share](./ds-specs/4.108-vault-share.md)
- [4.109 Wizard split](./ds-specs/4.109-wizard-split.md)
- [4.110 Zselect](./ds-specs/4.110-zselect.md)
- [4.111 Finding card](./ds-specs/4.111-finding-card.md)
- [4.112 Source status](./ds-specs/4.112-source-status.md)
- [4.113 Auth shell](./ds-specs/4.113-auth-shell.md)
- [4.114 Ticket tier card](./ds-specs/4.114-ticket-tier-card.md)
- [4.115 Size chart editor](./ds-specs/4.115-size-chart-editor.md)
- [4.116 Ticket preview](./ds-specs/4.116-ticket-preview.md)
- [4.117 Session list（含 Product list 的群組列）](./ds-specs/4.117-session-list.md)
- [4.118 Entry list](./ds-specs/4.118-entry-list.md)
- [4.119 Review status](./ds-specs/4.119-review-status.md)
- [4.120 Source import](./ds-specs/4.120-source-import.md)
- [4.121 Field source tag](./ds-specs/4.121-field-source-tag.md)
- [4.122 Quick result list](./ds-specs/4.122-quick-result-list.md)
- [4.202 Avatar](./ds-specs/4.202-avatar.md)
- [4.203 Roster picker](./ds-specs/4.203-roster-picker.md)
- [4.204 Row disclosure（可展開子列）](./ds-specs/4.204-row-disclosure.md)
- [4.205 Listing controls](./ds-specs/4.205-listing-controls.md)
- [4.206 Link field](./ds-specs/4.206-link-field.md)
- [4.207 Stock allocation](./ds-specs/4.207-stock-allocation.md)
- [4.208 Stock history（庫存歷史紀錄）](./ds-specs/4.208-stock-history.md)
- [4.209 State check（狀態勾）](./ds-specs/4.209-state-check.md)
- [4.210 Lock sets（鎖定套數）](./ds-specs/4.210-lock-sets.md)
- [4.211 Profile avatar row（頭像列）](./ds-specs/4.211-profile-avatar-row.md)
- [4.212 Social links（社群連結清單）](./ds-specs/4.212-social-links.md)
- [4.213 Bundle preview card（組合包預覽卡）](./ds-specs/4.213-bundle-preview-card.md)
- [4.214 Section tabs（分節分頁）](./ds-specs/4.214-section-tabs.md)
- [4.215 Fan event page（粉絲視角活動頁，前台 shop-item 鏡像）](./ds-specs/4.215-fan-event-page.md)
- [4.216 Publish stage（發布前預覽確認的全頁畫面）](./ds-specs/4.216-publish-stage.md)
- [4.217 Calc list（算式列表）](./ds-specs/4.217-calc-list.md)
- [4.218 Fan product page（粉絲視角商品頁，前台 shop-item 商品分支鏡像）](./ds-specs/4.218-fan-product-page.md)
- [4.219 Fan bundle page（粉絲視角組合包頁，前台 shop-item 兩個組合分支鏡像）](./ds-specs/4.219-fan-bundle-page.md)
- [4.220 Fan project page（粉絲視角專案頁，前台共創／預購頁與標題頁鏡像）](./ds-specs/4.220-fan-project-page.md)
- [4.221 Info sections（✝ 2026-10-05 退場）](./ds-specs/4.221-info-sections.md)
- [4.222 Rich body（描述區塊編輯器：文字／圖片／影片區塊）](./ds-specs/4.222-rich-body.md)
- [4.223 Follow field（跟隨／另設的時間列）](./ds-specs/4.223-follow-field.md)
- [4.224 Size mix（各尺寸占比）](./ds-specs/4.224-size-mix.md)
- [4.225 Demand table（市場需求表）](./ds-specs/4.225-demand-table.md)
- [4.226 Demand focus（選定對象面板）](./ds-specs/4.226-demand-focus.md)
- [4.227 Condition list（條件清單）](./ds-specs/4.227-condition-list.md)
- [4.228 Venue map（活動地點地圖）](./ds-specs/4.228-venue-map.md)
- [4.229 Vault item task（媒體庫第二層：每件內容的任務）](./ds-specs/4.229-vault-item-task.md)
- [4.230 Vault overview（媒體庫總覽分頁）](./ds-specs/4.230-vault-overview.md)
- [4.231 Vault access（媒體庫存取權限分頁）](./ds-specs/4.231-vault-access.md)
- [4.232 Staged change（就地編輯的暫存標記）](./ds-specs/4.232-staged-change.md)
- [4.233 Section outline（長表單的本頁大綱）](./ds-specs/4.233-section-outline.md)
- [4.234 Limit set（限購）](./ds-specs/4.234-limit-set.md)
- [4.235 Price ladder（價格階梯）](./ds-specs/4.235-price-ladder.md)
- [4.236 Member table（組合物表）](./ds-specs/4.236-member-table.md)
- [4.237 Form ask（問句式設定塊與標題列讀數）](./ds-specs/4.237-form-ask.md)
- [4.238 Date range（日期區間篩選）](./ds-specs/4.238-date-range.md)
- [4.239 Code picker（優惠碼選擇欄）](./ds-specs/4.239-code-picker.md)
- [4.240 Rules group（購買條件群組）](./ds-specs/4.240-rules-group.md)
- [4.241 Form steps（同一張表單分步顯示）](./ds-specs/4.241-form-steps.md)
- [4.242 Media preview（單件媒體預覽）](./ds-specs/4.242-media-preview.md)
- [4.243 Fan phone（建立流程右欄的粉絲頁手機版鏡像框）](./ds-specs/4.243-fan-phone.md)
- [4.244 Member picker（組合物挑選：空狀態大按鈕＋多選彈窗）](./ds-specs/4.244-member-picker.md)
- [4.245 Vault list（媒體庫左欄庫房列表）](./ds-specs/4.245-vault-list.md)
- [4.246 Vault stage（媒體庫主欄：標頭、成效三格、內容卡片）](./ds-specs/4.246-vault-stage.md)
- [4.247 Vault open（媒體庫開啟方式：條件開啟、鑰匙開啟兩個開關）](./ds-specs/4.247-vault-open.md)
- [4.248 Vault wizard（媒體庫三步建立流程）](./ds-specs/4.248-vault-wizard.md)

## Pillar 5 · Pattern

> Cross-component behavior conventions. Per DSS v1.4: layout patterns / voice / accessibility / interaction states / data viz live here, NOT in Component (which only defines per-component variants/states).

### 5.1 Pattern cards

Best-practice assembly recipes — how components combine to meet a creator's goal. A Pattern is not a component (Pillar 4) and not a wireframe (the page implementation). Each card has five grids: `trigger` (when to use) / `must` (≥2 non-negotiables) / `should` (advisable) / `must-not` (anti-patterns) / `_edge-cases` (empty / error / new-user / mobile / offline). Four categories, twelve cards（頁面級 5 張＋中間層 4 張，2026-07-08；2026-07-20 新增 Detail + persistent rail，共十張；2026-09-08 新增 Destructive confirm，共十一張）。Component sections demo the unit only — assembly rules live here（判準見 §4.0）。

**html 對照（本輪拆頁）** — `design-system.html` 這輪把原本擠在一張表格裡的十張卡拆成十個獨立小節，每個都掛了可跳轉的錨點、並用真元件渲染出組合實例＋「實際使用頁」連結；下方每張卡的標題都補上編號與對應錨點 id，方便對照。html 端的 Trigger／Must 是精簡過的展示文案，語意與下方全文版一致，不是另一套規則。

| # | Pattern | html 錨點 |
|---|---|---|
| 5.1.1 | Dashboard home | `#pattern-dashboard` |
| 5.1.2 | Tabbed section view | `#pattern-tabbed` |
| 5.1.3 | Filter + list | `#pattern-filter-list` |
| 5.1.4 | Lifecycle states | `#pattern-lifecycle` |
| 5.1.5 | Multi-step wizard | `#pattern-wizard` |
| 5.1.6 | Form assembly | `#pattern-form-assembly` |
| 5.1.7 | Settings page | `#pattern-settings` |
| 5.1.8 | Modal shell | `#pattern-modal` |
| 5.1.9 | Split preview | `#pattern-split-preview` |
| 5.1.10 | Detail + persistent rail | `#pattern-detail-rail` |
| 5.1.11 | Destructive confirm | `#pattern-destructive-confirm` |
| 5.1.12 | Export confirm | `#pattern-export-confirm` |

#### 5.1.1 Dashboard home (Layout) · `#pattern-dashboard`

- **trigger**: The landing surface after login — the creator needs a one-glance read of money, alerts, and what to do next.
- **must**: Lead with the full-bleed Hero band, then a KPI bento row (earnings / pending / fans / live items) using `KPI` (headline metric carried by display size, not colour); pair an `Alert` panel ("Actions needed") beside a `Data list` of recent earnings; every money figure states its state (available vs pending) inline.
- **should**: Follow with a trend `Chart` + source breakdown pair; keep orange for one structural accent per viewport (hero fill OR a single highlight tile, not both competing).
- **must-not**: Never stack two orange highlight tiles side by side; never show a bare number without its currency + state; never push primary actions below the fold.
- **_edge-cases**: `empty` → first-run hero with "Create your first project" CTA, KPI tiles show `—` not `0`; `error` → KPI tile shows last-known value + a stale badge; `new-user` → checklist card replaces the trend pair; `mobile` → bento collapses to span-12 single column; `offline` → KPI tiles dim, banner "Showing last synced data".

#### 5.1.2 Tabbed section view (Layout) · `#pattern-tabbed`

- **trigger**: One entity has parallel sub-views of the same dataset (Earnings: Overview / Transactions / Payouts / Tax · E-Shop: Products / Bundles / Auctions · Projects status · Fans views).
- **must**: Use `Tabs` with one active panel; sync the active tab to the URL hash so a view is deep-linkable; each panel opens with its own KPI row scoped to that view.
- **should**: Keep filters (`Chip` group) and export/primary actions in a sticky sub-header inside the panel; preserve scroll position per tab.
- **must-not**: Never load all panels' data eagerly; never let a tab switch silently drop an in-progress filter without telling the user.
- **_edge-cases**: `empty` → panel shows an `Empty stub` scoped to that tab; `error` → inline `Alert --row` at panel top, other tabs still usable; `new-user` → default to the most-actionable tab (Overview); `mobile` → tabs become a horizontally scrollable strip; `offline` → disable Export, keep read views.

#### 5.1.3 Filter + list (Interaction) · `#pattern-filter-list`

- **trigger**: A long, filterable record set the creator scans and acts on (Earnings transactions, payouts, products, fans).
- **must**: Single-select `Chip` group drives a `Data list` (row-divider, not card-per-row); the active filter and result count are always visible; clearing all filters returns to the full set.
- **should**: Make filtering client-side-instant where the set is loaded; offer a Manual entry / Export affordance at the list header.
- **must-not**: Never apply a filter without updating the visible count; never hide the "active filter" state so a user mistakes a filtered list for the whole.
- **_edge-cases**: `empty` (no records) → `Empty stub` with the relevant create action; `error` → keep the filter bar, show retry in the list body; `new-user` → seed with a sample row + dismissible hint; `mobile` → filters collapse into a sheet; `offline` → freeze the set, disable mutating actions.

#### 5.1.4 Lifecycle states (Lifecycle / State) · `#pattern-lifecycle`

- **trigger**: Any data region that can be empty, loading, or failing — applies to every list, KPI, chart, and panel.
- **must**: Define all three of **Empty / Loading / Error** for the region; Empty uses the `Empty stub` with a single clear next action; Error uses `Alert --row` with a retry and never blanks already-loaded data.
- **should**: Use skeleton placeholders that match the final layout for Loading; distinguish "empty because new" (onboarding tone) from "empty because filtered" (clear-filter tone).
- **must-not**: Never show a spinner with no layout context; never replace a transient error with a full-page wipe; never use a toast as the only error signal.
- **_edge-cases**: `empty` → see Empty copy in §5.2; `error` → preserve last-known values + stale marker; `new-user` → onboarding-flavored empty; `mobile` → empty illustration scales down, copy stays; `offline` → dedicated "No connection" empty distinct from "No data".

#### 5.1.5 Multi-step wizard (Workflow) · `#pattern-wizard`

- **trigger**: A create flow with 3–4 dependent steps (create-project 4-step · create-event 3-step · create-product 4-step).
- **must**: Use the `wizard-focus` template (no main topbar) with a centered `stepper`, `Selection card` grids for branching choices, and a sticky bottom action bar (Back / Save draft / Next); save a draft at every step so progress is never lost.
- **should**: Show a Review step before commit that restates money / royalty / IP-rental disclosures; disable Next until the step's required fields validate (on-blur).
- **must-not**: Never trap the user (always offer Save draft + exit); never advance past a step with unresolved financial or licensing disclosures; never reset earlier steps when navigating back.
- **_edge-cases**: `empty` → step 1 prefilled with sensible defaults; `error` → validation inline on the offending field, stepper marks the step; `new-user` → first step carries a one-line explainer; `mobile` → stepper condenses to "Step 2 of 4", action bar stays sticky; `offline` → draft saves locally, banner "Will sync when back online".

#### 5.1.6 Form assembly (Workflow) · `#pattern-form-assembly`

- **trigger**: Any create / edit form — wizard steps, settings forms, create-product / -event / -project sections.
- **must**: Every field is a `Field`（label + optional hint + exactly one control slot; the control reuses an atom — Input / Switch / Segmented / textarea）; group fields into `Form section`s（title + grey sub; sibling sections auto-divide via the component's own `+` rule; base gap 6 / field spacing 16）；side-by-side fields use `Form grid`, never hand-rolled columns. **Section 切分＝一個 section 一個決定**（2026-09-01 自 create-product 抽取）：切區依「創作者要做的決定」不依欄位型別——價格與折扣是兩個決定就是兩個 section，庫存與逐規格表分開；判別句：「這個 section 的標題能不能一句話回答『這區在決定什麼』」。**條件分支控顯隱、不重排**：跨型分支（實體／數位／多規格）用 `data-*-show` 控 section 顯隱，section 順序恆定、絕不為分支建第二份表單；間距規則跨越 `[hidden]`（`~` 規則）。**Section 內分層階梯固定四級**：`__head`（title 必有）→ `__subhead`（僅當同一決定下有兩群欄位）→ `form-grid`／`field` → `nest`（卡中卡，僅補充性子塊）——用不到的層級跳過，不得自創第五級。**改變路由的動作**（如類型切換）放第一個 section 的 `__head--actions` 右端，不混進表單體。 建立流程的 `.wizard__sheet--sectioned` 使用 `--surface-page` 作底；`.form-section--outlined` 以 `--card` 填色形成區塊（亮暗一致；dark 原用 `--muted`、2026-07-17 midnight 改 `--card`）（**無外框線**，Q14），所有可見 outlined siblings 以 `--sp-24` 間隔並跨越 `[hidden]`。採用頁為 create-product／-auction／-bundle／-event／-project／register-ip／admin-ip-bank-entry。
- **should**: **Section 順序照商品的生命敘事**（create-product 的驗證序，其他建立流程沿用、依產品語意跳過不適用的環節）：識別（它是什麼）→ 呈現（素材）→ 交付物（內容檔案）→ 售賣條件（規格 → 價格 → 折扣 → 庫存）→ 履約（交付／取貨）→ 購買規則（限購）→ 發現（標籤、關聯）→ 保障（結帳與保障）；**上架這類「看著成品才做的決定」放右欄預覽卡下方**（split-preview 頁型，見 5.1.9），不排進左欄敘事。Section 的 `__sub` 只在需要說服或解釋規則時出現（素材、取貨有；價格、標題不用）。Order fields identity → content → settings → risk disclosures; put character counts as right-aligned `field__hint--count`（form-section scope）; keep one sticky action bar per form for save / next.
- **must-not**: Never hand-roll a label/hint stack outside `.field`; never nest a second heading system inside a section; never mix card-wrapped and no-card sections in the same flow.
- **_edge-cases**: `empty` → fields show placeholders, never pre-filled fake data; `error` → inline validation on the field, section stays open; `new-user` → first section carries a one-line explainer; `mobile` → `Form grid` collapses to single column; `offline` → draft-save locally（同 wizard）.

#### 5.1.7 Settings page (Layout) · `#pattern-settings`

- **trigger**: A page of read-mostly toggles and account values（Settings 主頁、店鋪設定、通知設定）.
- **must**: Group destinations with `Settings nav`; each group renders as a card of stacked `Settings row`s（last row no divider — owned by the component）; each row's right slot holds exactly one control（Switch / value text / Badge）.
- **should**: Per-row instant apply **or** one card-level save — pick one per card; risky rows（刪除、停用）isolate at the bottom in their own card.
- **must-not**: Never mix instant-apply and save-button rows in the same card; never put two controls in one row's right slot; never bury a destructive action mid-list.
- **_edge-cases**: `empty` → hide the group, not an empty card; `error` → row-level inline `Alert --row`; `new-user` → defaults pre-selected, no forced tour; `mobile` → nav collapses above the cards; `offline` → toggles disabled with a stale banner.

#### 5.1.8 Modal shell (Interaction) · `#pattern-modal`

- **trigger**: Any interruptive, complete-one-thing task — request payout, broadcast message, new product post, manual entry.
- **must**: Reuse the single canonical dialog chrome（`.payout-dialog` head / body / foot, `payout-modal.css`）+ backdrop + `is-modal-open` scroll-lock; destructive / money actions add a confirm gate before commit.
- **should**: Focus-trap inside the dialog; primary action right-aligned in the foot; body reuses Field / Data-list rather than bespoke layouts.
- **must-not**: Never roll a new modal chrome per feature; never stack two modals; never let backdrop-click discard unsaved money input without confirm.
- **_edge-cases**: `empty` → open with sensible defaults; `error` → inline `Alert --row` inside the body, dialog stays open; `new-user` → helper line under the title; `mobile` → dialog goes full-width bottom-sheet-like; `offline` → submit disabled with reason.

#### 5.1.9 Split preview (Layout) · `#pattern-split-preview`

- **trigger**: Editing where the creator needs a live fan-side view — create-product / create-auction preview, e-shop "See as fan", store settings.
- **must**: A right `Preview column` / `Preview panel` **compresses** the main column（no scrim, not an overlay — the form stays interactive）; entry point is "See as fan" / auto in create flows; closing restores the main width; the card inside reuses `Preview card`（`.is-empty` placeholders for unfilled fields）.
- **should**: Keep the preview sticky while the form scrolls; re-render on field input, not on save.
- **must-not**: Never make the preview a modal that blocks editing; never let preview content drift from form state; never fake data in the preview（用 `.is-empty` 占位）.
- **_edge-cases**: `empty` → preview shows the placeholder card; `error` → preview keeps last valid render; `new-user` → preview visible by default in create flows; `mobile` → preview collapses behind a toggle; `offline` → preview still renders（純前端）.

#### 5.1.10 Detail + persistent rail (Layout) · `#pattern-detail-rail`

- **trigger**: An entity page where editing is split across tabs, but a handful of read-only facts must never leave view — product detail (stock on hand, delivery method, linked project); any future detail page with the same shape.
- **must**: Wrap the page in `.page.page--narrow`（1056px 窄版容器，§6.1——1280 的預設寬度配上 300px 右欄會讓左欄行長過長）; use the `Detail rail` shell (§4.52) — editable `Tabs` inside `.detail-main`, `.detail-rail` on the right holding **read-only** `Form section` cards built from `KV list` (§4.50) / `Stock bar` (§4.51) / `KPI`. The rail answers "what do I need to know before I change something", so it carries constraints and consequences, never the fields being edited. Every rail card must make sense from **every** tab — anything meaningful in only one tab belongs in that panel instead.
- **should**: Cap the rail at 3–4 cards（會捲動的右欄就不再是常駐）; order them by how often they block a decision (stock before provenance); pair every bar or meter with its exact figure（見 §4.51）; keep rail cards short enough that the head's tightened `--sp-12` spacing reads as deliberate.
- **must-not**: Never put a primary action or the only entry point to a task in the rail — below 1100px it falls in under the main column and stops being visible alongside the content; never make a rail value editable in place（可編輯就該回到主欄的 `.field`）; never add per-card margins inside the rail（間距由 `.detail-rail` 的 `gap` 擁有，見 §4.52 Notes）。
- **_edge-cases**: `empty` → a rail card with no data shows an em-dash value, never disappears (a vanishing card changes the page's shape between tabs); `error` → the card keeps its last-known value with a stale marker rather than blanking; `new-user` → rail renders with placeholder values so the layout is learnable from the first visit; `mobile` → single column, rail after main, so nothing in it may be the only route to a task; `offline` → rail values dim and carry a "last synced" note.

#### 5.1.11 Destructive confirm (Interaction) · `#pattern-destructive-confirm`

2026-09-08 建，第一個消費者是訂單詳情的「作廢品項」（`order-detail.html` 的 `#od-void-modal`）。站上原本每個破壞性動作各自處置（刪除商品、刪草稿都在頁內註「確認流程待規格」、原型暫用原生 `confirm()`），這張卡把做法定下來：**沒有新的 modal CSS——它是既有 Modal shell（§5.1.8）加上 `.btn--destructive` 的組裝規則**，所以規則寫在 Pattern、不寫成元件。

- **trigger**: 一個按下去就收不回來的動作——作廢明細、刪除商品／草稿／活動、停用帳號。可逆的動作（存草稿、下架、切換顯示）不走這張卡，直接做完給 toast。
- **must**: 入口用 `.btn--ghost.btn--destructive`（紅字、不搶焦點），確認那一顆才是 `.btn--destructive`（透明底＋紅框紅字，Q37 2026-08-06 裁決）；彈窗重用 canonical 對話框殼（`.payout-modal` ／ `.payout-dialog` 頭／身／腳）；內容順序固定四段——**動到哪一項**（具體名稱與數量，不只說「這個項目」）→ **前置條件**（要先在別的系統做完什麼，例如「請先在 Stripe 完成人工退款」）→ **會發生什麼**（逐條列後果：憑證失效、庫存回補、寄信給誰）→ **不可逆**；完成後給 toast 說出實際發生了什麼，不是只說「成功」。
- **should**: 停用的入口按鈕保留在畫面上並用 `title` 說明為什麼不能按（不可作廢、沒有權限），不要直接隱藏——看不到的按鈕會被讀成「這個功能不存在」；後果條目照「使用者最在意的」排序（買家會收到什麼放最後一條，因為那是唯一會傳出去的動作）。
- **must-not**: 不可用原生 `confirm()`；不可把後果寫成一句籠統的「此操作無法復原」就了事；不可讓確認鈕成為整個彈窗唯一的視覺焦點以外的東西（不要同時放兩顆紅的）；不可在確認前就先改畫面狀態。
- **2026-10-15 補（目視檢查 C1，STYLE-DECISIONS Q134）**：確認鈕不得比入口弱——入口是 `.btn--ghost.btn--destructive` 時確認鈕照上面用 `.btn--destructive`（紅框）；入口已是淡紅底 `.btn--soft.btn--destructive`（Q 2026-09-11 清單列每列一顆的撤銷、訂單詳情頁首的整單撤銷）時，確認鈕用同一款淡紅底（同級）。**前置條件與不可逆兩段改用 `Alert --row`**（前置＝`--warning`、不可逆＝`--error`，放在原因欄上方），不再是兩行灰色 hint——它們是警告、不是說明。前置條件不適用時整條收起（例：免費訂單〔金額 0、不經金流〕不出現 Stripe 退款提醒）。首個消費者：`order-detail.html` `#od-void-modal`（單品與整單同一個視窗）。
- **2026-10-15 全站套用（Q134）**：活動詳情的共用確認視窗（`event-detail.html` `openConfirm()`，`danger:true`）所有破壞性動作的確認鈕一律 `.btn--soft.btn--destructive`——撤銷全部剩餘票券、撤銷單張票、下架活動、移除場次、捨棄變更（取消活動於 2026-10-20 D457 退場）。同一個視窗服務多個入口，確認鈕取最強入口那一級（撤銷全部剩餘票券的淡紅底），任何入口都不會比它重。自帶視窗、入口是紅框、ghost、選單項或圖示鈕的頁面（刪除商品、刪除草稿、刪除 IP 等）維持紅框確認鈕：與入口同級，符合本規則。
- **_edge-cases**: `empty` → 沒有可作廢對象時不開窗，入口本來就該停用；`error` → 失敗時彈窗留著、body 內用 `Alert --row` 說明，不要關窗吞掉；`new-user` → 不需要導覽，四段內容本身就是說明；`mobile` → 對話框滿寬，兩顆動作維持右對齊；`offline` → 確認鈕停用並說明原因。

#### 5.1.12 Export confirm (Interaction) · `#pattern-export-confirm`

2026-10-15 建（D416），第一批消費者是訂單管理的「匯出」（`orders.html`）與活動詳情交易明細的「匯出交易」（`event-detail.html`）。**沒有新的 modal CSS**——它是既有 Modal shell（§5.1.8）加上 `.zcheck`，由 `js/csv-export.js` 的 `ztorCsv.confirm()` 在第一次開啟時建立、整頁共用；CSV 本體由 `ztorCsv.build()` 在瀏覽器端產生並以 `ztorCsv.download()` 下載。

- **trigger**: 創作者已篩好一份清單、要把它拿成檔案——訂單管理、活動交易明細。檔案照目前的篩選結果，所以下載前先講會有幾筆。
- **must**: 重用 canonical 對話框殼（`.payout-modal`／`.payout-dialog--narrow`）；內容順序固定——**筆數**（「將匯出 N 筆訂單（照目前的篩選結果）」）→ 選填的個資核取框（`.zcheck`）與一行說明 → 腳（取消＝`.btn--ghost`、匯出＝`.btn--primary`）；核取框每次開窗都回到不勾，個資預設不外流；零筆時匯出鈕停用並講明沒有可匯出的內容。
- **should**: 檔名寫成「內容_活動名稱（交易明細才有）_起訖日期｜全部.csv」，依介面語言；表頭與列舉值（類型、狀態、付款方式）一樣走 i18n（`csv.*`）；金額純數字、無貨幣符號與千分位；沒有個資選項的匯出用一行說明講明（「收件資料不在這份匯出裡」），不放停用的核取框；匯出完給 toast 回報筆數。
- **must-not**: 不可從工具列按鈕直接下載；不可預設勾選個資核取框；不可用 `0` 代替「不適用」（空白才是沒有值）；不可在視窗裡另寫一套筆數算式——筆數取自頁面目前的篩選結果。
- **_edge-cases**: `empty` → 零筆時不能匯出；`error` → 原型不會失敗；真實版產檔失敗時視窗留著、body 內用 `Alert --row` 說明；`new-user` → 不需導覽；`mobile` → 對話框滿寬、兩顆動作右對齊；`offline` → 匯出鈕停用並說明。
- **匯出之後（2026-10-15 · D424 決定 3、4）**：按下匯出 → 視窗關閉 → 右下角 toast「匯出中…（N 筆）」（§4.107 `.ztor-toasts--corner`＋`--busy`）→ 約 1 秒後同一則原地轉「匯出完成 · N 筆訂單」並觸發下載，同一刻寫一筆**匯出紀錄**。統一走 `ztorCsv.run({ scope, name, count, filters, make })`，頁面不自己 setTimeout／download。背景產生的筆數門檻不另訂（D424 決定 3）。
- **匯出紀錄**：匯出鈕旁一顆次要按鈕（`.btn--ghost`＋`history` icon，「匯出紀錄」），開 canonical 對話框殼列出紀錄（`ztorCsv.openLog({ scope, title })`）——一筆一列 `.data-list__row`：標題＝檔名；第一行小字＝時間 · 誰（創作者本人＝名稱 · 創作者；Admin 代管＝Admin · 代管 名稱）；第二行＝篩選條件 · 筆數。新的在上、沒有紀錄時一句空狀態。創作者與 Admin 都看得到（D424 決定 4）；原型存 localStorage（`ztor.export.log`，重新整理保留）。篩選條件存結構（標籤 key＋值 key），顯示時才翻譯。
- **must-not（追加）**：匯出中提示不可放底部中央（會擋住清單）；完成不可另開第二則 toast；紀錄不可只記檔名——誰、何時、篩選條件、筆數缺一不可。
- **2026-10-28 改版（使用者：「匯出紀錄可以在這（匯出視窗）查看，工具列就不用放」，先想 UX 再做 UI；UI-CHANGES 三百七十七）**：工具列的「匯出紀錄」鈕退場（訂單管理、活動詳情交易明細兩處），紀錄改列在匯出視窗下半部。視窗由 `--narrow` 回到預設 620px。body 兩塊（`ds-components/export-dialog.css`）：
  - `.export-summary`：大字筆數（`__num`，`--fs-28` 數字字型）＋單位，下一行「照目前的篩選結果：{篩選條件}」——篩選條件用匯出紀錄同一種寫法（`filterText`），按匯出前不必回頭看清單上方開了哪些篩選。
  - `.export-history`（版本閘 O42 關閉時整塊不出現）：上緣一道 `--border-soft` 細線和上半部分開；標題＋一句說明；最近 3 筆 `.data-list__row`，多於 3 筆時「顯示全部 N 筆」就地展開／收回；和這次篩選相同的紀錄右側 `.badge--neutral`「同樣的篩選」（比對時不看「收件資料」那一項——它是匯出選項、不是篩選），讓人按匯出前就看得到剛剛是不是已經匯過同一份。沒有紀錄時一句「還沒有匯出過，這次匯出後會記在這裡」。
  - 主鈕寫筆數「匯出 N 筆」（零筆時停用、寫「匯出」）。`ztorCsv.confirm()` 多收 `scope`、`filters`；`openLog()` 保留給舊呼叫，頁面已不用。

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
- **可點卡片 hover**（2026-10-20，使用者指示，全站同一個答案；取代 Q5 原「借 `--shadow-float` 浮起」）：
  - 適用：卡片**整張臉是一個點擊區**（導頁、開編輯、開彈窗、選一個選項）。
  - 效果：`transform: translateY(var(--clickable-card-lift))`（−4px，2px 在卡片陰影底下看不出來）＋ `background: var(--clickable-card-hover-bg)`（別名 `--control-raise-hover`，按鈕 hover 階：深色 `rgba(222,223,233,.12)`／亮色 `var(--accent)`）。**不換邊框、不換陰影。**
  - `prefers-reduced-motion: reduce`：不位移（底色照換）。
  - 已選的卡（`.x--active`／`.is-active`／`--selected`）只上浮、保留自己的已選底色（`:not(...)` 排除，不另換底）。
  - token：`--clickable-card-lift`（`-4px`）、`--clickable-card-hover-bg`，定義在 `_tokens.css` 亮暗兩個主題區塊（別名要在暗色區塊重宣告才吃得到暗色的 `--control-raise-hover`）。
  - 消費者（位移＋底色）：`.ztor-card--clickable`（`card.css`）、`a.card[href]`／`button.card`（`card.css`，IP Market 的 `<a class="card ipm-card">`）、`.tier-card--clickable`（`ticket-tier-card.css`）、`.project-card`（`shared.css`）、`.selection-card`（`selection-card.css`）、`.radio-cards .segmented__btn`（`radio-card.css`）、`.kpi--tappable`（`kpi.css`）、`.vault-ovcard`（`media-vault.css`）、`.vshare__opt`（`vault-share.css`）、`.payout-bank-card`／`.payout-bank-option`（`payout-modal.css`）、`.live-item`（`live-item.css`，首頁的 `<a class="card live-item">`）。
  - 只吃位移：`.canvas-start__card`（`canvas-home.css`，底色是照片上的 `--on-media` 薄膜）。
  - 前提：`js/reveal.js` 會在卡片進場後 1.4 秒卸掉 `.reveal`／`.is-in`／行內 transition-delay。被標到的 `.card`／`.kpi` 原本被 `html.reveal-on .reveal.is-in { transform: none }`（權重更高）與 `.kpi.reveal` 的 kpiRise 動畫（fill-mode both 釘住 transform）擋住，hover 位移出不來；新增會被 reveal 標到的可點卡片不用另外處理。
  - 不套用（各有自己的 hover 語彙）：清單／表格列（`.product-list__row`〔Q34〕、`.data-list__row--go`、`.alert--card[data-go]`、`.vault-row`、`.pickup-select__row`）；按鈕、chip、`.check-card` 膠囊；虛線的新增／投放格（`.upload-tile`、`.cb-add-tile`、`.payout-bank-card--add`）；縮圖畫廊（`.vault-tile`；`.work-card` 只動封面）；卡內另有按鈕、整張非點擊區的卡（`.brand-card`，hover 陰影升級為存量）；`.alert--banner[data-go]`（實色 banner）；粉絲端鏡像 `.fep-shop`（`.pdp-rec-card` 等）；照片上的 `.canvas-stage__pick`、`.issue-panel--compact .issue-card`（列＋玻璃 hover）。
  - 新增「整張可點的卡」時：直接寫這兩行（用 token，不寫數值），並登錄到本條消費者清單。
- **Lifecycle states** (see the Lifecycle pattern card in §5.1):
  - **404** — same chrome, single "Page not found" headline, link back to Dashboard.
  - **Empty stub** (`.empty-stub`) — routes not yet built (orange mark + display title + spec refs).
  - **Error** — inline `Alert --row`, retry available, already-loaded data preserved.

### 5.4 Data Visualization

R 2.2 chart family lives in [`ds-components/chart.css`](./ds-components/chart.css). Three sub-patterns:

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

### 6.0.1 表面階層：疊上去的一層要比父層亮（Q66，2026-08-13）

模型出自 Figma `856:27798`（`design-layers.html` 是它的定案示範頁，2026-09-16 起只吃正式 `--layer-*` token；階梯總表、四階相套、疊到第幾層停、三條相關規則實例都在那一頁）：**L0 畫布實色 → L1 卡片實色 → L2 半透明薄膜（疊在誰身上就跟著誰亮一階）→ L3 不再疊填色、只留線框**。

**兩個方向相反的角色，不要混用**：

- **分組面（疊上去的一層）往亮**：`--nest-surface`（深色 `rgba(222,223,233,.04)`／亮色 `transparent`）＋ `--nest-line`（深色 `transparent`／亮色 `rgba(16,17,20,.08)`）。消費者：`.nest`（模式切換長出來的整層）、`.card--muted`（卡片裡的一段分組）、`.bd-sec`（組合包彈窗的分卡）。亮色兩層同為白，靠 `--nest-line` 才分得出來。
- **凹槽與襯底往暗**：`--muted` `#161718`。消費者：`.segmented` 的軌道（軌道凹、滑塊才浮）、媒體井（圖片未載入的佔位格）、進度條底。**這一類不在翻向範圍**。

- **控件（浮在表面上的按鈕）往亮**：`--control-raise`（深色 `rgba(222,223,233,.04)`／亮色 `var(--card)`）。消費者：`.btn--outline`。**不要用絕對表面色**——寫死 `--card` 時，同一顆按鈕在畫布上比底亮、在卡裡同色、在 L2 分組面裡反而更暗（Q67）。
- **可點卡片 hover（上浮＋換底）**：`--clickable-card-lift`（`-4px`）＋ `--clickable-card-hover-bg`（別名 `--control-raise-hover`，所以也是「往亮」的控件階）。亮暗兩個主題區塊都宣告。消費者與例外見 5.3「可點卡片 hover」。

判斷句：這塊東西是「疊在容器上的一層」還是「容器上挖出來的一個凹槽」？前者往亮，後者往暗。控件一律往亮。

**`.form-section--outlined` 是頁面層的分組，不放進卡或彈窗**：它吃絕對色 `--surface-shell` `#1C1D1E`，坐在畫布 `#0C0D0D` 上方向正確，但比 `--card` `#212223` **暗**——放進卡或彈窗就會往下沉一階。卡／彈窗內要分組，用上面那組往亮的。

證據與稽核：`docs/階層稽核-2026-08-13.md`（53 頁逐頁量合成後亮度）、STYLE-DECISIONS Q24／Q42／Q66。

### 6.0.2 卡內分組的間距階梯（Q71，2026-08-25）

同一條「多組資訊要不要疊層」的判準軸線，分頁面級（L0，直接畫在畫布上）與卡片級（L1，見 [Card group §4.133](./ds-specs/card-group.md)）兩種版面各自的定案間距值。判準本身、三級制（排版→線框→新層）見 Card group 條目，本節只記兩種版面各自的數字，供沒有現成元件可套、要手動疊間距時對齊。

**L0 畫布版**（直接落在畫布上、不是卡片內部）：

| 項目 | 值 | 說明 |
|---|---|---|
| 列距（同組內） | `--sp-40`（40px） | 卡片版是 14+14；L0 少了卡緣可以代替留白說話，值放大近三倍 |
| 組分隔線上下留白 | 各 `--sp-56`（56px） | 卡片版是各 32px |
| 組分隔線寬度 | 滿版（畫到畫布最外緣） | 讀成「跨過整個版面的斷點」，不是某一組自己的下框 |
| 組內內容左右內縮 | `--sp-16`（16px） | 線畫到最外緣、內容退進來一階，兩者才不會擠在同一條邊上 |

**卡片版（L1，`.card`/`.ztor-card` 內部）** — 完整定義見 [Card group §4.133](./ds-specs/card-group.md)，摘要：

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

- **12-col bento grid** (`.bento`) — primary layout for dashboard / earnings rows. Children use `.bento--span-{3,4,5,6,7,8,9,12}` to set columns. Below 900px breakpoint all children fall back to span 12 (mobile single-column). See [§4.25 Bento grid](./ds-specs/4.25-bento-grid.md).
- **Page container** — `max-width: 1280px`, centered; padding 32 24 96 (top-x-bottom).
- **`.page--narrow` 窄版變體** — `max-width: 1056px`（2026-07-20 Q21）。**用途**：只給「主欄＋右側常駐 meta 欄」的兩欄詳情頁（Detail rail §4.52）。**為什麼需要**：右欄固定 300px，容器若維持 1280，左欄會寬到行長過長、讀起來吃力；收成 1056 讓左欄回到舒適行長，右欄寬度不變。**基準不動**：其餘所有頁面維持 1280——Q21 原本裁定全站 1280→1056，同日經使用者實看結果後改為僅此變體套用。**Consumer**：`product-detail.html`、`order-detail.html`、`bundle-detail.html`、`auction-detail.html`（皆 `<div class="page page--narrow">`；後兩者 2026-07-27 改用同一套詳情頁殼）。定義在 `shared.css`。
- **Section vertical rhythm** — `mt-24` (24px) for top-level section gap; `gap: 16px` for bento children; `gap: 8px` for topbar action cluster.

### 6.2 Page Templates

R 2.2 has 5 canonical page templates. Each composes Pillar 4 components in a specific Pillar 6 structure:

| Template | Used by | Composition |
|---|---|---|
| **Dashboard** | [`index.html`](./index.html) | `app-topbar` → full-bleed `hero` carousel → `bento` (4 KPI) → `bento` (data-list + alerts panel) → `bento` (linechart + stacked-bar) → `bento` (3-column footer summary) |
| **Earnings (4-tab)** | [`earnings.html`](./earnings.html) | `app-topbar` → `page-intro` → `tabs` → 4 `tab-panel` (Overview / Transactions / Payouts / Tax) |
| **Wizard (focus mode)** | `create-project.html` / `create-event.html` / `create-product.html` | NO topbar → wizard chrome (close X + `stepper`) → step body → sticky bottom action bar |
| **Settings (sidebar)** | [`settings.html`](./settings.html) | `app-topbar` → `page-intro` → `.settings-layout` (250px sidebar nav + 1fr content with `settings-section` blocks) |
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

The DSS v1.4 standard is output-agnostic. Ztor Creator Studio · R 2.2 ships as CSS Custom Properties (the canonical implementation in [`ds-components/_tokens.css`](./ds-components/_tokens.css)). Below are equivalent representations for other targets.

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

Filled with Ztor Creator Studio · R 2.2's actual values where the 7-Pillar structure maps cleanly. Empty / per-need fields left as placeholders.

```json
{
  "record": {
    "name": "Ztor Creator Studio · R 2.2",
    "source": "Ztor Creator Studio (creator-economy operations dashboard)",
    "version": "R 2.2",
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

改版歷史在 [design-system-changelog.md](./design-system-changelog.md)。
