
(function(){
'use strict';
if(window.__YARDIVO_FACTORY_ZERO_UI_V583__)return;
window.__YARDIVO_FACTORY_ZERO_UI_V583__=true;

function emptyBusiness(){
  try{
    const A=Array.isArray(window.announcements)?window.announcements:(typeof announcements!=='undefined'&&Array.isArray(announcements)?announcements:[]);
    const I=Array.isArray(window.incidents)?window.incidents:(typeof incidents!=='undefined'&&Array.isArray(incidents)?incidents:[]);
    const d=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}');
    return A.length===0&&I.length===0&&(!Array.isArray(d.suppliers)||d.suppliers.filter(x=>x?.active!==false).length===0);
  }catch(_){return true}
}
function forceZeroUi(){
  if(!emptyBusiness())return;

  /* Never allow a zero-count unannounced badge to flash. */
  document.querySelectorAll('#unannouncedNavBadge').forEach(b=>{
    b.textContent='0';
    b.style.setProperty('display','none','important');
    b.style.setProperty('visibility','hidden','important');
    b.style.setProperty('opacity','0','important');
  });
  document.getElementById('unannouncedApprovalPanel')?.remove();

  const zeroIds=[
    'notifCount','opsAlertBadge','opsAlertCount','incidentBadge','ctCriticalBadge',
    'ctTodayTotal','ctYard','ctDock','ctLate','ctIncidents','ctUnannounced',
    'dashAttentionCount','announcementCount','annTruckCount','truckUniqueCount',
    'truckVisitCount','truckReturningCount','incidentArchiveCount',
    'ovTotal','ovIncidents','ovChanges','ovUnannounced'
  ];
  zeroIds.forEach(id=>{const el=document.getElementById(id);if(el)el.textContent='0'});
  const pct=document.getElementById('ovOnTime');if(pct)pct.textContent='0%';
  const avg=document.getElementById('ovAvgDelay');if(avg)avg.textContent='—';
  const unload=document.getElementById('ovAvgUnload');if(unload)unload.textContent='—';

  const chart=document.getElementById('overviewSupplierChart');
  if(chart)chart.innerHTML='<div class="overview-empty">Nema dobavljača u MASTER PODACI.</div>';
  const full=document.getElementById('overviewFullSupplierBars');
  if(full)full.innerHTML='<div class="overview-empty">Nema dobavljača u MASTER PODACI.</div>';
  const perf=document.getElementById('supplierPerformance');
  if(perf)perf.innerHTML='<tr><td colspan="7"><div class="overview-empty">Nema dobavljača.</div></td></tr>';
  const best=document.getElementById('overviewBest10');
  if(best)best.innerHTML='<div class="overview-empty">Nema evaluiranih dobavljača.</div>';
  const worst=document.getElementById('overviewWorst10');
  if(worst)worst.innerHTML='<div class="overview-empty">Nema evaluiranih dobavljača.</div>';
  const sel=document.getElementById('overviewSupplierSelect');
  if(sel)sel.innerHTML='<option value="">Nema dobavljača</option>';
  const cnt=document.getElementById('overviewSupplierCount');
  if(cnt)cnt.textContent='0 dobavljača · kompletna lista';

  /* Any legacy 3D/carousel supplier visuals must be empty too. */
  ['overviewSupplier3D','yardivoOverviewSimple3'].forEach(id=>{
    const root=document.getElementById(id);
    if(!root)return;
    root.querySelectorAll('[data-supplier],[data-master-chart],.ov3d-item,.yardivo-card-score').forEach(el=>el.remove());
  });
}
function run(){requestAnimationFrame(forceZeroUi)}
['yardivo:login','yardivo:data-synced','yardivo:factory-zero-server-cleared',
 'yardivo:zero-state-ready','yardivo:overview-refresh','yardivo:context-changed']
 .forEach(ev=>window.addEventListener(ev,run));
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-view="overview"],[data-home-target="overview"],[data-view="unannounced"],[data-home-target="unannounced"]'))run();
},true);
document.addEventListener('DOMContentLoaded',run,{once:true});
window.addEventListener('load',()=>setTimeout(run,250),{once:true});

window.YardivoFactoryZeroV583={refresh:forceZeroUi,isEmpty:emptyBusiness};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-factory-zero-audited';
})();
