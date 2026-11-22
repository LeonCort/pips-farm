module.exports=async({p,tp,shot,ev,wait})=>{
 for (const [x,z] of [[0,-3],[10,3],[-12,-2]]) { await tp(x,z); await wait(1200); console.log(x,z,'calls',await ev(()=>__ed.info())); }
};
