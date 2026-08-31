# r2.3 Wave 1 熔接紀錄（地基層）

2026-08-28。把換皮沙盒 `demo/ztorui-skin/skin/ztorui-skin.css`（1,883 行覆蓋層）的**地基四塊**翻譯成 r2.3 本體定義：§1 字型、§2 token delta、§3.0 app shell 外殼＋§3.4 側邊欄、§6 星空背景。遷移計劃見專案根 `r2.3-遷移計劃.md`。

熔接後 r2.3 的頁面不掛任何 skin 檔、HTML 一字未改，就長出沙盒的地基視覺。全檔零個 `data-ztorui`、零個 `!important`。

## 動到的檔案

一共四支 CSS ＋ 六個字檔複製，其他一律未動。

- `ds-components/fonts.css`
- `ds-components/_tokens.css`
- `shared.css`
- `fonts/`（新增 6 個 woff2）

## §1 字型

### 字檔

從 `demo/ztorui-skin/skin/fonts/` 複製 6 個 woff2 到 `site/r2.3/fonts/`：

- `poppins-v24-latin-300.woff2`
- `poppins-v24-latin-regular.woff2`
- `poppins-v24-latin-500.woff2`
- `poppins-v24-latin-600.woff2`
- `doto-v3-latin-600.woff2`
- `doto-v3-latin-700.woff2`

Doto 兩支是**元件層 KPI 數字**要用的，本波先搬檔、不宣告 `@font-face`——沙盒的 skin 檔本身也沒有宣告它（全檔零引用），先宣告會讓下一個讀檔的人以為站上已經有第三個拉丁字面在用。

### @font-face

`ds-components/fonts.css:39–66` 新增 Poppins 四個字重的 `@font-face`，`src` 照該檔既有寫法指 `../fonts/`，`font-display: swap`。位置緊接在 Inter 那條之後。

### 字型 token（三處）

沙盒堆疊：`'Poppins', var(--font-cjk), system-ui, sans-serif`。三處全部改成同一條。

| 檔案 | 行 | 舊值 | 新值 |
|---|---|---|---|
| `_tokens.css` | 402–404 | `'Geist'`／`'Geist'`／`'Inter'` + `system-ui, sans-serif` | Poppins 堆疊 |
| `fonts.css` | 233–235 | `"Satoshi","Geist",var(--font-cjk-display)…`／`"Satoshi","Geist",var(--font-cjk)…`／`"Satoshi","Inter",var(--font-cjk)…` | Poppins 堆疊 |
| `shared.css` | 132–144（`:lang(zh-Hant)`） | `var(--font-cjk-display),'Satoshi','Geist'…`／`var(--font-cjk),'Satoshi','Geist'…`／`var(--font-cjk),'Satoshi','Inter'…` | Poppins 堆疊 |

第三處是任務書沒點名、但**不改就會失效**的一處：`:lang(zh-Hant)`（特異度 0,1,0）在 r2.2 把中文字面提到第一位，而站上全部頁面都是 `lang="zh-Hant"`。沙盒靠 `html` 屬性閘（0,1,1）壓過它，所以沙盒實際跑的一直是 Poppins 開頭。熔接要對齊的是沙盒畫面，因此這三條也一起改。中文字面的 `unicode-range` 釘死在 CJK 區塊，中文字仍逐字落到 `--font-cjk`；改變的是行高與基線由 Poppins 決定——這正是沙盒現況。

`--font-mono` 未動。

## §2 Token delta 逐條對照

放置規則：該 token 在 `[data-theme="dark"]` 有覆寫的就改 dark 那條；只在 `:root` 定義的非主題值（圓角、模糊、字型）就改 `:root` 那條。行號為熔接後的 `ds-components/_tokens.css`。

### 類別 1 · 主色／強調色家族

