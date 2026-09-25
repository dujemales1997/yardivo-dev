
(()=>{'use strict';
if(window.__YARDIVO_MASTER_CONTEXT_CAPACITY_BINDING_FINAL_V583__)return;
window.__YARDIVO_MASTER_CONTEXT_CAPACITY_BINDING_FINAL_V583__=true;
const MASTER='yardivo_master_data_registry_v583',$=id=>document.getElementById(id);
function data(){try{const d=JSON.parse(localStorage.getItem(MASTER)||'{}');d.locations=Array.isArray(d.locations)?d.locations:[];d.warehouses=Array.isArray(d.warehouses)?d.warehouses:[];return d}catch(_){return{locations:[],warehouses:[]}}}
function wh(id){return data().warehouses.find(w=>w&&w.active!==false&&String(w.id)===String(id||''))||null}
function activeWh(){try{return String(window.YardivoAppStateV583?.warehouse?.()||$('globalWarehouse')?.value||window.activeWarehouse||'')}catch(_){return String($('globalWarehouse')?.value||'')}}
function ramps(w){const n=Math.max(0,Number(w?.ramps)||0);return (Array.isArray(w?.ramp_settings)?w.ramp_settings:[]).filter(r=>r&&Number(r.number)>0&&Number(r.number)<=n).sort((a,b)=>Number(a.number)-Number(b.number))}
function capacity(w){const rs=ramps(w),caps=rs.map(r=>Number(r.max_pallets));return rs.length&&caps.every(v=>Number.isFinite(v)&&v>0)?caps.reduce((a,b)=>a+b,0):null}
function label(w){const c=capacity(w);return c?`${c} pal/dan`:'KAPACITET NEPOZNAT'}
function syncHeader(){const id=activeWh(),w=wh(id),sel=$('globalWarehouse');if(sel&&w&&sel.value!==id&&Array.from(sel.options).some(o=>String(o.value)===id))sel.value=id;const info=$('globalWarehouseInfo');if(info)info.textContent=w?String(w.name||'Skladište'):'SKLADIŠTE NIJE ODABRANO';const strip=$('yvGlobalCapacityStrip');if(strip)strip.remove()}
function syncPanels(){const w=wh(activeWh());if(!w)return;const c=capacity(w),txt=label(w),name=String(w.name||'Skladište');
 const dash=$('dashWarehouseSubtitle');if(dash)dash.textContent=`Današnji operativni pregled · ${name} · kapacitet prijama ${c?c+' pal/dan':'nepoznat'}`;
 const dmSel=$('dailyMapWarehouseSelect');if(dmSel&&Array.from(dmSel.options).some(o=>String(o.value)===String(w.id))&&String(dmSel.value)!==String(w.id)){dmSel.value=String(w.id);dmSel.dispatchEvent(new Event('change',{bubbles:true}))}
 const dm=$('dailyMapWarehouse');if(dm)dm.textContent=`${name} · ${txt}`;
 const ww=$('weeklyMapWarehouse');if(ww&&Array.from(ww.options).some(o=>String(o.value)===String(w.id))&&String(ww.value)!==String(w.id)){ww.value=String(w.id);ww.dispatchEvent(new Event('change',{bubbles:true}))}
 const wl=$('weeklyWarehouseLabel');if(wl)wl.textContent=`${name} · ${txt}`;
}
function refresh(){syncHeader();syncPanels();try{window.YardivoHeaderMasterContextV583?.refresh?.()}catch(_){} }
document.addEventListener('change',e=>{if(e.target?.id==='globalWarehouse')setTimeout(refresh,0)},true);
['yardivo:master-data-changed','yardivo:data-synced','yardivo:context-changed','yardivo:login'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(refresh,60)));
setTimeout(refresh,180);
window.YardivoMasterContextCapacityV583={refresh,capacity,warehouse:()=>wh(activeWh())};
window.YARDIVO_DEV_BUILD='20260916-dev-v5.8.3-daily-map-master-capacity-fix-final';
})();
