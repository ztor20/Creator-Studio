# Ztor Creator Studio · R 2.1 · Assumptions

本文件把 UI 工作中發現的內容分成三類。只有「呈現假設」可由 `project-ui-creator` 自行決定；產品缺口與產品變更提案必須先由上游核准。

## 呈現假設

| ID | 假設 | 狀態 |
|---|---|---|
| UIA-001 | R 2.1 預設採 topbar，另有 sidebar 呈現探索；兩者不改變產品 IA | 可由 UI 調整 |
| UIA-002 | 清單、資料摘要、建立流程與預覽的具體元件依 design system 組合 | 可由 UI 調整 |
| UIA-003 | 範例姓名、金額、圖片與文案只作為展示資料 | 不得視為產品規則 |
| UIA-004 | 商店設定（5.1.5.5 / D035）的呈現選擇：店面門面用 **Base44／Facebook 式身分帶**（`.ss-identity-card`：封面＋疊加 logo 頭像＋店名／網址／簡介為文字），**逐欄就地編輯** `.ss-edit`（平常文字、點該欄當場變輸入、✓/Enter 確認、✕/Esc 取消）；品牌素材＝封面＋頭像（各自編輯鈕），不另設上傳框；整頁滿版 1280px。使用者反饋分四輪收斂：緊湊雙欄(窄島)→滿版標準列(仍高)→滿版雙欄→**身分帶＋就地編輯**（使用者要 Facebook 式、點了才可改）；Mobbin web 參考 Base44 讀取/編輯態、Sora 逐元素 pencil、Linktree。商品陳列/付款/出貨以 `.tabs` 切換；See as fan 用 `.preview-panel--inset` 畫面分割。對應 spec §2「呈現參考、非約束」 | 可由 UI 調整 |
| UIA-005 | 商品陳列拖曳排序、See as fan 預覽、門面逐欄就地編輯（`.ss-edit`）、Save/Discard 在 R 2.1 為前端 demo 行為（只重排 DOM／開關面板／改顯示文字，無後端） | 可由 UI 調整 |
| UIA-006 | 補貨流程（5.1.5.6）呈現為 **popup 對話框**，重用 canonical `.payout-dialog` 外殼（不另刻 modal）；入口三處：E-Shop 低庫存橫條、商品列補貨鈕（低庫存/售罄實體列）、商品細節頁 Restock 鈕。送出/到貨確認為 demo（只改來源列的狀態 badge 顯示與關窗，無後端）| 可由 UI 調整 |
| UIA-007 | 補貨「建議補貨量」（spec §4② 標產品待確認）僅以非約束提示呈現（約門檻 2 倍），不自動帶入或強制；送出→`Restocking` badge、到貨確認→還原 Live/Low Stock 為**顯示層**示意，實際庫存與狀態重算口徑以主規格 §7.2 為準 | 待上游 §7.2 |
| UIA-008 | E-Shop Bundles 清單的庫存以 min(成員) 顯示（spec 5.1.5 F3 / 5.1.5.4），R 2.1 為靜態顯示文字，無即時重算 | 待上游 |
| UIA-009 | 設定通知矩陣的開關、未存離開提示、Active Sessions 撤銷、稅務 Edit、整合 Retry 在 R 2.1 為前端 demo（switch 可點、native confirm/beforeunload 提示、無後端）；鎖定 Email 通道（payout/KYC/compliance）依規格 5.1.9 F3 呈現為不可關 | 可由 UI 調整 |
| UIA-010 | Fans CRM 的 Pareto 洞察句由前端依現有分布資料計算（無合格洞察整行隱藏）；粉絲清單列 4–9 與 Hall of fame 為示例資料，Load more demo 每批 4 筆（規格正式值 25） | 可由 UI 調整 |
| UIA-011 | IP Market 冷啟動空狀態由 `<html data-ip-market="empty">` 旗標切換（demo），非真資料驅動；「List your IP」CTA 暫指向 my-ip.html | 可由 UI 調整 |
| UIA-012 | 建立活動 Quality check 即時打勾、Review 回填、圖片/票種填入為前端 demo；「全通過才可 Publish」為就緒示意，未把硬性必填範圍定為規則（見 PG-009） | 可由 UI 調整 |
| UIA-013 | 2026-06-15 補建 5 頁（project-detail／register-ip／event-detail／fan-detail／tier-settings）皆為單一示例資料（金額/日期/名單/分潤/門檻）、前端 demo 互動，非真資料綁定；project-detail 目前固定單一專案、未依 `?id=` 切資料 | 可由 UI 調整／待後續資料綁定 |
| UIA-014 | register-ip（5.1.4.1）的 IP taxonomy（六型）、Worldwide 與個別地區互斥、計價單位（一次性/期租）、Proof 與驗證狀態關係、送出/上架文案＝示例呈現並於畫面標 pending，未寫回 documents（D037 產品待確認） | 待上游 |
| UIA-015 | event-detail（5.1.6 F5）退款吸收順序數字、轉售（Phase 2）、單票種完整欄位編輯器＝只呈現規則文字/標 TBD，不落地；tier-settings（F8）雙閘單調遞減驗證、版本不回溯＝只呈現、不自創驗證/版本邏輯（上游掌管） | 待上游 |
| UIA-016 | 建立商品（5.1.5.2 v2.6 / D063/D064）四能力的呈現選擇：多規格 Variations、庫存版本 Edition、取貨方式、每人限購三段切換皆用 `.segmented`（單一資料的互斥視角），限購用 `.switch`，標籤用新 `tag-input`（組合 chip）、多規格用新 `variant-builder`（選項建構器＋逐規格表）；多規格時以 D063 單一來源呈現（單一價格庫存隱藏、改逐規格表）。條件顯示由統一 `data-cp-show`/`data-when-var`/`-edition`/`-delivery` 驅動。選項自動生成組合、逐格價格庫存、排除組合、標籤增刪、就緒檢查動態 gating 皆 R 2.1 前端 demo（無後端、無真庫存重算）。就緒檢查把限量上限≥在庫、物流必填、限購上限當作 gating 僅為顯示層示意 | 可由 UI 調整 |
| UIA-017 | 建立商品多項 spec 標「產品待確認」（D064 §8.12 / D026）：多規格選項數上限、單件成本是否納毛利、限量 vs 建議的硬性必填劃分、QR 核銷機制、Shipping Categories 來源、每人限購 enforcement／退款回補額度、數位限量售罄後下載權。R 2.1 只呈現欄位/提示，不自創規則、不寫回 documents | 待上游（D064 §8.12） |
| UIA-018 | 商品細節頁（5.1.5.1 §2.3 / D064）新增的庫存版本／取貨方式／每人限購／商品標籤＝管理呈現，重用建立商品（5.1.5.2）的 `.segmented`/`.switch`/`tag-input` 元件與 `cp.*` i18n，條件顯示用 `data-when-edition`/`-delivery`；切換/輸入/標籤增刪皆前端 demo（無後端、無真庫存重算）。多規格商品的逐規格價格庫存「呈現與可編輯範圍」spec 標待確認，故單一規格範例頁不放逐規格表；media／交付細節 spec 標 R2.1.1 待建，未做 | 可由 UI 調整／待上游 |
| UIA-019 | 建立套組（5.1.5.4 §6.3/§6.4）的套組庫存＝min(成員)、固定價≤成員原價合計＋省下金額、成員限量/多規格相容性提示、Create gating（name＋≥2 成員＋price≤sum）＝前端 demo 顯示層（讀成員 `data-stock`/`data-price`/`data-edition`/`data-variants` 計算，無後端、無真庫存重算）。spec §4⑥ 右側即時預覽＋就緒檢查「含是否存在本身待確認」，故未建；%off 算法（§4②）與成員票券跨模組引用（§8.9）spec 待補，維持原 stub | 可由 UI 調整／待上游 |
| UIA-020 | E-Shop IA（D065）呈現：nav「商品管理」改名「電子商店」、E-Shop 下拉收成兩項（電子商店／訂單管理）、商店設定移出下拉改為電子商店 F3「商店設定」鈕、以全螢幕 `embed-modal` 用 iframe 內嵌既有 store-settings.html（單一內容來源、不離開清單脈絡、關閉保留篩選）。popup／面板形式 spec 標非約束呈現參考；store-settings.html 仍為該 popup 的完整內容（檔名不變）。order-detail 取貨方式分支以 demo segmented 預覽（真實訂單由其取貨方式單一決定，非創作者於此切換）| 可由 UI 調整 |
| UIA-021 | E-Shop F3 改版（D066）呈現：(1) 狀態篩選每選項顯示目前類型商品數（All/Live/Low Stock/Sold Out/Draft），由前端讀清單列 `data-status` 計算、切 tab 重算；**數量是否隨關鍵字搜尋連動 spec 標待確認**，本輪數量不隨搜尋變動。(2) 建立鈕＝context-aware 分割按鈕（`split-button`），主鈕隨 tab、箭頭下拉列全部三類；分割按鈕形式 spec 標非約束。(3) See as fan 由 F3 工作列抽成 F5、原採右側常駐欄（**2026-06-15 改為可收合畫面分割，見 UIA-023**）；與商店設定／商品細節頁 See as fan 同一粉絲視角（§6.7）。皆前端 demo | 可由 UI 調整／數量連動待上游 |
| UIA-023 | E-Shop F2/F3/F5 版面改版（2026-06-15 使用者四項裁示）呈現：(1) **F2 低庫存**改 `.alert--bar` 全寬細條、置於 `.main` 頂端（頂欄之下、白色面板頂緣）、`position:sticky` 常駐、× 關閉復位、只留數量＋CTA（拿掉商品名）；中性白底＋警示圖示。(2) **F3 狀態篩選**由 select 改 `filter-tabs` 第二排 pill＋數量（讀 `data-status` 前端計算、切 tab 重算 reset 回 All；**是否隨搜尋連動仍待上游**），次級淺色、不用品牌色。(3) **F3 類型切換**加 `.tabs--brand` 淡橘 active 填色 pill（品牌色但不搶眼），僅 e-shop、不動全站 `.tabs`。(4) ~~**F5 商店預覽**＝常駐、不可關閉的畫面分割（永遠 `is-open`、移除切換鈕與 ✕／Esc）~~ **已被 D084 取代（2026-06-18）**：上游改規格為「F5 由 F3『預覽商店』鈕開啟、**預設關閉**、可關閉」，故 R2.1 改回**可開關**——F3 加切換鈕（`#eshop-preview-toggle`）、headerless 預覽加右上浮動 ✕（`.eshop-preview-close`）＋Esc，預設關＝管理區滿版。畫面分割版面（兩塊圓角面板＋接縫陰影）保留，只在開啟時呈現。窄螢幕（≤1100px）開啟時退化為靜態堆疊。標題由「粉絲眼中的商店」改「**商店預覽**」。**版面**＝灰底上的兩塊圓角面板（左主欄與右預覽欄各自頂角圓、中間一道 shell gutter，main 右上角因此露出圓角）；預覽內容包成白色圓角「店面頁」卡浮在灰底、內層商品改平鋪磁磚（Direction B，使用者選；`#eshop-preview` scope 覆寫共用 `.ss-fan`，不動 store-settings）。取代 UIA-021(3) 的右側常駐欄。皆前端 demo | 可由 UI 調整／搜尋連動待上游 |
| UIA-022 | 商店設定 popup 去頁首（D067）呈現：store-settings.html 改 popup-only——移除全域導航/麵包屑/page-intro，標題與關閉由 embed-modal 外框承擔；F1 動作（See as fan/Discard/Save）改內容底部 sticky `.ss-actionbar`。iframe 內 Save/Discard 以 `postMessage('ztor:storeset-close')` 通知父頁 `closeSet()` 關閉。**呈現假設**：(1) popup iframe 為獨立文件，其語言／主題隨 i18n.js／theme.js 讀本機偏好，與父頁切換不即時連動（開啟時為當下偏好）；(2) Save 為 demo 直接關閉、無「未儲存變更」攔截，是否提示 spec 標待確認（沿用 5.1.5.5 F1 註記）。直接開 store-settings.html（非經 popup）將無 nav，屬 popup-only 預期 | 可由 UI 調整／未存提示待上游 |
| UIA-024 | 新品貼文 popup（5.1.5.7 / D068）site 實作呈現假設：(1) **觸發**＝建立商品完成後導回 `e-shop.html?posted=1` 自動開啟（真實流程＝建立完成事件；demo 以 query 旗標模擬，商品名／價由 query 傳入、無資料綁定）。(2) **重用群發 composer**（受眾／標題≤120／內文≤2000／token／排程，message-modal.css）；發送機制不重定義、引用 5.1.7.1。(3) **發布為 demo**：點發布直接關閉、無後端；概念上通知粉絲＋寫入 Fans CRM（引用 5.1.7.1／5.1.2.2 §4.9）。(4) 略過／✕／backdrop／Esc 關閉、不影響商品已上架。(5) 標題與關閉由彈窗外框承擔、內容無頁首（比照 D067）；popup／面板為呈現參考、非約束。產品待確認沿用規格 §8.13：可否不附／換商品、預設受眾、公開動態與 §8.7 邊界、composer 是否跨模組共用、與群發訊息去重、未儲存提示。皆前端 demo | 可由 UI 調整／上述待上游 |
| UIA-026 | 2026-06-16 See-as-fan 粉絲端店面改版（使用者提供參考圖，選「只套版面、跟隨主題」＋「未定義欄位照加記提案」）：新增共用元件 `fan-store.css`＋partial `partials/fan-store.js`，E-Shop F5（商店預覽）與商店設定 F1（See as fan）共用同一份 markup（§6.7 同源、差異即缺陷），取代原 `.ss-fan`。版面＝hero cover＋本月精選＋分頁（商品/組合/競標）＋雙欄商品格；**顏色全走 token、跟隨全站主題（§6.9 不鎖深色）**，hero 為品牌色淺底帶（裝飾層、非 dark mode）。商品資料沿用管理側同一店面（保 §6.7 一致）。**⚠ 產品變更提案（未經上游核准、不得寫回 documents/）**：下列欄位現行規格未定義，§6.7 明訂「預覽不得引入規格未定義的欄位或數值」，本輪依使用者裁示先以提案呈現——(1) 追蹤數、(2) 社群連結（YT/IG/TH）、(3) 加入社群（follow/community）、(4) 本月精選（featured product）、(5) 立即購買（buy-now CTA）、(6) 「售完補貨中」狀態用語。皆 display-only 前端 demo、預覽不改資料。分頁/CTA 為呈現參考、非約束 | **待上游核准**（6 項提案欄位）／版面可由 UI 調整 |
| UIA-027 | 2026-06-22 建立商品（5.1.5.2）右欄組成調整（使用者裁示）：**就緒檢查（Ready to sell?）由右側預覽欄常駐卡改為 footer chip 的 hover／focus tooltip**；右欄只剩商品卡＋上架開關。這與 §4.5「右欄三件＝預覽＋就緒＋上架開關」的版面描述分歧——**屬呈現選擇、非移除產品能力**（就緒檢查項與 gating 邏輯不變，只換出現位置與觸發方式）。tooltip 內容沿用 `.readiness` 元件（標題／清單／banner ID 不變，JS 照填）。footer 計數 chip 文案改雙語＋計數（`cp.ready.chip.*`／`cp.ready.banner.*`，`{n}` 代入剩餘項數，如「剩餘 7 項未完成」）。「稍後再存」由 footer 移到 header（預覽鈕左側）。就緒檢查「項目標籤」仍為英文（沿用原右欄，未在本輪翻譯）。皆前端 demo | 可由 UI 調整／§4.5 右欄組成建議回寫上游確認 |
| UIA-025 | 2026-06-16（D070）7 模組（projects／ip-market／my-ip／e-shop／events／fans／earnings）接 Cheat Codes「Data State＝Empty」的帳號無資料空狀態，為前端 demo：資料體 `.when-data`、空狀態 `.when-empty` empty-card，靠全站 `html[data-data-state="empty"]` 切換；與清單篩選「查無符合」空狀態並存分流。細節待調（屬呈現）：my-ip／部分頁的統計卡在 Empty 時仍顯 demo 值、未歸零；IP 市場帳號 Empty 未放 CTA（租用須先進詳情頁）；少數頁原用 `store`／`search-x`／`wallet`／`folder-plus` 等未在 icons.js registry 的 icon（會空白），已改用已註冊 icon、未動 icons 檔（若要原 icon 需補 registry） | 可由 UI 調整 |
| UIA-028 | 2026-06-23 建立流程 header v2 改版＋儲存／離開行為（使用者裁示）：**(A) header 單列無底線**——左＝返回箭頭（chevron，取代「✕ Close」文字）＋標題/副標靠左、箭頭對齊主標題行；中＝進度條（有 stepper 頁，內容寬置中對齊 `.wizard__body`；無 stepper 頁此欄空）；右＝自動儲存狀態＋預覽。content 區底色 `--surface`、footer `--surface-shell`。**(B) 儲存狀態**＝兩態「已儲存／儲存中…」，全頁 autosave（任何輸入→短暫儲存中→已儲存，前端示意 `partials/wizard-chrome.js`）；`.wizard[data-autosave="false"]` 時改可點的手動「儲存」鈕（fallback）。**(C) 返回離開確認**＝點返回箭頭，編輯過→彈窗「儲存並離開／不儲存就離開」（取消＝右上 ✕）；未編輯過→彈窗「離開」（取消＝✕）。「編輯過」＝本次有任何輸入（非「有未存變更」）。**⚠ 屬產品行為**：未存離開提示原規格列「待確認」（沿用 5.1.5.5 F1／UIA-022 註記），本輪依使用者明確指示先實作為前端 demo（不真持久化、leave＝`history.back()`），未寫回 documents/；autosave 節流時間、儲存失敗態、實際持久化由上游定 | **待上游核准**（儲存模型／未存提示）／版面可由 UI 調整 |

