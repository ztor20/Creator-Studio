# r2.1 風格裁決紀錄

同一視覺角色站上只能有一個答案。本檔記錄呈現層的風格裁決：已裁決條目是法律，動 UI 前先查；發現站上同一件事有兩種做法時，記入待裁決（附證據檔:行號），暫依最新確認的做法並標註題號，不得默默新增第三種。裁決權在使用者；裁決後要開執行工單全庫同步，並在 UI-CHANGES.md 記錄。

---

## 已裁決

| 編號 | 角色/題目 | 裁決 | 日期 | 理由 | 執行狀態 |
|---|---|---|---|---|---|
| Q1 | 膠囊型元件圓角形狀 | **B**：可篩選/可點＝全圓（chip、filter-tabs），純顯示徽章＝小圓角矩形（badge、field-pill、metric-pill）。形狀＝「可否互動」的線索，須寫進 design-system.md | 2026-07-13 | 形狀當 affordance 比全統一更有資訊量 | ✅ 已執行 2026-07-13 |
| Q2 | 控制項圓角級距（6 vs 7px） | **統一 6px**：`--radius`/`--radius-md` 合併成 6px；`.btn--icon-circle` 裸值 9999 改 `--radius-pill`。全圓 pill(9999)、shell(28) 不動 | 2026-07-13 | 1px 是假精度 | ✅ 已執行 2026-07-13 |
| Q3 | 卡片邊界：陰影 vs 邊框 | **C（規則版）**：預設卡片用 1px 純邊框（平、乾淨）；只有要強調可點/浮起的主卡才升級純陰影〔**`.card`／`.kpi` 這兩支已被 Q32（2026-07-26）取代，改陰影浮起；`.ztor-card`（docs-only）與其餘控制項/清單類 1px 邊框角色不受影響，仍照本條**〕 | 2026-07-13 | 邊框優先＝editorial，陰影收窄成「強調」訊號 | ✅ 已執行 2026-07-13（部分被 Q32 取代）|
| Q4 | 控制項邊界：真 border vs 陰影模擬 | **A**：input／textarea／select／switch／metric-pill 全改 `border:1px solid var(--border)`，跟 2026-06-12 按鈕決定一致〔**Q33（2026-07-26）加條件**：僅疊在卡片／section 內的控件仍照本條；不在卡片內、直接坐頁面或工具列上的控件改無邊框（首例 `.select--bare`）〕 | 2026-07-13 | 白底上真 border 較清楚；與 Q3 一致 | ✅ 已執行 2026-07-13（部分情境已被 Q33 加註條件）|
| Q5 | hover 浮起規則 | **A**：可點卡片 hover 浮起（借 `--shadow-float`），清單列 hover 只換底色。先在 design-system.md 定義「什麼算卡片、什麼算列」〔**scoped 例外**：`.product-list--ip`（2026-07-20）與 `.product-list--eshop`（含共用其 class 的 `--bundles`／`--auctions` 兩分頁，2026-07-21 使用者再次指定擴大）的 `.product-list__row:hover` 改浮起（`--card` 底＋`--radius-md`＋`--shadow-float`，比照 `.is-dragging` 拖曳抬起態），使用者兩次都明確指定「hover 要跟 drag 的 style 一樣」——僅這幾個變體，`--orders`／`--pickup` 清單列仍維持 A 原規則（只換底色）〕〔**2026-07-26 由 Q34 取代**：清單列 hover 全站統一成浮起版，本條「清單列只換底色」不再是 base 規則，「什麼算卡片、什麼算列」的區分問題本身也隨之解消（列現在也浮起）〕 | 2026-07-13（07-20 加 `--ip` 例外，07-21 擴大到 `--eshop`）| 卡片＝浮起、列＝換底的標準區分 | ✅ 已執行 2026-07-13（`--ip` 例外 07-20、`--eshop` 擴大 07-21 皆使用者裁示；base 規則已被 Q34 取代）|
| Q6 | 表單欄位垂直節奏 | **以 .field 為準**（欄位間距 16px、form-section 不再局部覆寫）。折衷選項：長建立流程「欄位↔欄位」改用刻度值 24 保留呼吸感——此折衷待使用者最終確認 | 2026-07-13 | 統一節奏；26 裸值退場 | ✅ 已執行 2026-07-13（統一 16px；「長流程 24」折衷未採用，日後需要可加 `.form-section .field{margin-bottom:var(--sp-24)}`）|
| Q7 | 卡片內距級距 | **B**：保留各自內距（KPI 緊/空狀態留白），整理成一張對照表寫進 design-system.md；未來要正式分 sm/md/lg 再升 A | 2026-07-13 | 不同功能密度不該壓成單一值 | ✅ 已執行 2026-07-13 |
| Q8 | 品牌橘使用範圍 | ~~**B**（2026-07-13）：橘只給主操作/主分類，導覽/篩選已選一律中性灰~~ → **2026-07-27 使用者裁決反轉為 A：「已選中」狀態全站一律用品牌橘。** 一套配方三種形態，橘永遠在場、只是強度隨控件份量調整：**tint**＝安靜的持續選取（`.app-sidebar__link`／`.app-sidebar__sub-link`／`.settings-nav__item`／`.filter-tabs__item`／`.chip`）→ 吃新增的 `--selected-surface`／`--selected-surface-hover`／`--selected-ink`；**underline**＝主要檢視切換（`.tabs`）→ 維持橘底線不變；**solid**＝離散且已提交的選擇（`.pager` 目前頁／主 CTA）→ 維持實色橘不變。`.segmented__btn--active`／`.segmented__item--active` 只換字色、保留白色浮起 pill（浮起是該元件的結構語彙，染底會把「被抬起」讀成「被塗色」）。**橘一定在場、但不一定在文字上**：`.radio-card` 的橘落在右上標記點與 icon，標題維持 `--foreground`（卡片有標題＋副標，整段染橘等於在讀橘色內文）——`.radio-cards .segmented__btn` 的 `color` 覆寫是刻意保留、已加註解。`.filter-tabs--source` 不受本條管轄（每項取自己資料序列的顏色，色彩＝該筆資料本身，非選取記號）。**a11y 硬需求**：`--selected-ink` 必須亮暗分色——`#ffa33f` 對近白底只有 1.92:1，亮色版壓深成 `#8F4E00`（同色相 32°；對 `--sidebar` 6.23:1、對 14% 橘 tint 5.70:1，皆過 WCAG AA）；深色版維持 `#ffa33f`（8.49:1／6.44:1）。**連帶刪除的重複規則**：`.filter-tabs--brand` 的四條顏色覆寫（橘變基底後全數重複，只留「計數不加泡泡」）、`tag-input.css` 的 `.chip--active` 橘色覆寫（Q19 的意圖由基底承接，並順帶修掉它原本 `color: var(--primary)` 在亮色模式 1.92:1 的對比 bug） **2026-07-27 同日擴充**：使用者圈選儀表板「總收入」KPI 卡裁示「這是本頁最重要的數據，用橘色 accent」，並在確認時指明是**卡片底色、不是字**。因此 `.kpi--hero` ＝ 整張卡實色 `--primary`。與「已選中」的分辨改靠**填底濃度＋尺度**而非色相：**實色＝主角**（主 CTA／`.pager` 目前頁／`.kpi--hero` 整張卡）、**tint 半透明＝已選中**（且只長在 pill／nav item 這種小控件上）——不會有人把一整張實色橘的卡讀成「這張卡被我點選了」。兩條墨水規則同時成立：橘**當字**（底非橘）走 `--brand-ink`（light `#8F4E00`／dark `#ffa33f`，`--selected-ink` 為其語意別名），**不得** `var(--primary)`（白底 1.92:1）；字**鋪在實色橘上**走新增的 `--on-primary`（`#171717` 亮暗同值，9.02:1），**不得** `--primary-foreground`（亮色白字，對橘僅 1.99:1）。`.kpi--hero` 內 `.kpi__delta` **保留原本的半透明染色膠囊**（使用者裁示：綠色半透明設計要留、只是不要黑底），改動只在**墨色**。根因：tint 原本混的是 `--card`，把深卡色烤進膠囊底色裡，所以在橘卡上變黑斑——改成混 `transparent` 後膠囊會跟著它實際坐的面走，黑斑消失（對深卡是數學上的 no-op，實測仍 7.06:1）。但 12% 淡染疊在飽和橘上色相幾乎不位移（合成 `#e9aa47` vs 卡的 `#ffa33f`），綠撐不起來、白底亮綠字也只剩 1.17:1。最終版（使用者提案）＝**深綠半透明底＋白字**：形狀語彙完全不動（同樣 pill／內距／仍是半透明染色），只改染多深與字色，讓「綠」由**底本身**承載而不是靠墨色暗示。保留 90% 而非 100%，橘透 10% 上來把綠暖化，像長在卡上而不是貼上去——這也是它與被否決的「純黑底」的本質差異：那是中性黑（讀作黑斑），這是**有色相的深綠**（一眼還是綠的）。實作把 fill 與 ink 成對抽成 token（`--status-success-fill`／`-ink`／`--destructive-fill`／`-ink`＋深階 `--status-success-deep`／`--destructive-deep`），由 `.kpi--hero` 在卡片這層整組重新定義、靠繼承生效；**墨色跟著「坐在什麼面上」走、不跟著主題走**（實色橘卡在深色主題下依然是亮底，主題型 token 解不了）。同日試過並退場：純黑底／白色薄膜／完全不要底／深綠字配淡染底。連帶修掉兩個既有缺陷：亮色主題下 delta 綠字只有 **2.05:1**（全站，非本次新增）、深色主題下 `--neg` 紅字只有 **3.19:1**（紅墨當初漏接 2026-07-21 為此新增的 `--status-error`）。八種組合（hero／一般 × 正／負 × 亮／暗）實測全數 ≥4.5:1 | 2026-07-13 → **2026-07-27 反轉＋擴充** | 使用者截圖圈出側欄已選項，裁示「highlighted features must use our accent color across all pages or tabs」。原 B 的顧慮（橘與 CTA 搶視覺）由「導覽/篩選只用 tint、實色橘保留給 CTA 與 solid 形態」化解，One Spotlight Rule 仍成立 | ✅ 已執行 2026-07-27（`_tokens.css` 新增 3 token×2 主題；`shared.css`／`settings.css`／`filter-tabs.css`／`chip.css`／`segmented.css`／`chart.css`／`header.css` 元件層一次生效；`tag-input.css`／`filter-tabs.css` 重複規則移除；36 頁掃描零回歸）|
| Q9 | hover 底色灰階 | **--accent（#F3F3F3）**：互動 hover 統一用 accent；`--muted` 留給斑馬紋/次級襯底；散落的 `color-mix(...)` 即席灰收斂成 accent；**`--secondary` 退役**〔**`.product-list__row:hover` 的 `--accent` 換底已被 Q34（2026-07-26）取代成浮起版，本條對其餘互動 hover（按鈕、選單項、清單列以外的元件）仍有效**〕 | 2026-07-13 | hover 要被看見，muted 太淡 | ✅ 已執行 2026-07-13（清單列 hover 部分已被 Q34 取代）|
| Q10 | 關閉鍵 icon 尺寸 | **16px**：拿掉 alert(20)／dialog(18) 覆寫，全部關閉鍵回到基礎 16 | 2026-07-13 | 對齊基礎 `.ztor-icon` 尺度 | ✅ 已執行 2026-07-13 |
| Q11 | 「已付款 Paid」顏色 | **A**：全站綠色 success（`orders.pay.paid`、`od.badge.paid` 改 `badge--success`）。備註：若之後覺訂單列視覺過重可退 B | 2026-07-13 | 一語意一色、綠色 Paid 直覺 | ✅ 已執行 2026-07-13 |
| Q12 | 欄位標籤：大寫 vs 一般 | **A**：`tier-settings.html` 的 `.gate-field__label`（大寫孤例）退役，改用 `.settings-row__label`（一般大小寫） | 2026-07-13 | 大寫孤例是站上小標系統的重複發明 | ✅ 已執行 2026-07-13 |
| Q13 | 建立流程選擇卡邊界／`form-section--outlined` 外框 | **邊框化**：`.selection-card--icon`（型別卡，卡距 8）與 `.radio-cards`（不限量/限量等二選一卡，卡距 12）由陰影改 1px 純邊框 `--border`、扁平無陰影（更貼 Q3 扁平預設，base `.selection-card` 其他用途維持陰影）。radio 標記精修（Figma node 781-4386）：已選卡無橘外框（只留灰邊框）、標記為置中小橘實心點無外圈、未選無可見標記。`.form-section--outlined` 外框全站改圓角 `--radius-xl`(16)／內距 `--sp-16`（原 6／32）〔**邊框部分已被 Q14 取代**〕〔**icon 磚尺寸已被 Q18 縮小**〕〔**已選型別卡已被 Q19 加淡橘底（outline 仍在、仍無勾）**〕 | 2026-07-16 | 使用者指定對齊 Figma node 781-4166 | ✅ 已執行 2026-07-16 |
| Q14 | `form-section--outlined` 是否保留 1px 外框 | **去外框、保留填色卡**：`.form-section--outlined` 移除 `border`（原 1px `--border`），保留背景填色（亮 `--card`／暗 `--muted`）、圓角 `--radius-xl`(16)、內距 `--sp-16`；靠填色對比區分區塊，不再有邊界線。**取代 Q13 對本元件的「邊框化」部分**（Q13 的 selection-card／radio-cards 邊框不受影響）。實作用 `.form-section.form-section--outlined`（權重 0,2,0）蓋掉 `.form-section + .form-section` 分隔線，確保四邊無殘留〔**暗色填色已被 Q15 midnight 改為 `--card`**〕〔**Q18 再加 E2 陰影＋頂緣高光＝浮起卡，仍無邊框**〕 | 2026-07-16 | 使用者裁示：outlined 卡的硬邊界太重，改用填色卡即可分區 | ✅ 已執行 2026-07-16（全站 11 頁 88 處經元件層一次生效）|
| Q15 | 黑夜版 midnight 深色層次＋KPI delta chip | **整體壓暗、維持 r2.1 內凹層次語意（v2 定案）**（Mobbin Whop/Posh/Substack 參照）：暗色 token 改——**content(surface-page/background) `#0C0D0D`＝最深** → 嵌套襯底 `--muted #161718` → **外殼(surface-shell/sidebar) `#1C1D1E`＝明顯亮於 content、包住圓角內凹的 content** → 卡/popover `#212223` → hover `--accent #2A2B2C`；border/input `#2C2D2E`、border-soft `#202122`、sidebar-accent `#262728`、sidebar-active `#303132`。**層次方向＝維持 r2.1 原制**（content 最深、外殼較淺、拉開對比）——v1 一度反轉成殼最深/content 較亮且兩者相近，經使用者回饋改回（v2）。配套：`form-section--outlined` 暗色填色 `--muted`→`--card`（浮在最深 content 上，修訂 Q14 暗色部分）。**KPI delta 升級染色膠囊 chip**（success/destructive 12% tint over `--card`、radius-pill、semibold）——膠囊形狀屬「趨勢指示（data-trend）」新視覺角色的定義，與 Q1「顯示型 badge 用小圓角」的狀態徽章角色區隔，不構成 Q1 例外。亮色 token 全部不動 | 2026-07-17 | 使用者裁示（以總覽為起點、截圖核可；v2 依「content 要最深、外殼別太相近」回饋修正；docs/黑夜版風格探索-midnight.html） | ✅ 已執行 2026-07-17 v2（token＋kpi＋form-section 元件層一次生效；**未跑 bump_ver**，等其他 session 收工統一補） |
| Q20 | 清單列縮圖／圖示晶片：填色無邊框 vs 描邊框 | **全站統一單一標準**：`.product-list__thumb`（orders／pickup）、`.project-list__icon`（projects）、`.data-list__icon`（15 頁儀表板資訊列，含「我的 IP」）三者一律 52×52／`--muted` 底／1px `--border-soft`／icon 色 `--muted-foreground`，對齊 `.product-list__image--placeholder`（e-shop／events）的**真實呈現值**。**沿革**：首版（07-18）誤把對齊對象抓成 `.product-list__image` 的「基礎規則」`--card`／`--border`／52px——但該 class 全站 28 處使用皆搭配 `--placeholder` 變體、基礎規則從未單獨呈現過，畫面上實際是 `--placeholder` 覆蓋後的 `--muted`／`--border-soft`，且首版沒同步改尺寸（仍 44px）。07-20 二次修正把 `.product-list__thumb`／`.project-list__icon` 改對到真實值，並用 Playwright 量測 computed style 逐項核對三頁一致；但 `.data-list__icon` 當時保留成獨立家族（`--card`／`--border`／40×40，理由是與 `.alert--card .alert__icon` 同尺寸家族）。使用者接著指出「我的 IP」仍跟電子商店不同，明確要求一併統一——三度修正取消家族區分，`.data-list__icon` 併入同一組數值（40→52px），15 個消費頁（含密集列表如收入管理）已檢查版面自適應撐開、無破版。反白變體 `.product-list__thumb--cover` 邊框設成與自身填色同色，不露中性描邊。〔**2026-07-23 訂單清單移除縮圖欄**：訂單清單 `orders.html` 一度改用真實商品照 `.product-list__image`，同日使用者再裁示「訂單管理列表不需要商品圖片」，整欄移除——訂單列現在**沒有任何縮圖**（不屬 thumb 也不屬 image 家族）。本條的 icon chip 標準仍規範 `--pickup`／projects／data-list；訂單清單不再是本條的 consumer〕 | 2026-07-18（07-20 兩次追加修正，統一為單一標準；07-23 訂單清單先改真實照、同日再裁示移除整個縮圖欄）| 使用者裁示（三輪截圖指定，最終要求全站單一標準，不分家族）；亦符合 Q3「邊框優先」的既有方向 | ✅ 已執行（元件層一次生效，逐輪 Playwright 量測驗證）|
| Q18 | midnight 精修搬入 r2.1（form-section 浮起／型別磚縮小／上傳圖示晶片） | **套用（僅建立流程，不動全站 `.card`）**：(1) `form-section--outlined` 由純填色卡加「E2 resting 陰影 `--shadow-card` ＋頂緣高光 `--shadow-edge-top`（新增 Foundation token，亮色白底近乎不可見、深底顯上緣光）」＝浮起卡（**修訂 Q14**：仍無 1px 邊框，改由填色＋陰影＋上緣光共同分區）；(2) `.selection-card--icon` 型別磚縮小（icon 晶片 42→36、內 icon 28→24、內距 22→`--sp-14`、gap→`--sp-8`，較 Figma 781-4166 更緊，**修訂 Q13 尺寸部分**）；(3) `.upload-tile--hero` 圖示加圓角晶片框（`--accent` 底＋1px `--border`＋`--radius-lg`）。全站一般 `.card`（Q3 純邊框）與 `.selection-card--icon` 的邊框/橘 outline 標記（Q13）均不動 | 2026-07-17 | 使用者裁示：把 docs/黑夜版風格探索-midnight.html 的區塊浮起感與元件微調搬進正式站，限建立流程、不覆蓋 Q3 全站卡片 | ✅ 已執行 2026-07-17（元件層一次生效；**未跑 bump_ver**，等其他 session 收工統一補）|
| Q19 | midnight 精修搬入 r2.1 batch 2（input 填色／標籤橘框／radio 小點） | **套用**：(1) `.input/.textarea/.select` 底色改用新 token `--input-surface`（亮＝`--card` 白卡靠 border 分界；暗＝`#262729` 比卡 `#212223` 亮一階＝filled 欄位浮出卡面）——全站表單欄位皆生效（暗色最明顯）；(2) tag-input 已選標籤 chip（`.tag-input .chip--active`＝field 內＋建議列已加入的 chip；2026-07-18 由原本只 `.tag-input__field` 放寬到整個 tag-input，讓建議列已加入的白色反白標籤也變橘）改品牌橘外框＋橘字＋淡橘底，不動全站 `.chip--active`（Q8 濾鏡 chip 維持反白黑底＝Q8 scoped 例外）；(3) radio-list 指示器精修——未選 16→13px 細環(1.25px)、已選粗環消失只留 8px 實心橘點（原已選仍留橘環，屬 Q17 元件的狀態精修）；(4) 已選型別卡（`.selection-card--icon.selection-card--active`）除橘 outline 再加淡橘底 `color-mix(--primary 5%, --input-surface)`（2026-07-18，對齊 midnight；icon 維持中性、無勾，修訂 Q13 的已選呈現）；(5) 型別選項卡 `.selection-card--icon` 與上傳投放區 `.upload-tile` 底色改用 `--input-surface`（暗色比 section 卡亮一階＝填色互動面、亮色白卡，2026-07-18，對齊 midnight「選項/投放區比 section 亮一階」；`--input-surface` 用途由「只 input」擴為「input＋型別卡＋上傳」）；另修一個既有 bug：`.select-wrap__icon` 的 `right` 原繞 `--select-icon-inset`（定義在兄弟 `.select` 上、CSS 變數不從兄弟繼承→箭頭跑到框外），改直接用 `--sp-12`（Bug 修，不另記 UI-CHANGES）| 2026-07-17（07-18 追加 tag scope 放寬＋型別卡淡橘底＋填色互動面＋select 箭頭修）| 使用者裁示：對照 midnight 探索頁逐項（截圖指定）——input 要浮出卡面、標籤已選要橘、radio 點要精巧、型別卡已選要橘底 | ✅ 已執行（元件層一次生效；bump 見 UI-CHANGES）|
| Q16 | 卡片/面板級圓角放大 | **卡片級 6→16px（`--radius-xl`）**：card／kpi／preview-card／selection-card／radio-card／readiness／notification-matrix／insight-row／table 容器／picker／album-tracks／upload-tile／alert banner·bar／info-banner／store-settings 卡／scanner／vip-card／彈窗 dialog（payout/embed/leave）＋其內容卡，共約 40 處統一到現有 `--radius-xl`（16px），與 form-section 一致。**維持 6px**：控制項（button/input/badge/segmented/field-pill）、下拉選單浮層（dropdown/header/owner-lookup 用 `--radius-lg` 8px）、tooltip、清單列、icon 底框、縮圖——放大會違反 Q1「形狀＝角色」或造成一堆圓角。不違反 Q2（Q2 裁的是 6 vs 7px 假精度，非禁止大圓角；shell 28/pill 9999 本就不動） | 2026-07-17 | 使用者裁示（midnight 深色大卡配大圓角更柔和、且統一站上原本 form-section 16 vs 一般卡 6 的不一致） | ✅ 已執行 2026-07-17（元件層逐支改、控制項未動；**未跑 bump_ver**，等其他 session 收工統一補） |
| Q21 | 商品明細改版連帶的四個全站視覺尺度（區塊標題字級／區塊副標與欄位說明的色階與字級／KPI 底色／頁寬） | **全站套用，不做單頁特例**：(1) `.form-section__title` 18→14px，與 `.field__label` 同級——區塊標題不再靠字級放大，層級改由卡片邊界承擔；(2) `.form-section__sub` 14→11px 且色階 `--foreground-muted`→`--muted-foreground`，與 `.field__hint` 同級（兩者同為「輔助說明」角色）；(3) `.field__hint` 同步壓暗成 `--muted-foreground`——**此點推翻 2026-07-16 的反向決定**（當時由 `--muted-foreground` 提亮成 `--foreground-muted`，理由是「說明文字在卡背景上要讀得清楚」），本次由使用者裁示改回；(4) `.kpi` 底色 `--card`→`--input-surface`——KPI 常被放進 `form-section` 卡內，兩層同為 `--card` 會糊在一起，改亮一階讓內層方塊浮在卡面上；(5) 頁寬**改為變體、不動全站**（2026-07-20 同日修訂）：`.page` 維持 1280，新增 `.page--narrow`（1056）只給「主欄＋右側常駐 meta 欄」的詳情頁用——原裁決是全站 1280→1056，使用者看過實際結果後改為只有商品明細窄版，其餘頁維持原寬。這是**變體**不是頁面覆寫，仍在 DS 層、有文件與 consumer 清單，不違反鐵律 9。使用者在被明確告知影響範圍（15–28 頁）與「第 3 點會推翻既有決定」後，仍選擇全站統一而非單頁特例 | 2026-07-20 | 使用者裁示；避免同一視覺角色出現兩種答案（鐵律 11），寧可全站一致也不留特例 | ✅ 已執行 2026-07-20（元件層一次生效：form-section.css／field-system.css／kpi.css／shared.css；已用 Playwright 逐頁量測 index／create-product／e-shop／earnings／settings／product-detail，0 水平溢出；頁寬同日修訂為僅 product-detail 用 `.page--narrow` 1056、其餘頁回 1280）|
| Q25 | 單行輸入控件的高度（站上有 6 種、其中 3 種帶小數） | **統一 36px＝`--control-h-sm`，且一律吃 token、不用 padding 撐**：`.input`／`.select`／`.picker__search-input`／`.app-sidebar__action`（含側欄搜尋）／`.app-topbar__search-input-wrap`／`.field-pill`／`.tag-input` 全部改 `height: var(--control-h-sm)`；表格密集列 `.variant-table .input` 降一階吃 `--control-h-xs`(28)、不再是 padding 撐出來的 32；`.textarea` 例外維持 padding ＋ `min-height:100px`（多行本來就不能鎖高）。**追加同輪（使用者：「都改為整數」）**：側欄兩條列也一起吃 token——`.app-sidebar__link`(34.8→36)、`.app-sidebar__sub-link`(33.6→36，`display` 由 `block` 改 `flex`＋`align-items:center`，鎖高後 block 的文字會貼頂不會自動置中)；子項與主項的區別交給縮排與字級，不靠高度差。**刻意不動的**：`.app-notif__item`（通知列，標題＋時間＋內文多行）、`.app-notif__foot`、`.duration-chip`（內含 `__price` 第二行）——這些高度本來就該隨內容變，鎖高是錯的；它們的「小數」是內容撐開的結果、不是控件尺度分岔。**盤點結果**（`docs/input高度盤點-2026-07-21.md`）：39（`.input` 基準）／44（field-pill、tag-input）／41.5（picker 搜尋）／37.5（側欄搜尋）／35.5（頂欄搜尋）／32（規格表格）＝6 種，其中三個搜尋框的小數高度看不出任何分級理由，是各自手調 padding 沒對過帳的殘留。**小數的根因是做法而非數值**——padding×2 ＋ font-size×line-height(1.5) 幾乎必然算出零頭，所以裁決連做法一起改掉，只調數值治標。**為什麼選 36 而非 44**：(1) `.btn` 就是 36，工具列裡搜尋框與按鈕必須齊平——那三個歪掉的搜尋框正是沒對齊按鈕造成的；(2) `_tokens.css` 原本就宣稱「同尺寸的 input 與 button 等高」，選 36 讓這句由空話變事實（選 44 得反過來改註解或連按鈕一起放大）；(3) 本站 token 命名刻意對齊 shadcn，而 shadcn 的 input 與 button 同為 `h-9`＝36。代價：一般欄位矮 3px、field-pill／tag-input 矮 8px（後者較有感，已告知使用者需目視確認）| 2026-07-21 | 使用者裁示（三選一中選 36「跟按鈕等高」）；根因治理而非逐個湊數值 | ✅ 已執行 2026-07-21（元件層一次生效：input／field-pill／tag-input／picker／header／shared／variant-builder；`--control-h-*` 註解同步改寫，標明實際預設是 sm 不是 md）|
| Q26 | 站上有兩個按鈕家族、預設高度不同 | **`.ztor-btn` 家族退場，`.btn` 成為唯一按鈕**（墓碑留在 `button.css` 開頭）。`.btn` 的三階尺寸本來就正確（`--sm` 28／預設 36／`--lg` 44，全整數、全在刻度上），**問題不在尺寸而在兩套並存**：`.ztor-btn` 預設 44px 且被標為「design-system 文件用的 canonical 按鈕」，`.btn` 預設 36px 卻是 236+ 處真實頁面在用的。使用者檢視元件的唯一入口是 `design-system.html`，那裡把 44 標成預設按鈕，與出貨結果不符——DS 頁在按鈕這一項是錯的。**退場成本近乎零**：清點時全站已無任何 markup 消費 `.ztor-btn`，只剩 `design-system.html` 一行 class API 說明，DS 頁的按鈕 demo 早就用 `.btn` 了。比照 2026-07-10 `.ztor-input` 替身退場的前例（同樣是「文件用替身 vs 產品頁真身」）。**副作用**：`--control-h-lg`(52) 與 `--control-h-xl`(60) 的唯一消費者是 `.ztor-btn` 的兩個大尺寸變體，退場後這兩階變成零消費，已在 `design-system.md` 標為「待採用」（定義保留備用，不刪——刻度完整性比零消費警告重要）| 2026-07-21 | 使用者裁示（三個選項中選「退場」）；DS 頁必須與產品頁同源，否則設計師看到的不是實際出貨的東西 | ✅ 已執行 2026-07-21（`button.css` 規則清空留墓碑、`design-system.html` 移除 class API 列、`design-system.md` 三處敘述改寫）|
| Q24 | 卡片內的層級怎麼往上疊（填色階梯已用完） | **兩層填色，L3 以後改邊框**：(1) **L1 卡片維持絕對色** `--card`（亮 `#FFFFFF`／深 `#212223`），不參與疊加——DevTools 檢視卡片時看到的就是真正的顏色，不是一串半透明宣告值；(2) **L2 巢狀層才是疊加**，新增 `--nest-surface`（亮 `transparent`／深 `rgba(222,223,233,.04)`，合成 ≈ `#292A2B`）；(3) **L3 以後不再疊填色，改用 1px 邊框**——再疊會愈來愈糊、也失去色溫；(4) 深色的疊加色**刻意用冷調淺灰 `rgb(222,223,233)` 而非純白**：純白會把 midnight 畫布的冷調洗掉（B−R 由 +2 掉到 +0.8），這個 tint 反而推到 +3.0、與畫布同溫（Figma 856:27796 獨立算出同一值）；(5) **亮色兩層都是白**，單靠 `--shadow-nest-up` 的向上陰影分層。**起因**：商品選項切到「多選項」時下方要長出「疊上去的一層」，但實測發現巢狀層與其中的 input 在現有絕對色模型下算出**完全同色** `rgb(38,39,41)`——填色階梯已經用完，再加一階必須動 foundation。因為裁決把填色上限壓在兩層，**既有 token（`--card`／`--input-surface`／`--accent`／`--border`）零修改**，只新增 `--nest-surface`＋`--shadow-nest-up` 兩個。L3 邊框規則**只寫進文件、不出 `nest.css`**——nest 不知道自己裡面會放什麼，硬寫 `.nest > *` 會誤傷，由消費端自己套。**同日即落地**：`variant-builder.css` 的 `.option-set__row`／`.variant-option` 坐在 nest 裡＝L3，去掉 `--input-surface` 填色改 `transparent` ＋ 1px `--border`（該輪同時把兩顆「新增」鈕改成 1px **虛線** `--border`，沿用 upload-tile／payout-modal 既有的「這裡還沒有東西」語彙，非新語彙）。**L3 邊框不另立 token，就用 `--border`** | 2026-07-21 | 使用者裁示（探索頁 `docs/層級系統-半透明疊加-探索.html` 逐輪確認）；Figma 856:27798 版型 | ✅ 已執行 2026-07-21（`nest.css` 新元件＋`_tokens.css` 兩個新 token；消費頁 create-product 商品選項）|
| Q25 | 詳情頁右側常駐欄可不可以放「可互動」的卡（原定義只放唯讀狀態） | **放寬為兩類都可以，但要分得出來**：右欄仍以唯讀狀態卡為主（庫存、交付、關聯這類「改東西前要先知道」的資訊），另外允許放**跨分頁層級的可互動設定**——判準是「這個設定管的是整個商品、不隸屬任何一個分頁」。第一個案例是**上架設定**：上架與否是商品的最高層級狀態，塞在「定價與庫存」分頁裡等於暗示它只跟定價庫存有關，放右欄才能在編輯任何分頁時都看得到並隨手改。**不放寬的部分**：隸屬單一分頁的欄位一律留在該分頁，右欄不做成第二個表單。`detail-rail.css` 的元件說明與 design-system Pillar 5 的 pattern 卡同步更新 | 2026-07-21 | 使用者裁示（指定把上架設定移到右欄） | ✅ 已執行 2026-07-21（product-detail 右欄第一張卡）|

