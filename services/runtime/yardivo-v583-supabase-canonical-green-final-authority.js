(()=>{'use strict';
if(window.__YARDIVO_SUPABASE_CANONICAL_GREEN_FINAL__)return;
window.__YARDIVO_SUPABASE_CANONICAL_GREEN_FINAL__=true;

function paintFromCanonical(){
  const S=window.YardivoSupabase;
  if(!S)return;
  const el=window.YardivoDbStatusAuthorityV583?.ensureEl?.();
  if(S.online?.()){
    window.YardivoDbStatusAuthorityV583?.set?.(
      '● ONLINE BAZA · ONLINE','ok',
      'Canonical Supabase sync je spojen i spreman.','sync'
    );
  }
}
['yardivo:data-synced','yardivo:supabase-online'].forEach(ev=>{
  window.addEventListener(ev,()=>setTimeout(paintFromCanonical,0));
});
window.addEventListener('focus',()=>setTimeout(paintFromCanonical,220));
window.addEventListener('load',()=>setTimeout(paintFromCanonical,900),{once:true});
setInterval(()=>{if(!document.hidden)paintFromCanonical()},3000);

window.YardivoSupabaseCanonicalGreenV583={paint:paintFromCanonical};
window.YARDIVO_DEV_BUILD='20260918-dev-v5.8.3-supabase-canonical-green-final';
})();
