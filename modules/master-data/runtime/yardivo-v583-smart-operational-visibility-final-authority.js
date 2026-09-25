(()=>{'use strict';
if(window.__YARDIVO_SMART_OPERATIONAL_VISIBILITY_FINAL__)return;
window.__YARDIVO_SMART_OPERATIONAL_VISIBILITY_FINAL__=true;
const MASTER='yardivo_master_data_registry_v583',CFG='yardivo_auto_replan_cfg_v1';
function j(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return{}}}
function role(){
 let r=String(window.currentSession?.role||window.currentSession?.app_role||'').toLowerCase().trim();
 if(r==='zalihe'||r==='upravljanje zalihama')r='inventory';
 if(r==='prijam')r='reception';
 if(r==='management'||r==='voditelj')r='manager';
 return r;
}
function enabled(){
 const m=j(MASTER),c=j(CFG),s=(m.smart&&typeof m.smart==='object')?m.smart:c;
 return s?.enabled===true && String(s?.mode||'').toUpperCase()!=='PAUSED';
}
function canSee(){
 const r=role();
 if(['admin','inventory','reception'].includes(r))return true;
 if(r==='manager')return window.yardivoManagerSectionAllowed?.('smartReplanning')===true;
 return false;
}
function apply(){
 const on=enabled(),visible=on&&canSee();
 document.documentElement.classList.toggle('yardivo-smart-on',on);
 document.documentElement.classList.toggle('yardivo-smart-off',!on);
 const nav=document.querySelector('.nav-btn[data-view="smartReplanning"]');
 if(nav){
   nav.hidden=!visible;
   nav.classList.toggle('role-hidden',!visible);
   nav.style.setProperty('display',visible?'':'none',visible?'':'important');
 }
 const view=document.getElementById('smartReplanning');
 if(view&&!visible){
   view.classList.remove('active');
   view.hidden=true;
   view.style.setProperty('display','none','important');
   if(document.querySelector('.view.active')===null){
     try{window.openAppView?.('homeMenu')}catch(_){}
   }
 }else if(view&&visible){
   view.hidden=false;
   view.style.removeProperty('display');
 }
 /* Settings control remains available so SMART can be enabled in the future.
    Supplier slot recommendation is independent and is intentionally untouched. */
}
['yardivo:login','yardivo:data-synced','yardivo:master-data-changed','yardivo:smart-system-state']
 .forEach(ev=>window.addEventListener(ev,()=>setTimeout(apply,30)));
window.addEventListener('storage',e=>{if(e.key===MASTER||e.key===CFG)setTimeout(apply,10)});
document.addEventListener('click',e=>{
 if(e.target?.closest?.('#ysePower,#yardivoSmartToggleExactV583,#yseSave'))setTimeout(apply,160);
},true);
window.addEventListener('load',()=>setTimeout(apply,600));
setTimeout(apply,50);
window.YardivoSmartOperationalVisibilityV583={apply,enabled};
})();
