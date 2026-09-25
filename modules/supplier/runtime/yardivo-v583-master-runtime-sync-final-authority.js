(function(){
'use strict';
const MASTER='yardivo_master_data_registry_v583';
function data(){try{const d=JSON.parse(localStorage.getItem(MASTER)||'{}');return {locations:Array.isArray(d.locations)?d.locations:[],warehouses:Array.isArray(d.warehouses)?d.warehouses:[],suppliers:Array.isArray(d.suppliers)?d.suppliers:[]}}catch(_){return{locations:[],warehouses:[],suppliers:[]}}}
function activeWh(){const d=data();let id='';try{id=String(window.YardivoAppStateV583?.warehouse?.()||window.activeWarehouse||'')}catch(_){};return d.warehouses.some(w=>w.active!==false&&String(w.id)===id)?id:''}
function activeLoc(){const d=data();let id='';try{id=String(window.YardivoAppStateV583?.location?.()||window.currentSession?.location||'')}catch(_){};return d.locations.some(l=>l.active!==false&&String(l.id)===id)?id:''}
function ensureContext(){
 const d=data(),loc=activeLoc();let wh=activeWh();const rows=d.warehouses.filter(w=>w.active!==false&&(!loc||String(w.location_id)===loc));
 if(!wh&&rows.length){wh=rows[0].id;try{window.YardivoAppStateV583?.setWarehouse?.(wh)}catch(_){window.activeWarehouse=wh}}
 return wh;
}
function cap(id){const w=data().warehouses.find(x=>String(x.id)===String(id));if(!w)return null;const v=w.daily_pallet_capacity;if(v!=null&&v!==''&&Number(v)>0)return Number(v);try{const c=JSON.parse(localStorage.getItem('yardivo_capacity_config_v1')||'{}')?.[id]?.warehousePallets;return c!=null&&c!==''&&Number(c)>0?Number(c):null}catch(_){return null}}
window.getWarehouseCapacity=cap;
function rampCount(id){const w=data().warehouses.find(x=>x.active!==false&&String(x.id)===String(id));return Math.max(0,Number(w?.ramps)||0)}
if(window.YardivoRampConfig){window.YardivoRampConfig.count=rampCount;window.YardivoRampConfig.getCount=rampCount}
function sanitize(){
 const d=data(),ids=new Set(d.warehouses.map(w=>String(w.id)));
 document.querySelectorAll('select option').forEach(o=>{if(/^W(?:101|103|104|201|202|203|204)$/i.test(String(o.value||''))&&!ids.has(String(o.value)))o.remove()});
 try{yardivoLoadDynamicWarehousesIntoSystem?.()}catch(_){}
 ensureContext();
 try{yardivoRefreshAllWarehouseUi?.()}catch(_){}
 try{renderDockOverview?.()}catch(_){}
 try{renderDashboardSimple?.()}catch(_){}
 try{window.YardivoUnifiedRampsV583?.refresh?.()}catch(_){}
}
['yardivo:master-data-changed','yardivo:context-changed','yardivo:login'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(sanitize,30)));
document.addEventListener('DOMContentLoaded',()=>setTimeout(sanitize,180),{once:true});
window.addEventListener('load',()=>setTimeout(sanitize,350),{once:true});
window.YardivoMasterRuntimeAuthorityV583={data,activeWh,activeLoc,ensureContext,capacity:cap,rampCount};
window.YARDIVO_DEV_BUILD='20260913-dev-v5.8.3-backend-audit-alignment-final';
})();
