(function(){
'use strict';

function box(){return document.getElementById('loginError')}
function styleOnly(){
  const e=box();if(!e)return;
  const t=String(e.textContent||'').trim();
  e.classList.remove('yardivo-login-role-error','yardivo-login-password-error','yardivo-login-ok');
  if(/^KRIVA ROLA/i.test(t))e.classList.add('yardivo-login-role-error');
  else if(/POGREŠAN|PASSWORD|USERNAME|SERVER|PRIJAVA NIJE/i.test(t))e.classList.add('yardivo-login-password-error');
}
/* Important: never rewrite textContent from a MutationObserver.
   Rewriting the same text caused an infinite mutation loop and browser freeze. */
window.addEventListener('load',()=>{
  const e=box();
  if(!e)return;
  let queued=false;
  new MutationObserver(()=>{
    if(queued)return;
    queued=true;
    queueMicrotask(()=>{queued=false;styleOnly()});
  }).observe(e,{childList:true,subtree:true,characterData:true});
  styleOnly();
},{once:true});

window.YardivoLoginFeedback={style:styleOnly};
})();
