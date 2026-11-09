> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Tooltip

#### 總表紀錄（原 §4.1 · Tooltip）

- `_layer`：—
- Status：◎ Default
- CSS：—

shadcn baseline — not promoted to a project CSS file

### 變體 · 資訊卡型 Stock tip（class 沿用 .stock-tip）（原 §4.89，2026-11-09 併入）

#### 4.56 Stock tip

**`_layer`** · atom — hover/focus E-Shop 商品清單一列的「狀態」或「庫存」儲存格，浮出一張卡列出額外的庫存細節。Promoted 2026-07-23（使用者反饋：想在這兩欄看到逐選項庫存，而不用另外開補貨彈窗才看得到）。全站每一列都掛這顆——2026-07-23 當天原本只打算給多選項／組合商品，使用者追問「為什麼不是每一列都有」後擴大到單一選項商品，內容依商品是否有選項資料分兩種。

**Anatomy** — `.stock-tip`（`position:relative` 的觸發格，直接掛在既有的 `.product-list__status`／`.product-list__stock` 儲存格上）> `.stock-tip__pop`（`position:fixed` 浮卡，`role="tooltip"`）> 逐行 `.stock-tip__row`（`__name` 標籤 ＋ `__qty` 數字，`--low`／`--out` 修飾子上色）。

**資料來源與範圍** — 內容由 `e-shop.html` 的 JS 產生，依商品是否有選項資料分兩種：

- **有選項資料**（讀 `PRODUCT_MATRIX`／`PRODUCT_VARIANTS`／`BUNDLE_MEMBERS`，跟補貨彈窗共用同一份，不是另外抄一份數字）：
  - 1 軸多選項（如 tee 的尺寸）→ 逐選項一行。
  - 2 軸矩陣（如 hoodie 的顏色×尺寸）→ 攤成單一選項組合一行（如 `S/Black`）。
  - 組合商品 → 攤到成員的選項組合（如 `Coastline hoodie · S/Black`），單一選項成員只列成員名稱。
- **無選項資料**（單一選項商品，如 zine／acetate／pin）：一行——**目前庫存**（讀該列狀態，`data-status="low"／"out"` 對應上色，其餘視為健康）。原本還多一行「低庫存門檻」，2026-07-23 當天先加後拆：先加是使用者反饋「應該要列出庫存數量」（原本只顯示門檻，跟列上「急需補貨」徽章的視覺語境對不上）；同一天使用者再指示整條門檻行移除，只留庫存數量本身——`lowThr()` 與門檻換算邏輯仍保留在共用資料層（補貨彈窗還在用），只是 stock-tip 這顆浮卡不再顯示。

**為什麼定位是 JS 算、不是純 CSS `:hover`** — 這份清單在一個會捲動、頂部有 sticky 篩選列（`.list-toolbar`／`.list-status-row`）的容器裡；固定往同一個方向開，viewport 上緣的列會被 sticky 頂欄蓋到、下緣的列會超出可視範圍。改用 JS 在 `mouseenter`／`focusin` 量測觸發格的 `getBoundingClientRect()`，viewport 上半部的列往下開、下半部的列往上開，並用 `position: fixed` 直接設座標（純 CSS 看不到 viewport 位置，做不到這層判斷）。

**Class API**

| Class / modifier | Effect |
|---|---|
| `.stock-tip` | 觸發格，`position: relative`；JS 在 `mouseenter`/`focusin` 加 `.is-open`、`mouseleave`/`focusout` 移除 |
| `.stock-tip__pop` | 浮卡本體，`position: fixed`、`--shadow-float`、`--radius-md`；預設 `opacity:0; visibility:hidden`，`.is-open` 時淡入 |
| `.stock-tip__row` | 一行——`flex; justify-content:space-between`，選項標籤靠左、數字靠右 |
| `.stock-tip__qty--low` / `--out` | 數字上色 `--status-warning` / `--status-error`；預設（充足）不額外上色 |
| `.stock-tip--anchored` | 浮卡改 `position:absolute` 貼著觸發格（`top: calc(100% + --sp-6)`，寬度上限 400px）；給坐在玻璃外框（`backdrop-filter` 會把 fixed 子孫的參考框換成外框）裡的清單用，2026-09-22 D299 新增 |
| `.stock-tip--up` | 只配 `--anchored`：往上開（`bottom: calc(100% + --sp-6)`）；由消費頁 JS 依觸發格是否在視窗下半切換 |
| `.stock-tip--follow` | 只配 `--anchored`：浮卡出現在滑鼠停留的位置（2026-11-05，媒體庫成效格，UI-CHANGES 四百七十四）——游標右下方 14／18px，靠右或靠下放不下就翻到左邊或上方，跟著游標移動；座標由消費頁 JS 在 `mouseenter`／`mousemove` 寫 `left`／`top`（相對觸發格）；鍵盤聚焦沒有游標，不寫座標、退回貼格位置；浮卡 `pointer-events:none` |

**Token usage**（→ Pillar 2 Role）

- bg `--card` · shadow `--shadow-float`（E3，跟 dropdown／readiness pop 同一階）· radius `--radius-md` · text `--foreground` / `--foreground-muted`（標籤）· status `--status-warning` / `--status-error` · font `--fs-12` / `--fw-medium` / `--lh-normal`

**Notes / gotchas**

