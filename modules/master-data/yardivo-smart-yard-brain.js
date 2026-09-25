
(function(){
  function anns(){try{return Array.isArray(announcements)?announcements:[]}catch(e){return []}}
  function mins(t){const p=String(t||'00:00').split(':').map(Number);return (p[0]||0)*60+(p[1]||0)}
  function fmt(m){m=Math.max(0,Math.round(m));return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`}
  function durationFor(a){
    const p=Number(a?.pallets||document.querySelector('[name="pallets"]')?.value||document.getElementById('pallets')?.value||33);
    return Math.max(45,Math.min(150,Math.round(35+p*1.15)));
  }
  function whOfForm(){
    return document.getElementById('warehouse')?.value||document.getElementById('announcementWarehouse')?.value||window.activeWarehouse||yardivoCanonicalWarehouseV583();
  }
  function dateOfForm(){return document.querySelector('input[type="date"]')?.value||window.yardivoLocalDateV583()}
  function timeOfForm(){return document.querySelector('input[type="time"]')?.value||'08:00'}
  function dockCount(wh){try{return Math.max(0,Number(WAREHOUSES?.[wh]?.ramps)||0)}catch(e){return 0}}
  function intervalsForRamp(wh,date,ramp,ignoreId){
    return anns().filter(a=>(a.warehouse||yardivoCanonicalWarehouseV583())===wh&&a.date===date&&Number(a.dock)===Number(ramp)&&Number(a.id)!==Number(ignoreId)).map(a=>{
      const st=mins(a.time),dur=Number(a.duration||durationFor(a));return {a,start:st,end:st+dur}
    }).sort((x,y)=>x.start-y.start)
  }
  function findNextGap(wh,date,ramp,desired,duration){
    let s=desired;
    const iv=intervalsForRamp(wh,date,ramp);
    for(let guard=0;guard<30;guard++){
      const c=iv.find(x=>s<x.end && s+duration>x.start);
      if(!c)return {start:s,conflict:null};
      s=c.end;
    }
    return {start:s,conflict:null};
  }
  function rampLoad(wh,date,ramp){
    return intervalsForRamp(wh,date,ramp).reduce((s,x)=>s+(x.end-x.start),0);
  }
  window.yardivoSmartRecommendation=function(opts={}){
    const wh=opts.warehouse||whOfForm(),date=opts.date||dateOfForm(),desired=mins(opts.time||timeOfForm());
    const pallets=Number(opts.pallets||document.getElementById('pallets')?.value||33);
    const dur=Math.max(45,Math.min(150,Math.round(35+pallets*1.15)));
    const n=dockCount(wh);
    const candidates=[];
    for(let r=1;r<=n;r++){
      if(window.YardivoRampConfig?.isLocked?.(wh,r))continue;
      const gap=findNextGap(wh,date,r,desired,dur);
      const wait=Math.max(0,gap.start-desired);
      const load=rampLoad(wh,date,r);
      const utilization=Math.min(100,Math.round(load/(16*60)*100));
      const score=Math.max(0,100-Math.round(wait*.55)-Math.round(utilization*.35));
      candidates.push({ramp:r,start:gap.start,end:gap.start+dur,wait,load,utilization,score});
    }
    candidates.sort((a,b)=>b.score-a.score||a.wait-b.wait||a.load-b.load||a.ramp-b.ramp);
    return {best:candidates[0],alternatives:candidates.slice(1,4),duration:dur,warehouse:wh,date};
  }
  function renderBrain(){
    const box=document.getElementById('yardBrainRecommendation'),score=document.getElementById('yardBrainScore'),conf=document.getElementById('yardBrainConflict');
    if(!box)return;
    const rec=yardivoSmartRecommendation();
    const b=rec.best;
    if(!b)return;
    score.textContent=`SMART SCORE ${b.score}`;
    box.innerHTML=`<div class="yard-brain-rec">
      <div><small>PREPORUČENA RAMPA</small><strong>RAMPA ${b.ramp}</strong></div>
      <div><small>PREPORUČENI TERMIN</small><strong>${fmt(b.start)}–${fmt(b.end)}</strong></div>
      <div><small>ČEKANJE</small><strong>${b.wait?b.wait+' min':'0 min'}</strong></div>
      <div><small>OPTEREĆENJE RAMPE</small><strong>${b.utilization}%</strong></div>
    </div>
    <div style="margin-top:7px;font-size:7px;color:#7f9bad">Alternative: ${rec.alternatives.map(x=>`R${x.ramp} ${fmt(x.start)} (${x.wait} min ček.)`).join(' · ')}</div>`;
    const selectedRamp=Number(document.getElementById('dock')?.value||document.getElementById('ramp')?.value||0);
    const selectedTime=mins(timeOfForm());
    if(selectedRamp){
      const dur=rec.duration;
      const conflict=intervalsForRamp(rec.warehouse,rec.date,selectedRamp).find(x=>selectedTime<x.end&&selectedTime+dur>x.start);
      if(conflict){
        conf.style.display='block';
        conf.innerHTML=`⚠ KONFLIKT: Rampa ${selectedRamp} je zauzeta ${fmt(conflict.start)}–${fmt(conflict.end)} (${conflict.a.supplier||'druga najava'}). Preporuka: Rampa ${b.ramp}, ${fmt(b.start)}.`;
      }else conf.style.display='none';
    }else conf.style.display='none';
  }

  function timerStart(a){
    const s=typeof operationalPlanStatus==='function'?operationalPlanStatus(a):(a.status||'');
    let ts=null,label='';
    if(s==='U dvorištu'){ts=a.yardInAt||a.yardArrivalAt||a.gateInAt||a.actualArrival;label='ČEKA'}
    else if(s==='Na rampi'){ts=a.dockAt||a.rampAt||a.yardInAt||a.yardArrivalAt;label='NA RAMPI'}
    if(!ts)return null;
    const d=new Date(ts); if(isNaN(d))return null;
    return {label,mins:Math.max(0,Math.floor((Date.now()-d.getTime())/60000))};
  }
  window.yardivoTimerHtml=function(a){
    const t=timerStart(a);if(!t)return '';
    const cls=t.mins>=60?'danger':t.mins>=30?'warn':'';
    return `<span class="live-timer-chip ${cls}">${t.label} ${Math.floor(t.mins/60)}h ${String(t.mins%60).padStart(2,'0')}m</span>`;
  }

  function queueData(){
    const today=window.yardivoLocalDateV583(),wh=typeof dashboardWarehouse==='function'?dashboardWarehouse():(window.activeWarehouse||yardivoCanonicalWarehouseV583());
    const data=anns().filter(a=>a.date===today&&(a.warehouse||yardivoCanonicalWarehouseV583())===wh);
    const n=dockCount(wh),out=[];
    for(let r=1;r<=n;r++){
      const current=data.find(a=>Number(a.dock)===r && (typeof operationalPlanStatus==='function'?operationalPlanStatus(a):a.status)==='Na rampi');
      const waiting=data.filter(a=>Number(a.dock)===r && ['U dvorištu','U dolasku','Kašnjenje'].includes(typeof operationalPlanStatus==='function'?operationalPlanStatus(a):a.status))
        .sort((a,b)=>mins(a.time)-mins(b.time));
      out.push({r,current,waiting});
    }
    return out;
  }
  window.renderRampQueue=function(){
    const host=document.getElementById('rampQueueGrid');if(!host)return;
    host.innerHTML=queueData().map(x=>`<div class="ramp-queue-card">
      <div class="ramp-queue-head"><strong>RAMPA ${x.r}</strong><span style="color:${x.current?'#ff6f75':'#66dc8a'}">${x.current?'ZAUZETO':'SLOBODNA'}</span></div>
      <div class="ramp-queue-current"><small>TRENUTNO</small>${x.current?`<strong>${x.current.supplier}</strong><div>${x.current.plate||x.current.plannedPlate||'—'} · ${x.current.pallets||0} pal. ${yardivoTimerHtml(x.current)}</div>`:'<strong>Rampa je slobodna</strong>'}</div>
      <div class="ramp-queue-list">${x.waiting.length?x.waiting.slice(0,5).map((a,i)=>`<div class="ramp-queue-item"><span class="queue-pos">${i+1}</span><div><strong>${a.supplier}</strong><div>${a.time||'—'} · ${a.pallets||0} pal. · ${a.plate||a.plannedPlate||'—'}</div></div><span class="queue-wait">${yardivoTimerHtml(a)||''}</span></div>`).join(''):'<div class="ramp-queue-empty">Nema kamiona u redu čekanja.</div>'}</div>
    </div>`).join('');
  };

  window.openYardivoTruckInspector=function(a){
    const panel=document.getElementById('truckInspector');if(!panel||!a)return;
    const st=typeof operationalPlanStatus==='function'?operationalPlanStatus(a):(a.status||'—');
    document.getElementById('truckInspectorTitle').textContent=a.supplier||'KAMION';
    document.getElementById('truckInspectorSub').textContent=`${a.plate||a.plannedPlate||'Bez tablica'} · ${a.driver||a.plannedDriver||'Vozač nije unesen'}`;
    document.getElementById('truckInspectorBody').innerHTML=`
      <div class="inspector-hero"><h2>${a.supplier||'—'}</h2><p>${a.plate||a.plannedPlate||'—'} · ${a.driver||a.plannedDriver||'—'} · ${warehouseOptionLabel(a.warehouse||yardivoCanonicalWarehouseV583())} · Rampa ${a.dock||'—'}</p></div>
      <div class="inspector-kpis">
        <div><small>STATUS</small><strong>${st}</strong></div>
        <div><small>PALETE</small><strong>${a.pallets||0}</strong></div>
        <div><small>SKU</small><strong>${a.sku||a.skus||0}</strong></div>
        <div><small>PLANIRANO</small><strong>${a.date||'—'} ${a.time||''}</strong></div>
        <div><small>STVARNI DOLAZAK</small><strong>${a.actualDate||'—'} ${a.actualTime||''}</strong></div>
        <div><small>TIMER</small><strong>${yardivoTimerHtml(a)||'—'}</strong></div>
      </div>
      <div class="inspector-section"><h3>OPERATIVNI PODACI</h3><div class="inspector-section-body">
        <div class="inspector-row"><span>Odgovorna osoba</span><strong>${a.responsiblePerson||a.responsible||'—'}</strong></div>
        <div class="inspector-row"><span>Rampa</span><strong>${a.dock?'Rampa '+a.dock:'—'}</strong></div>
        <div class="inspector-row"><span>Broj kamiona</span><strong>${a.trucks||1}</strong></div>
        <div class="inspector-row"><span>Trajanje</span><strong>${a.duration||durationFor(a)} min</strong></div>
        <div class="inspector-row"><span>Kašnjenje</span><strong>${typeof operationalDelayText==='function'?(operationalDelayText(a)||'—'):'—'}</strong></div>
      </div></div>
      <div class="inspector-section"><h3>TIJEK KAMIONA</h3><div class="inspector-section-body"><button class="primary" onclick="openTruckTimeline((announcements||[]).find(x=>Number(x.id)===${Number(a.id)}))">OTVORI PUNI TIMELINE</button></div></div>`;
    panel.classList.add('open');panel.setAttribute('aria-hidden','false');
  };

  document.getElementById('truckInspectorClose')?.addEventListener('click',()=>document.getElementById('truckInspector')?.classList.remove('open'));

  // Upgrade clicks in yard: inspector first, full announcement remains accessible elsewhere
  document.getElementById('yard')?.addEventListener('dblclick',e=>{
    const el=e.target.closest('[data-announcement-id]');if(!el)return;
    const a=anns().find(x=>Number(x.id)===Number(el.dataset.announcementId));
    if(a)openYardivoTruckInspector(a);
  });

  // Smart Brain: react only to its own operational announcement inputs.
  // IMPORTANT: never listen to every input/select in the whole app; Supplier Planner
  // uses selects too and global recomputation here caused noticeable UI stalls.
  const yardivoBrainRelevant = '#annDate,#annWarehouse,#annSupplier,#annPallets,#annDock,#annTime,#dock,#ramp';
  let yardivoBrainTimer=0;
  function scheduleYardivoBrain(e){
    if(!e.target?.matches?.(yardivoBrainRelevant))return;
    clearTimeout(yardivoBrainTimer);
    yardivoBrainTimer=setTimeout(renderBrain,80);
  }
  document.addEventListener('input',scheduleYardivoBrain);
  document.addEventListener('change',scheduleYardivoBrain);

  // Add timers into yard labels every refresh cycle
  const oldRenderYard=window.renderYard;
  if(typeof oldRenderYard==='function'){
    window.renderYard=function(){const r=oldRenderYard.apply(this,arguments);setTimeout(()=>{
      document.querySelectorAll('#yard [data-announcement-id]').forEach(el=>{
        const a=anns().find(x=>Number(x.id)===Number(el.dataset.announcementId));
        const label=el.querySelector('.live-semi-label');if(a&&label&&!label.querySelector('.live-timer-chip'))label.insertAdjacentHTML('beforeend',yardivoTimerHtml(a));
      });
    },30);return r};
  }

  const oldRenderRampe=window.renderRampe;
  if(typeof oldRenderRampe==='function'){
    window.renderRampe=function(){const r=oldRenderRampe.apply(this,arguments);setTimeout(renderRampQueue,30);return r};
  }

  setInterval(()=>{try{renderBrain();renderRampQueue();}catch(e){}},30000);
  setTimeout(()=>{try{renderBrain();renderRampQueue();}catch(e){}},700);
})();
