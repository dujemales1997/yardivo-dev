
(function(){
'use strict';

function anns(){try{return Array.isArray(announcements)?announcements:[]}catch(e){return[]}}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function fmt(v){if(!v)return'—';const d=new Date(v);return isNaN(d)?String(v):d.toLocaleString('hr-HR')}
function val(v){return v===undefined||v===null||v===''?'—':v}
function field(k,v,cls=''){return `<div class="yod-field ${cls}"><small>${esc(k)}</small><strong>${esc(val(v))}</strong></div>`}
function status(a){try{return operationalPlanStatus(a)||normalizedPlanStatus(a)||a.status||''}catch(e){return a.status||''}}
function delay(a){try{return operationalDelayText(a)||''}catch(e){return''}}
function plate(a){try{return effectivePlate(a)||a.plannedPlate||a.vehiclePlate||a.plate||''}catch(e){return a.plannedPlate||a.vehiclePlate||a.plate||''}}
function driver(a){try{return effectiveDriver(a)||a.plannedDriver||a.driver||a.driverName||''}catch(e){return a.plannedDriver||a.driver||a.driverName||''}}

function makeModal(id,label){
  let m=document.getElementById(id);if(m)return m;
  m=document.createElement('div');m.id=id;
  m.innerHTML=`<div class="yod-dialog" role="dialog" aria-modal="true" aria-label="${label}"><div class="yod-head"></div><div class="yod-body"></div></div>`;
  document.body.appendChild(m);
  m.onclick=e=>{if(e.target===m)closeModal(m)};
  return m;
}
function closeModal(m){m?.classList.remove('open');if(!document.querySelector('#yardivoRampModal.open,#yardivoReceivingModal.open'))document.body.style.overflow=''}

/* ---------- DAILY MAP: whole ramp ---------- */
function openRamp(dock){
  dock=Number(dock);if(!dock)return;
  const date=typeof dailyMapDateValue==='function'?dailyMapDateValue():document.getElementById('dailyMapDate')?.value;
  const wh=typeof dailyMapWarehouseCode==='function'?dailyMapWarehouseCode():document.getElementById('dailyMapWarehouseSelect')?.value;
  const items=anns().filter(a=>a.date===date&&(a.warehouse||yardivoCanonicalWarehouseV583())===wh&&Number(a.dock)===dock)
    .sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
  const m=makeModal('yardivoRampModal','Detalji rampe'),h=m.querySelector('.yod-head'),b=m.querySelector('.yod-body');
  h.innerHTML=`<div><h3>RAMPA ${dock} · ${items.length} NAJAVA</h3><small>${esc(date||'')} · ${esc(typeof whLabel==='function'?whLabel(wh):wh||'')}</small></div><button type="button" class="yod-close">×</button>`;
  b.innerHTML=items.length?`<div class="yod-ramp-list">${items.map(a=>`
    <div class="yod-ramp-item" data-yod-ann="${a.id}" title="Klikni za detalje najave">
      <div><small>TERMIN</small><strong>${esc(a.time||'—')}</strong></div>
      <div><small>DOBAVLJAČ</small><strong>${esc(a.supplier||'—')}</strong></div>
      <div><small>STATUS</small><strong>${esc(status(a))}</strong></div>
      <div><small>PALETE</small><strong>${Number(a.pallets||0)}</strong></div>
      <div><small>NARUDŽBA</small><strong>${esc(a.orderNumber||'—')}</strong></div>
      <div><small>TABLICE</small><strong>${esc(plate(a)||'—')}</strong></div>
    </div>`).join('')}</div>`:'<div class="yod-ramp-empty">Na ovoj rampi nema najavljenih dolazaka za odabrani dan.</div>';
  h.querySelector('.yod-close').onclick=()=>closeModal(m);
  b.querySelectorAll('[data-yod-ann]').forEach(x=>x.onclick=()=>openReceiving(Number(x.dataset.yodAnn),false));
  m.classList.add('open');document.body.style.overflow='hidden';
}

/* ---------- RECEIVING: single appointment ---------- */
function openReceiving(id,allowActions=true){
  const a=anns().find(x=>String(x.id)===String(id));if(!a)return;
  const m=makeModal('yardivoReceivingModal','Detalji prijama robe'),h=m.querySelector('.yod-head'),b=m.querySelector('.yod-body');
  const st=typeof normalizedPlanStatus==='function'?normalizedPlanStatus(a):a.status||'';
  const qrLocked=typeof yardivoQrMobileEnabled==='function' ? yardivoQrMobileEnabled(a.warehouse||receivingWarehouseValue()) : true;
  const roleEditable=typeof canChangeReceptionStatus==='function' ? canChangeReceptionStatus() : false;
  const editable=allowActions && roleEditable && !qrLocked;

  const whDisplay=(typeof warehouseOptionLabel==='function'?warehouseOptionLabel(a.warehouse||''):a.warehouse)||'—';
  h.innerHTML=`<div><h3>${esc(a.supplier||'NAJAVA')}</h3><small>${esc(a.date||'')} · ${esc(a.time||'—')} · ${esc(whDisplay)} · R${esc(a.dock||'—')}</small></div><button type="button" class="yod-close">×</button>`;
  b.innerHTML=`<div class="yod-grid">
    ${field('Dobavljač',a.supplier)}
    ${field('Datum',a.date)}
    ${field('Planirani termin',a.time)}
    ${field('Status',st)}
    ${field('Skladište',whDisplay)}
    ${field('Rampa',a.dock?'R'+a.dock:'—')}
    ${field('Narudžba',a.orderNumber)}
    ${field('Tip dolaska',a.arrivalType==='UNANNOUNCED'?'Nenajavljeni':'Najavljeni')}
    ${field('Tablice',plate(a))}
    ${field('Vozač',driver(a))}
    ${field('Palete',Number(a.pallets||0))}
    ${field('SKU',Number(a.sku||0))}
    ${field('Kašnjenje',delay(a)||'—')}
    ${field('Stvarni dolazak',[a.actualDate,a.actualTime].filter(Boolean).join(' '))}
    ${field('Ulaz u dvorište',fmt(a.yardArrivalAt))}
    ${field('Dolazak na rampu',fmt(a.dockArrivalAt))}
    ${field('Zaprimljeno',fmt(a.receivedAt))}
    ${field('Odbijeno',fmt(a.rejectedAt))}
    ${field('Odgovorna osoba',a.responsible||a.owner)}
    ${field('Napomena',a.note||a.notes||a.unannouncedNote,'yod-note')}
  </div>
  ${allowActions?`<div class="yod-actions">
    <button type="button" data-status="Na rampi" ${editable?'':'disabled'} class="${st==='Na rampi'?'active':''}">NA RAMPI</button>
    <button type="button" data-status="Zaprimljeno" ${editable?'':'disabled'} class="${st==='Zaprimljeno'?'active':''}">ZAPRIMLJEN</button>
    <button type="button" data-status="Odbijen" ${editable?'':'disabled'} class="${st==='Odbijen'?'active':''}">ODBIJEN</button>
    ${editable?'':`<span style="font-size:8px;color:#748f9f;align-self:center">${qrLocked?'QR scanner je uključen za ovo skladište. Ručna promjena statusa je zaključana.':'Tvoja uloga ima samo pregled.'}</span>`}
  </div>`:''}`;

  h.querySelector('.yod-close').onclick=()=>closeModal(m);
  b.querySelectorAll('[data-status]').forEach(btn=>btn.onclick=()=>{
    if(!editable)return;
    const next=btn.dataset.status;
    window.setReceivingAnnouncementStatus?.(a.id,next);
    setTimeout(()=>openReceiving(a.id,true),30);
  });
  m.classList.add('open');document.body.style.overflow='hidden';
}

document.addEventListener('click',e=>{
  const ramp=e.target.closest('[data-daily-ramp]');
  if(ramp){e.preventDefault();openRamp(ramp.dataset.dailyRamp);return}

  const row=e.target.closest('.receiving-row[data-receiving-announcement-id]');
  if(row && !e.target.closest('.receiving-status-actions button')){
    e.preventDefault();openReceiving(Number(row.dataset.receivingAnnouncementId),true);
  }
},true);

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    closeModal(document.getElementById('yardivoRampModal'));
    closeModal(document.getElementById('yardivoReceivingModal'));
  }
  if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('[data-daily-ramp]')){
    e.preventDefault();openRamp(e.target.dataset.dailyRamp);
  }
  if((e.key==='Enter'||e.key===' ')&&e.target.matches?.('.receiving-row[data-receiving-announcement-id]')&&!e.target.closest('button')){
    e.preventDefault();openReceiving(Number(e.target.dataset.receivingAnnouncementId),true);
  }
});

/* Existing capacity-card click now opens the same enlarged modal too. */
window.openDailyRampDetail=function(dock){openRamp(dock)};
window.YardivoOperationalDrilldown={openRamp,openReceiving};
})();
