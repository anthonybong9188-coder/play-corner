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


// ---------------------------------------------------------------- 汉字 Builder: draw a stroke along its real path
async function traceStroke(page, k) {
  const pts = await page.evaluate((k) => {
    const W = window.__zw, d = W.data[W.chars[W.idx].id], m = document.querySelector('#writer svg g').getScreenCTM();
    return d.medians[k].map(([x, y]) => { const p = new DOMPoint(x, y).matrixTransform(m); return [p.x, p.y]; });
  }, k);
  await page.mouse.move(pts[0][0], pts[0][1]); await page.mouse.down();
  for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; for (let t = 1; t <= 4; t++) await page.mouse.move(x0 + (x1 - x0) * t / 4, y0 + (y1 - y0) * t / 4); }
  await page.mouse.up(); await page.waitForTimeout(220);
}
const zwReady = (page) => page.waitForFunction(() => /Your turn/.test(document.getElementById('status').textContent), null, { timeout: 20000 });

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


  // ===== Little Shop
  { game: 'shop', name: 'count coins to the price, no over-filling, take back, then change', timeout: 150000, fn: async (page, h) => {
    await page.goto(h.base + 'shop/'); await page.waitForSelector('#coins .coin');
    const st = () => page.evaluate(() => window.__shop.state);
    const give = () => tap(page, '#coins .coin:not(.gone)');
    const back = () => page.locator('#dish .coin').last().click();
    let s = await st();
    h.assert(s.mode === 'slots' && s.price >= 1 && s.price <= 5 && s.need === s.price, 'first customers ask for 1–5 with spaces to fill');
    h.assert((await page.textContent('#askText')).includes(String(s.price)), 'the price is shown');
    // fill to the price, try one extra, take one back, finish
    for (let k = 1; k <= s.need; k++) { await give(); await h.sleep(60); }
    await give(); await h.sleep(80);
    h.assert((await st()).placed === s.need, 'with spaces shown you cannot put in more than the price');
    h.assert((await h.said()).includes('one'), 'coins are counted aloud');
    await page.waitForSelector('.bubble.show', { timeout: 2000 });
    // play on to the "pay" customers and over-pay once
    let sawOver = false, sawChange = false;
    for (let guard = 0; guard < 14 && !sawChange; guard++) {
      await page.waitForFunction((r) => window.__shop.state.round > r && !window.__shop.state.busy, s.round, { timeout: 5000 });
      s = await st();
      h.assert((await page.locator('#coins .coin:not(.gone)').count()) === 10, 'a fresh purse of 10 coins for each customer');
      if (s.mode === 'pay' && !sawOver) {
        for (let k = 0; k <= s.need; k++) { await give(); await h.sleep(50); }
        await h.sleep(700);
        h.assert(!(await page.locator('.bubble.show').count()), 'paying too much must not complete the sale');
        h.assert((await h.said()).some((t) => /too many/i.test(t)), 'the customer says it is too many');
        await back(); await h.sleep(60);
        h.assert((await st()).placed === s.need, 'taking a coin back removes it from the dish');
        sawOver = true;
      } else {
        if (s.mode === 'change') { h.assert(s.need === 5 - s.price && s.need >= 1, 'change = 5 − price'); sawChange = true; }
        for (let k = 0; k < s.need; k++) { await give(); await h.sleep(50); }
      }
      await page.waitForSelector('.bubble.show', { timeout: 2000 });
    }
    h.assert(sawOver && sawChange, 'reached the pay and change customers');
  }},

  // ===== 汉字 Builder
  { game: 'zh-write', name: 'watch, then trace in stroke order; finished characters get a tick', timeout: 90000, fn: async (page, h) => {
    await page.goto(h.base + 'sky/'); await page.waitForSelector('#go', { timeout: 5000 });
    await page.goto(h.base + 'zh-write/'); await page.click('#go');
    await zwReady(page);
    h.assert((await h.said()).includes('日'), 'the character is spoken');
    for (let k = 0; k < 4; k++) await traceStroke(page, k);
    await page.waitForSelector('#paper.done', { timeout: 3000 });
    h.assert((await page.textContent('#status')).includes('真棒'), 'a perfect trace earns 真棒');
    h.assert((await page.textContent('.chip[data-i="0"]')).includes('✓'), 'the finished character gets a tick');
    await page.click('#next', { force: true });
    await zwReady(page);
    h.assert((await page.textContent('#hz')) === '月', 'next character is 月');
    // 月: draw stroke 2 first — must not count, must say try again
    await traceStroke(page, 1);
    h.assert(/Try again/.test(await page.textContent('#status')) && !(await page.locator('#paper.done').count()), 'a stroke in the wrong order is refused');
    h.assert(/stroke 1 of/.test(await page.textContent('#status')) || (await page.evaluate(() => window.__zw.mistakes)) === 1, 'still waiting for stroke 1');
    for (let k = 0; k < 4; k++) await traceStroke(page, k);
    await page.waitForSelector('#paper.done', { timeout: 3000 });
    h.assert((await page.textContent('#status')).includes('很好'), 'with a mistake it says 很好 rather than perfect');
  }},

  { game: 'zh-write', name: 'all 40 characters load the right stroke data; groups and Next work', timeout: 90000, fn: async (page, h) => {
    await page.goto(h.base + 'sky/'); await page.waitForSelector('#go', { timeout: 5000 });
    await page.goto(h.base + 'zh-write/'); await page.click('#go'); await zwReady(page);
    // fingerprint from the original stroke data: "<strokes>:<x>,<y> of where the first stroke starts>"
    const EXPECT = { 日: '4:284,684', 月: '4:339,773', 山: '3:472,748', 水: '4:473,814', 火: '4:216,534', 木: '4:228,534', 人: '2:483,736', 口: '3:229,584', 田: '5:168,630', 雨: '8:312,695', 一: '1:121,393', 二: '2:293,587', 三: '3:316,655', 四: '5:132,606', 五: '4:304,694', 六: '4:441,756', 七: '2:101,340', 八: '2:331,470', 九: '2:402,808', 十: '2:109,442', 目: '5:281,723', 耳: '6:224,757', 手: '4:696,777', 足: '7:322,757', 牛: '4:314,694', 羊: '6:345,813', 马: '3:289,716', 鸟: '5:425,861', 鱼: '8:442,848', 虫: '6:233,528', 大: '3:210,458', 小: '3:484,773', 上: '3:446,781', 下: '3:113,682', 中: '4:194,598', 天: '4:326,698', 云: '4:342,641', 土: '3:283,438', 石: '5:265,665', 门: '3:304,770' };
    const got = await page.evaluate(async () => {
      const out = {};
      for (const g of window.__zw.groups) for (const c of g.items) {
        try { const r = await fetch('data/' + c.id + '.json'); if (!r.ok) { out[c.hz] = 'missing ' + c.id; continue; }
          const d = await r.json(); out[c.hz] = d.strokes.length + ':' + d.medians[0][0][0] + ',' + d.medians[0][0][1]; } catch (e) { out[c.hz] = 'error'; }
      }
      return out;
    });
    h.assert(Object.keys(got).length === 40, 'there should be 40 characters, found ' + Object.keys(got).length);
    for (const [hz, f] of Object.entries(EXPECT)) h.assert(got[hz] === f, `${hz}: stroke data does not match this character (expected ${f}, got ${got[hz]})`);
    // numbers group: trace 一
    await page.click('#groups .chip[data-g="1"]'); await zwReady(page);
    h.assert((await page.textContent('#hz')) === '一', 'numbers start at 一');
    await traceStroke(page, 0);
    await page.waitForSelector('#paper.done', { timeout: 3000 });
    h.assert((await page.textContent('#groups .chip[data-g="1"]')).includes('1/10'), 'the group shows how many are done');
    // the last character of a group leads on to the next group
    await page.click('#chips .chip[data-i="9"]'); await zwReady(page);
    h.assert((await page.textContent('#hz')) === '十', 'tenth number is 十');
    await page.click('#next', { force: true }); await zwReady(page);
    h.assert((await page.textContent('#hz')) === '目' && (await page.evaluate(() => window.__zw.gi)) === 2, 'after 十 comes the next group, starting with 目');
  }},

  // ===== Portal + offline
  // ---------------------------------------------------------------- Sky Hero
  { game: 'sky', name: 'auto-fires; finger moves the plane left/right only; enemies drift down slowly; shots pop them', fn: async (page, h) => {
    await page.goto(h.base + 'sky/'); await page.click('#go');
    const S = (f) => page.evaluate(f);
    await S(() => __sky.clear());
    const finger = (type, x) => page.evaluate(([type, x]) => { const f = document.getElementById('field'), r = f.getBoundingClientRect();
      f.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: r.left + x, clientY: r.top + r.height - 40, pointerId: 1, pointerType: 'touch', buttons: 1 })); }, [type, x]);
    const y0 = await S(() => __sky.me.y);
    await h.sleep(1000);
    const shots = await S(() => __sky.bullets.length);
    h.assert(shots >= 2, 'the plane fires by itself (bullets in the air: ' + shots + ')');
    await finger('pointerdown', 80); await h.sleep(600);
    let me = await S(() => ({ x: __sky.me.x, y: __sky.me.y }));
    h.assert(Math.abs(me.x - 80) < 4, 'plane goes to the finger (x=' + me.x + ')');
    await finger('pointermove', 320); await h.sleep(600);
    me = await S(() => ({ x: __sky.me.x, y: __sky.me.y }));
    h.assert(Math.abs(me.x - 320) < 4, 'plane follows the sliding finger (x=' + me.x + ')');
    h.assert(me.y === y0, 'plane only moves left and right');
    await finger('pointermove', -50); await h.sleep(500);
    h.assert((await S(() => __sky.me.x)) >= 30, 'plane stays on the screen');
    await finger('pointermove', 320); await h.sleep(500);
    // measure speed on one away from the guns, then pop one straight above
    await S(() => { __sky.clear(); window.__e = __sky.spawn({ x: 120, y: 40, sway: 0, noBomb: true }); });
    const a = await S(() => __e.y); await h.sleep(1000); const b = await S(() => __e.y);
    await S(() => { __sky.clear(); window.__e = __sky.spawn({ x: 320, y: 40, sway: 0, noBomb: true }); });
    h.assert(b - a > 20 && b - a < 55, 'level 1 enemy comes down slowly (' + (b - a).toFixed(0) + ' px in 1 s)');
    await page.waitForFunction(() => __sky.score === 1, null, { timeout: 8000 });
    h.assert(!(await S(() => __sky.enemies.includes(__e))), 'popped enemy is gone');
    h.assert((await S(() => { __sky.setScore(200); return __sky.speedNow(); })) <= 80, 'even at high levels enemies stay slow');
  }},
  { game: 'sky', name: 'a bump costs one heart then 2 s safe; fly-pasts are free; no hearts ends; Fly again resets', fn: async (page, h) => {
    await page.goto(h.base + 'sky/'); await page.click('#go');
    const S = (f) => page.evaluate(f);
    await S(() => __sky.clear());
    const bump = () => S(() => __sky.spawn({ x: __sky.me.x, y: __sky.me.y, sway: 0, noBomb: true }));
    await bump(); await h.sleep(200);
    h.assert((await S(() => __sky.lives)) === 2, 'a bump costs one heart');
    h.assert((await page.locator('#hearts .full').count()) === 2, 'two hearts shown');
    await bump(); await h.sleep(200);
    h.assert((await S(() => __sky.lives)) === 2, 'no second loss straight after a bump');
    await S(() => __sky.clear());
    await S(() => __sky.spawn({ x: __sky.W - 40 > __sky.me.x + 120 ? __sky.W - 40 : 40, y: __sky.H - 10, sway: 0, noBomb: true }));
    await h.sleep(2300);
    h.assert((await S(() => __sky.lives)) === 2, 'a plane flying past the bottom costs nothing');
    await bump(); await h.sleep(200);
    h.assert((await S(() => __sky.lives)) === 1, 'after the safe time a bump hurts again');
    await h.sleep(2200); await bump();
    await page.waitForSelector('#overScreen:not([hidden])', { timeout: 3000 });
    h.assert((await page.textContent('#finalScore')) === String(await S(() => __sky.score)), 'end screen shows the score');
    await S(() => __sky.setScore(7));
    await page.click('#again');
    const st = await S(() => ({ l: __sky.lives, s: __sky.score, st: __sky.state }));
    h.assert(st.l === 3 && st.s === 0 && st.st === 'play', 'Fly again starts fresh: ' + JSON.stringify(st));
    h.assert(await page.locator('#overScreen').isHidden(), 'end screen closes');
  }},
  { game: 'sky', name: 'level up every 10; big planes take 3 hits and give 3', fn: async (page, h) => {
    await page.goto(h.base + 'sky/'); await page.click('#go');
    const S = (f) => page.evaluate(f);
    await S(() => { __sky.clear(); __sky.setScore(9); __sky.spawn({ x: __sky.me.x, y: 60, sway: 0, noBomb: true, big: false }); });
    await page.waitForFunction(() => __sky.score === 10, null, { timeout: 8000 });
    h.assert((await S(() => __sky.level)) === 2, 'level 2 at 10 points');
    await page.waitForSelector('#banner.show', { timeout: 1000 });
    h.assert(/Level 2/.test(await page.textContent('#banner')), 'Level 2 banner');
    await S(() => { window.__big = __sky.spawn({ x: __sky.me.x, y: 40, sway: 0, noBomb: true, big: true }); });
    await page.waitForFunction(() => __big.hp < 3, null, { timeout: 8000 });
    h.assert((await S(() => __big.hp)) === 2 && (await S(() => __sky.score)) === 10, 'one hit is not enough for a big plane');
    await page.waitForFunction(() => __big.dead, null, { timeout: 8000 });
    h.assert((await S(() => __sky.score)) === 13, 'a big plane gives 3 points');
  }},

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
    await page.goto(h.base + 'sky/'); await page.waitForSelector('#go', { timeout: 5000 });
    await page.goto(h.base + 'zh-write/'); await page.click('#go');
    await page.waitForFunction(() => /strokes/.test(document.getElementById('strokes').textContent), null, { timeout: 8000 });
  }}
];
