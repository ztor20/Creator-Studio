> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Admin-layer nav · Tier 0/1

#### 總表紀錄（原 §4.1 · Admin-layer nav · Tier 0/1）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[shared.css](../shared.css) · [sidebar.js](../js/sidebar.js)

Platform-operator (Admin) variant of the topbar (spec §4.1 / D086): roster page shows a "Creator Management" marker + locked Tier-1 items (`.app-topbar__link--locked`); inside a creator workspace, a back-to-roster icon (`.app-topbar__back`) sits **before** the logo + "Managing &lt;creator&gt;" chip (`.app-topbar__context`). Active creator held in `window.ztorCreator` (localStorage `ztor.activeCreator`); switched via devtools "Creator · Admin" cheat code. Used by `creators.html` (Tier 0) and every Tier-1 page
