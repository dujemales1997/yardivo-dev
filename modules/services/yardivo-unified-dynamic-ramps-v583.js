
(function(){
'use strict';
if(window.__YARDIVO_UNIFIED_DYNAMIC_RAMPS_V583__)return;
window.__YARDIVO_UNIFIED_DYNAMIC_RAMPS_V583__=true;

const CFG_KEY='yardivo_ramp_config_v1';
const CAP_KEY='yardivo_ramp_capacity_v1';
const HOURS_KEY='yardivo_ramp_hours_v583';

let activeWarehouseId='';
let renderTimer=0;

function role(){
 let r='';
 try{r=String(window.currentSession?.app_role||window.currentSession?.role||currentSession?.app_role||currentSession?.role||'').toLowerCase().trim()}catch(_){}
 if(r==='prijam')r='reception';
 if(r==='voditelj')r='manager';
 return r;
}
function canManage(){return ['admin','manager'].includes(role())}
function master(){
 try{return window.YardivoMasterDataV583?.all?.()||{locations:[],warehouses:[]}}catch(_){return{locations:[],warehouses:[]}}
}
function loadJson(k){
 try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(_){return{}}
}
function saveJson(k,v){
 try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}
}
function cfg(){
 const d=loadJson(CFG_KEY),m=master();
 const ids=new Set((m.warehouses||[]).map(x=>x.id));
 Object.keys(d).forEach(k=>{if(!ids.has(k))delete d[k]});
 (m.warehouses||[]).forEach(w=>{
   if(!d[w.id])d[w.id]={count:Math.max(0,Number(w.ramps)||0),locked:[]};
   d[w.id].count=Math.max(0,Number(d[w.id].count)||0);
   if(!Array.isArray(d[w.id].locked))d[w.id].locked=[];
   d[w.id].locked=d[w.id].locked.map(Number).filter(x=>x>=1&&x<=d[w.id].count);
 });
 return d;
}
function persistCfg(d){
 saveJson(CFG_KEY,d);
 const m=master();
 let changed=false;
 (m.warehouses||[]).forEach(w=>{
   const c=Math.max(0,Number(d?.[w.id]?.count)||0);
   if(Number(w.ramps||0)!==c){w.ramps=c;changed=true}
 });
 if(changed){
   try{window.YardivoMasterDataV583?.save?.(m)}catch(_){}
 }
 applyModel(d);
}
function applyModel(d=cfg()){
 try{
   const m=master();
   (m.warehouses||[]).forEach(w=>{
     if(typeof WAREHOUSES==='object'&&WAREHOUSES?.[w.id]){
       WAREHOUSES[w.id].ramps=Math.max(0,Number(d?.[w.id]?.count)||0);
     }
   });
 }catch(_){}
}
function ensureWh(d,w){
 if(!d[w])d[w]={count:0,locked:[]};
 if(!Array.isArray(d[w].locked))d[w].locked=[];
 return d[w];
}
function count(w){
 const d=cfg();return Math.max(0,Number(d?.[w]?.count)||0);
}
function isLocked(w,r){
 const d=cfg();return (d?.[w]?.locked||[]).map(Number).includes(Number(r));
}
function setLocked(w,r,locked){
 const d=cfg(),x=ensureWh(d,w),n=Math.max(0,Number(x.count)||0),rr=Number(r);
 let a=(x.locked||[]).map(Number).filter(v=>v>=1&&v<=n);
 if(locked&&!a.includes(rr))a.push(rr);
 if(!locked)a=a.filter(v=>v!==rr);
 x.locked=a.sort((a,b)=>a-b);
 persistCfg(d);refreshAll();
}
function setCount(w,n){
 const d=cfg(),x=ensureWh(d,w);
 n=Math.max(0,Math.min(50,Number(n)||0));
 x.count=n;
 x.locked=(x.locked||[]).map(Number).filter(v=>v<=n);
 persistCfg(d);refreshAll();
}
function getCapacity(w,r){
 const d=loadJson(CAP_KEY);
 return Math.max(1,Number(d?.[w]?.[String(r)])||33);
}
function setCapacity(w,r,v){
 const d=loadJson(CAP_KEY);
 d[w]=d[w]||{};
 d[w][String(r)]=Math.max(1,Math.min(500,Number(v)||33));
 saveJson(CAP_KEY,d);
 refreshAll(false);
}
function getHours(w,r){
 const d=loadJson(HOURS_KEY),x=d?.[w]?.[String(r)]||d?.[w]?.['R'+r]||{};
 let from=String(x.from||x.start||'06:00').slice(0,5);
 let to=String(x.to||x.end||'22:00').slice(0,5);
 return {from,to};
}
function setHours(w,r,from,to){
 const d=loadJson(HOURS_KEY);
 d[w]=d[w]||{};
 d[w][String(r)]={from:String(from||'06:00').slice(0,5),to:String(to||'22:00').slice(0,5)};
 saveJson(HOURS_KEY,d);
 try{
   if(typeof WAREHOUSES==='object'&&WAREHOUSES?.[w]){
     if(r===1){
       WAREHOUSES[w].receptionStart=String(from||'06:00').slice(0,5);
       WAREHOUSES[w].receptionEnd=String(to||'22:00').slice(0,5);
     }
   }
 }catch(_){}
 refreshAll(false);
}

function warehouseOptions(){
 const m=master();
 return (m.warehouses||[]).map(w=>{
   const l=(m.locations||[]).find(x=>x.id===w.location_id);
   return {id:w.id,label:`${w.name}${l?.name?' · '+l.name:''}`};
 });
}
function whLabel(id){
 return warehouseOptions().find(x=>x.id===id)?.label||id;
}
function chooseActive(){
 const opts=warehouseOptions();
 if(opts.some(x=>x.id===activeWarehouseId))return activeWarehouseId;
 try{
   const aw=String(window.activeWarehouse||'');
   if(opts.some(x=>x.id===aw))return activeWarehouseId=aw;
 }catch(_){}
 return activeWarehouseId=opts[0]?.id||'';
}
function rebuildPanel(){
 const panel=document.getElementById('receptionRampSettings');
 if(!panel)return;
 if(!canManage()){
   panel.style.display='none';
   return;
 }
 panel.style.display='';
 panel.innerHTML=
  '<div class="panel-head"><div><h2>PRIJAM & RAMPE</h2><small>Jedinstveno upravljanje rampama za skladišta iz MASTER PODATAKA</small></div><span class="master-sync-state ok" id="rampSettingsWarehouseBadge">—</span></div>'+
  '<div class="yardivo-unified-ramp-body">'+
   '<div class="yur-toolbar">'+
    '<label>Skladište<select id="rampSettingsWarehouse"></select></label>'+
    '<button type="button" class="yur-add" id="addRampBtn">DODAJ RAMPU</button>'+
    '<button type="button" class="yur-remove" id="removeRampBtn">OBRIŠI ZADNJU RAMPU</button>'+
   '</div>'+
   '<div class="yur-note">Ovo je jedino mjesto za upravljanje rampama. Dodana rampa odmah se koristi u Dnevnoj/Tjednoj mapi, Supplier terminima, preporuci termina i Prijamu. Isključena rampa ostaje u konfiguraciji, ali se ne nudi za nove termine.</div>'+
   '<div class="yur-list" id="rampSettingsList"></div>'+
  '</div>';

 const sel=document.getElementById('rampSettingsWarehouse');
 sel.addEventListener('change',()=>{
   activeWarehouseId=sel.value;
   render();
 });
 document.getElementById('addRampBtn').onclick=()=>{
   const w=chooseActive();if(!w)return;
   setCount(w,count(w)+1);
 };
 document.getElementById('removeRampBtn').onclick=()=>{
   const w=chooseActive();if(!w)return;
   const n=count(w);
   if(n<1)return;
   if(!confirm(`Obrisati Rampu ${n} iz ${whLabel(w)}?`))return;
   setCount(w,n-1);
 };
 document.getElementById('rampSettingsList').addEventListener('click',e=>{
   const b=e.target.closest('[data-yur-toggle]');
   if(!b)return;
   const w=chooseActive(),r=Number(b.dataset.yurToggle);
   setLocked(w,r,!isLocked(w,r));
 });
 document.getElementById('rampSettingsList').addEventListener('change',e=>{
   const w=chooseActive();
   const cap=e.target.closest('[data-yur-cap]');
   if(cap){setCapacity(w,Number(cap.dataset.yurCap),cap.value);return}
   const from=e.target.closest('[data-yur-from]');
   if(from){
     const r=Number(from.dataset.yurFrom),to=document.querySelector(`[data-yur-to="${r}"]`);
     setHours(w,r,from.value,to?.value);return;
   }
   const to=e.target.closest('[data-yur-to]');
   if(to){
     const r=Number(to.dataset.yurTo),from=document.querySelector(`[data-yur-from="${r}"]`);
     setHours(w,r,from?.value,to.value);
   }
 });
 render();
}
function render(){
 const panel=document.getElementById('receptionRampSettings');
 if(!panel||!canManage())return;
 const opts=warehouseOptions(),sel=document.getElementById('rampSettingsWarehouse');
 if(!sel)return;

 if(!opts.length){
   activeWarehouseId='';
   sel.innerHTML='<option value="">NEMA SKLADIŠTA</option>';
   sel.disabled=true;
   document.getElementById('addRampBtn').disabled=true;
   document.getElementById('removeRampBtn').disabled=true;
   document.getElementById('rampSettingsWarehouseBadge').textContent='0 SKLADIŠTA';
   document.getElementById('rampSettingsList').innerHTML=
    '<div class="yur-empty">Trenutno nema nijednog skladišta. Prvo u MASTER PODACI dodaj skladište i dodijeli ga lokaciji. Nakon toga će se automatski pojaviti ovdje za konfiguraciju rampi.</div>';
   return;
 }
 sel.disabled=false;
 const current=chooseActive();
 sel.innerHTML=opts.map(x=>`<option value="${x.id}" ${x.id===current?'selected':''}>${x.label}</option>`).join('');
 document.getElementById('addRampBtn').disabled=false;

 const n=count(current);
 document.getElementById('removeRampBtn').disabled=n<1;
 document.getElementById('rampSettingsWarehouseBadge').textContent=`${n} ${n===1?'RAMPA':'RAMPI'}`;

 const host=document.getElementById('rampSettingsList');
 if(!n){
   host.innerHTML='<div class="yur-empty">Ovo skladište još nema rampi. Klikni <b>DODAJ RAMPU</b> za Rampu 1.</div>';
   return;
 }
 host.innerHTML=Array.from({length:n},(_,i)=>{
   const r=i+1,off=isLocked(current,r),cap=getCapacity(current,r),h=getHours(current,r);
   return `<div class="yur-card ${off?'off':''}">
    <div class="yur-ident"><strong>RAMPA ${r}</strong><small>${off?'ISKLJUČENA · ne koristi se za nove termine':'UKLJUČENA · dostupna za termine'}</small></div>
    <label>Kapacitet pal/h<input type="number" min="1" max="500" step="1" value="${cap}" data-yur-cap="${r}"></label>
    <label>Radi od<input type="time" value="${h.from}" data-yur-from="${r}"></label>
    <label>Radi do<input type="time" value="${h.to}" data-yur-to="${r}"></label>
    <button type="button" class="yur-toggle ${off?'off':'on'}" data-yur-toggle="${r}">${off?'UKLJUČI RAMPU':'ISKLJUČI RAMPU'}</button>
   </div>`;
 }).join('');
}
function refreshAll(rebuild=true){
 applyModel();
 if(rebuild)render();
 try{if(typeof populateAnnouncementControls==='function')populateAnnouncementControls()}catch(_){}
 try{if(typeof renderRampe==='function')renderRampe()}catch(_){}
 try{if(typeof renderYard==='function')renderYard()}catch(_){}
 try{if(typeof renderDailyMap==='function')renderDailyMap()}catch(_){}
 try{if(typeof renderWeeklyMap==='function')renderWeeklyMap()}catch(_){}
 try{if(typeof renderAnnouncementSchedule==='function')renderAnnouncementSchedule()}catch(_){}
 try{if(typeof renderRampBlocks==='function')renderRampBlocks()}catch(_){}
 try{if(typeof renderPlannerPro==='function')renderPlannerPro()}catch(_){}
 try{if(typeof renderRampQueue==='function')renderRampQueue()}catch(_){}
 try{window.YardivoSupplierRightDailyMapV583?.refresh?.()}catch(_){}
 try{window.YardivoSupplierDailyMapV583?.refresh?.()}catch(_){}
}

/* Final authoritative Ramp API. Existing operational modules read this object. */
window.YardivoRampConfig={
 isLocked,
 setLocked,
 setCount,
 count,
 getCount:count,
 get:()=>JSON.parse(JSON.stringify(cfg())),
 refresh:()=>refreshAll()
};
window.YardivoRampCapacityV583={
 get:getCapacity,
 set:setCapacity,
 all:()=>loadJson(CAP_KEY),
 masterHours:w=>getHours(w,1)
};

function install(){
 const panel=document.getElementById('receptionRampSettings');
 if(!panel)return;
 /* Rebuild the DOM so all older event listeners remain attached only to detached legacy nodes.
    This guarantees a single visible ramp-management implementation. */
 if(panel.dataset.yardivoUnifiedRamps!=='1'){
   panel.dataset.yardivoUnifiedRamps='1';
   rebuildPanel();
 }else render();
}
window.addEventListener('yardivo:master-data-changed',()=>{
 activeWarehouseId='';
 setTimeout(()=>{install();refreshAll()},40);
});
window.addEventListener('yardivo:data-synced',()=>setTimeout(install,100));
window.addEventListener('yardivo:login',()=>setTimeout(install,180));
document.addEventListener('DOMContentLoaded',()=>setTimeout(install,120));
window.addEventListener('load',()=>setTimeout(install,400));

let moTimer=0;
new MutationObserver(()=>{
 clearTimeout(moTimer);
 moTimer=setTimeout(()=>{
   const p=document.getElementById('receptionRampSettings');
   if(p&&p.dataset.yardivoUnifiedRamps!=='1')install();
 },80);
}).observe(document.documentElement,{childList:true,subtree:true});

install();
window.YardivoUnifiedRampsV583={render,refresh:refreshAll,active:()=>chooseActive()};
window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-unified-dynamic-ramps-settings';
})();
