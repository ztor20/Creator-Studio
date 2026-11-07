# Ztor Creator Studio — Design System 改版歷史

> 2026-11-07 從 `design-system.md` 拆出，內容逐字搬移。

## Changelog

- **2026-08-26** — md 追上 html 這輪的大幅整理（版本號、Pattern cards 拆頁、Radius token 補完、三處內容過時）。
  - **版本標籤**：全檔 12 處「R 2.1」版本標籤（標題、Identity Overview、Pillar 0 Record、Pillar 1 Color 概述、Pillar 4 layer 表頭與範例、chart family、breakpoint、page templates、Appendix A/B）改 R 2.2；2 處歷史沿革句保留不動（`notes` 欄的「R 2.1.6」特定子版本事件、§3.3 dark surface 說明裡「原 r2.1 制」的新舊對照）。
  - **§5.1 Pattern cards** — html 這輪把十張卡從單一表格拆成十個獨立小節（各自掛錨點＋真元件渲染組合實例＋實際使用頁連結）；md 十張卡標題補上編號 5.1.1–5.1.10 與對應 html 錨點 id，並在小節開頭補一張「# / Pattern / html 錨點」對照表。內容核對後與 html 語意一致，未發現需要改寫的規則。
  - **§1.4 Radius** — 補齊六個具名 token 完整列表（`--radius-sm` 3px／`--radius` 6px／`--radius-md` 別名／`--radius-lg` 8px／`--radius-xl` 16px／`--radius-shell` 28px／`--radius-pill` 9999px，值取自 `_tokens.css`），原本的語意角色表（`radius-button-primary` 等）改標「Semantic role」保留在下方。
  - **§4.117 Session list（product-list 群組列）** — 展開把手位置的記載跟上 2026-08-18 的實際改動：由「放在名稱前面（`__product` 改 flex）」改記為「放在名稱文字之後、同一格 `.product-list__title` 內」，並補一段說明原本前置做法為何造成清單左緣斷掉（對照 UI-CHANGES.md 2026-08-18 條目）。
  - 其餘三處核對點（store-settings 獨立頁面骨架、media-vault `.vault-keys`、scanner 多狀態、size-chart-editor 尺碼制／單位切換／指南切換）md 既有記載已與 html 一致，未變動。

- **2026-08-09** — 建立活動第三輪：四支既有元件的視覺語彙收斂，全站生效。
  - **§4.7b Upload tile** — `.upload-tile.is-filled` 撤除 `--status-success` 綠框／綠字（使用者裁示「不該有這種綠框元件」），改實線中性邊＋`--foreground` 文字；已填／未填改由邊框樣式（solid vs dashed）辨別，不再靠顏色，與 `[data-upload].is-filled` 互動格既有配方對齊。全站生效（十幾個消費頁的上傳格皆吃此樣式）。
  - **§4.1 Inventory Radio card** — `.segmented.radio-cards` 補 `align-items: stretch`，修正三卡並排高度不一的根因：grid 預設 `align-items` 是 `stretch`，但 `segmented.css` 的 `.segmented { align-items: center }`（0,1,0）沒被同權重不足的 `.segmented.radio-cards`（0,2,0，本身未設此屬性）蓋掉，卡片因此各自用內容高度置中；本輪顯式補回 `stretch`。
  - **§4.121 Field source tag** — `.is-source-locked .segmented__btn` 撤除 `opacity: .78`，改 `.radio-card__title`／`.radio-card__sub` 直接吃 `--locked-field-ink`（不疊 opacity），與表單控件的 disabled 語彙、與 Upload tile 撤綠框同一個方向：不可改／已完成一律靠顏色或邊框表達，不疊 opacity 弱化整塊。`pointer-events: none` 維持。
  - **§4.6 Switch** — 新增 `.switch--locked` 的 Class API／Variants／States／Do-Don't 記載，並記錄它從 `notification-matrix.css` 上收進 `switch.css` 的原因（tier-settings.html／create-event.html 只連 `switch.css`，掛了 class 卻吃不到視覺）；§4.22i Notification matrix 同步改為只消費、不定義。
  - **§4.1 Inventory Control row** — `.control-group` 新增消費頁 create-event.html（販售方式：「發布後直接開賣」開關，關掉才展開「開賣／停售日期與時間」欄位），計數 11→12 組、5 頁；記錄此消費頁的揭示方向與既有頁相反（關才展開，非開才展開），元件本身不因此分岔，揭示條件一律由消費頁決定。

