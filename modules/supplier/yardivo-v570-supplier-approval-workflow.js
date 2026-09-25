
(function(){
'use strict';

const escapeY=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let cache=[];

function currentRoleY(){
  try{return String((typeof currentSession!=='undefined'?currentSession:window.currentSession)?.role||'').toLowerCase()}
  catch(e){return String(window.currentSession?.role||'').toLowerCase()}
}
function canReview(){return ['admin','manager','management','inventory'].includes(currentRoleY())}
function statusLabelY(s){
  return ({
    pending:'ČEKA POTVRDU',
    revision_requested:'VRAĆENO NA DORADU',
    confirmed:'ODOBRENO',
    arrival:'STIGAO',
    dock:'NA RAMPI',
    receiving:'ZAPRIMANJE',
    completed:'ZAVRŠENO',
    rejected:'ODBIJENO'
  })[String(s||'').toLowerCase()]||String(s||'—').toUpperCase();
}
function ensureUi(){
  if(document.getElementById('supplierRequests'))return;

  const navAnchor=document.querySelector('.nav-btn[data-view="announcements"]');
  if(navAnchor){
    navAnchor.insertAdjacentHTML('beforebegin',
      '<button class="nav-btn" data-view="supplierRequests"><span>⇄</span> Najave dobavljača <b class="nav-badge" id="supplierRequestsBadge" style="display:none">0</b></button>');
  }

  const anchor=document.getElementById('announcements');
  const view=document.createElement('section');
  view.id='supplierRequests';
  view.className='view';
  view.innerHTML=`
    <div class="section-title ysr-hero">
      <div><h1>NAJAVE DOBAVLJAČA</h1><p>Zahtjevi dobavljača prije ulaska u operativne YARDIVO mape</p></div>
      <button class="secondary" id="ysrRefresh" type="button">OSVJEŽI</button>
    </div>
    <div class="ysr-kpis">
      <div class="ysr-kpi"><small>ČEKA POTVRDU</small><strong id="ysrPending">0</strong></div>
      <div class="ysr-kpi"><small>VRAĆENO NA DORADU</small><strong id="ysrRevision">0</strong></div>
      <div class="ysr-kpi"><small>ODOBRENO</small><strong id="ysrApproved">0</strong></div>
      <div class="ysr-kpi"><small>DANAS</small><strong id="ysrToday">0</strong></div>
    </div>
    <section class="panel">
      <div class="ysr-toolbar">
        <select id="ysrStatusFilter">
          <option value="">Svi statusi</option>
          <option value="pending">Čeka potvrdu</option>
          <option value="revision_requested">Vraćeno na doradu</option>
          <option value="proposal_sent">Čeka odgovor dobavljača</option>
          <option value="confirmed">Odobreno</option>
          <option value="arrival">Stigao</option>
          <option value="dock">Na rampi</option>
          <option value="receiving">Zaprimanje</option>
          <option value="completed">Završeno</option>
          <option value="rejected">Odbijeno</option>
        </select>
        <select id="ysrWarehouseFilter"><option value="">Sva skladišta</option></select>
        <input id="ysrSearch" placeholder="Dobavljač / najava / narudžba">
      </div>
      <div class="ysr-table-wrap"><table>
        <thead><tr>
          <th>DOBAVLJAČ</th><th>SKLADIŠTE</th><th>DATUM / TERMIN</th><th>PALETE / SKU</th>
          <th>NARUDŽBA</th><th>TRANSPORT</th><th>STATUS</th><th>NAPOMENA</th><th>AKCIJE</th>
        </tr></thead>
        <tbody id="ysrBody"><tr><td colspan="9"><div class="ysr-empty">Učitavanje...</div></td></tr></tbody>
      </table></div>
    </section>`;
  (anchor?.parentNode||document.querySelector('.main'))?.insertBefore(view,anchor||null);
  /* Navigation is owned only by YardivoRoleStableFinal. */

  document.getElementById('ysrRefresh')?.addEventListener('click',load);
  /* Filter ownership is canonical V580/V582 planner only; legacy cache must not repaint over it. */
  document.getElementById('ysrSearch')?.addEventListener('input',()=>{
    if(!window.YardivoSupplierPlannerV580?.renderRows)render();
  });
  document.getElementById('ysrBody')?.addEventListener('click',handleAction);
  applyAccess();
}
function applyAccess(){
  const show=canReview();
  const b=document.querySelector('.nav-btn[data-view="supplierRequests"]');
  /* RoleStableFinal is the only visibility owner. Only enforce a deny here as a security fallback. */
  if(b&&!show){b.hidden=true;b.classList.add('role-hidden')}
  /* Never auto-navigate away from an open section during async auth/data refresh.
     YardivoRoleStableFinal owns RBAC and navigation. */
}
async function load(){
  ensureUi();applyAccess();
  if(!canReview())return;
  const body=document.getElementById('ysrBody');
  if(body)body.classList.add('ysr-refreshing');
  try{
    cache=await window.YardivoSupplierLiveSync.call('list_internal')||[];
    await window.YardivoSupplierLiveSync.pullInternal();
    render();
  }catch(e){
    if(body && !body.children.length)body.innerHTML=`<tr><td colspan="9"><div class="ysr-empty">Greška: ${escapeY(e?.message||e)}</div></td></tr>`;
    console.error('YARDIVO Supplier inbox load',e);
  }finally{
    if(body)body.classList.remove('ysr-refreshing');
  }
}
function render(){
  if(window.YardivoSupplierPlannerV580?.renderRows){
    const canonical=window.YardivoSupplierPlannerV580?.getRows?.();
    window.YardivoSupplierPlannerV580.renderRows(Array.isArray(canonical)?canonical:cache,false);
    return;
  }
  const body=document.getElementById('ysrBody');if(!body)return;
  const fS=document.getElementById('ysrStatusFilter')?.value||'';
  const fW=document.getElementById('ysrWarehouseFilter')?.value||'';
  const q=(document.getElementById('ysrSearch')?.value||'').trim().toLowerCase();

  const warehouses=[...new Set(cache.map(x=>x.warehouse).filter(Boolean))].sort();
  const wh=document.getElementById('ysrWarehouseFilter');
  if(wh){
    const old=wh.value;
    wh.innerHTML='<option value="">Sva skladišta</option>'+warehouses.map(w=>`<option value="${escapeY(w)}">${escapeY(w)}</option>`).join('');
    if([...wh.options].some(o=>o.value===old))wh.value=old;
  }

  const inv=currentRoleY()==='inventory';
  let activeWh='';
  try{activeWh=String((typeof activeWarehouse!=='undefined'?activeWarehouse:'')||'').toUpperCase().trim()}catch(e){}
  const rows=cache.filter(x=>{
    if(inv && (!activeWh||activeWh==='ALL'||String(x.warehouse||'').toUpperCase()!==activeWh))return false;
    if(fS&&x.status!==fS)return false;
    if(!inv&&fW&&x.warehouse!==fW)return false;
    if(q&&!`${x.supplier_name||''} ${x.supplier_username||''} ${x.client_id||''} ${x.order_number||''}`.toLowerCase().includes(q))return false;
    return true;
  });

  const today=window.yardivoLocalDateV583();
  /* KPI counters and badge use the exact same warehouse/filter scope as the table. */
  document.getElementById('ysrPending').textContent=rows.filter(x=>x.status==='pending').length;
  document.getElementById('ysrRevision').textContent=rows.filter(x=>x.status==='revision_requested').length;
  document.getElementById('ysrApproved').textContent=rows.filter(x=>['confirmed','arrival','dock','receiving','completed'].includes(x.status)).length;
  document.getElementById('ysrToday').textContent=rows.filter(x=>x.delivery_date===today).length;

  /* Badge belongs to the currently selected warehouse, never to hidden requests elsewhere. */
  const pending=rows.filter(x=>x.status==='pending').length;
  const badge=document.getElementById('supplierRequestsBadge');
  if(badge){badge.textContent=pending;badge.style.display=pending?'inline-flex':'none'}

  if(!rows.length){
    body.innerHTML='<tr><td colspan="9"><div class="ysr-empty">Nema novih najava dobavljača.</div></td></tr>';
    return;
  }
  body.innerHTML=rows.map(x=>{
    const editable=['pending','revision_requested','proposal_sent','confirmed'].includes(x.status);
    const transport=[x.vehicle_plate,x.trailer_plate,x.driver_name,x.driver_contact].filter(Boolean).map(escapeY).join('<br>')||'—';
    return `<tr>
      <td><strong>${escapeY(x.supplier_name||x.supplier_username||'—')}</strong><br><small>${escapeY(x.client_id||'')}</small></td>
      <td><strong>${escapeY(x.warehouse)}</strong></td>
      <td>${escapeY(x.delivery_date)}<br><strong>${x.requested_time?('Termin: '+escapeY(String(x.requested_time).slice(0,5))):'Termin nije dodijeljen'}</strong>${x.dock?'<br>Rampa: <strong>'+escapeY(x.dock)+'</strong>':''}</td>
      <td>${Number(x.pallets||0)} pal.<br>${Number(x.sku_count||0)} SKU</td>
      <td>${escapeY(x.order_number||'—')}</td>
      <td>${transport}</td>
      <td><span class="ysr-status ${escapeY(x.status)}">${escapeY(statusLabelY(x.status))}</span></td>
      <td><div class="ysr-note">${escapeY(x.review_note||x.note||'—')}</div></td>
      <td><div class="ysr-actions">
        ${x.status==='pending'||x.status==='revision_requested'?`<button class="primary" data-a="proposal" data-id="${x.id}">PREDLOŽI TERMIN + RAMPU</button>`:''}
        ${x.status==='proposal_sent'?`<button data-a="proposal" data-id="${x.id}">IZMIJENI PRIJEDLOG</button>`:''}
        ${editable?`<button data-a="transport" data-id="${x.id}">TRANSPORT</button>`:''}
        ${x.status==='pending'?`<button class="warn" data-a="revision" data-id="${x.id}">VRATI NA DORADU</button>`:''}
        ${!['completed','rejected'].includes(x.status)?`<button class="danger" data-a="reject" data-id="${x.id}">ODBIJ</button>`:''}
      </div></td>
    </tr>`;
  }).join('');
}
async function update(id,patch){
  await window.YardivoSupplierLiveSync.call('internal_update',{id,...patch});
  // Always re-read the server record. If it was approved, pullInternal mirrors the SAME
  // supplier delivery into the canonical YARDIVO announcements used by Daily/Weekly/Reception.
  await load();
  try{await window.YardivoSupplierLiveSync.pullInternal()}catch(_){}
  try{if(typeof render==='function')render()}catch(_){}
  try{window.dispatchEvent(new CustomEvent('yardivo:supplier-request-updated',{detail:{id,patch}}))}catch(_){}
}
async function handleAction(e){
  const b=e.target.closest('button[data-a]');if(!b)return;
  const x=cache.find(r=>String(r.id)===String(b.dataset.id));if(!x)return;
  try{
    if(b.dataset.a==='proposal'){
      const date=prompt('Datum dostave (YYYY-MM-DD):',x.delivery_date||'');if(date===null)return;
      const time=prompt('Predloženi termin (HH:MM):',String(x.requested_time||'').slice(0,5)||'08:00');if(time===null)return;
      const dock=prompt('Rampa (npr. R07):',String(x.dock||''));if(dock===null)return;
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time)||!dock.trim()){alert('Datum, termin i rampa su obavezni.');return}
      await update(x.id,{delivery_date:date,requested_time:time,dock:dock.trim().toUpperCase(),status:'proposal_sent',review_note:'YARDIVO je predložio termin i rampu. Dobavljač treba potvrditi ili zatražiti drugi termin.'});
    }
    if(b.dataset.a==='revision'){
      const note=prompt('Što dobavljač treba ispraviti?','');if(note===null)return;
      if(!note.trim()){alert('Upiši razlog vraćanja na doradu.');return}
      await update(x.id,{status:'revision_requested',review_note:note.trim()});
    }
    if(b.dataset.a==='reject'){
      const note=prompt('Razlog odbijanja:','');if(note===null)return;
      if(!confirm('Potvrditi odbijanje ove najave?'))return;
      await update(x.id,{status:'rejected',review_note:note.trim()});
    }
    if(b.dataset.a==='transport'){
      const truck=prompt('Tablice kamiona (opcionalno):',x.vehicle_plate||'');if(truck===null)return;
      const trailer=prompt('Tablice prikolice (opcionalno):',x.trailer_plate||'');if(trailer===null)return;
      const driver=prompt('Vozač (opcionalno):',x.driver_name||'');if(driver===null)return;
      const contact=prompt('Kontakt vozača (opcionalno):',x.driver_contact||'');if(contact===null)return;
      await update(x.id,{vehicle_plate:truck,trailer_plate:trailer,driver_name:driver,driver_contact:contact});
    }
  }catch(err){alert('Akcija nije uspjela:\n'+(err?.message||err))}
}

function exposeRoleAccess(){
  try{
    const prev=window.allowedViewsForRole;
    if(typeof prev==='function'&&!prev.__supplier570){
      const wrapped=function(role){
        const arr=prev(role)||[];
        if(['admin','manager','management','inventory'].includes(String(role||'').toLowerCase())&&!arr.includes('supplierRequests'))arr.push('supplierRequests');
        return arr;
      };
      wrapped.__supplier570=true;
      window.allowedViewsForRole=wrapped;
    }
  }catch(_){}
}

window.YardivoSupplierRequests={ensureUi,load,render,applyAccess};
window.addEventListener('load',()=>{setTimeout(()=>{ensureUi();exposeRoleAccess();applyAccess();if(canReview())load()},1300)});
window.addEventListener('yardivo:login',()=>{setTimeout(()=>{ensureUi();exposeRoleAccess();applyAccess();if(canReview())load()},700)});
window.addEventListener('yardivo:data-synced',()=>{if(canReview())setTimeout(render,150)});
})();
