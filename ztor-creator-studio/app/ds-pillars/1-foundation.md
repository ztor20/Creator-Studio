> 本檔是 [design-system.md](../design-system.md) 的 Pillar 1，入口與對照表在那裡。

> 速查版（token 名稱與值）見 [ds-index.md](../ds-index.md) 的「Pillar 1 速查」，由腳本從 `_tokens.css` 產生；本檔寫規則與理由。

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
| `locked-field-ink` | `color-mix(--muted-foreground 55%, transparent)` | **全站 disabled 欄位唯讀值的墨色（2026-08-09 兩輪定案）** — 寫法一律 `var(--locked-field-ink)`。第一輪只在來源鎖定欄位（`field-source-tag.css` 的 `.is-source-locked`）用；**第二輪（使用者裁示「整個元件庫只能有一個 disabled 樣子」）把它上收成 `input.css` 的 `.input:disabled`／`.textarea:disabled`／`.select:disabled` 全站基準**，`field-source-tag.css` 因此不再自己定義鎖定樣式（見 [Field source tag §4.121](../ds-specs/4.121-field-source-tag.md)）。全站最輕的文字。不直接把 `--faint-ink` 調更淡，是因為它同時是表頭墨色（10 支元件），表頭沒有要跟著變。**對比刻意低於 AA**：實測深色 `#606061` 對 `#1C1D1E` ＝ 2.69:1、亮色 `#AFAFAC` 對白 ＝ 2.20:1。成立前提是它只承載 disabled 的唯讀值，而不是本頁要讀的資訊——欄位標籤與「bookyay 帶入」來源標記都維持正常對比，「這格是什麼、為什麼不能改」靠那兩個回答。**不得**用在需要閱讀的文字上。**2026-09-11 起檢視態（`[data-mode="view"]`）的欄位也吃這支**：使用者裁示「全站檢視態都改成 disabled 外觀」——shared.css 的檢視態規則改成透明底＋本墨色＋not-allowed＋不可選取，幾何仍不動、屬性仍是 readonly；站上只有一種「鎖住」的樣子。**2026-09-21 起檢視態不再吃這支（Q119）**：檢視態的欄位改畫成純文字讀數（`.field-readout`，前景色），這支回到只承載 `:disabled` 控件（建立後鎖死的分類、來源鎖定欄位、`.linkf--disabled`）。**2026-10-12 起輸入框類的 `:disabled` 也不再吃這支（Q128，UI-CHANGES 一百七十六）**：`.input`／`.textarea`／`.select` 的 `:disabled` 與描述編輯器的鎖定改吃 `view-field-ink`（可讀）；這支只剩未選的鎖定選項卡（`check-card.css`、`field-source-tag.css` 的 segmented）與作廢連結 `.linkf--disabled` |
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

**這是什麼** — `site/r2.3` 從換皮沙盒 `demo/ztorui-skin` 熔接進來的一組新視覺語言：深色近黑檯面上的白色低透明玻璃、暖橘霧光、發光選中態。原料值集中定義在 `ds-components/_tokens.css:608–674`（`--ztu-*` 家族，28 支）＋同段內不加前綴的 `--bloom-surface`（規格書 §3.8 指名的字面），另有 `--font-dot` 定義在 `fonts.css`。上層語義 token（`--primary`、`--border`、`--shadow-card`…）改成引用這批原料，元件層再引用語義 token——原則不變，只是原料換了一批新值。詳細熔接對照見 [`docs/wave1-熔接紀錄.md`](../docs/wave1-熔接紀錄.md) 與 [`docs/wave2-熔接紀錄.md`](../docs/wave2-熔接紀錄.md)。

**淺色模式暫時關閉（2026-10-15，STYLE-DECISIONS Q135）**：原型一律深色展示。`js/theme.js` 的 `LIGHT_MODE_OFF = true` 讓已存偏好與 `?theme=` 都失效、切換入口全部收起；淺色 token 保留在 `_tokens.css` 的 `:root`，之後整站重做淺色時把常數改回 false、拿掉入口的 `hidden` 即可。

