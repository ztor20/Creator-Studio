#!/usr/bin/env bash
# Ztor Creator Studio · 智慧同步 monorepo 最新版到本機 site/（collab.sh 的反向）
# 用法: ./pull.sh
#
# 三方比對（base / 本機工作區 / monorepo），逐檔決定，不整個擋死、不洗掉你的編輯：
#   base = 上次同步時的 monorepo 快照（存在 .git/collab-base/，永不被 git 追蹤）
#   - 你沒動過的檔（本機==base）：安全 → 用 monorepo 版更新（覆寫前先備份）
#   - 只有你動過、同事沒動（monorepo==base）：保留你的版，不動
#   - 你和同事都動過同一個檔：列為「衝突」、不動你的版，請你決定
#   - 上游新增的檔：你沒有 → 直接帶下來；上游刪除你沒動的檔 → 跟著刪（先備份）
# 未追蹤/被忽略的本機檔（fonts/、scratch、screenshots）永遠不碰。
# 不在本機 commit（維持你「工作區即狀態」的習慣）；同步狀態靠 base 快照記錄。
# 認證：讀中央倉 ~/SynologyDrive/.cfg/personal.env 的 ZTOR20_GH_TOKEN。
set -euo pipefail

REPO_SLUG="ztor20/Creator-Studio"
HOST="github.com"
SUBDIR="ztor-creator-studio"

SITE="$(git rev-parse --show-toplevel)"
BASE="$SITE/.git/collab-base"          # 上次同步的 monorepo 子目錄快照（不被追蹤）
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP="$SITE/.git/collab-backup-$TS"   # 本次被覆寫/刪除前的舊版備份
CONFLICT_DIR="$SITE/.git/collab-conflict-$TS"  # 衝突檔的 monorepo 版（供你比對）

CENTRAL="$HOME/SynologyDrive/.cfg/personal.env"
[ -f "$CENTRAL" ] && source "$CENTRAL" || true
TOKEN="${ZTOR20_GH_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "找不到 ZTOR20_GH_TOKEN（中央倉 $CENTRAL）。請先放對 ${REPO_SLUG} 有讀取權的 token。"
  exit 1
fi
AUTH="https://x-access-token:${TOKEN}@${HOST}/${REPO_SLUG}.git"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "→ clone ${REPO_SLUG} …"
git clone --depth 1 "$AUTH" "$WORK/mono" >/dev/null 2>&1
M="$WORK/mono/$SUBDIR"
[ -d "$M" ] || { echo "monorepo 沒有 ${SUBDIR}/ 子目錄，停止。"; exit 1; }
SRCSHA="$(git -C "$WORK/mono" rev-parse --short HEAD)"

# 受保護：本機未追蹤＋被忽略檔（永不納入比對、永不動）
PROT="$WORK/protect"
{ git -C "$SITE" ls-files --others --exclude-standard
  git -C "$SITE" ls-files --others --ignored --exclude-standard
} | sort -u > "$PROT"
is_protected() { grep -qxF "$1" "$PROT"; }

# ---------- 首次執行：沒有 base，無法判方向，只建基準 ----------
if [ ! -d "$BASE" ]; then
  echo "→ 首次執行：建立同步基準（不會改動你的工作區）。"
  DIFFS="$WORK/firstdiff"; : > "$DIFFS"
  git -C "$SITE" ls-files | while IFS= read -r f; do
    is_protected "$f" && continue
    if [ -f "$M/$f" ]; then
      cmp -s "$SITE/$f" "$M/$f" || echo "$f" >> "$DIFFS"
    fi
  done
  mkdir -p "$BASE"; (cd "$M" && find . -type f -print0 | while IFS= read -r -d '' p; do
      mkdir -p "$BASE/$(dirname "$p")"; cp "$M/$p" "$BASE/$p"; done)
  echo "✓ 基準已建立（@ ${SRCSHA}）。"
  if [ -s "$DIFFS" ]; then
    echo ""
    echo "⚠ 目前你的本機與共用 repo 有下列檔不同（這次未自動改動）："
    sed 's/^/   /' "$DIFFS"
    echo "   → 若其中有「同事比你新」的，請手動處理或先發版；純你的編輯則不用管。"
    echo "   下次起 pull 會自動只更新你沒動過的檔。"
  else
    echo "  目前與共用 repo 完全一致。"
  fi
  exit 0
fi

# ---------- 一般執行：三方比對 ----------
UPDATED="$WORK/updated"; CONFLICTS="$WORK/conflicts"; DELETED="$WORK/deleted"
: > "$UPDATED"; : > "$CONFLICTS"; : > "$DELETED"

