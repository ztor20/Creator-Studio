# Brand logos — drop-in path

The brand picker renders a **typographic placeholder** (monogram + wordmark in
the brand's own colour), not the real mark.

## Why placeholders

Nike, Adidas, Zara, Starbucks and Nespresso are registered trademarks. Two
things follow:

1. **Generating them with an image model is the wrong tool.** A diffusion model
   asked for "the Nike logo" produces an *imitation* of a protected mark —
   subtly wrong proportions, wrong swoosh, wrong kerning. That is worse than a
   placeholder: it looks like the real thing at a glance and is incorrect on
   inspection, which is exactly the failure a prototype should not ship.
2. **There is no legitimate "4K logo" to find loose on the web.** Real brand
   assets are vector (SVG/EPS), not raster, and they live in each brand's
   official press or brand-asset kit under licence terms.

So the catalogue treats the logo as a first-class field with a defined path,
and ships a placeholder until a real asset is dropped in.

## How to add the real assets

1. Get each mark from the brand's official source — search
   `<brand> brand assets` / `<brand> press kit` / `<brand> newsroom`. These are
   the only places that carry a licensed, correctly-drawn file.
2. Save as **SVG** (preferred — resolution-independent, so "4K" stops being a
   question) or PNG at 512×512 minimum, transparent background.
3. Name it by the brand `id` used in `js/brand-store.js`:

   ```
   assets/brands/starbucks.svg
   assets/brands/nike.svg
   assets/brands/adidas.svg
   assets/brands/zara.svg
   assets/brands/nespresso.svg
   ```

4. Nothing else to change. `ds-components/brand-card.css` already reserves a
   square logo well, and the renderer falls back to the placeholder only when
   the file is missing.

## Licence note

Even with the correct file, using a third-party mark in a shipped product
normally requires permission from the trademark holder — in this product that
permission is precisely what the Ztor↔brand deal would grant. For an internal
prototype, placeholders keep the demo honest.
