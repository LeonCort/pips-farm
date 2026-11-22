// usage: node b_t.js script.js  -- script gets (p, tp, shot, ev, wait)
const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1024,height:768}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1])); p.on('console',m=>{ if(m.type()==='error') errs.push('console: '+m.text()); });
 const owned = JSON.parse(process.env.OWNED||'{"hen3":1,"pig2":1,"house-hen":1,"tractor":1,"help-water":1,"hay":1,"sheep1":1,"cow1":1}');
 const clock = +(process.env.CLOCK||0.3);
 await p.addInitScript(([owned,clock,extra])=>{ window.__farmTest=1; localStorage.setItem('pips-avatar','{"skin":1,"hs":6}'); localStorage.setItem('pips-fps','60');
   localStorage.setItem('pip-farm-care-v1', JSON.stringify(Object.assign({v:1,coins:3000,total:0,paid:{},owned,lv:{speed:4,bag:2,farm:0,guests:0},sound:false,moved:true,ctrl:'tap',clock:480*clock},extra))); },[owned,clock,JSON.parse(process.env.EXTRA||'{}')]);
 await p.goto('file://'+__dirname+'/care/test.html'); await p.waitForTimeout(2500);
 const tp=(x,z)=>p.evaluate(([x,z])=>{ __farmTest.go(x,z); const P=window.__pip; P.position.x=x; P.position.z=z; },[x,z]);
 const shot=(n)=>p.screenshot({path:__dirname+'/shots/'+n+'.png'});
 const ev=(f,a)=>p.evaluate(f,a); const wait=(ms)=>p.waitForTimeout(ms);
 const fn=require(require('path').resolve(process.argv[2]));
 try { await fn({p,tp,shot,ev,wait}); } catch(e){ console.log('ERR',e.message); }
 console.log('errs',errs.slice(0,6)); await b.close(); })();
