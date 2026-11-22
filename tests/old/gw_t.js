const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
 await p.addInitScript(()=>{ window.__farmTest=1; localStorage.setItem('pips-avatar','{"skin":1,"hs":6}'); localStorage.setItem('pips-fps','60');
   const owned={}; ['hen3','pig1','pig2','house-hen','tractor','help-water','hay','sheep1','cow1','sheep2'].forEach(k=>owned[k]=1);
   localStorage.setItem('pip-farm-care-v1', JSON.stringify({v:1,coins:3000,total:0,paid:{},owned,shop:{coins:0,total:0,owned:{},paid:{}},lv:{speed:4,bag:2,farm:0,guests:0},sound:false,moved:true,ctrl:'tap',clock:480*0.3,tut:{done:1}})); });
 await p.goto('file://'+__dirname+'/care/test.html'); await p.waitForTimeout(3500);
 const ev=(f,a)=>p.evaluate(f,a);
 console.log('gardenOn', await ev(()=>__pets.ev('gardenOn()')), 'gwell', await ev(()=>__pets.ev('JSON.stringify([gwell.on, GW_PICK, WELL])')));
 for (const [nm,x,z] of [['gw',12.6,-5.35],['well',+process.argv[2]||5.3,+process.argv[3]||-1.4]]) {
   await ev(([x,z])=>{ __pets.ev('carry.items.slice().forEach(m=>{carry.take(m.userData.type); m.parent&&m.parent.remove(m);})'); __pip.position.set(x,0,z); __farmTest.go(x,z); },[x,z]);
   console.log('cleared', await ev(()=>__pets.ev('carry.items.length+"/"+cap()'))); await p.waitForTimeout(6000); console.log(nm, await ev(()=>__pets.ev('carry.items.map(m=>m.userData.type).join()')), await ev(()=>__pets.ev('JSON.stringify([+pip.position.x.toFixed(2),+pip.position.z.toFixed(2)])')));
 }
 console.log('errs',errs.slice(0,4)); await b.close(); })();
