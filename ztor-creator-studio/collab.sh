#!/usr/bin/env bash
# Ztor Creator Studio · 發版到 monorepo（ztor20/Creator-Studio）
# 在 vault 的 site/ 編輯 → 同步進 monorepo 的 ztor-creator-studio/ 子目錄 → 開 PR。
# 用法: ./collab.sh "簡短變更說明"
#
# 背景（2026-06-18 起）：站點在 monorepo ztor20/Creator-Studio 的 `ztor-creator-studio/`
#   子目錄；本機 site/ 的 repo 根對應該子目錄，層級對不上所以不能直接 push。
#
# 2026-07-26 改寫（舊版備份在 collab-legacy.sh）——修掉「兩人並行會靜默還原對方工作」：
#   舊版直接 clone 最新 main、清空子目錄、灌入本機整包快照，再從最新 main 開分支。
#   因為分支永遠是 main 的線性子代、沒有分歧點，git 永遠不會報衝突：本機任何一個
#   落後的檔，在 PR 裡都長成「你刻意改成這樣」，merge 後對方已合併的改動就沒了。
#
#   現在改成：發版前**強制**先跑 ./pull.sh 做真正的 git merge，把 monorepo 最新內容
#   合進本機（撞到同一行會停下來要人解）。合併成功後，本機 = 遠端 ⊕ 本機改動，
#   此時再送快照就不可能還原掉別人的東西。
#   若 pull 期間有人又合併了，我們的分支基準會落後於 main，GitHub 會做真三方比對
#   並標出衝突——最後那道窗口由 GitHub 自己擋。
#
#   ⚠ 約定不變：所有人都在各自的 site/ 編輯、走本腳本發版；不要直接改 monorepo 的
#     ztor-creator-studio/ 子目錄，否則會被同步覆蓋。
#
# 認證：讀中央倉 ~/AI/cfg/personal.env 的 ZTOR20_GH_TOKEN（需對 Creator-Studio 有寫入權）。
#   repo 內不留明文 token。
set -euo pipefail

REPO_SLUG="ztor20/Creator-Studio"
HOST="github.com"
SUBDIR="ztor-creator-studio"   # 站內容在 monorepo 的子目錄

MSG="${1:-}"
if [ -z "$MSG" ]; then
  echo "用法: ./collab.sh \"簡短變更說明\""
  exit 1
fi

SITE="$(git rev-parse --show-toplevel)"   # vault 的 site/ 工作目錄（本機 git repo）

# 中央倉：優先新路徑 ~/AI/cfg/，找不到再退回舊路徑（相容尚未搬遷的機器）
CENTRAL="$HOME/AI/cfg/personal.env"
[ -f "$CENTRAL" ] || CENTRAL="$HOME/SynologyDrive/.cfg/personal.env"
# shellcheck disable=SC1090
[ -f "$CENTRAL" ] && source "$CENTRAL" || true
TOKEN="${ZTOR20_GH_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "找不到 ZTOR20_GH_TOKEN（中央倉 $CENTRAL）。請先把對 ${REPO_SLUG} 有寫入權的 token 放進中央倉。"
  exit 1
fi
AUTH="https://x-access-token:${TOKEN}@${HOST}/${REPO_SLUG}.git"

# ── 0) 強制先同步：這是「不會洗掉別人工作」的唯一保證，不可跳過 ──
echo "→ 發版前先同步 monorepo（真 git merge）…"
if ! "$SITE/pull.sh"; then
  echo ""
  echo "✗ 同步沒過，發版中止。先把上面列出的衝突解掉再重跑 collab.sh。"
  exit 1
fi

# 同步後本機必須沒有共同祖先以外的落差；再確認一次 mono/main 已是祖先
if ! git -C "$SITE" merge-base --is-ancestor refs/remotes/mono/main HEAD 2>/dev/null; then
  echo ""
  echo "✗ 同步後 monorepo 仍不是本機的祖先——不要發版，這代表橋接有問題。"
  exit 1
fi

# 暫存 clone，結束時清掉
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# 1) clone monorepo
echo "→ clone ${REPO_SLUG} …"
git clone --depth 1 "$AUTH" "$WORK/mono" >/dev/null 2>&1
DEST="$WORK/mono/$SUBDIR"
if [ ! -d "$DEST" ]; then
  echo "monorepo 沒有 ${SUBDIR}/ 子目錄，停止。"
  exit 1
fi

# 2) 把 site/ 的「追蹤檔（含未提交編輯）」同步進子目錄。
#    清空子目錄再灌，讓 git 正確反映 新增／修改／刪除；未追蹤檔（scratch、fonts/）不會被帶上。
#    ——這一步之所以安全，前提是上面第 0 步已經把遠端改動合進本機了。
echo "→ 同步 site/ 追蹤檔 → ${SUBDIR}/ …"
find "$DEST" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
TREEISH="$(git -C "$SITE" stash create || true)"
[ -z "$TREEISH" ] && TREEISH="HEAD"      # 無未提交變更時用 HEAD
git -C "$SITE" archive --format=tar "$TREEISH" | tar -x -C "$DEST"

