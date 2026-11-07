> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Export dialog

#### 總表紀錄（原 §4.1 · Export dialog）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[export-dialog.css](../ds-components/export-dialog.css)

匯出視窗的 body 兩塊（2026-10-28，UI-CHANGES 三百七十七）：`.export-summary`（`__count`／`__num`／`__unit`／`__filters`，這次匯出什麼）＋ `.export-history`（`__head`／`__title`／`__sub`／`__more`，這個範圍的匯出紀錄，列用 `.data-list__row`）。外殼是 canonical `.payout-modal`／`.payout-dialog`；組裝規則見 §5.1.12 Export confirm。消費：`js/csv-export.js` 的 `ztorCsv.confirm()`（訂單管理、活動詳情交易明細）。
