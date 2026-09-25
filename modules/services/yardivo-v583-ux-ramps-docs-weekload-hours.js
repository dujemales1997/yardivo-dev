
(function(){
'use strict';
const HOURS_KEY='yardivo_ramp_hours_v1';

function rampHoursLoad(){try{return JSON.parse(localStorage.getItem(HOURS_KEY)||'{}')||{}}catch(_){return{}}}
function rampHoursSave(x){localStorage.setItem(HOURS_KEY,JSON.stringify(x));try{window.YardivoSupabase?.flush?.()}catch(_){}}
function defaultHours(wh){try{const w=(typeof WAREHOUSES!=='undefined'?WAREHOUSES?.[wh]:null)||{};return {from:w.receptionStart||'06:00',to:w.receptionEnd||'22:00'}}catch(_){return {from:'06:00',to:'22:00'}}}
function getHours(wh,r){const all=rampHoursLoad(),d=defaultHours(wh);return all?.[wh]?.[String(r)]||d}
function setHours(wh,r,from,to){const all=rampHoursLoad();all[wh]=all[wh]||{};all[wh][String(r)]={from,to};rampHoursSave(all);renderRampTopdown()}
window.YardivoRampHoursV583={get:getHours,set:setHours,all:rampHoursLoad};

function activeWh(){try{return (activeWarehouse&&activeWarehouse!=='ALL')?activeWarehouse:yardivoCanonicalWarehouseV583()}catch(_){return''}}
function planStatus(a){try{return typeof normalizedPlanStatus==='function'?normalizedPlanStatus(a):String(a?.status||'')}catch(_){return String(a?.status||'')}}
function openIncidents(){try{return Array.isArray(incidents)?incidents:[]}catch(_){return[]}}
function incidentFor(a,wh,r){return openIncidents().find(i=>{const open=!/zatvoren|closed|resolved|riješen|rijesen/i.test(String(i.status||''));if(!open)return false;if(a&&String(i.announcementId||'')===String(a.id))return true;return String(i.warehouse||'').toUpperCase()===String(wh).toUpperCase()&&Number(i.dock||i.ramp)===Number(r)})}
function inHours(wh,r){const h=getHours(wh,r),now=new Date(),cur=now.getHours()*60+now.getMinutes(),cv=v=>{const [a,b]=String(v||'00:00').split(':').map(Number);return a*60+b};return cur>=cv(h.from)&&cur<cv(h.to)}
function locked(wh,r){try{return window.YardivoRampConfig?.isLocked?.(wh,r)===true}catch(_){return false}}
function count(wh){try{return Math.max(0,Number(window.YardivoRampConfig?.count?.(wh)??(typeof WAREHOUSES!=='undefined'?WAREHOUSES?.[wh]?.ramps:0)??0))}catch(_){return 0}}
function currentAtRamp(wh,r){const today=window.yardivoLocalDateV583();try{return (Array.isArray(announcements)?announcements:[]).find(a=>String(a.warehouse||yardivoCanonicalWarehouseV583())===String(wh)&&a.date===today&&Number(a.dock)===Number(r)&&planStatus(a)==='Na rampi')||null}catch(_){return null}}
function plate(a){if(!a)return'';try{return (typeof effectivePlate==='function'?effectivePlate(a):'')||a.plannedPlate||a.vehiclePlate||a.plate||a.registration||''}catch(_){return a.plannedPlate||a.vehiclePlate||a.plate||''}}

function ensureRampPanel(){
  const view=document.getElementById('docks');if(!view||document.getElementById('rampTopdownPanel'))return;
  const title=view.querySelector('.section-title'),panel=document.createElement('section');panel.id='rampTopdownPanel';
  panel.innerHTML=`<div class="rtd-head"><div><h2>TLOCRT RAMPI · LIVE</h2><small id="rtdSub">Pogled odozgor · stvarno stanje aktivnog skladišta</small></div><div class="rtd-legend"><span><i class="rtd-dot free"></i>SLOBODNA</span><span><i class="rtd-dot busy"></i>NA RAMPI</span><span><i class="rtd-dot incident"></i>INCIDENT</span><span><i class="rtd-dot off"></i>IZVAN FUNKCIJE</span></div></div><div class="rtd-floor"><div class="rtd-building"><div class="rtd-building-label">SKLADIŠTE / PRIJAMNA ZONA</div><div class="rtd-row" id="rtdRow"></div><div class="rtd-road">MANEVARSKI PROSTOR · KAMIONSKI PRILAZ</div></div></div>`;
  title?.insertAdjacentElement('afterend',panel);
}
function renderRampTopdown(){
  ensureRampPanel();const host=document.getElementById('rtdRow');if(!host)return;
  const wh=activeWh(),n=count(wh);document.getElementById('rtdSub').textContent=`${wh} · ${n} rampi · pogled odozgor`;
  host.innerHTML=Array.from({length:n},(_,i)=>{const r=i+1,a=currentAtRamp(wh,r),inc=incidentFor(a,wh,r),off=locked(wh,r)||!inHours(wh,r);let cls='free',state='SLOBODNA',note='Spremna za sljedeći kamion';if(off){cls='off';state=locked(wh,r)?'IZVAN FUNKCIJE':'IZVAN RADNOG VREMENA';note=locked(wh,r)?'Rampa je zaključana u Postavkama':`${getHours(wh,r).from} – ${getHours(wh,r).to}`}if(a){cls='busy';state='NA RAMPI';note=`${a.supplier||'Dobavljač'} · ${plate(a)||'bez tablica'}`}if(inc){cls='incident';state='INCIDENT';note=String(inc.type||inc.note||inc.description||'Aktivan incident')}const h=getHours(wh,r);return `<article class="rtd-ramp ${cls}" ${a?`data-announcement-id="${a.id}"`:''}><div><div class="rtd-num">RAMPA ${r}</div><div class="rtd-state">${state}</div></div><div class="rtd-truck">${a?`<strong>🚛 ${plate(a)||'BEZ TABLICA'}</strong>${a.supplier||'—'}<br>${Number(a.pallets||0)} paleta`:note}<div class="rtd-time">RADNO VRIJEME ${h.from} – ${h.to}</div></div></article>`}).join('');
}
document.addEventListener('click',e=>{const c=e.target.closest?.('.rtd-ramp[data-announcement-id]');if(c){try{openAnnouncementDetail(Number(c.dataset.announcementId),'docks')}catch(_){}}},true);

function keyFor(a){const id=a?.supplierPortalId||a?.client_id||a?.id;return id?'yardivo_supplier_attachment_'+String(id):''}
function getAttachment(a){
  try{
    const k=keyFor(a),stored=k?JSON.parse(localStorage.getItem(k)||'null'):null;
    if(stored?.dataUrl)return stored;
  }catch(_){}
  const dataUrl=String(a?.attachmentDataUrl||a?.documentDataUrl||a?.attachmentUrl||a?.documentUrl||'').trim();
  if(dataUrl){
    return {name:String(a?.attachmentName||a?.documentName||'dokument.pdf'),size:Number(a?.attachmentSize||0),uploadedAt:String(a?.attachmentUploadedAt||a?.updatedAt||''),dataUrl};
  }
  return null;
}
function hasAttachment(a){const x=getAttachment(a);return !!(x?.dataUrl&&x?.name)}
function ensureDocumentViewer(){
  let o=document.getElementById('yardivoDocumentViewerV583');
  if(o)return o;
  o=document.createElement('div');
  o.id='yardivoDocumentViewerV583';
  o.innerHTML=`<div class="ydv-card" role="dialog" aria-modal="true" aria-labelledby="ydvTitle">
    <div class="ydv-head">
      <div><small>DOKUMENT DOBAVLJAČA</small><h2 id="ydvTitle">PDF DOKUMENT</h2><div id="ydvMeta"></div></div>
      <button type="button" class="ydv-close" data-ydv-close aria-label="Zatvori">×</button>
    </div>
    <div class="ydv-actions">
      <button type="button" class="secondary" data-ydv-new>OTVORI U NOVOJ KARTICI</button>
      <button type="button" class="primary" data-ydv-download>PREUZMI PDF</button>
    </div>
    <div class="ydv-frame-wrap"><iframe id="ydvFrame" title="Pregled PDF dokumenta"></iframe></div>
  </div>`;
  document.body.appendChild(o);
  o.addEventListener('click',e=>{
    e.stopPropagation();
    if(e.target===o||e.target.closest('[data-ydv-close]'))closeDocumentViewer();
  });
  return o;
}
let yardivoCurrentDocument=null;
function closeDocumentViewer(){
  const o=document.getElementById('yardivoDocumentViewerV583');
  if(o)o.classList.remove('open');
  const f=document.getElementById('ydvFrame');if(f)f.src='about:blank';
  yardivoCurrentDocument=null;
}
function downloadAttachmentData(x){
  if(!x?.dataUrl)return;
  const a=document.createElement('a');
  a.href=x.dataUrl;
  a.download=String(x.name||'yardivo-dokument.pdf').replace(/[\\/:*?"<>|]+/g,'_');
  document.body.appendChild(a);a.click();a.remove();
}
function openAttachment(a){
  const x=getAttachment(a);
  if(!x?.dataUrl){
    try{showYmsToast?.('warning','DOKUMENT','Dokument nije dostupan na ovom uređaju.')}catch(_){alert('Dokument nije dostupan na ovom uređaju.')}
    return;
  }
  yardivoCurrentDocument=x;
  const o=ensureDocumentViewer();
  document.getElementById('ydvTitle').textContent=x.name||'PDF DOKUMENT';
  const kb=Math.max(1,Math.round(Number(x.size||0)/1024));
  document.getElementById('ydvMeta').textContent=(x.size?kb+' KB · ':'')+(x.uploadedAt?new Date(x.uploadedAt).toLocaleString('hr-HR'):'PRILOŽEN DOKUMENT');
  document.getElementById('ydvFrame').src=x.dataUrl;
  o.classList.add('open');
  requestAnimationFrame(()=>o.querySelector('[data-ydv-close]')?.focus());
}
window.YardivoSupplierAttachments={get:getAttachment,has:hasAttachment,open:openAttachment,download:downloadAttachmentData};
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-ydv-download]')){
    e.preventDefault();e.stopPropagation();downloadAttachmentData(yardivoCurrentDocument);return;
  }
  if(e.target.closest?.('[data-ydv-new]')){
    e.preventDefault();e.stopPropagation();
    if(yardivoCurrentDocument?.dataUrl)window.open(yardivoCurrentDocument.dataUrl,'_blank','noopener');
  }
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('yardivoDocumentViewerV583')?.classList.contains('open'))closeDocumentViewer()});
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-yardivo-doc]');if(!b)return;e.preventDefault();e.stopPropagation();try{const a=(Array.isArray(announcements)?announcements:[]).find(x=>String(x.id)===String(b.dataset.yardivoDoc));if(a)openAttachment(a)}catch(_){}} ,true);

