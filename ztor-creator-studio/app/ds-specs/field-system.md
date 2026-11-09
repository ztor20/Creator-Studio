> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Field system

#### 總表紀錄（原 §4.1 · Field system）

- `_layer`：🟡 molecule
- Status：✓ Project
- CSS：tags">`，控件標 `data-vm-control`；`shared.css` 檢視態 `display:none` 控件、`display:block` 讀數，編輯態反過來。讀數文字：空值「—」、placeholder 永不當值、金額＝前綴單位＋千分位（頁面可 `ZtorViewMode.configure(panel, { format })` 掛自己的格式函式，product-detail 傳 `money()` 與定價表同寫法）、後綴單位是字就隔空白（`1 pcs`）符號貼著（`10%`）、`datetime-local` 的 T 換空白、textarea 讀數 `pre-wrap`；控件 inline style 的 `flex`／`width`／`max-width`／`grid-*` 原封抄給讀數，角色／姓名這種靠 flex 比例分欄的列檢視態仍兩欄對齊。重算時機：面板 `data-mode` 變 view（MutationObserver）、子樹重畫、`i18n:applied`、各頁 `applyReadonly` 明呼 `ZtorViewMode.sync(panel)`。**不碰**：`.variant-table`（Q118 由頁面 JS 畫 `.variant-cell--ro`）、`.tag-input`（chips 就是值，shared.css 去框去 ×，零 chip 才補「—」）、下拉（`.zselect__trigger`／`.select` 由 shared.css 去框去箭頭留字）、`[data-edit-exempt]` 區段、以及例外清單——開關 `.switch`、單選卡 `.segmented.radio-cards`、單選清單 `.radio-list`、選擇卡 `.selection-card`、checkbox 維持原元件但 `pointer-events:none`（狀態展示不是可填框）。同輪 `[data-mode="view"] .field__req` 收起（必填星號是填寫提示）。消費頁：product-detail 商品設定、bundle-detail 組合設定、event-detail 總覽／設定、project-detail 設定、store-settings 店面／銷售預設（`.ss-url` 前綴＋讀數同行，store-settings.css）。DS html 4.x Field system「view mode / edit mode」示範可實際切換。