**⚠ 深色語彙、light 模式尚未調校** — 這整組原料是為 `[data-theme="dark"]` 的近黑畫布調的（白色低透明玻璃、深投影、暖橘光）。多數消費它們的元件規則（`.card`、`.btn--primary`、`.chip` 等）**不分主題、寫在基礎選擇器上**，所以 light 模式目前也會吃到同一批值——例如白色調上疊 5% 白玻璃幾乎不可見。這是 Wave 1 就已知並記錄的現況（light 模式調校排在後續波次），文件如實記載、不代為修正。

**表面材質原則（2026-08-28，STYLE-DECISIONS Q77）**：表面一律中性玻璃，顏色只出現在光與文字，不出現在面。

- 卡片家族（`.card`、`.kpi`、`.alert--bar`、`.readiness`、`.preview-card`、`.form-section--outlined`、`.list-toolbar`、`.app-topbar` 等）統一用 `--ztu-glass-bg`＋`backdrop-filter: blur(var(--ztu-blur-glass))`＋1px `--border`＋`--shadow-card`／`--shadow-edge-top`。
- 巢狀層（卡中卡、控件凹槽、縮圖框、中性徽章）統一用 `--ztu-film`，不上模糊。
- 具名例外寫在各元件規格，例如 `.kpi--hero` 的實色橘（Q83）。

**Foundation · Glass 三階**

| Token | Value | 用途 | 消費者（實測 var() 引用數） |
|---|---|---|---|
| `--ztu-glass-bg` | `rgba(255,255,255,0.05)`（2026-08-31 調參器定案，舊值 0.07，Q98） | 玻璃卡半透明底 | `.card`／`.kpi`／`.alert--bar`／`.readiness`／`.preview-card`／`.form-section--outlined`／`.list-toolbar`／`.app-topbar`／`.wizard__top::before`（頂列膠囊）／filter-tabs 已選殼 等（13 處；`.wizard__bottom` 2026-09-23 改同色遮色片後不再吃玻璃） |
| `--ztu-glass-strong` | `rgba(255,255,255,0.12)` | 玻璃 hover 加強 | 上述玻璃卡的浮層內排除補丁 hover、`.field-pill:hover`、`.chip:hover`、`.upload-tile:hover` 等（6 處） |
| `--ztu-glass-rim` | `rgba(255,255,255,0.15)` | 頂緣內光／浮層邊框色 | `.dropdown__menu`／`.zselect__panel`／`.preview-panel__sheet`／`.payout-dialog` 的 `border`、breadcrumb hover 圓鈕的 inset 邊 等（9 處） |
| `--float-glass` | `color-mix(in srgb, var(--popover) 72%, transparent)` | 浮層玻璃底（2026-10-27，Q78 修訂） | 下拉選單、選擇器、popover、提示框、彈窗共用；`.payout-dialog` 也吃它（不掛 backdrop-filter） |
| `--float-blur` | `var(--ztu-blur-glass)`（24px） | 浮層背景模糊（2026-10-27，Q78 修訂） | 與 `--float-glass` 成對使用；沒有模糊的半透明浮層會讓底下的字透上來 |
| `--ztu-film` | `rgba(255,255,255,0.085)`（2026-08-31 調參器定案，舊值 0.06，Q98） | 巢狀薄膜——卡中卡、控件凹槽、縮圖框、中性徽章共用的「疊上去的一層」，比玻璃低一階、刻意不帶 `backdrop-filter` | `.card--muted`／`.kpi.card--muted`／`.nest`／form-section 巢狀內層／`.input`／`.textarea`／`.select`／`.field-pill`／`.upload-tile`／`.badge`／`.stock-bar` 軌道／`.chip`／側欄項 hover 等（全站最多消費者，29 處） |

**Foundation · App shell 檯面與外殼**

