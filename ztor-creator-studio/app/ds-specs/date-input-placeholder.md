> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Date input placeholder

#### 總表紀錄（原 §4.1 · Date input placeholder）

- `_layer`：🔵 atom
- Status：✓ Project
- CSS：[date-input.css](../ds-components/date-input.css)

原生 `<input type="date | datetime-local | time">` 的 placeholder 裝飾層（2026-07-21）：原生欄位不吃 `placeholder`、空值時自己畫「年/月/日 --:--」且用一般內文色，看起來像已填值。`[data-empty="true"]`＝日曆 icon（`--sp-12`）＋淡灰「選擇日期」（`--sp-40`、`--muted-foreground`），原生 `::-webkit-datetime-edit` 藏起來、input 內距推到 `--sp-40`；`[data-empty="false"]`＝icon 與 placeholder 都收掉、內距回基礎 `--sp-12`、日期用 `--foreground`（常駐 icon 會吃掉 28px，設定頁 120px 的窄時間欄會被切字）。date／datetime-local／time 三型共用同一句文案 `field.pick-date`（使用者 2026-07-21 裁示）。**2026-08-06 新增選配的自訂文案**：欄位掛 `data-ph-key`（字典 key）或 `data-ph`（直接給字）就換一組，不掛維持「選擇日期」，既有約 40 處不受影響；首個消費者＝建立活動售票規則的起訖兩格（「開始」「結束」）——兩格並排時各自說自己是哪一端，比重複寫同一句有用。原生日曆鈕攤平成整格透明覆蓋層，點整格用 `showPicker()` 開選單。由 [partials/date-input.js](../partials/date-input.js) 執行期自動包裝全站約 40 個欄位（含 MutationObserver 接住 modal 這類後注入的節點），頁面 markup 維持乾淨的 `.input`，不得手寫 `.date-input` 外層 **依 type 分型（2026-08-13 修，取代上句「三型共用同一句文案」）**：圖示與文案跟著 `input` 的 type 走——`date`＝日曆／選擇日期、`time`＝**時鐘／選擇時間**、`datetime-local`＝日曆／選擇日期時間（新增 `field.pick-time`／`field.pick-datetime` 兩個 key）。此前三型一律日曆＋「選擇日期」，於是只填時間的欄位上寫著「選擇日期」、旁邊還畫一個日曆（使用者圈出建立活動的開放入場那一格）。欄位自己掛 `data-ph-key`／`data-ph` 時仍然優先。
