> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Edge shadow（工具）

#### 總表紀錄（原 §4.1 · Edge shadow（工具））

- `_layer`：⚪ utility
- Status：✓ Project
- CSS：[shared.css](../shared.css)

`.edge-shadow`：把 `--shadow-header` 變成「只露下緣、內縮、兩端漸淡」的邊緣陰影（`::before`＋clip）。電子商店庫存條使用（wizard header 2026-09-23 改膠囊後退出）；其他元素加 class 即覆用
