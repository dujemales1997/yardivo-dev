(function(){
'use strict';
if(window.__YARDIVO_SETTINGS_SINGLE_PAGE_V583__)return;
window.__YARDIVO_SETTINGS_SINGLE_PAGE_V583__=true;
function apply(){
 const settings=document.getElementById('settings');if(!settings)return;
 const admin=document.getElementById('yardivoSettingsAdminPaneV583');
 const master=document.getElementById('yardivoSettingsMasterPaneV583');
 if(admin){admin.classList.add('active');admin.hidden=false;admin.removeAttribute('aria-hidden')}
 if(master){
   const allowed=document.body.classList.contains('yardivo-v583-master-admin');
   master.classList.toggle('active',allowed);master.hidden=!allowed;
   master.setAttribute('aria-hidden',allowed?'false':'true');
 }
 try{if(document.body.classList.contains('yardivo-v583-master-admin'))window.YardivoStableMasterV583?.render?.(true)}catch(_){}
}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]'))setTimeout(apply,40)},true);
['yardivo:login','yardivo:master-data-changed','yardivo:data-synced'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(apply,30)));
document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,160));
window.addEventListener('load',()=>setTimeout(apply,420),{once:true});
window.YardivoSettingsSinglePageV583={refresh:apply};
window.YARDIVO_DEV_BUILD='20260915-dev-v5.8.3-settings-single-page-master-light-blue-final';
})();
