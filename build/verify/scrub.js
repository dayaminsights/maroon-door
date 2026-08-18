'use strict';
/* usage: node build/verify/scrub.js [file.html] [width] */
const { connect, open, evaluate, screenshot } = require('./cdp');
const { pathToFileURL } = require('url');
const path = require('path');

const file = path.resolve(process.argv[2] || 'experiment.html');
const width = parseInt(process.argv[3] || '1440', 10);

(async () => {
  const { session, close } = await connect();
  await open(session, pathToFileURL(file).href, width, 900, 1400);
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
