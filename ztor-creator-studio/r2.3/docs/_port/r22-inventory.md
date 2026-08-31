# ztorui-skin 換皮沙盒 · r2.2 可覆寫標的清單

範圍：`demo/ztorui-skin/{e-shop,product-detail,create-product}.html` 三頁 + 其相依 CSS。

token 來源：`ds-components/_tokens.css`（835 行，全讀）。共 260 條 token，其中 75 條在 `[data-theme="dark"]` 下被重新賦值。


---

## 第一部分：Token 盤點

欄位：`token 名` | `目前的值（亮色版）` | `說明` | `行號` | 是否深色覆寫


### 色彩／基礎面與文字

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--background` | `#FFFFFF` | 全站畫布底色（body 背景） | 27 | 是 |
| `--foreground` | `#1A1A1A` | 主要文字色（off-black，非純黑） | 28 | 是 |
| `--card` | `#FFFFFF` | 卡片／面板底色（也是 dropdown/zselect/preview-panel 等大多數浮層的底） | 29 | 是 |
| `--card-foreground` | `#000000` | 卡片內文字色（目前未見大量消費，語意備用） | 30 | 是 |
| `--popover` | `#FFFFFF` | popover 浮層底色（語意別名，多數元件實際引用的是 --card） | 31 | 是 |
| `--popover-foreground` | `#000000` | popover 內文字色（備用別名） | 32 | 是 |
| `--muted` | `#FAFAFA` | 次級底色／凹槽色：segmented 軌道、媒體井、進度條底、preview-panel__body 襯底 | 33 | 是 |
| `--muted-foreground` | `#6E6E68` | 輔助文字色（次要說明文字的標準色階） | 34 | 是 |
| `--accent` | `#F3F3F3` | 互動 hover 底色統一值：連結/按鈕/選單項目 hover 都吃這支 | 36 | 是 |
| `--accent-foreground` | `#000000` | accent 底色上的文字色 | 37 | 是 |

### 色彩／主色與強調色

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--primary` | `#ffa33f` | 品牌橘（CTA 主色、選中態、focus ring 顏色來源） | 40 | 是 |
| `--primary-foreground` | `#171717` | 鋪在 --primary 實色橘上的按鈕標籤文字色（現深墨，2026-07-28 由白改深墨修 WCAG） | 47 | 是 |
| `--on-primary` | `#171717` | 大面積橘底（如 kpi--hero 整張卡）上保證可讀的墨色，恆為深墨 | 52 | 是 |
| `--primary-hover` | `#ffb866` | 主要按鈕 hover 態橘色（比 --primary 亮） | 53 | 是 |
| `--destructive` | `#DA314A` | 破壞性操作色（刪除等），紅 | 56 | 是 |
| `--destructive-foreground` | `#FFFFFF` | 鋪在 --destructive 實色上的文字色 | 57 | 是 |
| `--ring` | `var(--primary)` | focus ring 顏色，恆等於 --primary（品牌橘） | 73 |  |

### 色彩／邊界與控件填色

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--border` | `#EAEAEA` | 一般 hairline 邊界色 | 60 | 是 |
| `--input` | `#EAEAEA` | 控件邊框色（現＝--border 同值） | 61 | 是 |
| `--input-surface` | `var(--card)` | 控件填色底：輸入框/select/chip 未選態的底；深色比卡亮一階、亮色＝白卡 | 62 | 是 |
| `--nest-surface` | `transparent` | 巢狀層（.nest／.card--muted）疊加色：亮色透明、深色為半透明白膜 | 65 | 是 |
| `--nest-line` | `rgba(16, 17, 20, 0.08)` | 巢狀層邊界：亮色可見髮絲線、深色透明（改靠色差分層） | 68 | 是 |
| `--control-raise` | `var(--card)` | 浮在某個面上的控件填色（如 outline 按鈕）：相對所在層再亮一階，不寫死絕對色 | 72 | 是 |

### 色彩／圖表色序

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--chart-1` | `#ffa33f` | 圖表色序 1：橘（＝品牌色） | 76 | 是 |
| `--chart-2` | `#266DF0` | 圖表色序 2：藍 | 77 | 是 |
| `--chart-3` | `#22C55E` | 圖表色序 3：綠 | 78 | 是 |
| `--chart-4` | `#F8D749` | 圖表色序 4：黃 | 79 | 是 |
| `--chart-5` | `#8B5CF6` | 圖表色序 5：紫 | 80 | 是 |
| `--chart-6` | `#EC4899` | 圖表色序 6：玫紅（商品收益類型） | 81 | 是 |
| `--chart-7` | `#06B6D4` | 圖表色序 7：青（門票收益） | 82 | 是 |
| `--chart-8` | `#7C4A2D` | 圖表色序 8：赭（貼文帶貨收益） | 83 | 是 |

### 色彩／側欄與頂欄

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--sidebar` | `#FBFBFB` | 側欄／頂欄底色 | 88 | 是 |
| `--sidebar-foreground` | `#000000` | 側欄／頂欄文字色 | 89 | 是 |
| `--sidebar-primary` | `#ffa33f` | 側欄品牌色（＝橘，備用別名） | 90 | 是 |
| `--sidebar-primary-foreground` | `#FFFFFF` | 側欄品牌底上的文字色 | 91 | 是 |
| `--sidebar-accent` | `#F3F3F3` | 側欄 hover 底色 | 92 | 是 |
| `--sidebar-accent-foreground` | `#000000` | 側欄 hover 底上的文字色 | 93 | 是 |
| `--sidebar-border` | `#EAEAEA` | 側欄邊界色 | 94 | 是 |
| `--sidebar-ring` | `var(--primary)` | 側欄 focus ring（＝品牌橘） | 95 | 是 |
| `--sidebar-active` | `#ECECEC` | 側欄已選 pill 的回退底色（多數已改吃 --selected-* 系列） | 96 | 是 |

### 色彩／已選中狀態

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--brand-ink` | `#8F4E00` | 「品牌橘但當文字用」的可讀版本（亮色壓深成 #8F4E00，過 WCAG AA） | 110 | 是 |
| `--selected-surface` | `color-mix(in srgb, var(--primary) 14%, transparent)` | 已選中狀態的淡橘底（14% 品牌橘）：導覽/篩選/segment/chip 的選中態 | 111 | 是 |
| `--selected-surface-hover` | `color-mix(in srgb, var(--primary) 20%, transparent)` | 已選中狀態 hover 加深版（20% 品牌橘） | 112 | 是 |
| `--selected-ink` | `var(--brand-ink)` | 已選中狀態文字色，語意別名＝--brand-ink | 113 | 是 |

### 色彩／擴充面層（creator extensions）

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--surface-shell` | `#F0F0EE` | app shell 外殼底色（比 surface-page 淺一階） | 116 | 是 |
| `--surface-page` | `#FAFAFA` | shell 內 route page 的底色（content 層，最深） | 117 | 是 |
| `--surface-inverse` | `#000000` | 反轉色塊（footer 等高對比黑條） | 118 | 是 |
| `--foreground-muted` | `#4D4D4D` | 中階文字色（比 --muted-foreground 重、比 --foreground 淡） | 119 | 是 |
| `--foreground-on-inverse` | `#FFFFFF` | 反轉黑條上的文字色 | 120 | 是 |
| `--foreground-on-inverse-muted` | `rgba(255, 255, 255, 0.6)` | 反轉黑條上的次要文字色 | 121 | 是 |
| `--border-soft` | `#EFEFEF` | 更淡的分隔線（列表列分隔線等用這支，非 --border） | 122 | 是 |
| `--border-inverse` | `rgba(255, 255, 255, 0.1)` | 深色 slab 上的 hairline（兩主題同值） | 123 |  |
| `--gradient-brand` | `linear-gradient(90deg, #ffd9a0 0%, #ffa33f 55%, #ff7a4d 100%)` | 品牌橘漸層（進度條等使用） | 124 | 是 |

