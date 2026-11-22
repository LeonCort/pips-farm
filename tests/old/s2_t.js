module.exports=async({p,tp,shot,ev,wait})=>{
 await p.setViewportSize({width:1180,height:820});
 await tp(4,-10); await wait(1500); await shot('t_day'); console.log(await ev(()=>JSON.stringify(__farmTest.wxState ? __farmTest.wxState() : 0)));
 await ev(()=>__farmTest.weather('rain',true)); await wait(2500); await shot('t_rain');
 await ev(()=>__farmTest.weather('clear',true)); await ev(()=>__farmTest.dayAt(0.6)); await wait(2500); await shot('t_sunset');
 await ev(()=>__farmTest.dayAt(0.8)); await wait(2500); await shot('t_night');
};
