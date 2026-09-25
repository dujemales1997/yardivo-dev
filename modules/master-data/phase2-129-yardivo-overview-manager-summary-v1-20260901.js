
(function(){
'use strict';

function stats(){
  try{
    const x=window.YardivoOverviewMaster?.currentStats?.();
    return Array.isArray(x)?x:[];
  }catch(_){return[]}
}
function text(id,v){
  const el=document.getElementById(id);if(el)el.textContent=v;
}
function focus(id,name,line,tone){
  const el=document.getElementById(id);if(!el)return;
  const s=el.querySelector('strong'),d=el.querySelector('span');
  if(s)s.textContent=name||'—';
  if(d)d.textContent=line||'—';
  el.dataset.tone=tone||'';
}
function render(){
  const rows=stats().filter(Boolean);
  const rated=rows.filter(x=>x.reliability!=null&&x.evaluated>0);
  const totalEval=rated.reduce((s,x)=>s+Number(x.evaluated||0),0);
  const totalArr=rated.reduce((s,x)=>s+Number(x.arrived||0),0);
  const totalOn=rated.reduce((s,x)=>s+Number(x.on||0),0);
  const totalNoShow=rated.reduce((s,x)=>s+Number(x.noShow||0),0);
  const totalInc=rated.reduce((s,x)=>s+Number(x.incidents||0),0);
  const avg=rated.length?Math.round(rated.reduce((s,x)=>s+Number(x.reliability||0),0)/rated.length):null;
  const punctuality=totalArr?Math.round(totalOn/totalArr*100):null;
  const strong=rated.filter(x=>x.reliability>=80).length;
  const risk=rated.filter(x=>x.reliability<60).length;

  text('ovExecReliability',avg==null?'—':avg+'%');
  text('ovExecStrong',strong);
  text('ovExecRisk',risk);
  text('ovExecPunctuality',punctuality==null?'—':punctuality+'%');
  text('ovExecNoShow',totalNoShow);
  text('ovExecIncidents',totalInc);

  let health='NEMA PODATAKA';
  let tone='neutral';
  if(avg!=null){
    if(avg>=85){health='STABILNO';tone='good'}
    else if(avg>=70){health='POD KONTROLOM';tone='mid'}
    else{health='POTREBNA AKCIJA';tone='bad'}
  }
  const healthEl=document.getElementById('ovExecHealth');
  if(healthEl){healthEl.textContent=health;healthEl.dataset.tone=tone}

  const best=[...rated].sort((a,b)=>b.reliability-a.reliability||b.evaluated-a.evaluated)[0];
  const attention=[...rated].sort((a,b)=>{
    const ar=(a.reliability??101),br=(b.reliability??101);
    if(ar!==br)return ar-br;
    const ap=(a.noShow||0)*4+(a.incidents||0)*3+(a.late||0);
    const bp=(b.noShow||0)*4+(b.incidents||0)*3+(b.late||0);
    return bp-ap;
  })[0];

  focus(
    'ovFocusBest',
    best?.name||'—',
    best?`${best.reliability}% pouzdanost · ${best.score10}/10 · ${best.on}/${best.arrived} na vrijeme`:'Nema evaluiranih dobavljača',
    'good'
  );
  focus(
    'ovFocusAttention',
    attention?.name||'—',
    attention?`${attention.reliability}% pouzdanost · ${attention.late} kašnjenja · ${attention.incidents} inc. · ${attention.noShow} no-show`:'Nema evaluiranih dobavljača',
    attention&&attention.reliability<60?'bad':'mid'
  );
  const coverage=rows.length?Math.round(rated.length/rows.length*100):0;
  focus(
    'ovFocusData',
    rows.length?`${rated.length}/${rows.length} dobavljača`:'—',
    `${coverage}% ima dovoljno podataka za ocjenu · ${totalEval} evaluiranih isporuka`,
    coverage>=80?'good':coverage>=50?'mid':'bad'
  );
}

function schedule(){setTimeout(render,0)}
window.addEventListener('load',()=>setTimeout(render,1000),{once:true});
window.addEventListener('yardivo:data-synced',schedule);
window.addEventListener('yardivo:overview-refresh',schedule);
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="overview"],[data-home-target="overview"]'))setTimeout(render,120);
},true);
document.addEventListener('change',e=>{
  if(e.target?.id==='overviewSupplierSelect')schedule();
},true);

window.YardivoOverviewManagerSummary={render};
})();
