(function(){
'use strict';
const MAIN='yardivo_main_theme_v2', DARK='yardivo_dark_look_v2';
function currentMain(){const v=localStorage.getItem(MAIN);return v==='light'||v==='dark'?v:(document.body.classList.contains('light-mode')?'light':'dark')}
function currentDark(){
 let v=localStorage.getItem(DARK);
 if(!['blue','graphite','original'].includes(v)){
   try{v=localStorage.getItem('yardivo_dark_style')}catch(_){}
 }
 return ['blue','graphite','original'].includes(v)?v:'original';
}
function apply(){
 const m=currentMain(),d=currentDark();
 localStorage.setItem(MAIN,m);localStorage.setItem(DARK,d);
 if(document.documentElement.dataset.yardivoMainTheme!==m)document.documentElement.dataset.yardivoMainTheme=m;
 if(document.documentElement.dataset.yardivoDarkLook!==d)document.documentElement.dataset.yardivoDarkLook=d;
 if(document.body.classList.contains('light-mode')!==(m==='light'))document.body.classList.toggle('light-mode',m==='light');
 if(document.body.classList.contains('dark-mode')!==(m==='dark'))document.body.classList.toggle('dark-mode',m==='dark');
 // Keep legacy controller synchronized, otherwise it can overwrite the new option.
 try{localStorage.setItem('yardivo_dark_style',d)}catch(_){}
 document.querySelectorAll('input[name="yardivoDarkStyle"]').forEach(x=>x.checked=x.value===d);
 document.querySelectorAll('.yardivo-dark-style-option').forEach(x=>x.classList.toggle('active',x.dataset.darkStyle===d));
 document.querySelectorAll('#yardivoThemeSettingsV2 [data-dark-look]').forEach(x=>x.classList.toggle('active',x.dataset.darkLook===d));
}
document.addEventListener('change',e=>{
 const x=e.target.closest('input[name="yardivoDarkStyle"]');
 if(!x)return;
 const v=['blue','graphite','original'].includes(x.value)?x.value:'original';
 localStorage.setItem(DARK,v);localStorage.setItem('yardivo_dark_style',v);
 apply();
 try{window.YardivoThemeV2?.setDark?.(v)}catch(_){}
},true);
document.addEventListener('click',e=>{
 const x=e.target.closest('.yardivo-dark-style-option[data-dark-style]');
 if(!x)return;
 const v=x.dataset.darkStyle;
 if(['blue','graphite','original'].includes(v)){
   localStorage.setItem(DARK,v);localStorage.setItem('yardivo_dark_style',v);apply();
   try{window.YardivoThemeV2?.setDark?.(v)}catch(_){}
 }
},true);
window.addEventListener('load',()=>setTimeout(apply,250));
window.addEventListener('yardivo:login',()=>setTimeout(apply,50));
let __yvThemeObserverBusy=false;
new MutationObserver(()=>{
 if(__yvThemeObserverBusy)return;
 __yvThemeObserverBusy=true;
 requestAnimationFrame(()=>{
   __yvThemeObserverBusy=false;
   const m=currentMain(),d=currentDark();
   if(document.documentElement.dataset.yardivoMainTheme!==m ||
      document.documentElement.dataset.yardivoDarkLook!==d) apply();
 });
}).observe(document.documentElement,{attributes:true,attributeFilter:['data-yardivo-main-theme','data-yardivo-dark-look']});
window.YardivoCanonicalTheme={apply,currentMain,currentDark};
apply();
})();
