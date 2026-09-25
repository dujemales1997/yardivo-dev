(function(){
'use strict';
const EPOCH_KEY='yardivo_clean_epoch_v583';
const MASTER='yardivo_master_data_registry_v583';
const LEGACY_WH=/^(W101|W103|W104|W201|W202|W203|W204)$/i;
function epoch(){return Date.parse(localStorage.getItem(EPOCH_KEY)||'')||0}
function master(){try{const d=JSON.parse(localStorage.getItem(MASTER)||'{}');return d&&Array.isArray(d.locations)&&Array.isArray(d.warehouses)?d:{locations:[],warehouses:[]}}catch(_){return{locations:[],warehouses:[]}}}
function emptyOperationalStores(){
 const keys=[
  'yardivo_live_notifications_v1','yardivo_master_notifications_v1','yardivo_notifications','yardivo_notifications_v1',
  'yardivo_notifications_v2','yardivo_notifications_v583','yardivo_notification_history_v1','yardivo_notification_history_v583',
  'studenac_notifications','yms_notifications','yardivo_epal_transactions_v1','yardivo_epal_initial_stock_v1','yms_trucks_v2'
 ];
 keys.forEach(k=>{try{localStorage.setItem(k,'[]')}catch(_){}});
 try{window.YardivoNotificationsV583?.clear?.()}catch(_){}
 document.querySelectorAll('#yardivoLiveToasts>*').forEach(x=>x.remove());
}
function sanitizeLegacyWarehouseUi(){
 const d=master(),ids=new Set(d.warehouses.map(w=>String(w.id)));
 document.querySelectorAll('select').forEach(sel=>{
   [...sel.options].forEach(o=>{
     if(LEGACY_WH.test(String(o.value||''))&&!ids.has(String(o.value)))o.remove();
   });
 });
 /* Static pallet/warehouse cards from old factories must not survive when Master is empty. */
 if(!d.warehouses.length){
   document.querySelectorAll('[data-warehouse-id],[data-warehouse]').forEach(el=>{
     const v=String(el.dataset.warehouseId||el.dataset.warehouse||'');
     if(LEGACY_WH.test(v))el.remove();
   });
 }
}
function refreshEmptyClass(){
 let a=[];try{a=typeof announcements!=='undefined'&&Array.isArray(announcements)?announcements:[]}catch(_){}
 const isEmpty=!a.length;
 document.body.classList.toggle('yardivo-production-empty',isEmpty);
 const el=document.getElementById('homeStorageStatus');
 if(el&&isEmpty)el.textContent='SPREMLJENO: 0 NAJAVA';

}
function protectMasterFocus(){
 const editing=!!document.activeElement?.closest?.('#yardivoMasterFoundationV583');
 if(editing)return true;
 return false;
}
function boot(){
 sanitizeLegacyWarehouseUi();refreshEmptyClass();
 try{window.YardivoMasterFoundationV583?.render?.()}catch(_){}
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,60));
window.addEventListener('load',()=>setTimeout(boot,180),{once:true});
['yardivo:data-synced','yardivo:master-data-changed','yardivo:context-changed','yardivo:supplier-inbox-changed','yardivo:supplier-request-updated']
.forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{sanitizeLegacyWarehouseUi();refreshEmptyClass()},25)));
window.YardivoProductionEmptyV583={epoch,master,refresh:boot,editing:protectMasterFocus};
window.YARDIVO_DEV_BUILD='20260912-dev-v5.8.3-production-empty-final';
})();
