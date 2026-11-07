> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Source upload modal

#### 總表紀錄（原 §4.1 · Source upload modal）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[partials/source-upload-modal.js](../partials/source-upload-modal.js)

上傳外部平台匯出資料檔的彈窗（spec 5.1.7.8 F1／D165）：純 JS 模組 `partials/source-upload-modal.js`，**無自帶 CSS**，同樣重用 `.payout-modal`／`.payout-dialog` 殼。做成彈窗而不是就地展開：來源明細本身是一顆 popover（`.src-status__panel`），兩層浮層會互相蓋住，而上傳是一段有頭有尾的任務（Q27 裁決的「編輯／新增一筆資料」一律用 dialog 殼）。`openFor(platform)` 帶入平台決定標題與匯出路徑那一句（`sp`／`yt`／`ig`／`tt`；StreetVoice 不開放上傳故無分支）。文案刻意不寫死檔案格式與大小——那四件事仍是〔產品待確認〕（ASSUMPTIONS PG-026～028）。消費頁：`fan-analytics.html`。demo 卡見 `design-system.html` §4.123
