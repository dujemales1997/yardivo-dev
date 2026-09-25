(function(){
'use strict';
function enhance(){
 const dlg=document.getElementById('driverAnnouncementDialog');if(!dlg)return;
 const form=document.getElementById('driverAnnouncementForm');if(!form)return;
 if(!dlg.querySelector('.yardivo-change-data-note')){
   const note=document.createElement('div');note.className='yardivo-change-data-note';
   note.innerHTML='<strong>PROMJENA VOZILA / VOZAČA</strong><br>Ako dobavljač naknadno javi drugo vozilo, registraciju ili drugog vozača, ovdje promijeni podatke i spremi. Promjena se evidentira u povijesti najave.';
   const info=document.getElementById('driverAnnouncementInfo');
   if(info)info.insertAdjacentElement('afterend',note); else form.prepend(note);
 }
 const title=dlg.querySelector('h2,h3,.dialog-title');
 if(title && /tablic|voza/i.test(title.textContent||''))title.textContent='PROMIJENI PODATKE VOZILA / VOZAČA';
 const save=form.querySelector('button[type="submit"]');if(save)save.textContent='SPREMI PROMJENU PODATAKA';
}
window.addEventListener('load',()=>setTimeout(enhance,800));
document.addEventListener('click',e=>{if(e.target.closest('[onclick*="openDriverAnnouncement"],#ctxDriverAnnouncement'))setTimeout(enhance,0)},true);
})();
