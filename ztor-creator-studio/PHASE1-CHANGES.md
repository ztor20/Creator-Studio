# PHASE1-CHANGES — Phase 1 凍結版改版紀錄

這個分支（`phase1`）是 Creator Studio 原型 **Phase 1 交付依據**。日常編修都在 `main`；只有明確要進 Phase 1 的修正才會搬進本分支，每搬一次就在這裡加一筆並升版號。開發看這一份就知道凍結版改了什麼、什麼時候改的。

## 怎麼看

- 站台檔在 `app/`，開啟後版本鎖死在 Phase 1（不可切換、網址參數無效）。
- 功能範圍以 `app/feature-scope-map.md` 各模組功能表的 🟢 欄為準（切出當時的狀態）。
- 固定網址：https://ztor-cs-phase1.vercel.app

## 版本

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
