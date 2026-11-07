> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Preview column

#### 總表紀錄（原 §4.1 · Preview column）

- `_layer`：🟡 molecule
- Status：✓ Project
- CSS：[preview-column.css](../ds-components/preview-column.css)

建立流程「表單｜預覽」兩欄版面＋右側 sticky 預覽欄。**`.preview-split--narrow`（2026-08-10 使用者指示）**：右欄由 320px／間距 40 收成 **264px／間距 24**，數值直接取自建立活動在用的 `.wizard-split--narrow`——兩個建立流程並排看時右欄本來一寬一窄，收斂成同一組數字、不另立第三種寬度。首個消費頁＝create-product；其餘消費頁維持預設寬度（標題＋灰副標＋Preview card）；取代滑出式 Preview panel。**卡邊界 2026-07-21**：`.preview-col .card` 與 `.preview-col .preview-card` 改 `border:0` ＋ `--shadow-card, --shadow-edge-top`，與左欄 `form-section--outlined`（Q14／Q18 已去邊框改浮起）一致——原本左欄無邊框、右欄 1px 邊框，同一畫面兩種卡邊界（使用者裁示）。scope 限 `.preview-col` 內，全站其他 `.card` 仍照 Q3 用 1px 邊框、未推翻 Q3。消費頁＝create-product／create-bundle／create-auction（各 2 個盒子）＋create-campaign（僅預覽卡），4 頁共 7 處。**2026-09-11 三個新修飾詞**（首個消費頁＝電子商店 F5 商店預覽）：`--toggle`＝可開關（沒 `is-open` 就單欄、右欄不佔位）；`--tall`＝預覽比視窗高時欄限高在視窗內自己捲（sticky 欄釘頂時下半截原本永遠看不到）；`--dim`＝分隔線（`__head--rule`）以下的內容區鋪畫布色 24% 暗膜（同日兩輪：「背景要暗一點點」→「標題那塊用原本的玻璃質感背景，內容那塊用現在的背景」），卡本體與標題列維持玻璃；內容區負外距出血到卡邊、下緣跟卡的圓角。同輪 `--phone` 的欄寬改走 `--preview-col-w`（預設 270）：電子商店與商店設定 2026-09-12 起覆寫成 394＋zoom 1（鏡像 1:1＝360＋卡內距 32＋邊框 2；前一天曾是 320／0.8），建立商品維持 270／0.75，不另立第三個修飾詞；`--tall` 的卡捲軸藏起（古典捲軸會吃掉 16px 把版型壓成 344）。**`--tall` 二改（2026-09-11 使用者：「範圍底部不要破窗」）**：捲的改成卡的內容而不是欄（卡是 flex 子項 `min-height:0; overflow-y:auto`），四角與邊框永遠在視窗裡；實際高度由 `partials/preview-col.js` 依欄當下離視窗頂的距離寫成 `--preview-col-max`（純 CSS 的 100vh 算式只在釘住時對，欄還在自然位置時會多出頁首那一段）；消費頁 e-shop／store-settings 都載這支。**同日：卡內標題列釘頂**（使用者：「這塊滾動時可以 fix」）——`--tall` 卡裡的 `__head--rule` sticky 在卡頂（負外距吃掉 padding-top 再補回）、82% 畫布色＋模糊底；高度由 preview-col.js 量成 `--preview-head-h`，卡內其他要釘頂的東西（fan-store 分頁列）以它為 top
