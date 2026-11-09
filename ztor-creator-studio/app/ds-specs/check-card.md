> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Check card ✝

> ✝ 2026-11-09 退場：沒有任何產品頁連結，只剩展示頁與 demo 在用。CSS 留墓碑、展示卡已移除；新需求別再用它。

#### 總表紀錄（原 §4.1 · Check card）

- `_layer`：🟡 molecule
- Status：✓ App
- CSS：[check-card.css](../ds-components/check-card.css)

Multi-select pill card (Cosmos layout, Q71 定案 2026-08-25 — demo-eshop-styles.html :646-701). `.check-cards` 兩欄等寬 grid，每張 `.check-card` 藥丸左文字、右一個 28px 圓形 `.check-card__mark`（未選＋、已選勾）；`.check-cards--sm` 小尺寸變體改隨內容寬、換行排列（38px 藥丸、24px 標記）；可選 `.check-card__group` 分組小標與 `.check-card__count` 計數列，兩者皆跨兩欄。已選（`.check-card--on`）整格染 `color-mix(--primary 28%, transparent)`＋文字轉 `--selected-ink`——與姊妹元件 [Radio card](./radio-card.md)（單選，底不變＋右上橘點）刻意分開兩種已選畫法（Q74 定案：多選一次會亮好幾格，需要比橘點更強的訊號；單選永遠只亮一格，橘點就夠）。狀態：`:disabled`＝來源鎖定（2026-09-29 新增，bookyay 帶入後鎖定）——未選的文字與標記降到 `--locked-field-ink`、已選維持原對比、`cursor:not-allowed`，與 segmented 的來源鎖定（field-source-tag.css）同一語彙；每張卡掛 `role="checkbox"`＋`aria-checked`。消費頁：~~create-event.html 步驟 2 的活動語言（D328，`.check-cards--sm`、七選項複選，2026-09-29 首個產品頁消費者）~~ **2026-09-30 起零消費——⚠ 退場候選**：活動語言依使用者指定改為下拉複選（D340，Zselect `--multi`），本元件已無產品頁消費者（check_ds_sync 檢查 11 以 WARN 標出）。依治理規則不直接刪檔，退場與否待使用者裁決（元件庫巡檢／墓碑流程）
