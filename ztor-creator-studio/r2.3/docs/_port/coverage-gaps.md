# ztorui-skin 覆蓋率稽核 · 漏網元件清單

範圍：`demo/ztorui-skin/{e-shop,product-detail,create-product}.html` 三頁實際 DOM。
比對對象：`skin/ztorui-skin.css`（772 行，2026-08-27 13:06 版）實際生效的選擇器。
判準依據：`_port/ztorui-ds-spec.md`（1722 行，ztor mode 定案值）。

## 方法與進場確認

1. 三頁都用 `mcp__Claude_Browser` 開真瀏覽器（非靜態讀檔），對 `document.querySelectorAll('*')` 逐一收集 `classList`，BEM 根名＝取每個 class 到第一個 `__` 或 `--` 為止，同一元素身上多個 class 只各自算一次根名出現，跨頁彙整成頻次表。
2. **`create-product.html` 進場方式**：頁面預設先蓋一層「What are you selling?」閘門（`[data-cp-gate]`），畫面中央下方那顆 ✕（`.wizard__gate-close`，`data-cp-gate-back`）**不是「進到主體」的按鈕**——讀了頁內腳本（`create-product.html:1477`）確認它是「離開建立流程」（`history.back()`／無上一頁則導去 `e-shop.html`），實測點下去真的整頁跳走到 `product-detail.html`。真正進主體的動作是點兩個類型卡其中一張（`[data-cp-gate-type="physical"]` 或 `"digital"`），對應 `enterWizard()`（`create-product.html:1475`）才會把 `.wizard__gate` 收起、`.wizard__sheet` 顯出。本次掃描用 JS 直接觸發 `physical` 卡片的 click，螢幕截圖確認已進入「NEW ITEM · Physical item」的表單主體（含 Product name／Category／Specifications／Size guide 等欄位）才開始收集 class。
3. 額外驗證：product-detail.html 的分頁式導覽（`.section-nav`）點擊前後 `document.querySelectorAll('*').length` 不變（1538→1538），確認四個分頁內容本來就同時渲染在 DOM 裡（用 CSS 顯隱切換，不是 JS 懶渲染），靜態掃描不會漏掉分頁內容。
4. A 類每一項的「r2.2 現況」欄位都是瀏覽器 `getComputedStyle()` 的實測值，不是讀原始碼猜的。

## 覆蓋範圍聲明（驗收條件第 4 點）

- **沒有掃到**：`.kpi--hero`（大字 KPI 卡的品牌橘變體，`kpi.css:178`）——grep 三份 HTML 沒有任何頁面用到這個 modifier，三頁只用 `.kpi--compact`，所以本次名單不含它；未來若有頁面用到 `--hero`，要另外核對它是否也漏套。
- **沒有掃到**：`payout-dialog`／`payout-modal`／`leave-dialog`／`restock-log` 等彈窗實際「開啟後」的視覺（本次是靜態 DOM 掃描，彈窗多半 `hidden` 但結構已在 DOM 裡，class 頻次因此仍算得到；但沒有逐一點開每個彈窗用截圖肉眼核對）。
- **沒有逐一做 computed-style 實測**：`album-tracks`／`radio-card`／`product-list-scroll` 三個根（頻次都不高、非使用者點名項目）——依它們與其餘 90+ 個已實測透明結構容器同模式（無 background／無 border 的純版面 wrapper）判斷為 C 類，但沒有個別截圖驗證。
- 三頁的 `<style>` 內頁面級 class（`eshop-*`／`cp-*`／`pd-subfields`）與開發用「Cheat Codes」面板（`ztd*`）算進了頻次表，但兩者都判為 C 類（非產品 UI 元件／純版面膠水），理由見下方分類表註記。

---

## 總表：99 個非 utility BEM 根 class

「出現」欄＝`E{n}`=e-shop 出現 n 次、`P{n}`=product-detail、`C{n}`=create-product；同一根可能跨頁出現多次分別列出。「已套用」欄：✅=skin 已有明確選擇器覆蓋、◐=部分覆蓋（容器套了、內部子元素或狀態沒套齊）、✕=完全沒套到（含「靠 token 連帶正確」的情況，會在分類欄註明）。

