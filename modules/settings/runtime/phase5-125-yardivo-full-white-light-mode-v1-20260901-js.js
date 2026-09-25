
(function(){
'use strict';
function normalize(){
  const html=document.documentElement,body=document.body;if(!body)return;
  const ds=html.dataset.yardivoMainTheme||html.dataset.theme||'';
  const light=ds==='light'||html.classList.contains('light-mode')||body.classList.contains('light-mode');
  if(light){
    html.dataset.yardivoMainTheme='light';
    html.dataset.theme='light';
    html.classList.add('light-mode');
    html.classList.remove('dark-mode');
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
  }
}
window.addEventListener('yardivo:theme-change',normalize);
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-theme],[data-yardivo-theme],#themeToggle,#themeSwitch'))setTimeout(normalize,0);
},true);
window.addEventListener('load',normalize,{once:true});
})();
