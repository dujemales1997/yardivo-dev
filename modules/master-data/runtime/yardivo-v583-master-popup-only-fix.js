(()=>{'use strict';
 if(window.__YARDIVO_MASTER_POPUP_ONLY_FIX__)return;window.__YARDIVO_MASTER_POPUP_ONLY_FIX__=true;
 function moveMasterIntoPopup(){
   const body=document.getElementById('yardivoMasterPopupBodyV583');
   if(!body)return;
   let pane=document.getElementById('yardivoSettingsMasterPaneV583');
   if(!pane){pane=document.createElement('div');pane.id='yardivoSettingsMasterPaneV583';body.appendChild(pane)}
   else if(pane.parentElement!==body)body.appendChild(pane);
   ['yardivoStableMasterEditorV583','yardivoMasterDataRegistryV583','yardivoMasterOperationalConfigV583'].forEach(id=>{
     const el=document.getElementById(id);if(el&&el.parentElement!==pane)pane.appendChild(el);
   });
   pane.classList.add('active');
   pane.style.setProperty('display','block','important');
   const nav=document.getElementById('yardivoMasterAdminSettingsV583');if(nav)nav.style.setProperty('display','none','important');
 }
 function cleanSettings(){
   moveMasterIntoPopup();
   const settings=document.getElementById('settings');if(!settings)return;
   const adminPane=document.getElementById('yardivoSettingsAdminPaneV583');if(adminPane){adminPane.classList.add('active');adminPane.style.setProperty('display','block','important')}
 }
 document.addEventListener('DOMContentLoaded',()=>setTimeout(cleanSettings,220));
 window.addEventListener('load',()=>setTimeout(cleanSettings,500));
 document.addEventListener('click',e=>{if(e.target?.closest?.('#yardivoMasterPopupLaunchV583'))setTimeout(()=>{cleanSettings();try{window.YardivoStableMasterV583?.render?.(true)}catch(_){}},0)},true);
 ['yardivo:data-synced','yardivo:master-data-changed','yardivo:login'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(cleanSettings,100)));
 setTimeout(cleanSettings,80);
 window.YardivoMasterPopupOnlyV583={refresh:cleanSettings};
 window.YARDIVO_DEV_BUILD='20260916-dev-v5.8.3-master-popup-only-fix-final';
})();
