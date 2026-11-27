> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Image crop

**Pattern** — [5.1.8 彈窗類型](../ds-pillars/5-pattern.md) 第 1 類「填寫送出」（外殼是 Modal shell §4.61，本元件只管內容）。

#### 總表紀錄

- `_layer`：🟠 molecule
- Status：✓ App
- CSS：[image-crop.css](../ds-components/image-crop.css)
- JS：`partials/upload-tile.js` 檔尾的 `window.ztorImageCrop`

上傳圖片時的裁切工具（2026-11-27，D554，規格 §7.10「上傳圖片時的裁切」，功能表 S151）。直式圖片槽（`.upload-tile--portrait[data-upload]`）選到圖片或替換圖片時，先開這個彈窗，創作者拖動與縮放圖片、框出固定 2:3 的範圍，按「裁切並上傳」才走上傳格原本的上傳過場；取消就什麼都不做，格子維持原狀。

#### 用途

- 讓創作者自己決定直式素材留下原圖的哪一塊。
- 框中央兩條虛線之間＝方形版位會顯示的範圍（§7.10 方形版位從 2:3 素材中央裁切）。

#### 該做與別做

- 該做：裁切框比例固定 2:3，只讓使用者移動與縮放圖片。
- 該做：圖片太小框不出最小尺寸時，只顯示錯誤訊息與取消，不給裁切框。
- 別做：不要讓使用者改裁切框的比例或大小；不要在影片、內容檔格或活動描述的內文圖片開這個工具。

#### 結構

- `.payout-modal.payout-modal--top` ＞ `.payout-dialog`（預設 620px）＞ head（標題「裁切圖片」＋關閉）／body／foot（取消 outline ＋「裁切並上傳」primary）。
- body：`.image-crop` ＞ `.image-crop__stage`（2:3 框，`--img-portrait`，寬 min(300px, 100%)）＞ `.image-crop__img`＋`.image-crop__guide`；`.image-crop__zoom`（減號鈕、`input[type=range].image-crop__range`、加號鈕）；`.image-crop__hint`；`.image-crop__error`（`role="alert"`）。

#### 行為細節

- 開啟：`ztorImageCrop.open(file, { minWidth })` → `Promise<File|null>`；上傳格在 `change` 時判斷 `.upload-tile--portrait`、非 `data-upload="content"`、沒有 `data-upload-nocrop`、檔案是圖片、`featOn('S151')` 都成立才開。
- 最小寬度：格子的 `data-upload-min` 優先；沒有時同一列第一格 750（主要展示素材），其餘 600（次要），§7.10。
- 縮放：1 倍＝圖片剛好蓋滿框；上限＝框在原圖上的寬度等於最小寬度。原圖最大的 2:3 範圍寬度不到最小寬度時顯示「這張圖片太小」，主鈕收起。
- 操作：拖動（Pointer Events）、雙指縮放、滾輪縮放（以游標為中心）、滑桿與加減鈕；裁切框聚焦時方向鍵移動（Shift 一次 40px）、+／− 縮放。Esc 取消；Tab 留在彈窗內；取消後焦點回到開啟前的元素。
- 輸出：canvas 畫出框內範圍，寬度上限 1500px（原型示範用），PNG／WEBP 保留原格式、其餘輸出 JPEG，回傳新的 File 交給上傳格。
- 從規格圖片彈窗（`partials/variant-image-modal.js`）裡開時疊在它上面（`--top`）：裁切是上傳步驟的一部分，關掉就回到原彈窗。

#### Token 使用

- 框底 `--layer-2-surface`、框線 `--border`、圓角 `--radius-md`、聚焦 `--ring`、虛線 `--on-media`、滑桿 `--primary`、說明 `--muted-foreground`／`--fs-13`、錯誤 `--destructive`／`--fs-14`、間距 `--sp-8`／`--sp-16`。

#### Consumers

- 所有載入 `partials/upload-tile.js` 且有直式圖片槽的頁：create-product、product-detail、create-bundle、bundle-detail、create-auction、create-project、project-detail、publish-work、series-detail、create-event、event-detail、create-event-legacy、create-campaign、fan-analytics（只有檔案格，不會觸發）。
