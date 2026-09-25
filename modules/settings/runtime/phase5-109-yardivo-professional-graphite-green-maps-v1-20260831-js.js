
(function(){
 function applyGraphiteMapScene(){
   if(document.documentElement.dataset.yardivoUx==='original')return;
   try{
     const e=window.__YARDIVO_MYYARD_ENGINE__,T=window.__YARDIVO_THREE_MODULE__;
     if(!e||!T)return;
     e.scene.background=new T.Color(0x263c31);
     e.scene.fog=new T.FogExp2(0x263c31,.0065);
     e.renderer.toneMappingExposure=1.18;
   }catch(_){}
 }
 window.addEventListener('load',()=>setTimeout(applyGraphiteMapScene,1500));
 /* disabled by yardivo-myyard-flicker-fix-v1: competing periodic lighting writer */
})();
