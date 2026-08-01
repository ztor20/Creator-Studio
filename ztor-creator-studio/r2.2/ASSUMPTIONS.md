# Ztor Creator Studio · R 2.1 · Assumptions

## ESP-0xx · 粉絲群組頁面收斂（2026-07-31）— 產品變更提案，規格未同步

**狀態**：已在 `site/r2.2` 實作，`documents/` 未回寫。

**做了什麼**（使用者當次明確指示，權威鏈第 1 條）
- 分級權益（規格 5.1.7.2）與分級設定（規格 5.1.7.6）兩個獨立子頁，內容併入粉絲管理（`fans-crm.html`）的「粉絲分級設定」分頁；兩個 HTML 檔保留但退出導覽。
- 粉絲群組子項由 6 個收成 4 個。
- 頁名：粉絲分析（原受眾分析／粉絲分析／總覽，本日來回數次）、粉絲管理（原粉絲圈／總覽）。

**與規格牴觸之處**
1. `documents/0-設計規格書.md §3.2` 的 sitemap 是「有哪些頁、誰是誰的子頁」的唯一來源，目前仍列著這兩頁為獨立子目的地。
2. 5.1.7.2 與 5.1.7.6 兩份分頁規格仍以「獨立頁面」描述其版面與儲存行為；併入之後儲存粒度改成「彈窗內儲存」，頁面本身無儲存狀態——這是行為變更，需上游確認。
3. 頁名變更未反映在 §3.2 與 §5.1 模組總表。

**需要上游裁決的問題**
- 兩頁是正式退場（走墓碑刪檔）還是維持「保留但不導覽」？目前是後者。
- 儲存粒度：彈窗內儲存 vs 原本的整頁 Save／Discard。
- 門檻「下次每晚重算生效」與權益「立即生效」現在共用一顆儲存鈕，畫面上只用一條 info-banner 說明；是否足夠需上游確認。

## UIA-049 · Admin IP Bank prototype data

- `js/ip-bank-store.js` 的 Film、IP、Owner、Share、Owed 與 Withdrawn 是 localStorage prototype data，僅用於示範 Admin IP Bank 與 Reporting 的跨頁連動。
- Film net revenue、monthly close、Withdrawn 與 settlement engine 未在原型實作或定義；Reporting 明示為 illustrative derived figures。
- Owner lookup 的 directory、linked user 與 pending invitation 都是 localStorage prototype state。原型只顯示「邀請已建立／待寄送」，不查詢正式帳號資料、不建立真實 invitation record，也不寄送 email；正式搜尋權限、email queue、claim、KYC 與 payout 邊界由上游與後端決定。
- 建立 IP Entry 以現有單頁建立 shell 呈現四個既有表單群組；這是流程呈現決策，不新增產品階段或改變資料規則。
- Reporting 日期範圍會觸發摘要與列表重繪；prototype 沒有日粒度收入來源，因此篩選範圍顯示於 KPI 與報表範圍文字，金額維持 illustrative sample。

本文件把 UI 工作中發現的內容分成三類。只有「呈現假設」可由 `project-ui-creator` 自行決定；產品缺口與產品變更提案必須先由上游核准。

## 呈現假設

| UIA-049 | **2026-07-14 版本切割呈現規則**：使用者裁決 P1/P2/P3 只顯示 `feature-scope-map.md` 明列功能，未列產品功能一律 Phase 4；這是 prototype 的呈現／驗收規則，不修改上游最終產品規格。低版本跨頁入口隱藏、直接 URL 回 E-Shop；funding-test 維持同 Phase 4（僅 create-project route 改接）。 | 使用者已確認 |

