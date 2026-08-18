# Hero re-layout to the supplied mockup — design

Date: 2026-08-16
File touched: `experiment.html` (hand-edited, no build step — see `STATUS.md` 2026-08-15 pivot)

## Goal

Re-lay out the `#top` hero (`.bowl-story`) to match the mockup the user supplied:
copy left on open sand, the bowl large and bleeding off the right edge, a circular
seal over the bowl, floating garnish, and a four-cell trust rail at the foot of the
first viewport.

The 91-frame scroll-scrubbed bowl animation **stays** and becomes the hero artwork.
The mockup is frame 091 of the animation the project already owns; nothing new is
sourced or rendered.

## What already matches, and therefore is not touched

- **Header** — `position:fixed`, `--chrome` maroon, nav-left / logo-centre /
  WhatsApp-right (`experiment.html:211-238`). Identical to the mockup already.
- **Copy** — eyebrow, `h1`, rule, body paragraph and the three feature items are
  already word-for-word what the mockup shows (`experiment.html:693-717`).
- **Scrub machinery** — frame loader, manual cover-crop draw, the single passive
  scroll listener feeding one rAF tick, and the `<=760px` static-image fallback
  (`experiment.html:1217-1275`).
- **Buttons** — `.btn--maroon`, `.btn--ghost`, `.btn--wa` (`experiment.html:184-195`).

This is a re-layout of `.bowl-pin-stage`, not a rebuild.

## Core idea: the garnish is the mechanism

The mockup depicts the **end** of the scrub. At scroll 0 the bowl is empty
(`frame_001`), so a literal static copy of the mockup is not reachable on first
paint. Rather than reverse the animation or drop it, the floating garnish carries
the difference:

| scrub progress | bowl | garnish |
|---|---|---|
| 0% | empty | scattered around the bowl at rest, full opacity |
| ~50% | half built | drifting inward, fading |
| 100% | full (the mockup) | gone — it is in the bowl |

Ingredients orbit the empty bowl, drift toward it and fade out as the bowl fills.
The hero at load is therefore not a bare empty bowl; it is an empty bowl ringed by
the ingredients about to go into it. The ornament encodes the mechanism instead of
decorating it, and the mockup's exact composition is what the user arrives at when
the scrub completes.

## Layout

```
┌──────────────────────────────────────────────────────────┐
│ HEADER  nav          [logo]         [Order on WhatsApp]  │  fixed, unchanged
├──────────────────────────────────────────────────────────┤
│                                          ╭─────╮         │
│ 🎩 COOKED IN DUBAI                       │ ◉  │ seal     │  sticky stage,
│                                          ╰─────╯         │  pinned for the
│ Meal plans and                    ,·  ╭─────────────     │  scrub runway
│ catering,                        ·   ╱               ╲   │
│ delivered across                    │    C A N V A S  │  │  bleeds off right
│ the UAE.                        ·   │   (91 frames)   │  │  and under header
│ ──                                   ╲               ╱   │
│ Meal plans designed by…               ╰─────────────     │
│                                     ·                    │
│ [Order on WhatsApp] [See Dadi's menu →]                  │
│                                                          │
│ ⌂ CHEF-PREPARED   ⌾ NUTRITION-…   ⛟ ALL SEVEN EMIRATES   │
├──────────────────────────────────────────────────────────┤
│ ▤ WEEKLY PLANS │ ▥ CORPORATE │ ♔ ROYAL │ ⌾ @themaroondoor│  trust rail,
└──────────────────────────────────────────────────────────┘  inside the pin
```

### Grid

`.bowl-pin-stage` gains a second row:

- `grid-template-columns: minmax(300px, var(--intro-w)) 1fr` (unchanged, and
  `--intro-w: min(44vw, 600px)` is unchanged with it — the mockup's copy column
  measures within a couple of percent of what this already produces)
- `grid-template-rows: 1fr auto` (new)
- `.bowl-intro` → `1 / 1 / 2 / 2`
- `.bowl-media` → `1 / 1 / 2 / 3`, `justify-self:end` (unchanged)
- `.bowl-garnish` → `1 / 1 / 2 / 3`, `position:relative`, `pointer-events:none` (new)
- `.hero-rail` → `2 / 1 / 3 / 3` (new)

Stacking order within the stage: `.bowl-media` `z-index:1`, `.bowl-garnish`
`z-index:2`, `.bowl-intro` `z-index:3`. Garnish therefore floats above the canvas
but can never occlude the headline or the CTAs.

