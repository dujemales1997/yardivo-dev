(function(){
'use strict';
function master(){
  try{return JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')||{}}catch(_){return{}}
}
function session(){try{return window.currentSession||null}catch(_){return null}}
function activeLocation(){
  const s=session();
  const v=String(s?.location||window.YardivoAppStateV583?.location?.()||'').trim();
  return v==='ALL'?'':v;
}
function rows(){
  const d=master(),loc=activeLocation();
  const all=Array.isArray(d.warehouses)?d.warehouses.filter(w=>w&&w.active!==false):[];
  return loc?all.filter(w=>String(w.location_id)===loc):all;
}
function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
function label(w){return `${w.name||w.id}`;}
function rebuild(sel){
  if(!sel)return;
  const d=master();
  const locationIds=new Set((Array.isArray(d.locations)?d.locations:[]).map(x=>String(x?.id||'')).filter(Boolean));
  const ws=rows();
  const old=String(sel.value||'');
  let html='';
  if(ws.length){
    html=ws.map(w=>`<option value="${esc(w.id)}">${esc(label(w))}</option>`).join('');
  }else{
    html='<option value="" disabled>Nema konfiguriranih skladišta</option>';
  }
  sel.innerHTML=html;
  sel.disabled=!ws.length;
  const valid=ws.map(w=>String(w.id));
  if(valid.includes(old)&&!locationIds.has(old))sel.value=old;
  else {
    const current=String(window.YardivoAppStateV583?.warehouse?.()||window.activeWarehouse||'');
    if(valid.includes(current)&&!locationIds.has(current))sel.value=current;
    else if(valid.length)sel.value=valid[0];
  }
}
function sync(){
  /* globalWarehouse is owned by HomeHeaderMasterDwellFinal. */
  rebuild(document.getElementById('ygcWarehouseSelect'));
}
window.YardivoHeaderWarehouseAuthorityV583={sync};
['yardivo:login','yardivo:context-changed','yardivo:master-data-changed'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(sync,0)));
document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,0));
window.addEventListener('load',()=>setTimeout(sync,40));
})();
