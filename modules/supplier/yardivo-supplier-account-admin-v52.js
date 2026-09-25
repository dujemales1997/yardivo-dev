
(function(){
'use strict';
const isAdmin=()=>{try{return String((typeof currentSession!=='undefined'?currentSession?.role:'')||window.currentSession?.role||'').toLowerCase().trim()==='admin'}catch(e){return false}};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function slug(v){
  return String(v||'dobavljac').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]+/g,'.').replace(/^\.+|\.+$/g,'').slice(0,32)||'dobavljac';
}
function supplierNames(){
  const set=new Set();
  try{(Array.isArray(suppliers)?suppliers:[]).forEach(x=>x&&set.add(String(x).trim()))}catch(e){}
  try{(Array.isArray(announcements)?announcements:[]).forEach(x=>x?.supplier&&set.add(String(x.supplier).trim()))}catch(e){}
  try{(Array.isArray(incidents)?incidents:[]).forEach(x=>x?.supplier&&set.add(String(x.supplier).trim()))}catch(e){}
  return [...set].filter(Boolean).sort((a,b)=>a.localeCompare(b,'hr'));
}
async function invoke(payload){
  const c=await window.YardivoAuth.client();
  const {data,error}=await c.functions.invoke('yardivo-admin-users',{body:{action:'create',...payload}});
  if(error){
    let detail='';
    try{
      if(error.context){
        const cloned=error.context.clone?.()||error.context;
        const body=await cloned.json();
        detail=body?.error||body?.message||JSON.stringify(body);
      }
    }catch(_){
      try{detail=await error.context?.text?.()}catch(__){}
    }
    throw new Error(detail||error.message||'Edge Function error');
  }
  if(data?.error)throw new Error(data.error);
  if(data?.ok===false)throw new Error(data?.message||'Kreiranje nije uspjelo.');
  return data?.data??data;
}
function ensure(){
  const panel=document.getElementById('masterUserAdmin');
  if(!panel)return;
  let btn=document.getElementById('yardivoSupplierAccountBtn');
  if(!btn){
    const save=document.getElementById('muSave');
    btn=document.createElement('button');
    btn.type='button'; btn.id='yardivoSupplierAccountBtn'; btn.className='primary';
    btn.textContent='NAPRAVI ACCOUNT DOBAVLJAČU';
    (save?.parentElement||panel).appendChild(btn);
    btn.onclick=open;
  }
  btn.style.display='none'; // legacy supplier modal disabled; unified V5.8.3 user creator is authoritative
  if(!document.getElementById('yardivoSupplierAccountModal')){
    document.body.insertAdjacentHTML('beforeend',`
    <div id="yardivoSupplierAccountModal" aria-hidden="true">
      <div class="ysa-card">
        <div class="ysa-head"><div><h2>NAPRAVI ACCOUNT DOBAVLJAČU</h2><small>Admin kreira zaseban Supplier račun vezan uz odabranog dobavljača.</small></div><button type="button" class="ysa-close" id="yardivoSupplierAccountClose">✕</button></div>
        <div class="ysa-body">
          <div class="ysa-grid">
            <label>DOBAVLJAČ<select id="ysaSupplier"><option value="">— Odaberi dobavljača —</option></select></label>
            <label>KORISNIČKO IME<input id="ysaUsername" autocomplete="off" placeholder="npr. arcadriatic · bez @yardivo.local"><small style="font-weight:700;color:#6f8999">Login će biti username@yardivo.local</small></label>
            <label>PRIVREMENA LOZINKA<input id="ysaPassword" type="password" autocomplete="new-password" placeholder="Najmanje 6 znakova"></label>
            <label>KONTAKT OSOBA<input id="ysaContactName" autocomplete="off"></label>
            <label>KONTAKT E-MAIL<input id="ysaContactEmail" type="email" autocomplete="off"></label>
            <label>TELEFON · OPCIONALNO<input id="ysaContactPhone" type="tel" autocomplete="off"></label>
            <label>LOKACIJA<select id="ysaLocation"><option value="">— Master Data —</option></select></label>
            <div style="grid-column:1/-1">
              <label>SKLADIŠTA DOSTUPNA DOBAVLJAČU</label>
              <div id="ysaWarehousePicker" style="margin-top:7px;padding:10px;border:1px solid #304958;border-radius:8px;background:#09131a"></div>
            </div>
          </div>
          <div class="ysa-note">Rola se automatski postavlja na <strong>supplier</strong>. Auth račun koristi interni login <strong>username@yardivo.local</strong>; kontakt e-mail ostaje poslovni kontakt dobavljača.</div>
          <div class="ysa-actions"><button type="button" id="yardivoSupplierAccountCancel">ODUSTANI</button><button type="button" id="yardivoSupplierAccountSave">SPREMI ACCOUNT DOBAVLJAČA</button></div>
        </div>
      </div>
    </div>`);
    document.getElementById('yardivoSupplierAccountClose').onclick=close;
    document.getElementById('yardivoSupplierAccountCancel').onclick=close;
    document.getElementById('yardivoSupplierAccountModal').addEventListener('click',e=>{if(e.target.id==='yardivoSupplierAccountModal')close()});
    document.getElementById('ysaSupplier').addEventListener('change',e=>{
      const u=document.getElementById('ysaUsername');
      if(!u.dataset.manual)u.value=slug(e.target.value);
    });
    document.getElementById('ysaUsername').addEventListener('input',e=>e.target.dataset.manual='1');
    document.getElementById('ysaLocation').addEventListener('change',yardivoRenderSupplierWarehousePicker);
    document.getElementById('yardivoSupplierAccountSave').onclick=save;
  }
}

