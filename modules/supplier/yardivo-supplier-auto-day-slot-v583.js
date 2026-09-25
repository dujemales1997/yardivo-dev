
(function(){
'use strict';
if(window.__YARDIVO_SUPPLIER_AUTO_DAY_SLOT_V583__)return;
window.__YARDIVO_SUPPLIER_AUTO_DAY_SLOT_V583__=true;

let chosen={date:'',time:'',dock:''};
let lastDate='';

function q(sel,root=document){try{return root.querySelector(sel)}catch(_){return null}}
function supplierRoot(){return document.getElementById('yardivoSupplierPortal')}
function dateInput(root){
  return q('#yspDate',root) ||
         q('input[type="date"][name*="date" i]',root) ||
         [...root.querySelectorAll('input[type="date"]')][0] || null;
}
function timeInput(root){return q('#yspTime',root)}
function dockInput(root){return q('#yspDock',root)}
function whValue(root){
  const el=q('#yspWarehouse',root)||q('select[name*="warehouse" i]',root);
  return String(el?.value||'').toUpperCase().trim();
}
function palletsValue(root){
  const el=q('#yspPallets',root)||q('input[name*="pallet" i]',root);
  const n=Number(el?.value||0);
  return Number.isFinite(n)&&n>0?n:1;
}
function ensureWrap(root){
  let w=q('.yardivo-supplier-auto-slot-wrap',root);
  if(w)return w;
  const date=dateInput(root);
  if(!date)return null;
  w=document.createElement('div');
  w.className='yardivo-supplier-auto-slot-wrap';
  w.hidden=true;
  w.innerHTML=
    '<div class="yardivo-supplier-auto-slot-head">'+
      '<div><div class="yardivo-supplier-auto-slot-title">SLOBODNI TERMINI I RAMPE</div>'+
      '<div class="yardivo-supplier-auto-slot-sub">Odaberi slobodan termin za datum koji si izabrao.</div></div>'+
      '<div id="yardivoSupplierChosenSlot" style="font-size:10px;font-weight:1000;color:#5eead4">NIJE ODABRAN TERMIN</div>'+
    '</div>'+
    '<div id="yardivoSupplierDayGrid" class="yardivo-supplier-day-grid"></div>'+
    '<div class="yardivo-supplier-date-only">'+
      '<button type="button" class="action" id="yardivoSupplierDateOnlyBtn">NASTAVI SAMO S DATUMOM</button>'+
    '</div>';
  date.parentElement?.insertAdjacentElement('afterend',w);
  q('#yardivoSupplierDateOnlyBtn',w).onclick=()=>{
    chosen={date:date.value||'',time:'',dock:''};
    const ti=timeInput(root),di=dockInput(root);
    if(ti){ti.value='';ti.dispatchEvent(new Event('change',{bubbles:true}))}
    if(di){di.value='';di.dispatchEvent(new Event('change',{bubbles:true}))}
    q('#yardivoSupplierChosenSlot',w).textContent='SAMO DATUM · TERMIN ODREĐUJU ZALIHE';
    w.querySelectorAll('.yardivo-supplier-slot.selected').forEach(x=>x.classList.remove('selected'));
  };
  return w;
}
function fmtTime(t){
  const m=String(t||'').match(/(\d{1,2}):(\d{2})/);
  return m?`${m[1].padStart(2,'0')}:${m[2]}`:String(t||'');
}
function parseFree(raw,date){
  let arr=[];
  if(Array.isArray(raw))arr=raw;
  else if(Array.isArray(raw?.slots))arr=raw.slots;
  else if(Array.isArray(raw?.free))arr=raw.free;
  else if(Array.isArray(raw?.items))arr=raw.items;
  return arr.map(x=>{
    if(typeof x==='string'){
      const m=x.match(/(\d{1,2}:\d{2}).*?(?:R|RAMPA\s*)?(\d+)/i);
      return {date,time:m?.[1]||x,dock:m?.[2]?`R${m[2]}`:''};
    }
    return {
      ...x,
      date:String(x?.date||x?.day||date||'').slice(0,10),
      time:fmtTime(x?.time||x?.start||x?.slot||x?.startTime||''),
      dock:String(x?.dock||x?.ramp||x?.rampa||x?.rampName||'').trim(),
      available:x?.available!==false && x?.free!==false && !x?.blocked
    };
  }).filter(x=>!date||!x.date||x.date===date);
}
async function getFree(root,date){
  const api=window.YardivoSupplierSlotMapV583;
  if(!api?.free)return [];
  const wh=whValue(root),pallets=palletsValue(root);
  const tries=[
    ()=>api.free({date,warehouse:wh,pallets}),
    ()=>api.free(date,wh,pallets),
    ()=>api.free(date),
    ()=>api.free()
  ];
  for(const fn of tries){
    try{
      const r=await Promise.resolve(fn());
      const parsed=parseFree(r,date);
      if(parsed.length)return parsed;
    }catch(_){}
  }
  return [];
}
async function render(root,date){
  const wrap=ensureWrap(root);
  if(!wrap)return;
  if(!date){wrap.hidden=true;return}
  wrap.hidden=false;
  const grid=q('#yardivoSupplierDayGrid',wrap);
  const stat=q('#yardivoSupplierChosenSlot',wrap);
  if(grid)grid.innerHTML='<div style="font-size:10px;color:#8fb3c7;font-weight:800">UČITAVAM SLOBODNE TERMINE…</div>';
  const slots=await getFree(root,date);
  if(dateInput(root)?.value!==date)return;

  if(!slots.length){
    grid.innerHTML='<div style="grid-column:1/-1;padding:12px;border:1px dashed #36586b;border-radius:10px;color:#a9c3d2;font-size:10px;font-weight:800">NEMA PRONAĐENIH SLOBODNIH TERMINA ZA OVAJ DATUM. Možeš nastaviti samo s datumom i Zalihe će predložiti termin.</div>';
    return;
  }
  grid.innerHTML='';
  slots.forEach(slot=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='yardivo-supplier-slot'+(slot.available===false?' disabled':'');
    b.disabled=slot.available===false;
    const dock=slot.dock||'Rampa po rasporedu';
    b.innerHTML=`<div class="yardivo-supplier-slot-time">${fmtTime(slot.time)||'Termin'}</div><div class="yardivo-supplier-slot-ramp">${dock}</div>`;
    b.onclick=()=>{
      grid.querySelectorAll('.yardivo-supplier-slot.selected').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
      chosen={date,time:fmtTime(slot.time),dock:slot.dock||''};
      const ti=timeInput(root),di=dockInput(root);
      if(ti){ti.value=chosen.time;ti.dispatchEvent(new Event('change',{bubbles:true}))}
      if(di){di.value=chosen.dock;di.dispatchEvent(new Event('change',{bubbles:true}))}
      stat.textContent=`ODABRANO · ${chosen.time}${chosen.dock?' · '+chosen.dock:''}`;
    };
    grid.appendChild(b);
  });
}
function bind(){
  const root=supplierRoot(); if(!root)return;
  const date=dateInput(root); if(!date)return;
  ensureWrap(root);
  if(!date.dataset.yardivoAutoSlotBound){
    date.dataset.yardivoAutoSlotBound='1';
    const ondate=()=>{
      const d=date.value||'';
      if(d===lastDate && d)return;
      lastDate=d;
      chosen={date:d,time:'',dock:''};
      const ti=timeInput(root),di=dockInput(root);
      if(ti)ti.value='';
      if(di)di.value='';
      render(root,d);
    };
    date.addEventListener('change',ondate,true);
    date.addEventListener('input',ondate,true);
  }
  /* warehouse/pallet changes recalc current selected date */
  [q('#yspWarehouse',root),q('#yspPallets',root)].filter(Boolean).forEach(el=>{
    if(el.dataset.yardivoAutoSlotRefresh)return;
    el.dataset.yardivoAutoSlotRefresh='1';
    el.addEventListener('change',()=>{const d=date.value||'';if(d)render(root,d)},true);
  });
  if(date.value && !lastDate){lastDate=date.value;render(root,date.value)}
}
function contrast(){
  const root=supplierRoot();if(!root)return;
  /* Catch dynamically rendered history cards with inline white backgrounds. */
  [...root.querySelectorAll('*')].forEach(el=>{
    const txt=String(el.textContent||'').trim().toUpperCase();
    if(!txt)return;
    if(/^(STANJE NAJAVE|STANJE ISPORUKE)$/.test(txt)){
      const box=el.parentElement;
      if(box){
        box.style.setProperty('background','#0b2230','important');
        box.style.setProperty('color','#e8f7ff','important');
        box.style.setProperty('border-color','#29485d','important');
        [...box.querySelectorAll('*')].forEach(c=>c.style.setProperty('color','#e8f7ff','important'));
      }
    }
  });
}
let tm=0;
new MutationObserver(()=>{
  clearTimeout(tm);tm=setTimeout(()=>{bind();contrast()},60);
}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{bind();contrast()},120));
window.addEventListener('load',()=>setTimeout(()=>{bind();contrast()},500));
window.addEventListener('yardivo:data-synced',()=>setTimeout(()=>{bind();contrast()},80));
bind();contrast();
window.YardivoSupplierAutoDaySlotV583={refresh:bind,render:()=>{const r=supplierRoot(),d=dateInput(r||document)?.value;if(r&&d)return render(r,d)},chosen:()=>({...chosen})};
window.YARDIVO_DEV_BUILD='20260910-dev-v5.8.3-supplier-auto-day-slot-history-contrast-fix';
})();
