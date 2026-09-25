
(function(){
'use strict';

let draggedId=null;
let pending=null;

function currentRole(){
  let r='';try{r=String(currentSession?.role||'').toLowerCase().trim()}catch(e){}
  if(r==='zalihe'||r==='upravljanje zalihama')r='inventory';
  return r;
}
function canMove(){return ['inventory','admin'].includes(currentRole())}
function data(){try{return Array.isArray(announcements)?announcements:[]}catch(e){return[]}}
function ann(id){return data().find(a=>String(a.id)===String(id))}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function wh(a){return a?.warehouse||yardivoCanonicalWarehouseV583()}
function fmtSlot(x){return `${x.date} · ${x.time} · Rampa ${x.dock}`}
function immutable(a){
  return !!(a?.yardArrivalAt||a?.receivedAt||a?.rejectedAt||['Zaprimljeno','Odbijen','Završeno','Izašao','Na rampi','U dvorištu'].includes(String(a?.status||'')));
}

function modal(){
  let m=document.getElementById('yardivoRescheduleModal');
  if(m)return m;
  m=document.createElement('div');m.id='yardivoRescheduleModal';
  m.innerHTML=`<div class="yrm-dialog" role="dialog" aria-modal="true" aria-label="Promjena termina najave">
    <div class="yrm-head"><div><h3>PROMIJENI TERMIN</h3><small id="yrmSupplier"></small></div><button type="button" class="yrm-close">×</button></div>
    <div class="yrm-body">
      <div class="yrm-change"><div class="yrm-box"><small>STARI TERMIN</small><strong id="yrmOld"></strong></div><div class="yrm-arrow">→</div><div class="yrm-box"><small>NOVI TERMIN</small><strong id="yrmNew"></strong></div></div>
      <div class="yrm-form">
        <label>Datum<input type="date" id="yrmDate"></label>
        <label>Vrijeme<select id="yrmTime"></select></label>
        <label>Rampa<select id="yrmDock"></select></label>
      </div>
      <div class="yrm-warning" id="yrmWarning"></div>
      <div class="yrm-actions"><button type="button" class="cancel">ODUSTANI</button><button type="button" class="confirm">POTVRDI PROMJENU</button></div>
    </div>
  </div>`;
  document.body.appendChild(m);
  m.onclick=e=>{if(e.target===m)close()};
  m.querySelector('.yrm-close').onclick=close;
  m.querySelector('.cancel').onclick=close;
  ['yrmDate','yrmTime','yrmDock'].forEach(id=>m.querySelector('#'+id).addEventListener('change',validate));
  m.querySelector('.confirm').onclick=commit;
  return m;
}
function close(){
  document.getElementById('yardivoRescheduleModal')?.classList.remove('open');
  pending=null;document.body.style.overflow='';
}
function warehouseCfg(code){
  try{return WAREHOUSES?.[code]||null}catch(e){return null}
}
function populateControls(a,proposal){
  const m=modal(),cfg=warehouseCfg(wh(a));
  const date=m.querySelector('#yrmDate'),time=m.querySelector('#yrmTime'),dock=m.querySelector('#yrmDock');
  date.value=proposal.date;
  const start=cfg?.receptionStart||'06:00',end=cfg?.receptionEnd||'18:00';
  const ss=typeof toMin==='function'?toMin(start):360,ee=typeof toMin==='function'?toMin(end):1080;
  time.innerHTML='';
  for(let x=ss;x<ee;x+=15){
    const t=typeof hhmm==='function'?hhmm(x):`${String(Math.floor(x/60)).padStart(2,'0')}:${String(x%60).padStart(2,'0')}`;
    time.insertAdjacentHTML('beforeend',`<option value="${t}">${t}</option>`);
  }
  time.value=proposal.time;
  dock.innerHTML='';
  for(let d=1;d<=Number(cfg?.ramps||1);d++)dock.insertAdjacentHTML('beforeend',`<option value="${d}">Rampa ${d}</option>`);
  dock.value=String(proposal.dock);
}
function open(id,proposal){
  if(!canMove())return;
  const a=ann(id);if(!a)return;
  if(immutable(a))return alert('Termin se više ne može premještati jer je operativni prijam za ovu najavu već započeo.');
  proposal=proposal||{date:a.date,time:a.time,dock:Number(a.dock)};
  pending={id:String(id),old:{date:a.date,time:a.time,dock:Number(a.dock)},warehouse:wh(a)};
  populateControls(a,proposal);
  const m=modal();
  m.querySelector('#yrmSupplier').textContent=`${a.supplier||'—'} · ${pending.warehouse}`;
  m.querySelector('#yrmOld').textContent=fmtSlot(pending.old);
  m.classList.add('open');document.body.style.overflow='hidden';
  validate();
}
function proposal(){
  const m=modal();
  return {date:m.querySelector('#yrmDate').value,time:m.querySelector('#yrmTime').value,dock:Number(m.querySelector('#yrmDock').value)};
}
function conflictMessage(a,p){
  if(!p.date||!p.time||!p.dock)return 'Odaberi datum, vrijeme i rampu.';
  try{if(typeof isWeekendIsoEarly==='function'&&isWeekendIsoEarly(p.date))return 'Subotom i nedjeljom nema prijama robe.'}catch(e){}
  try{const h=typeof holidayNameEarly==='function'?holidayNameEarly(p.date):'';if(h)return `${h} — nema prijama robe.`}catch(e){}
  const cfg=warehouseCfg(wh(a));if(!cfg)return 'Skladište nije konfigurirano.';
  const tm=typeof toMin==='function'?toMin(p.time):0;
  const start=typeof toMin==='function'?toMin(cfg.receptionStart):0,end=typeof toMin==='function'?toMin(cfg.receptionEnd):1440;
  if(tm<start||tm>=end)return `Termin mora biti unutar radnog vremena ${cfg.receptionStart}–${cfg.receptionEnd}.`;
  const dur=Number(a.duration||0);
  if(tm+dur>end)return 'Istovar bi završio nakon radnog vremena prijama.';
  try{
    if(typeof isSlobodna==='function'&&!isSlobodna(p.date,p.dock,tm,dur,a.id,wh(a)))return 'Odabrani termin/rampa nisu slobodni ili se preklapaju s drugom najavom/blokadom.';
  }catch(e){}
  return '';
}
function validate(){
  if(!pending)return false;
  const a=ann(pending.id),p=proposal(),m=modal(),warn=m.querySelector('#yrmWarning'),btn=m.querySelector('.confirm');
  m.querySelector('#yrmNew').textContent=fmtSlot(p);
  const msg=conflictMessage(a,p);
  warn.textContent=msg;warn.classList.toggle('show',!!msg);
  const changed=p.date!==pending.old.date||p.time!==pending.old.time||Number(p.dock)!==Number(pending.old.dock);
  btn.disabled=!!msg||!changed;
  return !msg&&changed;
}
function refreshAll(){
  try{saveAnnouncements()}catch(e){}
  try{renderAnnouncements?.()}catch(e){}
  try{renderAnnouncementSchedule?.()}catch(e){}
  try{renderDailyMap?.()}catch(e){}
  try{renderWeeklyMap?.()}catch(e){}
  try{renderReceiving?.()}catch(e){}
  try{renderOverview?.()}catch(e){}
  try{YardivoOverviewMaster?.render?.()}catch(e){}
  try{renderControlTower?.()}catch(e){}
  try{refreshRecommendation?.()}catch(e){}
}
function commit(){if(!pending||!validate())return;
  const a=ann(pending.id),p=proposal(),old={...pending.old},now=new Date().toISOString();
  a.date=p.date;a.time=p.time;a.dock=Number(p.dock);
  a.updatedAt=now;a.updatedBy=currentSession?.username||currentSession?.user||currentRole();
  a.rescheduledAt=now;
  a.changeHistory=Array.isArray(a.changeHistory)?a.changeHistory:[];
  a.changeHistory.push({
    changedAt:now,type:'RESCHEDULE',
    changedBy:a.updatedBy,
    fromDate:old.date,fromTime:old.time,fromDock:old.dock,
    toDate:p.date,toTime:p.time,toDock:Number(p.dock),
    note:'Termin promijenjen drag & drop / promjena termina',
    initiatedByType:'INVENTORY',
    initiatedBy:a.updatedBy,
    approvedBy:a.updatedBy,
    acceptedBy:'',
    responsibility:'WAREHOUSE',
    kpiImpact:'WAREHOUSE_CHANGE',
    countsAsLate:false
  });
  try{window.YardivoTermProvenance?.record?.({
    announcementId:a.id,supplierDeliveryId:a.supplierDeliveryId||'',supplier:a.supplier||'',warehouse:a.warehouse||'',
    initiatedByType:'INVENTORY',initiatedBy:a.updatedBy,approvedBy:a.updatedBy,status:'APPLIED',
    before:{date:old.date,time:old.time,dock:old.dock},after:{date:p.date,time:p.time,dock:p.dock},
    reason:'Promjena termina od strane Upravljanja zalihama',responsibility:'WAREHOUSE'
  })}catch(_){}
  refreshAll();
  close();
  if(a.supplierDeliveryId){
    Promise.resolve().then(async()=>{
      try{
        await window.YardivoSupplierLiveSync?.call?.('internal_update',{
          id:a.supplierDeliveryId,
          delivery_date:p.date,
          requested_time:p.time,
          dock:'R'+String(p.dock).replace(/^R/i,''),
          status:'confirmed',
          review_note:`Upravljanje zalihama promijenilo je potvrđeni termin na ${p.date} ${p.time} · R${p.dock}. Promijenio: ${window.YardivoRescheduleAudit?.actorLabel?.()||'YARDIVO korisnik'}`
        });
        try{window.dispatchEvent(new CustomEvent('yardivo:supplier-request-updated',{detail:{id:a.supplierDeliveryId,source:'inventory-drag'}}))}catch(_){}
      }catch(err){
        console.error('YARDIVO drag supplier sync',err);
        try{showYmsToast?.('warning','SUPPLIER SYNC','Termin je promijenjen u YARDIVO-u, ali Supplier zapis nije odmah sinkroniziran.')}catch(_){}
      }
    });
  }
  try{
    const actor=window.YardivoRescheduleAudit?.actorLabel?.()||'YARDIVO korisnik';
    showYmsToast?.('success','TERMIN PROMIJENJEN',`${a.supplier} · ${p.date} ${p.time} · R${p.dock} · ${actor}`);
    window.YardivoRescheduleAudit?.push?.('TERMIN PROMIJENJEN',`${a.supplier} · ${p.date} ${p.time} · R${p.dock}`,{
      actor,warehouse:a.warehouse||'',announcementId:a.id||'',supplierDeliveryId:a.supplierDeliveryId||'',
      before:{date:old.date||'',time:old.time||'',dock:old.dock||''},
      after:{date:p.date,time:p.time,dock:p.dock},type:'inventory_drag_reschedule',
      initiatedByType:'INVENTORY',initiatedBy:actor,approvedBy:actor,responsibility:'WAREHOUSE',kpiImpact:'WAREHOUSE_CHANGE'
    });
  }catch(e){}
}

/* Drag source */
document.addEventListener('dragstart',e=>{
  const el=e.target.closest('#announcementSchedule [data-announcement-id],#dailyMapBoard [data-announcement-id],#weeklyMapBoard [data-announcement-id]');
  if(!el||!canMove())return;
  const a=ann(el.dataset.announcementId);
  if(!a||immutable(a)){e.preventDefault();return}
  draggedId=String(a.id);el.classList.add('yardivo-drag-source');document.body.classList.add('yardivo-dragging-announcement');
  try{e.dataTransfer.setData('text/plain',draggedId);e.dataTransfer.effectAllowed='move'}catch(err){}
},true);
document.addEventListener('dragend',e=>{
  e.target.closest('[data-announcement-id]')?.classList.remove('yardivo-drag-source');
  document.body.classList.remove('yardivo-dragging-announcement');
  document.querySelectorAll('.yardivo-drop-hover').forEach(x=>x.classList.remove('yardivo-drop-hover'));
  draggedId=null;
},true);

/* Schedule + daily-map exact slot targets */
document.addEventListener('dragover',e=>{
  if(!draggedId||!canMove())return;
  const t=e.target.closest('[data-move-date],[data-weekly-move-date]');if(!t)return;
  e.preventDefault();try{e.dataTransfer.dropEffect='move'}catch(err){}
  document.querySelectorAll('.yardivo-drop-hover').forEach(x=>x!==t&&x.classList.remove('yardivo-drop-hover'));
  t.classList.add('yardivo-drop-hover');
},true);
document.addEventListener('dragleave',e=>{
  const t=e.target.closest('.yardivo-drop-hover');if(t&&!t.contains(e.relatedTarget))t.classList.remove('yardivo-drop-hover');
},true);
document.addEventListener('drop',e=>{
  if(!draggedId||!canMove())return;
  const t=e.target.closest('[data-move-date],[data-weekly-move-date]');if(!t)return;
  e.preventDefault();e.stopPropagation();
  document.querySelectorAll('.yardivo-drop-hover').forEach(x=>x.classList.remove('yardivo-drop-hover'));
  const a=ann(draggedId);if(!a)return;
  if(t.dataset.moveBlocked==='1')return alert('Na ovaj blokirani termin nije moguće premjestiti najavu.');
  if(t.dataset.moveDate){
    open(draggedId,{date:t.dataset.moveDate,time:t.dataset.moveTime||a.time,dock:Number(t.dataset.moveDock||a.dock)});
  }else{
    // Weekly map changes the day by drop; time/ramp stay preselected and can be adjusted in confirmation modal.
    open(draggedId,{date:t.dataset.weeklyMoveDate,time:a.time,dock:Number(a.dock)});
  }
},true);

/* Right click: Zalihe/Admin get direct reschedule modal in schedule, daily and weekly maps. */
document.addEventListener('contextmenu',e=>{
  if(!canMove())return;
  const el=e.target.closest('#dailyMapBoard [data-announcement-id],#weeklyMapBoard [data-announcement-id]');
  if(!el)return;
  e.preventDefault();e.stopImmediatePropagation();
  open(el.dataset.announcementId);
},true);

/* Existing context-menu "Uredi termin" in Unos najava now opens the same modal for Zalihe/Admin. */
const editBtn=document.getElementById('ctxEditAnnouncement');
if(editBtn){
  editBtn.addEventListener('click',e=>{
    if(!canMove())return;
    e.preventDefault();e.stopImmediatePropagation();
    let id=null;try{id=contextAnnouncementId}catch(err){}
    if(id==null){try{id=contextId}catch(err){}}
    try{closeAnnouncementContextMenu?.()}catch(err){}
    if(id!=null)open(id);
  },true);
}

document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});

window.YardivoInventoryReschedule={open,commit,validate,canMove};
})();
