
(function(){
'use strict';
const BUILD='20260912-dev-v5.8.3-master-system-fix-x10';
const MASTER='yardivo_master_data_registry_v583';
const CAP='yardivo_capacity_config_v1';
const HOURS='yardivo_reception_master_hours_v1';
const RAMP_HOURS='yardivo_ramp_hours_v583';
const RAMP_RATE='yardivo_ramp_capacity_v1';
const DET='yardivo_detention_settings_v1';
const RAMP_META='yardivo_ramp_master_v583';
let pendingMaster=null,pendingUntil=0,lastServerSync=false;

function clone(x){return JSON.parse(JSON.stringify(x))}
function jget(k,f={}){
 try{const v=JSON.parse(localStorage.getItem(k)||'null');return v&&typeof v==='object'?v:f}catch(_){return f}
}
function jset(k,v){
 localStorage.setItem(k,JSON.stringify(v));
}
function master(){
 try{
  const d=JSON.parse(localStorage.getItem(MASTER)||'{}');
  if(Array.isArray(d.suppliers)&&Array.isArray(d.locations)&&Array.isArray(d.warehouses))return d;
 }catch(_){}
 return {suppliers:[],locations:[],warehouses:[]};
}
function next(prefix,arr){
 let n=0;for(const x of arr){const m=String(x?.id||'').match(/(\d+)$/);if(m)n=Math.max(n,+m[1]||0)}
 return prefix+String(n+1).padStart(3,'0');
}
function nextWh(arr){
 let n=0;for(const x of arr){const m=String(x?.id||'').match(/^W(\d+)$/i);if(m)n=Math.max(n,+m[1]||0)}
 return 'W'+String(n+1).padStart(3,'0');
}
function serverFlush(){
 try{
  const p=window.YardivoSupabase?.flushQueue?.()||window.YardivoSupabase?.syncNow?.();
  Promise.resolve(p).catch(()=>{});
 }catch(_){}
}
function commit(d,label){
 d.__emptyWarehouseMigrationV583=true;
 d.__emptySupplierSeedMigrationV583=true;
 d.__masterRevisionV583=Date.now();
 d.__masterWriteTokenV583='MD-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);
 d.__masterUpdatedAtV583=new Date().toISOString();
 pendingMaster=clone(d);pendingUntil=Date.now()+8000;
 jset(MASTER,d);
 try{window.YardivoMasterDataV583?.save?.(clone(d))}catch(_){}
 try{window.dispatchEvent(new CustomEvent('yardivo:master-data-changed',{detail:{source:'master-authority',label,token:d.__masterWriteTokenV583}}))}catch(_){}
 serverFlush();
 propagate();
 return d;
}
function propagate(){
 const names=['populateAnnouncementControls','renderDashboardSimple','renderWarehouseCards','renderRampe','renderDockOverview','renderDailyMap','renderWeeklyMap','renderOverview','renderPlannerPro','renderAnnouncementSchedule'];
 for(const n of names){try{if(typeof window[n]==='function')window[n]()}catch(_){}}
 try{window.YardivoUnifiedRampsV583?.refresh?.()}catch(_){}
 try{window.YardivoLocationStateV583?.refresh?.()}catch(_){}
 try{window.YardivoSupplierRightDailyMapV583?.refresh?.()}catch(_){}
 try{window.YardivoSupplierDailyMapV583?.refresh?.()}catch(_){}
 try{window.YardivoMyYard?.render?.()}catch(_){}
 try{window.YardivoMyYardWebGL?.refresh?.()}catch(_){}
 try{window.dispatchEvent(new CustomEvent('yardivo:context-changed',{detail:{source:'master-authority'}}))}catch(_){}
 setTimeout(renderSystem,20);
}
function ensureFirstLocationActive(id){
 let active='';try{active=String(window.YardivoAppStateV583?.location?.()||'')}catch(_){}
 if(active)return;
 try{window.YardivoAppStateV583?.setLocation?.(id)}catch(_){}
}

/* Strong first-click CRUD; old onclick owners are intercepted before they can double-write. */
document.addEventListener('click',e=>{
 const addLoc=e.target.closest?.('#ymdAddLocation');
 if(addLoc){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const inp=document.getElementById('ymdLocationName'),name=String(inp?.value||'').trim();
  if(!name)return;
  const d=master(),x={id:next('LOC',d.locations),name,active:true};
  d.locations.push(x);commit(d,'location.add');if(inp)inp.value='';
  /* Production authority: creating Master Data must not change the active header context. */
  try{window.YardivoMasterDataV583?.refresh?.()}catch(_){}
  setTimeout(()=>{try{window.YardivoMasterDataV583?.refresh?.()}catch(_){};renderSystem()},60);
  try{showYmsToast?.('success','LOKACIJA SPREMLJENA',name)}catch(_){}
  return;
 }
 const addWh=e.target.closest?.('#ymdAddWarehouse');
 if(addWh){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const ni=document.getElementById('ymdWarehouseName'),li=document.getElementById('ymdWarehouseLocation');
  const name=String(ni?.value||'').trim(),loc=String(li?.value||'');
  const d=master();if(!name||!d.locations.some(x=>String(x.id)===loc))return;
  const x={id:nextWh(d.warehouses),name,location_id:loc,ramps:0,active:true};
  d.warehouses.push(x);commit(d,'warehouse.add');if(ni)ni.value='';
  try{window.YardivoMasterDataV583?.refresh?.()}catch(_){}
  setTimeout(renderSystem,50);
  try{showYmsToast?.('success','SKLADIŠTE SPREMLJENO',name)}catch(_){}
  return;
 }
},true);

/* Prevent a stale server pull from visually deleting a just-saved Master write.
   The barrier is short and only protects the exact local Master transaction. */
window.addEventListener('yardivo:data-synced',()=>{
 lastServerSync=true;
 if(pendingMaster&&Date.now()<pendingUntil){
   const now=master();
   const token=String(now.__masterWriteTokenV583||'');
   const want=String(pendingMaster.__masterWriteTokenV583||'');
   if(token!==want){
     jset(MASTER,pendingMaster);
     try{window.YardivoMasterDataV583?.save?.(clone(pendingMaster))}catch(_){}
     serverFlush();
   }else{
     pendingMaster=null;pendingUntil=0;
   }
 }
 setTimeout(()=>{paintSaved();renderSystem();paintHeader();paintSupplierBadge()},30);
});

/* Delete configuration belonging to warehouses that no longer exist in Master Data.
   This removes old W101/W201/ramp/pallet ghosts without deleting current Master data. */
function pruneLegacy(){
 const ids=new Set(master().warehouses.map(w=>String(w.id)));
 for(const key of [CAP,HOURS,RAMP_HOURS,RAMP_RATE,DET,RAMP_META,'yardivo_ramp_config_v1']){
   const o=jget(key,{});let changed=false;
   for(const k of Object.keys(o)){if(/^W\d+/i.test(k)&&!ids.has(k)){delete o[k];changed=true}}
   if(changed)jset(key,o);
 }
}
window.addEventListener('yardivo:master-data-changed',()=>{pruneLegacy();setTimeout(()=>{renderSystem();paintHeader()},25)});

/* ---------------- Unified warehouse + pallet + detention + ramp Master ---------------- */
function locName(id,d){return d.locations.find(x=>String(x.id)===String(id))?.name||'Bez lokacije'}
function cap(code){return Number(jget(CAP)?.[code]?.warehousePallets||0)}
function hours(code){
 const h=jget(HOURS)?.[code];return{from:String(h?.from||'06:00'),to:String(h?.to||'22:00')}
}
function detention(code){
 const x=jget(DET)?.[code]||{};
 return{wait:Number(x.waitMin||60),dock:Number(x.dockMin||120)}
}
function meta(code,r){
 const x=jget(RAMP_META)?.[code]?.[String(r)]||{};
 return{name:String(x.name||`Rampa ${r}`),active:x.active!==false}
}
function rh(code,r){
 const x=jget(RAMP_HOURS)?.[code]?.[String(r)];return x?.from&&x?.to?x:hours(code)
}
function rr(code,r){return Number(jget(RAMP_RATE)?.[code]?.[String(r)]||0)}
function rt(code,r){return Number(jget(CAP)?.[code]?.ramps?.[String(r)]||0)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

function renderSystem(){
 const pane=document.getElementById('yardivoSettingsMasterPaneV583')||document.getElementById('yardivoMasterDataRegistryV583')?.parentElement;
 if(!pane)return;
 let host=document.getElementById('yardivoMasterSystemAuthorityV583');
 if(!host){host=document.createElement('section');host.id='yardivoMasterSystemAuthorityV583';pane.appendChild(host)}
 const d=master(),whs=d.warehouses.filter(w=>w&&w.active!==false);
 host.innerHTML=`<div class="yms-master-head">
   <div><h3>SKLADIŠTA · KAPACITET · RADNO VRIJEME · RAMPE</h3>
   <p>Sve vrijednosti iz ovog sektora koriste Planner, Daily/Weekly Map, Prijam, Gate, kapaciteti i My Yard. Nema zasebnog legacy izvora.</p></div>
   <span class="yms-safe">SIGURNO SPREMANJE MASTER PODATAKA</span>
 </div>
 ${whs.length?`<div class="yms-wh-grid">${whs.map(w=>{
   const h=hours(w.id),de=detention(w.id),n=Math.max(0,Number(w.ramps)||0);
   return `<article class="yms-wh" data-yms-wh="${esc(w.id)}">
    <div class="yms-wh-title"><div><strong>${esc(w.name)}</strong><small>${esc(locName(w.location_id,d))}</small></div><span>${n} ${n===1?'RAMPA':'RAMPI'}</span></div>
    <div class="yms-sector"><h4>KAPACITET I RADNO VRIJEME</h4>
      <div class="yms-fields">
       <label>DNEVNI KAPACITET · PALETE<input type="number" min="0" step="1" data-yms-cap="${esc(w.id)}" value="${cap(w.id)}"></label>
       <label>BROJ RAMPI<input type="number" min="0" max="50" step="1" data-yms-ramp-count="${esc(w.id)}" value="${n}"></label>
       <label>PRIJAM OD<input type="time" data-yms-from="${esc(w.id)}" value="${h.from}"></label>
       <label>PRIJAM DO<input type="time" data-yms-to="${esc(w.id)}" value="${h.to}"></label>
      </div>
      <button type="button" class="yms-save-wh" data-yms-save-wh="${esc(w.id)}">SPREMI PODATKE SKLADIŠTA</button>
    </div>
    <div class="yms-sector"><h4>UPRAVLJANJE RAMPAMA</h4>
      <div class="yms-ramp-list">${n?Array.from({length:n},(_,i)=>i+1).map(r=>{
        const m=meta(w.id,r),x=rh(w.id,r);
        return `<div class="yms-ramp">
          <div class="yms-ramp-name"><strong>RAMPA ${r}</strong><small>${m.active?'AKTIVNA':'ISKLJUČENA'}</small></div>
          <label>NAZIV<input type="text" data-yms-r-name="${esc(w.id)}:${r}" value="${esc(m.name)}"></label>
          <label>AKTIVNA<select data-yms-r-active="${esc(w.id)}:${r}"><option value="1" ${m.active?'selected':''}>DA</option><option value="0" ${!m.active?'selected':''}>NE</option></select></label>
          <label>OD<input type="time" data-yms-r-from="${esc(w.id)}:${r}" value="${x.from}"></label>
          <label>DO<input type="time" data-yms-r-to="${esc(w.id)}:${r}" value="${x.to}"></label>
          <label>PALETA / SAT<input type="number" min="0" step="1" data-yms-r-rate="${esc(w.id)}:${r}" value="${rr(w.id,r)}"></label>
          <label>MAX PALETA<input type="number" min="0" step="1" data-yms-r-total="${esc(w.id)}:${r}" value="${rt(w.id,r)}"></label>
          <button type="button" data-yms-save-ramp="${esc(w.id)}:${r}">SPREMI</button>
        </div>`;
      }).join(''):'<div class="yms-empty">Nema rampi. Postavi broj rampi iznad i spremi skladište.</div>'}</div>
    </div>
   </article>`;
 }).join('')}</div>`:'<div class="yms-empty">Dodaj lokaciju i skladište. Operativni Master parametri će se automatski pojaviti ovdje.</div>'}`;
}

document.addEventListener('click',e=>{
 const b=e.target.closest?.('[data-yms-save-wh]');
 if(b){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const code=b.dataset.ymsSaveWh,d=master(),w=d.warehouses.find(x=>String(x.id)===code);if(!w)return;
  const capacity=Math.max(0,Math.floor(+document.querySelector(`[data-yms-cap="${code}"]`)?.value||0));
  const n=Math.max(0,Math.min(50,Math.floor(+document.querySelector(`[data-yms-ramp-count="${code}"]`)?.value||0)));
  const from=document.querySelector(`[data-yms-from="${code}"]`)?.value||'',to=document.querySelector(`[data-yms-to="${code}"]`)?.value||'';
  if(!from||!to||from>=to){alert('Radno vrijeme: DO mora biti nakon OD.');return}
  w.ramps=n;commit(d,'warehouse.operational');
  const c=jget(CAP,{});c[code]=c[code]||{ramps:{}};c[code].warehousePallets=capacity;c[code].ramps=c[code].ramps||{};jset(CAP,c);
  const h=jget(HOURS,{});h[code]={from,to};jset(HOURS,h);
  try{window.YardivoMasterWarehouseRampsV583?.setRampCount?.(code,n)}catch(_){}
  try{if(typeof WAREHOUSES!=='undefined'&&WAREHOUSES?.[code]){WAREHOUSES[code].ramps=n;WAREHOUSES[code].receptionStart=from;WAREHOUSES[code].receptionEnd=to}}catch(_){}
  serverFlush();propagate();
  try{showYmsToast?.('success','SKLADIŠTE SPREMLJENO',`${capacity} paleta · ${n} rampi`)}catch(_){}
  return;
 }
 const rbtn=e.target.closest?.('[data-yms-save-ramp]');
 if(rbtn){
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  const pair=rbtn.dataset.ymsSaveRamp,[code,rRaw]=pair.split(':'),r=String(+rRaw);
  const name=String(document.querySelector(`[data-yms-r-name="${pair}"]`)?.value||`Rampa ${r}`).trim()||`Rampa ${r}`;
  const active=document.querySelector(`[data-yms-r-active="${pair}"]`)?.value!=='0';
  const from=document.querySelector(`[data-yms-r-from="${pair}"]`)?.value||'',to=document.querySelector(`[data-yms-r-to="${pair}"]`)?.value||'';
  const rate=Math.max(0,Math.floor(+document.querySelector(`[data-yms-r-rate="${pair}"]`)?.value||0));
  const total=Math.max(0,Math.floor(+document.querySelector(`[data-yms-r-total="${pair}"]`)?.value||0));
  if(!from||!to||from>=to){alert('Radno vrijeme rampe: DO mora biti nakon OD.');return}
  const rm=jget(RAMP_META,{});rm[code]=rm[code]||{};rm[code][r]={name,active};jset(RAMP_META,rm);
  const rhh=jget(RAMP_HOURS,{});rhh[code]=rhh[code]||{};rhh[code][r]={from,to};jset(RAMP_HOURS,rhh);
  const rates=jget(RAMP_RATE,{});rates[code]=rates[code]||{};rates[code][r]=rate;jset(RAMP_RATE,rates);
  const c=jget(CAP,{});c[code]=c[code]||{warehousePallets:0,ramps:{}};c[code].ramps=c[code].ramps||{};c[code].ramps[r]=total;jset(CAP,c);
  try{window.YardivoRampConfig?.setLocked?.(code,+r,!active)}catch(_){}
  serverFlush();propagate();
  try{showYmsToast?.('success',`${name.toUpperCase()} SPREMLJENA`,`${active?'Aktivna':'Isključena'} · ${rate} pal/h · max ${total}`)}catch(_){}
  return;
 }
},true);

/* ---------------- Header stable single source ---------------- */
function activeLoc(){
 try{return String(window.YardivoAppStateV583?.location?.()||window.currentSession?.location||'')}catch(_){return''}
}
function paintHeader(){
 const d=master(),id=activeLoc(),name=d.locations.find(x=>String(x.id)===id)?.name||'LOKACIJA NIJE ODABRANA';
 const el=document.getElementById('ygcLocation');if(el&&el.textContent!==name)el.textContent=name;
}
['yardivo:login','yardivo:context-changed','yardivo:master-data-changed'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(paintHeader,20)));

/* ---------------- Supplier badge: exact visible pending only, no blink ---------------- */
function visiblePending(){
 const body=document.getElementById('ysrBody');if(!body)return 0;
 return [...body.querySelectorAll('tr')].filter(tr=>{
   const s=String(tr.querySelector('.ysr-status')?.textContent||'').toUpperCase();
   return s.includes('ČEKA POTVRDU')||s.includes('CEKA POTVRDU');
 }).length;
}
function paintSupplierBadge(){/* owned by SupplierInboxStableFinalV583 */}
['yardivo:supplier-inbox-changed','yardivo:supplier-request-updated','yardivo:context-changed','yardivo:data-synced']
.forEach(ev=>window.addEventListener(ev,()=>setTimeout(paintSupplierBadge,40)));
/* Targeted observer only on this badge prevents older writers from flashing stale numbers. */
function guardBadge(){/* no observer; single badge owner */}

/* ---------------- Saved count: don't show stale pre-bootstrap number ---------------- */
function liveAnnouncements(){
 try{return Array.isArray(window.announcements)?window.announcements:(typeof announcements!=='undefined'&&Array.isArray(announcements)?announcements:[])}catch(_){return[]}
}
function paintSaved(){
 const el=document.getElementById('homeStorageStatus');if(!el)return;
 if(!lastServerSync && window.YardivoSupabase?.online && !window.YardivoSupabase.online()){
   el.textContent='SPREMLJENO: UČITAVAM…';el.classList.add('warn');return;
 }
 const n=liveAnnouncements().filter(x=>x&&x.deleted!==true).length;
 el.textContent=`SPREMLJENO: ${n} ${n===1?'NAJAVA':'NAJAVA'}`;
 el.classList.toggle('warn',n===0);
}
['yardivo:login','yardivo:factory-zero-server-cleared','yardivo:context-changed'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(paintSaved,20)));

/* Boot */
function boot(){
 pruneLegacy();renderSystem();paintHeader();paintSaved();guardBadge();
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,80));
window.addEventListener('load',()=>setTimeout(boot,220),{once:true});
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]'))setTimeout(renderSystem,30);
},true);

window.YardivoMasterSystemV583={
 build:BUILD,master,commit,render:renderSystem,pruneLegacy,
 capacity:code=>cap(code),detention:code=>detention(code),
 rampMeta:(code,r)=>meta(code,r),
 refresh:()=>{propagate();renderSystem()},
 pending:()=>!!pendingMaster
};
window.YARDIVO_DEV_BUILD=BUILD;
})();
