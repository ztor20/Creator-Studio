> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Drawer

#### 總表紀錄（原 §4.1 · Drawer）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[drawer.css](../ds-components/drawer.css)

右側滑出面板（`.drawer` 殼＋`.is-open` 開關 ＞ `__scrim`／`__panel` ＞ `__head`(`__title`/`__close`)／`__body`），用於不離開當前頁看詳情／歷史／說明；編輯或新增一筆資料一律用中央彈窗（`.payout-modal`／`.payout-dialog`），不用 drawer（2026-07-24，STYLE-DECISIONS Q27）；scrim/Esc/關閉鈕皆關，尊重減動效偏好。Token `--card`／`--border`／`--overlay-tint`／`--overlay-blur`／`--shadow-overlay`。Evidence／使用頁：earnings-sony（提領歷史／如何運作，由 `partials/finance-overview.js` 以 `data-drawer-*` 掛勾控制）。**2026-07-24 起 project-detail 不再使用 drawer**——該頁五個編輯／新增流程改用中央彈窗殼 `.payout-modal`／`.payout-dialog`（使用者裁示：編輯與新增一律走中央彈窗，不用側邊滑出） **變體 `--wide`（2026-09-22，D310）**：面板由 480 放寬到 880，給表格型抽屜用。**變體 `--full`（2026-09-23，B 反饋）**：面板鋪滿整個視窗（`width:100vw`，`border-left:0`），`__head`／`__body` 內距各放大一階，給「每格是一段文字」的大表用——先只改翻譯表（欄位 × 四語系，使用者：「翻譯表的 popup 要整頁，同時裡面的每一個欄位都要變大」）。2026-11-05（D514）價格表退場後只剩翻譯表使用 `--full`。**`--wide` 現況（2026-09-23）**：全庫 grep 零消費，CSS 規則保留不刪，列為**退場候選**、待使用者確認後才走墓碑，不要自行刪除