function setupSupplierFile(){
 const input=document.getElementById('yspAttachment'),label=document.getElementById('yspAttachmentLabel'),status=document.getElementById('yspAttachmentStatus');
 if(!input||input.dataset.ready==='1')return;input.dataset.ready='1';
 input.addEventListener('change',()=>{
  const f=input.files?.[0];
  const fail=msg=>{input.value='';if(label)label.textContent='ERROR';if(status){status.textContent=msg;status.style.color='#d9363e';status.style.fontWeight='950'}};
  if(!f){if(label)label.textContent='PRILOŽI PDF DOKUMENT';if(status){status.textContent='Maksimalno 1,5 MB · samo PDF';status.style.color='';status.style.fontWeight=''}return}
  if(f.type!=='application/pdf'&&!/\.pdf$/i.test(f.name||'')){fail('ERROR · Dopušten je samo PDF dokument.');return}
  if(f.size>1572864){fail('ERROR · Dokument je veći od 1,5 MB.');return}
  if(label)label.textContent='DOKUMENT PRILOŽEN';
  if(status){status.textContent=`${f.name} · ${(f.size/1048576).toFixed(2)} MB`;status.style.color='#198754';status.style.fontWeight='950'}
 });
}

function settingsWarehouse(){return document.getElementById('rampSettingsWarehouse')?.value||activeWh()}
function enhanceRampSettings(){
  const host=document.getElementById('rampSettingsList');if(!host)return;const wh=settingsWarehouse();
  host.querySelectorAll('.ramp-settings-card').forEach((card,i)=>{const r=i+1;if(card.querySelector('.ramp-hours-row'))return;const h=getHours(wh,r);card.style.display='block';card.insertAdjacentHTML('beforeend',`<div class="ramp-hours-row"><label>OD<input type="time" data-ramp-from="${r}" value="${h.from}"></label><label>DO<input type="time" data-ramp-to="${r}" value="${h.to}"></label><button type="button" class="secondary ramp-hours-save" data-ramp-hours-save="${r}">SPREMI RADNO VRIJEME</button></div>`)})
}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-ramp-hours-save]');if(!b)return;const r=Number(b.dataset.rampHoursSave),wh=settingsWarehouse(),from=document.querySelector(`[data-ramp-from="${r}"]`)?.value||'06:00',to=document.querySelector(`[data-ramp-to="${r}"]`)?.value||'22:00';if(from>=to){alert('Vrijeme DO mora biti nakon vremena OD.');return}setHours(wh,r,from,to);try{showYmsToast?.('success','RAMPA '+r,`Radno vrijeme ${from} – ${to}`)}catch(_){}} ,true);

function refreshAll(){renderRampTopdown();setupSupplierFile();enhanceRampSettings()}
window.addEventListener('load',()=>setTimeout(refreshAll,1300));
window.addEventListener('yardivo:login',()=>setTimeout(refreshAll,500));
window.addEventListener('yardivo:data-synced',()=>setTimeout(renderRampTopdown,100));
document.addEventListener('click',e=>{if(e.target.closest?.('[data-view="docks"],[data-home-target="docks"]'))setTimeout(renderRampTopdown,80);if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]'))setTimeout(enhanceRampSettings,180);if(e.target.closest?.('#yardivoSupplierPortal'))setTimeout(setupSupplierFile,50)},true);
document.getElementById('globalWarehouse')?.addEventListener('change',()=>setTimeout(renderRampTopdown,30));
document.getElementById('rampSettingsWarehouse')?.addEventListener('change',()=>setTimeout(enhanceRampSettings,40));
setInterval(()=>{if(document.getElementById('docks')?.classList.contains('active'))renderRampTopdown()},15000);
})();
