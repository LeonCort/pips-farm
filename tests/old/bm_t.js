const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
 const save=require('fs').readFileSync(__dirname+'/save1.json','utf8').replace('"stall-wool":1,"stock-wool":1','"stall-wool":0');
 await p.addInitScript((save)=>{ window.__farmTest=1; localStorage.setItem('pips-avatar','{"skin":1,"hs":6}'); localStorage.setItem('pips-fps','60'); localStorage.setItem('pip-farm-care-v1', save); },save);
 await p.goto('file://'+__dirname+'/care/test.html'); await p.waitForTimeout(3000);
 const ev=(s)=>p.evaluate((s)=>{ try { return JSON.stringify(window.__ev(s)); } catch(e) { return 'ERR '+e.message; } },s);
 // make every coin item before the wool stall owned, so the wool stall is the coin head
 console.log(await ev(`(()=>{ for (const [id] of QUEUE.c) { if (id==='stall-wool') break; const sp=SPADS.find(q=>q.id===id); if (sp) { shop().owned[id]=true; sBuild(sp);} else if (Q_ISLE[id]) { const k=Q_ISLE[id], t=ISET_BY[k]; if(t) t.lots.forEach(l=>isleS()[l]=1); else isleX().pk[k]=1; } else if (Q_SIZE[id]) stS().size=Math.max(stS().size,Q_SIZE[id]); } shop().coins=2000; showSPad(); return [qHead('c'), sPad&&sPad.p.id]; })()`));
 await ev(`buyMode(true); 1`); await p.waitForTimeout(800); await ev(`bmArea(0, true); 1`); await p.waitForTimeout(2500);
 await p.screenshot({path:__dirname+'/shots/bm_top.png'});
 console.log(await ev(`bmList().filter(it=>it.id.indexOf('wool')>=0).map(it=>it.id+':'+it.area+':'+it.head).join(' ')`));
 const it=await ev(`(()=>{ const it=bmList().find(q=>q.id==='stall-wool'); bmSelect(it); return 1; })()`); await p.waitForTimeout(2500);
 await p.screenshot({path:__dirname+'/shots/bm_sel.png'});
 console.log('errs',errs.slice(0,5)); await b.close(); })();
