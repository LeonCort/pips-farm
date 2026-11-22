const { chromium } = require('playwright');
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await b.newPage({viewport:{width:1180,height:820}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
 const save=require('fs').readFileSync(__dirname+'/save1.json','utf8');
 await p.addInitScript((save)=>{ window.__farmTest=1; localStorage.setItem('pips-avatar','{"skin":1,"hs":6}'); localStorage.setItem('pips-fps','60'); localStorage.setItem('pip-farm-care-v1', save); },save);
 await p.goto('file://'+__dirname+'/care/test.html'); await p.waitForTimeout(3000);
 const ev=(s)=>p.evaluate((s)=>{ try { return JSON.stringify(window.__ev(s)); } catch(e) { return 'ERR '+e.message; } },s);
 const tp=async(x,z,w)=>{ await ev(`pip.position.set(${x},0,${z}); target.set(${x},0,${z}); 1`); await p.waitForTimeout(w||1500); };
 // 1) fill the wool basket, Pip walks past it and picks up
 console.log('fill', await ev(`const B=penBasket('sheep'); for(let k=0;k<6;k++) B.pile.add(mk('wool')); [B.x,B.z,B.prod.x,B.prod.z]`));
 const bp=JSON.parse(await ev(`[PEN_BASKETS.sheep.prod.x, PEN_BASKETS.sheep.prod.z]`)); await tp(bp[0],bp[1],2500);
 console.log('carry', await ev(`carry.items.map(m=>m.userData.type).join(',')`), 'basket', await ev(`PEN_BASKETS.sheep.pile.items.length`));
 // 2) to the wool stall's drop ring
 const d=JSON.parse(await ev(`sDrop('wool')`)); await tp(d[0],d[1],2500);
 console.log('after stall: carry', await ev(`carry.items.length`), 'wool shelf', await ev(`stalls.wool.shelf.items.length`));
 // 3) guests buy wool: wait
 await tp(10,0.5,200); await p.waitForTimeout(50000);
 console.log('wool shelf after 25s', await ev(`stalls.wool.shelf.items.length`), 'stall money', await ev(`stalls.wool.money.n`), 'coins', await ev(`shop().coins`), 'guests', await ev(`customers.map(c=>c.type+':'+c.st).join(' ')`));
 // 4) the wool robot: switch it on, refill basket
 await ev(`for(let k=0;k<6;k++) PEN_BASKETS.sheep.pile.add(mk('wool')); state.bots=state.bots||{}; state.bots['s:wool']=true; 1`);
 await p.waitForTimeout(40000);
 console.log('robot', await ev(`stalls.wool.stocker.st`), 'basket', await ev(`PEN_BASKETS.sheep.pile.items.length`), 'shelf', await ev(`stalls.wool.shelf.items.length`));
 // 5) portions: a hen eats three times from one scoop
 console.log('portions', await ev(`(()=>{ const pen=pens.hen; while(pen.food.items.length) pen.food.take(); pen.food.add(mk('grain')); const r=[]; for(let k=0;k<4;k++){ const m=pen.food.take('grain'); r.push(m?(m.scale.x.toFixed(2)):'none'); r.push(pen.food.count('grain')); } return r.join(' '); })()`));
 await p.screenshot({path:__dirname+'/shots/econ_t.png'});
 console.log('errs',errs.slice(0,5)); await b.close(); })();
