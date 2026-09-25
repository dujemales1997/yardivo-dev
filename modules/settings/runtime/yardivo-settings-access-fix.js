(function(){
  function role(){
    try{return String(window.currentSession?.role||'').toLowerCase()}catch(e){return''}
  }
  function fixSettings(){
    const r=role();
    document.body.dataset.yardivoRole=r;
    const settings=document.getElementById('settings');
    const main=document.querySelector('.main');

    // Original file has Settings after closing .main/.app-shell.
    // Move the existing section into .main; its markup/design itself is unchanged.
    if(settings&&main&&settings.parentElement!==main){
      main.appendChild(settings);
    }

    const nav=document.querySelector('.nav-btn[data-view="settings"]');
    const home=document.querySelector('[data-home-target="settings"]');
    if(r==='admin'){
      nav?.classList.remove('role-hidden');
      if(nav){nav.style.setProperty('display','flex','important');nav.style.setProperty('visibility','visible','important')}
      if(home){home.style.setProperty('display','block','important');home.style.setProperty('visibility','visible','important')}
    }
  }

  // Apply after all original role filters.
  const old=window.applyRoleAccess;
  if(typeof old==='function'){
    window.applyRoleAccess=function(){
      const x=old.apply(this,arguments);
      fixSettings();
      setTimeout(fixSettings,0);
      return x;
    };
  }

  // Settings button must always work for Admin.
  document.addEventListener('click',function(e){
    const b=e.target.closest('[data-view="settings"],[data-home-target="settings"]');
    if(!b)return;
    if(role()!=='admin')return;
    setTimeout(()=>{
      fixSettings();
      try{window.openAppView?.('settings')}catch(err){}
    },0);
  },true);

  window.addEventListener('load',()=>setTimeout(fixSettings,50));
  setTimeout(fixSettings,250);
  setTimeout(fixSettings,900);
  window.fixYardivoSettings=fixSettings;
})();
