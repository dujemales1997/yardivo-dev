(()=>{'use strict';
if(window.__YV_RECEPTION_BASIC_SETTINGS_ONLY__)return;
window.__YV_RECEPTION_BASIC_SETTINGS_ONLY__=true;

function isReception(){
  const r=String(window.currentSession?.app_role||window.currentSession?.role||document.body.dataset.yardivoRole||'').toLowerCase();
  return r==='reception'||r==='prijam';
}
function clean(){
  if(!isReception())return;
  document.body.classList.add('yv-role-reception-v583');

  const root=document.getElementById('settings');
  if(!root)return;

  /* Hide any dynamically-generated supplier/user/admin/reset/QR controls by visible meaning.
     Personal preferences such as font size and sound are intentionally untouched. */
  root.querySelectorAll('button,a,[role="button"]').forEach(el=>{
    const t=String(el.textContent||'').trim().toLowerCase();
    if(
      t.includes('dodaj dobavljača')||
      t.includes('dodaj dobavljaca')||
      t.includes('dodaj korisnika')||
      t.includes('qr scan')||
      t.includes('reset yardivo')
    ){
      const card=el.closest('.settings-card,.panel,.card,.ymd-card');
      if(card&&/dobavlja|korisnik|qr|reset/i.test(String(card.textContent||''))){
        card.style.setProperty('display','none','important');
      }else{
        el.style.setProperty('display','none','important');
      }
    }
  });

  document.getElementById('yardivoMasterDataRegistryV583')?.style.setProperty('display','none','important');
}
window.addEventListener('yardivo:login',()=>setTimeout(clean,0));
document.addEventListener('click',e=>{
  if(e.target?.closest?.('[data-view="settings"],[data-home-target="settings"],#navSettings'))setTimeout(clean,0);
},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',clean,{once:true});
else clean();
})();
