> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Page intro

#### 總表紀錄（原 §4.1 · Page intro）

- `_layer`：🟡 molecule
- Status：✓ Project
- CSS：[page-intro.css](../ds-components/page-intro.css)

Product page H1 + sub + optional actions; eyebrow retired **`__lead` ＋ `__media`（2026-08-13 使用者指示「需要有活動圖片在左邊」）**：標題左邊放主視覺時，把圖與文字收進 `.page-intro__lead` 當左欄（`flex: 1 1 320px`），動作列維持右欄。basis 給固定值而不是 auto——`.page-intro` 是 `flex-wrap:wrap`，換行的判斷在壓縮之前，basis:auto 會拿標題的自然寬去比，長活動名稱還沒開始壓縮就先把動作列擠到下一行（實測 1194px 視窗）。`__media` 是直式 2:3、96px 寬（窄畫面 64px），沒有圖時由消費頁整塊收起、不留空框。消費頁：event-detail、series-detail。**2026-08-31 使用者指示「靠上方」**：`__lead` 的對齊由 `flex-end` 改 `flex-start`——圖比文字塊高，底線切齊等於在徽章列上方留一段空白，頁首讀起來像掉下去；頂端對齊後徽章與圖的上緣同一條線。同輪新增 `__sub--stack`（`> span { display:block }`）：副標裡「什麼時候」與「在哪裡」是兩種事實，串成一條時長場地名會決定換行點，讀者每次看到的分組都不一樣；消費頁把兩行各包一個 `<span>`。消費頁：event-detail（第一行開演＋開放入場、第二行地點）。每行行首帶一顆 `.ztor-icon`（calendar／map-pin）標明那一行是什麼——圖示是那個分類最短的標籤，比再寫一次「開演」「地點」省；排法與 `.data-list__meta .ztor-icon` 同一套（行內、15px、`vertical-align:-2px`），不另發明第二種行首圖示。**ztorUI 換裝（2026-08-28 Wave 2b §10）同檔內的麵包屑 `.page-crumb`**：由 `--brand-ink`（Wave 1 之後是亮橘）改 `--foreground-muted`，新增 `.page-crumb > span:last-child { color: var(--foreground) }` 表達「當前層」；返回圓鈕靜止態維持既有裁決（裸箭頭、不畫圓），hover 的不透明 `--accent` 圓改玻璃圓鈕（`--ztu-glass-bg` ＋ blur ＋ `inset 0 0 0 1px var(--border)`，用 inset 陰影當邊避免 hover 時抖動）。**`__highlight`（2026-09-22 D300 / spec 5.1.6.3 §2.1）**：標題下方、副標之上的一句短文字（活動亮點，例「台北唯一一場」）；15px 與副標同級、`--brand-ink`（橘色的字、對比量過），讓它讀成標題的註腳而不是第二個標題；沒有亮點的活動由消費頁 `hidden` 收起。與 `.event-preview-card__highlight`／`.review-row__value--highlight` 同一視覺角色、同一配方。消費頁：event-detail
