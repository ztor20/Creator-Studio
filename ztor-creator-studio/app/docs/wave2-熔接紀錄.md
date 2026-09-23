# r2.3 Wave 2 熔接紀錄（元件層）

Wave 1（地基：token／字型／app shell／星空）見 `wave1-熔接紀錄.md`。本檔記元件層，分兩批寫：

- **Wave 2a（2026-08-28，本輪）**：玻璃表面層——skin §3.1／§3.1a／§3.1c、§3.2、§3.3、§3.5、§3.6、§5、§7、§15。
- Wave 2b（未做）：光與選中態——skin §4、§9–§14。

熔接原則同 Wave 1：改本體原定義、不疊覆蓋層；r2.3 的 HTML 一字未動；成品零 `data-ztorui`、本輪零新增 `!important`。

---

## Wave 2a · 動到的檔案

22 支 CSS，其他一律未動（HTML／JS／partials／`design-system.*`／`ds-baseline.json` 皆未碰）。

| 檔案 | 對應 skin 小節 |
|---|---|
| `ds-components/_tokens.css` | 新增 `--ztu-film`；深色 scrollbar token；§3.6 浮層毛玻璃段整段退役 |
| `ds-components/card.css` | §3.1、§3.1a |
| `ds-components/kpi.css` | §3.1、§3.1a、§3.1c |
| `ds-components/alert.css` | §3.1、§3.1a、§3.1c、§15.6 |
| `ds-components/readiness.css` | §3.1、§3.1c、§3.6 |
| `ds-components/preview-card.css` | §3.1、§3.1a、§3.1c |
| `ds-components/form-section.css` | §3.2 |
| `ds-components/nest.css` | §3.3 |
| `ds-components/header.css` | §3.5 |
| `ds-components/dropdown-menu.css` | §3.6 |
| `ds-components/zselect.css` | §3.6 |
| `ds-components/preview-panel.css` | §3.6（含遮罩層） |
| `ds-components/payout-modal.css` | §3.6 |
| `ds-components/preview-column.css` | §3.2 的連帶（墓碑，見下） |
| `ds-components/product-list.css` | §5 |
| `ds-components/input.css` | §7、§7.1 |
| `ds-components/field-pill.css` | §7 |
| `ds-components/upload-tile.css` | §15.1 |
| `ds-components/badge.css` | §15.2 |
| `ds-components/stock-bar.css` | §15.3 |
| `ds-components/list-toolbar.css` | §15.4、§15.5 |
| `shared.css` | §3.5 的連帶（topbar 模式覆寫三條刪除） |

## 新增的 token

`_tokens.css:631`（Wave 1 的 `--ztu-*` 段內）新增一支：

```
--ztu-film: rgba(255, 255, 255, 0.06);
```

沙盒的 skin 檔在 12 個地方寫死同一個 6% 白（卡中卡、控件凹槽、縮圖框、中性徽章、量條軌道…），那是「巢狀薄膜」這個角色的顏色。熔接時不能把裸值搬進元件檔——check_ds_sync 檢查 5／10 的裸色棘輪只准降不准升——所以收成一支 token。`_tokens.css` 本身不受棘輪管制，這是 Wave 1 已經確立的放法。

同時改了兩支既有 token（在 dark 區塊，`_tokens.css:805–806`）：

| Token | 舊值（繼承 `:root`） | 新值 | 理由 |
|---|---|---|---|
| `--scrollbar-thumb` | `color-mix(in srgb, var(--foreground) 14%, transparent)` | `rgba(255, 255, 255, 0.14)` | Wave 1 把 `--foreground` 換成 `rgba(255,255,255,0.95)`，半透明再乘一次 14% 只剩 0.13 的白，滑塊在深底上幾乎看不見（skin §7 記的同一個問題） |
| `--scrollbar-thumb-hover` | `color-mix(… 32% …)` | `rgba(255, 255, 255, 0.32)` | 同上；skin 只寫了一支固定值、等於把 hover 一起壓平，這裡保留 hover 階（見「刻意與沙盒不同」） |

---

## 逐節熔接對照

行號為熔接後的現況。

### §3.1 一般卡片玻璃四件套 ＋ 同配方併入清單

沙盒把 `.card`／`.kpi`／`.alert--bar`／`.readiness`／`.preview-card` 併成一條選擇器群組。熔接時**拆回各自的元件檔**（同一份配方寫五次，換來的是「改 kpi 只要開 kpi.css」）：

| 元件檔:行 | 主語 | 刪掉／取代的舊宣告 |
|---|---|---|
| `card.css:91` | `.card` | `background: var(--card)`；`border: 0`（2026-07-26 Q23 裁決 C） |
| `kpi.css:22` | `.kpi` | `background: var(--card)`；`border: 0` |
| `alert.css:300` | `.alert--bar` | `background: var(--card)`；`box-shadow: var(--shadow-card)`（無頂緣內光）；無 border |
| `readiness.css:17` | `.readiness` | `background: var(--card)`；`box-shadow: var(--shadow-card)` |
| `preview-card.css:20` | `.preview-card` | `background: var(--card)`；`box-shadow: var(--shadow-card)` |

五處的新配方一字相同：

```
position: relative;
background: var(--ztu-glass-bg);
backdrop-filter: blur(var(--ztu-blur-glass));
-webkit-backdrop-filter: blur(var(--ztu-blur-glass));
border: 1px solid var(--border);
border-radius: var(--radius-xl);
box-shadow: var(--shadow-card), var(--shadow-edge-top);
```

`box-shadow` 刻意**維持 token 寫法**、不照抄沙盒的 `var(--ztu-shadow-card), inset 0 1px 0 var(--ztu-glass-rim)`：Wave 1 已把 `--shadow-card`／`--shadow-edge-top` 的深色值換成完全相同的兩個值（實測 computed 逐字相同），寫 token 比寫死值多留一條亮色的活路。

`.card--muted`（`card.css:119`）＝卡中卡，只給兩件（薄膜＋邊界）：舊值 `background: var(--nest-surface)` → `var(--ztu-film)`，並補 `backdrop-filter: none`、`border-radius: var(--radius-lg)`、`box-shadow: none`。同理 `kpi.css:251` 的 `.kpi.card--muted`。

### §3.1a 浮層內排除補丁 → **保留並擴編**（真規則）

沙盒那條的存在理由一半是特異度，但**語意本身成立**：浮層是實色的，裡面再放一張會透的玻璃卡就是看穿兩層玻璃（ztorUI 規格 §2.5）。熔接後改寫成乾淨的祖先清單，寫進各自的元件檔：

- `card.css:142`：取代原本只有 `.payout-dialog .card` 的那條（2026-08-13 Q66），祖先擴成 `:is(.payout-dialog, .payout-modal, .dropdown__menu, .zselect__panel, .preview-panel__sheet, .detail-sheet, .overlay-surface)`，並補關模糊。
- `kpi.css:61`、`alert.css:315`、`preview-card.css:42` 同樣的祖先清單。

