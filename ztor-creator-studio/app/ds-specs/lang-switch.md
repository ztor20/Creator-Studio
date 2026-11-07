> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Lang switch

#### 總表紀錄（原 §4.1 · ~~Lang switch~~）

- `_layer`：—
- Status：**已退場 2026-08-24（D223）**
- CSS：（已刪除）

頁級「內容檢視語言」切換（D220，2026-08-24 引入，掛在表單頂部、邊填邊切語系）。D223 同日裁示把翻譯檢視挪到「按下發布之後、真正送出之前」，改由新元件 Publish preview 接手（見下一列），這顆頁頂分頁不復存在。`partials/lang-switch.js` 已刪除（無自帶 CSS，直接刪除而非留 tombstone 檔）；四個消費頁（create-product／create-event／create-project／publish-work）已卸載 `<script>` 與對應的 `data-ls-field` 標記；`design-system.html` 的展示用消費點（曾是第 5 個 `<script>` 掛載）已一併移除。`sessionStorage` key `ztor-r22-content-lang` 只有該檔自己讀寫，刪檔即退場，未留殘值需遷移。i18n key `ls.*` 已改名遷移進 `pp.*`（`ls.default-badge`→`pp.default-badge` 沿用同一份文案；`ls.tabs.label`／`ls.banner` 改寫成新元件的 `pp.tabs-label`／`pp.banner`）
