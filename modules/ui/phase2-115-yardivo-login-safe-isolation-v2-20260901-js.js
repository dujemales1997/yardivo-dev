
(function(){
'use strict';

function sessionActive(){
  try{return !!window.currentSession?.role}catch(_){return false}
}

function forceInteractive(){
  if(sessionActive())return false;

  const splash=document.getElementById('yardivoWelcomeSplash');
  const overlay=document.getElementById('loginOverlay');
  const form=document.getElementById('loginForm');
  if(!overlay||!form)return false;

  /* Do not unlock before Welcome has actually finished. */
  const welcomeDone=
    document.documentElement.classList.contains('yardivo-welcome-complete') ||
    (splash && (splash.classList.contains('hide') || splash.style.display==='none'));
  if(!welcomeDone)return false;

  document.documentElement.classList.remove('yardivo-booting');
  document.documentElement.classList.add('yardivo-welcome-complete','yardivo-login-ready');
  document.body.classList.remove('yardivo-welcome-active');
  document.body.classList.add('yardivo-prelogin');

  /* Remove Welcome from the DOM entirely. It can no longer intercept anything. */
  if(splash)splash.remove();

  /* Move the real ORIGINAL login node to the end of BODY.
     Existing auth listeners stay attached because the same DOM node is moved, not cloned. */
  if(overlay.parentElement!==document.body || overlay!==document.body.lastElementChild){
    document.body.appendChild(overlay);
  }

  [document.documentElement,document.body,overlay,form].forEach(el=>{
    if(!el)return;
    el.removeAttribute('inert');
    el.removeAttribute('aria-disabled');
    el.style.setProperty('pointer-events','auto','important');
  });

  overlay.setAttribute('aria-hidden','false');
  overlay.style.setProperty('display','flex','important');
  overlay.style.setProperty('visibility','visible','important');
  overlay.style.setProperty('opacity','1','important');
  overlay.style.setProperty('z-index','2147483647','important');

  const controls=[
    document.getElementById('loginUser'),
    document.getElementById('loginPass'),
    document.getElementById('loginRole'),
    document.getElementById('rememberMe'),
    document.getElementById('loginSubmitBtn'),
    document.getElementById('loginChangePasswordBtn')
  ].filter(Boolean);

  controls.forEach(el=>{
    el.disabled=false;
    el.removeAttribute('disabled');
    el.removeAttribute('readonly');
    el.removeAttribute('inert');
    el.removeAttribute('aria-disabled');
    el.removeAttribute('aria-hidden');
    el.style.setProperty('pointer-events','auto','important');
  });

  const u=document.getElementById('loginUser');
  const p=document.getElementById('loginPass');
  if(u){
    u.tabIndex=0;
    u.style.setProperty('user-select','text','important');
    u.style.setProperty('-webkit-user-select','text','important');
  }
  if(p){
    p.tabIndex=0;
    p.style.setProperty('user-select','text','important');
    p.style.setProperty('-webkit-user-select','text','important');
  }

  return true;
}

/* Coordinate fallback:
   even if a stale transparent legacy element becomes the event target,
   clicking where username/password physically are focuses the real input. */
document.addEventListener('pointerdown',function(e){
  if(sessionActive())return;
  const overlay=document.getElementById('loginOverlay');
  if(!overlay || getComputedStyle(overlay).display==='none')return;

  for(const id of ['loginUser','loginPass']){
    const el=document.getElementById(id);
    if(!el)continue;
    const r=el.getBoundingClientRect();
    if(e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom){
      el.disabled=false;
      el.removeAttribute('readonly');
      try{el.focus({preventScroll:true})}catch(_){el.focus()}
      return;
    }
  }
},true);

/* Keyboard fallback makes the login usable even before first mouse interaction. */
document.addEventListener('keydown',function(e){
  if(sessionActive())return;
  const overlay=document.getElementById('loginOverlay');
  if(!overlay || getComputedStyle(overlay).display==='none')return;
  if(e.key==='Tab' && !overlay.contains(document.activeElement)){
    const u=document.getElementById('loginUser');
    if(u){e.preventDefault();u.focus()}
  }
},true);

window.addEventListener('yardivo:welcome-complete',()=>{
  requestAnimationFrame(()=>requestAnimationFrame(forceInteractive));
});

/* Independent fallback: after Welcome duration, unlock if the Login is present.
   This deliberately does not depend on a body class being correct. */
window.addEventListener('load',()=>{
  setTimeout(forceInteractive,5700);
  setTimeout(forceInteractive,6200);
  setTimeout(forceInteractive,7000);
},{once:true});

window.YardivoLoginSafeIsolation={forceInteractive};
})();
