(()=>{'use strict';
if(window.__YARDIVO_RECEIVING_MODAL_QR_FINAL_V585__)return;
window.__YARDIVO_RECEIVING_MODAL_QR_FINAL_V585__=true;

function currentCfg(){
  try{
    const raw=window.safeStorage?.getItem?.('yardivo_qr_scan_cfg_v583') ?? localStorage.getItem('yardivo_qr_scan_cfg_v583');
    const p=JSON.parse(raw||'{}');
    return {enabled:p?.enabled!==false,byWarehouse:(p?.byWarehouse&&typeof p.byWarehouse==='object')?p.byWarehouse:{}};
  }catch(_){return {enabled:true,byWarehouse:{}}}
}
function enabledFor(wh){
  const c=currentCfg(),v=c.byWarehouse?.[String(wh||'')];
  if(typeof v==='boolean')return v;
  if(v&&typeof v==='object'&&Object.prototype.hasOwnProperty.call(v,'enabled'))return !!v.enabled;
  return c.enabled!==false;
}
window.yardivoReceivingQrEnabledForWarehouseV585=enabledFor;

const prior=window.setReceivingAnnouncementStatus;
if(typeof prior==='function'){
  window.setReceivingAnnouncementStatus=function(id,status,source='manual'){
    let wh=String(document.getElementById('globalWarehouse')?.value||window.activeWarehouse||'');
    try{
      const a=(Array.isArray(window.announcements)?window.announcements:[]).find(x=>String(x?.id)===String(id));
      if(a?.warehouse)wh=String(a.warehouse);
    }catch(_){}
    if(source==='manual'&&enabledFor(wh)){
      const md=(()=>{try{return typeof master==='function'?master():{}}catch(_){return{}}})();
      const w=(md?.warehouses||[]).find(x=>String(x.id)===wh);
      alert(`QR scanner je UKLJUČEN za ${String(w?.name||wh||'odabrano skladište')}. Ručna promjena statusa nije dopuštena.`);
      return;
    }
    return prior.apply(this,arguments);
  };
}
})();
