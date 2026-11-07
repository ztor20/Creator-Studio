> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### App shell

#### 總表紀錄（原 §4.1 · App shell）

- `_layer`：🟠 organism
- Status：✓ Project
- CSS：[shared.css](../shared.css) **側欄收合態下點有子項目的母項目（2026-09-01）**：先展開側欄、再打開那一組，強制展開不照 toggle 語意——收合態的子選單被 CSS 藏著，只翻 `data-state` 看起來像沒反應，而本來就 open 的那一組會在同一下被收掉。底部 actions 的帳號／幣別群組不適用（它們有自己的浮出選單）。

Global page frame: `.app` + `.main` + `.page`（`.page` max-width 1280px）. Sidebar mode makes `.main` one continuous `--surface-page` sheet on `--surface-shell`, with a 16px top gap and 28px top-left corner。**窄版變體 `.page--narrow`（1056px，2026-07-20 Q21）**：只給 Detail rail（§4.52）的兩欄詳情頁——右欄固定 300px，容器留在 1280 會讓左欄行長過長；其餘頁面維持 1280。Q21 原裁全站收窄，同日改為僅變體套用。Consumer：product-detail.html、order-detail.html、bundle-detail.html、auction-detail.html **側欄選中項的光暈 2026-09-01 不再被裁掉**（使用者回報「光暈被切掉了」）：`.app-sidebar > nav` 為了在極矮視窗下讓步而帶著 `overflow-y: auto`，而 `overflow` 只要有一軸不是 visible，另一軸也會跟著變成裁切軸——這一層的內容框於是就是裁切線，選中項那圈往外暈開的橘色 box-shadow 剛好被裁在項目的邊上、變成一個硬邊方框。做法是左右各吃側欄自己的內距（14px）再用等量負外距抵銷：內容位置一格沒動，光暈從此暈在側欄自己的寬度裡。
