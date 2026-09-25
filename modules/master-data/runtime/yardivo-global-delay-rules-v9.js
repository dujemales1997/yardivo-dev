(function(){
'use strict';
if(window.__YARDIVO_GLOBAL_DELAY_RULES_V9__)return;
window.__YARDIVO_GLOBAL_DELAY_RULES_V9__=true;

function applyGlobal(){
  try{
    const api=window.YardivoDelayRulesV1;
    if(!api?.get||!api?.apply)return;
    const rules=api.get();
    window.YARDIVO_GLOBAL_DELAY_RULES={...rules};
    /* Reapply unchanged rules after warehouse/location changes so no view can
       fall back to an old hard-coded or warehouse-specific threshold. */
    try{TOLERANCE_MIN=Number(rules.graceMinutes)}catch(_){}
    try{LATE_GRACE_MINUTES=Number(rules.graceMinutes)}catch(_){}
  }catch(_){}
}
[
 'yardivo:context-changed',
 'yardivo:warehouse-changed',
 'yardivo:location-changed',
 'yardivo:view-opened',
 'yardivo:data-synced'
].forEach(ev=>window.addEventListener(ev,applyGlobal));

document.addEventListener('change',e=>{
  const id=String(e.target?.id||'');
  if(['globalWarehouse','yscWarehouseSelect','globalLocationV583','homeLocationSelect','yscLocationSelect'].includes(id)){
    setTimeout(applyGlobal,0);
  }
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyGlobal,{once:true});else applyGlobal();
window.YardivoGlobalDelayRulesV9={apply:applyGlobal};
})();
