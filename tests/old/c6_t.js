module.exports=async({p,tp,shot,ev,wait})=>{ await tp(0,-3); await wait(800); console.log(JSON.stringify(await ev(()=>__curve.diag())));
 await ev(()=>{CURVE.fogFar=10;CURVE.fogNear=5;}); await wait(500); console.log('fog10 calls',await ev(()=>__ed.info())); await shot('fog10'); };
