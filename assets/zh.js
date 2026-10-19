// Play Corner – Mandarin words (simplified characters + Hanyu Pinyin), pictures and a Mandarin voice.
// Needs assets/animals.js loaded first (for the animal and food pictures).
(function () {
  var PC = window.PC = window.PC || {};
  var INK = '#1D2B4F';
  var svg = function (body, vb) { return '<svg viewBox="' + (vb || '0 0 100 100') + '" aria-hidden="true">' + body + '</svg>'; };

  // ---------- pictures ----------
  var P = {
    apple: svg('<path d="M50 30C38 18 14 22 14 50C14 76 34 92 50 86C66 92 86 76 86 50C86 22 62 18 50 30Z" fill="#E5484D"/><path d="M50 30Q48 18 54 10" fill="none" stroke="#6E4630" stroke-width="5" stroke-linecap="round"/><path d="M54 18Q66 6 78 14Q68 26 54 18Z" fill="#2FA86B"/><ellipse cx="32" cy="44" rx="6" ry="10" fill="#fff" opacity=".35" transform="rotate(20 32 44)"/>'),
    orange: svg('<circle cx="50" cy="54" r="36" fill="#F28C28"/><g fill="#D9701A" opacity=".5"><circle cx="38" cy="46" r="2"/><circle cx="58" cy="40" r="2"/><circle cx="64" cy="60" r="2"/><circle cx="44" cy="66" r="2"/><circle cx="30" cy="60" r="2"/></g><path d="M50 18Q62 6 74 12Q66 24 50 20Z" fill="#2FA86B"/><circle cx="50" cy="19" r="3" fill="#6E4630"/><ellipse cx="36" cy="42" rx="6" ry="9" fill="#fff" opacity=".3" transform="rotate(30 36 42)"/>'),
    watermelon: svg('<path d="M8 40A42 42 0 0 0 92 40Z" fill="#2FA86B"/><path d="M14 40A36 36 0 0 0 86 40Z" fill="#E8F5D0"/><path d="M18 40A32 32 0 0 0 82 40Z" fill="#E5484D"/><g fill="#1D2B4F"><ellipse cx="36" cy="52" rx="2.4" ry="3.6"/><ellipse cx="50" cy="60" rx="2.4" ry="3.6"/><ellipse cx="64" cy="52" rx="2.4" ry="3.6"/><ellipse cx="44" cy="48" rx="2.4" ry="3.6"/><ellipse cx="57" cy="47" rx="2.4" ry="3.6"/></g>', '0 0 100 80'),
    grapes: svg('<path d="M50 14Q52 6 60 4" fill="none" stroke="#6E4630" stroke-width="4" stroke-linecap="round"/><path d="M54 12Q70 2 80 12Q68 22 54 12Z" fill="#2FA86B"/><g fill="#8B5CF6" stroke="#6A3FD0" stroke-width="2"><circle cx="38" cy="26" r="11"/><circle cx="60" cy="26" r="11"/><circle cx="28" cy="44" r="11"/><circle cx="50" cy="44" r="11"/><circle cx="72" cy="44" r="11"/><circle cx="38" cy="62" r="11"/><circle cx="60" cy="62" r="11"/><circle cx="49" cy="80" r="11"/></g><g fill="#fff" opacity=".35"><circle cx="34" cy="22" r="3"/><circle cx="46" cy="40" r="3"/><circle cx="56" cy="58" r="3"/></g>'),
    strawberry: svg('<path d="M50 92C26 76 14 56 18 38Q50 24 82 38C86 56 74 76 50 92Z" fill="#E5484D"/><g fill="#FFE07A"><ellipse cx="34" cy="46" rx="2" ry="3"/><ellipse cx="50" cy="44" rx="2" ry="3"/><ellipse cx="66" cy="46" rx="2" ry="3"/><ellipse cx="42" cy="60" rx="2" ry="3"/><ellipse cx="58" cy="60" rx="2" ry="3"/><ellipse cx="50" cy="74" rx="2" ry="3"/><ellipse cx="30" cy="58" rx="2" ry="3"/><ellipse cx="70" cy="58" rx="2" ry="3"/></g><path d="M22 36Q30 22 40 32Q44 16 50 28Q56 16 60 32Q70 22 78 36Q50 44 22 36Z" fill="#2FA86B"/>'),
    eye: svg('<path d="M8 50Q50 8 92 50Q50 92 8 50Z" fill="#fff" stroke="' + INK + '" stroke-width="4"/><circle cx="50" cy="50" r="18" fill="#6B4226"/><circle cx="50" cy="50" r="9" fill="' + INK + '"/><circle cx="56" cy="44" r="4" fill="#fff"/><path d="M22 34L16 24M36 25L33 14M50 22V11M64 25L67 14M78 34L84 24" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>'),
    nose: svg('<path d="M50 10Q44 40 26 62Q20 80 38 80Q44 88 50 84Q56 88 62 80Q80 80 74 62Q56 40 50 10Z" fill="#F5CBA7" stroke="#D99A6C" stroke-width="3"/><ellipse cx="40" cy="74" rx="5" ry="3.5" fill="#B9774A"/><ellipse cx="60" cy="74" rx="5" ry="3.5" fill="#B9774A"/>'),
    mouth: svg('<path d="M10 46Q30 30 50 40Q70 30 90 46Q72 80 50 80Q28 80 10 46Z" fill="#E5484D"/><path d="M14 47Q50 56 86 47Q70 70 50 70Q30 70 14 47Z" fill="#7A2E3B"/><path d="M22 49Q50 56 78 49L74 55Q50 60 26 55Z" fill="#fff"/><ellipse cx="50" cy="66" rx="12" ry="5" fill="#F28B9B"/>'),
    ear: svg('<path d="M36 12C64 6 84 26 80 52C77 72 62 74 58 88C54 96 40 96 38 86C36 76 46 72 46 62C46 52 30 54 26 40C22 26 26 14 36 12Z" fill="#F5CBA7" stroke="#D99A6C" stroke-width="3"/><path d="M42 26C58 22 70 34 66 50C64 58 56 60 54 54C52 46 58 40 52 34C46 30 40 34 42 26Z" fill="#E7A982"/>'),
    hand: svg('<path d="M30 92C22 80 16 64 18 52C18 46 26 44 30 50L34 58V22C34 16 44 16 44 22V48V14C44 8 54 8 54 14V48V18C54 12 64 12 64 18V50V28C64 22 74 22 74 28V62C74 80 66 92 56 94Z" fill="#F5CBA7" stroke="#D99A6C" stroke-width="3" stroke-linejoin="round"/>'),
    foot: svg('<path d="M30 40C26 62 30 86 48 92C66 96 76 82 72 64C70 54 64 46 64 38C64 28 54 24 44 26C34 28 32 34 30 40Z" fill="#F5CBA7" stroke="#D99A6C" stroke-width="3"/><g fill="#F5CBA7" stroke="#D99A6C" stroke-width="3"><ellipse cx="36" cy="16" rx="8" ry="9"/><ellipse cx="52" cy="12" rx="6" ry="7"/><ellipse cx="64" cy="14" rx="5" ry="6"/><ellipse cx="74" cy="20" rx="4.5" ry="5"/><ellipse cx="81" cy="28" rx="4" ry="4.5"/></g>'),
    sun: svg('<g stroke="#F5B800" stroke-width="7" stroke-linecap="round"><path d="M50 6V18M50 82V94M6 50H18M82 50H94M19 19L27 27M73 73L81 81M81 19L73 27M27 73L19 81"/></g><circle cx="50" cy="50" r="24" fill="#FFD43B"/><circle cx="42" cy="46" r="3" fill="' + INK + '"/><circle cx="58" cy="46" r="3" fill="' + INK + '"/><path d="M42 56Q50 63 58 56" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>'),
    moon: svg('<path d="M60 8A42 42 0 1 0 92 66A34 34 0 1 1 60 8Z" fill="#F5C518"/><circle cx="34" cy="48" r="3" fill="#C49A00"/><circle cx="44" cy="70" r="4" fill="#C49A00"/>'),
    mountain: svg('<path d="M4 88L36 30L54 60L66 42L96 88Z" fill="#5964CE"/><path d="M36 30L46 48L40 46L34 52L28 44Z" fill="#fff"/><path d="M66 42L74 54L68 52L64 56Z" fill="#fff"/><path d="M22 88L46 52L70 88Z" fill="#3348A3"/>'),
    water: svg('<path d="M50 8C40 26 28 38 28 54A22 22 0 0 0 72 54C72 38 60 26 50 8Z" fill="#5AA9E6"/><ellipse cx="42" cy="54" rx="5" ry="9" fill="#fff" opacity=".45"/><path d="M8 84Q20 76 32 84T56 84T80 84T104 84" fill="none" stroke="#2F6FED" stroke-width="6" stroke-linecap="round"/>'),
    fire: svg('<path d="M50 6C56 26 78 34 78 62A28 28 0 0 1 22 62C22 46 32 38 36 26C42 36 44 42 48 44C50 32 46 18 50 6Z" fill="#F28C28"/><path d="M50 40C54 52 66 58 66 70A16 16 0 0 1 34 70C34 60 42 56 44 48C46 54 48 56 50 56C52 50 50 46 50 40Z" fill="#FFD43B"/>'),
    tree: svg('<rect x="42" y="56" width="16" height="38" rx="4" fill="#8B5A2B"/><circle cx="50" cy="38" r="28" fill="#2FA86B"/><circle cx="30" cy="50" r="16" fill="#2FA86B"/><circle cx="70" cy="50" r="16" fill="#2FA86B"/><circle cx="42" cy="30" r="6" fill="#4CC07E"/>'),
    person: svg('<circle cx="50" cy="22" r="14" fill="#F5CBA7"/><path d="M42 20h.1M58 20h.1" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M44 27Q50 31 56 27" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/><path d="M50 38V66M50 66L34 92M50 66L66 92M50 46L28 58M50 46L72 58" stroke="#2F6FED" stroke-width="9" stroke-linecap="round"/>'),
    field: svg('<rect x="10" y="10" width="80" height="80" rx="6" fill="#7CC24A" stroke="#4E8F2A" stroke-width="5"/><path d="M50 10V90M10 50H90" stroke="#4E8F2A" stroke-width="5"/><g stroke="#3E7A1E" stroke-width="3" stroke-linecap="round"><path d="M22 22v12M30 20v14M38 22v12M62 22v12M70 20v14M78 22v12M22 62v12M30 60v14M38 62v12M62 62v12M70 60v14M78 62v12"/></g>'),
    rain: svg('<path d="M24 54A16 16 0 0 1 26 22A22 22 0 0 1 68 18A18 18 0 0 1 78 54Z" fill="#B9C6D9"/><g fill="#2F6FED"><path d="M30 64q-6 10 0 14q6 -4 0 -14z"/><path d="M50 70q-6 10 0 14q6 -4 0 -14z"/><path d="M70 64q-6 10 0 14q6 -4 0 -14z"/><path d="M40 82q-5 8 0 11q5 -3 0 -11z"/><path d="M60 82q-5 8 0 11q5 -3 0 -11z"/></g>')
  };
  function blob(color) {
    return svg('<path d="M50 8C66 8 70 22 82 26C94 30 94 50 88 60C82 72 92 84 78 90C64 96 56 86 46 90C34 94 18 92 14 78C10 66 20 60 14 48C8 34 18 22 30 18C38 14 40 8 50 8Z" fill="' + color + '"/><ellipse cx="36" cy="34" rx="8" ry="12" fill="#fff" opacity=".3" transform="rotate(30 36 34)"/>');
  }

  // ---------- words ----------
  var A = function (k) { return function () { return PC.animal ? PC.animal(k, 'idle') : ''; }; };
  var F = function (k) { return function () { return PC.food ? PC.food(k) : ''; }; };
  var K = function (k) { return function () { return P[k]; }; };
  PC.zhVocab = {
    animals: { hz: '动物', py: 'dòng wù', items: [
      { id: 'bunny', hz: '小兔', py: 'xiǎo tù', en: 'bunny', pic: A('bunny') },
      { id: 'cat', hz: '小猫', py: 'xiǎo māo', en: 'kitten', pic: A('cat') },
      { id: 'dog', hz: '小狗', py: 'xiǎo gǒu', en: 'puppy', pic: A('dog') },
      { id: 'monkey', hz: '猴子', py: 'hóu zi', en: 'monkey', pic: A('monkey') },
      { id: 'frog', hz: '青蛙', py: 'qīng wā', en: 'frog', pic: A('frog') },
      { id: 'chick', hz: '小鸡', py: 'xiǎo jī', en: 'chick', pic: A('chick') }
    ]},
    fruits: { hz: '水果', py: 'shuǐ guǒ', items: [
      { id: 'apple', hz: '苹果', py: 'píng guǒ', en: 'apple', pic: K('apple') },
      { id: 'banana', hz: '香蕉', py: 'xiāng jiāo', en: 'banana', pic: F('banana') },
      { id: 'orange', hz: '橙子', py: 'chéng zi', en: 'orange', pic: K('orange') },
      { id: 'watermelon', hz: '西瓜', py: 'xī guā', en: 'watermelon', pic: K('watermelon') },
      { id: 'grapes', hz: '葡萄', py: 'pú tao', en: 'grapes', pic: K('grapes') },
      { id: 'strawberry', hz: '草莓', py: 'cǎo méi', en: 'strawberry', pic: K('strawberry') }
    ]},
    colours: { hz: '颜色', py: 'yán sè', items: [
      { id: 'red', hz: '红色', py: 'hóng sè', en: 'red', color: '#E5484D', pic: function () { return blob('#E5484D'); } },
      { id: 'yellow', hz: '黄色', py: 'huáng sè', en: 'yellow', color: '#F5B800', pic: function () { return blob('#F5B800'); } },
      { id: 'blue', hz: '蓝色', py: 'lán sè', en: 'blue', color: '#2F6FED', pic: function () { return blob('#2F6FED'); } },
      { id: 'green', hz: '绿色', py: 'lǜ sè', en: 'green', color: '#2FA86B', pic: function () { return blob('#2FA86B'); } },
      { id: 'purple', hz: '紫色', py: 'zǐ sè', en: 'purple', color: '#8B5CF6', pic: function () { return blob('#8B5CF6'); } },
      { id: 'orange', hz: '橙色', py: 'chéng sè', en: 'orange', color: '#F28C28', pic: function () { return blob('#F28C28'); } }
    ]},
    body: { hz: '身体', py: 'shēn tǐ', items: [
      { id: 'eye', hz: '眼睛', py: 'yǎn jing', en: 'eye', pic: K('eye') },
      { id: 'nose', hz: '鼻子', py: 'bí zi', en: 'nose', pic: K('nose') },
      { id: 'mouth', hz: '嘴巴', py: 'zuǐ ba', en: 'mouth', pic: K('mouth') },
      { id: 'ear', hz: '耳朵', py: 'ěr duo', en: 'ear', pic: K('ear') },
      { id: 'hand', hz: '手', py: 'shǒu', en: 'hand', pic: K('hand') },
      { id: 'foot', hz: '脚', py: 'jiǎo', en: 'foot', pic: K('foot') }
    ]},
    characters: { hz: '汉字', py: 'hàn zì', items: [
      { id: 'ri', hz: '日', py: 'rì', en: 'sun', pic: K('sun') },
      { id: 'yue', hz: '月', py: 'yuè', en: 'moon', pic: K('moon') },
      { id: 'shan', hz: '山', py: 'shān', en: 'mountain', pic: K('mountain') },
      { id: 'shui', hz: '水', py: 'shuǐ', en: 'water', pic: K('water') },
      { id: 'huo', hz: '火', py: 'huǒ', en: 'fire', pic: K('fire') },
      { id: 'mu', hz: '木', py: 'mù', en: 'tree', pic: K('tree') },
      { id: 'ren', hz: '人', py: 'rén', en: 'person', pic: K('person') },
      { id: 'kou', hz: '口', py: 'kǒu', en: 'mouth', pic: K('mouth') },
      { id: 'tian', hz: '田', py: 'tián', en: 'field', pic: K('field') },
      { id: 'yu', hz: '雨', py: 'yǔ', en: 'rain', pic: K('rain') }
    ]}
  };
  // counting: 一二三… (counting aloud) and 两 for "two of something"
  PC.zhNumbers = [
    null,
    { count: '一', cpy: 'yī', amt: '一', apy: 'yī' },
    { count: '二', cpy: 'èr', amt: '两', apy: 'liǎng' },
    { count: '三', cpy: 'sān', amt: '三', apy: 'sān' },
    { count: '四', cpy: 'sì', amt: '四', apy: 'sì' },
    { count: '五', cpy: 'wǔ', amt: '五', apy: 'wǔ' },
    { count: '六', cpy: 'liù', amt: '六', apy: 'liù' },
    { count: '七', cpy: 'qī', amt: '七', apy: 'qī' },
    { count: '八', cpy: 'bā', amt: '八', apy: 'bā' },
    { count: '九', cpy: 'jiǔ', amt: '九', apy: 'jiǔ' },
    { count: '十', cpy: 'shí', amt: '十', apy: 'shí' }
  ];

  // ---------- Mandarin voice ----------
  var voice = null, checked = false;
  function pick() {
    try {
      var vs = speechSynthesis.getVoices();
      if (!vs.length) return;
      checked = true;
      var isMandarin = function (v) { return /^(zh[-_]CN|cmn|zh[-_]Hans)/i.test(v.lang) || /^zh[-_](TW|SG)/i.test(v.lang); };
      // never pick Cantonese (zh-HK / yue)
      var ok = vs.filter(function (v) { return isMandarin(v) && !/HK|yue/i.test(v.lang); });
      voice = ok.filter(function (v) { return /zh[-_]CN|cmn/i.test(v.lang); })[0] || ok[0] || null;
    } catch (e) {}
  }
  try { pick(); speechSynthesis.addEventListener('voiceschanged', pick); } catch (e) {}

  PC.zh = {
    say: function (text, opts) {
      opts = opts || {};
      try {
        if (!('speechSynthesis' in window)) return;
        if (!opts.queue) speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        if (voice) u.voice = voice;
        u.lang = (voice && voice.lang) || 'zh-CN';
        u.rate = opts.rate || 0.8; u.pitch = opts.pitch || 1.15;
        if (opts.onend) u.onend = opts.onend;
        speechSynthesis.speak(u);
      } catch (e) {}
    },
    // true = has a Mandarin voice, false = definitely none, null = can't tell yet
    hasVoice: function () { pick(); return voice ? true : (checked ? false : null); },
    // Shows a small one-line notice if this phone has no Mandarin voice.
    voiceNotice: function (el) {
      var tries = 0;
      var t = setInterval(function () {
        var h = PC.zh.hasVoice();
        if (h === false) {
          el.textContent = 'No Mandarin voice on this phone yet. Settings › General management › Text-to-speech › install Chinese (Mandarin).';
          el.style.display = 'block'; clearInterval(t);
        } else if (h === true || ++tries > 10) clearInterval(t);
      }, 500);
    },
    pinyinize: function (text) { return text; }
  };
})();
