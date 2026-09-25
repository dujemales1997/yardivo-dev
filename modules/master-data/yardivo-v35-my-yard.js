
(function(){
'use strict';
const st={mode:'3d',rz:-10,sc:.78,drag:false,x:0,date:''};
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function data(){try{return Array.isArray(announcements)?announcements:[]}catch(e){return[]}}
function wh(){try{return activeWarehouse&&activeWarehouse!=='ALL'?activeWarehouse:yardivoCanonicalWarehouseV583()}catch(e){return''}}
function isoToday(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function addDays(s,n){const [y,m,d]=String(s).split('-').map(Number),x=new Date(y,m-1,d);x.setDate(x.getDate()+n);return [x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-')}
function prettyDate(s){const [y,m,d]=String(s).split('-').map(Number);const x=new Date(y,m-1,d);return x.toLocaleDateString('hr-HR',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'}).toUpperCase()}
function ramps(w){try{return Math.max(0,Number(YardivoRampConfig?.count?.(w)??WAREHOUSES?.[w]?.ramps??0))}catch(e){return 0}}
function ensure(){
 if(document.getElementById('myYard'))return;
 if(!st.date)st.date=isoToday();
 const main=document.querySelector('.main');if(!main)return;
 const s=document.createElement('section');s.id='myYard';s.className='view';
 s.innerHTML=`<div class="myy-shell">
 <div class="myy-toolbar"><i class="myy-live"></i><strong>MY YARD</strong>
 <button data-myy="2d">2D</button><button data-myy="3d" class="active">3D</button>
 <span class="myy-meta"></span>
 <div class="myy-date-tools">
   <button type="button" data-day="-1" title="Prethodni dan">‹</button>
   <button type="button" data-today>DANAS</button>
   <button type="button" data-day="1" title="Sljedeći dan">›</button>
   <input type="date" class="myy-date" aria-label="Odaberi datum">
   <span class="myy-date-title"></span>
 </div></div>
 <div class="myy-stage"><div class="myy-world d3"><div class="myy-floor"><div class="myy-road"></div>
 <div class="myy-building"><div class="myy-front">WAREHOUSE</div><div class="myy-roof"></div><div class="myy-side"></div></div>
 <div class="myy-gate"></div><div class="myy-bar"></div><div class="myy-sign">ULAZ → &nbsp;&nbsp; ← IZLAZ</div>
 <div class="myy-parking" aria-label="Parking za kamione P1 do P42"></div><div class="myy-docks"></div><div class="myy-trucks"></div></div></div>
 <div class="myy-help">3D: POVUCI MIŠ = ROTACIJA · CTRL + KOTAČIĆ = ZOOM</div></div></div>`;
 main.appendChild(s);
 const nav=document.querySelector('.nav');
 if(nav&&!nav.querySelector('[data-view="myYard"]')){
   const b=document.createElement('button');b.className='nav-btn';b.dataset.view='myYard';b.innerHTML='<span>◆</span> MY YARD';
   const docks=nav.querySelector('[data-view="docks"]');(docks||nav.lastElementChild)?.insertAdjacentElement(docks?'beforebegin':'beforebegin',b)
 }
 // Hard remove any legacy Dvorište button that may be recreated by old code.
 document.querySelectorAll('[data-view="yard"]').forEach(x=>x.remove());
 const world=s.querySelector('.myy-world');
 const apply=()=>{world.className='myy-world '+(st.mode==='3d'?'d3':'d2');world.style.setProperty('--rz',st.rz+'deg');world.style.setProperty('--sc',st.sc);s.querySelectorAll('[data-myy]').forEach(b=>b.classList.toggle('active',b.dataset.myy===st.mode));s.querySelector('.myy-help').style.display=st.mode==='3d'?'block':'none'};
 s.querySelectorAll('[data-myy]').forEach(b=>b.onclick=e=>{e.stopPropagation();st.mode=b.dataset.myy;apply()});
 s.querySelectorAll('[data-day]').forEach(b=>b.onclick=e=>{e.stopPropagation();st.date=addDays(st.date||isoToday(),Number(b.dataset.day));render()});
 s.querySelector('[data-today]').onclick=e=>{e.stopPropagation();st.date=isoToday();render()};
 s.querySelector('.myy-date').onchange=e=>{if(e.target.value){st.date=e.target.value;render()}};
 s.addEventListener('pointerdown',e=>{if(st.mode!=='3d'||e.button!==0||e.target.closest('button,input'))return;st.drag=true;st.x=e.clientX});
 s.addEventListener('pointermove',e=>{
   if(!st.drag)return;
   if((e.buttons&1)!==1){st.drag=false;return}
   st.rz+=(e.clientX-st.x)*.16;st.x=e.clientX;requestAnimationFrame(apply)
 });
 const stopLegacyDrag=()=>{st.drag=false};
 window.addEventListener('pointerup',stopLegacyDrag,true);
 window.addEventListener('blur',stopLegacyDrag,true);
 s.addEventListener('pointercancel',stopLegacyDrag);
 s.addEventListener('lostpointercapture',stopLegacyDrag);
 s.addEventListener('wheel',e=>{if(st.mode!=='3d')return;e.preventDefault();st.sc=Math.max(.5,Math.min(1.08,st.sc-e.deltaY*.0006));requestAnimationFrame(apply)},{passive:false});
 apply();
}
function stateOf(a,selected){
 const s=String(a.status||'').toLowerCase();
 /* 2D uses the same authoritative operational status as 3D for every date. */
 if(a.rejectedAt||s.includes('odbij'))return'rejected';
 if(a.gateOutAt||a.completedAt||a.receivedAt||s.includes('zaprim')||s.includes('završ')||s.includes('izašao'))return'done';
 if(a.dockArrivalAt||s.includes('rampi'))return'dock';
 if(a.yardArrivalAt||s.includes('dvori')||s.includes('ček'))return'yard';
 if(a.gateCheckedAt||a.actualDate||a.actualTime||s.includes('porta')||s.includes('gate')||s.includes('ulaz'))return'gate';
 return'incoming'
}
function dockX(n,dock){
 const count=Math.max(1,n),gap=8,maxW=58,minW=34;
 const usable=620-gap*Math.max(0,count-1);
 const w=Math.max(minW,Math.min(maxW,usable/count));
 /* R1 always starts at the LEFT side of the warehouse; R2..Rn continue right. */
 return 286+(dock-1)*(w+gap);
}
function parkingSlot(a,i){
 const raw=String(a.yardPosition||'').toUpperCase();
 let idx=/^P([1-9]|[1-3][0-9]|4[0-2])$/.test(raw)?Number(raw.slice(1))-1:-1;
 if(idx<0)idx=Math.max(0,Math.min(41,i));
 return {idx,col:idx%21,row:Math.floor(idx/21)};
}
function pos(a,i,n,q){
 const dock=Math.max(1,Math.min(Math.max(1,n),Number(a.dock)||1));
 if(q==='dock')return{x:dockX(n,dock)-26,y:307,r:90};
 if(q==='yard'){
   const p=parkingSlot(a,i);
   return{x:232+(p.idx%21)*41,y:530+Math.floor(p.idx/21)*58,r:90};
 }
 if(q==='gate')return{x:95+(i%2)*82,y:505+(i%2)*48,r:0};
 if(q==='rejected')return{x:-85,y:555+(i%2)*48,r:180};
 if(q==='done')return{x:-175,y:485+(i%2)*45,r:180};
 return{x:-175-(i%4)*145,y:335+(i%4)*55,r:0}
}
function truck(a,i,n,selected){
 const q=stateOf(a,selected),p=pos(a,i,n,q);
 const pallets=Math.max(0,Number(a.pallets||a.palettes||a.palette||0)||0);
 const sizeClass=pallets<15?'small':'long';
 const supplier=esc(a.supplier||'DOBAVLJAČ');
 return `<div class="myy-truck ${q} ${sizeClass}" data-id="${esc(a.id)}" title="Klikni za detalje najave" style="left:${p.x}px;top:${p.y}px;--tr:${p.r}deg;--from-r:${q==='dock'?'0':p.r}deg;transform:translateZ(28px) rotate(${p.r}deg)">
 <div class="myy-label">${esc(a.time||'--:--')} · ${supplier} · ${esc(a.plannedPlate||a.arrivalPlate||'')}</div>
 <div class="myy-trailer"><span class="myy-supplier-side">${supplier}</span></div><div class="myy-cab"></div><i class="myy-wheel myy-w1"></i><i class="myy-wheel myy-w2"></i><i class="myy-wheel myy-w3"></i></div>`
}
function render(){
 ensure();const s=document.getElementById('myYard');if(!s)return;
 const w=wh(),d=st.date||isoToday(),n=ramps(w),today=isoToday();
 const isToday=d===today;
 s.querySelector('.myy-date').value=d;
 s.querySelector('.myy-date-title').textContent=d===today?'DANAS · '+prettyDate(d):(d===addDays(today,1)?'SUTRA · ':'')+prettyDate(d);
 const dayData=data().filter(a=>(a.warehouse||yardivoCanonicalWarehouseV583())===w&&a.date===d);
 const parkingSlots=Array.from({length:42},(_,i)=>`P${i+1}`);
 if(isToday){
   const parked=dayData.filter(a=>stateOf(a,d)==='yard');
   const used=new Set(parked.map(a=>String(a.yardPosition||'').toUpperCase()).filter(x=>parkingSlots.includes(x)));
   let changed=false;
   parked.forEach(a=>{
     const cur=String(a.yardPosition||'').toUpperCase();
     if(!parkingSlots.includes(cur)){
       const free=parkingSlots.find(x=>!used.has(x));
       if(free){a.yardPosition=free;used.add(free);changed=true}
     }
   });
   if(changed){try{saveAnnouncements()}catch(e){}}
 }
 const parking=s.querySelector('.myy-parking');
 if(parking)parking.innerHTML=parkingSlots.map((slot,i)=>{
   const a=dayData.find(x=>stateOf(x,d)==='yard'&&String(x.yardPosition||'').toUpperCase()===slot);
   return `<div class="myy-park ${a?'occupied':''}" data-parking="${slot}" style="--pc:${i%21};--pr:${Math.floor(i/21)}"><b>${slot}</b>${a?'<i></i>':''}</div>`;
 }).join('');
 s.querySelector('.myy-meta').textContent=`${(typeof warehouseOptionLabel==='function'?warehouseOptionLabel(w):w)} · ${dayData.length} NAJAVA · ${isToday?'LIVE':'PLAN DANA'}`;
 const docks=s.querySelector('.myy-docks');
 docks.innerHTML=Array.from({length:n},(_,i)=>{
   const busy=dayData.some(a=>stateOf(a,d)==='dock'&&Number(a.dock)===i+1);
   const planned=dayData.some(a=>Number(a.dock)===i+1);
   let locked=false;try{locked=!!YardivoRampConfig?.isLocked?.(w,i+1)}catch(e){}
   return `<div class="myy-dock ${busy?'busy':''} ${locked?'locked':''}" style="left:${dockX(n,i+1)}px;width:${Math.max(34,Math.min(58,(620-8*Math.max(0,n-1))/Math.max(1,n)))}px">R${i+1}${!isToday&&planned?' · PLAN':''}</div>`
 }).join('');
 const list=dayData.slice(-18);
 const host=s.querySelector('.myy-trucks');
 host.innerHTML=list.length?list.map((a,i)=>truck(a,i,n,d)).join(''):`<div class="myy-empty">NEMA NAJAVA ZA ${esc(prettyDate(d))}</div>`;
}
function ensureInfoModal(){
 if(document.getElementById('yardivoAnnouncementInfoModal'))return;
 const m=document.createElement('div');m.id='yardivoAnnouncementInfoModal';
 m.innerHTML=`<div class="yai-card" role="dialog" aria-modal="true" aria-labelledby="yaiTitle"><div class="yai-head"><div><small>YARDIVO · INFO NAJAVE</small><h2 id="yaiTitle">NAJAVA</h2></div><button class="yai-close" type="button" aria-label="Zatvori">×</button></div><div class="yai-grid"></div></div>`;
 document.body.appendChild(m);
 m.querySelector('.yai-close').onclick=()=>m.classList.remove('open');
 m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('open')});
}
function openTruckInfo(id){
 ensureInfoModal();
 const a=data().find(x=>String(x.id)===String(id)); if(!a)return;
 const m=document.getElementById('yardivoAnnouncementInfoModal');
 const ref=typeof announcementNumber==='function'?announcementNumber(a):(a.announcementRef||a.id||'—');
 m.querySelector('#yaiTitle').textContent='NAJAVA '+ref;
 const plate=a.plannedPlate||a.arrivalPlate||a.plate||'—';
 const driver=a.plannedDriver||a.arrivalDriver||a.driver||'—';
 const trailer=a.plannedTrailer||a.trailer||'—';
 const phone=a.plannedPhone||a.phone||'—';
 const whDisplay=(typeof warehouseOptionLabel==='function'?warehouseOptionLabel(a.warehouse||''):a.warehouse)||'—';
 const vals=[['DOBAVLJAČ',a.supplier||'—'],['STATUS',a.status||'—'],['DATUM',a.date||'—'],['TERMIN',a.time||'—'],['SKLADIŠTE',whDisplay],['RAMPA',a.dock?('R'+a.dock):'—'],['PALETE',a.pallets??'—'],['SKU',a.sku??'—'],['TABLICA',plate],['VOZAČ',driver],['PRIKOLICA',trailer],['TELEFON',phone],['NARUDŽBA',a.orderNumber||'—'],['ODGOVORNA OSOBA',a.responsible||'—']];
 m.querySelector('.yai-grid').innerHTML=vals.map(([k,v])=>`<div class="yai-item"><small>${esc(k)}</small><b>${k==='STATUS'?'<span class="yai-status">'+esc(v)+'</span>':esc(v)}</b></div>`).join('');
 m.classList.add('open');
}
function show(){
 ensure();
 document.body.classList.remove('home-menu-mode');
 document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
 document.getElementById('myYard')?.classList.add('active');
 document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='myYard'));
 const pt=document.getElementById('pageTitle');if(pt)pt.textContent='◆ MY YARD';
 const sub=document.getElementById('pageSubtitle');if(sub)sub.textContent='3D pregled dvorišta, rampi i kamiona';
 render();
 window.scrollTo(0,0);
}
document.addEventListener('click',e=>{
 const t=e.target.closest('#myYard .myy-truck');
 if(t){e.preventDefault();e.stopPropagation();openTruckInfo(t.dataset.id);return}
 const b=e.target.closest('[data-view="myYard"]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();show()
},true);
window.addEventListener('load',()=>setTimeout(()=>{ensure();document.querySelectorAll('[data-view="yard"],#yard').forEach(x=>x.remove());render()},800));
setInterval(()=>{document.querySelectorAll('[data-view="yard"],#yard').forEach(x=>x.remove());if(document.getElementById('myYard')?.classList.contains('active'))render()},1800);
window.YardivoMyYard={render,show,setDate:function(d){st.date=d;render()}};
})();