### §3.1c 巢狀在玻璃容器裡 → **保留**（真規則）

- `kpi.css:52`：取代 `.card .kpi, .form-section--outlined .kpi, .ip-hero .kpi { background: var(--input-surface) }`（2026-07-20 Q21）。改成薄膜配方，並把 `.ip-hero` 從選擇器移除——`.ip-hero` 不是玻璃容器（是 IP 詳情的頁首橫幅），沙盒實測它裡面的 KPI 也是玻璃。
- `alert.css:325`、`preview-card.css:42`（與 §3.1a 併成同一條）、`readiness.css:32`。

### §3.2 `.form-section--outlined`

- `form-section.css:41`：本體改玻璃四件套。刪掉的舊宣告：`border: 0`（2026-07-16 去外框線）。邊框回來的理由：玻璃需要那道 1px 把厚度畫出來；2026-07-16 當時是實色卡、邊只是多餘的線。
- `form-section.css:56–61`：**刪除** `[data-theme="dark"] .form-section--outlined { background: var(--surface-shell); }`（2026-08-01 使用者裁示「都用 #1C1D1E」）。留著會用同權重的排序把玻璃蓋回實色。這是 r2.2 全站唯一一個「深色卡面不等於 `--card`」的例外，換皮後不再需要存在。
- `form-section.css:71`：巢狀 outlined 內層 → 薄膜。舊值 `background: var(--nest-surface)`，新增 `backdrop-filter: none`／`border: 0`／`border-radius: var(--radius-lg)`。

**連帶（沙盒對照時抓到的）**：`preview-column.css:45` 整條 `.preview-col .card, .preview-col .preview-card { border: 0; box-shadow: … }` 已移除（留墓碑註解）。它 2026-07-21 的目的是「右欄對齊左欄（左欄無邊框）」；本輪左欄長出 1px 邊之後，這條的效果反轉成「讓右欄跟左欄不一樣」，正好違背它自己的目的；`box-shadow` 那一半也已與本體同值、純屬重複。不刪的話 create-product 右欄兩張卡會缺邊框（實測 computed 與沙盒不符）。

### §3.3 `.nest`

`nest.css:26`：`background` 由 `var(--nest-surface)`（4%）改 `var(--ztu-film)`（6%），並明寫 `box-shadow: none`。`border-top`／`border-radius` 原本就與沙盒同值、未動。刻意不加 `backdrop-filter`（母卡已是玻璃，子層再模糊只會取樣到母卡自己；且母卡有 `overflow: hidden`，溢出效果本來就會被裁掉）。

### §3.5 頂欄 `.app-topbar`

- `header.css:19`：`.app-topbar` 改玻璃。舊值 `background: var(--card)`，無 backdrop-filter、無 box-shadow。
- `header.css:44`：捲動態。**選擇器由 `[data-theme="dark"] .app-topbar.is-scrolled` 改成 `.app-topbar.is-scrolled`**（不分主題），值改 `--ztu-glass-strong` ＋ `blur(var(--ztu-blur-heavy))` ＋ `var(--shadow-float), var(--shadow-edge-top)`。舊值：`background: color-mix(in srgb, var(--background) 62%, transparent)`；`backdrop-filter: var(--overlay-blur)`。
- `header.css:124`：`.app-topbar__dropdown` 是浮層，退回實色。舊值 `background: var(--card)`＋`backdrop-filter: var(--overlay-blur)`＋`border: 1px solid var(--border)`。
- `shared.css:689`：**刪除**兩條 topbar 模式覆寫——`html:not([data-nav-mode="sidebar"]) .app-topbar { background: var(--surface-shell); border-bottom: 0 }` 與同前綴的 `.is-scrolled`（後者還明確關掉毛玻璃）。兩條都是 0,2,1，與沙盒 skin 同級、只是載入在前，所以沙盒實際跑的一直是玻璃。
- `shared.css:713`：**刪除** ≤900px 的 `html:not([data-nav-mode="sidebar"]) .app-topbar { background: var(--card); border-bottom: 1px solid var(--border) }`，理由同上（該條同為 0,2,1，沙盒也是 skin 取勝）。

驗證方式：三頁預設是側欄模式、不長頂欄，用 `?nav=topbar` 開同一頁比對（結果見下方抽查表）。

### §3.6 浮層一律實色

- `_tokens.css:938–953`：**整段翻向**。原本是「浮層鋪毛玻璃」的全域治理段（`.overlay-surface, .dropdown__menu, .preview-panel__sheet, .payout-dialog { backdrop-filter: var(--overlay-blur) }`），本輪整段規則移除、只留說明註解。`.overlay-surface` 這個掛牌 class 全站零消費（已 grep 過 `*.html`／`js/`／`partials/`），移除後沒有孤兒。`--overlay-blur` 這支 token 保留。
- 各浮層的實色底改寫進自己的元件檔，四處配方相同（`background: var(--popover)`／`backdrop-filter: none`／`border: 1px solid var(--ztu-glass-rim)`）：
  - `dropdown-menu.css:36`（舊值 `background: var(--card)`，無 border）
  - `zselect.css:98`（同上）
  - `preview-panel.css:59`（舊值 `background: var(--card)`；`border-left: 1px solid var(--border)` → 四邊；並補 `box-shadow: var(--shadow-float)`）
  - `payout-modal.css:108`（舊值 `background: var(--card)`，無 border；`box-shadow` 維持 `--shadow-overlay`）
- `readiness.css:108`：`.readiness__pop .readiness` 退回實色。**保留（真規則）**：懸浮版的備齊度卡就是浮層。舊值只補一個 `box-shadow: var(--shadow-float)`。
- `preview-panel.css:53`：遮罩層 `.preview-panel__backdrop` 是浮層實色律的**例外**（半透明＋blur）。已照搬。目前分割版把它 `display: none`，規則先寫著。

### §5 列表群組律

全部在 `product-list.css`：

| 行 | 主語 | 刪掉／取代的舊宣告 |
|---|---|---|
| 23 | `.product-list__head` | 新增 `letter-spacing: 0.09em`／`text-transform: uppercase`（下框線本來就沒有） |
| 43 | `.product-list__row` | 新增 `border-radius: var(--radius-lg)`；transition 補 `box-shadow` |
| 74 | `.product-list__row:hover` | `background: var(--card)`；`border-radius: var(--radius-md)`；`box-shadow: var(--shadow-lift-flat)`（無頂緣內光） |
| 89 | `.product-list__row:last-child` | 新增（最後一列不畫分隔線） |
| 436 | `.product-list__row.is-dragging` | `background: var(--card)`；`border-radius: var(--radius-md)`；`box-shadow: var(--shadow-lift-flat)` |
| 105 | `.product-list__thumb` | `border-radius: var(--radius)`；`background: var(--muted)`；`border: 1px solid var(--border-soft)` |
| 140 | `.product-list__image` | `border-radius: var(--radius)`；`background: var(--card)`；無 border |
| 168 | `.product-list__image--placeholder` | `background: var(--muted)` |

