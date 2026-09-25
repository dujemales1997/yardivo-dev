
(()=>{'use strict';
function onSettings(){
  setTimeout(()=>{
    try{window.YardivoSmartEngineSettingsV583?.render?.()}catch(_){}
    try{window.yardivoLoadQrScanSetting?.()}catch(_){}
    try{window.YardivoStableMasterV583?.render?.()}catch(_){}
  },80);
}
document.addEventListener('click',e=>{
  if(e.target?.closest?.('[data-view="settings"],[data-home-target="settings"],#navSettings,[data-settings-tab="qr"],[data-settings-tab="general"]'))onSettings();
},true);
window.YARDIVO_DEV_BUILD='20260918-dev-v5.8.3-settings-smart-qr-master-factory-zero-final';
})();
