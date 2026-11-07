> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Archived gate

#### 總表紀錄（原 §4.1 · Archived gate）

- `_layer`：🟢 atom
- Status：✓ App
- CSS：[partials/archived-gate.js](../partials/archived-gate.js)

封存態唯讀的事件層閘門（主規格 §7.14「封存與不可刪除」· D284／D288，2026-09-18）：純 JS 元件 `partials/archived-gate.js`，**無自帶 CSS、不畫任何東西**。`window.ZtorArchivedGate.install(rootEl, { block, allow })`——`rootEl` 帶 `data-archived` 時，凡是會改資料的控件（預設清單：`input`／`textarea`／`select`／`.switch`／`.segmented__btn`／`.radio-list__item`／`.radio-card`／`.zcheck`／`.chip__remove`／選片器的 `[data-fp-add]`／`[data-fp-remove]`／`.upload-tile`／`[data-linkf-reset]`，頁面可用 `block` 追加）在 capture 階段被攔下（click／keydown Enter・Space／beforeinput／input／change 一律 `stopImmediatePropagation`＋`preventDefault`），到不了頁面 handler；導覽與查看類永遠放行（`a`／`summary`／分頁 `.tabs__item`／`.section-nav__item`／`[data-rowdis]`／`.leave-dialog`，頁面可用 `allow` 追加，例如「解除封存」鈕——2026-09-22 · D298 起已封存頁唯一的動作，按下回到已下架）。為什麼要有：D288 規定封存唯讀涵蓋所有分頁與逐列操作，三個細節頁原本各自「藏掉會改資料的入口」，藏不到的（逐列「⋯」的上架開關與鎖定、關聯分頁的選片器）就漏了；閘門在事件層兜底，既有隱藏／停用保留當第一道。consumer：product-detail.html／bundle-detail.html／auction-detail.html。demo 卡見 `design-system.html` §4.202
