(function(){
  'use strict';
  window.__YARDIVO_BUILD__='20260908-dev-v5.8.3-scanner-theme-ui-final';
  const nativeFetch=window.fetch?.bind(window);
  if(nativeFetch){
    window.fetch=function(input,init){
      const u=String(typeof input==='string'?input:(input?.url||''));
      if(u.includes('/rest/v1/rpc/yardivo_put_state')){
        console.warn('[YARDIVO] blocked obsolete state RPC');
        return Promise.resolve(new Response('0',{status:200,headers:{'Content-Type':'application/json'}}));
      }
      if(u.includes('/rest/v1/yardivo_app_state') && /key=eq(?:\.|%2E)studenac(?:_|%5F)yms(?:_|%5F)/i.test(u)){
        console.warn('[YARDIVO] blocked obsolete legacy state read');
        return Promise.resolve(new Response('[]',{status:200,headers:{'Content-Type':'application/json'}}));
      }
      return nativeFetch(input,init);
    };
  }
  try{
    for(const k of ['yardivo_supabase_offline_queue_v1','yardivo_supabase_offline_queue_v2',
                    'yardivo_supabase_sync_meta_v1','yardivo_supabase_sync_meta_v2']) localStorage.removeItem(k);
  }catch(_){}
  window.addEventListener('DOMContentLoaded',()=>{
    const old=document.getElementById('yardivoSyncErrorBox'); if(old) old.remove();
    const badge=document.createElement('div');
    badge.id='yardivoBuildBadge';
    badge.textContent='YARDIVO DEV · BUILD V5.8.3';
    badge.title='20260908-dev-v5.8.3-scanner-theme-ui-final';
    badge.style.cssText='position:fixed;right:8px;bottom:8px;z-index:2147483646;font:700 10px/1.2 system-ui;padding:5px 7px;border-radius:6px;background:#0d1b29;color:#94a9b9;border:1px solid #26435a;opacity:.72;pointer-events:none';
    document.body.appendChild(badge);
  },{once:true});
})();

window.addEventListener('load',()=>{
  try{
    yardivoLoadDynamicWarehousesIntoSystem();
    setTimeout(()=>yardivoRefreshAllWarehouseUi(),250);
  }catch(e){}
});
window.addEventListener('yardivo:login',()=>{
  try{
    yardivoLoadDynamicWarehousesIntoSystem();
    setTimeout(()=>yardivoRefreshAllWarehouseUi(),250);
  }catch(e){}
});
