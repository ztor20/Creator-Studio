# Wave 3 全站巡檢 · 總表

> 2026-08-28。三位巡檢員並行掃 58 頁（design-system.html 不列入，另由 check_ds_sync 機器驗），詳細逐頁記錄見 `wave3-巡檢-batch1/2/3.md`。判準：STYLE-DECISIONS Q77–Q82＋三頁黃金樣板（e-shop／product-detail／create-product）。

## 統計

| 判定 | 頁數 | 說明 |
|---|---|---|
| A 壞掉 | 0 | 全站零破版、零 console error |
| B 沒跟上 | 3 支元件檔 | info-banner（後升級 C）、admin-ip-bank-table、brand-card——都是元件層一改全站生效 |
| C 品味待決 | 8 題 | 見下節 |
| OK | 其餘全部 | 共用 token／元件連帶生效，符合新語彙 |
| 未能巡檢 | create-campaign.html | devtools 版本閘導向 create-project（與 r2.2 位元組相同＝既有行為，非換裝回歸） |

## B 類處置

- `admin-ip-bank-table.css`（admin 三頁主表格）與 `brand-card.css`（brand-campaigns 品牌磚）：照 Q77 玻璃配方修復（2026-08-28 派工執行）
- `info-banner.css`：升級成 C-1（見下）

## C 類待裁決清單

### C-1 實色橘表面：info-banner 與 kpi--hero

- `.info-banner`（橘實色說明列，7+ 頁使用）與 `.kpi--hero`（earnings 系頁首主角 KPI 橘卡）都與 Q77「表面中性玻璃、顏色只在光與文字」字面衝突
- 但 `kpi.css` 內留有 2026-07 的明確舊裁示：「實色橘代表主角／主要動作」——這是新舊兩條已裁決規則打架，須使用者裁決誰蓋過誰
- 選項：全玻璃化／保留兩者為刻意例外（補 STYLE-DECISIONS）／hero 保留、banner 玻璃化
- **裁決結果（2026-08-28，STYLE-DECISIONS Q83／Q84）**：hero 保留、banner 玻璃化。`.kpi--hero` 一個位元組不動（Q83，Q77 的明訂例外）；`.info-banner` 面改中性玻璃、「注意」改由 leading icon 承擔橘色＋柔光（Q84）。**已執行**——`ds-components/info-banner.css` 全站生效，`ds-components/kpi.css` 未改動。

### C-2 admin 後台子系統的背景漸消範圍

- ip-bank-reporting 等表格密集的 admin 頁沒掛 `.list-dock`，星空不會照 Q81 向下漸消；要不要把 admin 子系統納入 list-dock 慣例屬範圍裁決
- **裁決結果（2026-08-28，STYLE-DECISIONS Q85）**：納入。`shared.css` 漸消觸發條件擴到 `.list-dock, .admin-table-wrap`。**已執行**——admin-ip-bank／admin-platform-fees／admin-video-review／ip-bank-reporting／store-settings 五頁生效，store-settings 實測合理性有結論（同一支表格元件、一併漸消不突兀）。

### C-3 creator-detail 無卡表單

- 兩段表單直接落在星空上、只靠分隔線分區（非舊語彙殘留，是本來就沒有卡）；要不要補玻璃卡圈起來
- **裁決結果（2026-08-28，STYLE-DECISIONS Q86）**：補玻璃卡。**已執行**——`creator-detail.html` 的 Account source／Shop and contact 兩段 `.form-section` 加 `form-section--outlined`；Import events（第二分頁）不在範圍，維持無卡。

### C-4 fans-guide 編輯風說明頁

- 獨立編輯敘事版型（橘時間軸），要不要拉進主語彙、或維持自成一格
- **裁決結果（2026-08-28，STYLE-DECISIONS Q87 範圍裁決）**：維持自成一格。**不執行**。

### C-5 funding-simulate 內部試算 demo

- 頁面自標「demo，正式版不會出現」；若不進正式版可不熔接
- **裁決結果（2026-08-28，STYLE-DECISIONS Q87 範圍裁決）**：不熔接。**不執行**。

### C-6 fan-analytics 高密度資料頁的文字對比

- 次要文字色階在資料密集區偏弱（渲染正確、非 bug），要不要整體拉開對比屬品味
- **裁決結果**：本輪未裁決，不在使用者本次的 C 類裁決範圍內，留待下輪。

### C-7 頁尾版本字樣

- ip-bank-reporting／manage-ip 頁尾寫死「R 2.1 prototype」，內容非樣式，建議另行更新
- **裁決結果（2026-08-28）**：更新。**已執行**——全站 grep 命中 7 頁（admin-ip-bank／admin-platform-fees／admin-video-review／creators／index／ip-bank-reporting／manage-ip），「R 2.1 prototype」→「R 2.3 prototype」，全站零殘留。

### C-8 section-test／design-layers／create-event-legacy

- 測試與 legacy 頁，低優先，建議不熔接、维持現狀
- **裁決結果（2026-08-28，STYLE-DECISIONS Q87 範圍裁決）**：維持現狀。**不執行**。

## 巡檢方法論備忘

- 進場動畫（`.reveal.is-in`）截圖太早會誤判成破圖——判定前先等動畫或用 getComputedStyle 交叉驗證（batch 3 實例）
- `localStorage ztor.devstate.version` 會整個 origin 共用，卡在 `deck-for-sony` 時 earnings 會被導向；巡檢前先確認為 `full`（batch 2 實例）
- 覆蓋限制：只測 1440×900 桌面版；子分頁與狀態切換未窮盡（各 batch 檔尾有逐項聲明）
