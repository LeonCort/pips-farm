/* ---------- the house grows from a tent ----------
   size 0: a little tent by the square, with a sleeping mat, a mirror and a pet basket (its inside is at TO, far out to sea)
   size 1: the cottage (bedroom strip, study, workshop), 2: kitchen and lounge, 3: the east wing, 4: the west wing.
   Rooms that are not built yet are simply not there (no garden in their place), every room has its own floor so it feels
   like its own place, and the pets get their own corner of the bedroom instead of the middle of the hall. */
SIZES[1] = { cost: 120 };
const TO = { x: HO.x + 40, z: HO.z };
const TENT_B = { x0: TO.x - 2.25, x1: TO.x + 2.25, z0: TO.z - 1.95, z1: TO.z + 2.95 };
const HOUSE_Z0 = { z0: HOUSE_IN.z0, z1: HOUSE_IN.z1 };
const homeTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 4; return t; };
const isTent = () => { const S = stS(); return !S || S.size < 1 || S.pend.includes('size1'); };
function homeExit() { return isTent() ? [TO.x, TO.z + 2.5] : [HO.x, HO.z + 4.6]; }
function homeIn() { return isTent() ? [TO.x, TO.z + 1.7] : null; }

/* ---------- room floors: one look per room ---------- */
const FLOORS = {
  bed: (x, w, h) => { x.fillStyle = '#8f9ccf'; x.fillRect(0, 0, w, h); for (let k = 0; k < 900; k++) { x.fillStyle = hash(k, 3) > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(40,50,100,0.08)'; x.fillRect(hash(k, 1) * w, hash(k, 2) * h, 3, 3); }
    x.fillStyle = '#f4ecc8'; for (let k = 0; k < 7; k++) { const a = hash(k, 9) * w, b = hash(k, 11) * h; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 4 : 10, t = i * Math.PI / 5; x.lineTo(a + Math.sin(t) * r, b - Math.cos(t) * r); } x.fill(); } },
  speed: (x, w, h) => planks(x, w, h, ['#8aa874', '#7f9c6a', '#94b07c', '#789561']),
  bag: (x, w, h) => { x.fillStyle = '#8f8270'; x.fillRect(0, 0, w, h); const C = ['#c2b59e', '#b5a68d', '#cbbfa8', '#bdae94']; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const o = r % 2 ? 32 : 0; x.fillStyle = C[(r * 3 + c) % 4]; x.fillRect(c * 64 + o + 3, r * 64 + 3, 58, 58); if (o) { x.fillStyle = C[(r + c) % 4]; x.fillRect(-32 + 3, r * 64 + 3, 58, 58); } } },
  farm: (x, w, h) => { for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { x.fillStyle = (r + c) % 2 ? '#c95a40' : '#efe4cf'; x.fillRect(c * 64, r * 64, 64, 64); } x.strokeStyle = 'rgba(60,40,30,0.25)'; x.lineWidth = 2; for (let k = 0; k <= 4; k++) { x.beginPath(); x.moveTo(k * 64, 0); x.lineTo(k * 64, h); x.moveTo(0, k * 64); x.lineTo(w, k * 64); x.stroke(); } },
  guests: (x, w, h) => { const C = ['#d9a35c', '#c98f4c', '#e3b06a', '#cf9a55']; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const v = (r + c) % 2; for (let k = 0; k < 4; k++) { x.fillStyle = C[(k + r + c) % 4]; if (v) x.fillRect(c * 64 + k * 16, r * 64, 16, 64); else x.fillRect(c * 64, r * 64 + k * 16, 64, 16); } } x.strokeStyle = 'rgba(90,50,20,0.3)'; x.lineWidth = 1.5; for (let k = 0; k <= 16; k++) { x.beginPath(); x.moveTo(k * 16, 0); x.lineTo(k * 16, h); x.stroke(); } },
  play: (x, w, h) => { const C = ['#e9684a', '#f2c14a', '#74a857', '#5a9fc4']; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { x.fillStyle = C[(r * 2 + c) % 4]; x.fillRect(c * 64 + 1, r * 64 + 1, 62, 62); x.fillStyle = 'rgba(255,255,255,0.25)'; x.beginPath(); x.arc(c * 64 + 32, r * 64 + 32, 9, 0, 7); x.fill(); } },
  music: (x, w, h) => planks(x, w, h, ['#6b4630', '#7a5238', '#5e3d28', '#714a33']),
  garden: (x, w, h) => { x.fillStyle = '#efe0c4'; x.fillRect(0, 0, w, h); const C = ['#c8734a', '#b8653f', '#cf7c52']; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { x.fillStyle = C[(r * 5 + c * 3) % 3]; x.fillRect(c * 64 + 3, r * 64 + 3, 58, 58); } },
  bath: (x, w, h) => { x.fillStyle = '#9cc6d6'; x.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { x.fillStyle = hash(r, c * 7) > 0.85 ? '#5a9fc4' : '#e8f4f8'; x.fillRect(c * 32 + 2, r * 32 + 2, 28, 28); } }
};
function planks(x, w, h, B) {
  for (let r = 0; r < 8; r++) { let px = -hash(r, 7) * 200; while (px < w) { const L = 120 + hash(r, px) * 200; x.fillStyle = B[Math.floor(hash(px, r) * B.length)]; x.fillRect(px, r * 32, L, 32); x.strokeStyle = 'rgba(40,25,15,0.45)'; x.lineWidth = 2; x.strokeRect(px, r * 32, L, 32); px += L; } }
}
/* the groups that hold each size's new pieces inside (size 1 is the cottage itself) */
const HOME_G = { 1: new T.Group() }; sc.add(HOME_G[1]);
[['bed', -6, 6, -7, -4.5, 1], ['speed', -6, -1, -4.5, 0, 1], ['bag', -6, -1, 0, 4.5, 1], ['farm', 1, 6, -4.5, 0, 2], ['guests', 1, 6, 0, 4.5, 2],
  ['play', 6, 11.4, -7, -1.2, 3], ['music', 6, 11.4, -1.2, 4.5, 3], ['garden', -11.4, -6, -7, -1.2, 4], ['bath', -11.4, -6, -1.2, 4.5, 4]].forEach(([id, x0, x1, z0, z1, n]) => {
  const w = x1 - x0 - 0.12, d = z1 - z0 - 0.12, t = homeTex(256, 256, FLOORS[id]); t.repeat.set(w / 2.4, d / 2.4);
  const f = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshStandardMaterial({ map: t, roughness: 0.9 })); f.rotation.x = -Math.PI / 2; f.position.set(HX((x0 + x1) / 2), 0.0705, HZ((z0 + z1) / 2)); f.receiveShadow = true;
  (n === 1 ? HOME_G[1] : ROOMSET[n]).add(f);
});
/* where the kitchen and lounge will be is outside for now: dark ground, no bushes */
if (RIGHT.garden) RIGHT.garden.material.color.set('#1d2919');

