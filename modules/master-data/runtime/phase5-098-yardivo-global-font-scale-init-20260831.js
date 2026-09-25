
(function(){
'use strict';
function apply(){
 let p=100;
 try{p=Number((window.safeStorage||localStorage).getItem('yardivo_master_font_v1')||100)}catch(e){}
 p=Math.max(80,Math.min(150,p||100));
 document.documentElement.style.setProperty('--yardivo-ui-scale',String(p/100));
 document.documentElement.dataset.yardivoFontScale=String(p);
}
apply();
window.addEventListener('load',apply);
})();
