# r2.1 風格裁決紀錄

同一視覺角色站上只能有一個答案。本檔記錄呈現層的風格裁決：已裁決條目是法律，動 UI 前先查；發現站上同一件事有兩種做法時，記入待裁決（附證據檔:行號），暫依最新確認的做法並標註題號，不得默默新增第三種。裁決權在使用者；裁決後要開執行工單全庫同步，並在 UI-CHANGES.md 記錄。

---

## 已裁決

| 編號 | 角色/題目 | 裁決 | 日期 | 理由 | 執行狀態 |
|---|---|---|---|---|---|
| Q1 | 膠囊型元件圓角形狀 | **B**：可篩選/可點＝全圓（chip、filter-tabs），純顯示徽章＝小圓角矩形（badge、field-pill、metric-pill）。形狀＝「可否互動」的線索，須寫進 design-system.md | 2026-07-13 | 形狀當 affordance 比全統一更有資訊量 | ✅ 已執行 2026-07-13 |
| Q2 | 控制項圓角級距（6 vs 7px） | **統一 6px**：`--radius`/`--radius-md` 合併成 6px；`.btn--icon-circle` 裸值 9999 改 `--radius-pill`。全圓 pill(9999)、shell(28) 不動 | 2026-07-13 | 1px 是假精度 | ✅ 已執行 2026-07-13 |
| Q3 | 卡片邊界：陰影 vs 邊框 | **C（規則版）**：預設卡片用 1px 純邊框（平、乾淨）；只有要強調可點/浮起的主卡才升級純陰影 | 2026-07-13 | 邊框優先＝editorial，陰影收窄成「強調」訊號 | ✅ 已執行 2026-07-13 |
| Q4 | 控制項邊界：真 border vs 陰影模擬 | **A**：input／textarea／select／switch／metric-pill 全改 `border:1px solid var(--border)`，跟 2026-06-12 按鈕決定一致 | 2026-07-13 | 白底上真 border 較清楚；與 Q3 一致 | ✅ 已執行 2026-07-13 |
| Q5 | hover 浮起規則 | **A**：可點卡片 hover 浮起（借 `--shadow-float`），清單列 hover 只換底色。先在 design-system.md 定義「什麼算卡片、什麼算列」〔**2026-07-20 scoped 例外**：`.product-list--ip .product-list__row:hover` 改浮起（`--card` 底＋`--radius-md`＋`--shadow-float`，比照 `--eshop` 的 `.is-dragging` 拖曳抬起態），使用者明確指定「hover 要跟 drag 的 style 一樣」——僅 `--ip` 這個變體，其餘 `--eshop`／`--bundles`／`--auctions`／`--orders`／`--pickup` 清單列仍維持 A 原規則（只換底色）〕 | 2026-07-13（07-20 加 `--ip` scoped 例外）| 卡片＝浮起、列＝換底的標準區分 | ✅ 已執行 2026-07-13（`--ip` 例外 07-20 使用者裁示）|
| Q6 | 表單欄位垂直節奏 | **以 .field 為準**（欄位間距 16px、form-section 不再局部覆寫）。折衷選項：長建立流程「欄位↔欄位」改用刻度值 24 保留呼吸感——此折衷待使用者最終確認 | 2026-07-13 | 統一節奏；26 裸值退場 | ✅ 已執行 2026-07-13（統一 16px；「長流程 24」折衷未採用，日後需要可加 `.form-section .field{margin-bottom:var(--sp-24)}`）|
| Q7 | 卡片內距級距 | **B**：保留各自內距（KPI 緊/空狀態留白），整理成一張對照表寫進 design-system.md；未來要正式分 sm/md/lg 再升 A | 2026-07-13 | 不同功能密度不該壓成單一值 | ✅ 已執行 2026-07-13 |
| Q8 | 品牌橘使用範圍 | **B**：橘只給主操作/主分類（Tabs、選擇卡已選）；導覽/篩選的已選一律中性灰。`.settings-nav--active` 改回中性灰、向 `.app-sidebar` 看齊〔**Q19 加一個 scoped 例外：tag-input 的已選標籤 chip 用橘框，因標籤＝創作者為商品下的分類、非 filter；全站 `.chip--active` 仍反白黑底不變**〕 | 2026-07-13 | 克制用橘維持其意義、不與 CTA 搶視覺 | ✅ 已執行 2026-07-13 |
| Q9 | hover 底色灰階 | **--accent（#F3F3F3）**：互動 hover 統一用 accent；`--muted` 留給斑馬紋/次級襯底；散落的 `color-mix(...)` 即席灰收斂成 accent；**`--secondary` 退役** | 2026-07-13 | hover 要被看見，muted 太淡 | ✅ 已執行 2026-07-13 |
| Q10 | 關閉鍵 icon 尺寸 | **16px**：拿掉 alert(20)／dialog(18) 覆寫，全部關閉鍵回到基礎 16 | 2026-07-13 | 對齊基礎 `.ztor-icon` 尺度 | ✅ 已執行 2026-07-13 |
| Q11 | 「已付款 Paid」顏色 | **A**：全站綠色 success（`orders.pay.paid`、`od.badge.paid` 改 `badge--success`）。備註：若之後覺訂單列視覺過重可退 B | 2026-07-13 | 一語意一色、綠色 Paid 直覺 | ✅ 已執行 2026-07-13 |
| Q12 | 欄位標籤：大寫 vs 一般 | **A**：`tier-settings.html` 的 `.gate-field__label`（大寫孤例）退役，改用 `.settings-row__label`（一般大小寫） | 2026-07-13 | 大寫孤例是站上小標系統的重複發明 | ✅ 已執行 2026-07-13 |
| Q13 | 建立流程選擇卡邊界／`form-section--outlined` 外框 | **邊框化**：`.selection-card--icon`（型別卡，卡距 8）與 `.radio-cards`（不限量/限量等二選一卡，卡距 12）由陰影改 1px 純邊框 `--border`、扁平無陰影（更貼 Q3 扁平預設，base `.selection-card` 其他用途維持陰影）。radio 標記精修（Figma node 781-4386）：已選卡無橘外框（只留灰邊框）、標記為置中小橘實心點無外圈、未選無可見標記。`.form-section--outlined` 外框全站改圓角 `--radius-xl`(16)／內距 `--sp-16`（原 6／32）〔**邊框部分已被 Q14 取代**〕〔**icon 磚尺寸已被 Q18 縮小**〕〔**已選型別卡已被 Q19 加淡橘底（outline 仍在、仍無勾）**〕 | 2026-07-16 | 使用者指定對齊 Figma node 781-4166 | ✅ 已執行 2026-07-16 |
| Q14 | `form-section--outlined` 是否保留 1px 外框 | **去外框、保留填色卡**：`.form-section--outlined` 移除 `border`（原 1px `--border`），保留背景填色（亮 `--card`／暗 `--muted`）、圓角 `--radius-xl`(16)、內距 `--sp-16`；靠填色對比區分區塊，不再有邊界線。**取代 Q13 對本元件的「邊框化」部分**（Q13 的 selection-card／radio-cards 邊框不受影響）。實作用 `.form-section.form-section--outlined`（權重 0,2,0）蓋掉 `.form-section + .form-section` 分隔線，確保四邊無殘留〔**暗色填色已被 Q15 midnight 改為 `--card`**〕〔**Q18 再加 E2 陰影＋頂緣高光＝浮起卡，仍無邊框**〕 | 2026-07-16 | 使用者裁示：outlined 卡的硬邊界太重，改用填色卡即可分區 | ✅ 已執行 2026-07-16（全站 11 頁 88 處經元件層一次生效）|
| Q15 | 黑夜版 midnight 深色層次＋KPI delta chip | **整體壓暗、維持 r2.1 內凹層次語意（v2 定案）**（Mobbin Whop/Posh/Substack 參照）：暗色 token 改——**content(surface-page/background) `#0C0D0D`＝最深** → 嵌套襯底 `--muted #161718` → **外殼(surface-shell/sidebar) `#1C1D1E`＝明顯亮於 content、包住圓角內凹的 content** → 卡/popover `#212223` → hover `--accent #2A2B2C`；border/input `#2C2D2E`、border-soft `#202122`、sidebar-accent `#262728`、sidebar-active `#303132`。**層次方向＝維持 r2.1 原制**（content 最深、外殼較淺、拉開對比）——v1 一度反轉成殼最深/content 較亮且兩者相近，經使用者回饋改回（v2）。配套：`form-section--outlined` 暗色填色 `--muted`→`--card`（浮在最深 content 上，修訂 Q14 暗色部分）。**KPI delta 升級染色膠囊 chip**（success/destructive 12% tint over `--card`、radius-pill、semibold）——膠囊形狀屬「趨勢指示（data-trend）」新視覺角色的定義，與 Q1「顯示型 badge 用小圓角」的狀態徽章角色區隔，不構成 Q1 例外。亮色 token 全部不動 | 2026-07-17 | 使用者裁示（以總覽為起點、截圖核可；v2 依「content 要最深、外殼別太相近」回饋修正；docs/黑夜版風格探索-midnight.html） | ✅ 已執行 2026-07-17 v2（token＋kpi＋form-section 元件層一次生效；**未跑 bump_ver**，等其他 session 收工統一補） |
| Q20 | 清單列縮圖／圖示晶片：填色無邊框 vs 描邊框 | **全站統一單一標準**：`.product-list__thumb`（orders／pickup）、`.project-list__icon`（projects）、`.data-list__icon`（15 頁儀表板資訊列，含「我的 IP」）三者一律 52×52／`--muted` 底／1px `--border-soft`／icon 色 `--muted-foreground`，對齊 `.product-list__image--placeholder`（e-shop／events）的**真實呈現值**。**沿革**：首版（07-18）誤把對齊對象抓成 `.product-list__image` 的「基礎規則」`--card`／`--border`／52px——但該 class 全站 28 處使用皆搭配 `--placeholder` 變體、基礎規則從未單獨呈現過，畫面上實際是 `--placeholder` 覆蓋後的 `--muted`／`--border-soft`，且首版沒同步改尺寸（仍 44px）。07-20 二次修正把 `.product-list__thumb`／`.project-list__icon` 改對到真實值，並用 Playwright 量測 computed style 逐項核對三頁一致；但 `.data-list__icon` 當時保留成獨立家族（`--card`／`--border`／40×40，理由是與 `.alert--card .alert__icon` 同尺寸家族）。使用者接著指出「我的 IP」仍跟電子商店不同，明確要求一併統一——三度修正取消家族區分，`.data-list__icon` 併入同一組數值（40→52px），15 個消費頁（含密集列表如收入管理）已檢查版面自適應撐開、無破版。反白變體 `.product-list__thumb--cover` 邊框設成與自身填色同色，不露中性描邊 | 2026-07-18（07-20 兩次追加修正，統一為單一標準）| 使用者裁示（三輪截圖指定，最終要求全站單一標準，不分家族）；亦符合 Q3「邊框優先」的既有方向 | ✅ 已執行（元件層一次生效，逐輪 Playwright 量測驗證）|
| Q18 | midnight 精修搬入 r2.1（form-section 浮起／型別磚縮小／上傳圖示晶片） | **套用（僅建立流程，不動全站 `.card`）**：(1) `form-section--outlined` 由純填色卡加「E2 resting 陰影 `--shadow-card` ＋頂緣高光 `--shadow-edge-top`（新增 Foundation token，亮色白底近乎不可見、深底顯上緣光）」＝浮起卡（**修訂 Q14**：仍無 1px 邊框，改由填色＋陰影＋上緣光共同分區）；(2) `.selection-card--icon` 型別磚縮小（icon 晶片 42→36、內 icon 28→24、內距 22→`--sp-14`、gap→`--sp-8`，較 Figma 781-4166 更緊，**修訂 Q13 尺寸部分**）；(3) `.upload-tile--hero` 圖示加圓角晶片框（`--accent` 底＋1px `--border`＋`--radius-lg`）。全站一般 `.card`（Q3 純邊框）與 `.selection-card--icon` 的邊框/橘 outline 標記（Q13）均不動 | 2026-07-17 | 使用者裁示：把 docs/黑夜版風格探索-midnight.html 的區塊浮起感與元件微調搬進正式站，限建立流程、不覆蓋 Q3 全站卡片 | ✅ 已執行 2026-07-17（元件層一次生效；**未跑 bump_ver**，等其他 session 收工統一補）|
| Q19 | midnight 精修搬入 r2.1 batch 2（input 填色／標籤橘框／radio 小點） | **套用**：(1) `.input/.textarea/.select` 底色改用新 token `--input-surface`（亮＝`--card` 白卡靠 border 分界；暗＝`#262729` 比卡 `#212223` 亮一階＝filled 欄位浮出卡面）——全站表單欄位皆生效（暗色最明顯）；(2) tag-input 已選標籤 chip（`.tag-input .chip--active`＝field 內＋建議列已加入的 chip；2026-07-18 由原本只 `.tag-input__field` 放寬到整個 tag-input，讓建議列已加入的白色反白標籤也變橘）改品牌橘外框＋橘字＋淡橘底，不動全站 `.chip--active`（Q8 濾鏡 chip 維持反白黑底＝Q8 scoped 例外）；(3) radio-list 指示器精修——未選 16→13px 細環(1.25px)、已選粗環消失只留 8px 實心橘點（原已選仍留橘環，屬 Q17 元件的狀態精修）；(4) 已選型別卡（`.selection-card--icon.selection-card--active`）除橘 outline 再加淡橘底 `color-mix(--primary 5%, --input-surface)`（2026-07-18，對齊 midnight；icon 維持中性、無勾，修訂 Q13 的已選呈現）；(5) 型別選項卡 `.selection-card--icon` 與上傳投放區 `.upload-tile` 底色改用 `--input-surface`（暗色比 section 卡亮一階＝填色互動面、亮色白卡，2026-07-18，對齊 midnight「選項/投放區比 section 亮一階」；`--input-surface` 用途由「只 input」擴為「input＋型別卡＋上傳」）；另修一個既有 bug：`.select-wrap__icon` 的 `right` 原繞 `--select-icon-inset`（定義在兄弟 `.select` 上、CSS 變數不從兄弟繼承→箭頭跑到框外），改直接用 `--sp-12`（Bug 修，不另記 UI-CHANGES）| 2026-07-17（07-18 追加 tag scope 放寬＋型別卡淡橘底＋填色互動面＋select 箭頭修）| 使用者裁示：對照 midnight 探索頁逐項（截圖指定）——input 要浮出卡面、標籤已選要橘、radio 點要精巧、型別卡已選要橘底 | ✅ 已執行（元件層一次生效；bump 見 UI-CHANGES）|
| Q16 | 卡片/面板級圓角放大 | **卡片級 6→16px（`--radius-xl`）**：card／kpi／preview-card／selection-card／radio-card／readiness／notification-matrix／insight-row／table 容器／picker／album-tracks／upload-tile／alert banner·bar／info-banner／store-settings 卡／scanner／vip-card／彈窗 dialog（payout/embed/leave）＋其內容卡，共約 40 處統一到現有 `--radius-xl`（16px），與 form-section 一致。**維持 6px**：控制項（button/input/badge/segmented/field-pill）、下拉選單浮層（dropdown/header/owner-lookup 用 `--radius-lg` 8px）、tooltip、清單列、icon 底框、縮圖——放大會違反 Q1「形狀＝角色」或造成一堆圓角。不違反 Q2（Q2 裁的是 6 vs 7px 假精度，非禁止大圓角；shell 28/pill 9999 本就不動） | 2026-07-17 | 使用者裁示（midnight 深色大卡配大圓角更柔和、且統一站上原本 form-section 16 vs 一般卡 6 的不一致） | ✅ 已執行 2026-07-17（元件層逐支改、控制項未動；**未跑 bump_ver**，等其他 session 收工統一補） |
| Q21 | 商品明細改版連帶的四個全站視覺尺度（區塊標題字級／區塊副標與欄位說明的色階與字級／KPI 底色／頁寬） | **全站套用，不做單頁特例**：(1) `.form-section__title` 18→14px，與 `.field__label` 同級——區塊標題不再靠字級放大，層級改由卡片邊界承擔；(2) `.form-section__sub` 14→11px 且色階 `--foreground-muted`→`--muted-foreground`，與 `.field__hint` 同級（兩者同為「輔助說明」角色）；(3) `.field__hint` 同步壓暗成 `--muted-foreground`——**此點推翻 2026-07-16 的反向決定**（當時由 `--muted-foreground` 提亮成 `--foreground-muted`，理由是「說明文字在卡背景上要讀得清楚」），本次由使用者裁示改回；(4) `.kpi` 底色 `--card`→`--input-surface`——KPI 常被放進 `form-section` 卡內，兩層同為 `--card` 會糊在一起，改亮一階讓內層方塊浮在卡面上；(5) 頁寬**改為變體、不動全站**（2026-07-20 同日修訂）：`.page` 維持 1280，新增 `.page--narrow`（1056）只給「主欄＋右側常駐 meta 欄」的詳情頁用——原裁決是全站 1280→1056，使用者看過實際結果後改為只有商品明細窄版，其餘頁維持原寬。這是**變體**不是頁面覆寫，仍在 DS 層、有文件與 consumer 清單，不違反鐵律 9。使用者在被明確告知影響範圍（15–28 頁）與「第 3 點會推翻既有決定」後，仍選擇全站統一而非單頁特例 | 2026-07-20 | 使用者裁示；避免同一視覺角色出現兩種答案（鐵律 11），寧可全站一致也不留特例 | ✅ 已執行 2026-07-20（元件層一次生效：form-section.css／field-system.css／kpi.css／shared.css；已用 Playwright 逐頁量測 index／create-product／e-shop／earnings／settings／product-detail，0 水平溢出；頁寬同日修訂為僅 product-detail 用 `.page--narrow` 1056、其餘頁回 1280）|

