(()=>{'use strict';
if(window.__YARDIVO_HEADER_BELL_FINAL__)return;
window.__YARDIVO_HEADER_BELL_FINAL__=true;
function authenticated(){return !!(window.currentSession?.user||window.currentSession?.username||window.currentSession?.authUserId)}
function apply(){
 const top=document.querySelector('.topbar'),wh=top?.querySelector('.warehouse-toolbar'),center=top?.querySelector('.notif-center'),bell=document.getElementById('notifBell');
 if(!top||!center||!bell)return;
 /* Canonical placement: immediately to the right of the warehouse selector. */
 if(wh&&wh.nextElementSibling!==center)wh.insertAdjacentElement('afterend',center);
 const on=authenticated();
 if(center.hidden===on)center.hidden=!on;
 if(bell.hidden===on)bell.hidden=!on;
 if(on){
   if(center.style.display!=='flex')center.style.setProperty('display','flex','important');
   if(center.style.visibility!=='visible')center.style.setProperty('visibility','visible','important');
   bell.classList.remove('role-hidden');
   if(bell.style.display!=='inline-flex')bell.style.setProperty('display','inline-flex','important');
   if(bell.style.visibility!=='visible')bell.style.setProperty('visibility','visible','important');
 }
}
['yardivo:login','yardivo:data-synced','yardivo:notifications-changed','yardivo:context-changed']
 .forEach(ev=>window.addEventListener(ev,()=>setTimeout(apply,20)));
window.addEventListener('load',()=>setTimeout(apply,700));
document.addEventListener('click',()=>setTimeout(apply,0),true);
setTimeout(apply,100);
window.YardivoHeaderBellFinalV583={apply};
})();
