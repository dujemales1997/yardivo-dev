
(function(){
'use strict';

let busy=false;
let pending=null;
let lastWarehouse='';
let originalSetGlobalWarehouse=null;

function currentWarehouse(){
  try{
    const w=String((typeof activeWarehouse!=='undefined'?activeWarehouse:window.activeWarehouse)||'').toUpperCase();
    if(w)return w;
  }catch(_){}
  try{return String(document.getElementById('globalWarehouse')?.value||'').toUpperCase()}catch(_){return''}
}

function mainSurface(){
  return document.querySelector('#main,.main,main,.app-main,.content,.main-content');
}

function restart(el,cls){
  if(!el)return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

function pulseContext(){
  const ctx=document.getElementById('yardivoGlobalContext');
  const name=document.getElementById('ygcWarehouseName');
  restart(ctx,'yardivo-wh-context-pulse');
  restart(name,'yardivo-wh-name-enter');
  setTimeout(()=>{
    ctx?.classList.remove('yardivo-wh-context-pulse');
    name?.classList.remove('yardivo-wh-name-enter');
  },320);
}

function cleanup(surface){
  surface?.classList.remove('yardivo-wh-exit','yardivo-wh-enter');
  document.body.classList.remove('yardivo-wh-switching');
  busy=false;
  if(pending){
    const next=pending;
    pending=null;
    setTimeout(()=>animateWarehouseChange(next.apply,next.args),0);
  }
}

function animateWarehouseChange(applyChange){
  if(typeof applyChange!=='function')return;
  /* Stability mode: never fade the whole application out while switching warehouse. */
  applyChange();
  requestAnimationFrame(()=>{lastWarehouse=currentWarehouse();pulseContext()});
}

/* Wrap the canonical warehouse switch function when available. */
function patchCanonicalSetter(){
  if(typeof window.setGlobalWarehouse!=='function')return false;
  if(window.setGlobalWarehouse.__yardivoWhTransitionPatched)return true;

  originalSetGlobalWarehouse=window.setGlobalWarehouse;
  const wrapped=function(code){
    const next=String(code||'').toUpperCase();
    const before=currentWarehouse();

    if(!next || next===before || busy){
      return originalSetGlobalWarehouse.apply(this,arguments);
    }

    const ctx=this, args=arguments;
    animateWarehouseChange(()=>originalSetGlobalWarehouse.apply(ctx,args));
  };
  wrapped.__yardivoWhTransitionPatched=true;
  wrapped.__yardivoOriginal=originalSetGlobalWarehouse;
  window.setGlobalWarehouse=wrapped;
  return true;
}

/* Native/fallback selector route: animate when code changes outside setter. */
function bindSelectors(){
  const ids=['globalWarehouse','ygcWarehouseSelect'];
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(!el || el.dataset.yardivoWhTransitionBound==='1')return;
    el.dataset.yardivoWhTransitionBound='1';

    el.addEventListener('change',e=>{
      const next=String(e.target.value||'').toUpperCase();
      const before=lastWarehouse||currentWarehouse();

      /* If canonical setter is patched, that path owns the animation. */
      if(window.setGlobalWarehouse?.__yardivoWhTransitionPatched)return;
      if(!next || next===before)return;

      const surface=mainSurface();
      if(!surface)return;
      restart(surface,'yardivo-wh-enter');
      pulseContext();
      lastWarehouse=next;
      setTimeout(()=>surface.classList.remove('yardivo-wh-enter'),235);
    },true);
  });
}

/* Observe warehouse changes caused by app logic/sync, so entrance animation still occurs. */
function watchWarehouse(){
  let observed=currentWarehouse();
  lastWarehouse=observed;

  setInterval(()=>{
    patchCanonicalSetter();
    bindSelectors();

    const now=currentWarehouse();
    if(now && observed && now!==observed && !busy){
      const surface=mainSurface();
      if(surface){
        restart(surface,'yardivo-wh-enter');
        pulseContext();
        setTimeout(()=>surface.classList.remove('yardivo-wh-enter'),235);
      }
    }
    if(now)observed=now;
  },450);
}

window.addEventListener('load',()=>{
  setTimeout(()=>{
    patchCanonicalSetter();
    bindSelectors();
    watchWarehouse();
  },700);
});

window.addEventListener('yardivo:login',()=>setTimeout(()=>{
  patchCanonicalSetter();
  bindSelectors();
  lastWarehouse=currentWarehouse();
},250));

window.YardivoWarehouseTransitionV583={
  refresh:function(){
    patchCanonicalSetter();
    bindSelectors();
    lastWarehouse=currentWarehouse();
  }
};
})();
