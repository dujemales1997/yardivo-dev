
(()=>{
  const DAY_NAMES=['NEDJELJA','PONEDJELJAK','UTORAK','SRIJEDA','ČETVRTAK','PETAK','SUBOTA'];
  function mapFullscreenElement(){return document.fullscreenElement||document.webkitFullscreenElement||null}
  async function toggleMapFullscreen(viewId,buttonId){
    const view=document.getElementById(viewId),btn=document.getElementById(buttonId);if(!view)return;
    try{
      if(mapFullscreenElement()){
        if(document.exitFullscreen)await document.exitFullscreen();else if(document.webkitExitFullscreen)document.webkitExitFullscreen();
      }else{
        if(view.requestFullscreen)await view.requestFullscreen();else if(view.webkitRequestFullscreen)view.webkitRequestFullscreen();
      }
    }catch(err){console.warn('YARDIVO map fullscreen unavailable',err)}
    if(btn)btn.blur();
  }
  function syncFullscreenButtons(){
    const fs=mapFullscreenElement();
    const d=document.getElementById('dailyMapFullscreen'),w=document.getElementById('weeklyMapFullscreen');
    if(d)d.textContent=fs?.id==='dailyMap'?'↙ VRATI PRIKAZ':'⛶ CIJELI EKRAN';
    if(w)w.textContent=fs?.id==='weeklyMap'?'↙ VRATI PRIKAZ':'⛶ CIJELI EKRAN';
  }
  document.getElementById('dailyMapFullscreen')?.addEventListener('click',()=>toggleMapFullscreen('dailyMap','dailyMapFullscreen'));
  document.getElementById('weeklyMapFullscreen')?.addEventListener('click',()=>toggleMapFullscreen('weeklyMap','weeklyMapFullscreen'));
  document.addEventListener('fullscreenchange',syncFullscreenButtons);
  document.addEventListener('webkitfullscreenchange',syncFullscreenButtons);

  window.openWeeklyDayDrilldown=function(date,warehouse){
    const modal=document.getElementById('weeklyDayDrilldown');if(!modal||!date)return;
    const wh=warehouse||document.getElementById('weeklyMapWarehouse')?.value||'';
    const d=new Date(date+'T12:00:00');
    const items=(Array.isArray(window.announcements)?window.announcements:(typeof announcements!=='undefined'?announcements:[]))
      .filter(a=>a.date===date&&(!wh||(a.warehouse||yardivoCanonicalWarehouseV583())===wh))
      .sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
    const pal=items.reduce((n,a)=>n+Number(a.pallets||0),0);
    const trucks=items.reduce((n,a)=>n+(typeof truckCountForPallets==='function'?truckCountForPallets(a.pallets):1),0);
    const dockCount=new Set(items.map(a=>a.dock).filter(Boolean)).size;
    const title=document.getElementById('weeklyDayDrilldownTitle');
    const sub=document.getElementById('weeklyDayDrilldownSubtitle');
    const stats=document.getElementById('weeklyDayDrilldownStats');
    const list=document.getElementById('weeklyDayDrilldownList');
    if(title)title.textContent=`${DAY_NAMES[d.getDay()]} · ${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}.`;
    if(sub)sub.textContent=`${typeof warehouseOptionLabel==='function'?warehouseOptionLabel(wh):wh} · ${date}`;
    if(stats)stats.innerHTML=[['NAJAVA',items.length],['PALETA',pal],['KAMIONA',trucks],['AKTIVNIH RAMPI',dockCount]].map(x=>`<div class="yardivo-week-day-stat"><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join('');
    if(list)list.innerHTML=items.length?items.map(a=>{
      const status=typeof operationalPlanStatus==='function'?operationalPlanStatus(a):(a.status||'');
      const delay=typeof operationalDelayText==='function'?operationalDelayText(a):'';
      const hasDoc=window.YardivoSupplierAttachments?.has?.(a);
      return `<article class="yardivo-week-day-row ${typeof yardivoUnifiedStatusClass==='function'?yardivoUnifiedStatusClass(a):''}" data-week-day-announcement="${a.id}" tabindex="0">
        <div class="time">${a.time||'—'}</div>
        <div><div class="supplier">${a.supplier||'—'} ${hasDoc?'📁':''}</div><div class="meta">${a.orderNo||a.order||''}</div></div>
        <div class="meta">RAMPA ${a.dock||'—'} · ${Number(a.pallets||0)} pal.</div>
        <div class="meta">${a.sku||0} SKU · ${typeof truckCountForPallets==='function'?truckCountForPallets(a.pallets):1} kam.</div>
        <div class="status">${status}${delay?' · '+delay:''}</div>
      </article>`;
    }).join(''):`<div class="yardivo-week-day-empty">Nema najavljenih dobavljača za odabrani dan.</div>`;
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('yardivo-week-day-modal-open');
    setTimeout(()=>document.getElementById('weeklyDayDrilldownClose')?.focus(),0);
  };
  function closeWeeklyDayDrilldown(){const modal=document.getElementById('weeklyDayDrilldown');if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('yardivo-week-day-modal-open')}
  document.getElementById('weeklyDayDrilldownClose')?.addEventListener('click',closeWeeklyDayDrilldown);
  document.getElementById('weeklyDayDrilldown')?.addEventListener('click',e=>{
    if(e.target.closest('[data-week-day-close]')){closeWeeklyDayDrilldown();return}
    const row=e.target.closest('[data-week-day-announcement]');if(!row)return;
    const id=Number(row.dataset.weekDayAnnouncement);if(id&&typeof openAnnouncementDetail==='function'){closeWeeklyDayDrilldown();openAnnouncementDetail(id,'weeklyMap')}
  });
  document.getElementById('weeklyDayDrilldown')?.addEventListener('keydown',e=>{
    const row=e.target.closest?.('[data-week-day-announcement]');if(row&&(e.key==='Enter'||e.key===' ')){e.preventDefault();row.click()}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('weeklyDayDrilldown')?.classList.contains('open'))closeWeeklyDayDrilldown()});
})();
