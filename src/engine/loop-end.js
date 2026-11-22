  /* flying items */
  for (let i = flyers.length - 1; i >= 0; i--) { const f = flyers[i]; f.t += dt / f.dur; const to = f.toFn().clone(), q = Math.min(1, f.t); f.m.position.lerpVectors(f.from, to, q); f.m.position.y += Math.sin(q * Math.PI) * 0.7; if (f.t >= 1) { flyers.splice(i, 1); f.done(); } }
  for (let i = pops.length - 1; i >= 0; i--) { const m = pops[i], u = m.userData; u.t += dt; u.v.y -= 12 * dt; m.position.addScaledVector(u.v, dt); m.rotation.y += dt * 8; if (u.t > 1.2) { sc.remove(m); pops.splice(i, 1); } }

  /* guidance */
  const g = inHouse && !inBarn && !inStore && !barnGoal() && !tutArrowIn() ? null : guideGoal();
  arrow.visible = !!g; chevG.visible = !!g; goalRing.visible = !!g;
  if (g) {
    arrow.position.set(g[0], 2.0 + (reduced ? 0 : Math.abs(Math.sin(time * 3)) * 0.35), g[1]); arrow.rotation.y += dt * 2; const rq = reduced ? 0.5 : (time * 0.8) % 1; goalRing.position.set(g[0], 0.05, g[1]); goalRing.scale.setScalar(0.7 + rq * 0.5); goalRing.material.opacity = 0.9 * (1 - rq);
    const dx = g[0] - pip.position.x, dz = g[1] - pip.position.z, d = Math.hypot(dx, dz);
    chevG.visible = d > 2; chevG.position.set(pip.position.x + dx / d * 1.0, 0.08, pip.position.z + dz / d * 1.0); chevG.rotation.y = Math.atan2(dx, dz);
  }

  /* water and camera */
  waterT -= dt; if (waterT <= 0) { waterT = 0.1; for (let i = 0; i < wp.count; i++) { const x = wp.getX(i), z = wp.getZ(i); wp.setY(i, Math.sin(x * 0.5 + time * 0.9) * 0.06 + Math.sin(z * 0.42 - time * 0.7) * 0.06); const ax = -Math.cos(x * 0.5 + time * 0.9) * 0.18, az = -Math.cos(z * 0.42 - time * 0.7) * 0.15, l = Math.hypot(ax, 1, az); wn.setXYZ(i, ax / l, 1 / l, az / l); } wp.needsUpdate = true; wn.needsUpdate = true; }
  /* the camera keeps up closely, so it stops with Pip instead of gliding on after the finger lifts */ camFocus.lerp(pip.position, 1 - Math.exp(-dt * 10)); if (inBarn) camFocus.z = Math.min(camFocus.z, BI.z + 0.9); if (inStore) camFocus.z = Math.min(camFocus.z, SI.z + 1.2);
  dressT += ((dressing ? 1 : 0) - dressT) * Math.min(1, dt * 5); const k = (aspect < 1 ? 1.5 : 1.15) * (1 - 0.7 * dressT) * (inBarn ? 1.22 : 1); cam.position.set(camFocus.x, 9.5 * k, camFocus.z + 8.5 * k); cam.lookAt(camFocus.x + (aspect < 1 ? 0 : 0.75) * dressT, 0.55 * dressT, camFocus.z + 0.3 + (aspect < 1 ? 0.55 : -0.1) * dressT);
  sun.position.set(camFocus.x - 10, 10, camFocus.z + 7.5); sun.target.position.copy(camFocus); curveFrame(aspect < 1 ? 1.15 : 1, dt); skyFrame(dt);
  if (buyCam(dt)) {} else if (window.__camTop) { const c = window.__camTop; cam.position.set(c[0], c[2], c[1] + (c[3] || 0)); cam.lookAt(c[0], 0, c[1]); cam.far = 300; }
  if (ED.on) edRender(dt); else fxFrame(dt);
  $('coins').textContent = fmt(state.coins);
  menuT -= dt; if (menuT <= 0) { menuT = 0.25; const any = UPS.some((u) => state.lv[u.id] < u.max && state.coins >= upCost(u)); $('menuBtn').classList.toggle('ready', false); if (!$('menu').hidden) renderMenu(); }
  Snd.musicStep(dt, musicMood());
}
/* the next frame is asked for first: an error in one frame is logged and the game goes on, instead of the picture freezing for good */
const LOG = window.PipsLog;
function frame(now) {
  requestAnimationFrame(frame);
  if (now - lastT < 1000 / fpsCap - 3) return;
  let dt = (now - lastT) / 1000; lastT = now; if (dt > 0.1) dt = 0.1;
  if (LOG) LOG.tick();
  if (dt > 0) { try { step(dt); } catch (e) { if (LOG) LOG.caught(e); else console.error(e); } if (window.PipsBoot) PipsBoot.frame(); }
  saveT += dt; if (saveT > 5) { saveT = 0; try { save(); } catch (e) { if (LOG) LOG.caught(e); } }
}
if (LOG) {
  LOG.gl(renderer.domElement);
  LOG.probe = () => { const i = renderer.info; return 'draw calls ' + i.render.calls + ', triangles ' + i.render.triangles + ', meshes ' + i.memory.geometries + ', textures ' + i.memory.textures + (typeof HERE !== 'undefined' ? ', at ' + HERE : '') + ', coins ' + Math.floor(state.coins || 0); };
}