function yardivoSupplierWarehouseRows(){
  let m={locations:[],warehouses:[]};
  try{m=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')||m}catch(e){}
  const loc=String(document.getElementById('ysaLocation')?.value||'').trim();
  const locations=Array.isArray(m.locations)?m.locations:[];
  const warehouses=Array.isArray(m.warehouses)?m.warehouses:[];
  const locMap=new Map(locations.filter(x=>x&&x.active!==false).map(x=>[String(x.id),String(x.name||'').trim()]));
  return warehouses.filter(w=>w&&w.active!==false&&locMap.has(String(w.location_id))&&(!loc||loc==='ALL'||String(w.location_id)===loc)).map(w=>({code:String(w.id),name:String(w.name||'').trim()||'Skladište',location:locMap.get(String(w.location_id))||''}));
}
function yardivoRenderSupplierWarehousePicker(){
  const host=document.getElementById('ysaWarehousePicker'); if(!host)return;
  const rows=yardivoSupplierWarehouseRows();
  const loc=String(document.getElementById('ysaLocation')?.value||'');
  let locName='ODABERI LOKACIJU'; try{const m=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}'); locName=loc==='ALL'?'SVA SKLADIŠTA':String((m.locations||[]).find(x=>String(x.id)===loc)?.name||locName)}catch(e){};
  host.innerHTML='<div style="margin-bottom:8px;font-size:10px;font-weight:950;color:#d8e7ef">SKLADIŠTA · '+locName+'</div>'+
    '<label style="display:flex;flex-direction:row;align-items:center;gap:8px;margin-bottom:9px"><input id="ysaAllWarehouses" type="checkbox" style="width:auto"> OZNAČI SVA SKLADIŠTA</label>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:7px">'+
    rows.map(w=>'<label style="display:flex;flex-direction:row;align-items:center;gap:8px;padding:8px;border:1px solid #294252;border-radius:7px"><input type="checkbox" name="ysaWarehouse" value="'+esc(w.code)+'" style="width:auto"><span><strong>'+esc(w.code)+'</strong><br><small>'+esc(w.name||'')+(loc==='ALL'&&w.location?' · '+esc(w.location):'')+'</small></span></label>').join('')+
    '</div>';
  const all=host.querySelector('#ysaAllWarehouses');
  all.onclick=()=>host.querySelectorAll('input[name="ysaWarehouse"]').forEach(x=>x.checked=all.checked);
}
function yardivoSelectedSupplierWarehouses(){
  return [...document.querySelectorAll('#ysaWarehousePicker input[name="ysaWarehouse"]:checked')].map(x=>x.value);
}

function open(){
  if(!isAdmin())return;
  ensure();
  const s=document.getElementById('ysaSupplier');
  s.innerHTML='<option value="">— Odaberi dobavljača —</option>'+supplierNames().map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  ['ysaUsername','ysaPassword','ysaContactName','ysaContactEmail','ysaContactPhone'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('ysaUsername').dataset.manual='';
  document.getElementById('ysaLocation').value='DU';
  yardivoRenderSupplierWarehousePicker();
  const m=document.getElementById('yardivoSupplierAccountModal');m.classList.add('open');m.setAttribute('aria-hidden','false');
}
function close(){
  const m=document.getElementById('yardivoSupplierAccountModal');if(m){m.classList.remove('open');m.setAttribute('aria-hidden','true')}
}
async function save(){
  if(!isAdmin())return alert('Samo Admin može kreirati Supplier račun.');
  const supplier_name=document.getElementById('ysaSupplier').value.trim();
  const rawUsername=document.getElementById('ysaUsername').value.trim().toLowerCase();
  const username=rawUsername.replace(/@yardivo\.local$/i,'').replace(/@.*$/,'').trim();
  document.getElementById('ysaUsername').value=username;
  const password=document.getElementById('ysaPassword').value;
  const contact_name=document.getElementById('ysaContactName').value.trim();
  const contact_email=document.getElementById('ysaContactEmail').value.trim();
  const contact_phone=document.getElementById('ysaContactPhone').value.trim();
  const location=document.getElementById('ysaLocation').value;
  const warehouses=yardivoSelectedSupplierWarehouses();
  if(!supplier_name)return alert('Odaberi dobavljača.');
  if(!warehouses.length)return alert('Odaberi barem jedno skladište za korisnika.');
  if(!username)return alert('Upiši korisničko ime.');
  if(password.length<8)return alert('Privremena lozinka mora imati najmanje 8 znakova.');
  if(!warehouses.length)return alert('Odaberi barem jedno skladište za dobavljača.');
  if(!contact_name)return alert('Upiši kontakt osobu.');
  if(!contact_email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email))return alert('Upiši ispravan kontakt e-mail.');
  const b=document.getElementById('yardivoSupplierAccountSave');b.disabled=true;b.textContent='SPREMANJE…';
  try{
    await invoke({username,password,role:'supplier',location,warehouses,supplier_name,contact_name,contact_email,contact_phone});
    close();
    try{await window.YardivoUserAdmin?.render?.()}catch(e){}
    try{showYmsToast?.('success','DOBAVLJAČ','Supplier account je uspješno kreiran.')}catch(e){alert('Supplier account je uspješno kreiran.')}
  }catch(e){console.error('YARDIVO Supplier create',e);alert('Kreiranje Supplier accounta nije uspjelo:\n'+(e?.message||e))}
  finally{b.disabled=false;b.textContent='SPREMI ACCOUNT DOBAVLJAČA'}
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(ensure,700));
window.addEventListener('load',()=>setTimeout(ensure,1100));
window.addEventListener('yardivo:login',()=>setTimeout(ensure,100));
document.addEventListener('click',e=>{if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]'))setTimeout(ensure,100)},true);
/* stability: admin ensure is load/login/click driven */
})();
