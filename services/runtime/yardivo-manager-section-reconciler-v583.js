(function(){
'use strict';
let queued=false;
function role(){return window.YardivoManagerSectionAuthority?.norm?.(window.currentSession?.role)||''}
function run(){
  queued=false;
  if(role()!=='manager')return;
  const allowed=window.yardivoManagerSectionAllowed;
  if(typeof allowed!=='function')return;
  document.querySelectorAll('[data-view]').forEach(el=>{
    const id=el.dataset.view;if(!id)return;
    if(allowed(id)===false){
      el.classList.add('role-hidden');
      el.style.setProperty('display','none','important');
    }
  });
  document.querySelectorAll('[data-home-target]').forEach(el=>{
    const id=el.dataset.homeTarget;if(!id)return;
    if(allowed(id)===false){
      el.classList.add('role-hidden');
      el.style.setProperty('display','none','important');
    }
  });
}
function queue(){
  if(queued)return;queued=true;
  requestAnimationFrame(run);
}
/* YARDIVO V5.8.3 stability: global manager class/style observer removed; login/click/data-synced hooks remain. */
window.addEventListener('yardivo:login',()=>setTimeout(run,0));
window.addEventListener('yardivo:data-synced',()=>setTimeout(run,0));
document.addEventListener('click',()=>setTimeout(run,0),true);
window.YardivoManagerSectionReconciler={run};
})();
