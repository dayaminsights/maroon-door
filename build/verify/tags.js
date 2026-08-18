'use strict';
/* Open/close tag balance for one section of the page.
   Deliberately a file rather than a `node -e` one-liner: the open-tag pattern
   needs a `[\s>]` character class, and shell quoting mangles the backslash
   often enough that the count silently comes back 0 and reads as a mismatch.

   usage: node build/verify/tags.js [file.html] [startMarker] [endMarker] */
const fs = require('fs');

const file = process.argv[2] || 'experiment.html';
const startMarker = process.argv[3] || '<section class="bowl-story"';
const endMarker = process.argv[4] || '<section id="what-we-serve"';

const src = fs.readFileSync(file, 'utf8');
const a = src.indexOf(startMarker);
const b = src.indexOf(endMarker);
if (a < 0) { console.error('start marker not found: ' + startMarker); process.exit(2); }
if (b < 0) { console.error('end marker not found: ' + endMarker); process.exit(2); }
const seg = src.slice(a, b);

/* The slice ends at the NEXT section's opening tag, which is after
   .bowl-story's own </section> — so every tag including `section` balances. */
const EXPECTED_UNBALANCED = {};

let bad = 0;
for (const t of ['div', 'ul', 'li', 'svg', 'span', 'a', 'p', 'section']) {
  const open = (seg.match(new RegExp('<' + t + '[\\s>/]', 'g')) || []).length;
  const close = (seg.match(new RegExp('</' + t + '>', 'g')) || []).length;
  const delta = open - close;
  const ok = delta === (EXPECTED_UNBALANCED[t] || 0);
  if (!ok) bad++;
  console.log(
    t.padEnd(8) + 'open=' + String(open).padEnd(5) +
    'close=' + String(close).padEnd(5) +
    'delta=' + String(delta).padEnd(4) + (ok ? 'OK' : 'MISMATCH')
  );
}
console.log(bad ? bad + ' tag(s) unbalanced' : 'all tags balanced');
process.exit(bad ? 1 : 0);
