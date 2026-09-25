(function(){
'use strict';

function normalizeSettings(){
  /* Keep Settings palette choices only for the two DARK appearances. */
  const p=document.getElementById('yardivoDarkStyleSettings');
  if(p){
    const h=p.querySelector('h2'); if(h)h.textContent='DARK MODE';
    const s=p.querySelector('.panel-head small');if(s)s.textContent='Odaberi izgled koji se koristi kada je uključen Dark mode.';
    p.querySelectorAll('.yardivo-dark-style-option').forEach(x=>{
      const v=x.dataset.darkStyle;
      if(v==='blue')x.style.setProperty('display','none','important');
      if(v==='graphite'){
        const a=x.querySelector('strong');if(a)a.textContent='DARK';
        const b=x.querySelector('small');if(b)b.textContent='Tamni crno-sivi YARDIVO izgled.';
      }
      if(v==='original'){
        const a=x.querySelector('strong');if(a)a.textContent='ORIGINAL';
        const b=x.querySelector('small');if(b)b.textContent='Originalni YARDIVO tamno-plavi izgled.';
      }
    });
  }
  const v2=document.getElementById('yardivoThemeSettingsV2');
  if(v2){
    const t=v2.querySelector('.yt-title');if(t)t.textContent='DARK MODE';
    v2.querySelectorAll('[data-dark-look]').forEach(x=>{
      const v=x.dataset.darkLook;
      if(v==='blue')x.style.setProperty('display','none','important');
      if(v==='graphite')x.textContent='DARK';
      if(v==='original')x.textContent='ORIGINAL';
    });
  }
  /* Remove any legacy Settings-only Light palette panels/options, but not the global Light/Dark switch. */
  document.querySelectorAll(
    '#settings [data-light-look],#settings [data-light-style],#settings input[name="yardivoLightStyle"],'+
    '#settings .yardivo-light-style-option,#settings #yardivoLightGreenSettings'
  ).forEach(x=>{
    const panel=x.closest('.panel');
    if(panel && panel.querySelectorAll('[data-light-look],[data-light-style],input[name="yardivoLightStyle"],.yardivo-light-style-option').length){
      panel.style.setProperty('display','none','important');
    }else x.style.setProperty('display','none','important');
  });
}

/* The built-in 2026 Croatian holiday list is preserved. Do not clear/replace it.
   Existing custom days remain in studenac_custom_holidays and Add Custom Holiday stays available. */
function refreshHolidays(){
  try{renderHolidayAdmin?.()}catch(_){}
}

window.addEventListener('load',()=>setTimeout(()=>{normalizeSettings();refreshHolidays()},900),{once:true});
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"]')){
    setTimeout(()=>{normalizeSettings();refreshHolidays()},120);
  }
},true);
window.addEventListener('yardivo:login',()=>setTimeout(normalizeSettings,120));
window.YardivoSettingsCleanup={apply:normalizeSettings,refreshHolidays};
})();
