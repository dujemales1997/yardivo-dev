(function(){
 'use strict';
 function syncButton(host,mode){
   if(!host)return;
   var world=host.querySelector('.yf-world'); if(!world)return;
   world.classList.toggle('mode2d',mode==='2d');
   world.classList.toggle('mode3d',mode==='3d');
   host.dataset.yfMode=mode;
   host.querySelectorAll('[data-yf-mode]').forEach(function(b){b.classList.toggle('active',b.dataset.yfMode===mode)});
   var help=host.querySelector('.yf-help'); if(help)help.style.display=mode==='3d'?'block':'none';
 }
 document.addEventListener('click',function(e){
   var b=e.target.closest('[data-yf-mode]'); if(!b)return;
   var host=b.closest('#yardivoFinalLiveYard,#yardivoFinalWarYard'); if(!host)return;
   syncButton(host,b.dataset.yfMode);
 },true);
 function label(){
   ['yardivoFinalLiveYard','yardivoFinalWarYard'].forEach(function(id){
     var h=document.getElementById(id);if(!h)return;
     var b3=h.querySelector('[data-yf-mode="3d"]');if(b3)b3.textContent='3D';
     var b2=h.querySelector('[data-yf-mode="2d"]');if(b2)b2.textContent='2D';
     var meta=h.querySelector('.yf-toolbar b');if(meta&&!meta.dataset.v28){meta.dataset.v28='1';meta.title='2D tlocrt / 3D objekti na ravnom 2D podu'}
   });
 }
 window.addEventListener('load',function(){setTimeout(label,1400)});
 setInterval(label,1800);
 window.YardivoHybridMode={set:function(where,mode){syncButton(document.getElementById(where==='war'?'yardivoFinalWarYard':'yardivoFinalLiveYard'),mode)}};
})();
