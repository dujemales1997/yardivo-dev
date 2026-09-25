(function(){
'use strict';
if(window.__YARDIVO_FINAL_QA_1_5_V10__)return;
window.__YARDIVO_FINAL_QA_1_5_V10__=true;

function syncWarehouse(){
  const sel=document.getElementById('globalWarehouse');
  if(!sel)return;
  const wid=String(sel.value||'').trim();
  if(!wid||wid==='ALL')return;
  try{
    if(String(window.YardivoAppStateV583?.warehouse?.()||'')!==wid){
      window.YardivoAppStateV583?.setWarehouse?.(wid);
    }
  }catch(_){}
  try{window.activeWarehouse=wid;if(typeof activeWarehouse!=='undefined')activeWarehouse=wid}catch(_){}
  try{localStorage.setItem('studenac_active_warehouse',wid)}catch(_){}
  setTimeout(()=>{
    try{if(document.getElementById('analytics')?.classList.contains('active')||document.body?.dataset?.managerView==='analytics')window.renderYardivoAnalytics?.()}catch(_){}
    try{if(document.getElementById('dailyMap')?.classList.contains('active')||document.body?.dataset?.managerView==='dailyMap')window.renderDailyMap?.()}catch(_){}
    try{if(document.getElementById('weeklyMap')?.classList.contains('active')||document.body?.dataset?.managerView==='weeklyMap')window.renderWeeklyMap?.()}catch(_){}
  },0);
}
document.addEventListener('change',e=>{
  if(e.target?.id==='globalWarehouse')syncWarehouse();
},true);
window.YardivoFinalQaV10={syncWarehouse};
})();
