# UI-CHANGES — 募資創建測試版

分類：A 依規格建置／B 呈現反饋／C 撤除／D infra。

## 2026-06-30

- **A** 建立測試版原型 [create-campaign.html](create-campaign.html)，依 `5.1.1-募資計畫創建流程.md`：3 步精靈（基本資料／金額與股權／套組）＋全程即時預覽＋就緒檢查。共用 r2.1 DS（`../r2.1/...` 相對引用，不複製、不改原本）。
- **A** 金額與股權即時換算：每股金額＝目標÷總股數、每股股權＝回饋股權%÷總股數；同步即時預覽。
- **A** 套組支援多個，每個套組可含多件「套組商品（照片＋描述）」。
- **D** 本頁內容用 `data-fi` 字典，避免改 r2.1 共用 `i18n.js`。
- **D** 深連結 `?step=basics|money|bundles` 供檢視／截圖。
- 截圖：`screenshots/01-step0-basics.png`、`02-step1-money.png`、`03-step2-bundles.png`。

## 2026-06-30（修訂，依使用者反饋）

- **B** 移除 header 的「中/EN」語言切換鈕（不屬 wizard header 元件、規格書亦未要求）；header 回到照 r2.1 wizard 元件。
- **B** header 副標改為純文字「共創募資計畫 · 草稿」（照元件，移除原 badge 寫法）。
- **B** 頁面固定中文（`lang=zh-Hant`，不寫入 localStorage）。
- **B** 內容欄加寬 `max-width` 1000 → 1240px。

## 2026-06-30（第七輪：DS 升級＋版面重排＋雙語修復）

- **D（DS 修正，影響 r2.1）** 黑夜 wizard 配色升進 `r2.1/shared.css` 為 create-flow 標準（content/header＝#191A1A、canvas/footer＝#2B2B2C）；移除 `create-product.html` 與本頁的頁內覆寫，改由 DS 統一提供。**連帶 create-project／create-event／register-ip／create-auction／create-bundle 也採此配色**。尚未 commit／deploy。
- **A** 募資視窗：移除「結算幣別」（原型固定 USD）；順序改為 目標金額（自成一行）→ 募資開始／結束。規格 0-設計規格書 §8、5.1.1 F3／§7 同步。
- **A** 股權與股數：順序改為 總股數 → 回饋股權 %。5.1.1 F4 同步。
- **B** 套組：套組名稱、套組描述各自一行；描述改 `textarea`（多行）。
- **B（修復）** 中／EN 切換：還原雙語 `data-fi` 字典（zh/en）、`fiText` 依語言取值、header 補回可運作的「中/EN」鈕（呼叫 `window.toggleLang`）；預設中文，選 EN 真的顯示英文。先前因把字典改成純中文＋鎖死 lang，導致選英文仍中文。

## 2026-06-30（第六輪：修正黑夜配色）

- **D（bug 修正）** 黑夜模式對齊 r2.1 建立商品（create-product）：補上頁內覆寫 `[data-theme="dark"]` — content＋header＝`--surface-page`(#191A1A)、canvas＋footer＝`--surface-shell`(#2B2B2C)。原本漏抄此覆寫，退回 shared.css 預設（content 較淺浮在深 canvas 上），導致深淺與 create-product 對調。create-product 是 wizard 頁中唯一這樣覆寫的特例。

## 2026-06-30（第五輪：添加共創者）

- **A** Step 0 加回原先移除的「連結創作者」，**改為「添加共創者」**：搜尋既有 Ztor creator 用戶（名稱／@handle／email），或貼上 email；email 非既有用戶以「邀請中」加入。可多位、可移除（chips）。規格 0-設計規格書 §3.3／§7／§8、5.1.1 同步：新增 **F2 共創者**，募資視窗／股權／套組順移為 F3／F4／F5。
- **B** 共創者 UI 用頁面專屬樣式 `.fc-cc-*`（搜尋框＋結果下拉＋已添加 chips），未新增 ds-component。

## 2026-06-30（第四輪：前台試算 demo 頁）

- **D（demo 專用，非產品）** 新增第 4 步「前台試算」：設定完按下一步進入，模擬贊助者在前台逐筆認購，**共用股份池**即時下降，各套組「剩餘可買」依公式 `min(名額−已售, ⌊剩餘股數÷份數⌋)` 連動；附「重設試算」與「上一步（回套組調整）」。明確標示「正式版不會出現」。
- 此頁**不寫進設計規格書**（0-設計規格書／5.1.1），因為是 demo、非產品頁；僅記於此與 ASSUMPTIONS。
- 進入試算只在首次建一次（`simBuilt` 旗標），i18n 重繪不會重置已認購；離開再進會重建為最新套組設定。

## 2026-06-30（第三輪修訂，依使用者反饋）

- **A** 套組商品每件新增「商品名稱」欄位（原只有照片＋描述）；規格 5.1.1 F4、0-設計規格書 §3.3 同步補。
- **B** 合規區塊由 `alert` 卡降為頁面下方小灰字（`.fc-footnote`）——它只是提示，不需強調。
- **B** 整頁去中英混雜：欄位／區段／按鈕只留中文；僅保留品牌與技術詞（Ztor、Stripe、T&C、Legal、USD）。`data-fi` 字典與 inline 預設文字同步。

## 2026-06-30（第二輪修訂，依使用者反饋）

- **B** 內容上內距加大（`wizard__body` padding-top 16 → 44px）。
- **B** 每股金額／每股股權數值改用品牌橘 `var(--primary)`（原 `--status-accent` 紫）。
- **B** 「新增商品」「新增套組」按鈕加高、滿版、置中（`.fc-add` / `.fc-add-item`）。
- **B** 預設不預先帶套組與商品：Step 2 預設只有「新增套組」按鈕；新套組預設只有「新增商品」按鈕。
- **C** 移除「連結創作者 · Linked creator」整段（規格 0-設計規格書 §2、5.1.1 同步移除；F 重編號 F1 識別／F2 募資視窗／F3 股權與股數／F4 套組）。
- **B** header stepper 響應式：新增 1120px／880px 兩個本頁覆寫斷點（880px 起只留當前步標籤），改善中等寬度時的擁擠。
