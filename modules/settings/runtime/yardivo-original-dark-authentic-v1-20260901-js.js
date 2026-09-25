(function(){
'use strict';
const UX='yardivo_ux_style_v1';

function isOriginalDark(){
  return document.documentElement.dataset.yardivoMainTheme==='dark' &&
         document.documentElement.dataset.yardivoDarkLook==='original';
}

function applyAuthenticOriginal(){
  const original=isOriginalDark();

  if(original){
    /* Original dark means the actual original YARDIVO UI, not professional UX
       recolored blue. */
    try{localStorage.setItem(UX,'original')}catch(_){}
    document.documentElement.dataset.yardivoUx='original';

    [
      'yardivo-professional-redesign-v1-20260831',
      'yardivo-professional-redesign-v2-20260831'
    ].forEach(id=>{
      const s=document.getElementById(id);
      if(s)s.disabled=true;
    });

    /* Canonical My Yard / War Room scene returns to original blue. */
    try{
      const e=window.__YARDIVO_MYYARD_ENGINE__;
      const T=window.__YARDIVO_THREE_MODULE__;
      if(e&&T){
        const c=0x173348;
        e.scene.background=new T.Color(c);
        if(e.scene.fog)e.scene.fog.color=new T.Color(c);
        e.renderer.toneMappingExposure=1.18;
      }
    }catch(_){}
  }else{
    /* Light and Dark Grey continue using the simplified professional UI. */
    try{localStorage.setItem(UX,'professional')}catch(_){}
    document.documentElement.dataset.yardivoUx='professional';
    [
      'yardivo-professional-redesign-v1-20260831',
      'yardivo-professional-redesign-v2-20260831'
    ].forEach(id=>{
      const s=document.getElementById(id);
      if(s)s.disabled=false;
    });
  }
}

window.addEventListener('load',()=>setTimeout(applyAuthenticOriginal,80),{once:true});
window.addEventListener('yardivo:login',()=>setTimeout(applyAuthenticOriginal,50));

document.addEventListener('click',e=>{
  const x=e.target.closest?.(
    '.yardivo-dark-style-option[data-dark-style],#yardivoThemeSettingsV2 [data-dark-look]'
  );
  if(!x)return;
  setTimeout(applyAuthenticOriginal,0);
},true);

document.addEventListener('change',e=>{
  if(e.target?.matches?.('input[name="yardivoDarkStyle"]')){
    setTimeout(applyAuthenticOriginal,0);
  }
},true);

/* Main Light/Dark switch may change datasets without using the dark-style controls. */
window.addEventListener('storage',e=>{
  if(e.key==='yardivo_main_theme_v2'||e.key==='yardivo_dark_look_v2'){
    setTimeout(applyAuthenticOriginal,0);
  }
});

window.YardivoAuthenticOriginalTheme={apply:applyAuthenticOriginal};
setTimeout(applyAuthenticOriginal,0);
})();
