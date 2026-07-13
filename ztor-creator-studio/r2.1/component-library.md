# Ztor Creator Studio · Component Library Index

> **⚠️ DEPRECATED（2026-07-12 起凍結）**：本檔 2026-07-12 起凍結不再維護（清單已 drift：只列約 30 支、實況 68 支）。元件清單以機器生成的 [`ds-index.md`](./ds-index.md) 為準；元件規格以 [`design-system.md`](./design-system.md) Pillar 4 為準。本檔僅留歷史脈絡。

Quick index of the project component library. The **shipping library** is the set of CSS files in [`ds-components/`](./ds-components/); the **authoritative spec** for each unit (anatomy, states, tokens) lives in [`design-system.md`](./design-system.md) Pillar 4 · Component. This file is the at-a-glance map between them.

> Source of truth: `design-system.md` Pillar 4. Do not duplicate spec detail here — add it there and link.

## Tokens & base

| File | Role |
|---|---|
| [`ds-components/_tokens.css`](./ds-components/_tokens.css) | Pillar 1 Foundation + Pillar 2 Role + Pillar 3 Mode (`[data-theme="dark"]`) — the single token layer every component references |
| [`ds-components/fonts.css`](./ds-components/fonts.css) | self-hosted Geist / Inter / Noto Sans TC (subset) + CJK fallback chain |

## Components

Layer: 🟢 atom · 🟡 molecule · 🟠 organism. Spec = `design-system.md` Pillar 4 section.

| Component | Layer | CSS | Spec |
|---|---|---|---|
| Button | 🟢 | [button.css](./ds-components/button.css) | §4.2 |
| Badge / Status pill | 🟢 | [badge.css](./ds-components/badge.css) | §4.3 |
| Status dot | 🟢 | [badge.css](./ds-components/badge.css) | §4.4 |
| Chip | 🟢 | [chip.css](./ds-components/chip.css) | §4.5 |
| Switch | 🟢 | [switch.css](./ds-components/switch.css) | §4.6 |
| Sticky-note | 🟢 | [stickynote.css](./ds-components/stickynote.css) | §4.7 |
| Input | 🟢 | [input.css](./ds-components/input.css) | §4.8 |
| Icon | 🟢 | [icon.css](./ds-components/icon.css) · [icons.js](./icons.js) | §4.9 |
| NavigationMenu | 🟡 | [header.css](./ds-components/header.css) | §4.10 |
| Card | 🟡 | [card.css](./ds-components/card.css) | §4.11 |
| KPI | 🟡 | [kpi.css](./ds-components/kpi.css) | §4.12 |
| Alert | 🟡 | [alert.css](./ds-components/alert.css) | §4.13 |
| Accordion | 🟡 | [accordion.css](./ds-components/accordion.css) | §4.14 |
| Tabs | 🟡 | [tabs.css](./ds-components/tabs.css) | §4.15 |
| Cookie banner | 🟡 | [cookie-banner.css](./ds-components/cookie-banner.css) | §4.16 |
| Empty stub | 🟡 | [empty-stub.css](./ds-components/empty-stub.css) | §4.17 |
| Selection card | 🟡 | [selection-card.css](./ds-components/selection-card.css) | §4.18 |
| Composer | 🟡 | [composer.css](./ds-components/composer.css) | §4.19 |
| Header (app topbar) | 🟠 | [header.css](./ds-components/header.css) | §4.20 |
| Footer | 🟠 | [footer.css](./ds-components/footer.css) | §4.21 |
| Data list | 🟠 | [data-list.css](./ds-components/data-list.css) | §4.22 |
| Product list | 🟠 | [product-list.css](./ds-components/product-list.css) | §4.27 |
| Project list | 🟠 | [project-list.css](./ds-components/project-list.css) | §4.28 |
| Table | 🟠 | [table.css](./ds-components/table.css) | §4.23 |
| Chart | 🟠 | [chart.css](./ds-components/chart.css) | §4.24 |
| Earnings waterfall | 🟡 | [waterfall.css](./ds-components/waterfall.css) | §4.24b（spec 5.1.8 F12 · earnings Overview） |
| Bento grid | 🟠 | [bento.css](./ds-components/bento.css) | §4.25 |
| Dropdown menu | 🟡 | [dropdown-menu.css](./ds-components/dropdown-menu.css) | §4.26 |

## Project-owned components

These are real, reused product components that still live in [`shared.css`](./shared.css) or inside an existing DS CSS file. They are part of R 2.1's component graph even before they are split into one-file-per-component CSS.

