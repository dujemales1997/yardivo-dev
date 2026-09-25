
(()=>{'use strict';
if(window.__YARDIVO_MASTER_BOOTSTRAP_BACKEND_FRONTEND_AUTHORITY_FINAL__)return;
window.__YARDIVO_MASTER_BOOTSTRAP_BACKEND_FRONTEND_AUTHORITY_FINAL__=true;
const KEY='yardivo_master_data_registry_v583';
let inflight=null,lastGood=null,lastPullAt=0;
function read(){try{const d=JSON.parse(localStorage.getItem(KEY)||'{}')||{};return d}catch(_){return {}}}
function valid(d){return d&&Array.isArray(d.locations)&&Array.isArray(d.warehouses)&&Array.isArray(d.suppliers)}
function hasStructure(d){return valid(d)&&(d.locations.length||d.warehouses.length||d.suppliers.length||Array.isArray(d.responsible_people))}
function remember(){const d=read();if(valid(d)&&hasStructure(d))lastGood=JSON.parse(JSON.stringify(d));return d}
function paint(){
 try{window.YardivoLocationDropdownAuthorityV583?.sync?.()}catch(_){}
 try{window.YardivoStableMasterV583?.render?.()}catch(_){}
 try{window.YardivoMasterDataV583?.refresh?.()}catch(_){}
 try{window.YardivoMasterHeaderCapacityBindingV583?.refresh?.()}catch(_){}
}
function setLoading(on){
 const h=document.getElementById('homeLocationSelect');if(h){h.dataset.yv583MasterLoading=on?'1':'0';if(on&&!h.options.length){const o=document.createElement('option');o.value='';o.textContent='Učitavanje lokacija...';h.appendChild(o)}}
 const p=document.getElementById('yardivoMasterPopupV583');if(p)p.dataset.yv583MasterLoading=on?'1':'0';
}
async function hydrate(force=false){
 const current=remember();
 if(!force&&hasStructure(current)){paint();return current}
 if(inflight)return inflight;
 inflight=(async()=>{
  setLoading(true);
  try{
   const now=Date.now();
   if(force||now-lastPullAt>500){lastPullAt=now;try{await Promise.resolve(window.YardivoSupabase?.fastPull?.())}catch(_){} }
   const d=remember();
   if(hasStructure(d)){paint();return d}
   if(lastGood){try{localStorage.setItem(KEY,JSON.stringify(lastGood))}catch(_){};paint();return lastGood}
   paint();return d;
  }finally{setLoading(false);inflight=null}
 })();
 return inflight;
}
function boundedStartup(){let n=0;const tick=async()=>{n++;const d=read();if(hasStructure(d)){remember();paint();return}await hydrate(true);if(!hasStructure(read())&&n<12)setTimeout(tick,250)};tick()}
/* Startup/login authority: Master is hydrated before Home/Master are treated as empty. */
document.addEventListener('DOMContentLoaded',()=>setTimeout(boundedStartup,0),{once:true});
window.addEventListener('load',()=>setTimeout(()=>hydrate(!hasStructure(read())),80),{once:true});
window.addEventListener('yardivo:login',()=>setTimeout(boundedStartup,0));
window.addEventListener('yardivo:data-synced',()=>{remember();paint()});
window.addEventListener('yardivo:master-data-changed',()=>{remember();paint()});
/* Opening Home or Master explicitly resolves server state first; no click-to-make-data-appear behavior. */
document.addEventListener('click',e=>{
 if(e.target?.closest?.('[data-home-target="home"],#homeBtn,[data-view="home"]'))setTimeout(()=>hydrate(!hasStructure(read())),0);
 if(e.target?.closest?.('#yardivoMasterPopupLaunchV583'))setTimeout(()=>hydrate(true),0);
},true);
document.addEventListener('focusin',e=>{if(e.target?.id==='homeLocationSelect'&&!hasStructure(read()))hydrate(true)},true);
remember();setTimeout(()=>hydrate(!hasStructure(read())),0);
window.YardivoMasterBootstrapAuthorityV583={hydrate,read,refresh:paint};
window.YARDIVO_DEV_BUILD='20260916-dev-v5.8.3-master-bootstrap-backend-frontend-authority-final';
})();
