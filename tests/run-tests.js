// Usage: node tests/run-tests.js [game ...]      (needs the playwright package)
const path = require('path');
const { serve, launch, runSpecs } = require('./harness');
const ALL = require('./specs');
(async () => {
  const want = process.argv.slice(2);
  const specs = want.length ? ALL.filter((s) => want.includes(s.game)) : ALL;
  const { server, base } = await serve(path.resolve(__dirname, '..'));
  const browser = await launch();
  const res = await runSpecs(browser, base, specs, (r) => console.log(`${r.ok ? 'PASS' : 'FAIL'}  [${r.game}] ${r.name}  (${r.secs}s)${r.ok ? '' : '\n      → ' + r.err}`), path.resolve(__dirname, '..'));
  await browser.close(); server.close();
  const failed = res.filter((r) => !r.ok).length;
  console.log(`\n${res.length - failed}/${res.length} passed`);
  process.exit(failed ? 1 : 0);
})();