## 產品缺口

| ID | 缺口 | 目前處理 |
|---|---|---|
| PG-001 | IP Market 站內競標、簽約、付款、租期與爭議規則未定 | R 2.1 只能展示探索與詢問；交易能力不得宣稱可用 |
| PG-002 | 拍賣的加價、保留價、延長、付款與流標規則未定 | 建立拍賣不可進入正式交易 |
| PG-003 | 團隊角色與收入、提款、稅務、分潤權限矩陣未定 | Settings 不得自行授權 |
| PG-004 | 非台灣的稅務、KYC／KYB、銀行欄位與提款費率未定 | 只呈現已核准地區 |
| PG-005 | Fans Campaigns 與 Events、Loyalty、通知的邊界未定 | 不建立正式入口 |
| PG-006 | 規格 5.1.1 §F2／§F4／§F5 要求「完整待辦視圖」與「完整動態視圖」（可全看、依來源模組篩選、分頁、近 90 天），但 R 2.1 尚無對應頁面 | F2 待處理深連結與 F4「View all」暫指向同頁錨點 `#f4-alerts`／`#`；F5 無 view-all；待上游確認是否新增獨立視圖頁後再接，不在 Dashboard 偽造完整清單 |
| PG-007 | 設定（5.1.9）缺 5.1.9.x 子流程規格：KYC 驗證、新增收款方式（狀態機/Primary-Backup/不可移除唯一已驗證）、2FA 啟用-停用（TOTP/SMS/備用碼/雙因素停用）、刪除帳戶、Webhooks（端點/secret/HMAC）。**F7 合規（唯讀）已於 2026-06-15 落地**（5.1.9 F7 本已定義、非缺規格） | F7 唯讀分頁已建（settings.html，KYC 狀態/用量上限/凍結/地區限制，示例資料）；其餘高風險金流·安全·合規**流程**仍待上游補子流程規格後再做，不由 site 自創規則 |
| PG-008 | ~~Fans 群發訊息（5.1.7.1）頁本體未建：5 項產品待確認~~ **已解決 2026-06-15（D058）**：5 項定案（收件族群＝All+分級+At risk/Recovered、主旨≤120/內文≤2000、排程現在+15min·帳號時區、狀態 Scheduled/Sent/Failed 不併 §7.2、通知走通知中心+Email 可退訂但合規不可退）；5.1.7.1 升 v2 | 群發 modal 已建（fans-crm.html）；三入口已 wire；發送/排程為前端 demo |
| PG-009 | ~~建立活動 D032 三項待協調＋D033~~ **已解決 2026-06-15（D060）**：即時預覽套用（§5.2.5）、自動儲存＋狀態與手動並存（§5.2.4）、QC 五項發布硬閘、草稿改狀態軸（方案 c）。**仍待補**：單一票種子表單欄位（票名/價格/數量/資格，D032 原列） | create-event.html／events.html 已實作；票種欄位待上游補規格後再做 |
| PG-010 | ~~IP 詳情頁（5.1.3.1）交易呈現降級程度未拍板~~ **已解決 2026-06-15**：降為權利資訊＋詢問（Draft 申請、估價非扣款、競標僅預覽），對齊規格本意與 PG-001/002 | 見 PCR-003；ip-detail.html 已改 |
| PG-011 | **建立商品編輯態入口未定（IA）**：規格 §4.5 定義 create-product 有編輯態（標題 Edit ◯◯、Save changes＋Delete），但 §9.3 又說商品細節頁（5.1.5.1）是「繼續編輯」入口；e-shop 清單的編輯鉛筆目前連到 `product-detail.html`。「編輯商品走哪頁」屬 IA。**呈現假設**：create-product 已實作編輯態（`?edit=1[&name=]` 可進入測試），但**未改鉛筆路由**（仍 → product-detail），待上游定哪頁負責編輯後再接線 | 上游定編輯入口（create-product?edit vs product-detail）後，調整 e-shop 鉛筆與 product-detail 導向 |
| PG-012 | **刪除商品確認流程待補**：規格 §4.5 標 Delete「破壞性，確認流程待補」。**呈現假設**：編輯態 Delete 鈕暫用原生 `confirm()` 當 stub，確認後回 e-shop 清單；正式破壞性確認 modal 待規格 | 上游定義刪除確認 UX 後替換 |
| PG-014 | **建立組合內「臨時新增商品」的結果未定（持久化/類型範圍）**：使用者要求在「建立組合」流程中臨時新增商品改以 popup（嵌入完整 create-product 流程）顯示、建完加回組合。但規格 5.1.5.4 未定義「在組合脈絡下新建的商品」之後續：是否落地為 e-shop 正式商品、是否需審核、與「近期瀏覽」候選的關係。**呈現假設**：(1) popup 沿用完整建立流程（`?embed=1`），送出後 `postMessage` 回傳的商品為**顯示層 stub**（前端 demo，未持久化、未同步 e-shop 清單）；(2) 拍賣已獨立為 create-auction.html（5.1.5.10 / D081）、create-product 不再有拍賣型，組合 popup（嵌入 create-product `?embed=1`）**天然只含實體／數位**；「一物一拍不可入組合」此前提仍依 §7.1／CLAUDE.md 推定、待上游確認。組合成員若為新建商品的庫存/限量/多規格相容性沿用既有提示 | 上游定「組合內臨時新增商品」是否落地為正式商品後，調整 embed 流程與資料流 |
| PG-013 | **建立商品「主分類」與商品類型的關係未定**：§7.1 要 E-Shop 建商品同時記錄主分類（Physical／Digital Merchandise／Special／Premium）與次分類，但 create-product 的「類型」卡（實體／數位／拍賣）已隱含實體 vs 數位主分類，兩者重疊；且 Special／Premium 主分類無法只由類型推得。**呈現假設**：create-product 只讓使用者選 §7.1「次分類」（依類型切換實體／數位次分類集），主分類由類型隱含記錄（實體→Physical、數位→Digital）；未提供獨立主分類選擇器（product-detail 已有明確主分類選擇器，兩頁暫不一致）。Special／Premium 與類型的對應、是否需在 create-product 顯式選主分類，產品待確認 | 上游定「類型 vs 主分類」關係後，決定 create-product 是否補主分類選擇器並與 product-detail 對齊 |

