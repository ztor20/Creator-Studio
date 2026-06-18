#!/usr/bin/env python3
"""
Port R 1.0 pages to R 2.0:
  1. Read R 1.0 page
  2. Replace head between </title> and </head> with R 2.0 head
  3. Strip R 1.0 design-system comment block
  4. Write to R 2.0 / page

Usage:  python3 _port_pages.py [page1.html page2.html ...]
        (no args = port all pages except design-system.html, sample.html,
         component-preview.html, patterns-preview.html, index.html which is
         already custom in R 2.0)
"""
import re
import sys
from pathlib import Path

R1 = Path("/Users/yves/SynologyDrive/Drive/Claude/Project/ztor-creator-studio/site/R 1.0")
R2 = Path("/Users/yves/SynologyDrive/Drive/Claude/Project/ztor-creator-studio/site/R 2.0")

# New head — replaces everything between </title> and </head> exclusive of </title>
NEW_HEAD_TEMPLATE = """

<!-- Theme.js MUST load before any visible content to avoid FOUC flash. -->
<script src="theme.js"></script>

<!-- ztor design system: tokens + fonts + 18 components (11 base + 7 new) -->
<link rel="stylesheet" href="ds-components/_tokens.css?v=1" />
<link rel="stylesheet" href="ds-components/fonts.css?v=1" />
<link rel="stylesheet" href="ds-components/button.css?v=1" />
<link rel="stylesheet" href="ds-components/card.css?v=1" />
<link rel="stylesheet" href="ds-components/input.css?v=1" />
<link rel="stylesheet" href="ds-components/badge.css?v=1" />
<link rel="stylesheet" href="ds-components/navigation-menu.css?v=1" />
<link rel="stylesheet" href="ds-components/accordion.css?v=1" />
<link rel="stylesheet" href="ds-components/table.css?v=1" />
<link rel="stylesheet" href="ds-components/header.css?v=1" />
<link rel="stylesheet" href="ds-components/footer.css?v=1" />
<link rel="stylesheet" href="ds-components/cookie-banner.css?v=1" />
<link rel="stylesheet" href="ds-components/alert.css?v=1" />
<link rel="stylesheet" href="ds-components/avatar.css?v=1" />
<link rel="stylesheet" href="ds-components/checkbox.css?v=1" />
<link rel="stylesheet" href="ds-components/radio.css?v=1" />
<link rel="stylesheet" href="ds-components/eyebrow.css?v=1" />
<link rel="stylesheet" href="ds-components/separator.css?v=1" />
<link rel="stylesheet" href="ds-components/switch.css?v=1" />

<!-- Project-level styles (topbar + 30+ patterns ported from R 1.0) -->
<link rel="stylesheet" href="dashboard.css?v=2" />

<script src="icons.js?v=1" defer></script>
<script src="topbar.js" defer></script>
<script src="i18n.js?v=1" defer></script>
"""

def port_page(filename: str) -> bool:
    src = R1 / filename
    dst = R2 / filename
    if not src.exists():
        print(f"  ✗ {filename}: source missing")
        return False
    html = src.read_text(encoding="utf-8")

    # Replace head section: from </title> to </head>
    pattern = re.compile(r"(</title>).*?(</head>)", re.DOTALL)
    new_html, n = pattern.subn(r"\1" + NEW_HEAD_TEMPLATE + r"\2", html, count=1)
    if n == 0:
        print(f"  ✗ {filename}: head pattern not matched")
        return False

    # Add theme toggle button to existing topbar if not present.
    # R 1.0 has app-topbar__actions structure — inject sun/moon button
    # before the existing search button. Look for the first occurrence.
    if "[data-theme-toggle]" not in new_html and 'class="app-topbar__actions"' in new_html:
        theme_btn = '''<button class="app-topbar__icon-btn" type="button" data-theme-toggle aria-label="切換主題">
      <i data-lucide="sun" class="ztor-icon ztor-icon--sm"></i>
      <i data-lucide="moon" class="ztor-icon ztor-icon--sm"></i>
    </button>
    '''
        # Insert immediately after `app-topbar__actions">` opening div
        new_html = re.sub(
            r'(<div class="app-topbar__actions">\s*)',
            r'\1' + theme_btn,
            new_html,
            count=1,
        )

    dst.write_text(new_html, encoding="utf-8")
    print(f"  ✓ {filename}: ported ({len(new_html)} bytes)")
    return True


# All product pages to port (excluding viewer / preview files + index which is custom)
PAGES = [
    "index.html",        # will overwrite the current stub
    "projects.html",
    "create-project.html",
    "my-ip.html",
    "ip-market.html",
    "ip-detail.html",
    "e-shop.html",
    "product-detail.html",
    "create-product.html",
    "events.html",
    "create-event.html",
    "fans-crm.html",
    "earnings.html",
    "settings.html",
]


if __name__ == "__main__":
    pages = sys.argv[1:] if len(sys.argv) > 1 else PAGES
    print(f"Porting {len(pages)} page(s) from R 1.0 → R 2.0:")
    ok = sum(port_page(p) for p in pages)
    print(f"\nDone: {ok}/{len(pages)} succeeded")
