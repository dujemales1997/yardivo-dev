
(function(){'use strict';
const NK='yardivo_live_notifications_v1';let currentNotifId='';
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function loadN(){try{const a=JSON.parse(localStorage.getItem(NK)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}
function saveN(a){localStorage.setItem(NK,JSON.stringify(a));try{if(typeof putCloudState==='function')putCloudState(NK,JSON.stringify(a))}catch(_){}}
function delN(id){if(!id)return;const next=loadN().filter(n=>String(n.id)!==String(id));saveN(next);try{window.YardivoNotifications?.render?.()}catch(_){ }document.getElementById('yardivoNotifReaderV5')?.classList.remove('open');document.body.style.overflow='';}
function decorateHistory(){document.querySelectorAll('#yardivoNotificationHistory [data-y5-history]').forEach(card=>{if(card.querySelector('.y583-notif-delete'))return;const b=document.createElement('button');b.type='button';b.className='y583-notif-delete';b.textContent='IZBRIŠI';b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();delN(card.dataset.y5History)});const meta=card.querySelector('.y5-history-meta')||card;meta.appendChild(b)})}
function decorateReader(){const m=document.getElementById('yardivoNotifReaderV5');if(!m?.classList.contains('open'))return;const h=m.querySelector('.y5-reader-head');if(!h||h.querySelector('.y583-reader-actions'))return;const close=h.querySelector('.y5-reader-close');const wrap=document.createElement('div');wrap.className='y583-reader-actions';const del=document.createElement('button');del.type='button';del.className='y583-notif-delete';del.textContent='IZBRIŠI';del.onclick=e=>{e.preventDefault();e.stopPropagation();delN(currentNotifId)};if(close){close.remove();wrap.append(del,close)}else wrap.append(del);h.appendChild(wrap)}
document.addEventListener('pointerdown',e=>{const c=e.target.closest?.('[data-y5-history],[data-y5-bell]');if(c)currentNotifId=c.dataset.y5History||c.dataset.y5Bell||''},true);
document.addEventListener('click',e=>{const c=e.target.closest?.('[data-y5-history]');if(!c||e.target.closest('.y583-notif-delete'))return;currentNotifId=c.dataset.y5History||'';try{window.YardivoNotifications?.open?.(currentNotifId,true)}catch(_){}},true);
let moQueued=false;
const mo=new MutationObserver(()=>{
  if(moQueued)return;
  moQueued=true;
  requestAnimationFrame(()=>{moQueued=false;decorateHistory();decorateReader();ensureScannerButton()});
});
mo.observe(document.documentElement,{subtree:true,childList:true});
/* Low-frequency safety refresh only; normal updates are mutation-driven. */
setInterval(()=>{decorateHistory();decorateReader()},10000);
function ensureScannerButton(){document.getElementById('yardivoScannerOpenV583')?.remove()}
function glow(){
  if(matchMedia('(pointer:coarse)').matches)return;
  let g=document.getElementById('yardivoCursorGlowV583');
  if(!g){g=document.createElement('div');g.id='yardivoCursorGlowV583';document.body.prepend(g)}
  let x=-9999,y=-9999,raf=0,active=false;
  const draw=()=>{raf=0;g.style.transform=`translate3d(${x-210}px,${y-210}px,0)`};
  document.addEventListener('pointermove',e=>{
    x=e.clientX;y=e.clientY;
    if(!active){active=true;document.body.classList.add('yardivo-glow-active')}
    if(!raf)raf=requestAnimationFrame(draw);
  },{passive:true});
  document.addEventListener('pointerleave',()=>{
    active=false;document.body.classList.remove('yardivo-glow-active');
  },{passive:true});
}
window.addEventListener('load',()=>{setTimeout(()=>{ensureScannerButton();decorateHistory();glow()},400)});
window.YardivoNotificationUXV583={delete:delN,decorate:decorateHistory};
})();
