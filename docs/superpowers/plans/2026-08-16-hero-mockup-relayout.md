# Hero Mockup Re-layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-lay out the `#top` hero of `experiment.html` to match the supplied mockup, keeping the 91-frame scroll-scrubbed bowl animation as the hero artwork.

**Architecture:** `experiment.html` is a single hand-edited file with no build step (see `STATUS.md`, 2026-08-15 pivot). All work is direct edits to that one file, plus four new derived image assets and a new persistent verification harness under `build/verify/`. The scrub machinery, header, and hero copy already exist and are largely reused; this is a re-layout of `.bowl-pin-stage`, not a rebuild.

**Tech Stack:** Plain HTML/CSS/JS, no framework, no bundler. Node 24 (native `WebSocket`, no npm dependencies) drives headless Chrome over the DevTools Protocol for verification. `ffmpeg` for image derivation.

**Spec:** `docs/superpowers/specs/2026-08-16-hero-mockup-relayout-design.md`

---

## Conventions for this plan

**No commits.** `CLAUDE.md` states commits happen only when the user explicitly asks. Every task therefore ends in a **verification** step rather than a commit step. Do not run `git commit` at any point in this plan. The user will ask when they want the work committed.

**Never hand-copy an anchor out of a truncated tool readout.** Line numbers in this plan are a 2026-08-16 snapshot and shifted ~16 lines once during the session it was written, apparently from a formatting hook. Locate every edit target by its class name or its own unique text and confirm the current bytes before editing. Anchoring on something not unique to the target is the single most repeated defect in this file's history (`STATUS.md`: an `indexOf` splice silently deleted an entire card).

**Run everything from the repo root**, `c:\Users\USER\Documents\GitHub\Themaroondoor\Website`.

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `build/verify/cdp.js` | Launch headless Chrome, speak DevTools Protocol over native WebSocket. Exports `connect`, `open`, `evaluate`, `screenshot`. Nothing project-specific. |
| `build/verify/probe.js` | Horizontal-overflow gate across six viewport widths. Exit 0 = all clean, 1 = at least one width overflows. |
| `build/verify/shot.js` | Screenshot one page at one width, optionally after scrolling. |
| `build/verify/scrub.js` | Drive the hero scrub to given progress fractions; report `--bowl-p`, garnish opacity, and drawn frame index. |
| `assets/photos/optimized/garnish_tomato_a.jpg` | Garnish bit, cropped from `frame_091.jpg`. |
| `assets/photos/optimized/garnish_tomato_b.jpg` | Garnish bit. |
| `assets/photos/optimized/garnish_cucumber.jpg` | Garnish bit. |
| `assets/photos/optimized/garnish_seeds.jpg` | Garnish bit. |

The harness lives in `build/verify/` rather than a scratch directory deliberately: the equivalent scripts from the previous session were written to a session-temp scratchpad and are effectively lost (`STATUS.md` references `scratchpad/probe.js`, `shot.js`, `cdp.js`). Persisting them makes every future pass on this file cheaper.

**Modified:**

- `experiment.html` — the only production file touched. CSS block (hero section rules), the `.bowl-story` markup, and the hero JS.

**Not touched:** `build/template.html`, `build/build.js`, `index-scroll-frames.html`, and everything in `experiment.html` below `.bowl-below`.

---

## Task 1: Verification harness and green baseline

**Files:**
- Create: `build/verify/cdp.js`
- Create: `build/verify/probe.js`
- Create: `build/verify/shot.js`
- Modify: none

This task must come first. It establishes that the page is clean **before** any change, so that a later failure is unambiguously caused by this work rather than pre-existing.

- [ ] **Step 1: Back up the file**

```bash
mkdir -p .backup
cp experiment.html .backup/experiment.pre-hero-relayout.html
```

`.backup/` is untracked scratch. Confirm `.gitignore` covers it or add `.backup/` to it.

- [ ] **Step 2: Write the CDP client**

Create `build/verify/cdp.js`:

```js
'use strict';
/* Headless-Chrome driver over the DevTools Protocol.
   Node 24 ships a global WebSocket, so this needs no npm dependencies.
   Chrome's CLI --window-size path cannot render below ~485px on Windows and
   silently saves a cropped PNG at the width you asked for, which reads as a
   horizontal-overflow bug that is not there. Emulation.setDeviceMetricsOverride
   sets a real CSS viewport at any size, so everything here goes through it. */
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

function httpJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

class Session {
  constructor(ws) {
    this.ws = ws;
    this.seq = 0;
    this.pending = new Map();
    this.waiters = new Map();
    ws.addEventListener('message', ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.method + ': ' + msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        const list = this.waiters.get(msg.method);
        if (list && list.length) { this.waiters.set(msg.method, []); list.forEach(fn => fn(msg.params)); }
      }
    });
  }
  send(method, params) {
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params: params || {} }));
    });
  }
  once(method) {
    return new Promise(resolve => {
      const list = this.waiters.get(method) || [];
      list.push(resolve);
      this.waiters.set(method, list);
    });
  }
}

async function connect() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'md-cdp-'));
  const proc = spawn(CHROME, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + profile,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--hide-scrollbars', '--force-device-scale-factor=1',
    'about:blank'
  ], { stdio: 'ignore' });

  let version = null;
  for (let i = 0; i < 80; i++) {
    try { version = await httpJson('http://127.0.0.1:' + PORT + '/json/version'); break; }
    catch (e) { await sleep(125); }
  }
  if (!version) throw new Error('Chrome did not expose a debugging port within 10s');

  const targets = await httpJson('http://127.0.0.1:' + PORT + '/json/list');
  const page = targets.find(t => t.type === 'page');
  if (!page) throw new Error('no page target');

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  const session = new Session(ws);
  await session.send('Page.enable');
  await session.send('Runtime.enable');

  const close = async () => {
    try { ws.close(); } catch (e) {}
    try { proc.kill(); } catch (e) {}
    await sleep(200);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  };
  return { session, close };
}

async function open(session, fileUrl, width, height) {
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: width, height: height || 900, deviceScaleFactor: 1, mobile: false
  });
  const loaded = session.once('Page.loadEventFired');
  await session.send('Page.navigate', { url: fileUrl });
  await loaded;
  // Two rAFs: one to flush layout, one to let a scroll-driven rAF tick paint.
  await evaluate(session, 'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
}

async function evaluate(session, expression) {
  const r = await session.send('Runtime.evaluate', {
    expression: expression, returnByValue: true, awaitPromise: true
  });
  if (r.exceptionDetails) {
    const d = r.exceptionDetails;
    throw new Error('evaluate failed: ' + (d.exception && d.exception.description || d.text));
  }
  return r.result.value;
}

async function screenshot(session, outPath) {
  const r = await session.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(outPath, Buffer.from(r.data, 'base64'));
  return outPath;
}

module.exports = { connect, open, evaluate, screenshot };
```

