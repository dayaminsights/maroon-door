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
