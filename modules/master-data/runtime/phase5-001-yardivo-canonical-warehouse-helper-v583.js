
function yardivoCanonicalWarehouseV583(){
 try{
  const d=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}');
  const rows=Array.isArray(d.warehouses)?d.warehouses.filter(w=>w&&w.active!==false):[];
  const active=String(window.activeWarehouse||'');
  if(rows.some(w=>String(w.id)===active))return active;
  const loc=String(window.currentSession?.location||'');
  return rows.find(w=>!loc||String(w.location_id)===loc)?.id||rows[0]?.id||'';
 }catch(_){return''}
}
