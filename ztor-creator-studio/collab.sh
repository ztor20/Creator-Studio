#!/usr/bin/env bash
# Ztor Creator Studio · 發版到 monorepo（ztor20/Creator-Studio）
# 在 vault 的 site/ 編輯 → 同步進 monorepo 的 ztor-creator-studio/ 子目錄 → 開 PR。
# 用法: ./collab.sh "簡短變更說明"
#
# 背景（2026-06-18 起）：站點搬進 monorepo ztor20/Creator-Studio（git subtree），
#   站內容位於該 repo 的 `ztor-creator-studio/` 子目錄；舊 repo ztor20/ztor-creator-studio 已封存（唯讀）。
#   本機 vault 的 site/ 仍是你編輯的工作目錄，但因層級對不上（site/ 根 = monorepo 子目錄）不能直接 push，
#   故本腳本改成：clone monorepo → 把 site/ 的「git 追蹤檔（含未提交編輯）」同步進子目錄 → commit → push → 開 PR。
#   ⚠ 約定：所有人都在 vault site/ 編輯、走本腳本發版；不要直接在 monorepo 的 ztor-creator-studio/ 內改檔，
#     否則本腳本的「清空再灌」同步會覆蓋掉那些直接改動。
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

# 認證來源
# 中央倉：優先新路徑 ~/AI/cfg/，找不到再退回舊路徑（相容尚未搬遷的機器）
CENTRAL="$HOME/AI/cfg/personal.env"
[ -f "$CENTRAL" ] || CENTRAL="$HOME/SynologyDrive/.cfg/personal.env"
[ -f "$CENTRAL" ] && source "$CENTRAL" || true
TOKEN="${ZTOR20_GH_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "找不到 ZTOR20_GH_TOKEN（中央倉 $CENTRAL）。請先把對 ${REPO_SLUG} 有寫入權的 token 放進中央倉。"
  exit 1
fi
AUTH="https://x-access-token:${TOKEN}@${HOST}/${REPO_SLUG}.git"

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
#    清空子目錄再灌，讓 git 正確反映 新增／修改／刪除；未追蹤檔（如 e-shop-test.html、fonts/）不會被帶上。
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

# 4) 開分支 → commit（固定身分 lern2317）→ push → 開 PR
BR="edit/$(date +%Y%m%d-%H%M%S)"
git switch -c "$BR" >/dev/null
git add -A
git -c user.name="lern2317" -c user.email="lern2317@gmail.com" commit -q -m "$MSG"
git push "$AUTH" "$BR" >/dev/null 2>&1
PR_URL="$(GH_TOKEN="$TOKEN" gh pr create --repo "$REPO_SLUG" --base main --head "$BR" \
          --title "$MSG" --body "由 collab.sh 自動建立（從 vault site/ 同步進 ${SUBDIR}/）。" 2>&1 | tail -1)" \
  || PR_URL="(PR 自動建立失敗，手動開: https://github.com/${REPO_SLUG}/pull/new/${BR})"

echo ""
echo "✓ 分支 ${BR} 已推上 ${REPO_SLUG}"
echo "  PR: ${PR_URL}"
echo "  → 在 GitHub 審查後合併進 main（上線最後關卡在使用者手上）。"
