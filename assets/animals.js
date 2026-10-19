// Play Corner cartoon animals and foods, drawn as SVG.
// PC.animal(kind, mood) -> SVG markup (viewBox 0 0 200 200)
//   kind: bunny | cat | dog | monkey | frog | chick
//   mood: idle | open (mouth open / surprised) | chew | yuck | happy
// PC.food(kind) -> SVG markup (viewBox 0 0 100 100)
//   kind: carrot | banana | bone | fish | corn
(function () {
  var INK = '#1D2B4F', MOUTH = '#7A2E3B', TONGUE = '#F28B9B', CHEEK = '#F28B9B';

  function eyes(mood, y, lx, rx) {
    lx = lx || 76; rx = rx || 124;
    if (mood === 'happy') {
      return '<path d="M' + (lx - 11) + ' ' + (y + 3) + 'Q' + lx + ' ' + (y - 11) + ' ' + (lx + 11) + ' ' + (y + 3) + 'M' + (rx - 11) + ' ' + (y + 3) + 'Q' + rx + ' ' + (y - 11) + ' ' + (rx + 11) + ' ' + (y + 3) + '" fill="none" stroke="' + INK + '" stroke-width="5.5" stroke-linecap="round"/>';
    }
    if (mood === 'yuck') {
      return '<path d="M' + (lx - 9) + ' ' + (y - 8) + 'L' + (lx + 7) + ' ' + y + 'L' + (lx - 9) + ' ' + (y + 8) + 'M' + (rx + 9) + ' ' + (y - 8) + 'L' + (rx - 7) + ' ' + y + 'L' + (rx + 9) + ' ' + (y + 8) + '" fill="none" stroke="' + INK + '" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    var big = mood === 'open' ? 1.15 : 1;
    return '<ellipse cx="' + lx + '" cy="' + y + '" rx="' + (8.5 * big) + '" ry="' + (10.5 * big) + '" fill="' + INK + '"/>' +
      '<ellipse cx="' + rx + '" cy="' + y + '" rx="' + (8.5 * big) + '" ry="' + (10.5 * big) + '" fill="' + INK + '"/>' +
      '<circle cx="' + (lx + 3) + '" cy="' + (y - 4) + '" r="3.2" fill="#fff"/><circle cx="' + (rx + 3) + '" cy="' + (y - 4) + '" r="3.2" fill="#fff"/>';
  }

  function cheeks(y, puffed, lx, rx) {
    lx = lx || 60; rx = rx || 140;
    var rxs = puffed ? 15 : 10, rys = puffed ? 10 : 6;
    return '<ellipse cx="' + lx + '" cy="' + y + '" rx="' + rxs + '" ry="' + rys + '" fill="' + CHEEK + '" opacity=".7"/>' +
      '<ellipse cx="' + rx + '" cy="' + y + '" rx="' + rxs + '" ry="' + rys + '" fill="' + CHEEK + '" opacity=".7"/>';
  }

  function mouth(mood, y, wide) {
    var w = wide ? 1.5 : 1;
    switch (mood) {
      case 'open':
        return '<ellipse cx="100" cy="' + (y + 5) + '" rx="' + (15 * w) + '" ry="14" fill="' + MOUTH + '"/>' +
          '<ellipse cx="100" cy="' + (y + 13) + '" rx="' + (9 * w) + '" ry="5" fill="' + TONGUE + '"/>';
      case 'chew':
        return '<path d="M' + (100 - 16 * w) + ' ' + (y + 3) + 'q' + (8 * w) + ' -7 ' + (16 * w) + ' 0q' + (8 * w) + ' 7 ' + (16 * w) + ' 0" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>';
      case 'yuck':
        return '<path d="M' + (100 - 17 * w) + ' ' + (y + 2) + 'l' + (6.8 * w) + ' -5l' + (6.8 * w) + ' 5l' + (6.8 * w) + ' -5l' + (6.8 * w) + ' 5l' + (6.8 * w) + ' -5" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>' +
          '<path d="M102 ' + (y + 2) + 'h14v8a7 7 0 0 1 -14 0z" fill="' + TONGUE + '" stroke="' + MOUTH + '" stroke-width="2"/>';
      case 'happy':
        return '<path d="M' + (100 - 18 * w) + ' ' + (y - 2) + 'Q100 ' + (y + 26) + ' ' + (100 + 18 * w) + ' ' + (y - 2) + 'Z" fill="' + MOUTH + '"/>' +
          '<ellipse cx="100" cy="' + (y + 11) + '" rx="' + (8 * w) + '" ry="4.5" fill="' + TONGUE + '"/>';
      default:
        return '<path d="M' + (100 - 12 * w) + ' ' + y + 'Q100 ' + (y + 11) + ' ' + (100 + 12 * w) + ' ' + y + '" fill="none" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round"/>';
    }
  }

  function whiskers(y) {
    return '<path d="M30 ' + (y - 6) + 'L64 ' + y + 'M28 ' + (y + 8) + 'L64 ' + (y + 6) + 'M170 ' + (y - 6) + 'L136 ' + y + 'M172 ' + (y + 8) + 'L136 ' + (y + 6) + '" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>';
  }

  var draw = {
    bunny: function (m) {
      return '<g transform="rotate(-8 74 52)"><ellipse cx="74" cy="52" rx="17" ry="40" fill="#F6F1EC" stroke="#D9CFC6" stroke-width="3"/><ellipse cx="74" cy="55" rx="8" ry="28" fill="#F7B6C2"/></g>' +
        '<g transform="rotate(8 126 52)"><ellipse cx="126" cy="52" rx="17" ry="40" fill="#F6F1EC" stroke="#D9CFC6" stroke-width="3"/><ellipse cx="126" cy="55" rx="8" ry="28" fill="#F7B6C2"/></g>' +
        '<circle cx="100" cy="112" r="64" fill="#F6F1EC" stroke="#D9CFC6" stroke-width="3"/>' +
        eyes(m, 102) + cheeks(130, m === 'chew') + whiskers(126) +
        '<path d="M93 118H107L100 126Z" fill="#E86A8A" stroke="#E86A8A" stroke-width="2" stroke-linejoin="round"/>' +
        mouth(m, 136) +
        (m === 'idle' ? '<rect x="94" y="140" width="12" height="9" rx="2" fill="#fff" stroke="#D9CFC6" stroke-width="2"/>' : '');
    },
    cat: function (m) {
      return '<path d="M44 78L54 24L92 52Z" fill="#F5A25D" stroke="#F5A25D" stroke-width="6" stroke-linejoin="round"/><path d="M56 64L60 38L80 54Z" fill="#F7B6C2"/>' +
        '<path d="M156 78L146 24L108 52Z" fill="#F5A25D" stroke="#F5A25D" stroke-width="6" stroke-linejoin="round"/><path d="M144 64L140 38L120 54Z" fill="#F7B6C2"/>' +
        '<circle cx="100" cy="112" r="64" fill="#F5A25D"/>' +
        '<path d="M88 52l6 13M100 50v15M112 52l-6 13" stroke="#D9822B" stroke-width="5" stroke-linecap="round"/>' +
        '<ellipse cx="100" cy="134" rx="30" ry="22" fill="#FBE3C8"/>' +
        eyes(m, 102) + cheeks(130, m === 'chew', 56, 144) + whiskers(128) +
        '<path d="M94 119H106L100 126Z" fill="#E86A8A" stroke="#E86A8A" stroke-width="2" stroke-linejoin="round"/>' +
        mouth(m, 136);
    },
    dog: function (m) {
      return '<ellipse cx="42" cy="104" rx="21" ry="42" fill="#8B5A2B" transform="rotate(16 42 104)"/>' +
        '<ellipse cx="158" cy="104" rx="21" ry="42" fill="#8B5A2B" transform="rotate(-16 158 104)"/>' +
        '<circle cx="100" cy="110" r="62" fill="#D9A066"/>' +
        '<ellipse cx="126" cy="96" rx="17" ry="15" fill="#B97A43"/>' +
        '<ellipse cx="100" cy="136" rx="32" ry="23" fill="#F3D3A8"/>' +
        eyes(m, 98) + cheeks(128, m === 'chew', 58, 142) +
        '<ellipse cx="100" cy="122" rx="12" ry="8.5" fill="' + INK + '"/><ellipse cx="96" cy="119" rx="4" ry="2.5" fill="#fff" opacity=".6"/>' +
        mouth(m, 138);
    },
    monkey: function (m) {
      return '<circle cx="36" cy="110" r="21" fill="#8B5A3C"/><circle cx="36" cy="110" r="11" fill="#F2C9A0"/>' +
        '<circle cx="164" cy="110" r="21" fill="#8B5A3C"/><circle cx="164" cy="110" r="11" fill="#F2C9A0"/>' +
        '<circle cx="100" cy="110" r="64" fill="#8B5A3C"/>' +
        '<path d="M84 52q16 -14 32 0" fill="none" stroke="#6E4630" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="80" cy="100" r="25" fill="#F2C9A0"/><circle cx="120" cy="100" r="25" fill="#F2C9A0"/><ellipse cx="100" cy="134" rx="38" ry="30" fill="#F2C9A0"/>' +
        eyes(m, 100, 80, 120) + cheeks(130, m === 'chew', 66, 134) +
        '<circle cx="95" cy="121" r="2.8" fill="#6E4630"/><circle cx="105" cy="121" r="2.8" fill="#6E4630"/>' +
        mouth(m, 140);
    },
    frog: function (m) {
      var ey = 68;
      var eye = function (cx) {
        if (m === 'happy' || m === 'yuck') return '';
        var s = m === 'open' ? 1.15 : 1;
        return '<circle cx="' + cx + '" cy="' + ey + '" r="15" fill="#fff"/><ellipse cx="' + cx + '" cy="' + (ey + 1) + '" rx="' + (7.5 * s) + '" ry="' + (9.5 * s) + '" fill="' + INK + '"/><circle cx="' + (cx + 3) + '" cy="' + (ey - 3) + '" r="3" fill="#fff"/>';
      };
      return '<circle cx="66" cy="70" r="26" fill="#6CC24A"/><circle cx="134" cy="70" r="26" fill="#6CC24A"/>' +
        '<ellipse cx="100" cy="124" rx="76" ry="56" fill="#6CC24A"/>' +
        eye(66) + eye(134) + ((m === 'happy' || m === 'yuck') ? eyes(m, ey + 2, 66, 134) : '') +
        cheeks(136, m === 'chew', 46, 154) +
        '<circle cx="93" cy="112" r="2.6" fill="#3E8E2B"/><circle cx="107" cy="112" r="2.6" fill="#3E8E2B"/>' +
        mouth(m, 136, true);
    },
    chick: function (m) {
      var beak;
      if (m === 'open' || m === 'happy' || m === 'yuck') {
        beak = '<path d="M86 122H114L100 132Z" fill="#F28C28" stroke="#F28C28" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M89 136H111L100 150Z" fill="#E0761A" stroke="#E0761A" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M90 133H110L100 141Z" fill="' + MOUTH + '"/>';
        if (m === 'yuck') beak += '<path d="M104 136h10v6a5 5 0 0 1 -10 0z" fill="' + TONGUE + '"/>';
      } else if (m === 'chew') {
        beak = '<path d="M86 124H114L100 140Z" fill="#F28C28" stroke="#F28C28" stroke-width="3" stroke-linejoin="round" transform="rotate(-6 100 130)"/>';
      } else {
        beak = '<path d="M86 124H114L100 140Z" fill="#F28C28" stroke="#F28C28" stroke-width="3" stroke-linejoin="round"/><path d="M88 128H112" stroke="#E0761A" stroke-width="2"/>';
      }
      return '<path d="M96 52Q90 30 100 26Q104 40 108 30Q114 40 104 52Z" fill="#F5C518"/>' +
        '<ellipse cx="38" cy="132" rx="16" ry="26" fill="#F5C518" transform="rotate(20 38 132)"/>' +
        '<ellipse cx="162" cy="132" rx="16" ry="26" fill="#F5C518" transform="rotate(-20 162 132)"/>' +
        '<circle cx="100" cy="114" r="64" fill="#FFD43B"/>' +
        eyes(m, 102) + cheeks(126, m === 'chew', 62, 138) + beak;
    }
  };

  var food = {
    carrot: '<path d="M40 30Q36 14 44 8Q48 20 50 28Q52 14 62 10Q60 24 56 30Q66 20 74 24Q64 32 58 34Z" fill="#2FA86B"/>' +
      '<path d="M52 94L32 38Q50 26 70 38Z" fill="#F28C28" stroke="#F28C28" stroke-width="6" stroke-linejoin="round"/>' +
      '<path d="M40 50l9 3M44 64l9 2M48 78l6 2M58 46l-6 3" stroke="#D9701A" stroke-width="3" stroke-linecap="round"/>',
    banana: '<path d="M16 54Q30 90 70 78Q88 70 90 44L84 42Q78 66 58 68Q34 70 24 50Z" fill="#F5C518" stroke="#C49A00" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M84 42L90 30L94 32L90 44Z" fill="#8B6A1E"/><circle cx="18" cy="52" r="3.5" fill="#6E5416"/>',
    bone: '<g fill="#F4EEE2" stroke="#C9BFAE" stroke-width="3"><circle cx="24" cy="38" r="13"/><circle cx="24" cy="62" r="13"/><circle cx="76" cy="38" r="13"/><circle cx="76" cy="62" r="13"/></g>' +
      '<rect x="22" y="40" width="56" height="20" fill="#F4EEE2"/><path d="M26 40H74M26 60H74" stroke="#C9BFAE" stroke-width="3"/>',
    fish: '<path d="M70 50L94 32V68Z" fill="#3E8ED0" stroke="#3E8ED0" stroke-width="4" stroke-linejoin="round"/>' +
      '<ellipse cx="44" cy="50" rx="32" ry="20" fill="#5AA9E6"/>' +
      '<path d="M48 34q8 16 0 32" fill="none" stroke="#3E8ED0" stroke-width="3"/>' +
      '<circle cx="28" cy="45" r="5.5" fill="#fff"/><circle cx="27" cy="45" r="3" fill="' + INK + '"/>',
    corn: '<path d="M34 92Q18 60 36 30Q40 58 50 90Z" fill="#7CC24A"/><path d="M66 92Q82 60 64 30Q60 58 50 90Z" fill="#6CB33E"/>' +
      '<ellipse cx="50" cy="50" rx="16" ry="34" fill="#F5C518"/>' +
      '<g fill="#E0A800">' + (function () { var s = ''; for (var r = 0; r < 6; r++) for (var c = 0; c < 3; c++) s += '<circle cx="' + (42 + c * 8) + '" cy="' + (28 + r * 9) + '" r="2.6"/>'; return s; })() + '</g>'
  };

  window.PC = window.PC || {};
  window.PC.animal = function (kind, mood) {
    return '<svg viewBox="0 0 200 200" aria-hidden="true">' + (draw[kind] || draw.bunny)(mood || 'idle') + '</svg>';
  };
  window.PC.food = function (kind) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true">' + (food[kind] || '') + '</svg>';
  };
  window.PC.ANIMALS = ['bunny', 'cat', 'dog', 'monkey', 'frog', 'chick'];
})();
