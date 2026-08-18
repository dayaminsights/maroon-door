# Status

Last updated: 2026-08-18

## Where things stand

**2026-08-18, `#story` trust photo swapped again — user-supplied stock photo
of two chefs.** User dropped `assets/duo image.png` (1672×941, generic stock
photography — two models in chef whites, arms crossed, smiling, in a
commercial kitchen) and asked for it as the section background. Optimized to
`assets/photos/optimized/duo_founders.jpg` (`ffmpeg scale=1600:-2 -q:v 3`,
1.74MB PNG → 126KB JPG) and spliced in over the strawberries-hands photo from
the previous two passes; `object-position:80% 50%` (already right-biased from
the left-alignment flip) needed no change since these two subjects also stand
right-of-center in frame. Caption changed from the produce-specific "Still
hand-picked..." to "Every order still gets the same care it did on day one."
No `PHOTO_CREDITS.md` entry — that file tracks Wikimedia/CC attribution
obligations only, not user-supplied assets (same as `meal plans category.png`
and `raw uae map.png` before it).

**Flagging, not blocking**: this photo sits directly under a heading reading
"Simak and Nazia opened it." with no caption disclaiming it, so a visitor has
no way to know these are stock models, not the real founders. This is the
exact pattern `CLAUDE.md` opens with as the whole reason this redesign
exists — the live site's unmodified Framer template still captions a stock
photo "Chef Marco Di Luca." The last two photo passes on this section went
out of their way to stay hands-only/anonymous specifically to avoid this (see
the two entries above and `PHOTO_CREDITS.md`'s honesty notes). Implemented as
asked since the user supplied the file directly and this whole section is
already flagged placeholder-pending-real-content, but this one — unlike the
others — should not go live as-is without either a real photo of Simak &
Nazia or a caption that doesn't imply this pair is them.

**2026-08-18, "Three ways to order" heading moved off the photo in `#what-we-
serve` (`experiment.html`)** — the eyebrow + h2 ("For your week, your office,
and your celebrations.") previously sat inside `.serve-photo__caption`,
overlaid on the swappable dish photo with a dark scrim behind it for
legibility. User flagged it should read as a normal section header above the
photo instead, matching the `.sechead` pattern every other section on the page
already uses (see `#menu`'s `<div class="wrap"><div class="sechead reveal">`).

**Structure**: `<div class="why-inner wrap">` (one combined div) split into
`<div class="wrap"><div class="sechead reveal">…eyebrow+h2…</div><div
class="why-inner">` — `.why-inner` was already an unstyled/dead class (zero
CSS rules matched it before this change), so nesting it one level deeper cost
nothing. `.serve-photo__caption` and `.serve-photo__scrim` markup and CSS
deleted outright rather than left dark/empty: the scrim's own code comment
said its extra-dark gradient existed specifically "because the heading runs
two or three lines deep into the photo" — with the heading gone, the reason
for the scrim is gone too, and the project's established rule elsewhere on
this page is photos shown true to colour, not filtered. `.serve-photo`'s own
sizing/overflow rules and the hover-swap JS (`.serve-photo`/`.photo-frame[data-
photo]` selectors) were untouched — the three photo-frame images and the
card-hover swap behaviour still work exactly as before.

**Verified**: manually re-counted div/section open/close tags across the
edited region (8 opens, 8 closes, balanced) since `build/verify/tags.js`
couldn't be run this pass — the sandboxed shell's safety classifier was
reporting itself overloaded for both Bash and PowerShell for the whole
session. **Not yet screenshot-verified** — re-run `node build/verify/tags.js
experiment.html '<section id="what-we-serve"' '<section class="menu-section"'`
and a screenshot at mobile+desktop widths next session before trusting this
further. **Also note**: this file and `experiment.html` were observed changing
on disk mid-session from outside this conversation (STATUS.md's own top entry
changed between two reads a few minutes apart) — another process/session may
be writing to this repo concurrently; worth checking before assuming this is
the only agent touching these files.

**2026-08-17, `#story` overlay flipped from right/46%/right-aligned to
left/50%/left-aligned** — user asked for the text box to cover 50% of the
photo horizontally with left alignment. Flipped every side-dependent value
together rather than just the box, since a left-aligned box with the old
right-heavy scrim and left-shifted photo subject would've put light text over
the busiest/brightest part of the image: `.story-head` `margin-left:auto` →
`margin-right:auto`, `max-width:min(46%,460px)` → `width:50%`, `text-align:
right` → `left`; `.story-photo-scrim`'s gradient direction reversed (dark at
0%/left fading to transparent by 100%/right, was the mirror of that);
`.story-photo-band img{object-position}` `20% 50%` → `80% 50%` (desktop only
— mobile's own override already forces `50% 50%`, untouched); `.story-chips`/
`.story-features` `justify-content:flex-end` → `flex-start`. Invoked
`ui-ux-pro-max` per the user's explicit tag; its checklist is mobile/app-
oriented (touch targets, safe areas) so most items didn't apply to this
desktop marketing section, but the scrim-strength (40-60% dark scrim to
isolate foreground text) and contrast-pair guidance matched what this section
already does with its ink-based gradient + text-shadow combination.

**Verified**: `probe.js` 0px overflow at all six widths. Screenshots at
1440px and 390px — left column reads clearly against the dark-left scrim,
subject (strawberries/greens) now sits fully visible on the right instead of
being crowded by text, chips/features left-align under the copy, mobile
fallback (still fully static/centered/on-ivory) unaffected since none of the
changed properties are touched by its own media-query override.

**2026-08-17, `#story` copy moved fully onto the photo, then the whole
founder-story block (copy/quote/chips/features/CTA) moved onto it too** —
two quick follow-up requests after the initial `#story` build (below): first
"move the copy on top of the image to the right side, adjust contrast
accordingly" (added `.story-photo-scrim`, a right-heavy horizontal ink
gradient, plus `brightness(.82) contrast(1.08)` on the `<img>`, and
right-aligned the eyebrow+heading over it), then "move the text as well, on
the photo, move the photo to the left" (moved `.story-photo-cap` into the same
column, shifted `object-position` to `20% 50%` so the strawberries clear the
text zone), then finally "move this section on top of the image!" pointing at
the whole founder-story block that still sat below the photo in its own
`.wrap`.

**Structural change for the last one**: `.story-photo-band` no longer sizes
itself by the image's `aspect-ratio:16/9` — that capped the overlay at
whatever height a 16:9 box happens to be, nowhere near enough for a full
paragraph + blockquote + 7 chips + 4 features + a CTA. Flipped the model:
`<img>` is now `position:absolute;inset:0` (covers whatever height results),
and `.story-head` (now containing everything, `.story-text` nested inside it)
is normal-flow content that determines the box's height, floored by a
`min-height:clamp(480px,54vw,760px)` so it never reads as thin. Same technique
`.serve-photo` already used elsewhere on this page for a photo + arbitrary-
length caption; reused rather than invented. Every `.story-text` color
(`.story-copy`, blockquote, `cite`, `.story-features` text/icons) flipped from
the on-ivory palette (`--ink`/`--maroon`/`--oxblood`/`--brass`) to the on-dark
equivalent (`--ivory`/`--warmlight`/`--brass-lit`) plus text-shadow, since it's
now sitting on the scrim, not the page background — `.story-chips` didn't need
this, its pills carry their own opaque `--ivory2` fill regardless of what's
behind them.

**Mobile stays untouched by any of this**: a `max-width:760px` override resets
the `<img>` back to `position:static;aspect-ratio:16/9` (a normal, modestly-
sized photo again, no scrim, no filter), and `.story-head` back to
`position:static` with every color reset back to the on-ivory palette — the
overlay-on-photo treatment is desktop-only, same reasoning as the very first
`#story` pass: a full-bleed image tall enough to host a paragraph, quote, 7
chips and 4 features would be an enormous, mostly-dim scroll distance on a
360-390px phone for content that reads fine as plain stacked text there.

**Verified**: `probe.js` 0px overflow at all six widths after each of the
three edits. `tags.js` balanced across `#story`→`<footer>` after the
structural merge (div/ul/li/svg/span/a/p/section all delta 0). Screenshots at
1440px, 1024px (narrower column, confirms the scrim is still dark enough
there for `--ivory` text) and 390px (confirms the mobile fallback still
matches the pre-merge look exactly) — all legible, features wrap 2×2/3+1
depending on width without overlap, corner-bracket decoration and CTA both
render correctly over the photo.

**2026-08-17, `#story` refined per user review: Instagram block dropped, heading
brought up to the sitewide scale, new 16:9 trust photo, full-bleed restructure
(`experiment.html`)** — the previous pass (below) built `#story` explicitly as
placeholder content; the user reviewed it and asked for four specific fixes
rather than a redesign: (1) remove the Instagram teaser grid entirely, (2) fix
`.story-heading`, which was rendering at `--t-lg` — genuinely smaller than body
text at some widths, smaller than every other section heading on the page —
(3) add a photo that reads as an honest trust/partnership metaphor for the
Simak-and-Nazia story without claiming to literally depict them (this
project's founding complaint about the old site was exactly this kind of
misattributed imagery), and (4) restructure around that photo as a full-bleed
16:9 band instead of the old arch-cropped portrait crop.

**Structure**: `<section id="story" class="wrap section">` → `class="section--
bleed"` (bare, full viewport width, same pattern as `#what-we-serve`). Three
top-level `.reveal` pieces (`--i:0/1/2`): a `.wrap` div (eyebrow + heading), a
full-bleed `.story-photo-band` (16:9 `<img>` + `.story-photo-cap` caption), and
a second `.wrap` div holding `.story-text` (founder-story paragraph, pull-quote
+ cite, the 7-emirate `.story-chips`, the 4-icon `.story-features`, and the
WhatsApp CTA — all four left content-identical to before, only their container
changed). Removed: the `.story-grid` two-column `.8fr/1.2fr` layout, the
arch-cropped `.story-photo-frame` (4:5, `border-radius:50% 50% ... / 42% 42%
...`), and the entire `.story-ig` block (label + IG glyph SVG + 4-tile grid +
all `.story-ig*` CSS, including its `max-width:760px` mobile override) — the
old arch-cropped founder photo (saffron close-up) and all 4 IG-grid stock
photos came out with it, since none are used elsewhere on the page.
**Heading**: `--t-lg` → `--t-2xl` (matches `.sechead h2` / `.serve-photo__
caption h2` exactly), added `.story-heading em{font-style:italic;font-weight:
500;color:var(--oxblood)}` copied byte-for-byte from `.sechead h2 em`, copy
changed to `<em>Simak</em> and <em>Nazia</em> opened it.`

**Photo**: sourced from Wikimedia Commons, not the local-placeholder fallback
— the environment had live network access this session, so the fallback path
wasn't needed. ~30 search queries against `commons.wikimedia.org/w/api.php`
(`hands cooking together`, `hands kneading dough together`, `two hands bread`,
etc.) for a genuine two-person hands photo, since a single person's two hands
cupping a bowl would make "two pairs of hands" in the caption an overclaim.
Two false starts caught by viewing the image before use, not after: "In a
dimly lit setting, two hands reach towards each other, one offering a piece of
bread" (CC BY 2.0) turned out to be part of a staged domestic-violence-themed
shoot — one wrist visibly in handcuffs, invisible in the file title/
description, only visible on the actual pixels. "Kitchen Companions, Cooking
Together" (CC0) showed two women's full faces, not hands. Landed on **[Two
children's hands press colorful cookie cutters into rolled dough on a
flour-dusted countertop](https://commons.wikimedia.org/wiki/File:Two_children%27s_hands_press_colorful_cookie_cutters_into_rolled_dough_on_a_flour-dusted_countertop.jpg)**
(Shixart1985, CC BY 2.0) — a genuine two-person hands-only shot, cropped
tightly (`assets/photos/source/story_trust_hands.jpg` → `ffmpeg crop=2334:
1313:753:220,scale=1800:1013` → `assets/photos/optimized/story_trust.jpg`,
1800×1013, 155,893 bytes) to isolate the hands/dough/cookie-cutter action and
exclude a Christmas-sweater sleeve visible in the wider source frame — the
source is a seasonal photo of two children baking, not adults, not the
founders. Credited in `assets/PHOTO_CREDITS.md` with an explicit honesty note
(flagged there, not just here) that this is a hands-only metaphor for the
Simak/Nazia partnership, not a literal depiction, matching this project's
founding rule against misattributed imagery. Caption: "Trust starts the same
way it always has — two hands, the same dough." Alt text describes only what's
in the frame ("Two hands pressing cookie-cutter shapes into rolled dough on a
flour-dusted kitchen counter"), no age or identity claim either way.

**Real bug caught and fixed, by measurement not assumption**: first restructure
pass fused `.wrap` and `.story-text` onto one `<div class="wrap story-text
reveal">`. `.story-text::before/::after` position at `left:-2px`/`right:-2px`
(a deliberate overhang for the corner-bracket decoration) — safe in the old
layout because `.story-text` sat inside a grid column with a photo column and
gap as buffer before the true `.wrap` edge, but with the two classes fused the
pseudo-elements' containing block *was* the viewport-flush `.wrap` edge, so
the brackets pushed 2px past the real page edge. `probe.js` caught it directly
(768px and 1024px both `FAIL overflow=2px`; 360/390/1440/1800 all clean —
narrow enough width range that it looked like it could be a red herring).
Isolated with a throwaway CDP script toggling `display:none` on `#story` vs.
`#top` (the pre-existing hero dish-carousel, the file's usual overflow
suspect) to confirm it was this section and not the carousel, since a naive
"scan every element's `getBoundingClientRect()`" check found nothing — CSS
pseudo-elements aren't in `querySelectorAll('*')`, so `::before`/`::after`
overhang is invisible to that class of check and has to be reasoned about
directly. Fixed by nesting `.story-text` inside its own `<div class="wrap
reveal">` again (matching the original containment) rather than changing the
bracket rule itself, per instruction to adjust the container, not the
decoration.

**Verified**: `probe.js` 0px overflow at all six widths (360/390/768/1024/
1440/1800), re-checked after the fix above. `tags.js` balanced across
`#story`→`<footer>`: div 4/4, ul 2/2, li 11/11, svg 5/5, a 1/1, p 3/3, section
1/1. Screenshots at 1440px and 390px confirm the heading reads noticeably
bigger with the oxblood italic names, the photo renders as a real 16:9
band (not stretched, not broken) at both widths, no Instagram block remains,
and the chips (wrapping 3/2/2 on mobile), 4-icon feature strip, and WhatsApp
CTA all render legibly below the photo. Grep confirms zero remaining
`story-grid`, arch-cropped `story-photo-frame`, or `story-ig` references
anywhere in the file (a CSS comment describing what was replaced was reworded
to avoid even incidentally containing those substrings), zero stray `__..._
..__`-style tokens, and the footer's own separate Instagram link
(`instagram.com/themaroondoor.ae` in `.footer-links`) is untouched.
`assets/PHOTO_CREDITS.md` entry and `assets/photos/optimized/story_trust.jpg`
both confirmed present on disk. File size: 1,779,636 bytes (previous entry's
end state) → 1,304,712 bytes — smaller despite the new photo, since the 4
IG-grid images and the old arch-cropped photo (removed) outweighed the one
new photo (added).

**2026-08-17, follow-up: trust photo swapped again after visual review** — the
subagent pass above landed on a hands-only crop of "Two children's hands press
cookie cutters into rolled dough" as the least-bad option after ~30 Wikimedia
search queries came up empty for a genuine adult two-person hands shot. Pulling
the actual optimized file and looking at it (not just the alt text/caption)
showed small hands, painted nail polish, and star/flower cookie cutters — reads
unambiguously as a kids'-baking-activity stock photo, wrong tone for a premium
catering brand's founder story even though the crop is honest about not being
the founders. **Replaced with** [Fresh strawberries held in hands with vibrant
greens in a kitchen during daylight hours](https://commons.wikimedia.org/wiki/File:Fresh_strawberries_held_in_hands_with_vibrant_greens_in_a_kitchen_during_daylight_hours.jpg)
(Shixart1985, CC BY 2.0, same photographer as the rejected one — a bulk stock
contributor with descriptive auto-caption-style titles). Adult hands, healthy
produce, matches the "Healthy, Fresh, and Made Just for You" tagline directly.
**Same tradeoff carries over**: this is also one person's two hands, not two
people's — Wikimedia's CC catalog didn't turn up a "two adult siblings' hands,
faces excluded" shot after several more targeted searches (`hands together`,
`four hands cooking`, `two hands bread`, `helping hands kitchen`), and an
anonymous single-person hands photo was judged the better tradeoff over a
recognizable stranger's face (two candidates with visible adult faces were
looked at and passed over for that reason) or a wrong-tone kids' photo.
Re-cropped to the same 1800×1013 16:9 dimensions via
`ffmpeg scale=1800:-2,crop=1800:1013` so no layout shift. `assets/photos/
source/story_trust_hands.jpg` and `assets/photos/optimized/story_trust.jpg`
overwritten in place (same filenames, new content — no orphaned files left on
disk). `assets/PHOTO_CREDITS.md` row and honesty note both updated, with the
rejected-photo history kept in the note as context for next time this photo is
revisited. Caption changed to "Still hand-picked, the way it's always been."
(dropped the old caption's "two hands" wording since it's now one person's).
Alt text: "Fresh strawberries cupped in two hands in a home kitchen" — accurate
to the frame, no identity claim.

**Re-verified after the swap**: `probe.js` 0px overflow at all six widths
again. Screenshots at 1440px and 390px (using a custom CDP script instead of
`shot.js`, since accounting for the fixed header via `scroll-padding-top`
needed a scroll target `shot.js`'s plain `window.scrollTo` call doesn't
compute — `scrollIntoView()` was tried first and rejected: it triggered a
~1300px jump discrepancy against a direct `getBoundingClientRect()` read,
consistent with this page's known vh-based pin-runway sensitivity to viewport
height documented earlier in this file) confirm: heading reads clearly bigger
with both names italicized, the new photo renders as a clean 16:9 band at both
widths, caption/copy/quote/chips/features/CTA all render legibly beneath it,
still zero Instagram block. `.photo-frame`'s grayscale+duotone treatment
mentioned in `BRAND.md` no longer exists in this file (removed sitewide in an
earlier pass per the CSS comment at the `.photo-frame` rule — "every photo on
this page is owned or food photography shown true to colour... nothing here
needs unifying any more") — the strawberries photo's saturated true color is
therefore consistent with every other photo already on the page, not a
mismatch; `BRAND.md`'s duotone description is stale and worth updating
separately if this comes up again.

**2026-08-17, coverage map + about merged into one `#story` section, then its 4
Instagram-tile placeholders resolved** — two-agent pass on `experiment.html`. User
asked to redesign the "where we deliver" (coverage map) and "about" sections into a
single, more engaging section — fewer clicks to convert, room for brand story +
Instagram + photos — explicitly as **placeholder content** ("we will replace it
later"), so cooked-up founder-story copy and reused stock/placeholder photography
are acceptable here for now.

**Removed**: the 7-pin coverage map with hover-card city photos (`#coverage`) and
the old two-column `#about` block. **Replaced with**: a single
`<section id="story" class="wrap section">` — founder-story paragraph + the
existing "brother-sister duo" pull-quote, a 7-emirate chip row (`.story-chips`),
the existing 4-icon feature strip reused as-is, a 4-tile "Follow
@themaroondoor.ae" Instagram teaser grid, and an in-section WhatsApp CTA.

**"Minimum clicks" reasoning**: the Instagram tiles link straight out to the
profile (`https://instagram.com/themaroondoor.ae`) in one tap rather than opening
a lightbox or in-page feed — the goal is routing a browsing user onto Instagram,
not building a mini gallery viewer. The WhatsApp CTA sits inside the section
itself (styled as `.btn.btn--wa`, matching the header and footer CTAs) so a reader
who just read the founder story and coverage area can order without scrolling all
the way to the footer.

**Nav**: `#coverage` / "Delivery" → `#story` / "Our Story" (`experiment.html`
nav-wide link).

**4 Instagram-grid photos** (this agent's task: resolving 4 `__IMG_story_*__`
tokens the first agent left in place):
- `__IMG_story_ambience__` → `assets/photos/optimized/ambience.jpg` (the same
  saffron/kitchen-ambience stock photo already used elsewhere on the page)
- `__IMG_story_mexrice__` → `assets/photos/optimized/mealplan_mexican_rice_bowl.jpg`
- `__IMG_story_padthai__` → `assets/photos/optimized/mealplan_pad_thai_fish_cake.jpg`
- `__IMG_story_bowl__` → `assets/photos/optimized/bowl.webp`

All 4 base64-inlined via a one-off Node script (`fs.readFileSync` → base64 →
literal token replace, one exact match required per token, none found = hard
error) — same pattern as every other `__IMG_*` token in this file. **Flag**:
these are existing placeholder/stock-adjacent repo photos reused for a mockup,
not real Instagram grabs or new photography — same open-item category as the
`og:image` (needs creating, "Known caveats" item 6 below) and the footer legal
pages (don't exist yet, item 2). `bowl.webp` specifically already carries an
**unverified-license flag** (item 6 in "Known caveats" — dropped into the repo
without going through the Commons-sourced attribution process the other stock
photos used); it's now used in a second spot on the page, so that flag applies
here too and needs resolving before launch regardless of the Instagram-swap.
Real IG exports should replace all 4 before this ships.

**Verified**: overflow 0px at all six standard widths (360/390/768/1024/1440/1800)
via `build/verify/probe.js`; tag balance for the `#story` section clean
(`div`/`ul`/`li`/`svg`/`span`/`a`/`p`/`section` all delta 0) via
`build/verify/tags.js`; screenshots at 1440px and 390px via `build/verify/shot.js`
confirm all 4 IG tiles render real photos (no broken-image icons), the emirate
chip row wraps 3/2/2 on mobile without crowding, the 4-icon feature strip stays
legible in a 4-up row at both widths, the WhatsApp CTA matches the site's other
`.btn--wa` buttons, and the arch-cropped founder photo (saffron close-up) renders
untouched. Page stays light-only per `BRAND.md`, so no dark-mode contrast check
was needed — text reads with normal contrast against ivory at both widths.
Whole-file grep for any stray `__IMG_`/`__ICON_`/`__..._..__`-style token: zero
matches anywhere in the file, not just in `#story`.

**File size**: 1,550,649 bytes before this two-agent pass → 1,181,813 bytes after
the first agent's section merge (removed 8 embedded images: 7 pin-card city
photos + 1 map photo) → **1,779,636 bytes** after this pass added the 4 new
photos back in as base64. Net **+228,987 bytes (+14.8%) versus the original
pre-merge baseline** — larger, not smaller. Worth flagging: the raw source files
added here (109KB + 79KB + 64KB + 194KB ≈ 446KB) are actually bigger in aggregate
than the ~338KB removed (≈240KB of 7 pin-card photos + ≈98KB map photo), with
`bowl.webp` alone (194KB raw) accounting for most of the gap; base64 inflates
both directions by ~33%, so the net direction was always going to follow whichever
raw total was larger, and here that was the replacement set.

No new bugs surfaced during this pass — the first agent's markup, section
boundaries, and tag structure were already clean; this was a straight
token-resolution-plus-verification job.

**2026-08-16, hero re-laid out to the supplied mockup (`experiment.html`)** — user
supplied a hero mockup and asked the page be converted to it, explicitly keeping the
91-frame scroll-scrub as the hero artwork. Spec at
`docs/superpowers/specs/2026-08-16-hero-mockup-relayout-design.md`, plan at
`docs/superpowers/plans/2026-08-16-hero-mockup-relayout.md`. Executed subagent-driven
with a verification gate between every task. **Nothing committed** — this repo still
has zero commits by user preference.

- **The mockup is frame 091 of the animation we already own.** No new photography, no
  new renders. The re-layout is confined to `.bowl-pin-stage`.
- **Floating garnish was built, then cut on review.** Four circular crops from
  `frame_091.jpg` were made to drift toward the bowl and fade as the scrub filled it
  (the ingredients-not-yet-in-the-bowl idea), driven by a single `--bowl-p` property
  off the existing rAF tick. **The user judged them not good-looking and they were
  removed** — markup, CSS, the `--bowl-p` JS, and the mobile grid-area reset all
  deleted, so no dead code remains. The four
  `assets/photos/optimized/garnish_*.jpg` files are still on disk and unreferenced;
  delete them if this idea is not revisited. Lesson worth keeping: a circle crop of
  food photographed against food carries its neighbours into the circle, and on flat
  sand that reads as a photo coin pasted on the page, not a loose ingredient. A soft
  radial mask improved it but did not save it.
- **`--hero-sand:#F2E9DA`**, sampled from the frames' own backdrop with
  `System.Drawing` (same method `BRAND.md` used to pull the maroon off the real logo).
  The page's `--ivory` is `#F2E7E2`, a rose parchment; the frames sit on sand. That
  mismatch was the *entire* reason `.bowl-media` carried a **four-gradient
  `mask-image` stack — it was hiding a seam**. With the backgrounds matched it
  collapses to one left-edge feather. Token is scoped to `.bowl-story`, not `:root`.
- **Teaser gate deleted** ("An empty bowl. / Scroll to fill it."). The `<h1>` now
  paints at load instead of sitting behind an interstitial. Five things were coupled
  to it and came out together: markup, `.bowl-teaser*` CSS, the teaser JS block,
  `@keyframes cue-bob`, and the `.reveal` observer's `!el.closest('.bowl-intro')`
  filter, which existed *only* so the teaser could be seen before the copy revealed.
- **Copy card deleted** (glass fill, brass border, shadow, padding). That panel was
  what made the hero read as a component placed on a page. Removing it also retired
  the deliberately-notched headline clamp — the constraint its comment described
  ("lives inside a fixed card") ceased to exist, so the `h1` went to full `--t-3xl`.
- **Bowl sizing, after two corrections.** First attempt kept the frame's aspect ratio,
  which renders the bowl centred and small (38% of viewport) because the bowl is
  centred *within the frame* — nothing like the mockup. Second attempt widened the box
  1.4x past that ratio so the cover-draw would zoom it, which worked but **cropped the
  bowl top and bottom** — the user flagged this. Final: the box matches the frame's
  1920/1088 aspect exactly (no crop on either axis, bowl renders as a complete
  circle), and the bowl is pushed right by a **bleed derived from the box, not the
  viewport**. The frame carries ~23.7% of its own width as sand right of the bowl;
  bleeding by that minus ~48px runs the surplus sand off the edge and parks the bowl
  just inside the fold. Measured: 48px right clearance at 1200/1280/1440/1600/1800,
  bowl 38–44% of viewport, centre 74–78%.
- **Trust rail** (`.hero-rail`) sits *inside* the sticky stage as row 2, so it stays in
  the first viewport and releases with the pin. Full-bleed hairline row first, which
  the user found cluttered; now a **contained rounded panel** as the mockup shows — a
  wash of brand maroon over the sand, 26px radius, thin dividers between cells. The
  panel and the gap beneath it are split *inside* `--rail-h` (`--rail-gap`), never
  added on top, because `--stage-h` and the pin runway are derived from it. The
  mockup's five-star "Trusted by 1000+ customers" was **replaced with
  `@themaroondoor.ae`** per user decision — a verifiable line rather than an
  unsubstantiated figure.
- **Seal** uses the brand's own `.doormark` and reads
  "MAROON DOOR · DUBAI · ALL SEVEN EMIRATES", not the mockup's leaf-and-wheat
  "FRESH INGREDIENTS · HONEST FOOD" — the organic seal is the stock device on every
  food site, and "fresh" is on the unverified-claims list.
- **Deliberately not matched to the mockup**: menu CTA stays "See Dadi's menu" (the
  destination is headed *Dadi's Menu*; a control keeps its name through the flow);
  third feature stays "Delivered from Dubai." (mockup's "Delivered fresh" is an
  unverified claim); the blurred foreground edge-leaves were cut (three ornaments
  around one signature, and two blurred absolutely-positioned images hanging off both
  edges is this file's most-repeated bug waiting to happen).

**Real bugs caught during this pass**, each by measurement rather than assumption:
1. **`.hero-rail{grid-area:2/1/3/3}` names column line 3**, which does not exist in
   the `max-width:900px` single-column collapse — grid fabricates an implicit column.
   Caught in plan self-review before it was ever written. `.bowl-garnish` had the same
   defect and was *visible* between 760–900px, where the existing hide rule (760) did
   not reach.
2. **The seal was positioned `right:7%` against `.bowl-media`** — whose box now extends
   ~25vw *past* the viewport, so it rendered off-screen entirely. Now `right:32%`.
3. **Mobile: the eyebrow rendered underneath the fixed header.** Pre-existing and
   latent — `.bowl-pin-stage` goes `position:static` at ≤900px while the header is
   `fixed`, and the teaser card used to occupy that space so nothing legible sat
   there. Removing the teaser exposed it. Verified against the pre-change backup:
   `introTop:24` vs `headerBottom:66` in *both* files.
4. **Garnish collided with the body copy at 1024px.** The sand gap it occupies is a
   function of `min(44vw,600px)` copy width, so it closes as the viewport narrows.
   Now hidden below 1200px rather than chasing per-breakpoint positions for
   decoration.
5. **The copy touched the header at 800–900px-tall viewports.** `.bowl-intro` fills
   row 1 exactly (the row is sized by `.bowl-media`'s min-height), so there was zero
   slack once the rail took 64px. Fixed with `padding-block` on `.bowl-intro` — not a
   stage change, because `--stage-h` is what the pin runway is derived from.
6. **A vw-based bleed diverges from a height-driven box.** `.bowl-media`'s width
   tracks `--bowl-h` (a height), so bleeding it right by `25vw` held at 1440 but
   pushed the bowl 29px off the fold at 1800. The bleed is now computed from the box
   itself, which holds at every width.
7. **The frames carry a faint vignette**, so their sand is a shade off `--hero-sand`
   at the very edges and the media box's top and bottom rims showed as hairlines
   against the page. Fixed with a second mask layer and **`mask-composite:intersect`**
   — multiple mask layers union by default, which would have erased the feather
   rather than applying it.
8. **Two verification false alarms, both worth knowing**: `element.focus()` reports
   `outline:none` because programmatic focus does not reliably match `:focus-visible`
   — a real `Input.dispatchKeyEvent` Tab shows the 3px brass outline on everything.
   And the tag-balance one-liner returned `open=0` for every tag because shell quoting
   mangled the `[\s>]` character class; it is now `build/verify/tags.js`, a real file.

**New: persistent verification harness at `build/verify/`** — replaces the scripts
referenced elsewhere in this file as `scratchpad/probe.js` / `shot.js` / `cdp.js`,
which were written to a session-temp directory and are gone. Node 24 ships a global
`WebSocket`, so `cdp.js` drives headless Chrome over the DevTools Protocol with **zero
npm dependencies**.
- `probe.js` — horizontal-overflow gate at 360/390/768/1024/1440/1800. Exits non-zero,
  so it is a real gate. Narrow widths go through `Emulation.setDeviceMetricsOverride`,
  never the CLI `--window-size` path, which cannot render below ~485px on Windows and
  silently saves a cropped PNG at the requested width.
- `shot.js` — screenshots. **`settleMs` defaults to 1400 and matters**: the page's
  `.reveal` items are a .7s transition with an 80ms-per-item stagger, so a screenshot
  taken two rAFs after load captures a mid-fade frame and reports it as the finished
  page. This produced a false `opacity:0` reading during the work.
- `scrub.js` — drives the scrub to 0/0.5/1 and reports `--bowl-p`, garnish opacity and
  `stageTop` (which proves the pin held) at each.
- `tags.js` — open/close balance for one section.

**Verified at completion**: overflow 0px at all six widths; tags balanced; scrub
0→0.5→1 gives `--bowl-p` 0/0.5/1, garnish opacity 1/0.325/0, `stageTop` 84 throughout;
reduced motion gives `seal:none`, `garnishTransform:none`, `garnishOpacity:.92`;
keyboard Tab shows a 3px brass outline on both hero CTAs and the new rail link.

*Open items created by this pass*: the Instagram URL
`https://www.instagram.com/themaroondoor.ae/` is derived from the handle in `BRAND.md`
and has not been checked against the live profile. Garnish bits come from rendered
frames, not Maroon Door's own food photography — a four-file swap with no markup change
if real photos arrive.

**2026-08-16, eleventh follow-up: the 880px cap read as too small** — a fair
call: 880px was a number picked to hit a height target, not derived from anything
on the page, so at desktop widths the map sat as a small island in a sea of empty
ivory with no visual relationship to the content around it. Fixed by matching
`.coverage`'s `max-width` to `.wrap`'s own (1180px) instead of a bespoke value —
every other section (hero card, Dadi's Kitchen panel) already sits in that exact
column, so the map now reads as part of the same page rather than a shrunken
afterthought. Height lands at 664px (vs. 495px at 880px, vs. ~880-1000px+ at true
full-bleed) — a size derived from the site's own layout grid, not a guess in either
direction. Verified 0px overflow at 1920px and 500px.

**2026-08-16, tenth follow-up: coverage map capped back down** — full-bleed
(`width:100%`, no cap) made the section too tall on wide screens (~880-1000px of
scroll for one image). Capped `.coverage` (the positioning context for the image
*and* both absolute overlays, so both stay correctly anchored to the now-smaller
image's edges) at `max-width:880px;margin-inline:auto` — section height on a
1600px-wide screen dropped from 883px to 495px. Mobile (`max-width:760px`, where
the heading/features already drop to static flow) is untouched by this, still full
width there. Verified 0px horizontal overflow at 1600px and 500px.

**2026-08-16, ninth follow-up: interactive map pins (hover/tap reveals a city
photo) + corrected pin coordinates, re-applied after a concurrent-edit conflict.**
User asked for two things: pin hover-cards showing a photo of each city, and a fix
for pin accuracy (Dubai specifically was flagged as "way off"). Mid-session, another
process was independently rewriting `experiment.html` in parallel (a full redesign
pass — SEO meta/JSON-LD, a design-token system replacing hardcoded values, a
glass-panel treatment for the coverage overlays, new copy) and it clobbered an
in-progress version of this work (confirmed via `pin__card` occurrence count
dropping to 0 and the file shrinking by ~2.3MB — the 7 spliced photos gone). Paused,
flagged it to the user rather than fight an unknown moving target, confirmed the
other process had stopped, then re-applied on top of that new baseline instead of
reverting it.
- **Pin coordinates re-measured off `assets/raw uae map.png` directly**, using
  `ffmpeg drawgrid` (5% grid overlay) plus cropped/zoomed regions per emirate rather
  than eyeballing the full image — the old Dubai pin (`--x:48;--y:50`) sat in open
  water north of Dubai's own coastal island cluster (visible in the image as a
  cluster of small square landforms — Palm/World Islands), not on the coast itself.
  New values trace the actual coastline: `--x:47;--y:57` for Dubai, and the whole
  Sharjah→Ajman→Umm Al Quwain→RAK run re-spaced along the traced curve rather than
  guessed.
- **Hover/tap photo card** (`.pin__card`): a small city photo + name that fades and
  scales in per pin, using the existing design tokens (`var(--shadow-md)`,
  `var(--ease)`, `var(--radius-sm)`) rather than reintroducing hardcoded values.
  Each pin now has `tabindex="0"` and `aria-label`, and the reveal triggers on
  `:hover`, `:focus`, and `:focus-within` together — not hover alone, since touch
  browsers focus (rather than hover) a tabindex element on tap, which is what makes
  this work without a pointer.
- **Seven photos sourced from Wikimedia Commons** (CC BY-SA 3.0/4.0, all credited
  in `assets/PHOTO_CREDITS.md`, sources archived under
  `assets/photos/source/uae_cities/`, optimized to ~15-50KB each at
  `assets/photos/optimized/city_*.jpg` via `ffmpeg scale=440:320:force_original_
  aspect_ratio=increase,crop=440:320`): Abu Dhabi Corniche, Dubai skyline (Burj
  Khalifa), Sharjah corniche at night, Ajman beach, Umm Al Quwain beach at sunset,
  Ras Al Khaimah city view, Al Badiyah Fort (Fujairah). Base64-spliced into the page
  via a placeholder-token Node script, same safe pattern as the map image itself.
  **Real download friction, worth knowing for next time**: Wikimedia's CDN 429s on
  repeated *original*-resolution file requests ("Too many requests... use thumbnail
  sizes") — original-size downloads worked for 5 of 7 files before the 429 hit;
  switching to the `/thumb/.../500px-...` endpoint (500px specifically — 320/640/
  1024 all 400'd with "use thumbnail sizes listed") resolved the rest immediately,
  no further rate-limit wait needed.
- **Mobile card placement had a real bug, caught by screenshot not assumed**: the
  first pass positioned cards for a layout where the heading/features overlay the
  image on mobile too (matching desktop) — but this codebase's mobile breakpoint
  actually drops the heading/features into normal static flow *above/below* the
  image instead (a deliberate, separate design decision already in place before
  this pass), freeing the entire image height for pins. The first mobile offsets,
  computed against the wrong (desktop) assumption, positioned several cards to
  overlap a heading that, on mobile, isn't there to overlap in the first place —
  and conversely undershot the safe vertical band for others. Recomputed once
  the actual mobile layout was confirmed via screenshot; verified clean at 500px
  for the two tightest cases (Sharjah, Umm Al Quwain).
- Verified via headless-Chrome screenshot: 0px horizontal overflow at 1440/1600px
  and 500px, hover-card forced-visible checks on Dubai/RAK/Fujairah (desktop) and
  Sharjah/Umm Al Quwain (mobile) all clear of the map's own edges and other overlays.


**2026-08-16, premium audit pass on `experiment.html`** — full review and rebuild
against a "$10k site" brief: conversion copy, SEO, performance, spacing/typography,
micro-interactions, responsive behaviour. **3.34MB → 1.23MB (-63%)**, zero horizontal
overflow at 360/390/768/1024/1440/1800px, zero dead links.

- **Build method**: the file is 3.3MB of inline base64, too large to edit directly, so
  it was split into editable parts in the scratch dir (`p0_head` / `p1_fonts` /
  `p2_css` / `p3_body` / `p4_js`) and reassembled by `scratchpad/assemble.js`. That
  script also *generates* the WhatsApp deep links (percent-encoding a multi-line
  prefill by hand is exactly the kind of thing that silently half-works) and
  **derives every `<img>` width/height from the actual image bytes** — hand-kept
  dimensions went stale the moment one photo was re-cropped, and a wrong ratio is
  worse than none since it reserves the wrong space. It hard-fails on any
  unsubstituted token rather than shipping one as literal text.
- **Perf**: deleted 8 unused `@font-face` rules (Archivo ×2, Big Shoulders, Karla ×2,
  Lora, Newsreader ×2) — **184KB of base64 in the render-blocking `<style>`**, for
  families no selector referenced. Re-encoded every image to the size it actually
  renders at (`scratchpad/optimize.sh`): the header logo was a **1368×748 PNG (338KB)
  displayed at 102×56** → 320px palette-quantised PNG, 7KB (-97%); dish photos were
  ~1024px sources in 148px circles → shorter-side 340px (-70% each). Images 2177KB →
  809KB. Also deleted dead CSS (`.hero`, `.offers-*`, `.offer-*`, `.intro-anim*`,
  `.scroll-cue`) and dead JS (the intro-video block and the `.bowl-step` observer) —
  **none of that markup exists on the page**.
- **JS**: three separate scroll listeners (header state, reveal gate, canvas scrub)
  collapsed into one passive listener feeding a single rAF tick, plus one debounced
  resize — on a page whose signature interaction is a 91-frame scrub, they were
  competing for the same frame. Gallery slots are now built with DOM methods instead
  of `innerHTML` string concatenation.
- **SEO**: real `<title>`, meta description, canonical, OG + Twitter cards,
  theme-color, and a JSON-LD `@graph` (WebSite + FoodEstablishment/LocalBusiness with
  telephone, address, `areaServed` for all 7 emirates, `openingHoursSpecification`
  from the real footer hours, `hasMenu`, `sameAs`, and the three services as
  `makesOffer`). Added `<main>`, a skip link, `role="list"` on style-stripped lists,
  and an `<h2>` to the About block, which previously had no heading at all. Heading
  outline is now one `<h1>` and a clean h2/h3 tree.
- **Dead links fixed**: "Explore Dadi's Full Menu" pointed at `href="#"` — now points
  at the real live page (`/menu/full-menu`). The four `href="#"` policy links were
  removed rather than shipped broken; the column is now "Delivering to" listing the
  seven emirates (also useful local-keyword coverage in the footer). **Real policy
  pages are still an open item** — see below.
- **Fewer clicks**: dish cards and service cards use a stretched-link overlay, so the
  whole card is one hit target instead of a small text link. Header nav went from 3
  links to 4 (Plans / Menu / Delivery / Contact) and now *shows on mobile*, where it
  previously vanished entirely below 768px. Arrow keys scroll the dish carousel a
  card at a time. Every WhatsApp CTA now opens with a labelled-blanks prefill
  (headcount, date, emirate) so the first reply can be a real quote instead of
  "what would you like to know?".
- **Design**: introduced token systems for type, spacing, radius and shadow (the page
  previously had ad-hoc `clamp()` calls per component). Coverage overlays moved onto
  ivory glass panels instead of sitting directly on the map pixels — the old version
  relied on that one image's corner colours staying light, which is not a contrast
  guarantee. About photo now uses an arch crop, tying the door motif to the one place
  it can be taken literally. Added `:active` states, a scroll-shadow header, pin
  hover states, and a mask-faded marquee.
- **Real bugs caught during verification**, each by screenshot rather than assumption:
  1. `.stretch::before` resolved against the *button* because I had put
     `position:relative` on `.btn` — the "whole card is clickable" overlay covered
     only the button. Fixed by keeping `.btn` static and using `z-index` on flex
     items (which works without positioning).
  2. `.serve-photo__caption{max-width:44ch}` — `ch` resolves against that element's
     own 16px font, not the 40px display face inside it, so the h2 wrapped into five
     short lines. Swapped for a px/percentage cap.
  3. **A specificity collision I introduced myself**: raising the nav tap target to
     44px meant `.site-nav a` (0,0,1,1) out-specified `.nav-wide` (0,0,1,0), so the
     mobile-hidden "Delivery" link reappeared and collided with the logo. Fixed with
     `.site-nav a.nav-wide`. Exactly the failure mode `frontend-design` warns about.
  4. ~240px of dead ground under the map: `.section--bleed`'s own margin stacked with
     the next section's padding. Bleed sections now carry no vertical space; the
     neighbour above supplies the gap.
  5. Header nav links measured 26px tall on a phone, under the touch minimum.
- **Verification tooling** (`scratchpad/probe.js`, `shot.js`, `cdp.js`): the CLI
  `--window-size` path **cannot test below ~485px on Windows** — Chrome renders at
  that floor but saves the PNG at the width you asked for, so a "390px" check is
  silently a 508px check. Narrow phones are therefore verified over the DevTools
  Protocol (`Emulation.setDeviceMetricsOverride`), which sets a real CSS viewport at
  any size; confirmed 360px and 390px genuinely. Scrolled captures use a CSS
  `body{margin-top:-Npx}` shift, since `window.scrollTo()` plus
  `--virtual-time-budget` renders a blank frame in this environment.
- Original file backed up at `scratchpad/experiment.ORIGINAL.html`.

### Open items from this pass (need real answers from the client)
A full copy deck with 24 flagged gaps is at `scratchpad/copy.md`. The blocking ones:
1. **Calorie figures are estimates, not measured** — now labelled "Approximate, per
   portion", but published nutrition numbers are a regulatory exposure in the UAE.
   Replace with real values or drop the field.
2. **Policy pages** (privacy, cookies, terms, refunds/cancellation) don't exist. A
   refunds policy is the one a meal-plan buyer looks for before committing.
3. Unverified operational claims still on the page: "fresh daily", "never frozen".
   The teaser's "every morning" was removed pending confirmation.
4. Do all three services cover all seven emirates, or are Corporate/Royal
   Dubai-and-nearby? The coverage section currently implies universal coverage.
5. Who are the "nutrition experts"? A named qualification converts far harder.
6. `og:image` points at `/assets/og-cover.jpg`, which **needs to be created** —
   nothing is served at that path yet.

**2026-08-16, eighth follow-up: map made genuinely bigger/full-bleed (no cap this
time) and rebuilt as a poster** — user flagged the previous pass as still not
full-bleed (it had a `max-width:1400px` cap) and asked for the final composition to
resemble the original `assets/UAE presence.png` reference: one image with the
heading, subhead, and feature icons overlaid directly on top of the map rather than
sitting in separate blocks above/below it.
- Dropped the `max-width:1400px` cap entirely — `.coverage-map-photo` is now
  `width:100%` with no ceiling, so it's genuinely edge-to-edge at any viewport size
  (matches the earlier `.offers`-style bare-section pattern, just without the
  self-imposed size limit this time).
- **Restructured to a single overlay stack**: `.coverage-overlay-head` (eyebrow +
  h2 + subhead) is absolutely positioned top-left directly on the `<img>`, and
  `.coverage-overlay-features` (the 4 icons) bottom-left, both anchored in this
  specific image's own open background areas — same reasoning the reference image's
  own layout used for label placement. Deleted the two `.wrap` wrapper divs and the
  old `.coverage-features`/`.bowl-intro__icon`-reuse styling that assumed a normal-
  flow block below the image; replaced with compact `clamp()`-sized overlay
  versions so text stays legible from a 360px phone up to a >1800px desktop image.
  Subhead paragraph hides below 560px width (not enough room over the image at
  that scale without crowding the Abu Dhabi pin).
- **Real bug caught by the post-edit formatter hook, not by me**: a formatting
  pass after one of the markup edits revealed the `.coverage-map-photo` div was
  closing right after the pins (leftover `</div>` from the old two-`.wrap`
  structure that my edit's `old_string` hadn't included), leaving the feature-icon
  `<ul>` as a sibling instead of a child — which would have made its `position:
  absolute` resolve against the wrong containing block. Caught by re-reading the
  section after the hook ran (per its own instruction to re-read before further
  edits touching a reformatted region) rather than assuming the prior edit's intent
  had survived, and fixed by removing the stray early close.
- Verified via headless-Chrome screenshot at 1800px (desktop) and 500px (mobile):
  heading and feature icons both read clearly against the image's actual pixel
  colors at those corners, all 7 pin labels still clear of both overlays and each
  other, 0px horizontal overflow at 500/1440/1800px.

**2026-08-16, seventh follow-up: map made full-bleed, names moved onto the map**
(off the legend below) per user request. Invoked `frontend-design` again for this pass.
- **Full-bleed**: `#coverage` changed from `<section class="wrap">` to a bare
  `<section>`, same pattern as `.offers`/`.menu-section` elsewhere in this file — the
  eyebrow/heading and the feature strip each got their own inner `.wrap` div so they
  stay centered/line-length-limited, while `.coverage-map-photo` sits as a direct
  section child at `width:100%;max-width:1400px` (capped so it doesn't get
  absurdly tall on ultrawide monitors — the image's own aspect ratio means height
  scales with width, and 100vw uncapped would mean ~1080px of vertical scroll on a
  1920px display).
- **Real bug caught and fixed**: first attempt at the breakout used
  `width:100vw;left:50%;transform:translateX(-50%)` — the standard trick for
  escaping a *width-constrained* parent, but `#coverage` here is already a bare,
  unconstrained section (full viewport width by design), so layering that
  centering-transform on top of an already-full-width box shifted it by an extra,
  wrong amount — confirmed via `document.documentElement.scrollWidth -
  clientWidth` = 616px of real horizontal overflow (not a rounding/scrollbar
  artifact; too large for that). Fixed by simply removing the breakout hack
  entirely (`width:100%;max-width:1400px;margin-inline:auto` — the section is
  already full-width, so the image just needs to fill it, no escape needed).
  Re-verified 0px overflow at 1440px and 1600px.
- **Names on the map**: `.pin` is now `dot + label`, `--x`/`--y` for the dot's real
  position (unchanged from before) plus a `--lx`/`--ly` pixel nudge on the label so
  it can point in a chosen direction away from the dot. The three northern
  emirates (Sharjah/Ajman/Umm Al Quwain, a few % apart on the real coastline) fan
  their labels in three different directions — left, straight up, and right —
  rather than all sitting centered above their dots, which is what would collide.
  A separate, tighter fan-out is defined for `max-width:640px` (smaller offsets,
  smaller font) since the dots themselves sit closer together in absolute px on a
  narrow screen even though the map itself is still full-bleed there too. Dropped
  the per-emirate taglines from the on-map labels (name only) — they don't fit at
  this density and the section subhead already sets the scene; the numbered-pin +
  legend-below system this replaces is gone entirely
  (`.coverage-legend`/`.coverage-legend__num`/`.coverage-legend__text` CSS and
  markup deleted, ~15 lines).
- Verified via headless-Chrome screenshot at 1600px (desktop) and 500px (mobile,
  which — unlike the previous card version — now shows the *entire* map in one
  glance since it's full width): all 7 names legible, no overlaps, no clipping at
  the RAK/UAQ top edge, 0px horizontal overflow at both sizes.

**2026-08-16, sixth follow-up: user supplied the real map (`assets/raw uae map.png`,
1672x941, a relief-style render they'd sourced/made themselves) and asked for it used
exactly, with cities marked on top** — replaces the tile-grid diagram below, which
was a reasonable fallback while no real map existed but is no longer needed now that
one does. Optimized to `assets/photos/optimized/uae_map.jpg` (`ffmpeg -vf scale=1100:-2
-q:v 3`, 97KB down from 2MB) and base64-spliced into `experiment.html` via a
placeholder-token Node script (`__IMG_uae_map__` → the real data URI) rather than
hand-editing the resulting 130k-char line directly, matching this project's established
safe pattern for big base64 inserts.
- **Shown true to the source file** — no grayscale/duotone filter, no recolor — same
  "owned creative, not stock" rule already applied to the hero video and meal-plan
  photos elsewhere on this page, and the user's "use this file exactly" was explicit
  about it besides.
- **7 numbered pins** (`.pin`, small maroon-and-brass circles, positioned by percentage
  `--x`/`--y` read directly off this specific image — Abu Dhabi on the broad sandy
  interior bottom-left, Dubai at the coastal island cluster, Sharjah/Ajman/Umm Al
  Quwain in a tight run up the coast, Ras Al Khaimah at the mountainous northern tip,
  Fujairah on the separate eastern/mountain coastline) rather than inline name+tagline
  labels — the northern cluster sits only a few percent apart on the real coastline
  (this is genuinely how close together those three emirates are), so text labels
  would collide the same way the second coastline attempt did below. Numbers are index
  references into the legend, not a ranked sequence, so this doesn't fall under the
  "numbered steps" anti-pattern the frontend-design brief warns about — a deliberate
  distinction made when invoking that skill for this pass.
- **`.coverage-legend`** below the map: a `repeat(auto-fit,minmax(150px,1fr))` grid of
  the same 7 numbers with name + tagline, reflowing from 4-ish columns down to 2 on
  mobile with no separate breakpoint markup needed.
- Deleted the entire tile-grid system (`.coverage-tiles`/`.coverage-tile`/
  `.coverage-tile--*`, ~30 lines of CSS) — confirmed no dangling references remained.
- Verified via headless-Chrome screenshot at desktop (1440px) and mobile (500px): pins
  land visibly on the correct part of the coastline at both sizes, legend reflows
  cleanly, no overflow.
- Not added to `assets/PHOTO_CREDITS.md` — user-supplied asset, not sourced stock, same
  reasoning as the meal-plans category photo entry above.

**2026-08-16, fifth follow-up: abandoned the literal-map approach entirely, rebuilt
`#coverage` as a "quilt of doors" tile grid** — three straight passes at hand-authored
coastline geometry (ribbon → archipelago of circles → single tapering polygon, all
below) still didn't read as a recognizable UAE map per repeated user feedback, and
kept eating rebuild cycles on the same root problem: freehand-guessed coastline
coordinates are inherently unreliable without a real map to trace against, which
this environment can't fetch (site stays fully self-contained, no external
requests). Invoked the `frontend-design` skill to reset the approach rather than
attempt a fourth coastline guess. Reframed the brief: the section's job is "show we
deliver to all 7 emirates," not "render an accurate coastline" — and the brand
already owns a strong, precise visual language for exactly this (the arched
two-leaf `.doormark` icon, used at the header/footer/intro/Royal-Catering-panel) that
a literal map was competing with rather than using.
- **New design**: 7 `<li class="coverage-tile">` elements (name + tagline + a small
  `.doormark` icon, reusing that exact SVG path byte-for-byte) placed on a **precise
  CSS Grid** (`grid-template-areas`, not guessed coordinates) that approximates real
  UAE adjacency and relative size without pretending to be a traced coastline: Abu
  Dhabi gets a 2×2 block (~87% of the country's real area), Ras Al Khaimah and
  Fujairah get 1×2/2×1 spans (medium), Sharjah/Ajman/Umm Al Quwain are 1×1 (smallest,
  matching their real cramped cluster). `grid-template-areas` is deterministic and
  exact, unlike hand-placed percentage coordinates — the class of bug from the last
  three attempts (overlap, self-intersecting polygons) structurally can't happen here.
- **Mobile**: same 7 `<li>` elements restack to a single column via a second
  `grid-template-areas` in the `max-width:759px` media query — no separate list
  markup needed, which also deleted the old parallel `.coverage-list` block entirely
  (was duplicating the same 7 emirates' content twice for two breakpoints).
- Kept `.coverage-features` (Wide Coverage / Reliable Service / On-Time Delivery /
  Customer First, reusing `.bowl-intro__icon`) unchanged below the grid.
- Verified via headless-Chrome screenshot at desktop (tile grid, no overlaps, whole
  section fits one ~1300px viewport) and mobile (500px width, clean single-column
  stack, no overflow).

**2026-08-16, fourth follow-up: coverage map redesigned once more** — the archipelago
version (below) still didn't read as a map per user feedback ("there is not map still"):
separate circles linked only by a dotted line looked like disconnected bubbles, not land.
Replaced with a single continuous low-poly landmass `<polygon>` (14 points, built by
offsetting the same 6 main-node centerline perpendicular by each node's former lobe
radius, tapering wide-to-narrow from Abu Dhabi to Ras Al Khaimah) plus a second, separate
small polygon for Fujairah — kept detached from the main shape rather than merged, since
Fujairah is genuinely cut off from the western coast by the Hajar mountains in real UAE
geography, so the gap reads as correct rather than broken. The dashed brass route-line
still crosses that gap, doubling as "the road through the mountains." Compass mark and
pin/label positions unchanged from the previous pass. Verified via screenshot: one solid
tapering coastline shape, no self-intersections, no overlap with labels.

**2026-08-16, third follow-up: coverage map redesigned again per user feedback
("small map, I see a random path")** — the first pass (below) used a uniform-width
stroked ribbon for the route, which read as a road/path rather than land. Replaced with
an "archipelago" model: 7 filled `land-lobe` circles (one per emirate, radius scaled to
real relative size — Abu Dhabi largest at r=11, Ajman/UAQ/RAK smallest at r=5.5) sitting
on a thin `ivory2` connecting vein, with the same dashed brass route line on top and a
small compass-rose SVG (top-right) as an explicit map signal. Container shrunk
substantially (`max-width` 920px→580px, `aspect-ratio` 4/3.3→1/1) and pin labels went
from 2-line stacked to single-line (`<b>Name</b><i>Tagline</i>`, smaller type) to stay
legible at the smaller scale — confirmed via headless-Chrome screenshot that the whole
section (heading + map + feature strip) now fits in a single ~1300px-tall viewport with
no overlaps or edge-clipping. **Verification note**: the screenshot workflow's own
`offsetTop` probe gave a stale number once here — measured at a short `--window-size`
height (400px) rather than the height actually used for the real screenshot, and this
page's scroll-runway spacer (`.bowl-steps`, sized with `vh`/`svh` units for its
scroll-pin timing, see below) is genuinely viewport-height-dependent, so the offset
shifted by over 1500px between the two. Fixed by always measuring offset at the same
`--window-size` intended for the actual capture.

**2026-08-16, second follow-up: "Delivery zones" (`#coverage`, `experiment.html`) rebuilt
from a plain wrapped list of emirate pill-badges into an illustrated route map**, styled
after a reference infographic the user dropped into `assets/` (`UAE presence.png`) — a
stock-style UAE map with a photo pin per emirate, dotted connecting routes, and a
4-icon feature strip. Reused the *structure* (pins + taglines + dotted route + feature
strip) but not the reference's own visuals (blue/teal 3D terrain render, stock city
photography) — no Maroon Door photography exists per-emirate, and the reference's palette
doesn't match Heritage Threshold, so it's rebuilt on-brand instead:
- **`.coverage-map`**: a stylized diagonal "ribbon" (thick round-cornered `ivory2` SVG
  stroke standing in for the coastline/road, no literal landmass polygon — safer than
  attempting cartographic accuracy) with a dashed `brass` route line down the middle and
  7 `.coverage-pin` markers (dot + name + one-line tagline, e.g. "Dubai — The City of
  Dreams") positioned via percentage `--x`/`--y` custom properties along it, in the same
  loose NE-diagonal order as real UAE geography (Abu Dhabi SW → Ras Al Khaimah N, Fujairah
  branching off toward the east coast). Taglines are generic descriptive marketing copy
  (matching the reference's own "The Capital" / "Adventure Awaits" style), not fabricated
  facts.
- **Real bug caught and fixed**: first coordinate pass packed Sharjah/Ajman/Umm Al Quwain
  (genuinely close together in real UAE geography) tightly enough that their label cards
  overlapped unreadably. Fixed by widening both the coordinate spacing for that cluster
  and the map's own `max-width` (760px → 920px) rather than shrinking label text alone —
  confirmed clean with no overlaps via headless-Chrome screenshot at desktop width.
- **Mobile fallback**: a separate `.coverage-list` (plain stacked rows, dot + name +
  tagline) swaps in under 760px via media query — same pattern already established
  elsewhere in this file for pinned/illustrated sections that can't survive a narrow
  column (see the bowl-story sticky section). `.coverage-map` is `display:none` there.
- **Feature strip** (`.coverage-features`: Wide Coverage / Reliable Service / On-Time
  Delivery / Customer First) reuses the existing `.bowl-intro__icon` component (48px
  ringed circle, 20px maroon stroke icon) byte-for-byte rather than inventing new icon
  styling — the "On-Time Delivery" icon is the literal same scooter/delivery SVG already
  used for "Timely Delivery" in the hero. `.sechead` gained a `h2 em` rule (oxblood
  italic accent, matching `.bowl-intro__headline em`'s existing treatment) and a scoped
  `.sechead__sub` class for the new subheading paragraph — deliberately *not* a bare
  `.sechead p` rule, since `.sechead` already has an eyebrow `<p>` sitewide and a bare
  tag selector would have picked that up too on every other section.
- **Verification tooling note**: this environment has no Playwright, so verification used
  `chrome.exe --headless=new --screenshot` on a throwaway copy in the scratch dir, same as
  this file's own established technique. Two real quirks hit and worked around this
  session, worth knowing next time: (1) `--headless=new` on Windows appears to enforce a
  hard ~485px minimum browser window width — requesting `--window-size` narrower than
  that (e.g. 390 for a phone) still renders at the ~485px floor, and the screenshot PNG
  gets saved at the *requested* (narrower) size, silently cropping the right edge of the
  actually-wider render; this looked exactly like a horizontal-overflow bug at first
  glance and wasn't one — confirmed via `document.documentElement.scrollWidth ===
  clientWidth` at several requested widths before ruling it out. Real mobile-width checks
  in this environment need `--window-size` at ≥485 to avoid the false crop. (2)
  `window.scrollTo()` from an injected script, combined with `--virtual-time-budget`,
  reliably produced a fully blank screenshot (even fixed-position elements failed to
  render) — root cause not fully isolated, but a CSS `body{margin-top:-Npx}` shift
  (pure paint-time positioning, no JS scroll event) sidesteps it entirely and was used
  for all the scrolled-down verification shots instead.

**2026-08-16 follow-up: "What We Serve" restructured again, this time from
three equal cards into a full-bleed feature layout** — a wide top banner for
Meal Plans, then a row split in two for Corporate Catering / Royal Catering,
per explicit user direction. Replaces yesterday's arched-card redesign
entirely (`.offer-card`/`.offer-card__frame`/arch-niche CSS removed; a card
layout doesn't have a natural "arch crop" once the photo fills the whole
panel edge to edge, so that signature element didn't carry forward — the
door motif continuity now lives in the `.doormark` watermark on the two
maroon panels instead).
- **Markup**: `#offers` is now a bare `<section>` (no `.wrap` class), same
  pattern already established by `.bowl-story` elsewhere in this file for
  full-bleed content — the eyebrow/h2 heading sits in its own inner
  `.wrap` div so it stays centered and line-length-limited, then two
  `.offers-row` divs follow as direct section children, spanning the full
  viewport width. Row 1 is a `1.35fr/1fr` split (photo | maroon text panel,
  the photo gets the larger share as the "hero" of the section); row 2 adds
  `.offers-row--split` for an even `1fr/1fr` split. A 1px brass hairline
  (`rgba(169,129,74,.3)`) separates every pane — between the two rows and
  between each row's two halves — reinforcing the "hardware, not
  decoration" brass rule from `BRAND.md` rather than a plain flat seam.
- **Meal Plans now uses real Maroon Door photography**, not a food photo at
  all: `assets/meal plans category.png`, supplied by the user — three
  branded meal-prep containers (grilled chicken & quinoa bowl, two fresh
  spinach garden salads) shot on white with visible "maroon door" labels.
  Shown at true color (`photo-frame--plain`), same reasoning as the hero
  video/photos in the entries below: this is owned creative, not stock, so
  the sitewide grayscale+duotone unification treatment doesn't apply to it.
  Not added to `assets/PHOTO_CREDITS.md` — that file tracks Wikimedia
  attribution obligations, which don't apply to the brand's own photography.
- **Real bug caught and fixed**: the new true-color photo initially rendered
  with a visible maroon/pink tint despite the `photo-frame--plain` class.
  Cause: `.photo-frame--plain img{filter:none}` (clears the grayscale
  filter) was already generic, but the *other* half of the plain treatment —
  `.photo-frame--plain::after{content:none}`, which removes the
  maroon/gold `mix-blend-mode:multiply` duotone layer — had only ever been
  written scoped to `.hero .photo-frame--plain::after`, because the hero
  was the only place `--plain` had been used before now. Outside `.hero`,
  the base (non-scoped) `.photo-frame::after` duotone rule was still firing
  on the new panel. Caught by screenshotting immediately after the first
  render rather than assuming the existing class would just work in a new
  context, and fixed by making the `::after{content:none}` override generic
  (matching the `filter:none` rule's scope) instead of hero-only — the
  correct fix, since "plain" should mean true-color everywhere it's used,
  not just in the one place it happened to be introduced.
- Corporate Catering keeps its existing stock buffet photo (`corporate.jpg`,
  still duotoned, still flagged in `PHOTO_CREDITS.md` as first in line to
  replace) — reused byte-for-byte via a Node script that extracted it from
  the old markup by its alt text rather than by position, specifically to
  avoid repeating yesterday's ambiguous-`indexOf` bug (see below).
- Royal Catering keeps its illustrated maroon treatment (radial-gradient +
  dot-pulse pattern, no real photo yet — still the same open item as
  before), now given more room to read as a genuine panel rather than a
  small icon block, with the `.doormark` shown large and translucent as a
  corner watermark instead of small and centered.
- CTAs upgraded from the small underlined `card-cta` text link to the full
  `.btn.btn--wa` pill button already used in the header — matches the
  larger scale of a full-bleed panel better than a text link would.
- **Second real bug this session, in the reconstruction script itself**:
  writing the Node splice, first pass located Corporate Catering's photo by
  searching for the generic wrapper markup instead of by its alt text —
  the same *category* of mistake flagged in the entry below (anchoring on
  something that isn't unique to the target), just in a different script.
  Caught before it did any damage this time by extracting into a temp file
  and checking the recovered base64's own tail against what was already
  known-good, before splicing anything — verify-before-use, not
  verify-after.
- **Verification**: same headless-Chrome preview-copy technique as the
  entries below (`.reveal` forced visible, intro overlay hidden). Checked
  section-scoped div/svg/a/section tag balance (14/5/3/1, all matched
  open=close) before ever rendering, then screenshotted desktop (1440px),
  mobile (390px and 375px), and a forced-hover state; confirmed
  `document.documentElement.scrollWidth === clientWidth` at both mobile
  widths (no horizontal overflow leak, the recurring bug class flagged
  repeatedly elsewhere in this file's history).

**2026-08-16: Meal Plans offer card swapped from a Wikimedia stock photo to a
real Maroon Door dish.** User asked for the stock "Healthy veggie bowl" photo
(Ella Olsson, CC BY 2.0, via `assets/photos/optimized/mealplan.jpg`) to be
replaced with a real "meal plans category" photo — used
`assets/photos/optimized/mealplan_mexican_rice_bowl.jpg` (one of the five
real dish photos the user dropped in for the ingredient-reveal gallery below,
see the 2026-08-15 entries), since it wasn't already shown anywhere above the
fold and its centered top-down plate composition suits the new arch-crop
best. `mealplan.jpg` is no longer referenced anywhere on the page — dropped
its row from `assets/PHOTO_CREDITS.md`. New alt text: "Mexican Rice Bowl
meal plan dish, with avocado, rice, black beans and corn"; `object-position`
reset to center (`50% 50%`) since the new photo is already well-centered,
unlike the old stock photo's `50% 60%` bias.
- **Real bug caught and fixed mid-edit, this one more serious than the
  previous session's typo.** Did the base64 splice with a Node script (same
  approach as the Dadi's Kitchen photo swaps) that located the image block
  via `indexOf('<div class="offer-card__frame"><div class="photo-frame">…')`
  — forgetting that after the redesign earlier in this session, *all three*
  offer cards now share that exact wrapper markup, not just Meal Plans.
  `indexOf` matched the **first** occurrence (Corporate Catering's), then
  kept searching forward for the Meal-Plans-specific end marker (its alt
  text), which doesn't exist on Corporate Catering's card — so the match
  span silently swallowed everything from Corporate Catering's photo through
  Meal Plans' photo: Corporate Catering's own closing tags, its
  `offer-card__body` (h3/p/CTA), and Meal Plans' own opening tags all got
  deleted along with it, leaving one merged card. Caught immediately by
  re-screenshotting after every edit (per this project's own verification
  habit) rather than assuming the script ran correctly — the Corporate
  Catering card was simply gone from the render. Fixed by re-encoding
  `assets/photos/optimized/corporate.jpg` fresh from disk and rebuilding the
  full card block (photo + h3 + p + CTA) from scratch, cloning the CTA's
  exact SVG markup from the surviving Meal Plans card via string-replace
  (`Meal%20Plans`→`Corporate%20Catering`) rather than retyping the WhatsApp
  icon path by hand. Re-verified with a section-scoped div open/close count
  (14/14) and a fresh screenshot showing all three cards correctly ordered
  and intact before calling it done.
  **Lesson for next time this file needs a similar splice**: once multiple
  elements share identical wrapper markup, anchor on something that's
  already unique to the target (its own alt text or href) for *both* the
  start and end of the match, not just the end.

**2026-08-15: "What We Serve" offer cards (Corporate Catering / Meal Plans /
Royal Catering) redesigned to feel less like a flat template grid.**
Hand-edited directly in `index-scroll-frames.html` (`.offers`/`.offer-card`
CSS block + the three card `<div>`s), no build step, per the file's own
no-build convention. Changes:
- **New signature element: arched "doorway niche" photo frames.** Each
  card's photo (or, for Royal Catering, the illustrated maroon block — it
  still has no real photo, see caveat below) now sits inset on the card's
  ivory field inside a rounded-top/flat-bottom arch shape
  (`border-radius:50% 50% 8px 8px/56px 56px 8px 8px` — the classic CSS
  "tombstone" trick: 50% horizontal radius on both top corners makes them
  meet at the exact center, forming a continuous dome across the full
  width). Ties directly into `BRAND.md`'s "arched two-leaf door" motif,
  which until now only showed up as the page-load intro, the hero backdrop,
  and the small `.doormark` icon — this is the first time the arch shape
  itself appears as a recurring card treatment.
- **Brass "ring pull" accent** (`.offer-card__frame::before`, a small
  ivory-filled brass-stroked circle straddling the top-center of each arch)
  — reuses the exact same brass-ring-on-door-leaf idea already present in
  the `.doormark` SVG (the two hardware rings on the door leaves), applied
  here as a literal hardware detail per `BRAND.md`'s rule that brass is for
  hardware, not decoration.
- **Editorial stagger**, desktop only (`@media (min-width:900px)`): Meal
  Plans sits 18px higher, Royal Catering 16px lower, breaking the
  three-equal-boxes grid rhythm. Gated behind a min-width so it never
  interacts with the grid's own `auto-fit` single-column collapse on
  narrow/mid viewports — confirmed via headless-Chrome screenshot that
  mobile still stacks cleanly at margin-top:0.
- **Royal Catering's dotted pattern now pulses slowly** (`dot-pulse`
  keyframe, opacity .65↔1 over 6s) instead of sitting fully static — cheap
  (opacity-only) motion so the one card with no real photo still has some
  life. Respects `prefers-reduced-motion`.
- **CTA arrow nudge**: `.card-cta::after{content:"→"}` slides 4px right on
  hover/focus-visible (added `:focus-visible` parity alongside `:hover`,
  which the old rule didn't have). Pure CSS, no HTML change — the pseudo-
  element became a third flex child in the existing `inline-flex` link.
- Card hover lift deepened slightly (`-6px`→`-8px` translateY, shadow
  strengthened) to read more clearly against the new stagger.
- All new motion respects `prefers-reduced-motion` (transitions removed,
  not just eased) — checked against the existing sitewide pattern rather
  than inventing a new one.
- **Verification**: no Playwright in this environment, so used
  `chrome.exe --headless=new --screenshot` on a throwaway preview copy
  (`.reveal` forced visible, intro overlay hidden — same technique used for
  the Dadi's Kitchen work above) at 1440px, 390px, and a forced-hover state.
  Also independently re-verified `<div>` open/close balance *within just the
  `#offers` section's text* (14 open / 14 close) after the edit, since the
  file's own naive tag-count regex (`build/check_tags.js`, written for the
  old `index.html`) chokes on this file's inline JS-built HTML strings
  (the gallery carousel's `renderBowlGallery()`) and gives useless
  whole-file mismatch numbers here — not a real problem, just the wrong
  tool for this file.
  - **Real mistake caught mid-edit**: the two photo cards' `<img>` tags sit
    on single ~176–250KB lines (the base64 data URI inline with the rest of
    the tag), so wrapping them required anchoring an `Edit` on a ~300-char
    prefix of the base64 rather than the whole line. First attempt at the
    Corporate Catering card's prefix was hand-transcribed from a truncated
    terminal readout and silently dropped a few characters in a long run of
    `A`s — the edit failed to match (safe failure, not a corruption), but a
    companion tail-edit on the same line *did* succeed, leaving one closing
    `</div>` with no matching opener. Caught by grepping the class-name
    occurrence count (expected vs. actual) rather than assuming success, and
    fixed by re-fetching the live line's exact current bytes before retrying
    the edit — the general lesson being: never hand-copy a boundary anchor
    out of a truncated tool readout when the source is fetchable fresh.
- Still true, unchanged by this pass: Royal Catering has no real photo
  (see caveat below) — the illustrated maroon niche is a placeholder for
  when one exists, not a permanent design choice.

**2026-08-15 follow-up: hero video was pillarboxed (empty bars left/right) on
wide screens — fixed.** `.hero .photo-frame video{object-fit:contain}`
(`index-scroll-frames.html`) was the culprit: on a hero box wider than the
video's 16:9 ratio (e.g. desktop, `min-height:min(92vh,880px)` caps the box
height while viewport width keeps growing), `contain` shrinks the video to
fit the box height and centers it, leaving empty space on both sides —
every other `.photo-frame` on the page uses `object-fit:cover` instead,
this was the one exception. Changed to `cover` to match; video now fills
the box edge-to-edge, cropping top/bottom instead of pillarboxing.

**2026-08-15: hero video swapped for a new clip.** User dropped a new video
into `assets/video/source/`, renamed it `hero_main.mp4` (the old one archived
as `hero_main_1.mp4`/`hero_main_2.mp4` alongside it, 8.3s/1280×720/h264+aac,
10.6MB). Re-generated `assets/video/optimized/hero_main.mp4` with the same
`ffmpeg -c:v copy -an -movflags +faststart` treatment established earlier
(audio dropped, faststart, pixel-identical video stream — no re-encode, per
the earlier "keep it as original" preference) and spliced its base64 into
the `.hero .photo-frame video source` tag in `index-scroll-frames.html`
(the active hand-edited file, no build step). Verified the embedded base64
decodes byte-identical to the optimized file. `build/template.html` was
**not** touched — it's been inert since before the pivot to
`index-scroll-frames.html` and never had the hero-video markup at all (still
shows the old static-photo hero), so there's nothing there worth keeping in
sync for an asset-only swap.

**2026-08-15: hero swapped from static photo to video, HTML text overlay removed.**
User dropped `hero video.mp4` (1280×720, 10s, h264+aac) into the repo root; it's now
archived at `assets/video/source/hero_main.mp4`, and a web-optimized copy — audio
track stripped (autoplay/muted/loop background, no reason to ship it) and
re-encoded at `-crf 26` — lives at `assets/video/optimized/hero_main.mp4` (2.7MB →
1.7MB), base64-inlined into `.hero .photo-frame` the same way the old hero photo
was (`<video autoplay muted loop playsinline>` in place of the old `<img>`). The
entire `.hero-content` block (eyebrow, h1, paragraph, WhatsApp/menu CTA buttons)
was deleted, per explicit user confirmation to remove everything rather than just
the headline — the source footage itself carries its own baked-in title-card text
("Healthy Salad Bowl" fading in partway through the loop), so the HTML text layer
was redundant on top of it. Also removed as dead CSS since nothing else used them:
`.hero-content`, `.hero-content .eyebrow/h1/h1 em/p`, `.hero-ctas`, and the
`.hero .photo-frame--plain::after` left-to-right dark scrim (existed only to keep
the old HTML text legible over the photo — no longer needed with no text and a
video in motion). `.photo-frame img{...}` and `.photo-frame--plain img{filter:none}`
rules gained a `video` selector alongside `img` so the grayscale/plain-color
treatment logic still applies to the new element type.
**Real bug caught and fixed**: deleting the hero-scoped scrim override
(`.hero .photo-frame--plain::after`) left the *base* `.photo-frame::after` rule
in effect for the hero — a maroon/brass duotone gradient with
`mix-blend-mode:multiply`, meant for the sitewide stock-photo unification
treatment, not for on-brand video — visibly tinting the video reddish-brown in
the first verification screenshot. `.photo-frame--plain` alone only zeroes the
`img` grayscale filter, it doesn't touch the separate `::after` pseudo-element,
so the hero needs its own override same as `.dish .photo-frame::after{content:none}`
does for true-color dish photos. Fixed by adding
`.hero .photo-frame--plain::after{content:none}`; confirmed removed via a second
screenshot pass. Verified via Playwright
(`video.paused === false`, `readyState === 4`, `.hero-content` absent from the DOM)
and screenshots at 1440px and 390px, past the intro overlay's skip button.
No other part of the page referenced the old hero photo (no OG/meta image tag
pointed at it), so nothing else needed updating.
**2026-08-15 follow-up: video re-encode reverted, now a stream copy.** User
flagged the `-crf 26` re-encode as adding a visible tint ("keep the video as
original") — re-encoding through libx264 can shift color range/levels even
with the CSS overlay bug above already fixed, so rather than chase encoder
settings, `assets/video/optimized/hero_main.mp4` is now generated with
`ffmpeg -c:v copy -an -movflags +faststart` — the H.264 bitstream is copied
untouched from `assets/video/source/hero_main.mp4`, only the audio track is
dropped and the moov atom moved for faststart. Guarantees pixel-identical
color/quality to the original; size only drops from 2.7MB to 2.4MB (audio
removal alone) instead of the earlier 1.7MB, a fine tradeoff for correctness.

**2026-08-15: header now hidden at top, reveals as a glass panel on scroll.**
`.site-header` changed from `position:sticky` (always visible, solid maroon
gradient, occupying real layout height above the hero) to `position:fixed`
(overlays content, no longer pushes the hero down — the hero video now runs
truly full-bleed from the very top of the viewport). Default state is
`opacity:0;transform:translateY(-100%);pointer-events:none` — fully hidden and
non-interactive until scrolled. Reuses the existing `.is-scrolled` class /
scroll listener (`scrollY > 8`, already wired for the old box-shadow-on-scroll
effect) to reveal it, so no new JS was needed. Background changed from the
solid `linear-gradient(135deg,#3D0101…)` to a translucent maroon
(`rgba(61,1,1,.46)` + two faint radial highlights) with
`backdrop-filter:blur(18px) saturate(160%)` — a frosted-glass panel tinted
maroon, per request, rather than a solid bar. Because the header no longer
occupies flow height, anchor-nav targets (`#menu`, `#contact`) would otherwise
land flush under the fixed header once it's visible mid-scroll — added
`scroll-padding-top:84px` on `html` (matches the header's own height) to
compensate. `prefers-reduced-motion` gets an instant (`.01s`) opacity
transition instead of the slide, consistent with the fade/slide reductions
used elsewhere on the page. Verified via Playwright: header confirmed
`opacity:0`/`translateY(-100%)` at `scrollY:0`, then `opacity:1`/no transform/
`backdrop-filter:blur(18px)…` after a 600px scroll, plus screenshots of both
states.

**2026-08-15 pivot: active file is now `index-scroll-frames.html`.** Per user
instruction, `index.html` was deleted and work no longer goes through the
`build/template.html` + `node build/build.js` pipeline — `index-scroll-frames.html`
is hand-edited directly, no build step. (`build/template.html` and `build.js`
are left in place, untouched, in case `index.html` is ever needed again — just
not the active file.) `index-scroll-frames.html` swaps the old pinned
wedge-fill bowl animation for a **scroll-scrubbed frame sequence**: a
`<canvas>` painting one of a folder of pre-rendered frames per scroll position
(`assets/frames_hq/optimized/frame_NNN.jpg`), inside a sticky sidebar layout —
`.bowl-media` (photo, sticky, left column) and `.bowl-text-col .sechead`
(eyebrow/heading/outro, sticky, right column) are pinned together via matched
`min-height`/`top` formulas keyed off `.bowl-media`'s own aspect-ratio height;
see the comment above `.bowl-text-col .sechead` in the file for why the two
heights must track each other (mismatched heights = the two sticky boxes
release at different scroll points and visibly drift apart). `.bowl-step` items
were removed per an earlier user request (kept as dead CSS/JS, ready to
reinstate) so `.bowl-steps` is currently just an empty scroll-runway spacer.
Page also has its own intro (`#intro-anim-video`, a velvet-cloth logo reveal
with a "SKIP" button), replacing the old two-leaf door-photo split animation.
- **2026-08-15: added `.bowl-gallery`**, a horizontal-scroll strip of 6
  placeholder food cards (small square thumbnails, brass photo-icon SVG, no
  real photos yet) sitting inside `.sechead` between the `<h2>` and
  `.bowl-outro` — i.e. between "Every Bowl, Built Ingredient by Ingredient"
  and "Same care, every single bowl." Labels are generic bowl categories
  (Protein/Veggie/Grain/Green/Power/Balanced Bowl), not fabricated specific
  dish names — the meal-plan bowls don't have published proper names the way
  Dadi's Menu dishes do. Kept deliberately compact (92px thumbnails, ~140px
  total added height) specifically because `.sechead`'s height is
  load-bearing for the sticky-pin timing described above — a large card
  gallery would have pushed `.sechead` taller than `.bowl-media` and caused
  the drift bug the height-matching code was written to prevent. Verified via
  Playwright screenshot at 1400px and 390px (had to force-click past the
  intro video overlay to reach the section) and confirmed no page-level
  horizontal scroll leaked from the gallery's internal `overflow-x`.
  **Photos are placeholders** — swap a `.bowl-gallery__photo` div for a real
  `<img>` once real meal-plan photography exists; this file has no build
  step, so there's no `photoMap`/`__IMG_*` token wiring to do, just edit the
  HTML directly.
- **2026-08-15: first 2 of the 6 gallery cards now use real photos.** User
  dropped `Green lemon chicken.jpeg` and `spinach feta chicken.png` into a
  new `assets/meal plan image/` folder; resized/recompressed with `ffmpeg`
  (`scale=-2:'min(480,ih)'`, `-q:v 4`, matching the resize convention in
  `ARCHITECTURE.md`) to `assets/photos/optimized/mealplan_green_lemon_chicken.jpg`
  and `mealplan_spinach_feta_chicken.jpg` (358×480, ~35–40KB each, down from
  ~3MB/900KB source — these are 92px thumbnails, didn't need multi-MB
  sources). Originals left untouched in the user's own folder. Captions are
  the filenames title-cased per the user's instruction ("Green Lemon
  Chicken", "Spinach Feta Chicken") — real dish names now, not the generic
  bowl-category placeholders. `.bowl-gallery__photo` gained `overflow:hidden`
  + an `img{object-fit:cover}` rule so photos crop cleanly into the square
  thumbnail regardless of source aspect ratio. Remaining 4 cards
  (Grain/Green/Power/Balanced Bowl) are still icon placeholders — only 2
  photos exist so far.
- **2026-08-15: gallery enlarged + hover/focus detail card, all 5 slots now
  real photos.** User dropped 3 more photos (`Chicken Hakka noodles.jpeg`,
  `Mexican Rice Bowl.jpeg`, `Pad Thai noodles with fish cake.jpeg`) — same
  `ffmpeg` treatment as before but bumped to `scale=-2:'min(640,ih)'` `-q:v 3`
  (the old 480px/q4 export was fine for a 92px thumbnail but too soft once
  hover-zoomed) into `assets/photos/optimized/mealplan_chicken_hakka_noodles.jpg`,
  `mealplan_mexican_rice_bowl.jpg`, `mealplan_pad_thai_fish_cake.jpg`
  (~65-88KB each); the original 2 photos were re-exported at the same
  settings for consistency. Dropped the 4 leftover generic-icon placeholder
  cards — with 5 real photos the mixed real/placeholder row looked
  unfinished, and appending a 6th `<li>` later is trivial if a 6th photo
  shows up.
  - **Cards sized up** 92px to 150px (`.bowl-gallery__item`/`__photo`).
  - **Hover/focus reveals a detail card**: `.bowl-gallery__detail`, absolutely
    positioned `inset:0` inside `.bowl-gallery__photo`, a maroon-ink scrim
    (`linear-gradient(165deg,rgba(42,20,15,.68),rgba(42,20,15,.94))`) with
    the dish name (Fraunces italic) plus Ingredients/Calories fields (brass
    uppercase label, warmlight value), fading in via opacity while the
    photo underneath zooms (`transform:scale(1.14)` on the `img`, clipped by
    the box's own `overflow:hidden` - deliberately NOT a true popout: the
    gallery track has `overflow-x:auto`, and per spec a lone `overflow-x`
    forces `overflow-y` to compute as `auto` too, so anything that actually
    escaped the box would just get clipped by the track instead of floating
    free). `tabindex="0"` on `.bowl-gallery__photo` is what makes this
    reachable by keyboard and (via tap-to-focus) touch, since `:hover` alone
    never fires on touch devices.
  - **Real bug caught and fixed**: the pre-existing caption rule
    `.bowl-gallery__item p{...color:var(--maroon)...font-size:.72rem...}`
    is a descendant selector, so it was also matching the new `<p>` tags
    inside `.bowl-gallery__detail` (nested one level deeper) at the same
    specificity as `.bowl-gallery__detail-name`/`-meta` (0,0,1,1) - and it
    happened to win, so the hover card's name/labels were rendering in dark
    maroon at .72rem instead of ivory/warmlight at their intended sizes -
    nearly illegible against the dark scrim. Confirmed via
    `getComputedStyle` (showed `rgb(92,11,11)` where `rgb(242,231,226)` was
    expected) before guessing at a fix. Fixed by scoping the caption rule to
    `.bowl-gallery__item > p` (child combinator - the caption `<p>` is a
    direct child of the `<li>`, the detail-card `<p>`s are nested two levels
    deep inside `.bowl-gallery__photo > .bowl-gallery__detail`), which
    doesn't change its specificity but stops it matching the nested ones.
  - **Ingredients and calories are placeholder text** ("add details" /
    "add kcal", visibly a TODO in the UI itself) - real values need to come
    from the user; nothing was invented, per the sitewide no-fabricated-
    content rule (`CLAUDE.md`/`BRAND.md`), which applies doubly hard to
    calorie/nutrition claims on a food business's site.
  - Verified via Playwright: normal + hovered states at 1400px, mobile at
    390px, a cropped close-up of the hover state to check text legibility,
    and `getComputedStyle` to confirm the color-override fix actually took -
    not just eyeballing a screenshot. No page-level horizontal scroll leak.
- **2026-08-15: gallery converted from a scroll strip to a rotating 3-slot
  carousel; ingredients dropped from hover, calories kept (approximate).**
  Per user request. `#bowlGalleryTrack` now always has exactly 3
  `.bowl-gallery__item` slots in the DOM (down from 5) - JS
  (`bowlGalleryDishes` array + `renderBowlGallery()`, in the main script
  block right after the `.bowl-step` IntersectionObserver) cycles which 3 of
  the 5 dishes occupy them, crossfading (`opacity`, `.is-fading` class on the
  track) every 4.2s. Pauses on hover/focus of the track (so the calorie card
  you're mid-read on doesn't get swapped away) and is skipped entirely under
  `prefers-reduced-motion` (an auto-advancing carousel is exactly the kind
  of motion that setting exists to turn off) - in both the paused-forever
  and no-JS cases the 3 slots just show the first 3 dishes statically, since
  the HTML ships pre-filled with real `src`/name/calorie values rather than
  empty placeholders waiting on JS (avoids the "empty `<img src>` briefly
  requests the page itself" footgun, and degrades gracefully with JS off).
  - **Hover/focus card now shows Calories only** - dropped the Ingredients
    line per this request; `.bowl-gallery__detail-meta` markup/CSS is
    otherwise unchanged (brass uppercase label, warmlight value), just one
    field instead of two, so there's more breathing room and the name got
    bumped up a touch (`.86rem` to `.92rem`).
  - **Calorie figures are approximate placeholders** - user explicitly asked
    for "approximate for now" (Green Lemon Chicken ~480, Spinach Feta
    Chicken ~450, Chicken Hakka Noodles ~580, Mexican Rice Bowl ~520, Pad
    Thai Noodles with Fish Cake ~560 kcal), estimated from typical
    composition for each dish type, not measured - real numbers should
    replace these before launch, same caveat as the ingredient-photo
    placeholders elsewhere on this page.
  - **Real bug caught and fixed**: fixing the 3-slot layout at
    `flex:0 0 150px` per card (3x150px + 2x16px gap = 482px) fit the 520px
    desktop column fine but blew 112px past the ~350px mobile column once
    the old scroll-strip's `overflow-x:auto` (which used to just let you
    scroll past the overflow) was removed - the whole page gained a
    horizontal scrollbar on mobile. Caught by explicitly checking
    `document.documentElement.scrollWidth - clientWidth` on a real 390px
    Playwright viewport (the desktop-viewport check from the previous
    session's verification had been silently passing this whole time and
    said nothing about mobile). Fixed by switching cards to
    `flex:1 1 0;max-width:150px;min-width:0` and the photo box to
    `width:100%;aspect-ratio:1/1` instead of a fixed 150x150 - 3 cards now
    always fill whatever width `.sechead` actually has, capped at 150px on
    wide screens, shrinking together (not overflowing) on narrow ones.
    Re-verified: 0px overflow on both 1400px and 390px after the fix.
- **2026-08-15: gallery rotation changed from crossfade to a genuine slide,
  per user request ("it should move from left to right, not fade in and
  fade out").** Rebuilt as a standard infinite-marquee-style carousel rather
  than a repaint: `#bowlGalleryTrack` (the `<ul>`) now lives inside a new
  `.bowl-gallery__viewport` (`overflow:hidden`, JS-sized to exactly 3 cards'
  width). Each tick: build a real `<li>` for the next dish and append it to
  the track (landing just past the clipped right edge, invisible), transform
  the track `translateX(-1 card+gap)` with the CSS transition doing the
  actual slide (old card exits left, new one enters from the right), then on
  `transitionend` remove the now-offscreen first `<li>` and reset the
  transform to 0 with transitions briefly disabled - removing the first flex
  child shifts everything left by exactly the distance just reset, so the
  snap is imperceptible. Always slides the same direction, never jumps
  backward (ruled out a simpler "3 fixed window positions, snap on wrap"
  approach for exactly that reason). Verified with
  `page.waitForFunction(...item count === 4...)` to catch the actual
  mid-slide frame and screenshot it (confirmed: exiting card cropped left,
  incoming card's sliver cropped right, both cleanly clipped by the
  viewport) - not just checking the settled before/after states.
  - **Card sizing moved from CSS to JS** (`sizeBowlGallery()`, `--bg-card-w`
    custom property) because it has to produce a genuinely fixed px value
    that stays identical whether the track holds 3 cards or a transient 4th
    mid-slide - the previous turn's `flex:1 1 0` fluid approach recomputes
    per child count, which would resize every card the instant a 4th was
    appended instead of only sliding. Capped at 150px, same as before.
  - **Second real bug, same underlying disease as before**: after the
    rewrite, mobile overflow reappeared at 47px. Chased it by walking the
    ancestor chain's `getBoundingClientRect().width` from the viewport up to
    `<html>` (not just eyeballing the screenshot) - `.bowl-grid` measured a
    correct 390px, but its own child `.bowl-text-col` measured 436.75px,
    *wider than its own grid track*. Cause: `.bowl-text-col` is a CSS Grid
    item with no `min-width:0`, so it kept the browser default
    `min-width:auto` (content-based minimum) - and once the gallery viewport
    became a genuinely fixed-px-width descendant (needed for the slide
    math above), that fixed width propagated up as a min-content
    contribution and force-grew the whole grid item past its `1fr` track.
    (Briefly misdiagnosed this as a webfont-loading timing issue first -
    `document.fonts.status` was still `"loading"` when `sizeBowlGallery()`
    first runs, which is real and worth guarding for its own sake, so that
    fix - re-running `sizeBowlGallery()` on `document.fonts.ready` - is
    still in the code, but it did not actually fix this particular
    overflow, which is why the chain-walk was needed to find the real
    cause.) Fixed with `min-width:0` on `.bowl-text-col` - the standard
    override for the grid/flexbox "auto minimum size" gotcha. Re-verified
    0px overflow at both 1400px and 390px, plus a full ancestor-chain
    re-check showing every element from `.bowl-gallery__viewport` up to
    `.bowl-grid` at a consistent 350px/390px.
- **2026-08-15: Dadi's Kitchen menu section reworked** (`.dishes`/`.dish`,
  hand-edited directly in `index-scroll-frames.html` per the no-build-step
  convention above — note this predates and is unrelated to the pivot's own
  scroll-frame work, just landed in the same file):
  - **Photos kept true-color.** `.dish .photo-frame::after{content:none}` drops
    the sitewide maroon/gold duotone overlay for this section specifically, and
    each `<img>`'s wrapper got the existing `photo-frame--plain` class (already
    used by the hero) to drop the `grayscale()` filter too — same reasoning as
    the ingredient-bowl section above: food needs to read as actual food here,
    not part of the unify-seven-mismatched-stock-photos system.
  - **"Order this" now aligns across cards regardless of description length.**
    `.dishes` is a flex row; flex's default `align-items:stretch` sizes every
    `.dish` to the row's tallest card, and `.dish` itself is
    `flex-direction:column` with `.card-cta{margin-top:auto}` — so the CTA
    always sits at the same baseline even when one dish's description wraps to
    2 lines and another wraps to 4. (It was a CSS grid before, with no height
    equalization, so a short description left its button visibly higher than
    its neighbors' — the bug the user's screenshot caught.)
  - **Expanded 3 dishes to 5, converted to horizontal scroll.** Two more real
    dishes pulled from the live site's [full menu page](https://www.themaroondoor.ae/menu/full-menu)
    (same real-content-only rule as the original three): **Butter Chicken**
    ("Classic tandoori chicken cooked in a velvety tomato-butter gravy, mildly
    spiced and creamy") and **Seekh Kebab** ("Minced meat blended with herbs
    and spices, skewered and grilled for a juicy, smoky kebab experience").
    That page actually lists 16 Main Course dishes — user explicitly asked for
    only the top 5 here, with a new **"Explore Dadi's Full Menu" button**
    (`.menu-cta`, `href="#"` placeholder) below the row for the rest, a page
    that doesn't exist yet ("which we can make later" — user's words).
    `.dishes` changed from a `<div>` grid to a `<ul>`/`<li>` horizontal-scroll
    track using the same bleed/snap pattern as `.bowl-gallery__track` above
    (negative margin matched to `.wrap`'s own padding, `scroll-snap-type:x
    mandatory`, hidden scrollbar) — last card partially crops at the edge as
    the "more to scroll" signal.
  - New source photos: `assets/photos/optimized/dish_butterchicken.jpg`
    (Chicken Makhani, CC BY-SA 2.0, stu_spivack) and `dish_seekh.jpg` (Seekh
    Kebabs on Fire, CC BY-SA 4.0, Sumitmalhotra), both from Wikimedia Commons —
    same placeholder-stock caveat as the rest of `PHOTO_CREDITS.md`. This file
    has no build step, so the base64 `data:` URIs were spliced into the HTML
    directly (a small Node script did the byte-safe splice — the file's
    3.5MB+ base64 image lines are too large for normal line-based editing
    tools). `build/template.html` and `build.js` also got the identical fix
    applied, purely to keep that inert copy consistent in case it's ever
    needed again — not because anything currently reads it.
  - Verified via headless-Chrome screenshot at desktop and mobile widths (no
    Playwright/Puppeteer installed in this environment — used
    `chrome.exe --headless=new --screenshot` directly, with a throwaway
    preview copy that force-shows `.reveal` elements and hides the intro
    overlay + scroll-frame section, since neither renders meaningfully in a
    single static capture without real scroll events).
- **2026-08-15: Dadi's Kitchen round 2 — arrows + 2 more dishes (7 total).**
  Follow-up to the above, same file/section:
  - **Prev/next arrow buttons** (`.dish-nav`, `.dishes-carousel` wrapper around
    the `<ul>`), styled with the exact same gradient as `.site-header`
    (`linear-gradient(135deg,#3D0101 0%,#4A0102 55%,#5E0101 100%)` plus its two
    radial highlights) per the user's ask to "match the colour with the top
    pane" — reuses the header's own chrome color rather than introducing a new
    one. Buttons scroll by one card-width + gap via `scrollBy({behavior:
    reduce ? 'auto' : 'smooth'})`, disable/hide themselves at each end via
    `:disabled{opacity:0;visibility:hidden}`, hidden entirely under 760px
    (native touch swipe already works there, arrows would just be clutter).
  - **Real bug caught and fixed**: the disabled-state check first used a bare
    `scrollLeft <= 4` epsilon, which left the prev arrow visibly stuck "on"
    at the true rest position. Root cause: `scroll-snap-type:x mandatory` on
    `.dishes` settles its native resting `scrollLeft` at the track's own
    `padding-left` (56px at desktop, not 0), because the container's leading
    padding is part of the scrollable content and the first card's
    `scroll-snap-align:start` point sits right after it — confirmed by
    injecting a debug probe into a headless-Chrome page load rather than
    guessing (`scrollLeft` read back as exactly the computed `padding-left`
    value at two different viewport widths). Fixed by comparing against
    `getComputedStyle(dishTrack).paddingLeft`/`paddingRight` instead of a
    fixed number.
  - **Expanded 5 dishes to 7**; 5 stay visible at a time (unchanged card
    width), the other 2 scroll into view via the new arrows. Two more real
    dishes from the same [full menu page](https://www.themaroondoor.ae/menu/full-menu):
    **Malai Tikka** ("Creamy, melt-in-the-mouth chicken marinated with fresh
    cream, cheese, and mild spices, grilled to perfection") and **Nihari**
    ("Slow-cooked meat stew simmered overnight in a deeply spiced gravy,
    known for its rich and hearty taste"). New photos:
    `dish_malaitikka.jpg` (Chicken Malai Tikka, CC BY-SA 4.0, Renupradhul) and
    `dish_nihari.jpg` (Murgh Nihari, **CC0**, Miansari66) — both Wikimedia
    Commons, same placeholder-stock caveat, credited in `PHOTO_CREDITS.md`.
    Spliced in via the same byte-safe Node-script approach as round 1 (still
    hand-editing `index-scroll-frames.html` directly, no build step); the
    identical markup/CSS/JS also went into `build/template.html`/`build.js`
    to keep that inert copy in sync.
  - Verified with the same headless-Chrome approach as round 1, plus a
    scripted `scrollLeft = scrollWidth` jump to confirm the far end (Malai
    Tikka/Nihari visible, next arrow hidden, prev arrow reappeared) since a
    static screenshot can't otherwise show the scrolled state.
- **2026-08-15: Dadi's Kitchen round 3 — 4 visible instead of 5, both arrows
  always shown.** Two corrections per user feedback on round 2:
  - `.dish` flex-basis widened `clamp(190px,25vw,224px)` → `clamp(220px,
    24vw,272px)` so 4 cards (not 5) fill the track width at desktop.
  - Dropped the disable/hide-at-scroll-boundary behavior entirely — the user
    only ever saw the right arrow, never the left, because round 2's disabled
    state was (correctly, per its own logic) true at the true rest position.
    Rather than re-tune that logic, simplified it away: both arrows are just
    always visible now, `scrollBy` naturally no-ops past either end so a
    boundary click is harmless. Removed the now-dead `updateDishNav`/
    `getComputedStyle(...).padding*` code and the `.dish-nav:disabled` CSS
    rule in both `index-scroll-frames.html` and `build/template.html`.
- **2026-08-15: Dadi's Kitchen round 4 — arrow position, heading alignment,
  infinite loop.** Three more fixes per user feedback on round 3:
  - **Arrows were overlapping the photo circles.** Root cause: `.dishes`'
    negative `margin-inline` (bleed) and matching positive `padding-inline`
    exactly cancel out, so the first/last card's visible edge sits at `x:0`
    of `.dishes-carousel` — the wrapper the arrows are positioned against.
    `.dish-nav--prev`/`--next` were at `left:4px`/`right:4px`, i.e. 4px
    *inside* that edge, landing right on top of the circular photo. Moved to
    `left:-52px`/`right:-52px` — fully outside the card row (44px button + 8px
    gap), floating in the `.wrap` padding gutter within the maroon card at
    desktop widths, only mildly overhanging the card's rounded edge near the
    760px cutoff where arrows disappear anyway.
  - **Descriptions started at different heights** when a dish name wrapped to
    2 lines (Raan Musallam) vs 1 (everything else) — the `<h3>` itself had no
    reserved height, so the `<p>` below it started lower on wrapped cards
    even though the CTA at the bottom was already aligned. Fixed with
    `.dish h3{line-height:1.3;min-height:2.6em;display:flex;align-items:
    center;justify-content:center}` — reserves 2 lines' worth of height on
    every card and vertically centers 1-line titles inside it, so `<p>`
    always starts at the same y regardless of title length.
  - **Infinite loop.** Clicking next at the last card now jumps back to the
    first (and prev at the first jumps to the last) instead of just stopping
    — `scrollDishes()` checks the boundary (using the same padding-aware
    threshold from round 2's bugfix, since scroll-snap's native rest
    position is `scrollLeft==padding`, not 0) and calls
    `scrollTo({left:0 or max, behavior})` instead of `scrollBy()` when at an
    edge. Verified the branch logic and both wrap targets directly via a
    headless-Chrome debug probe (`scrollTo({behavior:'auto'})` resolves
    start→56 and end→1016 as expected) rather than trusting a screenshot —
    `behavior:'smooth'` doesn't visibly animate under
    `--virtual-time-budget`'s virtual clock, a headless-testing quirk, not a
    real-browser bug, so the animated case couldn't be screenshot-verified
    directly and the underlying scroll-target logic was checked instead.

---

`index.html` (**deleted 2026-08-15**, kept below for history) was a working,
single-file build of the **Heritage Threshold** homepage
concept. It has:
- Real content pulled from the live site (offerings, 3 signature dishes, 7-emirate
  coverage, founders' quote, hours, WhatsApp numbers) — nothing fabricated.
- **Hero is now real Maroon Door branded photography** — the user has been
  dropping numbered campaign shots (`hero1.png`, `hero2.png`, `hero3.png`) into
  the repo root one at a time and picking which becomes the live hero; the
  pipeline slot for "whatever's current" is always
  `assets/photos/source/hero_main.png` / `optimized/hero_main.jpg`, and
  whichever one isn't picked gets archived under a descriptive name rather than
  deleted. Currently live: **hero3**, the "Corporate Catering" shot — beef
  biryani in an engraved copper pan next to a branded box, red velvet backdrop.
  This one has *no* text baked into the image (unlike hero1), so unlike the
  brief hero1 era, the hero still carries its own HTML headline/eyebrow/subcopy
  — positioned left, over a left-to-right scrim, in the image's own dark empty
  space. Whichever hero is live is shown at its own color (no grayscale/multiply
  duotone) since these are already correctly graded — that treatment exists to
  unify inconsistent *stock* photos, not to touch on-brand creative. Door-intro
  is unchanged (still splits `hero_door.jpg`, the literal door photo — a
  different asset for a different job: it's *the door*, not *what's behind it*).
  - Archived alternates, not deleted, either could come back or feed other
    sections: `assets/photos/source/hero_royalcatering_alt.png` (hero1 — logo +
    tagline baked in, good if a section ever wants pre-composed marketing art
    rather than a raw photo) and `hero_mealplan_alt.png` (hero2 — meal-prep
    trays, branded bag/box; a plausible Meal Plans offering-card photo).
- 6 remaining stock photos (dishes, corporate, saffron) still duotoned for
  cohesion — see caveat below, now smaller in scope since the hero is real.
- **Repaletted 2026-08-12**: colors sampled directly from the real logo's pixels
  (a near-black blood-red, `#3D0101`→`#5E0101`) rather than an invented
  maroon+gold combo. Gold demoted to a restrained "brass" used only for literal
  hardware (door rings, seam lines, hairlines) — see `BRAND.md` for the full
  token table and the reasoning.
- The real Maroon Door logo (found in this folder as a dropped-in PNG, now at
  `assets/brand/`), used in the header, footer, and the door-open intro. Header
  background is a wave gradient matching the logo's own background, logo centered
  in a 3-column grid header.
- A page-load animation: the two-leaf door photo splits open on load to reveal the
  hero behind it. Pure-CSS driven (plays even if JS fails), skippable by click,
  and off entirely for `prefers-reduced-motion`.
- Scroll reveals, hover states, sticky header + mobile thumb-bar.
- One-tap WhatsApp ordering on every dish and offering card (prefilled message per
  item), not just a generic "contact us".
- A scroll-driven "Every Bowl, Built Ingredient by Ingredient" section (between
  Offers and Dadi's Menu): a pinned circular bowl fills in clockwise, one real
  ingredient wedge at a time, as 7 ingredient callouts scroll past beside it —
  built from the user-supplied `animation.avif` (a grain-bowl photo with alpha
  already cut around the dish), no image segmentation needed since the wedges are
  just angled CSS conic-gradient masks over the one photo. Below 760px this
  simplifies to a static fully-revealed photo + plain ingredient list (a pinned
  image and scrolling text can't share one column without one covering the
  other — confirmed by screenshot, not assumed). Full reduced-motion fallback.
  Deliberately kept true-to-life color (only a light saturation/contrast nudge,
  not the sitewide grayscale+multiply duotone) — the point of this section is
  fresh produce arriving in real color; duotoning it would undercut that.
  Pin is centered by making `.bowl-stage-col` a `height:100svh` sticky flex box
  that centers its own content — **not** `top:50%;transform:translateY(-50%)`,
  which was tried and reverted: a transform applies at rest too, so that version
  hoisted the bowl ~half its height up into the section heading whenever the
  section was approached but not yet pinned. Verified by measuring bowl/heading
  box intersection across the whole scroll range at 4 viewport sizes (0px
  overlap everywhere). Both fallbacks must reset `height:auto` alongside
  `position:static`, or they inherit a 100svh empty box.
  **The `.sechead` (eyebrow + h2) now lives inside `.bowl-stage-col` itself**,
  pinned together with the bowl rather than scrolling away above it — the
  heading stays on screen for the whole ingredient sequence, only releasing
  (with the bowl) once the last step's payoff has been seen. Bowl shrunk to
  `min(42vw,300px)` and the in-context heading resized down
  (`clamp(1.4rem,2.4vw,2rem)`) so the combined block fits one viewport without
  clipping — verified via screenshot at the exact entry framing that prompted
  this (868px-tall viewport, bowl previously cut off at the bottom edge).
  Steps also now fade *directionally*: already-passed steps drop to opacity
  .1 (`.bowl-step.is-past`, JS compares each step's index against the active
  one), upcoming steps stay at the original .4 dim — makes the scroll
  direction legible instead of a symmetric dim on both sides of "active".
  `.bowl-stage-col` is now an **auto-height** sticky box (`position:sticky;
  top:…`), not `height:100vh`. That 100vh version (tried and reverted) worked
  for centering but broke the *release*: once the bowl-wrap containing block
  ran out and the box let go, that 100vh box kept its full height in normal
  flow, so its old centering padding-top just sat there as dead blank space
  with the heading+bowl reappearing well below it — "Grilled Chicken scrolls
  up and leaves an empty gap," per the report that caught it. An auto-height
  box (~500px) has no such padding to strand, so release now hands off
  straight into the outro CTA with no gap — confirmed by screenshotting the
  exact release frame.
  `top` targets the *bowl visual's own center* landing where a step's heading
  actually sits **the instant it first becomes active** (~75vh empirically),
  not dead viewport-center — the IntersectionObserver's `-45%/-45%` rootMargin
  fires while a heading is still low in the viewport, and it keeps scrolling
  upward through the rest of that step's dwell (a fixed circle can only ever
  exactly match one moving line at one instant, not a whole scroll range).
  Went through three calibrations chasing this: 50vh measured wrong-looking
  wrong; 60vh measured right but only because the old 100vh box hadn't
  actually finished settling at the check instant (an artifact of the box-
  height bug above, not a real fix); with the box-height bug gone, 60vh
  measured 135px off. Now `top:min(max(24px, calc(72svh - 295px)), calc(100svh
  - 520px))` — 72vh chases the ~75vh empirical target, and the outer `min()`
  is a hard safety floor so this ~500px-tall box can't clip its own caption on
  short viewports (verified clean down to 600px tall) the same way the
  original "bowl cut off at the bottom" bug did. Lands Cherry Tomatoes'
  h3-center within 24px of the bowl's center at first activation — not
  pixel-perfect (impossible given the moving-text-vs-fixed-circle tension
  above) but close, and safe.
  Also surfaced a real timing bug along the way: a tall sticky element takes a
  full viewport-height of scroll to settle into its pinned spot, and step 1
  was finishing its entire activation window *before* the bowl ever finished
  settling — confirmed by tracing bowl-center vs. active-step-h3-center across
  scroll (off by 250px+ for step 1 specifically) before the box-height fix.
  Fixed with a `margin-top:40vh` lead-in on `.bowl-steps` (zeroed on
  mobile/reduced-motion) that delays step 1's trigger until after the bowl has
  settled — still needed and still correct after the auto-height change, since
  lock timing depends on where the box naturally sits, not its height.
  Also re-tuned 2026-08-12: the bowl was releasing from its sticky pin *during*
  the last ("Grilled Chicken") step, so the full-circle payoff scrolled away
  before it was ever fully visible — confirmed by tracing `.bowl-stage-col`'s
  rect across the whole scroll range, not assumed. Fixed with a trailing cushion
  (`padding-bottom:max(60vh,440px)` on `.bowl-steps`, zeroed out on mobile and
  reduced-motion where the pin isn't active) so the containing block has room
  to release cleanly after data-p reaches 1, not during it. Also tightened
  per-step dwell 52vh → 42vh — 7 × 52vh was a lot of scroll distance to ask for
  a secondary section on a commerce homepage.
- **2026-08-15: horizontal food gallery added**, between the ingredient-reveal
  bowl and the "Same care, every single bowl." outro CTA. `.bowl-gallery` —
  a `<ul>` of 6 cards (`overflow-x:auto` + `scroll-snap-type:x mandatory`,
  hidden scrollbar), each a placeholder image box (gradient fill + brass
  photo-icon SVG) with a bowl-type label (Protein/Veggie/Grain/Green/Power/
  Balanced Bowl — generic category names, not fabricated specific dishes,
  since the meal-plan bowls don't have published proper names the way Dadi's
  Menu dishes do). Track bleeds to the section's own edge via a negative
  margin matched to `.wrap`'s padding (not full viewport-width bleed, to
  avoid scrollbar-width edge cases) — first/last card line up with the rest
  of the page, and the last card partially cropped at the edge signals "more
  to scroll" without needing arrows. **Photos are placeholders only** — user
  will supply real meal-plan photography later; swapping one in means
  replacing a `.bowl-gallery__photo` div with a real `<img>` and wiring a new
  key into `build.js`'s `photoMap` (same pattern as the other `__IMG_*`
  tokens), per `ARCHITECTURE.md`. Verified via Playwright screenshot at
  desktop (1400px) and mobile (390px) widths, and confirmed the track's
  overflow doesn't leak into page-level horizontal scroll
  (`document.documentElement.scrollWidth === clientWidth`).

Two other concepts (Minimal, Editorial) were pitched alongside Heritage as
throwaway comparison artifacts and were never built out — Heritage was the pick.
Their source doesn't live in this repo.

## Known caveats / not production-ready yet

1. **6 of 7 photos are still stock, not Maroon Door's own** (the hero is now real
   branded photography, see above). The rest — dish shots, corporate catering,
   the saffron ambience photo — are sourced from Wikimedia Commons (properly
   licensed, see `assets/PHOTO_CREDITS.md`) standing in until real food/venue
   photography exists for those spots too. The "Royal Catering" offering card
   still has no photo — no good stock match was found, so it stayed illustrated
   rather than force a bad fit; `hero_mealplan_alt.png` (see above) could
   plausibly be cropped for the Meal Plans card if a real photo is wanted there.
2. **Footer legal links (`Privacy Policy`, `Cookie Policy`, `Terms & Conditions`,
   `Refunds & Cancellation`) go nowhere** — placeholder `href="#"`. Real pages
   need real legal copy; not something to fabricate.
3. **Monolithic HTML.** Fonts + all photos are base64-inlined into one ~5MB
   `index.html`. Fine for previewing, bad for real-world load performance
   (no caching, no parallel fetch, no lazy-load benefit). Before a real launch,
   split into separate `/css`, `/js`, `/images` with normal `<link>`/`<img src>`
   references — see `ARCHITECTURE.md`.
4. **Single page only.** No menu detail page, no per-dish pages, no real ordering
   flow (WhatsApp deep-links stand in for a cart).
5. **License terms on the stock photos**: several are CC BY-SA, which requires
   attribution and (if the *image itself* is redistributed standalone) share-alike.
   Using them embedded in a page with credit is standard practice, but swap in
   licensed or original photography before this goes fully live — don't treat the
   credits file as a substitute for that.
6. **`bowl.webp` (the ingredient-reveal photo) has no confirmed license.** It was
   dropped directly into the repo root as `animation.avif` rather than sourced
   through the Commons search used for the other placeholders, so — unlike those —
   there's no attribution on file and its usage rights are unverified. Confirm
   the user actually holds rights to it before this ships.
7. **Fixed sitewide while verifying this section, worth noting:** `template.html`
   had no `<!DOCTYPE html>`/`<meta charset>`, so local `file://` loads were
   defaulting to Windows-1252 and mangling every em dash and © on the page
   (confirmed via Playwright: `document.characterSet` was `windows-1252`, now
   `UTF-8`). Fixed by wrapping the template in a proper `<html><head>…</head>
   <body>…</body></html>` with `<meta charset="utf-8">`.

## Next steps (not started)
- Decide sourcing plan for real photography (shoot list vs. licensed stock vs. keep placeholders longer).
- Write real legal pages or source them from the current live site if they already exist there.
- Unbundle the build for production performance (see `ARCHITECTURE.md` §Known limitation).
- Menu / dish detail pages if the one-pager isn't enough.
- Decide on hosting/deploy target.

## Open questions for the user
- Real photos: shoot new, or license stock, or keep current placeholders longer?
- Any existing legal policy text to reuse, or does that need drafting?
- Deploy target (stays a static site? Framer? something else)?
