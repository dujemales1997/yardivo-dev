
(()=>{'use strict';
const $=id=>document.getElementById(id);
const MASTER='yardivo_master_data_registry_v583';
function md(){try{const d=JSON.parse(localStorage.getItem(MASTER)||'{}');d.locations=Array.isArray(d.locations)?d.locations:[];d.warehouses=Array.isArray(d.warehouses)?d.warehouses:[];d.suppliers=Array.isArray(d.suppliers)?d.suppliers:[];d.responsible_people=Array.isArray(d.responsible_people)?d.responsible_people:[];return d}catch(_){return{locations:[],warehouses:[],suppliers:[],responsible_people:[]}}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function persist(d,reason){
 localStorage.setItem(MASTER,JSON.stringify(d));
 try{await Promise.resolve(window.YardivoMasterDataV583?.save?.(d))}catch(e){console.error(e);throw e}
 try{window.dispatchEvent(new CustomEvent('yardivo:master-data-changed',{detail:{reason}}))}catch(_){}
}
function nextRpId(a){let n=0;(a||[]).forEach(x=>{const m=String(x.id||'').match(/^RP(\d+)$/);if(m)n=Math.max(n,+m[1])});return 'RP'+String(n+1).padStart(3,'0')}

/* OD and DO use the exact same 24-hour dropdown control. */
function timeControl(value){
 const [h='00',m='00']=String(value||'00:00').split(':');
 const hs=Array.from({length:24},(_,i)=>String(i).padStart(2,'0'));
 const ms=Array.from({length:60},(_,i)=>String(i).padStart(2,'0'));
 return `<span class="yv-time24"><select data-yv-hour>${hs.map(x=>`<option ${x===h?'selected':''}>${x}</option>`).join('')}</select><b>:</b><select data-yv-minute>${ms.map(x=>`<option ${x===m?'selected':''}>${x}</option>`).join('')}</select></span>`;
}
function upgradeTimeInput(inp){
 if(!inp||inp.dataset.yvTimeUpgraded)return;
 const wrap=document.createElement('span');wrap.innerHTML=timeControl(inp.value||'00:00');
 const ui=wrap.firstElementChild;inp.dataset.yvTimeUpgraded='1';inp.hidden=true;inp.insertAdjacentElement('afterend',ui);
 const sync=()=>{inp.value=ui.querySelector('[data-yv-hour]').value+':'+ui.querySelector('[data-yv-minute]').value;inp.dispatchEvent(new Event('change',{bubbles:true}))};
 ui.querySelectorAll('select').forEach(x=>x.addEventListener('change',sync));
}
function upgradeWorkingTimes(){
 document.querySelectorAll('#yardivoMasterPopupV583 [data-yma-wh-from],#yardivoMasterPopupV583 [data-yma-wh-to]').forEach(upgradeTimeInput);
 /* Ramp custom working-time rows are legacy: warehouse reception hours are canonical. */
 document.querySelectorAll('#yardivoMasterPopupV583 [data-yma-ramp-from],#yardivoMasterPopupV583 [data-yma-ramp-to]').forEach(x=>{
   const lab=x.closest('label');if(lab)lab.style.display='none';
 });
 const h=$('yardivoMasterOperationalConfigV583')?.querySelector('.ymd-ramp-list h4');
 if(h)h.textContent='RAMPE · KAPACITET I STATUS';
}

/* Responsible person = user code + first name + last name. */
function upgradeResponsible(){
 const sec=$('yardivoResponsiblePeopleV583');if(!sec)return;
 const add=sec.querySelector('.yrp-add');if(add&&!$('yrpUserCode')){
   const lab=document.createElement('label');lab.innerHTML='ŠIFRA KORISNIKA *<input id="yrpUserCode" autocomplete="off" placeholder="Šifra korisnika" maxlength="60">';
   add.insertBefore(lab,add.firstChild);
 }
 const btn=$('yrpAddBtn');
 if(btn&&!btn.dataset.yvCodeOwner){
   btn.dataset.yvCodeOwner='1';
   const clone=btn.cloneNode(true);btn.replaceWith(clone);
   clone.addEventListener('click',async e=>{
     e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
     const code=String($('yrpUserCode')?.value||'').trim(),first=String($('yrpFirstName')?.value||'').trim(),last=String($('yrpLastName')?.value||'').trim();
     if(!code||!first||!last)return alert('Šifra korisnika, ime i prezime su obavezni.');
     const d=md(),key=code.toLocaleLowerCase('hr');
     if(d.responsible_people.some(x=>String(x.user_code||'').trim().toLocaleLowerCase('hr')===key))return alert('Ta šifra korisnika već postoji.');
     if(d.responsible_people.some(x=>(String(x.first_name||'')+' '+String(x.last_name||'')).trim().toLocaleLowerCase('hr')===(first+' '+last).toLocaleLowerCase('hr')))return alert('Ta odgovorna osoba već postoji.');
     d.responsible_people.push({id:nextRpId(d.responsible_people),user_code:code,first_name:first,last_name:last,active:true,account_username:null,auth_user_id:null});
     try{await persist(d,'responsible-person.add-with-code');['yrpUserCode','yrpFirstName','yrpLastName'].forEach(id=>{if($(id))$(id).value=''});try{window.YardivoResponsiblePeopleV583?.refresh?.()}catch(_){}}catch(err){alert('Spremanje nije uspjelo: '+String(err?.message||err))}
   },true);
 }
 /* Show business/user code in list, never technical RP id. */
 const d=md();
 sec.querySelectorAll('[data-yrp-delete]').forEach(del=>{
   const row=del.closest('.yrp-row'),p=d.responsible_people.find(x=>String(x.id)===String(del.dataset.yrpDelete));if(!row||!p)return;
   let meta=row.querySelector('.yv-rp-user-code');if(!meta){meta=document.createElement('small');meta.className='yv-rp-user-code';row.querySelector('strong')?.insertAdjacentElement('afterend',meta)}
   if(meta)meta.textContent='ŠIFRA KORISNIKA: '+String(p.user_code||'—');
 });
}

/* Supplier Master is the only place where supplier code and warehouse scope are edited. */
function supplierAuthority(){
 const card=$('yardivoMasterSuppliersV583');if(card){
   const d=md();card.querySelectorAll('[data-spec-sup-name]').forEach(inp=>{
     const x=d.suppliers.find(v=>String(v.id)===String(inp.dataset.specSupName));if(!x)return;
     let meta=inp.parentElement.querySelector('.yv-supplier-meta');if(!meta){meta=document.createElement('div');meta.className='yv-supplier-meta';inp.insertAdjacentElement('afterend',meta)}
     const wh=x.all_warehouses?'SVA SKLADIŠTA':(x.warehouses||[]).map(id=>d.warehouses.find(w=>String(w.id)===String(id))?.name).filter(Boolean).join(', ');
     meta.textContent='ŠIFRA: '+String(x.supplier_code||x.code||'—')+' · SKLADIŠTA: '+(wh||'—');
   });
 }
 const scope=$('yufScopeSection'),contact=$('yufSupplierContactFields');
 if(scope)scope.style.display='none';if(contact)contact.style.display='none';
}

/* Canonical order: Location → Warehouse → Ramp management → Suppliers → Responsible people.
   Accounts begin below Master Data in normal Settings; no duplicate Master panels there. */
function orderMaster(){
 const pane=$('yardivoSettingsMasterPaneV583'),popup=$('yardivoMasterPopupBodyV583');if(!pane||!popup)return;
 if(pane.parentElement!==popup)popup.appendChild(pane);
 const stable=$('yardivoStableMasterEditorV583'),registry=$('yardivoMasterDataRegistryV583'),ops=$('yardivoMasterOperationalConfigV583');
 if(stable&&stable.parentElement!==pane)pane.appendChild(stable);
 if(registry&&registry.parentElement!==pane)pane.appendChild(registry);
 if(ops&&ops.parentElement!==pane)pane.appendChild(ops);
 /* Existing production flow already owns supplier + people ordering; keep one instance only. */
 const flow=$('yardivoProductionMasterFlowV583'),sup=$('yardivoMasterSuppliersV583'),rp=$('yardivoResponsiblePeopleV583');
 if(flow){
   let people=$('yardivoProductionMasterPeopleV583');if(!people){people=document.createElement('section');people.id='yardivoProductionMasterPeopleV583';flow.appendChild(people)}
   if(sup&&sup.parentElement!==people)people.appendChild(sup);
   if(rp&&rp.parentElement!==people)people.appendChild(rp);
 }
 ['adminCapacitySettings','receptionRampSettings','masterUserAdmin'].forEach(id=>{const x=$(id);if(x)x.style.setProperty('display','none','important')});
 const admin=$('yardivoSettingsAdminPaneV583');if(admin){admin.style.setProperty('display','block','important');admin.classList.add('active')}
}
function refresh(){
 orderMaster();upgradeWorkingTimes();upgradeResponsible();supplierAuthority();
}
document.addEventListener('click',e=>{
 if(e.target?.closest?.('#yardivoMasterPopupLaunchV583,#yvAddSupplierPopupV583,#ymdAddSupplier,[data-spec-sup-add],[data-yucr-role="supplier"]'))setTimeout(refresh,0);
},true);
['yardivo:master-data-changed','yardivo:master-data-ready','yardivo:data-synced','yardivo:login'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(refresh,30)));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,150),{once:true});else setTimeout(refresh,0);
window.YARDIVO_DEV_BUILD='20260917-dev-v5.8.3-master-data-cleanup-fix-final';
})();
