
(()=>{'use strict';
if(window.__YV_ACCOUNT_WAREHOUSE_SCOPE_FINAL__)return;
window.__YV_ACCOUNT_WAREHOUSE_SCOPE_FINAL__=true;

const TARGETS=['globalWarehouse','incWarehouse'];
let applying=false;
let timer=0;
let observer=null;

function normRole(v){
  v=String(v||'').trim().toLowerCase();
  if(v==='prijam')return'reception';
  if(v==='porta'||v==='portir')return'gate';
  if(v==='zalihe'||v==='upravljanje zalihama')return'inventory';
  if(v==='voditelj'||v==='management')return'manager';
  return v;
}
function session(){try{return window.currentSession||{}}catch(_){return{}}}
function role(){return normRole(session()?.app_role||session()?.role||'')}
function master(){
  try{
    const d=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}');
    return d&&typeof d==='object'?d:{locations:[],warehouses:[]};
  }catch(_){return{locations:[],warehouses:[]}}
}
function ids(v){
  return Array.isArray(v)?v.map(x=>String(typeof x==='object'?(x?.id||''):x||'').trim()).filter(Boolean):[];
}
function isAllWarehouses(){
  const s=session();
  return role()==='admin'||s?.all_warehouses===true||String(s?.warehouse||'').toUpperCase()==='ALL';
}
function allowedWarehouseIds(){
  const s=session();
  if(isAllWarehouses())return null;
  const set=new Set(ids(s?.warehouses||s?.warehouse_ids));
  const one=String(s?.warehouse||s?.warehouse_id||'').trim();
  if(one&&one!=='ALL')set.add(one);
  return set;
}
function activeLocation(){
  const s=session();
  const direct=String(
    document.getElementById('globalLocationV583')?.value||
    s?.location||
    window.YardivoAppStateV583?.location?.()||
    ''
  ).trim();
  return direct&&direct!=='ALL'?direct:'';
}
function rows(forIncident=false){
  const d=master();
  let list=(Array.isArray(d.warehouses)?d.warehouses:[]).filter(w=>w&&w.active!==false);
  const allowed=allowedWarehouseIds();
  if(allowed)list=list.filter(w=>allowed.has(String(w.id)));

  const loc=activeLocation();
  if(loc)list=list.filter(w=>String(w.location_id||'')===loc);

  return list;
}
function esc(v){
  return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function signature(list,kind){
  return JSON.stringify([kind,...list.map(w=>[String(w.id),String(w.name||w.id),String(w.location_id||'')])]);
}
function rebuild(id){
  const sel=document.getElementById(id);
  if(!sel)return;
  const list=rows(id==='incWarehouse');
  const sig=signature(list,id);
  const old=String(sel.value||'');

  if(sel.dataset.yvAccountScopeSig!==sig){
    applying=true;
    try{
      if(id==='incWarehouse'){
        sel.innerHTML='<option value="">Odaberi...</option>'+
          list.map(w=>`<option value="${esc(w.id)}">${esc(w.name||w.id)}</option>`).join('');
      }else{
        sel.innerHTML=list.length
          ?list.map(w=>`<option value="${esc(w.id)}">${esc(w.name||w.id)}</option>`).join('')
          :'<option value="" disabled>Nema dodijeljenih skladišta</option>';
      }
      sel.dataset.yvAccountScopeSig=sig;
    }finally{applying=false}
  }

  const valid=new Set(list.map(w=>String(w.id)));
  let wanted=valid.has(old)?old:'';

  if(!wanted){
    const current=String(
      window.YardivoAppStateV583?.warehouse?.()||
      window.activeWarehouse||
      ''
    );
    if(valid.has(current))wanted=current;
    else if(id==='globalWarehouse'&&list.length)wanted=String(list[0].id);
  }

  if(id==='incWarehouse'){
    if(wanted&&sel.value!==wanted)sel.value=wanted;
    else if(!wanted&&sel.value!=='')sel.value='';
  }else if(wanted&&sel.value!==wanted){
    sel.value=wanted;
  }

  /* One assigned warehouse: show only that warehouse, no misleading alternatives. */
  sel.disabled=list.length<=1;
}
function apply(){
  if(applying)return;
  TARGETS.forEach(rebuild);
}
function schedule(delay=0){
  clearTimeout(timer);
  timer=setTimeout(()=>{timer=0;apply()},delay);
}
function bindObserver(){
  if(observer)return;
  observer=new MutationObserver(muts=>{
    if(applying)return;
    if(muts.some(m=>TARGETS.includes(m.target?.id)||TARGETS.includes(m.target?.parentElement?.id))){
      schedule(0);
    }
  });
  TARGETS.forEach(id=>{
    const sel=document.getElementById(id);
    if(sel)observer.observe(sel,{childList:true,subtree:false});
  });
}

['yardivo:login','yardivo:master-data-ready','yardivo:master-data-changed','yardivo:context-changed'].forEach(ev=>{
  window.addEventListener(ev,()=>schedule(0));
});
document.addEventListener('click',e=>{
  if(e.target?.closest?.('[data-view="incidents"],[data-home-target="incidents"]'))schedule(0);
},true);
document.addEventListener('focusin',e=>{
  if(TARGETS.includes(e.target?.id))schedule(0);
},true);

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{apply();bindObserver()},{once:true});
}else{apply();bindObserver()}
window.addEventListener('load',()=>{apply();bindObserver()},{once:true});

window.YardivoAccountWarehouseScopeFinalV583={
  refresh:apply,
  rows:()=>rows(false).map(x=>({id:x.id,name:x.name,location_id:x.location_id}))
};
})();
