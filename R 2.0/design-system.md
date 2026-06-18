# Ztor — Design System

> **Differs from [ztor](../ztor/design-system.md)**: three light-mode tokens shift to give the system a single, attention-grabbing brand color where ztor was deliberately near-monochrome.
>
> | Token | ztor | ztor |
> |---|---|---|
> | `background-canvas` | `#F7F7F7` | **`#FAFAF7`** (warmer paper) |
> | `border-soft` | `#E5E5E5` | **`#D1D1C7`** (warmer hairline) |
> | `primary` | `#171717` | **`#FFDB29`** (highlighter yellow) |
> | `primary-foreground` | `#FFFFFF` | **`#171717`** (dark text on yellow) |
> | `primary-hover` | `#000000` | **`#FFE55C`** (brighter yellow) |
> | `ring` | `#171717` | `#171717` (retained — yellow ring would fail AA on light canvas) |
>
> Dark-mode `primary` also moves to `#FFDB29` to keep the yellow voice paired across modes. Every other ztor token (surface, foreground, status accents, radii, shadows, motion, typography) is preserved as-is. Components/*.css are 100% token-driven, so the visual flip happens entirely in `components/_tokens.css`.
>
> All historical extraction notes (ztor marketing surface 2026-05-22 + app.ztor.ai 2026-05-25) are preserved below as source-system context. Read them as "the prototype this remix was built on."

---

## Identity

**Tagline** — *AI search analytics for marketing teams — with a louder voice.*

**Category** — B2B SaaS for marketing & SEO teams tracking brand visibility inside LLMs (ChatGPT, Gemini, AI Mode, etc.). Category is "GEO" — Generative Engine Optimization.

**Tags** — `framer-published`, `geist-stack`, `warm-paper-canvas`, `subtle-radii`, `multi-layer-shadows`, `dashboard-hero`, `direct-saas`, `light-and-dark`, `highlighter-yellow-primary`.

**Overview** — Ztor keeps every structural decision from ztor (dashboard-as-hero, paper canvas, subtle 6–7px radii, multi-layer rim+drop shadows in place of borders, Geist for UI / Inter for body) and changes one variable: **the CTA is now highlighter yellow (`#FFDB29`) with near-black text**. The canvas warms slightly (`#FAFAF7`) and hairlines warm to match (`#D1D1C7`), so the yellow doesn't sit on a cold gray. The result is a single high-saturation brand color where ztor had none — visually closer to a sticky-note / caution-tape voice while preserving the technical-SaaS chrome. Typography, status accents (green / red / blue / yellow data dots), shadow taxonomy, and grid system are unchanged.

**Similar systems** — [Notion](https://notion.so) (highlighter-yellow accent), [Linear](https://linear.app) (Geist + neutral tokens), [Vercel](https://vercel.com) (Geist origin, subtle radii), [Cursor](https://cursor.com) (Framer-published marketing surface), [Attio](https://attio.com) (dashboard-hero pattern).

---

## Quick Reference

| Token | Value | Hex |
|---|---|---|
| `background-canvas` | rgb 250 250 247 | `#FAFAF7` ⚡ |
| `background-surface` | rgb 255 255 255 | `#FFFFFF` |
| `background-card` | rgb 250 250 250 | `#FAFAFA` |
| `background-footer` | rgb 0 0 0 | `#000000` |
| `foreground` | rgb 0 0 0 | `#000000` |
| `foreground-muted` | rgba 0 0 0 / .7 | `rgba(0,0,0,0.7)` |
| `foreground-subtle` | rgb 115 115 115 | `#737373` |
| `primary` | rgb 255 219 41 | `#FFDB29` ⚡ |
| `primary-hover` | rgb 255 229 92 | `#FFE55C` ⚡ |
| `primary-foreground` | rgb 23 23 23 | `#171717` ⚡ |
| `ring` | rgb 23 23 23 | `#171717` |
| `border-soft` | rgb 209 209 199 | `#D1D1C7` ⚡ |
| `status-success` | rgb 34 197 94 | `#22C55E` |
| `status-error` | rgb 218 49 74 | `#DA314A` |
| `status-info` | rgb 38 109 240 | `#266DF0` |
| `status-warning` | rgb 248 215 73 | `#F8D749` (note: visually close to `primary` — reserve status-warning for **status dots inside dashboard demos**, never as a UI fill, to avoid clashing with the yellow CTA) |

⚡ = changed from ztor

| Property | Value |
|---|---|
| Display font | `Geist Variable` (H1) |
| UI font | `Geist` (H2-H4, buttons, nav) |
| Body font | `Inter` (paragraphs only) |
| Primary radius | `6px` (CTAs), `7px` (cards / outline buttons) |
| Pill radius | `1000px` / `100%` (status dots, avatars) |
| Base spacing | Dense scale — 1, 4, 6, 8, 10, 12, 14, 16, 24 |
| Card shadow | `0 2px 6px rgba(12,10,9,0.08), 0 0 0 1px rgba(23,23,23,0.08)` (rim + drop) |
| Soft elevation | `0 4px 4px rgba(23,23,23,0.04)` (used on outline buttons as edge) |
| Theme | **Light + dark** (toggle inherited from ztor's 2026-05-25 dark-mode adapter; dark primary also yellow) |
| H1 desktop | `64px / 400 / lh 1 / tracking -1.28px` (Geist Variable) |
| Button label | `15px / 500 / tracking -0.3px` (Geist) |

---

## 1. Foundations

### 1.1 Color

Ztor runs on a **warm-paper canvas with a single high-saturation brand color** — highlighter yellow `#FFDB29` plays the role of primary CTA and nothing else does. Status accents stay reserved for dashboard data dots.

| Role | Hex | Where it lives |
|---|---|---|
| `background-canvas` | `#FAFAF7` ⚡ | Body / page paper — dominant ambient color. Warmer than ztor's #F7F7F7 to harmonize with the yellow CTA |
| `background-surface` | `#FFFFFF` | Cards, nav-dropdown panels, dashboard mockup frames |
| `background-card` | `#FAFAFA` | Muted card variant (slightly cooler than surface) |
| `background-footer` | `#000000` | Pure black footer — the only place black appears as a fill |
| `foreground` | `#000000` | Body text, headings (dominant — 415 occurrences on home) |
| `foreground-muted` | `rgba(0,0,0,0.7)` | Secondary copy, supporting sentences |
| `foreground-subtle` | `#737373` | Caption, metadata, meta-text |
| `primary` | `#FFDB29` ⚡ | Primary CTA fill, "Sign up" / "Start Free Trial" buttons. The signature color |
| `primary-hover` | `#FFE55C` ⚡ | CTA hover — brighter (reverse of ztor's "darken on hover" pattern) |
| `primary-foreground` | `#171717` ⚡ | Text inside primary CTAs (dark text on yellow, ~13:1) |
| `ring` | `#171717` | Focus ring — retained as near-black for visibility across both yellow and surface backgrounds |
| `border-soft` | `#D1D1C7` ⚡ | Hairline rule (rare — usually swapped for shadow rim). Warmer to match the warmer canvas |

⚡ = changed from ztor

**Status accents** appear as **data dots inside dashboard demos** (Monday → green, Salesforce → blue, Attio → black, Zero → yellow, Pipedrive → green) rather than as UI chrome:

| Status | Hex | HSL |
|---|---|---|
| Success | `#22C55E` | `142 71% 45%` |
| Error | `#DA314A` | `352 70% 57%` |
| Info | `#266DF0` | `218 87% 55%` |
| Warning | `#F8D749` | `49 93% 63%` |

> **Note on `rgb(0,0,238)`** — many computed-style samples show this on `<a>` and `<button>` elements. It is the **default browser link color**, not a Ztor brand color. Framer renders text inside a nested `<p>` that overrides this with white / black. Easy to misread as a brand blue; it is not.

### 1.2 Typography

```css
--font-display: 'Geist Variable', 'Geist', system-ui, sans-serif;
--font-ui:      'Geist', system-ui, sans-serif;
--font-body:    'Inter', system-ui, sans-serif;
```

- **Geist Variable** — used on `<h1>` only (variable axis for hero display)
- **Geist** — H2 / H3 / H4, buttons, nav, eyebrow text
- **Inter** — paragraph body copy (`<p>`), particularly inside long-form blog posts

| Token | Family | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| `display-1` (h1) | Geist Variable | `64px` | 400 | `64px` (1.0) | `-1.28px` |
| `h2` | Geist | `40px` | 500 | `42px` (1.05) | `-0.8px` |
| `h3` | Geist | `18px` | 500 | `21.6px` (1.2) | normal |
| `h4` | Geist | `24px` | 500 | `28.8px` (1.2) | `-0.48px` |
| `body-lg` | Inter | `16px` | 400 | `~1.5` | normal |
| `body` | Inter | `14px` | 400 | `16.8px` | `-0.2px` |
| `button-label` | Geist | `15px` | 500 | normal | `-0.3px` |
| `small / nav` | Geist | `12–13px` | 500 | normal | normal |

Tight negative tracking (`-1.28px` on H1, `-0.8px` on H2) is the Geist signature.

### 1.3 Spacing

Dense scale — Ztor uses many micro-paddings (1–6px) because Framer nests components deeply and applies fine inner spacing. Effective rhythm:

`1, 4, 6, 8, 10, 12, 14, 16, 24, 32, 48, 64, 80`

Section-level vertical rhythm is closer to `80–96px`. Card internal padding is typically `16–24px`. Footer uses `80px` vertical padding.

### 1.4 Radius

| Token | Value | Where |
|---|---|---|
| `radius-button-primary` | `6px` | "Start Free Trial", "Sign up" |
| `radius-button-secondary` | `7px` | "Talk to Sales" outline CTA |
| `radius-card` | `7px – 8px` | Cards, dropdown panels |
| `radius-input` | `6px` | Form fields |
| `radius-small` | `2–5px` | Inner sub-radii on Framer components |
| `radius-card-feature` | `12px` | Comparison verdict cards, programmatic SEO cards |
| `radius-media` | `16px` | Embedded video player container (form-forwarded-video) |
| `radius-quote-card` | `24px` | Expert quote / "verdict" card — Reports detail, ztor-vs-profound editorial card |
| `radius-pill` | `1000px / 100%` | Status dots, avatar circles, badge chips |

Ztor's radius system is **fine-grained subtle** at the chrome layer (6–8px buttons / inputs / nav cards) but **escalates sharply** at the editorial layer — `12px → 16px → 24px` are reserved for content surfaces (cards that hold quotes, verdicts, or media). Then a clean leap to full pills for round elements. This is the visual opposite of Midday's `0px` brand decision.

### 1.5 Shadow

| Token | Value | Use |
|---|---|---|
| `shadow-micro` | `0 4px 4px rgba(23,23,23,0.04)` | Soft elevation on outline buttons (used **as an edge replacement**, not just lift) |
| `shadow-card` | `0 2px 6px rgba(12,10,9,0.08), 0 0 0 1px rgba(23,23,23,0.08)` | Cards — multi-layer rim + drop |
| `shadow-popover` | `0 1px 1.6px rgba(0,0,0,0.05), 0 0 0.83px rgba(0,0,0,0.2)` | Popovers, tooltips |
| `shadow-hairline` | `0 0 0.833px rgba(0,0,0,0.2)` | Sub-pixel border simulation |

**Pattern** — Ztor uses **multi-layer shadows to define edges without ever drawing a border**. The `inset 0 0 0 1px rgba()` ring is a soft outline; the `0 2px 6px rgba()` is the drop. Together they replace what most systems would draw as a `border: 1px solid var(--border)`. This is the dominant Framer-elegant pattern across the site.

### 1.6 Motion

Framer applies `transition: all` by default and inlines cubic-bezier values per component. Observed durations sit in the `150–300ms` range with ease-out-style curves. No explicit `reduce-motion` overrides observed at the page level (Framer respects it inside its runtime).

### 1.7 Iconography

Inline SVG, ~101 per home page. No detected icon library (Lucide / Heroicons / Phosphor all return zero hits). The set looks **hand-tuned or Framer-imported** — chunky 1.5–2px outlined glyphs, sometimes with mono-color fills inside (the "Visibility eye", "Position arrows", "Sentiment smile" inline glyphs in body copy are a notable signature).

### 1.8 Theme mode

**Light mode only.** No theme toggle button observed, no `prefers-color-scheme` rules detected, no `html.dark` class. The black footer is a deliberate hi-contrast "epilogue" rather than a dark variant.

### 1.9 Grid / Layout

- Page container max-width ~1248px
- Page gutter ~24px desktop, ~16px mobile
- Header height 80px, `position: relative` (does **not** stay fixed on scroll — it scrolls away)
- Section vertical rhythm 80–96px
- Hero centered single-column with dashboard mockup below the fold
- Footer 80px padding · pure black

### 1.10 Imagery

**Product screenshots are the dominant hero asset.** Every marketing page anchors on a high-fidelity dashboard mockup showing real Ztor UI (line chart + competitor table + status pills). Customer logos appear as small monochrome wordmarks in a horizontal trust bar. No stock photography. No abstract illustration.

---

## 2. Components

### 2.1 Inventory

| Component | Status | Where seen | CSS |
|---|---|---|---|
| Button (Primary) | ✓ Site | "Start Free Trial", "Sign up", "Book a Demo" | [button.css](./components/button.css) |
| Button (Outline) | ✓ Site | "Talk to Sales", "Log in" | [button.css](./components/button.css) |
| NavigationMenu | ✓ Site | Header dropdowns (Pricing / Resources / Partnerships) | [navigation-menu.css](./components/navigation-menu.css) |
| Header | ✓ Site | All pages, relative position 80px tall | [header.css](./components/header.css) |
| Card (Elevated) | ✓ Site | Resources dropdown cards, dashboard mockup frame, blog post tiles | [card.css](./components/card.css) |
| Input | ✓ Site | `/agency-directory/get-matched`, `/form` | [input.css](./components/input.css) |
| Badge / Pill (Inline metric) | ✓ Site | Hero subtitle inline metric chips (Visibility / Position / Sentiment) | [badge.css](./components/badge.css) |
| Status dot | ✓ Site | Dashboard demo brand dots | [badge.css](./components/badge.css) |
| Footer | ✓ Site | Black hi-contrast | [footer.css](./components/footer.css) |
| Accordion | ✓ Site | Home FAQ section | [accordion.css](./components/accordion.css) |
| Table | ✓ Site | `/comparison/*` feature-by-feature table | [table.css](./components/table.css) |
| Cookie banner | ✓ Site | Pill-shaped banner, bottom-right | [cookie-banner.css](./components/cookie-banner.css) |
| Pricing card | ✓ Site | `/pricing`, `/pricing-agencies` plan tiers | (see card.css) |
| Iframe embed | 🟡 Variant | `/bookdemo` (Cal.com style) | — |
| Tooltip | ◎ Default | Not directly captured | — |
| Toast | ◎ Default | Not directly captured | — |

### 2.2 Button — anatomy

**Variants**
- `Primary` — solid dark, "Sign up" / "Start Free Trial"
- `Outline` — transparent + micro-shadow as edge, "Talk to Sales" / "Log in"

**Sizing**
- `default`: `height: 44px`, padding `14px 20px`, `font: Geist 15 / 500 / -0.3px`
- `compact`: `height: 36px`, padding `10px 14px`, `font: Geist 12-13 / 500` (used in header nav)

**Spec**

| Property | Primary | Outline |
|---|---|---|
| Background | `#FFDB29` ⚡ | `transparent` |
| Color | `#171717` ⚡ | `#000000` |
| Border | hairline `0 0 0 1px rgba(23,23,23,0.12)` via box-shadow (added to guarantee UI-component contrast ≥3:1 against light canvas — see §5) | none (shadow stands in) |
| Border-radius | `6px` | `7px` |
| Shadow | hairline only (above) | `0 4px 4px rgba(23,23,23,0.04)` |
| Transition | `all` | `all` |
| Hover | `#FFE55C` ⚡ (brighter — inverse of ztor's darken pattern) | shadow intensifies to `0 6px 12px rgba(23,23,23,0.08)` |
| Focus-visible | outline 2px solid `#171717`, offset 2px | same |

⚡ = changed from ztor

### 2.3 NavigationMenu

| Property | Value |
|---|---|
| Trigger | Nav button with `▾` glyph + hover-open panel |
| Panel position | Drops directly below trigger, ~16px gap |
| Panel bg | `#FFFFFF` |
| Panel border | none — relies on `shadow-card` (rim + drop) |
| Panel radius | `8px` |
| Panel padding | `16px` |
| Layout | 2-column grid: link list + promo card |
| Promo card | Right column — image + headline + CTA link (e.g. "Find a trusted partner for your GEO needs → Get in touch our partners") |

### 2.4 Header

| Property | Value |
|---|---|
| Position | `relative` (scrolls away — not fixed) |
| Background | `#FAFAF7` (matches body) ⚡ |
| Height | `80px` |
| Logo | "ztor" wordmark — Geist 24px / 500 + asterisk-like mark |
| Right cluster | "Log in" (outline) + "Sign up" (primary dark) |
| Mobile (<768px) | Burger button replaces nav |

### 2.5 Card

**Default card** (used for blog tiles, mcp-use-case cards, partner cards):

```
background: #FFFFFF
border-radius: 7-8px
padding: 16-24px
box-shadow:
  0 2px 6px rgba(12, 10, 9, 0.08),
  0 0 0 1px rgba(23, 23, 23, 0.08);
```

**Variant — muted card** (`#FAFAFA` bg) is used inside dashboard mockups for nested panels.

### 2.6 Badge / Inline metric pill

A signature Ztor pattern. In the hero subtitle they inline `[icon] Label` chips into the running paragraph:

> Track, analyze, and improve brand performance on AI search platforms through key metrics like `👁 Visibility`, `⚙ Position`, and `😀 Sentiment`.

Spec:
- Background: `#FFFFFF`
- Padding: `4px 10px`
- Border-radius: `7px`
- Box-shadow: `0 0 0 1px rgba(23,23,23,0.08)` (hairline rim only)
- Inline-flex with 4px gap + 14px Geist text + 14×14 colored glyph

### 2.7 Status dot

```
width: 8px;
height: 8px;
border-radius: 50%;
background: var(--status-success | error | info | warning);
```

Used inside the dashboard demo to color-code competitor brands in the table.

### 2.8 Accordion (FAQ)

Used on home in the "Questions" section. Each item:

- Trigger: `<button>` with full-width text, padding `24px 0`
- Border-bottom: `1px solid #D1D1C7` ⚡
- Trigger text: Geist 16px / 500
- Caret: chevron on the right, rotates 180° when expanded
- Animation: height transition

### 2.9 Cookie banner

Bottom-right floating pill:
- Background: `#FFFFFF`
- Border-radius: `16px` (more rounded than rest of system)
- Shadow: `shadow-card`
- Padding: `16px 20px`
- Buttons: small primary "Okay" + text link "Cookie Settings"

### 2.10 Footer

Black slab with white text. 80px vertical padding. Used as a hi-contrast section break / brand epilogue, not a dark theme. Footer link rows in muted white (`rgba(255,255,255,0.6)`).

---

## 3. Patterns

### 3.1 Layout patterns

- **Dashboard-as-hero** — every key product page leads with a high-fidelity screenshot of the actual Ztor analytics UI directly under the H1/subtitle. The mockup serves as both proof-of-product and primary visual.
- **Inline metric pill paragraph** — running prose interrupted by labeled icon pills (`👁 Visibility · ⚙ Position · 😀 Sentiment`). A distinctive signature.
- **SEO programmatic landing** — `/mcp-use-cases/*` (~40 pages) and `/agency-directory/*` (~12 pages) follow templated layouts: hero → screenshot → key features grid → CTA.
- **Comparison table** — `/comparison/*` uses a side-by-side feature checklist table with check / cross icons.
- **Black footer epilogue** — most ztor pages end with a full-bleed `#000000` footer for visual section break.

### 3.2 Interaction patterns

- **Hover-open nav dropdown** with promo card on right side
- **FAQ accordion** (chevron-rotate, expand/collapse with height transition)
- **Cookie pill** (dismissible bottom-right)
- **No global theme toggle** — light only

### 3.3 Lifecycle / state patterns

- **404** — keeps the same chrome, single "Page Not Found" headline, link back to home
- **Form success** — `/form-success` and `/agency-directory/form-success` are minimal confirmation pages
- **Form forwarded video** — `/form-forwarded-video` plays a video confirmation

### 3.4 Workflow patterns

- **Lead-capture funnel** — `/bookdemo` (calendar embed) and `/form` (sales form) are the conversion endpoints
- **Agency directory matchmaking** — `/agency-directory/get-matched` form → match → success
- **Sign-up handoff** — primary CTA always points to `app.ztor.ai` with a `comet_token_override` query param (referral tracking)

---

## 4. Voice & Tone

**Personality** — Direct, technically literate, category-fluent. Speaks GEO jargon (prompt set, citation rate, model coverage, source bias) without explaining it. Talks to marketers who already know what AI search is.

**Headline pattern**

- "AI search analytics for marketing teams." (tagline)
- "Understand how AI sees your brand."
- "Turn AI search insights into new customers with ztor."

Compound capability statements: `[Verb] [outcome] for [audience]` or `[Mechanism]` → outcome.

**Subhead pattern** — Mechanism + inline metric pills:

> "Track, analyze, and improve brand performance on AI search platforms through key metrics like `👁 Visibility`, `⚙ Position`, and `😀 Sentiment`."

**CTA microcopy**

- `Sign up` (default conversion)
- `Start Free Trial` (hero primary)
- `Talk to Sales` (hero secondary outline)
- `Book a Demo` (sales-led funnel)

**Capitalization** — Sentence case for headings + paragraphs. Title Case for buttons ("Start Free Trial").

**Tense / voice** — Imperative + active present. "Track, analyze, improve."

---

## 5. Accessibility

| Concern | Observed value |
|---|---|
| Body text contrast | `#000000` on `#FAFAF7` = **~19.9:1** (AAA) |
| Body Inter 14px contrast | `rgba(0,0,0,0.7)` on `#FAFAF7` = **~13:1** (AAA) |
| Primary CTA text | `#171717` on `#FFDB29` = **~13.1:1** (AAA) ⚡ — dark text on yellow easily passes |
| **Primary CTA edge (UI component contrast)** | `#FFDB29` on `#FAFAF7` = **~1.3:1** ⚡ — **fails** WCAG 2.1 SC 1.4.11 (3:1 for UI component edges) **without** the hairline `box-shadow: 0 0 0 1px rgba(23,23,23,0.12)` added in `button.css`. With the hairline the button perimeter is perceivable at ≥3:1 effective stroke. **All new uses of `--primary` against light surfaces must include this hairline.** |
| Footer (black) | `#FFFFFF` on `#000000` = **21:1** (AAA) |
| Border `#D1D1C7` on `#FAFAF7` | **~1.30:1** ⚡ — decorative only; still below 3:1 so paired with shadow for actual element separation |
| Focus ring `#171717` on `#FFDB29` (button focus) | **~13.1:1** (AAA) — black ring on yellow stays visible |
| Focus ring `#171717` on `#FAFAF7` (outline button focus) | **~19.9:1** (AAA) |
| Inline default link blue `rgb(0,0,238)` exposed in computed style | Framer leftover — overridden visually but flagged as a CSS smell |
| Reduced motion | Framer respects `prefers-reduced-motion` inside its runtime |
| Heading hierarchy | One H1 per page; clean H1 → H2 → H3 cascade |
| 404 page | Same chrome + single heading → AAA |
| Keyboard nav | Dropdown openable but no Escape-to-close observed |
| WCAG estimate | **AA on text + ring; AAA on text contrast.** Primary concern is UI-component edge contrast — solved at the `.ztor-btn` level with a hairline shadow. Any new yellow-on-light surface (yellow badge, yellow icon button) must add an equivalent hairline. |

⚡ = changed from ztor

---

## 6. App surface (app.ztor.ai)

**Stack** — **Tailwind v4 + shadcn/ui** with cva variants. Vite + Rolldown build. TanStack Query for data. MapLibre GL for geo viz. Sentry release injection. The opposite of the marketing surface — utility-CSS native, full design-token layer, dark mode included.

### 6.1 Token layer (light + dark)

```css
:root { --font-geist: "Geist Variable", sans-serif; }

/* Light (defaults via Tailwind @theme inline → all --color-* aliases) */
--color-background:   var(--color-neutral-50);   /* #FAFAFA */
--color-foreground:   /* near-black via stone scale */
--color-card:         /* surface tier */
--color-primary:      /* near-black CTA */
--color-ring:         /* focus ring */
--radius:             0.625rem;                  /* 10px — app default */

