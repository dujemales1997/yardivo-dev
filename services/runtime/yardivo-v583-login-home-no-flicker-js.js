(()=>{'use strict';
if(window.__YARDIVO_LOGIN_HOME_LANDING_FINAL__)return;
window.__YARDIVO_LOGIN_HOME_LANDING_FINAL__=true;
let handled=false;

function session(){
  try{if(typeof currentSession!=='undefined'&&currentSession)return currentSession}catch(_){}
  return window.currentSession||window.currentUser||null;
}
function openHomeOnce(){
  if(!session()||handled)return false;
  handled=true;
  try{
    if(window.YardivoRoleStableFinal?.open){
      window.YardivoRoleStableFinal.open('homeMenu');
    }else if(typeof openAppView==='function'){
      openAppView('homeMenu');
    }else{
      const h=document.getElementById('homeMenu');
      if(!h)return false;
      document.querySelectorAll('.view.active').forEach(x=>x.classList.remove('active'));
      h.classList.add('active');
      document.body.classList.add('home-menu-mode');
    }
    try{sessionStorage.setItem('yardivo_v583_login_landing','homeMenu')}catch(_){}
    return true;
  }catch(e){console.warn('[YARDIVO HOME LANDING]',e);return false}
}
function arm(){handled=false}
document.addEventListener('submit',e=>{
  if(e.target?.closest?.('#loginForm,.login-form,[data-login-form]'))arm();
},true);

/* Home landing happens only on authentication lifecycle, NEVER on data/master sync. */
['yardivo:login','yardivo:authenticated','yardivo:session-ready'].forEach(ev=>{
  window.addEventListener(ev,()=>setTimeout(openHomeOnce,20));
});

window.YardivoLoginHomeNoFlickerV583={arm,activateHome:openHomeOnce,authReady:openHomeOnce};
})();
