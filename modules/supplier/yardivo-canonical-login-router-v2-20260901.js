
(function(){
'use strict';

const BASE='https://rskticdbiovvgyocpzoc.supabase.co';
const KEY='sb_publishable_NWRcS2n-8GxF8qL7wXbZ-Q_-jIyfGoy';
const ROLE_LABEL={admin:'Admin',manager:'Voditelj',inventory:'Upravljanje zalihama',reception:'Prijam',gate:'Porta',supplier:'Dobavljač'};
let busy=false;

function normRole(r){
  r=String(r||'').toLowerCase().trim();
  if(r==='porta'||r==='portir')return'gate';
  if(r==='prijam')return'reception';
  if(r==='zalihe'||r.includes('zalih'))return'inventory';
  if(r==='management'||r==='voditelj')return'manager';
  return r;
}
function errorBox(){return document.getElementById('loginError')}
function showError(text){
  const e=errorBox();if(!e)return;
  e.textContent=String(text||'PRIJAVA NIJE USPJELA.');
  e.setAttribute('role','alert');
  e.setAttribute('aria-live','assertive');
  e.style.setProperty('display','block','important');
  e.style.setProperty('visibility','visible','important');
  e.style.setProperty('opacity','1','important');
  e.style.setProperty('min-height','42px','important');
  e.style.setProperty('padding','10px 12px','important');
  e.style.setProperty('margin-top','10px','important');
  e.style.setProperty('border','1px solid #d94a52','important');
  e.style.setProperty('border-radius','7px','important');
  e.style.setProperty('background','#351317','important');
  e.style.setProperty('color','#ffb1b5','important');
  e.style.setProperty('font-weight','900','important');
  e.style.setProperty('line-height','1.4','important');
}
function clearError(){
  const e=errorBox();if(!e)return;
  e.textContent='';
  e.style.setProperty('display','none','important');
}
function setBusy(on){
  busy=!!on;
  const b=document.getElementById('loginSubmitBtn');
  if(!b)return;
  if(!b.dataset.normalText)b.dataset.normalText=b.textContent||'PRIJAVA';
  b.innerHTML=on?'<span class=\"yv-login-spinner\" aria-hidden=\"true\"></span><span>PROVJERA…</span>':b.dataset.normalText;
  b.classList.toggle('yv-login-busy',!!on);
  b.disabled=!!on;
  if(on)b.setAttribute('aria-busy','true');
  else{
    b.removeAttribute('aria-busy');
    b.removeAttribute('disabled');
    b.style.removeProperty('pointer-events');
    b.style.removeProperty('opacity');
  }
}

async function fetchJSON(url,options={},timeoutMs=12000){
  let lastError=null;
  for(let attempt=0;attempt<3;attempt++){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const res=await fetch(url,{...options,cache:'no-store',signal:controller.signal});
      const data=await res.json().catch(()=>({}));
      return {res,data};
    }catch(e){
      lastError=e;
      const transient=e?.name==='AbortError'||/Failed to fetch|NetworkError|Load failed|network request failed/i.test(String(e?.message||e));
      if(!transient||attempt>=2)throw e;
      await new Promise(r=>setTimeout(r,350*(attempt+1)));
    }finally{
      clearTimeout(timer);
    }
  }
  throw lastError||new Error('NETWORK_REQUEST_FAILED');
}

function persistSession(session){
  try{
    window.currentSession=session;
    if(typeof currentSession!=='undefined')currentSession=session;
    localStorage.removeItem('yardivo_custom_session');
    localStorage.removeItem('yardivo_remembered_session');
    sessionStorage.removeItem('studenac_demo_session');
    localStorage.setItem('yardivo_last_location',session.location);
  }catch(_){window.currentSession=session}
}

function withLoginTimeout(promise,ms,label){
  let timer;
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(label||'SERVER NIJE ODGOVORIO — pokušaj ponovno.')),ms)})
  ]).finally(()=>clearTimeout(timer))
}