---

## 待裁決

> **2026-07-13：Q1–Q12 全數裁決完成，見上方「已裁決」表。** 以下保留每題的證據與選項供執行工單參考（動 token/元件時對照）。視覺化圈選版：`docs/風格裁決-視覺化.html`。
>
> **2026-07-13 全數執行完成**（執行狀態欄已標 ✅）。落地時的三個技術決定，記錄在案供日後對照：
>
> - Q2：採「別名合併」——把 `--radius-md` 定義成 `var(--radius)`（同 6px），不改 67 處呼叫點；視覺結果與全量合併相同。
> - Q9：`.filter-tabs__item:hover` 保留 `--muted` 為**例外**（因其 `--active` 也是 muted 灰，hover 若升 accent 會比「已選」還重、倒置層級）。其餘互動 hover 全收斂成 `--accent`。
> - Q6：統一 16px、`.form-section` 不再覆寫；「長建立流程用 24」折衷**未採用**（如日後想恢復呼吸感再加一條 scoped 規則）。
>
> 完整改動清單見 `UI-CHANGES.md`（2026-07-13 條目）。

站台：`Project/ztor-creator-studio/site/r2.1`。以下每題都是「同一件事、站上已存在兩種以上做法」的真實矛盾，逐題圈選 A／B／C 後即可一次落 token 或元件、全站生效。證據一律標「檔案:行號」。

