const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const tag=process.argv[2], clock=+process.argv[3], fx=process.argv[4]||'all', spot=JSON.parse(process.argv[5]||'[0,2]'), vw=JSON.parse(process.argv[6]||'[1180,820]');
 const p=await b.newPage({viewport:{width:vw[0],height:vw[1]}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log('C',m.text().slice(0,300))});
 await p.addInitScript(([c,fx])=>{ window.__farmTest=1; localStorage.setItem('pips-avatar','{"skin":1,"hs":6}'); localStorage.setItem('pips-fps','60');
   const keys=['rays','bloom','shafts','motes','halos','grade','sharp','clouds','glints','evening','ao','ground','grass']; const o={}; keys.forEach(k=>o[k]= (fx==='all'||fx==='normall') ? true : fx.split(',').includes(k));
   localStorage.setItem('pips-q', (fx==='none'||fx==='normall')?'norm':'hi'); localStorage.setItem('pips-fx', JSON.stringify(o));
   localStorage.setItem('pip-farm-care-v1', JSON.stringify({v:1,coins:3000,total:0,paid:{},owned:{hen3:1},shop:{coins:500,total:0,owned:{"tree2":1,"sign1":1,"stall-egg":1,"tree3":1,"stock-egg":1,"stall-apple":1,"sell-egg":1,"helper1":1,"stock-apple":1,"sign2":1,"sell-apple":1,"bakery":1,"stall-milk":1,"cashier":1,"stock-milk":1,"sell-milk":1,"sign3":1,"stall-cake":1,"helper2":1,"stock-cake":1,"sell-cake":1},paid:{}},lv:{speed:4,bag:2,farm:0,guests:0},sound:false,moved:true,ctrl:'tap',clock:480*c})); },[clock,fx]);
 await p.goto('file://'+__dirname+'/care/test.html'); await p.waitForTimeout(2500);
 await p.evaluate(([x,z])=>{ __farmTest.go(x,z); __pip.position.x=x; __pip.position.z=z; },spot); await p.waitForTimeout(2500);
 if(process.env.DBG) await p.evaluate(()=>{__fx.u.uDbg.value=1}); await p.waitForTimeout(300); await p.screenshot({path:__dirname+'/shots/'+tag+'.png'});
 if (process.argv[7]==='bench') { await p.evaluate(()=>{ document.querySelector('#fxBtn').click(); document.querySelector('[data-bench]').click(); }); await p.waitForFunction(()=>window.__fxBench,null,{timeout:1500000}); console.log(JSON.stringify(await p.evaluate(()=>window.__fxBench))); await p.screenshot({path:__dirname+'/shots/'+tag+'_bench.png'}); }
 if(errs.length) console.log(errs); await b.close(); })();
