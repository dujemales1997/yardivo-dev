
(function(){
'use strict';
const ALLOWED=new Set(['admin','manager','inventory','reception']);
let archiveRows=[];
let currentAnnouncement=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function role(){
 let r='';try{const x=(typeof currentSession!=='undefined'&&currentSession)||window.currentSession||{};r=String(x.app_role||x.role||document.body?.dataset?.yardivoRole||'').trim().toLowerCase()}catch(_){}
 if(r==='management'||r==='voditelj')r='manager';if(r==='zalihe'||r==='upravljanje zalihama'||r.includes('zalih'))r='inventory';if(r==='prijam')r='reception';return r;
}
function allowed(){return ALLOWED.has(role())}
function sessionWarehouseIds(){try{const x=(typeof currentSession!=='undefined'&&currentSession)||window.currentSession||{};return Array.isArray(x.warehouses)?x.warehouses.map(String):[]}catch(_){return[]}}
function ensureView(){
 if(document.getElementById('documentArchive'))return;
 const main=document.querySelector('.main');if(!main)return;
 const sec=document.createElement('section');sec.id='documentArchive';sec.className='view';sec.innerHTML=`
  <div class="section-title"><div><h1>ARHIVA DOKUMENATA</h1><p>PDF dokumenti spremljeni iz potvrđenih Supplier najava</p></div><div class="yda-top-actions"><button type="button" class="secondary" data-yda-refresh>OSVJEŽI</button><button type="button" class="danger" data-yda-delete-all>OBRIŠI SVE U ARHIVI</button></div></div>
  <section class="panel"><div class="panel-head"><div><h2>DOKUMENTI</h2><small id="ydaCount">0 dokumenata</small></div></div>
   <div class="yda-toolbar"><input id="ydaSearch" type="search" placeholder="Dobavljač ili dokument..."><input id="ydaDate" type="date"><select id="ydaWarehouse"><option value="">Sva skladišta</option></select><button type="button" class="secondary" data-yda-reset>RESET</button></div>
   <div id="ydaList" class="yda-list"><div class="yda-empty">Arhiva nije učitana.</div></div>
  </section>`;
 main.appendChild(sec);
 const wh=sec.querySelector('#ydaWarehouse');
 const ids=sessionWarehouseIds();
 let md={warehouses:[]};try{md=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')}catch(_){}
 const all=(md.warehouses||[]).filter(w=>w&&w.active!==false&&(role()==='admin'||!ids.length||ids.includes(String(w.id))));
 all.forEach(w=>wh.add(new Option(String(w.name||w.id),String(w.id))));
 ['ydaSearch','ydaDate','ydaWarehouse'].forEach(id=>sec.querySelector('#'+id)?.addEventListener('input',render));
 sec.querySelector('[data-yda-reset]')?.addEventListener('click',()=>{sec.querySelector('#ydaSearch').value='';sec.querySelector('#ydaDate').value='';sec.querySelector('#ydaWarehouse').value='';render()});
 sec.querySelector('[data-yda-refresh]')?.addEventListener('click',()=>load(true));
}
function stampRole(){const r=role();if(r)document.body.dataset.yardivoRole=r;const b=document.querySelector('.nav-btn[data-view="documentArchive"]');if(b){const show=ALLOWED.has(r);b.hidden=!show;b.classList.toggle('role-hidden',!show);if(show){b.style.removeProperty('display');b.style.removeProperty('visibility');b.removeAttribute('aria-disabled')}}}
function fmtDate(v){if(!v)return'—';try{return new Date(String(v).length===10?v+'T12:00:00':v).toLocaleString('hr-HR',String(v).length===10?{day:'2-digit',month:'2-digit',year:'numeric'}:{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}catch(_){return String(v)}}
async function load(force){
 if(!allowed()||!window.YardivoSupplierLiveSync?.call)return;
 ensureView();const host=document.getElementById('ydaList');if(host&&force)host.innerHTML='<div class="yda-empty">Učitavam arhivu...</div>';
 try{archiveRows=await window.YardivoSupplierLiveSync.call('list_archive',{});if(!Array.isArray(archiveRows))archiveRows=[];render()}catch(e){if(host)host.innerHTML='<div class="yda-empty">Arhivu nije moguće učitati: '+esc(e?.message||e)+'</div>'}
}
function render(){
 const host=document.getElementById('ydaList');if(!host)return;
 const q=String(document.getElementById('ydaSearch')?.value||'').trim().toLowerCase(),d=document.getElementById('ydaDate')?.value||'',w=document.getElementById('ydaWarehouse')?.value||'';
 const rows=archiveRows.filter(x=>(!q||String(x.supplier_name||'').toLowerCase().includes(q)||String(x.document_name||'').toLowerCase().includes(q))&&(!d||String(x.delivery_date||'')===d)&&(!w||String(x.warehouse||'')===w));
 const count=document.getElementById('ydaCount');if(count)count.textContent=rows.length+' '+(rows.length===1?'dokument':'dokumenata');
 host.innerHTML=rows.length?rows.map(x=>`<article class="yda-row" data-yda-id="${esc(x.id)}"><div class="yda-doc"><span class="yda-folder">📁</span><div><strong>${esc(x.document_name||'dokument.pdf')}</strong><small>${esc(x.supplier_name||'Dobavljač')}</small></div></div><div class="yda-cell"><small>ISPORUKA</small><strong>${esc(fmtDate(x.delivery_date))} · ${esc(String(x.appointment_time||'').slice(0,5)||'—')}</strong></div><div class="yda-cell"><small>SKLADIŠTE / RAMPA</small><strong>${esc((typeof warehouseOptionLabel==='function'?warehouseOptionLabel(x.warehouse):x.warehouse)||x.warehouse||'—')} · ${esc(x.dock||'—')}</strong></div><div class="yda-cell"><small>ARHIVIRAO</small><strong>${esc(x.archived_by_username||'—')}</strong><small>${esc(fmtDate(x.archived_at))}</small></div><div class="yda-actions"><button type="button" class="secondary" data-yda-open="${esc(x.id)}">OTVORI</button><button type="button" class="secondary" data-yda-download="${esc(x.id)}">PREUZMI</button><button type="button" class="danger" data-yda-delete="${esc(x.id)}">OBRIŠI</button></div></article>`).join(''):'<div class="yda-empty">Nema dokumenata za odabrane filtre.</div>';
}
async function fetchDoc(id){const x=await window.YardivoSupplierLiveSync.call('get_archive_document',{id});if(!x?.document_base64)throw new Error('PDF nije dostupan.');return {name:x.document_name||'dokument.pdf',size:Math.floor(String(x.document_base64).length*3/4),uploadedAt:x.archived_at||x.created_at||'',dataUrl:'data:'+(x.document_mime||'application/pdf')+';base64,'+x.document_base64}}
async function openArchived(id,download){try{const doc=await fetchDoc(id);currentAnnouncement=null;window.__yardivoCurrentDocAnnouncementV583=null;if(download)window.YardivoSupplierAttachments?.download?.(doc);else window.YardivoSupplierAttachments?.open?.({attachmentDataUrl:doc.dataUrl,attachmentName:doc.name,attachmentSize:doc.size,attachmentUploadedAt:doc.uploadedAt});requestAnimationFrame(updateArchiveButton)}catch(e){alert('Dokument nije moguće otvoriti:\n'+(e?.message||e))}}
async function deleteArchived(id){
 const row=archiveRows.find(x=>String(x.id)===String(id));
 const name=row?.document_name||'ovaj PDF';
 if(!confirm('Obrisati \"'+name+'\" iz Arhive dokumenata?\n\nOva radnja briše arhiviranu kopiju dokumenta. Originalni PDF na Supplier najavi ostaje sačuvan.'))return;
 try{
   await window.YardivoSupplierLiveSync.call('delete_archive_document',{id});
   archiveRows=archiveRows.filter(x=>String(x.id)!==String(id));render();
   try{showYmsToast?.('success','ARHIVA DOKUMENATA','Dokument je obrisan iz arhive.',2400)}catch(_){}
 }catch(e){alert('Brisanje dokumenta nije uspjelo:\n'+(e?.message||e))}
}
async function deleteAllArchived(){
 if(!archiveRows.length){alert('Arhiva je već prazna.');return}
 if(!confirm('Obrisati SVE dokumente iz Arhive dokumenata dostupne ovom korisniku?\n\nOriginalni PDF dokumenti na Supplier najavama ostaju sačuvani.'))return;
 if(!confirm('Potvrdi još jednom: obrisati sve arhivirane PDF dokumente?'))return;
 const btn=document.querySelector('[data-yda-delete-all]');
 if(btn){btn.disabled=true;btn.textContent='BRIŠEM...'}
 try{
   const res=await window.YardivoSupplierLiveSync.call('delete_archive_all',{});
   await load(true);
   const n=Number(res?.deleted||0);
   try{showYmsToast?.('success','ARHIVA DOKUMENATA','Obrisano iz arhive: '+n,2600)}catch(_){}
 }catch(e){alert('Brisanje cijele arhive nije uspjelo:\n'+(e?.message||e))}
 finally{if(btn){btn.disabled=false;btn.textContent='OBRIŠI SVE U ARHIVI'}}
}
function ensureArchiveButton(){
 const viewer=document.getElementById('yardivoDocumentViewerV583');if(!viewer)return null;
 const actions=viewer.querySelector('.ydv-actions');if(!actions)return null;
 let b=actions.querySelector('[data-ydv-archive]');if(!b){b=document.createElement('button');b.type='button';b.className='secondary';b.dataset.ydvArchive='1';b.textContent='SPREMI U ARHIVU';actions.appendChild(b)}return b;
}
function updateArchiveButton(){const b=ensureArchiveButton();if(!b)return;const ok=allowed()&&currentAnnouncement?.supplierDeliveryId;b.style.display=ok?'':'none';b.disabled=!ok}
async function archiveCurrent(){
 if(!allowed()||!currentAnnouncement?.supplierDeliveryId)return;
 const b=ensureArchiveButton();if(b){b.disabled=true;b.textContent='SPREMAM...'}
 try{await window.YardivoSupplierLiveSync.call('archive_document',{id:currentAnnouncement.supplierDeliveryId});if(b)b.textContent='SPREMLJENO U ARHIVU';try{showYmsToast?.('success','ARHIVA DOKUMENATA','PDF je spremljen u arhivu.',2800)}catch(_){alert('PDF je spremljen u arhivu.')}if(document.getElementById('documentArchive')?.classList.contains('active'))await load(true)}catch(e){alert('Spremanje u arhivu nije uspjelo:\n'+(e?.message||e));if(b)b.textContent='SPREMI U ARHIVU'}finally{if(b)b.disabled=false}
}
document.addEventListener('click',e=>{
 const docBtn=e.target.closest?.('[data-yardivo-doc]');if(docBtn){try{currentAnnouncement=(Array.isArray(announcements)?announcements:[]).find(x=>String(x.id)===String(docBtn.dataset.yardivoDoc))||null;window.__yardivoCurrentDocAnnouncementV583=currentAnnouncement}catch(_){currentAnnouncement=null}requestAnimationFrame(updateArchiveButton);return}
 if(e.target.closest?.('[data-ydv-archive]')){e.preventDefault();e.stopPropagation();archiveCurrent();return}
 const o=e.target.closest?.('[data-yda-open]');if(o){e.preventDefault();e.stopPropagation();openArchived(o.dataset.ydaOpen,false);return}
 const d=e.target.closest?.('[data-yda-download]');if(d){e.preventDefault();e.stopPropagation();openArchived(d.dataset.ydaDownload,true);return}
 const del=e.target.closest?.('[data-yda-delete]');if(del){e.preventDefault();e.stopPropagation();deleteArchived(del.dataset.ydaDelete);return}
 const delAll=e.target.closest?.('[data-yda-delete-all]');if(delAll){e.preventDefault();e.stopPropagation();deleteAllArchived();return}
 const nav=e.target.closest?.('[data-view="documentArchive"]');if(nav){setTimeout(()=>load(true),30)}
},true);
window.addEventListener('yardivo:login',()=>{stampRole();ensureView();setTimeout(()=>{if(document.getElementById('documentArchive')?.classList.contains('active'))load(true)},200)});
window.addEventListener('yardivo:view-opened',e=>{if(e?.detail?.view==='documentArchive')load(true)});
window.addEventListener('load',()=>{stampRole();ensureView();updateArchiveButton()});
const mo=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType===1&&(n.id==='yardivoDocumentViewerV583'||n.querySelector?.('#yardivoDocumentViewerV583')))requestAnimationFrame(updateArchiveButton)}});if(document.body)mo.observe(document.body,{childList:true,subtree:true});
window.YardivoDocumentArchiveV583={load,render,archiveCurrent,deleteArchived,deleteAllArchived};
})();
