(()=>{'use strict';
const BUILD='20260915-dev-v5.8.3-admin-master-clean-no-flicker-final';
function normRole(v){let r=String(v||'').trim().toLowerCase();if(r==='management'||r==='voditelj')r='manager';if(r==='zalihe'||r==='upravljanje zalihama')r='inventory';if(r==='prijam')r='reception';if(r==='porta'||r==='portir')r='gate';return r}
function session(){try{return (typeof currentSession!=='undefined'&&currentSession)||window.currentSession||null}catch(e){return window.currentSession||null}}
function isAdmin(){const s=session();return !!s&&normRole(s.role||s.app_role)==='admin'}
function enforce(){const admin=isAdmin();document.body.classList.toggle('yardivo-v583-master-admin',admin);if(!admin){const master=document.getElementById('yardivoSettingsMasterPaneV583');if(master)master.classList.remove('active');const adminPane=document.getElementById('yardivoSettingsAdminPaneV583');if(adminPane&&!adminPane.classList.contains('active'))adminPane.classList.add('active')}}
function master(){try{return JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')}catch(e){return {}}}
function cleanVisibleLabels(){const m=master(),loc=new Map((m.locations||[]).map(x=>[String(x.id),String(x.name||'').trim()])),wh=new Map((m.warehouses||[]).map(x=>[String(x.id),String(x.name||'').trim()]));document.querySelectorAll('select').forEach(sel=>{Array.from(sel.options||[]).forEach(o=>{const v=String(o.value||'');if(loc.has(v)&&loc.get(v))o.textContent=loc.get(v);if(wh.has(v)&&wh.get(v))o.textContent=wh.get(v)})})}
function refresh(){enforce();cleanVisibleLabels()}
['yardivo:login','yardivo:logout','yardivo:master-data-changed','yardivo:data-synced','yardivo:context-changed'].forEach(ev=>window.addEventListener(ev,()=>requestAnimationFrame(refresh)));
document.addEventListener('DOMContentLoaded',refresh,{once:true});window.addEventListener('load',refresh,{once:true});
document.addEventListener('click',e=>{if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]'))requestAnimationFrame(refresh)},true);
window.YardivoAdminMasterAuthorityV583={refresh,isAdmin,build:BUILD};window.YARDIVO_DEV_BUILD=BUILD;
})();