| 根 class | 出現 | 已套用 | 分類 | 備註 |
|---|---|---|---|---|
| `app-sidebar` | E65 P65 | ◐ | **A** | 容器＋語言面板＋選中態已套（`ztorui-skin.css:303-315,486-497`），預設／hover 連結完全沒套，見下方詳述 |
| `page-crumb` | E1 P2 | ✕ | **A** | 完全沒有明確選擇器；文字色靠 `--brand-ink` token 連帶變橘，但結構／返回鈕未處理，見下方詳述 |
| `kpi` | P19 | ✕ | **A** | 完全沒有明確選擇器；陰影／圓角靠 token 連帶正確，底色與數字排版沒套，見下方詳述 |
| `wizard` | C21 | ◐ | **A** | 只有外殼 `.wizard` 與 `.wizard__sheet--sectioned` 的底紋套了；`.wizard__top`（頂列真正的視覺面）與 `.wizard__bottom`（底部操作列）完全沒套，見下方詳述 |
| `chip` | P12 C11 | ✕ | **A** | 選中態 `.chip--active` 靠 `--selected-surface` token 連帶已經是對的（半透明橘），但**預設未選中**的底色仍是 `var(--card)` 實色，沒有比照 `.input` 給玻璃薄膜，見下方詳述 |
| `field-pill` | E3 | ✕ | **A** | e-shop 工具列的搜尋／篩選 pill，本質是 input 家族（`background: var(--card)`），沒被列進 §7 死角修正的 `.input,.textarea,.select` 清單，見下方詳述 |
| `alert` | E10 | ✕ | **A** | 消費的是 `.alert--bar` 變體，`background:var(--card); box-shadow:var(--shadow-card); border-radius:var(--radius-xl)`——跟 `.card` 一模一樣的配方、只是沒被選到，見下方詳述 |
| `sticky-actions` | P2 | ✕ | **A**（有但書） | product-detail 底部吸附式操作列，`background:var(--card)`。r2.2 原始碼註解明寫「刻意用實色而非毛玻璃：DESIGN.md 明令 backdrop-filter 表面不可淡入淡出」（`sticky-actions.css:21-23`），見下方詳述——套用前建議先跟這條既有規則對齊 |
| `readiness` | C21 | ✕ | B | `background:var(--card); box-shadow:var(--shadow-card); border-radius:var(--radius-xl)`——跟 `.card` 同配方，可直接併入 `.card` 選擇器清單 |
| `preview-card` | C7 | ✕ | B | 同上，`background:var(--card)` 系配方，跟 `.card` 一致 |
| `upload-tile` | P106 C206 | ✕ | B | 大量出現的圖片上傳格；`ztorui-ds-spec.md` 的「未讀取」聲明明寫沒抽這支（不在規格書範圍），依巢狀卡家族（`.nest`/`.card--muted`）推導 |
| `badge` | E164 P4 | ✕ | B | 底色實色 `rgb(22,23,24)`；規格書無 badge 專章，依 Chip 家族（7.5）半透明染色 pill 推導 |
| `stock-bar` | P2 | ✕ | B | 庫存量條，底色實色 `--muted`；規格書無對應章節，優先度低（純度量條，非卡片級表面） |
| `list-toolbar` | E4 | ✕ | B | `background:var(--surface-shell)`（深色下刻意跟 `.card` 不同層級，是「工具列跟頁面齊平」的既有設計）；要不要玻璃化是設計判斷，非機械漏補，列 B 而非 A |
| `album-tracks` | P7 C7 | — | C | 透明版面容器，未逐一實測（見覆蓋聲明） |
| `alert-inset` | E1 | — | C | 透明版面容器（`background:rgba(0,0,0,0)`），已實測 |
| `amount-field` | P18 C23 | — | C | 透明 wrapper，內部消費 `.input`（已套），已實測 |
| `app` | E1 P1 | ✅ | C | 底紋已套（`ztorui-skin.css:578-589`） |
| `app-nav-burger` | E1 P1 | — | C | 純圖示按鈕，未見異常 |
| `app-notif` | E86 P86 | — | C | 通知面板 `.app-notif__panel` 已實測：`background:rgb(33,34,35)`、`border:1px solid rgba(255,255,255,.15)`、`box-shadow:0 12px 40px rgba(0,0,0,.5)`——三個值全部等於 token 層已覆寫的 `--shadow-float`／popover 邊界慣例，靠 token 連帶已經跟彈出層語彙一致，不用另外處理 |
| `app-topbar` | E3 P3 | ✅ | C | 已套（`ztorui-skin.css:322-346`） |
| `bento` | P8 | — | C | 純 CSS Grid 容器，無視覺樣式 |
| `btn` | E52 P18 C15 | ◐ | C | 只有 `.btn--primary` 套了玻璃／霧光（`ztorui-skin.css:383-417`）；`--outline`/`--ghost`/`--soft` 三個變體沒有明確選擇器，但它們的視覺是靠 `color-mix()` 動態算 `--border`／`--foreground`／`--accent`，這三支 token 已在 §2 被改過，效果連帶正確，skin 檔頭註解也點名這是刻意判斷（`ztorui-skin.css:138` 對應規格），故不列為漏補 |
| `card` | E2 P5 C3 | ✅ | C | 已套（`ztorui-skin.css:219-227`） |
| `chip-group` | P1 C2 | — | C | 透明版面容器（flex wrap） |
| `control-group` | P6 C13 | — | C | `border:1px solid rgba(255,255,255,.1); border-radius:24px`，已透過 `--border`／`--radius-xl` token 連帶正確 |
| `control-row` | P9 C29 | — | C | 透明版面容器 |
| `cp-edit-only` | C2 | — | C | 頁面層級顯隱用 class（非 ds-components），無視覺樣式 |
| `cp-subfields` | C3 | — | C | 同上，條件揭露用 class |
| `date-input` | P9 C15 | — | C | 透明 wrapper，內部消費 `.input` |
| `detail-grid`／`detail-main`／`detail-rail` | P2 各 | — | C | 純版面容器 |
| `dropdown` | E707 P4 | ◐ | C | `.dropdown__menu` 已套實色浮層配方（`ztorui-skin.css:350-358`）；707 次幾乎全是 e-shop 商品列每列的操作選單 trigger/item，觸發鈕與選單項本身的顏色靠 `--foreground`／`--border` token 連帶正確 |
| `empty-card` | E14 P4 | — | C | 透明容器 |
| `eshop-list-controls`／`eshop-live-banner`／`eshop-noresult`／`eshop-preview-close`／`eshop-seam-shadow`／`eshop-stock-bar` | E 各 1-2 | — | C | e-shop 頁內 `<style>` 版面膠水（非 ds-components），r22-inventory.md 已核對過零裸色值，全部用 token，靠 token 層連帶正確 |
| `fan-store` | E109 P109 | — | C | 透明容器 |
| `field` | P77 C90 | — | C | 表單欄位 wrapper，透明，內部消費 `.input`/`.select`/`.textarea`（已套） |
| `field-more` | C4 | — | C | 透明容器（「更多規格」摺疊區） |
| `field-readout` | P3 | — | C | 透明容器（唯讀欄位展示） |
| `filter-tabs` | E11 | ◐ | C | 選中膠囊已套（`ztorui-skin.css:466-479`）；未選中項是純文字＋hover，本來就走 `--foreground-muted`／`--accent`，非選中態不需要額外處理 |
| `form-footnote` | C1 | — | C | 純文字，`color:rgba(255,255,255,.45)` 已是正確的 `--foreground-muted` |
| `form-grid` | P5 C6 | — | C | 純 CSS Grid 容器 |
| `form-section` | P53 C48 | ✅ | C | `--outlined` 變體已套（`ztorui-skin.css:264-281`），巢狀退階也處理了 |
| `info-banner` | P6 C6 | — | C | 透明容器 |
| `input` | P22 C22 | ✅ | C | 已套（`ztorui-skin.css:642-653`） |
| `kv` | P18 | — | C | 透明 key-value 列容器 |
| `leave-dialog` | C7 | — | C | 透明容器（離開確認彈窗的版面殼，內部消費 `.btn`） |
| `list-dock`／`list-footer`／`list-status-row` | E 各 1-3 | — | C | 透明版面容器 |
| `main` | E1 P1 | ✅ | C | 底紋已套（`ztorui-skin.css:578-589`） |
| `nest` | C1 | ✅ | C | 已套（`ztorui-skin.css:290-295`） |
| `page`／`page-intro` | E/P 各 1-3 | — | C | 透明版面容器 |
| `payout-dialog`／`payout-modal` | P/C 各 1-9 | ✅ | C | 已套（`ztorui-skin.css:248-257,350-358`） |
| `pd-subfields` | P4 | — | C | 頁內條件顯隱 class，同 cp-subfields |
| `preview-col`／`preview-split` | C 各 2-4 | — | C | 透明版面容器（買家預覽分欄） |
| `preview-panel` | E3 P6 | ✅ | C | `__sheet`／`__backdrop` 已套（`ztorui-skin.css:361-365`＋popover 清單） |
| `product-list` | E722 | ◐ | C | `__row`／`__head`／`__thumb`／`__image` 已套完整列表群組律（`ztorui-skin.css:512-557`）；722 次多數是同一批規則在每一列上重複套用，非漏項 |
| `product-list-scroll` | E3 | — | C | 純 `overflow` 捲動容器，未逐一實測（見覆蓋聲明） |
| `radio-card` | C14 | — | C | 未逐一實測（見覆蓋聲明），與 `radio-cards` 同源，後者已靠 `.segmented` 覆蓋 |
| `radio-cards` | P1 C5 | ✅ | C | 實測即 `.segmented.radio-cards`，直接吃 `.segmented` 已套的玻璃配方 |
| `radio-list` | P23 C23 | — | C | `border:1px solid rgba(255,255,255,.1); border-radius:24px`，靠 token 連帶正確 |
| `restock-log`／`restock-log-wrap` | P13/1 | — | C | 透明版面容器 |
| `search-collapse` | E4 | — | C | 透明版面容器（內部的 `.field-pill` 才是實際視覺，見上方 A 類） |
| `section-nav`／`section-nav-layout` | P6/1 | — | C | 透明版面容器（錨點式分頁導覽） |
| `segmented` | P3 C15 | ✅ | C | 已套（`ztorui-skin.css:423-436`） |
| `select` | P10 C8 | ✅ | C | 已套（`ztorui-skin.css:629-653`） |
| `select-wrap` | C2 | — | C | 透明容器 |
| `spec-row` | P3 | — | C | 透明版面容器（規格表列） |
| `split-button` | E3 | — | C | 透明容器，內部消費 `.btn` |
| `stock-readout` | P3 | — | C | 透明容器 |
| `stock-tip` | E186 | — | C | `product-list__cell` 的延伸修飾詞，透明、純文字，`color` 已是 token 值 |
| `switch` | E35 P3 C7 | ✅ | C | 已套（`ztorui-skin.css:445-463`） |
| `tab-panel`／`tabs` | P4/E4 | — | C | 透明容器；`tabs` 底線色靠 token 連帶正確 |
| `tag-input` | P7 C8 | — | C | 透明 wrapper，內部消費 `.chip`（`.chip` 已列 A，修好後這裡連帶對） |
| `text-sub` | P4 C2 | — | C | 純文字 utility class，`color:rgba(255,255,255,.45)` 已正確 |
| `textarea` | P2 C2 | ✅ | C | 已套（`ztorui-skin.css:642-653`） |
| `upload-assets` | P3 C2 | — | C | 透明容器（`.upload-tile` 才是視覺主體，見 B 類） |
| `variant-builder` | C1 | ✅ | C | 實測 `.variant-builder.nest`，吃 `.nest` 已套的玻璃薄膜 |
| `variant-cell`／`variant-table`／`variant-table-wrap` | P/C 各 1-4 | — | C | 透明版面容器 |
| `vip-card` | P14 C14 | — | C | 透明 wrapper（實際卡面是內部的 `.card`，已套） |
| `zselect` | P25 C20 | ◐ | C | `__panel`／`__trigger` 已套（`ztorui-skin.css:248-257,350-358,636-637`）；其餘（如選項列表項）走 token 連帶 |
| `ztd`／`ztd-hl` | E/P/C 各 2-91 | — | C（開發工具） | 「Cheat Codes」開發面板，非產品 UI，不在換皮範圍內 |

