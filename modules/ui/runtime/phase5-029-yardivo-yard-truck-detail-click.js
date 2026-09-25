
(function(){
  const yard=document.getElementById('yard');
  if(!yard)return;
  yard.addEventListener('click',function(e){
    const truck=e.target.closest('.yard-clickable-truck');
    if(!truck)return;
    e.stopPropagation();
    const slot=truck.closest('[data-announcement-id]');
    if(!slot)return;
    const id=Number(slot.dataset.announcementId);
    if(!Number.isFinite(id))return;
    try{openAnnouncementDetail(id,'yard')}catch(err){
      const a=(typeof announcements!=='undefined'&&Array.isArray(announcements)?announcements:[]).find(x=>Number(x.id)===id);
      if(a&&typeof openTruckTimeline==='function')openTruckTimeline(a);
    }
  });
})();
