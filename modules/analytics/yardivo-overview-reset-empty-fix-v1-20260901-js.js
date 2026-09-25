
(function(){
'use strict';

function noOperationalData(){
  try{
    const a=Array.isArray(announcements)?announcements:[];
    const i=Array.isArray(incidents)?incidents:[];
    return a.length===0 && i.length===0;
  }catch(_){return true}
}

function clearHeroDerivedValues(){
  if(!noOperationalData())return;

  const rel=document.getElementById('ovExecReliability');
  if(rel)rel.textContent='—';

  const best=document.getElementById('ovFocusBest');
  const worst=document.getElementById('ovFocusAttention');

  [best,worst].forEach(card=>{
    if(!card)return;
    const strong=card.querySelector('strong');
    const span=card.querySelector('span');
    const score=card.querySelector('.yardivo-card-score');
    const meta=card.querySelector('.yardivo-card-meta');

    if(strong)strong.textContent='—';
    if(span)span.textContent='Nema evaluiranih dobavljača';
    if(score){
      score.textContent='';
      score.style.setProperty('display','none','important');
    }
    if(meta){
      meta.textContent='Nema operativnih podataka';
      meta.classList.add('empty-state');
    }
  });

  const avgCard=rel?.closest('.overview-exec-kpi');
  const avgMeta=avgCard?.querySelector('.yardivo-card-meta');
  if(avgMeta){
    avgMeta.textContent='Nema operativnih podataka';
    avgMeta.classList.add('empty-state');
  }
}

function clearOverviewSurfaces(){
  if(!noOperationalData())return;

  const select=document.getElementById('overviewSupplierSelect');
  if(select){
    select.value='';
    /* Master renderer may repopulate supplier names; this only clears the selected supplier. */
  }

  const table=document.getElementById('supplierPerformance');
  if(table)table.innerHTML='<tr><td colspan="7"><div class="overview-empty">Nema operativnih podataka za dobavljače.</div></td></tr>';

  const best=document.getElementById('overviewBest10');
  if(best)best.innerHTML='<div class="overview-empty">Nema evaluiranih dobavljača.</div>';

  const worst=document.getElementById('overviewWorst10');
  if(worst)worst.innerHTML='<div class="overview-empty">Nema evaluiranih dobavljača.</div>';

  const detail=document.getElementById('overviewSupplierDetail');
  if(detail)detail.innerHTML='<div class="overview-empty">Nema operativnih podataka.</div>';

  ['ovTotal','ovIncidents','ovChanges'].forEach(id=>{
    const el=document.getElementById(id);if(el)el.textContent='0';
  });
  const on=document.getElementById('ovOnTime');if(on)on.textContent='0%';
  const delay=document.getElementById('ovAvgDelay');if(delay)delay.textContent='—';
  const unload=document.getElementById('ovAvgUnload');if(unload)unload.textContent='—';

  clearHeroDerivedValues();
}

function repairHeroRenderer(){
  const hero=window.YardivoOverviewHero3;
  if(!hero || hero.__yardivoEmptyFixed)return;
  const old=hero.render;
  if(typeof old!=='function')return;

  hero.render=function(){
    const out=old.apply(this,arguments);

    /* Old visual helper kept the previous 100% / 41% custom score node
       when the source stats became empty. Explicitly clear it. */
    if(noOperationalData()){
      queueMicrotask(()=>{
        clearHeroDerivedValues();
        clearOverviewSurfaces();
      });
    }else{
      document.querySelectorAll('#yardivoOverviewSimple3 .yardivo-card-score').forEach(el=>{
        el.style.removeProperty('display');
      });
      document.querySelectorAll('#yardivoOverviewSimple3 .yardivo-card-meta').forEach(el=>el.classList.remove('empty-state'));
    }
    return out;
  };
  hero.__yardivoEmptyFixed=true;
}

function refresh(){
  repairHeroRenderer();

  try{window.YardivoOverviewManagerSummary?.render?.()}catch(_){}
  try{window.YardivoOverviewMaster?.render?.()}catch(_){}
  try{window.YardivoOverviewFullChart?.render?.()}catch(_){}
  try{window.YardivoOverviewHero3?.render?.()}catch(_){}

  setTimeout(()=>{
    if(noOperationalData())clearOverviewSurfaces();
  },20);
}

/* The wipe is asynchronous. Wrap it so Overview is forcibly invalidated after completion. */
function hookWipe(){
  const w=window.YardivoTotalOperationalWipe;
  if(!w || w.__overviewHooked || typeof w.run!=='function')return;
  const old=w.run;
  w.run=async function(){
    const out=await old.apply(this,arguments);
    refresh();
    return out;
  };
  w.__overviewHooked=true;
}

window.addEventListener('load',()=>{
  setTimeout(()=>{
    repairHeroRenderer();
    hookWipe();
    if(noOperationalData())refresh();
  },1150);
},{once:true});

window.addEventListener('yardivo:data-synced',()=>setTimeout(refresh,30));
window.addEventListener('yardivo:overview-refresh',()=>setTimeout(refresh,30));

document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="overview"],[data-home-target="overview"]')){
    setTimeout(refresh,120);
  }
},true);

/* Also catch the reset button independently; after old async handler finishes,
   repeat the empty-state invalidation a few times to beat delayed renderers/sync. */
document.addEventListener('click',e=>{
  if(!e.target.closest?.('#deleteAllDataBtn'))return;
  [250,700,1500].forEach(ms=>setTimeout(()=>{
    hookWipe();
    if(noOperationalData())refresh();
  },ms));
},false);

window.YardivoOverviewEmptyResetFix={refresh,clear:clearOverviewSurfaces};
})();
