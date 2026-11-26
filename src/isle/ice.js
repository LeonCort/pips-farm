/* ---------- the frozen lake (Leon, 2026-11-25: each island should differ in how Pip gets about) ----------
   The winter island's way of moving is sliding. A frozen lake lies in its first square, marked out in metre squares.
   Stepping onto the ice sends Pip sliding straight on (north, south, east or west, whichever he was heading most) until
   a rock stops him or he is off the far side; from where he stops, the next push sends him sliding again. A big crystal
   is frozen into the middle: the only way to stand beside it is to stop at the right rocks on the way.
   The lake is set per area (rules.js: ice, as { dx, dz, nx, nz, stop: [[col, row]], gem: [[col, row]] }; col 0 is west,
   row 0 is north). */
const IC = { L: null, rest: null, s: null, seen: false };
const iceMat = new T.MeshStandardMaterial({ color: '#ffffff', emissive: '#2f6f8c', emissiveIntensity: 0.3, roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.95 }); iceMat.userData = { noSnow: 1 };
const iceCell = (L, x, z) => [Math.floor(x - L.x0), Math.floor(z - L.z0)];
const iceIn = (L, c, r) => c >= 0 && r >= 0 && c < L.nx && r < L.nz;
const iceBlock = (L, c, r) => iceIn(L, c, r) && L.grid[r * L.nx + c] === 1;
const iceAt = (L, c, r) => [L.x0 + c + 0.5, L.z0 + r + 0.5];
function iceFill(A, fresh) {
  const D = A.ice; if (!D || IC.L) return;
  const L = IC.L = { A, nx: D.nx, nz: D.nz, x0: A.cx + D.dx - D.nx / 2, z0: A.cz + D.dz - D.nz / 2, grid: new Uint8Array(D.nx * D.nz) }, g = new T.Group(); sc.add(g); L.g = g;
  /* the sheet: pale ice with skate-like streaks and the squares scored faintly into it */
  const c = document.createElement('canvas'); c.width = D.nx * 96; c.height = D.nz * 96; const x = c.getContext('2d');
  const gr = x.createLinearGradient(0, 0, c.width, c.height); gr.addColorStop(0, '#d9f3fb'); gr.addColorStop(0.5, '#a9dcf0'); gr.addColorStop(1, '#c6ecf8'); x.fillStyle = gr; x.fillRect(0, 0, c.width, c.height);
  x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineCap = 'round'; for (let k = 0; k < 46; k++) { const px = hash(k, 3601) * c.width, pz = hash(k, 3602) * c.height, l = 30 + hash(k, 3603) * 90, a = hash(k, 3604) * 0.7 - 0.35 + (k % 2 ? 1.57 : 0); x.lineWidth = 1.5 + hash(k, 3605) * 3; x.beginPath(); x.moveTo(px, pz); x.lineTo(px + Math.cos(a) * l, pz + Math.sin(a) * l); x.stroke(); }
  x.strokeStyle = 'rgba(70,140,175,.28)'; x.lineWidth = 3; for (let q = 1; q < D.nx; q++) { x.beginPath(); x.moveTo(q * 96, 0); x.lineTo(q * 96, c.height); x.stroke(); } for (let q = 1; q < D.nz; q++) { x.beginPath(); x.moveTo(0, q * 96); x.lineTo(c.width, q * 96); x.stroke(); }
  const m = iceMat.clone(); m.userData = { noSnow: 1 }; m.map = new T.CanvasTexture(c);
  const sheet = new T.Mesh(new T.PlaneGeometry(D.nx, D.nz, D.nx * 3, D.nz * 3), m); /* cut fine, so it bends with the curved world like the ground under it */ sheet.rotation.x = -Math.PI / 2; sheet.position.set(L.x0 + D.nx / 2, 0.08, L.z0 + D.nz / 2); sheet.receiveShadow = true; g.add(sheet);
  /* a low bank of snow round the shore */
  const B = []; const bank = (px, pz, k) => { const q = ico(0.32 + hash(k, 3610) * 0.18, 1, 3611 + k); q.scale(1.5, 0.45, 1.3); q.translate(px, 0.05, pz); B.push(fac(q, (cx, cy, cz, i) => tone('#f4f9ff', i, 0.25), 3611 + k)); };
  let k = 0; for (let q = 0; q <= D.nx; q += 0.7) { bank(L.x0 + q, L.z0 - 0.22, k++); bank(L.x0 + q, L.z0 + D.nz + 0.22, k++); } for (let q = 0; q <= D.nz; q += 0.7) { bank(L.x0 - 0.22, L.z0 + q, k++); bank(L.x0 + D.nx + 0.22, L.z0 + q, k++); }
  /* the rocks that stop a slide: frozen in, with a cap of snow */
  (D.stop || []).forEach(([cc, r], q) => { L.grid[r * D.nx + cc] = 1; const [px, pz] = iceAt(L, cc, r), geo = ROCK_GEOS[q % 3].clone(); geo.scale(0.85, 0.95, 0.85); geo.rotateY(hash(q, 3640) * 6.28); geo.translate(px, 0, pz); B.push(geo);
    const cap = ico(0.36, 1, 3650 + q); cap.scale(1.1, 0.4, 1.0); cap.translate(px, 0.62, pz); B.push(fac(cap, (cx, cy, cz, i) => tone('#ffffff', i, 0.2), 3650 + q)); });
  const bm = merged(B.map((p) => (p.index ? p.toNonIndexed() : p)), MAT, g); if (bm && bm.isMesh) { bm.castShadow = true; bm.receiveShadow = true; }
  /* the crystal frozen into the lake: an ordinary crystal to mine, on its own square */
  (D.gem || []).forEach(([cc, r], q) => { L.grid[r * D.nx + cc] = 1; const [px, pz] = iceAt(L, cc, r), n = makeNode('crystal', px, pz, 3670 + q); n.g.position.y = 0.07; n.ice = 1; if (fresh) { n.pop = 0.001; n.g.scale.setScalar(0.01); } });
  for (let r = 0; r < D.nz; r++) for (let cc = 0; cc < D.nx; cc++) { const [px, pz] = iceAt(L, cc, r); lookFoot(px, pz, 0.8, 0.8); } /* no deep snow or grass over the ice */
  if (fresh) { g.scale.y = 0.01; L.pop = 0.001; }
}
/* the frozen crystal gives a double helping, straight to the stores: loose pieces would skate off where Pip cannot follow */
function iceGot(n) {
  const c = tierYield(n) * 2; state.isle.store.crystal = (state.isle.store.crystal || 0) + c; xpGain(XP_FOR.crystal || 2);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: hamGiftTex('crystal', c), transparent: true, depthWrite: false })); sp.scale.set(1.5, 0.75, 1); sp.position.set(n.x, 1.6, n.z); sc.add(sp); FD.floats.push({ sp, t: 0, y: 0.1 });
  Snd.play('sparkle', { gain: 0.45 }); burst(n.x, 1.1, n.z, 8); bldBadge(); save();
}
const iceKeep = (a, x, z) => !!a.ice && Math.abs(x - a.cx - a.ice.dx) < a.ice.nx / 2 + 1.0 && Math.abs(z - a.cz - a.ice.dz) < a.ice.nz / 2 + 1.0;
/* from square (c, r) heading (dc, dr): the square the slide ends on, or null when it runs off the lake */
function iceRun(L, c, r, dc, dr) { for (;;) { const nc = c + dc, nr = r + dr; if (!iceIn(L, nc, nr)) return { c, r, off: true }; if (iceBlock(L, nc, nr)) return { c, r, off: false }; c = nc; r = nr; } }
function iceStep(dt) {
  const L = IC.L; if (!L) return; const pp = pip.position;
  if (L.pop) { L.pop = Math.min(1, L.pop + dt * 1.5); L.g.scale.y = L.pop; if (L.pop >= 1) L.pop = 0; return; }
  if (!HAS[L.A.id] || inCave) return;
  const S = IC.s;
  if (S) { /* sliding: straight on to where the run ends */
    const dx = S.to[0] - pp.x, dz = S.to[1] - pp.z, d = Math.hypot(dx, dz), st = 6.5 * dt; S.t -= dt;
    if (S.t <= 0 && S.off) { IC.s = null; return; } /* something on the shore is in the way (a signpost): the slide just ends there */
    if (d <= st || S.t <= 0) { pp.x = S.to[0]; pp.z = S.to[1]; IC.s = null; IC.rest = S.off ? null : S.to; if (!S.off) { Snd.play('tock', { gain: 0.4, f: 320 }); splash(pp.x + S.dc * 0.4, 0.3, pp.z + S.dr * 0.4, 4); } }
    else { pp.x += dx / d * st; pp.z += dz / d * st; }
    pip.rotation.y = Math.atan2(S.dc, S.dr); target.set(pp.x, 0, pp.z); return;
  }
  if (IC.rest && Math.hypot(pp.x - IC.rest[0], pp.z - IC.rest[1]) > 1.6) IC.rest = null; /* carried off (sleep, a travel mat) */
  const ix = target.x - pp.x, iz = target.z - pp.z, push = Math.hypot(ix, iz) > 0.15 && !enSleep;
  let c, r;
  if (IC.rest) { [c, r] = iceCell(L, IC.rest[0], IC.rest[1]); pp.x = IC.rest[0]; pp.z = IC.rest[1]; if (!push) { target.set(pp.x, 0, pp.z); return; } }
  else { [c, r] = iceCell(L, pp.x, pp.z); if (!iceIn(L, c, r)) return; /* on the shore */
    if (iceBlock(L, c, r)) { const [bx, bz] = iceAt(L, c, r), ox = pp.x - bx, oz = pp.z - bz; if (Math.abs(ox) > Math.abs(oz)) pp.x = bx + Math.sign(ox || 1) * 0.56; else pp.z = bz + Math.sign(oz || 1) * 0.56; return; } /* a rock right at the shore: no way in here */
    if (!push) return; }
  const dc = Math.abs(ix) > Math.abs(iz) ? Math.sign(ix) : 0, dr = dc ? 0 : Math.sign(iz), E = iceRun(L, c, r, dc, dr);
  if (!E.off && E.c === c && E.r === r) { if (IC.rest) target.set(pp.x, 0, pp.z); else { const [bx, bz] = iceAt(L, c, r); pp.x = bx - dc * 0.62; pp.z = bz - dr * 0.62; target.set(pp.x, 0, pp.z); } return; } /* a rock straight ahead: nothing happens */
  const [tx, tz] = iceAt(L, E.c, E.r); const to = E.off ? [tx + dc * 0.9, tz + dr * 0.9] : [tx, tz]; IC.s = { to, off: E.off, dc, dr, t: Math.hypot(to[0] - pp.x, to[1] - pp.z) / 6.5 + 0.35 }; IC.rest = null; work = null;
  Snd.play('whoosh', { gain: 0.3, f: 520 }); if (!IC.seen) IC.seen = true;
}
