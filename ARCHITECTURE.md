# Architecture

## Folder layout

```
Website/
├── index.html                     ← generated. Don't hand-edit.
├── CLAUDE.md / STATUS.md / ARCHITECTURE.md / BRAND.md
├── assets/
│   ├── brand/
│   │   ├── maroon-door-logo.png   ← original logo asset (1254×1254)
│   │   ├── optimized/logo-300.png ← resized copy actually embedded in index.html
│   │   └── PHOTO_CREDITS.md
│   └── photos/
│       ├── source/                ← full-res downloads as sourced (uncropped, uncompressed)
│       └── optimized/             ← resized + recompressed via ffmpeg, what index.html embeds
└── build/
    ├── template.html              ← the real source: markup, CSS, JS, with __PLACEHOLDER__ tokens
    ├── fonts.css                  ← @font-face rules, woff2 files inlined as base64 (generated, see below)
    ├── build.js                   ← splices template + fonts.css + assets/* → ../index.html
    └── check_tags.js              ← sanity check: open/close tag counts on the built index.html
```

## Build pipeline

`node build/build.js` (run from repo root) does the assembly:

1. Reads `build/template.html`.
2. Replaces `/*__FONTS__*/` with the contents of `build/fonts.css`.
3. Replaces `__IMG_<key>__` tokens with base64 `data:` URIs read from
   `assets/photos/optimized/<key>.jpg`.
4. Replaces `__IMG_logo__` with the base64-encoded `assets/brand/optimized/logo-300.png`.
5. Replaces `__DOORMARK_HERO__` / `__DOORMARK_CARD__` with an inline SVG (a small
   line-art door-arch icon, used only as decoration — real brand-identity spots
   use the logo image, not this).
6. Replaces `__ICON_WA__` / `__ICON_WA_SM__` with an inline WhatsApp glyph SVG.
7. Writes the result to `../index.html`.

There's no bundler, no npm install — just plain Node (`fs`/`path`/`https` from the
standard library). Any Node version works.

## Why everything is inlined (and when to stop doing that)

This build started life as a Claude Artifact preview, which runs under a strict CSP
that blocks *all* external resource loads — no font CDNs, no `<img src="https://...">`,
nothing. That forced fonts and photos to be embedded as base64 `data:` URIs directly
in the HTML. The convention stuck when the project moved into this repo, mostly
because it means `index.html` is still a single file you can open directly with zero
setup.

The cost: `index.html` is ~5MB, every byte of every font weight and every photo
re-downloads on every page load (no HTTP caching), and there's no parallel fetching
or lazy loading of below-the-fold images — all real performance problems for a live
site.

**Before real deployment**, unbundle:
- Fonts → real `.woff2` files under `assets/fonts/`, loaded via `@font-face { src: url(...) }` + `font-display: swap`.
- Photos → real `<img src="assets/photos/optimized/....jpg" loading="lazy">`.
- Logo → real `<img src="assets/brand/....png">`.
- Keep `build/template.html` as the editable source either way, or drop the build
  step entirely once nothing needs inlining.

## Fonts

Sourced from Google Fonts (`fonts.googleapis.com/css2`), fetched once with `curl`
and converted to base64 `@font-face` rules — see git history / prior session for the
fetch script if the font set needs to change. Current set: **Fraunces** (display,
600 + 500 italic) and **Manrope** (body, 400 + 700).

## Photos

Sourced from Wikimedia Commons via its public search API (`commons.wikimedia.org/w/api.php`),
downloaded with `curl`, resized/recompressed with `ffmpeg` (`scale='min(Npx,iw)':-2`,
`-q:v 4`). See `assets/PHOTO_CREDITS.md` for the license/attribution on each one —
these are placeholders, not Maroon Door's own photography (see `STATUS.md`).

## The door-open intro

`.door-intro` in `template.html`: a fixed full-viewport overlay, two 50%-width
"leaf" panels each showing one half of the hero door photo (via
`background-position: left/right center` on a 200%-wide background — the standard
split-image trick). The open animation and the overlay's self-removal
(`visibility:hidden; pointer-events:none` at the end) are both pure CSS
`@keyframes`, not JS — so it plays and cleans itself up even if JavaScript fails to
run. A small JS enhancer adds click-to-skip; it's optional, not load-bearing.
`prefers-reduced-motion: reduce` hides the whole overlay via a media query, no JS
needed for that either.

## Sanity check

`node build/check_tags.js` counts open/close tags on the built `index.html` (div,
section, header, footer, nav, headings, a, span, svg, g) and flags mismatches. Run
it after any structural edit to `template.html` + rebuild, before publishing.
