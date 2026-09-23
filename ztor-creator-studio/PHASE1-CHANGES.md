# PHASE1-CHANGES — Phase 1 凍結版改版紀錄

這個分支（`phase1`）是 Creator Studio 原型 **Phase 1 交付依據**。日常編修都在 `main`；只有明確要進 Phase 1 的修正才會搬進本分支，每搬一次就在這裡加一筆並升版號。開發看這一份就知道凍結版改了什麼、什麼時候改的。

## 怎麼看

- 站台檔在 `app/`，開啟後版本鎖死在 Phase 1（不可切換、網址參數無效）。
- 功能範圍以 `app/feature-scope-map.md` 各模組功能表的 🟢 欄為準（切出當時的狀態）。
- 固定網址：見下方各版本條目。

## 版本

### v1.0 · 2026-09-23

- 來源：自 `main` 切出（monorepo commit `351d96d`，PR #280 合併後）。
- 涵蓋產品決策：`documents/decisions.md` 至 D315（2026-09-23）。
- 鎖定改動（只在本分支）：`app/js/devtools.js` 版本固定 `p1`、面板不提供版本切換、首次進站不跳版本選擇；`app/feature-scope-map.md` 開發版本配置表只留 `p1` 一列。
- 固定網址：（部署後補）
