(()=>{'use strict';
if(window.__YARDIVO_RECEIVING_MODAL_QR_FINAL_V585__)return;
window.__YARDIVO_RECEIVING_MODAL_QR_FINAL_V585__=true;

/* Compatibility bridge only. QR/status ownership lives in modules/receiving/service.js. */
window.yardivoReceivingQrEnabledForWarehouseV585=function(warehouse){
  return window.YardivoReceivingService?.enabledFor?.(warehouse)??true;
};
window.YardivoReceivingService?.install?.();
})();