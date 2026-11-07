> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Step list

#### 總表紀錄（原 §4.1 · Step list）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[step-list.css](../ds-components/step-list.css)

階段清單（2026-08-18，參考設計 Project status）：一串回答「走到第幾步」的列，**不是時間軸**——沒有日期欄、沒有今天、不能往回捲。`.step-list__row`［`--done`／`--current`／`--alert`／`--todo`］＞ 記號用 [Progress mark](./progress-mark.md)（與時間軸共用**同一顆**記號，不只是同一套規則）＋ `__body`（`__title` ＋ `__meta`，**同一行不換行**）＋ `__end`（靠右的標籤，逾期用）＋ `__act`（hover 才出現的動作，與 `__end` 共用右端那一格、互換）。列高 50px（14/12 內距，2026-08-18 使用者裁決加高一階：列太薄時滑鼠掃過去底色一閃即逝、hover 出現的按鈕來不及被看見）。掛 `--interactive` 的列 hover／focus-within 給一層 `--accent` 底（負 margin 讓底色比文字往兩側各長 12px，不然 hover 起來像文字被框住）。`--alert` 把整列一起上色（記號太小、只染記號會被略過）；`--todo` 整列 55% 不透明度。2026-08-18 撤除（墓碑）：`--current`——里程碑的「進行中」狀態由使用者裁決取消，這個修飾子沒有產生者了。消費頁：project-detail 總覽的進度摘要
