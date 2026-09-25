(function(){
'use strict';
function enforceMasterWarehouseLocation(){
  const root=document.getElementById('yardivoStableMasterEditorV583');
  const sel=document.getElementById('smNewWarehouseLocation');
  if(!root||!sel)return;
  const label=sel.closest('label');
  const span=label?.querySelector('span');
  if(span)span.innerHTML='2 · ODABERI LOKACIJU <b>*</b>';
  let md={locations:[]};try{md=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}')}catch(_){}
  const rows=(Array.isArray(md.locations)?md.locations:[]).filter(x=>x&&x.active!==false&&String(x.id||'')&&String(x.name||'').trim());
  const previous=sel.value;
  sel.innerHTML='<option value="" disabled>— ODABERI LOKACIJU —</option>'+rows.map(x=>`<option value="${String(x.id).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}">${String(x.name).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))} (${String(x.id).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))})</option>`).join('');
  if(rows.some(x=>String(x.id)===previous))sel.value=previous;else sel.value='';
  sel.disabled=!rows.length;
  const btn=root.querySelector('[data-sm-add-wh]');if(btn)btn.disabled=!String(sel.value||'').trim();
}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]'))setTimeout(enforceMasterWarehouseLocation,120)},true);
window.addEventListener('yardivo:master-data-changed',()=>setTimeout(enforceMasterWarehouseLocation,80));
window.addEventListener('load',()=>setTimeout(enforceMasterWarehouseLocation,1800));
})();
