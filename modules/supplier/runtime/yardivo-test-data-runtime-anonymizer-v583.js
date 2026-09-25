(function(){
'use strict';
if(window.__YARDIVO_TEST_DATA_RUNTIME_ANONYMIZER_V583__)return;
window.__YARDIVO_TEST_DATA_RUNTIME_ANONYMIZER_V583__=true;

const COUNT=262;
function aliasSupplier(v){
  v=String(v||'').trim();
  if(!v)return v;
  if(/^Dobavljač\s+\d+$/i.test(v))return v.replace(/^dobavljač/i,'Dobavljač');
  let h=2166136261;
  for(let i=0;i<v.length;i++){h^=v.charCodeAt(i);h=Math.imul(h,16777619)}
  return 'Dobavljač '+((h>>>0)%COUNT+1);
}
function neutralLocationForWarehouse(w){
  w=String(w||'').toUpperCase();
  if(/^W1/.test(w))return'Lokacija 1';
  if(/^W2/.test(w))return'Lokacija 2';
  return'';
}
function cleanObject(o){
  if(!o||typeof o!=='object')return false;
  let changed=false;
  for(const k of ['supplier','supplierName','supplier_name','vendor','vendorName','vendor_name']){
    if(Object.prototype.hasOwnProperty.call(o,k)&&o[k]){
      const n=aliasSupplier(o[k]);
      if(n!==o[k]){o[k]=n;changed=true}
    }
  }
  if(o.warehouse){
    const loc=neutralLocationForWarehouse(o.warehouse);
    for(const k of ['location','locationName','location_name']){
      if(Object.prototype.hasOwnProperty.call(o,k)&&o[k]&&loc&&o[k]!==loc){o[k]=loc;changed=true}
    }
  }
  return changed;
}
function cleanArray(a){
  if(!Array.isArray(a))return false;
  let c=false;a.forEach(x=>{if(cleanObject(x))c=true});return c;
}
function run(){
  let ann=false,inc=false,tr=false;
  try{if(typeof announcements!=='undefined')ann=cleanArray(announcements)}catch(_){}
  try{if(typeof incidents!=='undefined')inc=cleanArray(incidents)}catch(_){}
  try{if(typeof trucks!=='undefined')tr=cleanArray(trucks)}catch(_){}
  try{if(ann&&typeof saveAnnouncements==='function')saveAnnouncements()}catch(_){}
  try{if(inc&&typeof saveIncidents==='function')saveIncidents()}catch(_){}
  try{if(tr&&typeof saveTrucks==='function')saveTrucks()}catch(_){}
  if(ann||inc||tr){
    try{window.YardivoSupabase?.syncNow?.()}catch(_){}
    try{window.dispatchEvent(new CustomEvent('yardivo:test-data-anonymized'))}catch(_){}
  }
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(run,700));
window.addEventListener('yardivo:data-synced',()=>setTimeout(run,120));
window.addEventListener('yardivo:login',()=>setTimeout(run,800));
window.YardivoTestDataAnonymizerV583={run,aliasSupplier};
})();
