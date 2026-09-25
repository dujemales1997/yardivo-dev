
(function(){
'use strict';
if(window.__YARDIVO_SUPPLIER_NATIVE_FULLSCREEN_MAP_FINAL_V583__)return;
window.__YARDIVO_SUPPLIER_NATIVE_FULLSCREEN_MAP_FINAL_V583__=true;

let lastDate='', autoTimer=0, pollingTimer=0;
const $=id=>document.getElementById(id);

function root(){return $('yardivoSupplierPortal')}
function dateValue(){return String($('yspDate')?.value||'').trim()}
function portalVisible(){
 const r=root();if(!r)return false;
 const cs=getComputedStyle(r);
 return cs.display!=='none' && cs.visibility!=='hidden';
}
function removeObsoleteInline(){
 root()?.querySelectorAll('.yardivo-supplier-auto-slot-wrap').forEach(x=>x.remove());
}
function enhanceNativeModal(){
 const m=$('yspSlotMapV583');
 if(!m)return;
 const on=()=>document.body.classList.add('yardivo-native-slot-map-open');
 const off=()=>document.body.classList.remove('yardivo-native-slot-map-open');
 new MutationObserver(()=>m.classList.contains('open')?on():off()).observe(m,{attributes:true,attributeFilter:['class']});
 if(m.classList.contains('open'))on();
}

function openNativeMap(){
 removeObsoleteInline();
 if(!portalVisible())return;
 const d=dateValue();
 if(!d)return;
 const api=window.YardivoSupplierSlotMapV583;
 if(!api?.open)return;

 /* Existing planner requires pallet count. Supplier UX should still open on date.
    If pallets are not entered yet, use 1 only for this preview and restore blank
    immediately after planner has rendered. */
 const p=$('yspPallets');
 const had=String(p?.value||'').trim();
 let preview=false;
 if(p && (!had || Number(had)<1)){
   p.value='1';
   preview=true;
 }
 try{
   api.open();
   document.body.classList.add('yardivo-native-slot-map-open');
   const sub=$('ysmSub');
   if(preview && sub){
     sub.textContent += ' · PREVIEW (upiši broj paleta za točno trajanje termina)';
   }
 }catch(e){
   console.error('[YARDIVO] supplier native slot map open',e);
 }finally{
   if(preview && p)p.value=had;
 }
}

/* Hidden #yspDate is changed by the custom mini calendar.
   Watch BOTH events and value changes, because legacy calendar code does not
   consistently emit the same DOM event in every path. */
function onDatePotentialChange(){
 clearTimeout(autoTimer);
 autoTimer=setTimeout(()=>{
   removeObsoleteInline();
   const d=dateValue();
   if(!d || d===lastDate)return;
   lastDate=d;
   openNativeMap();
 },60);
}
function bind(){
 removeObsoleteInline();
 enhanceNativeModal();

 const d=$('yspDate');
 if(d && !d.dataset.nativeFullscreenFinalBound){
   d.dataset.nativeFullscreenFinalBound='1';
   d.addEventListener('change',onDatePotentialChange,true);
   d.addEventListener('input',onDatePotentialChange,true);
 }

 const cal=$('yspMiniCal');
 if(cal && !cal.dataset.nativeFullscreenFinalBound){
   cal.dataset.nativeFullscreenFinalBound='1';
   cal.addEventListener('click',()=>setTimeout(onDatePotentialChange,20),true);
   cal.addEventListener('pointerup',()=>setTimeout(onDatePotentialChange,20),true);
 }

 const display=$('yspDateDisplay');
 if(display && !display.dataset.nativeFullscreenFinalBound){
   display.dataset.nativeFullscreenFinalBound='1';
   display.addEventListener('change',()=>setTimeout(onDatePotentialChange,20),true);
 }

 /* Existing manual open button must always use the native authoritative map. */
 ['yspChooseSlotV583','yardivoOpenRealDayMap'].forEach(id=>{
   const b=$(id);
   if(b && !b.dataset.nativeFullscreenFinalBound){
     b.dataset.nativeFullscreenFinalBound='1';
     b.onclick=e=>{e?.preventDefault?.();openNativeMap()};
   }
 });

 /* Old custom fullscreen wrapper is no longer needed. */
 const old=$('yardivoSupplierFullscreenMapV583');
 if(old)old.remove();
}

/* Poll only while Supplier portal exists to catch hidden input value mutation
   that doesn't emit any event. */
function startPolling(){
 if(pollingTimer)return;
 pollingTimer=setInterval(()=>{
   if(!root())return;
   removeObsoleteInline();
   const d=dateValue();
   if(d && d!==lastDate && portalVisible()){
     lastDate=d;
     openNativeMap();
   }
 },250);
}

let moTimer=0;
new MutationObserver(()=>{
 clearTimeout(moTimer);
 moTimer=setTimeout(bind,40);
}).observe(document.documentElement,{childList:true,subtree:true});

document.addEventListener('DOMContentLoaded',()=>{setTimeout(bind,80);startPolling()});
window.addEventListener('load',()=>{setTimeout(bind,250);startPolling()});
window.addEventListener('yardivo:login',()=>setTimeout(bind,120));
bind();startPolling();

window.YardivoSupplierNativeFullscreenMapV583={
 open:openNativeMap,
 refresh:bind
};
window.YARDIVO_DEV_BUILD='20260910-dev-v5.8.3-supplier-native-fullscreen-map-final-fix';
})();