/* Dark (html.dark) — warm/orange-tinged */
--color-background:   var(--color-stone-800);
--color-foreground:   var(--color-orange-100);
--color-card:         var(--color-stone-900);
--color-primary:      var(--color-stone-600);
--color-chart-1:      var(--color-orange-600);
--color-warning-base: var(--color-orange-600);
--color-selected:     var(--color-red-500);
--color-admin:        var(--color-violet-500);
```

**Radius scale** (Tailwind v4 derived):

| Token | Value | Where |
|---|---|---|
| `--radius-sm` | `calc(var(--radius) - 4px)` = **6px** | Badges, small chips, inputs inner |
| `--radius-md` | `calc(var(--radius) - 2px)` = **8px** | Buttons (most), inputs |
| `--radius-lg` | `var(--radius)` = **10px** | Cards, popovers (app default) |
| `--radius-xl` | `calc(var(--radius) + 2px)` = **12px** | Dialogs, sheets |
| `--radius-2xl` | `1rem` = **16px** | Hero panels, image frames |

**App is more rounded than marketing** (6–7px → 10px default). This is the largest visible delta between the two surfaces.

### 6.2 Color palette extensions

App ships full Tailwind palette (amber / blue / cyan / emerald / fuchsia / gray / green / indigo / lime / neutral / orange / pink / purple / red / rose / sky / slate / stone / teal / violet / yellow / zinc) as raw `--color-{name}-{50..950}` scale, PLUS semantic aliases above.

**Status semantics — much richer than marketing**:
- `success-{lighter, light, base, dark}` — visibility/citation OK states
- `warning-{lighter, light, base, dark, foreground, background}` — rate-limit / data-stale states
- `error-{lighter, light, base, dark}` — fetch failures
- `positive` / `excellent` / `good` / `bad` / `poor` — StatusBadge tiers for visibility metrics
- `admin` / `selected` — internal/UI tier markers

### 6.3 Typography (app)

| Family | Where | Notes |
|---|---|---|
| `--font-geist` (Variable) | Everything — H1 to body | App drops marketing's Inter for paragraphs; Geist Variable handles all weights |
| `--font-sans` (system stack) | Fallback | Apple/Segoe/Noto emoji incl. |
| `--font-mono` | Code, IDs, monospace data | SFMono / Menlo / Consolas |

**Font-weight scale** (note `normal: 500` is unusual):
- `--font-weight-light: 300`
- `--font-weight-normal: 500` (heavier than typical 400)
- `--font-weight-medium: 500`
- `--font-weight-semibold: 600`
- `--font-weight-bold: 700`

### 6.4 Components confirmed in app

Confirmed via JS chunk names in `modulepreload` and cva class strings in bundle.

| Component | Evidence | Notes |
|---|---|---|
| Button | shadcn defaults + cva | App default radius 10px (vs marketing 6/7px) |
| Badge / StatusBadge | `StatusBadge-*.js`; cva: `rounded-sm border px-[6px] py-0.5 text-xs font-medium focus:ring-2 ring-ring ring-offset-2` | Variants: default · excellent · good · bad · poor + admin |
| Calendar | `calendar-*.js` (full Intl.DateTimeFormat timezone-aware) | Used in date-range filters |
| Select | `select-*.js` (Radix Select + lucide chevron-down / chevron-up) | Standard shadcn Select |
| Combobox | (Inferred — Select + search input pattern) | Used for prompt / domain pickers |
| Tooltip | `tooltip` selectors in CSS bundle | Radix Tooltip |
| Popover | `popover` selectors in CSS bundle | Radix Popover |
| Dialog | `ZtorTableDeltaConfigurationView` (uses dialog) | Radix Dialog |
| Sheet | (Inferred — Radix variant of Dialog) | Side panel |
| Card | shadcn Card primitives | `--color-card` token in use |
| Avatar | shadcn Avatar | User profile + team member surfaces |
| Skeleton | Loading states | Standard shadcn |
| Empty | Empty-data dashboards | "No prompts tracked yet" pattern |
| Sidebar | App shell | `MainPageTitleView` indicates left-nav layout |
| Chart | recharts + custom wrapper; 6 chart colors | Plus MapLibre for geo dot-density |
| Table | `ZtorTable-*.js` + `ZtorTableDeltaConfigurationView` | Custom resizable table with delta config dialog |
| Color picker | `react-colorful` (third-party) | For chart-color customization |

### 6.5 App-specific (no shadcn analog)

| Component | Purpose |
|---|---|
| **ZtorTable** | Custom resizable competitor table — sortable, with "delta" column comparing two time windows |
| **DashboardModelFilter** | Segmented filter for AI providers (ChatGPT · Gemini · AI Mode) |
| **ModelChannelIcon** | Icon set for AI providers — used in ZtorTable rows |
| **DomainIconWithoutTooltip** | Favicon-style domain marker used inline in citation lists |
| **ZtorTableDeltaConfigurationView** | Dialog for configuring the delta column on ZtorTable |
| **Map (MapLibre)** | Geo visualization for citation source countries |

### 6.5.1 Confirmed live (runtime crawl 2026-05-23)

Walked onboarding steps 1–5 via Playwright with the user's authenticated session. Stopped at billing wall. Captured chrome from 30+ components in real runtime. See [`_crawl/app-notes.md`](_crawl/app-notes.md) "Full onboarding crawl" section for the complete table.

Key runtime findings beyond the bundle inference:
- **Three button-shadow tiers in the system**: 2-layer (marketing) / 3-layer (primary + outline buttons) / **5-layer ambient elevation** (Accordion triggers — unprecedented in marketing)
- **Focus ring is `#2B7FFF` blue** with a **double-ring pattern on open dropdowns**: 1px solid inner + 4.3px halo outer
- **Three radius tiers**: 8px (buttons / inputs / chips) · 10px (cards / sidebar items = `--radius`) · 12px (textarea / accordion / dropdown panel)
- **Two foreground colors in use**: body text `lab(27%)` (medium gray) vs heading `lab(2.75%)` (near-black) — different tokens
- **Tab bar uses font-weight delta** (500 → 600) + color shift + underline for active state — three signals combined
- **"Recommended" badge** is a blue tint pill (`#2B7FFF` at 10% bg + full saturation text) — shared color family with focus ring

