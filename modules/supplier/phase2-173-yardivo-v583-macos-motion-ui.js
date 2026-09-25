
(function(){
'use strict';

/* Restart native <dialog> animation on every open, not only first use. */
function restartMotion(el){
  if(!el)return;
  el.classList.remove('yardivo-motion-restart');
  void el.offsetWidth;
  el.classList.add('yardivo-motion-restart');
}
try{
  const proto=window.HTMLDialogElement?.prototype;
  if(proto && !proto.__yardivoMotionPatched){
    proto.__yardivoMotionPatched=true;
    const originalModal=proto.showModal;
    const originalShow=proto.show;
    if(originalModal)proto.showModal=function(){
      const r=originalModal.apply(this,arguments);
      restartMotion(this);
      return r;
    };
    if(originalShow)proto.show=function(){
      const r=originalShow.apply(this,arguments);
      restartMotion(this);
      return r;
    };
  }
}catch(_){}

/* Give custom overlays a fresh animation only on the CLOSED -> OPEN edge.
   IMPORTANT: restartMotion() itself changes class. The old observer reacted to
   those class writes again while .open was still present, creating a recursive
   MutationObserver loop that could freeze Supplier Planner and other overlays. */
const motionOpenState=new WeakMap();
const motionDialogState=new WeakMap();
const motionDetailState=new WeakMap();
const observer=new MutationObserver(records=>{
  for(const rec of records){
    const el=rec.target;

    if(rec.attributeName==='class' && el?.classList){
      const isOpen=el.classList.contains('open');
      const wasOpen=motionOpenState.get(el)===true;
      if(isOpen!==wasOpen){
        motionOpenState.set(el,isOpen);
        if(isOpen){
          restartMotion(el);
          const panel=el.querySelector?.('.timeline-dialog,.yiv-dialog,.y5-reader,.yod-dialog,.modal-content,.dialog');
          restartMotion(panel);
        }
      }

      if(el.id==='announcementDetail'){
        const isActive=el.classList.contains('active');
        const wasActive=motionDetailState.get(el)===true;
        if(isActive!==wasActive){
          motionDetailState.set(el,isActive);
          if(isActive){
            const head=el.querySelector(':scope > .section-title');
            const body=el.querySelector(':scope > .announcement-detail-wrap');
            restartMotion(head);restartMotion(body);
            requestAnimationFrame(()=>{try{el.scrollTop=0}catch(_){}});
          }
        }
      }
    }

    if(rec.attributeName==='open' && el instanceof HTMLDialogElement){
      const isOpen=!!el.open;
      const wasOpen=motionDialogState.get(el)===true;
      if(isOpen!==wasOpen){
        motionDialogState.set(el,isOpen);
        if(isOpen)restartMotion(el);
      }
    }
  }
});
observer.observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','open']});

/* Optional Escape behavior for the floating announcement detail. */
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape')return;
  const detail=document.getElementById('announcementDetail');
  if(detail?.classList.contains('active')){
    const back=document.getElementById('backFromAnnouncementDetail');
    if(back){e.preventDefault();back.click()}
  }
},true);

window.YardivoMotionUIV583={restart:restartMotion};
})();
