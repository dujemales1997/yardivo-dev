(()=>{'use strict';
if(window.__YARDIVO_SUPPLIER_NO_FLICKER_FINAL_20260923__)return;
window.__YARDIVO_SUPPLIER_NO_FLICKER_FINAL_20260923__=true;
let installed=false,nativeRender=null,lastView='';
function supplier(){try{return String((typeof currentSession!=='undefined'?currentSession:window.currentSession)?.role||'').toLowerCase()==='supplier'}catch(_){return false}}
function view(){return document.querySelector('#yardivoSupplierPortal [data-ysp-view].active')?.dataset?.yspView||''}
function install(){
  if(installed||!supplier()||!window.YardivoSupplierPortal?.render)return;
  nativeRender=window.YardivoSupplierPortal.render.bind(window.YardivoSupplierPortal);
  window.YardivoSupplierPortal.render=function(){
    const v=view();
    if(['history','status'].includes(v)&&window.YardivoSupplierHistoryStatusServerV583){
      window.YardivoSupplierHistoryStatusServerV583.render();
      return;
    }
    return nativeRender(...arguments);
  };
  installed=true;
}
function stabilize(){
  if(!supplier())return;
  const p=document.getElementById('yardivoSupplierPortal');if(!p)return;
  p.style.setProperty('visibility','visible','important');
  p.style.setProperty('opacity','1','important');
  p.querySelectorAll('[data-ysp-section]').forEach(sec=>{
    sec.style.setProperty('transition','none','important');
    sec.style.setProperty('animation','none','important');
  });
  const v=view();
  if(v!==lastView){lastView=v}
}
window.addEventListener('yardivo:login',()=>setTimeout(()=>{install();stabilize()},100));
window.addEventListener('yardivo:data-synced',()=>setTimeout(stabilize,0));
document.addEventListener('click',e=>{if(e.target.closest?.('#yardivoSupplierPortal [data-ysp-view]'))setTimeout(()=>{install();stabilize()},0)},true);
setTimeout(()=>{install();stabilize()},300);
window.YARDIVO_DEV_BUILD='20260923-dev-v5.8.3-supplier-no-flicker-final';
})();
