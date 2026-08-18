# Brand

## Identity
- **Name:** Maroon Door (legal: Maroon Door LLC)
- **Tagline:** "Healthy, Fresh, and Made Just for You."
- **What it is:** Premium catering and meal-plan delivery across the UAE — corporate
  catering, nutrition-designed meal plans, "Royal Catering" for events, plus
  individual chef-prepared meals.
- **Founders:** Simak & Nazia — "a brother-sister duo on a mission to make healthy
  eating effortless across the UAE."
- **Base:** Dubai, United Arab Emirates. Delivers to all 7 emirates: Abu Dhabi,
  Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, Fujairah.
- **Logo:** `assets/brand/maroon-door-logo.png` — chef's-hat "m", fork/spoon
  negative-space in the "oo"s, on a maroon gradient. Real brand asset, not
  something generated for this project.

## Voice
Warm, plain, not salesy. The real site copy already reads this way — keep it:
"good food should make you feel good," not "elevate your dining experience."

## Design tokens — Heritage Threshold

Repaletted 2026-08-12 by sampling the real logo's pixels directly (`ffmpeg` raw RGB
dump) rather than inventing a "maroon + gold luxury" palette from scratch — the
actual logo background is a near-black, near-zero-saturation blood-red gradient
(`#3D0101` → `#5E0101`), and it carries **no gold at all**, just maroon and white.
The site's palette now follows that: gold is demoted from a co-equal accent to a
restrained "brass," used only where it reads as literal door hardware (ring
handles, the door-intro seam, hairlines) — never as headline or button color.

| Token | Hex | Use |
|---|---|---|
| `--maroon` | `#5C0B0B` | primary brand color, CTAs, dark section backgrounds — sampled from the logo, not invented |
| `--oxblood` | `#7A1414` | hover states, secondary accents |
| `--brass` | `#A9814A` | **restrained**, used only for hairlines, icon strokes, and literal hardware (door rings, seam lines) — not for headline or button color |
| `--warmlight` | `#E9D6C9` | text-on-dark accent (hero eyebrow, headings on maroon) — a warm pale tone, not gold |
| `--ivory` | `#F2E7E2` | page background — warm rose-parchment with a faint red-hue bias (sampled from the logo's anti-aliased edge tones), not a generic cream |
| `--ivory2` | `#E8D3CA` | card backgrounds |
| `--ink` | `#2A140F` | body text, darkest surfaces (footer) — red-black, same hue family as the brand maroon rather than a neutral brown-black |
| `--wa` / `--wa-dark` | `#25D366` / `#128C4A` | WhatsApp CTAs — intentionally *not* brand-colored; this is the one deliberate semantic-color exception, because WhatsApp-green is what UAE users recognize and tap without thinking |

**Rule of thumb going forward:** if a new element needs an accent, reach for
`--oxblood` or `--warmlight` before `--brass`. Brass is for hardware, not decoration
— the moment it starts showing up on more than one element per section, it's back
to being the generic "maroon + gold" look this palette was deliberately built to
avoid.

**Type:**
- Display — **Fraunces** (italic 500 for accents/quotes, 600 upright for headings). Ornate, warm, does the "heritage" work.
- Body — **Manrope** (400 body, 700 for buttons/labels).
- No third face. Uppercase tracked Manrope covers eyebrows/labels instead of a dedicated utility font.

**Signature motif:** the maroon door itself, literally — a two-leaf arched doorway.
Shows up as: the page-load open animation, the hero backdrop photo, a small
line-art mark on hero/illustrated-card decoration, and the real logo everywhere the
mark needs to *be* the brand (nav, footer).

**Photo treatment:** every photo is desaturated + maroon/gold multiply overlay
(`grayscale(1) contrast(1.1) brightness(1.05)` on the image, a maroon→gold gradient
`mix-blend-mode: multiply` on top) — this is what makes seven photos shot in seven
different lighting conditions read as one system. Always apply this to any new
photo before it goes on the page; a photo dropped in at native color will look
out of place next to the others.

## Content facts (source of truth — pulled from the live site, don't invent alternatives)

**Offerings:**
- *Corporate Catering* — "From boardrooms to film sets — we keep creativity and productivity alive."
- *Meal Plans* — "Designed by nutrition experts, our meal plans combine health, taste, and convenience."
- *Royal Catering* — "Whether it's an intimate gathering or a grand celebration — our Royal Catering service brings curated menus, elegant setups, and impeccable service right to your table."

**Signature dishes ("Dadi's Menu"):**
- *Raan Musallam with Jeweled Rice* — slow-roasted whole lamb leg on fragrant jeweled rice with nuts and dry fruits.
- *Shami Kebab* — pan-fried minced meat and lentil patties with aromatic spices.
- *Korma Biryani* — fusion biryani layered with korma gravy and aromatic rice.

**Contact:**
- WhatsApp: +971 58 589 6967, +971 56 449 5480
- Instagram: @themaroondoor.ae
- Hours: Mon–Fri 9AM–10PM, Sat 10AM–11PM, Sun 10AM–8PM
- Dubai, United Arab Emirates

No pricing is published anywhere on the live site — don't invent any.