ONE form field = label / hint / control slot（控件重用 atom）；多欄位怎麼成組、堆疊＝Pillar 5 · Form assembly，非本元件。單獨與 Form section 內皆維持基礎密度 gap 6／欄距 16；產品建立頁同樣遵守此節奏。`.field__hint`／`.field__error` 字級 2026-08-25（Q73）由 `--fs-11` 提到 `--fs-12`（與 `.form-section__sub` 同輪，使用者裁示「用 12、偶數為主」——Q21 已認定兩者是同一種輔助說明角色，只改一邊會變成同角色兩字級）。`.field__hint` 顏色 2026-07-20（Q21）改回 `--muted-foreground`，推翻 2026-07-16 「提亮成 `--foreground-muted` 以便在卡填色上讀得清楚」的決定——說明文字要明確退到輔助層；全站用 `.field` 的頁面一併生效，並與同輪改成同色的 `.form-section__sub` 對齊。**2026-07-22 追加 `.field-readout`**：欄位改「只顯示、不可填」時用它取代 `.input`／`.amount-field`（ui 字體／`--fs-14`／`--foreground`、不畫框不留 input 內距，讀起來是文字不是空欄）；用於商品明細把價格／成本／總量上限改唯讀，改值一律走編輯 popup。**2026-08-06 追加 `.field__hint--ok`／`--warn`**（2026-09-11 promote）：說明行依輸入即時換色——`--ok` 成功綠（有省到）、`--warn` 狀態紅（數字不合法），字級與位置不變；首用建立組合／組合詳情的組合折扣與限時折扣提示句（接手原本 create-bundle 頁內的 `.cb-warn`／`.cb-save`）。**`.field__error`**：欄位級錯誤訊息，位置與字級同 `.field__hint`，顏色改 `--status-error`（可讀的狀態紅，非破壞性操作專用的 `--destructive`；與 bundle-editor 的 `.field__hint.fc-hint--over` 同一支色）；隱藏／顯示用 `[hidden]`，控件同步標 `aria-invalid="true"` 由既有的 `.input[aria-invalid="true"]`（shared.css）畫紅框。首個消費者＝`earnings-sony.html` 捐贈彈窗的金額欄（超過可提領金額／低於所選組織的最低捐款額）。**2026-08-18 追加 `.field-readout--row`**：值 ＋ 行尾一顆動作圖示。複製／開啟這類動作作用的對象就是左邊那個值，貼著它才讀得出關係；擺成底下自成一行的按鈕時，要先讀完按鈕的字才知道它在對誰作用。值過長在自己那一格裁掉（`min-width:0` ＋ ellipsis），不擠動作那一欄。搭 `.field-readout__value` 使用；首個消費情境＝活動詳情的線上房間連結（掃碼器卡同日已先做過同一件事）。**2026-09-18 追加 `.field__hint--fact`**：事實說明——字級、位置、顏色同 `.field__hint`，差別只在**檢視模式（`[data-mode="view"]`）照常顯示**：shared.css 把檢視模式的 `.field__hint` 整批收起（多數說明是填寫指引，唯讀時是誤導），但「原價＝VIP $4,200 × 1 ＋ Tee $600」這種算出來的事實在唯讀時仍是這一格的一部分；例外規則寫在 shared.css 的那一條（`:not(.field__hint--fact)`）。首用組合詳情的原價算式、含票券的平台費口徑、票券成員的數量池說明（D292／D293）。**2026-09-22 `.field__hint` 的寫作準則（STYLE-DECISIONS Q123，適用範圍＝表單分段）**：一段內最多三個文字層級，hint 屬最底那一層；只寫「做決定才需要的資訊」（上限、單位、後果、留空會怎樣），每欄最多一句；把標籤換句話說、重述畫面已表達的操作、講內部公式一律不寫。規則優先用畫面表達（狀態改用列的修飾類與徽章、「選填」交給 placeholder、「不用填」交給「沒有輸入框」），不用句子。首輪落地＝組合包三段（bundle-editor `layout:'split'`、create-bundle） **2026-10-12 opt-in 變體 `[data-vm-style="disabled"]`（使用者指示，UI-CHANGES 一百六十七、STYLE-DECISIONS Q119 補充／Q128 待裁決）**：面板另掛這個屬性時，`js/view-mode.js` 不插讀數，檢視態保留輸入框、下拉（含 zselect 觸發鈕）、textarea、`.date-input`、`.amount-field`、描述編輯器 `.rich-body`，由 `shared.css` 畫成 disabled——透明底、保留 1px 邊界、不出 focus 環、`cursor: default`、值吃 `--view-field-ink`；空值＝空框＋placeholder（不寫「—」）。上方「去框留字」的檢視態規則（下拉、標籤欄、`rich-body.css` 的區塊攤平）一律以 `:not([data-vm-style="disabled"])` 排除。編輯態下頁面用 `readonly` 鎖的欄位（bookyay 帶入、發布設定依階段鎖）在此變體補成與 `:disabled` 同一個樣子（透明底＋`--locked-field-ink`＋not-allowed），`.linkf__input` 除外。首位消費者：event-detail「設定」分頁（唯讀事實——類型、系列、票務摘要、在地化摘要、活動連結——同輪改成永遠 disabled 的 `.input`）。其餘兩段式面板（product-detail、bundle-detail、auction-detail、project-detail、store-settings、event-detail 總覽）仍是 Q119 純文字讀數。 **2026-10-12 同日 Q128 裁決（選項 B＋甲，UI-CHANGES 一百七十六）：disabled 框改成全站唯一的檢視態，opt-in 與 Q119 讀數機制退場**——`shared.css`「檢視模式：表單欄位＝disabled 輸入框」區塊直接作用在 `[data-mode="view"]`（不再看 `data-vm-style`），`js/view-mode.js` 只剩相容空殼（API 保留、不產生節點；殘留的 `data-vm-style`／`data-vm-group`／`data-vm-skip` 屬性無作用），各頁的 `field-readout[data-vm-readout]`、下拉與標籤欄「去框留字」、`rich-body` 區塊攤平規則全數刪除；檢視態 textarea 另收掉拖拉把手（`resize: none`）。消費頁：product-detail 商品設定、bundle-detail 組合設定（售價改永遠 disabled 的 `.input#bd-autoprice`、bookyay 自動建立組合包的購買條件改 disabled `.input[data-bd-rules-fix]`）、auction-detail 標籤區、project-detail 設定、store-settings（`.ss-url` 前綴框整格維持框）、event-detail 設定分頁。**墨色**：`.input:disabled` 等與編輯態 `readonly` 鎖住的框一律 `--view-field-ink`（可讀、過 AA），與檢視態同一個樣子；`--locked-field-ink` 退出輸入框類。；**2026-10-30**：`.field__label--split` 標籤左、右側一句即時讀數同行（右側放 `.field__label-aside`），首個消費：建立商品「鎖定庫存量」右上的「可售 5 件・留倉 15 件」 | [field-system.css](../ds-components/field-system.css) · [input.css](../ds-components/input.css) **2026-09-21 追加兩段式面板的檢視態讀數（Q119 使用者裁決：檢視態的表單欄位一律純文字、按「編輯」才變輸入框，與表格的 Q118 同原則；取代 2026-07-27「回到編輯畫面格式、只是不能編輯」與 2026-09-11「檢視態＝disabled 外觀」）**：`js/view-mode.js` 在 `[data-editable]` 面板裡每個控件根（`.amount-field`〔含 `.zstep`〕、`.date-input`、單獨的 `.input`／`.textarea`、`[data-vm-group]` 併句組）後面寫一顆 `<span class="field-readout" data-vm-readout data-vm-kind="input | textarea | amount | zstep | date | group

### 變體 · Char counter（原 §4.18，2026-11-09 併入）

#### 4.22n Char counter

**`_layer`** · molecule — 限長輸入欄的即時字數計數（主旨 ≤120、內文 ≤2000），到達上限以 `--destructive` 轉紅；計數值由頁面 JS 即時更新。

| Class | 用途 |
|---|---|
| `.field__counter` | 計數文字（tabular-nums） |
| `.field__counter.is-over` | 到達／超過上限的紅色狀態 |

**CSS** — [`field-system.css`](../ds-components/field-system.css)（2026-11-09 由 message-modal.css 搬來）

---

##### 總表紀錄（原 §4.1 · Char counter）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[field-system.css](../ds-components/field-system.css)

限長輸入即時字數
