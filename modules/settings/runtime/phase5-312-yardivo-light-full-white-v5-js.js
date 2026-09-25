
(function(){
'use strict';
if(window.__YARDIVO_LIGHT_FULL_WHITE_V5__)return;
window.__YARDIVO_LIGHT_FULL_WHITE_V5__=true;
function apply(){
  const root=document.documentElement,body=document.body;if(!body)return;
  const light=root.dataset.yardivoMainTheme==='light'||root.dataset.theme==='light';
  body.classList.toggle('light-mode',light);
  body.classList.toggle('dark-mode',!light);
  if(light)body.classList.remove('yardivo-light-green');
}
window.YardivoLightFullWhiteV5={apply};
})();
