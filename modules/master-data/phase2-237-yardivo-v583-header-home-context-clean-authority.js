
(()=>{'use strict';
const MASTER='yardivo_master_data_registry_v583';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function data(){try{const d=JSON.parse(localStorage.getItem(MASTER)||'{}');return{locations:Array.isArray(d.locations)?d.locations:[],warehouses:Array.isArray(d.warehouses)?d.warehouses:[]}}catch(_){return{locations:[],warehouses:[]}}}
function loc(){try{const x=String(window.YardivoAppStateV583?.location?.()||'');return x==='ALL'?'':x}catch(_){return''}}
function wh(){try{const x=String(window.YardivoAppStateV583?.warehouse?.()||window.activeWarehouse||'');return x==='ALL'?'':x}catch(_){return''}}
function ensure(){const hero=document.querySelector('#homeMenu .home-menu-hero');if(!hero)return null;let box=$('yardivoHomeContextV583');if(!box){box=document.createElement('div');box.id='yardivoHomeContextV583';box.innerHTML='<label>LOKACIJA<select id="yardivoHomeLocationV583" aria-label="Lokacija"></select></label><i class="yhc-divider"></i><label>SKLADIŠTE<select id="yardivoHomeWarehouseV583" aria-label="Skladište"></select></label>';const title=hero.querySelector('h1');title?.insertAdjacentElement('afterend',box)}return box}
function render(){ensure();const d=data(),l=loc(),w=wh(),ls=$('yardivoHomeLocationV583'),ws=$('yardivoHomeWarehouseV583');if(!ls||!ws)return;const L=d.locations.filter(x=>x&&x.active!==false),W=d.warehouses.filter(x=>x&&x.active!==false&&l&&String(x.location_id)===l);ls.innerHTML='<option value="">ODABERI LOKACIJU</option>'+L.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('');ls.value=L.some(x=>String(x.id)===l)?l:'';ws.innerHTML='<option value="">ODABERI SKLADIŠTE</option>'+W.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('');ws.disabled=!ls.value;ws.value=W.some(x=>String(x.id)===w)?w:'';
 /* homeLocationSelect is owned by HomeHeaderMasterDwellFinal. */
}
document.addEventListener('change',e=>{if(e.target?.id==='yardivoHomeLocationV583'){const id=String(e.target.value||'');try{window.YardivoAppStateV583?.setLocation?.(id)}catch(_){}try{window.YardivoAppStateV583?.setWarehouse?.('')}catch(_){}try{window.activeWarehouse=''}catch(_){}window.dispatchEvent(new CustomEvent('yardivo:context-changed',{detail:{source:'home-context',location:id}}));setTimeout(render,0)}if(e.target?.id==='yardivoHomeWarehouseV583'){const id=String(e.target.value||'');try{window.YardivoAppStateV583?.setWarehouse?.(id)}catch(_){}try{window.activeWarehouse=id}catch(_){}const gw=$('globalWarehouse');if(gw)gw.value=id||'ALL';window.dispatchEvent(new CustomEvent('yardivo:context-changed',{detail:{source:'home-context',warehouse:id}}));setTimeout(render,0)}},true);
['yardivo:master-data-changed','yardivo:data-synced','yardivo:login','yardivo:context-changed'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(render,20)));
document.addEventListener('DOMContentLoaded',()=>setTimeout(render,120));window.addEventListener('load',()=>setTimeout(render,320),{once:true});
window.YARDIVO_DEV_BUILD='20260915-dev-v5.8.3-header-home-context-clean-final';
})();
