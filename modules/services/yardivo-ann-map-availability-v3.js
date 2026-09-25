
(function(){
'use strict';

function role(){
  let r='';try{r=String(currentSession?.role||'').toLowerCase().trim()}catch(e){}
  if(r==='zalihe'||r==='upravljanje zalihama')r='inventory';
  return r;
}
function canUse(){return ['admin','inventory'].includes(role())}
function wcfg(w){try{return WAREHOUSES?.[w]||null}catch(e){return null}}
function date(){return document.getElementById('annDate')?.value||window.yardivoLocalDateV583()}
function wh(){return document.getElementById('annWarehouse')?.value||yardivoCanonicalWarehouseV583()}
function mins(t){try{return toMin(t)}catch(e){const p=String(t||'0:0').split(':').map(Number);return (p[0]||0)*60+(p[1]||0)}}
function hh(m){try{return hhmm(m)}catch(e){return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`}}
function duration(){
  const p=Math.max(1,Number(document.getElementById('annPallets')?.value||33));
  try{return Math.max(15,Number(unloadDuration(p)||60))}catch(e){return 60}
}
function free(w,d,dock,start,dur){
  try{return !!isSlobodna(d,dock,start,dur,null,w)}catch(e){return false}
}
function blocked(w,d,dock,start,dur){
  try{return !!isRampBlocked(w,d,dock,start,dur)}catch(e){return false}
}
function locked(w,dock){
  try{return !!YardivoRampConfig?.isLocked?.(w,dock)}catch(e){return false}
}
function booking(w,d,dock,start,dur){
  try{
    return announcements.find(a=>
      (a.warehouse||yardivoCanonicalWarehouseV583())===w&&a.date===d&&Number(a.dock)===Number(dock)&&
      overlaps(start,dur,toMin(a.time),Number(a.duration||15))
    )||null;
  }catch(e){return null}
}

/* Right-side normal map must always follow the date/warehouse selected in Unos najave. */
function syncNormalMap(){
  if(!canUse())return;
  try{renderAnnouncementSchedule?.()}catch(e){}
  const label=document.getElementById('annScheduleLabel');
  if(label)label.textContent=`${date()} · ${wh()}`;
}
function ensureTools(){
  if(!canUse())return;
  const schedule=document.getElementById('announcementSchedule');
  if(!schedule)return;
  const panel=schedule.closest('.panel')||schedule.parentElement;
  if(!panel||document.getElementById('yardivoAnnMapTools'))return;
  const bar=document.createElement('div');bar.id='yardivoAnnMapTools';
  bar.innerHTML=`<div class="yam-info"><strong>MAPA TERMINA · <span id="yamInlineDate"></span></strong><small>Mapa prati datum i skladište iz Unosa najave.</small></div>
  <button type="button" id="yamOpen">PRIKAŽI SLOBODNE TERMINE</button>`;
  schedule.insertAdjacentElement('beforebegin',bar);
  document.getElementById('yamOpen').onclick=open;
  updateInline();
}
function updateInline(){
  const x=document.getElementById('yamInlineDate');if(x)x.textContent=`${date()} · ${wh()}`;
}
function modal(){
  let m=document.getElementById('yardivoAvailabilityModal');
  if(m)return m;
  m=document.createElement('div');m.id='yardivoAvailabilityModal';
  m.innerHTML=`<div class="yam-head">
    <div class="yam-title"><h2>YARDIVO · SLOBODNI TERMINI</h2><small>Povećana mapa za slanje dobavljaču</small></div>
    <div class="yam-actions">
      <input type="date" id="yamDate">
      <select id="yamWarehouse"></select>
      <button type="button" class="pdf" id="yamPdf">🧾 IZVUCI PDF</button>
      <button type="button" class="close" id="yamClose">×</button>
    </div>
  </div>
  <div class="yam-legend">
    <span class="yam-chip"><i class="yam-sq free"></i>ZELENO · SLOBODNO</span>
    <span class="yam-chip"><i class="yam-sq busy"></i>CRVENO · ZAUZETO / ZATVORENO</span>
    <span class="yam-chip"><i class="yam-sq block"></i>BLOKIRANO</span>
    <span class="yam-chip" id="yamSummary"></span>
  </div>
  <div class="yam-scroll"><div id="yardivoAvailabilityGrid"></div></div>
  <div class="yam-footer">Slobodno znači da od tog početka postoji dovoljno neprekinutog vremena za cijeli procijenjeni istovar.</div>`;
  document.body.appendChild(m);
  const s=m.querySelector('#yamWarehouse');
  (window.YardivoGlobalContextV583?.warehouseIds?.()||[]).forEach(w=>{
    const o=document.createElement('option');o.value=w;o.textContent=wcfg(w)?.name?`${w} · ${wcfg(w).name}`:w;s.appendChild(o);
  });
  m.querySelector('#yamClose').onclick=close;
  m.querySelector('#yamPdf').onclick=exportPdf;
  m.querySelector('#yamDate').onchange=render;
  m.querySelector('#yamWarehouse').onchange=render;
  return m;
}
function render(){
  const m=modal(),d=m.querySelector('#yamDate').value,w=m.querySelector('#yamWarehouse').value,c=wcfg(w);
  const grid=m.querySelector('#yardivoAvailabilityGrid'),sum=m.querySelector('#yamSummary');
  if(!d||!c?.ramps||!c?.receptionStart||!c?.receptionEnd){
    grid.style.gridTemplateColumns='1fr';grid.innerHTML='<div class="yam-cell yam-na" style="width:600px">Skladište nema konfigurirane rampe/vrijeme prijama ili datum nije odabran.</div>';return;
  }
  const dur=duration(),start=mins(c.receptionStart),end=mins(c.receptionEnd),ramps=Number(c.ramps);
  grid.style.gridTemplateColumns=`76px repeat(${ramps},112px)`;
  let h='<div class="yam-cell yam-time yam-rh yam-corner">VRIJEME</div>';
  for(let r=1;r<=ramps;r++)h+=`<div class="yam-cell yam-rh">RAMPA ${r}</div>`;
  let fc=0,bc=0;
  for(let t=start;t<end;t+=15){
    h+=`<div class="yam-cell yam-time">${hh(t)}</div>`;
    for(let r=1;r<=ramps;r++){
      let cls='yam-na',txt='—',title='';
      if(t+dur>end){cls='yam-na';txt='—'}
      else if(locked(w,r)){cls='yam-busy';txt='ZATVORENO';bc++}
      else if(blocked(w,d,r,t,dur)){cls='yam-block';txt='BLOKIRANO';bc++}
      else if(free(w,d,r,t,dur)){cls='yam-free';txt='SLOBODNO';fc++;title=`${hh(t)}–${hh(t+dur)} · R${r}`}
      else{
        cls='yam-busy';txt='ZAUZETO';bc++;
        const a=booking(w,d,r,t,dur);title=a?`${a.supplier||'Najava'} · ${a.time||''}`:'Zauzeto';
      }
      h+=`<div class="yam-cell ${cls}" title="${String(title).replace(/"/g,'&quot;')}">${txt}</div>`;
    }
  }
  grid.innerHTML=h;
  sum.textContent=`${fc} slobodnih početaka · istovar ${dur} min`;
}
function open(){
  if(!canUse())return alert('Dostupno Adminu i Upravljanju zalihama.');
  const m=modal();
  m.querySelector('#yamDate').value=date();
  m.querySelector('#yamWarehouse').value=wh();
  m.classList.add('open');document.body.style.overflow='hidden';render();
}
function close(){document.getElementById('yardivoAvailabilityModal')?.classList.remove('open');document.body.style.overflow=''}

