
(function(){
 function decorate(){
   let list=[];try{list=announcements||[]}catch(e){}
   document.querySelectorAll('[data-announcement-id]').forEach(el=>{
     if(el.querySelector('.order-number-inline'))return;
     const a=list.find(x=>Number(x.id)===Number(el.dataset.announcementId));
     if(!a?.orderNumber)return;
     const chip=document.createElement('span');
     chip.className='order-number-inline';
     chip.textContent='Narudžba '+a.orderNumber;
     el.appendChild(chip);
   });
 }
 document.addEventListener('click',()=>setTimeout(decorate,50),true);
 window.addEventListener('load',()=>setTimeout(decorate,400));
 setInterval(decorate,3000);
})();
