
(function(){
'use strict';

function locCode(){
  try{return String(window.currentSession?.location||'').toUpperCase()}catch(_){return''}
}
function locLabel(code){
  const id=String(code||'').trim();
  if(!id)return'LOKACIJA NIJE ODABRANA';
  try{
    const d=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}');
    const x=(d.locations||[]).find(v=>v&&v.active!==false&&String(v.id)===id);
    if(x?.name)return String(x.name);
  }catch(_){}
  try{
    const x=window.YardivoAppStateV583?.locations?.().find(v=>String(v.id)===id);
    if(x?.name)return String(x.name);
  }catch(_){}
  return id;
}
function currentWh(){
  try{
    const a=String((typeof activeWarehouse!=='undefined'?activeWarehouse:window.activeWarehouse)||'').trim();
    if(a&&a!=='ALL'){
      const rows=window.YardivoAppStateV583?.warehouses?.()||[];
      if(!rows.length||rows.some(w=>String(w.id)===a))return a;
    }
  }catch(_){}
  const loc=locCode();
  try{
    const rows=window.YardivoAppStateV583?.warehouses?.()||[];
    const w=rows.find(x=>x&&x.active!==false&&String(x.location_id)===loc);
    if(w?.id)return String(w.id);
  }catch(_){}
  try{
    const rows=typeof warehousesForLocation==='function'?warehousesForLocation(loc):[];
    if(rows?.length)return String(rows[0]);
  }catch(_){}
  return '';
}
function whMeta(code){
  try{
    const rows=window.YardivoAppStateV583?.warehouses?.()||[];
    const w=rows.find(x=>String(x.id)===String(code));
    if(w)return {code:String(w.id),name:String(w.name||w.id),location:locLabel(w.location_id||locCode()),ramps:Number(w.ramps||0)};
  }catch(_){}
  try{
    const w=(typeof WAREHOUSES!=='undefined'?WAREHOUSES?.[code]:null)||{};
    return {code,name:w.name||code||'—',location:w.location||locLabel(locCode()),ramps:Number(w.ramps||0)};
  }catch(_){return {code,name:code||'—',location:locLabel(locCode()),ramps:0}}
}
function allowedWh(){
  const loc=locCode();
  try{
    const x=window.YardivoAppStateV583?.warehouses?.()||[];
    const ids=x.filter(w=>w&&w.active!==false&&String(w.location_id)===loc).map(w=>String(w.id));
    if(ids.length)return ids;
  }catch(_){}
  try{
    const x=typeof warehousesForLocation==='function'?warehousesForLocation(loc):[];
    if(Array.isArray(x)&&x.length)return x.map(String);
  }catch(_){}
  return [];
}
function today(){return window.yardivoLocalDateV583()}
function anns(){
  try{return Array.isArray(announcements)?announcements:[]}catch(_){return[]}
}
function incs(){
  try{return Array.isArray(incidents)?incidents:[]}catch(_){return[]}
}
function scopeRows(){
  const wh=currentWh(),d=today();
  return anns().filter(a=>String(a.date||a.actualDate||'')===d&&String(a.warehouse||'')===String(wh));
}
function status(a){
  try{
    if(typeof normalizedPlanStatus==='function')return String(normalizedPlanStatus(a)||'');
    if(typeof operationalPlanStatus==='function')return String(operationalPlanStatus(a)||'');
  }catch(_){}
  return String(a?.status||'');
}
function hasArrived(a){
  try{
    if(typeof hasPhysicallyArrived==='function')return !!hasPhysicallyArrived(a);
  }catch(_){}
  return !!(a?.actualDate||a?.yardArrivalAt||/dvori|rampi|zaprim/i.test(status(a)));
}
function late(a){
  try{
    if(typeof operationalDelayMinutes==='function')return Number(operationalDelayMinutes(a)||0)>15;
    if(typeof delayMinutes==='function')return Number(delayMinutes(a)||0)>15;
  }catch(_){}
  if(!a?.date||!a?.time)return false;
  const p=new Date(`${a.date}T${a.time}:00`).getTime();
  return !hasArrived(a)&&Date.now()>p+15*60000;
}
function plate(a){
  try{
    if(typeof effectivePlate==='function')return effectivePlate(a)||a.plannedPlate||a.vehiclePlate||a.plate||'';
  }catch(_){}
  return a?.plannedPlate||a?.vehiclePlate||a?.plate||a?.registration||'';
}
function openIncidentFor(a){
  return incs().find(i=>{
    const open=!/zatvoren|closed|resolved|riješen|rijesen/i.test(String(i.status||''));
    return open&&String(i.announcementId||'')===String(a?.id||'');
  });
}

/* ---------- GLOBAL CONTEXT ---------- */
function ensureContext(){
  const top=document.querySelector('.topbar');
  if(!top||document.getElementById('yardivoGlobalContext'))return;
  const first=top.firstElementChild;
  const box=document.createElement('div');
  box.id='yardivoGlobalContext';
  box.innerHTML=`
    <div class="ygc-location">
      <span class="ygc-kicker">AKTIVNA LOKACIJA</span>
      <strong id="ygcLocation">—</strong>
    </div>
    <div class="ygc-warehouse">
      <select id="ygcWarehouseSelect" aria-label="Aktivno skladište"></select>
      <span id="ygcWarehouseCode">SKLADIŠTE</span>
      <strong id="ygcWarehouseName">—</strong>
    </div>
    <span class="ygc-live"><i></i> LIVE CONTEXT</span>`;
  first?.insertAdjacentElement('afterend',box);
  document.getElementById('ygcWarehouseSelect')?.addEventListener('change',e=>{
    const code=e.target.value;
    try{
      if(typeof window.setGlobalWarehouse==='function')window.setGlobalWarehouse(code);
      else{
        if(typeof activeWarehouse!=='undefined')activeWarehouse=code;
        const old=document.getElementById('globalWarehouse');
        if(old){old.value=code;old.dispatchEvent(new Event('change',{bubbles:true}))}
      }
    }catch(_){}
    setTimeout(refreshAll,20);
  });
}
function renderContext(){
  ensureContext();
  const loc=locCode(),wh=currentWh(),m=whMeta(wh);
  const l=document.getElementById('ygcLocation');if(l)l.textContent=locLabel(loc);
  const code=document.getElementById('ygcWarehouseCode');if(code)code.textContent=`${m.code} · AKTIVNO SKLADIŠTE`;
  const name=document.getElementById('ygcWarehouseName');if(name)name.textContent=String(m.name||m.code).toUpperCase();

  const sel=document.getElementById('ygcWarehouseSelect');
  if(sel){
    const allowed=allowedWh();
    const sig=allowed.join('|');
    if(sel.dataset.sig!==sig){
      sel.dataset.sig=sig;
      sel.innerHTML=allowed.map(w=>`<option value="${w}">${w}</option>`).join('');
    }
    if(allowed.includes(wh))sel.value=wh;
  }
}

/* ---------- EXECUTIVE DASHBOARD ---------- */
function ensureExecutive(){
  const view=document.getElementById('dashboard');
  if(!view||document.getElementById('yardivoExecutiveLive'))return;
  const first=view.firstElementChild;
  const box=document.createElement('section');
  box.id='yardivoExecutiveLive';
  box.innerHTML=`
    <div class="yex-head">
      <div class="yex-title"><i class="yex-pulse"></i><div><strong>EXECUTIVE LIVE · DANAS</strong><small id="yexContext">—</small></div></div>
      <span class="yex-risk ok" id="yexRisk">STABILNO</span>
    </div>
    <div class="yex-grid">
      <div class="yex-kpi"><small>NAJAVE</small><strong id="yexTotal">0</strong><span>danas u skladištu</span></div>
      <div class="yex-kpi"><small>NA LOKACIJI</small><strong id="yexYard">0</strong><span>stiglo / u procesu</span></div>
      <div class="yex-kpi"><small>NA RAMPI</small><strong id="yexDock">0</strong><span>aktivni prijami</span></div>
      <div class="yex-kpi"><small>RAMPE</small><strong id="yexRamps">0/0</strong><span>trenutno zauzeto</span></div>
      <div class="yex-kpi"><small>OPTEREĆENJE</small><strong id="yexLoad">0%</strong><span>palete / dnevni kapacitet</span><div class="yex-loadbar"><i id="yexLoadBar" style="width:0%"></i></div></div>
      <div class="yex-kpi"><small>ATTENTION</small><strong id="yexAttention">0</strong><span>kašnjenja + incidenti</span></div>
    </div>`;
  if(first)first.insertAdjacentElement('beforebegin',box);else view.prepend(box);
}
function renderExecutive(){
  ensureExecutive();
  const rows=scopeRows(),wh=currentWh(),m=whMeta(wh);
  const total=rows.length;
  const yard=rows.filter(hasArrived).filter(a=>!/zaprim|završ|odbij/i.test(status(a))).length;
  const dock=rows.filter(a=>/rampi/i.test(status(a))).length;
  const lateN=rows.filter(late).length;
  const openInc=incs().filter(i=>{
    const open=!/zatvoren|closed|resolved|riješen|rijesen/i.test(String(i.status||''));
    return open&&String(i.warehouse||'').toUpperCase()===wh;
  }).length;
  let rampCount=m.ramps||0;
  try{rampCount=Number(window.YardivoRampConfig?.count?.(wh)||rampCount||0)}catch(_){}
  const pallets=rows.reduce((s,a)=>s+Number(a.pallets||0),0);
  let cap=null;
  try{if(typeof getWarehouseCapacity==='function')cap=getWarehouseCapacity(wh)}catch(_){}
  const capKnown=Number.isFinite(Number(cap))&&Number(cap)>0;
  const load=capKnown?Math.min(100,Math.max(0,Math.round(pallets/Number(cap)*100))):null;
  const att=lateN+openInc;

  const vals={yexTotal:total,yexYard:yard,yexDock:dock,yexRamps:`${dock}/${rampCount||'—'}`,yexLoad:capKnown?`${load}%`:'NEPOZNAT',yexAttention:att};
  Object.entries(vals).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=String(v)});
  const bar=document.getElementById('yexLoadBar');if(bar)bar.style.width=(capKnown?load:0)+'%';
  const ctx=document.getElementById('yexContext');if(ctx)ctx.textContent=`${locLabel(locCode())} · ${warehouseOptionLabel(wh)||m.name||'Skladište'}`;
  const risk=document.getElementById('yexRisk');
  if(risk){
    risk.className='yex-risk '+(att>=4?'bad':att>0?'warn':'ok');
    risk.textContent=att>=4?`${att} KRITIČNO`:att>0?`${att} ZA PAŽNJU`:'STABILNO';
  }
}

