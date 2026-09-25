
(function(){
  'use strict';
  try{
    const FIRST='yardivo_first_theme_initialized_v1';
    if(localStorage.getItem(FIRST)!=='1'){
      localStorage.setItem('yardivo_main_theme_v2','dark');
      localStorage.setItem('yardivo_dark_look_v2','original');
      localStorage.setItem('yardivo_dark_style','original');
      localStorage.setItem('yardivo_ux_style_v1','original');
      localStorage.setItem(FIRST,'1');

      document.documentElement.setAttribute('data-yardivo-main-theme','dark');
      document.documentElement.setAttribute('data-yardivo-dark-look','original');
      document.documentElement.setAttribute('data-yardivo-ux','original');
    }
  }catch(_){}
})();
