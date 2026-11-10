> 本檔是 [design-system.md](../design-system.md) 的 Pillar 5，入口與對照表在那裡。

## Pillar 5 · Pattern

> Cross-component behavior conventions. Per DSS v1.4: layout patterns / voice / accessibility / interaction states / data viz live here, NOT in Component (which only defines per-component variants/states).

### 定義與分區（2026-11-09）

- **Pattern**：為了完成某一類使用者任務，把幾個元件組在一起的固定做法。它回答五件事：什麼情況用、用哪些元件、怎麼排、怎麼互動、邊界狀況怎麼處理。pattern 本身沒有樣式檔；需要樣式的部分屬於元件（Pillar 4）。
- **Pattern 變體**：同一套做法在不同情境下的固定分支，寫在同一張卡的「變體」（例：多步驟精靈的整頁、整頁＋右側預覽、蓋在頁面上）。
- **Pattern 實例**：某個功能照某張 pattern 做出來的具體頁面，在卡片底部的「實例」列名稱與連結；畫面細節屬於該頁的 `BUILD-SPEC.md` 與產品規格。
- **不是 pattern 的東西**：單一元件（Pillar 4）；頁面骨架、網格與模板（Pillar 6）；產品規則，例如「付款資訊要在確認步驟重述」屬於 `documents/`，pattern 只說要在哪裡、用什麼方式呈現。
- **Pillar 5 分兩區**：「組裝做法」＝5.1 的 pattern 卡；「全站通則」＝5.2 文案語氣、5.3 狀態與互動、5.4 資料視覺化。原本的 5.5 流程清單已併進 5.1.5 的實例。

**做頁面或新樣式時怎麼用**：先看產品規格 → 找 pattern（元件有多種用途時先看它的類型總卡判斷是哪一類，例如 5.1.8 彈窗類型；都不像先檢討分類；有就照做；大致適用但要不同分支就加變體，不改原 pattern——只有所有實例都該跟著改時才改原 pattern 並同步每個實例；沒有的話，會重複用才建新 pattern，只有這一頁就記進 `BUILD-SPEC.md`）→ 找元件（用現成；差一點加變體；只有一頁用就留在頁面；都沒有才建新元件）→ 把這頁加進用到的 pattern 卡「實例」。

### 5.1 Pattern cards

Best-practice assembly recipes — how components combine to meet a creator's goal. A Pattern is not a component (Pillar 4) and not a wireframe (the page implementation). Each card has five grids: `trigger` (when to use) / `must` (≥2 non-negotiables) / `should` (advisable) / `must-not` (anti-patterns) / `_edge-cases` (empty / error / new-user / mobile / offline)，加兩個選填欄：`變體`（同一做法的固定分支）與 `實例`（照它做的頁面）。 Four categories, twelve cards（頁面級 5 張＋中間層 4 張，2026-07-08；2026-07-20 新增 Detail + persistent rail，共十張；2026-09-08 新增 Destructive confirm，共十一張；2026-11-09 起陸續新增彈窗、抽屜與清單、卡片、輸入、選擇控件、狀態標記五張類型總卡，共十九張）。Component sections demo the unit only — assembly rules live here（判準見 §4.0）。

**html 對照（本輪拆頁）** — `design-system.html` 這輪把原本擠在一張表格裡的十張卡拆成十個獨立小節，每個都掛了可跳轉的錨點、並用真元件渲染出組合實例＋「實際使用頁」連結；下方每張卡的標題都補上編號與對應錨點 id，方便對照。html 端的 Trigger／Must 是精簡過的展示文案，語意與下方全文版一致，不是另一套規則。

| # | Pattern | html 錨點 |
|---|---|---|
| 5.1.1 | Dashboard home | `#pattern-dashboard` |
| 5.1.2 | Tabbed section view | `#pattern-tabbed` |
| 5.1.3 | Filter + list | `#pattern-filter-list` |
| 5.1.4 | Lifecycle states | `#pattern-lifecycle` |
| 5.1.5 | Multi-step wizard | `#pattern-wizard` |
| 5.1.6 | Form assembly | `#pattern-form-assembly` |
| 5.1.7 | Settings page | `#pattern-settings` |
| 5.1.8 | Modal types 彈窗類型 | `#pattern-modal` |
| 5.1.9 | Split preview | `#pattern-split-preview` |
| 5.1.10 | Detail + persistent rail | `#pattern-detail-rail` |
| 5.1.11 | Destructive confirm | `#pattern-destructive-confirm` |
| 5.1.12 | Export confirm | `#pattern-export-confirm` |
| 5.1.13 | Pre-publish preview | `#pattern-prepublish` |
| 5.1.14 | Drawer types 抽屜類型 | `#pattern-drawer` |
| 5.1.15 | List types 清單類型 | `#pattern-list-types` |
| 5.1.16 | Card types 卡片類型 | `#pattern-card-types` |
| 5.1.17 | Input types 輸入類型 | `#pattern-input-types` |
| 5.1.18 | Selection types 選擇控件類型 | `#pattern-selection-types` |
| 5.1.19 | Status types 狀態標記類型 | `#pattern-status-types` |

#### 5.1.1 Dashboard home (Layout) · `#pattern-dashboard`

- **trigger**: The landing surface after login — the creator needs a one-glance read of money, alerts, and what to do next.
- **must**: Lead with the full-bleed Hero band, then a KPI bento row (earnings / pending / fans / live items) using `KPI` (headline metric carried by display size, not colour); pair an `Alert` panel ("Actions needed") beside a `Data list` of recent earnings; every money figure states its state (available vs pending) inline.
- **should**: Follow with a trend `Chart` + source breakdown pair; keep orange for one structural accent per viewport (hero fill OR a single highlight tile, not both competing).
- **must-not**: Never stack two orange highlight tiles side by side; never show a bare number without its currency + state; never push primary actions below the fold.
- **_edge-cases**: `empty` → first-run hero with "Create your first project" CTA, KPI tiles show `—` not `0`; `error` → KPI tile shows last-known value + a stale badge; `new-user` → checklist card replaces the trend pair; `mobile` → bento collapses to span-12 single column; `offline` → KPI tiles dim, banner "Showing last synced data".

#### 5.1.2 Tabbed section view (Layout) · `#pattern-tabbed`

- **trigger**: One entity has parallel sub-views of the same dataset (Earnings: Overview / Transactions / Payouts / Tax · E-Shop: Products / Bundles / Auctions · Projects status · Fans views).
- **must**: Use `Tabs` with one active panel; sync the active tab to the URL hash so a view is deep-linkable; each panel opens with its own KPI row scoped to that view.
- **should**: Keep filters (single-select `.filter-tabs`, multi-select `.chip-group` — Q154) and export/primary actions in a sticky sub-header inside the panel; preserve scroll position per tab.
- **must-not**: Never load all panels' data eagerly; never let a tab switch silently drop an in-progress filter without telling the user.
- **_edge-cases**: `empty` → panel shows an `Empty stub` scoped to that tab; `error` → inline `Alert --row` at panel top, other tabs still usable; `new-user` → default to the most-actionable tab (Overview); `mobile` → tabs become a horizontally scrollable strip; `offline` → disable Export, keep read views.

#### 5.1.3 Filter + list (Interaction) · `#pattern-filter-list`

- **trigger**: A long, filterable record set the creator scans and acts on (Earnings transactions, payouts, products, fans).
- **must**: Single-select `Chip` group drives a `Data list` (row-divider, not card-per-row); the active filter and result count are always visible; clearing all filters returns to the full set.
- **should**: Make filtering client-side-instant where the set is loaded; offer a Manual entry / Export affordance at the list header.
- **must-not**: Never apply a filter without updating the visible count; never hide the "active filter" state so a user mistakes a filtered list for the whole.
- **_edge-cases**: `empty` (no records) → `Empty stub` with the relevant create action; `error` → keep the filter bar, show retry in the list body; `new-user` → seed with a sample row + dismissible hint; `mobile` → filters collapse into a sheet; `offline` → freeze the set, disable mutating actions.
- **2026-11-09 起**：本卡是 5.1.15 清單類型第 1 類「管理清單」的篩選規則。篩選控件改照 Q154——單選看筆數用 `.filter-tabs`、可複選用 `.chip-group`（上面 must 寫的「Single-select `Chip` group」以 Q154 為準）；列預設不可點（Q166）；篩選要真的改變清單（Q169）。見 5.1.15、5.1.18 T4。

#### 5.1.4 Lifecycle states (Lifecycle / State) · `#pattern-lifecycle`

- **trigger**: Any data region that can be empty, loading, or failing — applies to every list, KPI, chart, and panel.
- **must**: Define all three of **Empty / Loading / Error** for the region; Empty uses the `Empty stub` with a single clear next action; Error uses `Alert --row` with a retry and never blanks already-loaded data.
- **should**: Use skeleton placeholders that match the final layout for Loading; distinguish "empty because new" (onboarding tone) from "empty because filtered" (clear-filter tone).
- **must-not**: Never show a spinner with no layout context; never replace a transient error with a full-page wipe; never use a toast as the only error signal.
- **_edge-cases**: `empty` → see Empty copy in §5.2; `error` → preserve last-known values + stale marker; `new-user` → onboarding-flavored empty; `mobile` → empty illustration scales down, copy stays; `offline` → dedicated "No connection" empty distinct from "No data".

#### 5.1.5 Multi-step wizard (Workflow) · `#pattern-wizard`

- **trigger**: A create flow with 3–4 dependent steps — 建立一件東西、步驟彼此相依（見下方實例）。
- **must**: Use the `wizard-focus` template (no main topbar) with a centered `stepper`, `Selection card` grids for branching choices, and a sticky bottom action bar (Back / Save draft / Next); save a draft at every step so progress is never lost.
- **should**: Show a Review step before commit that restates money / royalty / IP-rental disclosures; disable Next until the step's required fields validate (on-blur).
- **must-not**: Never trap the user (always offer Save draft + exit); never advance past a step with unresolved financial or licensing disclosures; never reset earlier steps when navigating back.
- **_edge-cases**: `empty` → step 1 prefilled with sensible defaults; `error` → validation inline on the offending field, stepper marks the step; `new-user` → first step carries a one-line explainer; `mobile` → stepper condenses to "Step 2 of 4", action bar stays sticky; `offline` → draft saves locally, banner "Will sync when back online".
- **變體**：
  - **整頁**：獨立頁面，沒有預覽欄（建立專案）。
  - **整頁＋右側預覽**：右欄放粉絲端預覽，見 5.1.9 Split preview（建立商品、建立活動、建立組合包）。
  - **蓋在頁面上**：精靈外框以全畫面覆蓋開在原頁上，關掉回原頁（新增庫房）。
  - **單頁分步**：同一張表單分成幾步顯示、不拆成幾頁；其他步驟的區段收起，欄位值、即時預覽與就緒檢查都讀同一張表單（建立商品、建立組合包的「設定 → 上架設定 → 預覽與發布」；元件 [Form steps](./4-component.md) §4.241）。
