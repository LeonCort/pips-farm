module.exports=async({p,tp,shot,ev,wait})=>{
 await tp(-2,4); await wait(1500); await shot('g1'); console.log('calls', await ev(()=>renderer ? 0 : 0).catch(()=>'?'));
 await p.setViewportSize({width:820,height:1180}); await tp(10,3); await wait(1500); await shot('g2');
 await ev(()=>__ed.open()); await wait(1500); await shot('ed');
};
