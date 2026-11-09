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

## 對照表：要做什麼、讀哪一份

設計系統分成三層，讀的順序固定：

1. **速查版** [ds-index.md](./ds-index.md)：每次動手前先掃。Pillar 1 速查列 token 與值，Pillar 4 速查列元件、主要 class、用途與規格檔。腳本產生，不手改。
2. **入口**（本檔）：要修改時先讀，含 Identity、Do / Don't、Quick Reference 與這張對照表。
3. **完整版**：照下表只讀需要的那一份。

| 要做的事 | 讀這份 |
|---|---|
| 只是用現成的 token 或元件 | [ds-index.md](./ds-index.md) 就夠，不必往下讀 |
| 改某一個元件 | ds-index.md 該元件列尾的 `ds-specs/` 規格檔 |
| 新增元件、改元件分類或總表 | [ds-pillars/4-component.md](./ds-pillars/4-component.md) |
| 改色彩、字級、間距、圓角、陰影、icon 等原始 token 的規則 | [ds-pillars/1-foundation.md](./ds-pillars/1-foundation.md) |
| 改語意角色（哪個色用在什麼角色）、控件尺寸、表面階層、暗色模式 | [ds-pillars/2-3-role-mode.md](./ds-pillars/2-3-role-mode.md) |
| 版型卡、文案語氣、狀態與互動、資料視覺化、流程 | [ds-pillars/5-pattern.md](./ds-pillars/5-pattern.md) |
| 網格、頁面模板、卡內間距階梯、頁首與 hero | [ds-pillars/6-structure.md](./ds-pillars/6-structure.md) |
| 實作說明、輸出格式、DSS JSON 骨架 | [ds-pillars/appendix.md](./ds-pillars/appendix.md) |
| 某個規則什麼時候改、為什麼改 | [design-system-changelog.md](./design-system-changelog.md) |

給人看的展示頁照同樣分法拆頁（2026-11-09）：`design-system.html` 是入口（Identity、Do / Don't、各頁導覽），每份 Pillar 一頁 `design-system-*.html`。

| AI 文件 | 對應的展示頁 |
|---|---|
| 本檔 | `design-system.html` |
| `ds-pillars/1-foundation.md` | `design-system-foundation.html` |
| `ds-pillars/2-3-role-mode.md` | `design-system-role-mode.html` |
| `ds-pillars/4-component.md`（分類與總表） | `design-system-components.html` |
| `ds-specs/` 各元件規格 | `design-system-components-*.html` 六頁，依目錄分組：basic、forms、lists、cards、flow、new |
| `ds-pillars/5-pattern.md` | `design-system-pattern.html` |
| `ds-pillars/6-structure.md`＋`appendix.md` | `design-system-structure.html` |

各頁共用的檔頭（樣式與元件 CSS）、左側目錄、檔尾（示範用 JS）各只有一份：`ds-head.js`、`ds-toc.js`、`ds-tail.js`。新增元件時：元件 CSS 加進 `ds-head.js` 的清單、demo 卡寫進對應分組那一頁、目錄在 `ds-toc.js` 加一行（連結寫「檔名#位置」）。

改了完整版的規則，同一輪照舊同步對應的展示頁；新增或刪除 `ds-pillars/` 的檔案時，這張表要一起改（`check_ds_sync.py` 檢查 17 會比對）。

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
  `.card` / `.kpi` / `.ztor-card` 預設用 `border: 1px solid var(--border)`，不用陰影。〔後續修訂：2026-07-26 STYLE-DECISIONS Q32 把 `.card`／`.kpi` 統一成陰影版（`border:0`＋`--shadow-card`＋`--shadow-edge-top`）；2026-08-28 換裝後卡片家族改為玻璃＋1px `--border`＋同組陰影，現行寫法見「表面材質原則」（Q77）〕
  只有可點／浮起的強調卡（`.ztor-card--clickable` hover、`.selection-card`）才有 hover 回饋；2026-10-20 起回饋改為「上浮＋底色換按鈕 hover 階」，不再升級陰影（見 5.3「可點卡片 hover」）。
- **Q4 控制項＝視覺邊線**
  `.input` / `.textarea` / `.select` 使用 `0 0 0 1px var(--border)` 陰影邊線，避免原生 border 影響控件尺寸。
  focus 改為 `--ring` 1px 邊線 + 4px 柔光環；`.ztor-metric-pill`、`.switch` 維持各自既有規則。
- **Q5 hover 浮起規則**
  **2026-10-20 使用者更新**：整張卡是一個點擊區的卡片 hover ＝ 上浮 `--clickable-card-lift`（4px）＋底色 `--clickable-card-hover-bg`（＝按鈕 hover 階 `--control-raise-hover`），不換邊框、不換陰影；原「借 `--shadow-float` / `--shadow-card-hover` 浮起」退場。完整定義、消費者與例外見 5.3「可點卡片 hover」。
  商品類清單列（`.product-list__row` 全部變體、`.project-list__row`）hover 浮成一張玻璃卡：`--ztu-glass-bg`＋`blur(var(--ztu-blur-glass))`＋`--radius-lg`＋`--shadow-lift-flat`／`--shadow-edge-top`（2026-07-26 STYLE-DECISIONS Q34 全站統一浮起，2026-08-28 換裝改玻璃材質）。表格類列（`.ztor-table`、`.data-list`、admin 表格）hover 只換底色，不浮起。
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

## Changelog

改版歷史在 [design-system-changelog.md](./design-system-changelog.md)。
