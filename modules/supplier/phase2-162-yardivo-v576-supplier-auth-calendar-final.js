
(function(){
'use strict';
const MONTHS=['Siječanj','Veljača','Ožujak','Travanj','Svibanj','Lipanj','Srpanj','Kolovoz','Rujan','Listopad','Studeni','Prosinac'];
const WEEK=['PO','UT','SR','ČE','PE','SU','NE'];
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function human(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v||''))return '';const [y,m,d]=v.split('-');return `${d}.${m}.${y}.`}
function today0(){const d=new Date();d.setHours(0,0,0,0);return d}
function installCalendar(){
  const hidden=document.getElementById('yspDate');
  if(!hidden)return;
  const field=hidden.closest('.ysp-field')||hidden.parentElement?.parentElement||hidden.parentElement;
  if(!field)return;
  const existing=hidden.value||'';
  field.innerHTML=`<div class="ysp-field-title">ŽELJENI DATUM DOSTAVE <span class="ysp-required">*</span></div>
    <div class="ysp-date-picker-final">
      <input id="yspDateDisplay" type="text" readonly placeholder="KLIKNI ZA KALENDAR" autocomplete="off" aria-label="Odaberi datum dostave">
      <input id="yspDate" type="hidden" value="${existing}">
      <div id="yspCalendarFinal" class="ysp-cal-final" aria-label="Kalendar"></div>
    </div>
    <div class="ysp-helper">Datum se bira isključivo klikom na kalendar.</div>`;
  const h=document.getElementById('yspDate'),display=document.getElementById('yspDateDisplay'),cal=document.getElementById('yspCalendarFinal');
  if(existing)display.value=human(existing);
  let base=existing?new Date(existing+'T12:00:00'):new Date();
  base=new Date(base.getFullYear(),base.getMonth(),1);
  function draw(){
    const y=base.getFullYear(),m=base.getMonth();
    const first=new Date(y,m,1),days=new Date(y,m+1,0).getDate();
    const offset=(first.getDay()+6)%7;
    let cells='';
    for(let i=0;i<offset;i++)cells+='<span class="ysp-cal-empty"></span>';
    for(let n=1;n<=days;n++){
      const d=new Date(y,m,n),val=iso(d),past=d<today0(),sel=h.value===val;
      cells+=`<button type="button" class="ysp-cal-day${sel?' selected':''}" data-date="${val}" ${past?'disabled':''}>${n}</button>`;
    }
    cal.innerHTML=`<div class="ysp-cal-head"><button type="button" data-cal-prev>‹</button><strong>${MONTHS[m]} ${y}</strong><button type="button" data-cal-next>›</button></div><div class="ysp-cal-week">${WEEK.map(x=>`<span>${x}</span>`).join('')}</div><div class="ysp-cal-grid">${cells}</div>`;
  }
  display.addEventListener('click',()=>{cal.classList.toggle('open');draw()});
  cal.addEventListener('click',e=>{
    const prev=e.target.closest('[data-cal-prev]'),next=e.target.closest('[data-cal-next]'),day=e.target.closest('[data-date]');
    if(prev){base=new Date(base.getFullYear(),base.getMonth()-1,1);draw();return}
    if(next){base=new Date(base.getFullYear(),base.getMonth()+1,1);draw();return}
    if(day){h.value=day.dataset.date;display.value=human(h.value);cal.classList.remove('open');draw()}
  });
  document.addEventListener('click',e=>{if(!e.target.closest('.ysp-date-picker-final'))cal.classList.remove('open')},true);
  draw();
}
function enforceOptional(){
  ['yspOrder','yspPlate','yspTrailerPlate','yspDriver','yspDriverContact','yspReference','yspNote','yspTime'].forEach(id=>{const el=document.getElementById(id);if(el){el.required=false;el.removeAttribute('required')}});
  ['yspWarehouse','yspPallets','yspSkuCount'].forEach(id=>{const el=document.getElementById(id);if(el)el.required=true});
}
function install(){
  const portal=document.getElementById('yardivoSupplierPortal');if(!portal)return;
  installCalendar();enforceOptional();
  const info=portal.querySelector('.ysp-info');if(info)info.textContent='Obavezno: skladište, željeni datum, broj paleta i broj SKU-ova. Ostalo je opcionalno i može se dodati naknadno. Upravljanje zalihama nakon zahtjeva dodjeljuje termin i rampu.';
}
window.addEventListener('yardivo:login',()=>setTimeout(install,180));
window.addEventListener('load',()=>setTimeout(install,500));
const obs=new MutationObserver(()=>{if(document.body?.getAttribute('data-yardivo-role')==='supplier'&&!document.getElementById('yspCalendarFinal'))setTimeout(install,30)});
window.addEventListener('load',()=>{try{obs.observe(document.getElementById('yardivoSupplierPortal')||document.body,{childList:true,subtree:true})}catch(_){}});
window.YardivoSupplierV576={install};
})();
