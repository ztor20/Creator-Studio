> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### IP hero

#### 總表紀錄（原 §4.1 · IP hero）

- `_layer`：🟠 organism
- Status：✓ Project
- CSS：[shared.css](../shared.css)

IP detail cover + usage + rental composition（ip-detail 專用）。**2026-07-25（Q31）改兩欄 `200px minmax(0,1fr)`**：封面獨佔左欄，其餘（徽章／標題／權屬／四格事實／租用區）全走右欄；四格事實改用站上標準 `.bento > .kpi.bento--span-3`，租用改用 `.rent-block`——`.ip-hero__meta` 與 `.ip-hero__side` 已退場（shared.css 留墓碑）。封面 `.ip-hero__cover` 為品牌漸層佔位＋IP 名，加 `.ip-hero__cover-img`（`object-fit:cover`、疊在佔位上）即放真實封面圖（2026-07-25）。**專案詳情頁 2026-07-24 起改用 `.pd-hero` 版型（見 shared.css，參考 GoFundMe 募款預覽 wireframe），不再用 `.ip-hero`**
