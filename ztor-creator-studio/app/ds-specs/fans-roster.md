> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Fans roster

#### 總表紀錄（原 §4.1 · Fans roster）

- `_layer`：🟢 atom
- Status：✓ App
- CSS：[js/fans-roster.js](../js/fans-roster.js)

粉絲示範母體（名冊、KPI、粉絲詳情明細、分級人數的單一來源；2026-11-02 D497 建立、同日 UI-CHANGES 四百六十 擴成完整母體）：純資料模組 `js/fans-roster.js`，**無自帶 CSS**。1,340 位固定種子生成（名冊原 9 位示範粉絲保留原點數與身分），每位一份 P0 點數明細；點數＝明細淨額、quietDays＝最近一筆有效動作距示範「今天」（2026-11-02）的天數、近 N 天營收＝明細裡 A3／A4 金額。再依 `js/loyalty-settings.js` 的前 % 名（名額捨去、核心圈至少 1 人，D476）、S_floor（D497 判定順序）、KPI 視窗算名次、分級、活躍、狀態（流失風險／已挽回〔推導〕）。API `window.ztorFans.list`／`get(id)`／`ledger(id)`／`progress(fan, points)`／`status(fan)`／`summary(over)`／`tierMin(tier)`／`settings()`／`daysAgo(t)`、getter `S_FLOOR`／`RISK_DAYS`／`ACTIVE_DAYS`／`RECENT_DAYS`。明細點數照入帳當時（規格預設）的 K_A、γ、發分值算，改設定不回算（5.1.0.8 F6）。`js/tier-population.js`（`window.ztorTierPopulation`）由它算各級**活躍**人數給媒體庫與電子商店（5.1.7 F3），沒載它時退回 13／115／257／898。consumer：`fans-crm.html`、`fan-detail.html`；經 tier-population：`media-vault.html`、`media-vault-popup.html`、`e-shop.html`。載入順序 loyalty-settings → fans-roster → tier-population。值域一覽見 `design-system.html` §4.250
