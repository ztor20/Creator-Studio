#!/usr/bin/env python3
"""把 starfield-gradients.css 的四層 radial-gradient 星點烘成四張平鋪 PNG。

用法（在本資料夾內）：
    python3 bake.py

輸出：site/r2.3/images/starfield-{a,b,c,d}.png

設計要點
--------
1. 2 倍解析度：PNG 實際像素 = tile x 2（retina 螢幕 devicePixelRatio = 2）。
   CSS 端 background-size 仍寫原本的 tile px，瀏覽器縮一半顯示，星點才不糊。
2. 硬邊圓點：CSS 寫的是 radial-gradient(color Rpx, transparent Rpx)，
   也就是實心圓、邊緣直接切斷，沒有柔邊。這裡對每顆星在它自己的小方框內
   以 16 倍超取樣畫實心圓，再用 BOX（面積平均）縮回輸出網格，
   等於算出每個輸出像素被圓覆蓋的面積比例——瀏覽器的抗鋸齒就是這樣做的。
   （試過 LANCZOS，它在硬邊會過衝，整體亮度比解析解多約 19%，所以不用。）
3. 圓心位置：CSS 的 radial-gradient 預設圓心在自己 tile 的正中央，
   background-position 是整個圖層的位移，所以實際圓心座標是
   ((X + tile/2) mod tile, (Y + tile/2) mod tile)。
4. 邊緣環繞：靠近 tile 邊界的圓點必須在對邊補畫（±tile 九宮格），
   否則平鋪時會出現接縫。

只用 Python 標準函式庫 + Pillow。可重複執行，結果穩定。
"""

import re
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw

# 每顆星在自己的小方框內超取樣的倍率（之後以面積平均縮回輸出網格）
SUPERSAMPLE = 16
# 最終 PNG 相對 CSS px 的倍率（retina devicePixelRatio = 2）
SCALE = 2

HERE = Path(__file__).resolve().parent
SRC_CSS = HERE / "starfield-gradients.css"
OUT_DIR = HERE.parent.parent / "images"

# 靠 animation 的 keyframes 名稱決定輸出檔名，跟選擇器寫法解耦
LAYER_SUFFIX = {
    "ztu-star-a": "a",
    "ztu-star-b": "b",
    "ztu-star-c": "c",
    "ztu-star-d": "d",
}

BLOCK_RE = re.compile(r"([^{}]+)\{([^{}]*)\}", re.S)
GRADIENT_RE = re.compile(
    r"radial-gradient\(\s*rgb\(\s*255\s+255\s+255\s*/\s*([\d.]+)%\s*\)\s*"
    r"([\d.]+)px\s*,\s*transparent\s*[\d.]+px\s*\)"
)
POSITION_RE = re.compile(r"(-?[\d.]+)px\s+(-?[\d.]+)px")
ANIM_NAME_RE = re.compile(r"(ztu-star-[a-z])")


def decl(body, prop):
    """從規則內文取出某個宣告的值（不含結尾分號）。"""
    m = re.search(prop + r"\s*:\s*(.*?);", body, re.S)
    return m.group(1) if m else None


def parse_layers(css_text):
    """回傳 [(suffix, tile, [(cx, cy, radius, alpha), ...]), ...]。"""
    layers = []
    for selector, body in BLOCK_RE.findall(css_text):
        anim = decl(body, "animation")
        if not anim:
            continue
        name_m = ANIM_NAME_RE.search(anim)
        if not name_m or name_m.group(1) not in LAYER_SUFFIX:
            continue
        suffix = LAYER_SUFFIX[name_m.group(1)]

        images = GRADIENT_RE.findall(decl(body, "background-image") or "")
        sizes = POSITION_RE.findall(decl(body, "background-size") or "")
        positions = POSITION_RE.findall(decl(body, "background-position") or "")

        if not images:
            raise SystemExit(f"{selector.strip()}：找不到 radial-gradient")
        if len(images) != len(positions):
            raise SystemExit(
                f"{selector.strip()}：漸層數 {len(images)} 與 background-position "
                f"數 {len(positions)} 不一致"
            )
        tiles = {(float(w), float(h)) for w, h in sizes}
        if len(tiles) != 1:
            raise SystemExit(f"{selector.strip()}：background-size 不是單一 tile 值")
        tile_w, tile_h = tiles.pop()
        if tile_w != tile_h:
            raise SystemExit(f"{selector.strip()}：tile 非正方形，bake.py 尚未支援")
        tile = tile_w

        dots = []
        for (alpha_pct, radius), (x, y) in zip(images, positions):
            # CSS 的圓心在 tile 正中央，background-position 是整層位移
            cx = (float(x) + tile / 2) % tile
            cy = (float(y) + tile / 2) % tile
            alpha = round(float(alpha_pct) / 100 * 255)
            dots.append((cx, cy, float(radius), alpha))

        layers.append((suffix, tile, dots))
    return layers


