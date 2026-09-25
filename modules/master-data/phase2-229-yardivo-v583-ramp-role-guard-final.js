
(function(){
'use strict';
if(window.__YARDIVO_RAMP_ROLE_GUARD_FINAL__)return;window.__YARDIVO_RAMP_ROLE_GUARD_FINAL__=true;
const MASTER='yardivo_master_data_registry_v583';
function read(){try{return JSON.parse(localStorage.getItem(MASTER)||'{}')}catch(_){return{}}}
function role(){let r='';try{r=String(document.body?.dataset?.yardivoRole||document.documentElement?.dataset?.yardivoRole||window.currentSession?.app_role||window.currentSession?.role||'').trim().toLowerCase()}catch(_){}if(r==='voditelj')r='manager';return r}
function can(){return role()==='admin'||role()==='manager'}
function activeWh(){const d=read(),ws=Array.isArray(d.warehouses)?d.warehouses:[];let id='';try{id=String(window.YardivoAppStateV583?.warehouse?.()||window.activeWarehouse||'')}catch(_){}return ws.find(w=>String(w.id)===id)||ws.find(w=>w.active!==false)||null}
function toggle(id,n){if(!can())return;const api=window.YardivoStableMasterV583;if(api?.master&&typeof api.render==='function'){
 const d=api.master(),w=(d.warehouses||[]).find(x=>String(x.id)===String(id));if(!w)return;w.ramp_settings=Array.isArray(w.ramp_settings)?w.ramp_settings:[];let rr=w.ramp_settings.find(x=>Number(x.number)===Number(n));if(!rr){rr={number:Number(n),name:'Rampa '+n,active:true,from:'',to:'',pallets_per_hour:null,max_pallets:null};w.ramp_settings.push(rr)}rr.active=rr.active===false;try{localStorage.setItem(MASTER,JSON.stringify(d));window.YardivoMasterDataV583?.save?.(JSON.parse(JSON.stringify(d)));window.YardivoSupabase?.flushQueue?.();window.dispatchEvent(new CustomEvent('yardivo:master-data-changed',{detail:{source:'ramp-role-guard',reason:'ramp.toggle'}}));}catch(_){}render();api.render(false);}}
function host(){const docks=document.getElementById('docks');if(!docks)return null;let h=document.getElementById('yardivoRampRoleControlV583');if(!h){h=document.createElement('section');h.id='yardivoRampRoleControlV583';const anchor=docks.querySelector('#rampQueueGrid')||docks.firstElementChild;anchor?.parentNode?.insertBefore(h,anchor)||docks.prepend(h)}return h}
function render(){const h=host();if(!h)return;const w=activeWh();if(!w){h.innerHTML='<div class="yrr-head"><h3>UPRAVLJANJE RAMPAMA</h3><small>Nema aktivnog skladišta</small></div>';return}const rows=Array.isArray(w.ramp_settings)?w.ramp_settings:[];h.innerHTML=`<div class="yrr-head"><h3>UPRAVLJANJE RAMPAMA — ${String(w.name||'')}</h3><small>${can()?'ADMIN / VODITELJ':'PREGLED'}</small></div>${rows.length?rows.map(r=>`<div class="yrr-row"><strong>${String(r.name||('Rampa '+r.number))}</strong><span class="yrr-state">${r.active===false?'OFF':'ON'}</span>${can()?`<button class="${r.active===false?'turn-on':'turn-off'}" data-yrr-toggle="${String(w.id)}:${Number(r.number)}">${r.active===false?'TURN ON':'TURN OFF'}</button>`:'<span class="yrr-denied">Samo Admin / Voditelj</span>'}</div>`).join(''):'<div class="yrr-denied">Za ovo skladište još nema kreiranih rampi.</div>'}`}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-yrr-toggle]');if(b){e.preventDefault();if(!can())return;const [id,n]=b.dataset.yrrToggle.split(':');toggle(id,Number(n));return}if(e.target.closest?.('[data-view="docks"],[data-home-target="docks"]'))setTimeout(render,30)},true);
['yardivo:master-data-changed','yardivo:context-changed','yardivo:login'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(render,20)));
document.addEventListener('DOMContentLoaded',()=>setTimeout(render,100));window.addEventListener('load',()=>setTimeout(render,250),{once:true});
window.YardivoRampRoleGuardV583={render,canManage:can};
})();