- **實例**：建立專案 `create-project.html`（4 步：About → Showcase → Monetization → Review，送出前揭露 IP 租用）· 建立活動 `create-event.html`（規格 5.1.6.1 的 7 步：入口閘門（活動類型與 bookyay 帶入）→ 基本資料 → 場次 → 票種與票務 → 票務商品（選用）→ 發布設定 → 預覽與發布）· 建立商品 `create-product.html`（4 步，主要／次要分類分開記）· 建立組合包 `create-bundle.html` · 新增庫房（`media-vault.html` 內開啟，3 步：取名 → 放內容 → 誰開得了）。

#### 5.1.6 Form assembly (Workflow) · `#pattern-form-assembly`

- **trigger**: Any create / edit form — wizard steps, settings forms, create-product / -event / -project sections.
- **must**: Every field is a `Field`（label + optional hint + exactly one control slot; the control reuses an atom — Input / Switch / Segmented / textarea）; group fields into `Form section`s（title + grey sub; sibling sections auto-divide via the component's own `+` rule; base gap 6 / field spacing 16）；side-by-side fields use `Form grid`, never hand-rolled columns. **Section 切分＝一個 section 一個決定**（2026-09-01 自 create-product 抽取）：切區依「創作者要做的決定」不依欄位型別——價格與折扣是兩個決定就是兩個 section，庫存與逐規格表分開；判別句：「這個 section 的標題能不能一句話回答『這區在決定什麼』」。**條件分支控顯隱、不重排**：跨型分支（實體／數位／多規格）用 `data-*-show` 控 section 顯隱，section 順序恆定、絕不為分支建第二份表單；間距規則跨越 `[hidden]`（`~` 規則）。**Section 內分層階梯固定四級**：`__head`（title 必有）→ `__subhead`（僅當同一決定下有兩群欄位）→ `form-grid`／`field` → `nest`（卡中卡，僅補充性子塊）——用不到的層級跳過，不得自創第五級。**改變路由的動作**（如類型切換）放第一個 section 的 `__head--actions` 右端，不混進表單體。 建立流程的 `.wizard__sheet--sectioned` 使用 `--surface-page` 作底；`.form-section--outlined` 以 `--card` 填色形成區塊（亮暗一致；dark 原用 `--muted`、2026-07-17 midnight 改 `--card`）（**無外框線**，Q14），所有可見 outlined siblings 以 `--sp-24` 間隔並跨越 `[hidden]`。採用頁為 create-product／-auction／-bundle／-event／-project／register-ip／admin-ip-bank-entry。
- **should**: **Section 順序照商品的生命敘事**（create-product 的驗證序，其他建立流程沿用、依產品語意跳過不適用的環節）：識別（它是什麼）→ 呈現（素材）→ 交付物（內容檔案）→ 售賣條件（規格 → 價格 → 折扣 → 庫存）→ 履約（交付／取貨）→ 購買規則（限購）→ 發現（標籤、關聯）→ 保障（結帳與保障）；**上架這類「看著成品才做的決定」放右欄預覽卡下方**（split-preview 頁型，見 5.1.9），不排進左欄敘事。Section 的 `__sub` 只在需要說服或解釋規則時出現（素材、取貨有；價格、標題不用）。Order fields identity → content → settings → risk disclosures; put character counts as right-aligned `field__hint--count`（form-section scope）; keep one sticky action bar per form for save / next.
- **must-not**: Never hand-roll a label/hint stack outside `.field`; never nest a second heading system inside a section; never mix card-wrapped and no-card sections in the same flow.
- **_edge-cases**: `empty` → fields show placeholders, never pre-filled fake data; `error` → inline validation on the field, section stays open; `new-user` → first section carries a one-line explainer; `mobile` → `Form grid` collapses to single column; `offline` → draft-save locally（同 wizard）.

- **實例**：create-product／-auction／-bundle／-event／-project／register-ip／admin-ip-bank-entry（見 must）· 影片上架欄位（Work fields §4.123：同一組十五個欄位用在共創後上架、建立項目直接發佈影片、作品上架後編輯三處，由 `partials/work-fields.js` 產生）。

#### 5.1.7 Settings page (Layout) · `#pattern-settings`

- **trigger**: A page of read-mostly toggles and account values（Settings 主頁、店鋪設定、通知設定）.
- **must**: Group destinations with `Settings nav`; each group renders as a card of stacked `Settings row`s（last row no divider — owned by the component）; each row's right slot holds exactly one control（Switch / value text / Badge）.
- **should**: Per-row instant apply **or** one card-level save — pick one per card; risky rows（刪除、停用）isolate at the bottom in their own card.
- **must-not**: Never mix instant-apply and save-button rows in the same card; never put two controls in one row's right slot; never bury a destructive action mid-list.
- **_edge-cases**: `empty` → hide the group, not an empty card; `error` → row-level inline `Alert --row`; `new-user` → defaults pre-selected, no forced tour; `mobile` → nav collapses above the cards; `offline` → toggles disabled with a stale banner.
- **2026-11-09 起（Q164）**：設定頁的分段一律「設定列」——`.settings-section`＋列與分隔線，**不包卡**（上面 must 寫的「each group renders as a card」以 Q164 為準）；儲存方式（逐列即時或整段儲存）另看 Q138（仍待裁決）。設定列右欄的開關照 5.1.18 T1，生效時機跟著本頁（Q151）；設定列裡的分頁或篩選照 Q154。見 5.1.16 卡片類型（C 表單區段）。

#### 5.1.8 Modal types 彈窗類型 (Interaction) · `#pattern-modal`

2026-11-09 由「Modal shell」改成彈窗的類型總卡（依同日全站普查：138 個浮層，見 `docs/彈窗普查-2026-11-09.md`）。彈窗分兩層：**元件層**是外殼本身（§4.61 Modal shell：`.payout-modal`／`.payout-dialog` 頭身腳、遮罩、寬度修飾類）；**本卡**規定彈窗有哪些類型、每一類放什麼、按鈕怎麼排、用哪個寬度。

- **trigger**: 任何打斷目前頁面、要使用者完成一件事的浮層。
- **怎麼用**：
  1. 先判斷需求是下表哪一類，照那一類的寬度、內容順序與按鈕做。
  2. 都不像時，先檢討分類本身要不要改（加一類、拆一類或改定義），寫進本卡並更新實例；不要硬塞進最接近的一類，也不要在頁面另寫一種。
  3. 類型確定後，元件（§4.61）做不出來，才改元件（例如加寬度修飾類）。
- **類型**：

| 類型 | 使用者在做什麼 | 外殼與寬度 | 內容順序 | 按鈕 | 實例 |
|---|---|---|---|---|---|
| 1 填寫送出 | 填一張小表單後送出 | 預設 620px（欄位多、要並排時用 `--wide` 880px） | 標題 → 欄位（Field system）→ 必要的費用或影響摘要 | 取消＋主動作（動詞，例「申請撥款」） | 申請撥款、補貨、補登收入、建立優惠碼、群發訊息、建立商品後發文、上傳資料檔、費率例外 |
| 2 確認後執行 | 確認一個可以復原的動作 | `--narrow` 460px | 做什麼 → 會發生什麼（可列出受影響項目） | 取消＋一般主鈕 `.btn--primary`；不用紅色（Q144） | 下架、封存、重新上架、登入語言確認 |
| 3 破壞性確認 | 確認一個收不回來的動作 | `--narrow` 460px | 見 5.1.11 四段 | 取消＋紅色確認鈕（與入口同級） | 見 5.1.11 |
| 4 匯出 | 確認筆數後下載檔案 | 預設 620px | 見 5.1.12 | 取消＋「匯出 N 筆」 | 見 5.1.12 |
| 5 挑選 | 從清單裡選一個或多個 | `--wide` 880px；清單只有一欄勾選（例：標籤）時用預設 620px | 搜尋／篩選 → 清單 → 已選數量 | 取消＋「加入（N）」 | 加入組合物、選商品、選作品 |
| 6 看細節 | 唯讀看一筆資料的完整內容 | 沒有細節頁、只是一筆資料時用彈窗（預設或 `--wide`）；有完整細節頁用 5.1.14 第 1 類整頁細節覆蓋；要邊看清單邊比對用 5.1.14 第 4 類（Q143） | 標題（是哪一筆）→ 唯讀欄位（KV list）→ 明細 | 只有關閉；要動作時放頁尾 | 交易明細、粉絲紀錄、核銷紀錄 |
| 7 提示告知 | 只需要知道（被擋下的原因、說明） | `--narrow` 460px | 發生什麼 → 為什麼 → 怎麼處理 | 一顆「知道了」；可附「前往處理」 | 發布被擋、條件說明 |
| 8 離開未存 | 有未存的變更要離開 | Leave dialog（§4.77） | 有哪些變更沒存 | 繼續編輯＋捨棄 | 建立與編輯流程 |
| 9 選擇做法 | 二選一決定流程往哪走 | 預設 620px | 問句 → 選擇卡（Selection card） | 選了就前進，或取消 | 要怎麼建這些門票 |
| 10 開另一頁 | 在原頁上開另一個頁面 | Embed modal 全畫面 | iframe 內容 | 關閉 | 商店設定、預覽 |
| 11 整頁工作區 | 一整個功能裝進浮層 | 全畫面浮層：`--xwide` 1180px（與 Embed modal 同上限） | 依功能 | 依功能 | 粉絲分級設定、媒體庫彈窗版、組合包編輯器、票務設定、受眾報告完整清單（欄位多的大表）、翻譯表（`drawer --full`，Publish stage 內） |

