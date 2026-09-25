
(()=>{'use strict';
const BUILD='20260915-dev-v5.8.3-header-context-settings-contrast-final';
function retireDuplicateContext(){
 for(const id of ['yardivoStableContextV583','yardivoGlobalContextV583']){const el=document.getElementById(id);if(el){el.hidden=true;el.setAttribute('aria-hidden','true')}}
}
function refresh(){retireDuplicateContext();try{window.YardivoHeaderHomeFinalV583?.refresh?.()}catch(_){}}
['yardivo:login','yardivo:context-changed','yardivo:master-data-changed','yardivo:data-synced'].forEach(ev=>window.addEventListener(ev,()=>requestAnimationFrame(refresh)));
document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(refresh),{once:true});
window.addEventListener('load',()=>setTimeout(refresh,120),{once:true});
window.YARDIVO_DEV_BUILD=BUILD;
})();
