# r2.3 Wave 3 巡檢 · Batch 2

三個巡檢員並行巡檢之一，本檔負責 20 頁（清單見下）。巡檢環境 `http://localhost:4326`，1440×900，Claude Browser 單一 tab 逐頁走完。

判準來源：`STYLE-DECISIONS.md` Q77–Q82（表面玻璃化、彈出層不透明、blur 分階、選中態五語彙、星空背景、KPI 字型不換 Doto）＋ `docs/wave2-熔接紀錄.md` 開頭總則（改本體原定義、HTML 一字未動、零 `data-ztorui`、零新增 `!important`）。

## 環境警示（先讀）

巡檢一開始 `earnings.html` 無論怎麼 `navigate`都被靜默改導到 `earnings-sony.html`。查證後發現是 `js/devtools.js` 的「版本」cheat code 當時卡在 `deck-for-sony`（`localStorage.ztor.devstate.version`），該版本規則是 `route:earnings.html=earnings-sony.html`（收入頁強制走 Sony 簡報版），且 `localStorage` 是整個 `localhost:4326` origin 共用，會連帶影響其他兩位巡檢員的 tab。已把 `version` 改回文件標示的預設值 `full`（Phase 4 最終完整版）才能看到 `earnings.html` 真身，沒有再改回 `deck-for-sony`——`full` 才是規格文件寫的預設狀態。若其他巡檢員的頁面在巡檢途中觀感忽然變化，這是原因，不是新壞掉。

## 逐頁結果

### index.html — OK
Dashboard 首頁。KPI 卡、活動列表卡、待辦提醒卡皆為中性玻璃，底部星空隨列表區漸消。無 console error。側欄選中態（實色橘膠囊）是全站共用元件，golden 樣板已驗過，不在本頁重複列。

### earnings-overview.html — C
- 頁首第一格 KPI（`.kpi.kpi--hero`，"TOTAL REVENUE · ALL SOURCES"）整張卡是實色橘 `background: var(--primary)`（`ds-components/kpi.css:222-225`），文字全吃 `--on-primary` 深墨。這與 Q77「表面一律中性玻璃，顏色只出現在光與文字」字面衝突，但 CSS 本體在同一位置留了完整裁示紀錄（2026-07-26/27/28，早於本輪換裝）：「一列 KPI 只給一個 --hero…實色橘在本系統一直代表主角/主要動作，語彙一致」，是與 Q77 不同批次、刻意保留的例外，不是漏改。**歸為 C**：要不要把這張「主角卡」也納入玻璃化，是設計裁決，不是機械套用就能改的東西。
- 其餘三張次要 KPI、Quarter 分頁 tab（`tabs__item--active`，發光燈條）、Royalties 清單卡皆為中性玻璃，符合新語彙。無 console error。

### earnings-sony.html — OK
3 張 KPI 皆中性玻璃、Overview／Content earnings 為底線發光 tab、交易表格列可讀。無 console error。

### earnings-ztor.html — OK
Filter chip「All」核對 DOM 為 `chip chip--active`，背景 `rgba(255,255,255,0.12)`（中性玻璃＋橘字），符合 Q80 chip 選中語彙。狀態徽章（Pending/Available/Paid/Disputed）為文字色，不鋪色塊。無 console error。

### earnings.html — C
同 earnings-overview.html：頁首 `.kpi.kpi--hero` 實色橘卡（同一支 CSS 規則），同一個「舊裁示例外 vs 新表面律」的設計張力，**歸為 C**，不重複展開。其餘卡片、Overview/Content earnings/Transactions/Project income/Payouts/Tax documents 分頁與圖表區皆中性玻璃。無 console error。

### edit-event.html — OK
已退場為導引頁（"Editing moved to the event page"），只有一顆圖示徽章＋一顆主 CTA 按鈕，無違和。無 console error。

### event-detail.html — OK
Hero 卡、By tier 進度卡、Ticket sales 折線圖卡、Tour stops 清單卡皆中性玻璃；Day/Week/Month 切換為玻璃選中態。左側次頁籤（Overview/Setup/Tickets/Sales & list）文字色選中，未見異常。無 console error。

