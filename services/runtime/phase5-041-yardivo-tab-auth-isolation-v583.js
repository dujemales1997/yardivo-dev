
(function(){
'use strict';
if(window.YardivoTabAuthV583)return;
let id='';
try{
  id=String(window.name||'').match(/^yardivo-auth-tab-(.+)$/)?.[1]||'';
  if(!id){
    id=(crypto?.randomUUID?.()||('t'+Date.now().toString(36)+Math.random().toString(36).slice(2)));
    window.name='yardivo-auth-tab-'+id;
  }
}catch(_){id='t'+Date.now().toString(36)+Math.random().toString(36).slice(2)}
const safe=id.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80)||('t'+Date.now());
window.YardivoTabAuthV583={id:safe,storageKey:'yardivo-auth-'+safe};
})();
