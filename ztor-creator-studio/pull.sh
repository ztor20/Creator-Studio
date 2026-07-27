#!/usr/bin/env bash
# Ztor Creator Studio · 從 monorepo 同步最新版到本機 site/（真 git merge 版）
# 用法: ./pull.sh
#
# 2026-07-26 改寫（原「三方檔案比對」版備份在 pull-legacy.sh）：
#   舊版是自己拿快照逐檔比對，模擬三方合併——它不知道誰比較新，只能把兩邊都改過的
#   檔列出來要人判斷；而 collab.sh 送出去的是整包快照，本機落後就會靜默還原別人
#   已合併的改動（因為分支永遠從最新 main 開，git 看不出分歧，PR 一律顯示 CLEAN）。
#
#   現在改成真的 git：
#     1) clone monorepo → `git subtree split --prefix=ztor-creator-studio` 產生扁平分支
#        （該分支的 repo 根＝子目錄內容，與本機 site/ 對齊）
#     2) 抓成本機的 refs/remotes/mono/main → `git merge`
#   於是有共同祖先、有真正的三方合併：撞到同一行才衝突，撞到了會停下來要人解，
#   沒撞到的自動合併。發版空窗期的問題也消失——合併在 merge 當下判定，不是事前猜。
#
# 版本字串雜訊：bump_ver 會改全站每個檔的 `?v=`，兩人並行時每個檔都會在那一行相撞。
# 這種衝突沒有語意，本腳本會自動以本機版收掉，並提醒發版前重跑 bump_ver。
#
# 未追蹤/被忽略的本機檔（fonts/、scratch、screenshots）永遠不碰。
# 認證：讀中央倉 ~/AI/cfg/personal.env 的 ZTOR20_GH_TOKEN。
set -euo pipefail

REPO_SLUG="ztor20/Creator-Studio"
HOST="github.com"
SUBDIR="ztor-creator-studio"

SITE="$(git rev-parse --show-toplevel)"
cd "$SITE"

CENTRAL="$HOME/AI/cfg/personal.env"
[ -f "$CENTRAL" ] || CENTRAL="$HOME/SynologyDrive/.cfg/personal.env"
# shellcheck disable=SC1090
[ -f "$CENTRAL" ] && source "$CENTRAL" || true
TOKEN="${ZTOR20_GH_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "找不到 ZTOR20_GH_TOKEN（中央倉 $CENTRAL）。請先放對 ${REPO_SLUG} 有讀取權的 token。"
  exit 1
fi
AUTH="https://x-access-token:${TOKEN}@${HOST}/${REPO_SLUG}.git"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# git merge 需要乾淨的工作區：未提交的編輯先收進 stash，合併後放回
STASHED=0
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "→ 先收起未提交的編輯（合併後自動放回）…"
  git stash push -q -m "pull.sh auto-stash"
  STASHED=1
fi
restore_stash() {
  if [ "$STASHED" = "1" ]; then
    echo "→ 放回未提交的編輯…"
    git stash pop || {
      echo ""
      echo "⚠ 放回編輯時發生衝突。你的編輯還在 stash 裡，用 git stash list／git stash pop 處理。"
      exit 1
    }
  fi
}

# 順手清掉已合併／已關閉 PR 留下的殘留分支。
# 放在這裡的理由：文件要求「PR merge 之後立刻跑一次 pull.sh」，那正好就是分支變成殘骸的時刻。
# 清理規則與兩人並行的安全性說明見 cleanup.sh 開頭；--prune-only 只刪分支、不碰任何 PR，
# 失敗也不影響同步結果，所以一律吞掉錯誤。
prune_branches() {
  [ -x "$SITE/cleanup.sh" ] && "$SITE/cleanup.sh" --prune-only || true
}

echo "→ clone ${REPO_SLUG} …"
git clone -q "$AUTH" "$WORK/mono"
if [ ! -d "$WORK/mono/$SUBDIR" ]; then
  echo "monorepo 沒有 ${SUBDIR}/ 子目錄，停止。"
  restore_stash
  exit 1
fi

echo "→ 把 ${SUBDIR}/ 攤平成對齊本機 site/ 的分支 …"
git -C "$WORK/mono" subtree split --prefix="$SUBDIR" -b flat >/dev/null 2>&1
git fetch -q "$WORK/mono" flat:refs/remotes/mono/main --force

# 沒有共同祖先＝subtree 橋接壞了。硬合會炸成全庫衝突，直接擋下。
if ! git merge-base mono/main HEAD >/dev/null 2>&1; then
  echo ""
  echo "✗ 本機與 monorepo 沒有共同祖先——subtree 橋接壞了，不要硬合。"
  echo "  先確認 monorepo 是不是被 force-push 洗過歷史，或重跑一次 graft。"
  restore_stash
  exit 1
fi

if git merge-base --is-ancestor mono/main HEAD; then
  echo "✓ 已經是最新（monorepo 沒有本機還沒有的改動）"
  restore_stash
  prune_branches
  exit 0
fi

echo "→ git merge mono/main …"
set +e
git -c user.name="lern2317" -c user.email="lern2317@gmail.com" merge --no-edit mono/main
MERGE_RC=$?
set -e

if [ "$MERGE_RC" != "0" ]; then
  # 只在 `?v=` 那一行相撞的檔，衝突沒有語意，自動以本機版收掉
  AUTO=0
  REAL=()
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    if sed -n '/^<<<<<<< /,/^>>>>>>> /p' "$f" 2>/dev/null \
       | grep -v '^<<<<<<< \|^=======$\|^>>>>>>> ' | grep -qv '?v=20'; then
      REAL+=("$f")
    else
      git checkout --ours -- "$f"
      git add -- "$f"
      AUTO=$((AUTO+1))
    fi
  done < <(git diff --name-only --diff-filter=U)

  [ "$AUTO" -gt 0 ] && echo "  · 自動收掉 ${AUTO} 個純版本號（?v=）衝突"

  if [ "${#REAL[@]}" -gt 0 ]; then
    echo ""
    echo "✗ 有 ${#REAL[@]} 個檔是真的內容衝突，需要你決定："
    printf '   ! %s\n' "${REAL[@]}"
    echo ""
    echo "  處理方式：打開檔案找 <<<<<<< 標記手動解，解完 git add，再 git commit。"
    echo "  想放棄這次合併：git merge --abort"
    [ "$STASHED" = "1" ] && echo "  （原本未提交的編輯在 stash 裡，解完衝突再 git stash pop）"
    exit 1
  fi

  git -c user.name="lern2317" -c user.email="lern2317@gmail.com" commit -q --no-edit
  echo "✓ 合併完成（版本號衝突已自動收掉；發版前記得重跑 bump_ver）"
else
  echo "✓ 合併完成，無衝突"
fi

restore_stash
prune_branches
echo ""
echo "本機已包含 monorepo 最新內容。要發版就跑 ./collab.sh \"<變更說明>\"。"
