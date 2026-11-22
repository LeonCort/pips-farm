const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 const sizes=JSON.parse(process.argv[2]||'[1]'), reload=process.argv[3]==='load';
 await p.addInitScript((s0)=>{ window.__farmTest=1; localStorage.setItem('pips-avatar','{"skin":1,"hs":6}'); localStorage.setItem('pips-fps','60');
   if(!localStorage.getItem('pip-farm-care-v1')) localStorage.setItem('pip-farm-care-v1', JSON.stringify({v:1,coins:3000,total:0,paid:{},owned:{hen3:1},shop:{coins:500,total:0,owned:{},paid:{}},lv:{speed:4,bag:2,farm:0,guests:0},sound:false,moved:true,ctrl:'tap',clock:480*0.3,store:{size:s0,pend:[],furn:{},deco:{},paid:{}}})); }, reload?sizes[0]:0);
 await p.goto('file://'+__dirname+'/care/test.html'); await p.waitForTimeout(3000);
 const W=(f,a)=>p.evaluate(f,a); const sleep=t=>p.waitForTimeout(t);
 if(!reload){ await W(()=>__walk.inside()); await sleep(1500); await W(()=>__walk.inside(false)); await sleep(1500); }
 const HO=(await W(()=>__walk.b())).HO;
 const walk=async(pts)=>{ for(const [x,z] of pts){ await W(([x,z])=>__walk.tap(x,z),[HO[0]+x,HO[1]+z]); let pr=null; for(let i=0;i<30;i++){ await sleep(500); const q=await W(()=>__farmTest.pip()); if(pr&&Math.hypot(q[0]-pr[0],q[1]-pr[1])<0.02) break; pr=q; } } const q=await W(()=>__farmTest.pip()); return [q[0]-HO[0],q[1]-HO[1]]; };
 const R={bed:[[0,-3.5],[0,-5.3],[-1.7,-5.7]], kitchen:[[0,2.2],[3.5,2.2]], lounge:[[0,-2.2],[3.5,-2.2]], east:[[0,-5.3],[5.5,-5.3],[8.7,-5.3],[8.7,-3]], west:[[0,-5.3],[-5.5,-5.3],[-8.7,-5.3],[-8.7,-3]], study:[[0,-2.2],[-3.5,-2.2]]};
 const goal={bed:[-1.7,-5.7],kitchen:[3.5,2.2],lounge:[3.5,-2.2],east:[8.7,-3],west:[-8.7,-3],study:[-3.5,-2.2]};
 for (const n of sizes) {
   if(!reload){ await W((n)=>{ const S=__walk.S(); S.size=n; },n); await sleep(800); }
   await W(()=>__walk.inside()); await sleep(1500);
   const out=[]; for(const k of Object.keys(R)){ await W(()=>{const h=__walk.b().HO; __walk.place(h[0],h[1]+3);}); const q=await walk(R[k]); out.push(k+':'+(Math.hypot(q[0]-goal[k][0],q[1]-goal[k][1])<0.5?'yes':'no('+q.map(v=>v.toFixed(1))+')')); }
   console.log((reload?'load ':'buy ')+'size',n,out.join(' '));
   await W(()=>{const h=__walk.b().HO; __walk.place(h[0],h[1]+3);}); await walk(R.bed); await sleep(800);
   await p.screenshot({path:__dirname+'/shots/wk_'+(reload?'L':'B')+n+'.png'});
   await W(()=>__walk.inside(false)); await sleep(1500);
 }
 console.log('errs',errs.slice(0,4)); await b.close(); })();
