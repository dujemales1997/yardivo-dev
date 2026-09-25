
(function(){
  const sel=document.getElementById('overviewSupplierSelect');
  if(sel && !sel.dataset.bound){
    sel.dataset.bound='1';
    sel.addEventListener('change',()=>{try{renderOverview()}catch(e){console.error(e)}});
  }
})();