| Token | 舊值 | 新值 | 區塊 | 行 |
|---|---|---|---|---|
| `--primary` | `#ffa33f` | `var(--ztu-orange)`（同值） | dark | 720 |
| `--primary-foreground` | `#171717` | `var(--ztu-accent-fg)` | dark | 721 |
| `--on-primary` | `#171717` | `var(--ztu-accent-fg)` | dark | 722 |
| `--primary-hover` | `#ffb866` | `var(--ztu-orange-hi)`（#ffc178） | dark | 723 |
| `--chart-1` | `#ffa33f` | `var(--ztu-orange)`（同值） | dark | 753 |
| `--sidebar-primary` | `#ffa33f` | `var(--ztu-orange)`（同值） | dark | 768 |
| `--sidebar-primary-foreground` | `#171717` | `var(--ztu-accent-fg)` | dark | 769 |
| `--brand-ink` | `#ffa33f` | `var(--ztu-orange-hi)` | dark | 782 |
| `--selected-surface` | `--primary 14%` | `--primary 13%` | dark | 783 |
| `--selected-surface-hover` | `--primary 20%` | 未動（沙盒同值） | dark | 784 |
| `--gradient-brand` | `90deg,#ffb866,#ffa33f 55%,#ff7a4d` | `90deg,#ffc178,#ffa33f 55%,#f2871f` | dark | 801 |

橘底改白字的已知代價：白字在 78% 橘上約 2.4:1、在實色橘上 1.9:1，低於 WCAG AA 4.5:1。這是 2026-08-26 已裁決並載明的取捨，不是漏檢。

### 類別 2 · 邊框線色

| Token | 舊值 | 新值 | 區塊 | 行 |
|---|---|---|---|---|
| `--border` | `#373839` | `rgba(255,255,255,0.10)` | dark | 736 |
| `--input` | `#373839` | `rgba(255,255,255,0.10)` | dark | 737 |
| `--nest-line` | `transparent` | `rgba(255,255,255,0.10)` | dark | 745 |
| `--sidebar-border` | `#333435` | `rgba(255,255,255,0.10)` | dark | 772 |
| `--border-soft` | `#202122` | `rgba(255,255,255,0.10)` | dark | 794 |
| `--border-inverse` | `rgba(255,255,255,0.1)` | 未動 | `:root`（兩主題同值） | 123 |

`--border-inverse` 是唯一一條不需要動的 delta：r2.2 的值與沙盒目標值本來就相同（`0.1` 與 `0.10` 是同一個顏色）。

### 類別 3 · 文字層級

| Token | 舊值 | 新值 | 區塊 | 行 |
|---|---|---|---|---|
| `--foreground` | `#FDFDFD` | `rgba(255,255,255,0.95)` | dark | 687 |
| `--card-foreground` | `#FDFDFD` | `rgba(255,255,255,0.95)` | dark | 689 |
| `--popover-foreground` | `#FDFDFD` | `rgba(255,255,255,0.95)` | dark | 691 |
| `--muted-foreground` | `#979797` | `rgba(255,255,255,0.45)` | dark | 707 |
| `--accent-foreground` | `#FDFDFD` | `rgba(255,255,255,0.95)` | dark | 710 |
| `--sidebar-foreground` | `#FDFDFD` | `rgba(255,255,255,0.95)` | dark | 767 |
| `--foreground-muted` | `#B9B9B9` | `rgba(255,255,255,0.70)` | dark | 791 |

### 類別 4 · 圓角

全部在 `:root`（非主題值）。

| Token | 舊值 | 新值 | 區塊 | 行 |
|---|---|---|---|---|
| `--radius-sm` | `3px` | `10px` | `:root` | 219 |
| `--radius` | `6px` | `10px` | `:root` | 220 |
| `--radius-md` | `var(--radius)` | 未動（別名，跟著走） | `:root` | 221 |
| `--radius-lg` | `8px` | `16px` | `:root` | 222 |
| `--radius-xl` | `16px` | `24px` | `:root` | 223 |
| `--radius-shell` | `28px` | `30px` | `:root` | 224 |
| `--radius-pill` | `9999px` | 未動 | `:root` | 225 |

