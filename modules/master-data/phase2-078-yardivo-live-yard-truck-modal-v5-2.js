
(function(){
'use strict';

function A(){try{return Array.isArray(announcements)?announcements:[]}catch(e){return[]}}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function plate(a){try{return effectivePlate(a)||a.plannedPlate||a.arrivalPlate||'—'}catch(e){return a.plannedPlate||a.arrivalPlate||'—'}}
function status(a){
  const s=String(a.status||'').toLowerCase();
  if(a.receivedAt)return'ZAPRIMLJEN';
  if(a.rejectedAt)return'ODBIJEN';
  if(a.dockArrivalAt||/rampi/.test(s))return'NA RAMPI';
  if(a.yardArrivalAt||/dvori/.test(s))return'U DVORIŠTU';
  if(a.gateCheckedAt||a.gateEntryApprovedAt||a.actualDate||a.actualTime||/ulaz|port/.test(s))return'NA ULAZU';
  return'NAJAVLJEN';
}
function delay(a){try{return Math.max(0,Number(delayMinutes(a)||0))}catch(e){return 0}}
function dwell(a){
  if(!a.yardArrivalAt)return'—';
  const m=Math.max(0,Math.floor((Date.now()-new Date(a.yardArrivalAt).getTime())/60000));
  return Number.isFinite(m)?m+' min':'—';
}
function fmt(v){
  if(!v)return'—';
  const d=new Date(v);
  return isNaN(d)?String(v):d.toLocaleString('hr-HR');
}
function field(k,v,wide=false){
  return `<div class="lytm-field ${wide?'wide':''}"><small>${esc(k)}</small><strong>${esc(v===undefined||v===null||v===''?'—':v)}</strong></div>`;
}
function modal(){
  let m=document.getElementById('yardivoLiveTruckModal');
  if(m)return m;
  m=document.createElement('div');
  m.id='yardivoLiveTruckModal';
  m.innerHTML='<div class="lytm-card" role="dialog" aria-modal="true"><div class="lytm-head"></div><div class="lytm-body"></div></div>';
  document.body.appendChild(m);
  m.addEventListener('click',e=>{if(e.target===m)close()});
  return m;
}
function open(id){
  const a=A().find(x=>String(x.id)===String(id));if(!a)return;
  const m=modal(),head=m.querySelector('.lytm-head'),body=m.querySelector('.lytm-body');
  head.innerHTML=`<div><h2>${esc(a.supplier||'Dobavljač')}</h2><small>LIVE YARD · DETALJI KAMIONA</small></div><button type="button" class="lytm-close">×</button>`;
  body.innerHTML=`<span class="lytm-status">${esc(status(a))}</span>
  <div class="lytm-grid">
    ${field('Registracija',plate(a))}
    ${field('Narudžba',a.orderNumber||'—')}
    ${field('Termin',(a.date||'')+' '+(a.time||''))}
    ${field('Skladište',a.warehouse||'—')}
    ${field('Rampa',a.dock?'R'+a.dock:'—')}
    ${field('Palete',Number(a.pallets||0))}
    ${field('SKU',Number(a.sku||0))}
    ${field('Kašnjenje',delay(a)+' min')}
    ${field('Dwell',dwell(a))}
    ${field('Vozač',a.plannedDriver||a.arrivalDriver||a.driver||'—')}
    ${field('Ulaz u dvorište',fmt(a.yardArrivalAt))}
    ${field('Dolazak na rampu',fmt(a.dockArrivalAt))}
    ${field('Napomena',a.note||a.notes||a.unannouncedNote||'—',true)}
  </div>
  <div class="lytm-footer"><button type="button" data-lytm-close>ZATVORI</button></div>`;
  head.querySelector('.lytm-close').onclick=close;
  body.querySelector('[data-lytm-close]').onclick=close;
  m.classList.add('open');
  document.body.style.overflow='hidden';
}
function close(){
  document.getElementById('yardivoLiveTruckModal')?.classList.remove('open');
  document.body.style.overflow='';
}
document.addEventListener('click',e=>{
  const truck=e.target.closest('#liveYardStage[data-viewmode="3d"] [data-ly5-id]');
  if(!truck)return;
  e.preventDefault();
  e.stopPropagation();
  open(truck.dataset.ly5Id);
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
window.YardivoLiveTruckModal={open,close};
})();
