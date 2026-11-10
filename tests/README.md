# Play Corner tests

Automated rule tests for every game, run in a headless phone-sized browser (412×780).
Speech is stubbed, so tests check *what would be said* (and in which voice) without sound.

```bash
npm i playwright            # once, anywhere on NODE_PATH
node tests/run-tests.js            # all games
node tests/run-tests.js sky feed # just some games
node tests/run-mutants.js          # mutation check (plants each bug in a copy, ~30 min)
node tests/run-mutants.js X1 F3    # just some planted bugs
```

- `specs.js` – the rules each game must follow (pairs, scoring, Mandarin wording, offline, …)
- `mutants.js` – planted bugs; each must make at least one test fail ("killed")
- `harness.js` – tiny static server, browser launcher, speech stub

Every planted bug is caught (105/105 on 2026-11-10). A real bug the tests found and that was fixed: the Feed the Animals tray
could run out of the wanted food.
