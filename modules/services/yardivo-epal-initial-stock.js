
(function(){
'use strict';
const KEY='yardivo_epal_initial_stock_v1';

function role(){
 let r='';try{r=String(currentSession?.role||'').toLowerCase().trim()}catch(e){}
 if(r==='zalihe'||r==='upravljanje zalihama')r='inventory';
 return r;
}
function isAdmin(){return role()==='admin'}
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return {}}}
function save(x){localStorage.setItem(KEY,JSON.stringify(x))}
function initialMaster(){try{const d=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}');return {locations:Array.isArray(d.locations)?d.locations:[],warehouses:Array.isArray(d.warehouses)?d.warehouses:[]}}catch(_){return {locations:[],warehouses:[]}}}
function whName(c){const w=initialMaster().warehouses.find(x=>x&&x.active!==false&&String(x.id)===String(c));return String(w?.name||c||'')}
function codesForLocation(loc){return initialMaster().warehouses.filter(w=>w&&w.active!==false&&(loc==='ALL'||String(w.location_id)===String(loc))).map(w=>String(w.id))}
function currentLoc(){
 const d=initialMaster(),valid=new Set(d.locations.filter(x=>x&&x.active!==false).map(x=>String(x.id)));
 let v='';try{v=String(window.YardivoAppStateV583?.location?.()||currentSession?.location||'')}catch(_){}
 if(valid.has(v))return v;if(v==='ALL'||role()==='admin')return 'ALL';return d.locations.filter(x=>x&&x.active!==false)[0]?.id||'ALL';
}

function ensurePanel(){
 const settings=document.getElementById('settings');if(!settings||!isAdmin())return;
 if(document.getElementById('epalInitialSettings'))return;
 const panel=document.createElement('div');
 panel.id='epalInitialSettings';panel.className='panel epal-initial-settings';
 panel.innerHTML=`<div class="panel-head"><div><h2>POČETNO STANJE EPAL PALETA</h2><small>Početna fizička zaliha praznih europaleta po skladištu. Postavlja Admin kod implementacije.</small></div></div>
 <div class="panel-body">
   <div class="epal-toolbar">
     <label>LOKACIJA
       <select id="epalInitialLocation"></select>
     </label>
   </div>
   <div class="epal-initial-grid" id="epalInitialGrid"></div>
   <div class="epal-initial-actions"><button type="button" class="primary" id="saveEpalInitial">SPREMI POČETNO STANJE</button></div>
 </div>`;
 settings.appendChild(panel);
 const ls=document.getElementById('epalInitialLocation'),md=initialMaster();
 ls.innerHTML=md.locations.filter(x=>x&&x.active!==false).map(x=>`<option value="${x.id}">${x.name}</option>`).join('')+'<option value="ALL">Sve lokacije</option>';
 ls.value=[...ls.options].some(o=>o.value===currentLoc())?currentLoc():(ls.options[0]?.value||'ALL');
 ls.onchange=renderInputs;
 document.getElementById('saveEpalInitial').onclick=saveInputs;
 renderInputs();
}
function renderInputs(){
 const loc=document.getElementById('epalInitialLocation')?.value||currentLoc(),data=load(),grid=document.getElementById('epalInitialGrid');if(!grid)return;
 grid.innerHTML=codesForLocation(loc).map(c=>`<label class="epal-initial-card"><strong>${c} · ${whName(c)}</strong><small>Početno stanje praznih EPAL</small><input type="number" min="0" step="1" inputmode="numeric" data-epal-initial="${c}" value="${Math.max(0,Number(data[c]||0))}"></label>`).join('');
}
function saveInputs(){
 if(!isAdmin())return;
 const data=load(),loc=document.getElementById('epalInitialLocation')?.value||currentLoc();
 document.querySelectorAll('[data-epal-initial]').forEach(i=>data[i.dataset.epalInitial]=Math.max(0,Math.floor(Number(i.value||0))));
 data.updatedAt=new Date().toISOString();data.updatedBy=currentSession?.username||currentSession?.user||'Admin';
 save(data);
 try{const md=initialMaster(),name=loc==='ALL'?'Sve lokacije':(md.locations.find(x=>String(x.id)===String(loc))?.name||loc);showYmsToast?.('success','EPAL POČETNO STANJE SPREMLJENO',name)}catch(e){}
 try{YardivoEPAL?.render?.()}catch(e){}
}
function totalForWarehouse(wh){return Math.max(0,Number(load()[wh]||0))}
function totalForLocation(loc){return codesForLocation(loc).reduce((s,c)=>s+totalForWarehouse(c),0)}
function totalAll(){return initialMaster().warehouses.filter(w=>w&&w.active!==false).reduce((s,w)=>s+totalForWarehouse(w.id),0)}

function addStockKpi(){
 const epal=document.getElementById('epal');if(!epal)return;
 const kpis=epal.querySelector('.performance-kpis');if(!kpis||document.getElementById('epalKpiPhysicalStart'))return;
 const d=document.createElement('div');d.className='performance-kpi';d.innerHTML='<small>POČETNO STANJE</small><strong id="epalKpiPhysicalStart">0</strong><span>EPAL praznih paleta u odabranom području</span>';kpis.appendChild(d);
}
function updateStockKpi(){
 addStockKpi();
 const el=document.getElementById('epalKpiPhysicalStart');if(!el)return;
 const locSel=document.getElementById('epalLocationFilter')?.value||'CURRENT';
 const loc=locSel==='CURRENT'?currentLoc():locSel;
 const wh=document.getElementById('epalWarehouseFilter')?.value||'ALL';
 let n=0;
 if(wh!=='ALL')n=totalForWarehouse(wh);
 else if(loc==='ALL')n=totalAll();
 else n=totalForLocation(loc);
 el.textContent=n;
}

document.addEventListener('click',e=>{
 if(e.target.closest('[data-view="settings"],[data-home-target="settings"]'))setTimeout(()=>{ensurePanel();renderInputs()},30);
 if(e.target.closest('[data-view="epal"],[data-home-target="epal"]'))setTimeout(updateStockKpi,50);
},true);
document.getElementById('epalLocationFilter')?.addEventListener('change',()=>setTimeout(updateStockKpi,20));
document.getElementById('epalWarehouseFilter')?.addEventListener('change',()=>setTimeout(updateStockKpi,20));
window.addEventListener('load',()=>setTimeout(()=>{ensurePanel();updateStockKpi()},450));
setInterval(()=>{if(isAdmin())ensurePanel();updateStockKpi()},4000);
window.YardivoEPALInitial={load,totalForWarehouse,totalForLocation,totalAll};
})();
