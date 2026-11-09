> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Work fields

**Pattern** — 5.1.6 Form assembly 的實例（影片上架欄位），見 [5-pattern.md](../ds-pillars/5-pattern.md)。

#### 總表紀錄（原 §4.1 · Work fields）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[partials/work-fields.js](../partials/work-fields.js)

影片作品欄位區塊（spec 5.1.2.2.1 F1–F15）：純 JS 元件 `partials/work-fields.js`，**建於 form-section／form-grid／field-system／card／upload-tile／chip／tag-input／segmented／switch／control-row／amount-field／entry-list 之上、無自帶 CSS**。把「一個欄位區塊長什麼樣」收成單一來源，兩個宿主頁只給空容器＋順序：`publish-work.html`（共創／預購成立後的事後上架，四步）與 `create-project.html`（直接發佈 × 影片家族的建立流程，五步，2026-08-10 整併）。區塊 kind：`file`（含上傳與處理狀態徽章）／`audio`／`subs`／`cover`／`stills`／`bts`／`trailer`／`copy`（標題與說明，D220 起單卡；語言維度 D223–D322 期間由發布前預覽確認層 `partials/publish-preview.js` 承接，2026-09-23 起兩個消費頁（`create-project.html` D322、`publish-work.html` D323）已改交給各自最後一步全頁畫面 `js/publish-stage.js`（`stageFields()`），舊模組不再是這兩頁語言維度的入口；`opts.lsField` 隨已退場的 Lang switch 一併撤除，publish-work.html 已不再傳）／`spec`（片長＋上映日期）／`genres`（21 值多選）／`tags`／`age`／`pricing`（是否付費＋幣種＋逐畫質四數值＋平台費揭露）／`credits`（九角色名單＋備註）。API `window.ZtorWorkFields.render(host, kind)`／`renderAll(host, kinds)`／`collect()`（收成送審內容）／`checks({stepOf, stepLabel})`（規格 §8 就緒檢查項）；chip 與開關這類沒有原生事件的互動統一補一顆 document 級 `workfields:change`。宿主頁在容器上寫 `data-wf="file,audio,subs"` 宣告要哪幾塊。為什麼是 JS 元件不是 HTML partial：每個區塊都會自己工作（字幕可增可刪、劇照填滿長下一格、語言組不准重複、幣種切換改所有金額符號）。**2026-08-10（D182）`genres` 與 `age` 兩塊的值域搬到 `js/work-taxonomy.js`**，本檔只負責畫外框與就緒檢查、不再自帶清單（見下一列）。**2026-08-11 新增第三個使用場合與 `fill()`**：作品上架後的編輯（spec 5.1.2.2 §2.2.11）走 `publish-work.html?mode=edit`，用 `fill(work, {coverSrc})` 把既有內容寫回欄位——每個區塊自己知道怎麼還原（函式掛在該區塊的 `<section>` 上），`fill()` 只負責找出畫面上有哪些區塊並逐一呼叫。demo 卡見 `design-system.html` §4.123
