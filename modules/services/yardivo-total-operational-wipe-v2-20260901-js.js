
(function(){
'use strict';

let busy=false;

/* These are configuration/auth keys and MUST survive the operational wipe. */
const PRESERVE_EXACT=new Set([
  /* USER IDENTITIES / AUTH ONLY — jedino ovo preživljava potpuni reset. */
  'yardivo_master_users_v1','yardivo_users','yardivo_yms_users',
  'yardivo_remembered_session','yardivo_session','yardivo_custom_session',
  'yardivo_real_auth_cutover_v1','yardivo_rbac_session_migrated_20260831',
  'yardivo_client_id_v1'
]);

const OPERATIONAL_EXACT=new Set([
  'yardivo_yms_announcements_v1','yardivo_yms_announcements_v1','studenac_announcements',
  'yardivo_announcements','yms_announcements',
  'yardivo_yms_incidents_v1','yardivo_incidents',
  'yardivo_live_notifications_v1','yardivo_notification_seen_v5','yardivo_last_incident_notice',
  'yardivo_epal_transactions_v1','yardivo_epal_initial_stock_v1',
  'yms_trucks_v2',
  'yardivo_auto_replan_log_v1','yardivo_supplier_scores_v1','yardivo_overview_qa_seed_v1',
  'yardivo_data_last_saved_at',
  'yardivo_master_notifications_v1','yardivo_master_report_v1',
  'yardivo_supabase_offline_queue_v1','yardivo_supabase_offline_queue_v2',
  'yardivo_supabase_sync_meta_v1','yardivo_supabase_sync_meta_v2'
]);

function operationalKey(k){
  k=String(k||'');
  if(!k || PRESERVE_EXACT.has(k))return false;
  if(/^sb-[a-z0-9_-]+-auth-token$/i.test(k)||/^supabase\.auth\./i.test(k))return false;
  if(/(?:^|_)(?:user|users|user_access|profile|profiles|auth)(?:_|$)/i.test(k))return false;
  return /^(?:yardivo_|studenac_|yms_)/i.test(k);
}

function storageKeys(storage){
  const out=[];
  try{for(let i=0;i<storage.length;i++)out.push(storage.key(i))}catch(_){}
  return out.filter(Boolean);
}

function clearOperationalStorage(){
  [localStorage,sessionStorage].forEach(st=>{
    storageKeys(st).forEach(k=>{
      if(operationalKey(k)){try{st.removeItem(k)}catch(_){}}
    });
  });
  try{safeStorage.removeItem('yardivo_yms_announcements_v1')}catch(_){}
  try{safeStorage.removeItem('yardivo_yms_announcements_v1')}catch(_){}
  try{safeStorage.removeItem('yardivo_yms_incidents_v1')}catch(_){}
}

function zeroDom(){
  const ids=[
    'notifCount','opsAlertBadge','opsAlertCount','opsLongWait','opsBigLate','opsAtDock','opsDoneToday',
    'incidentBadge','incidentCount','unannouncedNavBadge','epalDebtBadge','ctCriticalBadge',
    'ctTodayTotal','ctYard','ctDock','ctLate','ctIncidents','ctUnannounced',
    'dashAttentionCount','announcementCount','annTruckCount','truckUniqueCount','truckVisitCount',
    'truckReturningCount','incidentArchiveCount','epalKpiDebt','epalKpiInToday','epalKpiOutToday',
    'epalKpiSuppliersDebt'
  ];
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(!el)return;
    if(id==='incidentCount')el.textContent='0 incidenata';
    else el.textContent='0';
    if(el.classList.contains('nav-badge'))el.style.setProperty('display','none','important');
  });

  document.querySelectorAll('#homeMenuGrid .home-menu-card').forEach(card=>{
    let b=card.querySelector('.yardivo-home-zero-count');
    if(!b){
      b=document.createElement('span');b.className='yardivo-home-zero-count';card.appendChild(b);
    }
    b.textContent='0';b.style.display='inline-flex';
  });

  const notif=document.getElementById('notifList');
  if(notif)notif.innerHTML='<div class="notif-empty">Nema novih notifikacija.</div>';
  const hist=document.getElementById('yardivoNotificationHistory');
  if(hist)hist.innerHTML='<div class="notif-empty">Nema notifikacija.</div>';
}

function clearRuntimeArrays(){
  try{announcements=[];window.announcements=announcements}catch(_){}
  try{incidents=[];window.incidents=incidents}catch(_){}
  /* optional module globals */
  ['unannouncedRequests','epalTransactions','truckHistoryData','notifications'].forEach(name=>{
    try{if(Array.isArray(window[name]))window[name].length=0}catch(_){}
  });
}

