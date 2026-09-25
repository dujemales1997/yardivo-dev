
(()=>{'use strict';
if(window.__YARDIVO_STABLE_HOME_GUARD_FINAL__)return;
window.__YARDIVO_STABLE_HOME_GUARD_FINAL__=true;
function ensureHome(){
  let sess=null;try{sess=typeof currentSession!=='undefined'?currentSession:window.currentSession}catch(_){}
  if(!sess)return;
  if(document.querySelector('.view.active'))return;
  const h=document.getElementById('homeMenu');if(!h)return;
  try{
    if(window.YardivoRoleStableFinal?.open)window.YardivoRoleStableFinal.open('homeMenu');
    else{document.body.classList.add('home-menu-mode');h.classList.add('active')}
  }catch(_){}
}
/* Only auth events may repair an empty view. Data refresh must preserve current section. */
['yardivo:login','yardivo:authenticated','yardivo:session-ready']
 .forEach(ev=>window.addEventListener(ev,()=>requestAnimationFrame(ensureHome)));
window.YardivoStableHomeGuardV583={ensureHome};
})();
