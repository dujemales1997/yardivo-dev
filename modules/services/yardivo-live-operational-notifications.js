
(function(){
  const STORE='yardivo_live_notifications_v1';
  function role(){let r='';try{r=String(currentSession?.role||'').toLowerCase()}catch(e){};if(r==='zalihe'||r==='upravljanje zalihama')r='inventory';if(r==='prijam')r='reception';if(r==='porta')r='gate';return r}
  function visibleForCurrentRole(){
    // Porta intentionally has no operational notification center/toasts.
    return role()!=='gate';
  }
  function host(){
    let h=document.getElementById('yardivoLiveToasts');
    if(!h){h=document.createElement('div');h.id='yardivoLiveToasts';document.body.appendChild(h)}
    return h;
  }
  function log(n){
    try{
      const arr=JSON.parse(localStorage.getItem(STORE)||'[]');
      arr.unshift(n);localStorage.setItem(STORE,JSON.stringify(arr.slice(0,200)));
    }catch(e){}
  }
  function scopeAllows(scope){
    try{
      const r=role();
      const wh=String(scope?.warehouse||'').toUpperCase().trim();
      const loc=String(scope?.location||(/^W2/.test(wh)?'DU':(/^W1/.test(wh)?'VG':''))||'').toUpperCase();
      const sLoc=String(currentSession?.location||'').toUpperCase();
      if(loc&&sLoc&&loc!==sLoc)return false;
      if(!wh)return false;
      let aw='';
      try{aw=String((typeof getActiveWarehouse==='function'?getActiveWarehouse():(typeof activeWarehouse!=='undefined'?activeWarehouse:localStorage.getItem('yardivo_active_warehouse')))||'').toUpperCase().trim()}catch(_){}
      if(aw&&aw!=='ALL'&&aw!=='SVA')return aw===wh;
      const assigned=Array.isArray(currentSession?.warehouses)?currentSession.warehouses.map(x=>String(x).toUpperCase()):[];
      if(assigned.length&&!assigned.includes('ALL')&&!assigned.includes('SVA'))return assigned.includes(wh);
      return true;
    }catch(e){return true}
  }
  function toast(type,title,body,meta,scope){
    const wh=String(scope?.warehouse||'').toUpperCase().trim();
    const loc=String(scope?.location||(/^W2/.test(wh)?'DU':(/^W1/.test(wh)?'VG':''))||'').toUpperCase();
    const event=(()=>{
      const t=String(title||'').toUpperCase();
      if(/DVORIŠT|DVORIST/.test(t))return'YARD_ARRIVAL';
      if(/NA RAMPI/.test(t))return'DOCK_ARRIVAL';
      if(/ZAPRIMLJEN/.test(t))return'RECEIVED';
      if(/ODBIJEN/.test(t))return'REJECTED';
      if(/IZLAZ|IZAŠAO|IZASAO|ODLAZAK/.test(t))return'YARD_DEPARTURE';
      if(/INCIDENT/.test(t))return'INCIDENT';
      return'OPERATIONAL';
    })();
    const n={id:Date.now()+Math.random(),type,event,title,body,meta,at:new Date().toISOString(),warehouse:wh,location:loc,roles:['admin','manager','inventory','reception']};
    log(n); if(!visibleForCurrentRole()||!scopeAllows(n))return;
    const el=document.createElement('div');el.className=`y-live-toast ${type}`;
    el.innerHTML=`<div class="y-live-toast-head"><span>${title}</span><button class="y-live-toast-close" aria-label="Zatvori">×</button></div>
      <div class="y-live-toast-body">${body}</div><div class="y-live-toast-meta">${meta||new Date().toLocaleTimeString('hr-HR',{hour:'2-digit',minute:'2-digit'})}</div>`;
    host().prepend(el);
    try{window.dispatchEvent(new CustomEvent('yardivo:visible-toast',{detail:{notification:n,source:'live-operational'}}))}catch(_){}
    el.querySelector('.y-live-toast-close').onclick=()=>el.remove();
    setTimeout(()=>{el.style.opacity='0';el.style.transform='translateX(25px)';setTimeout(()=>el.remove(),250)},8000);
  }
  function info(a){return `${a?.supplier||'Dobavljač'} · ${a?.plannedPlate||a?.vehiclePlate||a?.plate||a?.registration||'bez tablice'}`}

  // Wrap the clean MASTER workflow functions instead of adding competing event handlers.
  const oldGate=window.allowGateEntry;
  if(typeof oldGate==='function')window.allowGateEntry=function(a){
    const before=a?.status,ok=oldGate.apply(this,arguments);
    if(ok!==false && a && before!=='U dvorištu')toast('yellow','🚛 KAMION U DVORIŠTU',`${info(a)} ušao je u dvorište.`,`Status: U dvorištu · ${new Date().toLocaleTimeString('hr-HR',{hour:'2-digit',minute:'2-digit'})}`,a);
    return ok;
  };

  const oldStatus=window.setReceivingManualStatus;
  if(typeof oldStatus==='function')window.setReceivingManualStatus=function(id,status){
    let a=null;try{a=(window.YardivoCleanCore?.load?.()||announcements||[]).find(x=>String(x.id)===String(id))}catch(e){}
    const old=a?.status;
    const r=oldStatus.apply(this,arguments);
    if(a && old!==status){
      if(status==='Na rampi')toast('blue','↗ KAMION NA RAMPI',`${info(a)} prebačen je na rampu ${a.dock||'—'}.`,'Prijam robe',a);
      if(status==='Zaprimljeno')toast('green','✓ KAMION ZAPRIMLJEN',`${info(a)} uspješno je zaprimljen.`,'Prijam robe',a);
      if(status==='Odbijen')toast('red','⚠ KAMION ODBIJEN',`${info(a)} je odbijen.`,'Prijam robe',a);
    }
    return r;
  };

  // Public hook for Incident module and future actions.
  window.YardivoNotify={
    yard:a=>toast('yellow','🚛 KAMION U DVORIŠTU',`${info(a)} ušao je u dvorište.`,null,a),
    dock:a=>toast('blue','↗ KAMION NA RAMPI',`${info(a)} · Rampa ${a?.dock||'—'}`,null,a),
    received:a=>toast('green','✓ KAMION ZAPRIMLJEN',`${info(a)} uspješno je zaprimljen.`,null,a),
    rejected:a=>toast('red','⚠ KAMION ODBIJEN',`${info(a)} je odbijen.`,null,a),
    incident:a=>toast('red','⚠ NOVI INCIDENT',`${a?.supplier||'Dobavljač'} · ${a?.severity||a?.seriousness||'Incident'}`,null,a),
    custom:(type,title,body,meta,scope)=>toast(type,title,body,meta,scope)
  };
})();
