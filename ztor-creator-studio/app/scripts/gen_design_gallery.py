#!/usr/bin/env python3
"""gen_design_gallery.py · 從 design-system.html 生成設計師視角的元件圖鑑 design-components.html

用法（從 site/r2.3 執行）：
  python3 scripts/gen_design_gallery.py                 # 全部元件卡
  python3 scripts/gen_design_gallery.py --only button,badge,input   # 只生成指定 id（樣板用）

原則：不重寫任何內容。每張卡＝標題＋一句用途＋原卡的渲染區（matrix-block／demo／viz／preview，
逐字搬過來、吃同一批元件 CSS）＋「規則與說明」摺疊（原卡其餘內容，只顯示中文）。
design-system.html 改了，重跑一次就同步；本檔是唯一來源，design-components.html 勿手改。
"""
import re, sys, argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "design-system.html"
OUT = ROOT / "design-components.html"

NAV = """<nav class="dsn" aria-label="Design">
  <a class="dsn__brand" href="design-tokens.html">Ztor Creator Studio <span>Design</span></a>
  <div class="dsn__tabs">
    <a href="design-tokens.html">Tokens</a>
    <a href="design-layers.html">Layers</a>
    <a href="design-components.html" aria-current="page">Components</a>
    <a href="design-system.html">Spec</a>
  </div>
  <div class="segmented dsn__theme" role="group" aria-label="Theme">
    <button class="segmented__btn" type="button" data-theme-set="light">亮</button>
    <button class="segmented__btn" type="button" data-theme-set="dark">暗</button>
  </div>
</nav>"""


GALLERY_CSS = """
/* ── 圖鑑版面（dg- 前綴，一次性） ── */
.dg-count { font-size: var(--fs-12); color: var(--faint-ink); }
/* 分區（atom／molecule／organism）：標題＋名稱索引 chips，點了跳卡 */
.dg-group { margin-top: var(--sp-56); scroll-margin-top: 110px; }
.dg-group__head { display: flex; align-items: baseline; gap: var(--sp-10); margin-bottom: var(--sp-12); }
.dg-group__title { font-family: var(--font-display); font-size: var(--fs-24); font-weight: var(--fw-light); margin: 0; }
.dg-group__count { font-family: var(--font-mono); font-size: var(--fs-12); color: var(--faint-ink); }
.dg-index { display: flex; flex-wrap: wrap; gap: var(--sp-6); margin-bottom: var(--sp-8); }
.dg-index a { display: inline-flex; align-items: center; height: var(--control-h-xs); padding: 0 var(--sp-10); border-radius: var(--radius-pill); background: var(--ztu-film); color: var(--muted-foreground); font-size: var(--fs-12); }
.dg-index a:hover { background: var(--ztu-glass-strong); color: var(--foreground); }
.dg-index a[hidden] { display: none; }
.dg-bar__groups { display: flex; gap: var(--sp-4); }
.dg-bar__groups a { display: inline-flex; align-items: center; height: var(--control-h-xs); padding: 0 var(--sp-10); border-radius: var(--radius-pill); font-size: var(--fs-12); color: var(--muted-foreground); }
.dg-bar__groups a:hover { background: var(--ztu-glass-strong); color: var(--foreground); }
/* 卡片預設只展開第一個示範，其餘收進「更多示範」 */
.dg-more { margin-top: var(--sp-4); }
.dg-more[open] > summary { margin-bottom: var(--sp-12); }
.dg-more > .dg-card__render { margin-top: 0; }
/* 元件之間用分隔線＋間距分（2026-09-16 使用者裁示），不包卡：渲染區直接坐在 L0 檯面上，
   所以 .matrix-block 在這裡是第一層＝L1（規則寫在 design-system.html 的 <style>，本頁搬過來） */
.dg-card { border-top: 1px solid var(--border-soft); padding: var(--sp-32) 0 var(--sp-24); margin-top: var(--sp-16); scroll-margin-top: 120px; }
.dg-group .dg-card:first-of-type { border-top: 0; margin-top: 0; }
.dg-card[hidden] { display: none; }
.dg-card__head { display: flex; align-items: baseline; gap: var(--sp-10); flex-wrap: wrap; margin-bottom: var(--sp-4); }
.dg-card__title { font-family: var(--font-display); font-size: var(--fs-20); font-weight: var(--fw-regular); margin: 0; }
.dg-card__num { font-family: var(--font-mono); font-size: var(--fs-11); color: var(--faint-ink); }
.dg-card__link { margin-left: auto; font-size: var(--fs-12); color: var(--muted-foreground); }
.dg-card__link:hover { color: var(--brand-ink); text-decoration: underline; text-underline-offset: 2px; }
.dg-card__one { margin: 0 0 var(--sp-16); font-size: var(--fs-14); color: var(--muted-foreground); max-width: 80ch; }
.dg-card__render { display: grid; gap: var(--sp-16); }
.dg-wrap { overflow-x: clip; }   /* 抽屜這類 fixed 浮層關著時面板在畫面外，別讓它撐出橫向捲軸 */
.dg-card__render > .demo, .dg-card__render > .matrix-block { overflow-x: auto; }
.dg-card__render .field-text, .dg-card__render .field-label { display: none; }
.dg-rules { margin-top: var(--sp-16); border-top: 1px solid var(--border-soft); padding-top: var(--sp-10); }
.dg-rules .sub__head, .dg-rules .sub__desc:first-of-type { display: none; }
.dg-rules .field-label { margin-top: var(--sp-16); }
.dg-empty { padding: var(--sp-24); color: var(--faint-ink); font-size: var(--fs-13); }
@media (max-width: 720px) { .dg-card { padding: var(--sp-16) 0; } }
"""

