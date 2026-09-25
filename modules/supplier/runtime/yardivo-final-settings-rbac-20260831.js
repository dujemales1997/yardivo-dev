(function(){
'use strict';
const norm=r=>{r=String(r||'').toLowerCase().trim();if(r==='porta'||r==='portir')return'gate';if(r==='prijam')return'reception';if(r==='zalihe'||r.includes('zalih'))return'inventory';return r};
function role(){try{return norm(window.currentSession?.role||currentSession?.role)}catch(_){return''}}
function root(){return document.getElementById('settings')}
function panels(){return [...(root()?.querySelectorAll('.settings-grid > section,.settings-grid > .panel,.settings-grid > .settings-card,.settings-grid > .settings-section,.settings-grid > .danger-zone')||[])]}
function owners(el){
 if(el.id==='masterUserAdmin'||el.id==='masterUserList'||el.id==='yardivoSupplierAccountsAdmin'||el.classList.contains('danger-zone'))return ['admin'];
 if(el.id==='yardivoFontSettings')return ['admin','manager','inventory','reception'];
 if(el.id==='yardivoNonWorkingDaysSettings')return ['admin','manager','inventory','reception'];
 if(el.id==='qrMobileSettingsPanel')return ['admin','manager','reception'];
 if(el.id==='receptionRampSettings')return ['admin','manager','reception'];
 const tags=(el.dataset.yardivoSettings||'').split(/\s+/).filter(Boolean);
 return tags.length?['admin','manager',...tags]:['admin','manager'];
}
function enforce(){
 const r=role(),rt=root();if(!r||!rt)return;
 const settingsNav=document.querySelectorAll('[data-view="settings"],[data-home-target="settings"]');
 const mayOpen=r==='manager'
   ? window.yardivoManagerSectionAllowed?.('settings')===true
   : r!=='gate';
 settingsNav.forEach(x=>{
   x.classList.toggle('role-hidden',!mayOpen);
   if(mayOpen)x.style.removeProperty('display');else x.style.setProperty('display','none','important');
 });
 if(!mayOpen){rt.classList.remove('active');return}
 panels().forEach(el=>{
   const show=owners(el).includes(r);
   el.style.setProperty('display',show?'block':'none','important');
   el.classList.toggle('yardivo-settings-role-hidden',!show);
 });
 rt.querySelectorAll('#masterUserAdmin,#masterUserList,#yardivoSupplierAccountsAdmin,[data-admin-only],.admin-only,.danger-zone,#deleteAllDataBtn').forEach(x=>{
   const show=r==='admin';
   x.style.setProperty('display',show?'':'none',show?'':'important');
 });
}
window.yardivoEnforceSettingsRBAC=enforce;
window.addEventListener('yardivo:login',()=>setTimeout(enforce,30));
window.addEventListener('load',()=>setTimeout(enforce,950),{once:true});
window.addEventListener('yardivo:view-opened',e=>{if(e?.detail?.view==='settings')setTimeout(enforce,0)});
document.addEventListener('click',e=>{if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]'))setTimeout(enforce,0)},true);
})();
