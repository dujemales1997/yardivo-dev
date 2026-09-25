(function(){
'use strict';
function sessionActive(){
 try{return !!window.currentSession?.role}catch(_){return false}
}
function enableLoginControls(){
 const u=document.getElementById('loginUser');
 const pw=document.getElementById('loginPass');
 const role=document.getElementById('loginRole');
 const change=document.getElementById('loginChangePasswordBtn');
 [u,pw,role,change].forEach(el=>{
   if(!el)return;
   el.disabled=false;
   el.removeAttribute('disabled');
   el.style.pointerEvents='auto';
   el.style.userSelect='auto';
 });
}
function stabilize(){
 const overlay=document.getElementById('loginOverlay');
 if(!overlay)return;
 if(sessionActive()){
   overlay.style.display='none';
   overlay.setAttribute('aria-hidden','true');
 }else{
   /* Welcome controller owns the transition to login.
      Do not reveal login while the welcome splash is active. */
   const splash=document.getElementById('yardivoWelcomeSplash');
   const welcomeActive=document.body.classList.contains('yardivo-welcome-active') &&
     splash && splash.style.display!=='none' && !splash.classList.contains('hide');
   if(!welcomeActive){
     overlay.style.display='flex';
     overlay.setAttribute('aria-hidden','false');
   }
 }
 enableLoginControls();
}
window.YardivoLoginStability={stabilize};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(stabilize,40),{once:true});
else setTimeout(stabilize,40);
window.addEventListener('load',()=>setTimeout(stabilize,80));
window.addEventListener('yardivo:login',()=>setTimeout(stabilize,0));
})();
