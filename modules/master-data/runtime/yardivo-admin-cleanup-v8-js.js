(function(){
'use strict';
if(window.__YARDIVO_ADMIN_CLEANUP_V8__)return;
window.__YARDIVO_ADMIN_CLEANUP_V8__=true;

const exactIds=[
 'detentionSettings',
 'yardivoMasterDwellV583',
 'yardivoSmartEngineSettingsV583',
 'yardivoQrWarehouseSettings',
 'yardivoQrWarehouseSettingsV584',
 'yvQrWarehouseSettings',
 'yvQrWarehouseSettingsV584'
];

function txt(el){return String(el?.textContent||'').replace(/\s+/g,' ').trim().toUpperCase()}

function removeRequested(root=document){
  for(const id of exactIds){const e=document.getElementById(id);if(e)e.remove()}

  document.querySelectorAll('.yse-master-note,[data-dwell-wh],[data-dwell-save],[data-dwell-wait],[data-dwell-dock]').forEach(e=>{
    const sec=e.closest('section,.panel,.settings-card,.card')||e;
    if(sec)sec.remove();
  });

  /* Text fallback for legacy-generated cards whose IDs changed between builds.
     Only exact requested modules are removed. */
  document.querySelectorAll('#settings section,#settings .panel,#settings .settings-card,#settings .card').forEach(el=>{
    const t=txt(el);
    if(
      t.startsWith('DWELL / DETENTION') ||
      t.includes('YARDIVO SMART · PLANERSKI MOTOR') ||
      t.startsWith('QR SCANNER · PO SKLADIŠTU') ||
      t.startsWith('QR SCANNER PO SKLADIŠTU')
    ){
      el.remove();
    }
  });

  /* Remove YARDIVO Smart automatic-recommendation navigation/module if present.
     This is limited to the Smart module, not other AI/help features. */
  document.querySelectorAll('[data-view],[data-home-target],.nav-btn,.home-menu-card,.home-card').forEach(el=>{
    const t=txt(el);
    const v=String(el.getAttribute?.('data-view')||el.getAttribute?.('data-home-target')||'').toLowerCase();
    if(
      v.includes('smartrecommend') ||
      v.includes('smart-recommend') ||
      t==='YARDIVO AUTOMATSKE PREPORUKE' ||
      t.startsWith('YARDIVO AUTOMATSKE PREPORUKE ')
    ){
      el.remove();
    }
  });
  document.querySelectorAll('[id*="smartRecommend" i],[id*="smart-recommend" i]').forEach(el=>el.remove());
}

let queued=false;
function schedule(){
 if(queued)return;queued=true;
 queueMicrotask(()=>{queued=false;removeRequested(document)});
}
const mo=new MutationObserver(schedule);
function boot(){
 removeRequested(document);
 if(document.body)mo.observe(document.body,{subtree:true,childList:true});
}
['yardivo:view-opened','yardivo:data-synced','yardivo:master-data-changed','yardivo:login'].forEach(ev=>window.addEventListener(ev,schedule));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

window.YardivoAdminCleanupV8={apply:removeRequested};
})();