---

| Q27 | 編輯／新增流程用側邊 drawer 還是中央彈窗 | **中央彈窗**：`.payout-modal`／`.payout-dialog` 是站上編輯／新增流程的唯一殼層，側邊滑出的 `.drawer` 不再用於「編輯或新增一筆資料」。2026-07-24 把 project-detail 的五個編輯彈窗（專案基本資料／合作者／里程碑／專案更新／支持方案）由 drawer 改為中央彈窗。`.drawer` 保留給「不離開當前頁看詳情／歷史／說明」的唯讀用途（目前唯一消費者 earnings-sony 的提領歷史與如何運作） | 2026-07-24 | 使用者裁示；站上編輯流程原本就以中央彈窗為主（出貨／退款／補貨／費率例外／請款），drawer 是少數例外，收斂成單一答案 | ✅ 已執行 2026-07-24（project-detail 五個彈窗；earnings-sony 的唯讀 drawer 未動）|
| Q28 | 建立專案「專案類型」picker 用哪個元件 | **統一用建立商品同款 `.segmented.radio-cards`**：閘門與流程內表單的專案類型選擇一律用 radio-cards（灰卡＋右上小橘點＝Q13 基準呈現，**不加任何橘色底**），閘門帶標題＋描述＋頂部引導圖示（`--gate` 變體：`.radio-card__lead` 圖示在上恆灰不變色、標題/描述間距加大；閘門＝選了就進下一步的 picker、無持久選取態：resting 完全無指示點（覆蓋 base 已選橘點）；hover 任一卡時右上（`::after`）冒橘點＋卡底提亮到比 Q9 `--accent` 再亮一階的 `color-mix(--foreground 6%, --accent)`（閘門專用 scoped，使用者裁示要更亮））、表單只標題；三型別用 `.radio-cards--3`（3 欄等寬）；流程內表單的已選卡在 Q13 小橘點外再加卡底提亮 `color-mix(--foreground 6%, --accent)`（2026-07-25 使用者裁示，讓流程內選取更明顯），閘門無持久選取態故不套。上一輪一度嘗試的 `.radio-list--menu`／`--menu-row` 圖示清單樣式與淡橘／橘色已選底，經使用者裁示「跟建立商品長不一樣、要用那個元件」全部撤回，`--menu` 系列變體從元件庫移除（radio-list.css tombstone）| 2026-07-24 | 使用者裁示（截圖指定：要跟建立商品「商品選項」`.segmented.radio-cards` 完全一致——灰卡＋小橘點、無橘底）| ✅ 已執行 2026-07-24 |
| Q29 | 站上有兩支長相不同的資料表元件（`ztor-table` vs `variant-table`） | **全站資料表只收斂「框型」到 `variant-table`（商品明細規格庫存表）、密度維持原樣**：`.ztor-table` 由「陰影」改為「自帶 1px `--border`」（對齊 `.variant-table-wrap` 自框），使框型一致；**間距／字級不動**（padding `sp-16 sp-20`、表頭 fs-13、內文 fs-14 皆保留）。**沿革**：首版（同日）連密度一起收斂（`sp-10 sp-12`＋表頭 fs-11／內文 fs-13），使用者看 demo（`_demo-table-density.html` A密／B完全復原／C折衷三選項）後選 B——「線框對了，但欄位間距要像之前那樣大」，故回退密度、只留邊框。**外框防雙框**（三種容器脈絡）：(1) 直接坐進出框 `.card` 的 flush 表（`.card > .ztor-table`，earnings／event-detail）由卡出框、表格自身 `border:0`；(2) 包在 `overflow-x` 容器裡的 inset／standalone 表（project-detail 發布更新／合作者、earnings 的 `.bd-tablecard`）保留自身邊框；(3) `.admin-table-wrap .ztor-table`（admin IP 銀行／費率／IP 報表）由 wrap 出框、表格 `border:0`。**未動** `variant-table` 本身，也未動各頁的 `.ztor-table__feature`／狀態格／可展開列等既有語意 | 2026-07-25 | 使用者裁示（兩輪並排比較選「全站收斂」，再看密度 demo 選 B「框型收斂、間距復原」） | ✅ 已執行 2026-07-25（`table.css` 元件層一次改：邊框收斂、密度回退＋`admin-ip-bank-table.css` 加 `border:0`；project-detail／earnings／admin-platform-fees 三種脈絡逐一以 computed style＋截圖驗證無雙框）|
| Q30 | IP 卡／IP hero 封面：漸層色塊 vs 真實封面圖 | **交叉註記（2026-07-31）**：顯示框與上傳框是兩件事，本題（顯示框的佔位/真圖切換）不適用於上傳槽——上傳槽的比例改由 Q39 統一規範。**漸層佔位＋可疊真實圖**：`.ipm-card__cover`（IP Market 三張上架卡，2026-07-25 由無 class 的 inline 漸層 div promote）與既有 `.ip-hero__cover`（IP 詳情）統一——預設品牌漸層佔位（3:4）＋IP 名文字，放上 `.ipm-card__cover-img`／`.ip-hero__cover-img`（`object-fit:cover`、絕對定位疊在佔位上）即改真實封面圖鋪滿，比照站上既有 `.project-card__cover-img` 慣例。真實授權圖由使用者提供、非站上內建；角色圖／藝人照等受版權素材不由 AI 生成或代抓（版權／肖像界線）。順帶消掉 card2／card3 的兩組 inline 裸 hex 漸層 | 2026-07-25 | 使用者要「圖片也要換」；與站上其他列表卡（project-card／product-list）用真實圖鋪滿的做法收斂為單一答案 | ✅ 已執行 2026-07-25（`shared.css` 新增 `.ipm-card__cover`＋兩支 `__cover-img`；ip-market 三卡與 ip-detail hero 改用；design-system.md／html 同步）|

