
(function(){
'use strict';
const norm=v=>String(v||'').trim().toLowerCase();
function isAdmin(){
  try{return norm((window.currentSession||currentSession)?.role)==='admin'}catch(_){return norm(window.currentSession?.role)==='admin'}
}
async function invoke(action,payload={}){
  if(!isAdmin())throw new Error('Samo Admin može izvršiti ovu akciju.');
  if(window.YardivoAdminUsersServerV583?.invoke)return window.YardivoAdminUsersServerV583.invoke(action,payload);
  const c=await window.YardivoAuth.client();
  const {data,error}=await c.functions.invoke('yardivo-admin-users',{body:{action,...payload}});
  if(error)throw error;
  if(data?.error)throw new Error(data.error);
  return data?.data??data;
}
function askPassword(username){
  const p=window.prompt(`NOVA ŠIFRA · ${username||'korisnik'}\nUpiši novu šifru (najmanje 8 znakova).`);
  if(p===null)return null;
  if(String(p).length<8){alert('Šifra mora imati najmanje 8 znakova.');return null}
  const p2=window.prompt(`POTVRDI NOVU ŠIFRU · ${username||'korisnik'}\nPonovno upiši novu šifru.`);
  if(p2===null)return null;
  if(p!==p2){alert('Šifre se ne podudaraju.');return null}
  return p;
}
async function refreshUsers(){
  try{await window.YardivoServerProfiles?.render?.()}catch(_){ }
  try{await window.YardivoSupplierAccountsAdmin?.list?.()}catch(_){ }
}
async function passwordAction(id,username,btn){
  if(!id)return alert('Korisnički ID nije pronađen.');
  const password=askPassword(username);if(!password)return;
  if(!confirm(`Promijeniti šifru za "${username||'korisnika'}"?`))return;
  btn.disabled=true;
  try{
    await invoke('password',{auth_user_id:id,password});
    try{window.showYmsToast?.('success','ŠIFRA PROMIJENJENA',username||'Korisnik')}catch(_){ }
    alert('Šifra je uspješno promijenjena.');
  }catch(e){alert('Promjena šifre nije uspjela:\n'+String(e?.message||e))}
  finally{btn.disabled=false}
}
async function deleteAction(id,username,btn,isSupplier){
  if(!id)return alert('Korisnički ID nije pronađen.');
  if(!confirm(`Trajno obrisati ${isSupplier?'Supplier account':'korisnika'} "${username||''}"?`))return;
  btn.disabled=true;
  try{
    await invoke('delete',{auth_user_id:id});
    await refreshUsers();
    try{window.showYmsToast?.('success',isSupplier?'SUPPLIER ACCOUNT OBRISAN':'KORISNIK OBRISAN',username||'')}catch(_){ }
    alert(isSupplier?'Supplier account je izbrisan.':'Korisnik je izbrisan.');
  }catch(e){alert('Brisanje nije uspjelo:\n'+String(e?.message||e))}
  finally{btn.disabled=false}
}
/* Window capture runs before legacy document capture handlers that were swallowing these clicks. */
window.addEventListener('click',function(e){
  const b=e.target?.closest?.('[data-profile-password],[data-profile-delete],#yardivoSupplierAccountsAdmin [data-ysp-action="password"],#yardivoSupplierAccountsAdmin [data-ysp-action="delete"]');
  if(!b)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  if(!isAdmin()){alert('Samo Admin može mijenjati šifre i brisati korisničke račune.');return}
  if(b.matches('[data-profile-password]'))return void passwordAction(b.dataset.profilePassword,b.dataset.profileUser||'',b);
  if(b.matches('[data-profile-delete]'))return void deleteAction(b.dataset.profileDelete,b.closest('.master-user-row')?.querySelector('strong')?.textContent||'',b,false);
  if(b.dataset.yspAction==='password')return void passwordAction(b.dataset.id,b.dataset.user||'',b);
  if(b.dataset.yspAction==='delete')return void deleteAction(b.dataset.id,b.dataset.user||'',b,true);
},true);
})();