- [ ] **Step 3: Write the overflow probe**

Create `build/verify/probe.js`:

```js
'use strict';
/* Horizontal-overflow gate. This file's most-repeated defect class is a
   full-bleed or absolutely-positioned element leaking page-level horizontal
   scroll at one viewport width while looking fine at another, so every width
   is checked every time. */
const { connect, open, evaluate } = require('./cdp');
const { pathToFileURL } = require('url');
const path = require('path');

const WIDTHS = [360, 390, 768, 1024, 1440, 1800];
const target = path.resolve(process.argv[2] || 'experiment.html');

(async () => {
  const url = pathToFileURL(target).href;
  const { session, close } = await connect();
  let failures = 0;
  console.log('probing ' + target);
  for (const w of WIDTHS) {
    await open(session, url, w, 900);
    const r = await evaluate(session,
      '(function(){var d=document.documentElement;' +
      'return {over:d.scrollWidth-d.clientWidth,sw:d.scrollWidth,cw:d.clientWidth};})()');
    const ok = r.over === 0;
    if (!ok) failures++;
    console.log(
      (ok ? 'PASS' : 'FAIL') + '  ' + String(w).padStart(4) + 'px' +
      '  overflow=' + r.over + 'px  (scrollWidth ' + r.sw + ' vs clientWidth ' + r.cw + ')'
    );
  }
  await close();
  console.log(failures ? failures + ' width(s) overflow' : 'all widths clean');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
```

- [ ] **Step 4: Write the screenshot tool**

Create `build/verify/shot.js`:

```js
'use strict';
/* usage: node build/verify/shot.js <file.html> <out.png> <width> [height] [scrollY] */
const { connect, open, evaluate, screenshot } = require('./cdp');
const { pathToFileURL } = require('url');
const path = require('path');

const file = path.resolve(process.argv[2]);
const out = path.resolve(process.argv[3]);
const width = parseInt(process.argv[4], 10);
const height = parseInt(process.argv[5] || '900', 10);
const scrollY = parseInt(process.argv[6] || '0', 10);

(async () => {
  const { session, close } = await connect();
  await open(session, pathToFileURL(file).href, width, height);
  if (scrollY) {
    await evaluate(session, 'window.scrollTo(0,' + scrollY + ')');
    await evaluate(session, 'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  }
  await screenshot(session, out);
  await close();
  console.log('wrote ' + out + ' at ' + width + 'x' + height + ' scrollY=' + scrollY);
})().catch(e => { console.error(e); process.exit(2); });
```

- [ ] **Step 5: Run the probe against the UNCHANGED file to establish baseline**

Run: `node build/verify/probe.js experiment.html`

Expected: six `PASS` lines, `all widths clean`, exit 0. `STATUS.md` records this file as having zero horizontal overflow at 360/390/768/1024/1440/1800 as of the premium audit pass, so a `FAIL` here means the harness is wrong, not the page. Fix the harness before continuing — do not start editing the page on top of a broken gate.

- [ ] **Step 6: Take a baseline screenshot**

```bash
node build/verify/shot.js experiment.html .backup/baseline-1440.png 1440 900
```

Expected: `wrote ...baseline-1440.png at 1440x900 scrollY=0`. View it. It should show the current teaser hero ("An empty bowl. Scroll to fill it.") in its glass card. Keep it for before/after comparison.

- [ ] **Step 7: Verify**

Both scripts run clean, baseline PNG exists and shows the current hero. Report the six probe lines verbatim.

---

## Task 2: Derive the four garnish assets

**Files:**
- Create: `assets/photos/optimized/garnish_tomato_a.jpg`
- Create: `assets/photos/optimized/garnish_tomato_b.jpg`
- Create: `assets/photos/optimized/garnish_cucumber.jpg`
- Create: `assets/photos/optimized/garnish_seeds.jpg`

Source is `assets/frames_hq/optimized/frame_091.jpg` (1920×1088) only. The crop coordinates below were confirmed visually over three refinement passes while writing this plan — they are known-good starting values, not guesses.

Each subject is approximately circular in the source, which is what lets `clip-path: circle(50%)` cut it with no alpha channel and no halo of neighbouring pixels.

- [ ] **Step 1: Cut the four crops**

```bash
F=assets/frames_hq/optimized/frame_091.jpg
O=assets/photos/optimized
ffmpeg -y -v error -i "$F" -vf "crop=210:210:1145:185,scale=200:200" -q:v 3 "$O/garnish_tomato_a.jpg"
ffmpeg -y -v error -i "$F" -vf "crop=170:170:800:215,scale=200:200"  -q:v 3 "$O/garnish_tomato_b.jpg"
ffmpeg -y -v error -i "$F" -vf "crop=170:170:1275:480,scale=200:200" -q:v 3 "$O/garnish_cucumber.jpg"
ffmpeg -y -v error -i "$F" -vf "crop=160:160:770:345,scale=200:200"  -q:v 3 "$O/garnish_seeds.jpg"
```

- [ ] **Step 2: Build a contact sheet and LOOK at it**

```bash
ffmpeg -y -v error \
  -i assets/photos/optimized/garnish_tomato_a.jpg \
  -i assets/photos/optimized/garnish_tomato_b.jpg \
  -i assets/photos/optimized/garnish_cucumber.jpg \
  -i assets/photos/optimized/garnish_seeds.jpg \
  -filter_complex "[0][1][2][3]hstack=4[o]" -map "[o]" .backup/garnish-check.png
```

Read `.backup/garnish-check.png` with the Read tool. Acceptance criteria, per bit:

1. The subject is centred — a circle inscribed in the square must not clip it.
2. No second distinct subject intrudes into that inscribed circle. A tomato edge poking into the cucumber's circle is a fail; this is exactly why the broccoli floret was rejected during design.

