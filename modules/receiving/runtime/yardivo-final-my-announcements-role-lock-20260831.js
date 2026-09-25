(function(){
'use strict';
function norm(r){
 r=String(r||'').toLowerCase().trim();
 if(r==='zalihe'||r.includes('zalih'))return'inventory';
 if(r==='prijam')return'reception';
 if(r==='porta'||r==='portir')return'gate';
 return r;
}
function lock(){
 const r=norm(window.currentSession?.role);
 if(!r)return;
 document.documentElement.dataset.yardivoRole=r;
 document.body.dataset.yardivoRole=r;
 const ok=r==='inventory';
 const btn=document.querySelector('[data-view="yardivoMyAnnouncements"]');
 if(btn){
   btn.style.setProperty('display',ok?'flex':'none','important');
   btn.style.setProperty('visibility',ok?'visible':'hidden','important');
   btn.classList.toggle('role-hidden',!ok);
 }
 if(!ok){
   const v=document.getElementById('yardivoMyAnnouncements');
   v?.classList.remove('active');
   v?.style.setProperty('display','none','important');
 }
 try{window.YardivoMyAnnouncements?.apply?.()}catch(e){}
}
window.addEventListener('yardivo:login',()=>queueMicrotask(lock));
window.addEventListener('load',()=>setTimeout(lock,100));
document.addEventListener('click',e=>{
 if(e.target.closest('[data-view="yardivoMyAnnouncements"]'))queueMicrotask(lock);
},true);
})();
