
(function(){
'use strict';
if(window.__YARDIVO_WAREHOUSE_MASTER_RAMPS_HEADER_REPAIR_V583__)return;
window.__YARDIVO_WAREHOUSE_MASTER_RAMPS_HEADER_REPAIR_V583__=true;
const MASTER='yardivo_master_data_registry_v583';
function normRole(v){let r=String(v||'').trim().toLowerCase();if(r==='management'||r==='voditelj')r='manager';if(r==='zalihe'||r==='upravljanje zalihama')r='inventory';if(r==='prijam')r='reception';if(r==='porta'||r==='portir')r='gate';return r}
function role(){try{return normRole(window.currentSession?.role||window.currentSession?.app_role||currentSession?.role||currentSession?.app_role)}catch(_){return''}}
function master(){try{const x=window.YardivoStableMasterV583?.master?.();if(x)return x}catch(_){}try{return JSON.parse(localStorage.getItem(MASTER)||'{}')}catch(_){return{locations:[],warehouses:[]}}}
function whName(id,d=master()){const w=(d.warehouses||[]).find(x=>x&&String(x.id)===String(id));return String(w?.name||'Skladište')}
function locName(id,d=master()){const x=(d.locations||[]).find(v=>v&&String(v.id)===String(id));return String(x?.name||'Lokacija')}
function currentWarehouse(){return String(document.getElementById('globalWarehouse')?.value||window.YardivoAppStateV583?.warehouse?.()||window.activeWarehouse||'').trim()}
function canManage(){return ['admin','manager'].includes(role())}
function cleanSettings(){
 const nav=document.getElementById('yardivoMasterAdminSettingsV583');
 if(nav){const m=nav.querySelector('[data-yma-tab="master"]'),a=nav.querySelector('[data-yma-tab="admin"]');if(m)m.textContent='MASTER PODACI & SKLADIŠTA';if(a)a.textContent='ADMINISTRACIJA';}
 document.getElementById('yardivoMasterOperationalConfigV583')?.setAttribute('aria-hidden','true');
 document.getElementById('yardivoMasterFoundationV583')?.setAttribute('aria-hidden','true');
}
function renderDockManager(){
 const docks=document.getElementById('docks');if(!docks)return;
 let host=document.getElementById('yardivoDockRampManagementV583');
 if(!host){host=document.createElement('section');host.id='yardivoDockRampManagementV583';const title=docks.querySelector('.section-title');(title||docks.firstElementChild)?.insertAdjacentElement(title?'afterend':'beforebegin',host)}
 const d=master(),id=currentWarehouse(),w=(d.warehouses||[]).find(x=>x&&x.active!==false&&String(x.id)===id);
 if(!w){host.innerHTML='<div class="ydrm-head"><div><h3>UPRAVLJANJE RAMPAMA</h3><small>Odaberi skladište u headeru.</small></div></div>';return}
 const n=Math.max(0,Number(w.ramps)||0),rows=Array.isArray(w.ramp_settings)?w.ramp_settings:[];
 host.innerHTML=`<div class="ydrm-head"><div><h3>UPRAVLJANJE RAMPAMA · ${whName(id,d)}</h3><small>${locName(w.location_id,d)} · ON/OFF stanje se sprema u Master Data i odmah vrijedi u cijelom YARDIVO-u.</small></div><span class="ydrm-badge">${n} ${n===1?'RAMPA':'RAMPI'}</span></div>`+
  (n?`<div class="ydrm-grid">${Array.from({length:n},(_,i)=>i+1).map(r=>{const row=rows.find(x=>Number(x?.number)===r)||{name:`Rampa ${r}`,active:true};const on=row.active!==false;return `<div class="ydrm-row ${on?'':'off'}"><div class="ydrm-name"><strong>${String(row.name||`Rampa ${r}`).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}</strong><small>Rampa ${r}</small></div><div class="ydrm-actions"><span class="ydrm-state ${on?'on':'off'}">${on?'ON':'OFF'}</span>${canManage()?`<button type="button" class="ydrm-toggle ${on?'turn-off':'turn-on'}" data-ydrm-toggle="${id}:${r}">${on?'TURN OFF':'TURN ON'}</button>`:'<small>Samo Admin / Voditelj</small>'}</div></div>`}).join('')}</div>`:'<div class="ysm-empty">Nema definiranih rampi. Dodaj ih u Postavke → MASTER PODACI & SKLADIŠTA.</div>');
}
function cleanHeader(){
 const d=master(),sel=document.getElementById('globalWarehouse');if(!sel)return;
 const id=String(sel.value||'');
 if(id&&id!=='ALL'&&!((d.warehouses||[]).some(w=>w&&w.active!==false&&String(w.id)===id))){try{window.yardivoRefreshAllWarehouseUi?.()}catch(_){}}
 const info=document.getElementById('globalWarehouseInfo');if(info){const w=(d.warehouses||[]).find(x=>x&&String(x.id)===String(sel.value));info.textContent=w?`${locName(w.location_id,d)} · ${whName(w.id,d)}`:'ODABERI SKLADIŠTE'}
}
function refresh(){cleanSettings();cleanHeader();renderDockManager()}
document.addEventListener('click',e=>{
 const t=e.target.closest?.('[data-ydrm-toggle]');if(t){e.preventDefault();e.stopImmediatePropagation();if(!canManage())return;const [id,r]=String(t.dataset.ydrmToggle||'').split(':');window.YardivoStableMasterV583?.toggleRampActive?.(id,Number(r));setTimeout(()=>{renderDockManager();try{renderRampe?.()}catch(_){}},20);return}
 if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]'))setTimeout(()=>{cleanSettings();window.YardivoSettingsMasterAdminV583?.show?.('master');window.YardivoStableMasterV583?.render?.(true)},60);
 if(e.target.closest?.('[data-view="docks"],[data-home-target="docks"]'))setTimeout(refresh,40);
},true);
document.getElementById('globalWarehouse')?.addEventListener('change',()=>setTimeout(refresh,10),true);
window.addEventListener('yardivo:master-data-changed',()=>setTimeout(refresh,30));
window.addEventListener('yardivo:context-changed',()=>setTimeout(refresh,30));
window.addEventListener('yardivo:login',()=>setTimeout(refresh,120));
document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,180));
window.addEventListener('load',()=>setTimeout(refresh,500),{once:true});
window.YardivoWarehouseMasterRepairV583={refresh,renderDockManager};
window.YARDIVO_DEV_BUILD='20260914-dev-v5.8.3-warehouse-master-ramps-header-repair-final';
})();
