> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### VIP card

#### 總表紀錄（原 §4.1 · VIP card）

- `_layer`：🟠 organism
- Status：✓ App
- CSS：[vip-card.css](../ds-components/vip-card.css)

數位「會員卡（Membership / VIP card）」卡面自訂（spec 5.1.5.2 §4.2 F11.2）：`.vip-card`[data-vip-card]＞`__settings`（`.segmented.radio-cards` Text/Image＋`.input`名稱／`.upload-tile` logo）＋`__preview`（`__frame`公版場景＞`__plate`霧面卡＞`__logo`/`__logo-img`/`__plate-sub`）。Text→文字合成、Image→PNG logo 合成；`.vip-card--image` 切模式。`partials/vip-card.js` 綁定、emit `vipcard:change`。公版為 CSS 近似固定藝術（frame 漸層裸色＝記錄在案例外，見下）。呈現層 demo