| Component | Layer | CSS / owner | Spec |
|---|---|---|---|
| App shell | 🟠 | [shared.css](./shared.css) | §4.1 Inventory |
| Global nav · sidebar mode (`.app-sidebar__*`) | 🟠 | [shared.css](./shared.css) + [sidebar.js](./sidebar.js) + [theme.js](./theme.js) | SPEC §5.2a · spec §6.9 |
| Page intro | 🟡 | [page-intro.css](./ds-components/page-intro.css) | §4.1 Inventory |
| Field system | 🟡 | [field-system.css](./ds-components/field-system.css) + [input.css](./ds-components/input.css) | §4.1 Inventory |
| Filter row | 🟡 | [shared.css](./shared.css) | §4.1 Inventory |
| Segmented control | 🟡 | [chart.css](./ds-components/chart.css) | §4.1 Inventory |
| Stepper | 🟡 | [shared.css](./shared.css) | §4.1 Inventory |
| Wizard frame | 🟠 | [shared.css](./shared.css) | §4.1 Inventory |
| Settings nav | 🟡 | [settings.css](./ds-components/settings.css) | §4.1 Inventory |
| Settings row | 🟡 | [settings.css](./ds-components/settings.css) | §4.1 Inventory |
| Hero slideshow | 🟠 | [shared.css](./shared.css) + [hero.js](./hero.js) | §4.1 Inventory |
| IP hero | 🟠 | [shared.css](./shared.css) | §4.1 Inventory |
| Rental card | 🟡 | [shared.css](./shared.css) | §4.1 Inventory |
| Meta cell | 🟢 | [shared.css](./shared.css) | §4.1 Inventory |
| Chart card | 🟠 | [chart.css](./ds-components/chart.css) | §4.1 Inventory |
| Rank bars / source breakdown | 🟡 | [chart.css](./ds-components/chart.css) | §4.1 Inventory |
| View switch (list/card) | 🟢 | [shared.css](./shared.css) | §4.45（spec 5.1.2 F1） |
| Tooltip (incomplete hint) | 🟢 | [shared.css](./shared.css) | §4.46（spec 5.1.2 F1） |
| Project card / grid / bar | 🟡 | [shared.css](./shared.css) | §4.47（spec 5.1.2 F1） |
| Payout bank picker / request modal | 🟠 | [payout-modal.css](./ds-components/payout-modal.css) · [partials/payout-request-modal.js](./partials/payout-request-modal.js) | §4.29（spec 5.1.8 §F8 · earnings 專用 · 單一 consumer） |

## Runtime-injected content blocks ([components.js](./components.js))

Composite blocks rendered from one shared JS renderer + a named dataset, the same way [sidebar.js](./sidebar.js) injects the topbar. A page drops a `<div data-component="NAME" data-key="...">` placeholder; on load it is filled, then `ztorIcons.applyIcons` + `applyI18n` re-run on the new nodes. This is how a block becomes a real **change-once, every-page-syncs** component in a static prototype with no build step — editing the renderer or dataset updates every page that mounts it. Each block composes the CSS atoms/molecules above (data-list, kpi, alert, badge, card, stickynote, insight-split).

| Block (`data-component`) | Used by | Composes | Notes |
|---|---|---|---|
| `transaction-list` | **index.html F3 + earnings.html Overview** | data-list · badge | **Cross-page shared** — one renderer guarantees Dashboard & Earnings row format never drift. Each page passes its own rows (Dashboard income-only per spec 5.1.1 §F3; Earnings full ledger incl. payout). |
| `ops-summary` (F2) | index.html | kpi | 3 operations tiles (total revenue cited from Earnings · pending-actions count · active-projects count). |
| `alerts` (F4) | index.html | alert | Today's actions — severity · object · status · CTA. |
| `activity-list` (F5) | index.html | data-list · badge | Recent activity — type · source · time · result status. |
| `events-projects` (F6) | index.html | data-list · badge | Recent events & projects — source-aware per-row entry (event → events.html, project → projects.html). |
| `insight-split` (F7) | index.html | insight-split · kpi · stickynote | Fan relations (Fans CRM) ｜ audience trends (Audience Intelligence). |
| `ext-data-status` (F8) | index.html | data-list · badge | External data status — source · type · last sync · status · impact; CTAs route to Settings only. |

Datasets live in `components.js` (`DATA` / shared `TX` row library). To change a block's content, edit its dataset; to change its format, edit its renderer — both propagate to every mounting page.

## Rules (from `project-component-library-lifecycle.md`)

- Pages consume the library, never one-off visual rules. A reusable pattern is promoted to a component first, then pages sync.
- Every CSS file is token-driven (`var(--…)`); no hardcoded color / spacing / radius / shadow / timing. Dark mode is handled centrally in `_tokens.css`.
- If a token changes, sync every component and page using it. Keep class names stable; rename in one pass across all usages.

## Preview

[`design-system.html`](./design-system.html) is the visualization of this library (token swatches + component states). It mirrors `design-system.md`; when the two diverge, `design-system.md` wins.
