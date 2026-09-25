(function(){
'use strict';
function normRole(){
 let r='';try{const s=(typeof currentSession!=='undefined'&&currentSession)||window.currentSession||{};r=String(s.app_role||s.role||document.body?.dataset?.yardivoRole||'').trim().toLowerCase()}catch(_){}
 if(r==='management'||r==='voditelj')r='manager';
 if(r==='zalihe'||r==='upravljanje zalihama'||r.includes('zalih'))r='inventory';
 if(r==='prijam')r='reception';if(r==='porta'||r==='portir')r='gate';if(r==='dobavljac'||r==='dobavljač')r='supplier';return r;
}
function stampRole(){const r=normRole();if(!r)return;document.body.dataset.yardivoRole=r;document.body.classList.toggle('yardivo-role-supplier',r==='supplier');document.body.classList.toggle('yardivo-role-gate',r==='gate');if(r==='supplier'||r==='gate')document.body.classList.remove('yv-minimap-open','yv-minimap-expanded','yv-assistant-open','yv-nextarrivals-open','yv-nextarrivals-expanded','yv-timeline-open','yv-timeline-expanded')}
let busy=false;
async function refreshOperational(){
 const r=normRole();if(!['admin','manager','inventory','reception'].includes(r)||busy)return;
 busy=true;try{
   await window.YardivoSupplierLiveSync?.pullInternal?.(true);
   try{window.renderDailyMap?.()}catch(_){}try{window.renderWeeklyMap?.()}catch(_){}try{window.renderReceiving?.()}catch(_){}try{window.renderAnnouncements?.()}catch(_){}
 }catch(e){console.error('YARDIVO operational supplier refresh',e)}finally{busy=false}
}
window.YardivoOperationalSupplierRefreshV583=refreshOperational;
window.addEventListener('yardivo:login',()=>{stampRole();setTimeout(refreshOperational,180)});
window.addEventListener('yardivo:data-synced',()=>{stampRole()});
window.addEventListener('load',()=>{stampRole();setTimeout(refreshOperational,900)});
document.addEventListener('click',e=>{stampRole();if(e.target.closest?.('[data-view="dailyMap"],[data-view="weeklyMap"],[data-view="receiving"],[data-home-target="dailyMap"],[data-home-target="weeklyMap"],[data-home-target="receiving"]'))setTimeout(refreshOperational,50)},true);
setTimeout(stampRole,0);
})();