**分類統計**：A＝8、B＝6、C＝85，共 99。

---

## A 類逐項詳述（8 項）

### 1 · 側邊欄導覽項 `.app-sidebar__link` / `.app-sidebar__sub-link`

**r2.2 現況**（`data-nav-mode="sidebar"`，實測 `.app-sidebar__link`）：
- 預設：`background: transparent`、`color: rgba(255,255,255,0.7)`、`border-radius: 16px`（即 `--radius-lg`）
- hover：`background: var(--accent)` → 實測算出 `#2A2B2C`（不透明深灰方塊）、`color: var(--foreground)`
- 選中態（`[aria-current="page"]` / `--active`）：已套用玻璃橘光（`ztorui-skin.css:486-497`）

問題：容器 `.app-sidebar` 已經是玻璃（`ztorui-skin.css:303-309`），但 hover 態疊上去的是一塊**不透明深灰方塊**（`#2A2B2C`），跟玻璃殼材質不一致；且形狀是 16px 圓角矩形，不是規格書要求的膠囊。

**新風格要求**（規格書 §7.8 Sidebar）：
```css
.sidebar__item { color: var(--text-mid); border-radius: var(--r-pill); }
.sidebar__item:hover { background: var(--surface-2); color: var(--text); }
```
`--surface-2` 展開值＝`rgba(255,255,255,0.06)`（規格書 §1.1）——半透明白膜，不是實色灰塊；圓角是 `--r-pill`（全圓），不是 `--radius-lg`。

