// Rule tests for every game. Each spec opens a page and checks how the game must behave.
const tap = (page, sel, i = 0) => page.locator(sel).nth(i).evaluate((el) => {
  const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: x, clientY: y, pointerId: 1 }));
  el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: x, clientY: y, pointerId: 1 }));
  el.click();
});

// ---------------------------------------------------------------- Match the Cards
async function playMatch(page, h, zh) {
  const { assert, sleep } = h;
  const cards = page.locator('.card');
  const n = await cards.count();
  assert(n === 20, 'board should have 20 cards, has ' + n);
  assert((await page.locator('.card.open').count()) === 0, 'all cards start face down');
  const cls = (i) => cards.nth(i).getAttribute('class');
  const label = (i) => cards.nth(i).getAttribute('aria-label');
  const num = async (sel) => parseInt((await page.textContent(sel)).split('/')[0], 10);
  const labels = {}, matchedBy = new Set();
  let attempts = 0, lockChecked = false;

  const tryPair = async (a, b) => {
    const pairsBefore = await num('#pairs');
    await cards.nth(a).click(); await cards.nth(b).click();
    attempts++;
    const la = await label(a), lb = await label(b);
    labels[a] = la; labels[b] = lb;
    assert((await cls(a)).includes('open') && (await cls(b)).includes('open'), 'both picked cards turn face up');
    assert((await num('#tries')) === attempts, 'tries counts every pair of picks');
    if (la === lb) {
      await page.waitForFunction(([x, y]) => { const c = document.querySelectorAll('.card'); return c[x].classList.contains('matched') && c[y].classList.contains('matched'); }, [a, b], { timeout: 1500 });
      assert((await num('#pairs')) === pairsBefore + 1, 'a match adds a pair');
      matchedBy.add(la);
    } else {
      if (!lockChecked) {
        // while two unmatched cards are showing, a third tap must be ignored
        const k = [...Array(n).keys()].find((k) => k !== a && k !== b && !labels[k]);
        if (k !== undefined) { await cards.nth(k).click(); await sleep(120); assert(!(await cls(k)).includes('open'), 'a third card must not open while two are showing'); lockChecked = true; }
      }
      await sleep(1450);
      assert(!(await cls(a)).includes('open') && !(await cls(b)).includes('open'), 'non-matching cards flip back face down');
      assert((await num('#pairs')) === pairsBefore, 'a miss adds no pair');
    }
  };

  for (let i = 0; i < n; i += 2) await tryPair(i, i + 1);
  h.assert(matchedBy.size < 6, 'the deck should be shuffled (too many neighbours already match)');
  const all = Object.values(labels);
  const counts = {}; all.forEach((l) => { counts[l] = (counts[l] || 0) + 1; });
  assert(Object.keys(counts).length === 10, 'there should be 10 different pictures, found ' + Object.keys(counts).length);
  assert(Object.values(counts).every((c) => c === 2), 'every picture appears exactly twice');
  for (const l of Object.keys(counts)) {
    if (matchedBy.has(l)) continue;
    const [a, b] = Object.keys(labels).filter((k) => labels[k] === l).map(Number);
    await tryPair(a, b);
  }
  await page.waitForSelector('#win.show', { timeout: 2500 });
  assert((await num('#pairs')) === 10, 'all 10 pairs found');
  assert((await page.textContent('#win-text')).includes(String(attempts)), 'win message shows the number of tries');
  if (zh) return labels;
  await page.click('#again');
  await sleep(200);
  assert((await num('#pairs')) === 0 && (await num('#tries')) === 0, 'play again resets pairs and tries');
  assert((await page.locator('.card.open, .card.matched').count()) === 0, 'play again turns all cards face down');
  return labels;
}

// ---------------------------------------------------------------- Penalty Kick
const PEN_READ = `(() => { const k = document.getElementById('keeper').getAttribute('transform') || '';
  const a = document.getElementById('arrow');
  return { kx: +((/translate\\(([-\\d.]+)/.exec(k) || [0, 0])[1]), deg: +((/rotate\\(([-\\d.]+)/.exec(a.getAttribute('transform') || '') || [0, 0])[1]),
           arrow: a.style.display !== 'none' }; })()`;

