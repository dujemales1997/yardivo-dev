(function(){
'use strict';

function openAuthenticatedApp(){
  /* Clear every pre-login state that earlier startup fixes intentionally set. */
  document.documentElement.classList.remove(
    'yardivo-booting',
    'yardivo-login-ready'
  );
  document.documentElement.classList.add(
    'yardivo-welcome-complete',
    'yardivo-app-authenticated'
  );
  document.body.classList.remove(
    'yardivo-prelogin',
    'yardivo-welcome-active'
  );

  const splash=document.getElementById('yardivoWelcomeSplash');
  if(splash){
    splash.style.setProperty('display','none','important');
    splash.style.setProperty('pointer-events','none','important');
  }

  const overlay=document.getElementById('loginOverlay');
  if(overlay){
    overlay.setAttribute('aria-hidden','true');
    overlay.style.setProperty('display','none','important');
    overlay.style.setProperty('visibility','hidden','important');
    overlay.style.setProperty('opacity','0','important');
    overlay.style.setProperty('pointer-events','none','important');
  }

  /* Use the application's own entry routine first. */
  try{
    if(typeof enterApp==='function')enterApp();
  }catch(e){
    console.error('YARDIVO enterApp failed',e);
  }

  /* Re-clear prelogin because older render/access routines may touch body classes. */
  document.body.classList.remove('yardivo-prelogin','yardivo-welcome-active');

  /* Guarantee a visible starting view if a legacy view routine failed. */
  let active=document.querySelector('.view.active');
  const home=document.getElementById('homeMenu');
  if(!active && home){
    document.querySelectorAll('.view').forEach(v=>{
      v.classList.remove('active');
      v.style.removeProperty('display');
      v.style.removeProperty('visibility');
      v.style.removeProperty('opacity');
      v.style.removeProperty('pointer-events');
    });
    home.classList.add('active');
    active=home;
  }

  try{YardivoRoleAccessFinal?.apply?.()}catch(_){}
  try{window.YardivoExactRBAC?.apply?.()}catch(_){}
  try{if(typeof render==='function')render()}catch(_){}

  /* render() may recreate view state; enforce Home only if nothing is active. */
  if(!document.querySelector('.view.active') && home){
    home.classList.add('active');
  }

  return true;
}

window.YardivoPostAuthTransition={open:openAuthenticatedApp};
})();
