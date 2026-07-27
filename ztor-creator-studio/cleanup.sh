#!/usr/bin/env bash
# Ztor Creator Studio · 清理 monorepo 上的殘留分支與重複 PR
# 用法:
#   ./cleanup.sh              # 完整報告 ＋ 執行安全清理
#   ./cleanup.sh --dry-run    # 只報告，什麼都不動
#   ./cleanup.sh --prune-only # 只刪殘留分支、不碰 PR、輸出精簡（pull.sh 會這樣呼叫）
#
# 為什麼需要這支（2026-07-26）:
#   collab.sh 每次執行都開一個新的 edit/<時間戳> 分支＋新 PR，不會回頭看有沒有等效的
#   PR 已經存在。同一個小改動連跑三次，就會長出三個內容一字不差的 PR。
#   加上 repo 沒開 delete_branch_on_merge，合併過的分支也不會自己消失。
#   兩件事疊起來，幾天內就累積出一堆看不出誰還有用的分支與 PR。
#
# 兩人不同電腦共用同一個 repo 的安全準則（這支腳本的核心）:
#   分支/PR 沒有「誰的機器」這個欄位，能區分的只有 PR 的作者帳號（各人用各自的 token）。
#   所以清理只做「不論誰跑都不可能弄壞別人工作」的事：
#
#   會自動刪 —— 已 MERGED 的 PR 分支（不分作者）
#     內容已經在 main 裡，分支只是殘骸；刪掉對任何人都沒有損失。
#     這些分支是 collab.sh 一次性產生的快照，沒有人會 checkout 它繼續工作。
#
#   會自動刪 —— 已 CLOSED 的 PR 分支（僅限自己開的）
#     關掉＝已經決定不要了。別人關的留著，讓他們自己決定要不要 reopen。
#
#   會自動關 —— 自己開的、內容與另一個較新的 PR 完全相同的 open PR
#     比對的是子目錄的 tree SHA（git 的內容指紋），相同就是逐位元組相同，不是猜的。
#     只比自己的 PR；別人的 PR 就算內容相同也不動。
#
#   絕不自動處理 —— 沒有對應 PR 的分支
#     可能是對方的 collab.sh 正跑到一半（分支已推、PR 還沒開）。只列出來提醒。
#
#   絕不自動處理 —— 別人的 open PR、以及自己那些有衝突的舊 PR
#     前者不是我們的決定；後者要人看過內容才知道還有沒有用。只列出來。
#
# 認證：讀中央倉 ~/AI/cfg/personal.env 的 ZTOR20_GH_TOKEN。
set -euo pipefail

REPO_SLUG="ztor20/Creator-Studio"
SUBDIR="ztor-creator-studio"
BR_PREFIX="edit/"
STALE_DAYS=3          # 孤兒分支超過幾天才提醒

MODE="full"
for a in "$@"; do
  case "$a" in
    --dry-run)    MODE="dry" ;;
    --prune-only) MODE="prune" ;;
    -h|--help)    sed -n '2,8p' "$0"; exit 0 ;;
    *) echo "未知參數: $a（可用 --dry-run / --prune-only）"; exit 1 ;;
  esac
done

CENTRAL="$HOME/AI/cfg/personal.env"
[ -f "$CENTRAL" ] || CENTRAL="$HOME/SynologyDrive/.cfg/personal.env"
# shellcheck disable=SC1090
[ -f "$CENTRAL" ] && source "$CENTRAL" || true
TOKEN="${ZTOR20_GH_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  [ "$MODE" = "prune" ] && exit 0   # 被 pull.sh 呼叫時安靜略過
  echo "找不到 ZTOR20_GH_TOKEN（中央倉 $CENTRAL）。"
  exit 1
fi
export GH_TOKEN="$TOKEN"

if ! command -v gh >/dev/null 2>&1; then
  [ "$MODE" = "prune" ] && exit 0
  echo "找不到 gh CLI，無法清理。"
  exit 1
fi

