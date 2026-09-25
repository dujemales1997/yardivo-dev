(()=>{'use strict';
if(window.__YARDIVO_GLOBAL_VISIBLE_MASTER_NAMES__)return;
window.__YARDIVO_GLOBAL_VISIBLE_MASTER_NAMES__=true;
function master(){try{return window.YardivoAppStateV583?.master?.()||JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')||{}}catch(_){return{}}}
function maps(){
 const m=master(),wh=new Map(),loc=new Map();
 (Array.isArray(m.warehouses)?m.warehouses:[]).forEach(x=>{if(x?.id)wh.set(String(x.id),String(x.name||x.id))});
 (Array.isArray(m.locations)?m.locations:[]).forEach(x=>{if(x?.id)loc.set(String(x.id),String(x.name||x.id))});
 return {wh,loc};
}
function whName(id){const {wh}=maps();return wh.get(String(id||''))||String(id||'')}
function locName(id){const {loc}=maps();return loc.get(String(id||''))||String(id||'')}
function escRx(v){return String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function replaceText(t,map){
 let out=String(t||'');
 for(const [id,name] of map){
  if(id===name)continue;
  out=out.replace(new RegExp('(^|[^A-Za-z0-9_])'+escRx(id)+'(?=$|[^A-Za-z0-9_])','g'),(_,p)=>p+name);
 }
 return out;
}
function paint(root=document.body){
 if(!root)return;const {wh,loc}=maps();if(!wh.size&&!loc.size)return;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){
  const p=n.parentElement;if(!p||p.closest('script,style,textarea,input,[contenteditable="true"]'))return NodeFilter.FILTER_REJECT;
  const t=String(n.nodeValue||'');for(const id of wh.keys())if(t.includes(id))return NodeFilter.FILTER_ACCEPT;for(const id of loc.keys())if(t.includes(id))return NodeFilter.FILTER_ACCEPT;return NodeFilter.FILTER_REJECT;
 }});
 const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
 nodes.forEach(n=>{let t=replaceText(n.nodeValue,wh);t=replaceText(t,loc);if(t!==n.nodeValue)n.nodeValue=t});
}
['yardivo:login','yardivo:data-synced','yardivo:master-data-changed','yardivo:supplier-request-updated','yardivo:supplier-inbox-changed','yardivo:gate-qr-issued','yardivo:context-changed']
 .forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>paint(),20)));
document.addEventListener('click',()=>setTimeout(()=>paint(),0),true);
window.addEventListener('load',()=>setTimeout(()=>paint(),800));setTimeout(()=>paint(),180);

try{
 const targets=['announcementDetail','dailyMap','weeklyMap','supplierProfile','operations','checkin','controlTower','truckInspector','truckTimelineModal'];
 const mo=new MutationObserver(ms=>{for(const m of ms){const el=m.target?.nodeType===1?m.target:m.target?.parentElement;if(el&&targets.some(id=>el.closest?.('#'+id))){queueMicrotask(()=>paint(el.closest('[id]')||el));break}}});
 targets.forEach(id=>{const el=document.getElementById(id);if(el)mo.observe(el,{subtree:true,childList:true,characterData:true})});
}catch(_){ }
window.YardivoDisplayNamesV583={warehouseName:whName,locationName:locName,paint};
window.yardivoWarehouseNameV583=whName;
})();
