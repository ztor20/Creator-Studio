# Dark Notification Banner Design

## Scope

Unify the page-level notification banners in `e-shop.html` and `fans-crm.html`. Dashboard alert cards remain unchanged.

## Visual Design

- Near-black full-width container with a compact rounded rectangle shape.
- Status icon on the left, white title, and muted gray supporting text.
- Primary action appears as a green pill button on the right with an arrow.
- Dismiss control sits at the top-right corner.
- On narrow screens, the action moves below the copy and remains easy to tap.

## Behavior

- Keep each banner in the normal page flow.
- Preserve the existing localized title, supporting copy, and CTA.
- Both banners can be dismissed without affecting surrounding content.
- Use a dedicated `alert--banner` variant so Dashboard cards and compact row alerts do not change.

