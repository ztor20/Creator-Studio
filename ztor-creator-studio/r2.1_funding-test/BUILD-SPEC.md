# BUILD-SPEC — 募資創建測試版

此原型的呈現與工程快照。產品規則見本資料夾 `0-設計規格書.md`／`5.1.1-募資計畫創建流程.md`；本檔只記呈現與實作決策。

## 範圍

- 單檔原型 [create-campaign.html](create-campaign.html)（Structure 1）。
- 3 步精靈（基本資料／金額與股權／套組）＋全程即時預覽＋就緒檢查，對齊 r2.1 建立流程的 wizard 樣式。
- **獨立頁** `funding-simulate.html`「前台認購試算」（demo 專用、正式版不出現）：創建 3 步完成後按**創建送出**進入；create-campaign 以 `sessionStorage('fc-sim')` 傳 `{goal,totalShares,equity,bundles}`，本頁讀取重建（直接開啟則用種子示範）。互動模擬共用股份池認購，公式 `min(名額−已售, ⌊剩餘股數÷份數⌋)`；頁尾「上一步」回創建、「關閉」正式版回專案列表（獨立版回創建起點）。不屬產品規格。

## Design system

- **共用 r2.1 的 DS，相對引用、不複製**：所有 `ds-components/*.css`、`shared.css`、`fonts.css`、`js/*`、`partials/wizard-chrome.js` 皆以 `../r2.1/...?v=20260630c` 引用。資產版本字串與 r2.1 同步，確保單一來源。
- **未新增任何 ds-component、未改 r2.1 的 `design-system.html`／`ds-components/`**（使用者指示：共用 r2.1、不改原本）。

## 沿用的 r2.1 元件／能力

- Wizard chrome（`wizard-chrome.js`）：儲存狀態、Save as draft、返回離開確認彈窗。
- `progress-stepper`、`form-section`、`form-grid`、`control-row`、`input`/`select`/`textarea`（shared.css）、`upload-tile`、`card`、`button`、`alert`、`data-list`。
- header stepper 響應式：本頁覆寫 `.wizard__top-bar`／`.progress-stepper__label` 於 1120px、880px 兩斷點（880px 起只留當前步標籤）；僅作用於本頁，不動 r2.1。
- 即時預覽：`preview-column`＋`preview-card`（r2.1 §5.2.5 模式）。
- 就緒檢查：`readiness` 清單，置於底部 chip 的 hover/focus tooltip（沿用 create-product 的呈現）。
- icons（`icons.js`）：chevron-left、image、shield-check、check、circle、x、plus。

## 頁面專屬樣式（留在本頁 `<style>`，未 promote）

理由：測試版、且共用 r2.1 DS 不得改原本；下列多為一次性版面或已在 r2.1 以 inline 形式存在的模式（如 ready-chip 在 create-product 也是 inline）。

- `.fc-calc` / `.fc-calc__val`：每股金額／每股股權的唯讀數值卡（用品牌橘 `var(--primary)` 強調）。
- `.fc-bundle` / `.fc-item-row`：套組卡與套組商品列版面。
- `.fc-add` / `.fc-add-item`：加高、滿版、置中的「新增套組／新增商品」按鈕。
- `.fc-cc-*`：添加共創者（搜尋框＋結果下拉＋已添加 chips）；mock 用戶清單，email 非既有用戶顯示「邀請中」。
- `.fc-sim-*`：前台試算 demo 的共用池與認購列（在獨立頁 `funding-simulate.html`）。
- `.fc-pv-bundle`：即時預覽欄內的數值與套組摘要列。
- `.cp-ready-chip` / `.cp-ready-pop`：就緒 chip ＋ tooltip（複製自 r2.1 create-product 的 inline 樣式）。

> 若日後此測試版扶正進 r2.1，`.fc-calc`、`.fc-bundle`、`.fc-item-row` 應 promote 成 ds-components 並補 `design-system.html` demo。

## 互動與工程決策

- **即時換算**：每股金額＝目標 ÷ 總股數；每股股權＝回饋股權% ÷ 總股數；輸入即重算並同步即時預覽（`wizard__body` 的 input/change 事件）。
- **步驟控制**：本頁 inline JS（FLOW 三步、stepper 重建、panel show/hide），比照 create-project 的控制器，去掉類型分支。
- **語言**：雙語（中文預設，可切英文）。`data-fi` 字典含 zh/en；`fiText` 依 `document.documentElement.lang` 取值；header「中/EN」鈕呼叫 r2.1 `window.toggleLang`，`i18n:applied` 時重套頁面內容。預設中文（localStorage 未設時設 zh-Hant；已切換過則沿用）。
- **黑夜配色**：由 `r2.1/shared.css` 提供（2026-06-30 升進 DS 的 create-flow 標準：content/header #191A1A、canvas/footer #2B2B2C）；本頁不自行覆寫。
- **結算幣別已移除**：原型金額固定 USD（`calc()` 內常數）。
- **存草稿**：mock，按下僅彈提示、不寫入（對齊規格「原型階段 no-op」）。
- **深連結**：`?step=basics|money|bundles` 可直接開到該步，方便檢視與截圖。
- 截圖存 `screenshots/`（01 基本資料／02 金額與股權／03 套組）。

## 驗證

- http（localhost）開啟，三步皆正常渲染、即時預覽與就緒檢查即時更新。
- 26 個引用資產全部 200，無 404。
- 本頁 inline CSS 無裸 hex／rgb（只用 tokens）。
- 無 JS console error。
- 用到的 icon 名稱全部存在於 r2.1 `icons.js`。
