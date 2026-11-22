/* ---------- walking by road (moved here from the farm's town.js; built from the game's ISLAND): a small graph of points along every road, and the shortest way between two places ---------- */
const RG = { n: [], e: [], line: [] };
function rgAdd(x, z, line) { RG.n.push([x, z]); RG.e.push([]); RG.line.push(line); return RG.n.length - 1; }
function rgLink(a, b) { const d = Math.hypot(RG.n[a][0] - RG.n[b][0], RG.n[a][1] - RG.n[b][1]); RG.e[a].push([b, d]); RG.e[b].push([a, d]); }
{
  let line = 0;
  const loop = (pts) => { const ids = pts.map(([x, z]) => rgAdd(x, z, line)); ids.forEach((id, i) => rgLink(id, ids[(i + 1) % ids.length])); line++; };
  loop(Array.from({ length: 10 }, (_, i) => [Math.cos(i / 10 * 6.283) * ISL.walk, Math.sin(i / 10 * 6.283) * ISL.walk])); /* round the plaza */
  if (RING) loop(Array.from({ length: 36 }, (_, i) => [Math.cos(i / 36 * 6.283) * RING.rx, Math.sin(i / 36 * 6.283) * RING.rz]));
  ROADS.forEach((r) => { const L = Math.hypot(r[2] - r[0], r[3] - r[1]), n = Math.max(1, Math.ceil(L / 1.4)); let prev = -1; for (let i = 0; i <= n; i++) { const id = rgAdd(r[0] + (r[2] - r[0]) * i / n, r[1] + (r[3] - r[1]) * i / n, line); if (prev >= 0) rgLink(prev, id); prev = id; } line++; });
  for (let a = 0; a < RG.n.length; a++) for (let b = a + 1; b < RG.n.length; b++) if (RG.line[a] !== RG.line[b] && Math.hypot(RG.n[a][0] - RG.n[b][0], RG.n[a][1] - RG.n[b][1]) < 1.5) rgLink(a, b);
}
function rgNear(x, z) { let best = 0, bd = 1e9; RG.n.forEach(([nx, nz], i) => { const d = Math.hypot(nx - x, nz - z); if (d < bd) { bd = d; best = i; } }); return best; }
function roadPath(x0, z0, x1, z1) {
  if (Math.hypot(x1 - x0, z1 - z0) < 3) return [[x1, z1]];
  const a = rgNear(x0, z0), b = rgNear(x1, z1), D = RG.n.map(() => Infinity), prev = RG.n.map(() => -1), done = RG.n.map(() => false); D[a] = 0;
  for (;;) { let u = -1; for (let i = 0; i < D.length; i++) if (!done[i] && (u < 0 || D[i] < D[u])) u = i; if (u < 0 || D[u] === Infinity || u === b) break; done[u] = true; RG.e[u].forEach(([v, w]) => { if (D[u] + w < D[v]) { D[v] = D[u] + w; prev[v] = u; } }); }
  const pts = []; for (let u = b; u >= 0; u = prev[u]) pts.unshift(RG.n[u].slice());
  /* skip road points behind Pip, and finish off the road at the place itself */
  while (pts.length > 1 && Math.hypot(pts[1][0] - x0, pts[1][1] - z0) < Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1])) pts.shift();
  while (pts.length > 1 && Math.hypot(pts[pts.length - 2][0] - x1, pts[pts.length - 2][1] - z1) < Math.hypot(pts[pts.length - 2][0] - pts[pts.length - 1][0], pts[pts.length - 2][1] - pts[pts.length - 1][1])) pts.pop();
  pts.push([x1, z1]); return pts;
}