### Q22：收合式 radio-list 的圓角，與 Q16「控制項維持 6px」相衝（2026-07-21 提出，待裁決）

Figma node 856-22782 把上架設定畫成收合式：外框 1px 邊、圓角 18，內部觸發列與選項列的圓角也跟著放大到 18（見展開態 hover 在「立刻上架」那列的角度）。站上既有規則是 Q16——卡片／面板級放大到 16（`--radius-xl`），**控制項（button／input／badge／segmented／field-pill）與清單列維持 6**。radio-list 的列在角色上比較接近「清單列」，照 Q16 應該留 6。

- 證據 A（Figma）：外框與列皆 18，收合式整體讀起來像一張小卡片而非一排控制項。
- 證據 B（Q16 裁決）：`STYLE-DECISIONS.md:29`，控制項與清單列明列為「維持 6px」。
- 現況：`ds-components/radio-list.css` 的 `.radio-list--collapsible` 外框與內部列都取 `--radius-xl`(16)，**暫依 Figma**，標 Q22。

選項：**A** 維持現況（外框與列都 16，把「收合式選擇器」視為卡片級容器，等於為 Q16 開一個具名例外）；**B** 外框 16、內部列回 6（容器是卡片、列還是控制項）；**C** 整組回 6（嚴格守 Q16，與 Figma 有落差）。裁決權在使用者。

