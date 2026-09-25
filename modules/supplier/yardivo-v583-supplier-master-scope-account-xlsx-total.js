
(()=>{'use strict';
if(window.__YV_SUPPLIER_MASTER_SCOPE_ACCOUNT_XLSX_TOTAL__)return;window.__YV_SUPPLIER_MASTER_SCOPE_ACCOUNT_XLSX_TOTAL__=true;
const KEY='yardivo_master_data_registry_v583',$=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
function md(){try{const d=JSON.parse(localStorage.getItem(KEY)||'{}');d.suppliers=Array.isArray(d.suppliers)?d.suppliers:[];d.locations=Array.isArray(d.locations)?d.locations:[];d.warehouses=Array.isArray(d.warehouses)?d.warehouses:[];return d}catch(_){return{suppliers:[],locations:[],warehouses:[]}}}
function nextId(a){let n=0;(a||[]).forEach(x=>{const m=String(x?.id||'').match(/^SUP(\d+)$/);if(m)n=Math.max(n,+m[1]||0)});return 'SUP'+String(n+1).padStart(3,'0')}
async function persist(d,reason){d.__masterUpdatedAtV583=new Date().toISOString();d.__masterWriteTokenV583='SUPSCOPE-'+Date.now();localStorage.setItem(KEY,JSON.stringify(d));await Promise.resolve(window.YardivoMasterDataV583?.save?.(JSON.parse(JSON.stringify(d))));try{await window.YardivoSupabase?.flushQueue?.()}catch(_){}window.dispatchEvent(new CustomEvent('yardivo:master-data-changed',{detail:{source:'supplier-master-scope',reason}}));}
function installSupplierModal(){const m=$('yardivoSupplierMasterModalV583');if(!m)return;const body=m.querySelector('.ysmp-body');if(!body||body.dataset.scopeReady)return;body.dataset.scopeReady='1';body.innerHTML=`<div class="ysmp-scope-grid"><label>ŠIFRA DOBAVLJAČA *<input id="ysmpCode" maxlength="60" autocomplete="off"></label><label>NAZIV DOBAVLJAČA *<input id="ysmpName" maxlength="120" autocomplete="off"></label><label>KONTAKT BROJ<input id="ysmpPhone" maxlength="60" autocomplete="off"></label><label>EMAIL<input id="ysmpEmail" type="email" maxlength="160" autocomplete="off"></label><label class="ysmp-wide">KONTAKT OSOBA · OPCIONALNO<input id="ysmpContact" maxlength="120" autocomplete="off"></label><div class="ysmp-wide"><label style="display:flex;flex-direction:row;gap:8px;align-items:center"><input id="ysmpAllLocations" type="checkbox" style="width:auto"> SVE LOKACIJE</label><div id="ysmpLocations" class="ysmp-checks"></div></div><div class="ysmp-wide"><label style="display:flex;flex-direction:row;gap:8px;align-items:center"><input id="ysmpAllWarehouses" type="checkbox" style="width:auto"> SVA SKLADIŠTA</label><div id="ysmpWarehouses" class="ysmp-checks"></div></div></div><div id="ysmpError" class="ysmp-error" aria-live="polite"></div>`;
 const old=m.querySelector('.ysmp-save');if(old){const b=old.cloneNode(true);old.replaceWith(b);b.addEventListener('click',saveSupplier)}
 function renderScope(){
  const d=md(),allL=$('ysmpAllLocations').checked,allW=$('ysmpAllWarehouses').checked;
  const activeLocs=d.locations.filter(x=>x&&x.active!==false),activeWh=d.warehouses.filter(x=>x&&x.active!==false);
  const prevLoc=new Set([...m.querySelectorAll('[name="ysmpLoc"]:checked')].map(x=>String(x.value)));
  const prevWh=new Set([...m.querySelectorAll('[name="ysmpWh"]:checked')].map(x=>String(x.value)));
  $('ysmpLocations').innerHTML=activeLocs.map(x=>`<label><input name="ysmpLoc" type="checkbox" value="${esc(x.id)}" ${(allL||prevLoc.has(String(x.id)))?'checked ':''}${allL?'disabled':''}> ${esc(x.name)}</label>`).join('')||'<span>Nema aktivnih lokacija.</span>';
  const chosenLoc=allL?new Set(activeLocs.map(x=>String(x.id))):new Set([...m.querySelectorAll('[name="ysmpLoc"]:checked')].map(x=>String(x.value)));
  const visibleWh=activeWh.filter(w=>chosenLoc.has(String(w.location_id)));
  $('ysmpWarehouses').innerHTML=visibleWh.map(w=>`<label><input name="ysmpWh" type="checkbox" value="${esc(w.id)}" ${(allW||prevWh.has(String(w.id)))?'checked ':''}${allW?'disabled':''}> ${esc(w.name)}</label>`).join('')||(chosenLoc.size?'<span>Nema aktivnih skladišta za odabrane lokacije.</span>':'<span>Odaberi lokaciju.</span>');
 }
 $('ysmpAllLocations').addEventListener('change',()=>{if($('ysmpAllLocations').checked){$('ysmpAllWarehouses').checked=false}renderScope()});
 $('ysmpAllWarehouses').addEventListener('change',renderScope);
 $('ysmpLocations').addEventListener('change',e=>{if(e.target?.matches?.('[name="ysmpLoc"]'))renderScope()});
 renderScope();
 async function saveSupplier(){const d=md(),code=$('ysmpCode').value.trim(),name=$('ysmpName').value.trim(),email=$('ysmpEmail').value.trim().toLowerCase(),err=$('ysmpError'),all_locations=$('ysmpAllLocations').checked,all_warehouses=$('ysmpAllWarehouses').checked,locations=all_locations?[]:[...m.querySelectorAll('[name="ysmpLoc"]:checked')].map(x=>x.value),warehouses=all_warehouses?[]:[...m.querySelectorAll('[name="ysmpWh"]:checked')].map(x=>x.value);err.textContent='';if(!code||!name)return err.textContent='Šifra i naziv su obavezni.';if(email&&!/^\S+@\S+\.\S+$/.test(email))return err.textContent='Email nije ispravan.';if(!all_locations&&!locations.length)return err.textContent='Odaberi barem jednu lokaciju ili SVE LOKACIJE.';if(!all_warehouses&&!warehouses.length)return err.textContent='Odaberi barem jedno skladište ili SVA SKLADIŠTA.';if(d.suppliers.some(x=>String(x.supplier_code||x.code||'').trim().toLowerCase()===code.toLowerCase()))return err.textContent='Ta šifra dobavljača već postoji.';d.suppliers.push({id:nextId(d.suppliers),supplier_code:code,name,locations,warehouses,all_locations,all_warehouses,contact_phone:$('ysmpPhone').value.trim(),contact_email:email,contact_name:$('ysmpContact').value.trim(),active:true});try{await persist(d,'supplier.add.full');m.classList.remove('open');patchList()}catch(e){err.textContent='Spremanje nije uspjelo: '+String(e?.message||e)}}
 }
function resetSupplierModal(){const m=$('yardivoSupplierMasterModalV583');if(!m)return;['ysmpCode','ysmpName','ysmpPhone','ysmpEmail','ysmpContact'].forEach(id=>{if($(id))$(id).value=''});if($('ysmpAllLocations'))$('ysmpAllLocations').checked=false;if($('ysmpAllWarehouses'))$('ysmpAllWarehouses').checked=false;const d=md();if($('ysmpLocations'))$('ysmpLocations').innerHTML=d.locations.filter(x=>x.active!==false).map(x=>`<label><input name="ysmpLoc" type="checkbox" value="${esc(x.id)}"> ${esc(x.name)}</label>`).join('');if($('ysmpWarehouses'))$('ysmpWarehouses').innerHTML='<span>Odaberi lokaciju.</span>';if($('ysmpError'))$('ysmpError').textContent=''}
function patchList(){const card=$('yardivoMasterSuppliersV583');if(!card)return;const d=md();card.querySelectorAll('[data-spec-sup-name]').forEach(inp=>{const x=d.suppliers.find(v=>String(v.id)===String(inp.dataset.specSupName));if(!x)return;let z=inp.parentElement.querySelector('.yv-supplier-meta');if(!z){z=document.createElement('div');z.className='yv-supplier-meta';inp.insertAdjacentElement('afterend',z)}const ln=x.all_locations?'SVE LOKACIJE':(x.locations||[]).map(id=>d.locations.find(l=>String(l.id)===String(id))?.name).filter(Boolean).join(', ');const wn=x.all_warehouses?'SVA SKLADIŠTA':(x.warehouses||[]).map(id=>d.warehouses.find(w=>String(w.id)===String(id))?.name).filter(Boolean).join(', ');z.textContent=`${x.supplier_code||'—'} · ${ln||'—'} · ${wn||'—'}${x.contact_email?' · '+x.contact_email:''}`})}
function installImport(){const im=$('yardivoSupplierImportModalV583');if(!im||im.dataset.fullReady)return;im.dataset.fullReady='1';const note=im.querySelector('.ysi-note');if(note)note.innerHTML='<b>YARDIVO šablona:</b> supplier_code | name | locations | warehouses | all_locations | all_warehouses | active<br><br>Odaberi XLSX. YARDIVO će prvo prikazati koliko je dobavljača pronađeno. Tek nakon potvrde kreira točno toliko dobavljača u Master Data.';const drop=im.querySelector('.ysi-drop strong');if(drop)drop.textContent='IMPORT XLSX · DOBAVLJAČI';const old=$('ysiFileV583');if(!old)return;const file=old.cloneNode(true);old.replaceWith(file);const pick=im.querySelector('.ysi-pick');if(pick){const np=pick.cloneNode(true);pick.replaceWith(np);np.textContent='ODABERI XLSX';np.addEventListener('click',()=>file.click())}let commit=im.querySelector('#ysiCommitImportV583');if(!commit){commit=document.createElement('button');commit.type='button';commit.id='ysiCommitImportV583';commit.className='ysi-pick';commit.style.display='none';im.querySelector('.ysi-actions')?.appendChild(commit)}commit.addEventListener('click',()=>commitSupplierImport(im));file.addEventListener('change',()=>importFull(file.files?.[0],im));}
async function importFull(f,im){
 const st=$('ysiStatusV583');if(!f||!window.XLSX)return;
 try{
  st.textContent='Čitam i validiram cijelu XLSX datoteku…';st.className='ysi-status';
  const wb=XLSX.read(await f.arrayBuffer(),{type:'array'});
  const sheetName=wb.SheetNames.includes('Dobavljaci_Import')?'Dobavljaci_Import':wb.SheetNames[0];
  const ws=wb.Sheets[sheetName];
  if(!ws)throw new Error('XLSX nema radni list za import.');
  const rows=XLSX.utils.sheet_to_json(ws,{defval:'',raw:false});
  if(!rows.length)throw new Error('Datoteka nema dobavljača za import.');

  const d=md(),norm=v=>String(v??'').trim().toLowerCase().replace(/\s+/g,' '),keyNorm=v=>norm(v).replace(/[\s\-]+/g,'_');
  const yes=v=>/^(da|yes|true|1|sve|all)$/i.test(String(v??'').trim());
  const no=v=>/^(ne|no|false|0|)$/i.test(String(v??'').trim());
  const split=v=>String(v??'').split(';').map(x=>x.trim()).filter(Boolean);
  const get=(r,key,aliases=[])=>{
    for(const [k,v] of Object.entries(r)){
      const nk=keyNorm(k);
      if(nk===key||aliases.includes(nk))return String(v??'').trim();
    }
    return '';
  };

  const activeLocs=(d.locations||[]).filter(x=>x&&x.active!==false);
  const activeWhs=(d.warehouses||[]).filter(x=>x&&x.active!==false);
  if(!activeLocs.length)throw new Error('Master Data nema aktivnih lokacija. Prvo izradi lokacije.');
  if(!activeWhs.length)throw new Error('Master Data nema aktivnih skladišta. Prvo izradi skladišta.');

  const locBy=new Map();
  activeLocs.forEach(x=>{locBy.set(norm(x.id),x);locBy.set(norm(x.name),x)});
  const whBy=new Map();
  activeWhs.forEach(x=>{whBy.set(norm(x.id),x);whBy.set(norm(x.name),x)});

  const existing=new Set((d.suppliers||[]).map(x=>norm(x.supplier_code||x.code)));
  const seen=new Set(),parsed=[],errors=[];

  for(const [i,r] of rows.entries()){
    const rowNo=i+2;
    const code=get(r,'supplier_code',['sifra_dobavljaca','šifra_dobavljača','code','suppliercode']);
    const name=get(r,'name',['naziv','naziv_dobavljaca','naziv_dobavljača']);
    const lv=get(r,'locations',['lokacije','location']);
    const wv=get(r,'warehouses',['skladista','skladišta','warehouse']);
    const alRaw=get(r,'all_locations',['sve_lokacije']);
    const awRaw=get(r,'all_warehouses',['sva_skladista','sva_skladišta']);
    const activeRaw=get(r,'active',['aktivan']);
    const phone=get(r,'contact_phone',['kontakt_broj','telefon','phone']);
    const email=get(r,'contact_email',['email','e_mail']);
    const contact=get(r,'contact_name',['kontakt_osoba','contact_person']);

    if(!code&&!name&&!lv&&!wv&&!alRaw&&!awRaw)continue;
    const rowErr=[];
    if(!code)rowErr.push('nedostaje supplier_code');
    if(!name)rowErr.push('nedostaje name');

    const ckey=norm(code);
    if(code&&(existing.has(ckey)||seen.has(ckey)))rowErr.push(`duplikat šifre ${code}`);

    if(alRaw&&!yes(alRaw)&&!no(alRaw))rowErr.push('all_locations mora biti DA ili NE');
    if(awRaw&&!yes(awRaw)&&!no(awRaw))rowErr.push('all_warehouses mora biti DA ili NE');
    if(activeRaw&&!yes(activeRaw)&&!no(activeRaw))rowErr.push('active mora biti DA ili NE');

    const all_locations=yes(alRaw);
    const all_warehouses=yes(awRaw);
    const active=activeRaw===''?true:yes(activeRaw);

    const locTokens=split(lv);
    const whTokens=split(wv);
    const locRows=locTokens.map(x=>locBy.get(norm(x)));
    const whRows=whTokens.map(x=>whBy.get(norm(x)));

    if(!all_locations){
      if(!locTokens.length)rowErr.push('locations je obavezan kada all_locations=NE');
      const bad=locTokens.filter((x,idx)=>!locRows[idx]);
      if(bad.length)rowErr.push('nepoznata lokacija: '+bad.join(', '));
    }
    if(!all_warehouses){
      if(!whTokens.length)rowErr.push('warehouses je obavezan kada all_warehouses=NE');
      const bad=whTokens.filter((x,idx)=>!whRows[idx]);
      if(bad.length)rowErr.push('nepoznato skladište: '+bad.join(', '));
    }

    const locations=all_locations?[]:locRows.filter(Boolean).map(x=>String(x.id));
    const warehouses=all_warehouses?[]:whRows.filter(Boolean).map(x=>String(x.id));

    if(!all_locations&&!all_warehouses&&locations.length&&warehouses.length){
      const wrong=whRows.filter(Boolean).filter(w=>!locations.includes(String(w.location_id)));
      if(wrong.length)rowErr.push('skladište nije u odabranoj lokaciji: '+wrong.map(w=>w.name||w.id).join(', '));
    }
    if(email&&!/^\S+@\S+\.\S+$/.test(email))rowErr.push('email nije ispravan');

    if(rowErr.length){errors.push(`Red ${rowNo}: ${rowErr.join('; ')}`);continue}
    seen.add(ckey);
    parsed.push({
      supplier_code:code,code,name,
      locations,warehouses,all_locations,all_warehouses,
      contact_phone:phone,contact_email:email.toLowerCase(),contact_name:contact,
      active
    });
  }

  if(errors.length)throw new Error(`Import zaustavljen. Ispravi XLSX:\n${errors.slice(0,12).join('\n')}${errors.length>12?`\n… i još ${errors.length-12} grešaka.`:''}`);
  if(!parsed.length)throw new Error('Nema ispravnih dobavljača za import.');

  window.__YARDIVO_SUPPLIER_IMPORT_PENDING_V583__={parsed,fileName:String(f.name||'XLSX')};
  st.textContent=`XLSX JE ISPRAVAN · Pronađeno dobavljača: ${parsed.length}. Klikni “IMPORTAJ ${parsed.length} DOBAVLJAČA” za upis u Master Data.`;
  st.className='ysi-status ok';
  const commit=im.querySelector('#ysiCommitImportV583');
  if(commit){commit.style.display='inline-flex';commit.textContent=`IMPORTAJ ${parsed.length} DOBAVLJAČA`}
  const pick=im.querySelector('.ysi-pick:not(#ysiCommitImportV583)');
  if(pick)pick.textContent='ODABERI DRUGI XLSX';
 }catch(e){
  console.error(e);
  st.textContent=String(e?.message||e);
  st.className='ysi-status err';
 }
}

async function commitSupplierImport(im){
 const st=$('ysiStatusV583'),pending=window.__YARDIVO_SUPPLIER_IMPORT_PENDING_V583__;
 if(!pending?.parsed?.length){if(st){st.textContent='Prvo odaberi i validiraj XLSX datoteku.';st.className='ysi-status err'}return}
 const commit=im.querySelector('#ysiCommitImportV583');
 try{
  if(commit){commit.disabled=true;commit.textContent='IMPORT U TIJEKU…'}
  const d=md();
  const norm=v=>String(v??'').trim().toLowerCase();
  const existing=new Set((d.suppliers||[]).map(x=>norm(x.supplier_code||x.code)));
  const conflict=pending.parsed.find(x=>existing.has(norm(x.supplier_code||x.code)));
  if(conflict)throw new Error('Dobavljač sa šifrom '+String(conflict.supplier_code||conflict.code)+' je u međuvremenu već kreiran. Ponovno odaberi XLSX.');
  let n=0;(d.suppliers||[]).forEach(x=>{const m=String(x.id||'').match(/^SUP(\d+)$/);if(m)n=Math.max(n,+m[1]||0)});
  pending.parsed.forEach(x=>{const row={...x,id:'SUP'+String(++n).padStart(3,'0')};d.suppliers.push(row)});
  await persist(d,'supplier.xlsx.confirmed-v2');
  const count=pending.parsed.length;
  window.__YARDIVO_SUPPLIER_IMPORT_PENDING_V583__=null;
  st.textContent=`USPJEŠNO · Kreirano ${count} dobavljača u Master Data.`;
  st.className='ysi-status ok';
  patchList();
  try{window.YardivoStableMasterV583?.render?.(true)}catch(_){}
  if(commit){commit.style.display='none';commit.disabled=false}
  setTimeout(()=>im.classList.remove('open'),1200);
 }catch(e){
  console.error(e);if(st){st.textContent=String(e?.message||e);st.className='ysi-status err'}
  if(commit){commit.disabled=false;commit.textContent='PONOVI IMPORT'}
 }
}

function supplierAccountUI(){const sel=$('yufSupplierSelect');if(!sel)return;let d=md();sel.innerHTML='<option value="">— ODABERI DOBAVLJAČA —</option>'+d.suppliers.filter(x=>x.active!==false).sort((a,b)=>String(a.name).localeCompare(String(b.name),'hr')).map(x=>`<option value="${esc(x.id)}">${esc(x.supplier_code||'')} · ${esc(x.name)}</option>`).join('');const sf=$('yufSupplierContactFields'),scope=$('yufScopeSection'),name=$('yufName');if(sf)sf.style.display='none';if(scope)scope.style.display='none';if(name?.closest('label'))name.closest('label').style.display='none';const title=$('yufBasicStepTitle');if(title)title.textContent='2 · USERNAME I LOZINKA';sel.onchange=()=>{d=md();const x=d.suppliers.find(v=>String(v.id)===String(sel.value));if(!x)return;name.value=x.name||'';$('yufContactName').value=x.contact_name||'N/A';$('yufContactEmail').value=x.contact_email||'supplier@yardivo.local';$('yufContactPhone').value=x.contact_phone||'';const loc=$('yufLocation');if(loc){loc.innerHTML='<option value="ALL">SVE LOKACIJE</option>';loc.value='ALL'}const aw=$('yufAllWarehouses');if(aw)aw.checked=true;};}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-yucr-role="supplier"]'))setTimeout(supplierAccountUI,0)},true);
['yardivo:master-data-changed','yardivo:master-data-ready','yardivo:data-synced'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{patchList();installSupplierModal();installImport()},0)));
setTimeout(()=>{installSupplierModal();installImport();patchList()},0);window.YARDIVO_DEV_BUILD='20260916-dev-v5.8.3-light-white-dark-blue-sidebar-css-audit-final';
})();
