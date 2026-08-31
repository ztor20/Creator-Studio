# ztorUI Design System → ztor Creator Studio r2.2 移植規格書

來源：`Project/ztorUI-design-study/`（`components/*.css` 為 rendering source、`design-system.md` 為正式文件）
範圍：**只取 `[data-theme="ztor"]` mode**，加上不分 mode 的 Foundation／共用規則。其餘五個 mode（transit／creator／medical／moverta／synapse）的專屬色值、專屬 role 一律略過。
用途：CSS 覆寫層的照抄底稿。所有數值一字不差抄自原始碼，`color-mix()` 原樣保留、不換算成單一 hex。

---

## 0 · 這套系統的核心結構（先讀這段再看數值）

ztorUI 是三層 token 架構：**Foundation（raw 值，只准出現在 `:root`）→ Role（語義 token，`[data-theme]` scope，一律 `var()` 指回 Foundation）→ Component（只准取 Role，不准碰 raw 值）**。`ztor` 是第六個 mode，掛在同一個 Foundation 下：它新增了自己的 raw palette（`--z-*` 系列），然後在 `[data-theme="ztor"] { }` 裡把一批 Role token 重新指向這批新 raw 值。**元件層 CSS 完全不用改一行**——button.css、glass-card.css 等等在五個舊 mode 和 ztor mode 下是同一份檔案，換膚只靠切 `<html data-theme="ztor">`。

這意味著移植到 Creator Studio 時，正確做法不是「把某個按鈕的顏色改成橘色」，而是：先建一份等效的 Role token 表（用 Creator Studio 現有的 token 名，但 value 抄本規格書第 1 節），再把玻璃／按鈕／列表的完整配方（第 2–4 節）整段覆寫進去。跳過 Role 層直接改 Component 層的顏色，會在下一次 hover/active 狀態出現時打回原形，因為狀態變化也是吃 Role token（`--pill-active-glow` 等）算出來的，不是寫死在元件規則裡。

---

## 1 · Token 值（ztor mode 最終展開值）

來源：`components/tokens.css`。左欄是 Role 名（元件實際使用的變數），右欄一路追到 Foundation 的最終值。**ztor mode 沒有覆寫的 Role，沿用 `[data-theme]` 深色家族預設值**——這些也列在下面，因為移植時你需要的是「ztor 模式下這個變數實際算出什麼」，不是「ztor 覆寫了什麼」。

### 1.1 背景層級

| Role | 最終值 | 來源 |
|---|---|---|
| `--bg` | `#0e0d0c` | `--z-bg`（ztor 覆寫） |
| `--surface` | `rgba(23, 21, 19, 0.84)` | `--z-panel`（ztor 覆寫） |
| `--surface-2` | `rgba(255, 255, 255, 0.06)` | `--w-06`（未覆寫，沿用深色家族預設） |

### 1.2 表面／卡片（玻璃三件）

| Role | 最終值 | 來源 |
|---|---|---|
| `--glass-bg` | `rgba(255, 255, 255, 0.07)` | `--a-glass`（ztor 未覆寫，沿用 Transit 基準值） |
| `--glass-strong` | `rgba(255, 255, 255, 0.12)` | `--a-glass-strong`（未覆寫） |
| `--glass-rim` | `rgba(255, 255, 255, 0.15)` | `--w-15`（未覆寫，玻璃頂緣內光） |
| `--popover` | `color-mix(in srgb, #0e0d0c 88%, #ffa33f 12%)` | 公式 `color-mix(in srgb, var(--bg) 88%, var(--pill-active-bg) 12%)`，代入 ztor 的 `--bg` 與 `--pill-active-bg` 算出 |

### 1.3 邊框線

| Role | 最終值 | 來源 |
|---|---|---|
| `--line` | `rgba(255, 255, 255, 0.10)` | `--w-10`（未覆寫） |
| `--line-strong` | `rgba(255, 255, 255, 0.15)` | `--w-15`（未覆寫） |

### 1.4 文字層級

| Role | 最終值 | 來源 |
|---|---|---|
| `--text` | `rgba(255, 255, 255, 0.95)` | `--w-95`（未覆寫） |
| `--text-mid` | `rgba(255, 255, 255, 0.70)` | `--w-70`（未覆寫） |
| `--text-dim` | `rgba(255, 255, 255, 0.45)` | `--w-45`（未覆寫） |
| `--num-dim` | `rgba(255, 255, 255, 0.38)` | `--w-38`（未覆寫；數字的暗尾／單位專用） |

### 1.5 主色與其衍生（ztor 專屬，全部是覆寫值）

| Role | 最終值 | 備註 |
|---|---|---|
| `--accent` | `#ffa33f`（`--z-orange`） | 品牌橘實色 |
| `--accent-fg` | `rgba(255, 255, 255, 0.95)`（`var(--text)`） | 橘底一律白字（2026-08-26 使用者裁決）。⚠ 白字在 78% 橘上約 2.4:1、在實色橘上 1.9:1，**都低於 WCAG AA 4.5:1**；若要改回深墨字，`--z-ink: #171717` 已留在 palette 裡 |
| `--accent-ink` | `#ffc178`（`--z-orange-hi`） | accent 當「文字色」用的版本（例如選中底線） |
| `--accent-surface` | `linear-gradient(150deg, color-mix(in srgb, #ffc178 78%, transparent), color-mix(in srgb, #ffa33f 78%, transparent) 52%, color-mix(in srgb, #f2871f 82%, transparent))` | 半透明漸層，78% 是實測甜蜜點（90% 看起來仍是實心；68% 要把文字壓到近純黑才過 AA） |
| `--accent-blur` | `blur(16px) saturate(1.25)` | 配 `--accent-surface` 一起用在 `backdrop-filter` |
| `--accent-glow` | `0 4px 18px color-mix(in srgb, #ffa33f 30%, transparent), inset 0 1px 0 color-mix(in srgb, #ffffff 60%, transparent), inset 0 -1px 0 color-mix(in srgb, #f2871f 70%, transparent), inset 0 0 0 1px color-mix(in srgb, #ffffff 14%, transparent)` | 外光暈＋頂緣內光＋底緣暗邊＋描邊，四層疊在同一個 `box-shadow` |
| `--pill-active-bg` | `#ffa33f`（`--z-orange`） | 選中態用純色（非漸層）——因為它也被 `--popover` 的 `color-mix` 取用，漸層在那個用途會失效 |
| `--pill-active-fg` | `rgba(255, 255, 255, 0.95)`（`var(--text)`） | |
| `--pill-active-surface` | 同 `--accent-surface`（`var(--accent-surface)`） | |
| `--pill-active-blur` | `blur(16px) saturate(1.25)`（同 `--accent-blur`） | |
| `--pill-active-glow` | `0 2px 10px color-mix(in srgb, #ffa33f 24%, transparent), inset 0 1px 0 color-mix(in srgb, #ffffff 55%, transparent), inset 0 -1px 0 color-mix(in srgb, #f2871f 60%, transparent), inset 0 0 0 1px color-mix(in srgb, #ffffff 12%, transparent)` | 比 `--accent-glow` 各數值略收斂（4px→2px、30%→24%、55%/60% vs 60%/70%），選中態比主要動作更收斂一點 |

Foundation 原始色票（`--accent-surface` 與 `--pill-active-glow` 等公式的底層輸入）：

| Token | 值 | 用途 |
|---|---|---|
| `--z-bg` | `#0e0d0c` | 頁面底。刻意偏暖（R 略高於 B）：中性灰若偏冷會被橘色對比效應放大成藍調 |
| `--z-panel` | `rgba(23, 21, 19, 0.84)` | 面板底 |
| `--z-orange` | `#ffa33f` | 品牌橘（實色按鈕、選中態） |
| `--z-orange-hi` | `#ffc178` | 橘的亮版（漸層頂端、accent-ink） |
| `--z-orange-lo` | `#f2871f` | 橘的暗版（漸層底端、內陰影的折射色） |
| `--z-ink` | `#171717` | 深墨字備案（目前未指派給任何 role，留給未來改回墨字用） |
| `--z-warm-white` | `#fbf7f2` | 暖白，次要語彙，目前未指派 |

霧光漸層專屬色票（`--bloom-surface` 用，見第 2 節）：

| Token | 值 | 說明 |
|---|---|---|
| `--z-bloom-1` | `#d0553d` | 上部紅橘——這段紅撐起整個漸層的溫度 |
| `--z-bloom-2` | `#e8894f` | 轉橘 |
| `--z-bloom-3` | `#f0a85e` | 亮橘 |
| `--z-bloom-4` | `#f5cd80` | 底部金黃 |

刻意不用 `--z-orange` 直接鋪大面積漸層：那支飽和度高、適合實心按鈕，鋪成大面積漸層會太鮮；霧光的暖色是低飽和帶粉的，四段各自取樣。

### 1.6 狀態色（跨全部 mode 共用，非 ztor 專屬但 ztor 沿用）

| Role | 最終值 |
|---|---|
| `--ok` | `#35c96a`（`--hue-green`） |
| `--danger` | `#ef4634`（`--hue-red`） |
| `--warn` | `#ff8c3c`（`--hue-orange`） |
| `--info` | `#2f6bff`（`--hue-blue`） |

### 1.7 圓角

| Token | px | 用途 |
|---|---|---|
| `--r-chip` | 10 | 小 chip、地圖 chip |
| `--r-inner` | 16 | 卡內子卡 |
| `--r-card` | 20 | metric 卡、一般卡 |
| `--r-card-lg` | 24 | 面板卡 |
| `--r-card-xl` | 30 | hero 玻璃卡 |
| `--r-pill` | 999 | 一切膠囊：導航、按鈕、chip、搜尋、時間軸 |

規則：**能是膠囊就是膠囊**；圓角只有這五檔加膠囊，出現其他值就是走樣（`design-system.md` Appendix C Checklist #5）。

### 1.8 間距

4px 基準：`--sp-1: 4px` `--sp-2: 8px` `--sp-3: 12px` `--sp-4: 16px` `--sp-5: 20px` `--sp-6: 24px` `--sp-7: 28px` `--sp-8: 32px`。卡片 padding 集中在 18–24px；卡間距 12px；區塊間距 24–32px。