### Q17：1-of-N 選擇器的分工（2026-07-17 提出，待裁決）

站上互斥單選（1-of-N）現有三支元件，各自合 token、機械檢查抓不到分岔，但概念上都是「從幾個選項挑一個」：

- **selection-card**（`ds-components/selection-card.css`）：grid 大卡，title＋sub（＋可選 icon／swatch），已選＝橘 outline。用於顯眼的主選擇（商品型別、組合 edition、主題）。證據：`create-auction.html` 種類卡。
- **radio-card**（`ds-components/radio-card.css`）：2-up 並排卡，建在 segmented 上，已選＝橘點。用於表單內二選一（單一/多規格、不限量/限量、取貨方式）。證據：`create-product.html` variant/edition/delivery。
- **radio-list**（`ds-components/radio-list.css`，2026-07-17 新增）：垂直輕量列，radio 點＋標題＋可選描述，已選＝填橘點、無卡框。用於窄欄的資料選擇（上架設定）。證據：三創建頁預覽欄＋兩細節頁。

選項：**A** 維持三支、把「何時用哪支」寫成 design-system.md 的明確分工表（依版面：grid 大卡／2-up 並排／vertical 窄欄）；**B** 收斂成兩支（e.g. 卡式一支＋列式一支）；**C** 全部收斂成單一可配置元件。暫依 **A**（三支分工並存，現行做法），標 Q17；裁決權在使用者。

### 維度 1：圓角尺度

#### Q1　「膠囊型」元件的圓角形狀要不要統一

現況 A（全圓 pill，`--radius-pill` / `9999px`）：
- `ds-components/chip.css:36` `.chip`
- `ds-components/filter-tabs.css` `.filter-tabs__item`、`.filter-tabs__count`
- `ds-components/badge.css:79` `.ztor-dot`

