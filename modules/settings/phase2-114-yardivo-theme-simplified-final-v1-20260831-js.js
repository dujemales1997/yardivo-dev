
(function(){
'use strict';
const MAIN='yardivo_main_theme_v2';
const DARK='yardivo_dark_look_v2';

function normalizeDark(v){
  /* Old "blue" is merged into ORIGINAL. */
  if(v==='blue')return 'original';
  return v==='graphite'?'graphite':'original';
}
function getMain(){
  const v=localStorage.getItem(MAIN);
  return v==='light'||v==='dark'?v:(document.body.classList.contains('light-mode')?'light':'dark');
}
function getDark(){
  let v=localStorage.getItem(DARK);
  if(!v)try{v=localStorage.getItem('yardivo_dark_style')}catch(_){}
  return normalizeDark(v);
}
function apply(){
  const m=getMain(),d=getDark();
  localStorage.setItem(MAIN,m);
  localStorage.setItem(DARK,d);
  try{localStorage.setItem('yardivo_dark_style',d)}catch(_){}
  document.documentElement.dataset.yardivoMainTheme=m;
  document.documentElement.dataset.yardivoDarkLook=d;
  document.body.classList.toggle('light-mode',m==='light');
  document.body.classList.toggle('dark-mode',m==='dark');

  document.querySelectorAll('input[name="yardivoDarkStyle"]').forEach(x=>{
    if(x.value==='blue')x.checked=false;
    else x.checked=x.value===d;
  });
  document.querySelectorAll('.yardivo-dark-style-option').forEach(x=>{
    x.classList.toggle('active',normalizeDark(x.dataset.darkStyle)===d && x.dataset.darkStyle!=='blue');
  });
  document.querySelectorAll('#yardivoThemeSettingsV2 [data-dark-look]').forEach(x=>{
    x.classList.toggle('active',normalizeDark(x.dataset.darkLook)===d && x.dataset.darkLook!=='blue');
  });

  /* Canonical My Yard / War Room scene: always blue, never green. */
  try{
    const e=window.__YARDIVO_MYYARD_ENGINE__,T=window.__YARDIVO_THREE_MODULE__;
    if(e&&T){
      const c=0x10283a;
      e.scene.background=new T.Color(c);
      e.scene.fog=new T.FogExp2(c,.0065);
      e.renderer.toneMappingExposure=m==='light'?1.22:1.14;
    }
  }catch(_){}
}
function setDark(v){
  v=normalizeDark(v);
  localStorage.setItem(DARK,v);
  try{localStorage.setItem('yardivo_dark_style',v)}catch(_){}
  apply();
}
function cleanSettings(){
  const panel=document.getElementById('yardivoDarkStyleSettings');
  if(panel){
    const head=panel.querySelector('h2');
    const small=panel.querySelector('.panel-head small');
    if(head&&head.textContent!=='DARK MODE')head.textContent='DARK MODE';
    if(small&&small.textContent!=='Odaberi ORIGINAL PLAVI ili DARK GREY. Mape uvijek ostaju plave.')small.textContent='Odaberi ORIGINAL PLAVI ili DARK GREY. Mape uvijek ostaju plave.';
    const original=panel.querySelector('[data-dark-style="original"]');
    const graphite=panel.querySelector('[data-dark-style="graphite"]');
    if(original){
      const strong=original.querySelector('strong'), sm=original.querySelector('small');
      if(strong&&strong.textContent!=='ORIGINAL PLAVI')strong.textContent='ORIGINAL PLAVI';
      if(sm&&sm.textContent!=='Prvotni YARDIVO tamno-plavi izgled, bez zelenih detalja.')sm.textContent='Prvotni YARDIVO tamno-plavi izgled, bez zelenih detalja.';
    }
    if(graphite){
      const strong=graphite.querySelector('strong'), sm=graphite.querySelector('small');
      if(strong&&strong.textContent!=='DARK GREY')strong.textContent='DARK GREY';
      if(sm&&sm.textContent!=='Tamno-sivi izgled sa sitnim zelenim hover detaljima.')sm.textContent='Tamno-sivi izgled sa sitnim zelenim hover detaljima.';
    }
  }

  const v2=document.getElementById('yardivoThemeSettingsV2');
  if(v2){
    const title=v2.querySelector('.yt-title');
    if(title&&title.textContent!=='DARK MODE')title.textContent='DARK MODE';
    const original=v2.querySelector('[data-dark-look="original"]');
    const graphite=v2.querySelector('[data-dark-look="graphite"]');
    if(original&&original.textContent!=='ORIGINAL PLAVI')original.textContent='ORIGINAL PLAVI';
    if(graphite&&graphite.textContent!=='DARK GREY')graphite.textContent='DARK GREY';
  }
  apply();
}

document.addEventListener('change',e=>{
  const x=e.target.closest('input[name="yardivoDarkStyle"]');
  if(x){e.stopImmediatePropagation();setDark(x.value);}
},true);

document.addEventListener('click',e=>{
  const x=e.target.closest('.yardivo-dark-style-option[data-dark-style],#yardivoThemeSettingsV2 [data-dark-look]');
  if(!x)return;
  const v=x.dataset.darkStyle||x.dataset.darkLook;
  if(v==='blue')return;
  if(v==='original'||v==='graphite'){
    e.stopImmediatePropagation();
    setDark(v);
  }
},true);

window.addEventListener('load',()=>setTimeout(()=>{cleanSettings();apply()},500));
window.addEventListener('yardivo:login',()=>setTimeout(()=>{cleanSettings();apply()},80));
/* Do not observe the whole DOM here: cleanSettings() changes textContent itself,
   which can create a self-triggering MutationObserver loop and block Welcome timers. */
document.addEventListener('yardivo:settings-open',()=>{cleanSettings();apply();});

window.YardivoSimpleTheme={apply,setDark,getMain,getDark};
apply();
})();
