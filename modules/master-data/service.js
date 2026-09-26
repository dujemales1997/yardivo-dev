(function(){
'use strict';
if(window.YardivoMasterDataService?.owner==='modules/master-data/service.js')return;

const KEY='yardivo_master_data_registry_v583';
const CACHE='yardivo_master_boot_cache_v583';

function parse(value){
  try{return JSON.parse(value||'null')}catch(_){return null}
}
function read(){
  return parse(localStorage.getItem(KEY))||{};
}
function valid(data){
  return !!(data&&Array.isArray(data.locations)&&Array.isArray(data.warehouses)&&Array.isArray(data.suppliers));
}
function hasData(data=read()){
  return valid(data)&&(
    data.locations.length||
    data.warehouses.length||
    data.suppliers.length||
    (Array.isArray(data.responsible_people)&&data.responsible_people.length)
  );
}
function cacheWrite(data=read()){
  if(!valid(data))return false;
  try{localStorage.setItem(CACHE,JSON.stringify(data));return true}catch(_){return false}
}
function cached(){
  return parse(localStorage.getItem(CACHE));
}
function installCachedIfEmpty(){
  const data=cached();
  if(!valid(data)||hasData(read()))return false;
  try{
    localStorage.setItem(KEY,JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('yardivo:master-data-ready',{detail:{source:'cache'}}));
    window.dispatchEvent(new CustomEvent('yardivo:master-data-changed',{detail:{source:'master-service-cache',bootstrap:true}}));
    return true;
  }catch(_){return false}
}
async function refresh(force=false){
  if(!force&&hasData())return read();
  if(window.YardivoSync?.pull){
    try{await window.YardivoSync.pull()}catch(_){}
  }
  const data=read();
  if(valid(data))cacheWrite(data);
  return data;
}

window.addEventListener('yardivo:data-synced',()=>cacheWrite());
window.addEventListener('yardivo:master-data-changed',()=>cacheWrite());

async function bootRefresh(){
  installCachedIfEmpty();
  if(hasData())return true;
  try{await refresh(true)}catch(_){}
  return hasData();
}
window.addEventListener('yardivo:login',()=>setTimeout(bootRefresh,0));
window.addEventListener('load',()=>setTimeout(bootRefresh,250),{once:true});
installCachedIfEmpty();

window.YardivoMasterDataService={
  owner:'modules/master-data/service.js',
  key:KEY,
  cacheKey:CACHE,
  read,
  valid,
  hasData,
  cached,
  cacheWrite,
  installCachedIfEmpty,
  refresh,
  bootRefresh
};
window.YardivoMasterInstantBootV583={
  ready:()=>hasData(),
  refresh:bootRefresh
};
})();