現況 B（小圓角矩形，`--radius` 6px 或 `--radius-md` 7px，**但命名或視覺語意都在暗示「pill」**）：
- `ds-components/field-pill.css:28` `.field-pill`——名稱帶「pill」，實際是 `--radius-md` 矩形，不是全圓
- `ds-components/badge.css:24` `.ztor-metric-pill`——名稱帶「pill」，實際是 `--radius-md` 矩形
- `ds-components/badge.css:44` `.ztor-badge`、`ds-components/badge.css:105` `.badge`（狀態徽章）

選項：
- A　凡是「pill」命名／膠囊A視覺一律全圓（field-pill、metric-pill 改 `--radius-pill`）
- B　徽章類統一維持小圓角矩形，只有 chip／filter-tabs 這種「可點選篩選」用全圓，兩者用形狀區分「可篩選 vs 純顯示」（需要在 design-system.md 明文寫下這條規則，否則新元件還會選錯）
- C　混用有理由，維持現況，僅補文件說明

#### Q2　控制項圓角級距只差 1px，要不要收斂成同一階

現況：token 註解本身就寫了兩階並存（`ds-components/_tokens.css:91-92`：`--radius` 6px 給「primary buttons」、`--radius-md` 7px 給「outline buttons, cards」），但實際套用時同一元件家族內部也在混：
- `ds-components/button.css:26` `.ztor-btn`（primary）＝`--radius`(6px)；`ds-components/button.css:64` `.ztor-btn--outline`＝`--radius-md`(7px)；`ds-components/button.css:121` `.btn`（product-density primary）＝`--radius`；`ds-components/button.css:146` `.btn--outline`＝`--radius-md`；`ds-components/button.css:189` `.btn--icon`＝`--radius`
- `ds-components/input.css:14` `.input/.textarea/.select`＝`--radius`(6px)
- `ds-components/card.css:15` `.ztor-card`、`ds-components/card.css:83` `.card`（實際頁面用的版本）都是`--radius-md`(7px)
- 另外 `ds-components/button.css:204` `.btn--icon-circle` 圓角是寫死 `9999px`，沒有走 `var(--radius-pill)` token

選項：
- A　維持兩階（primary 按鈕/輸入框 6px，outline 按鈕/卡片 7px），只把 `.btn--icon-circle` 的裸值 9999px 改成 `var(--radius-pill)`
- B　全部收斂成同一階（6px 或 7px 擇一），不再分「按鈕用哪階、卡片用哪階」
- C　混用有理由（例如視覺上刻意做細微差異），維持現況並在 design-system.md 明文列出「哪個元件用哪一階」的對照表

### 維度 2：邊界做法

#### Q3　卡片類元件：純陰影 vs 純邊框，要不要統一

現況 A（純陰影，`box-shadow: var(--shadow-card)`，陰影本身內含 1px rim，完全不寫 `border`）：
- `ds-components/card.css:11-16` `.ztor-card`、`ds-components/card.css:81-86` `.card`
- `ds-components/kpi.css:16-23` `.kpi`
- `ds-components/selection-card.css` `.selection-card`

現況 B（純 1px 實線 border，完全不寫 `box-shadow`）：
- `ds-components/preview-card.css:17-22` `.preview-card`
- `ds-components/event-preview-card.css:26-31` `.event-preview-card`

選項：
- A　統一走「純陰影」（preview-card / event-preview-card 補上 `--shadow-card`、拿掉 border）
- B　統一走「純邊框」（card / kpi / selection-card 改成 1px border，拿掉陰影）
- C　混用有理由——例如「主畫面卡片用陰影表達可點擊浮起、建立流程的即時預覽卡刻意做得更平面像實體卡」——維持現況但寫進 design-system.md

#### Q4　控制項／浮層邊界：真 border vs 用陰影模擬 border，要不要統一

現況 A（真 `border: 1px solid var(--border)`）：
- `ds-components/chip.css:35` `.chip`、`ds-components/field-pill.css:27` `.field-pill`
- `ds-components/button.css:63` `.ztor-btn--outline`、`ds-components/button.css:144` `.btn--outline`
- `ds-components/dropdown-menu.css:35` `.dropdown__menu`、`ds-components/embed-modal.css:34` `.embed-modal__sheet`、`ds-components/leave-dialog.css:19` `.leave-dialog__card`

現況 B（`box-shadow: 0 0 0 1px var(--border)` 模擬邊框，不寫 `border`）：
- `ds-components/input.css:15-17` `.input/.textarea/.select`
- `ds-components/badge.css:22-25` `.ztor-metric-pill`
- `ds-components/switch.css:25-27`

**關鍵佐證**：`ds-components/button.css:54-59` 的註解明確記載——outline 按鈕在 2026-06-12 已經**從**「陰影模擬邊框」**改回**「真 border」，理由是「白填色按鈕在白底上近乎隱形（使用者反饋）」。這條理由對 input（同樣白底 `--card` 背景 + 陰影模擬邊框）同樣成立，但 input.css 一直沒跟進改版。

選項：
- A　全面改回真 border（跟按鈕當年的決定一致），input／metric-pill／switch 也改成 `border: 1px solid var(--border)`
- B　維持陰影模擬邊框（理由：陰影版可以疊 focus 環時不跳動、不佔版面尺寸），outline 按鈕才是例外
- C　混用有理由（例如「可獲得焦點的表單控件」統一用陰影版方便疊 focus ring，「純展示/觸發用」pill 用真 border），維持現況並明文化

### 維度 3：陰影語言（hover 浮起規則）

#### Q5　哪些「卡片型／列型」元件在 hover 要浮起（借用 `--shadow-float`），哪些不用

現況 A（有 hover 浮起）：
- `ds-components/card.css:22-25` `.ztor-card--clickable:hover`（transform -2px + `--shadow-card-hover`）
- `ds-components/selection-card.css:50` `.selection-card:hover`（`--shadow-card-hover`）

