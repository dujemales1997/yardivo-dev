
(function(){
  function clean(){
    document.querySelectorAll('#announcementSchedule > .yardivo-ramp-label-row, #yardivoExpandedSchedule .yardivo-ramp-label-row')
      .forEach(x=>x.remove());
  }
  window.addEventListener('load',()=>setTimeout(clean,100));
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="announcements"],[data-home-target="announcements"],#yardivoExpandScheduleBtn'))
      setTimeout(clean,50);
  },true);
  const start=()=>{
    const a=document.getElementById('announcementSchedule');
    if(a)new MutationObserver(clean).observe(a,{childList:true});
    clean();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
