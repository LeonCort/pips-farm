const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1000,height:700}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{ window.__farmTest=1; localStorage.setItem('pips-avatar','{"skin":1,"hs":6}');
   localStorage.setItem('pip-farm-care-v1', JSON.stringify({v:1,coins:3000,total:0,paid:{},owned:{hen3:1},shop:{coins:500,total:0,owned:{},paid:{}},lv:{speed:4,bag:2,farm:0,guests:0},sound:false,moved:true,ctrl:'tap',clock:480*0.3})); });
 await p.goto('file://'+__dirname+'/care/test.html'); await p.waitForTimeout(3000);
 const tp=async(x,z,w)=>{ await p.evaluate(([x,z])=>{ __farmTest.go(x,z); const P=window.__pip; P.position.x=x; P.position.z=z; },[x,z]); await p.waitForTimeout(w); };
 await tp(-10.4,-1.6,2500); console.log('carry after grain', await p.evaluate(()=>__farmTest.carry()));
 await tp(-10.4,1.6,2500); console.log('carry after water', await p.evaluate(()=>__farmTest.carry()));
 await tp(-12.75,0,3000); console.log('carry at pen', await p.evaluate(()=>__farmTest.carry()), 'boxes', JSON.stringify(await p.evaluate(()=>__farmTest.boxes())));
 await p.screenshot({path:__dirname+'/shots/play.png'}); console.log('errs',errs); await b.close(); })();
