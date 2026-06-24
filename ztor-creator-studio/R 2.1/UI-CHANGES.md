# Ztor Creator Studio · R 2.1 · UI-CHANGES

> 嚴格分區：**A** spec-derived 新增 · **B** 反饋導入 · **C** 撤除（intentional removal）· **D** infra / 文件。Bug 修正不寫。
>
> 每筆紀錄日期 + 範圍 + 動機（為什麼這樣設計）。R 2.1 是從零搭起，所以首筆紀錄包山包海；之後的調整一筆一筆來。

---

## 2026-06-16 · See-as-fan 粉絲端店面改版（B 反饋＋提案 · 5.1.5 F5 / 5.1.5.5 F1）

- 範圍：新增 `ds-components/fan-store.css`＋`partials/fan-store.js`；e-shop.html F5 商店預覽與 store-settings.html F1 See-as-fan 兩處改注入同一份 `[data-fan-store-host]`，取代原 `.ss-fan`。icons.js 補 `disc-3`；i18n.js 加 `fan.*`。DS：design-system.html 加連結＋`#fan-store` demo（4.22f₂）＋TOC＋inventory；design-system.md inventory 行。
- 動機：使用者提供粉絲店面參考圖，要把預覽升級成「hero cover＋本月精選＋分頁＋商品格」的完整店面版面。
- 兩項裁示：①視覺「只套版面、顏色跟隨全站主題」（§6.9 不鎖深色）→ hero 為品牌色淺底帶、所有色走 token、深色自動適配。②圖中規格未定義欄位「照加、記提案」→ 追蹤數／社群連結／加入社群／本月精選／立即購買／售完補貨中以提案呈現，記 ASSUMPTIONS **UIA-026**（§6.7 禁止預覽引入未定義欄位，故標產品變更提案、待上游核准、未寫回 documents/）。
- §6.7 同源：兩處 See-as-fan 共用同一 partial，避免兩邊不一致（差異即缺陷）；商品資料沿用管理側同一店面。
- 高度齊平：右預覽欄與中間主面板頂/底已對齊（量測 80→viewport 底一致）；移除 Direction B 的 `#eshop-preview .ss-fan` scope 覆寫。
- 驗證：check_ds_sync PASS（55 元件）、node --check partial OK、Playwright 確認 e-shop＋store-settings 兩處掛載與深色適配、i18n 中文生效。
- 追加（同日 · 使用者再裁示）：①E-Shop F5 預覽**移除 `.preview-panel__head`**，「商店預覽」改成 `.text-sub` 小字 caption 置於 body 頂端（不要 header bar）。②`.fan-store__hero` 改**滿版＋預設灰底 cover**（`--surface-muted`，取代品牌色漸層／圓角／邊框）；featured/分頁/商品格改包進 `.fan-store__content`（內距層），hero 貼齊面板邊緣。③滿版＋白底靠 `.preview-panel__body:has(.fan-store){padding:0;background:var(--surface)}`（fan-store.css，兩處共用、:has 自動套用）——覆寫 preview-panel.css 預設的 `--surface-muted` 灰底，讓預覽是乾淨白面板（使用者：商店預覽背景改白）。store-settings F1 保留自身關閉鈕 header（closable 情境），其餘同步。
- 側邊欄模式高度：F5 預覽 `top` 改為 nav-mode 感知（頂欄模式 `64px+gutter`、側邊欄模式只 `gutter`），兩模式頂/底齊平（bugfix）。
- 追加（使用者：預覽與主頁面「交疊、無間隙」→ 再裁示「主內容頁疊在上面」，比照參考圖）：移除 main 與預覽欄之間的 shell 灰隙、改成**層疊**（非並排）；最終由**主內容頁在上層**。
  - 結構：`#eshop-preview` 由 `.page` 內**移出**成 `.app` 直接子層（與 `.main` 同層）——子元素無法被父層內容蓋住，要讓 main 疊在預覽上必須同層再比 z-index。
  - 桌機（≥1101px）：`body.preview-open .main { margin-right: calc(var(--preview-w) - var(--space-shell-gutter)); position: relative; z-index: 45; box-shadow: 8px 0 24px -10px ... }`（main 升上層、右緣壓過預覽一道 gutter、右向投影到預覽上）；預覽 `z-index: 40`（topbar 50 > main 45 > 預覽 40）。main 右上角用 corner-mask 補圓（`--corner-fill` 桌機＝`--surface` 白，貼預覽白底；901–1100px＝`--surface-shell` 灰，貼視窗灰底）。
  - 窄螢幕：預覽移出 main 後，側邊欄 901–1100px（`.app` 為 row）以 `flex-wrap` + `flex-basis:100%` 讓預覽換行堆疊到主面板下方；topbar／≤900 本為 column 自然堆疊。
  - 量測：兩模式 overlap=16px、main z45>預覽 z40；1000px 側邊欄預覽堆疊於 main 下方。此調整反轉 UIA-023 的「中間 gutter／兩塊並排」，改為主頁層疊在上。
- 再追加（使用者：「之間要有距離」，版型結構待 Figma 對齊）：撤回上一輪的層疊，改回**兩塊各自圓角面板、中間一道 shell 灰隙（距離）**——`body.preview-open .main { margin-right: calc(var(--preview-w) + var(--space-shell-gutter)) }`（gap=16px），移除 main 的 `z-index/position/box-shadow`、預覽兩上角圓、main 右上角 corner-mask 灰補（貼灰隙）。`#eshop-preview` 維持 `.app` 子層（不影響 gap 版面）。
- Figma 結構校正（讀 file `2NjmHbHeepZfzwaT6Bb23p` 的 topbar 655-1258 / sidebar 655-1266，僅參考結構、不參考圓角/陰影/尺寸）：兩 frame 皆＝主面板＋預覽兩塊圓角卡、中間留灰隙（已符合）。差異＝**topbar 主面板貼左視窗緣（content x=0）；sidebar 主面板浮成卡片、與側欄之間也有一道灰隙（content x=120，rail 左側）**。故新增 sidebar 模式 `html[data-nav-mode="sidebar"] .main { margin-left: var(--space-shell-gutter) }`（≥901px、**e-shop scope**）。量測：sidebar rail→main 16px、main→preview 16px；topbar 主面板仍貼左。> 註：rail→main 間距目前僅套 e-shop；若要全站 sidebar 一致需提升到 shared.css（待使用者確認）。
- 結構大修正（使用者澄清，**前面對 Figma 結構理解全錯**）：Figma 的「preview frame 與 content frame 是連在一起的（無 gap）」，視覺「距離」來自 **preview frame 內部 content 的內距、左邊較大**，不是兩塊之間的 margin。故：①`body.preview-open .main { margin-right: var(--preview-w) }`（main↔preview 貼合、gap=0，一道 `border-left` hairline 分隔、交界方角、外側角圓）；②**撤回**上一條的 sidebar `.main { margin-left }`（main 貼回側欄，與 topbar 主面板貼左視窗緣對稱）；③預覽內距移到 `.preview-panel__body:has(.fan-store) { padding: 14px 14px 0 24px }`（**左 24 > 其餘**），fan-store 取消自身 `__content` 內距、hero 由滿版改為受此內距內縮的灰底卡（`--radius-md`）。corner-mask 回到僅 901–1100px。量測：main↔preview gap=0、preview 內容左內距 24px、topbar/sidebar 皆驗。
- 收尾微調（使用者三點）：①移除預覽 `border-left` hairline、預覽**左上角也圓**（`border-radius: shell shell 0 0`）；改用 **main 的右向陰影**做分隔——`body.preview-open .main { position:relative; z-index:45; box-shadow: 6px 0 18px -8px ... }`（main 升上層、陰影才蓋得到預覽；topbar50>main45>預覽40）。②hero 由「內縮灰卡」改回**滿版**（`.preview-panel__body:has(.fan-store){padding:0}`、hero 去圓角去外距），只留下方間距（`.fan-store{gap:16px}`）；左內距改只套**非 hero 內容** `.fan-store__content{padding:0 16px 16px 24px}`（左 24）。caption 自帶 `padding:16px 16px 10px 24px`。量測：main 有右陰影、預覽左上圓角 28px、border-left=0、hero 左右內距=0（滿版）。
- 收尾微調 2（使用者兩點）：①main 右上角的「方角」修正——corner-mask 重新在 ≥1101px 啟用、填色用 `--surface`（白，因 main 疊在白色預覽上），把捲動容器的方角補成圓（901–1100px 仍用 `--surface-shell` 灰）。②預覽**去頭像、去獨立 caption**：fan-store 移除 `__avatar`/`__hero-top`，新增 `__overline`（店名上方小標，預設 `hidden`，由各頁 mount JS 填字）；e-shop 設為「商店預覽」並顯示、store-settings 留 hidden（用自身 header）。DS demo 同步（移除頭像、加 overline）。量測：overline=「商店預覽」、無 `__avatar`、無 `.eshop-preview__cap`。
- 右上角方角根因修正（**反覆出錯的真正原因**）：corner-mask 在 main 右上角外側三角塗一塊色把方角「補圓」，**填色必須＝該角後面露出的底色**才會融進去。main 右上角後面露出的永遠是**灰 canvas**（預覽貼右側、與 main 無重疊，並非疊在此角後方），故填色應一律 `--surface-shell`（灰）。上一輪在「main 疊在白色預覽上」的錯誤假設下改成白 `--surface`，於是灰底上多一塊白三角＝看起來的「直角」。修正：移除 ≥1101px 的白色 override，一律灰補；放大檢視確認右上角為乾淨圓角、無白三角。教訓：版面一改就重猜「角後底色」會反覆錯——此角恆在 shell canvas 上，填色固定灰。
- 殘留「淡淡直角」再修：補圓後仍有極淡方角，放大採樣（8×）定位＝main 的右向陰影在**頂端往上溢進灰隙**、沿右緣＋頂緣形成淡 L。修法（第一版）：陰影加負 spread——仍消不乾淨（負 spread 在圓角邊緣還是留一點）。
- 「淡淡直角」根治：只要 box-shadow 掛在 main（捲動容器）身上，就會繞到右上圓角邊緣留淡方角；負 spread 再大也消不掉。**徹底解法＝把分隔陰影完全移出 main**：①main 與預覽都不掛 box-shadow；②新增獨立 `.eshop-seam-shadow`（`.app` 子層、`position:fixed`、`z-index:41` 疊在預覽上），**自 main 圓角下方**（top = main 頂 + `--radius-shell`）起到底，用 `linear-gradient(to right, foreground12%, transparent)` 16px 寬漸層當右向陰影（box-shadow 從 1px 細條擴散會太淡、且負 spread 會讓 1px 寬塌成負值不渲染——故改漸層）。corner-mask 一律灰補（`--surface-shell`）。採樣驗證：角上方灰隙均勻 245（無方角）、接縫陰影 225→255 由交界往右淡出、且陰影起點在圓角下方、不碰角。topbar／sidebar（top 偏移各自處理）皆驗。
- 接縫陰影頂部補滿（使用者：「上面有一段沒有陰影」）：上一版讓 `.eshop-seam-shadow` 自圓角下方（top 多加 `--radius-shell`）才起投影，導致最上面那段圓角凹口露出一條無陰影亮帶。改為 `top` 拿掉 `+ --radius-shell`、自面板頂端（topbar＝`64px+gutter`、sidebar＝`gutter`）起，讓漸層貫穿整道接縫含頂部凹口。因陰影是獨立 fixed 元素、非掛在 main 上，貫穿到頂不會重現「繞圓角的淡方角」。
- 預覽底色改走 `--surface-page`（使用者：黑夜版商店預覽底改黑）：原 `.preview-panel__body:has(.fan-store)` 用 `--surface`（深色＝半透明白 `rgba(253,253,253,.10)`，疊在 canvas 上讀作深灰）。改用 `--surface-page`＝粉絲端「頁面」底：亮色仍 `#FFFFFF` 純白（無變化）、深色 `#0A0A0A` 近黑。一個 token 兩模式皆對、跟隨主題（§6.9）；hero／卡片以半透明白做 elevation 疊在黑底上。E-Shop F5 與 store-settings F1 共用同 partial 故兩處同步（§6.7）。採樣確認深色預覽底＝rgb(10,10,10)。
- 接縫改回「圓角＋柔投影填凹口」（使用者：給參考圖「有圓角時陰影要覆蓋兩塊圓角之間的區域」，並指出上一版切直角後圓角不見了）：撤回前一版的「接縫切直角」。最終＝**兩塊各自圓角面板、中間一道 shell 灰隙（距離），分隔靠向左柔投影順著圓角填滿中間凹口**。做法：①main 右上、預覽左上恢復圓角（移除 `border-top-right-radius:0`、預覽 sheet 回 `radius-shell radius-shell 0 0`、恢復 corner-mask 補圓）；②`body.preview-open .main { margin-right: calc(preview-w + gutter) }` 留 16px 灰隙；③陰影掛在**預覽 sheet**（非捲動容器，不會像 main 繞圓角漏方角）。④新增 token **`--shadow-seam`**（亮 `-7px 0 20px -4px rgba(12,10,9,.16)`／暗 `-7px 0 22px -2px rgba(0,0,0,.6)`，隨主題適配；原本誤用 `var(--foreground)` 在暗模式會變白光暈）；DS token 表＋色塊已補。topbar／sidebar×淺／深四組驗證：圓角保留、凹口被陰影填滿。**通則更新**：相鄰兩塊圓角面板要分隔又要陰影填凹口時，陰影掛在「非捲動容器」那塊、用 `--shadow-seam`。
- 接縫去灰隙（使用者：「中間可以不要有縫隙嗎」）：`body.preview-open .main` 的 `margin-right` 由 `calc(preview-w + gutter)` 改回 `preview-w`，兩塊貼合（gap=0）；圓角與 `--shadow-seam` 不變，凹口仍由陰影填滿。淺／深皆驗。
- 改成「主面板疊在預覽之上、陰影由主面板蓋向預覽」（使用者裁示）：翻轉層疊與陰影方向。①`--shadow-seam` 由向左（`-7px`）改向右（`7px`，亮／暗皆翻）——語意改為「上層面板向右投到相鄰下層」。②陰影從預覽 sheet 移到 **main**：`body.preview-open .main { position:relative; z-index:45; box-shadow: var(--shadow-seam) }`（z 45 > 預覽 40、< 頂欄 50），預覽 sheet 移除 box-shadow。main 雖是捲動容器，但陰影是向右「蓋在預覽上」的主投影、非接縫分隔線，圓角處不再出現先前的淡方角（採樣＋放大確認）。DS token 表／色塊同步為向右。topbar／淺＋深驗證：主面板在上、陰影向右蓋住預覽、凹口填滿、圓角乾淨。
- 主面板陰影方角根因＋根治（使用者：「為什麼一反過來陰影就壞掉」）：原因＝`.main` 是捲動容器，瀏覽器把捲軸側（右上角）畫成**方角**（畫面上的圓角是 corner-mask 補色假裝的），`box-shadow`／`drop-shadow` 一律跟著元件**真實方塊**走，所以陰影掛在 main 必為方角；掛在預覽（真圓角、非捲動容器）才會順著圓角——這也是為何「正放」沒事、「反過來」就壞。根治：陰影改掛一個**透明、真圓角、非捲動容器的輔助層** `.eshop-seam-shadow`（fixed、貼 main 右緣、右邊＝接縫、`border-top-right-radius: radius-shell`、`box-shadow: var(--shadow-seam)`、z 44＝預覽 40 < 此層 < main 45），由它向右投到預覽上。main 本身不再掛 box-shadow。放大採樣：陰影順著圓角、無方角，主面板在上、陰影只落預覽側；topbar／淺＋深皆驗。**通則**：要讓「捲動容器那塊」投出順著圓角的陰影，別掛在它身上——改用貼邊的透明真圓角輔助層代投。
- 接縫頂端灰楔根治（使用者：「還是有」）：像素採樣定位真因＝**接縫側的圓角**，而非陰影沒到頂。連在一起時 main 右上角（`border-radius 28px` 真幾何）＋通知條 `.alert--page-top::after` 補圓遮罩各自在接縫頂端把方角收成圓，露出一塊灰楔（`--surface-shell` 245），看起來就是「上面一段沒陰影」。**連在一起＝接縫要直角**：①`body.preview-open .main { border-top-right-radius: 0 }`；②預覽 sheet 改 `border-radius: 0 shell 0 0`（接縫側左上直角、外側右上圓角）；③`body.preview-open` 停用兩個補圓遮罩（`.eshop-corner-mask::after`＋`#eshop-stock-bar` 的 `.alert--page-top::after`）。採樣驗證：接縫白→陰影 255→225 一線到頂、無灰楔，topbar／sidebar 皆乾淨。**通則**：面板間有 gap＝各自圓角（含接縫側）；連在一起（gap=0）＝接縫側一律直角、只圓外側。

## 2026-06-16 · E-Shop F2 低庫存條：去 hairline 改陰影、貼頂滿版、右上角補圓（B 反饋 · 5.1.5 F2）

- 範圍：`ds-components/alert.css` `.alert--bar` 密度 + `e-shop.html` `.eshop-stock-bar` 定位 + DS 文件（demo／md 條目）。版本經 d→e→f 兩次微調定案。
- 動機：使用者反饋原「全寬＋底部一條線」太貼死。先試浮起卡片（四角圓＋陰影），再依回饋改回貼齊面板——滿版、貼頂、上/左/右無間隙。
- 最終做法：`.alert--bar` 移除底部 hairline、改 `--radius-lg` 圓角＋柔和陰影、無分隔線（密度本體，flush／floating 由消費端定位決定）。`.eshop-stock-bar` 設 `top:0; width:100%; margin:0`，上緣兩角 `border-radius:inherit` 沿用面板 shell 圓角、下緣方角＋向下陰影。
- 右上角方角：`.main` 是 `overflow-y:auto` 捲動容器，瀏覽器不去圓捲軸側的角 → 用對齊 `--surface-shell` 灰底的 radial-gradient 遮罩補出右上圓角（≥901px）。遮罩綁在常駐元素 `.eshop-corner-mask`（`.main` 第一個子元素、sticky 貼頂、height:0 不佔位），**與通知條存廢無關**——× 關閉通知條後右上角仍維持圓角（前一版誤掛在通知條 `::after`，關閉後圓角消失，已修）。
- 唯一消費端是 E-Shop，故直接改密度本身、未另開 modifier。

## 2026-06-16 · 7 模組補帳號無資料空狀態、接 Cheat Codes Empty（A spec · D070）

> 依使用者「依規格補齊 F 項其他狀態的空狀態、由 Cheat Codes 切 Empty 觸發」，且「先補規格再做」。把儀表板的 data-state Empty 擴到 projects／ip-market／my-ip／e-shop／events／fans／earnings 七個主要模組頁。

### A. Spec-derived 新增

- **規格層**：5.1.2／5.1.3／5.1.4／5.1.5／5.1.6／5.1.7／5.1.8 各加「頁面狀態（無資料／有資料）」枚舉＋資料型 F「其他狀態」段（沿用 D039 慣例；D070、backup Plan112、validate_spec PASS）。
- **站台層**：7 個模組頁的資料體標 `.when-data`、加 `.when-empty` 的 `.empty-card`（引導＋對應 CTA），靠全站 `<html data-data-state="empty">`（Cheat Codes「Data State＝Empty」）＋ shared.css 新增的 `.when-empty`/`.when-data` 切換。重用 empty-card.css，**0 新元件**。
- 明確區分**帳號層級無資料**（整頁退位＋建立引導）與**清單篩選查無**（既有 §6 空狀態，保留並存）；IP 市場另保留「冷啟動（市場無貨）」狀態，與帳號 Empty 正交。
- `i18n.js` 新增各模組 empty key（en+zh）；全站 cache → `?v=20260616c`。

### D. Infra / 文件

- 修 projects 空卡 icon `folder-plus`（未在 icons.js registry、會空白）→ `film`。check_ds_sync PASS（54 元件）。Playwright 抽查 projects／earnings `?data=empty`：Empty 顯示、資料隱藏、中文生效、無裸 key。
- 待調項記 ASSUMPTIONS（my-ip 統計卡 Empty 未歸零、IP 市場 Empty 未放 CTA、少數 icon 未註冊已改用已註冊者）。

---

## 2026-06-16 · 新品貼文 composer popup 進原型（A spec · 5.1.5.7 / D068）

> 把已定稿的 5.1.5.7 規格落地到 site/：建立商品完成後回電子商店清單、彈出新品貼文撰寫 popup（可發布／略過）。發送機制重用群發訊息 5.1.7.1，不重造。

- **A spec（5.1.5.7）**：新增 `partials/product-post-modal.js`（`ZTOR_PARTIALS.productPostModal`）＋ `ds-components/product-post-modal.css`。彈窗＝`.payout-dialog` 外殼＋**重用群發 composer**（`.msg-*`：受眾分眾、標題≤120、內文≤2000＋個人化 token、排程，message-modal.css）；本檔只加 F2 商品附件卡 `.npp-product`（縮圖／名稱／剛上架 badge／價格／查看商品）與略過路徑。標題與關閉由彈窗外框承擔（無頁面頁首，比照 D067）。
- **觸發（§7 / §3.2.1）**：e-shop.html 掛載 partial、於 `?posted=1` 自動開啟並帶入剛建商品（name/price 由 query 傳入，demo）；create-product.html「Start selling」就緒後點擊 → 導回 `e-shop.html?posted=1&name=…&price=…`。
- **互動**：標題/內文即時字數（120/2000）、token 游標插入、排程開關（顯示日期時間＋主鈕切「發布貼文／排程發布」）、略過／✕／backdrop／Esc 關閉。發布為 demo（概念上通知粉絲＋寫入 Fans CRM，引用 5.1.7.1／5.1.2.2 §4.9，無後端）。
- **收尾**：i18n `npp.*`（受眾／排程／token 重用 `msg.*`）；DS 同步（新元件 link＋清單＋demo section `#product-post`，重用 message-modal）；版本 20260616a；check_ds_sync PASS；Playwright 全流程驗證（建立→導回→popup 帶入、字數/token/排程、略過關閉）。待確認沿用規格 §8.13（UIA-024）。

---

## 2026-06-16 · E-Shop F2 低庫存條微調：右上角補圓、標題＋CTA 同側、CTA 改「查看」（B 反饋 · 5.1.5 F2）

> 依使用者三點：①banner 右上角要圓（與左上對稱）②「3 件…」與 CTA 並在同一側 ③「查看低庫存」縮短為「查看」。

- **右上角圓角**：`.main` 為捲動容器（`overflow-y:auto`），瀏覽器不會把「捲動軸側（右）」的角去圓，故 banner（＝main 頂端）右上角原為方角。以對齊 `--surface-shell` 的 radial 遮罩在 `.eshop-stock-bar::after` 補出右上圓角（僅 ≥901px 面板有圓角時；≤900px 面板本就方角不補），與主題色連動。
- **標題＋CTA 同側**：`.alert--bar .alert__body` 由 `flex:1 1 auto` 改 `0 1 auto`（不撐開）、`.alert__dismiss` 加 `margin-left:auto`，使「⚠ 標題 查看 →」群聚左側、× 推到最右。
- **CTA 文案**：`e-shop.alert.cta`「View low stock／查看低庫存」→「View／查看」（markup fallback 與 DS demo 同步）。版本 g→h；check_ds_sync PASS。

---

## 2026-06-15 · E-Shop F5 預覽欄視覺優化：兩塊圓角面板＋白色店面卡（B 反饋 · 5.1.5 F5 / UIA-023）

> 依使用者「中間內容頁右上角也要圓角」「右側欄有點醜，參考 Mobbin」：把左右改成灰底上的兩塊圓角面板，並把預覽內容包成乾淨店面卡（Mobbin Direction B：Whop／Squarespace 浮卡式預覽）。

- **B 反饋（圓角／版面）**：右預覽欄改內縮一道 `--space-shell-gutter` 灰隙、頂對齊 main、頂角 `--radius-shell` 圓——左主欄（含 sticky banner）右上角因此露出圓角，左右讀成同一套 shell 的兩塊面板。`main` margin-right 改 `preview-w + gutter`，預覽 `right:0` 貼右緣。
- **B 反饋（預覽內容）**：把 `.ss-fan` 在 `#eshop-preview` scope 內包成白色圓角「店面頁」卡（浮在灰底 `__body`、含陰影），內層商品磁磚去掉各自白卡＋陰影改平鋪（縮圖維持方形灰底），更像真的店面。僅 e-shop scope 覆寫，不動共用 `.ss-fan`／store-settings。
- **D infra**：純 e-shop inline CSS（未動 ds-components／js），版本維持 g；窄螢幕（≤1100px）仍為靜態堆疊；check_ds_sync PASS。

---

## 2026-06-15 · E-Shop F5 商店預覽改常駐不可關閉＋改名（B 反饋 · 5.1.5 F5 / UIA-023）

> 緊接上一版（F5 可收合分割），依使用者三項裁示再調整：①商店預覽改「常駐、不可關閉」；②移除工作列「粉絲視角」切換鈕；③標題「粉絲眼中的商店」改「商店預覽」。

- **B 反饋（5.1.5 F5）**：`#eshop-preview` 永遠 `is-open`＋`body.preview-open`（寫進 markup 免 flash），移除 ✕ 關閉鈕、backdrop 與 Esc／切換邏輯（JS 僅保留確保 `body.preview-open`）。比可收合版更貼合 spec §5.1.5「常駐右側欄」。
- **B 反饋（工作列）**：移除 `data-eshop-preview-toggle`「粉絲視角」鈕，工作列剩「商店設定」＋「建立」分割按鈕。
- **B 反饋（改名）**：`e-shop.preview.title` 由「粉絲眼中的商店／How fans see your shop」改「商店預覽／Store preview」。
- **D infra**：面板移進 `.page` 內，新增 `@media (≤1100px)` 讓不可關閉的面板在窄螢幕改靜態堆疊在清單下方（避免永久壓窄清單）；DS preview-panel 重用註同步改為「常駐不可關閉」；版本 f→g。

---

## 2026-06-15 · E-Shop F2/F3/F5 版面改版：低庫存改全寬通知條、狀態篩選改第二排 tab、類型切換淡黃 pill、See as fan 改可收合分割（A spec · B 反饋 · 5.1.5 F2/F3/F5）

> 依使用者四項裁示：①低庫存提醒改「全寬細條、頂欄之下、常駐可關閉」；②狀態篩選由下拉 select 改「第二排 pill tab、每項附數量」；③類型切換加「淡黃填色 active pill」（有品牌色但不搶眼，③A）；④See as fan 由 D066 的右側常駐欄改「可收合畫面分割」（載入即開，④A）。

- **A spec（5.1.5 F2）**：低庫存提醒新增 `alert.css` 的 `.alert--bar` 細條變體（白底、底部細線、⚠ 警示色 chip、文字連結 CTA＋圓形關閉），置於 `.main` 第一個子元素（頂欄之下、白色面板頂端、全寬），`position:sticky` 常駐、× 關閉復位（符合 §6.10「在頁首之上、佔版面流、非浮層」）。拿掉副標商品名（只留數量＋CTA）。撤除原 `.alert--banner` 卡片版橫幅用法。
- **A spec（5.1.5 F3 狀態）**：狀態篩選由 `field-pill` select 改第二排 `filter-tabs`（新元件 `filter-tabs.css`）——All／Live／Low Stock／Sold Out／Draft pill、每項附數量（讀清單列 `data-status` 計算、切 tab 重算、reset 回 All）；數量是否隨搜尋連動仍 spec 待確認、本輪不連動。次級淺色填底，刻意不用品牌色，與類型切換形成主次層級。
- **B 反饋（5.1.5 F3 類型）**：類型切換加 `tabs.css` 新修飾類 `.tabs--brand`（active＝`--primary` 18% 淡黃填色 pill、無底線），只套 e-shop，不動全站 `.tabs`。
- **A spec（5.1.5 F5）**：See as fan 由右側常駐欄改「可收合畫面分割」——重用 `preview-panel.css`（`.preview-panel--inset` 壓窄 `.main`、非浮層），See as fan 鈕放回 F3 工作列當開關，✕／Esc 關閉；寬螢幕（≥1101px）載入即開、窄螢幕載入收合（spec §5.1.5「可否收合由 project-ui-creator 決定」，UIA-023）。撤除 D066 的 `.eshop-layout` 固定右欄。
- **D infra**：i18n 補 `e-shop.btn.seefan`／`e-shop.alert.dismiss`；DS 同步 alert `--bar` demo、`tabs--brand` demo、新 `filter-tabs` section（TOC＋清單＋compose-row）、preview-panel 加 E-Shop F5 重用註；版本 e→f；check_ds_sync PASS。

---

## 2026-06-15 · 商店設定 popup 去頁首：store-settings 改 popup 專用內容＋D065 命名收尾（A spec · 5.1.5.5 / D067、D065）

> 依使用者「會被 popup 開啟，不需要頁首」，把 store-settings.html 從帶全域導航／麵包屑／頁首的整頁，改成 embed-modal popup 專用內容；標題與關閉由 modal 外框承擔，動作改內容底部提交列。

### A. Spec-derived 新增

- **store-settings 去頁首（D067）**：移除全域導航 `<header id="sidebar">`、麵包屑、page-intro（標題／副標）；原頁首動作改成內容底部 `.ss-actionbar` 提交列（See as fan ｜ Discard ｜ Save changes，sticky 底部）＝spec 5.1.5.5 F1 設定動作與預覽。標題與關閉改由 embed-modal 外框（`embed-modal__head`）承擔。
- **popup 關閉接線**：iframe 內 Save／Discard 改以 `window.parent.postMessage('ztor:storeset-close')` 通知父頁關閉；`e-shop.html` storeset 區加 `message` 監聽呼叫既有 `closeSet()`。修掉原 Discard 的 `href="e-shop.html"`（在 iframe 內會把 e-shop 載進 iframe）。
- **D065 命名收尾**：`e-shop.html` 麵包屑改單節「E-Shop」（落地頁，§3.2.1 單節規則）；`store-settings.display.empty-hidden` 文案「商品管理／product management」→「電子商店／E-Shop」。

### C. 撤除 / 變更

- store-settings.html 不再是帶導航的獨立整頁；定位為 popup-only（直接開檔將無 nav，符合 D065）。移除其 `sidebar.js` include。

### D. Infra / 文件

- **1 元件變更**：`store-settings.css` 加 `.ss-actionbar`（popup 提交列，token 驅動、無裸色）；同步 design-system.md / design-system.html §4.48（Purpose／Anatomy／Classes／Evidence／demo 由「獨立頁」改 popup）＋ inventory 表。
- 全站 cache `?v=` 升 `20260615e`；`check_ds_sync` PASS（WARN 為既有 selection-card 裸色例外，非本次）。
- 待確認（呈現假設）：popup iframe 的語言／未儲存變更同步——見 ASSUMPTIONS。

---

## 2026-06-15 · E-Shop F3 改版：狀態篩選附數量＋建立分割按鈕＋See as fan 改 F5 右側常駐欄（A spec · 5.1.5 F3／F5 / D066）

> 依使用者「針對 F3 做修改」，把電子商店主工作列對齊 spec 最新的 D066 三項調整。See as fan 採使用者裁示「右側常駐、不收合」。

### A. Spec-derived 新增

- **狀態篩選附數量（D066）**：每個狀態選項顯示目前類型下的商品數（All 4／Live 3／Low Stock 1…），切 tab 重算（讀清單列 `data-status`，Shop 開關改隱藏時同步重算）。選項文字＋數量改由 JS 管理（移除 `data-i18n` 以免覆寫數量）；數量是否隨搜尋連動 spec 待確認，本輪不連動。
- **建立鈕改 context-aware 分割按鈕（D066）**：新 `split-button` 元件——主鈕隨目前 tab（Products→建立商品／Bundles→建立組合／Auctions→建立拍賣）切換標籤與連結，右側箭頭下拉一律列全部三類。
- **See as fan 抽出 F3 → F5 右側常駐欄（D066）**：版面改 `.eshop-layout`（左主欄管理區＋右側 aside 常駐 See as fan，重用 `.ss-fan`）；**不收合**（使用者裁示），窄螢幕（≤1100px）改上下堆疊。移除工作列的 See as fan 鈕與原滑出面板（`#eshop-preview` / `preview-panel--inset`）及其開關 JS。
- `i18n.js`：新增 `e-shop.create.product/.bundle/.auction/.more`、`e-shop.preview.sub`（en+zh）。

### C. 撤除 / 變更

- See as fan 從 F3 工作列移除（改 F5）；`＋ New ▾` 單一下拉改為 context-aware 分割按鈕。

### D. Infra / 文件

- **1 新元件**：`split-button.css`（主操作＋箭頭選單 molecule，組合 btn＋dropdown-menu）；同步 design-system.html（demo＋TOC＋head）＋design-system.md＋BUILD-SPEC 元件表。
- 待確認（spec 標）：狀態篩選數量是否隨搜尋連動、See as fan 是否即時反映未存變更——見 ASSUMPTIONS UIA-021。
- 全站 cache `?v=` 統一升版；check_ds_sync PASS。

---

## 2026-06-15 · E-Shop 全段對齊：導航 IA＋商店設定 popup＋商品細節 D064＋訂單雙狀態軸＋套組驗證（A spec · 5.1.5 及其分頁 / D064 / D065）

> 依使用者「依 5.1.5 及其分頁修改 r2.1」，把電子商店主頁與子頁一次對齊到現行規格。範圍＝全部一次做完。沿用既有元件，新增兩個小元件（status-axes、embed-modal）並同步 design-system。互動皆前端 demo（無後端）。

### A. Spec-derived 新增

- **導航 IA（D065）**：`sidebar.js` 把「商品管理」改名「電子商店」、E-Shop 下拉由三項收成兩項（電子商店／訂單管理），商店設定移出下拉；store-settings.html 改由 `match` 高亮。`i18n.js` `nav.manage-eshop` 改「電子商店／E-Shop」。
- **商店設定 popup（D065 / 5.1.5 F3）**：`e-shop.html` F3 工作列加「商店設定」鈕，以新 `embed-modal`（全螢幕、iframe 內嵌 store-settings.html、lazy 設 src、Esc/backdrop/× 關閉）就地開啟，不離開清單、關閉保留篩選脈絡。
- **E-Shop 清單 D064 指示**：限量列 Stock 改顯示在庫/上限進度（21/50）＋`data-edition`；多規格列加「N variants」neutral badge。
- **商品細節頁（5.1.5.1 §2.3 / D064）**：新增「庫存、取貨與購買設定」卡——庫存版本 Edition、取貨方式（物流 重量/尺寸/出貨分類/寄件地 ‖ QR 領取）、每人限購、商品標籤；重用建立商品的 `.segmented`/`.switch`/`tag-input` 與 `cp.*` i18n，條件顯示 `data-when-edition`/`-delivery`。
- **訂單雙狀態軸（5.1.5.3／.3.1 §2.2 / PCR-001 解決）**：新 `status-axes` 元件——orders 列並排「履約＋付款·結算」雙 badge、order-detail 頁首大寫標籤雙軸（不混用，§7.2）。
- **訂單詳情履約分支（§2.5 / D064）**：demo segmented 預覽物流／QR 領取（Mark received）／數位交付狀態三種履約呈現；§2.3 每人限購結果唯讀；§2.6/D041 v1 退款鈕停用＋說明（爭議保留）。
- **建立套組驗證（5.1.5.4 §6.3/§6.4）**：套組庫存＝min(成員) 即時顯示、固定價≤成員合計驗證＋省下金額（超過擋 Create）、成員限量/多規格相容性提示、Create gating 加 name＋price。
- `i18n.js`：新增 `e-shop.btn.storeset`／`storeset.*`／`row2.variants`／`row.limited`、`orders.pay.*`／`status.delivered`、`od.axis.*`／`item.limit`／`ful.preview·shipping·qr·digital`／`qr.*`／`dig.*`／`refund.v1`、`product-detail.inv.*`、`cb.stock.*`／`note.*`／`price.*`（en+zh）。`icons.js` 的 `qr-code` 沿用。

### C. 撤除 / 回退

- 商店設定**回退**為電子商店頁 popup（D065 部分回退 D028 的「升為 header 子頁」）；header E-Shop 下拉移除「商店設定」子項。

### D. Infra / 文件

- **2 新元件**：`status-axes.css`（訂單雙狀態軸 molecule）、`embed-modal.css`（全螢幕 iframe popup organism）；同步 design-system.html（demo＋TOC＋head link）＋design-system.md＋BUILD-SPEC 元件表。
- 待確認（spec 標、僅顯示層 demo，不寫回 documents）：QR 核銷機制、每人限購 enforcement／退款回補、Shipping Categories 來源、數位限量下載權、多規格逐規格呈現範圍、bundle 右側預覽是否存在、%off 算法、商品 media/交付細節（R2.1.1）——見 ASSUMPTIONS UIA-018/019/020、PCR-001（已解決）。
- 全站 cache `?v=` 統一升版；check_ds_sync PASS。

---

## 2026-06-15 · 建立商品流程補四能力＋多規格（A spec · 5.1.5.2 v2.6 / D063 / D064）

> `create-product.html` 原停在 spec v2.4。依規格 v2.5（D063 多規格）＋v2.6（D064 庫存版本/取貨方式/每人限購/標籤）補齊。全程沿用既有元件，新增兩個小元件並同步 design-system。互動為前端 demo（無後端）。

### A. Spec-derived 新增

- **§4.1④ 多規格 Variations（僅實體）**：`.segmented` 切單一/多規格；多規格時隱藏單一價格庫存、改顯示「選項建構器（選項名＋值 chip，自動生成所有組合）＋逐規格表（價格/庫存/SKU/單件成本，可排除組合）」，單一↔多規格擇一不並存（D063 對齊 Shopify）。
- **§4.1⑤ / §4.2 庫存版本 Edition（實體＋數位）**：不限量/限量 `.segmented`（與庫存狀態兩軸分離，D064）。限量補上限 Total Quantity；實體留目前在庫，數位限量補剩餘份數；不限量數位無在庫欄。多規格限量時逐規格表多出上限欄（`.variant-table--limited`）。
- **§4.1⑥ 取貨方式（僅實體）**：物流（重量/尺寸 L·W·H/出貨分類/寄件地）‖ 現場 QR 領取（領取說明）`.segmented` 二擇一；寄件地留空沿用商店設定 F5。
- **§4.5 共用設定（三型）**：每人限購 switch＋每人最大購買量、商品標籤 `tag-input`（自建/選既有）。
- **就緒檢查改依狀態動態**：多規格→每個啟用規格有價格庫存；限量→上限≥在庫；物流→重量/尺寸/寄件地；限購→每人上限。pending 項（拍賣起標價/結標/資格）仍不擋。
- `i18n.js`：新增 `cp.var.*`／`cp.edition.*`／`cp.total*`／`cp.delivery.*`／`cp.shared.*`／`cp.limit.*`／`cp.tags.*`／`cp.stock.digital`／`cp.pv.from`（en+zh），`cp.stock` 改「Goods in stock／目前在庫」。`icons.js` 補 `qr-code`。

### D. Infra / 文件

- **2 新元件**：`variant-builder.css`（選項建構器＋逐規格表，organism）、`tag-input.css`（標籤，molecule，組合自 chip）；`chip.css` 補可移除變體 `.chip--removable`/`.chip__remove`（tag-input 與多規格值共用）。三者同步 design-system.html（demo＋TOC＋head link）＋design-system.md＋BUILD-SPEC 元件表。
- 條件顯示統一：頁面用 `data-cp-show`（型別）＋`data-when-var`/`-edition`/`-delivery`（子狀態），單一 `applyVisibility()` 求值，取代舊的逐 `data-cp-show` 切換。
- 待確認（spec 標、僅顯示層 demo，不寫回 documents）：選項數上限、單件成本納毛利、硬性必填 vs 建議劃分、QR 核銷、Shipping Categories 來源、限購 enforcement/退款回補、數位限量下載權——見 ASSUMPTIONS UIA-016/UIA-017（D064 §8.12 / D026）。
- 全站 cache `?v=` 統一升版；check_ds_sync PASS。

---

## 2026-06-15 · 補齊規格已有但 site 未建的 5 頁（A spec · 5.1.2.2 / 5.1.4.1 / 5.1.6 F5 / 5.1.7 F7・F8）

> 依使用者「規格有的都補齊」，把上游已定義、site 還沒建的頁面一次補上。皆對齊規格、缺定義處標待確認、用示例資料；以平行子代理各建一頁、主代理序列整合共用檔。全部用既有元件、**0 新元件**（無需動 design-system）。

### A. Spec-derived 新增（新頁）

- **project-detail.html（5.1.2.2 專案詳情）**：Overview／Content／Public details／Money 四分頁；狀態時間軸、合作者分潤、收益瀑布、淨利池手動分配、募資監看、NFT 治理唯讀；金額引用 Earnings §7.3 不重算。入口＝projects.html 列。
- **register-ip.html（5.1.4.1 登錄 IP）**：四步精靈 Type & Info → Usage Rules → Pricing & Earnings → Review＋發布前檢核 gating（比照 create-event 骨架）。入口＝my-ip「Add your IP」、ip-market 冷啟動「List your IP」。taxonomy／地區互斥／計價單位／Proof 驗證／送出文案標產品待確認（D037）。
- **event-detail.html（5.1.6 F5 活動詳情與營運）**：7 分頁——總覽／票種設定／名單與報到（三色 valid綠·used黃·invalid紅）／退款與招待票／通知／成本與營收（accrued→settled）／系列（轉售 Phase2）。規格已定者落地、退款吸收順序與轉售標待補。入口＝events 已發布列。
- **fan-detail.html（5.1.7 F7／F9–F12 粉絲詳情）**：行為時間線、消費、活動專案參與、標籤與名人堂 peak tier。
- **tier-settings.html（5.1.7 F8 分級與權益設定）**：雙閘門檻、行為加權、Benefits 編輯、規則與版本；雙閘驗證與版本邏輯只呈現、不自創（標 TBC）。入口＝fans-crm 列詳情、Tier settings／Edit benefits。
- `i18n.js`：新增 project-detail.*／ri.*／event-detail.*／fan-detail.*／tier-settings.* 共約 ~340 key（en+zh）。全站 cache → `?v=20260615b`。

### D. Infra / 文件

- 0 新元件：頁面專屬版面 hook 留各自頁內 `<style>`（比照既有 create-flow 慣例）；check_ds_sync PASS（48 元件不變）。
- 入口頁僅加連結：projects.html／my-ip.html／ip-market.html／events.html／fans-crm.html。Playwright 確認 5 頁皆載入、中文生效、無裸 key、0 console error。
- 示例資料與待確認項見 ASSUMPTIONS（register-ip taxonomy 等、event-detail 退款/轉售、tier-settings 驗證/版本）。

---

## 2026-06-15 · 設定新增 F7 合規（唯讀）分頁（A spec · 5.1.9 F7）

> 5.1.9 F7 合規（Compliance，唯讀）規格本已定義、site 未落地（PG-007 的一部分；F7 非缺規格）。本輪把它做出來，對齊既有規格、未新增產品規則。KYC／2FA／收款方式／Webhooks 等**流程**仍缺 5.1.9.x 子流程規格，未做。

### A. Spec-derived 新增

- `settings.html`：左側 nav 加「合規（Compliance）」項；新增 `#compliance` 唯讀 section，四區塊——KYC 狀態（已驗證 badge＋12 個月到期＋「在付款管理」連結，KYC 唯一可變更處在 F5）、用量上限（年度提款額度／月結算量，重用 `.completeness` meter，逼近上限示警）、凍結（空狀態示意）、地區限制（歐盟受限示意）。頂部標「數值由合規引擎掌管、此處唯讀」＋「示例資料」。
- 無新元件（重用 settings-nav／settings-row／badge／completeness）；補 `completeness.css` link 至 settings `<head>`。`i18n.js` 新增 `settings.comp.*` key（en+zh）。示例日期/金額為展示資料（UIA-003）。

---

## 2026-06-15 · 建立活動即時預覽＋自動儲存＋草稿軸（A spec · 5.1.6/5.1.6.1 / D060）

> 建立活動的 3 項 D032 待協調與活動清單 D033 經使用者裁示定案（D060）：即時預覽套用、自動儲存＋狀態與手動並存、Quality check 五項發布硬閘、草稿改由狀態軸管（方案 c）。先走 design-spec-writer 寫進 5.1.6.1 v3／5.1.6＋記 D060＋backup Plan111，再以 project-ui-creator 實作。

### A. Spec-derived 新增

- `create-event.html`：(1) **即時預覽**（§5.2.5）——頂部 Preview 鈕開粉絲視角活動卡側滑面板（海報／名稱／類型／日期＋場地／票種摘要隨輸入即時更新）；(2) **自動儲存**——頂部「●已儲存·剛剛／儲存中…」狀態指示，底部 Save for later → 「Save & exit（儲存並離開）」；(3) **發布硬閘**——維持 QC 五項全過才可 Publish，另加各 ＊ 欄位 on-blur inline 錯誤＋Publish 前彙整未過 ＊ 阻擋。
- `events.html`：**D033 採方案 c**——移除 Drafts 時段分頁（時段只剩 Upcoming／Past）；草稿改由狀態軸（All／On Sale／Draft），選 Draft 跨時段顯示所有草稿、其餘狀態不含草稿。
- 新元件 `ds-components/event-preview-card.css`（粉絲視角活動卡，面板重用 preview-panel.css）；design-system.html（4.22p）＋TOC＋design-system.md 同步。`i18n.js` 新增 `ce.preview.*／ce.pv.*／ce.save.*／ce.err.*` 等 key（en+zh）。

---

## 2026-06-15 · IP 詳情頁交易呈現降級為「權利資訊＋詢問」（C 撤除 / 對齊 5.1.3.1）

> ip-detail.html 先前把租用/競標畫成結帳（escrow fee、Total due today、Place bid 下標），違反 5.1.3.1 §3.3.5（預估不得呈現為已確認）、§3.4.3/§3.4.4（送出＝建 Draft、非完成授權）與 PG-001/002（站內付款/競標規則未定）。本輪把頁面修回規格本意，未新增產品規則。

### C. 撤除（intentional removal）／對齊

- 租用卡：移除「Platform escrow fee」與「Total due today」結帳式拆分 → 改「Estimated total」＋「Estimate only — not a charge」說明（§3.3.5）。
- Send rental request：保留按鈕，法律說明改為「建立 Draft 授權、進權利人核准佇列，雙方核准且條款齊全前不構成授權」（§3.4.4）。
- 競標區：移除下標輸入與「Place bid · $…」結帳鈕；改為「Bidding is preview-only in R 2.1」提示＋「Message owner about this slot」詢問鈕；最高出價/出價紀錄保留為示意展示（PG-002）。
- `i18n.js`：改 `ip-detail.bd.total`／`legal-note`，新增 `bd.estimate-note`／`bid.preview-note`／`bid.enquire`（en+zh）。未新增元件（重用 stickynote/button/badge）。ASSUMPTIONS PCR-003／PG-010 標已解決。

---

## 2026-06-15 · 群發訊息工具落地（A spec · 5.1.7.1 v2 / D058）

> 群發訊息（Message your fans）5.1.7.1 的 5 項產品待確認經使用者裁示定案（D058：收件族群範圍、主旨 ≤120／內文 ≤2000、排程＝現在+15min·帳號時區、訊息狀態 Scheduled/Sent/Failed 不併 §7.2、通知走通知中心+Email 可退訂但合規不可退）。據此把先前缺的群發頁建出來。先走 design-spec-writer 把定案寫進 5.1.7.1（移除待確認）＋記 D058＋backup Plan110，再以 project-ui-creator 建工具。

### A. Spec-derived 新增

- `fans-crm.html`：新增**群發訊息 modal**（重用 `.payout-modal` 外殼），Compose（收件分群單選＋主旨/內文含字數計數＋token chip＋排程開關）＋ History（Time/Subject/Audience/Recipients/Open rate/Status，Failed 顯示原因＋Retry）。三入口 wire：page-intro Message segment→All fans、at-risk alert Message them→At risk、列級 send icon→該粉絲。互動為前端 demo（開關/tab/計數/token 插入/排程切換/送出→History 插列）。
- 新元件 `ds-components/message-modal.css`（含 `.msg-compose`/`.msg-field`/`.msg-schedule`/`.msg-history`/`.msg-row`，及可重用的 `.char-counter`、`.msg-token`）；design-system.html（4.22m/n/o）＋ TOC ＋ design-system.md 同步；補 payout-modal.css 至 fans-crm `<head>`。
- `i18n.js`：新增 `msg.*` 群發 key（en+zh）。

### D. Infra / 文件

- 規格層：5.1.7.1 v1→v2、decisions D058、backup_plan Plan110。收件人數與示例訊息為展示資料（ASSUMPTIONS：群發頁定位）。
- 列級 send 鈕預設帶入「該粉絲單人」模式（To 可再切分群）；排程下限/時區為示意，未做驗證（前端 demo）。

---

## 2026-06-15 · 對齊規格 5.1.3 / 5.1.6 / 5.1.7 / 5.1.9 的安全項（A spec）

> 依使用者指示對照 IP 市場、活動、粉絲關係、設定四模組規格，補上「呈現層可直接做」的缺口；交易降級、即時預覽、群發訊息頁、KYC/合規子流程等卡產品決策的項目這次跳過，記入 ASSUMPTIONS（PG-007~PG-010）。4 模組以平行子代理改各自頁面與新元件，共用檔（i18n/design-system/cache）由主代理序列整合。check_ds_sync PASS、Playwright 抽查四頁互動正常。

### A. Spec-derived 新增

- **設定（5.1.9）**：刪除帳戶文案改 30 天 soft-delete 可復原（對齊 D053，原文「永久無法復原」為錯誤）；通知改**事件×管道矩陣**（補 In-App 第三管道、payout/KYC/compliance 的 Email 鎖定為開）；新增寄測試、勿擾時段、Active Sessions、未存離開提示、稅務 Edit 入口、整合補 Stripe/GA 與失敗一致呈現。
- **IP 市場（5.1.3）**：清單頁加搜尋框（F1）、Availability 三態篩選（F2）、卡片素材包完整度（F3/§7.7）、冷啟動空狀態與無結果空狀態（語意分離）。ip-detail.html 未動（PG-010）。
- **粉絲關係（5.1.7）**：父頁 Leaderboard|Hall of fame tab 切換、View explanations、F3 Pareto 自動洞察行、F5 列級訊息/詳情入口與 Recovered 狀態、F6 即時過濾＋Load more、F4 流失橫幅改條件顯示。群發訊息頁（5.1.7.1）未建（PG-008）。
- **活動（5.1.6）**：清單頁副標對齊規格；建立流程 Review 摘要回填、Quality check 隨輸入即時打勾與 Publish 就緒閘門、圖片/票種填入 demo。即時預覽/自動儲存未做（PG-009）。
- **新元件（promote + 三件套）**：`notification-matrix`、`completeness`、`insight-row`、`list-footer` 進 ds-components + design-system.html demo/TOC + design-system.md；順手補回漏登的 `empty-card` 條目。i18n 新增四模組 key（en+zh），並修正 3 條過時 settings key。

### D. Infra / 文件

- 全站 cache-buster 統一 `?v=20260615a`；icons.js additively 補 `send`、`smartphone`。
- 卡產品決策項記入 ASSUMPTIONS（PG-007 設定子流程/F7、PG-008 群發訊息、PG-009 建立活動 D032/D033、PG-010 IP 詳情降級）與呈現假設 UIA-009~012。

---

## 2026-06-15 · 陰影裸色收斂成 token（D 文件 / token 紀律）

> check_ds_sync 的 token-紀律 WARN 原有 18 處硬寫 `rgba(...)` 陰影/描邊，散在 7-8 支既有元件，沒走 token——亮模式視覺對，但暗模式那些黑色陰影是壞的（看不到）。本輪把它們收斂成 token。為什麼這樣做：補上設計系統缺的「低階控件陰影」階，亮模式維持原樣、暗模式陰影自動適配；只剩 3 處主題縮圖（selection-card）是不可消除的例外（必須畫真實主題色），在 design-system.md 註記為已承認例外。

### D. Infra / 文件

- `ds-components/_tokens.css`：新增 `--shadow-raise`（`0 1px 2px /0.06`，暗 `0.5`）、`--shadow-raise-strong`（`/0.16`，暗 `0.6`）、`--border-inverse`（`rgba(255,255,255,0.1)` 永遠暗底用）、`--overlay-tint`（`rgba(0,0,0,0.45)` modal 背板染色，配 `--overlay-blur`）。
- 換 token（10 支元件，亮模式幾乎不變，數值差 <0.03 alpha）：`button`(primary)/`input`(hover ring→`--border`、4 處 drop→`--shadow-raise`)/`segmented`/`badge`(ring→`--border`)→raise；`switch`/`chart`(marker)→raise-strong；`card`(hover)→既有 `--shadow-card-hover`（原本就是同值硬寫）；`footer`→`--border-inverse`；`readiness`(`#fff`)→`--foreground-on-inverse`；`payout-modal`(背板)→`--overlay-tint`。
- `design-system.md`/`design-system.html`：§1.5 Shadow 加 `--shadow-raise`/`-strong`/`-card-hover` 列＋視覺 swatch；加「Edge & overlay tokens」與「Raw-color exceptions（已承認 WARN）」段，記 3 處主題縮圖為不可消除例外。
- 驗證：check_ds_sync **裸色 WARN 18→3**（只剩 selection-card 主題縮圖，已註記）；其餘 5 項 PASS；Playwright 亮+暗模式截圖確認 button/card/badge/segmented/switch 無回歸、暗模式陰影現在會適配（`screenshots/20260615-shadow-light.png`／`-dark.png`）。全站 `?v=` bump m→n。

---

## 2026-06-14 · Dashboard 對齊 5.1.1 新約束：F3 去狀態欄 + F2 週環比 + F4 Snoozed/阻斷（A spec · 5.1.1）

> 規格 `documents/5.1.1-儀表板.md` 於 2026-06-14 21:51 更新引入三條呈現約束，原型尚未跟上。本輪只動 Dashboard 內容區，沿用既有共用渲染器（components.js）與元件，不重造。

### A. Spec-derived 新增

- **F3 近期收入（spec §F3 第 54 行）**：「只取已結算（settled）收入、狀態恆為 settled、不另列狀態欄」。`transaction-list` 渲染器加 `hideStatus` per-call 旗標（`txRow(r, hideStatus)`），`dash-recent` 設 `hideStatus:true` 並改為 settled-only 五列（換掉原本 Pending 的 preorder/tickets，新增 settled 的 IP 版稅、已結算活動票券批次）。Earnings 的 `earn-recent` 不傳旗標、狀態欄不受影響——共用渲染器、per-call 控制。
- **F2 當前總收入（spec §F2 第 37 行）**：環比由月粒度「較十月 +18.4%」改週粒度「較上週 +12.6%」；新增最後更新時間並深連結 Earnings（`Updated 2h ago · view in Earnings`→`earnings.html`）。`kpiTile` 放寬為 delta 與 metaLink 可並存、delta 支援 `neg`（接既有 `.kpi__delta--neg`，靜態維持正成長）。除零「new」/NaN 保護屬 runtime 邏輯，靜態原型不觸發。
- **F4 今日待處理（spec §F4 第 86 行）**：`alertCard` 加 `snoozed`（軟關資訊型，`.alert--snoozed` 淡化約 62%）與 `blocking`（合規阻斷型，關閉鈕 `disabled`＋鎖頭、提示去來源模組）。`dash-alerts` 把 Spotify 改 Snoozed、新增一筆稅務阻斷示例；維持 F2 待處理計數＝Open+In progress 排除 Snoozed＝4（3 open · 1 in progress）。

### D. Infra / 文件

- `ds-components/alert.css`：加 `.alert--snoozed`（淡化）與 `.alert__close:disabled`（dimmed＋not-allowed）。`i18n.js`：改 `ops.revenue-meta`、新增 `ops.revenue-delta`、`tx.iproyalty.*`、`tx.tickets-settled.*`、`alert.payout-block.*`，改 `alert.spotify.meta`（→Snoozed）。`index.html`：更新 F3 註解、全站 cache `20260614m→n`。
- `design-system.html`/`design-system.md`：Alert 加 F4 states demo（snoozed/blocking）＋Class API；KPI 加「delta+link 並存」demo（F2）；Data list 補 transaction-list 狀態欄 per-call 說明。`requirements-map.md` 更新 5.1.1 列；`ASSUMPTIONS.md` 新增 PG-006（缺完整待辦/動態視圖頁）。
- 驗證：`check_ds_sync.py` 全 PASS；截圖見 `screenshots/dashboard-f3-f2-f4-20260614.png`。

---

## 2026-06-14 · E-Shop 商品管理互動化 + 補貨流程（A spec · 5.1.5 / 5.1.5.6）

> 依 5.1.5（E-Shop 主頁）與新子流程 5.1.5.6（補貨）把 R2.1 補齊。`e-shop.html` 原為靜態骨架，規格 F3/F4 的互動都沒接；補貨流程完全沒做。本輪全部以前端 demo 接上（無後端），並沿用既有元件（payout dialog 外殼、preview-panel、product-list、tabs），不重造。

### A. Spec-derived 新增

- `e-shop.html` 互動化：Products/Bundles/Auctions **tab 切換**（`data-eshop-tab`/`-panel`）；**搜尋＋狀態篩選**作用於目前分頁（列加 `data-name`/`data-status`，狀態用 §7.2）；**Shop 開關→狀態**（關＝Hidden，badge 即時換、可還原）；**See as fan** 分割預覽（重用 `.preview-panel--inset`＋`.ss-fan`）；**Bundles 清單**（新 `.product-list--bundles` 格線，2 筆範例，庫存＝min 成員）；低庫存/售罄實體列加**補貨**動作鈕；低庫存橫條 CTA 兼補貨入口。移除商品列過時的「Drag to reorder」字（排序已移商店設定 F3，D031）。
- **補貨流程（5.1.5.6）**：新 `partials/restock-modal.js`（popup，重用 `.payout-dialog` 外殼＋`.payout-form-grid`）＋新 `ds-components/restock-modal.css`（唯一新 class `.restock-items`/`.restock-item`）。選品項（預勾低庫存/售罄）→數量/供應商/到貨/備註→送出進「補貨中」、到貨確認還原（demo）。掛載於 `e-shop.html` 與 `product-detail.html`（細節頁 Restock 鈕接上）。
- `icons.js`：新增 `truck`、`boxes`。`i18n.js`：新增 `restock.*`、`e-shop.row.{out,hidden,restocking}`、`e-shop.restock`、`e-shop.preview.*`、Bundles `e-shop.col.*`/`e-shop.b1.*`/`e-shop.b2.*`；改 `e-shop.row1.meta`（去掉 reorder）、`e-shop.empty.*`（改 Auctions 待補文案）。

### D. Infra / 文件

- `design-system.html`/`design-system.md`：新增 §4.29c Restock checklist（`.restock-items` demo＋TOC＋compose＋inventory，DS 自動同步產生）。`BUILD-SPEC.md`：E-Shop 行升為互動化＋Bundles＋補貨，新增 Restock dialog 元件列、Preview panel 註記 E-Shop 重用，開放項改 Auctions 待 D026。`requirements-map.md`：5.1.5 更新＋新增 5.1.5.6 列。`ASSUMPTIONS.md`：UIA-006（補貨 popup/入口/demo）、UIA-007（建議量與狀態重算為顯示層、口徑依 §7.2）、UIA-008（Bundles 庫存＝min 成員顯示）。

---

## 2026-06-14 · Breakdown 去凌亂：報表式 waterfall + 本期間/依專案 toggle + 淨利卡捷徑（B 反饋）

> 反饋：Breakdown 兩條全寬 waterfall（F12 11 列 + F11 6 列）每列都有 bar，疊起來像一面 bar 牆、很凌亂。查 Mobbin（Wave/Posh/QuickBooks/HoneyBook）確認收益拆解的慣例是「會計報表式」——分組＋小計加粗＋明細純文字，bar 只留里程碑。為什麼這樣改：(1) 把 waterfall 改報表式，bar 只留里程碑（income/subtotal/pool/distribution），扣項變純文字縮排列，bar 牆消失；(2) 加 segmented「本期間/依專案」一次只顯示一個拆解，密度砍半（對齊 Monarch 視角切換）；(3) 順手把 F3 淨利卡接上「View breakdown →」捷徑，補上「數字→怎麼來的」入口（沿用既有 data-tab-jump，比照 Request payout → Payouts）。

### B. 反饋導入

- `ds-components/waterfall.css`：`--deduct` 列改報表式——隱藏 bar、縮排 14px、收緊行距；bar 與粗體只留 income/subtotal/pool/distribution。**此為元件預設**，連帶讓 F11 與 F7 交易小階梯一起變乾淨。
- `earnings.html` Breakdown：頂部加 `.segmented`「This period / By project」（重用既有 segmented，無新 CSS）；F12、F11 各包進 `<div data-bd-section>`（純 div，`[hidden]` 才有效，避開 `.bento{display:grid}` 陷阱）；新增 toggle IIFE 切換顯示。
- `earnings.html` F3：Net income 卡加 `<a class="kpi__link" data-tab-jump="breakdown">View breakdown →</a>`（既有 tab-jump listener 處理跳轉，無 JS 變動）。
- `ds-components/kpi.css`：新增 `.kpi__link`（低調 view-more 連結，釘卡底、hover 由 subtle 轉 foreground，可重用——可提領卡日後接 Request Payout 也用它）。
- `i18n.js`：`earnings.kpi.net-link`、`breakdown.toggle.period`、`breakdown.toggle.project`（en＋zh）。
- `design-system.md`/`design-system.html`：§4.24b waterfall 改述報表式（bar 只留里程碑、扣項純文字）；§4.12 KPI 加 `.kpi__link`（anatomy/state/class API/demo）。
- 驗證：check_ds_sync PASS（41 元件、版本一致、TOC 全解析、kpi/waterfall 無新增裸色）；i18n key 全命中；JS 語法 OK；Playwright 三項都過——報表式 F12（截圖 `screenshots/20260614-breakdown-period-statement.png`）、toggle 切 F11（`20260614-breakdown-by-project.png`）、淨利卡點擊跳 `#breakdown`。全站 `?v=` bump l→m。
- 取材：Mobbin web — [Posh P&L](https://mobbin.com/screens/9d74ad25-145a-4a1a-b5bd-6407aaf77ddb)、[Wave 報表](https://mobbin.com/screens/cd3b0820-57cd-4168-b6c2-12829a26af51)、[QuickBooks P&L](https://mobbin.com/screens/c86343a5-ae77-439b-84b3-d6943e25e5fc)、[Monarch 視角切換](https://mobbin.com/screens/ad1708a5-829c-41b4-8aa1-621655218be9)；只借版面與互動方向，產品口徑仍依上游。

---

## 2026-06-14 · 交易表逐筆可追溯：Event ID＋費率版本＋逐筆金流瀑布（A spec · 5.1.8 F7 #7/#8/展開）

> 規格 F7 要求每筆交易能追溯：費率版本（Configuration Version §7.6）、Event ID（可複製 §7.6）、單筆可展開該筆自己的金流瀑布。本輪把這三項做進 Transactions 交易表。為什麼這樣做：用「可展開列」把追溯細節收進每列底下，主表維持乾淨（日期/項目/金額·匯率/狀態/手續費/淨額）；逐筆小瀑布重用既有 `waterfall` 元件（同一條降階邏輯，免新元件）。

### A. Spec-derived 新增

- `ds-components/table.css`：擴充 Table 元件，新增**可展開列** variant——`.ztor-table__row[aria-expanded]`（可點＋`.ztor-table__chev` 轉 90°）＋相鄰 `.ztor-table__detail[hidden]`，詳情容器 `.tx-detail`/`__meta`/`__id`/`__copy`/`__note`/`__ladder`（Event ID `<code>`＋複製鈕、費率版本、註記、`.waterfall` 小階梯）。無裸色、全 token。
- `earnings.html` Transactions：7 筆交易列改為可展開；收入列展開＝Event ID＋費率版本＋該筆小瀑布（該筆收入→平台費→支付費→該筆淨額，重用 `waterfall`）；提款/手動補登/退款列展開＝Event ID＋對應註記（手動標未驗證不計入 §7.3、退款爭議凍結 §7.3）。新增 toggle＋複製 Event ID 的 controller IIFE。
- `i18n.js`：新增 `tx.detail.*`（13：eventid/ratever/copy/copied/gross/platform/payment/net/nofee/payout-note/manual-note/refund-note）en＋zh。
- `design-system.md`/`design-system.html`（§4.23 Table）：Anatomy/Variants/States/Class API/Token/demo 同步可展開列（demo 以展開態呈現）。
- 驗證：check_ds_sync PASS（41 元件、版本一致、TOC 全解析、table.css 無裸色）；i18n key 全命中；JS 語法 OK；Playwright 截圖 `screenshots/20260614-earnings-tx-expand.png`（首列展開：Event ID＋cfg-2026.02＋小瀑布）。全站 `?v=` bump k→l。
- 規格層同步：F10 去重複（5.1.8 F10 瘦身成概述＋引用 §7.3、5.1.8.2 去重述兩句、backup_plan Plan107），§7.3 為計入口徑唯一來源。

---

## 2026-06-14 · Earnings UI 同步新規格：Breakdown 分頁（F12+F11）＋ F10 補登 popup（A spec · 5.1.8 / 5.1.8.2 / D050）

> 規格 D050 把 Earnings 改成五分頁、F10 改 popup 子頁（5.1.8.2），本輪把 UI 同步到位。為什麼這樣做：F12 金流瀑布從 Overview 移進新的 Breakdown 分頁、與 F11 單一專案收益拆解同頁，讓「全站收益拆解」集中一處；F11 的財務階梯重用既有 `waterfall` 元件（同一條降階邏輯，省一個新元件）；F10 補登改成由 F7 觸發的 popup，重用 payout 的 canonical dialog 外殼（規格 §4.29 明示重用、不另刻 modal）。

### A. Spec-derived 新增

- `earnings.html`：F2 分頁列加第五個 `Breakdown`（排 Transactions 後）＋ tab controller valid 清單加 `breakdown`；新增 `data-panel="breakdown"` 面板。
- **F12 移位**：金流瀑布整段從 Overview 移到 Breakdown 面板（markup 不變，沿用 `waterfall` 元件）；Overview 改回 趨勢 → 近期交易/收入來源 → pending note。
- **F11 單一專案收益拆解（新）**：Breakdown 面板下半，page-specific block 組合 `.card`＋專案 `.select`＋`waterfall`（專案財務階梯：專案總收入 → 直接成本 → 毛利 → 平台/支付費 → 合作者分潤 → 專案淨利，淨利用 `--pool` 強調）＋追溯說明＋View project / View transactions / Export 入口。無新元件。
- **F10 手動補登 popup（新）**：新增 `partials/manual-entry-modal.js`（重用 `.payout-modal`/`.payout-dialog` 外殼＋`.payout-form-grid`/`.payout-field`/`.input`/`.select`/`.stickynote`，無新 CSS）；表單欄位＝交易項目/收入分類/日期/金額/幣別/備註/佐證附件＋「標示未驗證、不計入可提領/提款/稅務（§7.3）」提示；`earnings.html` 加 modal host、partial script、controller IIFE（open/close/esc/backdrop，submit 為 demo 關閉），Manual entry 按鈕加 `data-manual-open`。
- `i18n.js`：新增 `earnings.tab.breakdown`、`breakdown.*`（16）、`manual.*`（15）（en＋zh）。
- `design-system.md`/`design-system.html`：waterfall「where seen」Overview→Breakdown＋註明重用於 F11 階梯；payout §4.29 Usage/files/purpose 註記 dialog 外殼已被 manual-entry modal 重用。
- 驗證：check_ds_sync PASS（41 支元件、版本一致、TOC 全解析、無新增裸色）；i18n key 全命中；JS 語法 OK；Playwright 截圖 `screenshots/20260614-earnings-breakdown-tab.png`、`20260614-earnings-breakdown-f11.png`、`20260614-earnings-manual-entry-modal.png`。全站 `?v=` bump j→k。

---

## 2026-06-14 · Earnings 補齊 F12 金流瀑布、F8 淨利池/退款準備金、提款不可逆閘門（A spec · 5.1.8 / 5.1.8.1）

> 依 `documents/5.1.8-收入管理.md` 與 `5.1.8.1-申請提款流程.md` 對齊缺口稽核，補上規格已定義但 R 2.1 尚未落地的四項：F12 金流瀑布、F8 淨利池與退款準備金摘要、提款 popup 的不可逆確認閘門、提款摘要的「本期金流摘要＋費率版本」兩列。為什麼這樣設計：瀑布用「running-balance 比例條」讓「總收入一路被扣到淨利池」一眼可讀（比浮動柱在靜態原型更穩、更易讀）；淨利池複述用既有 KPI/bento/stickynote 組（不另造元件）；不可逆閘門用 checkbox gate（提款不可逆，比 switch 更符合「簽署確認」語意）。F10 手動補登表單、F11 單一專案收益拆解、F7 可追溯欄位屬較大新面，留下一輪。

### A. Spec-derived 新增

- **F12 金流瀑布**：新增元件 `ds-components/waterfall.css`（`.waterfall` / `__row(--income|--deduct|--subtotal|--pool|--distribution|--negative)` / `__head` / `__name` / `__meta` / `__amt` / `__bar` / `__fill` / `.waterfall__empty`）。`earnings.html` Overview 趨勢圖下新增瀑布區（總收入 → 直接成本 → 毛利 → 平台/支付費 → IP 版稅 → 推薦分潤 → 淨收入 → Ztor 抽成 → 淨利池 → Creator/NFT 分配，11 列，口徑依 §7.3；數字與 F3 摘要卡一致，淨利池 $16,721）。`design-system.html`（§4.24b ＋ TOC ＋ compose-map）、`design-system.md`（inventory ＋ §4.24b）同步 demo/描述/Class API。
- **F8 淨利池 + 退款準備金摘要**：`earnings.html` Payouts 分頁在銀行卡與提款紀錄之間新增摘要卡（重用 `.card`/`.bento`/`.kpi`/`.stickynote`，未造新元件）：淨利池 $16,721（本期可分配 §7.3）、退款準備金 $0·0%（v1 未開放、欄位保留 D041）＋淨利池為負時暫停分配、不回收已撥款的提示。
- **提款 popup 不可逆閘門（5.1.8.1 §4.5）**：`partials/payout-request-modal.js` 摘要後新增 `.payout-confirm`（checkbox＋說明），CTA 預設 `disabled`；`ds-components/payout-modal.css` 加 `.payout-confirm`/`__box`/`__text`；`earnings.html` 控制器加 `syncSubmitGate()`（勾選才解鎖、每次開窗重置）。
- **提款摘要補列（5.1.8.1 §4.4 #7 #8）**：摘要新增「結算來源（12 settled events · §7.3）」與「費率版本（cfg-2026.02）」兩列。
- `i18n.js`：新增 `earnings.waterfall.*`（23）、`payouts.pool*`（7）、`payout.summary.settled`/`.cfgver`/`payout.confirm`（en＋zh）。
- 驗證：check_ds_sync PASS（41 支元件、版本一致、TOC 全解析、無新增裸色）；i18n key 全命中；Playwright 截圖 `screenshots/20260614-earnings-overview-waterfall.png`、`20260614-earnings-payouts-pool.png`、`20260614-payout-modal-confirm-gate.png`（確認未勾時 CTA disabled）。全站 `?v=` bump i→j。

---

## 2026-06-14 · 儀表板無資料空狀態＋ Cheat Codes 改 Data State（A spec · 5.1.1 §F2–F8 / D039）

> 規格 5.1.1 新增「頁面狀態」枚舉與各 F「其他狀態」段（D039），狀態軸定為 **無資料（Empty）／有資料（Has Data）**。本輪把儀表板的無資料狀態做進畫面：F2~F8 各有卡片內空狀態（淡化 icon＋短標題＋一行引導＋選配 CTA），由 `<html data-data-state="empty">` 與資料視圖互切。Cheat Codes（devtools）原 ONBOARDING FLOW 六階（Arrival/Profile…，截圖來的預覽佔位、非規格狀態）改為兩態 Data State，對齊規格。

### A. Spec-derived 新增

- 新增元件 `ds-components/empty-card.css`（`.empty-card` / `__icon` / `__title` / `__text` / `__cta`）——卡片內「已載入但無資料」空狀態，與整頁用的 `empty-stub` 區分。`design-system.html`（§4.22h）＋ TOC ＋ `design-system.md` 同步 demo／描述。
- `index.html`：F2~F8 各加 `.dash-empty-only` 空狀態區塊、資料體與 View-all 連結標 `.dash-data-only`；卡片標題在兩態都保留。
- `shared.css`：新增 data-state 切換規則（`.dash-empty-only` 預設隱藏、`html[data-data-state="empty"]` 翻轉顯示／隱藏）。
- `i18n.js`：新增 `dash.empty.{ops,earnings,alerts,activity,events,fans,ext}.*`（標題／內文／CTA，en＋zh）。

### D. Infra / 文件

- `devtools.js`：`ONBOARDING`（6 階）→ `DATA`（empty／has-data，預設 has-data）；section 標題 Onboarding Flow → Data State；URL 參數 `?onboarding=` → `?data=`；`<html>` 屬性 `data-onboarding` → `data-data-state`。
- `scenario.js`：儀表板情境橫幅**移除**——無資料引導已由 hero（F1）與卡片空狀態承接，橫幅多餘；`scenario.js` 只保留活動頁 Event Day 橫幅。
- 驗證：check_ds_sync PASS（40 支元件）；Playwright 確認 `?data=empty` 七區空狀態全顯示、資料體全隱藏，has-data 預設反向正常。截圖見 `screenshots/dashboard-empty-state-20260614.png`、`dashboard-empty-cards-detail-20260614.png`。

---

## 2026-06-14 · 商店設定門面改 Base44/FB 式身分帶＋逐欄就地編輯（B 反饋）

> 門面歷經四輪收斂：①緊湊雙欄(窄島)→窄又高退回；②滿版標準列→仍 529px 太高；③滿版雙欄→變矮但仍是表單；④最終（使用者選「逐欄就地編輯」）：改成 **Base44／Facebook 式身分帶**——封面＋疊加 logo 頭像＋店名／網址／簡介**平常是文字**，點某欄當場變輸入（✓/Enter 確認、✕/Esc 取消），整頁仍由頂部 Save 提交。品牌素材自然變成**封面＋頭像**本身（各自有編輯鈕），不再有獨立上傳框。取材走 skill 的 Mobbin MCP（web）：[Base44 讀取態](https://mobbin.com/screens/fbe4d015-ff2e-4c34-8c4b-88696b7ced97)/[編輯態](https://mobbin.com/screens/bb9c167b-1e9d-47d0-a036-b8f455889c2f)、[Sora 逐元素 pencil](https://mobbin.com/screens/a2a3729f-7caf-4071-930c-9f2f1117a5dc)、[Linktree](https://mobbin.com/screens/600850d4-05d3-4a56-ae06-b9bd34b61109)；只借版面與互動方向，欄位與規則仍依上游。

### B. 反饋導入

- `ds-components/store-settings.css`：移除上一版 `.ss-grid`/`.ss-cell`/`.ss-brand`/`.ss-asset`；新增身分帶 `.ss-identity-card`/`.ss-band__cover`/`__head`/`__avatar`/`__namewrap`/`__body`/`__meta`，與就地編輯 `.ss-edit`（`__read`/`__value`/`__pencil`/`__form`/`__actions`/`__count`/`__label`/`.is-editing`，含 name/url/bio/currency flavour）。
- `store-settings.html`：門面改身分帶；每欄位用 `.ss-edit`[data-ss-edit=text|textarea|select]（讀取態 span ↔ 編輯態控制項）。新增 inline-edit JS（點 read→editor、✓/Enter commit 寫回顯示文字、✕/Esc 取消、bio 計數），取代舊 bio-counter。
- `i18n.js`：新增 `store-settings.edit.save`/`.name`/`.url`/`.bio`/`.cover`/`.logo`（編輯鈕 aria）。
- `design-system.html`/`design-system.md`（§4.48）demo、描述、Anatomy/States/Classes/結構樹同步為身分帶＋`.ss-edit`。`ASSUMPTIONS.md` UIA-004 記四輪收斂、UIA-005 加入就地編輯為 demo 行為。
- 註：前幾版的 `.ss-grid`/`.ss-cell`/`.ss-brand`/`.ss-asset` 皆已移除。

---

## 2026-06-14 · 商店設定對齊 spec v8 章節編號（D 文件）

> 5.1.5.5 升 v8（D036）：頁型改「功能頁四段」，內容區塊由 §2.x 改為 **F1~F5**（F1 頁首與動作含 See as fan、F2 店面門面、F3 商品陳列、F4 付款、F5 出貨），並新增「頁面佈局」段。產品需求與既有 IA（D035）不變，故 UI 畫面**無需改動**；本輪只把指向舊章節號的交叉引用對齊新 F 編號，維持覆蓋對照誠實。

### D. Infra / 文件

- 比對確認 `store-settings.html` 已符合 v8：F1 頁首動作（副標 "Configure your shop appearance and preferences"、See as fan/Save/Discard）、F2 門面（含幣別載入預設未選）、F3~F5 tab、範例值（My Fan Store／creator-slug／****4242／免運 50）皆到位。
- 章節號 §2.x → F1~F5：`store-settings.html` 內註解、`requirements-map.md`、`BUILD-SPEC.md`（Preview panel／Store settings pattern／sitemap 頁表）、`design-system.md`/`design-system.html`（§4.48）。
- 歷史紀錄（本檔較早條目）維持原樣不改寫。

---

## 2026-06-13 · 商店設定改版資訊架構（A spec · 5.1.5.5 v6 / D035）

> 依 5.1.5.5 v6（D035）重排商店設定 IA：**店面門面常駐置頂**、**商品陳列／付款／出貨**為三個對等設定群組（一次處理其一）、新增**粉絲視角預覽（See as fan）**；門面新增**品牌素材**、幣別移入門面。spec 把 tab／畫面分割標為「呈現參考、非約束」，由本層（project-ui-creator）決定實際呈現。

### A. Spec-derived 新增

- `store-settings.html` 重構：
  - **店面門面** `.card` 常駐置頂：店名、商店簡介（200 字計數）、**品牌素材**（`.ss-brand`＋兩格 Upload tile，種類待上游確認）、商店網址、幣別（由原 Shop basics 移入門面）。
  - **設定群組**改用 `.tabs` 切換（商品陳列／付款／出貨），一次顯示一個 `.ss-tabpanel`：商品陳列＝拖曳排序＋兩種空狀態；付款＝唯讀 Stripe 卡；出貨＝出貨地址／免運門檻。
  - **See as fan** 按鈕（page-intro）開啟畫面分割預覽（`.preview-panel--inset` + `.ss-fan`：店名/簡介 header＋商品格），與 5.1.5 的 See as fan 同一粉絲視角。

### D. Infra / 文件

- `ds-components/store-settings.css`：新增 `.ss-tabpanel`、`.ss-brand`、`.ss-fan*` 粉絲預覽；保留 `.ss-stack`/`.ss-url`/`.ss-amount`/`.ss-status`/`.ss-order`。
- `ds-components/preview-panel.css`：畫面分割擴充——新增 `.main` 壓窄與 `.preview-panel--inset`（top:64px，給有 topbar 的頁面）。
- `i18n.js`：新增門面標題/副標、品牌素材、See as fan、預覽標題等雙語鍵。
- `store-settings.html` 補載 `tabs.css`、`upload-tile.css`、`preview-panel.css`。
- `design-system.md`/`design-system.html`（§4.48）改為新 IA（compose 加 Tabs/Upload tile/Preview panel）；BUILD-SPEC sitemap/patterns/頁表、requirements-map（5.1.5.5）、ASSUMPTIONS（UIA-004/005 呈現假設）同步。

---

## 2026-06-13 · 規格與 UI 權責改為單向治理（D 文件）

### D. Infra / 文件

- `SPEC.md` 降級為舊連結相容頁，實作文件改名 `BUILD-SPEC.md`。
- 新增 `ASSUMPTIONS.md`，分開記錄呈現假設、產品缺口與實作偏差。
- `requirements-map.md` 改為直接連回 `requirement/` 與 `documents/`，不再宣稱 site 內文件是產品權威。
- 明定 site 只擁有呈現與工程決策；產品規則需先由上游核准，禁止靜默反向同步。
- 本次只調整治理文件，未把產品缺口直接改入 UI；待上游規格完成後分批對齊。

---

## 2026-06-13 · 商店設定新增「商品陳列」拖曳排序（A spec · §2.5 / D031）

> 依 5.1.5.5 §2.5 與 5.1.5 F4 更新：粉絲端商品**排序**由商品管理 F4 移入商店設定，成為粉絲端陳列順序的單一來源（D031）。F4 只管上 / 下架（上架開關 Shop）、搜尋、篩選、庫存。

### A. Spec-derived 新增

- `store-settings.html`：新增第 4 張卡「商品陳列（Product display）」——拖曳排序清單（`.ss-order`），列出已上架商品（縮圖＋名稱＋次分類/價格），HTML5 drag 重排即粉絲端順序（demo 互動、無後端）。含兩種空狀態（`.empty-stub`）：完全沒商品→導向建立商品；有商品但全未上架→導向商品管理（預設隱藏，依商品狀況顯示）。
- `ds-components/store-settings.css`：新增 `.ss-order`（列／拖曳把手／縮圖／名稱／meta／`.is-dragging`/`.is-over`）與 in-card 空狀態高度覆寫；全 token-driven。
- `icons.js`：新增 `grip-vertical`（拖曳把手）。
- `i18n.js`：新增 `store-settings.group.display`、`display.sub` 與兩組空狀態 title/sub/cta 雙語鍵。
- `store-settings.html` 補載 `empty-stub.css`。

### D. Infra / 文件

- 排序歸屬改變（D031）：F4 不再負責粉絲端排序——`5.1.5-電子商店.md` F4 已更新；R2.1 e-shop.html 本就無排序 UI，無需改動。
- `design-system.md` / `design-system.html`（§4.48）demo 加第 4 張卡與 `.ss-order` 規格、compose 加 Empty stub；SPEC sitemap / §3.2 / §4（含 E-Shop F4 註記）同步。

---

## 2026-06-13 · 上架開關正名（B 反饋）

> 使用者反饋：把「商品是否對粉絲可見」的控制統一叫**上架開關**，對齊規格 5.1.5 §F4 的用語（spec 稱「上架開關（Shop）」）。

### B. 反饋導入

- `i18n.js`：E-Shop 清單欄 `e-shop.col.shop` 中文 `商店顯示 → 上架開關`；建立商品開關 `cp.show` 中文 `在我的商店顯示 → 上架開關`。英文維持（欄 `Shop`、建立流程 `Show in my shop`）；`cp.show.sub`「粉絲在你的商店看得到」不變。
- 只動顯示文案，控制邏輯與 §7.2 對應（關閉＝Hidden）不變。

---

## 2026-06-13 · 建立商品即時預覽改畫面分割（B 反饋）

> 使用者反饋：新增商品的「買家預覽」要用畫面分割展開，不要 overlay。由原本的右側浮層（半透明遮罩變暗表單）改為**佔版面的分割面板**——開啟時把表單側壓窄讓出面板寬度，表單不變暗、仍可邊填邊看。

### B. 反饋導入

- `ds-components/preview-panel.css`：`.preview-panel` 由 `fixed inset:0` 全屏遮罩層改為 `fixed` 右側欄（寬 `--preview-w`，translateX 滑入/出）；移除半透明 backdrop（`__backdrop` 保留 DOM 但 `display:none`）與大陰影。新增 `body.preview-open` 把 `.wizard` 壓窄、固定底欄 `.wizard__bottom` 右移 `--preview-w`（同步過場）。≤760px 無法再壓縮 → 面板改覆蓋。
- `create-product.html`：Preview 開關同時切 `.preview-panel.is-open` 與 `body.preview-open`；✕／Esc 關閉復位。
- 預覽內容（`.preview-card`）、欄位、i18n 不變；只改展開方式。移除原 backdrop/陰影裸色，元件回到全 token-driven。
- `design-system.md` / `design-system.html`（§4.22f）與 SPEC §3.2 / §4 同步成「畫面分割、非浮層」。

---

## 2026-06-13 · 商店設定頁改卡片堆疊排版（B 反饋）

> 使用者反饋：換一種排版。由「左側 nav + 右側單區塊切換」（同帳戶 Settings 頁）改為**單欄堆疊的區塊卡片**，三張卡（基本/付款/出貨）一次全顯，不需切換。

### B. 反饋導入

- `store-settings.html`：移除 `.settings-layout` + `.settings-nav` 與 hash 切換 JS；三區塊各包一張 `.card`，放進新的 `.ss-stack`（單欄、gap 18px、max 760px）容器，全部同頁可見。頁首 page-intro 的 Discard / Save changes 不變。
- `ds-components/store-settings.css`：新增 `.ss-stack` 版面（含卡內 `.settings-row` 首尾間距微調、`.card__sub` 區塊副標）；`.ss-url`/`.ss-amount`/`.ss-status` 欄位型別不變。
- 內容、欄位、i18n key、口徑（Stripe/幣別依 Earnings §7.3）皆不變；只換排版。
- `design-system.md` / `design-system.html` 的 Store settings 卡（§4.48）demo 與規格改成卡片堆疊版（compose 加 Card）；SPEC sitemap / §3.2 / §4 同步。

---

## 2026-06-12 · 商店設定改為獨立頁 store-settings.html（spec 5.1.5.5）

> 依 `documents/5.1.5.5-商店設定.md` 補電子商店缺的「商店層級設定」。**最終定案＝獨立頁**（使用者反饋：要像商品管理頁一樣的獨立頁面，不要浮層 / 右推面板）。同日先後試過置中 modal、右推切割面板兩版，皆已取代。

### A. Spec-derived 新增

- **新頁 `store-settings.html`**：沿用帳戶 Settings 頁的版面（`.settings-layout` + 左側 `.settings-nav` + `.settings-section` + `.settings-row`），左側 nav 切換三區塊，對齊 spec §2.2–§2.4——商店基本資料（店名／幣別／`ztor.com/shop/` 前綴網址／商店簡介＋200 字計數）、付款設定（唯讀 Stripe 連接卡＋Active badge）、出貨預設（出貨地址／免運門檻 `$` 輸入）。頁首 page-intro 放 Discard（回 e-shop）＋ Save changes（demo）。
- **入口**：E-Shop header 下拉「商店設定」→ `store-settings.html`（spec D028 單一入口；E-Shop nav 在該頁維持高亮）。
- **口徑遵循 spec**：付款排程、幣別、Stripe 連接以 Earnings（§7.3）為單一來源，本頁只呈現不重算；截圖未涵蓋的（幣別選項與預設、slug 規則、bio 是否必填）依 spec 標「待補」保守處理，不自創。

### C. 撤除（同日中間版本）

- **移除置中 modal 方案**：刪 `ds-components/modal.css` 與 `partials/store-settings-modal.js`；earnings／e-shop／design-system 不再引用 modal.css。Earnings 的 `.payout-modal` 仍為專案 canonical dialog，不受影響。
- **移除右推切割面板方案**：拿掉 `store-settings.css` 的 `.ss-panel` / `body.store-panel-open .main` 壓窄樣式，與 e-shop.html 的面板 host／開關 JS。

### D. Infra / 文件

- **`ds-components/store-settings.css` 收斂**：只保留 Settings 版面沒有的欄位型別——`.ss-url`（網址前綴）、`.ss-amount`（$ 前綴）、`.ss-status`（唯讀 Stripe 卡）；其餘欄位用 shared 的 `.input`/`.textarea`/`.select` 與 `.settings-row`。SiteSpecific、全 token-driven。
- `sidebar.js` E-Shop 下拉第三項 href 改 `store-settings.html`（原 `e-shop.html#store-settings`）。
- `i18n.js` 新增／補齊 `store-settings.*` 雙語鍵（含三區塊副標、Discard、name/currency hint）。
- `design-system.md` / `design-system.html`：移除 Modal 卡，Store settings 卡改為「獨立頁」描述（compose 改 Settings row + Input + Badge），Inventory / TOC 同步。
- 全站資產版本一次性 bump 對齊（i18n.js / sidebar.js 內容變更需 bump）。

---

## 2026-06-10 · Projects 清單同步改為無外框表格列

> 延續 E-Shop 已確認的無外框表格清單視覺，只調整 Projects 的列表模式；Design Token 與卡片模式維持不變。

### B. 反饋導入

- **新增 `project-list` 元件**：移除列表模式外層 `.card` 與通用 `.data-list` 排版，改為表頭、水平 row-divider、淡 hover 的無外框清單。
- **欄位重整**：專案 icon、名稱、分類與摘要集中於 Project 欄；Type 與 Status 各自對齊；右側保留待辦提示與進入詳情的 chevron。
- **功能不變**：狀態 tabs、類型 chips、搜尋、列表／卡片切換、整列詳情連結與雙語內容全部沿用原邏輯。
- **響應式**：≤760px 隱藏表頭，Type 與 Status 收至專案資訊下方，操作 icon 固定於右側。
- **沒有修改 Design Token**：顏色、字體、圓角、分隔線、focus 與動態全部引用既有 token。

### D. Infra / 文件

- 新增 `ds-components/project-list.css`，`projects.html` 改載入此元件並移除該頁的 `data-list.css` consumer。
- `i18n.js` 新增專案清單表頭與 aria label 雙語鍵；Projects i18n cache bump → `20260610b`。
- `component-library.md` 與 `design-system.md` Inventory 補入 Project list。

## 2026-06-10 · Settings 左側選單改為單一內容區切換

### B. 反饋導入

- 左側 Profile / Appearance / Notifications / Privacy & Security / Payments / Integrations 改為 local tabs 行為；點擊後右側只顯示對應 section，其他 section 使用 `hidden`，不再垂直串接造成頁面過高。
- URL hash 保留深連結與瀏覽器歷史，例如 `settings.html#notifications`；切換時不捲動頁面，上一頁／下一頁會還原正確內容與 active 狀態。
- `settings.html` 補載 canonical `ds-components/settings.css`；active section 移除原本 56px 尾端 padding，右側容器高度與當前內容一致。

---

## 2026-06-10 · E-Shop 商品清單改為無外框表格列

> 使用者提供參考圖，要求電子商店商品清單改成無外框表格清單；只換視覺，Design Token 維持 R 2.1 現有系統。

### B. 反饋導入

- **新增 `product-list` 元件**：表頭 + 水平 row-divider 清單，移除原本外層 `.card`、卡片陰影與通用 `.data-list` 排版。商品列保留商品名稱、分類／規格／價格、狀態、庫存、顯示開關與編輯入口。
- **商品識別靠左集中**：44px 商品縮圖／類型 icon + 名稱 + 次要資訊兩行，對齊參考圖的 Name 欄結構。分類從名稱旁 badge 改為次要資訊中的較深文字，降低標籤噪音。
- **操作改 icon affordance**：原文字 Edit 改為既有 Button atom + Lucide pencil；功能與連結不變，未新增刪除功能。
- **響應式**：≤760px 隱藏表頭，商品主資訊維持第一列；狀態、庫存、顯示與編輯重排為兩欄，避免文字擠壓。
- **沒有修改 Design Token**：所有顏色使用 `--foreground* / --surface-muted / --border / --background`，圓角、字體與動態也引用既有 token。

### D. Infra / 文件

- 新增 `ds-components/product-list.css`，`e-shop.html` 改載入此元件並移除該頁的 `data-list.css` consumer。
- `i18n.js` 新增商品清單表頭 `Product / Status / Stock / Visibility` 雙語鍵；E-Shop i18n cache bump → `20260610a`。
- `component-library.md` 與 `design-system.md` Inventory 補入 Product list。

## 2026-06-09 · 通知與待辦中心落地到全域導航

> 對齊 `documents/0-設計規格書.md` §5.2.1 / decisions D019：通知入口點擊後展開「通知與待辦中心」，官方公告併入此中心；Topbar 與 Sidebar 模式內容相同、只改展開位置。

### A. spec-derived 新增

- **`sidebar.js` 新增共享通知中心資料與 renderer**：`NOTIF_TODO`（需要處理）與 `NOTIF_INFO`（狀態更新）共用一份資料；Topbar 模式渲染為右側下拉，Sidebar 模式渲染為 rail 右側 flyout。官方公告以 `notif.announce` 顯示在狀態更新區，不另設公告入口。
- **每則項目補足規格欄位**：來源 icon、標題、一行摘要、時間、來源模組 pill、點擊導向來源頁。範例覆蓋 Earnings、Orders、E-Shop、IP Bank、Projects、Fans CRM、Settings、Official。
- **入口文案修正**：英文由 Announcements 改為 Notifications & to-dos；繁中維持「通知與待辦」。入口 icon 使用 flag + yellow unread dot，符合「官方公告併入」而不是獨立 announcement nav。
- **`i18n.js` 補齊雙語字典**：通知中心標題、區段、mark-all-read、view settings、全部範例 item 與來源模組均可 EN / zh-Hant 切換。
- **demo interaction**：`Mark all read` 會清掉目前面板項目的未讀底色與入口 unread dot；真正的待辦解除仍由來源模組完成動作後處理。

### D. infra / 文件

- `shared.css` 新增 `.app-notif__item-source`、unread 狀態底色、todo icon 色調、read dot 隱藏規則；沿用 `.app-topbar__dropdown` 的 surface / animation / z-index。
- `SPEC.md` §5.2b 補 site 實作說明，§5a 將「通知與待辦中心」標為已實作。
- Cache bump：`shared.css?v→20260609i`、`sidebar.js?v→20260609f`、`i18n.js?v→20260609b`（全 R 2.1 HTML）。

---

## 2026-06-09 · sidebar rail 再調淺為近白中性 token

> 使用者要求：左側欄顏色再淺一點，且要考慮整個 design system 的 color token；必要時可以加顏色。

### B. 反饋導入

- **rail 色階調整為近白**：`--surface-rail #F7F7F7 → #FBFBFB`，讓 sidebar 比白色 canvas 只低一點點，不再像一整塊灰底。這個值比 `--surface-muted #FAFAFA` 更淺，符合「側欄更淡、主要內容仍是白色主舞台」的階層。
- **hover / active 重排**：`--surface-rail-hover #EEEEEE → #F3F3F3`。原本 hover 比 rail 深太多，會變成重灰色；新值仍比 rail 明顯，但和 `--border #E5E5E5` 保持距離，不會像邊框或分隔線。
- **整組 light neutral ramp**：canvas/surface `#FFFFFF` → rail `#FBFBFB` → muted `#FAFAFA` → rail-hover `#F3F3F3` → border `#E5E5E5`。未新增 token，只調整既有 rail token 值；dark mode rail 不變。

### D. Infra / 文件

- `_tokens.css` 更新 light rail / rail-hover，並修正檔頭 token delta 註解。
- `design-system.md` / `design-system.html` / `SPEC.md` 同步 rail 數值、swatch 與描述。
- Cache bump：`_tokens.css?v → 20260609d`（R 2.1 HTML 全站）。

---

## 2026-06-09 · selection-card 預設外框改用 KPI 同款柔陰影

> 使用者反映：主題／選項卡（深色、跟隨系統等未選取狀態）的硬實線外框偏重，要改成像 KPI 卡（當前總收入）那樣的柔邊浮起外框。

### B. 反饋導入

- **`.selection-card` 預設外框換柔陰影**：`box-shadow` 由硬實線 `0 0 0 1px var(--border)`（#E5E5E5 hairline、無陰影）改為 `var(--shadow-card)`（柔陰影 + 8% 極淡 1px ring），與 `.kpi`／`.card` 同一套外框語言。hover 由 `0 0 0 1px var(--foreground-muted)` 改為 `var(--shadow-card-hover)`（陰影抬升）。active 黃框（`0 0 0 2px var(--primary)` + 帶色底）不動，維持選取指示。
- 改在元件層（`ds-components/selection-card.css`）一次，5 個 consumer 自動同步：settings（主題 + 顯示模式選擇器）、create-project／create-product／create-event 的 wizard radio 卡、design-system demo。
- design-system.md／.html 的 anatomy 與 States 表同步（default＝柔陰影、hover＝陰影抬升）。



> 規格新增跨頁麵包屑規則（0-設計規格書 §5.2.1，見 decisions D018）；site 同步補齊。

### A. spec-derived 新增

- **8 個頁面補麵包屑**：e-shop（E-Shop / 商店管理）、my-ip（IP Bank / My IP）、ip-market（IP Bank / IP Market）、projects、events、fans-crm、earnings、settings。頂層平鋪頁採「模組為根、只顯示自身一節」（單節純文字）；群組／詳情頁顯示完整鏈。位置統一在 `.page` 內、`page-intro` 之上，沿用既有 `.text-sub` 12.5px 麵包屑樣式。
- **新增 i18n 鍵**（各頁 `*.crumb.*`）：e-shop.crumb.eshop/self、my-ip.crumb.bank/self、ip-market.crumb.bank/self、projects/events/fans/earnings/settings.crumb.self。
- **ip-detail 對齊**：IP Bank 一節連結 `ip-market.html → my-ip.html`（群組主要落地子頁＝My IP，依 §5.2.1）。
- 例外（不加）：index（Dashboard）、3 個 wizard（stepper＋Close 已是位置指示）、request-payout（轉址 stub）、design-system（非產品 IA）。

### C. 撤除

- **移除 e-shop 底部 `#bundle-builder` 佔位區**：組合／競標編輯器留待 R 2.1.1，原型不先擺空狀態。「＋New」下拉的「套組／拍賣」兩項保留（規格 §5.1.5 F1 三種建立入口），暫 `href="#"`，待 R2.1.1 接編輯器。`e-shop.empty.title/sub` 兩個 i18n 鍵成為冗料（保留不影響顯示）。

---

## 2026-06-09 · 去暖調：rail token 改中性灰 + design-system 改寫「暖紙」識別

> 接續上一筆。使用者裁示：(1) design-system 文件裡「暖紙 canvas」的品牌識別敘述要改寫對齊現況；(2) design token 裡的暖白色都減少暖色成分。

### B. 反饋導入

- **rail token 去暖調**：`--surface-rail` `#FAFAF7 → #F5F5F5`、`--surface-rail-hover` `#EFEEE8 → #EBEBEB`（皆 R=G=B 中性灰，移除黃調）。側欄改讀為中性淺灰、與白色內容區靠色階＋hairline 分界。dark 模式 rail token 不變。
- **側欄再調淺一階**（同日後續，依使用者「淺一點、顧及整組 token」）：`--surface-rail → #F7F7F7`、`--surface-rail-hover → #EEEEEE`；整組中性 ramp＝white 255 → muted `#FAFAFA` 250 → rail `#F7F7F7` 247 → rail-hover `#EEEEEE` 238 → border `#E5E5E5` 229。design-system.md／.html rail 值同步；cache `_tokens.css?v→20260609c`。Playwright 量得 `.app-sidebar` `rgb(247,247,247)`。
- 全站僅這兩個是帶暖調的「暖白」token（`--surface-muted #FAFAFA`、`--border #E5E5E5` 本就中性）；canvas 已於上一筆改純白。

### D. Infra / 文件

- `_tokens.css`：rail / rail-hover 改中性值（light）。
- **design-system.md 識別敘述改寫**：Overview、Tags（`warm-paper-canvas`→`clean-white-canvas`＋`neutral-surfaces`）、Pillar 2 開頭、heritage 對照表、Pillar 1→2 範例、border 註記、do/don't、Quick Reference／Pillar 2 token 表、Appendix token 匯出（CSS／@theme／DTCG JSON 的 `--background`、neutral-50）全部由「暖紙 canvas」改為「白底＋中性淺灰表面」。
- **design-system.html 同步**：lede、tags、mode-pane--light 預覽底、canvas/surface 與 token 表的 swatch＋hex、do/don't、Light 主題卡描述、內嵌 token 匯出（`--background`、foundation neutral-50）皆改；新增 rail swatch / token 列。design-system.html 殘留 `FAFAF7` 已歸零。
- Cache bump：`_tokens.css?v→20260609b`（全站）。
- 驗證（Playwright）：`--surface-rail` 解析為 `#F5F5F5`（rgb 245,245,245，無暖調）、`.app-sidebar` bg `rgb(245,245,245)`、body `rgb(255,255,255)`。截圖 `screenshots/neutral-rail-sidebar.png`。
- 註：`selection-card.css` 的 Light 主題預覽 swatch 仍含 `#FAFAF7` 漸層（裝飾性 swatch、非 token），未動——若改純白會在白卡上消失，留作後續視覺決定。

---

## 2026-06-09 · canvas 改純白、暖紙色移到側邊欄 rail

> 使用者指示：R 2.1 所有背景換 `#fff`、側邊欄底色換 `#FAFAF7`。等於把 canvas 與側欄的色調對調。僅淺色模式；深色不變。

### B. 反饋導入

- **canvas 全站變純白**：`_tokens.css` light `--background` `#FAFAF7 → #FFFFFF`。body 及所有吃 `var(--background)` 的面板一次生效。代價：卡片（`--surface #FFFFFF`）與 canvas 同為白，分層只剩陰影／邊框（使用者已確認接受）。
- **側邊欄改暖紙色**：新增 token `--surface-rail`（light `#FAFAF7` ／ dark 維持 `rgba(253,253,253,0.10)`，沿用原 sidebar 外觀）；`.app-sidebar` 由 `var(--surface)` 改 `var(--surface-rail)`。側欄與白色內容區靠 `--surface-rail` ＋ 既有 `border-right` 分界。
- **側欄 hover/active 改可見色**：原本用 `--surface-muted #FAFAFA`，跟 rail `#FAFAF7` 幾乎同色看不見。新增 token `--surface-rail-hover`（light `#EFEEE8` 深一階 ／ dark `rgba(253,253,253,0.06)`）；側欄 5 條 hover/active 規則（link / sub-link / action 的 hover 與 aria-current）改用之。

### D. Infra / 文件

- `_tokens.css`：light + dark 各加 `--surface-rail`、`--surface-rail-hover`；light `--background` 改白。
- `design-system.md`：Quick Reference 與 Pillar 2 token 表更新（canvas → #FFFFFF、新增 rail / rail-hover、註明暖紙移到側欄）。**注意**：design-system.md 仍有多處把「warm-paper canvas」當品牌識別敘述（Overview / Tags / Pillar 2 開頭），canvas 已不再是暖紙——這段識別文案的全面改寫尚未做，待使用者確認是否要連品牌敘述一起改。
- `SPEC.md` §5.2a 補配色說明。
- Cache bump：`_tokens.css?v→20260609a`、`shared.css?v→20260609h`（全站）。
- 驗證（Playwright）：light 量得 body `rgb(255,255,255)`、`.app-sidebar` `rgb(250,250,247)`、card `rgb(255,255,255)`，token 值正確；topbar（earnings）與 sidebar（dashboard）截圖確認白底＋暖紙側欄＋卡片陰影分層皆正常。截圖 `screenshots/white-canvas-sidebar.png`、`white-canvas-earnings-topbar.png`。

---

## 2026-06-09 · 導航加入顯示模式快速切換鈕 + §5.2.1 規格重整

> 對齊 `documents/0-設計規格書.md` §5.2.1（敘述重整）與 §6.9（顯示模式快速切換並列於導航）。使用者要求把切換放上導航、像主題鈕一樣隨手可按。

## 2026-06-09 · E-Shop 庫存通知固定為頁首上方

> 對齊 `documents/0-設計規格書.md` 與 `documents/5.1.5-電子商店.md`：低庫存通知是商店管理頁首（含麵包屑）上方的 inline banner，不是浮層 toast。

### A. spec-derived 調整

- **低庫存通知位置明確化**：通知條放在商店管理頁首上方，位於麵包屑、E-Shop 標題與右側頁首操作鈕之前。
- **R 2.1 命名同步**：`e-shop.html` 改用 `.eshop-stock-alert`，保留佔版面流、可關閉、關閉後內容復位的行為。

---

### A. spec-derived 新增

- **導航顯示模式快速切換鈕**：topbar actions 與 sidebar actions 各加一顆 `[data-nav-toggle]` 按鈕（緊鄰主題鈕），點擊 `ztorNavMode.toggle()` 在 Topbar↔Sidebar 間切換。圖示隨當前模式互換——topbar 顯示 `panel-left`（暗示切到 sidebar）、sidebar 顯示 `panel-top`（暗示切到 topbar），比照主題鈕 sun/moon 的「顯示下一步」慣例。原本只有 Settings→外觀的 selection-card，現在導航也能隨手切。

### D. Infra / 文件

- `theme.js`：nav-mode click 委派新增 `[data-nav-toggle]` → `toggle()`（與既有 `[data-nav-set]` 並存）。
- `icons.js`：新增 `panel-left`、`panel-top` 兩個 Lucide 圖示。
- `sidebar.js`：兩種模式的 actions 區各加切換鈕。
- `shared.css`：加 `[data-nav-toggle]` 圖示可見性規則（隨 `data-nav-mode` 互換，鏡像主題鈕）。
- `documents/0-設計規格書.md` §5.2.1：六段敘述重整去重——「能力定位」改為分類定位（不再逐項列舉）、清單統一由「輸出內容」承載並補入顯示模式快速切換（第 6 項）；§6.9 補「兩者另在全域導航框架提供快速切換」。
- Cache bump：`sidebar.js?v→20260609e`、`shared.css?v→20260609g`、`theme.js?v→20260609e`、`icons.js?v→20260609a`（全站統一）。
- 驗證（Playwright）：topbar 模式鈕顯示 panel-left、點擊 → sidebar；sidebar 模式鈕顯示 panel-top、點擊 → topbar；兩向圖示正確互換、SVG 有渲染。截圖 `screenshots/navmode-toggle-topbar.png`。

---

## 2026-06-09 · E-Shop 商店管理：低庫存通知條、新增入口補拍賣、分類顯示次分類

> 對齊 `documents/5.1.5-電子商店.md`（F3 頁內通知條、F1 三種建立、F4 次分類）與 §7.1／§7.2（decisions D011／D012／D014）。與同日 codex 那筆（E-Shop 下拉＋訂單頁＋顯示模式）互補。

### A. spec-derived 新增

- **低庫存通知改頁首上方通知條**（`e-shop.html` F3）：保留 inline `alert` 橫條，位置固定在麵包屑與頁首操作區前；通知條佔版面流、可關閉，不採疊蓋浮層。
- **「＋ New」建立下拉補第三項**：建立新商品 ／ 從既有商品建立 bundle ／ **建立拍賣**，對齊 5.1.5 F1「商品／套組／拍賣三種不同建立方式」（bundle、auction builder 本體待 R2.1.1，先指向 stub 錨點）。注意這是 page-intro 的「新增」下拉，與 codex 那筆的 header 導航下拉是兩件事。
- **清單分類顯示次分類**（`e-shop.html` F4，前一輪）＋ **product-detail 對齊**：Tour zine 次分類由「Zine · 文檔」改「書籍（Books）」（badge ＋ sub-cat select），與清單一致；sub-cat 選項補 服飾／海報與印刷／收藏品（§7.1）。

### B. 反饋導入

- **商品狀態用詞對齊 §7.2**（前一輪）：清單 STATUS 欄 Active → Live、Low → Low Stock。

### D. Infra / 文件

- `i18n.js`：新增 `e-shop.btn.new-auction`、`product-detail.sub.apparel／poster／collectible`；更新 `product-detail.badge.zine`／`sub.zine` 值（Zine → Books／書籍）；前一輪已改 `e-shop.row.active`→Live、`e-shop.row.low`→Low Stock、`e-shop.row1~4.cat` 次分類。
- `e-shop.html`：頁內 `<style>` 使用 `.eshop-stock-alert`。
- 規格端（documents）已完成：5.1.5 收成 F1–F5、新增 5.1.5.3／5.1.5.3.1、§3.1.4 商品＝可重用單元、§3.2 導航 E-Shop 下拉、§8.4 訂單狀態待補、decisions D011／D012／D014。
- 驗證：4 頁 data-i18n 鍵全部存在於 i18n.js（0 缺失）；視覺截圖待補（本機瀏覽器當下被佔用）。

---

## 2026-06-09 · E-Shop 下拉＋訂單管理頁，新增顯示模式 Topbar↔Sidebar 切換

> 對齊 `documents/0-設計規格書.md`（§3.2.1 E-Shop 下拉、§6.9 顯示模式）與 decisions D014 / D016 / D017。使用者裁示「完整做、已知缺口這次也補」。

### A. spec-derived 新增

- **E-Shop 改 header 下拉**（`sidebar.js` NAV）：子選單＝商店管理（`e-shop.html`）＋訂單管理（`orders.html`），對齊 §3.2.1 / D014。建立流程仍頁內進入。全站導航現有 IP Bank 與 E-Shop 兩個下拉。
- **新增訂單管理頁**（`orders.html`，spec 5.1.5.3）：F1 訂單摘要（待出貨／待處理／退款爭議／已完成）、F2 篩選（搜尋＋狀態）、F3 訂單清單（點列 → 訂單詳情）。金額引用 Earnings、不自行重算（§7.3）；訂單狀態用 §8.4 建議集並標待對齊 §7.2。
- **新增訂單詳情頁**（`order-detail.html`，spec 5.1.5.3.1）：麵包屑、訂單狀態、品項與金額拆解（引用 Earnings）、買家（連 Fans CRM）、出貨履約、退款與爭議、Earnings 對帳入口。
  - 註：`orders.html` / `order-detail.html` 的 HTML 骨架先由 codex 建出但未接 i18n；本次補齊全部 `orders.*` / `od.*` 雙語鍵，兩頁 0 個未翻譯 key。
- **顯示模式 Topbar↔Sidebar（spec §6.9 / D016）**：導航可在橫向 Topbar（預設）與 248px 左側 Sidebar 間切換，同一套 NAV／IA。
  - `theme.js` 新增 nav-mode 管理：`<head>` 早期套用 `data-nav-mode`（避免版面閃爍）、localStorage `ztor.nav.mode` 持久化、`window.ztorNavMode` API、廣播 `ztor:navmode-changed`。
  - `sidebar.js` 依 `data-nav-mode` 雙模式渲染：sidebar 模式下頂層平鋪、IP Bank/E-Shop 變可展開群組（active 子頁自動展開）、全域操作（搜尋／通知／語言／主題／帳戶）收在 rail 底部；監聽事件即時重繪。
  - `shared.css` 新增 `[data-nav-mode="sidebar"]` app-shell 版面（`.app` 轉 row、rail 248px、< 900px 收成頂部橫列）＋ `.app-sidebar__*` 元件樣式。
  - `settings.html` 外觀區新增「顯示模式」兩張 selection-card（Topbar／Sidebar），active 狀態隨 `window.ztorNavMode` 同步。
  - **Fullbleed hero 修正**：Dashboard `.hero--fullbleed` 原用 `-50vw` 以整個視窗破出，sidebar 模式下會蓋住 248px 側欄並向右溢出（橫向捲軸）。hero 是 `.main` 子元素，故 sidebar 模式覆寫為 `margin:0 / width:auto / left:auto`，填滿 main（側欄右緣→視窗右緣）＝ sidebar 下的 edge-to-edge；topbar 不受影響（仍 0→100vw）。量測：sidebar hero 248→1800、topbar hero 0→1800、皆無 overflow。

### D. Infra / 文件

- **命名統一**：`i18n.js` `nav.ip-market` / `ip-market.h1` 英文 `IP Marketplace` → `IP Market`（對齊 0-設計規格書 D017；zh「IP 市場」不動）。
- `i18n.js` 新增 `nav.orders` / `nav.orders-sub`、`settings.navmode.*`、`orders.*`、`od.*` 共約 60 個雙語鍵。
- **Cache bump**：全站 `sidebar.js?v` → `20260609d`、`shared.css?v` → `20260609f`（hero 修正迭代到 f）；`theme.js` 原本無版本號 / index 用舊 `20260528f`（會被快取），本次全站統一補成 `?v=20260609d`。
- `SPEC.md`：§2 sitemap 加 orders/order-detail、§3.2 dropdown 註（IP Bank + E-Shop）、§5.1 導覽模型、新增 §5.2a 顯示模式、§5.3 字數/頁數、§5.4 響應式、§5a 缺口標已實作、§0 pivot 註補「sidebar 以可切換模式回歸」。
- 驗證（Playwright，本機 http）：E-Shop 下拉顯示商店管理／訂單管理 ✓；切 sidebar → `.app-sidebar` 248px、`.app` row、同一套 nav、群組可摺、持久化 ✓；跨頁（orders）保持 sidebar 且 E-Shop 群組自動展開、i18n 0 raw key ✓；order-detail i18n 0 raw key、淨額 $51.30 ✓；切回 topbar 正常（7 連結、column）✓。截圖 `screenshots/sidebar-mode-settings.png`、`screenshots/sidebar-mode-orders.png`。

---

## 2026-06-09 · 下拉面板背景色比照 header（`--surface`）+ frosted blur

> 反饋：下拉選單背景色要和 header 一樣（原本 header = `--surface`、下拉 = `--background`，light 下 #FFFFFF vs #FAFAF7 有色差）；再追加「要半透明＋背景模糊」。

### B. 反饋導入

- `ds-components/header.css` `.app-topbar__dropdown` 的 `background` 從 `var(--background)` 改為 `var(--surface)`，與 `.app-topbar` 一致；移除 `[data-theme="dark"] .app-topbar__dropdown { background:#1F1F1F }` dark 覆寫，讓 dark 也直接沿用 `--surface`。影響所有 header 下拉（nav mega、search、account 選單）一起對齊 header。
- **加 frosted glass**：`backdrop-filter: blur(14px) saturate(140%)`（＋`-webkit-` 前綴，與 scrolled header 同參數）。dark 下 `--surface` 半透明時把背後 hero/content 模糊成霧面、文字維持清楚（解決先前 SPEC §3.2 擔心的「半透明疊彩色 hero 看不清」）；light 下 `--surface` 不透明、blur 自然 no-op。維持半透明＋模糊，依反饋。

### D. Infra / 文件

- header.css 經 `shared.css` `@import` 供全頁；cache buster 連帶升 `header.css` / `shared.css` → `v=20260609c`（@import、各頁 `shared.css?v=`、index/design-system 直連 header.css 全同步）。
- `SPEC.md` §3.2 Dropdown panel pattern 註記同步改寫（bg 比照 header＋frosted blur）。
- 驗證：本機 http 量得 light 兩者皆 `rgb(255,255,255)`、dark 靜止後皆 `rgba(253,253,253,0.1)`＋`backdrop-filter: blur(14px) saturate(1.4)`；dark 霧面截圖 `screenshots/ipbank-dropdown-dark-frosted-panel-20260609.png`（背後 hero 已模糊、文字清楚）。

---

## 2026-06-09 · E-Shop 對齊規格：狀態用詞、分類顯示次分類、新增入口下拉

> 對齊 `documents/0-設計規格書.md` §7.2 狀態語言、§7.1 次分類（decisions D012）與 `5.1.5` F1（D011）。使用者裁示「按照規格改 R2.1」。

### A. spec-derived 新增

- **新增入口改為下拉**（`e-shop.html` page-intro）：原「＋ New product ▾」單一連結 → 原生 `<details>` 下拉，含「建立新商品（Create new product）」（→ `create-product.html`）與「從既有商品建立 bundle（Create bundle from products）」（→ `#bundle-builder` 錨點，bundle composer 本體待 R2.1.1）。對齊 5.1.5 F1「主要新增入口為下拉，含建立商品＋從既有商品建立 bundle」。動機：把 bundle 建立入口顯式化，不再只有建立商品一條路。
- **清單分類顯示次分類**：4 列分類 badge 由主分類（Physical merch / Digital merch / Special）改為次分類——Tour zine→書籍(Books)、Coastline tee→服飾(Apparel)、Coastline EP→音樂專輯(Album)、Coastline acetate→收藏品(Collectibles)。主分類改由 badge 顏色分組（neutral / yellow）承載、不另立文字。對齊 D012（§7.1 次分類擴充）＋ 5.1.5 F4「Category 欄顯示次分類、主分類隨商品記錄供分組」。
- **商品狀態用詞對齊 §7.2**：STATUS 欄 `Active → Live`、`Low → Low Stock`，不再自創狀態。

### D. Infra / 文件

- `i18n.js`：移除孤兒鍵 `e-shop.cat.physical/digital/special`；新增 `e-shop.row1~4.cat`、`e-shop.btn.new-product`、`e-shop.btn.new-bundle`；`e-shop.row.active`→Live、`e-shop.row.low`→Low Stock（值改、鍵名不動）；`e-shop.btn.new` 值「＋ New product ▾」→「＋ New ▾」。
- `e-shop.html`：新增頁面內 scoped `<style>`（`.eshop-new` 下拉，用 DS token、零 JS）；empty-stub 加 `id="bundle-builder"` 當 bundle 入口錨點。若日後跨頁重用，可另案 promote 成 ds-component。
- 規格端：§7.1 次分類擴充、5.1.5 F4/F7 同日已改（Plan074/075、D011/D012）；§7.2 狀態原已 canonical、不動。
- 驗證：markup 已逐處核對；本機瀏覽器當下被佔用、未即時截圖，待補一張 products tab + 下拉展開圖。

---

## 2026-06-09 · IP Bank 下拉面板下移到 header 底 +4px（不再貼/疊 header 底緣）

> 反饋：下拉面板原本貼著（略疊進）header 底緣，要改成在 header 往下 4px 的位置浮出。

### B. 反饋導入

- `ds-components/header.css` `.app-topbar__dropdown--mega` 的 `top` 從沿用 base 的 `calc(100% + 8px)` 覆寫為 `calc(100% + 18px)`。原理：`100%` 相對的 nav `<li>` 高 36px、在 64px header 內置中，li 底距 header 底 14px；14 + 4 = 18，面板靜止頂剛好落在 header 底 +4px。只動 mega（nav 下拉），右側 search / account 選單不變。

### D. Infra / 文件

- header.css 透過 `shared.css` `@import` 供全頁使用；連帶把 `shared.css` 的 header.css `@import` 版本、各頁 `shared.css?v=`、index/design-system 直連的 `header.css?v=` 全部升到 `v=20260609a`（否則瀏覽器讀舊快取、改動不顯）。
- 驗證：本機 http 載入 my-ip，量得 header 底 64px、下拉靜止頂 67.5px（間距 ≈4px，0.5px 為 li 置中次像素捨入）；進場 fade+slide 動畫不受影響。截圖 `screenshots/ipbank-dropdown-4px-below-header-20260609.png`。

---

## 2026-06-09 · 主導航收斂：header 只留 IP Bank 一個下拉，E-Shop / Fans 改平鋪

> 對齊 `documents/0-設計規格書.md` §3.2.1 與 decisions D013（使用者裁示）：header 只放頂層模組，全站唯一下拉是 IP Bank；其餘模組的子頁與建立流程改從各自落地頁進入，不在 header 出現。

### B. 反饋導入

- **E-Shop / Fans 由 mega dropdown 改成平鋪頂層連結**（`sidebar.js` NAV 定義）：E-Shop → 直接連 `e-shop.html`、Fans → 直接連 `fans-crm.html`。原下拉內的子項（Manage eShop / Orders / 建立商品 ｜ Fans List / Loyalty / Announcements / Campaigns）改由各自落地頁內部進入。動機：降低 header 複雜度，主導航回到乾淨的頂層模組層級。
- **IP Bank 下拉只留 My IP + IP Marketplace**：移除原本第三項 IP Detail（IP 詳情屬 detail 頁，從 My IP / IP Marketplace 點 IP 進入）。IP Bank 維持為全站唯一 header 下拉。

### C. 撤除（intentional removal）

- 移除 E-Shop、Fans 兩組 `.app-topbar__dropdown--mega`；header 下拉從 3 組降為 1 組（僅 IP Bank）。

### D. Infra / 文件

- `sidebar.js` NAV：E-Shop / Fans 改 flat（保留 `match` 讓 product-detail / create-product 仍高亮 E-Shop、create-event 高亮 Events）；IP Bank 加 `match: ["ip-detail.html"]` 讓 IP 詳情頁仍高亮 IP Bank。全頁 `sidebar.js` cache buster → `v=20260609a`（12 頁同步）。
- `SPEC.md` 對齊：§3.2 Dropdown panel pattern、§5.1 主導航列、Dropdown 行都改成「僅 IP Bank 有下拉」，並引 spec §3.2.1 / D013。
- 驗證：本機 http 載入 my-ip / product-detail / ip-detail，header 僅 1 個下拉（IP Bank → 我的 IP / IP 市場）、E-Shop / Fans 平鋪、active 高亮正確（my-ip→IP Bank、product-detail→E-Shop、ip-detail→IP Bank 皆 via match）、0 JS error。
- **規格端**：`documents/0-設計規格書.md` §3.2/§3.2.1/§5.2.1 同日已改（Plan076 備份、D013 決策），本筆為 site 對齊。
- **待補**：未使用的 i18n 鍵（`nav.manage-eshop`/`nav.product-detail`/`nav.add-product`/`nav.fans-list`/`nav.loyalty`/`nav.announcements`/`nav.campaigns`/`nav.ip-detail` 等下拉子項標題）暫留 DICT，無害；如要清理另案。

---

## 2026-06-09 · Earnings 提款流程：bank-picker + request-payout modal + 元件化收尾 + 全站文件稽核對齊

> Earnings Payouts 分頁新增「先選銀行 → 開申請彈窗」流程（spec §5.1.8.1）。同日做了一次全站唯讀稽核（12 維度 × 對抗式驗證），把彈窗的功能缺陷補齊、把 WIP 收斂到符合專案規則，並對齊一批過時文件。

### A. Spec-derived

- **Payouts 銀行選擇器 + 申請提款彈窗**（spec §5.1.8.1 / F8）— Payouts 分頁卡片改成可選的 `.payout-bank-grid`（`data-bank-state="has-bank"`，含 `--selected` / `--add` 卡），點任一銀行卡開 `.payout-modal` 申請彈窗。彈窗為三視圖（request 選行+輸金額+費用摘要 ｜ add 新增銀行表單 ｜ result 申請完成），背景霧面遮罩。動機：把提款從獨立頁收進 Earnings 脈絡內完成，符合「任務在所在頁就近完成」。

### C. 撤除（intentional removal）

- **`request-payout.html` 獨立頁 → 重導 stub**：提款流程改由彈窗接手，原獨立頁降級為 `meta refresh` + JS redirect 到 `earnings.html#payouts`，保留為手動深連結 fallback（已寫進 SPEC §2 sitemap）。
- **移除 `partials/payout-request-modal.html`**：彈窗 markup 原本同時存在 `.html`（http fetch）與 `.js`（file:// fallback）兩份、需手動同步，屬反模式。收斂為單一來源——保留 always-loaded 的 `partials/payout-request-modal.js`（`window.ZTOR_PARTIALS`，file:// 相容），earnings 載入器刪掉 `fetch()` 分支與 `modalLoad`，永遠用 JS 模板掛載。

### D. Infra / 文件

- **彈窗 CSS 抽出成元件檔**：earnings.html inline `<style>` 的 ~250 行 payout 樣式（bank picker + dialog 全套）移到 `ds-components/payout-modal.css`（全 token-driven，值不變），earnings 改用 `<link>`。動機：可重用元件 CSS 不長期留頁面 inline（專案規則 + frontend-architecture）。
- **彈窗雙語化**：彈窗原本全硬編碼英文、切中文不翻。三視圖 34 處 UI 字串改綁 `data-i18n` / `data-i18n-aria-label`，`i18n.js` DICT 新增 `payout.*` 區塊（en + zh，銀行名稱等資料值保留不翻）；載入器 `mountModalHtml()` 在 `applyIcons` 後補呼叫 `applyI18n(host)`，送出鈕動態金額標籤改讀 `i18nT('btn.request-payout')`，並監聽 `i18n:applied` 在切換語言時即時重翻。
- **背景捲動鎖**：彈窗開啟時 `body.is-modal-open { overflow:hidden }`，關閉移除；ESC 關閉、開窗 focus 進入、關閉 focus 還原皆已驗證。（焦點環 focus-trap 不做——SPEC §5.5 明訂無障礙不在 R 2.1 交付範圍。）
- **`landmark` 圖示進 `icons.js` REGISTRY**：先前 Earnings 三張銀行卡 + 彈窗 6 處 `data-lucide="landmark"` 因 registry 缺鍵而渲染空白（earnings 不載 icons-all.js），補上 canonical Lucide path 後全部正常。
- **cache buster**：earnings `icons.js`/`i18n.js` → `v=20260609a`、`payout-request-modal.js` → `v=20260609b`、新 `payout-modal.css` → `v=20260609a`。
- **稽核後文件對齊**（非設計變更，純更正過時敘述）：SPEC topbar 80px→64px（§0/§3.2 對齊 header.css）並移除不存在的 `.app-topbar__inner` 與錯誤 token/padding、stub 頁數 10→8、i18n「約120 keys / 9 頁待補」→「約900 keys / 全站 14 頁覆蓋」、§6.1 載入序補上 components.js / reveal.js / chart.js、元件數改 24 並指向 §4.1；`design-system.md` + `design-system.html` 殘留 topbar 80px→64px；`component-library.md` 15 個指向不存在章節的 §4.26–§4.40 → 改指 §4.1 Inventory、新增 payout-modal 元件列；`_tokens.css` 清理逆向爬蟲溯源註解（值不變）。
- **token hygiene**：`_tokens.css` 新增 `--shadow-card-hover`（明暗兩套），`shared.css` `.project-card:hover` 改用該 token、`.project-bar` 的 `999px` → `var(--radius-pill)`。
- 驗證：本機 http 載入 earnings.html 0 實質 console error（僅 favicon 404）；彈窗掛載、8 個圖示全渲染（0 未解析）、中英切換（含動態送出鈕）、scroll lock、ESC 關閉皆通過；中文彈窗截圖 `screenshots/payout-modal-zh-verified-20260609.png`。
- **待補**：`design-system.md` / `design-system.html` Pillar 4 尚未把 payout-bank-picker / payout-dialog 收進 component graph（`component-library.md` 已登記）；§4.26–§4.40 若要正式成章另案；其他頁 cache buster 未動（共用檔改動皆 additive）。

---

## 2026-06-08 · Projects 清單頁對齊更新版 5.1.2（列表＋卡片雙檢視 · 狀態×類型篩選 · 搜尋）

> 依據 `documents/5.1.2-專案.md`（2026-06-08 重整版）把 projects.html 從 stub 補成符合 F1 規格的清單頁。該版規格已把單一專案頁收斂成子頁 5.1.2.2（檢視＋編輯），清單頁只剩 F1 清單 + F2 建立入口。

### A. Spec-derived

- **F1 列表＋卡片雙檢視**（spec F1）— page-intro 加 list/card segmented `.view-switch`，即時切換；兩檢視共用同一份資料來源（單一 `PROJECTS` 陣列 render），符合「同一筆資料在兩檢視呈現不同」。
- **F1 狀態篩選分頁**（spec §7.2 / decisions D005）— 全部／Draft／Scheduled／Live／Completed／Failed・Cancelled，附各分頁計數；Funded 歸入 Live、Failed+Cancelled 合併；每筆狀態欄位仍用 §7.2 完整語言。
- **F1 類型篩選**（spec F1 第二維度）— `.chip-group`：所有類型／直接上線（Go live）／先募資（Fund it first）／預購（Pre-order），命名用 spec canonical（不用設計稿的 Crowdfunding）；狀態與類型兩維度可疊加。
- **F1 專案範圍搜尋**（spec F1）— `.input` 依名稱／描述／meta 即時過濾；與 Top Bar 全域搜尋區隔。
- **每筆顯示＝類型 × 狀態**（spec F1）— 共用欄位（名稱·描述／內容類型·專案類型·狀態 badge）＋依「類型 × 狀態」的進度摘要：Go live 上線後收入＋觀看／上線前建立·排程；先募資 募資中已募·目標·支持者·剩餘／達標／未達標／尚未開募；預購 預購中已預購·目標·單價·剩餘／成立／未成立／尚未開賣。收入數字標 US$、引用 Earnings 口徑（§5.3.3 / D004），卡片以進度條輔助（先募資/預購且 Live/Funded 才出現）。
- **未完成提示 hover tooltip**（spec F1）— 次要資訊放 `.tip` hover 氣泡（觸控看不到可接受），有待辦才出現。
- **空狀態**（spec F1）— 未建立任何專案 → 未建立狀態＋建立 CTA；篩選無結果 → 無符合提示。
- **每筆操作：進專案詳情頁** — 列／卡點擊連到 `project-detail.html`（5.1.2.2，尚未實作，點擊暫 404）。
- 8 筆範例資料涵蓋三類型 × 各狀態（含 Funded／Failed），展示類型×狀態顯示與篩選計數。

### C. 撤除（intentional removal）

- **移除原 stub 的「卡片／詳情／協作分潤 待 R2.1.1」empty-stub roadmap 區塊**與其 i18n（`projects.empty.title/sub/cta`、`projects.row1–4.*`、`projects.btn.view-toggle`）。動機：卡片檢視與篩選已實作、roadmap 佔位失效；單一專案頁改走 5.1.2.2 子頁。

### D. Infra / 文件

- **shared.css 新增 project-owned patterns**：`.view-switch`、`.tip`/`.tip__bubble`、`.project-grid`/`.project-card`（+ `__cover`/`__badge`/`__body`/`__head`/`__title`/`__kind`/`__desc`/`__meta`）、`.project-bar`、`a.data-list__row` 可點樣式。cache buster → `v=20260608a`（僅 projects.html 升版；新增皆 additive，其他頁未動）。
- **icons.js 新增 `film`、`music`** 內容類型圖示；projects.html `icons.js` → `v=20260608a`。
- **i18n.js projects 區塊重寫**：移除舊 row／empty 鍵，新增 `projects.view.list/card`、`projects.type.*`、`projects.search`、`projects.empty.none.*`、`projects.empty.noresult.*`；`projects.tab.scheduled` zh 預定→已排程。projects.html `i18n.js` → `v=20260608a`。
- **projects.html 新增載入 `chip.css`**（類型篩選用）。
- 驗證截圖（`proj-r21-list-light` / `card-light` / `card-fund-filter` / `list-zh`）：雙檢視、篩選、計數、類型×狀態、中英動態切換皆正常，0 JS error。
- **待補**：`design-system.html` / `design-system.md` Pillar 4 尚未把 `project-card` / `view-switch` / `tip` 收進 component graph（`component-library.md` 已登記）；`project-detail.html`（5.1.2.2）另案；其他頁 cache buster 未動（additive）。

---

## 2026-06-05 · Badge / Status pill 改成柔色平標籤（全站）

> 反饋：希望 §4.3 Badge 改成像 Notion / Airtable 那種柔色分類標籤（提供參考圖）。確認採**全站改**（選項 1，非只新增變體）。

### B. 反饋導入

- **`.badge` 從「圓點＋外框＋膠囊」改成「柔色平標籤」**：扁平淡色底（`color-mix(hue 14%, surface)`；yellow 30% / accent 16%）+ 同色系飽和文字、圓角矩形（`--radius-md` 7px）、**無圓點、無外框**、字級 12.5px/500。一次改 `ds-components/badge.css` 這個元件，全站每一顆 badge（狀態 pill ＋ 分類 chip）同步換樣。
- **圓點處理**：`.badge__dot { display:none }`——markup 完全不動（含 components.js 動態產生的那顆），全站圓點一次隱藏，不必逐頁清 span。
- 影響範圍：13 個頁面、上百顆 badge（儀表板、Earnings 交易表與近期清單、ip-market、fans-crm、my-ip、product-detail、events、settings、create-project、projects…）一起變新樣式。淺/深色、狀態與分類用法都已截圖驗證。

### D. Infra / 文件

- **新增紫色 token `--status-accent`**（light `#8B5CF6` / dark `#A78BFA`）到 `_tokens.css`，並加 `.badge--accent` 變體（對應參考圖的紫色；藍/紅/黃/灰沿用現有色）。色票走 `color-mix`，dark mode 自動適配。
- 全站 `badge.css` / `_tokens.css` cache buster → `v=20260605a`（各 15 處同步，0 殘留舊版）。
- `design-system.md` §4.3 + Pillar 4 元件清單同步改寫（柔色平標籤、無圓點、加 accent）。
- **待補**：`design-system.html` 的 badge 展示會自動套用新 CSS（視覺已更新），但其 anatomy 文字仍寫舊的圓點 / 膠囊、且少一個紫色 swatch——留待下次 design-system.html 鏡像同步。

---

## 2026-06-05 · Dashboard F2–F8 元件化（components.js）+ 跨頁共用 transaction-list

> 反饋：狀態標籤只加在儀表板、沒同步到 Earnings，因為「近期收入清單」本來就不是真正的元件——各頁各自手寫 HTML、只共用 CSS。依「從元件改、所有頁同步」原則，把區塊做成 runtime 注入元件。

### A. Spec-derived / 一致性

- **新增 `transaction-list` 共用元件**：index.html F3 與 earnings.html Overview 的「Recent transactions」改用**同一個 renderer**，列格式（icon · 名稱 · 來源 · 日期 · 金額幣別 · 狀態 pill）保證兩頁一致、不再漂移。各頁傳自己的資料（儀表板 income-only 依 §F3 排除提款；Earnings 含提款的完整 ledger）。順帶把 Earnings 那份過時的列（狀態用文字、來源舊名「IP royalties / Project」、`$` 幣別）一起對齊到新格式。

### D. Infra / 文件

- **新增 `components.js`**：runtime 注入內容區塊（同 `sidebar.js` 注入 topbar 的模式）。頁面放 `<div data-component="NAME" data-key="...">` 占位，載入時由共用 renderer + 具名 dataset 填入，再對新節點重跑 `ztorIcons.applyIcons` / `applyI18n`。在沒有 build step 的靜態原型裡，這是讓區塊「改一次、所有頁同步」的唯一方式。
- **Dashboard F2–F8 全部改成元件**：`ops-summary`(F2)、`transaction-list`(F3)、`alerts`(F4)、`activity-list`(F5)、`events-projects`(F6)、`insight-split`(F7)、`ext-data-status`(F8)。markup 從 index.html 抽進 components.js 的 renderer + `DATA`；index.html 只剩占位。F1 Hero 維持由 `hero.js` 驅動。
- **earnings.html 接上 `components.js`**，並升 `icons.js` / `i18n.js` / `data-list.css` cache buster（現在會用到 `ticket` icon 與 `.data-list__end`）。
- 載入順序：`components.js` 在 `icons.js` + `i18n.js` 之後、`reveal.js` 之前（同步注入，確保 reveal 的 IntersectionObserver 觀察得到注入後的 `.card` / `.kpi` / `.stickynote`）。
- `component-library.md` 新增「Runtime-injected content blocks」段，登記 7 個區塊的 `data-component` 名、使用頁、組成與資料來源。
- **待補**：`design-system.html` / `design-system.md` 的 Pillar 4 尚未把這 7 個 runtime block 收進 component graph / 加 rendered preview，留待下次 design-system 同步。

---

## 2026-06-05 · Dashboard F2–F8 對齊更新版 5.1.1 規格

> 依據 `documents/5.1.1-儀表板.md`（2026-06-05 改版）重做 index.html 的 F2–F8。規格把 Dashboard 從「財務儀表板」重新定位成「營運總覽」。

### A. Spec-derived

- **F2 由「收入摘要 4 財務 KPI」改為「營運摘要 3 格」**（spec §F2 改版）— 當前總收入（引用 Earnings F3 毛利、不重算）、待處理事項數（引用 F4 的 Open / In progress）、進行中專案數（引用 Projects + F6）。後兩格 meta 為連結，分別跳到 `#f4-alerts` 與 `projects.html`。動機：新版 spec 明確把淨利 / 待結算 / 可提領的完整 KPI 口徑收回 Earnings F3，Dashboard 首格只給營運摘要。
- **F3 近期收入每筆補「收入狀態」pill**（Pending / Paid / Available，沿用 §7.2 收入狀態語言與既有 `status.*`）。新增 `.data-list__end` 右欄堆疊金額 + 狀態；金額補幣別（`+US$…`，對齊 §7.3「需能辨識幣種」）。
- **F3 來源名稱對齊 Earnings 分類**：Spotify 串流由「IP 版稅」改「平台 / 串流版稅」、預購標「專案支持」、周邊標「電子商店銷售」。動機：spec 要求 F3 引用 Earnings 來源分類、不另立矛盾名稱。
- **F4 每筆補「重要程度 · 關聯物件 · 處理狀態」meta 行**（新增 `.alert--card .alert__meta`），活動那筆 CTA 由含糊的「Open」改成具體的「Complete checklist」。動機：spec §F4 要求六欄齊全、CTA 導向具體處理動作而非只是前往狀態頁。
- **F5 近期動態每筆補「事件類型 · 事件來源 · 時間」+ 右側事件狀態 badge**（Published / Reached / Updated / Signed）。動機：spec §F5 五欄。
- **F6 改名「近期活動與專案」**，每筆補「類型（活動 / 專案）· 來源模組」，標題與 View all 反映同時涵蓋 Events 與 Projects。動機：spec §F6 需標類型與來源、資料只引用 Events + Projects。
- **F7 合併**：把原本分開的「Fans & loyalty」「Audience trend」兩張卡併成單一 F7「粉絲關係與受眾趨勢」卡（新增 `.insight-split` 雙欄 pattern + `.insight-eyebrow`），每欄標資料來源（Fans CRM / Audience Intelligence）、更新時間（Updated 2h ago / Last 30 days）與入口（Open Fans / Fix）。動機：spec 佈局第 5 列為 F7｜F8 兩欄，且 F7 本身合併兩種洞察類型。
- **F8 由「第三方整合狀態」改為「外部資料狀態」**清單：每筆顯示 資料來源 · 資料類型 · 最後同步 · 資料狀態（正常 / 延遲 / 部分缺漏 / 未連結）· 影響摘要；CTA 只在需要處理時出現並導向 Settings（Stalled → Fix in Settings、Not connected → Connect）。動機：新版 spec §F8 規定 Dashboard 只呈現外部資料狀態，整合管理（連結 / 重新授權 / 撤銷）改由 Settings F6 Integrations 負責。
- **版面回到 spec 五列順序**：F2 → F3｜F4 → F5｜F6 → F7｜F8。

### C. 撤除（intentional removal）

- **移除 Dashboard 的「Revenue trend 折線 / 長條圖 + Revenue by source rank bars」整列**。動機：更新版 spec §5.1.1 版面只列 F1–F8、無趨勢 / 來源列，且 F2 已改為營運摘要；趨勢與來源分析在 Earnings → Overview 已具備。一併移除 index.html 對 `chart.css` / `chart.js` 的載入（Dashboard 不再使用 chart-card）。

### D. Infra / 文件

- 新增可重用 pattern `.insight-split` / `.insight-split__col` / `.insight-eyebrow`（`shared.css`，含 `<900px` 收合成單欄）；新增 `.data-list__end`（`data-list.css`）與 `.alert--card .alert__meta`（`alert.css`）兩個既有元件的子元素。
- `icons.js` REGISTRY 補入 `ticket`（F3 活動票務列用）；其餘 icon 沿用既有註冊。
- index.html cache buster：`shared.css` / `alert.css` / `data-list.css` / `icons.js` / `i18n.js` → `v=20260605a`。
- `i18n.js` 補齊新區塊雙語鍵（`ops.*` / `tx.tickets.*` / `alert.*.meta` / `status.published·updated·reached·signed` / `dash.f7.title` / `dash.fans.eyebrow·synced` / `dash.audience.eyebrow·synced` / `dash.ext.*` / `ext.*` / `data.status.*`），並更新既有鍵（`section.alerts` zh、`tx.*.meta` 來源名、`alert.event.cta`、`dash.recent/​progress.* meta`、`dash.audience.fix`）。
- **待補**：`design-system.html` / `design-system.md` 尚未把 `.insight-split` 收進 product-owned component graph，留待下次 design-system 同步；其他頁面的 cache buster 未動（本次 CSS 變更皆為 additive，不影響舊頁）。

### 對抗式稽核（F2–F8 逐欄）後修正

> 7 個獨立 agent 各審一個 F，比對規格欄位與規則。F2/F3/F4/F5/F7/F8 通過；F6 因「處理入口」被判 fail，連同兩個小一致性點一併修掉。

- **F6 每列補來源感知處理入口**（修正 fail）：原本只有區塊級「View all → projects.html」，會把活動列（Spring Launch）也導向專案頁。改為每列右側狀態 pill 後加 `.data-list__go` chevron，**活動列 → `events.html`、專案列 → `projects.html`**，符合 §F6 #7 各列導向對應模組。新增 `.data-list__end--row` / `.data-list__go`（data-list.css）。
- **F8 StreetVoice（部分缺漏）補 `Fix in Settings` CTA**：非正常狀態依 §F8 應可導向處理；正常列（YouTube / Instagram）維持無操作。
- **F3 Spotify 來源正名**：`Streaming royalties` → `Platform / streaming royalties`（平台 / 串流版稅），與 Earnings §F3 來源分類逐字對齊。
- `data-list.css` cache buster → `v=20260605b`。
- **稽核記錄的原型層級待辦（暫不改）**：F5 發生時間只到日期、無精確時間 tooltip；F6 時間/進度與主要摘要併在同一 meta 行、無空狀態 markup；F7 卡標題用「粉絲關係與受眾趨勢」（規格抬頭多「分析」二字）；`status.not-connected` 沿用既有 zh「未連接」（規格用「未連結」，跨頁共用鍵不單改）。

---

## 2026-06-02 · R 2.1 component registry repair

### C. 撤除（intentional removal）

- **移除 `sample.html`**。它是早期 ztor yellow marketing surface 範例，不再是 R 2.1 產品頁或 design-system source。SPEC 的相關文件清單同步移除，避免 agent / developer 誤把 sample 當成元件來源。
- **移除 `index.html` 對 `ds-components/navigation-menu.css` 的載入**。該檔已是 tombstone；實際出貨 NavigationMenu 由 `ds-components/header.css` 的 `.app-topbar__*` 負責。

### D. Infra / 文件

- **新增 `ds-components/icon.css`**，把 `.ztor-icon` base sizing 從 `shared.css` / `design-system.html` inline 補丁提升為正式 Icon atom CSS。產品頁透過 `shared.css` 匯入，`design-system.html` 直接載入同一份 CSS。
- **產品頁 `shared.css` cache buster 更新到 `v=20260602f`**，確保新的 `icon.css` import 不被舊快取擋住。
- **低風險拆檔**：把 `Page intro`、`Field system`、`Settings nav / row / section` 從 `shared.css` 原樣搬到 `ds-components/page-intro.css`、`field-system.css`、`settings.css`。Selector / token / spacing 數值不變，產品頁只透過 `shared.css` import 新檔；cache buster 再升到 `v=20260602g`。
- **重建 component registry / composition graph**：`design-system.html` Pillar 4 補入 15 個 product-owned components：App shell、Page intro、Field system、Filter row、Segmented control、Stepper、Wizard frame、Settings nav、Settings row、Hero slideshow、IP hero、Rental card、Meta cell、Chart card、Rank bars / source breakdown。
- **`design-system.html` 重整 product-owned component cards**：移除獨立 `4.1b Contracts` 區塊，把 anatomy、variants / states、token usage、evidence / usage 併回 15 個元件自己的卡片，讓「由哪些元件組成 ↓／被哪些元件使用 ↑」和規格描述在同一處閱讀。
- **`design-system.html` 補齊 product-owned rendered previews**：4.26–4.40 每張元件卡都新增真實 class 的視覺渲染，不再只有文字規格；文件直接載入 `shared.css?v=20260602g`，並用 preview scope 隔離產品頁 layout，避免 App shell / Wizard / Hero 等整頁型元件撐爆文件。
- **統一 component relationship 語彙**：全文件把舊的 `Composed of / Used in` 改成 `Built from / Used by`，中文改成「由哪些元件組成／被哪些元件使用」，避免和規格欄位混淆。
- **整理 component card 內容順序**：Pillar 4 補 `Component card order`，product-owned cards 統一成 Purpose → Relationships → Specification，避免描述、關係、規格混雜。
- **4.2–4.25 基礎元件卡同步統一**：每張卡補 Purpose；有 composition graph 的卡補 Relationships，讓基礎元件與 product-owned 元件使用同一個閱讀順序。
- **收斂元件卡表面分類語彙**：把可見的 `Variants / States / Density / In context` 等標題收斂成 `Rendered preview / 視覺展示`，矩陣只作為預覽呈現方式；selector / state 等工程字眼留在「給工程師」摺疊內，避免設計閱讀時像同時存在多套分類。
- **補齊漏網 preview 標題**：Accordion 的 trigger matrix、Selection card 的 theme examples、Composer demo、Header full topbar、Table row/result examples、Chart segmented toggle 都併回同一個 `Rendered preview / 視覺展示` 外層；Icon registry 的「使用中／未使用」保留為合理例外。
- **統一 `Rendered preview / 視覺展示` 展示舞台**：只替視覺展示區塊建立清楚分隔；`.demo`、`.matrix`、`.matrix-block` 套用同一組產品式 surface / border / radius / spacing。元件卡本身維持文件分隔線排版，不整張變成 card；product-owned preview 仍可在舞台內保留 App shell、Wizard、Hero、Table 等不同使用背景。
- **整理元件關係排版**：`Relationships / 元件關係` 改成淡 surface 面板，Built from / Used by、layer label、chips、note 採用一致 spacing；Tabs 的第二個 `Rendered preview` 標題改為同一展示區下的說明文字，避免重複標題。
- **補齊 typography foundation scale**：`_tokens.css` 新增中性字級 token：`--type-display-64-*`、`--type-display-44-*`、`--type-title-40-*`、`--type-title-32-*`、`--type-title-24-*`、`--type-label-15-*`、`--type-label-14-*`、`--type-body-16-*`、`--type-body-14-*`、`--type-caption-12-*`；用途命名改放在 Pillar 2 role aliases。
- **補齊 1.2 字體視覺樣本**：`design-system.html` 的 type specimen 現在渲染全部 foundation scale：display-64、display-44、title-40、title-32、title-24、label-15、label-14、body-16、body-14、caption-12；不再把 button-label 渲染成按鈕。
- **系統名稱收斂為專案名與版本**：`design-system.html` / `design-system.md` / `_tokens.css` 中的舊系統名稱改為 `Ztor Creator Studio · R 2.1`；highlighter-yellow 仍保留為色彩語言描述。
- **`_tokens.css` cache buster 更新到 `v=20260603a`**，確保新增 typography role tokens 能被 `design-system.html` 與產品頁讀到；新增 token 不改既有產品 selector。
- **優化文件標題層級**：`design-system.html` 的 doc chrome 改用正式 typography token：`doc-title` → `--type-page-title-*`、Pillar title → `--type-h2-*`、`4.x` 元件標題 → `--type-h4-*`、`Purpose / Rendered preview / Specification` → `--type-section-label-*`，避免 design-system 文件使用另一套一次性字級。
- **同步 `component-library.md`**：正式 `ds-components/` 與仍在 `shared.css` / `chart.css` 的 project-owned components 分開列示，避免「尚未拆檔」被誤判成「不是元件」。
- **同步 `design-system.md`**：Icon source 改為 `icon.css + icons.js`；NavigationMenu anatomy 從舊 `.ztor-nav-*` 改為實際出貨 `.app-topbar__*`；inventory 補齊 project-owned components。
- **`design-system.html` 新增 Integrity Check**：在文件內檢查 duplicate id、broken internal href、broken compose chip、component card count 與 CSS link 清單，作為之後新增元件卡的基本防線。
- Integrity Check 改為檢查 **product-owned spec tables** 數量，防止 product-owned 元件卡只列關係、漏掉 anatomy / state / token / evidence 規格。
- Integrity Check 再補 **product-owned previews** 對照：會列出 spec table 數、preview 數、missing preview 與 extra preview，避免 4.26–4.40 之後只補規格沒補畫面。

---

## 2026-05-25 · R 2.1.0-preview · 從零搭起

### A. Spec-derived

- **新建 R 2.1 完整目錄**（`site/R 2.1/`），不 fork R 2.0；雖然 R 2.0 已經實作了相同 spec，但要重新探索 design language 而不被既有版面綁定。
- **Sitemap 與 R 2.0 一致**（14 頁產品頁 + design-system / sample），對齊 `03-設計規格書 §3`。
- **Dashboard hero banner 輪播**（spec §5.1.1.1）— 3 張 slide：建立活動（spec 要求第一張）、IP Market（spec 要求第二張）、整合連接（第三張延伸）。8 秒 auto-advance + 手動 prev/next/dots。
- **Dashboard KPI 4 卡**（spec §5.1.1.2）— Gross / Net / Pending / Available 嚴格分開呈現，符合 §5.3.3 財務術語規格。
- **Dashboard Alerts & Actions**（spec §5.1.1.4）— 4 種告警類型（warning / error / info / default），每個都深連結到對應模組（E-Shop / My IP / Settings / Events）。
- **Dashboard Revenue by Source 區塊**（spec §5.1.8.5 順延到 Dashboard 摘要）— stacked bar + 5 來源色碼 + 金額 + 百分比，預設只列 E-Shop / Event tickets / IP royalties / Licensing / Other，未來空間有限時可合併。
- **建立專案 4-step wizard**（spec 03.1 完整實作）— About / Showcase / Monetization / Review 四步，每步可前後切換 + jump-to-step + 底部 sticky action bar（spec §2.1）+ 草稿保存按鈕（spec §2.2）+ Review 摘要可返回編輯（spec §6.2）。
- **建立專案 IP Rental 入口**（spec 03.1 §3.6）— 放在 Step 1 About 區，明示「不取代 Step 3 的 Ads / Brand」，連到 ip-market.html。
- **IP 詳情頁完整實作**（spec 03.2）— IP Hero 三欄（cover / 摘要 / rental card）+ 可用狀態 pill + 法律提示 sticky-note + 條款 Permitted / Not allowed + 競標模式（bidding history + 出價輸入）+ 我的 IP owner manage panel（spec §2.5）。
- **IP 詳情頁雙模式切換**（spec 03.2 §3-4）— 同一頁同時呈現 rental + bidding。Rental card 提供 3 / 6 / 12 mo 期間切換 + 排他 switch；bidding 區塊提供 history + min-bid + place bid 輸入。
- **My IP 統計卡 + 分組清單**（spec §5.1.4.6）— Total IP / Total rentals / Total IP revenue 三 KPI + My IP / Rented tabs + 自有 IP 分為「IP I made on Ztor」「IP I own outside Ztor」+ Marketplace 開關 + 頁尾圖例（ON = 可租 / OFF = waterfall only）。
- **E-Shop 低庫存通知條**（spec §5.1.5.3）— 主篩選 tabs 上方獨立 alert-row，顯示低庫存商品數 + 直接動作。
- **E-Shop 主篩選 tabs**（spec §5.1.5.2）— Products / Bundles / Auctions 為主篩選分頁，不是獨立路由。
- **E-Shop 商品清單欄位**（spec §5.1.5.4）— Product / Category / Price / Stock / Status / Shop（visible 開關）。狀態短標籤（Active / Low）對應正式狀態語言（Live / Low Stock）。
- **商品細節頁 銷售摘要區塊**（spec §03.4 §2.5）— 銷售收入引用 Earnings、能追溯毛利 / 平台費 / 支付費 / 物流費 / 淨利；引用警告（spec §2.8）— 修改價格 / 庫存會影響已引用此商品的專案方案。
- **建立商品流程主分類 vs 次分類**（spec 03.5 §3 + §5.3.1）— 步驟 1 強制兩者同時存在，主分類 4 個（Physical / Digital / Special / Experience），次分類 9 個（spec 列表）。
- **Events 4 KPI**（spec 5.1.6 F2）— Total Events / Tickets Sold / Total Revenue / Avg. Attendance + 變化值。
- **Events 清單票券進度條**（spec §5.1.6.1）— 票券欄位顯示「已售 / 總數」+ 進度條輔助判讀。
- **建立活動 step 1**（spec 03.3）— 類型 / 時間 / 地點 or 線上連結 / 描述 / 封面五項，對應 spec「目前需記錄的內容」。
- **Fans CRM Leaderboard/Hall of fame 雙 tabs**（spec 5.1.7 F1）— 預設 Leaderboard，標題「Your fans, ranked」+ Leaderboard updates nightly 提示。
- **Fans CRM 4 摘要指標**（spec 5.1.7 F2）— Active fans / At risk / Revenue (active) / Avg reputation，Avg reputation 用新名稱（不是舊版 "Spent" / "Value"）。
- **Fans CRM Who's who 分布**（spec §5.1.7.3）— 4 等級（Inner Circle / Superfan / Devoted / Fan）+ 比例長條 + 數量 + 占比 + 收入 + Tier settings / Edit benefits 入口。
- **Fans CRM 流失風險提醒橫幅**（spec §5.1.7.4）— "5 fans at risk of dropping" + Message them 操作。
- **Fans CRM 粉絲清單欄位**（spec §5.1.7.5）— Fan / Tier / Reputation / Spent / Progress / Status；Reputation = 粉絲價值分數對外名稱、Spent = 累積消費對外名稱。
- **Earnings 4 主 tabs**（spec §5.1.8.2）— Overview / Transactions / Payouts / Tax Documents；Overview 為預設。
- **Earnings KPI 4 卡優先順序**（spec §5.1.8.3）— Gross / Net / Pending / Available（不放 Paid，Paid 留給 Payouts tab）。
- **Earnings 待結算 vs Available 嚴格分開**（spec §5.1.8.3 + sticky-note）— 顯示後加上明確說明 "Pending ≠ Available"，避免創作者誤認為可提領。
- **Earnings Revenue Trend + Revenue by Source**（spec §5.1.8.4-5）— 月份條形圖 + 5 來源 stacked bar + 名稱 / 金額 / 百分比。
- **Settings 6 sections**（spec §5.1.9）— Profile / Appearance / Notifications / Privacy & Security / Payments / Integrations，順序依 spec。
- **Settings Appearance 三選一**（spec §5.1.9.2 + §操作與狀態§2）— Light / Dark / System radio cards，即時套用（透過 `[data-theme-set]`），目前選取狀態以 `--active` 黃邊呈現。
- **Settings Payments + Tax**（spec §5.1.9.5）— Payout method primary + add new / payout schedule / minimum threshold / default currency；tax 區塊單獨拆出含驗證狀態 pill。
- **Settings Integrations connected vs available**（spec §5.1.9.6）— 連結平台依狀態（Synced / Sync failed / Partial）標示；未連結平台單獨分區 + Connect 按鈕。
- **狀態語言全站統一**（spec §5.3.2）— pill 元件統一收斂 4 種 variant（yellow / success / error / info / neutral），對應收入 / 專案 / 商品 / 活動 / 外部整合所有狀態。
- **財務術語標示**（spec §5.3.3）— 跨頁面收入數字一律標 USD + 引用 Earnings 來源；Dashboard / Projects / Product detail 不重算收入。
- **法律提示在 IP 相關頁面 sticky-note 呈現**（spec §5.1.4.7.f + §03.2 §2.4.5）— 平台記錄不等同正式法律合約的提示用 yellow tinted sticky-note callout 醒目顯示。

### B. 反饋導入

- **大改方向（不同設計語言）** — 採納反饋，從 horizontal topbar 改為 left sidebar 240 px、editorial bento layout、yellow 結構性使用（active nav 邊條、sticky-note）。詳見 [SPEC.md §0](SPEC.md#0-與-r-20-的關鍵差異)。
- **最小可瀏覽版** — 採納反饋，6 頁完整 + 10 頁可瀏覽 stub（不是「Coming soon」空頁，而是各頁的 IA + 部分範例資料），確保整站可導覽。

### C. 撤除（intentional removal · 跟 R 2.0 對照）

- **Horizontal topbar 主導航**：改為 left sidebar，因為 sidebar 永久可見、群組化（IP Bank / Commerce / Audience & money）能呈現 spec 的 sitemap 三層結構。
- **Topbar 內嵌 stepper**：wizard 流程獨立成 full-screen 模式，不顯示主導航，符合 spec §03.1 §2.1 「頂部顯示關閉 + 中央顯示步驟進度」的 focus mode 意圖。
- **Card-per-row 列表**：改為 row-divider 列表（`.data-list`），密度更高，更接近 spec 強調的「不是只有資料堆疊」的可掃描性。
- **R 2.0 重型 dashboard.css**（4154 行）：用更輕量的 `shared.css`（~700 行）替代。R 2.1 是 fresh take，不繼承 R 2.0 patterns。

### D. Infra / 文件

- **設計系統來源**：直接拷貝 `Design/Design System/ztor yellow/` 而非從 R 2.0 fork。內含 11 個基礎元件 + design-system.html + sample.html + design-system.md。
- **字型**：從 R 2.0 fonts/ 拷貝（Geist Variable / Geist Mono / Inter / Taipei Sans TC Beta × 3 weight），對齊 [feedback_product_spec_doc.md] 的「自架字型」要求。
- **theme.js + icons.js**：從 R 2.0 拷貝，未改動；R 2.1 product-spec doc 中標註為「沿用」。
- **新增 sidebar.js + hero.js**：sidebar 為共用導航，sidebar.js 依當前 pathname 注入 nav HTML + 標 active；hero.js 控 Dashboard 輪播。
- **SPEC.md + UI-CHANGES.md 完整撰寫**，對齊 [feedback_ui_changes_log.md] 的「A spec / B 反饋 / C 撤除 / D infra」分區嚴格度，以及 [feedback_product_spec_doc.md] 的 spec doc + icon registry + 自架字型 + UI-CHANGES 一條龍要求。

---

---

## 2026-05-26 · R 2.1.15-preview · design-system docs 升級到 DSS v1.4 7-Pillar 架構

### D. Infrastructure / 文件

`project-ui-creator` skill 升級到 v3 — 對齊 `Design/design-system-standard.md` 的 **DSS v1.4 7-Pillar 架構**（取代舊版「5 支柱」）。新規範 memory 已存於 `feedback_design_system_dss_v14`。本次走完整 edit-cycle protocol（讀 SPEC → 動工 → 同步 demo → 更新 UI-CHANGES + SPEC）把 R 2.1 design system 文件升上去。

**design-system.md（authoritative 文件）重構**：

| 舊章節 | 新章節 | 動作 |
|---|---|---|
| (無) | **`## Pillar 0 · Record`** | 新增：系統元資訊表（name / source / version / date / base / notes） |
| `## 1. Foundations` | **`## Pillar 1 · Foundation (raw tokens)`** | 改名；§1.1–1.10 sub-section 不動 |
| (隱含在 _tokens.css) | **`## Pillar 2 · Role (semantic assignments)`** | 新增：把 `--background / --surface / --primary / --foreground-muted / --status-*` 整理成 §2.1 Color / §2.2 Spacing / §2.3 Typography / §2.4 Elevation 四個 role 表格 |
| §1.8 Theme mode（散落） | **`## Pillar 3 · Mode`** | 新增獨立 pillar：13 個 dark-mode role overrides 表 + §3.2 半透明 surface 陷阱 + §3.3 HC 模式現況 |
| `## 2. Components`（2.1–2.21） | **`## Pillar 4 · Component`** | 改名；§4.1–4.21 sub-section 自動 renumber（sed） |
| `## 3. Patterns` + `## 4. Voice & Tone` + `## 5. Accessibility` | **`## Pillar 5 · Pattern`**（§5.1 Layout / §5.2 Voice / §5.3 Accessibility / §5.4 States / §5.5 Data viz / §5.6 Workflow） | 合併並 renumber，加上 R 2.1 app-tier 補充（chart family / bento / wizard / row-divider list） |
| (隱含) | **`## Pillar 6 · Structure`** | 新增：§6.1 Grid · §6.2 5 page templates · §6.3 Page-intro · §6.4 Topbar · §6.5 Hero |
| (隱含在 Identity Block 一行) | **`## Appendix A · Similar Systems`** | 新增：Notion / Linear / Vercel / Cursor / Attio / shadcn 對照表 |
| (無) | **`## Appendix B · Output formats`** | 新增：CSS Custom Properties / Tailwind v4 / W3C DTCG JSON 三種輸出範例 |
| (無) | **`## Appendix C · DSS v1.4 JSON skeleton`** | 新增：Record + Foundation + Role + Mode 全套 JSON 骨架（用 R 2.1 實際值填入） |
| `## 6. App surface (app.ztor.ai)` | **`## Source notes · App surface`** | 改名為「source notes」性質的歷史紀錄，不算 pillar |

**design-system.html 同步**：
- 頂部加 DSS v1.4 alignment banner（`#dss-v14`）— 7 列表格指向各 pillar 的位置（this page 或 `→ md`）
- 左側 sticky TOC 改 8 個 group（Overview · Pillar 0 · 1 · 2 · 3 · Component · Pattern · 6 · Appendix），標記哪些 pillar 只在 .md
- pillar header label 改名：「02 · Components → 04 · Component」/「03 · Patterns → 05.1 · Pattern ▸ Layout」/「04 · Voice → 05.2 · Pattern ▸ Voice & Microcopy」/「05 · Accessibility → 05.3 · Pattern ▸ Accessibility」
- 新增 `Appendix A · Similar systems`（6 個對照系統）+ `Appendix B · Output formats`（CSS / Tailwind v4 / DTCG JSON 三段 code-block）兩個 section

**SPEC.md §3.1 來源** 從「ztor yellow 的 5 支柱」改寫為「DSS v1.4 7-Pillar 架構」並列出每個 pillar 的當前 R 2.1 狀態（含 13 個 promoted 元件 + 5 page templates）。

新增驗證截圖（42 dss-v14 banner）。

### B. 反饋導入（同次連續調整）

- **使用者指出「(md only) 是什麼意思」** — 我原本把 Pillar 0 / 2 / 3 / 6 / Appendix C 推到 design-system.md 用文字 shortcut 連結，HTML 留斷頭連結 (`#record-meta` / `#role` / `#mode` / `#structure-md` 都不存在)。使用者選擇修法 B（**所有 pillar 都要 inline 在 HTML 內**），同時把規範同步到 `Skills/project-ui-creator/SKILL.md` 與 `Skills/design-system-analyzer/SKILL.md`。
- **HTML 7-Pillar 全部 inline 化**：補上 Pillar 0 Record（metadata 表）/ Pillar 2 Role（4 個 role 對照表 · color / spacing / typography / elevation）/ Pillar 3 Mode（dark override 完整對照表 + 半透明陷阱 + HC 現況）/ Pillar 6 Structure（grid + 5 page templates + page-intro + topbar + hero 共 5 個 sub-section）/ Appendix C（完整 DSS v1.4 JSON skeleton）。
- **TOC + DSS banner 表的 shortcut 全清掉**：所有 `(md only)` 標記、所有指向 `design-system.md#...` 的 → md 連結都改成同頁 `#anchor`。verified zero broken anchors（60 TOC links 全部解析成功）。
- **Skills 同步**：
  - `project-ui-creator/SKILL.md` §5 改成「所有 7 個 pillar + 3 個 appendix 必須 inline 在 HTML 內」+ 加驗收標準（zero broken anchors / 禁止 `(md only)` 或 `→ md` shortcut）+ 引用 R 2.1 落地實例。
  - `design-system-analyzer/SKILL.md` 最終檢查表加 2 條：no `(md only)` shortcut、TOC zero broken anchors（含 playwright 驗證 one-liner）。

### Future polish（非 blocker）
- Pillar 2 Role 的 token table 可加雙向 link 到 component CSS（目前只在文字描述）
- 真實 contrast pair live demo（目前用 hex 文字列，可換成 swatch）

新增驗證截圖（43 dss-v14 full pillars Role section）。

---

## 2026-05-26 · R 2.1.16-preview · 從 上游來源系統 同步新結構（§4.0 Classification + §6.0 Grid&templates token form）

### D. Infrastructure / 文件

使用者指出 上游母系統（parent design system）最近又升級了一輪，請把新加的東西帶進 R 2.1。對比 上游來源 design system（409 KB · 16 個 pillar sections）vs R 2.1（剛升到 v4 但少了 上游來源 v4 的一些 sub-section）。

**從 上游來源 v4 帶過來的核心新增**：

| 區段 | 來源 | 動作 |
|---|---|---|
| **§4.0 Classification** | 上游來源系統 design-system.html `#classification` | 完整 port — 4 個 sub-table（four pillars cross-reference / layer tags / Pattern vs Component / Status tags）+ 中文翻譯成 R 2.1 既有元件範例。Atomic Design × Component/Pattern 兩個 schools 合併成 4-pillar hierarchy 的概念導入 |
| **`.layer` CSS** | 上游來源系統 design-system.html lines 338-363 | 抄過來：5 個 layer variant（token / atom / molecule / organism / template / pattern）的 chip 樣式 + dark mode 處理 |
| **§4.1 Inventory 新增 Layer column** | 自行 fill 進 R 2.1 的 21 個元件 | 27 個 row 全部標 layer tag：7 atoms（Button × 2 / Badge / Status dot / Chip / Switch / Sticky-note / Input）+ 9 molecules（NavigationMenu / Card / Accordion / Cookie banner / Alert / KPI / Tabs / Empty stub / Selection card）+ 5 organisms（Header / Footer / Table / Data list / Chart）+ 1 template（Bento grid）+ 3 default placeholders（Iframe / Tooltip / Toast molecules） |
| **§6.0 Grid & templates (token form)** | 上游來源系統 design-system.html `#grid-system` | DSS canonical token form：grid 9 個 key（columns / gutter / margin / max-width / 5 breakpoints / adaptive / safe-area）+ 5 page templates 表（app-dashboard / app-tabbed / wizard-focus / settings-sidebar / empty-stub） |
| **§6.1 重命名為「Grid System (narrative)」** | — | 原本 §6.1 是 narrative，現在跟新 §6.0 token form 配對 |

**上游來源系統 有但 R 2.1 暫不引入**：
- **§5.2.1 Microcopy corpus** — 上游來源系統 有完整微文案語料庫；R 2.1 的 voice 短，不需要單獨抽 sub-section
- **§6.2–§6.7 vertical reference templates**（Marketing-specific / Mobile-specific / AI / E-commerce / Productivity / Industry-specific）— 上游來源系統 有這 6 個 catalog；R 2.1 是專案 specific（creator studio），不需要這個範圍。R 2.1 §6.2–§6.5 維持原本的 page template + page-intro + topbar + hero 主題
- **§4.21 Cross-cutting state conventions** — 上游來源系統 有；R 2.1 的 states 已經分散在 §5.4，不再單獨抽

**TOC + DSS banner 同步**：
- TOC「Pillar 4 · App-promoted」群加上 `4.0 Classification ✨`
- TOC「Pillar 6 · Structure」群加上 `6.0 Grid & templates (token) ✨`，原本 6.1 改 narrative
- ✨ 標記表示「上游來源 v4 同步來的新項目」

**驗證**：
- `#classification` + `#grid-system` 兩個新 section 存在
- 31 個 `.layer` tag chip 渲染正確（7 atoms × 2 columns / 9 molecules / 5 organisms / 1 template + Classification 表內 sample tags）
- 全部 60+ TOC links **0 broken anchors**

新增驗證截圖（44 classification-section）。

---

## 2026-05-26 · R 2.1.17-preview · 散裝 §2.28 → 元件各歸其位（§4.15-§4.25）

### B. 反饋導入

使用者批評精準：「現在頁面上的設計用到的元件，有許多好像都被放在 '2.28 應用推廣組件'。元件的命名與分類似乎都被頁面定義，其實從外觀上來看，應該可以被重新分類在其他 Pillar」。

**問題**：§2.28「App-promoted components」是一個 garbage drawer，把 alert / kpi / data-list / stickynote / tabs / chip / chart / bento / empty-stub / switch / selection-card 全部塞在一個 sub-section 內，依**來源**（從專案 promote 進來）分組而非依**元件身份**分組。使用者要找 Alert 應該在 §4.X Alert，而不是在 §2.28 → 內部 h4 中翻找。

**改完之後的 Pillar 4 結構（3 個 TOC group）**：

| TOC group | 範圍 | 性質 |
|---|---|---|
| **Pillar 4 · Component (base + project)** | §4.0 Classification + §4.1-§4.14 | base 元件 + Inventory + 4 個 ✓ Site extensions（Input / Table / Empty state / Pricing card） |
| **Pillar 4 · App-tier (R 2.1)** | §4.15-§4.25 | 11 個 R 2.1 從 shared.css promote 進來的元件，**每個都是一級 sub-section**（不再塞一起） |
| **Pillar 4 · Default (◎ shadcn)** | §4.26-§4.38 | shadcn baseline + vertical-specific catalogs（Marketing / Mobile / AI / E-commerce / Productivity / Industry-specific）+ cross-cutting |

### D. Infrastructure / 文件

**HTML 結構變更（design-system.html）**：

- **renumber 全部 sub-section 標題** `2.X → 4.X`（python script），with shift: 2.1-2.14 → 4.1-4.14；2.15-2.27 → 4.26-4.38（往上推 11 個位置讓 §4.15-§4.25 給 app-tier 用）
- **保留 Pillar 2 Role 既有的 2.1-2.4** 命名（這是 Pillar 2 不是 Pillar 4 — 之前的 sed 誤改了，已 revert）
- **§4.39 (was 2.28) "App-promoted components" 整段拆散**：
  - 11 個獨立的 `<section class="sub" id="...">` 取代原本的單一 container
  - 每個 sub-section 有 `<h3 class="sub__title">4.X NAME <layer tag> <status tag></h3>` + sub__index + sub__note
  - **新 anchor ID**：`#alert / #kpi / #data-list / #stickynote / #tabs / #chip / #chart / #bento / #empty-stub / #switch / #selection-card`
  - Card section variant + Badge status variants demos **撤掉**（這些是既有 §4.5 / §4.6 的擴充，重複呈現會冗餘 — design-system.md 已有完整規格卡）
- **TOC 從 1 個 Pillar 4 group 改 3 個** —「base+project」、「App-tier (R 2.1)」、「Default (◎ shadcn)」三段分清楚

**design-system.md 同步 renumber** — 既有 §4.11-§4.21 app-tier sub-section 全部 shift +4 變 §4.15-§4.25，跟 HTML 對齊。

### C. 撤除（intentional removal · 跟 R 2.1.16 對照）

- **§2.28 / §4.39 "App-promoted components" 單一 container** 整段移除。
- **Card (section wrapper) demo** + **Badge 5 status variants demo** 從 §4.39 撤掉（這兩個是既有元件的 project namespace 變體，§4.5 / §4.6 的 spec card 已涵蓋，不需要在 R 2.1 區再 demo 一次）。
- **TOC「2.28 13 components live」連結** 移除。

**驗證**：所有 11 個新 `<section>` 存在；TOC 60+ links **0 broken anchors**；§4.15 Alert 截圖（45）顯示獨立 sub-section + layer/status tags + 2 個 density 變體 demo 都正常渲染。

新增驗證截圖（45 alert-as-standalone-sub）。

### B. 反饋導入（同次續調）

- **使用者要求 TOC scrollspy** — 「現在的位置在 4.28，左側的選單要跟著標記在 4.28 的位置」。捲動到任何 section，左側 TOC 對應連結要自動高亮。
- **實作 IntersectionObserver scrollspy**：
  - 監聽所有有 id 的 `<section>` 元素
  - 進視口時計算「最靠近視口頂部、但仍在頂部 40% 範圍內」的 section 為 active
  - rootMargin `-10% 0% -50% 0%` — 在視口上方 10% 進入、下方 50% 區塊內保持 active
  - 找到 active 後對對應 `.toc a[href="#xxx"]` 設 `aria-current="true"`，同步 DSS banner 表的 anchor link 也 highlight
  - 點擊 TOC 連結時立刻 mark active（不等 scroll 觸發），避免高亮 lag
- **CSS active 樣式**：`a[aria-current="true"]` 用 `--surface` 底色 + 左邊 2 px `--primary` 黃色邊條 + `font-weight: 500`。語意清楚（這是現在閱讀的位置，不是 hover state）。

**驗證**（playwright）：捲到 `#default-feedback` → 600 ms 後 TOC `.toc a[aria-current="true"]` 文字為 `"4.28 Feedback & Overlays (◎ §3)"` ✓ · 視覺截圖 47 顯示 TOC 4.28 高亮 + 主內容滾到 §4.28 對齊。

**Skills 同步更新（後續所有 design system 文件都要遵守）**：
- `Skills/project-ui-creator/SKILL.md` §5 design-system.html 驗收標準加 2 條：(a) TOC scrollspy 必含 + 規範 active 樣式；(b) 元件不能用「來源」分類，必須依元件身份各自 `<section class="sub" id="...">`
- `Skills/design-system-analyzer/SKILL.md` 最終檢查表加 2 條：scrollspy 必含 + playwright 驗收 one-liner；no garbage drawer 反例引用 R 2.1 case study

新增驗證截圖（46 toc 整體 / 47 scrollspy 對齊 viewport）。

---

## 2026-05-26 · R 2.1.18-preview · Earnings Revenue trend 升級成 source-style chart-card

### B. 反饋導入

使用者參考 上游來源網站 一張 Visibility 趨勢圖（card with eye icon + title + subtitle · `D / W / M` segmented + export · y-axis $ ticks · 5 colored series · footer 「Showing data for N days」+ chart-type toggle），要求 Earnings 的 Revenue trend 做成這樣的元件。

### D. Infrastructure / 文件

- **`ds-components/chart.css` 新增 §4 Chart card 區段**（約 130 行）：
  - **`.chart-card`** 擴充 `.card`，內含 `__head` / `__body` / `__foot` 三段 chrome
  - **`.chart-card__head`** flex space-between：左 `.chart-card__title-group`（icon + title + subtitle）/ 右 `.chart-card__controls`（segmented + icon button）
  - **`.chart-card__foot`** 同樣 flex space-between：左 data range prose / 右 `.chart-card__foot-actions`（line/bar 切換）
  - **新增 `.segmented` 元件**（generic D/W/M tab pill）— inline 在 chart.css，將來可以 promote 成獨立 ds-components/segmented.css 若其他地方用到
  - **`.chart-card__icon-btn`** 28×28 outlined 圖示按鈕
  - **`.chart-card__watermark`** 中央 12% opacity 浮水印 slot（這次沒用，但留 hook）
- **linechart axes + multi-series 擴充**：
  - **`.linechart--axes`** modifier：把 linechart 變 grid layout（36px y-axis 欄 + 1fr main 欄）
  - **`.linechart__y-axis`** 容器 + `.linechart__y-tick` 絕對定位的 tick label（用 `style="top:X%"` 控位置）
  - **`.linechart__labels--sparse`** flex space-between — start / middle / end 三個日期 label，取代原本 6 個月平均分布
  - **5 色 series**：`.linechart__line--s1`（primary 黃）/ `--s2`（status-success 綠）/ `--s3`（status-info 藍）/ `--s4`（status-error 紅）/ `--s5`（foreground-subtle 灰）。每條都 `fill: none; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round`
- **Earnings Revenue trend section 完整重寫**（earnings.html lines 67-115 範圍）：
  - 用新 `<section class="card chart-card bento--span-7">` 包裝
  - 5 條 polyline 對應 5 個 revenue source（Gross total / E-Shop / Event tickets / IP royalties / Licensing）
  - Y-axis 4 個 tick（$28k / $20k / $10k / $0）
  - X-axis 3 個 sparse label（Jun / Sep / Nov 2025）
  - Header `M` 預設 active（month range），上方 `trending-up` icon
  - Footer toggle 預設 line view active
- **i18n 新增 2 keys**：`earnings.legend.sub` "Gross revenue by source over time" / `earnings.foot.range` "Showing data for last 6 months"（兩個都 EN-only，等之後補中文）

**驗證**：截圖 49 顯示完整 chart card 渲染（header + 5-series multi-line chart + y-axis ticks + 3 sparse x-labels + footer）。

### 已知問題

第一次 deploy 時截圖 48 顯示 layout collapse — 因為 browser 用了舊 chart.css cache（沒有新的 `.chart-card__head { display: flex }` 規則），所有 inline polylines 變黑色填色 + header 整個塞成單欄。Force fresh fetch（`fetch('ds-components/chart.css?bust=' + Date.now())`）後正常。**未來凡是改 ds-components/*.css 都應該 bump cache buster**（per skill §後續編修必跑流程 step 7）。

新增驗證截圖（48 cached / 49 fresh chart-card 對比）。

### B. 反饋導入（同次續調）

- **使用者要求 footer 的 line/bar 切換要實際生效** — 點 grid icon 切到長條圖視圖（上游來源系統 參考圖 visibility bar chart）。
- **新增 `.barchart` 子元件** to chart.css：vertical bars 5 色（s1-s5 對應 5 個 revenue source）+ rounded top + `__bar__label` 絕對定位於 bar 下方
- **chart-card 加 `data-chart-view` 屬性**（`"line"` / `"bar"`），CSS 用 attribute selector 控制哪個視圖顯示
- **JS 切換**：earnings.html inline script 加 `[data-chart-toggle]` click handler，點按鈕 → 更新 `data-chart-view` + `segmented__item--active` swap
- **CSS 衝突修正**：bar-wrap 用 `.linechart linechart--axes barchart-wrap` 共用 grid layout（y-axis 36 px + main 1fr）。原本「hide linechart when view=bar」會把 bar-wrap 也藏掉；改用 `.linechart:not(.barchart-wrap)` 排除。

**驗證**：點 grid icon → `data-chart-view="bar"` set ✓ · 5 bars 顯示（Gross 黃高 / E-Shop 綠 / Events 藍 / IP 灰 / Licensing 紅）· Y-axis 4 個 $ tick · X-axis source labels · line view 自動隱藏。

新增驗證截圖（50 chart-card bar view）。

### B. 反饋導入（同次續調 · 視覺對齊）

- **折線圖左側加垂直虛線軸** — 上游來源系統 參考圖在 y-tick labels 與 chart body 之間有條 dashed 灰線。`.linechart__y-axis` 加 `border-right: 1px dashed var(--border)`，180 px 整段。
- **長條圖：bars 變窄 + 間距變大** — 上游來源系統 參考圖的 bars 約 44 px 寬、彼此 36 px 間距、左對齊。`.barchart`：`gap: 18px → 36px`、`justify-content: flex-start`、`padding: 0 12px`。`.barchart__bar`：`flex: 1 → width: 44px; flex-shrink: 0`。
- **`__bar__label` overflow 允許溢出** — bar 變窄後 "Licensing" 顯示成 "Licensi..."。改 `left: 0; right: 0` → `left: -14px; right: -14px`（給 label 28 px 比 bar 寬的呼吸空間），移除 `overflow: hidden / text-overflow: ellipsis`。

新增驗證截圖（51 line + 垂直虛線軸 / 52 bar narrower wider gap）。

### B. 反饋導入（Revenue by source 改 rank-bars · 上游來源系統 Domain types 參考）

- **Earnings → Revenue by source 從 `.stacked-bar` + `.source-list` 改成 rank-bars** — 使用者提供 上游來源系統「Domain types」參考圖：每個來源一列，列內有依占比縮放的填色 pill，pill 上疊「色點 + 名稱」，百分比靠右。比舊的「一條 stacked bar + 下面圖例」更易逐項比較。
- **新增 `.rank-bars` 子元件** to chart.css（chart family 第 4 個 sub-pattern）：`.rank-bar` row grid = `[track 1fr][pct 48px]`；`.rank-bar__fill` 為 `--surface-muted` pill，**寬度縮放成最大值 = track 100%**（consumer 算 `row_pct / max_pct * 100`）；`.rank-bar__content`（dot + label）疊在 fill 上、永遠靠左。
- **card head 加前置 `tag` icon** — 對齊參考圖標題左側的標籤 icon。
- 同步 design-system.html（§4.21 Chart 加 `.rank-bars` demo，sub__index 改「4 sub-patterns」）+ design-system.md（§4.21 加 Rank bars 段 + 元件清單列）。

新增驗證截圖（rank-bars-01 earnings / rank-bars-ds2 design-system demo）。

### B. 反饋導入（同次續調 · 標題 icon + chart-card padding）

- **Revenue by source / Revenue trend 兩個 card head 標題前不放 icon** — 使用者明示兩處都不需要。移除 Revenue by source 的 `tag` icon 與 Revenue trend 的 `trending-up` `.chart-card__title-icon`，design-system.html §4.21 rank-bars demo 同步拿掉 icon、md note 改「no leading icon」。
- **chart-card 外層 padding 修正為 0** — card.css 在 chart.css 之後載入，`.card { padding: 20px }` 蓋過 `.chart-card { padding: 0 }`，導致 chart-card 多了 20 px 外距、head/foot 分隔線無法滿版。chart.css 改用 `.card.chart-card` 提高 specificity 強制 0，head/body/foot 各自的 padding 才是唯一間距來源（與設計意圖一致）。

### B. 反饋導入（data-list icon 對齊 alert 尺寸 · 全站）

- **data-list icon chip 放大到與 Alerts & actions（`.alert--card`）一致** — 使用者要求「所有 icon 都要和 Alerts & actions 一樣尺寸，但顏色黑白單色、icon 維持線框（outline）」。`.data-list__icon` 由 `32×32 / --radius-sm` 改成 `40×40 / border-radius:10px`，內層 `.ztor-icon` 固定 20px。維持既有 monochrome（`--surface-muted` bg + `--foreground-muted`），不採 alert 的 status 填色。
- **data-list 內的 unicode 符號字（＄♪⌬⤓⎙⌧✓✕★↻◐◑◒◓⌁）全部換成 lucide outline icon** — 原本用符號字當 icon，改用真正的線框 icon。映射：`＄→receipt`、`♪→play`、`⌬→file-text`（licensing/合約/合作）、`⤓→download`（payout/提領）、`⎙→file-text`（稅務文件）、`⌧→package`（商品）、`✓→check-circle`、`✕→x-circle`、`★→award`、`↻→refresh-ccw`、`◐◑◒◓→circle`（中性 project/IP 狀態）、`⌁→calendar`（events）/ `circle`（dashboard 進行中專案）。跨 9 個頁面共 47 + 4 處。
- **保留數字序號**（ip-detail 競標排名 ①②③）— 那是排名語意、不是 icon，留原樣。

### D. infra

- **design-system.html 補 `.ztor-icon` base size rule**（16×16）到 doc `<style>` — 該頁未載入 shared.css，bare `.ztor-icon`（非 alert/topbar 容器內）原本無尺寸規則，lucide 替換後的 SVG 會撐到 viewBox 預設大小。
- **icons.js registry 新增 outline `x-circle`** — data-list「Not allowed」列需要線框版 x-circle（原本只有 `x-circle-fill`）。
- **create-project.html 補載入 `icons.js`** — 該頁有 1 個 data-list icon 但先前沒載 registry，glyph 換成 `<i data-lucide>` 後需要 icons.js 才能渲染。

### B. 反饋導入（Dashboard 與 Earnings 的 Revenue trend / source 元件對齊）

- **Dashboard 的 Revenue trend / Revenue by source 改用與 Earnings 同一套元件** — 使用者指出兩頁同名區塊用了不同元件（先前的升級只改 Earnings，Dashboard 沒跟到而 drift）。Dashboard 的樸素 `.linechart`（包在普通 card）→ 完整 `.chart-card`（head 含 D/W/M segmented + export、body 含折線/長條雙視圖、foot 含 line/bar 切換）；`.stacked-bar` + `.source-list` → `.rank-bars`。資料與 Earnings 一致（Dashboard 引用 Earnings、不重算，符合 §5.3.3）。
- **Dashboard 補 chart-toggle inline JS** — 與 Earnings 同行為：點 foot 的 line/bar 按鈕切換 `data-chart-view` + swap `segmented__item--active`。
- 取捨記錄：Dashboard 原為摘要頁、用較輕的 linechart（含 current vs prev period 雙線比較）。使用者選擇「完全對齊用同一套元件」，故換成完整 chart-card；prev-period 虛線比較功能在此捨棄，改為 5-source 多線 + 可切長條，與 Earnings 一致。

### B. 反饋導入（Revenue trend 改單線 12 個月 + Earnings 排版獨立一行）

- **Revenue trend 折線圖改成單一條線、橫軸 12 個月、縱軸收入** — 原本是 5-source 多線（6 個月）。改成一條 gross revenue 線（Dec→Nov 共 12 點）+ area fill + 每點 dot + 末點 accent；x 軸 12 個月標籤。兩頁（Dashboard + Earnings）共用同元件、同步改。
- **長條圖改成 12 根月份 bar、縱軸收入** — 原本是 5 根 source bar（Gross/E-Shop/Events/IP/Licensing）。改成 12 根月份 bar（Dec→Nov，全 primary 色），高度 = 當月收入占比。
- **`.barchart` 從固定寬（44px/gap 36px，為 5 bar 調的）改成 flex-fill**（`flex:1` + `gap:8px` + `space-between`），自動容納 ≈12 根；bar label 縮到 10.5px、`left/right:-4px`。撤銷 R 2.1.18 的 5-bar 寬度設定（資料模型已從 5-source 改 12-month）。
- **Earnings 排版：Revenue trend 獨立站一行** — chart-card `bento--span-7 → span-12`、Revenue by source `span-5 → span-12`，同一個 `.bento` 內兩個 span-12 自動各佔一列。**僅改 Earnings**；Dashboard 維持 span-7 + span-5 並排。
- subtitle 文案 `Gross revenue by source over time → Gross revenue over time`；foot `last 6 months · 5 sources → last 12 months`。i18n 補 `earnings.legend.sub` / `earnings.foot.range` 雙語條目（原本只有 HTML fallback、無 zh）。

新增驗證截圖（earn-trend-line / earn-trend-bar / dash-12mo）。

新增驗證截圖（dash-parity-line / dash-parity-bar）。

### B. 反饋導入（去數量 + 折線收尾 + dropdown 箭頭）

- **Earnings 主 tab 去掉數量** — Transactions / Payouts 後面的計數 chip（214 / 12）移除，4 個 tab 只留文字。
- **Transactions 篩選 chip 去掉數量** — All / E-Shop / Event tickets… 後面的 `chip__count`（214/96/42…）全移除（7 個）。
- **Revenue trend 折線圖修變形 + 收尾貼齊** — 因 `preserveAspectRatio="none"` 橫向拉寬而線寬走樣：(a) chart.css 加 `vector-effect: non-scaling-stroke`（線寬不隨非等比縮放變形）；(b) 移除所有 dot 圓圈，只留線；(c) 線的 x 從 25–575 改成 **0–600**（起點貼齊 y 軸、尾端貼齊右緣），area fill 一併延伸到底（y=180）；(d) `.linechart--axes` grid `gap: 8px → 0`，line 起點與 y 軸刻度間零間隔。
- **修正 native `<select>` 下拉箭頭太靠邊** — `.select` 原為瀏覽器原生外觀、箭頭擠邊看起來像壞掉。改 `appearance: none` + 自畫 chevron-down（data-uri SVG）`background-position: right 12px center` + `padding-right: 34px`。shared.css 全站生效（Earnings「This month」、Tax「All quarters」等所有 select）。

### B. 反饋導入（chart 對齊 shadcn charts）

參考 shadcn/ui charts（line「Interactive」+ bar default 的 `card-content`）重做 Revenue trend：
- **折線改 smooth monotone 曲線** — 原本 straight polyline，改成 Catmull-Rom→Bezier 的 `<path>`（type=monotone 風格），`<polygon> area` 一併改 `<path>` 平滑邊。對齊 shadcn `<Line type="monotone" dot={false}>`。保留我們的 y 軸刻度（shadcn 那個沒有 y 軸，使用者要求補上）。
- **長條圖對齊 shadcn bar** — bar 圓角 top `radius 8`（原 `--radius-sm`）；`.barchart` 加水平 gridlines（multi linear-gradient at 5/33/60/88%，對齊 y-tick），對應 shadcn `CartesianGrid vertical={false}` + `<Bar radius={8}>`。
- **chart-card__body 左右 padding 加大** — `16px 18px 8px → 16px 28px 12px`。
- **右下角 line/bar 切換 icon 換掉** — `trending-up`/`layout-grid` 換成 `chart-line`/`chart-column`（軸線型圖表 icon，更貼切）。icons.js registry 新增這兩個 outline icon。
- 兩頁（Dashboard + Earnings）共用同元件，同步生效。
- 註：chart-card / barchart 這套組合元件在 design-system.html 尚未建獨立 demo（只有基礎 `.linechart` + rank-bars），本次精修先記在 chart.css 註解 + 本檔；之後若補 chart-card spec card 再一起對齊。

新增驗證截圖（shadcn-line / shadcn-bar）。

### B. 反饋導入（chart hover tooltip · 對齊 shadcn ChartTooltip）

- **Revenue trend 加 hover 互動** — 對齊 shadcn `ChartTooltip` 行為：
  - 折線：滑鼠移過顯示**垂直 cursor 線 + 線上圓點 + tooltip 卡**（label 月份 + 色塊 + Revenue + 金額）。
  - 長條：hover 顯示 **tooltip 卡 + bar 後方淡色欄位高亮**（`.chart-bar-cursor`，z-index 0、bar 提到 z-index 1）。
- **新增 `chart.js`（共用、無依賴）** — 處理 chart-card 的 view 切換 + hover。資料用 `data-chart-series`（`[{label,value,y}]`，y 是 viewBox-Y 讓圓點貼齊曲線）+ `data-chart-name` 從 HTML 餵入，元件 data-driven。兩頁 `<script src="chart.js">` 引入。
- **移除兩頁 inline 的 line/bar toggle handler**，邏輯收斂進 chart.js（earnings 的 tab / chip filter handler 保留）。
- tooltip / cursor 樣式加在 chart.css（`.chart-tip` / `.chart-cursor` / `.chart-cursor__dot` / `.chart-bar-cursor`）。
- 說明：非用 shadcn 原始 React/Recharts code（框架不相容），是照其視覺與互動規格用 vanilla JS + inline SVG 手刻。真正搬 Recharts 留待之後 dev handoff 轉 React/Next.js。

新增驗證截圖（hover-line / hover-bar）。

### B. 反饋導入（Earnings 版面 Revenue by source 與 Recent 同行 + bar 變細 + View all 統一）

- **Earnings Overview：Revenue by source 與 Recent transactions 同一行** — Revenue trend 保持 span-12 獨佔一列；下一列改成 Recent transactions (span-7) + Revenue by source (span-5)。（上一版誤改在 Dashboard，已**還原 Dashboard** 為原本的 Recent earnings + Alerts / Revenue trend + Revenue by source。）
- **bar chart 柱子變細（不靠加大 gap）** — 撤銷上一版把 `.barchart` gap 8→18 的做法（gap 還原為 8）；改用 `.barchart__bar { flex:1 1 0; max-width: 40px }` 把柱子上限收窄（≈ 原本 77px 的一半），靠 `justify-content: space-between` 平均散開。視覺間距變寬但機制是「柱子變細」而非「加大 gap」。
- **所有 card head 的「View all」連結統一** — 字體大小一致（earnings 那顆 `<button>` 原本 `font:inherit` 比較大，移除後吃 `.card__link` 的 12.5px）；文案一律 `View all`（去掉「transactions →」字樣與箭頭）。i18n `btn.view-all` 改為 `View all / 查看全部`。

### A. Spec-derived（對齊更新後的 hero banner 規格 · 03.6）

- **Dashboard hero banner 重做以對齊 03.6-Dashboard-Hero-Banner.md** — 規格已更新：3 張 banner、順序固定為 ① 建立專案 ② 探索 IP 市場 ③ 建立活動，且各自有指定文案。
  - 先前實作是錯的：缺「建立專案」（應為第一張）、順序錯（建立活動排第一）、多了一張規格沒有的「Connect platforms / Audience」（自行生成）、且文案是自編而非規格文案。
  - **撤除** Audience/Connect platforms slide（spec 把 Audience Intelligence 定位成 Dashboard/Fans/Earnings/Settings 的情境化摘要，不是 hero banner）。連同 i18n `hero.audience.*` / `btn.connect-platforms` / `hero.eyebrow.quick` / `hero.eyebrow.reach` 一併移除。
  - 新增 slide「建立專案」（→ create-project.html，CTA 開始第一個企劃 / See projects），zh 文案逐字採用 03.6 §2.1 主選文案；IP / 建立活動 slide 的 zh 文案也改成 03.6 §2.2 / §2.3 主選文案；IP CTA 改「探索 IP 市場 / Explore IP Market」。
  - EN 文案為對應翻譯（非規格原文，可再調）。i18n 新增 `hero.project.*` / `hero.eyebrow.start` / `hero.eyebrow.extend` / `btn.start-project` / `btn.see-projects`。
  - 圖片：建立活動用 hero-event.jpg、IP 用 hero-ip.jpg、建立專案暫借 hero-audience.jpg（原 audience slide 釋出的圖）。
  - 同步更新 SPEC.md §4 Dashboard 列備註（標明 3 banner 順序與文案以 03.6 為準）。

### B. 反饋導入（hero 微調）

- **移除 hero eyebrow 標籤** — 三張 slide 的 `● 探索/開始/延伸` eyebrow 全部移除（使用者要求；共用元素一起拿掉保持一致）。
- **hero 標題加寬** — `.hero--fullbleed .hero__title` `max-width 640 → 840`、`.hero__copy` `720 → 880`，原本太窄逼成 3 行、改成 2 行（對齊使用者提供的小尺寸 breakpoint 樣式）。

### D. Infrastructure / 文件（按鈕收進元件庫）

- **`.btn*` 從 shared.css 搬進 `ds-components/button.css`** — 使用者指出按鈕應該用元件庫的。原本元件庫只有 canonical `.ztor-btn*`，產品頁實際用的 `.btn / .btn--primary / --outline / --ghost / --lg / --sm` 卻定義在 shared.css。比照 card.css 的雙命名空間慣例（`.ztor-card` 文件 canonical + `.card` 產品），把 `.btn*` 移進 button.css，讓按鈕由元件庫供給。**無視覺變化**（規則原樣搬移）。
- shared.css 只保留 hero 專屬的 `.hero__actions .btn--ghost`（深底亮字 override）。
- design-system.html 補 `<link button.css>`（它用 `.btn` 48 處但原本沒連 button.css、靠 shared.css；移動後需直接連元件庫檔）。
- 註：sample.html 用 `.btn` 但 shared/button.css 都沒連，本來就沒套到樣式，非本次回歸。

### B. 反饋導入（hero outline 配色 + 按鈕 icon 間距）

- **hero outline 按鈕在 dark mode 配色修正** — `.hero__actions .btn--outline` 原本用 `var(--surface)/var(--foreground)`，dark theme 會翻成半透明濁色 + 淺字。hero 照片在明暗主題都是深色，故改成 theme-independent 固定淺底（`#FAFAF7`）+ 深字（`#171717`）+ micro-shadow，兩個主題都呈現一致的淺色 Outline 按鈕。
- **按鈕 icon ↔ label 間距 6px → 8px** — 使用者反映有 icon/箭頭時間距太擠。`.btn` / `.ztor-btn` gap 改 8px。hero 三顆 CTA 的尾端 `→` 從 i18n 字串裡抽出來、改成獨立 flex child（`<span class="btn__icon">→</span>`），這樣 8px gap 才生效；i18n `btn.see-projects/my-ip/see-events` 去掉字串內的 `→`。
- **同步 design system（skill 規則：改元件 → 同步 design-system）** — design-system.html §4.2：`.dm-btn` 加 `gap:8px`、anatomy 標 `gap 8px`、prose 說明「icon/箭頭要當獨立 flex child、不可塞進 label 字串」、新增「With icon」demo、spec-table 加 Gap 列。design-system.md §4.2 同步加「Icon ↔ label gap」段 + spec 列。

### B. 反饋導入（全站 scroll fade-in 進場動態）

- **每頁區塊加入「淡入 + 輕上移」進場動畫** — 使用者要求。滾動進視窗時觸發（IntersectionObserver），首屏上方載入即淡入、下方滾到才淡，每個區塊只播一次；同列／同群組做 ≤240ms 的 stagger。
- **新增共用 `reveal.js`**（無依賴）— 查詢區塊層 selector（`.hero__copy / .section-head / .kpi / .card（含 chart-card）/ .tabs / .stickynote / .ztor-table / .alert--row / .filter-row / .empty-stub`），跳過巢狀目標避免重複淡入；加 `.reveal` + 觀察、進場加 `.is-in`。14 個產品頁 `<script src="reveal.js">`。
- **CSS 在 shared.css**：`html.reveal-on .reveal { opacity:0; translateY(10px); transition .5s var(--easing) }` → `.is-in` 還原。
- **安全**：初始隱藏只在 JS 加上 `.reveal-on` 後生效 → 沒 JS／載入失敗內容照常顯示；`prefers-reduced-motion` 直接顯示不做動畫（JS early-return + CSS guard 雙保險）；純 opacity/transform 不影響排版。
- 範圍：僅 14 產品頁；design-system.html（已有自己的 scrollspy observer）與 sample.html 不納入。

**最後一波 promote**：

| 元件 | ds-components/ | design-system.md | design-system.html | 頁面 link |
|---|---|---|---|---|
| **switch** | ✓ 新檔 `switch.css` · `.switch / .switch--on` + 滑動 knob 動畫 | ✓ §2.20 | ✓ §2.28 · on + off 範例 | 7 頁（settings / e-shop / my-ip / earnings / ip-detail / create-project / design-system 透過 demo） |
| **selection-card** | ✓ 新檔 `selection-card.css` · merged `.choice-card + .appearance-card` 進統一 API：`.selection-card / __title / __sub / __tag / __swatch(--theme-light/--theme-dark/--theme-system) / --active / .selection-grid / .selection-grid--3` | ✓ §2.21 | ✓ §2.28 · 2 個 composition（wizard radio + theme picker） | 4 頁（3 wizard + settings） |

### B. 反饋導入

- **`.choice-card + .appearance-card` 合併進 `.selection-card`** — 兩者結構幾乎一模一樣（cursor pointer + hairline ring + yellow active outline），差異只在 `.appearance-card` 多了一個 64 px 主題預覽 swatch 子元件。合併後：
  - 統一 `.selection-card` base + 可組合的 slot（title / sub / tag / swatch）
  - `__swatch` 子元件帶 `--theme-light / --theme-dark / --theme-system` 變體，原本父層的 `.appearance-card--dark/--system` modifier 收進子元件
  - `.selection-grid` (auto-fit min 220px, wizard 用) + `.selection-grid--3` (3 等寬, theme picker 用) 統一 layout
- **HTML 全 migrate（4 個檔案）**：3 個 wizard 的 `.choice-card` block + settings 的 `.appearance-card` block 都轉為 `.selection-card`。JS 內部的 querySelector 也一併更新（`.choice-card → .selection-card`、`.appearance-card--active → .selection-card--active`）。
- **Migration bug + fix**：原本 regex-based theme variant 轉移失敗（因為 `__swatch` 不是 immediate sibling，父層 `--dark/--system` 沒能正確 propagate 到 `__swatch`），所有 swatch 都拿到 `--theme-light`。手動補正 settings.html 的 dark / system 兩個 swatch。

### C. 撤除（intentional removal · 跟 R 2.1.13 對照）

- **`.choice-card / __title / __sub / __tag / __active`** + `.choice-grid` — 6 條 rule 移除（已合進 selection-card）。
- **`.appearance-card / __title / __swatch / __active / --dark / --system`** + `.appearance-grid` — 8 條 rule 移除（已合進 selection-card）。
- **`.switch` + `.switch--on` 從 shared.css** 移到 ds-components/switch.css。
- **shared.css 內所有 scattered "promoted to ds-components/..." breadcrumb comments**（散落在 11 個位置）— Python regex 一次清掉，留一個 consolidated header block 在 shared.css 開頭附近（line 360+），完整列出 13 個 promoted 元件對照表 + 哪些 patterns 保留 project-level。git history 是真正的 audit trail，shared.css 本體不再被零碎 comment 切割。

### 進度回顧

| Phase | 元件 | 狀態 |
|---|---|---|
| Phase 0 | `.surface → .card` / `.pill → .badge` rename | ✓ R 2.1.10 |
| Phase 1 | alert · kpi · data-list · stickynote | ✓ R 2.1.11 |
| Phase 2 | tabs · chip | ✓ R 2.1.12 |
| Phase 3 | chart · bento · empty-stub | ✓ R 2.1.13 |
| **Phase 4** | **switch · selection-card (merged choice+appearance) + shared.css cleanup** | **✓ R 2.1.14（本次）** |

**完整 promote 清單（13 個 ds-components 新檔案）**：alert · badge · bento · card · chart · chip · data-list · empty-stub · kpi · selection-card · stickynote · switch · tabs

**保留 project-level**（單頁專用 composition pattern，不是 reusable component）：
- `.hero / __slide / __copy / __title / __sub / __actions / __nav / __dots / __dot` — Dashboard hero carousel
- `.wizard / .stepper / .wizard__top / __close / __body / __step-title / __bottom` — create-* wizard frame
- `.settings-layout / .settings-nav / .settings-row / .settings-section` — Settings sidebar layout
- `.ip-hero / .meta-cell / .rental-card / .duration-chip / .duration-grid` — IP detail page
- `.page-intro / __eyebrow / __title / __sub / __actions` — 11 頁通用 header（其實算 layout pattern，目前留 project-level）
- `.section-head / __title / __sub` — 太薄，3 條 rule 不值得 promote
- `.app-topbar*` — R 2.0 canonical topbar 結構

這些之後若被第二個專案複用就 promote；目前只在這個 R 2.1 用。

**截圖**：40（settings 頁顯示 selection-card 3 變體 + switches）/ 41（design-system.html §2.28 完整 15 個 promoted 元件 live demo）。

---

### D. Infrastructure / 文件

| 元件 | ds-components/ | design-system.md | design-system.html | 頁面 link |
|---|---|---|---|---|
| **chart** | ✓ 新檔 `chart.css` 含 3 sub-pattern：linechart + stacked-bar + source-list | ✓ §2.17 | ✓ §2.28 · linechart dual-line + stacked-bar + legend | 4 頁（earnings / fans-crm / index / 透過 design-system demo） |
| **bento** | ✓ 新檔 `bento.css` · 12-col grid + `--span-{3,4,5,6,7,8,9,12}` + 900px mobile fallback | ✓ §2.18 | ✓ §2.28 · 4×span-3 + 1×span-7 + 1×span-5 範例 | 9 頁 |
| **empty-stub** | ✓ 新檔 `empty-stub.css` · `.empty-stub / __inner / __mark / __title / __sub / __refs` | ✓ §2.19 | ✓ §2.28 · 整版 stub 範例 + chip refs | 4 頁（e-shop / events / ip-market / projects） |

**`.chart` 合併設計**：把 `linechart / stacked-bar + stacked-bar__seg / source-list + source-row + __swatch/__amt/__pct` 三個原本獨立的 pattern 合進單一 `chart.css`，因為它們經常一起出現（dashboard / earnings 的 Revenue trend + Revenue by source 兩個 surface 是配對使用）。design-system.md §2.17 用 sub-heading 區分三種 sub-pattern：
- **Line chart** — single 或 dual-line（含 `--prev` dashed overlay）+ accent dot
- **Stacked bar** — 水平比例條，每段 width / color 走 inline style（不假設 palette）
- **Source list** — 4-col grid legend，配 stacked-bar 顯示完整 amount + %

**`.bento` 是 utility 不是 component 嗎**：算混血。它是 layout grid，沒有 anatomy / variants 的 component 語意；但因為它的 `--span-N` modifier 是 R 2.1 dashboard / earnings layout 的核心，promote 進 ds-components 讓 design system 完整描述 layout 規則。design-system.md §2.18 也標明它是 layout utility 而非 anatomy-style component。

**`.empty-stub` API 不動**：之前在 shared.css 已經穩定，直接抽出。**注意 ds-components/empty-stub.css 用到 `.chip--static`**（在 `.empty-stub__refs` 內），所以使用 empty-stub 的頁面需要同時載入 chip.css。e-shop / events / ip-market / projects 都已透過 Python script 自動加上 chip.css（如果還沒）。

**shared.css 撤除**：`.linechart*`（35 行）+ `.stacked-bar*`（10 行）+ `.source-list / .source-row*`（11 行）+ `.bento*`（17 行）+ `.empty-stub*`（30 行）共約 103 行移除，留 3 條 comment。

**design-system.html load 新 CSS**：`<link>` 補 chart.css / bento.css / empty-stub.css。§2.28 demo 區擴充 4 個新 sub-section（linechart / stacked-bar + source-list / bento grid 範例 / empty-stub 範例）。

**design-system.md** §2.1 Inventory 表加 3 列（Chart / Bento / Empty stub）標 `✓ App`。

**截圖 39**（design-system.html §2.28 含全部 13 個 promoted 元件 live demo）。

### 進度回顧

| Phase | 元件 | 狀態 |
|---|---|---|
| Phase 0 | `.surface → .card` / `.pill → .badge` rename | ✓ R 2.1.10 |
| Phase 1 | alert · kpi · data-list · stickynote | ✓ R 2.1.11 |
| Phase 2 | tabs · chip | ✓ R 2.1.12 |
| **Phase 3** | **chart · bento · empty-stub** | **✓ R 2.1.13（本次）** |
| Phase 4 候選 | 清舊版（已標 promoted 的 comment 是否刪 / hero / wizard / settings-* / ip-hero 等單頁專用 patterns 是否 promote） | 待 |

---

### D. Infrastructure / 文件

| 元件 | ds-components/ | design-system.md | design-system.html | 頁面 link |
|---|---|---|---|---|
| **tabs** | ✓ 新檔 `tabs.css` · `.tabs / __item / __item--active / __item-count / .tab-panel / --active` | ✓ §2.15 | ✓ §2.28 · 4-tab demo | 8 頁（design-system / e-shop / earnings / events / fans-crm / ip-detail / my-ip / projects） |
| **chip** | ✓ 新檔 `chip.css` · `.chip / __count / --active / --static / .chip-group / .filter-row / __actions` | ✓ §2.16 | ✓ §2.28 · 4 filter chips + 4 static region chips + filter-row layout | 2 頁（design-system 透過 demo · earnings · ip-detail） |

**`.chip` vs `.badge` 決策**：保持兩個獨立元件，**不**併到 badge 的 `--filter` modifier。理由：
- `.badge` = read-only status display（5 status colors）
- `.chip` = interactive filter / selector（neutral by default, inverts to `--foreground` bg when active）
- 互動性質完全不同（badge 沒 hover / active state）；併進 badge 會把兩種語意攪在一起，使用者拿到 `.badge` 看不出能不能點。

**`.section-head` 沒 promote**：只 3 條 declaration（`.section-head` + `__title` + `__sub`），抽出來不值得。留 project-level 在 `shared.css`，design-system.md §3 Patterns 區會記成「composition pattern」而非元件。

**shared.css 撤除**：`.tabs*`（36 行）+ `.tab-panel*`（2 行）+ `.chip*`（38 行）+ `.filter-row*`（10 行）共約 86 行移除，留 2 條 comment。

**design-system.html 載入新 CSS**：`<link>` 補上 `ds-components/tabs.css` + `ds-components/chip.css`，§2.28「App-promoted components」demo 區擴充 2 個新 section（tabs / chip + chip--static）。

**design-system.md** §2.1 Inventory 表加 2 列（Tabs / Chip）標 `✓ App`。新增 §2.15 Tabs + §2.16 Chip 規格卡。

**截圖 38**（design-system.html §2.28 含 tabs + chip 兩個新 demo）。

### 進度回顧

| Phase | 元件 | 狀態 |
|---|---|---|
| Phase 0 | `.surface → .card` / `.pill → .badge` rename | ✓ R 2.1.10 |
| Phase 1 | alert · kpi · data-list · stickynote | ✓ R 2.1.11 |
| **Phase 2** | **tabs · chip** | **✓ R 2.1.12（本次）** |
| Phase 3 候選 | chart family（linechart / stacked-bar / source-list）/ bento grid / empty-stub | 待 |
| Phase 4 候選 | 清掉 shared.css 過氣 patterns（已標 promoted 的 comment 是否刪 / 還有沒有遺漏的 inline pattern） | 待 |

---

### D. Infrastructure / 文件

按 feedback_promote_on_first_use 規則：元件第一次出現就建。每個 promote 行動需做 4 件事（CSS / md / html demo / 頁面 link）。

**4 個新元件 promote 完整：**

| 元件 | ds-components/{name}.css | design-system.md §2 | design-system.html demo | 頁面 link |
|---|---|---|---|---|
| **alert** | ✓ 新檔 · `.alert / --card / --row / --warning/error/success/info / __icon/body/title/desc/meta/cta/close` | ✓ §2.11 | ✓ §2.28 · 4 status × card density + 1 row density | 3 頁（index / e-shop / fans-crm） |
| **kpi** | ✓ 新檔 · `.kpi / __label / __value / __delta(--neg) / __meta` | ✓ §2.12 | ✓ §2.28 · 4 卡含 delta + meta 變體 | 6 頁 |
| **data-list** | ✓ 新檔 · `.data-list / __row / __row-main / __icon(--success/error/info/neutral) / __body / __title / __meta / __amount(--neg)` | ✓ §2.13 | ✓ §2.28 · 3 row demo with mono icons | 10 頁 |
| **stickynote** | ✓ 新檔 · `.stickynote / __mark` | ✓ §2.14 | ✓ §2.28 · Pending ≠ Available 範例 | 7 頁 |

**`.alert` 合併設計**：本來分 `.alert-card`（dashboard 新版）+ `.alert-row`（其他頁舊版），兩個 API 不同（card 用 `__body / __desc / __close`，row 用 `__title / __meta / __cta` 左 border-accent）。Phase 1 統一成單一 `.alert` 元件，用 `--card / --row` density modifier 區分視覺密度。HTML 全部 migrate：
- `.alert-card → .alert.alert--card`（index.html × 4 alerts）
- `.alert-row → .alert.alert--row`（e-shop / fans-crm × 1 each）
- 12 處 standalone `.alert-row__cta` （被當作 link-style hack 使用）改 rename 為 `.card__link`（建立 Phase 0 時的 surface__link 後繼）。

**design-system.html 真實 live demo**：
- 新增 `<link>` 載入 `ds-components/{card,badge,alert,kpi,data-list,stickynote}.css` + `_tokens.css` + `icons.js`，讓 demo 用真實 component CSS 渲染而非 inline style hacks。
- 新章 §2.28「App-promoted components」放在 §2.27 後 / §3 Patterns 前，含 6 個元件的 live demo（card / badge × 5 / alert × 4 statuses card + 1 row / kpi × 4 / data-list × 3 / stickynote）。
- §2.1 Inventory 表格補上 6 列（card section / badge status / alert / kpi / data-list / stickynote）標 `✓ App`，CSS link 指向 `ds-components/`。

**design-system.md §2 補充**：2.5 Card 加 project section variant 段、2.6 Badge 加 status variant 段、新增 2.11–2.14 完整規格卡（spec + anatomy HTML + variant 列表）。

**shared.css 撤除**：`.kpi*`（35 行）/ `.data-list*`（55 行）/ `.stickynote*`（18 行）/ `.alert-card*`（85 行）/ `.alert-row*`（37 行）共約 230 行移除，留 5 條 comment 標示 promoted 位置。

**新增驗證截圖**：35（Phase 0 dashboard）/ 36（Phase 1 dashboard，全部使用新元件）/ 37（design-system.html §2.28 live demos）。

### 為何先 Phase 1 不直接全部促進

`.kpi / .data-list / .stickynote / .alert` 是純抽取（沒命名衝突），可以直接 promote。Phase 2 將處理 `.chip / .tabs / .section-head`（chip 需要決定是不是 badge 的 modifier）；Phase 3 處理 chart 元件 family（linechart / stacked-bar）；Phase 4 清舊 patterns。

---

### D. Infrastructure / 文件

使用者新規則：**元件第一次出現就 promote 進 design system**（推翻 project-ui-creator 預設的「三次法則」）。memory 已存。

依此規則開始整理 design system，Phase 0 先做命名對齊（為後續 promote 鋪路）：

- **`.surface*` → `.card*`**（13 頁 HTML migrate · 共 117 處改動）
  - 規則從 `shared.css` 抽出，搬進 `ds-components/card.css` 標為「project-namespace section card pattern」，跟既有 `.ztor-card`（base design system reference）並存。
  - rename map: `.surface / .surface--muted / .surface__head / .surface__title / .surface__link / .surface__hint` → `.card / .card--muted / .card__head / .card__title / .card__link / .card__hint`
- **`.pill*` → `.badge*`**（14 頁 HTML migrate · 共 89 處改動）
  - 規則從 `shared.css` 抽出，搬進 `ds-components/badge.css`，跟既有 `.ztor-badge` 並存。
  - rename map: `.pill / .pill__dot / .pill--{yellow|success|error|info|neutral}` → `.badge / .badge__dot / .badge--{yellow|success|error|info|neutral}`
- **migration 機制**：Python script parse `class="..."` attribute，逐 token rename。**避開 false positive**：CSS token `--surface / --surface-muted / --radius-pill`、複合 class `metric-pill / ztor-metric-pill / alert-card / appearance-card / choice-card / shadow-demo--card / mini-badge / dm-card / default-card` 等都正確跳過。
- **`shared.css` 對應 block 移除**，留兩條 comment 標示「promoted to ds-components/{card|badge}.css」。
- **未動 `design-system.html / sample.html`**：兩者用自己 docs chrome 命名（`default-card`, `dm-card`, `mini-badge`, `ztor-card`, `ztor-metric-pill`），沒有 raw `.surface` / `.pill` class 使用。
- **新增驗證截圖**（35 phase0 dashboard）— `.card` 元素 9 個 + `.badge` 元素 9 個，全部正確套用樣式（白底 + shadow-card + 20 px padding）。

### 為什麼這是 Phase 0 而不是直接 promote

`.surface` 命名跟 base design system 的 `.ztor-card` 概念重疊（兩者都是 card），但 API 不同（surface = section wrapper with head/title/link/hint · ztor-card = content card with title/meta/body）。如果直接以 `.surface` 命名 promote，design system 會出現「兩個 card 元件不同名」的混亂。先把 project 命名對齊 shadcn taxonomy（`.card / .badge`），後續 promote 才不會把錯的命名永久固定。

下一步（Phase 1）：promote `.alert / .data-list / .stickynote / .kpi`（這幾個沒有命名重疊問題，直接抽 CSS + 寫 design-system.md 規格卡 + design-system.html demo 就好）。

---

### B. 反饋導入

使用者連續六項調整，全部就上一版 R 2.1.8 的 pill-card 樣式上修正：

1. **圓角拿掉** — 22 px radius 改 0。卡片轉為 flat row。
2. **不要陰影與背景色** — 撤掉 `box-shadow` 雙層 + 撤掉 `--background` fill。卡片透明，沒有 chrome。
3. **加 border-bottom** — 改用 hairline 分隔（`1px solid --border`），最後一條不加。視覺從「卡片堆疊」變「列表行」。
4. **Icon 靠上對齊** — `align-self: start` + body 加 2 px padding-top 對齊 title baseline。
5. **Icon 外方塊改色彩邏輯** — 從「飽和填色圓形 + 對比色 glyph」改為「淺色 tint 方塊 + 主題色 glyph」。具體：
   - **方塊**：`color-mix(--status-{type} 14-22%, --surface)` 半透明 tint，10 px radius（rounded square，不是圓）
   - **Glyph 顏色**：error / info 用 token 直接顯示；warning / success 因為原色在淺底上對比不夠，glyph 走 `color-mix(token 35-75%, dark)` 加深
   - 尺寸：40 × 40 方塊 + 20 px glyph
6. **× 改 chevron-right 箭頭，大一號** — `<i data-lucide="chevron-right">` 取代 `×` 字符；container 從 20×20 升到 28×28，icon 20×20（之前 14 px 字符）。語意從「dismiss」改為「navigate forward」，aria-label 同步改 "Open"。

### C. 撤除（intentional removal · 跟 R 2.1.8 對照）

- **`.alert-card` 雙層 shadow + white bg + 22 px radius** — pill-card 視覺退役。
- **`.alert-card__icon` 圓形 + 飽和填色** — 改方塊 tint。
- **`.alert-card__close` × 字符** + 圓形 hit area — 改 chevron icon button。
- **`.alert-card--compact` 變體** — 之前為 reference 圖第二張準備的，新版面沒有對應使用情境，整段 5 條 CSS 移除。

### D. Infrastructure / 文件

- **`shared.css` `.alert-card` block 重寫** 約 70 行 → 約 60 行（移除 compact + dark mode shadow override）。
- **`index.html` 4 個 `.alert-card__close` 內容** 從 `×` 文字節點改成 `<i data-lucide="chevron-right">`（icons.js 自動轉 SVG）。aria-label `Dismiss → Open`。
- 新增 1 張驗證截圖（32 alerts row-divider）。

---

### B. 反饋導入

- **使用者要求 Alerts & actions 改新樣式**（reference 圖：白色 rounded pill card + 飽和度高的圓形 status icon + inline 彩色 CTA 連結 + 右側 × 關閉鈕）— 用我們的 design token 重做：
  - **Card 結構**：白色（`--background`）背景 + 22 px border-radius（更圓更接近 pill）+ 雙層 shadow（hairline `0 0 0 1px` + soft `0 4px 12px`）。Dark mode 用 `color-mix(--foreground 4%, --background)` 提一階。
  - **Icon 圓形 36 px** + 飽和填色：warning `--status-warning` + 深字、error `--status-error` + 白字、success `--status-success` + 白字（新變體）、info `--status-info` + 白字。stroke-width 2.25 加粗，視覺更紮實。
  - **CTA 改 inline 彩色連結**（之前是右側 outline pill 按鈕）— 顏色跟 icon 配對：error / info 直接用 status token；warning / success 透過 `color-mix(... 35–75%, dark)` 加深以滿足 AA 對比（黃色文字在白底不可讀，必須混入深色）。
  - **新增 × 關閉鈕**（`.alert-card__close`）— 20 × 20 圓形，hover 用 `--surface-muted` 底，icon-button 慣例。目前是純視覺、未綁實際 dismiss 行為。
  - **新增 `.alert-card--compact` 變體**（999 px radius / 28 px icon / 較小 padding）— ref 圖第二張那種扁版本。Dashboard 4 張都用標準版，compact 留給未來窄欄位用。
- **「4 needs attention」pill 改成「View all」連結** — 上一版用 `pill--yellow` 把告警數字當 badge 顯示，但跟其他 surface__head 的「View all transactions →」/「Build on ztor yellow」這種右側 link 寫法不一致。改成 `.surface__link` style + i18n key `btn.view-all-alerts`（EN: View all / 中: 查看全部）。

### C. 撤除（intentional removal）

- **`.alert-card` tinted bg**（之前 `--status-warning 18%` / `--status-error 10%` 染色底）— 改回白色卡片，色彩語意全部交給 icon 圓 + CTA 連結色。原本染色底太搶 KPI 區的注意力。
- **`.alert-card__source` 「來自 · {模組}」footer** — 新版面沒這條（reference 圖也沒有）；HTML 還留著但 CSS class 不再顯示在 layout（如果再加 source 行會自動掉到 desc 下方）。**此處 HTML 已連同 source div 一併刪掉**（移除而非保留 — 來源資訊已隱含在 CTA 連結 href 上）。
- **`.pill--yellow "4 needs attention"`** 換成 `.surface__link "View all"` — pill 用法移除。

### D. Infrastructure / 文件

- **`shared.css` `.alert-card` 區塊改寫** ~70 行：白底 + 22 px radius + 雙層 shadow / 36 px filled icon 圓 / 4 種 status variant / inline CTA 連結色 / `.alert-card__close` 按鈕 / `.alert-card--compact` 變體。
- **`index.html` 4 張 alert HTML 重構**：CTA 從 `.alert-card`-level 子節點移到 `.alert-card__body` 內部（為了讓它在 desc 下方），新增 `.alert-card__close` button × 4，移除 `.alert-card__source` 4 處。
- **`i18n.js` DICT 新增 `btn.view-all-alerts`** 鍵（EN: View all / zh: 查看全部）。
- 新增 1 張驗證截圖（31 alerts pill-style）。

---

### B. 反饋導入

- **使用者要求「要支援中英文語系切換」** — 上一版 R 2.1.6 雖然頂列已經有 `EN · 中` toggle pill，但點下去沒反應。本次補完整個 i18n stack：DICT + apply mechanism + toggle 行為 + localStorage 持久化 + `<html lang>` 同步。
  - **DICT scope** 約 120 keys，覆蓋：(a) topbar 全部（nav labels / dropdown titles+subs / search placeholder / aria-labels / account menu）、(b) common buttons（Export / Request payout / Manual entry / Load more 等）、(c) Dashboard（hero slides / KPI labels / section heads / alerts × 4 / recent earnings rows / source legend）、(d) Earnings 全部（tabs / 4 KPI / table headers / 7 filter chips / status pills / sticky notes / Tax docs regions）。
  - **預設 EN**（不是 R 2.0 的繁中），因為 R 2.1 既有 body copy 大多是英文；切到中後 `<html lang>` 寫入 `zh-Hant`，CJK 自動掉到自架 `Taipei Sans TC Beta`。
  - **未覆蓋**：9 個 stub 頁（projects / my-ip / ip-market / e-shop / product-detail / events / fans-crm / settings / 三個 wizard）的 body 字串。**Topbar 在這些頁面也會切，但內文留英文**。已記在 SPEC.md §5a 缺口清單。

### A. Spec-derived（補規格書補齊）

- **使用者要求「查看現在的專案檔案有沒有符合 Skills/project-ui-creator 的規格，有缺哪些東西都補上」** — 對照 `design-system-requirements.md` 與 SKILL.md 的 8 項必要產出，逐項稽核：
  - ✅ 1 design system tokens（`ds-components/_tokens.css`）
  - ✅ 2 元件庫（`ds-components/{name}.css` × 12 個）
  - ✅ 3 icon registry（`icons.js`，本次更新後全頁面 active 載入）
  - ✅ 4 self-hosted font stack（`fonts/` × 6 個 woff2 + ttf，宣告於 `fonts.css`）
  - ✅ 5 `design-system.html`（含 component preview）
  - ✅ 6 UI 實作（14 個產品頁）
  - ✅ 7 `SPEC.md`
  - ✅ 8 `UI-CHANGES.md`（本檔）
  - **缺項 1：design-system.md 沒有 Top-level Do / Don't** — 必含項目，本次補。8 條 Do + 8 條 Don't，每條引用具體 token / 規則（`Geist Variable weight 500–700` / `--radius 6px` / `pill taxonomy` / `--status-warning` 不能當 UI fill 等）。
  - **缺項 2：SPEC.md §6 技術骨架載入順序過時** — 本次加上 `<head>` 與 `<body>` 分區、列出 icons.js / i18n.js / sidebar.js / hero.js 載入順序與相互依賴。
  - **缺項 3：SPEC.md 沒有 cross-cutting rules 區段** — 本次新增 §5「全站規則」，含 5.1 導覽模型 / 5.2 主題 / 5.3 語言 / 5.4 響應式 / 5.5 無障礙。
  - **缺項 4：SPEC.md §2 sitemap 技術骨架敘述過時** — `icons.js · 目前未使用` 改為 active；`sidebar.js · 注入 topbar nav` 改為 「R 2.0 canonical `.app-topbar__*` 結構（Ztor SVG logo + ul/li nav + mega dropdown）」；補上 `i18n.js` 與 `images/` 條目。
  - **缺項 5：SPEC.md §4 對照表 Earnings 仍寫「◑ Overview」** — 改為 ✓ Full（4 tabs 都完成），語言 row 改為 ✓ Full（i18n 已實作）。
  - **沒缺**：Identity Block / Quick Reference / 5 pillars / 1.10 Imagery / Similar Systems / Final Checklist 等其他必含項目都已存在於 design-system.md。

### D. Infrastructure / 文件

- **新增 `i18n.js`** — 約 230 行：DICT（120 keys × 2 lang）+ `t(key)` + `apply(root)` + `setLang(lang)` + `toggleLang()` + localStorage `ztor-r21-lang` + 點擊 `.app-topbar__lang` 觸發 toggle + 載入時還原語言 + 暴露 `window.applyI18n / setLang / toggleLang`。
- **`sidebar.js` 更新**：NAV 結構改用 `key / titleKey / descKey` 取代寫死字串，HTML template 插 `data-i18n` / `data-i18n-aria-label` / `data-i18n-placeholder` 到所有可翻譯點；topbar lang button 加 `data-lang="en|zh"` markers；inject 完同時呼叫 `applyIcons(root)` + `applyI18n(root)`。
- **`index.html` / `earnings.html` 改 `data-i18n` 注入**：Dashboard 全部主要文字節點（hero × 3 / KPI × 4 / alerts × 4 含 title + desc + source + cta / recent earnings × 5 / section heads / legend）+ Earnings 全部 tab labels / KPI labels / section heads / table headers / filter chips / sticky notes。
- **`<script src="i18n.js">` sed 注入到 11 個 topbar 頁面**，放在 icons.js 之後、sidebar.js 之前（依賴鏈：icons.js → i18n.js → sidebar.js）。
- **SPEC.md §2 sitemap / §4 對照表 / §6 技術骨架 全部 refresh** + **新增 §5 全站規則**（5 個子節，每節對應上述五項稽核）。
- **design-system.md 新增 `## Top-level Do / Don't`** 段落（Identity 之後、Quick Reference 之前），8 + 8 條規則。
- 新增 1 張驗證截圖（30 dashboard zh — 中文版本 Dashboard，topbar + KPI + alerts 全部切到中）。

---

### B. 反饋導入

- **使用者明示「Header 參考 r2.0 版本，但 design token 都是 r2.1 的」** — 把 R 2.1 自製的 `.app-brand / .app-nav / .app-actions / .app-icon-btn / .app-lang / .app-search / .app-avatar / .app-account` 整套退役，全面採用 R 2.0 `R 2.0/dashboard.css §App-topbar` 的 `.app-topbar__*` canonical 命名與結構，但 token 不動（`--background / --surface / --foreground / --border / --primary` 都還是 R 2.1 yellow design system 的值）。
  - **Brand**：移除黃方塊 Z + "Ztor Studio" 文字，改成 R 2.0 的完整 Ztor 字標 SVG（101×32 viewBox · 24 px 高 · `currentColor` 描邊）。
  - **Nav 結構**：從扁平 `<a>/<button>` 改為 R 2.0 semantic `<ul class="app-topbar__nav"> > <li> > <a class="app-topbar__link">`，dropdown 用 `<li class="app-topbar__nav-group" data-dropdown>`。Active state 由 R 2.1 的 `--active` modifier 改 R 2.0 的 `[aria-current="page"]` selector + `--surface-muted` 背景。
  - **Dropdown panel**：`.app-topbar__dropdown--mega` 360 px min-width + 6 px padding + 36 px icon box（`--surface-muted` bg）+ title / sub 兩行。對齊使用者「Project/ztor-creator-studio/site/R 2.1/Revise ref/004.png」E-Shop dropdown 設計（Manage E-Shop / Product detail / Add product · 圖示 + 主名 + 描述）。
  - **右側 cluster 順序與 R 2.0 對齊**：theme → search panel → lang → notifications → avatar。
  - **Search 改 dropdown panel**：上一版是 inline 展開的 search bar（`.app-search--open`），改成 R 2.0 的 panel pattern（`.app-topbar__search-panel` + `.app-topbar__search-input-wrap` + 右上 ESC kbd hint）。autofocus 開啟時直接聚焦輸入框。
  - **Theme toggle 改 R 2.0 CSS attribute selector**：`html[data-theme="light"]` 顯示 moon、`html[data-theme="dark"]` 顯示 sun（取代上一版用 class modifier `.theme-toggle__icon-moon/sun`）。
  - **保留 R 2.1 在意的兩處小差異**：(1) notifications 用 **flag** icon + yellow dot（對齊 Revise ref/003.png 使用者偏好，**不** 回到 R 2.0 的 bell icon）；(2) 主導航 label 保持英文（R 2.1 內容語言為主，不採 R 2.0 的中文 nav），等之後接 i18n 再雙語。

### A. Spec-derived

- **Spec §3.2.2** dropdown 至少支援一層階層 — `.app-topbar__dropdown--mega` 滿足。
- **Spec §3.2.2.5** Settings 入口在帳戶選單而非主導航 — Avatar menu 內含 Profile / Settings / Payments / Log out（Settings 不在主 nav）。
- **Spec §3.2.2.3** 通知與待辦提示 — flag icon + `.app-topbar__badge-dot`（yellow primary）滿足。

### C. 撤除（intentional removal · 跟 R 2.1.4 對照）

- **`.app-brand` / `.app-brand__mark`** — 整套 brand 命名退役。
- **`.app-nav` / `.app-nav__item` / `.app-nav__chev` / `.app-nav__wrap` / `.app-nav__panel` / `.app-nav__link*`** — 11 條 selector 全刪。
- **`.app-actions` / `.app-icon-btn` / `.app-icon-btn__dot` / `.app-lang` / `.app-search` / `.app-search--open` / `.app-avatar` / `.app-account__*`** — 全部退役。
- **inline-expanded search bar**（`.app-search` 與 `[data-search-bar]/-toggle`）— 改 panel pattern。
- **`.theme-toggle__icon-moon/sun` class-based 顯示控制** — 改 attribute selector。

### D. Infrastructure / 文件

- **`shared.css`** 把整個 topbar block（約 295 行 ~ 行 31-328）改寫為 R 2.0 風格（約 240 行）。淨減約 55 行，可讀性更高（一套命名 vs. 之前混合 `app-nav` / `app-actions` / `app-account`）。
- **`shared.css` responsive @media (max-width: 900px)** 更新：`.app-topbar` 改 `flex-wrap: wrap`、`.app-topbar__nav` 隱藏（取代之前的 `.app-nav { display: none }`）。
- **`sidebar.js`** 重寫 HTML template：嵌 R 2.0 完整 Ztor SVG logo · 用 `<ul>/<li>` 結構生 nav · dropdown 用 `--mega` modifier · 行為 handler 統一 `[data-dropdown]` 點擊開合 + outside click close + ESC close。檔案行數 145 → 165。
- **`icons.js`** 不動（之前 R 2.1.4 補的 flag / package-x / refresh-ccw 都還會用到，registry 完整覆蓋 nav 用 icon：tag / search / circle / shopping-bag / package / plus / users / award / megaphone / rocket / chevron-down / sun / moon / flag）。
- **HTML 不需要動**：每個產品頁的 `<header class="app-topbar" id="sidebar"></header>` 容器不變，sidebar.js 注入新結構覆蓋舊內容，零佈署面改動。
- 新增 3 張驗證截圖（27 header / 28 E-Shop dropdown 開啟 / 29 avatar menu 開啟）。

---

### A. Spec-derived

- **Earnings 4 tabs 全部可切換**（spec §5.1.8.2） — 原本 `<div class="tabs__item">` 是裝飾性、點不到。改為 `<button>` + `data-tab`，加 `[data-panel]` wrapper 與 inline JS：點擊切換 active state、show/hide 對應 panel、`history.replaceState` 寫 hash、`#transactions` 等深連結載入時直接切到該 tab。
  - **Overview** 保留既有內容（KPI / Revenue trend / Revenue by Source / Recent Transactions / Pending ≠ Available stickynote）。
  - **Transactions**（spec §5.1.8.7）：filter chips（All · E-Shop · Event tickets · IP royalties · Licensing · Project support · Payouts & refunds）+ Manual entry + Export CSV，9 欄 `ztor-table`（Date / Source / Type / Original / Rate / Status / Gross / Fees / Net），7 筆代表性資料含 Pending / Available / Paid / Manual unverified / Disputed 5 種狀態，footer "Showing 7 of 214 · Load more →"。
  - **Payouts**（spec §5.1.8.8）：4 KPI（Pending / Available / Payout requested / Paid 90d）+ Request payout primary card（帶最小提款金額 + 自動排程說明）+ Payout history（5 筆，含 Failed → "returned by bank · retry recommended"）+ Disputed 規則 stickynote。
  - **Tax documents**（spec §5.1.8.9）：年份 chip 切換 + 季度 select + 2025 documents 列表（1099-NEC / 1099-K / Annual summary / Q3 / Q4 not-yet）+ Supported regions chip 群（US / UK / EU / JP / TW / AU / CA）+ "Not in your region?" stickynote。
- **"View all transactions →" 行為對齊 spec §5.1.8.6**：從 anchor 改為 `<button data-tab-jump="transactions">`，點擊在原頁切到 Transactions tab，不換頁。

### B. 反饋導入

- **Earnings 4 個 tab 都不能按** — 使用者點出 tab 是死的，本次補上 JS。
- **Revenue trend 從柱狀圖改折線圖**（使用者明示「直條圖改成折線圖，design system 元件庫有」） — Dashboard 與 Earnings Overview 兩個位置同時改。引用 [design-system.html](design-system.html) §Chart 的 polyline 樣式（line 2077 / 2846）：
  - Dashboard 用「Trend Chart with Comparison」雙線版本（solid 黃線 = 本期 / dashed 灰線 = 上期），對應原圖例已經有的兩條（Revenue / Last period）
  - Earnings Overview 用單線版本 + area fill（最後一點 accent 圓點為 Feb）
- **`.data-list__icon` 彩色 icon 改黑白單色** — 使用者指 Recent earnings 的綠 $ + 藍 ♪ 等。`--success / --error / --info / --neutral` 四個變體全部 override 成 `--surface-muted` bg + `--foreground-muted` text。Class 名保留（其他語意如 amount 顏色不動）。

### C. 撤除（intentional removal）

- **`.trend / .trend__bar / .trend__bar--accent / .trend-wrap`** CSS 與相關 HTML：保留 CSS class（之後若有其他模組需要柱狀圖可用），但 Dashboard / Earnings 兩處 HTML 已移除。本次不刪 CSS 因為未來 Events / Fans 可能還會用，等真的沒人引用再清。
- **`.data-list__icon--success / --error / --info / --neutral`** 各自的彩色 bg + text color 規則：合併成單一規則，全部用 neutral monochrome。

### D. Infrastructure / 文件

- **`shared.css` 新增** `.linechart / __svg / __grid / __area / __line / __line--prev / __dot / __dot--accent / __labels`（約 40 行）+ `.tab-panel`（兩條規則）+ `.filter-row / .chip-group / .chip / .chip--active / .chip--static / .chip__count`（約 50 行）。total +90 行。
- **`earnings.html`** body 從 4 個 nav tab + 單一 Overview 區塊，擴成 4 個可切換 panel（行數 ~120 → ~350）。新增 link `<link rel="stylesheet" href="ds-components/table.css">`。inline tab JS 約 35 行 IIFE。
- **`index.html`** Dashboard Revenue trend 換 SVG 雙線。圖例由色塊改為線段樣式（10×2 px primary + 14×1 px dashed subtle）。
- **新增 5 張驗證截圖**（22 transactions / 23 payouts / 24 tax / 25 earnings-overview 折線 / 26 dashboard 折線 + 列表去色）。

---

### B. 反饋導入

- **Alerts & actions 改卡片設計**（反饋圖 `Revise ref/001-small.png`） — 從原本的 `border-left 細條 + 小 icon + 兩行 row` 改為「**tinted card + 填色圓形 icon + 標題 + 描述 + 來源行 + 右側 outline pill 按鈕**」的版面。卡片之間 10 px 縱向間距、圓角 12 px、padding 16/18。語言改為繁體中文以對齊參考圖（IP 租借 6 天後到期 / 庫存過低 · 3 項商品 / 活動檢核尚未完成 / SPOTIFY 同步失敗），actions：續租 / 補貨 / 前往 / 重新授權。每則加 `來自 · {模組}` footer。
  - Warning 卡：bg 用 `color-mix(var(--status-warning) 18%, surface)`，icon 圓在 `--status-warning` 上覆深色字
  - Error 卡：bg `color-mix(var(--status-error) 10%, surface)`，icon 圓填紅色 + 白色 `package-x` glyph
  - Info 卡：bg `--surface-muted`，icon 圓填 `--foreground` + 反色 `info` glyph（對應參考圖最後一則的深色 chip 質感）
- **Dashboard `.page-intro` 整段拿掉**（反饋圖 `Revise ref/002-small.png`） — 原本 hero 下面的 `TUESDAY, MAY 25 / Good morning, Maya. / Three things need your attention…` 加 Export / + New project 雙按鈕，使用者要求刪掉這一行。Dashboard 現在 hero 之後直接接 `November at a glance` KPI；intro 的 CTA 重要性下降（New project 已在 hero CTA + Projects 頁有入口）。
  - `.page-intro` CSS class **保留**，因為 11 個其他產品頁仍在用（projects/my-ip/earnings/…）。只動 Dashboard。
- **Topbar 右側 icon 全部換 Lucide SVG**（反饋圖 `Revise ref/003.png`） — 上一版用 ASCII 字符（`⌕` / `⚑` / `☾` / `☀`）當 icon，size 不可控、和瀏覽器字型強相關，所以使用者觀感是「icon 大小壞了」。改成 `<i data-lucide="search|flag|moon|sun">` placeholder + `icons.js` `applyIcons()` 注入正規 SVG，全部統一 18 × 18 + 1.75 stroke-width。
  - 通知 icon 從 bell `⚑` 改 `flag`（旗幟）對齊參考圖
  - Theme toggle 兩 icon 用 CSS 顯示控制：light → 顯示 moon、dark → 顯示 sun。原本兩個都顯示，所以視覺上像被切壞了
  - Search icon 在 `.app-search` 展開後 inline 也用 SVG，size 16 + subtle 色

### C. 撤除（intentional removal）

- **Dashboard `<div class="page-intro">…</div>` 區塊** — 14 行 HTML 刪除（含 eyebrow / title / sub / 兩顆按鈕）。
- **Topbar ASCII glyph icons**（`⌕` / `⚑` / `☾` / `☀`）— 在 `sidebar.js` 內被 Lucide placeholder 取代。
- **shared.css `.theme-toggle__icon-moon / sun` 同時 visible 的隱含 bug** — 加上 light/dark 條件式顯示規則。**這算修對應反饋的設計缺口、不是純 bug，所以列 C 區。**

### D. Infrastructure / 文件

- **`icons.js` 首次正式被 11 個產品頁載入** — 之前 icon registry 寫好但沒有任何頁面 import，等同未啟用。本次 sed 一次補上 `<script src="icons.js"></script>` 放在 `<script src="sidebar.js"></script>` 之前（順序很重要：sidebar.js 注入 placeholder 後會呼叫 `window.ztorIcons.applyIcons(root)`，需要 registry 先 ready）。
- **`icons.js` REGISTRY 新增 3 個 Lucide icon**：
  - `flag` — 公告 / Announcements（topbar）
  - `refresh-ccw` — 重新授權 / 同步（預備給 Integrations 區）
  - `package-x` — 庫存過低（dashboard alert error 卡）
- **`shared.css` 新增** `.ztor-icon` base class（display / size / vertical-align）、`.app-icon-btn .ztor-icon` (18 px / stroke 1.75)、theme toggle 顯示切換規則、`.alert-card` 卡片元件（grid layout / 三種 variant / icon 圓 / title / desc / source / CTA pill）共約 75 行。
- **`.alert-row` 保留**：6 個其他頁面（e-shop / fans-crm / my-ip / product-detail / create-project / index 改前）仍引用舊 row 樣式。新增 `.alert-card` 為 dashboard 專用，不衝突。**未來其他頁要升級用同 class 即可，不必再寫一份 CSS。**
- **`sidebar.js` 注入結尾加 `window.ztorIcons?.applyIcons(root)`** — DOMContentLoaded 已經 fire 過 (icons.js 自動 apply 早於 sidebar.js inject)，所以新插入的 placeholder 需要再 apply 一次。
- 新增 3 張驗證截圖（19 topbar / 20 alerts / 21 dashboard 全頁），對應三個改動。

---

### B. 反饋導入

- **使用者要求「hero banner 要全屏的圖片設計」** — 上一版 hero 雖然是 full-bleed，但右邊只是色塊 + 一個 glyph（⌁ / ◐ / ⟴），不算「圖片設計」。本次改成三張真實照片背景滿版，左側暗色漸層 + 白字 + yellow CTA 疊上去。
- **使用者選 unsplash placeholder 路線**（Gemini API key 不便取得）— 三張圖直接 hotlink 下載到本機 `images/`：
  - `hero-event.jpg` (217 KB) — concert / phone-up filming a stage with warm lights · slide 0「Create an event」
  - `hero-ip.jpg` (676 KB) — wood desk still life with clock + plant · slide 1「Browse IP」（不是最貼題的選擇但符合 editorial 調性，後續可換生成圖）
  - `hero-audience.jpg` (131 KB) — 3D app icon collage (Netflix / Spotify / TikTok-ish blocks) on dark bg · slide 2「Connect platforms」

### A. Spec-derived

- 三張 slide 一致 carousel 結構，每 8 s 自動切換、3 dots 指示器 + prev/next 按鈕 (overlay 在底部半透明黑 + backdrop-filter blur)，對應 spec §5.1.1.1「輪播 Hero Banner」
- Spec §5.1.1.1 列出兩張必備：建立活動（slide 0）+ IP Market（slide 1）— 都覆蓋。Slide 2「Connect platforms」是合理延伸，承接 spec §5.1.1.8「第三方服務整合狀態」的入口提示

### C. 撤除

- `.hero__visual / .hero__visual--muted / .hero__visual--ink / .hero__visual-glyph` 全部移除 — slide 變單欄圖片容器，不再有獨立 visual 欄。CSS 註解標記撤除日期。
- 上一版讓 `.hero__copy` 寬 1248 max-width 對齊 grid 的設定改成 720 max-width — 圖片底現在是滿版的視覺主角，文字只需要佔左側 720 px 區段即可。

### D. Infrastructure / 文件

- 新增 `images/` 目錄存 3 張 hero 圖片（1.0 MB 合計）。Vercel deploy 時這些圖會被一起 ship。
- Hero 漸層：`linear-gradient(90deg, rgba(0,0,0,.78) 0%, rgba(0,0,0,.62) 30%, rgba(0,0,0,.30) 55%, rgba(0,0,0,.05) 85%, rgba(0,0,0,0) 100%)` — 確保文字在任何照片上都至少有 ~5:1 對比。
- Hero 底部 carousel nav 改半透明黑 + backdrop-filter blur 8px，dots 用半透明白，配合 photo-on-dark UI 語言。
- 已知限制：3 張圖目前是直接 hotlink 自 unsplash.com 的 photo ID，已下載成本地檔。**未來換真實生成圖時記得換 `images/*.jpg` 並更新此處紀錄。**
- 新增 4 張驗證截圖（14-17 三 slide + 18 dark 全頁）

---

## 2026-05-25 · R 2.1.2-preview · 對齊 design system canonical + 撤 yellow KPI + border token reset

### B. 反饋導入

- **使用者指出「為什麼有一個 KPI 是黃色的？」** — 確認 Dashboard `Gross revenue` 與 Earnings `Net income` 等 5 處 `.kpi--highlight` 是我自己加的（理由是「讓 yellow 在 Dashboard 有結構性出場」），spec §5.1.1.2 / §5.1.8.3 並沒有指定要 highlight 哪一張。決定全部拿掉，yellow 嚴格保留給 CTA / sticky-note / hero / brand mark。
- **使用者指出「topbar 跟 design-system.html 不同步」** — 確認上一次（R 2.1.1）改的 topbar 是憑著 R 2.0 + 自己印象寫的，沒對齊 `design-system.html` 裡 `.dm-header` 的 canonical 規格（64 px / background bg / 18 px brand / 13 px nav）。本次直接對齊。
- **使用者要求 `--border #D1D1C7 → #E5E5E5`** — 本專案 design system 原本為了「warm canvas + warm hairline」把 border 從 base ztor 的 `#E5E5E5` 改成 `#D1D1C7`，但使用者覺得冷色 hairline 在暖色 canvas 上反而讀得更乾淨。Reverted to base ztor 值。

### A. Spec-derived（對齊 source of truth）

- **Topbar 對齊 `design-system.html` §2.4 Header demo**：
  - 高 80 → **64 px**
  - max-width 1248 置中 grid → **padding 0 24px + flex space-between**（topbar 內 inner 不再限寬，因為 sticky topbar 全寬比較自然，跟 demo 的 flush-edge 一致）
  - 移除 active 的 yellow underline，改用 R 2.0 / canonical-friendly 的 `--surface-muted` 底色作 hover + active state
  - Brand 22 px → 18 px Geist UI（demo 規格）+ 26 → 22 px yellow Z mark
  - Nav 14 px → 13 px Geist / 500 / foreground-muted（demo 規格）
  - Actions gap 6 → 8 px（demo 規格）
- **Avatar 改 inverse colors**：bg `--foreground` / text `--background`（不再 yellow），符合 spec §1.1「yellow 是 single high-saturation brand color, plays the role of primary CTA and nothing else does」
- **新增 `.app-lang` pill 元件**：對齊 R 2.0 寫法（32 px pill + hairline border + `EN · 中` 雙語 toggle），實現 spec §3.2.2.4「繁體中文 / English 直接切換入口」
- **Notification icon 加 `.app-icon-btn__dot`**：red/yellow dot 提示未讀，對應 spec §3.2.2.3 通知與待辦提示要求

### C. 撤除（intentional removal）

- **`.kpi--highlight` 規則本身**從 shared.css 移除（不只是不引用），整段 8 行 CSS 連同 `::before` ring 都刪掉，附 inline 註解說明撤除原因。**Bug 不寫進去；這是設計決策變更，列 C 區。**
- **`.app-nav__item--active::after` yellow underline 偽元素**：R 2.1.0 → R 2.1.1 加的 active state 視覺，本次撤除。原因：active state 用色塊（surface-muted）就夠醒目，yellow underline 等於把 yellow 拿去當 nav chrome，違反 yellow-as-CTA 原則。
- **`.app-icon-btn--label` modifier**（給「EN」label-only icon button 用的）：被 `.app-lang` 取代後不再使用，移除。

### D. Infrastructure / 文件

- **Token sync 跨三個位置**：
  1. `Design/Design System/ztor yellow/components/_tokens.css` — 改 `--border: #D1D1C7 → #E5E5E5`，header comment 同步更新
  2. `Project/ztor-creator-studio/site/R 2.1/ds-components/_tokens.css` — 用 `cp` 從上面同步進來（不是 symlink，符合 [project_ztor_creator_studio_deploy](#) 規範「ds-components 必須實體複製」）
  3. `Design/Design System/ztor yellow/design-system.md` — 改 5 處：Quick Reference 表 / Color 表 / Overview prose / Accordion border 範例 / Accessibility 對比表 + R 2.1 副本 `design-system.md` 同步
- **`.app-nav__panel` + `.app-account__panel` bg 改 `--background`**：原本用 `--surface`，但 dark mode 的 `--surface` 是 `rgba(253,253,253,0.10)` translucent overlay，當 panel 疊在彩色 hero 上時看不清楚。改用 `--background`（永遠 opaque），dark mode 再加一條 `#1F1F1F` 覆寫提升對比。**這是 design system 半透明 surface 在彩色 hero 場景的已知限制；project-level 解決，不動 base token。**
- **`project-ui-creator` skill 載入並改採其協議**：本次編修是第一次正式跑「編修循環協議」（讀 SPEC → 定位層級 → 改 → 同步 demo + UI-CHANGES + SPEC）。前兩次（R 2.1.0、R 2.1.1）等於繞過 skill 自己跑，導致 design system 與 project layer 脫節。
- 新增 4 張驗證截圖（10-13）：light + dark / canonical topbar / dropdown 開啟 / Settings stub。

---

## 2026-05-25 · R 2.1.1-preview · Sidebar → Topbar pivot + 全屏 Hero

### B. 反饋導入

- **使用者明確指出**「側邊欄的設計是自己產生的嗎？取消側邊欄的設計，做成 topbar」— 確認 left sidebar 是 R 2.1 初版自己加的 project-level pattern，不在 ztor yellow design system 元件清單（ds-components/）裡。Design system 規範的是 canonical 80 px horizontal header（[header.css](ds-components/header.css)）+ hover dropdown nav（[navigation-menu.css](ds-components/navigation-menu.css)）。
- **Hero Banner 要全屏** — Dashboard 唯一的 hero 改為 `.hero--fullbleed`，用 `width:100vw + left:50% + margin-left:-50vw` trick 邊到邊延伸出 page max-width，內部 hero__copy 仍對齊 1248 max-width 的左邊距，視覺上是「滿版背景 + 對齊內文柵格的文字」。

### A. Spec-derived

- **Topbar 結構 100% 對齊 spec §3.2.2** —
  - 主導航項目：Dashboard · Projects · IP Bank ▾ · E-Shop ▾ · Events · Fans ▾ · Earnings（spec §3.2.1 順序）
  - 3 個 dropdown 群（IP Bank / E-Shop / Fans）符合 spec「至少支援一層階層」要求
  - 搜尋以 icon 呈現，點擊後展開 search bar，不直接常駐（spec §3.2.2.2）
  - 通知 / 語言切換（EN）/ Avatar 順序固定在右側（spec §3.2.2.3-5）
  - **Settings 入口從主導航移除，改放在 Avatar 帳戶選單**（spec §3.2.2.5：「設定入口需放在帳戶選單中，不作為主導航中的固定主項目」）
- **Active 狀態用 yellow underline**（不是底色）— 對應 ztor app design system 的 tab-bar 處理；hover 才用 hairline 卡片背。
- **Hero full-bleed 強化編輯感** — Hero title 從 30 px → 56 px、glyph 從 96 px → 220 px、左右兩欄改成 1.2:1 比例、min-height 480 px。

### C. 撤除（intentional removal · 跟 R 2.1.0 對照）

- **`.sidebar / .nav-item / .sidebar__group / .sidebar__brand` 等 sidebar 全部 patterns**：完全移除，shared.css 沒有任何 sidebar 殘留。
- **`.app` 從 `grid-template-columns: 240px 1fr` 改回 `flex / column`**：沒有左欄。
- **內嵌靜態 topbar 區塊**（每頁 `<header class="topbar">...</header>` + search/icon 按鈕）：刪除；topbar 由 `sidebar.js`（檔名保留）統一注入。
- **`.topbar__icon-btn / .topbar__search / .topbar__avatar / .topbar__spacer` 舊 slim topbar utility classes**：全刪；改用 `.app-icon-btn / .app-search / .app-avatar`。Wizard 內 3 處 `topbar__icon-btn` 引用也已換掉。

### D. Infra / 文件

- **`sidebar.js` 檔名保留但內容全改**：避免一次性大量改 HTML script 引用；新版會自動把 `id="sidebar"` 的 element 改 class 成 `app-topbar` 再注入 topbar HTML。新建的頁面也可以用 `id="topbar"`，腳本接受兩者。
- **`hero.js` 不變**：carousel 控制邏輯不依賴 hero 位置，full-bleed 改寫對它透明。
- **shared.css 移除 ~120 行 sidebar 相關規則**，新增 ~180 行 topbar / nav-panel / account-menu / hero--fullbleed 規則。淨增約 60 行。
- **產品頁批次轉換**：用 Python regex 一次性替換 11 個非 wizard 頁面的 `<aside class="sidebar"...></aside> + 內嵌 topbar` block；wizard 3 頁（create-project / create-product / create-event）原本就不使用 sidebar，只順手把 `topbar__icon-btn` 改名。
- **新增 6 張驗證截圖**（07-09 系列）：light + dark Dashboard with fullbleed hero、Fans CRM 證明 topbar 在 stub 頁也正確 render。

---

## 2026-05-27 · R 2.1.19-preview · Topbar mega-menu motion（Motion-style 互動）

### B. 反饋導入

- **把 motion.dev 的 React Mega Menu 動畫感帶進 topbar**（使用者指定參考 `motion.dev/examples/react-mega-menu`）。官方 source 鎖在 Motion+ 付費牆，所以動畫機制是以瀏覽器觀察重建，**非移植其程式碼**。三個招牌行為：
  - **共用滑動高亮 pill**（`.app-topbar__nav-highlight`）：一顆 pill 在 nav 項目間滑動、跟著游標走；游標離開 nav 時滑回 active 頁項目。等同 Motion 的 shared-element（`layoutId`）效果，但用 vanilla JS 量 `getBoundingClientRect()` + CSS `transform`/`width` transition 實作，零依賴、不引入 React/Framer。
  - **mega panel 進出場動畫**：dropdown 從硬切（`[hidden] → display:none`）改成 `data-state="open|closed"` 模型，跑 fade + slide(−6px) + scale(0.98)，沿用 navigation-menu.css 既有的 visibility/opacity/transform 手法（visibility 取代 display 才能 transition）。
  - **nav mega 群組改 hover-open**：對齊 SPEC §3.2.2「hover dropdown nav」本來就該是的行為（先前實作是 click-only）。含 140 ms 關閉延遲讓游標移得進 panel；click 仍可切換。右側 search / account 維持 click-only（hover 開會擾民）。

### D. Infra / 文件

- **未新增任何 design token**：全程沿用既有 `--surface-muted / --radius-md / --duration(200ms) / --easing` token；`ds-components/_tokens.css` 一行未動（符合使用者「design token 不要改」要求）。
- **改動範圍只有 2 檔**：
  - `shared.css` — `.app-topbar__nav` 加 `position:relative`；新增 `.app-topbar__nav-highlight`；`.app-topbar__dropdown` 加 `data-state` 進出場動畫（保留 `[hidden]` 作 no-JS fallback）；link hover/active 背景改透明，交給 pill 提供底色。
  - `sidebar.js` — 注入 highlight `<span>`、移除 3 處 `hidden`、把開關邏輯改寫成 `data-state` + 滑動高亮控制器 + nav 群組 hover-open。
- **11 個產品頁零改動**：topbar 由 `sidebar.js` 統一注入，效果自動套到每頁。
- **a11y**：`prefers-reduced-motion: reduce` 下關閉 highlight + dropdown transition；ESC 仍關閉任何展開的 dropdown；`aria-expanded` 照常切換；highlight 用 `aria-hidden`。
- **fonts/i18n 同步**：highlight 在 `requestAnimationFrame` + `document.fonts.ready` + 語言切換後重算 resting 位置，避免字型/字串寬度變動造成錯位。

---

## 2026-05-27 · R 2.1.20-preview · Dashboard Hero 改置中 + 加高

### B. 反饋導入

- **Hero 從左對齊改成置中設計**（使用者反饋）。`.hero__copy` 加 `align-items:center / text-align:center / margin:0 auto`，eyebrow 與 `.hero__actions` 也水平置中；`.hero__slide` 加 `justify-content:center`；fullbleed 的 nav（dots + prev/next）由貼齊容器左緣改成置中成一組。
- **Hero 加高**：`.hero--fullbleed .hero__slide` min-height `520px → 720px`（分兩次反饋；最終 720px，落在 Stripe/Linear-style 大型 editorial hero 的 ~75–85vh 帶，又留 KPI 卡在下緣露出當捲動提示）。copy padding 改對稱 `96px 24px`、置中欄寬 760px（title 仍 56px、max-width 收成 720px 配合置中）。
- **遮罩從「左側 5-stop 線性漸層」改成「置中 radial veil」**：`radial-gradient(ellipse 95% 85% at 50% 48%, 0.62 → 0.34 → 0.18)`。中心最深保證置中白字 ≥ 5:1 對比，往邊緣淡出讓照片仍讀得到。light / dark 兩個主題都驗過。
- **輪播控制簡化成純指示**（使用者反饋）：拿掉 prev/next 按鈕（`.hero__nav-btns` markup 與 `.hero__nav .app-icon-btn` 樣式全刪）與 `.hero__nav` 的半透明底欄（`rgba(0,0,0,0.35)` + `backdrop-filter: blur(8px)`），只留置中的 line dots 顯示張數。dots 加 `box-shadow: 0 1px 2px rgba(0,0,0,0.35)` 維持在亮色照片上的可讀性。`hero.js` 的 prev/next handler 用 `?.` optional chaining，按鈕拿掉不會報錯；自動輪播與 dot 點擊照常。
- **進場動畫：hero 文字與 CTA 由下往上 staggered 淡入**（使用者反饋）。把原本 reveal.js 對 `.hero__copy` 的「整塊」fade+rise，升級成「逐元素」：container 本身不位移，改由子元素（title → subtext → CTA）各自 `translateY(24px) → 0` + opacity `0 → 1`，`transition-delay` 0.05 / 0.16 / 0.27s 形成 stagger。沿用 reveal.js 既有的 `.is-in` 觸發與 reduced-motion 早退機制（不另寫 JS）：載入時播一次，每張 slide 首次進畫面時也各播一次（reveal.js 對該 slide unobserve 後不再重播；輪播迴圈不會每 8s 重跑）。reduced-motion 下子元素直接顯示、無位移。

### D. Infra / 文件

- **未新增 design token**：漸層用既有的 rgba 字面值（本來就不是 token），其餘沿用既有 spacing / 字級；`ds-components/_tokens.css` 未動。
- **改動範圍只有 `shared.css`**（`.hero__slide` / `.hero__slide::before` / `.hero__copy` / `.hero__eyebrow` / `.hero__actions` + `.hero--fullbleed` 三條 override）。markup（index.html 的 3 張 slide）與 `hero.js` 輪播邏輯零改動。

---

## 2026-05-27 · R 2.1.21-preview · Hero 換頁指示改 Framer video-slideshow 風格

### B. 反饋導入

- **換頁指示器改成 Framer「video slideshow」風格**（使用者指定參考 framer.com/marketplace 該元件截圖）。取代上一版「只剩 line dots」的決定：
  - **霧面深色膠囊**（`rgba(20,20,22,0.62)` + `blur(12px)`）裝著 dots；inactive 是 8px 小圓點，**active dot 展開成 46px 進度 capsule**（白 fill 在半透明白 track 上）。
  - **獨立 play/pause 圓鈕**（同霧面材質）放在膠囊右側；inline SVG pause/play 兩個圖示用 `aria-pressed` 切換顯示。
  - dot 可點擊跳頁（點了若在暫停會自動恢復播放）。
- **進度與換頁同一個時鐘**：`hero.js` 從 `setInterval` 改寫成 `requestAnimationFrame` 累加 elapsed 的模型——進度 capsule 的 fill 寬度 = `elapsed / 8000`，到 8000ms 換下一張。好處是 **play/pause 能完美同步凍結/恢復進度條與換頁**（不會像 setInterval 那樣 pause 後 resume 時程跑掉）。實測：暫停 1.2s fill 凍在 21.87% 不動，恢復後續跑。
- **reduced-motion**：不自動播放、起始即暫停（停在第一張，使用者仍可手動點 dot / play）。

### D. Infra / 文件

- **未新增 design token**：膠囊/圓鈕用 rgba 字面值（深色 chrome，與既有 hero nav 同性質、非 token）；其餘沿用 `--duration / --easing`。`_tokens.css` 未動。
- **改動 4 檔**：`index.html`（hero__nav markup：每個 dot 加 `.hero__dot-fill` span + `data-i18n-aria-label`、新增 `.hero__playpause` 按鈕含 pause/play SVG）、`shared.css`（`.hero__nav` 整段改 Framer 膠囊樣式）、`hero.js`（rAF 進度模型 + play/pause）、`i18n.js`（曝露 `window.i18nT` + apply 後派發 `i18n:applied` 事件，供 hero.js 重貼狀態相依標籤）。其餘頁面零影響（hero 只在 index.html）。
- **a11y / i18n**：dot 用 `data-i18n-aria-label`（hero.slide-1~3）走既有機制；play/pause 標籤狀態相依（播放↔暫停）無法用靜態 data-attr，改由 hero.js 透過 `window.i18nT('hero.pause'/'hero.play')` 取字，並監聽 `i18n:applied` 在語言切換後重貼。實測 EN「Pause slideshow / Go to slide 1」↔ 中「暫停輪播 / 跳到第 1 張」皆正確。reduced-motion 下不自動播。
- **注意快取**：`hero.js` 檔名無版本號，本機開發若看到舊行為請硬重新整理（Cmd+Shift+R）；正式 deploy 重新上傳即生效。
- **驗證截圖**：`screenshots/53-hero-framer-slideshow-indicator.png`（置中 hero + 底部 Framer 膠囊指示器）。

---

## 2026-05-27 · R 2.1.22-preview · 黑夜版 header 滾動後霧面模糊

### B. 反饋導入

- **暗色模式 header 下滑後加 backdrop blur**（使用者指定）。暗色 `--surface` 是半透明 `rgba(253,253,253,0.10)`，header 釘在頂端時 hero 照片/內容會直接穿透 nav 列、文字不易讀。現在頁面一離開頂端（`scrollY > 8`）就在 header 上掛 `.is-scrolled`，暗色下切換成霧面玻璃（`background: color-mix(var(--background) 62%, transparent)` + `blur(14px) saturate(140%)`）。
- **僅作用於暗色模式**：亮色 `--surface` 是不透明 `#FFFFFF`，內容本來就不會穿透，故不加 blur，亮色行為不變。

### D. Infra / 文件

- **未新增 design token**：霧面背景用 `color-mix` 衍生自既有 `--background`；沿用 `--duration / --easing`（transition 多掛一條 `backdrop-filter`）。`_tokens.css` 未動。
- **改動 2 檔**：`sidebar.js`（topbar 注入後加 passive scroll listener，`scrollY > 8` 時 toggle `.is-scrolled`，初始即跑一次）、`shared.css`（`.app-topbar` transition 加 `backdrop-filter`；新增 `[data-theme="dark"] .app-topbar.is-scrolled` 霧面規則）。topbar 由 `sidebar.js` 全站注入，故所有頁面一致生效。

---

## 2026-05-27 · R 2.1.23-preview · Hero 第一張改影片 + 新增分層合成圖 banner

### B. 反饋導入

- **第一張（Create Project）背景圖改成影片**：`images/hero-audience.png` → `<video class="hero__media" src="Video/hero-project.mp4" autoplay loop muted playsinline>`（Veo 3.1 image-to-video，1920×1080 / 8s，正好對上輪播節奏）。`hero.js` render() 增加：只播放 active slide 的 `<video>`、其餘 pause（省資源、切回再續播）。
- **新增第二張 banner（分層「audience」合成圖）**：文案/CTA **與第一張完全相同**（使用者指定「和第一張一樣，只是不同背景圖預覽」，沿用 `hero.project.*` / `btn.start-project` i18n keys）。背景用 `hero-audience-layers/hero-audience-background-empty.png`（空景長廊），上面疊 3 個去背表演者 `.hero__layer`（left-front 蹲姿寫字 / left-back keytar 舞者 / right-singer 唱歌），**依 `hero-audience-background-assembly.png` 構圖**定位。中央亮帶正好留給置中文字。
- 輪播從 3 → **4 張**（dots 同步加到 4 顆，`hero.slide-4` i18n key 補上）。`hero.js` 本來就以 NodeList 長度泛用，加 slide/dot 無需改邏輯。
- **人物層定位微調**（第二輪反饋）：DOM 順序改成 left-back 先畫、left-front 後畫，讓 **left-front（蹲姿）疊在 left-back（keytar 舞者）之上**；left-front 放大（height 58%→70%）；三張都往兩側散開（left-front `left:1%→-4%`、left-back `left:17%→9%`、right-singer `right:2%→-3%`），中央留更寬給置中文字。
- **人物層再微調 + 底部遮罩**（第三輪反饋）：right-singer 再往右（`right:-3%→-7%`）、left-front 再放大（height `70%→80%`）、left-back 往右一點（`left:9%→13%`）。新增 `.hero__slide--audience::after` **底部漸層遮罩**：用背景圖底部取樣的鋼藍灰 `rgb(110,119,127)` 從底往上淡出（40% 高），把表演者腳部柔和融進地板色（z-index 1，壓在人物之上、文字之下）。
- **人物再散開 + 底部遮罩改「融入網站背景的毛玻璃」**（第四輪反饋）：left-front 再往左（`left:-4%→-10%`）、left-back 再往右（`left:13%→19%`）。底部遮罩從「鋼灰純色」改成**融進網站背景**：漸層改用 `var(--background)`（hero 底部無縫溶進下方頁面），並加 `backdrop-filter: blur(10px)` + `mask-image`（把模糊限制在底部、往上淡出），整層 z-index `1→3` **提到 slide 最上層**（壓在人物與文字之上）。CTA 按鈕在遮罩帶之上、維持清晰。
  - **連帶修正**：`.hero__slide` 補上 `z-index: 0` 讓它**建立自己的 stacking context**——否則 slide（原本 `z-index:auto` 不成 context）內部的 `::after`(z3) 會跟 sibling `.hero__nav`(z2) 在同一層比較、把輪播控制器蓋掉。加了 context 後 `::after` 被關在 slide 內，`.hero__nav` 永遠在 slide 之上、控制器正常顯示。
- **audience slide 拿掉變暗遮罩 + hero 去除底線**（第五輪反饋）：用 `.hero__slide.hero__slide--audience::before { content: none }`（**兩個 class** 拉高 specificity，否則與基礎 `.hero__slide::before` 同分、又因 source order 在前而被蓋回）移除中央 radial 變暗遮罩，讓合成圖維持明亮通透；改在 `.hero__copy` 加 `text-shadow`（非遮罩）維持白字可讀。`.hero--fullbleed` 的 `border-bottom` 由 hairline 改 `0`，hero 底部無縫溶進頁面、不再有分隔線。
- **左二人再往左 + 加大 hero↔bento 間距**（第七輪反饋）：left-front `-10%→-14%`、left-back `19%→14%`；Dashboard KPI bento 加 inline `margin-top: 44px`（dashboard-scoped，不動全域 `.page` padding）拉開 hero 與 bento 的距離。
- **人物層響應式縮放**（第八輪反饋）：原本人物用 `height: %`（相對固定 720px slide 高度），視窗變窄時像素大小不變、相對寬度變大而擠到中央文字。改成 `height: clamp(min, Nvw, max)` 讓尺寸**跟視窗寬度連動**——寬螢幕維持原大小（cap：left-back 680 / left-front 580 / right-singer 620px），窄螢幕等比縮小（如 1050px 寬時約 504 / 420 / 452px）。位置本就是 `%`、隨寬度縮放，現在尺寸也一起縮，整組等比變小。
- **第一、二張對調**（第六輪反饋）：載入首屏改成 **audience 合成圖**（slide 0），Veo **影片移到 slide 2**（slide 1）。順序變 Project(合成圖) → Project(影片) → IP → Event。純調 index.html 兩個 `.hero__slide` 區塊順序（含 `hidden` / `data-slide` 互換），hero.js 以 NodeList 泛用、無需改。

### D. Infra / 文件

- **stacking 重整**：`.hero__media` / `.hero__layer` z-index 0（最底）→ `.hero__slide::before` 遮罩 z-index 1 → `.hero__copy` z-index 1→**2**。人物層放在遮罩**下方**，中央 radial veil 壓暗中段保證白字可讀（表演者也是白衣，靠 veil 拉對比）。
- **改動 4 檔**：`index.html`（slide 0 換 video、插入 slide 1 分層、event slide 改 data-slide=3、第 4 顆 dot）、`shared.css`（`.hero__media` / `.hero__layer--*` 定位 + z-index）、`hero.js`（active video 播放控制）、`i18n.js`（`hero.slide-4`）。
- **未改 design token**；遮罩/定位皆 rgba / 百分比字面值。
- **素材**：含空白檔名的影片已複製成 URL-safe 的 `Video/hero-project.mp4`（原檔保留可自行刪）；舊 `images/hero-audience.png` 不再被引用（保留未刪）。
- **spec 偏離備註**：spec 03.6 §1 原定 Create Project → IP Market → Create Event；本次依使用者要求在第二位插入第二張 Create Project，順序變 Project(影片) → Project(合成圖) → IP → Event。
- **影片已壓縮**：`hero-project.mp4` 用 ffmpeg（1080p / H.264 / crf 30 / faststart / 去音軌）從 **20 MB → 3.9 MB**，畫質肉眼幾乎無差。
- **驗證截圖**：`screenshots/54-hero-slide1-project-video.png`（影片背景）、`55-hero-slide2-audience-layered.png`（分層合成圖，調整後構圖）。

---

## 2026-05-27 · R 2.1.23-preview · Hero 標題依規格斷句

### A. Spec adjustments

- **三張 Banner 主標依 03.6 §2 的「主選文案」兩行斷句**（規格把主標寫成兩行，原本中文用「，」串成一行）。改用 `<br>` 強制斷在規格的分行點：
  - 建立專案：`讓作品不只被看見` / `也被支持、被參與、被延伸`
  - 探索 IP 市場：`讓作品不只從零開始` / `也能找到可合作的 IP`
  - 建立活動：`想辦活動` / `不再只是想辦而已`
- **英文同步斷成兩行**（規格只定中文；英文在自然分界 — em-dash / 問號 — 斷行），讓兩種語言都是乾淨的兩行主標。

### D. Infra / 文件

- **改動 2 檔**：`i18n.js`（`hero.project/ip/event.title` 三個 key 的 en/zh 值內嵌 `<br>`；`data-i18n` 走 `innerHTML` 套用，故 `<br>` 會渲染）、`index.html`（四個 `hero__title` inline fallback 同步加 `<br>`，slide 0/1 共用 project 標題）。未動 token、未動 CSS。

---

## 2026-05-27 · R 2.1.24-preview · 移除 Dashboard「十一月總覽」section header

### C. 撤除（intentional removal）

- **刪掉 Dashboard 的 `.section-head`**（「November at a glance / 十一月總覽」標題 + 「All figures sourced from Earnings → / 所有數字皆引用自收入管理 →」副標）（使用者反饋）。KPI bento 現在直接接在 hero 之後。
- 只動 `index.html`（移除該 `.section-head` 區塊）。`i18n.js` 的 `section.month-glance` / `section.month-glance-sub` 兩個 key 變成未使用（保留未刪，無副作用）。未動 token / CSS。其他區塊標題（Recent earnings / Alerts / Revenue trend / Revenue by source）是卡片內 header、不受影響。

---

## 2026-05-28 · R 2.1.26-preview · 人物層改 @keyframes 動畫（修「沒有動」）+ asset 版本號

### B. 反饋導入

- **使用者反饋進場「沒動」**——除錯後發現 R 2.1.25 的 `:not(.is-in)` 過渡式進場在 `<img>` 元素上**不能可靠觸發 transform**：reveal.js 加完 `.reveal` 後一個 frame 內 IO 就加 `.is-in`，offset 狀態根本沒被 paint，瀏覽器把 transition collapse 掉。控制組 `.kpi`（div）OK、`<img>` layer 無效。
- 改用 **CSS @keyframes 動畫**（不走 transition）：`heroLayerSlideInLeft` / `Right`（`translateX(±140px)/opacity 0` → `translateX(0)/opacity 1`），`.hero__layer.reveal` 套上 0.9s `var(--easing)` `both`，per-layer `animation-delay` 60 / 140 / 220 ms。reveal.js 還是把 `.reveal` 標上去，但動畫由 keyframes 驅動、不依賴 transition。位移加大到 140px、時長 0.9s（總長約 1.1s）確保肉眼明顯可見。
- 驗證：`getAnimations()` 回傳 1 個 active animation，settle 後 `transform: translateX(0)` / `opacity: 1`。

### D. Infra / 文件

- **加 asset 版本號**：`index.html` 上 `theme.js / shared.css / icons.js / i18n.js / sidebar.js / hero.js / chart.js / reveal.js` 全部加 `?v=20260528d`，**之後不用再 Cmd+Shift+R**；改檔再 bump 版號就行。
- **改 2 檔**：`shared.css`（layer reveal 從 transition+:not(.is-in) 改成 @keyframes + animation-delay；加 `prefers-reduced-motion` 下 `animation: none` 保護）、`index.html`（asset 版本號）。`reveal.js` 不變。
- **標題與 4 KPI bento 的淡入未動**：仍走 reveal.js + 既有 transition 機制（在 div 上 OK），工作正常。

---

## 2026-05-28 · R 2.1.25-preview · 第一張 banner 人物層方向性進場

### B. 反饋導入

- **第一張 banner 人物層加方向性進場**（使用者反饋）：載入時，左邊兩個（left-back → left-front）由左邊依序淡入滑進，右邊歌手由右邊淡入滑進。實作上接到既有 `reveal.js`：
  - `reveal.js` 的 `SELECTOR` 多加 `.hero__layer`，讓三個人物層也被 IntersectionObserver tag + 觀察（**once-only**，與 `.hero__copy` / `.kpi` 同一機制；`prefers-reduced-motion: reduce` 下整套 reveal 早退）。
  - `shared.css` 加 `html.reveal-on .hero__layer.reveal:not(.is-in) { transform: translateX(-72px) }` 與 `.hero__layer--right-singer` 變體（`+72px`）覆寫基礎 reveal 的 `translateY(10px)`，做方向性進場。`:not(.is-in)` 確保 `.is-in` 的 `transform: none` 仍能 reset。
  - **`index.html`** audience slide DOM 順序改成 `.hero__copy` **第一個 child**（layers 排其後），讓 reveal.js 的 auto-stagger（同 parent index × 60ms）給到：copy delay 0、left-back 60ms、left-front 120ms、right-singer 180ms。**標題的進場時序保持 0ms 不變**，符合「其他原本的淡入不變」。
- **標題（由下往上淡入）與四個 KPI bento 淡入**：本來就由 `reveal.js` + 既有 `.hero__copy.reveal > *` stagger / `.kpi.reveal` 規則處理；此次未動，僅再次確認載入時皆會淡入。

### D. Infra / 文件

- **改 3 檔**：`reveal.js`（SELECTOR 加 `.hero__layer`）、`index.html`（audience slide DOM 順序 copy-first）、`shared.css`（兩條方向性 `translateX` 覆寫，加在既有 reveal 區塊內）。未動 token、未動其他頁面。
- **驗證**：computed transform 在 reveal-not-is-in 狀態 = `translateX(-72px)`/`+72px`（settle 後測得 `-71.97/+71.97`），settled `transform: none`、`opacity: 1`，layout 完整。

---

## 2026-05-28 · R 2.1.27-preview · Hero 進場改 WAAPI（修「title / bento 沒淡入」）+ 速度微調

### B. 反饋導入

- **使用者反饋「中間文字、按鈕、bento 沒淡入」+「左邊那位再慢一點」**。除錯過程的關鍵發現：在這個 engine 上 **CSS @keyframes 動畫對 `<h2>` 與 `<img>` 不可靠**——動畫屬性都套上去了（`getAnimations()` 也有條目顯示 `state: finished`），但 computed `opacity` 卡在 `from` 的 0、`forwards` fill 沒生效。控制組 `.kpi`（div）反而正常。**Web Animations API（`Element.animate()`）對同樣的 `<h2>`/`<img>` 完全正常運作**（中段量到 opacity 0.685、settled 1）——因此切換到 WAAPI 驅動。
- 三組進場行為：
  - **Hero 文字與 CTA**（`.hero__copy > *`）：translateY 24px → 0、opacity 0 → 1，duration 850ms，stagger delay 80 / 240 / 400 ms。
  - **三個人物層**：directional translateX ±140px → 0、opacity 0 → 1；**left-front 1500ms（最慢）**、left-back 1000ms、singer 1100ms；delay 60 / 140 / 220 ms。
  - **KPI bento 四卡**：仍用 CSS `@keyframes kpiRise`（在 .kpi 上 CSS 動畫運作正常），duration 700ms，stagger 80 / 220 / 360 / 500 ms。
- CSS pre-hide：`.hero__slide--audience .hero__copy > *` 與 `.hero__layer` 預設 `opacity: 0`，避免 WAAPI 啟動前的可見閃爍；reduced-motion 下還原 `opacity: 1`。

### D. Infra / 文件

- **改 3 檔**：`hero.js`（新增 `runHeroIntro()`，DOMContentLoaded 時跑 WAAPI 進場；reduced-motion 早退）、`shared.css`（移除失效的 hero copy 子元素與 hero__layer 的 CSS 動畫規則 / @keyframes；加上 audience-slide 進場 pre-hide；保留 KPI 的 `@keyframes kpiRise`）、`reveal.js`（SELECTOR 移除 `.hero__layer`——避免和 WAAPI 競爭）。
- **驗證**：載入 ~400ms 後，title / sub / leftFront / singer / kpi 都顯示 `getAnimations().length === 1, state: finished, opacity: 1`，到 2.4s 仍穩定 settled。
- **版本號** bump 到 `?v=20260528f`。

---

## 2026-05-28 · R 2.1.39-preview · CJK 字體切到 Noto Sans TC（Taipei Sans 全面拿掉）

### C. 撤除

- **使用者反饋「把中文字體都改成 Noto Sans TC 不要用 Taipei Sans」**：撤除 Taipei Sans TC Beta 在 `fonts.css` 的 3 條 @font-face（Light / Regular / Bold）+ 從 `:root` / `:lang(zh-Hant)` font-family stacks 全部移除。`/fonts/TaipeiSansTCBeta-*.ttf` 三個檔案目前還在 disk（沒主動刪），下一個 pass 可獨立清掉。

### B. 反饋導入

- **CJK 字體換成 Noto Sans TC** 兩處：
  - `fonts.css :root` — 三個 stack（`--font-display` / `--font-ui` / `--font-body`）裡的 `Taipei Sans TC Beta` 換成 `Noto Sans TC`，順序維持（Latin 優先、CJK fallback、system-ui、sans-serif）。
  - `shared.css :lang(zh-Hant)` — 三個 stack 第一位從 `Taipei Sans TC Beta, Noto Sans TC` 簡化成 `Noto Sans TC`（拿掉前置的 Taipei Sans）。R 2.1.37 寫過「per-glyph fallback + line metrics」推理，邏輯不變，只是 primary CJK 切換。
- **Open issue（標在程式碼註解內）**：Noto Sans TC **沒有自架 @font-face** — 全 CJK web font 即使 subsetted 也要 ~3-4MB per weight。靠系統內建：
  - macOS：系統有 Noto Sans CJK 但名字是 `Noto Sans CJK TC`，能不能精確 match `'Noto Sans TC'` 看版本（10.15+ 通常 OK）。沒中就 fallback 到 system-ui → PingFang TC，視覺上仍然合理。
  - Linux：通常有 `Noto Sans TC`，OK。
  - Windows：沒預裝 Noto Sans TC，會 fallback 到 system-ui → JhengHei；視覺 metrics 跟 Mac 不一致。
- 真要 Windows parity 要做 subset 自架。memory `feedback-browser-cjk-first-lang-override` 已更新範例。

### D. Infra / 文件

- **改 2 檔**：
  - `ds-components/fonts.css`：標頭註解改寫（CJK 段落）；3 條 Taipei Sans @font-face 整段刪；`:root` 3 個 stack 換 Noto Sans TC。
  - `shared.css`：`:lang(zh-Hant)` 3 個 stack 拿掉 Taipei Sans，註解改寫標明 R 2.1.39 切換 + 自架未做的 open task。
- **15 個 html 全部 cache-bump** `ds-components/fonts.css?v=20260528a`（sed 批次；繼 chart / card 之後第三個納入版本管理的 DS 元件）。
- **shared.css** bump `?v=20260528p`。
- **沒動**：`/fonts/` 目錄下的 .ttf 檔還在但不再被 @font-face 引用，瀏覽器不會下載；要徹底清掉是磁碟層級的事，不影響執行。

---

## 2026-05-28 · R 2.1.38-preview · `.card__head .card__link` 去底線 + 加 chevron 圖示（DS-level）

### B. 反饋導入

- **使用者反饋「Bento 元件中所有 title 旁的 View all 都不要底線，旁邊加一個 chevron」**：原本 `.card__link` 是 underlined text-link 風格（`border-bottom: 1px solid var(--border) + padding-bottom: 1px`）；title 旁帶 underline 對導航類連結太重，使用者要更現代的「無底線 + 右側 chevron 圖示」樣式。
- **Scope 決策**：只動 `.card__head .card__link` — 其他 `.card__link` 使用情境（breadcrumb / row 行內 edit / inline body link 如 Audience-trend 的 "Fix"）仍是純文字 underline，那些位置 underline 是合理的閱讀提示。

### D. Infra / 文件

- **改 1 個 DS 元件**：`ds-components/card.css` 在 `.card__link` base 規則後追加 `.card__head .card__link` + `::after` 兩條：
  - `border-bottom: 0; padding-bottom: 0` 去 underline、用 `inline-flex + gap` 對齊圖示
  - `::after` 用 Lucide chevron-right 路徑透過 `mask + background: currentColor` 實作 — 顏色跟 `var(--foreground-muted)` 同步、hover 切到 `var(--foreground)`、Tabler 風格 stroke-width: 2 / linecap: round
  - 14×14px 圖示尺寸跟 12.5px 文字基線對齊
- **改 i18n.js 3 條**：原本 hard-code 在文字結尾的 `→` 拿掉（不然會跟 chevron::after 撞）：
  - `dash.progress.link`: `All projects →` → `All projects`（zh: `全部專案 →` → `全部專案`）
  - `dash.fans.link`: `Open Fans →` → `Open Fans`（zh: `開啟粉絲頁 →` → `開啟粉絲頁`）
  - `dash.integrations.link`: `Manage →` → `Manage`（zh: `管理 →` → `管理`）
  - `dash.audience.fix`（"Fix →"）保留 — 不在 `.card__head`，不會自動加 chevron。
- **同步 3 處 index.html fallback** 英文文字。
- **未動**：breadcrumb / row-level / inline body 的 `.card__link` 用法（my-ip / e-shop / product-detail / ip-detail / create-project 等）— 那些保留 underline。
- **影響範圍**：所有頁面 `.card__head` 內的導航連結（Dashboard 5 張、earnings "View all"、其他 title-side `.card__link`）— DS-level 一致更新。
- **版本號** bump：`ds-components/card.css?v=20260528a`（15 個 html 全部加上 query string）、`i18n.js?v=20260528k`。

---

## 2026-05-28 · R 2.1.37-preview · zh-Hant locale 把 Taipei Sans TC Beta 提到 font-family 第一位

### B. 反饋導入

- **使用者問「中文語系下 font-family 第一位可以是 Taipei Sans 嗎」**：可以，而且應該。瀏覽器 font-fallback 是 per-glyph，中文字塞進 Geist 主導的 line box 會被英文字體 metrics 牽著走（中文常見偏小、行距偏緊、垂直對齊不太對）。CJK 字體放第一位，line-height / x-height / baseline 由 CJK 主導，中文版面節奏對。
- memory `feedback_weasyprint_cjk_fonts.md`（PingFang 不能放第一位會掉中文）**不適用瀏覽器** — 那是 macOS + weasyprint PDF 引擎的 bug，瀏覽器沒這個問題。

### D. Infra / 文件

- **改 1 檔**：`shared.css` 開頭新增 `:lang(zh-Hant)` block，把 `--font-display` / `--font-ui` / `--font-body` 三個 token 的 stack 第一位全部換成 `Taipei Sans TC Beta`，後面接原本的 Geist / Geist Variable / Inter。
- **不動 `_tokens.css`**：DS token 維持英文優先當 canonical 宣告，locale-specific behavior 屬於專案層級，放 `shared.css`。`:lang(zh-Hant)` specificity (0,1,0) > `:root` (0,0,1)，所以 override 會贏。
- i18n.js 已經有 `document.documentElement.lang = 'zh-Hant'`（line 338），`:lang()` 會自動生效。
- **影響**：切到 zh 後，所有用 `var(--font-ui/display/body)` 的元件（KPI、card title、hero title、table、buttons、etc.）的 line metrics 都改由 Taipei Sans 主導。英文 locale 不受影響。Taipei Sans 已自架在 `ds-components/fonts.css` line 49-63（多 weight），無 CDN 風險。
- **版本號** bump：`shared.css?v=20260528n`。

### 更新（同 R 2.1.37 內補增）· Noto Sans TC 第二順位

- **使用者反饋「中文第二順位是 Noto Sans TC」**：在 Taipei Sans TC Beta 之後、Geist / Geist Variable / Inter 之前各插入 `'Noto Sans TC'`。三個 token 都加。
- **沒自架** Noto Sans TC — CJK 全字符 web font 每個 weight ~10MB+，整套加進去拖頁面太重。靠系統內建（macOS / Linux 多數有預裝，Windows 不一定）；這條 fallback 只在 Taipei Sans 載入失敗的稀有狀況才生效，自架 Taipei Sans 幾乎不會失敗。
- **版本號** bump：`shared.css?v=20260528o`。

---

## 2026-05-28 · R 2.1.36-preview · Dashboard 五張卡 zh-Hant i18n 補完

### B. 反饋導入

- **使用者反饋「中文語系下這些內容沒翻譯」**：Dashboard 中段 5 張卡（Recent activity / In progress / Fans & loyalty / Audience trend / Integrations）大部分 hard-coded 英文，沒掛 `data-i18n`，所以切到 zh-Hant 不會被翻。
- **影響範圍**：5 個卡片 title + link、12 條 data-list row（title + meta）、4 個 fan tier label、1 條警告 stickynote、3 條 audience 描述／註腳、8 條狀態 badge（Live / Scheduled / On sale / Draft / Sync failed / Synced / Partial / Not connected）。

### D. Infra / 文件

- **改 2 檔**：
  - `index.html`（Dashboard 中段 5 個 `<section class="card">` 的所有可見英文文字 + status badge 包成 `<span data-i18n="...">…</span>`；專有名詞（Coastline EP / Late Bloom / Spring Launch / Quiet Hours / Cypress Audio / Inner Circle / Spotify / YouTube / Instagram / StreetVoice / TikTok）保留在 `<em>` 內，不翻）。
  - `i18n.js`：新增 `dash.*` 命名空間 27 條（recent / progress / fans / audience / integrations 五群）+ `status.*` 補 8 條（live / scheduled / on-sale / draft / sync-failed / synced / partial / not-connected）。日期格式中文化（`Nov 23` → `11/23`、`Apr 12` → `4/12`、`Dec 01` → `12/01`），符合 zh-Hant UI 慣用簡寫。`dash.recent.row*.title` 與 `dash.fans.warning` 含 `<em>` / `<strong>` inline HTML — `apply()` 用 `el.innerHTML = v` 套用，markup 會保留。
- **未動**：DS components、token、其他頁面、SPEC.md。
- **驗證重點**：切 zh 後檢查 `<em>` 仍有 italic、`<strong>` 仍有 bold；warning stickynote 一條的 ` ` 軟空格不要丟。
- **版本號** bump：`i18n.js?v=20260528j`。

---

## 2026-05-28 · R 2.1.35-preview · chart-card 標題 / padding 對齊 .card（DS parity）

### A. 規格落地（DS-level）

- **使用者反饋「Revenue trend 跟 Revenue by source 字體、padding 不一樣」**：兩個區塊（`.chart-card` vs `.card`）並排在同一個 bento row 時左邊起始點 / 標題字重不一致 — 使用者也自己分析出「chart-card 分 head / body / foot 三段各自有 padding」，但希望視覺上對齊。
- 在 `ds-components/chart.css` 把 chart-card 的標題字體與 side padding 全部對齊 `.card` 與 `.card__title`：
  - `.chart-card__title`：`14px / 600` → **`15px / 500`**（直接 mirror `.card__title`）。
  - `.chart-card__head`：`padding 12px 16px` → **`20px 20px 14px`**（side 20px 對齊 .card outer，bottom 14px 對齊 `.card__head margin-bottom` 節奏；保留 `border-bottom` — chart-card 一直有的 head divider）。
  - `.chart-card__body`：`padding 16px 28px 12px` → **`16px 20px 12px`**（side 28 → 20，原本 28px 把 chart 視覺左推）。
  - `.chart-card__foot`：`padding 8px 16px` → **`10px 20px`**（side 對齊；top 微調讓 foot 視覺呼吸；保留 `border-top`）。

### D. Infra / 文件

- **改 1 檔**：`ds-components/chart.css`（四條 .chart-card__* 規則，註解標明 DS parity 理由）。未動 token、未動 HTML、未動 `card.css`。
- **影響範圍**：所有用到 `.chart-card` 的頁面（index / earnings / fans-crm / design-system demo）。Earnings 主圖、Fans CRM 漏斗、design-system demo 的 chart-card 標題與內距會一致變動 — 屬於 DS 同步而非單頁修正。
- **版本號** bump：`ds-components/chart.css?v=20260528a`（4 個 html 頁面都帶上 query string；既有 ds-components/*.css 沒掛 version，這條是先驅）。

---

## 2026-05-28 · R 2.1.34-preview · 人物垂直置中（取代貼底錨點）

### B. 反饋導入

- **使用者反饋「螢幕寬度 ~1350px 時三個人靠下方縮小，改成置中靠左右縮小」**：原本 `.hero__layer` 用 `bottom: 0`，搭配 `height: clamp(min, vw, max)` — 當 viewport 縮窄到 clamp 中段，圖縮短但腳仍貼底，視覺上人物變小、上方空白變大（像「壓在底邊」）。
- 改成 `top: 50%; transform: translateY(-50%);` 垂直置中錨點 — 縮短時 symmetrically 在中線兩側收縮，人物視覺中心不會下沉。

### D. Infra / 文件

- **改 2 檔**：
  - `shared.css`：`.hero__layer` base rule 換掉錨點（`bottom: 0` → `top: 50% + translateY(-50%)`）；註解標明 WAAPI 需配合的 caveat。
  - `hero.js` `runHeroIntro` layerSpecs：每個 keyframe 都帶 `translateY(-50%)` — 因為 WAAPI 動畫的 `transform` 屬性會整條覆蓋 CSS 的 transform，若沒在 keyframes 內保留 Y 偏移，人物在 entrance animation 期間/結束會跳到下方（fill: forwards 把錯誤的 transform 鎖死）。spec 結構從 `[sel, from, dur, delay]` 改成 `[sel, from, to, dur, delay]`，from/to 各自帶完整 transform 字串。
- **版本號** bump：`shared.css?v=20260528m`、`hero.js?v=20260528m`。

---

## 2026-05-28 · R 2.1.33-preview · 左側人物位置 + 尺寸微調

### B. 反饋導入

- **使用者反饋「左邊的人可以往右邊移一點點，且左邊第一個人可以再大點點」**：
  - `.hero__layer--left-back`：`left: 6%` → `left: 10%`（往右 4 點）
  - `.hero__layer--left-front`（最左前那個）：`left: -22%` → `left: -16%`（往右 6 點，較不探出 viewport）
  - `.hero__layer--left-front` height：`clamp(360px, 40vw, 580px)` → **`clamp(400px, 44vw, 640px)`**（三組數值各 +10%，~10% 視覺放大）
- right-singer 維持不動（使用者沒提到右邊）。

### D. Infra / 文件

- **改 1 檔**：`shared.css`（2 條 `.hero__layer--left-*` 數值）。
- **版本號** bump：`shared.css?v=20260528l`。

---

## 2026-05-28 · R 2.1.32-preview · Audience slide 改用黑色半透明遮罩取代 text-shadow

### B. 反饋導入

- **使用者反饋「第一張文案陰影去掉，背景圖前加一個黑色半透明調暗塊讓白色文案看清楚」**：把 R 2.1.28 留下的 title/sub text-shadow 整條拿掉，改用 audience-slide 專用的 `.hero__slide.hero__slide--audience::before` 黑色 40% alpha 遮罩取代。
- **stacking 設計**（從下到上）：
  1. slide `background-image`（人像背景空場）
  2. `::before` 半透明黑遮罩 `rgba(0,0,0,0.06)`（R 2.1.32 一開始用 0.4 太重 → 0.2 → 最終 0.06，幾乎只剩一層極輕的色彩平衡，保留 audience 場景的明亮感）— z-index 0，source-order 上是 first generated sibling
  3. 三張 `<img>.hero__layer`（人物）— z-index 0 但 DOM 在 ::before 之後，所以畫在上面 → **人物保持原色不被壓暗**
  4. `.hero__copy` 文字（z-index 2）
  5. `::after` 底部 blur veil（z-index 3，未動）
- 視覺效果：只有後面那道明亮走廊被壓暗，三個人物剪影維持飽和銳利，白色 title/sub 在暗化的 bg 上對比度足夠（≥ 4.5:1），不需要 text-shadow，按鈕字也回到 design-system 的 crisp 樣式（R 2.1.28 的 DS parity 修正自然延續）。
- 兩件事一次做完：(1) 拿掉 title + sub 的 text-shadow、(2) 加入背景遮罩。

### D. Infra / 文件

- **改 1 檔**：`shared.css`（lines 458–471 區塊整段重寫：移除 `content: none` + text-shadow，改成 audience-only 的 `::before` 黑遮罩；註解標明 stacking 推理）。`position:absolute / inset:0 / content:""` 從基底 `.hero__slide::before` 繼承，不重複宣告。
- 未動 token、未動 HTML、未動其他 slide、未動 button.css。
- **版本號** bump：`shared.css?v=20260528k`（0.4 → 0.2 → 0.06 連續微調至最終值）。

---

## 2026-05-28 · R 2.1.31-preview · Hero title 結尾標點 opt-out（H2 no-period 規則）

### B. 反饋導入

- **使用者反饋「每張 banner 第一句與第二句結尾的標點符號去掉」**：套用 `feedback_section_titles_no_period_h3.md` 的規則 — H1/H2/H3 預設無結尾句號。R 2.1.29 為了忠實 spec 03.6 §2 把標點補回去，但本案決定 hero title opt-out（不採 spec 文字版完整句型）。
- 三條 title 兩行尾標點（中文 + 英文）都拿掉；sub 保留（敘述段落不是 heading）：
  - B1: `讓作品不只被看見<br>也被支持、被參與、被延伸` / `Make your work not just seen<br>but supported, joined, and extended`
  - B3: `讓作品不只從零開始<br>也能找到可合作的 IP` / `Find IP worth collaborating on<br>your next project needn't start from zero`
  - B4: `想辦活動<br>不再只是計畫而已` / `Hosting an event<br>no longer just a plan`
- 中間「、」（dunhao 列舉）保留 — 那是字間分隔，不是句子結尾。

### D. Infra / 文件

- **改 2 檔**：`i18n.js`（3 條 title 中英；註解標明 opt-out 理由與 spec 落差）、`index.html`（同步 3 條英文 fallback）。Sub、CTA、token、其他頁面未動。
- **版本號** bump：`i18n.js?v=20260528i`。

---

## 2026-05-28 · R 2.1.30-preview · Spec 文案二次校對 + audience layer 再往兩側

### A. 規格落地（英文翻譯忠實度提升）

- 二次比對 `integrated/03.6-Dashboard-Hero-Banner.md` §2，中文 9 條（3 banner × title / sub / CTA）已 100% 對齊；本輪修正英文翻譯不夠忠實 spec 原意的兩條（中文未動）：
  - `hero.project.title` EN：`Make your work seen, and supported...` → **`Make your work not just seen, but supported, joined, and extended.`**（補回 spec 「不只 X，也 Y」的疊加句型；feedback memory 提醒中文避免「不是 X 而是 Y」否定型，英文這裡用的是 additive `not just / but`，意思是疊加而非取代，不違反規則）
  - `hero.event.title` EN：`That event you keep meaning to run, stop planning and start running it.` → **`Hosting an event, no longer just a plan.`**（直譯 spec「想辦活動，不再只是計畫而已」，原本的問→答 restatement 換成直陳）
- `hero.ip.title` EN 保留 — 雖然倒裝 spec 原句序，但語義一致、英文更自然。

### B. 反饋導入

- **使用者反饋「第一張左右人物再往兩側移一點」**：三個 layer 各往各自方向再推 6–8 個百分點，但保留現有 `clamp()` 縮放比例：
  - `.hero__layer--left-back`：`left: 14%` → `left: 6%`（往左 8 點）
  - `.hero__layer--left-front`：`left: -14%` → `left: -22%`（再往左 8 點，最前面的人探出 viewport 更多）
  - `.hero__layer--right-singer`：`right: -7%` → `right: -15%`（往右 8 點）
- height clamp 維持不變（user 沒提到大小），所以視覺上人物會稍微更靠近邊框但體積一致。

### D. Infra / 文件

- **改 3 檔**：`i18n.js`（2 條英文 title）、`index.html`（同步 2 條英文 fallback，data-i18n 機制下兩處要一致以免無 JS / 載入瞬間落差）、`shared.css`（3 條 `.hero__layer--*` 的 left/right 數值）。
- 未動 token、未動其他頁面、未動 button.css。
- **版本號** bump：`shared.css?v=20260528h`、`i18n.js?v=20260528h`。

---

## 2026-05-28 · R 2.1.29-preview · Hero CTA 精簡 + 文案對齊 spec 03.6 §2

### A. 規格落地

- **依據** `integrated/03.6-Dashboard-Hero-Banner.md`（Dashboard Hero Banner 主題與文案）。
- **每個 banner 改為單一 CTA**（spec §2 每個 banner 僅列一個 CTA）：移除四張 slide 的第二顆 `.btn--outline`（原本是 See projects / My IP / See events）。
- **CTA label 縮為單詞動作**（不是完整句子）：
  - Banner 1 / 2（建立專案）：`Start your first project` / `開始第一個企劃` → **`Start a project` / `建立專案`**
  - Banner 3（IP Market）：`Explore IP Market` / `探索 IP 市場` → **`Explore` / `探索`**
  - Banner 4（建立活動）：`Create an event` / `建立活動` → **`Host an event` / `舉辦活動`**
- **Title / sub 文案** 完全對齊 spec §2 中文版（補回原本漏掉的逗號＋句號標點，符合 hero editorial 完整句子 opt-in 句號規則）：
  - Banner 1: `讓作品不只被看見，<br>也被支持、被參與、被延伸。`
  - Banner 3: `讓作品不只從零開始，<br>也能找到可合作的 IP。`
  - Banner 4: `想辦活動，<br>不再只是計畫而已。`
- **英文 title** 改為與中文同步的逗號斷句版本（原本的 em-dash / 問號收尾換成 comma-bridge）。

### D. Infra / 文件

- **改 2 檔**：`index.html`（四個 slide 的 `.hero__actions` 刪 secondary 按鈕、title 換新句、CTA label 換）、`i18n.js`（6 條 `btn.*` / `hero.*.title` 字串更新；註解標明 spec 03.6 §2 來源）。
- 未動 `button.css`、未動 token、未動其他頁面（grep 驗證 `btn.create-event` / `btn.open-market` / `btn.start-project` 僅 index.html 使用）。
- **版本號** bump：`shared.css?v=20260528g`、`i18n.js?v=20260528g`。
- **注意**：spec 只列 3 個 banner，目前仍保留 4 張 slide（建立專案占 2 張：人像 layered + Veo 影片，兩張都套 spec 2.1 的 Create-Project 文案）。要併回 3 張另立 R 2.1.30。

---

## 2026-05-28 · R 2.1.28-preview · Audience-slide 按鈕字陰影撤除（DS parity）

### B. 反饋導入

- **使用者反饋「第一張 banner 的按鈕和 design system 不同步，文字不該有陰影」**。原因：R 2.1.24 為了讓白色 title / sub 壓在人像背景上仍清楚，在 `.hero__slide--audience .hero__copy` 整塊套了 `text-shadow: 0 1px 18px rgba(0,0,0,0.45)`；這個陰影會繼承給內部所有文字，連 `.btn--primary`（黃底深字）與 `.btn--outline`（白底深字）的 label 都被罩上一層模糊陰影 → 視覺上就和 `ds-components/button.css` 的 §4.2 demo 不同步（DS 按鈕字本來是 crisp 的）。
- **修正**：把 text-shadow 從 `.hero__copy` 整塊改成只掛在 `.hero__title` + `.hero__sub` 兩個實際需要的文字元素上，buttons 自然回到原本的 crisp 字。Title / sub 的可讀性不變。

### D. Infra / 文件

- **改 1 檔**：`shared.css`（line 462–464 區塊：把單行 `.hero__copy { text-shadow }` 換成 title + sub 的二選擇器；註解標明 DS parity 的考量）。未動 button.css、未動 token、未動 DOM。
- **版本號** bump 到 `?v=20260528g`。

---

## 2026-05-28 · R 2.1.29-preview · Outline button 改白底（spec §4.2 修訂）

### B. 反饋導入

- **使用者反饋「Earnings 頁的「匯出」按鈕和 design system 不同」**（附圖：三顆按鈕「本月 ▾ / 匯出 / 申請提款」並列，其中匯出在使用者預期裡應為白色 pill）。原因：`.btn--outline` 設為 `background: transparent` + `box-shadow: var(--shadow-micro)`，在 `#FAFAF7` 暖紙底上整顆按鈕「消失」——只剩文字浮著，缺乏邊界感，看起來像沒有按鈕、跟旁邊 `.select` 的白底 hairline 也不一致。Canonical `.ztor-btn--outline` 其實一直是 `background: var(--surface)`（白），是文件 §4.2 表格寫成 transparent 才產生規範內部矛盾。
- **使用者裁決**：「design system 錯了，透明背景的按鈕應該要是白色的」→ 以白底為對，更新 §4.2 表格、`dm-btn--outline` demo、`.btn--outline` 三處同步成白色 surface fill。

### A. Spec-derived（規範訂正）

- **`design-system.md §4.2` Outline Background 欄**：`transparent` → `var(--surface)` (white)；Border 註解補上「白底 + micro-shadow 取代邊框；transparent 在 warm-paper 底會消失，2026-05-28 修訂」。
- **`design-system.html` `.dm-btn--outline`**：`background: transparent` → `background: var(--surface)`；其餘（radius 7px / micro-shadow）不動。
- **`ds-components/button.css` `.btn--outline`**：補 `background: var(--surface)` + `border-radius: var(--radius-md)`（原本繼承 `.btn` 的 6px，跟 §4.2 outline 應為 7px 不符）。hover 維持 `var(--surface-muted)` 不變。

### D. Infra / 文件

- **改 3 檔**：`design-system.md`、`design-system.html`、`ds-components/button.css`。未動 token、未動 HTML、未動其他元件 CSS。
- **影響範圍**：所有用 `.btn--outline` 的頁面（earnings / create-* / 各 wizard "Back" 鈕等），匯出 / Upload / Browse files / Add brand partnership / Back 等 outline 按鈕都會變成白色 surface fill。`.hero__actions .btn--outline` 在 [shared.css:567](shared.css#L567) 已自帶 `background: #FAFAF7` override（warm-paper 對比深 hero 圖），不受影響。
- **未動**：`.ztor-btn--outline` canonical 本來就是白底；其 hover 額外的 hairline ring 也不動。

---

## 2026-05-28 · R 2.1.30-preview · 全站 i18n 覆蓋（12 頁中文化）

### B. 反饋導入

- **使用者反饋「中文語系中，除了 dashboard 和 earnings 頁面以外，其他頁面也需要翻中文」**。原本 `i18n.js` 只覆蓋 Dashboard（`index.html`）與 Earnings（103 + 54 個 `data-i18n` 點），其他 12 頁打 zh 切換時仍維持英文。
- **修正**：為 12 頁的所有可見文字加 `data-i18n` 掛點 + 對應 i18n key + 繁體中文翻譯，含全部標題、副標、按鈕、欄位 label、tab、表頭、狀態 pill、空狀態提示、stickynote、breadcrumb、footer。

### A. Spec-derived

- **新覆蓋頁面**（12 頁）：
  - `projects.html` / `my-ip.html` / `ip-market.html` / `ip-detail.html` / `e-shop.html` / `product-detail.html` / `events.html` / `fans-crm.html` / `settings.html` — 原本就有 `<script src="i18n.js">`，本次純加 `data-i18n` 屬性。
  - `create-event.html` / `create-product.html` / `create-project.html` — 三個 wizard 原本沒有載入 `icons.js` / `i18n.js`，本次補上 `<script>` 引用 + 加 `data-i18n`。
- **`create-project.html` wizard 4 步驟的 Next 按鈕 label 動態切換**（「繼續設定作品呈現 / 變現方式 / 確認發布 / 發布專案」）：原本 JS 寫死英文字串，本次重構為 i18n key 表（`cpp.next.1` ~ `cpp.next.4`），並監聽 `i18n:applied` 事件，語言切換時 re-render。`alert()` 文字（草稿儲存 / 發布原型訊息）也透過 `window.i18nT()` 動態取值。

### D. Infra / 文件

- **`i18n.js` DICT 擴充**：從原本 ~155 keys（hero / topbar / dashboard / earnings）擴增到 ~500+ keys。新增 9 個 sections：
  - `ip-market.*` · `projects.*` · `my-ip.*` · `ip-detail.*` · `e-shop.*` · `product-detail.*` · `events.*` · `fans.*` · `settings.*`
  - Wizard 共用：`wiz.close / wiz.save / wiz.back`
  - 三個 wizard：`ce.*`（create-event）· `cp.*`（create-product）· `cpp.*`（create-project，含 step 1-4 完整覆蓋）
- **翻譯策略**：日期格式英→中時，月份名（Apr 12 → 4/12）、英文 weekday/month 轉繁中數字格式對齊既有 dashboard / earnings 風格。專輯 / EP / 創作者英文名保留不譯（Coastline EP / Maya Chou / Hsu Mei-li 等），因為這些是品牌與真實人名。
- **未動**：tokens / CSS / 元件 / 既有 i18n key（dashboard + earnings）/ 三個 wizard 的 step JS 邏輯（僅將寫死字串改為 i18n lookup）。
- **驗證**：用 Playwright `setLang('zh-Hant')` 切換 projects / ip-detail / settings / create-project / fans-crm，確認所有掛點都正確套上中文，wizard 的動態 Next 按鈕也跟著步驟切換。

---

## 2026-05-28 · R 2.1.31-preview · Page-intro eyebrow 撤除

### C. 撤除（intentional removal）

- **`.page-intro__eyebrow` 元件槽位全站撤除**。使用者貼 earnings 頁深色截圖，指出 page-intro 元件不需要 eyebrow（標題上方那行小型 uppercase tracking 的小字，例如 `USD · 2025 年 11 月`）。Title + sub 就足以承載頁面身分，多一行小字反而稀釋了 H1 的重量。
- **影響範圍**：8 個 product 頁面的 `.page-intro__eyebrow` 移除：
  - `earnings.html`（USD · Nov 2025）
  - `events.html`（3 upcoming · 8 past）
  - `e-shop.html`（28 products · 3 bundles · 1 auction）
  - `ip-market.html`（IP Bank）
  - `fans-crm.html`（Leaderboard updates nightly）
  - `projects.html`（2 of 16 pages built）
  - `my-ip.html`（IP Bank）
  - `settings.html`（Account）
- **不受影響**：`.hero__eyebrow`（dashboard hero 輪播的「開始 / 探索 / 延伸」三個 banner eyebrow）— 這是 hero 元件的 slot，不是 page-intro 的，繼續保留。
- **共同改動**：`shared.css` 移除 `.page-intro__eyebrow` 規則（line 382-389），留 retired 註解；`i18n.js` 移除 8 個對應 i18n key（`earnings.eyebrow` / `ip-market.eyebrow` / `projects.eyebrow` / `my-ip.eyebrow` / `e-shop.eyebrow` / `events.eyebrow` / `fans.eyebrow` / `settings.eyebrow`）。`hero.eyebrow.*` 三個 key 保留。

### D. Infra / 文件

- **改 10 檔**：8 個 HTML（eyebrow `<div>` 刪除）+ `shared.css`（CSS 規則撤除）+ `i18n.js`（8 個 key 撤除）。未動 token、未動 page-intro `.title` / `.sub` / `.actions` 的版面與樣式。
- **驗證**：Playwright 抓 earnings 頁面 `.page-intro` 截圖，title「Earnings」+ sub 直接呈現，沒有 eyebrow 行；其他 7 頁同步檢查 DOM 內已無 `.page-intro__eyebrow` 元素。
- **連動補丁**：`shared.css` `.page` 上邊距 32px → 48px（mobile 20px → 32px），為 title 騰出 eyebrow 撤除後缺少的呼吸空間。

---

## 2026-05-28 · R 2.1.32-preview · 新元件 Composer（Mobbin 參考捕獲）

### A. Spec-derived

- **新建 `ds-components/composer.css`** — drop / type 區 + 底部 action bar（左：upload + mic icon · 右：credit meter + 圓形 send 按鈕）。從 Mobbin AI-chat 參考截圖捕獲。
- **元件結構**：
  - `.composer`（外殼 card · `--surface` + `--radius-xl` (16px) + `--shadow-card`，整體 overflow:hidden）
  - `.composer__drop`（132px min-height drop zone · `--surface-muted` 底，`--foreground-subtle` 文字。`.is-dragover` 切到 `color-mix(--primary 12%, --surface)` + 黃色 inset ring）
  - `.composer__textarea`（替代 drop zone 的輸入模式，透明底 + Geist body font）
  - `.composer__bar`（hairline 分隔 · `border-top: 1px solid --border`）
  - `.composer__icon-btn`（32×32 hit · lucide 18px / 1.75 stroke · hover 上色 + `--surface-muted` 底）
  - `.composer__credits`（13px nowrap · `--foreground-subtle`）
  - `.composer__send`（36px circular · idle 用 `--surface-muted`，加 `--active` modifier 切到 `--primary` + 既有的 1px hairline 保 ≥3:1 邊界對比）
- **新增 lucide icons 到 `icons.js`**：`arrow-up`（composer send）· `mic`（voice input）。
- **三種展示狀態**：default drop / active 輸入有內容 / dragover 高亮，全部展示在 design-system.html `#composer` section（4.26）。

### D. Infra / 文件

- **改 4 檔**：
  - 新建 `ds-components/composer.css`（~115 行）
  - `design-system.html` 新增 `<link>` + `#composer` section（4.26）含 3 個 demo + spec table；`<script src="icons.js">` 加 `?v=20260528b` 版本號（避免 icons.js 改動被瀏覽器 cache 擋掉）
  - `design-system.md` 元件表格新增 Composer 列（指向 `composer.css`）
  - `icons.js` 加 `arrow-up` + `mic` 兩個 lucide 條目
- **未動**：tokens / 其他元件 / 任何頁面（composer 還未被任何產品頁採用，僅以 design-system 文件中的元件存在；首次採用時再依 feedback_promote_on_first_use 把產品頁的具體實例同步進來）。
- **驗證**：Playwright `#composer` section 截圖 — 3 個 composer demo 都正確 render，icons 都顯示，active send 為黃色 pill，dragover 為黃色 inset ring。

---

## 2026-06-01 · 設計系統文件去品牌 + 去 上游來源系統 殘留（對齊 project-ui-creator skill）

### D. Infra / 文件

> 背景：`design-system.md` / `.html` 是從上游 `Design/Design System/ztor yellow/` 整份拷貝來的，而 ztor yellow 是 design-system-analyzer 逆向爬 上游來源系統（GEO / AI 搜尋分析 SaaS）的產出。出貨頁面早已是 Ztor Creator Studio，但這份 DS 文件仍在描述 上游來源系統。本次對齊 2026-06-01 更新後的 `project-ui-creator` skill 規則（DSS v1.4），把文件改寫成本產品自己的設計系統。

- **`design-system.md`（source of truth）+ `design-system.html`（視覺化鏡像）都已同步去 上游來源系統 / 去 Framer 爬網框架。** 上游 canonical ztor yellow 未動（仍有同樣殘留，日後重拷會回來）。
- **Identity** — Tagline / Category / Overview / Tags 從「AI search analytics / GEO」改寫成創作者經濟營運後台；語氣原則對齊 SPEC §1（透明 / 降門檻 / 任務導向 / 連動 / 合規）。Similar systems 改列 Notion / Linear / Vercel / Attio / Stripe Dashboard。
- **Pillar 0 Record** `source` 從「上游來源系統 逆向爬網」改為「Ztor Creator Studio」。
- **Pillar 1 Foundation** — 移除 Framer 爬網觀察框架；§1.7 Iconography 改 Lucide（原寫「無 icon library」是錯的）；§1.8 Theme 改 light / dark / system（原寫「only light」是錯的）；§1.9 topbar 改 sticky（原寫 relative / scrolls away 是錯的）；§1.10 Imagery 改成創作者工作室。
- **§4.0** 去品牌：移除 Material / Polaris / Brad Frost 對照欄。
- **§4.1 Inventory** 重建：對齊實際 `ds-components/` 24 檔、加 `_layer` 欄、清掉指向不存在 `./components/` 的死連結與 上游來源系統 marketing 元件列。
- **§5.1** 改成 **Pattern 卡**：5 張、四類別（Layout / Interaction / Lifecycle / Workflow）各 ≥1、每張 5 格（trigger / must / should / must-not / _edge-cases），以本產品實際流程為本。
- **§5.2 Voice / §5.4 States / §5.6 Workflow** 去 上游來源系統（cookie pill / form-success / agency-directory / bookdemo / app.ztor.ai handoff），改寫成創作者工作室；Voice 補 Is/Is-not 表 + microcopy。
- **附錄** Similar Systems 去重（保留在 Identity）；B→A（輸出格式）、C→B（JSON 骨架）重編號；JSON 骨架 `record.source` / `component._layer` / `pattern._cards` 更新。
- **刪除檔尾 ~475 行 上游來源系統 爬網報告**（Source notes · Confirmed absent · Sources）。檔案 1756 → 1288 行。
- **`design-system.html`（380KB 視覺化鏡像）同 .md 同步**：Identity / Pillar 0 / 主題說明 / §4.0 去品牌 / inventory / patterns 表改 Pattern 卡摘要 / Voice 表 / 排版 sample / 比較表 demo / footer / Framer 爬網用語 / CTA labels 全部去 上游來源系統。4589 → 4578 行，section/table 結構不變。
- **新增** `component-library.md`（元件庫索引）+ `requirements-map.md`（需求 → pattern 對照），補齊 lifecycle 具名檔（薄索引、指向既有權威文件，不重複內容）。
- **驗證**：全檔 grep 上游來源系統 / GEO / Framer / marketing 殘留 = 0；死連結 `./components/` = 0；7 支柱 + 附錄 A/B + Changelog 結構完整；27 個 `_layer` 標。
- **未動**：tokens / `ds-components/*.css` / 任何頁面（純文件對齊，出貨 UI 不變）。

---

## 2026-06-01 · 自給自足 + 11 欄元件卡 + design-system.html 重生

### D. Infra / 文件

> 使用者要求：(1) R 2.1 完全自給自足，不關聯任何外部資料夾；(2) 確認 design-system.md/.html 照 skill（project-ui-creator）規則製作，缺的全補。

- **自給自足** — 全 R 2.1 .md/.html 的跨資料夾連結（`../_shared/component-inventory.md` ×144、`../../../../Design/`、`../../integrated/`、`.claude/memory/`、`../R 2.0/` 等）**全部去連結化**（保留文字、去掉 `../` 耦合）。runtime 早已 0 外部（CSS/JS/fonts/images 都在 R 2.1 內，fonts.css 的 `../fonts/` 指向 R2.1/fonts/）。footer credit 改自指。`requirements-map.md` 改指本地 SPEC.md。
- **skill 合規小補** — Identity 補 **Locales** 行；Quick Reference 補 Icon system / Theme / WCAG target=2.2 AA / WCAG estimated + Assumptions/Open-questions；新增 **Implementation Notes** 區；§5.3 WCAG 從 2.1 標到 **2.2 AA**。補抓一處 §4.6 漏網 上游來源系統（Visibility/Position/Sentiment）。
- **§4 元件全部升 11 欄規格卡** — `design-system.md` 把 §4.2 起 20 個段（含 gap 4.11–4.14、缺 Input/Table/Composer）**重編號為 4.2–4.24（23 個，依 atom→molecule→organism）**，每個元件補滿 skill 要求的 11 欄：anatomy / `_layer` / variants / sizes / states table / Class API（CSS-only，Props/API=N/A）/ token usage（引用 Role）/ usage / Do&Don't / a11y / code example。內容對齊各 `ds-components/*.css` 真實 class/state/token（4 個 subagent 平行讀 CSS 撰寫）。修內部交叉引用（§4.11→§4.12、§4.18→§4.24）；`component-library.md` Spec 欄重對齊新號碼。
- **design-system.html 從乾淨 .md 重生** — 舊 .html（4589 行）上游來源系統/marketing 殘留太深（marketing/app 雙面框架、pricing 段、參考型錄），整份重寫成 **1951 行的乾淨視覺化**：載入真實 `ds-components/*.css` + theme.js + icons.js → 元件 demo 真實 render；scrollspy 側欄 TOC；dark-mode 切換鈕；7 支柱 + 23 個 11 欄元件卡（含 live demo）+ Pattern 卡表 + Voice/A11y/States/Dataviz + Pillar 6 + Appendix A/B + Implementation Notes 全 inline；0 外部連結、0 上游來源系統。Playwright 驗證 render 正常、0 console error。
- **未動**：`ds-components/*.css` + 所有產品頁（純文件 + 視覺化，出貨 UI 不變）。

---

## 2026-06-01 · design-system.html 設計師化：全文中英切換 + 全視覺化 + 上游來源品牌字眼歸零

> 背景：使用者是設計師，反映文件「太多文字／代碼看不懂」，要 ① 中英切換 ② 每個概念都有視覺渲染；並要求 **上游來源品牌名完全不出現在專案**（從該上游爬來的 DS 內容可留用，只是不留品牌名），且專案各檔保持自給自足。

### A. 規格／功能導入
- **全文中英（zh-Hant / en）切換** — `design-system.html` 加語言切換：`<html data-lang>` + 純 CSS 顯隱（`html[data-lang="zh"] [data-en]{display:none}` 反之亦然），側欄按鈕切換、`localStorage["ztor.ds.lang"]` 記憶、head inline script 防閃爍。每段可讀英文都配一個 `data-zh` 雙生元素：**1261 對 data-en/data-zh**，Playwright 驗證 en 模式 1255 可見英文／0 中文、zh 模式相反、零孤兒。翻譯由 6 個 subagent 平行處理（依 atom/molecule/organism/pillar 切片），TOC 18 連結 + 8 群組也雙語。code identifier（token、selector、hex、`ds-components/*.css` 檔名、JSON）一律留原文。
- **每個概念都有視覺渲染** — 補 11 個視覺示意：Foundation 字體 specimen／間距 scale bar／圓角方塊／陰影方塊／動效 easing 曲線／icon grid；Pillar 3 Mode light/dark 並排；Pillar 5 Pattern 5 個版面 wireframe；A11y 對比色塊；Voice 真實 microcopy（alert/金額狀態）；Pillar 6 五個 page-template wireframe。全用 token 驅動、跟 demo 同一套 class。

### C. 撤除／收納
- **48→25 個 `<pre class="code">` 收進 `<details class="code-fold">` 摺疊**（預設關閉、「程式碼範例 — 給工程師」可展開），文件預設只剩設計師看得懂的圖與字；`anatomy` 結構樹保留（緊貼 demo 當註解）。

### D. infra / 清理
- **上游來源品牌字眼全專案歸零** — chart.css 2 條註解、design-system.md changelog 2 行、UI-CHANGES.md 33 處歷史紀錄全改中性詞（「上游來源系統 / source-style」）。全 R 2.1 該字眼 = 0。DS 內容本身保留續用。
- **icons.js 補 `banknote` + `paperclip`** 兩個 registry 缺漏 icon（原本 composer/data-list demo 渲染不出來）；`design-system.html` 的 `icons.js?v=2` 加 cache-bust。
- **驗證**：單頁 2593 行 / 269 KB（本機秒開，維持單頁、不拆）；0 console error / 0 warning / 0 未解析 icon / 0 殘留品牌字眼 / 0 外部 `../` 連結；section/table/details 標籤平衡；live demo 與 `ds-components/*.css` byte 不變。截圖見 `screenshots/ds-viz-*` 與 `ds-i18n-zh-*`。

---

## 2026-06-01 · design-system.html 設計師化 round 2：色塊預覽 + 跑版修復 + sizes/states 視覺

> 使用者（設計師）回饋:純文字/代碼的色值看不出實際顏色、Button 的 sizes/states 只有文字、Layer 標籤跑版。

### A. 規格／功能導入
- **色值一律配色塊** — 新增 `.ck` inline 色票（13px 圓角小方塊 + hairline）。Pillar 3 Mode 表（light + dark override 每個 hex/rgba）、Pillar 2 Role 表（Light value + status green/red/blue/yellow）、Quick Reference 顏色列全部在色值前加實際色塊預覽，共 30 顆。設計師不必讀 hex 就知道是什麼顏色。
- **Button sizes / states 視覺化** — §4.2 在「Sizes」欄後加實際 sm/default/lg 三顆按鈕對照；「States」表後加 default / :hover / :focus-visible（顯示 ring）/ :disabled / outline / ghost 六種狀態的實體按鈕（hover、focus 用 inline style 模擬靜態呈現）。新增 `.state-cell`（按鈕下掛 mono 小標）。

### D. infra / 修復
- **修 4.0 Classification 的 `.layer` 標籤跑版** — `.layer` 加 `white-space: nowrap`,emoji + 文字（🟢 atom 等）不再掉到第二行。
- **稽核結論**:其餘元件卡（Badge/Input/Switch/Dot…）的 live demo 本來就已呈現各 variant/state（Input 已含 error/disabled/sm、Badge 5 狀態、Dot 5 色），無需再補。整份 `design-system.html` chrome 已全 token 驅動（body/字型/border/surface 皆 `var(--…)`）；唯一的硬編色都是「示意色票」（light/dark 對照、對比色塊、code 區塊底）——本就該固定,非違規。
- **驗證**:Playwright 0 error / 0 warning / 0 未解 icon;2609 行;0 殘留品牌字眼;0 外部連結。截圖 `screenshots/ds-fix-*`。

---

## 2026-06-01 · design-system.html 設計師化 round 3：所有元件 demo 對齊真實頁面 + 全卡 sizes/states 視覺

> 使用者（設計師）指出:Button 之後的卡 sizes/states 只有文字、switch 與 header 的 demo 壞掉/和 index.html 長得不同。要求以「實際 UI 頁面 + ds-components CSS」為準,完整逐卡修。

### D. 修復（demo markup 對齊真實頁面/CSS）
以 6 個 subagent 平行,逐元件比對 `ds-components/*.css` + 產品頁（index/earnings/settings/… 所有 *.html）真實用法,修正 demo:
- **switch**:`<button class="switch" role="switch">` → 真實的 `<div class="switch">` / `<div class="switch switch--on">`（產品頁確認）。原本 button 預設樣式蓋掉 pill,所以壞掉。
- **header**:原 demo 用了沒被本檔載入的 class、渲染成裸按鈕。改用 header.css 真正定義的 `.ztor-header__inner/__brand/__brand-mark/__nav/__actions/.ztor-burger`,渲染成乾淨 80px topbar。（註:產品頁 topbar 其實是 sidebar.js 注入的 `.app-topbar`(shared.css),與 DS canonical `.ztor-header` 是兩套——見「已知缺口」。）
- **alert**:icon 改成產品實際用的 filled glyph（alert-triangle-fill / info-fill…）。
- **empty-stub**:`__title` 改 `<div>`、refs 改用 `.badge`+`.badge__dot`（對齊 projects/e-shop 等頁）。
- **selection-card**:slot 改 `<span>`（對齊 create-project/settings）。
- **chart**:補上第四個子型 `.rank-bars`(原本 anatomy/Class API 有列、demo 沒畫);stacked-bar seg 改 `<div>` 對齊 fans-crm。
- 其餘（badge/dot/chip/stickynote/input/nav/card/kpi/accordion/tabs/cookie/composer/footer/data-list/table/bento）逐一驗證 class 與真實頁/CSS 相符。

### A. 規格／功能導入（全卡 sizes/states 視覺化）
比照 Button gold-standard（`.state-cell` + mono `<small>` caption），凡有 size/state modifier 的卡都補實體渲染列:
- **Sizes**:input（sm/default/lg）。
- **States/variants**:chip（default/active）、switch（off/on）、input（default/focus/error/disabled）、alert（success/info/warning/error）、badge（6 變體）、dot（5 色）、selection-card（default/active）、composer（idle/active/disabled send）。
- 單一尺寸/狀態且 demo 已完整呈現的組件（card/kpi/accordion/tabs/cookie/empty/nav/stickynote/footer/data-list/table/chart/bento）不硬加——主 demo 即視覺。

### 驗證
Playwright:0 console error / 0 warning / 0 未解析 icon;掃描所有 `.demo` 無零高度(無壞 demo);data-en/data-zh 1261 對完整保留;section/table/details/div 標籤平衡;40 個 state-cell;0 殘留品牌字眼 / 0 外部連結。截圖 `screenshots/ds-fix2-*`。

---

## 2026-06-01 · Header 收斂:真實 .app-topbar promote 進元件庫當 single source

> 決策(使用者):產品頁(index.html)的 topbar 是對的,照它改;改好以後以 design system 為標準(對齊 project-ui-creator skill「pages consume the library / promote app header into the library / 所有頁面 + preview 共用同一份 component CSS」)。

### D. 架構收斂
- **真實 topbar = `.app-topbar`**(原在 `shared.css` 52+ 行 + `sidebar.js` 注入),DS 原本的 `.ztor-header` 是死的(無產品頁使用)。把整個 `.app-topbar*` 區塊(主區塊 + responsive)**搬進 `ds-components/header.css` 當 canonical**,刪掉 `.ztor-header`。
- **`shared.css` 頂部 `@import url("ds-components/header.css")`** → 14 個產品頁(全載 shared.css)免逐頁改 link 就拿到同一份 header;`design-system.html` 直接 link header.css。**單一來源、零重複。**
- 全頁 `shared.css` cache 版本 bump `?v=20260601a`(內容已變)。

### A. 文件對齊(SSOT)
- `design-system.md` §4.19 + `design-system.html` Header card **重寫成真實 .app-topbar**(11 欄):logo SVG + sliding highlight pill + mega-dropdown groups + actions cluster(theme/search/lang/notif+badge-dot/avatar);尺寸 80px→**64px sticky**;inventory 列同步。`component-library.md` 標籤改 app topbar。

### 驗證
- **產品頁不變**:index.html topbar 搬移前後截圖一致(`ds-header-index-before/after.png`);earnings.html(僅靠 @import 拿 header)topbar 正常 render(64px sticky)。
- **文件**:Header demo 現在 render 真實 ztor topbar(`ds-header-doc-apptopbar.png`),0 未解 icon、favicon 以外 0 console error。
- badge--warning 經查為 `ztor-badge--warning` 子字串誤判,無裸 `.badge--warning`,不動。
- 已知缺口的「Header 兩套」項 → 已解決。

---

## 2026-06-01 · design-system.html 顯示模式切換 + 內容寬 1440;寫進兩個 skill

### A. 規格／功能導入
- **內容欄寬 1000 → 1440**(`.doc-main { max-width: var(--doc-maxw, 1440px) }`)。
- **左側面板加「顯示模式」切換鈕**(主題/語言那塊下方):**Fixed**(固定寬,預設 1440,附可輸入寬度欄 320–2560px)/ **RWD**(流式 `--doc-maxw:none`,內容隨視窗重排)。模式 + 寬度存 `localStorage`(`ztor.ds.docmode` / `ztor.ds.docwidth`),`<head>` 內聯腳本先套用避免閃爍。Playwright 驗證:預設 1440px、切 RWD→none、輸入 1200→1200px。

### D. infra(寫進 skill,未來專案自動帶)
- **project-ui-creator**:`references/design-system-requirements.md` 加「HTML preview 外殼規格」段(1440 預設 + 顯示模式切換)+ Final Checklist 一項。
- **design-system-analyzer**:`references/design-system-template.html` 直接內建(doc-maxw 1440 + 顯示模式控制 + script;layout 解除 1400 上限)+ `SKILL.md` 輸出說明與 checklist 各補一條。

---

## 2026-06-01 · 元件組成關係視覺化(atom↔molecule↔organism 看得出上下層)

> 使用者:每個元件有 layer 標記,但看不出 organism 由哪些 molecule/atom 組成(anatomy 是 CSS class 樹,設計師讀不懂)。要能看出上下層。

### A. 規格／功能導入
- **每張卡加「組成 ↓ / 被用於 ↑」彩色 chips**(可點跳轉):molecule/organism 顯示「組成」由哪些下層元件構成(或標 self-contained);atom/molecule 顯示「被用於」哪些上層。chip 依 layer 上色點(atom 綠 / molecule 黃 / organism 藍)。
- **4.0 Classification 加總覽組成圖**:三層巢狀 — Organisms→molecules·atoms、Molecules→atoms、Atoms(末端),一眼看全貌。
- **初擬組成對照**(待使用者校正):Card→Button;Alert→Button;Cookie→Button;Empty→Button·Badge;Selection card→Badge;Composer→Input·Button;Header→NavigationMenu·Button·Input·Status dot;Chart→Card·Button;Bento→Card·KPI;NavigationMenu/KPI/Accordion/Tabs/Footer/Data list/Table = self-contained。
- **依 layer 分組呈現**(2026-06-01 細修):「組成 ↓」拆成 🟢 atom / 🟡 molecule 兩排;「被用於 ↑」拆成 🟡 molecule / 🔵 organism 兩排——層級一目了然。tier 標籤帶 layer 色點,chips 可點。
- 雙語、71 個 compose-chip;Playwright 0 未解 icon、總覽 17 列。
- **規則寫進兩個 skill**:project-ui-creator `design-system-requirements.md`(規格卡必含 composition + 4.0 總覽圖 + checklist)、design-system-analyzer `SKILL.md`(輸出說明 + checklist)。

---

## 2026-06-01 · 元件卡整合重構(去重複、設計師優先、可視矩陣)

> 使用者:一張卡塞太多、Variants 文字看不懂、anatomy 框沒必要、States 表＋圖重複、Class API／Token／Usage 該整併。要一套一致的分類整合法,大元件別被矩陣框影響。

### A. 卡片版面整合(全 23 張)
新順序:**標題+`_layer` → 一句說明(吸收 Usage) → 組成/被用於 chips → 實體渲染 → Do&Don't → 無障礙 → 單一「給工程師」摺疊**。
- **刪** anatomy ASCII 框;**刪** 純文字 Variants/Sizes/States 段;Usage 併進說明。
- **Class API + Token 使用 + States 表 + Code + CSS 路徑** 全收進一個 `<details>`「給工程師」摺疊(設計師預設看不到 class/代碼串)。
- **組成 chips 斷行**(`.compose` 改 block):組成↓/atom/molecule、被用於↑/molecule/organism 各自一行。

### A. 實體渲染(依元件選版型)
- **size × state 矩陣**(每 style 一張,chrome 最小化:無底色/無直線/淡列分隔)— Button(3 style ×3 size×4 state)、Input(3×4)。
- **變體列** — Badge/Dot/Chip/Switch 等多變體小 atom(主 demo 即showcase)。
- **乾淨單一 demo** — molecule/organism(Card/Alert/Chart/Header…),不框進格子避免與元件 surface 打架。Alert 補回 4 狀態(warning/info/success/error)。

### D. infra
- 6 個 subagent 平行重構;雙語 1120 對完整、section/table/details/div 標籤平衡、0 anatomy、0 未解 icon、0 console error。
- QA 收尾:全 23 卡結構稽核通過;修 Input 主 demo 與矩陣重複(主 demo 收斂成 input+textarea,矩陣負責 size×state);最終 1118 對雙語、EN/ZH 切換零孤兒、0 外部連結、0 console error。
- **規則寫進兩個 skill**:ui-creator `design-system-requirements.md`(規格卡版面整合 + checklist)、analyzer `SKILL.md`(輸出說明)。

---

## 2026-06-01 · 每張卡都把狀態/變體實體畫出來(分級渲染)

> 使用者抽查:Header 應該要有各種操作下的狀態、Switch/Chip「沒有狀態」、Input 矩陣上面還有一個重複的。要求逐卡檢查先找原因再修。

### 病因
上一輪只有「尺寸×狀態」兩軸的 Button/Input 做了渲染矩陣;其餘元件的狀態被搬進「給工程師」摺疊的**文字表**,沒有渲染成可看的色塊。所以多數卡只剩一個 happy-path demo,狀態藏在文字裡。

### A. 分級渲染(全 23 卡一致)
每張卡都加一個帶標題的渲染區,依元件真實軸數選版型:
- **兩軸 → size×state 矩陣**:Button、Input(維持)。
- **單軸(只有互動狀態)→ 標籤化 state 藝廊**(`.state-cell` 逐格 + selector 小字):Chip(default/:hover/active/static)、Switch(off/on)、Tabs(item 4 態)、Accordion(trigger default/hover/focus/open)、Card(clickable 3 態)、NavigationMenu(trigger 3 態)、Header(nav default/:hover/current/group-open)、Table(row default/hover + check/cross/partial)。pseudo 態用 inline style 強制畫出。
- **只有變體 → 變體藝廊**,標題注明「display-only / static」:Badge、Status dot、Alert(status×density)、KPI(delta 正負)、Data list(列變體)。
- **本質無狀態 → 單一 demo + 標「Single state (no interactive states)」**:Sticky-note、Cookie、Empty、Footer、Chart、Bento。

### C. 撤除
- **Input**:拿掉主 demo 重複的單行 `<input>`(矩陣已涵蓋 size×state),只留 `.ztor-textarea`(矩陣未涵蓋的多行)。

### D. infra
- 雙語 1138 對(EN=ZH,切換零孤兒)、0 未解 icon、0 外部連結、0 console error(僅 favicon 404)、0 peec;34 個 state-cell、4 個矩陣。Playwright 截圖驗 Chip/Header/Accordion 渲染正確(`screenshots/ds-states-*.png`)。
- **規則寫進兩個 skill**:ui-creator `design-system-requirements.md`(rendering 點 4 改成四級分類 + checklist 新增一條)、analyzer `SKILL.md`(整合版面句加四級分類,指向 §T4)。

---

## 2026-06-01 · 全元件對 CSS 稽核:組成照實 + 渲染補完整

> 使用者抽查再點出 Tabs/Alert/Composer 問題,且「沒辦法一個一個對」,要求找病根 + 全元件重核。

### 病根
這些卡當初**靠視覺相似度猜「組成」,沒對 CSS 核**。三種錯反覆:① 組成 chips 寫了元件其實沒用的 atom;② 兩軸元件(密度×狀態)畫成混在一起的單排還畫不全;③ CSS 有定義的變體/狀態沒渲染。用 5 個平行 subagent 對著 `ds-components/*.css`(ground truth)全核 23 個元件。

### C. 撤除(組成造假 → 照實)
對 CSS 核出 7 處假組成,改 self-contained 並加註自捲了什麼:
- **Composer** 去 Input+Button(自捲 `__drop`/`__textarea`/`__send`)
- **Header** 去 Button+Input+Status dot+NavigationMenu(自捲 `.app-topbar__*`)
- **Card** 去 Button(用自己的 `.card__link`)
- **Alert** 去 Button(CTA 是 `.alert__cta`)
- **Empty stub** 去 Button(根本沒按鈕;Badge 留,真的)
- **Selection card** 去 Badge(是 `.selection-card__tag`)
- **Chart** 去 Button(自捲 `.chart-card__icon-btn`/`segmented`;Card 留,真的)
- 連帶更新「被用於 ↑」:Button 只剩 Cookie banner 真嵌入;Input/Status dot/NavigationMenu 改「直接用於頁面,未被嵌入」;§4.0 總覽圖重建,只剩 Cookie→Button、Empty→Badge、Chart→Card、Bento→Card/KPI 四條真邊。攤出「這套 DS 多數控件自捲、沒共用 atom」這個系統缺口。

### A. 補渲染(CSS 有、卡上沒畫)
- **Alert**:密度(card/row)× 狀態(warning/error/success/info)= 8 格全畫,分成兩組乾淨的密度 gallery(不再混一排)。
- **Card**:補 `.ztor-card` / `--muted` / `--frame` / `__meta` 區塊變體。
- **Selection card**:補 settings 在用的 swatch 主題選擇器(`.selection-grid--3` + `__swatch--theme-*`)。
- **KPI**:補 `.kpi__meta` 中性註腳。
- **Chart**:Class API 補 `.barchart`/`__bar` 與 `.chart-tip`/`.chart-cursor`;「四個子型」→五個。
- **Button**:`:active` 補一行說明(矩陣不加第 5 欄)。
- **Badge**:三個子元件(`.badge`/`.ztor-badge`/`.ztor-metric-pill`)拆成三個帶標題的 gallery,標出命名空間變體不對稱。
- **Chip**:補 compose 區塊。

### D. infra
- 雙語 1169 對(EN=ZH)、0 未解 icon、0 外連、0 斷錨、0 console error、0 peec。Playwright 截圖驗 Alert/Selection-card。
- **規則寫進兩個 skill**:組成必須對 CSS 核(不准猜)+ 自捲標 self-contained + 雙向 chips 一致 + CSS 每個變體/狀態都要畫、兩軸畫滿。

---

## 2026-06-01 · 矩陣化:每個元件都用 `.matrix` 表整理(預設呈現法)

> 使用者:Tab 應該矩陣、所有有變體的元件都要矩陣、預設就是矩陣;全部改、缺的補。把「分級渲染」改成「矩陣為預設」。

統一慣例:**列=變體(style/size/status/density/命名空間),欄=狀態(default/:hover/active/:focus/:disabled/open)**,pseudo/modifier 狀態 inline 強制畫,所有組合畫滿。把先前散落的 `.state-cell` 藝廊全部轉成 `.matrix` 表(4 張 → 22 張):
- **Atoms**:Badge(status × 命名空間,攤出 .badge 無 warning、.ztor-badge 無 yellow/neutral 的不對稱)、Dot(色彩欄)、Chip(狀態欄)、Switch(off/on)、Input 補 :hover 欄。
- **Molecules**:Nav-trigger、Card(變體 × 狀態 3×3)、KPI(變體欄)、**Alert(status 4 列 × density 2 欄)**、Accordion(trigger 狀態)、**Tabs(plain/+count × 4 狀態)**、Selection-card(form × 狀態)、Composer(send 狀態)。
- **Organisms**:Header(nav item 狀態)、Data list(icon hook 欄 + amount 欄)、Table(row 狀態 + status cells)、Chart(segmented 狀態)。
- 無變體無狀態維持單一 demo:Sticky-note/Cookie/Empty/Footer/Bento。
- 規則寫進兩個 skill(矩陣為預設呈現法)。驗證:22 矩陣、0 state-cell、雙語 1169 對、0 未解 icon、0 外連、0 斷錨。

---

## 2026-06-01 · 控件收進 Button atom,各元件真正 reuse(動到產品頁 + sidebar.js)

> 使用者:Composer 的送出鈕/icon 鈕應該建進 Button 元件庫再被 Composer 調用,不是原地寫死;所有元件都該這樣,全查全修。Header 也是。

病根:Button atom 當初**沒有「icon 鈕 / 圓形送出鈕」變體**,於是 Composer/Header/Alert/Chart 各自捲一顆 `__send`/`__icon-btn`/`__close`。

### A. Button atom 新增變體(`button.css`)
- `.btn--icon`(+ `--sm` 32 / `--xs` 28)— 純 icon 方鈕(ghost)
- `.btn--icon-circle`(+ `.is-active`)— 圓形送出鈕,有內容翻黃
- (文字連結:card head link / alert CTA / cookie settings 各自情境專屬、長得不同,**刻意不強推**共用 atom,避免回歸)

### A. 各元件改成 reuse(只留布局 hook,look 來自 atom)
- **Composer**:`__send` → `.btn .btn--icon-circle`(+`.is-active`);`__icon-btn` → `.btn .btn--icon btn--sm`。composer.css 砍掉自捲 look。
- **Header**:`app-topbar__icon-btn` → `+ .btn .btn--icon`;header.css 該 class 只留 `position:relative`(badge dot 定位)。改 **sidebar.js**(runtime 注入)才全站生效。
- **Alert**:`alert__close` → `+ .btn .btn--icon btn--xs`;alert.css 只留 grid 定位 + 20px chevron。
- **Chart**:`chart-card__icon-btn` → `+ .btn .btn--icon btn--xs`;chart.css 只留 border hook。
- 組成關係更新:Composer/Header/Alert/Chart 現在 chip 真的掛 Button;§4.0 圖 + Button「被用於」同步;Button 卡新增 icon/circle 變體矩陣。

### D. infra
- **產品頁同步**:index(alert close + chart)、earnings(chart)等真實頁 markup 一起改。
- **cache-bust**:button/alert/chart/composer/header/shared.css + sidebar.js 全部 bump `?v=20260601c`(17 檔)。**這是先前一直「看起來沒改」的元兇 —— CSS/JS 連結沒帶版本,瀏覽器吃舊快取。**
- 驗證(fresh load):design-system + index + earnings,所有 icon/送出鈕尺寸正確(36/32/28)、0 console error、雙語 1174 對、24 矩陣、0 未解 icon、0 斷錨。
- 規則寫進 skill:控件一律 reuse atom 變體,molecule/organism 只留布局 hook;產品頁 + 注入 JS 一起改。

---

## 2026-06-01 · 抽查再修 + 整併兩套 nav 下拉

> 使用者抽查:Composer 圓鈕狀態矩陣多餘、Input 多行沒併進矩陣、Tabs 面板占位文字看不懂、Data list 規格被做成「icon 變體」但它其實是列表、NavigationMenu 與 Header nav 是兩套平行下拉。

### 小修(4)
- **Composer**:移除送出鈕狀態矩陣(已是 `.btn--icon-circle`,歸 §4.2),改一句指回 → 通則:reuse 了 atom 就別重畫 atom 狀態。
- **Input**:`.ztor-textarea` 併進矩陣多一個 row(不再獨立 demo)。
- **Tabs**:tab-panel 占位文字改成「隨 active tab 切換」的清楚說明。
- **Data list**:改以「列表/列」為主,描述每列變體(amount +/-、icon hook 單色、最後一列無分隔),不再用 icon 矩陣當焦點。

### 整併兩套 nav 下拉(§4.9)
病根:`.ztor-nav-*`(NavigationMenu mega-dropdown,只用在 legacy sample.html)與 `.app-topbar__*`(出貨 topbar nav+dropdown)是兩套平行實作。
- canonical = 出貨的 `.app-topbar__*`。**§4.9 重寫**成 canonical nav:in-context(群組 trigger + mega-dropdown)+ **nav item 變體×狀態矩陣**(link 無下拉 / group 有下拉 ▾ × default/hover/active)。
- **Header 組成**:加 NavigationMenu(molecule);Header 的 nav 狀態不再自畫,指回 §4.9(reuse 原則)。
- **sample.html**:`.ztor-nav-*` markup 遷成 `.app-topbar__*`。
- **navigation-menu.css**:退役(tombstone 註解);design-system.html / sample.html 的 link 移除;inventory + component-library.md + design-system.md 改指 header.css。
- 驗證:design-system fresh load 0 `.ztor-nav-*`、§4.9 dropdown 正常渲染、雙語 1171 對、0 未解 icon、0 斷錨、0 console error。

---

## 2026-06-02 · Icon 升正式 atom + nav/Card 矩陣再收斂

> 使用者抽查:§4.9 NavigationMenu「在情境」demo 與矩陣拆兩塊、group trigger「IP Bank」斷行;§4.10 Card 兩個 demo 看不出關係;Alert 組成漏了狀態圖示這顆 atom;許多描述段落卡在 ~746px 沒填滿容器。

### A. Spec-derived

- **Icon 升成正式 atom(§4.9)** — 原本 lucide 字符只當 Foundation「Iconography」,沒進元件名冊。現在補一張完整 Icon atom 卡:size 矩陣(outline / filled × 16px·14px·`--sm` / 18px·`.btn--icon` 情境)+ 完整 51-glyph registry gallery(對著 `icons.js` 真實名單產出)+ Do/Don't + a11y + class API。動機:它是其他所有元件 reuse 的單一 primitive,該被當 atom 顯式記錄(比照 Button reuse 原則)。
- **所有用 icon 的元件「組成」補 → Icon** — 對 `data-lucide`(排除 doc chrome 的 file-text summary)逐 section 稽核,只給「自己 markup/CSS 真的渲染字符」的 8 個元件補:Button · Badge · NavigationMenu · Alert · Composer · Header · Data list · Chart;Accordion/Tabs/Card/Selection 的 chevron 是 CSS 畫的、**不**算組成。§4.0 圖譜同步(新增「Atoms → Icon」層 + Icon 為終端 leaf)、§4.1 inventory 補 Icon 列、TOC 補 Icon。
- **§4.9→4.24 全部 +1**(NavigationMenu→4.10 … Bento→4.25),Icon 佔回 §4.9;prose `§4.23`→`§4.24`(Chart 引用)同步。

### B. 反饋導入

- **§4.10(原 4.9)NavigationMenu 併矩陣** — 移除獨立的「在情境」demo,改在 nav item 變體×狀態矩陣多一個 `open` 欄:group 列的 `open` 直接展開 mega-dropdown(在情境=矩陣的一格)。欄改為 default / :hover / current / open。
- **§4.11(原 4.10)Card 併成單一矩陣** — `.card`(帶標題區段外框,非互動)與 `.ztor-card` / `--muted` / `--frame` 併進同一矩陣(命名空間×可點狀態);`.card` 列的 hover/focus 留「—(非互動)」。一眼看出兩命名空間同族、共用一套 surface/shadow/radius。
- **描述段落填滿容器** — `.sub__desc` / `.field-text` 的 `max-width` 由 72/74ch 改 `none`,描述不再卡 ~746px。

### D. infra

- **`.app-topbar__link` 加 `white-space: nowrap`**(header.css)— canonical 修法,nav 標籤在窄格(及產品頁)都不斷行;`header.css?v=` bump 到 `20260602a`(design-system / shared / index / sample)。
- 驗證(Playwright fresh load):Icon 卡 51 gallery + 58 SVG 注入、nav trigger `nowrap` 高 36px 不斷行、open 欄含展開面板、Card 矩陣 4 列、編號 4.9 Icon→4.10 Nav→4.25 Bento、`.sub__desc` computed `max-width:none`、實質 0 console error(僅 favicon 404)。截圖存 `screenshots/verify-{icon,nav,card}-card.png`。

---

## 2026-06-02 · Focus ring 改黃(`--ring` = primary)

### B. 反饋導入

- **focus ring 由近黑改黃** — `_tokens.css` 淺色模式 `--ring` 由 `#171717` 改 `var(--primary)`(#FFDB29);全站所有 focus 框(input / textarea / 卡片 / 按鈕 / switch)一起變黃,單一 token 驅動。深色模式維持 `#FDFDFD`(本來就不是黑)。`_tokens.css` 首次加 cache-bust `?v=20260602a`(15 頁)。
- **文件誠實同步**:design-system.md(5 處)+ design-system.html(4 處:swatch / Role 表 / dark 對照 / a11y 對比表)+ `_tokens.css` 註解,原本都記「ring=#171717,因黃色過不了 AA」,改成新值並標明取捨。
- **⚠️ a11y 取捨(使用者明確要求,已接受)**:黃 `#FFDB29` 疊在淺米白畫布上對比僅 ~1.3:1,**低於 WCAG AA 對 UI 元件的 3:1**。原設計刻意用近黑就是為了過 AA;改黃後淺色模式 focus 可見度下降。深色模式不受影響。若日後要兼顧品牌黃與 AA,做法是「黃 ring + 外圈一道深色細邊」雙層。驗證:design-system fresh load `--ring` resolved `rgb(255,219,41)`。

---

## 2026-06-02 · Switch on 旋鈕改白

### B. 反饋導入

- **Switch on 態旋鈕改白** — `switch.css` 的 `.switch--on::after` 由 `var(--primary-foreground)`(近黑)改 `var(--surface)`(=off 旋鈕同色,淺色模式白);黃軌道上旋鈕變白,且 on/off 旋鈕同色、只軌道變色。改 canonical 一處 → 全站 6 頁(Settings / E-Shop / My IP / create-project / ip-detail / design-system)一起套用,無自捲 toggle。`switch.css` 首次加 cache-bust `?v=20260602a`(6 個 link)。驗證:design-system Switch 矩陣 on 旋鈕 computed `rgb(255,255,255)`、軌道 `rgb(255,219,41)`。

---

## 2026-06-02 · 移除無障礙規則 + 視覺補償回原樣

> 使用者要求:把無障礙(a11y)規則先全部拿掉、把為 a11y 妥協的視覺設定回復成品牌原樣;skill 把 a11y 設 opt-in。範圍限 ztor R 2.1。狀態驅動的 `aria-*`(`aria-expanded`/`aria-current`/`aria-invalid`…)與 reduced-motion、markup 的輔助 aria/role **保留**(使用者選中間檔)。

### C. 撤除（intentional removal）

- **視覺補償回原樣(品牌原色,不再為 AA 妥協)**:
  - 黃底**補償細邊** `box-shadow: 0 0 0 1px rgba(23,23,23,0.12)` 全移除 — button(`.ztor-btn` / `.btn--primary` 留柔陰影 / `.btn--icon-circle`)、`.badge--yellow`、`.switch--on`、stickynote、empty-stub icon、`.selection-card--active`(留 2px primary ring,去 3px 細邊)。黃色表面改回純色邊界。
  - alert **CTA 加深色回原**:`.alert--warning/--success .alert__cta` 由 `color-mix(<token>, 深色)` 改回 `var(--status-warning/-success)`。
  - (focus ring 早一輪已由近黑改黃 `--ring=var(--primary)`,同屬此方向。)
- **文件 a11y 規則整批移除**(design-system.html + design-system.md):
  - 每張元件卡的 **Accessibility 小節 ×24**;**§5.3 Accessibility** 整節(含 contrast-ratio 表);Quick Reference 的 **WCAG target / estimated** 兩列;Do/Don't 裡明確 a11y 條目(color alone / pair with label / focus-visible / keyboard / aria-as-a11y);ring token 註的 AA 旁白。
  - **Pillar 5 補號**:移除 §5.3 後,States/Data viz/Workflow 各 −1(html→5.3/5.4;md→5.3/5.4/5.5);JSON skeleton + changelog 的 §ref 同步。

### D. infra

- 全頁 `ds-components/*.css` cache-bust 統一 bump 到 `?v=20260602b`。
- 驗證(Playwright fresh load):primary 按鈕 box-shadow 只剩 `0 1px 2px rgba(0,0,0,.05)`(無細邊);`.switch--on` 只剩基本 `1px var(--border)`;頁面 Accessibility field-label 0、`#a11y` 區段不存在、WCAG 出現 0 次;Pillar 5 編號 5.1–5.4 無斷號;實質 0 console error。

### 保留(未動)

- 狀態驅動 `aria-*`(`[aria-expanded]` 驅動 chevron/下拉、`[aria-current]` nav 高亮、`[aria-invalid]` input 錯誤、`[aria-selected]` tab)、`role=` 語意、`prefers-reduced-motion`、純設計性的 contrast 描述(footer 高對比 slab、hero veil)。

> **註(取捨)**:此舉降低無障礙合規度(尤其黃色 focus ring 與黃底邊界在淺色畫布 ~1.3:1,低於 WCAG 3:1)。為使用者明確指示、已接受。日後要復原,git 還原本批 commit 即可。

### skill 同步

- `project-ui-creator/references/design-system-requirements.md` + `design-system-analyzer/SKILL.md`:新增「**Accessibility = opt-in(預設不做)**」區塊 — 動工/Stage 0 先問「要不要做無障礙?」,要才產出 WCAG/對比/§5.3/各卡 a11y 註/focus-visible/reduced-motion/aria-landmark/視覺補償;狀態驅動 aria 不受影響。

---

## 2026-06-02 · Lucide 全套進 system + icon stroke 1.2

### A. Spec-derived

- **完整 Lucide 套件納入 system** — 自 lucide-static `icon-nodes.json` 生成 `icons-all.js`(**1,713 個** icon,357 KB)。`icons.js` 加一段「可選合併」:若頁面載了 `window.ZTOR_ICONS_ALL` 就把缺的併進 registry(只補不覆寫,保留手寫的 alias 與自訂 `-fill`)。**只有 design-system.html 載 icons-all.js**(全覽);**產品頁照舊只載精簡 `icons.js`**,runtime 不變重。
- **§4.9 Icon 卡改成「使用中 / 未使用」全覽**:「使用中 **38**」= 掃全站 markup(產品頁＋sidebar.js＋DS 元件 demo,排除 icon 卡自己的 gallery)實際 `data-lucide` 渲染到的;「未使用 **1,683**」= 其餘 Lucide,收進 `<details>` 可展開瀏覽。用既有 `.icon-grid`/`.icon-cell` 呈現。
- **icon stroke 統一 1.2**:`icons.js` buildSvg 預設 `stroke-width` 2→1.2(全 Lucide 一次到位)+ `.ztor-icon` 三個 CSS 覆寫(`.btn--icon` 1.75 / `.btn--icon-circle` 2 / `.alert__icon` 2.25 → 1.2);Iconography 文件描述同步(1.5–2px → 1.2px)。chevron 類手繪 SVG 不在 icon 集範圍,未動。

### D. infra

- 修 §4.10 下拉(及任何裸 icon)爆大:design-system.html 無載 shared.css、缺 base `.ztor-icon` 尺寸 → 補全域 base `.ztor-icon{16px}`/`--sm{14px}` 進文件 `<style>`(情境選擇器仍覆寫)。
- icons.js/icons-all.js cache-bust `?v=20260602d`;ds-components css `?v=20260602c`。
- 驗證(Playwright fresh load):icon 卡渲染 1,729 個 svg(使用 38 + 未使用 1,683 + 矩陣等)、0 未渲染 placeholder、**0 console warning/error**、stroke 1.2、下拉 glyph 14px。

---

## 2026-06-02 · Chart hover 資料點放大

### B. 反饋導入

- **`.chart-cursor__dot` 從 9px → 13px**(`chart.css`):原本 9px 直徑扣掉 2px 白邊只剩約 5px 黃核,在 2px 粗折線 + 黃色面積上幾乎看不出。改 13px 核心、白邊 2→2.5px,並加一圈淡黃光暈 `0 0 0 4px color-mix(--primary 22%)` + 柔和 drop(標準 active-dot affordance),讓 marker 明顯浮在線上。產品頁 line 視圖共用,bar 視圖不受影響。

### D. infra

- chart.css cache-bust `?v=20260602c → e`(index.html / earnings.html)。
- 驗證(Playwright,真實 hover Mar 2025 點):dot 13px / border 2.5px / 黃暈 + drop 生效、tooltip 對齊 $16,000。

---

## 已知缺口（不算 bug，是 R 2.1.1 候選）

詳見 [SPEC.md §5](SPEC.md#5-已知缺口r-211-候選)。

待決策（2026-06-01 round 3 浮現）:
- ~~**Header 兩套並存**~~（2026-06-01 已解決:promote .app-topbar 進 header.css）— 原::產品頁 topbar 是 sidebar.js 注入的 `.app-topbar`(樣式在 shared.css),DS 文件記的是 header.css 的 `.ztor-header`。兩者外觀不同——需決定哪個 canonical(把 DS Header 對齊產品 topbar,或產品改用 `.ztor-header` 統一)。
- ~~**`.badge--warning` 產品頁有用、badge.css 沒定義**~~（2026-06-11 已解決:badge.css 補 `--warning` 變體,同款 soft-tag 配方;orders / order-detail 即刻生效）— 原:該 class 目前無樣式(落到 base badge)。要嘛 badge.css 補 `--warning`,要嘛把產品頁那幾處改用既有變體。

## 編修守則

之後每次調整這個 R 2.1：
1. **先讀 SPEC.md**，確認動到的頁面與 spec 哪一節對應。
2. **動完同步 SPEC.md** §4 對照表的狀態（◑ → ✓ / Step 1 → Step 4）。
3. **append 一則 UI-CHANGES 紀錄**，分區寫（A spec / B 反饋 / C 撤除 / D infra）。bug 不寫。
4. **動到 03.x 子規格邏輯前**，先 append plan 到 `integrated/03-backup_plan.md`（依 [project_ztor_creator_studio_spec_backup.md] 記憶）。
## 2026-06-10 · Sidebar 模式改為單一頁面 App Shell

> 依使用者提供的 Substack 參考與手繪：側欄模式不再是 rail 與內容兩塊平面並排，而是灰色 App Shell 承載側欄，右側 route 內容是一張連續白色頁面。

### B. 反饋導入

- **單一內容頁面**：Sidebar 模式的 `.main` 成為唯一 route page surface，header／hero／page body／footer 都在同一張頁面內，不逐頁新增 wrapper，也不建立 card-in-card。
- **頁面輪廓**：上方保留 16px 灰色 shell 間距，右側與底部貼齊 viewport，只保留 28px 左上圓角；sidebar 本身改透明，直接融入 shell 畫布。
- **行動版 reset**：≤900px sidebar 收成頂列時，移除 shell 灰底、上方 gap、圓角與 clipping，回到滿版內容。

### D. Design System / infra

- `_tokens.css` 新增 `--surface-shell`、`--surface-page`、`--radius-shell`、`--space-shell-gutter`，light / dark 都提供明確 surface 值。
- `design-system.md` 與 `design-system.html` 的 Role、App Shell inventory 與 4.26 規格同步更新。
- `shared.css` 的 sidebar shell 全站共用，因此所有 R 2.1 非 wizard 產品頁同步生效；Topbar 模式不變。
- Browser 驗證：Dashboard／Settings light + Dashboard dark；`.main` desktop = x 248 / y 16 / `border-radius:28px 0 0`，通知 flyout `z-index:60`；Topbar 維持白底滿版。880px 與 390px 的 sidebar 折頂列後 `.main` 均完整撐滿 viewport、radius/gap 歸零、無水平 overflow、0 console error。Design System 四個新 token 均正確解析；其既有 `line-chart` / `bar-chart-3` registry warning 與本次無關。
- 後續視覺微調：依使用者「灰色外層淡一點」，light `--surface-shell` 由 `#EFEFEF` 調為 `#F5F5F5`；白色 route page 與 dark mode 不變。

---

## 2026-06-11 · Skill 收尾驗收首跑：token 紀律 + Dropdown promote + 全站資產版本統一

> 依 `project-ui-creator` skill 新增的 Close-out Verification（收尾驗收）清單，回頭清掉稽核出的三群違規。無視覺設計變更（badge warning 色 light mode 視覺等價）。

### D. Design System / infra

- **badge.css 去硬編色**：`.ztor-badge--success/--error/--info` 的裸 `rgb(... / .12)` tint 改 `color-mix(var(--status-*) 12%, var(--surface))`（light mode 視覺等價、dark mode 起自動跟色）；`.ztor-badge--warning` 文字色 `#7A6A1F` 改 `color-mix(var(--status-warning) 50%, var(--foreground))`（≈ 原色，dark 自動變亮）；`.ztor-dot--black` 的 `#000` 改 `var(--foreground)`。`design-system.md` §4.3/§4.4 與 `design-system.html` 對應敘述同步。
- **`.badge--warning` 變體補齊**（已知缺口結案）：orders / order-detail 已在用但 badge.css 沒定義（靜默落回 base 灰底）。補 18% warning tint + foreground 混色文字，同款 soft-tag 配方；`design-system.md` variants/Class API/§4.1 inventory 與 `design-system.html` 變體矩陣（warning 列補 `.badge` demo）同步。
- **E-Shop「＋ New」dropdown promote 成元件**：e-shop.html 頁內 inline 的 `.eshop-new` 樣式移除，建 `ds-components/dropdown-menu.css`（`.dropdown` / `.dropdown__menu` / `.dropdown__item` / `--left` 變體；native details/summary、無 JS；補 focus-visible 狀態）。頁面 markup 改用新 class。文件四處同步：`design-system.md` §4.26 規格卡 + §4.1 inventory、`component-library.md` 索引、`design-system.html` §4.26 卡（demo 固定展開）+ TOC + Pillar 4.0 compose-map（Dropdown menu → Button）+ Button 卡「被用於」+ layer 表 molecule 例。**`design-system.html` 原 4.26–4.40（App shell ~ Rank bars）順移為 4.27–4.41**（純編號，id 錨點不變）。
- **全站 cache buster 統一**：採單一版本字串制——所有頁面的本地 CSS/JS 引用一律 `?v=20260611a`。終結同檔多版本（先前 alert.css 三版本、settings/chart/chip/i18n 各兩版本並存，design-system.html 長期吃舊快取）；原本完全沒帶版本的 reveal.js（13 頁）、data-list.css（9 頁）、empty-stub.css、chart.js、cookie-banner.css 全數補上。之後改任何 CSS/JS，全站 `?v=` 一次換新值。
- 驗證：grep 全站每支 CSS/JS 僅存一種版本字串 ✓；`ds-components/*.css`（排除 `_tokens.css`/`fonts.css`）0 裸 hex tint ✓；`eshop-new` class 全站 0 殘留 ✓。

---

## 2026-06-11 · 元件全數進 design-system.html + skill 收尾腳本接線

> 使用者裁示：**所有 design system 的元件都必須在 design-system.html 看得到**（設計師檢視元件的唯一入口）。本輪把六個沒有 demo 卡的元件全部補卡，並把驗收機械化（skill 新增 check_ds_sync.py）。

### D. Design System / infra

- **六張新 demo 卡**：§4.27 Product list、§4.28 Project list、§4.29 Payout bank picker & dialog（三支 ds-components CSS 終於連入 DS 頁 + 完整雙語卡）；§4.45 View switch、§4.46 Tooltip (tip)、§4.47 Project card / grid / bar（shared.css 持有的三個小元件，compact 卡）。design-system.html 原 4.27–4.41 順移為 4.30–4.44（id 錨點不變）。
- **design-system.md** 補 §4.27–§4.29 三張規格卡 + §4.1 inventory 補 Payout 列；`component-library.md` 六個「design-system 待補」全部結案改指正式章節；SPEC §6 元件數 24→28。
- **關聯圖同步**：Pillar 4.0 compose-map 加 Product list / Project list / Payout 三列；Badge「被用於」加 organism 層、Button 加 Payout、Input 的「未被嵌入」註記改為 Payout 金額欄位。TOC 新增 6 條（共 64 錨點全解析）。
- **skill 接線**：`project-ui-creator` 新增 `scripts/check_ds_sync.py`（六項機械檢查：元件 CSS 全連入 DS 頁、頁面/DS 同源、版本一致、每元件有 demo、裸色、TOC 錨點）。本輪實跑 R 2.1：5 PASS + 1 WARN。
- **已知債（WARN 記錄在案）**：元件 CSS 內 18 處手寫 rgba 陰影（badge/button/card/chart/footer/input/switch/payout-modal）未走 `--shadow-*` token——值經過微調、貿然換 token 有視覺風險，留待配截圖逐個收斂；selection-card 主題縮圖 hex 為刻意例外（已在 design-system.md §4.18 註記）。
- **DS demo 逼出實頁 regression（順手修掉）**：§4.29 demo 渲染後發現金額輸入框樣式沒生效——`payout-modal.css` 的 `.payout-amount-input`（42px 縮排、34px display 字級）自 06-09 從 earnings inline 搬進元件檔起，就被較晚載入的 `shared.css` `.input`（12px/14px）靜默蓋掉，**實頁 modal 同樣中招**。修法：selector 提高為 `.input.payout-amount-input`，不依賴載入順序。Playwright 驗證實頁與 DS demo 均回到 42px/34px。這正是「元件必須在 design-system.html 有 demo」的價值案例：沒有 demo，這顆壞掉的樣式永遠不會被看到。
- 全站 cache buster 依單一版本制 bump：`20260611a → 20260611b`。
- 驗證：check_ds_sync.py 5 PASS + 1 WARN（如上）；Playwright file:// 渲染 0 console error/warning；六張新卡 light 模式截圖目檢 + 實頁 payout modal 開啟驗證。

---

## 2026-06-11 · 規格稽核後對齊：商品狀態篩選詞彙 + SPEC.md 過時敘述更正

> 規格書全面稽核（documents/ 內部一致性 + 規格↔site drift）後，依使用者裁示執行的 site 側對齊。規格側變更見 documents/decisions.md D020–D025。

### A. Spec 對齊

- **E-Shop 商品狀態篩選詞彙對齊 §7.2**（D023）：篩選選項 In stock／Low stock／Out of stock → **Live／Low Stock／Sold Out**（e-shop.html option 文字 + i18n `e-shop.status.*` 值；key 名沿用）。中文：有庫存→已上架（與同頁列狀態 badge `e-shop.row.active` 一致）。規格 5.1.5 F3 同步改寫。

### D. Design System / infra

- **SPEC.md 過時敘述更正**（稽核抓出，與 site 現實對齊）：Transactions 表 9 欄→6 欄（D010 合併版）；CJK 字型 Taipei Sans TC Beta→系統 Noto Sans TC（§2/§3.1/§5.3/§6.3 四處，註明孤兒 .ttf 與自架 open task）；i18n 約 900/960 keys→約 1,080；頁面計數 6+8→17 頁（8 完整/8 structure/1 重導）；§0 元件覆蓋列補現況。
- **§5a 已知缺口補列 F11**：Earnings 單一專案收益拆解（spec 5.1.8 F11／§5.2.2）未實作、頁面位置與入口未定——原為沉默缺口，2026-06-11 列管。
- 全站 cache buster：`20260611b → 20260611c`。
- 驗證：check_ds_sync.py 全項；e-shop 篩選器雙語目檢。

---

## 2026-06-12 · 建立商品改單頁三型表單（Add new item）

**類型：A（spec 變更）** — spec 5.1.5.2 v2.1（依 screenshots/Shop「Add new item」截圖重寫，documents/decisions D026）

- `create-product.html` 全頁重寫：4-step wizard stub → 單頁表單，頂部 3 張類型卡（Physical item／Digital file／Auction）切換區塊。
  - 實體：Show it off（hero + 4 附圖）→ 商品資訊（名稱*/描述* 0/30/分類）→ Specifications（＋ Add spec）→ 價格庫存（均價提示/原價/低庫存 toggle）。
  - 數位：下載檔（任意檔型）+ Cover art；無 Specifications；Stock 固定 Unlimited。
  - 拍賣：The story（Item name*/why special* 0/50/Category+Condition）→ Prove it's real（合照*/Provenance/Certificate）；無價格庫存，競標設定 spec 待補（stickynote 標示）。
- 新元件 `ds-components/upload-tile.css`（--hero/--file/.upload-grid）；design-system.html demo 卡＋TOC＋index、design-system.md 4.7b 同步。
- icons.js 補 gavel/camera/file 三個 icon。
- i18n：cp.* 全組換新（~60 keys 雙語）。
- 全站 cache buster `20260611c → 20260612a`（18 頁）。
- 自創待確認：頁尾「Publish item／Save and come back anytime」提交動作（spec 未定義）；Condition 為文字輸入（選項 spec 待補）。
- 驗證：Playwright 三型切換截圖（screenshots/add-item-{physical,digital,auction}-20260612.png）、console 0 error 0 warning、check_ds_sync.py（見下）。

## 2026-06-12 · 建立套組（Create bundle）site 實作

**類型：A（spec 變更）** — spec 5.1.5.4（依使用者提供 Create bundle 截圖建立）

- 新頁 `create-bundle.html`：單頁表單（wizard frame），由 e-shop F3「＋ New → Create bundle from products」進入（原 href="#" 已接）。
  - Bundle name* → Items（picker 搜尋既有商品＋＋New item 連 create-product；點列加入；In this bundle 計數；**≥2 件才解鎖 Create**）→ Pricing（Fixed price／% off 兩張 selection-card 切換對應輸入）→ Limit quantity（留空＝不限量）→ Create / Cancel。
- 新元件 `ds-components/picker.css`（`.picker / __search / __search-input / __new / __list`；列復用 data-list）— 為「從既有清單挑選」情境（套組、IP linker）promote；三件套齊（CSS＋design-system.md 4.22b＋design-system.html demo 卡＋TOC＋index）。
- i18n：cb.* 全組（~25 keys 雙語）。
- 自創待確認：% off 折扣輸入欄位（截圖只顯示 Fixed price 態，標 pending spec）；選列加入採點擊高亮（移除控制 spec 待補）。
- 驗證：Playwright 預設態＋點 2 件（In this bundle (2)、Create 解鎖）＋切 % off 截圖（screenshots/create-bundle-*-20260612.png）；console 0 error（僅 favicon 404）；check_ds_sync.py 5 PASS + 1 WARN（既有 18 處 raw-color，picker.css 純 token，無關）。
- 修正：picker 列補 `.data-list__row-main` 包 icon+body（少了會把價格擠到第二行）。

## 2026-06-12 · 建立套組版面改卡片堆疊（B 反饋）

**類型：B（反饋）** — 使用者：create-bundle 與 create-product 不一致、不要照截圖 layout。

- create-bundle.html 改用 create-product 同一套版面語言：每區塊（Bundle name／Items／Pricing／Limit quantity）各包一張 `.card`＋區塊標題，移除裸區塊與 `<hr>` 分隔線。截圖只作為欄位內容來源，版面走專案 design system。
- 修 bug：`.cb-price-input{display:flex}` 蓋掉 `[hidden]` 的 display:none，導致 Fixed/% off 兩個價格輸入同時顯示；補 `.cb-price-input[hidden]{display:none}`（與 create-product 的 `.cp-section[hidden]` 同手法）。
- 驗證：Playwright 截圖（screenshots/create-bundle-final-20260612.png）僅顯示選中模式的輸入；check_ds_sync.py 5 PASS + 1 WARN（既有 raw-color）。

## 2026-06-12 · create-bundle header 對齊 wizard 慣例（B 反饋）

**類型：B（反饋）** — 使用者：建立套組與建立商品的 header 要統一。

- create-bundle header 由「標題左 ／ ✕ 右 ／ 無主題切換」改為全站 wizard 慣例「`✕ Close` 左 ／ 標題中 ／ 主題切換右」，標題字級 15→14px，與 create-product / create-event / create-project 一致。移除未用的 i18n key `cb.close`（改用共用 `wiz.close`）。

## 2026-06-12 · create-bundle footer 對齊 wizard 慣例（B 反饋）

**類型：B（反饋）** — 使用者：套組 footer 不對。

- footer 由「primary『Create bundle』左 ／ ghost『Cancel』右」改為全站 wizard 慣例「ghost『Save and come back anytime』左 ／ `.wizard__bottom-actions` 內 primary 靠右」，與 create-product / create-event / create-project 一致。primary 保留 `#cb-create` disabled（≥2 件才解鎖）。移除未用 key `cb.cancel`（取消改由 header ✕ Close）。

## 2026-06-12 · btn--outline 改真 1px 線框（B 反饋）

**類型：B（反饋）** — 使用者：現行 outline（白填色＋微陰影當邊）只在灰底成立；06-09 canvas 改純白後白底上近乎隱形。白底二級按鈕應用實線框（參考 Notion 式 hairline），這也才是 outline 本義。

- `button.css`：`.btn--outline` 與 `.ztor-btn--outline` 加 `border: 1px solid var(--border)`；`.btn--outline` padding 各 −1px（8×13；--sm 5×9、--lg 11×17）保持原 footprint；hover 統一 `--surface-muted`（移除 `.ztor-btn--outline` 舊 hover 陰影 ring）。dark 模式沿用 `--border` rgba hairline。
- 全域生效 12 個消費頁（e-shop / orders / earnings / settings / wizard Back…），markup 零改動。
- 文件同步：design-system.md 9 處（variants / states / Class API / token 表 / shadow-as-edge pattern 加 2026-06-12 例外註記）＋ design-system.html 2 處描述（demo 按鈕吃 CSS 自動更新）。
- 全站 cache buster `20260612a → 20260612b`（19 頁）。
- 驗證：e-shop 白底 Store settings / Store preview 截圖（screenshots/btn-outline-border-eshop-20260612.png）；check_ds_sync.py 見下。

## 2026-06-12 · 側邊欄已選態改膠囊 pill（B 反饋）

**類型：B（反饋）** — 使用者提供參考截圖：已選項應為全圓膠囊＋一眼可辨的灰填色。

- 新 token `--surface-rail-active`：light `#ECECEC`（比 hover #F3F3F3 深一階）、dark `rgba(253,253,253,0.12)`；hover 維持原 token，已選與 hover 自此分離。
- `shared.css`：`.app-sidebar__link` 與 `__sub-link` 圓角 `--radius-md` → `9999px`（hover／active 同形狀），padding 10→12px 配合膠囊；`[aria-current="page"]` 與 `--active` 改用 `--surface-rail-active`。
- 文件同步：design-system.md token 表 2 處＋design-system.html Role 表加 `--surface-rail-active` 列。
- 全站 cache buster `20260612b → 20260612c`。
- 驗證：sidebar 模式 Playwright 截圖（screenshots/sidebar-active-pill-20260612.png）——E-Shop 群組與 Manage E-Shop 子項皆為膠囊已選態。

## 2026-06-12 · btn--outline 移除多餘陰影（B 反饋）

**類型：B（反饋）** — 使用者：加了 1px 線框後陰影顯得太多。

- `button.css`：`.btn--outline` 與 `.ztor-btn--outline` 移除 `box-shadow: var(--shadow-micro)`，邊緣只由 1px `--border` 線框負責，平面無陰影。`--shadow-micro` 改回單純給 cards / popovers 用。
- DS demo 標籤「白底＋微陰影邊」→「白底＋1px 線框，平面無陰影」；design-system.md 5 處＋token 表敘述同步去掉「陰影代邊」字樣。
- 全站 cache buster `20260612c → 20260612d`。
- 驗證：DS Button 狀態矩陣截圖（screenshots/btn-outline-flat-20260612.png）outline 三尺寸皆平面線框。

## 2026-06-12 · 補齊參考圖缺的兩個按鈕元件（A spec / 元件）

**類型：A（元件補齊）** — 對照 peec/Mobbin 參考圖盤點，補上漏掉的兩種控制（深色填＝primary 色差，非漏）。

- **新元件 `field-pill.css`（下拉／篩選觸發 pill）**：白底＋1px 線框，內含前置 icon＋（search input／native select／label+chevron 選單觸發）＋後置 chevron；`--grow`／`--block` 尺寸變體。補上參考圖 `All Tags ▾ / Last 7 days ▾` 這種「下拉觸發按鈕」缺口。**順手 promote**：e-shop 工具列 search＋status 從頁內 `.eshop-list-search/.eshop-list-status`（~90 行 page CSS）改用元件，只留 `--grow` 撐滿的 layout hook。
- **新元件 `segmented.css`（分段切換）**：灰軌道＋白浮起選中 pill，對齊參考圖 Active/Suggested/Inactive；補上 tabs（導覽）與 view-switch（icon、深填）之外的「文字視角切換」缺口。目前無消費頁，供 filter/view toggle 用。
- 兩元件三件套齊：CSS＋design-system.md（4.22c/4.22d）＋design-system.html（demo 卡＋TOC＋index＋link）。
- 全站 cache buster `20260612d → 20260612e`。
- 驗證：e-shop 篩選列＋DS 兩 demo Playwright 截圖（screenshots/eshop-fieldpill / ds-fieldpill / ds-segmented-20260612.png），console 0 error；check_ds_sync.py 5 PASS + 1 WARN（既有 raw-color＋segmented 選中陰影，屬陰影例外）。

## 2026-06-12 · 補 btn--soft（tonal 次要按鈕）（A 元件）

**類型：A（元件補齊）** — 使用者指出參考圖 Export 是「灰底實填、無框」，非我們的 outline。

- `button.css` 加 `.btn--soft`：靜止 `color-mix(--foreground 6%, --surface)` 灰填、無框，hover 加深至 10%。介於 ghost（透明到 hover）與 outline（白底＋線框）之間——給工具列 Export 這種「安靜但常駐可見」的次要。
- design-system.html Button 區加 Soft 狀態矩陣（sm/default/lg × default/hover/focus/disabled）；design-system.md variants／Class API／Usage 同步（補 outline vs soft 用法分界）。
- 全站 cache buster `20260612e → 20260612f`。
- 驗證：DS Soft 矩陣截圖（screenshots/btn-soft-20260612.png）；check_ds_sync 見下。
- 註：本次只加變體、未改既有 Export 按鈕歸屬（orders/earnings 的 Export 仍 outline）；要不要切成 soft 待定。

## 2026-06-12 · 補按鈕「什麼時候用哪個」決策表（D 文件）

**類型：D（infra/文件）** — 使用者問各按鈕的使用時機是否有定義。

- 原本只有一段散文 Usage；改成決策表（變體×強度×用在哪×一區塊幾個×例），design-system.md 與 design-system.html Button 區同步。
- 明確規則：每畫面 ≤1 primary；Outline vs Soft＝要不要框（白內容區要邊界 outline／工具列密集區要安靜 soft）。
- 標出缺口：**無紅色 destructive 變體**，需要時補 `.btn--danger`。
- 純文件，無 CSS/JS 變更，不 bump cache。驗證：DS 表格截圖（screenshots/btn-when-to-use-20260612.png）。

## 2026-06-12 · 按鈕「背景層（白/灰底）」規則（D 文件）

**類型：D（infra/文件）** — 使用者：按鈕在白底/灰底是不同層，規則怎麼寫。

- 不新增「白底版／灰底版」變體；改寫一條相對原則＋白/灰小表，掛在 Button usage 下、錨定既有 surface 階梯（白 --surface → 灰 --surface-muted/--surface-shell/--surface-rail）。
- 原則：按鈕靠填色/邊框與背景的對比被看見，填色同背景色就消失。白底：primary/outline/soft/ghost/icon 皆可；灰底：用 outline（白填＋框會跳）/primary/ghost/icon，**soft 不要用**（灰填在灰底消失）→ 改 outline。
- 一句話：soft 只活在白底；要放灰底就改 outline（outline 有實線框、跨層最安全）。
- design-system.md 與 design-system.html Button 區同步。純文件，無 CSS/JS，不 bump cache。驗證：DS 截圖（screenshots/btn-bg-layer-20260612.png）。

## 2026-06-12 · 全域 surface-layer contrast 通則（D 文件）

**類型：D（infra/文件）** — 接前一則：把「按鈕配哪種底」一般化成全元件通則，並寫進專案 DS 與 skill。

- design-system.md Pillar 1 surface tokens 段加全域 callout；design-system.html Foundation surface 表下加同段（雙語）。原則：元件靠與所在 surface 層的對比被看見、填色同背景色就消失；淺灰填只在更亮底、白填靠 1px 邊、跨層用實線 border；做有填色元件先定坐哪層、在最深層目視驗證。
- skill 同步（project-ui-creator SKILL.md）：新增「Surface-Layer Contrast」原則段＋Component Creation Checklist 加「surface 層」必填項＋CSS Rules 補一行。
- 純文件，無 CSS/JS，不 bump cache。驗證：DS 截圖（screenshots/ds-surface-contrast-note-20260612.png）。

## 2026-06-12 · Create bundle「加入商品」拆兩段（A spec）

**類型：A（規格落地）** — spec 5.1.5.4 §4② 把單一商品清單拆成「已選商品（In this bundle）」＋「近期瀏覽的商品（Recently viewed）」兩段。

- create-bundle.html：上段為已選清單（空狀態虛線提示＋每列價格旁 ✕ 移除鈕），下段為近期瀏覽（搜尋＋＋New item＋候選列）。點候選列移入已選、✕ 移回，計數／空狀態／「至少 2 件」解鎖 Create 隨之連動。
- 列尾改 `.cb-row-end`（flex row）讓價格＋✕ 並排；移除鈕用既有 `.btn--icon.btn--xs`，無新元件。
- 子標題 `.cb-sublabel`、空狀態 `.cb-empty` 為頁面層樣式（單頁專用，未 promote）。
- i18n 新增 cb.empty / cb.recent。改了共用 i18n.js → 全站 cache buster 20260612f→g。驗證：screenshots/create-bundle-two-sections-20260612.png、check_ds_sync PASS+WARN(既有 raw-color)。

## 2026-06-12 · Create bundle ＋New item 獨立成按鈕（B 反饋）

**類型：B（反饋）** — ＋New item 原本併在近期瀏覽的搜尋框裡（picker__new），改成「Recently viewed」標題列右側的獨立 `btn btn--outline btn--sm`（plus 圖示），與搜尋框分離。i18n cb.new-item 去掉文字裡的「＋」（改用圖示）。picker__new 樣式保留（design-system.html 仍 demo）。改了 i18n.js → cache 20260612g→h。驗證：screenshots/create-bundle-newitem-standalone-20260612.png。

## 2026-06-12 · Create bundle 已選區改「疊加清單＋合併新增方塊」（B 反饋）

**類型：B（反饋）** — 三項：
- 去掉「In this bundle (0)」件數標題。
- 空狀態提示方塊與 ＋New item 合併成單一可點的虛線「Add an item」方塊（`.cb-add-tile`，頁面層），置於已選清單下方。
- 點方塊即加入一件商品、於已選清單由上往下疊加（並從近期瀏覽移除）；候選用罄則作為建立商品流程入口。近期瀏覽 picker 仍保留為明確挑選來源（點列同樣疊加）。
- 同步 spec 5.1.5.4 §4②（已選商品→疊加、無計數；新增方塊取代件數標題＋空狀態＋＋New item）。i18n 改 cb.add/cb.add.sub（移除 cb.empty/cb.in-bundle 用途）。改 i18n.js → cache 20260612h→i。驗證：screenshots/create-bundle-addtile-empty/stacked-20260612.png、check_ds_sync PASS+WARN。

## 2026-06-12 · Create bundle 新增方塊改開建立商品流程（B 反饋）

**類型：B（反饋）** — 「New item」方塊（.cb-add-tile）點擊改為直接開啟建立商品流程（create-product.html / spec 5.1.5.2），不再從近期瀏覽抓候選。加入既有商品改由下方近期瀏覽清單點選疊加。文案 cb.add→「New item / 新增商品」、cb.add.sub→「Create a new product…」。同步 spec 5.1.5.4 §4②。改 i18n.js → cache 20260612i→j。驗證：實際點擊導向 create-product.html。

## 2026-06-12 · 建立商品流程接上頂部操作欄＋即時預覽＋就緒檢查（A 規格落地）

**類型：A（規格落地）** — 依 0-設計規格書 §5.2.4／§5.2.5 與 5.1.5.2 §4.4，把 create-product 從「單欄表單＋底部 footer」改為 §5.2.4 無 stepper 變體＋即時預覽（option B：預覽鈕＋右側滑出面板）。

- **頂部操作欄（§5.2.4 無 stepper）**：Close＋標題（New item／編輯態 Edit X）置左；就緒 chip＋Preview 鈕＋Save for later＋主動作（Start selling／拍賣 Start auction）置右；移除底部 footer。主動作經就緒檢查 gating，未備齊 disabled。
- **即時預覽（§5.2.5）**：頂部 Preview 鈕開右側滑出面板 `.preview-panel`，內含 `.preview-card`（商品卡／拍賣卡），名稱/價格/描述即時綁定表單、未填顯斜體占位；標題隨類型（商品「How buyers see it on Ztor」／拍賣「Now fans see it」）。Esc／遮罩關閉。
- **就緒檢查 `.readiness`**：依類型換檢查項（實體 6／數位 5／拍賣 8）；上傳格點擊模擬上傳回饋、文字欄即時重算；banner 統計還差幾項、備齊轉綠；拍賣 Starting price／Duration／Eligibility 標 pending（待補、不擋上架）。
- **上架開關（Show in my shop）**：移到表單末，預設開。
- 新增 3 支共用元件：`preview-panel.css`／`preview-card.css`／`readiness.css`（promote，三件套：DS html demo 4.22e/f/g＋TOC＋元件表，DS md 條目）。button.css 補 `.btn:disabled` 樣式。icons.js 加 eye。i18n 加 cp.savelater/start.*/preview*/ready*/show*/pv.*。
- cache 20260612j→l（CSS/JS 改）。驗證：實體填滿→6/6「Ready to sell!」主動作解鎖；拍賣切換→主動作/標題/檢查項全換、5 gating+3 pending；預覽面板即時綁定（screenshots/create-product-preview-panel／topbar-20260612.png）；check_ds_sync PASS（WARN raw-color：3 新例外已在 DS md 註記）。
- 範圍：本輪只做 create-product（規格定案）。create-bundle §4⑥、create-event stepper 規格自標待確認/待定案，元件已就緒、待後續接。

## 2026-06-12 · 暗色浮層毛玻璃改為全域治理（D infra）

**類型：D（infra/文件）** — 暗色模式 `--surface` 半透明，浮層用它當底會透出後方內容（使用者回報：預覽面板、＋新增商品 dropdown）。從「逐元件硬寫」收斂為 foundation 一處治理：
- `_tokens.css` 新增 `--overlay-blur: blur(14px) saturate(140%)` token，並在檔尾一條集中規則把所有浮層一起套 `backdrop-filter`：`.overlay-surface`（新浮層用的 utility）、`.dropdown__menu`、`.preview-panel__sheet`、`.modal-dialog`、`.payout-dialog`。新浮層只要加 `.overlay-surface` 或列進該規則即生效。
- `header.css` 原本硬寫的 `blur(14px) saturate(140%)`（2 處）改引 `--overlay-blur`，去重。
- design-system.md §3.2「Translucent surface pitfall」改寫為全域治理說明。亮色 `--surface` 不透明、blur 自動無作用。
- cache 20260612l→m。驗證：暗色下預覽面板標題列不再透出（screenshots/create-product-preview-dark-frosted-20260612.png）、e-shop ＋New dropdown 毛玻璃成形（eshop-dropdown-dark-frosted-20260612.png）；computed `backdrop-filter: blur(14px) saturate(1.4)` 已套上 `.dropdown__menu`。

## 2026-06-12 · 四個建立流程的 header/footer 依 §5.2.4 兩變體統一（B 反饋）

**類型：B（反饋）** — create-product/-bundle/-project/-event 的頂部/底部不一致（bundle 仍舊版、stepper 兩頁缺自動儲存狀態）。依 §5.2.4 收斂為兩變體，各自統一：
- **無 stepper（product、bundle）**：頂部 `.wizard__top-left`(Close＋標題)｜`.wizard__top-actions`(Save for later＋主動作)，加 `.wizard--no-footer`、移除底部 footer。bundle 從「舊 3-up header＋footer 主動作」改為對齊 product；`#cb-create` 主動作移到頂部（JS 不變）。
- **有 stepper（project、event）**：頂部 Close｜stepper 置中｜`.wizard__top-actions`(`.wizard__autosave`「✓ Saved」＋主題)，補上 §5.2.4 變體 2 要求的自動儲存狀態；底部維持 Back＋Next/Publish。
- promote 共用 class 進 shared.css：`.wizard__top-left/-title/-actions`、`.wizard__autosave`、`.wizard--no-footer`（原寫死在 create-product，現四頁共用）。i18n 加 `wiz.savelater`／`wiz.autosaved`。
- 同步 design-system.md Wizard frame 條目（兩變體錨點）。cache 20260612m→n。驗證：四頁頂部截圖（wizard-header-bundle／project／event-20260612.png）對齊；check_ds_sync 全 PASS。

## 2026-06-12 · 四個建立流程 header/footer 收斂為單一框架（B 反饋）

**類型：B（反饋）** — 接前一則。放棄「無 stepper 動作在頂部／有 stepper 動作在底部」的變體分歧，四頁（product/bundle/project/event）改用同一套 chrome，核心動作位置完全一致：
- **Header**：`.wizard__close`(Close) 固定左上｜`.wizard__stepper-slot`（flex:1 置中，多步放 `.stepper`、單頁放 `.wizard__top-title`，永遠留位）｜`.wizard__top-actions`（工具：主題；商品另有 Preview）。
- **Footer** `.wizard__bottom`：Save for later 固定左下｜`.wizard__bottom-actions`（[Back 多步才有]＋主動作）固定右下。商品的就緒 chip 移到 footer 主動作左側。
- product/bundle 從「無 footer、主動作在頂部」改回有 footer、主動作在底部；移除 `.wizard--no-footer`（含 shared.css 規則）與 stepper 頁的 header autosave（統一優先於 §5.2.4 變體 2 的 autosave 細節）。Save 標籤四頁統一 `wiz.savelater`。
- shared.css 收斂：移除 `.wizard__top-left`、新增 `.wizard__stepper-slot`。同步 design-system.md Wizard frame 條目為單一框架。cache 20260612n→o。驗證：四頁 viewport 截圖 Close/Save/主動作同位（wizard-unified-product/bundle/project/event-20260612.png）；check_ds_sync 全 PASS。

## 2026-06-12 · E-Shop 正名商品管理＋商店設定改 header 右推切割面板（A 規格落地 · D028）

**類型：A（規格落地）** — 依已更新的規格（0-設計規格書 §3.2/§5.1/§5.2.1、5.1.5、5.1.5.5、decisions D028）把 R2.1 對齊：
- **正名**：E-Shop 下拉「商店管理」→「商品管理（Products）」；e-shop 麵包屑 self「Manage store」→「Products / 商品管理」（i18n nav.manage-eshop、e-shop.crumb.self）。
- **E-Shop header 下拉三項**（sidebar.js）：商品管理（e-shop.html）／訂單管理（orders.html）／商店設定（e-shop.html#store-settings）。新增 i18n nav.store-settings(-sub)。
- **商店設定改右推切割面板**：partials/store-settings-modal.js 外框由 `.modal`/`.modal-dialog` 改 `.ss-panel`（__head/__body/__foot）；store-settings.css 新增右推面板框＋`body.store-panel-open .main` 壓窄（頁面切割、非浮層，≤760px 改覆蓋）。由 header nav `#store-settings` hash 觸發（hashchange + 載入），✕/Cancel/Save/Esc 關閉並復位、清 hash。移除 e-shop F3 工具列的「Store settings」鈕（單一入口）。
- 同步 design-system.html/md §4.49（modal body → 右推面板，含 `.ss-panel` demo）＋ inventory 標籤。cache 20260612o→p。驗證：`e-shop.html#store-settings` 面板右推、`.main` margin-right 420px 壓窄、麵包屑 Products、nav 三項、關閉復位 margin 0（screenshots/eshop-store-settings-panel-20260612.png）；check_ds_sync 全 PASS。
- 範圍：orders.html／order-detail.html 站上無「商店管理」字樣（該改動只在 .md 文件、已完成），site 無需動。

---

## 2026-06-12 · Events 依 §5.1.6 落地：8 欄活動清單＋狀態切換/搜尋（A 規格落地）

> 對齊 `documents/5.1.6-活動.md`（F1 活動清單欄位、F3 清單篩選、F6 頁首）。使用者裁示「r2.1 照這份規格修改」、F1 採完整表格。

### A. spec-derived 新增

- **F3 清單篩選補齊**：時段分頁（Upcoming／Past／Drafts）下方新增工具列 `.events-toolbar`——`.segmented` 狀態切換（All／On Sale／Draft）＋ `.field-pill--grow` 關鍵字搜尋。比照 e-shop 篩選列，chrome 全用既有 ds-components（`segmented.css`／`field-pill.css`），頁內只留 events 專屬 layout hook。
- **F1 活動清單改完整表格**：`.data-list` → `.product-list`（比照 e-shop）。8 欄＝縮圖（calendar placeholder）｜活動（名稱＋類型/系列序）｜日期與時間｜場地｜票券（已售/總數＋`.event-tickets__bar` 進度條，不限名額顯示 — / unlimited）｜收入｜狀態 badge｜列操作。日期/場地從原本擠在 meta 一行拆成獨立欄。
- **F1 列操作（規格新增）**：每列右側補 編輯（pencil → create-event.html）／複製（copy）／刪除（trash-2）三顆 `.btn--icon.btn--xs`。

### D. Infra / 文件

- 欄數覆寫 `.product-list--events`（grid-template-columns）與票券進度條 `.event-tickets*` 為本頁專屬，比照 e-shop 留 events.html 頁內 `<style>`（欄位數逐頁不同、非跨頁重用）；未新增 ds-component。
- `i18n.js` events 區塊：新增 `events.status.all/on-sale/draft`、`events.filter.placeholder`、`events.col.event/datetime/venue/tickets/revenue/status`、`events.edit/duplicate/delete`、`events.rowN.datetime/venue`；`events.rowN.meta` 改為僅類型＋系列序（日期/場地已拆獨立欄）。
- cache 版本沿用 20260612p。驗證：`check_ds_sync` 1–4、6 全 PASS（WARN raw-color 為既有元件、非本輪新增）；視覺待使用者於 Obsidian/瀏覽器確認（MCP 瀏覽器被佔用、本機無獨立 playwright，未能自動截圖）。

### 範圍

本輪只做 events.html 清單頁（F1／F3／F6）。F5 活動詳情與營運維持 R 2.1.1 stub（empty-stub 不動，見 §8.1）。

## 2026-06-12 · 暗色 app shell ↔ content 底色反轉（B 反饋）

**類型：B（反饋）** — 暗色 sidebar 模式下，原本 app shell（rail＋canvas）是最深 `#0A0A0A`、content 較淺 `#171717`；使用者要求對調成 content 最深。改 `_tokens.css` dark：
- `--surface-page`（content）`#171717` → `#0A0A0A`（最深，視覺內凹）。
- `--surface-shell`（app shell canvas）`#0A0A0A` → `#171717`。
- `--surface-rail` 由半透明 overlay 改 `#171717`（與 shell canvas flush，項目區分靠 hover/active 疊色）。
- `--background` 不動（topbar 模式 canvas 維持 `#171717`）。光色不動。
- 同步 design-system.md §3.1 dark overrides（補 surface-page/shell/rail 三列＋反轉註記）。cache 20260612p→q。驗證：暗色 sidebar e-shop 截圖 content `#0A0A0A` 最深、shell `#171717` 較亮（screenshots/dark-bg-inverted-20260612.png）；check_ds_sync 全 PASS。

---

## 2026-06-12 · 建立活動依 §5.1.6.1 改 5 步精靈（A 規格落地）

> 對齊 `documents/5.1.6.1-建立活動流程.md` v2（Type／Details／Venue & Time／Tickets／Review 五步，decisions D029）。使用者裁示「r2.1 照這份規格修改」。create-event.html 從 1 步結構預覽改為完整 5 步精靈。

### A. spec-derived 新增

- **5 步精靈**（取代原 3 步 Basics/Tickets/Review 的單步預覽）：頂部 stepper 五步 Type／Details／Venue & Time／Tickets／Review；五個 `<section data-step-panel="N">` 全載入 DOM、JS toggle `.hidden` 切換（比照 create-project）；已完成步打勾、目前步實心；可點已完成步或 Review 卡 Edit 連結回看。
- **步驟 1 Type**：5 張類型卡（Concert／Meet & Greet／Festival／Launch Party／Virtual Event），各帶圖示＋名稱＋副標，單選；預設未選（對應 Review 檢核未過）。
- **步驟 2 Details**：基本資訊（Event name＊、Description＊）｜表演陣容（Lineup，＋ Add performer）｜圖片（4 種必填格式 Thumbnail/Vertical poster/Landscape banner/Gallery，各標尺寸·比例·用途）｜影片預告（選填，MP4/MOV ≤2GB）。
- **步驟 3 Venue & Time**：場地（Venue name＊／City·Country／Full address）｜時間（Event date＊／Start／End／Doors open）｜容量（Capacity＊）。
- **步驟 4 Tickets**：空狀態單一虛線卡「＋ Create first tier」＋計數「0 tiers created · minimum 1 required」（至少 1 種）。單票種欄位規格未展開（spec 待補）。
- **步驟 5 Review**：4 張摘要卡（Type／Name／Venue & time／Tickets）各帶 Edit → 回對應步、未填顯佔位（Not selected／Not entered／Not set／0 tiers）；＋ Quality check 5 項檢核（`readiness` 卡）＋ banner；末步主動作「Publish event」。
- **底部導覽**：Save for later（左）＋ Back ＋ Next（文案帶下一步名：Next: Details / Venue & Time / Tickets / Review）；末步改 Publish event。

### D. Infra / 文件

- 重用既有元件：`selection-card`（類型卡）、`upload-tile`（4 圖片格＋影片＋票種空卡）、`readiness`（Quality check）、`stepper`／`wizard` 框架、`card` + `meta-cell`（Review 摘要）。皆已在 design-system，未新增 ds-component。
- 頁內 `<style>` 只留 create-event 專屬 layout hooks（`.ce-type-icon`／`.ce-block`／`.ce-grid-2`／`.ce-image-grid`／`.ce-tier-count`），非跨頁重用，比照 e-shop/events 慣例。
- `icons.js` 補 4 個 Lucide 圖示：`image`（圖片格）、`video`（線上活動類型）、`tent`（音樂節）、`party-popper`（發表派對）。
- `i18n.js` `ce.*` 區塊整段重寫：移除舊 cover/stickynote/single-step 鍵，新增五步全部欄位、類型、檢核、Next 文案與 alert 鍵（含 `ce.req`/`ce.opt`）；create-event 0 個未解析 data-i18n。
- cache 全站 20260612q→r（共用 icons.js／i18n.js 改動）。驗證：`check_ds_sync` 1–4、6 全 PASS（WARN raw-color 為既有元件、非本輪新增）；視覺待使用者於 Obsidian/瀏覽器確認（MCP 瀏覽器被佔用、本機無獨立 playwright，未能自動截圖）。

### 待協調（D029）

- Save 標籤：spec 寫「Save and come back」，site 沿用四 wizard 統一的「Save for later」（`wiz.savelater`）；§5.2.4 自動儲存狀態 vs 手動儲存是否並存待協調。
- Quality check 各項哪些為硬性擋發布、與 ＊ 必填如何對應，待 D029 確定。
- 各活動類型如何改變後續步驟欄位（Festival 多日場次、Virtual Event 線上連結取代實體場地）、單票種欄位：規格皆標待補，site 先做通用版面。

---

## 2026-06-12 · Events F3 篩選改為真正可運作（時段×狀態×搜尋 AND）（A 規格落地）

> 對齊 `documents/5.1.6-活動.md` 更新版 F3（時段分頁／狀態切換／活動搜尋的細部行為）。前一輪只放了篩選 UI（不可動），本輪依規格讓三者實際過濾清單。

### A. spec-derived 新增

- **F3 三層篩選 AND 連動**（時段分頁 × 狀態切換 × 活動搜尋）：每列加 `data-period`／`data-status`／`data-search`，新增頁內 `<script>` 即時 show/hide。預設停 Upcoming＋All＋空搜尋。
- **活動搜尋比對 名稱／場地／Lineup**（規格 §F3 ③）：`data-search` 含中英活動名、場地名與表演者名（Lineup），不分大小寫子字串命中即列入；輸入即時過濾、可一鍵清除（搜尋框 ✕＋空狀態 Clear）。
- **時段分頁可運作＋真實計數**：Upcoming／Past／Drafts 點擊切換；計數由 JS 依實際列數填入（不再寫死 3/8/2）。
- **無結果空狀態**：篩選/搜尋無命中時隱藏整張表、顯示 `events.empty.noresult.*` 空狀態（◍）＋ Clear search；沿用 `empty-stub`。
- **補齊跨分頁範例資料**：原本只有 3 筆 Upcoming，新增 2 筆 Past（Ended）＋ 2 筆 Drafts，讓分頁與篩選有東西可切；新增 `events.badge.ended/draft` 狀態。

### D. Infra / 文件

- 篩選邏輯為頁內 `<script>`（比照 projects.html 的清單過濾慣例，但本頁保留靜態列＋show/hide，不改 i18n 綁定方式）；搜尋框 ✕ clear 為 events 專屬 layout hook `.events-search-clear`，未新增 ds-component。
- `i18n.js` 補 `events.badge.ended/draft`、`events.search.clear`、`events.empty.noresult.title/sub/clear`、`events.row4–7.*`；`events.filter.placeholder` 文案改「Search by name, venue, performer / 搜尋名稱、場地、表演者」。
- cache 全站 20260612r→s（共用 i18n.js 改動）。驗證：`check_ds_sync` 1–4、6 全 PASS（WARN raw-color 既有元件、非本輪）；events.html 0 個未解析 data-i18n；篩選邏輯：Upcoming/All 預設顯 3 列、計數 3/2/2、搜尋「tokyo」命中 Past 的 Tokyo Pop-up、「coastline」跨多列、Past+Draft 狀態組合顯空狀態。視覺待使用者於瀏覽器確認（MCP 瀏覽器被佔用、本機無獨立 playwright，未能自動截圖）。

### 待協調（記 decisions）

- 狀態切換的 Draft 與時段分頁 Drafts 範圍重疊（spec §F3）：目前兩者獨立（period=時段、status=售票狀態），Drafts 分頁下選 On Sale 會顯空狀態；是否互斥或在 Drafts 分頁停用狀態切換待協調。
- 規格多項標「待補」（多日活動時段界定、Scheduled/Ended 是否納入狀態切換、繁簡/全形正規化、多關鍵字、去抖動閾值、預設排序）：site 先做基本版（單關鍵字、子字串、無排序變更）。

## 2026-06-12 · 反轉後 footer 撞色修補（D infra）

**類型：D（infra）** — 接暗色反轉：`--surface-inverse`（footer 深色塊，footer.css `.footer` 與 shared.css 兩處 slab 用）暗色原為 `#0A0A0A`，反轉後與 content（`--surface-page` `#0A0A0A`）撞色、失去分隔。改暗色 `--surface-inverse` `#0A0A0A`→`#000000`，重新比 content 深一階。其餘色階（`--surface`/`--surface-muted`/`--border`/foreground/rail hover·active）暗色皆為半透明疊色、相對對比自保，毋須調整；狀態色為固定色相 badge 用，也不受影響。同步 design-system.md §3.1。cache 20260612q→r。check_ds_sync 全 PASS。

## 2026-06-13 · Sidebar 的 IP Bank / E-Shop 改分組標題＋子項平鋪（B 反饋）

**類型：B（反饋）** — 依使用者參考側欄（General/Sources/Brand 分組標題＋平鋪項），把 sidebar 模式的 IP Bank、E-Shop 從可收合 accordion 改為「分組標題（不可點的小灰色 `.app-sidebar__section-label`）＋子項各自渲染成一般 `.app-sidebar__link`（帶 icon、不收合）」。
- sidebar.js `sidebarNavHtml()`：panel group → section label + 平鋪子連結；移除 group-toggle/chevron/subnav。active 子頁顯示膠囊 pill（沿用 `[aria-current]`）。
- 緊接分組之後的平鋪頂層項（Events）加 `.app-sidebar__nav-gap`（margin-top 14px）分隔，避免被誤讀為前一組成員。
- shared.css 新增 `.app-sidebar__section-label` / `.app-sidebar__nav-gap`；舊 `.app-sidebar__group*` 樣式保留供回退。topbar 模式不變（仍 hover dropdown）。
- 同步 SPEC.md §5.2a / Dropdown panel 描述、design-system.md NavigationMenu + Global nav sidebar 條目。cache 20260612s→t。驗證：sidebar 截圖 IP Bank/E-Shop 為分組標題＋平鋪、Products active pill、Events 有間距（screenshots/sidebar-section-labels-20260613.png）；check_ds_sync 全 PASS。

## 2026-06-13 · Sidebar 改回 accordion，section-label 留為元件變體（C 撤除 + B 反饋）

**類型：C（撤除）＋B（反饋）** — 使用者偏好原本的可收合群組，sidebar.js `sidebarNavHtml()` 改回 accordion（`.app-sidebar__group` + group-toggle + chevron + subnav），移除 section-label 渲染與 `.app-sidebar__nav-gap` 用法。
- **保留變體**：`.app-sidebar__section-label`／`.app-sidebar__nav-gap` CSS 留在 shared.css（標註為「可切回的變體、目前不渲染」）；design-system.html §4.10 NavigationMenu 新增「Sidebar-mode group renderings」demo，並排展示 accordion（現役）與 section-label（變體），讓設計師能看到保留的版本。
- 文件回復：SPEC.md §5.2a、design-system.md NavigationMenu + Global nav sidebar 條目描述改回「accordion 現役」並註記變體保留。cache 20260612t→u。驗證：live sidebar 為 accordion（screenshots/sidebar-reverted-accordion-20260613.png）、DS 並排 demo（screenshots/ds-sidebar-variants-20260613.png）；check_ds_sync 全 PASS。

## 2026-06-13 · Sidebar accordion 四項微調（B 反饋）

**類型：B（反饋）** — sidebar 模式的可收合群組：
- **預設展開**：sidebar.js `sidebarNavHtml()` 群組 `const open = true`（仍可點 toggle 收合）；底部 Account 群組維持預設收合不變。
- **父項不顯示已選態**：移除 group-toggle 的 `aria-current`；選中子頁時只有實際 current 子項 highlight（例：選「我的 IP」只有它有 pill，「IP 資產」無）。
- **子項 active pill 與主項同尺寸**：`.app-sidebar__sub-link` padding 改 `9px 12px 9px 40px`（pill 全寬、高度對齊主項；文字 padding-left 40px 對齊主項 icon+label），移除 `.app-sidebar__subnav` 的 28px 左縮排。
- **加大項目間距**：`.app-sidebar__nav` 與 `.app-sidebar__subnav > div` 的 gap 2px→6px。
- 只動 shared.css／sidebar.js（sidebar 模式）；topbar 不變。cache 20260612u→v。驗證：my-ip.html sidebar 截圖（screenshots/sidebar-expanded-myip-20260613.png）兩群組展開、IP 資產無 pill、My IP 全寬 pill、間距加大；check_ds_sync 全 PASS。

## 2026-06-13 · Sidebar 已選圓角改回較小（B 反饋）

**類型：B（反饋）** — pill 變高（全寬、9px padding）後，全膠囊 `9999px` 的圓端顯得太圓。`.app-sidebar__link` 與 `.app-sidebar__sub-link` 的 border-radius `9999px`→`var(--radius-lg)`（8px），回到圓角矩形。topbar nav 不受影響。cache 20260612v→w。驗證：screenshots/sidebar-radius-fix-20260613.png。

## 2026-06-13 · 新增 Dev Tools 原型狀態工具（D infra）

**類型：D（infra，非產品 UI）** — 右下角浮動控制面板，用來把原型切到不同情境做 demo/QA。
- 新檔 `devtools.js`：自包含（自帶 <style>＋markup，固定深色，不進 design system、不觸發 check_ds_sync）。面板含 Skip Validation 開關、Onboarding Flow、Event Day States（照使用者截圖）。
- 入口：右下角啟動鈕（點擊）＋ **Alt(Option)＋右鍵**（只有按 Alt 才攔截 contextmenu；純右鍵保留瀏覽器原生選單）。Esc／× 關閉；footer 可暫時隱藏 launcher（Alt＋右鍵可召回）。
- 狀態：localStorage `ztor.devstate` ＋同步 URL 參數（`?onboarding=…&event=…&skip=1`，可分享情境連結）。對外 API `window.ztorDevState.get()/set()/on()` ＋ document 事件 `ztor:devstate-changed`——後續逐功能接、非逐頁改。
- 載入：以一行 `<script src="devtools.js">` 注入 19 個產品頁（排除 design-system.html），與 icons/i18n 同模式。cache 20260612w→x。
- 範圍：**只做骨架**（開關／持久化／入口跑通），尚未驅動任何頁面呈現。驗證：screenshots/devtools-panel-20260613.png；Alt右鍵開、純右鍵不攔截、URL/localStorage 同步皆通過。

## 2026-06-13 · Dev Tools 改版：DS 風格＋僅 Alt右鍵＋內建 inspector（D infra）

**類型：D（infra）** — devtools.js 整版重寫：
- **走 design system tokens**：面板用 var(--surface)/--border/--foreground/--primary/--radius-*，亮暗色自動跟隨；暗色加 `--overlay-blur` 毛玻璃（同全域浮層治理，避免半透明 --surface 透出後方）。
- **移除常駐啟動鈕**：未開啟時右下角不顯示任何東西；**唯一入口＝Alt(Option)＋右鍵**（純右鍵不攔截、保留瀏覽器原生選單），Esc／× 關閉。
- **內建元素 inspector**：評估過 eruda（~100KB、自帶 UI 不合 DS）、dom-inspector（停更）、simple-js-dom-inspector（功能少）後，自寫精簡版——面板「Inspect element」開關，hover 高亮（黃框＋selector/尺寸標籤）＋面板即時讀出 selector／尺寸／盒模型／字體／顏色，點擊鎖定，Esc 退出。純讀取、不改頁面。
- cache 20260612x→z。驗證：light/dark 截圖（devtools-ds-light/dark-20260613.png）、inspector 截圖（devtools-inspector-20260613.png）；無常駐鈕、Alt右鍵開、純右鍵不攔截、inspector 讀出正確；check_ds_sync 全 PASS。

## 2026-06-13 · 建立專案流程依規格 v3 重建為三類型分流（A spec）

**類型：A（spec 對齊）** — 依 `documents/5.1.2.1-建立專案流程.md` v3 把 create-project.html 從固定 4 步精靈重建為依專案類型動態分流。

- **動態 stepper**：選專案類型即切換步驟序列（spec §3）——Go live＝About/Showcase/Monetization/Review（4 步）、Fund it first＝About/Showcase/Funding/Tiers/Review（5 步）、Pre-order＝About/Showcase/Pre-order/Review（4 步）。stepper 由 JS 依 `FLOWS[type]` 重建，Back/Next 標籤與「步驟 1 不顯示返回」「最後一步＝Publish project」皆隨流程算。
- **About 補齊**：內容類型改 **chip 按鈕群單選**（spec §4.1②，取代舊 dropdown）；新增**依內容類型動態切換的類型相關欄位組**（film／music／mv+doc／event／merch／custom 各一套，spec §4.1④）；IP 租借入口改指 my-ip.html（IP Bank 租入 IP，spec §8.6）。
- **新增三個中段步驟**：Funding（綠色零風險提示＋募資目標 min $500＋周期 7–90 天＋資金分配＋**預算分配堆疊長條圖 + 100% 驗證**，spec §5.2.1）、Tiers（最少 3、方案卡 + 編輯面板，spec §5.2.2）、Pre-order（綠色退款提示＋單位價格／最少訂購數／截止／預期交付／預購內容，spec §5.3）。
- **Review 改 per-type**：中段摘要、交付時程（僅 Fund/Pre-order）、What happens next（三類型各一段，照 spec §4.3.3）、發布前檢查（type-specific 項目切換）皆依類型呈現；專案類型摘要動態回填。
- **修邏輯錯誤**：平台費由寫死 **15% 改為 5% 平台費 + 3% Stripe**（spec D029 點名的誤抄），收入估算淨額同步由 ×0.85 改 ×0.92（$4,590→$4,968）；access model 副標、ads 區塊改照 spec §5.1。
- **元件**：全用既有元件（chip / alert--success banner / upload-tile / selection-card / data-list / badge / switch / card / input），無新增 ds-component，故未動 design-system.html。**page-specific 未升元件（待確認）**：募資預算堆疊長條圖、Tier 編輯面板、`.tf-grid` 2 欄版位 helper——皆單一頁面使用、用 token 上色，暫留 page 層。
- **保留 spec 的「待補」**：分級／語言／地區下拉選項、Hybrid 付費規則、廣告版位規則、§7.1 canonical 次分類對應、即時預覽卡——原型標 TBD，未自創。
- i18n：新增約 170 個 cpp.* 雙語 key（步驟／類型欄位／募資／方案／預購／Review per-type），並修正既有 fee/access/IP 文案。cache 全站 20260612z→20260613a。
- 驗證：check_ds_sync 全 PASS（裸色 WARN 為既有元件檔、非本輪）；264 個頁面 i18n key 全數命中字典（0 raw key）；inline JS 與 i18n.js `node --check` 通過；三類型流程序列以 node 模擬確認符合 spec §3。視覺待使用者於瀏覽器確認（Playwright 瀏覽器被既有 session 佔用，未截圖）。

## 2026-06-13 · Dev Tools inspector 升級：元件辨識＋面板可拖移/調高 (D infra)

**類型：D（infra）** — devtools.js：
- **元件辨識**：內建已建立元件對照表（block class 根 → 元件名，涵蓋 ds-components 與 stepper/wizard 等）。inspect 時新增「component」列：元素 class 命中對照表 → 顯示元件名徽章＋高亮轉黃框；未命中但在某元件內 → 「非元件 class（位於 X 內）」；都不是 → 「非元件 class（純 DOM 元素）」＋藍框。原「selector」列改名「class」並釐清：class ≠ 已建立元件。
- **可拖移**：標題列為把手，拖曳改 left/top 定位（避開頭部按鈕）。
- **可調高度**：面板 `resize:vertical`（右下原生握把）。位置與高度存 localStorage `ztor.devtools.geo`，跨頁／重整保留、開啟時套用並夾在視窗內。
- cache 20260613b→c。驗證：Tabs/Alert/App-nav 標為元件（黃框＋徽章）、Tabs 內的 span 標「位於 Tabs 內」（藍框）、純 div 標非元件；拖移後 left-anchored、resize 後 geo.height 持久化（screenshots/devtools-inspect-component-20260613.png）；check_ds_sync 全 PASS。

## 2026-06-13 · Dev Tools 元件對照表改為自動推導（D infra）

**類型：D（infra）** — 承上：inspector 的元件對照表從手動硬編改為**自動從頁面載入的 ds-components/*.css 推導**（`buildReg()`：掃 href 含 /ds-components/ 的 stylesheet，取每條 selector 第一個 class 的 block 根 → 對應「檔名→元件名」，遞迴 @media；inspect 開啟時重建一次）。新增 ds-component 不必再改 devtools.js。少數住 shared.css 的元件（stepper / wizard / app-sidebar / app-topbar）以小清單補上；檔名→顯示名以 NAME_OVERRIDE 微調（kpi→KPI tile 等）。file:// 直開讀不到 cssRules 時退回只剩補充清單，http/Vercel 完整。cache 20260613c→e。驗證：tabs/alert/app-topbar/field-pill 皆自動標為元件，field-pill 未列任何手動清單仍被認出。check_ds_sync 全 PASS。

## 2026-06-13 · Dev Tools 重新優化：更名 Cheat Codes＋減黃＋Skip 真接線 (D infra)

**類型：D（infra）** — 三件：
- **更名**：Developer Tools → **「Cheat Codes」**（俏皮且貼切：原型作弊碼），icon 換 sparkles。
- **減黃／對齊 DS**：開關（Inspect / Skip）改用真 switch（黃只在小滑軌）；單選選項選中態從「整塊黃」改為**淡黃 tint＋細黃環**（比照 ds `selection-card--active`）。重排分組（Inspect 置頂）、footer 加 Reset。少了大量黃色、符合「黃＝點綴」規範。
- **Skip validation 真接線**：接到唯一有真實 gating 的建立商品頁——`renderReadiness` 讀 `ztorDevState.skipValidation`，開啟時 `primary.disabled = !(ready||skip)` 強制可上架、chip 顯示「Validation skipped」；監聽 `ztor:devstate-changed` 即時重算。多步精靈（專案/活動）本來就不檔下一步，故無驗證可跳（待之後補真實 per-step 驗證再接）。
- cache 20260613e→f。驗證：面板截圖少黃（screenshots/cheatcodes-redesign-20260613.png）；create-product 空表單 Skip ON→主動作解鎖、chip「Validation skipped」、OFF→復原（DOM 實測）。check_ds_sync 全 PASS。

## 2026-06-13 · Cheat Codes 狀態全接線：Onboarding→Dashboard、Event Day→Events (D infra)

**類型：D（infra）** — 把剩餘情境旗標接到頁面：
- **通用橋接**：devtools.js 的 `emit()` 把狀態反映到 `<html data-onboarding / data-event-day / data-skip-validation>`，任何頁面／CSS 都能據此反應（深層整頁變體日後逐頁擴充用同一組屬性即可）。
- **新檔 scenario.js**（自包含、走 DS tokens）：依當前狀態在頁面頂部顯示情境提示橫幅。Dashboard 吃 Onboarding Flow（Welcome／Has draft／First publish… 含 CTA）、Events 吃 Event Day（Live／Pre／Post／Multi）；值為「normal／no-event」時不顯示。讀 `window.ztorDevState`＋監聽 `ztor:devstate-changed` 即時更新。只掛在 index.html／events.html（devtools.js 之後）。
- 至此三組狀態都驅動真實頁面行為：Skip→建立商品 gating、Onboarding→Dashboard 橫幅、Event Day→Events 橫幅。其餘頁面可隨時 opt-in（讀同組屬性）。
- cache 20260613f→g。驗證：Dashboard first-publish→「Your first release is live 🎉」、Events live→「● An event is live right now」、normal/no-event→隱藏（screenshots/scenario-dashboard / scenario-events-live-20260613.png）；check_ds_sync 全 PASS。

## 2026-06-13 · Inspector 可選到 disabled / pointer-events:none 元素 (D infra)

**類型：D（infra）** — 修 inspector 選不到 disabled 按鈕的問題。根因：`elementFromPoint` 會跳過 `pointer-events:none` 的元素（含 `.btn:disabled`），回傳上一層。devtools.js 新增 `refine(el,x,y)`：命中後用 `getBoundingClientRect` 往下精修到「座標落在的最深子元素」，不受 pointer-events 影響；mousemove 與 click 兩處都套用。驗證：create-product 的 disabled 主動作（pointer-events:none）原 elementFromPoint 回傳 `.wizard__bottom-actions`，refine 後正確選到 `button#cp-primary`，readout 標 component=Button（screenshots/inspect-disabled-button-20260613.png）。cache 20260613g→h。check_ds_sync 全 PASS。

## 2026-06-14 · Topbar 模式套用 app shell（灰 canvas + 圓角內容面板）(B 反饋)

**類型：B（反饋）** — 依使用者參考圖，把 topbar 模式也做成 app shell（與 sidebar 模式同一套 shell token）：
- `.app` 底色 → `--surface-shell`（灰）；`.app-topbar` 改坐灰底（去白底/邊框/frosted，scrolled 時加淡 hairline 陰影分隔）。
- `.main` → 上方留 `--space-shell-gutter` 間距、`border-radius: --radius-shell --radius-shell 0 0`（**上方兩角**圓，sidebar 只圓左上）、白底 `--surface-page`、`overflow:clip`。
- Dashboard 全屏 Hero 取消 100vw breakout、收進面板（上緣跟著圓角裁切）。
- 只作用 topbar 模式且有 `.app` 的頁；**wizard 頁（`.wizard`，無 `.app`）不受影響**（灰只套 `.app` 不套 body，已驗 create-product body 仍白）。窄螢幕（≤900px）收掉 shell 回滿版白底。深淺色由既有 token 自動切換。
- cache 20260614a→c。驗證：e-shop topbar 灰底＋白圓角面板（screenshots/topbar-shell-eshop-20260614.png）；Dashboard hero 收進面板（computed：hero width 1200≠100vw、main top 80、radius 28/28、overflow clip、scrollWidth=vw 無 overflow）；wizard body 仍白；check_ds_sync 全 PASS。

## 2026-06-14 · App shell 固定、內容內部捲動（topbar＋sidebar）(B 反饋)

**類型：B（反饋）** — 之前整份文件（含面板外框）跟著捲；改成 shell 固定、只有面板內容捲。
- 桌機（≥901px）：`.app { height:100vh; overflow:hidden }`（body 不再產生文件捲動，因 .app=100vh）。
- `.main`（兩模式）：`overflow: clip` → `overflow-y:auto; overflow-x:hidden`、`min-height` → `0`，成為內部捲動容器；topbar／rail／面板圓角外框維持固定。
- 窄螢幕（≤900px）：維持一般文件捲動（既有 @media 已將 .main 設 overflow:visible；.app 桌機覆寫用 min-width:901 故不套用）。wizard 頁（無 .app）不受影響。
- cache 20260614c→d。驗證：e-shop topbar 模式 main.scrollTop 186、window.scrollY 0、topbar top 固定 0（screenshots/shell-fixed-internal-scroll-20260614.png）；sidebar 模式 .app overflow hidden、main overflow-y auto、rail 固定。check_ds_sync 全 PASS。
- 已知副作用（待觀察）：依賴 `window` 捲動的功能不再觸發（如 header is-scrolled 陰影）；`#hash` 深連結預設不會把區段捲進 .main——需要時再補一支小 script 處理。

## 2026-06-14 · 修 sidebar 模式內容無法捲動 (B 反饋)

**類型：B（反饋）** — 接上一則固定 shell：sidebar 模式 `.app` 為 flex row 且 `align-items: flex-start`，`.main` 高度只到內容高、沒被撐成視窗高，`overflow-y:auto` 無從捲動、超出部分被 `.app` `overflow:hidden` 裁掉。修：sidebar `.main` 加 `align-self: stretch`（撐滿 .app 高度，扣掉 gutter margin），內捲恢復。cache 20260614d→e。驗證：sidebar e-shop clientHeight 804 < scrollHeight 927、可捲到底、window.scrollY 0、rail 固定（screenshots/sidebar-scroll-fixed-20260614.png）。check_ds_sync 全 PASS。

## 2026-06-14 · 修 Dashboard Hero 被 flex 壓扁消失 (B 反饋)

**類型：B（反饋）** — 固定 shell 後 `.main`（flex column）變成固定高捲動容器，子項被 flex-shrink 壓扁——Hero（flex-shrink:1）被擠成 0 高、整個不見。修：桌機 `@media(min-width:901px) .app .main > * { flex-shrink: 0 }`，子項保持自然高度、改由 .main 內捲。cache 20260614e→f。驗證：Dashboard heroH 720 回復、main scrollH 2636>clientH 740 可捲到底、window.scrollY 0、topbar 固定（screenshots/hero-restored-20260614.png）。check_ds_sync 全 PASS。

## 2026-06-14 · 修 Hero 面板圓角不見（合成圖層逃出裁切）(B 反饋)

**類型：B（反饋）** — Dashboard Hero 上方圓角消失：Hero 有被 GPU 合成的 transform 圖層，會逃出 `.main` 的「圓角＋overflow」裁切；且 `.hero--fullbleed` 自身 `border-radius:0`、`overflow:hidden` → 角呈方形（其他頁無此圖層、面板圓角正常）。修：`.app .main > .hero--fullbleed { border-radius: inherit }` 讓 Hero 直接繼承 .main 圓角（topbar 上兩角／sidebar 左上／≤900px 為 0），靠自身 overflow:hidden 把內容裁圓。cache 20260614f→g。驗證：dashboard .main 元件截圖 Hero 上方兩角已圓（screenshots/corner-fixed-dashboard-20260614.png）。check_ds_sync 全 PASS。

## 2026-06-16 · 訂單管理補空資料畫面（A 規格）

**類型：A（規格）** — orders.html 先前漏接 Cheat Codes Empty（七模組補空狀態時只接了入口頁 e-shop，未含子頁 orders）。依 5.1.5.3 §頁面狀態補上：F1 各 KPI 在 Empty 顯示 0（`.kpi__value` 內 `.when-data`/`.when-empty` 雙值）、F3 訂單清單與對帳註腳掛 `.when-data`、新增 `.when-empty` empty-card（icon package、「目前沒有訂單」、引導 CTA 去電子商店）。沿用既有 empty-card.css，0 新元件。cache 無變更（20260616c，僅新增 markup 與 i18n key orders.empty.account.*）。驗證：http + ?data=empty 下 KPI=0、清單 display:none、空卡 display:block 且標題正確（screenshots/orders-empty-20260616.png）；有資料態正常（orders-hasdata-20260616.png）。check_ds_sync 全 PASS（WARN 為既有 selection-card）。

## 2026-06-16 · Cheat Codes 新增外觀類切換：Theme／Language／Display mode·版面（D infra）

**類型：D（基礎設施／開發工具）** — devtools.js 的 Cheat Codes 面板新增三組單選：Theme（Light／Dark／System）、Language（English／中文）、Display mode·版面（Topbar／Sidebar）。皆**直接驅動既有系統**、不併入 devstate：Theme→window.ztorTheme（theme.js）、Language→window.setLang（i18n.js）、Display mode→window.ztorNavMode（theme.js），各自原本就有 localStorage 持久化。面板只讀現值高亮、點擊呼叫其 API；並監聽 ztor:theme-changed／ztor:navmode-changed／i18n:applied，在面板開啟時同步高亮（避免從 topbar 改後面板顯示不同步）。0 新元件、不動 design-system。cache 全站 20260616c→d（devtools.js 內容變更）。驗證：http 開 orders.html，Alt＋右鍵開面板，三組各點一次 → data-theme=dark／lang=zh-Hant（h1 變「訂單管理」）／data-nav-mode=sidebar，面板高亮同步（screenshots/cheatcodes-appearance-20260616.png）。check_ds_sync 全 PASS。

## 2026-06-16 · 建立商品「詳細規格」改鍵值兩欄並併入商品資訊（A 規格）

**類型：A（規格）** — 對齊 5.1.5.2 §4.1②（v3.0 把詳細規格併入「②商品資訊」、v2.9 定為鍵值兩欄）與截圖 Add new item_1.0。先前 create-product.html 為獨立一張 Specifications 卡、每筆只有單一自由輸入框。
- 移除獨立 Specifications 卡；改放進商品資訊卡（商品名稱→描述→分類→規格），維持 `data-cp-show="physical"`（數位無此區、拍賣走故事）。
- 每筆規格改為兩欄：規格名稱（占位「e.g., Material」）＋規格值（占位「e.g., 100% organic cotton」）＋行尾刪除鈕（`.btn--icon`），以「＋ Add spec」續加。
- JS `addSpecRow()` 產生 `.cp-spec-row`（grid 1fr 1fr auto）並掛刪除事件；`specCount()` 沿用 `#cp-spec-rows` 子數，就緒檢查「Specifications」不變。
- 新增 i18n 鍵 `cp.spec.name.ph`／`cp.spec.value.ph`（en/zh）。0 新元件（沿用 input／button／field），新增僅 1 條頁面區域 CSS `.cp-spec-row`。
- 驗證：http 載入 → ＋Add spec ×2 得 2 列、刪除回 1 列、兩欄中文 placeholder 正常、Specifications 落在含 #cp-f-name 的商品資訊卡內（screenshots/create-product-specs-keyvalue-20260616.png）。check_ds_sync 全 PASS（WARN 為既有 selection-card 主題縮圖例外）。

## 2026-06-16 · 修單一規格仍露出「新增選項」＋規格區標題正名（A 規格）

**類型：A（規格）** — 對齊 5.1.5.2 §4.1③「商品規格（Variations）：單一規格走單一價格庫存、無選項」。
- 修顯示 bug：`.variant-builder` 設 `display:flex`，蓋過 `[hidden]` 的 `display:none`，使單一規格模式下整個建構器（含「＋ 新增選項」）仍露出。於 variant-builder.css 補 `.variant-builder[hidden]{display:none}`。
- 區塊標題 i18n `cp.var.title` zh 由「多規格」改為「商品規格」——原值與切換鈕的「多規格」一字不差，造成「多規格區塊為何有單一規格」的困惑；en「Variations」不變。
- cache 全站 20260616g→h（含 variant-builder.css、i18n.js）。
- 驗證（DOM 斷言）：http 載入單一規格→`#cp-var-builder` computed display:none、`#cp-add-option` offsetParent null（隱藏）；切多規格→出現；切回→再隱藏；`cp.var.title` 渲染「商品規格」。check_ds_sync：variant-builder 與本次相關項全 PASS（唯一 FAIL 為未追蹤的平行檔 fan-store.css 未進 DS，非本次範圍）。

---

## 2026-06-16 · 活動情境橫幅改用商店同款 alert 元件（B 反饋 + D infra）

> 使用者：活動的通知要和商店的通知用同一個元件、以商店為主。活動原本是 scenario.js 注入的一次性 `.zsc` 橫幅（硬編碼、無 i18n、無關閉）；商店低庫存用正規 `.alert--bar`。已確認：保留 4 狀態動態、狀態色全用 warning、版位完全照商店（貼頂 sticky 滿版 + ✕）。活動橫幅非 5.1.6 規格功能，屬呈現層 demo（接 devtools Event Day）。

### B. 反饋導入

- **活動情境橫幅換成商店同款 alert 元件**：scenario.js 從自帶 `.zsc` 樣式改為渲染 `.alert alert--bar alert--warning alert--page-top`，與 e-shop 低庫存通知條共用同一份 `ds-components/alert.css`；icon(`bell`)＋`.alert__title`＋同行 `.alert__meta`＋`.alert__dismiss` ✕，視覺與商店一致。
- **保留 4 狀態動態**：仍接 devtools「Event Day」（pre/live/post/multi/no-event），切狀態即時換內容；no-event 不顯示（預設）。
- **✕ 可關閉**：關閉=隱藏目前狀態（`banner.hidden`，非移除，避免 devstate 重渲染寫到脫離節點）；切換 Event Day 狀態後再次出現（已與使用者確認的行為）。
- **掛載點改 `.main` 第一個子元素**：貼頂滿版需在 `.page` 之外的全寬層（比照 e-shop）；`when-data` 讓帳號空狀態自動隱藏。

### D. Infra / 文件

- **promote `.alert--page-top`**（`ds-components/alert.css`）：把 e-shop 頁內 `.eshop-stock-bar` 的「貼頂 sticky／滿版／上緣繼承面板圓角／下緣方角＋向下陰影」定位升為共用 modifier（第 2 次使用 → 入元件）；另含 `::after` 補捲動容器右上方角（≥901px），免每頁各寫遮罩。
- **e-shop 遷移到單一來源**：通知條 class `eshop-stock-bar` → `alert--page-top`，移除頁內 `.eshop-stock-bar` 樣式區塊；`.eshop-corner-mask` 保留（負責 × 關閉後仍補右上角，元件 `::after` 只在 bar 存在時補）。`#eshop-stock-bar` ID 與 dismiss 行為不變。
- **events.html** 新增載入 `ds-components/alert.css`。
- **scenario.js 文字接 i18n**：4 狀態 title/desc 改讀 `events.scenario.*`（i18n.js 新增中英 + `events.scenario.dismiss`），切語言經 `i18n:applied` 重渲染；移除硬編碼英文，解決原本切中文不翻。
- **DS 同步**：design-system.html §4.13 Alert 的 `.alert--bar` 說明補 `.alert--page-top`／`.alert__meta`／`.alert__dismiss`；design-system.md §4.13 Class API 補 `.alert--bar` + `.alert--page-top` 兩列。
- cache 全站統一 `20260616j`。驗證：`check_ds_sync` 1–4、6 全 PASS（raw-color WARN 既有例外）；events.html 0 未解析 data-i18n、scenario.* 鍵齊全；`.when-data` 空狀態隱藏規則存在、devtools 預設 `no-event`（與原本一致）。視覺待使用者於瀏覽器確認（切 Event Day、✕、切語言、e-shop 低庫存條無回歸）——MCP 瀏覽器被佔用、本機無獨立 playwright，未能自動截圖。

### 權威鏈備註

活動橫幅非 5.1.6 規格功能（呈現層 demo），本次只動 `site/`、未寫回 `documents/`。商店低庫存為 5.1.5 F2 規格功能，僅換定位 class、行為語意不變。

## 2026-06-16 · 建立商品：價格/庫存/規格表拆成獨立區塊，Edition 提到表格前（B 反饋）

**類型：B（反饋）** — 使用者指出原「商品規格卡＋價格庫存卡」兩塊把價格、庫存、逐規格表混在一起，且多規格時「不限量/限量」在表格之後、卻會改變表格欄位（限量多一欄上限），順序反了。佈局調整屬 project-ui-creator 權責，規格 §4（欄位/規則）不變、§5 佈局本為非約束。
- 重組為四個獨立 card：①「商品規格」(單一/多規格切換＋多規格選項建構器) → ②「定價」(單一規格;價格/原價) → ③「庫存」(庫存版本 Edition 置頂＋單一規格在庫欄＋低庫存提醒) → ④「各規格價格與庫存」逐規格表(僅實體+多規格)。
- 逐規格表從 `#cp-var-builder` 內移出、自成 §4 區塊（`#cp-var-table-wrap` 等 ID 不變，JS 靠 ID 定位、邏輯引擎未動）。
- 關鍵修正：庫存版本 Edition 現位於表格「之前」（區塊③在④之上），切不限量/限量即時改變表格的「上限」欄。多規格時②定價隱藏（價格在表格列內，使用者確認此為例外）；低庫存提醒改為單一/多規格皆適用（spec §4.1③ 路線B）。
- 新增空狀態：表格區塊在尚未建任何選項時顯示 `cp.var.empty` 提示。i18n 新增 cp.price.title(定價)/cp.stock.title(庫存)/cp.var.table.title/.sub/cp.var.empty；cp.edition en 由 Inventory 正名為 Edition。0 新元件。
- 驗證（HTML 解析＋顯示邏輯模擬，因瀏覽器被平行 session 佔用無法截圖）：實體單一→商品規格→定價→庫存→取貨；實體多規格→商品規格→庫存(Edition)→逐規格表→取貨（Edition 在表前✓、定價塊隱藏✓）；數位單一→定價→庫存（無規格/無表✓）；關鍵 ID 全在；逐規格表已移出 builder。check_ds_sync 全 PASS。

## 2026-06-16 · 上傳格佔位比例對齊建議尺寸（主圖/附圖改 1:1）（B 反饋）

**類型：B（反饋）** — 使用者指出主圖（建議 800×800）與附圖（600×600）都是 1:1，但佔位框是寬扁長方形，比例不符。於共用元件 upload-tile.css 調整：
- `.upload-tile--hero`：`min-height:150px` → `aspect-ratio:1/1; max-width:320px; min-height:0`。主圖收斂成約 320px 正方形、置左（不做滿版正方形，否則 wizard 內容欄約 760px → 760px 高把表單推遠；使用者選定此「主圖正方形＋附圖一列」方案）。
- `.upload-grid .upload-tile`：`min-height:84px` → `aspect-ratio:1/1; min-height:0`。4 格附圖正方形。
- `--file`（數位下載檔／證書／影片）與 base tile 不變——其他 4 個 consumer（create-event／register-ip／create-project）只用 `--file`，不受影響；`--hero`＋`.upload-grid` 僅 create-product（實用）與 design-system（demo）使用。
- 同步 design-system.html：更新 upload-tile 元件說明（en/zh）標明 hero/grid 為 1:1、圖片佔位對齊建議尺寸。
- 驗證：http create-product 量測 主圖 ratio=1.0、寬 320、與附圖列同左緣(left 238)；附圖 ratio=1.0、寬 174（screenshots/create-product-media-square-20260616.png）。DS demo 用同一 CSS 自動套用（瀏覽器被平行 session 佔用未另截）。check_ds_sync 全 PASS。

## 2026-06-16 · 建立商品即時預覽改常駐側欄、移除開關（B 反饋）

**類型：B（反饋）** — 使用者要預覽側欄預設常駐、不可開關（對齊 spec §4.5「右側欄即時預覽」原始設計意圖；位置形式屬 project-ui-creator）。預覽 preview-panel 是共用元件（create-event／store-settings／e-shop 仍維持可開關），故只在 create-product 這頁改：
- `<body class="preview-open">` + 面板 `class="preview-panel is-open"` 於 markup 預設開（首屏即分割、無滑入動畫）。
- 移除頂部「預覽」開關鈕（`#cp-preview-open`）與面板 header 的「✕」關閉鈕（`data-cp-preview-close`）及 backdrop；移除對應 open/close/Escape JS。預覽內容仍由 `refresh()→renderPreview()` 持續更新。
- 新增頁面區域 RWD：≤760px 無法再壓窄，常駐面板改 `position:static` 靜態堆疊在表單下方（避免固定覆蓋層擋住表單卻沒有關閉鈕）。
- 未動 preview-panel.css 元件本身，0 新元件、0 元件改動。
- 驗證：http create-product 量測 body.preview-open=true、面板 is-open/visible 寬 420 靠右、預覽鈕/✕/backdrop 皆不存在、wizard margin-right=420（表單未被覆蓋、右緣 780 接面板左緣）（screenshots/create-product-preview-permanent-20260616.png）。check_ds_sync 全 PASS。

## 2026-06-16 · 建立流程頂部移除主題切換鈕（C 撤除）

**類型：C（撤除）** — 使用者要求移除建立商品／建立專案／建立活動頂部的日夜（主題）切換鈕。主題仍可由 Cheat Codes（devtools）切換，能力不流失。
- create-product.html：top-actions 原本只剩此鈕 → 移除後留空動作槽（`aria-hidden`），並加頁面區域 CSS `.wizard__top-actions[aria-hidden] { min-width:52px }` 對齊左側「關閉」鈕寬度，使標題維持置中（offset 由 +26px 回到 0）。
- create-project.html：移除鈕，保留「✓ Draft saved」狀態。
- create-event.html：移除鈕，保留「Saved」狀態與 Preview 鈕。
- 未動 theme.js（無 `[data-theme-toggle]` 時不綁定即可）；0 元件改動。
- 驗證：http 三頁 `[data-theme-toggle]` 皆不存在；create-product 標題對表單中心 offset=0、其餘 header 內容（save status／preview）保留（screenshots/create-product-header-no-theme-20260616.png）。check_ds_sync 全 PASS。

## 2026-06-16 · Cheat Codes 換頁不再被關閉（D infra）

**類型：D（基礎設施／開發工具）** — devtools.js 為逐頁載入，面板「開/關」原本只在當頁記憶體（is-open class），換頁即重置成關閉。改為把開啟狀態存 localStorage（key `ztor.devtools.open`）：open()/close() 寫入、新頁掛載後讀回，上一頁開著就自動 open()。注意 var hoisting：OPEN_LS 宣告需置於還原那行之前，否則讀到 undefined。cache 全站 20260616d→e。驗證：http 開 orders 開面板→換到 e-shop 仍自動開；關閉後換到 projects 仍保持關（LS 1↔0 同步）。check_ds_sync 全 PASS。

## 2026-06-16 · Cheat Codes 移除問號、說明常駐、加縮小鈕（D infra）

**類型：D（基礎設施／開發工具）** — (1) 移除 header 的「?」describe 切換鈕；選項說明（.ztd__opt-desc）改為預設常駐（CSS display:block，刪掉 is-describe gating）。(2) header 新增縮小／展開鈕（減號↔向下箭頭）：is-min 時收起 body／foot、面板高度回 auto（蓋掉 resize 存的高度）、只留 header；狀態存 localStorage（key `ztor.devtools.min`）跨頁保持，與開/關狀態同機制。cache 全站 20260616e→f。驗證：http 開面板 → 每個選項都顯示說明、無 describe 鈕、有 minimize 鈕；點縮小 → body display:none、header 仍在、LS=1；換頁到 e-shop 仍保持縮小；展開後說明仍常駐（screenshots/cheatcodes-expanded-desc / -minimized-20260616.png）。check_ds_sync 全 PASS。

## 2026-06-17 · 建立商品補規格缺口：編輯態、入口預設類型、就緒/上架移右欄（A 規格）

**類型：A（規格）** — 依 5.1.5.2 補 R2.1 三個缺口（競標設定除外，仍待上游）。
- **編輯態（§4.5）**：`?edit=1[&name=]` 進入；標題改「編輯 ◯◯／Edit ◯◯」（移除 data-i18n 直接設字）、主動作改「儲存變更 Save changes」（不受就緒 gating、永遠可按）、footer 顯示「刪除 Delete」（紅字 ghost `.cp-delete`，原生 confirm 當 stub→回 e-shop）、footer 就緒 chip 收起。setType 加 `if(!editMode)` 守衛不覆寫主動作；renderReadiness 加編輯態分支。新增 i18n：cp.h1.edit(.pre)／cp.save.changes／cp.delete(.confirm)。
- **入口預設類型（§2.2/§2.3）**：init 讀 `?type=physical|digital|auction`（預設 physical）→ `setType(initType)`；e-shop「Create auction」下拉與 split-button map 由 `#` 改 `create-product.html?type=auction`（連帶讓「從 Auctions 分頁帶預設類型」成立）。
- **就緒檢查＋上架開關移進右側預覽欄（§4.5 右欄＝預覽＋就緒＋上架開關）**：兩段 markup 從表單本體移入 `preview-panel__body`（接在預覽卡後）；JS 靠 ID 定位、邏輯不變。
- 0 元件改動（Delete 為頁面區域 `.cp-delete`；destructive 樣式＋確認 modal 待規格）。記 ASSUMPTIONS PG-011（編輯入口 IA 未定，未改 e-shop 編輯鉛筆路由）、PG-012（刪除確認待補）。
- 驗證（靜態結構＋JS 邏輯，瀏覽器被平行 session 佔用未截圖）：就緒卡/上架開關已在預覽欄、表單本體已移除；Delete 鈕 hidden 在 footer；init 讀 ?type/?edit、編輯態主動作 Save changes、renderReadiness 編輯態啟用、setType 守衛、e-shop 兩處連結→?type=auction 皆確認。check_ds_sync 全 PASS。

## 2026-06-17 · 訂單狀態改 tab、標記出貨 popup、物流商下拉（A 規格）

**類型：A（規格）** — 依使用者裁示修 R2.1 並回寫規格（backup_plan Plan140）。涵蓋 spec 5.1.5.3 §F2、5.1.5.3.1 §2.2/§2.5。
- **orders.html 狀態下拉 → filter-tabs（§F2）**：`<select>` 改成 `.filter-tabs`（7 項 All/Unpaid/Paid/To ship/Shipped/Completed/Refund·dispute，對齊電子商店 F3），搜尋同列（`.orders-filter-row`）。新增前端過濾：每列 `data-order-status`（空白分隔合格 token，一筆可符合多 tab，如 paid+toship）＋ `data-order-text`；tab/搜尋即時過濾。
- **orders 無結果空狀態（§F3／§頁面狀態「查無符合的訂單」）**：新增 `.orders-noresult`（empty-card＋Clear filters），與帳號層級 `.when-empty` 分流；過濾 0 列時顯示。i18n orders.empty.noresult.title/text/clear。（同時補上稽核確認的 5.1.5.3 缺口。）
- **order-detail.html 標記出貨 popup（§2.2/§2.5）**：頂部「Mark shipped」改開 popup（reuse `.payout-modal`/`.payout-dialog` 殼），內容＝原 §2.5 出貨與履約（取貨方式 segmented 預覽＋物流/QR/數位分支）；移除頁面常駐 `#od-fulfil` 區塊。popup 內確認 → 履約 badge 改 已出貨/已領取（QR）並關窗；數位為自動交付、無確認鈕。backdrop/Esc/Cancel 關窗、`.is-modal-open` 鎖背景捲動。
- **物流商下拉＋其他（§2.5）**：Carrier 由自由輸入改 `<select>`（黑貓宅急便／新竹物流／中華郵政／7-ELEVEN 交貨便／全家店到店／宅配通＋其他）；選「其他」顯示自訂物流商輸入欄。i18n od.ful.carrier.ph/other/custom(.ph)/cancel、od.badge.shipped/received。
- 連帶修 od.limit.note 失效引用 §4.5→§4.4 F9（稽核 minor）。0 新元件（filter-tabs／payout-modal 殼為既有共用元件）。
- 驗證：check_ds_sync 全 PASS；靜態結構＋ `node --check` 兩頁 inline JS 語法皆 OK；瀏覽器 runtime 截圖待平行 session 釋放（其全程佔用 Playwright）。

## 2026-06-17 · 電子商店模組稽核補齊（非競標 14 項＋新建組合細節頁）（A 規格）

**類型：A（規格）** — 依 5.1.5.x 稽核補齊 R2.1 非競標落差（競標相關依使用者裁示排除）。
- **create-bundle（5.1.5.4）**：商品搜尋接 input 即時過濾「近期瀏覽」＋無相符顯示 `cb.search.noresult` 引導 New item（§6.6）；建立完成 `cb-create` 導向 `e-shop.html?posted=1&type=bundle` 觸發新品貼文（5.1.5.7 v1.2 全類型皆開）；i18n 全站「套組」→「組合」對齊 spec v1.3。
- **補貨（5.1.5.6）**：Quantity 補必填＊；新增「庫存皆充足」空狀態 `restock.empty`（demo 隱藏）；product-detail 進補貨收斂成當前商品單一品項；e-shop「Mark received」由上架軸 `e-shop.row.active`(Live) 改庫存軸 `e-shop.row.instock`(In stock)（§7.2 不混軸）。
- **新品貼文（5.1.5.7）**：受眾下拉補 At risk／Recovered（沿用 msg.to.risk/recovered）。
- **product-detail（5.1.5.1）**：銷售摘要＋專案引用補空狀態（`.when-data`/`.when-empty`，§2.4/§2.5）；See as fan 由 no-op 接共用 fan-store 分割預覽（§6.7，比照 store-settings；新增 #pd-preview + partials/fan-store.js）。
- **e-shop（5.1.5）**：F2 低庫存橫條補商品名副標（`e-shop.alert.meta`，UIA-023 曾移除、§F2 要求補回）；橫條 CTA 拆成「View low stock」（切 Low Stock filter-tab＋捲動）與「Restock」（開補貨）兩入口（§F2/情境4）。
- **order-detail（5.1.5.3.1）**：金額拆解補跨幣別 demo 列 `od.amt.fx`（原幣/換算幣/匯率/時點，§7.3）。
- **新建 bundle-detail.html（5.1.5.9 組合商品細節頁）**：整頁缺→新建，比照 5.1.5.1 結構承載 §2.1–§2.5（麵包屑／頁首狀態＋See as fan/Save changes/Cancel／組合內容（名稱·成員·定價·限量）／銷售摘要含空狀態／庫存=min(成員)＋成員影響）；See as fan 接 fan-store 預覽；e-shop 兩列 Bundle 的 Edit 鉛筆由 create-bundle.html 改指 bundle-detail.html（create-bundle 維持建立精靈）。
- **未做（已記）**：建立商品「數位內容檔依分類切換」（§4.2 F11）——其分類（音樂/Album/電影/會員卡/其他）不在現有 category select，需先對齊數位次分類（§7.1），屬上游依賴，未自行臆造；競標相關全數依裁示排除。
- 0 新元件（全沿用既有共用元件）。驗證：check_ds_sync 全 PASS、validate_spec OK、六頁 inline JS 通過 `node --check`、五頁＋新頁 HTTP 200；瀏覽器 runtime 截圖待平行 session 釋放 Playwright。

## 2026-06-17 · 競標（拍賣）做完：建立表單 + 拍賣商品細節頁 + e-shop 拍賣清單（A 規格）

**類型：A（規格）** — 補齊先前依裁示排除的競標，對齊 5.1.5.2 §4.3（v4.7）與 5.1.5.8（v1.1）。
- **create-product 拍賣型**：
  - F2：物品狀況由自由輸入改四級下拉（全新／近全新／良好〔預設〕／使用痕跡明顯，D075）；分類改用 §7.1「拍賣物品分類」七項扁平集（服飾〔預設〕／樂器／藝術品／收藏品／設備器材／紀念物／其他，D076）。
  - F8 競標設定（取代 stub）：起標價＊、保留價（選填）、競標時長三選一單選卡（3／5〔預設〕／7 天）、密封終局開關（預設關）＋最低增額 5% 提示。
  - F12 競標資格：Who can bid? segmented 三選一（僅核心圈〔預設〕／超級粉絲以上／全部粉絲）＋讓給下一次 Drop 提示。
  - F4 拍賣出貨：得標者付運費開關（預設開）＋出貨時限下拉（結束後 3／5〔預設〕／7／14 天）。
  - 就緒檢查：Starting price／Duration／Who can bid 由 pending 改真實檢核（時長／資格有預設值故預設達標；起標價需填）。
- **新建 auction-detail.html（5.1.5.8）**：§2.1–§2.7——返回脈絡＋Copy link／Preview；頁首狀態（Live）；競標生命週期三階段（Preview→Open bidding→Result）；物品摘要（分類／狀況／資格 badge＋故事）；競標概況 KPI（目前出價／出價數／出價人數／剩餘時間）；出價活動（All/Open＋出價列＋New highest＋View all＋Reserve met）；拍賣資訊一覽（時長／起訖／密封／資格／起標價／保留價／平台費 10%）＋結標履約入口 → orders。Preview 接 fan-store 分割預覽（§6.7 同源）。
- **e-shop Auctions 分頁**：empty-stub 換成拍賣清單（product-list--auctions，欄＝Image/Item/Category/Current bid/Status/Bids/Shop/Actions），三列示例（Live／Upcoming／Ended）每列 → auction-detail.html；＋New 下拉「Create auction」既已指 create-product.html?type=auction。
- 0 新元件（沿用 selection-card／segmented／switch／card／bento／kpi／data-list／filter-tabs／preview-panel／fan-store）。
- **未做（已記）**：e-shop 狀態 filter-tabs「依類型換選項集」（Auctions 應 All/Live/Sealed/Upcoming/Ended）——需重構共用狀態 nav（影響三分頁、有 regression 風險），列為後續；目前 Auctions 分頁 All 顯示全部、Live 可篩，其餘產品狀態項對拍賣為空。
- 驗證：check_ds_sync 全 PASS、三頁 inline JS 過 node --check、create-product／auction-detail／e-shop HTTP 200；瀏覽器 runtime 截圖待平行 session 釋放 Playwright。

## 2026-06-17 · 建立商品分類對齊 §7.1（次分類）＋數位 F11 內容檔案依分類切換（A 規格）

**類型：A（規格）** — 對齊主規格 §7.1 商品次分類與 5.1.5.2 §4.2 F11（v4.3）。
- **分類（§4.1② / §4.2 F2）**：原單一扁平 select 改為**依類型的次分類 select**——實體＝§7.1 周邊次分類（服飾／配件／海報與印刷／居家生活／書籍／收藏品／音樂(實體)／音樂專輯／文檔／商品）、數位＝§7.1 數位次分類（數位內容／電影／短劇／影集／音樂／音樂專輯／MV／文檔／會員卡／商品）。主分類由商品類型隱含記錄（不另設選擇器，見 ASSUMPTIONS PG-013）。
- **數位 F1 素材拆分（v4.3）**：F1 改為封面＊＋附圖（移除下載檔）；下載檔抽出為獨立 **F11 內容檔案**區塊（置於商品資訊後）。
- **F11 依分類切換上傳格**：數位次分類 select 每項帶 `data-cfile`（music／album／video／membership／other）；切換時 F11 上傳格標題/說明改為對應型別——音樂＝音訊單曲、音樂專輯＝多檔可排序、電影/影集/短劇/MV/文檔＝影片、會員卡＝卡面圖、其他＝任意檔型（會員卡權益機制仍標待補 D071）。
- 0 新元件。新增大量 i18n（cp.psub.*／cp.dsub.*／cp.cfile.*／cp.media.cover-hero）。
- 驗證：check_ds_sync 全 PASS、create-product inline JS 過 node --check、HTTP 200；瀏覽器 runtime 截圖待平行 session 釋放 Playwright。
- 連帶：先前「§4.2 F11 因分類不符而延後」的項目至此補完。

## 2026-06-17 · e-shop 狀態篩選依分頁換選項；修按鈕 [hidden] 漏顯（A 規格＋bug）

**類型：A（規格）** — 補完稽核最後一項 e-shop 狀態篩選per-type，並修一個 runtime 截圖揪出的按鈕顯示 bug。
- **狀態 filter-tabs 依類型換選項集（spec §F3）**：重構成可重建（事件委派＋`renderStatusTabs(type)`）——Products＝全部/已上架/庫存過低/已售完/草稿、Bundles＝全部/已上架/已售完/草稿（去 Low Stock）、Auctions＝全部/競標中/密封中/即將開始/已結束；切類型即重建並重置「全部」、計數隨之重算。「View low stock」入口先切回 Products 再篩。i18n 新增 e-shop.status.sealed/upcoming/ended。
- **修 `.btn[hidden]` 漏顯**：`.btn{display:inline-flex}` 蓋過 `[hidden]`，導致編輯態才該出現的 Delete 在建立態也顯示。button.css 補 `.btn[hidden]{display:none}`（全站按鈕受惠）。runtime 驗證：建立態 Delete 隱藏、編輯態（?edit）顯示。
- 驗證（瀏覽器釋出後實機）：e-shop 切 Products/Bundles/Auctions 狀態選項正確切換、計數正確、auctions 篩 ended=1；create-product 建立態無 Delete、編輯態標題「Edit ◯◯」＋「儲存變更」＋Delete。check_ds_sync 全 PASS。截圖：auction-create-form／auction-detail／eshop-auctions-tab／order-mark-shipped-popup／bundle-detail／orders-filter-tabs（screenshots/*-20260617.png）。

## 2026-06-17 · 建立組合「臨時新增商品」改 popup（嵌入完整建立流程）（B 反饋）

**類型：B（反饋）** — 使用者要求：一般入口（e-shop「Create item」）維持整頁；唯獨在「建立組合」流程中臨時新增商品時改以 popup 顯示，建完直接加回組合清單，不離開組合。
- **沿用完整流程（iframe 嵌入，使用者選定）**：popup 裝的是現有 `create-product.html`，加 `?embed=1` 進入「嵌入態」——同一套表單、驗證、規格、i18n、編輯態，零重複，未來只維護一份。
- **create-product 嵌入態（`?embed=1`）**：隱藏常駐側邊預覽（彈窗無並排空間）；隱藏「競標」類型卡（一物一拍不可入組合，見 ASSUMPTIONS PG-014）；頂部 Close 改 `postMessage('cp:cancel')`；主動作（就緒後）改 `postMessage('cp:created', product)` 回母頁，不導頁。一般入口（無 `?embed`）完全不受影響（已 runtime 回歸：預覽在、競標在、Close 走 history.back）。
- **create-bundle 母頁**：「New item」方塊由 `location.href` 改開 popup（`#cb-add-modal` 內嵌 iframe）；收到 `cp:created` 即把商品做成一列（沿用既有 `pick()` 加入「已選」＋重算組合庫存/省下金額）、關窗；`cp:cancel`／backdrop／Esc 關窗。
- **元件**：payout-modal 新增 `--embed` 變體（近全螢幕、無 head/foot、內嵌 iframe）；已同步 design-system.md 條目。沿用 payout-modal 外殼，0 全新元件檔。新增 i18n（cb.meta.instock／cb.meta.variants／cp.embed.untitled）。
- 驗證（瀏覽器實機）：popup 開啟＝嵌入態正確（無預覽、無競標、僅實體/數位）；模擬 `cp:created` → 組合新增一列（名稱/價格/限量/庫存正確、含移除鈕、摘要重算 30 件＝成員最少）；iframe Close → `cp:cancel` → 關窗＋解鎖＋frame 重置；非嵌入整頁回歸正常。check_ds_sync 全 PASS、兩頁 inline JS 過 node --check。截圖：screenshots/bundle-add-product-popup-20260617.png。

## 2026-06-18 · 建立拍賣拆成獨立流程 create-auction.html；建立商品去拍賣（A 規格）

**類型：A（規格）** — 對齊 spec 同日改版：建立商品 5.1.5.2 v5.0 與建立拍賣 5.1.5.10 v1（D081／Plan142）。拍賣從建立商品流程拆出、獨立成檔；頂部改選「拍賣標的種類」實體／數位／活動（不再是「實體／數位／拍賣」並列）。
- **新建 create-auction.html（5.1.5.10）**：單頁表單。頂部種類三選一（實體／數位／活動，只影響分類與 F6 交付，其餘區塊三種類共用）→ F1 素材（主圖＊＋附圖）→ F2 商品資訊・故事＋物品狀況（名稱＊／故事＊≥50／分類＝所選種類 §7.1 次分類／物品狀況四級**預設全新**）→ F3 真實性（合照＊／來源說明 optional／證書 optional PDF·圖）→ F4 競標設定（起標價＊／保留價 optional／時長 3·5·7＝**5 天預設**／密封終局 toggle 預設關＋5% 最低增額）→ F5 競標資格（核心圈預設／超粉以上／全部）→ F6 交付（實體＝得標者付運費 toggle＋出貨時限；數位＝下載 stub；活動＝入場 stub）→ 商品標籤（拍賣為唯一件，每人限購不適用）。右側常駐預覽「Now fans see it」（拍賣卡）＋就緒檢查「Ready to start auction?」（8 項：Hero／Gallery／Item name／Story≥50／Authenticity photo／Starting price／Duration／Eligibility）。主動作 Start auction、編輯態 Save changes＋Delete。
- **元件**：0 新 DS 元件——全沿用 selection-card／segmented／switch／upload-tile／readiness／preview-card／tag-input／chip／card／input／button；頁面佈局用 page-specific `ca-*`（比照 create-product `cp-*`）。i18n 沿用 `cp.*`＋新增 `ca.*`（種類／活動次分類／交付 stub／就緒檢查／標題）與 5 個 `cp.psub.*`（樂器／藝術品／設備器材／紀念物／限量・簽名品，補齊 §7.1 實體 14 項）。
- **create-product.html 去拍賣（5.1.5.2 v5.0）**：移除拍賣 type 卡、F1 拍賣素材、故事＋物品狀況、真實性、競標設定、競標資格、拍賣出貨、拍賣預覽卡，以及對應 JS（fAName/fAStory/fAStart、auction 就緒分支、duration grid、elig 接線、preview auction 綁定）；只剩實體／數位。舊 `?type=auction` 自動轉址 create-auction.html。
- **入口改線**：e-shop F3「Create auction」下拉項＋Auctions 分頁 split-button 主鈕＋setCreate map 三處由 `create-product.html?type=auction` 改指 `create-auction.html`；sidebar.js E-Shop 子路由比對補 create-auction／auction-detail／bundle-detail。
- **待確認（標 stub，不自創）**：密封終局細則、保留價流標、競標資格門檻百分比、數位/活動交付語意——皆主規格 §8.14；組合是否排除拍賣見 ASSUMPTIONS PG-014。
- 驗證（瀏覽器實機）：create-auction 三種類切換正確（分類＋F6 交付隨種類換、物品狀況預設全新、就緒 8 項、主動作 disabled）；create-product 僅實體／數位、無任何拍賣殘留、`?type=auction`→轉址 create-auction；e-shop 下拉與 Auctions 分頁主鈕皆→create-auction。check_ds_sync 全 PASS、兩頁 inline JS 過 node --check、create-auction 134 個 i18n 鍵全在、全站 cache bump l→m。截圖：screenshots/create-auction-20260618.png。

## 2026-06-18 · PR1 D083:粉絲端陳列排序 商店設定 F3 → 電子商店 F4 末段（A 規格／結構）

**類型：A（規格）** — 對齊 5.1.5.5 v14＋5.1.5 §F4（D083，反轉 D031）：「粉絲端陳列排序（Display Order）」由商店設定移到電子商店、與上／下架同處管理。
- **新元件 `ds-components/order-list.css`**：把商店設定的 `.ss-order*` 拖曳排序清單 promote 成可重用元件、改名 `.order-list*`（`__row/__handle/__thumb/__main/__name/__meta`＋`.order-list-empty`、`.is-dragging/.is-over`）。同步 design-system.html（4.29j demo＋TOC＋元件表列）與 design-system.md 由 check_ds_sync 確認。
- **store-settings.html**：移除「Product display」分頁與整個 `data-ss-panel="display"` 面板（`.ss-order` 清單＋兩空狀態）；設定群組 3→2 分頁（**Payment｜Shipping**），預設 Payment；移除 `.ss-order` 拖曳 JS。`store-settings.css` 移除 `.ss-order*` 規則（已搬至 order-list.css）。
- **e-shop.html**：Products 面板列尾新增「粉絲端陳列排序」section（`.eshop-order-card`，`data-eshop-panel="products"` → 隨 Products 分頁顯隱、只在 Products 出現），含 `.order-list` 拖曳清單（4 列示例）＋兩空狀態（無商品／全下架）；新增 scoped 拖曳 JS（`#eshop-order`）。
- **i18n**：移除孤兒 `store-settings.group.display`／`store-settings.display.*`，新增 `e-shop.order.*`（標題／副標／兩空狀態）。
- 驗證（瀏覽器實機）：store-settings 只剩 Payment｜Shipping 兩分頁、無 display 面板/清單；e-shop Products 尾端排序清單 4 列、拖曳重排可動、切 Bundles 隱藏、回 Products 重現、搜尋不影響該卡；store-settings/e-shop inline JS 過 node --check；check_ds_sync 全 PASS（order-list 已 demo、TOC 76 錨點解析）；全站 cache bump m→n。截圖 screenshots/eshop-display-order-20260618.png。

## 2026-06-18 · PR #4 追加:F4 改單一表格(商品列可拖曳)＋拍賣欄位依狀態＋F6 橫條＋查無符合（A 規格）

**類型：A（規格）** — 對齊 5.1.5 §F4／§87–91／§96／§124–128。承接同一條 PR 分支（PR #4）。
- **F4 修正為單一表格（spec §54/§59/§69）**：撤除 PR1 先前在 Products 下另加的獨立排序清單卡與 `order-list` 元件（已刪 `ds-components/order-list.css`、design-system demo/TOC/表列、i18n `e-shop.order.*`）。改為**商品清單列本身可拖曳重排**（`draggable` 由 JS 設於 `.product-list__row`、避開開關/按鈕/連結起拖、`.is-dragging`/`.is-over` 視覺、列頂加拖曳提示 `e-shop.reorder.hint`），列順序即粉絲端陳列順序。只 Products 分頁可拖（組合/拍賣待確認）。store-settings.css 註記同步更新。
- **拍賣清單欄位依生命週期（§87–91）**：維持單一表格、欄位隨狀態重解——表頭 Current bid→**Bid**、Bids→**Activity**；品名下加**物品狀況·競標資格** meta（`e-shop.aN.meta`，重用 cp.cond./cp.elig. 語意）；Bid＝起標/目前/成交價（`e-shop.a2.bid` From $50）；Activity＝倒數·關注／出價·人數·剩餘／得標·實收（`e-shop.aN.activity`）；Ended+已出貨加 **Shipped** 徽章（`e-shop.astatus.shipped`）；列操作依狀態——Live＝複製連結（link icon）／Upcoming＝編輯／Ended＝追蹤履約（truck → orders.html）。
- **F6 拍賣即時橫條（§124–128）**：Auctions 分頁且有 live 列時顯示（`.eshop-live-banner`，重用 `.alert--bar`），夾在狀態篩選與清單間，含「N auction live」＋重點摘要＋View→ auction-detail；切走分頁即隱藏。重點挑選先取第一筆 live（規則待確認）。
- **查無符合（§96）**：`.eshop-noresult`（沿用 orders `.empty-card` 模式），`applyFilter()` 末段數 active 面板可見列＝0 且有搜尋/篩選條件時顯示；Clear 重置搜尋＋狀態回 All。與帳號層級「無資料」分流。
- **icons.js**：補 `link`、`search-x` 進本地 REGISTRY。
- 0 新元件（重用 alert／empty-card／badge／product-list）。驗證（瀏覽器實機）：商品列可拖曳重排、無獨立排序卡；拍賣三列狀態欄位/ meta/ Shipped/ 列操作正確；F6 橫條僅 Auctions 顯示；查無符合＋Clear 正確;check_ds_sync 全 PASS（order-list 移除後 55 元件、75 TOC 錨點）、e-shop/store-settings inline JS 過 node --check、cache bump n→p。截圖 screenshots/eshop-auctions-f4f6-20260618.png。

## 2026-06-18 · 商品清單每列加可見拖曳握把（grip）（B 反饋）

**類型：B（反饋）** — 使用者要求：每個商品列最前面要有可見的拖曳工具（grip）。
- 商品清單（Products）新增最前一欄拖曳握把 `.product-list__drag`（grip-vertical 圖示），grid 前置 26px 欄、表頭同步加一格（9 欄對齊）；只 Products 有（Bundles/Auctions 排序待確認）。
- 拖曳改由握把發動：`dragstart` 僅當起點在 `.product-list__drag` 內才生效（抓標題/其他欄不會誤拖）；握把 `cursor:grab`、hover 變深；≤760px 隱藏握把。
- 0 新元件、0 新 i18n（grip-vertical 已在 icon registry）。驗證（瀏覽器實機）：4 列皆有握把為首格、表頭/列 9 格對齊、從握把可拖、從標題不可拖；check_ds_sync PASS、e-shop inline JS 過 node --check、cache bump q。截圖 screenshots/eshop-products-drag-handle-20260618.png。

## 2026-06-18 · 修正:商品列拖曳無效（改用 Pointer Events）（D infra/bug）

**類型：D（修正）** — 前一版握把拖曳實際無法拖（使用者回報）。原因：用原生 HTML5 DnD 時 `dragstart` 的 `e.target` 是 draggable 的「列」本身、非握把，故「只允許從握把起拖」的判斷 `e.target.closest('.product-list__drag')` 永遠為 null → 每次都 `preventDefault()` 取消拖曳。
- 改用 **Pointer Events**：`pointerdown` 命中 `.product-list__drag` 才開始（`setPointerCapture`）、`pointermove` 依游標 Y 即時 `insertBefore` 重排、`pointerup/pointercancel` 收尾；移除列上的 `draggable` 屬性與原生 dragstart/dragover/dragend。握把加 `touch-action:none; user-select:none`（觸控/筆可拖、不誤捲動、不選字）。
- 驗證（瀏覽器實機 pointer 拖曳）：抓握把把第 1 列拖到第 3 列，順序確實改變；抓標題/其他欄不啟動拖曳。e-shop inline JS 過 node --check、cache bump r。

## 2026-06-18 · 商品列拖曳的視覺:整列抬起＋移除黑框（B 反饋）

**類型：B（反饋）** — 使用者反饋：看不到「抓起來」的效果、放到目標位置時有醜的黑色內框。
- **拖曳中整列抬起**：`.is-dragging` 由原本 `opacity:0.5` 改為「拿起來」的卡片感——`box-shadow: var(--shadow-popover)`＋`transform: scale(1.012)`＋`z-index:3`＋`background:var(--surface)`＋`border-radius`＋游標 `grabbing`；列加 `transition`（150ms）讓抬起有 pop 感。
- **移除黑色內框提示**：拿掉 `.is-over { box-shadow: inset 0 0 0 2px var(--foreground) }` 與其 JS（不再標記 hover 列）；改靠「其他列即時讓位、被拖的卡片就停在目標位」呈現落點（Notion/Linear 式），不需額外提示框。
- 驗證（瀏覽器實機 pointer 拖曳）：`.is-dragging` 計算樣式有 box-shadow＋transform＋z-index:3；把最後一列拖到第一順位順序確實改變;無殘留 is-over。check_ds_sync PASS、e-shop inline JS 過、cache bump s。截圖 screenshots/eshop-drag-lift-20260618.png。

## 2026-06-18 · 商品列拖曳:被拖的卡片跟著游標移動（B 反饋）

**類型：B（反饋）** — 使用者要求：抓住時被抓的物件要跟著游標一起移動（原本只在格位間「跳」，非平滑跟手）。
- 改為 JS 即時把被拖的列 `translateY` 到游標位置：`pointerdown` 記下抓取點在列內偏移 `grabDY`；`follow(clientY)` 先讓底下清單即時讓位（insertBefore），再把該列還原量到「在流位置」後設 `transform: translateY(clientY−grabDY−natTop) scale(1.01)`，使抓的點黏在游標上、整列跟手移動；放開（pointerup/cancel）清掉 transform 歸位。
- CSS：transform 交給 JS 即時控制，故列的 `transition` 只留 box-shadow（保留抬起 pop），移除 transform transition（否則跟手延遲）；`.is-dragging` 加 `will-change: transform`、移除 CSS 的 scale（由 JS transform 帶）。
- 驗證（瀏覽器實機＋pointer 事件）：拖曳中該列 `transform` 為 `translateY(58px) scale(1.01)`（隨游標變動）、放開後清空；底下清單即時讓位、順序正確改變。check_ds_sync PASS、e-shop inline JS 過、cache bump t。截圖 screenshots/eshop-drag-follow-20260618.png。

## 2026-06-18 · D084 即時／商店預覽改成可開關（建立商品預設開、E-Shop F5 預設關）（A 規格）

**類型：A（spec-derived）** — 對齊今日 spec 改版 **D084**：兩處預覽由「常駐不可關閉」改為「可開關」，預設值相反。

- **建立商品（5.1.5.2 §4.5 v5.1：可開關、預設開啟）** — `create-product.html`：頂部操作槽（原為平衡用空槽）加 Preview 切換鈕（`#cp-preview-toggle`，`eye` 圖示，`aria-pressed`）；預覽面板 head 加 ✕ 關閉鈕；JS 加 開/關/Esc 切換（markup 維持預設開＝`body.preview-open`＋面板 `.is-open`）。≤760px 的「靜態堆疊在表單下方」改成只在 `.is-open` 時套用（關閉時隱藏）。**嵌入態（`?embed=1`，組合 popup）藏掉切換鈕**（該情境無側邊預覽）。
- **E-Shop（5.1.5 F3/F5：可開關、預設關閉）** — `e-shop.html`：F3 工作列「Store settings」後加「Store preview / 商店預覽（See as fan）」切換鈕（`#eshop-preview-toggle`，`eye`，`aria-pressed`）；headerless 預覽加右上角浮動 ✕（`.eshop-preview-close`）；移除 `<body class="preview-open">` 與 markup 的 `.is-open`、移除 JS 中無條件 `add('preview-open')`，改為 開/關/Esc 切換（預設關＝管理區滿版、無接縫陰影）。窄螢幕 sheet 由 `position:static` 改 `relative` 作浮動 ✕ 定位基準。
- 重用既有 `preview-panel` 元件與其切換慣例（auction-detail／bundle-detail／create-event 同一寫法），未動 ds-components；新增的浮動 ✕ 為 e-shop headerless 預覽專屬頁內樣式。i18n 沿用既有鍵（`cp.preview`、`e-shop.btn.preview`、`e-shop.preview.close`），無新增鍵。
- 驗證（Playwright 實機）：E-Shop 預設關（panel/body 皆無 open）→ 鈕開（兩者 open、`aria-pressed=true`）→ ✕ 關 → 重開 → Esc 關，狀態與 `aria-pressed` 同步；建立商品預設開→鈕切換關/開→✕關→Esc；嵌入態切換鈕 `hidden`、面板 `display:none`。check_ds_sync PASS（資產版本一致確認 cache bump 完整）、兩頁 inline JS 過、唯一 console error 為 favicon 404（無關）。cache bump → 20260618a。截圖 screenshots/eshop-preview-closed-20260618.png、eshop-preview-open-20260618.png、create-product-preview-open-20260618.png。

## 2026-06-22 · F3 工作列改 icon＋搜尋收合展開（B 反饋／呈現）

**類型：B（反饋）** — 使用者標註截圖要求：商店設定／商店預覽／搜尋三顆改成 icon 鈕；搜尋移到上排工作列、點擊才展開；樣式向類型／狀態篩選區看齊（去外框、輕量）。spec 5.1.5 F3 明訂工作列圖示／文字與搜尋位置「呈現參考、非約束」，屬 project-ui-creator 範圍、無產品變更。

- **三顆改 icon**：商店設定（sliders-horizontal）、商店預覽（eye）、搜尋（search）由 `.btn--outline`（有框）改 `.btn--icon .btn--sm`（無框 ghost、hover 才上底），與下排 tab／filter 的輕量風格一致；文字改進 `aria-label`＋`title`（tooltip）保留無障礙與提示。
- **搜尋收合／展開**：搜尋自第二排（狀態列）移到上排工作列，預設只見放大鏡 icon；點擊展開 `.field-pill` 輸入（自帶放大鏡＋✕）、寬度滑開並自動聚焦；✕ 或 Esc 收起並清空、點外部且無字時自動收起。展開時放大鏡 toggle 隱藏（任一時刻只露一個放大鏡）。狀態列移除搜尋欄後由 filter-tabs 獨佔整列。
- **i18n.js**：新增 `data-i18n-title` 處理（site-wide，補齊 placeholder／aria-label 之外的 tooltip 在地化）；新增鍵 `e-shop.btn.search`、`e-shop.search.close`。
- 0 新元件（重用 `.btn--icon`／`.field-pill`）；搜尋收合動畫為 e-shop 工作列頁內 composition CSS（`.eshop-search*`），比照 preview toggle 的頁內慣例，未進 ds-components。驗證（Playwright 實機）：收合態三 icon＋Create 分割鈕、狀態列滿版；點放大鏡展開＋聚焦、輸入「Coastline tee」清單收斂為 1 列；✕／Esc／點外部收起。check_ds_sync PASS（55 元件、75 TOC，WARN 為既有 selection-card 例外）、inline JS 過 node --check、cache bump 20260622a→b。截圖 screenshots/eshop-toolbar-collapsed-20260622.jpeg、eshop-toolbar-expanded-20260622.jpeg。

## 2026-06-22 · 類型 tab 由淡橘 pill 改回底線式（B 反饋）

**類型：B（反饋）** — 接續上條工作列調整，使用者要求類型切換（商品／組合／競標）也調整樣式。原本類型 tab 與下排狀態篩選同為「淡橘 pill」、兩排視覺重複。經確認方向：

- **類型 tab → 底線式**：移除 e-shop 類型切換的 `.tabs--brand`（淡橘 pill 變體），回到預設 `.tabs`（active 橘色底線＋其餘灰字 hairline）。
- **狀態篩選 → 維持淡橘 pill**（使用者選擇不變）。兩排自此分層：上排底線 tab（主類型）、下排 pill＋數字（狀態篩選），不再像兩排重複的 pill。
- `.tabs--brand` 變體仍保留在 `ds-components/tabs.css` 與 design-system.html demo（可選用變體）；同步把 DS 說明中「E-Shop 類型切換」改為中性描述（e-shop 已不再使用該變體）。0 新元件、0 新 i18n、無資產內容變動（沿用 cache 20260622b）。驗證（Playwright 亮／暗）：類型 tab 顯示底線（Products 橘底線、其餘灰 hairline）、狀態篩選維持 pill；check_ds_sync PASS。截圖 screenshots/eshop-tabs-underline-light-20260622.jpeg、eshop-tabs-underline-20260622.jpeg。

## 2026-06-22 · 修正:類型 tab 雙底線、狀態篩選改橘色 pill 變體（B 反饋）

**類型：B（反饋）** — 使用者回報：(1) 類型 tab 出現「兩條底線」；(2) 狀態篩選樣式不對（期望淡橘 pill＋橘字＋純數字，非灰 pill＋徽章泡泡）。

- **類型 tab 單一底線**：原本 `.tabs` 自身底線（只在 tab 文字下）＋ `.eshop-list-topbar` 另一條全寬 `border-bottom` 疊成兩條線。改為 topbar `position:relative`、移除其 padding-bottom 與 border-bottom，讓 `.tabs` 佔整行、其底線即唯一區帶分隔線（orange active 段落落在同一條線上）；動作列（icon＋建立）改 `position:absolute` 靠右、浮在線上方。窄螢幕（≤640px）動作列收回流內、置於 tab 下方靠右避免重疊。
- **狀態篩選 → `.filter-tabs--brand` 變體**：base `.filter-tabs` active 是灰底（`--surface-muted`）＋數字徽章泡泡，與目標（淡橘 active＋橘字、數字純文字）不符。**不改 base**（orders、auction-detail 仍用灰底），新增 opt-in 變體 `.filter-tabs--brand`：active 淡 `--primary` 填底＋橘色標籤/數字、`.filter-tabs__count` 去背景泡泡成純文字；只套在 e-shop 狀態列（`nav.filter-tabs.filter-tabs--brand`）。
- 同步 design-system.html（新增 `.filter-tabs--brand` demo＋class table 條目，Do/Don't 改為「base 與 brand 不同頁混用、brand 搭底線 tab」）與 design-system.md。0 新 i18n。驗證（Playwright 亮／暗，computed style）：tab 單一全寬線＋orange active 段；狀態 active＝橘字 rgb(255,163,63)＋淡橘底，count 透明背景＋橘字／灰字、padding 0；check_ds_sync PASS。**cache bump 20260622b→c**（filter-tabs.css 內容變動）。截圖 screenshots/eshop-toolbar-final-light-20260622.jpeg、eshop-toolbar-final-dark-20260622.jpeg。

## 2026-06-22 · 工作列間距、移除拖曳提示、區段留白加大（B 反饋）

**類型：B（反饋）** — 使用者三項微調：

- **動作列與 tab 底線留間距**：`.eshop-list-toolbar__actions` 由 `bottom:1px` 改 `bottom:14px`，icon／建立鈕浮在底線上方留白，不再貼線。
- **移除拖曳文字提示**：刪掉 `.eshop-reorder-hint`（「Drag rows to set the order fans see in your shop.」）元素與其 CSS；拖曳改由每列握把（grip）指示，功能不變（i18n 鍵 `e-shop.reorder.hint` 保留未用）。
- **區段留白加大**：頁首 → 主工作列 → 商品清單三段間距加大——`.eshop-list-controls` 由 `margin-bottom:8px` 改 `margin-top:20px; margin-bottom:24px`（頁首 page-intro 既有 28px 下距不動，故頁首↔工作列 ≈48px、工作列↔清單 ≈24px＋狀態列 sticky padding）。
- 0 元件變動、0 新 i18n、無資產內容變動（沿用 cache 20260622c）。驗證（Playwright 實機，gap 量測）：動作列底距底線 14px；拖曳提示不存在；三段留白加大。check_ds_sync PASS。截圖 screenshots/eshop-spacing-20260622.jpeg。

## 2026-06-22 · 移除頁面描述、主按鈕文字隨主題（白天白／黑夜黑）（B 反饋）

**類型：B（反饋）** — 使用者兩項：

- **移除頁面描述**：刪掉 e-shop 頁首副標 `.page-intro__sub`（「Merch, digital goods…」），只留麵包屑＋H1。僅 e-shop 此頁，i18n 鍵 `e-shop.sub` 保留未用。
- **主按鈕文字隨主題**：`--primary-foreground` 由兩主題同為 `#171717` 改為 **light `#FFFFFF`（白）/ dark `#171717`（黑）**。為 token 變更、**全站所有 `.btn--primary` 一致生效**（非僅 e-shop）。
- ⚠ **對比警告**：白字在淡橘 `--primary` (#ffa33f) 上對比僅 ~1.9:1，低於 WCAG AA（4.5:1）；黑夜黑字 ~9:1 良好。已依使用者明確指示實作，並在 `_tokens.css`、design-system.md 註記為使用者指定例外。
- 同步 `_tokens.css`（light/dark 兩處註記）與 design-system.md 四處 token 表。驗證（Playwright computed style，亮／暗）：主按鈕文字 light=rgb(255,255,255)、dark=rgb(23,23,23)；頁面描述不存在。check_ds_sync PASS。**cache bump 20260622c→d**（_tokens.css 內容變動）。截圖 screenshots/eshop-primary-light-20260622.jpeg、eshop-primary-dark-20260622.jpeg。

## 2026-06-22 · 商品清單列操作收進 kebab（⋯）下拉（B 反饋）

**類型：B（反饋）** — 使用者要求：每列最後的工具改成「三個點點」icon，點下去用下拉選單列出工具。

- **每列改 kebab**：Products／Bundles／Auctions 共 9 列的 `.product-list__actions` 由原本並排 icon 鈕（Edit／Restock／Copy link／Track）改為單一 `more-vertical`（⋮）觸發的 `.dropdown`（重用 dropdown-menu 元件）；點 ⋯ 列出該列工具——低庫存列＝Edit＋Restock、一般商品/組合＝Edit、拍賣 Live＝Copy link／Upcoming＝Edit／Ended＝Track。
- **元件強化**：dropdown-menu.css 新增 `button.dropdown__item`（重置原生按鈕外觀，支援跑 JS 的選單項，如 Restock）；新增 icon `more-vertical` 進 icons.js REGISTRY。
- **頁面 JS**：原生 `<details>` 不自動收，補上「點選單項收起／點外部收起／一次只開一個」（事件委派，亦改善既有 ＋New 分割鈕）。Restock 仍走既有 `[data-eshop-restock]` 委派、開補貨 popup。
- 同步 design-system.html（dropdown demo 加 kebab＋button-item 範例與說明）、design-system.md。i18n 新增 `e-shop.a.more`（More actions／更多操作）。驗證（Playwright 實機）：9 列皆 ⋯、首列選單列出 Edit＋Restock、選 Restock 開 popup＋選單收起、點外部收起、kebab icon 正常渲染。check_ds_sync PASS。**cache bump 20260622d→e**。截圖 screenshots/eshop-kebab-open-20260622.jpeg。

## 2026-06-22 · 商品清單後方資料欄收窄（B 反饋）

**類型：B（反饋）** — 使用者要求把表格後方欄位寬度縮減，右側不要太鬆散。

- Products 清單 grid 後段固定欄收窄：分類 120→88、價格 88→64、狀態 112→96、庫存 88→72、上架開關 72→52（kebab 40 不變）；釋出空間由名稱欄（1.6fr）吸收，右側資料更緊湊。
- 狀態欄保留 96px：實測 zh「庫存過低」徽章 70px < 96px、EN「Low Stock」亦容得下，無溢出。
- 僅 Products 分頁（使用者截圖所示）；Bundles／Auctions 欄組未動（如需一致可再收）。0 元件、0 i18n、無資產內容變動（沿用 cache 20260622e）。驗證（Playwright 量測 EN/zh）：徽章不溢出、欄位收窄。截圖 screenshots/eshop-cols-narrow-20260622.jpeg。

## 2026-06-22 · 上架開關移入列 kebab、改上架/下架商品選單項（B 反饋）

**類型：B（反饋）** — 使用者要求：把清單的「上架開關」移進 kebab 下拉，並依目前上下架狀態顯示「下架商品」（已上架時）或「上架商品」（已下架時）兩種選項。

- **移除上架開關欄**：Products／Bundles／Auctions 三表的 Shop 欄（表頭＋每列 `.switch` 開關）全移除，三組 grid 各少一欄、`.product-list__shop` CSS（含 RWD）一併刪。
- **改為 kebab 選單項**：每列 kebab 新增互斥兩項 `下架商品`(unpublish)／`上架商品`(publish)，以 `[hidden]` 切換顯示反映目前狀態；點下架→狀態徽章改「已隱藏」（存舊徽章還原）、點上架→還原。沿用既有 off=Hidden 邏輯。初始態：8 列已上架（顯示下架商品），拍賣 Ended 列已下架（顯示上架商品）。
- **元件/JS**：dropdown-menu.css 加 `.dropdown__item[hidden]{display:none}`（蓋過 display:block，供狀態互斥項）；i18n 新增 `e-shop.a.publish`／`e-shop.a.unpublish`；改寫 `[data-eshop-shop]` 處理：由 switch 改為選單項 `data-shop-act` 驅動 `setShopState()`。design-system 說明補狀態互斥項用 `[hidden]`。
- 驗證（Playwright 亮色 zh）：無 Shop 欄/表頭；首列選單「下架商品·編輯·補貨」，點下架→徽章「已隱藏」+選單翻成「上架商品」；inline JS 過 node --check、check_ds_sync PASS。**cache bump 20260622e→f**。截圖 screenshots/eshop-shop-in-menu-20260622.jpeg。

## 2026-06-22 · 低庫存提醒改單句公式＋放大 ✕（B 反饋）

**類型：B（反饋）** — 使用者指定文案公式：`x 件商品 ( 商品名稱·最多前三·多的「…」 ) 低於庫存門檻，前往查看。`，並要求末端 ✕ 放大。

- **單句格式**：F2 低庫存條（`#eshop-stock-bar`）原本 title＋sub 兩行＋兩顆 CTA（View low stock／Restock）改為單句——由 JS 依公式組出：件數＋單位＋`( 名稱… )`＋低於庫存門檻＋「前往查看」連結＋句號。名稱最多列前三、超過補「…」；名稱淡色（`.eshop-stock-bar__names`），「前往查看」為底線連結（`.eshop-stock-bar__link`，沿用既有 `data-eshop-view-low` 入口）。移除獨立 Restock CTA（補貨仍在各列 kebab）。
- **放大 ✕**：`#eshop-stock-bar .alert__dismiss` 由 26px/16px 放大為 32px/24px（僅此條，alert--bar 元件未動）。
- **JS**：`data-eshop-view-low` 入口改事件委派（連結為動態組出）；新增組句 IIFE，隨 `i18n:applied` 重建（中英皆正確）。i18n 新增 `e-shop.alert.unit/threshold/goview`；舊 `alert.title/meta/cta-view/cta-restock` 保留未用。
- 驗證（Playwright 中/英）：zh「3 件商品 ( … 海報 ) 低於庫存門檻，前往查看。」、en 對應句；✕ font-size 24px；inline JS 過 node --check、check_ds_sync PASS。**cache bump 20260622f→g**。截圖 screenshots/eshop-lowstock-bar-20260622.jpeg。

## 2026-06-22 · 低庫存名稱再調淡＋上下架改開關列（B 反饋）

**類型：B（反饋）** — 兩項：

- **低庫存名稱顏色**：`.eshop-stock-bar__names` 由 `--foreground-muted` 調淡為 `--foreground-subtle`，商品名稱更退到背景、與前後句對比更明顯。
- **上下架改「開關列」**（使用者選定）：原本互斥兩項「下架商品／上架商品」改為單一選單項——短標籤「在商店上架」＋右側 `.switch`（重用 switch 元件）。switch 位置＝目前狀態、點一下＝切換動作，狀態與動作同框可見。切換時同步狀態徽章（off→已隱藏／on→還原），且**該項點擊不收選單**（`data-keep-open`，看得到 switch 翻動）；其餘選單項與點外部仍照常收起。
- **JS**：`setShopState()` 改驅動 toggle 的 `aria-checked`＋`.switch--on`；點擊以目前 `aria-checked` 反向切換；close-on-item-click 略過 `data-keep-open`。`.dropdown__item--toggle` 為頁內 flex 排版（標籤左／switch 右），組合既有 dropdown＋switch 元件。i18n 新增 `e-shop.a.shoplist`（在商店上架／List in shop）；舊 publish/unpublish 鍵保留未用。
- 驗證（Playwright zh）：選單顯示「在商店上架＋switch(on)／編輯／補貨」；點 toggle→switch off＋徽章「已隱藏」＋選單保持開啟；低庫存名稱套用 `--foreground-subtle`。check_ds_sync PASS、inline JS 過 node --check。**cache bump 20260622g→h**。截圖 screenshots/eshop-shop-toggle-menu-20260622.jpeg。

## 2026-06-22 · 低庫存提醒灰字微調（括號併入＋再調淡）（B 反饋）

**類型：B（反饋）** — 低庫存提醒：(1) 把括號 `( )` 併入灰色 `.eshop-stock-bar__names`（原本括號是深色、只有名稱灰），(2) 灰色再調淡——`.eshop-stock-bar__names` 由 `--foreground-subtle` 改為 `color-mix(in srgb, var(--foreground-subtle) 62%, var(--surface))`（向 surface 混淡、亮/暗皆適用）。僅 e-shop 頁內樣式與組句 JS、無資產內容變動（cache 維持 20260622h）。驗證（Playwright zh）：灰字＝「( … )」含括號、computed color ≈ rgb(168,168,168)。

## 2026-06-22 · 表頭文字調淡＋搜尋移到動作群第一個（B 反饋）

**類型：B（反饋）** — 兩項：

- **欄位名稱（表頭）文字調淡**：新增 `.product-list--eshop .product-list__head { color: color-mix(in srgb, var(--foreground-subtle) 68%, var(--surface)) }`，比基底 `--foreground-subtle` 更淡（三個 e-shop 表共用，亮/暗皆適用）。
- **搜尋放第一個**：`.eshop-list-toolbar__actions` 內把搜尋 `.eshop-search` 移到最前（原 設定/預覽/搜尋 → 搜尋/設定/預覽/建立）；展開/收合/聚焦行為不變（JS 走委派與 querySelector）。
- 僅 e-shop 頁內樣式與 markup 順序、無資產內容變動（cache 維持 20260622h）。驗證（Playwright zh）：動作群順序 search→settings→preview→create、點放大鏡仍展開＋聚焦；表頭 computed color ≈ rgb(160,160,160)。截圖 screenshots/eshop-search-first-20260622.jpeg。

## 2026-06-22 · 低庫存提醒收成內容寬卡片＋狀態 active 底色再淡（B 反饋）

**類型：B（反饋）** — 兩項：

- **低庫存提醒寬度＝內容欄**：原 `.alert--page-top` 為滿版貼齊面板邊；e-shop 加 `#eshop-stock-bar` override——`max-width:1280px; margin-inline:auto; padding-inline:28px`（與 `.page` 同框、置中），改為置中卡片（四角圓 `--radius-lg`、`--shadow-card`、`margin-top:16px`），並收掉貼頂滿版用的補角 `::after`。僅 e-shop（events 情境橫幅仍用滿版 `.alert--page-top`）。
- **狀態 active 底色再淡**：`.filter-tabs--brand .filter-tabs__item--active` 底色由 `--primary 15%` 調為 `9%`（hover 22%→14%），淡橘更收斂。
- 驗證（Playwright zh）：bar 與 `.page` 邊界一致（left 80／right 1360／width 1280）；active 底色 ≈ srgb(1,0.97,0.93)。check_ds_sync PASS。**cache bump 20260622h→i**（filter-tabs.css 內容變動）。截圖 screenshots/eshop-bar-contained-20260622.jpeg。

## 2026-06-22 · 低庫存提醒貼頂（移除上方間距）（B 反饋）

**類型：B（反饋）** — 接上條：低庫存卡仍要 sticky 貼頂、不要上方間距。移除前一版加的 `margin-top:16px`，`#eshop-stock-bar` 維持內容寬置中圓角卡片＋陰影、sticky `top:0` 緊貼 .main 頂（實測 gapAboveBar=0）。僅 e-shop 頁內樣式、無資產內容變動（cache 維持 20260622i）。截圖 screenshots/eshop-bar-pinned-20260622.jpeg。

## 2026-06-22 · 低庫存提醒兩端遮住側邊陰影（B 反饋）

**類型：B（反饋）** — 低庫存卡（內容寬、貼頂、`--shadow-card` 含 6px blur＋1px ring）兩端的側邊陰影/外框要遮掉，只留上下緣。用 `#eshop-stock-bar::before`（左）/`::after`（右）兩塊 `--surface-page`（面板底色）色塊貼在卡片左右端（`right:100%`／`left:100%`、寬 20px、滿高、`z-index:1`）覆蓋側陰影；`.main overflow-x:hidden` 會裁掉溢出。重用原 `.alert--page-top::after`（補角）槽位、改寫為遮罩。僅 e-shop 頁內樣式、無資產內容變動（cache 維持 20260622i）。驗證（Playwright zh）：卡片兩端融入白色面板、無側陰影，上下緣陰影保留、仍貼頂。截圖 screenshots/eshop-bar-masked-20260622.jpeg。

## 2026-06-22 · 通知改扁平（無圓角/外框）＋工作列底線改陰影（B 反饋，對齊 Figma 671-2295）

**類型：B（反饋）** — 參考 Figma node 671-2295：

- **低庫存通知扁平化**：`#eshop-stock-bar` 移除圓角（`border-radius:0`）與外框線（原 `--shadow-card` 含 `0 0 0 1px` ring）；改為單一向下陰影 `0 8px 16px -10px`（無 ring、無側邊外溢）。移除前一版的左右遮罩 `::before/::after`（向下陰影不再側漏，不需遮）；保留 `::after{display:none}` 收掉貼頂補角。維持內容寬、置中、sticky 貼頂。
- **類型工作列底線改陰影**：`.eshop-list-topbar .tabs` 灰色基準底線改透明（保留 active tab 橘色指示線），改在 `.eshop-list-topbar` 加向下陰影 `0 7px 12px -9px` 當分隔，取代原本的灰 hairline。
- 僅 e-shop 頁內樣式、無資產內容變動（cache 維持 20260622i）。驗證（Playwright zh，computed）：bar radius 0／box-shadow 向下無 ring；tabs border-bottom 透明；topbar 向下陰影。截圖 screenshots/eshop-shadows-20260622.jpeg。

## 2026-06-22 · 低庫存通知:補回左右端遮罩消除側邊陰影（B 反饋）

**類型：B（反饋）** — 扁平化後的向下陰影（blur 16/spread -10）仍會在卡片左右端外溢約 6px、底部邊角可見。補回 `#eshop-stock-bar::before/::after` 面板底色遮罩（`right:100%`／`left:100%`、寬 24px、`top:0` 到 `bottom:-18px` 連底部邊角一起蓋、`z-index:2`），只留正下方陰影。僅 e-shop 頁內樣式、無資產內容變動（cache 維持 20260622i）。驗證（Playwright zh）：卡片左右端融入白色、無側邊陰影，底部陰影保留。截圖 screenshots/eshop-bar-masked2-20260622.jpeg。

## 2026-06-22 · 工作列→狀態篩選間距對齊 Figma（8px）（B 反饋）

**類型：B（反饋）** — 依 Figma node 671:2309（工作列）→ 671:2338（狀態篩選列）的 8px 間距，`.eshop-list-topbar` margin-bottom 由 16px 改 8px。僅 e-shop 頁內樣式、無資產內容變動（cache 維持 20260622i）。驗證（Playwright 量測）：工作列底→狀態列頂 gap=8px。

## 2026-06-22 · 陰影參數對齊 Figma（工作列＋低庫存提醒）（B 反饋）

**類型：B（反饋）** — 使用者提供 Figma drop shadow 精確參數（兩者相同）：X0 Y2、Blur16、Spread0、#000000 8%。
- `.eshop-list-topbar`（清單工作列）與 `#eshop-stock-bar`（低庫存提醒）box-shadow 統一改為 `0 2px 16px 0 rgba(0,0,0,0.08)`。
- 低庫存左右遮罩（`::before/::after` 24px）仍蓋住 16px blur 的側邊外溢，只留下方陰影。
- 僅 e-shop 頁內樣式、無資產內容變動（cache 維持 20260622i）。驗證（Playwright computed）：兩處 box-shadow＝rgba(0,0,0,0.08) 0 2px 16px 0。截圖 screenshots/eshop-figma-shadows-20260622.jpeg。

## 2026-06-22 · 修正:工作列陰影改向下、不外溢（B 反饋）

**類型：B（修正）** — 前一版把工作列 box-shadow 套成 Figma 字面值 `0 2px 16px spread0`，但 spread 0＋blur 16 會往左右與上方外溢、整條工作列像浮框（低庫存有遮罩擋住，工作列沒有）。改為 `0 9px 16px -12px rgba(0,0,0,0.08)`：保留 blur 16／#000 8% 的柔度，用負 spread 抵銷側／上外溢，只留正下方分隔陰影（對齊使用者第二張「正確」圖）。低庫存維持 `0 2px 16px spread0`＋左右遮罩不變。僅 e-shop 頁內樣式、無資產內容變動（cache 維持 20260622i）。

## 2026-06-22 · 已選 tab 底線縮短為文字寬（B 反饋，對齊 Figma 671-2337）

**類型：B（反饋）** — e-shop 類型 tab 的 active 底線原為滿版 item 寬（border-bottom），改為置中短線：`.eshop-list-topbar .tabs__item--active` border 透明、改用 `::after`（left/right 各內縮 12px、height 2px、`--primary`、radius 2px），底線約等於文字寬。僅 e-shop 範圍，DS `.tabs` 預設（滿版底線）不變。驗證（Playwright）：tab 55px／文字 27px／底線約 31px。截圖 screenshots/eshop-tab-underline-20260622.jpeg。

## 2026-06-22 · 中文 Noto Sans TC 改為自架（字型基礎建設）（D 基礎）

**類型：D（基礎建設）** — 修正「中文宣告 Noto Sans TC、但實際靠觀看者系統有無安裝」的隱性破綻。先前無 `@font-face`、fonts/ 也無 Noto woff2，跨機器中文會 fallback 到 PingFang（macOS）／JhengHei（Windows），不是統一的 Noto。

- 抓 Noto Sans TC variable 原檔（11.9MB，wght 100–900），用 `pyftsubset` 只保留站內 html/js/css 實際用到的 1,249 個中文/全形字 → `fonts/NotoSansTC-subset.woff2`（384KB、variable、wght 100–900）。
- `ds-components/fonts.css` 新增 `@font-face`（family `Noto Sans TC`、`font-weight:100 900`、`font-display:swap`、`unicode-range` 釘在 CJK 區段，讓拉丁仍走 Geist/Inter，無 metric 干擾）。
- 既有 cascade 不動：`shared.css :lang(zh-Hant)` 仍把 Noto 放第一、`fonts.css :root` 放 fallback；現在兩者都指向已自架的實體字。
- 刪除 fonts/ 內已無人引用的舊字 `TaipeiSansTCBeta-*.ttf`（3 檔、約 60MB）。
- 已知 1 字例外：earnings.html「支払調書」的「払」是日文漢字，Noto Sans TC 無此字，per-glyph fallback（其餘 1,248 字全覆蓋）。新增大量中文 copy 後需重跑 subset（指令記在 fonts.css 註解）。
- cache buster 全站統一 bump 到 `?v=20260622j`（順手補回 shared.css 5 條 `@import` 仍停在 `?v=...a` 的殘留）。
- 驗證（Playwright，本機 http）：`document.fonts` 顯示 `Noto Sans TC` status=loaded／weight 100 900；zh-Hant 模式 computed font-family＝`"Noto Sans TC", Inter, …`（Noto 第一）；`document.fonts.check` 對實際中文字串回傳 true。`check_ds_sync.py` PASS（WARN 為 selection-card 既有例外）。

## 2026-06-22 · 建立商品頁調整＋wizard 頂部欄固定（展示它並排／規格鈕／商品資訊標題／footer 還原／header sticky）（B 反饋）

**類型：B（反饋）** — create-product.html 依使用者反饋調整：
- **「展示它」改並排版型**：主圖（左）與 4 張附圖（右）並排成兩等寬欄，附圖排 2×2、總高度對齊 1:1 主圖；窄於 880px 收回主圖在上、附圖 4 格在下。promote 成共用 helper `.upload-showcase` + `.upload-grid--2x2`（進 `ds-components/upload-tile.css`），實體與數位兩型同步套用，並同步 design-system.html demo＋design-system.md。
- **「新增規格」改按鈕樣式**：`#cp-add-spec` 由 `btn--ghost`（看起來像純文字）改 `btn--outline`（1px 外框），並 `align-self:flex-start` 收成內容寬度的獨立按鈕（不再撐滿像輸入框）。
- **「商品資訊」區塊補標題**：§4② 區塊原本沒有區塊標題、直接接商品名稱欄；補上 `.cp-section__head` 標題「商品資訊／Product info」（新增 i18n `cp.info.title`）。
- **footer 還原為 fixed**：移除先前 Figma 擷取殘留的 `<style id="figma-cap-fix">`（曾把 `.wizard__bottom` 強制 `position:static`，導致主動作列掉到頁面最底）與 capture.js script，footer 回到貼視窗底部的 `position:fixed`。
- **wizard 頂部操作欄固定**（共用框架）：`.wizard__top`（shared.css）加 `position:sticky; top:0; z-index:30`，捲動時 header 不再消失，與底部 footer 對稱。屬共用 wizard 框架，所有 create/wizard 頁（create-product／create-project／create-auction／create-event／create-bundle／register-ip…）一致套用。
- 全站 cache buster 統一 bump `?v=20260622j` → `?v=20260622k`（shared.css／upload-tile.css／i18n.js 等改動需讓已快取使用者重新抓）。驗證（Playwright zh，1440×900）：footer 貼底、header 捲動後 top:0 sticky（create-product 與 create-project 皆確認）；展示它主圖＋2×2 並排；商品資訊標題顯示；新增規格鈕 outline、寬 84px。check_ds_sync.py PASS（WARN 為 selection-card 既有例外）。

## 2026-06-22 · 建立商品：就緒檢查改 footer chip tooltip＋稍後再存移到 header（B 反饋）

**類型：B（反饋）** — create-product.html 依使用者裁示調整 §4.5 右欄與底部操作列（記 ASSUMPTIONS UIA-027；屬呈現選擇、產品能力不變）：
- **就緒檢查（Ready to sell?）改為 chip 的 hover／focus tooltip**：移除右側預覽欄常駐的 `#cp-readiness` 卡，內容（標題／清單／banner）搬進 footer chip 內的 `.cp-ready-pop`，hover 或鍵盤 focus 時於 chip 上方浮出（footer 在底部，往上開、`--shadow-popover`＋小箭頭）。沿用 `.readiness` 元件（ID 不變，`renderReadiness` 照填）；右欄只剩商品卡＋上架開關。
- **footer 計數 chip 文案雙語＋計數**：原 hardcoded「X to go」改 i18n `cp.ready.chip.togo`（zh「剩餘 {n} 項未完成」／en「{n} to go」），ready／skip 態與 banner 一併 i18n（`cp.ready.chip.ready`／`.skip`、`cp.ready.banner.ready`／`.needed`）。新增 `i18n:applied` 監聽，切語言即時重算 chip／tooltip／預覽文字。chip 標題改走 `T('cp.ready.title')`（zh「可以上架了嗎？」）。
- **「稍後再存」移到 header**：由 footer 左側移到頂部操作欄、預覽鈕左側（`btn--ghost btn--sm`）；footer 移除左鈕、改 `justify-content:flex-end`，只留就緒 chip＋主動作。
- chip／tooltip 樣式（`.cp-ready-chip` position＋`.cp-ready-pop`）放 create-product 頁內 `<style>`（沿用既有 `cp-` 頁級前綴慣例，未 promote）。就緒檢查項目標籤仍英文（沿用原右欄，未翻譯）。
- 全站 cache buster bump `?v=20260622k` → `?v=20260622l`。驗證（Playwright zh）：header＝稍後再存｜預覽；chip＝「剩餘 7 項未完成」；hover chip 浮出「可以上架了嗎？」＋7 項清單＋「還差 7 項才能開始販售」；右欄無就緒卡；footer 右對齊。check_ds_sync.py PASS（WARN 為 selection-card 既有例外）。

## 2026-06-22 · 低庫存通知陰影兩端漸層淡出（B 反饋 · 5.1.5 F · e-shop）

- 範圍：`e-shop.html` 內 `#eshop-stock-bar` 分隔陰影改寫（僅頁面 `<style>`，不動共用資產、不 bump cache）。
- 動機：使用者要陰影「往左右兩端漸變消失」，取代原本用面板底色實色塊「硬蓋」側邊外溢造成的硬切邊。
- 作法：分隔陰影不再用 `box-shadow`（box-shadow 畫在邊框框外，會被 `mask` 整個裁掉、實測陰影全消）。改成卡片正下方一條 `::after` 漸層帶（`top:100%; height:16px; linear-gradient(to bottom, rgba(0,0,0,.11), transparent)`），再疊水平 `mask-image: linear-gradient(to right, transparent, #000 16%, #000 84%, transparent)` 讓兩端淡出。移除舊的 `::before`／`::after` 實色側遮罩。
- 驗證：Playwright 截圖確認陰影中段明顯、左右兩端漸變消失、無硬切邊；中英排版未受影響。

## 2026-06-23 · product-list E-Shop 欄位版型 promote 進元件＋DS 補 bundles live demo（D 治理）

**類型：D（治理／元件同步）** — 稽核 E-Shop 用到的元件是否都同步在 design system。結果：23 支 ds-components 全數已 link＋有 demo＋md 有條目（check_ds_sync PASS）。唯一缺口＝product-list 的 E-Shop 分頁欄位版型只記了 `--eshop`、且 `--bundles`／`--auctions` 的 CSS 還寫在 e-shop 頁 `<style>`（DS 無法同源 demo）。依使用者裁示走完整 promote：
- **promote 進元件**：`.product-list--eshop`／`--bundles`／`--auctions` 的欄位 grid＋欄色＋auctions activity/status＋`--eshop` 760px 重排，由 `e-shop.html` `<style>` 移進 `ds-components/product-list.css`（單一來源）。e-shop 頁僅留**頁級行為**（拖曳重排、篩空 `is-filtered-empty`、分頁切換、列 kebab、橫條），改用元件 class、不再自帶版型 CSS。
- **DS 同源 demo**：`design-system.html` product-list（§4.27）新增 `--bundles` **live demo**（Image/Bundle/Members/Bundle price/Status/Stock，真實渲染 7 欄），Class API 列出三變體欄位並改註「在 product-list.css」。`design-system.md` Variants 同步改為「在 product-list.css」、補 `--bundles`／`--auctions`、並註明頁級行為留 e-shop.html。
- e-shop-test.html（scratch、非正式頁）未動：仍自帶 inline 副本＋link product-list.css，規則相同不影響。
- 全站 cache buster bump `?v=20260623b` → `?v=20260623c`（product-list.css 內容變動）。驗證（Playwright）：DS bundles demo 可見時解析 7 欄、規則來源＝product-list.css；e-shop products 8 欄、bundles/auctions 規則同源。check_ds_sync.py PASS（WARN 為 selection-card 既有例外）。

## 2026-06-23 · 建立流程 header v2 + 漸層進度條 + 儲存/離開機制（B 反饋 · §5.2.4 / 5.1.5.2·5.1.5.4·5.1.4.1·5.1.2/活動）

- 範圍：6 個建立流程頁（create-product／create-auction／create-bundle／create-event／create-project／register-ip）＋ `shared.css`＋新 `ds-components/progress-stepper.css`＋新 `partials/wizard-chrome.js`＋`_tokens.css`（`--gradient-brand`）＋ i18n。DS：design-system.html／.md 收錄 Progress stepper（4.35）、Wizard frame 條目更新。
- 動機：使用者依參考截圖統一建立流程 header，並補齊儲存狀態與返回離開確認。

### A. Header v2（單列、無底線）
- `.wizard__top` 去 `border-bottom`；`.wizard__top-bar` 改 grid `1fr minmax(0,820px) 1fr`：左＝`.wizard__top-lead`（返回箭頭 `.wizard__back`＝chevron-left，取代「✕ Close」文字）＋標題/副標靠左堆疊（箭頭對齊主標題行）；中＝進度條（有 stepper 頁，內容寬置中、對齊 `.wizard__body`；無 stepper 頁此欄空）；右＝`.wizard__top-actions`（自動儲存狀態＋預覽）。
- 標題加大一級（`--fs-14`→`--fs-16`），副標 `--fs-13`；header 上下 padding 14→20px；自動儲存↔預覽間距加大（+12px）。
- content 區底色＝`--surface`（`.wizard`）；footer＝`--surface-shell`（`.wizard__bottom`）。

### B. Progress stepper（取代數字 stepper）
- 新元件 `.progress-stepper`：細軌＋品牌漸層填充（`--gradient-brand`，`--progress` 驅動）＋下方步驟標籤（default／`--current`／`--done` 可回點）。寬度＝內容欄寬、對齊下方內容。
- create-event／register-ip／create-project 由舊 `.stepper`（數字圓圈）遷移；create-project 的動態建構 JS 改吐 `.progress-stepper` 標記；舊 `.stepper` CSS 退役。

### C. 儲存狀態 + 返回離開確認（`partials/wizard-chrome.js`，全 6 頁共用）
- 儲存狀態兩態：已儲存（綠點）／儲存中…（轉圈）；全頁 autosave（任何輸入→短暫儲存中→已儲存，前端示意）。fallback：`.wizard[data-autosave="false"]` 時渲染成可點手動「儲存」鈕。
- 返回（`[data-wizard-back]`）攔截：編輯過→彈窗「儲存並離開／不儲存就離開」（取消＝右上 ✕）；未編輯過→彈窗「離開」（取消＝✕）。彈窗共用 `.wizard-leave`（由 partial 注入）。create-project 舊 `confirm()` 關閉流程已移除改用本機制。
- 屬產品行為（未存離開提示原列待確認），記 ASSUMPTIONS **UIA-028**（前端 demo、未寫回 documents/、autosave 節流/失敗態/持久化待上游）。

### 收尾
- 全站 cache token bump `?v=20260623c`（共用資產同版本）。check_ds_sync PASS（WARN＝selection-card 既有例外，已註記）。i18n 新增 `wiz.cancel/savebtn/duplicate/delete/saving/leave.*`、各頁 `*.subtitle`／`ri.h1`／`cpp.h1`。
- 驗證（Playwright）：6 頁 header 版型一致；進度條切步推進（如 create-event 第 3 步 60%）；儲存狀態 saving→saved；返回彈窗編輯/未編輯兩變體；無 JS error（僅 favicon 404）。

## 2026-06-24 · 建立流程 content↔footer 交界：content 圓角＋footer 平面（B 反饋 · §5.2.4）

- 範圍：`shared.css` `.wizard__bottom`（6 頁共用）。
- 動機：使用者提供截圖——交界處 content 要有圓角、footer 要平面無陰影。
- 作法：footer 去掉舊的 `box-shadow: 0 -2px 6px` 與 `border-top`（改平面灰 `--surface-shell`）；交界圓角＋陰影改由 `.wizard__bottom::before` 白色圓角卡承擔——貼在 footer 上緣、往下壓進 `--radius-shell`（28px）使圓角內側露出灰底，並向下投影到平面灰 footer，視覺＝白 content 在交界有圓角、浮在平面灰 footer 之上。
- 收尾：cache token 全站 bump `?v=20260623d`；check_ds_sync PASS（WARN＝selection-card 既有例外）。Playwright 驗證 6 頁交界：footer 平面無陰影／無框線、白卡圓角 28px、灰底鏤空、向下陰影。

## 2026-06-24 · 建立流程 header 一致化 + footer 高度（B 反饋 · §5.2.4）

- 範圍：`create-product.html`、`partials/wizard-chrome.js`、`shared.css`、i18n。
- 動機：使用者指出無 stepper 的 header 與有 stepper 的不一致，應比照有 stepper 的；且 footer 高度仍不足。
- 改：①create-product 的 Preview 鈕 `data-i18n` 原掛在 `<button>` 上，i18n 會以 textContent 覆蓋、把 `<i data-lucide="eye">` icon 洗掉——改成 icon＋`<span data-i18n>`，恢復標準 16×16 `.ztor-icon` eye（與 create-event 一致）。②共用儲存狀態文案由「已儲存」改「已儲存 · 剛剛」（新增 `wiz.saved.now`，partial 套用）＝對齊 create-event 的 `.ce-save-status`，6 頁一致。③footer 上方 padding 由 radius+2 提高到 radius+12、下 14→18，白卡壓進後灰底仍有正常高度、主動作不被擠壓（81→95px）。
- 收尾：cache `?v=20260623f`；check_ds_sync 版本一致 PASS。

- 追加（同日）：Preview 鈕由 `btn--outline btn--sm`（30px/fs-12）改為標準 `btn--outline`（37px/fs-13）＝對齊標準 `.btn` 元件規格（與 footer 主動作同高）；create-product／create-event 兩頁同步。cache `?v=20260623g`。

## 2026-06-24 · 建立流程框架 v3：content sheet 卡＋平面 footer（結構修正，B 反饋 · §5.2.4）

- 範圍：`shared.css`、`ds-components/preview-panel.css`、6 個建立頁（新增 `.wizard__sheet` 包住 header+body）。
- 動機：使用者指出前一版「content 的圓角其實做在 footer 的 `::before` 白卡上」結構錯位（圓角語意該歸 content）。改成對齊本站 `.main`「灰 canvas 上白色圓角卡」語言。
- 結構：`.wizard`＝灰 canvas（`--surface-shell`，滿版固定高、不捲）；新 `.wizard__sheet`＝白色 content 卡（`overflow-y:auto` 內部捲動、`border-radius` 下緣 28px、向下投影、圓角誠實歸自己）；`.wizard__bottom`＝其下 in-flow 平面灰 footer（移除 `position:fixed`、移除 `::before` 白卡 hack、移除補償 padding）。header 維持 sticky（改黏在 sheet 內捲容器頂端）。
- 連帶：`.wizard__body` 去掉為 fixed footer 預留的 140px 底距；preview-panel.css 移除對 footer 的 `right:preview-w`（footer 已 in-flow、隨 `.wizard` margin-right 一起讓位）；新增 ≤900px fallback（回文件捲動、footer sticky、不做圓角）。
- 驗證（Playwright）：6 頁 sheet+footer 結構正確、圓角 28px 歸 sheet、footer 平面 in-flow；內部捲動下 reveal.js 仍逐步顯示（無卡死隱藏）、sticky header 黏頂、返回離開彈窗正常、preview 面板（create-product/event）版位正確、JS 建構 stepper（create-project）正常。cache `?v=20260623h`。

## 2026-06-24 · 建立商品改無卡片表單版面（B 反饋 · 5.1.5.2）

- 範圍：`create-product.html`（頁內 `<style>` 的 `.cp-section` 與 section class；只動排版，不動 token／元件）。
- 動機：使用者要表單改 Whop 風的無卡片版面。
- 改：①六個 `<section class="card cp-section">` 去掉 `card` → 無卡片，改用「區段標題放大（fs-15→fs-22, font-display）＋灰副標（fs-14）＋區段分隔線（`.cp-section + .cp-section` 上框）＋上下 44px 寬鬆留白」。②`field__label` 在此頁無卡情境放大（fs-12→fs-15、medium→semibold）、`.field` gap 6→8px。③控件**完全沿用原元件**（selection-card／input／select／segmented／switch／upload-tile），型別選擇卡＝原 `.selection-card`（橘環＋淡底，無自訂粗框）。
- 過程：先做 `nocard-form-test.html` 測試頁給使用者確認方向（已依指示刪除）。
- 待辦：其餘 5 個建立頁（create-auction/-bundle/-event/-project/register-ip，section class 各為 ca-/cb-/ce-…）之後逐頁比照。
- 驗證（Playwright）：6 區段無卡、標題 fs-22、label fs-15/600、分隔線與 44px 間距、控件原樣、preview 面板正常。cache `?v=20260623i`。

- 追加（同日）：欄位內間距收緊——label 正下方描述貼近標題、input 正下方計數貼近 input（`.field__label + .field__hint` margin-top:-5px／`.field__hint:last-child` margin-top:-4px，並移除原欄位 inline margin hack）；「新增規格」鈕由 `btn--sm` 改標準 `btn--outline`（37px）。cache `?v=20260623j`。

## 2026-06-24 · 建立商品 5 項表單改版（B 反饋 · 5.1.5.2，僅 create-product、scope 本頁）

- 動機：使用者依參考圖（Whop 風）指定 5 項。範圍只 create-product，元件層改動先以頁內 override scope 本頁（不動全站元件/token）。
1. **即時預覽改表單旁 sticky 常駐**：`.wizard__body` 改兩欄（`.cp-form-col` 表單／`.cp-preview-col` 預覽，352px，`position:sticky`），表單欄縮窄；移除頂部「預覽」切換鈕與其開關（預覽常駐）；舊右側滑出 `.preview-panel` 改成 inline 欄（保留 `.preview-card`／`#cp-pv-*` ID，refresh JS 照更新）；窄螢幕（≤1040px）預覽堆到表單下方；embed 模式隱藏預覽欄、回單欄。
2. **型別選擇卡**：加 icon（實體=package／數位=download）、置中；**已選改成只有橘色外框、無半透明底色**（本頁 `.selection-card--active` override）。
3. **單一/多規格、不限量/限量**：`.segmented` 加 `.cp-radio-cards` → 兩張並排 radio 卡（label＋radio 圈，已選＝橘框＋橘點）；JS 不變（仍 toggle `segmented__btn--active`）。
4. **低庫存提醒開關**：`.cp-switch-row` 改成有外框的一條 row（左 label 右 switch）。
5. **media 上傳框（主圖/封面）**：換檔案堆疊 inline SVG icon、加「拖放或點擊瀏覽」副標＋格式/大小（`cp.media.dnd`／`cp.media.formats` i18n）。
- 驗證（Playwright）：無 JS error；預覽 sticky 隨捲動留原地；型別卡 icon＋外框已選；radio 卡點擊 active 正常；toggle row；上傳框新樣式。cache `?v=20260623k`。check_ds_sync PASS。
- 待辦：其餘 5 建立頁之後比照（含是否把選擇卡已選/upload 樣式上升為全站元件，待使用者定）。

- 追加（同日）：型別卡再修——icon 統一灰色（不隨 hover/已選換色）、已選外框 2px→1.5px；商品類型獨立成 `.cp-section`（加標題「商品類型」＋副標），與「展示它」間因此有分隔線。新增 `cp.type.title`／`cp.type.sub`。cache `?v=20260623l`。

## 2026-06-24 · 建立商品 6 項微調（B 反饋 · 5.1.5.2，僅 create-product）

1. 每人限購 row 改成有外框的 toggle row（`.cp-show-row` 加外框盒，與「庫存快不夠時提醒我」一致；上架開關同步變外框）。
2. 不限量/限量 radio 卡內加描述（`.cp-rc-text`／`-title`／`-sub`）：不限量＝「可隨時補貨…」、限量＝其 hint；移除原本獨立的 `#cp-edition-hint`（其 JS 已有 null guard、留作無作用）。
3. 預覽欄標題「買家在 Ztor 看到的樣子」字級對齊區段標題（fs-16→fs-22 font-display）。
4. content 寬縮：`.wizard__body` max-width 1160→1000、預覽欄 352→320。
5. 附圖（2×2）每格內加「最小 600 x 600px」hint，移除外部 hint。
6. 取貨方式（物流配送/現場 QR 領取）segmented 補上 `.cp-radio-cards`（之前漏改）。
- 驗證（Playwright）：6 項皆如圖；無 JS error。cache `?v=20260623m`。check_ds_sync PASS。

## 2026-06-24 · 建立商品字級對齊 DSS type role + input label 字重（B 反饋 · 5.1.5.2）

- 稽核：create-product 的字級全為 Foundation token（fs-12/13/14/15 皆核心元件在用、屬規範內）；唯一偏離＝區段/預覽標題用了 `font-display`＋`fw-semibold`＋fs-22（title 級字本該走 `font-ui` 的 title role）。
- 改：①`.cp-section__title`／`.cp-preview-col__title` 改用 **DSS title-24（h4）角色**（`--type-title-24-*`：font-ui／24px／medium／-0.48px），不再用 display 字體與 semibold。②`.cp-section .field__label`（input 標題）字重由 semibold 降一級為 **medium**＝對齊 **label-15 角色**（fs-15／medium）。input 框本身已是 regular(400)。
- 驗證：section/preview title＝24px/500/font-ui；field label＝15px/500；input＝14px/400。cache `?v=20260623n`。check_ds_sync PASS。

## 2026-06-24 · 建立商品標題 20px／input label 14px／sticky 預覽修正（B 反饋 · 5.1.5.2）

- 改：①區段/預覽標題由 title-24 改 **20px**（沿用 title role 的 font-ui／medium／tracking，但字級降為新加的 `--fs-20`，介於 fs-18 與 fs-22）；新增 `--fs-20:20px` token（`_tokens.css`）。②input 標題（`.cp-section .field__label`）由 fs-15 改 **fs-14**（仍 medium）。③sticky 預覽欄「買家在 Ztor 看到的樣子」滾動時會往上滑——因 `top:4px` 黏在 80px sticky header 後面、從自然位 120px 滑到 4px；改 `.cp-preview-col { top:120px }`（＝header 80＋body padding 40，零位移）後完全黏在原地。
- 驗證（Playwright）：section/preview title＝20px；field label＝14px/500；捲動時預覽欄固定不位移。

## 2026-06-24 · 建立商品 4 項微調（B 反饋 · 5.1.5.2）

1. **已選卡＝未選盒＋橘線疊加**：型別卡／規格 radio 卡／低庫存 toggle 的 `--active` 由「換底色」改成「保留原 `--shadow-card` 卡面 ＋ 疊一圈橘色外環」（`box-shadow: var(--shadow-card), 0 0 0 Npx var(--primary)`；型別卡 1.5px、radio 卡 2px）。
2. **多規格建構器補間距 ＋ 新增選項改按鈕**：`#cp-var-builder` 加 `margin-top:16px`（原本緊貼上方 radio 卡）；`#cp-add-option` 由 `btn--ghost btn--sm` 改標準 `btn--outline`（37px，`align-self:flex-start`）。
3. **庫存版本標題移除 ＋ 限量描述縮一行**：刪掉「庫存版本」`field__label`（直接從「庫存」區段標題接 不限量/限量 radio 卡）；`cp.edition.limited-hint` 中英都縮成一行（en「Hard cap — fans see how many remain.」／zh「設定總量上限，看得到還剩幾件。」）。
4. **欄位間距加大**：`.cp-section .field` `margin-bottom` 26px（input↔input 之間原本太擠）、gap 8px。
- 驗證（Playwright zh）：四項皆如圖；無 JS error；sticky 預覽仍固定。cache `?v=20260624a`。check_ds_sync PASS（唯一 WARN＝selection-card.css:83-85 已註記例外）。

- 追加（同日）：建立商品全頁 input 標題（`.cp-section .field__label`，共 17 個：商品名稱／描述／分類／規格／價格／庫存／運送…）字重由 medium(500) 再降一級為 **regular(400)**。依使用者「整頁相同類型都要改」。區段標題（`.cp-section__title`，20px medium）屬不同類型、不動。驗證：17 個 label 單一字重 400。cache `?v=20260624b`。

- 追加（同日）：①`.wizard__body` 上內距 40→**16**（頁內 override，不動全域 shared.css 的 `40px 28px 56px`，其餘 5 建立頁不受影響）。②`.cp-section__title` 字級 20→**18**（`--fs-18`）；`.cp-preview-col__title` 同步 18 維持「預覽標題＝區段標題」一致。③sticky 預覽 `top` 隨上內距變動由 120→**96**（＝header 80＋padding 16），實測捲動零位移。cache `?v=20260624c`。

- 追加（同日）：①欄位內間距統一 **4px**——`.cp-section .field` gap 8→4，並移除先前 label↔描述／input↔計數的負 margin hack（−5／−4），label／描述／控件／計數一律 4px。②wizard header 返回箭頭↔標題 gap 8→**14**（`.wizard__top-lead`，全域 shared.css，6 個 wizard 頁一致）。驗證：desc 欄三段內距皆 4px；header lead gap 14px。cache `?v=20260624d`。

## 2026-06-24 · wizard 黑夜版配色（B 反饋 · 全 wizard 頁）

- 動機：使用者指定建立流程黑夜版三塊底色——footer #191A1A／content #2B2B2C／header #2B2B2C。
- 改：在 shared.css 加 `[data-theme="dark"]` 區塊覆寫 wizard chrome——`.wizard`(底層 canvas)＋`.wizard__bottom`(footer)＝`--surface-page`(#191A1A)；`.wizard__sheet`(content)＋`.wizard__top`(header)＝`--surface-shell`(#2B2B2C)。header 由原本半透明 `--surface` 改為實色 #2B2B2C、與 content 齊。
- 取捨：用既有 dark token（surface-page/shell）而非裸 hex，零裸色、不動全域 token；只在 dark mode 生效，淺色模式維持 content=白／footer=#F5F5F5。因 wizard chrome 為 6 個建立頁共用，放 shared.css 全頁一致（非單 create-product）。
- 驗證（Playwright，dark）：content/header＝rgb(43,43,44)=#2B2B2C；footer/canvas＝rgb(25,26,26)=#191A1A。cache `?v=20260624e`。check_ds_sync PASS。

- 追加（同日）：create-product 黑夜版背景↔footer 對調（使用者指定，僅本頁 override；其餘 5 個 wizard 頁維持 shared.css 的 content#2B2B2C／footer#191A1A）。本頁改：content＋header＝`--surface-page`(#191A1A，最深)、footer＋canvas＝`--surface-shell`(#2B2B2C，較淺)。驗證（dark）：content/header=rgb(25,26,26)；footer/canvas=rgb(43,43,44)。cache `?v=20260624f`。

- 追加（同日）：依使用者標註微調欄位內距——label↔描述 4→**0**（`.field__label + .field__hint { margin-top:-4px }`，描述貼齊 label）；描述↔控件、控件↔計數維持 4。計數（`[data-cp-counter-label]` 0/30）改 **靠右**。驗證：desc 欄三段距 0/4/4、計數 text-align right。cache `?v=20260624g`。

## 2026-06-24 · create-product 主圖標題換行＋庫存欄位半寬（B 反饋 · 5.1.5.2）

1. 主圖/封面上傳框標題改兩行——`cp.media.hero-physical`／`cp.media.cover-hero` 以 `\n` 拆成「主圖（封面）」＋「買家第一眼看到的」，`.upload-tile--hero .upload-tile__title` 加 `white-space:pre-line; line-height:1.4`（中英都改；auction 的 hero-auction 屬他頁、不動）。
2. 庫存「上限數量／目前在庫」由 `.cp-three-col`(各1/3) 改 `.cp-two-col`(各半寬)，與其他 input／半寬欄一致；`.cp-three-col` 全域定義不動（配送尺寸仍用）。
- 驗證（Playwright）：hero 標題 2 行、pre-line；庫存兩欄各 285px＝表單欄 584 的一半。cache `?v=20260624h`。check_ds_sync PASS。

## 2026-06-24 · 建立流程 pattern promote 成元件（D infra · 全建立頁前置）

把 create-product 頁內 `<style>` 的可重用 pattern 抽成共用元件，供 6 個建立頁共用。本批**只新增/擴充元件＋同步 design-system，尚未改任何頁面**（新元件未被產品頁引用，線上頁面零變化）。

- 新建 3 元件（皆三件套：css＋design-system.html demo＋design-system.md 條目）：
  - `form-section.css`（4.49）：無卡片區段骨架（標題18／灰副標／上分隔線／44px 留白）＋作用域限 `.form-section` 的 field 微調（label 14px regular、描述貼齊、間距 4/26、`.field__hint--count` 計數靠右）。
  - `radio-card.css`（4.50）：並排可選卡（建在 segmented 上，radio 點＋標題/描述，已選＝卡面陰影＋橘外框）。
  - `control-row.css`（4.51）：有外框的「左文字右控件」獨立列（別於 settings-row 的列表列）。
  - `form-grid.css`（4.52，atom）：2／3 欄欄位並排 helper。
- 擴充 2 既有元件（同步其 demo）：
  - `selection-card.css`：加 `.selection-card__ic` slot ＋ `.selection-card--icon` 變體（icon 置中灰、已選＝純外框不換底色）；全域 `--active`（淡底）保留給主題挑選器。
  - `upload-tile.css`：加 `.upload-tile__sub` slot ＋ hero 兩行標題（pre-line）／大 icon／格式說明。
- 驗證：check_ds_sync PASS（60 支元件、79 TOC）；唯一 WARN＝selection-card.css:83-85 主題縮圖裸 hex（既有例外、已註記）。
- 下一步（未做）：create-product 改用新元件（移除頁內 override、行為不變）→ 逐頁套 auction/bundle/event/project/register-ip。

## 2026-06-25 · create-auction 改版成無卡片版（B 反饋 · 5.1.5.10，逐頁 migration #1）

把 create-auction 從舊 card 版改成 create-product 的無卡片版面、套用新元件。
- 區段：9 個 `.card ca-section` → `.form-section`（無卡片、標題18／灰副標／分隔線）；種類選擇卡另包成最前的 form-section。
- 控件：`.ca-two-col`/`.ca-price-row` → `.form-grid`；`.ca-show-row`（密封終局/得標者付運費/上架開關）→ `.control-row`（有外框列）。
- 預覽：滑出式 `.preview-panel` → 表單旁 `.cp-preview-col`（sticky 兩欄，preview-card 內移、#ca-pv-* ID 保留）；就緒檢查 `.readiness` 移到 footer chip 的 hover tooltip（`.ca-ready-pop`，比照 create-product）。移除 preview-panel.css link 與 `body.preview-open`。
- 黑夜版：維持 shared.css 全域預設（content #2B2B2C／footer #191A1A）；對調僅 create-product。
- 驗證（Playwright）：兩欄 sticky 預覽、10 區段無卡＋分隔線、control-row 外框、就緒 tooltip、預覽即時更新、種類切換連動隱藏對應區段、無重複 ID。check_ds_sync PASS。

- 連動元件改動：`selection-card.css` 已選樣式由「淡橘底＋2px 環」改為 **ring-only（卡面陰影＋1.5px 橘環、不換底色）= 建立流程標準**（使用者指定全建立流程一致）；含 swatch 的卡（Settings 主題挑選器）以 `:has(.selection-card__swatch)` 維持原淡橘底。同步 design-system.html selection-card 的 active 敘述。影響所有用 `.selection-card` 的頁面（create-product 型別卡、create-auction 種類/時長、之後各建立頁）；Settings 主題挑選器不變。

## 2026-06-25 · 其餘建立頁套用無卡片版（B 反饋，逐頁 migration #2–5）

承 create-auction，其餘 4 頁也改成無卡片＋新元件（每頁畫面截圖給使用者確認）。

- **create-bundle**（5.1.5.4）：4 個 `.card cb-section` → `.form-section`；無預覽面板/就緒檢查（本頁本來就沒有），單欄；其餘 bundle 專屬 class（cb-add-tile/cb-summary/cb-price-input…）保留。
- **create-event**（5.1.5.x，stepper）：表單步驟本就是無卡片 `.ce-block`；Review 步驟 4 張摘要 `.card` → 無卡片摘要列（`.ce-review-row`：標題＋Edit→ 一行＋底線分隔）；選擇卡已隨 selection-card 改 ring-only。
- **create-project**（stepper）：全頁 19 處 `.card`/`.card--muted`（型別欄位群組＋摘要）以頁內 override 一次去卡面（透明底/無框/無陰影，`!important` 蓋 inline padding），有 head 的摘要改底線分隔列；型別卡已 ring-only。
- **register-ip**（stepper）：3 張 review `.card` 同法去卡面改分隔列；自訂 `.ri-usage__card--active` 由淡橘底改 **ring-only**（與選擇卡一致）；表單 `.ri-block` 本就無卡片。
- 黑夜版：這 4 頁維持 shared.css 全域預設（對調僅 create-product）。
- 驗證（Playwright，逐頁）：各頁 0 卡面殘留、stepper/條件顯示/即時預覽正常、ring-only 生效。check_ds_sync 全程 PASS。
- cache 全站 bump → `?v=20260625a`。
