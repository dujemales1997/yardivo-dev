(()=>{'use strict';
const $=id=>document.getElementById(id);
function getRole(){
 try{
  const candidates=[
   window.currentSession?.role, window.currentUser?.role, window.YARDIVO_CURRENT_USER?.role,
   JSON.parse(localStorage.getItem('yardivo_current_session')||'null')?.role,
   JSON.parse(localStorage.getItem('yardivo_session')||'null')?.role
  ];
  return String(candidates.find(Boolean)||'').trim().toLowerCase();
 }catch(_){return ''}
}
function admin(){return getRole()==='admin'}
function ensurePopupAccess(){
 const launch=$('yardivoMasterPopupLaunchV583'), popup=$('yardivoMasterPopupV583'),
       body=$('yardivoMasterPopupBodyV583'), pane=$('yardivoSettingsMasterPaneV583');
 document.body.classList.toggle('yardivo-is-admin-v583',admin());
 if(launch){
   launch.hidden=!admin();
   launch.style.display=admin()?'block':'none';
   launch.textContent='MASTER PODACI';
   launch.type='button';
 }
 if(body&&pane&&pane.parentElement!==body)body.appendChild(pane);
 if(popup&&!admin()){popup.style.display='none';popup.classList.remove('open','show','active')}
}
function openMaster(e){
 if(!admin())return;
 const popup=$('yardivoMasterPopupV583'),pane=$('yardivoSettingsMasterPaneV583');
 if(!popup||!pane)return;
 e?.preventDefault?.();e?.stopPropagation?.();
 popup.hidden=false;popup.style.display='flex';popup.classList.add('open','show','active');
 popup.setAttribute('aria-hidden','false');
 pane.hidden=false;pane.style.display='block';
 try{window.YardivoMasterDataV583?.refresh?.()}catch(_){}
 try{window.YardivoResponsiblePeopleV583?.refresh?.()}catch(_){}
}
document.addEventListener('click',e=>{
 const b=e.target?.closest?.('#yardivoMasterPopupLaunchV583');
 if(b){openMaster(e);return}
 if(e.target?.closest?.('[data-home-target="settings"],[data-view="settings"],[data-target="settings"],#navSettings'))
   setTimeout(ensurePopupAccess,0);
},true);
['yardivo:login','yardivo:data-synced','yardivo:master-data-ready'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(ensurePopupAccess,20)));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(ensurePopupAccess,150),{once:true});else setTimeout(ensurePopupAccess,0);
window.YARDIVO_DEV_BUILD='20260917-dev-v5.8.3-master-access-settings-repair-final';
})();