| ID | 假設 | 狀態 |
|---|---|---|
| UIA-099 | **2026-08-01 資料來源面板改雙軌分組呈現（`fan-analytics.html`、`ds-components/source-status.css`，D165）**：規格只要求「接入方式需可辨識」，沒有規定怎麼辨識。本輪選的是**分組標題**（新增 `.src-status__group`：官方串接組在前、自行上傳組在後）而不是每列各掛一顆「官方／自行」標章——分組標題本身就在回答「這一列為什麼有／沒有按鈕」，而逐列標章要讀者自己歸納；下半組收在一起也自然讀成一份待辦。上傳的殼層依 Q27 用 `.payout-dialog`，投放區用既有 `.upload-tile--file`，不新造元件 | 呈現決策，未改產品規則 |
| UIA-086 | **2026-07-24 建立項目流程前置「項目類型閘門」＋表單型別選擇器降級（`create-project.html`，D150）**：依使用者反饋，把「選項目類型」從分步表單 step-1 內的一個欄位，前置成整個流程開始前的獨立畫面（只有三張型別卡＋返回鈕），選定後才進入分步表單；表單內的「項目類型」欄位保留為 `.segmented` 純標題級切換、移除每型說明。**呈現重組、非產品變更**：三種型別（直接上線／先募資／開放預購）、各自的 FLOWS 分步、各步欄位與所有產品規則均未改，只是把既有的型別選擇動作換一個呈現位置與樣式；型別仍可在表單內用 segmented 隨時切換。**呈現假設（待上游知會）**：規格（`0-設計規格書` §5.2／建立流程分頁）若把建立流程定義為「單一分步精靈、型別在 step-1 內選」，本輪等於在精靈前加一個 step-0 型別閘門——屬流程呈現層決策、未改狀態機與資料契約，但若上游要把「型別閘門」正式納入流程規格（或反對前置），再回寫。其他 create-* 流程不受影響（本次只動募資項目） | 使用者已確認（呈現層）；型別閘門是否納入流程規格待上游 |
| UIA-087 | **2026-07-24 建立活動共看派對（Watch Party）分支＝呈現層新增（`create-event.html`／`events.html`，D149）**：依 decisions.md D149 於建立活動流程新增第 6 型共看派對與其 type 分支欄位（選影片／房間名稱／時間／人數上限／可觀看地區／隱私／入場券），並於活動清單加一筆樣本列。**呈現層實作、產品規則以 D149 為準**。**產品缺口（待上游，均已於 D149 標待確認）**：影片來源（自有內容庫／項目 VOD／可否外部連結）與版權邊界、平台單場人數上限數字（原型示意 1,000）、自訂票價上下限與幣別、共看派對收入事件分類（§7.3／§7.6）＝原型未定、不寫成正式行為。**呈現假設**：選影片候選重用 `js/films-store.js` 的 6 部 mock（原為商品電影關聯用，UIA-053）當示意來源、非真實共看片庫；QC 7 項為就緒示意（比照演出型 UIA-012）；活動清單樣本列（142／200／$710）為示例資料；主持技術前提「開播需電腦版 Chrome／Edge」照原型呈現為欄位註記、非產品驗證 | 呈現層可調；影片來源／人數上限／票價／收入分類待上游 |
| UIA-050 | **2026-07-16 E-Shop Products 清單「實體→數位」呈現順序**：清單靜態列排成 草稿置頂（`pinDrafts`）→ 實體各列 → 數位各列（單曲／電影／專輯／會員卡），這是 demo 樣本的**呈現排列**、不是強制排序功能。`applyFilter()` 不加排序、`pinDrafts()` 不動；粉絲端實際陳列順序仍由創作者拖曳決定（spec D083 / 5.1.5.5）。新增數位樣本列（Song／Movie／Membership）＋既有 Album（EP）只為覆蓋 D135 對應的數位次分類，金額/名稱為示例資料（UIA-003） | 可由 UI 調整 |
| UIA-051 | **2026-07-16 商品細節頁 §2.8 商品規格（Variations，D135）為靜態 demo**：規格模式 segmented 可切單一/多規格並顯隱建構器與逐規格表，但逐規格表為靜態 3 列 S/M/L、選項建構器的「新增選項」與 remove 鈕未接功能、不生成組合、無持久化；比照建立商品 §4.1（UIA-016）的前端 demo 口徑。多規格逐規格價格/庫存、單件成本納毛利與否等仍待上游（UIA-017 / D064 §8.12） | 可由 UI 調整 |
| UIA-052 | **2026-07-16 商品細節頁 D137「建立後固定不可編輯」欄位＝呈現層鎖定＋預覽走 devtools**：主分類（`#pd-main-cat` disabled select）、規格模式（`#pd-var-mode` `segmented--locked`）、庫存版本（`#pd-edition` `segmented--locked`）三者在細節頁只呈現當前值、不可切換，落實 D137「硬鎖」的呈現層表達。D137 的後端訂單約束——限量上限只能 ≥ 已售、已有訂單的規格組合不可刪、數位改次分類受限——屬工程／產品待確認，**原型不強制驗證**（無真實庫存/訂單資料）。鎖定後細節頁固定樣本值（zine＝實體／單一規格／不限量），數位／多規格／限量的替代版面**改由開發者工具（Cheat Codes，devtools.js 的 page-scoped 預覽開關 `pd-cat`／`pd-var`／`pd-edition`）預覽**，非使用者面向；正式建立時這些值由建立商品流程（5.1.5.2）決定。devtools 的通用 page-scoped 機制（`window.ZTOR_DEV_PAGE_GROUPS`）本身為原型工具 infra、不影響其他頁 | 可由 UI 調整；後端訂單約束待工程 |
| UIA-053 | **2026-07-16 電影關聯候選＝前台已上架電影 mock（BR-NEW-1，spec 5.1.5.2 §4.5 F12／5.1.5.1 §2.14／D138·D140）**：`js/films-store.js` 提供 6 部固定 mock 電影（`ztorFilms.list()`／`.title(id)`），經共用元件 `partials/film-picker.js`（可搜尋多選，建於 tag-input＋chip 之上）呈現於 create-product（§4.5 獨立 section、空選取）與 product-detail（§2.14、預設示意關聯 2 部）。搜尋只在這 6 部 mock 內以名稱過濾（BR-NEW-1「搜尋電影名稱加入」的原型示意），非真實目錄查詢。**電影是 ztor 前台實體、不在 Creator Studio 建立或管理**——原型的候選清單為示意資料，不代表真實上架電影目錄；商品→電影僅前端引用、無持久化、無後端。product-detail 預設關聯 2 部僅為 demo。**待工程/上游**：真正候選清單由前台已上架電影目錄提供（資料介接屬工程）、關聯的儲存與前台電影頁呈現（BR-NEW-2/3 屬 ztor 主站範圍）、已關聯電影下架後的呈現（spec §8.12 產品待確認） | 可由 UI 調整；前台介接與下架呈現待工程/上游 |
| UIA-054 | **2026-07-16 Admin 平台費率設定頁＝四維度費率樹＋逐 creator 設變（BR-NEW-4，spec 5.1.0.3／D139·D141）**：`admin-platform-fees.html` 費率依電子商店／活動／項目／IP 四維度 × 交易子類葉節點成樹（accordion 展開），葉節點示意費率值、creator 選單（3 個 mock：Aria Chen／Neon Harbor Studio／Studio Koto）、版本歷史（cfg-2026.02 等）皆為**示意值**，頂部 info-banner 明示「產品待確認」，未把數字寫成承諾——對齊 spec §7.6「確切數值產品待確認」。**互動皆前端 demo、無後端**：General／設變切換只改輸入的繼承/覆寫呈現（設變＝清空值、placeholder 顯繼承 General、輸入即翻「覆寫」badge，逐葉粒度），不真的套用；「儲存並產生版本」append-only 插版本歷史列（既有列不動＝不回溯）示意 spec F4 凍結機制。creator 名單與葉節點 taxonomy 為示意，非真實資料。**待工程/上游**：各葉節點確切費率數值與交易子類最終歸類、生效時間設定方式（立即／指定日期）、支付費由本頁設定或金流商帶入（待確認）、per-IP／per-活動 覆寫（本輪只做 per-creator）、費率版本與收入事件的真實凍結/對帳引擎與收益拆解取值（屬後端） | 呈現 demo；費率數值與 taxonomy 待上游、凍結引擎與收益拆解待工程 |
| UIA-055 | **2026-07-16 商品細節頁資料驅動＋逐品內容為代表性樣本**：product-detail 由 e-shop 清單以 `?id` 開啟、讀 `js/products-store.js`（9 個單售商品 mock）realize 對應組合（主分類×次分類×規格模式×庫存版本×數位內容檔形態）。**store 資料與逐品內容為代表性樣本、非真實資料**——變體列（S/M/L 靜態）、專輯曲目（`albumSeed`）、會員卡卡名（`vipName`）、價格/成本/庫存/門檻皆示意，重點是把「該有的版面組合」做出來、不代表真實商品；無後端、無持久化。e-shop 底部動態補列（Pin set 等）不在 store 內、開預設 zine。**待工程/上游**：真實商品資料由後端提供；逐規格表/曲目/卡面接真實內容與持久化屬工程 | 呈現 demo；真實資料與持久化待工程 |
| UIA-056 | **2026-07-16 商品細節頁多規格「選項」建立後鎖定（暫行）**：product-detail §2.8 選項建構器改唯讀（選項名 readonly、選項值 `chip--static`、移除增刪選項/選項值入口），只呈現當前選項不可調整。依使用者指定先保守鎖定，對齊 spec 5.1.5.1 §2.8「加新選項或新選項值＝受限·產品待確認（D137）」。逐規格表的價格/庫存/SKU/單件成本仍可編輯（spec 明列可編）。**只鎖 product-detail（post-creation）；create-product 建立流程的選項建構器不動**。**待上游**：D137 選項編輯的確切規則（是否全鎖、可加不可減、已售值不可刪之粒度）確認後，再放寬或定案本頁 UI | 呈現層保守鎖定；D137 選項編輯規則確認後調整 |
| UIA-057 | **2026-07-16 訂單詳情對齊 spec 5.1.5.3.1 的四項呈現決策（order-detail.html）**——皆為**呈現假設**、不改產品規則：**(a) 退款彈窗＝重用 payout-dialog 外殼的新 in-context 用例**：原常駐「Refund & dispute」card 撤除，改 `#od-refund-modal`（比照出貨彈窗 `#od-ship-modal` 重用 `.payout-modal`／`.payout-dialog`＋`.segmented`／`.data-list`／`.field__hint`／原生 checkbox `.od-refund-check`），零新 modal 元件 CSS；退款範圍 Full／Partial 切分支、勾選品項即時試算 `.od-amt`，皆前端 demo、無後端。**(b) 退款觸發鈕由「disabled 佔位」改「full 版本可操作、Phase 1 gate 隱藏」的呈現變更**：頁首 Refund 鈕（`#od-refund-open`，保留 `data-feat="O18"`）移除 disabled、可點開退款彈窗＝最終形態，依使用者 2026-07-16 指示；**D041「v1 不開放創作者主動退款」仍有效、未解除**——Phase 1 版本由 `data-feat="O18"` gate 隱藏該鈕來守；confirm 為 demo 關窗，真實退款經 Earnings §7.3。**(c) 爭議降為狀態＋彈窗爭議區隔的呈現方式**：爭議不再是常駐操作區塊，降為 §2.2 Payment·settlement 軸的 disputed 狀態值（示範訂單 #ZT-10482＝Paid、不觸發顯示）＋退款彈窗末尾「爭議區隔」說明（爭議由買家發起、金額凍結待調查 §7.3），守 PCR-001 兩軸不混用。**(d) `.od-subhead` page-specific 局部 class**：§2.3 卡內三子標題（品項明細／金額拆解／收入對帳，對齊 spec §2.3.1–§2.3.3）用頁面 `<style>` 局部 class＋token（`--fs-11`／`--fw-semibold`／`--muted-foreground`）呈現，非 DS 元件、不 promote。i18n 新增 `od.items.sub.*`／`od.refund.*`，`od.refund.title` 改「Refund」，舊鍵 `od.refund.sub/body/v1` 已無引用 | 可由 UI 調整；D041 v1 退款停用仍有效（gate 守）、真實退款/爭議引擎待工程 |
| UIA-058 | **2026-07-16 訂單詳情商品快照 popup 實作決策（order-detail.html，spec §2.7／D143）**：D143 已核准「品項名稱開商品快照 popup、不直連活商品」的產品變更，以下為呈現層落地選擇、非產品規則本身。**(a) 快照卡重用 preview-card**：`#od-snapshot-modal` 內的快照卡沿用建立商品流程的 `.preview-card`（原為即時綁表單的元件），改餵固定 demo 資料靜態渲染（`data-snap-*` 屬性→JS 填入），限寬 320px 置中（避免 4/3 主圖在 620px 寬 popup 被撐大，純頁面佈局調整、未改 preview-card 本體）。**(b) 所購規格條件顯示**：多規格品項（Coastline tee／M）顯示「所購規格」列，單規格品項（Tour zine）該列 `hidden`——由 JS 依 `data-snap-variant` 是否存在切換，非後端資料驅動。**(c) 快照資料為 demo 固定值**：主圖／名稱／價格／描述／次分類／規格皆寫死於品項連結的 `data-snap-*` 屬性，不是真正保存的下單當時快照；真實快照的資料儲存、版本化與已下架商品的降級呈現皆為產品待確認（D143 待確認 1–3），待上游定義後由後端支援。**(d) 管理入口**：popup foot 的「管理此商品 →」為靜態連到 `product-detail.html`，未依實際下架狀態做降級（demo 無此狀態資料） | 可由 UI 調整；快照資料儲存/版本化與下架降級待上游（D143） |
| UIA-066 | **2026-07-20 電子商店商品清單三處內容規則（`e-shop.html`，Figma node 845-12576）**：依 Figma 對齊三項內容——<br>商品名稱副標（`__meta`）單一規格商品顯示「單一規格」、多規格顯示「維度（選項）× 維度（選項）」（如「顏色（Black/Sand）× 尺寸（S/M/L）」），取代原本的格式描述文字（Zine·32頁／T恤·S/M/L/XL 等）；<br>分類欄改兩行，子分類白字在上、主分類（實體商品／虛擬商品）灰字在下；<br>庫存欄改「剩餘/∞」或「剩餘/上限」，取代「X left」。**呈現假設（不採信 Figma 字面值）**：Figma 稿子的數位商品列（單曲／電影／EP）庫存也顯示「48 / ∞」，但三列數字完全相同、疑似 Figma 複製貼上留下的佔位假資料，且數位商品概念上無實體庫存（無限供應、無「剩餘」意義）。經使用者確認，**數位商品庫存維持純 `∞`、不加剩餘數量**，不照 Figma 字面值捏造銷售/剩餘數字。純呈現層拆欄／改字，未新增或竄改任何實際數量（實體商品的剩餘數量沿用原有 stock 值） | 使用者已確認（數位商品維持純 ∞） |
| UIA-061 | **2026-07-20 我的 IP 清單改表格化，登記日期欄位暫缺（`my-ip.html`，spec 5.1.4 §F6）**：依使用者反饋「版面要像電子商店」，把原本 `.data-list` 卡片式清單（IP 名稱＋一行擠滿欄位的 meta 字串）改用新元件變體 `.product-list--ip`（重用 e-shop/orders/pickup 的表格 grid 機制），對齊 §F6 定義的 8 欄清單欄位（IP／權利資訊／租出數／收入／租金／Mktplace／Manage）。**純呈現層拆欄，未新增或竄改資料**：原本擠在 `rowN.meta` 一行的欄位值原樣拆進對應欄，未改動任何數字或文字內容。**呈現假設（缺口）**：spec §F6「清單欄位 IP」要求「發布或登記日期」需顯示在 IP 欄，但現有 3 筆（Coastline EP／Late Bloom／Quiet Hours）demo 資料原本就沒有日期值（只有第 4 筆「Ztor 之外的 IP」原本就帶登記日期），本輪**未替前 3 筆捏造日期**、IP 欄暫不顯示日期子行；待上游／後端提供真實發布或登記日期後再補上，屆時只需在 `.product-list__body` 內加一行 `.product-list__meta` 即可、元件已支援 | 可由 UI 調整；登記日期資料待上游/後端 |
| UIA-059 | **2026-07-17 建立取貨場次 modal 分區＋單框 combobox 選取（`partials/pickup-session-modal.js`，spec 5.1.5.12 §4／v1.4）**：F1/F2/F3 三區塊與「搜尋加入」骨架由上游 spec 5.1.5.12 §4 定義，以下為呈現層落地與使用者反饋調整。**(a) 分區用 `.form-section` ＋新增 `.form-section--modal` 填色面板變體**：dialog 底為 `--card`，細線分隔在暗色 midnight 讀不出，故每段做成 `--muted` 填色＋`--border` 邊框＋`--radius-xl` 圓角的獨立面板（兩色都與卡片底拉開）。並補齊 pickup.html 漏掛的 `form-section.css`／`chip.css`（原本 modal 的區段與 chip 樣式在 pickup 頁根本沒載入＝分區/ chip 失效的真正根因）。**(b) F2 改單框 combobox（新 `combobox.css`，重用 `.tag-input`＋`.chip`）**：一個搜尋框，已選項為可移除 chip，focus／輸入彈下拉建議（商品／票券分組），點選加入、已選自建議移除、無命中顯示空訊息。取代前一版「搜尋＋兩份常駐清單」；spec 只要求「同一處搜尋加入」，清單 vs combobox 與控制項型式屬呈現。**(c) 死 class 遷移（bug 修復）**：STEP 1 表單由 2026-07-11 退役、無 CSS 的 `.payout-field*`／`.payout-form-grid` 遷至 canonical `.field`／`.form-grid`，修復欄位失樣、非新產品規則。**(d) 文案分歧（待上游確認）**：F2 UI 顯示「加入取貨項目」、F3 顯示「設置密碼」，但上游 spec 5.1.5.12 §4 標題仍為「加入可核銷項目」「Scanner 存取」——UI 與 spec 文案分歧，待使用者確認是否回同步 spec。移除舊 F2 副標與 stickynote（`pks.note`），最低一項規則改由 F2 副標「至少加入一項商品或活動票券」承載。商品／票券清單為 demo literal，真實來源待後端。**(e) 2026-07-17（三輪）改頁籤式 dialog**：三區（基本資訊／取貨項目／密碼）從 `--muted` 填色面板疊直改成頂部三頁籤自由切換（`.tabs`＋`.tab-panel`，參考 Mobbin Vapi「Create Structured Output」等頂部分頁 dialog，非步驟式），退場同日新增、已無消費者的 `.form-section--modal` 填色面板變體；頁籤會把必填欄位藏到別頁，故按「建立」時驗證並自動跳到出錯頁籤、取貨項目頁加 `.tabs__item-count` 即時計數徽章——此為呈現/互動決策，D112「需 ≥1 項才可建立」規則不變（仍以停用建立鈕落地） | 可由 UI 調整；文案分歧與清單資料源待上游 |
| UIA-001 | R 2.1 **預設側邊欄（Sidebar，D110）**、可切 topbar；兩顯示模式不改變產品 IA。語言固定繁中；主題偏好規則見 UIA-048 | 可由 UI 調整 |
| UIA-048 | **2026-07-14 覆寫 UIA-001／UIA-044 的主題部分**：主題偏好恢復為呈現層設定，`theme.js` 讀取合法 localStorage 值（light / dark / system），無值預設 dark；`?theme=light|dark|system` 優先但不寫入偏好。深色與淺色偏好都會跨頁保存；語言固定繁中與預設側邊欄的決定不變。`section-test.html` 是外框變體與主題驗證頁，不影響正式產品流程 | 可由 UI 調整 |
| UIA-002 | 清單、資料摘要、建立流程與預覽的具體元件依 design system 組合 | 可由 UI 調整 |
| UIA-003 | 範例姓名、金額、圖片與文案只作為展示資料 | 不得視為產品規則 |
| UIA-004 | 商店設定（5.1.5.5 / D035）的呈現選擇：店面門面用 **Base44／Facebook 式身分帶**（`.ss-identity-card`：封面＋疊加 logo 頭像＋店名／網址／簡介為文字），**逐欄就地編輯** `.ss-edit`（平常文字、點該欄當場變輸入、✓/Enter 確認、✕/Esc 取消）；品牌素材＝封面＋頭像（各自編輯鈕），不另設上傳框；整頁滿版 1280px。使用者反饋分四輪收斂：緊湊雙欄(窄島)→滿版標準列(仍高)→滿版雙欄→**身分帶＋就地編輯**（使用者要 Facebook 式、點了才可改）；Mobbin web 參考 Base44 讀取/編輯態、Sora 逐元素 pencil、Linktree。商品陳列/付款/出貨以 `.tabs` 切換；See as fan 用 `.preview-panel--inset` 畫面分割。對應 spec §2「呈現參考、非約束」 | 可由 UI 調整 |
| UIA-005 | 商品陳列拖曳排序、See as fan 預覽、門面逐欄就地編輯（`.ss-edit`）、Save/Discard 在 R 2.1 為前端 demo 行為（只重排 DOM／開關面板／改顯示文字，無後端） | 可由 UI 調整 |
| UIA-006 | 補貨流程（5.1.5.6，2026-07-02 v1.4 改「補貨單」模型 D104；沿革 D100 立即/計時、D101 單一/多規格）呈現為 **popup 對話框**，重用 canonical `.payout-dialog` 外殼（不另刻 modal）。**一次補貨＝一張補貨單**：<br>**單據層**（整單填一次）＝補貨方式 `.segmented`（立即／計時）＋供應商／預計到貨／備註（`.payout-field`）；<br>**品項層**＝每個要補的品項一列 `.restock-line`（識別＋庫存狀態 badge＋目前庫存/門檻＋數量輸入＋即時補後讀數），容器 `.restock-lines`。品項清單依入口攤平：單一規格商品＝1 列；**多規格商品列（`data-variants`，5.1.5.2 §4.1 F3）＝逐啟用規格一列、置於 `.restock-lines__group`（商品名）標題下**（demo＝Coastline tee S/M/L/XL＝單選項 4 值）；**2 選項的規格矩陣**（demo＝Coastline hoodie，顏色 Black/Sand × 尺寸 S/M/L＝2×3=6 格）以**選項一為分組**（`.restock-lines__group`＝Black／Sand）、選項二為列（S/M/L），逐格獨立庫存/狀態/數量——透過 `openOrder(groups)` 直接分組，不新增元件；**組合列＝以 `.tabs` 把成員商品分開**（一成員一 tab／`.tab-panel`），每個 tab 內為該成員的規格矩陣（多規格成員規格矩陣、2 選項再以選項一分組；單品成員 1 列），數量跨 tab 保留（demo＝Coastline starter pack：tee 4 規格＋hoodie 2×3 矩陣＋sticker 單品）。**數量留空＝該品項不補**；至少一列＞0 才可送出。**商品的規格永遠是矩陣、不用 tab；只有組合成員用單層 tab**（D106，解 D101 曾有的「成員 tab 內再套規格 tab」兩層問題與規格量大時重複填供應商/到貨）。方式切換：`Restock now`（立即）隱藏預計到貨與「到貨確認」、`Scheduled`（計時）顯示預計到貨（必填）＋「到貨確認」。列狀態 badge 依庫存軸三態（In stock／Low Stock／Sold Out）。重用既有元件（segmented／tabs＋tab-panel／data-list／badge），只有 `.restock-lines`／`.restock-line*` 是 restock 專屬。入口：商品列補貨鈕（低庫存/售罄實體列）、多規格列、組合列（live bundle）、商品細節頁 Restock 鈕、F2 低庫存橫條→低庫存清單（間接）。送出對數量＞0 的品項生效＝demo（改來源列 badge、商品細節頁逐品項 append 補貨紀錄列，無後端）；同單混合立即／計時、部分收貨＝產品待確認（見 UIA-007） | 可由 UI 調整 |
| UIA-007 | 補貨顯示層示意（spec §4 標產品待確認的口徑）：`Restock now` 送出→`In stock`、`Scheduled` 送出→`Restocking` badge、到貨確認→`In stock`，皆**顯示層**示意；「補後在庫＝目前剩餘＋補貨數量」為前端即算、「建議補貨量」（約門檻 2 倍）為非約束提示；商品細節頁「補貨紀錄」（`.data-list`：補貨數量／時間／供應商／狀態）為 demo（送出即 prepend 一列，時間顯示「剛剛」），歷史資料 literal。實際庫存增減、狀態重算口徑、組合成員逐一補貨的批次送出／部分成功處理以主規格 §7.2／上游後端為準 | 待上游 §7.2 |
| UIA-008 | E-Shop Bundles 清單的庫存以 min(成員) 顯示（spec 5.1.5 F3 / 5.1.5.4），R 2.1 為靜態顯示文字，無即時重算 | 待上游 |
| UIA-009 | 設定通知矩陣的開關、未存離開提示、Active Sessions 撤銷、稅務 Edit、整合 Retry 在 R 2.1 為前端 demo（switch 可點、native confirm/beforeunload 提示、無後端）；鎖定 Email 通道（payout/KYC/compliance）依規格 5.1.9 F3 呈現為不可關 | 可由 UI 調整 |
| UIA-010 | Fans CRM 的 Pareto 洞察句由前端依現有分布資料計算（無合格洞察整行隱藏）；粉絲清單列 4–9 與 Hall of fame 為示例資料，Load more demo 每批 4 筆（規格正式值 25） | 可由 UI 調整 |
| UIA-011 | IP Market 冷啟動空狀態由 `<html data-ip-market="empty">` 旗標切換（demo），非真資料驅動；「List your IP」CTA 暫指向 my-ip.html | 可由 UI 調整 |
| UIA-012 | 建立活動 Quality check 即時打勾、Review 回填、圖片/票種填入為前端 demo；「全通過才可 Publish」為就緒示意，未把硬性必填範圍定為規則（見 PG-009） | 可由 UI 調整 |
| UIA-013 | 2026-06-15 補建 5 頁（project-detail／register-ip／event-detail／fan-detail／tier-settings）皆為單一示例資料（金額/日期/名單/分潤/門檻）、前端 demo 互動，非真資料綁定；project-detail 目前固定單一項目、未依 `?id=` 切資料 | 可由 UI 調整／待後續資料綁定 |
| UIA-014 | register-ip（5.1.4.1）的 IP taxonomy（六型）、Worldwide 與個別地區互斥、計價單位（一次性/期租）、Proof 與驗證狀態關係、送出/上架文案＝示例呈現並於畫面標 pending，未寫回 documents（D037 產品待確認） | 待上游 |
| UIA-015 | event-detail（5.1.6 F5）退款吸收順序數字、轉售（Phase 2）、單票種完整欄位編輯器＝只呈現規則文字/標 TBD，不落地；tier-settings（F8）雙閘單調遞減驗證、版本不回溯＝只呈現、不自創驗證/版本邏輯（上游掌管） | 待上游 |
| UIA-016 | 建立商品（5.1.5.2 v2.6 / D063/D064）四能力的呈現選擇：多規格 Variations、庫存版本 Edition、取貨方式、每人限購三段切換皆用 `.segmented`（單一資料的互斥視角），限購用 `.switch`，標籤用新 `tag-input`（組合 chip）、多規格用新 `variant-builder`（選項建構器＋逐規格表）；多規格時以 D063 單一來源呈現（單一價格庫存隱藏、改逐規格表）。條件顯示由統一 `data-cp-show`/`data-when-var`/`-edition`/`-delivery` 驅動。選項自動生成組合、逐格價格庫存、排除組合、標籤增刪、就緒檢查動態 gating 皆 R 2.1 前端 demo（無後端、無真庫存重算）。就緒檢查把限量上限≥在庫、物流必填、限購上限當作 gating 僅為顯示層示意 | 可由 UI 調整 |
| UIA-017 | 建立商品多項 spec 標「產品待確認」（D064 §8.12 / D026）：多規格選項數上限、單件成本是否納毛利、限量 vs 建議的硬性必填劃分、QR 核銷機制、Shipping Categories 來源、每人限購 enforcement／退款回補額度、數位限量售罄後下載權。R 2.1 只呈現欄位/提示，不自創規則、不寫回 documents | 待上游（D064 §8.12） |
| UIA-018 | 商品細節頁（5.1.5.1 §2.3 / D064）新增的庫存版本／取貨方式／每人限購／商品標籤＝管理呈現，重用建立商品（5.1.5.2）的 `.segmented`/`.switch`/`tag-input` 元件與 `cp.*` i18n，條件顯示用 `data-when-edition`/`-delivery`；切換/輸入/標籤增刪皆前端 demo（無後端、無真庫存重算）。多規格商品的逐規格價格庫存「呈現與可編輯範圍」spec 標待確認，故單一規格範例頁不放逐規格表。**2026-06-29（D095）補**：詳細規格（Specifications，僅實體）已建——可編輯逐筆規格名稱＋值，重用 promote 出的 `spec-row` 元件＋`cp.spec.*` i18n、前端 demo；主分類選項移除已打散的 Special/Premium（對齊 §7.1/D080）。**2026-06-29（D096）補完**：商品圖片／素材（實體主圖＋附圖／數位封面＋附圖，重用 5.1.5.2 §4 F1 的 upload-showcase）、數位內容檔案（重用 §4.2 F11）、數位交付／存取說明皆已建；主分類 `#pd-main-cat` 切換實體↔數位連動顯隱 `data-pd-cat` 欄位（素材／詳細規格・取貨方式 ↔ 封面／內容檔案・下載存取）。spec §2.3 已移除「R 2.1.1 待建」字眼。**呈現假設**：素材／內容檔上傳皆前端 demo（無真實上傳/持久化、無真圖，沿用 dashed upload-tile）；真實上傳、多規格逐規格圖片、數位存取權限與下載防護＝產品待確認（上游後端範疇，非 site 待建） | 可由 UI 調整／待上游 |
| UIA-019 | 建立套組（5.1.5.4 §6.3/§6.4）的套組庫存＝min(成員)、成員限量/多規格相容性提示＝前端 demo 顯示層（讀成員 `data-stock`/`data-price`/`data-edition`/`data-variants` 計算，無後端、無真庫存重算）。**2026-07-02 D102（撤 D088）：組合定價由「固定價/折扣＋≤成員合計檢核」改為 `.cb-autoprice` 成員自動加總、唯讀不可編輯**（多規格成員→「從 $X 起」）；Create gating 改「name＋≥2 成員」（去 price≤sum）；bundle-detail 同步唯讀；submit 帶自動價文字。**2026-07-02 D103（修訂 D102）：折扣補回**——在自動 base 上加單一「折扣 %」欄（`#cb-discount`／`#bd-discount`，選填 0–100），粉絲付＝base×(1−折扣%)；有折扣顯示折後價＋劃掉 base（`.cb-basestrike`）＋「−N%·省 $Z」；create-bundle gating 加「折扣填了須 0–100」（discOk），bundle-detail 折後即時計算（base 靜態 demo）。**不恢復固定價/絕對折後價**（變體多價位語意不明）。**待上游**：買家結帳依所選規格的實際組合價、平台層組合優惠、販售排程特價機制。spec §4 F6 就緒檢查是否存在仍待確認、未建 | 可由 UI 調整／待上游 |
| UIA-020 | E-Shop IA（D065）呈現：nav「商品管理」改名「電子商店」、E-Shop 下拉收成兩項（電子商店／訂單管理）、商店設定移出下拉改為電子商店 F3「商店設定」鈕、以全螢幕 `embed-modal` 用 iframe 內嵌既有 store-settings.html（單一內容來源、不離開清單脈絡、關閉保留篩選）。popup／面板形式 spec 標非約束呈現參考；store-settings.html 仍為該 popup 的完整內容（檔名不變）。order-detail 取貨方式分支以 demo segmented 預覽（真實訂單由其取貨方式單一決定，非創作者於此切換）| 可由 UI 調整 |
| UIA-021 | E-Shop F3 改版（D066）呈現：(1) 狀態篩選每選項顯示目前類型商品數（All/Live/Low Stock/Sold Out/Draft），由前端讀清單列 `data-status` 計算、切 tab 重算；**數量是否隨關鍵字搜尋連動 spec 標待確認**，本輪數量不隨搜尋變動。(2) 建立鈕＝context-aware 分割按鈕（`split-button`），主鈕隨 tab、箭頭下拉列全部三類；分割按鈕形式 spec 標非約束。(3) See as fan 由 F3 工作列抽成 F5、原採右側常駐欄（**2026-06-15 改為可收合畫面分割，見 UIA-023**）；與商店設定／商品細節頁 See as fan 同一粉絲視角（§6.7）。皆前端 demo | 可由 UI 調整／數量連動待上游 |
| UIA-023 | E-Shop F2/F3/F5 版面改版（2026-06-15 使用者四項裁示）呈現：(1) **F2 低庫存**改 `.alert--bar` 全寬細條、置於 `.main` 頂端（頂欄之下、白色面板頂緣）、`position:sticky` 常駐、× 關閉復位、只留數量＋CTA（拿掉商品名）；中性白底＋警示圖示。(2) **F3 狀態篩選**由 select 改 `filter-tabs` 第二排 pill＋數量（讀 `data-status` 前端計算、切 tab 重算 reset 回 All；**是否隨搜尋連動仍待上游**），次級淺色、不用品牌色。(3) **F3 類型切換**加 `.tabs--brand` 淡橘 active 填色 pill（品牌色但不搶眼），僅 e-shop、不動全站 `.tabs`。(4) ~~**F5 商店預覽**＝常駐、不可關閉的畫面分割（永遠 `is-open`、移除切換鈕與 ✕／Esc）~~ **已被 D084 取代（2026-06-18）**：上游改規格為「F5 由 F3『預覽商店』鈕開啟、**預設關閉**、可關閉」，故 R2.1 改回**可開關**——F3 加切換鈕（`#eshop-preview-toggle`）、headerless 預覽加右上浮動 ✕（`.eshop-preview-close`）＋Esc，預設關＝管理區滿版。畫面分割版面（兩塊圓角面板＋接縫陰影）保留，只在開啟時呈現。窄螢幕（≤1100px）開啟時退化為靜態堆疊。標題由「粉絲眼中的商店」改「**商店預覽**」。**版面**＝灰底上的兩塊圓角面板（左主欄與右預覽欄各自頂角圓、中間一道 shell gutter，main 右上角因此露出圓角）；預覽內容包成白色圓角「店面頁」卡浮在灰底、內層商品改平鋪磁磚（Direction B，使用者選；`#eshop-preview` scope 覆寫共用 `.ss-fan`，不動 store-settings）。取代 UIA-021(3) 的右側常駐欄。皆前端 demo | 可由 UI 調整／搜尋連動待上游 |
| UIA-022 | 商店設定 popup 去頁首（D067）呈現：store-settings.html 改 popup-only——移除全域導航/麵包屑/page-intro，標題與關閉由 embed-modal 外框承擔；F1 動作（See as fan/Discard/Save）改內容底部 sticky `.ss-actionbar`。iframe 內 Save/Discard 以 `postMessage('ztor:storeset-close')` 通知父頁 `closeSet()` 關閉。**呈現假設**：(1) popup iframe 為獨立文件，其語言／主題隨 i18n.js／theme.js 讀本機偏好，與父頁切換不即時連動（開啟時為當下偏好）；(2) Save 為 demo 直接關閉、無「未儲存變更」攔截，是否提示 spec 標待確認（沿用 5.1.5.5 F1 註記）。直接開 store-settings.html（非經 popup）將無 nav，屬 popup-only 預期 | 可由 UI 調整／未存提示待上游 |
| UIA-024 | 新品貼文 popup（5.1.5.7 / D068）site 實作呈現假設：(1) **觸發**＝建立商品完成後導回 `e-shop.html?posted=1` 自動開啟（真實流程＝建立完成事件；demo 以 query 旗標模擬，商品名／價由 query 傳入、無資料綁定）。(2) **重用群發 composer**（受眾／標題≤120／內文≤2000／token／排程，message-modal.css）；發送機制不重定義、引用 5.1.7.1。(3) **發布為 demo**：點發布直接關閉、無後端；概念上通知粉絲＋寫入 Fans CRM（引用 5.1.7.1／5.1.2.2 §4.9）。(4) 略過／✕／backdrop／Esc 關閉、不影響商品已上架。(5) 標題與關閉由彈窗外框承擔、內容無頁首（比照 D067）；popup／面板為呈現參考、非約束。產品待確認沿用規格 §8.13：可否不附／換商品、預設受眾、公開動態與 §8.7 邊界、composer 是否跨模組共用、與群發訊息去重、未儲存提示。皆前端 demo | 可由 UI 調整／上述待上游 |
| UIA-026 | 2026-06-16 See-as-fan 粉絲端店面改版（使用者提供參考圖，選「只套版面、跟隨主題」＋「未定義欄位照加記提案」）：新增共用元件 `fan-store.css`＋partial `partials/fan-store.js`，E-Shop F5（商店預覽）與商店設定 F1（See as fan）共用同一份 markup（§6.7 同源、差異即缺陷），取代原 `.ss-fan`。版面＝hero cover＋本月精選＋分頁（商品/組合/競標）＋雙欄商品格；**顏色全走 token、跟隨全站主題（§6.9 不鎖深色）**，hero 為品牌色淺底帶（裝飾層、非 dark mode）。商品資料沿用管理側同一店面（保 §6.7 一致）。**⚠ 產品變更提案（未經上游核准、不得寫回 documents/）**：下列欄位現行規格未定義，§6.7 明訂「預覽不得引入規格未定義的欄位或數值」，本輪依使用者裁示先以提案呈現——(1) 追蹤數、(2) 社群連結（YT/IG/TH）、(3) 加入社群（follow/community）、(4) 本月精選（featured product）、(5) 立即購買（buy-now CTA）、(6) 「售完補貨中」狀態用語。皆 display-only 前端 demo、預覽不改資料。分頁/CTA 為呈現參考、非約束。**2026-07-02 手機版改版（使用者裁示，參考 endgame creator 商店手機版原型、僅視覺方向）**：呈現改為**預覽面板中央的深色手機**（`.fan-store__phone`＞`.fan-store__screen` 自捲動；三項確認＝手機外框／參考頁區塊全做／商店設定一起換）——app 頂列（sticky）＋hero＋sticky app 分頁列＋本月精選＋底線子分頁＋雙欄商品格（購物車圓鈕）＋頭號粉絲＋關於＋sticky 底部 app 導航。**主題例外**：螢幕＝粉絲 app 固定深色面（scoped `--fst-*` 寫死、不跟隨後台主題，同 vip-card 前例，登記 design-system.md Raw-color exceptions）——推翻本則 2026-06-16「跟隨主題不鎖深色」的舊選擇（fan app 是獨立產品、有自己的深色主題）。**提案欄位追加（7–12）**：(7) app 分頁列（活動/排行榜/貼文/關於）、(8) 頭號粉絲（名次圈＋積分，名單沿用 Fans CRM 排行榜 demo）、(9) 關於創作者（bio）、(10) 購物車（app bar＋商品卡加入鈕）、(11) 底部 app 導航（焦點/共創/社群/比賽/商店）、(12) 手機 app 外框本身（ztor 粉絲 app 的存在形態）。皆 display-only | **待上游核准**（12 項提案欄位）／版面可由 UI 調整 |
| UIA-027 | 2026-06-22 建立商品（5.1.5.2）右欄組成調整（使用者裁示）：**就緒檢查（Ready to sell?）由右側預覽欄常駐卡改為 footer chip 的 hover／focus tooltip**；右欄只剩商品卡＋上架開關。這與 §4.5「右欄三件＝預覽＋就緒＋上架開關」的版面描述分歧——**屬呈現選擇、非移除產品能力**（就緒檢查項與 gating 邏輯不變，只換出現位置與觸發方式）。tooltip 內容沿用 `.readiness` 元件（標題／清單／banner ID 不變，JS 照填）。footer 計數 chip 文案改雙語＋計數（`cp.ready.chip.*`／`cp.ready.banner.*`，`{n}` 代入剩餘項數，如「剩餘 7 項未完成」）。「稍後再存」由 footer 移到 header（預覽鈕左側）。就緒檢查「項目標籤」仍為英文（沿用原右欄，未在本輪翻譯）。皆前端 demo | 可由 UI 調整／§4.5 右欄組成建議回寫上游確認 |
| UIA-025 | 2026-06-16（D070）7 模組（projects／ip-market／my-ip／e-shop／events／fans／earnings）接 Cheat Codes「Data State＝Empty」的帳號無資料空狀態，為前端 demo：資料體 `.when-data`、空狀態 `.when-empty` empty-card，靠全站 `html[data-data-state="empty"]` 切換；與清單篩選「查無符合」空狀態並存分流。細節待調（屬呈現）：my-ip／部分頁的統計卡在 Empty 時仍顯 demo 值、未歸零；IP 市場帳號 Empty 未放 CTA（租用須先進詳情頁）；少數頁原用 `store`／`search-x`／`wallet`／`folder-plus` 等未在 icons.js registry 的 icon（會空白），已改用已註冊 icon、未動 icons 檔（若要原 icon 需補 registry） | 可由 UI 調整 |
| UIA-028 | 2026-06-23 建立流程 header v2 改版＋儲存／離開行為（使用者裁示）：**(A) header 單列無底線**——左＝返回箭頭（chevron，取代「✕ Close」文字）＋標題/副標靠左、箭頭對齊主標題行；中＝進度條（有 stepper 頁，內容寬置中對齊 `.wizard__body`；無 stepper 頁此欄空）；右＝自動儲存狀態＋預覽。content 區底色 `--card`、footer `--surface-shell`。**(B) 儲存狀態**＝兩態「已儲存／儲存中…」，全頁 autosave（任何輸入→短暫儲存中→已儲存，前端示意 `partials/wizard-chrome.js`）；`.wizard[data-autosave="false"]` 時改可點的手動「儲存」鈕（fallback）。**(C) 返回離開確認**＝點返回箭頭，編輯過→彈窗「儲存並離開／不儲存就離開」（取消＝右上 ✕）；未編輯過→彈窗「離開」（取消＝✕）。「編輯過」＝本次有任何輸入（非「有未存變更」）。**⚠ 屬產品行為**：未存離開提示原規格列「待確認」（沿用 5.1.5.5 F1／UIA-022 註記），本輪依使用者明確指示先實作為前端 demo（不真持久化、leave＝`history.back()`），未寫回 documents/；autosave 節流時間、儲存失敗態、實際持久化由上游定 | **待上游核准**（儲存模型／未存提示）／版面可由 UI 調整 |
| UIA-029 | 平台營運（Admin）層為 site demo（D086）：creator 名冊與「建立 creator（自動生成 eShop）」為前端示意——roster 資料（denise／aya／kmt）、建立後 in-memory append、活躍 creator 切換皆無後端 | 可由 UI 調整 |
| UIA-030 | Tier 1 頁有兩種呈現（依是否已選定 creator）：**未選＝一般創作者視角**（純 dashboard、無 admin chrome，即之前的版本）；**已從名冊 Manage 選定＝admin 代管視角**（logo 前返回名冊 icon＋「管理中 X」）。切換走 devtools「Creator · Admin」cheat code（選 creator＝代管、選「一般創作者」＝清除）。creator 自助登入的實際 auth 仍為 phase 2（D086）| 可由 UI 調整 |
| UIA-031 | 返回 Creator 名冊入口固定置於導航 logo 之前（使用者裁示，D086）；圖示與樣式可由 UI 調整 | 依裁示 |
| UIA-032 | creator 工作區範圍已確認＝完整現有工作區（Dashboard…Settings，§8.3／D086）；**creator 狀態枚舉已由 D097 定案＝啟用中／已停用（兩值），撤除 site 早期自塞、無上游依據的已發布／草稿**；店鋪識別唯一性、代操稽核仍待上游 | 狀態已解決（D097）；唯一性／稽核待上游 |
| UIA-033 | 建立組合／組合細節擴充至 spec 5.1.5.4 v1.6（D089）：F1 加素材（Show it off，沿用 upload-tile）＋描述（textarea）、F4 限量改庫存（Edition 不限量/限量＋唯讀「目前在庫＝min(成員)」）、F7 排程特價（啟用 toggle＋起訖日）。**呈現假設**：(a) 素材上傳、描述皆為前端 demo（無實上傳/持久化）；**主圖＊與描述不納入 Create gating**（避免 demo 永遠擋住建立）——僅名稱＋≥2 成員＋有效定價納入 gating；(b) 限量版本的「組合上限 Total quantity」**納入 gating**（限量需填有效正值，對齊欄位 ＊）；(c) 目前在庫唯讀＝min(成員,上限)，即時重算、不可手動編輯；(d) 排程特價啟用時起訖日必填且結束晚於開始（§6.1，納入 gating），但特價價格來源、時區、結束自動回原價、是否與單品共用排程＝**產品待確認**（spec §4 F7），UI 以「pending spec」提示標示、不自創價格欄。組合細節頁（5.1.5.9）同步同欄位＋%off 改雙欄，為 display-only demo | 呈現可調；F7 價格/時區待上游 |
| UIA-034 | 電子商店 F4 清單草稿列空值占位（spec 5.1.5 F4 三類共通／D092）：草稿（`data-status="draft"`）列每一欄都以占位呈現——**占位文案**（D092 待辦交 project-ui-creator 定）：名稱→「未命名（Untitled）」（`.product-list__title--draft`，淡色斜體）、圖片→既有預設 placeholder、次分類／價格／庫存／成員／出價／動態等未定欄→「—」（`.product-list__empty`，淡色）；草稿列上架開關預設關閉（未上架）。三類清單（Products／Bundles／Auctions）皆加一筆草稿範例列；**Auctions 原狀態集無 draft，本輪補上 `draft` 篩選＋草稿拍賣列**（拍賣草稿＝已建未排程，列操作 Edit→create-auction 補齊）——屬呈現層 demo，拍賣 draft 的正式語意未定者仍待上游。占位僅缺漏提示、不改商品實際狀態（§7.2）| 占位文案可調；Auctions draft 正式語意待上游 |
| UIA-036 | Creator 管理頁優化（2026-06-30 使用者反饋＋D097）：(a) **建立 creator 改 popup**——重用 canonical 對話框外殼（`.payout-modal`/`.payout-dialog`，比照 message-modal），取代原 inline 展開表單；(b) **狀態兩值**＝啟用中（`badge--success`）／已停用（`badge--neutral`＋列淡化），新建預設啟用中（D097）；(c) **停用／啟用**收進列尾 ⋯ 溢出選單（`dropdown`），in-memory 切換——**已停用 creator 本輪 demo 仍可被 Manage 進入代操**（spec F4「已停用是否可代操」待確認，未閘控）；(d) **搜尋／篩選**（名稱/識別關鍵字＋狀態 All/Active/Disabled，僅影響檢視，對齊 F1 既有要求、補建站漏項）；(e) **名冊摘要列**（共 N 位·X 啟用中·Y 已停用，i18nT 組字＋`i18n:applied` 重譯）；(f) **整列可點進管理**（按鈕／選單 stopPropagation）；(g) **對齊電子商店元件（D098）**：搜尋改 field-pill、狀態篩選改 filter-tabs（附數量）、列改 product-list 列骨架（含欄位表頭）、管理鈕英文改 Enter（zh 前往）；(h) **D099 再調整**：移除名冊概覽（bento）改由 filter-tabs count 承載各狀態數量、狀態篩選與搜尋改同列（篩選左/搜尋右）；規格 5.1.0 F 項最終為 F1 頁首／F2 名冊工作列／F3 Creator 名冊／F4 進入返回。皆前端 demo、無後端 | 呈現可調；已停用可否代操待上游 |
| UIA-035 | 電子商店 F4 Products 售罄（Sold Out）狀態徽章（spec 5.1.5 F4／D093）：**顯示文案**（D093 待辦交 project-ui-creator 定）＝沿用既有 i18n `e-shop.row.out`（en「Sold Out」／zh「已售完」）；**徽章變體＝`badge--neutral`**（灰），與 Low Stock 的 `badge--error`（紅）視覺區隔——售罄＝庫存歸零、低庫存＝低於門檻仍有貨，不可混用（D093）。Products 加一筆售罄範例列（`data-status="out"`，stock「剩 0 件」、實體可補貨、仍上架）；Hidden 徽章維持既有「Shop 開關關閉→動態改 neutral『已隱藏』」。沿用設計系統既有 Sold Out 徽章慣例（design-system restock demo 即 neutral）| 文案／灰階可調 |
| UIA-036 | 電子商店 F4 三類共通·分批載入（spec §三類共通／D094）：清單分批漸進載入＋「載入更多」＋全部載完 end-cap「已顯示全部 N 筆」（N 對齊狀態篩選相符總數）；切換類型分頁／改搜尋／改狀態→重置回第 1 批；0 筆走查無符合（與 end-cap 分流）。**呈現/工程選擇**（D094 委派 BUILD-SPEC）：(a) **批量＝25**（規格預設，使用者裁示，原 10）——demo 不再用較小批量；**demo Products 補滿至 30 筆**（JS `fillDemoProducts()` 生成 24 筆樣本列）以真實 25 批量展示「載入更多」：30 筆 → 顯示 25＋載入更多 → 全 30＋end-cap「已顯示全部 30 筆」；Bundles/Auctions 仍 <25 → 直接 end-cap、無載入更多。「載入更多」鈕用無外框 `btn--ghost`（使用者指定）。生成列為 demo 樣本（Live、無圖佔位、英文品名），套 icons／i18n（Live 徽章可中英切換）；(b) 採「按鈕點擊載入」非捲到底自動載入；(c) end-cap 文案＝「已顯示全部 N 筆／Showing all N items」（JS 生成、隨語言重算）；(d) **縮圖 lazy load（D094 改版）**：真實縮圖 `.product-list__image img` 採 `loading="lazy"`、僅捲入視窗才抓圖——惟本 demo 三類清單為**無圖 CSS 佔位**（「ztor.」字樣／圖示，自架不依賴 CDN），無真實 `<img>`，故 lazy-load 記為「真實縮圖的撰寫慣例」、**demo 無可見效果**（使用者裁示：記成慣例、不放假圖）。**排序達任一位置（D083/D094）於 demo 未實作門檻邏輯**——demo 清單小，「載入更多」載完即可對全部列拖曳重排；正式「小量全載排序／大量移到指定位置」的門檻數字待 BUILD-SPEC／工程定 | 批量/載入方式/門檻可調；lazy-load 待真實縮圖 |
| UIA-037 | 建立商品「Show it off」互動上傳格（spec 5.1.5.2 §4，promote 成 `upload-tile.css` 互動狀態＋`partials/upload-tile.js`，opt-in `[data-upload]`）：點擊開檔案選取→選到圖以 `createObjectURL` 顯示→假上傳進度（~2.5s）→已上傳；空狀態 hover 顯示更多資訊；已上傳 hover 出「替換／AI 優化／刪除」。**呈現假設**：(a) 真實上傳／持久化未實作（純前端 demo）；(b) 就緒檢查沿用既有 `assets[key]`（同 key 多格取任一已上傳）、行為不變。**產品變更提案（待上游核准）**：**「AI 優化」＝把圖轉成「我們的制式規格」上游規格與 decisions 完全無此功能**（媒體規格目前只有尺寸下限：主圖/封面 800×800、附圖 600×600）——按鈕為假動作（「優化中…」~1.2s→「已依規格優化」徽章），不真的裁切/處理。制式規格的定義（目標比例/尺寸/格式/自動裁切規則）、是否為平台功能、觸發時機與可否還原皆待上游決定；未核准前不寫回 `documents/`、不宣稱可用 | AI 優化＝產品變更提案，待上游；上傳/持久化 demo |
| UIA-038 | 電子商店 F4 Products 草稿列置頂＋不可拖曳（2026-07-01 使用者裁示）：拖曳重排＝粉絲端陳列順序（D083），草稿（`data-status="draft"`）未對粉絲顯示、無陳列順序，故**排除於拖曳排序區**——握把隱藏、不可起拖（`pointerdown` 對草稿列 return），且**不可被其他列插到其上方**（`follow()` 只把非草稿列當讓位對象），並由頁面 JS **置頂**（`pinDrafts()` 於載入時把草稿列移到清單最前，供創作者補齊）。屬拖曳排序的呈現/互動細化，不改草稿狀態語意（§7.2/D092）與陳列順序規則（D083）；只 Products 分頁（唯一可拖曳）。CSS 藏握把規則進 `product-list.css`（`[data-status="draft"] .product-list__drag`）、DS drag State 表補一列。**草稿列 kebab 選單組成**（2026-07-01 使用者裁示）：**移除「在商店上架」開關**（草稿未備齊、不提供直接上架）＋**新增「刪除」破壞性項**（`dropdown__item--danger` 紅字 ghost，promote 進 dropdown-menu.css）；狀態徽章維持「草稿（Draft，`badge--neutral`）」。刪除為 demo（`data-eshop-delete` 直接移除列＋重算分批/計數），完整 destructive 樣式與確認流程待規格（比照 create-product `cp-delete` 註記）。**草稿「編輯」進入建立流程頁**（2026-07-01 使用者裁示）——草稿＝未完成的建立，編輯＝回到建立精靈：Products 草稿 Edit→`create-product.html`、Bundles 草稿→`create-bundle.html`、Auctions 草稿→`create-auction.html`（原本就是）；非草稿列 Edit 仍進細節頁（product-detail/bundle-detail/auction-detail）。屬 IA/互動決定，不改產品規則 | 可由 UI 調整；刪除確認流程待上游 |
| UIA-039 | E-Shop 商品列表「上架/下架」狀態顯示文案（2026-07-01 使用者裁示；D093「列上顯示文案由 project-ui-creator 定、內部狀態維持 §7.2」）：**商店上架→狀態「上架中」（Live）／商店下架→狀態「已下架」（Unlisted）**。改 i18n 顯示層——`e-shop.row.active`＋`e-shop.status.in`（Live 篩選 tab）zh 由「已上架」改「上架中」（對齊 product-detail badge.live 既有「上架中」）；`e-shop.row.hidden` 由「Hidden／已隱藏」改「Unlisted／已下架」（列 kebab 關閉「在商店上架」開關→狀態徽章改此）。**內部狀態不變**（`data-status` 仍 live/hidden，§7.2 庫存/可見度軸不動），僅列上顯示字。三類（Products/Bundles/Auctions）Live 徽章與 Live 篩選 tab 共用同鍵，一併生效 | 顯示文案可調 |
| UIA-040 | 會員卡卡面自訂器 vip-card（spec 5.1.5.2 §4.2 F11.2，已寫回規格 v5.4）呈現假設：(1) **卡片公版為 CSS 近似**——`.vip-card__frame` 全像漸層＋`.vip-card__plate` 霧面玻璃卡＋serif logo＋OFFICIAL MEMBERSHIP 副標，皆前端 demo；實際平台公版素材、精確合成版位與輸出（真正把文字/logo 燒進卡面圖）待提供；(2) **裸色例外**：公版藝術用固定 hex/rgba（theme-independent），已在 design-system.md「Raw-color exceptions」列明（比照 selection-card 主題色票）；(3) Text 輸入即時更新卡面文字（空→LOGO 占位）、Image 上傳 PNG 以 `createObjectURL` 顯示，皆不持久化；就緒（d-file）＝名稱有字或已傳 logo。**產品待確認**（規格內已標）：多公版可選、卡片名稱字數上限、logo 格式/尺寸硬限制與去背、副標可否編輯；會員權益/效期/tier/存取＝D071 擱置 | 呈現可調；公版素材/合成/上述待上游 |
| UIA-041 | 內容檔（音樂/影片單一分類）互動上傳（spec 5.1.5.2 §4.2 F11，呈現層）：單檔內容格由「點一下切 is-filled」升級為 `data-upload="content"` 互動格（比照 Show it off 圖片上傳）——點擊選檔→假上傳進度→已上傳；**音訊/影片可即時預覽播放（真實 `<audio>`/`<video>` 播放所選檔）**＋替換＋刪除，無 AI 優化。`accept` 隨分類（音樂→`audio/*`、影視→`video/*`、其他→任意；非媒體檔隱藏播放鈕）。**呈現假設**：真實上傳/持久化未實作（`createObjectURL` 本機預覽）；播放預覽為協助創作者確認檔案的呈現能力、非產品規則（F11 已標呈現參考·非約束）；就緒 d-file＝已選檔。共用 `partials/upload-tile.js`（`upload-tile.css` 內容態）| 呈現可調 |
| UIA-042 | 低庫存門檻（spec §7.2／5.1.5.1 §2.3／5.1.5.2 §4.1，**2026-07-02 D105**）：門檻**預設＝該品項庫存上限的 10%**（原前端寫死 5）。R 2.1 呈現：(1) **建立商品**低庫存提醒開關加副說明「在庫存降到庫存上限的 10%（預設低庫存門檻）時提醒你」（`cp.lowstock.hint`）；(3) **補貨彈窗**每列 meta 的 threshold 由 e-shop 控制器以 `lowThr(cap)=ceil(cap×10%)` 逐品項導出（demo cap：tee S30/M·L40、hoodie 30–60、sticker 50、LP150、poster100→門檻 3–15），無 cap 的一般清單列則隱藏 threshold meta。**2026-07-02 更新（使用者裁示現在就做 S31.1）**：(2) 改為**版本切換兩態**——低庫存門檻自訂（S31.1）現已建置，交付切割改由 cheat code「版本」控制呈現：**建立商品**加「自訂低庫存門檻」輸入格（`data-feat="S31.1"`）、**商品細節頁**門檻欄成對＝base 唯讀自動 10%（`data-feat-off="S31.1"`）⇄ 升級版可編輯（`data-feat="S31.1"`）。Phase 1 版隱藏自訂、顯示固定 10%（沿用 D105「Phase 1 用固定 10%」）；Next+／最終版（原型預設）顯示可編輯門檻。**devtools.js 兩處 infra**：ID 正規表達式支援小數點子 ID（`S31.1`）＋新增 `data-feat-off` 反向閘。**未反轉 D105**（Phase 1 體驗不變）、未動 documents/。**建立商品自訂門檻互動（使用者回饋）**：自訂門檻輸入格僅在「庫存快不夠時提醒我」開關**開啟**時顯示（JS 控 `hidden`，與 data-feat 版本閘、data-cp-show 型別各自獨立）；顯示時**預填＝庫存基準 ×10%**（無條件進位）並隨基準即時重算，基準＝限量的總量上限／不限量的目前在庫（**不限量無硬上限，10% 基準為 demo 代理，spec §7.2 待確認**）；使用者手動改值即停止自動覆寫、清空回自動。皆前端 demo（輸入無後端、無真庫存重算）。**待上游**：不限量（Unlimited）的 10% 基準（demo 暫用在庫）、取整方式、逐規格門檻粒度（spec §8／D105 待辦） | 可由 UI 調整／基準·粒度待上游 |
| UIA-043 | 商品細節頁卡片重分（spec 5.1.5.1 §2.3–§2.5，**2026-07-02 D109**）：價格·庫存·低庫存門檻自「Product content」卡移出，另立「Price & stock」卡（`#pd-pricestock`），Edition 與 Restock history 由原「Inventory, delivery & buyer settings」卡一併移入；該卡更名「Delivery & buyer settings」。純資訊分組，欄位定義與 demo 行為不變。**呈現觀察（待上游／可 UI 調整）**：Price & stock 卡同時有獨立「Stock」欄（3 欄格，供不限量情境顯示目前庫存）與 Edition 限量子欄位的「Goods in stock」，限量模式下兩者語意重疊——此重疊在拆卡前即存在（分屬兩卡不明顯），co-locate 後更明顯。是否合併為單一庫存輸入（隨 Edition 切換上限欄）屬產品／資料建模決定，本輪不動、標記待上游釐清 | 可由 UI 調整／庫存欄合併待上游 |
| UIA-044 | 全域外觀鎖定（spec §5.2.1／§6.9／§7.4，**2026-07-03 D108／D110**）：**主題固定淺色**（`theme.js` `readStored()`→`light`、boot `apply("light")`，忽略舊儲存與 `?theme=`）、**語言固定繁體中文**（`i18n.js` `DEFAULT_LANG='zh-Hant'`＋啟動強制、覆寫 localStorage），兩者移除切換鈕（`sidebar.js` 拿掉 topbar／sidebar 的 `data-theme-toggle`／`.app-topbar__lang`；settings 移除主題三卡與 Profile 語言偏好欄）。**顯示模式保留可切換、預設側邊欄**（navmode `readStored` 預設 `sidebar`，切換鈕 `data-nav-toggle` 保留）。深色主題與英文 i18n 字串**移出 v1、非刪除**（DICT 英文保留、深色 CSS 保留），未來恢復依 spec backup_plan Plan167；語言／主題偏好的帳戶級持久化＝產品層，v1 不提供 | 呈現可調（範圍縮減依上游 D108／D110） |
| UIA-045 | Creator 管理擴充（spec 5.1.0，**2026-07-03 D107**）：(a) **未選 creator 時導航只留「Creator 管理」marker**——`sidebar.js` `topbarNavHtml/sidebarNavHtml` 在 locked 時回空字串，移除原鎖住的 Tier 1 模組列（撤 UIA-030 的「roster 鎖 Tier 1」呈現）；(b) **建立表單擴充**＝頭像（file demo）＋email（必填）＋電話（選填）＋店鋪網址（`ztor.com/shop/…` 即時預覽）＋名稱；handle **平台唯一**→建立時 in-memory 擋重複（`setCustomValidity`）；(c) **名冊列**加「創建時間」欄（`CREATORS` 補 `created`，建立以 `new Date()` 記；≤720px 收欄），頭像沿用首字母。皆前端 demo（頭像上傳無持久化、email/電話無驗證後端、名冊無後端）。**待上游**（見 UIA-032／PG-015）：handle 格式硬規則、email 是否唯一/驗證、自動生成店鋪初始狀態、代操稽核檢視 | 可由 UI 調整／欄位驗證·稽核待上游 |
| UIA-046 | 取貨管理 demo 呈現（spec 5.1.5.11，**2026-07-03 D111**）：(a) **QR 為 faux SVG**——`window.ztorFauxQr()` 生成 finder pattern＋偽隨機模組的可視 QR 佔位，非真實可掃碼；真實 QR 生成／簽章／掃碼解析屬工程層。(b) **手機 scanner（`scanner.html` F7）為前端 demo**——密碼閘接受任意非空字串（無真實密碼驗證、無 5 次鎖定計時、無相機權限流程、無離線暫存/server 同步）；「模擬掃描」循環四個寫死情境（有效/有效票券/重複/不屬此場次）示意結果與確認流程。(c) **場次、名單、核銷紀錄、KPI 皆為 sample 資料**——無後端；建立場次 popup 送出只產生示意 scanner URL、不落地；反轉/匯出/複製 URL 為 UI 示意。(d) **相機視窗**用 `--surface-inverse` role token 呈現「深色相機」意象，非真實影像。**待工程/上游**：真實 QR 與核銷後端、scanner 認證與鎖定機制、離線暫存與 server 同步、取貨資格狀態機與 Events 票券回寫的實作口徑（spec §狀態回寫已定行為、實作待工程） | 呈現 demo；核銷/認證/回寫機制待工程實作 |
| UIA-047 | 取貨管理拆頁（spec 5.1.5.14／5.1.5.15，**2026-07-06 使用者裁示**）：原 pickup.html 單頁靠 `data-pickup-view` 切 list/detail、detail 內再用 `.tabs` 切 items/roster/log，皆為 JS 內部狀態、無獨立網址——分享連結、加書籤、重新整理都無法停在原本畫面，與規格「各自獨立頁」的 IA 不一致。**已拆成真實檔案、真 `<a href>` 導覽**：`pickup.html`（清單 F1–F4）／`pickup-detail.html`（5.1.5.15，場次資訊+Scanner URL 與密碼+核銷紀錄+取貨/入場名單完整管理版）／`scanner.html`（5.1.5.14，掃描+可核銷項目正式定義+唯讀簡化名單）。**2026-07-06 D121 追加**：可核銷項目與取貨/入場名單原本規劃另開 `pickup-roster.html`（5.1.5.13）獨立頁，使用者改裁示 5.1.5.13 整份退役、兩部分分別併入 scanner.html（F2）與 pickup-detail.html（F4）；scanner.html 新增 Scan/Items/Roster 分頁互切（僅本頁內切換，不連出其他工作台頁面，對齊 scanner 權限邊界）。**呈現假設**：三頁皆為單一固定 demo 場次（Taipei signing），不支援 `?id=` 依場次動態切換內容，與其他既有 detail 頁（product-detail、order-detail 等）現況一致（見 UIA-013 先例）；若日後要支援「分享連結直接開到指定場次」，需另補依 ID 動態渲染的產品/工程決定 | 可由 UI 調整；依 ID 動態切換待上游 |


