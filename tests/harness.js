// Test harness: tiny static server + headless phone-sized browser + speech stub.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

function serve(root) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split('?')[0]);
      let f = path.join(root, p);
      if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) {
        if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '') }); return res.end(); }
        f = path.join(f, 'index.html');
      }
      fs.readFile(f, (err, data) => {
        if (err) { res.writeHead(404); return res.end('not found'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, base: 'http://localhost:' + server.address().port + '/' }));
  });
}

// Runs in the page before any game code: records what would be spoken instead of speaking.
function speechStub() {
  window.__said = [];
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  try {
    const ss = window.speechSynthesis;
    ss.speak = (u) => window.__said.push({ text: u.text, lang: u.lang, voice: u.voice ? u.voice.lang : null });
    ss.cancel = () => {};
    if (window.__fakeVoices) ss.getVoices = () => window.__fakeVoices;
  } catch (e) {}
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function assert(cond, msg) { if (!cond) throw new Error(msg); }

async function launch() {
  return chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
}

async function runSpecs(browser, base, specs, log = () => {}, root) {
  const results = [];
  for (const spec of specs) {
    const t0 = Date.now();
    const ctx = await browser.newContext({
      viewport: { width: 412, height: 780 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
      serviceWorkers: spec.sw ? 'allow' : 'block', permissions: ['microphone']
    });
    if (spec.voices) await ctx.addInitScript((v) => { window.__fakeVoices = v; }, spec.voices);
    await ctx.addInitScript(speechStub);
    let own = null, b = base;
    if (spec.sw && root) { own = await serve(root); b = own.base; }
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    let ok = true, err = '';
    try {
      await Promise.race([
        spec.fn(page, { base: b, ctx, sleep, assert, said: () => page.evaluate(() => window.__said.map((s) => s.text)),
          serverDown: async () => { if (!own) throw new Error('no own server'); own.server.closeAllConnections(); await new Promise((r) => own.server.close(r)); } }),
        sleep(spec.timeout || 90000).then(() => { throw new Error('timed out'); })
      ]);
      if (errors.length) throw new Error('page error: ' + errors[0]);
    } catch (e) { ok = false; err = (e && e.message || String(e)).split('\n')[0].slice(0, 200); }
    await ctx.close().catch(() => {});
    if (own) { try { own.server.closeAllConnections(); own.server.close(); } catch (e) {} }
    const r = { game: spec.game, name: spec.name, ok, err, secs: ((Date.now() - t0) / 1000).toFixed(1) };
    results.push(r); log(r);
  }
  return results;
}

module.exports = { serve, launch, runSpecs, sleep, assert };
