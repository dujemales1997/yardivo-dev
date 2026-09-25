
(function bindDriverAnnouncementFormAfterDomExists(){
  const form=document.getElementById('driverAnnouncementForm');
  const dialog=document.getElementById('driverAnnouncementDialog');
  if(!form||!dialog){
    console.error('YARDIVO: driverAnnouncementForm/dialog nije pronađen.');
    return;
  }

  // Disable browser's native navigation/reload behavior permanently.
  form.setAttribute('action','javascript:void(0)');
  form.setAttribute('method','dialog');

  document.getElementById('closeDriverAnnouncement')?.addEventListener('click',()=>{
    try{dialog.close()}catch(e){}
  });
  document.getElementById('cancelDriverAnnouncement')?.addEventListener('click',()=>{
    try{dialog.close()}catch(e){}
  });

  form.addEventListener('submit',function(e){
    e.preventDefault();
    e.stopPropagation();

    if(!canAnnounceDriverData()){
      alert('Tablice i podatke vozača može unositi Upravljanje zalihama ili Admin.');
      return false;
    }

    const id=Number(document.getElementById('driverAnnouncementId')?.value);
    const a=announcements.find(x=>x.id===id);
    if(!a){
      alert('Najava nije pronađena. Podaci nisu spremljeni.');
      return false;
    }

    const plate=String(document.getElementById('plannedPlate')?.value||'').trim().toUpperCase();
    const driver=String(document.getElementById('plannedDriver')?.value||'').trim();

    if(!plate||!driver){
      alert('Upiši registraciju i ime vozača.');
      return false;
    }

    // Single source + legacy compatibility.
    a.vehiclePlate=plate;
    a.driverNameCanonical=driver;
    a.plannedPlate=plate;
    a.plannedDriver=driver;
    a.plannedTrailer=String(document.getElementById('plannedTrailer')?.value||'').trim();
    a.plannedPhone=String(document.getElementById('plannedPhone')?.value||'').trim();

    if(typeof hasPhysicallyArrived==='function'&&hasPhysicallyArrived(a)){
      a.arrivalPlate=plate;
      a.arrivalDriver=driver;
    }

    a.driverDataUpdatedAt=new Date().toISOString();

    try{
      if(typeof syncAnnouncementIdentity==='function')syncAnnouncementIdentity(a);
      saveAnnouncements();
    }catch(err){
      console.error('YARDIVO save driver data error',err);
      alert('Greška kod spremanja tablica i vozača.');
      return false;
    }

    try{dialog.close()}catch(e){}

    // Never call the global render here. Refresh only relevant UI.
    try{renderAnnouncements?.()}catch(e){}
    try{renderAnnouncementSchedule?.()}catch(e){}
    try{renderCheckinPro?.()}catch(e){}
    try{renderReceiving?.()}catch(e){}
    try{renderYard?.()}catch(e){}
    try{renderDailyMap?.()}catch(e){}
    try{renderWeeklyMap?.()}catch(e){}
    try{renderTruckHistorySection?.()}catch(e){}

    // Explicitly stay in Unos najave when this modal was opened there.
    document.body.classList.remove('home-menu-mode');
    const target=(typeof driverAnnouncementReturnView==='string' &&
                  driverAnnouncementReturnView &&
                  driverAnnouncementReturnView!=='homeMenu')
      ? driverAnnouncementReturnView
      : 'announcements';

    if(typeof openAppView==='function'){
      openAppView(target);
    }else{
      document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
      document.getElementById(target)?.classList.add('active');
    }

    try{
      showYmsToast?.(
        'success',
        'TABLICE I VOZAČ SPREMLJENI',
        `${a.supplier} · ${plate} · ${driver}`
      );
    }catch(e){}

    return false;
  },true);

  // Marker used by automated self-test / debugging.
  form.dataset.yardivoSubmitBound='1';
})();

let yard3DResizeTimer=null;
window.addEventListener('resize',()=>{
  clearTimeout(yard3DResizeTimer);
  yard3DResizeTimer=setTimeout(()=>{
    try{
      const today=window.yardivoLocalDateV583();
      const wh=(activeWarehouse&&activeWarehouse!=='ALL')?activeWarehouse:yardivoCanonicalWarehouseV583();
      const inYard=announcements.filter(a=>(a.warehouse||yardivoCanonicalWarehouseV583())===wh&&a.date===today&&normalizedPlanStatus(a)==='U dvorištu');
      renderLive3DRoutes(inYard);
    }catch(e){}
  },120);
});

