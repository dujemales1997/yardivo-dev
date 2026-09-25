
(function(){
'use strict';
if(window.__YARDIVO_THEME_FULL_AUTHORITY_V4__)return;
window.__YARDIVO_THEME_FULL_AUTHORITY_V4__=true;

const root=document.documentElement;
const touched=new WeakMap();
const touchedEls=new Set();

function activePalette(){
  if(root.dataset.yardivoMainTheme!=='dark')return null;
  const v=root.dataset.yardivoDarkPalette||'original';
  if(!['black','silver','steel'].includes(v))return null;
  if(v==='black')return{bg:'#050607',s1:'#0d0f11',s2:'#111315',line:'#30353a',text:'#f4f6f7',muted:'#9aa1a7',accent:'#74828c'};
  if(v==='silver')return{bg:'#171b1f',s1:'#23292e',s2:'#2a3137',line:'#4b555e',text:'#f5f7f8',muted:'#b3bbc2',accent:'#a5b0b8'};
  return{bg:'#0d1216',s1:'#172028',s2:'#1c2730',line:'#374852',text:'#eef3f5',muted:'#9dafb8',accent:'#7897a8'};
}
function semantic(el){
  return !!el.closest?.(
    '.dmv-booked,.week-map-item,.appointment,.booking,.badge,.pill,.legend,.slotbar,'+
    '.status-green,.status-red,.status-amber,[class*="status-" i],'+
    '.success,.danger,.warning,.error,.destructive,.alert,.priority,'+
    '[data-status="success"],[data-status="danger"],[data-status="warning"]'
  );
}
function rgbList(s){
  return [...String(s||'').matchAll(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/gi)].map(m=>m.slice(1,4).map(Number));
}
function navy([r,g,b]){
  const max=Math.max(r,g,b),min=Math.min(r,g,b);
  return b>=20 && b>=g+5 && b>=r+8 && (max-min)>=12;
}
function hasNavy(s){return rgbList(s).some(navy)}
function save(el,prop){
  let rec=touched.get(el);
  if(!rec){rec={};touched.set(el,rec)}
  if(!(prop in rec))rec[prop]=el.style.getPropertyValue(prop);
  touchedEls.add(el);
  return rec;
}
function set(el,prop,val){
  save(el,prop);
  el.style.setProperty(prop,val,'important');
}
function neutralSurface(el){
  return el.matches?.(
    '.sidebar,.topbar,.top-bar,#topbar,.panel,.panel-head,.panel-body,.card,.box,.tile,.widget,.surface,'+
    '.section-card,.settings-card,.home-menu-card,.home-card,.control-card,.overview-card,.overview-panel,'+
    '.modal-card,.modal-content,.dialog-card,.drawer-card,.popup-card,.popover,.toolbar,.controls,'+
    '.filter-box,.filter-panel,.table-wrap,.table-card,.table-container,.terminal-panel,.supplier-card,'+
    '.announcement-card,.incident-card,.dock-card,.ramp-card,.yard-card,.truck-card,.report-card,.calendar-card,'+
    '.heat-card,.tower-card,.receiving-card,.gate-card,.order-card,.epal-card,.unannounced-card,.operation-card,'+
    '.planner-card,.ranking-row,.user-card,.role-card,.permission-card,.admin-card'
  );
}
function paint(el){
  const p=activePalette();
  if(!p||!el||el.nodeType!==1||semantic(el))return;
  const cs=getComputedStyle(el);
  if(neutralSurface(el)){
    set(el,'background-color',el.matches('.sidebar')?p.bg:p.s1);
    if(cs.backgroundImage&&cs.backgroundImage!=='none')set(el,'background-image','none');
    set(el,'border-color',p.line);
  }else{
    if(hasNavy(cs.backgroundColor))set(el,'background-color',p.s1);
    if(cs.backgroundImage&&cs.backgroundImage!=='none'&&/gradient/i.test(cs.backgroundImage)&&hasNavy(cs.backgroundImage)){
      set(el,'background-image','none');
      set(el,'background-color',p.s1);
    }
    if(hasNavy(cs.borderTopColor)||hasNavy(cs.borderRightColor)||hasNavy(cs.borderBottomColor)||hasNavy(cs.borderLeftColor))set(el,'border-color',p.line);
  }
  if(hasNavy(cs.color)&&!el.matches('a,.brand-slash'))set(el,'color',p.muted);
}
function restore(){
  for(const el of Array.from(touchedEls)){
    const rec=touched.get(el);
    if(rec)Object.entries(rec).forEach(([prop,val])=>{if(val)el.style.setProperty(prop,val);else el.style.removeProperty(prop)});
    touched.delete(el);
    touchedEls.delete(el);
  }
}
function apply(){
  const p=activePalette();
  if(!p){restore();return}
  if(!document.body)return;
  paint(document.body);
  document.body.querySelectorAll('*').forEach(paint);
}
let scheduled=0;
function schedule(){
  cancelAnimationFrame(scheduled);
  scheduled=requestAnimationFrame(apply);
}
const mo=new MutationObserver(ms=>{
  if(!activePalette())return;
  for(const m of ms){
    for(const n of m.addedNodes){
      if(n.nodeType===1){paint(n);n.querySelectorAll?.('*').forEach(paint)}
    }
  }
});
function boot(){
  if(!document.body)return;
  mo.observe(document.body,{subtree:true,childList:true});
  apply();
}
const rootObs=new MutationObserver(schedule);
rootObs.observe(root,{attributes:true,attributeFilter:['data-yardivo-main-theme','data-yardivo-dark-palette','data-theme']});
window.addEventListener('yardivo:view-opened',schedule);
window.addEventListener('yardivo:data-synced',schedule);
window.addEventListener('yardivo:master-data-changed',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

window.YardivoThemeFullAuthorityV4={apply};
})();