### 1.9 字級字重

| Token | px | 用途 |
|---|---|---|
| `--fs-caption` | 11 | 時間戳、軸標籤、欄位 label |
| `--fs-label` | 12.5 | 次要文字、chip 內文 |
| `--fs-body` | 13.5 | 一般內文、導航 |
| `--fs-title` | 15 | 卡片標題 |
| `--fs-section` | 18 | 面板標題 |
| `--fs-page` | 26 | 頁面主題名 |
| `--fs-hero` | 34 | 區域大標 |
| `--fs-display` | 44 | 頁面級大字 |
| `--fs-num-sm` | 24 | 小型數值 |
| `--fs-num-md` | 34 | metric 卡數值 |
| `--fs-num-lg` | 44 | 主 KPI |
| `--fs-num-xl` | 56 | hero 數值 |

字重：`--fw-light: 300` `--fw-reg: 400` `--fw-med: 500` `--fw-semi: 600`。字距：`--ls-wide: 0.02em`（一般）、`--ls-caps: 0.09em`（全大寫小標）。行高：`--lh-tight: 1.1` `--lh-body: 1.5`。

字型：`--font-ui: 'Poppins', 'Heiti TC', 'PingFang TC', sans-serif`；`--font-dot: 'Doto', 'Poppins', monospace`（點陣數字，Creator 家族專屬，ztor mode 未使用但 CSS 仍可用）。

### 1.10 陰影

| Token | 值 | 用途 |
|---|---|---|
| `--shadow-card` | `0 24px 60px rgba(0, 0, 0, 0.45)` | 玻璃卡深投影（ztor 未覆寫，沿用 Foundation 預設；只有 Moverta 淺色家族覆寫成 `--shadow-light`） |
| `--shadow-pop` | `0 12px 40px rgba(0, 0, 0, 0.5)` | 浮層（dropdown／dialog／toast）投影 |

### 1.11 模糊

| Token | 值 |
|---|---|
| `--blur-glass` | `24px` |
| `--blur-heavy` | `40px` |

動效：`--dur-fast: 160ms` `--dur-med: 280ms` `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`。

---

## 2 · 玻璃質感配方

核心規則（`design-system.md` §1.5）：**玻璃卡三層缺一不可**——
1. 半透明底
2. `backdrop-filter: blur()`
3. 邊界光學（1px 邊線＋頂緣內光 inset＋深投影）

### 2.1 卡片（`.glass`，`components/glass-card.css`）

```css
.glass {
  position: relative;
  background: var(--glass-bg);                 /* ztor: rgba(255,255,255,0.07) */
  backdrop-filter: blur(var(--blur-glass));     /* 24px */
  -webkit-backdrop-filter: blur(var(--blur-glass));
  border: 1px solid var(--line);                /* ztor: rgba(255,255,255,0.10) */
  border-radius: var(--r-card-lg);              /* 24px */
  box-shadow: var(--shadow-card), inset 0 1px 0 var(--glass-rim);
  /* ztor: 0 24px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,0.15) */
}
```

`.glass--panel`（較實的面板，用 `--surface` 而非 `--glass-bg`，blur 加重到 40px）：

```css
.glass--panel {
  background: var(--surface);                   /* ztor: rgba(23,21,19,0.84) */
  backdrop-filter: blur(var(--blur-heavy));      /* 40px */
  -webkit-backdrop-filter: blur(var(--blur-heavy));
}
```

`.glass--solid`（不透明卡，關掉 blur）：

```css
.glass--solid {
  background: var(--surface);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}
```

`.glass--hover`（浮起互動）：

```css
.glass--hover { transition: transform var(--dur-med) var(--ease-out), box-shadow var(--dur-med) var(--ease-out); }
.glass--hover:hover { transform: translateY(-3px); box-shadow: var(--shadow-pop), inset 0 1px 0 var(--glass-rim); }
```

`.glass--tint-red`（警示染色，ztor mode 沒有專屬 `--warn-tint` 覆寫，走 fallback）：

```css
.glass--tint-red {
  background: var(--warn-tint, color-mix(in srgb, var(--hue-red) 18%, transparent));
  border-color: color-mix(in srgb, var(--hue-red) 25%, var(--line));
}
```

### 2.2 側邊欄（`.sidebar`，`components/sidebar.css`）

側邊欄**不是玻璃**，是不透明面板——`background: var(--surface)` 直接吃色、沒有 `backdrop-filter`：

```css
.sidebar {
  width: 232px;
  background: var(--surface);        /* ztor: rgba(23,21,19,0.84)，接近不透明 */
  border-right: 1px solid var(--line);
}
```

原因：ztorUI 沒有把 sidebar 設計成貼場景的浮層（跟 Transit/Synapse 那種貼地圖的資料卡不同），它是結構性的外殼，`design-system.md` 的「浮層實色律」把它歸在需要穩定閱讀的一類。

### 2.3 頂欄（`.topbar`，`components/topbar.css`）

預設也不透明（`background: var(--surface)`），但有一個明確的玻璃 variant：

```css
.topbar {
  height: 60px;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}
.topbar--glass {
  background: var(--glass-bg);                  /* ztor: rgba(255,255,255,0.07) */
  backdrop-filter: blur(var(--blur-glass));      /* 24px */
  -webkit-backdrop-filter: blur(var(--blur-glass));
  border-bottom-color: var(--line);
}
.topbar--flush { background: transparent; }
```

用 `--glass` 或 `--flush` 是取決於這個頂欄要不要浮在內容上；預設實色版適合固定外殼式頂欄。

### 2.4 彈出層（dropdown／dialog／toast／select 選單面）

**這幾種一律吃 `--popover` 實色，不用玻璃。** `components/dropdown.css`：

```css
.dropdown {
  min-width: 190px;
  border: 1px solid var(--line-strong);          /* ztor: rgba(255,255,255,0.15) */
  border-radius: var(--r-inner);                 /* 16px */
  background: var(--popover);
  /* ztor: color-mix(in srgb, #0e0d0c 88%, #ffa33f 12%) */
  box-shadow: var(--shadow-pop);                 /* 0 12px 40px rgba(0,0,0,.5) */
}
```

`.dialog`（`components/overlay.css`）與 `.toast`（`components/toast.css`）、`.menu-panel`（`components/select.css`）皆同一配方：`background: var(--popover)` ＋ `border: 1px solid var(--line-strong)` ＋ `box-shadow: var(--shadow-pop)`，零 `backdrop-filter`。

遮罩層（`.overlay`）本身反而用半透明＋blur（因為它蓋住整個畫面，不是一片浮起的卡）：

```css
.overlay {
  background: color-mix(in srgb, var(--bg) 65%, transparent);  /* ztor: 65% 的 #0e0d0c */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

### 2.5 哪些半透明、哪些不透明，以及為什麼

`design-system.md` Pillar 5「浮層實色律」（5.1 條 9）：

> 玻璃只給貼著場景的表面（貼地圖、貼 3D、貼背景的卡）；浮在其他表面上的層——下拉選單、對話框、toast、tooltip——一律吃 `--popover` 實色。**玻璃疊玻璃會看穿兩層，資訊層級當場失效**。

`tokens.css` 內同一條規則的程式碼註解重述：「浮層實色面（下拉、dialog、toast、tooltip）：玻璃卡可透、浮層必須實色，否則疊在卡上會看穿兩層（r2.2 換皮 demo 驗證過的教訓）」——這是已經在 r2.2 demo 上踩過的坑，移植時要當硬規則遵守，不是美學建議。

歸類表：

| 元件 | 半透明／不透明 | 原因 |
|---|---|---|
| `.glass` 卡片、`.glass--map` | 半透明＋blur | 貼場景（地圖／背景），需要「浮在底紋之上」的層次感 |
| `.topbar--glass` | 半透明＋blur | 貼內容捲動時浮在上方 |
| `.sidebar`、`.topbar`（預設） | 不透明 | 結構性外殼，不貼場景 |
| dropdown／dialog／toast／menu-panel／`.tooltip` | 不透明（`--popover`） | 浮在玻璃卡之上，玻璃疊玻璃會看穿兩層 |
| `.overlay` 遮罩 | 半透明＋blur | 蓋住整個畫面，本身就是最底層，沒有「疊在別的玻璃上」的問題 |

---

## 3 · 按鈕系統

來源：`components/button.css`（9 個 variant）＋ `components/lamp-button.css`（燈膠囊）。以下逐個 variant 給完整 CSS，中文註解原樣保留。

### 3.0 基底（`.btn`）

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  height: 40px;
  padding: 0 var(--sp-5);
  border: 1px solid transparent;
  border-radius: var(--r-pill);
  font-size: var(--fs-body);
  font-weight: var(--fw-med);
  line-height: var(--lh-tight);
  color: var(--text);
  background: transparent;
  white-space: nowrap;
  transition: background var(--dur-fast) var(--ease-out),
              color var(--dur-fast) var(--ease-out),
              border-color var(--dur-fast) var(--ease-out),
              opacity var(--dur-fast) var(--ease-out),
              transform var(--dur-fast) var(--ease-out);
}
.btn svg { width: 16px; height: 16px; flex: none; }
.btn:active { transform: scale(0.97); }
```

### 3.1 `--primary`

```css
/* primary — 家族強調色實底；hover 用 --text 混色做深淺位移：
   深色主題的 --text 是白，混起來提亮；Moverta 淺色主題的 --text 是墨，混起來壓深，兩邊都讀得出狀態 */
.btn--primary {
  background: var(--accent-surface, var(--accent));
  backdrop-filter: var(--accent-blur, none);
  -webkit-backdrop-filter: var(--accent-blur, none);
  color: var(--accent-fg, var(--pill-active-fg));
  box-shadow: var(--accent-glow, none);
}
.btn--primary:hover { filter: brightness(1.07); }
```

