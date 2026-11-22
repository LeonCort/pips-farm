const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
 const tag=process.argv[2]||'pen';
 await p.addInitScript(()=>{ window.__farmTest=1; localStorage.setItem('pips-avatar','{"skin":1,"hs":6}'); localStorage.setItem('pips-fps','60');
   const owned={}; ['hen3','pig1','pig2','house-hen','tractor','help-water','hay','sheep1','cow1','sheep2','cow2','house-pig','hen4','help-grain','horse1','house-sheep','house-cow','pig3','horse2','sheep3','help-hay','bull1','house-horse','cow3'].forEach(k=>owned[k]=1);
   localStorage.setItem('pip-farm-care-v1', JSON.stringify({v:1,coins:3000,total:0,paid:{},owned,shop:{coins:0,total:0,owned:{},paid:{}},lv:{speed:4,bag:2,farm:0,guests:0},sound:false,moved:true,ctrl:'tap',clock:480*0.3,tut:{done:1}})); });
 await p.goto('file://'+__dirname+'/care/test.html'); await p.waitForTimeout(3500); if(errs.length) console.log(errs);
 const ev=(f,a)=>p.evaluate(f,a);
 await ev(()=>__pets.ev('buyMode(true); BM.area=0; bmDist=()=>13; window.__bmUI=document.querySelectorAll(".bm, .bmBar")'));
 for (const [nm,cx,cz] of [['L',-10,-8.6],['R',10.5,-8.2]]) { await ev(([cx,cz])=>__pets.ev('BM_AREAS[0].x0='+(cx-1)+';BM_AREAS[0].x1='+(cx+1)+';BM_AREAS[0].cz='+cz+';BM.pan=0'),[cx,cz]); await p.waitForTimeout(2200); await p.screenshot({path:__dirname+'/shots/'+tag+'_'+nm+'.png'}); }
 console.log(await ev(()=>__pets.ev("JSON.stringify(['sheep','horse','cow','goat','bull'].map(a=>[a,animals.filter(o=>o.a===a).length,penBox(a)]))")));
 console.log('errs',errs.slice(0,4)); await b.close(); })();