`--placeholder` 那條是沙盒對照抓到的：它 0,1,0、排在 `__image` 之後，不改的話會把薄膜蓋回 `--muted`。

### §7 死角修正

- `input.css:90`：`.select` 的 chevron data-URI 整條重寫，`stroke='%23737373'` → `stroke='%23ffffff' stroke-opacity='0.7'`，viewBox／stroke-width／path 一字未動。
- `input.css:16`：`.input, .textarea, .select` 底改 `background-color: var(--ztu-film)`。舊值 `background: var(--input-surface)`。刻意用 `background-color` 而不是簡寫——簡寫會把 `.select` 的箭頭 `background-image` 一併歸零。
- `input.css:43`：focus 環 `0 0 0 4px … 15%` → `0 0 0 3px … 20%`（仍走 `--ring`，該 token 本來就 `= var(--primary)`）。
- `field-pill.css:19`：底改 `var(--ztu-film)`（舊值 `var(--card)`）。**不加**控件家族那圈 `box-shadow` 環——它自己已經有一條真的 `border`，兩者疊起來會讀成一條 2px 粗邊。沙盒是「先加環、下一條再收掉」，熔接後直接不加。
- `field-pill.css:45`：hover `var(--accent)` → `var(--ztu-glass-strong)`。
- `_tokens.css:805–806`：捲軸滑塊（見上方 token 表）。

### §15 次要表面補完

- `upload-tile.css:28`：底 `var(--input-surface)` → `var(--ztu-film)`；`upload-tile.css:66` hover `var(--accent)` → `var(--ztu-glass-strong)`。**border 刻意不動**：這支元件用 `border-style` 承載狀態（空的投放區 2px dashed、`.is-filled` 轉 solid），改成統一 1px solid 會把「填了沒」的唯一視覺訊號抹掉。
- `badge.css:99`：`border-radius: var(--radius-md)` → `var(--radius-pill)`；`background: var(--muted)` → `var(--ztu-film)`。`badge.css:146` 的 `.badge--neutral` 跟著改（舊值 `var(--muted)`）。六個語意染色變體不動——沙盒用 `:not()` 排除它們，熔接後改本體就不需要 `:not()`。
- `stock-bar.css:27`：軌道底 `var(--muted)` → `var(--ztu-film)`。`__fill` 不動。
- `list-toolbar.css:18`：工作列改玻璃四件套。舊值 `background: var(--surface-shell)`（實色，無 border／box-shadow／backdrop-filter）。
- `list-toolbar.css:370`：貼頂態的 `.list-dock.is-snapped .list-toolbar` 補 `backdrop-filter: none`／`border: 0`（併進既有那條，不另開規則）。
- `list-toolbar.css:274`：`.list-dock.is-snapped .list-dock__bars` 底 `var(--surface-shell)` → `var(--ztu-glass-bg)` ＋ `blur(var(--ztu-blur-glass))`。
- `list-toolbar.css:346／351`：兩塊向外凹角的徑向漸層填色 `var(--surface-shell)` → `var(--ztu-shell-solid)`（背景圖吃不到 backdrop-filter，只能填實色等價）。
- `alert.css:492`：`.alert-inset::before` 的補色漸層整塊拿掉，改 `background: none`。舊值 `linear-gradient(to bottom, var(--surface-page) 0, var(--surface-page) calc(100% - var(--alert-inset-fade)), transparent 100%)`。
- `alert.css:515`：連帶——`.alert--inset-card` 拿掉 `background: var(--surface-shell)` 與 `box-shadow: none`，表面交回已經是玻璃的 `.alert--bar`（e-shop 的通知條同時帶這兩個 class，不改的話 0,1,0 排序在後會把玻璃蓋掉）。淺色的 `html[data-theme="light"] .alert--inset-card` 保留。

---

## 判定「不搬」的補丁

| skin 位置 | 內容 | 不搬的理由 |
|---|---|---|
| §7 尾段 | `.zselect__trigger.select, .select--bare[aria-expanded="true"] { background-image: none }` | 純特異度補丁。它存在是因為 skin 重開了 `.select` 的 `background-image`；熔接是就地改本體那一條，r2.2 原本的 `zselect.css:81/92`、`input.css:127`、`field-pill.css:75` 四條 `background-image: none` 仍然生效 |
| §7 | `.field-pill { box-shadow: none }` | 純特異度補丁（收掉上一條剛加上去的環）。熔接後 `.field-pill` 本來就沒被加環，不需要 |
| §8 | lamp-button 註解區 | 沙盒本來就不生效（整段只有註解） |
| §3.4 | `.app-sidebar`／`__lang-panel` | Wave 1 已熔接完 |

## 刻意與沙盒不同（都經過判斷，不是漏做）

1. **disabled 的 input／select 維持透明底、無箭頭**。`input.css:81` 的 `.input:disabled, .textarea:disabled, .select:disabled { background: transparent }`（0,2,0）在沙盒被 skin 的 0,2,1 壓過，於是沙盒的 disabled 欄位跟可編輯欄位長得一模一樣、只差字色。那是特異度的副作用、skin 沒有任何一行註解說要這樣；而「整個元件庫只能有一個 disabled 樣子＝透明底＋1px 邊」是 2026-08-09 使用者裁示、寫在 `input.css` 檔頭的規則。熔接保留本體行為。**這是三頁 computed 唯一一項在本輪範圍內與沙盒不同的差異**（`SELECT.select.zselect__native` 與 `BUTTON.zselect__trigger.select` 的 disabled 那一個變體）。
2. **捲軸滑塊保留 hover 階**（0.32 白）。skin 用 `html[data-ztorui] *` 一條把 hover 一起壓成 0.14；它的註解只講「color-mix 乘兩次 alpha 看不見」這個問題，沒有要移除 hover 回饋。熔接改成修 token，兩個階都對。
3. **`.kpi--hero` 保住實色橘**。沙盒的 §3.1 讓 `.kpi`（0,2,1）壓過 `.kpi.kpi--hero`（0,2,0），hero 卡在沙盒裡整張變成玻璃、橘色消失。熔接後本體是 `.kpi`（0,1,0）、hero 是 0,2,0，自然保住。三頁沒有 hero KPI，不影響本輪對照。
4. **`.alert--page-top` 保住 `--shadow-header`**。同樣是沙盒的特異度副作用（0,1,0 被 0,2,1 壓過）。那條 sticky 貼頂變體需要自己的下緣邊緣陰影。三頁沒有這個變體。
5. **`.select--bare` 保住透明底、無邊**。沙盒的 §7（0,2,1）會把它壓成薄膜＋1px 環，等於取消 `--bare` 這個變體的意義（2026-07-26 定的「沒有卡片包著的 select 不畫邊」）。三頁沒有 `.select--bare`。

