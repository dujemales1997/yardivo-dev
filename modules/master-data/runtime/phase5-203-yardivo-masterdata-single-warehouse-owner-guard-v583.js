
(function(){
'use strict';
if(window.__YARDIVO_MASTERDATA_SINGLE_WAREHOUSE_OWNER_V583__)return;
window.__YARDIVO_MASTERDATA_SINGLE_WAREHOUSE_OWNER_V583__=true;
function enforce(){
  const legacy=document.getElementById('yardivoWarehouseAdmin');
  if(legacy) legacy.remove();
}
document.addEventListener('DOMContentLoaded',enforce,{once:true});
window.addEventListener('load',enforce,{once:true});
window.addEventListener('yardivo:login',enforce);
window.YardivoWarehouseOwnershipV583={
  owner:'MASTER PODACI',
  createWarehouse:'MASTER PODACI → SKLADIŠTA',
  configureRamps:'PRIJAM & RAMPE'
};
})();
