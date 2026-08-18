// Builds ../index.html from template.html + fonts.css + photo/logo assets.
// Run from anywhere: `node build/build.js`
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

let html = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
const fonts = fs.readFileSync(path.join(__dirname, 'fonts.css'), 'utf8');

html = html.replace('/*__FONTS__*/', fonts);

const photoDir = path.join(ROOT, 'assets/photos/optimized');
const photoMap = {
  hero_main: 'hero_main.jpg',
  hero_door: 'hero_door.jpg',
  dish_lamb: 'dish_lamb.jpg',
  dish_kebab: 'dish_kebab.jpg',
  dish_biryani: 'dish_biryani.jpg',
  dish_butterchicken: 'dish_butterchicken.jpg',
  dish_seekh: 'dish_seekh.jpg',
  dish_malaitikka: 'dish_malaitikka.jpg',
  dish_nihari: 'dish_nihari.jpg',
  corporate: 'corporate.jpg',
  mealplan: 'mealplan.jpg',
  ambience: 'ambience.jpg',
};
for (const [key, file] of Object.entries(photoMap)) {
  const buf = fs.readFileSync(path.join(photoDir, file));
  const dataUri = `data:image/jpeg;base64,${buf.toString('base64')}`;
  html = html.split(`__IMG_${key}__`).join(dataUri);
}

const logoBuf = fs.readFileSync(path.join(ROOT, 'assets/brand/optimized/logo-300.png'));
const logoUri = `data:image/png;base64,${logoBuf.toString('base64')}`;
html = html.split('__IMG_logo__').join(logoUri);

// bowl.webp needs alpha (transparent outside the circular dish), so it's kept
// separate from photoMap above rather than forced through the jpeg mime type.
const bowlBuf = fs.readFileSync(path.join(photoDir, 'bowl.webp'));
const bowlUri = `data:image/webp;base64,${bowlBuf.toString('base64')}`;
html = html.split('__IMG_bowl__').join(bowlUri);

// Decorative line-art door mark — illustrated Royal Catering card only now.
// (Used to also flourish the hero, but the hero is real branded photography as
// of hero1.png and already carries the real logo baked in — a second mark on
// top of it would be redundant.)
const doormark = `<svg class="doormark" viewBox="0 0 64 80" fill="none" aria-hidden="true">
  <g class="leaf leaf-l"><path d="M31 78V36C31 17 26 4 15 4C7 4 3 13 3 36V78Z" fill="currentColor"/><circle cx="23" cy="44" r="3.2" fill="none" stroke="var(--brass)" stroke-width="2"/></g>
  <g class="leaf leaf-r"><path d="M33 78V36C33 17 38 4 49 4C57 4 61 13 61 36V78Z" fill="currentColor"/><circle cx="41" cy="44" r="3.2" fill="none" stroke="var(--brass)" stroke-width="2"/></g>
</svg>`;
['__DOORMARK_CARD__'].forEach(ph => {
  html = html.split(ph).join(doormark);
});

const waIcon = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.19c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.26-.28.57-.35.76-.35h.55c.18 0 .42-.07.65.5.24.58.81 2 .88 2.14.07.14.11.3.02.49-.09.19-.14.3-.28.46-.14.16-.29.36-.42.48-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.07.95 1.97 1.25 2.25 1.39.28.14.44.12.6-.07.16-.19.68-.79.87-1.06.19-.28.37-.23.62-.14.26.09 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.36z"/></svg>`;
['__ICON_WA__', '__ICON_WA_SM__'].forEach(ph => {
  html = html.split(ph).join(waIcon);
});

fs.writeFileSync(path.join(ROOT, 'index.html'), html);
console.log('wrote index.html —', Buffer.byteLength(html), 'bytes');
const leftover = html.match(/__[A-Z_]+__/g);
if (leftover) console.log('WARNING remaining placeholders:', leftover);
