
(function(){
'use strict';

const MASTER_KEY='yardivo_master_data_registry_v583';

function master(){
  try{
    const raw=localStorage.getItem(MASTER_KEY);
    const d=raw?JSON.parse(raw):null;
    if(d&&Array.isArray(d.locations)&&Array.isArray(d.warehouses))return d;
  }catch(e){}
  try{
    const d=window.YardivoMasterDataV583?.all?.();
    if(d&&Array.isArray(d.locations)&&Array.isArray(d.warehouses))return d;
  }catch(e){}
  return {locations:[],warehouses:[]};
}

function session(){
  try{return (typeof currentSession!=='undefined'?currentSession:window.currentSession)||null}
  catch(e){return window.currentSession||null}
}

function role(){
  const s=session();
  let r=String(s?.role||'').trim().toLowerCase();
  if(r==='management'||r==='voditelj')r='manager';
  if(r==='zalihe')r='inventory';
  if(r==='prijam')r='reception';
  if(r==='porta')r='gate';
  return r;
}

function canSwitchLocation(){
  return ['admin','inventory'].includes(role());
}

function validLocation(v){
  const id=String(v||'').trim();
  if(!id)return false;
  return master().locations.some(x=>x&&x.active!==false&&String(x.id)===id);
}

function locationLabel(loc){
  const id=String(loc||'').trim();
  return master().locations.find(x=>x&&x.active!==false&&String(x.id)===id)?.name||id;
}

function persistSession(s){
  if(!s)return;
  try{
    if(typeof currentSession!=='undefined')currentSession=s;
    window.currentSession=s;
  }catch(e){}
  try{
    if(s.rememberMe){
      if(typeof safeStorage!=='undefined'&&safeStorage?.setItem)safeStorage.setItem('yardivo_remembered_session',JSON.stringify(s));
      else localStorage.setItem('yardivo_remembered_session',JSON.stringify(s));
    }else{
      if(typeof safeSessionStorage!=='undefined'&&safeSessionStorage?.setItem)safeSessionStorage.setItem('studenac_demo_session',JSON.stringify(s));
      else sessionStorage.setItem('studenac_demo_session',JSON.stringify(s));
    }
  }catch(e){}
}

function setActiveWarehouse(next){
  const v=String(next||'ALL');
  try{
    activeWarehouse=v;
    window.activeWarehouse=v;
    if(typeof safeStorage!=='undefined'&&safeStorage?.setItem){
      safeStorage.setItem('studenac_active_warehouse',v);
      safeStorage.setItem('yardivo_active_warehouse',v);
    }else{
      localStorage.setItem('studenac_active_warehouse',v);
      localStorage.setItem('yardivo_active_warehouse',v);
    }
  }catch(e){}
}

function warehousesForActiveRole(loc){
  const id=String(loc||'').trim();
  const d=master();
  return d.warehouses
    .filter(x=>x&&x.active!==false&&String(x.location_id)===id)
    .map(x=>x.id);
}

function rebuildSelect(sel,current,locked){
  const d=master();
  const rows=d.locations.filter(x=>x&&x.active!==false);

  if(locked && validLocation(current)){
    sel.innerHTML=`<option value="${current}">${locationLabel(current)}</option>`;
    sel.value=current;
    sel.disabled=true;
    sel.setAttribute('aria-disabled','true');
    sel.title='Lokacija je dodijeljena korisničkom računu od strane Admina.';
    return;
  }

  sel.innerHTML='<option value="">Odaberi lokaciju...</option>'+
    rows.map(x=>`<option value="${x.id}">${x.name}</option>`).join('');
  sel.disabled=false;
  sel.removeAttribute('aria-disabled');
  sel.title='Odaberi lokaciju.';
  if(validLocation(current))sel.value=current;
  else sel.value='';
}

function configureHomeLocation(){
  const s=session();
  const sel=document.getElementById('homeLocationSelect');
  if(!s||!sel)return false;

  const current=String(s.location||'').trim();

  if(canSwitchLocation()){
    rebuildSelect(sel,current,false);

    /* IMPORTANT: do not auto-replace an unselected/invalid location with LOC001/LOC002.
       The user's explicit choice is the only source of truth. */
    if(!validLocation(current)){
      if(current){
        s.location=null;
        persistSession(s);
      }
      setActiveWarehouse('ALL');
      try{window.updateHomeLocationUI?.()}catch(e){}
      return false;
    }

    const allowed=warehousesForActiveRole(current);
    let aw='';
    try{aw=String(typeof activeWarehouse!=='undefined'?activeWarehouse:window.activeWarehouse||'')}catch(e){}
    setActiveWarehouse(allowed.includes(aw)?aw:(allowed[0]||'ALL'));

    try{window.yardivoRefreshAllWarehouseUi?.()}catch(e){}
    try{window.syncWarehouseSelectorsToLoginLocation?.()}catch(e){}
    try{window.updateHomeLocationUI?.()}catch(e){}
    return true;
  }

  /* Assigned-location roles keep their account location, but it must exist in Master Data. */
  if(!validLocation(current)){
    rebuildSelect(sel,'',true);
    setActiveWarehouse('ALL');
    try{window.updateHomeLocationUI?.()}catch(e){}
    return false;
  }

  rebuildSelect(sel,current,true);
  const allowed=warehousesForActiveRole(current);
  let aw='';
  try{aw=String(typeof activeWarehouse!=='undefined'?activeWarehouse:window.activeWarehouse||'')}catch(e){}
  setActiveWarehouse(allowed.includes(aw)?aw:(allowed[0]||'ALL'));

  try{window.yardivoRefreshAllWarehouseUi?.()}catch(e){}
  try{window.syncWarehouseSelectorsToLoginLocation?.()}catch(e){}
  try{window.updateHomeLocationUI?.()}catch(e){}
  document.getElementById('homeLocationWarning')?.classList.remove('show');
  return true;
}

document.addEventListener('change',function(e){
  const sel=e.target;
  if(sel?.id!=='homeLocationSelect')return;

  const s=session();
  if(!s)return;

  if(!canSwitchLocation()){
    const assigned=String(s.location||'').trim();
    if(validLocation(assigned))sel.value=assigned;
    return;
  }

  const chosen=String(sel.value||'').trim();

  if(!chosen){
    s.location=null;
    persistSession(s);
    setActiveWarehouse('ALL');
    try{window.updateHomeLocationUI?.()}catch(e){}
    return;
  }

  if(!validLocation(chosen)){
    /* Never clear a valid previous selection because another stale renderer changed the DOM. */
    const previous=String(s.location||'').trim();
    if(validLocation(previous))sel.value=previous;
    return;
  }

  s.location=chosen;
  persistSession(s);

  try{
    if(typeof safeStorage!=='undefined'&&safeStorage?.setItem)safeStorage.setItem('yardivo_last_location',chosen);
    else localStorage.setItem('yardivo_last_location',chosen);
  }catch(e){}

  const allowed=warehousesForActiveRole(chosen);
  setActiveWarehouse(allowed[0]||'ALL');

  try{window.yardivoRefreshAllWarehouseUi?.()}catch(e){}
  try{window.syncWarehouseSelectorsToLoginLocation?.()}catch(e){}
  try{window.updateHomeLocationUI?.()}catch(e){}

  document.getElementById('homeLocationWarning')?.classList.remove('show');
},true);

document.addEventListener('input',function(e){
  const sel=e.target;
  if(sel?.id!=='homeLocationSelect'||canSwitchLocation())return;
  const s=session();if(!s)return;
  const assigned=String(s.location||'').trim();
  if(validLocation(assigned))sel.value=assigned;
},true);

window.addEventListener('yardivo:master-data-changed',()=>setTimeout(configureHomeLocation,20));
window.addEventListener('yardivo:data-synced',()=>setTimeout(configureHomeLocation,80));
window.addEventListener('yardivo:login',()=>setTimeout(configureHomeLocation,80));
window.addEventListener('load',()=>setTimeout(configureHomeLocation,300));
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-home-target],#homeMenu,[data-view]')){
    setTimeout(configureHomeLocation,30);
  }
},true);

window.YardivoLocationLock={
  apply:configureHomeLocation,
  validLocation,
  locationLabel,
  warehousesForLocation:warehousesForActiveRole
};
})();
