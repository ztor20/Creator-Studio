> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### New product post

#### 總表紀錄（原 §4.1 · New product post）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[product-post-modal.css](../ds-components/product-post-modal.css)

建立商品後在電子商店清單彈出的撰寫彈窗（spec 5.1.5.7 / D068）：重用群發撰寫器（受眾·標題≤120·內文≤2000·token·排程，message-modal.css）＋ payout dialog 外殼，本檔只加 F2 商品附件卡 `.npp-product`＋略過路徑；`?posted=1` 由 e-shop 開啟。組合 payout-modal＋message-modal

#### 細節頁模式（2026-11-08 · D520）

商品細節頁「貼文」分頁（`js/product-posts.js`）開同一份 partial，切成發新貼文或編輯：

- `[data-npp-intro]`、「剛上架」徽章、「查看商品」連結收起；「之後再說」改叫「取消」。
- 編輯已發送的貼文：顯示 `[data-npp-sent-note]`（`.alert.alert--row.alert--info`，說明不再通知、Email 不會變），收起 `[data-npp-audience-field]`、`[data-npp-timing-field]` 與個人化變數，主鈕叫「儲存」。
- 編輯已排程的貼文：欄位全開，排程開關預設打開並帶入原本的時間，主鈕叫「儲存」。
- 標題或內文空白、或排程沒填日期時間時，主鈕停用。
