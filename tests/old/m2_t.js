module.exports=async({p,tp,shot,ev,wait})=>{
 await tp(10.4, 4.2);
 for (let i=0;i<30;i++){ await wait(1000); const g=await ev(()=>__farmTest.guests()); if (/wait/.test(g)) { console.log(i,g); break; } }
 await wait(500);
 console.log(await ev(()=>{ const out=[]; const v=new THREE.Vector3(); window.__pip.parent.traverse(o=>{ if(o.isSprite && o.renderOrder===5 && o.visible){ let vis=true; for(let q=o;q;q=q.parent) if(!q.visible) vis=false; o.getWorldPosition(v); out.push([vis, v.x.toFixed(1), v.y.toFixed(1), v.z.toFixed(1), __curve.scr(v.x,v.y,v.z).map(n=>n|0)]); } }); return JSON.stringify(out); }));
 await shot('m2');
};
