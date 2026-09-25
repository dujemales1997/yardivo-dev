(function(){
'use strict';

function hideAppDuringPrelogin(){
  if(!document.body)return;
  if(!document.body.classList.contains('yardivo-prelogin')){
    document.body.classList.add('yardivo-prelogin');
  }
  document.documentElement.classList.remove('yardivo-app-visible');
}

function revealLoginUnderSplash(){
  const login=document.getElementById('loginOverlay');
  if(!login)return;
  login.classList.remove('hidden');
  login.style.display='flex';
  login.style.visibility='visible';
  login.style.opacity='1';
  login.setAttribute('aria-hidden','false');
  document.documentElement.classList.add('yardivo-login-ready');
}

/* No MutationObserver here. The old observer watched BODY class/style and
   wrote BODY classes from its own callback, which could create an endless
   microtask loop after Welcome and freeze all mouse/keyboard interaction. */
hideAppDuringPrelogin();

window.addEventListener('yardivo:welcome-complete',()=>{
  hideAppDuringPrelogin();
  revealLoginUnderSplash();
},{once:true});

window.YardivoStartupHandoffFix={
  hideAppDuringPrelogin,
  revealLoginUnderSplash
};
})();
