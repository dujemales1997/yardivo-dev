(function(){
'use strict';
const MAIN='yardivo_main_theme_v2', DARK='yardivo_dark_look_v2';
function norm(v){return v==='graphite'?'graphite':'original'}
function apply(){
  const html=document.documentElement,body=document.body;if(!body)return;
  let main='dark',look='original';
  try{
    const m=localStorage.getItem(MAIN); main=m==='light'?'light':'dark';
    look=norm(localStorage.getItem(DARK)||localStorage.getItem('yardivo_dark_style'));
    localStorage.setItem(DARK,look);localStorage.setItem('yardivo_dark_style',look);
  }catch(_){}
  html.dataset.yardivoMainTheme=main;
  html.dataset.theme=main;
  html.dataset.yardivoDarkLook=look;
  body.classList.toggle('dark-mode',main==='dark');
  body.classList.toggle('light-mode',main==='light');
}
document.addEventListener('click',e=>{
  const x=e.target.closest?.('.yardivo-dark-style-option[data-dark-style],#yardivoThemeSettingsV2 [data-dark-look]');
  if(!x)return;
  const v=x.dataset.darkStyle||x.dataset.darkLook;
  if(v!=='original'&&v!=='graphite')return;
  try{
    localStorage.setItem(DARK,norm(v));
    localStorage.setItem('yardivo_dark_style',norm(v));
  }catch(_){}
  setTimeout(apply,0);
},true);
document.addEventListener('change',e=>{
  const x=e.target.closest?.('input[name="yardivoDarkStyle"]');
  if(!x)return;
  try{
    localStorage.setItem(DARK,norm(x.value));
    localStorage.setItem('yardivo_dark_style',norm(x.value));
  }catch(_){}
  setTimeout(apply,0);
},true);
window.addEventListener('load',()=>setTimeout(apply,250),{once:true});
window.addEventListener('yardivo:login',()=>setTimeout(apply,50));
window.YardivoDarkPaletteIsolation={apply};
})();
