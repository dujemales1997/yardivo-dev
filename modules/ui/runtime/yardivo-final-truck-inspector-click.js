(function(){
  function findAnnouncement(id){
    try{return (Array.isArray(announcements)?announcements:[]).find(a=>Number(a.id)===Number(id))}catch(e){return null}
  }
  document.addEventListener('click',function(e){
    const truck=e.target.closest && e.target.closest('#yard .yard-truck-model3d');
    if(!truck)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const slot=truck.closest('[data-announcement-id]');
    const id=slot && Number(slot.dataset.announcementId);
    const a=findAnnouncement(id);
    if(!a)return;
    if(typeof openYardivoTruckInspector==='function'){
      openYardivoTruckInspector(a);
    }else if(typeof openAnnouncementDetail==='function'){
      openAnnouncementDetail(id,'yard');
    }
  },true);

  // Timers update every minute without needing page refresh.
  setInterval(function(){
    document.querySelectorAll('#yard [data-announcement-id]').forEach(function(slot){
      const a=findAnnouncement(Number(slot.dataset.announcementId));
      if(!a)return;
      const timer=yardivoElapsedTimer(a);
      const label=slot.querySelector('.live-semi-label');
      if(!label)return;
      let chip=label.querySelector('.yard-live-timer');
      if(timer.html){
        if(!chip)label.insertAdjacentHTML('beforeend',timer.html);
        else{
          const wrap=document.createElement('div');wrap.innerHTML=timer.html;
          chip.replaceWith(wrap.firstElementChild);
        }
      }else if(chip)chip.remove();
    });
  },60000);
})();
