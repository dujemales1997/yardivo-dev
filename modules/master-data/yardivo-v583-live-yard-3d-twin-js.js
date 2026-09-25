
(()=>{'use strict';
if(window.__YV_LIVE_YARD_3D_TWIN__)return;
window.__YV_LIVE_YARD_3D_TWIN__=true;

let selectedId=null;
let renderTimer=0;

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function data(){try{return Array.isArray(announcements)?announcements:[]}catch(_){return[]}}
function wh(){return document.getElementById('lyWarehouse')?.value||window.yardivoCanonicalWarehouseV583?.()||window.activeWarehouse||''}
function date(){return document.getElementById('lyDate')?.value||window.yardivoLocalDateV583?.()||new Date().toISOString().slice(0,10)}
function master(){
  try{return JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')}catch(_){return{}}
}
function whCfg(){
  const id=wh(),m=master(),w=(m.warehouses||[]).find(x=>String(x.id)===String(id));
  let ramps=Number(w?.ramps||w?.ramp_count||0);
  try{if(!ramps)ramps=Number(WAREHOUSES?.[id]?.ramps||0)}catch(_){}
  return {id,name:w?.name||id,ramps:Math.max(1,ramps||6)};
}
function locked(r){
  try{return !!window.YardivoRampConfig?.isLocked?.(wh(),r)}catch(_){return false}
}
function state(a){
  const s=String(a?.status||'').toLowerCase();
  if(a?.receivedAt||a?.rejectedAt||/zaprim|odbij|zavr|izasao|izašao/.test(s))return'done';
  if(a?.dockArrivalAt||/rampi/.test(s))return'dock';
  if(a?.yardArrivalAt||/dvori|parking|parkiran|buffer|ceka|čeka/.test(s))return'yard';
  if(a?.gateCheckedAt||a?.gateEntryApprovedAt||a?.actualDate||a?.actualTime||/ulaz|port/.test(s))return'gate';
  return'incoming';
}
function plate(a){
  try{return effectivePlate(a)||a?.plannedPlate||a?.arrivalPlate||'—'}catch(_){return a?.plannedPlate||a?.arrivalPlate||'—'}
}
function list(){
  const W=wh(),D=date();
  return data().filter(a=>String(a.warehouse||window.yardivoCanonicalWarehouseV583?.()||'')===String(W)&&String(a.date||'')===String(D));
}
function pos(a,i,ramps){
  const s=state(a),dock=Math.max(1,Math.min(ramps,Number(a?.dock||1)));
  if(s==='dock'){
    const y=15 + ((dock-.5)/ramps)*34;
    return {x:60,y,cls:'at-dock',rot:0};
  }
  if(s==='yard'){
    const slot=i%8,row=Math.floor(i/8)%2;
    return {x:8+slot*5.55,y:25+row*11,cls:'parked',rot:0};
  }
  if(s==='gate'){
    return {x:9+(i%3)*10,y:80-Math.floor(i/3)*7,cls:'gate',rot:0};
  }
  if(s==='done'){
    return {x:73+(i%3)*8,y:78,cls:'done',rot:0};
  }
  return {x:3+(i%2)*8,y:66+Math.floor(i/2)*8,cls:'incoming',rot:0};
}
function truckHtml(a,i,ramps){
  const p=pos(a,i,ramps),s=state(a);
  return `<div class="yv3-truck ${p.cls}" data-yv3-id="${esc(a.id)}" style="left:${p.x}%;top:${p.y}%">
    <div class="yv3-trailer"></div><div class="yv3-cab"></div>
    <i class="yv3-wheel w1"></i><i class="yv3-wheel w2"></i><i class="yv3-wheel w3"></i>
    <div class="yv3-truck-tag"><b>${esc(a.supplier||'DOBAVLJAČ')}</b><span>${esc(plate(a))} · ${s==='yard'&&a.dock?'PLAN R'+a.dock:s==='dock'?'R'+(a.dock||'—'):s.toUpperCase()}</span></div>
  </div>`;
}
function routeHtml(a,i,ramps){
  if(state(a)!=='yard'||!a.dock)return'';
  const p=pos(a,i,ramps);
  const dock=Math.max(1,Math.min(ramps,Number(a.dock||1)));
  const target={x:64,y:15+((dock-.5)/ramps)*34};
  const dx=target.x-p.x,dy=target.y-p.y;
  const len=Math.sqrt(dx*dx+dy*dy);
  const ang=Math.atan2(dy,dx)*180/Math.PI;
  return `<div class="yv3-route" style="left:${p.x+4}%;top:${p.y+3}%;width:${len}%;transform:translateZ(8px) rotate(${ang}deg)"></div>
          <div class="yv3-route-label" style="left:${(p.x+target.x)/2}%;top:${(p.y+target.y)/2}%">PARKING → R${dock}</div>`;
}
function detailHtml(items){
  const a=items.find(x=>String(x.id)===String(selectedId));
  if(!a)return `<h4>OPERATIVNI DETALJ</h4><div class="yv3-empty">Klikni kamion za detalje.<br>Plava ruta prikazuje planirano kretanje s parkinga prema dodijeljenoj rampi.</div>`;
  const s=state(a);
  return `<h4>${esc(a.supplier||'DOBAVLJAČ')}</h4>
    <p><b>STATUS</b> · ${esc(s==='yard'?'PARKING / ČEKANJE':s==='dock'?'NA RAMPI':s==='gate'?'NA PORTI':s.toUpperCase())}</p>
    <p><b>REGISTRACIJA</b> · ${esc(plate(a))}</p>
    <p><b>TERMIN</b> · ${esc(a.date||'')} ${esc(a.time||'—')}</p>
    <p><b>PLANIRANA RAMPA</b> · ${a.dock?'R'+esc(a.dock):'—'}</p>`;
}
function render3d(){
  const stage=document.getElementById('liveYardStage');
  const canvas=document.getElementById('lyCanvas');
  if(!stage||!canvas||stage.dataset.viewmode!=='3d')return;
  const c=whCfg(),items=list(),ramps=c.ramps;
  const counts={incoming:0,gate:0,yard:0,dock:0,done:0};
  items.forEach(a=>counts[state(a)]++);

  let h=`<div class="yv3-scene">
    <div class="yv3-hud">
      <div class="yv3-hud-left">
        <div class="yv3-title"><strong>YARDIVO · 3D DIGITAL TWIN</strong><small>${esc(c.name)} · ${esc(date())}</small></div>
        <div class="yv3-chip"><b>${items.length}</b> NAJAVA</div>
        <div class="yv3-chip"><b>${counts.yard}</b> PARKING</div>
        <div class="yv3-chip"><b>${counts.dock}</b> NA RAMPI</div>
      </div>
      <div class="yv3-hud-right"><div class="yv3-chip yv3-live"><i></i> LIVE</div></div>
    </div>
    <div class="yv3-camera"><div class="yv3-world"><div class="yv3-ground">
      <div class="yv3-road main"></div><div class="yv3-road spine"></div>
      <div class="yv3-parking"><div class="yv3-parking-title">PARKING / BUFFER ZONA</div><div class="yv3-parking-grid">
        ${Array.from({length:16},(_,i)=>`<div class="yv3-slot" data-slot="P${i+1}"></div>`).join('')}
      </div></div>
      <div class="yv3-gate">ULAZ / IZLAZ</div>
      <div class="yv3-building"><div class="yv3-building-front"></div><div class="yv3-building-side"></div><div class="yv3-building-roof"></div><div class="yv3-building-name">${esc(c.name)}</div></div>
      <div class="yv3-docks" style="grid-template-rows:repeat(${ramps},1fr)">`;

  for(let r=1;r<=ramps;r++){
    const busy=items.some(a=>Number(a.dock)===r&&state(a)==='dock');
    h+=`<div class="yv3-dock ${busy?'busy':''} ${locked(r)?'closed':''}" data-yv3-dock="${r}">R${r}</div>`;
  }
  h+=`</div>`;
  items.forEach((a,i)=>{h+=routeHtml(a,i,ramps)});
  items.forEach((a,i)=>{h+=truckHtml(a,i,ramps)});
  h+=`</div></div></div><div class="yv3-detail">${detailHtml(items)}</div></div>`;
  canvas.innerHTML=h;
}
function schedule(ms=0){clearTimeout(renderTimer);renderTimer=setTimeout(render3d,ms)}
function ensureButton(){
  const b=document.querySelector('#liveYard [data-ly-view="3d"]');
  if(b){b.textContent='3D DIGITAL TWIN';b.title='3D digital twin dvorišta'}
}
document.addEventListener('click',e=>{
  const b=e.target.closest?.('#liveYard [data-ly-view="3d"]');
  if(b){setTimeout(()=>{const s=document.getElementById('liveYardStage');if(s)s.dataset.viewmode='3d';ensureButton();render3d()},20);return}
  const b2=e.target.closest?.('#liveYard [data-ly-view="2d"]');
  if(b2)return;
  const t=e.target.closest?.('.yv3-truck[data-yv3-id]');
  if(t){selectedId=t.dataset.yv3Id;render3d()}
},true);
document.addEventListener('change',e=>{
  if(['lyWarehouse','lyDate'].includes(e.target?.id))schedule(40);
},true);
window.addEventListener('yardivo:data-synced',()=>schedule(80));
window.addEventListener('yardivo:login',()=>setTimeout(()=>{ensureButton();schedule(0)},100));
window.addEventListener('resize',()=>schedule(50),{passive:true});
document.addEventListener('click',e=>{
  if(e.target?.closest?.('[data-view="liveYard"],[data-home-target="liveYard"]'))setTimeout(()=>{ensureButton();schedule(0)},80);
},true);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureButton,{once:true});else ensureButton();
window.addEventListener('load',()=>setTimeout(ensureButton,1700),{once:true});

window.YardivoLiveYard3DTwinV583={render:render3d};
})();
