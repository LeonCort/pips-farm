const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
 const tag=process.argv[2]||'a'; const spots=JSON.parse(process.argv[3]||'[[-12.6,-2]]'); const clock=+(process.argv[4]||0.3);
 await p.addInitScript((c)=>{ window.__farmTest=1; localStorage.setItem('pips-avatar','{"skin":1,"hs":6}'); localStorage.setItem('pips-fps','60');
   localStorage.setItem('pip-farm-care-v1', JSON.stringify({v:1,coins:3000,total:0,paid:{},owned:{hen3:1},shop:{coins:500,total:0,owned:{"tree2":1,"sign1":1,"stall-egg":1,"tree3":1,"stock-egg":1,"stall-apple":1,"sell-egg":1,"helper1":1,"stock-apple":1,"sign2":1,"sell-apple":1,"bakery":1,"stall-milk":1,"cashier":1,"stock-milk":1,"sell-milk":1,"sign3":1,"stall-cake":1,"helper2":1,"stock-cake":1,"sell-cake":1},paid:{}},lv:{speed:4,bag:2,farm:0,guests:0},sound:false,moved:true,ctrl:'tap',clock:480*c})); },clock);
 const t0=Date.now(); p.on('console',m=>{if(m.type()==='error'||/THREE/.test(m.text()))console.log('C',m.text().slice(0,600))}); await p.goto('file://'+__dirname+'/care/test.html'); await p.waitForTimeout(3000); if(errs.length) console.log(errs);
 let i=0; for (const [x,z] of spots) { await p.evaluate(([x,z])=>{ __farmTest.go(x,z); const P=window.__pip; P.position.x=x; P.position.z=z; },[x,z]); await p.waitForTimeout(2500); await p.screenshot({path:__dirname+'/shots/'+tag+(i++)+'.png'}); }
 console.log('calls',await p.evaluate(()=>typeof renderer!=='undefined'?renderer.info.render.calls+' tris '+renderer.info.render.triangles:'?'),'errs',errs.slice(0,4)); await b.close(); })();
