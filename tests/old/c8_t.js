module.exports=async({p,tp,shot,ev,wait})=>{
 await tp(0,-3); await wait(800);
 await p.click('#menuBtn'); await wait(500); await shot('menu');
 for (let i=0;i<3;i++){ await p.click('#drawBtn'); await wait(200); const lab=await ev(()=>document.getElementById('drawBtn').getAttribute('aria-label')); await p.click('#menuClose'); await wait(900); console.log(lab,'calls',await ev(()=>__ed.info()), JSON.stringify(await ev(()=>[CURVE.detail,CURVE.fogNear,CURVE.fogFar]))); await shot('dr'+i); await p.click('#menuBtn'); await wait(300);}
};