### 色彩／狀態色（成功·警告·危險·資訊）

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--status-success` | `#22C55E` | 成功狀態色（綠） | 127 | 是 |
| `--status-success-ink` | `#052E16` | 成功徽章墨色（坐在深底/亮底上分別取值以過 WCAG） | 139 | 是 |
| `--destructive-ink` | `#4C0519` | 危險徽章墨色（同上邏輯） | 140 | 是 |
| `--faint-ink` | `color-mix(in srgb, var(--muted-foreground) 72%, transparent)` | 比 --muted-foreground 更淡一階的文字色（表頭墨色等的基底） | 156 |  |
| `--column-head-ink` | `var(--faint-ink)` | 表格/清單欄位表頭墨色，語意別名＝--faint-ink | 157 |  |
| `--locked-field-ink` | `color-mix(in srgb, var(--muted-foreground) 55%, transparent)` | 鎖定唯讀欄位值的墨色，全站最淡的文字階，只保證認得出 | 165 |  |
| `--status-success-fill` | `color-mix(in srgb, var(--status-success) 12%, transparent)` | 成功狀態淡染底（12% 透明） | 166 |  |
| `--destructive-fill` | `color-mix(in srgb, var(--destructive) 12%, transparent)` | 危險狀態淡染底（12% 透明） | 167 |  |
| `--status-success-deep` | `color-mix(in srgb, var(--status-success) 35%, #1a1208)` | 坐在實色暖底（如 kpi--hero）上的深綠版成功墨色 | 195 |  |
| `--destructive-deep` | `color-mix(in srgb, var(--status-error)   35%, #1a1208)` | 坐在實色暖底上的深紅版危險墨色 | 196 |  |
| `--status-info` | `#266DF0` | 資訊狀態色（藍） | 197 | 是 |
| `--status-warning` | `#F8D749` | 警示狀態色（黃） | 198 | 是 |
| `--status-warning-ink` | `#8A6D00` | 警示徽章可讀墨色（黃本身對白對比不足，另開一支） | 203 | 是 |
| `--status-info-ink` | `#1D4ED8` | 資訊徽章墨色 | 204 | 是 |
| `--status-accent-ink` | `#6D28D9` | 第三類徽章（紫）墨色 | 205 | 是 |
| `--status-accent` | `#8B5CF6` | 第三類分類徽章色（紫） | 206 | 是 |
| `--status-error` | `#DA314A` | 狀態徽章專用錯誤色（與 --destructive 語意分開：這支給小字徽章、--destructive 給刪除等破壞操作） | 207 | 是 |

### 尺寸／圓角

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--radius-sm` | `3px` | 最小圓角 | 210 |  |
| `--radius` | `6px` | 標準圓角（按鈕等） | 211 |  |
| `--radius-md` | `var(--radius)` | 中圓角，別名＝--radius | 212 |  |
| `--radius-lg` | `8px` | 大圓角（導覽面板等） | 213 |  |
| `--radius-xl` | `16px` | 卡片級圓角 | 214 |  |
| `--radius-shell` | `28px` | app shell 最外層圓角 | 215 |  |
| `--radius-pill` | `9999px` | 全圓角（膠囊/圓形） | 216 |  |

### 尺寸／捲軸與 shell

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--scrollbar-size` | `12px` | 自訂捲軸軌道寬 | 226 |  |
| `--scrollbar-thumb` | `color-mix(in srgb, var(--foreground) 14%, transparent)` | 捲軸滑塊色（14% 前景色） | 227 |  |
| `--scrollbar-thumb-hover` | `color-mix(in srgb, var(--foreground) 32%, transparent)` | 捲軸滑塊 hover 色（32% 前景色） | 228 |  |
| `--space-shell-gutter` | `16px` | 桌機 shell 頂部留白 | 229 |  |

### 尺寸／控件高度

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--control-h-xs` | `28px` | 控件高度：密集（表格內欄位），28px | 237 |  |
| `--control-h-sm` | `36px` | 控件高度：單行控件實際預設（input/select/btn），36px | 238 |  |
| `--control-h-md` | `44px` | 控件高度：ztor-btn／btn--lg 用，44px | 239 |  |
| `--control-h-lg` | `52px` | 控件高度刻度，52px（目前無消費者） | 240 |  |
| `--control-h-xl` | `60px` | 控件高度刻度，60px（目前無消費者） | 241 |  |

### 尺寸／間距刻度 --sp-*

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--sp-2` | `2px` |  | 249 |  |
| `--sp-4` | `4px` |  | 250 |  |
| `--sp-6` | `6px` |  | 251 |  |
| `--sp-8` | `8px` |  | 252 |  |
| `--sp-10` | `10px` |  | 253 |  |
| `--sp-12` | `12px` |  | 254 |  |
| `--sp-14` | `14px` |  | 255 |  |
| `--sp-16` | `16px` |  | 256 |  |
| `--sp-18` | `18px` |  | 257 |  |
| `--sp-20` | `20px` |  | 258 |  |
| `--sp-24` | `24px` |  | 259 |  |
| `--sp-28` | `28px` |  | 260 |  |
| `--sp-32` | `32px` |  | 261 |  |
| `--sp-40` | `40px` |  | 262 |  |
| `--sp-48` | `48px` |  | 263 |  |
| `--sp-56` | `56px` |  | 264 |  |
| `--sp-64` | `64px` |  | 265 |  |
| `--sp-72` | `72px` |  | 266 |  |
| `--sp-80` | `80px` |  | 267 |  |
| `--sp-96` | `96px` |  | 268 |  |

### 尺寸／寬度刻度 --w-*

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--w-220` | `220px` |  | 273 |  |
| `--w-300` | `300px` |  | 274 |  |

### 尺寸／比例

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--img-portrait` | `2 / 3` | 全站商品圖直式比例＝2/3 | 291 |  |

### 效果／陰影階梯

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--shadow-micro` | `0 4px 4px rgba(23, 23, 23, 0.04)` | E0 級極微陰影 | 302 | 是 |
| `--shadow-raise` | `0 1px 2px rgba(0, 0, 0, 0.06)` | E1 微浮陰影（按鈕/輸入框/switch knob） | 308 | 是 |
| `--shadow-raise-strong` | `0 1px 2px rgba(0, 0, 0, 0.16)` | E1 加強版（switch knob 陰影） | 310 | 是 |
| `--shadow-card` | `0 2px 8px -1px rgba(12, 10, 9, 0.05),     0 0 0 1px rgba(23, 23, 23, 0.05)` | E2 卡片陰影（含頂緣高光搭配使用） | 314 | 是 |
| `--shadow-float` | `0 8px 24px -8px rgba(12, 10, 9, 0.08),     0 2px 6px -2px rgba(12, 10, 9, 0.05),     0 0 0 1px rgba(23, 23, 23, 0.05)` | E3 懸浮陰影（下拉/popover/tooltip）＋內建 1px rim 描邊 | 319 | 是 |
| `--shadow-card-hover` | `var(--shadow-float)` | 卡片 hover 陰影，別名＝--shadow-float | 323 | 是 |
| `--shadow-lift-flat` | `0 8px 24px -8px rgba(12, 10, 9, 0.08),     0 2px 6px -2px rgba(12, 10, 9, 0.05)` | E3 去 rim 版（列表列 hover/拖曳浮起專用） | 331 | 是 |
| `--shadow-overlay` | `0 16px 40px -8px rgba(12, 10, 9, 0.18),     0 0 0 1px rgba(23, 23, 23, 0.08)` | E4 覆蓋層陰影（modal/抽屜） | 336 | 是 |
| `--shadow-hairline` | `0 0 1px rgba(0, 0, 0, 0.2)` | E0 邊緣 sub-pixel 描邊 | 341 | 是 |
| `--shadow-edge-top` | `inset 0 1px 0 rgba(255, 255, 255, 0.5)` | 浮起面頂緣內光（1px inset highlight） | 347 | 是 |
| `--shadow-nest-up` | `0 -6px 8px rgba(0, 0, 0, 0.05)` | 巢狀層向上柔投影（.nest 用） | 353 | 是 |
| `--shadow-seam` | `7px 0 20px -4px rgba(12, 10, 9, 0.16)` | 面板間接縫陰影（E-Shop 主面板疊商店預覽） | 359 | 是 |
| `--shadow-header` | `0 3px 16px rgba(0, 0, 0, 0.10)` | sticky header 下緣陰影 | 364 | 是 |

### 效果／動效

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--duration` | `200ms` | 標準轉場時長 200ms | 368 |  |
| `--easing` | `cubic-bezier(0.32, 0.72, 0, 1)` | 標準 easing 曲線 | 369 |  |

