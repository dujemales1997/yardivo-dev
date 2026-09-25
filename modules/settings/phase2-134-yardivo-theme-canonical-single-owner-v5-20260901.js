
(function(){
'use strict';

const MAIN='yardivo_main_theme_v2';
let locked=false;

function read(){
  try{
    const v=localStorage.getItem(MAIN);
    if(v==='light'||v==='dark')return v;
  }catch(_){}
  return document.body?.classList.contains('light-mode')?'light':'dark';
}
function paintSwitch(theme){
  const sw=document.getElementById('yardivoThemeSwitch');
  if(!sw)return;
  const thumb=sw.querySelector('.theme-thumb');
  if(thumb)thumb.textContent=theme==='light'?'☀️':'🌙';
  sw.dataset.theme=theme;
  sw.setAttribute('aria-label',theme==='light'?'Light mode — prebaci na Dark':'Dark mode — prebaci na Light');
  sw.title=theme==='light'?'Light mode':'Dark mode';
}
function apply(theme,save=true){
  theme=theme==='light'?'light':'dark';
  const html=document.documentElement,body=document.body;
  if(!body)return;

  if(save){
    try{
      localStorage.setItem(MAIN,theme);
      localStorage.setItem('yardivo_theme_v3',theme);
      localStorage.setItem('yardivo_theme_v2',theme);
      localStorage.setItem('yardivo_theme',theme);
      localStorage.setItem('theme',theme);
    }catch(_){}
  }

  html.classList.add('yardivo-theme-switching');
  html.dataset.yardivoMainTheme=theme;
  html.dataset.theme=theme;
  html.dataset.yardivoTheme=theme;
  html.style.colorScheme=theme;
  html.classList.toggle('light-mode',theme==='light');
  html.classList.toggle('dark-mode',theme==='dark');
  body.classList.toggle('light-mode',theme==='light');
  body.classList.toggle('dark-mode',theme==='dark');
  body.classList.remove('yardivo-light-green');

  paintSwitch(theme);

  /* Synchronize small controllers only; light paint is CSS-only. */
  try{window.YardivoSimpleTheme?.apply?.()}catch(_){}
  try{window.YardivoDarkPaletteIsolation?.apply?.()}catch(_){}
  requestAnimationFrame(()=>requestAnimationFrame(()=>html.classList.remove('yardivo-theme-switching')));
}
function toggle(){
  if(locked)return;
  locked=true;
  apply(read()==='light'?'dark':'light',true);
  setTimeout(()=>locked=false,180);
}

/* Exact event ownership:
   only the actual #yardivoThemeSwitch element can toggle the theme.
   No text scan, no closest() over unrelated controls, no global DOM observer. */
document.addEventListener('pointerup',e=>{
  const sw=document.getElementById('yardivoThemeSwitch');
  if(!sw || e.target!==sw)return;
  if(e.button!==0 && e.pointerType!=='touch')return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  toggle();
},true);

/* Suppress the synthetic click that follows pointerup so legacy click handlers cannot run. */
document.addEventListener('click',e=>{
  const sw=document.getElementById('yardivoThemeSwitch');
  if(!sw || e.target!==sw)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
},true);

document.addEventListener('keydown',e=>{
  const sw=document.getElementById('yardivoThemeSwitch');
  if(!sw || e.target!==sw || (e.key!=='Enter'&&e.key!==' '))return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  toggle();
},true);

window.addEventListener('load',()=>apply(read(),false),{once:true});
window.addEventListener('yardivo:login',()=>setTimeout(()=>apply(read(),false),60));

window.YardivoMainTheme={apply,toggle,current:read};
apply(read(),false);
})();
