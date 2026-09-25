
(function(){
'use strict';
const started=performance.now();
let done=false;

function finalizeLogin(){
  if(done)return true;
  const overlay=document.getElementById('loginOverlay');
  if(!overlay)return false;

  done=true;

  document.documentElement.classList.remove('yardivo-booting');
  document.documentElement.classList.add('yardivo-login-ready','yardivo-welcome-complete');
  document.body.classList.remove('yardivo-welcome-active');
  document.body.classList.add('yardivo-prelogin');

  const splash=document.getElementById('yardivoWelcomeSplash');
  if(splash){
    splash.classList.add('hide');
    splash.style.setProperty('display','none','important');
    splash.style.setProperty('visibility','hidden','important');
    splash.style.setProperty('opacity','0','important');
    splash.style.setProperty('pointer-events','none','important');
  }

  overlay.removeAttribute('inert');
  overlay.removeAttribute('aria-disabled');
  overlay.setAttribute('aria-hidden','false');
  overlay.style.setProperty('display','flex','important');
  overlay.style.setProperty('visibility','visible','important');
  overlay.style.setProperty('opacity','1','important');
  overlay.style.setProperty('pointer-events','auto','important');
  overlay.style.setProperty('z-index','2147483647','important');

  const form=document.getElementById('loginForm');
  if(form){
    form.removeAttribute('inert');
    form.removeAttribute('aria-disabled');
    form.style.setProperty('pointer-events','auto','important');
  }

  ['loginUser','loginPass','loginRole','rememberMe','loginSubmitBtn','loginChangePasswordBtn'].forEach(id=>{
    const el=document.getElementById(id);
    if(!el)return;
    el.disabled=false;
    el.removeAttribute('disabled');
    el.removeAttribute('readonly');
    el.removeAttribute('inert');
    el.removeAttribute('aria-disabled');
    el.removeAttribute('aria-hidden');
    el.style.setProperty('pointer-events','auto','important');
  });

  try{
    const g=window.__YARDIVO_WELCOME_MO_GUARD__;
    /* stability hard-fix: keep coalescing MutationObserver wrapper active */
  }catch(_){}

  return true;
}

/* This fallback is intentionally independent from DOMContentLoaded/load and
   from the Welcome custom event. It fires after the normal 5.2s Welcome window. */
const rescue=setInterval(()=>{
  if(done){clearInterval(rescue);return}
  const elapsed=performance.now()-started;
  const overlay=document.getElementById('loginOverlay');
  const splash=document.getElementById('yardivoWelcomeSplash');

  const loginAlreadyShown=!!overlay && getComputedStyle(overlay).display!=='none';
  const splashGone=!splash ||
    splash.classList.contains('hide') ||
    getComputedStyle(splash).display==='none' ||
    getComputedStyle(splash).visibility==='hidden';

  if((loginAlreadyShown && splashGone) || elapsed>=5900){
    finalizeLogin();
    clearInterval(rescue);
  }
},100);

/* Normal path remains immediate when Welcome completes correctly. */
window.addEventListener('yardivo:welcome-complete',()=>{
  requestAnimationFrame(()=>requestAnimationFrame(finalizeLogin));
},{once:true});

window.YardivoLoginFinalizer={finalize:finalizeLogin};
})();
