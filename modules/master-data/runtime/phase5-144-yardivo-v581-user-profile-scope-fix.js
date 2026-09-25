
/* V5.8.1: expose warehouse selection helper outside legacy master IIFE. */
window.yardivoSelectedInternalUserWarehouses = window.yardivoSelectedInternalUserWarehouses || function(){
  return Array.from(document.querySelectorAll('#muWarehousePicker input[name="muWarehouse"]:checked')).map(function(x){ return x.value; });
};