# 3) 沒變更就結束
cd "$WORK/mono"
if [ -z "$(git status --porcelain)" ]; then
  echo "與 monorepo 現況相同、沒有變更，結束。"
  exit 0
fi

# 3.5) 體檢：這次發版會刪掉／還原多少東西？純新增或修改是常態，大量刪除要人看一眼。

if [ -n "$(git diff --name-only --diff-filter=D -- "$SUBDIR")" ]; then
  echo ""
  echo "  ⓘ 本次發版會刪除以下檔案（確認是刻意的）："
  git diff --name-only --diff-filter=D -- "$SUBDIR" | sed 's/^/     - /'
  echo ""
fi

# 3.6) 防重複：這包內容是不是已經有一個我開的 open PR 了？
#   本腳本每跑一次就開一個新的時間戳分支＋新 PR，不會回頭看有沒有等效的 PR 存在。
#   同一個改動連跑幾次（重試、兩個 session 各跑一次），就會長出好幾個一字不差的 PR。
#   這裡用 ztor-creator-studio/ 的 tree SHA（git 對「這包檔案內容」的指紋）比對：
#   相同就是逐位元組相同。只比子目錄不比 repo root，所以 main 在兩次發版之間有沒有
#   前進都不影響判斷；也只比自己開的 PR，別人的 PR 一律不看、不動。
git add -A
NEW_SUBTREE="$(git ls-tree "$(git write-tree)" "$SUBDIR" | awk '{print $3}')"
if [ -n "$NEW_SUBTREE" ] && command -v gh >/dev/null 2>&1; then
  ME="$(GH_TOKEN="$TOKEN" gh api user --jq .login 2>/dev/null || true)"
  if [ -n "$ME" ]; then
    while IFS=$'\t' read -r pr_num pr_br; do
      [ -z "${pr_num:-}" ] && continue
      oid="$(GH_TOKEN="$TOKEN" gh api "repos/$REPO_SLUG/git/ref/heads/$pr_br" --jq .object.sha 2>/dev/null || true)"
      [ -z "$oid" ] && continue
      root="$(GH_TOKEN="$TOKEN" gh api "repos/$REPO_SLUG/git/commits/$oid" --jq .tree.sha 2>/dev/null || true)"
      [ -z "$root" ] && continue
      sub="$(GH_TOKEN="$TOKEN" gh api "repos/$REPO_SLUG/git/trees/$root" \
             --jq ".tree[] | select(.path==\"$SUBDIR\") | .sha" 2>/dev/null || true)"
      if [ "$sub" = "$NEW_SUBTREE" ]; then
        echo ""
        echo "ⓘ 這包內容跟你已經開著的 PR #${pr_num} 完全相同，沒有再開一個的必要。"
        echo "  https://github.com/${REPO_SLUG}/pull/${pr_num}"
        echo "  → 要改變更說明或補內容，直接編輯那個 PR；改完檔案再跑一次本腳本即可。"
        exit 0
      fi
    done < <(GH_TOKEN="$TOKEN" gh pr list --repo "$REPO_SLUG" --state open --limit 100 \
             --json number,headRefName,author \
             --jq ".[] | select(.author.login==\"$ME\") | [.number, .headRefName] | @tsv" 2>/dev/null || true)
  fi
fi

# 4) 開分支 → commit（固定身分 lern2317）→ push → 開 PR
BR="edit/$(date +%Y%m%d-%H%M%S)"
git switch -c "$BR" >/dev/null
git add -A
git -c user.name="lern2317" -c user.email="lern2317@gmail.com" commit -q -m "$MSG"
git push "$AUTH" "$BR" >/dev/null 2>&1
PR_URL="$(GH_TOKEN="$TOKEN" gh pr create --repo "$REPO_SLUG" --base main --head "$BR" \
          --title "$MSG" --body "由 collab.sh 自動建立（從 vault site/ 同步進 ${SUBDIR}/）。發版前已跑 pull.sh 做真 git merge。" 2>&1 | tail -1)" \
  || PR_URL="(PR 自動建立失敗，手動開: https://github.com/${REPO_SLUG}/pull/new/${BR})"

echo ""
echo "✓ 分支 ${BR} 已推上 ${REPO_SLUG}"
echo "  PR: ${PR_URL}"
echo "  → 在 GitHub 審查後合併進 main（上線最後關卡在使用者手上）。"
echo "  → 若 GitHub 顯示有衝突，代表你發版期間有人又合併了：重跑 collab.sh 即可。"
echo ""
echo "  ⚠ merge 之後請立刻再跑一次 ./pull.sh。"
echo "    原因：PR 的提交與你本機的提交是「同樹不同血統」（發版是把快照灌進 monorepo，"
echo "    不是推你的 commit），merge 後兩邊就分歧了。此刻兩邊內容相同，pull 會無痛自動合併；"
echo "    但若先改了東西再 pull，同一段落會撞出假衝突（雙方都在同一位置新增）。"