- **兩個觸發格（狀態欄、庫存欄）內容目前故意一樣**——都是同一份逐選項清單，沒有依欄位分流成「狀態摘要」跟「數字明細」兩種內容（2026-07-23 使用者裁示先求一致，之後要分流再回來改）。
- **列徽章是「急需補貨」（`e-shop.row.low`）時，選項清單只留 `low`／`out` 的選項**（2026-07-23 使用者裁示）——這種列 hover 是要立刻看到哪裡出問題，健康（`ok`）的選項不佔位置；徽章是其他狀態（Live／Sold Out）時清單維持完整、不過濾。判斷依據是該列狀態格裡有沒有 `[data-i18n="e-shop.row.low"]`，不是看選項本身的 status——避免徽章語意以後改了但濾掉的條件沒跟著同步。**這條規則不適用單一選項商品**——那條只有「目前庫存」一行，跟「選項健不健康」無關，不會被這條規則濾掉。
- **`.stock-tip__pop` 是空殼，內容由 JS 在頁面載入時一次性填入兩個觸發格**（狀態欄與庫存欄各自的 `.stock-tip__pop`），不是每次 hover 才重算內容——只有座標是每次 hover 重算。
- **`data-i18n` 不能掛在 `.stock-tip` 本身**：i18n.js 用 `el.innerHTML = v` 套翻譯，會連 `.stock-tip__pop` 這個子節點一起清掉（同一個坑 2026-07-21 在 dropdown icon 上踩過一次）。庫存欄的可翻譯文字（如 `42 / ∞`）要包一層 `<span data-i18n="…">`，`.stock-tip__pop` 當它的手足、不當它的子節點的子節點。
- **別在掛了 `.stock-tip` 的儲存格上留原生 `title` 屬性**：acetate 列的庫存欄原本有 `title="In stock / edition cap"`（限量版說明文字），加了 `.stock-tip` 後兩套 hover 提示同時掛在同一格上會互相競爭、疊出瀏覽器原生 tooltip 跟自訂浮卡兩層（2026-07-23 使用者截圖抓到後移除）。

**Usage** — 掛在 E-Shop 商品清單每一列的「狀態」／「庫存」儲存格；別的頁面若要做類似「hover 看明細」，先確認資料是否真的有選項層級（或其他值得補充的資訊如門檻）可拆，沒有就別硬套。**第二個消費者（2026-09-22，D299）**：商店設定優惠碼清單的「範圍」欄——碼綁了多件時格子只寫件數（`{n} 項`），hover／focus 浮出綁了哪幾件；一列＝名稱（放 `__qty`，主墨色）＋種類（放 `__name`，次墨色：單售／組合包／活動票種／品項類型），走 `--anchored`（清單外框是玻璃、fixed 定位會跑掉）。件數文案由頁面在 `i18n:applied` 重填（i18n 沒有 `{n}` 參數）。**第三個消費者（2026-11-02，D505）**：媒體庫成效第一格（`.vault-bento__tile` 本身掛 `.stock-tip.stock-tip--anchored`、`tabindex="0"`、`aria-describedby`）——格內常駐只留「N 位粉絲・佔全部 M 位 X%」，四分級「已／總」改成滑過或 focus 才浮出（一列＝分級名稱放 `__name`＋「已/總」放 `__qty`）；觸控點一下會 focus 也會打開，Esc 收起。開關由 `js/media-vault.js` 的 `wireTip()` 掛。

**Do & Don't**

- ✅ 有選項資料的商品，內容一律從既有的選項資料即時產生，不手key第二份數字。
- ❌ 別把 `.stock-tip__pop` 直接當某個 `data-i18n` 元素的子節點塞——會被 i18n 的 `innerHTML` 覆寫清掉。

**Code example**

```html
<div class="product-list__cell product-list__stock stock-tip" role="cell" tabindex="0">
  <span data-i18n="e-shop.row2.stock">42 / ∞</span>
  <div class="stock-tip__pop" role="tooltip">
    <div class="stock-tip__row"><span class="stock-tip__name">S</span><span class="stock-tip__qty stock-tip__qty--low">2</span></div>
    <div class="stock-tip__row"><span class="stock-tip__name">M</span><span class="stock-tip__qty">18</span></div>
  </div>
</div>
```

**Consumers** — `e-shop.html`（Products 全部 5 列＋Bundles 兩列）；`store-settings.html`（優惠碼清單「範圍」欄，`--anchored`，2026-09-22）。

**CSS** — [`stock-tip.css`](../ds-components/stock-tip.css)

##### 總表紀錄（原 §4.1 · Stock tip）

- `_layer`：🟢 atom
- Status：✓ App
- CSS：[stock-tip.css](../ds-components/stock-tip.css)

E-Shop 商品清單「狀態」／「庫存」欄 hover/focus 浮出的資訊卡：多選項商品攤到單一選項組合、組合商品攤到「成員 · 選項組合」；單一選項商品顯示目前庫存一行（原本還有低庫存門檻，2026-07-23 使用者裁示移除）。列徽章為「急需補貨」時，選項清單只留真的需要補貨的項目（此規則不影響單一選項那一行）。定位由 JS 算（`position: fixed`），viewport 上半部往下開、下半部往上開，避免被 sticky 頂欄擋到或超出視窗。詳見 §4.56
