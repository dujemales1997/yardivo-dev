
(function(){
'use strict';
if(window.__YARDIVO_SUPPLIER_DAILY_MAP_BUTTON_FINAL_V583__)return;
window.__YARDIVO_SUPPLIER_DAILY_MAP_BUTTON_FINAL_V583__=true;

let selected=null,lastAutoSignature='';
const $=id=>document.getElementById(id);
const hm=v=>String(v||'').slice(0,5);
const mn=t=>{const a=String(t||'00:00').split(':').map(Number);return (a[0]||0)*60+(a[1]||0)};
const tm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');

function portal(){return $('yardivoSupplierPortal')}
function wh(){return String($('yspWarehouse')?.value||'').toUpperCase().trim()}
function date(){return String($('yspDate')?.value||'').trim()}
function pallets(){const n=Number($('yspPallets')?.value||0);return Number.isFinite(n)&&n>0?n:0}
function valid(){const w=wh(),d=date(),p=pallets();return{w,d,p,ok:!!w&&!!d&&p>0}}
function fmtDate(d){try{return new Date(d+'T12:00:00').toLocaleDateString('hr-HR',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})}catch(_){return d}}

function removeLegacy(){
 portal()?.querySelectorAll('.ysp-slot-planner-v583,.yardivo-supplier-auto-slot-wrap,#yardivoSupplierSlotPrereqV583').forEach(x=>x.remove());
 const old=$('yardivoSupplierFullscreenMapV583');if(old)old.remove();
 const native=$('yspSlotMapV583');if(native)native.classList.remove('open');
 document.body.classList.remove('yardivo-native-slot-map-open','yardivo-supplier-map-open');
}
function ensureControl(){
 const r=portal();if(!r)return null;
 removeLegacy();
 let box=$('yardivoSupplierSlotControlV583');if(box)return box;
 const form=$('yspNewForm')||r.querySelector('form')||r.querySelector('.ysp-form-card');
 if(!form)return null;
 const palletsEl=$('yspPallets');
 if(!palletsEl)return null;
 box=document.createElement('div');
 box.id='yardivoSupplierSlotControlV583';
 box.innerHTML=
   '<div class="ysc-title">ŽELJENI TERMIN I RAMPA</div>'+
   '<div class="ysc-help">Slobodni termini mogu se prikazati tek kada odabereš skladište i datum te uneseš broj paleta.</div>'+
   '<div class="ysc-state" id="yardivoSupplierSlotStateV583">NEDOSTAJU PODACI</div>'+
   '<button type="button" id="yardivoSupplierShowFreeSlotsV583">POKAŽI SLOBODNE TERMINE</button>';
 const anchor=palletsEl.closest('.field,.form-field,.ysp-field')||palletsEl.parentElement;
 (anchor||form).insertAdjacentElement('afterend',box);
 $('yardivoSupplierShowFreeSlotsV583').onclick=open;
 refresh();
 return box;
}
function refresh(){
 ensureControl();
 const v=valid(),st=$('yardivoSupplierSlotStateV583'),btn=$('yardivoSupplierShowFreeSlotsV583');
 const miss=[];
 if(!v.w)miss.push('skladište');
 if(!v.d)miss.push('datum');
 if(!v.p)miss.push('broj paleta');
 if(st){
   if(v.ok){
     st.classList.add('ready');
     st.textContent=selected
       ? `ODABRANO · ${selected.date} · ${selected.time} · R${selected.dock}`
       : `SPREMNO · ${v.w} · ${fmtDate(v.d)} · ${v.p} paleta`;
   }else{
     st.classList.remove('ready');
     st.textContent='UNESI: '+miss.join(' + ');
   }
 }
 if(btn){
   btn.disabled=!v.ok;
   btn.title=v.ok?'Prikaži dnevnu mapu slobodnih termina':'Prvo unesi skladište, datum i broj paleta.';
 }
 return v;
}
function ensureModal(){
 let m=$('yardivoSupplierDailyMapV583');if(m)return m;
 m=document.createElement('div');m.id='yardivoSupplierDailyMapV583';m.setAttribute('aria-hidden','true');
 m.innerHTML=
   '<div class="ysdm-head"><div><div class="ysdm-title">DNEVNA MAPA · SLOBODNI TERMINI I RAMPE</div><div class="ysdm-sub" id="ysdmSub"></div></div><button type="button" class="ysdm-close" id="ysdmClose">✕</button></div>'+
   '<div class="ysdm-info" id="ysdmInfo"></div>'+
   '<div class="ysdm-scroll"><div id="ysdmBoard"></div></div>'+
   '<div class="ysdm-foot"><div class="ysdm-choice" id="ysdmChoice">TERMIN NIJE ODABRAN</div><button type="button" class="ysdm-use" id="ysdmUse" disabled>POTVRDI ODABRANI TERMIN</button></div>';
 document.body.appendChild(m);
 $('ysdmClose').onclick=close;
 $('ysdmUse').onclick=use;
 m.addEventListener('click',e=>{if(e.target===m)close()});
 return m;
}
function slots(){
 const v=valid();
 if(!v.ok)return [];
 try{
   const a=window.YardivoSupplierSlotMapV583?.free?.(v.w,v.d,v.p);
   return Array.isArray(a)?a:[];
 }catch(e){
   console.error('[YARDIVO] supplier daily-map free()',e);
   return [];
 }
}
function draw(){
 const v=valid(),a=slots(),board=$('ysdmBoard');
 $('ysdmSub').textContent=`${fmtDate(v.d)} · ${v.w} · ${v.p} paleta`;
 const docks=[...new Set(a.map(x=>Number(x.dock)).filter(Boolean))].sort((x,y)=>x-y);
 const times=[...new Set(a.map(x=>hm(x.time)).filter(Boolean))].sort();
 const maxNeed=Math.max(30,...a.map(x=>Number(x.need)||30));
 $('ysdmInfo').innerHTML=
   `<span class="ysdm-chip">SKLADIŠTE · ${v.w}</span>`+
   `<span class="ysdm-chip">DATUM · ${v.d}</span>`+
   `<span class="ysdm-chip">PALETE · ${v.p}</span>`+
   `<span class="ysdm-chip">TRAJANJE · do ${maxNeed} min</span>`+
   `<span class="ysdm-chip">SLOBODNO · ${a.length} opcija</span>`;
 if(!a.length||!docks.length||!times.length){
   board.innerHTML='<div class="ysdm-empty">Za odabrani datum, skladište i količinu paleta nema slobodnog termina. Zatvori mapu i pošalji najavu bez odabranog termina ako želiš da Zalihe predlože termin.</div>';
   return;
 }
 const by=new Map(a.map(x=>[`${hm(x.time)}|${Number(x.dock)}`,x]));
 let html=`<div class="ysdm-grid" style="grid-template-columns:90px repeat(${docks.length},minmax(150px,1fr))">`;
 html+='<div class="ysdm-corner">VRIJEME</div>'+docks.map(r=>`<div class="ysdm-ramp">RAMPA ${r}</div>`).join('');
 times.forEach(t=>{
   html+=`<div class="ysdm-time">${t}</div>`;
   docks.forEach(r=>{
     const x=by.get(`${t}|${r}`);
     if(x){
       const sel=selected&&selected.date===v.d&&selected.time===t&&Number(selected.dock)===r;
       html+=`<div class="ysdm-cell"><button type="button" class="ysdm-free ${sel?'sel':''}" data-ysdm-time="${t}" data-ysdm-dock="${r}" data-ysdm-need="${Number(x.need)||30}"><strong>${t} · R${r}</strong><small>RAMPA DOSTUPNA</small></button></div>`;
     }else{
       html+='<div class="ysdm-cell"><div class="ysdm-busy">ZAUZETO / NEDOSTUPNO</div></div>';
     }
   });
 });
 html+='</div>';board.innerHTML=html;
 board.querySelectorAll('[data-ysdm-time]').forEach(b=>b.onclick=()=>{
   selected={date:v.d,time:b.dataset.ysdmTime,dock:Number(b.dataset.ysdmDock),need:Number(b.dataset.ysdmNeed)||30};
   draw();
   $('ysdmChoice').textContent=`ODABRANO · ${selected.time} · RAMPA ${selected.dock} · ${selected.need} min`;
   $('ysdmUse').disabled=false;
 });
}
function open(){
 const v=refresh();
 if(!v?.ok){
   alert('Za prikaz slobodnih termina prvo odaberi skladište, datum i unesi broj paleta.');
   return;
 }
 selected=null;
 const m=ensureModal();
 $('ysdmChoice').textContent='TERMIN NIJE ODABRAN';$('ysdmUse').disabled=true;
 draw();
 m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.classList.add('ysdm-open');
}
function close(){
 const m=$('yardivoSupplierDailyMapV583');
 m?.classList.remove('open');m?.setAttribute('aria-hidden','true');document.body.classList.remove('ysdm-open');
}
function use(){
 if(!selected)return;
 if($('yspDate'))$('yspDate').value=selected.date;
 if($('yspDateDisplay'))$('yspDateDisplay').value=new Date(selected.date+'T12:00:00').toLocaleDateString('hr-HR');
 if(!$('yspTime')){const x=document.createElement('input');x.type='hidden';x.id='yspTime';($('yspNewForm')||portal())?.appendChild(x)}
 if(!$('yspDock')){const x=document.createElement('input');x.type='hidden';x.id='yspDock';($('yspNewForm')||portal())?.appendChild(x)}
 $('yspTime').value=selected.time;$('yspDock').value='R'+selected.dock;
 refresh();close();
}
function changed(){
 const v=refresh();
 if(!v?.ok){lastAutoSignature='';selected=null;return}
 const sig=`${v.w}|${v.d}|${v.p}`;
 if(sig===lastAutoSignature)return;
 lastAutoSignature=sig;
 selected=null;
 /* User requested automatic map once all three prerequisites exist. */
 /* V5.8.3: supplier map never opens automatically; fullscreen is user initiated only. */
}
function bind(){
 const r=portal();if(!r)return;
 ensureControl();
 [
   $('yspWarehouse')||r.querySelector('select[name*="warehouse" i]'),
   $('yspDate')||r.querySelector('input[type="date"]'),
   $('yspPallets')||r.querySelector('input[name*="pallet" i]')
 ].filter(Boolean).forEach(el=>{
   if(el.dataset.ysdmBound)return;
   el.dataset.ysdmBound='1';
   el.addEventListener('change',changed,true);
   el.addEventListener('input',changed,true);
 });
 const cal=$('yspMiniCal');
 if(cal&&!cal.dataset.ysdmBound){cal.dataset.ysdmBound='1';cal.addEventListener('click',()=>setTimeout(changed,40),true)}
 refresh();
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('yardivoSupplierDailyMapV583')?.classList.contains('open'))close()});
let timer=0;
new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(bind,60)}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,100));
window.addEventListener('load',()=>setTimeout(bind,350));
bind();

window.YardivoSupplierDailyMapV583={open,close,refresh,selected:()=>selected};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-supplier-daily-map-button-final';
})();
