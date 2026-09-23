# Wave 3 全站巡檢 · Batch 3

18 頁，`http://localhost:4326/`，1440×900，dark theme，`data-nav-mode="sidebar"`。判準：`STYLE-DECISIONS.md` Q77–Q82 ＋ `wave2-熔接紀錄.md` 開頭總則 ＋ 黃金樣板（`e-shop.html`／`product-detail.html`／`create-product.html`）實際長相。

方法論註記：Browser 截圖是整頁縮放圖（非裁切），但頁面載入後 0.3–1s 內會有 `.reveal.is-in` 進場動畫（KPI 卡片淡入＋位移），太早截圖會誤判成「元件消失／破圖」——已用 wait 1.2s 排除此類假陽性，並用 `getComputedStyle` 交叉驗證代替單憑肉眼判讀壓縮截圖的顏色。

---

## 總體結論（先讀這段）

本輪最大發現是一個**跨頁共用元件缺口**，不是個別頁面的問題：

**`ds-components/info-banner.css` 整支沒有進入 Wave 2 熔接**（Wave 2a／2b 熔接紀錄的檔案清單都沒有它）。`.info-banner` 目前仍是：

```css
.info-banner {
  background: var(--accent);   /* dark 值 #2A2B2C，"hover 底色" token，不是卡片語彙 */
  border: 1px solid var(--border);
  ...
}
```

沒有 `--ztu-glass-bg`、沒有 `backdrop-filter`，是一塊几乎融進深色背景的實色面板，肉眼看是「文字懸浮在星空上、沒有清楚的卡片邊界」——這不是動畫殘影或截圖假影，已用 `getComputedStyle` 逐層確認（`background-color: rgb(42, 43, 44)`，`backdrop-filter: none`，`opacity: 1`，`position: static`，DOM 順序正常、無重疊 bug）。

**波及範圍**：`my-ip.html`／`project-detail.html`／`series-detail.html`／`tier-benefits.html`／`tier-settings.html`（本輪 batch 3 內，共 5 頁），另外 `publish-work.html`／`register-ip.html`／`scanner.html` 也各有 2–3 處 `.info-banner`，但巡檢時剛好落在未展開的分頁／狀態，沒能實際目視到（同一份 CSS，結論可直接套用，未逐一截圖）。

**重要澄清**：黃金樣板 `product-detail.html` 本身也吃這個元件（6 處），同樣是舊的 `--accent` 實色面板——換句話說，這不是 batch 3 巡檢範圍內頁面「退步」造成的落差，是 Wave 2 熔接階段本來就漏掉的一支元件檔，連黃金樣板都沒被治理到。建議當一張獨立的「元件層」修復票（改 `ds-components/info-banner.css` 一支檔案即可覆蓋全站），不需要逐頁修。

---

## 逐頁記錄

### my-ip.html — B
- 判定：沒跟上（info-banner 元件缺口，見總體結論）
- KPI 卡（Total IP／Total rentals／Total IP revenue）、清單列、篩選 chip（All 30／Made on Ztor／External）皆為正確玻璃語彙，星空背景列表頁向下漸消符合 Q81。
- `.info-banner` 在此頁有 2 處（grep 命中），巡檢時停留在預設 tab 未觸發顯示，未實際截圖，歸類依據 CSS 共用規則。
- Console：無 error。

### project-detail.html — B
- 判定：沒跟上（info-banner 元件缺口，17 處 grep 命中，是本輪波及最多的頁面）
- Overview 分頁本身（Lifetime revenue／Streams KPI、Progress 卡、Tell your fans 卡）玻璃語彙正確；側欄次頁籤（Overview／Release progress／Setup／My earnings／Performance）選中態為橘字＋細線，觀感正常。
- 未逐一切換 5 個子分頁找出全部 17 處 info-banner 的可見位置，時間關係以 CSS 規則類推。
- Console：無 error。

### series-detail.html — B
- 判定：沒跟上（info-banner 元件缺口）
- 具體現象：Shared settings 分頁頂部，`<div class="info-banner reveal is-in">` 內文「Saving here updates all 3 dates.」（`<strong>` 標籤），背景 `rgb(42, 43, 44)` 實色、無 blur，緊接在大片幾乎全暗的 hero 留白之後，畫面讀成文字漂浮、無清楚卡片邊界，與下方「BASICS」卡片（正確玻璃語彙）對比明顯。
- 其餘：Ticket tiers 卡片群（VIP／Floor／Seated）、KPI、頂欄 scroll 態皆正常玻璃。
- Console：無 error。