function buildPrint(){
  const m=modal(),d=m.querySelector('#yamDate').value,w=m.querySelector('#yamWarehouse').value;
  let p=document.getElementById('yardivoAvailabilityPrint');if(p)p.remove();
  p=document.createElement('div');p.id='yardivoAvailabilityPrint';
  p.innerHTML=`<div class="pdfh"><div><h1>YARDIVO</h1><div class="sub">RASPOLOŽIVI TERMINI ZA ISPORUKU</div></div>
    <div style="text-align:right"><strong>${w}</strong><div class="sub">${d} · trajanje istovara ${duration()} min</div></div></div>
    <div class="yam-legend">${m.querySelector('.yam-legend').innerHTML}</div>
    <div id="yamPrintGrid"></div>
    <div class="sub" style="margin-top:14px;border-top:1px solid #2b4b5d;padding-top:10px">Termin je informativan do potvrde skladišta · Generirano ${new Date().toLocaleString('hr-HR')}</div>`;
  document.body.appendChild(p);
  const clone=m.querySelector('#yardivoAvailabilityGrid').cloneNode(true);
  clone.id='yamPrintGrid';
  clone.style.cssText=m.querySelector('#yardivoAvailabilityGrid').style.cssText+';display:grid;gap:2px;background:#1b3444;padding:2px';
  p.querySelector('#yamPrintGrid').replaceWith(clone);
  return p;
}
async function exportPdf(){
  if(!window.html2canvas||!window.jspdf?.jsPDF)return alert('PDF biblioteka nije učitana.');
  const p=buildPrint();
  try{
    const canvas=await html2canvas(p,{backgroundColor:'#06131d',scale:1.3,useCORS:true,logging:false});
    const {jsPDF}=window.jspdf,pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a3'});
    const pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight();
    const scale=Math.min((pw-12)/canvas.width,(ph-12)/canvas.height);
    const iw=canvas.width*scale,ih=canvas.height*scale;
    pdf.addImage(canvas.toDataURL('image/jpeg',.94),'JPEG',(pw-iw)/2,(ph-ih)/2,iw,ih,'','FAST');
    pdf.save(`YARDIVO_Slobodni_termini_${modal().querySelector('#yamWarehouse').value}_${modal().querySelector('#yamDate').value}.pdf`);
  }finally{p.remove()}
}

