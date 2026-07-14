# `.stickynote` 全站清點— 2026-07-13

`.stickynote`（`ds-components/stickynote.css`）是橘色填滿的 callout 元件，全站少數允許橘色當底色的地方，本意用於 editorial callout／警示提醒／pending 或範圍聲明。這份清單把 `site/r2.1/` 裡目前真正會被畫出來的每一個 `.stickynote` 實例攤開——靜態頁面 12 頁 + 3 支共用 modal（透過 `partials/*.js` 注入到多個頁面）——共 **32 個實例**，逐一標白話內容、頁面位置、對應規格出處，並給一個初步的「是否值得商榷」判斷供你逐條確認。

判斷邏輯：內容屬「法律/免責」「警示/風險（含不可逆操作、金流誤解風險）」「範圍/未上線聲明（TBD、Phase 2、R 2.1.1）」的標 `○ 橘色 callout 合理`；屬「一般資訊提示」（單純解釋機制、無風險後果）或「動態狀態」但不構成警示的，標 `△ 可考慮改用一般 hint、不必橘色`。這只是起點，最終判斷在你。

design-system.html 內有 1 個 demo 用的 `.stickynote`（非真實頁面內容，元件展示頁本身），不計入下表 32 個、也不對規格書；註記於表後。

---

## 清點總表

