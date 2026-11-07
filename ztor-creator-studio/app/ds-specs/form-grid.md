> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Form grid

#### 總表紀錄（原 §4.1 · Form grid）

- `_layer`：🟢 atom
- Status：✓ Project
- CSS：[form-grid.css](../ds-components/form-grid.css)

2- / 3-column field layout helper **2026-10-15**：欄軌改 `minmax(0, 1fr)`（`1fr` 的 min-content 下限讓下拉複選觸發鈕把右欄撐出卡外，375px 建立活動第 2 步實測溢出 33px）；≤480px 時兩欄版（不含 `--3`）改一欄直排。 **`.form-grid__full`（2026-10-27）**：佔滿整列的格（`grid-column: 1 / -1`），橫跨兩欄的欄位放進格子裡、列距由格線發。
