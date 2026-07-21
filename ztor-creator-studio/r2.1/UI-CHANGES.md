# Ztor Creator Studio · R 2.1 · UI-CHANGES

> 嚴格分區：**A** spec-derived 新增 · **B** 反饋導入 · **C** 撤除（intentional removal）· **D** infra / 文件。Bug 修正不寫。
>
> 每筆紀錄日期 + 範圍 + 動機（為什麼這樣設計）。R 2.1 是從零搭起，所以首筆紀錄包山包海；之後的調整一筆一筆來。

---

## 2026-07-21 · 電子商店商品清單移除規格數／限量徽章（C 撤除）

使用者看過上一輪（UIA-066 那筆）改完的畫面後回饋：Coastline tee／hoodie 名稱後的「4 種規格」「6 種規格」徽章、Coastline acetate 名稱後的「限量」徽章都是多餘的——庫存欄已經是「21 / 50」能直接看出限量，規格種類則已經由名稱下方的灰色副標（`__meta`，「顏色（Black/Sand）× 尺寸（S/M/L）」這類文字）呈現，徽章與這兩者是重複資訊。

- **【C】** `e-shop.html` 移除三個 `badge badge--neutral badge--inline` 徽章（`e-shop.row2.variants`／`e-shop.rowH.variants`／`e-shop.row.limited`），連同 `js/i18n.js` 對應三個 key 一併刪除（皆已確認無其他頁面引用）。`__meta` 副標與 `__stock` 格式維持 UIA-066 那筆的內容不變，本次只拿掉徽章，不影響規格副標與庫存的文字規則本身。
- `.badge--inline` 元件本身不受影響（`order-detail.html`「Limit 2/person」「Awaiting pickup」、`orders.html` 取貨提醒仍在用），只是 E-Shop 這個特定用法被撤除；`design-system.html` Class API 的 `--inline` 示範改用 order-detail 的真實案例，`design-system.md` 的 Badge 條目與 Product list Variants 條目同步註記。
- 影響範圍：僅 Coastline tee／hoodie／acetate 三列的商品名稱；分類欄、庫存欄、JS 動態填充的 21 筆商品皆未變動（那批本來就沒有這個徽章）。

## 2026-07-20 · 電子商店商品清單三處內容對齊 Figma（A 規格補齊 · UIA-066）

使用者提供 Figma 參考（node 845-12576），要求電子商店「商品」分頁清單三處內容規則對齊：商品名稱副標、分類欄、庫存欄。

- **【A · 規格副標】** `.product-list__meta`：單一規格商品固定顯示「單一規格」（新 i18n key `e-shop.variant.single`，取代 row1/row4/row5 各自的 `rowN.meta`）；多規格商品顯示「維度（選項）× 維度（選項）」——Coastline hoodie 原本就是這個格式（拿掉多餘的「連帽衫 · 」前綴），Coastline tee 補成「尺寸（S/M/L/XL）」。JS 動態填充的 21 筆商品（`document.querySelector('[data-eshop-panel="products"]')` 那段 IIFE）同步：僅 Tee 兩款有真實尺寸選項改用 variant 欄位，其餘 19 筆一律「單一規格」（原本各自的格式描述文字如「貼紙·12入」不再顯示，改為統一的規格副標語意）。
- **【A · 分類兩行】** 新增元件層 class `.product-list__cat-sub`（子分類，白字 `--foreground`）／`.product-list__cat-main`（主分類，灰字 `--muted-foreground`），`.product-list__category-cell` 改放兩個 span；主分類用共用 i18n key `e-shop.cat.physical`／`e-shop.cat.digital`（不必每列各自定義），依各列 `data-type` 挑選。9 筆命名商品＋21 筆 JS 填充商品皆套用（填充商品主分類固定「實體商品」，因為 ITEMS 陣列全是實體品）。
- **【A · 庫存格式】** `.product-list__stock`：無限量商品「剩餘 / ∞」（取代原本「X left」／「剩 X 件」），限量商品「剩餘 / 上限」（Coastline acetate 原本就是 `21 / 50`，格式已對，未變動）。
- **呈現假設記入 UIA-066**：數位商品（單曲／電影／EP／會員卡）在 Figma 稿子也顯示「48 / ∞」，但三列數字相同、疑似佔位假資料，且數位商品無實體庫存概念——經使用者確認，數位商品庫存維持純 `∞`、不採用 Figma 字面值捏造銷售數字；數位商品的 `__meta` 也維持原本格式描述文字（音樂單曲·MP3+FLAC 等），不套用規格副標規則（數位商品無「規格」概念）。
- 影響範圍：僅 `e-shop.html` 商品（Products）分頁；套組（Bundles）／競標（Auctions）分頁的 `category-cell` 是不同語意（成員／分類），未觸碰。
- 文件同步：`design-system.md`／`design-system.html` 的 Product list 條目與 Class API 表補充兩行分類的說明；`ASSUMPTIONS.md` 新增 UIA-066。check_ds_sync 全 PASS、Playwright 逐列量測 30 筆 Products 資料＋i18n 中英切換皆確認正確、bump `20260721a`。

## 2026-07-20 · 商品明細改版：兩欄版型＋右側常駐 meta 欄，連帶四項全站視覺尺度裁決（B 反饋導入 · A 規格對齊 · C 撤除 · Q21）

起點是使用者要求「依照 `docs/黑夜版風格探索-midnight.html` 的商品明細改 r2.1」，中途改以 Figma node `845-10300` 為準；經約十輪逐項截圖回饋定案。先在 `docs/商品明細-midnight版型-預覽.html` 做獨立預覽頁反覆對版，確認後才落地。

### 【B】版型：單欄分頁 → 兩欄（主欄＋右側常駐 meta 欄）

- 分頁列橫跨全寬，其下分左右兩欄。左欄放分頁內容，右欄是**跨分頁常駐**的唯讀狀態欄（sticky），切到任何分頁都看得到庫存、交付、關聯——這是本次改版的核心：改東西前要先知道的資訊不該藏在某個分頁裡。
- 分頁由 5 個併為 4 個：**總覽**（原總覽＋原基本資訊）／定價與庫存／交付與取貨／關聯。原總覽的庫存健康與專案引用移進右欄，銷售摘要留在總覽最上方。
- 右欄三張卡：**當前庫存**（量條＋庫存 3/50＋補貨鈕）／**交付與取貨**（取貨方式二選一，選物流配送顯示發貨地址、選 QR 領取顯示領取場次，由既有 `data-when-delivery` 連動）／**使用中**（專案／組合引用）。

### 【B】新元件三支（promote，鐵律 1）

- `ds-components/detail-rail.css` — `.detail-grid` / `.detail-main` / `.detail-rail`。詳情頁兩欄殼，右欄 sticky、≤1100px 收單欄。內含一條必要的權重覆寫：元件層 `.form-section--outlined:not([hidden]) ~ …` 的 24px margin-top 會疊上 flex gap 變成 48px，在此歸零讓右欄間距只由 gap 決定（與左欄同為 24px）。
- `ds-components/kv-list.css` — `.kv` / `.kv__k` / `.kv__v` / `.kv--lead`。唯讀鍵值列。**`.kv[hidden]` 必須顯式歸零 display**：本元件用 flex，會蓋過瀏覽器對 hidden 屬性的預設 `display:none`——這是實作時真的踩到的坑（兩種取貨方式同時顯示）。
- `ds-components/stock-bar.css` — `.stock-bar` / `__fill` / `__fill--low`。細長量條，低於低庫存門檻轉紅（`--destructive`）。百分比由 consumer 以 inline style 提供（那是資料不是樣式）。

### 【Q21】四項全站視覺尺度（詳見 STYLE-DECISIONS.md Q21）

這四項動到的是共用元件與 token，依鐵律 9 不能留在頁面 `<style>`。已在明確告知影響範圍（15–28 頁）後由使用者裁決**全站套用**：

- `.form-section__title` 18→14px（同 `.field__label`）
- `.form-section__sub` 14→11px、色階壓暗（同 `.field__hint`）
- `.field__hint` 壓暗成 `--muted-foreground`——**推翻 2026-07-16 的反向提亮決定**
- `.kpi` 底色 `--card`→`--input-surface`（卡中卡不再同色相糊）
- 頁寬：**新增 `.page--narrow`（1056）只給商品明細用，`.page` 維持 1280**（同日修訂；原裁決是全站收窄，使用者看過實際結果後改為變體）

### 【A】對齊 Figma 845-10300 的內容調整

- 素材區改成一排四格（主圖／＋／＋／more），尺寸一致；由 `upload-showcase--stacked` 改回 base `upload-showcase`，未動共用元件。
- 欄位順序改為 標題 → 描述 → 主分類／次分類 → 規格；「新增規格」改通欄按鈕。
- 銷售摘要包進 outlined 卡、補副標、右上連結改「查看更多 →」；KPI 由三個改四個（已售／營收／扣費後淨利／轉換率）。
- 麵包屑「商品」→「實體商品」；頁首去縮圖、只留單一狀態徽章。
- 狀態徽章去橘改中性——除對齊 Figma，亦符合 Q8「品牌橘只給主操作與主分類」。

### 【C】撤除（依使用者逐項指定）

頁首的庫存過低徽章與商品描述、右欄的低庫存門檻與上架中兩列、專案引用的影響範圍說明與變更影響副標、主分類的「建立後不可變更」提示、頁首的補貨鈕（入口收斂到右欄當前庫存卡）。**其中專案引用的兩項是規格 §2.4 明列的組成項，移除後規格與畫面不一致——已記入 ASSUMPTIONS UIA-065 待上游裁決。**

### 產品缺口（UIA-062～065）

轉換率 KPI、組合引用、次分類鎖定、以及上述【C】的規格落差，四項均為上游未定義或與規格不符，已記入 `ASSUMPTIONS.md`，未回寫 `documents/`。

### 收尾

i18n 新增 18 個 `product-detail.*` key（已驗證頁面 0 缺 key）；bump `20260720j`；Playwright 逐頁量測 index／create-product／e-shop／earnings／settings／product-detail，0 水平溢出；頁寬僅 product-detail 用 `.page--narrow` 1056、其餘頁維持 1280。

---

## 2026-07-20 · `--ip` 列 hover 改浮起，比照拖曳抬起態（B 反饋導入 · Q5 scoped 例外）

使用者比對 `--eshop` 拖曳握把的抬起效果後，指定「hover 效果要跟 drag 的 style 一樣」。

- **【B】** `.product-list--ip .product-list__row:hover` 由 base 的純換底色（`--accent`）改成 `--card` 底＋`--radius-md`＋`--shadow-float`，跟 `.is-dragging`（拖曳抬起態）同一種浮起視覺；`position:relative;z-index:1` 避免陰影被相鄰列的 hairline 分隔線切掉。
- **牴觸 Q5、記為 scoped 例外**：Q5 裁決「清單列 hover 只換底色，只有可點卡片才浮起」，本次是使用者當次明確指定、非默默偏離——已記入 `STYLE-DECISIONS.md` Q5 的 scoped 例外（僅 `--ip`，其餘 5 個變體不受影響）。
- 順手修一個文件殘留：`design-system.html` 的 Product list Behavior details 表格原寫 base hover 是 `--muted`，實際 CSS（Q9 2026-07-13）早已是 `--accent`，文件跟程式碼不同步多時，一併修正。
- check_ds_sync 全 PASS、bump `20260720i`。

## 2026-07-20 · 我的 IP 清單改表格化，對齊 spec 5.1.4 §F6 的 8 欄定義（A 規格補齊 · 新元件變體 · UIA-061）

使用者反饋「我的 IP 版面跟電子商店不像」，指的不是圖示顏色（那已經一致），而是整體版面——`my-ip.html` 原本用 `.data-list` 卡片式清單，把 IP 名稱、權利資訊、租出數、收入、租金全部擠成一行文字（如「Maya Chou · 租出3 · 收入$2,180 · 分潤100% · 租金$480/6個月」）。查證 `documents/5.1.4-我的IP.md` §F6「清單頁欄位與互動」發現：**規格本來就定義了 8 個獨立欄位**（IP／權利資訊／租出數／收入／租金／Mktplace／Manage），現有實作沒有照著做——使用者的直覺跟規格是一致的，不是新提案。

- **【A · 新元件變體 `.product-list--ip`】** 比照 e-shop/orders/pickup 既有的「同一組 grid 換一批欄位模板」手法，在 `product-list.css` 新增 8 欄版型：icon(60px) / IP 名稱＋標籤 / 權利資訊 / 租出數 / 收入 / 租金 / Mktplace(開關，新 `.product-list__mktplace` cell) / Manage。含 ≤760px 響應式堆疊規則（同 --orders/--pickup 手法）。
- **【A · my-ip.html 表格化】** 兩段清單（「在 Ztor 上產出的 IP」5 筆／「Ztor 之外的 IP」3 筆，現有樣本各 3 筆／1 筆）改用新變體，含表頭列（IP/權利資訊/租出數/收入/租金/Mktplace）。**純拆欄、不動資料**：原本擠在單一 meta 字串裡的權利資訊/租出數/收入/租金原樣拆進對應欄，數字文字皆未改動。i18n 新增 `my-ip.col.*`（欄位表頭）＋ `my-ip.rowN.rights/rented/revenue/price`（原 `rowN.meta` 拆開，取代舊 key）。
- **【D · 頁面樣式依賴切換】** `my-ip.html` 移除 `data-list.css`、改載 `product-list.css`（`.data-list` 元件仍供其餘 14 頁使用，未退場）。JS 計數改抓 `.product-list__row`。
- **呈現假設記入 UIA-061**：spec §F6 IP 欄要求「發布或登記日期」，現有前 3 筆 demo 資料本來就沒有日期值，本輪未捏造日期、暫不顯示；第 4 筆（Ztor 之外的 IP，原本就有登記日期）保留在 `.product-list__meta` 顯示。
- 文件同步：`design-system.md` Product list 條目與 Variants 段補 `--ip`；`ASSUMPTIONS.md` 新增 UIA-061。實測欄寬三輪微調（避免長標題被省略號截斷、避免租金欄位中途換行），已用 Playwright 截圖確認與 e-shop 視覺語言一致（表頭字級色、圖示晶片、hairline、hover）。check_ds_sync 全 PASS、bump `20260720g`。

## 2026-07-20 · 清單列縮圖三度修正：data-list__icon 取消獨立家族、全站併成單一標準（B 反饋導入 · Q20 三修）

使用者指出「我的 IP」（用 `.data-list__icon`）跟電子商店仍不一樣。二次修正時 `.data-list__icon` 刻意保留成獨立家族（`--card`／`--border`／40px，理由是與 `.alert--card .alert__icon` 同尺寸家族），但使用者的判斷標準很明確：全站看起來就是要一樣，不接受「兩個家族各自合理」的解釋。

- **【B】** `.data-list__icon` 由 `--card`／`--border`／40×40 改為 `--muted`／`--border-soft`／52×52／icon 色 `--muted-foreground`，與 `.product-list__thumb`／`.project-list__icon` 完全一致（不再是獨立家族）。取消與 `.alert--card .alert__icon` 的尺寸配對關係。
- 影響 15 頁（auction-detail／bundle-detail／create-bundle／create-project／fan-detail／earnings／event-detail／order-detail／ip-detail／pickup-detail／product-detail／project-detail／scanner／my-ip／design-system.html）。row 用 flex/grid 自適應高度，尺寸放大不會撞版；已用 Playwright 截圖檢查我的 IP（一般密度）與收入管理（較密集列表）兩頁，版面正常無破版。
- 用 Playwright 量測 my-ip.html 的 `.data-list__icon` computed style，與先前驗證過的 orders/e-shop/projects 三頁數值逐項比對相同（52px／`rgb(22,23,24)`／`1px rgb(32,33,34)`／icon `rgb(117,117,117)`）。
- 文件同步：`design-system.md` Data list 條目與 Anatomy 區塊改寫、`STYLE-DECISIONS.md` Q20 改為「全站統一單一標準」並記錄完整沿革（首版→二次修正→三度修正）。check_ds_sync 全 PASS、bump `20260720d`。
- **追加**：驗收發現 `border-radius` 也沒統一（`.data-list__icon` 寫死 `10px`，另三者用 `var(--radius)`=6px，肉眼可辨），一併改成 `var(--radius)`；`design-system.md` 對應段落（Anatomy／Sizes／Class API）同步。四頁四元件的 width/height/背景色/邊框寬與色/圓角/icon 色共 7 項，已用 Playwright 逐項量測完全相等。bump `20260720e`。

## 2026-07-20 · 清單列縮圖二次修正：對齊錯了基準，重改成真實呈現值（B 反饋導入 · Q20 修正）

使用者截圖指出訂單管理與電子商店的縮圖仍尺寸、顏色都不同——07-18 那筆改動對齊錯了對象。`.product-list__image` 全站 28 處使用皆搭配 `--placeholder` 變體，基礎規則（`--card`／`--border`／52px）從未單獨呈現過；真正畫面上看到的是 `--placeholder` 覆蓋後的值（`--muted` 底／`--border-soft` 邊／`--muted-foreground` icon），且 07-18 那筆也忘了同步尺寸（維持舊的 44px，`.product-list__image--placeholder` 其實是 52px）。

- **【B · 二次修正】** `.product-list__thumb`（orders／pickup）與 `.project-list__icon`（projects）改為 52×52／`--muted` 底／1px `--border-soft`／icon 色 `--muted-foreground`——這次直接用 Playwright 量測兩邊的 computed style（背景色、邊框色、尺寸、icon 顏色）逐項核對到數值相同，不是只憑外觀感覺判斷。
- **`.data-list__icon` 不套用這組新值**：它是「儀表板資訊列圖示」家族（與 `.alert--card .alert__icon` 同尺寸家族），跟「照片佔位圖」家族角色不同，維持 07-18 那筆改的 `--card`／`--border`／40px，不強行統一到 52px／`--muted`。
- 文件同步：`design-system.md` product-list／project-list／data-list 三條目改寫，清楚標示兩個家族各自的基準；`STYLE-DECISIONS.md` Q20 補「二次修正」段落，誠實記錄首版對齊錯誤的原因。check_ds_sync 全 PASS、bump `20260720c`。

## 2026-07-20 · 清單列縮圖統一追加：data-list__icon 也改描邊框（B 反饋導入 · Q20 續）

接續 07-18 那筆，使用者確認「我的 IP」等 15 頁用的 `.data-list__icon` 也要一併改，不維持例外。

- **【B】** `.data-list__icon` 由 `--muted` 填色無邊框改為 `--card` 底＋1px `--border`，與 `.product-list__thumb`／`.project-list__icon` 一致。原本保留 `--muted` 是因為與 `.alert--card .alert__icon`「同族」（同尺寸 40×40／radius 10）；但 `alert__icon` 底色本就由狀態變體決定、無邊框語意不同，改邊框不影響兩者的視覺配對。
- 影響頁：auction-detail／bundle-detail／create-bundle／create-project／fan-detail／earnings／event-detail／order-detail／ip-detail／pickup-detail／product-detail／project-detail／scanner／my-ip（14 頁）＋ design-system.html。
- 文件同步：`design-system.md` Data list 條目、`STYLE-DECISIONS.md` Q20（移除「未納入」但改為說明差異不影響配對）。check_ds_sync 全 PASS、bump `20260720b`。暗色截圖驗證。

## 2026-07-18 · 清單列縮圖統一成描邊框（B 反饋導入 · Q20）

使用者截圖指定：把「填色無邊框」那種列縮圖全部換成「描邊框」那種。這其實是 product-list 元件內部的真實不一致——同一個「清單列縮圖」角色有兩種做法並存。

- **【B · 統一列縮圖】** `.product-list__thumb`（orders／pickup）與 `.project-list__icon`（projects）由 `--muted` 填色無邊框，改為 `--card` 底＋1px `--border` 描邊框，與同元件既有的 `.product-list__image`（e-shop／events／pickup）一致。反白變體 `.product-list__thumb--cover` 的 `border-color` 設成與自身填色同色，避免反白塊上露出中性描邊。
- **未納入（待使用者決定）**：`.data-list__icon`（15 頁的儀表板資訊列圖示晶片，40×40／radius 10，當初刻意與 `alert--card` 圖示同族）維持 `--muted` 填色無邊框——角色與清單列縮圖不同，未一併改。
- 元件層一次生效、consumer 頁無需改 markup。文件同步：`design-system.md` product-list／project-list 條目、`STYLE-DECISIONS.md` Q20。check_ds_sync 全 PASS、bump `20260720a`。暗色截圖驗證。

## 2026-07-17 · midnight 精修搬入 r2.1 batch 2：input 填色＋標籤橘框＋radio 小點（B 反饋導入 · Q19）

接續 Q18，使用者對照 `docs/黑夜版風格探索-midnight.html` 逐項截圖指定，再搬三項元件級精修（全走元件層、consumer 頁自動生效）。

- **【B · input 填色，新增 `--input-surface` token】** `.input/.textarea/.select` 底色由 `--card` 改用新 token `--input-surface`（亮＝`var(--card)` 白卡、靠 1px border 分界；暗＝`#262729` 比卡 `#212223` 亮一階）。動機：section 改浮起卡後，input 底＝卡底同色會糊在卡面上（Surface-Layer Contrast），暗色尤明顯；filled 一階讓欄位讀得出。全站所有表單欄位生效，亮色維持白卡不變（無回歸）。
- **【B · 標籤已選橘框，Q8 scoped 例外】** tag-input 的已選標籤 chip（`.tag-input__field .chip--active`）改品牌橘外框＋橘字＋淡橘底（`color-mix(--primary 8%)`）。只 scope 在 tag-input 內——全站一般 `.chip--active`（earnings/fans/projects 等篩選器）維持反白黑底（Q8 不動）。動機：標籤是創作者為自己商品下的分類，橘標更像「已套用」而非中性篩選。
- **【B · radio-list 點精修】** `.radio-list__dot` 未選 16→13px 細環（1.5→1.25px），已選粗環消失、只留 8px 實心橘點（原已選還留一圈橘環）。midnight 選中指示器 A 案。radio-list 全 5 頁生效（create-product/-bundle/-auction 上架設定＋product-detail/bundle-detail）。
- **【B · 追加 2026-07-18，續對照 midnight】** (a) tag-input 橘色 scope 由 `.tag-input__field` 放寬到整個 `.tag-input`——建議列裡「已加入」而原本反白成白色的標籤，現在也是橘框橘字（全站 `.chip--active` 仍不動）；(b) 已選型別卡（`.selection-card--icon.selection-card--active`）除橘 outline 再加淡橘底，對齊 midnight——icon 維持中性、不加勾（修訂 Q13 已選呈現）。bump `20260718b`。
- **【B · 追加 2026-07-18 第二輪，續對照 midnight】** (a) 型別選項卡 `.selection-card--icon` 與上傳投放區 `.upload-tile` 底色由「同 section 卡色／transparent」改用 `--input-surface`（暗色比 section 亮一階＝填色互動面、亮色白卡）——對齊 midnight「選項/投放區比 section 亮一階」，`--input-surface` 用途由「只 input」擴為「input＋型別卡＋上傳」；已選型別卡淡橘底基底同步改疊在 `--input-surface` 上。(b) 順修一個既有 bug：`.select-wrap__icon`（下拉自訂箭頭）原 `right: var(--select-icon-inset)`，但該變數定義在兄弟 `.select` 上、CSS 變數不從兄弟繼承→箭頭 `right` 失效跑到框外，改直接 `right: var(--sp-12)`（並移除孤兒變數）。bump `20260718c`。
- 文件同步：`_tokens.css` 新 token（亮/暗）、`design-system.md` token 表＋input/tag-input/radio-list 條目、`design-system.html` swatch、`STYLE-DECISIONS.md` Q19＋Q8 scoped 例外標記。check_ds_sync 全 PASS、fresh-context 驗收、bump `20260718a`（與 Q18 batch 一起收）。淺色暗色皆截圖驗證（含 committed 標籤橘態）。

## 2026-07-17 · midnight 精修搬入 r2.1：form-section 浮起卡＋型別磚縮小＋上傳圖示晶片框（B 反饋導入 · Q18）

把探索頁 `docs/黑夜版風格探索-midnight.html` 的三項區塊/元件精修搬進正式站，範圍**限建立流程元件、不動全站一般 `.card`**（維持 Q3）。使用者先在 midnight 迭代確認外觀，再指定搬 r2.1，並選「只套建立流程 section」的範圍（不覆蓋全站卡片、不撞另一 session 進行中的 Q15/Q16）。

- **【B · form-section 浮起，修訂 Q14】** `.form-section--outlined` 由「純填色卡」加 `box-shadow: var(--shadow-card), var(--shadow-edge-top)`＝浮在內容底上的卡；仍 `border:0`（無 1px 邊框），改由填色＋E2 陰影＋頂緣高光共同分區。新增 Foundation token `--shadow-edge-top`（亮 `inset 0 1px 0 rgba(255,255,255,.5)` 白底近乎不可見／暗 `rgba(253,253,253,.05)` 深底顯上緣光）。元件層一次生效、~12 個 consumer 建立頁自動套用。
- **【B · 型別磚縮小，修訂 Q13 尺寸】** `.selection-card--icon` icon 晶片 42→36、內 icon 28→24、內距 22→`--sp-14`、gap→`--sp-8`（較 Figma 781-4166 更緊）。僅動 `--icon` 變體，base/swatch 卡不變；已選標記仍是橘 outline 無勾（Q13 邊框/標記不變）。
- **【B · 上傳圖示晶片框】** `.upload-tile--hero .upload-tile__icon` 加圓角晶片框（`--accent` 底＋1px `--border`＋`--radius-lg`＋56×56）；縮圖格不變。
- **未採用**：input 底再亮一階（#262729）——r2.1 暗色 input 已是 filled `--card`(#212223)、差一階幾乎不可見，不值得為它加暗色專用 token（撞棘輪），略過。
- 文件同步：`design-system.md` 新增 `shadow-edge-top` token 列＋form-section/upload/selection 條目更新；`design-system.html` 邊緣工具行含 `--shadow-edge-top`；`STYLE-DECISIONS.md` 新增 Q18＋Q13/Q14 修訂標記。check_ds_sync 全 PASS（WARN 僅既有 fan-store raw-color＋cookie-banner/footer 零消費）、fresh-context 驗收 10 條全 pass、bump `20260717p`。淺色暗色皆截圖驗證。

## 2026-07-17 · 折扣設定：單一規格 折扣價↔折扣% 雙向連動、多規格改折扣%＋移到逐規格表下（B 反饋導入 · 產品變更待規格 · 接續 D144）

使用者反饋：多規格下折扣設定位置與語意都不理想——(a) 折扣設定給的是「絕對折扣價 $」，多規格每個規格各自定價，一個絕對折扣價套不到 N 個規格；(b) 單一規格的定價區在多規格會隱藏（`data-when-var="single"`），但折扣設定沒設隱藏、照樣顯示且排在「逐規格定價表」上方，與真正的價格脫節。裁決走「折扣跟著價格走」＋「多規格用折扣%」。**⚠️ 動到折扣的資料模型（D144 原定義＝絕對折扣價），屬產品變更，`documents/` 規格尚未同步（見 ASSUMPTIONS UIA-060）。**

- **【B · 單一規格＝折扣價 ↔ 折扣% 雙欄連動】** create-product 單一規格折扣設定的「折扣價」欄改成 form-grid 兩欄：折扣價（$ 前綴）＋折扣%（% 後綴，`amount-field--suffix`）；以定價（`cp-price`）為基準雙向自動換算、最後編輯為準（打折扣價算出%、打%算出折扣價、改定價時依現有%重算折扣價）。程式設值不觸發 input 事件故無迴圈。原 section 補 `data-when-var="single"`（多規格時隱藏）。
- **【B · 多規格＝折扣%、位置移到表格下】** 新增第二個折扣設定 section（`data-cp-show="physical" data-when-var="multiple"`），置於「逐規格定價表」正下方；只放單一「折扣 %」（套用所有規格，無絕對折扣價）＋限時折扣起訖日。與單一規格版互斥顯示。
- **【D · 位置原則】** 折扣設定「跟著價格走」：單一規格＝定價下（現狀）、多規格＝逐規格表下。上架設定（發佈行為）在預覽欄、折扣設定（改價格）留表單，兩者刻意分流。
- 新增 i18n：`cp.sale.percent`、`cp.sale.linkhint`、`cp.sale.pct-allhint`、`cp.discount.enable-pct-sub`（皆 en+zh）。重用 `amount-field--suffix`（既有 % 後綴變體）、`control-row`、`form-grid`、`switch`，無新元件。check_ds_sync 全 PASS（棘輪未超標＝無新裸值；WARN 9 `--shadow-edge-top` 屬 Q18 既有 drift、非本輪）、bump `20260717o`。
- 範圍：本輪只動 create-product（創建頁）。product-detail 的 §2.15 折扣設定同理應套同模型（單一→雙欄、多規格→折扣%），未動＝待辦。

## 2026-07-17 · 建立取貨場次 modal 反饋三輪：改頁籤式 dialog（B 反饋導入 · C 撤除 · UIA-059）

依使用者反饋（參考 Mobbin：Vapi「Create Structured Output」等頂部分頁 dialog——頁籤可自由切換、非 1→2→3 步驟）把共用「建立取貨場次」popup（`partials/pickup-session-modal.js`）從「三塊 `--muted` 填色面板疊直」改成「頂部三頁籤自由切換」。動機：只有三區、填色面板偏重且暗色下仍顯笨重；頁籤一次只看一區、無捲動、無步驟壓力，分區交給頁籤底線承載。

- **【B · 版面改頁籤】** F1/F2/F3 三區改成 `.tabs`＋`.tab-panel`（重用既有 Tabs 元件，不新造）三頁籤：基本資訊／取貨項目／密碼；移除段內重複 H3（頁籤標籤即區名）。pickup.css 加 glue：`[data-pks-panels]` 保 `min-height:248px` 免切換塌陷、`.pks-panel__intro` 為取貨項目頁引言、面板內 `.field__label` 維持 14px regular（沿用原 modal 節奏）。
- **【B · 藏欄位驗證路由】** 取貨項目頁加 `.tabs__item-count` 即時計數徽章；按「建立」時驗證，若未加項目或起訖時間顛倒，自動跳到出錯的頁籤（解掉頁籤把必填藏起來的取捨——藏在別頁的錯不會沉默）。「無草稿、需 ≥1 項才可建立」（D112）仍以停用建立鈕落地。
- **【C · 撤除 `.form-section--modal`】** 同日上一輪為此 modal 新增的 `--muted` 填色面板變體，改頁籤後無任何消費者，從 `form-section.css` 移除；`design-system.html` 該 demo 改成退場說明、`design-system.md` 條目同步。
- **【B · 頁籤標籤 i18n】** 新增 `pks.tab.{basic,items,scanner}`（en+zh，短標籤）；移除改版後不再被引用的 `pks.sec.{basic,scanner}` 與 `pks.sec.items`（`pks.sec.items.sub` 仍作引言保留）。
- check_ds_sync 全 PASS、cache-bust bump。淺色暗色皆截圖驗證。

## 2026-07-17 · 上架設定移到商店預覽下＋改 radio-list（新元件）（B 反饋導入，接續 D144）

依使用者反饋，把「上架設定」從表單流程搬到右側「商店預覽」欄（預覽卡下方），並把選法從分段控制（segmented）換成新的輕量單選列（radio-list）。動機：預覽窄欄放水平三段軌太擠；「何時上架」與「買家看到的樣子」擺一起語意最順；選法上，上架時機是「資料選擇」而非 segmented 定義的「視角切換」，radio-list 語意更對。使用者從三案（直式選擇卡／下拉／輕量 radio 列）中選 radio-list（探索稿 `docs/上架設定-位置與選法探索.html`）。此筆更新前一則「上架設定改分段控制」中 segmented 的部分。

- **【D · 新元件 radio-list】** promote `ds-components/radio-list.css`（輕量垂直單選：radio 點＋標題＋可選描述，選中＝填橘點；透明列、hover `--muted`、無卡框；純 token、無裸 hex/rgb/font-size）。DS 頁新增「4.84 Radio list」demo＋TOC＋元件矩陣列，`design-system.md` 補條目。掛入 5 頁＋design-system。
- **【B · 位置（僅創建頁）】** create-product／create-bundle／create-auction 的上架設定從 `.preview-split__form` 移到 `.preview-col`，包成第二張 `.card` 疊在預覽卡下（sticky 欄；窄螢幕 ≤1040px 改堆疊在表單後）。
- **【B · 選法（全 5 頁）】** 上架設定控制由 segmented 改 radio-list：create-product／-bundle／-auction（拍賣為 不開拍／立刻開拍／定時開拍）＋ product-detail／bundle-detail（位置不動、僅換選法，維持全站同一控制長相一致）。選「定時上架／定時開拍」才展開時間欄的行為不變。
- **【C · 移除】** 三創建頁表單內原 `form-section--outlined` 上架設定區塊移除（內容搬到預覽欄）；listing 控制的 segmented 用法退場（segmented 仍保留給視角切換）。
- 新增 i18n：`cp.listing.{none,now,schedule}-sub`、`ca.start.{none,now,schedule}-sub`（各 en+zh，一句描述）。check_ds_sync 全 PASS（棘輪未超標＝無新裸值）、cache-bust bump `20260717k`。
- 風格觀察（未阻斷）：站上 1-of-N 選擇器現有三種——selection-card（grid 大卡）／radio-card（2-up）／radio-list（vertical 窄欄），依版面密度分工；是否需明確分工或收斂已記入 `STYLE-DECISIONS.md` 待裁決（Q17）。

## 2026-07-17 · 建立取貨場次 modal 反饋二輪：combobox 選取＋間距＋文案（B 反饋導入 · UIA-059）

依使用者反饋再調共用「建立取貨場次」popup（`partials/pickup-session-modal.js`）。四點：

- **【B · F2 改單框 combobox】** 原「搜尋框＋兩份常駐清單」改為單一 search-to-add combobox（新元件 `ds-components/combobox.css`，重用 `.tag-input` 欄位＋`.chip`）：已選項顯示為可移除 chip，focus／輸入時彈出下拉建議（取貨商品／活動票券分組、icon＋名稱＋meta），點選加入為 chip、已選項自建議移除、無命中顯示空訊息。F2 標題「加入可核銷項目」→「**加入取貨項目**」，副標改「**至少加入一項商品或活動票券**」。
- **【C · 移除文案】** 刪 F2 舊副標「把取貨商品與活動票券加進本場次…」與底部 stickynote「! 場次至少需加入一個商品或票券才能建立…」（i18n `pks.note` def 一併移除）。最低一項的規則改由 F2 副標承載。
- **【B · F3 改名】** 「Scanner 存取」→「**設置密碼**」。
- **【B · 區段分區改填色面板】** 使用者反饋暗色下 section 沒有區隔——根因是 **pickup.html 漏掛 `form-section.css`／`chip.css`**（modal 的區段與 chip 樣式在此頁根本沒載入），補齊；並把 `.form-section--modal` 由「間距＋細線」改為 **`--muted` 填色面板＋`--border` 邊框＋`--radius-xl`**（`--card` dialog 上細線暗色讀不出，改填色分區，淺暗兩色都清楚）。淺色暗色皆截圖驗證。
- 新元件 `combobox.css` 掛入 pickup／create-product／product-detail／design-system（pickup 另補漏掛的 `tag-input.css`）；DS 頁新增「4.16b Combobox」demo＋TOC＋`design-system.md` 條目。i18n 更新 `pks.sec.items/.items.sub/.scanner`、刪 `pks.note`。check_ds_sync 全 PASS（棘輪未超標）、cache-bust bump。

## 2026-07-17 · 建立取貨場次 modal 分三區塊＋統一搜尋＋死 class 遷移（A spec-derived · D infra · Plan195）

依上游 5.1.5.12 v1.4（§4 歸三個功能塊）重構共用「建立取貨場次」popup（`partials/pickup-session-modal.js`，pickup／create-product／product-detail 三頁共用開啟）；同時修掉 2026-07-11 欄位系統退役後遺留的死 class。使用者反饋：欄位在頁面上「全部擠在一起、沒有視覺區隔」。

