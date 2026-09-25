
(function(){
'use strict';
const UNANNOUNCED='UNANNOUNCED',PENDING='PENDING',APPROVED='APPROVED',REJECTED='REJECTED';

function role(){let r='';try{r=String(currentSession?.role||'').toLowerCase().trim()}catch(e){};if(r==='zalihe'||r==='upravljanje zalihama')r='inventory';if(r==='prijam')r='reception';if(r==='porta'||r==='portir')r='gate';return r}
function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function nowTime(){return new Date().toTimeString().slice(0,5)}
function locationWarehouses(){try{return warehousesForLocation(currentSession?.location||'')}catch(e){return []}}
function all(){try{return (announcements||[]).filter(a=>a.arrivalType===UNANNOUNCED).sort((a,b)=>String(b.requestCreatedAt||'').localeCompare(String(a.requestCreatedAt||'')))}catch(e){return []}}
function suppliersList(){try{return [...new Set((suppliers||[]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'hr'))}catch(e){return []}}

function addNotification(a,event){
  let arr=[];try{arr=JSON.parse(localStorage.getItem('yardivo_live_notifications_v1')||'[]')}catch(e){}
  const title=event==='REQUEST'?'NENAJAVLJENI KAMION':event==='APPROVED'?'NENAJAVLJENI DOLAZAK ODOBREN':'NENAJAVLJENI DOLAZAK ODBIJEN';
  const type=event==='APPROVED'?'green':event==='REJECTED'?'red':'yellow';
  arr.unshift({id:Date.now()+Math.random(),at:new Date().toISOString(),type,title,body:`${a.supplier} · ${a.plannedPlate} · ${a.warehouse}`,supplier:a.supplier,plate:a.plannedPlate,announcementId:a.id,warehouse:String(a.warehouse||'').toUpperCase(),location:/^W2/.test(String(a.warehouse||'').toUpperCase())?'DU':(/^W1/.test(String(a.warehouse||'').toUpperCase())?'VG':''),roles:event==='REQUEST'?['admin','inventory','reception']:['admin','inventory','reception','gate'],event:'UNANNOUNCED_'+event});
  localStorage.setItem('yardivo_live_notifications_v1',JSON.stringify(arr.slice(0,300)));
  try{if(role()!=='gate'||event!=='REQUEST')YardivoNotify?.custom?.(type,title,`${a.supplier} · ${a.plannedPlate}`,null,a)}catch(e){}
}
function refresh(){try{saveAnnouncements()}catch(e){};try{render?.()}catch(e){};try{renderAnnouncements?.()}catch(e){};try{renderReceiving?.()}catch(e){};try{renderDailyMap?.()}catch(e){};try{renderWeeklyMap?.()}catch(e){};try{renderOverview?.()}catch(e){};try{renderCheckinPro?.()}catch(e){};renderCenter()}

function ensureGatePanel(){
  const result=document.getElementById('gateMatchResult');if(!result)return null;
  let p=document.getElementById('unannouncedGatePanel');if(p)return p;
  p=document.createElement('div');p.id='unannouncedGatePanel';p.className='unannounced-panel';
  p.innerHTML=`<h3>⚠ NENAJAVLJENI DOLAZAK</h3><p>Porta kreira zahtjev. Ulaz odobravaju Prijam ili Admin.</p>
    <div class="unannounced-grid">
      <label>Dobavljač<select id="uaSupplier"></select></label><label>Skladište<select id="uaWarehouse"></select></label>
      <label>Registracija<input id="uaPlate" readonly></label><label>Vozač<input id="uaDriver" readonly></label>
      <label>Razlog dolaska<select id="uaReason"><option value="">Odaberi razlog...</option><option>Isporuka bez prethodne najave</option><option>Hitna isporuka</option><option>Zamjenska isporuka</option><option>Povrat robe</option><option>Greška dobavljača / prijevoznika</option><option>Najava nije evidentirana</option><option>Ostalo</option></select></label>
      <label>Broj dokumenta / narudžbe<input id="uaDocument" placeholder="Opcionalno"></label>
      <label class="full">Napomena<textarea id="uaNote" rows="2"></textarea></label>
    </div>
    <div class="unannounced-actions"><button type="button" class="unannounced-btn" id="uaCreateBtn">POŠALJI ZAHTJEV ZA ODOBRENJE</button><button type="button" class="unannounced-btn secondary" id="uaCancelBtn">ODUSTANI</button></div>`;
  result.insertAdjacentElement('afterend',p);
  p.querySelector('#uaCreateBtn').onclick=createRequest;p.querySelector('#uaCancelBtn').onclick=()=>p.classList.remove('show');
  return p;
}
function openRequest(){
  if(role()!=='gate')return;
  const p=ensureGatePanel(),s=document.getElementById('uaSupplier'),w=document.getElementById('uaWarehouse');
  s.innerHTML='<option value="">Odaberi dobavljača...</option>'+suppliersList().map(x=>`<option>${x}</option>`).join('');
  w.innerHTML=locationWarehouses().map(code=>`<option value="${code}">${typeof warehouseOptionLabel==='function'?warehouseOptionLabel(code):code}</option>`).join('');
  document.getElementById('uaPlate').value=(document.getElementById('gatePlate')?.value||'').trim().toUpperCase();
  document.getElementById('uaDriver').value=(document.getElementById('gateDriver')?.value||'').trim();p.classList.add('show');
}
function createRequest(){
  if(role()!=='gate')return;
  const supplier=document.getElementById('uaSupplier')?.value||'',warehouse=document.getElementById('uaWarehouse')?.value||'',reason=document.getElementById('uaReason')?.value||'',plate=document.getElementById('uaPlate')?.value||'',driver=document.getElementById('uaDriver')?.value||'';
  if(!supplier||!warehouse||!reason||!plate||!driver)return alert('Odaberi dobavljača, skladište i razlog dolaska.');
  if(all().some(a=>a.approvalStatus===PENDING&&String(a.plannedPlate||'').toUpperCase()===plate.toUpperCase()))return alert('Za ovaj kamion već postoji zahtjev koji čeka odobrenje.');
  const now=new Date(),rec={id:Date.now(),date:today(),time:nowTime(),warehouse,dock:'',supplier,pallets:0,sku:0,responsible:'',status:'Čeka odobrenje Prijama',plannedPlate:plate,vehiclePlate:plate,plate,registration:plate,plannedDriver:driver,driverNameCanonical:driver,driver,driverName:driver,arrivalType:UNANNOUNCED,adHoc:true,approvalStatus:PENDING,approvalRequestedBy:currentSession?.user||currentSession?.username||'Porta',approvalRequestedRole:'gate',requestCreatedAt:now.toISOString(),approvalFlow:'RECEPTION_THEN_GATE',unannouncedReason:reason,unannouncedDocument:document.getElementById('uaDocument')?.value?.trim()||'',unannouncedNote:document.getElementById('uaNote')?.value?.trim()||'',createdAt:now.toISOString(),changeHistory:[{changedAt:now.toISOString(),type:'UNANNOUNCED_REQUEST',reason,note:'Zahtjev kreiran na Porti',changedBy:currentSession?.user||currentSession?.username||''}]};
  announcements.push(rec);saveAnnouncements();addNotification(rec,'REQUEST');document.getElementById('unannouncedGatePanel')?.classList.remove('show');
  const result=document.getElementById('gateMatchResult');if(result){result.className='gate-match-result warn';result.innerHTML=`<strong>⏳ ČEKA ODOBRENJE</strong><span>${supplier} · ${plate}. Zahtjev je poslan Prijamu/Adminu.</span>`}
  showYmsToast?.('warning','ZAHTJEV POSLAN',`${supplier} · ${plate}`);refresh();
}
function approve(id){
  if(!['admin','inventory'].includes(role()))return alert('Odobriti može samo Admin ili Upravljanje zalihama.');
  const a=announcements.find(x=>Number(x.id)===Number(id));if(!a||a.approvalStatus!==PENDING)return;
  const now=new Date();a.approvalStatus=APPROVED;a.status='U dolasku';a.approvedBy=currentSession?.user||currentSession?.username||'';a.approvedAt=now.toISOString();(a.changeHistory||(a.changeHistory=[])).push({changedAt:now.toISOString(),type:'UNANNOUNCED_APPROVED',reason:'Odobren nenajavljeni dolazak',changedBy:a.approvedBy});addNotification(a,'APPROVED');refresh();showYmsToast?.('success','ULAZ ODOBREN',`${a.supplier} · ${a.plannedPlate}`);
}
function reject(id){
  if(!['admin','inventory'].includes(role()))return alert('Odbiti može samo Admin ili Upravljanje zalihama.');
  const a=announcements.find(x=>Number(x.id)===Number(id));if(!a||a.approvalStatus!==PENDING)return;
  const reason=document.getElementById('uaRejectReason_'+id)?.value?.trim()||'Nenajavljeni dolazak nije odobren',now=new Date();
  a.approvalStatus=REJECTED;a.status='Odbijen';a.approvalRejectedBy=currentSession?.user||currentSession?.username||'';a.approvalRejectedAt=now.toISOString();a.approvalRejectionReason=reason;a.rejectedAt=now.toISOString();(a.changeHistory||(a.changeHistory=[])).push({changedAt:now.toISOString(),type:'UNANNOUNCED_REJECTED',reason,changedBy:a.approvalRejectedBy});addNotification(a,'REJECTED');refresh();showYmsToast?.('error','ULAZ ODBIJEN',`${a.supplier} · ${a.plannedPlate}`);
}
function renderCenter(){return}
function decorate(){return}
const oldCheck=window.checkGateArrival||checkGateArrival;
window.checkGateArrival=function(){const r=oldCheck.apply(this,arguments);setTimeout(()=>{if(role()!=='gate')return;const res=document.getElementById('gateMatchResult'),txt=(res?.textContent||'').toUpperCase(),plate=(document.getElementById('gatePlate')?.value||'').trim(),driver=(document.getElementById('gateDriver')?.value||'').trim();const req=all().find(a=>String(a.plannedPlate||'').toUpperCase().replace(/[^A-Z0-9ČĆŽŠĐ]/g,'')===plate.toUpperCase().replace(/[^A-Z0-9ČĆŽŠĐ]/g,''));if(req?.approvalStatus===PENDING){res.className='gate-match-result warn';res.innerHTML=`<strong>⏳ ČEKA ODOBRENJE</strong><span>${req.supplier} · zahtjev je poslan Zalihe/Admin.</span>`;return}if(req?.approvalStatus===REJECTED){res.className='gate-match-result bad';res.innerHTML=`<strong>✕ ULAZ ODBIJEN</strong><span>${req.approvalRejectionReason||'Nenajavljeni dolazak nije odobren.'}</span>`;return}if(txt.includes('NAJAVA NIJE PRONAĐENA')&&plate&&driver&&!req){res.innerHTML='<strong>NAJAVA NIJE PRONAĐENA</strong><span>Kamion nije najavljen.</span><div style="margin-top:9px"><button type="button" class="unannounced-btn" id="openUnannouncedRequest">KREIRAJ NENAJAVLJENI DOLAZAK</button></div>';document.getElementById('openUnannouncedRequest').onclick=openRequest}},0);return r};try{checkGateArrival=window.checkGateArrival}catch(e){}
const oldAllow=window.allowGateEntry||allowGateEntry;window.allowGateEntry=function(a,reason){if(a?.arrivalType===UNANNOUNCED&&a?.approvalStatus!==APPROVED){alert(a.approvalStatus===REJECTED?'Ulaz je odbijen.':'Nenajavljeni dolazak još čeka odobrenje.');return false}return oldAllow.apply(this,arguments)};try{allowGateEntry=window.allowGateEntry}catch(e){}
window.addEventListener('load',()=>setTimeout(()=>{ensureGatePanel()},350),{once:true});
window.YardivoUnannounced={approve,reject,create:createRequest,render:()=>{},all};
})();
