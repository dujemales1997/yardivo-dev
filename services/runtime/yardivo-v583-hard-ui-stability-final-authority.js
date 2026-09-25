(()=>{'use strict';
if(window.__YARDIVO_HARD_UI_STABILITY_FINAL__)return;
window.__YARDIVO_HARD_UI_STABILITY_FINAL__=true;

function ensureDb(){
  try{window.YardivoDbStatusAuthorityV583?.ensureEl?.()}catch(_){}
  try{window.YardivoSupabase?.recover?.()}catch(_){}
}
function keepCurrentView(){
  const active=[...document.querySelectorAll('.view.active')];
  if(active.length<=1)return;
  /* If legacy code temporarily activates more than one, preserve the most recently opened canonical view. */
  let wanted='';
  try{wanted=sessionStorage.getItem('yardivo_v583_last_open_view')||''}catch(_){}
  const keep=active.find(v=>v.id===wanted)||active[active.length-1];
  active.forEach(v=>v.classList.toggle('active',v===keep));
}
window.addEventListener('yardivo:view-opened',e=>{
  const v=String(e?.detail?.view||'');
  if(v){try{sessionStorage.setItem('yardivo_v583_last_open_view',v)}catch(_){}}
  keepCurrentView();
});
['yardivo:login','yardivo:supabase-online','online','focus'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(ensureDb,30)));
window.addEventListener('load',()=>setTimeout(ensureDb,800),{once:true});
setTimeout(ensureDb,250);

window.YardivoHardUiStabilityV583={ensureDb,keepCurrentView};
window.YARDIVO_DEV_BUILD='20260918-dev-v5.8.3-ui-hard-stable-supabase-qr-final';
})();