- **must**（所有類型共通）: Reuse the single canonical dialog chrome（`.payout-dialog` head / body / foot, `payout-modal.css`）+ backdrop + `is-modal-open` scroll-lock；寬度只用 `--narrow`（460）／預設（620）／`--wide`（880）／`--xwide`（1180），跟著類型走，不寫行內寬度（Q142）。「確認後執行」「破壞性確認」「提示告知」三類一律用 `.payout-dialog --narrow`；Leave dialog 只給「離開未存」（Q141）。
- **should**: Focus-trap inside the dialog; primary action right-aligned in the foot; body reuses Field / Data-list / KV list rather than bespoke layouts.
- **must-not**: 不用瀏覽器原生 `confirm()`／`alert()`；never roll a new modal chrome per feature; never stack two modals; never let backdrop-click discard unsaved money input without confirm；可以復原的動作不用紅色確認鈕（Q144）。
- **_edge-cases**: `empty` → open with sensible defaults; `error` → inline `Alert --row` inside the body, dialog stays open; `new-user` → helper line under the title; `mobile` → dialog goes full-width bottom-sheet-like; `offline` → submit disabled with reason.
- **待收斂與不收的**（2026-11-09 普查後處理完）：原生 confirm／alert、Leave dialog 借殼、寬度不符、匯出確認、無入口彈窗都已收斂；重複實作收成共用的有：分級說明 2 份（`partials/tier-explains.js`）、規格圖片 2 份（`partials/variant-image-modal.js`）、收入去向與項目收入明細 3 頁（`partials/earnings-modals.js`）；建立組合包的舊版挑選窗已沒有入口（只剩新版），舊 markup 暫留當新版的商品候選資料來源（待重構）。**刻意不收**：建立優惠碼三份（平台、商店、商品頁快速建立）分屬三個情境、欄位不同，合併等於改產品規則；收入「版稅來源／全部內容／內容詳情」在主收入頁與 Sony 示範頁只差示範資料。仍待規格：收入「貼文報表」的 Export .xlsx。

#### 5.1.9 Split preview (Layout) · `#pattern-split-preview`

- **trigger**: Editing where the creator needs a live fan-side view — create-product / create-auction preview, e-shop "See as fan", store settings.
- **must**: A right `Preview column` / `Preview panel` **compresses** the main column（no scrim, not an overlay — the form stays interactive）; entry point is "See as fan" / auto in create flows; closing restores the main width; the card inside reuses `Preview card`（`.is-empty` placeholders for unfilled fields）.
- **should**: Keep the preview sticky while the form scrolls; re-render on field input, not on save.
- **must-not**: Never make the preview a modal that blocks editing; never let preview content drift from form state; never fake data in the preview（用 `.is-empty` 占位）.
- **_edge-cases**: `empty` → preview shows the placeholder card; `error` → preview keeps last valid render; `new-user` → preview visible by default in create flows; `mobile` → preview collapses behind a toggle; `offline` → preview still renders（純前端）.

#### 5.1.10 Detail + persistent rail (Layout) · `#pattern-detail-rail`

