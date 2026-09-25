
(function(){
'use strict';

function extractScore(text){
  const m=String(text||'').match(/(\d{1,3})\s*%/);
  return m?Math.max(0,Math.min(100,Number(m[1]))):null;
}
function rebuildCard(card,type){
  if(!card)return;
  const strong=card.querySelector('strong');
  const raw=card.textContent||'';
  const score=extractScore(raw);

  let meta=[...card.querySelectorAll('span,p,div')]
    .map(x=>String(x.textContent||'').trim())
    .filter(Boolean)
    .find(t=>t!==String(strong?.textContent||'').trim() && !/NAJBOLJI|NAJLOŠIJI|POUZDANOST/i.test(t));

  if(type==='best' || type==='worst'){
    let s=card.querySelector('.yardivo-card-score');
    if(!s){
      s=document.createElement('div');
      s.className='yardivo-card-score '+(type==='best'?'yardivo-best-score':'yardivo-worst-score');
      strong?.after(s);
    }
    if(score!==null)s.textContent=score+'%';

    let m=card.querySelector('.yardivo-card-meta');
    if(!m){
      m=document.createElement('div');
      m.className='yardivo-card-meta';
      s.after(m);
    }
    if(meta)m.textContent=meta;
  }else{
    let m=card.querySelector('.yardivo-card-meta');
    if(!m){
      m=document.createElement('div');
      m.className='yardivo-card-meta';
      const rel=document.getElementById('ovExecReliability');
      rel?.after(m);
    }
    m.textContent='evaluirani dobavljači';
  }
}
function apply(){
  const root=document.getElementById('overviewExecutive');
  const grid=document.getElementById('yardivoOverviewSimple3');
  if(!root||!grid)return;

  const avg=document.getElementById('ovExecReliability')?.closest('.overview-exec-kpi');
  const best=document.getElementById('ovFocusBest');
  const worst=document.getElementById('ovFocusAttention');

  if(avg){
    const l=avg.querySelector('small');
    if(l)l.textContent='PROSJEČNA POUZDANOST';
  }
  if(best){
    const l=best.querySelector('small');
    if(l)l.textContent='NAJBOLJI DOBAVLJAČ';
  }
  if(worst){
    const l=worst.querySelector('small');
    if(l)l.textContent='NAJLOŠIJI DOBAVLJAČ';
  }

  [avg,best,worst].filter(Boolean).forEach(x=>grid.appendChild(x));

  rebuildCard(avg,'avg');
  rebuildCard(best,'best');
  rebuildCard(worst,'worst');

  /* Hide every legacy manager-summary card that is not one of the three selected cards. */
  root.querySelectorAll('.overview-exec-kpi,.overview-focus-card').forEach(el=>{
    const keep=el===avg||el===best||el===worst;
    el.style.setProperty('display',keep?'flex':'none','important');
  });
}
window.addEventListener('load',()=>setTimeout(apply,1000),{once:true});
window.addEventListener('yardivo:data-synced',()=>setTimeout(apply,40));
window.addEventListener('yardivo:overview-refresh',()=>setTimeout(apply,40));
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="overview"],[data-home-target="overview"]'))setTimeout(apply,100);
},true);
setInterval(()=>{
  const ov=document.getElementById('overview');
  if(ov?.classList.contains('active'))apply();
},1800);

window.YardivoOverviewHero3={render:apply};
})();
