
(function(){
function ensure(){
 const chart=document.getElementById('overviewSupplierChart');if(!chart)return;
 const panel=chart.closest('.panel');if(!panel||panel.querySelector('.overview-reliability-legend-v2'))return;
 const x=document.createElement('div');x.className='overview-reliability-legend-v2';
 x.innerHTML='<i></i><strong>0–100% POUZDANOST</strong><span>crveno = rizično · žuto = srednje · zeleno = pouzdano</span><span>Formula: točnost 45% · uspjeh isporuke 25% · bez incidenata 15% · najavljen dolazak 5% · stabilnost termina 5% · završena evidencija 5%</span>';
 chart.insertAdjacentElement('beforebegin',x);
}
window.addEventListener('load',()=>setTimeout(ensure,900));
document.addEventListener('click',e=>{if(e.target.closest('[data-view="overview"],[data-home-target="overview"]'))setTimeout(ensure,100)},true);
})();
