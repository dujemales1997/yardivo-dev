(()=>{'use strict';
const BUILD='20260915-dev-v5.8.3-header-home-user-right-final';
const $=id=>document.getElementById(id);
function master(){try{const d=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}');return{locations:Array.isArray(d.locations)?d.locations:[],warehouses:Array.isArray(d.warehouses)?d.warehouses:[]}}catch(_){return{locations:[],warehouses:[]}}}
function locId(){try{const v=String(window.YardivoAppStateV583?.location?.()||'');return v==='ALL'?'':v}catch(_){return''}}
function syncHome(){
 const d=master(),id=locId(),sel=$('homeLocationSelect'),title=$('homeSelectedLocation');
 if(sel){const active=d.locations.filter(x=>x&&x.active!==false);const html='<option value="">Odaberi lokaciju...</option>'+active.map(x=>`<option value="${String(x.id).replace(/"/g,'&quot;')}">${String(x.name||'')}</option>`).join('');if(sel.dataset.yardivoMasterHome!==html){sel.innerHTML=html;sel.dataset.yardivoMasterHome=html}sel.value=active.some(x=>String(x.id)===id)?id:''}
 if(title){const row=d.locations.find(x=>x&&x.active!==false&&String(x.id)===id);title.textContent=row?String(row.name||'').toUpperCase():'ODABERI LOKACIJU';title.classList.toggle('selected',!!row)}
}
function cleanTopbar(){
 const tb=document.querySelector('.topbar');if(!tb)return;
 const toolbar=tb.querySelector('.warehouse-toolbar'),chip=$('currentUserChip'),theme=tb.querySelector('.theme-switch-wrap')||document.querySelector('.theme-switch-wrap');
 if(toolbar&&toolbar.parentElement!==tb)tb.appendChild(toolbar);
 if(theme&&theme.parentElement!==tb)tb.appendChild(theme);
 if(chip&&chip.parentElement!==tb)tb.appendChild(chip);
 /* canonical right edge order: theme, username/logout */
 if(theme&&theme.parentElement===tb)tb.appendChild(theme);
 if(chip&&chip.parentElement===tb)tb.appendChild(chip);
}
function refresh(){cleanTopbar()}
['yardivo:login','yardivo:master-data-changed','yardivo:data-synced','yardivo:context-changed'].forEach(ev=>window.addEventListener(ev,()=>requestAnimationFrame(refresh)));
document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(refresh),{once:true});window.addEventListener('load',()=>setTimeout(refresh,120),{once:true});
window.YardivoHeaderHomeFinalV583={refresh,build:BUILD};window.YARDIVO_DEV_BUILD=BUILD;
})();