/* ---------- CONTROL TOWER LIVE FLOW ---------- */
const STAGES=[
  {key:'planned',label:'U DOLASKU'},
  {key:'waiting',label:'DVORIŠTE / ČEKANJE'},
  {key:'dock',label:'NA RAMPI'},
  {key:'done',label:'ZAPRIMLJENO'},
  {key:'issue',label:'ATTENTION'}
];
function stageFor(a){
  if(openIncidentFor(a)||late(a))return'issue';
  const s=status(a).toLowerCase();
  if(/zaprim|završ/.test(s))return'done';
  if(/rampi/.test(s))return'dock';
  if(/dvori|ček|cekan|stig/.test(s)||hasArrived(a))return'waiting';
  return'planned';
}
function ensureCtFlow(){
  const view=document.getElementById('controlTower');
  if(!view||document.getElementById('yardivoCtLiveFlow'))return;
  const title=view.querySelector('.section-title');
  const box=document.createElement('section');box.id='yardivoCtLiveFlow';
  box.innerHTML=`
    <div class="yctf-head">
      <div><h2>LIVE FLOW · KAMIONI</h2><small id="yctfContext">Ulaz → dvorište → rampa → zaprimljeno</small></div>
      <span class="yctf-now" id="yctfNow">—</span>
    </div>
    <div class="yctf-wrap"><div class="yctf-lane" id="yctfLane"></div></div>`;
  title?.insertAdjacentElement('afterend',box);
}
function renderCtFlow(){
  ensureCtFlow();
  const lane=document.getElementById('yctfLane');if(!lane)return;
  const rows=scopeRows(),wh=currentWh();
  lane.innerHTML=STAGES.map(st=>{
    const items=rows.filter(a=>stageFor(a)===st.key);
    return `<section class="yctf-stage">
      <div class="yctf-stage-head"><strong>${st.label}</strong><b>${items.length}</b></div>
      <div class="yctf-trucks">${items.length?items.map(a=>{
        const problem=openIncidentFor(a),isLate=late(a);
        const cls=problem?'incident':isLate?'late':'';
        return `<article class="yctf-truck ${cls}" data-ct-announcement="${a.id}">
          <span class="truck-icon">🚚</span>
          <strong>${plate(a)||a.supplier||'KAMION'}</strong>
          <small>${a.supplier||'—'} · ${a.time||'—'}${a.dock?` · R${a.dock}`:''}</small>
        </article>`;
      }).join(''):`<div class="yctf-empty">Nema kamiona</div>`}</div>
    </section>`;
  }).join('');
  const ctx=document.getElementById('yctfContext');if(ctx)ctx.textContent=`${locLabel(locCode())} · ${wh} · Ulaz → dvorište → rampa → zaprimljeno`;
  const now=document.getElementById('yctfNow');if(now)now.textContent=`SADA ${new Date().toLocaleTimeString('hr-HR',{hour:'2-digit',minute:'2-digit'})}`;
}
document.addEventListener('click',e=>{
  const card=e.target.closest?.('[data-ct-announcement]');if(!card)return;
  try{
    const id=card.dataset.ctAnnouncement;
    if(typeof openAnnouncementDetail==='function')openAnnouncementDetail(Number(id),'controlTower');
  }catch(_){}
},true);

