
(function(){
'use strict';
const BUILD='20260912-dev-v5.8.3-final-test';
const REQUIRED='admin1';
function validateAdmin(){
 const s=window.currentSession;if(!s)return;
 if(String(s.role||'').toLowerCase()==='admin'&&String(s.username||s.user||'').toLowerCase()!==REQUIRED){
   console.warn('[YARDIVO FINAL TEST] Admin identity is not admin1.');
 }
}
window.addEventListener('yardivo:login',()=>setTimeout(validateAdmin,80));
window.YARDIVO_DEV_BUILD=BUILD;
window.YardivoFinalTestV583={build:BUILD,requiredAdmin:REQUIRED};
})();