- **【D · 死 class 遷移（根因）】** modal STEP 1 表單仍在用 2026-07-11 已退役、無 CSS 定義的 `.payout-field` / `.payout-form-grid` / `.payout-field__label` / `.payout-field__hint`（欄位因此失去樣式、擠成一團＝反饋的根因）；改用 canonical `.field` / `.form-grid` / `.field__label` / `.field__hint`（field-system.css／form-grid.css）。（`partials/restock-modal.js` 殘留同樣的死 class，本輪未動，另記待辦。）
- **【A · 分三區塊】** 依 spec §4 用 `.form-section` 包成 F1 場次基本資訊（名稱／地點／起訖時間／說明）· F2 加入可核銷項目 · F3 Scanner 存取（密碼）；區段標題＋`+` 分隔線提供視覺分區。
- **【A · 統一搜尋加入（spec §4 F2）】** F2 頂部加搜尋框，依名稱即時過濾取貨商品與活動票券兩份清單（`filterItems()`）；純視覺過濾——被過濾掉的已勾選項仍保持勾選並計數；兩清單皆無命中時顯示「沒有符合搜尋的項目」。
- **【D · 新增 `.form-section--modal` 變體】** 頁面版 44px 垂直留白在 modal 太空曠，新增 dialog 用精簡變體（`--sp-20` 內距、區段起點 `:first-child` 去上內距，標題與分隔線不變）；`design-system.html` demo ＋ `design-system.md` 條目同步。
- 新增 i18n：`pks.sec.basic/.items/.items.sub/.scanner`、`pks.search/.ph/.empty`（皆 en+zh）；補 `.pickup-select__row[hidden]` 還原規則（搜尋過濾需要）。check_ds_sync 全 PASS（棘輪未超標＝無新裸值）、cache-bust bump `20260717f`。

## 2026-07-17 · 折扣設定結構化＋上架設定改分段控制（B 反饋導入，接續 D144）

使用者對前一筆 D144 的兩個新區塊給了更明確的互動結構：折扣設定改成「開啟折扣 → 折扣價 →（可選）開啟限時折扣 → 起訖日」的兩層揭示；上架設定改成三選一「不上架／立刻上架／定時上架」分段控制、選「定時上架」才展開時間欄（使用者選定分段控制，非並排卡）。純呈現/互動結構調整，復用既有元件，無新 CSS 元件。

- **【B · 折扣設定兩層揭示（商品）】** create-product／product-detail：主開關「開啟折扣」（`cp.discount.enable`）→ 展開折扣價（`cp.sale.price`，絕對價）＋次開關「開啟限時折扣」（`cp.discount.limited`）→ 展開起訖日。限時折扣關＝常態折扣、開＝只在檔期內套用。JS 用既有 `wireReveal`／`revealToggle` 綁兩層開關。
- **【B · 折扣設定（組合）差異化】** create-bundle／bundle-detail：組合折扣幅度＝定價區既有的「折扣 %」（衍生價，不動），折扣設定區只放一句說明（`cb.discount.note`）＋「開啟限時折扣」→ 起訖日；不設絕對折扣價欄。**組合是否把折扣% 併入折扣設定＝待使用者裁決。**
- **【B · 上架設定改分段控制（三型）】** 三建立頁＋兩細節頁的「上架開關＋定時上架二開關」改為單一 `.segmented` 三選一（商品/組合＝不上架／立刻上架／定時上架 `cp.listing.none/now/schedule`；拍賣＝不開拍／立刻開拍／定時開拍 `ca.start.none/now/schedule`），預設「立刻上架/開拍」，選「定時」才 reveal 時間欄。三選一已含「不上架＝隱藏」，故移除原獨立上架開關（`cp.show`）。create-bundle／bundle-detail 補掛 `segmented.css`。
- **命名／鍵**：i18n 新增 `cp.discount.enable/enable-sub`、`cp.discount.limited/limited-sub`、`cp.listing.none/now`、`ca.start.none/now`、`cb.discount.note`；`cp.sale.price` 值「特價」→「折扣價」、`cp.sale.start/end`／`cb.sale.start/end`「特價」→「折扣」起訖日；`cp.listing.schedule`／`ca.start.schedule` en 縮成「Schedule」。移除孤兒鍵 `cp.sale.activate(-sub)`、`cp.listing.schedule-sub`、`cb.sale.activate(-sub)`、`ca.start.schedule-sub`。check_ds_sync 全 PASS（棘輪未超標）、cache-bust bump（→20260717h）。
- **與規格的分歧（待同步）**：折扣可「常態不限期」與上架三態，較 documents 現寫的「排程特價一定有起訖日／上架開關」更廣，屬 D144 的細化；`documents/5.1.5.1/2/4` 與 decisions 待補一則細化紀錄（尚未同步）。

## 2026-07-17 · 定價瘦身＋折扣設定/上架設定（排程特價・定時上架）三型對齊（A spec-derived · D144）

依 D144 把規格改動落到原型：商品定價只留「定價（現金）＋成本價」，移除原價與 POPCORN 定價單位；三型都補「上架設定」（含定時上架，拍賣叫定時開拍），商品與組合再補「折扣設定 → 排程特價」，拍賣不設。規格已於前一輪同步（`documents/5.1.5.1/2/4/8/9/10`、decisions.md D144、backup_plan Plan210）。全部復用既有元件（form-section／control-row／switch／field／form-grid／amount-field），零新 CSS 元件。

- **【C · 移除原價欄】** create-product 與 product-detail 的定價區刪整個「原價（Original price · if on sale）」欄；三欄 `form-grid--3` 收成兩欄 `form-grid`（定價＋成本）。i18n `cp.original`／`cp.original.if` 移除。
- **【C · 移除 POPCORN 定價單位切換】** create-product 的價格欄（含逐規格表 JS 樣板）由 `amount-field` 互動切換鈕（`<button data-amount-unit>`＋`__chev`＋`data-price-sync`）改回純現金 `$`（`amount-field--readonly`）；刪 `syncPriceUnit()` 狀態機與 `cp-price-unit-note` 換算 hint；i18n `cp.priceunit.*`（title/cash/popcorn/hint）移除。store-settings F6 幣別說明改寫、不再對照 POPCORN。
- **【A · 折扣設定 → 排程特價（商品＋組合）】** create-product／product-detail 新增「折扣設定」區塊＝排程特價開關 → 展開特價價格＋起訖日（商品有絕對特價，取代原價劃線機制）。create-bundle 現有「販售排程」改名回「排程特價」歸入「折扣設定」（反轉 D091），bundle-detail 同步；組合維持開關＋起訖日、**不設特價價格欄**（規格標組合特價來源待確認）。拍賣不設排程特價（競標無固定售價可折）。
- **【A · 上架設定 → 定時上架（三型）】** 三建立頁＋product-detail／bundle-detail 新增「上架設定」＝上架開關＋定時上架（開關→上架時間，`datetime-local`）；拍賣的等價功能為「定時開拍」（`ca.start.*`）。
- **【C · 上架開關由預覽欄併入主表單】** 三建立頁原本在右側 sticky 預覽欄的「Show in my shop」開關移入主表單新「上架設定」區塊、移除預覽欄重複開關（使用者裁示佈局 A）；與細節頁的上架設定分組一致。
- **命名／鍵**：i18n.js 新增共用家族 `cp.discount.title`／`cp.sale.*`（商品＋詳情共用）／`cp.listing.*`（五頁共用區塊標題）／`ca.start.*`（拍賣）；bundle 沿用 `cb.sale.*` 但值由「販售排程」改「排程特價」、移除 `cb.sale.title`。全部新 key 皆 en+zh、經覆蓋檢查（def=1、被 1–5 頁引用）。
- **【D · 元件文件同步】** `amount-field.css` 檔頭註解標明 cash/POPCORN 互動切換隨 D144 退場、切換 chrome 保留為可重用能力（無消費者）；`design-system.html`／`design-system.md` 的 amount-field demo 拿掉 🍿 示範、改「靜態 $＋保留切換」雙例，anatomy／Do&Don't／`[data-amount-unit]` 說明同步。check_ds_sync 全 PASS（棘輪未超標＝無新裸值）、cache-bust bump（20260717e）。

## 2026-07-17 · 黑夜版 midnight 壓暗（v2）＋KPI delta chip＋卡片圓角 16（B 反饋導入 · Q15／Q16）

使用者以總覽為起點裁示採用 midnight 深色風格（`docs/黑夜版風格探索-midnight.html` 測試頁截圖核可；Mobbin 參照 Whop/Posh/Substack）。改動全在元件層與 token 層，**不動任何產品頁 HTML 檔案**（其他 session 正在編輯產品頁，僅外觀經 token 連動）。亮色模式完全不動。

