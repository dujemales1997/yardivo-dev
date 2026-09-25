(function(){
'use strict';
function card(title,kind){
  let body='';
  if(kind==='daily')body='<div class="mini-map"></div>';
  if(kind==='week')body='<div class="mini-week"><i></i><i></i><i></i><i></i><i></i></div>';
  if(kind==='bars')body='<div class="mini-bars"><i></i><i></i><i></i><i></i><i></i><i></i></div>';
  if(kind==='lines')body='<div class="mini-lines"><svg viewBox="0 0 200 80" preserveAspectRatio="none"><polyline points="0,60 35,48 65,55 95,27 130,39 165,18 200,28" fill="none" stroke="#3c8dbd" stroke-width="3"/></svg></div>';
  if(kind==='epal')body='<div class="mini-epal"><div class="stack"><i></i><i></i><i></i><i></i></div><div class="score">EPAL</div></div>';
  if(kind==='list')body='<div class="mini-list"><i></i><i></i><i></i><i></i><i></i></div>';
  return `<div class="yardivo-mini-preview"><div class="yardivo-mini-head"><span>${title}</span><span>YARDIVO</span></div><div class="yardivo-mini-body">${body}</div></div>`;
}
function init(){
  const splash=document.getElementById('yardivoWelcomeSplash');
  if(!splash||splash.dataset.miniV8)return;
  splash.dataset.miniV8='1';
  const stage=document.createElement('div');stage.className='yardivo-mini-stage';
  stage.innerHTML=[
    card('Dnevna mapa','daily'),
    card('Tjedna mapa','week'),
    card('Supplier score','bars'),
    card('Control Tower','lines'),
    card('EPAL stanje','epal'),
    card('Prijam robe','list')
  ].join('');
  splash.prepend(stage);
  const items=[...stage.querySelectorAll('.yardivo-mini-preview')];
  let group=0;
  function show(){
    items.forEach(x=>{x.classList.remove('active','fade')});
    const indexes=group%2===0?[0,2,4]:[1,3,5];
    indexes.forEach((i,k)=>setTimeout(()=>items[i]?.classList.add('active'),k*90));
    setTimeout(()=>indexes.forEach(i=>{items[i]?.classList.add('fade');items[i]?.classList.remove('active')}),680);
    group++;
  }
  show();
  const timer=setInterval(show,980);
  setTimeout(()=>clearInterval(timer),5600);
}
document.addEventListener('DOMContentLoaded',init);
window.addEventListener('load',init);
})();
