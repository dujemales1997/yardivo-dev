
(function(){
'use strict';
if(window.__YARDIVO_MASTER_WAREHOUSE_RAMPCOUNT_NO_LEGACY_V583__)return;
window.__YARDIVO_MASTER_WAREHOUSE_RAMPCOUNT_NO_LEGACY_V583__=true;

const KEY='yardivo_master_data_registry_v583';
const RAMP_KEY='yardivo_ramp_config_v1';

function load(){
  try{
    const raw=localStorage.getItem(KEY);
    const d=raw?JSON.parse(raw):null;
    if(d&&Array.isArray(d.locations)&&Array.isArray(d.warehouses))return d;
  }catch(_){}
  try{return window.YardivoMasterDataV583?.all?.()||{locations:[],warehouses:[]}}catch(_){}
  return {locations:[],warehouses:[]};
}
function save(d){
  try{localStorage.setItem(KEY,JSON.stringify(d))}catch(_){}
  try{window.YardivoMasterDataV583?.save?.(d)}catch(_){}
  try{window.YardivoSupabase?.syncNow?.()}catch(_){}
  window.dispatchEvent(new CustomEvent('yardivo:master-data-changed'));
}
function rampCfg(){
  try{return JSON.parse(localStorage.getItem(RAMP_KEY)||'{}')||{}}catch(_){return{}}
}
function saveRampCfg(d){
  try{localStorage.setItem(RAMP_KEY,JSON.stringify(d))}catch(_){}
}
function setWarehouseRampCount(id,n){
  const d=load();
  const w=d.warehouses.find(x=>x.id===id);
  if(!w)throw new Error('Skladište ne postoji.');
  n=Math.max(0,Math.min(50,Number(n)||0));
  w.ramps=n;
  save(d);

  const rc=rampCfg();
  rc[id]=rc[id]||{count:0,locked:[]};
  rc[id].count=n;
  rc[id].locked=Array.isArray(rc[id].locked)?rc[id].locked.map(Number).filter(x=>x>=1&&x<=n):[];
  saveRampCfg(rc);

  try{window.YardivoUnifiedRampsV583?.refresh?.()}catch(_){}
  try{window.YardivoLocationStateV583?.refresh?.()}catch(_){}
  return n;
}
function renameWarehouse(id,name){
  const d=load(),w=d.warehouses.find(x=>x.id===id);
  if(!w)return;
  const n=String(name||'').trim();
  if(!n)throw new Error('Upiši naziv skladišta.');
  w.name=n;
  save(d);
}
function moveWarehouse(id,locationId){
  const d=load(),w=d.warehouses.find(x=>x.id===id);
  if(!w)return;
  if(!d.locations.some(x=>x.id===locationId))throw new Error('Lokacija ne postoji.');
  w.location_id=locationId;
  save(d);
}
function deleteWarehouse(id){
  const d=load();
  d.warehouses=d.warehouses.filter(x=>x.id!==id);
  save(d);
  const rc=rampCfg(); delete rc[id]; saveRampCfg(rc);
  try{window.YardivoUnifiedRampsV583?.refresh?.()}catch(_){}
}
function locName(id,d=load()){return d.locations.find(x=>x.id===id)?.name||id}

/* Rebuild ONLY the warehouse section inside Master Data.
   The warehouse ID is technical and intentionally not shown to the user. */
function renderMasterWarehouses(){
  const root=document.getElementById('yardivoMasterDataRegistryV583');
  if(!root)return;
  const d=load();

  let host=document.getElementById('ymdWarehouseList');
  if(!host)return;

  if(!d.warehouses.length){
    host.innerHTML='<div class="yur-empty">NEMA SKLADIŠTA. Dodaj skladište kada budeš spreman za test.</div>';
    return;
  }

  host.innerHTML=d.warehouses.map(w=>`
    <div class="ymd-wh-row" data-wh-id="${w.id}">
      <label>Naziv skladišta
        <input type="text" class="ymd-wh-name" value="${String(w.name||'').replace(/"/g,'&quot;')}">
      </label>
      <label>Lokacija
        <select class="ymd-wh-location">
          ${d.locations.filter(x=>x.active!==false).map(l=>`<option value="${l.id}" ${l.id===w.location_id?'selected':''}>${l.name}</option>`).join('')}
        </select>
      </label>
      <label>Broj rampi
        <input type="number" class="ymd-wh-ramp-count" min="0" max="50" step="1" value="${Math.max(0,Number(w.ramps)||0)}">
      </label>
      <div class="ymd-wh-actions">
        <button type="button" class="mini-btn ymd-wh-save">SPREMI</button>
        <button type="button" class="mini-btn danger ymd-wh-delete">OBRIŠI</button>
      </div>
    </div>
  `).join('');

  host.querySelectorAll('.ymd-wh-row').forEach(row=>{
    const id=row.dataset.whId;
    row.querySelector('.ymd-wh-save')?.addEventListener('click',()=>{
      try{
        renameWarehouse(id,row.querySelector('.ymd-wh-name')?.value);
        moveWarehouse(id,row.querySelector('.ymd-wh-location')?.value);
        setWarehouseRampCount(id,row.querySelector('.ymd-wh-ramp-count')?.value);
        renderMasterWarehouses();
        try{showYmsToast?.('success','SKLADIŠTE AŽURIRANO','Naziv, lokacija i broj rampi su spremljeni.')}catch(_){}
      }catch(e){alert(e?.message||e)}
    });
    row.querySelector('.ymd-wh-delete')?.addEventListener('click',()=>{
      if(!confirm('Obrisati ovo skladište?'))return;
      deleteWarehouse(id);
      renderMasterWarehouses();
    });
  });
}

/* Ramp settings:
   Count is MASTER DATA owned. Hide add/remove-ramp buttons, but keep per-ramp ON/OFF and details. */
function enforceRampSettingsOwnership(){
  const add=document.getElementById('addRampBtn');
  const rem=document.getElementById('removeRampBtn');
  if(add){add.style.display='none';add.disabled=true}
  if(rem){rem.style.display='none';rem.disabled=true}

  const panel=document.getElementById('receptionRampSettings');
  if(panel){
    const note=panel.querySelector('.yur-note');
    if(note){
      note.textContent='Broj rampi određuje se u MASTER PODACI → SKLADIŠTA. Ovdje upravljaš samo statusom rampe (UKLJUČENA / ISKLJUČENA), kapacitetom i radnim vremenom.';
    }
  }
}

/* Never expose technical warehouse codes W001/W101/W201 in visible Settings labels.
   Show only custom master-data names. */
function hideLegacyWarehouseCodes(){
  const d=load();
  const byId=new Map(d.warehouses.map(w=>[String(w.id),w.name]));

  document.querySelectorAll('#settings option, #settings label, #settings span, #settings small, #settings div, #settings button').forEach(el=>{
    if(el.children.length && !el.matches('option'))return;
    let t=String(el.textContent||'');
    if(!t)return;

    // Replace current dynamic IDs with custom names.
    for(const [id,name] of byId){
      if(t===id)t=name;
      else if(t.startsWith(id+' '))t=t.replace(id,name);
      else if(t.includes('('+id+')'))t=t.replace('('+id+')','');
    }

    // Remove legacy-only codes if they survived old static settings HTML.
    t=t.replace(/\bW(?:101|103|104|201|202|203|204)\b/g,'').replace(/\s{2,}/g,' ').trim();
    if(el.textContent!==t)el.textContent=t;
  });

  document.querySelectorAll('#settings select').forEach(sel=>{
    [...sel.options].forEach(o=>{
      const id=String(o.value||'');
      if(byId.has(id))o.textContent=byId.get(id);
      if(/^(W101|W103|W104|W201|W202|W203|W204)$/i.test(id) && !byId.has(id)){
        o.remove();
      }
    });
  });
}

/* Neutralize old hard-coded warehouse objects when settings are rendered.
   No visible fallback W101/W201. */
function syncRuntimeWarehouseMap(){
  const d=load();
  try{
    if(typeof WAREHOUSES==='object'&&WAREHOUSES){
      Object.keys(WAREHOUSES).forEach(k=>delete WAREHOUSES[k]);
      d.warehouses.filter(x=>x.active!==false).forEach(w=>{
        WAREHOUSES[w.id]={
          code:w.id,
          name:w.name,
          location:locName(w.location_id,d),
          location_id:w.location_id,
          ramps:Math.max(0,Number(w.ramps)||0),
          receptionStart:'06:00',
          receptionEnd:'13:00'
        };
      });
    }
  }catch(_){}
  try{
    if(typeof WH_NAMES==='object'&&WH_NAMES){
      Object.keys(WH_NAMES).forEach(k=>delete WH_NAMES[k]);
      d.warehouses.filter(x=>x.active!==false).forEach(w=>WH_NAMES[w.id]=w.name);
    }
  }catch(_){}
}

function masterWarehouseEditActive(){
  return !!document.activeElement?.closest?.('#ymdWarehouseList');
}
function refresh(options){
  const preserveEdit=options?.preserveEdit!==false;
  syncRuntimeWarehouseMap();
  if(!(preserveEdit&&masterWarehouseEditActive()))renderMasterWarehouses();
  enforceRampSettingsOwnership();
  hideLegacyWarehouseCodes();
}
window.addEventListener('yardivo:master-data-changed',()=>setTimeout(()=>refresh({preserveEdit:false}),30));
window.addEventListener('yardivo:data-synced',()=>setTimeout(()=>refresh({preserveEdit:true}),100));
window.addEventListener('yardivo:login',()=>setTimeout(refresh,150));
document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,160));
window.addEventListener('load',()=>setTimeout(refresh,350));

document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"],#settings')){
    setTimeout(refresh,50);
  }
},true);

/* QA V5.8.3: no whole-document observer. Settings refreshes on explicit
   navigation and Master/Data events only, preventing edit-field flicker. */
refresh({preserveEdit:false});

window.YardivoMasterWarehouseRampsV583={
  refresh,
  setRampCount:setWarehouseRampCount
};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-master-warehouse-ramps-no-legacy-codes';
})();