# 檔案宇宙 = 本機追蹤檔 ∪ monorepo 檔 ∪ base 檔（皆相對路徑）
UNIV="$WORK/univ"
{ git -C "$SITE" ls-files
  (cd "$M" && find . -type f | sed 's#^\./##')
  (cd "$BASE" && find . -type f | sed 's#^\./##')
} | sort -u > "$UNIV"

backup() {  # 備份本機現有檔再動它
  local f="$1"; [ -f "$SITE/$f" ] || return 0
  mkdir -p "$BACKUP/$(dirname "$f")"; cp "$SITE/$f" "$BACKUP/$f"
}

while IFS= read -r f; do
  [ -z "$f" ] && continue
  is_protected "$f" && continue

  bex=0; mex=0; lex=0
  [ -f "$BASE/$f" ] && bex=1
  [ -f "$M/$f" ]    && mex=1
  [ -f "$SITE/$f" ] && lex=1

  # 上游(monorepo)相對 base 有沒有變
  up=0
  if [ $mex -eq 1 ] && [ $bex -eq 1 ]; then cmp -s "$M/$f" "$BASE/$f" || up=1
  elif [ $mex -ne $bex ]; then up=1; fi
  [ $up -eq 0 ] && continue   # 上游沒變 → 沒東西要帶下來

  # 本機相對 base 有沒有變（= 你動過沒）
  mine=0
  if [ $lex -eq 1 ] && [ $bex -eq 1 ]; then cmp -s "$SITE/$f" "$BASE/$f" || mine=1
  elif [ $lex -ne $bex ]; then mine=1; fi

  if [ $mine -eq 0 ]; then
    # 你沒動 → 安全套用上游
    backup "$f"
    if [ $mex -eq 1 ]; then
      mkdir -p "$SITE/$(dirname "$f")"; cp "$M/$f" "$SITE/$f"; echo "$f" >> "$UPDATED"
    else
      rm -f "$SITE/$f"; echo "$f" >> "$DELETED"
    fi
  else
    # 你動過：若你和上游的結果一致就無事（都刪、或都改成相同內容），否則衝突
    if [ $mex -eq $lex ] && { [ $mex -eq 0 ] || cmp -s "$SITE/$f" "$M/$f"; }; then
      :
    else
      echo "$f" >> "$CONFLICTS"
      if [ $mex -eq 1 ]; then mkdir -p "$CONFLICT_DIR/$(dirname "$f")"; cp "$M/$f" "$CONFLICT_DIR/$f"; fi
    fi
  fi
done < "$UNIV"

# ---------- 更新 base：同步成功的進到 M 版；衝突檔保留舊 base（下次再提醒） ----------
SAVED="$WORK/oldbase"; cp -R "$BASE" "$SAVED"
rm -rf "$BASE"; mkdir -p "$BASE"
(cd "$M" && find . -type f -print0 | while IFS= read -r -d '' p; do
    mkdir -p "$BASE/$(dirname "$p")"; cp "$M/$p" "$BASE/$p"; done)
# 衝突檔的 base 還原成舊版，讓下次仍偵測得到你 vs 上游的分歧
while IFS= read -r f; do
  [ -z "$f" ] && continue
  if [ -f "$SAVED/$f" ]; then mkdir -p "$BASE/$(dirname "$f")"; cp "$SAVED/$f" "$BASE/$f"
  else rm -f "$BASE/$f"; fi
done < "$CONFLICTS"

# ---------- 報告 ----------
nU=$(wc -l <"$UPDATED" | tr -d ' ')
nD=$(wc -l <"$DELETED" | tr -d ' ')
nC=$(wc -l <"$CONFLICTS" | tr -d ' ')
echo ""
echo "✓ 智慧同步完成（monorepo @ ${SRCSHA}）"
if [ "$nU" -gt 0 ]; then echo "→ 更新 $nU 個你沒動過的檔："; sed 's/^/   + /' "$UPDATED"; fi
if [ "$nD" -gt 0 ]; then echo "→ 跟著上游刪除 $nD 個你沒動過的檔："; sed 's/^/   - /' "$DELETED"; fi
[ "$nU" -gt 0 ] || [ "$nD" -gt 0 ] && echo "  （被改動的舊版已備份到 ${BACKUP#$SITE/}）"
if [ "$nC" -gt 0 ]; then
  echo ""
  echo "⚠ $nC 個檔「你和共用 repo 都改過」，未動你的版本，請你決定："
  sed 's/^/   ! /' "$CONFLICTS"
  echo "   共用 repo 的版本已放到 ${CONFLICT_DIR#$SITE/}/ 供比對，例如："
  firstc="$(head -1 "$CONFLICTS")"
  echo "     diff \"$SITE/$firstc\" \"$CONFLICT_DIR/$firstc\""
fi
[ "$nU" -eq 0 ] && [ "$nD" -eq 0 ] && [ "$nC" -eq 0 ] && echo "  已是最新，無變更。"