/* Date/warehouse in the form immediately drives the right-side map. */
document.addEventListener('change',e=>{
  if(['annDate','annWarehouse'].includes(e.target?.id)){
    setTimeout(()=>{syncNormalMap();updateInline();},20);
    const m=document.getElementById('yardivoAvailabilityModal');
    if(m?.classList.contains('open')){
      m.querySelector('#yamDate').value=date();m.querySelector('#yamWarehouse').value=wh();render();
    }
  }
},true);
document.addEventListener('input',e=>{
  if(['annPallets'].includes(e.target?.id)&&document.getElementById('yardivoAvailabilityModal')?.classList.contains('open'))render();
},true);

/* Stable right-click: stop the contextmenu event before other map handlers can immediately rerender/close it. */
document.addEventListener('contextmenu',e=>{
  if(!canUse())return;
  const card=e.target.closest('#announcementSchedule [data-announcement-id],#yardivoExpandedSchedule [data-announcement-id]');
  if(!card)return;
  const id=Number(card.dataset.announcementId);
  if(!id)return;
  e.preventDefault();e.stopImmediatePropagation();
  window.openAnnouncementContextMenu?.(e,id);
},true);

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('yardivoAvailabilityModal')?.classList.contains('open'))close()});
window.addEventListener('load',()=>setTimeout(()=>{ensureTools();syncNormalMap()},1000));
document.addEventListener('click',e=>{if(e.target.closest('[data-view="announcements"],[data-home-target="announcements"]'))setTimeout(()=>{ensureTools();syncNormalMap()},120)},true);
setInterval(()=>{if(canUse())ensureTools()},1800);

window.YardivoAvailabilityMap={open,close,render,exportPdf};
})();
