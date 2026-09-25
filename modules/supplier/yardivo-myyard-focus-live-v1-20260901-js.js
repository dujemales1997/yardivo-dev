
(function(){
'use strict';

let snapshotMap=new Map(),snapshotReady=false,noticeTimer=0;

function anns(){
  try{return Array.isArray(announcements)?announcements:[]}catch(_){return[]}
}
function stableState(a){
  /* Operationally meaningful fields. A change in any of these produces a My Yard notice. */
  return JSON.stringify({
    supplier:a?.supplier||'',
    date:a?.date||'',time:a?.time||'',warehouse:a?.warehouse||'',dock:a?.dock||'',
    status:a?.status||'',pallets:a?.pallets??'',sku:a?.sku??'',
    orderNumber:a?.orderNumber||'',plannedPlate:a?.plannedPlate||'',arrivalPlate:a?.arrivalPlate||'',
    plannedDriver:a?.plannedDriver||'',arrivalDriver:a?.arrivalDriver||'',
    actualDate:a?.actualDate||'',actualTime:a?.actualTime||'',
    gateCheckedAt:a?.gateCheckedAt||'',yardArrivalAt:a?.yardArrivalAt||'',
    dockArrivalAt:a?.dockArrivalAt||'',unloadStartedAt:a?.unloadStartedAt||'',
    receivedAt:a?.receivedAt||'',completedAt:a?.completedAt||'',gateOutAt:a?.gateOutAt||'',
    rejectedAt:a?.rejectedAt||'',lateMinutes:a?.lateMinutes??'',arrivalType:a?.arrivalType||'',
    responsible:a?.responsible||''
  });
}
function titleOf(a){
  return String(a?.supplier||'DOBAVLJAČ');
}
function detailOf(a){
  const parts=[
    a?.warehouse||'',
    a?.dock?('R'+a.dock):'',
    a?.date||'',
    a?.time||'',
    a?.status||''
  ].filter(Boolean);
  return parts.join(' · ');
}
function ensureNotice(){
  let n=document.getElementById('yardivoMyYardLiveNotice');
  if(n)return n;
  n=document.createElement('div');
  n.id='yardivoMyYardLiveNotice';
  n.innerHTML='<small>MY YARD · LIVE PROMJENA</small><strong></strong><span></span>';
  document.body.appendChild(n);
  return n;
}
function notice(kind,title,detail){
  if(!document.body.classList.contains('yardivo-myyard-focus'))return;
  const n=ensureNotice();
  n.dataset.kind=kind;
  n.querySelector('strong').textContent=title||'PROMJENA';
  n.querySelector('span').textContent=detail||'';
  n.classList.remove('show');
  requestAnimationFrame(()=>n.classList.add('show'));
  clearTimeout(noticeTimer);
  noticeTimer=setTimeout(()=>n.classList.remove('show'),3300);
}
function scan(notify){
  const rows=anns(),next=new Map(),byId=new Map();
  rows.forEach(a=>{
    const id=String(a?.id??a?.announcement_id??'');
    if(!id)return;
    next.set(id,stableState(a));
    byId.set(id,a);
    if(notify&&snapshotReady){
      if(!snapshotMap.has(id)){
        notice('new','NOVA NAJAVA · '+titleOf(a),detailOf(a));
      }else if(snapshotMap.get(id)!==next.get(id)){
        notice('change','PROMJENA · '+titleOf(a),detailOf(a));
      }
    }
  });
  if(notify&&snapshotReady){
    snapshotMap.forEach((_,id)=>{
      if(!next.has(id)){
        notice('remove','NAJAVA UKLONJENA','ID '+id);
      }
    });
  }
  snapshotMap=next;
  snapshotReady=true;
}
function ensureControls(){
  const root=document.getElementById('myYard');
  if(!root)return;
  const toolbar=root.querySelector('.myy-toolbar');
  if(toolbar&&!toolbar.querySelector('.myy-enlarge-btn')){
    const b=document.createElement('button');
    b.type='button';
    b.className='myy-enlarge-btn';
    b.textContent='⛶ POVEĆAJ PRIKAZ';
    b.title='Prikaži samo My Yard 3D scenu';
    toolbar.appendChild(b);
  }
  if(!document.getElementById('yardivoMyYardFocusExit')){
    const x=document.createElement('button');
    x.id='yardivoMyYardFocusExit';
    x.type='button';
    x.textContent='✕ ZATVORI POVEĆANI PRIKAZ';
    document.body.appendChild(x);
  }
}
async function enter(){
  ensureControls();
  try{window.YardivoMyYardMode?.set?.('3d')}catch(_){}
  try{window.YardivoMyYardWebGL?.boot?.()}catch(_){}
  document.body.classList.add('yardivo-myyard-focus');
  document.getElementById('myYard')?.setAttribute('data-yardivo-yard-mode','3d');
  snapshotReady=false;scan(false);
  setTimeout(()=>{
    try{window.YardivoMyYardWebGL?.refresh?.()}catch(_){}
    try{
      const e=window.__YARDIVO_MYYARD_ENGINE__;
      const host=document.getElementById('yardivoMyYardWebGL');
      if(e?.renderer&&host){
        const w=Math.max(10,host.clientWidth),hh=Math.max(10,host.clientHeight);
        e.renderer.setSize(w,hh,false);
        e.camera.aspect=w/hh;e.camera.updateProjectionMatrix();
      }
    }catch(_){}
  },80);
}
function exit(){
  document.body.classList.remove('yardivo-myyard-focus');
  document.getElementById('yardivoMyYardLiveNotice')?.classList.remove('show');
  setTimeout(()=>{
    try{window.YardivoMyYardWebGL?.refresh?.()}catch(_){}
  },80);
}
function purgeWarRoom(){
  document.getElementById('yardivoWarRoom')?.remove();
  document.getElementById('yardivoWarButton')?.remove();
  document.querySelectorAll('[data-view="yardivoWarRoom"],[data-home-target="yardivoWarRoom"]').forEach(x=>x.remove());
}

document.addEventListener('click',e=>{
  const b=e.target.closest?.('#myYard .myy-enlarge-btn');
  if(b){e.preventDefault();e.stopPropagation();enter();return}
  if(e.target.closest?.('#yardivoMyYardFocusExit')){e.preventDefault();exit();return}
},true);
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&document.body.classList.contains('yardivo-myyard-focus'))exit();
},true);

window.addEventListener('yardivo:data-synced',()=>{
  scan(true);
  if(document.body.classList.contains('yardivo-myyard-focus')){
    try{window.YardivoMyYardWebGL?.refresh?.()}catch(_){}
  }
});
setInterval(()=>scan(true),2000);

window.addEventListener('load',()=>setTimeout(()=>{ensureControls();purgeWarRoom();scan(false)},1100),{once:true});
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="myYard"],[data-home-target="myYard"]'))setTimeout(ensureControls,100);
},true);

window.YardivoMyYardFocus={enter,exit,refresh:()=>scan(true)};
})();
