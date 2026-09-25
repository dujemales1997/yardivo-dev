
(function(){
'use strict';

function sessionObj(){
  try{return (typeof currentSession!=='undefined'?currentSession:window.currentSession)||{}}catch(e){return window.currentSession||{}}
}
function allAssignedWarehouses(){
  const s=sessionObj();
  const assigned=Array.isArray(s.warehouses)?s.warehouses.map(x=>String(x).trim().toUpperCase()).filter(Boolean):[];
  let md={warehouses:[]};try{md=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')}catch(_){}
  const active=(Array.isArray(md.warehouses)?md.warehouses:[]).filter(w=>w&&w.active!==false);
  if(String(s.location||'').toUpperCase()==='ALL')return active.map(w=>String(w.id||'').toUpperCase()).filter(Boolean);
  const valid=new Set(active.map(w=>String(w.id||'').toUpperCase()));
  return assigned.filter(id=>valid.has(id)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
}
function supplierWarehouseName(id){
  let md={warehouses:[]};try{md=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')}catch(_){}
  const x=(Array.isArray(md.warehouses)?md.warehouses:[]).find(w=>String(w?.id||'').toUpperCase()===String(id||'').toUpperCase());
  return String(x?.name||id||'');
}
function initSupplierMiniCalendar(){
  const host=document.getElementById('yspMiniCal');
  const hidden=document.getElementById('yspDate');
  const display=document.getElementById('yspDateDisplay');
  if(!host||!hidden||!display||host.dataset.ready==='1')return;
  host.dataset.ready='1';
  let selected=hidden.value||'', cursor=selected?new Date(selected+'T12:00:00'):new Date();
  const iso=d=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
  const human=v=>{if(!v)return '';const [y,m,d]=v.split('-');return `${d}.${m}.${y}.`};
  function draw(){
    const y=cursor.getFullYear(),m=cursor.getMonth(),first=new Date(y,m,1),offset=(first.getDay()+6)%7;
    const days=new Date(y,m+1,0).getDate(),prev=new Date(y,m,0).getDate();
    const mons=['Siječanj','Veljača','Ožujak','Travanj','Svibanj','Lipanj','Srpanj','Kolovoz','Rujan','Listopad','Studeni','Prosinac'];
    const dows=['P','U','S','Č','P','S','N'];
    let cells=dows.map(x=>`<div class="dow">${x}</div>`).join('');
    for(let i=0;i<42;i++){
      let n=i-offset+1,d,muted=false;
      if(n<1){d=new Date(y,m-1,prev+n);muted=true}else if(n>days){d=new Date(y,m+1,n-days);muted=true}else d=new Date(y,m,n);
      const v=iso(d);
      cells+=`<button type="button" data-date="${v}" class="${muted?'muted ':''}${v===selected?'sel ':''}${v===iso(new Date())?'today':''}">${d.getDate()}</button>`;
    }
    host.innerHTML=`<div class="ysp-cal-head"><button type="button" data-prev>‹</button><div class="ysp-cal-title">${mons[m]} ${y}</div><button type="button" data-next>›</button></div><div class="ysp-cal-grid">${cells}</div>`;
  }
  display.value=human(selected);
  display.addEventListener('click',()=>host.classList.toggle('open'));
  host.addEventListener('click',e=>{
    if(e.target.closest('[data-prev]')){cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);draw();return}
    if(e.target.closest('[data-next]')){cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);draw();return}
    const b=e.target.closest('[data-date]');if(!b)return;
    selected=b.dataset.date;hidden.value=selected;display.value=human(selected);host.classList.remove('open');draw();
  });
  document.addEventListener('click',e=>{if(!e.target.closest('.ysp-date-wrap'))host.classList.remove('open')});
  draw();
}
function rebuild(){
  const form=document.querySelector('#yardivoSupplierPortal .ysp-form');
  if(!form||form.dataset.v561==='1')return;
  form.dataset.v561='1';
  form.innerHTML=`
    <div class="ysp-form-grid">
      <div class="ysp-field">
        <div class="ysp-field-title">SKLADIŠTE <span class="ysp-required">*</span></div>
        <select id="yspWarehouse"></select>
        <div class="ysp-helper">Prikazana su sva skladišta dodijeljena vašem Supplier accountu.</div>
      </div>
      <div class="ysp-field">
        <div class="ysp-field-title">DATUM DOSTAVE <span class="ysp-required">*</span></div>
        <div class="ysp-date-wrap">
          <input id="yspDateDisplay" class="ysp-date-display" type="text" readonly placeholder="KLIKNI I ODABERI DATUM" aria-label="Odaberi datum dostave">
          <input id="yspDate" type="hidden" required>
          <div id="yspMiniCal" class="ysp-mini-cal" aria-label="Kalendar za odabir datuma"></div>
        </div>
      </div>
      <div class="ysp-field">
        <div class="ysp-field-title">BROJ PALETA <span class="ysp-required">*</span></div>
        <input id="yspPallets" type="number" min="1" step="1" inputmode="numeric" required>
      </div>
      <div class="ysp-field">
        <div class="ysp-field-title">BROJ SKU-OVA <span class="ysp-required">*</span></div>
        <input id="yspSkuCount" type="number" min="1" step="1" inputmode="numeric" required>
      </div>
      <div class="ysp-field">
        <div class="ysp-field-title">BROJ NARUDŽBE <span class="ysp-optional">OPCIONALNO</span></div>
        <input id="yspOrder" autocomplete="off" placeholder="npr. 6W...">
      </div>

      <div class="ysp-section-title">TRANSPORT · MOŽE SE DODATI NAKNADNO</div>
      <div class="ysp-field">
        <div class="ysp-field-title">TABLICE KAMIONA <span class="ysp-optional">OPCIONALNO</span></div>
        <input id="yspPlate" autocomplete="off" placeholder="npr. ZG 1234 AB">
      </div>
      <div class="ysp-field">
        <div class="ysp-field-title">TABLICE PRIKOLICE <span class="ysp-optional">OPCIONALNO</span></div>
        <input id="yspTrailerPlate" autocomplete="off" placeholder="npr. ZG 5678 CD">
      </div>
      <div class="ysp-field">
        <div class="ysp-field-title">VOZAČ <span class="ysp-optional">OPCIONALNO</span></div>
        <input id="yspDriver" autocomplete="off">
      </div>
      <div class="ysp-field">
        <div class="ysp-field-title">KONTAKT VOZAČA <span class="ysp-optional">OPCIONALNO</span></div>
        <input id="yspDriverContact" type="tel" autocomplete="off" placeholder="+385 ...">
      </div>

      <div class="ysp-section-title">DODATNI PODACI</div>
      <div class="ysp-field">
        <div class="ysp-field-title">OTPREMNICA / REFERENCA <span class="ysp-optional">OPCIONALNO</span></div>
        <input id="yspReference" autocomplete="off">
      </div>
      <div class="ysp-field span2">
        <div class="ysp-field-title">NAPOMENA <span class="ysp-optional">OPCIONALNO</span></div>
        <textarea id="yspNote" rows="3"></textarea>
      </div>
      <div class="ysp-field span2 ysp-file-field">
        <div class="ysp-field-title">DOKUMENT / OTPREMNICA <span class="ysp-optional">PDF · OPCIONALNO</span></div>
        <label class="ysp-file-drop" for="yspAttachment">
          <input id="yspAttachment" type="file" accept="application/pdf,.pdf">
          <span class="ysp-file-icon">📁</span>
          <span><strong id="yspAttachmentLabel">PRILOŽI PDF DOKUMENT</strong><small id="yspAttachmentStatus">Maksimalno 1,5 MB · samo PDF</small></span>
        </label>
      </div>
    </div>
    <input id="yspTime" type="hidden"><input id="yspDock" type="hidden">
    <div class="ysp-form-actions"><button type="button" class="btn-primary" id="yspSubmit">POŠALJI NAJAVU</button></div>`;
  const sel=document.getElementById('yspWarehouse');
  const ws=allAssignedWarehouses();
  if(sel)sel.innerHTML='<option value="">ODABERI SKLADIŠTE</option>'+ws.map(w=>`<option value="${w}">${supplierWarehouseName(w)}</option>`).join('');
  initSupplierMiniCalendar();
  document.getElementById('yspSubmit')?.addEventListener('click',()=>window.YardivoSupplierPortal?.submitV561?.());
}
function init(){setTimeout(rebuild,80)}
window.addEventListener('load',init);
window.addEventListener('yardivo:login',init);
const oldOpen=window.YardivoSupplierPortal?.open;
if(oldOpen)window.YardivoSupplierPortal.open=function(){const r=oldOpen.apply(this,arguments);setTimeout(rebuild,20);return r};
window.YardivoSupplierV561={rebuild,allAssignedWarehouses};
})();
