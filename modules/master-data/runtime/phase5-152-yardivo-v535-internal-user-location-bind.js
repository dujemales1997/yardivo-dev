(function(){
  'use strict';

  function esc(v){
    return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function renderInternalUserWarehousePicker(selected=[]){
    const host=document.getElementById('muWarehousePicker');
    const loc=document.getElementById('muLocation');
    if(!host||!loc)return;
    const data=window.YardivoMasterDataService?.read?.()||{};
    const location=String(loc.value||'').trim();
    const selectedSet=new Set((Array.isArray(selected)?selected:[]).map(String));
    const rows=(Array.isArray(data.warehouses)?data.warehouses:[])
      .filter(w=>w&&w.active!==false&&(!location||String(w.location_id||'')===location));
    host.innerHTML=rows.length?rows.map(w=>`<label><input type="checkbox" name="muWarehouse" value="${esc(w.id)}" ${selectedSet.has(String(w.id))?'checked':''}><span>${esc(w.name||w.id)}</span></label>`).join(''):'<small>Nema skladišta za odabranu lokaciju.</small>';
  }

  if(typeof window.yardivoRenderInternalUserWarehousePicker!=='function'){
    window.yardivoRenderInternalUserWarehousePicker=renderInternalUserWarehousePicker;
  }

  function bind(){
    const loc=document.getElementById('muLocation');
    if(loc && !loc.dataset.yardivoWhBind){
      loc.dataset.yardivoWhBind='1';
      loc.addEventListener('change',()=>window.yardivoRenderInternalUserWarehousePicker([]));
      window.yardivoRenderInternalUserWarehousePicker([]);
    }
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(bind,300));
  window.addEventListener('yardivo:login',()=>setTimeout(bind,200));
  document.addEventListener('click',e=>{
    if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]'))setTimeout(bind,120);
  },true);
})();