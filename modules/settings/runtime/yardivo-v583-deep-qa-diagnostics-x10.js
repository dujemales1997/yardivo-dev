(function(){
'use strict';
const BUILD='20260912-dev-v5.8.3-deep-qa-x10';
window.YARDIVO_DEV_BUILD=BUILD;

function rgb(s){
 const m=String(s||'').match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
 return m?[+m[1],+m[2],+m[3]]:null;
}
function lum(c){return c?(.2126*c[0]+.7152*c[1]+.0722*c[2]):255}
function visible(el){
 const cs=getComputedStyle(el);
 const r=el.getBoundingClientRect();
 return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity!==0&&r.width>1&&r.height>1;
}
function lightAudit(){
 const was=document.body.classList.contains('light-mode');
 if(!was)document.body.classList.add('light-mode');
 const bad=[];
 document.querySelectorAll('body *').forEach(el=>{
   if(el.closest('.sidebar'))return;
   if(!visible(el))return;
   const cs=getComputedStyle(el),c=rgb(cs.backgroundColor);
   if(!c)return;
   if(lum(c)<70){
     bad.push({
       tag:el.tagName,
       id:el.id||'',
       cls:String(el.className||'').slice(0,120),
       background:cs.backgroundColor,
       luminance:Math.round(lum(c))
     });
   }
 });
 if(!was)document.body.classList.remove('light-mode');
 return bad.slice(0,250);
}
function workflowAudit(){
 let anns=[];try{anns=Array.isArray(window.announcements)?window.announcements:[]}catch(_){}
 const issues=[];
 for(const a of anns){
   if(!a)continue;
   if(a.supplierDeliveryId&&!a.warehouse)issues.push({type:'supplier_missing_warehouse',id:a.id});
   if(a.supplierDeliveryId&&a.status==='Najavljen'&&(!a.date||!a.time||!a.dock))issues.push({type:'confirmed_missing_slot',id:a.id});
   if(a.yardArrivalAt&&!a.gateCheckedAt)issues.push({type:'yard_arrival_without_gate_timestamp',id:a.id});
   if(a.dockArrivalAt&&!a.dock)issues.push({type:'dock_arrival_without_dock',id:a.id});
 }
 return issues;
}
function structuralAudit(){
 return{
   bodyCloseCount:(document.documentElement.outerHTML.match(/<\/body>/gi)||[]).length,
   duplicateIds:(()=>{
     const m=new Map(),d=[];
     document.querySelectorAll('[id]').forEach(e=>m.set(e.id,(m.get(e.id)||0)+1));
     for(const [id,n] of m)if(n>1)d.push({id,n});
     return d;
   })(),
   darkLightCandidates:document.body.classList.contains('light-mode')?lightAudit().length:null
 };
}
window.YardivoDeepQAV583={
 build:BUILD,
 auditLight:lightAudit,
 auditWorkflow:workflowAudit,
 auditStructure:structuralAudit,
 realtime:()=>window.YardivoRealtimeX10V583?.status?.()||null,
 forceSync:()=>window.YardivoRealtimeX10V583?.force?.()
};
})();
