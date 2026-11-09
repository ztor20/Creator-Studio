> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Login lang prompt

**Pattern** — 5.1.8 Modal shell 的實例（登入語言確認），見 [5-pattern.md](../ds-pillars/5-pattern.md)。

#### 總表紀錄（原 §4.1 · Login lang prompt）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[partials/login-lang-prompt.js](../partials/login-lang-prompt.js)

登入後詢問「登入畫面剛選的語言」是否要成為帳號預設語言（D225，2026-08-25）。**沿革（前身已退場、本輪語意改寫，非原樣復活）**：2026-08-24 曾有 ~~Lang mismatch dialog~~（D221 引入，`partials/lang-mismatch-dialog.js`），處理的是當時短暫存在的「顯示語言」與「預設語言」雙概念是否一致；D222 同日把語言收回單一概念（`window.ztorLang`）後，雙概念不復存在，該檔即刪除、掛載點與旗標寫入一併撤除。**本檔問的是完全不同的一件事**：站上只有一個語言值，比對的是「登入畫面剛選的語言」vs.「帳號已存的預設語言」，兩者出處都在同一次登入流程裡，只是沿用同一種 `.payout-modal` 殼與開關寫法（形似神不似，語意模型整個重寫，見下）。純 JS 元件 `partials/login-lang-prompt.js`，**無自帶 CSS**，殼固定用 `.payout-modal`／`.payout-dialog--narrow`（STYLE-DECISIONS Q27）。**狀態模型**：`login.html` 選語言只呼叫 `window.ztorLang.preview()`（新 API，只套用本頁顯示、不寫 localStorage、不廣播 `ztor:lang-changed`，見 `js/i18n.js`），**不再**直接 `set()` 覆寫帳號預設值；選擇同步記 sessionStorage `ztor-r22-login-lang-pick`。三條登入成功路徑（email／phone／第三方 OAuth）落地前寫一次性 sessionStorage 旗標 `ztor-r22-login-lang-pending`（`login.html` 的 `markJustLoggedIn()`）。掛了本檔的 shell 頁載入時：沒有 pending 旗標就完全零開銷；有 pending 但沒有 pick（使用者在登入畫面沒動過選擇器）→ 直接清旗標、不跳；有 pick 且等於帳號預設語言 → 清旗標、不跳；有 pick 且不同 → 先 `ztorLang.preview(pick)` 把畫面套成登入時選的語言，再開確認框，讓使用者看到的就是「剛選的」那個語言。兩顆按鈕：「Use {picked}」＝`ztorLang.set(pick)`（成為帳號預設語言，介面已經在該語言、維持不動）／「Keep {default}」＝`ztorLang.preview(default)`（帳號值不變，介面切回帳號預設語言）。**Esc／點遮罩等同「Keep {default}」**（呈現假設，見 ASSUMPTIONS.md）——未主動選「改用」就當作沒有要換帳號預設值。任一選擇（含 Esc／遮罩）都清掉兩把 sessionStorage 旗標，同一次登入只問一次，換頁／重整不再跳。i18n key 全新獨立 `loginlangprompt.*`（`title`／`body`／`use`／`keep`，`{picked}`/`{default}` 插值語言可讀名稱），**不沿用**已清除的 `langmismatch.*`。掛載點：`index.html`／`creators.html`（兩條登入落點）；`window.ztorLoginLangPrompt.show(picked, default)` 留給 demo 卡手動觸發、不走旗標。demo 卡見 `design-system.html` §4.131