### 類別 5 · 陰影

| Token | 舊值 | 新值 | 區塊 | 行 |
|---|---|---|---|---|
| `--shadow-raise-strong` | `0 1px 2px rgba(0,0,0,.6)` | `0 12px 40px rgba(0,0,0,0.5)` | dark | 841 |
| `--shadow-card` | `0 2px 6px rgba(0,0,0,.4), 0 0 0 1px rgba(253,253,253,.08)` | `0 24px 60px rgba(0,0,0,0.45)` | dark | 844 |
| `--shadow-float` | `0 6px 16px -4px rgba(0,0,0,.5), 0 0 0 1px rgba(253,253,253,.10)` | `0 12px 40px rgba(0,0,0,0.5)` | dark | 847 |
| `--shadow-card-hover` | `var(--shadow-float)` | 未動（跟著 float 走） | dark | 849 |
| `--shadow-lift-flat` | `var(--shadow-float)` | `0 24px 60px rgba(0,0,0,0.45)` | dark | 851 |
| `--shadow-overlay` | `0 16px 40px -8px rgba(0,0,0,.6), 0 0 0 1px rgba(253,253,253,.12)` | `0 12px 40px rgba(0,0,0,0.5)` | dark | 854 |
| `--shadow-edge-top` | `inset 0 1px 0 rgba(253,253,253,.05)` | `inset 0 1px 0 rgba(255,255,255,0.15)` | dark | 863 |
| `--shadow-header` | `0 3px 16px rgba(0,0,0,.45)` | `0 12px 40px rgba(0,0,0,0.5)` | dark | 876 |

### 類別 6 · 模糊與遮罩

| Token | 舊值 | 新值 | 區塊 | 行 |
|---|---|---|---|---|
| `--overlay-blur` | `blur(14px) saturate(140%)` | `blur(24px) saturate(1.25)` | `:root`（dark 無覆寫） | 385 |
| `--overlay-tint` | `rgba(0,0,0,0.6)` | `color-mix(in srgb, #0e0d0c 65%, transparent)` | dark | 800 |

### 新增：`--ztu-*` 原料層

`ds-components/_tokens.css:608–661`（`:root` 內新段，段落註解已註明「深色語彙、light 模式未調」）。token 名一律照舊不改名，共 24 支：

- 橘三階：`--ztu-orange`／`-hi`／`-lo`
- 玻璃與檯面：`--ztu-glass-bg`／`-strong`／`-rim`／`--ztu-canvas`／`--ztu-blur-shell`／`--ztu-shell-gutter`／`--ztu-shell-solid`／`--ztu-blur-glass`／`--ztu-blur-heavy`／`--ztu-shadow-card`／`--ztu-shadow-pop`
- 霧光色票：`--ztu-bloom-1` ~ `-4`
- 發光家族：`--ztu-accent-surface`／`-blur`／`-glow`／`--ztu-pill-active-glow`／`--ztu-accent-fg`
- `--bloom-surface`（刻意不加前綴，沙盒規格 §3.8 的 ::before 一字不差照抄那段寫的就是這個名字）

## §3.0 app shell 外殼 ＋ §3.4 側邊欄

skin 原檔行段 → `shared.css` 落點。全部就地改本體原定義，沒有一條寫在檔尾覆蓋。

| skin 行段 | 內容 | shared.css 落點 |
|---|---|---|
| 251–260 | sidebar 模式 body 檯面色 ＋ `:has(> .app)` shell 留白 | 205–241（與 §6 的兩團暖光合併成一條 body 規則） |
| 264–283 | `.app` 撤外框、加 gap、overflow | 200–212（base `.app`）＋ 241 那條的 `background-color: transparent` |
| 284–292 | `.app` ≥901px 高度扣 gutter ＋ `min-height: 0` | 219–226 |
| 297–307 | `.app-sidebar` 玻璃四件套 | 284–303 |
| 308–310 | ≤900px 側欄圓角歸零 | 308–310 |
| 311–313（含 §3.4 的說明） | ≥901px 側欄高度吃滿外框 | 312–314 |
| 322–347 | `.main` 透明、無邊、無圓角 | 639–664 |
| 341–348 | ≤900px 收掉 shell 留白／圓角 | 667–681 |
| 464–478（§3.4） | `.app-sidebar { border-right: 0 }` | 已是 r2.2 本體原值，未重複寫 |
| 479–484（§3.4） | `.app-sidebar__lang-panel` 維持實色浮層 | 437–448 |