| # | 頁面 | 頁面位置 | 圖示 | 內容（白話） | 用途分類 | 規格出處 | 是否值得商榷 |
|---|---|---|---|---|---|---|---|
| 1 | create-product.html:442 | 「Delivery method」步驟 → 物流配送（Shipping）子欄位下方 | ✓ | Closed Beta 期間，平台幫忙出運費 | 一般資訊提示 | `5.1.5.2-建立商品流程.md` §F4（原文明載「屬營運文案，呈現參考、非約束」） | △ 可考慮改用一般 hint、不必橘色 |
| 2 | create-product.html:466 | 「Delivery method」步驟 → 現場 QR 領取子欄位下方 | qr-code | 買家每筆訂單會拿到一個 QR，工作人員在取貨場次的 scanner 網址掃碼核銷；場次與紀錄要去「取貨管理」看 | 一般資訊提示 | `5.1.5.2-建立商品流程.md` §F4 | △ 可考慮改用一般 hint、不必橘色 |
| 3 | product-detail.html:334 | 商品編輯 → 「Delivery & access」→ 現場 QR 領取子欄位下方 | qr-code | 同上，QR 核銷機制說明 | 一般資訊提示 | `5.1.5.1-商品細節頁.md` §2.5 | △ 可考慮改用一般 hint、不必橘色 |
| 4 | product-detail.html:345 | 商品編輯 → 「Delivery & access」→ 數位商品交付區塊 | download | 數位商品購買後即可立即下載／取用，內容檔在上方「Content file」管理 | 一般資訊提示 | `5.1.5.1-商品細節頁.md` §2.5 | △ 可考慮改用一般 hint、不必橘色 |
| 5 | event-detail.html:77 | 頁面最上方（Hero 之下、KPI 快照之上），整頁層級聲明 | ⓘ | 這是營運控台，產品規則已定義、UI 排在 R 2.1.1 才做；頁面數字是示例資料，凡標 TBD 或 Phase 2 的東西刻意不落地 | 範圍/未上線聲明 | `0-設計規格書.md`（5.1.6 F5、§8.1，見 986/1037 行）＋`5.1.6-活動.md` §頁面內容（實作範圍段） | ○ 橘色 callout 合理 |
| 6 | event-detail.html:119 | Overview 分頁 →「Event details」卡片下方 | ⚖ | 活動狀態是單向狀態機（Draft→Scheduled/On Sale→Completed），只有 Draft→Cancelled 能反轉，取消會自動全額退款所有有效票 | 警示/風險（不可逆操作） | `5.1.6-活動.md`（頁面內容段，狀態機定義；§7.2）＋`0-設計規格書.md` 762 行 | ○ 橘色 callout 合理 |
| 7 | event-detail.html:217 | Ticket tiers 區 →「Sale rules」卡片下方 | ⓘ | 完整的逐票種欄位編輯器（購買資格細節、幣別清單、售票時窗）要等 R 2.1.1 的票種設定 UI 才會做，這裡只示範已定義的欄位 | 範圍/未上線聲明 | `5.1.6-活動.md`（票種設定段，實作範圍見 §8.1） | ○ 橘色 callout 合理 |
| 8 | event-detail.html:274 | Attendees & check-in 區，報到三色圖例下方（頁面層級） | ⓘ | 掃碼核銷成功不可逆（issued→used），只有創作者能反轉；掃描器可離線約 4 小時、重連才同步，同票雙掃以最早那次為準；線上活動的外部平台資料可能不完整 | 警示/風險（不可逆操作） | `5.1.6-活動.md`（頁面內容段，報到狀態定義） | ○ 橘色 callout 合理 |
| 9 | event-detail.html:298 | Refunds & comps 區 →「Refund queue」卡片、「No refund requests」空狀態卡下方 | ⚖ | 退款吸收順序（TBD，等退款開放才定案）：先扣退款準備金 → 再扣目前淨利池 → 扣不夠就結轉虧損（不會跟創作者已撥款的錢要回來）；核准退款會作廢票券 QR | 警示/風險 + 範圍聲明（TBD） | `5.1.6-活動.md`（退款段，§7.3 · §8.6） | ○ 橘色 callout 合理 |
| 10 | event-detail.html:412 | Cost & revenue summary 區，「Where this rolls up」卡片下方（頁面層級） | ⓘ | 收入的結算狀態機：待結算(accrued)→可提領(settled)→(退款/爭議)；退款或取消對收入的影響照 §7.3 的吸收順序走 | 一般資訊提示（偏財務機制說明，非直接警示） | `5.1.6-活動.md`（成本與收入摘要段，§7.2 · §7.3 · §8.6） | △ 可考慮改用一般 hint（純解釋結算狀態機制，非當下風險） |
| 11 | event-detail.html:466 | Resale 區塊（頁面層級） | ⓘ | 轉售功能是 Phase 2，這版還沒做；未來會有每場轉售模式（允許／預設封鎖／限量）等規則 | 範圍/未上線聲明 | `5.1.6-活動.md`（轉售段，屬 Phase 2） | ○ 橘色 callout 合理 |
| 12 | project-detail.html:108 | Hero 概覽區之下、分頁 Tabs 之上（頁面層級待辦提醒） | ⚑ | 這個專案還有事沒處理：IP Rental 還沒連、2 個展示素材待補、1 則給支持者的更新到期未發 | 動態狀態（待辦提醒） | `5.1.2.2-專案詳情.md` §3 專案概覽（第 3 點「顯示需要處理的下一步」） | ○ 橘色 callout 合理（真的是待辦警示性質） |
| 13 | project-detail.html:166 | Overview → 「About this project」卡片下方 | ⚖ | 專案類型（募資模式）一旦發布就鎖死不能改，這是為了保護支持者與 NFT 持有者權益（D041）；平台費／金流費率照收入管理口徑走，這裡不能改 | 法律/免責 | `5.1.2.2-專案詳情.md` §4.1 關於專案；決策 D041；§7.3 | ○ 橘色 callout 合理 |
| 14 | project-detail.html:262 | Overview → 「IP Rental」卡片（4.7），空狀態下方 | ⚑ | 目前還沒連結任何 IP；租用只是揭露權利與授權關係，不是一種營利模式 | 一般資訊提示（解釋 IP Rental 定位，非警示） | `5.1.2.2-專案詳情.md` §4.7 IP Rental | △ 可考慮改用一般 hint（說明性質，不是警告） |
| 15 | project-detail.html:350 | Overview → 展示內容（Showcase）卡片下方 | ⓘ | 已發布的專案如果更換主要素材（如封面、預告），會影響粉絲端看到的畫面——上線前會先跳出警告 | 警示/風險（會影響已發布內容） | `5.1.2.2-專案詳情.md` §4.2 展示內容（Showcase） | ○ 橘色 callout 合理 |
| 16 | project-detail.html:581 | Money 分頁 →「Distribution」卡片下方 | ⓘ | 分潤要創作者手動觸發，系統永遠不會自動撥款；如果淨利池變負值，分配會暫停、虧損會往後結轉 | 警示/風險（金流操作） | `5.1.2.2-專案詳情.md` §淨利池與分配（Distribution） | ○ 橘色 callout 合理 |
| 17 | my-ip.html:56 | 頁首統計卡與 My IP／Rented 分頁 Tabs 之下（頁面層級） | ✦ | 專案一發布會自動幫你建一筆 IP 紀錄；要登錄 Ztor 站外既有的權利，才要用「Add your IP」，登錄後才能上架市場 | 一般資訊提示 | `5.1.4-我的IP.md` §F6 清單頁欄位與互動（提示條） | △ 可考慮改用一般 hint（純說明機制） |
| 18 | register-ip.html:225 | 登錄 IP 流程 →「Pricing」區塊，租期欄位下方 | ✦ | 上架後實際出租要走授權生命週期：承租方先申請 → 你核准 → 條款補齊才轉為 Active；預設不上市場搜尋，授權一啟用素材包就會被凍結 | 一般資訊提示（解釋流程機制） | `5.1.4.1-登錄IP流程.md` §4③ 定價與收益；§7.7 | △ 可考慮改用一般 hint |
| 19 | ip-detail.html:170 | Terms 分頁 →「Permitted usage」卡片下方 | ⚖ | 平台上的紀錄不等於正式法律合約；正式租用要雙方簽 Ztor 標準授權＋在聊天中談好的附加條款，平台只記錄雙方談了什麼、不是協議本身 | 法律/免責 | `5.1.3.1-IP詳情頁.md` §2.4／§2.5（第 5/6 點：法律提示） | ○ 橘色 callout 合理 |
| 20 | ip-detail.html:228 | Bidding 分頁 →「Current highest bid」區塊下方 | ⓘ | R 2.1 版本的競標只是預覽用，站上的平台競標、付款、結算規則都還沒開放，這裡數字僅供示意；真要參與請私訊擁有者 | 範圍/未上線聲明 | `5.1.3-IP市場.md`（範圍註記，49 行：競標 vs 固定費率標為 R 2.1.1 site 實作項）＋`0-設計規格書.md` §8.1 | ○ 橘色 callout 合理 |
| 21 | tier-settings.html:166 | Fan tier settings →「Tier thresholds」區塊，儲存前的預覽提示 | ⓘ | 儲存前會即時預覽「會重新分級 N 位粉絲」；門檻必須依序遞減才能存；驗證邏輯本身待上游確認，不是這裡自己發明的 | 範圍/未上線聲明（TBC） | `5.1.7-粉絲關係管理.md` §F8 分級與權益設定 | ○ 橘色 callout 合理（明確標 TBC/待上游確認） |
| 22 | tier-settings.html:170 | Fan tier settings →「Tier thresholds」區塊，緊接在上一則下方 | 🌙 | 聲望與分級是每天夜間批次重新計算的（§7.5），改門檻不會馬上生效，要等下次重算 | 警示/風險（避免誤以為即時生效） | `5.1.7-粉絲關係管理.md` §F8（生效時點段） | ○ 橘色 callout 合理（防止「改了為什麼沒變」的誤解） |
| 23 | tier-settings.html:308 | Fan tier settings →「Benefits」區塊下方 | ⚖ | 各級福利的文案會依平台的 NFT／募資用語規則審查，避免被理解成有金融報酬 | 法律/免責 | `5.1.7-粉絲關係管理.md` §F8（權益設定段；§7.8） | ○ 橘色 callout 合理 |
| 24 | earnings.html:257 | Overview → 「Revenue by source」卡片下方 | ! | 「待結算」不等於「可提領」：待結算資金要等 T+7 爭議窗口過了才會解鎖，可提領才是 Request Payout 真正能領到的錢 | 警示/風險（避免財務金額誤解） | `5.1.8-收入管理.md` §F3 財務摘要卡（§7.2 · §7.3） | ○ 橘色 callout 合理 |
| 25 | earnings.html:771 | Payouts 分頁 →「Net profit pool & refund reserve」卡片下方 | ! | 淨利池是整條金流瀑布的最後一站；如果淨利池變負值，分配會暫停、虧損往後結轉，已經撥出去的錢絕不會被收回 | 警示/風險（金流） | `5.1.8-收入管理.md` §F8 提款管理（淨利池段；§7.3） | ○ 橘色 callout 合理 |
| 26 | earnings.html:971 | Tax documents 分頁 →「Supported regions」卡片下方 | ! | 如果你的地區不在自動支援名單裡，還是可以下載年度收入總表當作報稅起點；平台還沒幫你的地區出正式表單的話可以聯絡客服 | 一般資訊提示 | `5.1.8-收入管理.md` §F9 稅務文件（不支援提示） | △ 可考慮改用一般 hint（友善提示、非風險警告） |
| 27 | fan-detail.html:412 | 粉絲詳情 →「Long-term contribution」卡片下方 | ★ | Hall of fame 只讀不能改：記錄的是這位粉絲「歷史最高曾達到的等級」與達成年份，不會因為現在等級變動而跟著變（見 F12） | 一般資訊提示（解釋唯讀機制） | `5.1.7-粉絲關係管理.md` §F12 標籤與長期貢獻 | △ 可考慮改用一般 hint |
| 28 | scanner.html:70 | 手機 Scanner 掃描結果畫面（Screen 3），預設隱藏、依掃描結果動態顯示 | ! | 動態訊息：目前只有兩種文案會觸發——「這個 QR 已核銷過，要再次核銷需請創作者先反轉」或「這個 QR 有效但不屬於這個場次，要去取貨管理加入項目或用對的場次」 | 警示/風險（現場操作阻擋原因） | `5.1.5.14-手機Scanner.md` §F1 手機 Scanner（重複掃描／掃描檢查段） | ○ 橘色 callout 合理 |
| 29 | index.html:205（透過 `js/components.js` insight-split 元件注入） | Dashboard →「Fan relations & audience trends」卡片，Fans 欄下方 | ⚐ | 5 位超級粉絲有流失風險，超過 14 天沒有互動了，要不要私訊關心一下？ | 動態狀態（流失風險提醒） | `5.1.1-儀表板.md` §F7（粉絲關係與受眾趨勢分析）＋來源定義在 `5.1.7-粉絲關係管理.md` §F4 流失風險提醒 | ○ 橘色 callout 合理 |
| 30 | `partials/manual-entry-modal.js:60`（注入於 earnings.html 的「手動補登收入」彈窗） | 手動補登收入 popup，附件欄位下方 | ! | 這筆會標成「未驗證」：手動補登的收入永遠不計入可提領、提款或稅務文件，最多只會出現在展示性統計裡 | 警示/風險（避免誤以為手動收入可提領） | `5.1.8.2-手動補登收入流程.md`（F10 子流程；§7.3 使用限制） | ○ 橘色 callout 合理 |
| 31 | `partials/restock-modal.js:65`（注入於 e-shop.html、product-detail.html 的「補貨」彈窗） | 補貨 popup，品項數量列下方 | ! | 「立即補貨」馬上加庫存；「計時補貨」會先標成「補貨中」，等你按「確認到貨」才真正入庫；每次補貨都會留紀錄；數位／不限量商品不能補貨 | 一般資訊提示（解釋補貨機制差異） | `5.1.5.6-補貨流程.md`（§7.2 立即／計時補貨轉換） | △ 可考慮改用一般 hint |
| 32 | `partials/pickup-session-modal.js:77`（注入於 create-product.html、pickup.html、pickup-detail.html、product-detail.html 的「建立取貨場次」彈窗） | 建立取貨場次 popup，Scanner 密碼欄位下方 | ! | 建立場次前至少要加一個商品或票券，這樣才會同時啟用 scanner；建立成功會產生一組密碼保護的 scanner 網址，交給現場工作人員 | 一般資訊提示（必填規則＋機制說明） | `5.1.5.12-建立取貨場次.md`（必填齊全段；D111） | △ 可考慮改用一般 hint |

