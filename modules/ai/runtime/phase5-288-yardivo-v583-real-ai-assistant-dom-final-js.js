
(()=>{'use strict';
function clean(){
  document.querySelectorAll('#yardivoSmartAssistant .yv-ai-suggestions').forEach(x=>x.remove());
  const input=document.getElementById('yardivoAssistantInput');
  if(input)input.placeholder='Napiši poruku YARDIVO Assistantu...';
  const msgs=document.getElementById('yardivoAssistantMessages');
  if(msgs && msgs.children.length===1){
    const t=String(msgs.firstElementChild?.textContent||'').toLowerCase();
    if(t.includes('pozdrav. vidim samo yardivo podatke dopuštene')||t.includes('probajte:'))msgs.replaceChildren();
  }
}
window.addEventListener('yardivo:login',()=>setTimeout(clean,80));
window.addEventListener('load',()=>setTimeout(clean,500),{once:true});
document.addEventListener('DOMContentLoaded',clean,{once:true});
setTimeout(clean,300);
})();
