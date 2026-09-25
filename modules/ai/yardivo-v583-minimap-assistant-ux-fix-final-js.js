
(()=>{'use strict';
if(window.__YV_MINIMAP_ASSISTANT_UX_FIX_FINAL__)return;
window.__YV_MINIMAP_ASSISTANT_UX_FIX_FINAL__=true;

let mmLeaveTimer=0;

function bindAssistantInput(){
  const input=document.getElementById('yardivoAssistantInput');
  const send=document.getElementById('yardivoAssistantSend');
  if(input){
    input.removeAttribute('disabled');
    input.removeAttribute('readonly');
    input.setAttribute('placeholder','Upiši poruku YARDIVO Assistantu...');
    input.style.pointerEvents='auto';
    input.style.userSelect='text';
    input.tabIndex=0;
    if(!input.dataset.yvUxFixBound){
      input.dataset.yvUxFixBound='1';
      input.addEventListener('pointerdown',e=>e.stopPropagation());
      input.addEventListener('click',e=>e.stopPropagation());
      input.addEventListener('focus',()=>document.body.classList.add('yv-assistant-open'));
    }
  }
  if(send){
    send.removeAttribute('disabled');
    send.style.pointerEvents='auto';
  }
}

function closeMiniNow(){
  clearTimeout(mmLeaveTimer);
  document.body.classList.remove('yv-minimap-open','yv-minimap-expanded');
}
function bindMini(){
  const dock=document.getElementById('yardivoMiniMapDock');
  if(!dock||dock.dataset.yvUxFinalBound)return;
  dock.dataset.yvUxFinalBound='1';

  const head=dock.querySelector('.yv-mm-head');
  if(head){
    head.title='Klikni za veći prikaz Mini My Yard';
    head.addEventListener('click',e=>{
      if(e.target.closest('.yv-mm-close'))return;
      e.preventDefault();
      document.body.classList.add('yv-minimap-open');
      document.body.classList.toggle('yv-minimap-expanded');
      try{window.YardivoMiniMapV583?.render?.()}catch(_){}
    });
  }

  dock.addEventListener('pointerenter',()=>{
    clearTimeout(mmLeaveTimer);
    document.body.classList.add('yv-minimap-open');
  },{passive:true});

  /* User request: when mouse leaves, panel disappears. */
  dock.addEventListener('pointerleave',()=>{
    clearTimeout(mmLeaveTimer);
    mmLeaveTimer=setTimeout(closeMiniNow,90);
  },{passive:true});

  dock.addEventListener('click',e=>{
    const r=e.target.closest?.('[data-yv-mm-dock]');
    if(!r)return;
    e.stopPropagation();
    const wid=r.dataset.yvMmWh;
    const dockNo=Number(r.dataset.yvMmDock);
    /* Existing build already owns the modal function through click binding.
       Re-dispatch a dedicated event only if popup didn't open immediately. */
    setTimeout(()=>{
      const modal=document.getElementById('yardivoMiniRampModal');
      if(modal&&!modal.classList.contains('open')){
        try{
          r.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
        }catch(_){}
      }
    },0);
  });
}

function ensureRampModalVisible(){
  const m=document.getElementById('yardivoMiniRampModal');
  if(!m)return;
  if(!m.dataset.yvUxFixBound){
    m.dataset.yvUxFixBound='1';
    m.addEventListener('pointerenter',()=>clearTimeout(mmLeaveTimer),{passive:true});
  }
}

/* Explicit fallback click owner for ramps, in case an older listener is shadowed. */
function fallbackRampClick(e){
  const r=e.target.closest?.('#yardivoMiniMapDock [data-yv-mm-dock]');
  if(!r)return;
  const existing=document.getElementById('yardivoMiniRampModal');
  if(existing?.classList.contains('open'))return;

  const wid=r.dataset.yvMmWh,dockNo=Number(r.dataset.yvMmDock);
  try{
    /* openRampDetail exists in the canonical mini-map closure only, so use public data
       to build a fallback modal if needed. */
    setTimeout(()=>{
      const still=document.getElementById('yardivoMiniRampModal');
      if(still?.classList.contains('open'))return;

      let modal=still;
      if(!modal){
        modal=document.createElement('div');
        modal.id='yardivoMiniRampModal';
        modal.innerHTML='<div class="yv-mr-card"><div class="yv-mr-head"><strong id="yvMrTitle">RAMPA</strong><button type="button" class="yv-mr-close">×</button></div><div class="yv-mr-body" id="yvMrBody"></div></div>';
        document.body.appendChild(modal);
        modal.querySelector('.yv-mr-close').onclick=()=>modal.classList.remove('open');
        modal.addEventListener('click',ev=>{if(ev.target===modal)modal.classList.remove('open')});
      }

      const title=document.getElementById('yvMrTitle');
      const body=document.getElementById('yvMrBody');
      const all=Array.isArray(window.announcements)?window.announcements:(typeof announcements!=='undefined'&&Array.isArray(announcements)?announcements:[]);
      const D=window.yardivoLocalDateV583?.()||new Date().toISOString().slice(0,10);
      const st=a=>{
        const s=String(a?.status||'').toLowerCase();
        if(a?.dockArrivalAt||/rampi/.test(s))return'dock';
        return'other';
      };
      const a=all.find(x=>String(x.warehouse||'')===String(wid)&&String(x.date||'')===String(D)&&Number(x.dock)===dockNo&&st(x)==='dock');
      const wn=window.yardivoWarehouseNameV583?.(wid)||wid||'SKLADIŠTE';

      if(title)title.textContent=`${wn} · RAMPA R${dockNo}`;
      if(body){
        body.innerHTML=a
          ? `<span class="yv-mr-status busy">ZAUZETA</span><div class="yv-mr-grid">
              <div><small>DOBAVLJAČ</small><strong>${String(a.supplier||'—')}</strong></div>
              <div><small>PALETE</small><strong>${Number(a.pallets||0)}</strong></div>
              <div><small>TERMIN</small><strong>${String(a.time||'—')}</strong></div>
              <div><small>STATUS</small><strong>${String(a.status||'NA RAMPI')}</strong></div>
             </div>`
          : `<span class="yv-mr-status free">SLOBODNA</span><div class="yv-mr-grid">
              <div><small>SKLADIŠTE</small><strong>${String(wn)}</strong></div>
              <div><small>RAMPA</small><strong>R${dockNo}</strong></div>
              <div><small>DATUM</small><strong>${String(D)}</strong></div>
              <div><small>STANJE</small><strong>NEMA AKTIVNOG KAMIONA</strong></div>
             </div>`;
      }
      modal.classList.add('open');
      ensureRampModalVisible();
    },20);
  }catch(_){}
}

function ensure(){
  bindAssistantInput();
  bindMini();
  ensureRampModalVisible();
}
document.addEventListener('click',fallbackRampClick,true);
window.addEventListener('yardivo:login',()=>setTimeout(ensure,80));
window.addEventListener('load',()=>setTimeout(ensure,400),{once:true});
document.addEventListener('DOMContentLoaded',ensure,{once:true});
setTimeout(ensure,300);

window.YardivoMiniAssistantUxFixFinalV583={refresh:ensure,closeMini:closeMiniNow};
})();
