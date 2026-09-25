
(function(){
'use strict';
/* Throttle 3D camera visual updates to animation frames.
   This prevents rapid DOM repainting that caused black blinking. */
let raf=0;
function stabilize(){
  document.querySelectorAll('#yardivoFinalLiveYard .yf-world,#yardivoFinalWarYard .yf-world').forEach(function(w){
    w.style.transition='none';
    w.style.webkitBackfaceVisibility='hidden';
    w.style.backfaceVisibility='hidden';
  });
}
/* Stability styles are static. Re-applying them on every pointer move caused
   expensive full-document queries/repaints in Safari. Apply only when needed. */
window.addEventListener('load',function(){
  stabilize();
  setTimeout(stabilize,1200);
  setTimeout(stabilize,5000);
},{once:true});
window.addEventListener('yardivo:warehouse-changed',stabilize);
window.addEventListener('yardivo:login',function(){setTimeout(stabilize,120)});
})();
