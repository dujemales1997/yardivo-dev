
(function(){
'use strict';
if(window.__YARDIVO_SAAS_HARDENING_PASS2_V583__)return;
window.__YARDIVO_SAAS_HARDENING_PASS2_V583__=true;

const MASTER_KEY='yardivo_master_data_registry_v583';
const NOTIF_KEY='yardivo_notifications_v583';
const LEGACY_NOTIF_KEYS=[
 'yardivo_notifications_v1','yardivo_notifications_v2',
 'yardivo_notification_history_v1','yardivo_notification_history_v583',
 'yardivo_notifications','studenac_notifications','yms_notifications'
];
const LEGACY_CODES=new Set(['W101','W103','W104','W201','W202','W203','W204','VG','DU']);

function safeJson(raw,fallback){
  try{return JSON.parse(raw)}catch(_){return fallback}
}
function master(){
  const d=safeJson(localStorage.getItem(MASTER_KEY)||'',null);
  if(d&&Array.isArray(d.locations)&&Array.isArray(d.warehouses))return d;
  return {locations:[],warehouses:[],suppliers:[]};
}
function activeLocations(){return master().locations.filter(x=>x&&x.active!==false)}
function activeWarehouses(){return master().warehouses.filter(x=>x&&x.active!==false)}
function warehouse(id){return activeWarehouses().find(x=>String(x.id)===String(id))||null}
function location(id){return activeLocations().find(x=>String(x.id)===String(id))||null}
function warehouseName(id){return warehouse(id)?.name||''}
function locationName(id){return location(id)?.name||''}
function firstWarehouseForLocation(loc){
  return activeWarehouses().find(w=>String(w.location_id)===String(loc))?.id||'';
}

/* Canonical state facade: no hard-coded VG/DU/W101/W201 fallback. */
function currentLocation(){
  try{
    const id=String(window.currentSession?.location||'').trim();
    return location(id)?id:'';
  }catch(_){return''}
}
function currentWarehouse(){
  const current=String(window.activeWarehouse||'').trim();
  if(warehouse(current))return current;
  const loc=currentLocation();
  return firstWarehouseForLocation(loc);
}
function setLocation(id){
  id=String(id||'').trim();
  if(id&&!location(id))throw new Error('Lokacija ne postoji u Master podacima.');
  if(window.currentSession)window.currentSession.location=id||null;
  try{
    const key=window.currentSession?.rememberMe?'yardivo_remembered_session':'studenac_demo_session';
    (window.currentSession?.rememberMe?localStorage:sessionStorage).setItem(key,JSON.stringify(window.currentSession));
  }catch(_){}
  const wh=currentWarehouse();
  window.activeWarehouse=wh||'ALL';
  window.dispatchEvent(new CustomEvent('yardivo:context-changed',{detail:{location:id,warehouse:wh||'ALL'}}));
}
function setWarehouse(id){
  id=String(id||'').trim();
  if(id&&id!=='ALL'&&!warehouse(id))throw new Error('Skladište ne postoji u Master podacima.');
  window.activeWarehouse=id||'ALL';
  window.dispatchEvent(new CustomEvent('yardivo:context-changed',{detail:{location:currentLocation(),warehouse:window.activeWarehouse}}));
}

/* One canonical notification store. Legacy stores are one-time imported, then cleared. */
function normNotif(x){
  if(!x||typeof x!=='object')return null;
  return {...x,id:String(x.id||x.notification_id||('N'+Date.now()+Math.random().toString(16).slice(2)))};
}
function migrateNotificationsOnce(){
  if(localStorage.getItem('yardivo_notifications_canonical_migrated_v583')==='1')return;
  const all=[];
  const seen=new Set();
  [NOTIF_KEY,...LEGACY_NOTIF_KEYS].forEach(k=>{
    const arr=safeJson(localStorage.getItem(k)||'[]',[]);
    if(!Array.isArray(arr))return;
    arr.forEach(raw=>{
      const n=normNotif(raw); if(!n)return;
      const sig=n.id+'|'+String(n.created_at||n.createdAt||n.ts||'')+'|'+String(n.message||n.text||n.title||'');
      if(seen.has(sig))return;
      seen.add(sig); all.push(n);
    });
  });
  localStorage.setItem(NOTIF_KEY,JSON.stringify(all));
  LEGACY_NOTIF_KEYS.forEach(k=>localStorage.setItem(k,'[]'));
  localStorage.setItem('yardivo_notifications_canonical_migrated_v583','1');
}
function notifications(){migrateNotificationsOnce();const a=safeJson(localStorage.getItem(NOTIF_KEY)||'[]',[]);return Array.isArray(a)?a:[]}
function saveNotifications(a){
  localStorage.setItem(NOTIF_KEY,JSON.stringify(Array.isArray(a)?a:[]));
  window.dispatchEvent(new CustomEvent('yardivo:notifications-changed',{detail:{count:Array.isArray(a)?a.length:0}}));
}
function clearNotifications(){
  saveNotifications([]);
  LEGACY_NOTIF_KEYS.forEach(k=>{try{localStorage.setItem(k,'[]')}catch(_){}});
}
function notificationCount(){return notifications().length}

/* Stable badge painter, event-driven only. */
function paintNotificationBadges(){
  const n=notificationCount();
  document.querySelectorAll(
    '[class*="notif" i][class*="badge" i],[id*="notif" i][class*="badge" i],'+
    '[class*="notif" i][class*="count" i],[id*="notif" i][class*="count" i]'
  ).forEach(el=>{
    if(n>0){
      if(el.textContent!==String(n))el.textContent=String(n);
      el.style.removeProperty('display');el.style.removeProperty('visibility');el.style.removeProperty('opacity');
    }else{
      if(el.textContent!=='')el.textContent='';
      el.style.setProperty('display','none','important');
      el.style.setProperty('visibility','hidden','important');
      el.style.setProperty('opacity','0','important');
    }
  });
}

/* Remove legacy technical identifiers from visible UI only; never rewrite persisted business records. */
function shieldLegacyDisplay(root=document){
  const d=master();
  const names=new Map(d.warehouses.map(w=>[String(w.id),String(w.name||w.id)]));
  root.querySelectorAll?.('option').forEach(o=>{
    const v=String(o.value||'');
    if(names.has(v))o.textContent=names.get(v);
    if(/^W(?:101|103|104|201|202|203|204)$/.test(v)&&!names.has(v))o.remove();
  });
  root.querySelectorAll?.('[data-warehouse-id],[data-warehouse]').forEach(el=>{
    const id=String(el.dataset.warehouseId||el.dataset.warehouse||'');
    if(names.has(id)&&el.children.length===0)el.textContent=names.get(id);
    if(LEGACY_CODES.has(id)&&!names.has(id))el.hidden=true;
  });
}

/* Lightweight toast used by new SaaS layer; does not override blocking legacy confirm/prompt. */
function toast(title,message){
  let host=document.getElementById('yardivoSaasToastHost');
  if(!host){host=document.createElement('div');host.id='yardivoSaasToastHost';document.body.appendChild(host)}
  const el=document.createElement('div');el.className='yardivo-saas-toast';
  el.textContent=String(title||'YARDIVO');
  if(message){const sm=document.createElement('small');sm.textContent=String(message);el.appendChild(sm)}
  host.appendChild(el);
  setTimeout(()=>el.remove(),3200);
}

/* One clear-all owner; no redraw loop. */
document.addEventListener('click',e=>{
  const b=e.target.closest?.('button'); if(!b)return;
  const t=(String(b.textContent||'')+' '+String(b.id||'')).toLowerCase();
  if(!/notifik/.test(t)||!/(izbri|obri|clear|delete)/.test(t))return;
  e.preventDefault();e.stopImmediatePropagation();
  clearNotifications();
  paintNotificationBadges();
  document.querySelectorAll('#settings [data-notification-list],#settings .notification-list,#settings .notifications-list,#notificationList')
    .forEach(x=>{while(x.firstChild)x.removeChild(x.firstChild)});
  toast('NOTIFIKACIJE IZBRISANE','Sve lokalne notifikacije su obrisane.');
},true);

function refreshStableUi(){
  shieldLegacyDisplay(document.getElementById('settings')||document);
  paintNotificationBadges();
}
['yardivo:master-data-changed','yardivo:data-synced','yardivo:login','yardivo:notifications-changed','yardivo:context-changed']
 .forEach(ev=>window.addEventListener(ev,()=>requestAnimationFrame(refreshStableUi)));
document.addEventListener('DOMContentLoaded',refreshStableUi,{once:true});
window.addEventListener('load',refreshStableUi,{once:true});

migrateNotificationsOnce();
refreshStableUi();

window.YardivoAppStateV583={
  master,locations:activeLocations,warehouses:activeWarehouses,
  location:currentLocation,warehouse:currentWarehouse,
  setLocation,setWarehouse,warehouseName,locationName
};
window.YardivoNotificationsV583={
  all:notifications,save:saveNotifications,clear:clearNotifications,count:notificationCount,refresh:paintNotificationBadges
};
window.YardivoUiV583={toast,refresh:refreshStableUi};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-saas-hardening-pass-2';
})();
