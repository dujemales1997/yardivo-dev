(function(){
  const yard=document.getElementById('yard');
  if(!yard)return;

  function findAnnouncementByElement(el){
    const slot=el.closest('[data-announcement-id]');
    if(!slot)return null;
    const id=Number(slot.dataset.announcementId);
    try{return (Array.isArray(announcements)?announcements:[]).find(a=>Number(a.id)===id)||null}catch(e){return null}
  }

  // One click on truck = Inspector
  yard.addEventListener('click',function(e){
    const truck=e.target.closest('.yard-truck-model3d');
    if(!truck)return;
    e.preventDefault();
    e.stopPropagation();
    const a=findAnnouncementByElement(truck);
    if(!a)return;

    yard.querySelectorAll('.yard-truck-model3d.selected-truck').forEach(x=>x.classList.remove('selected-truck'));
    truck.classList.add('selected-truck');

    if(typeof openYardivoTruckInspector==='function'){
      openYardivoTruckInspector(a);
    }else if(typeof openAnnouncementDetail==='function'){
      openAnnouncementDetail(Number(a.id),'yard');
    }
  },true);

  // True 3D / 2D buttons
  const switcher=yard.querySelector('.live3d-view-switch');
  if(switcher){
    const buttons=[...switcher.querySelectorAll('button')];
    const b3=buttons.find(b=>b.textContent.trim()==='3D');
    const b2=buttons.find(b=>b.textContent.trim()==='2D');

    function setMode(mode){
      yard.classList.toggle('yard-mode-2d',mode==='2D');
      yard.classList.toggle('yard-mode-3d',mode==='3D');
      buttons.forEach(b=>b.classList.toggle('active',b.textContent.trim()===mode));

      // reset camera so each mode starts cleanly
      try{
        if(mode==='2D'){
          document.getElementById('yard3DCameraRig')?.style.setProperty('--yard-scale','1');
        }else{
          document.getElementById('yardResetCamera')?.click();
        }
      }catch(e){}

      // paths need recalculation after geometry switches
      setTimeout(()=>{
        try{
          const today=window.yardivoLocalDateV583();
          const wh=(typeof activeWarehouse!=='undefined'&&activeWarehouse&&activeWarehouse!=='ALL')?activeWarehouse:yardivoCanonicalWarehouseV583();
          const inYard=(Array.isArray(announcements)?announcements:[]).filter(a=>(a.warehouse||yardivoCanonicalWarehouseV583())===wh&&a.date===today&&normalizedPlanStatus(a)==='U dvorištu');
          if(typeof renderLive3DRoutes==='function')renderLive3DRoutes(inYard);
        }catch(e){}
      },80);
    }

    b3?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setMode('3D')});
    b2?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setMode('2D')});

    setMode('3D');
  }
})();