ztor mode 展開：`background` 吃 `--accent-surface`（第 1.5 節的漸層），`backdrop-filter: blur(16px) saturate(1.25)`，`color: rgba(255,255,255,0.95)`，`box-shadow` 吃 `--accent-glow` 四層疊加。**這是唯一一個真的長成「發光實心塊」的 variant**——半透明漸層＋blur＋glow 三件事同時發生。

### 3.2 `--solid`

```css
/* solid — 反白鈕（ztorUI 簽名：active pill 的同一配方）*/
.btn--solid {
  background: var(--pill-active-bg);
  color: var(--pill-active-fg);
}
.btn--solid:hover { opacity: 0.88; }
```

ztor：`background: #ffa33f`（純色，非漸層）、`color: rgba(255,255,255,0.95)`。跟 `--primary` 的差別：`--solid` 是純色平塗＋不帶 glow，`--primary` 是漸層＋blur＋glow。

### 3.3 `--ghost`

```css
/* ghost — 卡內次要動作 */
.btn--ghost {
  background: var(--surface-2);
  color: var(--text);
}
.btn--ghost:hover { background: var(--glass-strong); }
```

ztor：`background: rgba(255,255,255,0.06)` → hover `rgba(255,255,255,0.12)`。

### 3.4 `--outline`

```css
/* outline — 透明底描邊 */
.btn--outline {
  background: transparent;
  border-color: var(--line-strong);
  color: var(--text-mid);
}
.btn--outline:hover {
  background: var(--surface-2);
  border-color: var(--text-dim);
  color: var(--text);
}
```

### 3.5 `--danger`

```css
/* danger — 危險動作；文字用 --text，深色主題得白字、淺色主題得墨字，紅底兩邊都讀得清 */
.btn--danger {
  background: var(--danger);
  color: var(--text);
}
.btn--danger:hover { background: color-mix(in srgb, var(--danger) 88%, var(--text) 12%); }
```

ztor：`background: #ef4634`，hover `color-mix(in srgb, #ef4634 88%, rgba(255,255,255,0.95) 12%)`。

### 3.6 `--tint`

```css
/* tint — 染色薄膜：只有一層半透明強調色，不做漸層、不做光暈、不畫邊框。
   形狀完全由那層色定義，加邊會讓它從「一片色」變成「一個框裡裝了色」。
   跟 --primary 的差別是說話音量：primary 是主要動作、要搶眼；
   tint 是次要但同語意群的動作（Preview 之於 Save），
   靠同色系的低透明底把關係講清楚，又不跟主要動作競爭。
   文字用白：薄膜很暗（15% 色疊在深底上），白字對比充足且與其他橘色按鈕一致 */
.btn--tint {
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: var(--text);
}
.btn--tint:hover { background: color-mix(in srgb, var(--accent) 24%, transparent); }
```

ztor：`background: color-mix(in srgb, #ffa33f 15%, transparent)` → hover `24%`。

### 3.7 `--sheer`

```css
/* sheer — 中性薄膜：不帶色相的同款做法，配在彩色主要動作旁邊當取消 */
.btn--sheer {
  background: color-mix(in srgb, var(--text) 8%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: var(--text);
}
.btn--sheer:hover { background: color-mix(in srgb, var(--text) 14%, transparent); }
```

### 3.8 `--bloom`（多層光暈，一字不差）

```css
/* bloom — 霧光：暖色漸層從中心往外淡出成透明，邊緣沒有硬邊。
   邊緣的柔化用 mask 而不是罩一層白霧——白霧會把背景蓋掉、顏色也被洗淡；
   mask 是真的讓色塊本身消失，背景直接透過來，所以放在任何底上都乾淨。
   外光暈留著（那是打在背景上的光，不在按鈕表面）。
   ⚠ 白字壓在亮黃段上對比不足 AA（實測約 2.4:1），這個變體給
   「大字、裝飾性、非關鍵操作」用——關鍵動作請用 --primary 或 --tint */
.btn--bloom {
  position: relative;
  isolation: isolate;
  background: transparent;
  color: var(--text);
  /* 外框把柔邊收住：色層是模糊的，沒有這條線形狀會糊掉、按鈕邊界讀不出來 */
  border-color: color-mix(in srgb, var(--text) 16%, transparent);
  text-shadow: 0 1px 4px color-mix(in srgb, var(--bg) 45%, transparent);
  /* 外光暈收短：色層本身的 blur 已經溢出一圈亮邊，
     陰影再拉長會跟它疊成一大團霧，按鈕就浮不起來 */
  box-shadow: 0 2px 10px color-mix(in srgb, var(--bloom-halo, var(--accent)) 20%, transparent);
}

/* 色層內縮再模糊，形狀吃 border-radius: inherit。
   淡出邊緣不用 mask——mask 的線性／徑向淡出都是方或橢圓，套在膠囊上會把圓潤切掉；
   內縮＋blur 是唯一能讓「柔邊」自己跟著圓角走的做法，溢出的那幾 px 正好變成光暈 */
.btn--bloom::before {
  content: "";
  position: absolute;
  z-index: -1;
  /* blur 半徑必須遠小於色層高度，否則整片會糊成一團看不出漸層。
     40px 的按鈕扣掉內縮只剩 34px，blur 給到 5px 就是柔邊的上限 */
  inset: 3px;
  border-radius: inherit;
  background: var(--bloom-surface);
  filter: blur(5px);
  pointer-events: none;
}
.btn--bloom.btn--lg::before { inset: 4px; filter: blur(6px); }
.btn--bloom.btn--sm::before { inset: 2px; filter: blur(4px); }
.btn--bloom:hover { filter: brightness(1.06) saturate(1.06); }

/* 大尺寸才看得出霧邊的層次，小尺寸白霧會吃掉太多可讀面積 */
.btn--bloom.btn--lg { padding: 0 var(--sp-8); }
```

ztor mode 展開值：
- `border-color`：`color-mix(in srgb, rgba(255,255,255,0.95) 16%, transparent)`
- `text-shadow`：`0 1px 4px color-mix(in srgb, #0e0d0c 45%, transparent)`
- `box-shadow`（外光暈，`--bloom-halo` 未定義故 fallback 到 `--accent`）：`0 2px 10px color-mix(in srgb, #ffa33f 20%, transparent)`
- `::before` 的 `background`：`--bloom-surface` = `linear-gradient(176deg, color-mix(in srgb, #d0553d 80%, #e8894f) 0%, #d0553d 16%, #e8894f 36%, #f0a85e 56%, #f5cd80 84%, #f5cd80 100%)`
- `::before` 的 `filter: blur(5px)`（預設尺寸）／`blur(6px)`（`--lg`）／`blur(4px)`（`--sm`）
- `::before` 的 `inset: 3px`（預設）／`4px`（`--lg`）／`2px`（`--sm`）

漸層停駐點的設計意圖（`--bloom-surface` 定義處的中文註解，見 tokens.css）：

> 仿參考圖的暖色漸層。紅不是頂端一條線，而是佔到上部三成——0% 稍淡（頂緣受光），18%〔實際定義在 16%〕才是最紅，之後一路轉橘轉金。這個分佈才有參考圖那種「從上面被烤熱」的感覺。金黃段刻意在 84% 就到位、最後 16% 維持同色不再變，黃的面積才夠。

### 3.9 `--quiet`

```css
/* quiet — 純文字動作（表格列尾、對話框取消）*/
.btn--quiet {
  background: transparent;
  color: var(--text-mid);
  padding: 0 var(--sp-3);
}
.btn--quiet:hover { color: var(--text); }
```

### 3.10 尺寸階、圖示比例、整列寬、disabled、loading、按鈕群

```css
/* 尺寸階與 icon-btn 對齊：32 / 40 / 48 */
.btn--sm {
  height: 32px;
  padding: 0 14px;
  font-size: var(--fs-label);
}
.btn--sm svg { width: 14px; height: 14px; }
.btn--lg {
  height: 48px;
  padding: 0 26px;
}
.btn--lg svg { width: 18px; height: 18px; }

/* 圖示專用比例：正圓、無左右內距 */
.btn--icon-only { padding: 0; width: 40px; }
.btn--icon-only.btn--sm { width: 32px; }
.btn--icon-only.btn--lg { width: 48px; }

/* 整列寬 */
.btn--block { width: 100%; }

.btn:disabled,
.btn.is-disabled {
  opacity: 0.45;
  pointer-events: none;
}

/* 讀取中：文字留著，前面加一顆旋轉環；期間不可再點 */
.btn.is-loading { pointer-events: none; }

.btn__spinner {
  width: 16px; height: 16px;
  flex: none;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, currentColor 30%, transparent);
  border-top-color: transparent;
  animation: btn-spin 720ms linear infinite;
}
.btn--sm .btn__spinner { width: 14px; height: 14px; }

@keyframes btn-spin {
  to { transform: rotate(360deg); }
}

/* 按鈕群：相鄰動作橫排 */
.btn-group {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
}
```

### 3.11 Lamp Button（燈膠囊，`components/lamp-button.css`，全檔一字不差）

設計意圖整段（檔頭註解）：

> lamp-button — 燈膠囊：光從玻璃內部透出來的按鈕／開關。跟一般實心按鈕的差別在光源位置：實心是「表面塗上顏色」，這裡是「深色玻璃殼裡關著一顆會發光的東西」。三層構成：殼＝半透明深色底＋backdrop blur＋頂緣內光（玻璃厚度）；暈＝`::before` 大範圍柔光，負責照亮範圍與往右的擴散；絲＝`::after` 小而極亮的高光，疊在柔光起點，負責亮度尖峰。熄滅時只留殼，光核 opacity 收掉，所以同一顆按鈕能演 on/off。效能：光核是靜態的 radial-gradient + filter blur，一次 paint 後交給合成器；不做 keyframes 動畫，切換靠 opacity/transition（compositor-only）。

