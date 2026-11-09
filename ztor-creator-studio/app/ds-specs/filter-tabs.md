> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Filter tabs

#### 總表紀錄（原 §4.1 · Filter tabs）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[filter-tabs.css](../ds-components/filter-tabs.css) **計數平鋪（2026-10-12 使用者裁示）**：`.filter-tabs__count` 不畫泡泡底色與內距，只是標籤旁一個比標籤字暗一階（`--muted-foreground`）的數字，標籤與計數間距 `--sp-6`＋`--sp-2`；已選的計數仍走橘色六成。`.filter-tabs--brand` 的計數覆寫因基底已是這個長相而退場（修飾類保留）。 **`--legend`（2026-09-01 使用者裁示）**：圖例即篩選的變體，用在圖表卡的「依方案看走勢」。每一項都是「色點＋文字」的預設樣子，**已選不套**基底的玻璃殼／字光／底部光——一排四項裡有一項發著光，會先被讀成「這一項比較重要」而不是「現在選的是它」。選中的訊號改由未選的 `opacity: .4` 承擔（hover 回 .7），整組 `justify-content: flex-end`。變淡只在真的挑了某一項時發生（呼叫端掛 `.is-filtered`）——預設的「全部」不算挑，那時候每一條線都畫著，把其餘圖例調淡等於說它們沒被畫。

Secondary status filter pills with live counts, row below the primary tabs (E-Shop F3). Base = grey-muted active (orders, auction-detail); `.filter-tabs--brand` = soft-orange active + orange/bubble-less counts (E-Shop, paired with underline type tabs); `.filter-tabs--source` = active pill tinted with the item's own `--dot` colour + optional `.filter-tabs__dot` leading dot, colourless items fall back to `--primary` (Earnings F5 revenue-source filter, colour shared with chart line + source list). **ztorUI 換裝（2026-08-28 Wave 2b）取代上述所有已選態塗色**：已選態從「橘 tint 色塊」或「灰底」統一改成「中性玻璃殼（`--ztu-glass-bg` ＋ `backdrop-filter: blur(var(--ztu-blur-glass))`）＋ 字自體發光（`--ztu-orange-hi` ＋雙層 `text-shadow`）＋ 殼底 26px `blur(4px)` 光暈（`::after` 兩層徑向漸層）」，`box-shadow: none`、無底線。顏色一律走 `var(--dot, …)`：`--source` 變體用 inline `--dot` 帶自己的色，其餘頁面沒設就落回品牌橘，computed 值不變。連帶刪除 `.filter-tabs--brand .filter-tabs__item--active .filter-tabs__count` 與 `.filter-tabs--source .filter-tabs__item--active`（含 `:hover`）兩條舊覆寫。⚠ 已選計數規則必須寫在 `--brand` 那段之後（源碼順序決勝），否則 e-shop 的已選計數會退回 `--muted-foreground` 灰

**風格裁決依據**：本規格的規則包含 STYLE-DECISIONS Q129 的裁決（索引與原文見 [STYLE-DECISIONS.md](../STYLE-DECISIONS.md)）。
