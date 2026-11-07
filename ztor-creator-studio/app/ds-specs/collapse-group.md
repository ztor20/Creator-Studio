> 元件規格。總則、token 與元件總表見 [design-system.md](../design-system.md)。

### Collapse group

#### 總表紀錄（原 §4.1 · Collapse group）

- `_layer`：🟡 molecule
- Status：✓ Project
- CSS：[collapse-group.css](../ds-components/collapse-group.css)

一整組欄位收在盒子裡，折疊時只留一行：chevron ＋ 標題 ＋ 盒內值的一行摘要（`10/02（五）· 19:00–21:30 · 18:00 開場`）。首個用途＝活動的場次（2026-08-13 使用者裁決，三個版型比過選 A 案「一行摘要」；B 案三欄事實列與 C 案徽章列同輪否決，demo 留在 `docs/session-collapse-demo.html`）。**可點的是整列**（`.collapse-head__toggle` 吃滿剩餘寬度）——要瞄準 16px 的 chevron 才點得開，等於沒有入口；列尾的次要動作（移除）放在切換鈕**外面**，按鈕不能包按鈕。**展開時摘要收起**（CSS 處理）：同一組數字不在畫面上出現兩次。摘要單行截斷不換行，換行會把標題列撐成兩層、失去「一行掃過去」的意義。`--todo` 修飾類給還沒填完的那一組（警示墨色「日期尚未設定」）。**行為（同輪一併裁定）**：只有一場不折（盒子也不畫）／多場預設全折／剛新增的那一場自動展開／可同時展開好幾場（不是手風琴，對照兩場時間是常見動作）。展開狀態存在消費頁的 Set 而不是 DOM——清單會整段重繪，寫在 DOM 上會被洗掉。消費頁：create-event（場次那一步，定點與巡迴兩種盒）、event-detail（場次分頁，切換鈕掛 `data-view-safe` 讓檢視模式也開得了）。**展開後的列距歸 `.collapse-body`**（2026-10-12 使用者指出多場展開時日期列／時間列／跨日開關列／提前入場時間列黏在一起，Q103）：body 展開時是 flex 直排、`gap: --sp-20`（＝只有一場、欄位直接攤在盒裡時的列距，單場多場同一把尺），直屬的 `.form-grid`／`.field` 歸零下外距；外層盒的 gap 只發得到 body 本身、碰不到裡面的列，所以節奏要由 body 自己持有
