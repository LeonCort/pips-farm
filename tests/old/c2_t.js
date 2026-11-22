module.exports=async({p,tp,shot,ev,wait})=>{
 await ev(()=>{ Object.assign(window.CURVE,{fogNear:20,fogFar:42}); });
 await tp(0,-3); await wait(1500); await shot('f1');
 for (const [x,z] of [[4,-12],[-6,1],[9,-8],[0,-20]]) { const [sx,sy]=await ev(([x,z])=>__curve.scr(x,0,z),[x,z]); console.log('hit',x,z,'->',JSON.stringify(await ev(([a,b])=>__curve.hit(a,b),[sx,sy])), sx|0, sy|0); }
};
