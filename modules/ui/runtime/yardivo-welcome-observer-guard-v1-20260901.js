(function(){
'use strict';
/*
  Startup guard: legacy modules create many MutationObservers. During the 5.2 s
  Welcome phase their callbacks are deferred so none of them can create a
  microtask loop that starves the Welcome progress timer.
*/
const NativeMO=window.MutationObserver;
if(!NativeMO || window.__YARDIVO_WELCOME_MO_GUARD__)return;

const guarded=new Set();

class YardivoGuardedMutationObserver extends NativeMO{
  constructor(callback){
    let selfRef=null;
    super((records,observer)=>{
      const self=selfRef;
      if(document.documentElement.classList.contains('yardivo-booting')){
        if(self){
          self.__yardivoPending=true;
          self.__yardivoRecords=records;
          guarded.add(self);
        }
        return;
      }
      if(self){
        self.__yardivoRecords=(self.__yardivoRecords||[]).concat(records||[]);
        if(self.__yardivoRaf)return;
        self.__yardivoRaf=requestAnimationFrame(()=>{
          self.__yardivoRaf=0;
          const batch=self.__yardivoRecords||[];
          self.__yardivoRecords=[];
          try{callback(batch,observer)}catch(e){console.error(e)}
        });
        return;
      }
      callback(records,observer);
    });
    selfRef=this;
    this.__yardivoCallback=callback;
    this.__yardivoPending=false;
    this.__yardivoRecords=[];
  }
  disconnect(){
    guarded.delete(this);
    this.__yardivoPending=false;
    this.__yardivoRecords=[];
    return super.disconnect();
  }
}

window.MutationObserver=YardivoGuardedMutationObserver;
window.__YARDIVO_WELCOME_MO_GUARD__={
  native:NativeMO,
  flush(){
    const pending=Array.from(guarded);
    guarded.clear();
    pending.forEach(obs=>{
      if(!obs.__yardivoPending)return;
      obs.__yardivoPending=false;
      const records=obs.__yardivoRecords||[];
      obs.__yardivoRecords=[];
      try{obs.__yardivoCallback(records,obs)}catch(e){console.error(e)}
    });
  }
};

window.addEventListener('yardivo:welcome-complete',()=>{
  try{
    const g=window.__YARDIVO_WELCOME_MO_GUARD__;
    /* stability hard-fix: keep coalescing MutationObserver wrapper active */
  }catch(_){}
},{once:true});
})();
