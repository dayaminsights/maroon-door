'use strict';
/* usage: node build/verify/shot.js <file.html> <out.png> <width> [height] [scrollY] [settleMs]
   settleMs defaults to 1400 so the staggered .reveal transitions have finished;
   without it every screenshot catches the hero copy mid-fade. */
const { connect, open, evaluate, screenshot } = require('./cdp');
const { pathToFileURL } = require('url');
const path = require('path');

const file = path.resolve(process.argv[2]);
const out = path.resolve(process.argv[3]);
const width = parseInt(process.argv[4], 10);
const height = parseInt(process.argv[5] || '900', 10);
const scrollY = parseInt(process.argv[6] || '0', 10);
const settleMs = parseInt(process.argv[7] || '1400', 10);

(async () => {
  const { session, close } = await connect();
  await open(session, pathToFileURL(file).href, width, height, settleMs);
  if (scrollY) {
    await evaluate(session, 'window.scrollTo(0,' + scrollY + ')');
    await evaluate(session, 'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  }
  await screenshot(session, out);
  await close();
  console.log('wrote ' + out + ' at ' + width + 'x' + height +
              ' scrollY=' + scrollY + ' settle=' + settleMs + 'ms');
})().catch(e => { console.error(e); process.exit(2); });
