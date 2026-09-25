
(function(){
  function bind(){
    const loc=document.getElementById('muLocation');
    if(loc && !loc.dataset.yardivoWhBind){
      loc.dataset.yardivoWhBind='1';
      loc.addEventListener('change',()=>yardivoRenderInternalUserWarehousePicker([]));
      yardivoRenderInternalUserWarehousePicker([]);
    }
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,300));
  window.addEventListener('yardivo:login',()=>setTimeout(bind,200));
  document.addEventListener('click',e=>{
    if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]'))setTimeout(bind,120);
  },true);
})();
