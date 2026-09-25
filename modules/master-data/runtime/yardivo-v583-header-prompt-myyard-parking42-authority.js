(()=>{'use strict';
const BUILD='20260915-dev-v5.8.3-header-prompt-myyard-3d-parking42-final';
function master(){try{return JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')}catch(_){return{locations:[],warehouses:[]}}}
function context(){const m=master();let l='',w='';try{l=String(YardivoAppStateV583?.location?.()||'');w=String(YardivoAppStateV583?.warehouse?.()||activeWarehouse||'')}catch(_){};if(l==='ALL')l='';if(w==='ALL')w='';return{m,l,w}}
function fixHeader(){const {m,l,w}=context(),ls=document.getElementById('globalLocationV583'),ws=document.getElementById('globalWarehouse');if(ls){const valid=(m.locations||[]).some(x=>x&&x.active!==false&&String(x.id)===l);if(!valid){ls.value='';const p=ls.querySelector('option[value=""]');if(p){p.disabled=true;p.hidden=true;p.textContent='Odaberi lokaciju...'}}}if(ws){const rows=(m.warehouses||[]).filter(x=>x&&x.active!==false&&l&&String(x.location_id)===l);const valid=rows.some(x=>String(x.id)===w);const p=ws.querySelector('option[value=""]');if(p){p.disabled=true;p.hidden=true;p.textContent='Odaberi skladište...'}ws.disabled=!l||!rows.length;if(!valid)ws.value=''}}
['yardivo:context-changed','yardivo:master-data-changed','yardivo:data-synced','yardivo:login'].forEach(e=>window.addEventListener(e,()=>requestAnimationFrame(fixHeader)));
document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(fixHeader),{once:true});window.addEventListener('load',()=>setTimeout(fixHeader,200),{once:true});
window.YARDIVO_DEV_BUILD=BUILD;
})();