async function penaltyKickWhen(page, want) {
  return page.evaluate(([want, READ]) => new Promise((res) => {
    const read = () => eval(READ), ball = document.getElementById('ball'), t0 = performance.now();
    const tick = () => {
      const s = read(), xt = 206 + Math.tan(s.deg * Math.PI / 180) * 220 * 0.86, d = Math.abs(xt - s.kx);
      const ok = s.arrow && Math.abs(xt - 206) < 150 && (want === 'goal' ? d > 100 : d < 12);
      if (ok) { ball.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return res({ xt, kx: s.kx }); }
      if (performance.now() - t0 > 20000) return res(null);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), [want, PEN_READ]);
}

// ---------------------------------------------------------------- specs
module.exports = [
  // ===== Match the Cards
  { game: 'match', name: 'pairs, flip-back, lock, win and restart', fn: async (page, h) => {
    await page.goto(h.base + 'match/'); await page.waitForSelector('.card');
    await playMatch(page, h, false);
  }},
  { game: 'match-zh', name: 'each character pairs with its picture and is spoken', fn: async (page, h) => {
    await page.goto(h.base + 'match/?set=zh'); await page.waitForSelector('.card');
    const kinds = await page.$$eval('.card .front', (fs) => fs.map((f) => (f.classList.contains('pic') ? 'pic' : f.querySelector('.hz') ? 'hz' : 'other')));
    h.assert(kinds.filter((k) => k === 'pic').length === 10 && kinds.filter((k) => k === 'hz').length === 10, 'needs 10 picture cards and 10 character cards');
    const labels = await playMatch(page, h, true);
    // each label's two cards must be one picture + one character
    const byLabel = {};
    Object.entries(labels).forEach(([i, l]) => { (byLabel[l] = byLabel[l] || []).push(kinds[i]); });
    h.assert(Object.values(byLabel).every((ks) => ks.sort().join() === 'hz,pic'), 'every pair is one picture + one character');
    const said = await h.said();
    h.assert(said.includes('日') && said.includes('水'), 'characters are spoken when flipped');
  }},

  // ===== Penalty Kick
  { game: 'penalty', name: 'arrow sweeps 90°, goalie stays in the goal', fn: async (page, h) => {
    await page.goto(h.base + 'penalty/'); await page.waitForSelector('#keeper');
    const r = await page.evaluate((READ) => new Promise((res) => {
      const out = { dmin: 99, dmax: -99, kmin: 999, kmax: -999 }, t0 = performance.now();
      const tick = () => { const s = eval(READ);
        out.dmin = Math.min(out.dmin, s.deg); out.dmax = Math.max(out.dmax, s.deg); out.kmin = Math.min(out.kmin, s.kx); out.kmax = Math.max(out.kmax, s.kx);
        if (performance.now() - t0 > 4200) res(out); else requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }), PEN_READ);
    h.assert(r.dmin >= -45.5 && r.dmin <= -40 && r.dmax <= 45.5 && r.dmax >= 40, `arrow should swing -45°..45°, saw ${r.dmin.toFixed(1)}..${r.dmax.toFixed(1)}`);
    h.assert(r.kmin >= 50 && r.kmax <= 362, `goalie must stay between the posts, saw x ${r.kmin.toFixed(0)}..${r.kmax.toFixed(0)}`);
    h.assert(r.kmax - r.kmin > 250, 'goalie should slide across most of the goal');
  }},
  { game: 'penalty', name: 'goals, saves, jump, score and end of round', timeout: 120000, fn: async (page, h) => {
    await page.goto(h.base + 'penalty/'); await page.waitForSelector('#keeper');
    let goals = 0, misses = 0;
    const banner = () => page.evaluate(() => ['bGoal', 'bSave', 'bPost'].find((id) => document.getElementById(id).classList.contains('show')) || 'none');
    for (let k = 0; k < 5; k++) {
      const want = k === 1 || k === 3 ? 'save' : 'goal';
      const shot = await penaltyKickWhen(page, want);
      h.assert(shot, 'could not line up a ' + want);
      if (want === 'save') { await h.sleep(450); h.assert(await page.evaluate(() => document.getElementById('armsUp').style.display !== 'none'), 'goalie jumps with arms up'); await h.sleep(350); }
      else await h.sleep(800);
      const b = await banner();
      h.assert(b === (want === 'goal' ? 'bGoal' : 'bSave'), `shot far from goalie should be a goal and one at him a save (wanted ${want}, got ${b})`);
      if (b === 'bGoal') goals++; else misses++;
      await page.waitForFunction(() => !document.querySelector('.banner.show'), null, { timeout: 4000 });
    }
    await page.waitForSelector('#done.show', { timeout: 4000 });
    h.assert((await page.textContent('#goals')).trim() === String(goals), 'goal counter matches goals scored');
    h.assert((await page.locator('.dot.goal').count()) === goals && (await page.locator('.dot.miss').count()) === misses, 'score dots match');
    h.assert((await page.textContent('#done-text')).includes(`${goals} out of 5`), 'end message shows the score');
  }},

  // ===== Balloon Pop
  { game: 'balloon', name: 'balloons rise; right colour counts, wrong does not; round advances', fn: async (page, h) => {
    await page.goto(h.base + 'balloon/');
    await page.waitForSelector('.balloon', { timeout: 4000 });
    const y = () => page.locator('.balloon').first().evaluate((el) => +(/,\s*([-\d.]+)px/.exec(el.style.transform) || [0, 0])[1]);
    const y0 = await y(); await h.sleep(500); const y1 = await y();
    h.assert(y1 < y0 - 10, 'balloons float upwards');
    const colour = (await page.textContent('#goalText')).match(/Pop 5 (\w+)/)[1];
    const pips = () => page.locator('.pip.on').count();
    let wrongDone = false;
    for (let t = 0; t < 120 && (await pips()) < 5; t++) {
      const labs = await page.$$eval('.balloon', (bs) => bs.map((b) => b.getAttribute('aria-label')));
      const wi = labs.findIndex((l) => !l.startsWith(colour)), ri = labs.findIndex((l) => l.startsWith(colour));
      if (!wrongDone && wi >= 0) { const p0 = await pips(); await tap(page, '.balloon', wi); await h.sleep(120); h.assert((await pips()) === p0, 'a wrong colour must not count'); wrongDone = true; }
      if (ri >= 0) { const p0 = await pips(); await tap(page, '.balloon', ri); await h.sleep(80); if (!(await page.locator('#cheer.show').count())) h.assert((await pips()) === p0 + 1, 'popping the right colour counts'); }
      await h.sleep(200);
    }
    await page.waitForSelector('#cheer.show', { timeout: 1500 });
    await page.waitForFunction(() => document.getElementById('round').textContent === 'Round 2', null, { timeout: 4000 });
    h.assert((await pips()) === 0, 'new round starts at 0');
  }},
  { game: 'balloon-zh', name: 'Mandarin prompt and colour spoken on pop', fn: async (page, h) => {
    await page.goto(h.base + 'balloon/?lang=zh'); await page.waitForSelector('.balloon', { timeout: 4000 });
    const g = await page.textContent('#goalText');
    const CN = { '红色': 'red', '蓝色': 'blue', '黄色': 'yellow', '绿色': 'green', '紫色': 'purple' };
    const hz = Object.keys(CN).find((k) => g.includes(k));
    h.assert(g.includes('请你点') && hz, 'prompt reads 请你点…的气球');
    for (let t = 0; t < 60; t++) {
      const labs = await page.$$eval('.balloon', (bs) => bs.map((b) => b.getAttribute('aria-label')));
      const ri = labs.findIndex((l) => l.startsWith(CN[hz]));
      if (ri >= 0) { await tap(page, '.balloon', ri); break; }
      await h.sleep(200);
    }
    await h.sleep(200);
    h.assert((await h.said()).some((s) => s.includes(hz)), 'the colour is spoken in Mandarin');
  }},

  // ===== Feed the Animals
  { game: 'feed', name: 'right food counts, wrong food is refused, rounds advance', timeout: 150000, fn: async (page, h) => {
    for (let i = 0; i < 15; i++) {
      await page.goto(h.base + 'feed/'); await page.waitForSelector('.food');
      const n = +((await page.textContent('#goalText')).match(/wants (\d)/) || [0, 0])[1];
      h.assert(n >= 1 && n <= 3, 'the first animal asks for 1–3, asked for ' + n);
    }
    await page.goto(h.base + 'feed/'); await page.waitForSelector('.food');
    const FOOD = { Bunny: 'carrot', Monkey: 'banana', Doggy: 'bone', Kitty: 'fish', Chick: 'corn' };
    let prevName = '';
    for (let round = 1; round <= 4; round++) {
      const goal = await page.textContent('#goalText');
      const m = goal.match(/^(\w+) wants (\d) /); h.assert(m, 'goal sentence: ' + goal);
      const name = m[1], need = +m[2], want = FOOD[name];
      h.assert(need >= 1 && need <= (round <= 2 ? 3 : 5), `round ${round} asks for ${need}`);
      if (prevName) h.assert(name !== prevName, 'a different animal comes next');
      const labels = () => page.$$eval('.food', (bs) => bs.map((b) => b.getAttribute('aria-label')));
      if (round === 1) {
        const wi = (await labels()).findIndex((l) => l !== want && l !== 'empty');
        await tap(page, '.food', wi);
        await page.waitForSelector('#animal.shake', { timeout: 1200 });
        await h.sleep(1300);
        h.assert((await page.locator('.pip.on').count()) === 0, 'wrong food must not count');
      }
      for (let k = 1; k <= need; k++) {
        const ls = await labels(); const ri = ls.indexOf(want);
        h.assert(ri >= 0, `the tray must always hold the food the animal wants (round ${round}, bite ${k})`);
        await tap(page, '.food', ri);
        await h.sleep(1050);
        if (k < need) h.assert((await page.locator('.pip.on').count()) === k, 'each right bite fills one pip');
      }
      await page.waitForSelector('#bubble.show', { timeout: 1500 });
      prevName = name;
      await page.waitForFunction((g) => document.getElementById('goalText').textContent !== g, goal, { timeout: 4000 });
      await h.sleep(150);
    }
  }},
  { game: 'feed', name: 'worst case: wants 5 with unhelpful refills — the tray never runs out', timeout: 90000, fn: async (page, h) => {
    await page.goto(h.base + 'feed/'); await page.waitForSelector('.food');
    const FOOD = { Bunny: 'carrot', Monkey: 'banana', Doggy: 'bone', Kitty: 'fish', Chick: 'corn' };
    let goal = '';
    for (let i = 0; i < 200; i++) { goal = await page.textContent('#goalText'); if (/wants 5 /.test(goal) && i > 2) break; await page.click('#restart'); await h.sleep(40); }
    h.assert(/wants 5 /.test(goal), 'could not get an animal that wants 5');
    const want = FOOD[goal.split(' ')[0]];
    // from now on every "random" refill comes out unhelpful
    await page.evaluate(() => { const seq = [0.4, 0.6, 0.8, 0.95, 0.45]; let i = 0; Math.random = () => seq[i++ % seq.length]; });
    for (let k = 1; k <= 5; k++) {
      const ls = await page.$$eval('.food', (bs) => bs.map((b) => b.getAttribute('aria-label')));
      h.assert(ls.includes(want), `bite ${k}: the tray has no ${want} left`);
      await tap(page, '.food', ls.indexOf(want)); await h.sleep(1000);
    }
    await page.waitForSelector('#bubble.show', { timeout: 1500 });
  }},
  { game: 'feed-zh', name: 'Mandarin sentence uses 两 and the right measure word; counts aloud', timeout: 60000, fn: async (page, h) => {
    await page.goto(h.base + 'feed/?lang=zh'); await page.waitForSelector('.food');
    let sawTwo = false, sawCat = false;
    for (let i = 0; i < 120 && !(sawTwo && sawCat); i++) {
      const s = await page.textContent('#goalText');
      h.assert(/^(小兔|猴子|小狗|小猫|小鸡)要(一|两|三|四|五)(根|条)(萝卜|香蕉|骨头|鱼|玉米)!$/.test(s), 'sentence shape: ' + s);
      h.assert(s.startsWith('小猫') ? s.includes('条鱼') : s.includes('根'), 'measure word: 条 for fish, 根 for the rest — ' + s);
      h.assert(!/二(根|条)/.test(s), 'two of something is 两, not 二 — ' + s);
      if (s.includes('两')) sawTwo = true;
      if (s.startsWith('小猫')) sawCat = true;
      if (!(sawTwo && sawCat)) { await page.click('#restart'); await h.sleep(60); }
    }
    h.assert(sawTwo && sawCat, 'never saw a request for two / the kitten');
    h.assert((await page.textContent('#goalPy')).includes(' yào '), 'pinyin line shown');
    const FOOD = { '萝卜': 'carrot', '香蕉': 'banana', '骨头': 'bone', '鱼': 'fish', '玉米': 'corn' };
    const s = await page.textContent('#goalText'); const want = FOOD[Object.keys(FOOD).find((k) => s.includes(k))];
    const ls = await page.$$eval('.food', (bs) => bs.map((b) => b.getAttribute('aria-label')));
    await tap(page, '.food', ls.indexOf(want)); await h.sleep(900);
    h.assert((await h.said()).includes('一!'), 'counts the first bite aloud: 一!');
  }},

  // ===== Peekaboo Pets
  { game: 'peekaboo', name: 'only peeking pets count; they hide again; 10 ends the round', timeout: 90000, fn: async (page, h) => {
    await page.goto(h.base + 'peekaboo/'); await page.waitForSelector('.hole');
    const count = async () => +(await page.textContent('#count'));
    const empty = await page.$$eval('.hole', (hs) => hs.findIndex((x) => !x.classList.contains('up')));
    await tap(page, '.hole', empty); await h.sleep(100);
    h.assert((await count()) === 0, 'tapping an empty hole must not count');
    // a pet that is not tapped goes back down by itself
    await page.waitForSelector('.hole.up', { timeout: 4000 });
    const wentDown = await page.evaluate(() => new Promise((res) => {
      const i = [...document.querySelectorAll('.hole')].findIndex((x) => x.classList.contains('up'));
      const el = document.querySelectorAll('.hole')[i], t0 = performance.now();
      const tick = () => { if (!el.classList.contains('up')) return res(true); if (performance.now() - t0 > 3000) return res(false); requestAnimationFrame(tick); };
      tick();
    }));
    h.assert(wentDown, 'pets hide again if not tapped');
    for (let n = 1; n <= 10; n++) {
      await page.waitForSelector('.hole.up:not(.found)', { timeout: 5000 });
      const i = await page.$$eval('.hole', (hs) => hs.findIndex((x) => x.classList.contains('up') && !x.classList.contains('found')));
      await tap(page, '.hole', i); await h.sleep(60);
      h.assert((await count()) === n, `found count should be ${n}`);
    }
    await page.waitForSelector('#cheer.show', { timeout: 2000 });
    await page.waitForFunction(() => document.getElementById('round').textContent === 'Round 2' && document.getElementById('count').textContent === '0', null, { timeout: 4000 });
  }},

  // ===== Betrayal Battlefield
  { game: 'battle', name: 'two rows, 20 each, AI-controlled back row', fn: async (page, h) => {
    await page.goto(h.base + 'battle/'); await page.waitForFunction(() => window.__bb && window.__bb.game);
    await h.sleep(500);
    h.assert((await page.textContent('#bb-health')).trim() === '20 · 20', 'both armies start with 20');
    const c = await page.evaluate(() => { const g = window.__bb.game; return [g.lanes.front.L.ctrl, g.lanes.front.R.ctrl, g.lanes.back.L.ctrl, g.lanes.back.R.ctrl, g.army.L.length, g.army.R.length]; });
    h.assert(c.slice(0, 4).join() === 'player,ai,ai,ai', 'you control only the front-row fighter');
    h.assert(c[4] === 18 && c[5] === 18, '18 reserves wait on each side');
  }},
  { game: 'battle', name: 'swing recovery, one walking speed, no stepping away inside your reach', timeout: 120000, fn: async (page, h) => {
    await page.goto(h.base + 'battle/'); await page.waitForFunction(() => window.__bb && window.__bb.game);
    await h.sleep(300);
    const r = await page.evaluate(() => new Promise((res) => {
      const B = window.__bb, out = { minGap: 1e9, fast: 0, fastMax: 0, retreat: 0, inReachSwings: 0, earlySwings: 0, punishSeen: 0 };
      const btn = document.querySelector('[data-action=attack]'), right = document.querySelector('[data-action=right]');
      const press = (el, on) => el.dispatchEvent(new PointerEvent(on ? 'pointerdown' : 'pointerup', { bubbles: true }));
      const lastSwing = {}, hist = {}; let watch = null, t0 = performance.now();
      const id = (lane, f) => lane + f.side + f.entryAt;
      const tick = (now) => {
        const g = B.game;
        for (const ln of ['front', 'back']) for (const s of ['L', 'R']) {
          const f = g.lanes[ln][s]; if (!f) continue; const k = id(ln, f);
          if (f.swing && lastSwing[k] !== f.swing) { if (lastSwing[k]) out.minGap = Math.min(out.minGap, f.swing - lastSwing[k]); lastSwing[k] = f.swing; }
          if (f.ai && f.ai.mode === 'punish') out.punishSeen++;
          const hs = hist[k] = hist[k] || [];
          const clean = f.state === 'fight' && !f.knock && now >= f.stun;
          if (!clean) hs.length = 0; else { hs.push([now, f.x]); if (hs.length > 13) hs.shift();
            if (hs.length === 13) { const dt = (hs[12][0] - hs[0][0]) / 1000, v = Math.abs(hs[12][1] - hs[0][1]) / dt; if (v > 50 * 1.3 + 4) { out.fast++; if (v > out.fastMax) { out.fastMax = v; out.fastWho = ln + s + ' ' + f.ctrl + ' ' + (f.ai && f.ai.mode); } } } }
        }
        const lane = g.lanes.front, L = lane.L, R = lane.R;
        if (watch && R && R.entryAt === watch.id) {
          if (now - watch.t < 560) { if (!R.knock && R.x > watch.x + 0.75) { out.retreat++; watch = null; } } else watch = null;
        }
        if (!g.done && L && R && L.state === 'fight' && R.state === 'fight') {
          const gap = B.gapOf(lane), atk = B.attackGap(L.type, R.type), reach = B.outReach(L.type, R.type);
          press(right, gap > atk + 2);
          if (now >= L.ready && !L.swing) {
            if (gap <= atk) { press(btn, true); press(btn, false); out.inReachSwings++; watch = { id: R.entryAt, x: R.x, t: now }; }
            else if (gap <= reach + 16 && Math.random() < 0.08) { press(btn, true); press(btn, false); out.earlySwings++; }
          }
        } else press(right, false);
        if (now - t0 > 50000) return res(out);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }));
    h.assert(r.minGap >= 1390, `every swing needs 0.9s + 0.5s recovery; saw two swings ${Math.round(r.minGap)}ms apart`);
    h.assert(r.fast === 0, `nobody may move faster than walking speed; saw ${Math.round(r.fastMax)} px/s (${r.fastWho})`);
    h.assert(r.inReachSwings >= 4, 'test needs some in-reach swings, got ' + r.inReachSwings);
    h.assert(r.retreat === 0, `rival stepped away ${r.retreat}x while inside your reach as you swung`);
  }},
  { game: 'battle', name: 'a rival inside your reach does not back away when you swing', fn: async (page, h) => {
    await page.goto(h.base + 'battle/'); await page.waitForFunction(() => window.__bb && window.__bb.game);
    let moved = 0, tries = 0, guard = 0;
    for (let t = 0; t < 6 && guard++ < 30; t++) {
      await page.waitForFunction(() => { const g = window.__bb.game, L = g.lanes.front.L, R = g.lanes.front.R, n = performance.now();
        return L && R && L.state === 'fight' && R.state === 'fight' && n >= L.ready && n >= L.stun && !L.knock && n >= R.stun && !R.knock && !R.swing && !L.swing; }, null, { timeout: 8000 });
      const dx = await page.evaluate(() => new Promise((res) => {
        const B = window.__bb, g = B.game, lane = g.lanes.front, L = lane.L, R = lane.R;
        R.x += B.attackGap(L.type, R.type) - 2 - B.gapOf(lane);          // put the rival just inside reach
        const btn = document.querySelector('[data-action=attack]');
        btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
        if (!L.swing) return res(-1);                                   // your swing did not start: not a valid try
        Object.assign(R.ai, { mode: 'back', until: performance.now() + 5000, seen: L.swing, smart: false }); // it was backing off
        const x0 = R.x, t0 = performance.now(); let worst = 0;
        const tick = () => { if (!R.knock) worst = Math.max(worst, R.x - x0); if (performance.now() - t0 > 520) return res(worst); requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }));
      if (dx === -1) { t--; await h.sleep(300); continue; }
      if (dx > 0.5) moved++; tries++;
      await h.sleep(1600);
    }
    h.assert(tries === 6, 'could not run 6 valid swings');
    h.assert(moved === 0, `rival stepped back ${moved}/6 times while inside your reach`);
  }},
  { game: 'battle', name: 'no teleporting back when a new rival walks on', timeout: 90000, fn: async (page, h) => {
   for (let rep = 0; rep < 4; rep++) {   // fighting moves are random: repeat the situation
    await page.goto(h.base + 'battle/'); await page.waitForFunction(() => window.__bb && window.__bb.game);
    await h.sleep(300);
    const worst = await page.evaluate(() => new Promise((res) => {
      const g = window.__bb.game, lane = g.lanes.back, L = lane.L;
      L.type = 'troll'; g.army.R.unshift('sword');                          // widest pairing
      lane.R.state = 'dying'; lane.R.deathAt = performance.now() - 2490;   // the rival falls…
      L.x = 190; L.ai.mode = 'approach'; L.ai.willHold = false;          // …while our fighter stands far forward
      let prev = L.x, pk = 0, worst = 0, maxR = 0; const t0 = performance.now();
      const tick = (now) => { if (!L.knock && !pk && L.state === 'fight') worst = Math.max(worst, Math.abs(L.x - prev)); pk = L.knock; prev = L.x;
        if (lane.R && lane.R.state === 'fight') maxR = Math.max(maxR, lane.R.x);
        if (now - t0 > 4500) return res({ worst, maxR }); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }));
    h.assert(worst.worst <= 2.5, `fighter jumped ${worst.worst.toFixed(1)}px in one frame when the new rival arrived`);
    h.assert(worst.maxR <= 198.5, `new rival was pushed off the battlefield (x=${worst.maxR.toFixed(0)}, edge is 198)`);
   }
  }},
  { game: 'battle', name: 'you stand far forward and idle: new rival stays on the field, you ease back', fn: async (page, h) => {
    await page.goto(h.base + 'battle/'); await page.waitForFunction(() => window.__bb && window.__bb.game);
    await h.sleep(300);
    const r = await page.evaluate(() => new Promise((res) => {
      const g = window.__bb.game, lane = g.lanes.front, L = lane.L;
      L.type = 'troll'; g.army.R.unshift('troll');
      lane.R.state = 'dying'; lane.R.deathAt = performance.now() - 2490;
      L.x = 190;                                                           // you stand far forward and do nothing
      let prev = L.x, pk = 0, worst = 0, maxR = 0; const t0 = performance.now();
      const tick = (now) => { if (!L.knock && !pk) worst = Math.max(worst, Math.abs(L.x - prev)); pk = L.knock; prev = L.x;
        if (lane.R && lane.R.state === 'fight') maxR = Math.max(maxR, lane.R.x);
        if (now - t0 > 5000) return res({ worst, maxR, endL: L.x, gap: window.__bb.gapOf(lane), atk: window.__bb.attackGap(L.type, lane.R.type) });
        requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }));
    h.assert(r.maxR <= 198.5, `new rival was pushed off the battlefield (x=${r.maxR.toFixed(0)})`);
    h.assert(r.worst <= 2.5, `you jumped ${r.worst.toFixed(1)}px in one frame`);
    h.assert(r.endL < 185, 'you should have been eased back to make room');
    h.assert(r.gap >= r.atk - 6, 'the two fighters should not be left overlapping');
  }},
  { game: 'battle', name: 'fallen fighters are replaced from the army; game ends when an army is gone', fn: async (page, h) => {
    await page.goto(h.base + 'battle/'); await page.waitForFunction(() => window.__bb && window.__bb.game);
    await h.sleep(300);
    const before = await page.evaluate(() => { const g = window.__bb.game, f = g.lanes.front.R; f.state = 'dying'; f.deathAt = performance.now() - 2400; return { army: g.army.R.length, id: f.entryAt }; });
    await h.sleep(600);
    const after = await page.evaluate(() => { const g = window.__bb.game, f = g.lanes.front.R; return f ? { army: g.army.R.length, id: f.entryAt, st: f.state } : null; });
    h.assert(after && after.id !== before.id && (after.st === 'entry' || after.st === 'fight'), 'a new fighter steps in after one falls');
    h.assert(after.army === before.army - 1, 'the new fighter comes out of the reserves');
    await page.evaluate(() => { const g = window.__bb.game; g.army.R.length = 0; for (const id of ['front', 'back']) { const f = g.lanes[id].R; if (f) { f.state = 'dying'; f.deathAt = performance.now() - 2480; } } });
    await page.waitForFunction(() => window.__bb.game.done, null, { timeout: 3000 });
    h.assert(await page.evaluate(() => window.__bb.game.winner === 'L'), 'you win when the rival army is gone');
    h.assert(await page.isVisible('#bb-replay'), 'play again appears');
    await page.click('#bb-replay'); await h.sleep(300);
    h.assert(!(await page.evaluate(() => window.__bb.game.done)) && (await page.textContent('#bb-health')).trim() === '20 · 20', 'play again starts a fresh battle');
  }},

  // ===== 找一找
  { game: 'zh-find', name: 'right picture earns a star, wrong one is named; 8 stars move to next topic', timeout: 90000, fn: async (page, h) => {
    await page.goto(h.base + 'zh-find/'); await page.click('#go');
    const topic0 = await page.textContent('.chip.on');
    for (let q = 1; q <= 8; q++) {
      const hz = (await page.textContent('#askHz')).replace('在哪里?', '');
      const labs = await page.$$eval('.pick .lab .zh', (es) => es.map((e) => e.textContent));
      h.assert(labs.length === 4 && labs.includes(hz), 'four choices including the answer');
      if (q === 1) {
        const wi = labs.findIndex((l) => l !== hz);
        await page.locator('.pick').nth(wi).click(); await h.sleep(150);
        h.assert(await page.locator('.pick').nth(wi).evaluate((e) => e.classList.contains('show')), 'a wrong pick shows its name');
        h.assert((await page.locator('#stars svg.on').count()) === 0, 'a wrong pick earns no star');
        h.assert((await h.said()).some((s) => s.startsWith('这是' + labs[wi])), 'a wrong pick is named aloud');
      }
      await page.locator('.pick').nth(labs.indexOf(hz)).click(); await h.sleep(150);
      h.assert((await page.locator('#stars svg.on').count()) === q, `star count should be ${q}`);
      h.assert((await h.said()).some((s) => s.startsWith('对了')), 'a right pick says 对了');
      if (q < 8) await h.sleep(1750);
    }
    await page.waitForSelector('#cheer.show', { timeout: 2500 });
    await page.waitForFunction((t) => document.querySelector('.chip.on').textContent !== t, topic0, { timeout: 4000 });
  }},
  { game: 'zh-find', name: 'picks a Mandarin (zh-CN) voice, never Cantonese', voices: [{ lang: 'zh-HK', name: 'HK' }, { lang: 'zh-TW', name: 'TW' }, { lang: 'zh-CN', name: 'CN' }, { lang: 'en-US', name: 'EN' }], fn: async (page, h) => {
    await page.goto(h.base + 'zh-find/'); await page.click('#go'); await h.sleep(200);
    const v = await page.evaluate(() => window.__said.map((s) => s.voice));
    h.assert(v.length && v.every((x) => x === 'zh-CN'), 'voice used: ' + v.join());
  }},
  { game: 'zh-find', name: 'with only a Cantonese voice it still asks for Mandarin', voices: [{ lang: 'zh-HK', name: 'HK' }, { lang: 'en-US', name: 'EN' }], fn: async (page, h) => {
    await page.goto(h.base + 'zh-find/'); await page.click('#go'); await h.sleep(200);
    const s = await page.evaluate(() => window.__said);
    h.assert(s.length && s.every((x) => x.voice !== 'zh-HK' && x.lang === 'zh-CN'), 'speech: ' + JSON.stringify(s[0]));
  }},

  // ===== 跟我说
  { game: 'zh-say', name: 'speaks the word, records you, plays it back, praises', fn: async (page, h) => {
    await page.goto(h.base + 'zh-say/'); await page.click('#go'); await h.sleep(200);
    h.assert((await h.said()).includes('小兔'), 'speaks the first word');
    await page.click('#mic');
    await page.waitForFunction(() => !document.getElementById('playback').disabled && document.getElementById('stars3').classList.contains('on'), null, { timeout: 8000 });
    await page.click('#next', { force: true }); await h.sleep(200);
    h.assert((await page.textContent('#hz')) === '小猫' && (await page.locator('#playback').isDisabled()), 'next word resets the recording');
  }},

  // ===== Portal + offline
  { game: 'portal', name: 'every tile opens a working page; Mandarin modes work offline', sw: true, timeout: 60000, fn: async (page, h) => {
    await page.goto(h.base);
    const hrefs = await page.$$eval('a.tile', (as) => as.map((a) => a.getAttribute('href')));
    h.assert(hrefs.length >= 11, 'expected at least 11 tiles, found ' + hrefs.length);
    for (const href of hrefs) { const r = await page.request.get(h.base + href); h.assert(r.ok(), href + ' → ' + r.status()); }
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload(); await page.waitForFunction(() => navigator.serviceWorker.controller);
    await h.sleep(1500);
    await h.serverDown();
    await page.goto(h.base + 'feed/?lang=zh');
    await page.waitForSelector('#goalText', { timeout: 5000 });
    h.assert(/要/.test(await page.textContent('#goalText')), 'Count With Me opens offline in Mandarin');
    await page.goto(h.base + 'match/?set=zh'); await page.waitForSelector('.card', { timeout: 5000 });
    h.assert((await page.locator('.front .hz').count()) === 10, 'Character Match works offline (needs the Mandarin words file)');
  }}
];
