
(function(){
'use strict';
if(window.__YARDIVO_HOME_LOCATION_STABILITY_FINAL_V583__)return;
window.__YARDIVO_HOME_LOCATION_STABILITY_FINAL_V583__=true;

function refresh(){
  try{window.YardivoLocationLock?.apply?.()}catch(_){}
}
window.addEventListener('yardivo:master-data-changed',()=>setTimeout(refresh,30));
window.addEventListener('yardivo:data-synced',()=>setTimeout(refresh,100));
window.addEventListener('yardivo:login',()=>setTimeout(refresh,120));
document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,120));
window.addEventListener('load',()=>setTimeout(refresh,350));
window.YardivoHomeLocationFinalV583={refresh};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-home-location-selector-final-fix';
})();