```css
.lamp {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  height: 40px;
  padding: 0 var(--sp-6);
  border-radius: var(--r-pill);
  border: 1px solid color-mix(in srgb, var(--text) 9%, transparent);
  background: color-mix(in srgb, var(--bg) 72%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--text-mid);
  font-size: var(--fs-body);
  font-weight: var(--fw-med);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
  white-space: nowrap;
  transition: color var(--dur-med) var(--ease-out),
              border-color var(--dur-med) var(--ease-out),
              box-shadow var(--dur-med) var(--ease-out);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--text) 12%, transparent);
}

/* 光核：橢圓、偏左、比容器高，被 overflow 裁成膠囊內的一團光 */
.lamp::before {
  content: "";
  position: absolute;
  z-index: -1;
  left: 20%;
  top: 50%;
  /* 上限用 px：光源在真實世界有固定大小，按鈕變寬時光不該跟著變寬，
     否則 --block 這種寬按鈕上，光的右緣會拉成一道看得見的直線 */
  width: 72%;
  max-width: 190px;
  height: 200%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  /* 第一層：大範圍柔光。負責照亮殼、往右拉長的擴散，不負責亮度尖峰 */
  background: radial-gradient(
    closest-side,
    var(--accent) 0%,
    color-mix(in srgb, var(--accent) 70%, transparent) 42%,
    color-mix(in srgb, var(--accent) 30%, transparent) 70%,
    transparent 100%
  );
  filter: blur(16px);
  opacity: 0;
  transition: opacity var(--dur-med) var(--ease-out);
  pointer-events: none;
}

/* 第二層：燈絲高光。小、幾乎不模糊、亮到接近白熱，疊在柔光的起點上。
   亮度尖峰全靠它——柔光那層負責範圍，這層負責「這裡是光源本體」。
   兩層分開才做得出真燈的樣子：只有柔光會像表面被塗色，只有亮點會像貼了顆貼紙 */
.lamp::after {
  content: "";
  position: absolute;
  z-index: -1;
  /* 貼著左緣：中心壓在 5%，左半超出容器被圓角裁掉，
     所以看到的是「緊貼殼壁的一道強光」而不是浮在中間的一顆球 */
  left: 5%;
  top: 50%;
  width: 22%;
  max-width: 56px;
  height: 82%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    color-mix(in srgb, var(--accent) 45%, var(--text)) 0%,
    color-mix(in srgb, var(--accent) 92%, var(--text)) 38%,
    color-mix(in srgb, var(--accent) 70%, transparent) 72%,
    transparent 100%
  );
  filter: blur(5px);
  opacity: 0;
  transition: opacity var(--dur-med) var(--ease-out);
  pointer-events: none;
}

/* 亮起 */
.lamp.is-on {
  color: var(--text);
  /* 文字壓在光的尾巴上時對比會不均，給一層極淡暗影托住；
     暗影只在亮起時出現，熄滅時文字坐在均勻暗底上不需要 */
  text-shadow: 0 1px 3px color-mix(in srgb, var(--bg) 70%, transparent);
  border-color: color-mix(in srgb, var(--accent) 16%, transparent);
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--text) 18%, transparent),
    inset 9px 0 20px -12px color-mix(in srgb, var(--accent) 85%, transparent),
    inset 0 -1px 0 color-mix(in srgb, var(--accent) 26%, transparent),
    0 0 26px color-mix(in srgb, var(--accent) 24%, transparent);
}
.lamp.is-on::before { opacity: 1; }
.lamp.is-on::after { opacity: 1; }

/* 熄滅時 hover：殼微亮，暗示可以按 */
.lamp:hover { border-color: color-mix(in srgb, var(--text) 16%, transparent); color: var(--text); }
.lamp.is-on:hover::before { opacity: 0.88; }
.lamp:active { transform: scale(0.98); }

.lamp:disabled,
.lamp.is-disabled {
  opacity: 0.45;
  pointer-events: none;
}

/* 尺寸 */
.lamp--sm { height: 32px; padding: 0 var(--sp-5); font-size: var(--fs-label); }
.lamp--lg { height: 48px; padding: 0 var(--sp-7); font-size: var(--fs-title); }
.lamp--block { display: flex; width: 100%; }

/* 方形燈號：狀態指示用，不放文字 */
.lamp--square {
  width: 40px;
  padding: 0;
  border-radius: var(--r-chip);
}
.lamp--square.lamp--sm { width: 32px; }

/* 光核換到右緣的變體：一排燈號並列時錯開光位才不會像複製貼上。
   柔光與燈絲要一起移，否則亮點會離開它自己的光暈。
   刻意不做「置中」變體：光壓在文字正中央時字讀不出來，
   光源只能待在左緣或右緣，文字才有暗底可坐 */
.lamp--light-right::before { left: 80%; }
.lamp--light-right::after { left: 95%; }
```

ztor mode 展開的關鍵值：`--accent` = `#ffa33f`，所以光核第一層是 `radial-gradient(closest-side, #ffa33f 0%, color-mix(in srgb, #ffa33f 70%, transparent) 42%, color-mix(in srgb, #ffa33f 30%, transparent) 70%, transparent 100%)`；第二層燈絲高光是 `radial-gradient(closest-side, color-mix(in srgb, #ffa33f 45%, rgba(255,255,255,.95)) 0%, color-mix(in srgb, #ffa33f 92%, rgba(255,255,255,.95)) 38%, color-mix(in srgb, #ffa33f 70%, transparent) 72%, transparent 100%)`。

---

## 4 · 列表與表格

來源：`components/product-list.css`。

### 4.1 「列表群組律」——本規格書最重要的一條互動規則

原始碼註解（一字不差）：

> ── 列表群組律（本專案所有「重複列的集合」共用同一套）──────────────
> 清單本身不裝進卡片：整組列平鋪在頁面上，列與列之間只有一條髮絲線。
> 只有游標指著的那一列浮起來成卡片——背景、圓角、投影一起出現，
> 同時把自己與前一列的分隔線收掉，浮起的卡才不會被線切到。
> 這樣「一次只有一列是物件，其餘是資料」，比整組裝進大卡安靜得多。
> 同一套配方也用在 list-item 與 table 的列上。

完整實作：

```css
.plist {
  display: flex;
  flex-direction: column;
}

/* 表頭列：欄寬與 row 對齊，語彙沿用 base.css 的全大寫小標。
   刻意不畫下框線——表頭與內容之間靠留白分隔就夠，多一條線會讓清單看起來像被裝進表格框 */
.plist__head {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-2) var(--sp-4);
  font-size: var(--fs-caption);
  font-weight: var(--fw-med);
  letter-spacing: var(--ls-caps);
  text-transform: uppercase;
  color: var(--text-dim);
  white-space: nowrap;
}

.plist__row {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4);
  border-bottom: 1px solid var(--line);
  border-radius: var(--r-inner);
  transition: background var(--dur-fast) var(--ease-out),
              box-shadow var(--dur-fast) var(--ease-out),
              border-color var(--dur-fast) var(--ease-out);
}
.plist__row:hover {
  z-index: 1;
  background: var(--surface-2);
  border-bottom-color: transparent;
  box-shadow: var(--shadow-card);
}
.plist__row:has(+ .plist__row:hover) { border-bottom-color: transparent; }
.plist__row:last-child { border-bottom-color: transparent; }

/* 選取態：強調色低透明度染底，深淺主題都只是把底色往 accent 拉，不換文字色 */
.plist__row.is-selected {
  background: color-mix(in srgb, var(--accent) 13%, transparent);
  /* 不畫橘框：整列描一圈強調色太吵，而且列一多就變成滿版橘網格。
     染色底＋已經是橘色的 checkbox 勾，兩者就足以表達選中 */
  border-color: transparent;
}
.plist__row.is-disabled {
  opacity: 0.45;
  pointer-events: none;
}
```

`:has()` 那一條是關鍵機關：`.plist__row:has(+ .plist__row:hover)` 選中「下一個兄弟正在 hover 的那一列」，用來把**上一列**的分隔線也收掉——否則浮起的那一列上緣還留著一條線，跟它自己的投影卡在一起會很難看。這是 CSS 原生 `:has()` 向後選取的實際用例，瀏覽器支援度要注意（Safari 15.4+、Chrome 105+、Firefox 121+）。

ztor mode 展開：hover 背景 `rgba(255,255,255,0.06)`；is-selected 背景 `color-mix(in srgb, #ffa33f 13%, transparent)`；hover 投影沿用 `--shadow-card` = `0 24px 60px rgba(0,0,0,.45)`。

### 4.2 其餘結構（縮圖、欄位、動作區、格狀檢視）

```css
/* 多選槽：只留位，checkbox 本體由 switch.css 提供 */
.plist__check {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 20px;
}

.plist__thumb {
  position: relative;
  flex: none;
  width: 56px;
  height: 56px;
  border-radius: var(--r-chip);
  border: 1px solid var(--line);
  background: var(--surface-2);
  overflow: hidden;
}
/* 用 > * 而不是列舉 img/svg：放 div 或 span 當漸層佔位時也要撐滿，
   否則縮圖會是空的（消費頁踩過） */
.plist__thumb > * {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.plist__thumb--lg { width: 80px; height: 80px; }

/* 縮圖左上角疊標（新品／促銷／缺貨）：浮層實色底避免看穿縮圖 */
.plist__thumb-badge {
  position: absolute;
  top: var(--sp-1);
  left: var(--sp-1);
  padding: 2px 7px;
  border-radius: var(--r-pill);
  font-size: var(--fs-caption);
  line-height: var(--lh-tight);
  color: var(--text);
  background: color-mix(in srgb, var(--popover) 85%, transparent);
  backdrop-filter: blur(var(--blur-glass));
  -webkit-backdrop-filter: blur(var(--blur-glass));
}

.plist__main {
  flex: 1 1 auto;
  min-width: 0;
}
.plist__title {
  font-size: var(--fs-body);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.plist__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  font-size: var(--fs-caption);
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
}
.plist__meta-sep {
  flex: none;
  opacity: 0.55;
}

/* 固定欄：列模式下寬度寫死才能與表頭對齊 */
.plist__col {
  flex: none;
  font-size: var(--fs-label);
  color: var(--text-mid);
  white-space: nowrap;
}
.plist__col--price {
  width: 96px;
  text-align: right;
  font-size: var(--fs-body);
  color: var(--text);
}
.plist__col--stock { width: 132px; }
.plist__col--status { width: 108px; }
.plist__col--date { width: 104px; }
.plist__col--num { font-variant-numeric: tabular-nums; }

/* 列尾動作：平時收起，指標進列才顯形；鍵盤 focus 也要能叫出來 */
.plist__actions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex: none;
  opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-out);
}
.plist__row:hover .plist__actions,
.plist__row:focus-within .plist__actions { opacity: 1; }

/* 觸控裝置沒有 hover，動作若不常駐就永遠點不到 */
@media (hover: none) {
  .plist__actions { opacity: 1; }
}

/* ---------- 格狀檢視 ---------- */
.plist--grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--sp-4);
}
.plist--grid .plist__row {
  flex-direction: column;
  align-items: stretch;
  gap: var(--sp-3);
  padding: var(--sp-3);
  border-radius: var(--r-card);
  background: var(--surface-2);
  border-color: var(--line);
}
.plist--grid .plist__row:hover {
  background: var(--glass-strong);
  border-color: var(--line-strong);
}
.plist--grid .plist__thumb {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  border-radius: var(--r-inner);
}
.plist--grid .plist__check {
  position: absolute;
  top: var(--sp-4);
  left: var(--sp-4);
  z-index: 1;
}
.plist--grid .plist__col,
.plist--grid .plist__col--price {
  width: auto;
  text-align: left;
}
.plist--grid .plist__actions { opacity: 1; }
```

