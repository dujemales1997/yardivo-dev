
(function(){
  const old=window.openYardivoTruckInspector;
  if(typeof old==='function'){
    window.openYardivoTruckInspector=function(a){
      old(a);
      const p=document.getElementById('truckInspector');
      if(p){
        p.classList.add('open');
        p.style.display='block';
        p.style.visibility='visible';
        p.style.opacity='1';
        p.setAttribute('aria-hidden','false');
      }
    };
  }
})();
