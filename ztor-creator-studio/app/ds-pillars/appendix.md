> 本檔是 [design-system.md](../design-system.md) 的 附錄，入口與對照表在那裡。

## Implementation Notes

Technical-stack landing for this design system. The studio is a **static prototype** — no build step, no framework.

| Concern | Decision |
|---|---|
| Markup / styling | Hand-written HTML + CSS; one CSS file per component in [`ds-components/`](../ds-components/), all token-driven (`var(--…)`) |
| Tokens | [`ds-components/_tokens.css`](../ds-components/_tokens.css) — Foundation + Role + Mode (`[data-theme="dark"]`) in one layer |
| Theme | `theme.js` — light / dark / system cycle, persisted in `localStorage["ztor.theme.preference"]`; `?theme=` one-time override |
| Icons | `icons.js` — Tabler registry, injected per page via `ztorIcons.applyIcons()`; new icons must be registered first |
| i18n | `i18n.js` — `en` / `zh-Hant` dictionary, `data-i18n*` bindings, topbar toggle, `localStorage` persisted |
| Fonts | self-hosted woff2 in [`fonts/`](../fonts/) — Satoshi (primary Latin) / Geist / Inter (Latin fallbacks) / Geist Mono / LINE Seed TW (CJK headings) / Chiron Hei HK (CJK body-UI) / Noto Sans TC (CJK fallback), all subset — no CDN |
| Project chrome | `shared.css` — project-level patterns (topbar, bento, wizard, hero) on top of `ds-components/` |
| Component API | CSS classes only (no JS component API) — so spec cards use HTML examples, not JSX; Props/API is N/A |
| Self-contained | the folder runs standalone — no asset or link depends on anything outside this directory |

---

## Appendix A · Output formats

The DSS v1.4 standard is output-agnostic. Ztor Creator Studio · R 2.2 ships as CSS Custom Properties (the canonical implementation in [`ds-components/_tokens.css`](../ds-components/_tokens.css)). Below are equivalent representations for other targets.

### B.1 CSS Custom Properties (shipping format)

```css
:root {
  /* Pillar 1 → Pillar 2: raw value flows into role token */
  --background:        #FFFFFF;
  --primary:           #ffa33f;
  --primary-foreground:#171717;
  --status-success:    #22C55E;
  /* … see _tokens.css for the full list */
}

[data-theme="dark"] {
  /* Pillar 3 Mode: only the differences from Role */
  --background:        #171717;
  --card:           rgba(253,253,253,0.10);
  /* … */
}
```

### B.2 Tailwind v4 config (theoretical handoff)

```css
@theme {
  --color-background:        #FFFFFF;
  --color-primary:           #ffa33f;
  --color-primary-foreground:#171717;
  --color-status-success:    #22C55E;
  --color-status-error:      #DA314A;
  --color-status-info:       #266DF0;

  --radius-sm: 10px;
  --radius:   10px;
  --radius-md:10px;  /* merged alias of --radius (Q2 2026-07-13) */
  --radius-lg:16px;
  --radius-xl:24px;
  --radius-shell:30px;

  --font-display: 'Satoshi', 'Geist', var(--font-cjk-display), system-ui, sans-serif;
  --font-ui:      'Satoshi', 'Geist', var(--font-cjk), system-ui, sans-serif;
  --font-body:    'Satoshi', 'Inter', var(--font-cjk), system-ui, sans-serif;
}
```

### B.3 W3C DTCG JSON (interchange format)

```json
{
  "color": {
    "background": { "$value": "#FFFFFF", "$type": "color" },
    "primary":    { "$value": "#ffa33f", "$type": "color" },
    "primary-foreground": { "$value": "#171717", "$type": "color" },
    "status-success": { "$value": "#22C55E", "$type": "color" }
  },
  "radius": {
    "sm": { "$value": "10px", "$type": "dimension" },
    "md": { "$value": "10px", "$type": "dimension" }
  }
}
```

---

## Appendix B · DSS v1.4 JSON skeleton

Filled with Ztor Creator Studio · R 2.2's actual values where the 7-Pillar structure maps cleanly. Empty / per-need fields left as placeholders.

