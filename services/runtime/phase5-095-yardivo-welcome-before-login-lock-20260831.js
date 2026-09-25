
(function(){
'use strict';
function lock(){
 const splash=document.getElementById('yardivoWelcomeSplash');
 const login=document.getElementById('loginOverlay');
 if(!splash||!login)return;
 const active=document.body.classList.contains('yardivo-welcome-active') &&
   splash.style.display!=='none' && !splash.classList.contains('hide');
 if(active){
   login.style.display='none';
   login.setAttribute('aria-hidden','true');
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',lock,{once:true});else lock();
setTimeout(lock,60);
setTimeout(lock,250);
setTimeout(lock,1000);
})();
