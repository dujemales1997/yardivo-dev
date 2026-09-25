(function(){
  const stage=document.getElementById('yard3DStage');
  const ground=document.getElementById('yard3DGround');
  const rig=document.getElementById('yard3DCameraRig');
  const label=document.getElementById('yardZoomLabel');
  if(!stage||!ground||!rig)return;

  let rx=58, rz=-12, scale=1;
  let dragging=false, px=0, py=0;

  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function apply(){
    rx=58;
    scale=clamp(scale,.55,1.8);
    ground.style.setProperty('--yard-rx','66deg');
    ground.style.setProperty('--yard-rz',rz+'deg');
    rig.style.setProperty('--yard-scale',scale);
    if(label)label.textContent=Math.round(scale*100)+'%';
    try{
      const today=window.yardivoLocalDateV583();
      const wh=(typeof activeWarehouse!=='undefined'&&activeWarehouse&&activeWarehouse!=='ALL')
        ? activeWarehouse
        : yardivoCanonicalWarehouseV583();
      const inYard=announcements.filter(a=>(a.warehouse||yardivoCanonicalWarehouseV583())===wh&&a.date===today&&normalizedPlanStatus(a)==='U dvorištu');
      requestAnimationFrame(()=>renderLive3DRoutes(inYard));
    }catch(e){}
  }
  function reset(){rx=66;rz=-12;scale=1;apply()}

  stage.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    dragging=true;px=e.clientX;py=e.clientY;
    stage.classList.add('dragging');
    try{stage.setPointerCapture(e.pointerId)}catch(err){}
  });
  stage.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const dx=e.clientX-px;
    // only rotate around the vertical map axis; never translate or tilt
    rz+=dx*.42;
    px=e.clientX;py=e.clientY;
    apply();
  });
  function stop(e){
    dragging=false;stage.classList.remove('dragging');
    try{stage.releasePointerCapture(e.pointerId)}catch(err){}
  }
  stage.addEventListener('pointerup',stop);
  stage.addEventListener('pointercancel',stop);

  stage.addEventListener('wheel',e=>{
    e.preventDefault();
    scale += e.deltaY<0 ? .08 : -.08;
    apply();
  },{passive:false});

  stage.addEventListener('dblclick',e=>{e.preventDefault();reset()});
  document.getElementById('yardZoomIn')?.addEventListener('click',()=>{scale+=.1;apply()});
  document.getElementById('yardZoomOut')?.addEventListener('click',()=>{scale-=.1;apply()});
  document.getElementById('yardResetCamera')?.addEventListener('click',reset);

  // Keyboard alternative while focus is inside the 3D view.
  stage.tabIndex=0;
  stage.setAttribute('aria-label','3D dvorište. Povuci miš za rotaciju, kotačić za zoom.');
  stage.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'){rz-=5;apply();e.preventDefault()}
    else if(e.key==='ArrowRight'){rz+=5;apply();e.preventDefault()}
    else if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault()}
    else if(e.key==='+'||e.key==='='){scale+=.1;apply();e.preventDefault()}
    else if(e.key==='-'){scale-=.1;apply();e.preventDefault()}
    else if(e.key==='0'){reset();e.preventDefault()}
  });

  apply();
})();