let sig='';
function refreshAll(){
  renderContext();
  renderExecutive();
  renderCtFlow();
}
function fingerprint(){
  return [
    locCode(),currentWh(),anns().length,incs().length,
    scopeRows().map(a=>`${a.id}:${status(a)}:${a.dock||''}:${a.actualTime||''}:${a.yardArrivalAt||''}`).join(',')
  ].join('|');
}
function smartRefresh(){
  const n=fingerprint();
  if(n!==sig){sig=n;refreshAll()}
  else{
    renderContext();
    const now=document.getElementById('yctfNow');if(now)now.textContent=`SADA ${new Date().toLocaleTimeString('hr-HR',{hour:'2-digit',minute:'2-digit'})}`;
  }
}

window.addEventListener('load',()=>setTimeout(refreshAll,1100));
window.addEventListener('yardivo:login',()=>setTimeout(refreshAll,350));
window.addEventListener('yardivo:data-synced',()=>setTimeout(refreshAll,70));
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view],[data-home-target],.warehouse-card'))setTimeout(refreshAll,60);
},true);
document.getElementById('globalWarehouse')?.addEventListener('change',()=>setTimeout(refreshAll,20));
document.getElementById('homeLocationSelect')?.addEventListener('change',()=>setTimeout(refreshAll,30));
setInterval(smartRefresh,5000);

window.YardivoExecutiveContextV583={refresh:refreshAll,currentWarehouse:currentWh,location:locCode};
})();