**對應關係**：規格書 `.sidebar__item` → r2.2 `.app-sidebar__link`／`.app-sidebar__sub-link`／`.app-sidebar__group-toggle`（後者同時帶 `.app-sidebar__link`，會一併吃到同一條規則）。修法：新增 `html[data-ztorui] .app-sidebar__link:hover, html[data-ztorui] .app-sidebar__sub-link:hover { background: rgba(255,255,255,0.06); color: var(--foreground); }`，並把 hover／預設的 `border-radius` 改成 `var(--radius-pill)`。⚠ 不要動 `--accent` token 本身（skin 檔頭 §2 已註明 `--accent` 是全站共用的 hover 底色，改 token 會把其他非導覽的 hover 也牽動）。

品牌標記（`.app-sidebar__brand`／`__brand-name`）已實測顏色正確跟隨 token（白 95%／45%），不需另外處理。

---

### 2 · 麵包屑 `.page-crumb` / `.page-crumb--back`

**確認：規格書沒有麵包屑元件**——全文 grep「crumb」「breadcrumb」零命中，符合既有記錄「待建元件」的說法。以下是依鄰近家族推導的建議值，非規格書明文。

**r2.2 現況**（實測，product-detail.html）：
- 容器 `.page-crumb`：`color: rgb(255,193,120)`、`font-size: 12px`——這個橘色其實已經是對的，因為它讀的是 `--brand-ink` token，而 skin §2 已經把 `--brand-ink` 改成 `var(--ztu-orange-hi)`（`#ffc178` = `rgb(255,193,120)`），純屬 token 連帶正確，不是刻意套的
- 返回圓鈕 `.page-crumb__back`（實為 `.btn.btn--icon-circle.btn--sm`）：`color: rgba(255,255,255,0.45)`，底色讀原始碼是 `background: var(--muted)`（`button.css:195`），hover `background: var(--accent)`（同上第 1 項的不透明灰塊問題）
- 其餘麵包屑節點（`E-Shop` / `/` / `Physical merch` / `/` / 當前頁名）都是 `<a class="card__link">` 或裸 `<span>`，同樣靠 token 連帶顯示正確橘色

