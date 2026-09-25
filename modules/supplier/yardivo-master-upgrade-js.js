
(function(){
'use strict';
const LS=window.safeStorage||localStorage;
const K={users:'yardivo_master_users_v1',font:'yardivo_master_font_v1',report:'yardivo_master_report_v1',sheets:'yardivo_master_sheets_v1',notes:'yardivo_master_notifications_v1'};
const ROLE_LABEL={admin:'Admin',inventory:'Upravljanje zalihama',reception:'Prijam',gate:'Porta',management:'Voditelj'};
const ROLE_VIEWS={
 admin:['homeMenu','dashboard','receiving','weeklyMap','dailyMap','settings','checkin','myYard','docks','trucks','suppliers','announcements','weeklyDeliveries','overview','incidents','incidentArchive','shipments','operations','reports','plannerPro','controltower','calendar','heatmap'],
 inventory:['homeMenu','dashboard','weeklyMap','dailyMap','myYard','announcements','supplierRequests','weeklyDeliveries','overview','suppliers','calendar','heatmap','controltower','controlTower','plannerPro','incidents','incidentArchive','documentArchive','reports','settings','unannounced','epal','orderSearch'],
 reception:['homeMenu','receiving','dailyMap','weeklyMap','suppliers','myYard','operations','incidents','incidentArchive','documentArchive','settings','unannounced','epal','liveYard'],
 gate:['homeMenu','checkin','unannounced','myYard','docks'],
 management:['homeMenu','dashboard','weeklyMap','dailyMap','myYard','supplierRequests','overview','reports','calendar','heatmap','controltower','suppliers','incidents','incidentArchive','documentArchive','settings']
};
function jget(k,d){try{return JSON.parse(LS.getItem(k)||'null')??d}catch(e){return d}}
function jset(k,v){try{LS.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
async function sha256(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function users(){return jget(K.users,[])} function saveUsers(v){jset(K.users,v)}
function can(view){return !window.currentSession||currentSession.role==='admin'||ROLE_VIEWS[currentSession.role]?.includes(view)}
window.roleLabel=function(r){return ROLE_LABEL[r]||r}; window.allowedViewsForRole=function(r){
  if(r==='admin')return [...new Set([
    'homeMenu',
    ...Array.from(document.querySelectorAll('.view[id]')).map(v=>v.id),
    ...Array.from(document.querySelectorAll('[data-view]')).map(v=>v.dataset.view).filter(Boolean),
    ...Array.from(document.querySelectorAll('[data-home-target]')).map(v=>v.dataset.homeTarget).filter(Boolean)
  ])];
  return ROLE_VIEWS[r]||[];
};

function addNavAndView(){
 const incidentBtn=document.querySelector('.nav-btn[data-view="incidents"]');
 if(incidentBtn&&!document.querySelector('.nav-btn[data-view="incidentArchive"]'))incidentBtn.insertAdjacentHTML('afterend','<button class="nav-btn" data-view="incidentArchive"><span>▧</span> Arhiva slika incidenata</button>');
 if(!document.getElementById('incidentArchive'))document.querySelector('.main')?.insertAdjacentHTML('beforeend',`<section id="incidentArchive" class="view"><div class="section-title"><div><h1>ARHIVA SLIKA INCIDENATA</h1><p>Fotodokazi povezani s incidentima</p></div></div><section class="panel"><div class="panel-head"><div><h2>FOTOGRAFIJE INCIDENATA</h2><small id="incidentArchiveCount">0 fotografija</small></div></div><div class="master-filterbar"><input id="iaDate" type="date"><select id="iaSupplier"><option value="">Svi dobavljači</option></select><select id="iaWarehouse"><option value="">Sva skladišta</option></select><select id="iaSeverity"><option value="">Sve ozbiljnosti</option><option>Niska</option><option>Srednja</option><option>Visoka</option><option>Kritična</option></select><button class="secondary" id="iaReset">RESET</button></div><div id="incidentGallery" class="incident-gallery"></div></section></section>`);
 document.querySelectorAll('[data-view="incidentArchive"]').forEach(b=>b.addEventListener('click',()=>setTimeout(renderArchive,0)));
 ['iaDate','iaSupplier','iaWarehouse','iaSeverity'].forEach(id=>document.getElementById(id)?.addEventListener('input',renderArchive)); document.getElementById('iaReset')?.addEventListener('click',()=>{['iaDate','iaSupplier','iaWarehouse','iaSeverity'].forEach(id=>document.getElementById(id).value='');renderArchive()});
}
function renderArchive(){const host=document.getElementById('incidentGallery');if(!host)return;let a=(typeof incidents!=='undefined'&&Array.isArray(incidents)?incidents:[]);const d=document.getElementById('iaDate')?.value,s=document.getElementById('iaSupplier')?.value,w=document.getElementById('iaWarehouse')?.value,v=document.getElementById('iaSeverity')?.value;a=a.filter(x=>x.photo&&(!d||x.date===d)&&(!s||x.supplier===s)&&(!w||x.warehouse===w)&&(!v||x.severity===v));const sup=document.getElementById('iaSupplier');if(sup&&sup.options.length<=1)[...new Set((typeof incidents!=='undefined'&&Array.isArray(incidents)?incidents:[]).map(x=>x.supplier).filter(Boolean))].sort().forEach(x=>sup.add(new Option(x,x)));document.getElementById('incidentArchiveCount').textContent=`${a.length} fotografija`;host.innerHTML=a.length?a.map(i=>`<article class="incident-photo-card" data-iid="${i.id}"><img src="${i.photo}" alt="Fotografija incidenta"><div class="body"><strong>${i.supplier||'—'}</strong>${i.date||'—'} · ${i.warehouse||'—'}<br>${i.type||'Incident'} · ${i.severity||'—'}<br>Status: ${i.status||'Otvoren'} · ${Number(i.value||0).toFixed(2)} €</div></article>`).join(''):'<div class="overview-empty">Nema fotografija za odabrane filtre.</div>';host.querySelectorAll('[data-iid]').forEach(c=>c.onclick=()=>{const i=(typeof incidents!=='undefined'&&Array.isArray(incidents)?incidents:[]).find(x=>String(x.id)===c.dataset.iid);if(i)alert(`${i.supplier}\n${i.date} · ${i.warehouse||'—'}\n${i.type} · ${i.severity}\nStatus: ${i.status||'Otvoren'}\nOdgovoran: ${i.owner||'—'}\nŠteta: ${Number(i.value||0).toFixed(2)} €\n\n${i.note||''}`)});}

function addSettings(){const grid=document.querySelector('#settings .settings-grid');if(!grid||document.getElementById('masterUserAdmin'))return;grid.insertAdjacentHTML('afterbegin',`<section class="panel" id="masterUserAdmin"><div class="panel-head"><div><h2>KORISNICI, ROLE I PERMISSIONS</h2><small>Admin kreira račune i dodjeljuje pristup</small></div></div><div class="master-settings-body"><div class="master-admin-grid"><div><div class="form-grid"><label>Ime i prezime<input id="muName"></label><label>Username<input id="muUser" autocomplete="off"></label><label>Privremena lozinka<input id="muPass" type="password" autocomplete="new-password"></label><label>Rola<select id="muRole"><option value="inventory">Upravljanje zalihama</option><option value="reception">Prijam</option><option value="gate">Porta</option><option value="manager">Voditelj</option><option value="admin">Admin</option></select></label><label>Lokacija<select id="muLocation"><option value="">Odaberi lokaciju...</option></select></label>
<label>SKLADIŠTA
  <div style="font-size:10px;color:#91a6b2;margin:0 0 6px">Odaberi lokaciju, zatim pojedina skladišta ili <b>SVA SKLADIŠTA</b>. Za Admina ili Voditelja možeš odabrati <b>Sve lokacije</b>.</div><div id="muWarehousePicker" style="margin-top:6px;padding:9px;border:1px solid #304958;border-radius:8px;background:#09131a;min-height:44px"></div>
</label>
<label>Status<select id="muStatus"><option value="active">Aktivan</option><option value="disabled">Deaktiviran</option></select></label></div><div class="master-perms" id="muPerms"></div><button class="primary" id="muSave" type="button" style="margin-top:10px">KREIRAJ KORISNIKA</button></div><div><div class="master-note">Rola određuje osnovni pristup. Individualne permissions mogu dodatno uključiti sekcije za konkretnog korisnika.</div><div id="masterUserList" style="margin-top:10px"></div></div></div></div></section>
<section class="panel" id="yardivoFontSettings" data-yardivo-settings="inventory reception"><div class="panel-head"><div><h2>VELIČINA TEKSTA U POLJIMA I TABLICAMA</h2><small>Postavka ostaje spremljena na uređaju</small></div></div><div class="master-settings-body"><div style="display:flex;align-items:center;gap:8px"><button class="secondary" id="fontMinus">A−</button><input id="fontRange" type="range" min="80" max="150" step="5" style="flex:1"><button class="secondary" id="fontPlus">A+</button><button class="secondary" id="fontReset">100%</button><strong id="fontPct">100%</strong></div><div class="font-demo">Primjer teksta u ćelijama i poljima</div></div></section>

<section class="panel"><div class="panel-head"><div><h2>GOOGLE SHEETS · CENTRALNA BAZA</h2><small>Apps Script Web App endpoint</small></div><span id="sheetState" class="master-sync-state warn">NIJE POVEZANO</span></div><div class="master-settings-body"><label>Apps Script Web App URL<input id="sheetUrl" placeholder="https://script.google.com/macros/s/.../exec"></label><div style="display:flex;gap:8px;margin-top:10px"><button class="primary" id="sheetSave" type="button">SPREMI POVEZNICU</button><button class="secondary" id="sheetTest" type="button">TEST VEZE</button><button class="secondary" id="sheetPush" type="button">SINKRONIZIRAJ SADA</button></div><div class="master-note" style="margin-top:10px">Sinkronizacija šalje najave, incidente i korisnike centralnom endpointu. Endpoint mora implementirati spremanje u Google Sheets i autorizaciju.</div></div></section>`);setupSettings();}
function setupSettings(){const perms=document.getElementById('muPerms');const views=['dashboard','overview','announcements','checkin','yard','docks','incidents','incidentArchive','documentArchive','reports','settings'];perms.innerHTML=views.map(v=>`<label><input type="checkbox" value="${v}">${v}</label>`).join('');document.getElementById('muSave').onclick=createUser;renderUsers();let fp=Number(LS.getItem(K.font)||100);applyFont(fp);document.getElementById('fontRange').value=fp;document.getElementById('fontMinus').onclick=()=>applyFont(Math.max(80,Number(LS.getItem(K.font)||100)-5));document.getElementById('fontPlus').onclick=()=>applyFont(Math.min(150,Number(LS.getItem(K.font)||100)+5));document.getElementById('fontReset').onclick=()=>applyFont(100);document.getElementById('fontRange').oninput=e=>applyFont(Number(e.target.value));const sh=jget(K.sheets,{url:''});document.getElementById('sheetUrl').value=sh.url||'';setSheetState(!!sh.url);document.getElementById('sheetSave').onclick=()=>{jset(K.sheets,{url:sheetUrl.value.trim()});setSheetState(!!sheetUrl.value.trim());toast('success','GOOGLE SHEETS','Poveznica je spremljena.')};document.getElementById('sheetTest').onclick=()=>sheetCall('ping');document.getElementById('sheetPush').onclick=()=>sheetCall('sync');}
function applyFont(p){
 p=Math.max(80,Math.min(150,Number(p)||100));
 LS.setItem(K.font,String(p));
 document.documentElement.style.setProperty('--yardivo-ui-scale',String(p/100));
 document.body.style.setProperty('--yardivo-cell-font',(10*p/100).toFixed(1)+'px');
 document.documentElement.dataset.yardivoFontScale=String(p);
 const r=document.getElementById('fontRange'),l=document.getElementById('fontPct');
 if(r)r.value=p;if(l)l.textContent=p+'%';
}

function yardivoInternalUserWarehouseRows(){
  const loc=String(document.getElementById('muLocation')?.value||'DU').toUpperCase();
  try{
    if(typeof yardivoLoadDynamicWarehousesIntoSystem==='function')yardivoLoadDynamicWarehousesIntoSystem();
    let codes=[];
    if(loc==='ALL'){
      codes=[...new Set([
        ...allWarehousesForLocation('DU'),
        ...allWarehousesForLocation('VG')
      ])].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
    }else{
      codes=allWarehousesForLocation(loc);
    }
    return codes.map(code=>{
      const w=(typeof WAREHOUSES!=='undefined'?WAREHOUSES?.[code]:null);
      const location=w?.location||'';
      return {code,name:w?.name||code,location};
    });
  }catch(e){}
  return []; // Production: Master Data is the only warehouse source.
}
function yardivoRenderInternalUserWarehousePicker(selected=[]){
  const host=document.getElementById('muWarehousePicker'); if(!host)return;
  const rows=yardivoInternalUserWarehouseRows();
  const selectedSet=new Set(Array.isArray(selected)?selected:[]);
  const loc=String(document.getElementById('muLocation')?.value||'DU').toUpperCase();
  const allText=loc==='ALL'?'SVA SKLADIŠTA':'SVA SKLADIŠTA LOKACIJE';
  host.innerHTML=
    '<label style="display:flex;flex-direction:row;align-items:center;gap:8px;margin-bottom:8px;font-weight:900">'+
      '<input id="muAllWarehouses" type="checkbox" style="width:auto"> '+allText+
    '</label>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:6px">'+
      rows.map(w=>'<label style="display:flex;flex-direction:row;align-items:center;gap:8px;padding:7px;border:1px solid #294252;border-radius:7px">'+
        '<input type="checkbox" name="muWarehouse" value="'+String(w.code).replace(/"/g,'&quot;')+'" style="width:auto" '+(selectedSet.has(w.code)?'checked':'')+'>'+
        '<span><strong>'+String(w.code)+'</strong><br><small>'+String(w.name||w.code)+(loc==='ALL'&&w.location?' · '+String(w.location):'')+'</small></span>'+
      '</label>').join('')+
    '</div>';
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
function yardivoSelectedInternalUserWarehouses(){
  return [...document.querySelectorAll('#muWarehousePicker input[name="muWarehouse"]:checked')].map(x=>x.value);
}

async function createUser(){if(String(currentSession?.role||'').toLowerCase()!=='admin'){toast('error','PRISTUP','Samo Admin može kreirati korisnike.');return}const username=muUser.value.trim().toLowerCase(),pass=muPass.value;if(!username||pass.length<4){toast('error','KORISNIK','Upiši username i lozinku od najmanje 4 znaka.');return}let a=users();if(a.some(x=>x.username===username)){toast('error','KORISNIK','Username već postoji.');return}a.push({id:Date.now(),name:muName.value.trim()||username,username,passwordHash:await sha256(pass),role:muRole.value,location:muLocation.value,warehouses:yardivoSelectedInternalUserWarehouses(),status:muStatus.value,permissions:[...document.querySelectorAll('#muPerms input:checked')].map(x=>x.value),createdAt:new Date().toISOString()});saveUsers(a);muName.value=muUser.value=muPass.value='';renderUsers();toast('success','KORISNIK','Novi korisnik je spremljen.')}
function renderUsers(){const h=document.getElementById('masterUserList');if(!h)return;const a=users();h.innerHTML='<div class="master-user-row"><strong>Korisnik</strong><strong>Rola</strong><strong>Lokacija</strong><strong>Status</strong><strong>Akcije</strong></div>'+a.map(u=>`<div class="master-user-row"><div><strong>${u.name}</strong><br><small>${u.username}</small></div><div>${ROLE_LABEL[u.role]||u.role}</div><div>${u.location}</div><div>${u.status==='active'?'AKTIVAN':'DEAKTIVIRAN'}</div><div><button class="action" data-toggle-user="${u.id}">${u.status==='active'?'DEAKT.':'AKTIV.'}</button> <button class="action danger" data-del-user="${u.id}">OBRIŠI</button></div></div>`).join('');h.querySelectorAll('[data-toggle-user]').forEach(b=>b.onclick=()=>{let a=users(),u=a.find(x=>x.id==b.dataset.toggleUser);if(u){u.status=u.status==='active'?'disabled':'active';saveUsers(a);renderUsers()}});h.querySelectorAll('[data-del-user]').forEach(b=>b.onclick=()=>{if(confirm('Obrisati korisnika?')){saveUsers(users().filter(x=>x.id!=b.dataset.delUser));renderUsers()}})}

function setSheetState(ok){const e=document.getElementById('sheetState');if(!e)return;e.className='master-sync-state '+(ok?'ok':'warn');e.textContent=ok?'KONFIGURIRANO':'NIJE POVEZANO'}
async function sheetCall(action){const url=(document.getElementById('sheetUrl')?.value||jget(K.sheets,{url:''}).url||'').trim();if(!url){toast('error','GOOGLE SHEETS','Prvo upiši Apps Script Web App URL.');return}try{const payload={action,source:'YARDIVO',timestamp:new Date().toISOString(),data:action==='sync'?{announcements:(Array.isArray(announcements)?announcements:[]),incidents:(Array.isArray(incidents)?incidents:[]),users:users()}:undefined};const res=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});if(!res.ok)throw new Error('HTTP '+res.status);setSheetState(true);toast('success','GOOGLE SHEETS',action==='sync'?'Podaci su poslani na centralni endpoint.':'Veza s endpointom radi.')}catch(e){toast('error','GOOGLE SHEETS','Veza nije uspjela: '+e.message)}}
function toast(type,title,msg){if(typeof showYmsToast==='function')showYmsToast(type,title,msg,4500);else alert(title+'\n'+msg)}

function patchRoles(){const old=window.applyRoleAccess;window.applyRoleAccess=function(){if(old)try{old()}catch(e){}if(!currentSession)return;let allowed=currentSession.role==='admin'
  ? [...new Set([
      'homeMenu',
      ...Array.from(document.querySelectorAll('.view[id]')).map(v=>v.id),
      ...Array.from(document.querySelectorAll('[data-view]')).map(v=>v.dataset.view).filter(Boolean),
      ...Array.from(document.querySelectorAll('[data-home-target]')).map(v=>v.dataset.homeTarget).filter(Boolean)
    ])]
  : [...(ROLE_VIEWS[currentSession.role]||[])];const u=users().find(x=>x.username===currentSession.user);if(u?.permissions)allowed=[...new Set([...allowed,...u.permissions])];document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('role-hidden',!allowed.includes(b.dataset.view)));document.querySelectorAll('[data-home-target]').forEach(c=>c.style.display=allowed.includes(c.dataset.homeTarget)?'block':'none');const form=document.getElementById('incidentForm');if(form){const _r=String(currentSession.role||'').toLowerCase();const canCreate=_r==='admin'||_r==='reception'||_r==='prijam';form.querySelectorAll('input,select,textarea,button').forEach(x=>x.disabled=!canCreate);form.style.opacity=canCreate?'1':'.55'}const admin=document.getElementById('masterUserAdmin');if(admin)admin.style.display=String(currentSession.role||'').toLowerCase()==='admin'?'block':'none';};}
async function customLogin(){const user=document.getElementById('loginUser')?.value.trim().toLowerCase()||'',pass=document.getElementById('loginPass')?.value||'',err=document.getElementById('loginError');let rec=users().find(x=>x.username===user);let ok=false,role='admin',location=null;if(rec){ok=rec.status==='active'&&rec.passwordHash===await sha256(pass);role=rec.role;location=rec.location}if(!ok){if(err){err.textContent='Pogrešno korisničko ime/lozinka ili je račun deaktiviran.';err.style.color='#ff9ba0'}return}currentSession={user,role,location,loginAt:new Date().toISOString(),rememberMe:!!document.getElementById('rememberMe')?.checked};try{window.currentSession=currentSession}catch(e){};try{safeSessionStorage.setItem('studenac_demo_session',JSON.stringify(currentSession));if(currentSession.rememberMe)LS.setItem('yardivo_remembered_session',JSON.stringify(currentSession))}catch(e){}if(typeof enterApp==='function')enterApp();}
function patchLogin(){const role=document.getElementById('loginRole');if(role){role.closest('label')?.classList.add('login-role-hidden');role.disabled=true}const note=document.querySelector('.login-note');if(note)note.textContent='PRIJAVA — upiši korisničko ime, lozinku i odaberi rolu koju ti je dodijelio Admin.';}
function incidentNotifications(){let last=Number(LS.getItem('yardivo_last_incident_notice')||0);const arr=(Array.isArray(incidents)?incidents:[]).filter(i=>Number(i.id)>last);if(!arr.length)return;let notes=jget(K.notes,[]);arr.forEach(i=>notes.unshift({id:'inc-'+i.id,type:'incident',title:`Novi incident · ${i.severity}`,text:`${i.supplier} · ${i.type}`,roles:['admin','inventory','reception'],incidentId:i.id,createdAt:new Date().toISOString()}));jset(K.notes,notes.slice(0,200));LS.setItem('yardivo_last_incident_notice',String(Math.max(...arr.map(i=>Number(i.id)))));}
function init(){addNavAndView();addSettings();patchRoles();patchLogin();applyFont(Number(LS.getItem(K.font)||100));try{applyRoleAccess()}catch(e){}renderArchive();setInterval(incidentNotifications,1500);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