RENDER_CLASSES = ("matrix-block", "demo", "viz", "preview", "gallery")


def balanced_div(html: str, start: int) -> int:
    """回傳從 start（指向 '<div'）開始、對應的 </div> 結束位置（exclusive）。"""
    depth = 0
    i = start
    tag_re = re.compile(r"<(/?)div\b[^>]*>", re.I)
    while True:
        m = tag_re.search(html, i)
        if not m:
            raise ValueError("balanced_div: <div> 沒有對應的 </div>，來源 HTML 可能不平衡：" + html[start:start + 120])
        if m.group(1) == "":
            depth += 1
        else:
            depth -= 1
            if depth == 0:
                return m.end()
        i = m.end()


def extract_render_blocks(section: str):
    """把最外層的渲染容器（matrix-block／demo／viz／preview／gallery）整塊抽出；回傳 (blocks, rest)。"""
    blocks, rest, i = [], [], 0
    # 也認裸的 <table class="matrix">（沒包在 .matrix-block 裡；2026-09-16 驗收在 chart 卡抓到）
    open_re = re.compile(r'<(div|table)\b[^>]*class="([^"]*)"[^>]*>')
    while True:
        m = open_re.search(section, i)
        if not m:
            rest.append(section[i:])
            break
        tag, classes = m.group(1), m.group(2).split()
        if tag == "div" and any(c in RENDER_CLASSES or c.startswith("demo--") for c in classes):
            end = balanced_div(section, m.start())
        elif tag == "table" and "matrix" in classes:
            end = section.index("</table>", m.end()) + len("</table>")
        else:
            rest.append(section[i:m.end()])
            i = m.end()
            continue
        rest.append(section[i:m.start()])
        blocks.append(section[m.start():end])
        i = end
    return blocks, "".join(rest)


def text_of(html: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html)).strip()


def first_sentence(s: str) -> str:
    for sep in ("。", "；", "——"):
        if sep in s:
            return s.split(sep, 1)[0] + ("。" if sep == "。" else "")
    return s