**建議值**（依相鄰家族推導）：
- 非當前層級（可點擊的上層麵包屑文字）：比照規格書「次級文字」慣例，用 `--text-mid`（70% 白）而非目前的橘——目前**全部**麵包屑節點都是橘色（因為都讀同一個 `--brand-ink`），沒有「當前層級 vs 可回頭層級」的視覺區分，這是新皮尚未定案的地方，不是「漏套」而是「規格沒定義、現況又剛好因為 token 連帶而過度上色」，建議之後跟使用者確認要不要收斂成「只有最後一個層級／或都不上色，改純文字連結」。
- 返回圓鈕：依規格書 §7.16 Icon Button 的 `.icon-btn--glass` 變體（`background: var(--glass-bg); backdrop-filter: blur(var(--blur-glass)); border: 1px solid var(--line)`）覆寫 `.page-crumb__back` 或更廣的 `.btn--icon-circle`，讓它跟側欄容器、頂欄同一種「玻璃圓鈕」語彙，而不是目前的不透明 `--muted` 深灰底。

**對應關係**：規格書 `.icon-btn--glass` → r2.2 `.btn--icon-circle`（範圍要縮小到 `.page-crumb__back`，避免波及站上其他用 `.btn--icon-circle` 的地方，如通知鈴鐺、關閉鈕）。

---

### 3 · KPI 卡與數字排版 `.kpi` / `.kpi__value`

**r2.2 現況**（實測，product-detail.html「Units sold: 92」，`.kpi.kpi--compact`）：
- 卡面：`background: rgb(42,43,45)`（讀原始碼＝`var(--card)`，`kpi.css:32`）、`border-radius: 24px`、`box-shadow: rgba(0,0,0,.45) 0 24px 60px 0, rgba(255,255,255,.15) 0 1px 0 0 inset`——陰影兩個值其實已經等於 skin §2 改過的 `--shadow-card`／`--shadow-edge-top`，**跟 `.card` 是完全相同的配方**（`kpi.css:27-33`：`background:var(--card); box-shadow:var(--shadow-card),var(--shadow-edge-top); border-radius:var(--radius-xl)`）
- 數字 `.kpi__value`：`font-size: 22px`（inline `style="font-size:var(--fs-22)"`）、`font-weight: 400`（讀原始碼＝`var(--fw-regular)`，`kpi.css:56`）、`color: rgba(255,255,255,.95)`、無任何整數／小數分色——HTML 是純文字節點 `<div class="kpi__value" style="...">92</div>`，沒有拆分整數／小數／單位的 `<span>`