async function clearCloudState(){
  /* Authoritative server wipe: delete every server-owned dataset/state except user identities. */
  if(window.YardivoSupabase?.resetAllExceptUsers){
    await window.YardivoSupabase.resetAllExceptUsers();
    return;
  }
  /* Compatibility fallback for older backend builds. */
  const keys=[...OPERATIONAL_EXACT];
  if(typeof putCloudState==='function'){
    for(const k of keys){
      try{await Promise.resolve(putCloudState(k,''))}catch(e){console.warn('YARDIVO wipe cloud state',k,e)}
    }
  }
}

async function clearNormalizedRows(){
  /* Runtime arrays are already empty. Server deletion is handled authoritatively by clearCloudState(). */
  try{saveAnnouncements?.()}catch(_){}
  try{saveIncidents?.()}catch(_){}
}

function rerenderAll(){
  const fns=[
    'render','renderAnnouncements','renderAnnouncementSchedule','renderDailyMap','renderWeeklyMap',
    'renderWeeklyDeliveries','renderReceiving','renderOverview','renderDashboardSimple',
    'renderOperationsPro','renderYmsAlerts','renderAfter14NoShowAlerts','renderIncidents',
    'renderControlTower','renderEpal','renderUnannounced','renderTruckHistorySection',
    'refreshRecommendation'
  ];
  fns.forEach(fn=>{try{if(typeof window[fn]==='function')window[fn]()}catch(_){}});
  try{window.YardivoNotifications?.save?.([])}catch(_){}
  try{window.YardivoNotifications?.render?.()}catch(_){}
  try{window.YardivoOverviewMaster?.render?.()}catch(_){}
  try{window.YardivoOverviewFullChart?.render?.()}catch(_){}
  try{window.YardivoOverviewHero3?.render?.()}catch(_){}
  try{window.YardivoMyYard?.render?.()}catch(_){}
  try{window.YardivoMyYardWebGL?.refresh?.()}catch(_){}
  zeroDom();
}

async function wipe(){
  if(busy)return;
  let r='';try{r=String(currentSession?.role||'').toLowerCase().trim()}catch(_){}
  if(r!=='admin'){alert('Samo Admin može izvršiti potpuni reset podataka.');return}

  const ok=confirm(
    'OBRISATI APSOLUTNO SVE PODATKE I POSTAVKE?\n\n'+
    'Briše se cijelo poslovno stanje YARDIVO-a: najave, incidenti, Supplier podaci, kamioni, EPAL, termini, konfiguracije rampi/skladišta, Smart/KPI/logovi, audit, neradni dani, notifikacije i ostale postavke.\n\n'+
    'KORISNIČKI RAČUNI I PROFILI OSTAJU SAČUVANI.'
  );
  if(!ok)return;

  const typed=prompt('Za konačnu potvrdu upiši: OBRISI SVE PODATKE');
  if(typed===null)return;
  const norm=typed.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(norm!=='OBRISI SVE PODATKE'){alert('Brisanje nije izvršeno.');return}

  busy=true;
  const btn=document.getElementById('deleteAllDataBtn');
  if(btn){btn.disabled=true;btn.textContent='BRIŠEM SVE…'}

  clearRuntimeArrays();

  /* Persist canonical empties before clearing compatibility caches. */
  try{safeStorage.setItem('yardivo_yms_announcements_v1','[]')}catch(_){}
  try{safeStorage.setItem('yardivo_yms_announcements_v1','[]')}catch(_){}
  try{safeStorage.setItem('yardivo_yms_incidents_v1','[]')}catch(_){}
  try{localStorage.setItem('yardivo_live_notifications_v1','[]')}catch(_){}

  await clearCloudState();
  await clearNormalizedRows();
  clearOperationalStorage();

  /* Recreate only canonical empty datasets so no legacy fallback can restore old records. */
  try{safeStorage.setItem('yardivo_yms_announcements_v1','[]')}catch(_){}
  try{safeStorage.setItem('yardivo_yms_announcements_v1','[]')}catch(_){}
  try{safeStorage.setItem('yardivo_yms_incidents_v1','[]')}catch(_){}
  try{localStorage.setItem('yardivo_live_notifications_v1','[]')}catch(_){}
  try{localStorage.setItem('yardivo_operational_full_reset_v1',new Date().toISOString())}catch(_){}

  rerenderAll();

  if(typeof showYmsToast==='function'){
    showYmsToast('success','SVE JE OBRISANO','Operativni podaci, sve povijesti i sve notifikacije su prazni. Brojači su vraćeni na 0.',5000);
  }else{
    alert('Svi operativni podaci, povijesti i notifikacije su obrisani.');
  }

  if(btn){btn.disabled=false;btn.textContent='OBRIŠI SVE PODATKE'}
  busy=false;
}

/* Single canonical owner. Runs in capture phase and blocks all old partial reset handlers. */
document.addEventListener('click',e=>{
  const btn=e.target.closest?.('#deleteAllDataBtn');
  if(!btn)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  wipe();
},true);

window.YardivoTotalOperationalWipe={run:wipe,zero:zeroDom};
})();
