(function(){
'use strict';

function removePanelContaining(el){
  const panel=el?.closest?.('section.panel,.panel,.settings-card,.card');
  if(panel)panel.remove();
}
function cleanup(){
  /* Light mode itself stays available from the main moon/sun switch.
     Only the Settings panel for choosing a Light appearance is removed. */
  document.getElementById('yardivoLightStyleSettings')?.remove();

  /* Remove the complete legacy Google Sheets / Centralna baza settings block. */
  ['sheetUrl','sheetState','sheetSave','sheetTest','sheetPush'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)removePanelContaining(el);
  });

  /* Safety for dynamically rebuilt Settings markup. */
  document.querySelectorAll('#settings section.panel,#settings .settings-card').forEach(panel=>{
    const t=String(panel.textContent||'').toLocaleUpperCase('hr-HR');
    if(t.includes('GOOGLE SHEETS') && t.includes('CENTRALNA BAZA'))panel.remove();
    if(t.includes('IZGLED LIGHT MODEA'))panel.remove();
  });
}
window.addEventListener('load',()=>setTimeout(cleanup,700),{once:true});
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]')){
    [30,120,350].forEach(ms=>setTimeout(cleanup,ms));
  }
},true);
window.addEventListener('yardivo:login',()=>setTimeout(cleanup,100));
window.YardivoSettingsCleanup={run:cleanup};
})();