| UIA-083 | **2026-07-24 項目 demo 資料覆蓋十種內容類型（`js/projects-store.js`）**：11 筆 demo 項目的名稱、簡介與圖片取自 ztor 公開端共創計畫預覽站（`ztor-cocreate-preview.vercel.app/cocreate.html`），為**示意素材、非真實項目**；金額、人數、進度、日期同為示意值。影視與音樂以外的四種內容類型（活動／其他商品／文檔／自訂）該站沒有樣本，名稱依同一世界觀補寫（九龍冰室十週年放映會／廟街風雲週邊組合／海上霸姬幕後紀錄／低俗喜劇之嗨仔番外篇）。**內容類型 taxonomy 本身不是新發明**——十種選項照上游 spec 5.1.2.1 §4.1 F3 既有定義；本輪只是把 demo 資料補齊到覆蓋全部類型，並把清單篩選對齊該定義（順帶修正舊值 `film`／`single` 與兩處中文用語）。`family`（film／music／other）是**呈現層分組**，只用來決定「音樂家族才顯示版稅分析區塊」，不是新的產品欄位。真實項目資料與 `?id=` 的後端查詢屬工程 | 可由 UI 調整；真實資料與查詢待工程 |
| UIA-088 | **2026-07-30 建立項目「發布項目」導向的是示範專案、非剛建立的那一筆（`create-project.html:1270-1290` `publish()`）**：原型無後端、不會真的建立專案，發布後導向 `project-detail.html?id=<id>` 時，`id` 指向「與這次選的類型相符的第一筆既有示範專案」（`golive`→nick-lrh、`fund`→nick-r2、`preorder`→nick-wo-de-i），讓詳情頁至少長得像剛建立的那一種；找不到同類型示範專案就不帶 `id`，詳情頁自行退回第一筆。**呈現假設**：真實情境應導向剛建立的那一筆專案 id，此為原型替身、非最終行為。**順帶記一筆既有的資料代號分歧（非本輪新增，本輪查找時才發現）**：建立流程 wizard 的類型代號是 `golive`，`js/projects-store.js` 記錄的專案類型代號是 `go-live`（`fund`／`preorder` 兩邊一致，只有這個不同），目前只在 `publish()` 的查找處做一次性對映（`create-project.html:1285` `STORE_TYPE` 表），未改動任一邊的既有代號——統一代號會牽動清單頁（`projects.html`）與詳情頁（`project-detail.html`）所有讀取端，範圍較大，待上游或治理另輪處理 | 可由 UI 調整；真實建立與代號統一待上游／工程 |

