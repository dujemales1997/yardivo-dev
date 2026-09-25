
(function(){
'use strict';
let angle=-11, selected='', drag=null;

function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function stats(){
 try{
   if(window.YardivoOverviewReliability?.supplierStats)return window.YardivoOverviewReliability.supplierStats();
 }catch(_){}
 try{
   const sel=document.getElementById('overviewSupplierSelect');
   const names=[...sel.options].map(o=>o.value).filter(Boolean);
   const a=Array.isArray(window.announcements)?window.announcements:(typeof announcements!=='undefined'?announcements:[]);
   const inc=Array.isArray(window.incidents)?window.incidents:(typeof incidents!=='undefined'?incidents:[]);
   if(typeof supplierStat==='function')return names.map(n=>supplierStat(n,a,inc));
 }catch(_){}
 return [];
}
function color(p){
 p=Number(p)||0;
 return p>=80?'#2fa45d':p>=55?'#d59a2d':'#cf5058';
}
function ensure(){
 const view=document.getElementById('overview');if(!view)return null;
 let root=document.getElementById('overviewSupplier3D');
 if(root)return root;
 root=document.createElement('section');
 root.id='overviewSupplier3D';
 root.innerHTML=`
  <div class="ov3d-head">
    <div><h2>3D POUZDANOST DOBAVLJAČA</h2><small>Stupčasti pregled ocjene dobavljača · povuci lijevo/desno za rotaciju</small></div>
    <div class="ov3d-controls">
      <button type="button" data-ov3d-left aria-label="Rotiraj lijevo">←</button>
      <button type="button" data-ov3d-reset aria-label="Vrati prikaz">↺</button>
      <button type="button" data-ov3d-right aria-label="Rotiraj desno">→</button>
    </div>
  </div>
  <div class="ov3d-stage" tabindex="0" aria-label="3D graf pouzdanosti dobavljača">
    <div class="ov3d-world">
      <div class="ov3d-floor"></div>
      <div class="ov3d-bars"></div>
    </div>
  </div>
  <div class="ov3d-detail"></div>
  <div class="ov3d-hint">Klikni stupac za detalje dobavljača · ← / → ili povlačenje = rotacija</div>`;
 const firstPanel=view.querySelector('.panel');
 if(firstPanel)firstPanel.insertAdjacentElement('afterend',root);else view.prepend(root);

 const stage=root.querySelector('.ov3d-stage');
 stage.addEventListener('pointerdown',e=>{
   if(e.button!==0)return;drag={x:e.clientX,a:angle};stage.setPointerCapture?.(e.pointerId);
 });
 stage.addEventListener('pointermove',e=>{
   if(!drag)return;angle=Math.max(-32,Math.min(32,drag.a+(e.clientX-drag.x)*.08));applyAngle(root);
 });
 stage.addEventListener('pointerup',()=>drag=null);
 stage.addEventListener('pointercancel',()=>drag=null);
 stage.addEventListener('keydown',e=>{
   if(e.key==='ArrowLeft'){angle=Math.max(-32,angle-4);applyAngle(root)}
   if(e.key==='ArrowRight'){angle=Math.min(32,angle+4);applyAngle(root)}
 });
 root.querySelector('[data-ov3d-left]').onclick=()=>{angle=Math.max(-32,angle-5);applyAngle(root)};
 root.querySelector('[data-ov3d-right]').onclick=()=>{angle=Math.min(32,angle+5);applyAngle(root)};
 root.querySelector('[data-ov3d-reset]').onclick=()=>{angle=-11;applyAngle(root)};
 return root;
}
function applyAngle(root){
 root?.querySelector('.ov3d-world')?.style.setProperty('--ov3d-rz',angle+'deg');
}
function render(){
 const root=ensure();if(!root)return;
 let data=stats().filter(x=>x&&x.reliability!=null);
 if(!data.length){
   root.querySelector('.ov3d-bars').innerHTML='<div style="padding:40px;color:var(--theme-muted)">Nema dovoljno podataka za 3D graf.</div>';
   root.querySelector('.ov3d-detail').innerHTML='';
   return;
 }
 data=data.sort((a,b)=>(b.reliability||0)-(a.reliability||0)).slice(0,10);
 if(!selected||!data.some(x=>x.name===selected))selected=data[0].name;

 const bars=root.querySelector('.ov3d-bars');
 bars.innerHTML=data.map(x=>{
   const h=Math.max(12,Math.round((Number(x.reliability)||0)*1.55));
   return `<div class="ov3d-item ${x.name===selected?'selected':''}" data-supplier="${esc(x.name)}">
     <div class="ov3d-bar3" style="--h:${h}px;--bar:${color(x.reliability)}">
       <div class="ov3d-face ov3d-front"></div>
       <div class="ov3d-face ov3d-side"></div>
       <div class="ov3d-face ov3d-top"></div>
     </div>
     <div class="ov3d-score">${x.reliability}% · ${x.score10??Math.round(x.reliability/10)}/10</div>
     <div class="ov3d-name">${esc(x.name)}</div>
   </div>`;
 }).join('');
 bars.querySelectorAll('.ov3d-item').forEach(el=>el.onclick=()=>{selected=el.dataset.supplier;render()});

 const x=data.find(d=>d.name===selected)||data[0];
 root.querySelector('.ov3d-detail').innerHTML=`
   <div class="ov3d-kpi"><small>DOBAVLJAČ</small><strong>${esc(x.name)}</strong></div>
   <div class="ov3d-kpi"><small>POUZDANOST</small><strong>${x.reliability}%</strong></div>
   <div class="ov3d-kpi"><small>OCJENA</small><strong>${x.score10??Math.round(x.reliability/10)}/10</strong></div>
   <div class="ov3d-kpi"><small>NA VRIJEME</small><strong>${x.punctuality==null?'—':x.punctuality+'%'}</strong></div>
   <div class="ov3d-kpi"><small>INCIDENTI</small><strong>${x.incidents??0}</strong></div>`;
 applyAngle(root);
}
window.YardivoOverview3D={render};
window.addEventListener('load',()=>setTimeout(render,500));
window.addEventListener('yardivo:login',()=>setTimeout(render,250));
document.addEventListener('click',e=>{
 if(e.target?.closest?.('[data-view="overview"],[data-home-target="overview"]'))setTimeout(render,80);
});
setInterval(()=>{
 const v=document.getElementById('overview');
 if(v?.classList.contains('active'))render();
},5000);
})();
