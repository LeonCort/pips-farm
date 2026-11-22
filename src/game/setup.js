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
  /* situational soundtrack: three looping tracks, one heard at a time.
     Each track has a level x (0..1) that walks toward 1 if it is the wanted track and toward 0 if not, over 1.5 s.
     Gain is sin(x * pi/2), so a crossfade keeps equal loudness; when the wanted track changes mid-fade, every level
     simply turns round from where it is, so nothing is left queued, stuck or doubled up. A track that reaches 0 is stopped. */
  MUSIC: { pastoral: ['audio/pastoral-loop.mp3', 111.70694], coin: ['audio/bouncing-coin.mp3', 150.04], relaxed: ['audio/relaxed-pulse.mp3', 146.74245] },
  FADE: 1.5, musVol: 0.55, musWant: null, mus: {}, pre: false, tracks: null,
  loadTrack(id) {
    const m = this.mus[id] = { st: 'loading', x: 0, buf: null, src: null, g: null, pos: 0, t0: 0, a: 0, len: 0 };
    fetch(this.MUSIC[id][0]).then((r) => { if (!r.ok) throw new Error('no music'); return r.arrayBuffer(); })
      .then((b) => new Promise((ok, bad) => this.ctx.decodeAudioData(b, ok, bad)))
      .then((buf) => {
        /* skip the few silent samples an mp3 encoder puts in front, then loop exactly one cycle of the track */
        const d = buf.getChannelData(0), sr = buf.sampleRate; let i0 = 0; while (i0 < 2048 && Math.abs(d[i0]) < 1e-3) i0++;
        m.a = i0 / sr; m.len = Math.min(this.MUSIC[id][1], buf.duration - m.a); m.buf = buf; m.st = 'ready';
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
  /* called every frame with the track the game wants right now ('pastoral', 'coin' or 'relaxed') */
  musicStep(dt, want) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.musWant = want;
    if (!this.mus[want]) this.loadTrack(want);
    /* once the first tune plays, quietly load the others this island uses, so later switches start straight away */
    if (!this.pre && this.mus[want].st === 'ready') { this.pre = true; setTimeout(() => (this.tracks || []).forEach((id) => { if (!this.mus[id]) this.loadTrack(id); }), 4000); }
    const step = Math.min(dt, 0.25) / this.FADE, now = this.ctx.currentTime;
    for (const id in this.mus) {
      const m = this.mus[id]; if (m.st !== 'ready') continue;
      const on = id === want;
      m.x = Math.max(0, Math.min(1, m.x + (on ? step : -step)));
      if (on && !m.src) this.startTrack(m);
      if (!m.src) continue;
      if (!on && m.x <= 0) { this.stopTrack(m); continue; }
      m.g.gain.setTargetAtTime(this.musVol * Math.sin(m.x * Math.PI / 2), now, 0.03);
    }
  }
};

/* ---------- world ---------- */
const T = window.THREE;
const wrap = $('scene'), canvas = $('gl');
if (!T) { $('nogl').hidden = false; return; }
