> 本檔是 [design-system.md](../design-system.md) 的 Pillar 2–3，入口與對照表在那裡。

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
- `.scanner-access__field + .scanner-access__field`：卡片底部的說明字不是 field，靠 `.mt-8` 貼近上方欄位，容器改 `gap` 會把距離從 8px 撐成 24px。
- `.rule + .rule`：同一組規則同時出現在 `create-event-legacy.html` 與 `js/ticket-bundle.js`，兩處容器不同，等舊頁退場再收。

### 2.4 Control sizes

按鈕與表單控件共用一套高度級（全部 4 的倍數），同尺寸的 input 與 button 對齊。高度一律走 `--control-h-*`，不寫死。

**2026-07-21（Q25）**：站上單行控件實際預設是 **`--control-h-sm`(36)**，不是刻度層標為 default 的 md(44)。此前 `.input` 靠 padding 撐開＝39px、`.btn` 是 36px，「同尺寸等高」只是文件宣稱；各元件各自調 padding 還長出 41.5／37.5／35.5 三種對不齊的搜尋框（盤點見 [docs/input高度盤點-2026-07-21.md](../docs/input高度盤點-2026-07-21.md)）。裁決後單行控件一律 `height: var(--control-h-sm)`，**新增控件禁止用 padding 湊高度**——`padding×2 + font-size×line-height` 幾乎必然算出小數。`.textarea` 例外（多行靠 padding ＋ `min-height:100px`）。

| Token | Height | Use |
|---|---|---|
| `--control-h-xs` | 32px | 表格密集列（`.variant-table .input`）／`.btn--sm`／compact toolbar。2026-09-11 由 28 調到 32（Q113，使用者：小控件要再高一點點、從 token 一次調），與 `.btn--icon.btn--xs` 的 32 邊長對齊 |
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

**token 名的 L2／L3 是亮度階，不是卡內第幾層**：卡內分組的順序照 Q161（2026-11-09）——第 2 層線框（`.control-group`，吃 `--layer-line`）、第 3 層填色（`.nest`，吃 `--layer-2-surface`）；Q66 的「L2 填色、L3 線框」順序作廢。

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
