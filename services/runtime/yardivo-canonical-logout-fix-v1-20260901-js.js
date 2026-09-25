(function(){
'use strict';
let busy=false;

function clearLocalSession(){
  try{
    localStorage.removeItem('yardivo_custom_session');
    localStorage.removeItem('yardivo_remembered_session');
    sessionStorage.removeItem('studenac_demo_session');
  }catch(_){}
  try{window.currentSession=null;if(typeof currentSession!=='undefined')currentSession=null}catch(_){window.currentSession=null}
}

function showLoggedOutUI(){
  const html=document.documentElement,body=document.body;
  html.classList.remove('yardivo-app-authenticated');
  html.classList.add('yardivo-login-ready','yardivo-welcome-complete');
  body.classList.remove('yardivo-role-switching','home-menu-mode');
  body.classList.add('yardivo-prelogin');

  document.querySelectorAll('.view.active').forEach(v=>v.classList.remove('active'));

  const overlay=document.getElementById('loginOverlay');
  if(overlay){
    overlay.style.setProperty('display','flex','important');
    overlay.style.setProperty('visibility','visible','important');
    overlay.style.setProperty('opacity','1','important');
    overlay.style.setProperty('pointer-events','auto','important');
    overlay.setAttribute('aria-hidden','false');
  }

  const splash=document.getElementById('yardivoWelcomeSplash');
  if(splash){
    splash.style.setProperty('display','none','important');
    splash.style.setProperty('pointer-events','none','important');
  }

  const pass=document.getElementById('loginPass');
  if(pass)pass.value='';
  const err=document.getElementById('loginError');
  if(err){err.textContent='';err.style.display='none'}

  requestAnimationFrame(()=>document.getElementById('loginUser')?.focus());
}

async function logout(){
  if(busy)return;
  busy=true;

  /* First remove application access synchronously. Even if network sign-out is slow,
     the user can never remain visually inside YARDIVO after pressing ODJAVA. */
  clearLocalSession();
  showLoggedOutUI();

  try{
    if(window.YardivoAuth?.logout){
      await window.YardivoAuth.logout();
    }else if(window.__yardivoAuthClient?.auth?.signOut){
      await window.__yardivoAuthClient.auth.signOut({scope:'local'});
    }
  }catch(e){
    console.warn('YARDIVO logout',e);
  }finally{
    clearLocalSession();
    showLoggedOutUI();
    busy=false;
  }
}

/* Capture before all historic logout listeners. */
document.addEventListener('click',e=>{
  const b=e.target.closest?.('#logoutBtn,#homeLogoutBtn');
  if(!b)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  logout();
},true);

window.YardivoCanonicalLogout={logout};
})();