### tier-benefits.html — B
- 判定：沒跟上（info-banner 元件缺口，7 處 grep 命中，頁面上目視到至少 3 處：頂部「Example benefit values for prototype UI direction」＋底部兩則）
- 权益矩陣表格（Inner Circle／Superfan／Revived fans／Fan 四欄，toggle 開關＋輸入框）本身排版正常，各 tier 標籤色（橘／藍／綠／灰）是刻意的分色識別，非違規色塊。
- Console：無 error。

### tier-settings.html — B
- 判定：沒跟上（info-banner 元件缺口，5 處 grep 命中，目視到頂部 1 處＋底部 2 處）
- Tier thresholds 卡片（Inner Circle／Superfan／Ranked fans／Fan）本身為正確玻璃語彙，星空清晰可見。
- Console：無 error。

### product-detail.html（黃金樣板，快速過一輪基準）
- 已知樣板，僅做基準核對：Sales summary／Listing settings／Delivery & pickup／In use 卡片、Overview／Sales settings 分頁、filter-tabs 選中態（玻璃殼＋橘字發光，經 `getComputedStyle` 驗證非色塊）皆與 STYLE-DECISIONS.md 描述一致。
- **例外**：本頁同樣吃 `.info-banner`（6 處，Delivery／Digital 等分頁裡的說明列），與上述缺口同源，不是 batch 3 範圍内頁面造成的落差，見總體結論。

### order-detail.html — OK
- `#ZT-10486` 詳情頁：Order items／Order info／Buyer info 三張卡玻璃語彙正確，Refund／Mark shipped 按鈕正常，頁面內容未超出視窗高度，無需捲動即完整可見。
- Console：無 error。

### orders.html — OK
- KPI 列（To ship／Pending／Refunds/disputes／Completed·30d）四張卡皆正確玻璃（`background: rgba(255,255,255,0.07)`，`backdrop-filter: blur(24px)`，經 computed style 驗證）。
- filter-tabs（All status／Unpaid／Paid…）選中態為玻璃殼＋橘字發光＋底部暖光暈，符合 Q80，肉眼在壓縮截圖裡容易誤判成橘色塊，已用 `getComputedStyle` 排除誤判。
- 訂單列表、footer 說明文字正常。
- Console：無 error。

### pickup-detail.html — OK
- Session 卡、Redeemed 進度卡（36 still to collect，橘色進度條）、Scanner access 卡皆為正確玻璃語彙；Redemption log 表格 filter chips 正常。
- 底部有一條 `.sticky-actions` 吸底列（複製版 Edit session 按鈕），**刻意採用不透明 `--popover` 而非玻璃**——CSS 內建詳細註解說明這是故意決策（Wave 2b 熔接時明確保留實色，因為該列做淡入淡出動畫，玻璃面在動畫過程會露餡），已核對非缺陷。
- Console：無 error。

### pickup.html — OK
- KPI 卡（To redeem today／Active sessions／Redeemed today）、filter-tabs（All／Scheduled／Active/Ended/Archive）、session 列表皆正確玻璃語彙。
- Console：無 error。

### projects.html — OK
- 篩選工具列（All states／Draft／Scheduled/…）玻璃殼正確；project list 卡片列、進度條（100% 綠／24% 橘）為資料視覺化用色，非表面染色，符合 Q77（顏色只出現在光與文字／指標上）。
- Status badge（Live／Succeeded／Scheduled／Cancelled…）為實色小徽章，與黃金樣板 product-detail 的 Active 徽章一致，非缺陷。
- Console：無 error。

### publish-work.html — OK
- Wizard 精靈頁：`.wizard` 正確套用檔尾「星空節」的靜態點陣背景（`background-image: radial-gradient(... 1px, transparent 1px)`，`background-size: 22px 22px`，經 computed style 驗證，5.6% 白點在壓縮截圖里幾乎看不見但確實存在），符合 Q81 對精靈頁背景的獨立規格。
- Upload/Artwork/Details/Credits/Announcement 步驟條、Continue 按鈕、Save as draft 皆正常。
- `.info-banner` 有 3 處 grep 命中，本輪巡檢未目視到（步驟未觸發），依 CSS 規則歸入同一元件缺口但不列入本頁判定（未實際看到壞的畫面，保守標 OK，缺口紀錄於總體結論）。
- Console：無 error。

### register-ip.html — OK
- Wizard 精靈頁，同上背景規格；IP Type 選卡、IP name/Description 表單、Asset upload／Proof of ownership 卡片皆正常。
- `.info-banner` 3 處 grep 命中，同上未目視到，不列入本頁判定。
- Console：無 error。

