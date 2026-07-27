# Custom scrollbar — design spec

**Date:** 2026-07-27
**Status:** approved by L, implemented same day
**Scope:** r2.1 site-wide

---

## Problem

Every scrollable surface in r2.1 renders the OS default scrollbar. On the app shell this
is most visible as two chunky grey bars sitting side by side — one from `.app-sidebar`
(`overflow-y: auto`), one from `.main`. No custom scrollbar styling exists anywhere in the
codebase.

Measured surface count: ~20 scroll containers (drawer, combobox, picker, payout-modal body,
preview-panel, header dropdown, notifications panel, explainer, readiness popover, stock-tip,
scanner, fan-store screen, plus the shell) and the document itself.

Three surfaces already hide their scrollbars deliberately and must keep doing so — they are
horizontal swipe rails, not scroll regions the user is meant to drive:
`.fan-store__screen`, `.fan-store__fans-row`, `.list-toolbar > .tabs`.

## Decisions

### D1 — Native CSS, not a JS scrollbar library

`::-webkit-scrollbar` (Chromium / Edge / Safari) plus `scrollbar-width` and `scrollbar-color`
(Firefox).

Rejected: JS overlay libraries (OverlayScrollbars and similar). This is a static-HTML
prototype with no build step. A JS scrollbar would need initialising on ~20 containers plus
anything `components.js` injects at runtime, and it replaces native momentum scrolling,
keyboard paging, and screen-reader scroll behaviour with reimplementations.

**Accepted trade-off:** `::-webkit-scrollbar` reserves layout width; it is not a true overlay.
The design therefore holds the channel width constant and animates only colour, so hover
causes zero reflow.

### D2 — Quiet at rest, brightens on container hover

The thumb is always present but very low contrast; hovering the scrolling container brightens
it. Chosen over "invisible until hover" because the scroll affordance must survive — a user
needs to be able to tell that the notifications panel or a modal body scrolls without
hovering it first.

### D3 — Colour mixes with `transparent`, never with a surface token

    --scrollbar-thumb:       color-mix(in srgb, var(--foreground) 14%, transparent);
    --scrollbar-thumb-hover: color-mix(in srgb, var(--foreground) 32%, transparent);

Mixing against `transparent` (rather than `--card` or `--sidebar`) means one definition rides
the sidebar rail, a white modal, a dark card, or the solid-orange hero card without ever
baking a wrong surface colour into itself. It also removes the need for per-theme values —
`--foreground` already flips per theme.

This is the same principle applied to `.kpi__delta` earlier the same day, where mixing
against `--card` baked the dark card colour into the chip and produced a black blob on the
orange hero card.

### D4 — Track transparent, thumb inset by a transparent border

    channel     12px  (constant — the draggable hit target)
    thumb rest   6px  (border: 3px solid transparent + background-clip: padding-box)
    thumb hover  8px  (border-width drops to 2px)
    radius       --radius-pill

The thumb grows *inside* a fixed channel, so nothing reflows. The track draws nothing: the
bar reads as an object floating on the surface, consistent with a system that builds depth
from tonal layering rather than chrome. Pill radius matches the house silhouette.

### D5 — One global rule, not per-component

The rules live in `shared.css`, which all 43 pages already load (verified). Applying them
globally means every current *and future* scroll container inherits the treatment with no
per-component wiring — the "change once, everything syncs" property this codebase is built
on. The three hidden rails keep their existing `display: none` override, which naturally
wins.

Adding a new `ds-components/scrollbar.css` was rejected: component CSS is linked per-page,
so it would mean editing 47 HTML files for a rule that is not a component.

### D6 — Sidebar stops scrolling, via accordion

Measured at a 700px viewport: sidebar content is **848px** in a 700px shell — it overflows by
**148px** and needs an 848px-tall viewport to fit. 22 rows at 36px, 6px gaps, nav 582px,
actions 169px, brand 50px, padding 40px.

Cause: `IP Bank`, `E-Shop` and `Fans` are all expanded simultaneously (8 sub-rows).
`sidebar.js` hardcodes `const open = true` for every group (set 2026-06-13).

Fix: only the group containing the current page starts open, and opening a group closes its
siblings. Recovers ~336px — it fits at 700px with roughly 190px to spare.

Rejected alternative: compressing the vertical rhythm (rows 36→32px, gaps 6→4px) recovers
only ~150px, *just* fits at 700px and fails below it, and shrinks a 36px control height that
was deliberately set on 2026-07-21 to align with the sidebar search field.

### D7 — Safety valve on the nav area only

