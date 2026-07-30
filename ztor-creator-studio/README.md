# Site Governance

## 版本狀態

| 版本 | 狀態 | 說明 |
|---|---|---|
| `r2.2` | **開發中（預設）** | 2026-07-29 起的唯一開發版本。所有新的編輯、部署與發版都以這個資料夾為準。 |
| `r2.1` | **已凍結（唯讀）** | 2026-07-29 凍結，保留作對照存檔，不再修改。要看舊版行為才開它。 |

`r2.2` 的起點是 `r2.1` 加上外部協作者 2026-07-29 交付的改版快照（7 個新頁、19 支新元件、字型與顏色規則翻修）。差異報告見 `../docs/r2.1-外部改版差異-20260729.md`。

`site/` 只保存 UI 呈現、設計系統與工程實作。所有版本都遵守同一條權威鏈：

`requirement/` → `documents/decisions.md` → `documents/` → `site/`

- `BUILD-SPEC.md`：該版本的呈現與工程快照。
- `ASSUMPTIONS.md`：呈現假設、產品缺口與實作偏差。
- `SPEC.md`：舊連結相容頁，不是產品規格。

任何 site 版本都不得把畫面、截圖、互動或既有程式靜默反向同步成產品規則。發現缺口時先更新 `ASSUMPTIONS.md`，經上游核准後再修改 UI。

## 共編流程（GitHub: ztor20/ztor-creator-studio）

本資料夾是獨立 git repo，採 **分支 + Pull Request** 共編，`main` 只放穩定版、不直接推。

改完跑：

```bash
./collab.sh "簡短變更說明"
```

它會：開 `edit/<時間戳>` 功能分支 → commit → push → 自動開 PR，最後印出 PR 連結。到 GitHub 審查後合併進 `main`。

注意事項：

- **推之前先同步**：若 `main` 被別人推進過，PR 會在 GitHub 上提示衝突；本機可 `git switch main && git pull` 再開新分支。
- **絕不對 `main` 強推**（`git push -f`）。建議在 repo 設定把 `main` 設為 protected branch。
- **同檔同時改最易衝突**：`r2.2/js/i18n.js`、`shared.css`、`design-system.html` 是多頁共用大檔，先講好分工。
- **認證**：Yves 本機由中央倉 `ZTOR20_GH_TOKEN` 提供；協作者用各自的 `gh auth login`。token 不進 repo。