### 6.5.2 Authoritative `ztor-*` token taxonomy (full dashboard crawl 2026-05-25)

Bypassed Stripe paywall on a real account, walked all 19 sidebar destinations + onboarding (9 screens). The `class=` attributes expose the **canonical token names** the ztor team writes against — these are the names to use when implementing, not the computed values.

**Text colors** — 4-tier scale + semantic + numbered features
- `ztor-text-primary` · `ztor-text-secondary` · `ztor-text-tertiary` · `ztor-text-quaternary`
- `ztor-text-on-dark` (inverse text on dark surfaces)
- `ztor-text-success` (semantic — paired with brand green)
- `ztor-text-feature-2` (numbered "feature" colors — implies a 1..N feature accent palette)
- `text-fg-tertiary` (legacy/shadcn-style naming, coexists with `ztor-text-*` — migration in flight)

**Backgrounds** — separate `bg` and `surface` namespaces
- Tiers: `ztor-bg-white` · `ztor-bg-primary` · `ztor-bg-secondary` · `ztor-bg-tertiary` · `ztor-bg-quaternary`
- Inverse: `ztor-bg-invert`
- Surface naming (newer convention): `ztor-bg-surface-secondary`
- Semantic: `ztor-bg-success`
- Component-specific: `ztor-bg-sidebar` · `ztor-bg-table-hover` · `ztor-bg-input`

