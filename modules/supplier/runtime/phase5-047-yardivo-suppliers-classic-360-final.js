
(function(){
  function showAll(){
    try{reloadAnnouncementsFromPersistentStorage?.()}catch(e){}
    try{window.renderSuppliers(document.getElementById('supplierPretraži')?.value||'')}catch(e){}
  }
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="suppliers"],[data-home-target="suppliers"],#backToSuppliers'))setTimeout(showAll,25);
    const b=e.target.closest('#supplierGrid .supplier-info-btn');
    if(b){
      e.preventDefault();e.stopImmediatePropagation();
      const card=b.closest('.supplier-click-card'),idx=Number(card?.dataset.supplierIndex);
      const name=card?.dataset.supplierName||(Number.isInteger(idx)?suppliers[idx]:'');
      if(name)openSupplierProfile(name);
    }
  },true);
  window.addEventListener('load',()=>setTimeout(showAll,120));
  window.YardivoSuppliersClassic={showAll};
})();
