
(function(){
'use strict';
const BUILD='20260912-dev-v5.8.3-admin-global-scope-final';
function enforce(){
 const modal=document.getElementById('yardivoFixedUserModal');
 const title=String(document.getElementById('yufTitle')?.textContent||'').toUpperCase();
 const isAdmin=title.includes('ADMIN');
 if(modal)modal.dataset.roleAdmin=isAdmin?'1':'0';
 const scope=document.getElementById('yufScopeSection');
 if(scope&&isAdmin)scope.style.setProperty('display','none','important');
 document.getElementById('yardivoAdmin1MigrationBannerV583')?.remove();
}
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-yucr-role="admin"]'))setTimeout(enforce,20);
},true);
window.addEventListener('load',()=>setTimeout(enforce,300),{once:true});
window.addEventListener('yardivo:login',()=>setTimeout(enforce,120));
window.YardivoAdminGlobalScopeV583={enforce,build:BUILD};
window.YARDIVO_DEV_BUILD=BUILD;
})();