## 產品缺口

| ID | 缺口 | 目前處理 |
|---|---|---|
| PG-001 | IP Market 站內競標、簽約、付款、租期與爭議規則未定 | R 2.1 只能展示探索與詢問；交易能力不得宣稱可用 |
| PG-026 | **上傳資料檔的格式與必要欄位未定（2026-08-01，D165 待確認 1）**：D165 把 YouTube／Instagram／TikTok 改成創作者自行上傳，Spotify 另開放上傳備援，但沒有定義接受哪些檔案格式、必要欄位有哪些、各平台後台匯出的原始檔是否直接可用。原型的上傳彈窗因此**刻意不寫任何格式、副檔名、大小上限或欄位名**，只講「從平台後台匯出的檔案，不用改動內容」與各平台的匯出路徑 | 呈現層不自行決定；上游定案前文案維持中性，不出現 CSV／MB／欄位名 |
| PG-027 | **同期間重複上傳的處理未定（2026-08-01，D165 待確認 2）**：同一個平台、同一段期間再上傳一次，是覆蓋、累加還是拒收；跨期間的多份檔案如何拼接成一條連續的數列。原型的 YouTube 列給的是「更新檔案」而非「再上傳一份」，等於暗示覆蓋——這是排版上的暫定說法，不是產品裁決 | 待上游裁決；裁決前不在畫面上承諾任何一種行為 |
| PG-028 | **上傳資料的效期與過期後的計入方式未定（2026-08-01，D165 待確認 3）**：一份上傳的檔案多久之後算過期、過期後那個來源是否退出「有效來源」、它的數字是否仍計入 F2 起的彙總。這條決定「來源異常（Degraded）」這個頁面狀態什麼時候觸發，目前原型只示範官方串接中斷這一種異常，沒有示範資料過期 | 待上游裁決；原型暫不示範資料過期態 |
| PG-018 | **支持方案發布後能否編輯未定（2026-07-24）**：項目詳情把支持方案定義（名稱／價格／名額／內容）移到「方案與承諾」分頁，並依使用者指示**保留編輯入口**（`pd-edit-tier` 抽屜）。但規格 5.1.2.2 §2.2.5 只說明方案是可編輯區段，未定義**發布後**的可編輯範圍——價格與名額是對已支持者的承諾，通常應鎖定或需確認流程，文案類欄位可能仍可改。本輪原型讓全部欄位都能開啟編輯（無持久化、無驗證），抽屜內以提示文字標明「已有 28 人支持、發布後能否更動待產品裁決」。待確認：(a) 發布後哪些欄位可改；(b) 已有支持者的方案改動是否需通知或重新同意；(c) 名額能否下調到低於已售數。未經上游核准前不寫回 documents/ | 由上游裁決發布後的可編輯範圍；裁決前原型維持全部可編、以提示文字標示待決 |
| PG-002 | 拍賣的加價、保留價、延長、付款與流標規則未定 | 建立拍賣不可進入正式交易 |
| PG-019 | **拍賣詳情 §2.3「競標生命週期階段」已撤除，規格仍定義（2026-07-27，使用者裁示）**：`auction-detail.html` 原有一列三階段指示器（預展／開放競標／結果，目前階段加框），使用者指出它與 §2.2 頁首的狀態徽章（競標中）是同一件資訊，創作者端不需要再看一次前後階段，裁示只留徽章。原型已移除該區塊與其專屬樣式、三個 i18n key（全站無其他消費者）。**衝突點**：規格 `documents/5.1.5.8-拍賣商品細節頁.md` §2.3 仍把「競標生命週期階段」列為頁面內容、§3 顯示順序第 3 項也還在，因此目前原型未覆蓋 §2.3。**待上游裁決**：(a) 正式從規格移除 §2.3（同時調整 §3 顯示順序編號）；或 (b) 保留規格、要求原型復原，並定義它與 §2.2 狀態徽章的分工（例如徽章只講當下、階段列負責時間軸）。裁決前不回寫 `documents/` | 原型依使用者裁示已撤除；規格 §2.3 是否同步移除待上游 |
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
| PG-015 | **代操操作紀錄（audit log）檢視畫面未定**（spec 5.1.0 F4／D107）：D107 要求平台記錄操作紀錄、每筆標執行身分（Admin 代操／creator 本人），但**檢視介面**（是否有專門頁、可否依 creator／時間／身分篩選、保存期限）在規格標〔產品待確認〕。R 2.1 **未建任何 log 頁面或入口**，不以前端 demo 偽造稽核視圖 | 上游定操作紀錄的檢視 UI 與資料口徑後再建；未定前不自創稽核頁 |
| PG-016 | **IP 詳情頁分頁內容缺口（2026-07-11 分頁接線時發現）**：ip-detail 的五個分頁（Overview／Terms & usage／Assets／Bidding／Owner contact）原為裝飾性標記、本輪接上切換 JS 後暴露兩個上游未定義：(1) **Assets 分頁無任何內容**——頁面與規格皆無「IP 資產清單／預覽」定義，目前面板為空白，未偽造內容；(2) **「Manage as owner」管理區塊歸屬不明**——語意不屬五個分頁任何一個（非聯絡 owner、非條款），暫置 Overview 並在頁內以 HTML 註解標記 | 上游定義 Assets 分頁內容與 Manage as owner 的 IA 歸屬後調整；R 2.1 不偽造資產內容 |
| PG-016 | **POPCORN 定價換算與收款規則未定**（spec 5.1.5.2 F3.2／D124，BRD BR-05／I-4、OQ-1）：定價單位切換的 UI 已依 D124 落地（現金／POPCORN，見 UI-CHANGES 2026-07-09 A），但**現金→POPCORN 的換算率、是否即時換算或各自定值、POPCORN 收款上線與否**皆待上游——換算率規格標「待確定」、POPCORN-as-tender 依 **OQ-1（法務）**受閘控。**呈現處理**：切到 POPCORN 只把價格欄 placeholder 由 `$ 0.00` 換成 `POPCORN 0`、隱藏同分類均價提示，為**探索性佔位**；不做任何換算計算、不宣稱可收 POPCORN，現金仍為定價之準。create-product.html `#cp-price-unit` | 上游定換算率與 OQ-1 法務結論後，再補換算顯示與收款；未定前維持現金為準的佔位切換 |
| PG-017 | **數位「IP 資產」內容檔素材槽未定**（spec 5.1.5.1 §2.7／5.1.5.2 §4.2 F11／§7.7 Media Pack「上傳格與素材明細待補」）：商品細節頁 §2.7 內容檔依數位次分類切換形態，其中**IP 資產＝「依 IP 類型的素材槽」，但各 IP 類型（Story World／Person-Based／Brand／Event Format／Other）的槽位明細上游未定義**，建立商品頁（create-product）也未實作此形態。product-detail 對 `content:'ip'` 顯示**明確標註的探索性 placeholder**（info-banner 說明待補＋4 個通用素材槽 upload-tile），不偽造正式素材結構。目前無任何 e-shop 清單商品用到 `ip`（無示意列），此形態只在資料驅動預留 | 上游定義各 IP 類型的 Media Pack 槽位明細後，create-product 與 product-detail 一併補正式形態；未定前維持標註 placeholder |
| PG-020 | **項目詳情「販售上限—自動」與套組價格皆缺分潤名額真實來源（2026-07-30 提出；2026-07-30 第二批因價格改自動計算而追加缺口）**：套組編輯器的「自動」上限＝從一個共用的分潤名額池推導可賣份數（池剩餘 ÷ 每份含名額），套組價格（第二批新增）＝名額數 × 每名額單價 ＋ 商品定價加總。create-project 建立流程兩個數字都是真的：名額池讀募資步驟的「支持者名額」（`#fd-slots`，即時變動），每名額單價讀募資步驟算好的唯讀欄位 `#fd-perslot`（目標金額 ÷ 支持者名額）。但 project-detail 是既有項目的詳情頁，**沒有對應欄位可讀**——已發布項目的分潤名額總池、以及每名額單價，該存在哪個欄位或由哪個 API 提供，規格未定義。**呈現處理（2026-07-30 第二批更新）**：`project-detail.html:1675-1678` 從項目資料僅有的目標金額（`fund.goal`）反推兩個示意值——每名額單價寫死 `PER_SLOT = 200`（對齊建立流程的原型預設值），名額池 `SLOT_POOL = Math.floor(goalAmt / 200)`（金額抓不到時退回 100）；`js/bundle-editor.js` 的 `mount({ pool: SLOT_POOL, perSlot: PER_SLOT })`（project-detail.html:1718-1719）吃這兩個值。這讓「自動」上限與套組價格的計算邏輯有東西可算，但名額池與每名額單價都不是真實資料、只是从目標金額換算出的示意值。若上游定義「已發布項目的分潤名額池」與「每名額單價」的真實來源（例如延續建立時的 `#fd-slots`／`#fd-perslot`，且名額池可能已被既有支持者部分佔用），詳情頁需要改讀真實值並隨時反映真實剩餘量與單價，而非用目標金額換算。**2026-07-30 第三批補充**：套組優惠改百分比欄位後，`maxPct()`＝floor(商品定價加總÷原價×100) 同樣依賴這兩個示意值換算，真實來源未定前上限百分比也只是示意值 | 上游定義已發布項目的分潤名額池與每名額單價的真實資料來源後，project-detail 改讀真實值；未定前維持「目標金額 ÷ 200」的固定換算 |
| PG-021 | **商品／組合列的「粉絲分級」欄無規格出處（2026-07-29 落地、2026-07-31 改模型）**：此欄（值＝買得到的最低分級）是 2026-07-29 由使用者直接口頭裁示加到原型的，`documents/5.1.5-電子商店.md` 只在拍賣分頁的每列共通欄位列了「競標資格（Eligibility：Inner Circle／Superfan+／All fans）」，商品分頁與組合分頁的欄位清單都沒有這一欄。2026-07-31 使用者再裁決把互動由自由多選改回門檻模型（點一級＝門檻設在那一級，該級與其上自動包含；四種合法狀態＝全部分級／上榜粉絲以上／超級粉絲以上／僅限核心圈），見 decisions.md D161。**待確認**：(a) 此欄是否正式納入商品／組合分頁的欄位規格；(b) 門檻與拍賣的「競標資格」是否為同一個產品物件（若是，兩處應共用同一份定義與同一套文案）；(c) 是否需要「排除某一級」的能力（門檻模型表達不了，例如補償型商品）。未經上游核准前不回寫 `documents/` | 原型依 D161 實作門檻模型；欄位是否入規格、與競標資格是否同一物件，待上游裁決 |
| PG-022 | **分級人口（每一級有多少人）站上有兩組互相矛盾的假資料（2026-07-31）**：`js/tier-population.js`（本輪由 `js/vault-store.js` 抽出成單一來源）寫核心圈 154／超級粉絲 359／上榜粉絲 475／粉絲 295，媒體庫房的「有幾位粉絲打得開」與電子商店分級選單的累計人數都讀它；`js/i18n.js` 的 `tier-settings.tier.*-count` 則寫核心圈 359／超級粉絲 512／上榜粉絲 640／粉絲 329，是分級設定頁卡片上的靜態文案。兩組都是原型示範資料、目前各自服務不同頁面，數字對不起來。**待確認**：(a) 真實的分級人口由哪個 API／欄位供給；(b) 統一後分級設定頁的卡片人數是否也改讀同一份；(c) 電子商店選單顯示的累計人數是否為正式產品內容（本輪先以示意資料落地，見 UI-CHANGES 2026-07-31 第二批）。未經上游核准前不回寫 `documents/` | 原型統一由 `js/tier-population.js` 供給，tier-settings 的靜態文案暫不動；真值來源待上游 |
| PG-024 | **募資（Campaign）建立流程的具名素材槽未被 D164 影響清單涵蓋，「海報／橫幅」仍留在直式格子裡（2026-07-31 本輪查核發現）**：D164 的影響清單（見 `documents/decisions.md` D164「影響」段）逐一列出建立商品、建立拍賣、建立項目、項目詳情、建立活動、編輯活動，**未提到 `create-campaign.html`**——但該頁的「作品呈現」具名槽目前仍是「海報」「橫幅」兩格（`create-campaign.html` 的 `.upload-assets`），槽名字面描述橫式構圖，格子卻已經是（本輪 IMG-001／批次一）直式 `--750x930`，與 D164 第 5 點指出的「槽名與形狀分離會誤導創作者拍攝構圖」問題完全相同，只是這一頁沒被納入收斂範圍。**待確認**：(a) 募資建立流程是否比照建立項目收成「主視覺＋圖庫」2 格；(b) 若募資與建立項目共用同一種產品性質（皆為專案/項目類），槽位是否應與 5.1.2.1 F6 完全同構；(c) 若募資有獨立規格章節，需先確認其上游出處再決定收斂方向。原型暫不自行更名或併格——這是槽位結構變更，屬 D164 同類產品決策，需上游先擴充影響清單或另立決策 | 上游確認募資建立流程是否併入 D164 收斂範圍；未定前保留現有「海報／橫幅」槽名，只承接 IMG-001 的比例（已是直式） |
| PG-025 | **媒體庫解鎖條件改成「幾種進得來的方法」——權限規則變更，`documents/` 尚未同步（2026-07-31 使用者指示，原型先行）**：現行規格與實作只有一種組合方式——條件之間固定是「或」（符合任一即可進入）。使用者指出這表達不出「分級 ≥ 超級粉絲 **而且** 買過某商品」這類雙重門檻，並指定結構為**外層任一、內層全部**：列出幾種進得來的方法，任何一種達成即可；同一種方法裡的條件要全部達成。原型已實作：`rules` 由單層條件陣列改為 `[{items:[…]},…]`，一個元素＝一種方法；舊資料的每個條件各自成為一種方法，語意不變。空的方法不算達成（避免「剛加一種還沒選條件」瞬間對全站開放）；鑰匙不受影響，仍是疊在條件之上的另一條路。UI 採漸進顯示（框只在該方法有兩個以上條件時才畫、「或是」在有兩種方法時才出現），措辭刻意避開「且／或／AND／OR」，改用「這些要一起達成」「或是」「多一種進得來的方法」。**這動到的是誰進得來的判定規則，屬產品決策，不是呈現決策**——觸及人數、分級覆蓋條、上鎖遮罩文案全部隨之改變。**待上游確認**：(a) 是否採用此結構；(b) 同一種方法裡是否允許兩條分級條件（目前不擋，但「≥核心圈 ＋ ≥超級粉絲」是無意義的寫法）；(c) 方法數是否設上限；(d) 分級條件在「一起達成」之下掉級會讓整種方法失效，`vault.note.tiers` 的細則文案是否要補這一句。 | 裁決後同步 `documents/` 媒體庫規格與 `decisions.md`；未核准前不得視為正式功能 |
| PG-023 | **狀態：已結案（2026-07-31 當日稍後，由 D164 收斂結案）。** 原缺口——具名素材槽在單一比例下失去區辨意義（2026-07-31）：`documents/5.1.6.1-建立活動流程.md:135-138`（活動 4 格）與 `documents/5.1.2.1-建立專案流程.md:178-181`（建立項目 4 格）都把上傳槽定義成具名格——縮圖／直式海報／橫式橫幅／圖庫，槽名對應各自原本的比例與用途（如「橫式橫幅」對應 16:9 桌面版位、「圖庫」對應 3:2）。全站收斂成單一直式 750×930（見 IMG-001）後，這些槽的**比例與尺寸已完全相同**，槽名與實際形狀不再對應——「橫式橫幅」字面描述橫式構圖，卻裝在直式格子裡；創作者依槽名判斷該拍什麼構圖時會被誤導。~~**待確認**：(a) 槽名是否需要隨新比例重新命名（例如改成不描述形狀的「圖片 1／2／3／4」，或依用途而非構圖命名）；(b) 既然槽位比例已相同，是否仍需維持四個獨立必填槽，或收斂成一個「多圖上傳＋可選第一張當封面」的相簿模型（project-detail 展示內容已採用這種相簿模式，見 UI-CHANGES 2026-07-25／CCR-009）。原型暫維持四槽既有命名與必填數不變，只換了比例~~ **D164 的答案**：槽名隨用途重新命名（不描述形狀）——建立項目縮圖／直式海報／橫式橫幅／圖庫 4 格併為**主視覺（Key visual）＋圖庫** 2 格；建立活動併為**主視覺＋橫幅＋圖庫** 3 格（橫幅保留、必填數 4→3）；未採用「收成單一相簿」提案（活動的直式與橫式是兩種構圖、不能互相取代，見 D164「未採納」段）。站台已依此改版（見 UI-CHANGES 2026-07-31 第十三批） | 已由 D164 裁決並落地；不再需要上游進一步確認 |

