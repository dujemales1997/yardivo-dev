
(function(){
  function isAdmin(){
    try{return String(currentSession?.role||window.currentSession?.role||'').toLowerCase()==='admin'}catch(e){return false}
  }
  function sync(){
    const panel=document.getElementById('masterUserAdmin');
    if(panel && isAdmin()) panel.style.display='block';
    const btn=document.getElementById('muSave');
    if(btn && isAdmin()){
      btn.disabled=false;
      btn.style.pointerEvents='auto';
      btn.style.opacity='1';
    }
  }
  setTimeout(sync,50);
  setTimeout(sync,400);
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="settings"],[data-home-target="settings"]'))setTimeout(sync,50);
  });
})();
