
(function(){
'use strict';
window.YARDIVO_DEV_BUILD='20260908-dev-v5.8.3-stability-login-theme-fix';
/* Keep expensive refresh work away from the exact minute boundary. */
let lastMinuteGuard=0;
window.addEventListener('yardivo:data-synced',()=>{ lastMinuteGuard=performance.now(); },{passive:true});
/* Freeze diagnostics: records long main-thread tasks without mutating app DOM. */
try{
  if('PerformanceObserver' in window){
    const po=new PerformanceObserver(list=>{
      for(const e of list.getEntries()){
        if(e.duration>=120){
          window.__YARDIVO_LONG_TASKS__=window.__YARDIVO_LONG_TASKS__||[];
          window.__YARDIVO_LONG_TASKS__.push({at:Date.now(),duration:Math.round(e.duration)});
          if(window.__YARDIVO_LONG_TASKS__.length>40)window.__YARDIVO_LONG_TASKS__.shift();
        }
      }
    });
    po.observe({entryTypes:['longtask']});
  }
}catch(_){ }
})();
