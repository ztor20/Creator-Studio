> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### New product post

#### 總表紀錄（原 §4.1 · New product post）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[product-post-modal.css](../ds-components/product-post-modal.css)

建立商品後在電子商店清單彈出的撰寫彈窗（spec 5.1.5.7 / D068）：重用群發撰寫器（受眾·標題≤120·內文≤2000·token·排程，message-modal.css）＋ payout dialog 外殼，本檔只加 F2 商品附件卡 `.npp-product`＋略過路徑；`?posted=1` 由 e-shop 開啟。組合 payout-modal＋message-modal
