module.exports=async({p,tp,shot,ev,wait})=>{ await tp(4,-10); await wait(1000);
 const vis=()=>ev(()=>[document.getElementById('curveBtn').hidden, document.getElementById('fpsMeter').hidden, JSON.stringify([CURVE.strength,CURVE.pitch,CURVE.dist,CURVE.fogNear,CURVE.fogFar,CURVE.detail])]);
 console.log('before', await vis());
 await p.click('#menuBtn'); await wait(300); await shot('menu2'); await p.click('#devBtn'); await wait(200); await p.click('#menuClose'); await wait(600); console.log('dev on', await vis()); await shot('dev');
 await p.click('#menuBtn'); await wait(300); await p.click('#drawBtn'); await wait(200); await p.click('#menuClose'); await wait(400); console.log('draw low', await vis(), 'calls', await ev(()=>__ed.info()));
};
