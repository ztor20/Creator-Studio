# AGENTS.md — ztor Creator Studio 原型 site（共編規則）

本檔供 Codex 使用，與同目錄 `CLAUDE.md`（給 Claude）維持相同規則。ztor Creator Studio 的原型 site。**2026-06-18 起站點搬進 monorepo [`ztor20/Creator-Studio`](https://github.com/ztor20/Creator-Studio)，內容位於該 repo 的 `ztor-creator-studio/` 子目錄（git subtree）；舊獨立 repo `ztor20/ztor-creator-studio` 已封存（唯讀）。** 本機 vault 的 `site/`（就是這層）仍是你編輯的工作目錄；發版採**分支 + Pull Request**、`main` 只放穩定版、**不直接推**。

## 編輯 → 提交流程（鐵律）

- **本機預覽用 `python3 devserver.py <port> app`**（2026-07-26 新增），不要用 `python3 -m http.server`：後者不送 `Cache-Control`，瀏覽器會用啟發式快取給你舊檔。devserver 一律送 `no-store`。
- **PR merge 之後立刻再跑一次 `./pull.sh`**：發版是把快照灌進 monorepo、不是推你的 commit，所以 PR 的提交跟你本機的提交是「同樹不同血統」，merge 後兩邊就分歧了。此刻內容相同、pull 會無痛自動合併；若先改東西再 pull，同一段落會撞出假衝突。
- **資產版本字串 `?v=r2.2` 是固定的，不要逐次 bump**：線上由 Vercel 的 `must-revalidate` ＋ ETag 負責，本機由 devserver 負責。逐次 bump 會讓每個檔在版本號那一行相撞，兩人並行時全庫衝突。
- **`./pull.sh` ＝ 真正的 `git merge`**（2026-07-26 改寫）：它 clone monorepo、用 `git subtree split --prefix=ztor-creator-studio` 把子目錄攤平成與本機 `site/` 對齊的分支，再 `git merge` 進來。所以有共同祖先、有三方合併——**撞到同一行才衝突，撞到了會停下來要你解，其餘自動合併**。未追蹤檔（`fonts/`、scratch）不會被碰；未提交的編輯會自動 stash／pop。
  - 純 `?v=` 版本字串的衝突沒有語意，腳本自動以本機版收掉，並提醒發版前重跑 `bump_ver`。
  - **開工前建議跑一次**，但不跑也不會出事——`collab.sh` 發版前會強制再跑一次。
- **為什麼要這樣**：舊版 `collab.sh` 是「clone 最新 main → 清空子目錄 → 灌本機整包 → 從最新 main 開分支」。分支永遠是 main 的線性子代、沒有分歧點，**git 因此永遠不會報衝突**：本機任何一個落後的檔，在 PR 裡都長成「你刻意改成這樣」，merge 後同事已合併的工作就被靜默還原了。改成真 merge 之後，本機 = 遠端 ⊕ 你的改動，才不可能洗掉別人。舊版腳本已於 2026-08-19 刪除（保留只是誘人誤跑一個會靜默還原別人工作的流程；沿革看本段與 git 歷史就夠）。
- **殘留分支與重複 PR 的清理已內建，不用手動掃**（2026-07-26 新增 `cleanup.sh`）：`pull.sh` 每次跑完會順手刪掉已合併／已關閉 PR 留下的殘留分支；`collab.sh` 發版前會先比對內容，發現這包跟你已經開著的某個 PR 一字不差就直接停下、不再開一個。想看完整清單就跑 `./cleanup.sh`，只想看不想動就加 `--dry-run`。清理範圍含 `collab.sh` 開的 `edit/` 分支與搬修正進交付版（`release2.3`）用的 `port/` 分支；2026-09-24 起認證同樣走 `gh-auth.sh`（舊版只認中央倉那把 token，那把失去寫入權後刪分支全部靜默失敗，合併過的分支一直沒清掉）。
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

## 認證（2026-08-19 改：不再只認中央倉一把 token）

`collab.sh`、`pull.sh`、`cleanup.sh`（2026-09-24 起）都改用 **`gh-auth.sh`** 解析憑證。它依序試這些候選，**實際試推一個丟棄分支**來確認寫入權，選第一個推得動的：

1. 中央倉 `~/AI/cfg/personal.env` 的 `ZTOR20_GH_TOKEN`（協作者各自的 token）
2. 本機 `gh` 已登入的每個帳號（`gh auth token --user <帳號>`）

`pull.sh` 只需要讀取權，走 `gh_token_read`，不試推、不對遠端產生任何動作。`collab.sh` 需要寫入權，走 `gh_token_write`。兩個都找不到時會印出兩條修法（開 PAT 的權限、或 `gh auth login`），不會靜默失敗。**repo 內不留明文 token**。

**為什麼要做成「實際試推」而不是查 API**：細粒度 PAT（`github_pat_` 開頭）的讀與寫是分開授權的。`GET /repos/{owner}/{repo}` 回的 `permissions: {"push": true}` 是**使用者在該 repo 的角色**，不是這把 token 被授予的範圍——實測角色顯示可推、真的推仍是 `403 Permission denied`。試推一個 `probe/write-check-$$` 分支是唯一可靠的判斷；推成功會立刻刪掉該分支，推失敗遠端不會留下任何東西。

**push 的輸出不再導掉**。舊版 `collab.sh` 寫成 `git push ... >/dev/null 2>&1`，推送失敗時看起來像「沒有錯誤訊息就停在 `Switched to a new branch`」，同一題查了三次（2026-08-17／08-18／08-19）才定位。現在失敗會直接印出 git 的原始錯誤（token 已遮蔽）並以非零碼結束。

merge 一律由具 merge 權限的協作者在 GitHub 上操作。各協作者的個人帳號路由屬本機設定，不寫在此共編檔。

## 版本分支（2026-09-23 起；2026-10-07 起交付版改用 release 編號）

- `main`＝`app/`，唯一開發版；資料夾名稱固定，版本號記在文件與分支名稱。
- `release2.3` 分支＝E-Shop 交付版的凍結分支（原名 `phase1`，2026-10-07 改名；GitHub 會把舊名稱自動轉到新名稱），只能 PR，不可直推（GitHub 分支保護待 org owner 設定，設好前靠流程自律）。
  - 網址 `https://ztor-cs-release2-3.vercel.app`（舊網址 `https://ztor-cs-phase1.vercel.app` 保留繼續有效）。
  - 改版紀錄在該分支的 `ztor-creator-studio/RELEASE2.3-CHANGES.md`，每次升版打標籤 `release2.3-vX.Y`（舊標籤 `phase1-v1.0`～`phase1-v1.3` 保留不動；從 `release2.3-v1.4` 起用新名稱，目前 v1.4）。
- 本機 `site/` 永遠只放 `main`，不要在本機 checkout `release2.3`。
- 修正要進 release2.3：先照一般流程進 `main` → 把那筆改動套到 `release2.3`，開 `port/<時間戳>` 分支、PR 的 base 設 `release2.3` → 同一個 PR 補 `RELEASE2.3-CHANGES.md` 升版條目 → 合併、打標籤 → 另行部署凍結版網址（合併不會自動上線）。維護者的本機有腳本代勞：
  - `release-port.sh <release> <commit> --check` 先試套；ASSUMPTIONS／UI-CHANGES／requirements-map 三份已分歧的紀錄檔內建排除，只搬程式與設計系統文件。
  - `deploy-release.sh <release>` 部署。
- 凍結分支上的鎖版本改動要保留：`app/js/devtools.js` 標 `★ RELEASE2.3 FROZEN` 的段落、`app/feature-scope-map.md` 開發版本配置表只留 `release2.3` 一列。套修正時不要被 `main` 的內容蓋掉；試套失敗代表兩邊已分歧，手動改寫那筆修正，不要硬套。
- `main` 的版本切換面板只有四個選項：
  - 最終版
  - release2.4（版本鍵 `release2.4`，規則 `tier:release2.3,release2.4`）
  - funding-test
  - Deck for Sony
- 功能表 tier（`app/feature-scope-map.md` 的 Tier 欄）：
  - `🟢 release2.3`：已交付
  - `🔵 release2.4`：下一版
  - `⚪ TBD`：未排定
  - `⚫ 退場`
- 新功能做出來就掛 `data-feat` 標記並登記在 `feature-scope-map.md`（預設 ⚪ 未排定），否則 `main` 的 release2.4 預覽會多顯示不在範圍的東西。
- 每期輪替：
  1. 把要做的功能在 `feature-scope-map.md` 標 `🔵 release2.4`。
  2. 用面板的「release2.4」確認畫面。
  3. 從 `main` 切 `release2.4` 分支鎖版本。
  4. 開部署 repo 與 Vercel 專案，在 `deploy-release.sh` 的 `release_target` 補一筆，開新網址。
  5. 交付後把那批功能改標 `🟢 release2.4`；`main` 的下一版改成 release2.5（`feature-scope-map.md` 開發版本配置表，加上 `devtools.js` 的 `VERSIONS` 後備、`TIER_EMOJI` 的 🔵 改對到 release2.5；新標 🔵 的功能在 `FEAT_TIER` 後備補一筆，已交付的 `release2.4` 值不用改）。
- 完整流程圖見 [WORKFLOW.md](WORKFLOW.md) §5 與 [WORKFLOW-DIAGRAM.md](WORKFLOW-DIAGRAM.md) 線 4。

## 變更紀錄的交付版標籤（2026-10-07 起）

`app/UI-CHANGES.md` 每筆紀錄標題下一行寫標籤，標出這筆改動會進哪個交付版。

- 格式：`**標籤**：release2.3`、`**標籤**：release2.4`，或 `**標籤**：release2.3、release2.4`。只進最終版的不寫這一行。
- 判斷依 `feature-scope-map.md` 的 Tier 欄：
  - 改到 `🟢 release2.3`（E-Shop）的功能 → 先問使用者要不要同步改進凍結的 release2.3：
    - 選同步 → 標兩個，發進 `main` 後用 `release-port.sh` 搬過去。
    - 選不同步 → 只標 release2.4（只改在 release2.4 與最終版）。
  - 改到 `🔵 release2.4` 的功能 → 標 release2.4（release2.4 凍結後同樣先問）。
  - 只改 `⚪ TBD` 或沒掛功能標記的 → 不標。
- `collab.sh` 開 PR 時讀這次新增條目的標籤，貼成 GitHub PR 標籤，PR 內文列出新增條目的標題。標到已凍結的交付版時，結尾提醒用 `release-port.sh` 搬。

## 規則手冊（`app/rulebook/`，2026-10-01 搬入）

- 產品規則定案的對外發布頁，線上網址 `/rulebook/`。內容只收 `documents/` 已定案的規則，正典仍是規格，不是原型。
- 章節照原型左側欄分「章節 › 子功能頁 › 子頁」三層；章節樹集中在 `app/rulebook/shell.js` 的 `TREE`，加頁時在對應章節把待補子頁補上檔名。
- 自帶樣式（`shell.css` 與各頁 `<style>`），不套原型的 design system、不用 `sidebar.js`，也不掛 `data-feat`；不要把原型的元件或 token 套進來，也不要依原型的設計系統規則「修正」它。
- 改 `shell.js`／`shell.css` 時，同步升所有頁面的 `?v=` 版本參數。
- 寫或改手冊頁面前，先讀同資料夾的 `app/rulebook/WRITING-GUIDE.md`。
- 內容來源與更新時機由專案根 `CLAUDE.md`「規格定案後同步規則手冊」定義：只轉述 `documents/` 已定案的規則，與規格不一致時以規格為準。

## 其他

- 版本與治理見 [README.md](README.md)：`site/` 不得把畫面、截圖、互動或既有程式靜默反向同步成產品規則。
- 共用大檔（`app/js/i18n.js`、`shared.css`、`design-system.html`）多人同改最易衝突，先講好分工。
