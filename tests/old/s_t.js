module.exports=async({p,tp,shot,ev,wait})=>{
 await p.setViewportSize({width:820,height:1180}); await tp(0,4); await wait(1500); await shot('s_day');
 await ev(()=>__farmTest.weather('rain',true)); await wait(2500); await shot('s_rain');
 await ev(()=>__farmTest.weather('clear',true)); await ev(()=>__farmTest.dayAt(0.6)); await wait(2000); await shot('s_sunset');
 await ev(()=>__farmTest.dayAt(0.8)); await wait(2000); await shot('s_night');
 await p.click('#menuBtn'); await wait(300); await p.click('#devBtn'); await wait(300); await p.click('#menuClose'); await wait(500); await shot('s_dev');
};
