(function(){
'use strict';
function findAnnouncement(id){
  try{return (Array.isArray(window.announcements)?window.announcements:(typeof announcements!=='undefined'&&Array.isArray(announcements)?announcements:[])).find(x=>String(x?.id)===String(id))||null}catch(_){return null}
}
function openPdfFromButton(b){
  if(!b)return false;
  const a=findAnnouncement(b.dataset.yardivoDoc);
  if(!a)return false;
  try{
    if(window.YardivoSupplierAttachments?.has?.(a)||a.attachmentDataUrl||a.documentDataUrl||a.attachmentUrl||a.documentUrl){
      window.YardivoSupplierAttachments?.open?.(a);
      return true;
    }
  }catch(err){console.error('YARDIVO PDF open',err)}
  return false;
}
/* Capture before Daily/Weekly card click handlers so folder always means PDF, never appointment detail. */
document.addEventListener('click',function(e){
  const b=e.target?.closest?.('#dailyMapBoard .yardivo-doc-icon[data-yardivo-doc],#weeklyMapBoard .yardivo-doc-icon[data-yardivo-doc]');
  if(!b)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  openPdfFromButton(b);
},true);
/* Keyboard accessibility follows the exact same PDF-first behavior. */
document.addEventListener('keydown',function(e){
  if(e.key!=='Enter'&&e.key!==' ')return;
  const b=e.target?.closest?.('#dailyMapBoard .yardivo-doc-icon[data-yardivo-doc],#weeklyMapBoard .yardivo-doc-icon[data-yardivo-doc]');
  if(!b)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  openPdfFromButton(b);
},true);
})();
