(()=>{'use strict';
if(window.__YV_SIDEBAR_HOVER_DRAWER_V583__)return;
window.__YV_SIDEBAR_HOVER_DRAWER_V583__=true;

let closeTimer=0;
const body=()=>document.body;
function open(){
  clearTimeout(closeTimer);
  body()?.classList.add('yv-sidebar-hover-open');
}
function closeSoon(){
  clearTimeout(closeTimer);
  closeTimer=setTimeout(()=>body()?.classList.remove('yv-sidebar-hover-open'),110);
}
function ensure(){
  const side=document.querySelector('.sidebar');
  if(!side)return;

  /* Remove any legacy buttons if an older browser cache inserted them. */
  document.getElementById('yardivoSidebarHideBtn')?.remove();
  document.getElementById('yardivoSidebarShowBtn')?.remove();
  body()?.classList.remove('yv-sidebar-hidden');

  let zone=document.getElementById('yardivoSidebarHoverZone');
  if(!zone){
    zone=document.createElement('div');
    zone.id='yardivoSidebarHoverZone';
    zone.setAttribute('aria-hidden','true');
    document.body.appendChild(zone);
  }

  if(!zone.dataset.bound){
    zone.dataset.bound='1';
    zone.addEventListener('pointerenter',open,{passive:true});
    zone.addEventListener('mousemove',open,{passive:true});
  }
  if(!side.dataset.yvHoverBound){
    side.dataset.yvHoverBound='1';
    side.addEventListener('pointerenter',open,{passive:true});
    side.addEventListener('pointerleave',closeSoon,{passive:true});
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});
else ensure();
window.addEventListener('yardivo:login',ensure);
})();
