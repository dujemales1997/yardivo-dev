
(function(){
 document.documentElement.dataset.yardivoDesign='professional-v2';
 function enhance(){
   document.querySelectorAll('table').forEach(t=>t.setAttribute('data-yv-ui','operations-table'));
   document.querySelectorAll('.kpi-card,.metric-card,.summary-card').forEach(x=>x.setAttribute('data-yv-ui','metric'));
 }
 window.addEventListener('load',enhance);
 /* YARDIVO V5.8.3 stability: global enhance observer removed; load/click hooks are sufficient. */
})();
