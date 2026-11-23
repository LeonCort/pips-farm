/* ---------- sound: the supplied kit ---------- */
const Snd = {
  ctx: null, k: null, base: 0, out: null, until: 0, last: {},
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try { const A = window.AudioContext || window.webkitAudioContext; this.ctx = new A(); this.out = this.ctx.createGain(); this.out.gain.value = state.sound ? 1 : 0; this.out.connect(this.ctx.destination); this.k = window.SOUND.kit(this.ctx, { dest: this.out }); this.base = this.ctx.currentTime; } catch (e) { this.ctx = null; this.k = null; }
  },
  set(on) { if (this.out) this.out.gain.value = on ? 1 : 0; },
  /* recorded animal sounds (made with ElevenLabs, packed into the page), decoded the first time each one plays */
  buf: {}, busy: {},
  animal(name, o) {
    const src = window.PIPS_SFX && window.PIPS_SFX[name]; if (!this.ctx || !src) return; o = o || {};
    const n = performance.now(); if (o.gap && n - (this.last['a:' + name] || 0) < o.gap) return; this.last['a:' + name] = n;
    const go = (b) => { try { const s = this.ctx.createBufferSource(), g = this.ctx.createGain(); s.buffer = b; s.playbackRate.value = o.rate || 1; g.gain.value = o.gain == null ? 0.8 : o.gain; s.connect(g); g.connect(this.out); s.start(this.ctx.currentTime + 0.02 + (o.delay || 0)); } catch (e) {} };
    if (this.buf[name]) { go(this.buf[name]); return; }
    if (this.busy[name]) return; this.busy[name] = true;
    try { const bin = atob(src), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); this.ctx.decodeAudioData(u.buffer, (b) => { this.buf[name] = b; go(b); }, () => {}); } catch (e) {}
  },
  play(name, o, delay, gap) { if (!this.k) return; const n = performance.now(); if (gap && n - (this.last[name] || 0) < gap) return; this.last[name] = n; try { this.k.play(name, this.ctx.currentTime - this.base + 0.02 + (delay || 0), o || {}); } catch (e) {} },
  /* situational soundtrack: looping tracks, one heard at a time.
     Each track has a level x (0..1) that walks toward 1 if it is the wanted track and toward 0 if not, over FADE seconds
     (1.5 s when the place changes, 1.2 s when the radio switches station). Gain is sin(x * pi/2) times the track's own
     volume, so a crossfade keeps equal loudness; when the wanted track changes mid-fade, every level simply turns round
     from where it is, so nothing is left queued, stuck or doubled up. A track that reaches 0 is stopped.
     Tracks load the first time they are wanted (nothing is fetched at startup); while the wanted one is still loading the
     one already playing carries on, so a switch never leaves a gap. A day song that has faded out and is not today's
     song is dropped from memory again (a decoded song is ~50 MB, which matters on an iPad). want = null is silence.
     The track list: file, length of one loop in seconds (made by tools/mkloop.py), volume (1 = as mixed), and the
     name the radio shows. Change vol to balance a quiet track against a full one. */
  MUSIC: {
    pastoral: { url: 'audio/pastoral-loop.mp3', len: 111.70694, vol: 1.0, label: 'Pastoral Loop' },
    whistle: { url: 'audio/pastoral-whistle.mp3', len: 144.01533, vol: 1.0, label: 'Pastoral Whistle' },
    sway: { url: 'audio/island-sway.mp3', len: 186.64778, vol: 1.0, label: 'Island Sway' },
    warm: { url: 'audio/warm-room.mp3', len: 74.78478, vol: 1.0, label: 'Warm Room Ambience' },
    coin: { url: 'audio/bouncing-coin.mp3', len: 150.04, vol: 1.0, label: 'Bouncing Coin' },
    relaxed: { url: 'audio/relaxed-pulse.mp3', len: 146.74245, vol: 1.0, label: 'Relaxed Pulse' }
  },
  DAY: ['pastoral', 'whistle', 'sway', 'warm'], /* the daytime songs the radio plays */
  FADE: 1.5, fade: 1.5, musVol: 0.55, musWant: null, musEff: null, mus: {}, pre: false, tracks: null, keep: null,
  loadTrack(id) {
    const m = this.mus[id] = { st: 'loading', x: 0, buf: null, src: null, g: null, pos: 0, t0: 0, a: 0, len: 0 };
    fetch(this.MUSIC[id].url).then((r) => { if (!r.ok) throw new Error('no music'); return r.arrayBuffer(); })
      .then((b) => new Promise((ok, bad) => this.ctx.decodeAudioData(b, ok, bad)))
      .then((buf) => {
        if (this.mus[id] !== m) return; /* dropped while it loaded */
        /* skip the few silent samples an mp3 encoder puts in front, then loop exactly one cycle of the track */
        const d = buf.getChannelData(0), sr = buf.sampleRate; let i0 = 0; while (i0 < 2048 && Math.abs(d[i0]) < 1e-3) i0++;
        m.a = i0 / sr; m.len = Math.min(this.MUSIC[id].len, buf.duration - m.a); m.buf = buf; m.st = 'ready';
      })
      .catch(() => { m.st = 'failed'; setTimeout(() => { if (this.mus[id] === m) delete this.mus[id]; }, 20000); }); /* try again later, e.g. after being offline */
  },
  startTrack(m) {
    try {
      const src = this.ctx.createBufferSource(), g = this.ctx.createGain(); src.buffer = m.buf; src.loop = true; src.loopStart = m.a; src.loopEnd = m.a + m.len;
      g.gain.value = 0; src.connect(g); g.connect(this.out); src.start(0, m.a + (m.pos % m.len)); m.src = src; m.g = g; m.t0 = this.ctx.currentTime - (m.pos % m.len);
    } catch (e) { m.st = 'failed'; }
  },
  stopTrack(m) {
    m.pos = (this.ctx.currentTime - m.t0) % m.len; /* remember where it was, so coming back carries on from there */
    try { m.src.stop(); m.src.disconnect(); m.g.disconnect(); } catch (e) {}
    m.src = null; m.g = null;
  },
  /* the radio's station switch: a short tuning crackle (0.15 s of filtered noise sweeping down, and a soft click), all
     made here, and a quicker crossfade for this one change */
  tune(f) {
    this.fade = 1.2;
    if (!this.ctx) return;
    try {
      const c = this.ctx, t = c.currentTime + 0.01, n = Math.round(c.sampleRate * 0.15), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) { const q = i / n; d[i] = (Math.random() * 2 - 1) * (q < 0.06 ? q / 0.06 : 1 - (q - 0.06) / 0.94) * (0.6 + 0.4 * Math.sin(i * 0.02)); }
      const s = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); s.buffer = b; bp.type = 'bandpass'; bp.Q.value = 2.5;
      bp.frequency.setValueAtTime(f || 2600, t); bp.frequency.exponentialRampToValueAtTime(700, t + 0.15);
      g.gain.setValueAtTime(0.32, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15); s.connect(bp); bp.connect(g); g.connect(this.out); s.start(t); s.stop(t + 0.16);
      const o = c.createOscillator(), og = c.createGain(); o.type = 'square'; o.frequency.setValueAtTime(1800, t); o.frequency.exponentialRampToValueAtTime(300, t + 0.02);
      og.gain.setValueAtTime(0.12, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.03); o.connect(og); og.connect(this.out); o.start(t); o.stop(t + 0.04);
    } catch (e) {}
  },
  /* called every frame with the track the game wants right now (an id in MUSIC, or null for no music) */
  musicStep(dt, want) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    if (want && !this.MUSIC[want]) want = null;
    this.musWant = want;
    if (want && !this.mus[want]) this.loadTrack(want);
    /* once the first tune plays, quietly load the place tunes this island uses (night/house and market), so those
       switches start straight away; the day songs load only when they are wanted */
    if (!this.pre && want && this.mus[want].st === 'ready') { this.pre = true; setTimeout(() => (this.tracks || []).forEach((id) => { if (!this.mus[id] && !(this.keep && this.DAY.includes(id))) this.loadTrack(id); }), 4000); }
    /* the one heard: the wanted track once it is ready; until then whatever was already playing keeps going */
    const wm = want && this.mus[want];
    if (!want || (wm && wm.st === 'ready')) this.musEff = want;
    else if (wm && wm.st === 'failed') this.musEff = null;
    const eff = this.musEff, step = Math.min(dt, 0.25) / this.fade, now = this.ctx.currentTime; let moving = false;
    for (const id in this.mus) {
      const m = this.mus[id]; if (m.st !== 'ready') continue;
      const on = id === eff;
      m.x = Math.max(0, Math.min(1, m.x + (on ? step : -step)));
      if (on ? m.x < 1 : m.x > 0) moving = true;
      if (on && !m.src) this.startTrack(m);
      if (!m.src) {
        /* with the radio (keep is set), a day song that is silent and not today's: let it go (place tunes stay, they come back often) */
        if (!on && id !== want && this.keep && this.DAY.includes(id) && !this.keep.includes(id)) delete this.mus[id];
        continue;
      }
      if (!on && m.x <= 0) { this.stopTrack(m); continue; }
      m.g.gain.setTargetAtTime(this.musVol * (this.MUSIC[id].vol == null ? 1 : this.MUSIC[id].vol) * Math.sin(m.x * Math.PI / 2), now, 0.03);
    }
    if (!moving && eff === want) this.fade = this.FADE; /* the radio's quick fade is done */
  }
};

/* ---------- world ---------- */
const T = window.THREE;
const wrap = $('scene'), canvas = $('gl');
if (!T) { $('nogl').hidden = false; return; }
