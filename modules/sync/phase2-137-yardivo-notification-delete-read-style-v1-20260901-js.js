
(function(){
'use strict';
const KEY='yardivo_live_notifications_v1';
const CUT_KEY='yardivo_notification_clear_cutoff_v583';
const SEEN='yardivo_notification_seen_v5';

function clearUi(cutoff){
  try{localStorage.setItem(KEY,'[]')}catch(_){}
  if(cutoff){try{localStorage.setItem(CUT_KEY,String(cutoff))}catch(_){}}
  /* Remove legacy local notification caches too, so deleted history cannot reappear from browser storage. */
  for(const k of ['yardivo_notifications_v1','yardivoNotifications']){
    try{localStorage.removeItem(k)}catch(_){}
  }
  try{sessionStorage.removeItem(SEEN)}catch(_){}
  try{window.YardivoNotifications?.render?.()}catch(_){}

  ['notifCount','opsAlertBadge'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){
      el.textContent='0';
      el.style.setProperty('display','none','important');
    }
  });

  const list=document.getElementById('notifList');
  if(list)list.innerHTML='<div class="notif-empty">Nema novih notifikacija.</div>';

  const hist=document.getElementById('yardivoNotificationHistory');
  if(hist){
    hist.innerHTML='<div class="notif-empty">Nema notifikacija.</div>';
  }
}
async function setServerState(client,key,value){
  const {data,error}=await client.functions.invoke('yardivo-sync',{
    body:{action:'set_state',key,value,clientId:'yardivo-notification-clear'}
  });
  if(error)throw error;
  if(data?.ok===false)throw new Error(String(data?.error||'Spremanje notifikacijskog stanja nije uspjelo.'));
  return data;
}
async function clearNotificationsOnServer(cutoff){
  const client=await window.YardivoAuth?.client?.();
  if(!client)throw new Error('Supabase Auth nije spreman.');
  /* Tombstone first: even if an old generator runs during clear, pre-cutoff events stay deleted. */
  await setServerState(client,CUT_KEY,String(cutoff));
  return await setServerState(client,KEY,'[]');
}
async function clearAll(){
  const ok=confirm('Izbrisati cijelu povijest notifikacija?\n\nNotifikacije će biti trajno obrisane iz YARDIVO baze.');
  if(!ok)return;

  const btn=document.querySelector('#yardivoNotificationHistory .y5-clear-all');
  if(btn){btn.disabled=true;btn.textContent='BRIŠEM…'}

  try{
    const cutoff=new Date().toISOString();
    /* Server is authoritative: persist delete tombstone + empty list, then clear browser caches. */
    await clearNotificationsOnServer(cutoff);
    clearUi(cutoff);

    /* Canonical API sees the same cutoff and empty state. */
    try{
      localStorage.setItem(CUT_KEY,cutoff);
      localStorage.setItem(KEY,'[]');
      window.YardivoNotifications?.render?.();
    }catch(_){}

    try{window.dispatchEvent(new CustomEvent('yardivo:notifications-cleared',{detail:{at:new Date().toISOString()}}))}catch(_){}
    try{
      if(typeof showYmsToast==='function')showYmsToast('success','NOTIFIKACIJE OBRISANE','Povijest notifikacija je trajno obrisana.',3200);
    }catch(_){}
  }catch(e){
    console.error('YARDIVO notification clear server',e);
    alert('Notifikacije nisu obrisane jer spremanje u bazu nije uspjelo:\n'+String(e?.message||e));
    try{window.YardivoNotifications?.render?.()}catch(_){}
  }finally{
    if(btn){btn.disabled=false;btn.textContent='IZBRIŠI SVE NOTIFIKACIJE'}
  }
}
function addClearButton(){
  const host=document.getElementById('yardivoNotificationHistory');
  if(!host)return;
  const toolbar=host.querySelector('.y5-notif-toolbar');
  if(!toolbar || toolbar.querySelector('.y5-clear-all'))return;

  const b=document.createElement('button');
  b.type='button';
  b.className='action y5-clear-all';
  b.textContent='IZBRIŠI SVE NOTIFIKACIJE';
  b.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    clearAll();
  });
  toolbar.appendChild(b);
}
function cleanupReadGlow(){
  document.querySelectorAll('#yardivoNotificationHistory .y5-history-card.read').forEach(el=>{
    el.classList.remove('unread','y5-unread');
    el.style.setProperty('box-shadow','none','important');
    el.style.setProperty('filter','none','important');
  });
}

/* Hook existing notification render without replacing its data model. */
const oldRender=window.YardivoNotifications?.render;
if(window.YardivoNotifications && typeof oldRender==='function'){
  window.YardivoNotifications.render=function(){
    const out=oldRender.apply(this,arguments);
    setTimeout(()=>{addClearButton();cleanupReadGlow()},0);
    return out;
  };
}

document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="operations"],[data-home-target="operations"],#notifBell')){
    setTimeout(()=>{addClearButton();cleanupReadGlow()},60);
  }
},true);

window.addEventListener('load',()=>setTimeout(()=>{addClearButton();cleanupReadGlow()},900),{once:true});
/* retired: toolbar is updated by canonical render hooks only */

window.YardivoNotificationAdmin={clearAll,cleanupReadGlow,clearNotificationsOnServer};
})();