## 實作與上游不一致

| ID | 現況 | 修正方向 |
|---|---|---|
| PCR-001 | ~~`orders.html` 與 `order-detail.html` 使用單一訂單狀態~~ **已解決 2026-06-15** | 改為履約與付款·結算兩條狀態軸（`.status-axes`／`--labeled`，§7.2 不混用）：orders 列並排雙 badge、order-detail §2.2 大寫標籤雙軸；reconcile 提示同步 |
| PCR-002 | `events.html` 同時把 Draft 當時間與狀態篩選 | 時間只保留 Upcoming／Past，Draft 放狀態軸 |
| PCR-003 | ~~`ip-detail.html` 含超出授權詢問的交易呈現~~ **已解決 2026-06-15** | 降級為權利資訊與詢問：移除 escrow／「Total due today」改「Estimated total（非扣款）」；Send rental request 文案改＝建 Draft 進核准佇列（§3.4）；競標區降為僅預覽＋「R 2.1 規則未開放」、移除下標輸入/結帳，改「私訊權利人」。對齊 5.1.3.1 §3.3.5／§3.4.3／§3.4.4 |
| PCR-004 | `earnings.html` 的手動收入與多地稅務看似正式功能 | 未核准能力停用或標示不可用 |
| PCR-005 | `settings.html` 將導航放置視為產品偏好 | 視為 R 2.1 呈現探索，不寫回產品規格 |
| PCR-006 | 部分頁面仍複寫舊費率或商品分類 | 統一引用主規格 §7.1、§7.3 |
| UIA-060 | **2026-07-17 折扣模型與 spec 5.1.5.2 §4.4 F13（D144）不一致（使用者裁示）**：D144 規格定義折扣＝「絕對折扣價」。使用者反饋多規格下絕對折扣價套不到 N 個規格、且位置與價格脫節，裁示改為——**單一規格**：折扣可填「折扣價 或 折扣%」兩者以定價為基準雙向自動換算（最後編輯為準）；**多規格**：無單一售價，折扣改「折扣 %」套用所有規格，區塊移到逐規格定價表下方。已在 create-product 實作（呈現＋前端換算 demo，無後端持久化）。**屬產品變更、非純呈現**——動到折扣的資料模型與必填口徑（單一可存 price 或 %、多規格存 %）。**待上游同步 `documents/`**：5.1.5.2 §4.4 F13 折扣定義（新增「折扣% 亦為合法輸入、與折扣價互算」與「多規格折扣＝%、無絕對價」）、多規格折扣的計價/儲存口徑、%與絕對價的四捨五入與邊界（0–100）規則；product-detail §2.15 同模型套用（本輪未動）。與組合頁既有折扣%（D103）語言一致 | 先同步 spec 5.1.5.2 §4.4 F13（＋5.1.5.1 §2.15），確認後回寫；product-detail 待套 |
| UIA-067 | **2026-07-21「規格」術語更名為「選項」，UI 已改、上游未同步（使用者裁示）**：站上「規格」原本混用兩義——產品規格書（「待規格確認」）與商品變體。本輪依使用者指示把**商品變體語意**全面改為「選項」：商品規格→商品選項、單一／多規格→單一／多選項、規格組合→選項組合、各規格價格與庫存→各選項組合價格與庫存、所購規格→所購選項等（20 個 i18n key、23 處值，見 UI-CHANGES 2026-07-21）；商品資訊的「規格」改「詳細規格」以與「選項」區隔。**屬術語表層級的產品變更、非純呈現**——`documents/` 的 5.1.5.1／5.1.5.2／5.1.5.4／5.1.5.9 與 `decisions.md` 仍用舊術語，規格書與畫面用詞不一致，BRD 與開發交付若以規格書為準會對不上。本 skill 未回寫 `documents/` | 由 `design-spec-writer` 更新上游術語表與各分頁，並在 `decisions.md` 記一則術語更名決議；確認後規格與 UI 才一致 |

| UIA-068 | **2026-07-21 逐規格資料以「值字串組合」當 key，改值會產生孤兒（已知限制，非本輪引入）**：`create-product.html` 的 `varData` 用組合字串（如 `S / Black`）當 key 存價格／庫存／SKU／成本。本輪把選項值由 chip 改成可就地編輯的 input 後，**改一個字就等於換一個 key**，原本填好的價格庫存會失聯且無提示（chip 模式只能整值新增／刪除，同樣會孤兒，但不會邊打字邊發生）。根治要把 key 從值字串換成選項／值的穩定 id，屬架構級改動，本輪不處理。原型階段資料本就不持久化（UIA-016），影響僅限單次填表 | 交付前端實作時採用穩定 id 當 key；原型不修 |

## 核准流程

1. UI 發現缺口時新增 PG 或 PCR。
2. 產品決策先更新 `requirement/` 或 `documents/decisions.md`。
3. `design-spec-writer` 更新 `documents/`。
4. `project-ui-creator` 才能更新 BUILD-SPEC 與實作。

## 2026-07-20 商品明細改版（Figma 845-10300）的產品缺口

以下四項是本輪 UI 改版帶進來、但**上游規格沒有定義**的內容。依鐵律 5／7，UI 已照使用者指定呈現，但不得視為已定案的產品行為，也不得回寫 `documents/`。上游確認前，這些是「明確標示的探索性呈現」。

| ID | 缺口 | 現況與待確認 |
|---|---|---|
| UIA-070 | **2026-07-21 低庫存門檻由件數改為百分比（使用者裁決「存 %」）**：建立商品與商品明細兩頁的自訂低庫存門檻，輸入與儲存的值由「件數」改為「佔庫存上限的百分比」（預設 10），畫面上即時換算成件數當輔助提示。**屬資料模型變更、非純呈現**——`5.1.5.1` §2.10 與 `0-設計規格書` §7.2 目前把低庫存門檻定義成可逐商品調整的數值、預設「庫存上限的 10%」，未言明存的是比例還是算好的件數；改存 % 之後庫存上限一變動，門檻件數會跟著浮動（存件數則不會），這是行為差異不是呈現差異。**另有未定義處**：不限量商品沒有硬上限，百分比要以什麼為基準（目前 demo 沿用 UIA-042 的做法以目前在庫換算）；進位方向（目前無條件進位）；0 與 100 的邊界。本 skill 未回寫 `documents/` | 由上游確認門檻的儲存單位（% vs 件數）、不限量的換算基準與進位規則，回寫 5.1.5.1 §2.10 與 0-設計規格書 §7.2 |
| UIA-071 | **2026-07-22 建立 creator 改「搜尋前台已註冊帳號 → 選取帶入 → 建立」兩步流程（使用者反饋，對齊 BR-02）**：Admin 建立 creator 由憑空填表改為先用 `owner-lookup` 即時 typeahead（IP Bank Entry「權利人」同款元件）依人名／username／email 搜前台已自助註冊、尚未建檔的帳號池（`sidebar.js` `REGISTERED` demo 6 筆），下拉挑一筆→**名稱／Email／頭像沿用該帳號、唯讀**，Admin 只設店鋪網址（平台唯一擋重複）與電話（選填帶入）；建立＝onboard 進名冊並自帳號池移除，避免重複建立。此頁只借 `owner-lookup.css` 視覺與結果列樣式、另寫在地 typeahead，不含 IP entry 版的「未註冊 email→建立待寄送邀請」路徑（creator 必須來自已註冊帳號）。此流程對齊 §5.1.0 頁面定位 BR-02「creator 來源＝前台已註冊帳號、Admin 承接建檔（非憑空開號）」。**呈現詮釋點**：把名稱·Email 設為「沿用帳號、唯讀」是對 D107『建立欄位』的呈現詮釋——D107 目前把名稱／email 列為建立表單的輸入欄、未言明是否應改為自註冊帳號帶入唯讀；帳號池、搜尋、自動生成店鋪皆前端 demo（UIA-029／045，無後端目錄／驗證）。本 skill 未回寫 `documents/` | 呈現可調；規格 §5.1.0 F2 建立欄位（D107）宜回頭與「承接已註冊帳號、名稱／Email 帶入唯讀」對齊，由上游確認 |
| UIA-069 | **2026-07-21 庫存數字改唯讀，只能透過補貨改變（使用者裁示）**：商品明細的庫存（單選項的讀數、多選項逐選項組合表的庫存欄）由可編輯 `.input` 改為唯讀呈現，數量只能經右欄「補貨」增加、每筆留紀錄。**與規格牴觸**：`5.1.5.1` §2.10 明列庫存於「售出／退款／補貨／**手動調整**」後重算，把欄位鎖成唯讀等於移除「手動調整」這條路徑。**另有一個未解的缺口**：補貨流程（5.1.5.6）只能增加數量，商品破損、遺失或盤點短少時，現在畫面上沒有任何地方能把數字往下調。待確認：是規格要收掉「手動調整」，還是補貨流程要支援扣減（等於升級成「庫存調整」並定義調整原因與紀錄格式） | 由上游決定保留手動調整或改為庫存調整流程；確認後回寫 5.1.5.1 §2.10 與 5.1.5.6 |
| UIA-062 | **銷售摘要新增「轉換率」KPI** | 規格 `5.1.5.1` §2.3 只定義三個 KPI（已售件數／毛收／淨額）。Figma 845-10300 的四格版把「退款」與「轉換率」加進來；使用者後續把「退款」換回「扣費後淨利」，但**「轉換率」保留**。待確認：轉換率的分母是什麼（商品頁瀏覽數？商店瀏覽數？）、由誰計算、是否與收入管理同源。目前顯示 4.2% 為示意值 |
| UIA-063 | **右側「使用中」卡新增「組合」引用列** | 規格 §2.4 只定義「項目引用（Referenced by Projects）」，**組合（Bundles）不在其中**。使用者明確要求標題與內容要涵蓋「被項目或組合包使用」。待確認：商品被放進組合時是否要在此顯示、顯示粒度（組合名稱／份數）、以及修改商品時是否要比照項目跳出變更影響提示 |
| UIA-064 | **次分類改為建立後鎖定** | 規格 §2.6（D137）目前把主分類、規格模式、庫存版本列為「建立後固定不可編輯」，**次分類只標「受限·部分產品待確認」**、未定案全鎖。本輪依使用者指定把次分類 select 一併 disabled。待確認：次分類是否真的全鎖，或只是部分情境受限（例如數位改次分類受限、實體可改） |
| UIA-065 | **本輪從畫面移除、但規格仍要求的內容** | 依使用者逐項指定移除：頁首的「庫存過低」狀態徽章與商品描述、右欄「低庫存門檻」與「上架中」兩列、項目引用的影響範圍說明（「作為交付項目 · 影響 62 位支持者」）與「修改此商品會提醒關聯項目」副標、主分類的「建立後不可變更」提示。其中 **§2.4 明列「變更影響提示」與「影響範圍標示」為組成項**，移除後規格與畫面不一致。待確認：是規格要放寬，還是這些資訊要以別的形式回到畫面（例如改成 hover 提示或移到儲存前的確認step） |
| UIA-077 | **2026-07-22 商品明細把取貨方式改為唯讀、不可更改（使用者裁決）**：交付與取貨分頁移除取貨方式切換器，只依商品資料唯讀顯示「物流配送」或「現場 QR 領取」。**隱含產品規則**：等於主張「取貨方式建立後不可變更」，但 `5.1.5.1` §2.11 與 D137（建立後固定欄位＝主分類／規格模式／庫存版本）**都沒有把取貨方式列為鎖定欄位**——原本 site 也讓它可切換。待確認：取貨方式是否真的建立後固定（如已有 QR 領取訂單就不能改物流），或只是明細頁不提供切換、另有他處可改。本 skill 未回寫 `documents/` | 由上游確認取貨方式的可編輯性；若確為建立後固定，回寫 5.1.5.1 §2.11 與 D137 清單 |
| UIA-079 | **2026-07-23 定價與庫存改「頁面唯讀＋彈窗編輯」、規格改資料驅動＋兩階層、且可事後增減選項值（產品缺口）**：商品明細·當前庫存卡的表格改唯讀呈現、由 `products-store` 的 `options`／`variants` 資料驅動（單階層逐值一列；兩階層＝顏色×尺寸依顏色分組，與 e-shop 補貨矩陣同源）；改價格／成本／規格一律走「⋯ → 編輯」popup——編輯採「管理選項」模型（可加/改名/移除**選項值**，也可加/移除整個**選項維度**如再加「材質」，組合表笛卡兒積即時重算、支援 3 層以上，取代先前錯誤的「單一組合新增」）；「⋯ → 補貨」開補貨彈窗；「補貨紀錄」鈕把補貨紀錄改成 popup。**與現有規格衝突**：UIA-056／D137 主張「規格建立後鎖定、不可移除或改選項」，但本輪允許事後增減選項值＝改動選項集合。本輪全為前端 demo（改動只反映在畫面 MODEL、不寫後端；store 的兩階層資料屬呈現資料、非產品規則）。待確認：(1) 建立後是否允許增減選項值／組合？若允許，UIA-056／D137 的「鎖定」需改寫成「可增值、不可刪已售出組合」之類細則；(2) 買家端與既有訂單如何看待事後新增的組合；(3) 「編輯」可改欄位範圍（價格/成本/庫存 vs 選項值/組合名）；(4) 兩階層以上（3 個選項）是否需支援。未經上游核准前不寫回 documents/ | 由上游確認建立後的規格可變動範圍、階層數上限與明細頁編輯模型；確認後回寫 5.1.5.1 §2.8／§2.9 與 5.1.5.2 的鎖定細則 |
| UIA-080 | **2026-07-23 訂單清單把「現場取貨」升為出貨狀態軸的一種履約狀態值（重新詮釋 D111）**：使用者裁示訂單清單的取貨狀態不再掛在「商品／訂單內容」欄的品項層 meta（原「1 項待現場取貨」小字徽章），改為出貨狀態欄的一顆狀態徽章「待取貨」（`orders.status.pickup`）；混合訂單（部分配送、部分現場取貨）在出貨狀態欄同時顯示「待出貨＋待取貨」兩顆徽章、水平並排不換行。**與現有規格衝突**：`5.1.5.3` **D111** 明訂取貨狀態屬「品項層、不改訂單層狀態」——本輪把它提升為訂單層出貨（履約）軸的狀態值，等於改變 D111 的層級定位。理由：現場取貨本就是一種履約／取貨方式，放進履約軸與「待出貨」並列，比藏在品項摘要小字更清楚；付款軸仍與履約軸分離（§7.2 不變）。本輪為前端 demo（示範訂單 #ZT-10482 兩顆徽章為 literal，無後端狀態機）。待確認：(a) 取貨是否正式納入訂單層履約軸；(b) 一張混合訂單的履約軸能否同時有多個狀態值、其排序與收斂規則；(c) 與 pickup 場次 scanner 核銷回寫如何連動。未經上游核准前不寫回 documents/ | 由上游確認取貨是否升為訂單層履約狀態；若確認，回寫 5.1.5.3 D111 的層級定位與履約軸多值規則 |
| UIA-078 | **2026-07-22 多規格商品可「單獨下架某一規格」（產品缺口）**：商品明細·定價與庫存的多規格表，列尾動作由「移除（X）」改為 kebab 選單「單獨下架／重新上架」——下架後該規格在表單上停用（灰階＋輸入 disabled），仍可重新上架。**現有規格沒有「逐規格上下架」概念**：`5.1.5.1`／`5.1.5.2` 只有商品層級的上架/下架（e-shop 列的 List in shop 開關），規格建立後鎖定（UIA-056）也只講「不可移除／改選項」，未定義「保留規格但暫停販售單一組合」。本輪為前端 demo（不寫入狀態、無後端）。待確認：(a) 是否真要支援逐規格上下架；(b) 下架的規格在買家端如何呈現（隱藏 vs 顯示為售罄/停售）；(c) 與庫存為 0、限量售罄的差異；(d) 已有未出貨訂單指向該規格時能否下架。未經上游核准前不寫回 documents/ | 由上游確認逐規格上下架是否納入產品範圍；若納入，回寫 5.1.5.1 §2.8／5.1.5.2 的規格狀態模型與買家端呈現 |
| UIA-082 | **2026-07-23 Deck for Sony 版收入管理＝finance-overview 移植（呈現／簡報 demo）**：`earnings-sony.html` 是 cocreate 站 `finance-overview.html`「財務總覽」的忠實內容移植、改套 R2.1 設計系統，僅在 cheat code「Presentation demo · Deck for Sony」版本經 `route:earnings.html=earnings-sony.html` 顯示，**不改動 Phase 1–4 的收入管理（`earnings.html`）產品行為**。以下皆為呈現層假設、非 R2.1 產品規格：(a) 收益類型（共創計畫／OTT版稅／影評人佣金／影評人預付金／授權收益／獎金／共創派對／音樂版稅）為 cocreate 概念，未納入 R2.1 §7.3 收入類型；(b) 金額用來源的 NTD 示意值；(c)「我的項目」列點擊前往 `my-cocreate-proposal.html`／`my-cocreate-project.html`——**這兩頁不在 R2.1 原型內，點擊會落空**（來源站頁面，未在本原型重建）；(d) 走勢圖 5 條線對應 `--chart-1..5`，無走勢線的兩型（獎金／共創派對）圖例點用中性色（我方色板定義 5 個序列色）；(e) 類別下拉略去來源的「影視／音樂」分組標題。待上游確認是否將此收入模型納入 R2.1 產品範圍；未確認前不回寫 documents/ | 由上游確認收入模型與跨站頁面是否納入；確認後才回寫 spec |
| UIA-081 | **2026-07-23 支付手續費拆成雙金流商 Atom／Stripe（產品範圍提案）**：使用者要求把支付手續費由單一費率改成兩個金流商各自的費率（Atom、Stripe），每個各有「百分比＋每筆固定額」，設定頁可編、例外彈窗唯讀鏡射。**超出現行規格**：`feature_description.md`／`requirements-zh-hant.md` §4.1 與 spec 5.1.0.3 F2 把支付手續費定義為**全站單一費率**（`PaymentFee{ pct, fixed }`），無「逐金流商」維度。同時**移除固定額的幣別前綴**（原 HK$）：幣別改由 Admin 側欄的全站幣別統一（本身也是 UIA 級的前端 demo），欄位只顯示數字。本輪全為前端 demo（Atom 3.4%＋2.40／Stripe 3.4%＋2.35 為示意值、不寫入後端、結算未接）。待確認：(a) 平台是否真的並用多個金流商、且各自費率；(b) 若是，`PaymentFee` 需擴充成 `map<provider, {pct, fixed}>`，且結算時一筆交易走哪個金流商由誰決定（買家選？地區？幣別？）；(c) `Order.feeSnapshot` 如何記錄實際套用的金流商與費率；(d) 固定額幣別是否確定由全站幣別統一、不逐金流商。未經上游核准前不寫回 documents/ | 由上游確認是否納入多金流商費率、路由規則與結算取值；確認後回寫 §4.1 與 `PaymentFee` 資料契約 |
| UIA-076 | **費率例外彈窗新增「逐商品例外」（產品範圍提案）**：使用者要求在例外彈窗的「電子商店 E-Shop」下加「新增例外商品」——選一個具體商品、單獨設該商品的平台費。**超出 `feature_description.md`／`requirements-zh-hant.md` §6 的資料模型**：文件的 `FeeException` 只支援「逐 Creator × 逐葉節點（leafKey）」覆寫，並無「逐商品」粒度。本輪先做**前端 demo**（商品池為假資料、不寫入 `overrides`、不進儲存）。待確認：(a) 是否真要支援商品級費率覆寫；(b) 若要，`FeeException` 需擴充 `productOverrides: map<productId, ratePct>`、稽核與結算 `Order.feeSnapshot` 如何取用；(c) 商品級是否覆寫葉級、優先序為何。未經上游核准前不寫回 documents/ | 由上游決定是否納入產品級費率覆寫；確認後回寫 §6 資料契約與 `FeeException` 欄位 |
| UIA-084 | **2026-07-24 新增項目狀態「已上線（Published）」＋projects 主篩選加同名 tab（產品範圍提案）**：使用者要求 projects 主狀態篩選在「已完成」後加「已上線」。**超出 §7.2 狀態語言**：`0-設計規格書` §7.2／`5.1.2` 的項目狀態集為 Draft／Scheduled／Live／Funded／Completed／Cancelled／Failed，並在 §5.1.2 明訂「進行中（Live）含直接上線之上線中」——**沒有獨立的「已上線」狀態**。使用者定義：募資／預購項目交付完成後「上架販售」即進入此狀態；直接上線（Go live）類型天生為此狀態。本輪呈現：新增狀態值 `published`（badge--success 綠、label 已上線）、`TAB.published=['published']`、`projects.tab.published` i18n；project-detail 的 STATUS／STATUS_TONE 同步加 `published`。**demo 資料指派**：3 個直接上線作品（海上霸姬鄭一嫂／九龍夜行 片尾曲／海上霸姬 幕後紀錄）由 `live` 改 `published`；另將 `adia-chan` 設為**唯一已上線募資音樂示意樣本**，僅供驗收 project-detail 的版稅 tab，示意資料不代表已確認的狀態產品規則或版稅資料口徑。待確認：(a) 「已上線」是否正式納入 §7.2 狀態集，或維持「Live 的子概念、只在列表分頁呈現」；(b) 若納入，Live→Funded→Completed→Published 的轉換條件、Go live 型是否跳過 Live 直接 Published、與 Completed 的界線（收尾下架 vs 持續在售）；(c) badge 顏色與 §7.2 狀態語言對齊。未經上游核准前不寫回 documents/ | 由上游確認「已上線」是否納入 §7.2 狀態集與其轉換規則；確認後回寫 §7.2 與 5.1.2 §狀態分頁 |
| UIA-085 | **2026-07-24 cheat code「User」persona 切換（demo-only，非產品功能）**：cheat code（devtools，Alt＋右鍵）的「User」組改成 default User／admin／User A（周湯豪 NICKTHEREAL）／User B 四選項，切 User A 時全站 demo 假資料（項目／電子商店／我的 IP／活動／粉絲／收入管理及其詳情）換成周湯豪版。**這是純 demo/簡報用的預覽切換，不是產品規格**——真實系統是單一創作者後台、無「切換帳號看別人資料」的功能；persona 只影響前端 mock 呈現、無後端。**已知假設**：(a) **User B 為空殼佔位**，目前未建任何資料集、切它等同 default，之後要用再補（接手者勿誤以為已實作）；(b) 依使用者裁決**只換名字、不換數字**——收入/活動/粉絲各頁的 KPI、票數、金額、聲望、百分比維持原 demo 值，故周湯豪帳號的「數字量級」不代表大牌藝人規模，僅名字/作品/人名在地化；(c) 周湯豪的項目/商品縮圖沿用現有 `images/` 檔（非本人素材，待替換）；(d) admin 選項套用 `ztorCreator` 名冊首位的代管 chrome、資料維持 default。周湯豪的作品/項目/商品/粉絲名為配合其實際定位（嘻哈/R&B 歌手、NIGHT RUN 巡迴、失控 OUTTA CONTROL 專輯）補寫的示意資料，非真實發行資訊。 | 純 demo 呈現、不回寫 documents/；若日後要把「多帳號預覽」正式化或補齊 User B/數字量級，再開規格 |
| UIA-088 | **2026-07-25 IP Market 三張示例卡改用真實知名 IP 名（demo-only，非真實授權關係）＋封面結構改成可放真實圖**：依使用者裁決，IP Market（`ip-market.html`）三張上架卡與詳情頁（`ip-detail.html`）的示例改用真實 IP 名——<br>哈利波特 Harry Potter（Story World，權利人示意 Warner Bros.）<br>A-Lin（Music，示意 Sony Music）<br>佩佩豬 Peppa Pig（Brand，示意 Hasbro）。**這些是使用者指定的 demo 填充、非真實授權關係**：把真實作品／藝人／權利人寫成在 ztor 平台掛牌出租、標價格與 royalty，均為示意，不代表任何真實合作，也與平台「creator 互租」定位不必然相符（已向使用者說明風險）。**版權／肖像界線（硬規則、未因『不公開 demo』放寬）**：只用 IP 名／商標作純文字提及，描述為原創通用措辭；**不由 AI 生成受版權保護的角色圖、不代抓官方圖／劇照／真人藝人照片**。封面已由漸層色塊 promote 成 `.ipm-card__cover`／`.ip-hero__cover-img` 結構（見 STYLE-DECISIONS Q30）。價格／royalty／名額／素材包等數字沿用原示例、未改商業規則。