現況 B（同屬「可點卡片」，但 hover 完全沒有陰影變化，只有列表行用背景色代替，或什麼都沒有）：
- `ds-components/preview-card.css`、`ds-components/event-preview-card.css`：整檔沒有任何 `:hover` 規則
- `ds-components/kpi.css`：`.kpi` 本體沒有 hover 效果，只有內部的 `.kpi__link:hover`（`ds-components/kpi.css:61`）換文字色
- `ds-components/product-list.css:40-42` `.product-list__row:hover`、`ds-components/project-list.css:40-42` `.project-list__row:hover`：都是背景換成 `var(--muted)`，不是陰影浮起

選項：
- A　「可點擊卡片」一律 hover 浮起（借 `--shadow-float`），列表行維持背景色 hover（列表行本來就不该模仿卡片浮起）——需要先定義「什麼算卡片、什麼算列」
- B　只有真正會導覽到別頁的卡片才浮起，純預覽/展示用卡片（preview-card、kpi）不需要 hover 回饋
- C　混用有理由，維持現況並在 design-system.md 逐一標註每個元件的 hover 規則

### 維度 4：密度

#### Q6　表單欄位垂直節奏：`.field` 基礎值 vs `.form-section` 內覆寫值，要不要統一

現況：
- `ds-components/field-system.css:6-7` 基礎 `.field { gap: var(--sp-6); margin-bottom: var(--sp-16); }`（描述↔控件 6px、欄位↔欄位 16px）
- `ds-components/form-section.css:25` `.form-section .field { gap: var(--sp-4); margin-bottom: 26px; }`（描述↔控件 4px、欄位↔欄位 26px）——且 `26px` 是寫死的字面值，不在 `--sp-*` 刻度表內（最近的刻度是 24 或 28）

選項：
- A　建立流程（`.form-section` 作用域）維持比一般表單更緊的描述間距、但欄位↔欄位間距改採 `--sp-24` 或 `--sp-28`（收進刻度表），不再用裸值 26
- B　全站表單欄位垂直節奏收斂成同一組數值，`.form-section` 不再局部覆寫
- C　混用有理由（建立流程需要更寬鬆的段落感、一般表單需要更緊湊），維持現況，但把 26px 換成刻度內最近值

#### Q7　卡片類元件的內距（padding）沒有統一的級距表

現況（同屬「卡片/資訊磚」但內距各自為政）：
- `ds-components/kpi.css:20` `.kpi` → `var(--sp-16) var(--sp-18)`（16/18）
- `ds-components/card.css:85` `.card`（實際頁面用的版本）→ `var(--sp-20)`（20，四邊等值）
- `ds-components/card.css:11` `.ztor-card`（design-system 文件示範用，頁面不直接用）→ `var(--sp-24)`（24，四邊等值）
- `ds-components/selection-card.css:38` `.selection-card` → `var(--sp-14) var(--sp-16)`（14/16）
- `ds-components/empty-card.css:24` `.empty-card` → `var(--sp-32) var(--sp-24)`（32/24）

選項：
- A　定一組「卡片內距級距表」（例如 sm=16、md=20、lg=24），上述元件對號入座
- B　維持各自的內距（理由：KPI 磚要緊湊、empty-card 要留白突出插畫感），但把現況整理成一張對照表寫進 design-system.md，避免未來新卡片再隨機挑數字
- C　全部統一成單一內距值

### 維度 5：品牌橘使用範圍

#### Q8　「已選中/active」狀態要不要一律用品牌橘標示

現況 A（active 用品牌橘）：
- `ds-components/tabs.css:39-42` `.tabs__item--active`（橘色底線）；`ds-components/tabs.css:76` `.tabs--brand .tabs__item--active`（橘色調底）；`ds-components/tabs.css:97` `.tabs--underline-short .tabs__item--active`（橘色短底線）
- `ds-components/settings.css:31-35` `.settings-nav__item--active`（品牌橘 18% 底 tint）
- `ds-components/selection-card.css` `.selection-card--active`（橘色 outline 線框）
- `ds-components/radio-card.css` 已選態（橘色 outline）

現況 B（同樣是「導覽列表/切換控制的已選項」，但用中性黑或灰，完全不用橘色）：
- `shared.css:154` `.app-sidebar__link--active`、`shared.css:188` `.app-sidebar__sub-link[aria-current="page"]` → `background: var(--sidebar-active)`（中性灰 `#ECECEC`，不是橘）
- `ds-components/chip.css:44-48` `.chip--active` → 反白成 `var(--foreground)`（黑底白字），不是橘
- `ds-components/segmented.css:41-47` `.segmented__btn--active` → 白色浮起 pill + 中性邊框，不是橘
- `ds-components/filter-tabs.css` 預設 `.filter-tabs__item--active` → 灰底（`var(--muted)`），只有加 `.filter-tabs--brand` 修飾類才會變橘（頁面各自決定要不要加）

值得注意：**同樣是「側邊導覽列表的已選項」，全站主 `.app-sidebar`（左側大導覽）用中性灰，但 Settings 頁自己的次層導覽 `.settings-nav`（`ds-components/settings.css:31`）卻用品牌橘**——同一種元件角色（左側可捲動的頁內導覽列表）两处给了不同答案。

選項：
- A　「已選中」狀態全站統一用品牌橘（sidebar-active、chip--active、segmented--active 都改橘）
- B　橘色只保留給「主要操作／主要分類」（Tabs、選擇卡的已選），導覽列表／篩選類的已選一律中性色（`.settings-nav--active` 改回中性灰，向 `.app-sidebar` 看齊）
- C　混用有理由（例如「橘色只用在會直接影響資料的操作上，導覽本身不用橘避免與 CTA 搶視覺」），維持現況並在 design-system.md 寫清楚這條分野規則，`.filter-tabs--brand` 這種「選用变体」也要註明哪些頁該用

