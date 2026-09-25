(function(){'use strict';
const K='yardivo_auto_replan_cfg_v1',D={enabled:false,mode:'PAUSED',lateThreshold:20,horizonMinutes:240,maxShiftMinutes:240,scanSeconds:30,palletsPerHour:33,gapWeight:1.15};
function cfg(){try{return {...D,...JSON.parse(localStorage.getItem(K)||'{}')}}catch(_){return {...D}}}
function masterSmart(){
  try{
    const m=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')||{};
    return {...{enabled:false,mode:'PAUSED'},...(m.smart||{})};
  }catch(_){return {enabled:false,mode:'PAUSED'}}
}
async function togglePower(){
  if(window.YardivoSmartSupplierAccountsFixV583?.toggleSmart){
    await window.YardivoSmartSupplierAccountsFixV583.toggleSmart();
  }else{
    let m={};try{m=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')||{}}catch(_){}
    const st={...{enabled:false,mode:'PAUSED'},...(m.smart||{})},on=!!st.enabled&&st.mode!=='PAUSED';
    m.smart={...st,enabled:!on,mode:!on?'ASSIST':'PAUSED'};
    m.__masterUpdatedAtV583=new Date().toISOString();
    localStorage.setItem('yardivo_master_data_registry_v583',JSON.stringify(m));
    try{await window.YardivoMasterDataV583?.save?.(m)}catch(_){}
  }
  const st=masterSmart(),c=cfg();
  c.enabled=!!st.enabled;c.mode=st.mode||'PAUSED';
  localStorage.setItem(K,JSON.stringify(c));
  try{if(typeof putCloudState==='function')await Promise.resolve(putCloudState(K,JSON.stringify(c)))}catch(_){}
  try{window.YardivoSmartReplanning?.applyState?.()}catch(_){}
  render();
}
function save(c){
 const st=masterSmart();c.enabled=!!st.enabled;c.mode=st.mode||'PAUSED';
 localStorage.setItem(K,JSON.stringify(c));
 try{if(typeof putCloudState==='function')putCloudState(K,JSON.stringify(c))}catch(_){}
 try{window.YardivoSmartReplanning?.applyState?.()}catch(_){}
 render()
}
function inject(){const p=document.getElementById('yardivoSmartEngineSettingsV583');if(p)p.remove();}
})();
