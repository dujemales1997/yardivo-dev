
(function(){
'use strict';
if(window.__YARDIVO_MAP_LIVE_DELAY_REFRESH_V1__)return;
window.__YARDIVO_MAP_LIVE_DELAY_REFRESH_V1__=true;

function refreshVisibleMap(){
  if(document.hidden)return;
  const daily=document.getElementById('dailyMap');
  const weekly=document.getElementById('weeklyMap');
  try{
    if(daily?.classList.contains('active')||daily?.classList.contains('manager-force-active')){
      if(typeof renderDailyMap==='function')renderDailyMap();
    }else if(weekly?.classList.contains('active')||weekly?.classList.contains('manager-force-active')){
      if(typeof renderWeeklyMap==='function')renderWeeklyMap();
    }
  }catch(_){}
}
window.__yardivoMapLiveDelayTimerV1=setInterval(refreshVisibleMap,15000);
window.addEventListener('focus',refreshVisibleMap);
window.addEventListener('yardivo:data-synced',refreshVisibleMap);
})();
