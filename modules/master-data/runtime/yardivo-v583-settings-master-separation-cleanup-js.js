(()=>{'use strict';
function clean(){
 ['yardivoUnifiedSmartDbCardV583','yardivoSmartVisibleFinalV583','yardivoUnifiedSmartCardV583','yardivoUnifiedSmartSwitchCardV583','yardivoSmartToggleCardExactV583'].forEach(id=>document.getElementById(id)?.remove());
 const grid=document.querySelector('#settings .settings-grid');
 const smart=document.getElementById('yardivoSmartEngineSettingsV583');
 const qr=document.getElementById('qrMobileSettingsPanel');
 const host=document.getElementById('yardivoUnifiedSettingsV583')||grid;
 if(smart&&host&&smart.parentElement!==host)host.appendChild(smart);
 if(qr&&host&&qr.parentElement!==host)host.insertBefore(qr,smart||null);
 const reset=document.getElementById('yardivoDevTotalResetV583');
 const settings=document.getElementById('settings');
 if(reset&&settings&&reset.parentElement!==settings)settings.appendChild(reset);
}
document.addEventListener('click',e=>{
 if(e.target?.closest?.('[data-view="settings"],[data-home-target="settings"],#navSettings,#yardivoMasterPopupLaunchV583'))setTimeout(clean,40);
},true);
window.YardivoSettingsMasterSeparationV583={clean};
})();
