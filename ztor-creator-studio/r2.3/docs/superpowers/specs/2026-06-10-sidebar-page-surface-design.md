# Sidebar Page Surface Design

## Scope

Update the R 2.1 Sidebar display mode only. Topbar mode keeps its current full-width page composition.

## Layout

- The viewport becomes a neutral gray App Shell canvas.
- The sidebar sits directly on that canvas and remains sticky.
- `.main` is the single white page surface for the active route.
- The page surface keeps a gray gap above it, begins immediately after the sidebar, and stays flush with the viewport on the right and bottom.
- Only the page surface's top-left corner is rounded.
- Header content, hero, page body, and footer all belong to the same page surface; sections must not create a second outer page card.

## Design System

- `--surface-shell`: subtle `#F5F5F5` outer App Shell canvas in light mode.
- `--surface-page`: opaque route page surface.
- `--radius-shell`: page-level corner radius.
- `--space-shell-gutter`: desktop gap above the page surface.
- Light and dark themes provide explicit values for both surfaces.

## Responsive Behavior

At widths up to 900px, Sidebar mode collapses to the existing top navigation row. The gray desktop canvas, page gap, and page corner are removed so the content uses the full mobile viewport.

## Verification

- Check Dashboard and Settings in Sidebar mode.
- Check light and dark themes.
- Check Topbar mode remains unchanged.
- Check a narrow viewport at or below 900px.
- Confirm the notification flyout still appears above the page surface.
