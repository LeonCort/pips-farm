import os, sys
VAR=sys.argv[1] if len(sys.argv)>1 else 'van'
assert VAR in ('near','van')
here=os.path.dirname(os.path.abspath(__file__)); F=lambda f: open(os.path.join(here,f)).read()
src=open(os.path.join(here,'../farm/game.js')).read()
def cut(a,b,incl_b=False):
    i=src.index(a); j=src.index(b,i)
    if incl_b: j=src.index('\n',j)+1
    return src[i:j]
A=src[:src.index('/* ---------- rules ---------- */')]
C=cut('/* ---------- sound: the supplied kit ---------- */','/* coop fence around the hens */')
D=cut('/* a pile is a list of item meshes','/* ---------- producers ---------- */')
E=src[src.index('function walkTo('):]; E=E[:E.index('\n')+1]
G=cut('/* ---------- camera and input ---------- */','/* ---------- loop ---------- */').replace("const KEY = 'pip-farm-shop-v1';","const KEY = 'pip-farm-care-v1';")
H=cut('/* ---------- loop ---------- */','const near = (x, z, r)',True)
P=cut('  if (pad) {\n','  /* the crate refills').replace('new T.Mesh(coinGeo, MAT)','new T.Mesh(heartGeo, heartMat)')
I=cut('  /* flying items */','function frame(',True)
assert I.count('const g = inHouse ? null : goal();')==1
I=I.replace('const g = inHouse ? null : goal();','const g = inHouse && !inBarn && !inStore && !barnGoal() ? null : guideGoal();')
C=C.replace("[-7.5, 6.2, 'tree']", "[-9.8, 6.0, 'tree']")
C=C.replace('d < 13 ? PAL.seaShallow : d < 24', 'd < 16 ? PAL.seaShallow : d < 28').replace('Math.abs(x) / 11, Math.abs(z) / 7.6', 'Math.abs(x) / 17, Math.abs(z) / 11.6').replace('new T.PlaneGeometry(36, 28, 48, 38)', 'new T.PlaneGeometry(54, 42, 66, 52)')
import re
C=re.sub(r"\[\[-10, -6, 'pine'\].*?\]\]\.forEach", "[[-6.2, -12.8, 'pine'], [7.9, -12.3, 'pine'], [-16.4, -7.6, 'pine'], [-17.6, -3.0, 'tree'], [-17.6, 3.0, 'pine'], [2.6, -13.9, 'tree'], [-7.6, 12.6, 'pine'], [-9.2, 12.0, 'pine'], [-6.0, 13.2, 'pine'], [-2.0, 13.4, 'tree'], [5.4, 12.4, 'tree'], [12.6, 9.8, 'pine'], [16.4, 6.2, 'pine'], [20.6, 6.4, 'tree'], [20.8, -6.6, 'pine'], [15.2, -9.6, 'pine'], [-5.2, -3.8, 'tree'], [5.2, 3.9, 'tree'], [-5.0, 3.6, 'pine'], [5.0, -3.9, 'pine']].forEach", C, count=1, flags=re.S)
G=G.replace('-10.3, 10.3', '-16.3, 16.3').replace('-6.9, 6.9', '-10.9, 10.9')
H=H.replace('-10.3, 10.3', '-16.3, 16.3').replace('-6.9, 6.9', '-10.9, 10.9').replace('let menuT = 0,', 'let actT = 0, menuT = 0,')
C=C.replace('(Math.abs(cx - 3.6) < 0.5 && cz > 1 && cz < 7)', '(Math.abs(cx - 3.6) < 0.5 && cz > 1 && cz < 11.8)', 1)
C=C.replace('/* soft, layered foliage','const leafs = [];\n/* soft, layered foliage',1)
assert 'const leafs = [];' in C
out=A+F('rules.js')+F('expand0.js')+C+F('items.js')+D+F('pip2.js')+E+F('world.js')+F('animal2.js')+F('life.js')+F('sky.js')+F('family.js')+F('extras.js')+F('pet2.js')+F('weather.js')+F('town.js')+F('econ0.js')+F('market.js')+F('guest2.js')+F('hours.js')+F('cozy.js')+F('restyle.js')+F('interior.js')+F('polish.js')+F('farmlook.js')+F('marketlook.js')+F('barn.js')+F('editor.js')+F('haul.js')+F('robots.js')+F('pets.js')+F('store.js')+F('catalog.js')+F('home.js')+F('island.js')+F('spot.js')+F('stock.js')+F('layout.js')+F('econ.js')+F('expand.js')+F('loft.js')+F('tut.js')+F('queue.js')+F('buymode.js')+F('mobile.js')+F('gfx.js')+G+H+F('step.js')+F('life_step.js')+P+I+F('start.js')
out=out.replace("'__VARIANT__'", repr(VAR))
assert out.count('camFocus.lerp(pip.position, 1 - Math.exp(-dt * 4));')==1; out=out.replace('camFocus.lerp(pip.position, 1 - Math.exp(-dt * 4));','/* the camera keeps up closely, so it stops with Pip instead of gliding on after the finger lifts */ camFocus.lerp(pip.position, 1 - Math.exp(-dt * 10)); if (inBarn) camFocus.z = Math.min(camFocus.z, BI.z + 0.9); if (inStore) camFocus.z = Math.min(camFocus.z, SI.z + 1.2);')
assert out.count('const k = (aspect < 1 ? 1.5 : 1.15) * (1 - 0.7 * dressT);')==1; out=out.replace('const k = (aspect < 1 ? 1.5 : 1.15) * (1 - 0.7 * dressT);','const k = (aspect < 1 ? 1.5 : 1.15) * (1 - 0.7 * dressT) * (inBarn ? 1.22 : 1);')
assert out.count('function houseStep(dt) {')==1; out=out.replace('function houseStep(dt) {','function houseStep(dt) {\n  if (inBarn) { lastP.copy(pip.position); return; }')
for a,b in [("[16.4, 6.2, 'pine']","[17.6, 9.4, 'pine']"),("[20.6, 6.4, 'tree']","[22.0, 3.6, 'tree']")]+([("[20.8, -6.6, 'pine']","[17.0, -10.0, 'pine']")] if VAR=='near' else []):
    assert out.count(a)==1; out=out.replace(a,b)
