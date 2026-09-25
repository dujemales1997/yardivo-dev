(function(){
'use strict';
if(window.__YARDIVO_SAAS_CLEANUP_PASS1_V583__)return;
window.__YARDIVO_SAAS_CLEANUP_PASS1_V583__=true;

const LEGACY_SETTINGS_SCRIPT_IDS=[
  'yardivo-role-settings-dynamic-ramps',
  'yardivo-v583-settings-tabs-warehouse-count-fix',
  'yardivo-v583-settings-redesign-script'
];

/* Safety marker: those scripts are intentionally non-executable in SaaS Cleanup Pass 1. */
window.YardivoSaasCleanupV583={
  pass:1,
  authoritative:{
    masterData:'yardivo_master_data_registry_v583',
    warehouseRampCount:'MASTER PODACI → SKLADIŠTA',
    rampDetailSettings:'PRIJAM & RAMPE',
    settingsController:'YardivoSettingsConsolidationV583',
    locationState:'YardivoLocationStateV583'
  },
  disabledLegacySettingsScripts:LEGACY_SETTINGS_SCRIPT_IDS.slice(),
  status:()=>({
    masterData:!!window.YardivoMasterWarehouseRampsV583,
    settings:!!window.YardivoSettingsConsolidationV583,
    location:!!window.YardivoLocationStateV583
  })
};

/* No legacy add/remove-ramp event should be emitted from Settings. */
document.addEventListener('click',function(e){
  const btn=e.target.closest?.('#addRampBtn,#removeRampBtn,.add-ramp-btn,.remove-ramp-btn,[data-action="add-ramp"],[data-action="remove-ramp"]');
  if(!btn)return;
  if(!btn.closest?.('#settings'))return;
  e.preventDefault();
  e.stopImmediatePropagation();
},true);

window.YARDIVO_DEV_BUILD='20260911-dev-v5.8.3-saas-cleanup-pass-1';
})();