### 效果／浮層毛玻璃

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--overlay-blur` | `blur(14px) saturate(140%)` | 浮層毛玻璃配方：blur(14px) saturate(140%) | 373 |  |
| `--overlay-tint` | `rgba(0, 0, 0, 0.45)` | modal backdrop 遮罩深色混色比例 | 374 | 是 |

### 字體／家族

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--font-display` | `'Geist', system-ui, sans-serif` | 展示/標題字族基底（拉丁優先，實際由 fonts.css／shared.css 疊 CJK） | 386 |  |
| `--font-ui` | `'Geist', system-ui, sans-serif` | UI 控件字族基底 | 387 |  |
| `--font-body` | `'Inter', system-ui, sans-serif` | 內文字族基底 | 388 |  |
| `--font-mono` | `'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace` | 等寬字族 | 389 |  |
| `--font-cjk` | `'Noto Sans TC'` | 中文字族（獨立 token，供各 stack 末端 fallback） | 393 |  |

### 字體／字級 --fs-*

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--fs-11` | `11px` |  | 398 |  |
| `--fs-12` | `12px` |  | 399 |  |
| `--fs-13` | `13px` |  | 400 |  |
| `--fs-14` | `14px` |  | 401 |  |
| `--fs-15` | `15px` |  | 402 |  |
| `--fs-16` | `16px` |  | 403 |  |
| `--fs-18` | `18px` |  | 404 |  |
| `--fs-20` | `20px` |  | 405 |  |
| `--fs-22` | `22px` |  | 406 |  |
| `--fs-24` | `24px` |  | 407 |  |
| `--fs-28` | `28px` |  | 408 |  |
| `--fs-32` | `32px` |  | 409 |  |
| `--fs-40` | `40px` |  | 410 |  |
| `--fs-44` | `44px` |  | 411 |  |
| `--fs-56` | `56px` |  | 412 |  |
| `--fs-64` | `64px` |  | 413 |  |

### 字體／字重 --fw-*

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--fw-light` | `300` |  | 428 |  |
| `--fw-regular` | `400` |  | 429 |  |
| `--fw-body` | `350` |  | 451 |  |
| `--fw-medium` | `500` |  | 452 |  |
| `--fw-bold` | `700` |  | 453 |  |
| `--fw-semibold` | `var(--fw-bold)` |  | 456 |  |

