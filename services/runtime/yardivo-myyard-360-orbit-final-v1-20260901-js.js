(function(){
'use strict';

/* Stop obsolete parent-level drag handlers from competing with the canonical WebGL canvas.
   The WebGL v3 engine remains the single owner of 3D orbit. */
function protect(){
  const host=document.getElementById('yardivoMyYardWebGL');
  const canvas=host?.querySelector('canvas');
  if(!canvas)return;
  if(canvas.dataset.yardivoOrbitProtected==='1')return;
  canvas.dataset.yardivoOrbitProtected='1';

  /* Do not stop propagation here: the canonical engine listeners are on this exact canvas.
     We only prevent native browser drag/select behavior. */
  canvas.addEventListener('dragstart',e=>e.preventDefault());
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
}
window.addEventListener('load',()=>setTimeout(protect,1200),{once:true});
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="myYard"],[data-home-target="myYard"],#myYard [data-myy="3d"]')){
    setTimeout(protect,120);
  }
},true);
window.addEventListener('yardivo:data-synced',protect);
window.YardivoMyYard360={protect};
})();