say() { [ "$MODE" = "prune" ] || echo "$@"; }

ME="$(gh api user --jq .login 2>/dev/null || true)"
if [ -z "$ME" ]; then
  [ "$MODE" = "prune" ] && exit 0
  echo "無法確認登入身分（token 失效？），停止。"
  exit 1
fi

# ── 一次抓齊資料（避免逐分支打 API）────────────────────────────
PRS="$(gh pr list --repo "$REPO_SLUG" --state all --limit 300 \
        --json number,state,headRefName,author,title,updatedAt,mergeable \
        --jq '.[] | [.headRefName, .state, .author.login, .number, .mergeable, .updatedAt, .title] | @tsv' \
        2>/dev/null || true)"
BRANCHES="$(gh api "repos/$REPO_SLUG/branches?per_page=100" --paginate --jq '.[].name' 2>/dev/null || true)"

say "身分：$ME · repo：$REPO_SLUG"
say ""

# ── 1) 刪殘留分支 ─────────────────────────────────────────────
DELETED=0
SKIPPED_OTHER=0
while IFS=$'\t' read -r br state author num mergeable updated title; do
  [ -z "${br:-}" ] && continue
  case "$br" in "$BR_PREFIX"*) ;; *) continue ;; esac
  printf '%s\n' "$BRANCHES" | grep -qxF "$br" || continue   # 分支已不存在

  case "$state" in
    MERGED) ;;                                              # 任何人的都可刪：內容已在 main
    CLOSED)
      if [ "$author" != "$ME" ]; then
        SKIPPED_OTHER=$((SKIPPED_OTHER+1)); continue        # 別人關的，留給他們決定
      fi
      ;;
    *) continue ;;                                          # OPEN 的分支絕不刪
  esac

  if [ "$MODE" = "dry" ]; then
    say "  [dry-run] 會刪除 $br（PR #$num · $state）"
    DELETED=$((DELETED+1))
  elif gh api -X DELETE "repos/$REPO_SLUG/git/refs/heads/$br" >/dev/null 2>&1; then
    say "  · 已刪 $br（PR #$num · $state）"
    DELETED=$((DELETED+1))
  fi
done <<< "$PRS"

if [ "$MODE" = "prune" ]; then
  [ "$DELETED" -gt 0 ] && echo "✓ 已清掉 ${DELETED} 個已合併／已關閉 PR 的殘留分支"
  exit 0
fi

if [ "$DELETED" -gt 0 ]; then
  say "✓ 殘留分支清掉 ${DELETED} 個"
else
  say "✓ 沒有殘留分支要清"
fi
[ "$SKIPPED_OTHER" -gt 0 ] && say "  ⓘ 另有 ${SKIPPED_OTHER} 個是別人關閉的 PR 分支，保留不動"
say ""

# ── 2) 找出自己的「內容完全相同」重複 open PR ─────────────────
# 比對方法：取每個 PR head commit 底下 ztor-creator-studio/ 的 tree SHA。
# tree SHA 是 git 對「這包檔案內容」的指紋——相同就是逐位元組相同，不是靠標題猜。
# 只比子目錄，不比整個 repo root，這樣 main 在兩次發版之間有沒有前進都不影響判斷。
MY_OPEN="$(printf '%s\n' "$PRS" | awk -F'\t' -v me="$ME" '$2=="OPEN" && $3==me {print $4"\t"$1}')"

PAIRS=""
if [ -n "$MY_OPEN" ]; then
  while IFS=$'\t' read -r num br; do
    [ -z "${num:-}" ] && continue
    oid="$(gh api "repos/$REPO_SLUG/git/ref/heads/$br" --jq .object.sha 2>/dev/null || true)"
    [ -z "$oid" ] && continue
    root="$(gh api "repos/$REPO_SLUG/git/commits/$oid" --jq .tree.sha 2>/dev/null || true)"
    [ -z "$root" ] && continue
    sub="$(gh api "repos/$REPO_SLUG/git/trees/$root" \
           --jq ".tree[] | select(.path==\"$SUBDIR\") | .sha" 2>/dev/null || true)"
    [ -z "$sub" ] && continue
    PAIRS="${PAIRS}${sub} ${num}"$'\n'
  done <<< "$MY_OPEN"
