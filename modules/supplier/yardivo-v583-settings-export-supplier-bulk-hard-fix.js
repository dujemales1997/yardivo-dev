
(function(){
'use strict';
if(window.__YARDIVO_SETTINGS_EXPORT_SUPPLIER_HARD_FIX__)return;
window.__YARDIVO_SETTINGS_EXPORT_SUPPLIER_HARD_FIX__=true;

const CATS=['ramps','qr','calendar','general','admin','danger'];
let selectedCategory=null;
let busySupplierDelete=false;

function normRole(r){
 r=String(r||'').toLowerCase().trim();
 if(r==='porta'||r==='portir')return'gate';
 if(r==='prijam')return'reception';
 if(r==='zalihe'||r.includes('zalih'))return'inventory';
 return r;
}
function isAdmin(){
 try{return normRole(window.currentSession?.role||currentSession?.role)==='admin'}catch(_){return false}
}
function categoryOf(panel){
 const id=String(panel?.id||'').toLowerCase();
 const title=String(panel?.querySelector?.('h2,h3')?.textContent||'').toUpperCase();

 if(panel?.classList?.contains('danger-zone') || /OPASNA ZONA|OBRIŠI SVE PODATKE|RESET BAZE/.test(title)) return 'danger';
 if(id==='receptionrampsettings' || /UPRAVLJANJE RAMPAMA|RAMPE|KAPACITET.*SKLADIŠTA|SKLADIŠTA.*BROJ RAMPI/.test(title)) return 'ramps';
 if(id==='qrmobilesettingspanel' || /\bQR\b|MOBILNO|MOBILE|SKENER|SCANNER/.test(title)) return 'qr';
 if(id==='yardivononworkingdayssettings' || /NERADNI|BLAGDAN/.test(title)) return 'calendar';
 if(id==='masteruseradmin' || /KORISNICI|PROFILI NA SERVERU|PRISTUP|AUTENTIK|AUTH|DOBAVLJAČKI RAČUN|DOBAVLJACKI RACUN/.test(title)) return 'admin';
 return 'general';
}
function allowed(cat){
 let r='';
 try{r=normRole(window.currentSession?.role||currentSession?.role)}catch(_){}
 if(!r||r==='admin')return true;
 if(r==='reception')return ['ramps','qr','calendar','general'].includes(cat);
 if(r==='inventory')return ['calendar','general'].includes(cat);
 return cat==='general';
}

function nav(){
 const settings=document.getElementById('settings');
 if(!settings)return null;
 let n=document.getElementById('yardivoSettingsTabsFinal');
 if(!n){
   n=document.createElement('div');
   n.id='yardivoSettingsTabsFinal';
   settings.querySelector('.section-title')?.insertAdjacentElement('afterend',n);
 }
 /* Rebuild only if the six authoritative buttons are missing. */
 const have=[...n.querySelectorAll('[data-settings-tab]')].map(x=>x.dataset.settingsTab);
 if(CATS.some(c=>!have.includes(c))){
   n.innerHTML=
   '<button type="button" data-settings-tab="ramps">PRIJAM &amp; RAMPE</button>'+
   '<button type="button" data-settings-tab="qr">QR &amp; MOBILNO</button>'+
   '<button type="button" data-settings-tab="calendar">NERADNI DANI</button>'+
   '<button type="button" data-settings-tab="general">OSTALE POSTAVKE</button>'+
   '<button type="button" data-settings-tab="admin">ADMINISTRACIJA</button>'+
   '<button type="button" data-settings-tab="danger">OPASNA ZONA</button>';
 }
 return n;
}
function panels(){
 const settings=document.getElementById('settings');
 if(!settings)return [];
 const grid=settings.querySelector('.settings-grid');
 if(!grid)return [];
 return [...grid.children].filter(x=>x.nodeType===1);
}
function classify(){
 const ps=panels();
 ps.forEach(p=>{
   p.classList.add('yardivo-settings-section');
   p.dataset.settingsFinalCategory=categoryOf(p);
 });
 return ps;
}
function show(cat){
 if(!CATS.includes(cat))return;
 selectedCategory=cat;
 const settings=document.getElementById('settings');
 if(!settings)return;
 nav();
 const ps=classify();

 let visible=0;
 ps.forEach(p=>{
   const yes=categoryOf(p)===cat && allowed(cat);
   p.hidden=!yes;
   p.classList.toggle('yardivo-settings-tab-hidden',!yes);
   p.classList.toggle('yardivo-settings-tab-visible',yes);
   if(yes){
     visible++;
     p.style.removeProperty('display');
     p.removeAttribute('aria-hidden');
   }else{
     p.setAttribute('aria-hidden','true');
   }
 });
 const empty=document.getElementById('yardivoSettingsChooseV583');
 if(empty)empty.hidden=true;

 settings.querySelectorAll('#yardivoSettingsTabsFinal [data-settings-tab]').forEach(b=>{
   const active=b.dataset.settingsTab===cat;
   b.classList.toggle('active',active);
   b.setAttribute('aria-pressed',active?'true':'false');
 });
 if(cat==='ramps'){
   setTimeout(()=>{try{window.YardivoSettingsFinalV583?.refresh?.()}catch(_){}},0);
 }
 if(cat==='admin')setTimeout(installBulkActions,40);
 if(cat==='danger'){
   setTimeout(()=>{
     try{
       /* Ask FULL DATA module to install; its patched install is exact-danger only. */
       const misplaced=document.getElementById('yardivoFullDataBackupCard');
       if(misplaced&&!misplaced.closest('#settings .danger-zone'))misplaced.remove();
     }catch(_){}
   },0);
 }
 if(!visible && !allowed(cat)){
   try{alert('Ova kategorija nije dostupna tvojoj roli.')}catch(_){}
 }
}

/* Use pointerdown because older competing code listens to click in capture phase.
   This becomes the first physical interaction that switches the category. */
function tabFromEvent(e){
 return e.target?.closest?.('#settings #yardivoSettingsTabsFinal [data-settings-tab]')||null;
}
document.addEventListener('pointerdown',e=>{
 const b=tabFromEvent(e);if(!b)return;
 e.preventDefault();
 show(b.dataset.settingsTab);
},true);
document.addEventListener('mousedown',e=>{
 const b=tabFromEvent(e);if(!b)return;
 show(b.dataset.settingsTab);
},true);
document.addEventListener('click',e=>{
 const b=tabFromEvent(e);if(!b)return;
 e.preventDefault();
 show(b.dataset.settingsTab);
},true);
document.addEventListener('keydown',e=>{
 if(!['Enter',' '].includes(e.key))return;
 const b=tabFromEvent(e);if(!b)return;
 e.preventDefault();
 show(b.dataset.settingsTab);
},true);

function ensureInitial(){
 const settings=document.getElementById('settings');
 if(!settings)return;
 nav();classify();
 /* Preserve "choose category" behavior until the user clicks. */
 if(selectedCategory)show(selectedCategory);
 installBulkActions();
 removeMisplacedBackup();
}
function removeMisplacedBackup(){
 document.querySelectorAll('#yardivoFullDataBackupCard').forEach(x=>{
   if(!x.closest('#settings .danger-zone'))x.remove();
 });
}

/* ---------------- Bulk supplier accounts ---------------- */
async function invokeUsers(action,payload){
 const api=window.YardivoAdminUsersServerV583;
 if(api?.invoke)return api.invoke(action,payload||{});
 /* Safe compatibility fallback: same deployed Admin Edge Function. */
 const c=await window.YardivoAuth.client();
 const {data,error}=await c.functions.invoke('yardivo-admin-users',{body:{action,...payload}});
 if(error)throw error;
 if(data?.error)throw new Error(data.error);
 return (data&&Object.prototype.hasOwnProperty.call(data,'data'))?data.data:(data||{});
}
async function listUsers(){
 const res=await invokeUsers('list',{});
 return Array.isArray(res)?res:(Array.isArray(res?.users)?res.users:[]);
}
function installBulkActions(){
 if(!isAdmin())return;
 const panel=document.getElementById('masterUserAdmin');
 if(!panel)return;

 let box=document.getElementById('yardivoBulkAdminActionsV583');
 if(!box){
   box=document.createElement('div');
   box.id='yardivoBulkAdminActionsV583';
   box.className='yardivo-bulk-admin-actions';
   box.innerHTML=
    '<button type="button" class="action danger" id="yardivoBulkUsersMirror">BRIŠI SVE KORISNIKE (OSIM ADMINA)</button>'+
    '<button type="button" class="action danger" id="yardivoDeleteAllSuppliers">BRIŠI SVE DOBAVLJAČE</button>'+
    '<span style="font-size:8px;color:#8299aa">Masovne administrativne radnje nad stvarnim server profilima.</span>';
   const body=panel.querySelector('.master-settings-body,.panel-body')||panel;
   body.insertBefore(box,body.firstChild);
 }

 const users=document.getElementById('yardivoBulkUsersMirror');
 if(users&&!users.dataset.bound){
   users.dataset.bound='1';
   users.onclick=()=>{
     const real=document.getElementById('yardivoDeleteAllNonAdminUsers');
     if(real){real.click();return}
     alert('Lista korisnika još nije učitana sa servera. Pokušaj ponovno za trenutak.');
   };
 }

 const suppliers=document.getElementById('yardivoDeleteAllSuppliers');
 if(suppliers&&!suppliers.dataset.bound){
   suppliers.dataset.bound='1';
   suppliers.onclick=deleteAllSuppliers;
 }
}
async function deleteAllSuppliers(){
 if(busySupplierDelete)return;
 if(!isAdmin())return alert('Samo Admin može brisati dobavljače.');

 busySupplierDelete=true;
 const btn=document.getElementById('yardivoDeleteAllSuppliers');
 if(btn)btn.disabled=true;
 try{
   if(btn)btn.textContent='UČITAVAM DOBAVLJAČE…';
   const users=await listUsers();
   const suppliers=users.filter(u=>normRole(u?.app_role)==='supplier' && u?.auth_user_id);

   if(!suppliers.length){
     alert('Nema dobavljača za brisanje.');
     return;
   }
   if(!confirm(`TRAJNO OBRISATI SVE DOBAVLJAČE (${suppliers.length})?\n\nBrišu se svi korisnički računi s rolom Dobavljač. Admin i ostali interni korisnici ostaju sačuvani.`))return;

   const typed=prompt('Za konačnu potvrdu upiši: BRISI SVE DOBAVLJACE');
   if(typed===null)return;
   const normalized=String(typed).trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
   if(normalized!=='BRISI SVE DOBAVLJACE'){
     alert('Brisanje dobavljača nije izvršeno.');
     return;
   }

   if(btn)btn.textContent='BRIŠEM SVE DOBAVLJAČE…';
   let deleted=0,failed=[];
   for(const u of suppliers){
     try{
       await invokeUsers('delete',{auth_user_id:u.auth_user_id});
       deleted++;
     }catch(err){
       failed.push(`${u.username||u.auth_user_id}: ${err?.message||err}`);
     }
   }

   try{
     await window.YardivoAdminUsersServerV583?.render?.();
   }catch(_){}
   try{
     window.YardivoSeparatedUserListsV583?.refresh?.();
   }catch(_){}
   window.dispatchEvent(new CustomEvent('yardivo:data-synced',{detail:{source:'bulk-supplier-delete'}}));

   if(failed.length){
     alert(`Obrisano dobavljača: ${deleted}. Neuspjelo: ${failed.length}.\n\n${failed.join('\n')}`);
   }else{
     try{showYmsToast?.('success','DOBAVLJAČI OBRISANI',`Obrisano ${deleted} dobavljača sa servera.`)}catch(_){}
     alert(`Obrisano ${deleted} dobavljača. Interni korisnici i Admin računi su ostali sačuvani.`);
   }
 }catch(err){
   console.error('[YARDIVO] bulk supplier delete',err);
   alert('Brisanje svih dobavljača nije uspjelo: '+(err?.message||err));
 }finally{
   busySupplierDelete=false;
   if(btn){btn.disabled=false;btn.textContent='BRIŠI SVE DOBAVLJAČE'}
 }
}

/* Re-mount after legacy Settings renderers modify DOM. */
let timer=0;
new MutationObserver(()=>{
 clearTimeout(timer);
 timer=setTimeout(ensureInitial,50);
}).observe(document.documentElement,{childList:true,subtree:true});

document.addEventListener('DOMContentLoaded',()=>setTimeout(ensureInitial,100));
window.addEventListener('load',()=>setTimeout(ensureInitial,600));
window.addEventListener('yardivo:login',()=>setTimeout(ensureInitial,250));

/* Also expose the final controller for diagnostics. */
window.YardivoSettingsHardFixV583={
 show,
 refresh:ensureInitial,
 deleteAllSuppliers,
 category:()=>selectedCategory
};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-dashboard-vs-yesterday';
})();
