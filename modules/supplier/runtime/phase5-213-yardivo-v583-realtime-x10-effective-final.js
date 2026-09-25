
(function(){
'use strict';
window.YARDIVO_DEV_BUILD='20260912-dev-v5.8.3-realtime-x10';
window.YardivoRealtimeX10V583={
  version:'20260912-dev-v5.8.3-realtime-x10',
  targetMs:3000,
  coreSafetyMs:2200,
  supplierSafetyMs:2300,
  status:()=>({
    build:window.YARDIVO_DEV_BUILD,
    targetMs:3000,
    core:window.YardivoRealtimeLatencyV583?.status?.()||null,
    supplierBusy:window.YardivoSupplierLiveSync?.busy?.()||false,
    realtimeBus:window.YardivoRealtimeBusV583?.stats?.()||null
  }),
  force:async()=>{
    const a=window.YardivoRealtimeLatencyV583?.force?.();
    const b=window.YardivoSupplierLiveSync?.syncNow?.();
    return await Promise.allSettled([a,b]);
  }
};
})();