第 3–5 項都是「沙盒把某個變體壓掉了」，熔接後因為改的是本體、變體的特異度自然高一階，所以變體活了下來——這是熔接比覆蓋層好的地方，不是偏離。

---

## 驗證

### 方法

r2.3（`localhost:4326`）與沙盒（`localhost:4351`）同頁並排，用 `getComputedStyle` 掃**整個 `document.body` 的每一個元素**，取 `backgroundColor`／`backgroundImage`／`backdropFilter`／`border`／`borderRadius`／`boxShadow`／`color`／`letterSpacing`／`textTransform`／`opacity` 十個屬性，依 `tagName + className` 聚合成「這個 class 在本頁出現過的所有 computed 組合」，兩邊逐 class 比對。三頁元素數：e-shop 4,054、product-detail 3,4xx（323 個 class 簽章）、create-product（227 個 class 簽章），兩邊元素數完全相同。

### 結果：本輪範圍內的 class 全部逐字相同

| 元素 | 抽查屬性 | 沙盒值 ＝ r2.3 值 |
|---|---|---|
| `.card`（create-product 右欄） | bg / backdrop / border / radius / shadow | `rgba(255,255,255,0.07)` / `blur(24px)` / `1px solid rgba(255,255,255,0.1)` / `24px` / `rgba(0,0,0,0.45) 0 24px 60px, rgba(255,255,255,0.15) 0 1px 0 inset` |
| `.alert--bar.alert--inset-card`（e-shop） | 同上 | 同上 |
| `.list-toolbar`（e-shop） | 同上 | 同上 |
| `.form-section--outlined`（product-detail／create-product） | 同上 | 同上 |
| `.preview-card`（create-product） | 同上 | 同上 |
| `.readiness`／`.readiness__pop`（create-product） | 同上 | 相同（簽章 `cxm5oa`／`w6tufd`） |
| `.kpi.kpi--compact`（product-detail，在 `.form-section--outlined` 內） | 同上 | 相同（簽章 `2qyqe6`／`2qyqe7`） |
| `.product-list__row`（e-shop） | bg / border-bottom / radius | `rgba(0,0,0,0)` / `1px rgba(0,0,0,0)` / `16px` |
| `.product-list__head` | letter-spacing / text-transform | `1.08px` / `uppercase` |
| `.product-list__image`／`--placeholder` | bg / border / radius | `rgba(255,255,255,0.06)` / `1px solid rgba(255,255,255,0.1)` / `10px` |
| `.field-pill`（e-shop） | bg / radius | `rgba(255,255,255,0.06)` / `10px` |
| `.badge`／`.badge--neutral` | bg / radius | `rgba(255,255,255,0.06)` / `9999px` |
| `.upload-tile`（product-detail／create-product） | bg / border | 相同（簽章 `pjullf`／`1ddo96k`） |
| `.stock-bar` | bg | 相同（簽章 `1649sk2`） |
| `.input`／`.textarea` | bg / shadow | 相同（簽章 `x72k9q`） |
| `.select`（chevron） | background-image | `stroke='%23ffffff' stroke-opacity='0.7'` 的 data-URI，兩邊逐字相同 |
| `.dropdown__menu`（e-shop） | bg / backdrop / border / radius / shadow | `rgb(33,34,35)` / `none` / `1px solid rgba(255,255,255,0.15)` / `16px` / `rgba(0,0,0,0.5) 0 12px 40px` |
| `.preview-panel__sheet`（product-detail） | 同上 | 相同（簽章 `49ael3`） |
| `.preview-panel__backdrop` | bg / backdrop | `color(srgb 0.0549 0.051 0.0471 / 0.65)` / `blur(8px)` |
| `.payout-dialog`（product-detail） | 同上 | 相同（簽章 `1l3xb7l`） |
| `.alert-inset::before` | background-image / background-color | `none` / `rgba(0,0,0,0)` |
| `.app-topbar`（`?nav=topbar`） | bg / backdrop / shadow | `rgba(255,255,255,0.07)` / `blur(24px)` / `rgba(255,255,255,0.15) 0 1px 0 inset` |
| `.app-topbar.is-scrolled` | shadow | `rgba(0,0,0,0.5) 0 12px 40px, rgba(255,255,255,0.15) 0 1px 0 inset` |
| `.app-topbar__dropdown` | bg / border / radius / shadow | `rgb(33,34,35)` / `1px solid rgba(255,255,255,0.15)` / `16px` / `rgba(0,0,0,0.5) 0 12px 40px` |
| `.list-dock__bars`（e-shop 捲到貼頂） | bg / backdrop / radius / shadow | `rgba(255,255,255,0.07)` / `blur(24px)` / `0 0 24px 24px` / `rgba(0,0,0,0.65) 0 10px 24px -12px` |
| `.list-dock__bars::before`／`::after` | background-image | `radial-gradient(24px at 0%/100% 100%, rgba(0,0,0,0) 23px, rgb(28,28,27) 24px)` |
| 貼頂態 `.list-toolbar` | bg / backdrop / border / radius / shadow | `rgba(0,0,0,0)` / `none` / `0px none` / `0px` / `none` |

### 三頁仍不同的 class（全部是**下一批**的小節，不是本輪漏做）

| class | 對應 skin 小節 |
|---|---|
| `.btn--primary`、`.split-button__main`／`__caret`、`.empty-card__cta` | §4 發光家族 |
| `.segmented__btn`／`--active`、`.segmented.radio-cards`、`.switch`／`--on`、`.filter-tabs__item--active`、`.filter-tabs__count` | §4 |
| `.app-sidebar__link`／`__sub-link`／`__action`／`__link-label` | §9 側邊欄導覽項 |
| `.page-crumb`／`--back`（連帶 `.card__link` 在麵包屑裡的橘字） | §10 麵包屑 |
| `.kpi__value` 的 letter-spacing（−0.6px vs −0.44px） | §11 KPI 數字排版律 |
| `.wizard__top`、`.wizard__bottom--end` | §12 精靈頂欄與底欄 |
| `.chip`／`.chip__remove`／`.chip--active` | §13 Chip 預設態 |
| `.sticky-actions` | §14 底部吸附操作列 |
| `svg`／`path` 的 color | 上述各項的下游（圖示吃 currentColor） |

### Wave 1 的殘留缺口（本輪發現、未修）

用 `?nav=topbar` 比對時發現：**topbar 模式的 `.app` 與 `.main` 還是實色**（r2.3 `.app` = `rgb(28,29,30)`、`.main` = `rgb(12,13,13)` ＋ 30px 上圓角；沙盒兩者皆透明、無圓角）。成因是 Wave 1 的 §3.0 只熔接了 `html[data-nav-mode="sidebar"]` 那一組，`shared.css:688` 起的 `html:not([data-nav-mode="sidebar"]) .app / .main` 三條（`--surface-shell`／`--surface-page`／`border-radius: var(--radius-shell) … 0 0`）沒有跟著翻。三頁預設側欄模式、不受影響，屬 Wave 1 的補件或 Wave 3 全站巡檢的項目，本輪未動（不混波次）。

