
(function(){
'use strict';
if(window.__YARDIVO_MASTER_ADMIN_SETTINGS_V583__)return;
window.__YARDIVO_MASTER_ADMIN_SETTINGS_V583__=true;

const MASTER_KEY='yardivo_master_data_registry_v583';
const CAPACITY_KEY='yardivo_capacity_config_v1';
const RECEPTION_HOURS_KEY='yardivo_reception_master_hours_v1';
const RAMP_HOURS_KEY='yardivo_ramp_hours_v583';
const RAMP_RATE_KEY='yardivo_ramp_capacity_v1';
let active='master';

function getJson(k,fallback={}){
  try{const x=JSON.parse(localStorage.getItem(k)||'null');return x&&typeof x==='object'?x:fallback}catch(_){return fallback}
}
function setJson(k,v){
  localStorage.setItem(k,JSON.stringify(v));
  try{window.YardivoSupabase?.flush?.()}catch(_){}
}
function master(){
  try{
    const d=JSON.parse(localStorage.getItem(MASTER_KEY)||'{}');
    if(Array.isArray(d.suppliers)&&Array.isArray(d.locations)&&Array.isArray(d.warehouses))return d;
  }catch(_){}
  return {suppliers:[],locations:[],warehouses:[]};
}
function whName(w,d=master()){
  const loc=d.locations.find(x=>String(x.id)===String(w.location_id));
  return {name:String(w.name||w.id),location:String(loc?.name||w.location_id||'')};
}
function warehouseCapacity(code){
  return Number(getJson(CAPACITY_KEY)?.[code]?.warehousePallets||0);
}
function receptionHours(code){
  const h=getJson(RECEPTION_HOURS_KEY)?.[code];
  return {from:String(h?.from||'06:00'),to:String(h?.to||'22:00')};
}
function rampRate(code,r){
  return Number(getJson(RAMP_RATE_KEY)?.[code]?.[String(r)]||0);
}
function rampHours(code,r){
  const own=getJson(RAMP_HOURS_KEY)?.[code]?.[String(r)];
  if(own?.from&&own?.to)return {from:String(own.from),to:String(own.to)};
  return receptionHours(code);
}
function rampTotalCapacity(code,r){
  return Number(getJson(CAPACITY_KEY)?.[code]?.ramps?.[String(r)]||0);
}

function ensureShell(){
  const settings=document.getElementById('settings');if(!settings)return null;
  let nav=document.getElementById('yardivoMasterAdminSettingsV583');
  if(!nav){
    nav=document.createElement('div');
    nav.id='yardivoMasterAdminSettingsV583';
    nav.innerHTML='<button type="button" data-yma-tab="master">MASTER PODACI</button><button type="button" data-yma-tab="admin">ADMINISTRACIJA</button>';
    const title=settings.querySelector('.section-title');
    if(title)title.insertAdjacentElement('afterend',nav);else settings.prepend(nav);
  }
  let masterPane=document.getElementById('yardivoSettingsMasterPaneV583');
  let adminPane=document.getElementById('yardivoSettingsAdminPaneV583');
  if(!masterPane){
    masterPane=document.createElement('div');masterPane.id='yardivoSettingsMasterPaneV583';
    nav.insertAdjacentElement('afterend',masterPane);
  }
  if(!adminPane){
    adminPane=document.createElement('div');adminPane.id='yardivoSettingsAdminPaneV583';
    masterPane.insertAdjacentElement('afterend',adminPane);
  }

  /* Move canonical MASTER registry into MASTER pane. Its existing code continues to own CRUD. */
  const md=document.getElementById('yardivoMasterDataRegistryV583');
  if(md&&md.parentElement!==masterPane)masterPane.appendChild(md);

  /* All remaining settings panels belong to Administration, except superseded capacity/ramp owners. */
  const directCandidates=[...settings.children].filter(el=>
    el!==nav&&el!==masterPane&&el!==adminPane&&
    !el.classList.contains('section-title')&&
    el.id!=='yardivoSettingsChooseV583'&&
    el.id!=='yardivoSettingsTabsFinal'
  );
  directCandidates.forEach(el=>adminPane.appendChild(el));

  /* Nested authoritative panels: preserve admin tools but suppress duplicate master controls. */
  settings.querySelectorAll('#adminCapacitySettings,#receptionRampSettings').forEach(el=>el.style.setProperty('display','none','important'));
  return {settings,nav,masterPane,adminPane};
}

function renderOps(){
  const shell=ensureShell();if(!shell)return;
  let host=document.getElementById('yardivoMasterOperationalConfigV583');
  if(!host){
    host=document.createElement('section');
    host.id='yardivoMasterOperationalConfigV583';
    host.className='ymd-master-ops';
    shell.masterPane.appendChild(host);
  }
  const d=master(),warehouses=d.warehouses.filter(x=>x&&x.active!==false);
  host.innerHTML=`<div class="ymd-master-ops-head">
    <div><h3>OPERATIVNI PARAMETRI SKLADIŠTA</h3>
    <p>Kapacitet paleta, radno vrijeme prijama i parametri rampi. MASTER PODACI su jedini UI owner ovih vrijednosti.</p></div>
  </div>`+(warehouses.length?`<div class="ymd-ops-grid">${warehouses.map(w=>{
    const meta=whName(w,d),ramps=Math.max(0,Number(w.ramps)||0),hours=receptionHours(w.id),cap=warehouseCapacity(w.id);
    return `<article class="ymd-ops-wh" data-yma-wh="${w.id}">
      <div class="ymd-ops-wh-head">
        <div><strong>${meta.name}</strong><small>${meta.location} · ${w.id}</small></div>
        <span class="ymd-ops-badge">${ramps} RAMPI</span>
      </div>
      <div class="ymd-ops-fields">
        <label class="full">KAPACITET SKLADIŠTA · PALETE
          <input type="number" min="0" step="1" data-yma-wh-cap="${w.id}" value="${cap}">
        </label>
        <label>RADNO VRIJEME PRIJAMA · OD
          <input type="time" data-yma-wh-from="${w.id}" value="${hours.from}">
        </label>
        <label>RADNO VRIJEME PRIJAMA · DO
          <input type="time" data-yma-wh-to="${w.id}" value="${hours.to}">
        </label>
      </div>
      <button type="button" class="ymd-ops-save" data-yma-wh-save="${w.id}">SPREMI SKLADIŠTE</button>
      <div class="ymd-ramp-list"><h4>RAMPE · RADNO VRIJEME I KAPACITET</h4>
        ${ramps?Array.from({length:ramps},(_,i)=>i+1).map(r=>{
          const h=rampHours(w.id,r),rate=rampRate(w.id,r),total=rampTotalCapacity(w.id,r);
          return `<div class="ymd-ramp-row" data-yma-ramp="${w.id}:${r}">
            <div class="ymd-ramp-name">RAMPA ${r}</div>
            <label>OD<input type="time" data-yma-ramp-from="${w.id}:${r}" value="${h.from}"></label>
            <label>DO<input type="time" data-yma-ramp-to="${w.id}:${r}" value="${h.to}"></label>
            <label>PALETA / SAT<input type="number" min="0" step="1" data-yma-ramp-rate="${w.id}:${r}" value="${rate}"></label>
            <label>MAX PALETA<input type="number" min="0" step="1" data-yma-ramp-total="${w.id}:${r}" value="${total}"></label>
            <button type="button" class="ymd-ramp-save" data-yma-ramp-save="${w.id}:${r}">SPREMI PROMJENE RAMPE ${r}</button>
          </div>`;
        }).join(''):'<div class="ymd-ops-empty">Nema rampi. Broj rampi prvo postavi u MASTER PODACI → SKLADIŠTA.</div>'}
      </div>
    </article>`;
  }).join('')}</div>`:'<div class="ymd-ops-empty">Nema skladišta. Dodaj lokaciju i skladište pa će se ovdje pojaviti kapacitet i radno vrijeme.</div>');
}

function saveWarehouse(code){
  const cap=Math.max(0,Math.floor(Number(document.querySelector(`[data-yma-wh-cap="${code}"]`)?.value||0)));
  const from=document.querySelector(`[data-yma-wh-from="${code}"]`)?.value||'';
  const to=document.querySelector(`[data-yma-wh-to="${code}"]`)?.value||'';
  if(!from||!to||from>=to)return alert('Radno vrijeme: DO mora biti nakon OD.');

  const capacity=getJson(CAPACITY_KEY);capacity[code]=capacity[code]||{ramps:{}};
  capacity[code].warehousePallets=cap;capacity[code].ramps=capacity[code].ramps||{};setJson(CAPACITY_KEY,capacity);
  const hours=getJson(RECEPTION_HOURS_KEY);hours[code]={from,to};setJson(RECEPTION_HOURS_KEY,hours);

  try{
    window.YARDIVO_CAPACITY=capacity;
    if(typeof WAREHOUSES!=='undefined'&&WAREHOUSES?.[code]){
      WAREHOUSES[code].receptionStart=from;WAREHOUSES[code].receptionEnd=to;
    }
  }catch(_){}
  try{showYmsToast?.('success','MASTER PODACI SPREMLJENI',`${code} · ${cap} paleta · ${from}–${to}`)}catch(_){}
  refreshDependent();
}
function saveRamp(pair){
  const [code,rRaw]=String(pair).split(':'),r=String(Number(rRaw));
  const from=document.querySelector(`[data-yma-ramp-from="${code}:${r}"]`)?.value||'';
  const to=document.querySelector(`[data-yma-ramp-to="${code}:${r}"]`)?.value||'';
  const rate=Math.max(0,Math.floor(Number(document.querySelector(`[data-yma-ramp-rate="${code}:${r}"]`)?.value||0)));
  const total=Math.max(0,Math.floor(Number(document.querySelector(`[data-yma-ramp-total="${code}:${r}"]`)?.value||0)));
  if(!from||!to||from>=to)return alert('Radno vrijeme rampe: DO mora biti nakon OD.');

  const hours=getJson(RAMP_HOURS_KEY);hours[code]=hours[code]||{};hours[code][r]={from,to};setJson(RAMP_HOURS_KEY,hours);
  const rates=getJson(RAMP_RATE_KEY);rates[code]=rates[code]||{};rates[code][r]=rate;setJson(RAMP_RATE_KEY,rates);
  const capacity=getJson(CAPACITY_KEY);capacity[code]=capacity[code]||{warehousePallets:0,ramps:{}};capacity[code].ramps=capacity[code].ramps||{};capacity[code].ramps[r]=total;setJson(CAPACITY_KEY,capacity);

  try{window.YARDIVO_CAPACITY=capacity;window.YardivoRampHoursV583?.set?.(code,Number(r),from,to)}catch(_){}
  try{showYmsToast?.('success',`RAMPA ${r} SPREMLJENA`,`${rate} paleta/sat · max ${total} paleta · ${from}–${to}`)}catch(_){}
  refreshDependent();
}
function refreshDependent(){
  ['renderDashboardSimple','renderWarehouseCards','renderRampe','renderDockOverview','renderDailyMap','renderWeeklyMap','renderOverview','render']
    .forEach(fn=>{try{if(typeof window[fn]==='function')window[fn]()}catch(_){}});
}
function show(tab){
  active=tab==='admin'?'admin':'master';
  const shell=ensureShell();if(!shell)return;
  shell.masterPane.classList.toggle('active',active==='master');
  shell.adminPane.classList.toggle('active',active==='admin');
  shell.nav.querySelectorAll('[data-yma-tab]').forEach(b=>b.classList.toggle('active',b.dataset.ymaTab===active));
  const choose=document.getElementById('yardivoSettingsChooseV583');if(choose)choose.hidden=true;
  if(active==='master'){
    try{window.YardivoMasterDataV583?.refresh?.()}catch(_){}
    setTimeout(()=>{ensureShell();renderOps()},0);
  }
}

document.addEventListener('click',e=>{
  const tab=e.target.closest?.('[data-yma-tab]');
  if(tab){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();show(tab.dataset.ymaTab);return}
  const wh=e.target.closest?.('[data-yma-wh-save]');
  if(wh){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();saveWarehouse(wh.dataset.ymaWhSave);return}
  const ramp=e.target.closest?.('[data-yma-ramp-save]');
  if(ramp){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();saveRamp(ramp.dataset.ymaRampSave);return}
  if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]')){
    setTimeout(()=>show(active),30);
  }
},true);

window.addEventListener('yardivo:master-data-changed',()=>setTimeout(()=>{ensureShell();renderOps()},20));
window.addEventListener('yardivo:login',()=>setTimeout(()=>show('master'),120));
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>show('master'),180));
window.addEventListener('load',()=>setTimeout(()=>show('master'),450),{once:true});

window.YardivoSettingsMasterAdminV583={show,refresh:()=>{ensureShell();renderOps()},active:()=>active};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-master-data-admin-settings';
})();
