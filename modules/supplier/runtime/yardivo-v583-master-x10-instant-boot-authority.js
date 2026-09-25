(function(){
'use strict';
if(window.__YARDIVO_MASTER_X10_INSTANT_BOOT_AUTHORITY__)return;
window.__YARDIVO_MASTER_X10_INSTANT_BOOT_AUTHORITY__=true;
const MASTER='yardivo_master_data_registry_v583';
const CACHE='yardivo_master_boot_cache_v583';
const BASE='https://rskticdbiovvgyocpzoc.supabase.co';
const APIKEY='sb_publishable_NWRcS2n-8GxF8qL7wXbZ-Q_-jIyfGoy';
const EDGE=BASE+'/functions/v1/yardivo-sync';
function parse(v){try{return JSON.parse(v||'null')}catch(_){return null}}
function normalized(d){return d&&Array.isArray(d.locations)&&Array.isArray(d.warehouses)&&Array.isArray(d.suppliers)}
function hasData(d){return normalized(d)&&(d.locations.length||d.warehouses.length||d.suppliers.length||Array.isArray(d.responsible_people)&&d.responsible_people.length)}
function current(){return parse(localStorage.getItem(MASTER))||{}}
function cacheWrite(d){if(!normalized(d))return;try{localStorage.setItem(CACHE,JSON.stringify(d))}catch(_){}}
function install(d,source){
 if(!normalized(d))return false;
 const cur=current();
 /* Never replace an active local Master edit with an asynchronous bootstrap response. */
 if(source==='server'&&hasData(cur))return false;
 try{localStorage.setItem(MASTER,JSON.stringify(d));cacheWrite(d)}catch(_){return false}
 try{window.dispatchEvent(new CustomEvent('yardivo:master-data-ready',{detail:{source}}))}catch(_){}
 try{window.dispatchEvent(new CustomEvent('yardivo:master-data-changed',{detail:{source:'master-x10-'+source,bootstrap:true}}))}catch(_){}
 return true;
}
/* Synchronous first paint from last verified server snapshot. Canonical writes still go to Supabase. */
const cached=parse(localStorage.getItem(CACHE));
if(normalized(cached)&&!hasData(current()))install(cached,'cache');
/* Keep the read-through cache current without turning it into a second source of truth. */
window.addEventListener('yardivo:data-synced',()=>cacheWrite(current()));
window.addEventListener('yardivo:master-data-changed',()=>cacheWrite(current()));
function tokenFromStorage(){
 try{
  const raw=localStorage.getItem('sb-rskticdbiovvgyocpzoc-auth-token');
  const d=parse(raw);return String(d?.access_token||d?.currentSession?.access_token||'');
 }catch(_){return''}
}
async function earlyServerMaster(){
 if(hasData(current()))return;
 const token=tokenFromStorage();if(!token)return;
 try{
  const r=await fetch(EDGE,{method:'POST',headers:{apikey:APIKEY,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({action:'bootstrap',clientId:'master-x10-boot'})});
  if(!r.ok)return;
  const d=await r.json();
  const row=(Array.isArray(d?.state)?d.state:[]).find(x=>String(x?.key||'')===MASTER&&!x?.deleted);
  const master=parse(row?.value_json);
  if(normalized(master)&&!hasData(current()))install(master,'server');
 }catch(_){}
}
earlyServerMaster();
window.YardivoMasterInstantBootV583={ready:()=>hasData(current()),refresh:earlyServerMaster};
})();
