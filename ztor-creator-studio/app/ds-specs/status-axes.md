> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Status axes

#### 總表紀錄（原 §4.1 · Status axes）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[status-axes.css](../ds-components/status-axes.css)

訂單兩條獨立狀態軸（spec 5.1.5.3.1 §2.2 / PCR-001）：履約 vs 付款·結算，不併成單一 badge。`.status-axes`＝清單列並排 badge；`.status-axes--split`＝詳情頁首一列，每軸各自是一個內嵌的 `.status-axes` 群組（混合訂單的履約軸得以在同一組並列兩顆徽章）、群組間以 `border-left` 細線分隔。**2026-08-07**：原 `.status-axes--labeled`／`.status-axis`／`.status-axis__label`（每軸上方大寫標籤）退場——分隔線已達成 PCR-001 的「兩軸不混成一顆徽章」，徽章文字本身已說明所屬軸，標籤重述同一件事，且「收入結算」與徽章「已付款」用詞不一致。用於 order-detail §2.2（orders 清單改為兩軸各自成欄，見 product-list--orders）
