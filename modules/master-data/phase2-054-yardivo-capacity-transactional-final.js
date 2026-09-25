
(function(){
  const KEY='yardivo_capacity_config_v1';
  let dirty=false;

  function admin(){
    let r='';try{r=String(currentSession?.role||'').toLowerCase()}catch(e){}
    return r==='admin';
  }
  function digitsOnly(inp){
    const clean=String(inp.value||'').replace(/[^\d]/g,'');
    if(inp.value!==clean)inp.value=clean;
  }
  function markDirty(inp){
    if(!admin())return;
    digitsOnly(inp);
    dirty=true;
    inp.classList.add('capacity-dirty');
    let msg=document.getElementById('capacityUnsavedMsg');
    if(!msg){
      msg=document.createElement('span');
      msg.id='capacityUnsavedMsg';
      document.getElementById('saveCapacitySettings')?.insertAdjacentElement('afterend',msg);
    }
    if(msg)msg.textContent='NESPREMLJENE PROMJENE';
  }

  // Typing changes only the draft in the form. Storage is NOT touched.
  document.addEventListener('input',e=>{
    const inp=e.target.closest?.('[data-wh-total],[data-ramp-cap]');
    if(inp)markDirty(inp);
  },true);

  // Validate before the existing Save handler reads values.
  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('#saveCapacitySettings');
    if(!btn)return;
    if(!admin()){e.preventDefault();e.stopImmediatePropagation();return}
    const card=document.getElementById('adminCapacitySettings');
    let invalid=null;
    card?.querySelectorAll('[data-wh-total],[data-ramp-cap]').forEach(inp=>{
      digitsOnly(inp);
      if(!invalid && (!inp.value || Number(inp.value)<1))invalid=inp;
    });
    if(invalid){
      e.preventDefault();e.stopImmediatePropagation();
      invalid.focus();
      alert('Kapacitet mora biti cijeli broj veći od 0.');
      return;
    }
    // Existing Save handler now performs the single persistent commit.
    setTimeout(()=>{
      dirty=false;
      card?.querySelectorAll('.capacity-dirty').forEach(x=>x.classList.remove('capacity-dirty'));
      const msg=document.getElementById('capacityUnsavedMsg');if(msg)msg.textContent='';
      // Refresh every capacity-dependent view immediately after commit.
      try{renderDashboardSimple?.()}catch(e){}
      try{renderWarehouseCards?.()}catch(e){}
      try{renderRampe?.()}catch(e){}
      try{renderDockOverview?.()}catch(e){}
      try{renderDailyMap?.()}catch(e){}
      try{renderWeeklyMap?.()}catch(e){}
      try{renderOverview?.()}catch(e){}
      try{render?.()}catch(e){}
    },0);
  },true);

  // Warn if Admin tries to leave Settings with an uncommitted draft.
  document.addEventListener('click',e=>{
    if(!dirty)return;
    const nav=e.target.closest?.('[data-view],[data-home-target]');
    if(!nav || nav.dataset.view==='settings'||nav.dataset.homeTarget==='settings')return;
    if(!confirm('Kapaciteti nisu spremljeni. Želiš napustiti Postavke bez spremanja?')){
      e.preventDefault();e.stopImmediatePropagation();
    }else{
      dirty=false;
    }
  },true);

  window.YardivoCapacityTransactional={
    isDirty:()=>dirty,
    refresh:()=>{
      try{renderDashboardSimple?.();renderWarehouseCards?.();renderRampe?.();renderDockOverview?.();renderDailyMap?.();renderWeeklyMap?.();renderOverview?.()}catch(e){}
    }
  };
})();
