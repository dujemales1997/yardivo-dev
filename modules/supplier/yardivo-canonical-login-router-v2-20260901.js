(function(){
'use strict';
let busy=false;

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
  b.innerHTML=on?'<span class="yv-login-spinner" aria-hidden="true"></span><span>PROVJERA…</span>':b.dataset.normalText;
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

async function authenticate(){
  if(!window.YardivoAuth?.authenticate)throw new Error('AUTH SERVICE NIJE UČITAN.');
  return await window.YardivoAuth.authenticate({
    username:(document.getElementById('loginUser')?.value||'').trim(),
    password:document.getElementById('loginPass')?.value||'',
    selectedRole:document.getElementById('loginRole')?.value||'',
    rememberMe:!!document.getElementById('rememberMe')?.checked
  });
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
    try{window.YardivoAuth?.clearSession?.()}catch(_){}
    return false;
  }finally{
    setBusy(false);
  }
}

/* SINGLE LOGIN UI OWNER — auth/session logic lives in services/auth.js. */
document.addEventListener('click',function(e){
  const b=e.target.closest?.('#loginSubmitBtn');
  if(!b)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  void login();
},true);

document.addEventListener('submit',function(e){
  if(e.target?.id!=='loginForm')return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  void login();
},true);

window.YardivoCanonicalLogin={login,authenticate,showError,clearError};
})();