**Borders** — distinguishes "stroke" (line) from "separator" (divider)
- Strokes: `ztor-border-stroke-primary` · `ztor-border-stroke-secondary` · `ztor-border-stroke-tertiary` · `ztor-border-stroke-quaternary`
- Stroke with opacity suffix: `ztor-border-stroke-secondary-20` (20% alpha)
- Separator: `ztor-border-separator-primary`

**Shadows**
- Elevation: `ztor-shadow-sm` · `ztor-shadow-md`
- Button-specific: `ztor-shadow-button-primary` · `ztor-shadow-button-inverse` (each ships its own composition — see runtime values below)

Runtime shadow values observed:
| Token | Composition |
|---|---|
| Card | `0 1px 2px -1px rgba(23,23,23,.08), 0 1px 3px 0 rgba(23,23,23,.08), 0 0 0 1px rgba(23,23,23,.06)` |
| Button-primary (dark btn) | `0 -1px 0 inset rgba(253,253,253,.16), 0 0 0 1px rgb(23,23,23), 0 1px 3px rgba(23,23,23,.08)` |
| Button-inverse / surface | `0 -1px 0 inset rgba(23,23,23,.04), 0 1px 3px rgba(23,23,23,.08), 0 0 0 1px rgba(23,23,23,.06)` |
| Popover | `0 0 0 1px rgba(23,23,23,.08), 0 10px 15px -3px rgba(23,23,23,.08), 0 4px 6px -4px rgba(23,23,23,.08)` |
| Tooltip | `0 2px 4px -2px rgba(23,23,23,.1), 0 4px 6px -1px rgba(23,23,23,.08), 0 0 0 1px rgba(23,23,23,.08)` |
| Focus (dashboard) | `0 0 0 2px rgba(79, 57, 246, 0.1)` — **brand purple #4F39F6 at 10% as 2px halo** |
| Focus (locale form) | `0 0 0 1px rgb(43,127,255), 0 0 0 2px rgba(21,93,252,.1)` — blue variant (input focus) |

