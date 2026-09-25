
(function(){
'use strict';
function sync(){
  let t='14:00';
  try{t=String(window.YardivoDelayRulesV1?.get?.().noShowAt||'14:00')}catch(_){}
  const head=document.querySelector('#after14NoShowPanel .after14-alert-head strong');
  if(head)head.textContent=`⚠ AUTOMATSKI NO-SHOW · ${t}`;
  const ops=document.querySelector('#operationsPro .panel-head h2, #after14OperationsList')?.closest?.('.panel')?.querySelector?.('.panel-head h2');
  if(ops&&/NO-SHOW/i.test(ops.textContent||''))ops.textContent=`AUTOMATSKI NO-SHOW · ${t}`;
}
window.addEventListener('yardivo:delay-rules-changed',sync);
window.addEventListener('yardivo:view-opened',sync);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
window.YardivoDelayLabelSyncV10={sync};
})();
