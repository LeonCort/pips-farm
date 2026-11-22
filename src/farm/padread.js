/* ---------- ground rings that stay readable ----------
   The buy rings are pictures painted on the ground: what you get, a heart or a coin with the price, and a band that fills
   as you pay. Low things on the ground used to cover them: the stream and its stones, the 3D grass on high graphics,
   leaves in autumn, snow in winter, puddles in the rain. Each ring's picture is now pulled a little toward the camera in
   depth (the screen position stays exactly the same), so anything lower than about a hand's height loses to it, while Pip,
   animals, fences and trees standing in front still cover it as they should. No fog and no tone mapping on it either, so
   it keeps its colours at any distance, at night and in every graphics level. */
const PAD_LIFT = 0.34; /* world units along the view ray: covers things up to ~0.2 high at the outdoor camera's pitch */
function padLift(m) {
  if (!m || !m.isMesh || !m.material || !m.material.isMeshBasicMaterial) return; const mat = m.material; if (mat.userData.padLift) return;
  mat.userData.padLift = true; mat.fog = false; mat.toneMapped = false; mat.depthWrite = false; mat.transparent = true;
  const ob = mat.onBeforeCompile;
  mat.onBeforeCompile = function (sh, r) { if (ob) ob.call(this, sh, r);
    sh.vertexShader = sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n{ float padL = length( mvPosition.xyz ); mvPosition.xyz *= max( 0.05, 1.0 - ' + PAD_LIFT.toFixed(3) + ' / max( padL, 0.001 ) ); gl_Position = projectionMatrix * mvPosition; }'); };
  mat.customProgramCacheKey = () => 'padlift'; mat.needsUpdate = true; m.renderOrder = 2;
}
const padLiftAll = (o) => { if (o) o.traverse(padLift); };
/* the rings are made at different times (a new heart pad after each buy), so new ones are picked up every half second */
let padReadT = 0;
function padReadStep(dt) {
  padReadT -= dt; if (padReadT > 0) return; padReadT = 0.5;
  if (typeof pad !== 'undefined' && pad) padLiftAll(pad.g);
  if (typeof sPad !== 'undefined' && sPad) padLiftAll(sPad.g);
  [typeof bpad !== 'undefined' && bpad, typeof bpadEdge !== 'undefined' && bpadEdge, typeof lpad !== 'undefined' && lpad].forEach(padLift);
  [typeof hrMesh !== 'undefined' && hrMesh, typeof prMesh !== 'undefined' && prMesh, typeof swapG !== 'undefined' && swapG, typeof umRing !== 'undefined' && umRing].forEach(padLiftAll);
  if (typeof STATIONS_S !== 'undefined') STATIONS_S.forEach((s) => padLift(s.pad));
}
{ const e0 = extrasStep; extrasStep = function (dt) { e0(dt); padReadStep(dt); }; }
if (window.__farmTest) window.__padread = () => [pad && pad.disc && pad.disc.material.userData.padLift, sPad && sPad.disc && sPad.disc.material.userData.padLift];
