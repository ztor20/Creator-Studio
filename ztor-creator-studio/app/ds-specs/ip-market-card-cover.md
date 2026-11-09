> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### IP market card cover

#### 總表紀錄（原 §4.1 · IP market card cover）

- `_layer`：🟢 atom
- Status：✓ Project
- CSS：[shared.css](../shared.css)

`.ipm-card__cover`（ip-market.html 上架卡的封面，2026-07-25 由 inline 漸層 div promote）：與 `.ip-hero__cover` 同一套品牌漸層佔位（3:4），無圖時顯示佔位＋IP 名，加 `.ipm-card__cover-img` 放真實封面圖鋪滿（`object-fit:cover`），`<img>` 帶 `onerror` 自我移除→缺檔時乾淨退回佔位、不破圖。**封面一律等比滿版**（2026-07-25 使用者裁示）：全部用預設 `object-fit:cover` 鋪滿裁切，不留白、不分變體——當日一度新增的 `--contain` 變體同日退場（shared.css 留墓碑）；寬版素材裁切過頭時改換直式素材解決，不改 fit。封面圖由使用者自備放入 `images/ip/`（檔名＝IP slug）。

**風格裁決依據**：本規格的規則包含 STYLE-DECISIONS Q30 的裁決（索引與原文見 [STYLE-DECISIONS.md](../STYLE-DECISIONS.md)）。