**2026-07-25 追記 · 封面圖已入庫**：使用者自備並指定放入 5 張第三方素材（`images/ip/`：`pokemon.png` 寶可夢商標、`mayday.jpg` 五月天宣傳照、`dragon-ball.jpg` 七龍珠 Z 主視覺、`super-mario.jpg` 超級瑪利歐海報、`ip-man.jpg` 葉問影碟封面）。**這些是使用者提供的第三方版權／商標／肖像素材，ztor 並未取得授權**；AI 未生成、未代為抓取，僅依使用者指示複製其自備檔案。其餘 5 張（哈利波特／A-Lin／佩佩豬／戴愛玲／超級星光大道）無檔案、由 `onerror` 退回漸層佔位。**已向使用者說明的風險**：本站會經 `deploy.sh` 部署到公開 Vercel 網址並推送共用 GitHub monorepo，公開散布第三方素材、且與「掛牌出租＋標價＋royalty」並列會讓人誤認為真實授權關係；使用者理解後仍指定採用。對外簡報或正式發布前建議換成自有或已授權素材。 | 純 demo 呈現、不回寫 documents/；第三方素材由使用者提供並自負授權責任；公開發布前建議替換 |
| UIA-089 | **2026-07-25 項目詳情分頁矩陣調整：製作進度限募資、收益備份分頁退場**：依使用者裁決 (a)「製作進度」分頁由 `fund preorder` 收為**只有募資型才有**——預購不對外交代製作進度，**之後需要時再加**；(b)「項目收益備份」（`data-panel="money"`）整個分頁退場，退場前原樣備份到 `docs/項目收益備份-money-panel-20260725.html`。**與規格的關係**：`5.1.2.2` 未逐一定義詳情頁該有哪些分頁、也未把製作進度綁定到特定類型，故此為呈現層的分頁編排決定；但「預購型不揭露製作進度」隱含了一條產品判斷（預購的交付進度不對創作者後台以外呈現），若上游認為預購仍須追蹤交付，需回頭補。收益備份分頁的內容（共創金流統一模型、分期撥款、支持者明細）與「共創進度」分頁重疊，退場不減少資訊。 | 由上游確認預購是否需要製作／交付進度；確認後回寫 5.1.2.2 的分頁組成 |

| UIA-090 | **2026-07-27 「管理我的 IP」新頁（`manage-ip.html`）· 逐筆租賃列為原型樣本**：my-ip 清單的列原本連到 `ip-detail.html`（規格 5.1.3.1，IP 市場那一面：租金卡／競標／詢問，且不吃 `?id=`，八列全部開到同一筆哈利波特示例——見 UIA-088）。使用者裁示「點自己的 IP 應該是管理自己的 IP」，故新建擁有者那一面 `manage-ip.html?id=row<N>`，四分頁＝總覽／授權與定價／租賃紀錄／設定；`ip-detail.html` 內原本恆常顯示的「Manage as owner」面板（其副標自稱「因為你從 My IP 進來才顯示」，但該條件從未接線）之三顆開關（接受新租約／計價模式／到期提醒）遷入本頁設定分頁。**逐筆租賃欄位（承租方／檔期／金額／狀態）上游未定義**——規格只有「租出數」一個數字；`js/ip-store.js` 的 `deals` 為使該分頁不致空白而編的代表性樣本，筆數與清單租出數對齊（12/5/4/2/1），但承租方名稱與狀態語言均為示意，不得當成產品規則。 | 由上游定義租賃合約的欄位集與狀態機；確認後回寫 5.1.4 並補「管理我的 IP」頁的正式規格 |
| UIA-091 | **2026-07-27 已有進行中租約時，授權與定價欄位是否可改（未定，原型不強制）**：`product-detail.html` 有先例——建立後鎖定主分類／規格模式／庫存版本（D137）。IP 的對應問題牽涉金流與合約：一筆 IP 已有生效租約時，擁有者還能不能改標準／獨家授權價、分潤比例、最短租期、授權用途與地區？**原型採寬鬆版**：四個定價欄位一律可編輯，並在欄位下方常駐提示「修改只對新租約生效，已簽合約維持原條件」，但**不強制、不驗證、不持久化**。此為呈現層的暫行選擇，非產品規則。 | 由上游裁定三選一：(a) 全可改、只對新租約生效；(b) 有生效租約時定價欄位鎖定；(c) 分欄處理（例如用途／地區鎖定、價格可改）。裁定後回寫並在 UI 加真正的鎖定態 |

| UIA-092 | **2026-07-27 「管理我的 IP」危險區改為刪除（`manage-ip.html` 設定分頁）· 刪除條件與密碼二次確認皆為提案**：依使用者裁示，原本的單向紅鈕「Remove from IP Market」退場——**下架是可逆狀態**，已由「授權與定價」分頁的上架開關承擔，危險區不再重複一顆同義按鈕；危險區只留真正不可逆的**刪除**（用詞由 remove 改為 delete）。**三件事上游未定義、以下皆為原型提案**：(a) **有進行中租約時仍可按刪除，但彈窗頂端出警告條**（`{n} 筆進行中的租約將受影響`＋承租方在期滿前仍有合約權利）——**初版做成停用入口鈕，經使用者反饋「按鈕不能按」而改**：鎖死的按鈕讀起來像壞掉，該講的話要出現在準備按下去的那一刻，而不是把路封死；真正的前置條件檢查仍應由伺服器端在刪除時執行；(b) **刪除範圍**＝IP 紀錄＋授權條件與定價＋waterfall 歷史與收益歸屬＋市場刊登，彈窗逐條列出，但「waterfall 歷史是否真的可刪」涉及財務可稽核性，很可能上游會要求改為封存而非刪除；(c) **密碼二次確認**＝彈窗要求輸入密碼才啟用確認鈕。**⚠ 原型無後端：不驗證、不儲存、不送出輸入值**，關閉即清空欄位；輸入任何非空字串都會通過，僅為呈現「這一步需要本人」的意圖，不得當成已實作的驗證。真實刪除必須由伺服器端驗證身分與前置條件。 | 由上游裁定：刪除 vs 封存（財務稽核）、有租約時的正確行為、二次確認方式（密碼／再次登入／輸入名稱）。裁定後回寫 5.1.4.2 並接上真實驗證 |

| UIA-093 | **2026-07-27 IP 授權定價模型改版：按期計價 → 一次性費用＋分潤%，並新增「價格請洽詢」**（使用者裁示）：舊模型把價格綁在期間上——標準／獨家價各自對應一個租期、另有「最短租期」欄位，承租端還有 3／6／12 個月三顆逐期價格 chip。新模型**把價格與期間拆開**：價格＝一次性費用（付一次即可使用）＋在其上的**收益分潤 %**；期間仍然存在（授權仍會到期、仍可續約、到期提醒與 Renew 全部不動），但**不再是計價單位**。連帶退場：`register-ip` 的「最短租期」欄位、`ip-detail` 的逐期價格 chip、i18n 的 `ri.price.min*`／`ri.rev.minn`／`ip-detail.dur.*`，以及清單「$6,800 / 6mo」這種按期寫法。**「價格請洽詢」是欄位層級狀態**（使用者指定一次性費用與分潤各自可不公開）：一筆 IP 可以是「$5,000 ＋ 分潤請洽詢」，也可以兩者都洽詢；任一項未公開時，承租端的主要動作改為**向權利人洽詢**（沿用既有的 Send＝建 Draft 進核准佇列，對齊 5.1.3.1 的降級呈現）。實作上新增 `js/ip-price.js`＝價格物件的形狀與**唯一格式化器**，清單／管理頁 KPI／市場卡／詳情頁全部吃同一支輸出，結構上不會漂移；`js/ip-store.js` 的 `royalty/standard/exclusive/minTerm` 四個字串欄位由單一 `price` 物件取代。**未定價 ≠ 免費**：金額為 null 時顯示「尚未定價」，不印成 $0 ＋ 0%。 | 由上游確認：(a) 分潤的計算基礎與結算頻率（目前只寫「收益的 %」，未定義毛/淨、結算週期）；(b) 一次性費用是否含平台抽成、與 5.1.0.3 平台費樹的關係；(c)「請洽詢」洽詢流程的正式規格（目前沿用 Draft 佇列）；(d) 期間既然不再計價，授權到期後的續約是否需重付一次性費用 |
| UIA-094 | **2026-07-30 我的 IP 清單新增「肖像權」「聲音」兩筆示範資料（使用者指定）· IP 類型 enum 兩套並存未收斂**：使用者指定在 `my-ip.html` 自有清單補周湯豪的肖像權與聲音兩列（row9／row10），歸「站外登錄」——人格權本來就存在於 Ztor 之外、由創作者登錄進來，非在站上產出。**兩者未新增產品規則**：`register-ip.html` 的 IP 類型「Person-Based」副標本來就寫「Likeness, persona, voice」，肖像與聲音已在既有分類內。**但兩套 enum 並存的既有問題被這兩筆放大**：規格側（`0-設計規格書.md` §7.1／D079）是 Story World／Person-Based／Brand／Event Format／Other，`js/ip-store.js` 側是 Original Story / Screenplay／Character / Likeness／Music & Score／Footage / Clip／Brand / Trademark／Other，兩套對不上（`0-設計規格書.md` §8.10.3 已自列為待決）；本輪兩筆的 `ipType` 取後者語意最近的 `Character / Likeness`，**聲音沒有專屬型別**，屬將就。另：清單「類型」欄沿用其他站外登錄列的「—」（不顯示原創／衍生徽章），未自創「站外登錄＋徽章」的新組合；租出數／收益／租約筆數為示意值，比照 UIA-090 不得當成產品規則。 | 由上游收斂 IP 類型 enum 為單一份（含「聲音／聲紋」是否需獨立型別、或明確併入 Person-Based），並裁定人格權類 IP 在清單「類型」欄要顯示什麼 |
| UIA-095 | **2026-07-30 登錄 IP 流程新增「真人形象」專屬欄位：權利子類型（肖像／聲音）＋肖像年齡區間**（使用者指定）：規格 `5.1.4.1-登錄IP流程.md` §① 的第 1 步只定義「IP 類型 → 名稱 → 描述 → 所有權證明」，**沒有任何依類型分流的欄位**，故本區三件事都是產品變更提案，未回寫 `documents/`。<br>**(a) 權利子類型**：IP 類型選「真人形象（Person-Based）」時，才出現單選卡「肖像／聲音／其他」。肖像與聲音各自授權、各自計價（`my-ip.html` 的 row9／row10 已是兩筆獨立 IP，見 UIA-094），登錄時就該分開；`register-ip.html:100` 的 Person-Based 副標本來就寫「Likeness, persona, voice」，所以是把既有語意顯性化，非新增類型。**第三張卡「其他」＝沒被列出來的真人形象權利**（使用者指定），副標舉例人設、姓名、簽名、招牌動作；這同時收掉了「人設（persona）」沒有去處的問題——上游沒定義人設與肖像的界線，先歸「其他」、不為它單開一張卡。「其他」比照 IP 類型的 Other 卡，**不附自由文字欄**，細節寫在下方的 IP 描述。<br>**(b) 肖像年齡區間**：子類型選「肖像」才出現，**起／迄兩個下拉**（使用者指定），選項為「不限」＋1～100 逐歲。兩端都「不限」＝橫跨所有時期。起 > 迄時就地把另一端對齊成剛選的值（最後按的優先），不擋下來也不標紅字。**級距切法（逐歲 vs 分段）與上限 100 都是原型的暫行選擇**，上游未定義。**語意經使用者確認＝「這批肖像素材屬於本人哪個時期的形象」**（承租方挑年代形象時用得到），**不是**權利人目前年齡的法務聲明，也**不是**授權內容的受眾分級。<br>**(c) 必填與否**：子類型設為必填（選真人形象時才檢核，比照 standard 只在 rental 時要求）、年齡區間設為選填。**必填條件屬產品規則，此處為原型的暫行選擇。**<br>**呈現層界線**：全部沿用既有元件（子類型用 selection-card、年齡用 chip），未新增 CSS 或 token；切換類型或子類型時會清掉收起欄位的既有選擇，避免看不見的值進到摘要與檢核。前端 demo、不持久化。 | 由上游裁定：(1) 真人形象是否正式拆成肖像／聲音（以及「人設」要不要獨立）；(2) 年齡區間的正式語意、級距切法與是否必填；(3) 未成年肖像是否需要監護人同意書等額外流程（本輪未做）；(4) 年齡區間要不要進 IP 市場的篩選條件與 `ip-store` 的資料模型 |
| UIA-096 | **2026-07-30 登錄 IP 流程新增「素材上傳」區，各 IP 類型的素材槽明細**（使用者指定）：主規格 §7.7 Media Pack 已確立「每種 IP 類型有對應的素材槽與完整度計算」，但 **§8.10.3 把「各 IP 類型素材槽明細」明列為待決**，所以槽位清單本身是提案，未回寫 `documents/`。<br>**呈現形式（同日改版）**：初版做成「每個素材槽各一格上傳格」，經使用者指定改為**單一上傳區＋已上傳檔案列表**，各型槽位清單降級成上傳區下方的「建議上傳什麼」提示文字。**因此登錄流程不再計算完整度**——沒有固定槽位就沒有分母；`completeness` 計量條已從本頁移除，但 IP 市場卡的 x/N 仍在（見下方連帶修正），兩者的計算來源因此斷開，需上游一併裁定。<br>**建議清單**（原槽位表，定義在 `register-ip.html` 的 `ASSET_SLOTS`）：共通＝封面圖、展示圖集。故事世界＝世界觀設定集、角色設定表、場景與美術設定稿、時間線年表、授權使用規範（合計 7）。音樂＝母帶音檔、分軌 stems、樂譜與和弦譜、歌詞檔、試聽片段（7）。品牌＝Logo 原始向量檔、Logo 各版本、品牌指南 VI 手冊、色彩與字體規範（6）。活動形式＝活動企劃書與流程表、舞台與場地配置圖、主視覺 KV、過往場次紀錄、執行手冊 SOP（7）。其他＝自由上傳（3）。真人形象**不共用一組槽**（肖像是影像、聲音是音檔，混在一起兩邊都不對），依 UIA-095 的子類型再分：肖像＝去背人像、多角度照片組、形象照與宣傳照、姿勢與表情範例、3D 掃描或模型、修圖與使用禁則（8）；聲音＝聲音樣本、多情緒與語速樣本組、發音與咬字特徵說明、AI 合成授權界線（6）；其他＝簽名檔、招牌動作參考影片、人設設定文件（5）。<br>**全部選填**（使用者裁示）：登錄門檻保持低，不進就緒檢核。<br>**與「所有權證明」刻意分成兩個 section**（使用者裁示）：證明檔是給平台驗證的法務文件、素材包是承租方實際拿到的資產，兩者疊在一起最容易被當成同一件事，故副標直接寫明用途差異。<br>**連帶修正**：`ip-market.html` 九張卡的完整度原本一律寫死 `x/10`，與「每型槽位不同」矛盾；已改成依 `data-type` 帶各型正確分母（story/music/event 7、brand 6、person 8）。<br>**呈現層界線**：沿用既有 `upload-tile--file`／`form-grid`／`completeness`，未新增 CSS 或 token；圖示一律取自已註冊的 icon REGISTRY。前端 demo——點擊只切換「已上傳」外觀，不真的上傳、不持久化、不驗證檔型與大小。 | 由上游裁定：(1) 各型槽位的正式清單與命名；(2) 完整度的計算口徑，以及自由上傳列表要怎麼推導出 IP 市場卡的 x/N（目前登錄端不算、市場端寫死）；(3) 檔型與大小上限（目前 hint 的建議格式為提案）；(4) 素材包與 §7.7 授權啟用凍結（frozen manifest）的實際綁定方式 |
| UIA-097 | **2026-07-30 套組編輯器價格加總跨幣別不換算（使用者裁決）**：商店商品假資料混著台幣定價（例如 `js/products-store.js` 的「26MS Hoodie」標 $3,680，屬台幣量級）與美金量級商品，套組價格欄整體標示 USD。`js/bundle-editor.js` 的 `cash()`／`itemsTotal()` 把每件商品的定價字串當同一個數字直接相加，**本輪一律當同幣別處理、不做匯率換算**——這是使用者在檢視計價規則時的明確裁決，不是遺漏。影響 `create-project.html`「回饋套組」步驟與 `project-detail.html`「方案與承諾」的示範金額：含台幣量級商品的套組，算出的「USD」套組價會是灌了台幣數字的加總、無實際匯率意義，純示範用途。**2026-07-30 第三批補充**：套組優惠改百分比欄位後，跨幣別加總的問題不變——百分比是對同一個（未換算）加總值取比例，混幣別的失真原樣延續到折扣金額上。 | 由上游決定正式跨幣別商品是否允許同套組混搭、以及混搭時的換算或標示規則；未定前維持直接相加、不換算 |
| UIA-098 | **2026-07-30 IP 詳情頁「送出租用申請」接上流程；「稍後再說」的去處仍缺**（使用者回報按鈕點了沒反應）：**送出**照規格 5.1.3.1 §F4 實作——送出＝建立一筆 Draft 授權、進入權利人的核准佇列，**不是付款**；§F3 要求「不得讓創作者誤以為已完成授權」，故送出後**整個結帳 CTA 換成申請狀態**（只跳一個 toast 滿足不了這條，toast 幾秒就消失）：Draft 徽章＋「等待權利人核准」＋送出內容摘要（總額與條款直接讀畫面既有值，不另存一份）＋「核准前不構成授權、這一步不扣款」的說明，並提供「撤回申請」讓誤點可逆。**⚠ 原型無後端**：不建立真的授權、不寫入任何佇列、不通知任何人，重整即回初始態。<br>**待上游的三件事**：(a) **送出前是否需要二次確認**（目前直接送出、靠撤回補救；若正式流程視此為對外請求，可能要加確認步驟）；(b) **撤回的正式規則**——§7.7 生命週期只定義 Draft／Active／Expired／Revoked／Disputed，**沒有定義申請方可否自行撤回 Draft、撤回後該筆紀錄是消失還是留痕**；原型採「可撤回且不留痕」，屬暫行選擇。(c) 送出後創作者要去哪裡追蹤這筆申請——承租方視角的「我送出的申請」清單，站上目前沒有這一頁。<br>**「稍後再說」（`ip-detail.btn.save`）＝產品缺口**：上游沒有定義「已儲存／收藏的 IP」要落在哪一頁，所以這顆鈕只給一則誠實的 toast（說明暫存在本機、清單尚未有規格），**刻意不假裝有一個收藏清單可以回去看**——給一個沒有去處的成功訊息，比沒有反應更糟。 | 由上游裁定：(1) 送出前是否需二次確認；(2) Draft 授權可否由申請方撤回、撤回後是否留痕；(3) 承租方追蹤自己送出申請的頁面；(4)「已儲存的 IP」的正式歸屬與入口 |
| UIA-100 | **2026-08-01 取貨場次詳情頁重排（`pickup-detail.html`、`partials/pickup-session-modal.js`，spec 5.1.5.12／5.1.5.15）**：依使用者當次明確指示重排版面與流程，其中**兩條動到產品規則、屬產品變更提案**，未回寫 `documents/`：<br>**(a) 掃碼密碼從必填改選填**——規格 5.1.5.12 F3 明文「scanner 密碼必填」。使用者裁示：密碼是「工作人員那支掃碼器網址的鎖」，屬這場的基本設定、應可留空。原型已改成 step 1 的選填欄位並**預先產生一組**（不想管就直接下一步）；留空時詳情頁顯示「未設定，網址不上鎖」並收起複製鍵。<br>**(b) 核銷紀錄從同級分頁改 popup**——決策 D123 裁定「取貨與入場名單＝預設分頁、核銷紀錄＝第二分頁」。使用者裁示改成名單工具列右側的次要入口、開 `.payout-dialog` popup，理由是核銷紀錄屬稽核用途、低頻，不值得換掉整個主畫面；同時解掉原本「tabs 下又有 filter-tabs」的兩層頁籤。<br>**純呈現層、不需上游核准的部分**：第一屏收斂成 `.pickup-board`（左＝領取的活動與物品／右＝工作人員掃碼與核銷數字）；名單改 `.ztor-table`（欄位對齊 5.1.5.15 F4 的七欄）；撤除彈窗 result step、詳情頁「Start scanning」主鈕與 QR 圖（買家的取貨憑證 QR 屬 B09 缺口，在買家自己的訂單頁與 email，不屬創作者這頁）；刪除九處重複訊息（逐項見 UI-CHANGES 同日條目）。<br>**⚠ 原型無後端**：進度、名單、核銷紀錄皆為靜態假資料；`data-pk-stage` 的三種場次狀態目前只有進行中預設顯示，尚未接時間判斷。 | 由上游裁定：(1) 掃碼密碼是否確定改為選填、留空時的存取控制口徑；(2) 核銷紀錄的正式資訊架構（是否推翻 D123 的雙分頁）；(3) 場次狀態（尚未開始／進行中／已結束）驅動第一屏內容的規則是否成立 |

