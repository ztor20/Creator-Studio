#!/usr/bin/env python3
"""全站 id 稽核（2026-08-17 建）

兩種錯，都不會在畫面上留下痕跡，只能靠掃：

1. **重複的 id** —— `getElementById` 只拿得到先出現的那一個。2026-08-17 踩過：
   「活動內容」的表演陣容欄位與新增的「場次與票務概況」卡都叫 `ed-lineup`，
   結果那張卡從未被填、陣容渲染到錯的地方。

2. **JS 引用了 markup 已不存在的 id** —— 對 null 設值直接拋錯，整段初始化中斷在那一行。
   2026-08-17 踩過：`initLive()` 第二行動到已被合併掉的 `#ed-checkin-snapshot`，
   於是進行中的活動每個數字都是破折號（畫面完全正常，只是沒填）。

搬移或合併元素之後跑一次：
    python3 scripts/audit_ids.py

註：有 null 防護（`if (!x) return`、`?.`、動態建立）的殘留引用會被列出但不算錯，
   看一眼確認即可——腳本不判斷防護，那需要真正的語法分析。
"""
import re, glob, os
from collections import Counter

pages = sorted(p for p in glob.glob('*.html')
               if not p.startswith(('demo-', 'section-test')) and p != 'design-system.html')
bad_dup, bad_stale = [], []
for p in pages:
    s = open(p, encoding='utf-8').read()
    ids = re.findall(r'\sid="([^"]+)"', s)
    dup = sorted(k for k, v in Counter(ids).items() if v > 1)
    if dup: bad_dup.append((p, dup))
    have = set(ids)
    used = (set(re.findall(r"""\$\('#([\w-]+)'\)""", s))
          | set(re.findall(r"""getElementById\(['"]([\w-]+)['"]\)""", s))
          | set(re.findall(r"""querySelector\(['"]#([\w-]+)['"]""", s)))
    stale = sorted(used - have)
    if stale: bad_stale.append((p, stale))

print("掃描頁數：", len(pages))
print("\n── 重複的 id ──")
if bad_dup:
    for p, d in bad_dup: print(f"  {p}: {', '.join(d)}")
else: print("  無")
print("\n── JS 引用了 markup 不存在的 id ──")
if bad_stale:
    for p, d in bad_stale: print(f"  {p}: {', '.join(d)}")
else: print("  無")
