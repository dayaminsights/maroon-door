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

/* settleMs matters more than it looks. Two rAFs (~32ms) flush layout and let a
   scroll-driven rAF tick paint, which is all the overflow probe needs — but the
   page's .reveal items are a .7s opacity transition with a per-item
   `transition-delay: calc(var(--i) * 80ms)` stagger, so at 32ms the hero copy is
   still at opacity 0. Screenshotting or reading computed opacity that early
   reports a mid-animation frame as if it were the finished page. Anything
   asserting on appearance must pass a settle. */
async function open(session, fileUrl, width, height, settleMs) {
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: width, height: height || 900, deviceScaleFactor: 1, mobile: false
  });
  const loaded = session.once('Page.loadEventFired');
  await session.send('Page.navigate', { url: fileUrl });
  await loaded;
  await evaluate(session, 'new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
  if (settleMs) await sleep(settleMs);
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
