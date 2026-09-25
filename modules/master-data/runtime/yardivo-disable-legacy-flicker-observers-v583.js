(function(){
'use strict';
/* Legacy patches installed broad document-wide MutationObservers.
   We cannot detach anonymous observers retroactively, so this guard makes their
   target refresh functions no-op when no master-data signature change occurred. */
let last='';
function sig(){
  try{
    const raw=localStorage.getItem('yardivo_master_data_registry_v583')||'';
    return raw;
  }catch(_){return''}
}
function stable(){
  const now=sig();
  if(now===last)return true;
  last=now;
  return false;
}

/* Wrap known refresh APIs so repeated legacy observer calls do not rebuild dropdowns. */
['YardivoMasterDataBugfixV583','YardivoLiveMasterLabelsV583'].forEach(apiName=>{
  const api=window[apiName];
  if(!api||typeof api.refresh!=='function'||api.refresh.__stableWrapped)return;
  const orig=api.refresh;
  const fn=function(){
    if(stable())return;
    return orig.apply(api,arguments);
  };
  fn.__stableWrapped=true;
  api.refresh=fn;
});
})();