---

## 5 · 巢狀容器

來源：`components/nest.css`（全檔）。

檔頭設計意圖：

> nest — 巢狀子卡：form-section 內再長一層子表單／子區塊時的表面。語彙：比卡面亮一階（surface-2）、圓角縮一級（r-inner）、不上 backdrop blur（玻璃三層只給頂級表面；巢狀層再 blur 會取樣到自己的卡、白費 GPU 也讀不出層次）。

四個 variant：

### 5.1 基底

```css
.nest {
  background: var(--surface-2);
  border: 1px solid var(--line);
  border-radius: var(--r-inner);
  padding: var(--sp-5);
  margin-top: var(--sp-3);
}

.nest__title {
  display: block;
  font-size: var(--fs-label);
  font-weight: var(--fw-med);
  color: var(--text);
  margin-bottom: 2px;
}

.nest__sub {
  display: block;
  font-size: var(--fs-caption);
  color: var(--text-dim);
  margin-bottom: var(--sp-4);
}
```

用途：預設用在需要輕微區隔但仍屬同一卡片邏輯範圍的子區塊。

### 5.2 `--inset`（貼邊內嵌——負 margin 算法）

```css
/* 貼邊內嵌：水平幾乎撐滿父卡、只留 sp-2 的窄邊，圓角縮一級（card-lg 24 → inner 16）。
   靠明度差與父面分離，不畫邊線——邊線會把「同一張卡的主體」讀成「另一張卡」。
   用在「這一整段就是父卡的主要內容」（唯讀摘要、資料面），不是附加設定。
   假設父卡水平 padding 為 sp-6；父卡 padding 不同時覆寫本規則的 margin。
   來源：Medical 家族 Patient Profile 卡的資料面（screenshot:user-10） */
.nest--inset {
  margin-left: calc(var(--sp-1) - var(--sp-6));
  margin-right: calc(var(--sp-1) - var(--sp-6));
  border-color: transparent;
  border-radius: var(--r-card);
  background: color-mix(in srgb, var(--text) 7%, transparent);
}
```

負 margin 算法拆解：`calc(var(--sp-1) - var(--sp-6))` = `calc(4px - 24px)` = `-20px`。這個公式**假設父卡的水平 padding 是 `--sp-6`（24px）**——用意是讓子區塊往外「頂」到只剩 `--sp-1`（4px）窄邊，視覺上幾乎貼齊父卡邊緣。若移植目標（Creator Studio）的卡片水平 padding 不是 24px，這條公式要跟著改，规则是：`margin = sp-1 - 父卡水平padding`。

ztor mode 展開：`background: color-mix(in srgb, rgba(255,255,255,0.95) 7%, transparent)`，圓角從父卡的 `--r-card-lg`（24px）縮到 `--r-card`（20px），並且無邊框（`border-color: transparent`）。

### 5.3 `--flush`（貼齊父卡底）

```css
/* 貼齊父卡底：滿版、只留上緣髮絲線（r2.2 的 nest 貼底做法） */
.nest--flush {
  margin: var(--sp-4) calc(-1 * var(--sp-6)) calc(-1 * var(--sp-6));
  border: 0;
  border-top: 1px solid var(--line);
  border-radius: 0 0 var(--r-card-lg) var(--r-card-lg);
}
```

同樣假設父卡 padding 為 `--sp-6`（24px）：`margin` 用 `calc(-1 * var(--sp-6))` 把左右與底部完全頂出父卡邊界（-24px），只留 `margin-top: var(--sp-4)`（16px）跟上方內容保持距離。底部兩個圓角沿用父卡的 `--r-card-lg`（24px），讓這個區塊視覺上變成「父卡底部延伸出來的一截」。

### 5.4 `--dashed`（虛線框，預告性區塊）

```css
/* 虛線框：尚未啟用／預告性的子區塊 */
.nest--dashed {
  background: transparent;
  border: 1.5px dashed var(--line-strong);
}
```

ztor 展開：`border: 1.5px dashed rgba(255,255,255,0.15)`。對應 `design-system.md` 的「虛線＝暫態或範圍」簽名 pattern（Pillar 5.1 條 8）。

### 5.5 `.is-hidden`

```css
.nest.is-hidden { display: none; }
```

---

## 6 · 背景底紋

來源：`components/backdrop.css`（全檔，13 種 pattern）。

檔頭用法說明：一個固定滿版層 `.bd` 疊在內容之下，選一個 `--pattern` 變體；可再疊 `.bd-glow` 輝光。複雜形狀用 `mask-image` 帶 SVG data-uri，顏色一律來自 `background-color` 的 token（data-uri 內的黑只是遮罩形狀，不是顏色）。

濃度控制：

```css
.bd {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.bd { --bd-ink: var(--line); --bd-size: 22px; }
.bd--soft { --bd-ink: color-mix(in srgb, var(--line) 55%, transparent); }
.bd--dense { --bd-ink: var(--line-strong); }
```

ztor 展開：`--bd-ink` 預設 `rgba(255,255,255,0.10)`；`--soft` 版 `color-mix(in srgb, rgba(255,255,255,0.10) 55%, transparent)`；`--dense` 版 `rgba(255,255,255,0.15)`。

### 6.1 平面組（9 種）

```css
/* 1 · dots — 圓點網格。最中性，Creator 與 Medical 原作的底紋 */
.bd--dots {
  background-image: radial-gradient(var(--bd-ink) 1px, transparent 1px);
  background-size: var(--bd-size) var(--bd-size);
}

/* 2 · plus — 十字標記。比圓點更精密，儀器刻度感 */
.bd--plus {
  background-color: var(--bd-ink);
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Cpath d='M11 8v6M8 11h6' stroke='black' stroke-width='1'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Cpath d='M11 8v6M8 11h6' stroke='black' stroke-width='1'/%3E%3C/svg%3E");
  -webkit-mask-size: var(--bd-size) var(--bd-size);
  mask-size: var(--bd-size) var(--bd-size);
}

/* 3 · grid — 細線方格。工程圖紙感，資料密度高的畫面用它會太吵，適合空曠版面 */
.bd--grid {
  background-image:
    linear-gradient(var(--bd-ink) 1px, transparent 1px),
    linear-gradient(90deg, var(--bd-ink) 1px, transparent 1px);
  background-size: var(--bd-size) var(--bd-size);
}

/* 4 · hatch — 對角斜線。有方向性，讓靜態畫面帶一點速度感 */
.bd--hatch {
  background-image: repeating-linear-gradient(
    45deg,
    var(--bd-ink) 0 1px,
    transparent 1px 9px
  );
}

/* 5 · contour — 等高線。Synapse 地形血統，最有「場景」味道 */
.bd--contour {
  background-color: var(--bd-ink);
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cg fill='none' stroke='black' stroke-width='1'%3E%3Cpath d='M-20 60c60-30 120 10 180-15s90 5 160-20'/%3E%3Cpath d='M-20 110c70-25 110 20 170-10s100 10 170-25'/%3E%3Cpath d='M-20 165c50-35 130 15 190-20s80 15 150-15'/%3E%3Cpath d='M-20 215c80-20 100 25 165-5s95 5 175-30'/%3E%3Cpath d='M-20 265c60-30 125 10 185-18s85 12 155-18'/%3E%3C/g%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cg fill='none' stroke='black' stroke-width='1'%3E%3Cpath d='M-20 60c60-30 120 10 180-15s90 5 160-20'/%3E%3Cpath d='M-20 110c70-25 110 20 170-10s100 10 170-25'/%3E%3Cpath d='M-20 165c50-35 130 15 190-20s80 15 150-15'/%3E%3Cpath d='M-20 215c80-20 100 25 165-5s95 5 175-30'/%3E%3Cpath d='M-20 265c60-30 125 10 185-18s85 12 155-18'/%3E%3C/g%3E%3C/svg%3E");
  -webkit-mask-size: 300px 300px;
  mask-size: 300px 300px;
}

/* 6 · scan — 水平掃描線。監看螢幕感，配 Transit 這種控制台最合 */
.bd--scan {
  background-image: repeating-linear-gradient(
    to bottom,
    var(--bd-ink) 0 1px,
    transparent 1px 5px
  );
}

/* 7 · radar — 同心圓。從畫面某點擴散，適合有「中心事件」的畫面 */
.bd--radar {
  background-image: repeating-radial-gradient(
    circle at 50% 28%,
    var(--bd-ink) 0 1px,
    transparent 1px 68px
  );
}

/* 8 · noise — 純顆粒，不帶幾何。最低調，讓玻璃與漸層自己說話 */
.bd--noise {
  opacity: 0.5;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.08'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* 9 · none — 純色底，只靠輝光與玻璃分層 */
.bd--none { background-image: none; }
```