### events.html — OK
頂部主分頁核對為 `tabs tabs--underline-short tabs--underline-label`，選中態透明底＋發光燈條，符合 Q80。次列 chip（All/Concerts/Fans meet/Online events）為中性玻璃。列表往下滾動時工具列（All/Scheduled/…/+Create event）轉為 sticky 玻璃列，星空在列表區已淡出。無 console error。

### fan-analytics.html — C
Spotify 串接提示 banner、KPI 卡、Top towards／streams 卡皆中性玻璃。頁中段「Japan is growing」比較面板與「INFLUENCE」量條區文字對比看起來偏弱，實測 `.card__title` computed `color: rgba(255,255,255,0.95)`、`opacity:1`，屬正常次要文字色階、非渲染錯誤——但這類「資料密度高、多層次文字對比要不要再拉開」的判斷本身就是**設計品味題**，歸 C，交給後續裁決。無 console error。

### fan-detail.html — OK
Hero 資訊卡、三張 loyalty/spend/next-tier KPI、Behavior timeline 時間軸卡皆中性玻璃；標籤徽章（Inner Circle/Active/VIP/High spender）為中性底＋色字。無 console error。

### fans-crm.html — OK
四張 KPI 卡中性玻璃（首次截圖時因 `reveal is-in` 進場動畫只截到 2 張，屬正常漸入效果非錯誤，重新截圖後 4 張都在）。分眾 chip（All fans/Inner Circle/Superfan/…）玻璃選中。表格列清楚可讀。無 console error。

### fans-guide.html — C
獨立編輯風說明頁（橘色左側時間軸線＋大字級敘事），非標準卡片頁，golden 樣板未覆蓋此版型。頁中一張示範用「權益矩陣表」（DOM class `fg-matrix__row fg-matrix__head`）"Inner Circle" 那一列視覺上有暖色底鋪色，這是一次性示範元件的自訂樣式，是否要收攏進表面玻璃律屬**品味/範圍裁決**（要不要把說明頁也拉進主語彙，或維持它本來就不同的編輯敘事風格），歸 C。無 console error。

### funding-simulate.html — C
頁面本體標題就寫「demo，正式版不會出現」，是一個獨立、無側欄殼層的內部測試工具（步驟式試算器），背景無星空、卡片為純色深灰、不吃玻璃 token。由於這頁明確標示非正式產物，**不確定要不要套用本輪換裝語彙**——若確定會進正式版才需要熔接，若純測試工具則本輪可以不動，歸 C 待裁決範圍。無 console error。

### ip-bank-reporting.html — C
這是完全獨立的「Admin Creator Studio」後台子系統（獨立側欄：Admin Creator Studio/Creator Management/Video publishing review/Admin IP Bank/IP Bank Reporting/Platform Fee Settings），非本輪巡檢主清單熟悉的 Creator 前台殼層。KPI／表格卡片外觀是深色玻璃、星空動畫類名（`ztu-star-b`／`ztu-star-d`）確認有掛載，視覺上與主站一致。頁尾文案寫死「Ztor Creator Studio · R 2.1 prototype」（`manage-ip.html` 頁尾也有同一行字），是內容非樣式，但版本號字面過舊，容易讓人誤判這整區沒吃到新語彙——**建議請文案/工程確認這行字是否該更新或移除**，不算本輪 CSS 巡檢範圍所以列 C。另外這是表格密集頁但未見 `.list-dock` 掛載，星空是否該在表格區漸消未套用 Q81 規則，是否要把後台子系統也納入 list-dock 慣例，需要範圍裁決，歸 C。無 console error。

### ip-detail.html — OK
Hero 圖片卡、租借條款卡、Cost breakdown 明細、主 CTA 按鈕（含霧光層）皆符合新語彙。Toggle 開關無異常。無 console error。

### ip-market.html — OK
市場網格卡片（圖片＋徽章＋進度條）中性玻璃；status chip（Any status/Available/Bidding/Exclusive）玻璃選中。實測開啟 Region 下拉選單：彈出面板為全不透明深底（`.dropdown__menu` 一類），符合 Q78「彈出層一律不透明」。無 console error。