/* ---------- the pets' corner in the bedroom: a paw rug under the cushion and a basket of toys ---------- */
{
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#e6b45a'; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill(); x.strokeStyle = '#c98f4c'; x.lineWidth = 10; x.beginPath(); x.arc(128, 128, 108, 0, 7); x.stroke();
  x.fillStyle = 'rgba(120,70,30,0.35)'; [[70, 80], [180, 70], [80, 180], [176, 176], [128, 128]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b + 6, 14, 0, 7); x.fill(); [[-14, -14], [0, -20], [14, -14]].forEach(([u, v]) => { x.beginPath(); x.arc(a + u, b + v, 6, 0, 7); x.fill(); }); });
  const m = new T.Mesh(new T.CircleGeometry(0.62, 32), new T.MeshStandardMaterial({ map: new T.CanvasTexture(c), roughness: 1 })); m.rotation.x = -Math.PI / 2; m.position.set(HX(4.85), 0.072, HZ(-5.35)); m.receiveShadow = true; HOME_G[1].add(m);
  const L = [], Q = at(HX(5.55), HZ(-4.85), 0, L);
  Q(cyl(0.2, 0.16, 0.22, 12), '#c9a36c', 1601, 0, 0.11, 0); Q(new T.TorusGeometry(0.19, 0.025, 4, 14).rotateX(Math.PI / 2), '#9a6542', 1602, 0, 0.22, 0);
  Q(new T.SphereGeometry(0.07, 8, 6), '#5a9fc4', 1603, -0.05, 0.25, 0.03); Q(new T.SphereGeometry(0.06, 8, 6), '#e9684a', 1604, 0.07, 0.26, -0.04);
  ATREC.pop(); merged(L, MAT, HOME_G[1]);
}