### check_ds_sync.py

`RESULT: PASS + WARN (raw-color, md-html-sync)` — 與本輪動工前完全相同：

- 檢查 5（元件 CSS 裸 hex/rgb）：46 處，與熔接前同一份存量，**本輪零新增**（6% 白收進 `--ztu-film`、浮層邊用 `--ztu-glass-rim`、凹角用 `--ztu-shell-solid`）。
- 檢查 9（md↔html 同步）：`--ztu-*` 與 `--bloom-surface` 尚未寫進 `design-system.md`／`.html`——Wave 1 已掛帳的同一筆，文件層排在 Wave 2c。本輪新增的 `--ztu-film` 一併掛在這筆底下。
- 檢查 10（頁面裸值棘輪）：PASS，存量 68 處未上升。
- 其餘 9 項全 PASS。

`ds-baseline.json` 未修改。

---

# Wave 2b 熔接紀錄（發光家族與選中態）

2026-08-28。接續 Wave 1（地基）與 Wave 2a（玻璃表面層），把換皮沙盒 `demo/ztorui-skin/skin/ztorui-skin.css` 的 **§4 發光家族全節（551–814）、§9 側欄導覽項、§10 麵包屑、§11 KPI 數字排版律、§12 精靈頂／底欄、§13 Chip、§14 底部吸附操作列** 熔進本體，另補做 Wave 2a 驗收發現的 **topbar 模式外殼缺口**。

原則同前兩波：改原定義、不疊覆蓋層，HTML 一字未動，全站零 `data-ztorui`（`shared.css` 只有一則註解提到這個字串）、零新增 `!important`。

## 動到的檔案（11 支，其他一律未動）

- `ds-components/_tokens.css`（新增 4 支 `--ztu-*`）
- `ds-components/fonts.css`（Doto `@font-face` ＋ `--font-dot`）
- `ds-components/button.css`（§4.1）
- `ds-components/segmented.css`（§4.2）
- `ds-components/radio-card.css`（§4.2b）
- `ds-components/switch.css`（§4.3）
- `ds-components/filter-tabs.css`（§4.4）
- `ds-components/tabs.css`（§4.4b）
- `ds-components/chip.css`（§13）
- `ds-components/kpi.css`（§11）
- `ds-components/page-intro.css`（§10 麵包屑）
- `ds-components/sticky-actions.css`（§14）
- `shared.css`（§9 側欄、§4.5 側欄選中、§12 精靈頂／底欄、topbar 殼補件）

## 新增的 `--ztu-*` token（4 支）

放在 `_tokens.css` 的 `--ztu-*` 原料段。加這四支的唯一目的是讓元件層不必再寫裸 `rgba()`／`#hex`（檢查 5 的棘輪）。

| Token | 值 | 誰在吃 |
|---|---|---|
| `--ztu-shadow-pop-up` | `0 -12px 40px rgba(0,0,0,.5)` | `.sticky-actions`（`--ztu-shadow-pop` 的向上版；吸底列的光從上方來） |
| `--ztu-rim-soft` | `rgba(255,255,255,.14)` | `.chip--active` 的頂緣內光 |
| `--ztu-rim-strong` | `rgba(255,255,255,.20)` | `.radio-cards .segmented__btn--active` 的頂緣內光（卡面比 chip 大、光要撐得住） |
| `--ztu-cool-white` | `#eaf2ff` | 同上的涼白卡面（帶藍相的白，跟未選中的中性玻璃分得出來） |

另在 `fonts.css` 新增 `--font-dot: "Doto", 'Poppins', var(--font-numeric), monospace`（見下方「不搬清單」的 Doto 一條）。

## 逐節熔接對照

### §4.1 主按鈕 → `ds-components/button.css`

`.btn--primary` 的 `background: var(--primary)` ＋ `box-shadow: var(--shadow-raise)` 換成 `--ztu-accent-surface` ＋ `--ztu-accent-blur` ＋ `--ztu-accent-glow`，並補 `position/isolation` 與 `::before` 霧光層（`inset:3px` / `blur(5px)`，`--lg` 4/6、`--sm` 2/4）。hover 由換色票改成 `filter: brightness(1.07)`。

`color` 沿用本體既有的 `var(--primary-foreground)`（Wave 1 已把它指到 `--ztu-accent-fg`，展開值相同），不改寫成原料 token——語義層還在，就走語義層。

兩處連帶：

- `.btn--icon-circle.btn--primary` / `.is-active`（0,2,0）同步換成同一份配方。沙盒是靠 `html[data-ztorui]`（0,2,1）壓過它，本體沒有那個閘，不明寫就會被 `--muted` 底蓋回去。
- **新增停用態收尾**：`.btn--primary:disabled` 補 `backdrop-filter:none; box-shadow:none`，`::before` 補 `content:none`。理由見下方「與沙盒刻意不同」。

### §4.2 Segmented → `ds-components/segmented.css`

- `.segmented` 軌道：`--muted` 實色 → `--ztu-film`；圓角 `--radius-lg` → `--radius-pill`。
- `.segmented__btn` 圓角 `--radius-md` → `--radius-pill`。
- `.segmented__btn--active`：白浮起 pill ＋ 橘字 → `--ztu-accent-surface` ＋ blur ＋ `--ztu-pill-active-glow` ＋ 白字。光暈用 pill-active 那一支（比主按鈕安靜一階）。
- `.segmented--locked .segmented__btn--active:hover` 未動：它 (0,3,0) 在沙盒也壓過覆蓋層，而 `--foreground` 與 `--ztu-accent-fg` 在深色下同為 `rgba(255,255,255,.95)`，本來就零差異。

### §4.2b radio 大卡 → `ds-components/radio-card.css`

`.radio-cards .segmented__btn--active`（含 `:hover`）改成涼白玻璃：`color-mix(--ztu-cool-white 11%, transparent)` ＋ `blur(20px) saturate(1.1)` ＋ 雙層白內光，字色 `--foreground`。**沒有**左緣橘線（2026-08-28 使用者「不要線」）；選中指示仍交給本檔既有的右上圓點 `::after`。

連帶刪掉兩個變體的 `background` 覆寫（`--3`、`--list`），它們原本用 `color-mix(--foreground 6%, --accent)` 的不透明灰塊提亮已選卡——那在換裝後的玻璃卡面上是最刺眼的材質斷層，而 base 的新已選態本身就是「比未選中亮一階」，delta 已由 base 承擔。

### §4.3 Switch → `ds-components/switch.css`

- 關閉軌道 `--accent` → `--ztu-film`；滑塊 `--card` → `color-mix(--ztu-accent-fg 62%, transparent)` ＋ `--ztu-shadow-pop`。
- 開啟軌道 `--primary` → `--ztu-accent-surface` ＋ blur ＋ `--ztu-accent-glow`，`border-color: transparent`；開啟滑塊改 `--ztu-accent-fg`。
- **刪除** `[data-theme="dark"] .switch::after` / `.switch--on::after`（0,2,1）：它原本是為了「dark 的 `--card` 半透明、滑塊會透出橘軌道」而存在，滑塊改成明寫的白之後失去對象，留著只會把新值蓋回去。