**Badges** — 8-color semantic palette
- `ztor-badge-gray` · `ztor-badge-lime` · `ztor-badge-cyan` · `ztor-badge-orange` · `ztor-badge-blue` · `ztor-badge-red` · `ztor-badge-purple` · `ztor-badge-violet`
- Note: `purple` and `violet` are both present — likely a finer distinction (one cooler/bluer than the other)

**Typography utilities** — ztor rolls its own scale alongside H tags
- Body: `text-body-s` / `text-body-s-semibold` · `text-body-m` / `text-body-m-regular` / `text-body-m-semibold` / `text-body-m-medium-mono` · `text-body-l`
- Caption: `text-caption`
- Headings: `text-h1-small` · `text-h2-small` · `text-h3` / `text-h3-medium` · `text-h4`
- State: `text-disabled` · `text-disabled-400` (numeric scale lives behind the disabled token too)
- Shadcn aliases coexisting: `text-foreground` · `text-secondary-foreground`

**Brand purple discovery** — Focus rings on the dashboard use **`rgb(79, 57, 246)` = `#4F39F6`** at 10% alpha (2px halo). This is a *previously undocumented brand color*; the bundle analysis only surfaced the blue (`#2B7FFF`) variant of the focus ring. The blue is used during onboarding (input focus on locale form), the purple appears once inside the authenticated dashboard. Both rings are 2px / 10% alpha — same shape, different hue.

**Brand green** — `lab(47.03 -47.02 31.48)` ≈ `#2DB55E` appears as the dominant accent color across dashboard text (~72 occurrences on /results) — this is the **primary brand accent for positive metrics** (visibility up, citations gained). Pair: pale-green bg `lab(96.18 -13.85 6.52)` ≈ `#E8F5E1` for sentiment cell backgrounds.

### 6.5.3 Dashboard information architecture

Captured from the full sidebar walk; this is the authoritative IA of the authenticated app:

```
[Brand selector: Pathfinders]
├─ General
│   ├─ Overview          (/?brand=…)        — landing card grid
│   ├─ Prompts           (/prompts)         — prompt-tracking table
│   ├─ Domains           (/sources/domains) — Domain movers + Hosts tab
│   ├─ URLs              (/sources/urls)
│   └─ Gap analysis      (/sources/gaps)
├─ Brand
│   ├─ Insights          (/insights)
│   ├─ Actions [Beta]    (split into 3 below)
│   ├─ Earned · Off-page (/actions/earned)
│   ├─ Owned · On-page   (/actions/owned)
│   └─ Impact            (/actions/impact)   — todo/history empty state
├─ Beta
│   └─ Agent analytics (split into 2)
│       ├─ Crawl insights  (/agent-analytics/crawl-insights)
│       └─ Crawlability    (/agent-analytics/crawlability)
├─ Project
│   ├─ Profile           (/profile)
│   ├─ Brands (10+)      (/brands)
│   └─ Tags              (/tags)
└─ Company
    ├─ Settings          (/company)
    ├─ Projects          (/projects)
    ├─ API Keys          (/api-keys)
    ├─ Members           (/members)
    └─ Billing           (/billing) — `/plan` is the onboarding paywall route; this one is the authenticated post-trial management view
```

**Global filter bar** on every brand-scoped page: `All time` (range) · `All Tags` · `All Models` · `All Topics`. **Trial pill** ("Trial ends in 7 days") and **brand selector** ("Pathfinders") sit top-right.

