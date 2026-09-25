(function(){
'use strict';
const MASTER='yardivo_master_data_registry_v583',EPAL='yardivo_epal_initial_stock_v1';
function md(){try{const d=JSON.parse(localStorage.getItem(MASTER)||'{}');return {locations:Array.isArray(d.locations)?d.locations:[],warehouses:Array.isArray(d.warehouses)?d.warehouses:[]}}catch(_){return {locations:[],warehouses:[]}}}
function stock(){try{return JSON.parse(localStorage.getItem(EPAL)||'{}')||{}}catch(_){return{}}}
function locName(id,d=md()){return String(d.locations.find(x=>String(x.id)===String(id))?.name||id||'')}
function visibleRows(){const d=md(),lf=document.getElementById('epalLocationFilter')?.value||'CURRENT',wf=document.getElementById('epalWarehouseFilter')?.value||'ALL';let loc=lf;if(loc==='CURRENT'){try{loc=String(window.YardivoAppStateV583?.location?.()||currentSession?.location||'ALL')}catch(_){loc='ALL'};if(!d.locations.some(x=>String(x.id)===loc))loc='ALL'}return d.warehouses.filter(w=>w&&w.active!==false&&(loc==='ALL'||String(w.location_id)===String(loc))&&(wf==='ALL'||String(w.id)===String(wf)))}
function renderBreakdown(){const ep=document.getElementById('epal');if(!ep)return;let box=document.getElementById('epalMasterInitialBreakdownV583');if(!box){box=document.createElement('div');box.id='epalMasterInitialBreakdownV583';const k=ep.querySelector('.performance-kpis');k?.insertAdjacentElement('afterend',box)}if(!box)return;const d=md(),st=stock(),rows=visibleRows();box.innerHTML='<h3>POČETNO STANJE EPAL PO SKLADIŠTU</h3><div class="yeib-grid">'+(rows.length?rows.map(w=>`<div class="yeib-item"><small>${locName(w.location_id,d)} · ${w.name}</small><strong>${Math.max(0,Number(st[w.id]||0))} EPAL</strong></div>`).join(''):'<div class="yeib-item"><small>Nema skladišta u odabranom području</small><strong>0 EPAL</strong></div>')+'</div>'}
function cleanWarehouseLabels(){const d=md(),names=new Map(d.warehouses.map(w=>[String(w.id),String(w.name||w.id)]));document.querySelectorAll('#epalWarehouseFilter option,#epalWarehouse option').forEach(o=>{if(names.has(String(o.value)))o.textContent=names.get(String(o.value))});}
function refresh(){cleanWarehouseLabels();renderBreakdown();try{window.YardivoEPALInitial?.totalAll?.()}catch(_){}}
['yardivo:master-data-changed','yardivo:context-changed','yardivo:login'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(refresh,50)));
document.addEventListener('change',e=>{if(e.target?.matches?.('#epalLocationFilter,#epalWarehouseFilter'))setTimeout(refresh,20)},true);
document.addEventListener('click',e=>{if(e.target.closest?.('[data-view="epal"],[data-home-target="epal"]'))setTimeout(refresh,80)},true);
document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,300));window.addEventListener('load',()=>setTimeout(refresh,700));
window.YardivoEpalRampMasterCleanV583={refresh,build:'20260913-dev-v5.8.3-epal-ramp-master-clean-final'};
window.YARDIVO_DEV_BUILD='20260913-dev-v5.8.3-epal-ramp-master-clean-final';
})();
