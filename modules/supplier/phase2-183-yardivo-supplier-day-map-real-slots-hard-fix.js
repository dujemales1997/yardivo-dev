
(function(){
'use strict';
if(window.__YARDIVO_SUPPLIER_DAY_MAP_REAL_SLOTS_HARD_FIX__)return;
window.__YARDIVO_SUPPLIER_DAY_MAP_REAL_SLOTS_HARD_FIX__=true;

function root(){return document.getElementById('yardivoSupplierPortal')}
function q(sel,r=document){try{return r.querySelector(sel)}catch(_){return null}}
function dateEl(r){return q('#yspDate',r)||q('input[type="date"]',r)}
function whEl(r){return q('#yspWarehouse',r)||q('select[name*="warehouse" i]',r)}
function palEl(r){return q('#yspPallets',r)||q('input[name*="pallet" i]',r)}
function timeEl(r){return q('#yspTime',r)}
function dockEl(r){return q('#yspDock',r)}

function humanDate(v){
 try{return new Intl.DateTimeFormat('hr-HR',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(v+'T12:00:00'))}catch(_){return v}
}

/* The original planner is the source of truth. We open it instead of trying
   to reconstruct its availability result in a second planner. */
function openAuthoritativeMap(){
 const r=root(),d=dateEl(r)?.value||'';
 if(!r||!d){alert('Prvo odaberi željeni datum dostave.');return}
 const api=window.YardivoSupplierSlotMapV583;
 if(!api?.open){alert('YARDIVO mapa slobodnih termina trenutno nije dostupna.');return}

 /* Persist requested date in the visible supplier form. Existing map reads
    warehouse/pallets/form state and remains authoritative for occupancy. */
 try{api.open()}catch(e){
   console.error('[YARDIVO Supplier day map]',e);
   alert('Mapa slobodnih termina se nije mogla otvoriti: '+(e?.message||e));
   return;
 }

 /* Existing map is a 7-day planner. After it renders, hide other day groups
    where possible and visually emphasize the supplier-selected date. */
 let tries=0;
 const focus=()=>{
   tries++;
   const candidates=[...document.querySelectorAll('body *')].filter(el=>{
     if(el.closest('#yardivoSupplierPortal'))return false;
     const txt=String(el.textContent||'');
     return txt.includes(d)||txt.includes(humanDate(d));
   });
   if(candidates.length){
     const target=candidates.find(x=>/slobod|termin|ramp/i.test(String(x.parentElement?.textContent||'')))||candidates[0];
     try{target.scrollIntoView({block:'center',behavior:'smooth'})}catch(_){}
     target.style.setProperty('outline','2px solid #5eead4','important');
     target.style.setProperty('outline-offset','3px','important');
   }else if(tries<8)setTimeout(focus,120);
 };
 setTimeout(focus,80);
}

function install(){
 const r=root();if(!r)return;
 const d=dateEl(r);if(!d)return;
 const wrap=q('.yardivo-supplier-auto-slot-wrap',r);
 if(!wrap)return;

 /* Replace misleading empty pseudo-map with an explicit launch into the
    already existing authoritative YARDIVO free-slot map. */
 let launch=q('#yardivoSupplierDayMapLaunch',wrap);
 if(!launch){
   launch=document.createElement('div');
   launch.id='yardivoSupplierDayMapLaunch';
   launch.innerHTML=
     '<button type="button" class="action primary" id="yardivoOpenRealDayMap">PRIKAŽI SLOBODNE TERMINE I RAMPE</button>'+
     '<div class="yardivo-map-note">Mapa koristi stvarnu YARDIVO raspoloživost rampi, zauzeća i trajanja za odabrani datum.</div>';
   const grid=q('#yardivoSupplierDayGrid',wrap);
   if(grid)grid.insertAdjacentElement('beforebegin',launch);
   else wrap.appendChild(launch);
 }
 const b=q('#yardivoOpenRealDayMap',launch);
 if(b&&!b.dataset.bound){b.dataset.bound='1';b.onclick=openAuthoritativeMap}

 /* Date selection automatically opens the real map, per supplier workflow. */
 if(!d.dataset.realDayMapBound){
   d.dataset.realDayMapBound='1';
   const auto=()=>{
     if(!d.value)return;
     /* Let form state settle before planner reads it. */
     setTimeout(openAuthoritativeMap,120);
   };
   d.addEventListener('change',auto,true);
 }

 /* If old auto-render says "no slots", do not claim there are none.
    The real planner is authoritative. */
 const grid=q('#yardivoSupplierDayGrid',wrap);
 if(grid && /NEMA PRONAĐENIH SLOBODNIH TERMINA/i.test(grid.textContent||'')){
   grid.innerHTML='<div style="grid-column:1/-1;padding:10px;border:1px dashed #36586b;border-radius:10px;color:#a9c3d2;font-size:10px;font-weight:800">ODABERI “PRIKAŽI SLOBODNE TERMINE I RAMPE” za stvarnu dnevnu mapu. Ako ne želiš termin, nastavi samo s datumom.</div>';
 }
}
let t=0;
new MutationObserver(()=>{clearTimeout(t);t=setTimeout(install,50)}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(install,100));
window.addEventListener('load',()=>setTimeout(install,400));
install();
window.YardivoSupplierRealDayMapV583={open:openAuthoritativeMap,refresh:install};
window.YARDIVO_DEV_BUILD='20260910-dev-v5.8.3-supplier-day-map-real-slots-hard-fix';
})();
