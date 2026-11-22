const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{ window.__farmTest=1; localStorage.setItem('pips-avatar','{"skin":1,"hs":6}'); localStorage.setItem('pips-fps','60');
   localStorage.setItem('pip-farm-care-v1', JSON.stringify({v:1,coins:3000,total:0,paid:{},owned:{hen3:1,pig1:1,sheep1:1,sheep2:1,'help-water':1},bots:{'f:water':true},shop:{coins:0,total:0,owned:{},paid:{}},lv:{speed:4,bag:2,farm:0,guests:0},sound:false,moved:true,ctrl:'tap',clock:480*0.3,tut:{done:1}})); });
 await p.goto('file://'+__dirname+'/care/test.html'); await p.waitForTimeout(3500);
 const ev=(f,a)=>p.evaluate(f,a);
 console.log('spots', JSON.stringify(await ev(()=>__haul.waterSpots())), 'sheep->', JSON.stringify(await ev(()=>__haul.waterFor('sheep'))), 'hen->', JSON.stringify(await ev(()=>__haul.waterFor('hen'))));
 await ev(()=>{ __pip.position.set(5.3,0,-0.6); __farmTest.go(5.3,-1.3); }); await p.waitForTimeout(3000);
 await p.screenshot({path:__dirname+'/shots/well.png'});
 console.log('carry', await ev(()=>__pets.ev('carry.items.map(m=>m.userData.type).join()')));
 console.log('errs',errs.slice(0,4)); await b.close(); })();
