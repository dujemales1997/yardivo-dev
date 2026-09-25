(function(){
'use strict';
function apply(){
 const api=window.YardivoMyYardWebGL;
 const e=api&&window.__YARDIVO_MYYARD_ENGINE__;
 if(!e)return;
 try{
   const T=window.__YARDIVO_THREE_MODULE__;
   if(!T)return;
   e.scene.background=new T.Color(0xcfdad3);
   e.scene.fog=new T.FogExp2(0xcfdad3,.0065);
   e.renderer.toneMappingExposure=1.22;
   e.scene.traverse(o=>{
     if(!o.isMesh||!o.material)return;
     const hex=o.material.color?.getHex?.();
     if(hex===0x29332e)o.material.color.setHex(0x6f7d75);
     else if(hex===0x1c2320)o.material.color.setHex(0x4e5b54);
     else if(hex===0x343e39)o.material.color.setHex(0x7b8981);
   });
 }catch(_){}
}
function patch(){
 if(!window.YardivoMyYardWebGL||window.YardivoMyYardWebGL.__brightPatched)return;
 const old=window.YardivoMyYardWebGL.boot;
 window.YardivoMyYardWebGL.boot=async function(){const r=await old.apply(this,arguments);setTimeout(apply,50);return r};
 window.YardivoMyYardWebGL.__brightPatched=true;
 setTimeout(apply,100);
}
window.addEventListener('load',()=>setTimeout(patch,1200));
/* disabled by yardivo-myyard-flicker-fix-v1: competing periodic lighting writer */
})();