/* ---------- the tent outside ---------- */
const TENT_OUT = new T.Group(); TENT_OUT.position.set(HOUSE.x, 0, HOUSE.z); sc.add(TENT_OUT);
{
  const r = 1.55, sy = 0.76, len = 2.3;
  const prism = (rr, l) => { const g = new T.CylinderGeometry(rr, rr, l, 3, 6); g.rotateX(-Math.PI / 2); g.scale(1, sy, 1); g.translate(0, rr / 2 * sy, 0); return g; };
  part(fac(prism(r, len), (cx, cy, cz, i) => tone(Math.floor((cz + len / 2) / (len / 6)) % 2 ? '#f2c14a' : '#e9684a', i, 0.4), 1610), TENT_OUT, 0, 0, 0);
  /* the open door: a dark triangle with the flaps tied back */
  const dg = new T.CylinderGeometry(0.62, 0.62, 0.02, 3); dg.rotateX(-Math.PI / 2); dg.scale(1, 0.95, 1); dg.translate(0, 0.31 * 0.95, 0);
  part(fac(dg, '#4a3326', 1611), TENT_OUT, 0, 0, len / 2 + 0.01, true);
  [-1, 1].forEach((s) => { const f = new T.CylinderGeometry(0.07, 0.07, 0.75, 8); part(fac(f, '#fff2c2', 1612), TENT_OUT, s * 0.52, 0.42, len / 2 + 0.05, true).rotation.z = s * 0.55; });
  /* ridge pole ends, a flag, guy ropes and pegs */
  const top = r * sy * 1.5; [-1, 1].forEach((s) => part(fac(new T.CylinderGeometry(0.04, 0.04, 0.3, 6).rotateX(Math.PI / 2), '#6b4630', 1613), TENT_OUT, 0, top, s * (len / 2 + 0.12)));
  part(fac(new T.CylinderGeometry(0.025, 0.025, 0.6, 6), '#6b4630', 1614), TENT_OUT, 0, top + 0.3, len / 2 + 0.1);
  part(fac(new T.BoxGeometry(0.34, 0.2, 0.02), '#74a857', 1615), TENT_OUT, 0.18, top + 0.5, len / 2 + 0.1);
  [-1, 1].forEach((s) => [-0.7, 0.7].forEach((z) => { const a = new T.Vector3(s * 0.9, top * 0.42, z), b = new T.Vector3(s * 1.75, 0.03, z), m = a.clone().add(b).multiplyScalar(0.5), L = a.distanceTo(b);
    const g = new T.CylinderGeometry(0.012, 0.012, L, 4); const rope = part(fac(g, '#fff6e4', 1616), TENT_OUT, m.x, m.y, m.z, true); rope.lookAt(b.x + TENT_OUT.position.x, b.y, b.z + TENT_OUT.position.z); rope.rotateX(Math.PI / 2);
    part(fac(new T.CylinderGeometry(0.03, 0.02, 0.16, 5), '#6b4630', 1617), TENT_OUT, b.x, 0.06, b.z, true); }));
  /* a lantern on a stick by the door */
  part(fac(new T.CylinderGeometry(0.03, 0.03, 1.0, 6), '#6b4630', 1618), TENT_OUT, 1.0, 0.5, len / 2 + 0.25);
  const lm = new T.Mesh(new T.BoxGeometry(0.16, 0.2, 0.16), lampMatH); lm.position.set(1.0, 1.05, len / 2 + 0.25); TENT_OUT.add(lm);
  part(fac(new T.ConeGeometry(0.13, 0.1, 4).rotateY(Math.PI / 4), '#3a3f48', 1619), TENT_OUT, 1.0, 1.2, len / 2 + 0.25, true);
  TENT_OUT.visible = false;
}
/* the house front's own bits (window boxes, signs) go away while the tent stands there */
const HOUSE_DECO = new T.Group(); sc.add(HOUSE_DECO); const HOUSE_HIDE = [];
function splitHouseFront() {
  const inBox = (x, y, z) => Math.abs(x - HOUSE.x) < 1.5 && z > HOUSE.z - 1.3 && z < HOUSE.z + 1.28 && y > 0.3;
  sc.children.slice().forEach((m) => {
    if (!m.isMesh || m.isSprite || m.parent !== sc) return;
    if (m.position.lengthSq() > 1e-6 || m.geometry.index || !m.geometry.attributes.color || !m.geometry.attributes.normal) {
      if (m.position.lengthSq() > 1e-6 && inBox(m.position.x, m.position.y, m.position.z)) HOUSE_HIDE.push(m); return; }
    m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox; if (bb.max.x < HOUSE.x - 1.5 || bb.min.x > HOUSE.x + 1.5 || bb.max.z < HOUSE.z - 1.3 || bb.min.z > HOUSE.z + 1.28) return;
    const p = m.geometry.attributes.position, nn = m.geometry.attributes.normal, c = m.geometry.attributes.color, A = [[], [], []], B = [[], [], []]; let nb = 0;
    for (let i = 0; i < p.count; i += 3) { const D = inBox((p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3) ? B : A; if (D === B) nb++;
      for (let j = i; j < i + 3; j++) { D[0].push(p.getX(j), p.getY(j), p.getZ(j)); D[1].push(nn.getX(j), nn.getY(j), nn.getZ(j)); D[2].push(c.getX(j), c.getY(j), c.getZ(j)); } }
    if (!nb) return;
    const mk = (D) => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(D[0], 3)); g.setAttribute('normal', new T.Float32BufferAttribute(D[1], 3)); g.setAttribute('color', new T.Float32BufferAttribute(D[2], 3)); g.computeBoundingSphere(); return g; };
    const extra = Object.keys(m.geometry.attributes).filter((k) => !['position', 'normal', 'color'].includes(k));
    if (extra.length) return; /* swaying meshes and the like keep their own data: leave them */
    m.geometry = mk(A); const r = new T.Mesh(mk(B), m.material); r.castShadow = m.castShadow; r.receiveShadow = m.receiveShadow; HOUSE_DECO.add(r);
  });
}
/* the cottage's parts, so it can be built like the wing: walls, roof, then the details */
function tagCottage() {
  const kids = houseG.children.slice(); if (kids[0]) kids[0].userData.part = 'wall'; if (kids[1]) kids[1].userData.part = 'roof';
  const det = new T.Group(); det.userData.part = 'det'; kids.slice(2).forEach((k) => det.add(k)); houseG.add(det);
  HOUSE_ADD[1] = houseG;
}

