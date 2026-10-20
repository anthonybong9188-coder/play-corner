// Play Corner sounds, made on the fly (no audio files), plus a friendly voice.
(function () {
  var actx;
  function ac() {
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) { actx = null; }
    return actx;
  }
  function tone(type, f0, f1, t0, dur, vol) {
    var a = ac(); if (!a) return;
    var t = a.currentTime + (t0 || 0);
    var o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.25, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, t0) {
    var a = ac(); if (!a) return;
    var t = a.currentTime + (t0 || 0);
    var buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
    var s = a.createBufferSource(); s.buffer = buf;
    var g = a.createGain(); g.gain.value = vol || 0.3;
    var f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400;
    s.connect(f).connect(g).connect(a.destination); s.start(t);
  }
  function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }

  var voice = null;
  function pickVoice() {
    try {
      var vs = speechSynthesis.getVoices();
      voice = vs.filter(function (v) { return /en[-_](GB|US|AU|SG)/i.test(v.lang) && /female|samantha|karen|serena|google uk english female|zira/i.test(v.name); })[0] ||
              vs.filter(function (v) { return /^en/i.test(v.lang); })[0] || null;
    } catch (e) {}
  }
  try { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } catch (e) {}

  window.PC = window.PC || {};
  window.PC.sfx = {
    unlock: function () { ac(); },
    chomp: function () { noise(0.07, 0.35); noise(0.07, 0.3, 0.16); tone('square', 180, 120, 0, 0.08, 0.06); buzz(20); },
    yuck: function () { tone('sawtooth', 220, 110, 0, 0.35, 0.12); tone('sawtooth', 200, 90, 0.05, 0.35, 0.08); buzz([30, 40, 30]); },
    yum: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone('triangle', f, 0, i * 0.09, 0.22, 0.2); }); buzz([20, 50, 20]); },
    giggle: function () { [880, 990, 880, 1175, 1047].forEach(function (f, i) { tone('sine', f, f * 1.08, i * 0.07, 0.09, 0.18); }); buzz(18); },
    boing: function () { tone('sine', 300, 700, 0, 0.18, 0.15); },
    pop: function () { noise(0.05, 0.25); tone('sine', 600, 300, 0, 0.08, 0.1); },
    coin: function () { tone('square', 1320, 0, 0, 0.05, 0.06); tone('sine', 1760, 0, 0.04, 0.22, 0.16); buzz(12); },
    note: function (f, dur) { tone('triangle', f, 0, 0, dur || 0.4, 0.28); },
    pew: function () { tone('triangle', 1100, 700, 0, 0.07, 0.035); },
    puff: function () { noise(0.18, 0.22); tone('sine', 520, 180, 0, 0.2, 0.12); tone('triangle', 880, 1320, 0.05, 0.12, 0.08); buzz(15); },
    oops: function () { tone('sawtooth', 200, 110, 0, 0.4, 0.12); buzz([40, 40, 40]); },
    tada: function () { [523, 659, 784].forEach(function (f, i) { tone('triangle', f, 0, i * 0.12, 0.3, 0.2); }); tone('triangle', 1047, 0, 0.36, 0.6, 0.22); buzz([30, 60, 30, 60, 60]); },
    say: function (text) {
      try {
        if (!('speechSynthesis' in window)) return;
        speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        if (voice) u.voice = voice;
        u.lang = (voice && voice.lang) || 'en-GB';
        u.rate = 0.92; u.pitch = 1.25;
        speechSynthesis.speak(u);
      } catch (e) {}
    }
  };
})();
