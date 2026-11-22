const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
 const milkStall=process.argv[2]==='milk';
 await p.addInitScript((milkStall)=>{ window.__farmTest=1; localStorage.setItem('pips-avatar','{"skin":1,"hs":6}'); localStorage.setItem('pips-fps','60');
   const so={"tree2":1,"sign1":1,"stall-egg":1,"stock-egg":1}; if(milkStall) so['stall-milk']=1;
   localStorage.setItem('pip-farm-care-v1', JSON.stringify({v:1,coins:3000,total:0,paid:{},owned:{hen3:1,pig1:1,cow1:1},bots:{'s:egg':true},shop:{coins:0,total:0,owned:so,paid:{}},lv:{speed:4,bag:2,farm:0,guests:0},sound:false,moved:true,ctrl:'tap',clock:480*0.3,tut:{done:1}})); }, milkStall);
 await p.goto('file://'+__dirname+'/care/test.html'); await p.waitForTimeout(3500);
 const ev=(f,a)=>p.evaluate(f,a);
 // park Pip far away at the farm, fill the crate with eggs and milk
 await ev(()=>{ __pip.position.set(-6,0,0); __farmTest.go(-6,0); __farmTest.fillCrate('egg',5); __farmTest.fillCrate('milk',4); });
 for (let i=0;i<22;i++){ await p.waitForTimeout(2500); const v=await ev(()=>__farmTest.van()); console.log(i, v, await ev(()=>JSON.stringify(__haul.stalls())), 'back', await ev(()=>__farmTest.back()), 'eggstall', await ev(()=>__bots.stalls.egg.shelf.items.length), 'money', await ev(()=>__farmTest.money()), await ev(()=>__farmTest.guests()), JSON.stringify(await ev(()=>__farmTest.shelves())));
   if(i===13){ await ev(()=>{ window.__camTop=[13.5,5,9,3]; }); await p.waitForTimeout(300); await p.screenshot({path:__dirname+'/shots/van_unload.png'}); await ev(()=>{ window.__camTop=null; }); } }
 console.log('errs',errs.slice(0,4)); await b.close(); })();
