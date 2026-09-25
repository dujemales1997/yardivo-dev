
(function(){
 function clean(){
  document.querySelectorAll('#smartAllocationCard,.yardivo-smart-allocation,.smart-allocation-card,[data-smart-allocation="true"]').forEach(x=>x.remove());
  document.querySelectorAll('body *').forEach(x=>{
   if(x.children.length>40)return;
   const t=(x.textContent||'').trim();
   if(t.includes('YARDIVO SMART ALLOCATION')&&!t.includes('AUTOMATSKA PREPORUKA')){
    let n=x;
    while(n.parentElement && n.parentElement.textContent?.includes('YARDIVO SMART ALLOCATION') &&
          !n.parentElement.textContent?.includes('AUTOMATSKA PREPORUKA')) n=n.parentElement;
    n.remove();
   }
  });
 }
 window.addEventListener('load',()=>setTimeout(clean,250));
 /* stability: legacy global clean observer removed */
})();