### login.html — OK
獨立版型頁（如任務說明所述），純色深底卡片、無星空、無玻璃 token，與主站语彙刻意不同调，這是預期行為不是漏改。無 console error。

### manage-ip.html — OK
Hero 資訊卡、三張 KPI、Rights & ownership 明細卡皆中性玻璃；Overview/Licensing & pricing/Rentals/Settings 分頁底線發光選中。頁尾同樣有「R 2.1 prototype」舊版本號文案（見 ip-bank-reporting.html 條目）。無 console error。

### media-vault-popup.html — OK
彈窗開啟後核對為全不透明深底面板，符合 Q78。右側 Vault 清單選中列 DOM class `vault-row vault-row--active`，`background: color(srgb 1 0.639216 0.247059 / 0.13)`——即 13% 透明度的橘色玻璃染色，不是實色鋪底，符合 Q77/Q80「顏色只在光與文字，不鋪進面底色」的精神。無 console error。

### media-vault.html — OK
與彈窗版同一套元件之整頁版：Who gets in／Unlock conditions／Keys issued 卡片中性玻璃，右側 Vault 清單同樣是 13% 橘色玻璃選中態。頁面本體星空可見。無 console error。

## 統計

| 判定 | 頁數 |
|---|---|
| OK | 14 |
| C | 6 |
| A（壞掉） | 0 |
| B（沒跟上） | 0 |

OK 明細：index, earnings-sony, earnings-ztor, edit-event, event-detail, events, fan-detail, fans-crm, ip-detail, ip-market, login, manage-ip, media-vault-popup, media-vault
C 明細：earnings-overview（kpi--hero 實色卡與 Q77 的設計張力）, earnings（同上）, fan-analytics（次要文字對比品味）, fans-guide（示範矩陣表暖色列）, funding-simulate（獨立測試工具，是否套用本輪語彙待裁決）, ip-bank-reporting（獨立後台子系統，舊版本號文案＋ list-dock 範圍待裁決）

## Console error 清單

本批 20 頁全數 `read_console_messages(onlyErrors: true)` 為空，無任何 console error（favicon 404 亦未出現）。

## 最嚴重發現摘要（供總表彙整）

1. `kpi--hero`（`ds-components/kpi.css:222`）整張卡實色橘，出現在 earnings-overview.html／earnings.html 的頁首主 KPI，與本輪 Q77「表面一律中性玻璃」字面衝突，但有明確舊裁示記錄為刻意例外——需要裁決這個舊例外要不要被新規則覆蓋，不建議未經確認就機械改掉。
2. `ip-bank-reporting.html`／`manage-ip.html` 頁尾文案寫死「R 2.1 prototype」，版本號字面過舊，建議請工程/文案確認是否該同步更新或移除（非 CSS 問題）。
3. 巡檢過程發現的環境問題：`localStorage.ztor.devstate.version` 曾卡在 `deck-for-sony`，讓 `earnings.html` 被迫導到 `earnings-sony.html`，已改回預設 `full`；因為是整個 origin 共用的 state，其他巡檢員的 tab 也會受影響，值得在總表統整時提醒。

## 覆蓋聲明

本檔清單 20 頁（earnings-overview / earnings-sony / earnings-ztor / earnings / edit-event / event-detail / events / fan-analytics / fan-detail / fans-crm / fans-guide / funding-simulate / index / ip-bank-reporting / ip-detail / ip-market / login / manage-ip / media-vault-popup / media-vault）**全數完整巡檢**：每頁截圖檢視首屏＋中段/底部捲動、`read_console_messages(onlyErrors:true)` 逐頁核對、對可疑元素以 DOM class／computed style 交叉驗證。互動抽查（hover／dropdown）僅在 ip-market.html（Region 下拉）與 media-vault-popup.html（開啟彈窗）實測，其餘頁面未逐一開每個 dropdown／hover 態，屬輕量抽查而非全互動狀態覆蓋。截圖證據未落地存檔（Claude Browser 工具本身不提供截圖存檔到檔案系統的介面），本檔以 DOM class＋computed style＋文字描述取代，可視為文字化證據。
