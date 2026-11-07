> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Work taxonomy

#### 總表紀錄（原 §4.1 · Work taxonomy）

- `_layer`：🟢 atom
- Status：✓ App
- CSS：[js/work-taxonomy.js](../js/work-taxonomy.js)

題材（分類）與年齡分級的值域單一來源（主規格 §7.1.2 題材軸 21 值、§7.11 年齡分級六級，D182）：純 JS 元件 `js/work-taxonomy.js`，**無自帶 CSS**，畫面用既有的 `chip`（多選）與 `input.css` 的 `.select`（單選）。為什麼要獨立一支：這兩個值域各有三個落點（題材＝作品上架 F11、建立項目影視組 F4；年齡＝上架 F13、建立項目影視組 F4、項目公開資訊 §2.2.8），規格明講三處是同一份資料，實作也只能有一份清單——2026-08-10 前 `project-detail.html` 自己寫了一組 `PG-13／G／PG／R／NC-17`，同一部片在三個畫面可以顯示三個不同的分級。API `window.ZtorWorkTaxonomy.GENRES`／`AGES`／`genreKey(g)`／`ageOptionsHtml(selected)`／`genreChipsHtml(attr)`／`hydrate(root)`。宿主頁只留空殼：`<select data-taxonomy-age>` 與 `<div class="chip-group" data-taxonomy-genres>`，載入時就地填好、chip 開關走 document 委派，頁面不必寫 JS。載入順序要排在 `partials/work-fields.js` 之前（後者吃它的 `AGES` 與 `genreChipsHtml`），也要排在 `js/zselect.js` 之前（選項要先在，`<select>` 才升級得對）。消費頁：`publish-work.html`、`create-project.html`（影視組類型相關欄位＋影片路徑作品欄位）、`project-detail.html`（公開資訊年齡分級）。沒有載 `js/i18n.js` 的頁面（例如 `design-system.html`）吃內建英文退路，不會顯示成字典鍵。值域一覽見 `design-system.html` §4.123