| Q31 | IP 詳情 hero：租用資訊放右側窄欄，還是收進內容欄 | **交叉註記（2026-07-31）**：顯示框與上傳框是兩件事，本題（IP hero 3:4 顯示框的版面配置）不適用於上傳槽——上傳槽的比例改由 Q39 統一規範。**收進內容欄、hero 改兩欄**：`.ip-hero` 由「封面 248｜內容 1fr｜側欄 auto(280)」三欄改為 **`200px minmax(0,1fr)` 兩欄**——封面獨佔左欄（3:4、頂對齊、寬度刻意配合右欄文字自然高度），其餘全部走右欄。連帶三項：(1) 四格事實（版稅／起租費／租期／獨家）由自建的 `.ip-hero__meta` auto-fit 網格＋`.meta-cell` 純文字，改用**站上標準 `.bento > .kpi.bento--span-3`**，與儀表板／收入管理的指標列同一套讀法（使用者裁示「這些做成 bento」）；(2) 租用 UI 由 `.ip-hero__side > .card.rental-card` 改為新元件 **`.rent-block`**，垂直兩組（組 1 租期｜獨家、組 2 費用明細｜結算），組內 `1.3fr 1fr` 讓兩組左右欄上下對齊；(3) `.ip-hero__meta`／`.ip-hero__side` 退場留墓碑（`.meta-cell` 保留，create-project 仍消費）。**動機**：280px 側欄把內容欄壓到 217px（標題硬折行、meta 塌成單欄），且封面較高時側欄旁留一塊死空間；使用者連續三輪圈出空白要求修正。過程中兩個被否決的做法一併記錄——封面拉長填滿高度（變成與站上其他圖不同比例的長條，使用者否決）、租用區跨滿整張卡寬度（封面下方仍空，使用者指定「全部放右邊、照片在左邊不動」）。探索頁 `docs/ip-detail-hero-demo.html` | 2026-07-25 | 使用者裁示（逐輪截圖圈選：先要移出側欄、再要收回卡內垂直排 1→2、再要全部靠右、最後要四格改 bento）| ✅ 已執行 2026-07-25（`shared.css` 兩欄＋兩個墓碑、新增 `ds-components/rent-block.css`、`ip-detail.html` 改版、`design-system.md`／`.html` 同步含新章節 4.75b＋TOC）|
| Q32 | 卡片邊界更上層問題（Q23 留待裁決）：`.card` 系（Q3 邊框）vs `form-section--outlined`（Q14/Q18 陰影）同一視覺角色兩種答案，要不要全站統一 | **C（全站統一成陰影版）**：`.card` 基底（連同 `.funding-panel--card`／`.fc-bundle`，後者本就吃 `.card`）與 `.kpi` 改為 `border:0` ＋ `box-shadow: var(--shadow-card), var(--shadow-edge-top)`，跟 `form-section--outlined` 統一做法。`.kpi` 額外處理：預設底色同步由 `--input-surface`（Q21）還原成 `--card`——多數 KPI 直接放在 `.bento`／`.tab-panel` 上、沒有卡包著，跟外層同色才是常見情境；真的疊在 `--card` 系容器內的 8 處（`event-detail.html` Overview 分頁、`earnings.html` Breakdown／Payouts、`auction-detail.html`、`bundle-detail.html`、`product-detail.html`、`admin-ip-bank-entry.html`、`ip-detail.html`）用 scoped selector `.card .kpi, .form-section--outlined .kpi, .ip-hero .kpi` 改回 `--input-surface` 維持跟外層卡的區隔（Q21 的原始理由只在這 8 處仍成立）。**未動**：`.ztor-card`（docs-only，未上產品頁）、控制項/清單類 1px 邊框（input／table／dropdown／picker／modal 等，Q3/Q4 對它們仍有效，這次只處理「大容器卡」這個視覺角色）。 | 2026-07-26 | 使用者看過 `.card` 三種卡型（組合包卡／募資狀態卡／發布更新卡）與 `.kpi` 的無邊框＋陰影 demo 後裁示「全站都改」；解決 Q23 記錄的「每次並排才發現不一致、要再開一次例外」的重複成本 | ✅ 已執行 2026-07-26（`card.css`／`funding-panel.css`／`kpi.css` 元件層一次生效；`design-system.md`／`.html` 同步 4.11b Section card、4.12 KPI、Pillar 2 陰影表；bump_ver＋check_ds_sync 見 UI-CHANGES.md）|
| Q33 | 控制項邊框是否該看「有沒有卡片／section 包著」決定，而非 Q4 的一律真 border | **新規則**：Q4（2026-07-13：input／textarea／select／switch／metric-pill 一律真 `border`）對疊在卡片／section 內的控件仍成立；但**不在任何卡片／section 內、直接坐在頁面或工具列上**的控件改無邊框無填色，貼合旁邊同列元件（如 filter-tabs）的處理。首個落地案例：`projects.html` 列表工具列的內容類別 `<select id="proj-cat">` 原本跟旁邊的 `.filter-tabs`（無邊框 pill）並排卻自己戴一圈框，使用者指出不一致。新增 `.select--bare`（疊加在 `.select` 上，`ds-components/input.css`）：去 box-shadow 邊線、去填色、pill 圓角、hover 才浮出 `--muted`。**稽核範圍**：全站僅 `projects.html` 這一處是「select 直接坐在 `.list-status-row` 工具列、沒有卡片包著」的情境（其餘 `.list-status-row` consumer：e-shop／events／orders／ip-market／my-ip／pickup 皆無此 pattern；ip-market 的六個 select 在進階篩選面板內，不受影響）。**未動**：`.input`／`.textarea`／`.switch`／`.metric-pill` 尚未逐一稽核套用此規則，未來若出現同款「不在卡片內」的情境比照本條處理，不必另開新題號 | 2026-07-26 | 使用者裁示（截圖指出 `#proj-cat` 這個 select 不該有 border，並明確定調「section 內的才要 border」的新規則） | ✅ 已執行 2026-07-26（`input.css` 新增 `.select--bare`；`projects.html` 套用；`design-system.md`／`.html` 同步 4.x Input/Select 條目） |
| Q34 | 清單列 hover：`--eshop`／`--ip` 的浮起處理要不要變成全站唯一答案（原本 base／`--orders`／`--pickup` 仍是 Q9 純換底色） | **C（全站統一成浮起版）**：`.product-list__row:hover` base 規則由 Q9 2026-07-13 的純換底色（`--accent`）改為 2026-07-20/21 原本只給 `--eshop`／`--ip` 的浮起處理（`--card` 底＋`--radius-md`＋`--shadow-lift-flat`＋自身與上一列 `border-bottom` 透明），全部變體（`--orders`／`--pickup`／`--events`／`--auctions`／`--bundles` 及無 variant 的 base）統一。原本 `--eshop`／`--ip` 專屬的 scoped 規則因此變成單純重複，已刪除、併回 base。**`.project-list__row:hover`（Projects 列表，獨立的 `project-list.css`，同款 Q9 純換底色）同步比照改寫**，跟 product-list 用同一套視覺語言。**未動**：`.product-list--eshop .product-list__row { cursor:pointer }`（點列進編輯的點擊行為，2026-07-23 裁示只有 --eshop 有這個導航行為，`.project-list__row` 本身是 `<a>` 整列可點、不受影響）；`.radio-list__item:hover`、表格類（`.ztor-table`／`.data-list`／admin 系）——這些列本來就沒有列 hover 浮起的語意（radio 選取態、純資料表），不在「商品列表」這個角色內，不套用 | 2026-07-26 | 使用者裁示「所有列表的 hover 都要改成像電子商店的商品列表一樣」，並附電子商店浮起 hover 的截圖為範本 | ✅ 已執行 2026-07-26（`product-list.css`／`project-list.css` base 規則改寫、eshop/ip scoped 重複規則移除；product-list 7 個 consumer 頁＋project-list 1 個 consumer 頁共用同一套視覺，元件層一次生效） |
| Q38 | 頁面分節 tabs：純 `.tabs`（灰底線＋橘字）vs 底線式 `.tabs--underline-short`（短橘底線） | **B（底線式）**：使用者 2026-07-31 直接圈選 e-shop 工作列那組 `tabs tabs--underline-short tabs--underline-label` 指定沿用。本輪執行範圍限 **earnings 家族**（`earnings.html` 七顆分頁、`earnings-sony.html` 兩顆分頁）——同一頁的兩個版本必須長一樣。**根因（2026-07-31 第二次踩到後查清）**：元件本身有 bug——`tabs.css` 的 `button.tabs__item { border: 0 }` 把 `.tabs__item` 的 `border-bottom: 2px solid transparent` 清掉了，而那是整套底線的基座。已於元件層修正（改成只清上／右／左三邊），連帶讓全站 17 支 `<button>` 寫的分頁恢復 active 橘色底線。**這組樣式還有一個前提**：`::after` 是 `bottom:-12px`，設計上要貼在 58px 高的 `.list-toolbar` 卡底緣，所以分頁列必須包進 `.list-toolbar` 殼才對得上；只掛 class 的話底線會浮在文字下方（2026-07-31 使用者比對後指出，已修）。未來其他頁要套這組樣式，同樣要連殼一起帶。`tabs--count-plain` 沒掛：它只作用在 `.tabs__item-count`，這兩處沒有計數，掛了是無作用的 class。`tabs--underline-label` 要求標籤包在子元素裡（底線掛在 `:first-child` 上），故 earnings.html 原本把 `data-i18n` 直接放在 button 上的寫法改成包一層 `<span>`。**未動（待使用者決定是否掃齊）**：其餘 8 支仍用純 `.tabs` 的頁面——`event-detail.html`／`fans-crm.html`／`ip-detail.html`／`pickup-detail.html`／`fan-detail.html`／`project-detail.html`／`scanner.html`／`store-settings.html`。它們跟 earnings 是同一個視覺角色（頁面分節切換），照風格單一答案原則應該一起改，但那是 8 頁的批次改動、且使用者本輪只指到 earnings，故先記在此不擅自掃 | 2026-07-31 | 使用者圈選指定樣式；同一視覺角色不留兩種做法 | ⚠️ 部分執行 2026-07-31（earnings 家族 2 頁已改；其餘 8 頁待使用者決定是否掃齊）|
| Q39 | 圖片上傳槽比例：各模組各自一套（縮圖 1:1／直式海報 3:4／橫幅 16:9／相簿 3:2）vs 單一比例 | **單一直式 750×1125（2:3）**〔**2026-08-05 更新比例值（D176）**：原裁決值為 750×930（25:31 ≈ 0.806），使用者裁示改 2:3、像素標準 750×1125（維持寬 750、只拉高）。本題「全站單一直式、上傳槽與顯示框共用一個變數」的結論不變，只換數值；`--img-portrait` 由 `750 / 930` 改 `2 / 3`，修飾詞 `--750x930` 同時更名為不帶數字的 `--portrait`，避免下次調比例又名實不符。連帶影響見 Q43〕：全站「上傳圖片」槽一律改用單一直式比例，讀 `--upload-img-ratio`（`ds-components/upload-tile.css:31`）。舊的四套並存模型（縮圖 1:1／直式海報 3:4／橫幅 16:9／相簿 3:2）整組退場，10 個產品頁（create-project／create-product／create-event／edit-event／create-auction／create-bundle／bundle-detail／product-detail／create-campaign／project-detail）同步改用新比例，另加測試版路由 `funding-test/create-campaign.html`；`--1x1`／`--3x4`／`--3x2` 三個形狀修飾詞已從圖片槽移除，`--16x9` 僅保留給 project-detail 的 Demo 影片／音樂**檔案**槽（非圖片上傳槽，不受本題規範）。~~**本題只管上傳槽本身；顯示端（清單縮圖、`.project-card__cover-img`、`.ipm-card__cover-img`、`.ip-hero__cover-img` 等）維持各自既有比例不變，靠 `object-fit: cover` 從直式原圖置中裁切**——見 Q30／Q31 交叉註記。~~〔**2026-07-31 續作（同日第二輪）：上一句已被使用者推翻**——顯示端也一併改直式。清單縮圖與卡片封面（`.product-list__image`／`.project-list__image`／`.project-card__cover`／`.preview-card__media`／`.fan-store__featured-media`／`.fan-store__thumb`／`.ztor-table__thumb`／`.admin-table__thumb`）全部改讀同一個 `--img-portrait`，理由：使用者回報「列表中的圖沒改直式」——上傳端已統一直式，顯示端若仍各走 1:1／16:9／4:3，創作者上傳的直式圖到了列表照樣被裁切，等於白改。詳見新增的 **Q42**（活動例外）；本題（Q39）的裁決範圍隨之從「僅上傳槽」擴大為「上傳槽＋顯示框」，執行狀態同步更新。〕**產品側缺口**：這是使用者裁決、非上游規格變更，`documents/`（5.1.5.2／5.1.5.10／5.1.6.1／5.1.2.1 等）尚未同步 → 〔**2026-07-31 已結案**：上游已於 D164／§7.10 正式採納整套比例收斂（含顯示端置中裁切的取圖方式），`ASSUMPTIONS.md` IMG-001／PG-023 已更新為「已由上游採納／已結案」，不再是待同步缺口〕 | 2026-07-31 | 使用者明確裁決：全站圖片上傳槽統一成單一直式尺寸，不再逐模組各自定義比例；同日第二輪擴大到顯示端 | ✅ 已執行 2026-07-31（`upload-tile.css` 新增 `--upload-img-ratio`＋`--750x930`、退場 `--1x1`／`--3x4`／`--3x2`；10 個產品頁＋1 個測試版路由套用；`design-system.md`／`.html` 同步）。**續作已執行**：顯示端 7 支元件改直式、`--img-portrait` 搬進 `_tokens.css`（見 Q42 與 `UI-CHANGES.md` 2026-07-31 第十二批） |
| Q40 | 圖片上傳槽 hover 動作列：同一視覺角色站上有四種做法（手刻×2、共用元件、六頁漏載） | **收斂成單一產生路徑**：hover 動作列（替換／刪除，選配 AI 優化）全部改由共用元件 `partials/upload-tile.js` 產生。收斂前站上實際存在的分歧——`project-detail.html`、`product-detail.html`（含頁內第二份）各自手刻一份 hover markup；`bundle-detail.html` 等六頁（`bundle-detail`／`create-bundle`／`create-auction`／`create-campaign`／`create-event`／`create-project`）完全沒載入 `upload-tile.js`、漏了 hover（`bundle-detail` 屬 bug，其餘五頁屬缺口）。收斂後動作列顯示條件由 `[data-upload]` 放寬為 `.is-filled`，手刻與 JS 產生兩種來源行為一致；標準統一為**替換／刪除 2 鈕**，AI 優化改 `data-upload-ai` opt-in 第三鈕（僅 create-product 商品圖槽開啟） | 2026-07-30 | 同一視覺角色（上傳格 hover 動作）不留兩種以上做法；六頁漏載屬缺口，一併補齊 | ✅ 已執行 2026-07-30（`partials/upload-tile.js` 單一產生路徑；手刻版本移除、六頁補齊；`design-system.md`／`.html` 同步） |
| Q41 | 列表／表格的欄位表頭：下框線與標籤墨色 | **全部不畫**：站上所有「欄位表頭」列一律移除 `border-bottom`，分隔改由表頭與內容之間的留白承擔；**每一列自己的分隔線不動**。範圍＝10 支元件：`.product-list__head`、`.project-list__head`、`.ztor-table thead th`、`.table-head`（sortable）、`.restock-table__head`、`.variant-table__head`、`.restock-log__head`、`.bmx__head`、`.msg-history__head`、`.notif-matrix__corner`／`__chead`。其中四支原本表頭有 `--muted` 底色（restock-table／variant-table／restock-log／notif-matrix），**底色保留**、由它繼續承擔分隔。**不在範圍內**＝面板／彈窗／卡片／群組的「標題列」——那是標題與內容的結構分隔，不是欄位標籤列：`.drawer__head`、`.detail-sheet__head`、`.payout-dialog__head`、`.embed-modal__head`、`.preview-panel__head`、`.chart-card__head`、`.vault-group__head`、`.app-notif__head`、`.header`，全部維持原樣。本條同時吸收同日稍早那次「`.ztor-table` 表頭去底色」的裁決（原理由是底色在卡片內會讀成另一個區塊；當時分隔還留給 border，這次連 border 也去掉）。**同日追加——標籤墨色也收成一個**：使用者接著裁示「所有表頭的字的顏色也都要改成這樣」（＝ `.ztor-table thead th` 那階更暗的灰）。同一角色原本跑三種配方——裸 `--muted-foreground`（7 支）、`color-mix(--muted-foreground 68%, --card)`（`.product-list--eshop` 的覆寫）、`color-mix(--muted-foreground 72%, transparent)`（`.ztor-table thead th`），正是 Q9 要收斂的「散落的即席灰」。收成新 token **`--column-head-ink`**（`_tokens.css`，＝ `--muted-foreground` 降到 72% 不透明度），11 處表頭一律 `var(--column-head-ink)`；`.product-list--eshop` 的 68% 覆寫整條刪除。混 `transparent` 而非 `--card`，四支帶 `--muted` 底色的表頭才跟其餘同一階暗度。**字級不動**（既有 `--fs-11`／`--fs-12` 兩階留著，使用者這次只點名顏色）。 | 2026-07-31 | 使用者先要求做一份 e-shop 整頁探索頁（`.product-list__head` 拿掉底線）確認效果，看過後裁示「將 r2.2 中的元件的所有列表表頭的這個底線都刪除」。少了那條線之後表頭讀起來像「欄位標籤」而不是「表格的第一列」，整塊清單的重量往內容集中 | ✅ 已執行 2026-07-31（元件層 10 支各改一次；projects／settings／fans-crm／product-detail／tier-benefits／earnings 六頁實測 computed `border-bottom-width` 皆 0px、列分隔線仍 1px；探索頁已刪除）。墨色同日追加：新增 `--column-head-ink`、11 處改吃 token、`--eshop` 68% 覆寫刪除，e-shop 實測 computed color 為 `rgb(151,151,151 / 0.72)` |
| Q42 | 暗色浮起卡的底色：`--card` vs `--surface-shell` | **`form-section--outlined` 暗色改用 `--surface-shell`**（`#1C1D1E`），與同頁的 `.list-toolbar`／`.alert-inset`（本就用 `--surface-shell`）統一成同一色階；三者原本一個用 `--card`（`#212223`）、兩個用 `--surface-shell`，同一畫面裡沒有必要的差異。亮色不受影響（三者本就同為 `--card` `#FFFFFF`）；對頁面底 `--surface-page`（`#0C0D0D`）的對比仍充足，未重演 2026-07-17 `--muted` 貼底消失的問題。**範圍限定**：只動 `.form-section--outlined` 這一個消費者，全站其餘用 `--card` 的浮起卡（`.card`／`.kpi`，Q32）不受影響——那組是「疊放在任意容器上」的通用卡，跟本例「工作列/通知/表單卡同層並排比色」的情境不同，沒有一併裁決的依據。 | 2026-08-01 | 使用者比對 e-shop 頁上三個並排元素的底色截圖，裁示「都用 #1C1D1E 吧」 | ✅ 已執行 2026-08-01（`form-section.css` 元件層一次生效，17 支消費頁；create-product.html 實測 computed `rgb(28,29,30)`）|
| Q52 | 活動（Events）清單縮圖：2026-07-31 刻意保留的方形例外，要不要併入全站直式 | **併入直式，方形例外撤除**：`.product-list--events .product-list__image { aspect-ratio: 1 / 1 }` 這條覆寫整條刪除，活動清單改吃 base 的 `var(--img-portrait)`，與其餘七支清單縮圖同一個答案；列高從原本維持的 116px 跟著長到與 e-shop／projects 一致。**這推翻 2026-07-31 當時的決定**——當時的理由是「活動素材有直有橫，清單那一格要同時裝得下兩種來源，方形對兩種都對稱」。撤除的依據：清單縮圖取的是活動的**直式主視覺**（`ce.img.keyvisual`），橫式橫幅另有自己的顯示版位（`event-preview-card--landscape`，仍 16:9），這一格本來就不需要替橫幅預留空間，原理由不成立。**範圍僅限清單縮圖**：活動的橫式**上傳槽**維持 1920×1080 · 16:9，Q46 未被推翻 | 2026-08-05 | 使用者直接圈選活動清單那格方形縮圖，裁示「活動的圖也要改成這個直的」；同一視覺角色（清單縮圖）站上不留兩種答案 | ✅ 已執行 2026-08-05（`product-list.css` 覆寫刪除、原註解改寫成撤除理由；`events.html` 實測縮圖 76×114、比例 0.667、列高與 e-shop 一致）|
| Q46 | 顯示端全面改直式後，活動（Events）的橫式橫幅槽是否也併入 | **不併入，活動保留橫式為唯一例外**：Q39 顯示端續作把全站清單縮圖／卡片封面收斂成單一直式 `--img-portrait` 之後，唯獨活動的橫式橫幅槽與橫式顯示版位維持橫式——`--16x9` 從墓碑復活，只服務 create-event／edit-event 的橫幅圖片槽（1920×1080）。理由：活動同時需要直式主視覺（手機端）與橫式橫幅（桌面端主視覺、社群分享卡），兩者用途本來就不同構圖，若強制統一直式會讓桌面主視覺變成一條窄長條；活動素材本來也多半備有官方橫式主視覺，沿用可省去重製。**其他模組不得比照新增橫式槽**——這不是「活動也可以有例外」的先例，是活動這個模組本身有真正的橫式版位需求。已由 `documents/decisions.md` D164 第 4 點正式追認。〔**2026-08-05 已被使用者推翻**：裁示「活動圖片改成只有直式的、和商品一樣的元件」，`create-event`／`edit-event` 的橫式橫幅槽整格撤除，活動素材剩主視覺與圖庫兩格、皆 750×1125 直式。本題的結論自此失效，全站圖片上傳槽回到「只有直式」這一個答案（Q39 的原始方向）。**與上游的落差**：D164 第 4 點仍寫著活動保留橫式，未回寫 `documents/`，記在 `ASSUMPTIONS.md` IMG-002。`--16x9` 修飾詞**不退場**——它仍服務 project-detail 的 Demo 影片／音樂**檔案**槽（那是檔案槽、不是圖片槽，本來就不在本題範圍）。〕 | 2026-07-31（2026-08-05 推翻）| 使用者裁示（同日第二輪，落地顯示端直式收斂時一併決定活動維持雙比例） | ✅ 已執行 2026-07-31（`upload-tile.css` 的 `--16x9` 由「僅檔案槽」擴大為「檔案槽＋活動橫幅圖片槽」；`create-event.html`／`edit-event.html` 橫幅槽回 `--16x9`；`design-system.md`／`.html` 同步）|
| Q43 | 「返回上一層」按鈕的樣貌：站上兩種做法 | **裸箭頭**：詳情頁麵包屑的返回鈕去掉外框與底色（`background: transparent; border: 0`），靜止態只有 `chevron-left`，圓形底只在 hover 時由 `.btn--icon-circle` 的 `--accent` 現形。提出當下站上有兩種——A 裸箭頭（`shared.css:1099` `.wizard__back`，7 個建立流程頁）、B 圓鈕（當日新建的 10 個詳情頁麵包屑，`--muted` 底＋1px 邊）。**使用者裁示走 A**，兩邊自此同一種做法。**底色與外框一起收掉而不是只收外框**：只拿掉外框會留著 atom 的 `--muted` 填色，暗色模式看得到一顆灰圓、亮色模式 `#FAFAFA` 對白底整顆消失，同一顆鈕在兩個主題長不一樣。配套：返回鈕與第一節麵包屑的間距由 `--sp-10` 加到 `--sp-16`（沒有可見邊界之後，圓框內那 6px 空白讀不出來、兩者黏在一起）。**剩餘差異不在本次裁決範圍**：wizard 那顆是 24×22 框配 22px 字符、詳情頁這顆是 28×28 框配 16px 字符，兩者都是裸箭頭但尺寸不同；要不要一併統一尺寸另行提出，本輪不擅自動 wizard 的 7 頁 | 2026-08-02 | 使用者在 project-detail 頁圈選該按鈕裁示「這個按鈕要用沒有外匡的」，隨後追加「要和後面的麵包屑有更多一點間距」 | ✅ 已執行 2026-08-02（`page-intro.css` 元件層一次生效，10 個詳情頁；亮／暗兩種模式實測 computed 皆為 `background rgba(0,0,0,0)`、`border-width 0px`、`color rgb(110,110,104)`，箱距 16px）|
| Q44 | UI 文案的脈絡重述：標籤重述頁面主詞、hint 重述標籤 | **原則生效（不重述上下文）**：標籤只回答「這一格是什麼」，頁面／分頁／區段標題已經交代過的資訊不重複；hint 只寫「使用者要做決定才需要知道的資訊」（上限、單位、後果、留空會怎樣），把標籤換句話說的 hint 一律刪。**例外**（本來就需要主詞／受詞，不算違規，不要拿原則去砍）：按鈕與操作項（`發布活動`）、頁面與區段標題（`編輯活動`）、錯誤與驗證訊息（`活動名稱不可空白`）、Review／確認步驟的欄位、選項值本身。站上現存證據——重述型：`pd-earn.income.sub`（`js/i18n.js:4769`）＝「收入總和（小計）」與標籤 `pd-earn.income`（`js/i18n.js:4753`）一字不差；`pks.tickets.hint`（`js/i18n.js:4289`）＝「— 用同一支 scanner 核銷活動票券」把標籤 `pks.tickets`（`js/i18n.js:4288`）＝「活動票券」再講一遍；`ca.start.none-sub`（`js/i18n.js:3156`）＝「存成草稿，先不開拍」重述標籤 `ca.start.none`（`js/i18n.js:3153`）＝「不開拍」。標籤含模組主詞的候選：`ce.name`（`js/i18n.js:2834`）＝「活動名稱」坐在建立活動頁、`cb.total`（`js/i18n.js:3400`）＝「組合上限」坐在套組編輯器。**本輪只建機制不改文案**：存量以 `ds-baseline.json` 的 `copy` 區塊記成基準（R1 說明重述標籤 11 處、R2 標籤含模組主詞候選 11 處），只准降不准升，新增即 FAIL；存量清理另案排程，逐筆判斷後再降基準 | 2026-08-03 | 使用者 2026-07-31 指出 AI 把每個字串當成獨立、要自我解釋的單位在寫，於是欄位標籤重述頁面主詞、hint 重述欄位名、標籤塞進版面已交代的脈絡；這件事機器無法全權判斷（「發布活動」「編輯活動」都是對的），所以規則寫給人看、機械檢查只負責縮小範圍 | ✅ 已執行 2026-08-03（規則寫進 `project-ui-creator` SKILL.md 鐵律 12；`check_ds_sync.py` 新增檢查 12 棘輪，基準落在 `site/r2.2/ds-baseline.json`。**文案本身尚未清理**）|
| Q37 | 卡片內的移除／刪除動作：站上多數用 ghost 文字鈕、套組編輯器改實色紅底 | **A（統一實色紅底）**：所有 `btn--destructive` 一律拿掉 `btn--ghost`，用實色 `--destructive` 底＋白字。改動 5 處：`create-auction`（刪除拍賣）、`create-product`（刪除商品＋刪除規格選項）、`edit-event`（刪除活動）、`manage-ip`（刪除 IP）；`bundle-editor.js`／`media-vault.js` 本來就是實色，不動。理由：刪除是不可逆動作，ghost 文字鈕在卡片裡與一般次要動作長得太像，看不出後果的分量。 | 2026-08-03 | 使用者裁示「統一用紅色的」 | ⛔ **已於 2026-08-06 推翻**（使用者裁示「r2.2 上所有的移除按鈕都要用紅色 border 的元件樣式」）：`.btn--destructive:not(.btn--ghost)` 改成透明底＋1px `--destructive` 邊框＋紅字，hover 才上 10% 紅底。新理由：刪除的分量由「紅」本身承擔就夠；實色紅塊在卡片裡比同一列的主要動作（儲存）還搶眼，等於把最不該先按的那顆做成視覺焦點。邊框化之後與 `.btn--outline` 同一種骨架、只換顏色，一整列動作的重量才排得對。原 2026-08-03 的實色版已無消費者。|
| Q49 | 未登入層整頁殼要不要包一張卡 | **無卡片**：登入頁的內容直接置中在頁面底色（`--background`）上，不用容器底色、邊框、陰影與圓角；`.auth-shell` 只負責 `max-width: 420px` 與垂直節奏。`scanner-page` 的手機框不受影響（它的容器有自己的理由——那是刻意模擬手持裝置，不是為了襯托表單）。Q32「卡片邊界全站統一成陰影版」管的是站上有卡片的地方長什麼樣，本題管的是未登入層要不要有卡片，兩者不衝突 | 2026-08-04 | 使用者裁示，比照 ztor 消費端 `ztor.com/zh-tw/login`；未登入層只有一件事要做，一張卡對一份表單是多出來的容器，拿掉之後版面更接近消費端、也少一層要維護的 surface 對比 | ✅ 已執行 2026-08-04（`auth.css`／`login.html`／`design-system.html` demo 卡／`design-system.md` §4.113 已同步）|
| Q50 | 填色按鈕的停用態：全站按 `opacity: 0.45` 調暗，主要按鈕因此變成「暗一點的品牌橘」 | **灰底灰字**：`.btn--primary` 與 `.btn--destructive`（非 ghost）停用時改吃 `--muted` 底、`--muted-foreground` 字、`--border` hairline，不再用 opacity 調暗；ghost／outline／soft 沒有實心品牌底，維持原本的 opacity 規則。hairline 是必要的——`--muted` 在深色主題與頁面底色很接近，沒有邊界按鈕會整個化進背景 | 2026-08-04 | 使用者裁示「這個 disable 的狀態應該用灰色的」＋「需要改元件」（不做頁面層覆寫）。理由：調暗的品牌色仍是品牌色，讀起來像另一種可按狀態；灰才是不可用。輸入框的 disabled 早就是 `--muted` 底＋弱化字，本題讓按鈕跟上同一套語彙 | ✅ 已執行 2026-08-04（`button.css`；實測深色 `rgb(22,23,24)` 底／亮色 `#FAFAFA` 底，啟用後回到 `rgb(255,163,63)`；受影響的消費頁：login、create-product／-bundle／-auction、creators、edit-event、payout-request-modal、pickup-session-modal）|
| Q51 | 圖示風格：站上通用字符是描邊，登入頁 F1 那一格卻要跟四顆實心品牌標記並排 | **限登入頁 F1 方式卡改實心，其他地方一律維持描邊**：`login.html` F1 的「電子郵件」「手機號碼」兩張卡改用新增的 `mail-fill`／`smartphone-fill`（Tabler `filled/mail`／`filled/device-mobile`，MIT），既有的描邊 `mail`／`smartphone` **路徑不動**：`smartphone` 仍由 `settings.html` 的登入裝置列使用，`mail` 由 `partials/artist-picker.js` 引用（該元件目前零頁面載入、屬退場候選）。兩顆新字符的 `<g>` 從中心放大 1.14 倍，補上原圖比滿版品牌標記小一圈的差（信封 20×16、手機 14×20 對品牌標記的 24×24），讓六顆的光學大小接近。**這不是「站上可以開始用實心」的先例**——要在別處新增實心變體須另立題號 | 2026-08-04 | 使用者裁示「email phone icon 都換實心的」。理由：Apple／Google／Facebook／LINE 的品牌標記受各家商標規範綁定形狀，沒有描邊版可用；同一個 2 欄 grid 裡六張卡是同一個決定的六個答案，四顆實心配兩顆描邊會讓那兩顆看起來比較輕、像沒對齊。既然無法把品牌標記線條化，就讓另外兩顆下沉到同一個量級 | ✅ 已執行 2026-08-04（`js/icons.js` 新增兩顆；`login.html` F1 與 `design-system.html` §4.113 的 demo 卡同步換用；`design-system.md` §1.7 補「實心字符只給特定情境」段＋換庫對照表兩列；icon registry「使用中」清單同步）|
| Q53 | 勾選框：站上有正規的 `.zcheck` 元件，但提款／捐贈確認、`manage-ip` 與 `register-ip` 的定價「請洽詢」共七處仍是裸的原生 checkbox，其中提款／捐贈那族還被一個灰底外框列包住 | **全站只有一種勾選框＝`.zcheck`，且確認類勾選不另加容器框**：`.payout-confirm`／`__box`／`__text`（`ds-components/payout-modal.css`）、`.mi-onreq`（`ds-components/manage-ip.css`）、`.ri-onreq`（`register-ip.html` 頁內 `<style>`）三族全數退場走墓碑，七處裸 checkbox 一律改成 `.zcheck` 的四層 markup（`__control` > `__input` + `__box`，外加 `__label`）。要與上一個區塊拉開距離時用既有的 `mt-8`／`mt-16` 工具類，**不為此新增變體**。`.zcheck` 之外站上僅存的原生 checkbox 是 `.switch`（開關，另一種控件，不在本題範圍）與 `checkbox.css` 檔尾那條 `accent-color` 安全網（兜底規則，不是 API） | 2026-08-06 | 使用者指著捐贈彈窗的確認列裁示「不需要有一個框框，我們的元件樣式應該沒有這樣？有的話請統一改掉」。理由：外框是把「這件事不可逆」再說一次，而那件事旁邊那顆停用的主要行動已經說過了；站上其餘每一個勾選都是「一個方框＋一句話」，沒有一個包在框裡。`.mi-onreq`／`.ri-onreq` 當初刻意把標籤壓成 `--fs-12`＋`--muted-foreground`「輕一階」，是為了讓一顆沒有樣式的系統勾選框旁的字不要太搶眼；換成正規元件後那個理由消失，標籤統一吃 `.zcheck__label`（`--fs-13`／`--foreground`） | ✅ 已執行 2026-08-06（三支 CSS 墓碑化；`earnings-sony.html`、`partials/payout-request-modal.js`、`design-system.html` demo、`manage-ip.html` ×3、`register-ip.html` ×3 全部改寫；六頁補掛 `ds-components/checkbox.css`；`design-system.md` §4.96 Checkbox／§4.29 Payout dialog 與 `design-system.html` 對應卡片同步，Checkbox 卡新增「確認閘門」整句標籤示範。實測：捐贈與提款兩個彈窗的確認閘門仍是勾了才啟用主要行動，`manage-ip` 勾選與金額欄間距維持 14px（`mt-8` 8＋`.field` gap 6），深淺主題各驗一次）|
| Q65 | 區塊標題字級：Q21（2026-07-20）把 `.form-section__title` 由 18 壓到 14、與 `.field__label` 拉平，層級改由卡片邊界承擔。但一步之內有多張卡、卡內還有 `__subhead` 與欄位標籤時，三層字全是 14px | **`.form-section__title` `--fs-14`→`--fs-16`，部分推翻 Q21 第 1 點；全站套用、不做單頁特例**。`.form-section__subhead` 與 `.field__label` 維持 `--fs-14`——標題升上去之後，小標自然落在標題與欄位標籤之間，層級由「比標題小一階」＋上緣 hairline＋留白三者共同承擔（小標與欄位標籤仍同字級，靠 `--font-display` vs `--font-ui` 的字型差與 hairline 分辨）。**Q21 其餘四點不動**：`__sub` 11px 與色階、`field__hint` 色階、`kpi` 底色、頁寬變體 | 2026-08-11 | 使用者圈選建立活動的「活動形式」區塊標題裁示「這個層級的標題字都應該大一級」，經告知本項會推翻 Q21 且影響 21 個消費頁後，明確回覆「全站都要改，應該是從 DS 去改」。理由：Q21 的「靠卡片邊界承擔層級」在一張卡只有一組欄位時成立，但建立活動的場次那一步是三張卡、卡內還有小標與欄位標籤，掃過去分不出誰統轄誰——同一輪使用者已兩度回報「完全沒有階層」 | ✅ 已執行 2026-08-11（`form-section.css` 元件層一次生效；`design-system.md` Form section 條目與 `design-system.html` §4 小標卡同步；21 個消費頁抽驗 create-event／create-product／settings／earnings，深淺主題各一次，無換行破版或水平溢出）|