## 2026-07-23 Co-create 整合 · 產品變更提案（CCR）

把 ztor cocreate 原型（來源＝GitHub `ztor20/Frontend` 分支 `draft/dashboard-merge-demo` 的 `finance-overview.html`／`my-cocreate.html`／`my-cocreate-proposal.html`／`my-cocreate-project.html`＋對應 `css/components/*`；線上預覽 `ztor-cocreate-preview.vercel.app`）的財務與共創能力整合進 R 2.1 收入管理與項目。

使用者當次決策（2026-07-23）：(1) 收入分類**兩套合併並存**；(2) 語言幣別**融入 R 2.1＝翻英文、統一 USD**；(3)「我的項目」＝收入管理「收益拆解 → 依項目」**視為同一物件**，把單一項目儀表板做進該處；(4) 節奏**先做可點原型、規格後補**。

下列全為**產品變更提案／產品缺口**。依鐵律 5／7，UI 在 site 做**明確標示的探索性原型**，未經上游核准前不得視為已定案行為、不回寫 `documents/`。preview 的視覺（自帶 tokens、狀態色系統、`backed-card` 等）一律以 R 2.1 design system 正規化，不繼承 preview 的 design system。

### CCR-001 · §7.3 收入分類擴充（合併並存，收入類 8 → 14）

上游 §7.3「收入與交易分類（暫存）」現有收入類 8 種。preview 另有 8 種（多為影視／音樂／影評人側），與 R 2.1 幾乎不重疊。合併去重後**收入類 14 種**；非收入類（手動補登／提款／退款／扣款）沿用 R 2.1、不動。

| # | en | zh | 來源 | 定義（暫存） |
|---|---|---|---|---|
| 1 | E-Shop Sales | 商品銷售 | R2.1 | E-Shop 商品／組合／拍賣／數位內容銷售 |
| 2 | Event Tickets | 活動票務 | R2.1 | Events 票券／報名費／活動相關收入 |
| 3 | IP Royalties | IP 版稅 | R2.1 | 自有 IP 被租用／引用產生的版稅 |
| 4 | Licensing | 授權收入 | R2.1 ＝ preview「授權收益」（合併） | 授權費／租用／競標／合約收入；preview 註「淨利分成」計法，口徑差異待上游對齊 |
| 5 | Co-creation Funding | 共創計畫／項目支持 | R2.1「項目支持」＝ preview「共創計畫」（合併） | 募資／預購／粉絲支持／回報方案；preview：計畫成立後依階段分次撥付 |
| 6 | Collaborator Royalties | 合作者分潤 | R2.1 | 作為合作者取得的分潤／贊助／品牌合作 |
| 7 | Fanvestor Royalties | Fanvestor 分潤 | R2.1 | Fanvestor／粉絲投資機制產生的分潤 |
| 8 | Platform / Streaming Royalties | 平台／串流版稅 | R2.1 | YouTube／Spotify 等外部平台同步的串流／廣告收益 |
| 9 | OTT Royalties | OTT 版稅 | preview（新） | 支持的計畫上架後，依股份佔比自 OTT 版稅收入分得 |
| 10 | Music Royalties | 音樂版稅 | preview（新） | 音樂項目自發行商版稅報表（串流／下載）分得；定期彙入、非即時 |
| 11 | Tastemaker Commission | 影評人佣金 | preview（新） | 影評帶動的消費，依個人佣金比例回饋，套用於淨收益 |
| 12 | Tastemaker Advance | 影評人預付金 | preview（新） | 平台預付影評人的合作款項，於後續佣金中折抵 |
| 13 | Bonus | 獎金 | preview（新） | 平台活動與里程碑發放的獎勵金 |
| 14 | Co-creation Party Revenue | 共創派對收益 | preview（新） | 發起或參與的共創派對（放映／見面會等實體活動）分潤 |

**去重與收斂註記**：#9 OTT／#10 Music／#8 Platform 三個版稅類語意相近（影視串流／音樂串流／泛平台），合併並存下暫全保留，未來可考慮收斂為單一「串流版稅」加子類。#4、#5 已把 preview 同義類併入 R 2.1 既有類。
**回寫目標**：確認後由 `design-spec-writer` 擴充 §7.3 收入分類表與 §5.1.8 F5 收入來源清單。

### CCR-002 · 影評人（Tastemaker）身分與佣金／預付金

preview 有「影評人」身分與其專屬金流：佣金（依個人比例、套用淨收益）＋預付金（平台預付、後續佣金折抵），收入管理頂部並有「影評人佣金比例」KPI。R 2.1 目前為單一創作者視角，無影評人身分與此金流。**待確認**：影評人是否為 R 2.1 正式身分、佣金比例來源與計算口徑、預付金折抵規則。**影響頁**：earnings、projects、settings（身分）。

### CCR-003 · 共創集資分期撥款門檻

preview 定義撥款分期：預算 <USD 50,000 兩期（完成扣款 80%／交件 20%）、≥USD 50,000 四期（10%／10%／60%／20%）。R 2.1 §5.2.2／§7.3 有淨利池與手動觸發撥款，但**無「依預算級距的分期撥款排程」**。**待確認**：級距門檻、各期比例與觸發條件是否納入產品。**影響頁**：earnings 依項目儀表板、projects。

### CCR-004 · 支持者付費分層（Believer／Champion／Inner Circle）＋扣款狀態機

preview 單一項目有付費支持分層（Believer USD 13／Champion USD 65／Inner Circle USD 385，各有名額與達成率）＋支持者名單＋扣款狀態機（待扣款／已扣款／待退款／已退款／扣款重試中／已取消／未扣款，7 態）。**注意軸別**：此為「集資方案付費檔位」，**與 §7.5 粉絲分級（Inner Circle／Superfan／Devoted…＝貢獻分級）不同軸、名稱雖有 Inner Circle 但非同一物件**，不可混用。R 2.1 無此付費分層與扣款狀態機。**待確認**：分層是否為產品機制、扣款狀態機是否納入 §7.2 狀態語言。**影響頁**：earnings 依項目儀表板。

### CCR-005 · 項目類型與身分維度（身分維度已裁決撤除）

preview「我的項目」列表有類別維度（影視／電影／短劇／連續劇／音樂／單曲／專輯）與身分維度（發起人／支持者／影評人）。R 2.1 projects 現有類型為 Go live／Fund it first／Pre-order（發行模式），與 preview 的「內容類別」不同軸。**待確認**：內容類別是否引入、與 §7.1 商品分類的關係、身分維度是否納入。**影響頁**：projects、earnings。

**2026-07-23 已在 projects 落探索原型（`projects.html`，對照 cocreate `finance-overview.html`）**：新增兩個獨立篩選維度，接上既有 projects 篩選機制（status tab × type chip × search 同機制）。

- **內容類別（新軸，獨立於發行模式 type，不取代它）**＝原生 `.select` 加 optgroup 呈現階層：群組標頭 Film & TV（影視）／Music（音樂）為**不可選**（對齊 cocreate 影視/音樂為群組標頭），可選葉節點＝Film 電影／Short drama 短劇／Series 連續劇／Single 單曲／Album 專輯。每列資料加 `cat2` 葉值（`CAT_GROUP` 對應群組）。既有樣本列的顯示類別文字（Documentary／Playlist／Short film 等）維持不動，僅另掛 `cat2` 供篩選（Documentary→film、Playlist→album 為就近歸類的呈現對應，UIA-003）。
- **身分維度（曾落過探索原型，2026-07-23 同日經使用者裁決撤除）**＝原本是 `chip-group`（All／Creator／Backer／Tastemaker）＋每列 `roles` 集合語意，並掛 3 筆別人的項目樣本列（Dragon Gate Nights／First to the Line／Paper Boats）示範「我支持的／我影評的」視角。詳見下方裁決段。
- **性質＝探索性原型、非已定案功能**：純前端 demo（無後端、無持久化），未回寫 `documents/`。**待上游**：內容類別是否引入正式產品、與 §7.1 商品分類的關係。

**2026-07-23 使用者裁決 · 身分維度不納入，已從 projects 撤除**：Creator Studio 是創作者自己的後台，Projects 的範圍就是「我發起的項目」，不該出現支持者／影評人視角——那是消費端（共創前台 `finance-overview.html`）的軸，搬進後台屬誤植。

- **已撤除**：`#proj-identity` chip 組、`#proj-identity-note` demo 提示條、`identity` 篩選狀態與 `roles` 欄位、3 筆非本人項目的樣本列、`projects.identity.*` 6 個 i18n 鍵、已無消費者的 `info-banner.css` 載入。
- **保留**：內容類別軸（`#proj-cat`）不受影響，改併入第一列 `filter-row` 的 actions 區（搜尋框左側），版面回到單列篩選。
- **CCR-005 剩餘待上游**：只剩內容類別是否進正式產品、與 §7.1 商品分類的關係。身分維度本項結案（不納入）；影評人（Tastemaker）身分的正式定義仍掛在 CCR-002。

### CCR-006 · 版稅報表（OTT／音樂，發行商定期彙入）

preview 音樂型項目有版稅分析（地區佔比、平台佔比、Top10 單曲、季度版稅），且註「版稅報表由發行商定期提供、與募資收益分開計算」。R 2.1 無版稅報表結構。**待確認**：版稅資料來源、彙入頻率、是否與募資分帳。**影響頁**：earnings 依項目儀表板（音樂型）。

**2026-07-24 已在 project-detail 落獨立版稅 tab 原型**：版稅區塊自 Money（backup）搬出，不重複保留；只在 `fund + published + music` 顯示。`adia-chan` 是唯一已上線募資音樂示意樣本，僅供驗收該 tab；季度總額 US$1,590、地區佔比 11 條、平台佔比 8 條與 Top10 兩排序表皆沿用 preview 示意值，標「提案 · 未定案」。仍為呈現探索、未回寫 documents/。

**2026-07-25 使用者裁決 · 版稅適用範圍改「募資型全類別」，並新增影視版版型**：條件由 `fund + published + music` 改為 `fund + published`（拿掉音樂限制）。

- **裁決理由（產品規則）**：版稅是**股份分潤**的產物，只有募資型項目讓支持者持有股份；直接發佈與預購沒有股份，因此任何階段、任何類別都不會有版稅。募資型則影視與音樂都有版稅，差別只在報表內容形態。
- **影視版版型（新做）**：季度版稅總額與地區佔比兩塊與音樂版共用；音樂專屬的「串流平台佔比」換成 **OTT 平台佔比**（Netflix／Disney+／愛奇藝／Prime Video／CATCHPLAY+／friDay 影音），「Top 10 歌曲」換成 **授權明細表**（平台／授權地區／授權期間／授權金／入帳狀態）。理由：一部電影沒有「單曲排行」，影視版稅的實際形態是逐筆 OTT 授權合約；此結構對電影／短劇／影集／MV 皆適用。
- **樣本**：音樂版＝`adia-chan`（陳松伶精選）；影視版＝`mong-kok-shootout`（旺角狙擊，同日由 `funded` 推進為 `published`）與周湯豪 persona 的 `nick-ni-shuo`（你說的都對 MV，MV 屬影視家族）。數字全為示意值。
- **待確認（延續 CCR-006 主體）**：版稅資料來源與彙入頻率、與募資分帳的關係、授權明細的欄位定義（授權金是否含分潤比例、入帳狀態的狀態機）、以及「版稅只屬募資型」這條規則是否正式納入產品。未經上游核准前不寫回 `documents/`。

### CCR-007 · 共創「依項目儀表板」後台頁（cocreate-dashboard.html）＋股權 70/30 分潤

使用者裁決「整套全做、NFT 與股權兩模型都保留、看過畫面再決定」，本輪先產出 CCR-003/004/005 所指「earnings 依項目儀表板」的後台探索頁 `cocreate-dashboard.html`（Phase 4 gated，`data-page-feat="full"`），呈現：募資摘要、KPI、共創金額（支持總金額−系統費 8.4%+HKD$2.40＝應撥）、支持者分層總覽、支持者付款明細、分期撥款、活動公告，以及**淨收益股權分配 發起人 70% / 支持者 30%**。

