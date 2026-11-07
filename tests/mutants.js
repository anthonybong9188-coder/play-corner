// Planted bugs ("mutants"). Each one is applied alone; the listed games' tests must then FAIL.
module.exports = [
  // ---- Match the Cards
  { id: 'M1', games: ['match'], file: 'match/index.html', what: 'two different cards count as a match', find: 'if (deck[a] === deck[b]) {', repl: 'if (deck[a] !== deck[b]) {' },
  { id: 'M2', games: ['match'], file: 'match/index.html', what: 'tries are not counted', find: '    tries++;\n    lock = true;', repl: '    lock = true;' },
  { id: 'M3', games: ['match'], file: 'match/index.html', what: 'wrong cards never flip back', find: 'reveal(a, false); reveal(b, false);', repl: '' },
  { id: 'M4', games: ['match'], file: 'match/index.html', what: 'deck never shuffled', find: 'var j = Math.floor(Math.random() * (i + 1));', repl: 'var j = i;' },
  { id: 'M4b', games: ['match'], file: 'match/index.html', what: 'one picture appears three times', find: 'd.push(p, p);', repl: 'd.push(p, p === 1 ? 0 : p);' },
  { id: 'M5', games: ['match'], file: 'match/index.html', what: 'win screen never appears', find: 'if (matched === PAIRS.length) {', repl: 'if (matched === PAIRS.length + 1) {' },
  { id: 'M6', games: ['match'], file: 'match/index.html', what: 'no lock: a third card can open', find: "if (lock || c.classList.contains('open')) return;", repl: "if (c.classList.contains('open')) return;" },
  { id: 'M7', games: ['match'], file: 'match/index.html', what: 'Play again keeps the old score', find: 'open = []; matched = 0; tries = 0; lock = false;', repl: 'open = []; lock = false;' },
  { id: 'M8', games: ['match-zh'], file: 'match/index.html', what: 'character mode shows only pictures', find: "var k = seen[p] ? 'hz' : 'pic';", repl: "var k = 'pic';" },
  { id: 'M9', games: ['match-zh'], file: 'match/index.html', what: 'characters not spoken on flip', find: 'if (ZH && window.PC && PC.zh) PC.zh.say(CH[deck[i]].hz);', repl: '' },

  // ---- Penalty Kick
  { id: 'P1', games: ['penalty'], file: 'penalty/index.html', what: 'arrow swings 120° instead of 90°', find: 'return -45 + 90 * tri;', repl: 'return -60 + 120 * tri;' },
  { id: 'P2', games: ['penalty'], file: 'penalty/index.html', what: 'save logic inverted', find: '} else if (Math.abs(dx) < reach) {', repl: '} else if (Math.abs(dx) > reach) {' },
  { id: 'P3', games: ['penalty'], file: 'penalty/index.html', what: 'goals not added to the score', find: "      if (k === 'goal') goals++;\n", repl: '' },
  { id: 'P4', games: ['penalty'], file: 'penalty/index.html', what: 'round never ends after 5 kicks', find: 'if (s.kicks.length >= KICKS) done.classList.add(\'show\');', repl: 'if (s.kicks.length > KICKS) done.classList.add(\'show\');' },
  { id: 'P5', games: ['penalty'], file: 'penalty/index.html', what: 'goalie slides outside the goal', find: 'function keeperX(tk) { return CX + KEEPER_AMP * Math.sin(', repl: 'function keeperX(tk) { return CX + 1.35 * KEEPER_AMP * Math.sin(' },
  { id: 'P6', games: ['penalty'], file: 'penalty/index.html', what: 'goalie never raises his arms', find: "    armsUp.style.display = up ? '' : 'none';", repl: "    armsUp.style.display = 'none';" },

  // ---- Balloon Pop
  { id: 'B1', games: ['balloon'], file: 'balloon/index.html', what: 'wrong colour counts instead of right', find: '    if (b.color === target) {', repl: '    if (b.color !== target) {' },
  { id: 'B2', games: ['balloon'], file: 'balloon/index.html', what: 'round never finishes', find: 'if (popped >= PER_ROUND) roundDone(now);', repl: 'if (popped > PER_ROUND) roundDone(now);' },
  { id: 'B3', games: ['balloon'], file: 'balloon/index.html', what: 'balloons sink instead of rise', find: 'b.y -= b.speed * dt;', repl: 'b.y += b.speed * dt;' },
  { id: 'B4', games: ['balloon-zh'], file: 'balloon/index.html', what: 'colour not spoken in Mandarin', find: "      if (ZH) PC.zh.say(COLORS[b.color].hz + '!');", repl: '' },

  // ---- Feed the Animals
  { id: 'F1', games: ['feed'], file: 'feed/index.html', what: 'right/wrong food swapped', find: 'var right = food === MENU[who].food;', repl: 'var right = food !== MENU[who].food;' },
  { id: 'F2', games: ['feed'], file: 'feed/index.html', what: 'animal never gets full', find: 'if (fed >= need) return allDone();', repl: 'if (fed > need) return allDone();' },
  { id: 'F3', games: ['feed'], file: 'feed/index.html', what: 'tray stops guaranteeing the wanted food', find: 'slots[i] = count < Math.min(2, left) ? want :', repl: 'slots[i] = false ? want :' },
  { id: 'F3b', games: ['feed'], file: 'feed/index.html', what: 'the eaten food is still counted (the original bug)', find: "    slots[i] = null; // the food just eaten is gone – don't count it\n", repl: '' },
  { id: 'F4', games: ['feed'], file: 'feed/index.html', what: 'early rounds ask for too many', find: 'var maxN = round < 3 ? 3 : 5;', repl: 'var maxN = 5;' },
  { id: 'F5', games: ['feed'], file: 'feed/index.html', what: 'same animal can come twice in a row', find: '} while (w === lastWho);', repl: '} while (false);' },
  { id: 'F6', games: ['feed-zh'], file: 'assets/zh.js', what: '"two of" says 二 instead of 两', find: "{ count: '二', cpy: 'èr', amt: '两', apy: 'liǎng' }", repl: "{ count: '二', cpy: 'èr', amt: '二', apy: 'èr' }" },
  { id: 'F7', games: ['feed-zh'], file: 'feed/index.html', what: 'fish uses the wrong measure word', find: "zf: '鱼',   zfp: 'yú',        zm: '条', zmp: 'tiáo'", repl: "zf: '鱼',   zfp: 'yú',        zm: '根', zmp: 'gēn'" },
  { id: 'F8', games: ['feed-zh'], file: 'feed/index.html', what: 'bites not counted aloud', find: "          PC.zh.say(n.count + '!');", repl: '' },


  // ---- 找一找 / 跟我说 / voice
  { id: 'Z1', games: ['zh-find'], file: 'zh-find/index.html', what: 'wrong picture accepted', find: '    if (it === target) {', repl: '    if (it !== target) {' },
  { id: 'Z2', games: ['zh-find'], file: 'zh-find/index.html', what: 'round never ends', find: '      if (done >= PER_ROUND) return setTimeout(roundDone, 1300);', repl: '' },
  { id: 'Z3', games: ['zh-find'], file: 'assets/zh.js', what: 'prefers any Chinese voice over Mandarin zh-CN', find: "voice = ok.filter(function (v) { return /zh[-_]CN|cmn/i.test(v.lang); })[0] || ok[0] || null;", repl: 'voice = ok[0] || null;' },
  { id: 'Z4', games: ['zh-find'], file: 'assets/zh.js', what: 'Cantonese voice allowed', find: "var ok = vs.filter(function (v) { return isMandarin(v) && !/HK|yue/i.test(v.lang); });", repl: "var ok = vs.filter(function (v) { return /^zh/i.test(v.lang); });" },
  { id: 'Z5', games: ['zh-say'], file: 'zh-say/index.html', what: 'recording never offered for playback', find: "        $('playback').disabled = false;", repl: '' },
  { id: 'Z6', games: ['zh-say'], file: 'zh-say/index.html', what: 'next word keeps the old recording', find: "    $('playback').disabled = true;\n", repl: '' },


  // ---- Little Shop
  { id: 'SH1', games: ['shop'], file: 'shop/index.html', what: 'sale completes one coin too late', find: 'if (placed === need) { checkTimer = setTimeout(done, 650); return; }', repl: 'if (placed === need + 1) { checkTimer = setTimeout(done, 650); return; }' },
  { id: 'SH2', games: ['shop'], file: 'shop/index.html', what: 'spaces can be over-filled', find: "if (mode !== 'pay' && placed >= need) {", repl: 'if (false) {' },
  { id: 'SH3', games: ['shop'], file: 'shop/index.html', what: 'change is the whole 5, not 5 − price', find: 'need = 5 - price;', repl: 'need = 5;' },
  { id: 'SH4', games: ['shop'], file: 'shop/index.html', what: 'coins cannot be taken back', find: '    placed--;\n', repl: '' },
  { id: 'SH5', games: ['shop'], file: 'shop/index.html', what: 'coins not counted aloud', find: '    say(WORDS[placed] || String(placed));\n', repl: '' },
  { id: 'SH6', games: ['shop'], file: 'shop/index.html', what: 'purse not refilled for the next customer', find: '    placed = 0;\n    bubble.classList.remove', repl: '    bubble.classList.remove' },
  // ---- 汉字 Builder
  { id: 'ZW1', games: ['zh-write'], file: 'zh-write/index.html', what: 'wrong-order stroke accepted after one miss', find: 'markStrokeCorrectAfterMisses: 4', repl: 'markStrokeCorrectAfterMisses: 1' },
  { id: 'ZW2', games: ['zh-write'], file: 'zh-write/index.html', what: 'always says perfect', find: "var p = r.totalMistakes === 0 ? '真棒!' : '很好!';", repl: "var p = '真棒!';" },
  { id: 'ZW3', games: ['zh-write'], file: 'zh-write/index.html', what: 'finished characters not ticked', find: 'done[CH[idx].id] = true; saveDone();', repl: 'saveDone();' },
  { id: 'ZW4', games: ['zh-write'], file: 'zh-write/index.html', what: 'never moves from watching to writing', find: 'if (my === token) setTimeout(function () { if (my === token) write(); }, 500);', repl: '' },
  { id: 'ZW6', games: ['zh-write'], file: 'assets/zh.js', what: 'a character points at stroke data that does not exist', find: "{ id: 'niu', hz: '牛'", repl: "{ id: 'niu2', hz: '牛'" },
  { id: 'ZW7', games: ['zh-write'], file: 'zh-write/index.html', what: 'Next at the end of a group starts the same group again', find: 'setGroup((gi + 1) % GROUPS.length); show(0, true);', repl: 'show(0, true);' },
  { id: 'ZW8', games: ['zh-write'], file: 'assets/zh.js', what: 'two characters swapped onto each other\'s stroke data', find: "{ id: 'da', hz: '大'", repl: "{ id: 'xiao', hz: '大'" },
  { id: 'ZW5', games: ['portal'], file: 'sw.js', what: 'stroke data not saved for offline', find: "  './zh-write/data/ri.json',\n", repl: '' },

  // ---- Sky Hero
  { id: 'SK1', games: ['sky'], file: 'sky/index.html', what: 'plane never fires', find: 'if (t - lastShot >= FIRE_MS / 1000) {', repl: 'if (false) {' },
  { id: 'SK2', games: ['sky'], file: 'sky/index.html', what: 'plane also moves up and down with the finger', find: 'me.tx = clamp(ev.clientX - r.left, 36, W - 36);', repl: 'me.tx = clamp(ev.clientX - r.left, 36, W - 36); me.y = ev.clientY - r.top;' },
  { id: 'SK3', games: ['sky'], file: 'sky/index.html', what: 'enemies come down fast', find: 'var ENEMY_SPEED = 42;', repl: 'var ENEMY_SPEED = 140;' },
  { id: 'SK4', games: ['sky'], file: 'sky/index.html', what: 'no safe time after a bump', find: 'lives--; safeUntil = t + SAFE_MS / 1000;', repl: 'lives--; safeUntil = t;' },
  { id: 'SK5', games: ['sky'], file: 'sky/index.html', what: 'shots pass through enemies', find: 'b.gone = true; hit(e); return;', repl: 'b.gone = true; return;' },
  { id: 'SK6', games: ['sky'], file: 'sky/index.html', what: 'big plane pops in one hit', find: 'hp: big ? 3 : 1', repl: 'hp: 1' },
  { id: 'SK7', games: ['sky'], file: 'sky/index.html', what: 'game never ends', find: "if (lives <= 0) { state = 'ending';", repl: "if (lives < 0) { state = 'ending';" },
  { id: 'SK8', games: ['sky'], file: 'sky/index.html', what: 'a plane flying past costs a heart', find: '    enemies = enemies.filter(function (e) { return !e.dead && e.y < H + 60; });', repl: '    enemies.forEach(function (e) { if (e.y >= H + 60) hurt(); });\n    enemies = enemies.filter(function (e) { return !e.dead && e.y < H + 60; });' },
  { id: 'SK9', games: ['sky'], file: 'sky/index.html', what: 'Fly again keeps the old score', find: 'lives = LIVES; score = 0; level = 1;\n    me =', repl: 'lives = LIVES; level = 1;\n    me =' },
  { id: 'SK10', games: ['sky'], file: 'sky/index.html', what: 'no speed limit at high levels', find: 'return Math.min(MAX_SPEED, ENEMY_SPEED + SPEED_STEP * (level - 1));', repl: 'return ENEMY_SPEED + SPEED_STEP * (level - 1);' },
  { id: 'SK11', games: ['sky'], file: 'sky/index.html', what: 'never levels up', find: 'var lv = 1 + Math.floor(score / PER_LEVEL);', repl: 'var lv = 1;' },
  { id: 'SK12', games: ['portal'], file: 'sw.js', what: 'Sky Hero not saved for offline', find: "  './sky/',\n", repl: '' },

  // ---- portal / offline
  { id: 'S1', games: ['portal'], file: 'sw.js', what: 'offline ignores ?lang=zh pages', find: 'caches.match(req, { ignoreSearch: true })', repl: 'caches.match(req)' },
  { id: 'S3', games: ['portal'], file: 'index.html', what: 'a tile links to a missing page', find: 'href="zh-say/"', repl: 'href="zh-speak/"' }
];
