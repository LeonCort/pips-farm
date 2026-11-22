module.exports=async({p,tp,shot,ev,wait})=>{
 for (const d of [22,20]) { await ev((d)=>{CURVE.detail=d;},d); for (const [i,[x,z]] of [[0,-3],[10,3],[-12,-2]].entries()) { await tp(x,z); await wait(900); console.log(d,x,z,'calls',await ev(()=>__ed.info())); if(i==0) await shot('d'+d); } }
};
