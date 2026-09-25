
(function(){
'use strict';
function ping(){window.dispatchEvent(new CustomEvent('yardivo:overview-refresh'))}
window.addEventListener('yardivo:data-synced',()=>setTimeout(ping,120));
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="overview"],[data-home-target="overview"]'))setTimeout(ping,180);
},true);
})();
