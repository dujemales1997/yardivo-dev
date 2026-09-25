
(function(){
'use strict';
function cleanup(){
  document.getElementById('yardivoThemePresetBox')?.remove();
  document.documentElement.removeAttribute('data-theme-preset');
  try{localStorage.removeItem('yardivo_theme_preset_v1')}catch(e){}
  const b=document.getElementById('yardivoThemeSwitch');
  if(b){
    b.style.display='flex';
    b.removeAttribute('hidden');
    b.setAttribute('aria-hidden','false');
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cleanup,{once:true});else cleanup();
window.addEventListener('load',cleanup);
})();