**新風格要求**（規格書 §8.4 數字排版規則＋ §1.4）：
> 整數段全亮、小數段與千位尾段降為 38% 白（`--num-dim`）、單位縮至 0.44em 同樣降暗；一頁一個 display 級數字群，其他退到 num-sm 以下

字級對照：`--fs-num-lg: 44px`（主 KPI）／`--fs-num-sm: 24px`（小型數值）。

**對應關係與施工限制**：
1. **卡面**：`.kpi` 用的 `var(--card)` 跟 `.card` 完全同源，直接把 `.kpi` 併入 skin §3.1 現有的玻璃選擇器清單（`html[data-ztorui] .card` 那條）即可，不用另外設計新配方。
2. **數字降階（顏色）**：`font-weight: var(--fw-regular)` 這個宣告是 class 層級（非 inline），可以直接用 `html[data-ztorui] .kpi__value { font-weight: 300; }` 改成 ztorUI 的 Light 字重，這步不受紅線限制。
3. **數字降階（整數／小數分色）做不到**——⚠ 這是本次稽核的一個施工限制，不是漏看：規格書要求的「小數與單位獨立降到 38% 白」需要 HTML 把數字拆成 `<span class="int">92</span><span class="dim">.5</span>` 這樣的結構，但 `.kpi__value` 目前是純文字節點，而 skin 檔頭紅線明寫「三頁 `.html`／`ds-components/`／`shared.css` 一個位元組都不改」。這三頁掃到的 KPI 數字剛好都是純整數（無小數、無單位字尾），所以「數字降階」規則在這三頁的實際視覺影響有限；但若之後要完整實作這條規則，必須先跟使用者確認能否局部放寬 HTML 紅線，或改用 JS 在執行期包 span（同樣違反 `js/` 不動的紅線），這是一個需要另外決策的範圍，不能只用 CSS 覆寫層解決。

三頁只用到 `.kpi--compact`，`.kpi--hero`（品牌橘大字版）沒出現，不在本次名單內（見覆蓋範圍聲明）。

---

### 4 · 精靈頂欄／底欄 `.wizard__top` / `.wizard__top-bar` / `.wizard__bottom`

**結構澄清**：`.wizard__top-bar` 本身只是一個 CSS Grid 版面容器（三欄：返回鍵＋標題 / 進度條 / 儲存狀態＋動作），真正承載底色與陰影的是它的父層 `.wizard__top`（`shared.css:1107`，`position:sticky; top:0; z-index:30`）。

**r2.2 現況**（實測，create-product.html 進入精靈主體後）：
- `.wizard__top`：`background: rgb(12,13,13)`（讀原始碼＝`var(--card)`）、`border-bottom: 0`、`box-shadow: none`、`backdrop-filter: none`——**完全不透明**，靠一個獨立的 `::before` 偽元素做邊緣陰影（`edge-shadow` 手法，`shared.css:1124`），不是靠 border/box-shadow
- `.wizard`（外殼）已經有 skin 的底紋（`rgb(28,29,30) radial-gradient(...)`），所以畫面上是「玻璃底紋殼 + 一條完全不透明的深色頂列黏在上面」，材質明顯斷開
- `.wizard__bottom`（底部 Save / Start selling 操作列）：`background: rgb(28,29,30)`（＝`var(--surface-shell)`）、`position: static`（非 sticky）、無 border／shadow，同樣完全不透明

**新風格要求**（規格書 §2.3 Topbar，ztor 展開值）：
```css
.topbar--glass {
  background: var(--glass-bg);              /* rgba(255,255,255,0.07) */
  backdrop-filter: blur(var(--blur-glass));  /* 24px */
  border-bottom-color: var(--line);
}
```
這正是 skin 已經套在 `.app-topbar` 身上的同一組配方（`ztorui-skin.css:322-328`）。

