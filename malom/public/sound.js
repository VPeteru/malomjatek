/* Hangeffektek WebAudio szintézissel — több hangstílus, eseményenként külön hangerő és stílus.
   Nincs szükség hangfájlokra: minden hang valós időben készül. */
(function () {
  'use strict';

  // ---------- események és stílusok ----------
  const EVENTS = [
    { id: 'place', name: 'Lerakás', nameEn: 'Placing' },
    { id: 'move', name: 'Mozgatás', nameEn: 'Moving' },
    { id: 'select', name: 'Kijelölés', nameEn: 'Selecting' },
    { id: 'mill', name: 'Malom', nameEn: 'Mill' },
    { id: 'remove', name: 'Leütés', nameEn: 'Capture' },
    { id: 'win', name: 'Győzelem', nameEn: 'Victory' },
    { id: 'lose', name: 'Vereség', nameEn: 'Defeat' },
    { id: 'error', name: 'Hibás lépés', nameEn: 'Invalid move' },
    { id: 'react', name: 'Emoji-reakció', nameEn: 'Emoji reaction' },
    { id: 'notify', name: 'Értesítés', nameEn: 'Notification' }
  ];

  const STYLES = [
    { id: 'basic', name: 'Alap', desc: 'Kiegyensúlyozott, tiszta hangok', nameEn: 'Basic', descEn: 'Balanced, clean sounds' },
    { id: 'fa', name: 'Fa és marimba', desc: 'Kopogó fabábuk, meleg dallamok', nameEn: 'Wood & marimba', descEn: 'Knocking wooden pieces, warm melodies' },
    { id: 'retro', name: 'Retro 8-bit', desc: 'Régi játékgépek csipogása', nameEn: 'Retro 8-bit', descEn: 'Old arcade machine beeps' },
    { id: 'scifi', name: 'Sci-fi', desc: 'Lézerek, sípolások, hajtóművek', nameEn: 'Sci-fi', descEn: 'Lasers, bleeps and thrusters' },
    { id: 'varazs', name: 'Varázslat', desc: 'Csilingelő harangok és hárfa', nameEn: 'Magic', descEn: 'Chiming bells and harp' },
    { id: 'rajzfilm', name: 'Rajzfilm', desc: 'Boing, bonk és szomorú harsona', nameEn: 'Cartoon', descEn: 'Boing, bonk and sad trombone' },
    { id: 'minimal', name: 'Minimál', desc: 'Halk, visszafogott kattanások', nameEn: 'Minimal', descEn: 'Quiet, understated clicks' },
    { id: 'zongora', name: 'Zongora', desc: 'Lágy zongorahangok és akkordok', nameEn: 'Piano', descEn: 'Soft piano notes and chords' },
    { id: 'utos', name: 'Ütős dobok', desc: 'Lábdob, pergő, cintányér', nameEn: 'Drums', descEn: 'Kick, snare and cymbals' },
    { id: 'uveg', name: 'Üveg és kristály', desc: 'Csengő poharak, csilingelő szilánkok', nameEn: 'Glass & crystal', descEn: 'Ringing glasses, tinkling shards' },
    { id: 'elektro', name: 'Elektro', desc: 'Szintetizátor, basszus, wobble', nameEn: 'Electro', descEn: 'Synths, bass and wobble' },
    { id: 'termeszet', name: 'Természet', desc: 'Vízcseppek, madárcsicsergés, susogás', nameEn: 'Nature', descEn: 'Water drops, birdsong, rustling' }
  ];

  const DEFAULTS = {
    muted: false,
    master: 0.8,
    style: 'basic',
    music: { mood: 'off', vol: 0.5 },
    events: Object.fromEntries(EVENTS.map((e) => [e.id, { vol: 1, style: null }]))
  };

  // ---------- beállítások tárolása ----------
  const KEY = 'malom-sound-v2';
  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { s = null; }
    const out = JSON.parse(JSON.stringify(DEFAULTS));
    if (s && typeof s === 'object') {
      if (typeof s.muted === 'boolean') out.muted = s.muted;
      if (typeof s.master === 'number') out.master = Math.min(1, Math.max(0, s.master));
      if (STYLES.some((x) => x.id === s.style)) out.style = s.style;
      if (s.music && typeof s.music === 'object') {
        if (typeof s.music.vol === 'number') out.music.vol = Math.min(1, Math.max(0, s.music.vol));
        if (typeof s.music.mood === 'string') out.music.mood = s.music.mood;
      }
      if (s.events) for (const e of EVENTS) {
        const v = s.events[e.id];
        if (!v) continue;
        if (typeof v.vol === 'number') out.events[e.id].vol = Math.min(1, Math.max(0, v.vol));
        if (v.style === null || STYLES.some((x) => x.id === v.style)) out.events[e.id].style = v.style;
      }
    } else {
      try { if (localStorage.getItem('malom-sound') === 'off') out.muted = true; } catch (e) { /* nincs tárhely */ }
    }
    return out;
  }
  let settings = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (e) { /* nincs tárhely */ } }

  // ---------- hangmotor ----------
  let ctx = null;
  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Egy lejátszáshoz tartozó "busz": ide kötjük a hangokat, a hangereje = fő × esemény
  function makeBus(gain) {
    const a = ac();
    if (!a) return null;
    const g = a.createGain();
    g.gain.value = gain;
    g.connect(a.destination);
    setTimeout(() => { try { g.disconnect(); } catch (e) { /* már leválasztva */ } }, 4000);
    return { a, out: g, t0: a.currentTime + 0.005 };
  }

  function tone(bus, f, dur, o) {
    o = o || {};
    const { a } = bus;
    const t = bus.t0 + (o.delay || 0);
    const osc = a.createOscillator();
    const g = a.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.slide), t + (o.slideTime || dur));
    if (o.vibrato) {
      const lfo = a.createOscillator();
      const lg = a.createGain();
      lfo.frequency.value = o.vibrato;
      lg.gain.value = f * 0.03;
      lfo.connect(lg).connect(osc.frequency);
      lfo.start(t); lfo.stop(t + dur + 0.05);
    }
    const vol = o.vol === undefined ? 0.2 : o.vol;
    const att = o.attack || 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (o.lowpass) {
      const f2 = a.createBiquadFilter();
      f2.type = 'lowpass';
      f2.frequency.value = o.lowpass;
      osc.connect(f2);
      node = f2;
    }
    node.connect(g).connect(bus.out);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  function noise(bus, dur, o) {
    o = o || {};
    const { a } = bus;
    const t = bus.t0 + (o.delay || 0);
    const len = Math.max(1, Math.floor(a.sampleRate * dur));
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, o.curve || 1);
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = o.filter || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 900, t);
    if (o.slide) f.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    f.Q.value = o.q || 1;
    const g = a.createGain();
    g.gain.value = o.vol === undefined ? 0.15 : o.vol;
    src.connect(f).connect(g).connect(bus.out);
    src.start(t);
  }

  // összetett hangszerek
  const knock = (b, f, vol, delay) => { noise(b, 0.05, { freq: f, q: 9, vol: vol * 1.6, delay, curve: 3 }); tone(b, f / 9, 0.08, { vol: vol * 0.7, delay }); };
  const marimba = (b, f, vol, delay, dur) => { tone(b, f, dur || 0.45, { vol, delay, attack: 0.003 }); tone(b, f * 4, 0.12, { vol: vol * 0.25, delay, attack: 0.002 }); };
  const bell = (b, f, vol, delay, dur) => {
    dur = dur || 1.1;
    tone(b, f, dur, { vol, delay, attack: 0.002 });
    tone(b, f * 2.76, dur * 0.6, { vol: vol * 0.35, delay, attack: 0.002 });
    tone(b, f * 5.4, dur * 0.35, { vol: vol * 0.15, delay, attack: 0.002 });
  };
  const sq = (b, f, dur, vol, delay, slide) => tone(b, f, dur, { type: 'square', vol: vol * 0.55, delay, slide, attack: 0.002 });
  const seq = (notes, step, fn) => notes.forEach((n, i) => fn(n, i * step));
  const piano = (b, f, vol, delay, dur) => {
    dur = dur || 0.9;
    tone(b, f, dur, { type: 'triangle', vol, delay, attack: 0.003 });
    tone(b, f * 2, dur * 0.5, { vol: vol * 0.3, delay, attack: 0.002 });
    tone(b, f * 3, dur * 0.25, { vol: vol * 0.12, delay, attack: 0.002 });
  };
  const kick = (b, vol, delay) => tone(b, 150, 0.28, { vol, delay, slide: 45, slideTime: 0.12, attack: 0.002 });
  const snare = (b, vol, delay) => { noise(b, 0.18, { filter: 'highpass', freq: 1500, vol, delay, curve: 2 }); tone(b, 220, 0.08, { type: 'triangle', vol: vol * 0.6, delay }); };
  const hat = (b, vol, delay) => noise(b, 0.05, { filter: 'highpass', freq: 7000, vol, delay, curve: 3 });
  const tom = (b, f, vol, delay) => tone(b, f, 0.28, { vol, delay, slide: f * 0.55, attack: 0.002 });
  const crash = (b, vol, delay) => noise(b, 1.1, { filter: 'highpass', freq: 5000, vol, delay, curve: 1.6 });
  const glass = (b, f, vol, delay, dur) => {
    dur = dur || 0.9;
    tone(b, f, dur, { vol, delay, attack: 0.001 });
    tone(b, f * 2.32, dur * 0.7, { vol: vol * 0.45, delay, attack: 0.001 });
    tone(b, f * 4.25, dur * 0.4, { vol: vol * 0.2, delay, attack: 0.001 });
  };
  const saw = (b, f, dur, vol, delay, lp, slide) => tone(b, f, dur, { type: 'sawtooth', vol, delay, lowpass: lp || 1800, slide, attack: 0.004 });
  const drop = (b, f, vol, delay) => tone(b, f, 0.14, { vol, delay, slide: f * 2.3, slideTime: 0.05, attack: 0.002 });
  const chirp = (b, f, vol, delay) => { tone(b, f, 0.09, { vol, delay, slide: f * 1.35, attack: 0.004 }); tone(b, f * 1.2, 0.08, { vol: vol * 0.8, delay: (delay || 0) + 0.1, slide: f * 0.95 }); };

  // ---------- hangcsomagok ----------
  const PACKS = {
    basic: {
      place: (b) => { tone(b, 220, 0.12, { type: 'triangle', vol: 0.28, slide: 110 }); noise(b, 0.05, { vol: 0.12 }); },
      move: (b) => { noise(b, 0.14, { vol: 0.1 }); tone(b, 330, 0.08, { vol: 0.1, delay: 0.06, slide: 260 }); },
      select: (b) => tone(b, 660, 0.06, { vol: 0.1 }),
      mill: (b) => seq([523, 659, 784, 1046], 0.07, (f, d) => tone(b, f, 0.2, { type: 'triangle', vol: 0.18, delay: d })),
      remove: (b) => { tone(b, 400, 0.3, { type: 'sawtooth', vol: 0.09, slide: 80 }); noise(b, 0.2, { vol: 0.12, delay: 0.05 }); },
      win: (b) => seq([392, 523, 659, 784, 1046], 0.12, (f, d) => tone(b, f, 0.32, { type: 'triangle', vol: 0.2, delay: d })),
      lose: (b) => seq([392, 330, 262, 196], 0.15, (f, d) => tone(b, f, 0.36, { vol: 0.18, delay: d })),
      error: (b) => tone(b, 140, 0.15, { type: 'square', vol: 0.06 }),
      react: (b) => tone(b, 880, 0.08, { vol: 0.12, slide: 1200 }),
      notify: (b) => { tone(b, 660, 0.12, { vol: 0.12 }); tone(b, 880, 0.18, { vol: 0.12, delay: 0.1 }); }
    },
    fa: {
      place: (b) => knock(b, 1500, 0.22, 0),
      move: (b) => { noise(b, 0.18, { freq: 700, slide: 300, q: 2, vol: 0.12 }); knock(b, 1300, 0.14, 0.15); },
      select: (b) => knock(b, 2400, 0.12, 0),
      mill: (b) => { seq([1200, 1500, 1900], 0.08, (f, d) => knock(b, f, 0.16, d)); seq([523, 659, 784, 1046], 0.09, (f, d) => marimba(b, f, 0.2, 0.25 + d)); },
      remove: (b) => { knock(b, 1100, 0.2, 0); knock(b, 800, 0.2, 0.07); tone(b, 90, 0.3, { vol: 0.3, delay: 0.08 }); },
      win: (b) => seq([523, 659, 784, 1046, 1318], 0.11, (f, d) => marimba(b, f, 0.22, d, 0.6)),
      lose: (b) => seq([659, 587, 523, 440], 0.16, (f, d) => marimba(b, f, 0.2, d, 0.6)),
      error: (b) => tone(b, 120, 0.12, { vol: 0.25 }),
      react: (b) => knock(b, 2200, 0.14, 0),
      notify: (b) => { marimba(b, 784, 0.18, 0); marimba(b, 1046, 0.18, 0.12); }
    },
    retro: {
      place: (b) => sq(b, 440, 0.09, 0.3, 0, 220),
      move: (b) => { sq(b, 330, 0.05, 0.22, 0); sq(b, 392, 0.06, 0.22, 0.05); },
      select: (b) => sq(b, 880, 0.04, 0.16, 0),
      mill: (b) => seq([523, 659, 784, 1046, 1318], 0.05, (f, d) => sq(b, f, 0.06, 0.25, d)),
      remove: (b) => { noise(b, 0.28, { filter: 'lowpass', freq: 3000, slide: 200, vol: 0.2 }); sq(b, 220, 0.25, 0.25, 0, 55); },
      win: (b) => { seq([523, 523, 523, 659], 0.1, (f, d) => sq(b, f, 0.08, 0.25, d)); sq(b, 784, 0.35, 0.25, 0.42); sq(b, 1046, 0.4, 0.2, 0.55); },
      lose: (b) => seq([392, 370, 349, 330], 0.18, (f, d) => sq(b, f, 0.17, 0.22, d, f * 0.96)),
      error: (b) => { sq(b, 110, 0.06, 0.2, 0); sq(b, 110, 0.06, 0.2, 0.09); },
      react: (b) => { sq(b, 1046, 0.04, 0.16, 0); sq(b, 1318, 0.05, 0.16, 0.04); },
      notify: (b) => { sq(b, 784, 0.06, 0.18, 0); sq(b, 1046, 0.08, 0.18, 0.07); }
    },
    scifi: {
      place: (b) => { tone(b, 900, 0.16, { vol: 0.16, slide: 200 }); tone(b, 80, 0.1, { type: 'sawtooth', vol: 0.08, lowpass: 400 }); },
      move: (b) => { tone(b, 300, 0.2, { vol: 0.1, slide: 700 }); noise(b, 0.2, { filter: 'highpass', freq: 1500, slide: 5000, vol: 0.06 }); },
      select: (b) => { tone(b, 1200, 0.04, { vol: 0.08 }); tone(b, 1800, 0.04, { vol: 0.07, delay: 0.04 }); },
      mill: (b) => { tone(b, 200, 0.4, { type: 'sawtooth', vol: 0.1, slide: 1200, lowpass: 2500 }); tone(b, 660, 0.5, { vol: 0.1, delay: 0.3 }); tone(b, 990, 0.5, { vol: 0.08, delay: 0.3 }); },
      remove: (b) => { tone(b, 1600, 0.32, { type: 'square', vol: 0.08, slide: 100 }); noise(b, 0.3, { filter: 'lowpass', freq: 1200, vol: 0.15, delay: 0.1 }); },
      win: (b) => { seq([300, 450, 600], 0.18, (f, d) => tone(b, f, 0.3, { type: 'sawtooth', vol: 0.07, slide: f * 2, lowpass: 3000, delay: d })); tone(b, 880, 0.8, { vol: 0.1, delay: 0.55 }); tone(b, 1320, 0.8, { vol: 0.08, delay: 0.55 }); },
      lose: (b) => tone(b, 600, 0.9, { type: 'sawtooth', vol: 0.1, slide: 50, lowpass: 1500 }),
      error: (b) => { tone(b, 90, 0.08, { type: 'sawtooth', vol: 0.12 }); tone(b, 90, 0.08, { type: 'sawtooth', vol: 0.12, delay: 0.11 }); },
      react: (b) => tone(b, 1500, 0.08, { vol: 0.1, slide: 2200 }),
      notify: (b) => { tone(b, 1000, 0.08, { vol: 0.1 }); tone(b, 1500, 0.1, { vol: 0.1, delay: 0.1 }); }
    },
    varazs: {
      place: (b) => bell(b, 784, 0.14, 0, 0.8),
      move: (b) => seq([1568, 1976, 2349], 0.04, (f, d) => tone(b, f, 0.25, { vol: 0.05, delay: d })),
      select: (b) => bell(b, 1318, 0.08, 0, 0.4),
      mill: (b) => { seq([523, 587, 659, 784, 880, 1046, 1175, 1318], 0.04, (f, d) => tone(b, f, 0.5, { type: 'triangle', vol: 0.09, delay: d })); bell(b, 1046, 0.14, 0.34, 1.4); },
      remove: (b) => { noise(b, 0.45, { filter: 'lowpass', freq: 2500, slide: 300, vol: 0.14 }); bell(b, 659, 0.1, 0.05, 0.7); bell(b, 494, 0.1, 0.18, 0.8); },
      win: (b) => seq([523, 659, 784, 1046, 1318, 1568], 0.12, (f, d) => bell(b, f, 0.12, d, 1.3)),
      lose: (b) => seq([440, 392, 330, 262], 0.22, (f, d) => bell(b, f, 0.12, d, 1.2)),
      error: (b) => bell(b, 196, 0.12, 0, 0.4),
      react: (b) => bell(b, 1568, 0.08, 0, 0.5),
      notify: (b) => { bell(b, 1046, 0.1, 0, 0.7); bell(b, 1318, 0.1, 0.14, 0.9); }
    },
    rajzfilm: {
      place: (b) => { tone(b, 180, 0.16, { vol: 0.2, slide: 520, slideTime: 0.07 }); tone(b, 520, 0.12, { vol: 0.1, delay: 0.07, slide: 300 }); },
      move: (b) => tone(b, 400, 0.28, { vol: 0.14, slide: 950, vibrato: 7 }),
      select: (b) => tone(b, 600, 0.06, { vol: 0.12, slide: 1300 }),
      mill: (b) => { tone(b, 523, 0.14, { type: 'triangle', vol: 0.2 }); [523, 659, 784].forEach((f) => tone(b, f, 0.6, { type: 'triangle', vol: 0.14, delay: 0.16 })); },
      remove: (b) => { tone(b, 320, 0.22, { vol: 0.28, slide: 60 }); noise(b, 0.08, { filter: 'lowpass', freq: 600, vol: 0.25 }); tone(b, 1400, 0.4, { vol: 0.07, delay: 0.15, slide: 300 }); },
      win: (b) => { seq([392, 523, 659], 0.1, (f, d) => tone(b, f, 0.14, { type: 'triangle', vol: 0.18, delay: d })); [784, 988, 1175].forEach((f) => tone(b, f, 0.7, { type: 'triangle', vol: 0.12, delay: 0.32, vibrato: 6 })); },
      lose: (b) => { [[392, 370], [370, 349], [349, 330]].forEach(([f, s], i) => tone(b, f, 0.34, { type: 'sawtooth', vol: 0.1, slide: s, lowpass: 900, delay: i * 0.36 })); tone(b, 330, 0.9, { type: 'sawtooth', vol: 0.1, lowpass: 900, delay: 1.08, vibrato: 5, slide: 300 }); },
      error: (b) => { tone(b, 300, 0.08, { vol: 0.14 }); tone(b, 240, 0.12, { vol: 0.14, delay: 0.09 }); },
      react: (b) => tone(b, 700, 0.07, { vol: 0.14, slide: 1500 }),
      notify: (b) => { tone(b, 600, 0.06, { vol: 0.12, slide: 1200 }); tone(b, 800, 0.08, { vol: 0.12, delay: 0.09, slide: 1600 }); }
    },
    minimal: {
      place: (b) => { noise(b, 0.02, { filter: 'highpass', freq: 3500, vol: 0.12 }); tone(b, 1000, 0.03, { vol: 0.05 }); },
      move: (b) => { noise(b, 0.015, { filter: 'highpass', freq: 3500, vol: 0.09 }); noise(b, 0.015, { filter: 'highpass', freq: 3000, vol: 0.09, delay: 0.08 }); },
      select: (b) => noise(b, 0.012, { filter: 'highpass', freq: 5000, vol: 0.08 }),
      mill: (b) => { tone(b, 880, 0.35, { vol: 0.07 }); tone(b, 1320, 0.35, { vol: 0.05, delay: 0.06 }); },
      remove: (b) => tone(b, 140, 0.12, { vol: 0.14, slide: 90 }),
      win: (b) => { tone(b, 660, 0.3, { vol: 0.08 }); tone(b, 990, 0.45, { vol: 0.08, delay: 0.15 }); },
      lose: (b) => { tone(b, 440, 0.3, { vol: 0.08 }); tone(b, 330, 0.45, { vol: 0.08, delay: 0.15 }); },
      error: (b) => noise(b, 0.02, { filter: 'lowpass', freq: 500, vol: 0.18 }),
      react: (b) => noise(b, 0.012, { filter: 'highpass', freq: 4500, vol: 0.08 }),
      notify: (b) => { tone(b, 1200, 0.05, { vol: 0.05 }); tone(b, 1200, 0.05, { vol: 0.05, delay: 0.09 }); }
    },
    zongora: {
      place: (b) => piano(b, 523, 0.2, 0, 0.7),
      move: (b) => { piano(b, 392, 0.14, 0, 0.5); piano(b, 440, 0.14, 0.09, 0.6); },
      select: (b) => piano(b, 1046, 0.08, 0, 0.35),
      mill: (b) => { seq([523, 659, 784], 0.07, (f, d) => piano(b, f, 0.15, d, 1)); piano(b, 1046, 0.18, 0.24, 1.4); },
      remove: (b) => { piano(b, 147, 0.2, 0, 0.9); piano(b, 156, 0.12, 0.01, 0.9); piano(b, 110, 0.18, 0.12, 1.1); },
      win: (b) => { seq([523, 587, 659, 698, 784, 880, 988], 0.06, (f, d) => piano(b, f, 0.12, d, 0.5)); [523, 659, 784, 1046].forEach((f) => piano(b, f, 0.13, 0.5, 1.6)); },
      lose: (b) => seq([440, 349, 294, 220], 0.24, (f, d) => piano(b, f, 0.16, d, 1.2)),
      error: (b) => piano(b, 110, 0.18, 0, 0.3),
      react: (b) => piano(b, 1318, 0.1, 0, 0.5),
      notify: (b) => { piano(b, 784, 0.12, 0, 0.6); piano(b, 1046, 0.12, 0.12, 0.8); }
    },
    utos: {
      place: (b) => kick(b, 0.5, 0),
      move: (b) => { hat(b, 0.18, 0); hat(b, 0.14, 0.08); },
      select: (b) => hat(b, 0.14, 0),
      mill: (b) => { seq([320, 260, 200, 150], 0.07, (f, d) => tom(b, f, 0.35, d)); kick(b, 0.5, 0.3); crash(b, 0.18, 0.3); },
      remove: (b) => { snare(b, 0.3, 0); kick(b, 0.5, 0); snare(b, 0.22, 0.12); },
      win: (b) => { seq([0, 0.08, 0.16, 0.24, 0.32, 0.4], 1, (d, i) => (i % 2 ? snare(b, 0.22, d) : tom(b, 300 - i * 30, 0.3, d))); kick(b, 0.5, 0.5); crash(b, 0.22, 0.5); },
      lose: (b) => seq([200, 170, 140], 0.3, (f, d) => tom(b, f, 0.35, d)),
      error: (b) => noise(b, 0.03, { freq: 3000, q: 10, vol: 0.5, curve: 3 }),
      react: (b) => { tone(b, 800, 0.12, { type: 'square', vol: 0.06 }); tone(b, 540, 0.12, { type: 'square', vol: 0.06 }); },
      notify: (b) => { hat(b, 0.2, 0); hat(b, 0.2, 0.1); kick(b, 0.3, 0.2); }
    },
    uveg: {
      place: (b) => glass(b, 1760, 0.1, 0, 0.6),
      move: (b) => { glass(b, 2093, 0.06, 0, 0.4); glass(b, 2637, 0.05, 0.07, 0.4); },
      select: (b) => glass(b, 3136, 0.05, 0, 0.25),
      mill: (b) => seq([1568, 1760, 2093, 2349, 2637, 3136], 0.05, (f, d) => glass(b, f, 0.08, d, 0.9)),
      remove: (b) => { noise(b, 0.45, { filter: 'highpass', freq: 3500, vol: 0.18, curve: 1.5 }); seq([3520, 2960, 4186, 2637, 3729], 0.03, (f, d) => glass(b, f, 0.04, d, 0.3)); },
      win: (b) => seq([1046, 1318, 1568, 2093, 2637], 0.1, (f, d) => glass(b, f, 0.09, d, 1.2)),
      lose: (b) => seq([1568, 1318, 1046, 784], 0.2, (f, d) => glass(b, f, 0.08, d, 1)),
      error: (b) => tone(b, 440, 0.18, { vol: 0.12, lowpass: 600 }),
      react: (b) => glass(b, 2637, 0.06, 0, 0.5),
      notify: (b) => { glass(b, 2093, 0.07, 0, 0.6); glass(b, 2637, 0.07, 0.1, 0.7); }
    },
    elektro: {
      place: (b) => saw(b, 110, 0.16, 0.16, 0, 900, 55),
      move: (b) => noise(b, 0.22, { filter: 'bandpass', freq: 400, slide: 4000, q: 3, vol: 0.18 }),
      select: (b) => tone(b, 1500, 0.035, { type: 'square', vol: 0.06 }),
      mill: (b) => { [523, 527, 519, 659, 784].forEach((f) => saw(b, f, 0.55, 0.05, 0.05, 2400)); kick(b, 0.4, 0); },
      remove: (b) => tone(b, 80, 0.45, { type: 'sawtooth', vol: 0.2, lowpass: 500, vibrato: 9 }),
      win: (b) => { seq([440, 554, 659, 880, 1108, 1318, 1760], 0.06, (f, d) => saw(b, f, 0.12, 0.07, d, 3000)); kick(b, 0.4, 0.45); saw(b, 880, 0.7, 0.06, 0.45, 2500); },
      lose: (b) => saw(b, 440, 0.9, 0.1, 0, 1200, 55),
      error: (b) => tone(b, 70, 0.14, { type: 'square', vol: 0.12, lowpass: 400 }),
      react: (b) => tone(b, 2000, 0.12, { vol: 0.1, slide: 400 }),
      notify: (b) => { tone(b, 1200, 0.05, { type: 'square', vol: 0.06 }); tone(b, 1800, 0.06, { type: 'square', vol: 0.06, delay: 0.08 }); }
    },
    termeszet: {
      place: (b) => drop(b, 900, 0.22, 0),
      move: (b) => noise(b, 0.3, { filter: 'bandpass', freq: 2500, q: 0.7, vol: 0.1, curve: 0.6 }),
      select: (b) => drop(b, 1400, 0.12, 0),
      mill: (b) => { chirp(b, 2600, 0.08, 0); chirp(b, 3100, 0.07, 0.22); chirp(b, 2800, 0.07, 0.42); },
      remove: (b) => { noise(b, 0.4, { filter: 'lowpass', freq: 1500, vol: 0.2, curve: 1.2 }); drop(b, 500, 0.2, 0.05); },
      win: (b) => { seq([2400, 3000, 2700, 3300, 2900], 0.15, (f, d) => chirp(b, f, 0.07, d)); bell(b, 1046, 0.08, 0.3, 1.2); },
      lose: (b) => seq([1200, 1000, 800, 600, 450], 0.16, (f, d) => drop(b, f, 0.14, d)),
      error: (b) => drop(b, 300, 0.2, 0),
      react: (b) => chirp(b, 3000, 0.07, 0),
      notify: (b) => { drop(b, 1100, 0.15, 0); drop(b, 1500, 0.15, 0.12); }
    }
  };

  function styleFor(eventId) {
    const e = settings.events[eventId];
    return (e && e.style) || settings.style;
  }

  function run(eventId, styleId, gain) {
    const pack = PACKS[styleId] || PACKS.basic;
    const fn = pack[eventId];
    if (!fn || gain <= 0.001) return;
    try {
      const bus = makeBus(gain);
      if (bus) fn(bus);
    } catch (e) { /* hang nem elérhető */ }
  }

  // ---------- háttérzene (procedurális, végtelenített) ----------
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const MOODS = [
    { id: 'off', name: 'Nincs zene', nameEn: 'No music' },
    { id: 'nyugodt', name: 'Nyugodt zongora', nameEn: 'Calm piano' },
    { id: 'arcade', name: 'Arcade', nameEn: 'Arcade' },
    { id: 'ur', name: 'Űrbeli ambient', nameEn: 'Space ambient' },
    { id: 'taverna', name: 'Középkori kocsma', nameEn: 'Medieval tavern' }
  ];
  const TRACKS = {
    nyugodt: {
      bpm: 72, steps: 8,
      prog: [[48, 55, 64, 71], [45, 52, 60, 67], [41, 48, 57, 64], [43, 50, 59, 64]],
      step(b, i, ch, dur) {
        if (i === 0) {
          tone(b, midi(ch[0] - 12), dur * 8, { vol: 0.12, attack: 0.05 });
          ch.slice(1).forEach((m) => tone(b, midi(m), dur * 8, { type: 'triangle', vol: 0.025, attack: 0.6 }));
        }
        const pat = [1, 2, 3, 2, 1, 2, 3, 2];
        piano(b, midi(ch[pat[i]] + 12), i % 4 === 0 ? 0.06 : 0.04, 0, dur * 2.2);
      }
    },
    arcade: {
      bpm: 132, steps: 16,
      prog: [[45, 57, 60, 64], [41, 53, 57, 60], [48, 55, 60, 64], [43, 55, 59, 62]],
      step(b, i, ch, dur) {
        if (i % 2 === 0) sq(b, midi(ch[0] - (i % 4 === 0 ? 12 : 0)), dur * 1.6, 0.09, 0);
        sq(b, midi(ch[1 + (i % 3)] + 12), dur * 0.8, 0.035, 0);
        if (i % 2 === 1) hat(b, 0.05, 0);
        if (i % 8 === 0) kick(b, 0.22, 0);
        if (i % 8 === 4) snare(b, 0.08, 0);
      }
    },
    ur: {
      bpm: 50, steps: 8,
      prog: [[38, 50, 57, 64, 69], [34, 46, 53, 60, 65], [36, 48, 55, 62, 67], [33, 45, 52, 60, 64]],
      step(b, i, ch, dur) {
        if (i === 0) ch.forEach((m, k) => tone(b, midi(m), dur * 9, { type: k ? 'sine' : 'sawtooth', vol: k ? 0.03 : 0.05, attack: 1.2, lowpass: 700 }));
        if (Math.random() < 0.4) {
          const pent = [74, 76, 79, 81, 84, 86, 88];
          bell(b, midi(pent[Math.floor(Math.random() * pent.length)]), 0.025, 0, 2.2);
        }
      }
    },
    taverna: {
      bpm: 112, steps: 6,
      prog: [[50, 57, 62, 65], [48, 55, 60, 64], [46, 53, 58, 62], [45, 52, 57, 61]],
      step(b, i, ch, dur) {
        const lute = (m, v) => tone(b, midi(m), dur * 2.4, { type: 'triangle', vol: v, attack: 0.003, lowpass: 2200 });
        if (i === 0) lute(ch[0] - 12, 0.11);
        else lute(ch[[0, 2, 3, 1, 3, 2][i]] + 12, 0.045);
        if (i === 0 || i === 3) noise(b, 0.08, { filter: 'highpass', freq: 6000, vol: 0.06, curve: 2 });
        if (i === 3) lute(ch[0], 0.05);
      }
    }
  };

  let musicGain = null, musicTimer = null, musicNext = 0, musicStep = 0, musicBar = 0, playingMood = null;

  function musicLevel() { return settings.muted ? 0 : settings.master * settings.music.vol * 0.9; }
  function updateMusicGain() {
    if (musicGain && ctx) musicGain.gain.setTargetAtTime(musicLevel(), ctx.currentTime, 0.15);
  }

  function stopMusic() {
    clearInterval(musicTimer);
    musicTimer = null;
    playingMood = null;
    if (musicGain && ctx) {
      const g = musicGain;
      g.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      setTimeout(() => { try { g.disconnect(); } catch (e) { /* már leválasztva */ } }, 1500);
    }
    musicGain = null;
  }

  function startMusic() {
    const mood = settings.music.mood;
    if (mood === playingMood) { updateMusicGain(); return; }
    stopMusic();
    const tr = TRACKS[mood];
    if (!tr) return;
    const a = ac();
    if (!a) return;
    musicGain = a.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(a.destination);
    updateMusicGain();
    playingMood = mood;
    musicNext = a.currentTime + 0.1;
    musicStep = 0;
    musicBar = 0;
    const stepDur = 60 / tr.bpm / (tr.steps === 16 ? 4 : 2);
    musicTimer = setInterval(() => {
      if (!musicGain) return;
      while (musicNext < a.currentTime + 0.25) {
        const bus = { a, out: musicGain, t0: musicNext };
        try { tr.step(bus, musicStep, tr.prog[musicBar % tr.prog.length], stepDur); } catch (e) { /* hang nem elérhető */ }
        musicNext += stepDur;
        musicStep++;
        if (musicStep >= tr.steps) { musicStep = 0; musicBar++; }
      }
    }, 60);
  }

  // a böngésző csak felhasználói kattintás után enged hangot: akkor indítjuk a zenét
  function armMusic() {
    if (settings.music.mood === 'off') return;
    const go = () => { window.removeEventListener('pointerdown', go); window.removeEventListener('keydown', go); startMusic(); };
    if (ctx && ctx.state === 'running') startMusic();
    else { window.addEventListener('pointerdown', go); window.addEventListener('keydown', go); }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (playingMood) { const m = playingMood; stopMusic(); playingMood = null; armMusic._resume = m; } }
    else if (armMusic._resume) { armMusic._resume = null; startMusic(); }
  });

  window.MalomSound = {
    EVENTS,
    STYLES,
    MOODS,
    setMusicMood(id) { settings.music.mood = TRACKS[id] ? id : 'off'; save(); if (settings.music.mood === 'off') stopMusic(); else startMusic(); },
    setMusicVol(v) { settings.music.vol = Math.min(1, Math.max(0, v)); save(); updateMusicGain(); },
    armMusic,
    play(eventId) {
      if (settings.muted) return;
      const e = settings.events[eventId];
      if (!e) return;
      run(eventId, styleFor(eventId), settings.master * e.vol);
    },
    // előnézet a beállításokban (némítva is megszólal, hogy hallható legyen a választás)
    preview(eventId, styleId) {
      const e = settings.events[eventId] || { vol: 1 };
      run(eventId, styleId || styleFor(eventId), Math.max(0.15, settings.master) * Math.max(0.15, e.vol));
    },
    get settings() { return settings; },
    get enabled() { return !settings.muted; },
    setMaster(v) { settings.master = Math.min(1, Math.max(0, v)); save(); updateMusicGain(); },
    setStyle(id) { if (PACKS[id]) { settings.style = id; save(); } },
    setEventVol(ev, v) { if (settings.events[ev]) { settings.events[ev].vol = Math.min(1, Math.max(0, v)); save(); } },
    setEventStyle(ev, id) { if (settings.events[ev]) { settings.events[ev].style = PACKS[id] ? id : null; save(); } },
    setMuted(m) { settings.muted = !!m; save(); updateMusicGain(); },
    toggle() {
      settings.muted = !settings.muted;
      save();
      updateMusicGain();
      if (!settings.muted) this.play('select');
      return !settings.muted;
    },
    reset() { settings = JSON.parse(JSON.stringify(DEFAULTS)); save(); stopMusic(); }
  };
})();
