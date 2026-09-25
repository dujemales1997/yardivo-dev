
(function(){
'use strict';
function normRole(v){
  v=String(v||'').toLowerCase().trim();
  if(v==='porta')return'gate'; if(v==='prijam')return'reception';
  if(v==='zalihe'||v==='upravljanje zalihama')return'inventory';
  if(v==='management'||v==='voditelj')return'manager';
  return v;
}
function setLoginError(msg){
  const e=document.getElementById('loginError');
  if(!e)return;
  const text=String(msg||'Prijava nije uspjela.');
  e.textContent=text;
  e.style.setProperty('display','block','important');
  e.style.setProperty('visibility','visible','important');
  e.style.setProperty('opacity','1','important');
  e.style.setProperty('min-height','42px','important');
  e.style.setProperty('padding','10px 12px','important');
  e.style.setProperty('margin-top','10px','important');
  e.style.setProperty('border','1px solid #9b343b','important');
  e.style.setProperty('border-radius','7px','important');
  e.style.setProperty('background','#351317','important');
  e.style.setProperty('color','#ffb1b5','important');
  e.style.setProperty('font-weight','900','important');
  e.style.setProperty('line-height','1.4','important');
  e.style.setProperty('box-shadow','0 0 0 2px rgba(220,52,60,.08),0 8px 24px rgba(0,0,0,.18)','important');
  e.setAttribute('role','alert');
  e.setAttribute('aria-live','assertive');
}
function persistAppSession(session){
  try{
    localStorage.removeItem('yardivo_custom_session');
    localStorage.removeItem('yardivo_remembered_session');
    sessionStorage.removeItem('studenac_demo_session');
  }catch(e){}
  try{window.currentSession=session;currentSession=session}catch(e){window.currentSession=session}
}
async function authClient(){
  if(!window.YardivoSupabaseClient?.client)throw new Error('Canonical Supabase client service nije učitan.');
  return await window.YardivoSupabaseClient.client();
}
async function forcePasswordRotation(c,user){return true}
async function loadServerProfile(c){
  const {data,error}=await c.rpc('yardivo_my_profile');
  if(error)throw error;
  const p=Array.isArray(data)?data[0]:data;
  if(!p||!p.active)throw new Error('Račun nije aktivan.');
  const role=normRole(p.app_role);
  if(!['admin','manager','inventory','reception','gate','supplier'].includes(role))throw new Error('Račun nema valjanu YARDIVO rolu.');
  const warehouses=Array.isArray(p.warehouses)?p.warehouses.map(x=>String(x).trim().toUpperCase()).filter(Boolean):[];
  return {username:String(p.username||''),role,location:String(p.location||'VG'),warehouses};
}
async function authoritativeLogin(){
  const username=(document.getElementById('loginUser')?.value||'').trim().toLowerCase();
  const password=document.getElementById('loginPass')?.value||'';
  if(!/^[a-z0-9._-]{3,40}$/.test(username)||!password){setLoginError('Upiši korisničko ime i lozinku.');return false}
  const btn=document.getElementById('loginSubmitBtn');if(btn)btn.disabled=true;
  try{
    const c=await authClient();
    try{await Promise.race([c.auth.signOut({scope:'local'}),new Promise(r=>setTimeout(r,1200))])}catch(_){}
    const {data,error}=await c.auth.signInWithPassword({email:`${username}@yardivo.local`,password});
    if(error||!data?.session)throw error||new Error('Prijava nije uspjela.');
    /* password change is user-initiated only */
    const p=await loadServerProfile(c);
    if(p.username.toLowerCase()!==username)throw new Error('Identitet korisnika se ne podudara.');
    const chosenRole=normRole(document.getElementById('loginRole')?.value||'');
    if(chosenRole!==p.role){
      const labels={admin:'Admin',manager:'Voditelj',inventory:'Upravljanje zalihama',reception:'Prijam',gate:'Porta',supplier:'Dobavljač'};
      throw new Error(`KRIVA ROLA|Dodijeljena rola ovom korisniku je: ${labels[p.role]||p.role}`);
    }
    const session={user:p.username,username:p.username,role:p.role,location:p.location,warehouses:p.warehouses||[],authUserId:data.user.id,loginAt:new Date().toISOString(),rememberMe:true,serverAuthorized:true};
    persistAppSession(session);
    try{localStorage.setItem('yardivo_last_location',p.location)}catch(e){}
    if(typeof enterApp==='function')enterApp();
    try{await window.YardivoSupabase?.syncNow?.()}catch(e){}
    try{window.YardivoExactRBAC?.apply?.()}catch(e){}
    if(p.role==='admin'){
      try{
        const done=localStorage.getItem('yardivo_real_auth_cutover_v1')==='1';
        if(!done){
          const {data:cut,error:cutErr}=await c.functions.invoke('yardivo-finalize-auth-migration',{body:{}});
          if(!cutErr&&cut?.ok)localStorage.setItem('yardivo_real_auth_cutover_v1','1');
        }
      }catch(e){console.warn('YARDIVO auth cutover pending',e)}
    }
    return true;
  }catch(e){
    try{(await authClient()).auth.signOut({scope:'local'})}catch(_){}
    persistAppSession(null);
    {
      const msg=String(e?.message||'');
      if(msg.startsWith('KRIVA ROLA|')){
        setLoginError('KRIVA ROLA — '+msg.split('|')[1]);
      }else if(msg==='Invalid login credentials'||/invalid login credentials/i.test(msg)){
        setLoginError('POGREŠAN PASSWORD — ili korisničko ime ne postoji.');
      }else{
        setLoginError(msg||'Prijava nije uspjela.');
      }
    }
    return false;
  }finally{if(btn)btn.disabled=false}
}
async function secureLogout(){
  try{const c=await authClient();await c.auth.signOut({scope:'local'})}catch(e){}
  try{saveAnnouncements?.()}catch(e){}
  try{localStorage.removeItem('yardivo_custom_session');localStorage.removeItem('yardivo_remembered_session');sessionStorage.removeItem('studenac_demo_session')}catch(e){}
  try{currentSession=null;window.currentSession=null}catch(e){window.currentSession=null}
  try{showLogin?.()}catch(e){}
}
async function validateExistingAuth(){
  try{
    const c=await authClient();
    const {data}=await c.auth.getSession();
    if(!data?.session)return false;
    const p=await loadServerProfile(c);
    const session={user:p.username,username:p.username,role:p.role,location:p.location,warehouses:p.warehouses||[],authUserId:data.session.user.id,loginAt:new Date().toISOString(),rememberMe:true,serverAuthorized:true};
    persistAppSession(session);
    return true;
  }catch(e){try{(await authClient()).auth.signOut({scope:'local'})}catch(_){ } return false}
}
window.YardivoAuth={login:authoritativeLogin,logout:secureLogout,validate:validateExistingAuth,client:authClient,profile:loadServerProfile};

const form=document.getElementById('loginForm'),button=document.getElementById('loginSubmitBtn');
/* Login event ownership moved to the single canonical router below. */
['logoutBtn','homeLogoutBtn'].forEach(id=>document.getElementById(id)?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();secureLogout()},true));
const select=document.getElementById('loginRole');
if(select){
  const holder=select.closest('label');if(holder)holder.style.removeProperty('display');
  select.disabled=false;select.removeAttribute('aria-hidden');
  select.innerHTML=[
    ['admin','Admin'],
    ['manager','Voditelj'],
    ['inventory','Upravljanje zalihama'],
    ['reception','Prijam'],
    ['gate','Porta'],
    ['supplier','Dobavljač']
  ].map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
}

  // Tablice + vozač: ONLY Admin and Inventory, regardless of old uppercase/lowercase session variants.
  window.canAnnounceDriverData=function(){
    let r='';
    try{r=legacyRole(currentSession?.role||window.currentSession?.role||'')}catch(e){}
    return r==='admin'||r==='inventory';
  };

  // Term editing/announcement editing: Admin + Inventory.
  window.canManageAnnouncementPlanning=function(){
    let r='';
    try{r=legacyRole(currentSession?.role||window.currentSession?.role||'')}catch(e){}
    return r==='admin'||r==='inventory';
  };

  // Ensure driver buttons/dialog are enabled for Admin/Inventory after RBAC rendering.
  function syncDriverControls(){
    const can=window.canAnnounceDriverData();
    document.querySelectorAll(
      '#ctxDriverAnnouncement,#driverAnnouncementForm input,#driverAnnouncementForm button'
    ).forEach(el=>{
      if(can){
        el.disabled=false;
        el.style.removeProperty('pointer-events');
        el.style.removeProperty('opacity');
      }
    });
  }
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="announcements"],[data-home-target="announcements"]')){
      setTimeout(syncDriverControls,30);
    }
  });
  setTimeout(syncDriverControls,400);

  window.YardivoAuthFinal={legacyRole,selectedRole,authoritativeLogin};
})();