fi

# 同一個 tree 分成一組，保留編號最大（最新）那個，其餘是重複
DUPES="$(printf '%s' "$PAIRS" | grep -v '^$' | sort -k1,1 -k2,2nr \
         | awk '{ if ($1 == prev) print $2; else prev = $1 }' || true)"

if [ -n "$DUPES" ]; then
  say "重複 PR（內容與另一個較新的 PR 完全相同，且都是你開的）："
  while IFS= read -r num; do
    [ -z "$num" ] && continue
    t="$(printf '%s\n' "$PRS" | awk -F'\t' -v n="$num" '$4==n {print $7}')"
    if [ "$MODE" = "dry" ]; then
      say "  [dry-run] 會關閉 #$num — $t"
    else
      gh pr close "$num" --repo "$REPO_SLUG" --delete-branch \
        --comment "重複 PR：子目錄內容與另一個較新的 PR 完全相同（tree SHA 一致），由 cleanup.sh 自動關閉。" \
        >/dev/null 2>&1 && say "  · 已關閉 #$num — $t"
    fi
  done <<< "$DUPES"
  say ""
fi

# ── 3) 需要人決定的，只列出不處理 ─────────────────────────────
NEED_YOU="$(printf '%s\n' "$PRS" | awk -F'\t' -v me="$ME" -v d="$DUPES" '
  $2=="OPEN" && $3==me {
    skip=0; n=split(d, a, "\n"); for (i=1;i<=n;i++) if (a[i]==$4) skip=1
    if (!skip) printf "  #%s %s%s\n", $4, ($5=="CONFLICTING" ? "（與 main 衝突）" : ""), $7
  }')"
if [ -n "$NEED_YOU" ]; then
  say "你自己還開著的 PR（要不要留由你決定，腳本不動）："
  say "$NEED_YOU"
  say ""
fi

OTHERS="$(printf '%s\n' "$PRS" | awk -F'\t' -v me="$ME" '
  $2=="OPEN" && $3!=me { printf "  #%s（%s）%s\n", $4, $3, $7 }')"
if [ -n "$OTHERS" ]; then
  say "別人開著的 PR（一律不動）："
  say "$OTHERS"
  say ""
fi

# 孤兒分支：有分支但完全沒有對應的 PR。可能是對方 collab.sh 正跑到一半，絕不自動刪。
NOW="$(date +%s)"
ORPHANS=""
while IFS= read -r br; do
  [ -z "${br:-}" ] && continue
  case "$br" in "$BR_PREFIX"*) ;; *) continue ;; esac
  printf '%s\n' "$PRS" | awk -F'\t' -v b="$br" '$1==b {found=1} END {exit !found}' && continue
  # 從分支名的時間戳推算年紀：edit/YYYYmmdd-HHMMSS
  ts="${br#"$BR_PREFIX"}"
  d="${ts%%-*}"
  age_d="?"
  if [ ${#d} -eq 8 ]; then
    bt="$(date -j -f "%Y%m%d" "$d" +%s 2>/dev/null || date -d "$d" +%s 2>/dev/null || true)"
    [ -n "$bt" ] && age_d=$(( (NOW - bt) / 86400 ))
  fi
  if [ "$age_d" = "?" ] || [ "$age_d" -ge "$STALE_DAYS" ]; then
    ORPHANS="${ORPHANS}  $br（無對應 PR · 約 ${age_d} 天前）"$'\n'
  fi
done <<< "$BRANCHES"

if [ -n "$ORPHANS" ]; then
  say "孤兒分支（沒有任何 PR 指向它，可能是別人發版跑到一半；不自動刪）："
  say "$ORPHANS"
fi

say "完成。"