- **【B · 暗色 token 壓暗 v2（`_tokens.css` dark 區塊 14 值，Q15）】** **維持 r2.1 內凹層次語意**：content(surface-page/background) `#191A1A`→**`#0C0D0D`＝最深** → 嵌套襯底 `--muted #272828`→`#161718` → 外殼(surface-shell/sidebar) `#2B2B2C`→**`#1C1D1E`＝明顯亮於 content、包住圓角內凹的 content** → 卡/popover `#303131`→`#212223` → hover `--accent #383839`→`#2A2B2C`；border/input `#3A3A3C`→`#2C2D2E`、border-soft `#2A2A2A`→`#202122`、sidebar-accent→`#262728`、sidebar-active `#444445`→`#303132`。**v1 一度反轉成殼最深/content 較亮且兩者相近，使用者回饋「content 要最深、外殼別太相近」後改回 v2**（維持 r2.1 原制、整體壓暗）。舊值全部留在 token 行註解。
- **【B · KPI delta 升級膠囊 chip（`kpi.css`，Q15）】** `.kpi__delta` 由純色文字改染色膠囊——semibold、`color-mix(status 12%, --card)` 底、radius-pill、`2px --sp-8` 內距；`--neg` 紅色同構。膠囊＝「趨勢指示」新視覺角色（與 Q1 badge 小圓角角色區隔）。全站 15 頁 KPI 消費者連動受益。
- **【B · form-section 暗色配套修正（`form-section.css`，Q15）】** `[data-theme="dark"] .form-section--outlined` 填色 `--muted`→`--card`：壓暗後 `--muted` 與最深的 content 過近、區塊會消失；改 `--card`(#212223) 浮在 content(#0C0D0D) 上、與亮色行為一致（修訂 Q14 暗色部分）。
- **【B · 卡片/面板級圓角 6→16px（Q16，約 40 支元件）】** card／kpi／preview-card／selection-card／radio-card／readiness／notification-matrix／insight-row／table 容器／picker／album-tracks／upload-tile／alert banner·bar／info-banner／store-settings 卡／scanner／vip-card／彈窗 dialog（payout/embed/leave）＋其內容卡，統一到現有 `--radius-xl`(16px)、與 form-section 一致。**控制項維持 6px**（button/input/badge/segmented/field-pill）、下拉浮層維持 `--radius-lg` 8px、清單列/icon 底框/縮圖不動（守 Q1 形狀＝角色）。不引入新圓角值、不違反 Q2。
- **【D · 版本與檔案紀律】** 本輪未主動跑 bump_ver（避免改寫全站 39 頁與別 session 衝突）；**別 session 稍後已 bump 全站到 `20260717f`**，本輪 CSS 改動（內容已變）搭該版號生效。全程**未動 `js/i18n.js`**（別 session 編輯中）與 `js/components.js`（純換皮、資料結構不碰）。
- **影響面**：暗色模式全站外觀連動（sidebar／卡片／彈窗／表單區塊全變深、卡片圓角變柔）；檔案動 4 支 CSS（_tokens／kpi／card／form-section 的暗色與圓角）＋約 40 支元件的圓角行＋4 份文件。回歸抽查 index／e-shop／create-product／product-detail／退款彈窗通過。DS 雙軌（md＋html token 表 v2、Q15/Q16 裁決、kpi/form-section/card/radius 條目、Q9 行）已同步。

## 2026-07-16 · 訂單詳情品項名稱改開「商品快照」popup（A spec-derived · D143）

依使用者指示＋新產品決策 D143，把訂單詳情品項明細的商品名稱從「直連商品管理頁」改為開一個「商品快照（Product snapshot）」popup，呈現下單當時的商品樣貌。規格已同步（`documents/5.1.5.3.1-訂單詳情.md` §2.3.1 導向、新增 §2.7、§3／§5、frontmatter v2.0）與 `documents/decisions.md` D143。

- **【A · 品項名稱改開快照 popup】** 兩個品項的商品名稱連結（`.data-list__title` 內的 `<a>`）由直連 `product-detail.html` 改為 `.od-snap-open`（`data-snap-*` 屬性帶名稱／價格／次分類／描述／所購規格／管理連結），點擊開 `#od-snapshot-modal`、不再跳頁。
- **【A · 商品快照 popup 內容】** 新增 `#od-snapshot-modal`（沿用 `.payout-modal`／`.payout-dialog` 外殼，比照出貨／退款彈窗，零新 modal CSS）：**快照卡**重用建立流程的 `.preview-card`（改餵固定資料靜態渲染，主圖／名稱／單價／描述，限寬 320px 置中）；**訂單欄位**＝所購規格（多規格品項顯示，單規格自動 `hidden`）與次分類；**凍結說明**（`field__hint`，i18n `od.snap.freeze`）；**foot**＝關閉／「管理此商品 →」次連結連回商品管理頁（5.1.5.1）。
- **命名／鍵**：i18n.js 新增 `od.snap.title/variant/cat/freeze/close/manage`，皆有 en+zh。
- **零新元件 CSS**：`preview-card`／`payout-modal`／`data-list`／`field__hint` 皆既有元件，本頁新掛 `preview-card.css`＝新增 in-context consumer。ASSUMPTIONS 補 UIA-058（快照 popup 的呈現層實作選擇，區分於 D143 的產品決策本身）。check_ds_sync PASS、cache-bust bump（20260717d）。

## 2026-07-16 · 訂單詳情配色與元件對比優化（B 反饋導入）

使用者指示「優化 UI 元件與配色」，以訂單詳情頁試做、聚焦配色對比與元件精緻度；元件層改動全站受益，已同步 design-system.md 並跑全站回歸（orders／create-product）確認無破壞。

- **【B · `field__hint` 提亮（元件層）】** 說明文字顏色由 `--muted-foreground` 改 `--foreground-muted`（暗色 #757575→#B9B9B9），全站表單／詳情的淺灰說明字更好讀。
- **【B · `badge--warning` 對比加強（元件層）】** tint 18%→22%、文字 `color-mix` 50%→60% foreground，warning 狀態 badge（如「待出貨」）更清楚，文字色與既有 checkin-stat 黃一致。design-system.md 對應描述行同步。
- **【B · `segmented` 軌道修復（元件層，缺陷修正）】** 原軌道底 `color-mix(--foreground 5%, --muted)` 在深色主題下把軌道提亮到接近彈窗底色（`--card`），加上 active pill 也用 `--card`，整個切換控制融進 popover 背景、看不出是可點控制。改軌道恆用 `--muted`＋加 1px `--border` 界定邊界，落實 design-system.md 既有的「Surface-layer contrast」通則。影響全站用 segmented 的彈窗（退款／出貨）與建立頁。design-system.md class API 描述同步。
- **【B · `.od-amt` 頁面私有收斂】** 負向金額（平台費／支付費）顏色同步提亮；`padding` 裸值 `7px`→`var(--sp-8)` 收斂進 token 刻度。
- check_ds_sync PASS、cache-bust bump（20260717a→b）。

## 2026-07-16 · 訂單詳情 §2.3／§2.4 改用 form-section、依規格項目拆為獨立 section（B 反饋導入）

使用者裁示「設計參照商品細節頁或創建頁、Section 依規格書項目拆分」。把 [order-detail.html](./order-detail.html) 的內容區手法對齊商品細節頁（product-detail）／創建頁（create-product）：每個規格項目＝一個 `.form-section--outlined`、單欄由上到下堆疊。**產品規則不變**，屬呈現結構調整。

- **【B · §2.3 拆三獨立 section】** 上一輪的「一張 `.card` 卡內用 `.od-subhead` 分三小段」改為三個獨立 `.form-section form-section--outlined`：品項明細（§2.3.1）／金額拆解（§2.3.2）／收入對帳（§2.3.3）。每個 section 用 `.form-section__head`（`.form-section__title` 18px＋`.form-section__sub` 灰副標一句），對齊商品細節頁手法。
- **【B · §2.4 買家統一 form-section】** 買家區由 `.card`／`.card__head` 改為 `.form-section--outlined`，與 §2.3 一致。
- **【B · 版面改單欄堆疊】** 移除原 §2.3(span-7)＋§2.4(span-5) 的 `.bento` 並排容器，改為四個 form-section 由上到下堆疊（完全對齊參照頁，使用者選定）。
- **【C · 棄用 `.od-subhead`】** order-detail 頁內 `<style>` 的私有 `.od-subhead`（上一輪新增）整段移除，其角色由 DS 元件 `.form-section__title/__sub` 取代（撤除上一筆 UI-CHANGES 對 `.od-subhead` 的說明）。
- **零新元件 CSS**：`form-section` 為既有 DS 元件，本頁新掛 `form-section.css`＝新增 in-context consumer；`.od-amt`／`.od-qr` 等其他頁內私有樣式保留。
- **命名／鍵**：i18n.js 新增 `od.sec.items.sub`／`od.sec.amount.sub`／`od.sec.recon.sub`／`od.buyer.sub`（四個 section 灰副標）；`od.items.sub.items` 的 en 由「Items」改「Order items」（當 section 標題）。原卡頭鍵 `od.items.title`／`od.items.source` 拆 section 後無元素引用（留存未清）。check_ds_sync PASS、cache-bust bump（20260716zd）。

## 2026-07-16 · 訂單詳情對齊 spec 5.1.5.3.1：品項三子塊、退款改彈窗、退款鈕最終形態、爭議降狀態（A spec-derived · O18／O23／D041）

依 spec 5.1.5.3.1 最新版把原型 [order-detail.html](./order-detail.html) 對齊。**產品規則不變**——D041「v1 不開放創作者主動退款」仍有效、以 feature gate 守；PCR-001 兩軸不混用維持。屬呈現與前端結構調整。

- **【A · §2.3 三具名子塊】** 品項與金額細分卡內加 `.od-subhead` 子標題，分「品項明細 Items（§2.3.1）／金額拆解 Amount breakdown（§2.3.2）／收入對帳 Reconciliation（§2.3.3）」三段，對齊 spec §2.3 子節結構。`.od-subhead` 是 order-detail 頁內**局部 class**（頁面 `<style>`、非 DS 元件），用 token（`--fs-11`／`--fw-semibold`／`--muted-foreground`）、page-specific，不 promote（ASSUMPTIONS UIA-057d）。
- **【A · 退款改彈窗】** 原常駐 card「Refund & dispute」撤除，改為 `#od-refund-modal`——**重用既有 `.payout-modal`／`.payout-dialog` 對話框外殼**（比照 `#od-ship-modal` 標記出貨彈窗，零新 modal 元件 CSS）。彈窗內容：退款範圍 `.segmented`（整筆 Full／部分 Partial）、部分退款用 `.data-list`＋原生 checkbox（`.od-refund-check`，`accent-color: --primary`）勾選品項、`.od-amt` 即時試算退款金額、庫存回補／收入影響／爭議區隔說明用 `.field__hint`。JS＝頁末新增 IIFE（開關比照 od-ship，segmented 切 Full／Partial 分支、checkbox change 重算金額）。
- **【A · 退款鈕最終形態】** 頁首 Refund 鈕（`#od-refund-open`，保留 `data-feat="O18"`）**移除 disabled**、改為可點開退款彈窗＝在預設 full 版本可操作的最終形態；Phase 1 版本仍由 `data-feat="O18"` gate 隱藏＝守 D041「v1 不開放創作者主動退款」。confirm 鈕為 demo（關窗即止；真實退款經 Earnings §7.3）。依使用者 2026-07-16 指示做最終形態（ASSUMPTIONS UIA-057b）。
- **【A · 爭議降為狀態】** 爭議不再是常駐操作區塊——降為 §2.2 Payment·settlement 軸的 disputed 狀態值（示範訂單 #ZT-10482＝Paid、不觸發顯示）＋退款彈窗末尾「爭議區隔」說明（爭議由買家發起、金額凍結待 Earnings 調查 §7.3）。守 PCR-001 兩軸不混用（ASSUMPTIONS UIA-057c）。
- **命名／鍵**：i18n.js 新增 `od.items.sub.items/amount/recon`、`od.refund.select/amount/confirm/cancel/full.note/restock/dispute`；`od.refund.title` 由「Refund & dispute」改「Refund」。舊鍵 `od.refund.sub/body/v1` 已無元素引用（留存未清）。
- **零新元件 CSS**：退款彈窗重用 `payout-modal`／`payout-dialog`／`segmented`／`data-list`／`field__hint`（新 in-context consumer）；`.od-subhead` 為 page-specific 局部 class、無新裸值。BUILD-SPEC §3.2 補退款彈窗 pattern 行＋Status axes 行註記爭議降狀態；requirements-map 5.1.5.3.1 補列。check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 費率例外：新增／編輯改彈窗（partial）、Creator 搜尋、支付費唯讀（B 反饋導入）

依使用者反饋，把費率例外的新增與編輯從「行內展開」改成**彈窗（modal）**，並新增 Creator 搜尋（[admin-platform-fees.html](./admin-platform-fees.html)、新檔 [partials/fee-exception-modal.js](./partials/fee-exception-modal.js)）：

- **【B · 新 partial】** 建 `partials/fee-exception-modal.js`（照站上 partial 慣例＝template 字串，由頁面注入 `[data-fee-exc-modal-host]` 並接開關/搜尋/儲存）。復用共用對話框殼 `payout-modal.css`（`.payout-modal`/`.payout-dialog`/__head/__title/__body），零新元件 CSS。
- **【B · 編輯彈窗】** 列表「編輯」不再行內展開，改開彈窗：標題「編輯費率例外 · <Creator>」、Creator 固定不可改、平台費樹（clone 預設樹、有覆寫的維度自動展開、繼承/覆寫 badge、逐葉覆寫）。移除舊的 table detail-row 行內編輯器與 `buildEditor`，改 `renderTreeInto(container, ov)` 回傳 `readOverrides()`。
- **【B · 新增彈窗＋搜尋】** 「＋ 新增例外」開彈窗（add 模式）：頂部 Creator 搜尋框，依名稱即時過濾建議、**排除已有例外的 Creator**；選定後填平台費、儲存即加入清單並記版本。取代原本的 inline `select` picker（刪 `#fee-exc-picker`、孤兒鍵 `fees.exc.pick`）。
- **【B · 支付手續費唯讀】** 彈窗內顯示支付手續費但 `disabled`＋badge「全站統一 · 唯讀」——維持 D141「支付費全站單一、不逐 Creator」產品規則，只有平台費可逐 Creator 覆寫（使用者裁示）。
- **命名／鍵**：新增 `fees.exc.modal-add/modal-edit/creator/search/search-none/payment-locked`。accordion／input 委派仍在 document（涵蓋彈窗內 clone 樹）。
- **瀏覽器實測**：編輯彈窗（標題帶名、支付費唯讀、IP 自動展開 12%／覆寫）、新增彈窗（搜尋過濾＋排除已有例外）、選定→填值→翻覆寫→儲存→關窗＋新列＋版本歷史，全通過、0 console error。check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 平台費率頁：整頁改三分頁 IA（B 反饋導入）

依使用者反饋，把整頁重整為三個 tab（沿用 `tabs` 元件），並順手清掉「費率版本與生效範圍」擠成一排的混亂 UI（[admin-platform-fees.html](./admin-platform-fees.html)）：

- **【B · 三分頁】** page-intro 下加 `nav.tabs`（費率設定／版本歷史／費率例外），內容拆進三個 `.tab-panel`：**費率設定**＝支付手續費＋平台費預設樹＋版本設定；**版本歷史**＝歷史表（獨立）；**費率例外**＝例外清單＋新增＋行內編輯器。JS 加 tablist 委派切 `tabs__item--active`／`tab-panel--active`。
- **【B · 版本設定去混亂】** 原「目前版本 badge＋生效日 input＋儲存鈕」三者擠一排 `align-items:flex-end`，矮 badge 與高輸入框高低不齊 → 拆兩層：「目前版本」獨立成上方資訊行（標籤＋badge），下方只留「生效時間＋儲存鈕」一排（兩控件對齊）。
- **【B · 委派改 document】** 例外編輯器 clone 樹現位於「費率例外」分頁、與預設樹 `#fee-tree` 分屬不同 section，accordion 展開與覆寫 input 的事件委派由掛在單一 section 改掛 `document`＋守衛（只認 `#fee-tree` 或 `.fee-exc` 內），跨分頁仍運作。
- **命名**：新增 `fees.tab.settings/history/exceptions`；`fees.default.hint` 改指向「費率例外」分頁；例外分頁不再重覆 h4 標題（tab 已標示），刪孤兒鍵 `fees.exc.title`。零新元件（`tabs.css` 既有、僅本頁新掛連結）、零新裸值。
- **瀏覽器實測**：三 tab 切換、例外編輯器跨分頁開啟／accordion 展開／IP 自動展開／新增／儲存／移除／空狀態全通過、0 console error。check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 平台費率頁：設變改「預設＋例外清單」IA、去 General 命名（B 反饋導入）

依使用者反饋「右上模式切換不好，應該是預設＋可管理的例外清單；名稱不要中英混合」，把逐 Creator 設變（spec 5.1.0.3 F3／D141）從「模式切換＋單選下拉」重構成「預設費率＋費率例外清單」IA（[admin-platform-fees.html](./admin-platform-fees.html)）。產品規則不變（仍是預設＋逐 Creator 覆寫、逐葉粒度），只改呈現與命名。

- **【B · 去模式切換】** 移除 `segmented`（General／設變）與其下 creator 單選 picker。平台費區直接顯示**預設費率**樹（全平台通用，`fees.default.hint` 一行說明），不再需要先切模式。
- **【B · 費率例外清單】** 樹下新增「費率例外」區（`ztor-table`）：每列＝Creator＋覆寫摘要（如「IP 授權金抽成 15%→12%」，>2 項顯示件數）＋編輯／移除（`btn--ghost btn--sm`）；「＋ 新增例外」展開 Creator `select`、選定即加入清單並開啟編輯器；空狀態 `fees.exc.empty`。種子 2 筆（Neon Harbor、Aria Chen）。
- **【B · 行內展開編輯器】** 點「編輯」就地展開該 Creator 的覆寫編輯器（使用者選定的互動）：JS `cloneNode` 預設樹→顯示「來源」欄、每格 `placeholder` 帶預設值（空＝繼承）、填入既有覆寫、輸入即翻「繼承／覆寫」`badge`；儲存收集非空值寫回該例外、append 版本歷史一列（scope＝「例外 · <Creator>」）。開編輯器時**自動展開有覆寫的維度、其餘收合**（都沒有則展開第一個），覆寫一眼可見。accordion 展開改**事件委派**同時服務預設樹與所有 clone 樹。瀏覽器實測：展開/新增/儲存/移除/空狀態/自動展開全通過、0 console error。
- **【B · 去 General 命名】** 全站 zh 介面本就統一用英文「Creator」（Creator 名冊／管理，專有名詞保留原文），保留一致；真正的中英混雜是「General」——刪 `fees.mode.general/override`、`fees.creator.*`、`fees.override.hint`，改用 `fees.scope.default`（預設費率）／`fees.scope.exc`（例外）＋新增 `fees.exc.*`（title/add/hint/empty/pick/col-*/edit/remove/save/cancel/editor-hint/none/count）與 `fees.default.hint`。版本歷史 seed 的 scope 同步改中文。
- **零新元件 CSS**：復用 accordion／ztor-table／select／amount-field／badge／button／form-section；例外清單與行內展開沿用既有 `.fee-tree__panel`＋`[hidden]` 手法與 table detail-row，未新增裸值。check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 平台費率頁：移除「示意值待確認」提示帶（C 撤除）

依使用者「這個不需要寫上去」，刪掉頁首 `fees.pending-banner` info-banner（[admin-platform-fees.html](./admin-platform-fees.html)）——該句是「給看原型的人」的元資訊、非產品 UI 一部分，正式頁面不會出現。

- 刪 HTML info-banner 區塊＋孤兒鍵 `fees.pending-banner`（zh/en）；本頁已無其他 info-banner 用例，順手移除 head 的 `info-banner.css` 死連結（該元件仍被其他頁消費、非退場）。
- **產品事實不受影響**：「費率數值待產品確認」仍記於 spec 5.1.0.3（§34、F2）與 D141 待確認項，只是頁面不再複誦。check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 平台費率頁：排版收斂、主次拉開（B 反饋導入）

依使用者「照現在頁面優化排版／結構／UI」，在功能不變下重整版面主次（[admin-platform-fees.html](./admin-platform-fees.html)）：

- **【B · 支付手續費改輕量單列】** 原本一個小輸入框佔一整張大卡、右側大片空白、份量與主角齊平 → 改為單列橫向：標題＋白話說明靠左（`flex:1`）、輸入框靠右，卡高大幅下降，視覺上明確是配角。用既有 `form-section`＋`amount-field`，零新元件。
- **【B · 版本兩卡合一】** 「費率版本與生效範圍」與「版本歷史」原為兩張獨立 form-section（其實同屬版本管理）→ 合併成一張卡：上排放 目前版本／生效日／儲存，下方以 `field__label` 小標「版本歷史」帶出歷史表。全頁卡片由 4 張收成 3 張。
- **【B · 主次分明】** 費率樹維持最大權重＝主角，支付手續費（矮列）與版本卡（中）明顯輕於它；間距／內距沿用 token（`--sp-8/16/18`），零新裸值。
- check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 平台費率頁：支付費置頂＋名稱白話化（B 反饋導入）

依使用者反饋「支付費應排第一、名稱要白話」，調整 [admin-platform-fees.html](./admin-platform-fees.html) 資訊順序與用詞，功能與 spec 對應（F1–F5）不變：

- **【B · 支付費置頂】** 支付費由「費率樹尾一列 inline」提升為頁面最上方獨立 section（排在平台費率樹之前）——它是全站最單純的一項（一個數字套所有交易），先給最好懂的，再進複雜的分類樹。
- **【B · 名稱白話化】** i18n `fees.payment.title`「支付費 · 金流商（全站單一）」→「支付手續費」；新增 `fees.payment.sub` 白話註解「不分交易類型，所有交易都收同一個比例」。費率樹標題 `fees.tree.title`「費率樹」→「平台費 · 依交易類型」，與置頂的支付手續費形成對比（一個全站統一、一個依類型分）。
- **【B · 導言重寫】** `fees.lede` 改為一次交代兩種費率（支付手續費全站共用一個、平台費依交易類型分別設）＋生效規則，取代原本只講平台抽成的說法。
- **零新元件、零新裸值**：支付費 section 沿用 `form-section`＋`amount-field`；新增 i18n 鍵 `fees.payment.sub`。spec 5.1.0.3 未釘視覺位置（僅定義支付費為全站單一產品規則），位置屬呈現、不回改規格。check_ds_sync PASS、cache-bust bump。

## 2026-07-16 · 平台費率頁佈局精簡：去重複資訊、來源欄改設變才顯示（B 反饋導入）

依使用者反饋「佈局不行、有不必要的資訊」，對 [admin-platform-fees.html](./admin-platform-fees.html) 做去重與收斂，功能與 spec 對應（F1–F5）不變：

- **【B · 訊息去重】**「只對之後生效、不回溯」原本講三次（lede＋noretro info-banner＋頁尾 note）→ 只留 lede 一句；刪 F4 區的 noretro banner 與頁尾單一來源 note（單一來源屬規格事實，spec 5.1.0.3 F5 仍在，頁面不需複誦）。「Admin only」banner 也刪——breadcrumb 已標 Admin Creator Studio，屬冗餘；頂部 banner 由 2 條收為 1 條（只留「示意值待確認」）。
- **【B · 來源欄按需顯示】** General 模式下「來源」欄整欄都是「預設」＝噪音 → 該欄（`th/td.fee-src`）General 模式隱藏、切到設變才顯示（繼承／覆寫 badge），General 的樹回歸乾淨兩欄（子類＋費率）。i18n 刪 `fees.source.default`。
- **【B · 區塊收斂】** 模式切換 segmented 併入費率樹 section head 右側（原獨立浮在頁面上，歸屬不明）；creator 選單＋繼承說明併入同 section（說明由 info-banner 降為 text-sub 一行）；支付費由獨立 form-section 收為樹 section 尾的一列 inline（一個輸入框佔一整區太重），刪 `fees.payment.note` 複誦。
- **【B · 文案縮短】** lede、override hint 精簡；i18n 孤兒鍵清除（fees.admin-only／fees.version.noretro／fees.note／fees.source.default／fees.payment.note）。零新裸值、check_ds_sync PASS、cache-bust 20260716s。

## 2026-07-16 · 平台費率設定升級為四維度費率樹＋逐 creator 設變（A spec-derived · BR-NEW-4／D141）

依 spec 5.1.0.3 改寫（D141／Plan204）：平台費率由扁平三列表升級為「電子商店／活動／專案／IP 四維度 × 交易子類葉節點」費率樹，並加 General 預設／設變（逐 creator 覆寫）兩層。原型 [admin-platform-fees.html](./admin-platform-fees.html) 全頁重搭。

- **【A · F2 費率樹】** 四維度以 `ztor-accordion` 呈現可展開樹（複用 accordion 的 trigger／chevron／分隔線；面板改用自有 `.fee-tree__panel` + `[hidden]` 顯隱，**不套 `.ztor-accordion__content` 的 FAQ 高度上限**，避免資料列被 320px 裁切）。每維度展開為 `ztor-table`，逐葉節點一列＋`amount-field--suffix` % 輸入＋來源 `badge`。葉節點：E-Shop（直售實體/數位·組合·拍賣）、Events（現場/線上票券·報名處理費）、Projects（募資/預購/實體回饋/數位回饋）、IP（授權金/版稅/租用）。示意值 15/10/0 等、雙 info-banner 明示待確認。
- **【A · F3 設變】** `segmented`（General／設變）切模式；設變模式顯示 creator `select`（3 個 mock creator）＋繼承提示 info-banner。切到設變時每個葉節點輸入清空、placeholder 顯示繼承的 General 值；輸入值即把該列來源 badge 由「繼承」翻成「覆寫」（`badge--brand`）。覆寫粒度＝逐葉節點（D141）。
- **【A · 支付費】** 全站單一費率獨立一段（不隨維度分葉、設變不影響）。
- **【A · F4 版本】** 版本歷史表改「版本／生效／範圍／調整」四欄；Save 依當前模式（General 或 Override·某 creator）append-only 插一列、更新目前版本 badge（demo，不回溯）。
- **零新元件 CSS**：複用 segmented／accordion／select／ztor-table／amount-field／badge／form-section／info-banner；新增裸值 0（`.fee-tree__panel` 無 CSS、只當 JS hook＋`[hidden]`）。i18n 新增 fees.mode/creator/dim/leaf/source/payment 等鍵。check_ds_sync PASS、cache-bust bump 20260716r。詳見 UIA-054（改寫）。

## 2026-07-16 · form-section--outlined 全站去外框線（保留填色卡）· STYLE-DECISIONS Q14（B 反饋導入）

依使用者裁示：`.form-section--outlined` 的 1px 硬邊界太重，全站去掉外框線、改靠填色卡分區。**取代 Q13 對本元件的「邊框化」部分**（Q13 的 selection-card／radio-cards 邊框不受影響）。

- **【B · Q14】元件層一次改、全站 11 頁 88 處同步**（[form-section.css](./ds-components/form-section.css)）：`.form-section--outlined` 移除 `border`（原 `1px solid --border`），保留背景填色（亮 `--card`／暗 `--muted`）、圓角 `--radius-xl`(16)、內距 `--sp-16`。採用頁：create-product／-auction／-bundle／-event／-project／register-ip／admin-ip-bank-entry／admin-platform-fees／product-detail／section-test。
- **權重陷阱處理**：改寫成 `.form-section.form-section--outlined`（權重 0,2,0、置於檔案靠後）以蓋過 `.form-section + .form-section` 的 `border-top` 分隔線（同權重）——否則相鄰 outlined 卡頂端會殘留一條線。同時移除已無作用的 `.form-section--outlined + .form-section--outlined { border-top-color }` 規則。
- **零新值**：只刪 border、無新增裸值；填色/圓角/內距/間距皆沿用既有 token。STYLE-DECISIONS 新增 Q14（並在 Q13 標註邊框部分被取代）；DS 文件（md＋html）Form section 條目與 Form assembly 配方已改為「無外框線」。cache-bust bump。

## 2026-07-16 · 商品細節頁多規格「選項」建立後鎖定（暫行）（B 反饋導入）

依使用者指定：商品細節頁（post-creation）的多規格**選項**暫時不允許調整。對齊 spec 5.1.5.1 §2.8「加新選項或新選項值＝受限·產品待確認（D137）」，UI 先保守鎖定，不動產品規則。

- **【B】§2.8 選項建構器改鎖定唯讀**（[product-detail.html](./product-detail.html)）：多規格視圖的選項建構器——選項名稱 `input` 加 `readonly aria-readonly`、選項值 chip 由 `chip--removable` 改 `chip--static`（移除 `chip__remove` ×）、移除「新增選項值」輸入格、「Add option」按鈕與「移除選項」按鈕。只呈現當前選項與值、不可改名/增刪。
- **【B】逐規格表維持可編輯**：各規格的價格／庫存／SKU／單件成本仍可改（對齊 §2.8「各列的價格/庫存/SKU/單件成本可自由編輯」）；新增提示 `product-detail.var.opts-locked` 說明「選項固定、逐規格值可改」。
- **範圍**：只鎖 product-detail（post-creation）；建立商品頁（create-product）的選項建構器不動、建立時照常可建。屬呈現層保守鎖定（ASSUMPTIONS UIA-056），待上游確認 D137 選項編輯規則後再放寬/定案。
- **無新元件 CSS / 無新裸值**：重用既有 `chip--static`；`check_ds_sync` 基準未動；cache-bust bump。

## 2026-07-16 · 商品細節頁改「商品資料驅動」＋補齊數位內容檔各型態（B 反饋導入）

依使用者反饋：商品細節頁的組合切換不該藏在 devtools，應由電子商店清單點開對應商品就呈現「該有的組合」；並把缺的數位次分類內容檔表單補齊。屬**呈現決策＋前端架構**，未動產品規則（組合維度與內容檔形態切換皆為 spec 5.1.5.1 §2.6/§2.7/§2.8/§2.10 明定）。

- **【B】新增 `js/products-store.js`（比照 films-store / ip-bank-store）**：把 e-shop 清單 9 個單售商品各建一筆 mock 資料，帶 `cat`（實體/數位）／`subKey`（次分類）／`content`（數位內容檔形態 video·song·album·membership·document·ip）／`variant`（單一/多規格）／`edition`（不限量/限量）／status/price/stock/cap，及 `albumSeed`（專輯曲目）、`vipName`（卡名）。對外 `window.ztorGetProduct(id)`。
- **【B】`product-detail.html` 改資料驅動**：e-shop 每列 Edit → `product-detail.html?id=<key>`（9 列已接，e-shop.html）。頁面讀 `?id` 查 store，`applyProduct()` 配置整頁——頁首標題/副標/狀態 badge、主分類唯讀顯示、次分類（實體/數位各一 select、依 `data-sub` 選值）、規格模式（單一/多規格版面）、庫存版本（限量/不限量欄位）、價格/庫存、以及 §2.7 內容檔表單。無 `?id`（含底部動態補列）用預設 zine 樣本。
- **【B · C】移除 devtools 的 `pd-cat/pd-var/pd-edition` page-scoped 預覽組**（`ZTOR_DEV_PAGE_GROUPS`／`applyFromDev`／`ztor:devstate-changed` 監聽整段刪除）——組合改由真實商品資料驅動、不再靠 devtools 切換。devtools 的「版本」feature gate（`data-feat`）不受影響。
- **【B · A】§2.7 數位內容檔補齊各型態**（重用既有元件，無新 CSS 元件）：影視/單曲/文檔＝單檔上傳格（標題/提示依 `content` 切 `data-i18n`）；**音樂專輯＝多曲目管理器**（重用 `album-tracks`，見下條 seed）；**會員卡＝卡面自訂器＋即時預覽**（重用 `vip-card`＋`partials/vip-card.js`）；**IP 資產＝素材槽 placeholder**（產品缺口，明確標註、見 ASSUMPTIONS PG-017）。由 `applyContentFile()` 依 `content` 一次顯示一種。head 補掛 `album-tracks.css`／`vip-card.css`，底部補 `products-store.js`／`album-tracks.js`／`vip-card.js`。
- **【B】`partials/album-tracks.js` 加 seed 能力**（State/API 層增強，reusable）：新增 `data-album-seed`（JSON `[{name,meta,type?,lyrics?}]`），init 時建成「已完成」曲目列（重用同一列樣板與 rename/cover/play/drag/delete 互動），供細節頁呈現已存在專輯內容；建立頁不帶此屬性＝維持空狀態、行為不變。
- **代表性樣本（UIA-055）**：逐品的變體列（S/M/L 靜態）、專輯曲目、卡面內容、成本/門檻等為代表性樣本，重點是 realize「該有的版面組合」、非真實逐品內容。
- **無新元件 CSS / 無新裸值**：`check_ds_sync` 5/10/11 基準未動；新增 i18n `product-detail.badge.low2/.soldout`、`pd.cfile.video/song.*`、`pd.cfile.ip.*`；數位次分類 select 重用 `cp.dsub.*`；cache-bust bump 至 `20260716o`。Bundles／Auctions 已各有 detail 頁、本輪不動。

## 2026-07-16 · create-product content 寬度 narrow→wide→mid＋逐規格表貼齊內容，讓多規格＋限量表完整展開又不留過多空白（B 反饋導入）

依使用者反饋：多規格（Multiple variations）＋限量（Limited edition）下，「各規格價格與庫存」逐規格表被 preview-split 的表單欄擠到水平捲動、無法完整展開。

- **【B】create-product body 由 `--narrow`(1000px) 改 `--wide`(1240px)**（[create-product.html](./create-product.html)）：本頁是 `preview-split`（表單欄｜固定 320px 預覽欄＋40px gap），narrow 下表單欄僅約 584px（1000−28×2−320−40），而限量逐規格表 7 欄（規格名／價格／原價／上限／成本／在庫／刪除，`variant-builder.css` 的 `.variant-table--limited`）最小需約 685px → 溢出捲動。改 wide 後表單欄約 824px（1240−56−360），7 欄完整展開仍餘約 140px。
- **復用既有修飾類、零新值**：`--wide` 是 create-campaign 已在用的既有 `.wizard__body--wide`，非新增寬度；`variant-table` 的 `overflow-x:auto` 保留當更窄視窗的保險。DS 文件（md＋html）body-modifier 清單已把 create-product 由 narrow 移到 wide。cache-bust bump。
- **【B · 追加】逐規格表「規格組合」欄不再過寬**（[variant-builder.css](./ds-components/variant-builder.css)，元件層改一次 → create-product／product-detail／DS demo 三處同步）：頁面變寬後，第一欄原本 `minmax(110px, 1.3fr)` 用 `fr` 吃掉所有多餘寬度，導致「S／M」這種短值也被撐得很寬。改法：① `.variant-table-wrap` 加 `width:fit-content`＋`max-width:100%`，表格外框貼齊實際內容寬、靠左，不再撐滿表單欄；② 第一欄改 `minmax(110px, max-content)`，貼齊內容、保留 110px 下限、不吃滿剩餘寬度。限量表因此收斂到約 682px 靠左展開，更窄視窗仍由 `min-width:560`＋`overflow-x:auto` 回退捲動。DS 兩份文件的 Variant builder 條目已補此欄寬行為。
- **【B · 再追加】整頁寬度由 `--wide`(1240) 收到新增的 `--mid`(1140)**（[shared.css](./shared.css)＋[create-product.html](./create-product.html)）：表格貼齊內容後只約 682px，`--wide` 右側留白過多。新增介於 narrow/wide 之間的 `.wizard__body--mid`(1140px)，表單欄變約 704px（1140−56−320−40）＝表格完整展開＋約 22px 餘裕、右側留白大幅收窄。**下限 floor≈1100px**：因固定 320px 預覽欄，再窄（如回 narrow 1000→表單欄 584）表格就會溢出捲動，故收到 mid 而非 narrow。DS 兩份文件 body-modifier 清單新增 `--mid`、create-product 由 wide 移到 mid。

## 2026-07-16 · 商品細節頁改分頁式（tabs）佈局（B 反饋導入）

依使用者反饋：商品細節頁欄位多、單欄長捲不好找，改為分頁式。屬**呈現決策**（5.1.5.1 §3 顯示順序明文為「呈現參考、非約束，由 project-ui-creator 決定分欄／tabs／form-section 形式」），未動任何產品內容、欄位、狀態或鎖定規則。

- **【B】`product-detail.html` 單欄長捲 → 5 tab**，重用既有 DS 元件 `tabs.css`（earnings canonical），**無新元件**：新增 `<nav class="tabs" data-tabs>` ＋各區塊包進 `.tab-panel[data-panel]`。tab 對應——**總覽**（§2.3 銷售摘要＋庫存健康快照〔新〕＋§2.4 專案引用，皆唯讀管理視角）／**基本資訊**（§2.5 素材＋§2.6 資訊＋§2.7 內容檔）／**定價與庫存**（§2.8 規格＋§2.9 價格＋§2.10 庫存——多規格價格/庫存同在逐規格表、單一規格各自獨立欄位，合在同一 tab 才不拆表）／**交付與取貨**（§2.11 取貨＋§2.12 限購）／**關聯**（§2.13 標籤＋§2.14 電影）。
- **【B】§2.4 專案引用自頁面最下移入「總覽」**（唯讀變更影響提示＝管理視角，非日常編輯焦點）；原 markup 原封搬移、DOM 內只出現一次。
- **【B】新增「庫存健康」唯讀快照（總覽）**：用既有 `kpi`＋`badge` 呈現目前庫存/低庫存門檻＋Low Stock badge，右下 `.card__link` 帶 `data-tab-jump="price-stock"` 深連結到「定價與庫存」tab 實際編輯；不新增進度條元件。
- **【B】分頁切換 inline JS**（比照 earnings、無共用 tabs.js）：click 切 `.tab-panel--active`＋`aria-selected`，支援 `[data-tab-jump]` 跨 tab 與 `#hash` deep-link（`history.replaceState`）。See-as-fan 分割預覽（header 按鈕觸發）維持不動、跨 tab 皆可開。
- **產品內容零改動**：11 個 §2.x 區塊只重新分組進 tab-panel，欄位/選項/驗證/空狀態/D137 三鎖定欄位（主分類 `#pd-main-cat`／規格模式 `#pd-var-mode`／庫存版本 `#pd-edition`）與 devtools page-scoped 預覽（`ZTOR_DEV_PAGE_GROUPS`／`applyCat`／`applyVis`／`syncLocked`）邏輯全數保留（元素只是移進 panel，`document` 範圍查詢照舊生效）。
- **無新元件 CSS / 無新裸值**：`check_ds_sync` 5/10/11 基準未動；新增 i18n `product-detail.tab.*`（5 tab 標題）＋`product-detail.health.*`（庫存健康快照）雙語；`tabs.css` 補掛 head；cache-bust bump 至 `20260716k`。

## 2026-07-16 · Wizard header 左上返回箭頭＋標題合併為單一返回按鈕（B 反饋導入）

依使用者指定＋Figma node 781:4142：建立流程頂欄左上「返回箭頭（`.wizard__back`）＋標題塊（`.wizard__top-titlewrap`）」整組視為一顆返回按鈕，hover 套圓角膠囊底、點標題也回上一頁。

- **【B】只改 `shared.css` 一支、不動任何消費頁 markup**：`.wizard__top-lead` 升為膠囊面（`position:relative`＋`--radius-lg` 8px＋內距 `8/16/8/8`〔`--sp-8`/`--sp-16`〕），常態透明、`:hover` 套 `--accent`（Q9 互動 hover 統一色）；padding 用等量負 `margin` 抵銷 → 箭頭維持原位、hover 不位移。icon 與標題間距 `--sp-14`→`--sp-12`（對齊 Figma）。以上圓角/底色/內距/間距數值全照 Figma 781:4142。
- **【B】命中區與焦點環用 stretched `::after`**：實際可點/可聚焦的仍是內層 `.wizard__back` `<button>`，新增 `.wizard__back::after{position:absolute;inset:0}` 撐滿整個 lead（inset 以 `position:relative` 的 lead 為基準）→ 點標題等同點返回；`:focus-visible` 焦點環畫在 `::after` 上（`--ring`）。移除舊的小方塊 `.wizard__back:hover` 底色。
- **涵蓋 10 個 wizard 頁**（create-product/-bundle/-auction/-project/-event/-campaign、register-ip、funding-simulate〔`fc-back-arrow`〕、admin-ip-bank-entry、funding-test/create-campaign）——元件層改一次全數生效，markup 零改動。
- **無新元件 / 無新裸值**：全用既有 token，`check_ds_sync` 5/10/11 基準未動；`design-system.md` Wizard frame 條目已補行為描述；cache-bust bump 至 `20260716j`。

## 2026-07-16 · 電影關聯精修：拆獨立 section＋可搜尋（promote film-picker 元件）（A 規格同步）

依上游 5.1.5.2 v6.2／5.1.5.1 v1.22／D140（電影關聯自 §4.4 拆為獨立小節 §4.5、加電影名稱搜尋），同步 r2.1。

- **【A · D140】create-product 電影關聯改獨立 section**：原本電影關聯欄併在「Buyer limits & tags」共用設定 section 內，改為**自己一張 `form-section--outlined` 卡**（標題 Linked movies＋副標），對齊 spec 把 F12 拆成獨立 §4.5。
- **【A · D140】promote 共用元件 `partials/film-picker.js`（可搜尋多選）**：兩頁的電影選取邏輯抽成單一 JS 元件，**建於既有 tag-input＋chip 之上、無自帶 CSS**——`.tag-input__entry`(type=search) 即時過濾候選、建議 `.chip-group` 點選加入、已選 `.chip--active.chip--removable` 移除；候選來自 `window.ztorFilms`。API `window.ZTOR_PARTIALS.createFilmPicker(host,{selected,onChange})`。create-product 掛空選取、product-detail 掛預設示意 2 部，取代前一版兩頁各自的 inline 渲染。design-system.md 元件表新增 Film picker 條目（指向 .js）。
- **【A · D140】搜尋（BR-NEW-1）**：新增 i18n `films.search`（placeholder「搜尋電影名稱加入…」）／`films.suggest`／`films.none`；candidate 多時可打字定位，只在既有候選內過濾、不新建電影。
- **無新元件 CSS / 無新裸值**：film-picker 純 JS 復用 tag-input＋chip，check_ds_sync 5/10/11 基準未動；cache-bust bump 至 `20260716i`。移除兩頁舊 inline 電影程式碼（cp-films chip-group 迴圈、pd-films 渲染 IIFE）。

## 2026-07-16 · ztor eShop 新需求落地：商品電影關聯（BR-NEW-1）＋Admin 平台費率設定頁（BR-NEW-4）（A 規格新增）

依上游新規格 5.1.5.2 §4.4 F12（v6.1）／5.1.5.1 §2.14（v1.21）／新頁 5.1.0.3／0-設計規格書 §7.1·§3.2.1（v3）與 D138／D139，把兩條新需求實作進 r2.1。

- **【A · BR-NEW-1】商品電影關聯（可多部、選填）**：
  - 新增 `js/films-store.js`——前台已上架電影 mock（6 部），A/B 兩頁共用的候選來源；電影是前台實體、不在 CS 管理，此處只建立商品→電影引用（呈現假設記 UIA-052）。
  - `create-product.html` §4.5 共用設定區新增「電影關聯」欄：`.chip-group#cp-films` 由 films-store 動態渲染可點 chip，toggle `chip--active` 即多選（沿用既有 chip / chip-group 元件，無新元件）；收集陣列 `linkedFilms`。films-store 於該頁首個 IIFE 前載入以確保 `window.ztorFilms` 就緒。
  - `product-detail.html` 於 §2.13 標籤與 §2.4 專案引用之間新增「§2.14 電影關聯」區塊：已關聯以 `chip--active chip--removable` 呈現（預設示意 2 部）、下方 suggested chip 群可加入，空狀態 hint；與 §2.4 專案引用（未上架電影）明確區隔。
  - i18n：新增 `cp.films*`／`pd.films*` 鍵（en/zh）。
- **【A · BR-NEW-4】Admin 平台費率設定頁（第四個 Admin 目的地）**：
  - 新增 `admin-platform-fees.html`——仿 `ip-bank-reporting.html` 目的地外殼（breadcrumb＋page-intro＋app 頁框），內容為可編輯設定型：Admin-only + 待確認雙 info-banner、F2 費率表（`ztor-table` + `amount-field--suffix` % 可編輯輸入，示意值 15/10/2.4，全標「產品待確認」不寫死承諾）、F3 費率版本與生效範圍（目前版本 badge＋生效日期＋Save，儲存即發版 demo：append-only 插入版本歷史、既有列不動＝不回溯）、版本歷史表。全用既有元件（form-section／table／amount-field／info-banner／badge／page-intro），無新元件 CSS。
  - `js/sidebar.js` 三處掛第四目的地（`ADMIN_ROUTES`／`ADMIN_NAV`｛icon `percent`｝／`FULL_ROUTES`）；`js/icons.js` 新增 `percent` icon；i18n 新增 `admin.platform-fees` 與 `fees.*` 鍵。
- **【A】收益拆解 E22**：earnings 頁既有實作（Breakdown tab＋F12 waterfall＋費率版本引用，`data-feat="E22"`）已涵蓋，scope-map 由 TBD/blocked 解成 Next；本輪只驗收、未改頁面。
- **無新元件 / 無新裸值**：三件事全部復用既有元件與 token，`check_ds_sync` 檢查 5/10 基準未動；cache-bust 統一 bump 至 `20260716h`。費率確切數值、per-creator/IP 覆寫、電影候選前台介接屬產品/工程缺口（記 ASSUMPTIONS UIA-052／UIA-053），原型不宣稱為正式行為。

## 2026-07-16 · 商品細節頁：D137 建立後固定不可編輯欄位鎖定＋銷售摘要去框＋素材附圖移次行（A 規格同步＋B 反饋導入）

依上游 5.1.5.1 §2.6/§2.8/§2.10（v1.20）與 D137，把「建立後固定不可編輯」的三個欄位在 `product-detail.html` 改成唯讀呈現、不可切換；並依使用者版面反饋去掉銷售摘要外框、把素材附圖移到主圖下方一行。

- **【A · D137】三欄位鎖定（呈現層唯讀）**：
  - 主分類 `#pd-main-cat` 改 `disabled` select（唯讀呈現目前值、不可切換）＋下方鎖定 hint。
  - 規格模式 `#pd-var-mode`、庫存版本 `#pd-edition` 兩個 segmented 改 `segmented--locked`（`aria-disabled="true"`＋各 `__btn disabled`）——維持當前模式的 active 高亮、整組不可點＋下方鎖定 hint。
  - 三者共用新 i18n `product-detail.locked.hint`（en `Fixed after creation`／zh `建立後不可變更`）。
  - 後端訂單約束（上限≥已售、已售規格不可刪、數位改次分類受限）屬工程、不在原型強制（記 ASSUMPTIONS）。
- **【A · D137】demo 替代版面預覽改走開發者工具**：鎖定後頁面固定樣本值（zine＝實體／單一規格／不限量），設計師看不到數位／多規格／限量版面。於 `js/devtools.js` 新增**通用 page-scoped 預覽開關機制**（`window.ZTOR_DEV_PAGE_GROUPS` → Cheat Codes 面板渲染單選組 → `ztor:devstate-changed` 的 `detail.pageOpts` 派給頁面），product-detail 註冊三組（主分類 實體/數位、規格模式 單一/多規格、庫存版本 不限量/限量），驅動 `data-pd-cat`/`data-when-var`/`data-when-edition` 顯隱並同步鎖定 segmented 高亮。其他頁未設定即不渲染、零影響。
- **【B】銷售摘要去 section 外框**：由 `form-section form-section--outlined` 改成裸露 `.pd-sales`（無卡框）；第一行三個 KPI bento 並排（`bento--span-4`×3，Units sold／Gross／Net after fees，net-meta 收在 Net 格內），第二行「View sales & revenue log →」右下小型文字連結；保留 when-data／when-empty 兩態與 Source · Earnings。移除與 Source 重複的 `product-detail.sales.hint` 呈現（i18n 鍵保留）。
- **【B】素材附圖移次行**：Media 的 `.upload-showcase` 加新修飾 `.upload-showcase--stacked`（實體＋數位版都套）——主圖第一行、附圖列第二行（不分寬度），取代原橫向並排。
- **JS 重構**：管理 IIFE 的 `wireSeg` 只保留 delivery（可互動）；var/edition 不再 wire（改鎖定）；新增 `applyCat`（含更新 disabled select 顯示值）、`syncLocked`（鎖定 segmented 高亮）、`applyFromDev`（讀 devtools pageOpts）；移除舊獨立主分類切換 IIFE。限購 toggle／標籤／delivery segmented／規格列／補貨 modal／See as fan 照舊。
- **元件層新增（promote，同步 DS 文件）**：`segmented.css` 加 `.segmented--locked`；`upload-tile.css` 加 `.upload-showcase--stacked`；`input.css` 加 `:disabled` 狀態（靜音底＋not-allowed）。三者皆已同步 `design-system.html`（demo＋spec 表）與 `design-system.md`（Class API／States 條目）；input `:disabled` 狀態缺口註記已更新為已補。全用既有 token，未新增裸值（check_ds_sync 5/10 基準未動，PASS）。

## 2026-07-16 · 商品細節頁改 form-section 風格＋依 D136 §3 頁面佈局重排（B 反饋導入）

依上游 5.1.5.1 §3 頁面佈局（D136）＋使用者版面反饋，把 `product-detail.html` 全部區塊從 `.card` 改成建立商品頁的 `form-section form-section--outlined`（`.form-section__head > .form-section__title + .form-section__sub`），並補掛 `ds-components/form-section.css`；顯示順序重排成 10 節。

- **全區改 form-section 風格**：Sales summary／Product content／Content file／Variations／Price／Stock & restock／Delivery & pickup／Purchase limit／Product tags／Referenced by projects 十區一律 outlined form-section，標題結構統一；各區內部欄位（KPI bento、upload-showcase、spec-row、variant-builder、amount-field、segmented、control-row、switch、tag-input、data-list）原封不動。
- **新顯示序（§3）**：銷售摘要首排獨立一區（不再與專案引用並排）→ 商品素材＋商品資訊並列同一區 → 數位內容檔案（獨立節，僅數位）→ 商品規格 Variations → 價格 → 庫存與補貨 → 取貨與交付 → 每人限購 → 商品標籤 → 專案引用置底。
- **銷售摘要入口降級**：「View sales & revenue log →」由整寬 outline 按鈕改成右下角小型文字連結（`.card__link`＋`--fs-12`，`flex-row` 靠右），符合 §3「次要入口」呈現參考。
- **素材＋資訊並列**：用 `bento` 兩欄（`bento--span-6`×2）——一欄 Media（實體主圖組／數位封面組，保留 `data-pd-cat` 雙版），另一欄 Title＋主分類＋次分類＋描述＋詳細規格（僅實體）；窄螢幕自動疊。
- **拆節**：舊 Price & stock 卡拆成「價格」與「庫存與補貨」兩節；舊 Delivery & buyer settings 卡（`#pd-settings`）拆成「取貨與交付」「每人限購」「商品標籤」三節；數位內容檔案自 Product content 卡移出成獨立節。
- **JS 掛勾保留**：settings 段入口由 `getElementById('pd-settings')` 改判 document 範圍錨點（`#pd-limit-toggle`／`#pd-delivery`），限購欄位 `[data-pd-limit-fields]` 改 `document.querySelector`；`wireSeg('pd-edition'/'pd-delivery'/'pd-var-mode')`、`applyVis()`（document 範圍）、標籤（`#pd-tags-field`/`-entry`）、補貨 modal、規格列、取貨場次、See as fan 拆節後全部照舊運作。清掉主分類切換 script 過時註解「2 體驗（採實體版型）」。
- 新增 i18n（en+zh）：`product-detail.content.sub`／`.price2.title`／`.price2.sub`／`.stock2.title`／`.stock2.sub`／`.delivery2.title`／`.limit2.title`／`.limit2.sub`；標題重用 `product-detail.sales.*`／`.content.title`／`.ref.*`／`cp.cfile.*`／`cp.var.*`／`cp.tags`／`cp.optional`／`product-detail.inv.sub`。全用既有 token／元件，未新增元件 CSS、未新增裸值（check_ds_sync 5/10 基準未動）。

## 2026-07-16 · 商品細節頁重排＋補原價/成本/規格；E-Shop 數位樣本補齊（A 規格同步）

依上游 5.1.5.1 §2 13 節新順序（D133／D134／D135）重排 `product-detail.html`：

- **銷售摘要前置（D134）**：把 Sales summary（改 `bento--span-7`）與 Referenced by projects（改 `bento--span-5`、保留 `data-feat="S24"`）搬到 page-intro 之後成為第一個 bento；原內部 markup（when-data／when-empty、KPI、資料列）原封不動。Product content 卡改為緊接其後的獨立 `card mt-16`。
- **移除 Experiences 主分類（D133）**：`#pd-main-cat` 刪掉 `Experiences & Events` option，只留 Physical／Digital；主分類切換 JS 以 `selectedIndex===1` 判 digital，不受影響。
- **新增 §2.8 商品規格 Variations 卡（D135）**：僅實體（`data-pd-cat="physical"`，切數位整卡隱藏）。重用既有 `variant-builder.css`／`segmented.css`／`chip.css`——規格模式 segmented（單一/多規格）＋多規格時的選項建構器（示範選項「Size / 尺寸」＋值 chips S/M/L＋「新增選項」outline 鈕，示範未接功能）＋逐規格表（靜態 3 列 S/M/L，欄：規格組合／價格／庫存／SKU／單件成本，價格與成本用現金 `$` 前綴 `amount-field--readonly`、無 POPCORN 切換；上限欄限量才顯示，示範從簡）。JS 擴充既有 settings 那段的 `applyVis`／`wireSeg` 加 `data-when-var`（預設 single、建構器隱藏）。
- **價格補原價/成本（D133）**：Price & stock 卡的價格區由單一 Price 改三欄 `form-grid--3`＝價格 $24.00 ＋原價 $30.00（`cp.original`／`cp.original.if`）＋成本價 $9.00（`cp.cost`／`cp.cost.note`「僅自己可見」）；三欄一律現金 `$` 前綴 `amount-field--readonly`、不帶 POPCORN 定價單位鈕（POPCORN 本專案維持未啟用）。Stock／低庫存門檻改置於其下獨立 `form-grid`（2 欄），欄位內部 markup 與 feature-gate 原封不動；Edition／補貨紀錄不變。

`e-shop.html` Products 清單調整為「草稿置頂 → 實體各列 → 數位各列」的 demo 呈現順序：把原本夾在實體列中間的 Coastline EP（Album）移到實體列之後，並新增音樂單曲（Song，`music`）、電影（Movie，`film`）、會員卡（Membership，`id-card`）三列數位樣本；最終數位順序＝單曲 → 電影 → 專輯 → 會員卡，四類覆蓋數位次分類。不動 `applyFilter()`／`pinDrafts()`。

新增 icon `id-card`（REGISTRY 補，path 取自 icons-all）。新增 i18n 鍵（en+zh）：`cp.var.single-note`、`e-shop.rowSong.*`、`e-shop.rowMovie.*`、`e-shop.rowVip.*`；其餘（`cp.var.*`／`cp.original`／`cp.cost*`／`cp.optional-cap`／`e-shop.row3.*`）全數重用。全用既有 token／元件，未新增元件 CSS、未新增裸值（check_ds_sync 10 未動基準）。

## 2026-07-16 · radio-card 邊框化＋標記精修（對齊 Figma node 781-4386）（B 反饋導入）

- `.radio-cards`（不限量/限量、規格模式、取貨方式等二選一卡）卡面由 `--shadow-card` 陰影改 1px 純邊框 `--border`、扁平無陰影。
- 選中標記精修（對齊 Figma node 781-4386）：已選卡**移除橘色 outline 外框**（只留灰邊框）；radio 標記由「橘外圈＋橘心」改成**置中小橘實心點、無外圈**；**未選卡不再顯示灰圈**（無可見標記）。卡距維持 `--sp-12`。
- 元件層改一次，consumer（create-product／-auction／-bundle／bundle-detail）全部生效。併入 STYLE-DECISIONS Q13。同步 design-system.md（E2 階梯、Pillar 3 陰影例外、radio-card 條目）、design-system.html（radio-card demo＋spec 表）。全用既有 token。

## 2026-07-16 · 型別選擇卡邊框化 ＋ form-section 外框對齊 Figma（B 反饋導入）

- 對齊 Figma node 781-4166（商品類型 section）。`.selection-card--icon`（create-product／create-event 的型別卡）由 `--shadow-card` 陰影改成 1px 純邊框 `--border`、扁平無陰影；卡片間距由 12 收成 8（`.selection-grid:has(.selection-card--icon)`）；已選仍是橘色 outline 線框。base `.selection-card` 其他用途（拍賣 kind／組合 edition／主題 swatch…）維持陰影，不受影響。
- `.form-section--outlined` 外框全站改圓角 `--radius-xl`(16px)／內距 `--sp-16`（原圓角 6／內距 32）；影響所有採用頁（create-product／-auction／-bundle／-event／-project／register-ip／admin-ip-bank-entry／section-test）。使用者裁示全站統一。
- 對應 STYLE-DECISIONS Q13。同步 design-system.html（icon 變體說明）、design-system.md（變體表＋form-section 條目）。全用既有 token，無新增裸值。

## 2026-07-15 · E-Shop 工作列暗色分隔陰影改純黑（B 反饋導入）

- 暗色模式下 `.eshop-list-topbar` 的下緣分隔陰影由白色微光 `rgba(255,255,255,0.12)` 改純黑 `rgba(0,0,0,0.45)`，色相與透明度對齊同頁低庫存橫條的 `--shadow-header` 暗色值，兩塊分隔陰影一致。
- 沿用 topbar 原本 `0 6px 14px -4px` 的下緣偏移幾何，只換顏色；同步更新該區塊註解。頁面內嵌樣式，未動 CSS/JS 資產、不需 bump 版本。

## 2026-07-15 · 預設主題定為 Dark（B 反饋導入）

- theme.js `cycle()` 循環起點由 light 改 dark（dark → light → system → dark）；fallback 本就為 dark，此次僅對齊起點與註解措辭。
- devtools（cheat code）Theme 選項改為 Dark 排第一並標「（預設）」，System 去掉「（預設）」字樣，讓面板呈現與實際預設一致。
- 純預設值／選項順序調整，不動任何視覺 token、元件或版面；既有訪客的 localStorage 偏好仍以其上次選擇為準。

## 2026-07-15 · Admin IP Entry Owner lookup 與待寄送邀請原型（A 規格同步）

- 新增 owner-lookup SiteSpecific component（CSS + vanilla JS），以同一 Owner 輸入搜尋 sample Ztor directory 的名稱、username 與 email；結果顯示身份三要素，選取後為 Linked。
- 有效但尚未註冊的 email 可建立 Pending invitation；同一待邀請 email 會被阻擋重複建立，清單與 Reporting 仍以既有 Linked／Pending 狀態呈現。
- 原型只將 invitation metadata 存入 localStorage，成功語意為已建立／待寄送；不查正式帳號、不寄送 email。對應 D132。

## 2026-07-15 · 建立流程統一為區塊式表單（B 反饋導入）

- create-product、create-auction、create-bundle、create-event、create-project、register-ip 與 admin-ip-bank-entry 的 wizard sheet 統一使用 `--surface-page` 底色；每個指定的表單群組採 outlined section。
- outlined section 以 `--card`／黑夜 `--muted`、`--border` 組成，所有可見區塊間以 `--sp-24` 留白；跨越條件顯示的 `[hidden]` 區塊時不留下空白。
- 只調整呈現層與區塊容器，既有欄位、條件顯示、驗證與 JavaScript 行為不變。

## 2026-07-15 · Admin IP Bank 補齊導覽脈絡（A 規格同步）

- 在既有 `page-intro` 前補上 Admin Creator Studio → IP Bank 的 Breadcrumb，明確標記目前頁並提供回到 Admin 起始目的地的連結；重用既有文字連結與 token，不新增 CSS 或視覺元件。

## 2026-07-15 · Admin IP Bank Reporting 補齊導覽脈絡（A 規格同步）

- 在既有 `page-intro` 前補上 Admin Creator Studio → IP Bank Reporting 的 Breadcrumb，明確標記目前頁並提供回到 Admin 起始目的地的連結；重用既有文字連結與 token，不新增 CSS 或視覺元件。

## 2026-07-15 · Admin IP Bank Reporting 頁首收斂（B 反饋導入）

- 移除 Reporting 頁首的非操作 badge，保留既有 `page-intro` 標題與說明層級；頁首無操作時不建立空的 actions 區，與其他 Admin 頁的既有頁首規則一致。報表的唯讀權限、KPI 與 Owner／Platform 分潤資料均維持不變。

## 2026-07-14 · Admin Creator Studio 的 IP Bank 與 Reporting（A 規格同步）

- 新增 `admin-ip-bank.html`、`admin-ip-bank-entry.html`、`ip-bank-reporting.html`，分別對應 Admin IP Bank、建立 IP Entry 流程與 IP Bank Reporting 規格。
- `sidebar.js` 將 Admin 三個同層目的地固定為左側欄導覽與 active state；Artist Creator Studio 導覽不加入 IP Bank 後台。
- `admin-ip-bank-entry.html` 採既有單頁建立 shell：Content／IP details／Owner／Share 四個表單群組、頂部儲存與底部取消／提交，作為 Admin 子流程而非 Artist 導覽頁。
- Reporting 的 Film、起始日期與結束日期收為同一操作列；變更篩選重繪 F3／F4，並在 KPI 與列表間保留明確垂直間距。
- `ip-bank-store.js` 以 localStorage 提供原型用跨頁 mock data；正式 settlement／payout 規則未由 UI 推定，詳見 ASSUMPTIONS UIA-049。
>
> **排序慣例（2026-07-02 起）**：新條目一律加在**最上方**（新→舊）。更早的紀錄（2026-05-25 ～ 2026-06-24）已移至 [UI-CHANGES-archive.md](UI-CHANGES-archive.md)。

## 2026-07-14 · 白天 App Shell 再降一階（B 反饋導入）

- **外層層次加深**：`--surface-shell` `#F5F5F3` → `#F0F0EE`，讓 app 外層比 `main` 的 `--surface-page #FAFAFA` 更明確退後；`--card #FFF`、`--surface-page #FAFAFA` 與所有 dark token 不變。

## 2026-07-14 · 全頁版本切割（D infra · 使用者裁決）

- `feature-scope-map.md` 未列的產品功能改為 Phase 4-only：頁級 `data-page-feat="full"`、區塊級 `data-feat="full"`；`devtools.js` 內建安全 fallback、低版本直連回 E-Shop、動態連結與 `sidebar.js` 導航不再露出完整功能入口。funding-test 保持同 Phase 4。
- 補齊已列 scope：S11 拍賣頁級 gate、S45 組合限量、E13–E18 收入來源 chip／列表／Overview source gate；E09 Overview panel 於 P1 隱藏。

## 2026-07-14 · 白天 Form Section 外框三階層（B 反饋導入）

- **明確分層**：正式 opt-in `.form-section--outlined` 在白天使用最亮的 `--card #FFF`；其外為 `main` 的 `--surface-page #FAFAFA`，再外為 `app` 的 `--surface-shell #F0F0EE`。黑夜維持 `--muted #272828` 填色與 `--border #3A3A3C` 外框。`admin-ip-bank-entry.html` 為目前採用流程，`section-test.html` 保留作視覺驗證。

## 2026-07-14 · 白天 Shell／Page Surface 降低明度（B 反饋導入）

- **只調整兩層外框面**：當時 `--surface-shell` `#FAFAF8` → `#F5F5F3`，`--surface-page` `#FFFFFF` → `#FAFAFA`；後續 shell 再調為 `#F0F0EE`。外層 App Shell 與建立流程的 route page 保留原本層次、降低整體白亮度。`--background`、`--card`、元件樣式與 dark token 不變。

## 2026-07-14 · 主題偏好跨頁保存＋Section 外框測試（B 反饋導入）

- **主題偏好恢復**：`theme.js` 改讀合法的 localStorage light／dark／system 值，沒有偏好時預設黑夜；`?theme=` 為優先、但不寫入的當頁覆寫。使用者切換淺色或黑夜後，換頁仍保留選擇；所有可到達 HTML 的靜態初始 theme 改 dark，避免白色首幀。
- **外框先做 opt-in 視覺驗證**：`form-section.css` 新增 `.form-section--outlined`，使用 `--muted` 填色與 `--border` 外框；暗色實際對應 #272828 填色與 #3A3A3C 邊線。新增 `section-test.html` 供切換主題／URL override 檢視；後續由 `admin-ip-bank-entry.html` 成為首個正式採用流程。
- **設計系統與追蹤文件同步**：Form section 的欄位節奏統一記為基礎 gap 6／欄距 16，移除舊的 4／26 說法；BUILD-SPEC、ASSUMPTIONS、requirements map 的 D108 固定淺色現況改為本輪決定。

## 2026-07-13 · Create Product 元件尺寸與 Icon atom 對齊（B 反饋導入）

- 套用 PR #101 的實質元件調整：Upload tile 的自製 SVG／文字 `＋` 改為 Lucide、select 改用 `.select-wrap` 的 Lucide chevron、icon 增加 12／20／24px 語意尺寸、filter tabs 與 icon button 對齊密度。
- Input 改為 1px 陰影邊線與 4px focus glow；卡片仍保留主分支的 1px border、無陰影，按鈕 hover 仍用 `--accent`。
- 此輪只改呈現層與元件文件，Create Product 的產品流程、文字語意與資產清單不變。

## 2026-07-13 · 訂單匯出移至篩選工作列（A 規格同步）

- `orders.html` 的 Export 自 F1 訂單摘要頁首移到 F2 訂單篩選上排，與搜尋並列；功能不變。規格書與需求對照同步。

## 2026-07-13 · Info banner 密度與圓角修正（B 反饋導入）

- **回歸緊湊資訊元件尺度**：`.info-banner` 字級 16px → 14px、圖示 24px → 20px、圖示間距 16px → 10px、內距 16×20px → 10×12px。原先過大的比例使單句說明看似頁面公告，與「情境資訊提示」角色不符。
- **圓角 token 修正**：`--radius-shell`（28px，app 外框專用）改為 `--radius-lg`（8px，緊湊面板）。同步更新 Design System 文件與展示；手機為 13px 字級、18px 圖示。

## 2026-07-13 · Stickynote 全站改為中性 Info banner（B 反饋導入 · 元件替換）

- **元件語意與視覺重置**：移除橘色 `.stickynote`，改為 `.info-banner`。全站 32 個提示保留原本的產品文字與位置，統一改成中性灰底、細邊框、較大圓角與圓形 `info` 圖示，符合使用者提供的參考樣式；不再把說明文字誤傳達成警示。
- **共用層同步**：新增 `ds-components/info-banner.css`，移除 `stickynote.css`；所有頁面、彈窗、Dashboard 元件與 `design-system.html` 改載入新檔。`design-system.md`、`design-system.html`、`BUILD-SPEC.md` 更新元件角色與 token 說明。

## 2026-07-13 · 兩處使用者反饋修正：交易表展開箭頭移到列尾 + stickynote 字色可讀（B 反饋導入）

- **earnings 交易明細 `.ztor-table` 展開箭頭移到列尾獨立欄**：原 `chevron-right` 內嵌在「日期」儲存格最前，把 `Nov 24` 擠到換行。改法——箭頭移到每列最後新增的 `.ztor-table__chevcell`（右對齊、32px 寬），表頭補一個等寬 `<th>` 對齊，日期欄加 `.ztor-table__datecell{white-space:nowrap}` 不再換行；詳情列 colspan 6→7。展開互動（點列 rotate 90°＋顯示 waterfall 詳情）不變。`ds-components/table.css` 移除 chevron 的 `margin-right`、新增兩個 cell class；`design-system.html` demo 表與 `design-system.md` 條目同步改成「列尾 chevron」。
- **`.stickynote` 字色白→深**：橘色便利貼 callout（create-product 等 7 頁用）原本 `color: var(--primary-foreground)`（白字），在淡橘底（`color-mix(--primary 32%, --card)`）上讀不清。改成 `var(--foreground)`，隨主題翻轉（白天深字、夜間白字），兩模式都清楚。

## 2026-07-13 · 風格微調（taste／minimalist／soft 三方體檢後，使用者選定落地）（B 反饋導入 · 純 token 層）

用 `taste-skill`（產品 UI 只取可轉用維度）＋`minimalist-skill`＋`soft-skill` 對 r2.1 體檢，做成 `docs/風格微調體檢-視覺化.html`（current↔proposed 對照）。使用者逐條選定後落地。全部集中在 `ds-components/_tokens.css` 的 token 值調整，零元件結構變更。

- **文字純黑→off-black**（三方共識）：`--foreground` `#000000`→`#1A1A1A`；`--muted-foreground` `#737373`→`#6E6E68`（微暖）。純黑殺層次，off-black 更柔、對比仍遠超 AAA。dormant 的 `--card-foreground`／`--popover-foreground`／`--accent-foreground`／`--sidebar-foreground`（零消費、元件一律吃 `--foreground`）維持 `#000000` 不動。
- **底色微暖＋邊框更淡**（三方共識）：`--surface-shell` `#F5F5F5`→`#FAFAF8`（暖 off-white，讓白卡靠色階浮出）；`--border`／`--input`／`--sidebar-border` `#E5E5E5`→`#EAEAEA`。
- **陰影柔化**（minimalist §7「shadow <0.05」／soft「柔擴散 ambient」）：`--shadow-card`、`--shadow-float` 改成更擴散、更低透明（保留極淡 rim 維持輪廓）。只影響仍用陰影的浮層／強調卡（下拉、彈窗、selection-card hover），不動 Q3 的預設卡純邊框。
- **暗色校準**（taste §8「兩模式層級對等」，補 STYLE-DECISIONS 的暗色落差）：暗色 `--status-success`／`--chart-3` `#00A63E`→`#4ADE80`（原本反向變暗、與其他狀態色方向相反，屬漏調；Paid 綠徽章在深底才讀得清）；補上暗色缺的 `--overlay-tint`（`rgba(0,0,0,0.6)`，深底遮罩要更濃）與 `--gradient-brand`（拿掉亮色淡膚起點 `#ffd9a0`，深底才讀得出漸層）。
- **使用者未採用**：主按鈕對比（維持白字，未改深字／深橘）、卡片柔浮陰影基調（維持純邊框）、double-bezel 巢狀卡。
- design-system.md／.html／ds-index.md 同步新 token 值；check_ds_sync 全 PASS；bump_ver → **20260713b**。

## 2026-07-13 · 風格裁決 Q1–Q12 全數落地（A spec-derived · 含 C 撤除）

`STYLE-DECISIONS.md` 累積的 12 題「同一視覺角色站上有兩種以上做法」經使用者逐題裁決後一次全站落地。視覺化圈選版 `docs/風格裁決-視覺化.html`。此輪只動呈現層（token／元件 CSS／少量頁面 class），零產品行為變更。

- **Q1 形狀＝可否互動的線索（文件化）**：可篩選/可點膠囊（chip、filter-tabs）＝全圓；純顯示徽章（badge、field-pill、metric-pill）＝小圓角矩形。規則寫進 design-system。CSS 本已如此，本輪只補明文。
- **Q2 圓角統一 6px**：`--radius-md` 由 7px 改成 `var(--radius)`（6px 別名，不 churn 67 處呼叫點，視覺同全量合併）；`.btn--icon-circle` 裸值 `9999px` 改 `var(--radius-pill)`。
- **Q3 預設卡＝純邊框（C 撤除陰影）**：`.ztor-card`／`.card`／`.kpi` 由 `--shadow-card` 改 `border:1px solid var(--border)`（平、editorial）。可點/浮起強調卡（`.ztor-card--clickable` hover、`.selection-card`）保留陰影。`.preview-card`／`.event-preview-card` 本為純邊框、維持。
- **Q4 控制項＝真 border**：`.input/.textarea/.select`、`.ztor-metric-pill`、`.switch` 由陰影模擬邊框改真 `border:1px solid var(--border)`（與 2026-06-12 outline 按鈕決定一致）；input focus 改 `border-color:--ring`＋3px 柔光環；switch knob 內移 1px 補償 border-box。
- **Q5 hover 浮起規則（文件化）**：可點卡片 hover 借陰影浮起；清單列/表格列 hover 只換底色（見 Q9）；純預覽/展示卡不做 hover。
- **Q6 表單節奏統一 16px**：移除 `.form-section .field` 的垂直節奏覆寫（原 gap 4px／欄位間距 26px 裸值），改吃基礎 `.field`（6px／16px）。「長流程用 24」折衷未採用（可選）。
- **Q7 卡片內距對照表（文件化）**：維持各自密度（kpi 16/18、card 20、ztor-card 24、selection-card 14/16、empty-card 32/24），整理成表寫進 design-system，未來新卡對號入座。
- **Q8 品牌橘收斂**：`.settings-nav__item--active` 由品牌橘 tint 改中性灰 `var(--sidebar-active)`，向 `.app-sidebar` 看齊（橘只留給主操作/主分類）。
- **Q9 hover 底色統一 --accent（C 撤除 --secondary）**：全站互動 hover 由散落的 `--muted`／即席 `color-mix` 灰統一成 `var(--accent)`（約 30 處，跨 button/chip/dropdown/list/table/tile/nav/wizard 等）；`--muted` 僅留斑馬紋/襯底。零消費的 `--secondary`／`--secondary-foreground` token 自 `_tokens.css` 亮暗兩區塊退役。**例外**：`.filter-tabs__item:hover` 保留 `--muted`（其 active 也是 muted，hover 不可比已選重）。
- **Q10 關閉鍵 icon 統一 16px**：移除 `.alert__close`(20)／`.leave-dialog__close`(18) 覆寫，回到基礎 `.ztor-icon` 16px。
- **Q11 已付款 Paid ＝ 綠色**：orders.html（3 處）／order-detail.html（1 處）的 Paid 徽章 `badge--neutral`→`badge--success`。
- **Q12 欄位標籤退役大寫孤例（C 撤除）**：`tier-settings.html` 的 `.gate-field__label`（大寫）退役，改用 DS 的 `.settings-row__label`（一般大小寫）；頁內 `<style>` 定義移除，補一條 gate/benefit 標籤↔輸入框 6px 間距。

design-system.md／design-system.html 同步 12 條裁決（卡片/控制項描述改真邊框、Q1/Q5/Q7/Q8 規則新增小節、`--secondary` 從 token 表移除）；check_ds_sync 全 PASS（既有 fan-store 裸色、零消費元件 WARN 未變）；收尾 `bump_ver` → **20260713a**（833 連結、34 頁）。

## 2026-07-11 · 全站元件統一（第三批）：四個新變體元件＋二輪掃描補修＋機械清理（B 反饋導入）

使用者指示「再次把基準三頁的元件推到其他所有產品頁」。三路二輪掃描（表單軸／清單狀態軸／24 頁殘留複檢）＋使用者裁決四項設計判斷後施工。同輪的兩則 payout 收斂另見下方兩條目。

- **四個新變體／元件（三件套齊全）**：`.amount-field--suffix`（右側單位如 %／months，與 `--readonly` 組合）；`.amount-field--hero`（payout 主角級 70px/32px）；`.kpi--success/--warning/--destructive`（只染 `__value` 的色態，status role token）；新元件 **`review-row.css`**（建立流程 Review 摘要列：`__item` > `__head`(`__name`＋`__action`)＋`__value`，另有 `__item--kv` 名值變體）——正規化 create-event `.ce-review-row`、create-project 壓平 `.card`、register-ip `.ri-summary` 三頁各自手刻的同族。
- **create-project 二輪補修**（第一批只改了骨架、金額欄與雙欄結構全漏）：5 個金額欄改 `.amount-field--readonly`（含「Per slot」的 `$200` 烤字串移出為前綴）；6 處「單一 `.field` 塞兩組 label+input 的 inline grid」拆成 `.form-grid`＋雙 `.field`；Review 步驟 9 個壓平 `.card` 改 `.review-row`，頁內 `!important` 壓平規則全數退場。
- **新變體套用**：register-ip 的 %／months 後綴改 `--suffix`（`.ri-affix` 家族退場）、`.ri-summary`→review-row；bundle-detail 折扣 %（`.bd-price-input` 退場）；event-detail 簽到統計三色卡（`.checkin-stats` 退場）改標準 `.kpi`＋色態；create-event `.ce-review-row`→review-row、時間三欄補 `form-grid--3`（第一批漏的修飾類）。
- **scanner.html data-list 標準化**：7 列重排 `__row-main`/`__end` 結構、inline grid 退場（全站 data-list anatomy 至此一致）；核銷互動經瀏覽器實測（篩選／模擬掃描／確認流程正常）。
- **ip-detail 分頁接線**：5 個裝飾性 tab 補 role/aria/data-tab＋切換 JS（照 project-detail 慣例、hash 深連結），內容分組：Overview（含歸屬模糊的「Manage as owner」，已標註）／Terms & usage／Assets（**產品缺口：無資產內容，面板為空**，記 ASSUMPTIONS.md）／Bidding／Owner contact。
- **list-footer 補齊**：projects／events／creators／my-ip 四個 JS 渲染清單頁補「Showing N of M」計數（接各頁篩選函式、空狀態時隱藏），新增 i18n 四鍵（`projects/events/creators/my-ip.footer.count`）；my-ip tabs 補 role/aria。
- **`.data-list__row[hidden]{display:none}` 收斂進 data-list.css**（原為 pickup-detail 頁內臨時規則，display:grid 蓋過 [hidden] 的元件級 bug 正式修復）。
- **store-settings 文件同步＋`.ss-amount` 退場**：規則已無 consumer，自 store-settings.css 刪除（tombstone），DS 兩份文件的欄位型別描述改 `.amount-field`。
- **機械清理**：全站 145 處 `<span class="badge__dot">` 死 markup 移除（24 檔＋`js/components.js` badge() 範本＋payout-request-modal.js；badge.css 規則與 DS 頁棄用說明保留）；15 支「link 了但零使用」的多餘元件 CSS 引用移除（create-campaign ×6、funding-simulate、events、my-ip、order-detail、pickup-detail、e-shop、store-settings；funding-simulate 的 form-section.css 因 `.form-footnote` 在用而保留）。
- **疑似項維持現狀（記錄不動）**：tier-settings spend gate 無 $ 前綴（與 Reputation gate 對稱考量）、頭像上傳兩頁實作不一（無正式元件）、my-ip 清單列尾迷你開關、scanner-result 的 dl key-value、fan-detail「Last active」KPI 字級（需字級變體而非 compact）、create-project 的 checkbox 選擇列（DS 無對應元件）、卡內窄搜尋（pickup-detail/scanner/create-project tier editor 一致待遇）。

- **icon registry 補鍵**：瀏覽器實測抓到 7 個「頁面在用但 registry 漏收、渲染空白」的 icon（inbox／gift／heart／history／store／user-plus／file-check，分布 event-detail、fan-detail、tier-settings、ip-market、register-ip），lucide path 已補進 `js/icons.js`，全站 icon 缺鍵清零。

check_ds_sync 全 PASS（fan-store 裸色 WARN 為既有註記存量）；收尾統一 `bump_ver` → **20260711c**（68 支元件 CSS，review-row 為第 68 支）；ip-detail 兩個產品缺口記 `ASSUMPTIONS.md` PG-016；`requirements-map.md` 無產品映射變化未動。

## 2026-07-11 · `.payout-field` 平行表單家族退場：restock／pickup-session／creators 三個最後 consumer 收斂進 field-system／form-grid／control-row（D infra，純呈現整併，零產品行為變更）

前一則「Earnings payout 彈窗欄位殼收斂」明確跳過 `partials/restock-modal.js`、`partials/pickup-session-modal.js`、`creators.html` 三個 consumer，本輪補做，`.payout-field`／`.payout-form-grid`／`.payout-inline-control` 家族全站退場。

- **三檔欄位殼統一**：`.payout-field`→`.field`（`__label`/`__hint`→`.field__label`/`.field__hint`）；`.payout-form-grid`→`.form-grid`。`restock-modal.js` 的「補貨方式＋供應商／到貨／備註」單據層、`pickup-session-modal.js` 的場次表單、`creators.html` 內建的建立 creator 表單皆改用新殼。三檔皆未曾實際使用 `.payout-inline-control`（`payout-modal.css` 裡的舊註解誤植，全站 grep 確認零 consumer）。所有 JS `querySelector` 走 `data-*` 屬性，class 改名不影響綁定；文案與 `data-i18n` key 零變動。
- **宿主頁補 `<link>`**（版本沿用該頁既有 `?v=20260711a`）：`e-shop.html`／`pickup.html`／`creators.html` 補齊 `field-system.css`／`form-grid.css`／`control-row.css` 三支；`product-detail.html`／`create-product.html` 各補 `field-system.css`（`form-grid.css`／`control-row.css` 已在）；`pickup-detail.html` 補齊三支。`design-system.html` 本來就三支俱全，未動。
- **`ds-components/payout-modal.css` 完全退場**：刪除 `.payout-form-grid`／`.payout-form-grid--single`／`.payout-field`(`__label`/`__hint`)／`.payout-inline-control` 四組規則（零剩餘 consumer），留 tombstone 註解指向 `field-system.css`／`form-grid.css`；同步修正 `@media (max-width:720px)` 內殘留指向舊 class 的響應式規則，改為 `.payout-dialog .form-grid`（範圍收在 modal 殼內，不影響頁面其他 `.form-grid` 用法）——這條規則在上一輪改名後其實已失效（選擇器對應不到任何元素），一併修正。
- **`ds-components/restock-modal.css` 精簡**：移除 `[data-restock-modal] .payout-field[hidden]{display:none}` 頁面局部覆寫——`field-system.css` 本身的 `.field[hidden]{display:none}` 已通用涵蓋（該檔已補 link 進兩個宿主頁），不需重複定義。
- **`creators.html` 順手清理**：狀態 badge 的 `<span class="badge__dot">` 死 markup 移除（該子元件 2026-07 起 `display:none` 棄用，僅此頁殘留字面 markup；其餘頁面另行處理不在本輪範圍）。
- **`design-system.html`／`design-system.md` 同步**：4.61 Payout 段落 prose（英/中雙語）改為「全部四個 consumer + creators.html 皆已收斂、舊 class 零 consumer、規則已從 payout-modal.css 移除」；4.62 Restock demo 卡的 `.payout-field`/`.payout-form-grid` 手刻 markup 改用 `.field`/`.form-grid`；`design-system.md` §4.29 Usage 段落同步、§4.29c Restock anatomy／Token usage／Dependencies／CSS 補上 field-system.css／form-grid.css。
- **已知殘留、本輪未動**：`pickup-detail.html` 原本就未 link `payout-modal.css`（modal 殼本身的樣式來源缺失），本輪只補齊 field-system／form-grid／control-row 三支，未動 payout-modal.css 缺口——與本次退場任務無關的既有缺口，留待後續處理。`BUILD-SPEC.md`／`ASSUMPTIONS.md` 中對 restock 的 `.payout-field` 描述屬歷史記錄未同步改寫（僅 design-system.md／html 屬本輪同步範圍）。

check_ds_sync 全 PASS（既有 fan-store 裸色 WARN 為存量已註記，未變動）；未 bump 版本（版本沿用既有 `?v=20260711a`，未新增 CSS/JS 檔）。

## 2026-07-11 · Earnings payout 彈窗欄位殼收斂進 field-system／form-grid／control-row／amount-field--hero（D infra，純呈現整併，零產品行為變更）

前一則「2026-07-10 全站元件統一」批次收尾時明確跳過「earnings payout 平行表單系統」，本輪補做。`partials/payout-request-modal.js`／`partials/manual-entry-modal.js` 原本各自用一套 `.payout-field`／`.payout-form-grid`／`.payout-inline-control`／`.payout-amount-*`，與全站標準 `.field`／`.form-grid`／`.control-row`／`.amount-field` 平行重複；金額輸入框（彈窗主角級 70px 高／32px display 字視覺）改用 design system 已新建的 `.amount-field.amount-field--hero` 變體承接，退場自刻的 `.payout-amount-*`。

- **兩支 partial 欄位殼統一**：`.payout-field`→`.field`（`__label`/`__hint`→`.field__label`/`.field__hint`）；add-bank／manual-entry 兩個表單網格 `.payout-form-grid`→`.form-grid`（預設 2 欄，欄位數符合）；「設為預設帳戶」／「上傳附件」兩個行內開關列 `.payout-inline-control`→`.control-row`(`__main`/`__sub`)，比照 create-auction 既有寫法。金額框改 `.amount-field.amount-field--hero`(`__unit` $ 前綴 + `.amount-field__input.input`)，70px/32px 視覺與改前等價、數值原樣移植。manual-entry 的「金額＋幣別 select」組合維持不動（無對應的無前綴＋幣別變體，只換外層欄位殼）。所有 JS 綁定走 `data-*` 屬性（如 `[data-payout-amount]`），class 改名不影響選擇器；文案與 `data-i18n` key 零變動。
- **`ds-components/payout-modal.css` 部分退場**：刪除 `.payout-amount-wrap`／`.payout-amount-prefix`／`.input.payout-amount-input`（唯一 consumer 已遷移），留 tombstone 註解指向 `amount-field.css`。**`.payout-field`／`.payout-form-grid`／`.payout-inline-control` 未刪**——全站 grep 發現 `partials/restock-modal.js`、`partials/pickup-session-modal.js`、`creators.html` 仍在用（另有 create-bundle／create-product／e-shop／pickup／fans-crm／order-detail／product-detail 等頁載入 `payout-modal.css` 間接依賴），不在本次改動清單內，保留並加註記說明原因，待後續分次收斂。
- **`earnings.html` 補 4 支 `<link>`**：`field-system.css`／`form-grid.css`／`control-row.css`／`amount-field.css`（此前只有 `payout-modal.css`）。
- **`design-system.html`／`design-system.md` 同步**：4.61 Payout demo 卡改用真身 `.field`／`.amount-field--hero`（移除純展示用的 `.payout-form-grid--single` 包裹，因真實 markup 本來就沒有這層）；compose chips 補 Field system／Form grid／Control row／Amount field；Class API 表兩列改寫並附「2026-07-11 起⋯原為」對照；`design-system.md` §4.29 anatomy／Dependencies／Usage 同步，Usage 段落註明 restock/pickup 兩支 partial 現況仍用舊 class；Pillar 4 表 Amount field 條目與 `amount-field.css` 的 Hero size 註解，語氣從「待遷移」改「已遷移」。

`requirements-map.md` 未動——5.1.8.1／5.1.8.2 兩條只到「已覆蓋哪些欄位」層級，未提及實作 class，本次純呈現整併不影響。check_ds_sync 全 PASS（既有 fan-store 裸色 WARN 為存量已註記，未變動）；`bump_ver` → **20260711a**。

## 2026-07-10 · 全站元件統一（第一＋二批）：以電子商店／建立商品／建立組合為基準，24 頁改用基準元件（B 反饋導入）

使用者指示「以 e-shop／create-product／create-bundle 用到的元件為主，改到其他所有產品頁上」。四路獨立盤點 29 頁得 28 項確定差距，經使用者批准後分七路施工；已對齊免改：orders、pickup、scanner、ip-market（request-payout 為轉址殘頁不適用）。

- **自建骨架歸位**：create-event（`.ce-block`→`.form-section`、`.ce-grid`→`.form-grid`、`.ce-type-icon`→`.selection-card--icon`、`.ce-save-status`→`.wizard__save-status`）；create-project（`.tf-grid`→`.form-grid`、`.card`+`!important` 硬蓋改 `.form-section`／`.form-grid`、2 處無樣式破版的 `.settings-row`→`.control-row`）；register-ip（`.ri-block`→`.form-section`、`.ri-tags` 19 處→`.chip-group`/`.chip`、`.ri-usage` 11 處→`.selection-card`、`$` 前綴 `.ri-affix`→`.amount-field--readonly`）
- **金額欄統一 `.amount-field`（唯讀 $ 前綴款）**：create-auction 起標/保留價、create-campaign 目標金額、product-detail 價格（value 內的 `$`/`USD` 移出為前綴呈現）、settings 撥款門檻（USD 字樣改進 hint，i18n key `settings.pay.min-hint` 雙語擴充）、store-settings 免運門檻（舊制 `.ss-amount` 退場，store-settings.css 內規則已無使用者、待清理）
- **空狀態語意修正**：projects／events／event-detail 誤用 `.empty-stub`（「頁面未建置」佔位符）→ `.empty-card`（icon＋title＋text＋清除篩選 CTA）；fans-crm 單行文字空狀態升級 `.empty-card`；creators `.empty-card__desc`→`__text`（class 錯字，樣式本來沒生效）
- **清單頁工具列**：projects／fans-crm 搜尋裸 input→`.field-pill`；fans-crm 手刻篩選鈕→`.chip-group`（JS toggle 改 `.chip--active`）；events 每列 3 顆常駐圖示鈕→`.dropdown` kebab；my-ip 裝飾性 tabs 接上切換 JS
- **詳情頁**：auction/bundle-detail 9 個 KPI 卡 inline style→`.kpi--compact`；auction-detail `.ad-info__k`／event-detail `.kv-row`→`.data-list`；order-detail 金額掛 `.data-list__amount`、出貨 modal 拆成標準雙 `.field`；pickup-detail 7 列重排 `.data-list__row-main`/`__end` 標準結構（並修復既有 bug：`[hidden]` 被 `display:grid` 蓋過、篩選從未真的隱藏列，頁內補 `.data-list__row[hidden]{display:none}` 待收斂進 data-list.css）；project-detail select 正名＋Actions 卡標題用 `.card__head`
- **失效 token 修復**：create-campaign／funding-simulate 16+6 處未定義變數（`--surface`/`--surface-muted`/`--text-sub`/`--text-strong`→`--card`/`--muted`/`--muted-foreground`/`--foreground`）；三頁 QR 產生 JS 的 `fill="var(--surface)"`→`var(--card)`；驗收時加抓 `pickup.css`／`scanner.css` 共 19 處同源殘留（含 `--success`/`--warning`/`--error`→`--status-success`/`--status-warning`/`--destructive`），修復後全站失效 token 清零（`--surface-shell`/`--surface-page`/`--surface-inverse` 為刻意保留的 [ext] token，不在此列）
- **i18n**：新增 `projects.empty.noresult.clear`、`events.a.more`、`fans.empty.noresult.title`/`.clear` 四鍵（雙語）
- **跳過歸第三批（設計判斷）**：register-ip 的 `%`/月數後綴輸入（amount-field 僅支援前綴）、event-detail 簽到統計卡（需 KPI 色態變體）、create-project Review 摘要卡 9 個的 `.card` 壓平（需 review-row 元件）、earnings payout 平行表單系統、tier-settings 大寫標籤、金額拆解列與 Review 摘要列的跨頁收斂

check_ds_sync 全 PASS（fan-store 裸色 WARN 為既有註記存量）；`bump_ver` → **20260710e**（施工後首 bump d、驗收加修 CSS 失效 token 後再 bump e）；`requirements-map.md` 無產品映射變化未動。

## 2026-07-10 · Design system demo 改用真身元件：Input 家族整併＋field__hint 防呆＋4 孤兒標註＋Card 章節損毀修復＋新增 Section card 條目＋badge__dot 清理（D infra，產品頁視覺零改動）

使用者發現 4.10 Field system 的 demo 間距與 create-product 實頁不同，根因是 DS 頁 demo 長期用一套 `ztor-*` 替身 class（產品頁從未採用）。原則：產品頁視覺是真相、DS 頁改成展示真身。

- **Input 家族整併**：`.input`／`.textarea`／`.select` 規則原住 `shared.css:805-835`，原樣整段搬進 `ds-components/input.css`（屬性值逐字元未動，含非 token 的 `9px` padding）；`shared.css` 原位置留一行指向新家的註解。`input.css` 內未被任何實頁使用的 `.ztor-input`／`.ztor-input--xs/sm/lg/xl`／`.ztor-textarea` 全數移除，檔頭補刪除紀錄。`design-system.html` 4.9 Input 章節 29＋5 處 `ztor-input`／`ztor-textarea` 全改真身：input 用 `.input`、textarea 用 `.textarea`，移除假的尺寸變體 demo，補 `.select`（含原生 chevron，此前從未正式示範）；真身缺 disabled／invalid 樣式，demo 不展示、`design-system.md` 記「狀態缺口：待補」。
- **field__hint 防呆**：`ds-components/field-system.css` 的 `.field__hint` 加 `margin: 0`，讓 p／div 元素選用不影響視覺；`design-system.html` 7 處 `<p class="field__hint">` 改 `<div>`，並修正 `pickup-detail.html:82`（本輪唯一動到的產品頁 markup，改後因 margin:0 防呆視覺不變）。
- **4 個行銷孤兒標註保留**：`ztor-footer`（4.42）、`ztor-cookie-banner`（4.67）、`ztor-accordion`（4.46）、`ztor-metric-pill`（Badge 條目內）在 `design-system.html` 各加一行雙語告示（沿用既有 `.compose__note` 告示樣式）「行銷站遺留元件，admin 後台未使用」，`design-system.md` 對應條目同步加註；內容與 CSS 均未刪除。
- **4.33 Card 章節損毀修復＋拆分**：該章節內容曾重複貼兩次、中間夾一段殘破片段（`</div>n class="sub" id="card">`），已重建為單一正確章節。順勢把混用已久的 `.ztor-card`／`.card` 兩個命名空間拆乾淨：4.33 Card 現只講 `.ztor-card`（產品頁未使用，展示保留，補雙語告示），新增 **4.33b Section card** 條目講 `.card`（產品頁真正在用的區段外框，evidence：e-shop、earnings、event-detail、auction-detail、bundle-detail、my-ip、fan-detail、create-campaign、create-event、create-project），並修掉原 demo 裡 `.card` 誤配 `.ztor-card__body` 的 bug。`design-system.html` 內原本語意上指向「區段外框」卻連到 `#card` 的交叉連結（Chart／Bento grid／Store settings／Chart 家族的 compose-map、4.1 Inventory 表）一併改連 `#card-section`，避免文件自相矛盾；TOC 新增 Section card 錨點。`design-system.md` 同步拆成 4.11 Card／4.11b Section card 兩條目，含界線說明。
- **badge__dot 清理**：Badge 條目（4.3）的 Status pill demo 表格 7 處 `<span class="badge__dot">` 移除（該子元件已 `display:none`，soft-tag 改版後棄用，markup 不再需要）；`design-system.md` Badge 條目補一句棄用說明。
- **驗收後補修（同輪）**：`ds-index.md` 重新生成（原索引仍列已刪的 `.ztor-input*`）；Badge 條目 Do／Class API 兩處說明文字仍在推薦 `badge__dot`，改為棄用口徑；`design-system.html` 其餘散落的死 markup `<span class="badge__dot"></span>`（程式碼範例、empty-stub、status-axes、settings-row、rental demo 共 8 處）全數移除，僅留 Class API 表的棄用說明列；4.10 Field system demo 頭與 `design-system.md` 條目補「單獨預設密度 gap 6／欄距 16 vs Form section 內收緊為 gap 4／欄距 26（form-section.css 情境規則）」交叉說明——這正是使用者比對 4.10 與 create-product 時的第二個困惑來源（第一個是 ztor-input 替身），兩者現都已文件化。產品頁殘留的隱形 `badge__dot` markup（24 檔）不影響視覺，留待日後順手清。

`requirements-map.md`：本輪全屬呈現層元件整併，無產品映射變化，未動。check_ds_sync 全 PASS（既有 fan-store 裸色 WARN 為存量已註記，未變動）；`bump_ver` → **20260710c**。

## 2026-07-10 · 三項 design system 歸位修正：alert--page-top 文件校正＋tabs 短底線變體＋寬度 token 家族（D infra，零視覺變動）

昨日 DS 稽核發現三處歸位問題，已裁決落地：

- **`.alert--page-top` 文件校正**：`ds-components/alert.css` 註解、`design-system.md`、`design-system.html` 對此變體的描述更新為雙情境現況——(1) Events 的 Event Day 情境橫幅（`js/scenario.js` 注入 events.html，由 devtools 情境狀態觸發），用變體基底原樣＝滿版邊到邊；(2) E-Shop 低庫存提醒（`#eshop-stock-bar`），該頁以 instance 覆寫將其收窄、置中對齊內容欄，關閉自帶下緣陰影與 `::after` 角遮罩、改走共用 `.edge-shadow`，屬記錄在案的頁面特例。「邊到邊」是基底行為、保留描述；原稽核「Events 相關頁面查無使用」的前提經核實為誤判（橫幅由 JS 注入、靜態 grep 頁面 markup 看不到）。**e-shop.html 的 alert 相關區塊零改動**。
- **tabs 短底線升級為正式變體**：e-shop.html 頁內覆寫（灰底線關閉＋active 底線縮短置中）promote 成 `ds-components/tabs.css` 的 `.tabs--underline-short`；e-shop.html 的 `.tabs` 改掛此 class、刪除頁內對應覆寫規則（`margin-bottom:0` 屬頁面版式間距，保留頁內）。`design-system.md`／`design-system.html` 同步新增變體說明與 demo，視覺與改前逐 px 一致。
- **寬度 token 家族 `--w-*`**：`ds-components/_tokens.css` 新增 Foundation 寬度刻度 `--w-220`／`--w-300`（欄位／小元件 max-width 刻度，起點兩值、後續按需擴充）；套用於 create-product.html 三處寬度裸值（自訂低庫存門檻欄、限購數量欄、pickup session 下拉的 flex-basis）。`design-system.md` 的 token 表與 `design-system.html` token 展示區同步文件化。

`requirements-map.md`：本輪全屬呈現層，無產品映射變化，未動。check_ds_sync 全 PASS（既有 fan-store 裸色 WARN 為存量已註記，未變動）；`bump_ver` → **20260710b**。

## 2026-07-10 · 補齊 6/25 token 改名收尾：斷鏈修復＋md 表格對齊＋裸值→token＋amount-field 文件修正（D infra）

6/25 token 大改名（`--foreground-subtle→--muted-foreground`、`--surface-rail→--sidebar`、`--surface-rail-hover→--accent`、`--surface-rail-active→--sidebar-active`）與 px→token 遷移收尾有漏，本輪補齊：

- **斷鏈 token 修復**：`product-list.css`、`pickup.css`（6 處）、`scanner.css`（4 處）、`scanner.html`（2 處 inline）、`restock-modal.js`（1 處模板字串）共引用已不存在的 `--foreground-subtle` 14 處，一律換成 `--muted-foreground`（原本樣式實際失效，本輪修復後灰字才真正生效）；`data-list.css` 註解、`design-system.md` 規格文字（§4.90 Product list variants）同步改詞。
- **design-system.md 兩張 token 表舊名清理**：Quick Reference（§0，~76-96 行）與 Pillar 1 Foundation（~145-163 行）表內 `foreground-subtle`／`surface-rail`／`surface-rail-hover`／`surface-rail-active` 四列就地改名為 `muted-foreground`／`sidebar`／`accent`／`sidebar-active`，值與描述保留不變。
- **e-shop.html／create-product.html 裸值→token**：兩頁 6/25 新寫 markup 遺留的裸 px 間距共 12 處，換成對應 `var(--sp-N)`（e-shop.html 的 `margin-top`/`margin-bottom` 3 處；create-product.html `<style>` 區 3 處＋inline style 9 處），寬度類裸值（max-width 等）維持不動。
- **amount-field 文件修正**：`design-system.html` anatomy 表 `.amount-field__unit` 描述由「muted fill／灰底」改為與 `amount-field.css:29` 實作一致的「白底（--card）、hover 淡灰（--accent）」；補文件化 `[data-price-sync]`（標記共用單位群組、前綴固定 46px 置中欄）與 `[data-amount-unit]`（前綴按鈕點擊 hook，頁面 JS 對整組切換 $/🍿）兩個屬性契約，`design-system.md` 的 Amount field 條目同步補一句說明。

`requirements-map.md`：本輪全是呈現層修正，無產品映射變化，未動。check_ds_sync 全 PASS（既有 fan-store 裸色 WARN 為存量已註記，未變動）；`bump_ver` → **20260710a**。

## 2026-07-09 · 對齊 eShop BRD：建立商品加「定價單位切換」＋商店設定幣別四選（A spec-derived）

依 documents 新決策落地兩處（上游：BRD BR-05／BR-13，已寫進 `documents/decisions.md` D124／D125）：

- **create-product 定價單位切換**（spec 5.1.5.2 F3.2／D124）：在價格區塊之前新增一個 `.segmented`（沿用既有元件、非新元件）現金／POPCORN 二選一切換，作用於整件商品（單一與多規格皆然）。切 POPCORN 時價格欄 placeholder 由 `$ 0.00` 換 `POPCORN 0`、隱藏同分類均價提示。**為什麼這樣設計**：規格把 POPCORN 定位為「與現金切換的定價單位」（現金為定價之準、POPCORN 由現金價換算），非並排兩個價格欄；故用單一單位切換而非新增欄位。JS 沿用頁內 `wireSegmented` 助手，i18n 新增 `cp.priceunit.*` 四鍵。**POPCORN 換算率與收款受 OQ-1 閘控＝產品缺口 PG-016**，此切換為探索性佔位、不做換算計算、不宣稱可收 POPCORN。
- **store-settings 幣別重整**（spec 5.1.5.5 F6／D125）：三件事——(a) 幣別由 F2 店面門面抽出成獨立的 **F6 · 幣別**；(b) F6 與付款／出貨並列為**第三個設定 tab**（付款｜出貨｜幣別），原型把幣別 select 從身分帶 meta 行搬進設定群組 tabpanel（`data-ss-tab/panel="currency"`、沿用通用 tab 切換 JS），i18n 加 `store-settings.group.currency`／`store-settings.currency.hint`；(c) 選項由原型自填的 USD/EUR/GBP/JPY/TWD 校正為規格四種 **HKD／TWD／SGD／USD**。**為什麼**：幣別選項集與版面歸屬屬產品決策，依 D125 校正；此為法幣顯示幣別、與商品 POPCORN 單位是兩件事，放同一組 tab 與付款/出貨並列。顯示鎖定方式仍待上游、未在此假設。

---

## 2026-07-09 · 3 組重複頁內樣式 promote 進 design system（D infra，零視覺變動）

稽核發現 create-product / create-auction 兩頁逐字重複破壞性 ghost 按鈕與 footnote 樣式，7 個建立頁逐頁複寫 `.wizard__body` 的頂距與內容寬——皆違反「可重用樣式第一次出現就 promote」鐵律。三組數值全數照抄搬進 ds-components，不改動任何呈現：

- **`.btn--ghost.btn--destructive`**（`ds-components/button.css`）：紅字＋hover 淡紅底，綁 `.btn--ghost` 防止誤掛 `.btn--primary` 做出紅色主按鈕。create-product `#cp-delete`、create-auction `#ca-delete` 改用，刪除頁內 `.cp-delete`/`.ca-delete` 兩組規則（含殘留的 fallback hex，改用 `var(--destructive)` 純 token）。
- **`.form-footnote`**（併入 `ds-components/form-section.css`，不開新檔）：表單底部置中小字（如 Stripe 保障文案）。create-product `.cp-footnote`、create-auction `.ca-footnote` 改掛，數值逐字照抄（margin-top 22px 非 token）；create-campaign 的 `.fc-footnote` 樣式不同，維持獨立不動。
- **`.wizard__body--form` / `--narrow` / `--wide`**（併入 `shared.css` 既有 `.wizard__body` 規則之後）：7 個建立頁（create-product/-auction/-bundle/-campaign/-event/-project、register-ip）刪除頁內 `.wizard__body` 覆寫、改掛修飾類。已知分岔未收：funding-simulate.html（32px 頂距）、funding-test/create-campaign.html（44px 頂距）維持頁內獨立覆寫，不強行統一。

DS 雙文件（`design-system.md`＋`design-system.html`）同步三項新內容；`check_ds_sync` 全 PASS；`bump_ver` 統一 cache-bust。

## 2026-07-08 · 元件 vs Pattern 分類學修正：展示判準＋Pillar 5 中間層配方（B 反饋導入）

使用者發現 4.10 Field system 的視覺展示長得像 pattern（兩個欄位堆成表單）、4.11 Form section 的示範是隨機組合。診斷：Pillar 5 只有頁面級配方，中間層組合規則（表單怎麼堆、modal 殼共用…）無處可放，於是寄生在 Pillar 4 的示範裡造成誤導。整輪修正：

- **立展示判準（§4.0＋design-system.md＋skill）**：元件段視覺展示只展示「該元件單一實例」的變體 × 狀態矩陣；多元件組合示範一律標「實際情境 In context」並連 Pillar 5 對應卡；組合規則只寫 Pillar 5。判斷句：「刪掉這個元件的 CSS，這條規則還成立嗎？」成立 → pattern。
- **4.10 Field system**：展示改為單欄位矩陣（input／switch／textarea 三種槽 × default／+hint／+required），原兩欄位堆疊改標 In context 連 Form assembly 配方；規格表註明「多欄位成組＝Pillar 5，非本元件」。
- **4.11 Form section**：層級 🟡 molecule → 🟠 organism（承載 Field 的組合殼）；展示改「單一區段（unit）」＋「區段相接自動分隔線（form-section.css 自有規則）」兩塊，並註明「哪些區段、什麼順序、放哪些欄位＝Pillar 5 配方，示範欄位只是示意」。inventory 同步。
- **4.30 Filter row**：拆掉展示內嵌的 data-list（那是 Pillar 5 · Filter + list 配方的重演），改為文字指向配方卡。
- **4.82 Pickup management**：原本兩個無關功能（F6 Scanner 存取卡＋F3 取貨多選列）疊在同一示範，拆成兩塊各自標題的獨立展示。
- **4.50 Wizard frame／4.61 Payout**：加指向——殼歸元件段、使用規則歸 Pillar 5（wizard 卡／新 Modal shell 卡）。
- **Pillar 5 擴充＋修 bug**：
  - 修既有表格 bug：Lifecycle 與 Wizard 兩列都少了「Pattern card」名稱格（內容擠進名稱欄）。
  - 新增 4 張中間層配方卡（html 縮圖＋表列、md 完整五欄卡）：**Form assembly**（欄位→區段→表單、26px 節奏、欄位順序識別→內容→設定→風險揭露）、**Settings page**（nav 分組＋列卡、右槽單控件、逐列生效或整卡儲存擇一）、**Modal shell**（canonical `.payout-dialog` 殼＋scroll-lock＋確認閘、絕不自捲新殼）、**Split preview**（右欄壓縮主欄、無遮罩非浮層、關閉還原）。5 → 9 張卡。
- skill 同步：project-ui-creator SKILL.md 元件策略加展示判準條；`_shared/component-inventory.md` §16 加 v9 變更（含「Pillar 5 必須含中間層配方」）。
- 驗證：headless playwright——4.10 矩陣 9 格單欄位＋In context 連結、4.11 organism 標籤＋pattern 連結、4.30 無內嵌 list、4.82 兩塊展示、Pillar 5 縮圖 9 張／表 9 列／0 缺格列、§4.0 判準在、4.50/4.61 指向在；`check_ds_sync` PASS（唯一 WARN＝既存 fan-store 裸色）；`bump_ver` → `20260708a`。

## 2026-07-07 · DS 頁優化輪：結構修正＋token 文件化補洞＋15 段矩陣卡化（B 反饋導入 · D infra）

使用者指示「優化 r2.1 的 Design System」，盤點後執行三批：

- **結構修正（`design-system.html`）**：
  - 合併重複文件化的 Search collapse——原 §4.28b（插錯位）與 §4.79 同 id、同元件寫了兩段；併成一段（保留較完整敘述＋雙態標籤 demo），TOC 去重。
  - 修 §4.78 編號碰撞（Spec row／Album tracks 同號）：尾段順推為 4.78 Spec row → 4.79 Album tracks → 4.80 Search collapse → 4.81 VIP card → 4.82 Pickup → 4.83 Scanner。全頁不再有重複編號。
  - 兩個殘留的獨立「變體 ·」區塊照 Split button 前例併入視覺展示：4.45 Tabs 的「變體 · Filter tabs」改為兩張矩陣卡（base × default/:hover/:focus-visible/--active、brand × default/--active），其 Purpose 濃縮進卡頭、Do&Don't 與 Class API 併入主段；4.54 Preview card 的「變體 · Event preview card」併為卡片，整段重構為兩張矩陣卡（.preview-card 含 filled/.is-empty 兩態、.event-preview-card）＋單一 code-fold。
  - 盤點原疑「4.8 Icon 雙 code-fold」經查屬誤判——第一個 fold 是「瀏覽 1683 個未用圖示」圖庫、與開發者 fold 用途不同，保留。
- **token 文件化補洞（含檢查器 bug 修正）**：
  - 修 `check_ds_sync.py` 檢查 9 的通配 bug：`--r1..--r5` 範圍寫法產生 rogue 前綴「-」，等於任何 token 都算已文件化、html 覆蓋檢查形同虛設。加「範圍前綴必須仍是合法 token 形」防呆。
  - bug 修掉後浮出 45 個 html 端未文件化 token，全數補齊：字級表第二欄改記真正 token 家族名（`--type-display-64-*` 等 6 家 ×5=30）；§2.1 補「已定義・待採用」揭露行（shadcn 對齊組：`--chart-1..5`、`--popover(-foreground)`、`--secondary(-foreground)`、`--accent-foreground`、`--card-foreground`、`--destructive-foreground`、`--input`、sidebar 四成員）；狀態色說明補 `--status-accent`；§1.5 陰影表補全 `--shadow-raise-strong` 全名；§2.5 補 `--overlay-tint`/`--overlay-blur` 毛玻璃配方。
  - `design-system.md` 同步：changelog 過期指標修正（`--space-1..16` 已退役非待採用）、Sidebar family 行標注 4 個未引用成員待採用、機器 `_inventory` 移除已退役的 navigation-menu。
- **15 段裸矩陣升級 matrix-block 卡**（比照 §4.2/§4.5 格式，卡頭帶名稱＋用途說明）：4.3 Badge、4.4 Status dot、4.6 Switch、4.8 Icon、4.9 Input、4.19 Selection card、4.22 Segmented control、4.25 Table（兩張）、4.33 Card、4.34 KPI、4.40 NavigationMenu、4.45 Tabs、4.46 Accordion、4.68 Alert。內容值不變、只升級包裝與可讀性；chart 段經查無矩陣（盤點誤標）未動。
- 驗證：headless playwright 實測——15 段卡數正確、獨立變體區塊 0 殘留、search-collapse 唯一、尾段編號連續、TOC 0 斷鏈、filter-tabs pill 正常渲染；`check_ds_sync` 10 項 PASS（唯一 WARN＝既存 fan-store 裸色）；`bump_ver` → `20260707b`。

## 2026-07-07 · 陰影系統化：E0–E4 海拔階梯（B 反饋導入・全站 token 層）

使用者裁示風格方向：扁平為底、用柔和陰影做浮起分層，並要求把它變成統一系統。陰影收斂為五階海拔（elevation）階梯，每階綁定固定用途：

- **階梯**：E0 貼底（`--shadow-hairline`，邊緣非浮起）／E1 微浮（`--shadow-raise`，按鈕輸入框）／E2 卡片（`--shadow-card`，card·清單容器·KPI·sticky 工作列）／E3 懸浮（**新 `--shadow-float`**：下拉、popover、tooltip、拖曳列）／E4 覆蓋（**新 `--shadow-overlay`**：modal、對話框）。
- **規則**：一元件一階；互動借上一階（`--shadow-card-hover` 改為 float 別名，card hover＝升到 E3）；同層分隔永遠不用陰影（用 hairline／surface 色階）；越高位移暈開越大、濃度收斂（柔和、保扁平感）；深色模式成對定義（提高 alpha＋亮色內框）。
- **遷移**：`--shadow-popover` 淘汰——下拉（dropdown-menu、header 帳號選單）、chart tooltip、`.tip__bubble`、cookie banner、拖曳列、readiness popover、建立頁自動完成/就緒 popover 改 `--shadow-float`；modal 家族（payout-dialog、embed-modal、leave-dialog）改 `--shadow-overlay`；低庫存 sticky 條裸值陰影改 `--shadow-header`（邊緣工具）。
- **DS 同步**：design-system.html §1.5 改為階梯表＋五階視覺 demo、§2.5 對照更新；design-system.md token 表／Elevation 表／dark 差異表／payout·dropdown·cookie 條目同步。BUILD-SPEC 補決策紀錄。
- 動機：原本下拉、卡片、modal 全共用 `--shadow-card`，「誰浮在誰上面」無法表達；`--shadow-popover` 強度與命名顛倒。階梯化後層級語意固定、新元件先選階再實作。

## 2026-07-06 · 電子商店 UI 優化第一輪：demo 資料在地化＋縮圖分類 icon＋表頭一致（B 反饋導入）

使用者裁示優化 r2.1 UI、先做電子商店頁。本輪處理內容品質與一致性五項：

- **填充列全面在地化**（e-shop.html `fillDemoProducts`）：原 22 列填充商品分類/庫存是英文（「Accessories」「12 left」）且名稱與分類錯配（Beanie→Books）、價格庫存為等差數列。改為逐件指定——繁中分類（§7.1 葉節點：配件/服飾/書籍/居家生活/海報與印刷）、合理價格與自然變化庫存、每件補中文 meta 描述（「毛帽 · 均碼」）、庫存格式統一「剩 N 件」。
- **競標分類改單語**：`cp.acat.*` 七鍵由雙語並列（「服飾 · Clothing」）改單語（D108 固定繁中後與商品/組合分頁一致；該組鍵現僅 e-shop 競標分頁使用）。
- **表頭「商品圖片」欄改空白**：三分頁表頭的 Image 欄改 `aria-label`（與訂單管理/取貨管理縮圖欄一致）；移除 `e-shop.col.image` 鍵。
- **縮圖占位改分類 icon**：原每列灰字「ztor.」文字 mark 看似圖片壞掉，改為分類 icon（書籍→book-open、服飾→shirt、音樂專輯→disc、收藏品→gem、配件→tag、居家生活→house、海報與印刷→image、草稿→package）；`product-list.css` 新增占位 icon 樣式（20px、`--foreground-subtle`），icons.js 補 shirt/book-open/disc/gem/house 五顆；「ztor.」mark 保留為通用變體（DS demo 並陳兩種）。
- **DS 同步**：design-system.html `--eshop` demo 列改示範 icon 占位＋說明；design-system.md placeholder 條目補 icon 對照表。

## 2026-07-06 · 場次詳情「名單／核銷紀錄」改分頁切換（A spec-derived · D123）

使用者裁示：取貨場次詳情把「取貨與入場名單」與「核銷紀錄」合併成同一區塊的分頁切換，名單為預設分頁、核銷紀錄放最後。規格 5.1.5.15 改寫成三個 F 項（F3 分頁切換／F4 取貨與入場名單／F5 核銷紀錄）。

- **pickup-detail.html**：原本名單與核銷紀錄上下堆疊（紀錄在上），改為 `.tabs` 分頁切換——「取貨與入場名單」預設分頁在前、「核銷紀錄」第二分頁在後；各自的 filter-tabs／搜尋／匯出保留在各分頁內。新增 `data-pk-detail-tabs` 切換 JS、補掛 `tabs.css`。
- 沿用既有元件（`.tabs` 同 scanner.html／其他頁），無新元件；i18n `pk.tab.roster`／`pk.tab.log` 既有。
- 動機：名單（誰核銷了沒）與紀錄（發生過哪些動作）是同一場次的兩個視角，收在一組分頁比上下兩長段更好切換；名單是現場最常看的，設為預設。

## 2026-07-06 · 取貨核銷改二元制（A spec-derived · D122，部分推翻 D119）

使用者裁示：取貨核銷是二元的——每次掃描一次領取該買家在此場次的所有物品；掃過＝已核銷、未掃＝待核銷。移除 部分核銷、有問題、未到場（No-show）。規格 §7.2 與 5.1.5.11／5.1.5.14／5.1.5.15／5.1.5.3.1 同步。

- **pickup.html**：F2 摘要「Issues」KPI 改「Redeemed today（今日已核銷）」；F4 清單移除「Issues」欄（9→8 欄，`product-list--pickup` grid 同步）與 Ended 列的 No-show 統計。
- **pickup-detail.html**：F4 名單移除 No-show／Issues 篩選分頁與該兩列、pending 列的「Mark issue」動作、標記有問題的 JS；保留「反轉核銷」。
- **scanner.html**：Items 統計去「Issues」；Roster 的 Issue 列改為已核銷；hint 去「mark issue」。SCEN 保留「已領取過（重複掃）／不在此場次」即時提醒（非狀態）。
- **i18n**：移除 pk.kpi.issues／pk.col.issues／pk.stat.issues／pk.stat.noshow／pk.roster.issue／pk.roster.noshow／pk.st.issue／pk.roster.flag／pk.roster.r5；新增 pk.kpi.redeemed；改寫 pk.roster.r4／sc.roster.hint。
- 動機：現場核銷是「來了就一次領完」，部分／異常／未到場對 demo 語意多餘；二元制與 scanner「一次領取全部」一致。

## 2026-07-06 · 取貨場次移除「草稿」狀態（A spec-derived · D112）

使用者裁示：取貨管理不需要草稿。規格同步更新（§7.2 取貨場次狀態、5.1.5.11 F2／F3），站台跟改。

- **F2 場次清單**：移除「草稿（Draft）」狀態篩選分頁與草稿範例列；場次狀態只剩 尚未開始／進行中／已結束／已封存。
- **F3 建立場次 popup**（`partials/pickup-session-modal.js`）：移除「Save draft」次要動作，只留「建立場次」主鈕；主鈕在未加入任何取貨商品或活動票券前**停用**（空場次無法建立、無草稿中繼態）。提示文案 `pks.note` 改寫。
- **i18n**：移除 `pk.status.draft`／`pks.draft`／`pk.act.delete`（Delete draft）三個已無引用鍵。
- 動機：草稿中繼態對現場核銷無意義——場次一定要有可核銷項目才成立；「必須加項目才能建立」比「先存空草稿」更符合現場流程。DS 頁 draft 字樣皆屬「商品草稿／建立流程存草稿」，與取貨場次無關，不動。

## 2026-07-06 · 訂單管理／取貨管理主清單對齊電子商店 UI 元件（B 反饋導入）

使用者裁示：訂單管理（orders.html F3）與取貨管理（pickup.html F2 場次清單）要以電子商店（e-shop 家族）的 UI 元件為準。原本兩頁用的是較陽春的 `.data-list`＋灰底 `.filter-tabs`＋常駐 `.input` 搜尋，與 e-shop（product-list＋淡橘 filter-tabs＋收合搜尋＋kebab＋分批頁尾）不一致。本輪把兩頁主清單改吃同一套共用元件。

- **清單列 `.data-list` → `.product-list`**：新增兩個欄位版型 `product-list--orders`（icon／訂單+買家+品項·取貨 meta／金額／狀態雙軸／日期／actions）與 `product-list--pickup`（icon／場次名+地點·時間·統計 meta／狀態／scanner／actions），比照既有 `--eshop/--bundles/--auctions` 手法疊在 base grid 上、不改 base（含 `product-list__head` 欄位表頭、≤760px 堆疊）。清單**不再包 `.card`**、直接落頁（比照 e-shop）。pickup 詳情內的 F4/F5/F8 子清單維持 `.data-list`（次級清單，比照 order-detail）。
- **狀態篩選灰底 `.filter-tabs` → `.filter-tabs--brand`＋每項數量**：淡橘 active／橘字，每個 tab 附 `.filter-tabs__count`（隨搜尋連動重算）。
- **搜尋常駐 `.input` → `search-collapse`（收合式）**：放大鏡鈕點開成 `field-pill`、✕／Esc 收起。
- **工作列改兩排式**（比照 e-shop F3）：上排收合搜尋靠右、下排狀態篩選獨佔整列（版面為 page-specific inline 佈局，不套 e-shop 的 sticky／Figma 陰影；元件本身皆共用）。
- **列操作收進 kebab（⋯）`dropdown-menu`**：orders 列＝Open order／Copy order #／View in Earnings；pickup 場次列依狀態＝Open／Start scanning／Copy URL／Edit session／Archive（草稿＝Edit／Delete；已結束＝Open／Export／Archive）。點外部或點選項後自動關閉。
- **分批載入頁尾 `list-footer`**：清單下方加 end-cap 計數（Showing N of M，隨篩選更新；demo 已全載）。
- 新增 i18n：`orders.col.*`／`orders.a.*`／`orders.btn.search`／`orders.search.close`／`orders.footer.count`／`pk.col.*`／`pk.a.more`／`pk.act.archive`／`pk.act.delete`／`pk.btn.search`／`pk.search.close`／`pk.footer.count`（en＋zh）。無新增 icon（more-vertical/search/x 皆既有）。
- 驗證：Playwright 實測兩頁——product-list 渲染（列高 88px、欄位版型正確）、filter-tabs--brand 橘色 active＋數量（orders 4/0/3/1/2/1/1、pickup 4/1/1/1/1/0）、收合搜尋開合、狀態篩選、kebab 開關、footer 句子在地化（load 後重跑修掉 inline 早於 i18n 的英文殘留）、pickup 詳情/建立場次 popup 仍正常；0 raw i18n、0 缺 icon。`check_ds_sync` PASS（唯一 WARN＝既存 fan-store 裸色）；`bump_ver` → `20260706a`。

## 2026-07-03 · E-Shop 新增「取貨管理」＋現場 QR 領取串接（A spec-derived · D111／Plan170）

上游規格新增 E-Shop 子頁「取貨管理（Pickup Management）」（documents/5.1.5.11，決策 D111）：現場 QR 領取不再塞進訂單出貨表單，改由取貨場次統一核銷，一個場次可同時核銷多個取貨商品與多個活動票券，並產生密碼保護的獨立手機 scanner URL。依規格把整套落到 R 2.1。

- **導航（全站）**：`js/sidebar.js` 的 E-Shop 下拉由「電子商店／訂單管理」加為三項，第三項＝取貨管理 → 新頁 `pickup.html`（icon `qr-code`）。i18n 新增 `nav.pickup`／`nav.pickup-sub`。`scanner.html` 為獨立手機頁、無主導航，刻意不進 `match`。
- **新頁 `pickup.html`（取貨管理主頁，F1–F8）**：清單視圖（F1 頁首＋4 張總覽 KPI「今日待核銷／進行中場次／待設定／有問題」＋needs-setup 提示＋F2 場次清單，狀態 filter-tabs＋搜尋，比照 orders.html）；場次詳情視圖（場次基本資訊＋F6 Scanner 存取卡＋tabs：F4 可核銷項目〔取貨商品／活動票券〕、F5 取貨入場名單〔狀態篩選＋搜尋〕、F8 核銷紀錄〔結果篩選＋匯出〕）。清單全部重用 `.data-list`／`.kpi`／`.filter-tabs`／`.tabs`／`.badge`／`.empty-card`。
- **新元件 `ds-components/pickup.css`（🟠 organism · SiteSpecific）**：`.scanner-access`（F6 URL＋密碼＋QR 卡）、`.qr-box`（framed faux-QR，`window.ztorFauxQr()` 生成）、`.pickup-detail__header/__meta`、`.pickup-stats`、`.pickup-select__row`（建立場次多選列）。全 token 化、無裸色。
- **新元件 `ds-components/scanner.css`＋新頁 `scanner.html`（F7 手機 scanner，🟠 organism）**：獨立 URL、無主工作台導航。密碼閘 → 相機視窗（`--surface-inverse` role token、非裸色；掃描線 respects `prefers-reduced-motion`）→ 掃描結果（有效／重複／不屬此場次 三種 banner）→ 確認核銷。demo 用「模擬掃描」循環四情境。
- **共用建立場次 popup `partials/pickup-session-modal.js`（F3）**：`.payout-dialog` 外殼＋`.pickup-select` 多選＋場次名稱／地點／開始·結束時間（含結束＞開始驗證）／取貨說明／scanner 密碼；建立成功→顯示 scanner URL＋QR 結果步。由 `pickup.html`／`create-product.html`／`product-detail.html` 三處共用；從商品脈絡開啟時該商品預先勾選。
- **姊妹頁串接**：`create-product.html`／`product-detail.html` 的「現場 QR 領取」加「取貨場次」選擇＋「建立取貨場次」鈕（開共用 popup）；`orders.html` 混合訂單列加品項層取貨狀態徽章＋待出貨只計物流的說明；`order-detail.html` 品項列加取貨資格狀態（待取貨／場次／核銷紀錄入口），出貨 popup 的 QR 分支改為「不在此手動 Mark received、由取貨管理 scanner 核銷回寫」並隱藏確認鈕。
- **icon**：`js/icons.js` 新增 `scan`／`map-pin`／`calendar-clock`／`key`／`rotate-ccw`。**i18n**：新增 `pk.*`／`pks.*`／`sc.*`／`cp.delivery.session.*`／`pd.delivery.session.hint`／`od.item.pickup.*`／`od.qr.session|manage|note`／`orders.row1.pickup`／`orders.pickup.note`（en＋zh），並改寫既有 `cp.delivery.qr-note`／`od.qr.body`（原「核銷機制待補」→ 串接取貨場次）。
- **DS 同步**：`design-system.html` 加兩支 `<link>`＋TOC＋元件表列＋§4.81 Pickup management／§4.82 Mobile scanner demo；`design-system.md` 元件表加兩列。camera 視窗用 `--surface-inverse`、無新裸色例外。
- 驗證：`check_ds_sync` PASS（唯一 WARN＝既存 fan-store 裸色）；`bump_ver` → `20260703e`；Playwright 實測見下。

## 2026-07-03 · 4.5 Chip：視覺展示改完整矩陣＋釐清「動作用 Button 不用 chip」（B 反饋導入）

使用者反饋：4.5 Chip 的視覺展示要像 §4.2 Button 一樣是完整矩陣；並確認 Export CSV 應是 Button、產品頁沒用錯。

- **Chip 視覺展示改矩陣（`design-system.html`）**：原本是「一個 filter-row demo ＋ 一個只有 `.chip` 一列、把 `.chip--static` 硬塞成狀態欄的半矩陣」，改成三張 `matrix-block` 卡：
  - `.chip`（篩選）— text／+count 兩列 × default／:hover／.chip--active
  - `.chip--static`（唯讀）— default／:hover(無變化)
  - `.chip--removable`（帶 ×）— neutral／.chip--active
  - `.filter-row`（chip-group＋Button 動作）保留為「實際情境」示範。格式與 §4.2 一致。
- **釐清 Export CSV 是 Button（非 chip）**：filter-row 情境下加 field-text 明說「Export CSV 是 `.btn--outline`、不是 chip；chip 負責篩選，匯出／列印這類動作用 Button」；Do&Don't 補一條「別把動作做成 chip」。`design-system.md` 同步（Don't 條）。
- **產品頁審計（無需修）**：全庫掃 `.chip` 用法——文字全是篩選／分類／標籤值（All、E-Shop、Vinyl、稅務國別、尺寸 S/M/L…），**0 個動作被做成 chip**；所有 Export／匯出 都是 `.btn`（earnings／fans-crm 皆 `.btn--outline`）。產品頁用法正確，未動 markup。
- 驗證：playwright 實測 chip 段三張矩陣卡渲染、Export CSV＝`<button class="btn btn--outline btn--sm">`、`.chip--static` 不再當狀態欄；`check_ds_sync` PASS（唯一 WARN＝既存 fan-store 裸色）；`bump_ver` → `20260703d`。

## 2026-07-03 · 4.2 Button：高度對齊 --control-h 尺度＋Split button 併入顯示展示矩陣（B 反饋導入）

使用者反饋兩點：`.btn` 系列高度是非整數（預設 37.5px、`--sm` 27.5px，源自 padding＋`line-height` 撐出的尾數），要**對齊既有控件尺度 `--control-h`**（跟 input／`.ztor-btn` 同一套 token）；4.2 Button 的「顯示展示」本身就是變體矩陣，底下不該再掛一個獨立的「變體 · Split button」區塊。

- **`.btn` 高度 token 化（`button.css`）**：產品密度 `.btn` 改為釘 `--control-h` 高度、丟掉垂直 padding、由 `align-items:center` 置中（`box-sizing:border-box` 讓 outline 的 1px 邊框含在同一高度內）。對應：預設 `.btn` = `--control-h-sm`（36px，原 37.5）、`--sm` = `--control-h-xs`（28px，原 27.5）、`--lg` = `--control-h-md`（44px，原 ~45）。四變體（primary／outline／ghost／soft）× 三尺寸全部精準落在 token 值、無裁切。outline 各尺寸 padding 同步去掉垂直值（`0 13/17/9px`）。icon 方鈕（36/32/28px）維持自有尺寸系統、不動。全站 25 頁的 `.btn` 經共用 `button.css` 自動吃到新高度。
  - 註：原始需求是「sm 取整數 27」，追問後改為對齊控件尺度 → sm=`--control-h-xs`(28)、預設=`--control-h-sm`(36)；`--lg` 因預設被釘死需連帶給 height，接尺度下一階 `--control-h-md`(44)。
- **Split button 併入 gallery（`design-system.html`）**：移除 §4.2 末尾獨立的「變體 · Split button」區塊（含 `<hr>`／`sub__desc`／`.demo`／自帶 code-fold），改成顯示展示 gallery 內的一張 `matrix-block` 卡——三欄對應 context（Products／Bundles／Auctions）呈現 context-aware 主鈕文字（建立商品／組合／拍賣），caret 可點開全建立類型選單。同步：compose 圖「Used by molecule」補 Split button chip、Button 段 code-fold 的 Class API 補 `.split-button` 系列列。元件 `split-button.css` 與 e-shop markup **未動**（結構本就一致）。
- **產品頁**：e-shop 的 split button 隨 `.btn` 高度變 36px（主鈕＝caret＝36 對齊、context-aware 正常）；sm 按鈕自動變 28px。無 markup 改動。
- 同步 `design-system.md`（Sizes／Class API 改記 token 驅動高度 28/36/44）。驗證：playwright 實測 DS 頁四變體×三尺寸＝28/36/44 且無裁切、split 三卡渲染、舊獨立區塊 0 殘留、e-shop（split 主鈕/caret＝36、sm＝28）與 settings（default 36／sm 28）皆無裁切；`check_ds_sync` PASS（唯一 WARN＝既存 fan-store 裸色）；`bump_ver` → `20260703c`。

## 2026-07-03 · 全域外觀鎖定＋Creator 管理擴充（A spec-derived · D107／D108／D110）

上游規格改動落地（documents/ D107 建立欄位擴充／D108 移除語言·主題·顯示模式切換／D110 修訂：顯示模式保留可切換、預設側邊欄）。

- **全域外觀（D108／D110）**：
  - **主題固定淺色**（`theme.js`）：`readStored()` 強制回 `light`、boot 直接 `apply("light")`，忽略舊儲存值與 `?theme=`；`sidebar.js` 拿掉 topbar／sidebar 兩處主題切換鈕（`data-theme-toggle`）。
  - **語言固定繁中**（`i18n.js`）：`DEFAULT_LANG` 由 `en` 改 `zh-Hant`，啟動強制 `restored='zh-Hant'` 並覆寫 localStorage；`sidebar.js` 拿掉 topbar／sidebar 兩處語言切換鈕（`.app-topbar__lang`）。英文字串保留在 DICT（移出 v1、非刪除）。
  - **顯示模式保留可切換、預設側邊欄**（D110）：`theme.js` 的 navmode `readStored` 預設由 `topbar` 改 `sidebar`；顯示模式切換鈕（`data-nav-toggle`）**保留**。
  - **settings.html 外觀**：移除 Light/Dark/System 三張主題卡、移除 Profile 的「語言偏好」欄；保留顯示模式兩卡（「預設」標註移到 sidebar）。
- **Creator 管理（D107，`creators.html`＋`sidebar.js`）**：
  - **未選 creator 時導航只留 Creator 管理**：`topbarNavHtml/sidebarNavHtml` 在 `locked` 時直接回空字串，移除原本鎖住的 Tier 1 模組列（不再顯示 lock 排）。
  - **建立表單擴充**：新增頭像（file，demo）、email（必填）、電話（選填）、店鋪網址（`ztor.com/shop/…` 即時預覽、handle 平台唯一→建立時擋重複 `setCustomValidity`）；名稱保留。
  - **名冊列**：新增「創建時間」欄（grid 5 欄，≤720px 收起該欄）；頭像欄沿用首字母。資料模型 `CREATORS` 補 `email/phone/created`；建立成功以 `new Date()` 記創建時間 append。
  - 新增 i18n keys：`creators.col-created`／`form-avatar`／`form-email(-ph)`／`form-phone(-ph)`／`form-optional`／`form-handle-dup`；`form-handle` 標籤改「店鋪網址」。
- 驗證：`check_ds_sync` 9 項 PASS（唯一 WARN＝既存 fan-store 裸色，非本輪）；`bump_ver` → `20260703a`（31 頁 732 連結）。

## 2026-07-02 · DS 優化輪收尾：fan-store 補轉／UI-CHANGES 歸檔／cache-bust 統一／icon 舊名修正（D infra）

- `fan-store.css` 補轉 `--sp-*`×48＋`--lh-*`×4（值不變驗證；先前因並行編輯跳過）。
- **UI-CHANGES 整治**：統一為新→舊排序（歷史上「頂端插入」與「尾端 append」兩慣例打架、順序已亂）；223 條 2026-06-24 以前的舊條目移至 `UI-CHANGES-archive.md`，主檔 4503→~650 行。新慣例：**新條目一律加最上方**。
- cache-bust 全站統一 `20260702o`（`bump_ver.py`，31 頁 732 連結）。
- icon 舊名修正：`check-circle-2`（Lucide 舊名、registry 無、一直空白）→ `check-circle`（settings.html＋DS readiness demo 共 2 處）。
- 驗證：check_ds_sync 9 項全 PASS（唯一 WARN 為 fan-store `--fst-*` 子主題色板，§1.5 已註記例外）；Playwright 抽查 DS 頁（矩陣/行距/間距/Pillar 2 色票）＋ orders 亮/暗 皆正常，截圖 `screenshots/ds-opt-01~05`。

## 2026-07-02 · 商店預覽改「深色手機版粉絲 app」呈現（B 反饋導入）

使用者裁示：電子商店的商店預覽（See-as-fan）改做成 endgame 原型 creator 商店頁的**手機版**樣子（https://endgame.ztor.lx7.com/creator-jay-chou.html，僅視覺方向）。三項確認＝手機外框呈現／參考頁區塊全做／商店設定 See-as-fan 一起換（§6.7 同源）：
- **fan-store 元件全面改版**（`partials/fan-store.js`＋`ds-components/fan-store.css` 重寫）：預覽面板中央一支**深色手機**（`.fan-store__phone` 外殼＋`.fan-store__screen` 560–640px 自捲動螢幕、藏捲軸），螢幕內容＝粉絲 app 商店頁——app 頂列（menu·ztor.·購物車/帳號，sticky）→ hero（名字壓深色漸層封面＋tagline＋橘點 meta＋圓形社群 YT/IG/TH/X＋橘色「加入社群」pill）→ **sticky app 分頁列**（商店 active 橘字/活動/排行榜/貼文/關於）→ 本月精選（大圖＋橘 overline＋橘框「立即購買」）→ 商品/組合/拍賣**底線式子分頁** → **雙欄商品格**（圖上、名＋價下＋橘購物車圓鈕；售完＝圖降透明＋「售完補貨中」無鈕）→ **頭號粉絲**（名次圈橫捲：#1 橘环／#2 紫／#3 綠…＋名次角標＋積分，名單沿用 Fans CRM 排行榜同批 demo 名）→ **關於**（bio＋閱讀更多）→ sticky 底部 app 導航（焦點/共創/社群/比賽/商店 active）。
- **主題例外**：手機螢幕＝粉絲 app 的**固定深色面**（不跟隨後台亮/暗主題，同 vip-card 前例）——深色中性色 scoped `--fst-*`、品牌橘沿用 `var(--primary)`；已登記 design-system.md「Raw-color exceptions」。空狀態 empty-card 於螢幕內深色覆寫。
- **兩處同源不變**：e-shop F5 與 store-settings F1 注入同一份 partial；e-shop headerless 的「商店預覽」小標改為手機上方置中 overline。商品資料仍沿用管理側同店面（zine/tee/EP/acetate＋hoodie/sticker 六卡，與 e-shop 清單一致）。
- **icons 新增**：menu／user／shopping-cart（標準 Lucide，registry 註明 fan-store 用途）；i18n 新增 `fan.nav.*`／`fan.cart`／`fan.fans.*`／`fan.about.*`／`fan.tabbar.*`（中英）。
- ⚠ 產品語意不變：app 分頁列（活動/排行榜/貼文/關於）、頭號粉絲、關於創作者、購物車、底部 app 導航＝**新增的粉絲端提案欄位**，併入 ASSUMPTIONS UIA-026（待上游核准，未寫回 documents/）。display-only、無互動邏輯。
- 動機：預覽呈現為真實粉絲手機視角，比桌面窄欄更能傳達「粉絲看到什麼」；參考頁只借版型與密度，內容仍用本店 demo 資料。

---

## 2026-07-02 · 低庫存門檻自訂 S31.1 建置，改由 cheat code「版本」切換呈現（A 規格 · D105／D infra）

使用者裁示：把原本延後的「逐商品自訂門檻」現在就做進原型，交付版本切割改由 cheat code 的「版本」開關控制呈現（不再只是 deferred 不做）。做法＝建 UI＋用 `data-feat` 版本閘，Phase 1 仍看到固定 10%、Next+／最終版才看到可編輯門檻：
- **cheat code 機制補強（infra）**：(1) `devtools.js` 解析 feature-scope-map 的 ID 正規表達式原本只吃 `[SOEB]\d{2}`，**加上可選小數點子 ID**（`(?:\.\d+)?`）才抓得到 `S31.1`——否則 `data-feat="S31.1"` 會被當 p1、每版都顯示（gate 失效）。(2) 新增**反向閘 `data-feat-off`**：功能「不」在版本內才顯示，與同位置 `data-feat` 成對，做「Phase 1 用預設呈現、Next+ 換升級版」的切換（`ztd-ver-hidden`）。首次使用。
- **建立商品**（create-product）：低庫存提醒開關下方加「自訂低庫存門檻」數值輸入格（`data-feat="S31.1"`）；Phase 1 隱藏＝只有開關＋固定 10% 說明，Next+ 顯示輸入格。**追加（使用者回饋）**：(1) 輸入格改為**只有「庫存快不夠時提醒我」開關開啟時才顯示**（JS 控 `hidden`，關閉即收起）；(2) 顯示時**預填＝庫存基準的 10%**並隨基準即時重算——限量＝總量上限（如 50→5、30→3）、不限量無硬上限→demo 用目前在庫（如 40→4，spec §7.2 待確認）；使用者手動改值後停止覆寫、清空則回自動。移除原 inline `onclick`，開關改由控制器接管（同步 `aria-checked`）。
- **商品細節頁**（product-detail）：門檻欄改**兩態成對**——base（`data-feat-off="S31.1"`）＝唯讀自動 10%＋「後續版本可自訂」提示；升級版（`data-feat="S31.1"`）＝可編輯數值＋「覆寫預設、留空則自動」提示。版本開關切換兩者。
- **feature-scope-map**：S31.1 Build ⏳ deferred → ✅ built（tier 維持 🔵 Next）；補「data-feat 標註現況」註記。i18n 新增 `cp.lowstock.custom`／`.ph`／`.hint`、`product-detail.threshold.custom.hint`（中英）。
- 動機：規格本就描述「可逐商品調整」為最終產品，原型預設（最終完整版）本應看得到；用版本閘保留 D105「Phase 1 用固定 10%」的交付切割。**未反轉 D105**（Phase 1 體驗不變）、未動 documents/。逐規格門檻粒度仍未做（spec §8 待決）。

---

## 2026-07-02 · 低庫存門檻預設改「庫存上限的 10%」＋自訂門檻延後（A 規格 · D105）

上游把低庫存門檻預設由寫死的「5 件」改為**該品項庫存上限的 10%**（限量＝Total Quantity×10%；不限量基準待確認），且「逐商品自訂門檻」的 UI **v1 不做**、記入版本切割 feature-scope-map S31.1（🔵 Next／deferred）（spec §7.2／5.1.5.1 §2.3／5.1.5.2 §4.1、D105／Plan164）。R2.1 對應：
- **建立商品**（create-product）：低庫存提醒開關由單行標題補上副說明列——「在庫存降到庫存上限的 10%（預設低庫存門檻）時提醒你」（`.control-row__sub`＋`cp.lowstock.hint`）；仍只有開關、無門檻數值輸入（對齊 S31.1「v1 無自訂門檻 UI」）。
- **商品細節頁**（product-detail）：低庫存門檻欄由可編輯 `value="5"` 改為**唯讀**（`readonly`，demo 值 4＝cap40 的 10%）＋提示「自動 · 庫存上限的 10%，逐商品自訂為後續版本功能」（`product-detail.threshold.hint`）；PRODUCT demo threshold 5→4。
- **補貨彈窗**（restock-modal + e-shop 控制器）：新增 `lowThr(cap)=ceil(cap×10%)`，示範資料每個規格/成員改帶自身 cap 並由此導門檻（tee S30→3／M·L40→4；hoodie 30–60→3–6；sticker50→5；LP150→15；poster100→10），列 meta 顯示導出值而非寫死 5；一般清單列無 cap→隱藏「· threshold N」meta（移除 `|| 5` 魔術數）。
- DS §4.62 demo 門檻 5→3/4/4＋補「threshold＝10% of cap」說明；design-system.md §4.29c、ASSUMPTIONS UIA-042、requirements-map 同步。全站資產版本 `20260702k→l`。
- 動機：門檻跟著庫存規模走比固定值更合理；自訂門檻延後讓 v1 聚焦固定預設。皆前端 demo；不限量 10% 基準、取整、門檻粒度＝上游待確認（D105 待辦）。

---

## 2026-07-02 · 補貨組合成員改「成員 tab」＋新增 2×3 矩陣示範商品（A 規格 · D106）

使用者指出 D104 把組合成員平鋪在同一份矩陣清單（不同商品跟 variant 混在一起）不對——不同商品應以 tab 分開。裁示模型：`商品 → 規格矩陣`；`組合 → 商品A(tab)/商品B(tab) → 各自規格矩陣`（spec 5.1.5.6 v1.5／D106／Plan165）：
- **只有「成員商品」用單層 tab；規格永遠是矩陣**（解 D101 曾有的「成員 tab 內再套規格 tab」兩層問題）。
- **restock-modal.js 重構**：`openProduct(groups)`＝無 tab 的規格矩陣；`openBundle(members)`＝成員 tab（重用 tabs.css `.tabs`＋`.tab-panel`），每個 tab 面板放該成員的 `.restock-lines` 矩陣；成員資料支援 `variants`（1 選項）／`matrix`（2 選項）／單品三型。單據層（方式/供應商/ETA/備註）仍在 tab 之上、整單填一次；**數量跨 tab 保留**（各成員面板都在 DOM，`.tab-panel` 切顯示）。移除 `.restock-lines__group`＝成員名的用法（成員改用 tab；group 現只用於商品內 2 選項的選項一分組）。
- **restock-modal.css**：加 `[data-restock-tabs][hidden]{display:none}`（`.tabs` 的 flex 會蓋 `[hidden]`）。
- **e-shop demo**：組合「Coastline starter pack」改混合成員＝tee（4 規格）＋hoodie（2×3 矩陣）＋sticker（單品），完整展示「成員 tab → tab 內規格矩陣（含 2 選項矩陣）」。
- **另新增 2×3 矩陣示範商品**（前一輪）：Coastline hoodie（顏色 Black/Sand × 尺寸 S/M/L＝6 格），列於 Products；補貨以選項一（顏色）分組、選項二（尺寸）為列。
- DS §4.62／design-system.md §4.29c、ASSUMPTIONS UIA-006、BUILD-SPEC、requirements-map 同步為「商品矩陣／組合成員 tab」。皆前端 demo（UIA-006/007；成員實際出貨規格口徑沿用上游待確認）。
- 微調（使用者回饋）：組合成員 tab 與上方「補貨品項」標題間距加大（restock-modal.css `[data-restock-tabs]{margin-top:14px}`，原約 4px）。

---

## 2026-07-02 · 補貨改「一張補貨單＋逐品項數量列」（A 規格 · D104，取代 D101 tab）

使用者指出 tab 模式兩個破綻：組合內含多規格成員 → 成員 tab 再套規格 tab（兩層）；一個商品規格很多 → tab 爆版面且供應商/到貨要逐面板重填。裁示改「補貨單」模型（spec 5.1.5.6 v1.4／Plan163）：
- **兩層**：
  - 單據層（`.segmented` 方式立即/計時＋供應商/預計到貨/備註，整單填一次）
  - 品項層 `.restock-lines`＝每個要補的品項一列 `.restock-line`（識別＋狀態 badge＋目前庫存/門檻＋數量輸入＋即時「→ 補後」讀數）。
- **分組攤平**：單一規格 1 列；多規格逐啟用規格列，`.restock-lines__group`＝商品名；組合逐實體成員一組，**多規格成員展開為其規格列**（直接解使用者問的巢狀情況）。demo＝Coastline starter pack 含多規格 tee（S/M/L/XL）＋單品 cap／sticker。
- **數量留空＝該品項不補**，至少一列＞0 才可送出；送出對＞0 的品項生效、細節頁逐品項 append 補貨紀錄。
- **tab 整個退場**：`restock-modal.js` 改 `openOrder`（openSingle/openVariants/openBundle 皆走它）；移除 `.restock-panel`/`.restock-identity`/`.restock-after`/`.tabs` 依賴，新增 `.restock-lines`/`.restock-line*`；DS §4.62 與 design-system.md §4.29c 改「Restock order (lines)」。
- **[hidden] 防護保留**：ETA 欄由方式切 `[hidden]`，`[data-restock-modal] .payout-field[hidden]{display:none}` 補回隱藏。
- 動機：單據層填一次貼近真實「一張補貨單多品項」，數量列把巢狀與爆量兩問題一次解決。整單單一方式、同單混合方式/部分收貨標待確認（UIA-006/007）。

---

## 2026-07-02 · 補貨再分單一規格/多規格：多規格逐規格 tab 補（A 規格 · D101）

補貨對象粒度依規格模式（spec 5.1.5.6 v1.3／5.1.5.1 v1.9，D101/Plan162）：
- **多規格商品**（5.1.5.2 §4.1 F3 路線 B）補貨＝重用 D100 的 tab 機制，`.tabs` 逐**啟用規格**各一面板分別填；e-shop 多規格列（Coastline tee，`data-variants`）kebab 加「補貨」，demo 規格 S(2 低)/M(18)/L(15)/XL(7) 合計對齊列總量 42。tab 標籤短（S/M/L/XL）、面板識別與紀錄用全名（Coastline tee — S）。
- **單一規格**維持單一面板不變；組合成員本身多規格時再逐規格填（規格層 demo 未展開，紀錄於 spec）。
- **restock-modal.js**：`openBundle`/`openVariants` 共用 `openTabbed`（tabs＝成員或規格，支援 `tab` 短標籤）；補貨紀錄逐筆帶規格名。
- **面板狀態 badge 補三態**：原僅 low/out，庫存充足的規格（如 M 18 件）也被標紅——加 `ok`＝綠色 In stock（庫存軸 §7.2），並校正組合成員 demo 資料（cap 9／LP 21／poster 12 → In stock）。
- 動機：多規格商品的庫存本來就逐規格管（§7.2 逐規格上限與在庫），補貨粒度必須跟庫存粒度一致，否則「補 20 件」不知道補到哪個規格；tab 模式與組合逐成員同構、零新元件。皆前端 demo（UIA-006/007；批次送出語意待上游）。

---

## 2026-07-02 · 補貨流程改版：入口分單一/組合、立即/計時、補貨紀錄（A 規格 · D100）

依使用者裁示改版補貨（spec 5.1.5.6 改寫、5.1.5.1 §2.3＋主規格 §7.2 同步，D100/Plan161）：
- **單一商品面板為核心**：商品列補貨鈕／商品細節頁 Restock 開單一 `.restock-panel`——商品識別（圖＋名＋目前庫存/門檻＋狀態 badge `.restock-identity`）、補貨方式、數量、補後在庫讀數（`.restock-after`＝目前剩餘＋補貨數量，即時算）。移除舊「勾選品項清單」（`.restock-items`／`.restock-item*`）。
- **組合補貨＝tabs 逐成員**：live bundle 列 kebab 加「補貨」，開 `.tabs`＋每個實體成員各一面板分別填（demo 成員 literal）。
- **立即／計時補貨**：`.segmented` 切換——`Restock now`（現貨、送出即 In stock、隱藏預計到貨與到貨確認）／`Scheduled`（送出進 Restocking、顯示「預計到貨」必填＋「到貨確認」）。
- **補貨紀錄**：商品細節頁 §2.3 新增「補貨紀錄」區（重用 `.data-list`：補貨數量／時間／供應商＋狀態 badge，最新在上）；送出即 prepend 一列（demo）。
- **重用不重造**：方式＝Segmented、成員＝Tabs、紀錄＝Data list；restock 專屬只有 `.restock-panel`／`.restock-identity`／`.restock-after`。行為集中在 `partials/restock-modal.js` 的 `createRestock()` 工廠，e-shop.html／product-detail.html 共用。
- 動機：補貨對象與方式因入口與時序不同（現貨即入庫 vs 下單待到貨），單品與組合的填寫粒度也不同；把「單品面板」做成可重用核心、組合用 tab 疊 N 份，最貼近「逐成員分別填」的心智。皆前端 demo，實際庫存/狀態重算口徑待上游 §7.2（UIA-006/007）。

---

## 2026-07-02 · 組合定價改「成員自動加總、唯讀」（C 撤除＋A 規格 / D102）

- **移除創作者定價/折扣**（撤 D088）：create-bundle 與 bundle-detail 的定價區由「固定價／% off 折扣兩模式＋輸入」改為**唯讀自動價**——組合價格＝成員價格自動加總（`bundlePriceText()`），任一成員多規格（`data-variants`）→「從 $X 起（From $X）」。成因＝成員多規格多價位、手動定價過複雜（使用者裁示）。
- **就緒去檢價**：create-bundle Create gating＝名稱＋≥2 成員（＋啟用販售排程時起訖日）；移除 priceOk／≤成員合計檢核。preview 組合價改自動值。submit 帶入自動價文字。
- **JS 清理**：移除 pGrid/fixedMode/syncDiscount/折扣雙欄連動/定價模式切換/定價輸入監聽；bundle-detail 移除定價模式切換。新增 `.cb-autoprice` 顯示。
- **i18n**：`cb.pricing`→「組合價格/Bundle price」；新增 `cb.price.auto-hint`／`cb.price.from`／`cb.price.from-suffix`（zh「 起」）。舊 `cb.price.fixed/pct/discounted/...` 保留未用。
- **規格**：5.1.5.4 v1.9（§3 去定價模式表、§4 F3 改「組合價格（自動、唯讀）」、§4 F7 特價來源失效改待確認、§5 資料、§6 去檢價）、5.1.5.9 v1.6（定價改唯讀）；decisions D102（撤 D088）、backup_plan Plan156。
- 待上游：買家結帳依所選規格的實際組合價、是否有平台層組合優惠、販售排程特價機制。皆前端 demo。

## 2026-07-02 · scope map 對源複核＋版本切換階段一標註（D infra · 使用者指示）

- **對源複核**：源頁（ztor-eshop-proto）未更新（自標 2026-06-29、位元組級相同），feature-scope-map.md 107 項 tier／build 以腳本重抽比對**零漂移**。就地更正兩處源頁筆誤並於列備註標依據：O08 代付款→待付款（規格 Unpaid）、E22 EFT→NFT（§7.3 淨利池 NFT 40%）；轉錄註記補 7/2 複核說明。
- **規格核對報告更新**（feature-scope-map-規格核對.md）：折入 6/30 後規格變動——5.1.5.6 D100 補貨改版（單一/組合入口、立即/計時、補貨紀錄）、5.1.5.2 F11 內容檔擴充（F11.1 曲目／F11.2 卡面）列入「規格有、Scope 未列」；POPCORN 複查仍零命中；記錄筆誤已修與「B 買家店面略過」決策。
- **devtools.js 版本切換機制強化**：(1) `data-feat` 支援逗號多值（外殼包多功能，任一在版本內即顯示）；(2) 作用中分頁被版本藏掉時自動 click 第一個可見兄弟 tab（`.tabs__item`／`.filter-tabs__item` 通用，觸發頁面自身切換 JS）。
- **階段一 data-feat 標註（25 個元素、17 個功能點）**：e-shop S11 拍賣整線（tab／Create auction 下拉／即時橫條／清單）；orders O04 退款 KPI＋O09 退款篩選 tab；order-detail O17 粉絲記錄／O18 退款鈕／O22 數位交付（segmented＋branch）／O23 退款爭議卡；earnings E09/E22/E23/E24 四分頁＋E22 View breakdown 捷徑＋E20 補登鈕×2（E08 前已標）；store-settings S05/S06 tab＋panel＋外殼（逗號多值示範）；product-detail S24 專案引用卡。E13–E17 r2.1 無實體可標。
- 驗證：node 模擬 25 標註 × full/p1-next/p1 三版本顯示決策全對齊 tier 表；devtools.js 語法 OK；check_ds_sync PASS（WARN 皆既有例外）。requirements-map 無需動（本輪為 dev harness 標註，非規格覆蓋變更）。未 deploy／未 collab，待使用者指示。
- **版本檔位改序號命名＋補第四檔（同日後續，使用者指示）**：開發版本由 3 檔擴為 **4 檔**、順序改 P1→P4 遞增，顯示名改「**Phase N（原 tier 命名）**」以便日後對照 source——Phase 1（Phase 1／tier:p1）／Phase 2（Phase 1 ＋ Next／p1,next）／Phase 3（Phase 1 ＋ Next ＋ TBD／p1,next,tbd，**新增檔位**）／Phase 4（最終完整版／`all`，鍵仍 `full`、預設）。鍵未動（URL/LS 相容）。Phase 3 與 4 對已標 data-feat 的 eShop 元素畫面相同（差異只在 eShop 外模組日後納入切割）。node 驗四檔顯示決策對齊 tier 表。

## 2026-07-02 · 組合折扣補回：自動 base ＋ 折扣 %（A 規格 / D103 修訂 D102）

- 依使用者「折扣功能要加上去」：在自動加總 base（唯讀）上補回**單一「折扣 %」欄（選填 0–100）**；粉絲付＝base×(1−折扣%)。**不恢復固定價/絕對折後價**（變體多價位下語意不明）。
- create-bundle／bundle-detail：base 顯示改「有折扣時大字＝折後價＋旁邊劃掉 base（`.cb-basestrike`）＋『−N%·省 $Z』」；多規格「從 $Y 起」。create-bundle gating 加「折扣填了須 0–100」（`discOk`）；bundle-detail 折後即時計算（base 靜態 demo）。
- i18n：新增 `cb.price.discount`／`cb.price.discount-hint`／`cb.price.discount-bad`。
- 規格：5.1.5.4 v2.0（§4 F3「組合價格與折扣」、§3/§5/§6 同步）、5.1.5.9 v1.7；decisions D103（修訂 D102）、backup_plan Plan157。
- 皆前端 demo；結帳依所選規格實際計價、平台層優惠仍待上游。

## 2026-07-02 · 商品細節頁卡片重分：價格·庫存移出「商品內容」→ 獨立「Price & stock」卡（A 規格 / D109）

- 依使用者裁示：商品細節頁（product-detail.html）「Product content」卡不該含 價格／庫存／低庫存門檻，這些屬銷售設定、應獨立成「價格與庫存」。對齊建立商品（5.1.5.2）分組——F2 商品資訊只放內容、F3·F5 才是價格與庫存。
- **卡片重分為三張**（原型；對齊 spec 5.1.5.1 §2.3–§2.5）：
  - **Product content（§2.3）**：只留 圖片素材／標題／主·次分類／描述／詳細規格（實體）／內容檔案（數位）。移除原本嵌在其中的 價格·庫存·低庫存門檻 3 欄格。
  - **Price & stock（§2.4，新增卡 `#pd-pricestock`）**：價格·庫存·低庫存門檻 3 欄格（自 content 卡移入）＋庫存版本 Edition（自舊 settings 卡移入）＋補貨紀錄 Restock history（自舊 settings 卡移入）。
  - **Delivery & buyer settings（§2.5，原 `#pd-settings` 更名，原 en「Inventory, delivery & buyer settings」→「Delivery & buyer settings」、zh「庫存、取貨與購買設定」→「取貨與購買設定」）**：取貨方式／數位交付／每人限購／商品標籤。Edition 與 Restock 已移出。
- **JS**：settings 控制器 `applyVis()` 的 `[data-when-edition]` 查詢由 `#pd-settings` 卡範圍改 `document` 範圍（Edition 子欄位已移出該卡）；`#pd-edition` 以 `getElementById` 全域取用、不受影響；restock log／`data-pd-cat` 本就全域查詢。限量子欄位（Total quantity／Goods in stock）toggle 驗證正常。
- **i18n**：新增 `product-detail.price.title`（Price & stock／價格與庫存）、`product-detail.price.sub`；改 `product-detail.inv.title`（→ Delivery & buyer settings／取貨與購買設定）。i18n.js cache-buster 全站 `20260702l`→`20260702m`（30 頁）。
- **規格**：5.1.5.1 v1.12（§2.3 拆三塊、原 §2.4/§2.5 後移 §2.6/§2.7）＋0-設計規格書三處 §編號同步；decisions D109、backup_plan Plan168。
- 皆前端 demo。check_ds_sync PASS（WARN 皆既有例外）。未 deploy／未 collab，待使用者指示。

## 2026-07-02 · 間距 token 化 --sp-*（px 直命名）＋行距第 7 階 --lh-comfy，全元件層收斂（D infra · 使用者指示）

- 範圍：`ds-components/_tokens.css`、61 支元件 CSS + `shared.css`（`fan-store.css` 因並行編輯跳過、待補）、`design-system.html`／`.md` §1.2／§1.3／§2.3。
- **間距**：新建 `--sp-*` px 直命名刻度 20 階（`2…96`，數字＝px、與 `--fs-14` 同邏輯；取自全庫實值直方圖）。轉換腳本把 645+ 處 `gap`/`padding`/`margin` 字面 px 換成 `var(--sp-N)`，**逐檔「值不變」可逆驗證通過（零渲染變化）**。保留字面值：奇數微調（1/3/5/7/9/11/13px）、刻度外 22/26px、負值、`calc()`。舊 `--space-1…16`（4 倍數制、從未採用）退役移除；`--space-shell-gutter` 保留。
- **行距**：`--lh-*` 加第 7 階 `--lh-comfy 1.4`；元件層 70 處硬寫行距全轉 token——53 處值完全不變、17 處 ±0.05（1.35/1.45→1.4、1.05→1.1、1.15/1.25→1.2）。
- **check_ds_sync 同輪升級**（Skills 端）：新增檢查 9「md↔html 同步」（Pillar 1/2 小節編號對齊＋`_tokens.css` 每個 token 兩份文件都要文件化，萬用 `--x-*` 可涵蓋；揭露行「待採用/退役」計入文件化但不算宣稱使用）；並修齊 md 22 個 shadcn 對齊 token 的文件缺口（標「待採用」）。另新增 `bump_ver.py`（全站 cache-bust 一鍵統一，dry-run 驗證 20260702o/732 連結）。
- 驗證：check_ds_sync 檢查 1–4、6–9 全 PASS；唯一 WARN 為 fan-store.css 裸色（並行編輯中、歸該線收尾）。cache-bust 待發版前統一 bump（頁面屬並行線工作區、暫不touching）。
- 附帶修正：`--highlight` 虛構 token（KPI 「orange tint」說法）3 處移除——kpi.css 從無此 token，headline 靠 display 字級突顯。

## 2026-07-02 · design-system.html 抽 class 減量＋icons 雙檔架構文件化（D infra · 使用者指示）

- **抽 class**：1.2.2 三張字體矩陣（15 th＋24 列＋96 格）、1.2.3 行距樣本（7 格）、2.2 role 渲染列（10）、2.4 控件列（5）的重複 inline style 全抽成 DS 頁 `<style>` 類別（`.tm`／`.tm--body`／`.role-row`／`.ctl-row`／`.lh-sample`；矩陣列只帶 `--tm-fs` 一個變數，字重走 `nth-child`）。樣式值一比一對應、零視覺變化；檔案省 ~27KB。
- **icons 盤點結論：icons.js 與 icons-all.js 是刻意分工、不合併**——`icons.js`（27KB/89 顆策展）30 個產品頁用；`icons-all.js`（365KB/1713 顆全集）只有 DS 頁載（icon 總覽），`icons.js` 啟動時把缺的 key 併入。接線驗證正確（DS 頁 all 在前）。design-system.md §1.7 補記此架構與「勿合併」警告。
- 驗證：check_ds_sync 9 項僅剩 fan-store.css 裸色 WARN（並行線檔）；殘留矩陣長 inline style＝0。

## 2026-07-01 · E-Shop 草稿列行為細化（B 反饋 · 使用者裁示 · UIA-038）

草稿（`data-status="draft"`）在商品列表的行為，依使用者兩次裁示調整：
- **置頂**：載入時 `pinDrafts()` 把草稿列移到清單最前，優先讓創作者補齊。
- **不可拖曳**：草稿無粉絲端陳列順序（拖曳＝粉絲陳列順序 D083），握把隱藏（`product-list.css` 的 `[data-status="draft"] .product-list__drag { visibility:hidden; pointer-events:none }`）＋`pointerdown` 對草稿 return；且 `follow()` 只把非草稿列當讓位對象，別的列拖不到草稿上方。
- **kebab 選單改組**：**移除「在商店上架」開關**（草稿未備齊、不提供直接上架）＋**新增「刪除」破壞性項**（紅字，promote 成 `dropdown-menu.css` 的 `.dropdown__item--danger`＝紅字 ghost）。狀態徽章維持「草稿（Draft，`badge--neutral`）」。刪除為 demo（`data-eshop-delete` 直接移除列＋重算分批/狀態計數），完整 destructive 樣式與確認流程待規格。
- i18n 新增 `e-shop.delete`（Delete／刪除）。DS：dropdown demo 加 `--danger` 刪除項、product-list drag State 表加草稿 non-draggable 列；design-system.md 同步。
- 驗證：check_ds_sync PASS；Playwright——草稿在 index 0、握把隱藏不可拖、別的列拖到頂草稿仍第一、選單＝編輯＋刪除（無上架開關）、刪除紅字 #DA314A、點刪除列數 30→29 草稿移除、狀態 草稿。

**2026-07-01 追加（同輪 B 反饋，UIA-038/039）**
- **草稿「編輯」→ 建立流程頁**：草稿＝未完成的建立，編輯＝回到建立精靈。Products 草稿 Edit `product-detail`→`create-product`、Bundles `bundle-detail`→`create-bundle`、Auctions 本就 `create-auction`；三類一致（非草稿列 Edit 仍進細節頁）。
- **上架/下架狀態文案**：商店上架→狀態「上架中」、商店下架→狀態「已下架」。i18n 顯示層——`e-shop.row.active`＋`e-shop.status.in` zh「已上架」→「上架中」（對齊 product-detail 既有）、`e-shop.row.hidden`「Hidden／已隱藏」→「Unlisted／已下架」。內部 `data-status`（§7.2）不變，僅列上顯示字；三類 Live 徽章與 Live 篩選 tab 共用鍵一併生效。

---

## 2026-07-01 · E-Shop 產品頁 DS drift 稽核收斂（D infra · 多代理稽核 13 項 findings）

對 e-shop 產品頁叢集（e-shop / product-detail / create-product / create-bundle）做「有設計、沒同步進 DS」稽核，收斂 13 項 drift（0 高/9 中/4 低）。無產品行為變更、純呈現層收斂與 DS 文件對齊：

**收斂重造的元件（改用既有元件，刪頁面內重寫）**
- `e-shop.html`：`.eshop-list-foot`/`__cap` → 改用 `list-footer`（`--center` 新變體，載完 end-cap）；連 `list-footer.css`、刪頁面 `<style>` 3 條。
- `product-detail.html`：`.pd-switch-row` → `control-row`；`.pd-two-col`/`.pd-three-col` → `form-grid`/`--3`；`kpi` 側欄 inline 尺寸 → `kpi--compact`。連 control-row/form-grid.css、刪頁面 CSS。

**promote 頁面內可重用 pattern 進元件層（＋DS demo＋md）**
- 收合式工具列搜尋 → 新 `ds-components/search-collapse.css`（`.search-collapse`，內層重用 field-pill）＋DS §4.28b demo＋TOC。
- 拖曳握把 `.product-list__drag`＋抬起態 `.is-dragging` → 併入 `product-list.css`＋DS 加 `--eshop` 拖曳 demo＋State 表。
- 選單開關列 `.dropdown__item--toggle` → `dropdown-menu.css` modifier＋DS kebab demo 加 toggle 列。
- 就緒 footer chip `.cp-ready-chip`/`--ready`/`.cp-ready-pop` → `readiness.css`（`__chip`/`__pop`）＋DS demo；create-product 改用（create-campaign 有自身 pill 變體、暫留待後續收斂）。
- 行內標題標籤 → `badge--inline` modifier（e-shop ×2／order-detail ×1，統一左間距 6px）＋DS badge 表加變體。
- 必填星號 inline `color:var(--error,#c00)`（26 處／7 檔）→ `field__req`（`field-system.css`，改用 `--destructive` token，去裸 hex）。

**DS 文件修正**
- Preview panel §4.56 註解由錯誤的「常駐、不可關閉」改為「可開關、預設關閉、headerless」（對齊 D084／實際 JS）。
- KPI md「Single variant」改列 `--compact`；product-list md/demo 補 `--eshop`／拖曳握把（原缺）。
- 接縫陰影 `.eshop-seam-shadow`／補角 `.eshop-corner-mask`＝shell 版式膠水，暫留頁面但於 design-system.md 註記為與 `.edge-shadow` 同族的頁級技法；修 corner-mask anti-alias fork（`-0.5px`→`-1px`，對齊 DS 的 `.alert--page-top::after`）。

cache：`shared.css` 的 5 個 @import 版本由長期停滯的 `20260626j` 一併校正到 `20260701d`（field-system.css 改了 `.field__req` 必須 bump 才生效）；全站 HTML 版本統一 `20260701d`。驗證：check_ds_sync PASS（65 元件全連入／版本一致／97 TOC 解析；WARN 僅既有 selection-card 例外＋`--space-1` 死 token）；Playwright——search 收合展開、list-footer 置中、拖曳握把 grab、dropdown toggle space-between、badge--inline、control-row 外框、form-grid 三欄、kpi--compact 無 min-height、field__req 紅（#DA314A）皆正確、0 runtime error。

**未動（判為合理單頁膠水／out of scope）**：create-bundle 的 `.cb-add-tile`/`.cb-summary`/`.cb-price-input`/`.cb-sublabel`/`.cb-no-result` 為單頁 Create bundle 專屬組合，無跨頁 consumer，留頁面層；create-campaign 的 `.cp-ready-chip`（自身 pill 視覺、與 create-product 不同）待後續與 readiness__chip 收斂。

---

## 2026-07-01 · 全建立頁上緣留白加大對齊募資測試頁（B 反饋）

使用者反饋：所有建立頁的內容上緣 padding 太緊，要加大到跟「募資創建（測試版）」`create-campaign.html`（已調成 `.wizard__body` `padding-top:44px`）一樣。

- **改動**：6 個建立頁的 `.wizard__body` `padding-top` 由 **16px → 44px**——`create-product`／`create-auction`／`create-bundle`／`create-project`／`register-ip`（原各自 override 16px），`create-event`（原無 override、吃 shared 40px，補一條 44px override）。
- 純呈現、只動各頁 inline `<style>` 的上緣留白；未動 `shared.css` 的 `.wizard__body` 預設（40px，其他 wizard 沿用）、未動 max-width、未碰產品規則。
- 驗證：http 開 create-product，上緣留白明顯放寬、與 create-campaign 一致；0 JS error（僅 favicon）。截圖 `screenshots/create-pages-upper-padding-44px-20260701.png`。無版本 bump（僅 inline style）。

---

## 2026-07-01 · 建立商品「Show it off」互動上傳格（A 呈現／含產品變更提案）

- **Promote 互動上傳為 DS 元件**：`ds-components/upload-tile.css` 加互動狀態（scoped `[data-upload]`，不動舊 `.is-filled` 綠框，其他頁不受影響）＋新 `partials/upload-tile.js` 增強器。狀態流：空 → 點擊開檔案選取 → 選到圖（`createObjectURL` 縮圖）→ 上傳中（frosted 罩 spinner＋底部進度條，假走 ~2.5s）→ 已上傳 → hover 出 替換／AI 優化／刪除 → AI 優化（優化中 ~1.2s → 「已依規格優化」徽章）。空狀態 hover 顯示更多資訊（`__sub`/`__hint` 淡入、無版面跳動）。
- **create-product**：Show it off 的 10 個圖片格（p-hero＋4 p-gallery＋d-cover＋4 d-gallery）加 `[data-upload]`、載入 partial；就緒檢查改監聽 `upload:change`（同 key 多格取任一已上傳）；數位內容檔 `d-file` 維持原簡易 toggle。
- **icons**：新增 `sparkles`（AI 優化）、`refresh-cw`（替換）；`image`/`trash-2` 沿用。**i18n**：新增 `cp.media.uploading/optimizing/optimized/replace/optimize/remove`。
- **DS 同步**：design-system.html 4.15 Upload tile 加互動 live demo（點擊可試）＋狀態表＋AI 優化提案註記＋載入 partial；design-system.md class API／token／registry 同步。全 CSS token 驅動（罩用 `color-mix(--foreground/--card)` 主題自適應），check_ds_sync PASS。
- **產品變更提案（ASSUMPTIONS UIA-037）**：**AI 優化＝把圖轉成「制式規格」上游無此功能**（媒體規格目前僅尺寸下限）；按鈕為假動作、不真處理，制式規格定義／是否為平台功能／可否還原待上游核准，未寫回 documents。
- 皆前端 demo，無真實上傳／持久化。

## 2026-07-01 · 數位商品「音樂專輯（Album）」多曲目管理器（A 規格）

- **規格先行（documents/5.1.5.2 v5.3）**：F11 內容檔音樂類拆單曲／專輯，新增子塊 F11.1「專輯曲目管理」——逐曲：曲目檔案（音訊/影片，含上傳中狀態）／曲目封面／曲名（可改）／檔案資訊／順序（拖曳）／歌詞（音訊限定）；逐曲操作＝改名/換封面/上傳歌詞/刪除。§7.4 同步；backup_plan Plan154；validate_spec PASS。
- **新 DS 元件 `album-tracks`**：`ds-components/album-tracks.css`＋`partials/album-tracks.js`。上傳區（Upload File *，建議 mp3/mp4）＋曲目列（拖曳把手/封面/曲名+meta/View Lyrics/⋯ 選單）。逐列 ⋯ 選單重用 `dropdown-menu.css`（改名 inline／更換封面／上傳歌詞〔音訊限定〕／刪除紅字）。上傳中列＝type icon＋「檔名 上傳中…」＋不定進度條、無把手。emit `albumtracks:change` 供就緒。
- **接進 create-product**：數位分類選 Album → F11 顯示曲目管理器、隱藏單檔格（`updateCfile()`）；就緒 `d-file` 改吃曲目數>0。載入 dropdown-menu.css/album-tracks.css/js。
- **i18n**：新增 `cp.album.*`（upload／upload-hint／uploadingword／justnow／viewlyrics／track.rename/cover/lyrics/delete/actions）。icons 沿用既有（grip-vertical/more-vertical/music/video/image/pencil/upload/trash-2/file-text）。
- **DS 同步**：design-system.html 4.78 Album tracks live demo（可點試）＋TOC＋registry＋head link/partial；design-system.md registry 條目。
- **產品待確認（規格內標記，未寫成正式規則）**：至少一曲、封面必填、歌詞格式、檔案大小上限、試聽、影片曲目歸屬。皆前端 demo（假上傳/歌詞/封面）。
- 依據：使用者指示＋Figma Beamco Artist Portal v2 node 14192-34712。

## 2026-07-01 · 補接 search-collapse 進 DS（D infra，非本人功能）

- 背景：另一 session 已把電子商店 F3 收合式搜尋 promote 成 `ds-components/search-collapse.css`（未追蹤）並在 `e-shop.html` 使用，但未接進 design-system.html，導致 check_ds_sync FAIL（缺 link／缺 demo／頁面有 DS 無）。
- 處置（additive，不 revert/刪除他人改動）：design-system.html 補 head link＋TOC＋registry＋4.79 Search collapse demo（收合／展開兩態，內層重用 field-pill）；design-system.md 補條目。check_ds_sync 回 PASS。
- 未動 e-shop.html；`search-collapse.css` 仍未追蹤——正式 commit 前需 `git add` 納入追蹤，否則線上會缺檔（見回報）。

## 2026-07-01 · 數位會員卡「卡面自訂器」vip-card（A 規格）

- **規格先行（documents/5.1.5.2 v5.4）**：F11 會員卡由「上傳整張卡面圖」改為卡面自訂器，新增子塊 F11.2「會員卡卡面自訂」——平台公版＋Text/Image 模式（Text＝卡片名稱文字、Image＝上傳 PNG logo 約 127×33px 透明底）→ 合成到公版＋即時預覽（Preview Your Card，固定副標 OFFICIAL MEMBERSHIP）。§7.4 同步、backup_plan Plan155、validate_spec PASS。
- **新 DS 元件 `vip-card`**：`ds-components/vip-card.css`＋`partials/vip-card.js`。`.vip-card`＞`__settings`（`.segmented.radio-cards` Text/Image＋`.input`名稱／`.upload-tile` logo）＋`__preview`（`__frame` 全像場景＞`__plate` 霧面卡＞`__logo`/`__logo-img`/`__plate-sub`）。模式 class `.vip-card--image`；emit `vipcard:change`。重用 radio-cards/input/upload-tile。
- **接進 create-product**：內容檔改三態——會員卡→vip-card、專輯→album-tracks、其他→單檔格（`updateCfile()`）；就緒 d-file 改吃「名稱有字 或 已傳 logo」。
- **i18n**：新增 `cp.vip.*`（title/sub/text/image/name/name.ph/uploadlogo/uploadfile/logohint/preview）。
- **DS 同步**：design-system.html 4.80 VIP card live demo＋TOC＋registry＋head link/partial；design-system.md registry 條目。
- **裸色例外（記錄在案）**：`vip-card.css` 公版全像漸層＋玻璃卡白字/rgba＝固定藝術（theme-independent），已在 design-system.md「Raw-color exceptions」列明；check_ds_sync PASS（WARN 已註記）。
- **公版為 CSS 近似**、實際卡面素材與合成輸出待提供；**產品待確認**：多公版、名稱字數上限、logo 硬限制/去背、副標可編輯（D071 權益/存取仍擱置）。皆前端 demo。

## 2026-07-01 · 內容檔（音樂/影片）互動上傳＋播放/刪除（A 呈現）

- **`upload-tile` 加內容檔模式 `data-upload="content"`**：單檔內容格由「點一下切 is-filled」升級為互動格（比照 Show it off 圖片上傳）——點擊選檔→假進度→已上傳→hover 動作。**音訊/影片可即時預覽播放**（真實 `<audio>`/`<video>` 播所選檔）＋替換＋刪除，**無 AI 優化**。影片顯示影格（`.upload-tile__video`）、音訊/檔案顯示檔型圖示＋檔名（`.upload-tile__filemark`/`__filename`）；`.upload-tile--playable` 才顯示播放鈕；新增 `.upload-tile__act--play`（play/pause 切換）。
- **create-product**：內容檔單檔格加 `data-upload="content"`；`accept` 隨分類（音樂→`audio/*`、影視→`video/*`、其他→任意）由 `updateCfile()` 設 `data-upload-accept`；就緒沿用 `upload:change`。
- **i18n**：新增 `cp.cfile.play/replace/remove`。icons `play`/`pause`/`file`/`music`/`video` 皆既有。
- **DS**：upload-tile demo 加「內容檔模式」可試用區＋說明；design-system.md Class API 補 `[data-upload="content"]` 條目。
- **規格**：documents/5.1.5.2 F11 補一句「音訊/影片內容檔上傳後可即時預覽播放與移除（呈現參考·非約束）」；ASSUMPTIONS UIA-041。
- 顯示圖模式（Show it off）行為不變（仍 AI/替換/刪除、無 play），已回歸驗證。皆前端 demo（`createObjectURL` 本機預覽，不真上傳）。

## 2026-06-30 · Creator 管理頁移除 bento 概覽＋搜尋/篩選改同列（B 反饋 · A 規格 D099）

延續同日 creators 改版，使用者裁示再調整：拿掉名冊概覽（bento）、狀態篩選與搜尋改放同一列。

**B 反饋（呈現，creators.html）**
- **移除 bento 概覽**：拿掉「總數/啟用中/已停用」三張 kpi tile（F2 概覽整塊移除）；各狀態數量改只由 filter-tabs 的 count 承載。移除 `kpi.css`／`bento.css` 連結與 i18n `creators.metric-total`。
- **搜尋/篩選同列**：原本搜尋一列、filter-tabs 另一列 → 併成單列 flex（**篩選左、搜尋右**，`justify-content:space-between`，搜尋 `flex:0 1 320px`）。

**A 規格（D099，先改 documents/）**
- 5.1.0 移除 F2 名冊概覽，F 重編號為 F1 頁首／F2 名冊工作列（搜尋＋篩選＋建立）／F3 Creator 名冊／F4 進入返回；頁面佈局/狀態/情境 F 引用同步；備份 Plan153。部分撤銷 D098。

**D infra**
- cache：改動 i18n.js → 全站版本 bump `20260630b`→`20260630c`。

驗證：http 0 JS error；無 bento、篩選左+搜尋右同列、清單表頭與互動正常；截圖 `screenshots/creators-10-*-20260630.png`；check_ds_sync PASS、validate_spec OK。

---

## 2026-06-30 · Creator 管理頁對齊電子商店元件：bento 概覽、前往(Enter)、field-pill/filter-tabs/product-list ＋ 規格 F 重編號（B 反饋 · A 規格 D098 · D infra）

延續同日 creators 改版，使用者再反饋四項：摘要改 bento、管理鈕改「前往」、搜尋/篩選/列表改用電子商店同款元件、規格 F 項照電子商店分類重編號。

**B 反饋（呈現，creators.html）**
- **摘要列改 bento**：「N 位·X 啟用中·Y 已停用」文字行 → bento 12 欄格＋三張 `.kpi.bento--span-4`（總數/啟用中/已停用），與 Dashboard KPI 同元件。
- **管理 → 前往**：列主按鈕 i18n `creators.manage` 改 en `Enter`／zh `前往`。
- **搜尋改 field-pill**：原 `.creators-search`＋`.input` → e-shop 同款 `field-pill`（放大鏡 icon＋輸入）。
- **狀態篩選改 filter-tabs**：原 native `<select>` → e-shop 同款 `filter-tabs filter-tabs--brand`（全部/啟用中/已停用 淡橘 pill＋每項數量，隨名冊即時重算）。
- **列表改 product-list**：原 `data-list` → e-shop 同款 `product-list` 列骨架（retarget 欄位 avatar／名稱+識別／狀態／列操作）；停用列淡化、整列可點維持。依使用者再指定，補上 `product-list__head` **欄位表頭**（Creator／狀態，欄寬固定 `52px / 1fr / 104px / 140px` 讓表頭與列對齊）；creators 無分類/價格/庫存與拖曳重排，故省略 e-shop 的那幾欄與 drag handle。再依使用者指定**移除工作列/清單最外層 `.card` 包裹**（e-shop 清單本就不包卡片，改用 `eshop-list-controls`＋`product-list` 兩 section 直接落頁），creators 同步拿掉 `.card` 與 card.css 連結；bento 概覽 tile（kpi）保留。

**A 規格（D098，先改 documents/）**
- 5.1.0 F 項照 5.1.5 電子商店「頁首/概覽/工作列/清單」分類重編號：F1 頁首／F2 名冊概覽（bento）／F3 名冊工作列（搜尋＋篩選＋建立）／F4 Creator 名冊（列＋列操作 前往/停用/啟用）／F5 進入與返回。原 F2 建立併入 F3、原 F4 停用啟用與進入入口收為 F4 列操作（比照 e-shop 列操作含於清單 F）。頁面佈局/狀態/情境 F 引用同步；備份 Plan152。

**D infra**
- creators.html 連入 `kpi.css`／`bento.css`／`field-pill.css`／`filter-tabs.css`／`product-list.css`，移除 `data-list.css`；新增 i18n `creators.metric-total`。
- cache：改動 i18n.js → 全站版本 bump `20260630a`→`20260630b`。

驗證：http 實測 0 JS error；bento 三 tile（3/2/1）、filter-tabs 點「已停用」只剩 KMT、前往按鈕、中文齊全；截圖 `screenshots/creators-06/07-*-20260630.png`；check_ds_sync PASS、validate_spec OK。

---

## 2026-06-30 · Creator 管理頁：狀態定案兩值＋停用/啟用、建立改 popup、搜尋/篩選/摘要/整列可點（A 規格 D097 · B 反饋 · D infra）

使用者檢視 creators.html 後反饋三事：建立要 popup、要停用按鈕、`已發布／草稿`看不懂。查證後確認 `draft／published` 是建站自塞、無上游依據（D086 待確認 #4 狀態枚舉一直未定），先回上游定案再改站台。

**A 規格（D097，先改 documents/ 再改 site）**
- creator 狀態枚舉定為兩值 **啟用中（Active）／已停用（Disabled）**，撤除無依據的已發布／草稿；spec 5.1.0 F1 寫實、新增 F4「停用／啟用 Creator」、關閉 D086 待確認 #4（備份 Plan151）。

**B 反饋（呈現）**
- **建立改 popup**：inline 展開表單 → modal 彈窗，重用 canonical 對話框外殼 `.payout-modal`／`.payout-dialog`（比照 message-modal），含關閉 ✕／Esc／點遮罩關閉、開啟自動聚焦 name。
- **停用／啟用**：列尾新增 ⋯ 溢出選單（`dropdown`），啟用中顯「停用」、已停用顯「啟用」，in-memory 切換即時重繪；已停用列 `badge--neutral`＋淡化。**已停用仍可 Manage 進入代操**（spec F4 待確認，本輪 demo 不閘控，記 UIA-036）。
- **搜尋／篩選**：toolbar 加名稱／識別搜尋＋狀態 All／Active／Disabled 篩選（僅影響檢視，補建站漏的 F1 既有要求）；無符合顯卡內提示。
- **名冊摘要列**：「共 N 位 · X 啟用中 · Y 已停用」，i18nT 組字＋掛 `i18n:applied` 切語言重譯。
- **整列可點**進管理（管理鈕／⋯選單 stopPropagation）。

**D infra**
- 新 i18n 詞條（status-active／disabled、search-ph、filter-*、summary-unit、row-actions、action-disable／enable、create-close、empty-filter），移除 status-published／draft。
- icons.js 核心 registry 補 `more-horizontal`（⋯）。
- sidebar.js demo roster 狀態改 active／active／disabled。
- creators.html 新連入 `dropdown-menu.css`、`payout-modal.css`。
- cache：改動共用 i18n.js／sidebar.js／icons.js → 全站版本統一 bump `20260629o`→`20260630a`。

驗證：http 起本機站，截圖 light（roster／popup／⋯選單／停用後／中文）存 `screenshots/creators-0x-*-20260630.png`；console 0 JS error（僅 favicon 404）；切中文 0 raw key、摘要即時重譯；check_ds_sync PASS（版本一致、元件齊、TOC），WARN 僅既有 selection-card 裸色。

---

## 2026-06-30 · 行距收成第 4 個原始字型維度 `--lh-*`，Pillar 2 字體 role 矩陣化（D infra · 使用者指示）

- 範圍：`ds-components/_tokens.css`、`design-system.html`（Pillar 1 · 1.2／Pillar 2 · Role）、`design-system.md`（§1.2／§2.3）。
- Pillar 1：新增具名行距刻度 `--lh-*`（6 階 unitless，命名對齊 shadcn/Tailwind `leading-*`、數值調得更緊）：`none 1 · tight 1.1 · snug 1.2 · normal 1.3 · relaxed 1.5 · loose 1.6`。design-system.html 加 1.2.3 行距刻度展示卡（每階附 15px 樣本）。
- 各 `--type-*-line-height` 改為引用 `--lh-*`（如 `--type-body-14-line-height: var(--lh-relaxed)`）。原散落 8 值收進 6 階：3 個標題 1.05→1.1（單行幾無差異）、`label-14` 1.25→1.2；內文 1.5/1.6、caption 1.3 完全保留。
- Pillar 2：把「Typography usage roles」表升級為**標準矩陣**——每 role 一列含 字體·字級·字重·**行距**·字距，行距欄綁 `--lh-*`。design-system.md §2.3 同步同一矩陣。
- 緣由：使用者指出 DS 文件 Pillar 1 的字體只露 字體×字級×字重、沒有行距維度；要求補齊行距並把 Pillar 2 行距「當成用途」矩陣成標準。
- 未動：元件層約 12 種硬寫 `line-height`（含 1.35/1.4/1.45）尚未走 token，列後續清理、不在本次範圍（已於 design-system.md §1.2 註記）。
- 驗證：check_ds_sync PASS（唯一 WARN 為既有 selection-card 主題縮圖裸色例外）。

## 2026-06-30 · Pillar 2 角色重整成六大渲染分類 + 間距虛構 token 修正（D infra · 使用者指示）

- 範圍：`design-system.html`（Pillar 2 整段、Pillar 1 §1.3）、`design-system.md`（§1.3、§2 整段）。緊接同日「行距 `--lh-*`」變更。
- **Pillar 2 重整為六類，每類即時渲染**：2.1 顏色（色票分組：基礎面/文字/主色與邊/狀態/圖表，**只放亮色**）· 2.2 字體（字體家族表＋每個 role 用自身 token 渲染的真樣字＋標準矩陣）· 2.3 間距 · 2.4 控件尺寸（每階擺真 `.btn`＋`.input`）· 2.5 陰影（hairline/micro/card/popover 陰影方塊）· 2.6 跨元件規則（Focus 環、Surface 分層對比、Primary 保留，各附 live 示例）。
- **亮/暗歸位**：Pillar 2 只呈現亮色（角色預設），深色維持在 Pillar 3（§3.1 已有亮↔暗渲染對照）。修正先前「Pillar 2 每格亮暗兩塊」的提案——使用者指出白天黑夜應由 Pillar 3 區分，正確。
- **間距虛構 token 修正（查證後）**：全庫實測 `--gap-tight/default/section/page` **根本不存在**（md §2.2 舊敘述虛構），已移除；`--space-1…16` primitive 已定義但幾乎未採用（僅 `--space-shell-gutter`）、且純 4 倍數缺真實常用的 6/10/14/18。改為誠實標註：間距無語意 role 層、以 ~443 處硬寫 px 為主，密集刻度 `2 4 6 8 10 12 14 16 18 20 24 32 48 64 80`；Pillar 1 §1.3 同步補 2/18/20 與 `--space-*` 現況註記。全面 token 化列後續清理。
- 緣由：使用者要求 Pillar 2 比照 Pillar 1「每項都渲染」、按顏色/尺寸/字體/間距/陰影分類，並把無法歸類者給建議（→ 收斂成 2.6 跨元件規則）；且要求先查證間距實況再修正 DS。
- 驗證：check_ds_sync PASS（唯一 WARN 為既有 selection-card 主題縮圖裸色例外）；TOC 95 錨點全解析；viz helper 與 `.btn`/`.input` 類別均存在且已連入，渲染可成像。

## 2026-06-30 · cheat code 新增「版本」切換（最高級別 gate，讀 md 配置）（D infra · 使用者指示）

- 範圍：`js/devtools.js`（cheat code 面板）、`feature-scope-map.md`（新增「## 開發版本配置」表）、示範標註 `earnings.html`（E08）＋`e-shop.html`（S11 Auctions 分頁）。
- 目的：在 cheat code（Alt＋右鍵）加一個「版本 · Build version」組，當原型「功能存不存在」這條軸的最高級別 gate——選某版本即隱藏/標記不屬於該版本的功能，連帶其下控制項一併失效。與外觀軸（主題/語言/版面）正交、不互相取代。
- 機制（一份 md 當單一真相）：devtools.js 載入時 `fetch('feature-scope-map.md')`，解析「## 開發版本配置」表得版本清單＋規則、解析各 pillar 功能表的 🟢/🔵/⚪ 得「功能→tier」對照。fetch 失敗（file://）用內建後備清單。改 md、重整頁面即重新配置，不必動程式。
- 規則語法：`all`｜`tier:p1,next`（只顯示這些 tier）｜`feat:ID`／`-feat:ID`（加/排）｜`page:原頁=變體`（特殊版換頁）。元素標 `data-feat="S30"` 才會被控制。
- 版本外功能呈現：預設「直接消失」（`.ztd-ver-hidden` display:none）；副開關「顯示未來功能」切成「淡色標記」（`.ztd-ver-future` opacity＋dashed outline）。兩種用途都顧（demo 真貌 vs 對照路線圖）。
- 狀態併入 devstate：`version`（預設 `full`）＋`showFuture`，同步 localStorage＋URL（`?version=p1&future=1`，可分享版本視角），emit 寫 `<html data-version>`。Reset 還原 full。
- 初始版本：最終完整版（full，預設＝現開發目標）／Phase 1＋Next／Phase 1／測試版（特殊，e-shop 換 e-shop-test.html，換頁行為製作時再定）。
- 階段：本輪只做「開關＋讀 md 機制＋2 個示範標註」；107 項逐元素標 `data-feat` 為後續階段一（整模組入口優先）。樣式自包含於 devtools.js（cheat code 工具、非產品元件），不進 ds-components / design-system.html。
- 驗證（node 餵真實 md）：版本清單 4 筆解析正確、107 個功能 tier 全解析；版本判定正確——full 全顯示、p1-next 藏 tbd、p1 藏 next＋tbd、showFuture 改淡色標記。瀏覽器視覺待使用者開頁確認。check_ds_sync PASS。

### 測試版接法定案（2026-06-30，使用者指示「綁測試版切換」）

- 測試版規則由 `page:` 改為 `route:create-project.html=../r2.1_funding-test/create-campaign.html`：切到測試版時，r2.1 所有「建立專案」連結改接另一 session 在做的募資建立流程 `r2.1_funding-test/create-campaign.html`，切回別版自動還原（記 `data-route-orig`）。最終版 href 不動（綁切換、不污染）。
- devtools.js `applyVersion` 加 route 處理（`routesForRule` ＋先還原再套）。`product-detail.html` 的「Open project」（開啟既有專案、非建立）標 `data-route-keep` 排除，不被改接。
- 改動只在 r2.1（devtools.js／feature-scope-map.md／product-detail.html）；不碰 r2.1_funding-test，與其 session 不衝突。
- 部署侷限：deploy.sh 只上 r2.1，funding-test 不在站上、線上點會 404；本機 server（root 設 site）／協作 repo 可達。
- 驗證（node）：route 解析正確、建立專案→create-campaign、Open project 保留、不相干連結不動；server root 設 site 時 projects 與 create-campaign 皆 200。

### 上站方案：複製進 r2.1/funding-test/（部署複本）

- 因部署 repo root＝r2.1 內容（無 `r2.1/` 層）、且 create-campaign 全引用 `../r2.1/`，funding-test 原位無法直接上線（光改 deploy 帶上去，CSS/JS 會 404）。改為複製一份部署複本進 `r2.1/funding-test/create-campaign.html`，並把資源前綴 `../r2.1/` → `../`（子夾往上一層即 r2.1 資源）。route 目標改 `funding-test/create-campaign.html`（本機／線上統一）。
- deploy.sh 不排除 .html，複本隨 r2.1 一起上線；funding-test 的規格 md 不會（排除 `*.md`）。
- **同步維護**：原檔（另一 session 在改）更新後，重跑同步指令刷新複本（在 `site/` 目錄）：`sed 's#\.\./r2\.1/#../#g' r2.1_funding-test/create-campaign.html > r2.1/funding-test/create-campaign.html`
- 驗證：複本 0 殘留 `../r2.1/`、其資源 200；route 解析 `funding-test/create-campaign.html` HTTP 200；線上同層關係成立。

### cheat code 預設載入、手機可用（2026-06-30，使用者指示）

- 起因：手機無法 Alt＋右鍵，開不了 cheat code。
- 改 devtools.js：(1) **預設開啟**（`OPEN_LS !== '0'` 即 open，首次載入就常駐右下角；只有按過 × 才不自動開）；(2) **預設縮成 header bar**（`MIN_LS` 無記錄預設 min，不擋內容，點展開鈕開）；(3) **觸控裝置（`(hover:none) and (pointer:coarse)`）隱藏「×」**，只留縮放，避免手機關了回不來。桌面維持 Alt＋右鍵 toggle／×／Esc。
- 範圍：僅 deploy 上線（已驗證新版 devtools.js 生效），**尚未 collab 進 monorepo**——PR #54 的 devtools.js 仍為無此改動的版本，待下次同步。
- 自包含於 devtools.js（cheat code 工具、非產品元件），不動 design-system。

### 撤回上述手機改動，回原本行為（2026-06-30，使用者指示）

- 使用者：保留關閉按鈕、不要預設開啟。撤回上一筆三項（預設開啟／預設縮 bar／觸控隱藏 ×），devtools.js 回原本——Alt＋右鍵開、預設不顯示、× 永遠在。已 deploy 驗證生效。
- 註：手機（無 Alt＋右鍵）因此暫無法開啟 cheat code；如需手機開法另議（前提：不走預設開、不移除 ×）。

### 首次進站 popup 選版本（2026-06-30，使用者指示）

- 解決手機開不了：devtools.js 加 onboarding popup——每裝置第一次進站跳出 modal（`.ztd-onb`），列出版本選項（讀 VERSIONS），選一個按「確定」即套用該版本（`state.version`→`update()`）並關閉進入畫面，存 flag `ztor.devtools.onboarded` 後不再跳。
- 不違反前面約束：popup 是一次性 onboarding，非常駐面板；devtools 面板本身仍預設不顯示、保留 ×、Alt＋右鍵開。手機首次即可選版本（含測試版→建立專案接 create-campaign）。
- 桌面之後要再切版本走 Alt＋右鍵面板。popup 自包含於 devtools.js，樣式用 DS token，響應式（≤420px 單欄）。已 deploy。

### 版本選項改一行一個＋分組（2026-06-30，使用者指示）

- 版本選項由 2 欄 grid 改**一行一個**（`.ztd__optrow`，名稱＋說明兩行），並**依類型分兩組**（`.ztd__subgroup` 小標題）：開發版本（full／p1-next／p1）、測試版（可多個）。面板與 onboarding popup 共用 `verRows(current, mode)` helper。
- 資料結構加「類型」欄：VERSIONS 每筆 `[鍵,顯示名,類型(開發/測試),規則,說明]`（規則 index 2→3，`curVersionRule`／`parseScopeMd` 同步）；md「## 開發版本配置」表「類型」欄改開發/測試。
- 測試版**用資料夾名當顯示名**：原 `test`／「測試版（特殊）」→ 鍵 `funding-test`、顯示 `r2.1_funding-test`（未來多測試版各用其資料夾名）。已 deploy。
- 另：面板底部加「重新顯示首次 popup」按鈕（`data-act="reonboard"`）——點擊 `localStorage.removeItem('ztor.devtools.onboarded')` 並立即重彈 onboarding popup（`showOnboarding` 開頭加防重複移除），方便測試／手機重看版本選擇，免去手動清 localStorage 或開無痕。已 deploy。

## 2026-06-29 · 商品細節頁補完 media／數位內容檔案／數位交付＋主分類連動（A 規格 · spec 5.1.5.1 §2.3 / D096）

接續 D095，把原標「R 2.1.1 待建」的欄位在 product-detail.html 做完，並由使用者裁示移除規格的「待建」字眼：
- **商品圖片／素材 Media**：「商品內容」卡最上方加素材上傳區——實體＝主圖＋4 附圖（2×2）、數位＝封面＋4 附圖，重用建立商品 5.1.5.2 §4 F1 的 `upload-showcase`/`upload-tile`（dashed 佔位，無真圖、自架不依賴 CDN）。
- **數位內容檔案 Content file（僅數位）**：重用 5.1.5.2 §4.2 F11 的 `upload-tile--file`；**數位交付／存取說明**：stickynote 提示「購買後即時下載／存取，檔案於『內容檔案』管理」。
- **主分類連動顯隱**：主分類 `<select>` 加 id `pd-main-cat`，新增頁面層 IIFE 依選擇切換 `[data-pd-cat="physical|digital"]`——實體顯示（主圖／詳細規格／取貨方式），數位顯示（封面／內容檔案／下載存取），預設實體（Tour zine 範例）。`.field[hidden]` 已由 field-system.css 處理、無 display 蓋掉問題。
- **i18n**：新增 `product-detail.field.media`、`pd.digital-delivery.title/note`（en＋zh）；其餘重用 `cp.media.*`/`cp.cfile.*`。
- **規格同步**：spec 5.1.5.1 §2.3 移除媒體／交付行的「R 2.1.1 待建」與 §2 前言待建註（D096／Plan160），產品定義不變。
- cache：i18n.js 改動 → 全站版本統一 bump `20260629n`→`20260629o`（含新 `upload-tile.css` 連入 product-detail）。驗證：check_ds_sync PASS；Playwright——實體預設顯 3 實體區/隱 3 數位區，切數位反轉、切回還原，0 raw i18n key，hero SVG 44px。

---

## 2026-06-29 · 商品細節頁補「詳細規格」＋主分類對齊（A 規格 · spec 5.1.5.1 §2.3 / D095）

依 spec 5.1.5.1 §2.3（D095）把建立商品已定義、細節頁漏列的欄位補進 product-detail.html：
- **詳細規格 Specifications（僅實體）**：在「商品內容」卡描述／價格之後新增可編輯逐筆「規格名稱＋規格值」列，預填 zine 範例（Material／Size／Pages），＋ 新增規格可加空列、行尾刪除。重用建立商品 5.1.5.2 §4.1② 的列樣式與 `cp.spec.*` i18n；前端 demo（無持久化）。
- **spec-row promote 成元件**：原樣式內聯在 create-product 的 `.cp-spec-row`，第二頁（product-detail）用到，promote 成 `ds-components/spec-row.css`（`.spec-row`）；create-product 同步改用、移除內聯 CSS。DS 頁加 §4.78 demo＋TOC＋index 列、design-system.md 加條目。
- **主分類選項對齊 §7.1／D080**：移除已打散的「Special / Premium」選項，主分類僅留 實體商品（Physical）／數位商品（Digital）／Experiences & Events。
- **media／數位內容檔案／交付細節未做**：spec §2.3＋D095 待辦明標 site R 2.1.1 待建（圖片素材區、數位內容檔案可編輯範圍、交付設定），本輪不建，記 ASSUMPTIONS UIA-018。
- cache：新增 `spec-row.css?v=20260629o`（其餘資產不變、仍 `n`）。驗證：check_ds_sync PASS（spec-row 連入＋demo＋版本一致＋TOC 解析）。

---

## 2026-06-29 · 電子商店 F4 分批載入校正：批量預設 10→25、縮圖 lazy-load 記為慣例（D infra · spec 5.1.5 F4 三類共通 / D094 改版）

依 D094 改版（批量 10→25、縮圖延遲載入）：
- **批量預設 10→25**（使用者裁示）＋ demo 批量改用 25（與規格一致）：先前 demo 取 4 會在 6 筆時誤現「載入更多」（與真實 25 批量矛盾，使用者指出）。改 `BATCH=25`。
- **Demo Products 補滿至 30 筆**（使用者要求，以真實 25 批量展示「載入更多」）：JS `fillDemoProducts()` 於所有 binding 前生成 24 筆樣本列（Live、無圖佔位，套 icons／i18n，故 shop 開關/計數/篩選/拖曳皆涵蓋）。Products 30 筆 → 顯示 25＋載入更多 → 點擊 → 30＋end-cap「已顯示全部 30 筆」。Bundles/Auctions 仍 <25、直接 end-cap。
- **「載入更多」改用無外框按鈕** `btn--ghost`（原 `btn--outline`，使用者指定）。
- Playwright 驗證：30 筆、初顯 25、ghost Load more（border 0/none）、點擊→30＋「已顯示全部 30 筆」、All 計數 30、生成列 Live 徽章中文「已上架」。
- **縮圖 lazy-load**：真實縮圖 `.product-list__image img` 的撰寫慣例＝`loading="lazy"`（僅捲入視窗才抓圖）。**惟本 demo 三類清單為無圖 CSS 佔位（「ztor.」字樣／圖示，自架不依賴 CDN，無真實 `<img>`）**，故依使用者裁示「記成慣例、不放假圖」——記入 design-system.md（product-list「Thumbnail lazy-load」）＋ BUILD-SPEC ＋ ASSUMPTIONS UIA-036；demo 無可見變化、無資產版號變更。
- 待真實縮圖接上時，於 `.product-list__image img` 套 `loading="lazy"` 即生效。

---

## 2026-06-29 · 電子商店 F4 清單分批載入＋end-cap（A 規格 · spec 5.1.5 F4 三類共通 / D094）

依 spec 5.1.5 F4 三類共通「分批載入（Load more）＋全部載完 end-cap」（D094）：
- **e-shop.html**：三類清單共用一個頁尾 `[data-eshop-foot]`（貼在目前可見分頁下方）——未載完顯示「載入更多（Load more）」鈕、全部載完顯示 end-cap「已顯示全部 N 筆」（N＝目前狀態篩選相符總數）。JS：`applyFilter` 改為「相符列只顯示前 `shownCount` 筆」，`updateListFoot` 控制 Load more／end-cap；切換類型分頁、改搜尋、改狀態篩選→`resetBatch()` 回第 1 批；「載入更多」`shownCount += BATCH` 再重套；0 筆走既有「查無符合」（與 end-cap 分流）；語言切換重算 end-cap 文案。
- **批量**：`BATCH = 4`（**demo 值**；spec 預設 10，樣本列少取 4 以展示 Load more，記 ASSUMPTIONS UIA-036）。Products（6 列）→ 顯示 4＋Load more→全 6＋end-cap；Bundles（3 列）／Auctions 直接 end-cap。
- **排序達任一位置**（D094 原則）：demo 清單小、Load more 載完即可全列拖曳；正式門檻（小量全載／大量移到指定位置）屬 BUILD-SPEC（UIA-036）。
- i18n 新增 `e-shop.loadmore`（Load more／載入更多）；end-cap 文案 JS 生成（隨語言）。
- cache bump `20260629m`→`20260629n`。驗證：check_ds_sync PASS；Playwright——Products 顯示 4→Load more→全 6（end-cap「已顯示全部 6 筆」）、Bundles 直接 end-cap「3 筆」、切分頁重置回 4、Sold Out 篩選 end-cap「1 筆」（N 對齊篩選）。

---

## 2026-06-29 · 電子商店 F4 商品狀態欄補「售罄（Sold Out）」徽章（A 規格 · spec 5.1.5 F4 Products / D093）

依 spec 5.1.5 F4 Products 狀態欄列明徽章（D093）：補上「售罄（Sold Out）」，並與「低庫存（Low Stock）」明確區隔、不混用。
- **e-shop.html**：Products 清單加一筆售罄範例列（`data-status="out"`，Enamel pin · wave）——狀態徽章 `badge--neutral`「已售完」（沿用既有 i18n `e-shop.row.out`），stock「剩 0 件」，仍上架、列操作含補貨（Restock，實體售罄可補貨）。售罄篩選（原已有，無對應列）現有一筆、計數＝1。
- **徽章對映**：Live→`badge--success`（綠）／Low Stock→`badge--error`（紅）／Sold Out・Draft・Hidden→`badge--neutral`（灰）。售罄＝庫存歸零、低庫存＝低於門檻仍有貨，灰 vs 紅視覺區隔（D093）。Hidden 維持既有「Shop 關→動態 neutral『已隱藏』」。
- **i18n**：新增售罄範例列欄位 `e-shop.row5.meta/cat/price/stock`；徽章文案沿用既有 `e-shop.row.out`（Sold Out／已售完）。
- **DS 同步**：design-system.html §4.26 product-list 基本 demo 加一筆 Sold Out 列；design-system.md 加「Status badges」對映說明（Live/Low Stock/Sold Out/Draft/Hidden → badge 變體）。
- cache bump `20260629l`→`20260629m`。驗證：check_ds_sync PASS；Playwright——售罄列 `badge--neutral`「已售完」、與 Low Stock `badge--error` 類別/底色皆不同、含 Restock、Sold Out 篩選計數＝1 且只剩售罄列。顯示文案／灰階記 ASSUMPTIONS UIA-035。

---

## 2026-06-29 · 電子商店 F4 清單草稿列空值占位（A 規格 · spec 5.1.5 F4 三類共通 / D092）

依 spec 5.1.5 F4「三類共通——草稿空值占位」（D092）：清單草稿列每一欄都以占位呈現未填值、不留空白。
- **元件**：`product-list.css` 加 `.product-list__title--draft`（淡色、常規字重、斜體）＋`.product-list__empty`（淡色），作為清單列的「草稿／空值」狀態。
- **e-shop.html**：Products／Bundles／Auctions 三類各加一筆草稿範例列（`data-status="draft"`）——名稱→「未命名（Untitled）」、圖片→既有預設 placeholder、次分類／價格／庫存／成員／出價／動態等→「—」；草稿列上架開關預設關閉。Auctions 原狀態集無 draft，本輪補上 `draft` 篩選（STATUS_SETS.auctions）＋草稿拍賣列（Edit→create-auction）。
- **i18n**：新增 `e-shop.draft.untitled`（Untitled／未命名）；Draft 徽章沿用既有 `e-shop.status.draft`。
- **DS 同步**：design-system.html §4.26 Product list 基本 demo 加一筆草稿列、State 表加「draft」列；design-system.md 同步 State 列。
- cache bump `20260629k`→`20260629l`。驗證：check_ds_sync PASS；Playwright——三類草稿列渲染（未命名＋四欄「—」、淡色斜體）、Draft 篩選計數＝1 且只剩草稿列、上架開關 off、auctions 取得 draft 篩選。占位文案（Untitled／—）為 project-ui-creator 依 D092 待辦所定，記 ASSUMPTIONS UIA-034。

---

## 2026-06-29 · 其餘建立頁 footer 一致化：去除多餘「Save for later」、主動作右對齊（C 撤除 · 比照 D090）

把建立組合的 footer 慣例（主動作右對齊、不放多餘「稍後再存」）套到其餘建立頁：
- **create-auction.html**：footer 左側無動作的 ghost「Save for later」移除，`<footer class="wizard__bottom" style="justify-content:flex-end">`（header 已有 Save as draft）。
- **create-project.html**（多步驟）：footer 左側「Save draft」（與 header 的 Save as draft 重複）移除，連同其 JS 綁定（原 `[data-action=save-draft]` alert）一併拿掉以免 querySelector null 報錯；footer 改右對齊，Back／Continue 保留。存草稿統一走 header `data-wizard-savedraft`（wizard-chrome.js）。
- **create-product.html**：footer 早已 `flex-end`、無左側 save-for-later，未動。
- **ip-detail.html**：其「Save for later」是頁內卡片的功能按鈕（`ip-detail.btn.save`，非 wizard footer ghost），保留不動。
- 純呈現／移除冗餘，無資產版本變更（仍 `?v=20260629k`）；驗證：check_ds_sync PASS、Playwright（兩頁 footer flex-end＋主動作靠右、create-project stepper Back/Continue 仍正常、無 console error）。

---

## 2026-06-29 · 建立組合加即時預覽＋上架開關、footer 右對齊、「排程特價」改名「販售排程」（B 反饋＋A 規格 · spec 5.1.5.4 v1.8 / 5.1.5.9 v1.5 / D091）

依使用者反饋：
1. **footer 主動作右對齊**：`<footer class="wizard__bottom" style="justify-content:flex-end">`（比照建立商品；先前移除左側「稍後再存」後按鈕掉到左邊）。
2. **加即時預覽欄**（A 規格 5.1.5.4 §4 F6 確認，比照建立商品 §5.2.5）：`.wizard__body` 改 `preview-split`、表單包入 `.preview-split__form`、新增 `<aside class="preview-col">`＝preview-col head＋`preview-card`（粉絲視角組合卡）。JS 在 recompute 即時更新預覽卡名稱／價格（固定價或折後價）／描述（`.is-empty` 佔位切換）。新掛 preview-card.css／preview-column.css。
3. **加上架開關**（A 規格 F6 確認）：preview-col 內 `control-row`＋`switch`（Show in my shop），沿用 `cp.show`／`cp.show.sub`。
4. **「排程特價」改名「販售排程」**（A 規格 F7／D091）：i18n `cb.sale.title`→販售排程、`cb.sale.activate`→啟用販售排程、`cb.sale.start/end`→販售開始/結束日；create-bundle 與 bundle-detail（透過 i18n）一致。
- 新增 i18n：`cb.preview.heading`／`cb.preview.sub`／`cb.pv.name`／`cb.pv.desc`。spec 同步：5.1.5.4 §4 F6 把「即時預覽卡＋上架開關」由待確認改確認（就緒檢查仍待確認、未建）；§4 F7／§3／§5／§6.1 改名；5.1.5.9 §2.3 改名。
- cache bump `20260629j`→`20260629k`。驗證：validate_spec OK、check_ds_sync PASS、Playwright（footer flex-end＋按鈕靠右、preview-col 可見、show 開關、販售排程改名、預覽卡即時更新名稱/價/描述）全綠。

---

## 2026-06-29 · 建立組合 5 項校正：素材獨立區段／庫存改 selection-card／在庫 disabled／特價日期僅啟用顯示／footer 去「稍後再存」（B 反饋＋A 規格 · spec 5.1.5.4 v1.7 / D090）

依使用者反饋校正前一版：
1. **素材自「組合資訊」拆為獨立區段**（A 規格 5.1.5.4 §4 新增 F8 素材、F1 僅留名稱＋描述／D090）：create-bundle 由一個「Bundle info」段拆成「Show it off」＋「Bundle info」兩個 `form-section`。
2. **庫存版本改用 selection-card**（同定價固定價/折扣卡），取代原 `segmented.radio-cards`；兩頁 `#cb-edition`／`#bd-edition` 改 `.selection-grid`＋`.selection-card`，JS active class 改 `.selection-card--active`；移除兩頁已不用的 radio-card.css／segmented.css link。
3. **目前在庫無值時用 disabled input**（不顯示「—」）：create-bundle `#cb-avail` 初始 `disabled`，recompute 在 n=0 時 `disabled`＋清空、n>0 時解除 disabled 並填 min。
4. **排程特價日期僅啟用時出現**：修 `ds-components/form-grid.css` 補 `.form-grid[hidden]{display:none}`（`display:grid` 原會蓋掉 `[hidden]`，導致起訖日恆顯）；兩頁起訖日 `data-*-sale-fields` 現正確隱藏。
5. **footer 去除「稍後再存／Save for later」**：create-bundle 底部僅留主動作（建立組合）靠右（D090；頂部已有 Save as draft、離開走返回箭頭，spec §3/§F5 本即未列、規格與 UI 一致）。
- 其餘 4 個建立頁（create-product/auction/project、ip-detail）仍有 footer「Save for later」——本輪未動（各有自身 spec），待確認是否一併移除。
- cache bump `20260629i`→`20260629j`。驗證：validate_spec OK、check_ds_sync PASS、Playwright 兩頁重測。

---

## 2026-06-29 · 建立組合／組合細節擴充：素材＋描述＋庫存(Edition)＋排程特價（A 規格 · spec 5.1.5.4 v1.6 / 5.1.5.9 v1.3 / D089）

- 來源：`documents/5.1.5.4-建立組合流程.md` v1.6（D089／Plan153）＋ `5.1.5.9-組合商品細節頁.md` v1.3——依使用者截圖把組合建立擴充成完整流程。
- 改動（沿用既有 ds-components，無新元件）：
  - **create-bundle.html** — F1「組合資訊」加素材（Show it off，`upload-tile` 主圖＋2×2 附圖，沿用建立商品 §4 F1）＋描述（`textarea`）；F4 由「限量」改「庫存」＝Edition `segmented.radio-cards`（不限量／限量）＋唯讀「目前在庫」`input[readonly]`（即時＝min(成員,上限)）＋限量才出現的「組合上限」；新增 F7「排程特價」＝`control-row`＋`switch`（啟用）＋兩個 `input[type=date]` 起訖日。
  - **bundle-detail.html（5.1.5.9）** — 同步加描述＋素材＋庫存(Edition＋唯讀在庫)＋排程特價；%off 由單欄改「折扣後價格＋折扣趴數」雙欄（對齊 D088）；底部卡由「庫存＋影響」改為純「成員影響」（庫存已移入內容卡，去重）。
  - 新增 ds-component link：create-bundle 與 bundle-detail 皆補 upload-tile／radio-card／segmented／control-row／switch／form-grid。
  - JS：Edition 切換顯隱上限欄、唯讀在庫＝min(成員,上限) 即時重算、排程特價 toggle 顯隱起訖日；Create gating 加「限量需有效上限」「啟用特價需起訖日且結束晚於開始」（§6.1）。素材／描述為 demo、**不納入 gating**（見 ASSUMPTIONS UIA-033）。
  - i18n 新增 `cb.media.*`／`cb.desc*`／`cb.stock.title`／`cb.edition.*`／`cb.total*`／`cb.avail.*`／`cb.sale.*`＋`bd.impact.title`（en＋zh）；素材通用鍵沿用 `cp.media.dnd/formats/min600`。
- 產品待確認（記 ASSUMPTIONS UIA-033、spec §4 F7）：特價價格來源、時區、結束回原價、是否與單品共用排程——UI 標「pending spec」、不自創價格欄。
- cache bump `20260629h`→`20260629i`。驗證：check_ds_sync PASS、Playwright 兩頁互動。

---

## 2026-06-29 · 建立組合表單欄位標題＋折扣雙欄連動（A 規格 · spec 5.1.5.4 v1.5 / D088）

- 來源：`documents/5.1.5.4-建立組合流程.md` v1.5／decisions D088——使用者裁示組合建立頁四項。
- 改動（`create-bundle.html`，皆沿用既有 `.form-section`／`.field`／`.field__label`／`.field__hint`，無新元件）：
  1. **組合名稱**區段補區段標題「組合包資訊（Bundle info）」（`form-section__head`）。
  2. **固定價** input 補 label「固定價」；「組合價不得高於成員原價合計」維持為該 input 的描述（既有動態 `#cb-price-hint`）。
  3. **折扣（% off）** 由原「待補」單一 % 欄改為兩個連動欄位：折扣後價格（`#cb-disc-price`）↔ 折扣趴數（`#cb-disc-pct`），填一欄另一欄即時依成員原價合計 S 換算（價＝S×(1−%/100)、%＝(1−價/S)×100），以最後編輯欄為準；S＝0 提示先加入成員；折扣後價 > S 擋建立（D088）。
  4. **限量** input 補 label「總數量（Total quantity）」。
- i18n 新增 `cb.info.title`／`cb.price.discounted`／`cb.price.pctoff`／`cb.price.disc-hint`／`cb.disc.addfirst`／`cb.limit.label`（en＋zh）；移除已具規格的 `cb.price.pct-note`。
- 無元件／token 變更，design-system 無需同步。cache bump `20260629g`→`20260629h`。
- 驗證（Playwright，cache-bust，DOM eval）：選 2 成員（$11+$12＝$23）後切 % off →填 50% 得折後價 $11.50、填折後價 $20 得 13%、提示「省下 $3.00 相對成員合計 $23.00」；區段標題「組合包資訊」、固定價／總數量／折扣後價格／折扣趴數 label 皆渲染（zh）。check_ds_sync PASS；validate_spec PASS。

---

## 2026-06-29 · 平台營運（Admin）層＋Creator 管理頁（A spec · 5.1.0 / D086）

- 範圍：依新規格 `documents/5.1.0-Creator管理.md`（D086）在現有單一創作者工作區之上加 Admin 視角。新增 `creators.html`（Tier 0：creator 名冊 F1＋建立 creator F2／自動生成 eShop 為 demo＋進入與返回 F3）。改 `sidebar.js`：roster 頁只露 Creator 管理 marker＋Tier 1 各模組鎖定（`.app-topbar__link--locked`）；進入 creator 後 logo 前加返回名冊 icon＋「管理中 <creator>」標示、導航解鎖。`devtools.js` 加「Creator · Admin」cheat code 切換／清除 activeCreator。`icons.js` 補 arrow-left／shield-check。`shared.css` 加 `.app-topbar__back/__context/__link--locked` 與 sidebar 對應。i18n 補 admin.* / creators.* 鍵。
- 動機：站台改為 Beamco 內部 Admin 工具——Admin 管理多個 creator、選定後代為操作其工作區（使用者裁示；上游 PRD §3.3 #3 帳戶切換為部分依據）。v1 僅 Admin 代操、無登入頁、creator 自助 SSO 為 phase 2。
- 三種導航面貌（依 activeCreator，2026-06-29 依使用者反饋修正）：**一般創作者**＝未選 creator → 純 dashboard、無 admin chrome（即之前的版本）；**admin 代管**＝從名冊 Manage 選定 → logo 前返回 icon＋「管理中 X」；**名冊頁**＝Creator 管理 marker＋Tier 1 鎖定。早期「Tier 1 預設帶第一個 creator」已移除——未選就是一般創作者視角，admin chrome 只在真的代管時出現。
- A 實作：`window.ztorCreator`（list/get/set）為單一來源，creators.html 與 devtools 共用；activeCreator 存 localStorage、變更派 `ztor:creator-changed` 由 sidebar 重繪。返回入口依使用者裁示固定置於導航 logo 之前（D086）。
- 待確認（記 ASSUMPTIONS UIA-029..032）：creator 工作區範圍已確認＝完整現有工作區；建立 creator 必填欄位、店鋪識別唯一性、代操稽核、creator 狀態枚舉仍待上游（D086／§8.3）。
- 驗證：check_ds_sync PASS（版本統一 20260629e）；Playwright——roster 3 筆＋7 模組鎖定＋無返回鍵、Manage→index.html 返回鍵在 logo 前＋管理中 Denise＋導航解鎖、cheat-code 切換即時、i18n 無殘留 key、空狀態 `[hidden]` 修正。

## 2026-06-29 · 建立流程 header 新增「儲存為草稿」二級鈕（A 規格）

- 範圍：全 6 建立流程頁 header 的儲存狀態旁——`create-product` / `create-auction` / `create-bundle` / `create-event` / `create-project` / `register-ip`。
- 改動：自動保存指示器右側新增 `btn btn--outline btn--sm`（本 DS 二級按鈕）「儲存為草稿」鈕（i18n `wiz.savedraft`）。
- 行為：手動「儲存為草稿」同時觸發自動儲存示意（寫入自動儲存紀錄）；離開頁面時以最後一次自動儲存的紀錄為準。標準頁由共用 `partials/wizard-chrome.js` 的 `[data-wizard-savedraft]` 接（`edited=true`＋`autosaveTick`）；`create-event` 用自有狀態 JS，於該頁把按鈕接到 `scheduleSave`。
- 規格：同步寫入 `documents/0-設計規格書.md §5.2.4 建立流程共同行為` 輸出內容段（草稿儲存＝自動＋手動並行、離開以自動儲存紀錄為準）。
- 緣由：開發回饋自動儲存有延遲/切頁失敗、無校驗等風險；提供明確手動存檔點。用字對齊既有 wizard 文案「儲存」（非「保存」）。
- 用既有 `btn--outline` 變體，無新增元件，DS 不需新 demo。

### 2026-06-29 後續調整（B 反饋）

- 「儲存為草稿」鈕改用**元件庫標準尺寸**（移除 `btn--sm` → `btn btn--outline`），全 6 建立頁同步。
- 返回離開確認彈窗（`partials/wizard-chrome.js` 注入、`.wizard-leave*` 樣式於 `shared.css`，屬共用 wizard chrome、非正式 ds-component）：第二顆「不儲存就離開」由 `btn--ghost` 改 `btn--outline`（有線框）。

### 2026-06-29 後續調整二（A 規格 / D infra）

- **返回離開確認彈窗 promote 成正式元件**：自 `shared.css` 的 `.wizard-leave*` 搬出 → `ds-components/leave-dialog.css`（class 改名 `.leave-dialog*`），`partials/wizard-chrome.js` 注入端同步改名。6 建立頁加掛 `leave-dialog.css`。涵蓋兩個型態（有未存編輯→問儲存；未編輯→純離開）。
- DS 同步：design-system.html 加 4.77 Leave dialog demo（兩態並列）＋ TOC「Overlays & dialogs」連結＋ 元件登錄列＋ head link；design-system.md 加元件條目。scrim 改用 `var(--overlay-tint)` token（消除裸色 WARN、對齊 modal backdrop 慣例）。
- **「儲存為草稿」鈕按下即 disable、存完（700ms）回 active**：邏輯加在 `wizard-chrome.js` 的 `[data-wizard-savedraft]` handler（`btn:disabled` 視覺由 button.css 既有 `opacity:.45` 提供），6 頁通用；create-event 自有狀態 JS 路徑亦適用。

## 2026-06-27 · 建立商品「定價」新增成本價（Cost）（A 規格 · spec 5.1.5.2 F3.2／D085）

- 來源：`documents/5.1.5.2-建立商品流程.md` v5.2／decisions D085——定價新增「成本價（Cost）」（選填、創作者內部成本、不對買家顯示；多規格時走逐規格表既有 Cost 欄）。
- 改動：`create-product.html` 單一規格「定價」卡（`section[data-when-var="single"]`）在 價格／原價 後新增成本價欄位 `#cp-cost`（沿用既有 `.field`＋`.input`，非新元件）；label「成本價·僅自己可見」、hint「選填」。i18n 新增 `cp.cost`／`cp.cost.note`（en Cost／creator only；zh 成本價／僅自己可見）。逐規格表（多規格）的 Cost 欄本來就有，未動。
- 無元件／token 變更，design-system 無需同步。cache bump `20260629c`→`20260629d`。
- 驗證（Playwright，cache-bust）：定價卡渲染 價格＊／原價／成本價 三欄、i18n 中英皆套用、成本價標選填；check_ds_sync PASS（裸色 WARN 為既有 selection-card）。截圖 `screenshots/cost-field.png`。

## 2026-06-26 · wizard header 加 Header shadow（A 規格 · 參考 Figma 720:1763）

- 依 Figma（node 720:1763「Header shadow」）：sticky wizard header（`.wizard__top`）下緣加一道「內縮、淡」的陰影，把 header 與下方捲動內容分開（取代舊的無分隔）。
- 實作：`.wizard__top::after`（absolute，不參與 flex）——左右內縮 28px 對齊內容區、`top:100%`、bottom 圓角 64px 讓兩端漸淡、`box-shadow:0 2px 16px rgba(0,0,0,0.08)`（同 Figma 值）。改 shared.css 一處，6 個 wizard 建立頁全生效。
- 同步 design-system「Wizard frame」(4.50) spec Anatomy/Behavior 描述。
- 驗證（Playwright）：捲動時 header 下方出現淡陰影、內容捲到其下；check_ds_sync PASS。cache `20260626b`。

- 追加（同日）：Header shadow 加強到可見——Figma 原值 `0 2px 16px rgba(0,0,0,0.08)` 在瀏覽器（白底、頁頂無內容捲入時）幾乎看不見，改 `.wizard__top::after` 為 `height:10px; 左右內縮 24px; box-shadow:0 6px 16px rgba(0,0,0,0.16); border-radius 0 0 40px 40px`，明顯但仍柔和。DS spec 同步此值。cache `20260626c`。

- 追加（同日）：Header shadow 改法——原本用 `.wizard__top::after` 帶圓角的 10px 陰影帶，兩端會像「色塊突出」。改成直接給 `.wizard__top` 一道 `box-shadow: 0 8px 16px -8px rgba(0,0,0,0.16)`（y8 只往下、負 spread -8 從兩側內收），乾淨柔和、不突出色塊。移除 ::after。DS spec 同步。cache `20260626d`。

- 追加（同日）：Header shadow 改回忠實 Figma 720:1763 的**分層色塊結構**（使用者確認）——`.wizard__top::before`：與 header 同色的色塊藏在 header 後方，高度＝header、左右各內縮 28px（＝header 內容 padding）、下方圓角 64px、`box-shadow:0 3px 16px rgba(0,0,0,0.10)`、`z-index:-1`。色塊被 header 蓋住、只露出下緣陰影，大圓角讓兩端漸淡（取代前一版直接 box-shadow 在 header 上）。DS spec 同步。cache `20260626e`。

- 追加（同日）：Header shadow 修掉「上緣/兩側陰影外漏（像浮卡）」——`.wizard__top-bar` 改 `background:inherit; position:relative`，當作不透明的上層蓋住 `::before` 色塊的上緣與兩側陰影（比照 Figma「header 在上層」的兩層結構），只露出下緣陰影。視覺對齊 Figma 720:1827「合併」狀態。cache `20260626f`。

- 追加（同日）：Header shadow 值收進 Foundation token——新增 `--shadow-header`（light `0 3px 16px rgba(0,0,0,0.10)`／dark `0.45`）於 `_tokens.css`，`.wizard__top::before` 改引用 `var(--shadow-header)`，不再寫死。design-system.html（Pillar 1 陰影表＋色票）與 design-system.md 陰影 token 表同步收錄；wizard-frame spec 改引 token 名。cache `20260626g`。

## 2026-06-26 · Header shadow 抽成可覆用工具 .edge-shadow（D infra · 使用者指定圓角 taper）

- 把「下緣柔和、內縮、兩端圓角漸淡、不外漏」的陰影做法抽成共用工具 **`.edge-shadow`**（shared.css）：`::before` 與元素等高、左右內縮（`--edge-shadow-inset` 28px）、下方圓角（`--edge-shadow-radius` 64px）投 `--shadow-header`，再 `clip-path: inset(100% 0 -40px 0)` 只露下緣 → self-contained，不需不透明上層遮蓋（取代之前 header 的 `.wizard__top-bar` cover hack）。用 `::before` 避開用 `::after` 的元件。
- **wizard header**：`.wizard__top` 內建套用（移除舊 ::before 色塊＋bar cover）。
- **電子商店貼頂庫存條**：`#eshop-stock-bar` 加 `edge-shadow` class、重申 `position:sticky`、關掉 `.alert--page-top::after` 角遮罩、移除原本各做一套的漸層帶 → 與 header 同一套陰影。
- DS：design-system.html Pillar 1 · 1.5 陰影 加 `.edge-shadow` 工具說明；design-system.md 元件表加「Edge shadow（工具）」列；Wizard frame 規格改引用工具。
- 驗證（Playwright）：header 與庫存條的 ::before 皆 `--shadow-header`＋clip、只露下緣、不外漏；庫存條仍 sticky。check_ds_sync PASS。cache `20260626j`。

## 2026-06-26 · 電子商店主工作列陰影改忠實 Figma 兩層結構（B 反饋 · 參考 Figma 720:2165）

- 範圍：`e-shop.html` 的 `.eshop-list-topbar`（商品/組合/競標 tab＋動作列那條）。
- 改動：**移出共用 `.edge-shadow`**，改照 Figma node 720:2165 的兩層結構自做——主體層（對齊 Figma Container 720:2167）給**不透明底 `--surface-page`＋下緣圓角 12**，陰影層（對齊 Figma shadow 720:2166）以元素自身 `box-shadow: 0 6px 14px -4px rgba(0,0,0,0.16)`（深色白光 0.12）呈現。markup 拿掉 `edge-shadow` class，刪掉用不到的 `--edge-shadow-*`／`--shadow-header` 覆寫與 clip 覆寫。
- 動機：`.edge-shadow` 用 `clip-path` 水平直切，只能讓陰影兩端淡出，做不出 Figma「白色主體圓角咬進陰影」的缺口；且本工作列原本透明、沒有不透明主體承載圓角，圓角根本不顯。給不透明底後，圓角元素的 `box-shadow` 會自然沿圓角邊緣走，圓角陰影才成形；y6＋負 spread -4 收成主要往下、兩側內縮（模擬 Figma 陰影左右 inset、上緣不外溢）。
- 驗證（Playwright，淺/深色）：工作列下緣柔影沿左右下圓角收尾、上緣不外溢；深色為白色微光。截圖 `screenshots/eshop-topbar-v2-full.png`／`eshop-topbar-v2-dark.png`。

## 2026-06-25 · DS token 對齊 shadcn＋暗色實色＋控件尺寸＋focus 統一（B 反饋 · issue #11）

- 範圍：ztor 工程端 jaskang 在 GitHub issue #11 提 5 點。`ds-components/_tokens.css` 重訂 Role 層；60 元件 CSS＋shared.css＋全頁面＋JS 以邊界安全 sed 換名；design-system.html（Role/Mode/Foundation/控件尺寸/focus）＋design-system.md＋BUILD-SPEC 同步；`project-ui-creator` skill 加 6 條規則。
- 動機：下游用 shadcn 出貨，token 命名對齊可直接複用元件、AI 更好接（jaskang）。
- **A 改名**：`--surface→--card`、`--surface-muted→--muted`、`--foreground-subtle→--muted-foreground`、`--surface-rail→--sidebar`、`--surface-rail-hover→--accent`、`--status-error→--destructive`；補 shadcn 全集（card-foreground / popover(-foreground) / secondary(-foreground) / accent-foreground / destructive-foreground / input / chart-1..5 / sidebar 整組）。creator 獨有保留為 `[ext]`。對齊語意、值不變、品牌橘仍 `--primary`。
- **B 暗色實色**：主要面（background / foreground / card / muted / sidebar / border）由 rgba 疊層改實色 hex（值在 #191A1A / #2B2B2C 上算出、外觀不變）；半透明只剩 backdrop-blur overlay；`--ring` 暗色改繼承品牌橘（不再白）。
- **B 控件尺寸**：新增 `--control-h-*`=28/36/44/52/60（÷4）＋ 4px `--space-1..16`；button / input / field-pill / tag-input 共用、input↔button 同尺寸等高；button / input 補 `--xs`/`--xl`。default 維持 44（未改 shadcn 的 36）。
- **B focus 統一**：原 4 種寫法（outline×2 色 + box-shadow halo×2）收斂成單一 `outline: 2px solid var(--ring); outline-offset: 2px`（清單列 `-2px`）；filter-tabs / tabs 的 `--primary` 改 `--ring`。
- **B 小數**：chart 2.5px、waterfall / upload 1.5px、alert calc −0.5px、shadow 次像素 → 整數。
- **裁示（無障礙）**：a11y 規則一律最低優先、只建議、不當實作通則、不阻擋交付（已寫進 skill）；橘 ring 低對比僅記風險、保留品牌。
- 驗證：rename 後 consumer 殘留 grep = 0；check_ds_sync PASS；Playwright 亮/暗目視 + 控件等高 + focus 一致。

## 2026-06-25 · create-auction 改版成無卡片版（B 反饋 · 5.1.5.10，逐頁 migration #1）

把 create-auction 從舊 card 版改成 create-product 的無卡片版面、套用新元件。
- 區段：9 個 `.card ca-section` → `.form-section`（無卡片、標題18／灰副標／分隔線）；種類選擇卡另包成最前的 form-section。
- 控件：`.ca-two-col`/`.ca-price-row` → `.form-grid`；`.ca-show-row`（密封終局/得標者付運費/上架開關）→ `.control-row`（有外框列）。
- 預覽：滑出式 `.preview-panel` → 表單旁 `.cp-preview-col`（sticky 兩欄，preview-card 內移、#ca-pv-* ID 保留）；就緒檢查 `.readiness` 移到 footer chip 的 hover tooltip（`.ca-ready-pop`，比照 create-product）。移除 preview-panel.css link 與 `body.preview-open`。
- 黑夜版：維持 shared.css 全域預設（content #2B2B2C／footer #191A1A）；對調僅 create-product。
- 驗證（Playwright）：兩欄 sticky 預覽、10 區段無卡＋分隔線、control-row 外框、就緒 tooltip、預覽即時更新、種類切換連動隱藏對應區段、無重複 ID。check_ds_sync PASS。

- 連動元件改動：`selection-card.css` 已選樣式由「淡橘底＋2px 環」改為 **ring-only（卡面陰影＋1.5px 橘環、不換底色）= 建立流程標準**（使用者指定全建立流程一致）；含 swatch 的卡（Settings 主題挑選器）以 `:has(.selection-card__swatch)` 維持原淡橘底。同步 design-system.html selection-card 的 active 敘述。影響所有用 `.selection-card` 的頁面（create-product 型別卡、create-auction 種類/時長、之後各建立頁）；Settings 主題挑選器不變。

## 2026-06-25 · 其餘建立頁套用無卡片版（B 反饋，逐頁 migration #2–5）

承 create-auction，其餘 4 頁也改成無卡片＋新元件（每頁畫面截圖給使用者確認）。

- **create-bundle**（5.1.5.4）：4 個 `.card cb-section` → `.form-section`；無預覽面板/就緒檢查（本頁本來就沒有），單欄；其餘 bundle 專屬 class（cb-add-tile/cb-summary/cb-price-input…）保留。
- **create-event**（5.1.5.x，stepper）：表單步驟本就是無卡片 `.ce-block`；Review 步驟 4 張摘要 `.card` → 無卡片摘要列（`.ce-review-row`：標題＋Edit→ 一行＋底線分隔）；選擇卡已隨 selection-card 改 ring-only。
- **create-project**（stepper）：全頁 19 處 `.card`/`.card--muted`（型別欄位群組＋摘要）以頁內 override 一次去卡面（透明底/無框/無陰影，`!important` 蓋 inline padding），有 head 的摘要改底線分隔列；型別卡已 ring-only。
- **register-ip**（stepper）：3 張 review `.card` 同法去卡面改分隔列；自訂 `.ri-usage__card--active` 由淡橘底改 **ring-only**（與選擇卡一致）；表單 `.ri-block` 本就無卡片。
- 黑夜版：這 4 頁維持 shared.css 全域預設（對調僅 create-product）。
- 驗證（Playwright，逐頁）：各頁 0 卡面殘留、stepper/條件顯示/即時預覽正常、ring-only 生效。check_ds_sync 全程 PASS。
- cache 全站 bump → `?v=20260625a`。

## 2026-06-25 · design-system.html 元件導覽功能分組 + 頁面 dead code 清理（D infra）

稽核發現 Pillar 4 元件導覽零散，逐項修：
- **TOC 功能分組**：原本 ~60 個元件平鋪在「Pillar 4 · Component」下一條清單，重整成 12 個功能次分組（Primitives／Form & fields／Selection controls／Lists & tables／Cards & tiles／Navigation & chrome／Create-flow／Preview／Overlays & dialogs／Feedback & status／Data viz／Media & hero），新增 `.toc__subgroup` 小標樣式（比 Pillar 標題輕）。
- **補齊漏掛的 TOC**：原本有 demo 區段但側欄找不到的 16 個元件全部補進（char-counter／completeness／embed-modal／empty-card／event-preview-card／insight-row／list-footer／message-modal／msg-token／notification-matrix／product-post／split-button／status-axes／store-settings／tag-input／variant-builder）。TOC 元件連結 60→77。
- **demo 區段未動**（錨點不變，零破壞）；check_ds_sync TOC 錨點 79→95 全解析、PASS。
- **頁面 dead code**：create-product 移除已失效的 preview-panel.css link＋`@media 760px #cp-preview` 區塊（預覽早已改 inline `.cp-preview-col`，無對應元素）。經查各頁無真正重複 `<link>`（先前「2×」是 grep 命中註解、非重複標籤）。
- 未做（待定）：demo 區段的檔案順序與編號（4.22b–p／4.29c–i 傾倒場、4.49–52 脫序）僅捲動時可見、屬較大改動；Segmented vs Segmented control、Composer vs Message composer 是否合併需上游決定。

## 2026-06-25 · design-system.html 區段重排＋重編號＋去重稽核（D infra，續）

- **demo 區段照功能分組重排**：用腳本把 Pillar 4 的 79 個 `<section class="sub">` 依 12 分組（同 TOC）重新排序，捲動順序＝TOC 順序（錨點不變、零破壞）。
- **重編號**：原本 4.0–4.48 夾雜 4.22b–p／4.29c–i／4.49–52 脫序，重編成連續 **4.0–4.78**（4.0 分類、4.1 清單、4.2 起為元件）；含字母/下標的怪號（如 4.22f₂ Fan store）一併正規化。
- **交叉引用同步**：內文 72 處 `§4.NN` 依舊→新對照表重映，連結仍指向同一元件（pre-existing 的 §typo 如 data-list 誤指 Table 維持原狀、未惡化）。
- **去重稽核（task 2）**：查 Segmented(4.22) vs Segmented control(4.23)、Composer(4.68) vs Message composer(4.66)——皆**非真重複**：Segmented 用 `.segmented__btn`(segmented.css)、Segmented control 用 `.segmented__item`(chart.css，圖表區間切換)；兩組 Composer 也是不同元件。原本看似重複是因為「散在不同位置」，重排後已相鄰，不刪併（刪會丟掉合法 demo）。可改名消歧（如 Segmented control→Chart range toggle）待使用者定。
- 驗證：79 區段、編號 4.0–4.78 連續無重複無殘字母、95 TOC 錨點全解析、捲動順序＝分組；check_ds_sync PASS。備份 /tmp/design-system.bak.html。

## 2026-06-25 · design-system.html 同類型元件合併（D infra，續）

依使用者「同一 UI 類型＋變形歸成一類」原則，把 3 組變形元件併進母類型區段（demo＋dev 細節折入，刪獨立區段＋TOC 項，母區段加「Variant · X」分隔）：
- **Split button → Button**（4.2）
- **Filter tabs → Tabs**
- **Event preview card → Preview card**
維持獨立（使用者未選）：Segmented/Segmented control、Empty stub/Empty card、Selection card/Radio card。
- 連動：區段 79→**76**、重編號 **4.0–4.75** 連續、§4.NN 交叉引用同步重映、指向已併 id 的內文/overview 連結改指母錨點（#button/#tabs/#preview-card）。overview 速查表與 design-system.md 仍保留 3 列（連母錨點）當可搜尋清單。
- 驗證（Playwright）：Button 區段內含「Variant · Split button」＋ live demo；無獨立 split-button 區段；TOC 無該項；§4.5 正確指向 Chip。check_ds_sync PASS（92 錨點全解析）。備份 /tmp/ds.preMerge.html。

- 追加（2026-06-25）：create-product 即時預覽欄標題改成「標題＋描述」兩段——標題＝**商品預覽**（新 i18n `cp.preview.heading`），描述＝**買家在 Ztor 看到的樣子**（沿用原 `cp.preview.title`）；新增 `.cp-preview-col__sub`（fs-14 muted、margin-top 4px），與區段標題（form-section__head）風格一致。

- 追加（同日）：把「即時預覽欄」promote 成元件 **`preview-column.css`**（`.preview-split` 兩欄＋`.preview-split__form`＋`.preview-col` sticky＋`__head/__title/__sub`；sticky top 用 `--preview-col-top` 預設 96）。create-product 與 create-auction 移除頁內重複的預覽欄/兩欄 CSS、markup 改用元件 class（`cp-preview-col`→`preview-col`、`cp-form-col`→`preview-split__form`、`wizard__body`+`preview-split`），頁內只留本頁寬度/上內距與 embed 隱藏。三件套：css＋design-system.html demo（Preview 群組 4.55 Preview column）＋design-system.md 條目。驗證（Playwright）：兩頁 split 584/320、preview-col sticky top 96、標題/描述正常；DS demo 渲染完整。check_ds_sync PASS（61 元件、93 錨點）。

- 追加（2026-06-26）：selection-card 已選態從元件改——
  - 橘色改成**線框**（`outline:1.5px solid var(--primary); outline-offset:-1.5px`），box-shadow 維持中性 `--shadow-card`（不再把橘色放進陰影，依使用者「陰影不該有橘色、應該是線匡橘色」）
  - icon 變體的 icon 由 `--foreground-muted`(#4D4D4D 偏深) 改 `--muted-foreground`(#737373 較淺的灰)
  - 移除 `.selection-card--icon.selection-card--active` 的重複規則（全域 active 已涵蓋）。主題挑選器（含 swatch）以 `:has()` 例外＋`outline:0` 維持原本「淡橘底＋2px 環」不變。驗證：建立流程卡 outline 1.5px 橘、陰影無橘、icon #737373；swatch 卡 outline:0、保留 tint＋環。check_ds_sync PASS。

- 追加（2026-06-26）：統一所有「選擇外匡」已選態為 **1px 橘色線框（outline）＋中性陰影**，從元件改：selection-card 1.5px→1px；radio-card（`.radio-cards .segmented__btn--active`）由 `0 0 0 2px` box-shadow 環改 `outline:1px`（radio 點維持）；register-ip `.ri-usage__card--active` 1.5px 環改 1px outline。tinted 例外（主題挑選器 swatch、ri-tag）維持原樣不動。同步 design-system 的 selection-card／radio-card spec 文字（1.5px/2px→1px outline）。cache bump→`20260626a`。驗證：type/radio 卡 outline 1px 橘、陰影無橘；check_ds_sync PASS。


## 2026-07-06 · 取貨管理拆真實獨立頁（C 撤除單頁 tab 切換 / A 新增 pickup-detail.html＋pickup-roster.html）

- 對照規格（5.1.5.11／5.1.5.13／5.1.5.15）檢查原型，發現 `pickup.html` 原是單一檔案靠 `data-pickup-view` 切 list/detail、detail 內再用 `.tabs` 切 items/roster/log——皆為 JS 內部狀態切換、無獨立網址，分享連結、加書籤、重新整理都停不到原本畫面，與規格「各自獨立頁」不符。使用者裁示修正。
- **C 撤除**：`pickup.html` 移除整個 `data-pickup-view="detail"` 區塊（場次標頭、Scanner access、items/roster/log 三個 tab-panel）與對應 JS（showDetail/showList 切換、`.tabs` 分頁邏輯、scanner-access 開關/重設/複製、roster/log 篩選）；改為真連結導覽。
- **A 新增** `pickup-detail.html`（5.1.5.15 取貨場次詳情）：場次基本資訊（名稱/狀態/地點/時間/編輯入口）、Scanner URL 與密碼（原 F6，QR/複製/重設/停用/密碼）、核銷紀錄（原 F8，篩選+匯出），三段由上到下堆疊、不用 tab；提供「查看可核銷項目與取貨/入場名單 →」連到 pickup-roster.html。
- **A 新增** `pickup-roster.html`（5.1.5.13 取貨與入場名單）：可核銷項目（原 F4，取貨商品清單+活動票券清單+加項按鈕）、取貨/入場名單（原 F5，狀態篩選+搜尋+名單列），兩段堆疊、不用 tab。
- **pickup.html** 收斂為純清單頁（F1 頁首／F2 摘要／F3 清單工作列／F4 取貨清單）：kebab「Open」改真連結 → pickup-detail.html；「可核銷項目摘要」meta 文字改連結 → pickup-roster.html；「Edit session」改直接開建立/編輯 popup（不再繞經詳情頁）；「Copy URL」改讀每列各自的 `data-pk-url`（新增於 active/scheduled 兩列），不再依賴僅存在於舊 detail view 的單一 `[data-pk-url]`。移除頁面不再使用的 `tabs.css`／`status-axes.css` 引用。
- **呈現假設**（ASSUMPTIONS UIA-047）：三頁皆為單一固定 demo 場次（Taipei signing），不依 `?id=` 動態切換內容，與其他既有 detail 頁（product-detail 等）現況一致；若要支援「分享連結直接開到指定場次」需另補依 ID 動態渲染，屬上游待確認。
- i18n：拆 `pk.row1.meta`／`pk.row2.meta`／`pk.row4.meta`（原本混著地點/件數/時間一長串）為「件數」＋新 `pk.rowN.time`；新增 `pk.f8.title`／`pk.detail.sub`／`pk.detail.viewroster`／`pk.roster.sub`。全站 i18n.js cache-buster 統一升版；`check_ds_sync` PASS（僅既有 raw-color WARN，未新增）。

## 2026-07-06 · 移除「有待設定取貨商品」提示卡（C 撤除）

- 對應規格 D120：使用者裁示移除「有待設定取貨商品（Needs Setup）」整個頁面狀態與提示，不只是先前 D113 拿掉的 F2 計數 KPI。
- `pickup.html` 移除 stickynote 提示卡（`data-pk-needsetup`，「2 sold items… use on-site QR pickup but aren't in any session yet.」）；i18n 移除 `pk.needsetup` key；連帶移除頁面不再使用的 `stickynote.css` 引用。
- 不動品項層級狀態「取貨場次待設定」（§7.2）——那是不同概念，商品/訂單頁仍看得到，只是取貨管理頁不再主動彙總提醒。
- i18n.js cache-buster 全站再升一版；check_ds_sync PASS。

## 2026-07-06 · 取貨清單改對齊規格分類（B 反饋 / A 補齊）

- 使用者發現 F3「建立取貨場次」按鈕位置不對（原本放在 F1 頁首，規格 F3 清單工作列本身就該含建立入口）——移到搜尋收合按鈕旁邊，對齊電子商店 F3 慣例（搜尋在前、建立在後，同一排）。
- F4 取貨清單逐項拆欄，不再把地點/時間/統計都塞進同一個儲存格文字：原本「Session」欄位混了地點、件數、時間、待核銷/已核銷/有問題三個統計數字；現在拆成「取貨場次（只留名稱＋可核銷項目摘要連結）」／「取貨地點與時間（合併一欄）」／「待核銷」／「已核銷」／「有問題」五個獨立欄位，對齊規格 F4 逐條列舉的欄位定義。「未到場（No-show）」摘要併入「已核銷」欄旁註記顯示（部分核銷目前無 demo 資料、暫不單獨拆欄）。
- 補齊 F4 缺漏的列操作「顯示 scanner QR code」（連到 pickup-detail.html#scanner）。
- `.product-list--pickup` grid-template-columns 由 5 欄擴為 9 欄；i18n 新增 `pk.col.loctime/pending/redeemed/issues`、`pk.rowN.loctime`（取代原本拆開的 `.meta`/`.time`）；`pk.stat.noshow` zh 由「未領取」改「未到場」，對齊規格 D119 用詞。

## 2026-07-06 · 5.1.5.13 整份退役，內容併入 scanner.html 與 pickup-detail.html（C 撤除 / A 補齊）

- 對應規格 D121：使用者裁示「取貨與入場名單」應同時出現在取貨場次詳情與手機 Scanner 兩份文件，確認後 5.1.5.13（原規劃的獨立 pickup-roster.html）整份退役，內容重新分配：
  - **可核銷項目**（原 pickup-roster.html F1）→ 併入 `scanner.html`，新增 F2 分頁，是「本場次能核銷什麼」的正式定義。
  - **取貨／入場名單**（原 pickup-roster.html F2）→ 併入 `pickup-detail.html`，新增 F4 段落，是完整管理版（搜尋、狀態篩選含未到場、標記有問題、反轉核銷，皆連 kebab 選單操作，demo 即時改變列狀態）。
  - `scanner.html` 額外補一份**唯讀簡化名單**（F3），解鎖後以 Scan／Items／Roster 三分頁呈現（`.tabs`，僅本頁內互切），供工作人員 QR 無法掃描時用姓名/票號人工核對；不含標記有問題／反轉等管理動作、不連到 order-detail.html／event-detail.html 等其他工作台頁面，對齊 scanner 既有的權限邊界規則。
- `pickup-roster.html` 刪除；`pickup.html`、`pickup-detail.html` 原本連到該頁的連結／文字改指向 `pickup-detail.html`（自身頁面）或移除。
- design-system.html 的 Mobile scanner 說明同步更新（F 編號、Items/Roster 分頁能力）；scanner.css 新增 `.scanner-screen--list`（可捲動的清單畫面，phone frame 內 overflow 由 hidden 改 auto）。
- i18n 新增 `sc.nav.*`、`sc.roster.hint`、`pk.roster.noshow`／`.flag`／`.reverse`／`.r5`；`pk.detail.sub` 文案更新、移除已不用的 `pk.detail.viewroster`。cache-buster：scanner.css 單獨升版（內容變更）、i18n.js 全站升版；check_ds_sync PASS。
