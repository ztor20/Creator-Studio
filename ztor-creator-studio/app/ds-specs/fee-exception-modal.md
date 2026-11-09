> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Fee exception modal

**Pattern** — 5.1.8 彈窗類型 的實例（費率例外），見 [5-pattern.md](../ds-pillars/5-pattern.md)。

#### 總表紀錄（原 §4.1 · Fee exception modal）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[partials/fee-exception-modal.js](../partials/fee-exception-modal.js)

逐 Creator 覆寫平台費率的彈窗（spec 5.1.0.3 F3／D141）：純 JS 模組 `partials/fee-exception-modal.js`，**無自帶 CSS**，殼同上。一個殼兩種模式：add 顯示 Creator 搜尋（`[data-fx-creator-field]`）、edit 固定 Creator 並藏起搜尋；平台費樹由宿主頁 clone 自己的 `#fee-tree` 注入 `[data-fx-tree]`，支付手續費一律唯讀（全站統一、不逐 Creator）。消費頁：`admin-platform-fees.html`。demo 卡見 `design-system.html` §4.123
