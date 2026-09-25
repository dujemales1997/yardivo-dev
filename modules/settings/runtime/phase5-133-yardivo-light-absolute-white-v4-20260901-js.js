
(function(){
'use strict';
function enforce(){
  const html=document.documentElement,body=document.body;if(!body)return;
  const light=html.dataset.yardivoMainTheme==='light'||html.dataset.theme==='light';
  body.classList.toggle('light-mode',light);
  body.classList.toggle('dark-mode',!light);
  if(light)body.classList.remove('yardivo-light-green');
}
window.YardivoAbsoluteWhite={apply:enforce};
})();
