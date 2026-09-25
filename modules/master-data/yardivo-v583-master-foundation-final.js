
(function(){
'use strict';
const BUILD='20260912-dev-v5.8.3-master-foundation-final';
const MASTER='yardivo_master_data_registry_v583';
const CAP='yardivo_capacity_config_v1';
const HOURS='yardivo_reception_master_hours_v1';
const RH='yardivo_ramp_hours_v583';
const RATE='yardivo_ramp_capacity_v1';
const RCFG='yardivo_ramp_config_v1';
const RMETA='yardivo_ramp_master_v583';
const DET='yardivo_detention_settings_v1';
const CLEAN='yardivo_total_clean_20260912_master_foundation_v1';
const SERVER_PENDING='yardivo_factory_zero_server_pending_v583_20260911_r2';
let cleanupActive=false,cleanupDone=false,renderQueued=0;

/* ---------- TOTAL CLEAN SLATE (once for this build) ---------- */
const EMPTY_KEYS=[
 'yardivo_yms_announcements_v1','studenac_announcements','yardivo_announcements','yms_announcements',
 'yardivo_yms_incidents_v1','yardivo_incidents',
 'yardivo_live_notifications_v1','yardivo_master_notifications_v1',
 'yardivo_notifications','yardivo_notifications_v1','yardivo_notifications_v2','yardivo_notifications_v583',
 'yardivo_notification_history_v1','yardivo_notification_history_v583','studenac_notifications','yms_notifications',
 'yardivo_epal_transactions_v1','yms_trucks_v2','yardivo_auto_replan_log_v1','yardivo_supplier_scores_v1',
 'yardivo_supabase_offline_queue_v1','yardivo_supabase_offline_queue_v2',
 'yardivo_supplier_deliveries_v1','yardivo_supplier_requests_v1'
];
const CONFIG_KEYS=[CAP,HOURS,RH,RATE,RCFG,RMETA,DET,'yardivo_dynamic_warehouses_v1'];
function localCleanOnce(){
 let done=false;try{done=localStorage.getItem(CLEAN)==='1'}catch(_){}
 if(done){cleanupDone=true;return}
 cleanupActive=true;
 try{
   EMPTY_KEYS.forEach(k=>localStorage.setItem(k,'[]'));
   CONFIG_KEYS.forEach(k=>localStorage.removeItem(k));
   localStorage.setItem(MASTER,JSON.stringify({
     suppliers:[],locations:[],warehouses:[],
     __emptySupplierSeedMigrationV583:true,__emptyWarehouseMigrationV583:true,
     __factoryZeroV583:true,__cleanMasterFoundationV583:true
   }));
   localStorage.setItem(SERVER_PENDING,'1');
 }catch(_){}
 try{
   if(typeof announcements!=='undefined'&&Array.isArray(announcements))announcements.length=0;
   if(typeof incidents!=='undefined'&&Array.isArray(incidents))incidents.length=0;
   if(typeof notifications!=='undefined'&&Array.isArray(notifications))notifications.length=0;
 }catch(_){}
 try{
   if(!localStorage.getItem('yardivo_clean_epoch_v583'))localStorage.setItem('yardivo_clean_epoch_v583',new Date().toISOString());
   localStorage.setItem(CLEAN,'1');
 }catch(_){}
}
/* localCleanOnce intentionally NOT called: Factory Zero requires explicit admin reset. */
cleanupDone=true;cleanupActive=false;

function jget(k,f={}){
 try{const x=JSON.parse(localStorage.getItem(k)||'null');return x&&typeof x==='object'?x:f}catch(_){return f}
}
function jset(k,v){localStorage.setItem(k,JSON.stringify(v))}
function clone(x){return JSON.parse(JSON.stringify(x))}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function master(){
 const d=jget(MASTER,null);
 return d&&Array.isArray(d.suppliers)&&Array.isArray(d.locations)&&Array.isArray(d.warehouses)?d:{suppliers:[],locations:[],warehouses:[]};
}
function next(prefix,arr){
 let n=0;for(const x of arr){const m=String(x?.id||'').match(/(\d+)$/);if(m)n=Math.max(n,+m[1]||0)}
 return prefix+String(n+1).padStart(3,'0');
}
function nextWh(arr){
 let n=0;for(const x of arr){const m=String(x?.id||'').match(/^W(\d+)$/i);if(m)n=Math.max(n,+m[1]||0)}
 return 'W'+String(n+1).padStart(3,'0');
}
function commitMaster(d,reason){
 d.__masterUpdatedAtV583=new Date().toISOString();
 d.__masterWriteTokenV583='MF-'+Date.now()+'-'+Math.random().toString(36).slice(2,9);
 jset(MASTER,d);
 try{window.YardivoMasterDataV583?.save?.(clone(d))}catch(_){}
 try{window.dispatchEvent(new CustomEvent('yardivo:master-data-changed',{detail:{source:'master-foundation',reason}}))}catch(_){}
 try{window.YardivoSupabase?.flushQueue?.()}catch(_){}
 propagate();
 return d;
}
function propagate(){
 const f=['populateAnnouncementControls','renderDashboardSimple','renderWarehouseCards','renderRampe','renderDockOverview','renderDailyMap','renderWeeklyMap','renderOverview','renderPlannerPro','renderAnnouncementSchedule'];
 f.forEach(n=>{try{if(typeof window[n]==='function')window[n]()}catch(_){}});
 try{window.YardivoUnifiedRampsV583?.refresh?.()}catch(_){}
 try{window.YardivoLocationStateV583?.refresh?.()}catch(_){}
 try{window.YardivoSupplierRightDailyMapV583?.refresh?.()}catch(_){}
 try{window.YardivoSupplierDailyMapV583?.refresh?.()}catch(_){}
 try{window.YardivoMyYard?.render?.()}catch(_){}
 try{window.YardivoMyYardWebGL?.refresh?.()}catch(_){}
 try{window.dispatchEvent(new CustomEvent('yardivo:context-changed',{detail:{source:'master-foundation'}}))}catch(_){}
 queueRender();
 paintCapacityUi();
}

/* ---------- SERVER CLEANUP COMPLETION ---------- */
function waitForServerCleanup(){
 const role=String(window.currentSession?.role||'').toLowerCase();
 if(role!=='admin'){cleanupActive=false;queueRender();return}
 const started=Date.now();
 const tick=async()=>{
   try{
     if(window.YardivoSupabase?.online?.()){
       /* factory-zero pending is processed inside authenticate/bootstrap. If it
          survived for any reason, reset now while preserving users/auth. */
       let pending=false;try{pending=localStorage.getItem(SERVER_PENDING)==='1'}catch(_){}
       if(pending&&window.YardivoSupabase?.resetAllExceptUsers){
         await window.YardivoSupabase.resetAllExceptUsers();
         try{localStorage.removeItem(SERVER_PENDING)}catch(_){}
       }
       cleanupActive=false;cleanupDone=true;
       clearRuntime();
       queueRender();paintSaved();paintSupplierBadge();
       return;
     }
   }catch(e){console.warn('[YARDIVO CLEANUP]',e)}
   if(Date.now()-started<25000)setTimeout(tick,350);
   else{cleanupActive=false;queueRender()}
 };
 tick();
}
function clearRuntime(){
 try{if(typeof announcements!=='undefined'&&Array.isArray(announcements))announcements.length=0}catch(_){}
 try{if(typeof incidents!=='undefined'&&Array.isArray(incidents))incidents.length=0}catch(_){}
 EMPTY_KEYS.forEach(k=>{try{localStorage.setItem(k,'[]')}catch(_){}});
 try{window.YardivoNotificationsV583?.clear?.()}catch(_){}
 try{window.YardivoHomeSavedCountV583?.refresh?.()}catch(_){}
}

/* ---------- MASTER MODEL ---------- */
function locationName(id,d=master()){return d.locations.find(x=>String(x.id)===String(id))?.name||'Bez lokacije'}
function capacity(code){
 const w=master().warehouses.find(x=>String(x.id)===String(code));
 const v=w?.daily_pallet_capacity??jget(CAP,{})?.[code]?.warehousePallets;
 return v==null||v===''||Number(v)<=0?null:Number(v);
}
function det(code){
 const x=jget(DET,{})?.[code]||{};
 return{
   wait:x.waitMin==null||x.waitMin===''?null:Number(x.waitMin),
   dock:x.dockMin==null||x.dockMin===''?null:Number(x.dockMin)
 };
}
function hours(code){
 const x=jget(HOURS,{})?.[code];
 return{x:String(x?.from||''),y:String(x?.to||'')}
}
function rampMeta(code,r){
 const x=jget(RMETA,{})?.[code]?.[String(r)]||{};
 return{name:String(x.name||`Rampa ${r}`),active:x.active!==false}
}
function rampHours(code,r){
 const x=jget(RH,{})?.[code]?.[String(r)]||{};
 return{from:String(x.from||''),to:String(x.to||'')}
}
function rampRate(code,r){
 const v=jget(RATE,{})?.[code]?.[String(r)];
 return v==null||v===''?null:Number(v)
}
function rampMax(code,r){
 const v=jget(CAP,{})?.[code]?.ramps?.[String(r)];
 return v==null||v===''?null:Number(v)
}

function addLocation(name){
 const n=String(name||'').trim();if(!n)return;
 const d=master(),id=next('LOC',d.locations);d.locations.push({id,name:n,active:true});
 commitMaster(d,'location.add');
 /* Creating a location does not select it as runtime context. */
 setTimeout(()=>{paintHeader();renderContextSelectors()},0);
}
function renameLocation(id,name){
 const d=master(),x=d.locations.find(v=>v.id===id),n=String(name||'').trim();if(!x||!n)return;
 x.name=n;commitMaster(d,'location.rename');
}
function deleteLocation(id){
 const d=master();
 if(d.warehouses.some(w=>w.location_id===id))return alert('Prvo premjesti ili obriši skladišta ove lokacije.');
 d.locations=d.locations.filter(x=>x.id!==id);commitMaster(d,'location.delete');
}
function addWarehouse(name,loc){
 const n=String(name||'').trim(),d=master();if(!n||!d.locations.some(x=>x.id===loc))return;
 const id=nextWh(d.warehouses);d.warehouses.push({id,name:n,location_id:loc,ramps:0,active:true});
 commitMaster(d,'warehouse.add');
 try{
   if(!window.YardivoAppStateV583?.location?.())window.YardivoAppStateV583?.setLocation?.(loc);
   window.YardivoAppStateV583?.setWarehouse?.(id);
 }catch(_){window.activeWarehouse=id}
 setTimeout(()=>{paintHeader();renderContextSelectors()},0);
}
function renameWarehouse(id,name,loc){
 const d=master(),w=d.warehouses.find(x=>x.id===id),n=String(name||'').trim();
 if(!w||!n||!d.locations.some(x=>x.id===loc))return;
 w.name=n;w.location_id=loc;commitMaster(d,'warehouse.update');
}
function deleteWarehouse(id){
 const d=master();d.warehouses=d.warehouses.filter(x=>x.id!==id);commitMaster(d,'warehouse.delete');
 for(const k of [CAP,HOURS,RH,RATE,RCFG,RMETA,DET]){
   const o=jget(k,{});delete o[id];jset(k,o)
 }
}
function setRampCount(code,n){
 const d=master(),w=d.warehouses.find(x=>x.id===code);if(!w)return;
 n=Math.max(0,Math.min(50,Number(n)||0));w.ramps=n;commitMaster(d,'ramps.count');
 const cfg=jget(RCFG,{});cfg[code]=cfg[code]||{count:0,locked:[]};cfg[code].count=n;
 cfg[code].locked=(cfg[code].locked||[]).map(Number).filter(x=>x>=1&&x<=n);jset(RCFG,cfg);
 try{window.YardivoRampConfig?.setCount?.(code,n)}catch(_){}
}
function saveWarehouseOps(code){
 const capEl=document.querySelector(`[data-mf-cap="${code}"]`);
 const from=document.querySelector(`[data-mf-wh-from="${code}"]`)?.value||'';
 const to=document.querySelector(`[data-mf-wh-to="${code}"]`)?.value||'';
 const capVal=String(capEl?.value||'').trim();
 const c=jget(CAP,{});c[code]=c[code]||{ramps:{}};
 c[code].warehousePallets=capVal===''?null:Math.max(1,Math.floor(Number(capVal)||0));c[code].ramps=c[code].ramps||{};jset(CAP,c);
 const de=jget(DET,{});de[code]={
   waitMin:String(waitEl?.value||'').trim()===''?null:Math.max(0,Math.floor(Number(waitEl.value)||0)),
   dockMin:String(dockEl?.value||'').trim()===''?null:Math.max(0,Math.floor(Number(dockEl.value)||0))
 };jset(DET,de);
 const h=jget(HOURS,{});h[code]={from,to};jset(HOURS,h);
 try{if(typeof WAREHOUSES!=='undefined'&&WAREHOUSES?.[code]){WAREHOUSES[code].receptionStart=from;WAREHOUSES[code].receptionEnd=to}}catch(_){}
 try{window.YardivoSupabase?.flushQueue?.()}catch(_){}
 propagate();
}
function saveRamp(code,r){
 const pair=code+':'+r;
 const name=String(document.querySelector(`[data-mf-r-name="${pair}"]`)?.value||`Rampa ${r}`).trim()||`Rampa ${r}`;
 const active=document.querySelector(`[data-mf-r-active="${pair}"]`)?.value!=='0';
 const from=document.querySelector(`[data-mf-r-from="${pair}"]`)?.value||'';
 const to=document.querySelector(`[data-mf-r-to="${pair}"]`)?.value||'';
 const rateTxt=String(document.querySelector(`[data-mf-r-rate="${pair}"]`)?.value||'').trim();
 const maxTxt=String(document.querySelector(`[data-mf-r-max="${pair}"]`)?.value||'').trim();
 const meta=jget(RMETA,{});meta[code]=meta[code]||{};meta[code][String(r)]={name,active};jset(RMETA,meta);
 const hh=jget(RH,{});hh[code]=hh[code]||{};hh[code][String(r)]={from,to};jset(RH,hh);
 const rates=jget(RATE,{});rates[code]=rates[code]||{};rates[code][String(r)]=rateTxt===''?null:Math.max(1,Math.floor(Number(rateTxt)||0));jset(RATE,rates);
 const c=jget(CAP,{});c[code]=c[code]||{warehousePallets:null,ramps:{}};c[code].ramps=c[code].ramps||{};c[code].ramps[String(r)]=maxTxt===''?null:Math.max(1,Math.floor(Number(maxTxt)||0));jset(CAP,c);
 try{window.YardivoRampConfig?.setLocked?.(code,Number(r),!active)}catch(_){}
 try{window.YardivoSupabase?.flushQueue?.()}catch(_){}
 propagate();
}

/* ---------- MASTER UI ---------- */
function pane(){
 const p=document.getElementById('yardivoSettingsMasterPaneV583');
 if(p)return p;
 return document.getElementById('settings');
}
function queueRender(){clearTimeout(renderQueued);renderQueued=setTimeout(render,25)}
function render(){
 const p=pane();if(!p)return;
 let host=document.getElementById('yardivoMasterFoundationV583');
 if(!host){host=document.createElement('section');host.id='yardivoMasterFoundationV583';p.appendChild(host)}
 const d=master(),locs=d.locations.filter(x=>x.active!==false),whs=d.warehouses.filter(x=>x.active!==false);
 const disabled=cleanupActive?'disabled':'';
 host.innerHTML=`
  <div class="ymf-hero">
   <div><h2>MASTER PODACI · TEMELJ YARDIVO LOGIKE</h2>
    <p>Ovdje gradiš stvarnu strukturu sustava: lokacije → skladišta → rampe → kapaciteti → radna vremena. Administracija korisnika ostaje odvojena.</p></div>
   <span class="ymf-status ${cleanupActive?'cleaning':''}">${cleanupActive?'ČIŠĆENJE STARIH PODATAKA…':'MASTER DATA AKTIVAN'}</span>
  </div>
  <div class="ymf-grid">
   <section class="ymf-card">
    <h3>1 · LOKACIJE</h3><p>Dodaj samo stvarne lokacije. YARDIVO više nema ugrađene VG/DU lokacije.</p>
    <div class="ymf-list">${locs.length?locs.map(l=>`
      <div class="ymf-row"><div class="ymf-row-main"><input data-mf-loc-name="${esc(l.id)}" value="${esc(l.name)}"><small>Lokacija</small></div>
       <div class="ymf-actions"><button ${disabled} data-mf-save-loc="${esc(l.id)}">SPREMI</button><button ${disabled} class="danger" data-mf-del-loc="${esc(l.id)}">OBRIŠI</button></div></div>`).join(''):'<div class="ymf-empty">NEMA LOKACIJA. Dodaj prvu lokaciju.</div>'}</div>
    <div class="ymf-add"><input id="mfNewLocation" placeholder="Naziv nove lokacije"><button ${disabled} class="primary" data-mf-add-loc>DODAJ LOKACIJU</button></div>
   </section>
   <section class="ymf-card">
    <h3>2 · SKLADIŠTA</h3><p>Svako skladište mora pripadati jednoj Master lokaciji.</p>
    <div class="ymf-list">${whs.length?whs.map(w=>`
      <div class="ymf-row"><div class="ymf-row-main"><input data-mf-wh-name="${esc(w.id)}" value="${esc(w.name)}">
       <select data-mf-wh-loc="${esc(w.id)}">${locs.map(l=>`<option value="${esc(l.id)}" ${l.id===w.location_id?'selected':''}>${esc(l.name)}</option>`).join('')}</select></div>
       <div class="ymf-actions"><button ${disabled} data-mf-save-wh-name="${esc(w.id)}">SPREMI</button><button ${disabled} class="danger" data-mf-del-wh="${esc(w.id)}">OBRIŠI</button></div></div>`).join(''):'<div class="ymf-empty">NEMA SKLADIŠTA.</div>'}</div>
    <div class="ymf-add three"><input id="mfNewWarehouse" placeholder="Naziv skladišta"><select id="mfNewWarehouseLoc">${locs.map(l=>`<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('')}</select><button ${disabled||(!locs.length?'disabled':'')} class="primary" data-mf-add-wh>DODAJ SKLADIŠTE</button></div>
   </section>
   <section class="ymf-card full">
    <h3>3 · OPERATIVNI MASTER SKLADIŠTA I RAMPI</h3>
    <p>Kapacitet ostaje NEPOZNAT dok ga ručno ne definiraš. Rampe koje ovdje dodaš odmah grade Planner, Daily/Weekly Map, Prijam i My Yard.</p>
    ${whs.length?whs.map(w=>{
      const cp=capacity(w.id),de=det(w.id),h=hours(w.id),n=Math.max(0,Number(w.ramps)||0);
      return `<article class="ymf-wh">
       <div class="ymf-wh-head"><div><strong>${esc(w.name)}</strong><small>${esc(locationName(w.location_id,d))}</small></div>
        <div class="${cp==null?'ymf-cap-unknown':''}">${cp==null?'KAPACITET NEPOZNAT':cp+' PALETA / DAN'}</div></div>
       <div class="ymf-sector"><h4>SKLADIŠTE · KAPACITET · RADNO VRIJEME</h4>
        <div class="ymf-fields">
         <label>DNEVNI KAPACITET PALETA<input ${disabled} data-mf-cap="${esc(w.id)}" type="number" min="1" placeholder="NEPOZNAT" value="${cp??''}"></label>
         <label>PRIJAM OD<input ${disabled} data-mf-wh-from="${esc(w.id)}" type="time" value="${esc(h.x)}"></label>
         <label>PRIJAM DO<input ${disabled} data-mf-wh-to="${esc(w.id)}" type="time" value="${esc(h.y)}"></label>
        </div>
        <button ${disabled} class="primary" data-mf-save-ops="${esc(w.id)}">SPREMI PODATKE SKLADIŠTA</button>
       </div>
       <div class="ymf-sector"><h4>RAMPE</h4>
        <div class="ymf-ramp-toolbar"><button ${disabled} class="primary" data-mf-add-ramp="${esc(w.id)}">+ DODAJ RAMPU</button><button ${disabled||(!n?'disabled':'')} data-mf-remove-ramp="${esc(w.id)}">− OBRIŠI ZADNJU RAMPU</button><span class="ymf-cap-unknown">${n?`${n} ${n===1?'RAMPA':'RAMPI'}`:'NEMA RAMPI'}</span></div>
        ${n?Array.from({length:n},(_,i)=>i+1).map(r=>{
          const m=rampMeta(w.id,r),rh=rampHours(w.id,r),rate=rampRate(w.id,r),mx=rampMax(w.id,r);
          return `<div class="ymf-ramp ${m.active?'':'off'}">
           <label>NAZIV<input ${disabled} data-mf-r-name="${esc(w.id)}:${r}" value="${esc(m.name)}"></label>
           <label>STATUS<select ${disabled} data-mf-r-active="${esc(w.id)}:${r}"><option value="1" ${m.active?'selected':''}>ON</option><option value="0" ${!m.active?'selected':''}>OFF</option></select></label>
           <label>RADI OD<input ${disabled} data-mf-r-from="${esc(w.id)}:${r}" type="time" value="${esc(rh.from)}"></label>
           <label>RADI DO<input ${disabled} data-mf-r-to="${esc(w.id)}:${r}" type="time" value="${esc(rh.to)}"></label>
           <label>PALETA / SAT<input ${disabled} data-mf-r-rate="${esc(w.id)}:${r}" type="number" min="1" placeholder="NEPOZNAT" value="${rate??''}"></label>
           <label>MAX PALETA<input ${disabled} data-mf-r-max="${esc(w.id)}:${r}" type="number" min="1" placeholder="NEPOZNAT" value="${mx??''}"></label>
           <button ${disabled} data-mf-save-ramp="${esc(w.id)}:${r}">SPREMI PROMJENE RAMPE ${r}</button>
          </div>`;
        }).join(''):'<div class="ymf-empty">Nema rampi. Klikni + DODAJ RAMPU.</div>'}
       </div>
      </article>`;
    }).join(''):'<div class="ymf-empty">Prvo dodaj lokaciju i skladište.</div>'}
   </section>
  </div>`;
}

/* Single capture owner */
document.addEventListener('click',e=>{
 const t=e.target;
 let b=t.closest?.('[data-mf-add-loc]');if(b){e.preventDefault();e.stopImmediatePropagation();addLocation(document.getElementById('mfNewLocation')?.value);return}
 b=t.closest?.('[data-mf-save-loc]');if(b){e.preventDefault();e.stopImmediatePropagation();renameLocation(b.dataset.mfSaveLoc,document.querySelector(`[data-mf-loc-name="${b.dataset.mfSaveLoc}"]`)?.value);return}
 b=t.closest?.('[data-mf-del-loc]');if(b){e.preventDefault();e.stopImmediatePropagation();if(confirm('Obrisati lokaciju?'))deleteLocation(b.dataset.mfDelLoc);return}
 b=t.closest?.('[data-mf-add-wh]');if(b){e.preventDefault();e.stopImmediatePropagation();addWarehouse(document.getElementById('mfNewWarehouse')?.value,document.getElementById('mfNewWarehouseLoc')?.value);return}
 b=t.closest?.('[data-mf-save-wh-name]');if(b){e.preventDefault();e.stopImmediatePropagation();const id=b.dataset.mfSaveWhName;renameWarehouse(id,document.querySelector(`[data-mf-wh-name="${id}"]`)?.value,document.querySelector(`[data-mf-wh-loc="${id}"]`)?.value);return}
 b=t.closest?.('[data-mf-del-wh]');if(b){e.preventDefault();e.stopImmediatePropagation();if(confirm('Obrisati skladište i njegove Master postavke?'))deleteWarehouse(b.dataset.mfDelWh);return}
 b=t.closest?.('[data-mf-save-ops]');if(b){e.preventDefault();e.stopImmediatePropagation();saveWarehouseOps(b.dataset.mfSaveOps);return}
 b=t.closest?.('[data-mf-add-ramp]');if(b){e.preventDefault();e.stopImmediatePropagation();const d=master(),w=d.warehouses.find(x=>x.id===b.dataset.mfAddRamp);setRampCount(w.id,(Number(w.ramps)||0)+1);return}
 b=t.closest?.('[data-mf-remove-ramp]');if(b){e.preventDefault();e.stopImmediatePropagation();const d=master(),w=d.warehouses.find(x=>x.id===b.dataset.mfRemoveRamp);if(w&&Number(w.ramps)>0&&confirm('Obrisati zadnju rampu?'))setRampCount(w.id,Number(w.ramps)-1);return}
 b=t.closest?.('[data-mf-save-ramp]');if(b){e.preventDefault();e.stopImmediatePropagation();const [code,r]=b.dataset.mfSaveRamp.split(':');saveRamp(code,Number(r));return}
},true);

/* ---------- STABLE HEADER ---------- */
function ensureStableHeader(){
 const top=document.querySelector('.topbar');if(!top)return;
 let x=document.getElementById('yardivoStableContextV583');
 if(!x){
   x=document.createElement('div');x.id='yardivoStableContextV583';
   x.innerHTML='<div class="ysc-field"><small>AKTIVNA LOKACIJA</small><select id="yscLocationSelect" aria-label="Aktivna lokacija"></select></div><div class="ysc-field"><small>AKTIVNO SKLADIŠTE</small><select id="yscWarehouseSelect" aria-label="Aktivno skladište"></select></div><span class="ysc-live">● LIVE</span>';
   x.querySelector('#yscLocationSelect')?.addEventListener('change',e=>{
     try{window.YardivoAppStateV583?.setLocation?.(e.target.value)}catch(_){}
     renderContextSelectors();paintHeader();
   });
   x.querySelector('#yscWarehouseSelect')?.addEventListener('change',e=>{
     try{window.YardivoAppStateV583?.setWarehouse?.(e.target.value)}catch(_){}
     renderContextSelectors();paintHeader();
   });
   const first=top.firstElementChild;first?.insertAdjacentElement('afterend',x);
 }
 paintHeader();
}
function currentLoc(){try{return String(window.YardivoAppStateV583?.location?.()||'')}catch(_){return''}}
function currentWh(){try{return String(window.YardivoAppStateV583?.warehouse?.()||window.activeWarehouse||'')}catch(_){return''}}
function renderContextSelectors(){
 const d=master(),s=window.currentSession||{},r=String(s.role||s.app_role||'').trim().toLowerCase(),lid=currentLoc(),wid=currentWh();
 const ls=document.getElementById('yscLocationSelect'),ws=document.getElementById('yscWarehouseSelect');
 const isAdmin=r==='admin';
 const assignedWh=new Set((Array.isArray(s.warehouses)?s.warehouses:[]).map(x=>String(x)));
 let locRows=d.locations.filter(x=>x&&x.active!==false);
 if(!isAdmin){
   const fixed=String(s.location||'').trim();
   if(fixed&&fixed!=='ALL')locRows=locRows.filter(x=>String(x.id)===fixed);
   else if(assignedWh.size){
     const locIds=new Set(d.warehouses.filter(w=>assignedWh.has(String(w.id))).map(w=>String(w.location_id)));
     locRows=locRows.filter(x=>locIds.has(String(x.id)));
   }else locRows=[];
 }
 if(ls){
   const sig=locRows.map(x=>x.id+'|'+x.name).join('¦');
   if(ls.dataset.sig!==sig){
     ls.dataset.sig=sig;
     ls.innerHTML=locRows.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('');
   }
   const wanted=locRows.some(x=>String(x.id)===String(lid))?String(lid):String(locRows[0]?.id||'');
   if(ls.value!==wanted)ls.value=wanted;
   ls.disabled=!isAdmin&&locRows.length<=1;
 }
 if(ws){
   let rows=d.warehouses.filter(x=>x&&x.active!==false&&(!lid||String(x.location_id)===String(lid)));
   if(!isAdmin)rows=rows.filter(x=>assignedWh.has(String(x.id)));
   const sig=rows.map(x=>x.id+'|'+x.name).join('¦');
   if(ws.dataset.sig!==sig){
     ws.dataset.sig=sig;
     ws.innerHTML=rows.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('');
   }
   const wanted=rows.some(x=>String(x.id)===String(wid))?String(wid):String(rows[0]?.id||'');
   if(ws.value!==wanted)ws.value=wanted;
   ws.disabled=!rows.length||(!isAdmin&&rows.length<=1);
 }
}
function paintHeader(){renderContextSelectors()}

/* ---------- CAPACITY UNKNOWN AUTHORITY ---------- */
window.getWarehouseCapacity=function(code){return capacity(String(code||''))};
window.getRampCapacity=function(code,r){return rampMax(String(code||''),String(r))};
function paintCapacityUi(){
 const wh=currentWh();const c=capacity(wh);
 const label=document.getElementById('dailyCapacityLabel');
 const total=document.getElementById('dailyCapacityTotal');
 const free=document.getElementById('dailyCapacityFree');
 const pct=document.getElementById('dailyCapacityPercent');
 const state=document.getElementById('dailyCapacityState');
 if(c==null){
   if(label)label.textContent='Kapacitet: NEPOZNAT';
   if(total){total.textContent='NEPOZNAT';total.classList.add('unknown')}
   if(free){free.textContent='—';free.classList.add('unknown')}
   if(pct)pct.textContent='—';
   if(state)state.textContent='NEPOZNAT';
 }else{
   if(label)label.textContent=`Kapacitet: ${c} paleta / dan`;
   if(total){total.textContent=`${c} pal.`;total.classList.remove('unknown')}
   if(free)free.classList.remove('unknown');
 }
 document.querySelectorAll('#dashboard .panel-head small').forEach(el=>{
   if(/Dnevni kapacitet:/i.test(el.textContent||''))el.textContent=c==null?'Dnevni kapacitet: NEPOZNAT':`Dnevni kapacitet: ${c} paleta`;
 });
}

/* ---------- NO STALE TOASTS / BADGES / COUNTS ---------- */
function paintSupplierBadge(){/* owned by SupplierInboxStableFinalV583 */}
function paintSaved(){
 const el=document.getElementById('homeStorageStatus');if(!el)return;
 let a=[];try{a=Array.isArray(announcements)?announcements:[]}catch(_){}
 const n=a.filter(x=>x&&x.deleted!==true).length;
 el.textContent=`SPREMLJENO: ${n} ${n===1?'NAJAVA':'NAJAVA'}`;
}
function killStaleToasts(){
 if(cleanupActive||!cleanupDone){
   document.querySelectorAll('#yardivoLiveToasts .y-toast,#yardivoLiveToasts>*').forEach(x=>x.remove());
 }
}

/* ---------- BOOT/EVENTS ---------- */
['yardivo:master-data-changed','yardivo:context-changed'].forEach(ev=>window.addEventListener(ev,()=>{
 const editing=!!document.activeElement?.closest?.('#yardivoMasterFoundationV583');
 if(!editing)queueRender();
 setTimeout(()=>{paintHeader();paintCapacityUi()},20);
}));
window.addEventListener('yardivo:data-synced',()=>{
 let pending=false;try{pending=localStorage.getItem(SERVER_PENDING)==='1'}catch(_){}
 const wasCleaning=cleanupActive||pending;
 cleanupDone=true;cleanupActive=false;
 if(wasCleaning)clearRuntime();
 if(!document.activeElement?.closest?.('#yardivoMasterFoundationV583'))queueRender();
 paintHeader();paintCapacityUi();paintSupplierBadge();paintSaved();
});
window.addEventListener('yardivo:factory-zero-server-cleared',()=>{cleanupDone=true;cleanupActive=false;clearRuntime();queueRender()});
window.addEventListener('yardivo:login',()=>{ensureStableHeader();waitForServerCleanup();setTimeout(()=>{queueRender();paintSaved();killStaleToasts()},40)});
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{ensureStableHeader();render();paintCapacityUi();paintSaved();killStaleToasts()},80));
window.addEventListener('load',()=>setTimeout(()=>{ensureStableHeader();render();paintCapacityUi();paintSupplierBadge();killStaleToasts()},250),{once:true});
document.addEventListener('click',e=>{if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]'))setTimeout(render,20)},true);

window.YardivoMasterFoundationV583={
 build:BUILD,master,render,capacity,detention:det,
 addLocation,addWarehouse,setRampCount,saveRamp,
 cleanState:()=>({cleanupActive,cleanupDone})
};
window.YARDIVO_DEV_BUILD=BUILD;
})();