跳過的：skin 314–320 的「§3.4b 向外圓角」——該節已在沙盒 2026-08-28 標註退場，全節只有註解、沒有規則。

### 刪除／取代的 r2.2 原始宣告

| 檔案:行（改前） | 原宣告 | 處置 |
|---|---|---|
| `shared.css:217` | `html[data-nav-mode="sidebar"] body { background: var(--surface-shell); }` | 整條取代成檯面色＋兩團暖光 |
| `shared.css:221` | `html[data-nav-mode="sidebar"] .app { background: var(--surface-shell); }` 的 background | 改 `background-color: transparent` |
| `shared.css:197` | `@media(min-width:901px) .app { height: 100vh }` | 改 `calc(100vh - var(--ztu-shell-gutter) * 2)`，並補 `min-height: 0` |
| `shared.css:241` | `.app-sidebar { background: transparent }` | 改 4% 白玻璃，並補 backdrop-filter／border-radius／box-shadow |
| `shared.css:566` | `html[data-nav-mode="sidebar"] .main { background: var(--surface-page) }` | 改 `background-color: transparent`，補 `backdrop-filter: none`／`border: 0` |
| `shared.css:574` | `.main { border-radius: var(--radius-shell) var(--radius-shell) 0 0 }` | 改 `border-radius: 0`，補 `box-shadow: none` |
| `shared.css:580` | ≤900px `.main { background: var(--background) }` | 改 `background-color: transparent` |
| `_tokens.css:386–388` | Geist／Inter 字型堆疊 | 整條取代 |
| `fonts.css:200–202` | Satoshi／Geist／Inter 三條堆疊 | 整條取代 |
| `shared.css:132–134` | `:lang(zh-Hant)` 三條 CJK-first 堆疊 | 整條取代 |
| `_tokens.css` 圓角六條、`--overlay-blur`、dark 區塊 25 條 | 見上方 §2 表 | 就地換值，舊值寫進註解備查 |

## §6 星空背景

skin 原檔 874–1235 行 → `shared.css:2246–2604`（檔尾新段，段落註解已標明來源與行段）。選擇器一律去掉沙盒的 html 屬性閘前綴。

搬進來的東西：

- 精靈頁靜態點陣（`.wizard`、`.wizard__sheet--sectioned`，22px 格距）
- 列表頁（`:has(.list-dock)`）四層一起 mask 漸消，區間 36%→90%
- 四層星點共用骨架（`position: fixed`／`inset: 0`／`z-index: -1`）
- 四層各自的 radial-gradient 星圖（620／680／740／810px 四種磚，位置與 alpha 一字不差照抄）
- 四組 `@keyframes ztu-star-a` ~ `-d`（7／11／9／13 秒，負延遲 0／−3／−5／−8）
- `prefers-reduced-motion: reduce` 凍結在 `opacity: 0.85`

沒搬進這一節的：檯面兩團暖光（skin 909–920）——它與 §3.0 的檯面色是同一個選擇器，已就地併進 `shared.css:212–218` 的 body 原定義，不重複寫。

### 星空熔接踩到的一個坑（沙盒沒有、r2.3 才有）

沙盒的 skin 規則帶 html 屬性閘（特異度 0,2,1），去掉前綴後 `.wizard`／`.wizard__sheet--sectioned` 只剩 0,1,0，被 r2.2 本體既有的 `[data-theme="dark"] .wizard`（0,2,0）壓過；而那條用的是 `background` **簡寫**，簡寫會把 `background-image` 一併歸零，於是精靈頁的點陣整條消失（實測 computed `background-image: none`）。

