# R 2.0 Final Checklist

> **Last reviewed**: 2026-05-25
> **Status**: ✅ All checks passed — R 2.0 ready as a complete light/dark prototype

---

## A. Design system foundation

- [x] ztor design system copied to `ds-components/` (11 base + 7 added in Phase 2 = **18 components**)
- [x] `_tokens.css` declares both `:root` (light) and `[data-theme="dark"]` (dark) palettes
- [x] `fonts.css` self-hosts 4 font families (Geist Variable / Geist Mono / Inter / Taipei Sans TC Beta — 3 weights)
- [x] `--font-display / --font-ui / --font-body / --font-mono` stacks include CJK fallback to Taipei Sans TC Beta
- [x] All component CSS uses `var(--*)` only, no hard-coded hex — auto-flips per theme

## B. Components inventory

- [x] **18 components** in `ds-components/`:
  - From ztor: button / card / input / badge / navigation-menu / accordion / table / header / footer / cookie-banner
  - Added Phase 2: alert / avatar / checkbox / radio (+ radio-card) / eyebrow / separator / switch
- [x] [component-preview.html](component-preview.html) demos all 7 new components × all variants
- [x] [patterns-preview.html](patterns-preview.html) demos all R 1.0 patterns × light + dark

## C. Project-level patterns (dashboard.css)

- [x] dashboard.css 4154 lines: `:root` extensions + base resets + app shell + topbar + 30+ patterns
- [x] All R 1.0 tokens (--surface-canvas / --text-primary / --accent-yellow / --border-hairline / etc.) replaced with ztor equivalents
- [x] `grep -oE "var\(--[a-z-]+\)" dashboard.css | sort -u` returns only ztor-canonical tokens
- [x] No `--surface-canvas` / `--text-primary` / `--accent-yellow` / `--border-hairline` residuals

## D. Dark mode wiring

- [x] `theme.js` loaded BEFORE any CSS in `<head>` — no FOUC flash
- [x] `<html data-theme="light|dark">` set on init from `localStorage["ztor.theme.preference"]`
- [x] `<html data-theme-preference="light|dark|system">` records raw user choice
- [x] `prefers-color-scheme` change only re-applies when preference === "system"
- [x] URL `?theme=light|dark|system` works as one-time override (debug)
- [x] **Topbar sun/moon toggle button** on every page — cycles light → dark → system
- [x] **Settings → Appearance** 3 radio cards (Light / Dark / System) with `data-theme-set` + IIFE sync
- [x] `ztor:theme-changed` event broadcasts on every theme change so listeners stay in sync
- [x] `data-theme-set` click handler only `preventDefault`s on `<button>` / `<a>`, lets form controls behave naturally

## E. 14 product pages

- [x] All ported from R 1.0 via `_port_pages.py`:
  - [x] index.html (Dashboard · §5.1.1)
  - [x] projects.html (§5.1.2)
  - [x] create-project.html (§5.1.2 + 03.1)
  - [x] my-ip.html (§5.1.4)
  - [x] ip-market.html (§5.1.3)
  - [x] ip-detail.html (03.2)
  - [x] e-shop.html (§5.1.5)
  - [x] product-detail.html (03.4)
  - [x] create-product.html (§5.1.5 + 03.5)
  - [x] events.html (§5.1.6)
  - [x] create-event.html (§5.1.6 + 03.3)
  - [x] fans-crm.html (§5.1.7)
  - [x] earnings.html (§5.1.8)
  - [x] settings.html (§5.1.9)
- [x] Each page loads R 2.0 head template (theme.js + 18 ds-components + dashboard.css + fonts.css + icons.js + topbar.js + i18n.js)
- [x] Each page topbar has `[data-theme-toggle]` button injected

## F. Visual validation

- [x] **28 screenshots** captured in `screenshots/` (14 pages × 2 themes)
- [x] Spot-checked 9 pages (index / earnings / settings / projects / ip-market / events / create-project / fans-crm / create-event) — all render correctly in both themes
- [x] No dark-mode-specific override CSS needed — every pattern flips via tokens alone
- [x] Yellow primary CTA remains yellow in dark mode (paired across themes per ztor spec)
- [x] tinted alert backgrounds (`color-mix(in oklab, …)`) render correct hues in dark mode

## G. i18n coverage

- [x] Playwright EN-mode audit of all 14 pages
- [x] Result: **0 CJK leftovers on 12 pages**
- [x] earnings: 5 leftovers — all sample transaction strings (mixed ZH/EN by design, like real transaction memos: "Spotify 月度版稅" / "退款 #REF-0029" / "玉山銀行 ****-8821")
- [x] settings: 1 leftover — "中文 (繁體)" as a language option (intentionally shows native name)
- [x] No missing `data-i18n` keys

## H. Documentation

- [x] [BUILD-SPEC.md](BUILD-SPEC.md) — R 2.0 UI／前端實作快照，含 R 1.0 差異與 Phase progress
- [x] [UI-CHANGES.md](UI-CHANGES.md) — chronological change log, Phase 1 + 2 + 3 + 4 + 5 entries
- [x] [design-system.md](design-system.md) — ztor system 887-line reference (rename'd from "Ztor Yellow")
- [x] [FINAL-CHECKLIST.md](FINAL-CHECKLIST.md) — this file

## I. Infrastructure (light / dev)

- [x] `python3 -m http.server` works (verified port 8766 + 8767)
- [x] No external CDN dependencies (fonts / icons / scripts all self-hosted)
- [x] Synology Drive symlink hazards avoided — `ds-components/` is real folder, not symlink

---

## What's NOT in scope (yet)

- ❌ Vercel deployment — user has previously instructed "never deploy without explicit permission". Will deploy when requested.
- ❌ Cross-browser testing beyond Chromium (Playwright default)
- ❌ Performance audit (Lighthouse / CWV) — single-author prototype, not production yet
- ❌ Real-user user testing — that comes after deployment + invite list
- ❌ R 1.0 retirement — R 1.0 stays alongside R 2.0 as historical reference for now

---

## Phase progress · final state

| Phase | Status | Notes |
|---|---|---|
| 1 · Bootstrap | ✅ | R 2.0 folder + ztor copy + fonts + theme.js + icons.js / i18n.js / topbar.js + dashboard.css skeleton |
| 2 · Component library | ✅ | 7 new components (alert / avatar / checkbox / radio / eyebrow / separator / switch) |
| 3 · Patterns port | ✅ | 4154-line dashboard.css with ztor-tokenized patterns |
| 4 · 14 pages | ✅ | `_port_pages.py` automation; Settings Appearance theme cards wired |
| 5 · Validation + docs | ✅ | 28 screenshots + i18n audit + this checklist + updated SPEC/UI-CHANGES |

🎉 **R 2.0 v2.0.0-beta is feature-complete.**
