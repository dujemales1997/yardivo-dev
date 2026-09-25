
(function(){
'use strict';
if(window.__YARDIVO_ZERO_STATE_RUNTIME_V583__)return;
window.__YARDIVO_ZERO_STATE_RUNTIME_V583__=true;

const DONE='yardivo_zero_state_runtime_done_v583_20260911';
const EMPTY_KEYS=[
 'yardivo_yms_announcements_v1','studenac_announcements','yardivo_announcements','yms_announcements',
 'yardivo_yms_incidents_v1','yardivo_incidents',
 'yardivo_live_notifications_v1','yardivo_master_notifications_v1',
 'yardivo_notifications','yardivo_notifications_v1','yardivo_notifications_v2','yardivo_notifications_v583',
 'yardivo_notification_history_v1','yardivo_notification_history_v583',
 'studenac_notifications','yms_notifications',
 'yardivo_epal_transactions_v1','yms_trucks_v2',
 'yardivo_auto_replan_log_v1','yardivo_supplier_scores_v1',
 'yardivo_supabase_offline_queue_v1','yardivo_supabase_offline_queue_v2'
];

function zeroArrays(){
  try{if(typeof announcements!=='undefined')announcements=[]}catch(_){}
  try{window.announcements=[]}catch(_){}
  try{if(typeof incidents!=='undefined')incidents=[]}catch(_){}
  try{window.incidents=[]}catch(_){}
  [
    'notifications','NOTIFICATIONS','notificationHistory','unannouncedRequests',
    'epalTransactions','truckHistoryData','smartProposals','replanLog'
  ].forEach(n=>{try{if(Array.isArray(window[n]))window[n].length=0}catch(_){}});
}
function zeroStorage(){
  EMPTY_KEYS.forEach(k=>{try{localStorage.setItem(k,'[]')}catch(_){}});
  try{sessionStorage.removeItem('yardivo_notification_seen_v5')}catch(_){}
  try{localStorage.removeItem('yardivo_notifications_canonical_migrated_v583')}catch(_){}
}
function zeroUi(){
  [
   'notifCount','opsAlertBadge','opsAlertCount','opsLongWait','opsBigLate','opsAtDock','opsDoneToday',
   'incidentBadge','incidentCount','unannouncedNavBadge','epalDebtBadge','ctCriticalBadge',
   'ctTodayTotal','ctYard','ctDock','ctLate','ctIncidents','ctUnannounced',
   'dashAttentionCount','announcementCount','annTruckCount','truckUniqueCount','truckVisitCount',
   'truckReturningCount','incidentArchiveCount','epalKpiDebt','epalKpiInToday','epalKpiOutToday',
   'epalKpiSuppliersDebt'
  ].forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    el.textContent=id==='incidentCount'?'0 incidenata':'0';
    if(el.classList.contains('nav-badge'))el.style.setProperty('display','none','important');
  });
  const n=document.getElementById('notifList');
  if(n)n.innerHTML='<div class="notif-empty">Nema novih notifikacija.</div>';
  const h=document.getElementById('yardivoNotificationHistory');
  if(h)h.innerHTML='<div class="notif-empty">Nema notifikacija.</div>';
}
function rerender(){
  [
    'renderAnnouncements','renderAnnouncementSchedule','renderDailyMap','renderWeeklyMap',
    'renderWeeklyDeliveries','renderReceiving','renderOverview','renderDashboardSimple',
    'renderOperationsPro','renderYmsAlerts','renderAfter14NoShowAlerts','renderIncidents',
    'renderControlTower','renderEpal','renderUnannounced','renderTruckHistorySection'
  ].forEach(fn=>{try{if(typeof window[fn]==='function')window[fn]()}catch(_){}});
  try{window.YardivoNotificationsV583?.save?.([])}catch(_){}
  try{window.YardivoNotificationsV583?.refresh?.()}catch(_){}
  try{window.YardivoUnannouncedBadgeV583?.refresh?.()}catch(_){}
  zeroUi();
}
async function emptyServerStateBestEffort(){
  /* Use only already-existing authenticated YARDIVO transports. No anonymous destructive call. */
  try{
    if(window.YardivoSupabase?.resetAllExceptUsers){
      await window.YardivoSupabase.resetAllExceptUsers();
      return true;
    }
  }catch(e){console.warn('YARDIVO zero-state server reset',e)}
  try{
    if(typeof putCloudState==='function'){
      for(const k of EMPTY_KEYS){
        try{await Promise.resolve(putCloudState(k,'[]'))}catch(_){}
      }
      return true;
    }
  }catch(_){}
  return false;
}
async function run(){
  if(localStorage.getItem(DONE)==='1'){zeroStorage();zeroUi();return}
  zeroArrays();
  zeroStorage();

  /* Save empty normalized business datasets if those transports are available. */
  try{saveAnnouncements?.()}catch(_){}
  try{saveIncidents?.()}catch(_){}
  try{await window.YardivoSupabase?.syncNow?.()}catch(_){}
  await emptyServerStateBestEffort();

  /* Final local authority after any initial sync. */
  zeroArrays();
  zeroStorage();
  rerender();
  try{localStorage.setItem(DONE,'1')}catch(_){}
  try{window.dispatchEvent(new CustomEvent('yardivo:zero-state-ready'))}catch(_){}
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(run,80),{once:true});
window.addEventListener('yardivo:login',()=>setTimeout(run,100),{once:true});
window.addEventListener('load',()=>setTimeout(()=>{zeroArrays();zeroStorage();rerender()},500),{once:true});

window.YardivoZeroStateV583={run,zeroStorage,zeroUi};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-clean-zero-state';
})();
