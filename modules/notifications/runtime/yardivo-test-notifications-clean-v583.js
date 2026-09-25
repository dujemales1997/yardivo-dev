(function(){
'use strict';
if(window.__YARDIVO_TEST_NOTIFICATIONS_CLEAN_V583__)return;
window.__YARDIVO_TEST_NOTIFICATIONS_CLEAN_V583__=true;

const KEYS=[
 'yardivo_notifications_v1','yardivo_notifications_v2','yardivo_notifications_v583',
 'yardivo_notification_history_v1','yardivo_notification_history_v583',
 'yardivo_notifications','studenac_notifications','yms_notifications'
];

function clearArrays(){
 try{if(typeof notifications!=='undefined'&&Array.isArray(notifications))notifications.splice(0,notifications.length)}catch(_){}
 try{if(typeof NOTIFICATIONS!=='undefined'&&Array.isArray(NOTIFICATIONS))NOTIFICATIONS.splice(0,NOTIFICATIONS.length)}catch(_){}
 try{if(typeof notificationHistory!=='undefined'&&Array.isArray(notificationHistory))notificationHistory.splice(0,notificationHistory.length)}catch(_){}
}
function clearStorage(){
 KEYS.forEach(k=>{
  try{localStorage.removeItem(k)}catch(_){}
  try{sessionStorage.removeItem(k)}catch(_){}
  try{window.YardivoSupabase?.setState?.(k,[])}catch(_){}
 });
}
function clearUI(){
 document.querySelectorAll('[id*="notification" i] [class*="item"],[class*="notification-list"] > *,#notificationList > *,#notificationsList > *').forEach(el=>el.remove());
 document.querySelectorAll('[id*="notification" i] [class*="badge"],[class*="notification" i][class*="count"]').forEach(el=>{if(/^\d+$/.test((el.textContent||'').trim()))el.textContent='0'});
}
function run(){
 clearArrays();clearStorage();clearUI();
 try{
  if(typeof saveNotifications==='function')saveNotifications();
  if(typeof renderNotifications==='function')renderNotifications();
  if(typeof renderNotificationCenter==='function')renderNotificationCenter();
 }catch(_){}
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(run,400));
window.addEventListener('load',()=>setTimeout(run,900));
window.addEventListener('yardivo:data-synced',()=>setTimeout(run,120));
window.addEventListener('yardivo:login',()=>setTimeout(run,700));
run();
window.YardivoTestNotificationCleanV583={run};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-empty-warehouses-masterdata-notifications-clean';
})();
