/* ---------- wonders change their island (Leon, 2026-11-25: "wonders that do more than fast travel ... transform it") ----------
   A finished monument is felt over its whole island, not just at its own spot:
     the windmill   its wind lays the meadow's tall grass flat (every belt is open for good), and the meadow bursts into flower;
     the lighthouse the rain over the stone island stops: clear skies there from then on;
     the star tower its warmth stops the snowfall on the winter island and melts the deep snow, so Pip walks at full speed
                    there even without boots.
   The harbour stays as it is (home has nothing to mend). The new islands have no wonder yet. */
const WD = { bloom: {}, pop: [] };
const wonderCalm = (A) => (/^s\d/.test(A.id) && !!mons().lighthouse) || (/^w\d/.test(A.id) && !!mons().tower);
/* the moment a wonder is finished */
function wonderNow(id) {
  if (id === 'windmill') nodes.forEach((n) => { if (n.kind !== 'tall' || n.dead) return; n.dead = 1; n.st = 'gone'; if (work && work.n === n) work = null; if (Math.hypot(n.x - pip.position.x, n.z - pip.position.z) < 16) for (let k = 0; k < 2; k++) smokePuff(n.x + (Math.random() - 0.5) * 0.7, 0.4 + Math.random() * 0.8, n.z + (Math.random() - 0.5) * 0.7, k ? '#e9d27a' : '#a9cf62'); });
  if (id === 'tower' || id === 'lighthouse') { const S = LOOP_SITES[id]; for (let k = 0; k < 10; k++) smokePuff(S.x + (Math.random() - 0.5) * 3, 0.5 + Math.random() * 2, S.z + (Math.random() - 0.5) * 3, '#ffffff'); }
  WD.anim = id === 'windmill';
}
/* the meadow in flower: a carpet of blossoms over each meadow square Pip owns */
function wonderBloom(A, anim) {
  const L = [], base = AREAS.indexOf(A) * 173, COLS = ['#ffffff', '#f6d24a', '#f29ab8', '#b89cf0', '#ff8a5c', '#ef6f6c', '#8fd0f0'];
  for (let k = 0; k < 230; k++) { const x = A.cx + (hash(k, 811 + base) - 0.5) * 11.2, z = A.cz + (hash(k, 812 + base) - 0.5) * 11.2; if (roadKind(x, z) || campNear(x, z, 1.2) || nodes.some((q) => Math.abs(q.x - x) < 0.5 && Math.abs(q.z - z) < 0.5)) continue;
    const col = COLS[Math.floor(hash(k, 813 + base) * COLS.length)], h = 0.14 + hash(k, 814) * 0.16;
    const st = new T.CylinderGeometry(0.012, 0.015, h, 3); st.translate(x, h / 2, z); L.push(fac(st, '#5d8a3a', 8100));
    const pe = ico(0.085, 1, 8200 + k); pe.scale(1, 0.34, 1); pe.rotateX(0.35); pe.translate(x, h, z); L.push(fac(pe, col, 8200 + k));
    const ce = ico(0.034, 0, 8300 + k); ce.translate(x, h + 0.028, z + 0.014); L.push(fac(ce, col === '#f6d24a' ? '#e58a2c' : '#f6d24a', 8300)); }
  const g = new T.Group(); sc.add(g); const m = merged(L.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g); if (m && m.isMesh) { m.castShadow = false; m.receiveShadow = true; }
  WD.bloom[A.id] = g; if (anim) { g.scale.y = 0.01; WD.pop.push({ g, p: 0.001 }); }
}
function wonderStep(dt) {
  if (mons().windmill) AREAS.forEach((A) => { if (/^m\d/.test(A.id) && HAS[A.id] && !WD.bloom[A.id] && !rising) wonderBloom(A, !!WD.anim); });
  for (let k = WD.pop.length - 1; k >= 0; k--) { const P = WD.pop[k]; P.p = Math.min(1, P.p + dt * 0.8); P.g.scale.y = P.p * P.p * (3 - 2 * P.p); if (P.p >= 1) WD.pop.splice(k, 1); }
}
