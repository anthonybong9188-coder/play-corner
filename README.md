# Play Corner

Simple, no-login games for little ones, made for big phones.

- **Match the Cards** – flip two cards to find matching shapes (4 × 5 board).
- **Penalty Kick** – tap the ball to shoot past the sliding goalie.
- **Feed the Animals** – the animal asks (out loud) for a number of its favourite food; drag or tap to feed.
- **Peekaboo Pets** – tap the pets as they peek out of the garden holes.
- **Sky Hero** – slide one finger to fly; your plane shoots by itself. Pop the slow planes coming down and don't let them bump you.
- **学中文 Learn Chinese** (simplified characters + Hanyu Pinyin, Mandarin voice from the phone):
  - 找一找 Find It – hear "小猫在哪里?" and tap the right picture (animals, fruits, colours, body)
  - 数一数 Count With Me – Feed the Animals in Mandarin (`feed/?lang=zh`)
  - 颜色气球 Colour Balloons – Balloon Pop in Mandarin (`balloon/?lang=zh`)
  - 汉字翻翻乐 Character Match – match pictures with 日 月 山 水 火 木 人 口 田 雨 (`match/?set=zh`)
  - 汉字 Builder – watch each character's stroke order, then trace it (stroke data: Make Me a Hanzi / hanzi-writer, see zh-write/LICENSE-*)
  - 跟我说 Say It Back – listen, record yourself, hear your own voice
- **Little Shop** – customers buy things; count out the coins (later: give change).
- **Balloon Pop** – pop the balloons of the colour asked for, 5 per round.

Plain HTML/CSS/JS, no build step. Hosted on GitHub Pages; installable to the home screen and playable offline.

To add a game: create a new folder with an `index.html`, add a tile on the landing page, and add the files to `CORE` in `sw.js` (bump the `CACHE` version).
