(function(){
'use strict';
if(window.__YARDIVO_SUPPLIER_HISTORY_TOMBSTONE_VOICE_20260924__)return;
window.__YARDIVO_SUPPLIER_HISTORY_TOMBSTONE_VOICE_20260924__=true;
function purgeGhostSupplier(){
 try{
   for(const st of [localStorage,sessionStorage]){
     const remove=[];
     for(let i=0;i<st.length;i++){
       const k=st.key(i);
       if(k&&String(k).toLowerCase().includes('dobavljac69'))remove.push(k)
     }
     remove.forEach(k=>st.removeItem(k))
   }
 }catch(_){}
 try{
   document.querySelectorAll('option,tr,li,[data-username],[data-user]').forEach(el=>{
     const txt=String(el.textContent||'').trim().toLowerCase();
     const du=String(el.getAttribute?.('data-username')||el.getAttribute?.('data-user')||'').toLowerCase();
     if(txt==='dobavljac69'||du==='dobavljac69'||txt.includes('dobavljac69'))el.remove()
   })
 }catch(_){}
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(purgeGhostSupplier,100));
window.addEventListener('load',()=>setTimeout(purgeGhostSupplier,250),{once:true});
['yardivo:login','yardivo:data-synced','yardivo:master-data-changed'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(purgeGhostSupplier,40)));
setInterval(purgeGhostSupplier,1000);
try{new MutationObserver(()=>purgeGhostSupplier()).observe(document.documentElement,{childList:true,subtree:true})}catch(_){}
})();
