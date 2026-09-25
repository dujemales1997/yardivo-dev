(function(){
'use strict';

let loginClearedForThisScreen=false;

function loginVisible(){
  const screen=document.getElementById('loginScreen');
  if(screen)return !screen.classList.contains('hidden')&&getComputedStyle(screen).display!=='none';
  const form=document.getElementById('loginForm');
  return !!form && getComputedStyle(form).display!=='none';
}

function clearLoginOnce(){
  if(!loginVisible()){loginClearedForThisScreen=false;return}
  if(loginClearedForThisScreen)return;
  const el=document.getElementById('loginUser');
  if(el){
    el.value='';
    el.removeAttribute('value');
    el.placeholder='Korisničko ime';
    el.autocomplete='username';
  }
  loginClearedForThisScreen=true;
}

function localToday(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function correctTodayAnnouncementCount(){
  let list=[];
  try{list=Array.isArray(announcements)?announcements:[]}catch(e){return 0}
  const day=localToday(),ids=new Set();
  list.forEach(a=>{
    if(!a||a.arrivalType==='UNANNOUNCED'||String(a.date||'')!==day)return;
    ids.add(String(a.id));
  });
  return ids.size;
}
function updateDailyMessage(){
  const count=correctTodayAnnouncementCount();
  document.querySelectorAll('[data-daily-login-message],.daily-login-message,.operational-forecast').forEach(el=>{
    if(/najav|dnevna|prognoz/i.test(el.textContent||'')){
      el.textContent=`Dnevna mapa: ${count} ${count===1?'najava':'najava'}`;
    }
  });
  // Fallback only for the purple message/card, never generic page text.
  document.querySelectorAll('.purple-bubble,.forecast-bubble,.login-forecast').forEach(el=>{
    if(/najav|dnevna|prognoz/i.test(el.textContent||''))el.textContent=`Dnevna mapa: ${count} ${count===1?'najava':'najava'}`;
  });
  return count;
}

window.YardivoLoginNotificationFix={count:correctTodayAnnouncementCount,clearLoginOnce,updateDailyMessage};
window.addEventListener('load',()=>setTimeout(()=>{clearLoginOnce();updateDailyMessage()},80));
setInterval(()=>{
  clearLoginOnce();
  if(!loginVisible())updateDailyMessage();
},1200);
})();