### §4.4 filter-tabs → `ds-components/filter-tabs.css`

已選態從「橘 tint 色塊」改成「中性玻璃殼 ＋ 字自體發光 ＋ 殼底 26px `blur(4px)` 光暈」：`--ztu-glass-bg` ＋ `blur(--ztu-blur-glass)`、字 `--ztu-orange-hi`、兩層 `text-shadow`、`::after` 兩層徑向漸層。`box-shadow: none`，沒有底線。

顏色一律寫成 `var(--dot, …)`：`--source` 變體的每一項用 inline `--dot` 帶自己的色，其餘頁面沒設就落回品牌橘、computed 一格不變。因此連帶刪掉三條變體覆寫：

- `.filter-tabs--brand .filter-tabs__item--active .filter-tabs__count`
- `.filter-tabs--source .filter-tabs__item--active`（含 `:hover`）

⚠ 順序陷阱（實測踩到）：`.filter-tabs__item--active .filter-tabs__count` 與 `.filter-tabs--brand .filter-tabs__count` 同為 (0,2,0)，靠源碼順序決勝。新的已選計數規則**必須寫在 `--brand` 那一段之後**，否則 e-shop（掛 `--brand`）的已選計數會退回 `--muted-foreground` 的灰。檔內已加註。

### §4.4b 分頁底線燈條 → `ds-components/tabs.css`

`.tabs--underline-short .tabs__item--active::after` 與 `.tabs--underline-label .tabs__item--active > :first-child::after` 兩條的 `background: var(--primary)` ＋ `border-radius: 2px` 換成：長度方向的五段漸層（兩端透明、中段最亮）＋ `--radius-pill` ＋ 三層遞減外光暈（6px 70% → 16px 45% → 22px 28%，最後一層下偏 2px）。

### §4.5 側欄選中態 → `shared.css`

三組舊的 `--selected-surface` 橘 tint 規則刪除，改成一條共用 `--ztu-accent-*` 的規則（主項 `[aria-current="page"]` / `--active` / 兩者的 `:hover` / 子項 `[aria-current="page"]` 及其 `:hover`）＋ `::before` 霧光層（`inset:2px` / `blur(4px)`，側欄項 36px，取 `.btn--sm` 那一組值）。

⚠ 位置：這一組必須寫在三條 `:hover` 之後——`[aria-current="page"]`(0,2,0) 與 `:hover`(0,2,0) 同權重、靠順序決勝。檔內已加註。

### §9 側欄導覽項 → `shared.css`

| 目標 | 舊值 | 新值 |
|---|---|---|
| `.app-sidebar__link` 圓角 | `--radius-lg` | `--radius-pill` |
| `.app-sidebar__sub-link` 圓角 | `--radius-lg` | `--radius-pill` |
| `.app-sidebar__action` 圓角 | `--radius-md` | `--radius-pill` |
| 三者的 `:hover` 底 | `var(--accent)`（深色下 `#2A2B2C` 不透明方塊） | `var(--ztu-film)` |
| `.app-sidebar__subnav > div` | 無 | `margin-left: 21px` |
| `.app-sidebar__sub-link` 左內距 | `var(--sp-40)` | `19px` |
| `.app-sidebar__sub-link--lang` 左內距 | `var(--sp-48)` | `27px` |

縮排那三條相加後文字左緣仍是 40／48，一格不動；改的是子項膠囊本身往右縮。`--accent` token 本身沒動（它是全站共用的 hover 底色，改 token 會牽動下拉選單項與圖示鈕）。

### §10 麵包屑 → `ds-components/page-intro.css`

`.page-crumb` 由 `--brand-ink`（Wave 1 之後是亮橘）改 `--foreground-muted`；新增 `.page-crumb > span:last-child { color: var(--foreground) }` 表達「當前層」；`a:hover` 補提亮。返回圓鈕靜止態維持既有裁決（裸箭頭、不畫圓），只把 hover 的不透明 `--accent` 圓換成玻璃圓鈕（`--ztu-glass-bg` ＋ blur ＋ `inset 0 0 0 1px var(--border)`——用 inset 陰影當邊，避免 hover 時長出 1px 實體邊讓整條麵包屑抖一下）。

### §11 KPI 數字排版律 → `ds-components/kpi.css`

`.kpi__value`：`font-weight` 400 → `--fw-light`(300)、`letter-spacing` `-0.6px` → `-0.02em`、新增 `line-height: var(--lh-tight)`(1.1)。

字級**沒動**：沙盒 §11 的 `--fs-22: 22px` 覆寫與 r2.2 原值相同（`_tokens.css:422` 本來就是 22px），是沙盒放大到 24px 後又改回來的結果，本體沒有可搬的 delta。

規格書 §8.4 的「整數段全亮、小數段與千位尾段降暗」這一半未做：需要 markup 把數字拆成分開的節點，純 CSS 選不到一個文字節點的後半段，而本波 HTML 不動。

### §12 精靈頂／底欄 → `shared.css`

`.wizard__top` 與 `.wizard__bottom` 由實色改成與 `.app-topbar` 同一組玻璃（`--ztu-glass-bg` ＋ `blur(--ztu-blur-glass)` ＋ 1px `--border` ＋ `inset ±1px --ztu-glass-rim`，底欄方向翻轉）。連帶：

- `.wizard__top::before { box-shadow: none }`——玻璃底下壓著一團 `--shadow-header` 重投影會讀成「半透明板子下面有一塊黑霧」。⚠ 這條必須寫在 `.edge-shadow::before, .wizard__top::before` 那一塊**之後**（同為 (0,1,1)，靠順序決勝），實測踩過。
- `.wizard__top-lead:hover` 的 `--accent` → `--ztu-film`。
- **刪除** `[data-theme="dark"] .wizard__top` / `.wizard__bottom` 兩條實色覆寫（0,2,0，會把玻璃蓋回去）。

### §13 Chip → `ds-components/chip.css`

- 未選中底 `--input-surface` → `--ztu-film`；hover `--accent` → `--ztu-glass-strong`。
- `.chip--active`（含 `:hover`）：13% 橘 tint ＋ 橘字 → `--ztu-glass-strong` ＋ blur ＋ `--ztu-orange-hi` 字 ＋ `inset 0 1px 0 var(--ztu-rim-soft)`。橘 tint 是整套語彙裡最後一個用色塊當選中態的地方，混著橘字讀起來是一塊糊掉的褐。
- 新增 `.chip--active .chip__remove` 走中性弱色（次要動作不跟標籤名搶顏色）。
- `.chip--static:hover`、`.chip--value` 的底跟著改吃 `--ztu-film`。

