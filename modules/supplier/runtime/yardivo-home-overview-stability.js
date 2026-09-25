(function(){
'use strict';

function masterSupplierNames(){
  const set=new Set();
  try{
    if(Array.isArray(suppliers)){
      suppliers.forEach(s=>{
        if(typeof s==='string'&&s.trim())set.add(s.trim());
        else if(s&&typeof s==='object'){
          const n=s.name||s.supplier||s.supplierName||s.label||s.title;
          if(n)set.add(String(n).trim());
        }
      });
    }
  }catch(e){}
  try{(announcements||[]).forEach(a=>a?.supplier&&set.add(String(a.supplier).trim()))}catch(e){}
  try{(incidents||[]).forEach(i=>i?.supplier&&set.add(String(i.supplier).trim()))}catch(e){}
  return [...set].filter(Boolean).sort((a,b)=>a.localeCompare(b,'hr'));
}

function ensureOverviewAllSuppliers(){
  const select=document.getElementById('overviewSupplierSelect');
  if(!select)return;
  const names=masterSupplierNames();
  const current=select.value||'';
  const existing=[...select.options].slice(1).map(o=>o.value);
  const same=existing.length===names.length&&existing.every((v,i)=>v===names[i]);
  if(!same){
    select.innerHTML='<option value="">Svi dobavljači</option>'+names.map(n=>{
      const o=document.createElement('option');o.value=n;o.textContent=n;return o.outerHTML;
    }).join('');
    if(names.includes(current))select.value=current;
  }
}

function forceMasterOverview(){
  ensureOverviewAllSuppliers();
  try{
    if(window.YardivoOverviewMaster?.render)window.YardivoOverviewMaster.render();
  }catch(e){}
  ensureOverviewAllSuppliers();
}

function homeIsVisible(){
  const h=document.getElementById('homeMenu');
  return !!h&&(h.classList.contains('active')||document.body.classList.contains('home-menu-mode'));
}
function stabilizeHome(){
 try{window.YardivoRoleStableFinal?.apply?.()}catch(e){}
 const grid=document.getElementById('homeMenuGrid');
 if(grid){
   grid.querySelectorAll('.home-menu-card').forEach(card=>{
     card.style.removeProperty('width');
     card.style.removeProperty('height');
   });
 }
 document.documentElement.classList.add('yardivo-home-ready');
}

document.addEventListener('click',e=>{
  if(e.target.closest('[data-view="overview"],[data-home-target="overview"]'))setTimeout(forceMasterOverview,80);
  if(e.target.closest('[data-view="homeMenu"],[data-home-target="homeMenu"],.brand-home,.home-link'))stabilizeHome();
},true);

window.addEventListener('load',()=>{
  stabilizeHome();
  setTimeout(forceMasterOverview,900);
});

window.addEventListener('yardivo:view-opened',e=>{
 const view=e?.detail?.view;
 if(view==='homeMenu')stabilizeHome();
 if(view==='overview')setTimeout(forceMasterOverview,0);
});

window.YardivoOverviewSupplierLock={masterSupplierNames,ensureOverviewAllSuppliers,forceMasterOverview};
})();
