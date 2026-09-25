
(function(){
'use strict';
const BUILD='20260912-dev-v5.8.3-handover-production-empty-final';
const ADMIN='admin1';
const MASTER='yardivo_master_data_registry_v583';
const CLEAN='yardivo_handover_clean_epoch_v583';
const ARRAY_KEYS=[
 'yardivo_yms_announcements_v1','studenac_announcements','yardivo_announcements','yms_announcements',
 'yardivo_yms_incidents_v1','yardivo_incidents',
 'yardivo_live_notifications_v1','yardivo_master_notifications_v1',
 'yardivo_notifications','yardivo_notifications_v1','yardivo_notifications_v2','yardivo_notifications_v583',
 'yardivo_notification_history_v1','yardivo_notification_history_v583','studenac_notifications','yms_notifications',
 'yardivo_epal_transactions_v1','yardivo_epal_initial_stock_v1','yms_trucks_v2',
 'yardivo_auto_replan_log_v1','yardivo_supplier_scores_v1',
 'yardivo_supplier_deliveries_v1','yardivo_supplier_requests_v1',
 'yardivo_supabase_offline_queue_v1','yardivo_supabase_offline_queue_v2'
];
const REMOVE_KEYS=[
 'yardivo_dynamic_warehouses_v1','yardivo_ramp_config_v1','yardivo_ramp_capacity_v1',
 'yardivo_ramp_hours_v1','yardivo_ramp_hours_v583','yardivo_reception_master_hours_v1',
 'yardivo_capacity_config_v1','yardivo_detention_settings_v1','yardivo_ramp_master_v583',
 'studenac_ramp_blocks','studenac_custom_holidays','studenac_holiday_overrides',
 'studenac_active_warehouse','yardivo_active_warehouse','yardivo_last_location','yardivo_selected_location',
 'yardivo_data_last_saved_at','yardivo_last_incident_notice','yardivo_notification_seen_v5'
];
function emptyMaster(){
 return {
  suppliers:[],locations:[],warehouses:[],
  __factoryZeroV583:true,
  __handoverEmptyV583:true,
  __emptySupplierSeedMigrationV583:true,
  __emptyWarehouseMigrationV583:true,
  __masterUpdatedAtV583:new Date().toISOString()
 };
}
function wipeLocalBusiness(){
 ARRAY_KEYS.forEach(k=>{try{localStorage.setItem(k,'[]')}catch(_){}});
 REMOVE_KEYS.forEach(k=>{try{localStorage.removeItem(k);sessionStorage.removeItem(k)}catch(_){}});
 try{localStorage.setItem(MASTER,JSON.stringify(emptyMaster()))}catch(_){}
 try{
  if(!localStorage.getItem(CLEAN))localStorage.setItem(CLEAN,new Date().toISOString());
  localStorage.setItem('yardivo_clean_epoch_v583',localStorage.getItem(CLEAN));
 }catch(_){}
 try{if(typeof announcements!=='undefined'&&Array.isArray(announcements))announcements.length=0}catch(_){}
 try{if(typeof incidents!=='undefined'&&Array.isArray(incidents))incidents.length=0}catch(_){}
 try{if(typeof notifications!=='undefined'&&Array.isArray(notifications))notifications.length=0}catch(_){}
 try{window.YardivoNotificationsV583?.clear?.()}catch(_){}
 try{document.querySelectorAll('#yardivoLiveToasts>*').forEach(x=>x.remove())}catch(_){}
}
function enforceEmptyUi(){
 let anns=[];try{anns=typeof announcements!=='undefined'&&Array.isArray(announcements)?announcements:[]}catch(_){}
 const m=(()=>{try{return JSON.parse(localStorage.getItem(MASTER)||'{}')}catch(_){return{}}})();
 const empty=!anns.length&&!(m.locations||[]).length&&!(m.warehouses||[]).length;
 document.body.classList.toggle('yardivo-handover-empty',empty);
 if(empty){
   const s=document.getElementById('homeStorageStatus');if(s)s.textContent='SPREMLJENO: 0 NAJAVA';
   /* Supplier inbox is server-authoritative and is not blanked by handover state. */
  }
}
function sanitizeLegacy(){
 const d=(()=>{try{return JSON.parse(localStorage.getItem(MASTER)||'{}')}catch(_){return{locations:[],warehouses:[]}}})();
 const ids=new Set((d.warehouses||[]).map(x=>String(x.id)));
 const legacy=/^(W101|W103|W104|W201|W202|W203|W204)$/i;
 document.querySelectorAll('select option').forEach(o=>{
  if(legacy.test(String(o.value||''))&&!ids.has(String(o.value)))o.remove();
 });
}
function readinessCard(){
 const settings=document.getElementById('settings');if(!settings)return;
 let c=document.getElementById('yardivoBackendReadinessV583');
 if(!c){
  c=document.createElement('section');c.id='yardivoBackendReadinessV583';
  c.innerHTML=`<h3>YARDIVO DEV · HANDOVER STATUS</h3>
   <p>Frontend je postavljen na production-empty baseline. Server fizički mora koristiti isti DEV Supabase projekt prije konačne predaje.</p>
   <div class="ybr-grid">
    <div class="ybr-item ok"><small>MASTER DATA</small><strong>EMPTY / DYNAMIC</strong></div>
    <div class="ybr-item ok"><small>LOCAL BUSINESS DATA</small><strong>0</strong></div>
    <div class="ybr-item warn"><small>RUNTIME BACKEND</small><strong id="ybrRuntimeBackend">DEV PROJECT CHECK</strong></div>
   </div>`;
  settings.appendChild(c);
 }
 const r=document.getElementById('ybrRuntimeBackend');
 if(r)r.textContent=location.protocol==='file:'?'VERIFY ON DEPLOY':'CONNECTED';
}
function normalizeAdminSession(){
 const s=window.currentSession;
 if(!s||String(s.role||'').toLowerCase()!=='admin')return;
 /* Never invent a server identity. Only normalize already-authenticated admin1. */
 if(String(s.username||s.user||'').toLowerCase()===ADMIN){
  s.username=ADMIN;s.user=ADMIN;s.role='admin';
 }
}
function boot(){
 /* Factory Zero is explicit only: never erase Admin-entered Master Data on reload/login. */
 sanitizeLegacy();enforceEmptyUi();normalizeAdminSession();
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,70));
window.addEventListener('load',()=>setTimeout(boot,220),{once:true});
['yardivo:login','yardivo:data-synced','yardivo:master-data-changed','yardivo:context-changed']
.forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{sanitizeLegacy();enforceEmptyUi();normalizeAdminSession()},30)));
window.YardivoHandoverV583={build:BUILD,admin:ADMIN,wipeLocalBusiness,enforceEmptyUi};
window.YARDIVO_DEV_BUILD=BUILD;
})();