**對應關係**：`.wizard__top` 角色上等同 `.app-topbar`（都是「固定在內容上緣的 sticky 頂列」），建議直接複用 `.app-topbar` 那組玻璃宣告，選擇器改成 `html[data-ztorui] .wizard__top`；`.wizard__bottom` 沒有直接對應的 spec 元件，但依「頂／底成對的殼層 chrome」邏輯，建議給同一組材質語言（半透明＋blur），或至少統一用 `--surface-shell` 之外再疊一層邊界／投影，避免跟已經玻璃化的 `.wizard` 底紋、`.card`／`.form-section--outlined` 內容卡「材質斷層」。

---

### 5 · Chip 預設（未選中）底色 `.chip`

**r2.2 現況**（實測，create-product.html「Add spec」的規格 chip）：`background: rgb(42,43,45)`（讀原始碼＝`var(--input-surface)` → 展開＝`var(--card)`，`chip.css:32`）、`border-radius: 9999px`、`color: rgba(255,255,255,0.7)`——不透明實色膠囊。

**已經對的部分**：`.chip--active`（選中態）目前已經是對的——`background: color(srgb 1 0.639216 0.247059 / 0.13)`（＝ 13% 品牌橘）、`color: rgb(255,193,120)`，這是靠 skin §2 改過的 `--selected-surface`／`--brand-ink` token 連帶生效，不是刻意套的，但效果剛好正確。

**新風格要求**（規格書 §7.5 Chip）：`.chip { background: var(--surface-2); }`，展開值＝`rgba(255,255,255,0.06)`——半透明白膜，不是不透明卡色。

**對應關係**：skin §7 死角修正已經把 `.input`／`.textarea`／`.select` 的底色從 `var(--card)` 改成 `rgba(255,255,255,0.06)`（`ztorui-skin.css:642-647`），`.chip` 的預設態走的是完全一樣的邏輯（原本也是 `--input-surface`），只是被漏列——建議把 `.chip`（僅預設態，`.chip--active` 已經另外處理好，不要動）併入同一條選擇器。

---

### 6 · 搜尋／篩選 Pill `.field-pill`

**r2.2 現況**（實測，e-shop 工具列搜尋框 `.field-pill.search-collapse__field`）：`background: rgb(33,34,35)`（讀原始碼＝`var(--card)`，`field-pill.css:26`）、`border-radius: 10px`、`border: 1px solid var(--border)`。這顆 pill 本質上就是一個 input（`field-pill.css` 檔頭自述：「search / select / dropdown-trigger」），只是沒用 `.input` 這個 class 名。

**新風格要求**：同上第 5 項，輸入控件底色統一應為 `rgba(255,255,255,0.06)`（規格書 §7.3 Input）。

**對應關係**：把 `.field-pill` 併入 skin §7 現有的 `html[data-ztorui] .input, .textarea, .select { background-color: rgba(255,255,255,0.06); box-shadow: 0 0 0 1px var(--border); }` 選擇器清單即可，配方完全通用、不用重新設計。

---

### 7 · 通知條 `.alert`（`.alert--bar` 變體）

**r2.2 現況**（實測，e-shop 低庫存通知條）：`.alert.alert--bar.alert--inset-card`：`background: rgb(28,29,30)`（讀原始碼＝`var(--card)`，`alert.css:302`）、`border-radius: 24px`、`box-shadow: none`（實測 none，可能因為疊在其他容器內被覆蓋，但原始碼宣告的是 `var(--shadow-card)`）。

**對應關係**：`alert.css:296-304` 的 `.alert--bar` 宣告——`background:var(--card); border-radius:var(--radius-xl); box-shadow:var(--shadow-card)`——跟 `.card` 逐字相同，屬於「同配方、換了個 class 名」，可以直接併入 `.card` 的玻璃選擇器清單，不需要另外設計。三頁只消費到 `--bar` 這個 density 變體，`--card`／`--row`／`--banner` 三個變體沒出現，不在本次範圍。

---

### 8 · 底部吸附操作列 `.sticky-actions`（有既有規則衝突，需先確認）

**r2.2 現況**（實測，product-detail.html）：`background: rgb(33,34,35)`（讀原始碼＝`var(--card)`）、`box-shadow: 0 -6px 16px rgba(0,0,0,.08)`（上緣陰影，非 token 值，寫死）、`position: fixed; bottom:0`。

**⚠ 既有設計限制**：`sticky-actions.css:21-23` 原始碼註解——
> 表面沿用 `.ss-actionbar` 的語彙（`--card` ＋ 上緣 hairline），讓站上兩處吸附式動作列看起來是同一個東西。**刻意用實色而非毛玻璃：DESIGN.md 明令 backdrop-filter 表面不可淡入淡出，實色才能安心做透明度動畫。**

