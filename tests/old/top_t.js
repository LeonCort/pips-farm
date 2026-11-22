const { chromium } = require('playwright');
// usage: node top_t.js tag '{"x":14,"z":-3,"h":18}' '<save json or "">' '<js to eval after load>'
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
 const tag=process.argv[2]||'top'; const v=JSON.parse(process.argv[3]||'{"x":14,"z":-3,"h":18}'); const save=process.argv[4]||''; const js=process.argv[5]||'';
 await p.addInitScript((save)=>{ window.__farmTest=1; localStorage.setItem('pips-avatar','{"skin":1,"hs":6}'); localStorage.setItem('pips-fps','60');
   localStorage.setItem('pip-farm-care-v1', save || JSON.stringify({v:1,coins:3000,total:0,paid:{},owned:{hen3:1,pig1:1,pig2:1,'house-hen':1,'help-water':1,cow1:1,sheep1:1,sheep2:1,horse1:1,carrot:1,hay:1,tractor:1},shop:{coins:500,total:0,owned:{tree1:1,tree2:1,tree3:1,'stall-egg':1,'stall-apple':1,'stall-milk':1,'stall-cake':1,bakery:1},paid:{}},lv:{speed:4,bag:2,farm:0,guests:0},sound:false,moved:true,ctrl:'tap',clock:480*0.3})); },save);
 await p.goto('file://'+__dirname+'/care/test.html'); await p.waitForTimeout(3500);
 if (js) console.log('eval:', await p.evaluate((js)=>{ try { return String(window.__ev(js)); } catch(e) { return 'ERR '+e.message; } }, js));
 if (v.h) { await p.evaluate((v)=>window.__ev(`(()=>{ const b0=buyCam; buyCam=function(dt){ const k=b0(dt); cam.position.set(${v.x},${v.h},${v.z}+${v.h}*${v.t||0.35}); cam.lookAt(${v.x},0,${v.z}); cam.far=300; cam.updateMatrixWorld(); CURVE.u.strength.value=0; CURVE.u.horD.value=1e6; sc.fog.near=400; sc.fog.far=600; arrow.visible=false; sun.position.set(${v.x}-10,10,${v.z}+7.5); sun.target.position.set(${v.x},0,${v.z}); return true; }; return 1; })()`),v); }
 await p.waitForTimeout(v.wait||1500); await p.screenshot({path:__dirname+'/shots/'+tag+'.png'});
 console.log('errs',errs.slice(0,5)); await b.close(); })();
