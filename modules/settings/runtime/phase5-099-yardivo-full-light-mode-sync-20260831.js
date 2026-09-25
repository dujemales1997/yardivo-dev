
(function(){
'use strict';
function sync(){
 const light=document.body.classList.contains('light-mode');
 document.documentElement.classList.toggle('yardivo-full-light',light);
 document.documentElement.dataset.yardivoTheme=light?'light':'dark';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
window.addEventListener('load',sync);
document.addEventListener('change',e=>{
 if(e.target?.id==='yardivoThemeSwitch'||e.target?.closest?.('#yardivoThemeSwitch'))setTimeout(sync,0);
});
new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