If a bit fails, nudge its crop offset (the two trailing numbers are `x:y` of the crop's top-left) by 15–30px toward the subject's centre and re-run Steps 1–2. Do not proceed on a failing bit.

- [ ] **Step 3: Confirm file sizes are sane**

```bash
ls -l assets/photos/optimized/garnish_*.jpg
```

Expected: four files, each roughly 8–25KB. Anything over 60KB means the `-q:v 3` or `scale=200:200` was dropped.

- [ ] **Step 4: Verify**

Four files exist, contact sheet passes both acceptance criteria, sizes sane.

Do **not** add these to `assets/PHOTO_CREDITS.md`. That file tracks Wikimedia attribution obligations; these are derived from the project's own pre-rendered frames, matching the precedent already set for the user-supplied map and meal-plan photography.

---

## Task 3: Hero tokens, stage grid, and pin heights

**Files:**
- Modify: `experiment.html` — CSS, the `/* ===== hero: scroll-scrubbed bowl build ===== */` block (around line 257)

This is CSS only. The page will look wrong at the end of this task — the rail and garnish it makes room for do not exist yet. That is expected; the overflow gate is what must stay green.

- [ ] **Step 1: Replace the three stage-level rules**

Find `.bowl-story{`, `.bowl-pin-wrap{` and `.bowl-pin-stage{` (they are consecutive, directly under the `hero: scroll-scrubbed bowl build` comment). Replace all three with:

```css
.bowl-story{padding-top:0;padding-bottom:var(--section-y);
  /* Sampled from the frames' own backdrop, not invented — the same method
     BRAND.md used to pull the maroon off the real logo. The page's --ivory
     (#F2E7E2) is a rose parchment; these frames sit on a sand cream. Matching
     them exactly is what lets the canvas dissolve into the page with a single
     feather instead of the four-gradient mask stack this replaces. Scoped
     here on purpose: this is not a new global surface colour. */
  --hero-sand:#F2E9DA;
  --rail-h:clamp(64px,7vh,92px);
  --bowl-h:min(calc(92vh - var(--header-h) - var(--rail-h)),760px);
  --stage-h:calc(var(--bowl-h) + var(--rail-h))}
/* Runway is derived from --stage-h, never hand-tuned: header + bowl + rail
   must total ~92vh so the whole composition fits a 720px-tall laptop, and the
   pin must stay stuck for the entire scrub. Changing the rail height without
   changing this formula releases the pin mid-animation. */
.bowl-pin-wrap{position:relative;background:var(--hero-sand);
  min-height:calc(var(--stage-h) + 40vh + max(130vh,950px))}
.bowl-pin-stage{position:sticky;top:var(--header-h);min-height:var(--stage-h);overflow-x:clip;
  display:grid;grid-template-columns:minmax(300px,var(--intro-w)) 1fr;
  grid-template-rows:1fr auto;align-items:center;
  --intro-w:min(44vw,600px);
  padding-inline:var(--gutter)}
```

- [ ] **Step 2: Hand the background back to the page below the pin**

Find `.bowl-below{margin-top:clamp(40px,6vw,72px)}` and replace with:

```css
/* The pin sits on sand; the rest of the page is --ivory. Fade across 200px
   right after the pin releases so the change of ground is not a hard seam. */
.bowl-below{margin-top:clamp(40px,6vw,72px);
  background:linear-gradient(180deg,var(--hero-sand),var(--ivory) 200px)}
```

- [ ] **Step 3: Point the media backdrop at the new token**

Find `.bowl-media{` and change `background:var(--ivory);` to `background:var(--hero-sand);`. Leave every other declaration in that rule alone for now — the mask and sizing change in Task 5.

- [ ] **Step 4: Re-run the overflow gate**

Run: `node build/verify/probe.js experiment.html`

Expected: six `PASS`, exit 0.

- [ ] **Step 5: Confirm the pin still holds for the whole scrub**

```bash
node build/verify/shot.js experiment.html .backup/t3-pin-mid.png 1440 900 1200
```

View it. The hero stage must still be pinned at `scrollY=1200` — copy card and bowl both on screen, not scrolled away.

- [ ] **Step 6: Verify**

Probe green at six widths, pin holds at scrollY 1200. Report the probe output.

---

## Task 4: Delete the teaser gate and the copy card

**Files:**
- Modify: `experiment.html` — markup (`.bowl-teaser` block), CSS (`.bowl-teaser*`, `.bowl-intro`, `.bowl-intro__headline`, `.bowl-intro__eyebrow`, `@keyframes cue-bob`), JS (teaser block, `.reveal` observer filter)

Five things are coupled to the teaser and must come out together. Removing only some of them leaves either dead CSS or a headline that never reveals.

- [ ] **Step 1: Delete the teaser markup**

In the `.bowl-story` section, delete the entire `<div class="bowl-teaser" id="bowlTeaser">` element and everything up to and including its matching `</div>`. It is the first child of `.bowl-intro` and contains the text `An empty bowl.` and `Scroll to fill it.`

After deleting, the first child of `.bowl-intro` must be `<p class="eyebrow bowl-intro__eyebrow reveal" style="--i:0">`.

- [ ] **Step 2: Delete the teaser CSS**

Delete the whole block from the comment `/* Teaser: the card's first state, ...` through the `@media (prefers-reduced-motion:reduce){.bowl-teaser{...}}` line — every rule whose selector starts `.bowl-teaser`.

- [ ] **Step 3: Delete the now-dead keyframe**

Find `@keyframes cue-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}` and delete the line. Its only consumer was `.bowl-teaser__cue svg`, deleted in Step 2.

Confirm nothing else references it:

```bash
grep -n "cue-bob" experiment.html
```

Expected: no output.

- [ ] **Step 4: Strip the card off `.bowl-intro` and raise its stacking order**

Find the `.bowl-intro{` rule and replace it entirely with:

```css
/* No card. The mockup sets the copy directly on the sand; the panel that used
   to be here (glass fill, brass border, shadow, padding) is what made this
   hero read as a component placed on a page. z-index 3 keeps the copy above
   the garnish layer, which sits at 2 above the canvas at 1. */
.bowl-intro{grid-area:1/1/2/2;position:relative;z-index:3;min-width:0}
```

- [ ] **Step 5: Release the headline to the page type scale**

Find the comment beginning `/* Deliberately a notch below --t-3xl:` together with the `.bowl-intro__headline{...}` rule that follows it. Replace both with:

```css
/* Full --t-3xl now that the fixed-width card is gone — the constraint the
   previous notched clamp existed to work around no longer exists. */
.bowl-intro__headline{font-family:'Fraunces';font-weight:600;font-size:var(--t-3xl);line-height:1.03;letter-spacing:-.02em;color:var(--ink);text-wrap:balance}
```

Leave `.bowl-intro__headline em{...}` on the following line untouched.

- [ ] **Step 6: Make the eyebrow carry the chef's-hat glyph**

Replace the `.bowl-intro__eyebrow{...}` rule with:

```css
.bowl-intro__eyebrow{display:inline-flex;align-items:center;gap:9px;color:var(--oxblood);margin-bottom:14px}
.bowl-intro__eyebrow svg{width:17px;height:17px;flex:none}
```

`.eyebrow` (the base class, `font-size`/`letter-spacing`/`text-transform`/`font-weight` only) sets no `display`, so there is no conflict to resolve despite both selectors having identical specificity.

Then replace the eyebrow element's markup with:

```html
        <p class="eyebrow bowl-intro__eyebrow reveal" style="--i:0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 21h12M7 21v-6M17 21v-6M7 15a5 5 0 0 1-1-9.9A4 4 0 0 1 12 3a4 4 0 0 1 6 3.1A5 5 0 0 1 17 15H7Z"/></svg>Cooked in Dubai</p>
```

That path is the existing "Chef-prepared" feature icon, reused byte-for-byte rather than a second hat being drawn.

- [ ] **Step 7: Un-gate the hero reveals**

Find the `.reveal` observer and remove the `.bowl-intro` exclusion. Replace:

```js
  var items = Array.prototype.filter.call(document.querySelectorAll('.reveal'), function(el){
    return !el.closest('.bowl-intro');
  });
```

with:

```js
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
```

Also delete the three-line comment above it that begins `/* ===== reveal on scroll =====` — specifically the sentences explaining the teaser gate — and replace the comment with:

```js
  /* ===== reveal on scroll =====
     The hero's own items are in view at load, so the observer fires them
     immediately; their --i stagger still produces the sequenced entrance. */
```

- [ ] **Step 8: Delete the teaser JS block**

Delete the entire block from the comment `/* ===== hero teaser -> real headline on first downward scroll ===== */` through the closing `}` of its `else` branch — the code declaring `bowlTeaser`, `bowlIntroReveals`, `heroRevealed`, and pushing to `scrollJobs`.

Confirm:

```bash
grep -n "bowlTeaser\|bowlIntroReveals\|heroRevealed" experiment.html
```

Expected: no output.

Do **not** touch `bowlOutro` or `.outro-cta`. That is a different feature — the "Build my meal plan" CTA below the gallery, cued at 0.93 scrub progress.

- [ ] **Step 9: Confirm the headline is painted at load**

```bash
node build/verify/shot.js experiment.html .backup/t4-hero.png 1440 900
```

View it. The headline "Meal plans and catering, delivered across the UAE." must be visible with no scrolling, with no glass card behind it, and with a small chef's-hat glyph before "COOKED IN DUBAI".

- [ ] **Step 10: Confirm no stale specificity winner**

```bash
node -e "
const {connect,open,evaluate}=require('./build/verify/cdp');
const {pathToFileURL}=require('url');const path=require('path');
(async()=>{const{session,close}=await connect();
await open(session,pathToFileURL(path.resolve('experiment.html')).href,1440,900);
console.log(await evaluate(session,\"(function(){var h=document.querySelector('.bowl-intro__headline');var i=document.querySelector('.bowl-intro');var cs=getComputedStyle(h),ci=getComputedStyle(i);return{fontSize:cs.fontSize,opacity:cs.opacity,introBg:ci.backgroundColor,introShadow:ci.boxShadow,introZ:ci.zIndex};})()\"));
await close();})().catch(e=>{console.error(e);process.exit(2)});
"
```

Expected: `fontSize` around `65px` at 1440 (the top of `--t-3xl`'s clamp), `opacity` `1`, `introBg` `rgba(0, 0, 0, 0)`, `introShadow` `none`, `introZ` `3`.

A non-transparent `introBg` or a non-`none` `introShadow` means the card rule was only partly removed. `opacity` below 1 means the reveal never fired.

- [ ] **Step 11: Verify**

Run: `node build/verify/probe.js experiment.html` — six `PASS`. Plus the computed-style values above, reported verbatim.

---

## Task 5: Bleed the bowl and simplify the mask

**Files:**
- Modify: `experiment.html` — the `.bowl-media` rule

- [ ] **Step 1: Replace the `.bowl-media` rule**

Find `.bowl-media{grid-area:1/1/2/3;` and replace the whole rule (it runs to the end of the `-webkit-mask-image` declaration) with:

```css
/* Both children occupy the same grid area. The media spans the full stage and
   pins right; the copy sits over its left portion. */
.bowl-media{grid-area:1/1/2/3;justify-self:end;position:relative;z-index:1;
  /* Sizing derived, not eyeballed. In the source frames the bowl is ~52.6% of
     frame width, centred. The mockup wants it ~53% of VIEWPORT width with its
     centre near 75% and its right side cropped by the edge — which a
     box that merely fits the frame's aspect ratio cannot produce, because a
     centred cover-draw would also centre the bowl. So the box is widened past
     the stage (cover then crops top/bottom, zooming the bowl) and pushed right
     far enough that its centre lands at ~72% of the viewport.
     At 1440x900: --bowl-h 680 -> width 1440, bleed 360 -> bowl 757px (53%)
     centred at 1024 (71%). At 1309x720 (the mockup's own size): width 1270,
     bowl 668px (51%) centred at 72%. */
  width:min(calc(var(--bowl-h) * 1920 / 1088 * 1.4), 100vw);
  min-height:var(--bowl-h);overflow:hidden;background:var(--hero-sand);
  margin-right:calc(-1 * var(--gutter) - 25vw); /* bleeds well past the edge */
  /* One feather, not four. The frame's backdrop and --hero-sand are now the
     same colour, so the only edge that still needs to dissolve is the left,
     where the copy sits. The radial stack this replaces existed to hide a
     seam between two different creams. */
  mask-image:linear-gradient(to left,#000 0%,#000 42%,transparent 88%);
  -webkit-mask-image:linear-gradient(to left,#000 0%,#000 42%,transparent 88%)}
```

- [ ] **Step 2: Screenshot the seam at two wide widths**

```bash
node build/verify/shot.js experiment.html .backup/t5-1440.png 1440 900
node build/verify/shot.js experiment.html .backup/t5-1800.png 1800 900
```

View both. Check specifically:
1. No visible vertical edge where the canvas ends and the page background begins — the two creams must be indistinguishable.
2. The bowl is **cropped by the right edge of the viewport**, not sitting fully inside it with sand to its right.
3. No hard corner or rectangle edge visible at the canvas's top or bottom.
4. The bowl does not collide with the headline. The copy column ends around 43% of viewport width; the bowl's left edge should clear it.

- [ ] **Step 2b: Measure the bowl against the mockup and iterate if needed**

Eyeballing "bigger" is not good enough — measure. The bowl is the brightest region of the frame, so its horizontal extent can be read off the rendered canvas directly:

```bash
node -e "
const {connect,open,evaluate}=require('./build/verify/cdp');
const {pathToFileURL}=require('url');const path=require('path');
(async()=>{const{session,close}=await connect();
await open(session,pathToFileURL(path.resolve('experiment.html')).href,1440,900,1400);
console.log(await evaluate(session,\"(function(){var m=document.querySelector('.bowl-media');var r=m.getBoundingClientRect();var vw=window.innerWidth;return{vw:vw,boxLeft:Math.round(r.left),boxRight:Math.round(r.right),boxW:Math.round(r.width),boxCentrePct:Math.round((r.left+r.width/2)/vw*100),bowlDiaPx:Math.round(r.width*0.526),bowlPctOfVw:Math.round(r.width*0.526/vw*100)};})()\"));
await close();})().catch(e=>{console.error(e);process.exit(2)});
"
```

Acceptance targets at 1440x900:
- `bowlPctOfVw` between **48 and 58** (mockup is ~53)
- `boxCentrePct` between **66 and 78** (mockup is ~75)
- `boxRight` greater than `vw` — i.e. the frame genuinely extends past the edge

If a value is outside its band, adjust and re-measure: the `* 1.4` multiplier in `width` scales the bowl, and the `25vw` in `margin-right` moves its centre. Larger multiplier = bigger bowl; larger vw bleed = centre further right. Changing the multiplier also moves the centre, so re-check both after any change.

- [ ] **Step 3: Re-run the overflow gate**

Run: `node build/verify/probe.js experiment.html`

Expected: six `PASS`. This step matters more than usual — `margin-right` with a negative value plus a bleeding element is the exact configuration that produced 616px of real horizontal overflow in this file before (`STATUS.md`, seventh follow-up).

- [ ] **Step 4: Verify**

Probe green, no seam visible at 1440 or 1800.

---

## Task 6: Garnish layer and `--bowl-p` wiring

**Files:**
- Modify: `experiment.html` — markup (new `.bowl-garnish` inside `.bowl-pin-stage`), CSS (new rules), JS (`bowlUpdate`)

- [ ] **Step 1: Add the garnish markup**

Insert as a direct child of `.bowl-pin-stage`, immediately **after** the closing `</div>` of `.bowl-media`:

```html
      <div class="bowl-garnish" aria-hidden="true">
        <img class="bowl-garnish__bit" src="assets/photos/optimized/garnish_tomato_a.jpg" alt="" width="200" height="200" decoding="async" loading="lazy" style="--gx:47%;--gy:12%;--gs:84px;--gdx:150px;--gdy:130px;--gr:38deg">
        <img class="bowl-garnish__bit" src="assets/photos/optimized/garnish_seeds.jpg" alt="" width="200" height="200" decoding="async" loading="lazy" style="--gx:41%;--gy:52%;--gs:62px;--gdx:190px;--gdy:-40px;--gr:-26deg">
        <img class="bowl-garnish__bit" src="assets/photos/optimized/garnish_cucumber.jpg" alt="" width="200" height="200" decoding="async" loading="lazy" style="--gx:52%;--gy:78%;--gs:72px;--gdx:130px;--gdy:-150px;--gr:44deg">
        <img class="bowl-garnish__bit" src="assets/photos/optimized/garnish_tomato_b.jpg" alt="" width="200" height="200" decoding="async" loading="lazy" style="--gx:88%;--gy:8%;--gs:58px;--gdx:-40px;--gdy:120px;--gr:-30deg">
      </div>
```

`--gx`/`--gy` are rest positions within the garnish layer; `--gs` is rendered size; `--gdx`/`--gdy` is the drift vector, each pointing roughly at the bowl's centre from that bit's rest position; `--gr` is end rotation. The four rest positions sit in the open sand between the copy column and the bowl, and above/below the bowl — never over the headline or CTAs.

- [ ] **Step 2: Add the garnish CSS**

Insert directly after the `.bowl-media canvas,.bowl-media img{...}` rule:

```css
/* Garnish is the mechanism, not decoration: these are the ingredients not yet
   in the bowl. They drift toward it and fade as the scrub fills it, so by
   frame 091 they are gone — because they are in the bowl. Every read of the
   progress property is written var(--bowl-p,0): the rAF tick does not run
   before the first scroll event and returns early below 760px, and an
   unguarded var() would make the whole declaration invalid at load. */
.bowl-garnish{grid-area:1/1/2/3;position:relative;z-index:2;pointer-events:none;align-self:stretch}
.bowl-garnish__bit{position:absolute;left:var(--gx);top:var(--gy);
  width:var(--gs);height:var(--gs);
  clip-path:circle(50%);
  filter:drop-shadow(0 10px 16px rgba(42,20,15,.28));
  opacity:clamp(0,1 - var(--bowl-p,0) * 1.35,1);
  transform:translate(calc(var(--gdx) * var(--bowl-p,0)),calc(var(--gdy) * var(--bowl-p,0)))
            rotate(calc(var(--gr) * var(--bowl-p,0)));
  will-change:transform,opacity}
@media (prefers-reduced-motion:reduce){
  .bowl-garnish__bit{transform:none;opacity:.92}
}
/* Below 760px the scrub is off and the static frame shows; at that scale the
   bits crowd the bowl and add overflow risk for no benefit. */
@media (max-width:760px){.bowl-garnish{display:none}}
```

- [ ] **Step 3: Wire `--bowl-p` into the existing rAF tick**

Find `var bowlWrap = document.querySelector('.bowl-pin-wrap');` and add immediately after it:

```js
  var bowlStage = document.querySelector('.bowl-pin-stage');
```

Then in `bowlUpdate()`, find:

```js
      bowlDrawFrame(Math.round(progress * (BOWL_FRAME_COUNT - 1)));
```

and insert directly **before** it:

```js
      // One custom property drives every garnish bit's transform and opacity
      // in CSS — no per-bit JS, no second scroll listener.
      if (bowlStage) bowlStage.style.setProperty('--bowl-p', progress.toFixed(4));
```

This reuses the single existing passive-scroll → rAF tick. Do not add a scroll listener; three competing listeners were deliberately collapsed into one during the premium audit pass.

- [ ] **Step 4: Sample the scrub at three progress points**

Create `build/verify/scrub.js`:

```js
'use strict';
/* usage: node build/verify/scrub.js [file.html] [width] */
const { connect, open, evaluate, screenshot } = require('./cdp');
const { pathToFileURL } = require('url');
const path = require('path');

const file = path.resolve(process.argv[2] || 'experiment.html');
const width = parseInt(process.argv[3] || '1440', 10);

(async () => {
  const { session, close } = await connect();
  await open(session, pathToFileURL(file).href, width, 900);
  const runway = await evaluate(session,
    "(function(){var w=document.querySelector('.bowl-pin-wrap');" +
    "return w.getBoundingClientRect().height - window.innerHeight;})()");
  console.log('runway = ' + Math.round(runway) + 'px');
  for (const f of [0, 0.5, 1]) {
    await evaluate(session, 'window.scrollTo(0,' + Math.round(runway * f) + ')');
    await evaluate(session, 'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
    const r = await evaluate(session,
      "(function(){var s=document.querySelector('.bowl-pin-stage');" +
      "var b=document.querySelector('.bowl-garnish__bit');" +
      "return {p:getComputedStyle(s).getPropertyValue('--bowl-p').trim()," +
      "garnishOpacity:b?getComputedStyle(b).opacity:'(none)'," +
      "stageTop:Math.round(s.getBoundingClientRect().top)};})()");
    console.log('f=' + f + '  --bowl-p=' + r.p + '  garnishOpacity=' + r.garnishOpacity +
                '  stageTop=' + r.stageTop);
    await screenshot(session, '.backup/scrub-' + String(f).replace('.', '_') + '.png');
  }
  await close();
})().catch(e => { console.error(e); process.exit(2); });
```

Run: `node build/verify/scrub.js experiment.html 1440`

Expected:
- `f=0` → `--bowl-p` ≈ `0.0000`, `garnishOpacity` `1`
- `f=0.5` → `--bowl-p` ≈ `0.5000`, `garnishOpacity` ≈ `0.325`
- `f=1` → `--bowl-p` ≈ `1.0000`, `garnishOpacity` `0`
- `stageTop` equal to the header height (84) at every sample — proving the pin held throughout.

- [ ] **Step 5: Look at the three frames**

View `.backup/scrub-0.png`, `.backup/scrub-0_5.png`, `.backup/scrub-1.png`. Confirm: bowl empty with four garnish bits around it → bowl part-built with bits drifted inward and faded → bowl full, no bits. The last frame is the one that should resemble the supplied mockup.

- [ ] **Step 6: Verify**

Run: `node build/verify/probe.js experiment.html` — six `PASS`. Absolutely-positioned children at `left:88%` are a classic overflow source; `overflow-x:clip` on the stage should contain them, and this step proves it. Report the scrub sample lines.

---

## Task 7: The seal

**Files:**
- Modify: `experiment.html` — markup (inside `.bowl-media`), CSS (new rules)

- [ ] **Step 1: Add the seal markup**

Insert as the last child of `.bowl-media`, directly after the `<img class="bowl-visual__photoStatic" ...>` element:

```html
        <div class="bowl-seal" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <defs><path id="sealRing" d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0"/></defs>
            <circle cx="60" cy="60" r="56" fill="var(--hero-sand)" stroke="var(--line-brass)" stroke-width="1"/>
            <text class="bowl-seal__text"><textPath href="#sealRing" startOffset="0">MAROON DOOR · DUBAI · ALL SEVEN EMIRATES · </textPath></text>
            <svg class="doormark" x="44" y="40" width="32" height="40" viewBox="0 0 64 80" fill="none">
  <g class="leaf leaf-l"><path d="M31 78V36C31 17 26 4 15 4C7 4 3 13 3 36V78Z" fill="currentColor"/><circle cx="23" cy="44" r="3.2" fill="none" stroke="var(--brass)" stroke-width="2"/></g>
  <g class="leaf leaf-r"><path d="M33 78V36C33 17 38 4 49 4C57 4 61 13 61 36V78Z" fill="currentColor"/><circle cx="41" cy="44" r="3.2" fill="none" stroke="var(--brass)" stroke-width="2"/></g>
</svg>
          </svg>
        </div>
```

The inner door mark is the existing `.doormark` markup reused byte-for-byte, keeping its `color:var(--maroon)` and its existing reduced-motion handling. `aria-hidden` because the ring text restates the eyebrow and the feature list — it is decoration to a screen reader.

- [ ] **Step 2: Add the seal CSS**

Insert directly after the `.bowl-garnish__bit` rules from Task 6:

```css
/* The mockup's leaf-and-wheat organic seal is the stock device on every food
   site. The brand owns a door mark that nothing else uses at this size, and
   the ring copy avoids "fresh", which is on STATUS.md's unverified-claims
   list. Positioned inside .bowl-media so it travels with the bowl. */
.bowl-seal{position:absolute;top:6%;right:7%;width:clamp(96px,9vw,132px);aspect-ratio:1;z-index:2;pointer-events:none}
.bowl-seal svg{width:100%;height:100%;overflow:visible}
.bowl-seal__text{font-family:'Manrope';font-size:8.6px;font-weight:700;letter-spacing:.18em;fill:var(--maroon);
  transform-origin:60px 60px;animation:seal-spin 24s linear infinite}
@keyframes seal-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.bowl-seal__text{animation:none}}
@media (max-width:760px){.bowl-seal{display:none}}
```

- [ ] **Step 3: Screenshot and inspect**

```bash
node build/verify/shot.js experiment.html .backup/t7-seal.png 1440 900
```

View it. The seal must sit over the top-right of the bowl, the ring text must be legible and follow the circle, the door mark must be centred inside the ring, and the sand fill must match the surrounding background.

If the ring text overflows its circle or wraps onto itself, adjust `font-size` in `.bowl-seal__text` in 0.4px steps. The string is 43 characters including the trailing separator; at r=43 the circumference is ~270px, so ~6.3px per character is the budget.

- [ ] **Step 4: Confirm the animation and its reduced-motion counterpart**

```bash
node -e "
const {connect,open,evaluate}=require('./build/verify/cdp');
const {pathToFileURL}=require('url');const path=require('path');
(async()=>{const{session,close}=await connect();
await open(session,pathToFileURL(path.resolve('experiment.html')).href,1440,900);
console.log(await evaluate(session,\"(function(){var t=document.querySelector('.bowl-seal__text');var cs=getComputedStyle(t);return{name:cs.animationName,dur:cs.animationDuration,hidden:document.querySelector('.bowl-seal').getAttribute('aria-hidden')};})()\"));
await close();})().catch(e=>{console.error(e);process.exit(2)});
"
```

Expected: `{ name: 'seal-spin', dur: '24s', hidden: 'true' }`.

- [ ] **Step 5: Verify**

Run: `node build/verify/probe.js experiment.html` — six `PASS`. Seal renders correctly at 1440, animation confirmed, `aria-hidden` present.

---

## Task 8: The trust rail

**Files:**
- Modify: `experiment.html` — markup (new `.hero-rail` in `.bowl-pin-stage`), CSS (new rules)

- [ ] **Step 1: Add the rail markup**

Insert as the last child of `.bowl-pin-stage`, after the `.bowl-garnish` div:

```html
      <ul class="hero-rail" role="list">
        <li class="hero-rail__cell">
          <span class="hero-rail__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg></span>
          <span class="hero-rail__text"><b>Weekly plans</b><i>Flexible &amp; convenient</i></span>
        </li>
        <li class="hero-rail__cell">
          <span class="hero-rail__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 21V9h4a1 1 0 0 1 1 1v11M2 21h20M8 8h3M8 12h3M8 16h3"/></svg></span>
          <span class="hero-rail__text"><b>Corporate catering</b><i>Offices &amp; film sets</i></span>
        </li>
        <li class="hero-rail__cell">
          <span class="hero-rail__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7l4 4 5-6 5 6 4-4v11H3z"/></svg></span>
          <span class="hero-rail__text"><b>Royal catering</b><i>Celebrations &amp; events</i></span>
        </li>
        <li class="hero-rail__cell">
          <a class="hero-rail__link stretch" href="https://www.instagram.com/themaroondoor.ae/" target="_blank" rel="noopener">
            <span class="hero-rail__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg></span>
            <span class="hero-rail__text"><b>Follow</b><i>@themaroondoor.ae</i></span>
          </a>
        </li>
      </ul>
```

This replaces the mockup's five stars and "Trusted by 1000+ customers across the UAE" with a verifiable line, per the user's decision. Nothing here asserts a figure the site cannot stand behind.

- [ ] **Step 2: Add the rail CSS**

Insert after the seal rules:

```css
/* Sits inside the sticky stage rather than after it, so it stays in the first
   viewport as the mockup shows and releases with the pin. --rail-h is part of
   the --stage-h formula in .bowl-story; changing this rule's height without
   changing that token desynchronises the pin. */
.hero-rail{grid-area:2/1/3/3;display:grid;grid-template-columns:repeat(4,1fr);
  align-items:center;min-height:var(--rail-h);
  border-top:1px solid var(--line-brass)}
.hero-rail__cell{position:relative;display:flex;align-items:center;gap:12px;
  padding:12px clamp(12px,1.6vw,22px);
  border-left:1px solid var(--line);min-width:0}
.hero-rail__cell:first-child{border-left:none;padding-left:0}
.hero-rail__icon{display:flex;align-items:center;justify-content:center;flex:none;
  width:34px;height:34px;color:var(--maroon)}
.hero-rail__icon svg{width:20px;height:20px}
.hero-rail__text{display:flex;flex-direction:column;min-width:0}
.hero-rail__text b{font-size:.66rem;letter-spacing:.09em;text-transform:uppercase;
  font-weight:700;color:var(--oxblood)}
.hero-rail__text i{font-family:'Fraunces';font-style:italic;font-size:var(--t-sm);
  line-height:1.35;color:var(--ink)}
.hero-rail__link{display:flex;align-items:center;gap:12px;color:inherit}
.hero-rail__link:hover .hero-rail__text i{color:var(--maroon)}
@media (max-width:760px){
  .hero-rail{grid-template-columns:repeat(2,1fr)}
  .hero-rail__cell:nth-child(odd){border-left:none;padding-left:0}
  .hero-rail__cell:nth-child(n+3){border-top:1px solid var(--line)}
}
```

- [ ] **Step 2b: Release the rail from the two-column grid on mobile**

`.hero-rail` is placed with an explicit `grid-area:2/1/3/3`, which names **column line 3**. The narrow-viewport media query collapses the stage to a single column, where line 3 does not exist — grid would fabricate an implicit column to satisfy the placement and leak page-level horizontal scroll. The existing query already resets `.bowl-intro` and `.bowl-media` for exactly this reason; the rail needs the same treatment.

Find the media query containing `.bowl-intro{grid-area:auto;max-width:560px;width:100%}` (locate it by that declaration, not by line number) and add two rules inside it:

```css
  .bowl-pin-stage{grid-template-rows:auto}
  .hero-rail{grid-area:auto;width:100%}
```

Adding `grid-template-rows:auto` alongside prevents the `1fr` first row from stretching once the children are auto-placed.

- [ ] **Step 3: Screenshot desktop and mobile**

```bash
node build/verify/shot.js experiment.html .backup/t8-1440.png 1440 900
node build/verify/shot.js experiment.html .backup/t8-390.png 390 844
```

View both. At 1440 the rail must be four cells across the foot of the first viewport with hairline dividers, and the whole composition (header + copy + bowl + rail) must fit without scrolling. At 390 it must be a clean 2×2 with no clipped text.

- [ ] **Step 4: Confirm the pin is still synchronised**

Run: `node build/verify/scrub.js experiment.html 1440`

Expected: `stageTop` equals 84 at all three samples. The rail changed the stage height; if `stageTop` drifts, `--rail-h` and the real rendered rail height have diverged.

- [ ] **Step 5: Verify**

Run: `node build/verify/probe.js experiment.html` — six `PASS`. Rail correct at both widths, `stageTop` stable.

---

## Task 9: Full sweep

**Files:**
- Modify: `experiment.html` only if the sweep finds defects

- [ ] **Step 1: Tag balance across the edited section**

```bash
node -e "
const fs=require('fs');
const s=fs.readFileSync('experiment.html','utf8');
const a=s.indexOf('<section class=\"bowl-story\"');
const b=s.indexOf('<section id=\"what-we-serve\"');
const seg=s.slice(a,b);
for (const t of ['div','ul','li','svg','span','a','p','section']) {
  const o=(seg.match(new RegExp('<'+t+'[\\\\s>]','g'))||[]).length;
  const c=(seg.match(new RegExp('</'+t+'>','g'))||[]).length;
  console.log(t.padEnd(8), 'open='+o, 'close='+c, o===c?'OK':'MISMATCH');
}"
```

Expected: `OK` on every row except `section`, which is open=1 close=0 because the slice ends before `.bowl-story`'s own closing tag.

- [ ] **Step 2: Overflow gate at all six widths**

Run: `node build/verify/probe.js experiment.html`

Expected: six `PASS`, `all widths clean`, exit 0. 360 and 390 go through `Emulation.setDeviceMetricsOverride`, so they are genuine narrow-viewport checks rather than the cropped-PNG false positive the CLI path produces on Windows.

- [ ] **Step 3: Scrub integrity**

Run: `node build/verify/scrub.js experiment.html 1440`

Expected: `--bowl-p` 0 → 0.5 → 1, garnish opacity 1 → ~0.325 → 0, `stageTop` 84 throughout.

- [ ] **Step 4: Reduced-motion pass**

```bash
node -e "
const {connect,open,evaluate,screenshot}=require('./build/verify/cdp');
const {pathToFileURL}=require('url');const path=require('path');
(async()=>{const{session,close}=await connect();
await session.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await open(session,pathToFileURL(path.resolve('experiment.html')).href,1440,900);
console.log(await evaluate(session,\"(function(){var t=document.querySelector('.bowl-seal__text');var b=document.querySelector('.bowl-garnish__bit');return{seal:getComputedStyle(t).animationName,garnishTransform:getComputedStyle(b).transform,garnishOpacity:getComputedStyle(b).opacity};})()\"));
await screenshot(session,'.backup/t9-reduced.png');
await close();})().catch(e=>{console.error(e);process.exit(2)});
"
```

Expected: `seal: 'none'`, `garnishTransform: 'none'`, `garnishOpacity: '0.92'`.

- [ ] **Step 5: Keyboard focus**

```bash
node -e "
const {connect,open,evaluate,screenshot}=require('./build/verify/cdp');
const {pathToFileURL}=require('url');const path=require('path');
(async()=>{const{session,close}=await connect();
await open(session,pathToFileURL(path.resolve('experiment.html')).href,1440,900);
console.log(await evaluate(session,\"(function(){var els=document.querySelectorAll('.bowl-intro__ctas a, .hero-rail__link');return Array.prototype.map.call(els,function(e){e.focus();var cs=getComputedStyle(e);return{text:e.textContent.trim().slice(0,28),outline:cs.outlineStyle+' '+cs.outlineWidth,active:document.activeElement===e};});})()\"));
await close();})().catch(e=>{console.error(e);process.exit(2)});
"
```

Expected: three entries (two hero CTAs plus the Instagram link), each `active: true` with a non-`none` outline style.

- [ ] **Step 6: Final screenshots at every breakpoint**

```bash
for w in 360 390 768 1024 1440 1800; do
  node build/verify/shot.js experiment.html .backup/final-$w.png $w 900
done
```

View all six. Confirm at each: no horizontal clipping, the headline reads cleanly, the rail is intact, and the bowl is positioned sensibly for that width. Below 768 the static `frame_091` image replaces the canvas and the garnish and seal are hidden.

- [ ] **Step 7: Compare against the mockup**

View `.backup/scrub-1.png` (from Step 3) beside the user's supplied mockup. The composition at scrub completion should match: copy left on sand, full bowl bleeding right, seal over the bowl's top-right, four-cell rail beneath.

Documented deviations, all deliberate — do not "fix" these:
- Ring text reads MAROON DOOR · DUBAI · ALL SEVEN EMIRATES, not FRESH INGREDIENTS · HONEST FOOD.
- Fourth rail cell is the Instagram handle, not five stars and a customer count.
- Menu CTA reads "See Dadi's menu", not "Explore the menu".
- Third feature reads "Delivered from Dubai.", not "Delivered fresh across the UAE".
- No blurred foreground leaves at the far left and right edges.

- [ ] **Step 8: Verify and report**

Report: the six probe lines, the three scrub sample lines, the reduced-motion object, the focus array, and a one-line judgement on how `.backup/scrub-1.png` compares to the mockup. Flag anything that did not match expectations rather than smoothing over it.

---

## Post-implementation

Update `STATUS.md` with a dated entry covering: the re-layout, the teaser-gate removal, the `--hero-sand` token and why it was measured rather than chosen, the four derived garnish assets, and the new persistent harness in `build/verify/` (noting it replaces the lost scratchpad scripts). Record any real bug caught during verification — that file's value is in its record of what actually broke.

Open items to carry forward, from the spec:
1. The Instagram URL `https://www.instagram.com/themaroondoor.ae/` is derived from the handle in `BRAND.md` and has not been confirmed against the live profile.
2. Garnish bits are derived from rendered frames, not Maroon Door's own food photography. If real photography arrives it is a four-file swap with no markup change.
