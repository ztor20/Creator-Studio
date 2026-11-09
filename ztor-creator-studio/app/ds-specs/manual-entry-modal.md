> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Manual entry modal

**Pattern** — 5.1.8 Modal shell 的實例（補登收入），見 [5-pattern.md](../ds-pillars/5-pattern.md)。

#### 總表紀錄（原 §4.1 · Manual entry modal）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[partials/manual-entry-modal.js](../partials/manual-entry-modal.js)

補登站外收入的彈窗（spec 5.1.8.2 · Earnings F10）：純 JS 模組 `partials/manual-entry-modal.js`，**無自帶 CSS**——重用唯一的 canonical dialog 殼（`payout-modal.css` 的 `.payout-modal`／`.payout-dialog`）與共用表單 helper（Pattern 5.1「Modal shell」）。它給的是 markup 而不是行為：`window.ZTOR_PARTIALS.manualEntryModal` ＝完整彈窗的模板字串，宿主頁注入後自己接開關與送出；介面文案走 `data-i18n`、示意值寫在模板裡。為什麼要收成模組：同一個彈窗有三個收入頁要開，各寫一份就會分岔。消費頁：`earnings.html`、`earnings-overview.html`、`earnings-ztor.html`。demo 卡見 `design-system.html` §4.123