---

## 待裁決

> **Q43（返回鈕樣貌）已於 2026-08-02 當日裁決，見上方「已裁決」表。**

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

### Q67：控件的填色要不要跟著所在表面走（2026-08-13 提出，同日裁示「從 DS 和元件一起改」，已落地）

使用者圈選組合包彈窗裡的「＋ 新增權益」：「這個按鈕沒有照階層邏輯」。

**問題**：`.btn--outline` 的填色是**絕對色** `--card`。同一顆按鈕因此在三種表面上讀出三種層級關係——

| 所在表面 | 深色底色 | 按鈕填色 | 讀起來 |
|---|---|---|---|
| 頁面畫布 | `#0C0D0D` | `#212223` | 比底亮（對） |
| 卡片內 | `#212223` | `#212223` | **同色，填色等於不存在** |
| L2 分組面內 | ≈`#292A2B` | `#212223` | **比底暗，往下沉** |

這與 `.form-section--outlined` 放進卡（Q66）是同一類毛病：**在巢狀情境裡用絕對表面色**。

**裁決＝填色改成相對值**。新增 `--control-raise`：深色 `rgba(222,223,233,.04)`（疊在所在那一層上，固定亮一階）／亮色 `var(--card)`（維持白卡；亮色畫布是 `#FAFAFA`、卡是白，白填在畫布上有升起感，在白卡裡本來就交給邊框——**亮色行為完全不變**）。

