
(function(){
'use strict';
let firing=false;

function norm(v){
  v=String(v||'').trim().toLowerCase();
  if(v==='voditelj'||v==='management')return'manager';
  if(v==='prijam')return'reception';
  if(v==='porta'||v==='portir')return'gate';
  if(v==='zalihe'||v==='upravljanje zalihama')return'inventory';
  return v;
}
function role(){
  try{return norm((typeof currentSession!=='undefined'?currentSession:window.currentSession)?.role)}
  catch(e){return norm(window.currentSession?.role)}
}
function admin(){return role()==='admin'}

function native(){return document.getElementById('muSave')}
function visible(el){
  if(!el)return false;
  const r=el.getBoundingClientRect();
  const s=getComputedStyle(el);
  return r.width>20&&r.height>20&&s.display!=='none'&&s.visibility!=='hidden'&&r.bottom>0&&r.top<innerHeight;
}
function invoke(){
  if(firing)return;
  if(!admin()){alert('Samo Admin može kreirati korisničke profile.');return}
  const api=window.YardivoServerProfiles;
  if(!api||typeof api.create!=='function'){
    alert('Modul za kreiranje korisnika nije učitan. Napravi Ctrl+F5.');
    return;
  }
  firing=true;
  const p=document.getElementById('yardivoMuSaveProxy');
  const b=native();
  if(p){p.disabled=true;p.textContent='KREIRAM PROFIL...'}
  if(b){b.disabled=true;b.textContent='KREIRAM PROFIL...'}
  Promise.resolve(api.create()).catch(err=>{
    console.error('YARDIVO create profile',err);
    alert('Kreiranje korisnika nije uspjelo: '+(err?.message||err));
  }).finally(()=>{
    firing=false;
    if(p){p.disabled=false;p.textContent='KREIRAJ KORISNIČKI PROFIL'}
    if(b){b.disabled=false;b.removeAttribute('disabled');b.textContent='KREIRAJ KORISNIČKI PROFIL'}
    sync();
  });
}
function proxy(){
  let p=document.getElementById('yardivoMuSaveProxy');
  if(!p){
    p=document.createElement('button');
    p.id='yardivoMuSaveProxy';
    p.type='button';
    p.textContent='KREIRAJ KORISNIČKI PROFIL';
    p.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();invoke()},true);
    document.body.appendChild(p);
  }
  return p;
}
function sync(){
  const b=native(),p=proxy();
  if(!admin()||!visible(b)){
    p.style.display='none';
    return;
  }
  b.type='button';
  b.disabled=false;
  b.removeAttribute('disabled');
  b.removeAttribute('inert');
  b.style.setProperty('pointer-events','auto','important');
  b.style.setProperty('opacity','1','important');
  b.style.setProperty('visibility','visible','important');
  b.textContent='KREIRAJ KORISNIČKI PROFIL';

  const r=b.getBoundingClientRect();
  p.style.left=r.left+'px';
  p.style.top=r.top+'px';
  p.style.width=r.width+'px';
  p.style.height=r.height+'px';
  p.style.display='flex';
}

/* Direct native binding, in case no overlay exists. */
document.addEventListener('click',e=>{
  if(e.target?.closest?.('#muSave')){
    e.preventDefault();e.stopPropagation();
    invoke();
  }
},true);

/* Coordinate fallback: catches the click even when another transparent element is on top. */
document.addEventListener('click',e=>{
  if(!admin())return;
  const b=native();
  if(!visible(b))return;
  const r=b.getBoundingClientRect();
  if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){
    if(e.target?.closest?.('#yardivoMuSaveProxy,#muSave'))return;
    e.preventDefault();e.stopPropagation();
    invoke();
  }
},true);

window.addEventListener('scroll',sync,true);
window.addEventListener('resize',sync);
window.addEventListener('yardivo:login',()=>setTimeout(sync,100));
window.addEventListener('load',()=>{setTimeout(sync,300);setTimeout(sync,1200)});
document.addEventListener('click',e=>{
  if(e.target?.closest?.('[data-view="settings"],[data-home-target="settings"]')){
    setTimeout(sync,60);setTimeout(sync,250);
  }
},true);
setInterval(sync,700);

window.YardivoCreateProfileV548={sync,invoke};
})();
