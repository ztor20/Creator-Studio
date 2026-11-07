> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Shell 補角／接縫（頁級技法）

#### 總表紀錄（原 §4.1 · Shell 補角／接縫（頁級技法））

- `_layer`：⚪ utility
- Status：— SiteSpecific
- CSS：[e-shop.html](../e-shop.html)

分割/捲動容器的圓角補位技法，與 `.edge-shadow`、`.alert--page-top::after` 同族，目前寫在 e-shop.html `<style>`（僅該頁用，隨 preview split 版式）：**corner-mask** 用同色 radial-gradient 補 `.main` 捲動容器右上被裁的方角（吃 `--surface-shell`／`--radius-shell`，公式與 `.alert--page-top::after` 一致、閾值統一 `-1px`）；**seam-shadow** 用透明真圓角輔助層投 `--shadow-seam`、蓋在接縫上（避免方角容器 box-shadow 走方角）。屬 shell 版式膠水、非通用元件，待其他分割頁複用時再抽 utility
