
(function(){
'use strict';
function bridge(){
  const htmlLight=document.documentElement.getAttribute('data-theme')==='light';
  const bodyLight=document.body.classList.contains('light-mode');
  /* Existing theme controller is authoritative; this only keeps the two legacy
     theme markers synchronized so every old CSS module receives light mode. */
  if(htmlLight && !bodyLight)document.body.classList.add('light-mode');
  if(bodyLight && !htmlLight)document.documentElement.setAttribute('data-theme','light');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bridge,{once:true});else bridge();
window.addEventListener('load',bridge);
new MutationObserver(bridge).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
new MutationObserver(bridge).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