---

## design-system.html 的 demo（不計入上表、非真實頁面內容）

- `design-system.html:1698` — 元件展示區「Sticky-note」章節的示範用 `.stickynote`，圖示 `!`，純示範 markup（`design-system.html:1738-1739` 另有一段是程式碼範例的 `<pre>` 文字，不是渲染出來的第二個實例）。原始待查清單提到「design-system.html 裡有 2 個」，這次全站掃描只找到 1 個實際渲染的 demo；如果你記得的是別處，麻煩告訴我再補查。

---

## 值得商榷清單（△，優先看這些）

以下 12 個標 △——內容偏「解釋機制／友善提示」而非真正的警示、法律免責或範圍聲明，可考慮改用一般文字提示（非橘色），把橘色留給真正的警示與免責：

1. \#1 create-product.html:442 —「Closed Beta 補貼運費」
2. \#2 create-product.html:466 —「QR 核銷說明」
3. \#3 product-detail.html:334 —「QR 核銷說明」（同 #2 內容）
4. \#4 product-detail.html:345 —「數位商品即時下載」
5. \#10 event-detail.html:412 —「結算狀態機說明」
6. \#14 project-detail.html:262 —「IP Rental 未連結說明」
7. \#17 my-ip.html:56 —「發布專案自動建 IP 紀錄」
8. \#18 register-ip.html:225 —「授權生命週期說明」
9. \#26 earnings.html:971 —「地區稅務表不支援」
10. \#27 fan-detail.html:412 —「Hall of fame 唯讀說明」
11. \#31 restock-modal.js —「立即／計時補貨說明」
12. \#32 pickup-session-modal.js —「建立場次規則說明」

