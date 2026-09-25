(function(){
'use strict';
function btn(){return document.getElementById('yardivoFullscreenBtn')}
function active(){return !!(document.fullscreenElement||document.webkitFullscreenElement)}
async function enter(){
  const el=document.documentElement;
  try{
    if(el.requestFullscreen)await el.requestFullscreen();
    else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();
  }catch(e){
    try{showYmsToast?.('warning','FULL SCREEN','Browser nije dopustio full screen. Klikni gumb ponovno.')}catch(err){}
  }
  update();
}
async function exit(){
  try{
    if(document.exitFullscreen)await document.exitFullscreen();
    else if(document.webkitExitFullscreen)document.webkitExitFullscreen();
  }catch(e){}
  update();
}
function toggle(){return active()?exit():enter()}
function update(){
  const b=btn();if(!b)return;
  const on=active();
  const icon=b.querySelector('.fs-icon'),label=b.querySelector('.fs-label');
  if(icon)icon.textContent=on?'🗗':'⛶';
  if(label)label.textContent=on?'IZLAZ FULL SCREEN':'FULL SCREEN';
  b.title=on?'Izađi iz full screena':'Full screen';
  b.setAttribute('aria-label',b.title);
}
document.addEventListener('click',e=>{
  if(!e.target.closest('#yardivoFullscreenBtn'))return;
  e.preventDefault();e.stopPropagation();toggle();
},true);
document.addEventListener('fullscreenchange',update);
document.addEventListener('webkitfullscreenchange',update);
window.addEventListener('load',update);
window.YardivoFullscreen={toggle,enter,exit,active};
})();