`.btn--outline` 原本那句註解（2026-06-12）自己就寫著「a real border works on both white and gray grounds」——邊框接手之後，那個填色就只剩「在某一種表面上剛好對」的絕對值，本題把它收成相對值。

**同輪連帶（元件層）**：`.fc-add` / `.fc-add-item`（新增套組／新增商品／新增權益）改 `border-style: dashed`。站上「這裡還沒有東西、按了才長出來」一律是虛線框——`upload-tile` 的上傳格、`payout-modal` 的新增帳戶、`variant-builder` 的兩顆新增鈕（Q24 同輪改的）都是；這兩顆做的是同一件事，實線會讀成一般按鈕。

**複驗**：events／e-shop／earnings／settings／create-product／project-detail／publish-work／design-system 八頁掃過所有 `.btn--outline`，相對所在表面**最差 +7.6**（改之前在卡與 L2 裡是 0 與負值）；亮暗兩主題各驗一次。

證據：`ds-components/button.css` 的 `.btn--outline`（含 2026-06-12 的沿革註解）、`ds-components/_tokens.css` 的 `--control-raise`、`ds-components/bundle-editor.css` 的 `.fc-add`／`.fc-add-item`。

### Q66：巢狀分組往亮還是往暗（2026-08-13 提出，同日使用者裁示「一起做完」，已全站落地）

站上同一個視覺角色（「卡片裡的一段分組」）目前有**兩套方向相反**的答案，兩套各自都合 token 紀律，機械檢查抓不到：

- **往暗**：`--muted` `#161718`（`.card--muted`）與 `--surface-shell` `#1C1D1E`（`.form-section--outlined`，Q42）。`_tokens.css:612` 的註解直接寫「嵌套襯底：比卡深」。
- **往亮**：`--nest-surface` `rgba(222,223,233,.04)`（Q24 的 `.nest`）與 `demo-layer-system.html` 的 `--layer-2-surface`（同值，照 Figma `856:27798` 定的）。模型是「疊在誰身上就跟著誰亮一階」。

**觸發**：組合包彈窗把三張分卡放進 `.payout-dialog`（底色 `--card` `#212223`）時，`.form-section--outlined` 的 `--surface-shell` 比面板**更暗**，讀起來是往下沉一階。使用者圈選該區裁示：「依照 figma 修正階層的規則，每加一層的 section 顏色應該是越來越亮。」

**本輪暫依「往亮」**：`docs/bundle-popup-demo.html` 的 `.bdp-sec` 用 `--layer-2-surface`／`--layer-line`，只在該頁作用域內，`_tokens.css` 與既有元件零修改。

**裁決＝全站分組面往亮，且把 `--muted` 的角色收斂**（2026-08-13 使用者「一起做完」）。落地三件事：

1. **`.card--muted` 翻向**：`--muted`（比卡暗）→ `--nest-surface`（疊在卡上、比卡亮一階）。亮色兩層同為白，補一條 `--nest-line` 線框才分得出來（沿用 Q62「亮色分層改用陰影或線框」）。實測深色 host `#1C1D1E` → 子層 +7.8 亮度、亮色白底 + `rgba(16,17,20,.08)` 線框。
2. **新增 `--nest-line`**：深色 `transparent`（4% 薄膜已足夠，再加線會變成兩套分層語彙疊在一起）／亮色 `rgba(16,17,20,.08)`。
3. **`--muted` 角色收斂**：只服務**凹槽與襯底**——控件軌道（`.segmented`）、媒體井（圖片未載入的格子）、進度條底。這一類往下凹是對的，**不在翻向範圍**，所以 B 段那 5 頁的 segmented 不動。token 註解已改寫。

