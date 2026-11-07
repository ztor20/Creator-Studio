> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Field more

#### 總表紀錄（原 §4.1 · Field more）

- `_layer`：🟡 molecule
- Status：✓ Project
- CSS：[field-more.css](../ds-components/field-more.css)

把一組欄位裡的次要欄位收在「顯示更多」按鈕後（2026-07-21）：`.field-more` > `.btn.btn--outline.field-more__toggle`（**2026-07-21 使用者裁示改滿寬線框鈕**，原為靠左無框文字鈕；外觀重用 Button atom，本元件只擁有 `width:100%` ＋ `justify-content:center`，不自刻邊框/hover）。`margin-bottom: --sp-16` 吃 `.field` 同一套表單節奏、`:last-child` 歸零免留尾巴（2026-07-21：改滿寬鈕後才浮現——原本只有上方靠前一個 `.field` 的下外距撐開、自己沒有下外距，後面元素會貼上來）（chevron ＋ `field.show-more`／`field.show-less` 文案）＋ `.field-more__body[hidden]`。**收合區內任一欄位已有值就自動展開**——建立商品是空表單、收起來合理；商品明細是編輯頁、欄位帶真實資料，藏起來等於藏使用者填過的東西。這個判斷是用 JS（[partials/field-more.js](../partials/field-more.js)）而非 `<details>` 的原因，兩頁因此能共用同一段 markup。首次用於建立商品／商品明細的取貨方式 ▸ 物流配送（只留「重量」在外，出貨分類／尺寸／寄件地收起來）；**商品明細已於 2026-07-22 依使用者裁決把物流欄位全部展開、不再有 `.field-more`**，「有值就自動展開」目前沒有活的消費頁，保留是因為建立商品同時當編輯頁用。收在裡面的必填欄仍保留 `*` 標記。**2026-08-06 新增選配的自訂按鈕文案**：在 `.field-more` 掛 `data-more-key`／`data-more-text`／`data-less-key`／`data-less-text` 即可換一組講法（建立活動的場地用「進階／收合」），不掛就維持預設的「顯示更多／收合」，既有消費頁不受影響。第二個消費頁：`create-event.html` 場地 ▸ 集合地點與交通
