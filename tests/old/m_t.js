module.exports=async({p,tp,shot,ev,wait})=>{
 await tp(10.4, 4.2);
 for (let i=0;i<30;i++){ await wait(1000); const g=await ev(()=>__farmTest.guests()); if (/wait/.test(g)) { console.log(i,g); break; } }
 await wait(500); await shot('m_counter');
};
