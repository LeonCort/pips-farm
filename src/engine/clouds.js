/* ---------- sky with clouds ----------
   Replaces the plain two-colour dome with one that follows the camera and is anchored to the *visible* horizon
   (with the curved world the sea edge sits well below eye level, so the gradient and clouds start there).
   Clouds are painted procedurally in the shader (no textures): coverage follows the weather and season, they
   drift with the wind, and their colour comes from the same top/horizon colours the day cycle and weather already
   set, so dawn, sunset, rain, snow and night all tint them for free. Stars come out at night. */
const SKYU = Object.assign({}, sky.material.uniforms, { uHz: { value: -0.2 }, uCover: { value: 0.35 }, uWind: { value: new T.Vector2() }, uNight: { value: 0 }, uT: { value: 0 }, uSun: { value: new T.Vector3(0, 0.5, -1) } });
sky.material = new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, fog: false, uniforms: SKYU,
  vertexShader: 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    varying vec3 vD; uniform vec3 top; uniform vec3 hor; uniform float uHz; uniform float uCover; uniform vec2 uWind; uniform float uNight; uniform float uT; uniform vec3 uSun;
    float h2(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(h2(i), h2(i + vec2(1.0, 0.0)), f.x), mix(h2(i + vec2(0.0, 1.0)), h2(i + vec2(1.0, 1.0)), f.x), f.y); }
    float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * vn(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return s; }
    void main(){
      vec3 d = normalize(vD);
      float e = (d.y - uHz) / (1.0 - uHz);
      float g = clamp(e, 0.0, 1.0);
      vec3 col = mix(hor, top, smoothstep(0.0, 0.12, g));
      /* a soft glow around the sun */
      float sd = max(dot(d, normalize(uSun)), 0.0); col += (hor * 0.35 + 0.08) * pow(sd, 10.0) * (1.0 - uNight) * 0.6;
      if (e > 0.0) {
        /* clouds on a flat layer above: project the view ray onto it */
        vec2 p = d.xz / (e + 0.06) * 0.35 + uWind;
        float n = fbm(p * 0.9);
        float lo = 0.62 - uCover * 0.42, a = smoothstep(lo, lo + 0.22, n);
        a *= smoothstep(0.0, 0.02, e) * (0.55 + 0.45 * uCover);
        /* light from the sun side: brighter where the cloud thins toward the sun */
        float n2 = fbm(p * 0.9 + normalize(uSun.xz + 1e-4) * 0.12);
        float lit = clamp(0.62 + (n - n2) * 4.0, 0.0, 1.0);
        vec3 bright = mix(vec3(1.0) * (1.0 - 0.78 * uNight), hor, 0.32 + 0.3 * uNight);
        vec3 shade = mix(top, hor, 0.55) * (0.78 - 0.1 * uCover);
        vec3 cc = mix(shade, bright, lit);
        cc = mix(cc, hor, 0.5 * (1.0 - smoothstep(0.0, 0.05, e))); /* far clouds melt into the haze */
        /* stars behind the clouds at night */
        vec3 q = floor(d * 220.0); float st = step(0.9965, h2(q.xy + q.z * 7.1)) * uNight * smoothstep(0.05, 0.3, e);
        st *= 0.6 + 0.4 * sin(uT * 3.0 + h2(q.zy) * 40.0);
        col += vec3(st);
        col = mix(col, cc, a);
      }
      gl_FragColor = vec4(col, 1.0);
    }` });
const SKY_COVER = { clear: 0.3, windy: 0.45, rain: 0.85, heavy: 0.97, mist: 0.75, snow: 0.85 }, SEASON_COVER = { spring: 0.08, summer: -0.08, autumn: 0.15, winter: 0.12 };
let skyCover = 0.35;
const _sk = new T.Vector3();
/* the sun (and at night a pale moon) as a round disk in the sky, where the camera can see it: in the direction of the
   light, but lowered to the thin strip of sky over the bent horizon at the top of the screen, so a sunrise or sunset there
   shows (sun path top/bottom in the settings). It is a sprite far out, lifted by exactly the curve's drop so it sits where
   it is meant to; houses and trees in front hide it. */
const SUN_BALL = (() => {
  const mk = (stops, sz) => { const m = new T.SpriteMaterial({ map: gradTex(128, 128, stops), transparent: true, depthWrite: false, fog: false }); const s = new T.Sprite(m); s.scale.set(sz, sz, 1); s.frustumCulled = false; s.visible = false; sc.add(s); return s; };
  const disk = mk([[0, 255, 252, 230, 1], [0.38, 255, 238, 176, 1], [0.44, 255, 214, 130, 0.75], [0.56, 255, 190, 110, 0.28], [0.8, 255, 170, 90, 0.08], [1, 255, 160, 80, 0]], 16);
  return { disk, d: 90, v: new T.Vector3() };
})();
function sunBall() {
  const s = SUN_BALL.disk, f = dayFrac(), day = f < 0.64, h = Math.hypot(SUN_OFF.x, SUN_OFF.z) || 1;
  if (inHouse) { s.visible = false; return; }
  const el = Math.atan2(SUN_OFF.y, h) * 180 / Math.PI; /* 18 at the horizon, up to 55 */
  /* visible strip: about -19 deg at the top edge of the screen; the low sun sits a little under it and rises out of view */
  /* sinks under the far edge just before sunset and climbs up from it just after sunrise */
  const sink = day ? Math.max(0, 1 - Math.min(f, 0.64 - f) / 0.035) : 0;
  const ve = (-21.5 + (el - 18) * 0.25 - sink * 4) * Math.PI / 180, v = SUN_BALL.v.set(SUN_OFF.x / h * Math.cos(ve), Math.sin(ve), SUN_OFF.z / h * Math.cos(ve));
  s.position.copy(cam.position).addScaledVector(v, SUN_BALL.d); s.position.y += curveDrop(s.position.x, s.position.z);
  s.visible = true; const m = s.material;
  if (day) m.color.setRGB(1, 0.92 + 0.08 * Math.min(1, (el - 18) / 20), 0.8 + 0.2 * Math.min(1, (el - 18) / 20)); else m.color.setRGB(0.62, 0.68, 0.85); /* warm when low; the moon is pale blue */
  m.opacity = day ? 1 - sink * sink : 0.55 * nightAmt;
}
function skyFrame(dt) {
  sky.position.copy(cam.position); sky.updateMatrixWorld();
  /* the visible horizon: the steepest line from the camera that still touches the (bent) ground or sea */
  const s = CURVE.u.strength.value, H = cam.position.y + 0.45, back = Math.max(0, cam.position.z - CURVE.u.origin.value.z); let best = -1, bestT = 1e6;
  for (let t = 2; t < 180; t *= 1.04) { const gy = -s * (t - back) * (t - back); const a = (gy - H) / t; if (a > best) { best = a; bestT = t; } }
  CURVE.u.horD.value = s > 0 ? Math.hypot(bestT, H + s * (bestT - back) * (bestT - back)) : 1e6;
  if (s > 0) CURVE.u.horD.value *= 1.22; /* the haze only touches the very edge of the bent world, not the yard in front of it */
  SKYU.uHz.value = clamp(best / Math.hypot(1, best), -0.6, 0) - 0.01;
  const k = state.wx && state.wx.k, want = clamp((SKY_COVER[k] == null ? 0.35 : SKY_COVER[k]) + (SEASON_COVER[season] || 0), 0.1, 1);
  skyCover += (want - skyCover) * Math.min(1, dt * 0.15); SKYU.uCover.value = skyCover;
  const w = 0.012 + 0.05 * (typeof windAmt === 'number' ? windAmt : 0), ang = typeof wxAng === 'number' ? wxAng : 0;
  if (!reduced) { SKYU.uWind.value.x += Math.cos(ang) * w * dt; SKYU.uWind.value.y += Math.sin(ang) * w * dt; }
  SKYU.uNight.value = nightAmt; SKYU.uT.value = time;
  SKYU.uSun.value.copy(_sk.copy(sun.position).sub(sun.target.position)).normalize();
  sunBall();
}

if (window.__farmTest) window.__sunBall = () => { const s = SUN_BALL.disk, v = s.position.clone().project(cam); return { vis: s.visible, op: +s.material.opacity.toFixed(2), ndc: [+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(3)], pos: s.position.toArray().map((q) => +q.toFixed(1)), drop: +curveDrop(s.position.x, s.position.z).toFixed(1) }; };
