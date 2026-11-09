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

Best-practice assembly recipes — how components combine to meet a creator's goal. A Pattern is not a component (Pillar 4) and not a wireframe (the page implementation). Each card has five grids: `trigger` (when to use) / `must` (≥2 non-negotiables) / `should` (advisable) / `must-not` (anti-patterns) / `_edge-cases` (empty / error / new-user / mobile / offline)，加兩個選填欄：`變體`（同一做法的固定分支）與 `實例`（照它做的頁面）。 Four categories, twelve cards（頁面級 5 張＋中間層 4 張，2026-07-08；2026-07-20 新增 Detail + persistent rail，共十張；2026-09-08 新增 Destructive confirm，共十一張）。Component sections demo the unit only — assembly rules live here（判準見 §4.0）。

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

#### 5.1.1 Dashboard home (Layout) · `#pattern-dashboard`

- **trigger**: The landing surface after login — the creator needs a one-glance read of money, alerts, and what to do next.
- **must**: Lead with the full-bleed Hero band, then a KPI bento row (earnings / pending / fans / live items) using `KPI` (headline metric carried by display size, not colour); pair an `Alert` panel ("Actions needed") beside a `Data list` of recent earnings; every money figure states its state (available vs pending) inline.
- **should**: Follow with a trend `Chart` + source breakdown pair; keep orange for one structural accent per viewport (hero fill OR a single highlight tile, not both competing).
- **must-not**: Never stack two orange highlight tiles side by side; never show a bare number without its currency + state; never push primary actions below the fold.
- **_edge-cases**: `empty` → first-run hero with "Create your first project" CTA, KPI tiles show `—` not `0`; `error` → KPI tile shows last-known value + a stale badge; `new-user` → checklist card replaces the trend pair; `mobile` → bento collapses to span-12 single column; `offline` → KPI tiles dim, banner "Showing last synced data".

#### 5.1.2 Tabbed section view (Layout) · `#pattern-tabbed`

- **trigger**: One entity has parallel sub-views of the same dataset (Earnings: Overview / Transactions / Payouts / Tax · E-Shop: Products / Bundles / Auctions · Projects status · Fans views).
- **must**: Use `Tabs` with one active panel; sync the active tab to the URL hash so a view is deep-linkable; each panel opens with its own KPI row scoped to that view.
- **should**: Keep filters (`Chip` group) and export/primary actions in a sticky sub-header inside the panel; preserve scroll position per tab.
- **must-not**: Never load all panels' data eagerly; never let a tab switch silently drop an in-progress filter without telling the user.
- **_edge-cases**: `empty` → panel shows an `Empty stub` scoped to that tab; `error` → inline `Alert --row` at panel top, other tabs still usable; `new-user` → default to the most-actionable tab (Overview); `mobile` → tabs become a horizontally scrollable strip; `offline` → disable Export, keep read views.

#### 5.1.3 Filter + list (Interaction) · `#pattern-filter-list`

- **trigger**: A long, filterable record set the creator scans and acts on (Earnings transactions, payouts, products, fans).
- **must**: Single-select `Chip` group drives a `Data list` (row-divider, not card-per-row); the active filter and result count are always visible; clearing all filters returns to the full set.
- **should**: Make filtering client-side-instant where the set is loaded; offer a Manual entry / Export affordance at the list header.
- **must-not**: Never apply a filter without updating the visible count; never hide the "active filter" state so a user mistakes a filtered list for the whole.
- **_edge-cases**: `empty` (no records) → `Empty stub` with the relevant create action; `error` → keep the filter bar, show retry in the list body; `new-user` → seed with a sample row + dismissible hint; `mobile` → filters collapse into a sheet; `offline` → freeze the set, disable mutating actions.

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
| 6 看細節 | 唯讀看一筆資料的完整內容 | 單獨看一筆用彈窗（預設或 `--wide`）；要跟清單逐筆對照著看用側邊抽屜 Drawer（Q143） | 標題（是哪一筆）→ 唯讀欄位（KV list）→ 明細 | 只有關閉；要動作時放頁尾 | 交易明細、粉絲紀錄、核銷紀錄 |
| 7 提示告知 | 只需要知道（被擋下的原因、說明） | `--narrow` 460px | 發生什麼 → 為什麼 → 怎麼處理 | 一顆「知道了」；可附「前往處理」 | 發布被擋、條件說明 |
| 8 離開未存 | 有未存的變更要離開 | Leave dialog（§4.77） | 有哪些變更沒存 | 繼續編輯＋捨棄 | 建立與編輯流程 |
| 9 選擇做法 | 二選一決定流程往哪走 | 預設 620px | 問句 → 選擇卡（Selection card） | 選了就前進，或取消 | 要怎麼建這些門票 |
| 10 開另一頁 | 在原頁上開另一個頁面 | Embed modal 全畫面 | iframe 內容 | 關閉 | 商店設定、預覽 |
| 11 整頁工作區 | 一整個功能裝進浮層 | 全畫面浮層：`--xwide` 1180px（與 Embed modal 同上限） | 依功能 | 依功能 | 粉絲分級設定、媒體庫彈窗版 |