## 實作與上游不一致

| ID | 現況 | 修正方向 |
|---|---|---|
| PCR-001 | ~~`orders.html` 與 `order-detail.html` 使用單一訂單狀態~~ **已解決 2026-06-15** | 改為履約與付款·結算兩條狀態軸（`.status-axes`／`--labeled`，§7.2 不混用）：orders 列並排雙 badge、order-detail §2.2 大寫標籤雙軸；reconcile 提示同步 |
| PCR-002 | `events.html` 同時把 Draft 當時間與狀態篩選 | 時間只保留 Upcoming／Past，Draft 放狀態軸 |
| PCR-003 | ~~`ip-detail.html` 含超出授權詢問的交易呈現~~ **已解決 2026-06-15** | 降級為權利資訊與詢問：移除 escrow／「Total due today」改「Estimated total（非扣款）」；Send rental request 文案改＝建 Draft 進核准佇列（§3.4）；競標區降為僅預覽＋「R 2.1 規則未開放」、移除下標輸入/結帳，改「私訊權利人」。對齊 5.1.3.1 §3.3.5／§3.4.3／§3.4.4 |
| PCR-004 | `earnings.html` 的手動收入與多地稅務看似正式功能 | 未核准能力停用或標示不可用 |
| PCR-005 | `settings.html` 將導航放置視為產品偏好 | 視為 R 2.1 呈現探索，不寫回產品規格 |
| PCR-006 | 部分頁面仍複寫舊費率或商品分類 | 統一引用主規格 §7.1、§7.3 |

## 核准流程

1. UI 發現缺口時新增 PG 或 PCR。
2. 產品決策先更新 `requirement/` 或 `documents/decisions.md`。
3. `design-spec-writer` 更新 `documents/`。
4. `project-ui-creator` 才能更新 BUILD-SPEC 與實作。
