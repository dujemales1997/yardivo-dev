
(function(){
'use strict';
if(window.__YARDIVO_SUPPLIER_RIGHT_DAILY_MAP_FINAL_V583__)return;
window.__YARDIVO_SUPPLIER_RIGHT_DAILY_MAP_FINAL_V583__=true;

let selected=null,lastSig='',fsParent=null,fsNext=null;
const $=id=>document.getElementById(id);
const hm=v=>String(v||'').slice(0,5);

function portal(){return $('yardivoSupplierPortal')}
function wh(){return String($('yspWarehouse')?.value||'').toUpperCase().trim()}
function date(){return String($('yspDate')?.value||'').trim()}
function pallets(){const n=Number($('yspPallets')?.value||0);return Number.isFinite(n)&&n>0?n:0}
function valid(){const w=wh(),d=date(),p=pallets();return{w,d,p,ok:!!w&&!!d&&p>0}}
function fmtDate(d){try{return new Date(d+'T12:00:00').toLocaleDateString('hr-HR',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})}catch(_){return d}}

function killLegacy(){
 portal()?.querySelectorAll('.ysp-slot-planner-v583,.yardivo-supplier-auto-slot-wrap,#yardivoSupplierSlotPrereqV583,#yardivoSupplierSlotControlV583').forEach(x=>x.remove());
 ['yspSlotMapV583','yardivoSupplierFullscreenMapV583','yardivoSupplierDailyMapV583'].forEach(id=>{
   const el=$(id);if(el){el.classList.remove('open');el.style.setProperty('display','none','important')}
 });
 document.body.classList.remove('yardivo-native-slot-map-open','yardivo-supplier-map-open','ysdm-open');
}
function findFormCard(){
 const r=portal();if(!r)return null;
 return r.querySelector('[data-ysp-section="new"] > .ysp-card') || $('yspNewForm') || r.querySelector('[data-ysp-section="new"] form');
}
function ensureLayout(){
 const form=findFormCard();if(!form)return null;
 if(form.closest('.yardivo-supplier-new-layout-v583'))return form.closest('.yardivo-supplier-new-layout-v583');
 const layout=document.createElement('div');layout.className='yardivo-supplier-new-layout-v583';
 form.parentNode.insertBefore(layout,form);layout.appendChild(form);
 const side=document.createElement('div');side.className='yardivo-supplier-map-side-v583';side.id='yardivoSupplierRightDailyMapV583';
 side.innerHTML=
   '<div class="ysr-head"><div><div class="ysr-title">DNEVNA MAPA · SLOBODNI TERMINI</div><div class="ysr-sub" id="ysrSub">Odaberi skladište, datum i broj paleta.</div></div><button type="button" class="ysr-full" id="ysrFull" disabled>POVEĆAJ MAPU</button></div>'+
   '<div class="ysr-info" id="ysrInfo"></div>'+
   '<div class="ysr-scroll"><div id="ysrBoard"><div class="ysr-empty">Mapa će se prikazati kada odabereš skladište, datum i broj paleta.</div></div></div>'+
   '<div class="ysr-choice" id="ysrChoice">TERMIN NIJE ODABRAN</div>';
 layout.appendChild(side);
 $('ysrFull').onclick=openFullscreen;
 return layout;
}
function slots(v){
 try{const a=window.YardivoSupplierSlotMapV583?.free?.(v.w,v.d,v.p);return Array.isArray(a)?a:[]}
 catch(e){console.error('[YARDIVO] Supplier right daily map free()',e);return []}
}
function draw(){
 killLegacy();ensureLayout();
 const v=valid(),side=$('yardivoSupplierRightDailyMapV583');if(!side)return;
 side.style.display=v.d?'':'none';
 if(!v.d)return;
 const sub=$('ysrSub'),info=$('ysrInfo'),board=$('ysrBoard'),full=$('ysrFull'),choice=$('ysrChoice');
 full.disabled=!v.ok;
 if(!v.ok){
   const miss=[];if(!v.w)miss.push('skladište');if(!v.d)miss.push('datum');if(!v.p)miss.push('broj paleta');
   sub.textContent='Nedostaje: '+miss.join(' + ');info.innerHTML='';
   board.innerHTML='<div class="ysr-empty">Za prikaz dnevne mape prvo odaberi <b>skladište</b>, <b>datum</b> i unesi <b>broj paleta</b>.</div>';
   choice.textContent='TERMIN NIJE ODABRAN';choice.classList.remove('ready');return;
 }
 sub.textContent=`${fmtDate(v.d)} · ${v.w} · ${v.p} paleta`;
 const a=slots(v),docks=[...new Set(a.map(x=>Number(x.dock)).filter(Boolean))].sort((x,y)=>x-y),
       times=[...new Set(a.map(x=>hm(x.time)).filter(Boolean))].sort(),
       maxNeed=Math.max(30,...a.map(x=>Number(x.need)||30));
 info.innerHTML=`<span class="ysr-chip">${v.w}</span><span class="ysr-chip">${v.d}</span><span class="ysr-chip">${v.p} paleta</span>`;
 if(!a.length||!docks.length||!times.length){
   board.innerHTML='<div class="ysr-empty">Za ovaj datum i količinu nema slobodnog termina. Dobavljač može poslati najavu bez termina, a Zalihe kasnije mogu predložiti termin.</div>';return;
 }
 const by=new Map(a.map(x=>[`${hm(x.time)}|${Number(x.dock)}`,x]));
 let html=`<div class="ysr-grid" style="grid-template-columns:76px repeat(${docks.length},minmax(120px,1fr))">`;
 html+='<div class="ysr-corner">VRIJEME</div>'+docks.map(r=>`<div class="ysr-ramp">RAMPA ${r}</div>`).join('');
 times.forEach(t=>{
   html+=`<div class="ysr-time">${t}</div>`;
   docks.forEach(r=>{
     const x=by.get(`${t}|${r}`);
     if(x){
       const sel=selected&&selected.date===v.d&&selected.time===t&&Number(selected.dock)===r;
       html+=`<div class="ysr-cell"><button type="button" class="ysr-free ${sel?'sel':''}" data-ysr-time="${t}" data-ysr-dock="${r}" data-ysr-need="${Number(x.need)||30}"><strong>${t} · R${r}</strong><small>RAMPA DOSTUPNA</small></button></div>`;
     }else html+='<div class="ysr-cell"><div class="ysr-busy">ZAUZETO</div></div>';
   });
 });
 html+='</div>';board.innerHTML=html;
 board.querySelectorAll('[data-ysr-time]').forEach(b=>b.onclick=()=>{
   selected={date:v.d,time:b.dataset.ysrTime,dock:Number(b.dataset.ysrDock),need:Number(b.dataset.ysrNeed)||30};
   if(!$('yspTime')){const x=document.createElement('input');x.type='hidden';x.id='yspTime';findFormCard()?.appendChild(x)}
   if(!$('yspDock')){const x=document.createElement('input');x.type='hidden';x.id='yspDock';findFormCard()?.appendChild(x)}
   $('yspTime').value=selected.time;$('yspDock').value='R'+selected.dock;
   draw();$('ysrChoice').textContent=`ODABRANO · ${selected.time} · RAMPA ${selected.dock}`;$('ysrChoice').classList.add('ready');
 });
}
function ensureFullscreen(){
 let fs=$('yardivoSupplierRightMapFullscreenV583');if(fs)return fs;
 fs=document.createElement('div');fs.id='yardivoSupplierRightMapFullscreenV583';
 fs.innerHTML='<div class="ysrf-head"><div class="ysrf-title">DNEVNA MAPA · SLOBODNI TERMINI I RAMPE</div><button type="button" class="ysrf-close" id="ysrfClose">✕</button></div><div class="ysrf-body" id="ysrfBody"></div>';
 document.body.appendChild(fs);$('ysrfClose').onclick=closeFullscreen;return fs;
}
function openFullscreen(){
 const v=valid();if(!v.ok)return;
 const side=$('yardivoSupplierRightDailyMapV583');if(!side)return;
 const fs=ensureFullscreen(),body=$('ysrfBody');
 fsParent=side.parentNode;fsNext=side.nextSibling;body.appendChild(side);
 fs.classList.add('open');document.body.classList.add('ysrf-open');
}
function closeFullscreen(){
 const fs=$('yardivoSupplierRightMapFullscreenV583'),side=$('yardivoSupplierRightDailyMapV583');
 if(side&&fsParent){try{if(fsNext&&fsNext.parentNode===fsParent)fsParent.insertBefore(side,fsNext);else fsParent.appendChild(side)}catch(_){}}
 fsParent=null;fsNext=null;fs?.classList.remove('open');document.body.classList.remove('ysrf-open');
}
function onInput(){
 const v=valid(),sig=`${v.w}|${v.d}|${v.p}`;
 if(sig!==lastSig){lastSig=sig;selected=null;if($('yspTime'))$('yspTime').value='';if($('yspDock'))$('yspDock').value=''}
 setTimeout(draw,30);
}
function bind(){
 killLegacy();ensureLayout();
 const r=portal();if(!r)return;
 [
   $('yspWarehouse')||r.querySelector('select[name*="warehouse" i]'),
   $('yspDate')||r.querySelector('input[type="date"]'),
   $('yspPallets')||r.querySelector('input[name*="pallet" i]')
 ].filter(Boolean).forEach(el=>{
   if(el.dataset.ysrBound)return;el.dataset.ysrBound='1';
   el.addEventListener('change',onInput,true);el.addEventListener('input',onInput,true);
 });
 const cal=$('yspMiniCal');if(cal&&!cal.dataset.ysrBound){cal.dataset.ysrBound='1';cal.addEventListener('click',()=>setTimeout(onInput,40),true)}
 draw();
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('yardivoSupplierRightMapFullscreenV583')?.classList.contains('open'))closeFullscreen()});
let timer=0;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(bind,70)}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,110));window.addEventListener('load',()=>setTimeout(bind,350));bind();

window.YardivoSupplierRightDailyMapV583={refresh:bind,draw,fullscreen:openFullscreen,selected:()=>selected};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-supplier-right-daily-map-final';
})();
