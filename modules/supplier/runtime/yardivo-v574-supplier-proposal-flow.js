(function(){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function acceptProposal(clientId){
  if(!confirm('Prihvatiti predloženi termin i rampu?'))return;
  try{await window.YardivoSupplierLiveSync.call('supplier_accept',{client_id:clientId});try{window.YardivoTermProvenance?.supplierAcceptedByClient?.(clientId,'Dobavljač')}catch(_){}await window.YardivoSupplierLiveSync.pullSupplier();alert('Termin i rampa su potvrđeni. Najava je sada operativna u YARDIVO-u.');}
  catch(e){alert('Potvrda nije uspjela:\n'+(e?.message||e));}
}
async function requestAlternative(clientId){
  const note=prompt('Napišite koji drugi termin vam odgovara (ili razlog):','');if(note===null)return;
  if(!note.trim()){alert('Upišite željeni drugi termin ili napomenu.');return;}
  try{await window.YardivoSupplierLiveSync.call('supplier_alternative',{client_id:clientId,note:note.trim()});await window.YardivoSupplierLiveSync.pullSupplier();alert('Zahtjev za drugim terminom poslan je Upravljanju zalihama.');}
  catch(e){alert('Zahtjev nije poslan:\n'+(e?.message||e));}
}
document.addEventListener('click',e=>{
  const a=e.target.closest?.('[data-ysp-accept-proposal]');if(a){acceptProposal(a.dataset.yspAcceptProposal);return;}
  const b=e.target.closest?.('[data-ysp-alternative]');if(b){requestAlternative(b.dataset.yspAlternative);return;}
},true);
function enhance(){
  document.querySelectorAll('#yspStatusList .ysp-delivery-card').forEach(()=>{});
  const rows=(()=>{try{const s=(typeof currentSession!=='undefined'?currentSession:window.currentSession)||{};const key='yardivo_supplier_portal_v549_'+String(s.authUserId||s.username||s.user||'supplier');return JSON.parse(localStorage.getItem(key)||'[]')}catch(_){return[]}})();
  const host=document.getElementById('yspStatusList');if(!host||!Array.isArray(rows))return;
  const proposed=rows.filter(x=>String(x.status||'').toLowerCase()==='proposal_sent');
  proposed.forEach(x=>{
    if(host.querySelector(`[data-v574-proposal="${CSS.escape(String(x.id))}"]`))return;
    const card=document.createElement('div');card.className='ysp-v574-proposal';card.dataset.v574Proposal=String(x.id);
    card.innerHTML=`<div><strong>PRIJEDLOG UPRAVLJANJA ZALIHAMA</strong><div>${esc(x.date)} · <b>${esc(String(x.time||'').slice(0,5))}</b> · Rampa <b>${esc(x.dock||'—')}</b></div></div><div class="ysp-v574-actions"><button type="button" class="btn-primary" data-ysp-accept-proposal="${esc(x.id)}">PRIHVATI TERMIN</button><button type="button" class="btn-secondary" data-ysp-alternative="${esc(x.id)}">ODABERI / ZATRAŽI DRUGI</button></div>`;
    host.prepend(card);
  });
}
window.addEventListener('yardivo:data-synced',()=>setTimeout(enhance,100));
setInterval(enhance,1200);
})();
