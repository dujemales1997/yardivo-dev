(function(){
 function clean(){
   const view=document.getElementById('announce'); if(!view)return;
   view.querySelectorAll('table thead tr').forEach(tr=>{
     const cells=Array.from(tr.children);
     if(cells.length<2)return;
     const first=cells[0];
     const txt=(first.textContent||'').trim().toUpperCase();
     const rest=cells.slice(1).map(x=>(x.textContent||'').trim()).join(' ');
     // Exact row from screenshot: first cell RAMPA, followed by time headers.
     if(txt==='RAMPA' && /\b\d{2}:\d{2}\b/.test(rest)){
       first.textContent='';
       first.setAttribute('aria-label','');
       first.dataset.yardivoRemovedDuplicateRampa='1';
     }
   });
 }
 window.addEventListener('load',()=>setTimeout(clean,300));
 document.addEventListener('click',e=>{
   if(e.target.closest('[data-view="announce"]'))setTimeout(clean,80);
 },true);
 const mo=new MutationObserver(()=>clean());
 window.addEventListener('load',()=>{
   const v=document.getElementById('announce');
   if(v)mo.observe(v,{subtree:true,childList:true});
 });
})();
