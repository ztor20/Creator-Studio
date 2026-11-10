> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Card group

#### 總表紀錄（原 §4.1 · Card group）

- `_layer`：🔵 atom
- Status：✓ App
- CSS：[card-group.css](../ds-components/card-group.css)

**卡內第 2、第 3 層的順序（Q161，2026-11-09）**：照 Q71——第 2 層線框（`.control-group`）、第 3 層填色（`.nest`）；Q66 的「L2 填色、L3 線框」順序作廢；超過 3 層拆成彈窗、抽屜或另一張卡。何時用哪一級，見 Pillar 5 §5.1.16 卡片類型的「巢狀層分工」。

**第 3 層填色用哪一支（2026-11-10）**：兩支都是填色，差在位置——
- 第 3 層在卡片**中段**（上下還有別的內容，例：線框開關盒裡再一層限時折扣、場次盒裡的跨日與提前入場）→ `.card--muted`：維持母卡內距、四周留白。
- 第 3 層**貼齊母卡底緣**、是整張卡最後一段（模式切換後長出整組設定）→ `.nest`：左右下三邊切齊母卡外緣、上緣髮絲線。
- 判斷句：這一層下面還有沒有別的內容？有 → `.card--muted`；沒有、而且要讀成疊上去的另一個平面 → `.nest`。細節見 [Nest](./4.53-nest.md)「與 `.card--muted` 的分工」。

卡內分組三件組（Q71 定案 2026-08-25）：一張卡裡有多組資訊時，判準是「這塊需要多強的獨立性」，三級由弱到強——第 1 級（預設，本元件）＝次級標題或分隔線（`.group-title`＋可選 `.group-desc`、`.group-divider`），不加填色層；第 2 級＝1px 線框，沿用既有 `.control-group`（`control-row.css`），本檔不重複定義；第 3 級＝整層新填色，沿用 [Nest](./4.53-nest.md)，本檔不重複定義。另含比子組再高一階、服務整張卡的大標 `.card-head`（`.card-head__title`＋可選 `.card-head__desc`＋`.card-head__rule` 滿版線）。間距階梯：列與列 14＋14、小標→內容合併總距 32、組分隔線上下各 32（線出血到卡緣，讀 `--card-pad`）、卡頭線上 24／下 32。附屬 `.attr-value`／`.attr-link`＝卡內列式版面裡「純文字值＋底線文字動作」的搭配（取代黑底標籤）。demo-eshop-styles.html only as of 2026-08-25；後續消費頁：project-detail（2026-08-31 項目摘要）、fans-crm 分級設定彈窗「計分參數」分頁與 tier-settings 備份頁（2026-10-02 D347：行為倍率／品項權重／投入類上限三組，`.group-title`＋`.group-desc`＋`.group-divider` 第 1 級分組，元件本身未改）
