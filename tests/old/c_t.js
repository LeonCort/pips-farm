module.exports=async({p,tp,shot,ev,wait})=>{
 const spots=[[0,6],[0,-3],[10,3],[-12,-2]];
 for (const [i,[x,z]] of spots.entries()) { await tp(x,z); await wait(1500); await shot('c'+i); }
 console.log('calls', await ev(()=>{ return window.CURVE.u.strength.value+' '+JSON.stringify(window.CURVE.u.origin.value); }));
 await ev(()=>{ window.CURVE.on=false; }); await tp(0,6); await wait(1200); await shot('flat');
};
