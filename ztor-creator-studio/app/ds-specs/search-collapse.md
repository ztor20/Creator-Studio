> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Search collapse

#### 總表紀錄（原 §4.1 · Search collapse）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[search-collapse.css](../ds-components/search-collapse.css)

工具列收合式搜尋（電子商店 F3）：收合只見放大鏡、`.is-open` 滑開成 `.field-pill`（內層重用 field-pill）；`.search-collapse__toggle`/`__field`/`__close`；開合由頁面 JS 切換、respects reduced-motion
