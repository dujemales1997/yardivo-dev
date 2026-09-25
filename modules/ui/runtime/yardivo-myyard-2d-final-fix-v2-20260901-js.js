(function(){
'use strict';
const KEY='yardivo_myyard_view_mode_v2';

function setMode(mode){
  mode=mode==='2d'?'2d':'3d';
  const root=document.getElementById('myYard');
  if(!root)return;

  /* Enlarged view is intentionally 3D only. */
  if(document.body.classList.contains('yardivo-myyard-focus'))mode='3d';

  root.dataset.yardivoYardMode=mode;
  try{localStorage.setItem(KEY,mode)}catch(_){}

  root.querySelectorAll('[data-myy]').forEach(b=>{
    const on=b.dataset.myy===mode;
    b.classList.toggle('active',on);
    b.setAttribute('aria-pressed',on?'true':'false');
  });

  const world=root.querySelector('.myy-world');
  if(world){
    world.classList.toggle('d2',mode==='2d');
    world.classList.toggle('d3',mode==='3d');
    if(mode==='2d'){
      world.style.setProperty('display','block','important');
      world.style.setProperty('visibility','visible','important');
    }else{
      world.style.setProperty('display','none','important');
    }
  }

  const webgl=document.getElementById('yardivoMyYardWebGL');
  if(webgl){
    if(mode==='2d'){
      webgl.style.setProperty('display','none','important');
      webgl.style.setProperty('visibility','hidden','important');
    }else{
      webgl.style.setProperty('display','block','important');
      webgl.style.setProperty('visibility','visible','important');
    }
  }

  const help=root.querySelector('.myy-help');
  if(help)help.style.display=mode==='3d'?'block':'none';

  if(mode==='2d'){
    try{window.YardivoMyYard?.render?.()}catch(_){}
  }else{
    try{window.YardivoMyYardWebGL?.boot?.()}catch(_){}
    setTimeout(()=>{try{window.YardivoMyYardWebGL?.refresh?.()}catch(_){}},40);
  }
}

document.addEventListener('click',e=>{
  const b=e.target.closest?.('#myYard [data-myy]');
  if(!b)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  setMode(b.dataset.myy);
},true);

document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="myYard"],[data-home-target="myYard"]')){
    setTimeout(()=>{
      let mode='3d';
      try{mode=localStorage.getItem(KEY)==='2d'?'2d':'3d'}catch(_){}
      setMode(mode);
    },120);
  }
},true);

window.addEventListener('load',()=>setTimeout(()=>{
  const root=document.getElementById('myYard');
  if(!root)return;
  let mode='3d';
  try{mode=localStorage.getItem(KEY)==='2d'?'2d':'3d'}catch(_){}
  setMode(mode);
},1300),{once:true});

window.YardivoMyYardMode={set:setMode,current:()=>{
  try{return localStorage.getItem(KEY)==='2d'?'2d':'3d'}catch(_){return'3d'}
}};
})();
