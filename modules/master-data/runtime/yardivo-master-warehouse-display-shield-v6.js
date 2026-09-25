(function(){
'use strict';
if(window.__YARDIVO_MASTER_WAREHOUSE_DISPLAY_SHIELD_V6__)return;
window.__YARDIVO_MASTER_WAREHOUSE_DISPLAY_SHIELD_V6__=true;

function master(){
 try{
   const d=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')||{};
   return Array.isArray(d.warehouses)?d.warehouses:[];
 }catch(_){return[]}
}
function map(){
 const m=new Map();
 master().forEach(w=>{
   if(!w||w.active===false)return;
   const id=String(w.id||'').trim(),name=String(w.name||'').trim();
   if(id&&name&&id!==name)m.set(id,name);
 });
 return m;
}
function replaceText(s,mp){
 let out=String(s??'');
 mp.forEach((name,id)=>{
   const safe=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
   const re=new RegExp('(^|[^A-Za-z0-9_])'+safe+'(?=$|[^A-Za-z0-9_])','g');
   out=out.replace(re,(m,prefix)=>prefix+name);
 });
 return out;
}
function skip(el){
 return !el||!!el.closest?.('script,style,noscript,textarea,input,select');
}
function cleanTextNode(n,mp){
 const p=n.parentElement;if(skip(p))return;
 const before=n.nodeValue||'',after=replaceText(before,mp);
 if(after!==before)n.nodeValue=after;
}
function cleanElement(root,mp){
 if(!root||root.nodeType!==1)return;
 if(!skip(root)){
   ['title','aria-label'].forEach(a=>{
     if(root.hasAttribute?.(a)){
       const before=root.getAttribute(a)||'',after=replaceText(before,mp);
       if(after!==before)root.setAttribute(a,after);
     }
   });
 }
 const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let n;while((n=tw.nextNode()))cleanTextNode(n,mp);
}
function clean(root=document.body){
 if(!root)return;
 const mp=map();if(!mp.size)return;
 if(root.nodeType===3){cleanTextNode(root,mp);return}
 cleanElement(root,mp);
}
let queued=false;
function schedule(){
 if(queued)return;queued=true;
 queueMicrotask(()=>{queued=false;clean(document.body)});
}
const mo=new MutationObserver(ms=>{
 const mp=map();if(!mp.size)return;
 for(const m of ms){
   if(m.type==='characterData'){cleanTextNode(m.target,mp);continue}
   for(const n of m.addedNodes){
     if(n.nodeType===3)cleanTextNode(n,mp);
     else if(n.nodeType===1)cleanElement(n,mp);
   }
 }
});
function boot(){
 if(!document.body)return;
 clean(document.body);
 mo.observe(document.body,{subtree:true,childList:true,characterData:true});
}
['yardivo:master-data-changed','yardivo:data-synced','yardivo:context-changed','yardivo:view-opened']
 .forEach(ev=>window.addEventListener(ev,schedule));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('load',schedule,{once:true});

window.YardivoWarehouseDisplayShieldV6={clean,map};
})();
