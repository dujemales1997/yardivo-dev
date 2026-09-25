
(function(){
'use strict';
if(window.__YARDIVO_ADMIN_MASTER_RESTORE_V11__)return;
window.__YARDIVO_ADMIN_MASTER_RESTORE_V11__=true;

function role(){
  let r='';
  try{r=String(currentSession?.role||currentSession?.app_role||'').trim().toLowerCase()}catch(_){}
  if(r==='voditelj'||r==='management')r='manager';
  return r;
}
function settingsVisible(){
  const s=document.getElementById('settings');
  if(!s)return false;
  return s.classList.contains('active') || s.style.display==='block' || document.body?.dataset?.managerView==='settings';
}
function ensureAnchor(settings,masterPane){
  let a=document.getElementById('yardivoAdminMasterQuickAnchorV11');
  if(!a){
    a=document.createElement('div');
    a.id='yardivoAdminMasterQuickAnchorV11';
    a.innerHTML=`<div><strong>MASTER PODACI · LOKACIJE / SKLADIŠTA / RAMPE</strong>
      <small>Ovdje uređuješ stvarne lokacije, skladišta, broj rampi, kapacitete i radna vremena.</small></div>
      <button type="button" class="primary" data-yv-master-jump-v11>OTVORI MASTER PODATKE</button>`;
  }
  const title=settings.querySelector('.section-title');
  if(title){
    if(a.previousElementSibling!==title)title.insertAdjacentElement('afterend',a);
  }else if(settings.firstChild!==a){
    settings.prepend(a);
  }
  a.querySelector('[data-yv-master-jump-v11]')?.addEventListener('click',()=>{
    const target=document.getElementById('yardivoStableMasterEditorV583')||masterPane;
    target.scrollIntoView({behavior:'smooth',block:'start'});
  },{once:true});
}
function restore(){
  if(role()!=='admin')return;
  const settings=document.getElementById('settings');
  if(!settings)return;

  /* Recreate the canonical settings shell if an older cleanup removed it. */
  try{window.YardivoMasterAdminSettingsV583?.ensureShell?.()}catch(_){}

  let masterPane=document.getElementById('yardivoSettingsMasterPaneV583');
  let adminPane=document.getElementById('yardivoSettingsAdminPaneV583');

  if(!masterPane){
    masterPane=document.createElement('div');
    masterPane.id='yardivoSettingsMasterPaneV583';
    const title=settings.querySelector('.section-title');
    if(title)title.insertAdjacentElement('afterend',masterPane);
    else settings.prepend(masterPane);
  }
  if(!adminPane){
    adminPane=document.createElement('div');
    adminPane.id='yardivoSettingsAdminPaneV583';
    masterPane.insertAdjacentElement('afterend',adminPane);
  }

  /* Master Data is always first in Admin Settings. */
  const title=settings.querySelector('.section-title');
  if(title && masterPane.previousElementSibling!==title){
    title.insertAdjacentElement('afterend',masterPane);
  }else if(!title && settings.firstElementChild!==masterPane){
    settings.prepend(masterPane);
  }

  masterPane.classList.add('active');
  adminPane.classList.add('active');
  masterPane.style.setProperty('display','block','important');
  adminPane.style.setProperty('display','block','important');

  /* Keep ONLY the current canonical Master editor shown in the screenshot. */
  const foundation=document.getElementById('yardivoMasterFoundationV583');
  if(foundation)foundation.remove();

  try{window.YardivoStableMasterV583?.render?.()}catch(_){}

  const stable=document.getElementById('yardivoStableMasterEditorV583');
  if(stable && stable.parentElement!==masterPane)masterPane.appendChild(stable);

  ensureAnchor(settings,masterPane);
}
function schedule(){
  setTimeout(restore,0);
  setTimeout(restore,80);
  setTimeout(restore,250);
}
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"],#navSettings'))schedule();
},true);
['yardivo:login','yardivo:data-synced','yardivo:master-data-changed','yardivo:view-opened']
  .forEach(ev=>window.addEventListener(ev,()=>{if(settingsVisible()||ev!=='yardivo:view-opened')schedule()}));

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('load',schedule,{once:true});

window.YardivoAdminMasterRestoreV11={restore};
})();
