
(()=>{'use strict';
const $=id=>document.getElementById(id);
const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
function role(){
 try{
  return norm(window.currentSession?.role||window.currentUser?.role||JSON.parse(localStorage.getItem('yardivo_current_session')||'null')?.role||JSON.parse(localStorage.getItem('yardivo_session')||'null')?.role);
 }catch(_){return ''}
}
function isAdmin(){return role()==='admin'}
function ordinary(panel){
 const t=norm(panel?.textContent);
 return t.includes('veličina teksta')||t.includes('neradni dan')||t.includes('radni dan')||
        t.includes('glasovn')||t.includes('voice')||t.includes('yardivo smart')||
        t.includes('smart opc')||t.includes('qr / mobile')||t.includes('qr & mobile')||
        t.includes('qr scanner')||t.includes('mobilni skener');
}
function masterish(panel){
 const t=norm(panel?.textContent);
 return t.includes('master')||t.includes('lokacij')||t.includes('skladišt')||t.includes('ramp')||
        t.includes('dobavljač')||t.includes('odgovorn')||t.includes('dwell')||t.includes('detention')||
        t.includes('kapacitet')||t.includes('prijem robe')||t.includes('reception');
}
function separate(){
 const settings=$('settings'), popupBody=$('yardivoMasterPopupBodyV583'), pane=$('yardivoSettingsMasterPaneV583');
 document.body.classList.toggle('yardivo-is-admin-v583',isAdmin());
 if(popupBody&&pane&&pane.parentElement!==popupBody)popupBody.appendChild(pane);

 /* Dynamic settings owners are classified only at direct-card level.
    Ordinary settings never move to Master. Master business panels never remain in Settings. */
 if(settings){
  settings.querySelectorAll('.settings-grid > .panel,.settings-grid > .danger-zone').forEach(p=>{
    if(ordinary(p)){
      p.dataset.yvOrdinarySetting='1';p.hidden=false;p.style.setProperty('display','block','important');
    }else if(masterish(p) && !p.closest('#yardivoSettingsAdminPaneV583')){
      /* Do not move arbitrary legacy panels: retire duplicates. Canonical Master pane is the owner. */
      p.hidden=true;p.style.setProperty('display','none','important');
    }
  });
 }
 const launch=$('yardivoMasterPopupLaunchV583');
 if(launch){launch.hidden=!isAdmin();launch.style.display=isAdmin()?'block':'none';launch.textContent='MASTER PODACI'}
 const admin=$('yardivoSettingsAdminPaneV583');
 if(admin){
   if(admin.closest('#yardivoMasterPopupV583')&&settings)settings.querySelector('.settings-grid')?.appendChild(admin);
   admin.hidden=!isAdmin();admin.style.setProperty('display',isAdmin()?'block':'none','important');
 }
}
document.addEventListener('click',e=>{
 if(e.target?.closest?.('[data-home-target="settings"],[data-view="settings"],[data-target="settings"],#navSettings,#yardivoMasterPopupLaunchV583'))setTimeout(separate,0);
},true);
['yardivo:login','yardivo:data-synced','yardivo:master-data-ready'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(separate,20)));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(separate,200),{once:true});else setTimeout(separate,0);
window.YARDIVO_DEV_BUILD='20260917-dev-v5.8.3-master-ordinary-settings-strict-separation-final';
})();
