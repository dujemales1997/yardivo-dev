
(function(){
  function role(){
    let r='';
    try{r=String(currentSession?.role||window.currentSession?.role||'').toLowerCase().trim()}catch(e){}
    if(r==='zalihe'||r==='upravljanje zalihama')r='inventory';
    if(r==='management'||r==='voditelj')r='manager';
    if(r==='prijam')r='reception';
    if(r==='porta'||r==='portir')r='gate';
    return r;
  }

  function selectedWarehouse(){
    const sel=document.getElementById('globalWarehouse');
    const selected=String(sel?.value||'').trim();
    if(selected&&selected!=='ALL')return selected;
    try{
      const canonical=String(window.YardivoAppStateV583?.warehouse?.()||'').trim();
      if(canonical)return canonical;
    }catch(_){}
    const active=String(window.activeWarehouse||'').trim();
    return active&&active!=='ALL'?active:'';
  }

  function locationWarehouses(){
    try{
      const d=window.YardivoAppStateV583?.master?.()||{warehouses:[]};
      const loc=String(window.YardivoAppStateV583?.location?.()||'');
      return (d.warehouses||[]).filter(w=>w&&w.active!==false&&String(w.location_id)===loc).map(w=>String(w.id));
    }catch(_){return[]}
  }

  function setSelectValue(id,value){
    const sel=document.getElementById(id);
    if(!sel)return;
    if([...sel.options].some(o=>o.value===value)){
      sel.value=value;
      sel.dispatchEvent(new Event('change',{bubbles:false}));
    }
  }

  function syncDependentSelectors(wh){
    // All operational views follow the top warehouse selector.
    setSelectValue('savedWarehouseFilter',wh);
    setSelectValue('dailyMapWarehouseSelect',wh);
    setSelectValue('weeklyMapWarehouse',wh);

    // Receiving may use one of several legacy IDs.
    ['receivingWarehouse','receivingWarehouseSelect','receivingWarehouseFilter'].forEach(id=>setSelectValue(id,wh));

    // Incident form follows current warehouse for new records.
    setSelectValue('incWarehouse',wh);

    // Announcement creation defaults to the current warehouse, but user may still deliberately change it.
    const ann=document.getElementById('annWarehouse');
    if(ann && [...ann.options].some(o=>o.value===wh) && !ann.dataset.userChanged){
      ann.value=wh;
    }
  }

  function renderWarehouseAware(){
    try{render?.()}catch(e){}
    try{renderAnnouncements?.()}catch(e){}
    try{renderReceiving?.()}catch(e){}
    try{renderDailyMap?.()}catch(e){}
    try{renderWeeklyMap?.()}catch(e){}
    try{renderRampe?.()}catch(e){}
    try{renderYard?.()}catch(e){}
    try{renderOverview?.()}catch(e){}
    try{renderIncidents?.()}catch(e){}
  }

  function applyGlobalWarehouse(){
    const sel=document.getElementById('globalWarehouse');
    if(!sel)return;

    // PORTA is the deliberate exception: one combined Lokacija 2 feed.
    if(role()==='gate'){
      try{
        activeWarehouse='ALL';
        safeStorage?.setItem?.('studenac_active_warehouse','ALL');
      }catch(e){}
      const info=document.getElementById('globalWarehouseInfo');
      if(info){const n=window.YardivoAppStateV583?.locationName?.(window.YardivoAppStateV583?.location?.())||'LOKACIJA';info.textContent='SVA SKLADIŠTA · '+String(n).toUpperCase();}
      // Do not push W201/W203/W204 into Gate check-in filters.
      try{window.renderPortaSharedAnnouncements?.()}catch(e){}
      try{window.renderPortaVerifiedList?.()}catch(e){}
      try{renderCheckinPro?.()}catch(e){}
      return;
    }

    const wh=sel.value==='ALL'?selectedWarehouse():sel.value;
    if(!wh)return;

    try{
      activeWarehouse=wh;
      safeStorage?.setItem?.('studenac_active_warehouse',wh);
      /* Canonical context must follow the header dropdown as well. */
      if(String(window.YardivoAppStateV583?.warehouse?.()||'')!==String(wh)){
        window.YardivoAppStateV583?.setWarehouse?.(wh);
      }
    }catch(e){}

    const info=document.getElementById('globalWarehouseInfo');
    if(info)info.textContent=(typeof whLabel==='function'?whLabel(wh):wh).toUpperCase();

    syncDependentSelectors(wh);
    renderWarehouseAware();
  }

  // --- INCIDENTS: list and analytics must follow top selected warehouse ---
  const oldRenderIncidents=window.renderIncidents || (typeof renderIncidents==='function'?renderIncidents:null);
  window.renderIncidents=function(){
    const table=document.getElementById('incidentTable');
    if(!table)return oldRenderIncidents?.();

    const wh=role()==='gate'?null:selectedWarehouse();
    const data=[...incidents]
      .filter(i=>!wh || (i.warehouse||'')===wh)
      .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||Number(b.id||0)-Number(a.id||0));

    const count=document.getElementById('incidentCount');
    if(count)count.textContent=`${data.length} ${data.length===1?'incident':'incidenata'} · ${wh||'sva skladišta'}`;

    const badge=document.getElementById('incidentBadge');
    if(badge){badge.textContent=data.length;badge.style.display=data.length?'inline-flex':'none'}

    table.innerHTML=data.length?data.map(i=>`<tr>
      <td>${i.date||'—'}</td>
      <td><strong>${i.supplier||'—'}</strong><br><small>${i.warehouse||'—'}</small></td>
      <td><span class="incident-chip">${i.type||i.reason||'—'}</span></td>
      <td>${i.severity||'—'}</td>
      <td>${i.pallets||0}</td><td>${i.sku||0}</td>
      <td>${i.note||'—'}</td>
      <td><button class="action" onclick="deleteIncident(${i.id})">OBRIŠI</button></td>
    </tr>`).join(''):'<tr><td colspan="8"><div class="overview-empty">Nema evidentiranih incidenata za odabrano skladište.</div></td></tr>';

    const grouped={};
    data.forEach(i=>{const k=i.type||i.reason||'Ostalo';grouped[k]=(grouped[k]||0)+1});
    const max=Math.max(1,...Object.values(grouped));
    const sum=document.getElementById('incidentSummary');
    if(sum)sum.innerHTML=Object.keys(grouped).length
      ? Object.entries(grouped).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="supplier-bar"><div class="name">${k}</div><div class="bar-track"><div class="bar-fill" style="width:${v/max*100}%"></div></div><div class="bar-score">${v}</div></div>`).join('')
      : '<div class="overview-empty">Nema incidenata za odabrano skladište.</div>';
  };
  try{renderIncidents=window.renderIncidents}catch(e){}

  // --- OVERVIEW: make top-level data warehouse-aware ---
  const originalOverview=window.renderOverview || (typeof renderOverview==='function'?renderOverview:null);
  if(originalOverview){
    window.renderOverview=function(){
      if(role()==='gate')return originalOverview.apply(this,arguments);
      const wh=selectedWarehouse();

      // Temporarily present only the selected warehouse to the legacy analytics renderer.
      const allAnnouncements=announcements;
      const allIncidents=incidents;
      const filteredA=allAnnouncements.filter(a=>(a.warehouse||yardivoCanonicalWarehouseV583())===wh);
      const filteredI=allIncidents.filter(i=>(i.warehouse||'')===wh);
      try{
        announcements=filteredA;
        incidents=filteredI;
        return originalOverview.apply(this,arguments);
      }finally{
        announcements=allAnnouncements;
        incidents=allIncidents;
      }
    };
    try{renderOverview=window.renderOverview}catch(e){}
  }

  // Announcement form: if user manually chooses another warehouse, remember that choice until global changes.
  document.getElementById('annWarehouse')?.addEventListener('change',e=>{
    e.target.dataset.userChanged='1';
  });

  // TOP dropdown is the authoritative selector.
  document.getElementById('globalWarehouse')?.addEventListener('change',()=>{
    const ann=document.getElementById('annWarehouse');
    if(ann)delete ann.dataset.userChanged;
    applyGlobalWarehouse();
  },true);

  // On every section open, re-assert the selected warehouse.
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view],[data-home-target]'))setTimeout(()=>{
      if(role()!=='gate')syncDependentSelectors(selectedWarehouse());
      applyGlobalWarehouse();
    },25);
  },true);

  // Role/session/context changes are event-driven; no permanent 500 ms polling.
  window.addEventListener('yardivo:login',()=>setTimeout(applyGlobalWarehouse,50));
  window.addEventListener('yardivo:context-changed',()=>setTimeout(applyGlobalWarehouse,0));
  window.addEventListener('yardivo:master-data-changed',()=>setTimeout(applyGlobalWarehouse,30));
  window.addEventListener('load',()=>setTimeout(applyGlobalWarehouse,150));

  window.YardivoWarehouseSync={
    apply:applyGlobalWarehouse,
    selected:selectedWarehouse,
    gateWarehouses:locationWarehouses
  };
})();
