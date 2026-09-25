
(function(){
'use strict';
const $=id=>document.getElementById(id);let day='',pick=null;
const add=n=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const hm=v=>String(v||'').slice(0,5),mn=t=>{const [h,m]=String(t||'00:00').split(':').map(Number);return h*60+m},tm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'),dock=v=>Number(String(v||'').replace(/^R/i,''))||0;
function val(id){return $(id)?.value||''}
function wh(){return String(val('yspWarehouse')).toUpperCase().trim()}
function pal(){return Math.max(0,Number(val('yspPallets'))||0)}
function master(){try{return JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')}catch(_){return{warehouses:[]}}}
function whRow(w){const d=master();return (Array.isArray(d.warehouses)?d.warehouses:[]).find(x=>String(x?.id||'').toUpperCase()===String(w||'').toUpperCase()&&x.active!==false)||null}
function rampRows(w){const x=whRow(w);return x&&Array.isArray(x.ramp_settings)?x.ramp_settings:[]}
function rampCount(w){return rampRows(w).length}
function rampRow(w,r){return rampRows(w).find(x=>Number(x?.number)===Number(r))||null}
function rampOn(w,r){const x=rampRow(w,r);return !!x&&x.active!==false}
function cap(w,r){const x=rampRow(w,r);const n=Number(x?.pallets_per_hour);return Number.isFinite(n)&&n>0?n:0}
function hours(w,r){const x=rampRow(w,r),y=whRow(w);return{a:hm(x?.from||y?.reception_from||''),b:hm(x?.to||y?.reception_to||'')}}
function duration(p,c){if(!(c>0))return Infinity;return Math.max(30,Math.ceil((p/c)*60/15)*15)}
function allRows(){let a=[];try{if(Array.isArray(announcements))a.push(...announcements)}catch(_){}try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i)||'';if(!/^yardivo_supplier_portal_v549_/i.test(k))continue;try{const x=JSON.parse(localStorage.getItem(k)||'[]');if(Array.isArray(x))a.push(...x)}catch(_){}}}catch(_){}return a}
function busy(w,d,r,s,e){return allRows().some(x=>{if(String(x.warehouse||'').toUpperCase()!==w||String(x.date||x.delivery_date||'')!==d||dock(x.dock)!==r||/rejected|cancel/i.test(String(x.status||'')))return false;const st=mn(hm(x.time||x.requested_time)),cc=cap(w,r),dur=cc>0?duration(Math.max(1,Number(x.pallets||x.pallet_count)||1),cc):Math.max(30,Number(x.duration||60)||60),en=st+dur;return s<en&&e>st})}
function free(w,d,p){const out=[];for(let r=1;r<=rampCount(w);r++){if(!rampOn(w,r))continue;const c=cap(w,r),h=hours(w,r),need=duration(p,c);if(!c||!h.a||!h.b||!Number.isFinite(need)||mn(h.b)<=mn(h.a))continue;for(let m=mn(h.a);m+need<=mn(h.b);m+=30)if(!busy(w,d,r,m,m+need))out.push({date:d,time:tm(m),dock:r,need,capacity:c})}return out}
function drawDays(){const ds=Array.from({length:7},(_,i)=>add(i));if(!day||day<ds[0])day=val('yspDate')||ds[0];$('ysmDays').innerHTML=ds.map(d=>`<button type="button" class="ysm-day ${d===day?'sel':''}" data-ysm-day="${d}">${new Date(d+'T12:00').toLocaleDateString('hr-HR',{weekday:'short',day:'2-digit',month:'2-digit'})}</button>`).join('')}
function draw(){const w=wh(),p=pal(),a=free(w,day,p),wn=(()=>{try{const x=whRow(w);return String(x?.name||'Skladište')}catch(_){return 'Skladište'}})();$('ysmSub').textContent=`${wn} · ${p} paleta · slobodni termini i aktivne rampe`;$('ysmInfo').textContent=a.length?`Pronađeno ${a.length} slobodnih opcija. Trajanje termina prilagođeno je količini paleta i kapacitetu rampe.`:'Za odabrani dan nema slobodnog termina za ovu količinu paleta.';$('ysmGrid').innerHTML=a.length?a.slice(0,140).map(x=>`<button type="button" class="ysm-slot ${pick&&pick.date===x.date&&pick.time===x.time&&pick.dock===x.dock?'sel':''}" data-ysm="${x.date}|${x.time}|${x.dock}"><strong>${x.time} · R${x.dock}</strong><small>${x.need} min · ${x.capacity} pal/h</small></button>`).join(''):'<div class="ysm-empty">Nema slobodnog termina.</div>'}
function open(){const w=wh(),p=pal();if(!w){alert('Prvo odaberi skladište.');return}if(p<1){alert('Prvo upiši broj paleta.');return}if(rampCount(w)<1){const x=whRow(w);alert(`Za ${String(x?.name||'odabrano skladište')} nisu konfigurirane rampe.`);return}day=val('yspDate')||add(0);pick=null;drawDays();draw();$('yspSlotMapV583').classList.add('open');$('yspSlotMapV583').setAttribute('aria-hidden','false')}
function close(){$('yspSlotMapV583').classList.remove('open');$('yspSlotMapV583').setAttribute('aria-hidden','true')}
function install(){
 const portal=$('yardivoSupplierPortal');if(!portal)return;
 const form=$('yspNewForm')||portal.querySelector('.ysp-form-card')||portal.querySelector('form')||$('yspForm');
 if(!form||form.querySelector('.ysp-slot-planner-v583'))return;
 const date=$('yspDate'), actions=form.querySelector('.ysp-form-actions');
 if(!date||!actions)return;
 if(!$('yspTime')){const x=document.createElement('input');x.type='hidden';x.id='yspTime';form.appendChild(x)}
 if(!$('yspDock')){const x=document.createElement('input');x.type='hidden';x.id='yspDock';form.appendChild(x)}
 const box=document.createElement('div');box.className='ysp-slot-planner-v583';
 box.innerHTML=`<div class="ttl">ŽELJENI TERMIN I RAMPA</div><div class="sub">Nakon skladišta i broja paleta otvori mapu. YARDIVO prikazuje samo raspoložive termine i rampe.</div><button type="button" id="yspChooseSlotV583">OTVORI MAPU SLOBODNIH TERMINA</button><div id="yspChosenSlotV583" class="ysp-slot-choice-v583">TERMIN I RAMPA NISU ODABRANI</div>`;
 actions.parentNode.insertBefore(box,actions);
}
document.addEventListener('click',e=>{if(e.target.closest('#yspChooseSlotV583')){open();return}const d=e.target.closest('[data-ysm-day]');if(d){day=d.dataset.ysmDay;pick=null;drawDays();draw();return}const b=e.target.closest('[data-ysm]');if(b){const [date,time,r]=b.dataset.ysm.split('|');pick={date,time,dock:Number(r)};draw();return}},true);
$('ysmClose')?.addEventListener('click',close);
$('ysmUse')?.addEventListener('click',()=>{if(!pick){alert('Odaberi slobodan termin i rampu.');return}if($('yspDate')){$('yspDate').value=pick.date;$('yspDate').dispatchEvent(new Event('change',{bubbles:true}))}if($('yspDateDisplay'))$('yspDateDisplay').value=new Date(pick.date+'T12:00').toLocaleDateString('hr-HR');$('yspTime').value=pick.time;$('yspDock').value='R'+pick.dock;const c=$('yspChosenSlotV583');if(c){c.textContent=`ODABRANO · ${pick.date} · ${pick.time} · R${pick.dock}`;c.classList.add('ok')}close()});
const mo=new MutationObserver(()=>{clearTimeout(window.__ysmInstall);window.__ysmInstall=setTimeout(install,80)});mo.observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',()=>setTimeout(install,40),true);window.addEventListener('load',()=>setTimeout(install,500));setTimeout(install,250);
window.YardivoSupplierSlotMapV583={open,free,install};
window.YARDIVO_DEV_BUILD='20260908-dev-v5.8.3-supplier-slot-map-visible-fix';
})();
