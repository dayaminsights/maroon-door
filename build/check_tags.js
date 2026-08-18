const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const stripped = html.replace(/<style[\s\S]*?<\/style>/, '').replace(/<script[\s\S]*?<\/script>/, '');

const tags = ['div', 'section', 'header', 'footer', 'nav', 'h1', 'h2', 'h3', 'h4', 'p', 'a', 'span', 'blockquote', 'cite', 'svg', 'g'];
for (const tag of tags) {
  const openRe = new RegExp('<' + tag + '(?:[\\s/][^>]*)?>', 'g');
  const closeRe = new RegExp('</' + tag + '>', 'g');
  const open = (stripped.match(openRe) || []).length;
  const close = (stripped.match(closeRe) || []).length;
  console.log(tag + ': open=' + open + ' close=' + close + (open === close ? ' OK' : ' MISMATCH'));
}
const imgCount = (stripped.match(/<img(?:\s[^>]*)?>/g) || []).length;
console.log('img count=' + imgCount);
