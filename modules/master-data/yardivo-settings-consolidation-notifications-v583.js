
(function(){
'use strict';
if(window.__YARDIVO_SETTINGS_CONSOLIDATION_NOTIFICATIONS_V583__)return;
window.__YARDIVO_SETTINGS_CONSOLIDATION_NOTIFICATIONS_V583__=true;

const MASTER_KEY='yardivo_master_data_registry_v583';
const RAMP_KEY='yardivo_ramp_config_v1';
const NOTIF_KEYS=[
  'yardivo_notifications_v1',
  'yardivo_notifications_v2',
  'yardivo_notifications_v583',
  'yardivo_notification_history_v1',
  'yardivo_notification_history_v583',
  'yardivo_notifications',
  'studenac_notifications',
  'yms_notifications'
];

function master(){
  try{
    const raw=localStorage.getItem(MASTER_KEY);
    const d=raw?JSON.parse(raw):null;
    if(d&&Array.isArray(d.locations)&&Array.isArray(d.warehouses))return d;
  }catch(_){}
  try{return window.YardivoMasterDataV583?.all?.()||{locations:[],warehouses:[]}}catch(_){}
  return {locations:[],warehouses:[]};
}
function saveMaster(d){
  try{localStorage.setItem(MASTER_KEY,JSON.stringify(d))}catch(_){}
  try{window.YardivoMasterDataV583?.save?.(d)}catch(_){}
  try{window.YardivoSupabase?.syncNow?.()}catch(_){}
  window.dispatchEvent(new CustomEvent('yardivo:master-data-changed'));
}
function rampCfg(){
  try{return JSON.parse(localStorage.getItem(RAMP_KEY)||'{}')||{}}catch(_){return{}}
}
function saveRampCfg(d){
  try{localStorage.setItem(RAMP_KEY,JSON.stringify(d))}catch(_){}
}

/* -----------------------------
   SETTINGS CONSOLIDATION
   MASTER DATA owns:
   - supplier master objects
   - locations
   - warehouses
   - warehouse ramp count

   PRIJAM & RAMPE owns:
   - per-ramp enabled/disabled
   - capacity
   - working hours
   ----------------------------- */
function consolidateRampSettings(){
  const panel=document.getElementById('receptionRampSettings');
  if(!panel)return;

  /* Hide/remove old add/remove-ramp UI. */
  panel.querySelectorAll(
    '#addRampBtn,#removeRampBtn,'+
    'button[data-action="add-ramp"],button[data-action="remove-ramp"],'+
    '.add-ramp-btn,.remove-ramp-btn'
  ).forEach(el=>{
    el.style.display='none';
    el.disabled=true;
    el.setAttribute('aria-hidden','true');
    el.dataset.yardivoLegacyRampCount='1';
  });

  /* Remove stale explanatory blocks that claim ramp count is managed here. */
  panel.querySelectorAll('p,small,div,span').forEach(el=>{
    if(el.children.length)return;
    const t=String(el.textContent||'').trim();
    if(/dodaj rampu|obriši zadnju rampu|broj rampi.*ovdje|ramp count/i.test(t)){
      el.style.display='none';
      el.dataset.yardivoLegacyRampCount='1';
    }
  });

  let note=panel.querySelector('#yardivoRampOwnershipNoteV583');
  if(!note){
    note=document.createElement('div');
    note.id='yardivoRampOwnershipNoteV583';
    note.style.cssText='margin:0 0 10px;padding:10px 12px;border:1px solid #28465a;border-radius:8px;background:#081722;color:#8faabd;font-size:9px;font-weight:850;line-height:1.5';
    panel.prepend(note);
  }
  note.textContent='Broj rampi određuje se u MASTER PODACI → SKLADIŠTA. Ovdje se uređuju samo status rampe, kapacitet i radno vrijeme.';
}

function stripLegacyWarehouseCodesFromSettings(){
  const d=master();
  const validIds=new Set(d.warehouses.map(w=>String(w.id)));
  const nameById=new Map(d.warehouses.map(w=>[String(w.id),String(w.name||w.id)]));

  document.querySelectorAll('#settings select').forEach(sel=>{
    [...sel.options].forEach(o=>{
      const v=String(o.value||'').trim();
      if(nameById.has(v)){
        o.textContent=nameById.get(v);
        return;
      }
      if(/^W(?:101|103|104|201|202|203|204)$/i.test(v) && !validIds.has(v)){
        o.remove();
      }
    });
  });

  document.querySelectorAll('#settings [data-warehouse],#settings [data-warehouse-id]').forEach(el=>{
    const id=String(el.dataset.warehouse||el.dataset.warehouseId||'');
    if(nameById.has(id) && el.children.length===0)el.textContent=nameById.get(id);
    if(/^W(?:101|103|104|201|202|203|204)$/i.test(id) && !validIds.has(id)){
      el.style.display='none';
      el.dataset.yardivoLegacyWarehouseConfig='1';
    }
  });

  document.querySelectorAll('#settings label,#settings span,#settings small,#settings button,#settings div').forEach(el=>{
    if(el.children.length)return;
    let t=String(el.textContent||'');
    if(!t)return;
    for(const [id,name] of nameById){
      if(t===id)t=name;
      else if(t.includes('('+id+')'))t=t.replace('('+id+')','');
    }
    t=t.replace(/\bW(?:101|103|104|201|202|203|204)\b/g,'').replace(/\s{2,}/g,' ').trim();
    if(el.textContent!==t)el.textContent=t;
  });
}

function syncRampCountFromMaster(){
  const d=master();
  const rc=rampCfg();
  let changed=false;
  d.warehouses.forEach(w=>{
    const n=Math.max(0,Number(w.ramps)||0);
    if(!rc[w.id]){rc[w.id]={count:n,locked:[]};changed=true}
    if(Number(rc[w.id].count)!==n){rc[w.id].count=n;changed=true}
    rc[w.id].locked=Array.isArray(rc[w.id].locked)
      ? rc[w.id].locked.map(Number).filter(x=>x>=1&&x<=n)
      : [];
  });
  Object.keys(rc).forEach(id=>{
    if(!d.warehouses.some(w=>w.id===id)){delete rc[id];changed=true}
  });
  if(changed)saveRampCfg(rc);
}

function consolidateSettings(){
  consolidateRampSettings();
  stripLegacyWarehouseCodesFromSettings();
  syncRampCountFromMaster();
}

/* -----------------------------
   NOTIFICATIONS: one owner
   ----------------------------- */
function clearArrayInPlace(name){
  try{
    const a=window[name];
    if(Array.isArray(a))a.splice(0,a.length);
  }catch(_){}
}
function clearStorage(){
  NOTIF_KEYS.forEach(k=>{
    try{localStorage.setItem(k,'[]')}catch(_){}
    try{sessionStorage.setItem(k,'[]')}catch(_){}
  });
}
async function clearServerBestEffort(){
  for(const k of NOTIF_KEYS){
    try{await window.YardivoSupabase?.setState?.(k,[])}catch(_){}
  }
  try{await window.YardivoSupabase?.syncNow?.()}catch(_){}
}
function stableNotificationUI(){
  /* Only update local notification containers; do not redraw whole Settings. */
  document.querySelectorAll(
    '#settings [data-notification-list],'+
    '#settings #notificationList,'+
    '#settings .notification-list,'+
    '#settings .notifications-list'
  ).forEach(host=>{
    if(host.children.length){
      [...host.children].forEach(ch=>{
        if(ch.matches?.('[data-empty],.empty,.notification-empty'))return;
        ch.remove();
      });
    }
  });

  document.querySelectorAll(
    '#settings [class*="notif" i][class*="badge" i],'+
    '#settings [id*="notif" i][class*="badge" i],'+
    '[class*="notif" i][class*="badge" i],'+
    '[id*="notif" i][class*="badge" i]'
  ).forEach(el=>{
    el.textContent='';
    el.style.setProperty('display','none','important');
    el.style.setProperty('visibility','hidden','important');
    el.style.setProperty('opacity','0','important');
  });

  try{window.YardivoNotificationBadgeV583?.refresh?.()}catch(_){}
}
function isClearNotifButton(btn){
  if(!btn||btn.tagName!=='BUTTON')return false;
  const id=String(btn.id||'').toLowerCase();
  const txt=String(btn.textContent||'').trim().toLowerCase();
  return (
    /notif/.test(id)&&/(clear|delete|remove|erase|obrisi|izbrisi)/.test(id)
  ) || (
    /notifik/.test(txt)&&/(izbriši|obrisi|obriši|izbrisi|delete|clear)/.test(txt)
  );
}
async function clearAllNotifications(btn){
  /* Canonical owner writes cutoff + yardivo_live_notifications_v1=[] to Supabase. */
  if(window.YardivoNotificationAdmin?.clearAll){
    return await window.YardivoNotificationAdmin.clearAll();
  }
  if(btn?.dataset.yardivoClearing==='1')return;
  if(btn)btn.dataset.yardivoClearing='1';

  const original=btn?.textContent||'IZBRIŠI SVE NOTIFIKACIJE';
  if(btn){
    btn.classList.add('yardivo-notification-clearing');
    btn.disabled=true;
    btn.textContent='BRIŠEM...';
  }

  try{
    clearArrayInPlace('notifications');
    clearArrayInPlace('NOTIFICATIONS');
    clearArrayInPlace('notificationHistory');

    clearStorage();

    /* Stable immediate paint before any async sync. */
    stableNotificationUI();

    try{window.saveNotifications?.()}catch(_){}
    try{window.renderNotifications?.()}catch(_){}
    try{window.renderNotificationCenter?.()}catch(_){}

    /* Re-assert zero after legacy renderers. */
    clearStorage();
    stableNotificationUI();

    await clearServerBestEffort();

    clearStorage();
    stableNotificationUI();

    try{showYmsToast?.('success','NOTIFIKACIJE IZBRISANE','Sve notifikacije su obrisane.')}catch(_){}
  }catch(e){
    alert('Brisanje notifikacija nije uspjelo: '+(e?.message||e));
  }finally{
    if(btn){
      btn.disabled=false;
      btn.classList.remove('yardivo-notification-clearing');
      btn.textContent=original;
      delete btn.dataset.yardivoClearing;
    }
  }
}

/* Capture phase owns clear-all notifications and blocks duplicate old handlers. */
document.addEventListener('click',function(e){
  const btn=e.target.closest?.('button');
  if(!isClearNotifButton(btn))return;

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  clearAllNotifications(btn);
},true);

/* Consolidate only when Settings is entered or master data changes. */
window.addEventListener('yardivo:master-data-changed',()=>setTimeout(consolidateSettings,40));
window.addEventListener('yardivo:data-synced',()=>setTimeout(consolidateSettings,120));
window.addEventListener('yardivo:login',()=>setTimeout(consolidateSettings,160));
document.addEventListener('DOMContentLoaded',()=>setTimeout(consolidateSettings,180));
window.addEventListener('load',()=>setTimeout(consolidateSettings,350));
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-home-target="settings"],[data-view="settings"],#settings')){
    setTimeout(consolidateSettings,50);
  }
},true);

consolidateSettings();

window.YardivoSettingsConsolidationV583={
  refresh:consolidateSettings,
  clearNotifications:clearAllNotifications
};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-settings-consolidation-notifications-fix';
})();