- **狀態＝探索原型、明確標示、非已定案**：頁面頂部 info-banner 與頁尾都標「股權模型預覽・待產品裁決」；既有 NFT/淨利池 `project-detail.html` 不受影響、兩模型並存。
- **待產品裁決（模型主軸）**：後台正式採 NFT/淨利池、或股權/70-30、或並存二選一——這是 CCR 系列尚未定的最上位決策，使用者將看畫面後裁決。70/30 分潤比例本身在既有 CCR 未定義，屬本頁新標的呈現假設。
- **數字未對齊處（誠實標註）**：本頁撥款用 3 期 40/30/30 為示意，與 [CCR-003](#ccr-003--共創集資分期撥款門檻) 記載的 preview 級距表（<50k 兩期 80/20、≥50k 四期 10/10/60/20）**尚未一致**；正式立規格時以 CCR-003 為準、本頁數字重對。支持分層／扣款狀態沿用 [CCR-004](#ccr-004--支持者付費分層believerchampioninner-circle扣款狀態機)。
- **未回寫上游**：本頁未進 `documents/0-設計規格書.md §3.2 Sitemap`；納入正式產品前需先由 `design-spec-writer` 補 sitemap 與 5.1.x 規格。**影響頁**：projects、earnings、cocreate-dashboard。

**2026-07-23 更新 · 使用者裁決「統一模型」（取代 NFT vs 股權二選一）**：經討論收斂成單一模型，`cocreate-dashboard.html` 已改呈現。

- **支持者＝NFT 持有者**：認購方案即發代表其份額的 NFT，消除「分給誰」的軸別衝突，只剩一個分潤比例參數。
- **發起人自付額 0～任意（0＝純預購）**：發起人可選自付多少投入資金池；資金池＝支持者募資＋發起人自付。此為單一旋鈕，取代原「甲事前募資／乙事後回收」二選一。
- **錢分兩段**：製作期依交付物分期撥款（保護支持者）；上映後淨收益分潤，發起人可提早手動觸發。
- **仍為可調參數（待產品/需求方定案）**：分潤比例數字、自付額是否換更高分潤%、NFT 可否轉賣／有無治理權、手動提早觸發是否也能碰製作撥款（若能碰則支持者保護變弱）。
- **2026-07-23 已執行合併**：統一模型已併入 `project-detail.html`（Money 分頁→「共創金流」，Late Bloom 口徑：自付 $2,000、池 $10,420、費 −$707、應撥 $9,713、三期 40/30/30、分潤 70/30）；舊 NFT 60/40 區塊（waterfall／distribution／governance）自 markup 撤除（UI-CHANGES 記 C 類）。內容區（關於／合作者／里程碑／發布更新）接 drawer 編輯面板（原型級、不持久化）。`cocreate-dashboard.html` 使用者確認後已於同日退場刪除（devtools／sidebar 的 FULL_ROUTES 與 projects match 同步解除；`cocreate.*` i18n 鍵保留、由 project-detail 共創金流分頁續用）。
- **仍待上游**：統一模型正式規格（§3.2 sitemap 定位、5.1.2.2 §2.3 金流改寫、分潤比例與自付額換分潤的公式、NFT 轉賣/治理權、手動提早觸發可及範圍）由 `design-spec-writer` 另輪補；本輪一切為呈現探索、未回寫 documents/。

### CCR-008 · 支持方案改「共創套組」資料模型（2026-07-24，使用者指定 Phase 4 完整版照建立流程做）

使用者指定：Phase 4（`full` 完整版）中，項目詳情「方案與承諾 › 支持方案」的編輯器要照建立流程 create-campaign 的「新增套組」做。**這改動了支持方案的產品資料欄位**，故列為產品變更提案。

- **原欄位**（R 2.1 pledge editor）：方案名稱／價格／E-Shop 商品引用／名額／額外權益（benefits 多行）。
- **改為套組模型**（照 create-campaign）：套組名稱／套組描述／**含股份（分潤股份）**／名額／**套組商品（照片＋名稱＋描述，可多件）**。
- **與現有假設的關係**：本模型與 CCR-007（股權 70/30 分潤）、CCR-004（支持者付費分層）同屬共創資金結構；「含股份」把回饋方案與分潤股權綁在同一張套組上，語意上比原「價格＋E-Shop 商品」更貼近共創集資，但**兩者是否並存、或套組模型取代 pledge 模型、或依項目類型（募資 vs 直接上線 vs 預購）切換不同編輯器**，上游未定。
- **呈現處理**：project-detail「支持方案」已換成套組編輯器（`#pd-bundle-editor`，元件 `bundle-editor.css`），前端 demo：不持久化、含股份/名額不計算、套組商品不落地為 e-shop 商品。至少 1 個套組。
- **2026-07-30 已完成落地（使用者裁決，UI-CHANGES 同日）**：project-detail 的套組編輯器由「照建立流程重做」的第一代 inline 版，改成與 create-project「回饋套組」步驟**共用同一支模組**（`js/bundle-editor.js`），兩頁欄位完全對齊：套組名稱＊／價格＊／一句話說明／含分潤名額／販售上限（自動·限量）／商店商品（引用既有 E-Shop SKU）／額外權益。本輪使用者裁決同時回答了下方「待上游」第(1)(3)兩點的呈現層部分：**「含股份」不再獨立於「名額」之外，併入含分潤名額同一欄**（原「原欄位」段落所述的股份/名額二選一已由「一個名額欄，0＝純回饋不分潤」取代）；**套組商品不接受自由輸入，一律引用既有 e-shop 商品**（第一代的照片上傳＋自由文字商品列已整段移除）。這是呈現層與元件行為的定案，**分潤股權的正式口徑（(2)）與是否依項目類型切換編輯器（(4)）仍待上游**，未回寫 `documents/`。
- **待上游**：(1) 支持方案的正式資料模型（套組 vs 方案、欄位集）——呈現層已定案為套組模型，資料模型仍待上游拍板；(2)「含分潤名額」與 §7.x 分潤/股權口徑、CCR-007 的 70/30 如何對應；(3) 套組商品與 e-shop 商品的關係——呈現層已定案為引用既有商品，但引用機制的資料層（庫存扣減、下架商品的降級呈現）待上游；(4) 是否依項目類型顯示不同編輯器。未經上游核准前不回寫 documents/。
- **2026-07-30 第二批（使用者裁決）：套組定價規則本身改變，屬商業規則、非單純呈現**——「價格」欄由創作者手填改為系統唯讀推導（名額數×每名額單價＋商品定價加總），並新增「套組優惠」欄位，折抵範圍**限定只能吃商品那一段、不可折抵分潤名額**（地板＝股份總價）；純回饋（0 名額）卡可折到 $0，只含名額無商品的卡一分都不能折。這改動了「創作者能對套組價格做什麼」的規則本身（從自由定價，改成受限的自動計算＋有上限的折扣），不是換個欄位排版，故連同上一則一併列為產品變更提案。**呈現處理**：`js/bundle-editor.js` 的 `listPrice()`／`finalPrice()`／`maxDiscount()`，兩頁（create-project、project-detail）同步生效，見 UI-CHANGES 2026-07-30。**待上游**：(5) 「套組價格＝推導值＋限定折扣」是否為正式定價規則，或創作者仍應保留一定的自由定價空間；(6) 折扣上限「不可折抵分潤名額」是否為硬性規則，或應允許創作者以其他方式讓利給支持者；(7) 每名額單價是否應允許逐套組覆寫，或維持全項目統一一個單價（現行假設是後者，見 PG-020）。未經上游核准前不回寫 `documents/`。**2026-07-30 第三批（使用者裁決）**：套組優惠的單位由「金額」改為「百分比」（0–100%，折抵金額＝原價×百分比÷100），其餘規則不變——仍只能折抵商品那一段、地板仍是股份總價，(5)(6)(7) 三項待上游問題不受單位改變影響。

### CCR-009 · 展示內容素材模型改「直式相簿＋方形裁切＋展示媒體」（2026-07-25，使用者指定照建立流程/參考截圖）

使用者指定：項目詳情「關於項目 › 展示內容」照參考截圖排版，並把素材改成**直式相簿（第一張＝封面）＋每張可設方形裁切位置**、可編輯。**這改動了展示素材的資料模型**，故列為產品變更提案。

- **原素材集**（R 2.1）：固定四槽——縮圖 1:1／海報 3:4／橫幅 16:9／相簿 3:2＋預告單檔（見原 upload-assets）。
- **改為**：單一**直式相簿**（多張 portrait 圖，第一張自動當封面）＋**展示媒體**（Demo 影片／Demo 音樂）。每張直式圖帶一個**方形裁切框**，設定其在方形版位（商店卡／縮圖）的裁切位置；直式→方形寬滿版，故只需選上下位置。
- **與現有規格的關係**：原四槽素材集屬 §5.1.5.2/§7.7 Media Pack 的呈現規格（且各 IP 類型槽位上游本就未定，見 PG-017）。本輪把「多比例固定槽」換成「單一直式集＋每圖方形裁切」是**素材模型與比例規格的改動**，上游未定：(a) 正式素材集是幾種比例、是否保留橫幅/海報；(b)「方形裁切位置」是否要落地為真實裁切資料（給商店卡/縮圖用）還是僅呈現；(c) 相簿張數上下限。
- **呈現處理**：`.pd-gallery`（shared.css）＋內嵌拖曳 JS，前端 demo：裁切位置只反映在畫面、不持久化、不產生實際裁切檔；封面第一張用項目海報（與 hero 同源），其餘為 demo 圖。
- **待上游**：正式素材集與比例、方形裁切是否落地為資料、張數限制。未經上游核准前不回寫 documents/。

## 2026-07-31 Earnings 拆頁 · 產品變更提案（ESP）

把單一的收入管理（Earnings）拆成導覽群組底下兩個目的地：**收入總覽**（Ztor 上的全部收入 ＋ 各平台匯進來的版稅，純看）與 **Ztor 收入**（Ztor 經手金流的結算層）。使用者裁決（2026-07-31，同日兩次）：

1. 兩頁命名採「收入總覽／Ztor 收入」；外部那半的明細與補登入口放頁1。
2. **外部只收「版稅」**——外部平台的商品販售、票務銷售不納入。
3. Ztor 自己的版稅（IP 版稅、授權）與發行商版稅**合併成一個總版稅**。
4. 手動補登保留，但範圍收窄成「補登版稅報表」。

下列全為**產品變更提案**。依鐵律 5／7，本輪只在 site 做明確標示的探索性原型，未經上游核准前不得視為已定案行為、不回寫 `documents/`。舊的單頁 `earnings.html` 原封不動保留，只從導覽移除、仍可直達。

### ESP-001 · 版稅的資料來源是發行商報表，不是各平台 API 同步

第一版原型把外部收入做成「平台連結狀態」（Spotify 已同步 2 小時前／StreetVoice 未連結 → 前往設定），**這個模型是錯的**，已整組移除。依 cocreate 原型的提案版稅分頁（`ztor-dashboard-merge-demo.vercel.app/my-cocreate-proposal.html?tab=royalty`），版稅來自**發行商定期報表**，部分來源約延遲一季；「串流平台表現」是報表內的平台拆分，不是 Ztor 分別接八個平台的 API。

呈現因此改成講「報表什麼時候到」（資料截至日、延遲說明、匯出報表），不講「平台連上了沒」。

**待上游**：發行商報表的實際串接方式、更新頻率、哪些平台在報表覆蓋範圍內。

### ESP-002 · 兩個切面，不是兩個桶子（KPI 為什麼不放總版稅）

合併後 `總版稅 = 發行商報表 + Ztor IP 版稅 + Ztor 授權 + 手動補登`，但後兩三項本來就在「Ztor 收入」裡，所以 **總收入 ≠ Ztor 收入 + 總版稅**。

原型的處理：KPI 那一列維持互斥可加總（總收入＝Ztor 收入＋站外版稅），**總版稅不上 KPI**，改當版稅區塊自己的大數字。兩層各自成立——KPI 按「結算歸屬」切，版稅區塊按「收入性質」切。逐列的 badge（可在 Ztor 結算／站外／未驗證）就是兩個切面的接縫。

**待上游**：§7.3 是否新增「收入歸屬（on-platform／off-platform）」與「收入性質（是否為版稅）」兩個正交欄位。若納入，§7.3「使用限制」段那堆逐項例外可整段簡化成頁面層級規則。

### ESP-003 · 時間軸對不上：趨勢圖只畫 Ztor

Ztor 收入即時、發行商版稅季報且延遲一季。畫在同一張趨勢圖上，最近兩三個月的版稅必定是空的，看起來像收入崩掉。

原型的處理：趨勢圖標題改「收入趨勢 · Ztor」，圖腳註明「只含 Ztor 上的收入，版稅是季報、會晚一季到」，版稅在自己的區塊用自己的期間軸（月／季／年／自訂）。

**已知不一致（本輪未修）**：趨勢圖的來源圖例仍含「平台／串流版稅」與「OTT 版稅」兩條線，與「只含 Ztor 收入」的註記相牴觸。那兩條線的 SVG path 是手繪的，重畫成本高於這輪 demo 的價值；等資料歸屬（ESP-004）定案後一次處理。

### ESP-004 · 「平台／串流版稅」與 OTT 版稅歸哪一邊，仍未選邊

§7.3 第 8 類與 CCR-001 第 9／10 類的金流路徑規格未定義：同步進來的是**數字**還是**錢**？若 Ztor 不是收款方，屬站外、只記錄；若 Ztor 代收再結算，屬 Ztor 側、應計入可提領。

原型現況：版稅區塊的「平台表現」把 `Ztor OTT` 列在第一位（示意 Ztor 自家平台），發行商報表則標「站外」；頁2 的交易明細篩選仍保留「Platform / streaming」chip。等上游裁決後收斂。

### ESP-005 · 「作品」維度在兩邊口徑不同

cocreate 那頁的 Top 10 是**歌曲**（單一專輯內）。總覽層升成**作品**。但 Ztor 側的商品／活動收入也掛在項目上，兩份排行口徑不同（一個依版稅、一個依銷售），不能合成一張表。原型的處理：版稅排行標明「依版稅金額」、只列有版稅的作品，不與 Ztor 側的項目排行合併。

**待上游**：「作品」與「項目（Project）」是不是同一個物件？版稅要掛在哪個實體上（作品／項目／IP）。

### ESP-006 · 最終落點：單頁 ＋ 版稅分頁（拆頁提案已收回）

一度拆成「收入總覽／Ztor 收入」兩個導覽目的地，2026-07-31 使用者裁決**併回單一 `earnings.html`**，版稅改當一個分頁。拆頁版兩支檔暫留磁碟供比對、不掛導覽。

- 分頁：總覽｜版稅｜交易明細｜項目收益｜提款｜稅務文件｜如何運作
- KPI 四張：總收入（hero）｜Ztor 收入｜站外版稅｜可提領。前三張互斥可加總，範圍一眼看得懂；淨利移入「項目收益」分頁、待結算併進可提領卡的輔助行。
- 影評人佣金率提示（CCR-002）留在頁首：它是套用於淨收益的 Ztor 側費率。

**待上游**：`documents/5.1.8-收入管理.md` 的分頁架構由五個變七個（§2 F2 分頁架構）；版稅四組資料（總版稅／依來源拆解／作品 Top／地區與平台表現）是否升格為新的 F 編號；F3 財務摘要卡的四張指標改組是否照收。

### ESP-007 · 為什麼不用全頁 filter

使用者提過「用 filter 分開」。不採用的理由：filter 的前提是**每個值對每個視圖都成立**，這裡不成立——

| | 總覽 | 交易明細 | 項目收益 | 提款 | 稅務文件 | 版稅 |
|---|---|---|---|---|---|---|
| 全部 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ztor | ✅ | ✅ | ✅ | ✅ | ✅ | 部分 |
| 站外 | ✅ | ✅ | 空 | 空 | 空 | ✅ |

站外那一列有三格是空的（項目收益是 Ztor 的金流瀑布，提款與稅務文件沒有站外版本）。此外提款與稅務下載屬動錢操作，主要行動（Request Payout）不該隨 filter 狀態出現又消失。

原型的處理：範圍區分交給分頁，filter 只放在兩邊都有內容的地方——目前是交易明細的「站外版稅」chip。總覽分頁刻意不加範圍 filter（趨勢圖本來就只畫 Ztor，KPI 已把範圍講完）。

**待上游**：若之後站外側長出更多內容（例如站外的稅務彙總），再重新評估 filter 是否成立。

## 2026-07-31 圖片上傳槽比例收斂 · 產品變更提案（IMG）

### IMG-001 · 全站圖片上傳槽比例收斂為單一直式 750×930，與現行 `documents/` 規格已分岔

**狀態：已由上游採納（2026-07-31 當日稍後）。** 主規格新增 **§7.10 圖片素材規格（Image Assets）**、`documents/decisions.md` **D164** 正式收下本則產品變更提案——標準比例、最小尺寸兩階、顯示版位取圖方式（置中裁切）、活動橫式例外皆已寫入上游。下方差異清單保留為歷史記錄（呈現層當時如何先行落地、與規格的分岔細節），不再代表現況分岔；現況以 §7.10／D164 為準。

下方第 383 行「顯示框維持各自既有比例不變」的原始結論，已在同日稍後被使用者第二輪裁決推翻——顯示端（清單縮圖、卡片封面等 7 支元件）也一併改直式，見 `UI-CHANGES.md` 2026-07-31（第十二批）條目與 `STYLE-DECISIONS.md` Q39 續作註記；這條也已隨 D164 收進 §7.10「顯示版位與取圖方式」。

使用者 2026-07-31 明確裁決：全站「上傳圖片」槽一律改用單一直式 750×930（`--upload-img-ratio`，`ds-components/upload-tile.css:31` 為單一來源），取代原本各模組各走一套的多比例模型。10 個產品頁已改用新比例，另加測試版路由 `funding-test/create-campaign.html`（見 UI-CHANGES.md 2026-07-31 條目）。這是**呈現層已落地、上游規格尚未同步**的產品變更提案。

**差異清單**（`documents/` 現行規格值 vs 站上現況）：

- **商品**（實體 F1／數位 F2）：主圖／封面 ≥800×800、附圖 ≥600×600（`documents/5.1.5.2-建立商品流程.md:128-129`、`:226`）——站上兩者皆已改 750×930 直式。
- **拍賣**：主圖／附圖 ≥800×800（`documents/5.1.5.10-建立拍賣流程.md:92-93`）——站上已改 750×930 直式。**例外**：同頁 F3「與物品合照」證明照規格同樣 800×800（`:112`），但站上這格是獨立的檔案槽（`upload-tile--file`，`create-auction.html:190-193`），本輪收斂未觸及、目前仍顯示 `Min 800 x 800px`——與其餘圖片槽不同調，需請上游一併確認此欄是否納入同一次收斂。
- **活動** 4 格：縮圖 800×800·1:1／直式海報 900×1200·3:4／橫式橫幅 1920×1080·16:9／圖庫 1200×800·3:2（`documents/5.1.6.1-建立活動流程.md:135-138`；檢核方向 `:311` 明寫「圖片四格各有用途」）——站上四格皆已改 750×930 直式（`create-event.html:175-196`、`edit-event.html:236-268`）。
- **建立項目** 3 格：縮圖 800×800·1:1／直式海報 900×1200·3:4／橫式橫幅 1920×1080·16:9（`documents/5.1.2.1-建立專案流程.md:178-180`；同頁 §F6 第 4 格圖庫 1200×800·3:2 見 `:181`，與活動同構、同樣受影響）——站上已改 750×930 直式（`create-project.html:250-268`）。

站上現況（`ds-components/upload-tile.css:129-139` 墓碑註解）：舊形狀修飾詞 `--1x1`／`--3x4`／`--3x2` 已從圖片槽退場、CSS 宣告本輪一併刪除；`--16x9` 仍服役，但只用於 project-detail 的 Demo 影片／音樂**檔案**槽（非圖片上傳槽），不受這次收斂規範。

**這是使用者 2026-07-31 的明確裁決，上游規格尚未更新**，需要：

1. ~~走 `design-spec-writer` 流程改 `documents/5.1.5.2`／`5.1.5.10`／`5.1.6.1`／`5.1.2.1` 等所有列出圖片尺寸的段落，統一為 750×930 直式（或由上游決定是否仍需要多比例、以及拍賣 F3 證明照是否一併收斂）。~~ **已完成**——D164 的影響清單已逐檔改寫這些段落，拍賣 F3 判定為非展示槽、不套用本標準（不需另外收斂）。
2. ~~記一條決策到 `documents/decisions.md`（次一可用編號＝**D164**）。~~ **已完成**——即本則 D164。

**連帶影響（D156 缺口的延續與現行答案）**：D156（2026-07-30，移除方形裁切工具、展示圖片維持單一直式尺寸）當時留下一個缺口——「方形版位（如清單縮圖、專案卡、IP 卡）要怎麼從直式原圖取圖」未定義。本輪站上的實際答案是：**顯示框維持各自既有比例不變，一律用 `object-fit: cover` 從直式原圖置中裁切填滿**（清單縮圖、`.project-card__cover-img`、`.ipm-card__cover-img`、`.ip-hero__cover-img` 皆已確認為此做法；`ds-components/upload-tile.css:24-30` 的變數註解亦明寫這條分工）。這個「顯示框不變、靠 cover 裁切」的具體答案本身也需要上游追認——它意味著方形版位往後永遠是直式原圖的局部裁切結果，而非獨立拍攝或裁切的方形素材，與現行規格逐槽各自定義比例的假設不同。

另見 `產品缺口` 表的 **PG-023**（具名素材槽在單一比例下失去區辨意義）。

### ESP-008 · 版稅三層與「次數」單位歸屬（2026-07-31 使用者裁決）

**三層並存，各自成立**（使用者 2026-07-31 裁定）：

| 層級 | 位置 | 範圍 |
|---|---|---|
| 跨項目·次數 | 儀表板表現卡 | 全部已上線項目的觀看＋串流 |
| 單一項目·版稅＋次數 | 項目詳情的版稅分頁（CCR-006）＋表現分頁 | 那一個項目在各地區／各平台的表現 |
| 跨作品·版稅 | 收入管理·版稅分頁 | 全部作品彙總 |

項目詳情的版稅分頁與收入管理的地區／平台榜**地區清單完全相同**，但範圍不同：一個回答「這個項目在哪些地區賺錢」，一個回答「我全部作品在哪些地區賺錢」。**不合併**。

**待做（本輪未做）**：兩層之間還沒有動線——收入管理的作品榜點任一列，應該能跳到該項目的版稅分頁。要接之前需先確認「作品」與「項目（Project）」是不是同一個物件（見 ESP-005）。

**待回寫規格**：D162 的單位界線寫「粉絲分析算『人』，儀表板／項目詳情的表現卡算『次數』」。2026-07-31 使用者把「Top 10 作品·依串流／下載次數」搬進粉絲分析，該頁因此出現第二種單位。原型已在卡上用膠囊與註腳標明兩者不可互比，但 **D162 的敘述需要更新**：粉絲分析＝以人為主、另有一張明確標示的次數榜。
