> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Rank bars / source breakdown ✝

**✝ 退場（2026-11-09）**：零消費。Q167（同一種清單任務只留一種元件）後，收入來源佔比改 `split-bar`（earnings、earnings-overview），項目詳情的地區／串流平台／OTT 排行改 `perf-rank`（project-detail），站上已沒有頁面用 `.rank-bars`。`chart.css` 的 rank-bars 段落留墓碑；展示頁卡片改成墓碑說明、目錄移除。新畫面照 5.1.15 清單類型第 4 類：佔比 `split-bar`、排名 `perf-rank`。來源圖例 `.source-list` 不受影響，仍在 Chart（§4.24）。

#### 總表紀錄（原 §4.1 · Rank bars / source breakdown）

- `_layer`：🟡 molecule
- Status：✝ 退場（2026-11-09）
- CSS：[chart.css](../ds-components/chart.css)

Ranked bar rows and source distribution legends
