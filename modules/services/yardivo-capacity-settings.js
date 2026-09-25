
(function(){
  const KEY='yardivo_capacity_config_v1';

  function role(){
    let r=''; try{r=String(currentSession?.role||'').toLowerCase()}catch(e){}
    return r;
  }
  function isAdmin(){ return role()==='admin'; }

  function defaults(){
    const out={};
    Object.keys(WAREHOUSES||{}).forEach(code=>{
      const ramps=Number(WAREHOUSES[code]?.ramps)||0;
      out[code]={warehousePallets:null,ramps:{}};
      for(let i=1;i<=ramps;i++)out[code].ramps[i]=null;
    });
    return out;
  }
  function load(){
    let cfg=defaults();
    try{
      const saved=JSON.parse(safeStorage.getItem(KEY)||'{}');
      Object.keys(saved).forEach(code=>{
        cfg[code]=cfg[code]||{warehousePallets:null,ramps:{}};
        cfg[code].warehousePallets=Number(saved[code]?.warehousePallets)||cfg[code].warehousePallets;
        cfg[code].ramps={...(cfg[code].ramps||{}),...(saved[code]?.ramps||{})};
      });
    }catch(e){}
    return cfg;
  }
  function save(cfg){
    safeStorage.setItem(KEY,JSON.stringify(cfg));
    window.YARDIVO_CAPACITY=cfg;
  }
  window.YARDIVO_CAPACITY=load();

  window.getWarehouseCapacity=function(code){
    {const v=(window.YARDIVO_CAPACITY||load())[code]?.warehousePallets;return v==null||v===''?null:Number(v);}
  };
  window.getRampCapacity=function(code,ramp){
    {const v=(window.YARDIVO_CAPACITY||load())[code]?.ramps?.[ramp];return v==null||v===''?null:Number(v);}
  };

  function settingsHost(){
    return document.getElementById('settings') || document.querySelector('.view[data-view="settings"]');
  }

  function renderCapacitySettings(){
    const host=settingsHost(); if(!host)return;
    let card=document.getElementById('adminCapacitySettings');

    if(!isAdmin()){
      if(card)card.remove();
      return;
    }

    if(!card){
      card=document.createElement('div');
      card.id='adminCapacitySettings';
      card.className='capacity-admin-card';
      host.appendChild(card);
    }

    const cfg=load();
    const allowed=(typeof currentAllowedWarehouses==='function'&&currentAllowedWarehouses().length)
      ? currentAllowedWarehouses()
      : Object.keys(WAREHOUSES||{});

    card.innerHTML=`<h3>KAPACITET SKLADIŠTA I RAMPI</h3>
      <div class="capacity-admin-note">Samo Admin može mijenjati kapacitete. Vrijednosti se spremaju trajno i koriste se kao centralna konfiguracija sustava.</div>
      ${allowed.map(code=>{
        const wh=WAREHOUSES[code]||{};
        const ramps=Number(wh.ramps)||0;
        return `<div class="capacity-wh" data-cap-wh="${code}">
          <div class="capacity-wh-head">
            <div><strong>${code} · ${wh.name||''}</strong><br><small>${wh.location||''}</small></div>
            <label>KAPACITET SKLADIŠTA · PALETE
              <input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" data-wh-total="${code}" value="${cfg[code]?.warehousePallets??''}">
            </label>
          </div>
          <div class="capacity-ramps">
            ${ramps?Array.from({length:ramps},(_,x)=>x+1).map(r=>`
              <div class="capacity-ramp">
                <label>RAMPA ${r} · PALETE
                  <input type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" data-ramp-cap="${code}:${r}" value="${cfg[code]?.ramps?.[r]??''}">
                </label>
              </div>`).join(''):'<small>Rampe za ovo skladište još nisu definirane.</small>'}
          </div>
        </div>`;
      }).join('')}
      <button type="button" class="capacity-save" id="saveCapacitySettings">SPREMI KAPACITETE</button>
      <span id="capacitySavedMsg" class="capacity-saved"></span>`;

    document.getElementById('saveCapacitySettings')?.addEventListener('click',()=>{
      if(!isAdmin()){alert('Samo Admin može mijenjati kapacitete.');return}
      const next=load();
      card.querySelectorAll('[data-wh-total]').forEach(inp=>{
        const code=inp.dataset.whTotal;
        next[code]=next[code]||{warehousePallets:800,ramps:{}};
        next[code].warehousePallets=Math.max(1,Number(inp.value)||1);
      });
      card.querySelectorAll('[data-ramp-cap]').forEach(inp=>{
        const [code,ramp]=inp.dataset.rampCap.split(':');
        next[code]=next[code]||{warehousePallets:800,ramps:{}};
        next[code].ramps=next[code].ramps||{};
        next[code].ramps[ramp]=Math.max(1,Number(inp.value)||1);
      });
      save(next);
      const msg=document.getElementById('capacitySavedMsg');
      if(msg){msg.textContent='✓ Spremljeno';setTimeout(()=>msg.textContent='',2200)}
      try{render?.()}catch(e){}
      try{renderRampe?.()}catch(e){}
      try{renderDailyMap?.()}catch(e){}
      try{renderOverview?.()}catch(e){}
    });
  }

  // Capacity helper for any view that needs occupancy percentage.
  window.getWarehouseOccupancyPercent=function(code,pallets){
    return Math.min(100,Math.round((Number(pallets||0)/getWarehouseCapacity(code))*100));
  };
  window.getRampOccupancyPercent=function(code,ramp,pallets){
    return Math.min(100,Math.round((Number(pallets||0)/getRampCapacity(code,ramp))*100));
  };

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="settings"],[data-home-target="settings"]'))setTimeout(renderCapacitySettings,30);
  },true);
  window.addEventListener('load',()=>setTimeout(renderCapacitySettings,250));
  // Capacity editor is rendered on entry and after an explicit Save only.
  // Do not periodically rebuild while Admin is typing.

  window.renderCapacitySettings=renderCapacitySettings;
})();
