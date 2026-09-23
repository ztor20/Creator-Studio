# Site Governance

## 版本狀態

| 資料夾 | 狀態 | 說明 |
|---|---|---|
| `app/` | **唯一開發版（`main`）** | 2026-09-23 起資料夾名稱固定為 `app`，不再逐版改名；版本號改記在文件與分支名稱。目前對應 r2.4 世代。所有新的編輯、部署與發版都以這個資料夾為準。 |

舊版 `r2.1`、`r2.2` 已從 `main` 移除，改用標籤 `archive/r2.1`、`archive/r2.2` 存檔（保留最後狀態，不再修改；要看舊版行為才切這兩個標籤）。`r2.1` 到 `r2.2` 的差異報告見 `../docs/r2.1-外部改版差異-20260729.md`。

交付給開發依據 `phase1` 分支：從 `main` 切出、凍結、只收明確要進 Phase 1 的修正，每次升版記一筆到 `PHASE1-CHANGES.md`。之後每期交付同樣輪替——範圍確定 → 在「下一版預覽」確認 → 從 `main` 切 `phaseN` 分支 → 開新網址。

`site/` 只保存 UI 呈現、設計系統與工程實作。所有版本都遵守同一條權威鏈：

`requirement/` → `documents/decisions.md` → `documents/` → `site/`

- `BUILD-SPEC.md`：該版本的呈現與工程快照。
- `ASSUMPTIONS.md`：呈現假設、產品缺口與實作偏差。
- `SPEC.md`：舊連結相容頁，不是產品規格。

任何 site 版本都不得把畫面、截圖、互動或既有程式靜默反向同步成產品規則。發現缺口時先更新 `ASSUMPTIONS.md`，經上游核准後再修改 UI。

## 共編流程（GitHub: ztor20/Creator-Studio，子目錄 `ztor-creator-studio/`）

本資料夾是獨立 git repo，採 **分支 + Pull Request** 共編，`main` 只放穩定版、不直接推。

改完跑：

```bash
./collab.sh "簡短變更說明"
```

它會：開 `edit/<時間戳>` 功能分支 → commit → push → 自動開 PR，最後印出 PR 連結。到 GitHub 審查後合併進 `main`。

注意事項：

- **推之前先同步**：若 `main` 被別人推進過，PR 會在 GitHub 上提示衝突；本機可 `git switch main && git pull` 再開新分支。
- **絕不對 `main` 強推**（`git push -f`）。建議在 repo 設定把 `main` 設為 protected branch。
- **同檔同時改最易衝突**：`app/js/i18n.js`、`shared.css`、`design-system.html` 是多頁共用大檔，先講好分工。
- **認證**：Yves 本機由中央倉 `ZTOR20_GH_TOKEN` 提供；協作者用各自的 `gh auth login`。token 不進 repo。

