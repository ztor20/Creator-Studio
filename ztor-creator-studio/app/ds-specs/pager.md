> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Pager

#### 總表紀錄（原 §4.1 · Pager）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[pager.css](../ds-components/pager.css)

數字分頁列（`.pager` 容器＋`.btn.btn--ghost.btn--sm` 頁碼，目前頁 `aria-current="page"` 實色底＋`.pager__ellipsis`）。頁碼沿用 Button 元件、不另造控件。Token `--primary`／`--primary-foreground`／`--muted-foreground`／`--sp-*`。**行為住在 `js/pager.js`**（2026-08-10 從 `partials/finance-overview.js` 抽出）：`window.ztorPager.mount(getRows, size, nav)`，回傳 `render(page)` 供資料重畫後再呼叫。呼叫端只給「目前要分頁的 `<tr>` 陣列」的 getter、每頁筆數與 `.pager` 容器；模組只管哪幾列現在看得見，不接管資料。只有一頁時不畫頁碼列。Evidence／使用頁：earnings-sony（項目表 8/頁、提領歷史 6/頁，由 `partials/finance-overview.js` 呼叫）、earnings ＋ earnings-sony 的內容收益·貼文報告明細（5/頁）
