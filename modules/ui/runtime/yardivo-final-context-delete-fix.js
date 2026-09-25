(function(){
'use strict';
function closeMenu(){
  const m=document.getElementById('announcementContextMenu');
  if(m){m.classList.remove('open','show','visible');m.style.display='none';m.style.left='';m.style.top=''}
}
document.addEventListener('click',e=>{
  const menu=e.target.closest('#announcementContextMenu');
  if(!menu)closeMenu();
},false);
document.addEventListener('contextmenu',e=>{
  const block=e.target.closest('[data-announcement-id]');
  if(!block)return;
  const id=block.dataset.announcementId;
  try{contextAnnouncementId=id}catch(err){}
  try{contextId=id}catch(err){}
},true);
const del=document.getElementById('ctxDeleteAnnouncement');
if(del){
  del.addEventListener('click',e=>{
    e.preventDefault();e.stopImmediatePropagation();
    let id=null;
    try{id=contextAnnouncementId}catch(err){}
    if(id==null){try{id=contextId}catch(err){}}
    if(id!=null&&typeof window.deleteAnnouncement==='function')window.deleteAnnouncement(id);
    else closeMenu();
  },true);
}
window.YardivoContextMenuFix={close:closeMenu};
})();
