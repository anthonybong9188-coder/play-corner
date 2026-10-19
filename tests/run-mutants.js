// Mutation check: plant each bug alone in a copy of the site and confirm its game's tests fail.
// Usage: node tests/run-mutants.js [mutantId ...]
const fs = require('fs'), path = require('path'), os = require('os');
const { serve, launch, runSpecs } = require('./harness');
const SPECS = require('./specs');
const MUTANTS = require('./mutants');
const ROOT = path.resolve(__dirname, '..');

function copySite(dst) {
  fs.cpSync(ROOT, dst, { recursive: true, filter: (s) => !/[\\/](\.git|node_modules|tests)([\\/]|$)/.test(s.slice(ROOT.length)) });
}

(async () => {
  const pick = process.argv.slice(2);
  const list = pick.length ? MUTANTS.filter((m) => pick.includes(m.id)) : MUTANTS;
  // every planted bug must hit exactly one spot in the current code
  const edits = (m) => m.edits || [{ find: m.find, repl: m.repl }];
  for (const m of list) for (const e of edits(m)) {
    const n = fs.readFileSync(path.join(ROOT, m.file), 'utf8').split(e.find).length - 1;
    if (n !== 1) { console.error(`${m.id}: pattern found ${n}x in ${m.file} — fix the mutant`); process.exit(2); }
  }
  const browser = await launch();
  const out = [];
  for (const m of list) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mut-'));
    copySite(dir);
    const f = path.join(dir, m.file);
    let src = fs.readFileSync(f, 'utf8');
    for (const e of edits(m)) src = src.replace(e.find, e.repl);
    fs.writeFileSync(f, src);
    const { server, base } = await serve(dir);
    const specs = SPECS.filter((s) => m.games.includes(s.game));
    const res = await runSpecs(browser, base, specs, () => {}, dir);
    server.close(); fs.rmSync(dir, { recursive: true, force: true });
    const caught = res.find((r) => !r.ok);
    const row = { id: m.id, what: m.what, killed: !!caught, by: caught ? `${caught.name} → ${caught.err}` : '' };
    out.push(row);
    console.log(`${row.killed ? 'KILLED  ' : 'SURVIVED'} ${m.id} ${m.what}${row.killed ? '\n          caught by: ' + row.by.slice(0, 160) : ''}`);
  }
  await browser.close();
  const k = out.filter((r) => r.killed).length;
  console.log(`\nMutation score: ${k}/${out.length} planted bugs caught (${Math.round(k / out.length * 100)}%)`);
  fs.writeFileSync(path.join(os.tmpdir(), 'mutation-report.json'), JSON.stringify(out, null, 2));
  process.exit(0);
})();
