module.exports=async({p,tp,shot,ev,wait})=>{
 const cfg=[['old',{pitch:49,dist:14.4,ahead:-0.3,on:false}],['oldcam+bend',{pitch:49,dist:14.4,ahead:-0.3,on:true}],['new flat',{pitch:33,dist:15.5,ahead:1.4,on:false}],['new',{pitch:33,dist:15.5,ahead:1.4,on:true}],['new fog30',{fogFar:30,fogNear:16}]];
 await tp(0,-3); await wait(800);
 for (const [n,c] of cfg) { await ev((c)=>Object.assign(CURVE,c),c); await wait(700); console.log(n,'calls',await ev(()=>__ed.info())); }
};