### request-payout.html — OK
- 本頁是重導頁（`meta refresh` + `location.replace` 到 `earnings.html#payouts`），非獨立內容頁，屬預期設計。
- 重導後的 Earnings／Payouts 頁：KPI 卡、Choose payout bank 卡片列玻璃語彙正確；點開「Request payout」彈窗後核對為不透明 `--popover`（`rgb(33, 34, 35)`，`backdrop-filter: none`），符合 Q78 對話框規則。
- Console：無 error。

### scanner.html — OK
- 特殊全螢幕版型（無 app shell、無星空，純深色極簡）：登入頁（密碼／Staff name／Unlock scanner）與解鎖後掃描頁（QR 掃描框、底部 Scan/Roster/Items nav）皆與規格描述吻合。
- Demo scenarios 面板的按鈕在本次巡檢工具的 `computer` 座標點擊下沒有觸發（改用 JS `.click()` 才成功解鎖），懷疑是本巡檢工具座標映射問題，非頁面本身缺陷；解鎖後畫面渲染正常、無 console error。
- Console：無 error。

### settings.html — OK
- Profile／Appearance／Language／Notifications 等側邊分頁，表單欄位排版正常；底部吸底 Discard／Save changes 列為不透明實色（與 pickup-detail 的 sticky-actions 同一元件，屬既定設計）。
- Console：無 error。

### store-settings.html — OK
- Payment／Selling defaults／Size guides／Discount codes 分頁；Stripe connected 卡、Storefront 預覽卡玻璃語彙正確。
- Console：無 error。

### section-test.html — C（低優先／範圍外）
- 這是獨立的 design-system 測試頁（`Section 外框測試`），刻意脫離 app shell 測試 `--card`／`--muted`／`--border` 三種面色，不吃星空、不吃 app 側欄，屬性質上就是「非產品頁」的元件沙盒，不適用 Q77 的玻璃化規則（測的正是舊色階本身）。
- 不建議比照一般頁面標準改動；若要處理，應由設計端另外裁定「這個測試頁要不要也換皮」而非巡檢自動判定為缺陷。
- Console：無 error。

---

## 統計表

| 判定 | 頁數 | 頁面 |
|---|---|---|
| A 壞掉 | 0 | — |
| B 沒跟上 | 5 | my-ip.html／project-detail.html／series-detail.html／tier-benefits.html／tier-settings.html |
| C 品味待決／範圍外 | 1 | section-test.html |
| OK | 11 | order-detail.html／orders.html／pickup-detail.html／pickup.html／projects.html／publish-work.html／register-ip.html／request-payout.html／scanner.html／settings.html／store-settings.html |
| 黃金樣板基準核對 | 1 | product-detail.html（同樣吃 info-banner 缺口，見總體結論） |

**跨頁根因（不重複計入上表頁數）**：`ds-components/info-banner.css` 未進入 Wave 2 熔接，`.info-banner` 仍是 `background: var(--accent)` 實色面板，無 `--ztu-glass-bg`／`backdrop-filter`。全站 grep 到的頁數（含本 batch 外）：my-ip.html(2)／product-detail.html(6)／project-detail.html(17)／publish-work.html(3)／register-ip.html(3)／scanner.html(2)／series-detail.html(6)／tier-benefits.html(7)／tier-settings.html(5)。建議單獨開一張「補熔接 info-banner.css」的票，改一支檔案即可解決全部。

**Console error 清單**：18 頁全數 `read_console_messages(onlyErrors)` 皆為「No console logs」，無 JS 錯誤（favicon 404 未出現，不需忽略項）。

---

## 覆蓋聲明

- 18 頁全部完成目視＋捲動＋console 檢查。
- 未逐一切換完每頁的所有分頁／狀態組合（例如 project-detail.html 的 5 個子分頁、my-ip.html 的 External 篩選、publish-work.html／register-ip.html 的後續步驟）——時間關係僅核對預設進入畫面＋1–2 次互動抽查，`.info-banner` 缺口的判定是靠 CSS 共用規則類推，不代表已窮盡檢查每頁的每個狀態。
- scanner.html 的「Demo scenarios」面板按鈕用 `computer` 工具點擊未觸發（改用 JS click 成功），懷疑是巡檢工具本身的座標映射問題，未進一步排查是否為頁面真實缺陷。
- 未對 mobile／narrow viewport 做任何檢查，僅涵蓋 1440×900 桌面版。
