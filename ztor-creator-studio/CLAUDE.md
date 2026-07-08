# CLAUDE.md — ztor Creator Studio 原型 site（共編規則）

ztor Creator Studio 的原型 site。**2026-06-18 起站點搬進 monorepo [`ztor20/Creator-Studio`](https://github.com/ztor20/Creator-Studio)，內容位於該 repo 的 `ztor-creator-studio/` 子目錄（git subtree）；舊獨立 repo `ztor20/ztor-creator-studio` 已封存（唯讀）。** 本機 vault 的 `site/`（就是這層）仍是你編輯的工作目錄；發版採**分支 + Pull Request**、`main` 只放穩定版、**不直接推**。本檔與同目錄 `AGENTS.md`（給 Codex）維持相同規則。

## 編輯 → 提交流程（鐵律）

- **開工前先跑 `./pull.sh`**：智慧三方同步——你沒動過的檔自動更新成 monorepo 最新版、你的編輯一律保留，只有「你和同事改到同一檔」才列出來請你決定（覆寫前都先備份到 `.git/collab-backup-…`）。確保在最新基礎上編輯（collab.sh 是全量發版，本機落後就會洗掉他人剛合併的改動）。未追蹤檔（`fonts/`、scratch）不會被碰；首次執行只建基準。
- **每次編輯完 `site/` 的檔，主動詢問使用者「要 commit 嗎？」**——不要自動 commit，先問。
- 在 vault `site/`（本層）編輯；**不要直接改 monorepo 的 `ztor-creator-studio/` 子目錄**（collab.sh 會「清空再灌」同步、直接改動會被覆蓋）。
- 使用者要 commit 時，跑 `./collab.sh "<變更說明>"`：clone monorepo → 把 `site/` 的 git 追蹤檔（含未提交編輯）同步進 `ztor-creator-studio/` 子目錄 → 開 `edit/<時間戳>` 分支 → commit → push → 自動在 `ztor20/Creator-Studio` 開 PR，並把連結回報給使用者。未追蹤檔（scratch、`fonts/` 等）不會被帶上。
- **不要直接 commit/push `main`**；變更一律走 PR，到 GitHub 審查後合併。
- 變更說明先跟使用者確認；一次編輯一個主題就跑一次流程。
- 開好 PR 後**由使用者在 GitHub 按 Merge 上線**，AI 不自行合併（上線的最後關卡在使用者手上）。
- PR 有衝突（GitHub 顯示無法自動合併）時，**先問使用者、取得其確認後**再解衝突並合併；不自行強推或硬合。

## 認證

`collab.sh` 自動讀中央倉 `~/AI/cfg/personal.env` 的 `ZTOR20_GH_TOKEN`（需對 `ztor20/Creator-Studio` 有**寫入權**）。協作者沒有該檔時，需自備對該 repo 有寫入權的 token。**repo 內不留明文 token**。

推送用的 token 只需 **write 權**即可 commit／push 分支＋開 PR，**不需 merge 權**；**merge 一律由具 merge 權限的協作者在 GitHub 上操作**，AI 不代合。各協作者的個人帳號路由屬本機設定，不寫在此共編檔。

## 其他

- 版本與治理見 [README.md](README.md)：`site/` 不得把畫面、截圖、互動或既有程式靜默反向同步成產品規則。
- 共用大檔（`r2.1/i18n.js`、`shared.css`、`design-system.html`）多人同改最易衝突，先講好分工。
