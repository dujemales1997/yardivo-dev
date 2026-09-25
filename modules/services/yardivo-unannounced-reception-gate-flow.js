
(function(){
'use strict';

function r(){
  let x='';try{x=String(currentSession?.role||'').toLowerCase().trim()}catch(e){}
  if(x==='prijam')x='reception';
  if(x==='porta'||x==='portir')x='gate';
  if(x==='zalihe'||x==='upravljanje zalihama')x='inventory';
  return x;
}
function anns(){try{return Array.isArray(announcements)?announcements:[]}catch(e){return[]}}
function byId(id){return anns().find(a=>String(a.id)===String(id))}
function user(){try{return currentSession?.username||currentSession?.user||r()}catch(e){return r()}}

function saveAll(){
  try{saveAnnouncements()}catch(e){}
  try{render?.()}catch(e){}
  try{renderReceiving?.()}catch(e){}
  try{renderOverview?.()}catch(e){}
  try{YardivoOverviewMaster?.render?.()}catch(e){}
  try{renderUnannouncedComplete?.()}catch(e){}
  try{YardivoUnannouncedSection?.render?.()}catch(e){}
}

function receptionApprove(id){
  if(!['reception','admin'].includes(r()))return alert('Samo Prijam ili Admin mogu odobriti nenajavljeni dolazak.');
  const a=byId(id);if(!a)return;
  if(a.arrivalType!=='UNANNOUNCED')return;
  a.approvalStatus='APPROVED';
  a.status='Odobreno od Prijama — čeka ulaz';
  a.approvedBy=user();
  a.approvedAt=new Date().toISOString();
  a.receptionApprovedBy=user();
  a.receptionApprovedAt=a.approvedAt;
  a.updatedAt=a.approvedAt;
  a.updatedBy=user();
  a.changeHistory=Array.isArray(a.changeHistory)?a.changeHistory:[];
  a.changeHistory.push({changedAt:a.approvedAt,type:'UNANNOUNCED_RECEPTION_APPROVED',changedBy:user(),note:'Prijam odobrio nenajavljeni dolazak'});
  saveAll();
  try{showYmsToast?.('success','NENAJAVLJENI DOLAZAK ODOBREN','Porta sada može odobriti ulazak.')}catch(e){}
}

function receptionReject(id,reason){
  if(!['reception','admin'].includes(r()))return alert('Samo Prijam ili Admin mogu odbiti nenajavljeni dolazak.');
  const a=byId(id);if(!a)return;
  a.approvalStatus='REJECTED';
  a.status='Odbijeno od Prijama';
  a.approvalRejectedBy=user();
  a.approvalRejectedAt=new Date().toISOString();
  a.approvalRejectionReason=reason||a.approvalRejectionReason||'';
  a.updatedAt=a.approvalRejectedAt;a.updatedBy=user();
  a.changeHistory=Array.isArray(a.changeHistory)?a.changeHistory:[];
  a.changeHistory.push({changedAt:a.approvalRejectedAt,type:'UNANNOUNCED_RECEPTION_REJECTED',changedBy:user(),reason:a.approvalRejectionReason});
  saveAll();
}

function gateEnter(id){
  if(r()!=='gate')return alert('Samo Porta može evidentirati ulazak.');
  const a=byId(id);if(!a)return;
  if(a.approvalStatus!=='APPROVED')return alert('Prijam još nije odobrio ovaj nenajavljeni dolazak.');
  if(a.yardArrivalAt)return alert('Ulazak je već evidentiran.');
  const now=new Date().toISOString();
  a.yardArrivalAt=now;
  a.status='U dvorištu';
  a.gateEntryApprovedBy=user();
  a.gateEntryApprovedAt=now;
  a.unannouncedEntryStatus='ENTERED';
  a.updatedAt=now;a.updatedBy=user();
  a.changeHistory=Array.isArray(a.changeHistory)?a.changeHistory:[];
  a.changeHistory.push({changedAt:now,type:'UNANNOUNCED_GATE_ENTRY',changedBy:user(),note:'Porta odobrila i evidentirala ulazak'});
  saveAll();
  try{showYmsToast?.('success','ULAZ EVIDENTIRAN',`${a.supplier||''} · ${a.plannedPlate||''}`)}catch(e){}
}

function augment(){
  const host=document.getElementById('unannouncedSectionList');if(!host)return;
  const data=anns().filter(a=>a.arrivalType==='UNANNOUNCED');
  host.querySelectorAll('.unannounced-request').forEach(card=>{
    const text=(card.textContent||'');
    const a=data.find(x=>text.includes(String(x.supplier||'')) && text.includes(String(x.plannedPlate||'')));
    if(!a)return;

    let actions=card.querySelector('.ua-flow-actions');
    if(!actions){actions=document.createElement('div');actions.className='ua-request-actions ua-flow-actions';card.appendChild(actions)}
    actions.innerHTML='';

    if(['reception','admin'].includes(r()) && a.approvalStatus==='PENDING'){
      const ok=document.createElement('button');ok.type='button';ok.className='unannounced-approve';ok.textContent='ODOBRI DOLAZAK';
      ok.onclick=()=>receptionApprove(a.id);actions.appendChild(ok);

      const no=document.createElement('button');no.type='button';no.className='unannounced-reject';no.textContent='ODBIJ';
      no.onclick=()=>{const reason=prompt('Razlog odbijanja:')||'';receptionReject(a.id,reason)};actions.appendChild(no);
    }

    if(r()==='gate' && a.approvalStatus==='APPROVED' && !a.yardArrivalAt){
      const enter=document.createElement('button');enter.type='button';enter.className='unannounced-approve ua-gate-enter-btn';enter.textContent='ODOBRI ULAZ';
      enter.onclick=()=>gateEnter(a.id);actions.appendChild(enter);
    }

    if(r()==='gate' && a.approvalStatus==='PENDING'){
      const s=document.createElement('span');s.className='ua-flow-status pending';s.textContent='ČEKA ODOBRENJE PRIJAMA';actions.appendChild(s);
    }
    if(a.approvalStatus==='APPROVED' && !a.yardArrivalAt && r()!=='gate'){
      const s=document.createElement('span');s.className='ua-flow-status approved';s.textContent='ODOBRENO — ČEKA ULAZ';actions.appendChild(s);
    }
    if(a.yardArrivalAt){
      const s=document.createElement('span');s.className='ua-flow-status entered';s.textContent='ULAZ EVIDENTIRAN';actions.appendChild(s);
    }
  });
}

const oldApprove=window.YardivoUnannounced?.approve;
const oldReject=window.YardivoUnannounced?.reject;
if(window.YardivoUnannounced){
  window.YardivoUnannounced.approve=receptionApprove;
  window.YardivoUnannounced.reject=function(id){
    const reason=document.getElementById('uaRejectReason_'+id)?.value||'';
    receptionReject(id,reason);
  };
}

window.YardivoUnannouncedFlow={receptionApprove,receptionReject,gateEnter,augment};

document.addEventListener('click',e=>{
  if(e.target.closest('[data-view="unannounced"],[data-home-target="unannounced"]'))setTimeout(augment,80);
},true);
window.addEventListener('load',()=>setTimeout(augment,900));
['yardivo:data-synced','yardivo:login','yardivo:context-changed']
 .forEach(ev=>window.addEventListener(ev,()=>requestAnimationFrame(augment)));
})();