**Onboarding wizard route order**:
1. `/setup` — STEP 1/5 — locale (country / language / timezone)
2. `/brand-profile` — STEP 2/5 — description / industry / brand identity chips / products
3. `/select-topics` — STEP 3/5 — auto-generated topics in user's chosen language; counter `5/10`
4. `/select-topic-prompts` — STEP 4/5 — accordion-grouped prompt picker; counter `40/50`. CTA copy changes to "Looks good"
5. `/results` — STEP 5/5 — sample dashboard with `Pathfinders` demo data
6. `/plan` — paywall (Starter $95 / Pro $245 / Advanced $495 monthly tiers + Yearly toggle)
7. **Stripe hosted Checkout** (`checkout.stripe.com/c/pay/...`) — external; ztor has no in-app billing form
8. `/select-models` — post-payment — pick 3 of 7 (ChatGPT/Perplexity/AI Overview/AI Mode/Gemini/Grok/Copilot)
9. `/welcome` — attribution survey (8 chip pills) → CTA `Continue` → "You're all set" → `Explore insights`

**Dashboard schema** (Overview default view):
- Get set up · 4/5 (onboarding progress card with checklist: Add 3 topics / Add 15 prompts / Add 6 competitors / Create 5 tags / Tag 10 prompts)
- Visibility (chart)
- Top 7 Brands (ranked table — Rank · Brand · Visibility · Sentiment · Position)
- Top Domains
- Recent Chats
- "Connect Ztor to Claude, Cursor, and any MCP tool" (promo card)

### 6.5.4 Overlay primitives (Popover · Dialog · Tooltip)

Captured by triggering each overlay live with Playwright on `/prompts`:

