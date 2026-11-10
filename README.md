# Play Corner

Simple, no-login games for little ones, made for big phones.

- **Match the Cards** – flip two cards to find matching shapes (4 × 5 board).
- **Penalty Kick** – tap the ball to shoot past the sliding goalie.
- **Rocket Maths** – plus and minus as little stories ("5 carrots, Bunny eats 2"); each right answer flies the rocket on, from the Moon to the Stars.
- **Sky Hero** – slide one finger to fly; your plane shoots by itself. Pop the slow planes coming down and don't let them bump you.
- **学中文 Learn Chinese** (simplified characters + Hanyu Pinyin, Mandarin voice from the phone):
  - 数一数 Count With Me – count out snacks for the animals, in Mandarin (`feed/?lang=zh`)
  - 汉字翻翻乐 Character Match – match pictures with 日 月 山 水 火 木 人 口 田 雨 (`match/?set=zh`)
  - 汉字 Builder – watch each character's stroke order, then trace it (stroke data: Make Me a Hanzi / hanzi-writer, see zh-write/LICENSE-*)
  - 跟我说 Say It Back – listen, record yourself, hear your own voice
- **Little Shop** – customers buy things; count out the coins (later: give change).
- **Balloon Pop** – pop the balloons of the colour asked for, 5 per round.

Plain HTML/CSS/JS, no build step. Hosted on GitHub Pages; installable to the home screen and playable offline.

To add a game: create a new folder with an `index.html`, add a tile on the landing page, and add the files to `CORE` in `sw.js` (bump the `CACHE` version).

- **跟我读 Read With Me** – six short lessons of K1-level sentences with pinyin. Each sentence teaches one new word first (big, red, said slowly twice); then each word lights up as it is read, the light runs again for the child to read along, and the new word is said once more. Each lesson ends with a review of all its new words.
- **动一动 Action Words** – 62 animated actions in 6 categories (每天 every day, 家务 chores, 运动 sports, 玩 play, 艺术 music & art, 朋友 friends & feelings). Learn: each action with its word, big and red, said slowly twice, then in a sentence. Guess: watch the animation and pick the right word from three.
