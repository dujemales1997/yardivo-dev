(function(){
'use strict';
if(window.__YARDIVO_MASTER_X10_INSTANT_BOOT_AUTHORITY__)return;
window.__YARDIVO_MASTER_X10_INSTANT_BOOT_AUTHORITY__=true;

const service=()=>window.YardivoMasterDataService;
service()?.installCachedIfEmpty?.();

async function refresh(){
  const s=service();
  if(!s)return false;
  if(s.hasData?.())return true;
  try{await s.refresh?.(true)}catch(_){}
  return !!s.hasData?.();
}

window.addEventListener('yardivo:login',()=>setTimeout(refresh,0));
window.addEventListener('load',()=>setTimeout(refresh,250),{once:true});
window.addEventListener('yardivo:data-synced',()=>service()?.cacheWrite?.());
window.addEventListener('yardivo:master-data-changed',()=>service()?.cacheWrite?.());

window.YardivoMasterInstantBootV583={
  ready:()=>!!service()?.hasData?.(),
  refresh
};
})();