| Primitive | Trigger | Radius | Bg | Shadow | Notes |
|---|---|---|---|---|---|
| **Popover** | Filter buttons (All Models / All Tags / All Topics / All time) | `12px` | `ztor-bg-white` (#FDFDFD) | `ztor-shadow-lg` = 3-layer ring+drop | Used with `role="dialog"` (Radix idiom). Inner items use `rounded-[10px]` containers, `rounded-[8px]` buttons |
| **Dialog** | "Add Prompt" / "New topic" | `rounded-md` mobile → `sm:rounded-[8px]` ≥640 | `ztor-bg-white` (#FDFDFD) | `ztor-shadow-lg` (same as popover) | `max-w-[580px]`, `max-h-[90vh]`. Animation: 200ms `scale(.95→1)` + `opacity(0→1)`. Heading uses `text-h3` |
| **Tooltip** | Column headers + relative timestamps (`data-slot="tooltip-trigger"`) | `8px` (`rounded-md`) | INVERSE: `lab(7.78 0 0)` ≈ near-black | **none** (no shadow — uses inverse bg for separation) | `padding 6px 8px`, `Geist 14/20/500`, classes use shadcn aliases `bg-primary text-primary-foreground` instead of `ztor-*` (migration artifact) |

**Shadow token discoveries from overlays:**
- `ztor-shadow-lg` — `0 4px 6px -4px rgba(23,23,23,.1), 0 10px 15px -3px rgba(23,23,23,.08), 0 0 0 1px rgba(23,23,23,.08)` — shared by popover + dialog. Tonal 1px ring is part of the composition, not a separate `border`.
- `ztor-border-separator-secondary` — discovered inside the popover body, distinguishing list-item dividers from container outlines.

**Naming exception** — Tooltip is the ONLY overlay where ztor falls back to shadcn-style `bg-primary` / `text-primary-foreground` aliases instead of `ztor-*` names. Everywhere else the `ztor-*` namespace dominates. Worth preserving this exception if forking the system (the tooltip primitive feels untouched-from-shadcn for a reason).

### 6.5.5 Dark mode

Activation is via `html.dark` class. **No in-UI toggle was found** on Profile, Settings, or any other page — the toggle either lives in a slash-command/keyboard-only path or is driven by `prefers-color-scheme`. Dark mode CSS is fully shipped (`[class*="dark:"]` utilities present throughout the bundle).

**Surface pattern in dark mode** — ztor does NOT use stepped opaque grays (`stone-800/900/950`). Instead, surfaces are achieved via **additive translucent whites** on top of a near-black canvas. This is a sophisticated choice that keeps surface saturation consistent across modes.

| Token role | Light value | Dark value |
|---|---|---|
| Body bg | `rgb(253,253,253)` (#FDFDFD) | `rgb(23,23,23)` (#171717) — exact inverse |
| Body text | `rgb(23,23,23)` | `rgb(253,253,253)` — exact inverse |
| Low-elevation surface | `ztor-bg-secondary` (off-white step) | `rgba(253,253,253, 0.06)` — translucent white |
| Card / standard surface | `ztor-bg-white` (#FDFDFD) | `rgba(253,253,253, 0.10)` |
| Focus / highlight surface | `ztor-bg-tertiary` | `rgba(253,253,253, 0.16)` |
| Positive accent | `lab(47.03 -47.02 31.48)` ≈ #2DB55E | `rgb(0,166,62)` = `#00A63E` (purer green) |
| Negative accent | (sparse in light) | `rgb(231,0,11)` = `#E7000B` (text at 100%, bg at 10%) |

**Implications for re-implementation:**
- Build dark surfaces as `bg-white/{6,10,16,…}`, NOT as a separate stone/zinc scale
- Brand accents SHIFT between modes (saturated `lab()` greens in light → pure RGB greens in dark) — implementer must define both, can't derive one from the other
- The inverse body color (#FDFDFD light ↔ #FDFDFD dark text — note it's the SAME color value used as bg in light and text in dark) is a deliberate Aha moment of the token system: one neutral, two roles

### 6.5.6 Mobile breakpoint behavior

Tested at 375×812 (iPhone 13). Tailwind breakpoints actually emitted in the bundle: **`sm:` (640px) and `md:` (768px)** — no `lg:` or `xl:` evidence. Ztor is a desktop-first, three-tier responsive system: `<640` / `640-767` / `≥768`.

| Concern | Mobile behavior |
|---|---|
| **Sidebar** | Takes **full viewport width** (375px) on mobile — pushes content offscreen. No overlay scrim. `Toggle Sidebar` button is the only dismiss mechanism. Sidebar IS the page until toggled |
| **Filter bar** | The 4 filter pills (All time / All Tags / All Models / All Topics) **overflow horizontally** — they extend past 600px x-coord. Implementer relies on horizontal scroll, no collapse-into-Filters-modal pattern |
| **Dialog radius** | `rounded-md` (6px) at mobile, `sm:rounded-[8px]` (8px) at ≥640 — opposite of typical "mobile = sharper" trend |
| **Content padding** | Main element has `padding: 0` at 375px — page content flush to viewport edge |
| **Container width** | No `max-w` applied on mobile — content uses full 375px |

**Implications for re-implementation:**
- The "sidebar pushes content off, no scrim" pattern is unusual but consistent with ztor being a desktop-first data app — implementer should decide whether to keep it (faithful) or override (better mobile UX)
- Filter row needs horizontal scroll on mobile, not a "Filters" sheet collapsing — this is the ztor opinion. shadcn's `Sheet` component would be a deviation
- Three-tier responsive only — there's no `xl:` or `2xl:` differentiation, so layouts at 1280px and 1920px are identical to the 768-1280 layout

### 6.5.7 Tier A interaction crawl (Pass 3.5, 2026-05-25)

Triggered each remaining high-value surface live and captured the runtime spec.

**Detail-view convention** — Clicking a `[role="row"]` (e.g. on `/prompts`) **navigates to `/prompts/<id>`** as a full page, not a side-panel. The row class hints at the affordance: `ztor-bg-white hover:ztor-bg-table-hover cursor-pointer`. The detail view adds one new section unique to the route: **Fanout Queries** (between Top Domains and Recent Chats). Ztor deliberately avoids the Sheet/Drawer pattern — drill-in is always a new route. This is an opinion worth preserving when forking.

**Dialog form taxonomy** — Three create dialogs captured. All share `ztor-shadow-lg` + radius `8px` desktop / `rounded-md` mobile.

| Dialog | Fields | Notable pattern |
|---|---|---|
| **Add Topic** | Topic (text) · Prompts per topic (number) · Location (combobox) · Language (combobox) | Submit → silent URL update `?selected-topic=<id>`. No toast, no celebration |
| **Add Brand** | Display Name · Tracked Name · Aliases (Add Alias) · Advanced: Regular Expression (collapsed) · Domains (Add alternative domain) | Heading reads "Update Brand Modal" — i18n bug, **same modal serves create AND edit**. Advanced regex is a *progressively disclosed* affordance |
| **Create Personal Access Token** | Name · Expiration (Never / 30 / 60 / 90 days) | **Token reveal pattern**: same dialog *mutates* between "Create" (input form) and "Created" (read-only token + Copy button) states. Single dialog, conditional body — not two dialogs |

**Toast / Sonner — full spec** (triggered via Copy token, the only confirmed toast trigger):

| Property | Value |
|---|---|
| Library | **Sonner** (`data-sonner-toast` attribute) |
| Position | bottom-right (`data-y-position=bottom`, `data-x-position=right`) |
| Width | `356px` (Sonner default — not customized) |
| Background | `rgb(255, 255, 255)` — **pure white**, NOT `ztor-bg-white` (#FDFDFD) |
| Text color | `rgb(23, 23, 23)` |
| Radius | `8px` |
| Border | `1px solid rgb(237, 237, 237)` |
| Shadow | `0 4px 12px 0 rgba(0,0,0,.1)` — single-layer drop |
| Padding | `16px` |
| Font | `ui-sans-serif 13px/19.5px weight 400` — **NOT Geist** |
| Class composition | `group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg` |
| `data-type` | `success` on copy action |

**The toast is the ONLY surface in the entire app that escapes both the `ztor-*` utility layer AND the Geist font.** It's stock shadcn/sonner with no ztor customization. This is a real signal of where ztor drew the line — implementer must decide whether to keep this "unstyled defaults" look (faithful) or restyle Sonner to ztor tokens (better consistency).

**Refer & Earn is a dialog, not a route.** Triggered from sidebar footer; opens an overlay with: readonly referral link + Copy button, pre-written email template in a readonly textarea, "30% off / earn up to $1,000" value prop, and a "Track your referrals & earnings" deep link. There is NO `/refer` page in the app — implementer should not spend a route on this.

**User menu is the brand selector.** The "Pathfinders" button at the top of the sidebar opens a unified menu:
```
yves.liu@pathfinders.studio          (read-only identity header)
✓ Pathfinders                        (current workspace)
  Add new project
  Logout
```
Notably absent: Account settings, Profile, Theme toggle, Preferences, Notifications, Keyboard shortcuts. Account UI is **genuinely minimal** — just identity + workspace + logout. This confirms that the dark mode toggle truly doesn't exist in UI and must be driven by `prefers-color-scheme` (or programmatic `html.dark`).

**New tokens discovered in Tier A:** `ztor-badge-green` (distinct from existing `ztor-badge-lime`), `text-card-foreground` (shadcn alias still in bundle).

### 6.5.8 Pass 4 — component variants, states, and edge cases

Final design-system completeness sweep (2026-05-25, Pass 4). Captured Tier A2 (component variants), Tier B (secondary flows), and Tier C (states/edge cases) — see [`_crawl/app/pass4-findings.json`](_crawl/app/pass4-findings.json).

#### Toast variants (Sonner, full spec)

ztor ships Sonner with **`richColors={false}`** by default — all type variants render as the same white card. The colored variants exist in CSS and are opt-in. To activate them, set `richColors` on the Toaster.

| Variant | Light bg | Light text | Light border | Dark bg | Dark text |
|---|---|---|---|---|---|
| default | `#fff` | `var(--gray12)` | `var(--gray4)` | `#000` | `var(--gray1)` |
| **success** | `#ECFDF3` | `#008A2E` | `#D3FDE5` | `#001F0F` | `#59F3A6` |
| **info** | `#F0F8FF` | `#0973DC` | `#D3E0FD` | `#000D1F` | `#5896F3` |
| **warning** | `#FFFCF0` | `#DC7609` | `#FDF5D3` | `#1D1F00` | `#F3CF58` |
| **error** | `#FFF0F0` | `#E60000` | `#FFE0E1` | `#2D0607` | `#FF9EA1` |

#### Button states

The primary inverse button (`ztor-bg-invert ztor-text-on-dark ztor-shadow-button-inverse`) uses a **`::before` pseudo-element with an oklab gradient** to render the hover state, NOT a background-color change.

| State | Mechanism |
|---|---|
| **Resting** | bg `#171717`, shadow `0 -1px 0 inset rgba(253,253,253,.16), 0 0 0 1px #171717, 0 1px 3px rgba(23,23,23,.08)` |
| **Hover** | `::before` overlay: `linear-gradient(in oklab, rgba(253,253,253,.06), rgba(253,253,253,.10))`. Drop-shadow alpha lowers from .08 → .06. 150ms `all` transition |
| **Focus-visible** | Token: `ztor-shadow-focus-blue` — `0 0 0 1px rgb(43,127,255), 0 0 0 2px rgba(21,93,252,.1)`. A purple variant (`#4F39F6`) exists for non-button focus targets |
| **Disabled** | Native `:disabled` styles — `pointer-events: none`, opacity dim |

**New CSS variable**: `--ztor-button-outlined-active-bg-top` — gradient top stop for outlined buttons in active state.

#### Input states

Input has **no real border** — a 4-layer oklch ambient shadow simulates depth:

```
box-shadow:
  0 0 0.5px oklch(0 0 none / .25),
  0 0 2px   oklch(0 0 none / .10),
  0 0 4px   oklch(0 0 none / .05),
  0 4px 8px oklch(0 0 none / .02);
```

| State | What changes |
|---|---|
| Resting | The 4-layer ambient shadow above |
| Focus | Adds `0 0 0 1px lab(54.17 13.34 -74.68)` (blue) inner ring layered on top |
| `aria-invalid=true` | **No visual change on the input itself.** Error is signaled only via the message below |
| Disabled | `opacity: 0.5`, `cursor: not-allowed` |

**Inline error message** (e.g. "Invalid email address" on Members invite):
- Token: `text-caption text-destructive` (**new token: `text-destructive`**)
- Color: `lab(55.48 75.07 48.85)` ≈ vivid red
- Font: Geist Variable 11px / 16px / weight 500

#### Other Pass 4 findings

**Bulk Upload dropzone** (Add Prompt → Bulk Upload tab) — implemented as a `<button>` element supporting both drag-drop AND click-to-browse. Helper copy: "Make sure your CSV follows the required format or download example."

**Plans toggle** (Monthly / Yearly on `/billing`) — segmented button pair, no animation on switch.

**Two pricing surfaces** — `/plan` (onboarding paywall) has "Show all features" feature comparison expansion. `/billing` (post-trial management) does NOT. Plus the marketing `/pricing` is a third surface — three pricing UIs total, intentional differences in granularity.

**Parent route behavior**:
- `/sources` → `/sources/domains` (auto-redirect)
- `/actions` → `/actions/earned` (auto-redirect)
- `/agent-analytics` → **404** (router bug — no fallback to a child)

**Members invite is inline, not modal** — top of `/members` page, with `<input type="email">` + role select + Invite button. This is the FIRST inline form with visible validation we found (most ztor forms only use disabled-button-until-valid).

**Tag color palette has 11 colors**, distinct from the badge palette (9 colors):
- **Tag**: gray, red, orange, yellow, lime, green, cyan, blue, purple, fuchsia, pink
- **Badge**: gray, lime, green, cyan, orange, blue, red, purple, violet (badges have violet, tags don't; tags have yellow/fuchsia/pink, badges don't)

**Upsell dialog** — quota reached uses a hard dialog block. Heading "Project limit reached" + body explaining the limit + `Upgrade plan` (primary CTA → /billing) + `Close`. ztor's upsell strategy is **reactive** (hit-the-limit), not proactive banners.

**Sort indicator**: SVG chevron in column header is always present (rendered regardless of active sort). Click cycles asc → desc → unsorted. **`aria-sort` attribute is NOT set** — screen readers can't announce sort direction (a11y gap to fix on re-implementation).

**Filter applied state**: filter button text changes (`All Models` → `AI Overview`) but no style change. The only signal is the label — a colored dot or count badge would be an a11y improvement.

**No command palette** — Cmd+K does nothing. ztor doesn't ship one.

**No Skeleton component rendered** during navigation — either content loads too fast (cached TanStack queries) or ztor uses inline placeholders instead of a dedicated Skeleton primitive.

**Workspace menu** uses `role="menu" aria-label="Workspace menu"`, with `role="menuitemcheckbox"` for project items (current project = aria-checked=true, others = aria-checked=false). Confirms ztor treats project switching as a single-select toggle group, not a navigation menu.

**In-app 404** captured (title: `ztor • 404`). See `screenshots/app/tierB-01-in-app-404.png`.

### 6.5.9 Local reproduction now ships dark mode (2026-05-25)

`sample.html` and `component-preview.html` now include a **dark-mode toggle** (top-right `🌙 / ☀️`) backed by `[data-theme="dark"]` overrides in `components/_tokens.css`. State is persisted via `localStorage['ztor-theme']` and applied pre-paint to avoid flash.

The dark palette is **not** derived by inverting the marketing tokens — it uses the values measured from app.ztor.ai dark mode in Pass 3:

| Token | Light | Dark |
|---|---|---|
| `--background` | `#F7F7F7` | `#171717` |
| `--surface` | `#FFFFFF` | `rgba(253,253,253, 0.10)` translucent overlay |
| `--surface-muted` | `#FAFAFA` | `rgba(253,253,253, 0.06)` |
| `--surface-inverse` | `#000000` (footer slab) | `#0A0A0A` (footer goes *deeper*, not flipped to white — preserves slab as a break) |
| `--foreground` | `#000000` | `#FDFDFD` |
| `--border` | `#E5E5E5` | `rgba(253,253,253, 0.12)` |
| `--status-success` | `#22C55E` | `#00A63E` (pure RGB green) |
| `--status-error` | `#DA314A` | `#E7000B` (pure RGB red) |

**Surface convention**: dark uses **additive translucent whites** on a near-black canvas (matches ztor app dark), NOT stepped opaque greys. Status accents shift hue between modes — they cannot be derived from each other via opacity.

Toggle script (inlined in both files) sets/removes `data-theme="dark"` on `<html>` and persists to `localStorage`. The button itself is a `.theme-toggle` class defined in `_tokens.css`.

### 6.6 Differences from marketing surface

| Concern | Marketing (ztor.ai) | App (app.ztor.ai) |
|---|---|---|
| Stack | Framer-published, no token layer | Tailwind v4 + shadcn/ui, full token layer |
| Theme | Light only | Light + **dark** (`html.dark`) |
| Default radius | 6–7px | **10px** (more rounded) |
| Body font | Inter (paragraphs) + Geist (UI) | **Geist Variable everywhere** |
| Brand chromatic | None (monochrome + status dots) | **Orange-tinged in dark** (orange-100 fg, orange-600 chart-1) |
| Border treatment | Multi-layer rim+drop shadow (no `border`) | Real `border` utility from Tailwind |
| Status palette | 4 colors as data dots only | 4-tier scale per status (lighter/light/base/dark) for UI fills |
| Component library | ~13 hand-built | Full shadcn/ui set |
| Focus ring | Framer default (often invisible) | Explicit `ring-2 ring-ring ring-offset-2` |

---

## Not observed (still)

- Specific motion durations on app surface (would need runtime DOM crawl)
- Per-component spacing rhythm inside app (utility classes resolve at runtime)
- Toast / Sonner notification spec (likely Radix Toast or react-hot-toast — not visible from bundle name alone)
- Skip link in marketing chrome
- App login form chrome (separate auth domain or inlined as a Radix Dialog on first load)

## Confirmed absent (marketing surface)

These were checked in Pass 2 (2026-05-25) by inspecting the form lifecycle pages and confirmed to be a deliberate non-pattern, not a crawl gap:

- **Toast / inline form confirmation** — ztor never shows a toast on form submit. Success, failure, and "team is booked" each route to dedicated landing pages (`/form-success`, `/form-not-submitted`, `/form-forwarded-video`), each rebuilding the full marketing chrome with a unique H1. If you implement this design system on a stack that has toasts (shadcn/sonner), prefer route-level success states over inline toasts to stay true to the source.
- **Single comparison template** — `/comparison/*` is not one template. The Ahrefs and Semrush pages use a feature-comparison table; the Profound page drops the table and runs as long-form editorial with H2 sections. Comparison is a **content type with two layout variants**, not a single template.

---

## Sources

- `_aggregate.json` — cross-page marketing token aggregation
- `_crawl/*.json` — 35 marketing-page computed-style dumps (Pass 1: 26 pages 2026-05-22 · Pass 2: +9 gap-fill pages 2026-05-25)
- `_crawl/app/*.json` — 17 authenticated dashboard runtime dumps (9 onboarding + dashboard pages + `interactive-overlays.json` + `darkmode-and-mobile.json` + `tierA-findings.json` + `pass4-findings.json` + audit markdowns) — Pass 3, 3.5, and 4 — 2026-05-25
- `_crawl/app-bundle.css` — full app CSS bundle (610 KB Tailwind v4) saved 2026-05-22
- `_crawl/app-notes.md` — extraction notes from app bundle + JS chunk analysis
- `screenshots/` — 7 marketing-page fullPage visual verification
- `screenshots/app/` — **60+ screenshots** (Pass 3, 3.5, 4 — 2026-05-25, authenticated): 9 onboarding · 19 dashboard fullPage · 5 interactive overlays · 4 dark mode · 4 mobile · 10 Tier A (prompt detail · 3 dialogs · 2 token states · sonner toast · Refer & Earn · user menu) · 7 Pass 4 (button focus · skeleton attempt · Bulk Upload · Yearly toggle · in-app 404 · invite-member · create-tag · upsell · sort applied · filter applied) — prefixes: `setup-` / `dashboard-` / `interactive-` / `darkmode-` / `mobile-` / `tierA-` / `tierA2-` / `tierB-` / `tierBC-` / `tierC-`
- Live extraction dates: **2026-05-22** (initial bundle + onboarding to billing wall) · **2026-05-25** (marketing gap-fill + paid-tier dashboard + overlays + dark + mobile)
- Marketing identifier: Framer-published (`data-framer-component-type` × 449 on home, no `[data-slot]` / `[data-state]` markers)
- App identifier: Tailwind v4 + shadcn (`data-slot=tooltip-trigger` × 11 confirmed on dashboard; `--radius: .625rem` = shadcn default) + custom `ztor-*` utility layer (see §6.5.2 for full taxonomy)
- App paywall: hosted Stripe Checkout at `checkout.stripe.com/c/pay/...` — ztor has no in-app billing form chrome; the `/billing` route (post-trial) is for plan management only, all card capture is delegated
- App identifier: Tailwind v4 + shadcn/ui + Rolldown bundle on Google Cloud Storage
