
(function(){
'use strict';
function master(){try{return JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')}catch(_){return {locations:[],warehouses:[]}}}
function wh(id){return (master().warehouses||[]).find(x=>x&&x.active!==false&&String(x.id)===String(id))||null}
function locationForWarehouse(id){const w=wh(id);return w?String(w.location_id||''):''}
window.yardivoCanonicalLocationForWarehouseV583=locationForWarehouse;
/* Legacy global helper, when present, must resolve through Master instead of W1/W2 prefixes. */
try{window.locationForWarehouse=locationForWarehouse}catch(_){}
window.YardivoMasterAuthorityV583={master,warehouse:wh,locationForWarehouse};
})();