- **must**（所有類型共通）: Reuse the single canonical dialog chrome（`.payout-dialog` head / body / foot, `payout-modal.css`）+ backdrop + `is-modal-open` scroll-lock；寬度只用 `--narrow`（460）／預設（620）／`--wide`（880）／`--xwide`（1180），跟著類型走，不寫行內寬度（Q142）。「確認後執行」「破壞性確認」「提示告知」三類一律用 `.payout-dialog --narrow`；Leave dialog 只給「離開未存」（Q141）。
- **should**: Focus-trap inside the dialog; primary action right-aligned in the foot; body reuses Field / Data-list / KV list rather than bespoke layouts.
- **must-not**: 不用瀏覽器原生 `confirm()`／`alert()`；never roll a new modal chrome per feature; never stack two modals; never let backdrop-click discard unsaved money input without confirm；可以復原的動作不用紅色確認鈕（Q144）。
- **_edge-cases**: `empty` → open with sensible defaults; `error` → inline `Alert --row` inside the body, dialog stays open; `new-user` → helper line under the title; `mobile` → dialog goes full-width bottom-sheet-like; `offline` → submit disabled with reason.
- **待收斂**（2026-11-09 普查發現；同日已收斂：原生 confirm／alert 全部換成 `js/ztor-dialog.js`、6 個功能的確認改用窄版彈窗、寬度寫死與不合類型的 6 處、受眾報告與核銷紀錄的下載改走匯出確認、`partials/publish-preview.js` 與 `ztorCsv.openLog()` 退場）：收入「貼文報表」的「Export .xlsx」按鈕沒有任何動作，要先定匯出規格；同類重複實作待收成共用（優惠碼建立 3 份、規格圖片 2 份、收益明細 4 份、create-bundle 兩個同名「加入組合物」）；其餘 100 多個彈窗的寬度還沒逐一對照類型。

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
- **Filter chip selection** (`.chip / .chip--active`): single-select within a `.chip-group`; active chip inverts to `--foreground` bg; result count updates on every change.
- **Switch** (`.switch / --on`): 150ms knob slide; track `--muted` ↔ `--primary`.
- **Accordion**: chevron-rotate, height transition on expand/collapse.
- **Motion**: durations 150–240ms, ease-out; all entrance animations gated behind `@media (prefers-reduced-motion: reduce)` (shown immediately when reduced).
- **可點卡片 hover**（2026-10-20，使用者指示，STYLE-DECISIONS Q136，全站同一個答案；取代 Q5 原「借 `--shadow-float` 浮起」）：
  - 適用：卡片**整張臉是一個點擊區**（導頁、開編輯、開彈窗、選一個選項）。
  - 效果：`transform: translateY(var(--clickable-card-lift))`（−4px，2px 在卡片陰影底下看不出來）＋ `background: var(--clickable-card-hover-bg)`（別名 `--control-raise-hover`，按鈕 hover 階：深色 `rgba(222,223,233,.12)`／亮色 `var(--accent)`）。**不換邊框、不換陰影。**
  - `prefers-reduced-motion: reduce`：不位移（底色照換）。
  - 已選的卡（`.x--active`／`.is-active`／`--selected`）只上浮、保留自己的已選底色（`:not(...)` 排除，不另換底）。
  - token：`--clickable-card-lift`（`-4px`）、`--clickable-card-hover-bg`，定義在 `_tokens.css` 亮暗兩個主題區塊（別名要在暗色區塊重宣告才吃得到暗色的 `--control-raise-hover`）。
  - 消費者（位移＋底色）：`.ztor-card--clickable`（`card.css`）、`a.card[href]`／`button.card`（`card.css`，IP Market 的 `<a class="card ipm-card">`）、`.tier-card--clickable`（`ticket-tier-card.css`）、`.project-card`（`shared.css`）、`.selection-card`（`selection-card.css`）、`.radio-cards .segmented__btn`（`radio-card.css`）、`.kpi--tappable`（`kpi.css`）、`.vault-ovcard`（`media-vault.css`）、`.vshare__opt`（`vault-share.css`）、`.payout-bank-card`／`.payout-bank-option`（`payout-modal.css`）、`.live-item`（`live-item.css`，首頁的 `<a class="card live-item">`）。
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
