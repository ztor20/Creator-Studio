> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Tag input

#### 總表紀錄（原 §4.1 · Tag input）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[tag-input.css](../ds-components/tag-input.css)

建立商品商品標籤（spec 5.1.5.2 §4.4 F10）：`.tag-input__field` 內已選/自建標籤（`.chip--removable`）＋無框輸入 `.tag-input__entry`＋建議 `.chip-group`；組合自 chip，可重用於專案/粉絲標籤。已選標籤 chip 用**品牌橘 tint**——Q19（2026-07-17）當初為此寫的 `.tag-input .chip--active` 專屬覆寫已於 **2026-07-27 Q8-A 刪除**：全站 `.chip--active` 本身就是橘了，覆寫變成純重複。Q19 的意圖（標籤＝已套用的分類，用橘標）完全保留，只是改由基底承接；順帶修掉原覆寫 `color: var(--primary)` 在亮色模式僅 1.92:1 的對比 bug（基底走 `--selected-ink`）。**2026-09-11 表面照 DS**（使用者指出「這個要照 DS，且圓角也和裡面的標籤不一致」）：欄位是輸入控件，底與邊線跟 `.input` 走——`--ztu-film` 薄膜底、box-shadow 畫的 1px `--border` 髮線、`--radius`、同一種 focus 環（舊值：實色 `--card` 底＋真 border＋outline 焦點環）；**欄內** chip 改吃欄位的 `--radius`（Q111：坐在欄位裡的是已輸入的值，不是 Q1 那種可點選的 pill），欄位外的建議 `.chip-group` 維持 pill。Combobox 重用同一個欄位，一併生效
