
(()=>{'use strict';
if(window.__YARDIVO_HEADER_CLEAN_CONTEXT_FINAL_V583__)return;
window.__YARDIVO_HEADER_CLEAN_CONTEXT_FINAL_V583__=true;
function clean(){const strip=document.getElementById('yvGlobalCapacityStrip');if(strip)strip.remove()}
['yardivo:master-data-changed','yardivo:data-synced','yardivo:login'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(clean,0)));
document.addEventListener('change',e=>{if(e.target?.id==='globalWarehouse'||e.target?.id==='globalLocation')setTimeout(clean,0)},true);
setTimeout(clean,0);
window.YARDIVO_DEV_BUILD='20260916-dev-v5.8.3-header-clean-location-warehouse-final';
})();
