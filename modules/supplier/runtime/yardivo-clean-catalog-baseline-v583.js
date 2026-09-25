(function(){
'use strict';
if(window.__YARDIVO_CLEAN_CATALOG_BASELINE_V583__)return;
window.__YARDIVO_CLEAN_CATALOG_BASELINE_V583__=true;
const KEY='yardivo_master_data_registry_v583';

function master(){
  try{
    const d=JSON.parse(localStorage.getItem(KEY)||'{}');
    if(d&&Array.isArray(d.suppliers)&&Array.isArray(d.locations)&&Array.isArray(d.warehouses))return d;
  }catch(_){}
  return {suppliers:[],locations:[],warehouses:[]};
}
function suppliers(){
  return master().suppliers
    .filter(x=>x&&x.active!==false&&String(x.name||'').trim())
    .map(x=>({id:String(x.id||''),name:String(x.name).trim(),active:true}));
}
function refreshOverview(){
  try{window.YardivoOverviewMaster?.render?.()}catch(_){}
  try{window.YardivoOverviewFullChart?.render?.()}catch(_){}
  try{window.dispatchEvent(new CustomEvent('yardivo:overview-refresh'))}catch(_){}
}
window.addEventListener('yardivo:master-data-changed',()=>requestAnimationFrame(refreshOverview));
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="overview"],[data-home-target="overview"]')){
    requestAnimationFrame(refreshOverview);
  }
},true);

window.YardivoSupplierCatalogV583={
  all:suppliers,
  count:()=>suppliers().length,
  refresh:refreshOverview
};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-clean-app-baseline';
})();
