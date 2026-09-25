
(function(){
'use strict';
if(window.__YARDIVO_SUPPLIER_FULLSCREEN_DAY_MAP_V583__)return;
window.__YARDIVO_SUPPLIER_FULLSCREEN_DAY_MAP_V583__=true;

let originalParent=null,originalNext=null,movedNode=null;
function sr(){return document.getElementById('yardivoSupplierPortal')}
function q(sel,r=document){try{return r.querySelector(sel)}catch(_){return null}}
function selectedDate(){const r=sr();return q('#yspDate',r)?.value||q('input[type="date"]',r)?.value||''}
function shell(){
 let x=document.getElementById('yardivoSupplierFullscreenMapV583');
 if(x)return x;
 x=document.createElement('div');x.id='yardivoSupplierFullscreenMapV583';
 x.innerHTML='<div class="yfs-head"><div><div class="yfs-title">SLOBODNI TERMINI I RAMPE</div><div class="yfs-sub" id="yardivoFsMapDate">DNEVNA MAPA</div></div><button type="button" class="yfs-close" aria-label="Zatvori">✕</button></div><div class="yfs-body"><div class="yfs-host" id="yardivoFsMapHost"></div></div>';
 document.body.appendChild(x);
 q('.yfs-close',x).onclick=close;
 x.addEventListener('click',e=>{if(e.target===x)close()});
 return x;
}
function findPlanner(){
 /* Find the modal/panel created by the existing authoritative slot map.
    Exclude our fullscreen shell and supplier form itself. */
 const candidates=[...document.body.querySelectorAll('div,section')].filter(el=>{
   if(el.id==='yardivoSupplierFullscreenMapV583'||el.closest('#yardivoSupplierFullscreenMapV583'))return false;
   if(el.closest('#yardivoSupplierPortal'))return false;
   const txt=String(el.textContent||'').toUpperCase();
   if(!/SLOBODN|TERMIN|RAMPA/.test(txt))return false;
   const cs=getComputedStyle(el);
   return cs.position==='fixed'||cs.position==='absolute'||el.getAttribute('role')==='dialog';
 });
 candidates.sort((a,b)=>(b.textContent||'').length-(a.textContent||'').length);
 return candidates[0]||null;
}
function adoptPlanner(){
 let tries=0;
 const run=()=>{
   tries++;
   const planner=findPlanner();
   if(planner){
     const host=document.getElementById('yardivoFsMapHost');if(!host)return;
     if(movedNode&&movedNode!==planner)return;
     originalParent=planner.parentNode;originalNext=planner.nextSibling;movedNode=planner;
     planner.style.setProperty('position','relative','important');
     planner.style.setProperty('inset','auto','important');
     planner.style.setProperty('width','100%','important');
     planner.style.setProperty('height','100%','important');
     planner.style.setProperty('max-width','none','important');
     planner.style.setProperty('max-height','none','important');
     planner.style.setProperty('margin','0','important');
     planner.style.setProperty('transform','none','important');
     planner.style.setProperty('z-index','1','important');
     host.appendChild(planner);
   }else if(tries<15)setTimeout(run,80);
 };
 setTimeout(run,30);
}
function open(){
 const d=selectedDate();
 if(!d){alert('Prvo odaberi željeni datum dostave.');return}
 const x=shell();
 document.getElementById('yardivoFsMapDate').textContent='ODABRANI DATUM · '+d.split('-').reverse().join('.');
 x.classList.add('open');document.body.classList.add('yardivo-supplier-map-open');

 /* Existing planner remains source of truth. */
 try{
   if(window.YardivoSupplierSlotMapV583?.open)window.YardivoSupplierSlotMapV583.open();
   else throw new Error('Mapa slobodnih termina nije dostupna.');
 }catch(e){
   close();alert(e?.message||e);return;
 }
 adoptPlanner();
}
function close(){
 const x=document.getElementById('yardivoSupplierFullscreenMapV583');
 if(movedNode&&originalParent){
   try{
     if(originalNext&&originalNext.parentNode===originalParent)originalParent.insertBefore(movedNode,originalNext);
     else originalParent.appendChild(movedNode);
   }catch(_){}
 }
 movedNode=null;originalParent=null;originalNext=null;
 x?.classList.remove('open');document.body.classList.remove('yardivo-supplier-map-open');
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('yardivoSupplierFullscreenMapV583')?.classList.contains('open'))close()});

/* Override only Supplier-facing opener. Existing Inventory planner is untouched. */
function bind(){
 const r=sr();if(!r)return;
 const btn=q('#yardivoOpenRealDayMap',r);
 if(btn&&!btn.dataset.fullscreenBound){
   btn.dataset.fullscreenBound='1';
   btn.onclick=open;
 }
 const d=q('#yspDate',r)||q('input[type="date"]',r);
 if(d&&!d.dataset.fullscreenAutoBound){
   d.dataset.fullscreenAutoBound='1';
   d.addEventListener('change',()=>{if(d.value)setTimeout(open,160)},true);
 }
}
let t=0;new MutationObserver(()=>{clearTimeout(t);t=setTimeout(bind,60)}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,120));window.addEventListener('load',()=>setTimeout(bind,450));bind();
window.YardivoSupplierFullscreenDayMapV583={open,close,refresh:bind};
window.YARDIVO_DEV_BUILD='20260910-dev-v5.8.3-supplier-fullscreen-day-map-fix';
})();
