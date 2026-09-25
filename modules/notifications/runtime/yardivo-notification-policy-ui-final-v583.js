(function(){
'use strict';
function norm(r){
 r=String(r||'').toLowerCase().trim();
 if(r==='management'||r==='voditelj')return'manager';
 if(r==='prijam')return'reception';
 if(r==='zalihe'||r.includes('zalih'))return'inventory';
 if(r==='porta'||r==='portir')return'gate';
 return r;
}
function apply(){
 const r=norm(window.currentSession?.role);
 const bell=document.getElementById('notifBell');
 const nav=document.querySelector('[data-view="operations"]');
 const home=document.querySelector('[data-home-target="operations"]');
 let show=['admin','inventory','reception'].includes(r);
 if(r==='manager')show=window.yardivoManagerSectionAllowed?.('operations')===true;
 const authenticated=!!(window.currentSession?.user||window.currentSession?.username||window.currentSession?.authUserId);
 /* Header bell visibility/placement is owned by YardivoHeaderBellFinalV583. */
 [nav,home].filter(Boolean).forEach(el=>{
   el.style.setProperty('display',show?'flex':'none','important');
   el.classList.toggle('role-hidden',!show);
 });
}
window.addEventListener('yardivo:login',()=>setTimeout(apply,60));
window.addEventListener('yardivo:data-synced',()=>setTimeout(apply,60));
window.addEventListener('load',()=>setTimeout(apply,900));
document.addEventListener('click',()=>setTimeout(apply,0),true);
window.YardivoNotificationPolicyUIV583={apply};
})();