### 6.2 立體組（4 種）

檔頭設計原則：只做「一次性 paint、之後交給合成器」的技法。刻意避開三件事——`feTurbulence` 加 `feDiffuseLighting` 的打光浮雕（最貴的 SVG primitive，大面積會讓 CPU 全速跑）、逐點 `box-shadow`（paint-heavy）、`background-attachment: fixed`（每次捲動重繪，iOS 直接忽略）。本組全部靜態無動畫，與頁面既有的多層 `backdrop-filter` 不搶頻寬。

```css
/* 10 · iso — 等角立方體。三個面用不同明度模擬受光，是最強的平面轉立體錯覺 */
.bd--iso {
  background-image: repeating-conic-gradient(
    from 30deg,
    color-mix(in srgb, var(--text) 2%, transparent) 0 60deg,
    color-mix(in srgb, var(--text) 4.5%, transparent) 60deg 120deg,
    transparent 120deg 180deg
  );
  background-size: 52px 90px;
}

/* 11 · emboss — 浮雕凸點。高光與陰影對角錯位，點會從平面浮起來。
   用兩層 radial-gradient 而不是每點一個 box-shadow，差別是一次 raster 對上千次 paint */
.bd--emboss {
  background-image:
    radial-gradient(circle at 38% 36%, color-mix(in srgb, var(--text) 6%, transparent) 0 12%, transparent 13%),
    radial-gradient(circle at 62% 64%, color-mix(in srgb, var(--bg) 55%, transparent) 0 12%, transparent 13%);
  background-size: 30px 30px;
}

/* 12 · horizon — 透視地平線網格。只鋪畫面下半部，遠處用 mask 淡出。
   transform 是靜態的：不做 background-position 動畫（那會逐幀重繪） */
.bd--horizon { background-image: none; }
.bd--horizon::after {
  content: "";
  position: absolute;
  left: -60%;
  right: -60%;
  bottom: 0;
  height: 58%;
  /* 線色比一般底紋強一階：經透視壓縮後線會變細變淡，用 --bd-ink 的話近乎看不見 */
  background-image:
    linear-gradient(color-mix(in srgb, var(--text) 15%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--text) 15%, transparent) 1px, transparent 1px);
  background-size: 54px 54px;
  transform: perspective(420px) rotateX(64deg);
  transform-origin: bottom center;
  -webkit-mask-image: linear-gradient(to top, black 0 8%, transparent 82%);
  mask-image: linear-gradient(to top, black 0 8%, transparent 82%);
}

/* 13 · depth — 疊層深度。大格與小格同時存在，靜止也讀得出前後兩層 */
.bd--depth {
  background-image:
    linear-gradient(var(--bd-ink) 1px, transparent 1px),
    linear-gradient(90deg, var(--bd-ink) 1px, transparent 1px),
    linear-gradient(color-mix(in srgb, var(--bd-ink) 45%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--bd-ink) 45%, transparent) 1px, transparent 1px);
  background-size: 92px 92px, 92px 92px, 23px 23px, 23px 23px;
}
```

### 6.3 輝光層（獨立疊加）

```css
.bd-glow {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(
    52% 42% at 50% 24%,
    color-mix(in srgb, var(--accent) 12%, transparent),
    transparent 70%
  );
}
.bd-glow--corner {
  background: radial-gradient(
    46% 38% at 88% 8%,
    color-mix(in srgb, var(--accent) 14%, transparent),
    transparent 70%
  );
}
.bd-glow--none { background: none; }
```

ztor 展開：`.bd-glow` = `radial-gradient(52% 42% at 50% 24%, color-mix(in srgb, #ffa33f 12%, transparent), transparent 70%)`；`.bd-glow--corner` = `radial-gradient(46% 38% at 88% 8%, color-mix(in srgb, #ffa33f 14%, transparent), transparent 70%)`。

### 6.4 效能安全與密度上限規則

`design-system.md` §1.7 Texture 提到底紋出現位置，但明確的「效能安全」與「密度上限」規則主要落在 `backdrop.css` 檔頭與立體組註解（已完整引用於上），核心兩條：

1. **一次性 paint、交給合成器**：13 種 pattern 全部避開三種昂貴技法——`feTurbulence`＋`feDiffuseLighting` 浮雕光（最貴的 SVG primitive）、逐點 `box-shadow`（paint-heavy）、`background-attachment: fixed`（每次捲動重繪，iOS 直接忽略）。
2. **玻璃卡會讓底紋透進來，密度有上限**：這條規則的字面依據是 Implementation Notes（`design-system.md` Appendix C）：「玻璃效能：`backdrop-filter` 層數多時很吃 GPU，實產品要限制同屏玻璃層數或預先烘焙背景模糊」。實務含義：`.bd` 底紋疊加玻璃卡的 `backdrop-filter: blur()` 時，底紋會被模糊取樣進玻璃卡背後，若底紋 pattern 本身密度過高（例如 `--bd-size` 太小、或疊加 `--dense` 又疊加多層玻璃），會讓每張玻璃卡背後都要重新取樣一次高頻紋理，GPU 負擔隨玻璃卡數量線性增加。移植到 Creator Studio 這種可能同屏多卡的後台介面時，這條要當硬限制：**同屏玻璃卡數量多時，底紋選淡的（`--soft` 或 `--noise`），不要疊 `--dense` 的 `--grid`／`--contour` 這類高頻 pattern**。

---

## 7 · 其他元件（關鍵樣式）

以下只列玻璃／邊框／主色／hover-active 狀態相關的核心規則，不逐行全抄非關鍵屬性（layout 用的 flex/gap/padding 等結構性屬性視需要省略，實際數值以原始碼為準）。

### 7.1 Switch／Checkbox／Radio（`components/switch.css`）

```css
.switch {
  width: 40px; height: 24px;
  border: 1px solid var(--line);
  border-radius: var(--r-pill);
  background: var(--surface-2);
}
.switch:hover { border-color: var(--line-strong); }

.switch__thumb {
  width: 18px; height: 18px;
  border-radius: var(--r-pill);
  /* 關閉態的滑塊用中性亮面，不用 --pill-active-bg：
     那支在彩色選中的家族（ztor 橘）會讓「關閉」長得像「開啟」 */
  background: color-mix(in srgb, var(--text) 62%, transparent);
  box-shadow: var(--shadow-pop);
}

.switch.is-on {
  background: var(--accent-surface, var(--accent));
  backdrop-filter: var(--accent-blur, none);
  -webkit-backdrop-filter: var(--accent-blur, none);
  border-color: transparent;
  box-shadow: var(--accent-glow, none);
}
.switch.is-on .switch__thumb {
  transform: translateX(16px);
  /* 滑塊改用強調色的前景色：軌道與滑塊在某些家族同為白或同為橘，
     用 accent-fg 才保證兩者永遠有對比，不必再靠描邊救 */
  background: var(--accent-fg, var(--pill-active-fg));
  box-shadow: var(--shadow-pop);
}

.checkbox {
  width: 18px; height: 18px;
  border: 1px solid var(--line-strong);
  border-radius: 6px;
}
.checkbox:hover { border-color: var(--accent); }
.checkbox.is-checked { background: var(--accent); border-color: transparent; }

.radio {
  width: 18px; height: 18px;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
}
.radio:hover { border-color: var(--accent); }
.radio.is-checked { border-color: var(--accent); }
.radio__dot { background: var(--accent); }
```

ztor：is-on 開關的 `background` 吃 `--accent-surface`（漸層）＋`backdrop-filter: blur(16px) saturate(1.25)`＋`box-shadow` 吃 `--accent-glow`；checkbox/radio 選中一律 `#ffa33f`。

### 7.2 Select（`components/select.css`）

```css
.select {
  height: 40px;
  border: 1px solid var(--line);
  border-radius: var(--r-chip);
  background: var(--surface-2);
  color: var(--text);
}
.select:hover { border-color: var(--line-strong); }
.select:focus,
.select.is-open {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
}
.select.is-invalid {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 20%, transparent);
}

/* 浮層選單面：必須實色，疊在玻璃卡上才不會看穿兩層 */
.menu-panel {
  border: 1px solid var(--line-strong);
  border-radius: var(--r-inner);
  background: var(--popover);
  box-shadow: var(--shadow-pop);
}
.menu-panel__option:hover { background: var(--surface-2); color: var(--text); }
.menu-panel__option.is-selected .menu-panel__check { color: var(--accent); }
```

focus ring ztor 展開：`box-shadow: 0 0 0 3px color-mix(in srgb, #ffa33f 20%, transparent)`。

### 7.3 Input（`components/input.css`）

```css
.input {
  height: 40px;
  border: 1px solid var(--line);
  border-radius: var(--r-chip);
  background: var(--surface-2);
  color: var(--text);
}
.input:hover { border-color: var(--line-strong); }
.input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent);
}
.input.is-invalid {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 20%, transparent);
}
.input[readonly],
.input.is-readonly { color: var(--text-mid); background: transparent; }
```

`.input-affix`（前後綴包框）同款配方，focus/invalid 邊框與環一致。

### 7.4 Field（`components/field.css`）

```css
/* 必填：文字後面一顆強調色小圓點，不用星號（ztorUI 語彙偏幾何）*/
.field__label.is-required::after {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: var(--accent);
}
.field__error { color: var(--danger); }

/* 表單區塊卡：一組相關欄位包成一張玻璃卡 */
.form-section {
  background: var(--glass-bg);
  border: 1px solid var(--line);
  border-radius: var(--r-card-lg);
}
```

`.form-section` 是玻璃（用 `--glass-bg` 而非 `--popover`）——因為它是內容區塊、不是浮層。

### 7.5 Chip（`components/chip.css`）

