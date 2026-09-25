(()=>{'use strict';
if(window.__YARDIVO_MASTER_TOTAL_STABILITY_FINAL__)return;window.__YARDIVO_MASTER_TOTAL_STABILITY_FINAL__=true;
let editHold=0,paintQueued=0;
function editing(){return Date.now()<editHold||!!document.activeElement?.closest?.('#yardivoMasterPopupV583,#yardivoStableMasterEditorV583,#yardivoMasterFoundationV583')}
function hold(){editHold=Date.now()+1400}
function paint(){if(editing())return;cancelAnimationFrame(paintQueued);paintQueued=requestAnimationFrame(()=>{paintQueued=0;try{window.YardivoLocationDropdownAuthorityV583?.sync?.()}catch(_){}try{window.YardivoHeaderMasterWarehouseAuthorityV583?.sync?.()}catch(_){}try{window.YardivoStableMasterV583?.render?.()}catch(_){}try{window.YardivoMasterHeaderCapacityBindingV583?.refresh?.()}catch(_){}})}
document.addEventListener('input',e=>{if(e.target?.closest?.('#yardivoMasterPopupV583,#yardivoStableMasterEditorV583,#yardivoMasterFoundationV583'))hold()},true);
document.addEventListener('change',e=>{if(e.target?.closest?.('#yardivoMasterPopupV583,#yardivoStableMasterEditorV583,#yardivoMasterFoundationV583'))hold()},true);
window.addEventListener('yardivo:master-data-ready',()=>paint());
window.addEventListener('yardivo:data-synced',()=>paint());
/* Opening Settings/Home paints from the already hydrated memory/cache immediately; network refresh is background-only. */
document.addEventListener('click',e=>{if(e.target?.closest?.('[data-view="settings"],[data-home-target="settings"],#yardivoMasterPopupLaunchV583,[data-view="home"],[data-home-target="home"]')){paint();try{window.YardivoMasterInstantBootV583?.refresh?.()}catch(_){}}},true);
window.YardivoMasterTotalStabilityV583={paint,editing};
window.YARDIVO_DEV_BUILD='20260916-dev-v5.8.3-master-x10-instant-boot-no-flicker-total-fix-final';
})();