本體不必像沙盒那樣用 `:not(.chip--active)` 提權——本體是改原定義、順序自然，沒有覆蓋層的特異度問題。

### §14 底部吸附操作列 → `ds-components/sticky-actions.css`

刻意**不**套玻璃（檔頭原註解：這一列會做淡入淡出，而 `backdrop-filter` 表面不可淡入淡出）。只換三個值：底色 `--card` → `--popover`（深色下同為 `#212223`，值沒變、來源正名）、上緣線靠 `--border` 的 token 連帶已是新風格、陰影 `0 -6px 16px rgba(0,0,0,.08)`（寫死的淺色模式值，深底上等於沒有）→ `--ztu-shadow-pop-up`。圓角維持 0。

實測（`bundle-detail.html` 捲到觸發）：`rgb(33,34,35)` / `rgba(0,0,0,.5) 0 -12px 40px` / `rgba(255,255,255,.1)` 上緣線 / `0px` 圓角，與 skin §14 逐字相同。

### Wave 1 補件：topbar 模式外殼 → `shared.css`

- `html:not([data-nav-mode="sidebar"]) .app`：`background: var(--surface-shell)` → `transparent`
- `html:not([data-nav-mode="sidebar"]) .main`：`background: var(--surface-page)` → `background-color: transparent` ＋ `backdrop-filter: none` ＋ `border: 0` ＋ `border-radius: 0` ＋ `box-shadow: none`（原本是 `--radius-shell` 上兩角圓）

沙盒的 §3.0 本來就寫在不分導覽模式的 `html[data-ztorui] .app` / `.main` 上，兩種模式吃同一份；本體照樣把 topbar 這一組翻成與 sidebar 完全相同的處置。

`?nav=topbar` 實測：r2.3 `.app`／`.main` 皆 `rgba(0,0,0,0)`、`border-radius: 0`、無 backdrop、無陰影，與沙盒逐字相同（沙盒 `body` 在 topbar 模式同樣不是 `--ztu-canvas`——skin 的 body 規則本來就只掛 sidebar 模式，兩邊一致）。

## 不搬清單（含理由）

### 1. Doto 數字面 — 不套在 `.kpi__value` 上（只補宣告）

任務書要求「KPI 用 Doto」，但三方證據都指向不該搬：

- **ztorUI 規格書自己說不用**：`demo/ztorui-skin/_port/ztorui-ds-spec.md:138` 寫著 `--font-dot: 'Doto', 'Poppins', monospace`（點陣數字，**Creator 家族專屬，ztor mode 未使用**但 CSS 仍可用）。
- **沙盒零引用**：`grep -i doto` 掃過 `skin/*.css` 與三支 `.html`，命中 0；`ztorui-skin.css.bak-pre-rewrite` 的檔頭還明寫「Doto 未使用，不宣告」。沙盒的 `.kpi__value` 實測是 `--font-numeric`（Satoshi）。
- **搬了會同時違反驗收準繩**：本波的準繩是「三頁 computed 與沙盒一致」，換字面就直接違反；而且點陣字面的字寬與 Satoshi 差很多，KPI 卡本來就只剩 4px 餘裕（見下），溢出風險高。

**已做的部分**：`fonts.css` 補上 Doto 600／700 兩支 `@font-face`（字檔 Wave 1 已放 `fonts/`，`src` 照檔內 Poppins 寫法指 `../fonts/`、`font-display: swap`），並補 `--font-dot` token，讓字面「備而可用」。沒有人引用就不會觸發下載，成本為零。

要真的換過去是一次獨立的設計裁決（規格要一起改），不是熔接。改法：`.kpi__value { font-family: var(--font-dot) }` 一行。

### 2. radio 大卡的膠囊圓角 — 不搬（覆蓋層特異度誤傷）

沙盒的 `.radio-cards .segmented__btn` 實測 `border-radius: 9999px`，本體維持 `--radius-xl`(24px)。成因：skin 的 `html[data-ztorui] .segmented__btn`（0,2,1）連 radio 大卡一起蓋掉了 `radio-card.css` 的 `.radio-cards .segmented__btn`（0,2,0）——而那條 0,2,0 正是 2026-07-23 為了「不被 segmented 蓋回去」刻意提權的。

實際畫面（截圖 `screenshots/wave2b-沙盒-create-product-gate-膠囊誤傷.png`）：create-product 第一步那兩張大卡被畫成兩顆膠囊、左右黏成一塊，讀不出是兩張並排的卡。這是覆蓋層的副作用，不是設計裁決；skin §4.2b 的原文也寫著大卡要「拉回 r2.2 原本的語彙」。照任務書「覆蓋層打特異度用的不搬」處理。

同源的第二項：沙盒的 `.segmented.radio-cards` 容器被畫上 6% 白底 ＋ 1px 邊（segmented 的軌道），本體維持透明無邊。

### 3. `.btn--primary:disabled` 的發光 — 不搬（同上）

沙盒的停用主按鈕仍然整顆發光：`.btn--primary:disabled`（0,2,0）被 skin 的 `html[data-ztorui] .btn--primary`（0,2,1）蓋掉。create-product 底欄那顆 Next 就是這個狀態——看起來可按、其實不能按。

本體把停用態補回去（`backdrop-filter:none`、`box-shadow:none`、`::before { content:none }`），這是熔接進本體時必須做的收尾，不是新增設計。

### 4. 捲軸佔位 — 不在本波範圍

skin 第 1295–1298 行的 `html[data-ztorui] * { scrollbar-color: … }` 屬 §7 控件表面那一節。它讓 Chrome 改用不佔版面的原生捲軸，所以沙盒的 `.main` `clientWidth == offsetWidth`；r2.3 仍走 `::-webkit-scrollbar` 的實體捲軸、佔 12px。

這是三頁 computed 抽查裡**唯一**剩下的差異（表現為 `.page-crumb`／`.wizard__top` 等元素寬度差 12px）。兩邊 `.main` 的 `scrollHeight`（4590）與 `clientHeight`（856）逐字相同，確認是捲軸樣式差異、不是版面回歸。留給後續波次。

### 5. 沙盒 §4.4 的 `:not(.chip--active)` 一類提權寫法

覆蓋層為了不誤傷選中態而寫的 `:not()` 主語、以及 `html[data-ztorui]` 前綴，都是覆蓋層專用的特異度手段。本體是改原定義、順序天然正確，一律用乾淨選擇器，不搬。

## 三頁 computed 抽查（沙盒 4351 vs r2.3 4326，1440×900、dark）

抽查腳本對 36 個選擇器（含 8 個偽元素）各取 25 個屬性逐字比對。

### e-shop.html — 1 處差異

