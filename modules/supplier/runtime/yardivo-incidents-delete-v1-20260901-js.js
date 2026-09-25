(function(){
'use strict';

function role(){
  try{return String(currentSession?.role||'').toLowerCase().trim()}catch(_){return''}
}
function canDelete(){return role()==='admin'}

function refreshIncidentUi(){
  try{renderIncidents?.()}catch(_){}
  try{renderOverview?.()}catch(_){}
  try{window.YardivoOverviewMaster?.render?.()}catch(_){}
  try{window.YardivoOverviewFullChart?.render?.()}catch(_){}
  try{render?.()}catch(_){}
  try{window.dispatchEvent(new CustomEvent('yardivo:overview-refresh'))}catch(_){}
}

async function removeOne(id){
  if(!canDelete()){alert('Samo Admin može brisati incidente.');return}
  const item=(Array.isArray(incidents)?incidents:[]).find(x=>String(x?.id)===String(id));
  if(!item)return;
  if(!confirm(`Obrisati incident${item.supplier?' · '+item.supplier:''}?`))return;

  incidents=incidents.filter(x=>String(x?.id)!==String(id));
  try{saveIncidents()}catch(_){}
  refreshIncidentUi();
}

async function removeAll(){
  if(!canDelete()){alert('Samo Admin može obrisati sve incidente.');return}
  const count=Array.isArray(incidents)?incidents.length:0;
  if(!count){alert('Nema incidenata za brisanje.');return}

  const ok=confirm(`Izbrisati SVIH ${count} incidenata?\n\nOva radnja briše kompletnu evidenciju incidenata.`);
  if(!ok)return;
  const typed=prompt('Za konačnu potvrdu upiši: OBRISI INCIDENTE');
  if(typed===null)return;
  const normalized=typed.trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(normalized!=='OBRISI INCIDENTE'){alert('Brisanje nije izvršeno.');return}

  incidents=[];
  try{saveIncidents()}catch(_){}
  refreshIncidentUi();

  if(typeof showYmsToast==='function'){
    showYmsToast('success','INCIDENTI OBRISANI','Kompletna evidencija incidenata je obrisana.',3500);
  }
}

function addDeleteAllButton(){
  const view=document.getElementById('incidents');
  if(!view)return;
  const panel=[...view.querySelectorAll('.panel')].find(p=>p.querySelector('#incidentTable'));
  const head=panel?.querySelector('.panel-head');
  if(!head||document.getElementById('yardivoDeleteAllIncidents'))return;

  const b=document.createElement('button');
  b.type='button';
  b.id='yardivoDeleteAllIncidents';
  b.className='action';
  b.textContent='OBRIŠI SVE INCIDENTE';
  b.style.display=canDelete()?'inline-flex':'none';
  b.addEventListener('click',e=>{
    e.preventDefault();e.stopPropagation();
    removeAll();
  });
  head.appendChild(b);
}

/* Canonical single-delete handler: keep the existing OBRIŠI action but add confirmation + Admin guard. */
window.deleteIncident=removeOne;

window.addEventListener('load',()=>setTimeout(addDeleteAllButton,1000),{once:true});
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="incidents"],[data-home-target="incidents"]'))setTimeout(addDeleteAllButton,80);
},true);

window.YardivoIncidentDelete={one:removeOne,all:removeAll};
})();
