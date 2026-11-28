/* ---------- the Marsh's craft: the frog choir (Leon 2026-11-28: each island gets a new fun way of gathering, played a lot
   on its own island and now and then later, so the time there is play and not grinding) ----------
   Reeds are the Marsh's own material. Every Marsh square Pip owns has a ring of frogs on stones round a big lily stone.
   When Pip steps on the lily stone, the frogs sing a little tune: one after another each lights up, hops and croaks its
   own note. Pip walks to the frogs in the same order. A wrong frog just shakes its head and the tune plays again (never a
   fail). When the whole tune is right, the frogs leap into the water and a thick bundle of reeds stands where they sat
   (four reeds). The tune is three notes on the first square of the day, one note longer on each next square.
   Saved: state.isle.frogs = { day, done: { area id: 1 } }. A reed bundle is not saved. */
const FS = { choir: {}, play: null };
const FROG_ISLE = (A) => A && !A.secret && A.id[0] === 'r';
const frogS = () => state.isle.frogs || (state.isle.frogs = { day: -1, done: {} });
const FROG_R = 1.7; /* how far the frogs sit from the lily stone */
const FROG_NOTE = ['C5', 'E5', 'G5', 'A5', 'C6'], FROG_COL = ['#7cc56a', '#e6c44a', '#6fb3e0', '#e07aa8', '#b08ae0'];
function frogFree(A, x, z, r, w) { const B = areaAt(x, z);
  if ((A ? B !== A : !B || !HAS[B.id]) || walkSdf(x, z) > (w || -0.9) || campNear(x, z, 1.5)) return false; /* the frogs may sit on any owned ground next door */
  return !nodes.some((n) => n.st !== "gone" && Math.hypot(n.x - x, n.z - z) < r + (n.kind === "tree" ? 1.3 : 0)); /* not under a tree crown, so the frogs are easy to see */
}
/* the choir's place: a lily stone with room for four frogs round it */
function frogSpot(A) {
  for (let k = 0; k < 160; k++) {
    const x = A.cx + (hash(k, 8000 + A.i * 13 + A.j) - 0.5) * 8, z = A.cz + (hash(k, 8001 + A.i * 7 - A.j) - 0.5) * 7;
    if (!frogFree(A, x, z, 1.0)) continue;
    for (let r = 0; r < 6; r++) { const rot = r / 6 * 1.57;
      if ([0, 1, 2, 3].every((q) => { const a = q / 4 * 6.28 + rot; return frogFree(null, x + Math.cos(a) * FROG_R, z + Math.sin(a) * FROG_R, 0.6, -0.4); })) return [x, z, rot]; }
  }
  return null;
}
function frogModel(col) {
  const g = new T.Group(), L = []; let q = new T.SphereGeometry(0.2, 10, 8); q.scale(1, 0.72, 1.15); q.translate(0, 0.16, 0); L.push(fac(q, () => new T.Color(col), 8010));
  [-1, 1].forEach((s) => { q = new T.SphereGeometry(0.07, 8, 6); q.translate(s * 0.09, 0.3, 0.12); L.push(fac(q, () => new T.Color('#ffffff'), 8011 + s));
    q = new T.SphereGeometry(0.035, 6, 5); q.translate(s * 0.095, 0.31, 0.175); L.push(fac(q, () => new T.Color('#22303c'), 8013 + s));
    q = new T.SphereGeometry(0.06, 6, 5); q.scale(1.4, 0.5, 1.2); q.translate(s * 0.17, 0.04, 0.12); L.push(fac(q, () => new T.Color(col).multiplyScalar(0.8), 8015 + s)); });
  q = new T.SphereGeometry(0.1, 8, 6); q.scale(1.3, 0.35, 0.6); q.translate(0, 0.13, 0.2); L.push(fac(q, () => new T.Color('#f3e7b5'), 8017)); /* the throat that puffs */
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g); return g;
}
function frogStoneGeo(r) { const q = new T.CylinderGeometry(r, r * 1.1, 0.16, 9); q.translate(0, 0.08, 0); return q; }
function frogMake(A) {
  const at = frogSpot(A); if (!at) return null; const g = new T.Group(); g.position.set(at[0], 0, at[1]); sc.add(g);
  const L = []; let q = frogStoneGeo(0.62); L.push(fac(q, () => new T.Color('#9aa79a'), 8020));
  q = new T.CircleGeometry(0.5, 14); q.rotateX(-Math.PI / 2); q.translate(0, 0.17, 0); L.push(fac(q, () => new T.Color('#4f9a52'), 8021)); /* the big lily leaf on top */
  const frogs = [];
  for (let k = 0; k < 4; k++) { const a = k / 4 * 6.28 + at[2], x = Math.cos(a) * FROG_R, z = Math.sin(a) * FROG_R;
    q = frogStoneGeo(0.32); q.translate(x, 0, z); L.push(fac(q, () => new T.Color('#8b968b'), 8022 + k));
    const f = frogModel(FROG_COL[k]); f.position.set(x, 0.16, z); f.rotation.y = Math.atan2(-x, -z); g.add(f); frogs.push({ g: f, x: at[0] + x, z: at[1] + z, lit: 0, hop: 0, no: 0 }); }
  merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g); lookFoot(at[0], at[1], 0.7, 0.7);
  return { id: A.id, x: at[0], z: at[1], g, frogs };
}
/* a frog sings: it hops, its throat puffs, its note plays */
function frogSing(f, k) { f.lit = 1; f.hop = 1; Snd.play('ding', { gain: 0.32, f: FROG_NOTE[k] }); Snd.play('pop', { gain: 0.15, f: 260 + k * 60 }); }
function frogStep(dt) {
  if (!state.isle || inCave) return; const S = frogS(), day = Math.floor(state.clock / DAY), pp = pip.position;
  if (S.day !== day) { S.day = day; S.done = {}; Object.values(FS.choir).forEach((C) => { if (C && C.gone) { C.gone = 0; C.frogs.forEach((f) => { f.g.visible = true; f.g.position.y = 0.16; }); } }); }
  AREAS.forEach((A) => { if (FROG_ISLE(A) && HAS[A.id] && FS.choir[A.id] === undefined) FS.choir[A.id] = frogMake(A); });
  /* the frogs themselves: hop and glow back down, a gone frog stays under */
  Object.values(FS.choir).forEach((C) => { if (!C) return; C.frogs.forEach((f) => {
    if (C.gone || S.done[C.id]) { f.g.visible = false; return; } f.g.visible = true;
    f.hop = Math.max(0, f.hop - dt * 3); f.lit = Math.max(0, f.lit - dt * 1.6); f.no = Math.max(0, f.no - dt * 2.5);
    f.g.position.y = 0.16 + Math.sin(f.hop * Math.PI) * 0.35; f.g.scale.set(1 + f.lit * 0.25, 1 + f.lit * 0.1, 1 + f.lit * 0.25); f.g.rotation.z = Math.sin(f.no * 20) * 0.35 * f.no; }); });
  /* stepping on a lily stone starts that choir's tune */
  if (!FS.play && !enSleep) Object.values(FS.choir).forEach((C) => {
    if (!C || FS.play || S.done[C.id] || Math.hypot(pp.x - C.x, pp.z - C.z) > 0.7) return;
    const len = Math.min(5, 3 + Object.keys(S.done).length), tune = [];
    for (let k = 0; k < len; k++) { let v = Math.floor(hash(k + day * 11, 8030 + C.id.charCodeAt(1)) * 4) % 4; if (v === tune[k - 1]) v = (v + 1) % 4; tune.push(v); } /* never the same frog twice in a row */
    FS.play = { C, tune, st: 'sing', k: 0, t: -0.4, at: 0, on: false }; Snd.play('blip', { gain: 0.25, f: 520 });
  });
  const P = FS.play; if (!P) return; const C = P.C;
  if (P.st === 'sing') { /* the frogs sing the tune once, a note every 0.55 s */
    P.t += dt; if (P.t >= 0) { if (P.k < P.tune.length) { frogSing(C.frogs[P.tune[P.k]], P.tune[P.k]); P.k++; P.t = -0.55; } else { P.st = 'copy'; P.at = 0; P.on = -1; } }
  } else if (P.st === 'copy') { /* Pip walks to the frogs in the same order */
    let near = -1; C.frogs.forEach((f, k) => { if (Math.hypot(pp.x - f.x, pp.z - f.z) < 0.85) near = k; });
    if (near >= 0 && near !== P.on) {
      if (near === P.tune[P.at]) { frogSing(C.frogs[near], near); P.at++; if (P.at >= P.tune.length) { P.st = 'won'; P.t = 0; } }
      else { C.frogs[near].no = 1; Snd.play('blip', { gain: 0.2, f: 220 }); P.st = 'sing'; P.k = 0; P.t = -1.2; P.at = 0; } /* not that one: listen again */
    }
    P.on = near;
    if (Math.hypot(pp.x - C.x, pp.z - C.z) > 7) FS.play = null; /* Pip walked away: the tune starts over next time */
  } else if (P.st === 'won') { /* all the frogs sing together, leap into the water, and the reeds stand there */
    P.t += dt;
    if (P.t < 0.05) { C.frogs.forEach((f, k) => frogSing(f, k)); Snd.play('success', { gain: 0.4 }); }
    if (P.t > 0.9) {
      S.done[C.id] = 1; save(); C.frogs.forEach((f) => burst(f.x, 0.4, f.z, 4));
      const a = Math.atan2(pp.z - C.z, pp.x - C.x) + Math.PI, n = makeNode('reeds', C.x + Math.cos(a) * 1.0, C.z + Math.sin(a) * 1.0, 8100 + day % 97);
      n.choir = 1; n.pop = 0.001; n.g.scale.setScalar(0.01); Snd.play('secret', { gain: 0.4 }); FS.play = null;
    }
  }
}
ISLE_STEPS.push(frogStep);
