(function(){
'use strict';
if(window.__YARDIVO_HOME_SAVED_COUNT_AUTHORITY_V583__)return;
window.__YARDIVO_HOME_SAVED_COUNT_AUTHORITY_V583__=true;

function liveAnnouncements(){
  try{
    if(typeof announcements!=='undefined'&&Array.isArray(announcements))return announcements;
  }catch(_){}
  return Array.isArray(window.announcements)?window.announcements:[];
}
function paint(){
  const el=document.getElementById('homeStorageStatus');
  if(!el)return;
  const n=liveAnnouncements().length;
  let last='';
  if(n>0){
    try{last=localStorage.getItem('yardivo_data_last_saved_at')||''}catch(_){}
  }
  el.textContent=`SPREMLJENO: ${n} NAJAVA${n>0&&last?' · '+new Date(last).toLocaleTimeString('hr-HR',{hour:'2-digit',minute:'2-digit'}):''}`;
  el.classList.toggle('warn',n===0);

  /* When the canonical dataset is empty, stale last-saved metadata is not meaningful. */
  if(n===0){
    try{localStorage.removeItem('yardivo_data_last_saved_at')}catch(_){}
  }
}
[
 'yardivo:login','yardivo:data-synced','yardivo:zero-state-ready',
 'yardivo:factory-zero-server-cleared','yardivo:context-changed'
].forEach(ev=>window.addEventListener(ev,()=>requestAnimationFrame(paint)));

document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="homeMenu"],[data-home-target="homeMenu"],.brand-home,.home-link')){
    requestAnimationFrame(paint);
  }
},true);
document.addEventListener('DOMContentLoaded',paint,{once:true});
window.addEventListener('load',()=>setTimeout(paint,100),{once:true});

window.YardivoHomeSavedCountV583={
  count:()=>liveAnnouncements().length,
  refresh:paint
};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-home-saved-count-fix';
})();