async function authenticate(){
  const username=(document.getElementById('loginUser')?.value||'').trim().toLowerCase();
  const password=document.getElementById('loginPass')?.value||'';
  const selectedRole=normRole(document.getElementById('loginRole')?.value||'');

  if(!/^[a-z0-9._-]{3,40}$/.test(username)){
    throw new Error('UPIŠI ISPRAVNO KORISNIČKO IME.');
  }
  if(!password){
    throw new Error('UPIŠI PASSWORD.');
  }

  const headers={'apikey':KEY,'Content-Type':'application/json'};
  const {res:authRes,data:auth}=await fetchJSON(
    BASE+'/auth/v1/token?grant_type=password',
    {method:'POST',headers,body:JSON.stringify({email:username+'@yardivo.local',password})},
    10000
  );

  if(!authRes.ok||!auth?.access_token){
    const raw=String(auth?.error_description||auth?.msg||auth?.message||'');
    if(/invalid login credentials/i.test(raw)||authRes.status===400||authRes.status===401){
      throw new Error('POGREŠAN USERNAME ILI PASSWORD.');
    }
    throw new Error(raw||'PRIJAVA NIJE USPJELA.');
  }

  const profileHeaders={...headers,Authorization:'Bearer '+auth.access_token};
  const {res:profileRes,data:pdata}=await fetchJSON(
    BASE+'/rest/v1/rpc/yardivo_my_profile',
    {method:'POST',headers:profileHeaders,body:'{}'},
    10000
  );
  if(!profileRes.ok){
    throw new Error(String(pdata?.message||'NE MOGU UČITATI KORISNIČKI PROFIL.'));
  }

  const p=Array.isArray(pdata)?pdata[0]:pdata;
  if(!p||!p.active)throw new Error('KORISNIČKI RAČUN NIJE AKTIVAN.');

  const assignedRole=normRole(p.app_role);
  if(!['admin','manager','inventory','reception','gate','supplier'].includes(assignedRole)){
    throw new Error('KORISNIK NEMA VALJANU YARDIVO ROLU.');
  }
  if(selectedRole!==assignedRole){
    throw new Error('KRIVA ROLA — ovom korisniku je dodijeljena: '+(ROLE_LABEL[assignedRole]||assignedRole)+'.');
  }

  const session={
    user:String(p.username||username),
    username:String(p.username||username),
    role:assignedRole,
    location:String(p.location||'VG'),
    warehouses:Array.isArray(p.warehouses)?p.warehouses.map(x=>String(x).trim().toUpperCase()).filter(Boolean):[],
    authUserId:auth.user?.id||'',
    loginAt:new Date().toISOString(),
    rememberMe:!!document.getElementById('rememberMe')?.checked,
    serverAuthorized:true
  };
  persistSession(session);

  /* V5.7.6: bind the raw REST login tokens into the Supabase auth client for EVERY role,
     including Supplier. Supplier Edge Functions read this authenticated session. */
  try{
    const authClient=await window.YardivoAuth?.client?.();
    if(authClient?.auth?.setSession){
      const {error:setSessionError}=await withLoginTimeout(authClient.auth.setSession({
        access_token:auth.access_token,
        refresh_token:auth.refresh_token
      }),7000,'AUTH SESSION NIJE ODGOVORIO — pokušaj ponovno.');
      if(setSessionError)throw setSessionError;
    }
    window.__yardivoSupplierAccessToken=auth.access_token;
  }catch(setSessionErr){
    console.error('YARDIVO V5.7.6 auth session bind',setSessionErr);
    throw new Error('ONLINE PRIJAVA NIJE POVEZANA. Odjavite se i ponovno prijavite.');
  }

  /* Canonical online bootstrap: login is complete only when the database session is valid.
     The Edge sync receives this exact JWT; no stale or anonymous browser session can write. */
  if(assignedRole!=='supplier'){
    if(!window.YardivoSupabase?.authenticate)throw new Error('ONLINE BAZA NIJE SPREMNA.');
    /* Canonical DB connection is part of login. Do not open the app in a half-connected state. */
    const connected=await withLoginTimeout(window.YardivoSupabase.authenticate(auth.access_token,auth.refresh_token),10000,'ONLINE BAZA NIJE ODGOVORILA — pokušaj ponovno.');
    if(!connected||!window.YardivoSupabase?.online?.())throw new Error('ONLINE BAZA NIJE SPOJENA.');
  }

  return session;
}

async function login(){
  if(busy)return false;
  clearError();
  setBusy(true);
  try{
    const session=await authenticate();

    try{window.dispatchEvent(new CustomEvent('yardivo:login',{detail:{session}}))}catch(_){}
    try{
      if(window.YardivoPostAuthTransition?.open){
        window.YardivoPostAuthTransition.open();
      }else if(typeof enterApp==='function'){
        enterApp();
      }
    }catch(e){
      console.error('YARDIVO enter app',e);
      throw new Error('PRIJAVA JE USPJELA, ALI APLIKACIJA SE NIJE OTVORILA.');
    }

    try{window.YardivoRoleStableFinal?.apply?.()}catch(_){}
    try{window.YardivoExactRBAC?.apply?.()}catch(_){}
    if(session.role==='supplier'){
      try{window.YardivoSupplierPortal?.open?.()}catch(_){}
    }else{
      try{window.yardivoRefreshAllWarehouseUi?.()}catch(_){}
    }
    return true;
  }catch(e){
    let msg=String(e?.message||'PRIJAVA NIJE USPJELA.');
    if(e?.name==='AbortError'){
      msg='SERVER NIJE ODGOVORIO — pokušaj ponovno.';
    }else if(/Failed to fetch|NetworkError|Load failed/i.test(msg)){
      msg='NEMA VEZE SA SERVEROM — provjeri internet i pokušaj ponovno.';
    }
    showError(msg);
    try{
      window.currentSession=null;
      if(typeof currentSession!=='undefined')currentSession=null;
    }catch(_){}
    return false;
  }finally{
    setBusy(false);
  }
}

/* SINGLE LOGIN OWNER — all old login handlers above are detached/disabled. */
document.addEventListener('click',function(e){
  const b=e.target.closest?.('#loginSubmitBtn');
  if(!b)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  login();
},true);

document.addEventListener('submit',function(e){
  if(e.target?.id!=='loginForm')return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  login();
},true);

window.YardivoCanonicalLogin={login,authenticate,showError,clearError};
})();
