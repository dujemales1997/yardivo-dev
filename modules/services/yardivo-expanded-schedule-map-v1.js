
(function(){
'use strict';

let orientation=localStorage.getItem('yardivo_schedule_orientation')||'horizontal';
let mode='day';

function canUse(){
  let r='';try{r=String(currentSession?.role||'').toLowerCase().trim()}catch(e){}
  if(r==='zalihe'||r==='upravljanje zalihama')r='inventory';
  return ['inventory','admin'].includes(r);
}
function anns(){try{return Array.isArray(announcements)?announcements:[]}catch(e){return[]}}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function iso(d){return d.toISOString().slice(0,10)}
function addDays(s,n){const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)}
function monday(s){const d=new Date(s+'T12:00:00'),day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return iso(d)}
function selectedDate(){
  return document.getElementById('annDate')?.value||
         window.YardivoOperationalSync?.date?.()||
         iso(new Date());
}
function selectedWarehouse(){
  return document.getElementById('annWarehouse')?.value||
         window.YardivoOperationalSync?.warehouse?.()||
         '';
}
function cfg(w){try{return WAREHOUSES?.[w]||null}catch(e){return null}}
function tmin(t){try{return toMin(t)}catch(e){const [h,m]=String(t).split(':').map(Number);return h*60+m}}
function thh(m){try{return hhmm(m)}catch(e){return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`}}
function status(a){try{return operationalPlanStatus(a)||a.status||''}catch(e){return a.status||''}}
function statusClass(a){
  try{return yardivoUnifiedStatusClass(a)||operationalPlanClass(a)||''}
  catch(e){try{return operationalPlanClass(a)||''}catch(_){return''}}
}
function delayText(a){try{return operationalDelayText(a)||''}catch(e){return''}}
function scoped(date,w){
  return anns().filter(a=>String(a?.date||'')===String(date)&&(a?.warehouse||yardivoCanonicalWarehouseV583())===w);
}
function exactAt(rows,dock,time){
  const m=tmin(time);
  return rows.find(a=>Number(a.dock)===Number(dock)&&tmin(a.time)===m);
}

function ensureButton(){
  if(document.getElementById('yardivoExpandScheduleBtn'))return;
  const schedule=document.getElementById('announcementSchedule');if(!schedule)return;
  const candidates=[
    schedule.previousElementSibling,
    schedule.parentElement?.querySelector('.section-head,.panel-head,.schedule-head,.card-head'),
    schedule.parentElement
  ].filter(Boolean);
  const host=candidates[0];if(!host)return;
  const b=document.createElement('button');b.id='yardivoExpandScheduleBtn';b.type='button';b.textContent='⛶ POVEĆAJ MAPU';
  b.onclick=open;
  host.appendChild(b);
}

function shell(){
  let m=document.getElementById('yardivoExpandedSchedule');if(m)return m;
  m=document.createElement('div');m.id='yardivoExpandedSchedule';m.dataset.orientation=orientation;
  m.innerHTML=`<div class="yesm-toolbar">
    <strong>YARDIVO · MAPA NAJAVA</strong>
    <button type="button" data-nav="-1">‹ PRETHODNO</button>
    <input type="date" id="yesmDate">
    <button type="button" data-nav="1">SLJEDEĆE ›</button>
    <button type="button" data-mode="day">DAN</button>
    <button type="button" data-mode="week">TJEDAN</button>
    <select id="yesmWarehouse"></select>
    <span class="yesm-spacer"></span>
    <button type="button" data-orient="horizontal">↔ HORIZONTALNO</button>
    <button type="button" data-orient="vertical">↕ VERTIKALNO</button>
    <button type="button" data-close>✕ ZATVORI</button>
  </div><div class="yesm-body"><div class="yesm-map-host" id="yesmHost"></div></div>`;
  document.body.appendChild(m);
  const wh=m.querySelector('#yesmWarehouse');
  try{
    Object.keys(WAREHOUSES||{}).forEach(k=>wh.insertAdjacentHTML('beforeend',`<option value="${esc(k)}">${esc(WAREHOUSES[k].label||k)}</option>`));
  }catch(e){wh.innerHTML=''}
  m.querySelector('[data-close]').onclick=close;
  m.querySelector('#yesmDate').onchange=render;
  wh.onchange=render;
  m.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;render()});
  m.querySelectorAll('[data-orient]').forEach(b=>b.onclick=()=>{orientation=b.dataset.orient;localStorage.setItem('yardivo_schedule_orientation',orientation);m.dataset.orientation=orientation;render()});
  m.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{
    const inp=m.querySelector('#yesmDate'),step=mode==='week'?7:1;
    inp.value=addDays(inp.value,Number(b.dataset.nav)*step);render();
  });
  m.onclick=e=>{if(e.target===m)close()};
  return m;
}

function open(){
  if(!canUse())return alert('Povećana operativna mapa dostupna je Zalihama i Adminu.');
  const m=shell();
  const d=selectedDate(),w=selectedWarehouse();
  m.querySelector('#yesmDate').value=d;
  if([...m.querySelector('#yesmWarehouse').options].some(o=>o.value===w))m.querySelector('#yesmWarehouse').value=w;
  m.dataset.orientation=orientation;
  m.classList.add('open');document.body.style.overflow='hidden';render();
}
function close(){document.getElementById('yardivoExpandedSchedule')?.classList.remove('open');document.body.style.overflow=''}

function bookedAt(date,w,dock,time){
  return exactAt(scoped(date,w),dock,time);
}
function blockedAt(date,w,dock,time){
  try{
    const m=tmin(time);
    return typeof findActiveBlock==='function'?findActiveBlock(date,w,dock,m):null;
  }catch(e){return null}
}
function verticalDay(date,w){
  const c=cfg(w);if(!c)return '<div class="yesm-empty">Skladište nije konfigurirano.</div>';
  const rows=scoped(date,w);
  const configuredStart=tmin(c.receptionStart),configuredEnd=tmin(c.receptionEnd);
  const times=rows.filter(a=>a.time).map(a=>tmin(a.time)).filter(Number.isFinite);
  const start=Math.min(configuredStart,times.length?Math.min(...times):configuredStart);
  const latest=times.length?Math.max(...times)+60:configuredEnd;
  const end=Math.min(24*60,Math.max(configuredEnd,latest,22*60));
  const ramps=Number(c.ramps||1);

  let out=`<div class="yesm-vertical-grid" style="grid-template-columns:72px repeat(${ramps},minmax(150px,1fr))">`;
  out+='<div class="yesm-v-head">VRIJEME</div>';
  for(let d=1;d<=ramps;d++)out+=`<div class="yesm-v-head">RAMPA ${d}</div>`;

  for(let m=start;m<end;m+=15){
    const time=thh(m);out+=`<div class="yesm-v-time">${time}</div>`;
    for(let d=1;d<=ramps;d++){
      const a=exactAt(rows,d,time),bl=blockedAt(date,w,d,time);
      if(a){
        const st=status(a),delay=delayText(a);
        out+=`<div class="yesm-v-cell ${statusClass(a)}" data-move-date="${date}" data-move-warehouse="${w}" data-move-dock="${d}" data-move-time="${time}">
          <div class="yesm-v-booked ${statusClass(a)}" draggable="true" data-announcement-id="${a.id}" oncontextmenu="openAnnouncementContextMenu(event,${a.id})">
            <strong>${esc(a.supplier||'—')}</strong>
            <small>${esc(a.time)} · ${Number(a.pallets||0)} pal · ${esc(st)}</small>
            ${delay?`<small class="booking-delay-detail">${esc(delay)}</small>`:''}
          </div></div>`;
      }else if(bl){
        out+=`<div class="yesm-v-cell blocked" data-move-date="${date}" data-move-warehouse="${w}" data-move-dock="${d}" data-move-time="${time}" data-move-blocked="1">BLOK</div>`;
      }else{
        out+=`<div class="yesm-v-cell free" data-move-date="${date}" data-move-warehouse="${w}" data-move-dock="${d}" data-move-time="${time}"></div>`;
      }
    }
  }
  return out+'</div>';
}
function horizontalDay(date,w){
  const c=cfg(w);if(!c)return '<div class="yesm-empty">Skladište nije konfigurirano.</div>';
  const rows=scoped(date,w);
  const configuredStart=tmin(c.receptionStart),configuredEnd=tmin(c.receptionEnd);
  const times=rows.filter(a=>a.time).map(a=>tmin(a.time)).filter(Number.isFinite);
  const ws=Math.min(configuredStart,times.length?Math.min(...times):configuredStart);
  const latest=times.length?Math.max(...times)+60:configuredEnd;
  const we=Math.min(24*60,Math.max(configuredEnd,latest));
  const slots=Math.max(1,Math.ceil((we-ws)/15));
  const heads=Array.from({length:slots},(_,i)=>thh(ws+i*15));

  let out=`<div class="yesm-horizontal-grid schedule-grid" style="grid-template-columns:70px repeat(${slots},minmax(34px,1fr))">`;
  out+='<div class="head">RAMPA</div>'+heads.map(x=>`<div class="head">${x}</div>`).join('');

  for(let dock=1;dock<=Number(c.ramps||1);dock++){
    out+=`<div class="ramp">R${dock}</div>`;
    for(let i=0;i<slots;i++){
      const m=ws+i*15,time=thh(m);
      const a=exactAt(rows,dock,time);
      const bl=blockedAt(date,w,dock,time);
      if(a){
        const duration=Number(a.duration||15);
        const span=Math.max(1,Math.ceil(duration/15));
        const st=status(a),delay=delayText(a);
        out+=`<div class="booked ${statusClass(a)}" draggable="true" data-announcement-id="${a.id}"
          data-move-date="${date}" data-move-warehouse="${w}" data-move-dock="${dock}" data-move-time="${time}"
          oncontextmenu="openAnnouncementContextMenu(event,${a.id})"
          style="grid-column:span ${span}" title="${esc(a.supplier)} · ${Number(a.pallets||0)} pal · ${esc(st)}">
          ${esc(a.supplier)}<br><small>${Number(a.pallets||0)} pal.</small>
          <span class="booking-status">${esc(st).toUpperCase()}</span>
          ${delay?`<span class="booking-delay-detail">${esc(delay)}</span>`:''}
        </div>`;
        i+=span-1;
      }else if(bl){
        let span=Math.max(1,Math.ceil((tmin(bl.to)-m)/15));
        out+=`<div class="booked blocked" data-move-date="${date}" data-move-warehouse="${w}" data-move-dock="${dock}" data-move-time="${time}" data-move-blocked="1" style="grid-column:span ${span}">BLOKIRANO</div>`;
        i+=span-1;
      }else{
        out+=`<div class="freecell" data-move-date="${date}" data-move-warehouse="${w}" data-move-dock="${dock}" data-move-time="${time}"></div>`;
      }
    }
  }
  return out+'</div>';
}
function weekView(date,w){
  const start=monday(date);
  let out='<div class="yesm-week-grid" style="display:grid;grid-template-columns:repeat(5,minmax(250px,1fr));gap:10px;min-width:1350px">';
  for(let i=0;i<5;i++){
    const d=addDays(start,i);
    let closed=false,closedName='';
    try{const info=dayInfo(d);closed=!!info?.closed;closedName=info?.name||''}catch(_){}
    const items=scoped(d,w).sort((a,b)=>String(a.time).localeCompare(String(b.time)));
    out+=`<section data-weekly-move-date="${d}" data-weekly-move-warehouse="${w}" style="border:1px solid #29495c;border-radius:8px;padding:10px;min-height:420px">
      <strong style="font-size:9px">${d}</strong><div style="display:grid;gap:7px;margin-top:9px">`;
    if(closed){
      out+=`<div class="yesm-empty">${esc(closedName||'PRIJAM NE RADI')}</div>`;
    }else{
      out+=items.length?items.map(a=>{
        const st=status(a),delay=delayText(a);
        return `<div class="yesm-v-booked ${statusClass(a)}" draggable="true" data-announcement-id="${a.id}" oncontextmenu="openAnnouncementContextMenu(event,${a.id})">
          <strong>${esc(a.time)} · ${esc(a.supplier)}</strong>
          <small>R${a.dock||'—'} · ${Number(a.pallets||0)} pal · ${esc(st)}</small>
          ${delay?`<small class="booking-delay-detail">${esc(delay)}</small>`:''}
        </div>`;
      }).join(''):'<small style="color:#7894a6">Nema najava</small>';
    }
    out+='</div></section>';
  }
  return out+'</div>';
}
function render(){
  const m=shell(),date=m.querySelector('#yesmDate').value,w=m.querySelector('#yesmWarehouse').value,host=m.querySelector('#yesmHost');
  m.dataset.orientation=orientation;
  m.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  m.querySelectorAll('[data-orient]').forEach(b=>b.classList.toggle('active',b.dataset.orient===orientation));
  if(mode==='week')host.innerHTML=weekView(date,w);
  else host.innerHTML=orientation==='vertical'?verticalDay(date,w):horizontalDay(date,w);
}

/* Existing inventory drag engine also handles these exact data-move-* targets. 
   Add drag source compatibility for the fullscreen container. */
document.addEventListener('dragstart',e=>{
  const el=e.target.closest('#yardivoExpandedSchedule [data-announcement-id]');
  if(!el||!canUse())return;
  const id=el.dataset.announcementId;
  try{e.dataTransfer.setData('text/plain',id);e.dataTransfer.effectAllowed='move'}catch(err){}
  /* Delegate by creating the same global source state via public reschedule API on drop fallback below. */
  window.__yardivoExpandedDragged=id;
  document.body.classList.add('yardivo-dragging-announcement');
  el.classList.add('yardivo-drag-source');
},true);
document.addEventListener('dragend',e=>{
  if(!e.target.closest('#yardivoExpandedSchedule'))return;
  e.target.classList.remove('yardivo-drag-source');
  window.__yardivoExpandedDragged=null;document.body.classList.remove('yardivo-dragging-announcement');
  document.querySelectorAll('.yardivo-drop-hover').forEach(x=>x.classList.remove('yardivo-drop-hover'));
},true);
document.addEventListener('dragover',e=>{
  if(!window.__yardivoExpandedDragged)return;
  const t=e.target.closest('#yardivoExpandedSchedule [data-move-date],#yardivoExpandedSchedule [data-weekly-move-date]');if(!t)return;
  e.preventDefault();t.classList.add('yardivo-drop-hover');
},true);
document.addEventListener('drop',e=>{
  const id=window.__yardivoExpandedDragged;if(!id)return;
  const t=e.target.closest('#yardivoExpandedSchedule [data-move-date],#yardivoExpandedSchedule [data-weekly-move-date]');if(!t)return;
  e.preventDefault();e.stopImmediatePropagation();
  if(t.dataset.moveBlocked==='1')return alert('Na blokirani termin nije moguće premjestiti najavu.');
  const a=anns().find(x=>String(x.id)===String(id));if(!a)return;
  const proposal=t.dataset.moveDate?
    {date:t.dataset.moveDate,time:t.dataset.moveTime||a.time,dock:Number(t.dataset.moveDock||a.dock)}:
    {date:t.dataset.weeklyMoveDate,time:a.time,dock:Number(a.dock)};
  window.YardivoInventoryReschedule?.open?.(id,proposal);
  window.__yardivoExpandedDragged=null;
},true);

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('yardivoExpandedSchedule')?.classList.contains('open'))close()});
window.addEventListener('load',()=>setTimeout(ensureButton,900));
window.addEventListener('yardivo:data-synced',()=>{
  if(canUse())ensureButton();
  const modal=document.getElementById('yardivoExpandedSchedule');
  if(modal?.classList.contains('open'))render();
});
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="announcements"],[data-home-target="announcements"]'))setTimeout(ensureButton,80);
},true);

window.YardivoExpandedSchedule={open,close,render};
})();