The trust rail sits **inside** the sticky stage, not after it. That is what keeps it
in the first viewport as the mockup shows, and it releases with the pin.

### Heights

The pin runway is currently a hand-derived formula (`experiment.html:259`) that
assumes today's stage height. Adding the rail invalidates it. Re-derive rather than
adjust by eye:

```
--rail-h : clamp(64px, 7vh, 92px)
--bowl-h : min(calc(92vh - var(--header-h) - var(--rail-h)), 760px)
--stage-h: calc(var(--bowl-h) + var(--rail-h))

.bowl-pin-stage { min-height: var(--stage-h); top: var(--header-h) }
.bowl-pin-wrap  { min-height: calc(var(--stage-h) + 40vh + max(130vh, 950px)) }
```

Header + bowl + rail then total ~92vh, so the whole composition fits a 720px-tall
laptop viewport — the size the mockup itself was captured at.

### The copy card is deleted

`.bowl-intro`'s panel treatment — `background`, `-webkit-backdrop-filter`,
`backdrop-filter`, `border`, `box-shadow`, `padding` (`experiment.html:278-283`) —
is removed. The copy sits directly on the hero background. That panel is what makes
the current hero read as a component placed on a page; the mockup has no card.

Deleting it also retires the deliberately-notched headline size and its comment at
`experiment.html:285-288`. The constraint that comment describes ("this headline
lives inside a fixed card") ceases to exist, so `.bowl-intro__headline` moves to the
page-level `--t-3xl`.

## Colour

Sampled from `assets/frames_hq/optimized/frame_091.jpg` with `System.Drawing`:

| sample point | hex |
|---|---|
| (8, 8) | `#F2E9DA` |
| (960, 6) | `#F3E9DF` |
| (200, 1000) | `#F3EADB` |
| (1910, 8) | `#EFDFD0` (frame's own right-edge vignette) |

The frames' backdrop is a sand cream. The site's `--ivory` is `#F2E7E2`, a rose
parchment. That mismatch is the entire reason `.bowl-media` currently carries a
four-gradient `mask-image` stack (`experiment.html:272-273`) — it is hiding a seam
between the photo's cream and the page's cream.

Introduce one new token, measured rather than invented, the same way `BRAND.md`
sampled the maroon off the real logo:

```
--hero-sand: #F2E9DA;   /* scoped to .bowl-story, not :root */
```

With the hero background and the frame backdrop identical, the mask collapses from
four gradients to a single left-edge feather (the only edge that still needs to
dissolve, because the copy sits there). The rest of the page keeps `--ivory`; the
hero→`#what-we-serve` boundary gets a short vertical gradient from `--hero-sand` to
`--ivory` so the change of ground is not a hard line.

`--hero-sand` is scoped to `.bowl-story`. It is not a new global surface colour and
must not be used elsewhere.

## Garnish

**Source:** crops from `frame_091.jpg` only — no new photography, no external assets.

Four bits, chosen because each is approximately circular in the source frame and
therefore cuts cleanly with `clip-path: circle(50%)` on a square crop — no alpha
channel, and no halo of neighbouring pixels. Coordinates below were confirmed
visually against `frame_091.jpg` (1920×1088) over three refinement passes:

| asset | ffmpeg crop |
|---|---|
| `garnish_tomato_a.jpg` | `crop=210:210:1145:185` |
| `garnish_tomato_b.jpg` | `crop=170:170:800:215` |
| `garnish_cucumber.jpg` | `crop=170:170:1275:480` |
| `garnish_seeds.jpg` | `crop=160:160:770:345` |

All exported `scale=200:200 -q:v 3` into `assets/photos/optimized/`, roughly 2× the
largest size they render at. `clip-path: circle(50%)` plus a small `drop-shadow` so
they read as floating above the sand.

Explicitly rejected: **broccoli floret** — no crop centres on it without a tomato
intruding at the frame edge, which would show inside the circle. **Avocado slice**
and **lettuce leaf** — neither is circular, both would need a real alpha cutout, and
neither earns that work. Four ornaments is also one fewer than the mockup implies,
consistent with cutting the blurred edge leaves below.

**Placement.** Rest positions are chosen in the open sand between the copy column
and the bowl, and in the sand above and below the bowl — never over the headline,
body copy or CTAs, which the `z-index` order already guarantees but which the
positions should not rely on.

**Motion.** The existing rAF tick writes one custom property, `--bowl-p` (0→1
scrub progress), onto `.bowl-pin-stage`. All four bits derive their transform and
opacity from it in CSS — no per-bit JavaScript, no second scroll listener. Each bit
carries as inline custom properties its own `--gx` / `--gy` rest position (px,
relative to the garnish layer's top-left), `--gdx` / `--gdy` drift vector (px, each
pointing at the bowl's centre from that bit's rest position) and `--gr` end rotation
(deg).

Every read of the progress property must be written `var(--bowl-p, 0)`. The rAF tick
does not run before the first scroll event, and it returns early below 760px
(`experiment.html:1264`), so an unguarded `var(--bowl-p)` makes the whole transform
and opacity declaration invalid at load.

Opacity falls to zero at roughly 74% progress
(`clamp(0, 1 - var(--bowl-p, 0) * 1.35, 1)`), so the garnish is gone before the
bowl is visibly full.

## Seal

Circular badge over the top-right of the bowl: an SVG `<circle>` with a `<textPath>`
ring and the existing `.doormark` glyph at centre. Slow continuous rotation
(`24s linear infinite`).

Sized `clamp(96px, 9vw, 132px)`, absolutely positioned inside `.bowl-media` so it
travels with the bowl rather than with the stage, and `aria-hidden` — the ring text
duplicates the eyebrow and the feature list, so it is decoration to a screen reader.

Ring text: **MAROON DOOR · DUBAI · ALL SEVEN EMIRATES**

This deviates from the mockup, which shows a leaf glyph and the words "FRESH
INGREDIENTS · HONEST FOOD". Two reasons: the leaf-and-wheat organic seal is the
stock device on every food site and spends the one free axis in this brief on a
default, whereas the brand owns a door mark that nothing else on the page uses at
this size; and "fresh" is on `STATUS.md`'s list of unverified operational claims.

## Trust rail

Four cells, maroon stroke icons at the weight of the existing `.bowl-intro__icon`:

| icon | label | value |
|---|---|---|
| calendar | WEEKLY PLANS | Flexible & convenient |
| building | CORPORATE CATERING | Offices & film sets |
| crown | ROYAL CATERING | Celebrations & events |
| Instagram glyph | FOLLOW | @themaroondoor.ae |

The first three cells link to `#what-we-serve`; the fourth is an external link to
`https://www.instagram.com/themaroondoor.ae/` with `target="_blank" rel="noopener"`,
matching how every other outbound link in this file is written. The handle comes
from `BRAND.md`; the URL is derived from it and is the one thing here that has not
been seen on the live site.

The fourth cell replaces the mockup's five stars and "Trusted by 1000+ customers
across the UAE", per the user's decision to carry a verifiable line instead. The
handle is a real, checkable fact from `BRAND.md` and it is a live conversion path;
"all seven emirates" was rejected for this slot because it already appears two rows
above in the feature list.

Below 760px the rail becomes a 2×2 grid.

## Copy changes against the mockup

| mockup | shipped | reason |
|---|---|---|
| "Explore the menu →" | "See Dadi's menu →" (current) | The destination section is headed *Dadi's Menu*. A control keeps its name through the flow. |
| "Delivered fresh across the UAE" | "Delivered from Dubai." (current) | "Fresh" is an unverified operational claim per `STATUS.md`. |
| ⭐⭐⭐⭐⭐ "Trusted by 1000+ customers" | `@themaroondoor.ae` | User decision — verifiable line. |
| "FRESH INGREDIENTS · HONEST FOOD" | "MAROON DOOR · DUBAI · ALL SEVEN EMIRATES" | See Seal, above. |

New copy introduced by this pass: the three trust-rail values ("Flexible &
convenient", "Offices & film sets", "Celebrations & events"). All three restate
offerings already described in `BRAND.md`; no new facts, figures or claims.

The eyebrow gains a small chef's-hat glyph before "COOKED IN DUBAI", reusing the
existing feature-one SVG path byte-for-byte rather than drawing a second hat.

## Cut from the mockup

The mockup shows heavily blurred green leaves bleeding in at the far left and far
right edges — a depth-of-field foreground from the render.

These are dropped. Three ornaments (garnish, seal, edge leaves) around a single
signature interaction is one too many, and two absolutely-positioned blurred images
hanging off both viewport edges is a horizontal-overflow defect waiting at every
breakpoint — the most-repeated bug class in this file's history per `STATUS.md`.

## Deletions

> Every line number in this document is a snapshot taken 2026-08-16 and shifted by
> ~16 lines once during the session it was written, apparently from a formatting
> hook. Locate each target by its class name or its own unique text, never by
> position, and confirm before editing. Anchoring on something that is not unique
> to the target is the single most repeated defect in this file's history — see the
> `indexOf` splice that silently deleted an entire card (`STATUS.md`, 2026-08-16).

The teaser gate goes, so the headline is in the DOM and painted at load instead of
sitting behind an interstitial. Four things are coupled to it and must be removed
together:

1. `.bowl-teaser` markup — `experiment.html:683-691`
2. `.bowl-teaser*` CSS — `experiment.html:318-331`
3. The teaser→headline JS block — `experiment.html:1038-1053`
4. `@keyframes cue-bob` — `experiment.html:178`, whose only consumer is
   `.bowl-teaser__cue svg` at `experiment.html:328`

And one consequence: the `.reveal` observer's filter
`return !el.closest('.bowl-intro')` (`experiment.html:1021-1023`) exists solely
because the teaser had to be seen before the hero copy revealed. With the teaser
gone the filter is deleted and `.bowl-intro`'s `.reveal` items join the normal
observer, which fires them immediately since they are in view at load. The existing
`--i` stagger still produces the sequenced entrance.

`bowlOutro` / `.outro-cta` (`experiment.html:1209`, `1274`) is a different feature —
the "Build my meal plan" CTA below the gallery, cued at 0.93 scrub progress. It is
not touched.

## Responsive

- **`>760px`** — as drawn above, scrub live, pin active.
- **`<=760px`** — the scrub JS already returns early (`experiment.html:1264`) and
  the static `frame_091` image shows. The pin is already disabled at this width
  (`experiment.html:388-391`). Stage stacks to one column: copy, then bowl in a
  4/3 box, then the rail as 2×2. Garnish and seal are hidden — at that scale they
  crowd the bowl and add overflow risk for no benefit.
- **`<=560px`** — the existing stacked-feature layout (`experiment.html:308-316`)
  is unchanged.

## Reduced motion

- Garnish: rendered at rest position, fixed opacity, no drift.
- Seal: no rotation.
- `.reveal`: already handled globally (`experiment.html:161`).
- The scrub itself is scroll-position-driven rather than time-driven and is left as
  it is, consistent with how this file already treats it.

## Verification

Per this file's established practice — screenshot, never assume. Chrome at
`C:\Program Files\Google\Chrome\Application\chrome.exe`, `ffmpeg` and `node` all
confirmed present.

1. Tag balance across the edited section before rendering anything.
2. `document.documentElement.scrollWidth - clientWidth === 0` at **360, 390, 768,
   1024, 1440, 1800**. Non-negotiable: the bowl bleeds off the right edge and the
   garnish is absolutely positioned, which is exactly the configuration that has
   leaked horizontal scroll in this file before.
3. Narrow widths (360, 390) verified over the DevTools Protocol
   (`Emulation.setDeviceMetricsOverride`), **not** `--window-size` — the CLI path
   cannot render below ~485px on Windows and silently saves a cropped PNG at the
   width requested, which reads as an overflow bug that is not there
   (`STATUS.md`, verification tooling note).
4. Scrub sampled at progress 0 / 0.5 / 1.0 to confirm the bowl fills, the garnish
   fades out before the bowl is full, and progress 1.0 actually resembles the
   mockup.
5. Pin release point checked against the re-derived runway: the stage must stay
   pinned for the whole scrub and release cleanly into `#what-we-serve`, with the
   trust rail travelling with it.
6. Seam check at the hero→`#what-we-serve` boundary and along the canvas's left
   feather, at 1440 and 1800.
7. `getComputedStyle` on `.bowl-intro__headline` to confirm the card-removal did
   not leave a stale specificity winner. Specificity collisions between
   `.bowl-*` selectors are this file's second-most-repeated defect.
8. Keyboard focus visible on both hero CTAs and all four rail cells.

## Out of scope

Everything below `.bowl-below` — the meal-plan gallery, `#what-we-serve`, `#menu`,
`#coverage`, `#about`, the footer. The open content items in `STATUS.md` (calorie
figures, policy pages, `og:image`, the "nutrition experts" attribution) are not
addressed here and remain open.

## Open items created by this pass

1. The trust rail's Instagram cell assumes `@themaroondoor.ae` is current. It is
   from `BRAND.md`, which was pulled from the live site — worth a glance before
   launch.
2. Garnish crops are derived from a rendered frame, not from Maroon Door's own
   food photography. If real photography arrives, the five bits are a
   five-file swap with no markup change.