- **2026-07-29** — 外部協作者併入改版帶進 19 支新元件，補齊 md 側文件（machine contract），html 側 demo 由另一 agent 同步處理。
  - **New §4.92–§4.110**（19 支）：artist-picker（⚠ 退場候選，全站零消費含配套 JS）、benefit-matrix、brand-card、chart-tip（⚠ earnings-sony.html 待收斂，仍留內嵌複本）、checkbox（port 自既有統一設計系統）、detail-sheet、explainer（⚠ media-vault.html 死引用）、fans-guide、inline-edit（✝ 已退場墓碑檔，0 consumers）、manage-ip、media-vault、perf-rank、sortable（⚠ tier-benefits.html 死引用）、numeric stepper（`.zstep`，與既有「Stepper」wizard 進度圓圈為不同元件）、sticky-actions、toast（同步校正 §4.1 Inventory 舊行的過時資訊）、vault-share、wizard-split、zselect。
  - **§4.1 Inventory** 新增對應 19 行＋校正 Toast 舊行。
  - **Pillar 1 §1.1** 修正 `--primary-foreground`（2026-07-28 由 light `#FFFFFF`/dark `#171717` 改為亮暗同值 `#171717`，隨附理由：白字對 `#ffa33f` 僅 1.99:1 不過 WCAG AA）、同步更新 `--on-primary` 說明；新增 `--status-warning-ink`／`--status-accent-ink` 文件化（先前已定義於 `_tokens.css` 但未寫入 md）；新增 Scrollbar token 小節（`--scrollbar-size`／`--scrollbar-thumb`／`--scrollbar-thumb-hover`）。
  - **Pillar 2 §2.1** 同步修正 `--primary-foreground` role 表列值。
  - **New §1.5b Raw-value exceptions — r2.2 新元件**：逐條記錄 8 處裸值（brand-card／chart-tip／checkbox／detail-sheet／media-vault ×4／sticky-actions／fans-guide ×2）之判準與理由；`detail-sheet.css:34` 的遮罩值判定為「應收斂」而非合理例外（與既有 `--overlay-tint` 概念重疊但值不同），記錄供下一輪 CSS 治理處理，本輪未動 CSS。

- **2026-07-21** — Product-detail 補貨紀錄與分頁寬度：一個新元件＋一個既有元件的新修飾子。
  - **New §4.55 Restock log** (`restock-log.css`, 🟡 molecule) — 補貨紀錄表，逐筆一列、欄位對齊（選項組合／補貨數量／日期／供應商／狀態），數量用等寬數字。外層 `.restock-log-wrap` 提供邊框、`--radius-xl` 圓角與水平捲動；`.restock-log--with-option` 供多選項商品開出「選項組合」欄，不掛時該欄含表頭整欄不顯示。取代原本用 `.data-list` 把數量／日期／供應商擠成一行標題＋一行 meta 的寫法——補貨紀錄是要跨列比對的，擠成句子只能一筆一筆讀。Consumer: product-detail.html。
  - **§4.52 Detail rail 新增 `.detail-grid--full`** — 兩欄殼收成單欄、右欄 `display:none`。用於「該分頁內容已自帶完整狀態，右欄再放一次等於重複」或「內容需要整頁寬度」的分頁；何時掛由 consumer 的分頁切換邏輯決定，元件層不判斷。product-detail 的「定價與庫存」分頁使用。

