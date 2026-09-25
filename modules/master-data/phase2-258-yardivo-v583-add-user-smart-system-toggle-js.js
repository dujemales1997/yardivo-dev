
(()=>{'use strict';
const $=id=>document.getElementById(id), MASTER='yardivo_master_data_registry_v583';
function master(){try{return JSON.parse(localStorage.getItem(MASTER)||'{}')||{}}catch(_){return{}}}
function smartOn(){const s=master().smart||{};return !!s.enabled&&String(s.mode||'').toUpperCase()!=='PAUSED'}
function applySmart(){
 const on=smartOn();document.body.classList.toggle('yardivo-smart-system-off-v583',!on);
 const b=$('yardivoUnifiedSmartDbSwitchV583');if(b){b.textContent=on?'ON':'OFF';b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))}
 /* Hide/show SMART navigation entries without touching the Settings parameter panel. */
 document.querySelectorAll('[data-view="smart"],[data-target="smart"],[data-home-target="smart"],a[href="#smart"],button[data-page="smart"]').forEach(x=>{x.hidden=!on;x.style.setProperty('display',on?'':'none',on?'':'important')});
 window.dispatchEvent(new CustomEvent('yardivo:smart-system-state',{detail:{enabled:on}}));
}
function accounts(){
 const host=$('yardivoUnifiedSettingsV583');if(!host)return;
 let wrap=$('yardivoAccountAdminRestoredV583');
 if(!wrap){wrap=document.createElement('section');wrap.id='yardivoAccountAdminRestoredV583';wrap.className='yv-unified-card';
 wrap.innerHTML='<div class="yv-unified-row"><div><h3>KORISNIČKI RAČUNI</h3><p>Dodavanje i upravljanje YARDIVO korisnicima. Lista se učitava sa Supabase servera.</p></div></div><div class="yv-account-actions"><button type="button" class="btn btn-primary" id="yardivoAddUserRestoredBtnV583">+ DODAJ KORISNIKA</button></div><div id="yardivoExistingAccountHostV583"></div>';
 host.appendChild(wrap)}
 else if(wrap.parentElement!==host)host.appendChild(wrap);
 const existing=$('yardivoSettingsAdminPaneV583'),eh=$('yardivoExistingAccountHostV583');
 if(existing&&eh&&existing.parentElement!==eh){existing.hidden=false;existing.style.setProperty('display','block','important');eh.appendChild(existing)}
}
function openExistingCreate(){
 const candidates=[
 '#yardivoSettingsAdminPaneV583 button[data-action="create"]',
 '#yardivoSettingsAdminPaneV583 button[id*="AddUser"]',
 '#yardivoSettingsAdminPaneV583 button[id*="CreateUser"]',
 '#yardivoSettingsAdminPaneV583 button[id*="addUser"]',
 '#yardivoSettingsAdminPaneV583 button[id*="createUser"]'
 ];
 for(const q of candidates){const b=document.querySelector(q);if(b&&b.id!=='yardivoAddUserRestoredBtnV583'){b.click();return true}}
 const pane=$('yardivoSettingsAdminPaneV583');
 if(pane){const b=[...pane.querySelectorAll('button')].find(x=>/DODAJ.*KORIS|NOVI.*KORIS|CREATE.*USER/i.test(x.textContent||''));if(b){b.click();return true}}
 return false
}
document.addEventListener('click',e=>{
 if(e.target?.closest?.('#yardivoAddUserRestoredBtnV583')){e.preventDefault();if(!openExistingCreate())alert('Forma za dodavanje korisnika još nije inicijalizirana. Pričekaj sinkronizaciju i pokušaj ponovno.')}
},true);
['yardivo:login','yardivo:data-synced','yardivo:master-data-ready','yardivo:master-data-changed'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{accounts();applySmart()},60)));
window.addEventListener('yardivo:smart-system-state',()=>{},false);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{accounts();applySmart()},1700),{once:true});else setTimeout(()=>{accounts();applySmart()},900);
window.YardivoAccountSmartSystemV583={accounts,applySmart};
window.YARDIVO_DEV_BUILD='20260917-dev-v5.8.3-add-user-smart-system-toggle-final';
})();