修法是改本體原定義、不是加特異度：把四條相關規則的 `background` 簡寫改成 `background-color`，顏色一個位元都沒動。

- `shared.css:1172` `.wizard`
- `shared.css:1187` `.wizard__sheet--sectioned`
- `shared.css:1406` `[data-theme="dark"] .wizard`
- `shared.css:1407` `[data-theme="dark"] .wizard__sheet`

## 已知陷阱的保住狀況

- **body 不吃平鋪格距**：全檔掃過，唯一帶 `background-size: <px>` 的規則是 `.wizard`／`.wizard__sheet--sectioned` 與四個星空**偽元素**；`body` 自己的 `background-size` 是 `auto, auto`（實測與沙盒相同）。
- **`.app` 的 `min-height: 0`**：已與 `height: calc(...)` 同條寫在 ≥901px（`shared.css:226`），實測 `min-height: 0px`、無多餘捲軸。
- **`body:has(> .app)` 限定 shell 留白**：`create-product.html`（有 `data-nav-mode="sidebar"`、走 `.wizard` 沒有 `.app`）實測 `padding: 0px`、`scrollHeight === clientHeight`，沒有被推出捲軸。
- **星空只動 opacity**：四層都只有 `animation` 改 `opacity`，合成器動畫。
- **四個偽元素無衝突**：熔接前已 grep 過 `shared.css` 與 `ds-components/`，`html::before/after`、`body::before/after` 原本零使用。

## 驗證

### 與沙盒的 computed 對照（1440×900，e-shop.html）

49 支 token 逐支比對 r2.3 與沙盒的 `getComputedStyle` 值：**48 支完全相同**，唯一差異是 `--border-inverse` 的文字寫法（`0.1` vs `0.10`，同一個顏色）。

外殼幾何與材質逐項相同：body 檯面 `rgb(10,10,9)`、body padding 14px、`.app` 透明／872px／min-height 0／gap 14px／overflow hidden、側欄 `color(srgb 1 1 1 / 0.04)` ＋ `blur(26px) saturate(1.12)` ＋ 30px 圓角 ＋ inset rim ＋ height 872px、`.main` 透明無圓角、`html::before` fixed／`ztu-star-a 7s 0s`／z-index −1／620px 磚。

其他頁型：
- `create-product.html`（精靈）：點陣 `radial-gradient(color(srgb 1 1 1 / 0.0560784) 1px, ...)` ＋ `22px 22px`，與沙盒逐字相同。
- `e-shop.html`（列表）：四層 mask 皆為 `linear-gradient(rgb(0,0,0) 36%, rgba(0,0,0,0) 90%)`，與沙盒相同。
- 375×812（mobile）：body padding 0、側欄圓角 0、`.main` 透明無圓角，與沙盒相同。

### check_ds_sync.py

`RESULT: PASS + WARN (raw-color, md-html-sync)`

- 檢查 5（裸 hex/rgb，46 處）：與 r2.2 完全相同的存量，本波沒有新增。
- 檢查 9（md↔html 同步）：**本波新增的 WARN**——24 支新 `--ztu-*` token 與 `--bloom-surface` 還沒寫進 `design-system.md`／`.html`。文件層屬 Wave 4，且本波紅線禁止動這兩支檔。
- 檢查 10（頁面裸值棘輪）：**PASS**，存量 68 處未上升。

## 本波刻意沒做的

- skin §3.1–§3.3、§3.5、§3.6、§4、§5、§7、§9–§15 全部沒動（元件層，Wave 2）。
- skin §8 是註解區、本來就不生效，沒搬。
- Doto 的 `@font-face`（字檔已搬，宣告留給元件層 KPI 數字那一波）。
- `design-system.md`／`.html`／`ds-baseline.json`／任何 HTML／其他 `ds-components/*.css`：一個位元組都沒動。
