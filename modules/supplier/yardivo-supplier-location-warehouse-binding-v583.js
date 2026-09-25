
(function(){
'use strict';
if(window.__YARDIVO_SUPPLIER_LOCATION_WAREHOUSE_BINDING_V583__)return;
window.__YARDIVO_SUPPLIER_LOCATION_WAREHOUSE_BINDING_V583__=true;

const KEY='yardivo_master_data_registry_v583';
let applying=false;
let originalServerCreate=null;

function normRole(v){
  v=String(v||'').trim().toLowerCase();
  if(v==='management'||v==='voditelj')return'manager';
  if(v==='porta'||v==='portir')return'gate';
  if(v==='prijam')return'reception';
  if(v==='zalihe'||v==='upravljanje zalihama')return'inventory';
  return v;
}
function master(){
  try{
    const raw=localStorage.getItem(KEY),d=raw?JSON.parse(raw):null;
    if(d&&Array.isArray(d.locations)&&Array.isArray(d.warehouses))return d;
  }catch(_){}
  try{return window.YardivoMasterDataV583?.all?.()||{locations:[],warehouses:[]}}catch(_){}
  return {locations:[],warehouses:[]};
}
function esc(v){
  return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function role(){
  return normRole(document.getElementById('muRole')?.value||'');
}
function location(){
  return String(document.getElementById('muLocation')?.value||'ALL');
}
function locationsForAccount(){
  return master().locations.filter(x=>x.active!==false);
}
function warehousesFor(loc){
  const d=master();
  return d.warehouses.filter(w=>w.active!==false && (loc==='ALL'||w.location_id===loc));
}
function locationLabel(id){
  if(id==='ALL')return'SVE LOKACIJE';
  const d=master();
  return d.locations.find(x=>x.id===id)?.name||id;
}
function warehouseLabel(w){
  const d=master(),l=d.locations.find(x=>x.id===w.location_id);
  return `${w.name}${l?.name?' · '+l.name:''}`;
}

/* Supplier must exist as a creatable application role. */
function ensureSupplierRole(){
  const sel=document.getElementById('muRole');if(!sel)return;
  const current=normRole(sel.value);
  if(![...sel.options].some(o=>normRole(o.value)==='supplier')){
    sel.add(new Option('Dobavljač','supplier'));
  }
  if(current==='supplier')sel.value='supplier';
}

/* Dynamic account-location selector:
   no DP/VG; names come directly from Master Data. */
function renderLocations(){
  const sel=document.getElementById('muLocation');if(!sel)return;
  const current=sel.value;
  const list=locationsForAccount();
  sel.innerHTML=
    '<option value="ALL">SVE LOKACIJE</option>'+
    list.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('');

  if([...sel.options].some(o=>o.value===current))sel.value=current;
  else if(list.length)sel.value=list[0].id;
  else sel.value='ALL';
}

/* Supplier = exactly one warehouse context.
   Other roles keep the existing multi-warehouse model, but it is rebuilt from dynamic Master Data. */
function renderWarehouses(selectedValue){
  const host=document.getElementById('muWarehousePicker');if(!host)return;
  const loc=location(),rows=warehousesFor(loc),r=role();

  if(r==='supplier'){
    if(!rows.length){
      host.innerHTML='<div class="ysab-empty">Za odabranu lokaciju nema skladišta. Prvo dodaj skladište u MASTER PODACI YARDIVO.</div>';
      return;
    }
    const current=selectedValue||host.querySelector('#muSupplierWarehouse')?.value||'';
    host.innerHTML=
      '<div class="ysab-select-wrap">'+
       '<small style="color:#8faabd;font-weight:900">ODABERI SKLADIŠTE ZA OVOG DOBAVLJAČA</small>'+
       '<select id="muSupplierWarehouse">'+
        '<option value="">Odaberi skladište...</option>'+
        rows.map(w=>`<option value="${esc(w.id)}">${esc(warehouseLabel(w))}</option>`).join('')+
       '</select>'+
      '</div>';
    const sel=host.querySelector('#muSupplierWarehouse');
    if([...sel.options].some(o=>o.value===current))sel.value=current;
    return;
  }

  const previous=new Set(
    [...host.querySelectorAll('input[name="muWarehouse"]:checked')].map(x=>x.value)
  );
  host.innerHTML=
    `<label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-weight:900;cursor:pointer">
      <input id="muAllWarehouses" type="checkbox" style="width:auto">
      ${loc==='ALL'?'SVA SKLADIŠTA':'SVA SKLADIŠTA LOKACIJE'}
    </label>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:6px">
      ${rows.map(w=>`
        <label style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid #294252;border-radius:7px;cursor:pointer">
          <input type="checkbox" name="muWarehouse" value="${esc(w.id)}" style="width:auto" ${previous.has(w.id)?'checked':''}>
          <span><strong>${esc(w.name)}</strong><br><small>${esc(locationLabel(w.location_id))}</small></span>
        </label>
      `).join('')}
    </div>`;
  const all=host.querySelector('#muAllWarehouses');
  const boxes=[...host.querySelectorAll('input[name="muWarehouse"]')];
  if(all){
    all.checked=boxes.length>0&&boxes.every(b=>b.checked);
    all.onchange=()=>boxes.forEach(b=>b.checked=all.checked);
  }
  boxes.forEach(b=>b.onchange=()=>{
    if(all)all.checked=boxes.length>0&&boxes.every(x=>x.checked);
  });
}
function selectedWarehouses(){
  if(role()==='supplier'){
    const v=document.getElementById('muSupplierWarehouse')?.value||'';
    return v?[v]:[];
  }
  return [...document.querySelectorAll('#muWarehousePicker input[name="muWarehouse"]:checked')].map(x=>x.value);
}

function refresh(){
  if(applying)return;
  applying=true;
  try{
    ensureSupplierRole();
    const locBefore=document.getElementById('muLocation')?.value||'';
    renderLocations();
    const locAfter=document.getElementById('muLocation')?.value||'';
    renderWarehouses(locBefore===locAfter?undefined:'');
  }finally{
    applying=false;
  }
}

/* Supplier server-create owner.
   Existing non-supplier create behavior remains untouched. */
function installCreateOwner(){
  const api=window.YardivoServerProfiles;
  if(!api||typeof api.create!=='function')return;
  if(api.create.__supplierBindingV583)return;
  originalServerCreate=api.create;

  const replacement=async function(){
    if(role()!=='supplier')return originalServerCreate.apply(api,arguments);

    let currentRole='';
    try{currentRole=normRole(window.currentSession?.role||currentSession?.role)}catch(_){}
    if(currentRole!=='admin'){
      alert('Samo Admin može kreirati Supplier account.');
      return;
    }

    const username=(document.getElementById('muUser')?.value||'').trim().toLowerCase();
    const password=document.getElementById('muPass')?.value||'';
    const loc=location();
    const warehouses=selectedWarehouses();

    if(!/^[a-z0-9._-]{3,40}$/.test(username)){
      alert('Username mora imati najmanje 3 znaka.');
      return;
    }
    if(password.length<8){
      alert('Password mora imati najmanje 8 znakova.');
      return;
    }
    if(!warehouses.length){
      alert('Odaberi skladište za ovog dobavljača.');
      return;
    }

    const w=master().warehouses.find(x=>x.id===warehouses[0]);
    if(!w){
      alert('Odabrano skladište više ne postoji u Master podacima.');
      refresh();
      return;
    }
    if(loc!=='ALL'&&w.location_id!==loc){
      alert('Odabrano skladište ne pripada odabranoj lokaciji.');
      refresh();
      return;
    }

    const btn=document.getElementById('muSave');
    try{
      if(btn){btn.disabled=true;btn.textContent='KREIRAM SUPPLIER ACCOUNT...'}
      const invoke=window.YardivoAdminUsersServerV583?.invoke;
      if(typeof invoke!=='function')throw new Error('Server user API nije dostupan.');

      await invoke('create',{
        username,
        password,
        role:'supplier',
        location:loc,
        warehouses:[w.id]
      });

      const u=document.getElementById('muUser');
      const p=document.getElementById('muPass');
      const n=document.getElementById('muName');
      if(u)u.value='';if(p)p.value='';if(n)n.value='';

      try{await window.YardivoServerProfiles?.render?.()}catch(_){}
      try{showYmsToast?.('success','SUPPLIER ACCOUNT KREIRAN',`${username} · ${locationLabel(loc)} · ${w.name}`)}catch(_){}
    }catch(e){
      alert('Kreiranje Supplier accounta nije uspjelo: '+(e?.message||e));
    }finally{
      if(btn){btn.disabled=false;btn.removeAttribute('disabled');btn.textContent='KREIRAJ KORISNIČKI PROFIL'}
    }
  };
  replacement.__supplierBindingV583=true;
  api.create=replacement;
}

/* Native local creator also reads these controls in older/offline flows. */
try{window.yardivoSelectedInternalUserWarehouses=selectedWarehouses}catch(_){}

document.addEventListener('change',e=>{
  if(e.target?.id==='muRole'){
    setTimeout(()=>{refresh();installCreateOwner()},0);
  }else if(e.target?.id==='muLocation'){
    setTimeout(()=>renderWarehouses(''),0);
  }
},true);

window.addEventListener('yardivo:master-data-changed',()=>setTimeout(refresh,20));
window.addEventListener('yardivo:data-synced',()=>setTimeout(()=>{refresh();installCreateOwner()},80));
window.addEventListener('yardivo:login',()=>setTimeout(()=>{refresh();installCreateOwner()},150));
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{refresh();installCreateOwner()},160));
window.addEventListener('load',()=>setTimeout(()=>{refresh();installCreateOwner()},350));

let timer=0;
new MutationObserver(()=>{
  clearTimeout(timer);
  timer=setTimeout(()=>{
    if(document.getElementById('masterUserAdmin')){
      refresh();
      installCreateOwner();
    }
  },70);
}).observe(document.documentElement,{childList:true,subtree:true});

refresh();
installCreateOwner();

window.YardivoSupplierAccountBindingV583={
  refresh,
  selectedWarehouses,
  warehousesFor,
  location:()=>location()
};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-supplier-location-warehouse-binding-fix';
})();
