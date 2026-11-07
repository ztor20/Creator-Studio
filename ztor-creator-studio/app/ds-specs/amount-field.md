> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Amount field

#### 總表紀錄（原 §4.1 · Amount field）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[amount-field.css](../ds-components/amount-field.css)

money input with a unit affix — normally a static read-only symbol (`$` prefix); built on Input. The affix can also be an interactive unit toggle (`[data-price-sync]` marks a shared-unit member and fixes the affix to a 46px centered column; `[data-amount-unit]` is the click hook on the affix `<button>` that page JS uses to switch the unit across the group); that toggle shipped for the cash/POPCORN pricing unit, **removed in spec 5.1.5.2 · D144** (was D127), so no page uses it today — the chrome is kept as a reusable capability。**Suffix mode**（2026-07-11）：`.amount-field--suffix` 把 `__unit` 移到右側（如 `50 [%]`、`6 [mo]`），搭 `--readonly` 給靜態非互動後綴（register-ip.html 版稅 % / 最短租期、bundle-detail.html 折扣 %）；input 內距改讓右邊。**Hero size**：`.amount-field--hero` 是彈窗主角級大尺寸（70px 高／32px display 字），視覺基準原 `payout-modal.css` 的 `.payout-amount-wrap`／`.payout-amount-prefix`／`.input.payout-amount-input`；2026-07-11 起 `partials/payout-request-modal.js` 已改用本變體，`payout-modal.css` 的舊規則已移除（留 tombstone 註解指回本檔）；`height:70px`／`padding-left:42px` 無對應 `--sp-N` 級距，記錄為 token 例外，其餘值皆走 token（`--fs-28`/`--fs-32`/`--sp-16`）。**Currency code**（2026-08-06）：`.amount-field--code` 把輸入框左內距由 40px 加寬到 62px，給三個字母的幣別代碼（NTD／HKD）用——代碼剛好填滿 `--readonly` 的 40px 內距，數字會貼著代碼起排，加寬一個字距才分得開；搭 `--readonly` 使用（幣別代碼不是可切換的單位）。代碼字串**不寫死在元件也不寫死在消費頁**，由消費頁在執行期取自該頁本來就在顯示的幣別（首個消費者：`earnings-sony.html` 捐贈彈窗，取自可提領金額那一格 `[data-fin-kpi="available"]`）。**2026-10-15**：`.amount-field__input[type=number]` 自己關掉瀏覽器原生的上下調整鈕（全站那條在 `stepper.css`，只在載入它的頁生效；沒載入的頁調整鈕吃掉約 15px、窄欄票價被裁字）
