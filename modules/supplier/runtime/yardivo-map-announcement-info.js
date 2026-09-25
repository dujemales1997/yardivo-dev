(function(){
 function load(){try{return window.YardivoCleanCore?.load?.()||announcements||[]}catch(e){return []}}
 function plate(a){return a?.plannedPlate||a?.vehiclePlate||a?.plate||a?.registration||'—'}
 function driver(a){return a?.plannedDriver||a?.driverNameCanonical||a?.driver||a?.driverName||'—'}
 function field(label,value){return `<div class="yai-field"><small>${label}</small><strong>${value??'—'}</strong></div>`}
 function show(id){
   const a=load().find(x=>String(x.id)===String(id));if(!a)return;
   let ov=document.getElementById('yardivoAnnouncementInfoOverlay');
   if(!ov){ov=document.createElement('div');ov.id='yardivoAnnouncementInfoOverlay';ov.innerHTML='<div id="yardivoAnnouncementInfoCard"></div>';document.body.appendChild(ov)}
   const hist=Array.isArray(a.changeHistory)?a.changeHistory:[];
   document.getElementById('yardivoAnnouncementInfoCard').innerHTML=`
    <div class="yai-head"><div><h2>${a.supplier||'NAJAVA'}</h2><span class="yai-status">${a.status||'U dolasku'}</span></div><button id="yaiClose">ZATVORI ×</button></div>
    <div class="yai-grid">
      ${field('DATUM',a.date)}${field('TERMIN',a.time)}
      ${field('SKLADIŠTE',a.warehouse||yardivoCanonicalWarehouseV583())}${field('RAMPA',a.dock?`Rampa ${a.dock}`:'—')}
      ${field('TABLICE',plate(a))}${field('VOZAČ',driver(a))}
      ${field('PALETE',a.pallets||0)}${field('SKU',a.sku||0)}
      ${field('STVARNI DOLAZAK',a.actualTime||'—')}${field('STATUS',a.status||'U dolasku')}
      ${field('TELEFON',a.plannedPhone||'—')}${field('PRIKOLICA',a.plannedTrailer||'—')}
    </div>
    <div class="yai-history"><h3>POVIJEST PROMJENA TERMINA</h3>
      ${hist.length?hist.slice().reverse().map(h=>`<div class="yai-event">${h.changedAt?new Date(h.changedAt).toLocaleString('hr-HR'):''} · ${h.oldTime||'—'} → ${h.newTime||'—'} · ${h.reason||'Promjena'}</div>`).join(''):'<div class="yai-event">Nema evidentiranih promjena termina.</div>'}
    </div>`;
   ov.classList.add('show');
   document.getElementById('yaiClose').onclick=()=>ov.classList.remove('show');
   ov.onclick=e=>{if(e.target===ov)ov.classList.remove('show')};
 }
 window.openMapAnnouncementInfo=show;

 // Daily map: left click = INFO; right click remains existing actions.
 document.addEventListener('click',e=>{
   // PDF is its own action. Never route a folder click into the appointment-detail modal.
   if(e.target.closest?.('.yardivo-doc-icon[data-yardivo-doc]'))return;

   const daily=e.target.closest('#dailyMapBoard [data-announcement-id]');
   if(daily){e.preventDefault();e.stopImmediatePropagation();show(daily.dataset.announcementId);return}

   // Weekly map supports both explicit IDs and legacy blocks that call editAnnouncement(id).
   const weekly=e.target.closest('#weeklyMapBoard [data-announcement-id],#weeklyMap [data-announcement-id],#weeklyBoard [data-announcement-id]');
   if(weekly){e.preventDefault();e.stopImmediatePropagation();show(weekly.dataset.announcementId);return}
 },true);
})();
