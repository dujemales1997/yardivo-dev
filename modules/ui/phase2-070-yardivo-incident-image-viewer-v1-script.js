
(function(){
'use strict';
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function allInc(){try{return Array.isArray(incidents)?incidents:[]}catch(e){return[]}}
function imageOf(i){
  return i?.imageData||i?.photoData||i?.image||i?.photo||i?.imageUrl||i?.photoUrl||i?.attachmentUrl||i?.fileUrl||'';
}
function findIncident(el){
  const id=el.dataset.incidentId||el.closest('[data-incident-id]')?.dataset.incidentId||el.closest('[data-id]')?.dataset.id;
  if(id){const x=allInc().find(i=>String(i.id)===String(id));if(x)return x}
  const src=el.currentSrc||el.src||el.getAttribute('src')||'';
  return allInc().find(i=>imageOf(i)===src)||null;
}
function modal(){
  let m=document.getElementById('yardivoIncidentImageModal');if(m)return m;
  m=document.createElement('div');m.id='yardivoIncidentImageModal';m.innerHTML='<div class="yiv-dialog" role="dialog" aria-modal="true" aria-label="Slika incidenta"><div class="yiv-image-wrap"><img alt="Slika incidenta"></div><div class="yiv-info"></div></div>';
  document.body.appendChild(m);
  m.addEventListener('click',e=>{if(e.target===m)close()});
  m.querySelector('img').addEventListener('click',e=>e.currentTarget.classList.toggle('zoomed'));
  return m;
}
function field(k,v){if(v===undefined||v===null||v==='')return'';return `<div class="yiv-field"><small>${esc(k)}</small><strong>${esc(v)}</strong></div>`}
function download(src,name){
  try{
    const a=document.createElement('a');a.href=src;a.download=name||'YARDIVO_incident_slika.jpg';document.body.appendChild(a);a.click();a.remove();
  }catch(e){window.open(src,'_blank')}
}
function open(i,src){
  const m=modal(),img=m.querySelector('img'),info=m.querySelector('.yiv-info');
  src=src||imageOf(i);if(!src)return;
  img.src=src;img.classList.remove('zoomed');
  const id=i?.id||'', supplier=i?.supplier||'', date=i?.date||i?.createdAt||'', type=i?.type||i?.reason||'', severity=i?.severity||'', plate=i?.plate||i?.vehiclePlate||'', order=i?.orderNumber||'', note=i?.note||i?.description||'', createdBy=i?.createdBy||'', ann=i?.announcementId||'';
  const filename=`YARDIVO_Incident_${String(id||'slika').replace(/[^a-z0-9_-]/gi,'_')}.jpg`;
  info.innerHTML=`<div class="yiv-head"><h3>Incident ${id?'#'+esc(id):''}</h3><button type="button" class="yiv-close" data-yiv-close>×</button></div>
  <div class="yiv-grid">${field('Datum',date)}${field('Dobavljač',supplier)}${field('Tip incidenta',type)}${field('Težina',severity)}${field('Tablice',plate)}${field('Narudžba',order)}${field('Najava ID',ann)}${field('Kreirao',createdBy)}${field('Napomena',note)}</div>
  <div class="yiv-actions"><button type="button" class="download" data-yiv-download>⬇ PREUZMI SLIKU</button><button type="button" data-yiv-close>ZATVORI</button></div>`;
  info.querySelectorAll('[data-yiv-close]').forEach(b=>b.onclick=close);
  info.querySelector('[data-yiv-download]').onclick=()=>download(src,filename);
  m.classList.add('open');document.body.style.overflow='hidden';
}
function close(){const m=document.getElementById('yardivoIncidentImageModal');if(m)m.classList.remove('open');document.body.style.overflow=''}
document.addEventListener('click',e=>{
  const img=e.target.closest('#incidents img,#incidentArchive img,[data-incident-image],.incident-image,.incident-photo');
  if(!img||img.closest('#yardivoIncidentImageModal'))return;
  const src=img.currentSrc||img.src||img.getAttribute('src');if(!src)return;
  e.preventDefault();e.stopPropagation();open(findIncident(img),src);
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
window.YardivoIncidentImageViewer={open,close};
})();