（\#2 與 #3 是同一段文案在兩個頁面各出現一次，如果你決定要改，記得兩處一起改，並同步 `js/i18n.js` 裡對應的 `cp.delivery.qr-note` 字串本身不用動、只需改容器樣式。）

其餘 20 個（含 index.html 的流失風險提醒、scanner 的核銷警示、退款吸收順序、法律免責等）標 `○`，判斷是合理使用橘色。

---

## 覆蓋範圍說明

- **全站掃描**：對 `site/r2.1/*.html`（13 頁含 `.stickynote` 字串／連結，扣掉純載入 CSS 的頁面實際有渲染實例的共 12 頁）＋ `js/components.js`、`js/reveal.js`、`js/i18n.js`、`partials/manual-entry-modal.js`、`partials/restock-modal.js`、`partials/pickup-session-modal.js` 逐一 grep 比對，找到 32 個真實會渲染的實例（含 1 個依資料動態顯示的 scanner.html 警示、1 個由 `components.js` 注入到 index.html 的 insight-split 元件）。原始「已知清單」只列了 16 條，這次補齊到 32 條——主要漏在 event-detail.html（漏 4 個）、project-detail.html（漏 4 個）、tier-settings.html／earnings.html／ip-detail.html（各漏 1-2 個）。
- **規格對照程度**：32 個實例中，30 個在 `documents/` 找到明確對應段落（多數 HTML 內文本身就寫了 §／D 編號，直接核對原文確認無誤；少數靠關鍵字在 `documents/` 裡定位）。
- **規格未明載**：0 個完全找不到依據——但 `ip-detail.html:170`／`:228` 兩則雖有明確段落對應，原文並非逐字照抄前端文案（前端是意譯），已在表中標明對應段落供你核對用字是否跑掉。`create-product.html:442`「Closed Beta 補貼運費」規格書原文明講這句是「營運文案、呈現參考、非約束」——即產品規格層級本來就沒把它當硬性規則看待，這點本身就是它被標 △ 的理由之一。
