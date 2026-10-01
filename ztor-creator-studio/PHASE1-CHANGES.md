# PHASE1-CHANGES — Phase 1 凍結版改版紀錄

這個分支（`phase1`）是 Creator Studio 原型 **Phase 1 交付依據**。日常編修都在 `main`；只有明確要進 Phase 1 的修正才會搬進本分支，每搬一次就在這裡加一筆並升版號。開發看這一份就知道凍結版改了什麼、什麼時候改的。

## 怎麼看

- 站台檔在 `app/`，開啟後版本鎖死在 Phase 1（不可切換、網址參數無效）。
- 功能範圍以 `app/feature-scope-map.md` 各模組功能表的 🟢 欄為準（切出當時的狀態）。
- 固定網址：https://ztor-cs-phase1.vercel.app

## 版本

### v1.3 · 2026-10-01

- 來源：`main` 的 D339 改動（隨 PR #289 進入 `main`），只搬程式與設計系統文件；`ASSUMPTIONS.md`、`UI-CHANGES.md`、`requirements-map.md` 三份紀錄檔與凍結版已分歧，未搬（完整紀錄看 `main`）。
- 內容：一個商品同時只屬於一個取貨場次。建立或編輯取貨場次時，商品下拉中已綁定其他場次的商品仍列出但不可選，右側標「已綁定」（英文 Assigned），排在可選商品之後；編輯本場次時，本場次自己的商品照常可移除。Combobox 元件新增停用選項（`.combobox__opt:disabled`＋`.combobox__opt-tag`），設計系統文件與元件圖鑑同步。
- 示範資料：取貨商品樣本新增一件屬高雄場的海報，建立與編輯兩種情境都看得到停用列。
- 功能表：無新增（屬既有 O26「建立取貨場次」）。

### v1.2 · 2026-09-29

- 來源：`main` 的 D333 改動（PR #286），只搬程式與設計系統文件；`ASSUMPTIONS.md`、`UI-CHANGES.md`、`requirements-map.md` 三份紀錄檔與凍結版已分歧，未搬（完整紀錄看 `main`）。
- 內容：訂單詳情金額拆解的平台費可展開——收合顯示合計（單一費率附費率、多種費率寫「多種費率」），展開依費率類別逐列列出計費基準與平台費；支付費維持單列。新增混合費率示範訂單 #ZT-10489（實體 15%＋數位 15%＋含票券組合包 5%），不帶 `?id=` 打開訂單詳情時預設就是這一筆。
- 功能表：新增 O32「平台費展開」🟢 Phase 1。

### v1.1 · 2026-09-24

- 來源：`main` 的 D324 改動（PR #281），以 `phase1-port.sh` 搬入。
- 內容：Admin Creator Studio 列入 Phase 1——Creator 管理（名冊＋creator 詳情）、創作者活動管理、影片上架審核、Admin IP Bank（兩頁）、IP Bank Reporting、平台費率設定；帳戶設定頁（`settings.html`）同時列入。
- 不變：平台優惠設定仍只在最終版（D279），Phase 1 看不到。頁內指向 Phase 1 以外內容的連結（活動詳情、IP 詳情等）照樣隱藏。
- 要看 Admin 頁：開面板（Alt＋右鍵）把「Role · 身分」切到 Admin。

### v1.0 · 2026-09-23

- 來源：自 `main` 切出（monorepo commit `351d96d`，PR #280 合併後）。
- 涵蓋產品決策：`documents/decisions.md` 至 D315（2026-09-23）。
- 鎖定改動（只在本分支）：`app/js/devtools.js` 版本固定 `p1`、面板不提供版本切換、首次進站不跳版本選擇；`app/feature-scope-map.md` 開發版本配置表只留 `p1` 一列。
- 固定網址：https://ztor-cs-phase1.vercel.app（部署 repo `lern2317/ztor-cs-phase1`，由 `deploy-phase1.sh` 推送）
