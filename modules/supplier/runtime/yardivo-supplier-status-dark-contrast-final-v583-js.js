(function(){
'use strict';
if(window.__YARDIVO_SUPPLIER_STATUS_DARK_CONTRAST_FINAL_V583__)return;
window.__YARDIVO_SUPPLIER_STATUS_DARK_CONTRAST_FINAL_V583__=true;

function force(root){
 if(!root)return;
 const cards=[...root.children];
 cards.forEach(card=>{
   card.style.setProperty('background','#0b2230','important');
   card.style.setProperty('background-color','#0b2230','important');
   card.style.setProperty('color','#eaf7ff','important');
   card.style.setProperty('border-color','#29485d','important');
   card.querySelectorAll('*').forEach(el=>{
     const cs=getComputedStyle(el);
     const bg=cs.backgroundColor;
     const c=cs.color;
     /* Only replace near-white/transparent text areas; keep semantic status badges. */
     if(!/badge|pill|status/i.test(String(el.className||''))){
       if(c==='rgb(255, 255, 255)' || c==='rgba(255, 255, 255, 1)' ||
          /rgb\(24[0-9], 24[0-9], 24[0-9]\)/.test(c)){
         el.style.setProperty('color','#eaf7ff','important');
       }
     }
     if(bg==='rgb(255, 255, 255)' || bg==='rgba(255, 255, 255, 1)'){
       el.style.setProperty('background-color','#0b2230','important');
     }
   });
 });
}
function apply(){
 const p=document.getElementById('yardivoSupplierPortal');if(!p)return;
 force(document.getElementById('yspStatusList'));
 force(document.getElementById('yspHistoryList'));
 /* Fallback: identify the two sections by heading if legacy renderer uses another ID. */
 [...p.querySelectorAll('section,div')].forEach(x=>{
   const h=x.querySelector(':scope > h2,:scope > h3,:scope > .section-title');
   const t=String(h?.textContent||'').toUpperCase();
   if(/STANJE NAJAVE I ISPORUKE|POVIJEST NAJAVA/.test(t)){
     const body=x.querySelector('[class*="list"],[class*="body"]');
     if(body)force(body);
   }
 });
}
let t=0;
new MutationObserver(()=>{clearTimeout(t);t=setTimeout(apply,40)}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,100));
window.addEventListener('load',()=>setTimeout(apply,300));
window.addEventListener('yardivo:data-synced',()=>setTimeout(apply,60));
apply();
window.YardivoSupplierContrastV583={refresh:apply};
window.YARDIVO_DEV_BUILD='20260910-dev-v5.8.3-supplier-status-dark-contrast-fix';
})();