**Q42 未被推翻**：`.form-section--outlined` 仍用 `--surface-shell`。它是**頁面層**的分組，坐在畫布 `#0C0D0D` 上本來就比畫布亮、方向正確。改的是「卡／彈窗內的分組」這個不同的角色——規則見下一段。

**連帶規則（寫進 design-system Pillar 6）**：`.form-section--outlined` 是頁面層的分組，**不放進卡或彈窗**；卡／彈窗內的分組用往亮的那一層（`.bd-sec` 之於組合包彈窗、`.card--muted` 之於卡內分組、`.nest` 之於模式切換長出來的整層）。理由：outlined 吃的是絕對色 `--surface-shell`，比 `--card` 暗，一放進卡就往下沉一階。

**全站稽核（2026-08-13，53 頁逐頁量合成後亮度）**：報告在 `docs/階層稽核-2026-08-13.md`。結果——站上大致一致，同類問題只有 **2 處**（`publish-work.html` 的 `.form-section--outlined > .card--muted`、`auction-detail.html` 的 `.form-section--outlined > .ad-hero`，皆 `#161718` 坐在 `#1C1D1E` 上）；另有 **1 個隱患**——`.segmented` 的軌道也吃 `--muted`，但那是「控件凹槽」不是「分組面」，**Q66 若裁全站往亮，必須先把這兩個角色拆成兩個 token**，否則軌道跟著翻亮、滑塊就浮不起來（受影響：create-auction／projects／earnings 三族共 5 頁）。**目前 0 頁**把 `.form-section--outlined`／`.card--muted`／`.nest` 放進 `.card`／`.payout-dialog`／`.drawer`／`.detail-sheet`——組合包彈窗會是第一個，已在 demo 避開。

證據：`ds-components/_tokens.css:607`（`--card`）、`:612`（`--muted` 註解「比卡深」）、`:643`（`--nest-surface`）、`:676`（`--surface-shell`）、`demo-layer-system.html:33-37`、`ds-components/nest.css` 檔頭的兩層填色說明、`docs/bundle-popup-demo.html` 的 `.bdp-sec`、`docs/階層稽核-2026-08-13.md`。

### Q61～Q64：表面階層要不要收成一組帶級數的 token（2026-08-11 提出，待裁決）

Figma `856:27798`（layer0／layer1／layer2／layer3）把「表面層級」畫成一個通用模型：L0 畫布實色、L1 卡片實色、L2 半透明薄膜（疊在誰身上就跟著誰亮一階、可再疊）、L3 不再疊填色只留 1px 邊框。站上目前有**三套各自管一段的層級語彙**並存，沒有一套是通用的：

- 現況 A（離散實色階，Q15／Q42）：`--surface-page #0C0D0D` → `--muted #161718` → `--surface-shell`／`--sidebar #1C1D1E` → `--card #212223` → `--accent #2A2B2C`。管全站底色，但級數不在名字裡，要知道某塊是第幾層得先背五個顏色。
- 現況 B（E0–E4 陰影階，`design-system.md:596-608`）：只管陰影強度，不管底色。
- 現況 C（Nest 相對疊加，Q24）：`--nest-surface: rgba(222,223,233,.04)` ＋ `--shadow-nest-up`，值本來就是照這張 Figma 定的（`ds-components/_tokens.css:640-643` 註解直接寫「值與 Figma node 856:27796 相同」），但只服務 `.nest` 一個元件、只有一個消費頁。

**提案 demo：`demo-layer-system.html`**（本輪產出，`--layer-*` 只在該頁作用域內，未進 `_tokens.css`，其他頁面零影響）。四題如下，裁完才動 foundation：

- **Q61 命名**：**A** 新增 `--layer-0/1/2/3-surface`，級數寫在名字裡，看 token 就知道第幾層（代價：既有 `--nest-surface`／`.nest` 要改成指向新名字，過渡期兩個名字並存）；**B** 沿用 `--nest-surface`，只補文件說明它其實是通用的 L2（不新增 token，但「從 token 就看得出層級」只存在文件裡）。demo 示範 A。
- **Q62 亮色的 L2**（**2026-08-11 使用者裁示，已在 demo 落地**）：主色是黑夜，白天版**除了畫布與 L1 之外，其餘層一律留白，分層改用陰影或線框**。落地做法——`--layer-2-surface` 在亮色指向 `var(--card)`（白），新增 `--layer-2-edge`（`0 1px 3px rgba(16,17,20,.08)` 落影 ＋ `0 0 0 1px rgba(16,17,20,.05)` 環）承擔分離感；深色的 `--layer-2-edge` 為透明（深色靠底色分層，不需要）。原先考慮的「疊深色薄膜 `rgba(16,17,20,.03)`」作廢：白底疊灰膜會把卡片染灰，層數愈多愈髒。
- **Q63 hairline 要不要改成相對值**：**A** `--layer-line: rgba(222,223,233,.08)`，疊在卡上合成 ≈`#303133`，同一條線在任何父層上分離感一致（代價：比現行 `--border #373839` 淡一階，而該值是 2026-07-26 Q22 從三個候選裡挑定的，等於覆議）；**B** `--layer-line` 直接指向現行 `--border`，只換名字進層級系統。demo 示範 A。
- **Q64 遷移範圍**：本輪完全沒遷。`--card` 有 66 支元件消費、`--border` 78 支，全站遷移是另一件工程，而遷完才會真的收掉「三套層級語彙並存」。等 Q61～Q63 裁完再排。

建議：Q61 選 A（使用者本次的要求就是「從 token 就有區分」，B 達不到）、Q63 選 **B**（`--border` 的亮度是使用者自己從三個候選挑的，沒有理由在這一輪順手覆議；要改另開一題）。Q62 已裁示。裁決權在使用者。

證據：`ds-components/_tokens.css:605-643`（現況 C 的 `--nest-surface` 與 `--card`／`--muted`／`--accent`／`--border`）、`ds-components/_tokens.css:657`（`--sidebar`）、`ds-components/_tokens.css:676-677`（`--surface-shell`／`--surface-page`，現況 A 的其餘兩階）、`ds-components/_tokens.css:744-746`（`--shadow-nest-up`）、`ds-components/nest.css:1-44`（現況 C 的元件與「只有兩層填色」的既有結論）、`design-system.md:596-608`（E0–E4）、`design-system.md:3975-3997`（§4.53 Nest）、`demo-layer-system.html`（提案 demo）。

### Q60：直式上傳圖的元件與排版（2026-08-09 提出，同日使用者裁決，全站落地）

- 原本站上兩種做法：
  - **大格＋縮圖列**：主圖用 `--hero`（整列寬），附圖 4 格排在旁邊或下方（`.upload-showcase`／`.upload-grid`）。
  - **同尺寸列**：格子一樣大，靠角落標籤 `__flag` 分辨主圖（`.upload-assets`）。
- **裁決＝只留後者，而且只留一套**。使用者：「這個元件和這個排版規則套用到 r2.2 全部直的上傳圖。所以直的上傳圖只會用這一套元件，其他都刪除。」
- 正典＝`.upload-assets.upload-assets--fill`：`--upload-asset-cols`（預設 4）格撐滿一整列、第五格換行且尺寸相同，容器變寬變窄等比縮放（≤640px 降為兩格）；需要「填滿才長出下一格」時容器再加 `[data-upload-reveal]`。
- **退場**：`.upload-tile--hero`（連同 Q18 的圓角晶片圖示框）、`.upload-grid`／`--2x2`、`.upload-showcase`／`--stacked`。CSS 已刪、檔尾留墓碑。
- 仍服役、不在本題範圍：`--file`（檔案投放列）、`--16x9`（橫式媒體槽，project-detail 的 Demo 影片／音樂）。
- 本輪改到的頁：create-product、create-auction、create-bundle、bundle-detail、product-detail（含 IP 素材槽）、publish-work（封面與劇照）；原本就吃 `.upload-assets` 的 create-project／create-event(-legacy)／create-campaign／project-detail／series-detail／event-detail／`bundle-editor.js` 一律補 `--fill`。

證據：`ds-components/upload-tile.css`（`.upload-assets--fill` 與檔尾墓碑段）、`design-system.md` §4.15。

### Q59：已填的上傳格用綠色表達（2026-08-09 提出，同日依使用者裁示落地）

- 現況：`.upload-tile.is-filled` 是 `border-color: var(--status-success)` ＋ `color: var(--status-success)`，連 `.upload-tile__title` 也染綠。
- **裁決＝撤除綠色**。使用者圈選建立活動的圖庫格：「不該有綠色 border 這種元件。」
- 落地：改成中性 `border-style: solid` ＋ `--border` ＋ `--foreground` 文字。**已填與未填的差別改由「實線 vs 虛線邊框」承擔**——形狀差異本來就在，顏色是多的一層。
- 為什麼可以直接撤：`--status-success` 在站上的語意是「狀態結果」（付款成功、審核通過），「這一格填了圖」不是狀態、是內容有沒有；用綠色表達會讓真正的狀態綠變得廉價。十幾個消費頁逐頁確認過，沒有任何一頁是靠這個綠框當「已上傳」的唯一訊號。
- 影響範圍：`upload-tile.css` 的所有消費頁（media-vault／create-project／register-ip／product-detail／publish-work 等十幾頁）。

證據：`ds-components/upload-tile.css` 的 `.upload-tile.is-filled` 段落。

### Q58：站上出現兩種 disabled 欄位（2026-08-09 提出，同日依使用者裁示落地）

- 現況 A（`input.css` 的 `.input:disabled`）：`--muted` 填底＋`--foreground-muted` 字＋`opacity:.75`。全站基準，二十幾頁在吃。
- 現況 B（`field-source-tag.css` 的 `.is-source-locked`，2026-08-09 當天建立）：透明底＋最輕的墨色。起因是 A 的填底比卡片還深，坐在 `form-section` 上讀起來像「這裡壞了」。
- **裁決＝B，並上收成全站基準**。使用者圈選門票彈窗的唯讀「總價」欄位：「這個 disable 的 input 怎麼和剛才改的不同，整個元件庫應該都只能用同一個。」
- 落地：透明底那一組寫進 `input.css` 的 `.input:disabled`／`.textarea:disabled`／`.select:disabled`，`field-source-tag.css` 不再定義欄位鎖定樣式，只留來源標記與 `.is-source-locked .segmented__btn`（segmented 不是表單控件、吃不到 `:disabled`）。
- **連帶的語意決定**：來源鎖定欄位與其他 disabled 欄位長得一樣是刻意的——「這格為什麼不能改」由標籤旁的來源標記回答，不靠兩種灰去暗示。
- **已知代價**：值的墨色是 `--locked-field-ink`，對比刻意低於 WCAG AA（深色 2.69:1／亮色 2.20:1，見該 token 的文件）。全站 disabled 欄位一起套用了這個決定。

證據：`ds-components/input.css` 的 `:disabled` 段落、`ds-components/field-source-tag.css`、`ds-components/_tokens.css` 的 `--locked-field-ink`。

### Q57：「打字搜尋 → 下拉候選 → 選一個」站上有三套做法（2026-08-09 提出，同日依使用者裁示落地）

> **2026-08-09 裁決＝A（往 `combobox.css` 收斂）**。使用者裁示「樣式應該都要以原本的 DS 為主」，三題（Q55／Q56／Q57）一併裁成「頁面改用既有元件、不留頁內的平行做法」。落地：建立活動頁的 `.ce-pick*` 一組退場改用 `.combobox*`，已加入的商品列改用 `.chip.chip--removable`（combobox 自己表達已選項的方式）。**視覺因此改變**——候選項的名稱與價格由「左右分排」改成 combobox 的「name 在上、meta 在下」，已加入的商品由帶邊框的橫列改成可移除標籤。

建立活動正式化時盤點出來的唯一一處真正重複建設。同一個互動問題，站上現在有三個答案：

- 現況 A（`combobox.css`）：`.combobox__menu` 浮動選單＋`.combobox__opt`，focus 觸發、選項可帶 28px 圖示。
- 現況 B（`picker.css`）：`.picker__search` ＋ `.picker__list`，選項列借用 `.data-list__row`，是「面板內的挑選清單」而非浮層。
- 現況 C（建立活動頁內 `.ce-pick*`／`.ce-prod*`）：`.ce-pick__anchor` 定位＋`.ce-pick__menu` 浮層＋`.ce-pick__opt`，另有「已加入的列」`.ce-prod__row`。票種欄與「加入商品」兩處共用。
- 三者的 `z-index` 也不一致（A 是 30，C 是 60），全站沒有 z-index token 刻度，各浮層各自訂數字。
- 選項：**A** 往 `combobox.css` 收斂，C 的「已加入清單」另外抽成一支或併進 `chip.css`；**B** 往 `picker.css` 收斂；**C** 承認兩種語彙並存（浮層型 vs 面板型），把判準寫進 design-system Pillar 5，C 併入其中一支。
- 建議：A。C 與 A 的解剖幾乎一樣（浮層貼在輸入框下、一列一個選項），差別只在 C 多了「已加入的列」；B 是面板內清單，形狀本來就不同，不該硬併。裁決權在使用者。
- ~~現況處置：2026-08-09 正式化時 `.ce-pick*` 一組刻意留在 `create-event.html` 頁內、沒有 promote~~ **同日裁決後已退場**，見本題開頭。

證據：`ds-components/combobox.css:24`（`.combobox__menu`，z-index 30）、`ds-components/picker.css`（`.picker__search`／`.picker__list`）、`create-event.html` 頁內 `<style>` 的 `.ce-pick*`／`.ce-prod*` 段落。

### Q56：場次清單有兩套，欄位數不同（2026-08-09 提出，同日依使用者裁示落地）

> **2026-08-09 裁決＝B（併進既有 `session-list.css` 成為變體）**。同 Q57 的裁示。落地：`.ce-sess*` 退場改用 `.session-list*`；既有元件缺的兩樣東西往元件補——`.session-list__head`（欄位標題列）與 `.session-list--detailed`（多欄變體，含 `[data-multi]` 的兩種欄寬）。既有兩欄版行為不動，`create-event-legacy.html` 不受影響。鎖定態不再自造，改用 `field-source-tag.css` 已有的 `.is-source-locked`。

- 現況 A（`ds-components/session-list.css`）：兩欄版（日期＋場地），`create-event-legacy.html` 仍在消費。
- 現況 B（建立活動頁內 `.ce-sess*`）：四欄版（場次名＋日期＋起訖＋入場），另有 `[data-multi]` 變體再換一次欄寬、`.ce-sess.is-locked` 鎖定態、900px 以下收合。demo 期間的原註解就寫著「沿用 session-list 的節奏但欄位不同，所以另立一組，確認採用再合併」。
- 選項：**A** 把 `session-list.css` 擴充成支援可變欄位數（欄位定義交給消費頁的 grid-template 或 data 屬性），B 併進去；**B** 兩者並存成兩個變體（`.session-list` 單日版／`.session-list--detailed` 多欄版）；**C** 舊的兩欄版退場，全站只留多欄版（但 legacy 頁還在用它）。
- 建議：B。A 的「可變欄位數」會把欄寬決定權推回頁面、等於元件不再擁有版面；C 會動到 legacy 備份頁的呈現。裁決權在使用者。
- **現況處置**：`.ce-sess*` 已依裁決退場。`.ce-types*`／`.ce-tiergroup*`（票種定義列與門票的場次分組標題）**仍留在頁內**——站上沒有對應的既有元件可收斂，不在本次裁決範圍，日後若出現第二個消費者再 promote。

證據：`ds-components/session-list.css`、`create-event-legacy.html` 的 `session-list.css` 連結、`create-event.html` 頁內 `<style>` 的 `.ce-sess*`／`.ce-types*`／`.ce-tiergroup*` 段落。

