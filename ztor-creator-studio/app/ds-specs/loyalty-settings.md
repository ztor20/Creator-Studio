> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Loyalty settings

#### 總表紀錄（原 §4.1 · Loyalty settings）

- `_layer`：🟢 atom
- Status：✓ App
- CSS：[js/loyalty-settings.js](../js/loyalty-settings.js)

平台忠誠點數設定（spec 5.1.0.8 F9–F11）的已儲存值，原型的單一來源（2026-11-02，UI-CHANGES 四百六十、ASSUMPTIONS UIA-332）：純資料模組 `js/loyalty-settings.js`，**無自帶 CSS、不畫東西**。`admin-platform-loyalty.html` 按卡的「儲存」或切事件開關時寫進 localStorage 鍵 `ztor.loyaltySettings`（JSON `{ values, names, switches }`；values 以「data-ploy-label｜data-ploy-field」為鍵，只存跟預設不同的值），其他頁載入時讀。API `window.ztorLoyalty.get()`（生效值：`KA`／`gamma{a3,a4}`／`pts{b1,b4,b5,b3}`／`topPct[3]`／`sFloor`／`grace`／`dormancy`／`activeDays`／`riskDays`／`recentDays`／`names`／`switches`）、`DEFAULTS`、`raw()`、`save(raw)`、`reset()`、`tierName(tier)`、`inputKey(label, field)`；存檔與還原都發 `ztor:loyalty-changed`（跨分頁經 `storage` 事件轉發）。讀寫一律 try/catch，讀不到用預設。另註冊 `window.ztorI18nHook` 給 `js/i18n.js` 的 `t()`：分級名稱鍵（`fans.tier.*`、`tier-settings.tier.*`、`fg.tier.*`、`dash.fans.tier.*`、`msg.to.*.tag`、`fan-detail.tier.inner`）有自訂名稱就回自訂名稱（中英文同一個字），字串裡的 `[[token | 預設]]`（`floor`／`p1`–`p3`／`active`／`risk`／`recent`／`dormancy`／`tier.inner` 等）換成生效值，沒載模組的頁顯示預設。清除：平台設定「修改紀錄」卡底部的原型專用「還原預設」，或主控台 `localStorage.removeItem('ztor.loyaltySettings')`。consumer：寫入 `admin-platform-loyalty.html`；讀取 `fans-crm.html`、`fan-detail.html`、`media-vault.html`、`media-vault-popup.html`、`e-shop.html`、`fans-guide.html`、`tier-settings.html`、`design-system.html`（值域一覽）。值域一覽見 `design-system.html` §4.249