def draw_dot(mask, px, py, r, alpha):
    """在輸出網格上疊一顆抗鋸齒實心圓（座標與半徑都已是輸出像素單位）。"""
    size = mask.width
    # 圓的外接矩形，向外各留 1px 讓邊緣的部分覆蓋算得完整
    bx0 = max(int(px - r) - 1, 0)
    by0 = max(int(py - r) - 1, 0)
    bx1 = min(int(px + r) + 2, size)
    by1 = min(int(py + r) + 2, size)
    if bx1 <= bx0 or by1 <= by0:
        return

    w, h = bx1 - bx0, by1 - by0
    ss = SUPERSAMPLE
    patch = Image.new("L", (w * ss, h * ss), 0)
    # 超取樣格點索引 i 代表 [i, i+1)、中心在 i+0.5，故 bbox 減 0.5 對齊
    ImageDraw.Draw(patch).ellipse(
        (
            (px - r - bx0) * ss - 0.5,
            (py - r - by0) * ss - 0.5,
            (px + r - bx0) * ss - 0.5,
            (py + r - by0) * ss - 0.5,
        ),
        fill=alpha,
    )
    # BOX 面積平均 = 每個輸出像素被圓覆蓋的比例
    patch = patch.reduce(ss)
    region = mask.crop((bx0, by0, bx1, by1))
    # 以 max 合成：星點幾乎不重疊，用 max 可避免重疊處被畫兩次而過亮
    mask.paste(ImageChops.lighter(region, patch), (bx0, by0))


def bake_layer(tile, dots):
    """畫出一層，回傳最終尺寸（tile * SCALE）的 RGBA 圖。"""
    out = int(round(tile * SCALE))
    mask = Image.new("L", (out, out), 0)

    for cx, cy, radius, alpha in dots:
        r = radius * SCALE
        # 九宮格補畫，讓貼近邊界的圓點在對邊接得上，平鋪才不會有接縫
        for dx in (-tile, 0.0, tile):
            for dy in (-tile, 0.0, tile):
                px = (cx + dx) * SCALE
                py = (cy + dy) * SCALE
                if px + r < 0 or py + r < 0 or px - r > out or py - r > out:
                    continue
                draw_dot(mask, px, py, r, alpha)

    img = Image.new("RGBA", (out, out), (255, 255, 255, 0))
    img.putalpha(mask)
    return img


def main():
    if not SRC_CSS.exists():
        raise SystemExit(f"找不到 {SRC_CSS}")
    layers = parse_layers(SRC_CSS.read_text(encoding="utf-8"))
    if len(layers) != 4:
        raise SystemExit(f"預期四層，實際解析到 {len(layers)} 層")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for suffix, tile, dots in sorted(layers):
        img = bake_layer(tile, dots)
        path = OUT_DIR / f"starfield-{suffix}.png"
        img.save(path, "PNG", optimize=True)
        print(
            f"starfield-{suffix}.png  tile={int(tile)}px  "
            f"{img.width}x{img.height}px  {len(dots)} dots  "
            f"{path.stat().st_size / 1024:.1f} KB"
        )
    print(f"輸出到 {OUT_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
