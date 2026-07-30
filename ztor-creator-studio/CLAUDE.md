# CLAUDE.md — ztor Creator Studio 原型 site（共編規則）

ztor Creator Studio 的原型 site。**2026-06-18 起站點搬進 monorepo [`ztor20/Creator-Studio`](https://github.com/ztor20/Creator-Studio)，內容位於該 repo 的 `ztor-creator-studio/` 子目錄（git subtree）；舊獨立 repo `ztor20/ztor-creator-studio` 已封存（唯讀）。** 本機 vault 的 `site/`（就是這層）仍是你編輯的工作目錄；發版採**分支 + Pull Request**、`main` 只放穩定版、**不直接推**。本檔與同目錄 `AGENTS.md`（給 Codex）維持相同規則。

## 編輯 → 提交流程（鐵律）

- **本機預覽用 `python3 devserver.py <port> r2.2`**（2026-07-26 新增），不要用 `python3 -m http.server`：後者不送 `Cache-Control`，瀏覽器會用啟發式快取給你舊檔。devserver 一律送 `no-store`。
- **PR merge 之後立刻再跑一次 `./pull.sh`**：發版是把快照灌進 monorepo、不是推你的 commit，所以 PR 的提交跟你本機的提交是「同樹不同血統」，merge 後兩邊就分歧了。此刻內容相同、pull 會無痛自動合併；若先改東西再 pull，同一段落會撞出假衝突。
- **資產版本字串 `?v=r2.2` 是固定的，不要逐次 bump**：線上由 Vercel 的 `must-revalidate` ＋ ETag 負責，本機由 devserver 負責。逐次 bump 會讓每個檔在版本號那一行相撞，兩人並行時全庫衝突。
- **`./pull.sh` ＝ 真正的 `git merge`**（2026-07-26 改寫）：它 clone monorepo、用 `git subtree split --prefix=ztor-creator-studio` 把子目錄攤平成與本機 `site/` 對齊的分支，再 `git merge` 進來。所以有共同祖先、有三方合併——**撞到同一行才衝突，撞到了會停下來要你解，其餘自動合併**。未追蹤檔（`fonts/`、scratch）不會被碰；未提交的編輯會自動 stash／pop。
  - 純 `?v=` 版本字串的衝突沒有語意，腳本自動以本機版收掉，並提醒發版前重跑 `bump_ver`。
  - **開工前建議跑一次**，但不跑也不會出事——`collab.sh` 發版前會強制再跑一次。
- **為什麼要這樣**：舊版 `collab.sh` 是「clone 最新 main → 清空子目錄 → 灌本機整包 → 從最新 main 開分支」。分支永遠是 main 的線性子代、沒有分歧點，**git 因此永遠不會報衝突**：本機任何一個落後的檔，在 PR 裡都長成「你刻意改成這樣」，merge 後同事已合併的工作就被靜默還原了。改成真 merge 之後，本機 = 遠端 ⊕ 你的改動，才不可能洗掉別人。舊版腳本留在 `pull-legacy.sh` / `collab-legacy.sh` 備查。
- **殘留分支與重複 PR 的清理已內建，不用手動掃**（2026-07-26 新增 `cleanup.sh`）：`pull.sh` 每次跑完會順手刪掉已合併／已關閉 PR 留下的殘留分支；`collab.sh` 發版前會先比對內容，發現這包跟你已經開著的某個 PR 一字不差就直接停下、不再開一個。想看完整清單就跑 `./cleanup.sh`，只想看不想動就加 `--dry-run`。
  - **會累積的原因**：`collab.sh` 每跑一次就開一個新的時間戳分支＋新 PR，本來不會回頭看有沒有等效的 PR 存在；repo 又沒開 `delete_branch_on_merge`，合併過的分支不會自己消失。兩件事疊起來，幾天就長出一堆看不出誰還有用的分支。
  - **兩人不同電腦共用同一個 repo 的安全界線**：分支沒有「誰的機器」這個欄位，能區分的只有 PR 作者帳號（各人用各自的 token）。所以自動刪的範圍只有兩種——已 MERGED 的 PR 分支（不分作者，內容已在 main，刪掉誰都不損失）、以及自己關掉的 PR 分支。別人的 open PR、別人關掉的分支、還有沒有對應 PR 的分支，一律只列出不處理；最後那種可能正是對方 `collab.sh` 跑到一半、PR 還沒開出來的瞬間。
  - **重複的判定不靠標題猜**：比的是 `ztor-creator-studio/` 的 tree SHA（git 對這包檔案內容的指紋），一致就是逐位元組相同。只比子目錄不比 repo root，所以 main 在兩次發版之間有沒有前進都不影響判斷。
- **本地 commit 自動做、不問**：改完 `site/` 的檔就直接在本層 commit，訊息寫清楚改了什麼。理由——`collab.sh` 送出去的是工作目錄快照（含未提交編輯），本地有沒有 commit 不影響發版內容；本地 commit 純粹是還原點。
- **要問的是後面三關**：開 PR（`collab.sh`）／merge／上線——這三個才會被別人看到或影響線上，一律先問、取得明確指示才做。
- 在 vault `site/`（本層）編輯；**不要直接改 monorepo 的 `ztor-creator-studio/` 子目錄**（collab.sh 會「清空再灌」同步、直接改動會被覆蓋）。
- **使用者要發版（開 PR）時**，跑 `./collab.sh "<變更說明>"`：clone monorepo → 把 `site/` 的 git 追蹤檔（含未提交編輯）同步進 `ztor-creator-studio/` 子目錄 → 開 `edit/<時間戳>` 分支 → commit → push → 自動在 `ztor20/Creator-Studio` 開 PR，並把連結回報給使用者。未追蹤檔（scratch、`fonts/` 等）不會被帶上。
- **不要直接 commit/push `main`**；變更一律走 PR，到 GitHub 審查後合併。
- 變更說明先跟使用者確認；一次編輯一個主題就跑一次流程。
- 開好 PR 後可由使用者在 GitHub 按 Merge 上線；若使用者明確授權，也可由 AI 代為合併（上線的最後關卡仍以使用者授權為準）。
- PR 有衝突（GitHub 顯示無法自動合併）時，**先問使用者、取得其確認後**再解衝突並合併；不自行強推或硬合。

## 認證

`collab.sh` 自動讀中央倉 `~/AI/cfg/personal.env` 的 `ZTOR20_GH_TOKEN`（需對 `ztor20/Creator-Studio` 有**寫入權**）。協作者沒有該檔時，需自備對該 repo 有寫入權的 token。**repo 內不留明文 token**。

推送用的 token 只需 **write 權**即可 commit／push 分支＋開 PR，**不需 merge 權**；**merge 一律由具 merge 權限的協作者在 GitHub 上操作**，AI 不代合。各協作者的個人帳號路由屬本機設定，不寫在此共編檔。

## 其他

- 版本與治理見 [README.md](README.md)：`site/` 不得把畫面、截圖、互動或既有程式靜默反向同步成產品規則。
- 共用大檔（`r2.2/js/i18n.js`、`shared.css`、`design-system.html`）多人同改最易衝突，先講好分工。
