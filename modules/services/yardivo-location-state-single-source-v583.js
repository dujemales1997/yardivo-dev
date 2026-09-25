
(function(){
'use strict';
if(window.__YARDIVO_LOCATION_STATE_SINGLE_SOURCE_V583__)return;
window.__YARDIVO_LOCATION_STATE_SINGLE_SOURCE_V583__=true;

const MASTER_KEY='yardivo_master_data_registry_v583';
let refreshTimer=0;
let mdTimer=0;
let lastHomeSignature='';
let lastWarehouseSignature='';

function master(){
  try{
    const raw=localStorage.getItem(MASTER_KEY);
    const d=raw?JSON.parse(raw):null;
    if(d&&Array.isArray(d.locations)&&Array.isArray(d.warehouses))return d;
  }catch(_){}
  try{
    const d=window.YardivoMasterDataV583?.all?.();
    if(d&&Array.isArray(d.locations)&&Array.isArray(d.warehouses))return d;
  }catch(_){}
  return {locations:[],warehouses:[]};
}
function session(){
  try{return (typeof currentSession!=='undefined'?currentSession:window.currentSession)||null}
  catch(_){return window.currentSession||null}
}
function locObj(id,d=master()){
  id=String(id||'');
  return d.locations.find(x=>x&&x.active!==false&&String(x.id)===id)||null;
}
function locationId(){
  const s=session();
  const id=String(s?.location||'').trim();
  return locObj(id)?id:'';
}
function locationName(id=locationId()){
  return locObj(id)?.name||'';
}
function selectedLocationValid(){
  return !!locationId();
}
function persistSessionLocation(id){
  const s=session(); if(!s)return;
  s.location=id||null;
  try{
    if(typeof currentSession!=='undefined')currentSession=s;
    window.currentSession=s;
  }catch(_){}
  try{
    if(s.rememberMe){
      localStorage.setItem('yardivo_remembered_session',JSON.stringify(s));
    }else{
      sessionStorage.setItem('studenac_demo_session',JSON.stringify(s));
    }
  }catch(_){}
}
function homeAllowedLocations(d=master()){
  const s=session(),r=String(s?.role||s?.app_role||'').trim().toLowerCase();
  let rows=d.locations.filter(x=>x&&x.active!==false);
  if(r==='manager'||r==='management'){
    const fixed=String(s?.location||'').trim();
    if(fixed&&fixed!=='ALL')return rows.filter(x=>String(x.id)===fixed);
    const assigned=new Set((Array.isArray(s?.warehouses)?s.warehouses:[]).map(String));
    const ids=new Set(d.warehouses.filter(w=>assigned.has(String(w.id))).map(w=>String(w.location_id)));
    return rows.filter(x=>ids.has(String(x.id)));
  }
  return rows;
}
function homeSig(d=master()){
  return JSON.stringify(homeAllowedLocations(d).map(x=>[x.id,x.name]));
}
function whSig(d=master()){
  return JSON.stringify({
    l:d.locations.filter(x=>x.active!==false).map(x=>[x.id,x.name]),
    w:d.warehouses.filter(x=>x.active!==false).map(x=>[x.id,x.name,x.location_id])
  });
}

/* HOME selector: rebuild only if master data actually changed.
   This prevents visible flicker from repeated MutationObserver refreshes. */
function refreshHomeSelector(force=false){
  if(window.__YV_HOME_HEADER_MASTER_DWELL_FINAL__)return;
  const sel=document.getElementById('homeLocationSelect');
  if(!sel)return;
  const d=master(),sig=homeSig(d),id=locationId();

  if(force||sig!==lastHomeSignature){
    const before=id||String(sel.value||'');
    const rows=homeAllowedLocations(d);
    const isManager=['manager','management'].includes(String(session()?.role||session()?.app_role||'').trim().toLowerCase());
    const html=(isManager?'':'<option value="">Odaberi lokaciju...</option>')+
      rows.map(x=>`<option value="${x.id}">${x.name}</option>`).join('');
    if(sel.innerHTML!==html)sel.innerHTML=html;
    if(before&&rows.some(x=>String(x.id)===String(before)))sel.value=before;
    else if(rows.length)sel.value=String(rows[0].id);
    else sel.value='';
    sel.disabled=isManager&&rows.length<=1;
    lastHomeSignature=sig;
  }else if(id && sel.value!==id){
    sel.value=id;
  }

  const chosen=!!id,name=locationName(id);
  const big=document.getElementById('homeSelectedLocation');
  if(big){
    const txt=chosen?name.toUpperCase():'ODABERI LOKACIJU';
    if(big.textContent!==txt)big.textContent=txt;
    big.classList.toggle('selected',chosen);
  }
  const status=document.getElementById('homeLocationStatus');
  if(status){
    const txt=chosen?`Odabrano: ${name}`:'Lokacija nije odabrana';
    if(status.textContent!==txt)status.textContent=txt;
    status.classList.toggle('ready',chosen);
  }
}

/* MASTER DATA warehouse-location dropdown: rebuild only on actual master changes. */
function refreshWarehouseLocationDropdown(force=false){
  const sel=document.getElementById('ymdWarehouseLocation');
  if(!sel)return;
  const d=master(),sig=whSig(d);
  if(!force&&sig===lastWarehouseSignature)return;

  const current=String(sel.value||'');
  const html=d.locations.filter(x=>x.active!==false)
    .map(x=>`<option value="${x.id}">${x.name}</option>`).join('');
  if(sel.innerHTML!==html)sel.innerHTML=html;

  if(current&&locObj(current,d))sel.value=current;
  else if(locationId()&&locObj(locationId(),d))sel.value=locationId();
  else if(sel.options.length)sel.selectedIndex=0;

  lastWarehouseSignature=sig;
}

/* Dashboard and other visible location labels use one state source. */
function refreshVisibleLocationLabels(){
  const id=locationId(),name=locationName(id);

  const knownIds=[
    'dashboardLocation','dashLocation','currentLocation','selectedLocation',
    'activeLocation','dashboardLocationLabel','homeSelectedLocation'
  ];
  knownIds.forEach(x=>{
    const el=document.getElementById(x);
    if(!el)return;
    if(x==='homeSelectedLocation')return;
    const txt=id?name:'Lokacija nije odabrana';
    if(el.textContent!==txt)el.textContent=txt;
  });

  /* Generic dashboard fields that are clearly location-status labels. */
  document.querySelectorAll('#dashboard [data-location-label], #dashboard .location-label, #dashboard .dashboard-location').forEach(el=>{
    if(el.children.length)return;
    const txt=id?name:'Lokacija nije odabrana';
    if(el.textContent!==txt)el.textContent=txt;
  });

  /* Replace stale exact placeholder text only inside dashboard view. */
  document.querySelectorAll('#dashboard *').forEach(el=>{
    if(el.children.length)return;
    const t=String(el.textContent||'').trim();
    if(/^lokacija nije odabrana$/i.test(t)){
      const txt=id?name:'Lokacija nije odabrana';
      if(el.textContent!==txt)el.textContent=txt;
    }
  });
}

/* Authoritative helper overrides for every module that asks for current location. */
try{
  window.homeLocationChosen=selectedLocationValid;
  window.validLocation=function(v){return !!locObj(v)};
  window.locationLabel=function(v){return locObj(v)?.name||String(v||'')};
  window.locLabel=window.locationLabel;
}catch(_){}

/* Own selection capture: persist once, then refresh once. */
document.addEventListener('change',function(e){
  if(e.target?.id!=='homeLocationSelect')return;
  if(window.__YV_HOME_HEADER_MASTER_DWELL_FINAL__)return;
  let chosen=String(e.target.value||'').trim();
  const rr=String(session()?.role||session()?.app_role||'').trim().toLowerCase();
  if(rr==='manager'||rr==='management'){
    const rows=homeAllowedLocations(master());
    if(!rows.some(x=>String(x.id)===chosen))chosen=String(rows[0]?.id||'');
    e.target.value=chosen;
  }
  if(chosen && !locObj(chosen))return;
  persistSessionLocation(chosen);
  refreshHomeSelector(false);
  refreshVisibleLocationLabels();
},true);

/* Debounced global refresh; no continuous full-app redraw. */
function refreshAll(force=false){
  clearTimeout(refreshTimer);
  refreshTimer=setTimeout(()=>{
    refreshHomeSelector(force);
    refreshWarehouseLocationDropdown(force);
    refreshVisibleLocationLabels();
  },20);
}

window.addEventListener('yardivo:master-data-changed',()=>refreshAll(true));
window.addEventListener('yardivo:data-synced',()=>refreshAll(false));
window.addEventListener('yardivo:login',()=>refreshAll(true));
document.addEventListener('DOMContentLoaded',()=>refreshAll(true));
window.addEventListener('load',()=>refreshAll(true));

/* Very narrow observer: only Master Data subtree, debounced.
   No document.documentElement observer, which caused dropdown flicker. */
function installMasterObserver(){
  const root=document.getElementById('yardivoMasterDataRegistryV583');
  if(!root||root.__yardivoStableObserver)return;
  root.__yardivoStableObserver=true;
  new MutationObserver(()=>{
    clearTimeout(mdTimer);
    mdTimer=setTimeout(()=>{
      refreshWarehouseLocationDropdown(false);
      refreshVisibleLocationLabels();
    },120);
  }).observe(root,{childList:true,subtree:true});
}
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-home-target="dashboard"],[data-view="dashboard"],#dashboard')){
    setTimeout(refreshVisibleLocationLabels,30);
  }
  if(e.target.closest?.('#yardivoMasterDataRegistryV583,[data-view="settings"],[data-home-target="settings"]')){
    setTimeout(()=>{installMasterObserver();refreshWarehouseLocationDropdown(false)},40);
  }
},true);

setTimeout(installMasterObserver,250);
refreshAll(true);

window.YardivoLocationStateV583={
  id:locationId,
  name:locationName,
  valid:selectedLocationValid,
  refresh:()=>refreshAll(true)
};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-location-state-flicker-fix';
})();
