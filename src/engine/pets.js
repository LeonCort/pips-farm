/* ---------- pets: the dog, a kitten, a wolf pup and a bear cub. One follows Pip (picked in the house), the others stroll the town ---------- */
const PET_KINDS = ['dog', 'cat', 'wolf', 'bear'];
/* every pet is built from merged pieces: one mesh for the body, the head, the tail and each leg, so four pets stay cheap */
const icoLo = ico;
/* hi: the second-pass look (rounder shapes, per-vertex fur colours, felt and outline through p2Mesh); ln is the outline width */
function petModel(kind, hi, ln) {
  const ico = hi ? (r, d) => new T.IcosahedronGeometry(r, Math.min(3, d + 1)) : icoLo, HX = [], _pc = new T.Color();
  const g = new T.Group(), body = new T.Group(); g.add(body); sc.add(g);
  const fur = (hex, lo, hi) => (cx, cy, cz, i) => shadeY(hex, cy, lo, hi, i, 0.5);
  const put = (list, geo, paint, x, y, z, o) => { o = o || {}; let q; if (hi) { q = geo; if (!q.attributes.normal) q.computeVertexNormals(); const p = q.attributes.position, a = new Float32Array(p.count * 3); for (let i = 0; i < p.count; i++) { const c = typeof paint === 'function' ? paint(p.getX(i), p.getY(i), p.getZ(i), 0) : _pc.set(paint); a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } q.setAttribute('color', new T.BufferAttribute(a, 3)); q.userData.felt = o.felt != null ? o.felt : 1; } else q = fac(geo, paint); if (o.rx) q.rotateX(o.rx); if (o.rz) q.rotateZ(o.rz); if (o.ry) q.rotateY(o.ry); q.translate(x || 0, y || 0, z || 0); list.push(q); return q; };
  const eye = (list, x, y, z, r) => { if (hi) list = HX; put(list, new T.SphereGeometry(r, 10, 8), '#2a2220', x, y, z, { felt: 0 }); put(list, new T.SphereGeometry(r * 0.36, 6, 4), '#ffffff', x + r * 0.32, y + r * 0.42, z + r * 0.78, { felt: 0 }); };
  const B = [], H = [], TL = [];
  let head, tail, legs, h;
  const leg = (x, y, z, r, len, col, paw) => { const l = new T.Group(); l.position.set(x, y, z); body.add(l); const L = []; const c = hi ? p2Lathe([[0, r * 0.6], [r * 0.8, r * 0.4], [r, -r * 0.4], [r * 0.92, -len * 0.6], [r * 0.86, -len + r * 0.3], [0, -len]], 10, 10).translate(0, len / 2, 0) : new T.CylinderGeometry(r, r * 0.9, len, 8); c.translate(0, -len / 2, 0); put(L, c, col); put(L, ico(r * 1.08, 1, 410).scale(1, 0.62, 1.3), paw, 0, -len, r * 0.35); (hi ? p2Mesh(l, L, ln) : merged(L, MAT, l)).castShadow = false; return l; };
  if (kind === 'cat') {
    /* a ginger tabby kitten: a slim body with stripes, big eyes, pointy ears with pink insides and a long curly tail */
    const C = '#e8923f', D = '#b8632a', L = '#fbe3c0';
    const tabby = (lo, hi, f) => (cx, cy, cz, i) => { const c = shadeY(C, cy, lo, hi, i, 0.45); if (Math.sin(cz * f + cx * 6) > 0.45 && cy > (lo + hi) / 2 - 0.04) c.lerp(new T.Color(D), 0.55); return c; };
    put(B, ico(0.17, 2, 501, 0.01).scale(0.86, 0.8, 1.5), tabby(-0.15, 0.15, 42), 0, 0.31, -0.02);
    put(B, ico(0.12, 2, 502, 0.01).scale(1, 1.05, 0.9), fur(L, -0.12, 0.12), 0, 0.33, 0.16);
    head = new T.Group(); head.position.set(0, 0.5, 0.24); body.add(head);
    put(H, ico(0.15, 2, 503, 0.006).scale(1.1, 0.95, 0.95), (cx, cy, cz, i) => { const c = shadeY(C, cy, -0.14, 0.14, i, 0.45); if (cy > 0.06 && cz > 0 && Math.abs(Math.sin(cx * 55)) > 0.7) c.lerp(new T.Color(D), 0.6); return c; });
    [-1, 1].forEach((s) => {
      put(H, ico(0.05, 1, 504 + s, 0.002).scale(1, 0.8, 0.8), L, s * 0.038, -0.05, 0.12);
      put(H, new T.ConeGeometry(0.06, 0.12, 6), C, s * 0.085, 0.12, -0.01, { rz: -s * 0.3 });
      put(H, new T.ConeGeometry(0.035, 0.07, 6), '#f5a3a8', s * 0.082, 0.11, 0.022, { rz: -s * 0.3 });
      eye(H, s * 0.062, 0.02, 0.122, 0.03);
    });
    put(H, new T.ConeGeometry(0.02, 0.025, 3), '#f08a96', 0, -0.022, 0.148, { rx: Math.PI });
    put(H, new T.TorusGeometry(0.1, 0.018, 6, 16), '#4f86c6', 0, -0.13, -0.03, { rx: Math.PI / 2 + 0.3 });
    put(H, new T.SphereGeometry(0.026, 8, 6), '#f2c14a', 0, -0.18, 0.07);
    tail = new T.Group(); tail.position.set(0, 0.36, -0.24); body.add(tail);
    for (let k = 0; k < 7; k++) { const a = k / 6; put(TL, ico(0.034 - k * 0.002, 1, 510 + k, 0.002), k > 4 ? D : C, 0, 0.02 + a * a * 0.34, -0.04 - Math.sin(a * 1.6) * 0.22); }
    tail.rotation.x = -0.2;
    legs = [[-0.07, 0.13], [0.07, 0.13], [-0.07, -0.16], [0.07, -0.16]].map(([x, z]) => leg(x, 0.25, z, 0.032, 0.22, C, L));
    h = 0.6;
  } else if (kind === 'wolf') {
    /* a fluffy wolf pup: grey back, white chest ruff and mask, tall ears, a bushy tail and a teal bandana */
    const C = '#8f99a6', D = '#5e6875', L = '#eef0f2';
    put(B, ico(0.21, 2, 601, 0.022).scale(1.0, 0.9, 1.5), (cx, cy, cz, i) => shadeY(cy > 0.06 ? D : C, cy, -0.2, 0.2, i, 0.45).lerp(new T.Color(C), cy > 0.06 ? 0.5 : 0), 0, 0.39, -0.02);
    put(B, ico(0.16, 2, 602, 0.02).scale(1.05, 1.1, 0.9), fur(L, -0.15, 0.15), 0, 0.42, 0.2);
    head = new T.Group(); head.position.set(0, 0.65, 0.32); body.add(head);
    put(H, ico(0.165, 2, 603, 0.008).scale(1.05, 0.95, 1), (cx, cy, cz, i) => shadeY(cy < -0.02 || (cz > 0.08 && Math.abs(cx) < 0.05 && cy < 0.08) ? L : cy > 0.07 ? D : C, cy, -0.16, 0.16, i, 0.4));
    put(H, ico(0.085, 2, 604, 0.003).scale(0.82, 0.62, 1.25), L, 0, -0.045, 0.15);
    put(H, ico(0.03, 1, 605, 0.002).scale(1.2, 0.85, 1), '#2a2220', 0, -0.02, 0.255);
    [-1, 1].forEach((s) => {
      put(H, ico(0.07, 1, 606 + s, 0.01).scale(0.9, 0.9, 0.8), L, s * 0.12, -0.07, 0.03);
      put(H, new T.ConeGeometry(0.068, 0.15, 6), C, s * 0.095, 0.15, -0.03, { rz: -s * 0.2 });
      put(H, new T.ConeGeometry(0.04, 0.09, 6), L, s * 0.093, 0.135, 0.0, { rz: -s * 0.2 });
      eye(H, s * 0.068, 0.035, 0.135, 0.027);
    });
    { const q = new T.ConeGeometry(0.12, 0.16, 3); q.rotateX(Math.PI); q.scale(1, 1, 0.35); put(H, q, '#2f9c94', 0, -0.2, 0.07, { rx: -0.35 }); }
    put(H, new T.TorusGeometry(0.135, 0.026, 6, 16), '#2f9c94', 0, -0.13, -0.04, { rx: Math.PI / 2 + 0.25 });
    tail = new T.Group(); tail.position.set(0, 0.45, -0.3); body.add(tail);
    for (let k = 0; k < 4; k++) put(TL, ico(0.075 - k * 0.004, 2, 610 + k, 0.01).scale(0.85, 0.85, 1.35), fur(k > 2 ? L : C, -0.06, 0.06), 0, -k * 0.03, -0.05 - k * 0.085);
    tail.rotation.x = -0.75;
    legs = [[-0.11, 0.18], [0.11, 0.18], [-0.11, -0.22], [0.11, -0.22]].map(([x, z]) => leg(x, 0.3, z, 0.056, 0.27, C, L));
    h = 0.82;
  } else {
    /* a bear cub, like a teddy: round and chunky, honey muzzle, round ears, a stubby tail and a red bow */
    const C = '#9a6a43', L = '#e2c29a';
    put(B, ico(0.24, 2, 701, 0.012).scale(1.05, 0.95, 1.3), fur(C, -0.22, 0.22), 0, 0.42, -0.04);
    put(B, ico(0.17, 2, 702, 0.01).scale(1, 1.1, 0.8), fur(L, -0.16, 0.16), 0, 0.4, 0.14);
    head = new T.Group(); head.position.set(0, 0.7, 0.24); body.add(head);
    put(H, ico(0.19, 2, 703, 0.006).scale(1.05, 1, 0.95), fur(C, -0.18, 0.18));
    put(H, ico(0.095, 2, 704, 0.003).scale(1, 0.75, 0.9), L, 0, -0.055, 0.15);
    put(H, ico(0.036, 1, 705, 0.002).scale(1.3, 0.85, 0.9), '#2a2220', 0, -0.025, 0.235);
    [-1, 1].forEach((s) => {
      put(H, new T.SphereGeometry(0.068, 10, 8).scale(1, 1, 0.55), C, s * 0.13, 0.145, -0.02);
      put(H, new T.SphereGeometry(0.036, 8, 6).scale(1, 1, 0.4), L, s * 0.13, 0.145, 0.012);
      eye(H, s * 0.07, 0.035, 0.16, 0.026);
      put(H, new T.ConeGeometry(0.05, 0.1, 4).rotateZ(s * Math.PI / 2), '#d8423a', s * 0.06, -0.19, 0.1);
    });
    put(H, new T.SphereGeometry(0.032, 8, 6), '#d8423a', 0, -0.19, 0.11);
    tail = new T.Group(); tail.position.set(0, 0.42, -0.34); body.add(tail);
    put(TL, ico(0.06, 1, 710, 0.006), L, 0, 0, -0.02);
    legs = [[-0.12, 0.14], [0.12, 0.14], [-0.12, -0.2], [0.12, -0.2]].map(([x, z]) => leg(x, 0.28, z, 0.07, 0.24, C, L));
    h = 0.9;
  }
  if (hi) { p2Mesh(body, B, ln); p2Mesh(head, H, ln, null, HX); p2Mesh(tail, TL, ln).castShadow = false; } else {
  merged(B, MAT, body); merged(H, MAT, head); merged(TL, MAT, tail).castShadow = false; }
  return { kind, g, body, head, tail, legs, h, chase: false, wanderT: 0, tx: 0, tz: 0, barkT: 12, hop: 0, petT: -99, away: false, asleep: false };
}
dog.kind = 'dog';
const PETS = { dog };
PET_KINDS.slice(1).forEach((k) => { PETS[k] = petModel(k); });
const PET_SPEED = { dog: 1, cat: 1.05, wolf: 1.1, bear: 0.85 };