這代表 r2.2 自己的設計系統已經明文規定「這個元件會做透明度動畫，所以故意不用毛玻璃」——這不是隨機沒套到，是一條已知、有理由的既有規則。目前它跟三頁其他已玻璃化的卡片／頂欄材質不一致（視覺上會覺得「這條特別重」），但直接套玻璃可能違反這條動畫限制。

**建議**：列為 A 是因為它視覺上確實突兀（product-detail 頁面唯一還留著純實色卡片語言的大面積表面），但**動手前建議先跟使用者確認**：是否要接受「這裡例外維持實色」，或者這三頁的 demo 沙盒範圍內沒有透明度淡入淡出的動畫需求、可以安全玻璃化。不建議在沒有這個確認的情況下直接套用。

---

## B 類摘要（6 項，家族可推導、非規格書直接對應）

| 根 | 推導家族 | 建議做法 |
|---|---|---|
| `readiness` | `.card` 配方相同 | 併入 `.card` 玻璃選擇器（同 A-3／A-7 的「同配方換名字」模式） |
| `preview-card` | `.card` 配方相同 | 同上 |
| `upload-tile` | `.nest`／`.card--muted` 巢狀卡家族 | 給 `background:rgba(255,255,255,.06); border:1px solid var(--border)`，不加 blur（規格書 §5 巢狀層不上 backdrop blur 的原則） |
| `badge` | Chip 家族（規格書 §7.5） | 依語意套對應色相的 tint（如 neutral badge 用 `--surface-2`），不要維持目前的不透明實色 |
| `stock-bar` | 純度量條，優先度低 | 可維持現況或简单改用 `--surface-2` 當軌道底，非急迫 |
| `list-toolbar` | 跟 `.wizard` 外殼同層級（`--surface-shell`），非卡片層級 | 設計判斷題：維持跟頁面齊平的不透明工具列（現況），或升級成玻璃卡跟其餘元件materia一致——建議跟使用者確認要哪一種，不是機械漏補 |

---

## 三個最嚴重的斷層

1. **側邊欄容器玻璃化了，但導覽項本身沒有**——`.app-sidebar` 殼是玻璃，滑過任何一個導覽連結卻跳出一塊不透明深灰方塊（`#2A2B2C`），是材質對比最刺眼的地方，且形狀（16px 圓角矩形）也不是規格書要求的膠囊。
2. **KPI 數字卡完全沒進玻璃化名單，即便它跟 `.card` 是同一份 token 配方**——`.kpi` 的 `background:var(--card); box-shadow:var(--shadow-card); border-radius:var(--radius-xl)` 逐字對應 `.card`，只是 class 名不同就被漏掉；同一種「配方相同、名字不同」的漏項還有 `.alert--bar`／`readiness`／`preview-card`，屬於系統性遺漏，建議修的時候一次把這幾個都併進 `.card` 選擇器，不要逐一補。
3. **精靈（create-product）進到主體後，整個頂列與底列維持完全不透明**——`.wizard__top` 用 `::before` 邊緣陰影取代玻璃邊界、`.wizard__bottom` 更是連陰影都沒有，跟已經套了底紋＋glow 的 `.wizard` 外殼材質斷層最大，是三頁裡「一進去就違和」的第一眼問題。

---

## 覆蓋範圍聲明

已涵蓋：三頁完整 DOM（含 create-product 進入 wizard 主體後的表單狀態）、`skin/ztorui-skin.css` 全 772 行逐行讀取、`ztorui-ds-spec.md` 全 1722 行結構與相關章節、r2.2 對應原始碼（`kpi.css`／`chip.css`／`field-pill.css`／`alert.css`／`sticky-actions.css`／`list-toolbar.css`／`button.css`／`shared.css` 側欄與精靈相關段落）逐一核對。

未涵蓋（見「覆蓋範圍聲明」段落已列出的四點）：`.kpi--hero`（三頁未使用）、彈窗開啟後的肉眼截圖核對、`album-tracks`／`radio-card`／`product-list-scroll` 三個低頻根的 computed-style 個別實測、規格書明文聲明未讀取的 `upload-tile.css`／`tooltip.css`／`table.css`／`avatar.css` 等元件本身的規格定案值（本次 `upload-tile` 的 B 類建議是依鄰近家族推導，非規格書明文）。
