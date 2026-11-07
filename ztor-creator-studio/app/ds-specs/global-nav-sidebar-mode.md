> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Global nav · sidebar mode

#### 總表紀錄（原 §4.1 · Global nav · sidebar mode）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[shared.css](../shared.css) · [sidebar.js](../js/sidebar.js)

Display-mode alternative to the topbar (spec §6.9 / D016): 248px left rail (`.app-sidebar`, same `sidebar.js`) sits on `--surface-shell`; dropdowns → expandable groups（`.app-sidebar__group`，accordion，現役）。另保留 **section-label 變體**（`.app-sidebar__section-label` ＋子項平鋪）可切回。Driven by `data-nav-mode` (theme.js)。**D221（2026-08-24）新增、D222（同日）簡化、D223（同日）收合列再簡化**：帳戶子選單有一列可展開的語言列（`.app-sidebar__sub-link--lang-toggle`/`--lang`），刻意不用 `.app-sidebar__group` class（避免巢狀 accordion 互相干擾），改由 `js/sidebar.js` 的 `refreshLangRows()` 監聽 `ztor:lang-changed` 就地 patch，不整段 remount。D221 曾在此列另掛「預設」徽章與「去設定改預設語言」提示行，D222 語言收回單一概念後撤除；D223 再拿掉收合列的「預設語言」前置 label 與兩行 title/sub 結構，改成只顯示目前語言名稱＋chevron，縮排字級對齊 Profile／Settings／Payments 純文字列，並補 `aria-label`（`settings.lang.toggle-label`）維持螢幕報讀語意
