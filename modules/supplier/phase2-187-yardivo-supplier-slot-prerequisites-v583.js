
(function(){
'use strict';
if(window.__YARDIVO_SUPPLIER_SLOT_PREREQUISITES_V583__)return;
window.__YARDIVO_SUPPLIER_SLOT_PREREQUISITES_V583__=true;

let lastReadySignature='', autoOpenTimer=0;
const $=id=>document.getElementById(id);
function root(){return $('yardivoSupplierPortal')}
function warehouse(){
 const r=root();
 const e=$('yspWarehouse')||r?.querySelector('select[name*="warehouse" i]');
 return String(e?.value||'').trim();
}
function date(){
 const r=root();
 const e=$('yspDate')||r?.querySelector('input[type="date"]');
 return String(e?.value||'').trim();
}
function pallets(){
 const r=root();
 const e=$('yspPallets')||r?.querySelector('input[name*="pallet" i]');
 const n=Number(e?.value||0);
 return Number.isFinite(n)&&n>0?n:0;
}
function validity(){
 const w=warehouse(),d=date(),p=pallets();
 return {w,d,p,ok:!!w&&!!d&&p>0};
}
function ensureHint(){
 const r=root();if(!r)return null;
 let h=$('yardivoSupplierSlotPrereqV583');
 if(h)return h;
 h=document.createElement('div');
 h.id='yardivoSupplierSlotPrereqV583';
 const anchor=$('yspChooseSlotV583')?.parentElement
   || $('yardivoOpenRealDayMap')?.parentElement
   || $('yspPallets')?.parentElement;
 if(anchor)anchor.insertAdjacentElement('afterend',h);
 else r.appendChild(h);
 return h;
}
function renderHint(){
 const h=ensureHint(),v=validity();if(!h)return;
 const missing=[];
 if(!v.w)missing.push('skladište');
 if(!v.d)missing.push('datum');
 if(!v.p)missing.push('broj paleta');
 h.classList.toggle('ready',v.ok);
 h.innerHTML=v.ok
   ? `SPREMNO ZA ODABIR TERMINA · ${v.w} · ${v.d.split('-').reverse().join('.')} · ${v.p} paleta`
   : `ZA PRIKAZ SLOBODNIH TERMINA UNESI: <span class="missing">${missing.join(' + ')}</span>`;
 ['yspChooseSlotV583','yardivoOpenRealDayMap'].forEach(id=>{
   const b=$(id);
   if(b){
     b.disabled=!v.ok;
     b.setAttribute('aria-disabled',v.ok?'false':'true');
     b.title=v.ok?'Prikaži slobodne termine i rampe':'Prvo odaberi skladište, datum i unesi broj paleta.';
   }
 });
 return v;
}
function closeMapIfOpen(){
 const m=$('yspSlotMapV583');
 if(m?.classList.contains('open')){
   try{
     if(window.YardivoSupplierSlotMapV583?.close)window.YardivoSupplierSlotMapV583.close();
     else m.classList.remove('open');
   }catch(_){m.classList.remove('open')}
   document.body.classList.remove('yardivo-native-slot-map-open');
 }
}
function openWhenReady(){
 clearTimeout(autoOpenTimer);
 autoOpenTimer=setTimeout(()=>{
   const v=renderHint();if(!v?.ok)return;
   const sig=`${v.w}|${v.d}|${v.p}`;
   if(sig===lastReadySignature)return;
   lastReadySignature=sig;
   try{
     window.YardivoSupplierNativeFullscreenMapV583?.open?.();
   }catch(e){console.error('[YARDIVO] supplier prerequisite auto-open',e)}
 },120);
}
function onChange(){
 const v=renderHint();
 if(!v?.ok){
   lastReadySignature='';
   closeMapIfOpen();
   return;
 }
 openWhenReady();
}
function guardButton(id){
 const b=$(id);if(!b||b.dataset.prereqGuardBound)return;
 b.dataset.prereqGuardBound='1';
 b.addEventListener('click',e=>{
   const v=validity();
   if(v.ok)return;
   e.preventDefault();e.stopImmediatePropagation();
   renderHint();
   alert('Za odabir termina prvo odaberi skladište, datum i unesi broj paleta.');
 },true);
}
function bind(){
 const r=root();if(!r)return;
 const els=[
   $('yspWarehouse')||r.querySelector('select[name*="warehouse" i]'),
   $('yspDate')||r.querySelector('input[type="date"]'),
   $('yspPallets')||r.querySelector('input[name*="pallet" i]')
 ].filter(Boolean);
 els.forEach(el=>{
   if(el.dataset.slotPrereqBound)return;
   el.dataset.slotPrereqBound='1';
   el.addEventListener('change',onChange,true);
   el.addEventListener('input',onChange,true);
 });
 const cal=$('yspMiniCal');
 if(cal&&!cal.dataset.slotPrereqBound){
   cal.dataset.slotPrereqBound='1';
   cal.addEventListener('click',()=>setTimeout(onChange,30),true);
 }
 guardButton('yspChooseSlotV583');
 guardButton('yardivoOpenRealDayMap');
 renderHint();
}
let t=0;
new MutationObserver(()=>{clearTimeout(t);t=setTimeout(bind,50)}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,100));
window.addEventListener('load',()=>setTimeout(bind,300));
bind();

window.YardivoSupplierSlotPrerequisitesV583={refresh:bind,validity};
window.YARDIVO_DEV_BUILD='20260910-dev-v5.8.3-supplier-slot-prerequisites-ux-fix';
})();
