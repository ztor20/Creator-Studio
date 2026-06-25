#!/usr/bin/env bash
# Ztor Creator Studio · 從 monorepo 拉回最新版到本機 site/（collab.sh 的反向）
# 用法: ./pull.sh
#
# collab.sh 只負責「本機 → monorepo」發版（開 PR）；本腳本補上「monorepo → 本機」那半套：
#   clone monorepo（ztor20/Creator-Studio）→ 取其 ztor-creator-studio/ 子目錄最新版
#   → 同步回本機 site/（覆蓋已追蹤檔、保護未追蹤/忽略檔）→ 本機記一個 commit。
#
# 開工前先跑一次，確保你是在「已合併的最新版」上編輯，避免之後 collab.sh 的
#   「清空再灌」把同事剛合併的改動洗掉。
#
# 安全：① 本機有未提交（已追蹤）變更時直接停，先處理再拉。
#       ② 未追蹤/被 .gitignore 忽略的本機檔（fonts/、scratch…）不會被刪。
#       ③ 同步後 commit，前一版仍在 git 歷史（git reflog / reset 可還原）。
# 認證：讀中央倉 ~/SynologyDrive/.cfg/personal.env 的 ZTOR20_GH_TOKEN（需對該 repo 有讀取權）。
set -euo pipefail

REPO_SLUG="ztor20/Creator-Studio"
HOST="github.com"
SUBDIR="ztor-creator-studio"

SITE="$(git rev-parse --show-toplevel)"   # vault 的 site/ 工作目錄（本機 git repo）

# 認證來源
CENTRAL="$HOME/SynologyDrive/.cfg/personal.env"
[ -f "$CENTRAL" ] && source "$CENTRAL" || true
TOKEN="${ZTOR20_GH_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "找不到 ZTOR20_GH_TOKEN（中央倉 $CENTRAL）。請先把對 ${REPO_SLUG} 有讀取權的 token 放進中央倉。"
  exit 1
fi
AUTH="https://x-access-token:${TOKEN}@${HOST}/${REPO_SLUG}.git"

# 1) 安全檢查：本機有未提交的「已追蹤」變更就停（未追蹤檔不算，不會擋）
if [ -n "$(git -C "$SITE" status --porcelain --untracked-files=no)" ]; then
  echo "⚠ 本機 site/ 有未提交（已追蹤）的變更，先處理再拉，以免被覆蓋："
  git -C "$SITE" status --short --untracked-files=no
  echo ""
  echo "  → 想保留並發版：./collab.sh \"變更說明\"（開 PR）"
  echo "  → 想丟棄重來：  git -C \"$SITE\" restore .   （謹慎，不可復原未提交內容）"
  exit 1
fi

# 暫存 clone，結束時清掉
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# 2) clone monorepo，定位子目錄
echo "→ clone ${REPO_SLUG} …"
git clone --depth 1 "$AUTH" "$WORK/mono" >/dev/null 2>&1
SRC="$WORK/mono/$SUBDIR"
if [ ! -d "$SRC" ]; then
  echo "monorepo 沒有 ${SUBDIR}/ 子目錄，停止。"
  exit 1
fi
SRCSHA="$(git -C "$WORK/mono" rev-parse --short HEAD)"

# 3) 建保護清單：.git + 本機未追蹤檔 + 被忽略檔（rsync --delete 不會碰）
PROT="$WORK/protect.txt"
{
  printf '/.git\n'
  git -C "$SITE" ls-files --others --exclude-standard           # 未追蹤（非忽略）
  git -C "$SITE" ls-files --others --ignored --exclude-standard # 被 .gitignore 忽略
} | awk 'NR==1{print; next} {print "/" $0}' > "$PROT"

# 4) 同步：子目錄 → 本機 site/，覆蓋已追蹤檔、刪除上游已移除的追蹤檔、保護本機獨有檔
echo "→ 同步 ${SUBDIR}/（@ ${SRCSHA}）→ 本機 site/ …"
rsync -a --delete --exclude-from="$PROT" "$SRC"/ "$SITE"/

# 5) 比對 + 記錄本機 commit（前一版仍在 git 歷史可還原）
git -C "$SITE" add -A
CHANGES="$(git -C "$SITE" diff --cached --stat)"
if [ -z "$CHANGES" ]; then
  echo "✓ 已是最新版，無變更。"
  exit 0
fi
echo ""
echo "→ 拉下的變更："
echo "$CHANGES"
git -C "$SITE" -c user.name="lern2317" -c user.email="lern2317@gmail.com" \
  commit -q -m "pull: sync from ${REPO_SLUG} (${SUBDIR}/ @ ${SRCSHA})"
echo ""
echo "✓ 已從 ${REPO_SLUG} 同步回本機 site/，並記錄一個 commit。"
echo "  前一版仍在 git 歷史：git -C \"$SITE\" reflog（要還原用 git reset --hard <前一個>）。"
