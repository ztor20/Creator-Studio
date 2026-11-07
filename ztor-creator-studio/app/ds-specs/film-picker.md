> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Film picker

#### 總表紀錄（原 §4.1 · Film picker）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[partials/film-picker.js](../partials/film-picker.js)

電影關聯可搜尋多選（spec 5.1.5.2 §4.5 F12／5.1.5.1 §2.14／D140）：純 JS 元件 `partials/film-picker.js`，**建於 tag-input＋chip 之上、無自帶 CSS**——搜尋輸入格（`.tag-input__entry` type=search）過濾候選、建議 `.chip-group` 點選加入、已選 `.chip--active.chip--removable` 移除；候選來自 `window.ztorFilms`（films-store）。API `window.ZTOR_PARTIALS.createFilmPicker(host,{selected,onChange,readonly})`→`{getSelected(), setReadonly(bool), isReadonly()}`。consumer：create-product.html（§4.5 獨立區）、product-detail.html（關聯分頁）、**create-bundle.html／bundle-detail.html（關聯分頁；2026-09-11 使用者指示組合也要有電影關聯）**。候選為 mock（UIA-053）、可搜尋（BR-NEW-1）。**2026-09-18（D288）唯讀模式**：`readonly:true` 或事後 `setReadonly(true)` → host 標 `data-readonly`、搜尋格與建議列收起、已選 chip 拿掉 ×（`.chip--active` 不帶 `--removable`），元件層自己拒絕加入／移除；封存的細節頁（product-detail／bundle-detail）用它把「關聯」分頁收成唯讀，封存 ↔ 解除封存可來回切。demo 卡見 `design-system.html` §4.125
