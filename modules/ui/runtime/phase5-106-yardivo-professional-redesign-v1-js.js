
(function(){
 document.documentElement.dataset.yardivoDesign='professional-v1';
 function polish(){
   document.querySelectorAll('button').forEach(b=>{if(!b.title&&b.textContent.trim().length<3)b.setAttribute('aria-label',b.textContent.trim()||'Akcija')});
 }
 window.addEventListener('load',polish);
})();