/* ---------- the tent inside: canvas walls, bunting, a lantern, the sleeping mat, a mirror and the pet basket ---------- */
const TENT_IN = new T.Group(); sc.add(TENT_IN);
{
  const g = new T.Mesh(new T.PlaneGeometry(30, 30), new T.MeshStandardMaterial({ color: '#1d2919', roughness: 1 })); g.rotation.x = -Math.PI / 2; g.position.set(TO.x, 0.01, TO.z); g.receiveShadow = true; TENT_IN.add(g);
  const cloth = homeTex(256, 256, (x, w, h) => { x.fillStyle = '#d9b27a'; x.fillRect(0, 0, w, h); for (let k = 0; k < 16; k++) { x.fillStyle = k % 4 === 0 ? '#c98f6a' : k % 2 ? '#d4b07e' : '#e3c493'; x.fillRect(0, k * 16, w, 16); } x.fillStyle = 'rgba(255,255,255,0.06)'; for (let k = 0; k < 64; k++) x.fillRect(k * 4, 0, 2, h); });
  cloth.repeat.set(2, 2);
  const fl = new T.Mesh(new T.PlaneGeometry(5.2, 4.6), new T.MeshStandardMaterial({ map: cloth, roughness: 1 })); fl.rotation.x = -Math.PI / 2; fl.position.set(TO.x, 0.03, TO.z); fl.receiveShadow = true; TENT_IN.add(fl);
  const L = [], Q = at(TO.x, TO.z, 0, L), CAN = '#f3e3c4', OR = '#e9684a';
  /* canvas walls that lean in a little, with an orange band at the top */
  [-1, 1].forEach((s) => { Q(box(0.07, 0.95, 4.6), CAN, 1620, s * 2.6, 0.45, 0, { rz: s * 0.3 }); Q(box(0.08, 0.14, 4.6), OR, 1621, s * 2.47, 0.9, 0, { rz: s * 0.3 }); });
  Q(box(5.2, 0.95, 0.07), CAN, 1622, 0, 0.45, -2.3, { rx: 0.3 }); Q(box(5.2, 0.14, 0.08), OR, 1623, 0, 0.9, -2.17, { rx: 0.3 });
  [-1, 1].forEach((s) => { Q(box(1.85, 0.5, 0.07), CAN, 1624, s * 1.68, 0.25, 2.3, { rx: -0.2 }); Q(box(1.85, 0.12, 0.08), OR, 1625, s * 1.68, 0.5, 2.25, { rx: -0.2 });
    Q(cyl(0.08, 0.08, 0.6, 8), '#fff2c2', 1626, s * 0.72, 0.3, 2.32); });
  /* poles and bunting */
  [[-2.45, -2.15], [2.45, -2.15], [-2.45, 2.15], [2.45, 2.15]].forEach(([x, z]) => Q(cyl(0.05, 0.05, 1.3, 6), '#6b4630', 1627, x, 0.65, z));
  const FL = ['#e9684a', '#f2c14a', '#74a857', '#5a9fc4', '#f6b8c8'];
  [[-2.45, -2.15, 2.45, -2.15], [-2.45, -2.15, -2.45, 2.15], [2.45, -2.15, 2.45, 2.15]].forEach(([x0, z0, x1, z1], k) => { const n = 9;
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, y = 1.24 - Math.sin(t * Math.PI) * 0.22; Q(new T.ConeGeometry(0.08, 0.17, 3).rotateX(Math.PI), FL[(i + k) % 5], 1630 + i, x, y, z, { ry: x0 === x1 ? Math.PI / 2 : 0 }); } });
  /* the sleeping mat: a blue mat, a red blanket, a pillow */
  { const B = at(TO.x - 1.45, TO.z - 1.55, 0, L); B(box(1.7, 0.08, 0.85), '#5a7fb0', 1640, 0, 0.05, 0); B(box(1.0, 0.07, 0.88), '#e9684a', 1641, 0.3, 0.12, 0); B(box(0.38, 0.1, 0.6), '#fff6e4', 1642, -0.6, 0.14, 0); B(box(0.5, 0.05, 0.88), '#c45a3a', 1643, 0.55, 0.16, 0); }
  /* a standing mirror and a crate of folded clothes */
  { const M = at(TO.x + 1.2, TO.z - 2.0, 0, L); M(box(0.8, 1.4, 0.08), '#9a6542', 1645, 0, 0.82, 0); M(box(0.5, 0.06, 0.3), '#6b4630', 1646, 0, 0.05, 0);
    const gl = new T.Mesh(new T.PlaneGeometry(0.62, 1.18), new T.MeshStandardMaterial({ color: '#cfe8f2', roughness: 0.15, metalness: 0.3 })); gl.position.set(TO.x + 1.2, 0.84, TO.z - 1.955); TENT_IN.add(gl); }
  { const C = at(TO.x + 2.05, TO.z - 1.55, 0.3, L); C(box(0.55, 0.32, 0.4), '#b98552', 1647, 0, 0.16, 0); ['#5a7fb0', '#f2c14a', '#74a857'].forEach((col, k) => C(box(0.42, 0.06, 0.3), col, 1648 + k, 0, 0.35 + k * 0.06, 0)); }
  /* a lantern on a crate by the door, and a backpack */
  { const C = at(TO.x - 2.0, TO.z + 1.65, 0, L); C(box(0.5, 0.42, 0.5), '#b98552', 1651, 0, 0.21, 0); C(cyl(0.08, 0.09, 0.2, 8), '#3a3f48', 1652, 0, 0.52, 0); C(new T.ConeGeometry(0.1, 0.08, 8), '#3a3f48', 1653, 0, 0.66, 0); }
  { const C = at(TO.x - 2.1, TO.z + 0.3, 0.4, L); C(box(0.42, 0.5, 0.26), '#3f7d62', 1654, 0, 0.25, 0); C(box(0.34, 0.2, 0.06), '#74a857', 1655, 0, 0.22, 0.15); C(box(0.44, 0.1, 0.28), '#2e5f4a', 1656, 0, 0.5, 0); }
  ATREC.pop(); ATREC.pop(); ATREC.pop(); ATREC.pop(); ATREC.pop(); merged(L, MAT, TENT_IN);
  const lamp = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, 0.14, 8), new T.MeshBasicMaterial({ color: '#ffd98a' })); lamp.position.set(TO.x - 2.0, 0.53, TO.z + 1.65); TENT_IN.add(lamp);
  const gs = new T.Sprite(glowMat.clone()); gs.material.opacity = 0.9; gs.scale.set(0.9, 0.9, 1); gs.position.set(TO.x - 2.0, 0.6, TO.z + 1.65); TENT_IN.add(gs); INT.flames.push({ s: gs, b: 0.9, k: 2 });
}

