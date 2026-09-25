
(function(){
'use strict';
function role(){let r='';try{r=String(currentSession?.role||window.currentSession?.role||'').toLowerCase().trim()}catch(e){};if(r==='prijam')r='reception';if(r==='zalihe'||r.includes('zalih'))r='inventory';if(r==='porta'||r==='portir')r='gate';return r}
function persist(){
 try{saveAnnouncements()}catch(e){
  try{safeStorage.setItem('yardivo_yms_announcements_v1',JSON.stringify(announcements));safeStorage.setItem('yardivo_yms_announcements_v1',JSON.stringify(announcements))}catch(_){}
 }
}
function refreshAll(){
 persist();
 ['render','renderAnnouncements','renderReceiving','renderDailyMap','renderWeeklyMap','renderOverview','refreshRecommendation'].forEach(n=>{try{if(typeof window[n]==='function')window[n]()}catch(e){}});
 try{window.YardivoUnannouncedSection?.render?.()}catch(e){}
 try{window.YardivoUnannounced?.render?.()}catch(e){}
}
function findA(id){try{return (announcements||[]).find(x=>String(x.id)===String(id))}catch(e){return null}}
function approve(id){
 if(!['admin','reception'].includes(role())){alert('Odobriti nenajavljeni dolazak može samo Prijam ili Admin.');return false}
 const a=findA(id);if(!a||a.approvalStatus!=='PENDING')return false;
 const now=new Date(),by=currentSession?.user||currentSession?.username||role();
 a.approvalStatus='APPROVED';a.status='U dolasku';a.approvedBy=by;a.approvedAt=now.toISOString();
 (a.changeHistory||(a.changeHistory=[])).push({changedAt:now.toISOString(),type:'UNANNOUNCED_APPROVED',reason:'Odobren nenajavljeni dolazak',changedBy:by});
 refreshAll();try{showYmsToast?.('success','ULAZ ODOBREN',`${a.supplier||'Dobavljač'} · ${a.plannedPlate||''}`)}catch(e){};return true
}
function reject(id){
 if(!['admin','reception'].includes(role())){alert('Odbiti nenajavljeni dolazak može samo Prijam ili Admin.');return false}
 const a=findA(id);if(!a||a.approvalStatus!=='PENDING')return false;
 const reason=document.getElementById('uaRejectReason_'+id)?.value?.trim()||'Nenajavljeni dolazak nije odobren',now=new Date(),by=currentSession?.user||currentSession?.username||role();
 a.approvalStatus='REJECTED';a.status='Odbijen';a.approvalRejectedBy=by;a.approvalRejectedAt=now.toISOString();a.approvalRejectionReason=reason;a.rejectedAt=now.toISOString();
 (a.changeHistory||(a.changeHistory=[])).push({changedAt:now.toISOString(),type:'UNANNOUNCED_REJECTED',reason,changedBy:by});
 refreshAll();try{showYmsToast?.('error','ULAZ ODBIJEN',`${a.supplier||'Dobavljač'} · ${a.plannedPlate||''}`)}catch(e){};return true
}
function enforceRoles(){
 try{
  if(window.YardivoUnannounced){window.YardivoUnannounced.approve=approve;window.YardivoUnannounced.reject=reject}
  document.querySelectorAll('[data-view="yard"],[data-home-target="yard"],#yard').forEach(x=>x.remove());
  const r=role();
  const my=document.querySelector('[data-view="myYard"]');
  const managerMy=r==='manager'||r==='management'
    ? window.yardivoManagerSectionAllowed?.('myYard')===true
    : false;
  if(my && (managerMy||['admin','inventory','reception','gate'].includes(r)))my.classList.remove('role-hidden');
  const home=document.querySelector('[data-home-target="myYard"]');
  if(home && (managerMy||['admin','inventory','reception','gate'].includes(r)))home.style.display='';
 }catch(e){}
}
const oldApply=window.applyRoleAccess;
window.applyRoleAccess=function(){try{oldApply?.apply(this,arguments)}catch(e){};enforceRoles()};
window.addEventListener('load',()=>setTimeout(enforceRoles,500));
document.addEventListener('click',e=>{if(e.target.closest('[data-view="unannounced"],[data-view="myYard"],[data-home-target]'))setTimeout(enforceRoles,20)},true);
setInterval(enforceRoles,2500);
window.YardivoQAWorkflow={approveUnannounced:approve,rejectUnannounced:reject,enforceRoles};
})();