**側欄收合成只有 icon（2026-08-31 建，全站）** — `.app.is-nav-rail`，鈕由 `sidebar.js` 產出所以每一頁的側欄都有，**與品牌同一行**（`.app-sidebar__top`）：它是這一欄的控制、不是導覽的一項，跟 logo 並排才讀得出「這顆管的是整條側欄」，另起一列會被當成清單的第一項。**圖示要先登記進 registry**——第一版用 `chevrons-left`／`panel-left-close`，那幾個名字不在 `js/icons.js` 裡，`applyIcons` 不認得就把 `<i>` 原封不動留著，按鈕因此是一個看不見的空方塊（實測 32×32、`renderedAsSvg: false`）；改用新登記的 `sidebar-collapse`／`sidebar-expand`（面板輪廓＋箭頭，不用單純的雙箭頭——單獨的箭頭在站上已經是「上一張／下一張」與「查看更多」）。`aria-label` 要**直接查表寫值**，不能靠 `applyI18n(btn)`：那支只掃傳進去那個元素的後代，標籤掛在按鈕自己身上永遠掃不到。**品牌區橫向置中要用 `align-items` 不是 `justify-content`**：它是直向 flex（標誌在上、Creator Studio 在下），`justify-content` 在直向 flex 裡管的是垂直——寫了會顯示成 center 但記號仍貼左（實測偏 12px＝記號的半寬）。**收起時品牌在最上、收合鈕緊接在它底下自成一列，下面一條分隔線**（2026-08-31 三次裁示：先「移到上面」、再「縮小後可以放在下面」、最後「這個 icon 要移上去，並在下面加一條分隔線」）：76px 的欄裡那一行只放得下一樣東西（記號 24 ＋間距 8 ＋鈕 32 ＝ 64，扣掉內距只剩約 60，並排會折行且貼左），所以鈕自成一列。**分隔線畫在導覽清單的上緣、不是畫在鈕底下**：鈕只有 32px 寬，線跟著它就只有 32px，看起來像鈕的一部分而不是一條分界；掛在清單上，線才吃滿整條欄的寬度（實測 48px＝欄寬扣內距）。線在做什麼：鈕獨自站在導覽上方時會像「第一個導覽項」，一條線把「這一欄的控制」與「要去哪一頁」分成兩段。做法是收合時把包裝層設成 `display: contents`，讓品牌與鈕直接成為側欄的 flex 子項，排序才跟得上 DOM（品牌 → 鈕 → 導覽）。**未讀點改貼 icon 的右上角**（只在收合狀態）：展開時標籤還在，點跟在標籤後面讀得出「這一項有未讀」；收起後標籤沒了，點就變成 icon 旁邊一顆浮著的橘圓、看不出它在講誰。展開的側欄是全站每一頁在用的，這條不動它。狀態存 `localStorage['ztor.navRail']`，跨頁維持同一個選擇——每點一次導覽就重新展開的話，那顆鈕等於沒用。欄寬 248 → 76px。**收起時只藏字不藏路**：每個 icon 留在原位（圖示與名稱的對應關係不必重學）、子選單整段收起（它要靠名稱才讀得懂）、品牌換成只有記號的 `SYMBOL_SVG`（使用者 2026-08-31 提供）——ztor 的字標在 76px 裡扣掉內距只剩約 48px，硬縮會被切成「zto」。**兩個選擇器的坑**：① 欄寬要寫 `html[data-nav-mode="sidebar"] .app.is-nav-rail #sidebar` 並改 `flex-basis`——真正的來源是 shared.css 帶 id 的 `flex: 0 0 248px`，純 class 壓不過（實測改了 `width` 欄寬仍是 248px），而 flex row 裡只改 width 也不決定尺寸；② 字標的 class 是 `app-topbar__brand-logo`（兩個外殼共用同一支標誌），寫成 `app-sidebar__brand-logo` 完全選不到。**900px 以下這一整套退場**，那裡本來就由 burger 接手——兩套收合機制同時在，讀者不知道哪一顆管哪一件事。

| Token | Value | 用途 | 消費者 |
|---|---|---|---|
| `--ztu-canvas` | `#0a0a09` | app shell 檯面色——比任何面板都深，圓角玻璃面板浮在其上 | `body` 的 `background-color`（sidebar 模式） |
| `--ztu-shell-gutter` | `14px` | 玻璃外殼與視窗邊之間的留白，四邊等寬 | `.app` 的 `gap`／`height`（扣兩倍留白）／`padding` |
| `--ztu-shell-solid` | `#1c1c1b` | 外殼玻璃疊在檯面上換算出的實色等價——給「必須是實色但要跟外殼同一階」的填色用（background-image 吃不到 backdrop-filter） | `.list-dock.is-snapped .list-dock__bars` 兩塊向外凹角的徑向漸層填色 |
| `--ztu-blur-shell` | `14px` | **待採用**——與 `--ztu-blur-glass`／`--ztu-blur-heavy` 同段定義，全站目前無 `var()` 引用 | — |