### Q55：單選鈕有兩套實作（2026-08-09 提出，同日依使用者裁示落地）

> **2026-08-09 裁決＝C（`zradio` 退場，改用既有 `radio-list`）**。同 Q57 的裁示：站上已經有的元件說了算。落地：當天上午才 promote 進 `checkbox.css` 的 `.zradio*` 同日移除、留 tombstone；建立活動購票規則的三組選項改用 `.radio-list__item`／`__dot`／`__text`，選取改由 JS 切 `--active`（radio-list 沒有原生 `<input type="radio">`）。**代價已知並接受**：這些選項因此不具原生表單語意與鍵盤 radio 行為；原型階段沒有真的送出表單，接真後端時要一併檢討。

- 現況 A（`ds-components/radio-list.css`）：2026-07-21 建的「輕量單選列」，按鈕列＋JS 切換 active class，**沒有原生 `<input type="radio">`**，指示器是畫出來的圓點（已選 8px 實心橘）。
- 現況 B（`.zradio*`，2026-08-09 隨建立活動正式化 promote 進 `ds-components/checkbox.css`）：真正的原生 radio 疊在畫出來的圓點下面，點擊、鍵盤、表單語意全部原生，只換視覺。做法與同檔的 `.zcheck` 完全一致（`__control` 16px、`__dot::after` 8px 都與 A 的數值相同）。
- 選項：**A** 承認兩種語彙並存——`radio-list` 用於「選了就切換檢視」的輕量選單列、`zradio` 用於表單裡真的要送出的選項，把判準寫進 design-system Pillar 4；**B** `radio-list` 改成以 `zradio` 為底重寫，全站只留一套；**C** 反過來，`zradio` 退場改用 `radio-list`。
- 建議：A。兩者的差別在語意（一個是檢視切換、一個是表單資料），視覺數值本來就已經一致。C 不可行——購票規則那些選項要進表單，需要原生語意。裁決權在使用者。

證據：`ds-components/radio-list.css:78-79`（已選 8px 圓點）、`ds-components/checkbox.css` 的 `.zcheck` 與新增的 `.zradio` 段落。

### Q54：一個 form-section 裡要再分組時，沒有「小標」這一級（2026-08-08 提出，待裁決）

Q21（2026-07-20）把區段標題與欄位標籤都拉平成 `--fs-14`、層級改由卡片邊界承擔。這在「一張卡＝一組欄位」時成立，但**建立活動 demo** 出現一張卡裡有三組東西（場次的日期時間／場地細節／每一場的人數），Q21 沒有為這個中間層留下任何表達方式。

- 現況 A（區段標題）：`.form-section__title`——`--font-display`／`--fs-14`／`--type-title-24-tracking`。
- 現況 B（欄位標籤）：`.form-section .field__label`（`ds-components/form-section.css:90`）——`--font-ui`／`--fs-14`／regular。Q21 刻意與 A 同字級。
- 缺口：A 與 B 之間沒有東西。demo 裡試過兩種都錯——掛 `.field__label` 再壓暗成 `--foreground-muted`，變成比它統轄的欄位標籤還小聲；改成 `--fs-13`，又比 `--fs-14` 的欄位標籤更小。兩次都把階層做反。
- demo 暫用的做法（頁內 `.ce-subhead`，`docs/create-event-demo.html`）：**字型字級完全比照 `.form-section__title`，層級靠邊界承擔**——上方一條 `1px solid var(--border-soft)` hairline（與 `.form-section + .form-section` 的分隔線同一支）＋加大留白。這是把 Q21 的原則（邊界，不是字級）往下再用一層，不新增第四種字級。第三層（例如「每一場的人數」統轄最少／最多兩欄）沿用 `.field__label`，只多給上方留白（`.ce-grouplabel`）。
- 選項：**A** 採納 demo 的做法，promote 成 `form-section.css` 的 `.form-section__subhead`（＋第三層 `.form-section__grouplabel`），寫進 design-system Pillar 4；**B** 不承認這一級，改要求「一張卡只放一組」——把場次拆成三張 outlined 卡；**C** 為這一級開一個新字級（例如 display／`--fs-16`），等於部分推翻 Q21 的拉平。
- 建議：A。B 會讓建立流程的卡片數量膨脹（場次一步就從一張變三張，而它們是同一件事的三個部分）；C 動到已裁決的 Q21，代價最大。裁決權在使用者。

**2026-08-09 現況更新**：demo 升為正式頁（`create-event.html`）時，這一級**暫依上面的建議 A 落地**——`.ce-subhead`／`.ce-grouplabel` 已 promote 成 `ds-components/form-section.css` 的 `.form-section__subhead`／`.form-section__grouplabel`。這是「暫依最新確認的做法並標註題號」，不是裁決；使用者若裁 B 或 C，回退範圍就是這兩個 class 與建立活動頁的三處消費點。

證據：`ds-components/form-section.css:70-90`（Q21 的拉平：title 14 / label 14）、`ds-components/form-section.css` 的 `.form-section__subhead` 段落、`create-event.html`（三處消費點）。

### Q46：清單分段的做法出現第二種——群組標題在上 vs 有字的分隔線在下（2026-08-04 提出，待裁決）

「把一張清單切成兩段、並說明每段是什麼」，站上現在有兩個答案：

- 現況 A（群組標題在上）：`.src-status__group`（`ds-components/source-status.css:99-106`）——`--fs-12`、`--foreground`、標題坐在該組**上方**，讀者由標題往下讀該組。2026-08-01 資料來源面板的分組（UIA-099）用這個。
- 現況 B（有字的分隔線在下）：`.product-list__divider`（`ds-components/product-list.css`，2026-08-04 PIN-001）——`--fs-12`、`--muted-foreground`、線坐在釘選區**下方**、句子寫「以上釘選並顯示在商店最前」，右端常駐 `n/10` 計數。
- 為什麼 B 沒有直接沿用 A：這條線同時是**拖曳落點**（跨過它就改變釘選狀態，`.is-drop-target`／`.is-full` 兩個回饋態掛在它身上），它必須是「兩段之間的那條界線」而不是某一段的標題；而且第二段（未釘選的其餘商品）沒有名字可下標題——它就是「其餘」，硬給一個「其他商品」標題只是製造冗詞。
- 選項：**A** 兩處都改成群組標題在上（釘選區加一條「釘選」標題，落點提示另尋他法）；**B** 維持兩種並存，但寫清楚判準——「純分組用標題在上、界線本身可互動時用分隔線在下」；**C** 兩處都改成分隔線在下。
- 建議：B。這兩件事差在功能：A 的分組是唯讀資訊，B 的線是可以被拖過去的邊界。與其強行統一，不如把判準寫進 design-system.md Pillar 5，讓下一個要分段的人知道該挑哪一種。裁決權在使用者。

證據：`ds-components/source-status.css:99-106`（群組標題在上）、`ds-components/product-list.css`（`.product-list__divider` 段落，分隔線在下＋兩個拖曳回饋態）、`e-shop.html`（三個分頁各一條 `[data-eshop-pin-divider]`）。

### Q51：「買得到的最低粉絲分級」有兩種控制項（2026-08-04 提出，待裁決）

建立活動的票種規則新增「限粉絲分級」條件之後，同一個問題（誰買得到）在站上出現第二種控制項。

- 現況 A（既有，清單列）：階梯式 ⋮ 下拉——`.dropdown__menu--ladder` ＋ `.dropdown__item--choice`，每一級是一顆分級徽章＋該級累計人數，點任一級＝門檻設在那一級（`e-shop.html:345` 起，每列一份；元件見 `ds-components/dropdown-menu.css` 的 `--ladder` 段）。
- 現況 B（本輪新增，表單欄位）：原生 `<select class="select">` 四個選項（核心圈以上／超級粉絲以上／上榜粉絲以上／全部粉絲），由 `js/zselect.js` 自動升級（`create-event.html` 的 `condHTML`）。
- 差異來自所在版面：A 坐在清單列上、要在一個很窄的格子裡同時給出「選了什麼」與「這樣有多少人買得到」；B 坐在表單裡，站上表單的 1-of-N 一律是 select。**B 少了 A 的人數資訊**——那正是幫創作者判斷門檻鬆緊的依據。
- 選項：**A** 表單也改用階梯下拉（要處理它在窄卡裡的寬度與 280px 票種卡內的可用性）；**B** 維持兩種，並在 design-system.md 寫明「清單列用階梯、表單用 select」的判準；**C** 兩邊都用 select，階梯下拉退場（會失去人數資訊，且推翻 2026-07-31 才落地的單擊門檻模型）。
- 建議：B——兩者的差異是版面決定的，不是隨意分岔；但 select 版少掉的人數資訊要不要補（例如選項後面掛「988 人」），值得一併裁決。

證據：`e-shop.html:345`（階梯下拉）、`ds-components/dropdown-menu.css` 的 `.dropdown__menu--ladder`、`create-event.html` 的 `condHTML`（select 版）。

### Q48：建立流程裡「可編輯卡」的收合態動作，站上出現兩種做法（2026-08-04 提出，待裁決）

建立活動的票種卡（`ds-components/ticket-tier-card.css`，2026-08-04 新建）落地時發現，站上已經有一種同角色的做法——「建立流程裡 JS 產生的可編輯卡清單，收合時要能編輯與刪除」。

- 現況 A（既有，套組／方案卡）：兩個 `.card__link` 文字連結「編輯」「移除」並排在卡片標題列右側（`js/bundle-editor.js:641-644`）。
- 現況 B（本輪新增，票種卡）：標題列右側只留 ⋮（`.dropdown` 選單，內含複製票種／移除票種），`Edit` 是**卡底的整寬鈕**（`.tier-card__edit`）（`create-event.html` 的 `tierCardHTML`）。〔**2026-08-04 同日更新**：原本 Edit 與 ⋮ 並排在標題列，當天依 Beamco Artist Portal v3 的票種卡版型（Figma `0gWC6dR1yzdEu0g1LqvRvJ` node 1904-82978）改成現在這樣——卡改窄之後標題列塞不下兩個控制項，而「改這張卡」是常做的事、值得整條可點的寬度。差異因此從「文字連結 vs 鈕＋選單」變成「標題列兩個文字連結 vs 卡底整寬鈕＋標題列 ⋮」，本題要裁決的事不變。〕
- B 不是自由選的：規格 5.1.6.1 F9.2 明寫「提供 Edit 進入編輯；右上 ⋮ 為該卡更多操作——複製票種／移除票種」，複製這個動作在 A 的兩個文字連結裡沒有位置。所以兩者的差異一部分來自需求（票種要複製、套組不用），一部分是純粹的呈現選擇（文字連結 vs 鈕＋選單）。
- 選項：**A** 兩者都改成 ⋮ 選單（動作多寡不同時版面不會走樣，套組卡的「編輯」仍留在外面）；**B** 兩者都改成文字連結，票種的複製擠進去或改放編輯態；**C** 維持現況，把判準寫成「動作 ≤ 2 用文字連結、≥ 3 用 ⋮」並記進 design-system.md。
- 建議：C——先把既有的兩種寫成一條可套用的判準，比強制統一便宜；真的要統一時再依判準挑一邊。裁決權在使用者。

證據：`js/bundle-editor.js:641-644`（文字連結版）、`ds-components/ticket-tier-card.css`（`.tier-card__actions`）、`documents/5.1.6.1-建立活動流程.md` F9.2。

### Q47：欄位末端的清空 ✕，站上只有票種卡有（2026-08-04 提出，待裁決）

票種卡依規格 5.1.6.1 F9.2「每欄末端 ✕ 可清空該欄」做了 `.tier-card__control` ＋ `.tier-card__clear`，這是站上第一個、也是目前唯一一個帶清空鈕的文字輸入欄——其餘所有 `.input` 都要使用者自己全選刪除。

- 現況 A（全站絕大多數）：裸 `.input`，沒有清空的可見入口。
- 現況 B（票種卡）：輸入框右端疊一顆 ✕，有值才出現（`ds-components/ticket-tier-card.css` 的 `.tier-card__control[data-empty="true"] .tier-card__clear`）。
- 這個差異來自規格對票種卡的逐欄描述（來源是截圖），不是站上先有的設計語彙。留著會變成「同一種文字欄位有兩種操作方式」，拔掉則違反規格明文。
- 選項：**A** 升級成 `field-system` 層的通用能力（任何 `.field` 都可 opt-in 清空鈕），與 Q36 的欄位級錯誤提示一起處理；**B** 維持只有票種卡有，並在 design-system.md 標明這是規格點名的例外；**C** 拔掉，回報上游規格這一項與站上輸入語彙不一致。
- 建議：B——先當成規格點名的局部例外，等出現第二個需求再升級成通用能力；現在就升級等於為單一消費者動 field-system。裁決權在使用者。

證據：`ds-components/ticket-tier-card.css`（`.tier-card__clear`）、`documents/5.1.6.1-建立活動流程.md` F9.2、`ds-components/input.css`（無任何清空 affordance）。

### Q45：預購的方案步驟沒有右軌，共創的兩個步驟都有（2026-08-03 提出，待裁決）

`create-project.html` 建立流程新增預購方案步驟（D166，規格 §5.3.2 F28／F29）後，同一種「填一組套組卡」的版面在共創與預購之間出現了差異：

- 現況 A（共創）：`data-panel="funding"`（`create-project.html:391`）與 `data-panel="tiers"`（`create-project.html:564`）兩個步驟都掛 `class="hidden wizard-split"`，各自有一支 `wizard-split__rail`（`#fd-overview`／`#bd-overview`）即時算出名額分帳、目標覆蓋率等摘要。
- 現況 B（預購）：`data-panel="tiers-pre"`（`create-project.html:661`）只掛 `class="hidden"`，沒有 `wizard-split`、沒有右軌——頁內註解明寫原因（`create-project.html:659-660`）：「共創的右軌算的是名額分帳與目標覆蓋率，兩者在預購都不存在，留一個永遠是『—』的側欄比沒有更糟」。
- 這個差異是**內容決定的**，不是遺漏——預購沒有分潤名額（`shares:false`）、沒有名額池可以分帳，右軌原本承載的兩個數字在預購語境下都不成立。但站在使用者角度，「共創兩步都是左右兩欄、預購這步忽然變成單欄滿版」仍是同一種步驟版面在流程中途切換，值得記錄以免之後被誤認成遺漏。
- 選項：**A** 維持現況（預購不裝右軌，單欄滿版）；**B** 預購步驟也套 `wizard-split`，右軌換成別的內容（例如方案數與下限的靜態說明，取代原本的即時算式），視覺對稱優先；**C** 共創的右軌也收起來，兩型統一單欄，右軌內容改成頁內摘要卡。
- 建議：A——右軌的價值在於「即時反映輸入」，預購沒有任何輸入會產生可即時計算的分帳或覆蓋率數字，硬裝一個右軌只是為了視覺對稱、內容不成立會比沒有更誤導。但版面在流程中途忽然收成單欄，是否需要在步驟切換時加一點視覺過渡或說明，裁決權在使用者。

證據：`create-project.html:391`（`funding` 面板 `wizard-split`）、`create-project.html:564`（`tiers` 面板 `wizard-split`）、`create-project.html:568`（`#bd-overview` 右軌）、`create-project.html:661`（`tiers-pre` 面板無 `wizard-split`）、`create-project.html:659-660`（頁內註解說明不裝右軌的理由）。

### Q43：IP 卡／IP hero 兩個顯示框仍是 3:4，不等於直式標準（2026-07-31 提出，2026-08-05 因 D176 改比例而縮小範圍，待裁決）

Q39 顯示端續作把清單縮圖與卡片封面收斂成單一直式 `--img-portrait` 之後，站上還留著「看起來也是直式、但比例數值不同」的顯示框，尚未被收斂觸及——它們是 Q30／Q31 分別裁決過的既有結論，本題不擅自覆蓋那兩則裁決，只記錄新標準出現後產生的不一致。