### 維度 6：灰階層次

#### Q9　「hover 底色」該用哪一個灰階 token

現況：`--muted`(`#FAFAFA`)、`--accent`(`#F3F3F3`)、`--secondary`(`#F4F4F4`) 三個十分接近的近白灰階同時存在（`ds-components/_tokens.css:33-37`），但實際 hover 底色沒有統一套用同一個：
- 多數 hover 用 `var(--muted)`：如 `ds-components/button.css:148` `.btn--outline:hover`、`ds-components/chip.css:42` `.chip:hover`、`shared.css:249` `.app-notif__item:hover`
- 少數 hover 用 `var(--accent)`：`shared.css:152/187/202`（`.app-sidebar__link/__sub-link/__action:hover`）、`ds-components/switch.css:25`、`ds-components/amount-field.css:38`
- 另有元件不用上述兩者、改用即席算出的灰：`ds-components/settings.css:27-29` `.settings-nav__item:hover` 用 `color-mix(in srgb, var(--foreground) 4%, transparent)`；`ds-components/button.css:155` `.btn--ghost:hover` 用 `color-mix(in srgb, var(--foreground) 6%, transparent)`
- `--secondary` 目前**全站零使用**（`ds-components/*.css`、`shared.css`、`*.html` 皆搜不到 `var(--secondary)`），是已定義但未落地的 token

選項：
- A　hover 底色統一用 `--muted`，`--accent` 只保留給「選單項目/導覽 hover」這種更明確的語意角色（sidebar 系列維持用 accent），其餘 `color-mix` 即席寫法都改成引用固定 token
- B　三個 token 語意本來就不同（muted=次級底、accent=互動 hover、secondary=次要按鈕底），維持分工，但要把 `--secondary` 找到實際用途或退役，並把散落的 `color-mix(...)` 即席寫法收斂成引用 `--accent`
- C　直接退役掉其中一個 token（例如 `--secondary`），只留兩階

### 維度 7：icon

#### Q10　「關閉/收合(X)」類功能性小 icon 尺寸沒有統一

現況（同屬「浮層右上角關閉鍵」角色，三種尺寸並存）：
- `ds-components/alert.css:95` `.alert--card .alert__close .ztor-icon` → 20×20px
- `ds-components/leave-dialog.css:29` `.leave-dialog__close .ztor-icon` → 18×18px
- `ds-components/embed-modal.css:72` `.embed-modal__close .ztor-icon` → 16×16px

（基礎 icon 尺度本身有定義：`ds-components/icon.css` 預設 `.ztor-icon` 16px、`.ztor-icon--sm` 14px；但各元件大量各自覆寫成 11–44px 不等，多數是因應圖示型 icon〔如 34/44px 的媒體佔位圖示〕或極小的行內裝飾〔11px 移除鍵〕，屬合理依情境縮放，不算衝突——只有「關閉鍵」這個重複出現的同角色給了三種答案，值得出題。）

選項：
- A　收斂成 1 種（例如都用 18px，介於現有三值中間）
- B　依浮層尺寸分兩階（大型浮層/alert 用 20px，小型 modal/dialog 用 16px），寫進 design-system.md 的對照表
- C　混用有理由，維持現況

### 維度 8：狀態色語意

#### Q11　「已付款 Paid」狀態在不同頁用了不同顏色

現況：同一個「訂單已付款」語意，在收益頁用綠色（success），在訂單頁用灰色（neutral）：
- `earnings.html:382 / 406 / 810 / 823 / 849` → `class="badge badge--success"` 顯示 `Paid`
- `orders.html:109 / 121 / 145` → `class="badge badge--neutral"` 顯示 `Paid`（`data-i18n="orders.pay.paid"`）
- `order-detail.html:57` → `class="badge badge--neutral"` 顯示 `Paid`（`data-i18n="od.badge.paid"`）

（對照組：`Shipped`/已出貨 在 `orders.html:133/145` 都一致用 `badge--neutral`，沒有分歧；`Sold Out`/售罄 在 `e-shop.html:471` 有明確註解記載「刻意用 neutral 灰、與 Low Stock 的紅區隔」，屬已決策、不必出題。「Paid」是目前唯一發現的顏色分歧。）

選項：
- A　「已付款」全站統一用綠色 success（訂單頁的 `orders.pay.paid`、`od.badge.paid` 改成 `badge--success`）
- B　全站統一用中性灰 neutral（收益頁的 `Paid` 改回 `badge--neutral`），因為 orders.html 用 `status-axes` 把「物流狀態」和「付款狀態」分兩軸並列，付款軸本來就刻意做得比物流軸安靜，避免視覺過重
- C　混用有理由（收益頁的 Paid 是「這筆錢已入帳」的正向強調，訂單頁的 Paid 只是眾多資訊軸之一、要安靜），維持現況並明文化這條分野

### 維度 9：字級與字重（label 樣式）

#### Q12　欄位/列標籤：大寫小標 vs 一般 label，同頁同角色卻給了不同答案

現況：`tier-settings.html` 同一頁面內，「欄位名稱標籤」這個角色出現兩種樣式：
- `tier-settings.html:44-51`（頁內 `<style>` 自訂的 `.gate-field__label`）→ 12px、**大寫（`text-transform: uppercase`）**、字距 0.3px，用在「Reputation gate」「Spend gate」「Early access (days)」「Merch discount (%)」等欄位名稱
- `ds-components/settings.css:67-71`（DS 元件 `.settings-row__label`）→ 13px、**一般大小寫**、無字距特調，用在同頁的「Purchases」「Event check-ins」「Dual-gate upgrade」「Versioned, non-retroactive」等列標籤

