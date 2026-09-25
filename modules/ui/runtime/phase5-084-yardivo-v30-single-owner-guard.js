
(function(){
 'use strict';
 const legacy=['lyCanvas','yardivoReal3DHost','yardivoNative3D','yardivoV25Live','yardivoV26','yardivoWar3DHost','yardivoNativeWar3D','yardivoV25War'];
 function killLegacy(){legacy.forEach(id=>{const e=document.getElementById(id);if(e){e.style.setProperty('display','none','important');e.style.setProperty('visibility','hidden','important')}})}
 function refresh(){killLegacy();try{window.YardivoFinalYard?.live?.();window.YardivoFinalYard?.war?.()}catch(e){console.warn('YARDIVO final yard refresh',e)}}
 document.addEventListener('click',e=>{
   if(e.target.closest('[data-view="liveYard"],[data-home-target="liveYard"],#yardivoWarButton'))setTimeout(refresh,80);
 },true);
 window.addEventListener('load',()=>setTimeout(refresh,1300));
 setInterval(killLegacy,2500);
 window.YardivoSingleYardEngine={refresh};
})();
