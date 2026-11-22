/* ---------- effects every game uses: hearts, pops, splashes, the guide arrow and ring, icon toasts ---------- */
const heartGeo = (() => { const s = new T.Shape(); s.moveTo(0, -0.1); s.bezierCurveTo(-0.16, 0.0, -0.08, 0.14, 0, 0.06); s.bezierCurveTo(0.08, 0.14, 0.16, 0.0, 0, -0.1); const g = new T.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false }); g.translate(0, 0, -0.02); return g; })();
const heartMat = new T.MeshBasicMaterial({ color: PAL.accent, side: T.DoubleSide });
const pops = [];
function pop(pos) { for (let k = 0; k < 10; k++) { const m = new T.Mesh(new T.OctahedronGeometry(0.09, 0), new T.MeshBasicMaterial({ color: [PAL.ochre, PAL.accent, PAL.seaShallow][k % 3] })); m.position.set(pos[0], 0.5, pos[1]); const a = k / 10 * 6.283; m.userData = { v: new T.Vector3(Math.cos(a) * 2.2, 4 + hash(k, 3) * 2, Math.sin(a) * 2.2), t: 0 }; sc.add(m); pops.push(m); } }
/* guide arrow for children who cannot read */
const arrow = new T.Group(); sc.add(arrow);
{ const c = new T.ConeGeometry(0.3, 0.6, 8); c.rotateX(Math.PI); part(fac(c, PAL.accent, 3), arrow, 0, 0, 0, true); const b = new T.CylinderGeometry(0.13, 0.13, 0.4, 8); part(fac(b, PAL.accent, 4), arrow, 0, 0.45, 0, true); }
const goalRing = new T.Mesh(new T.RingGeometry(0.75, 0.95, 32), new T.MeshBasicMaterial({ color: PAL.accent, transparent: true })); goalRing.rotation.x = -Math.PI / 2; sc.add(goalRing);
const chevron = new T.Mesh(new T.ConeGeometry(0.16, 0.38, 3), new T.MeshBasicMaterial({ color: PAL.accent, transparent: true, opacity: 0.85 })); chevron.rotation.x = Math.PI / 2; const chevG = new T.Group(); chevG.add(chevron); sc.add(chevG);
function burst(x, y, z, n) { for (let k = 0; k < n; k++) { const h = new T.Mesh(heartGeo, heartMat); h.position.set(x, y, z); const a = k / n * 6.283; h.userData = { v: new T.Vector3(Math.cos(a) * 1.0, 2.6 + hash(k, 5), Math.sin(a) * 1.0), t: 0 }; sc.add(h); pops.push(h); } }
function toastIcon(t, text) {
  const el = $('toast'); if (!el) return;
  el.innerHTML = '<img alt="" src="' + actIcon(t) + '" style="width:60px;height:60px"><b>' + text + '</b>'; el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  clearTimeout(toastIcon.t); toastIcon.t = setTimeout(() => { el.hidden = true; }, 2600);
}
const dropGeo = new T.SphereGeometry(0.045, 5, 4), dropMat = new T.MeshBasicMaterial({ color: '#bfe3f0' });
function splash(x, y, z, n) { for (let k = 0; k < n; k++) { const m = new T.Mesh(dropGeo, dropMat); m.position.set(x, y, z); const a = k / n * 6.283 + Math.random(); m.userData = { v: new T.Vector3(Math.cos(a) * 1.1, 2.2 + Math.random() * 1.4, Math.sin(a) * 1.1), t: 0.45 }; sc.add(m); pops.push(m); } }