- **trigger**: An entity page where editing is split across tabs, but a handful of read-only facts must never leave view — product detail (stock on hand, delivery method, linked project); any future detail page with the same shape.
- **must**: Wrap the page in `.page.page--narrow`（1056px 窄版容器，§6.1——1280 的預設寬度配上 300px 右欄會讓左欄行長過長）; use the `Detail rail` shell (§4.52) — editable `Tabs` inside `.detail-main`, `.detail-rail` on the right holding **read-only** `Form section` cards built from `KV list` (§4.50) / `Stock bar` (§4.51) / `KPI`. The rail answers "what do I need to know before I change something", so it carries constraints and consequences, never the fields being edited. Every rail card must make sense from **every** tab — anything meaningful in only one tab belongs in that panel instead.
- **should**: Cap the rail at 3–4 cards（會捲動的右欄就不再是常駐）; order them by how often they block a decision (stock before provenance); pair every bar or meter with its exact figure（見 §4.51）; keep rail cards short enough that the head's tightened `--sp-12` spacing reads as deliberate.
- **must-not**: Never put a primary action or the only entry point to a task in the rail — below 1100px it falls in under the main column and stops being visible alongside the content; never make a rail value editable in place（可編輯就該回到主欄的 `.field`）; never add per-card margins inside the rail（間距由 `.detail-rail` 的 `gap` 擁有，見 §4.52 Notes）。
- **_edge-cases**: `empty` → a rail card with no data shows an em-dash value, never disappears (a vanishing card changes the page's shape between tabs); `error` → the card keeps its last-known value with a stale marker rather than blanking; `new-user` → rail renders with placeholder values so the layout is learnable from the first visit; `mobile` → single column, rail after main, so nothing in it may be the only route to a task; `offline` → rail values dim and carry a "last synced" note.

#### 5.1.11 Destructive confirm (Interaction) · `#pattern-destructive-confirm`

2026-09-08 建，第一個消費者是訂單詳情的「作廢品項」（`order-detail.html` 的 `#od-void-modal`）。站上原本每個破壞性動作各自處置（刪除商品、刪草稿都在頁內註「確認流程待規格」、原型暫用原生 `confirm()`），這張卡把做法定下來：**沒有新的 modal CSS——它是5.1.8 彈窗類型的共用外殼（§4.61）加上 `.btn--destructive` 的組裝規則**，所以規則寫在 Pattern、不寫成元件。

- **trigger**: 一個按下去就收不回來的動作——作廢明細、刪除商品／草稿／活動、停用帳號。可逆的動作（存草稿、下架、切換顯示）不走這張卡，直接做完給 toast。
- **must**: 入口用 `.btn--ghost.btn--destructive`（紅字、不搶焦點），確認那一顆才是 `.btn--destructive`（透明底＋紅框紅字，Q37 2026-08-06 裁決）；彈窗重用 canonical 對話框殼（`.payout-modal` ／ `.payout-dialog` 頭／身／腳）；內容順序固定四段——**動到哪一項**（具體名稱與數量，不只說「這個項目」）→ **前置條件**（要先在別的系統做完什麼，例如「請先在 Stripe 完成人工退款」）→ **會發生什麼**（逐條列後果：憑證失效、庫存回補、寄信給誰）→ **不可逆**；完成後給 toast 說出實際發生了什麼，不是只說「成功」。
- **should**: 停用的入口按鈕保留在畫面上並用 `title` 說明為什麼不能按（不可作廢、沒有權限），不要直接隱藏——看不到的按鈕會被讀成「這個功能不存在」；後果條目照「使用者最在意的」排序（買家會收到什麼放最後一條，因為那是唯一會傳出去的動作）。
- **must-not**: 不可用原生 `confirm()`；不可把後果寫成一句籠統的「此操作無法復原」就了事；不可讓確認鈕成為整個彈窗唯一的視覺焦點以外的東西（不要同時放兩顆紅的）；不可在確認前就先改畫面狀態。
- **2026-10-15 補（目視檢查 C1，STYLE-DECISIONS Q134）**：確認鈕不得比入口弱——入口是 `.btn--ghost.btn--destructive` 時確認鈕照上面用 `.btn--destructive`（紅框）；入口已是淡紅底 `.btn--soft.btn--destructive`（Q 2026-09-11 清單列每列一顆的撤銷、訂單詳情頁首的整單撤銷）時，確認鈕用同一款淡紅底（同級）。**前置條件與不可逆兩段改用 `Alert --row`**（前置＝`--warning`、不可逆＝`--error`，放在原因欄上方），不再是兩行灰色 hint——它們是警告、不是說明。前置條件不適用時整條收起（例：免費訂單〔金額 0、不經金流〕不出現 Stripe 退款提醒）。首個消費者：`order-detail.html` `#od-void-modal`（單品與整單同一個視窗）。
- **2026-10-15 全站套用（Q134）**：活動詳情的共用確認視窗（`event-detail.html` `openConfirm()`，`danger:true`）所有破壞性動作的確認鈕一律 `.btn--soft.btn--destructive`——撤銷全部剩餘票券、撤銷單張票、移除場次、捨棄變更（取消活動於 2026-10-20 D457 退場；下架可以復原，2026-11-09 起改用一般確認鈕，Q144）。同一個視窗服務多個入口，確認鈕取最強入口那一級（撤銷全部剩餘票券的淡紅底），任何入口都不會比它重。自帶視窗、入口是紅框、ghost、選單項或圖示鈕的頁面（刪除商品、刪除草稿、刪除 IP 等）維持紅框確認鈕：與入口同級，符合本規則。
- **_edge-cases**: `empty` → 沒有可作廢對象時不開窗，入口本來就該停用；`error` → 失敗時彈窗留著、body 內用 `Alert --row` 說明，不要關窗吞掉；`new-user` → 不需要導覽，四段內容本身就是說明；`mobile` → 對話框滿寬，兩顆動作維持右對齊；`offline` → 確認鈕停用並說明原因。

#### 5.1.12 Export confirm (Interaction) · `#pattern-export-confirm`

2026-10-15 建（D416），第一批消費者是訂單管理的「匯出」（`orders.html`）與活動詳情交易明細的「匯出交易」（`event-detail.html`）。**沒有新的 modal CSS**——它是5.1.8 彈窗類型的共用外殼（§4.61）加上 `.zcheck`，由 `js/csv-export.js` 的 `ztorCsv.confirm()` 在第一次開啟時建立、整頁共用；CSV 本體由 `ztorCsv.build()` 在瀏覽器端產生並以 `ztorCsv.download()` 下載。

- **trigger**: 創作者已篩好一份清單、要把它拿成檔案——訂單管理、活動交易明細。檔案照目前的篩選結果，所以下載前先講會有幾筆。
- **must**: 重用 canonical 對話框殼（`.payout-modal`／`.payout-dialog--narrow`）；內容順序固定——**筆數**（「將匯出 N 筆訂單（照目前的篩選結果）」）→ 選填的個資核取框（`.zcheck`）與一行說明 → 腳（取消＝`.btn--ghost`、匯出＝`.btn--primary`）；核取框每次開窗都回到不勾，個資預設不外流；零筆時匯出鈕停用並講明沒有可匯出的內容。
- **should**: 檔名寫成「內容_活動名稱（交易明細才有）_起訖日期｜全部.csv」，依介面語言；表頭與列舉值（類型、狀態、付款方式）一樣走 i18n（`csv.*`）；金額純數字、無貨幣符號與千分位；沒有個資選項的匯出用一行說明講明（「收件資料不在這份匯出裡」），不放停用的核取框；匯出完給 toast 回報筆數。
- **must-not**: 不可從工具列按鈕直接下載；不可預設勾選個資核取框；不可用 `0` 代替「不適用」（空白才是沒有值）；不可在視窗裡另寫一套筆數算式——筆數取自頁面目前的篩選結果。
- **_edge-cases**: `empty` → 零筆時不能匯出；`error` → 原型不會失敗；真實版產檔失敗時視窗留著、body 內用 `Alert --row` 說明；`new-user` → 不需導覽；`mobile` → 對話框滿寬、兩顆動作右對齊；`offline` → 匯出鈕停用並說明。
- **匯出之後（2026-10-15 · D424 決定 3、4）**：按下匯出 → 視窗關閉 → 右下角 toast「匯出中…（N 筆）」（§4.107 `.ztor-toasts--corner`＋`--busy`）→ 約 1 秒後同一則原地轉「匯出完成 · N 筆訂單」並觸發下載，同一刻寫一筆**匯出紀錄**。統一走 `ztorCsv.run({ scope, name, count, filters, make })`，頁面不自己 setTimeout／download。背景產生的筆數門檻不另訂（D424 決定 3）。
- **匯出紀錄**：匯出鈕旁一顆次要按鈕（`.btn--ghost`＋`history` icon，「匯出紀錄」），開 canonical 對話框殼列出紀錄（`ztorCsv.openLog({ scope, title })`）——一筆一列 `.data-list__row`：標題＝檔名；第一行小字＝時間 · 誰（創作者本人＝名稱 · 創作者；Admin 代管＝Admin · 代管 名稱）；第二行＝篩選條件 · 筆數。新的在上、沒有紀錄時一句空狀態。創作者與 Admin 都看得到（D424 決定 4）；原型存 localStorage（`ztor.export.log`，重新整理保留）。篩選條件存結構（標籤 key＋值 key），顯示時才翻譯。
- **must-not（追加）**：匯出中提示不可放底部中央（會擋住清單）；完成不可另開第二則 toast；紀錄不可只記檔名——誰、何時、篩選條件、筆數缺一不可。
- **2026-10-28 改版（使用者：「匯出紀錄可以在這（匯出視窗）查看，工具列就不用放」，先想 UX 再做 UI；UI-CHANGES 三百七十七）**：工具列的「匯出紀錄」鈕退場（訂單管理、活動詳情交易明細兩處），紀錄改列在匯出視窗下半部。視窗由 `--narrow` 回到預設 620px。body 兩塊（`ds-components/export-dialog.css`）：
  - `.export-summary`：大字筆數（`__num`，`--fs-28` 數字字型）＋單位，下一行「照目前的篩選結果：{篩選條件}」——篩選條件用匯出紀錄同一種寫法（`filterText`），按匯出前不必回頭看清單上方開了哪些篩選。
  - `.export-history`（版本閘 O42 關閉時整塊不出現）：上緣一道 `--border-soft` 細線和上半部分開；標題＋一句說明；最近 3 筆 `.data-list__row`，多於 3 筆時「顯示全部 N 筆」就地展開／收回；和這次篩選相同的紀錄右側 `.badge--neutral`「同樣的篩選」（比對時不看「收件資料」那一項——它是匯出選項、不是篩選），讓人按匯出前就看得到剛剛是不是已經匯過同一份。沒有紀錄時一句「還沒有匯出過，這次匯出後會記在這裡」。
  - 主鈕寫筆數「匯出 N 筆」（零筆時停用、寫「匯出」）。`ztorCsv.confirm()` 多收 `scope`、`filters`；`openLog()` 已於 2026-11-09 退場（全庫無呼叫者）。

#### 5.1.13 Pre-publish preview (Workflow) · `#pattern-prepublish`

2026-11-09 建（分類巡檢：四張粉絲頁卡與 Publish stage 其實是同一套做法）。D310 起「發布前看一次」是全頁畫面，不是浮層。

- **trigger**: 要對粉絲公開的東西（活動、商品、組合包、專案、作品）建立或改完、送出之前，讓創作者看一次粉絲端長什麼樣，順便檢查各語系的內容；發布後回頭改語系或內容時也用同一個畫面。
- **must**: 頁面骨架用 Publish stage（§4.216）：左邊是前台鏡像（Fan page mirror §4.215，前台頁的 1:1 鏡像、資料來自建立流程），右邊是 sticky 控制側欄——語言（每個語系標狀態，可還原自動翻譯、可開逐欄位對照）＋發布前檢核（每項可點回該步驟）或未儲存的變更摘要；主鈕在側欄底部，按下就發布，不再問第二次；滑到預覽的某一塊浮出「編輯」，跳回擁有那塊內容的步驟。
- **should**: 預覽只用創作者幣別（D514）；預覽區的購買類按鈕保持不動作。
- **must-not**: 不用浮層做這一步（舊的 Publish preview 彈窗 §4.130 已退場）；`fan-shop.css` 只給前台鏡像用，不得被其他頁引用；不在預覽裡另做一套跟前台不同的版面。
- **變體**：
  - **精靈最後一步**（mode `publish`）：多步驟建立流程的最後一步「預覽與發布」，例如建立活動的最後一步（規格第 7 步）。
  - **發布後的獨立頁**（mode `save`）：「預覽與在地化」，主鈕換成「儲存」。
- **實例**：建立活動 `create-event.html` · 建立商品 `create-product.html` · 建立組合包 `create-bundle.html` · 建立專案 `create-project.html` · 作品上架 `publish-work.html` · 活動的預覽與在地化 `event-localization.html` · 商品的預覽與在地化 `product-localization.html`。
- **跟 5.1.9 Split preview 的分工**：Split preview 是編輯時的即時預覽欄（唯讀摘要）；本做法是送出前的最後確認，側欄是可操作的控制台。

#### 5.1.14 Drawer types 抽屜類型 (Interaction) · `#pattern-drawer`

2026-11-09 建，依同日抽屜普查（25 個側邊或底部面板，見 `docs/抽屜普查-2026-11-09.md`）。比照 5.1.8 彈窗類型：**元件層**是外殼（§Drawer：`.drawer` 頭／身／頁尾、480／`--wide` 880／`--full`；§Detail sheet；Scanner 的底部 sheet），**本卡**定有哪些類型、每類放什麼、按鈕放哪。

- **trigger**: 從側邊或底部滑出、不離開目前頁面的面板。
- **怎麼用**：先判斷是下表哪一類；都不像先檢討分類本身；類型確定後元件不夠才改元件。
- **跟彈窗怎麼分**（Q143，2026-11-09 改寫）：清單點一列，**有完整細節頁**的用第 1 類整頁細節覆蓋；**沒有細節頁、只是一筆資料**的用彈窗第 6 類「看細節」；要邊看清單邊比對時才用第 4 類逐筆對照抽屜。打斷式、做完一件事就關的任務（確認、填一張小表單）用彈窗，不用抽屜。
- **類型**：

| 類型 | 使用者在做什麼 | 外殼與尺寸 | 內容順序 | 按鈕 | 實例 |
|---|---|---|---|---|---|
| 1 整頁細節覆蓋 | 從清單點一列，看那一筆的完整細節頁，看完回到原本的清單位置 | Detail sheet（最寬 1440，背後模糊） | 細節頁本身（iframe） | ✕ 關閉＋「整頁開啟」 | 商品、活動、訂單、項目、粉絲、IP、取貨場次等 15 處清單 |
| 2 編輯設定 | 在頁面旁改一件東西的一組設定，背後的東西還看得見 | Drawer 480px，按鈕放 `.drawer__foot` | 標題（改的是哪一件）→ 預覽 → 欄位 | 頁尾：主要動作靠右；刪除放最左並走破壞性確認（5.1.11）；改了就即時生效的抽屜（例：媒體庫內容設定）沒有儲存鈕，頁尾只放刪除 | 媒體庫「內容設定」、創作者細節 |
| 3 管理清單 | 在抽屜裡增刪一串項目 | Drawer 480px | 新增區 → 現有項目清單 | 每列自己的動作；破壞性動作走確認 | 媒體庫「鑰匙」 |
| 4 逐筆對照 | 一邊看清單、一邊看選中那一筆的摘要，點別列就切換 | Drawer 480px，背後清單不模糊、可點 | 摘要（KV list）→ 主要動作 →「開完整細節」 | 上一筆／下一筆、關閉 | 目前沒有；規則先定，有需求再做 |
| 5 操作工作台（底部） | 手機上持續操作時，結果或輸入從底部升起 | 底部 sheet（Scanner） | 結果帶狀列 → 內容 → 動作 | 依操作；Esc 可關 | 掃碼結果、輸入代碼 |

- **must**：抽屜、sheet 一律可按 Esc、點遮罩、按 ✕ 關閉；第 2 類的按鈕放 `.drawer__foot`（Q145），不塞在內容最底下；抽屜裡打開的確認與告知用 `js/ztor-dialog.js`，會疊在抽屜之上。
- **must-not**：不在抽屜裡再開抽屜；收不回來的動作不能按下就做（要走 5.1.11）；整頁大表不叫抽屜——翻譯表（`drawer --full`）屬彈窗第 11 類「整頁工作區」。
- **不列入**：預覽欄（屬 5.1.9 Split preview）。

#### 5.1.15 List types 清單類型 (Interaction) · `#pattern-list-types`

2026-11-09 建，依同日清單與表格普查（見 `docs/清單與表格普查-2026-11-09.md`）與使用者裁決（`docs/五類元件類型草案-2026-11-09.md` 第 5 節，STYLE-DECISIONS Q166–Q171）。比照 5.1.8：**元件層**是各支清單與表格（`.product-list`、`.data-list`、`.ztor-table`、`.kv`、`.calc-list`…，Pillar 4）；**本卡**定一份清單屬於哪一類、每類用哪支、列與動作怎麼放。原 5.1.3 Filter + list 收進本卡當第 1 類的篩選規則，5.1.3 原卡保留。

- **trigger**: 頁面上要列出一筆以上同類資料的地方——管理清單、歷史紀錄、報表、排行、屬性摘要、算式、表單裡的可增刪集合、檢查清單。
- **怎麼判斷是哪一類（先問什麼）**：
  1. 先問「使用者看這份清單是要做什麼」：找一筆去管理（1）、回頭看發生過什麼（2）、多欄數字對照（3）、比大小或看組成（4）、看一件東西的各項屬性（5）、看一個數字怎麼算出來（6）、在表單裡增刪多筆（7）、看還差什麼（8）。
  2. 再問「列能不能點」：列預設不可點（Q166），真的能點才掛可點修飾類。
  3. 「選擇」不另立一類：在彈窗裡是 5.1.8 第 5 類「挑選」，在表單裡屬 5.1.17 輸入類型。
- **類型**：

| 類型 | 使用者在做什麼 | 用哪支元件 | 要點 | 實例 |
|---|---|---|---|---|
| 1 管理清單 | 瀏覽一類東西，找到一筆後進去或對它動作 | `.product-list`；Admin 規則表用 `.ztor-table`；小型關聯清單用 `.data-list` 精簡列 | 每列：識別（縮圖＋名稱＋一行次要資訊）→ 狀態 badge → 1–3 個數字；單筆動作收進列尾 ⋯；整批動作與「新增」放 `list-toolbar` 右側；篩選照 5.1.3 與 5.1.18 T4（Q154） | e-shop、orders、events、projects、fans-crm、Admin 規則頁 |
| 2 紀錄 | 按時間回頭看發生過什麼，唯讀 | `.data-list`；有明細加 `row-disclosure` 展開 | 時間 → 事件（誰做了什麼）→ 結果；新的在上；頂多「看細節」開彈窗第 6 類 | 撥款紀錄、出價紀錄、核銷紀錄、設定變更紀錄 |
| 3 報表 | 多欄數字對照、排序；列×欄的比較或設定矩陣 | `.ztor-table`＋`sort-th`；分級權益矩陣用 `.bmx`（唯讀版 `.bmx--readonly`，Q171） | 第一欄是哪一筆、數字欄右對齊、需要時末列合計；點欄名可排序；匯出走 5.1.12 | 收入交易明細、活動詳情售票紀錄、Admin 報表 |
| 4 排行與佔比 | 誰最多、一個總數各佔多少 | 排名 `perf-rank`；佔比 `split-bar`（Q167）；有上限的水位 `meter-list` | 名稱 → 量條 → 數字（＋%）；列預設不可點；「看全部」放卡尾開彈窗 | 內容收益排行、收入來源、粉絲組成 |
| 5 屬性摘要 | 看一件東西的欄位與值 | `.kv`（Q167）；流程最後的 Review 用 `review-row` | 鍵左值右、一列一值；值缺寫「—」不讓列消失；動作放卡頭或卡尾 | 訂單詳情、拍賣詳情、確認彈窗的對象 |
| 6 算式 | 看一個數字怎麼算出來（總額 − 費用 ＝ 淨額） | `calc-list`（Q167）；收入損益長瀑布 `waterfall`；定價階梯 `price-ladder` | 運算子 → 項目名 → 金額，末列是結果；說明用列內「怎麼算」 | 活動詳情營收、撥款試算 |
| 7 編輯集合 | 在表單裡增刪、就地改同一種東西的多筆 | 單欄短文字 `entry-list`；多欄 `spec-row`／`member-table`；每種條件加一次 `cond-list`；整列內容多用可收合卡（票種卡） | 每列一組欄位＋列尾刪除；可排序時列首 grip；「新增」放清單下方 | 場次、票種、組合物、商品規格、購買條件 |
| 8 檢查與進度 | 還差什麼才能送出、走到哪一步 | 就緒檢查 `readiness`；待辦 `todo-list`；步驟 `step-list` | 狀態圖示 → 一句描述 →（可選）前往；未完成項整列可點，跳到要補的那一步；全部完成改一句完成訊息 | 發布前檢核、首頁待辦 |

- **must**:
  - 列預設不可點：`.ztor-table__row` 不帶手指游標、`.product-list__row` 不浮起；真能點的列另掛修飾類（`--go` 或 `[href]`）（Q166）。
  - 同一種任務只留一種元件：屬性摘要一律 `.kv`、算式一律 `.calc-list`、排名用 `perf-rank`、佔比用 `split-bar`（Q167）。
  - 篩選要真的改變清單；沒有作用的按鈕拿掉（Q169）。
  - 每份清單都要有空狀態（Q170，照 5.1.4）：還沒有資料＝`Empty stub`＋建立鈕；篩選後沒結果＝一句說明＋清除篩選；紀錄類＝「還沒有○○，發生後會記在這裡」，不放建立鈕；報表保留表頭、表身一列說明。
  - 所有表格點欄名都能排序（2026-07-27 使用者裁示，`js/table-sort.js`）。
- **should**: 同一份資料切換卡片／列表檢視時，點擊行為要一致（點了去同一個地方）；表格放在卡裡不要再畫一圈框。
- **must-not**:
  - 不把元件借去做別的事：開賣前的票種不用量條（永遠 100% 看起來像賣完）；多指標並列、轉換漏斗不用排行長條，改用第 3 類報表或第 5 類屬性摘要（Q168）。
  - 不讓唯讀列看起來能點（hover 浮起、列尾 chevron、手指游標）。
  - 不用篩選外觀存表單值（Q154）。
- **都不像時**：先檢討分類本身（加一類、拆一類或改定義），寫進本卡並更新實例；不要硬塞進最接近的一類，也不要在頁面另寫一種清單。
- **已收斂**（2026-11-09 普查的項目）：
  - 唯讀表格不再看起來能點；可點的列掛 `--go` 或 `[href]`（Q166，#517）。
  - 屬性摘要收成 `.kv`、算式收成 `calc-list`、收入來源佔比改 `split-bar`、項目詳情排行改 `perf-rank`（Q167，#517）；`rank-bars` 因此零消費，2026-11-10 走墓碑退場。
  - 量條與排行長條不再被借用（Q168，#517）。
  - 假篩選改成真的篩選、死按鈕拿掉（Q169，#517）；收入兩頁交易明細的「Load more」死連結與句尾多出的「·」2026-11-10 拿掉。
  - 空狀態補齊（Q170）：#517 補拍賣出價、票種列表、參加者、my-ip 租入、粉絲消費與參與紀錄、品牌合作、方案統計與支持者；2026-11-10 補 scanner 項目、代理碼「這組碼賣掉的」、授權明細、收益明細（表與彈窗）、提款紀錄。
  - 分級權益矩陣合併成 `.bmx--readonly`，`tier-overview` 退場（Q171，#518）。
- **待收斂**：
  - 16 頁表格接上點欄名排序：已完成（#522）；網格式清單（`.table-head`／`.product-list__head`：orders、creators、e-shop、events、pickup、my-ip、fan-detail、series-detail）尚未接，另案。
- **刻意不收**：
  - 收入三頁（主收入、ztor、Sony 示範）的交易明細只差示範資料，維持各自一份（同 #514）。
  - 訂單詳情的「買家資訊」不改 `.kv`：收件地址很長、右欄很窄，鍵左值右會把地址擠成好幾行，維持現在的直排。
  - 圓餅圖例 `.source-list` 暫不換 `split-bar`：圖例每列多一欄金額，`split-bar` 圖例沒有這一欄，換不換待使用者決定。
  - 購買條件清單（`cond-list`，第 7 類）空的時候只留「新增條件」按鈕：2026-10-28 使用者逐條指定拿掉空狀態句，Q170 不推翻；編輯集合的「新增」鈕就是空狀態的下一步。

#### 5.1.16 Card types 卡片類型 (Layout) · `#pattern-card-types`

2026-11-09 建，依同日卡片普查（見 `docs/卡片普查-2026-11-09.md`）與使用者裁決（草案第 4 節，STYLE-DECISIONS Q161–Q165）。**元件層**是卡的外殼（§4.11 Card、`.kpi`、`.form-section`、各種 hero 與預覽卡）；**本卡**定一張卡屬於哪一類、能不能整張點、卡裡怎麼分層。

- **trigger**: 頁面上任何「一塊有外框或底色、自成一區」的內容。
- **怎麼判斷是哪一類（先問什麼）**：
  1. 先問「使用者看這張卡是要知道什麼、還是要做什麼」，再對下表。
  2. 再問「整張卡是不是一個點擊區」：只有 A 指標（`--tappable`）與 E 物件可以整張點，走 5.3 可點卡片 hover（Q136）。
  3. 空狀態不是一類，是每一類「沒資料」時的樣子，外殼跟著原本那一類（照 5.1.4）。
- **類型**：

| 類型 | 回答什麼 | 用哪支元件 | 要點 | 實例 |
|---|---|---|---|---|
| A 指標 | 這個數字現在多少、跟上期比怎樣 | 頁面層的 `.kpi`（一排用 `.bento`）；點進明細用 `.kpi--tappable` | 不要卡頭，`.kpi__label` 就是標題；`.kpi` 只用在頁面層，卡裡的數字一律 `.stat-row`（Q162） | 儀表板、收入總覽、活動詳情頂端 |
| B 分析 | 走勢、分布、排行、結論 | `.card`；有圖表 `.card.chart-card`；一句結論 `.card.finding` | 標題（圖示要嘛全有、要嘛全沒有）＋右側篩選或檢視切換（5.1.18 T3）；不可整張點 | 收入頁、粉絲分析、專案詳情成效 |
| C 表單區段 | 這一組設定要填或改什麼 | 頁面層 `.form-section--outlined`；彈窗或卡內 `.form-section--card` | 詳情頁的編輯段一律 `.form-section--outlined`，不用 `.card`（Q163）；整段儲存放頁面黏底動作列，不放卡頭 | 建立流程各步驟、商品／組合包／訂單詳情 |
| D 資料容器 | 這一類資料有哪些筆、記了什麼 | `.card` 裝 `.data-list`／`.ztor-table`／`.kv` | 卡不可點，列可以（照 5.1.15）；表格不要在卡裡再畫一圈框 | 收入交易明細、訂單詳情摘要 |
| E 物件 | 這是哪一個東西，點了去它那裡或選它 | 目前九種外殼（`a.card.ipm-card`、`.project-card`、`.vault-card`、`.work-card`、`.live-item`…） | 整張可點，走 Q136 hover（位移＋底色）、邊框照 Q3、`cursor: pointer`；這輪不收成一支（Q165） | IP Market、Projects、媒體庫、首頁進行中 |
| F 進度與下一步 | 進行到哪、還差什麼、下一步 | `.readiness`、`.issue-panel`、`.funding-panel`、`.card`＋`.next-step` | 卡頭標題＋狀態或「還差 N 項」；卡底一顆主要動作；卡本身不可點，每一項自己可點 | 發布前檢核、首頁待辦、募資進度 |
| G 身分 | 詳情頁頂端這是誰、目前狀態 | `.pd-hero`、`.ip-hero`、`.fan-hero`、`.ad-hero` | 封面＋名稱＋狀態徽章；主要動作在頁首工具列；hero 裡的數字用 `.stat-row`（Q162） | 商品、組合包、IP、粉絲、拍賣詳情 |
| H 預覽 | 粉絲端會看到什麼 | `.preview-card`、`.event-preview-card`、`.vip-card` | 不要卡頭；預覽裡的按鈕只是樣子；放在 5.1.9 預覽欄，不塞進表單卡 | 建立商品、建立拍賣、商品詳情 |

- **巢狀層分工**（卡裡怎麼再分；Q161 照 Q71）：
  1. 第 1 層：卡裡只是分幾組資訊 → `.group-title`＋`.group-divider`（Card group），不加任何面。
  2. 第 2 層：卡裡一段需要被框起來 → 線框 `.control-group`（開關＋揭示區）或 `.control-group--plain`。
  3. 第 3 層：要讀成「疊上去的另一層」 → 填色。位置在卡片中段（上下還有別的內容）用 `.card--muted`；貼齊母卡底緣、是整張卡最後一段（模式切換後長出整組設定）才用 `.nest`（2026-11-10，見 `ds-specs/card-group.md`）。
  4. Q66 原本的「L2 填色、L3 線框」順序作廢；超過 3 層拆成彈窗、抽屜或另一張卡。
  5. `.form-section--outlined` 是頁面層分組，不放進卡或彈窗（§6.0.1）。
- **must**:
  - 卡裡（含 hero、表單段）的數字一律 `.stat-row`，`.kpi` 只用在頁面層（Q162）。
  - 詳情頁的編輯段一律 `.form-section--outlined`（Q163）。
  - 設定頁的分段一律「設定列」（`.settings-section`＋列與分隔線，不包卡）；儲存方式另看 Q138（待裁決）（Q164，見 5.1.7）。
  - 整張可點的卡走 Q136 hover；不可點的卡不給 hover 與手指游標。
- **should**: 卡頭說明用正式的 `.card__hint`／`.form-section__sub`，不借別支元件的說明 class；「查看全部」用 `<a class="card__link">`。
- **must-not**: 同一頁的編輯段不混用 `.card` 與 `.form-section--outlined`；不在卡裡疊三層以上；不把預覽卡或身分卡塞進表單卡。
- **都不像時**：先檢討分類本身（加一類、拆一類或改定義），寫進本卡並更新實例；不要另做一種外殼。
- **已收斂**（#518）：
  - 卡裡的 `.kpi` 改 `.stat-row`，`kpi.css` 進卡的情境規則刪除（Q162）。
  - 活動、項目、IP 詳情的編輯段改 `.form-section--outlined`（Q163）。
  - 店鋪設定、分級設定、粉絲分級「規則」分頁改設定列（Q164）。
  - 場次盒、publish-work 子盒、限時折扣框的層級順序改成第 2 層線框、第 3 層填色（Q161）。
  - `.project-card`、`.work-card` 補齊 Q3 邊框、Q136 hover 與手指游標；`.vault-card` 已走 Q136 hover；`.brand-card` 不可點，hover 拿掉（Q165）。
- **待收斂**：
  - `.payout-bank-card--add`（新增銀行卡）還沒有 Q136 hover（Q165）。
- **刻意不收**：
  - 物件卡九種外殼這輪不合併成一支，資訊量差很多，真合併另案（Q165）。
  - 平台忠誠點數（`admin-platform-loyalty.html`）與粉絲名單（`fans-crm.html`）的「門檻與權益」「計分」分頁保留卡片：卡片的範圍就是「一起儲存」的範圍，設定頁儲存方式 Q138 還沒裁決，先不拆（Q164）。
  - 平台費率（`admin-platform-fees.html`）整頁保留：是大型編輯器（費率表、版本、生效範圍），不是一列一列的設定，套設定列反而難讀（Q164）。
  - 活動內文 `.rich-body` 的區塊殼（可拖曳的內文區塊清單）不算卡片類型，另案處理。

#### 5.1.17 Input types 輸入類型 (Workflow) · `#pattern-input-types`

2026-11-09 建，依同日輸入欄位普查（見 `docs/輸入欄位普查-2026-11-09.md`）與使用者裁決（草案第 1 節，STYLE-DECISIONS Q146–Q150）。**元件層**是 Field system 與各支控件；**本卡**定一格要填的值屬於哪一類、用哪支控件、標籤／說明／錯誤怎麼放。欄位怎麼組成區段照 5.1.6 Form assembly。

- **trigger**: 任何要使用者填值的欄位——建立流程、詳情頁編輯、設定、彈窗表單。
- **怎麼判斷是哪一類（先問什麼）**：
  1. 先問「要填的值是什麼」：文字、數字、日期時間、固定選項、要搜尋才找得到的東西、自由標籤、檔案。
  2. 固定選項只有 2–4 個且要一眼看完、每個要一句說明時，改看 5.1.18 選擇控件類型（T1／T2）；5 個以上用本卡第 4 類下拉。
  3. 系統產生、只讀的值不算輸入，照「附類」做。
- **共通**：每格一個 `.field`（`__label` → 控件 → `__hint` → `__error`，順序固定）；必填標 `*`（`.field__req`）；鎖定與唯讀用 disabled 框（Q128／Q133），原因寫在 `.field__hint`。
- **類型**：

| 類型 | 要填什麼 | 用哪支元件 | 要點 | 實例 |
|---|---|---|---|---|
| 1 文字 | 名稱、說明、備註、退回原因 | `.input`／`.textarea`；需要段落與粗體的長篇才用 `.rich-body` | 字數上限 `.field__counter` 放標籤列右側；最低字數寫進 hint 一次 | 商品名稱、活動介紹、退件原因 |
| 2 數字 | 錢、%、倍數、點數、張數、上限 | 一律 `.amount-field`，單位放框內 `__unit`；金額前綴一律幣別代碼 `.amount-field--code`（如 TWD），不寫「$」（Q147）；整數且常微調加 `.zstep`；大額主角 `--hero` | 單位不寫在標籤也不寫在框外；上限與換算寫 hint，超過時 `.field__error` | 票價、折扣 %、庫存、申請撥款 |
| 3 日期與時間 | 單一日期、時間、區間 | 一律「日期＋時間」兩格（`type=date`＋`type=time`），不用 `datetime-local` 一格（Q146）；區間 `.date-range`；跟著某時間或另設 `.follow-field` | 頁面要載 `partials/date-input.js` 加佔位；區間先後錯誤放在迄日那格的 `.field__error` | 活動場次、上架時間、優惠期間 |
| 4 從固定清單挑 | 分類、幣別、國家、語言、時區 | `select.select`（zselect）；多選 `data-zselect-multi` | 「新增一個」用 `data-zselect-action`，不在旁邊另放按鈕 | 商品分類、幣別、國家 |
| 5 搜尋後挑 | 人、電影、優惠碼、商品 | 挑人 `.owner-lookup`；挑多個留在欄位 `.combobox`；邊篩邊勾很多個開彈窗（5.1.8 第 5 類） | 已選成 chip 留在欄位內；沒結果的空狀態放在下拉裡 | 指定創作者、表演陣容、選電影 |
| 6 多個自由標籤 | 商品標籤、粉絲標籤 | `.tag-input` | 已加入的標籤用中性 chip（Q155）；建議標籤放欄位下方 | 商品標籤、粉絲標籤 |
| 7 檔案 | 圖、影片、附件、資料檔 | `.upload-tile`（`--file`、`--slim`、`--video`） | 尺寸與格式限制寫在格子內或 hint；上傳失敗放 `.field__error` | 商品主圖、作品影片、資料檔匯入 |
| 附 系統值 | 分享連結、掃碼網址、付款編號 | 要整條帶走 `.linkf`；只看 `.field-readout` | 不套 disabled 灰底；說明一行放下方 | 媒體庫分享連結、取貨領取碼、訂單編號 |

- **must**:
  - 標籤不寫「（選填）」，選填寫在 placeholder；必填照舊標 `*`（Q148，Q123 全站套用）。
  - 驗證錯誤一律 `.field__error`＋控件 `aria-invalid`，位置在說明行下方；`.field__hint--warn` 只做「還沒錯、提醒一下」的即時提示，不當錯誤（Q149）。
  - 被擋下時在被擋的欄位或區段旁顯示錯誤，toast 可保留但不能是唯一訊息（Q160，照 5.1.4）。
  - 不另立欄位系統：群發訊息與發文彈窗的 `.msg-field` 改用 `.field`（Q150）。
- **should**: 金額輸入框的 `type` 與 `inputmode` 統一（手機叫出同一種鍵盤）；算出來、不能填的值用 `.field-readout`，不用 readonly `.input`。
- **must-not**: 控件不寫行內寬度；不拿說明行換色當錯誤；不在標籤或框外寫單位。
- **例外**：設定頁 `.settings-row` 右欄直接放控件（5.1.7）、表格儲存格裡的輸入（規格表、套組規則）不包 `.field`；錯誤顯示照同一支 `.field__error` 放在該列下方。
- **都不像時**：先檢討分類本身（加一類、拆一類或改定義），寫進本卡並更新實例；不要另寫一套欄位。
- **已收斂**（#520）：
  - `datetime-local` 一格改「日期＋時間」兩格（`.date-input-pair`，Q146）。
  - 金額前綴「$」改幣別代碼 `.amount-field--code`（Q147）。
  - 標籤上的「（選填）」拿掉，需要時改寫在 placeholder（Q148）。
  - 驗證錯誤只用 `.field__error`＋`aria-invalid`，頁面自訂錯誤樣式退場（Q149）；2026-11-10 補修 create-event、create-event-legacy、register-ip 錯誤行的 `hidden` 屬性（#520 寫壞成 `hiddendata-i18n`，錯誤行一開頁就顯示）。
  - `.msg-field` 改 `.field`（Q150）。
  - 日期區間收成 `.date-range`、系統值收成 `.linkf`、長文字收成 `.textarea`。
- **待收斂**：
  - 數量、百分比各三種寫法還沒收成一種。
- **刻意不收**：活動用 `.rich-body`、商品等用 `.textarea` 的差異可能是產品差異，等上游確認再收。

#### 5.1.18 Selection types 選擇控件類型 (Interaction) · `#pattern-selection-types`

2026-11-09 建，依同日選擇控件普查（見 `docs/選擇控件普查-2026-11-09.md`）與使用者裁決（草案第 2 節，STYLE-DECISIONS Q151–Q155）。**元件層**是各支選擇控件（Switch、Radio cards、Radio list、Segmented、Filter tabs、Chip、Checkbox、Selection card）；**本卡**依「使用者在做什麼決定」分六類，定每類用哪支、什麼時候生效。Q17 的版面分工（大格／並排／直列）成為同一類裡的密度變體。

- **trigger**: 使用者從幾個選項裡選、開關一件事、切換看法或篩選清單的地方。
- **怎麼判斷是哪一類（先問什麼）**：
  1. 先問「選了會改資料嗎」：不改資料、只換看法 → T3；縮小清單筆數 → T4；其他都會被存起來。
  2. 會存的再問「有幾個選項、能選幾個」：只有有／沒有 → T1；2–4 個互斥做法 → T2；可勾多個 → T5；建立流程第一步選要做哪一種 → T0。
  3. 長清單（5 個以上）的單選改用 5.1.17 第 4 類下拉；要搜尋才挑得到的改用 5.1.17 第 5 類。
- **類型**：

| 類型 | 使用者在做什麼 | 用哪支元件 | 什麼時候生效 | 實例 |
|---|---|---|---|---|
| T0 起手分流 | 建立流程第一步選「要做哪一種」 | `.radio-cards--gate`（2–6 個，附一句說明）；7 個以上且只有名稱用 `.selection-card` 方磚 | 點了直接進下一步，不保留選取態 | 建立商品、建立活動、建立專案第一步 |
| T1 開或關一件事 | 有／沒有、要／不要 | `.switch`；打開要多填就包 `.control-group` | 跟著所在頁：設定列即時、表單跟著儲存（Q151） | 限量、限購、收費作品、上架到市集 |
| T2 2–4 個做法選一個 | 同一件事幾種做法，選了改變後面欄位 | 每項要一句說明 `.radio-cards`（3 張 `--3`）；窄版或第二層 `.radio-list`；選項名就夠清楚 `.segmented` | 儲存才生效 | 開賣時機、上架時機、取票方式 |
| T3 切換檢視 | 同一份資料換看法 | `.segmented`（純圖示用圖示段） | 立即，不改資料 | 月／季／年、列表／卡片 |
| T4 篩選清單 | 縮小清單筆數 | 單選看筆數 `.filter-tabs`；可複選 `.chip-group` | 立即 | 清單頁狀態篩選、收入來源 |
| T5 勾幾個 | 從一組固定選項勾出所有適用的 | 名稱短量多 `.chip-group`；成組或要說明 `.radio-list--check`；一般 `.zcheck` | 儲存才生效 | 作品類型、授權用途、通知項目 |

- **must**:
  - 開關只表達「有／沒有」，什麼時候生效跟著所在頁；要按儲存的地方也可以用開關（Q151，switch 規格已改）。
  - 「有沒有」這類二選一題目一律開關（T1），不用兩張卡、單選或單顆勾選（Q152）。
  - 開賣時機、上架時機在建立頁與詳情頁一律 `.radio-cards`（T2）（Q153）。
  - 分工：切換檢視一律 `.segmented`（T3）；篩選清單單選 `.filter-tabs`、複選 `.chip-group`（T4）；底線 `.tabs` 只做分頁導覽；篩選外觀不拿來存表單值（Q154）。
  - 已加入的使用者自填標籤用中性 chip；橘色已選樣式只給「從固定選項裡選中」（Q155）。
- **should**: T1 的開關旁附一句後果（關掉會怎樣）；T2 選項數相同、說明量相同時，同一題在每一頁用同一種長相。
- **must-not**: `.selection-card` 不用於多選；`.radio-cards` 不掛 `role=tablist`；不自己做一對 `aria-pressed` 按鈕代替控件；不可逆確認的勾選屬 5.1.8／5.1.11，不屬本卡。
- **都不像時**：先檢討分類本身（加一類、拆一類或改定義），寫進本卡並更新實例；不要另做一種控件。
- **已收斂**（#519）：
  - 有無題改開關：商品限量、組合包販售數量、觀影派對人數與收費、購買條件與限購、IP「請洽詢」（Q152）。
  - 開賣與上架時機改 `.radio-cards`（Q153）。
  - 切換檢視改 `.segmented`、清單篩選改 `.filter-tabs`、「門票建法」改 `.segmented`（Q154）；2026-11-10 補 `earnings-ztor.html` 交易類別（原 chip）。
  - 已加入的標籤改中性 `.chip--value`（Q155）。
  - register-ip 授權用途改 `.radio-list--check`。
- **待收斂**：
  - 收入兩頁（`earnings.html`、`earnings-ztor.html`）稅務文件的年度篩選仍是 `.chip-group` 單選，照 Q154 應改 `.filter-tabs`。
- **刻意不收**：
  - register-ip「要上架出租嗎」維持兩張卡：規格把它列為必填（5.1.4.1 §6），使用者必須主動選一邊；開關一定有預設值，等於替使用者先選好（Q152）。
  - 詳情頁的上架總開關維持開關（Q152）。

#### 5.1.19 Status types 狀態標記類型 (Interaction) · `#pattern-status-types`

2026-11-09 建，依同日狀態標記普查（見 `docs/狀態標記普查-2026-11-09.md`）與使用者裁決（草案第 3 節，STYLE-DECISIONS Q156–Q160）。**元件層**是 Badge、Status axes、Review status、Info banner、Alert、Toast、量條等；**本卡**定一個標記在講哪一類事、用哪支、用哪個顏色。

- **trigger**: 畫面上告訴使用者「這件東西現在怎樣、這格的值從哪來、還剩多少、有什麼要注意」的標記與訊息。
- **怎麼判斷是哪一類（先問什麼）**：
  1. 先問「這個標記會不會隨時間變」：不會變（是哪一種）→ 第 4 類；會變的再分下去。
  2. 會變的問「在講什麼」：東西本身的階段（1）、錢與貨走到哪（2）、等人審（3）、這一格的值從哪來或還沒存（5）、數量與進度（6）、一段要注意的話（7）。
  3. 選好類別再照下面的顏色表取色，顏色看「現在有沒有在跑、要不要你處理」，不看物件。
- **類型**：

| 類型 | 例子 | 用哪支元件 | 要點 | 實例 |
|---|---|---|---|---|
| 1 生命週期 | 草稿、即將開賣、販售中、已下架、已結束 | `.badge`，顏色從共用對照表取（商品已有 `ListingState.badgeClass`，其他物件比照） | 細節頁標題旁一顆主徽章；清單列固定狀態欄、一列一顆 | 商品、組合包、活動、項目、庫房 |
| 2 交易與結算 | 訂單、收入、撥款、取貨 | `.badge`；兩條獨立狀態並排 `.status-axes` | 收入表「不是收入」的那一族用 `--outline`（D250，保留） | 訂單、收入明細、撥款 |
| 3 審核與驗證 | 待審、要補件、通過、退回 | 清單用 `.badge`；細節頁 `.review-status` 面板 | 退件要附理由與下一步 | 作品送審、IP 驗證、收款帳戶驗證 |
| 4 類型與分類 | 商品類型、IP 類別、活動類型、粉絲分級 | `.badge`（中性）或 `.chip--static` | 一律中性灰，不借狀態色；粉絲分級用中性灰徽章加分級圖示（Q158） | IP Market、粉絲名單 |
| 5 來源與編輯 | bookyay 帶入、沿用上層、已修改、待刪除、未儲存 | 來源 `.field-source`；暫存變更 `.staged-change`；整張表單 `.save-status` | 放在欄位標籤旁或區段標題尾端，不放列尾狀態欄 | 建立活動 bookyay 帶入、活動詳情未存變更 |
| 6 數量與進度 | 庫存、完成度、就緒 | `.stock-bar`、`.completeness`、`.readiness`；清單儲存格 hover 浮出的庫存卡用 tooltip 的 `.tip--card` 變體（Q172） | 一定配精確數字，色條不單獨出現；平常中性，過門檻才換色 | e-shop 庫存欄、商品詳情右欄、發布前檢核 |
| 7 頁內提醒 | 規則說明、警告、失敗、完成 | 說明 `.info-banner`；要處理或失敗 `.alert--row`；頁頂可關通知 `.alert--bar`；動作完成 toast | 說明一律 `.info-banner`（Q159）；被擋下要在欄位或區段旁顯示，不只 toast（Q160） | 各建立流程、活動詳情、商品詳情 |

- **狀態顏色表**（Q156，所有類別共用）：

| 顏色 | 意思 | 例子 |
|---|---|---|
| 灰 neutral | 沒在跑，但一切正常 | 草稿、已下架、已結束、已暫停、已停用 |
| 藍 info | 排了還沒開始，或平台處理中、你不用動 | 未開始、即將開賣、已排程、待結算、驗證中、已申請撥款 |
| 綠 success | 正在跑 | 販售中、進行中、已上線、啟用 |
| 黃 warning | 要你處理 | 待補件、流失風險、庫存偏低 |
| 紅 error | 賣完或異常 | 售罄、退回、失敗 |

- **must**:
  - 狀態徽章只用上面五色（Q156）；橘色不當狀態色，只留給強調（主按鈕、已選）（Q157）。
  - 粉絲分級用中性灰徽章加分級圖示，不借狀態色（Q158）。
  - 說明規則的訊息一律 `.info-banner`；`.alert--row` 只給要處理或失敗的事（Q159）。
  - 被擋下時在被擋的欄位或區段旁顯示錯誤，toast 可保留但不能是唯一訊息（Q160）。
  - 每個標記都要有文字，不只靠顏色。
- **should**: 狀態對照表集中一份（每種物件一張），頁面不寫死 class；同一種東西的同一個狀態在每一頁同色。
- **must-not**: 不用 `.ztor-badge`（文件用徽章）出現在產品頁；不用不存在的修飾類（例 `info-banner--warning`）；不把 `.alert--banner` 當 toast 用。
- **都不像時**：先檢討分類本身（加一類、拆一類或改定義），寫進本卡並更新實例；不要為一個物件另配一套顏色。
- **已收斂**：
  - 狀態顏色照共用表：已下架灰、售罄紅、未開始藍、進行中與已上線綠（Q156，#516）。
  - 橘色退出狀態徽章：待結算、驗證中、已申請撥款改藍；原創 IP、拍賣計價改中性（Q157，#516）。
  - 粉絲分級改中性 `.badge--tier`＋分級圖示（Q158，#516）。
  - 說明規則改 `.info-banner`（Q159，#516）；2026-11-10 補 register-ip 上架說明（原橘色 badge）。
  - 活動詳情「立即開賣」被擋時在該列下方顯示錯誤（Q160，#516）。
  - Stock tip 併進 tooltip 的 `.tip--card`（Q172，#518）。
  - 第 4 類類型標籤：2026-11-10 活動詳情、系列詳情的活動類型徽章（演唱會等）與線上活動「僅線上」由藍改中性灰。
- **待收斂**：
  - 被擋下只跳 toast 的其餘幾處（組合包詳情、商品詳情；普查約 6 處，#516 改了活動詳情一處）（Q160）。
  - 媒體庫任務標籤 `.vault-tag` 自帶一套色，待改走 `.badge` 語意色。
  - 商品詳情庫存紀錄的類型徽章「補貨」是藍色（類型標籤，照第 4 類應中性）；UIA-340 刻意用三種樣式區分補貨、鎖定、修改，改之前要先決定怎麼區分。
- **刻意不收**：E-Shop 收入來源的色點是分類色（圖例對色），不是狀態，不套五色表（#516）。

### 5.2 Voice & Microcopy

**Personality** — Task-oriented and finance-honest. Talks to an independent creator running their own business: plain about money, royalties, splits, and verification; never hides a fee or a pending state. Calm, concrete, second-person. Lowers the barrier on finance / IP / cross-border topics with defaults and plain words instead of jargon.

**Principles** (from SPEC §1)

1. **Transparent** — income, fee rates, deductions, splits, and verification states are always spelled out, never implied.
2. **Low-barrier** — finance, IP licensing, and cross-border income are explained in plain language with sensible defaults.
3. **Task-oriented** — every page says what you can do right now.
4. **Consistent** — the same record reads with the same wording and the same status language on every page.
5. **Compliance-careful** — copy around fan support, revenue splits, and tax stays conservative and checkable.

**Is / Is-not**

| Voice is | Voice is not |
|---|---|
| Plain about money — "You'll receive **$842.10** after a 12% platform fee" | Vague — "Earnings will be processed" |
| Specific about state — "Pending until 28 Jun" | Falsely settled — "Paid" (when only pending) |
| Action-first — "Request payout" | Feature-first — "Payout management module" |
| Second-person, calm — "You can edit this until the event goes live" | Hype / urgency — "Don't miss out!" |
| Honest about limits — "Bundles aren't available in your region yet" | Evasive — "Coming soon" with no reason |
| Conservative on compliance — "Tax documents are estimates; confirm with your advisor" | Over-promising — "We handle all your taxes" |

**Headline pattern** — State the task or the number, not a slogan: "Your earnings", "Create a project", "3 actions need attention".

**Subhead pattern** — One plain sentence of what the page lets you do + the key state: "Track income across products, IP rentals, and events. Pending amounts clear on the dates shown."

**Microcopy examples**

- CTA primary: `Create project` · `Request payout` · `Publish` · `Save draft`
- CTA secondary: `Back` · `Cancel` · `Export CSV`
- Success: "Project saved as draft." · "Payout requested — arrives in 2–3 business days."
- Warning: "This product is referenced by 2 live projects. Editing it updates them too."
- Error: "Couldn't save. Your draft is kept — try again." · "Enter a payout amount up to your available balance ($842.10)."
- Empty (new): "No projects yet. Create your first to start earning."
- Empty (filtered): "No transactions match these filters. Clear filters to see all."
- Guidance: "Available = cleared and ready to withdraw. Pending = still in the platform's hold window."
- Money state pair: "Available **$842.10** · Pending **$1,204.00**"

**Capitalization** — Sentence case for headings, paragraphs, and buttons ("Create project", not "Create Project"). Status pills lower-case.

**Tense / voice** — Imperative + active present for actions ("Create", "Request"); plain present for states ("Pending", "Cleared").

**Copy norms** (workspace conventions)
- Headings default to no terminal period (per `feedback_section_titles_no_period_h3`).
- Avoid the `不是 X，而是 Y` negation-contrast Chinese construction (per `feedback_writing_style_no_negation_contrast`) — write positive claims directly.

### 5.3 States & Interaction

Global interaction defaults — keyframes live here (state-driven), not in Pillar 1.

- **Nav dropdown**: hover-open with a 140ms close delay (cursor can reach the panel); click still toggles. `aria-haspopup` + `aria-expanded` + ESC-to-close. Panel bg uses `--background` (not `--card`) so dark-mode translucency never muddies it over a colored hero.
- **Theme toggle**: light / dark / system 3-state cycle. Persists in `localStorage["ztor.theme.preference"]`. URL `?theme=dark` is a one-time override.
- **Tab switching** (`.tabs / .tab-panel`): single active panel, URL hash sync via `history.replaceState`; deep-link load activates the target tab.
- **Filter selection** (2026-11-09 Q154): single-select with counts uses `.filter-tabs`; multi-select uses `.chip-group` (`.chip--active`); result count updates on every change.
- **Switch** (`.switch / --on`): 150ms knob slide; track `--muted` ↔ `--primary`.
- **Accordion**: chevron-rotate, height transition on expand/collapse.
- **Motion**: durations 150–240ms, ease-out; all entrance animations gated behind `@media (prefers-reduced-motion: reduce)` (shown immediately when reduced).
- **可點卡片 hover**（2026-10-20，使用者指示，STYLE-DECISIONS Q136，全站同一個答案；取代 Q5 原「借 `--shadow-float` 浮起」）：
  - 適用：卡片**整張臉是一個點擊區**（導頁、開編輯、開彈窗、選一個選項）。
  - 效果：`transform: translateY(var(--clickable-card-lift))`（−4px，2px 在卡片陰影底下看不出來）＋ `background: var(--clickable-card-hover-bg)`（別名 `--control-raise-hover`，按鈕 hover 階：深色 `rgba(222,223,233,.12)`／亮色 `var(--accent)`）。**不換邊框、不換陰影。**
  - `prefers-reduced-motion: reduce`：不位移（底色照換）。
  - 已選的卡（`.x--active`／`.is-active`／`--selected`）只上浮、保留自己的已選底色（`:not(...)` 排除，不另換底）。
  - token：`--clickable-card-lift`（`-4px`）、`--clickable-card-hover-bg`，定義在 `_tokens.css` 亮暗兩個主題區塊（別名要在暗色區塊重宣告才吃得到暗色的 `--control-raise-hover`）。
  - 消費者（位移＋底色）：`.ztor-card--clickable`（`card.css`）、`a.card[href]`／`button.card`（`card.css`，IP Market 的 `<a class="card ipm-card">`）、`.tier-card--clickable`（`ticket-tier-card.css`）、`.project-card`（`shared.css`）、`.selection-card`（`selection-card.css`）、`.radio-cards .segmented__btn`（`radio-card.css`）、`.kpi--tappable`（`kpi.css`）、`.vault-ovcard`（`media-vault.css`）、`.vault-card`（`vault-stage.css`，媒體庫的內容卡；2026-11-09 由換陰影改回本標準）、`.vshare__opt`（`vault-share.css`）、`.payout-bank-card`／`.payout-bank-option`（`payout-modal.css`）、`.live-item`（`live-item.css`，首頁的 `<a class="card live-item">`）。
  - 只吃位移：`.canvas-start__card`（`canvas-home.css`，底色是照片上的 `--on-media` 薄膜）。
  - 前提：`js/reveal.js` 會在卡片進場後 1.4 秒卸掉 `.reveal`／`.is-in`／行內 transition-delay。被標到的 `.card`／`.kpi` 原本被 `html.reveal-on .reveal.is-in { transform: none }`（權重更高）與 `.kpi.reveal` 的 kpiRise 動畫（fill-mode both 釘住 transform）擋住，hover 位移出不來；新增會被 reveal 標到的可點卡片不用另外處理。
  - 不套用（各有自己的 hover 語彙）：清單／表格列（`.product-list__row`〔Q34〕、`.data-list__row--go`、`.alert--card[data-go]`、`.vault-row`、`.pickup-select__row`）；按鈕、chip、`.check-card` 膠囊；虛線的新增／投放格（`.upload-tile`、`.cb-add-tile`、`.payout-bank-card--add`）；縮圖畫廊（`.vault-tile`；`.work-card` 只動封面）；卡內另有按鈕、整張非點擊區的卡（`.brand-card`，hover 陰影升級為存量）；`.alert--banner[data-go]`（實色 banner）；粉絲端鏡像 `.fep-shop`（`.pdp-rec-card` 等）；照片上的 `.canvas-stage__pick`、`.issue-panel--compact .issue-card`（列＋玻璃 hover）。
  - 新增「整張可點的卡」時：直接寫這兩行（用 token，不寫數值），並登錄到本條消費者清單。
- **Lifecycle states** (see the Lifecycle pattern card in §5.1):
  - **404** — same chrome, single "Page not found" headline, link back to Dashboard.
  - **Empty stub** (`.empty-stub`) — routes not yet built (orange mark + display title + spec refs).
  - **Error** — inline `Alert --row`, retry available, already-loaded data preserved.

### 5.4 Data Visualization

R 2.2 chart family lives in [`ds-components/chart.css`](../ds-components/chart.css). Three sub-patterns:

- **Line chart** (`.linechart`) — single- or two-series polyline. Default series uses `var(--primary)`; comparison line uses `var(--muted-foreground)` with `stroke-dasharray: 4 4`. Area fill below line is `color-mix(--primary 18%, transparent)`. Accent dot on latest point.
- **Stacked bar** (`.stacked-bar`) — 14px tall horizontal proportion pill. Segment widths set inline (consumer controls proportion); segment colors set inline (palette = primary / black / status-success / status-info / neutral-grey).
- **Source list legend** (`.source-list / .source-row`) — 4-col `[10×10 swatch] [label 1fr] [amt auto] [pct auto]` grid; pairs below `.stacked-bar` to spell out segment palette.

**Color palette for source breakdown** (Dashboard / Earnings Revenue by Source):
1. `var(--primary)` — primary income source (e.g., E-Shop sales)
2. `#000000` — secondary major source
3. `var(--status-success)` — tertiary
4. `var(--status-info)` — quaternary
5. `#999` — other / aggregated remainder

### 5.5 Workflow patterns

（2026-11-09 起併入 5.1.5）建立流程的清單改列在 5.1.5 Multi-step wizard 的「實例」，變體（整頁、整頁＋右側預覽、蓋在頁面上）也寫在那裡。原本這裡的共同規則（`wizard-focus` 模板、置中 stepper、固定底部動作列、每步存草稿、金額與授權揭露在確認步驟重述）與 5.1.5 的 must／should 相同，以 5.1.5 為準。
