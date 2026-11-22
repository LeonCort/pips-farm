/* ---------- the dog, second pass: the same treatment as Pip (smooth merged shapes, painted fur shading, outline, felt) ----------
   The rig is untouched: the same g / body / head / tail / legs groups, so following, barking, sleeping, petting and the
   dressing-room clone work as before. The old meshes stay in place, hidden, so look 1 can still show the old dog. */
const DOG2 = { d: dog, old: [], cur: [] };
[DOG2.d.body, DOG2.d.head, DOG2.d.tail].concat(DOG2.d.legs).forEach((gr) => gr.children.forEach((c) => { if (c.isMesh) DOG2.old.push(c); }));
function dog2Build() {
  const d = DOG2.d, look = P2_LOOKS[PIP2.v], on = !!look;
  DOG2.cur.forEach((m) => { m.parent.remove(m); m.traverse((o) => { if (o.isMesh && o.geometry) o.geometry.dispose(); }); }); DOG2.cur = [];
  DOG2.old.forEach((m) => { m.visible = !on; });
  if (on) {
    PIP2.skin = null; PIP2.fd = 1; const ln = look.line * 0.8, C = '#dba65c', D = '#b9783c', Lc = '#f3d39c', keep = (m) => { DOG2.cur.push(m); return m; };
    /* fur: the coat colour, shading to the light belly colour underneath */
    const fur = (col, y0, y1, belly) => { const a = new T.Color(col), b = new T.Color(Lc); return (x, y, z, c) => { const q = Math.max(0, Math.min(1, (y - y0) / (y1 - y0))); c.copy(a); if (belly) c.lerp(b, belly * (1 - p2S(0.05, 0.5, q))); c.multiplyScalar(0.8 + 0.26 * q); }; };
    let g, L = [], X = [];
    g = p2Ball(0.2, 0.95, 0.85, 1.45, 18, 12); g.translate(0, 0.38, -0.02); p2Paint(g, fur(C, 0.21, 0.55, 0.7)); L.push(g);
    g = p2Ball(0.155, 1, 1.05, 0.9, 14, 10); g.translate(0, 0.42, 0.2); p2Paint(g, fur(Lc, 0.26, 0.58, 0)); L.push(g);
    g = p2Ball(0.13, 1, 1, 0.9, 12, 8); g.translate(0, 0.4, -0.24); p2Paint(g, fur(C, 0.27, 0.53, 0.4)); L.push(g);
    keep(p2Mesh(d.body, L, ln));
    L = []; X = [];
    g = p2Ball(0.168, 1, 0.95, 1, 18, 14); p2Paint(g, fur(C, -0.16, 0.16, 0)); L.push(g);
    g = p2Ball(0.1, 0.9, 0.68, 1, 12, 10); g.translate(0, -0.045, 0.13); p2Paint(g, fur(Lc, -0.12, 0.03, 0)); L.push(g);
    g = p2Ball(0.034, 1.25, 0.85, 1, 10, 8); g.translate(0, -0.008, 0.226); p2Paint(g, p2G('#2a2220', -0.04, 0.03, 0.9, 1.5)); g.userData.felt = 0.1; X.push(g);
    [-1, 1].forEach((s) => { g = p2Ball(0.08, 0.42, 1.3, 0.9, 10, 10); g.rotateZ(s * 0.3); g.translate(s * 0.158, -0.045, -0.02); p2Paint(g, fur(D, -0.16, 0.06, 0)); L.push(g); });
    g = new T.TorusGeometry(0.135, 0.026, 8, 18); g.rotateX(Math.PI / 2 + 0.25); g.translate(0, -0.13, -0.04); p2Paint(g, p2G('#d8423a', -0.17, -0.09, 0.82, 1.06)); g.userData.felt = 0.5; L.push(g);
    g = p2Lathe([[0, -0.008], [0.03, -0.008], [0.034, 0], [0.03, 0.008], [0, 0.008]], 12, 0); g.rotateX(Math.PI / 2); g.translate(0, -0.2, 0.092); p2Paint(g, p2G('#f2c14a', -0.24, -0.16, 0.86, 1.1)); g.userData.felt = 0.1; X.push(g);
    keep(p2Mesh(d.head, L, ln, null, X));
    [-1, 1].forEach((s) => { const e = new T.Mesh(new T.SphereGeometry(0.027, 10, 8), ink); e.position.set(s * 0.07, 0.035, 0.14); d.head.add(e); keep(e);
      const hl = new T.Mesh(new T.SphereGeometry(0.009, 6, 4), p2White); hl.position.set(0.008, 0.01, 0.021); e.add(hl); });
    L = []; for (let k = 0; k < 4; k++) { g = p2Ball(0.058 - k * 0.007, 0.8, 0.8, 1.35, 10, 8); g.translate(0, k * 0.035, -0.05 - k * 0.075); p2Paint(g, fur(k > 1 ? Lc : C, k * 0.035 - 0.05, k * 0.035 + 0.05, 0)); L.push(g); }
    keep(p2Mesh(d.tail, L, ln)).castShadow = false;
    d.legs.forEach((l) => { L = []; g = p2Lathe([[0, 0.03], [0.04, 0.02], [0.05, -0.02], [0.046, -0.16], [0.042, -0.26], [0, -0.275]], 10, 10); p2Paint(g, fur(C, -0.3, 0.03, 0)); L.push(g);
      g = p2Ball(0.05, 1, 0.62, 1.32, 10, 8); g.translate(0, -0.278, 0.016); p2Paint(g, fur(Lc, -0.31, -0.25, 0)); L.push(g); keep(p2Mesh(l, L, ln)).castShadow = false; });
  }
  /* the dressing room keeps a posed copy of the pet: make it copy the new look */
  try { if (ED.dog && ED.dogKind === 'dog') { ED.sc.remove(ED.dog.g); ED.dog = null; ED.dogKind = null; if (ED.on) edPetClone(); } } catch (e) {}
}
{ const s0 = pip2Set; pip2Set = function (v) { s0(v); dog2Build(); }; }
dog2Build();
if (window.__farmTest && window.__p2) window.__p2.dshot = (ang, dist) => { const c = new T.PerspectiveCamera(30, 1, 0.1, 100), p = DOG2.d.g.position; c.position.set(p.x + Math.sin(ang) * dist, 0.9, p.z + Math.cos(ang) * dist); c.lookAt(p.x, 0.4, p.z); const r0 = DOG2.d.g.rotation.y; DOG2.d.g.rotation.y = 0; DOG2.d.g.updateMatrixWorld(true); const s = renderer.getSize(new T.Vector2()); c.aspect = s.x / s.y; c.updateProjectionMatrix(); renderer.render(sc, c); const u = canvas.toDataURL('image/png'); DOG2.d.g.rotation.y = r0; return u; };