兩者都是「說明這一列/這一欄是什麼」的標籤角色，只因為 Gates／Benefits 區塊用了頁面自訂 class、Multipliers／Rules 區塊用了 DS 元件，就長得不一樣。

（對照組：站上其他「小型全大寫標籤」——`ds-components/kpi.css:26-30` `.kpi__label`、`shared.css:1012` `.meta-cell__label`、`shared.css:1081` `.insight-eyebrow`、`ds-components/status-axes.css:34-38`、`ds-components/progress-stepper.css:40-44`——彼此字級/字距高度一致〔11-12px、大寫、0.4px 上下字距〕，屬於已經一致的「頁面級小標」系統，`tier-settings.html` 的 `.gate-field__label` 其實是這套系統的又一次重複發明，只是恰好和它同頁的 `.settings-row__label` 不是同一套。）

選項：
- A　`tier-settings.html` 的 `.gate-field__label` 退役，改用 `.settings-row__label`（一般大小寫），欄位名稱樣式跟頁面其他列標籤一致
- B　`.settings-row__label` 也改成大寫小標風格，向站上已經一致的那套「大寫小標系統」看齊，`.gate-field__label` 直接 promote 成 DS 元件供其他頁引用
- C　兩種角色其實不同（`.gate-field__label` 是「單一數字輸入框正上方的緊湊說明」，`.settings-row__label` 是「一整列的標題」），維持現況但把 `.gate-field__label` promote 進 `ds-components/`（目前是頁內孤例，不符合「可重用樣式要 promote」的專案規則）

### 已一致：不出題的部分

- **狀態色的「售罄 vs 低庫存」**：`e-shop.html:471` 已有明確設計決策註解，售罄故意用中性灰、低庫存用紅，不衝突。
- **「已出貨 Shipped」的顏色**：`orders.html` 全站一致用 `badge--neutral`。
- **頁面級小型全大寫標籤系統**（kpi__label / meta-cell__label / insight-eyebrow / status-axes / progress-stepper__label）：字級（11-12px）、字距（約 0.4px 或 .04-.05em）、大寫處理彼此一致，是目前少數已經成熟的子系統（唯一的例外已寫進 Q12）。
- **Icon 基礎尺度**（`ds-components/icon.css`：預設 16px、`--sm` 14px）本身定義清楚；元件各自覆寫到 11–44px 多數對應到「裝飾用大圖示」或「行內極小裝飾」等不同情境，屬合理縮放，只有「關閉鍵」这个重複角色值得出題（見 Q10）。

### 暗色版落差清單

使用者自述「黑夜版比白天少微調」，以下是逐一核對 `ds-components/_tokens.css` 亮／暗兩區塊後，亮色有調、暗色沒跟著調或明顯只是複製貼上的落差，供日後校正（非單選題）：

> **2026-07-13 更新（taste 體檢後使用者指示校準暗色）**：下列 **1（--gradient-brand）、2（--overlay-tint）、3（綠色方向）已處理**——暗色綠 `#00A63E→#4ADE80` 提亮、補暗色 `--overlay-tint: rgba(0,0,0,.6)` 與 `--gradient-brand`（去掉淡膚起點）。4、5 屬刻意/已確認非疏漏，不動。詳見 UI-CHANGES.md 2026-07-13「風格微調」條目。

1. **`--gradient-brand`**（`_tokens.css:81`，進度條品牌漸層 `linear-gradient(90deg, #ffd9a0 0%, #ffa33f 55%, #ff7a4d 100%)`）——暗色區塊（`_tokens.css:390-490`）完全沒有覆寫。漸層起點 `#ffd9a0` 是淺膚橘色，直接套在深色 `#191A1A` 畫布上是否還讀得出漸層層次，沒有被檢視過。
2. **`--overlay-tint`**（`_tokens.css:198`，浮層背後的黑色遮罩 `rgba(0, 0, 0, 0.45)`）——暗色區塊沒有覆寫，黑底上再疊一層 45% 黑遮罩，和淺色模式「白底上疊黑遮罩」的視覺效果不對等，暗色模式的遮罩存在感會弱很多，可能需要改用更淺的遮罩色或调整 alpha。
3. **`--status-success` / `--chart-3`（綠色）方向不一致**——其餘品牌色從亮到暗都是「變亮」以維持深底對比（`--chart-2` 藍 `#266DF0→#5896F3`、`--chart-5`/`--status-accent` 紫 `#8B5CF6→#A78BFA`），唯獨綠色是「變暗」（`#22C55E→#00A63E`，`_tokens.css:57` vs `:426`／`:84` vs `:451`），與其他狀態色的調色方向相反，較可能是沿用亮色模式數值時漏調、而非刻意設計。
4. **`--ring`／`--border-inverse`**：這兩個亮暗同值是刻意決定（`_tokens.css:52`、`:421` 均有註解說明），不是落差，僅記錄以免誤判。
5. **`--destructive`**：亮 `#DA314A` → 暗 `#E7000B`（`_tokens.css:46` vs `:415`）——两值明显不同，屬已調整，附註以確認非疏漏。

---

## 裁決流程

1. 發現矛盾 → 記入本檔「待裁決」，附證據檔:行號、A/B/C 選項。
2. 使用者裁決 → 選定選項。
3. 移入「已裁決」表：填編號、角色/題目、裁決、日期、理由、執行狀態（初始為「待執行」）。
4. 執行 → 全庫同步實作（依裁決結果改 CSS/元件/token），並在 `UI-CHANGES.md` 記錄；執行完成後把「已裁決」表的執行狀態更新為「已執行」。
5. 巡檢時盤點「已裁決」表的執行狀態，找出裁決後仍停留在「待執行」的項目，追蹤補做。
