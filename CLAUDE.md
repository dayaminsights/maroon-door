# Maroon Door — Website Revamp

Redesign of the live site at https://www.themaroondoor.ae/ for Maroon Door LLC, a
premium catering / meal-plan delivery brand operating across the UAE (Dubai-based,
delivers to all 7 emirates). Founders: Simak & Nazia (brother-sister).

The live site is an unmodified Framer restaurant template — image alt text still
reads "Pizza Margheritta" and "Chef Marco Di Luca", floating pizza-topping icons on
a South Asian/Emirati menu. That mismatch is the whole reason this redesign exists.

**Read `STATUS.md` first** for what's done and what's next — it's the source of
truth for project state, this file is stable background.

## Other docs
- `STATUS.md` — current progress, open questions, next steps. Update this as work happens.
- `ARCHITECTURE.md` — how the build pipeline works, folder layout, how to regenerate `index.html`.
- `BRAND.md` — design tokens (color/type), voice, and the real content facts (offerings, menu, hours, contact) pulled from the live site.
- `assets/PHOTO_CREDITS.md` — attribution for the stock photography currently in use (placeholders — see Status).

## Chosen direction
Three homepage concepts were pitched (Heritage / Minimal / Editorial). User picked
**Heritage Threshold**: oxblood/gold/ivory palette, Fraunces (display) + Manrope
(body), the brand name taken literally — an arched two-leaf door is the running
motif (hero backdrop, page-load open animation, decorative marks throughout).

## Working conventions
- The whole site is one self-contained `index.html` — fonts and photos are base64-inlined,
  no external requests. This started as a Claude Artifact (which forbids external
  resource loads) and the convention carried over. See `ARCHITECTURE.md` for the
  tradeoff and when to break the site into separate files.
- To rebuild `index.html` after editing anything under `build/` or `assets/`:
  `node build/build.js` (run from repo root).
- Never hand-edit `index.html` directly — it's generated. Edit `build/template.html`
  (markup/CSS/JS) and re-run the build.
- No git repo existed before this session; one was initialized but nothing has been
  committed yet — commits happen only when the user asks.