### 字體／行高 --lh-*

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--lh-none` | `1` |  | 462 |  |
| `--lh-tight` | `1.1` |  | 463 |  |
| `--lh-snug` | `1.2` |  | 464 |  |
| `--lh-normal` | `1.3` |  | 465 |  |
| `--lh-comfy` | `1.4` |  | 466 |  |
| `--lh-relaxed` | `1.5` |  | 467 |  |
| `--lh-loose` | `1.6` |  | 468 |  |

### 字體／複合角色 --type-*（家族+字級+字重+行高+字距的打包別名，共 100 條）

| Token | 亮色值 | 說明 | 行號 | 深色覆寫 |
|---|---|---|---|---|
| `--type-display-64-family` | `var(--font-display)` |  | 471 |  |
| `--type-display-64-size` | `var(--fs-64)` |  | 472 |  |
| `--type-display-64-weight` | `var(--fw-light)` |  | 473 |  |
| `--type-display-64-line-height` | `var(--lh-none)` |  | 474 |  |
| `--type-display-64-tracking` | `-1.28px` |  | 475 |  |
| `--type-display-44-family` | `var(--font-display)` |  | 477 |  |
| `--type-display-44-size` | `var(--fs-44)` |  | 478 |  |
| `--type-display-44-weight` | `var(--fw-light)` |  | 479 |  |
| `--type-display-44-line-height` | `var(--lh-tight)` |  | 480 |  |
| `--type-display-44-tracking` | `-1px` |  | 481 |  |
| `--type-title-40-family` | `var(--font-ui)` |  | 483 |  |
| `--type-title-40-size` | `var(--fs-40)` |  | 484 |  |
| `--type-title-40-weight` | `var(--fw-regular)` |  | 485 |  |
| `--type-title-40-line-height` | `var(--lh-tight)` |  | 486 |  |
| `--type-title-40-tracking` | `-0.8px` |  | 487 |  |
| `--type-title-32-family` | `var(--font-ui)` |  | 489 |  |
| `--type-title-32-size` | `var(--fs-32)` |  | 490 |  |
| `--type-title-32-weight` | `var(--fw-regular)` |  | 491 |  |
| `--type-title-32-line-height` | `var(--lh-tight)` |  | 492 |  |
| `--type-title-32-tracking` | `-0.6px` |  | 493 |  |
| `--type-title-24-family` | `var(--font-ui)` |  | 495 |  |
| `--type-title-24-size` | `var(--fs-24)` |  | 496 |  |
| `--type-title-24-weight` | `var(--fw-regular)` |  | 497 |  |
| `--type-title-24-line-height` | `var(--lh-snug)` |  | 498 |  |
| `--type-title-24-tracking` | `-0.48px` |  | 499 |  |
| `--type-label-15-family` | `var(--font-ui)` |  | 501 |  |
| `--type-label-15-size` | `var(--fs-15)` |  | 502 |  |
| `--type-label-15-weight` | `var(--fw-regular)` |  | 503 |  |
| `--type-label-15-line-height` | `var(--lh-none)` |  | 504 |  |
| `--type-label-15-tracking` | `-0.3px` |  | 505 |  |
| `--type-label-14-family` | `var(--font-ui)` |  | 507 |  |
| `--type-label-14-size` | `var(--fs-14)` |  | 508 |  |
| `--type-label-14-weight` | `var(--fw-regular)` |  | 509 |  |
| `--type-label-14-line-height` | `var(--lh-snug)` |  | 510 |  |
| `--type-label-14-tracking` | `0` |  | 511 |  |
| `--type-body-16-family` | `var(--font-body)` |  | 513 |  |
| `--type-body-16-size` | `var(--fs-16)` |  | 514 |  |
| `--type-body-16-weight` | `var(--fw-regular)` |  | 515 |  |
| `--type-body-16-line-height` | `var(--lh-loose)` |  | 516 |  |
| `--type-body-16-tracking` | `0` |  | 517 |  |
| `--type-body-14-family` | `var(--font-body)` |  | 519 |  |
| `--type-body-14-size` | `var(--fs-14)` |  | 520 |  |
| `--type-body-14-weight` | `var(--fw-regular)` |  | 521 |  |
| `--type-body-14-line-height` | `var(--lh-relaxed)` |  | 522 |  |
| `--type-body-14-tracking` | `0` |  | 523 |  |
| `--type-caption-12-family` | `var(--font-ui)` |  | 525 |  |
| `--type-caption-12-size` | `var(--fs-12)` |  | 526 |  |
| `--type-caption-12-weight` | `var(--fw-regular)` |  | 527 |  |
| `--type-caption-12-line-height` | `var(--lh-normal)` |  | 528 |  |
| `--type-caption-12-tracking` | `0.05em` |  | 529 |  |
| `--type-display-1-family` | `var(--type-display-64-family)` |  | 532 |  |
| `--type-display-1-size` | `var(--type-display-64-size)` |  | 533 |  |
| `--type-display-1-weight` | `var(--type-display-64-weight)` |  | 534 |  |
| `--type-display-1-line-height` | `var(--type-display-64-line-height)` |  | 535 |  |
| `--type-display-1-tracking` | `var(--type-display-64-tracking)` |  | 536 |  |
| `--type-page-title-family` | `var(--type-display-44-family)` |  | 538 |  |
| `--type-page-title-size` | `var(--type-display-44-size)` |  | 539 |  |
| `--type-page-title-weight` | `var(--type-display-44-weight)` |  | 540 |  |
| `--type-page-title-line-height` | `var(--type-display-44-line-height)` |  | 541 |  |
| `--type-page-title-tracking` | `var(--type-display-44-tracking)` |  | 542 |  |
| `--type-h2-family` | `var(--type-title-40-family)` |  | 544 |  |
| `--type-h2-size` | `var(--type-title-40-size)` |  | 545 |  |
| `--type-h2-weight` | `var(--type-title-40-weight)` |  | 546 |  |
| `--type-h2-line-height` | `var(--type-title-40-line-height)` |  | 547 |  |
| `--type-h2-tracking` | `var(--type-title-40-tracking)` |  | 548 |  |
| `--type-h3-family` | `var(--type-title-32-family)` |  | 550 |  |
| `--type-h3-size` | `var(--type-title-32-size)` |  | 551 |  |
| `--type-h3-weight` | `var(--type-title-32-weight)` |  | 552 |  |
| `--type-h3-line-height` | `var(--type-title-32-line-height)` |  | 553 |  |
| `--type-h3-tracking` | `var(--type-title-32-tracking)` |  | 554 |  |
| `--type-h4-family` | `var(--type-title-24-family)` |  | 556 |  |
| `--type-h4-size` | `var(--type-title-24-size)` |  | 557 |  |
| `--type-h4-weight` | `var(--type-title-24-weight)` |  | 558 |  |
| `--type-h4-line-height` | `var(--type-title-24-line-height)` |  | 559 |  |
| `--type-h4-tracking` | `var(--type-title-24-tracking)` |  | 560 |  |
| `--type-section-label-family` | `var(--type-label-14-family)` |  | 562 |  |
| `--type-section-label-size` | `var(--type-label-14-size)` |  | 563 |  |
| `--type-section-label-weight` | `var(--type-label-14-weight)` |  | 564 |  |
| `--type-section-label-line-height` | `var(--type-label-14-line-height)` |  | 565 |  |
| `--type-section-label-tracking` | `var(--type-label-14-tracking)` |  | 566 |  |
| `--type-body-lg-family` | `var(--type-body-16-family)` |  | 568 |  |
| `--type-body-lg-size` | `var(--type-body-16-size)` |  | 569 |  |
| `--type-body-lg-weight` | `var(--type-body-16-weight)` |  | 570 |  |
| `--type-body-lg-line-height` | `var(--type-body-16-line-height)` |  | 571 |  |
| `--type-body-lg-tracking` | `var(--type-body-16-tracking)` |  | 572 |  |
| `--type-body-family` | `var(--type-body-14-family)` |  | 574 |  |
| `--type-body-size` | `var(--type-body-14-size)` |  | 575 |  |
| `--type-body-weight` | `var(--type-body-14-weight)` |  | 576 |  |
| `--type-body-line-height` | `var(--type-body-14-line-height)` |  | 577 |  |
| `--type-body-tracking` | `var(--type-body-14-tracking)` |  | 578 |  |
| `--type-caption-family` | `var(--type-caption-12-family)` |  | 580 |  |
| `--type-caption-size` | `var(--type-caption-12-size)` |  | 581 |  |
| `--type-caption-weight` | `var(--type-caption-12-weight)` |  | 582 |  |
| `--type-caption-line-height` | `var(--type-caption-12-line-height)` |  | 583 |  |
| `--type-caption-tracking` | `var(--type-caption-12-tracking)` |  | 584 |  |
| `--type-button-label-family` | `var(--type-label-15-family)` |  | 586 |  |
| `--type-button-label-size` | `var(--type-label-15-size)` |  | 587 |  |
| `--type-button-label-weight` | `var(--type-label-15-weight)` |  | 588 |  |
| `--type-button-label-line-height` | `var(--type-label-15-line-height)` |  | 589 |  |
| `--type-button-label-tracking` | `var(--type-label-15-tracking)` |  | 590 |  |
---

## 第二部分：元件 class 盤點

三頁實際出現的 BEM 根 class 共 106 個（已濾掉樣板字串／JS 變數殘留，如 `cls`／`stCls`／`variant-thumb${own`／`statusClass(l.status)` 等）。

欄位「出現頁」：E=e-shop｜P=product-detail｜C=create-product。「主要定義檔:行」是實際找到 `.class {` 規則起點的檔案（非同名檔就手動核對過）；「其他引用/延伸」列出同一個根 class 在其他檔出現的行（多半是該元件被其他頁面/元件內文引用或延伸，不代表獨立定義）。

| Class 根 | 出現頁 | 主要定義檔:行 | 其他引用/延伸（檔:行） |
|---|---|---|---|
| `.album-tracks` | PC | `ds-components/album-tracks.css:6` | — |
| `.alert` | E | `ds-components/alert.css:19` | ds-components/auth.css:221; shared.css:179 |
| `.alert-inset` | E | `ds-components/alert.css:407` | — |
| `.amount-field` | PC | `ds-components/amount-field.css:13` | ds-components/benefit-matrix.css:107; ds-components/payout-modal.css:266; ds-components/stepper.css:14; ds-components/store-settings.css:12; ds-components/ticket-tier-card.css:225; ds-components/tier-overview.css:98 |
| `.app` | EP | `shared.css:195` | — |
| `.app-topbar` | EP | `ds-components/header.css:15` | shared.css:213 |
| `.badge` | EP | `ds-components/badge.css:49` | ds-components/chip.css:4; ds-components/event-preview-card.css:45; ds-components/message-modal.css:7; ds-components/product-list.css:349; ds-components/project-list.css:41; ds-components/stock-readout.css:12; ds-components/wizard-split.css:135; shared.css:179 |
| `.bento` | P | `ds-components/bento.css:15` | ds-components/section-nav.css:170; shared.css:181 |
| `.btn` | EPC | `ds-components/button.css:38` | ds-components/_tokens.css:238; ds-components/alert.css:92; ds-components/auth.css:30; ds-components/brand-card.css:157; ds-components/button.css:20; ds-components/chart.css:189; ds-components/control-row.css:109; ds-components/dropdown-menu.css:3; ds-components/empty-card.css:16; ds-components/entry-list.css:19; ds-components/field-more.css:33; ds-components/field-pill.css:25; ds-components/header.css:270; ds-components/info-banner.css:31; ds-components/input.css:13; ds-components/leave-dialog.css:33; ds-components/list-footer.css:14; ds-components/page-intro.css:88; ds-components/pager.css:3; ds-components/payout-modal.css:355; ds-components/post-composer.css:92; ds-components/product-list.css:460; ds-components/product-post-modal.css:19; ds-components/progress-timeline.css:269; ds-components/scanner.css:406; ds-components/search-collapse.css:11; ds-components/source-status.css:129; ds-components/split-button.css:5; ds-components/tag-input.css:27; ds-components/toast.css:101; ds-components/todo-list.css:112; shared.css:158 |
| `.card` | EPC | `ds-components/card.css:81` | ds-components/bundle-editor.css:7; ds-components/card-group.css:35; ds-components/chart.css:100; ds-components/empty-card.css:53; ds-components/funding-panel.css:113; ds-components/kpi.css:27; ds-components/picker.css:30; ds-components/preview-card.css:32; ds-components/preview-column.css:49; ds-components/progress-timeline.css:41; ds-components/review-row.css:14; ds-components/table.css:68; shared.css:685 |
| `.chip` | PC | `ds-components/chip.css:6` | ds-components/combobox.css:92; ds-components/media-vault.css:424; ds-components/tag-input.css:3; shared.css:725 |
| `.chip-group` | C | `ds-components/chip.css:23` | ds-components/bundle-editor.css:636; ds-components/chip.css:13; ds-components/combobox.css:6; ds-components/tag-input.css:13 |
| `.control-group` | PC | `ds-components/control-row.css:33` | ds-components/card-group.css:70 |
| `.control-row` | PC | `ds-components/control-row.css:9` | ds-components/payout-modal.css:303 |
| `.cp-edit-only` | C | *(頁面層級，非 ds-components：create-product.html 頁內 <style>／JS（非 ds-components）)* | — |
| `.cp-shopmock` | C | *(頁面層級，非 ds-components：create-product.html 頁內 <style> 區塊（.cp-shopmock__* 買家前台預覽 mock，D223）)* | — |
| `.cp-subfields` | C | *(頁面層級，非 ds-components：create-product.html 頁內 <style>（line 61）)* | — |
| `.detail-grid` | P | `ds-components/detail-rail.css:15` | — |
| `.detail-main` | P | `ds-components/detail-rail.css:16` | — |
| `.detail-rail` | P | `ds-components/detail-rail.css:17` | — |
| `.dropdown` | EP | `ds-components/dropdown-menu.css:20` | ds-components/album-tracks.css:13; ds-components/product-list.css:340; ds-components/progress-timeline.css:274; ds-components/split-button.css:5; ds-components/variant-builder.css:319 |
| `.empty-card` | E | `ds-components/empty-card.css:12` | ds-components/fan-store.css:396 |
| `.eshop-list-controls` | E | *(頁面層級，非 ds-components：e-shop.html 頁內 <style>)* | — |
| `.eshop-live-banner` | E | *(頁面層級，非 ds-components：e-shop.html 頁內 <style>)* | — |
| `.eshop-noresult` | E | *(頁面層級，非 ds-components：e-shop.html 頁內 <style>)* | — |
| `.eshop-preview-close` | E | *(頁面層級，非 ds-components：e-shop.html 頁內 <style>)* | — |
| `.eshop-seam-shadow` | E | *(頁面層級，非 ds-components：e-shop.html 頁內 <style>)* | — |
| `.eshop-stock-bar` | E | *(頁面層級，非 ds-components：e-shop.html 頁內 <style>)* | — |
| `.field` | PC | `ds-components/field-system.css:3` | ds-components/admin-ip-bank-table.css:37; ds-components/bundle-editor.css:7; ds-components/control-row.css:49; ds-components/field-more.css:19; ds-components/form-grid.css:4; ds-components/form-section.css:5; ds-components/kv-list.css:6; ds-components/manage-ip.css:46; ds-components/payout-modal.css:217; ds-components/post-composer.css:137; ds-components/restock-modal.css:16; ds-components/review-row.css:47; ds-components/size-chart-editor.css:186; ds-components/ticket-tier-card.css:196; ds-components/variant-builder.css:127; ds-components/vip-card.css:22 |
| `.field-more` | C | `ds-components/field-more.css:14` | — |
| `.field-pill` | E | `ds-components/field-pill.css:19` | ds-components/chip.css:95; ds-components/search-collapse.css:12 |
| `.field-readout` | P | `ds-components/field-system.css:50` | — |
| `.filter-tabs` | E | `ds-components/filter-tabs.css:14` | — |
| `.flex-row` | P | `shared.css:1709` | — |
| `.form-footnote` | C | `ds-components/form-section.css:153` | — |
| `.form-grid` | PC | `ds-components/form-grid.css:14` | ds-components/bundle-editor.css:279; ds-components/control-row.css:98; ds-components/field-more.css:26; ds-components/payout-modal.css:217; ds-components/pickup.css:195; ds-components/restock-modal.css:16 |
| `.form-section` | PC | `ds-components/form-section.css:6` | ds-components/card.css:112; ds-components/detail-rail.css:61; ds-components/pickup.css:192 |
| `.hidden` | C | `shared.css:1713` | ds-components/auth.css:123; ds-components/filter-tabs.css:50; ds-components/kpi.css:19; ds-components/list-footer.css:8; ds-components/list-toolbar.css:73; shared.css:177 |
| `.info-banner` | PC | `ds-components/info-banner.css:2` | ds-components/empty-card.css:53; shared.css:2075 |
| `.input` | PC | `ds-components/input.css:6` | ds-components/_tokens.css:238; ds-components/amount-field.css:6; ds-components/auth.css:170; ds-components/benefit-matrix.css:108; ds-components/bundle-editor.css:312; ds-components/control-row.css:108; ds-components/date-input.css:19; ds-components/entry-list.css:4; ds-components/field-source-tag.css:46; ds-components/field-system.css:38; ds-components/form-section.css:5; ds-components/media-vault.css:109; ds-components/message-modal.css:7; ds-components/payout-modal.css:265; ds-components/post-composer.css:150; ds-components/restock-modal.css:100; ds-components/session-list.css:55; ds-components/size-chart-editor.css:71; ds-components/source-import.css:19; ds-components/stepper.css:56; ds-components/stock-readout.css:6; ds-components/store-settings.css:8; ds-components/ticket-tier-card.css:200; ds-components/variant-builder.css:9; ds-components/vault-share.css:74; ds-components/vip-card.css:22; shared.css:1064 |
| `.is-empty` | PC | *(無獨立 CSS／僅作修飾詞元素，見備註)* | ds-components/event-preview-card.css:68; ds-components/preview-card.css:65; ds-components/review-row.css:88; ds-components/upload-tile.css:242 |
| `.is-filled` | P | *(無獨立 CSS／僅作修飾詞元素，見備註)* | ds-components/upload-tile.css:213; shared.css:1619 |
| `.kpi` | P | `ds-components/kpi.css:9` | ds-components/pickup.css:193; ds-components/stock-readout.css:16; shared.css:721 |
| `.kv` | PC | `ds-components/kv-list.css:27` | ds-components/card-group.css:37; ds-components/kv-list.css:9; ds-components/pickup.css:245; ds-components/ticket-tier-card.css:335 |
| `.kv-list` | C | *(無獨立 CSS／僅作修飾詞元素，見備註)* | — |
| `.list-dock` | E | `ds-components/list-toolbar.css:186` | ds-components/alert.css:457 |
| `.list-footer` | E | `ds-components/list-footer.css:12` | — |
| `.list-status-row` | E | `ds-components/list-toolbar.css:10` | — |
| `.list-toolbar` | E | `ds-components/list-toolbar.css:7` | ds-components/alert.css:423; ds-components/section-nav.css:79; ds-components/tier-overview.css:74; shared.css:104 |
| `.main` | EP | `shared.css:196` | ds-components/alert.css:359; ds-components/list-toolbar.css:204; ds-components/media-vault.css:276; ds-components/preview-panel.css:38; ds-components/product-list.css:667; ds-components/sticky-actions.css:32 |
| `.mb-16` | C | `shared.css:1712` | — |
| `.mt-16` | P | `shared.css:1711` | — |
| `.mt-24` | P | `shared.css:1711` | — |
| `.mt-8` | P | `shared.css:1711` | — |
| `.nest` | C | `ds-components/nest.css:11` | ds-components/_tokens.css:351 |
| `.option-set` | C | `ds-components/variant-builder.css:39` | — |
| `.page` | EP | `shared.css:676` | ds-components/alert.css:358; ds-components/media-vault.css:101; ds-components/store-settings.css:17 |
| `.page-crumb` | EP | `ds-components/page-intro.css:51` | shared.css:1513 |
| `.page-intro` | EP | `ds-components/page-intro.css:3` | ds-components/sticky-actions.css:11; shared.css:2093 |
| `.payout-dialog` | PC | `ds-components/payout-modal.css:107` | ds-components/_tokens.css:832; ds-components/benefit-matrix.css:177; ds-components/card.css:117; ds-components/explainer.css:15; ds-components/funding-panel.css:125; ds-components/message-modal.css:5; ds-components/picker.css:31; ds-components/preview-card.css:33; ds-components/product-post-modal.css:7; ds-components/publish-preview.css:32; ds-components/restock-modal.css:6; ds-components/tier-overview.css:12 |
| `.payout-modal` | PC | `ds-components/payout-modal.css:90` | ds-components/_tokens.css:374; ds-components/embed-modal.css:24; ds-components/explainer.css:15; ds-components/message-modal.css:5; ds-components/product-post-modal.css:7; ds-components/publish-preview.css:3; ds-components/restock-modal.css:6; ds-components/zselect.css:102 |
| `.pd-subfields` | P | *(頁面層級，非 ds-components：product-detail.html 頁內 <style>（line 55）)* | — |
| `.preview-card` | C | `ds-components/preview-card.css:7` | ds-components/preview-column.css:51; ds-components/publish-preview.css:32 |
| `.preview-col` | C | `ds-components/preview-column.css:10` | — |
| `.preview-panel` | EP | `ds-components/preview-panel.css:8` | — |
| `.preview-split` | C | `ds-components/preview-column.css:8` | — |
| `.product-list` | E | `ds-components/product-list.css:6` | ds-components/project-list.css:3 |
| `.product-list-scroll` | E | `ds-components/product-list.css:720` | — |
| `.radio-card` | C | *(無獨立 CSS／僅作修飾詞元素，見備註)* | — |
| `.radio-cards` | PC | `ds-components/radio-card.css:13` | ds-components/form-section.css:150; ds-components/restock-modal.css:7 |
| `.radio-list` | PC | `ds-components/radio-list.css:13` | ds-components/card-group.css:71; ds-components/ticket-tier-card.css:265 |
| `.readiness` | C | `ds-components/readiness.css:7` | — |
| `.restock-log` | P | `ds-components/restock-log.css:36` | — |
| `.restock-log-wrap` | P | `ds-components/restock-log.css:24` | — |
| `.search-collapse` | E | `ds-components/search-collapse.css:10` | — |
| `.section-nav` | P | `ds-components/section-nav.css:15` | — |
| `.section-nav-layout` | P | `ds-components/section-nav.css:14` | — |
| `.segmented` | PC | `ds-components/segmented.css:8` | ds-components/auth.css:192; ds-components/card-group.css:72; ds-components/chart.css:241; ds-components/form-section.css:5; ds-components/radio-card.css:4; ds-components/radio-list.css:89; ds-components/restock-modal.css:7; ds-components/ticket-tier-card.css:257; ds-components/vip-card.css:22 |
| `.select` | PC | `ds-components/input.css:16` | ds-components/_tokens.css:238; ds-components/chip.css:95; ds-components/form-section.css:5; ds-components/media-vault.css:113; ds-components/message-modal.css:7; ds-components/post-composer.css:124; ds-components/source-import.css:24; ds-components/store-settings.css:8; ds-components/ticket-tier-card.css:261; ds-components/zselect.css:51; shared.css:1064 |
| `.select-wrap` | C | `ds-components/input.css:114` | — |
| `.split-button` | E | `ds-components/split-button.css:7` | — |
| `.stock-bar` | P | `ds-components/stock-bar.css:9` | ds-components/meter-list.css:18; ds-components/pickup.css:218 |
| `.stock-readout` | P | `ds-components/stock-readout.css:9` | — |
| `.stock-tip` | E | `ds-components/stock-tip.css:34` | — |
| `.switch` | EPC | `ds-components/switch.css:12` | ds-components/control-row.css:11; ds-components/dropdown-menu.css:126; ds-components/message-modal.css:7; ds-components/notification-matrix.css:17; shared.css:729 |
| `.tab-panel` | P | `ds-components/tabs.css:3` | ds-components/kpi.css:29; ds-components/message-modal.css:6; ds-components/restock-modal.css:23 |
| `.tabs` | E | `ds-components/tabs.css:11` | ds-components/filter-tabs.css:5; ds-components/form-section.css:16; ds-components/list-toolbar.css:8; ds-components/message-modal.css:6; ds-components/restock-modal.css:22; ds-components/segmented.css:5; ds-components/settings.css:10; ds-components/size-chart-editor.css:170; shared.css:104 |
| `.tag-input` | PC | `ds-components/tag-input.css:8` | ds-components/chip.css:108; ds-components/combobox.css:4; shared.css:1594 |
| `.text-sub` | PC | `shared.css:1706` | — |
| `.textarea` | PC | `ds-components/input.css:16` | ds-components/input.css:15; ds-components/message-modal.css:7; ds-components/post-composer.css:32; ds-components/store-settings.css:8; shared.css:1064 |
| `.up-stack` | P | *(無獨立 CSS／僅作修飾詞元素，見備註)* | — |
| `.upload-assets` | PC | `ds-components/upload-tile.css:17` | ds-components/bundle-editor.css:651 |
| `.upload-tile` | PC | `ds-components/upload-tile.css:6` | ds-components/bundle-editor.css:30; ds-components/ticket-tier-card.css:63; ds-components/vip-card.css:22; shared.css:1619 |
| `.upload-tile-aside` | C | `ds-components/upload-tile.css:109` | — |
| `.variant-builder` | C | `ds-components/variant-builder.css:7` | ds-components/nest.css:39 |
| `.variant-cell` | PC | `ds-components/variant-builder.css:321` | — |
| `.variant-option` | PC | `ds-components/variant-builder.css:8` | — |
| `.variant-row` | C | `ds-components/variant-builder.css:15` | — |
| `.variant-table` | PC | `ds-components/variant-builder.css:228` | ds-components/restock-log.css:22 |
| `.variant-table-wrap` | PC | `ds-components/variant-builder.css:203` | ds-components/table.css:7; ds-components/variant-builder.css:11 |
| `.variant-thumb` | C | `ds-components/variant-builder.css:262` | — |
| `.vip-card` | PC | `ds-components/vip-card.css:6` | — |
| `.when-data` | EP | `shared.css:1908` | — |
| `.when-empty` | EP | `shared.css:1908` | — |
| `.wizard` | C | `shared.css:1070` | ds-components/preview-panel.css:37 |
| `.ztor-icon` | EPC | `ds-components/icon.css:5` | ds-components/album-tracks.css:32; ds-components/alert.css:53; ds-components/artist-picker.css:34; ds-components/benefit-matrix.css:130; ds-components/brand-card.css:128; ds-components/bundle-editor.css:116; ds-components/button.css:185; ds-components/card.css:153; ds-components/chart.css:169; ds-components/check-card.css:23; ds-components/chip.css:147; ds-components/data-list.css:73; ds-components/detail-sheet.css:103; ds-components/dropdown-menu.css:15; ds-components/embed-modal.css:75; ds-components/empty-card.css:71; ds-components/event-preview-card.css:43; ds-components/explainer.css:50; ds-components/fan-store.css:91; ds-components/fans-guide.css:54; ds-components/field-source-tag.css:37; ds-components/funding-panel.css:105; ds-components/header.css:108; ds-components/input.css:61; ds-components/leave-dialog.css:29; ds-components/media-vault.css:160; ds-components/message-modal.css:103; ds-components/pickup.css:113; ds-components/post-composer.css:89; ds-components/preview-card.css:49; ds-components/product-list.css:106; ds-components/product-post-modal.css:53; ds-components/progress-mark.css:27; ds-components/progress-stepper.css:162; ds-components/progress-timeline.css:130; ds-components/project-list.css:117; ds-components/readiness.css:53; ds-components/restock-modal.css:92; ds-components/scanner.css:126; ds-components/segmented.css:73; ds-components/selection-card.css:104; ds-components/size-chart-editor.css:105; ds-components/sortable.css:70; ds-components/split-button.css:32; ds-components/stepper.css:93; ds-components/store-settings.css:124; ds-components/table.css:249; ds-components/ticket-tier-card.css:123; ds-components/toast.css:52; ds-components/upload-tile.css:84; ds-components/variant-builder.css:67; ds-components/vault-share.css:37; shared.css:302 |
---

## 第三部分：重點類別細節（新皮要大改的六類）

### 1. 按鈕（`ds-components/button.css`，222 行，全讀）

Variant class 與各自預設樣式來源行號：

| Variant | 行號 | 樣式重點 |
|---|---|---|
| `.btn`（基底，所有 variant 都疊在這上面） | 38 | 高度吃 `--control-h-sm`(36px)，`border-radius: var(--radius)`，`border: 0` |
| `.btn--primary` | 62 | 實色橘 `background: var(--primary)`，`box-shadow: var(--shadow-raise)` |
| `.btn--outline` | 79 | `background: var(--control-raise)`＋`border: 1px solid var(--border)`（無陰影，2026-06-12 使用者裁示故意拿掉） |
| `.btn--ghost` | 90 | 透明底，hover 才浮出 `--accent` |
| `.btn--ghost.btn--destructive` | 96 | 紅字 ghost（刪除類入口） |
| `.btn--destructive:not(.btn--ghost)` | 106 | 紅框（2026-08-06 由實色紅底改邊框化，理由見檔內註解） |
| `.btn--soft` | 119 | 中性淡填：`color-mix(in srgb, var(--foreground) 6%, var(--card))` |
| 尺寸 `--lg`/`--sm`/`--add` | 124/125/131 | 高度分別吃 `--control-h-md`(44)／`--control-h-xs`(28)／`--control-h-sm`(36) |
| `.btn--icon` / `.btn--icon-circle` | 171 / 190 | 純圖示方鈕／圓鈕（後者用於送出/提交） |
| disabled 態 | 139, 150 | 填色按鈕 disabled 改灰底灰字（`--muted`/`--muted-foreground`），非填色按鈕走 opacity |

`.ztor-btn`（design-system 展示用舊按鈕家族）已於 2026-07-21 墓碑退場，全站無消費者，新皮不必理會。

**覆寫建議**：`.btn--primary` 的橘底是 `var(--primary)`（token 層可控），但 outline/ghost/soft 三種是靠 `color-mix()` 動態算色，不是單一 token——想讓它們也帶玻璃感，八成要直接覆寫 `.btn--outline` / `.btn--ghost:hover` 的 `background`，token 層改不動它們。

### 2. 卡片／區塊容器（`card.css` 250 行、`nest.css` 47 行、`form-section.css` 154 行，全讀）

三套並存、职责不同，新皮要分清楚別混用：

- **`.card`**（`card.css:83`）：一般 section 卡。`background: var(--card)`、`border: 0`、陰影 `box-shadow: var(--shadow-card), var(--shadow-edge-top)`。
- **`.card--muted`**（`card.css:103`）：卡片內部再分一段的靜態分組，`background: var(--nest-surface)`，亮色帶 `--nest-line` 邊框、深色純靠色差。
- **`.form-section--outlined`**（`form-section.css:36`）：建立流程的「無外框填色卡」骨架，同樣是 `--card` 底 + `--shadow-card`。深色模式 `[data-theme="dark"] .form-section--outlined` 改吃 `--surface-shell`（`form-section.css:50`）而不是 `--card`——**這是唯一一個深色底色不等於 `--card` 的卡片變體**，token 層覆寫 `--card` 時容易漏掉它。
- **`.nest`**（`nest.css:26`）：疊在母卡「底部」的滿版子層（如商品選項切到「多選項」後長出的選項建構器），`background: var(--nest-surface)`，上緣 `border-top: 1px solid var(--nest-line)`，靠負 margin 貼齊母卡外緣。母卡必須 `overflow:hidden`（`nest.css:47`），玻璃化時如果想讓 nest 內容也顯示模糊背景，要注意這條裁切規則會一起擋住任何 `backdrop-filter` 溢出效果。
- **`.ztor-card`**（`card.css:7`，design-system 展示用 canonical 卡，`--radius-xl` + `1px solid var(--border)`）——三頁裡目前沒有直接消費，可略。

**覆寫建議**：卡片系統高度依賴 `--card` / `--nest-surface` / `--shadow-card` 三個 token，改這三個能一次帶動 `.card` / `.card--muted` / `.nest` 三層。唯一要單獨處理的例外是上面提到的 `[data-theme="dark"] .form-section--outlined { background: var(--surface-shell) }`。

### 3. 商品清單／表格（`product-list.css` 725 行，全讀；`table.css` 前 100 行）

- 三頁裡**只有 e-shop.html 用到 `.product-list`**（`product-list--eshop` 變體）；`product-detail.html`／`create-product.html` 不含清單列。`.ztor-table`（table.css 的完整資料表）三頁都**沒有**用到——它是給別的頁面（比較表、明細規格表）用的，new-skin 若只做這三頁可以先跳過 table.css。
- 列結構：`.product-list__row`（`product-list.css:34`），CSS Grid，欄位模板每個分頁各自疊加（`--eshop` 在 `product-list.css:297`）。
- **Hover 狀態寫法**（`product-list.css:58`）：不是換底色，是「整列浮起」——`position:relative; z-index:1; background: var(--card); border-radius: var(--radius-md); box-shadow: var(--shadow-lift-flat)`，同時把自己與上一列的 `border-bottom` 收透明（`:has(+ .product-list__row:hover)`，`product-list.css:67`），讓浮起的列四邊乾淨不被分隔線切到。
- 縮圖 `.product-list__thumb`/`.product-list__image`：76px 方形晶片／76px 寬直式圖（`--img-portrait` 2:3），無圖占位吃 `--muted` 底。
- 拖曳重排：`.product-list__row.is-dragging`（`product-list.css:406`）同樣是 `--card` 底 + `--shadow-lift-flat`。

**覆寫建議**：hover／拖曳的浮起效果全靠 `--shadow-lift-flat` 這一個 token（定義在 `_tokens.css:331`），要讓「浮起」讀起來像玻璃卡而不是純陰影，改這支陰影 token 的形狀（例如疊加一圈亮邊）比逐一覆寫 `.product-list__row:hover` 划算。

### 4. 側邊欄與頂欄

**這是三個驗收問題的第一題，答案在這裡**：

- 側欄／頂欄的 HTML **全部由 JS 注入**，不是寫死在頁面裡。`e-shop.html` 與 `product-detail.html` 都只放一個空殼掛載點：
  ```html
  <header class="app-topbar" id="sidebar"></header>
  ```
  實際的 `<nav>`／連結／dropdown 由 `js/sidebar.js`（1064 行）在執行期算好 HTML 字串塞進 `#sidebar`。
- **`create-product.html` 完全沒有側欄／頂欄掛載點**——它是「內嵌式」建立流程頁（`body.cp-embed` 用來在彈窗內顯示時隱藏側預覽欄），不吃全域導覽 chrome。新皮若只在 `.app-topbar`／`.app-sidebar` 上做手腳，create-product.html 這頁不會受影響（它本來就没有這層）。
- CSS 定義位置：`.app-topbar` 主體在 `ds-components/header.css:15`；`sidebar.js` 也可能渲染成另一種版面模式 `.app-sidebar`（`html[data-nav-mode="sidebar"]` 時），這支的完整規則群（`.app-sidebar`／`.app-sidebar__link`／`.app-sidebar__group` 等約 40 條規則）定義在 **`shared.css:236` 起**，不在 ds-components——sidebar.js 檔頭註解原話：「dropdowns become expandable accordion groups...CSS lives in shared.css」。
- 兩種模式共用同一份導覽資料（`sidebar.js` 裡的 `ADMIN_NAV`／各種 NAV 常數），只是渲染出的殼子 class 不同，寫 `html[data-ztorui]` 覆寫時，topbar 與 sidebar 兩套都要各自處理一次，不能只挑一種。

### 5. 表單控制項（`input.css` 122 行、`chip.css` 161 行、`filter-tabs.css` 132 行、`segmented.css` 80 行、`switch.css` 73 行、`zselect.css` 194 行，全讀）

| 元件 | 定義檔:行 | 底色 token |
|---|---|---|
| `.input` / `.select` / `.textarea`（共用基底規則） | `input.css:16` | `background: var(--input-surface)`；邊框用 `box-shadow: 0 0 0 1px var(--border)`（不是真 border） |
| `.select`（原生下拉，僅收合態） | `input.css:82` | 自繪 chevron（SVG data-URI，寫死 `stroke='%23737373'`——**這個灰色是唯一沒有走 token 的視覺值**，深色模式看不出換色，新皮若要它跟著主題走要另外處理） |
| `.chip` | `chip.css:32` | `background: var(--input-surface)`，選中態 `.chip--active`（`chip.css:53`）走 `--selected-surface` 品牌橘 tint |
| `.filter-tabs__item` | `filter-tabs.css:29` | 預設透明，選中 `--selected-surface`（`filter-tabs.css:65`） |
| `.segmented` | `segmented.css:13` | 軌道 `--muted` 底 + 真 border；選中 `.segmented__btn--active`（`segmented.css:48`）是「白色浮起 pill」＝`background: var(--card)` + `--shadow-raise` |
| `.switch` | `switch.css:20` | 軌道 `--accent`，開＝`var(--primary)`；knob 深色模式強制 `var(--foreground)`（`switch.css:58`，不透過 `--card`，避免透出橘色軌道——目前這個 `--card` 已是實色，這條深色分支形同備援） |
| `.zselect__panel`（下拉升級後的自繪 listbox，JS：`js/zselect.js`） | `zselect.css:98` | `background: var(--card)`，`box-shadow: var(--shadow-float)`，語彙抄自 `.dropdown__menu` |

**覆寫建議**：表單控制項底色集中在 `--input-surface` 一個 token，選中態集中在 `--selected-surface`/`--selected-ink` 兩個 token，改這三個能一次帶動 input/chip/filter-tabs 的視覺；`.segmented__btn--active` 與 `.switch` 的白色/knob 是硬寫 `--card`／`--foreground`，玻璃化時這兩處的「實色小方塊」會與周邊的玻璃感不一致，需要逐一覆寫。

### 6. 彈出層（`dropdown-menu.css` 191 行、`preview-panel.css` 84 行、`detail-sheet.css` 159 行，全讀）

底色目前是實色還是半透明，逐一列出——**這是三個驗收問題的第二題答案基礎**：

| 元件 | 定義檔:行 | 底色 | 目前是否透明／模糊 |
|---|---|---|---|
| `.dropdown__menu`（操作選單） | `dropdown-menu.css:36` | `background: var(--card)` | **實色**。有掛進 `_tokens.css:829` 檔尾的 `.overlay-surface, .dropdown__menu, .preview-panel__sheet, .payout-dialog { backdrop-filter: var(--overlay-blur) }` 清單，但因為底色是不透明的 `--card`，`backdrop-filter` 目前視覺上沒有作用（模糊了一塊看不穿的實色） |
| `.zselect__panel`（自繪 select 下拉） | `zselect.css:98` | `background: var(--card)` | **實色**，且**沒有**掛進上面那份 `.overlay-surface` 清單，連 backdrop-filter 都沒有 |
| `.preview-panel__sheet`（e-shop 商品快覽面板） | `preview-panel.css:50` | `background: var(--card)` + `border-left: 1px solid var(--border)` | **實色**，但有掛進 `.overlay-surface` 清單（同上，目前無視覺效果） |
| `.detail-sheet`（清單細節覆蓋層的背板，若三頁未來要用到） | `detail-sheet.css:26/36` | `background: color-mix(in srgb, #000 52%, transparent)` + `backdrop-filter: blur(4px)` | **這支是全站唯一目前真的在做半透明模糊 scrim 的元件**——它的做法可以直接借來當新皮玻璃感的參考配方 |

`_tokens.css` header 自己的雙層混淆要注意：header.css 與 dropdown 相關檔案裡多處註解寫「dark mode --card is translucent」（例：`header.css:31`、`switch.css:56`），但這句話已經**過期**——`--card` 在 2026-06-25（issue #11）就改成不透明實色了（見 `_tokens.css:602` 註解「主要面與卡片不用半透明」），註解沒同步更新。這代表：**目前整站深色模式其實沒有真正的玻璃感，`--overlay-blur`／`backdrop-filter` 大多是掛好了管線但因為底色不透明而看不出效果**——新皮要做玻璃風，關鍵動作是把 `--card`（或至少 popover/dropdown 專用的底色）改回半透明，`backdrop-filter` 的管線已經接好、不用重拉。

---

## 驗收條件第 3 點：三個問題的答案

**Q1｜側邊欄與頂欄的 HTML 是寫死在各頁，還是由 JS 注入？**
由 JS 注入。`e-shop.html` 與 `product-detail.html` 都只留一個空殼掛載點 `<header class="app-topbar" id="sidebar"></header>`，實際導覽 HTML 由 `js/sidebar.js`（1064 行）在執行期算好塞進去；`create-product.html` 連掛載點都沒有——它是內嵌式建立流程頁，不含全域導覽 chrome。這代表：CSS 覆寫層仍然吃得到（JS 產生的還是普通 DOM、`html[data-ztorui] .app-topbar {...}` 照樣選得到），但**看不到「寫死在 HTML 裡」可以直接讀的結構**，要改版面就得先看 `js/sidebar.js` 產生的 class 名稱，或直接看瀏覽器算出來的 DOM。另外側欄模式（`html[data-nav-mode="sidebar"]`）用的 `.app-sidebar*` 系列 class（約 40 條規則）定義在 **`shared.css:236` 起**，不在 ds-components 裡，覆寫時容易漏掉這一半。

**Q2｜有哪些元件的樣式是寫在 inline `style=""` 或 `<style>` 區塊裡的？**
三頁都各自帶一個 `<style>` 區塊：

| 頁面 | `<style>` 行號範圍 | 內容 |
|---|---|---|
| `e-shop.html` | 41–202（約 160 行） | `.eshop-list-controls`／`.eshop-stock-bar__*`／`.eshop-live-banner`／`.eshop-noresult`／`.eshop-preview-close`／`.eshop-seam-shadow` 等頁面專屬版面膠水 |
| `product-detail.html` | 51–57（7 行） | `.pd-subfields`（條件揭露子欄位的顯隱） |
| `create-product.html` | 52–121（70 行） | `.cp-subfields`（同上）＋ **`.cp-shopmock__*` 一整組買家前台預覽 mock**（D223 新功能，約 40 條規則，含版面骨架、圖片框、尺寸選擇方塊等） |

好消息：**逐條核對過，這三個 `<style>` 區塊與所有 inline `style=""`（e-shop 1 處、product-detail 50 處、create-product 30 處）裡完全沒有寫死的 `#hex` 或 `rgb()/rgba()` 顏色值**，清一色用 `var(--sp-*)` / `var(--fs-*)` / `var(--muted-foreground)` 這類 token；project 的 check_ds_sync 棘輪本來就會擋裸值。也就是說**顏色層的 skin 覆寫（改 token）對這些頁面內樣式一樣有效**，唯一吃不到的是版面/尺寸這類非 token 化的結構值（如 `.cp-shopmock__thumb { width: 56px; }`），那些要另外用 `html[data-ztorui] .cp-shopmock__thumb {...}` 逐條覆寫。

**Q3｜`ds-components/*.css` 裡有沒有用到 `!important`？列出全部命中處。**
有，共 4 處實際程式碼命中（另有 5 處是註解文字提到「!important」，非真正宣告，不列入）：

| 檔案:行 | 內容 |
|---|---|
| `ds-components/zselect.css:37` | `.zselect__native { position: absolute !important; ... }`（隱藏原生 select，防止被別的規則覆寫定位） |
| `ds-components/fans-guide.css:399` | `.fg-tier { width: 100% !important; }` |
| `ds-components/fans-guide.css:408` | `transition-duration: 1ms !important;`（`prefers-reduced-motion` 區塊內） |
| `ds-components/fans-guide.css:409` | `transition-delay: 0ms !important;`（同上） |

`fans-guide.css` 不在三頁的依賴清單內，可以不用理會。三頁真正會載入、且用到 `!important` 的只有 `zselect.css:37` 這一條，且它管的是定位（絕對定位隱藏原生控件），不是視覺樣式，不影響玻璃風覆寫。

另外 `shared.css`（同樣「一個字都不能改」）有 3 處 `!important`，都是 `[hidden]`/`.hidden` 的顯隱與 `data-embed` 模式的返回鈕隱藏，同樣不影響視覺覆寫：`shared.css:193`、`shared.css:1713`、`shared.css:2036`。

---

## 有沒有沒讀完／看不懂的部分

- **`_tokens.css`（835 行）全讀**，260 條 token 逐一列出，無抽樣。
- **`shared.css`（2142 行）沒有逐行全讀**——用 grep 定位了 token 覆寫、`!important`、`.app-topbar`/`.app-sidebar`/`.wizard`/`.main`/`.page`/`.hidden` 等本次相關規則的所在行，但這份檔案本身涵蓋全站共用版面（頁首/頁尾/表單基底/wizard 殼/CJK 字距等），沒有被要求的範圍內全讀，若之後要動到 shared.css 沒提到的其他規則，建議另外針對性讀。
- **`ds-components/` 共 130+ 支檔案**：三頁實際消費、且與本次重點類別（按鈕/卡片/清單/側欄頂欄/表單/彈出層）相關的約 20 支已全讀（button.css／card.css／nest.css／form-section.css／product-list.css／header.css 前 120 行／dropdown-menu.css／preview-panel.css／detail-sheet.css／chip.css／filter-tabs.css／segmented.css／switch.css／input.css／zselect.css／table.css 前 100 行）；其餘約 110 支只做了「哪個 class 在哪一行被定義」的機械掃描（見第二部分表格），沒有逐行讀取內容——這些多半是三頁裡只出現一兩次、非重點類別的元件（如 `readiness.css`／`spec-row.css`／`upload-tile.css` 等），如果新皮要動到這些，建議動手前針對性地把該檔讀完。
- **`js/sidebar.js`（1064 行）只讀了前 80 行**（確認注入機制與資料結構），沒有全讀完整份導覽渲染邏輯——本次任務只需要確認「HTML 是不是 JS 注入」這一件事，已經確認；若要動側欄/頂欄的 DOM 結構（不只是視覺），建議另外全讀這支檔案。
- **`js/zselect.js`／`js/detail-sheet.js`／`js/theme.js` 等其他 JS 完全沒讀**，只從 CSS 端的註解與掛載 class 反推行為，行為細節（如 z-index 動態計算、開關動畫時機）未逐行核對程式碼本身。
- Part 2 元件 class 表格中，有 41 個 class 根一開始找不到「與 class 同名的 CSS 檔」，其中約 27 個已憑手動核對 CSS 內容個別解出正確定義行（如 `.btn` 真正定義在 `button.css:38` 而非 grep 抓到的註解行 20）；其餘（`kv-list`／`radio-card`／`up-stack`／`is-empty`／`is-filled` 等）核實後確認**沒有獨立 CSS 規則**（純容器、只作為修飾詞元素、或根本是 SVG class 而非設計系統 class），已在表格備註標明，不是遺漏。
