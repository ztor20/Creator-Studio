#!/usr/bin/env bash
# gh-auth.sh — 解析「對 ztor20/Creator-Studio 真的推得動」的 GitHub 憑證。
#
# 為什麼要有這支（2026-08-19，同一題踩三次之後）：
#   原本 collab.sh／pull.sh 各自只認中央倉的 ZTOR20_GH_TOKEN。那把是細粒度 PAT，
#   **讀與寫是分開授權的**——Contents 只給 Read 時，讀得到 repo、REST API 的
#   `permissions` 甚至回 {"push": true}（那是「使用者在 repo 的角色」，不是這把
#   token 的授權範圍），但真的 push 就 403。加上 collab.sh 把 push 輸出導掉了
#   （`>/dev/null 2>&1`），失敗看起來像「跑到一半自己結束」，於是同一題查了三次。
#
# 這支做兩件事：
#   1. 依序收集候選憑證：中央倉的 ZTOR20_GH_TOKEN → gh 已登入且對本 repo 推得動的帳號
#   2. **實際試推**一個丟棄分支來驗證寫入權（唯一可靠的判斷方式），選出第一個可用的
#
# 用法：
#   source gh-auth.sh
#   gh_token_read   → 印出可讀的 token（找不到回傳 1）
#   gh_token_write  → 印出可寫的 token（找不到回傳 1，並把原因印到 stderr）

_gha_repo="${REPO_SLUG:-ztor20/Creator-Studio}"
_gha_host="${HOST:-github.com}"

# 候選清單：中央倉優先（協作者各自的 token），其次本機 gh 的每個登入帳號
# 註：一律用「local x=...」單一語句，不要先宣告再賦值——在 zsh 下 source 這支時，
# 單獨一行的 local 會把變數印出來，污染這個函式的輸出（它的 stdout 就是候選清單，
# 多一行就會讓下游的 read 配對整個錯開；2026-08-19 實測踩過）。
_gha_candidates() {
  local central="$HOME/AI/cfg/personal.env"
  [ -f "$central" ] || central="$HOME/SynologyDrive/.cfg/personal.env"
  if [ -f "$central" ]; then
    # 只取這一個變數，不把整個憑證檔 source 進當前 shell
    local t="$(grep -oE '^[[:space:]]*(export[[:space:]]+)?ZTOR20_GH_TOKEN[[:space:]]*=.*' "$central" 2>/dev/null \
         | tail -1 | sed -E 's/^[^=]*=[[:space:]]*//; s/^["'\'']//; s/["'\'']$//')"
    [ -n "$t" ] && printf '%s\t%s\n' "central:ZTOR20_GH_TOKEN" "$t"
  fi
  if command -v gh >/dev/null 2>&1; then
    local accs="$(gh auth status 2>/dev/null | grep -oE 'account [A-Za-z0-9_-]+' | awk '{print $2}' | sort -u)"
    local acc
    for acc in $accs; do
      local gt="$(gh auth token --user "$acc" 2>/dev/null || true)"
      [ -n "$gt" ] && printf '%s\t%s\n' "gh:$acc" "$gt"
    done
  fi
}

gh_token_read() {
  local name tok
  while IFS=$'\t' read -r name tok; do
    [ -z "${tok:-}" ] && continue
    if curl -fsS -o /dev/null -H "Authorization: token $tok" \
         "https://api.$_gha_host/repos/$_gha_repo" 2>/dev/null; then
      printf '%s' "$tok"; return 0
    fi
  done < <(_gha_candidates)
  echo "找不到能讀 $_gha_repo 的憑證（中央倉 ZTOR20_GH_TOKEN 或 gh 登入）。" >&2
  return 1
}

# 實際試推一個丟棄分支才算數——REST 的 permissions 會騙人（見檔頭）。
# 推成功立刻把分支刪掉；推失敗遠端不會留下任何東西。
gh_token_write() {
  local name tok probe tmp rc
  probe="probe/write-check-$$"
  while IFS=$'\t' read -r name tok; do
    [ -z "${tok:-}" ] && continue
    tmp="$(mktemp -d)"
    if git clone -q --depth 1 "https://x-access-token:$tok@$_gha_host/$_gha_repo.git" "$tmp/r" 2>/dev/null; then
      (
        cd "$tmp/r" || exit 1
        git -c user.name=probe -c user.email=probe@local commit -q --allow-empty -m probe
        git checkout -qb "$probe"
        git push -q origin "$probe" 2>/dev/null
      )
      rc=$?
      if [ $rc -eq 0 ]; then
        git -C "$tmp/r" push -q origin --delete "$probe" >/dev/null 2>&1 || true
        rm -rf "$tmp"
        echo "→ 寫入憑證：$name" >&2
        printf '%s' "$tok"; return 0
      fi
    fi
    rm -rf "$tmp"
    echo "  ✗ $name 對 $_gha_repo 沒有寫入權" >&2
  done < <(_gha_candidates)
  cat >&2 <<'MSG'
✗ 沒有任何憑證推得動這個 repo。兩條路擇一：
  (a) 把中央倉 ZTOR20_GH_TOKEN 那把細粒度 PAT 的 Contents 與 Pull requests
      都改成 Read and write（https://github.com/settings/tokens?type=beta）
  (b) 用 gh 登入一個對該 repo 有寫入權的帳號：gh auth login
MSG
  return 1
}