- **2026-07-20** — Product-detail round: three new components promoted + a site-wide type / surface / width adjustment (裁決編號 Q21).
  - **New §4.50 KV list** (`kv-list.css`, 🟢 atom) — read-only key/value row for detail-page meta cards. `.kv--lead` exists because `[hidden]` rows still match `:first-child`; `.kv[hidden]` zeroes `display` explicitly since the component is `display:flex`. Consumer: product-detail.html.
  - **New §4.51 Stock bar** (`stock-bar.css`, 🟢 atom) — 5px quantity bar, two colour states (normal / `--low`); percentage supplied by the consumer as inline `width`, low threshold owned by the product rule not the CSS. Consumer: product-detail.html.
  - **New §4.52 Detail rail** (`detail-rail.css`, 🟠 organism) — detail-page two-column shell (1fr / 300px, sticky rail, single column ≤1100px). Component section covers the shell only; assembly rules moved to a new Pillar 5 pattern card **Detail + persistent rail** (§5.1, now ten cards) per the §4.0 component-vs-pattern boundary. Consumer: product-detail.html.
  - **`form-section.css`** — `.form-section__title` `--fs-18` → `--fs-14` (level with `.field__label`; hierarchy now carried by the card edge, not by heading size); `.form-section__sub` `--fs-14` → `--fs-11` and `--foreground-muted` → `--muted-foreground` (level with `.field__hint` — section sub and field hint are the same supporting-explanation role). Affects every form-section consumer page at once.
  - **`field-system.css`** — `.field__hint` `--foreground-muted` → `--muted-foreground`, reversing the 2026-07-16 lightening decision; hints return to the supporting tier and re-align with `.form-section__sub`. Site-wide.
  - **`kpi.css`** — `.kpi` background `--card` → `--input-surface`. KPI tiles are frequently nested inside `--card`-filled outlined Form sections, where two identical fills merged into one flat surface; one step brighter lets the inner tile sit on top of the card (visible mainly in dark mode, where `--input-surface` is a step above `--card`).
  - **`shared.css`** — 頁寬**改為變體、不做全站收窄**（同日兩次裁決）：`.page` 的 `max-width` 維持 **1280px**；新增窄版變體 **`.page--narrow` = 1056px**，只給 Detail rail（§4.52）的兩欄詳情頁使用——右欄固定 300px，容器留在 1280 會讓左欄行長過長。Q21 原本裁定全站 1280→1056，使用者實看結果後同日改為僅此變體套用，其餘頁面一律維持 1280。consumer：`product-detail.html`、`order-detail.html`（2026-07-23 訂單明細改主欄＋買家資訊右欄）。文件連動：Pillar 1 §1.9、Pillar 6 §6.0 `grid.max-width`、§6.1（新增 `.page--narrow` 條目）、§4.1 Inventory 的 App shell 列；順帶校正這三處原本停留在更舊的 1248px 數字。

- **2026-06-01** — De-branded + cleaned of upstream-source residue to align with `project-ui-creator` skill rules (DSS v1.4).
  - Identity, §5.2 Voice, §5.1 patterns, §5.3 States, §5.5 Workflow rewritten from the upstream source-system (GEO) framing to **Ztor Creator Studio** (creator-economy operations dashboard).
  - §5.1 restructured into **Pattern cards** (5 cards across Layout / Interaction / Lifecycle / Workflow, each `trigger/must/should/must-not/_edge-cases`).
  - §4.0 de-branded (removed Material/Polaris/Brad Frost cross-reference column); §4.1 Inventory rebuilt against the real `ds-components/` files with a `_layer` column (dead `components/` links removed).
  - Similar Systems de-duplicated (kept in Identity); appendices renumbered (B→A Output formats, C→B JSON skeleton); JSON skeleton `record.source`, `component._layer`, and `pattern._cards` updated.
  - Removed the ~475-line upstream marketing/app crawl report (Source notes · Confirmed absent · Sources) — provenance of the upstream source system, not part of this product's design system.