**Foundation · 星空背景**（STYLE-DECISIONS Q81）— 四層星空以 CSS 偽元素（`html::before`／`::after` 等）與 `radial-gradient` 疊圖繪製，不是 token 化的顏色值（磚位與 alpha 一字不差照抄沙盒），詳見下方「App shell 與星空背景」一節；`--ztu-bloom-*` 是與星空同色系但用途不同的霧光色票，見下表。

**Foundation · 模糊、陰影與發光**

| Token | Value | 用途 | 消費者 |
|---|---|---|---|
| `--ztu-blur-glass` | `24px` | 玻璃卡的 `backdrop-filter` 模糊半徑 | 卡片家族、頂欄、浮層排除補丁等（全站最多消費，32 處） |
| `--ztu-blur-heavy` | `50px`（2026-08-31 調參器定案，舊值 40px，Q98） | 加強模糊——貼頂捲動態需要更厚的毛玻璃 | `.app-topbar.is-scrolled` |
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

**模糊半徑的判準（2026-08-28，STYLE-DECISIONS Q79）**：模糊半徑必須遠小於該層的高度，太大會糊到看不出材質。

- 一般玻璃卡用 `--ztu-blur-glass`（24px）。
- 只有夠高的層才配用 `--ztu-blur-heavy`，例如捲動後的頂欄、細節頁面板。
- 矮的控件一律用 `--ztu-blur-glass` 或更小的值；主要按鈕的霧光層 `::before` 內縮 3px 再模糊 5px，40px 高的按鈕扣掉內縮只剩 34px，5px 已是柔邊上限。
- 新元件要模糊時先套這條判準選既有 token，不另開新的模糊值。

**Foundation · 發光家族**（主要動作、側欄選中、segmented、switch 共用一份配方，不各寫各的）

| Token | Value | 用途 | 消費者 |
|---|---|---|---|
| `--ztu-accent-surface` | 150° 橘漸層（`#ffc178`→`#ffa33f`→`#f2871f`，各自 color-mix 透明化） | 發光面的底 | `.btn--primary`／`.segmented__btn--active`／`.switch--on` 軌道 等（7 處） |
| `--ztu-accent-blur` | `blur(16px) saturate(1.25)` | 發光面的 backdrop 模糊 | 同上（10 處） |
| `--ztu-accent-glow` | 4 層 `box-shadow`（外光暈＋雙 inset 高光暗邊＋外緣描邊） | 主要動作的光暈——四層裡最亮的一階 | `.btn--primary`／`.switch--on` |
| `--ztu-pill-active-glow` | 同配方、光暈與內光都調低一階（4px→2px、30%→24%、55–60%→60–70%） | 「選中」比「主要動作」安靜一階 | `.segmented__btn--active` |
| `--ztu-accent-fg` | `rgba(255,255,255,1)`（2026-08-31 調參器定案，舊值 0.95，Q98） | 發光面上的字色／滑塊色 | `--primary-foreground`／`--on-primary`（語義別名引用，另有 sidebar 家族的同名待採用別名）＋ `.switch--on` 滑塊 等（8 處） |
| `--bloom-surface` | 176° 六階暖漸層（`#d0553d`→`#e8894f`→`#f0a85e`→`#f5cd80`） | 主要按鈕 `::before` 霧光層——規格書 §3.8 指名的字面，刻意不加 `--ztu-` 前綴 | `.btn--primary::before` 及其 `--lg`／`--sm` 尺寸變體（3 處） |

**選中態依場景分五種語彙（2026-08-28，STYLE-DECISIONS Q80）**：五個「已選中」場景共用 `--ztu-accent-*` 原料，畫法各自不同，共通點是顏色只留在光與字。

