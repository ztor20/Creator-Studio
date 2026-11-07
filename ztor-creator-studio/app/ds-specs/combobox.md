> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Combobox

#### 總表紀錄（原 §4.1 · Combobox）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[combobox.css](../ds-components/combobox.css)

多選 search-to-add typeahead：重用 `.tag-input__field`（已選 `.chip--removable` ＋無框 entry）當欄位，欄位右側 `.combobox__chevron`（開啟時翻轉）指示可展開，focus／輸入時彈出 `.combobox__menu` 下拉建議（浮層配方同 `.dropdown__menu`：`--popover` 實色面＋1px `--ztu-glass-rim`＋`--shadow-float`，Q78；2026-09-16 起，舊值 `--card`／`--border`；`--sp-8` 間距浮於欄位下；`.combobox__group` 分組＋`.combobox__opt`＝icon＋名稱＋meta，`.combobox__empty` 空狀態），點選加入為 chip、已選項自建議移除。已選 chip 用中性灰（`--accent` 底，非 `.chip--active` 反白）。與 Tag input 差異＝建議改「focus 觸發浮層下拉」而非常駐 chip-group。首用：建立取貨場次 modal「加入取貨項目」（`partials/pickup-session-modal.js`，spec 5.1.5.12 §4 F2）。**新消費情境（2026-08-09）**：建立活動 `create-event.html` 的「票種」欄（選票種帶入門票）與「加入商品」欄（搜尋帶入 E-Shop 商品），選單與選項皆用 `.combobox`／`.combobox__menu`／`.combobox__opt`，取代原本頁內自造的一套下拉候選樣式；已加入的商品改用 Chip 的 `.chip-group` ＋ `.chip--removable`（見 Chip）。**2026-09-22（D299）**：商店設定優惠碼彈窗的「指定商品」多選改成 Phase 1／Phase 4 共用同一顆（坐在兩組版本閘門之外，顯隱由頁面 JS 算），候選三組——單售、組合包、**活動票種**（`ztorEvents.list()` 售票中／已排程／進行中的活動逐票種一筆，`__opt-name`「活動名 M/D · 票種名」、`__opt-meta` 價格）。**2026-09-30（D339）停用選項**：`.combobox__opt:disabled`＝列出但不可選（`not-allowed`、字與 icon 退成 `--muted-foreground`、無 hover 底，沿用 Q58／Q116 停用＝退到背景），尾端 `.combobox__opt-tag` 掛一顆 `.badge--neutral` 說明原因；首用：取貨場次彈窗中已綁定其他場次的商品（標「已綁定」）
