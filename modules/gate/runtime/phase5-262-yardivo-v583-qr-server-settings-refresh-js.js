
(()=>{'use strict';
document.addEventListener('click',e=>{
  if(e.target?.closest?.('[data-view="settings"],[data-home-target="settings"],#navSettings,[data-settings-tab="qr"]')){
    setTimeout(()=>{try{window.yardivoLoadQrScanSetting?.()}catch(_){}},120);
  }
},true);
})();
