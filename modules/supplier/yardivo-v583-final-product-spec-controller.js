
(function(){
'use strict';
const BUILD='20260912-dev-v5.8.3-product-spec-final';
const MASTER='yardivo_master_data_registry_v583';
const CAP='yardivo_capacity_config_v1';
const HOURS='yardivo_reception_master_hours_v1';
const DET='yardivo_detention_settings_v1';
const CFG='yardivo_auto_replan_cfg_v1';
const NOTIF='yardivo_live_notifications_v1';
let smartBusy=new Set();

function jget(k,f={}){
 try{const x=JSON.parse(localStorage.getItem(k)||'null');return x&&typeof x==='object'?x:f}catch(_){return f}
}
function jset(k,v){localStorage.setItem(k,JSON.stringify(v))}
function master(){
 const d=jget(MASTER,null);
 return d&&Array.isArray(d.locations)&&Array.isArray(d.warehouses)&&Array.isArray(d.suppliers)?d:{locations:[],warehouses:[],suppliers:[]}
}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function activeWh(){
 try{return String(window.YardivoAppStateV583?.warehouse?.()||window.activeWarehouse||'')}catch(_){return''}
}
function currentRole(){
 let r=String(window.currentSession?.role||'').toLowerCase().trim();
 if(r==='management'||r==='voditelj')r='manager';if(r==='zalihe')r='inventory';if(r==='prijam')r='reception';if(r==='porta')r='gate';
 return r
}

/* 1. Home location chooser under logo */
function centerHomeLocation(){
 const wrap=document.querySelector('#homeMenu .home-menu-wrap'),brand=document.querySelector('#homeMenu .home-menu-brand'),box=document.querySelector('#homeMenu .home-location-box');
 if(!wrap||!brand||!box)return;
 let center=document.getElementById('yardivoHomeLocationCenterV583');
 if(!center){center=document.createElement('div');center.id='yardivoHomeLocationCenterV583';brand.insertAdjacentElement('afterend',center)}
 if(box.parentElement!==center)center.appendChild(box);
}

/* 2. Master Data -> authoritative legacy runtime compatibility */
function syncRuntimeMaster(){
 const d=master(),caps=jget(CAP,{}),hours=jget(HOURS,{});
 try{
  if(typeof WAREHOUSES!=='undefined'){
   Object.keys(WAREHOUSES).forEach(k=>delete WAREHOUSES[k]);
   for(const w of d.warehouses.filter(x=>x&&x.active!==false)){
    const h=hours[w.id]||{};
    WAREHOUSES[w.id]={
     code:String(w.id),name:String(w.name||w.id),location:String(d.locations.find(l=>l.id===w.location_id)?.name||''),
     location_id:String(w.location_id||''),ramps:Math.max(0,Number(w.ramps)||0),
     receptionStart:String(h.from||''),receptionEnd:String(h.to||''),
     capacity:caps?.[w.id]?.warehousePallets??null
    };
   }
  }
 }catch(e){console.warn('[YARDIVO MASTER -> WAREHOUSES]',e)}

 try{
  if(typeof suppliers!=='undefined'&&Array.isArray(suppliers)){
   suppliers.splice(0,suppliers.length,...d.suppliers.filter(x=>x&&x.active!==false).map(x=>String(x.name||x.supplier_name||x.id||'')).filter(Boolean));
  }
 }catch(e){console.warn('[YARDIVO MASTER -> SUPPLIERS]',e)}

 const f=['populateAnnouncementControls','renderWarehouseCards','renderRampe','renderDockOverview','renderDailyMap','renderWeeklyMap','renderOverview','renderReceiving','renderPlannerPro'];
 for(const n of f){try{if(typeof window[n]==='function')window[n]()}catch(_){}}
 try{window.YardivoMyYard?.render?.()}catch(_){}
 try{window.YardivoMyYardWebGL?.refresh?.()}catch(_){}
}

/* 3. Supplier master CRUD */
function supplierName(x){return String(x?.name||x?.supplier_name||'').trim()}
function nextSupplierId(arr){
 let n=0;for(const x of arr){const m=String(x?.id||'').match(/(\d+)$/);if(m)n=Math.max(n,+m[1]||0)}
 return 'SUP'+String(n+1).padStart(3,'0')
}
function saveMaster(d,reason){
 d.__masterUpdatedAtV583=new Date().toISOString();
 d.__masterWriteTokenV583='SPEC-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
 jset(MASTER,d);
 try{window.YardivoMasterDataV583?.save?.(JSON.parse(JSON.stringify(d)))}catch(_){}
 try{window.YardivoSupabase?.flushQueue?.()}catch(_){}
 try{window.dispatchEvent(new CustomEvent('yardivo:master-data-changed',{detail:{source:'product-spec',reason}}))}catch(_){}
 syncRuntimeMaster();renderMasterSuppliers();renderSupplierSection();renderOverviewMaster();
}
function renderMasterSuppliers(){
 const root=document.getElementById('yardivoStableMasterEditorV583')||document.getElementById('yardivoSettingsMasterPaneV583')||document.getElementById('settings');
 if(!root)return;
 let card=document.getElementById('yardivoMasterSuppliersV583');
 if(!card){card=document.createElement('section');card.id='yardivoMasterSuppliersV583';root.appendChild(card)}
 if(document.activeElement?.closest?.('#yardivoMasterSuppliersV583'))return;
 const d=master(),rows=d.suppliers.filter(x=>x&&x.active!==false);
 card.innerHTML=`<h3>DOBAVLJAČI</h3><p>Jedini popis dobavljača u YARDIVO-u. Overview, Najave i Supplier prikazi koriste samo ovaj Master popis.</p>
 <div class="ymsup-list">${rows.length?rows.map(x=>`<div class="ymsup-row"><input data-spec-sup-name="${esc(x.id)}" value="${esc(supplierName(x))}"><div><button data-spec-sup-save="${esc(x.id)}">SPREMI</button> <button class="danger" data-spec-sup-del="${esc(x.id)}">OBRIŠI</button></div></div>`).join(''):'<div class="ysm-empty">Nema dobavljača.</div>'}</div>
 <div class="ymsup-add"><input id="specNewSupplier" placeholder="Naziv novog dobavljača"><button class="primary" data-spec-sup-add>DODAJ DOBAVLJAČA</button></div>`;
}
document.addEventListener('click',e=>{
 let b=e.target.closest?.('[data-spec-sup-add]');
 if(b){e.preventDefault();e.stopImmediatePropagation();const n=String(document.getElementById('specNewSupplier')?.value||'').trim();if(!n)return;const d=master();d.suppliers.push({id:nextSupplierId(d.suppliers),name:n,active:true});saveMaster(d,'supplier.add');return}
 b=e.target.closest?.('[data-spec-sup-save]');
 if(b){e.preventDefault();e.stopImmediatePropagation();const d=master(),x=d.suppliers.find(v=>String(v.id)===String(b.dataset.specSupSave)),n=String(document.querySelector(`[data-spec-sup-name="${b.dataset.specSupSave}"]`)?.value||'').trim();if(x&&n){x.name=n;saveMaster(d,'supplier.update')}return}
 b=e.target.closest?.('[data-spec-sup-del]');
 if(b){e.preventDefault();e.stopImmediatePropagation();if(!confirm('Obrisati dobavljača iz Master Podataka?'))return;const d=master();d.suppliers=d.suppliers.filter(x=>String(x.id)!==String(b.dataset.specSupDel));saveMaster(d,'supplier.delete');return}
},true);

/* 4. Suppliers screen exact Master count/list */
function renderSupplierSection(){
 const host=document.getElementById('supplierGrid'),cnt=document.getElementById('supplierCount');if(!host||!cnt)return;
 const q=String(document.getElementById('supplierPretraži')?.value||'').trim().toLowerCase();
 const all=master().suppliers.filter(x=>x&&x.active!==false&&supplierName(x));
 const rows=all.filter(x=>supplierName(x).toLowerCase().includes(q));
 cnt.textContent=`${rows.length} / ${all.length} dobavljača`;
 let anns=[];try{anns=Array.isArray(announcements)?announcements:[]}catch(_){}
 let incs=[];try{incs=Array.isArray(incidents)?incidents:[]}catch(_){}
 host.innerHTML=rows.length?rows.map((x,i)=>{
  const n=supplierName(x),a=anns.filter(v=>v?.supplier===n).length,ic=incs.filter(v=>v?.supplier===n).length;
  return `<div class="card supplier-click-card supplier-card" role="button" tabindex="0" data-supplier-name="${esc(n)}"><h3>${esc(n)}</h3><div class="meta">Dobavljač #${String(i+1).padStart(3,'0')}<br>Status: <span style="color:#1677f2">AKTIVAN</span><br>Najave: <strong>${a}</strong> · Incidenti: <strong>${ic}</strong></div></div>`;
 }).join(''):'<div class="dash-empty">Nema dobavljača u Master Podacima.</div>';
}
document.getElementById('supplierPretraži')?.addEventListener('input',renderSupplierSection);

/* 5. Overview always exposes registered supplier count */
function renderOverviewMaster(){
 const view=document.getElementById('overview');if(!view)return;
 let p=document.getElementById('yardivoOverviewMasterV583');
 if(!p){p=document.createElement('div');p.id='yardivoOverviewMasterV583';view.prepend(p)}
 const n=master().suppliers.filter(x=>x&&x.active!==false).length;
 p.innerHTML=`<div><small>REGISTRIRANI DOBAVLJAČI · MASTER DATA</small><div>Overview koristi isključivo stvarno kreirane dobavljače.</div></div><strong>${n}</strong>`;
}

/* 6. Dashboard KPI detail list */
function dashboardRows(label){
 let a=[];try{a=Array.isArray(announcements)?announcements:[]}catch(_){}
 const wh=activeWh(),today=window.yardivoLocalDateV583?.(new Date())||new Date().toLocaleDateString('sv-SE');
 let rows=a.filter(x=>x&&x.deleted!==true&&(!wh||wh==='ALL'||String(x.warehouse)===wh)&&String(x.date||'')===today);
 const L=String(label||'').toUpperCase();
 if(L.includes('ČEKANJU'))rows=rows.filter(x=>/stiga|dvori|ček|cek/i.test(String(x.status||'')));
 else if(L.includes('NA RAMPI'))rows=rows.filter(x=>/rampi|zaprimanje/i.test(String(x.status||'')));
 else if(L.includes('ZAPRIMLJENO'))rows=rows.filter(x=>/zaprimljeno|zavr/i.test(String(x.status||'')));
 else if(L.includes('PALETE'))return rows.map(x=>({...x,__detail:`${Number(x.pallets||0)} pal.`}));
 else if(L.includes('PAŽNJU'))rows=rows.filter(x=>/kas|no.?show|odbij|nije došao|nije dosao/i.test(String(x.status||'')));
 return rows;
}
function showDashboardDetail(card){
 const host=document.getElementById('dashPrimaryKpis');if(!host)return;
 let panel=document.getElementById('yardivoDashKpiDetailV583');
 if(!panel){panel=document.createElement('div');panel.id='yardivoDashKpiDetailV583';host.insertAdjacentElement('afterend',panel)}
 const label=card.querySelector('small')?.textContent||'DETALJI',rows=dashboardRows(label);
 panel.innerHTML=`<h3>${esc(label)}</h3><div class="ydkd-list">${rows.length?rows.slice(0,50).map(x=>`<div class="ydkd-row"><span>${esc(x.time||'—')}</span><strong>${esc(x.supplier||'—')}</strong><span>${esc(x.__detail||x.status||('R'+(x.dock||'—')))}</span></div>`).join(''):'<div class="dash-empty">Nema stavki za odabrano skladište i današnji datum.</div>'}</div>`;
}
document.addEventListener('click',e=>{
 const card=e.target.closest?.('#dashPrimaryKpis .dash-clean-kpi');if(!card)return;showDashboardDetail(card);
},true);

/* 7. Role-targeted notifications: existing store is canonical, final visibility guard */
function notificationVisible(n){
 const r=currentRole(),roles=Array.isArray(n?.roles)?n.roles.map(x=>String(x).toLowerCase()):[];
 return !roles.length||roles.includes(r)||r==='admin'
}
function pruneVisibleNotifications(){
 const list=document.getElementById('notifList');if(!list)return;
 let arr=[];try{arr=JSON.parse(localStorage.getItem(NOTIF)||'[]');if(!Array.isArray(arr))arr=[]}catch(_){}
 const visible=arr.filter(notificationVisible);
 const count=document.getElementById('notifCount');if(count)count.textContent=String(visible.filter(x=>!x?.readBy?.[window.currentSession?.username||window.currentSession?.user||'']).length);
}

/* 8. Smart: only ON executes. When ON, safely auto-apply and notify everyone relevant. */
function smartCfg(){
 const d={enabled:false,mode:'PAUSED'};try{return {...d,...JSON.parse(localStorage.getItem(CFG)||'{}')}}catch(_){return d}
}
function smartOn(){const c=smartCfg();return !!c.enabled&&c.mode!=='PAUSED'}
function pushNotif(title,body,a,roles=['admin','manager','inventory','reception']){
 let arr=[];try{arr=JSON.parse(localStorage.getItem(NOTIF)||'[]');if(!Array.isArray(arr))arr=[]}catch(_){}
 const now=new Date().toISOString();
 arr.push({id:'SMARTAUTO-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),event:'SMART_AUTO_APPLIED',title,body,at:now,createdAt:now,roles,readBy:{},supplier:a?.supplier||'',announcementId:a?.id||'',warehouse:a?.warehouse||''});
 localStorage.setItem(NOTIF,JSON.stringify(arr.slice(-1200)));
 try{putCloudState?.(NOTIF,JSON.stringify(arr.slice(-1200)))}catch(_){}
 try{window.YardivoNotifications?.render?.()}catch(_){}
 pruneVisibleNotifications();
}
function bigSmartNotice(title,body){
 document.getElementById('yardivoSmartBigNoticeV583')?.remove();
 const x=document.createElement('div');x.id='yardivoSmartBigNoticeV583';x.innerHTML=`<h3>⚡ ${esc(title)}</h3><p>${esc(body)}</p><button type="button">U REDU</button>`;document.body.appendChild(x);x.querySelector('button').onclick=()=>x.remove();setTimeout(()=>x.remove(),15000);
}
async function autoApplySmartLog(l){
 if(!smartOn()||!l||l.status!=='PENDING_INVENTORY'||!l.newSlot||smartBusy.has(String(l.id)))return;
 smartBusy.add(String(l.id));
 try{
  let anns=[];try{anns=Array.isArray(announcements)?announcements:[]}catch(_){}
  const a=anns.find(x=>String(x.id)===String(l.announcementId));if(!a)return;
  const old={date:a.date,time:a.time,dock:a.dock};
  const ns=l.newSlot;
  if(a.supplierDeliveryId&&window.YardivoSupplierLiveSync?.call){
   await window.YardivoSupplierLiveSync.call('internal_update',{
    id:a.supplierDeliveryId,delivery_date:ns.date,requested_time:ns.time,dock:'R'+Number(ns.dock),
    status:'confirmed',review_note:`YARDIVO Smart automatski promijenio termin: ${old.date} ${old.time} R${old.dock} → ${ns.date} ${ns.time} R${ns.dock}.`
   });
  }
  a.date=ns.date;a.time=ns.time;a.dock=Number(ns.dock);a.updatedAt=new Date().toISOString();a.updatedBy='YARDIVO SMART';
  try{saveAnnouncements?.()}catch(_){}
  l.status='AUTO_APPLIED';l.autoAppliedAt=new Date().toISOString();l.autoAppliedBy='YARDIVO SMART';
  let logs=[];try{logs=JSON.parse(localStorage.getItem('yardivo_auto_replan_log_v1')||'[]');if(!Array.isArray(logs))logs=[]}catch(_){}
  const ix=logs.findIndex(x=>String(x.id)===String(l.id));if(ix>=0)logs[ix]=l;localStorage.setItem('yardivo_auto_replan_log_v1',JSON.stringify(logs.slice(-1000)));
  const msg=`${a.supplier||'Dobavljač'} · ${old.date} ${old.time} R${old.dock} → ${a.date} ${a.time} R${a.dock}. ${l.reason||'Smart optimizacija termina.'}`;
  pushNotif('YARDIVO SMART JE PROMIJENIO TERMIN',msg,a,['admin','manager','inventory','reception']);
  bigSmartNotice('YARDIVO SMART JE PROMIJENIO TERMIN',msg);
  syncRuntimeMaster();
  try{window.dispatchEvent(new CustomEvent('yardivo:supplier-request-updated',{detail:{id:a.supplierDeliveryId||'',source:'smart-auto'}}))}catch(_){}
 }catch(e){
  console.error('[YARDIVO SMART AUTO]',e);
  pushNotif('YARDIVO SMART · PROMJENA NIJE IZVRŠENA',String(e?.message||e),null,['admin','inventory']);
 }finally{smartBusy.delete(String(l.id))}
}
function reconcileSmart(){
 if(!smartOn())return;
 let logs=[];try{logs=JSON.parse(localStorage.getItem('yardivo_auto_replan_log_v1')||'[]');if(!Array.isArray(logs))logs=[]}catch(_){}
 logs.filter(x=>x?.status==='PENDING_INVENTORY').forEach(autoApplySmartLog);
}

/* 9. Strict empty + deterministic boot */
function zeroGuard(){
 const d=master();
 if(!d.locations.length&&!d.warehouses.length&&!d.suppliers.length){
  let a=[];try{a=Array.isArray(announcements)?announcements:[]}catch(_){}
  if(!a.length){
   const s=document.getElementById('homeStorageStatus');if(s)s.textContent='SPREMLJENO: 0 NAJAVA';
  }
 }
}

function boot(){
 centerHomeLocation();syncRuntimeMaster();renderMasterSuppliers();renderSupplierSection();renderOverviewMaster();pruneVisibleNotifications();zeroGuard();reconcileSmart();
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,100));
window.addEventListener('load',()=>setTimeout(boot,280),{once:true});
window.addEventListener('yardivo:login',()=>setTimeout(boot,100));
window.addEventListener('yardivo:master-data-changed',()=>setTimeout(()=>{syncRuntimeMaster();renderMasterSuppliers();renderSupplierSection();renderOverviewMaster();zeroGuard()},30));
window.addEventListener('yardivo:context-changed',()=>setTimeout(()=>{syncRuntimeMaster();renderSupplierSection();renderOverviewMaster()},30));
window.addEventListener('yardivo:data-synced',()=>setTimeout(()=>{syncRuntimeMaster();renderSupplierSection();renderOverviewMaster();pruneVisibleNotifications();reconcileSmart()},80));
window.addEventListener('yardivo:notifications-changed',()=>setTimeout(pruneVisibleNotifications,20));
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]'))setTimeout(renderMasterSuppliers,50);
 if(e.target.closest?.('[data-view="suppliers"],[data-home-target="suppliers"]'))setTimeout(renderSupplierSection,50);
 if(e.target.closest?.('[data-view="overview"],[data-home-target="overview"]'))setTimeout(renderOverviewMaster,50);
},true);

/* A low-frequency Smart watchdog only checks for new Smart logs; it never repaints forms. */
setInterval(reconcileSmart,5000);

window.YardivoProductSpecV583={
 build:BUILD,master,syncRuntimeMaster,renderSupplierSection,renderOverviewMaster,smartOn,reconcileSmart
};
window.YARDIVO_DEV_BUILD=BUILD;
})();