```css
.chip {
  border-radius: var(--r-pill);
  color: var(--text);
  background: var(--surface-2);
}

/* tinted：半透明色底＋同色文字（延遲分鐘、High Risk、+1.2 pg/ml）*/
.chip--red    { background: color-mix(in srgb, var(--hue-red) 18%, transparent);    color: color-mix(in srgb, var(--hue-red) 85%, var(--text)); }
.chip--orange { background: color-mix(in srgb, var(--hue-orange) 16%, transparent); color: color-mix(in srgb, var(--hue-orange) 88%, var(--text)); }
.chip--green  { background: color-mix(in srgb, var(--hue-green) 16%, transparent);  color: color-mix(in srgb, var(--hue-green) 85%, var(--text)); }
.chip--lime   { background: color-mix(in srgb, var(--hue-lime) 18%, transparent);   color: color-mix(in srgb, var(--hue-lime) 92%, var(--text)); }
.chip--blue   { background: color-mix(in srgb, var(--hue-blue) 18%, transparent);   color: color-mix(in srgb, var(--hue-blue) 80%, var(--text)); }

.chip--outline { background: transparent; border: 1px solid var(--line-strong); }

.count-bubble {
  border-radius: 50%;
  background: var(--pill-active-bg);
  color: var(--pill-active-fg);
}
```

狀態色 chip 用共用 hue（不因 mode 換色相），ztor mode 下這五種 tinted chip 顏色跟其他 mode 完全一樣——這是「語義色不因家族換色相」規則（見第 8 節）的直接體現。`.count-bubble` 在 ztor mode 下背景為純橘 `#ffa33f`、文字白。

### 7.6 Filter Tabs（`components/filter-tabs.css`）

```css
.ftabs { border-bottom: 1px solid var(--line); }
.ftabs__tab { color: var(--text-mid); border-bottom: 2px solid transparent; }
.ftabs__tab:hover { color: var(--text); }

/* 選中底線用 accent 的墨色版：Moverta 是淺底，純萊姆畫細線幾乎看不見 */
.ftabs__tab.is-active {
  color: var(--text);
  border-bottom-color: var(--accent-ink, var(--accent));
}

/* ---------- 膠囊變體 ---------- */
.ftabs--pill .ftabs__tab { background: var(--surface-2); border-radius: var(--r-pill); }
.ftabs--pill .ftabs__tab:hover { background: var(--glass-strong); }
.ftabs--pill .ftabs__tab.is-active {
  background: var(--pill-active-bg);
  color: var(--pill-active-fg);
}
```

ztor 選中底線用 `--accent-ink` = `#ffc178`（橘的亮版，不是純 `--accent`）。

### 7.7 Segmented（`components/segmented.css`）

```css
.seg { border-radius: var(--r-pill); background: var(--surface-2); }
.seg__btn { color: var(--text-mid); }
.seg__btn:hover { color: var(--text); }

.seg__btn.is-active {
  background: var(--pill-active-surface, var(--pill-active-bg));
  backdrop-filter: var(--pill-active-blur, none);
  -webkit-backdrop-filter: var(--pill-active-blur, none);
  color: var(--pill-active-fg);
  box-shadow: var(--pill-active-glow, var(--shadow-pop));
}

/* 強調色版：選中段吃家族強調色（Medical 萊姆）*/
.seg--accent .seg__btn.is-active {
  background: var(--accent-surface, var(--accent));
  color: var(--accent-fg, var(--pill-active-fg));
  box-shadow: var(--accent-glow, var(--shadow-pop));
}
```

ztor：`.seg__btn.is-active` 吃 `--pill-active-surface`（＝`--accent-surface` 漸層）＋`blur(16px) saturate(1.25)`＋`--pill-active-glow`。

### 7.8 Sidebar（`components/sidebar.css`）

```css
.sidebar {
  width: 232px;
  background: var(--surface);
  border-right: 1px solid var(--line);
}
.sidebar__item { color: var(--text-mid); border-radius: var(--r-pill); }
.sidebar__item:hover { background: var(--surface-2); color: var(--text); }

.sidebar__item.is-active {
  background: var(--pill-active-surface, var(--pill-active-bg));
  backdrop-filter: var(--pill-active-blur, none);
  -webkit-backdrop-filter: var(--pill-active-blur, none);
  color: var(--pill-active-fg);
  box-shadow: var(--pill-active-glow, none);
}

/* 子選單：縮排＋一條細線串起來，不畫框 */
.sidebar__sub {
  margin: 2px 0 var(--sp-2) calc(var(--sp-3) + 8px);
  padding-left: var(--sp-4);
  border-left: 1px solid var(--line);
}
.sidebar__subitem.is-active .sidebar__subitem-title {
  color: var(--accent-ink, var(--accent));
}
```

不透明（見第 2.2 節）。選中項在 ztor 下是漸層＋blur＋glow 的完整反白膠囊。

### 7.9 Topbar（`components/topbar.css`）

見第 2.3 節，已完整涵蓋（含 `--glass`／`--flush` 兩個 variant）。

### 7.10 Dropdown（`components/dropdown.css`）

```css
.dropdown {
  border: 1px solid var(--line-strong);
  border-radius: var(--r-inner);
  background: var(--popover);
  box-shadow: var(--shadow-pop);
}
.dropdown__item { color: var(--text-mid); }
.dropdown__item:hover { background: var(--surface-2); color: var(--text); }

.dropdown__item--danger { color: var(--danger); }
.dropdown__item--danger:hover {
  background: color-mix(in srgb, var(--danger) 14%, transparent);
  color: var(--danger);
}
```

實色浮層（見第 2.4 節）。

### 7.11 Overlay（`components/overlay.css`）

```css
.overlay {
  background: color-mix(in srgb, var(--bg) 65%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.dialog {
  border: 1px solid var(--line-strong);
  border-radius: var(--r-card-lg);
  background: var(--popover);
  box-shadow: var(--shadow-pop);
}
.dialog--danger .dialog__title { color: var(--danger); }
```

### 7.12 Toast（`components/toast.css`）

```css
.toast {
  border: 1px solid var(--line-strong);
  border-radius: var(--r-inner);
  background: var(--popover);
  box-shadow: var(--shadow-pop);
  color: var(--text);
}
.toast--ok .toast__icon { color: var(--ok); }
.toast--danger .toast__icon { color: var(--danger); }
.toast--warn .toast__icon { color: var(--warn); }
.toast--info .toast__icon { color: var(--info); }

.toast__action { color: var(--accent-ink, var(--accent)); }
```

### 7.13 Banner（`components/banner.css`）

```css
.banner { border: 1px solid transparent; border-radius: var(--r-inner); color: var(--text-mid); }

.banner--info {
  background: color-mix(in srgb, var(--info) 14%, transparent);
  border-color: color-mix(in srgb, var(--info) 26%, transparent);
  color: color-mix(in srgb, var(--info) 80%, var(--text));
}
.banner--warn {
  background: color-mix(in srgb, var(--warn) 14%, transparent);
  border-color: color-mix(in srgb, var(--warn) 26%, transparent);
  color: color-mix(in srgb, var(--warn) 85%, var(--text));
}
.banner--danger {
  background: color-mix(in srgb, var(--danger) 14%, transparent);
  border-color: color-mix(in srgb, var(--danger) 26%, transparent);
  color: color-mix(in srgb, var(--danger) 85%, var(--text));
}
.banner--ok {
  background: color-mix(in srgb, var(--ok) 14%, transparent);
  border-color: color-mix(in srgb, var(--ok) 26%, transparent);
  color: color-mix(in srgb, var(--ok) 85%, var(--text));
}
.banner--quiet { background: var(--surface-2); border-color: var(--line); color: var(--text-mid); }
```

染色配方與 chip.css 一致（狀態色低透明度鋪底），四種語氣皆用共用 hue，不受 ztor mode 影響。

### 7.14 Sticky Bar（`components/sticky-bar.css`）

```css
.sticky-bar {
  border: 1px solid var(--line);
  border-radius: var(--r-pill);
  background: var(--surface);
  backdrop-filter: blur(var(--blur-glass));
  -webkit-backdrop-filter: blur(var(--blur-glass));
  box-shadow: var(--shadow-card);
}
.sticky-bar--alert {
  border-color: color-mix(in srgb, var(--danger) 30%, var(--line));
}
.sticky-bar--alert .sticky-bar__status { color: color-mix(in srgb, var(--danger) 85%, var(--text)); }
```

注意：這裡 `background` 用 `--surface`（不透明底色）但**仍加了 `backdrop-filter: blur(24px)`**——跟第 2.5 節「不透明用 `--surface` 就不加 blur」的一般歸類不完全一致，是這個元件的特例（懸浮操作列本質上是貼在內容之上的膠囊，需要玻璃感，但 ztor 的 `--surface` 本身 alpha 已經是 0.84 接近不透明，blur 效果會較弱）。移植時建議保留這個 blur，不要因為套用「不透明不加 blur」的通則而拿掉。

### 7.15 Glass Card（第 2.1 節已完整涵蓋）

### 7.16 Icon Button（`components/icon-button.css`）

```css
.icon-btn {
  border-radius: 50%;
  background: var(--surface-2);
  color: var(--text);
}
.icon-btn:hover { background: var(--glass-strong); }

.icon-btn--solid { background: var(--pill-active-bg); color: var(--pill-active-fg); }
.icon-btn--dark { background: var(--surface); border: 1px solid var(--line); }
.icon-btn--accent { background: var(--accent); color: var(--accent-fg, var(--pill-active-fg)); }
.icon-btn--glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--blur-glass));
  -webkit-backdrop-filter: blur(var(--blur-glass));
  border: 1px solid var(--line);
}

/* 通知紅點數字 */
.icon-btn__badge {
  border-radius: var(--r-pill);
  background: var(--danger);
  color: var(--w-95);
}
```

`--accent` 版在 ztor 下是純色 `#ffa33f`（不是漸層——這裡直接用 `var(--accent)` 而非 `var(--accent-surface)`）。

### 7.17 Pill Nav（`components/pill-nav.css`）

```css
.pill {
  border-radius: var(--r-pill);
  color: var(--text-mid);
}
.pill:hover { color: var(--text); background: var(--surface-2); }

.pill.is-active {
  background: var(--pill-active-surface, var(--pill-active-bg));
  backdrop-filter: var(--pill-active-blur, none);
  -webkit-backdrop-filter: var(--pill-active-blur, none);
  color: var(--pill-active-fg);
  font-weight: var(--fw-med);
  box-shadow: var(--pill-active-glow, none);
}

.pill--accent.is-active {
  background: var(--accent-surface, var(--accent));
  color: var(--accent-fg, var(--pill-active-fg));
  box-shadow: var(--accent-glow, none);
}

.pill--ghost { background: var(--surface-2); color: var(--text); }
.pill--ghost:hover { background: var(--glass-strong); }
```

