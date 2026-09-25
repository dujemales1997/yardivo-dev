
(function(){
  const removed=new Set(['plannerPro','weeklyDeliveries','trucks','shipments']);
  function clean(){
    document.querySelectorAll('[data-view],[data-home-target]').forEach(el=>{
      const id=el.dataset.view||el.dataset.homeTarget;
      if(removed.has(id))el.remove();
    });
    removed.forEach(id=>{
      const view=document.getElementById(id);
      if(view)view.remove();
    });
  }
  clean();
  document.addEventListener('DOMContentLoaded',clean);
  window.addEventListener('load',clean);
  setTimeout(clean,100);
  setTimeout(clean,800);
})();
