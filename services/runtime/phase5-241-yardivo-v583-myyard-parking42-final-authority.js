
(function(){
'use strict';
window.__YARDIVO_V583_MYYARD_PARKING42__='20260915-dev-v5.8.3-myyard-parking42-dock-confirmation';
function cleanLegacy(){document.querySelectorAll('#myYard *').forEach(el=>{if(el.children.length===0&&/^NN\s*\/\s*NN$/i.test((el.textContent||'').trim()))el.remove()})}
document.addEventListener('click',e=>{if(e.target.closest('[data-view="myYard"]'))requestAnimationFrame(cleanLegacy)},true);
window.addEventListener('yardivo:context-changed',()=>{try{window.YardivoMyYard?.render?.()}catch(e){};requestAnimationFrame(cleanLegacy)});
window.addEventListener('load',()=>setTimeout(cleanLegacy,250));
})();