這是 ztorUI 的核心導航語彙——`.is-active` 在 ztor mode 下展開成跟 `.btn--primary` 完全同一套光學（漸層＋blur＋glow），因為 `--pill-active-surface`／`--pill-active-blur`／`--pill-active-glow` 在 ztor 覆寫裡直接等於 `--accent-surface`／`--accent-blur`（見第 1.5 節）。這也是移植時最值得注意的一點：**「選中態」跟「主要動作」在 ztor mode 下用了同一套視覺語言**（tokens.css 註解原話：「同色系的家族（ztor）會讓兩者長得一樣，異色系的家族則各走各的」）。

---

## 8 · 明文規則（從 `design-system.md` 逐條抽出）

### 8.1 Token 分層紀律

- Foundation（Pillar 1）：raw 值只准出現在本支柱（`components/tokens.css` 的 `:root`）
- Role（Pillar 2）：語義 token，一律 `var()` 指回 Foundation；Component 只准取 Role，不准碰 raw 值
- 語義色不因家族換色相（紅永遠是那個紅），家族個性只落在 `--accent` 與表面配方
- 裸 hex／rgba 存量屬設計判斷：`tokens.css` 是 raw 值唯一合法住所；`base.css` 的噪點 data-uri 與 `map-annotation.css` 檔頭註解為附帶命中，不再往下清（棘輪基準截至 2026-08-27 為 79 處，每新增一個 mode 會再往上一階，這是 Foundation 的職責所在，不是違規）

### 8.2 圓角規則

- 圓角只有五檔（10／16／20／24／30）加膠囊；出現其他值就是走樣
- **能是膠囊就是膠囊**；直角不存在於這套語言

### 8.3 玻璃三層規則

- 玻璃卡三層缺一不可：半透明底＋`backdrop-filter: blur(24–40px)`＋邊界光學（1px 邊線白 10–15%＋頂緣內光 `inset 0 1px 0 rgba(255,255,255,.15)`＋深投影 `0 24px 60px rgba(0,0,0,.45)`）
- 浮層實色律：玻璃只給貼著場景的表面；浮在其他表面上的層（下拉選單、對話框、toast、tooltip）一律吃 `--popover` 實色——玻璃疊玻璃會看穿兩層，資訊層級當場失效

### 8.4 數字排版規則（簽名）

- 整數段全亮、小數段與千位尾段降為 38% 白（`--num-dim`）、單位縮至 0.44em 同樣降暗
- 一頁一個 display 級數字群；其他數值退到 num-sm 以下——第二組出現就要降級

### 8.5 選中態規則

- active 一律「反白膠囊」（深色家族白底墨字；Moverta 墨底白字）；其餘選項是 70% 白純文字——沒有第三種選中語彙

### 8.6 狀態色與染色規則

- 狀態色只上小面積（點、chip、tick、線）；大面積染色僅限警示卡表面
- 表面染色警示：把玻璃底換成語義色 18–32% 透明，不改文字排版——用表面染色而不是紅字表達嚴重度

### 8.7 虛實線規則

- 虛線只用於暫態與範圍（圍欄、軌道、目標線、拖曳分隔），資料本身用實線

### 8.8 排版禁令

- 不用粗體撐層級（最重 500）
- 不用純黑底白字表格線框
- 不出現直角
- 家族之間不互借強調色（萊姆是 Medical/Moverta 的，紫是 Creator 的）——移植含義：ztor 的橘也不該被借去別的 mode 用

### 8.9 場景與浮層規則

- 深色家族的場景底（地圖／攝影／3D）永遠比面板暗，浮層才浮得起來
- 內容都浮在場景上；除 Moverta 外沒有「頁面捲動流」，是儀表板式的絕對定位構圖（**這條是原始五個截圖 mode 的觀察，ztor mode 作為 r2.2 skin 層不受此限——r2.2 本身是正常捲動的後台頁面**）

### 8.10 列表群組律

- 清單本身不裝進卡片：整組列平鋪在頁面上，列與列之間只有一條髮絲線；只有游標指著的那一列浮起來成卡片，同時把自己與前一列的分隔線收掉——「一次只有一列是物件，其餘是資料」

### 8.11 效能與密度規則

- `backdrop-filter` 層數多時很吃 GPU，實產品要限制同屏玻璃層數或預先烘焙背景模糊
- 背景底紋只做「一次性 paint、之後交給合成器」的技法，避開 `feTurbulence`＋`feDiffuseLighting` 浮雕光、逐點 `box-shadow`、`background-attachment: fixed`

### 8.12 Icon 規則

- 線性 icon：24 viewBox、stroke 1.6、round caps、`currentColor`，一律 inline SVG

### 8.13 Not observed／補全聲明（移植時要知道哪些是推測）

- 無 hover／focus／loading 任何互動狀態證據（靜態截圖）；復刻頁的 hover 是推測補全
- 無 light/dark 雙模式證據
- `--dur-fast: 160ms`／`--dur-med: 280ms`、`cubic-bezier(0.22,1,0.36,1)`、hover 浮起 3px 與 scale 1.07，皆為推測補全，非證據
- focus-visible 為復刻補全：截圖無任何鍵盤焦點證據，`base.css` 補了一條全域規則保障可及性
- hover／transition 只鋪在有明確互動語義的元件上，未全面補假想狀態——寧缺勿造

### 8.14 ztor mode 專屬裁決（非五個截圖 mode 共通，屬本次擴充的設計判斷）

- 橘底一律白字（2026-08-26 使用者裁決）；⚠ 對比不足 AA（78% 橘上約 2.4:1、實色橘上 1.9:1），深墨字版本 `--z-ink` 留在 palette 備用
- `--accent-surface` 半透明度 78% 是實測甜蜜點：90% 看起來仍是實心、68% 要把文字壓到近純黑才過 AA
- 選中態（`--pill-active-*`）刻意用純色而非漸層——因為 `--pill-active-bg` 也被 `--popover` 的 `color-mix` 取用，漸層在該用途會失效
- 中性色刻意偏暖（R 略高於 B）：主色是橘，中性灰若偏冷會被對比效應放大成藍調

---

## 9 · 移植時最容易做錯的三件事（給 CSS 覆寫層作者的提醒）

1. **只換色、不換層**：ztorUI 的「發光實心塊」是漸層＋`backdrop-filter` blur＋多層 `box-shadow`（含 inset）三件事疊加的結果，不是單純換一個 `background-color`。只搬 `--accent` 的 hex 值、不搬 `--accent-surface`／`--accent-blur`／`--accent-glow` 三支，會做出一個扁平橘色按鈕，不是原本的質感。
2. **選中態與主要動作要嘛真的同源、要嘛徹底分開**：ztor mode 讓 `--pill-active-*` 直接等於 `--accent-*`（同一套漸層），這是刻意判斷。移植時若 Creator Studio 的品牌橘只想用在「主要動作」、不想讓「你在這裡」的選中態也發光，必須自己拆開這兩組 token，不能照抄 ztor mode 的等價關係。
3. **彈出層別套用玻璃卡的配方**：`.glass` 系列的 blur＋半透明是給貼場景的卡用的；dropdown／dialog／toast／menu-panel 一律要吃 `--popover` 實色公式（`color-mix(in srgb, bg 88%, pill-active-bg 12%)`），這條在 tokens.css 註解裡明講是「r2.2 換皮 demo 驗證過的教訓」——照抄玻璃配方到彈出層上會導致玻璃疊玻璃、文字讀不清。

---

## 覆蓋範圍聲明

**已完整讀取**（含全文逐行）：
`design-system.md`（全 507 行）、`components/tokens.css`、`components/button.css`、`components/lamp-button.css`、`components/product-list.css`、`components/nest.css`、`components/backdrop.css`、`components/glass-card.css`、`components/switch.css`、`components/select.css`、`components/input.css`、`components/field.css`、`components/chip.css`、`components/filter-tabs.css`、`components/segmented.css`、`components/sidebar.css`、`components/topbar.css`、`components/dropdown.css`、`components/overlay.css`、`components/toast.css`、`components/banner.css`、`components/sticky-bar.css`、`components/icon-button.css`、`components/pill-nav.css`、`components/base.css`、`components/stat-numeral.css`。

**未讀取**（不在任務範圍內，或與 ztor mode 玻璃橘皮無直接關係，未涵蓋於本規格書）：
`components/ai-bar.css`、`components/alert-card.css`、`components/arrow-link.css`、`components/avatar.css`、`components/choice-card.css`、`components/def-list.css`、`components/drag-handle.css`、`components/list-item.css`、`components/list-toolbar.css`、`components/map-annotation.css`、`components/metric-card.css`、`components/mini-chart.css`、`components/orbit.css`、`components/pager.css`、`components/search-bar.css`、`components/segmented-gauge.css`、`components/table.css`、`components/timeline.css`、`components/tooltip.css`、`components/upload-tile.css`、`assets/fonts/fonts.css`、`pages/*.css`（五個家族的頁面級組合樣式，非 ztor mode）、`ASSUMPTIONS.md`、`sitemap.md`、`r22-bg/` 下兩份研究筆記。這批檔案要嘛是任務指定七個範圍之外的元件（`tooltip`／`avatar`／`table` 等有出現在 §7 清單但因「不用全抄，玻璃／邊框／主色／hover-active 完整」的驗收標準下，優先覆蓋了使用者明確列名的十七支元件；`tooltip.css` 因未列在使用者原始清單內故未讀），要嘛是頁面組合層或非 CSS 的研究文件，與「照抄到覆寫層」的規格書性質無關。若移植過程中發現 Creator Studio 有用到這批未讀元件對應的角色（例如 tooltip、table、avatar），建議另外追加讀取。

