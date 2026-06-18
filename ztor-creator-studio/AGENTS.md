# AGENTS.md — ztor Creator Studio 原型 site（共編規則）

本檔供 Codex 使用，與同目錄 `CLAUDE.md`（給 Claude）維持相同規則。本 repo（`ztor20/ztor-creator-studio`）是 ztor Creator Studio 的原型 site，採**分支 + Pull Request** 共編，`main` 只放穩定版、**不直接推**。

## 編輯 → 提交流程（鐵律）

- **每次編輯完本 repo 的檔，主動詢問使用者「要 commit 嗎？」**——不要自動 commit，先問。
- 使用者要 commit 時，跑 `./collab.sh "<變更說明>"`：開 `edit/<時間戳>` 分支 → commit → push → 自動開 PR，並把 PR 連結回報給使用者。
- **不要直接 commit/push `main`**；變更一律走 PR，到 GitHub 審查後合併。
- 變更說明先跟使用者確認；一次編輯一個主題就跑一次流程。
- 開好 PR 後**由使用者在 GitHub 按 Merge 上線**，AI 不自行合併（上線的最後關卡在使用者手上）。
- PR 有衝突（GitHub 顯示無法自動合併）時，**先問使用者、取得其確認後**再解衝突並合併；不自行強推或硬合。

## 認證

`collab.sh` 自動讀中央倉 `~/SynologyDrive/.cfg/personal.env` 的 `ZTOR20_GH_TOKEN`（Yves 本機）；協作者沒有該檔時，退回各自的 `gh auth login` / git 既有登入。**repo 內不留明文 token**。

## 其他

- 版本與治理見 [README.md](README.md)：`site/` 不得把畫面、截圖、互動或既有程式靜默反向同步成產品規則。
- 共用大檔（`R 2.1/i18n.js`、`shared.css`、`design-system.html`）多人同改最易衝突，先講好分工。