def prune_style(style: str, used_html: str) -> str:
    """只留卡片真的用到的 DS 頁樣式：選擇器裡的 class 有出現在生成內容才留；
    [data-lang] 顯隱規則永遠留。這樣 Pillar 1–3 的示範專用樣式（mode-pane、contrast-grid…）
    不會被搬進來（它們帶裸色，且圖鑑用不到）。"""
    import re as _re
    used = set(_re.findall(r'class="([^"]*)"', used_html))
    used = {c for cs in used for c in cs.split()}
    out, buf, depth = [], [], 0
    # 粗切：以最外層 { } 配對切成規則（@media 內整塊視為一條）
    i, start = 0, 0
    while i < len(style):
        ch = style[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                rule = style[start:i + 1]
                start = i + 1
                sel = rule.split("{", 1)[0]
                if "[data-lang" in sel or sel.strip().startswith("@") and "data-lang" in rule:
                    out.append(rule)
                else:
                    classes = set(_re.findall(r"\.([A-Za-z_][\w-]*)", sel))
                    if not classes or classes & used:
                        out.append(rule)
        i += 1
    return "\n".join(r.strip() for r in out if r.strip())


def build(only=None):
    html = SRC.read_text(encoding="utf-8")
    # 不用行首行尾錨點：design-system.html 有一行黏了 16 支 <link>（2026-09-16 驗收抓到的漏洞）
    # 從整份文件收集（DS 頁有幾支 <link> 是後來在 body 裡補掛的），去重保序
    links = [l for l in dict.fromkeys(re.findall(r'<link rel="stylesheet"[^>]*>', html)) if "ds-doc.css" not in l]   # ds-doc.css 由下方固定加一次
    style = re.search(r"<style>(.*?)</style>", html, re.S).group(1)
    # Pillar 4 範圍
    p4 = html.index('<section class="pillar" id="component"')
    p5 = html.index('<section class="pillar" id="pattern', p4)
    body = html[p4:p5]
    cards = []
    for m in re.finditer(r'<section class="sub" id="([^"]+)">', body):
        sid = m.group(1)
        if sid in ("classification", "inventory"):
            continue
        if only and sid not in only:
            continue
        end = body.index("\n</section>", m.start())
        sec = body[m.end():end]
        title_m = re.search(r'<h3 class="sub__title">(.*?)</h3>', sec, re.S)
        title = text_of(title_m.group(1)) if title_m else sid
        num, _, name = title.partition(" ")
        layer_m = re.search(r'<span class="layer[^"]*">.*?</span>', sec, re.S)
        layer = layer_m.group(0) if layer_m else ""
        desc_m = re.search(r'<p class="sub__desc" data-zh>(.*?)</p>', sec, re.S)
        one = first_sentence(text_of(desc_m.group(1))) if desc_m else ""
        blocks, rest = extract_render_blocks(sec)
        if blocks:
            render = '<div class="dg-card__render">\n' + blocks[0] + '\n</div>'
            if len(blocks) > 1:
                render += f'\n<details class="dg-more dsd-fold"><summary>更多示範（{len(blocks) - 1}）</summary><div class="dg-card__render">\n' + "\n".join(blocks[1:]) + '\n</div></details>'
        else:
            render = '<p class="dg-empty">這張卡在規格全文裡沒有渲染區。</p>'
        tier = "atom" if "layer--atom" in layer else "molecule" if "layer--molecule" in layer else "organism" if "layer--organism" in layer else "other"
        cards.append((tier, name, sid, f"""<article class="dg-card" id="{sid}" data-search="{(title + ' ' + one).lower().replace('"', '')}">
  <div class="dg-card__head"><span class="dg-card__num">{num}</span><h2 class="dg-card__title">{name}</h2>{layer}<a class="dg-card__link" href="design-system.html#{sid}">Spec →</a></div>
  <p class="dg-card__one">{one}</p>
{render}
  <details class="dg-rules dsd-fold"><summary>規則與說明</summary>
{rest}
  </details>
</article>"""))
    TIERS = [("atom", "Atoms", "最小的可重用單位：按鈕、輸入框、徽章、圖示"), ("molecule", "Molecules", "幾個 atom 組成的小任務單元：篩選列、搜尋框、表單列"), ("organism", "Organisms", "完整的功能區塊：表頭、資料表、編輯器、精靈流程"), ("other", "Other", "")]
    groups_html, bar_groups = [], []
    for tier, title, lead in TIERS:
        items = [c for c in cards if c[0] == tier]
        if not items:
            continue
        index = "".join(f'<a href="#{sid}" data-for="{sid}">{name}</a>' for _, name, sid, _ in items)
        groups_html.append(f"""<section class="dg-group" id="tier-{tier}">
  <div class="dg-group__head"><h2 class="dg-group__title">{title}</h2><span class="dg-group__count">{len(items)}</span><span class="dg-count">{lead}</span></div>
  <div class="dg-index">{index}</div>
{chr(10).join(c[3] for c in items)}
</section>""")
        bar_groups.append(f'<a href="#tier-{tier}">{title} <span class="dg-count">{len(items)}</span></a>')
    style = prune_style(style, "\n".join(c[3] for c in cards))
    # DS 頁尾的 JS：示範有一部分是 JS 畫的（zselect、date-input、upload-tile…）。
    # <script src> 全搬（icons-all.js 1.8MB 例外：圖鑑用產品頁 registry 就夠）；
    # 頁尾 inline script 逐塊包 try/catch——它們有些只服務 DS 頁的目錄／語言切換，元素不在時會丟錯，包起來不讓一塊炸掉其餘。
    tail = html[html.rindex("</section>"):]
    tail_srcs = [t for t in re.findall(r'<script src="[^"]+"></script>', tail) if "icons-all.js" not in t]
    inline = re.findall(r"<script>(?!\(function\(\)\{var h=)(.*?)</script>", tail, re.S)
    tail_inline = "\n".join("<script>try {\n" + blk + "\n} catch (e) { console.warn('[gallery] DS 頁尾 script 略過：', e.message); }</script>" for blk in inline)
    # DS 頁 chrome 裡兩處裸值換成等值 token，讓圖鑑過檢查 10：
    # #000 → --surface-inverse（亮暗皆 #000000，色值不變）；code 的 0.92em → --fs-12
    style = style.replace(", #000)", ", var(--surface-inverse))").replace("font-size: 0.92em", "font-size: var(--fs-12)").replace("color: #e8e8e8", "color: var(--foreground-on-inverse)")
    out = f"""<!doctype html>
<html lang="zh-Hant" data-theme="dark" data-lang="zh">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>元件 · Ztor Creator Studio Design</title>
<!-- 機器生成：scripts/gen_design_gallery.py 從 design-system.html 抽出，勿手改；改 design-system.html 後重跑 -->
<script src="js/theme.js?v=r2.2"></script>
{chr(10).join(links)}
<link rel="stylesheet" href="ds-doc.css?v=r2.2">
<style>
/* 以下第一段逐字取自 design-system.html 的 <style>（demo 容器與卡內排版靠它），之後是圖鑑自己的殼 */
{style}
{GALLERY_CSS}
</style>
</head>
<body>
{NAV}
<div class="dsd-wrap dg-wrap">
  <h1 class="dsd-title">Components</h1>
  <p class="dsd-sub">一句用途＋真元件渲染，規則收在卡底。內容取自 Spec，重跑腳本即同步。</p>
  <div class="dsd-bar"><input class="input" id="dg-search" type="search" placeholder="搜尋" autocomplete="off"><span class="dg-count" id="dg-count">{len(cards)} 支</span><span class="dg-bar__groups">{"".join(bar_groups)}</span></div>
{chr(10).join(groups_html)}
</div>
{chr(10).join(tail_srcs)}
{tail_inline}
<script>
(function () {{
  var root = document.documentElement;
  function theme() {{ var cur = root.getAttribute('data-theme'); document.querySelectorAll('[data-theme-set]').forEach(function (b) {{ b.classList.toggle('segmented__btn--active', b.dataset.themeSet === cur); }}); }}
  theme(); new MutationObserver(theme).observe(root, {{ attributes: true, attributeFilter: ['data-theme'] }});
  var cards = document.querySelectorAll('.dg-card'), count = document.getElementById('dg-count');
  document.getElementById('dg-search').addEventListener('input', function (e) {{
    var q = e.target.value.trim().toLowerCase(), n = 0;
    cards.forEach(function (c) {{
      var hit = !q || c.dataset.search.indexOf(q) !== -1; c.hidden = !hit; if (hit) n++;
      var chip = document.querySelector('.dg-index a[data-for="' + c.id + '"]'); if (chip) chip.hidden = !hit;
    }});
    document.querySelectorAll('.dg-group').forEach(function (g) {{ g.hidden = !g.querySelector('.dg-card:not([hidden])'); }});
    count.textContent = n + ' 支';
  }});
}})();
</script>
</body>
</html>
"""
    OUT.write_text(out, encoding="utf-8")
    print(f"{OUT.name}: {len(cards)} 張卡, {len(out)//1024} KB")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="逗號分隔的 section id")
    a = ap.parse_args()
    build(set(a.only.split(",")) if a.only else None)