open(os.path.join(here,'care.js'),'w').write(out)
print(VAR, len(out))
# the dressing room replaces the farm render while the wardrobe is open
s=open(os.path.join(here,'care.js')).read()
assert s.count('  renderer.render(sc, cam);\n')==1
s=s.replace('  renderer.render(sc, cam);\n','  if (ED.on) edRender(dt); else renderer.render(sc, cam);\n')
open(os.path.join(here,'care.js'),'w').write(s)
# curved world: curve.js goes in right after THREE is known, before any material compiles; small hooks elsewhere
s=open(os.path.join(here,'care.js')).read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a,s.count(a)); s=s.replace(a,b)
rep("if (!T) { $('nogl').hidden = false; return; }\n","if (!T) { $('nogl').hidden = false; return; }\n"+F('curve.js')+"\n")
rep('sun.target.position.copy(camFocus);\n','sun.target.position.copy(camFocus); curveFrame(aspect < 1 ? 1.15 : 1, dt); skyFrame(dt);\n')
rep('/* ---------- camera and input ---------- */', F('clouds.js') + '\n/* ---------- camera and input ---------- */')
rep('if (ray.ray.intersectPlane(groundPlane, tmpV))','if (curveHit(ray.ray, tmpV))')
rep('tmpV.set(wx, wy, wz).project(cam)','tmpV.set(wx, wy - curveDrop(wx, wz), wz).project(cam)',2)
rep('sc.fog.near = 28 - 20 * fogAmt; sc.fog.far = 70 - 42 * fogAmt;','{ const fN = curveLive() ? CURVE.fogNear : 28, fF = curveLive() ? Math.max(CURVE.fogFar, fN + 4) : 70; sc.fog.near = fN * (1 - 0.714 * fogAmt); sc.fog.far = fF * (1 - 0.6 * fogAmt); }')
rep('renderer.render(thumbScene, thumbCam);','{ const cs0 = CURVE.u.strength.value; CURVE.u.strength.value = 0; renderer.render(thumbScene, thumbCam); CURVE.u.strength.value = cs0; }')
rep("const waterVS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';","const waterVS = CURVE_GLSL + 'varying vec2 vUv; void main(){ vUv = uv; vec4 cw = modelMatrix * vec4(position, 1.0); cw.y -= worldCurveDrop(cw.xyz); gl_Position = projectionMatrix * viewMatrix * cw; }';")
rep('l.position.set(LAMP_AT[i][0], 1.6, LAMP_AT[i][1]);','l.position.set(LAMP_AT[i][0], 1.6 - curveDrop(LAMP_AT[i][0], LAMP_AT[i][1]), LAMP_AT[i][1]);')
rep('const pw = b.w + 0.5, pd = b.d + 0.5, geo = new T.PlaneGeometry(pw, pd);','const pw = b.w + 0.5, pd = b.d + 0.5, geo = new T.PlaneGeometry(pw, pd, Math.ceil(pw), Math.ceil(pd));')
rep('let wg = new T.PlaneGeometry(160, 160, 40, 40);','let wg = new T.PlaneGeometry(160, 160, 56, 56);')
open(os.path.join(here,'care.js'),'w').write(s)
# rain look (rain.js): painted puddles, wet ground, splashes, drips, streaks, rain gear; lamps light up on dark rainy days
s=open(os.path.join(here,'care.js')).read()
rep('function weatherTest() {', F('rain.js') + '\nfunction weatherTest() {')
rep('cozyStep(dt); polishStep(dt);', 'cozyStep(dt); polishStep(dt); rainLate();')
open(os.path.join(here,'care.js'),'w').write(s)
# first day tutorial (tut.js): new saves only; small gates in the store door, the barn pad, the arrow and the start
s=open(os.path.join(here,'care.js')).read()
rep('state = hot || load() || fresh();','state = hot || load() || tutFresh(fresh());')
rep('  barnReady = true; barnInit();\n','  barnReady = true; barnInit(); tutInit();\n')
rep('const g = inHouse && !inBarn && !inStore && !barnGoal() ? null : guideGoal();','const g = inHouse && !inBarn && !inStore && !barnGoal() && !tutArrowIn() ? null : guideGoal();')
rep('const nextBPad = () => BPADS.find((p) => !barnS().owned[p.id]) || null;','const nextBPad = () => tutOn() ? null : qPad(\'h\', BPADS);')
rep('const ok = !inHouse && freeHands && stillOn(storeRing, dt);','const ok = !inHouse && freeHands && !(tutOn() && !tutAt(\'buy\')) && stillOn(storeRing, dt);')
open(os.path.join(here,'care.js'),'w').write(s)
# unlock queues (queue.js): prices and order from the queue, gear paid with hearts
s=open(os.path.join(here,'care.js')).read()
rep('const upCost = (u) => Math.round(u.base * Math.pow(u.g, state.lv[u.id]));','const upCost = (u) => qGearCost(u) || Math.round(u.base * Math.pow(u.g, state.lv[u.id]));')
rep('const nextSPad = () => { for (const p of SPADS) if (!sOwn(p.id)) return p; return null; };','const nextSPad = () => qPad(\'c\', SPADS);')
rep('can = o && o.cost && shop().coins >= o.cost - paid','can = o && o.cost && purse(o) >= o.cost - paid')
rep("drawIcon(x, 'coin', 50, 98, 0.72); x.fillStyle = PAL.ink; x.font = '700 52px Fredoka","drawIcon(x, o.gear ? 'heart' : 'coin', 50, 98, 0.72); x.fillStyle = PAL.ink; x.font = '700 52px Fredoka")
rep('if (onlyAfford && shop().coins < left)','if (onlyAfford && purse(q.o) < left)')
rep('  if (on && still && shop().coins > 0) {','  if (on && still && purse(o) > 0) {')
rep('amt = Math.min(shop().coins, left, Math.max(1, Math.ceil(o.cost * dt / 1.4)));\n    shop().coins -= amt;','amt = Math.min(purse(o), left, Math.max(1, Math.ceil(o.cost * dt / 1.4)));\n    spend(o, amt);')
rep('if (on && still && shop().coins <= 0 && !s.poor && o.cost)','if (on && still && purse(o) <= 0 && !s.poor && o.cost)')
rep('const f = clamp(shop().coins / Math.max(1, c.left), 0, 1)','const f = clamp(purse(c.o) / Math.max(1, c.left), 0, 1)')
open(os.path.join(here,'care.js'),'w').write(s)

# buy mode (buymode.js): the camera lifts over one part of the island; drawn right before the picture
s=open(os.path.join(here,'care.js')).read()
rep('  if (window.__camTop) {','  if (buyCam(dt)) {} else if (window.__camTop) {')
open(os.path.join(here,'care.js'),'w').write(s)

# high quality light (rays.js): god rays, bloom, shafts, motes, halos, golden glow; the picture goes through fxFrame
s=open(os.path.join(here,'care.js')).read()
rep('/* ---------- camera and input ---------- */', F('rays.js') + '\n/* ---------- camera and input ---------- */')
rep('\nfunction curveDrop(x, z)', '\n' + F('cloudchunk.js') + '\nfunction curveDrop(x, z)')
rep('  if (ED.on) edRender(dt); else renderer.render(sc, cam);\n', '  if (ED.on) edRender(dt); else fxFrame(dt);\n')
open(os.path.join(here,'care.js'),'w').write(s)
