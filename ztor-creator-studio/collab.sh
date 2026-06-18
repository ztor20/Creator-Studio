#!/usr/bin/env bash
# Ztor Creator Studio · site 共編流程
# 開功能分支 → commit → push → 開 PR（不直接動 main）。
# 用法: ./collab.sh "簡短變更說明"
#
# 認證：優先讀中央倉 ~/SynologyDrive/.cfg/personal.env 的 ZTOR20_GH_TOKEN（Yves 本機）；
#       協作者沒有該檔時，自動退回各自的 gh / git 既有登入。
set -euo pipefail

REPO_SLUG="ztor20/ztor-creator-studio"
HOST="github.com"

MSG="${1:-}"
if [ -z "$MSG" ]; then
  echo "用法: ./collab.sh \"簡短變更說明\""
  exit 1
fi

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

# 有沒有未提交變更（含未追蹤新檔）
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo "沒有未提交的變更，結束。"
  exit 0
fi

# 認證來源
CENTRAL="$HOME/SynologyDrive/.cfg/personal.env"
[ -f "$CENTRAL" ] && source "$CENTRAL" || true
TOKEN="${ZTOR20_GH_TOKEN:-}"

# 開功能分支（從目前 HEAD，帶著未提交變更），不直接動 main
BR="edit/$(date +%Y%m%d-%H%M%S)"
git switch -c "$BR"

git add -A
git commit -m "$MSG"

# push 分支 + 開 PR
if [ -n "$TOKEN" ]; then
  AUTH="https://x-access-token:${TOKEN}@${HOST}/${REPO_SLUG}.git"
  git push "$AUTH" "$BR"
  PR_URL="$(GH_TOKEN="$TOKEN" gh pr create --repo "$REPO_SLUG" --base main --head "$BR" \
            --title "$MSG" --body "由 collab.sh 自動建立。" 2>&1 | tail -1)" \
    || PR_URL="(PR 自動建立失敗，手動開: https://github.com/${REPO_SLUG}/pull/new/${BR})"
else
  git push -u origin "$BR"
  PR_URL="$(gh pr create --base main --head "$BR" --title "$MSG" --body "由 collab.sh 自動建立。" 2>&1 | tail -1)" \
    || PR_URL="(PR 自動建立失敗，手動開: https://github.com/${REPO_SLUG}/pull/new/${BR})"
fi

echo ""
echo "✓ 分支 ${BR} 已推送"
echo "  PR: ${PR_URL}"
echo "  → 在 GitHub 審查後合併進 main；本機切回 main：git switch main && git pull"