/* ---------- voices: the dog has a recording; the kitten, the wolf pup and the bear cub are made on the fly ---------- */
function petVoice(kind, gain) {
  if (kind === 'dog') { Snd.animal('dog', { gain: gain || 0.55, gap: 600, rate: 0.96 + Math.random() * 0.08 }); return; }
  const c = Snd.ctx; if (!c || !Snd.out) return;
  const n = performance.now(); if (n - (Snd.last['pet:' + kind] || 0) < 700) return; Snd.last['pet:' + kind] = n;
  gain = (gain || 0.55) * 0.9;
  try {
    const t0 = c.currentTime + 0.02, out = c.createGain(); out.gain.value = 0; out.connect(Snd.out);
    const rr = 0.94 + Math.random() * 0.12;
    if (kind === 'cat') {
      /* mi-aow: a bright buzzy tone through a vowel filter that opens and closes */
      const o = c.createOscillator(), f = c.createBiquadFilter(), f2 = c.createBiquadFilter(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(560 * rr, t0); o.frequency.linearRampToValueAtTime(880 * rr, t0 + 0.14); o.frequency.linearRampToValueAtTime(760 * rr, t0 + 0.34); o.frequency.linearRampToValueAtTime(520 * rr, t0 + 0.6);
      f.type = 'bandpass'; f.Q.value = 5; f.frequency.setValueAtTime(900, t0); f.frequency.linearRampToValueAtTime(1900, t0 + 0.2); f.frequency.linearRampToValueAtTime(1100, t0 + 0.6);
      f2.type = 'lowpass'; f2.frequency.value = 3200;
      o.connect(f); f.connect(f2); f2.connect(out);
      out.gain.setValueAtTime(0, t0); out.gain.linearRampToValueAtTime(gain * 1.6, t0 + 0.05); out.gain.setValueAtTime(gain * 1.6, t0 + 0.38); out.gain.exponentialRampToValueAtTime(0.001, t0 + 0.66);
      o.start(t0); o.stop(t0 + 0.7);
    } else if (kind === 'wolf') {
      /* a small puppy howl: a soft rising awoooo with a little wobble */
      const o = c.createOscillator(), v = c.createOscillator(), vg = c.createGain(), f = c.createBiquadFilter(); o.type = 'triangle';
      o.frequency.setValueAtTime(420 * rr, t0); o.frequency.exponentialRampToValueAtTime(700 * rr, t0 + 0.4); o.frequency.linearRampToValueAtTime(760 * rr, t0 + 0.9); o.frequency.exponentialRampToValueAtTime(480 * rr, t0 + 1.35);
      v.frequency.value = 5.5; vg.gain.value = 14; v.connect(vg); vg.connect(o.frequency);
      f.type = 'lowpass'; f.frequency.value = 1600; o.connect(f); f.connect(out);
      out.gain.setValueAtTime(0, t0); out.gain.linearRampToValueAtTime(gain * 1.2, t0 + 0.22); out.gain.setValueAtTime(gain * 1.1, t0 + 0.95); out.gain.exponentialRampToValueAtTime(0.001, t0 + 1.4);
      o.start(t0); v.start(t0); o.stop(t0 + 1.45); v.stop(t0 + 1.45);
    } else {
      /* a bear cub's happy grumble: hrr-mm, low and soft */
      const o = c.createOscillator(), am = c.createOscillator(), ag = c.createGain(), f = c.createBiquadFilter(), mix = c.createGain(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(150 * rr, t0); o.frequency.linearRampToValueAtTime(190 * rr, t0 + 0.18); o.frequency.linearRampToValueAtTime(120 * rr, t0 + 0.6);
      am.frequency.value = 22; ag.gain.value = 0.45; mix.gain.value = 0.55; am.connect(ag); ag.connect(mix.gain);
      f.type = 'lowpass'; f.Q.value = 3; f.frequency.setValueAtTime(500, t0); f.frequency.linearRampToValueAtTime(900, t0 + 0.2); f.frequency.linearRampToValueAtTime(380, t0 + 0.6);
      o.connect(f); f.connect(mix); mix.connect(out);
      out.gain.setValueAtTime(0, t0); out.gain.linearRampToValueAtTime(gain * 2.4, t0 + 0.06); out.gain.setValueAtTime(gain * 2.2, t0 + 0.4); out.gain.exponentialRampToValueAtTime(0.001, t0 + 0.68);
      o.start(t0); am.start(t0); o.stop(t0 + 0.72); am.stop(t0 + 0.72);
    }
  } catch (e) {}
}

/* ---------- moving: legs, tail, the little hop and looking up at Pip ---------- */
function petAnim(d, moving, sp, dt, look) {
  const run = moving ? (sp > 2 ? 16 : 10) * (d.kind === 'bear' ? 0.8 : 1) : 0, sw = d.kind === 'bear' ? 0.5 : 0.7;
  d.legs.forEach((l, i) => { l.rotation.x = run && !reduced ? Math.sin(time * run + (i === 0 || i === 3 ? 0 : Math.PI)) * sw : 0; });
  const wag = d.kind === 'cat' ? 0.25 : d.kind === 'bear' ? 0.35 : 0.6, wf = d.kind === 'cat' ? 3 : moving ? 18 : 10;
  d.tail.rotation.y = reduced || d.asleep ? 0 : Math.sin(time * wf) * wag;
  if (d.hop > 0) d.hop = Math.max(0, d.hop - dt * 3);
  d.body.position.y = Math.sin(d.hop * Math.PI) * 0.18 + (run && !reduced ? Math.abs(Math.sin(time * run)) * 0.04 : 0);
  let hy = 0, hx = d.asleep ? 0.35 : 0, hz = 0;
  if (look && !moving && !d.asleep) { const p = d.g.position, want = Math.atan2(look.x - p.x, look.z - p.z); let df = want - d.g.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); hy = clamp(df, -0.9, 0.9); hx = Math.hypot(look.x - p.x, look.z - p.z) < 2.2 ? -0.38 : -0.1; hz = reduced ? 0 : Math.sin(time * 1.3 + p.x) * 0.12; }
  else if (!moving && !d.asleep && !reduced) { hy = Math.sin(time * 0.5 + d.g.position.z) * 0.6; hz = Math.sin(time * 0.9) * 0.08; }
  d.head.rotation.y += (hy - d.head.rotation.y) * Math.min(1, dt * 6); d.head.rotation.x += (hx - d.head.rotation.x) * Math.min(1, dt * 6); d.head.rotation.z += (hz - d.head.rotation.z) * Math.min(1, dt * 4);
}

/* ---------- inside the house the chosen pet walks Pip's own footsteps, so it never cuts through a wall ---------- */
const PTRAIL = [];
function petTrailGoal(back) {
  const pp = pip.position, last = PTRAIL[PTRAIL.length - 1];
  if (!last || Math.hypot(pp.x - last[0], pp.z - last[1]) > 0.12) { PTRAIL.push([pp.x, pp.z]); if (PTRAIL.length > 60) PTRAIL.shift(); }
  let left = back, px = pp.x, pz = pp.z;
  for (let i = PTRAIL.length - 1; i >= 0; i--) { const [x, z] = PTRAIL[i], s = Math.hypot(x - px, z - pz); if (s >= left) { const f = left / s; return [px + (x - px) * f, pz + (z - pz) * f]; } left -= s; px = x; pz = z; }
  return [px, pz];
}

/* ---------- the pets that are not chosen stroll the town roads, stop to sniff, and come say hello ---------- */
const WANDER = [];
function wanderPick(w) {
  const p = w.d.g.position; let k = 0, x, z;
  do { const n = RG.n[Math.floor(Math.random() * RG.n.length)]; x = n[0]; z = n[1]; k++; } while (k < 20 && (Math.hypot(x - p.x, z - p.z) > 14 || Math.hypot(x - p.x, z - p.z) < 3 || z > 11.5));
  w.path = roadPath(p.x, p.z, x, z); w.i = 0;
  /* the island: streets on land that is still under the sea are not there yet */
  if (ISL.roadOk && w.path) { const bad = w.path.findIndex((q) => !ISL.roadOk(q[0], q[1])); if (bad >= 0) w.path.length = bad; if (!w.path.length) { w.path = null; w.wait = 1.5; } }
  /* and a stroller never cuts across water from one street to the next (a cove, a pond, the sea between two islands) */
  if (ISL.petLine && w.path) { let x = p.x, z = p.z; const bad = w.path.findIndex((q) => { const ok = ISL.petLine(x, z, q[0], q[1]); x = q[0]; z = q[1]; return !ok; }); if (bad >= 0) w.path.length = bad; if (!w.path.length) { w.path = null; w.wait = 1.5; } }
}
function wanderStep(w, dt) {
  const d = w.d, p = d.g.position, pp = pip.position, near = !inHouse && !trip && Math.hypot(pp.x - p.x, pp.z - p.z) < 2.4;
  let moving = false, sp = 0.95 * PET_SPEED[d.kind];
  if (isNight) { w.path = null; }
  else if (near) { if (!w.hi) { w.hi = true; d.hop = 1; petVoice(d.kind, 0.35); } }
  else if (w.path) {
    const q = w.path[w.i]; if (!q) w.path = null;
    else if (walkTo(d.g, q[0], q[1], dt, sp) | (ISL.petLand ? (ISL.petLand(p), 0) : 0)) { w.i++; if (w.i >= w.path.length) { w.path = null; w.wait = 2.5 + Math.random() * 5; } }
    else moving = true;
  } else { w.wait -= dt; if (w.wait <= 0) wanderPick(w); }
  if (ISL.petLand) ISL.petLand(p); /* standing still too: never left out over the water */
  if (!near && Math.hypot(pp.x - p.x, pp.z - p.z) > 3.2) w.hi = false;
  d.asleep = isNight && !moving;
  petAnim(d, moving, sp, dt, near ? pp : null);
  zzz(d, d.asleep, dt);
  w.blob.position.set(p.x, 0.05, p.z); w.blob.rotation.y = d.g.rotation.y;
}
function wanderStart(d, x, z) {
  d.chase = false; d.g.visible = true; if (x != null) d.g.position.set(x, 0, z);
  let w = WANDER.find((q) => q.d === d);
  if (!w) { const b = new T.Mesh(blobGeo, blobMat); b.renderOrder = 1; sc.add(b); w = { d, blob: b }; WANDER.push(w); }
  w.blob.visible = true; w.path = null; w.wait = 0.6 + Math.random(); w.hi = false; w.on = true;
  const s = { cat: [0.42, 0.65], wolf: [0.55, 0.85], bear: [0.62, 0.85], dog: [0.5, 0.75] }[d.kind]; w.blob.scale.set(s[0], 1, s[1]);
}
function wanderStop(d) { const w = WANDER.find((q) => q.d === d); if (w) { w.on = false; w.blob.visible = false; } if (d.zs) d.zs.visible = false; }

/* ---------- choosing ---------- */
function setPet(kind, quiet) {
  /* 'none': no pet follows Pip; the last friend goes out to stroll the town with the others (dog keeps pointing at it) */
  if (kind !== 'none' && !PETS[kind]) kind = 'dog';
  const wasNone = state.pet === 'none', old = dog, nu = kind === 'none' ? old : PETS[kind];
  if (kind === 'none') {
    if (!wasNone && old) { const out = inHouse ? [HDOOR.x + 1.2, HDOOR.z + 1.4] : [old.g.position.x, old.g.position.z]; wanderStart(old, out[0], out[1]); old.hop = 1; }
    state.pet = 'none'; PTRAIL.length = 0;
    if (!quiet) { Snd.play('pop', { gain: 0.4, f: 420 }); save(); }
    return;
  }
  if (old !== nu || wasNone) {
    wanderStop(nu);
    /* the old friend goes out for a walk round the town; the new one pops up beside Pip */
    if (old && old !== nu && !wasNone) { const out = inHouse ? [HDOOR.x + 1.2, HDOOR.z + 1.4] : [old.g.position.x, old.g.position.z]; wanderStart(old, out[0], out[1]); old.hop = 1; }
    dog = nu; nu.chase = false; nu.asleep = false; nu.inH = inHouse && !inBarn && !inStore;
    if (!quiet) { const a = pip.rotation.y, x = pip.position.x + Math.sin(a) * 0.8 + Math.cos(a) * 0.5, z = pip.position.z + Math.cos(a) * 0.8 - Math.sin(a) * 0.5; nu.g.position.set(x, 0, z); nu.g.rotation.y = a + Math.PI; burst(x, 0.7, z, 6); PTRAIL.length = 0; PTRAIL.push([x, z]); }
  }
  state.pet = kind;
  if (!quiet) { dog.hop = 1; petVoice(kind, 0.7); Snd.play('sparkle', { gain: 0.4 }, 0.05); save(); }
}
const petNone = () => state.pet === 'none';
function petsInit() {
  const none = state.pet === 'none', k = PET_KINDS.indexOf(state.pet) >= 0 ? state.pet : 'dog';
  /* everyone starts as a town stroller, spread round the ring road; then the chosen one comes home */
  PET_KINDS.forEach((q, i) => { const a = 0.7 + i * 1.57; if (PETS[q] !== dog) wanderStart(PETS[q], Math.cos(a) * RING.rx, Math.sin(a) * RING.rz); });
  if (none) { wanderStart(dog, Math.cos(0.7) * RING.rx, Math.sin(0.7) * RING.rz); state.pet = 'none'; return; }
  if (k !== 'dog') { const d = PETS[k]; wanderStop(d); wanderStart(dog, Math.cos(0.7) * RING.rx, Math.sin(0.7) * RING.rz); dog = d; d.g.position.set(KENNEL.x - 0.6, 0, KENNEL.z + 0.9); }
  state.pet = k;
}
function petsStep(dt) { WANDER.forEach((w) => { if (w.on) wanderStep(w, dt); }); petCornerStep(dt); }
/* pet any pet you are standing next to */
function nearPet() { let best = null, bd = 1.3; PET_KINDS.forEach((k) => { const d = PETS[k]; if (d.asleep || (d === dog && d.chase)) return; const r = Math.hypot(d.g.position.x - pip.position.x, d.g.position.z - pip.position.z); if (r < bd) { bd = r; best = d; } }); return best; }
function petPet(d) {
  const p = d.g.position; d.hop = 1; burst(p.x, d.h + 0.1, p.z, 5); petVoice(d.kind, 0.7); Snd.play('sparkle', { gain: 0.35 }, 0, 150);
  if (time - d.petT > 8) { d.petT = time; earn(1); coinToHud(p.x, 0.8, p.z, 1); }
}

/* ---------- the pet corner in the house hall: a cushion bed, two bowls, a paw sign, and a paw mat that opens the picker ---------- */
const PCORNER = { x: HO.x - 0.42, z: HO.z + 0.95, bx: HO.x + 0.52, bz: HO.z + 0.95 };
const petMat = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = 'rgba(255,246,228,0.95)'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill();
  x.strokeStyle = PAL.ochre; x.lineWidth = 10; x.setLineDash([18, 12]); x.beginPath(); x.arc(128, 128, 108, 0, 7); x.stroke(); x.setLineDash([]);
  drawIcon(x, 'paw', 128, 134, 2.3);
  const m = new T.Mesh(new T.CircleGeometry(0.48, 32), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), transparent: true })); m.rotation.x = -Math.PI / 2; m.position.set(PCORNER.x, 0.085, PCORNER.z); sc.add(m); return m;
})();
{
  const PC = [], Q = at(PCORNER.bx, PCORNER.bz, 0, PC);
  /* a round cushion bed with a soft rim */
  Q(new T.CylinderGeometry(0.34, 0.36, 0.08, 18), '#c45a3a', 1301, 0, 0.11, 0);
  Q(new T.TorusGeometry(0.3, 0.075, 8, 20).rotateX(Math.PI / 2), '#e9884a', 1302, 0, 0.17, 0);
  Q(new T.CylinderGeometry(0.27, 0.27, 0.03, 16), '#f3e3c4', 1303, 0, 0.16, 0);
  /* bowls: water and food */
  Q(new T.CylinderGeometry(0.1, 0.08, 0.07, 12), '#5a7fb0', 1304, -0.1, 0.105, 0.5); Q(new T.CylinderGeometry(0.08, 0.08, 0.01, 12), '#8fc0d4', 1305, -0.1, 0.14, 0.5);
  Q(new T.CylinderGeometry(0.1, 0.08, 0.07, 12), '#e6b45a', 1306, 0.15, 0.105, 0.52); Q(new T.SphereGeometry(0.075, 8, 4, 0, 6.283, 0, 1.2), '#9a6542', 1307, 0.15, 0.13, 0.52);
  /* a bone toy and a ball of yarn */
  Q(new T.CylinderGeometry(0.022, 0.022, 0.18, 6).rotateZ(Math.PI / 2), '#fff6e4', 1308, 0.05, 0.09, -0.48); [-1, 1].forEach((s) => [-1, 1].forEach((t) => Q(new T.SphereGeometry(0.03, 6, 4), '#fff6e4', 1309, 0.05 + s * 0.095, 0.09, -0.48 + t * 0.022)));
  Q(new T.SphereGeometry(0.07, 8, 6), '#e9684a', 1310, -0.25, 0.14, -0.4);
  PCORNER.mesh = merged(PC, MAT);
}
const petSign = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 200; const x = c.getContext('2d');
  x.fillStyle = PAL.paper; x.strokeStyle = PAL.ink; x.lineWidth = 6; x.beginPath(); x.roundRect ? x.roundRect(8, 8, 240, 184, 28) : x.rect(8, 8, 240, 184); x.fill(); x.stroke();
  [['dog', 70, 70], ['cat', 186, 70], ['wolf', 70, 140], ['bear', 186, 140]].forEach(([k, a, b]) => drawIcon(x, k, a, b, 0.95));
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthTest: false })); sp.renderOrder = 4; sp.scale.set(1.0, 0.78, 1); sp.position.set(PCORNER.x, 1.45, PCORNER.z - 0.15); sc.add(sp); return sp;
})();
let petLatch = false;
function petCornerStep(dt) {
  petMat.visible = petSign.visible = inHouse && !inBarn && !inStore;
  if (!inHouse || inBarn || inStore) { if (PP.open) petPickClose(); return; }
  petSign.position.y = 1.45 + (reduced ? 0 : Math.sin(time * 2) * 0.05);
  const on = Math.hypot(pip.position.x - PCORNER.x, pip.position.z - PCORNER.z) < 0.5, still = Math.hypot(target.x - pip.position.x, target.z - pip.position.z) < 0.15;
  petMat.scale.setScalar(on ? 1.1 : 1 + (reduced ? 0 : Math.sin(time * 3) * 0.04));
  if (on && still && !petLatch && !dressing && !PP.open) { petLatch = true; petPickOpen(); }
  if (!on) { petLatch = false; if (PP.open) petPickClose(); }
}

