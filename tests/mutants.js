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

  // ---- Peekaboo Pets
  { id: 'K1', games: ['peekaboo'], file: 'peekaboo/index.html', what: 'tapping an empty hole counts', find: 'if (!h.up || h.found || paused) return;', repl: 'if (h.found || paused) return;' },
  { id: 'K2', games: ['peekaboo'], file: 'peekaboo/index.html', what: 'round needs 11 instead of 10', find: 'if (found >= NEED) roundDone();', repl: 'if (found >= NEED + 1) roundDone();' },
  { id: 'K3', games: ['peekaboo'], file: 'peekaboo/index.html', what: 'pets never hide again', find: '      if (h.up && now >= h.downAt) hide(h);', repl: '' },

  // ---- Betrayal Battlefield
  { id: 'X1', games: ['battle'], file: 'battle/index.html', what: 'no swing recovery', find: 'const RECOVER_MS=500;', repl: 'const RECOVER_MS=0;' },
  { id: 'X2', games: ['battle'], file: 'battle/index.html', what: 'rival sprints when punishing', find: "if(now>=op.ready&&!opSwinging){A.mode='approach';A.willHold=Math.random()<AI_HOLD;break}\n            moveTo(lane,f,toward(f,SPEED*dt));", repl: "if(now>=op.ready&&!opSwinging){A.mode='approach';A.willHold=Math.random()<AI_HOLD;break}\n            moveTo(lane,f,toward(f,2.5*SPEED*dt));" },
  { id: 'X3', games: ['battle'], file: 'battle/index.html', what: 'rival may dodge out while inside your reach', find: '          if(gap<=strikeLimit(op.side,lt,rt)){if(inRange&&canSwing)swing();return}\n', repl: '' },
  { id: 'X4', games: ['battle'], file: 'battle/index.html', what: 'armies of 19', find: 'const ARMY_SIZE=20;', repl: 'const ARMY_SIZE=19;' },
  { id: 'X5', games: ['battle'], file: 'battle/index.html', what: 'fallen fighters never replaced', find: 'if(!army.length){lane[side]=null;return}', repl: 'if(true){lane[side]=null;return}' },
  { id: 'X6', games: ['battle'], file: 'battle/index.html', what: 'game only ends when both armies are gone', find: "if((l===0&&!dyingOf('L'))||(r===0&&!dyingOf('R'))){", repl: "if((l===0&&!dyingOf('L'))&&(r===0&&!dyingOf('R'))){" },
  { id: 'X7', games: ['battle'], file: 'battle/index.html', what: 'player walks faster than everyone', find: 'moveTo(lane,L,L.x+dir*SPEED*dt);', repl: 'moveTo(lane,L,L.x+dir*1.6*SPEED*dt);' },
  { id: 'X9', games: ['battle'], file: 'battle/index.html', what: 'fighter snaps back when a new rival walks on', find: 'if(x>lim)x=Math.max(lim,Math.min(x,f.x)-step)', repl: 'if(x>lim)x=lim' },
  { id: 'X8', games: ['battle'], file: 'battle/index.html', what: 'back row controlled by the player too', find: "ctrl:(lane==='front'&&side==='L')?'player':'ai'", repl: "ctrl:(side==='L')?'player':'ai'" },

  // ---- 找一找 / 跟我说 / voice
  { id: 'Z1', games: ['zh-find'], file: 'zh-find/index.html', what: 'wrong picture accepted', find: '    if (it === target) {', repl: '    if (it !== target) {' },
  { id: 'Z2', games: ['zh-find'], file: 'zh-find/index.html', what: 'round never ends', find: '      if (done >= PER_ROUND) return setTimeout(roundDone, 1300);', repl: '' },
  { id: 'Z3', games: ['zh-find'], file: 'assets/zh.js', what: 'prefers any Chinese voice over Mandarin zh-CN', find: "voice = ok.filter(function (v) { return /zh[-_]CN|cmn/i.test(v.lang); })[0] || ok[0] || null;", repl: 'voice = ok[0] || null;' },
  { id: 'Z4', games: ['zh-find'], file: 'assets/zh.js', what: 'Cantonese voice allowed', find: "var ok = vs.filter(function (v) { return isMandarin(v) && !/HK|yue/i.test(v.lang); });", repl: "var ok = vs.filter(function (v) { return /^zh/i.test(v.lang); });" },
  { id: 'Z5', games: ['zh-say'], file: 'zh-say/index.html', what: 'recording never offered for playback', find: "        $('playback').disabled = false;", repl: '' },
  { id: 'Z6', games: ['zh-say'], file: 'zh-say/index.html', what: 'next word keeps the old recording', find: "    $('playback').disabled = true;\n", repl: '' },

  // ---- portal / offline
  { id: 'S1', games: ['portal'], file: 'sw.js', what: 'offline ignores ?lang=zh pages', find: 'caches.match(req, { ignoreSearch: true })', repl: 'caches.match(req)' },
  { id: 'S2', games: ['portal'], file: 'sw.js', what: 'Mandarin words file not cached offline', find: "  './assets/zh.js',\n", repl: '' },
  { id: 'S3', games: ['portal'], file: 'index.html', what: 'a tile links to a missing page', find: 'href="zh-say/"', repl: 'href="zh-speak/"' }
];
