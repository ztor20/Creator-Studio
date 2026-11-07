> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Content block injector

#### 總表紀錄（原 §4.1 · Content block injector）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[js/components.js](../js/components.js)

儀表板與收入管理反覆出現的區塊，由同一支渲染器產生：`js/components.js`，**無自帶 CSS**——每支渲染器吐出的都是既有元件（`data-list`／`table`／`kpi`／`alert`／`card`／`bento`）。機制與 `sidebar.js` 相同：頁面放 `<div data-component="NAME" data-key="KEY">` 佔位，載入時由共用渲染器填好，再對新節點重跑 icons／i18n。為什麼要有：這個靜態原型沒有建置步驟，這是唯一能讓區塊真的「改一次、每頁同步」的做法——交易列格式兩頁共用、不會再分岔，各頁仍給自己的資料列。渲染器：`transaction-list`（`table:true` 與 data-list 兩種輸出）／`ops-summary`／`alerts`／`activity-list`／`events-projects`／`ext-data-status`／`insight-split`；資料集住同一支檔案的 `DATA`。API `window.ZtorComponents.mount(root)`／`RENDERERS`／`DATA`。載入順序：晚於 `icons.js`／`i18n.js`、早於 `reveal.js`。消費頁：`index.html`、`earnings.html`、`earnings-overview.html`、`earnings-ztor.html`、`audience-report.html`。demo 卡見 `design-system.html` §4.123