/* ---------- the picker: four big pictures, no words. Tap one, it comes to Pip; the green tick closes ---------- */
const PP = { open: false, el: null };
function petPickBuild() {
  const el = document.createElement('div'); el.className = 'petPick'; el.id = 'petPick'; el.hidden = true;
  el.innerHTML = '<div class="ppPanel" role="dialog" aria-label="Välj ditt husdjur"><div class="ppPage"><div class="ppRow"></div></div><button type="button" class="ppDone" aria-label="Klar"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 25 L20 35 L38 13" fill="none" stroke="#fff6e4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>';
  document.body.appendChild(el); PP.el = el;
  const row = el.querySelector('.ppRow'), SV = { dog: 'Hund', cat: 'Katt', wolf: 'Varg', bear: 'Björn' };
  PET_KINDS.forEach((k) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'ppPet'; b.dataset.k = k; b.setAttribute('aria-label', SV[k]);
    const c = document.createElement('canvas'); c.width = c.height = 160; drawIcon(c.getContext('2d'), k, 80, 82, 1.9); const img = new Image(); img.alt = ''; img.src = c.toDataURL(); b.appendChild(img);
    b.addEventListener('click', (e) => { e.stopPropagation(); Snd.init(); setPet(k); petPickSync(); b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing'); });
    row.appendChild(b);
  });
  {
    /* no pet: the paw, faded, under a red "no" ring, so a child who can't read sees "nobody follows" */
    const b = document.createElement('button'); b.type = 'button'; b.className = 'ppPet ppNone'; b.dataset.k = 'none'; b.setAttribute('aria-label', 'Inget husdjur');
    const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d');
    x.globalAlpha = 0.55; drawIcon(x, 'paw', 80, 84, 2.0); x.globalAlpha = 1;
    x.strokeStyle = '#d9443a'; x.lineWidth = 13; x.lineCap = 'round'; x.beginPath(); x.arc(80, 80, 60, 0, 7); x.stroke();
    x.beginPath(); x.moveTo(80 - 42, 80 - 42); x.lineTo(80 + 42, 80 + 42); x.stroke();
    const img = new Image(); img.alt = ''; img.src = c.toDataURL(); b.appendChild(img);
    b.addEventListener('click', (e) => { e.stopPropagation(); Snd.init(); setPet('none'); petPickSync(); b.classList.remove('boing'); void b.offsetWidth; b.classList.add('boing'); });
    row.appendChild(b);
  }
  el.querySelector('.ppDone').addEventListener('click', (e) => { e.stopPropagation(); petPickClose(); });
  el.querySelector('.ppPanel').addEventListener('pointerdown', (e) => { e.stopPropagation(); });
  const st = document.createElement('style'); st.textContent = `
.petPick { position: fixed; inset: 0; z-index: 25; pointer-events: none; display: flex; align-items: flex-end; justify-content: center; padding-bottom: max(14px, env(safe-area-inset-bottom, 0px)); background: linear-gradient(rgba(28,19,14,0) 40%, rgba(28,19,14,0.35)); }
.petPick[hidden] { display: none; }
.ppPanel { pointer-events: auto; display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 26px; max-width: calc(100% - 20px); box-sizing: border-box;
  background: repeating-linear-gradient(93deg, rgba(255,220,170,0.07) 0 3px, rgba(0,0,0,0.05) 3px 7px, rgba(0,0,0,0) 7px 15px), linear-gradient(170deg, #9a6a42, #6e4426 60%, #7d5232);
  box-shadow: inset 0 2px 0 rgba(255,220,170,0.35), inset 0 -3px 0 rgba(0,0,0,0.25), 0 0 0 3px #3a2416, 0 10px 0 3px rgba(20,12,6,0.45), 0 18px 34px rgba(0,0,0,0.45); animation: ppIn 0.38s cubic-bezier(.2,1.3,.5,1); }
@keyframes ppIn { from { transform: translateY(50px); opacity: 0; } }
.ppPage { position: relative; border-radius: 16px; border: 3px solid #3a2416; padding: 16px 18px; background: radial-gradient(circle at 30% 20%, #fffaf0, #f6e8c9 60%, #ecd8ae); box-shadow: inset 0 0 22px rgba(140,95,45,0.25); }
.ppPage::before { content: ''; position: absolute; inset: 6px; border: 2.5px dashed rgba(122,82,46,0.55); border-radius: 11px; pointer-events: none; }
.ppRow { display: flex; gap: 20px; }
.ppPet { position: relative; width: 112px; height: 112px; padding: 6px; border-radius: 50%; border: 4px solid #6e4426; background: radial-gradient(circle at 40% 35%, #fffdf6, #f2e3c4); box-shadow: 0 4px 0 rgba(80,50,25,0.3); transition: transform 0.12s; }
.ppPet img { width: 100%; height: 100%; display: block; pointer-events: none; }
.ppPet.on { transform: scale(1.1); border-color: #3f7d3a; background: radial-gradient(circle at 40% 35%, #ffffff, #e8f3d6); box-shadow: 0 0 0 3px #fffaf0, 0 5px 0 3px rgba(80,50,25,0.25); }
.ppPet.on::before { content: ''; position: absolute; inset: -13px; border-radius: 50%; background: repeating-conic-gradient(#e0bd82 0 9deg, #a8743f 9deg 15deg, #c99a5e 15deg 20deg);
  -webkit-mask: radial-gradient(circle, transparent 0 calc(50% - 9px), #000 calc(50% - 8px) calc(50% - 1px), transparent 50%); mask: radial-gradient(circle, transparent 0 calc(50% - 9px), #000 calc(50% - 8px) calc(50% - 1px), transparent 50%); pointer-events: none; }
.ppPet.on::after { content: ''; position: absolute; right: -8px; bottom: -6px; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #fffaf0;
  background: #3f8f46 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 12.5 L10.5 17 L18 8' fill='none' stroke='%23fff' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/100% no-repeat; box-shadow: 0 2px 0 rgba(0,0,0,0.25); }
.ppPet:active { transform: scale(0.92); }
.ppPet.boing { animation: ppBoing 0.45s cubic-bezier(.2,1.6,.5,1); }
@keyframes ppBoing { 0% { transform: scale(0.85); } 100% { transform: scale(1.1); } }
.ppDone { flex: none; width: 84px; height: 84px; border-radius: 22px; border: 3px solid #1f4d27; padding: 10px;
  background: repeating-linear-gradient(95deg, rgba(255,255,255,0.06) 0 4px, rgba(0,0,0,0) 4px 11px), linear-gradient(#6cc46a, #3f9a4a 55%, #2f7d3a);
  box-shadow: inset 0 3px 0 rgba(255,255,255,0.35), 0 6px 0 #1f4d27, 0 9px 12px rgba(0,0,0,0.35); }
.ppDone svg { width: 100%; height: 100%; display: block; filter: drop-shadow(0 2px 0 rgba(20,60,25,0.6)); }
.ppDone:active { transform: translateY(5px); box-shadow: inset 0 3px 0 rgba(255,255,255,0.35), 0 1px 0 #1f4d27; }
@media (max-width: 700px) { .ppRow { gap: 12px; } .ppPet { width: 84px; height: 84px; } .ppPanel { gap: 10px; padding: 10px; } .ppPage { padding: 12px; } .ppDone { width: 64px; height: 64px; } }
@media (max-width: 470px) { .ppPanel { flex-direction: column; } .ppRow { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px 22px; } .ppPet { width: 96px; height: 96px; } }
@media (max-height: 460px) { .ppPet { width: 76px; height: 76px; } .ppPage { padding: 10px 12px; } }
@media (prefers-reduced-motion: reduce) { .ppPanel, .ppPet.boing { animation: none; } }
`; document.head.appendChild(st);
}
function petPickSync() { if (!PP.el) return; PP.el.querySelectorAll('.ppPet').forEach((b) => { const on = b.dataset.k === state.pet; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); }
function petPickOpen() { if (!PP.el) petPickBuild(); PP.open = true; target.copy(pip.position); PP.el.hidden = false; petPickSync(); Snd.play('pop', { gain: 0.4, f: 760 }); }
function petPickClose() { if (!PP.open) return; PP.open = false; PP.el.hidden = true; Snd.play('pop', { gain: 0.35, f: 560 }); }
if (window.__farmTest) window.__pets = { ev: (s) => eval(s), set: (k) => setPet(k), open: () => petPickOpen(), pos: () => PET_KINDS.map((k) => [k, +PETS[k].g.position.x.toFixed(2), +PETS[k].g.position.z.toFixed(2), PETS[k] === dog]) };

/* second-pass look for the kitten, the wolf pup and the bear cub: the same designs rebuilt rounder with felt and outline.
   The new meshes move into the existing rig groups (the old ones stay, hidden), so walking, following and sleeping are untouched. */
const PET2 = { old: {}, cur: [] };
PET_KINDS.slice(1).forEach((k) => { const d = PETS[k]; PET2.old[k] = []; [d.body, d.head, d.tail].concat(d.legs).forEach((gr) => gr.children.forEach((c) => { if (c.isMesh) PET2.old[k].push(c); })); });
function pet2Build() {
  const look = P2_LOOKS[PIP2.v], on = !!look;
  PET2.cur.forEach((m) => { if (m.parent) m.parent.remove(m); m.traverse((o) => { if (o.isMesh && o.geometry) o.geometry.dispose(); }); }); PET2.cur = [];
  PET_KINDS.slice(1).forEach((k) => { const d = PETS[k]; PET2.old[k].forEach((m) => { m.visible = !on; }); if (!on) return;
    PIP2.skin = null; PIP2.fd = 1; const n = petModel(k, true, look.line * 0.8); sc.remove(n.g);
    [[n.body, d.body], [n.head, d.head], [n.tail, d.tail]].concat(n.legs.map((l, i) => [l, d.legs[i]])).forEach(([from, to]) => { from.children.filter((c) => c.isMesh).forEach((m) => { to.add(m); PET2.cur.push(m); }); }); });
  try { if (ED.dog && ED.dogKind !== 'dog') { ED.sc.remove(ED.dog.g); ED.dog = null; ED.dogKind = null; if (ED.on) edPetClone(); } } catch (e) {}
}
{ const s1 = pip2Set; pip2Set = function (v) { s1(v); pet2Build(); }; }
pet2Build();
if (window.__farmTest && window.__p2) window.__p2.pshot = (k, ang, dist) => { const d = PETS[k], c = new T.PerspectiveCamera(30, 1, 0.1, 100), p = d.g.position; c.position.set(p.x + Math.sin(ang) * dist, 0.9, p.z + Math.cos(ang) * dist); c.lookAt(p.x, 0.42, p.z); const r0 = d.g.rotation.y; d.g.rotation.y = 0; d.g.updateMatrixWorld(true); const s = renderer.getSize(new T.Vector2()); c.aspect = s.x / s.y; c.updateProjectionMatrix(); renderer.render(sc, c); const u = canvas.toDataURL('image/png'); d.g.rotation.y = r0; return u; };
