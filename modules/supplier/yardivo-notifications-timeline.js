
(function(){
 const steps=['Najavljen','Porta','U dvorištu','Na rampi','Istovar','Zaprimljeno','Izlaz'];
 function roleName(){
   const r=(window.currentSession&&currentSession.role)||'Admin';
   return String(r);
 }
 function statusIndex(a){
   const s=typeof operationalPlanStatus==='function'?operationalPlanStatus(a):(a.status||'U dolasku');
   if(s==='Zaprimljeno')return 5;if(s==='Na rampi')return 3;if(s==='U dvorištu')return 2;
   if(a.actualArrival||a.gateInAt)return 1;return 0;
 }
 window.openTruckTimeline=function(a){
   const m=document.getElementById('truckTimelineModal');if(!m)return;
   document.getElementById('timelineTitle').textContent='TIJEK KAMIONA · '+(a.supplier||'Dobavljač');
   document.getElementById('timelineSub').textContent=[a.plate||a.truckPlate||'Tablice nisu unesene',a.driver||a.driverName||'',warehouseOptionLabel(a.warehouse||yardivoCanonicalWarehouseV583()),a.dock?'Rampa '+a.dock:''].filter(Boolean).join(' · ');
   const idx=statusIndex(a);
   const times=[a.createdAt||a.date+' '+a.time,a.gateInAt||a.actualArrival,a.yardInAt,a.dockAt,a.unloadStartedAt,a.receivedAt||a.completedAt,a.gateOutAt];
   document.getElementById('timelineSteps').innerHTML=steps.map((s,i)=>`<div class="tl-step ${i<idx?'done':i===idx?'current':''}"><div class="tl-dot">${i<idx?'✓':i+1}</div><div><strong>${s}</strong><small>${times[i]?String(times[i]).replace('T',' ').slice(0,16):(i<idx?'Evidentirano':i===idx?'TRENUTNO':'Čeka')}</small></div></div>`).join('');
   m.classList.add('open');m.setAttribute('aria-hidden','false');
 };
 function notifications(){
   const arr=(typeof announcements!=='undefined'&&Array.isArray(announcements)?announcements:[]),today=window.yardivoLocalDateV583(),role=roleName().toLowerCase();
   const wh=typeof dashboardWarehouse==='function'?dashboardWarehouse():null;
   const data=arr.filter(a=>a.date===today&&(!wh||wh==='ALL'||(a.warehouse||yardivoCanonicalWarehouseV583())===wh));
   const n=[];
   data.forEach(a=>{
     const s=typeof operationalPlanStatus==='function'?operationalPlanStatus(a):(a.status||'U dolasku');
     const base={a,time:a.time||'',supplier:a.supplier||'Dobavljač'};
     if(['admin','prijam','voditelj'].some(x=>role.includes(x))){
       if(s==='Kašnjenje')n.push({...base,type:'warn',ico:'⏱',title:'Kamion kasni',text:`${base.supplier} · ${base.time} · ${a.dock?'Rampa '+a.dock:'rampa nije dodijeljena'}`});
       if(s==='NO-SHOW'||s==='NIJE DOŠAO'||s==='Nije došao')n.push({...base,type:'danger',ico:'!',title:'Kamion nije došao',text:`${base.supplier} · planirano ${base.time}`});
       if(s==='U dvorištu')n.push({...base,type:'good',ico:'↦',title:'Kamion je u dvorištu',text:`${base.supplier} · ${a.plate||a.truckPlate||'bez tablica'} · ide na ${a.dock?'Rampu '+a.dock:'dodjelu rampe'}`});
     }
     if(['admin','porta','prijava'].some(x=>role.includes(x))){
       if(s==='U dolasku')n.push({...base,type:'',ico:'🚚',title:'Očekivani dolazak',text:`${base.supplier} · ${base.time} · ${a.plate||a.truckPlate||'tablice nisu unesene'}`});
     }
     if(['admin','zali','prijam','voditelj'].some(x=>role.includes(x))){
       if(s==='Na rampi')n.push({...base,type:'warn',ico:'▥',title:'Istovar na rampi',text:`${base.supplier} · ${a.dock?'Rampa '+a.dock:'rampa'} · ${a.pallets||0} paleta`});
       if(s==='Odbijen')n.push({...base,type:'danger',ico:'×',title:'Pošiljka odbijena',text:`${base.supplier} · provjeri razlog odbijanja`});
     }
   });
   return n.slice(0,30);
 }
 window.renderNotificationCenter=function(){
   const list=document.getElementById('notifList'),count=document.getElementById('notifCount'),lab=document.getElementById('notifRoleLabel');if(!list)return;
   const ns=notifications();count.textContent=ns.length;count.style.display=ns.length?'grid':'none';lab.textContent='Odjel: '+roleName();
   list.innerHTML=ns.length?ns.map((x,i)=>`<div class="notif-item ${x.type}" data-ni="${i}"><div class="notif-ico">${x.ico}</div><div><strong>${x.title}</strong><p>${x.text}</p></div><span class="notif-time">${x.time}</span></div>`).join(''):'<div class="notif-empty">Nema novih operativnih obavijesti.</div>';
   [...list.querySelectorAll('.notif-item')].forEach((el,i)=>el.onclick=()=>openTruckTimeline(ns[i].a));
 };
 const bell=document.getElementById('notifBell'),panel=document.getElementById('notifPanel');
 if(bell)bell.onclick=null;
 document.getElementById('notifClose')?.addEventListener('click',()=>panel.classList.remove('open'));
 document.getElementById('timelineClose')?.addEventListener('click',()=>document.getElementById('truckTimelineModal').classList.remove('open'));
 document.getElementById('truckTimelineModal')?.addEventListener('click',e=>{if(e.target.id==='truckTimelineModal')e.currentTarget.classList.remove('open')});
 document.addEventListener('click',e=>{if(panel&&!panel.contains(e.target)&&e.target!==bell)panel.classList.remove('open')});
 /* legacy notification interval disabled by YARDIVO V5 */
 /* legacy notification startup disabled by YARDIVO V5 */
})();