- 側欄選中：accent 玻璃膠囊，與主按鈕共用 `--ztu-accent-*`，`::before` 霧光層。
- 主分頁（`.tabs--underline-short`／`--underline-label`）選中：發光燈條，比主按鈕安靜一階。
- filter-tabs 選中：字自體發光加殼底光暈（中性玻璃殼＋`--ztu-orange-hi` 文字＋雙層 `text-shadow`），不用色塊。
- chip 選中：中性玻璃加橘字（`--ztu-glass-strong`＋頂緣內光＋`--ztu-orange-hi`）。
- radio card 選中：涼白玻璃、無左線（`--ztu-cool-white`＋雙層白內光），指示交給右上圓點。

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

創作者實際上傳的展示圖比例（2:3）。上傳槽（`ds-components/upload-tile.css` 的 `--upload-img-ratio: var(--img-portrait, 2 / 3)`）與顯示端（清單縮圖、卡片封面等 7 支顯示元件，見 Pillar 4）皆引用這一個變數；顯示框由同一張直式原圖 `object-fit: cover` 置中裁切填滿，不再各自另備方形／橫式素材。沒有例外：活動（Events）的橫式橫幅槽曾於 2026-07-31 保留為例外，2026-08-05 使用者推翻（STYLE-DECISIONS Q46），活動圖片也只有直式。`--16x9` 只剩 project-detail 的 Demo 影片／音樂檔案槽（見 §4.15）。此前多比例模型（縮圖 1:1／直式海報 3:4／橫幅 16:9／相簿 3:2）已全面退場。

### 1.4 Radius

**六個具名 token（`_tokens.css` canonical，值以此為準）：** 2026-08-28 r2.3 換裝把整組往上抬一到兩階（舊值 3／6／8／16／28，見改版歷史）。

| Token | Value | Note |
|---|---|---|
| `--radius-sm` | `10px` | Inner sub-radii on nested components (chips inside cards, code chips, swatches) |
| `--radius` | `10px` | Buttons, inputs, form controls — primary radius |
| `--radius-md` | `10px`（`--radius` 別名） | Q2 2026-07-13 併入 `--radius`；保留別名避免 67 處呼叫點 churn，原值曾為 7px |
| `--radius-lg` | `16px` | Nav panels, dropdown 浮層、卡內子卡 |
| `--radius-xl` | `24px` | Card / panel / dialog-level containers（Q16 2026-07-17 起卡片級用它） |
| `--radius-shell` | `30px` | Route-page corner inside the sidebar app shell |
| `--radius-pill` | `9999px` | Status dots, avatar circles, badge chips, full-round pills |

| Semantic role | Value | Where |
|---|---|---|
| `radius-button-primary` | `10px`（`--radius`） | "Create project", "Request payout" |
| `radius-button-secondary` | `10px`（`--radius`） | "Back" / "Cancel" outline CTA (`--radius-md` merged into `--radius`, Q2 2026-07-13) |
| `radius-card` | `24px` (`--radius-xl`, card/panel/dialog level — Q16 2026-07-17) · `16px` (dropdown 浮層, `--radius-lg`) | Cards, panels, dialogs / dropdown panels |
| `radius-input` | `10px`（`--radius`） | Form fields |
| `radius-small` | `10px`（`--radius-sm`） | Inner sub-radii on nested components |
| `radius-card-feature` | `12px` | Feature / highlight cards |
| `radius-media` | `16px` | Embedded media / hero video container |
| `radius-quote-card` | `24px` | Editorial / callout card (IP hero) |
| `radius-pill` | `1000px / 100%` | Status dots, avatar circles, badge chips |

Ztor's radius system is **fine-grained subtle** at the chrome layer (10px buttons / inputs, 16px nav panels) but **escalates sharply** at the editorial layer — `12px → 16px → 24px` are reserved for content surfaces (callouts, editorial cards, media). Then a clean leap to full pills for round elements.

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

**Page-scoped `[data-theme]` override exception（2026-07-23 已解除）** — `check_ds_sync` 檢查 8 原本標記 `e-shop.html` 的 `.eshop-list-topbar`（含 light-mode 覆寫留在頁內 `<style>`），當時的裁決是「全站唯一消費頁、沒有跨頁一致性風險，等第二個頁面要用同樣的樣式再抽共用元件」。2026-07-23 projects 整理頁頭時正好觸發那個條件，整組已 promote 成 [`list-toolbar.css`](../ds-components/list-toolbar.css)（`.list-toolbar` / `.list-toolbar__actions` / `.list-status-row`，見 Pillar 4 條目），light-mode 覆寫隨之進元件層，這條例外不再適用。