| 元素 | 抽查屬性 | 結果 |
|---|---|---|
| `.btn--primary` ＋ `::before` | bg-image / backdrop / box-shadow / color / filter / content / inset 高度 | 逐字相同 |
| `.tabs--underline-short .tabs__item--active::after` | bg-image / radius / 三層 box-shadow | 逐字相同 |
| `.tabs--underline-label … > :first-child::after` | 同上 | 逐字相同 |
| `.filter-tabs__item--active` ＋ `::after` | bg / backdrop / color / text-shadow / bg-image / filter / height | 逐字相同 |
| `.filter-tabs__item--active .filter-tabs__count` | bg / padding / color | 逐字相同（**修過順序後**才一致，見 §4.4） |
| `.app-sidebar__link` / `__sub-link` / `__action` | radius / color / padding-left | 逐字相同（膠囊 9999px、子項 19px） |
| `.app-sidebar__subnav > div` | margin-left | `21px` 兩邊相同 |
| `.app-sidebar__sub-link--lang` | padding-left | `27px` 兩邊相同 |
| `.page-crumb` / `> span:last-child` / `__back` | color | `rgba(255,255,255,.7)` / `rgba(255,255,255,.95)` 相同 |
| `.switch` / `.switch--on` / `::after` | bg-image / backdrop / box-shadow / knob 色 | 逐字相同 |
| `.app` / `.main` | bg / radius / height | 逐字相同 |
| **`.page-crumb`** | **width** | **1094px vs 1082px** — 捲軸佔位，見「不搬清單 4」 |

### product-detail.html — 8 處差異，全部歸類完畢

| 元素 | 抽查屬性 | 結果 |
|---|---|---|
| `.btn--primary` ＋ `::before`、tabs 燈條、側欄三態、麵包屑、`.kpi__value`、`.chip`、`.segmented` | 全部 | 逐字相同 |
| `.chip--active` | bg / box-shadow | 數值相同、**序列化不同**（`color(srgb 1 1 1 / 0.12)` vs `rgba(255,255,255,0.12)`）——沙盒經 `color-mix()`、本體直接吃 token，算繪結果相同 |
| `.chip--active` | border-*-color | 沙盒殘留 `color-mix(--primary 45%)`、本體是 currentColor；**兩邊 border-width 皆 0**，不可見 |
| `.radio-cards .segmented__btn`／`--active` | border-radius | 24px vs 9999px — 見「不搬清單 2」（該元件在本頁藏在補貨彈窗裡，高度 0、不可見） |

### create-product.html（點「Physical item」進主體）— 差異全部歸類完畢

| 元素 | 抽查屬性 | 結果 |
|---|---|---|
| `.segmented` / `__btn` / `--active` | bg / radius / backdrop / box-shadow / color | 逐字相同 |
| `.switch` / `--on` / 兩個 `::after` | 全部 | 逐字相同 |
| `.chip` / `.chip--active` | bg / color / box-shadow | 相同（同上序列化差） |
| `.wizard__top` / `::before` / `.wizard__bottom` / `.wizard__top-lead` | bg / backdrop / border / box-shadow | 逐字相同（`::before` 的 `box-shadow: none` **修過順序後**才一致） |
| `.tabs--underline-short … ::after` | 全部 | 逐字相同 |
| `.wizard__bottom .btn--primary` | bg / backdrop / box-shadow / color / `::before` | **刻意不同**：沙盒仍發光、本體正確呈現停用態（見「不搬清單 3」） |
| `.segmented.radio-cards` 容器、`.radio-cards .segmented__btn` radius | bg / border / radius | **刻意不同**（見「不搬清單 2」） |

### KPI 溢出檢查（product-detail 的 `.kpi--compact`，卡寬 97px）

| 值 | scrollWidth | clientWidth | 溢出 |
|---|---|---|---|
| `92` | 69 | 69 | 否 |
| `$2,944` | 73 | 69 | 4px |
| `$2,372` | 73 | 69 | 4px |
| `4.2%` | 69 | 69 | 否 |

沙盒逐字相同（73/69）。另在同一顆元素上把字重、字距臨時改回 r2.2 的 `400 / -0.6px` 實測，`scrollWidth` 仍是 73 —— 這 4px 是既有狀況，**不是本波造成的**。字面確認是 `Satoshi`、字級 22px、字重 300、字距 −0.44px（＝−0.02em）、行高 24.2px（＝1.1）。

## 非三頁抽查（截圖）

- **`orders.html`**：側欄選中「Orders」是橘光膠囊、hover 是薄膜；麵包屑「E-Shop / Order management」上層 70% 白、當前層 95% 白；四張 KPI 卡的數字（3／1／3／3）Light 字重、無溢出；狀態 filter-tabs「All status 12」是中性玻璃殼＋橘光字、計數平鋪無泡泡；表格列與狀態徽章不受影響。無破版。
- **`earnings.html`（→ earnings-sony）**：`filter-tabs--source` 那一排（All／Co-creation／OTT royalties…）已選的「All」是中性玻璃殼＋橘光字，未選項的彩色圓點與文字都在；`.segmented`（Day／Month／3 months／Year）的「Month」是橘漸層膠囊、軌道是薄膜；主要按鈕「Withdraw」發光、次要「Donate」不受影響；三張大 KPI（NTD 51,180／4,957／2,200）Light 字重、無溢出。無破版。
- **`e-shop.html?nav=topbar`**：外殼補件後內容區不再是實色圓角面板，頂欄玻璃、內容直接躺在檯面上。無破版。
- **`bundle-detail.html`**（為驗 §14 而開）：捲動後吸底列出現，實色 `--popover` ＋ 向上投影 ＋ 上緣髮絲線。無破版。

## check_ds_sync.py

`RESULT: PASS + WARN (raw-color, md-html-sync)` — 與動工前同一組 WARN，無新增 FAIL。

- 檢查 5（元件 CSS 裸 hex/rgb）：**46 → 45 處**，本輪零新增、還少一處（`.sticky-actions` 那支寫死的 `rgba(0,0,0,0.08)` 收進 `--ztu-shadow-pop-up`）。新寫的值全部走 token 或 `color-mix(token …)`。
- 檢查 9（md↔html 同步）：`--ztu-*` 與 `--bloom-surface` 尚未寫進 `design-system.md`／`.html`——Wave 1 已掛帳的同一筆，文件層排在 Wave 2c。本波新增的 4 支 `--ztu-*` 與 `--font-dot` 一併掛在這筆底下。
- 檢查 10（頁面裸值棘輪）：PASS，**68 → 67 處**，未上升。
- 其餘 10 項全 PASS。

`ds-baseline.json` 未修改。

## 截圖存放

本波截圖在 `Project/ztor-creator-studio/screenshots/`：

- `wave2b-r2.3-e-shop.png`（三頁之一，側欄模式）
- `wave2b-r2.3-e-shop-topbar.png`（`?nav=topbar`，驗外殼補件）
- `wave2b-r2.3-orders.png`、`wave2b-r2.3-earnings.png`（非三頁抽查）
- `wave2b-r2.3-design-system-segmented.png`（DS 頁 segmented demo）
- `wave2b-沙盒-create-product-gate-膠囊誤傷.png`（「不搬清單 2」的證據：沙盒兩張大卡被畫成黏在一起的膠囊）
