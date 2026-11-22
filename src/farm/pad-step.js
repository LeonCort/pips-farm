  if (pad) {
    const pos = padPos(pad.p), left = pad.p.cost - (state.paid[pad.p.id] || 0);
    if (near(pos[0], pos[1], 0.85) && state.coins > 0 && !moving) {
      const amt = Math.min(state.coins, left, Math.max(1, Math.ceil(pad.p.cost * dt / 1.2)));
      state.coins -= amt; state.paid[pad.p.id] = (state.paid[pad.p.id] || 0) + amt; pad.coinT -= dt;
      if (pad.coinT <= 0) { pad.coinT = 0.08; const m = new T.Mesh(heartGeo, heartMat); m.position.set(pip.position.x, 1.4, pip.position.z); sc.add(m); fly(m, () => tmpV.set(pos[0], 0.1, pos[1]), () => sc.remove(m), 0.25); Snd.play('tick', { gain: 0.3, f: 1200 }, 0, 70); }
      if (state.paid[pad.p.id] >= pad.p.cost) unlock(pad.p);
    }
    if (pad) { const l2 = pad.p.cost - (state.paid[pad.p.id] || 0); if (l2 !== pad.shown) { pad.shown = l2; pad.disc.material.map.dispose(); pad.disc.material.map = padTex(pad.p, l2); } pad.g.scale.setScalar(1 + (reduced ? 0 : Math.sin(time * 3) * 0.03)); }
  }

