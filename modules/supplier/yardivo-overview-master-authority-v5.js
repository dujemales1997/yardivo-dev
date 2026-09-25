
(function(){
'use strict';
if(window.__YARDIVO_OVERVIEW_MASTER_AUTHORITY_V5__)return;
window.__YARDIVO_OVERVIEW_MASTER_AUTHORITY_V5__=true;

const MASTER='yardivo_master_data_registry_v583';
let rendering=false;
let selectedSupplierId='';

function role(){
 let r=String(window.currentSession?.role||window.currentSession?.app_role||'').trim().toLowerCase();
 if(r==='management'||r==='voditelj')r='manager';
 return r;
}
function readMaster(){
 try{
  const d=JSON.parse(localStorage.getItem(MASTER)||'{}')||{};
  return {
    suppliers:Array.isArray(d.suppliers)?d.suppliers:[],
    locations:Array.isArray(d.locations)?d.locations:[],
    warehouses:Array.isArray(d.warehouses)?d.warehouses:[]
  };
 }catch(_){return{suppliers:[],locations:[],warehouses:[]}}
}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function norm(v){return String(v??'').trim().toLowerCase()}
function supplierName(s){return String(s?.name||s?.supplier_name||s?.display_name||s?.id||'').trim()}
function supplierCode(s){return String(s?.supplier_code||s?.code||'').trim()}
function allAnnouncements(){
 try{
   if(Array.isArray(window.announcements))return window.announcements.filter(x=>x&&x.deleted!==true);
   if(typeof announcements!=='undefined'&&Array.isArray(announcements))return announcements.filter(x=>x&&x.deleted!==true);
 }catch(_){}
 return [];
}
function allIncidents(){
 try{
   if(Array.isArray(window.incidents))return window.incidents.filter(Boolean);
   if(typeof incidents!=='undefined'&&Array.isArray(incidents))return incidents.filter(Boolean);
 }catch(_){}
 return [];
}
function managerScope(d){
 const s=window.currentSession||{};
 const fixed=String(s.location||'').trim();
 let locIds=Array.isArray(s.locations)?s.locations.map(String).filter(Boolean):[];
 if(!locIds.length&&fixed&&fixed!=='ALL')locIds=[fixed];
 let whIds=Array.isArray(s.warehouses)?s.warehouses.map(String).filter(Boolean):[];
 if(!locIds.length&&whIds.length){
   const set=new Set(whIds);
   locIds=[...new Set(d.warehouses.filter(w=>set.has(String(w.id))).map(w=>String(w.location_id)))];
 }
 if(s.all_warehouses===true&&!whIds.length){
   whIds=d.warehouses.filter(w=>w.active!==false&&(!locIds.length||locIds.includes(String(w.location_id)))).map(w=>String(w.id));
 }
 return {locIds:new Set(locIds),whIds:new Set(whIds)};
}
function supplierAllowed(s,d){
 if(role()!=='manager')return s&&s.active!==false;
 const sc=managerScope(d);
 if(s?.active===false)return false;
 if(s?.all_locations===true||s?.all_warehouses===true)return true;
 const sl=Array.isArray(s?.locations)?s.locations.map(String):[];
 const sw=Array.isArray(s?.warehouses)?s.warehouses.map(String):[];
 if(sl.some(x=>sc.locIds.has(x)))return true;
 if(sw.some(x=>sc.whIds.has(x)))return true;
 /* Backward compatibility: supplier without explicit scope remains visible
    only if it has operational data in the manager's assigned warehouses. */
 if(!sl.length&&!sw.length){
   const keys=supplierKeys(s);
   return allAnnouncements().some(a=>announcementInAccountScope(a,d)&&announcementMatchesSupplier(a,keys));
 }
 return false;
}
function catalog(){
 const d=readMaster();
 return d.suppliers.filter(s=>supplierAllowed(s,d)&&supplierName(s))
   .sort((a,b)=>supplierName(a).localeCompare(supplierName(b),'hr'));
}
function supplierKeys(s){
 return new Set([s?.id,supplierCode(s),supplierName(s)].map(norm).filter(Boolean));
}
function announcementMatchesSupplier(a,keys){
 return [a?.supplier_id,a?.supplierId,a?.supplier_code,a?.supplierCode,a?.supplier]
   .map(norm).filter(Boolean).some(x=>keys.has(x));
}
function incidentMatchesSupplier(i,keys){
 return [i?.supplier_id,i?.supplierId,i?.supplier_code,i?.supplierCode,i?.supplier]
   .map(norm).filter(Boolean).some(x=>keys.has(x));
}
function announcementInAccountScope(a,d){
 if(role()!=='manager')return true;
 const sc=managerScope(d);
 const w=String(a?.warehouse||a?.warehouse_id||'');
 if(w)return sc.whIds.has(w);
 const loc=String(a?.location||a?.location_id||'');
 if(loc)return sc.locIds.has(loc);
 return true;
}
function incidentInAccountScope(i,d){
 if(role()!=='manager')return true;
 const sc=managerScope(d);
 const w=String(i?.warehouse||i?.warehouse_id||'');
 if(w)return sc.whIds.has(w);
 const loc=String(i?.location||i?.location_id||'');
 if(loc)return sc.locIds.has(loc);
 return true;
}
function actualDate(a){return a?.actualDate||a?.arrivalDate||a?.yardArrivalDate||''}
function actualTime(a){return a?.actualTime||a?.arrivalTime||a?.yardArrivalTime||''}
function hasArrived(a){
 if(actualDate(a)||a?.yardArrivalAt||a?.gateCheckedAt||a?.checked_in_at)return true;
 return /u dvori|na rampi|zaprim|zavr/i.test(String(a?.status||''));
}
function plannedDateTime(a){
 const ds=String(a?.date||'').trim(),ts=String(a?.time||'').trim();
 if(!ds)return null;
 const x=new Date(`${ds}T${ts||'00:00'}:00`);return Number.isNaN(+x)?null:x;
}
function arrivedDateTime(a){
 const iso=a?.yardArrivalAt||a?.gateCheckedAt||a?.checked_in_at;
 if(iso){const x=new Date(iso);if(!Number.isNaN(+x))return x}
 const ds=String(actualDate(a)||'').trim(),ts=String(actualTime(a)||'').trim();
 if(!ds)return null;
 const x=new Date(`${ds}T${ts||'00:00'}:00`);return Number.isNaN(+x)?null:x;
}
function delayMin(a){
 const p=plannedDateTime(a),x=arrivedDateTime(a);if(!p||!x)return 0;
 return Math.round((x-p)/60000);
}
function noShow(a){
 const s=String(a?.status||a?.planStatus||'').toLowerCase();
 return /no.?show|nije došao|nije dosao/.test(s);
}
function rejected(a){
 const s=String(a?.status||a?.planStatus||'').toLowerCase();
 return /odbij|reject|cancel|otkaz/.test(s);
}
function rowFor(s,d,anns,incs){
 const keys=supplierKeys(s);
 const sa=anns.filter(a=>announcementMatchesSupplier(a,keys)&&announcementInAccountScope(a,d));
 const si=incs.filter(i=>incidentMatchesSupplier(i,keys)&&incidentInAccountScope(i,d));
 const arrived=sa.filter(hasArrived);
 const late=arrived.filter(a=>delayMin(a)>yardivoDelayGraceMinutes());
 const ontime=arrived.filter(a=>delayMin(a)<=yardivoDelayGraceMinutes());
 const lateAvg=late.length?Math.round(late.reduce((n,a)=>n+Math.max(0,delayMin(a)),0)/late.length):0;
 const noShows=sa.filter(noShow).length;
 const rejects=sa.filter(rejected).length;
 const pallets=sa.reduce((n,a)=>n+(Number(a?.pallets)||0),0);
 const punctual=arrived.length?(ontime.length/arrived.length*100):100;
 const score=Math.max(0,Math.min(100,Math.round(punctual-si.length*5-noShows*8-rejects*4)));
 return {supplier:s,id:String(s.id||''),name:supplierName(s),code:supplierCode(s),all:sa,incidents:si,arrived,late,ontime,lateAvg,noShows,rejects,pallets,score};
}
function dataRows(){
 const d=readMaster(),anns=allAnnouncements(),incs=allIncidents();
 return catalog().map(s=>rowFor(s,d,anns,incs));
}
function fmtDelay(n){return n>0?`${n} min`:'—'}
function warehouseLabel(id,d=readMaster()){return d.warehouses.find(w=>String(w.id)===String(id))?.name||String(id||'—')}

function populateSelect(rows){
 const sel=document.getElementById('overviewSupplierSelect');if(!sel)return;
 const previous=selectedSupplierId||String(sel.value||'');
 sel.innerHTML='<option value="">Odaberi dobavljača...</option>'+rows.map(r=>
   `<option value="${esc(r.id)}">${esc(r.name)}${r.code?` · ${esc(r.code)}`:''}</option>`
 ).join('');
 if(rows.some(r=>r.id===previous)){sel.value=previous;selectedSupplierId=previous}
 else {sel.value='';selectedSupplierId=''}
 sel.disabled=!rows.length;
}
function renderDetail(rows){
 const detail=document.getElementById('overviewSupplierDetail');if(!detail)return;
 const r=rows.find(x=>x.id===selectedSupplierId);
 if(!r){
   detail.innerHTML='<div class="overview-empty">Odaberi dobavljača iz dropdowna. Popis dolazi iz Master Data.</div>';
   return;
 }
 const s=r.supplier,d=readMaster();
 const locNames=(s.all_locations===true?['SVE LOKACIJE']:(Array.isArray(s.locations)?s.locations:[]).map(id=>d.locations.find(x=>String(x.id)===String(id))?.name||id));
 const whNames=(s.all_warehouses===true?['SVA SKLADIŠTA']:(Array.isArray(s.warehouses)?s.warehouses:[]).map(id=>warehouseLabel(id,d)));
 const last=[...r.all].sort((a,b)=>String(b.actualDate||b.date||b.createdAt||'').localeCompare(String(a.actualDate||a.date||a.createdAt||''))).slice(0,8);
 detail.innerHTML=`<div class="yos-master-head">
   <div><h2>${esc(r.name)}</h2><p>${r.code?`Šifra: ${esc(r.code)} · `:''}${esc(locNames.join(', ')||'Lokacije nisu definirane')} · ${esc(whNames.join(', ')||'Skladišta nisu definirana')}</p></div>
   <span class="yos-badge">MASTER DATA · AKTIVAN</span>
 </div>
 <div class="yos-kpis">
   <div class="yos-kpi"><small>UKUPNO NAJAVA</small><strong>${r.all.length}</strong></div>
   <div class="yos-kpi"><small>DOLASCI</small><strong>${r.arrived.length}</strong></div>
   <div class="yos-kpi"><small>NA VRIJEME</small><strong>${r.ontime.length}</strong></div>
   <div class="yos-kpi"><small>KAŠNJENJA</small><strong>${r.late.length}</strong></div>
   <div class="yos-kpi"><small>NO-SHOW</small><strong>${r.noShows}</strong></div>
   <div class="yos-kpi"><small>INCIDENTI</small><strong>${r.incidents.length}</strong></div>
   <div class="yos-kpi"><small>PALETE</small><strong>${r.pallets}</strong></div>
 </div>
 <div class="yos-history"><h3>ZADNJIH 8 NAJAVA / DOLAZAKA</h3>
   ${last.length?last.map(a=>`<div class="yos-history-row">
     <span>${esc(a.actualDate||a.date||'—')} ${esc(a.actualTime||a.time||'')}</span>
     <strong>${esc(warehouseLabel(a.warehouse,d))}${a.dock?` · R${esc(String(a.dock).replace(/^R/i,''))}`:''}</strong>
     <span>${Number(a.pallets)||0} pal.</span>
     <span>${esc(a.status||'Najavljeno')}</span>
   </div>`).join(''):'<div class="yos-empty">Dobavljač postoji u Master Data, ali još nema operativnih najava.</div>'}
 </div>`;
}
function renderMain(rows){
 const count=document.getElementById('overviewSupplierCount');
 if(count)count.textContent=`${rows.length} dobavljača · Master Data`;

 const chart=document.getElementById('overviewSupplierChart');
 if(chart)chart.innerHTML=rows.length?rows.map(r=>{
   const cls=r.score>=90?'good':r.score>=70?'mid':'bad';
   return `<div class="overview-chart-col" data-yos-id="${esc(r.id)}" title="${esc(r.name)} · ${r.score}%">
     <div class="overview-chart-value">${r.score}%</div>
     <div class="overview-chart-bar-wrap"><div class="overview-chart-bar ${cls}" style="height:${Math.max(3,r.score)}%"></div></div>
     <div class="overview-chart-name">${esc(r.name)}</div>
   </div>`;
 }).join(''):'<div class="overview-chart-empty">Nema aktivnih dobavljača u Master Data za ovaj account.</div>';

 const perf=document.getElementById('supplierPerformance');
 if(perf)perf.innerHTML=rows.length?rows.map(r=>`<tr data-yos-id="${esc(r.id)}" style="cursor:pointer">
   <td><strong>${esc(r.name)}</strong></td><td>${r.arrived.length}</td><td>${r.ontime.length}</td><td>${r.late.length}</td>
   <td>${fmtDelay(r.lateAvg)}</td><td>${r.incidents.length}</td><td><span class="score ${r.score>=90?'good':r.score>=70?'mid':'bad'}">${r.score}%</span></td>
 </tr>`).join(''):'<tr><td colspan="7"><div class="overview-empty">Nema dobavljača u Master Data.</div></td></tr>';

 const ranking=(arr,bad=false)=>arr.length?arr.map((r,i)=>`<div class="ranking-row" data-yos-id="${esc(r.id)}" style="cursor:pointer">
   <div class="ranking-pos">${i+1}</div><div class="ranking-name">${esc(r.name)}</div>
   <div class="ranking-track"><div class="ranking-fill ${bad?'bad':''}" style="width:${Math.max(2,r.score)}%"></div></div>
   <div class="ranking-score">${r.score}%</div></div>`).join(''):'<div class="overview-empty">Nema dobavljača.</div>';
 const best=document.getElementById('overviewBest10');if(best)best.innerHTML=ranking([...rows].sort((a,b)=>b.score-a.score).slice(0,10));
 const worst=document.getElementById('overviewWorst10');if(worst)worst.innerHTML=ranking([...rows].sort((a,b)=>a.score-b.score).slice(0,10),true);

 const total=rows.reduce((n,r)=>n+r.arrived.length,0);
 const on=rows.reduce((n,r)=>n+r.ontime.length,0);
 const inc=rows.reduce((n,r)=>n+r.incidents.length,0);
 const changes=rows.reduce((n,r)=>n+r.all.reduce((x,a)=>x+(Array.isArray(a.changeHistory)?a.changeHistory.length:0),0),0);
 const lateArr=rows.flatMap(r=>r.late.map(delayMin)).filter(n=>n>0);
 const avg=lateArr.length?Math.round(lateArr.reduce((a,b)=>a+b,0)/lateArr.length):0;
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=String(v)};
 set('ovTotal',total);set('ovOnTime',total?Math.round(on/total*100)+'%':'0%');set('ovAvgDelay',fmtDelay(avg));set('ovIncidents',inc);set('ovChanges',changes);

 renderDetail(rows);
}
function render(){
 if(rendering)return;
 rendering=true;
 try{
   const rows=dataRows();
   populateSelect(rows);
   renderMain(rows);
 }finally{rendering=false}
}
function choose(id){
 const rows=dataRows();
 if(!rows.some(r=>r.id===String(id||'')))return;
 selectedSupplierId=String(id);
 const sel=document.getElementById('overviewSupplierSelect');if(sel)sel.value=selectedSupplierId;
 renderMain(rows);
 document.getElementById('overviewSupplierDetail')?.scrollIntoView({behavior:'smooth',block:'start'});
}

/* Capture-phase so old Overview handlers cannot reset the selection after change/click. */
window.addEventListener('change',e=>{
 if(e.target?.id!=='overviewSupplierSelect')return;
 e.stopImmediatePropagation();
 selectedSupplierId=String(e.target.value||'');
 render();
},true);
window.addEventListener('click',e=>{
 const item=e.target?.closest?.('[data-yos-id]');
 if(item){
   e.preventDefault();e.stopImmediatePropagation();choose(item.dataset.yosId);return;
 }
 if(e.target?.closest?.('[data-view="overview"],[data-home-target="overview"]')){
   queueMicrotask(render);
 }
},true);

['yardivo:login','yardivo:data-synced','yardivo:master-data-changed','yardivo:context-changed','yardivo:overview-refresh']
 .forEach(ev=>window.addEventListener(ev,()=>queueMicrotask(render)));
document.addEventListener('DOMContentLoaded',()=>queueMicrotask(render),{once:true});
window.addEventListener('load',()=>queueMicrotask(render),{once:true});

window.YardivoOverviewMasterV5={render,catalog,dataRows,choose};
})();
