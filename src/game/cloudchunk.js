/* cloud shadows (rays.js): the sun's light is dimmed by a drifting cloud texture. The chunk is patched here, before any
   program compiles (three caches built-in programs by type, not by source); uCloudK stays 0 unless the effect is on */
const CLOUDU = { uCloudK: { value: 0 }, uCloudOff: { value: new T.Vector2() }, uCloudThr: { value: 0.55 }, uCamW: { value: new T.Matrix4() } };
{ const SC = T.ShaderChunk, a = 'directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;';
  if (SC.lights_fragment_begin.indexOf(a) >= 0 && SC.lights_pars_begin.indexOf('uniform bool receiveShadow;') >= 0) {
    SC.lights_pars_begin = SC.lights_pars_begin.replace('uniform bool receiveShadow;', 'uniform bool receiveShadow;\nuniform float uCloudK, uCloudThr; uniform vec2 uCloudOff; uniform mat4 uCamW;\nfloat cldH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat cldN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(cldH(i), cldH(i + vec2(1.0, 0.0)), f.x), mix(cldH(i + vec2(0.0, 1.0)), cldH(i + vec2(1.0, 1.0)), f.x), f.y); }\nfloat cloudShade(vec3 vp) { if (uCloudK <= 0.0) return 1.0; vec3 w = (uCamW * vec4(vp, 1.0)).xyz; vec2 p = w.xz * 0.11 + uCloudOff * 4.0; float n = 0.57 * cldN(p) + 0.29 * cldN(p * 2.03 + 5.2) + 0.14 * cldN(p * 4.1 + 1.7); return 1.0 - uCloudK * smoothstep(uCloudThr, uCloudThr + 0.16, n); }');
    SC.lights_fragment_begin = SC.lights_fragment_begin.replace(a, a + '\n\t\tdirectLight.color *= cloudShade( geometry.position );');
    const ob = T.Material.prototype.onBuild; T.Material.prototype.onBuild = function (p, r) { if (ob) ob.call(this, p, r); Object.assign(p.uniforms, CLOUDU); };
  } else console.warn('fx: light chunk changed, no cloud shadows');
}