```json
{
  "record": {
    "name": "Ztor Creator Studio · R 2.2",
    "source": "Ztor Creator Studio (creator-economy operations dashboard)",
    "version": "R 2.2",
    "date": "2026-06-01",
    "base": "Ztor (parent design system)",
    "notes": "Highlighter-orange primary used structurally (active tabs, selection-card selected state, hero and pre-order pills — nav active states stay neutral gray, Q8 2026-07-13). Info banners use neutral tokens. App-tier components promoted from project shared.css to ds-components/ across Phase 0-4."
  },
  "foundation": {
    "palette": {
      "neutral": { "50":"#FFFFFF", "100":"#FAFAFA", "500":"#6E6E68", "900":"#171717", "1000":"#000000" },
      "orange":  { "300":"#ffb866", "500":"#ffa33f" },
      "yellow":  { "warning":"#F8D749" },
      "green":   { "500":"#22C55E", "dark":"#4ADE80" },
      "red":     { "500":"#DA314A", "dark":"#E7000B" },
      "blue":    { "500":"#266DF0", "dark":"#5896F3" }
    },
    "scale": [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128],
    "type": {
      "family": {
        "display": "Satoshi, Geist, LINE Seed TW, system-ui, sans-serif",
        "ui":      "Satoshi, Geist, Chiron Hei HK, system-ui, sans-serif",
        "body":    "Satoshi, Inter, Chiron Hei HK, system-ui, sans-serif"
      }
    },
    "effect": {
      "radius": { "sm":"10px", "default":"10px", "md":"10px", "lg":"16px", "xl":"24px", "shell":"30px", "pill":"9999px" },
      "shadow": {
        "micro":    "0 4px 4px rgba(23,23,23,0.04)",
        "card":     "0 2px 8px -1px rgba(12,10,9,0.05), 0 0 0 1px rgba(23,23,23,0.05)",
        "popover":  "0 1px 1.6px rgba(0,0,0,0.05), 0 0 0.83px rgba(0,0,0,0.2)",
        "hairline": "0 0 0.833px rgba(0,0,0,0.2)"
      }
    }
  },
  "role": {
    "color": {
      "bg": { "canvas":"palette.neutral.50", "surface":"#FFFFFF", "muted":"palette.neutral.100", "inverse":"palette.neutral.1000" },
      "fg": { "default":"palette.neutral.1000", "muted":"rgba(0,0,0,0.7)", "subtle":"palette.neutral.500" },
      "primary":     { "bg":"palette.orange.500", "fg":"palette.neutral.900", "hover":"palette.orange.300" },
      "border":      "#EAEAEA",
      "ring":        "palette.neutral.900",
      "status": {
        "success":"palette.green.500",
        "error":  "palette.red.500",
        "info":   "palette.blue.500",
        "warning":"palette.yellow.warning"
      }
    }
  },
  "mode": {
    "dark": {
      "color": {
        "bg": { "canvas":"palette.neutral.900", "surface":"rgba(253,253,253,0.10)", "inverse":"#0A0A0A" },
        "fg": { "default":"#FDFDFD", "muted":"rgba(253,253,253,0.7)", "subtle":"rgba(253,253,253,0.4)" },
        "border": "rgba(253,253,253,0.12)",
        "ring":   "#FDFDFD",
        "status": { "success":"palette.green.dark", "error":"palette.red.dark", "info":"palette.blue.dark" }
      }
    }
  },
  "component": {
    "_note": "see Pillar 4 §4.1 for the full inventory; each unit carries a _layer tag (atom/molecule/organism), orthogonal to variant",
    "button": { "_layer": "atom", "primary": {}, "outline": {}, "ghost": {} },
    "_inventory": "button · badge · status-dot · chip · switch · info-banner · input · icon · meta-cell (atoms) · card · kpi · alert · accordion · tabs · cookie-banner · empty-stub · selection-card · composer · page-intro · field-system · filter-row · segmented-control · stepper · progress-stepper · settings-nav · settings-row · rental-card · rank-bars (molecules) · header · footer · data-list · table · chart · bento · app-shell · wizard-frame · hero-slideshow · ip-hero · chart-card (organisms)"
  },
  "pattern": {
    "_cards": {
      "_note": "see Pillar 5 §5.1 — each card has trigger/must/should/must-not/_edge-cases",
      "dashboard-home": { "_category": "layout" },
      "tabbed-section-view": { "_category": "layout" },
      "filter-and-list": { "_category": "interaction" },
      "lifecycle-states": { "_category": "lifecycle" },
      "multi-step-wizard": { "_category": "workflow" }
    },
    "voice": "(see §5.2)", "states": "(see §5.3)", "dataviz": "(see §5.4)"
  },
  "structure": "(see Pillar 6: 6.1 Grid · 6.2 Page templates · 6.3 Page-intro · 6.4 Topbar · 6.5 Hero)"
}
```

---


---

## Appendix C · 資料與行為模組

沒有自己外觀的 JS 模組：擁有的是值或行為，畫面從它們讀資料。它們不是元件，所以 2026-11-09 從 Pillar 4 總表移到這裡；展示卡在 `design-system-structure.html#appendix-c`。

| Module | `_layer` | Status | Where seen (Ztor Creator Studio) | Source |
|---|---|---|---|---|
| [Work taxonomy](../ds-specs/work-taxonomy.md) | 🟢 atom | 🧩 資料／行為模組 | 題材與年齡分級的值域單一來源 JS 模組，供多處畫面共用 | [js/work-taxonomy.js](../js/work-taxonomy.js) |
| [Archived gate](../ds-specs/archived-gate.md) | 🟢 atom | 🧩 資料／行為模組 | 封存態唯讀的事件層閘門：純 JS 元件 `partials/archived-gate.js`，無自帶 CSS、不畫任何東西 | [partials/archived-gate.js](../partials/archived-gate.js) |
| [Loyalty settings](../ds-specs/loyalty-settings.md) | 🟢 atom | 🧩 資料／行為模組 | 平台忠誠點數設定的已儲存值模組，作為原型的單一資料來源 | [js/loyalty-settings.js](../js/loyalty-settings.js) |
| [Fans roster](../ds-specs/fans-roster.md) | 🟢 atom | 🧩 資料／行為模組 | 粉絲示範母體：純資料模組 `js/fans-roster.js`，無自帶 CSS | [js/fans-roster.js](../js/fans-roster.js) |
