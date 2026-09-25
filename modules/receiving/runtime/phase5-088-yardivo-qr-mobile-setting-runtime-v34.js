
(function(){
  let lastRole='',lastValue='';
  setInterval(function(){
    try{
      const role=String(window.currentSession?.role||currentSession?.role||'');
      const val=(typeof yardivoQrMobileEnabled==='function'?(yardivoQrMobileEnabled()?'1':'0'):'');
      if(role!==lastRole||val!==lastValue){
        lastRole=role;lastValue=val;
        if(typeof renderQrMobileAdminSetting==='function')renderQrMobileAdminSetting();
        if(typeof renderReceiving==='function'&&document.getElementById('receiving')?.classList.contains('active'))renderReceiving();
      }
    }catch(e){}
  },1200);
})();
