
(function(){
'use strict';
if(window.__YARDIVO_SUPPLIER_PORTAL_UX_AUTHORITY_V583__)return;
window.__YARDIVO_SUPPLIER_PORTAL_UX_AUTHORITY_V583__=true;
const $=id=>document.getElementById(id);
const portal=()=>$('yardivoSupplierPortal');
function sess(){try{return (typeof currentSession!=='undefined'?currentSession:window.currentSession)||{}}catch(_){return window.currentSession||{}}}
function userKey(prefix){const s=sess();return prefix+String(s.authUserId||s.username||s.user||'supplier')}
function lang(){return portal()?.querySelector('[data-lang="en"].active')?'en':'hr'}
function activeView(){return portal()?.querySelector('[data-ysp-view].active')?.dataset.yspView||'new'}
function enforceMapScope(){
 const p=portal();if(!p)return;
 const view=activeView();p.dataset.yspActiveView=view;
 const newSection=p.querySelector('[data-ysp-section="new"]');
 const side=$('yardivoSupplierRightDailyMapV583');
 if(side && newSection && !newSection.contains(side) && !side.closest('#yardivoSupplierRightMapFullscreenV583')){
   let layout=newSection.querySelector('.yardivo-supplier-new-layout-v583');
   const card=newSection.querySelector(':scope > .ysp-card')||newSection.querySelector('.ysp-card');
   if(!layout && card){layout=document.createElement('div');layout.className='yardivo-supplier-new-layout-v583';card.parentNode.insertBefore(layout,card);layout.appendChild(card)}
   if(layout)layout.appendChild(side);
 }
 if(view!=='new'){
   try{window.YardivoSupplierRightDailyMapV583?.close?.()}catch(_){}
   const fs=$('yardivoSupplierRightMapFullscreenV583');fs?.classList.remove('open');document.body.classList.remove('ysrf-open');
   if(side)side.style.setProperty('display','none','important');
 }else if(side){side.style.removeProperty('display');try{window.YardivoSupplierRightDailyMapV583?.refresh?.()}catch(_){}}
}
const EN=new Map(Object.entries({
 'NOVA NAJAVA':'NEW ANNOUNCEMENT','POVIJEST NAJAVA':'ANNOUNCEMENT HISTORY','STANJE NAJAVE I ISPORUKE':'ANNOUNCEMENT & DELIVERY STATUS','POSTAVKE':'SETTINGS','ODJAVA':'LOG OUT',
 'Nova najava':'New announcement','Povijest najava':'Announcement history','Stanje najave i isporuke':'Announcement & delivery status','Postavke':'Settings',
 'DODIJELJENA SKLADIŠTA':'ASSIGNED WAREHOUSES','AKTIVNE NAJAVE':'ACTIVE ANNOUNCEMENTS','ČEKA POTVRDU':'AWAITING CONFIRMATION','ZAVRŠENE':'COMPLETED',
 'Nova najava dostave':'New delivery announcement','SKLADIŠTE':'WAREHOUSE','BROJ NARUDŽBE / PO *':'PURCHASE ORDER / PO *','DATUM DOSTAVE *':'DELIVERY DATE *','ŽELJENI TERMIN *':'REQUESTED TIME *',
 'REGISTRACIJA VOZILA · OPCIONALNO':'VEHICLE REGISTRATION · OPTIONAL','VOZAČ · OPCIONALNO':'DRIVER · OPTIONAL','BROJ PALETA *':'NUMBER OF PALLETS *','REFERENCA / OTPREMNICA · OPCIONALNO':'REFERENCE / DELIVERY NOTE · OPTIONAL','NAPOMENA · OPCIONALNO':'NOTE · OPTIONAL',
 'OČISTI':'CLEAR','POŠALJI NAJAVU':'SUBMIT ANNOUNCEMENT','DATUM / TERMIN':'DATE / TIME','STATUS':'STATUS','RAMPA':'DOCK','VOZILO / VOZAČ':'VEHICLE / DRIVER',
 'JEZIK SUČELJA':'INTERFACE LANGUAGE','HRVATSKI':'CROATIAN','VELIČINA TEKSTA':'TEXT SIZE','NORMALNO':'NORMAL','VEĆE':'LARGER','NAJVEĆE':'LARGEST',
 'DNEVNA MAPA · SLOBODNI TERMINI':'DAILY MAP · AVAILABLE SLOTS','DNEVNA MAPA · SLOBODNI TERMINI I RAMPE':'DAILY MAP · AVAILABLE SLOTS AND DOCKS','POVEĆAJ MAPU':'EXPAND MAP','TERMIN NIJE ODABRAN':'NO SLOT SELECTED','VRIJEME':'TIME','RAMPA DOSTUPNA':'DOCK AVAILABLE','ZAUZETO':'OCCUPIED',
 'Čeka potvrdu':'Awaiting confirmation','Potvrđeno':'Confirmed','Završeno':'Completed','Nije dodijeljena':'Not assigned','UREDI':'EDIT','NAKNADNO DODAJ':'ADD LATER','ZATRAŽI PROMJENU TERMINA':'REQUEST SLOT CHANGE',
 'Najava':'Request','Potvrda':'Confirmed','Dolazak':'Arrival','Zaprimanje':'Receiving'
}));
function translateExact(root){
 if(lang()!=='en'||!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
 while(n=walker.nextNode()){
   const raw=n.nodeValue||'',trim=raw.trim();if(!trim)continue;
   const tr=EN.get(trim);if(tr)n.nodeValue=raw.replace(trim,tr);
 }
 root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el=>{
   for(const a of ['placeholder','title','aria-label']){const v=el.getAttribute(a);if(v&&EN.has(v.trim()))el.setAttribute(a,EN.get(v.trim()))}
 });
 // Dynamic map / status sentence translations.
 root.querySelectorAll('.ysr-sub,.ysr-empty,.ysr-choice,.ysp-info,.muted,.ysp-delivery-meta').forEach(el=>{
   let t=el.textContent||'';
   t=t.replace('Odaberi skladište, datum i broj paleta.','Select warehouse, date and pallet count.')
      .replace('Mapa će se prikazati kada odabereš skladište, datum i broj paleta.','The map will appear after you select warehouse, date and pallet count.')
      .replace('TERMIN NIJE ODABRAN','NO SLOT SELECTED')
      .replace('Za ovaj datum i količinu nema slobodnog termina. Dobavljač može poslati najavu bez termina, a Zalihe kasnije mogu predložiti termin.','No suitable slot is available for this date and quantity. The supplier can submit without a slot and Inventory can propose one later.')
      .replace(/Nedostaje:\s*/,'Missing: ')
      .replace(/skladište/g,'warehouse').replace(/datum/g,'date').replace(/broj paleta/g,'pallet count')
      .replace(/paleta/g,'pallets').replace(/ODABRANO/g,'SELECTED').replace(/RAMPA\s+(\d+)/g,'DOCK $1');
   if(el.textContent!==t)el.textContent=t;
 });
}
function fontKey(){return userKey('yardivo_supplier_font_v583_')}
function setFont(v){v=['normal','large','xlarge'].includes(v)?v:'normal';const p=portal();if(!p)return;p.dataset.yspFont=v;try{localStorage.setItem(fontKey(),v)}catch(_){};p.querySelectorAll('[data-ysp-font-choice]').forEach(b=>b.classList.toggle('active',b.dataset.yspFontChoice===v))}
function installFontSettings(){
 const p=portal();if(!p)return;const settings=p.querySelector('[data-ysp-section="settings"] .ysp-card');if(!settings)return;
 let stack=settings.querySelector('.ysp-settings-stack');
 const langRow=settings.querySelector('.ysp-settings-row');
 if(!stack&&langRow){stack=document.createElement('div');stack.className='ysp-settings-stack';langRow.parentNode.insertBefore(stack,langRow);stack.appendChild(langRow)}
 if(stack&&!settings.querySelector('[data-ysp-font-row]')){
   const row=document.createElement('div');row.className='ysp-settings-row';row.dataset.yspFontRow='1';
   row.innerHTML='<div><strong data-i18n="textSize">VELIČINA TEKSTA</strong><div class="muted" style="margin:4px 0 0" data-i18n="textSizeHelp">Povećaj ili smanji tekst kroz cijeli Supplier portal.</div></div><div class="ysp-font"><button type="button" data-ysp-font-choice="normal">NORMALNO</button><button type="button" data-ysp-font-choice="large">VEĆE</button><button type="button" data-ysp-font-choice="xlarge">NAJVEĆE</button></div>';
   stack.appendChild(row);
 }
 let v='normal';try{v=localStorage.getItem(fontKey())||'normal'}catch(_){}setFont(v);
}
function refresh(){installFontSettings();enforceMapScope();setTimeout(()=>{enforceMapScope();translateExact(portal())},40)}
document.addEventListener('click',e=>{
 const f=e.target.closest?.('#yardivoSupplierPortal [data-ysp-font-choice]');if(f){setFont(f.dataset.yspFontChoice);setTimeout(()=>translateExact(portal()),0);return}
 if(e.target.closest?.('#yardivoSupplierPortal [data-ysp-view],#yardivoSupplierPortal [data-lang]'))setTimeout(refresh,60);
},true);
document.addEventListener('change',e=>{if(e.target?.closest?.('#yardivoSupplierPortal'))setTimeout(()=>{enforceMapScope();translateExact(portal())},90)},true);
document.addEventListener('input',e=>{if(e.target?.matches?.('#yspPallets,#yspWarehouse'))setTimeout(()=>translateExact(portal()),120)},true);
window.addEventListener('yardivo:login',()=>setTimeout(refresh,180));
window.addEventListener('load',()=>setTimeout(refresh,500));
setTimeout(refresh,120);
window.YardivoSupplierPortalUXV583={refresh,setFont,enforceMapScope};
window.YARDIVO_DEV_BUILD='20260913-dev-v5.8.3-supplier-portal-ui-language-font-map';
})();
