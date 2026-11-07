> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Album tracks

#### 總表紀錄（原 §4.1 · Album tracks）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[album-tracks.css](../ds-components/album-tracks.css)

數位「音樂專輯（Album）」多曲目管理（spec 5.1.5.2 §4.2 F11.1）：上傳 mp3/mp4→逐曲列（`.album-track`：`__grip`/`__cover`/`__main`(`__name`/`__meta`/`__bar`/`__lyrics`)/`.dropdown.album-track__menu`）；拖曳重排、改名(inline)、換封面、上傳歌詞(音訊限定→View Lyrics)、刪除；上傳中 `.is-uploading`。`partials/album-tracks.js` 增強、emit `albumtracks:change`；逐列選單重用 dropdown-menu.css。**`data-album-seed`（JSON `[{name,meta,type?,lyrics?}]`）可預置已完成曲目列**（2026-07-16，供 product-detail 呈現既有專輯內容；建立頁不帶＝空狀態）。呈現層 demo（假上傳/歌詞）
