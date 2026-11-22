const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
 const tag=process.argv[2]||'st'; const spots=JSON.parse(process.argv[3]||'[[-12.4,0.5]]'); const fills=JSON.parse(process.argv[4]||'[]');
 await p.addInitScript(()=>{ window.__farmTest=1; localStorage.setItem('pips-avatar','{"skin":1,"hs":6}'); localStorage.setItem('pips-fps','60');
   localStorage.setItem('pip-farm-care-v1', JSON.stringify({v:1,coins:3000,total:0,paid:{},owned:{hen3:1,pig1:1,cow1:1,horse1:1,'carrot':1,'hay':1},shop:{coins:500,total:0,owned:{},paid:{}},lv:{speed:4,bag:2,farm:0,guests:0},sound:false,moved:true,ctrl:'tap',clock:480*0.3})); });
 await p.goto('file://'+__dirname+'/care/test.html'); await p.waitForTimeout(3000); if(errs.length) console.log(errs);
 console.log(await p.evaluate((f)=>{ return f.map(([a,t,n])=>window.__stock.fill(a,t,n)).join(',')+' | '+['hen','pig','cow'].map(a=>a+': '+window.__stock.spots(a)).join(' / '); },fills));
 let i=0; for (const [x,z] of spots) { await p.evaluate(([x,z])=>{ __farmTest.go(x,z); const P=window.__pip; P.position.x=x; P.position.z=z; },[x,z]); await p.waitForTimeout(2500); await p.screenshot({path:__dirname+'/shots/'+tag+(i++)+'.png'}); }
 console.log('boxes',JSON.stringify(await p.evaluate(()=>__farmTest.boxes())),'errs',errs.slice(0,4)); await b.close(); })();