**2026-08-05 更新（D176 把標準由 0.806 改成 2:3 ≈ 0.667）**：原本三個互不相等的數字，現在少了一個——下方現況 B 的 `.pd-hero__cover` 本來就是 `2/3`，新標準採用 2:3 之後，它與標準值**數值上完全相等**，原先記在 (c) 的裁切落差自動消失。矛盾範圍因此從「三個數字」縮成「兩個」：3:4（現況 A）對上 2:3（標準）。

- 現況 A（`3/4` ＝ 0.75）：`.ip-hero__cover`（`shared.css:1234`，IP 詳情頁封面，Q31 裁決範圍）、`.ipm-card__cover`（`shared.css:1256`，IP Market 上架卡封面，Q30 裁決範圍）。**仍與標準不等**。
- 現況 B（`2/3`）：`.pd-hero__cover`（`shared.css:1364`，商品詳情頁 hero，GoFundMe 預覽 wireframe 版型，2026-07-24 起用於取代 `.ip-hero`）。**2026-08-05 起與標準等值**，但 CSS 仍寫死字面值 `2 / 3`、沒有讀 `--img-portrait`——目前長得一樣純屬巧合，下次再調標準就會無聲分岔。是否改讀 token 屬本題待裁決範圍，未經使用者確認不擅自改。
- 現況 C（`--img-portrait` ＝ `2 / 3`）：收斂的 7 支清單縮圖／卡片封面元件（見 `design-system.md` Pillar 4），以及全站上傳槽本身（Q39）。
- 待確認：(a) 現況 A 的兩支是否也該併入 `--img-portrait`，統一全站「直式顯示框」只剩一個數字；(b) 若維持獨立比例，是否需要在 design-system.md 明確標註「這兩支刻意不吃 Q39 標準」以避免之後又被誤認成待收斂的遺漏；(c) 現況 B 既然已與標準等值，是否直接改讀 `--img-portrait`，把「巧合相等」轉成「保證相等」。
- 本題僅記錄矛盾與證據，不選邊；裁決權在使用者。


### Q36：欄位級「超標」錯誤提示，站上只有 component-scoped 版本，沒有 DS 級通用版（2026-07-30 提出，待裁決）

套組編輯器這輪新增「填超過上限不默默截掉、hint 轉紅」的模式，落地時發現這其實是第二次做同一件事——站上已經有一個幾乎一樣的既有做法，兩者都是「疊在 `.field__hint` 上、超標時變 `--status-error`」，但各自是元件自己的 class，沒有共用的 DS 級修飾。

- 現況 A（既有）：`.fc-slotnote--over`（`ds-components/bundle-editor.css:221`，行號隨 2026-07-30 CSS 重排更新）——名額分帳超賣時的提示轉紅，2026-07-13 前後就存在。
- 現況 B（本輪新增）：`.field__hint.fc-hint--over`（`ds-components/bundle-editor.css:223-230`，行號隨 2026-07-30 CSS 重排更新）——套組優惠填超過可折抵上限時的提示轉紅，特意寫成 `.field__hint.fc-hint--over`（0,2,0 權重）才能疊過同檔案之後載入的 `field-system.css`。
- 兩者色值相同（都吃 `--status-error`），差別只在 class 命名與掛載對象（一個是獨立 `.fc-slotnote`、一個疊在通用 `.field__hint` 上），且都只存在於 `bundle-editor.css`，不是 field-system 本身的一部分。
- 選項與取捨：**A** 維持現況，兩者都是 component-scoped、不升級，未來每個元件自己需要就各刻一個（成本：往後每多一個「這格超標」場景就會重複同一段 CSS）；**B** 把 `.fc-hint--over` 升級成 field-system 層的通用修飾（例如 `.field__hint--error`，定義在 `field-system.css`），`bundle-editor.css` 兩個既有 class 都改吃它，之後任何欄位要表達「超過上限」都有現成答案（成本：要重新測試 field-system 的載入順序與既有消費者不受影響）；**C** 只統一命名、不搬家（兩個 class 改同名但仍留在 `bundle-editor.css`，不升級成 DS 級）。
- 建議：B——欄位級錯誤提示是任何表單都可能需要的通用需求，不應該是套組編輯器的專屬能力；但涉及 field-system.css 載入順序與既有 8 處以上消費頁，屬於需要使用者確認才動的範圍。
- **2026-08-04 追加第三份同構實作**：`.field__hint.tier-card__err`（`ds-components/ticket-tier-card.css`，票種卡的欄位級驗證訊息）用的是與現況 B 完全相同的配方——同樣疊在 `.field__hint` 上、同樣 `--status-error`、同樣寫成兩個 class 提高權重。本輪不擅自升級成 DS 級（那是本題要裁決的事），只登記證據：這已經是第三次為同一件事各刻一份 CSS，選項 B 的成本理由又多一個消費者。

### Q35：原價刪除線有兩種做法，字級不同（2026-07-30 提出，待裁決）

套組編輯器這輪為收合摘要列新增「有折扣時原價劃線」的視覺，落地時發現站上已經有同一個視覺角色的既有做法，兩者字級不同、各自獨立定義，沒有共用一個 token 或 class。

- 現況 A（既有）：`.cb-basestrike`（`create-bundle.html:56`、`bundle-detail.html:44`，兩處逐字重複定義）——`font-size: var(--fs-13); color: var(--muted-foreground); text-decoration: line-through;`。用於建立組合／組合細節頁的折後價格對照。
- 現況 B（本輪新增）：`.fc-sum__was`（`ds-components/bundle-editor.css:91-96`，行號隨 2026-07-30 CSS 重排更新）——`font-size: var(--fs-12); color: var(--muted-foreground); text-decoration: line-through; margin-right: var(--sp-6);`。用於套組編輯器收合摘要列的原價對照。
- 兩者角色完全相同（「劃掉的原價，緊接在折後價之前」），色階相同（`--muted-foreground`），差別只有字級（13 vs 12）與 B 多一個 `margin-right`（A 沒有這個需求是因為它在按鈕式的價格列裡、天生有間距）。`.cb-basestrike` 目前是**頁內複本**（同一段 CSS 在兩個頁面各自貼一份），不是共用元件層的一部分；`.fc-sum__was` 是本輪直接 promote 進 `ds-components/bundle-editor.css` 的元件層 class。
- 選項與取捨：**A** 統一成 13px（`.fc-sum__was` 改吃 `--fs-13`，理由是先出現、且已在兩頁使用）；**B** 統一成 12px（`.cb-basestrike` 改吃 `--fs-12`，理由是收合摘要列字級本來就比一般內文小一階，`.fc-sum__meta` 也是 `--fs-12`，跟着同列鄰居對齊比跟着別頁對齊更合理）；**C** 兩者維持現況不同字級，但把 `.cb-basestrike` 的頁內複本 promote 成共用元件（例如新增 `.price-strike` 或直接讓兩處都吃同一個 class 但保留字級參數化）。
- 建議：B——`.fc-sum__was` 所在的收合摘要列（`.fc-sum`）本身字級體系是 12px 起跳（`.fc-sum__meta`、`.fc-bundle__index` 皆 12px），劃線原價應該跟着同一列的其他文字對齊，而不是套用另一頁的字級；同時建議順手把 `.cb-basestrike` 的頁內重複定義 promote 進元件層，消掉兩處逐字複製的 CSS。裁決權在使用者，本輪暫不動這兩處既有 CSS，只記錄矛盾。

### Q26：清單頁工作列的主軸分頁有兩種寫法（2026-07-26 提出，同日依使用者裁示落地）

四個清單頁的 `.list-toolbar` 主軸分頁都是同一個元件 `.tabs.tabs--underline-short`，但兩個修飾 class 只有 projects 有：

- `tabs--underline-label`（active 底線只等標籤寬、不含計數）
- `tabs--count-plain`（計數不用 pill、改 `--muted-foreground` 純文字）

結果 my-ip、events 有計數但底線會延伸到數字下方、計數還是深色藥丸，跟 projects 差一截；e-shop 沒有計數但底線寬度算法也不同。使用者：「所有頁面有這種設計的都要用一樣的元件……和電子商店的差別只在於沒有計數，其他都應該一樣。」

**裁決（A）**：`.list-toolbar` 裡的主軸分頁一律寫成
`class="tabs tabs--underline-short tabs--underline-label tabs--count-plain"`，四頁一致。e-shop 沒有計數，`--count-plain` 在那裡不影響外觀，仍照寫以保持同一組配方、之後要加計數也不必再改 class。

已落地：my-ip.html:54、events.html:119、e-shop.html:309 補上兩個修飾（projects 原本就有）。DS 文件（`design-system.md` §Tabs 與 `design-system.html` 的 Tabs demo）已改寫成「這是 list-toolbar 的標準配方」，不再寫成「Projects 專用的 opt-in」。

**注意**：`tabs--underline-label` 需要標籤包在子元素裡。標籤是 `<button>` 直接文字的分頁（product-detail、admin-platform-fees）**不在此範圍**，維持整條 item 底線——那些不是 list-toolbar。

### Q25：次層篩選列有三份同構實作（2026-07-26 提出，待裁決）

同一個視覺角色「工作列下方那排狀態／類型篩選 pill」，站上有三個 class 名、樣式規則完全一樣（`display:flex; align-items:center; gap:12px; flex-wrap:wrap`）：

- `.list-status-row` — 共用元件，`ds-components/list-toolbar.css:74`；消費頁：projects、my-ip、e-shop、events
- `.ord-status-row` — 頁內複本，`orders.html:29`
- `.pk-status-row` — 頁內複本，`pickup.html:39`

2026-07-26 使用者要求「篩選列到清單的間距加大」時，共用元件改一處即涵蓋四頁，兩個頁內複本得各自再改一次（`.ord-list-controls`／`.pk-list-controls` 的 `margin-bottom`）——這就是分岔的成本。

- **A（建議）**：orders／pickup 改用 `.list-status-row`，刪掉兩份頁內複本與各自的外層 margin。需一併確認上排到篩選列的間距（元件是 `margin-top: --sp-16`，兩頁現在是 topbar 的 `margin-bottom: 8px`）。
- **B**：維持現狀，接受三處各改。

暫依現狀（B），本輪只同步了間距值。

### Q23：卡片邊界在建立流程出現兩種答案（2026-07-21 提出，已依使用者裁示落地，登記備查；**上層問題已於 2026-07-26 由 Q32 裁決 C 解決，全站統一陰影版**）

建立流程是左右兩欄並排，兩欄的盒子用了兩種邊界做法：

- 左欄 `form-section--outlined`：填色＋`--shadow-card`＋`--shadow-edge-top`、**無邊框**（Q14 去邊框、Q18 加陰影）。
- 右欄 `.preview-col` 內的 `.preview-card` 與 `.card`：填色＋**1px `--border`**、無陰影（Q3 卡片用邊框）。

兩者各自都合規，機械檢查抓不到，但並排時一眼看得出不一致（使用者 2026-07-21 指出「上架設定的外框不應該有線，和左邊的 section 一致」）。

**處置**：已把 `.preview-col` 內的卡對齊左欄（`border:0` ＋ 同一組陰影），scope 限預覽欄，全站其他 `.card` 維持 Q3 不動。實際受影響＝**4 頁共 7 個盒子**：create-product／create-bundle／create-auction 各 2（預覽卡＋上架設定卡）、create-campaign 1（僅預覽卡，該頁預覽欄沒有第二張卡）。

**留待裁決的是更上層的問題**：Q3（卡片＝邊框）與 Q14／Q18（區塊卡＝陰影無邊框）本質上是同一個視覺角色的兩種答案，目前靠「哪個元件」而非「什麼角色」區分，所以每次有新的並排情境就要再開一次例外（這已經是第二次）。選項：**A** 維持現況（逐案 scope，累積例外）；**B** 定義判準——「內容容器用陰影無邊框、資料列表容器用邊框」之類，寫進 design-system.md 讓後續有規則可循；**C** 全站統一成一種。裁決權在使用者。

### Q22：收合式 radio-list 的圓角，與 Q16「控制項維持 6px」相衝（2026-07-21 提出，待裁決）

Figma node 856-22782 把上架設定畫成收合式：外框 1px 邊、圓角 18，內部觸發列與選項列的圓角也跟著放大到 18（見展開態 hover 在「立刻上架」那列的角度）。站上既有規則是 Q16——卡片／面板級放大到 16（`--radius-xl`），**控制項（button／input／badge／segmented／field-pill）與清單列維持 6**。radio-list 的列在角色上比較接近「清單列」，照 Q16 應該留 6。

- 證據 A（Figma）：外框與列皆 18，收合式整體讀起來像一張小卡片而非一排控制項。
- 證據 B（Q16 裁決）：`STYLE-DECISIONS.md:29`，控制項與清單列明列為「維持 6px」。
- 現況：`ds-components/radio-list.css` 的 `.radio-list--collapsible` 外框與內部列都取 `--radius-xl`(16)，**暫依 Figma**，標 Q22。

選項：**A** 維持現況（外框與列都 16，把「收合式選擇器」視為卡片級容器，等於為 Q16 開一個具名例外）；**B** 外框 16、內部列回 6（容器是卡片、列還是控制項）；**C** 整組回 6（嚴格守 Q16，與 Figma 有落差）。裁決權在使用者。

**2026-07-21 追加證據，方向偏向 A**：使用者當日另外指名「多規格選項列的圓角都要再大一點」，該組列（`.option-set__row`／`.option-set__add`／`.variant-option`，含優先權較高的 `.option-set .variant-option`）因此由 6 放大到 `--radius-xl`(16)；同日新增的 `.control-group`（開關＋揭示表單的外框）也取 16。也就是說「表單內的成組列」這個角色，使用者連續三次都選了大圓角。若最終裁 A，Q16 的「控制項／清單列維持 6px」需改寫成「**單獨的控制項**維持 6px；**成組的設定列**（收合式選擇器、選項列、control-group）用 16」，並把判準寫進 design-system.md，而不是留成一串個案例外。

### Q17：1-of-N 選擇器的分工（2026-07-17 提出，待裁決）

站上互斥單選（1-of-N）現有三支元件，各自合 token、機械檢查抓不到分岔，但概念上都是「從幾個選項挑一個」：

- **selection-card**（`ds-components/selection-card.css`）：grid 大卡，title＋sub（＋可選 icon／swatch），已選＝橘 outline。用於顯眼的主選擇（商品型別、組合 edition、主題）。證據：`create-auction.html` 種類卡。
- **radio-card**（`ds-components/radio-card.css`）：2-up 並排卡，建在 segmented 上，已選＝橘點。用於表單內二選一（單一/多規格、不限量/限量、取貨方式）。證據：`create-product.html` variant/edition/delivery。
- **radio-list**（`ds-components/radio-list.css`，2026-07-17 新增）：垂直輕量列，radio 點＋標題＋可選描述，已選＝填橘點、無卡框。用於窄欄的資料選擇（上架設定）。**2026-07-24 使用者指定建立專案的專案類型對齊深色直列選單，新增 `--menu` 圖示面板變體；仍是資料選擇，不擴及 access／發布等其他卡式選項。**證據：三創建頁預覽欄＋兩細節頁＋create-project 專案類型。

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

> **2026-07-27：已裁決 A（反轉 2026-07-13 的 B），詳見上方「已裁決」表 Q8 列。以下現況快照停留在 2026-07-13，僅供對照當時的分歧，不再反映站上實況。**
> 反轉後「現況 B」那一組（`.app-sidebar__link`／`.app-sidebar__sub-link`／`.chip--active`／`.segmented__btn--active`／預設 `.filter-tabs__item--active`）已全部併入 A。

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
- `tier-settings.html:44-51`（頁內 `<style>` 自訂的 `.gate-field__label`）→ 12px、**大寫（`text-transform: uppercase`）**、字距 0.3px，用在「Top %」「Min. loyalty points」「Early access (days)」「Merch discount (%)」等欄位名稱
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
