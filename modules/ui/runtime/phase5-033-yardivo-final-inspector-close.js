
(function(){
  document.getElementById('truckInspectorClose')?.addEventListener('click',function(e){
    e.preventDefault();e.stopPropagation();
    document.getElementById('truckInspector')?.classList.remove('open');
  });
})();