### 1.5b Raw-value exceptions — r2.2 新元件（2026-07-29 盤點）

外部協作者併入的 19 支新元件（Pillar 4 §4.92–§4.110）逐檔核對後，共 6 支＋ 1 支的字級用了裸值。判準沿用上方 §1.5 的既有原則：**疊在真實照片／素材縮圖上的黑色遮罩、陰影 rgba、`clamp()` 的排版級距**屬合理例外；**能用既有 token 表達的不算例外**，逐條記錄如下（檔名:行號 — 值 — 理由）：

- `brand-card.css:71` — `color: #fff` — `.brand-card__mark` monogram 文字色，疊在品牌自訂（使用者上傳、不可預期）的 logo 底色上，需要「永遠是白」而非跟主題翻轉；與 vip-card／fan-store 既有的「固定素材色不隨主題」判準同理，**判定：合理例外**。
- `chart-tip.css:65` — `box-shadow: 0 1px 5px rgba(0,0,0,.10), 0 6px 16px rgba(0,0,0,.08)` — 折線圖浮層陰影，屬固定投影而非疊圖遮罩，未走 `--shadow-*` token；**判定：合理例外（陰影 rgba），但建議下次治理輪收斂成 `--shadow-float` 家族**，非阻斷。
- `checkbox.css:118`／`checkbox.css:131` — `--zcheck-ink: #271302`（第 131 行為同值 fallback）— 勾號墨色，品牌橘在深淺兩個主題都偏亮，勾號必須「不隨主題翻轉」；現有 token 沒有一支「深色不隨主題翻轉的墨色」（`--brand-ink` 解的是反方向問題：橘色字不隨主題翻轉），**判定：合理例外，且目前無等價 token 可替代**（若要收斂需新增 token，屬 CSS 層改動，非本輪範圍）。
- ~~`detail-sheet.css:34` — `background: color-mix(in srgb, #000 52%, transparent)` — 覆蓋層遮罩底色~~ **已於 2026-08-31 殼層換裝收斂為 `--sheet-veil`（當時 `color-mix(in srgb, var(--ztu-canvas) 60%, transparent)`），不再是裸值。2026-08-31 調參器把濃度降到 0%（Q98），現值 `color-mix(in srgb, var(--ztu-canvas) 0%, transparent)`，浮層可讀性改靠 50px 模糊與玻璃白膜。** 原判定留存：**非乾淨例外，建議收斂**——站上已有 `--overlay-tint`（`rgba(0,0,0,0.45)`，見 §1.5 Edge & overlay tokens）承擔同一種「modal/覆蓋層遮罩」角色，本檔用 52% 而非既有 `--overlay-tint` 的 45%，屬可以但尚未對齊既有 token 的裸值漂移，非「無法用 token 表達」的那一類。
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

**列表頁漸消**：帶 `.list-dock` 或 `.admin-table-wrap` 的頁面（列表型頁面與 Admin 密集表格頁，2026-08-28 STYLE-DECISIONS Q85 納入；兩者共用 `shared.css` 同一條 mask 規則，不各寫一份），四層星空一起套 `mask`，由 36% 高度處開始往下線性淡出到 90% 完全透明——星空只在頁面上段可見，避免與下方密集的表格內容互相干擾閱讀。

**與換裝前的差異**：換裝前 app shell 檯面／sidebar 模式外殼是實色面板（`--surface-shell`／`--surface-page` 語義 token 的純色），沒有星空或暖光裝飾層；玻璃化與星空背景都是本波新增的視覺語彙，只在 `html[data-nav-mode="sidebar"]` 下生效，`topbar` 導覽模式的外殼另有獨立處理（見 §3.2）。

### 1.10 Imagery

**Full-bleed photographic hero on the Dashboard**, with a centered radial veil so white copy holds ≥5:1 contrast over the image. Elsewhere imagery is functional: IP cover art, product thumbnails, creator avatars. Data is shown through the chart family (line / stacked-bar / rank-bars), not decorative illustration. No stock photography in chrome.

---
