> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Stack

#### 總表紀錄（原 §4.1 · Stack）

- `_layer`：⚪ utility
- Status：✓ Project
- CSS：[stack.css](../ds-components/stack.css)

**區塊之間垂直間距的唯一規則（2026-08-11 使用者指示）**：間距由容器承擔（`gap`），子元素不各自加 margin。此前站上沒有這條共同規則，每頁各自用 `.mt-16`／inline margin／自己的 `gap` 解，於是有的地方黏在一起、有的地方鬆掉——同一個角色三種答案（發現點：商店設定「銷售預設」分區的兩張卡直接相黏）。子元素加 margin 另有兩個壞處：第一個／最後一個要特判；條件隱藏的區塊會把 margin 留在原地，`gap` 不會。`.stack`（`--stack-gap`，預設 `--sp-18`）／`.stack--tight`（12，同一件事的小塊）／`.stack--loose`（24，語意分家的大段落）／`.stack--bento`（16，放進 bento 一欄時對齊 bento 自己的 gap——否則同一個網格上「左右 16、上下 18」，讀起來像對不準的兩套節奏）；個案覆寫寫在容器的 `--stack-gap`，不改子元素。`.settings-section` 內建同一套（settings.css），設定分區放兩張以上的卡不必再補間距。**不適用**：橫向排列（那是 flex-row／grid）、表單欄位之間（`.field` 的 16px 節奏，Q6 已裁決，不疊第二套）
