(function(){
'use strict';

function simplify(){
  const root=document.getElementById('overviewExecutive');
  if(!root)return;

  const title=root.querySelector('.overview-exec-head h2');
  if(title)title.textContent='POUZDANOST DOBAVLJAČA';

  /* Keep exactly: average reliability + best supplier + worst supplier. */
  const avg=document.getElementById('ovExecReliability')?.closest('.overview-exec-kpi');
  const best=document.getElementById('ovFocusBest');
  const worst=document.getElementById('ovFocusAttention');

  if(avg){
    const label=avg.querySelector('small');
    if(label)label.textContent='PROSJEČNA POUZDANOST';
  }
  if(best){
    const label=best.querySelector('small');
    if(label)label.textContent='NAJBOLJI DOBAVLJAČ';
  }
  if(worst){
    const label=worst.querySelector('small');
    if(label)label.textContent='NAJLOŠIJI DOBAVLJAČ';
  }

  /* Rebuild only visual placement, without touching the reliability calculation. */
  let grid=root.querySelector('#yardivoOverviewSimple3');
  if(!grid){
    grid=document.createElement('div');
    grid.id='yardivoOverviewSimple3';
    grid.className='overview-exec-grid';
    const head=root.querySelector('.overview-exec-head');
    (head||root.firstElementChild)?.after(grid);
  }
  [avg,best,worst].filter(Boolean).forEach(el=>grid.appendChild(el));

  root.querySelectorAll('.overview-exec-grid').forEach(g=>{
    if(g.id!=='yardivoOverviewSimple3')g.style.setProperty('display','none','important');
  });
  root.querySelectorAll('.overview-focus-grid').forEach(g=>{
    if(g!==grid)g.style.setProperty('display','none','important');
  });
}

window.addEventListener('load',()=>setTimeout(simplify,900),{once:true});
window.addEventListener('yardivo:data-synced',()=>setTimeout(simplify,30));
window.addEventListener('yardivo:overview-refresh',()=>setTimeout(simplify,30));
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="overview"],[data-home-target="overview"]'))setTimeout(simplify,80);
},true);

window.YardivoOverviewExecutiveSimple={render:simplify};
})();
