
(()=>{'use strict';
const $=id=>document.getElementById(id), MASTER='yardivo_master_data_registry_v583';
function master(){try{return JSON.parse(localStorage.getItem(MASTER)||'{}')||{}}catch(_){return{}}}
function smartState(){const m=master();return {...{enabled:false,mode:'PAUSED'},...(m.smart||{})}}
function saveMaster(m){
 localStorage.setItem(MASTER,JSON.stringify(m));
 try{if(typeof putCloudState==='function')return Promise.resolve(putCloudState(MASTER,JSON.stringify(m)))}catch(e){return Promise.reject(e)}
 try{return Promise.resolve(window.YardivoMasterDataV583?.save?.(m))}catch(e){return Promise.reject(e)}
 return Promise.resolve()
}
function ensureSmart(host){
 const detailed=$('yardivoSmartEngineSettingsV583');
 const old=$('yardivoUnifiedSmartDbCardV583');if(old)old.remove();
 if(detailed){try{window.YardivoSmartEngineSettingsV583?.render?.()}catch(_){};return}
 let c=$('yardivoUnifiedSmartDbCardV583');
 if(!c){c=document.createElement('section');c.id='yardivoUnifiedSmartDbCardV583';c.className='yv-unified-card';
 c.innerHTML='<div class="yv-unified-row"><div><h3>YARDIVO SMART</h3><p>Glavni SMART status sinkronizira se kroz canonical Master podatke u Supabase.</p></div><button type="button" class="yv-unified-switch" id="yardivoUnifiedSmartDbSwitchV583">OFF</button></div>';host.appendChild(c)}
 const st=smartState(),on=!!st.enabled&&st.mode!=='PAUSED',b=$('yardivoUnifiedSmartDbSwitchV583');if(b){b.textContent=on?'ON':'OFF';b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))}
}
async function toggleSmart(){
 const m=master(),st={...{enabled:false,mode:'PAUSED'},...(m.smart||{})},on=!!st.enabled&&st.mode!=='PAUSED';
 m.smart={...st,enabled:!on,mode:!on?'ASSIST':'PAUSED'};m.__masterUpdatedAtV583=new Date().toISOString();
 try{await saveMaster(m);window.dispatchEvent(new CustomEvent('yardivo:master-data-changed',{detail:{reason:'smart.toggle'}}))}
 catch(e){console.error(e);alert('YARDIVO SMART nije spremljen u bazu.');return}
 ensureSmart($('yardivoUnifiedSettingsV583'));
}
function ensure(){
 const host=$('yardivoUnifiedSettingsV583');if(!host)return;
 const supplier=$('yardivoMasterSuppliersV583');if(supplier){supplier.hidden=false;supplier.style.setProperty('display','block','important');if(supplier.parentElement!==host)host.appendChild(supplier)}
 const accounts=$('yardivoSettingsAdminPaneV583');if(accounts){accounts.hidden=false;accounts.style.setProperty('display','block','important');if(accounts.parentElement!==host)host.appendChild(accounts)}
 ensureSmart(host);
}
document.addEventListener('click',e=>{if(e.target?.closest?.('#yardivoUnifiedSmartDbSwitchV583')){e.preventDefault();toggleSmart()}},true);
['yardivo:login','yardivo:data-synced','yardivo:master-data-ready','yardivo:master-data-changed'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(ensure,50)));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(ensure,1600),{once:true});else setTimeout(ensure,800);
window.YardivoSmartSupplierAccountsFixV583={ensure,toggleSmart};
window.YARDIVO_DEV_BUILD='20260917-dev-v5.8.3-settings-smart-suppliers-accounts-fix-final';
})();