`overflow-y: auto` moves off `.app-sidebar` and onto `.app-sidebar__nav`; brand and the
actions cluster become `flex: none` and stay pinned.

Two reasons:

1. At 150% browser zoom or a ~600px window, 22 rows cannot fit in `100vh` under any
   compression. Without a valve those items become unreachable.
2. **This fixes an existing defect.** Today the overflow is on the whole sidebar, so at short
   heights the Account / Settings cluster scrolls out of reach. Pinning brand and actions
   fixes that independently of the accordion change.

With the accordion in place the valve does not trigger at normal viewport sizes, and when it
does trigger it renders the same quiet scrollbar as everything else.

## Changes

| File | Change |
|---|---|
| `ds-components/_tokens.css` | Add `--scrollbar-size`, `--scrollbar-thumb`, `--scrollbar-thumb-hover` (one definition; `--foreground` handles both themes) |
| `shared.css` | Global `::-webkit-scrollbar` rules; Firefox `scrollbar-width`/`-color` fallback behind `@supports`; re-preserve the three hidden rails |
| `shared.css` | `.app-sidebar` → `overflow: hidden`; `.app-sidebar > nav` gains `flex: 1 1 auto; min-height: 0; overflow-y: auto`; brand and actions `flex: none`; reset the nav rule inside the ≤900px media query |
| `js/sidebar.js` | `const open = true` → open only the group containing the active page |
| `js/sidebar.js` | Group toggle handler closes sibling nav groups when one opens |

## Implementation notes — two things the design got wrong

Both were caught by measuring rather than by reading the rendered result.

### The flexible element is an unclassed `<nav>`, not `.app-sidebar__nav`

`sidebar.js` emits `.app-sidebar > a.brand / button.burger / nav / div.actions`, with
`ul.app-sidebar__nav` *inside* the `<nav>`. The `<nav>` is the actual flex item.

Putting `flex: 1 1 auto; min-height: 0; overflow-y: auto` on the `<ul>` does nothing for the
sidebar's layout — the `<ul>`'s flex is resolved against the `<nav>`, while the `<nav>` itself
keeps `min-height: auto` and refuses to shrink. Measured symptom: at a 560px viewport the
sidebar still overflowed by 12px and the `<ul>` never shrank (`clientHeight === scrollHeight`
in every case). Because `.app-sidebar` is now `overflow: hidden`, that 12px was being
*clipped* rather than scrolled — strictly worse than the original bug.

Fix: the rule belongs on `.app-sidebar > nav`.

### `scrollbar-width: thin` silently disables `::-webkit-scrollbar` in Chromium

Chrome 121+ supports `scrollbar-width`. When it is specified, Chromium ignores the whole
`::-webkit-scrollbar-*` family and draws its own thin scrollbar. Setting both — intending
webkit for Chromium and `scrollbar-width` for Firefox — means Firefox's fallback silently
wins everywhere and the designed treatment never renders.

Measured symptom: the reserved scrollbar gutter came out **10px** (Chromium's "thin") instead
of the specified 12px, and the pill radius and inset were absent.

Fix: gate the Firefox properties behind `@supports not selector(::-webkit-scrollbar)`.
Firefox does not support that selector, so it takes the fallback; Chromium and Safari skip it
and use the full `::-webkit` rules.

## Out of scope

- The three intentionally hidden swipe rails keep `display: none`.
- Horizontal scrollbars get the same treatment via `height: 12px` but no separate design.
- No audit of other components for the tint-against-a-hardcoded-surface pattern; that is a
  separate pass.

## Verification — results

| Check | Result |
|---|---|
| Sidebar clipped/overflowing at 700px | **0px** |
| Sidebar clipped/overflowing at 560px | **0px** |
| Nav valve engaged at 700px | **no** (fits without scrolling) |
| Nav valve engaged at 560px | yes — by design |
| Actions cluster reachable at 560px, all groups forced open | **yes** (bottom 540 ≤ 560) |
| Scrollbar gutter width | **12px** (matches spec; was 10px before the `@supports` fix) |
| `.list-toolbar > .tabs` hidden rail | still hidden, reserves **0px** |
| Accordion on `e-shop.html` | E-Shop open (current page), IP Bank + Fans collapsed |
| Both themes | dark `#FDFDFD @ 14%`, light `#1A1A1A @ 14%` — screenshot proof captured |

Verified in Chromium. Firefox takes the `@supports` fallback path and was not visually
verified in this session — it renders a thin scrollbar in the same two colours, without the
pill radius or the 6→8px hover growth.
