> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Spec row

#### 總表紀錄（原 §4.1 · Spec row）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[spec-row.css](../ds-components/spec-row.css)

可重複的詳細規格列（spec 5.1.5.2 §4.1② 建立商品／5.1.5.1 §2.3 商品細節）：`.spec-row`（grid 1fr 1fr auto）＞規格名稱 `.input`＋規格值 `.input`＋行尾 `.btn--icon` 刪除；多筆垂直堆疊，＋ 新增規格加空列。2026-06-29 自 create-product 內聯 `.cp-spec-row` promote、product-detail（D095）共用