/* ---------- moving the bed, the mirror and the pet corner between the tent and the house ---------- */
const HOME0 = {};
function placeHome(tent) {
  if (!HOME0.bed) { HOME0.bed = { x: BED.x, z: BED.z }; HOME0.ring = { x: bedRing.x, z: bedRing.z }; HOME0.ward = { x: wardRing.x, z: wardRing.z }; HOME0.pc = { x: PCORNER.x, z: PCORNER.z, bx: PCORNER.bx, bz: PCORNER.bz }; HOME0.lights = INT.lights.map((l) => l.slice()); }
  const bed = tent ? { x: TO.x - 1.45, z: TO.z - 1.55 } : HOME0.bed; BED.x = bed.x; BED.z = bed.z; BED.y = tent ? 0.2 : 0.46;
  const r = tent ? { x: TO.x - 1.3, z: TO.z - 0.2 } : HOME0.ring; bedRing.x = r.x; bedRing.z = r.z; [bedRing.pad, bedRing.r, bedRing.glow, bedRing.f].forEach((m) => { m.position.x = r.x; m.position.z = r.z; });
  bedRing.sign.position.set(bed.x, tent ? 1.15 : 1.35, bed.z - 0.2);
  const w = tent ? { x: TO.x + 1.2, z: TO.z - 1.3 } : HOME0.ward; wardRing.x = w.x; wardRing.z = w.z; [wardRing.r, wardRing.f].forEach((m) => { m.position.x = w.x; m.position.z = w.z; });
  const pc = tent ? { x: TO.x + 0.85, z: TO.z + 0.95, bx: TO.x + 1.85, bz: TO.z + 0.95 } : { x: HX(3.75), z: HZ(-5.3), bx: HX(4.85), bz: HZ(-5.35) };
  Object.assign(PCORNER, pc); petMat.position.x = pc.x; petMat.position.z = pc.z; petSign.position.x = pc.x; petSign.position.z = pc.z - 0.15;
  if (PCORNER.mesh) PCORNER.mesh.position.set(pc.bx - HOME0.pc.bx, 0, pc.bz - HOME0.pc.bz);
  const LT = tent ? [[38.0, 1.0, 1.65], [40, 1.8, 0], [41.6, 1.1, -1.7], [38.6, 1.1, -1.6]] : HOME0.lights; INT.lights.forEach((l, i) => { l[0] = LT[i][0]; l[1] = LT[i][1]; l[2] = LT[i][2]; });
  if (tent) { HOUSE_IN.x0 = TENT_B.x0; HOUSE_IN.x1 = TENT_B.x1; HOUSE_IN.z0 = TENT_B.z0; HOUSE_IN.z1 = TENT_B.z1; }
  else { HOUSE_IN.z0 = HOUSE_Z0.z0; HOUSE_IN.z1 = HOUSE_Z0.z1; roomsAt = -1; roomsSync(stS().size); }
}
let homeReady = false, homeMode = null, homeLZ = 0;
function homeStep(dt) {
  const S = stS(); if (!S) return;
  if (!homeReady) { homeReady = true; tagCottage(); splitHouseFront();
    /* the glow of the right rooms' windows belongs to the kitchen and lounge */
    sc.children.forEach((o) => { if (o.isSprite && Math.abs(o.position.x - HX(6.09)) < 0.3 && Math.abs(o.position.z - HO.z) < 4.4 && !RIGHT.flames.some((f) => f.s === o)) RIGHT.flames.push({ s: o }); }); }
  const tent = isTent(), b1 = BUILD && BUILD.what === 'size1', home = inHouse && !inBarn && !inStore;
  TENT_OUT.visible = tent && !b1;
  if (!b1) houseG.visible = !tent;
  HOUSE_DECO.visible = !tent; HOUSE_HIDE.forEach((o) => { o.visible = !tent; });
  HOME_G[1].visible = S.size >= 1; if (RIGHT.bushes) RIGHT.bushes.visible = false;
  if (homeMode !== tent) { homeMode = tent; placeHome(tent); }
  /* in the house: the walk area always follows the house as it is now (after the tent, and after every new size) */
  if (!tent && home) { IN_B.x0 = HOUSE_IN.x0; IN_B.x1 = HOUSE_IN.x1; IN_B.z0 = HOUSE_IN.z0; IN_B.z1 = HOUSE_IN.z1; }
  if (!tent || !home) return;
  /* in the tent: keep the walls, find the door */
  HOUSE_IN.x0 = IN_B.x0 = TENT_B.x0; HOUSE_IN.x1 = IN_B.x1 = TENT_B.x1; HOUSE_IN.z0 = IN_B.z0 = TENT_B.z0; HOUSE_IN.z1 = IN_B.z1 = TENT_B.z1;
  if (Math.abs(pip.position.x - TO.x) > 8) { pip.position.set(TO.x, 0, TO.z + 1.7); pip.rotation.y = Math.PI; target.copy(pip.position); camFocus.copy(pip.position); lastP.copy(pip.position); homeLZ = 1.7; return; }
  const lx = pip.position.x - TO.x, lz = pip.position.z - TO.z;
  if (lz > 1.95 && Math.abs(lx) > 0.55) { if (homeLZ <= 1.95) pip.position.z = TO.z + 1.95; else pip.position.x = TO.x + Math.sign(lx) * 0.55; }
  homeLZ = pip.position.z - TO.z;
  if (homeLZ > 2.7 && doorT <= 0 && !dressing) goInside(false);
}
if (window.__farmTest) window.__home = () => ({ tent: isTent(), mode: homeMode, ready: homeReady, inHouse, inBarn, inStore, pip: [pip.position.x, pip.position.z], tv: TENT_OUT.visible, hv: houseG.visible });
if (window.__farmTest) window.__walk = { inside: (v) => goInside(v !== false), b: () => ({ IN_B: Object.assign({}, IN_B), HOUSE_IN: Object.assign({}, HOUSE_IN), HO: [HO.x, HO.z], ring: [bedRing.x, bedRing.z], inHouse }), S: () => stS(), tap: (x, z) => { target.set(x, 0, z); onIsle(target); }, place: (x, z) => { pip.position.set(x, 0, z); target.copy(pip.position); lastP.copy(pip.position); } };
