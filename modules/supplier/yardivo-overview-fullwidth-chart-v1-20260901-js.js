
(function(){
'use strict';
let raf=0,wheelBound=false;

function esc(v){
  return String(v??'').replace(/[&<>"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}
function color(v){
  if(v==null||!Number.isFinite(Number(v)))return '#aeb8bf';
  const n=Math.max(0,Math.min(100,Number(v)));
  return `hsl(${Math.round(n*1.2)} 76% ${n>=75?39:44}%)`;
}
function statsRows(){
  try{
    const x=window.YardivoOverviewMaster?.currentStats?.();
    return Array.isArray(x)?x:[];
  }catch(e){
    console.warn('Overview supplier graph stats',e);
    return [];
  }
}
function allSupplierNames(){
  try{
    const d=JSON.parse(localStorage.getItem('yardivo_master_data_registry_v583')||'{}');
    if(Array.isArray(d.suppliers)){
      return d.suppliers
        .filter(x=>x&&x.active!==false&&String(x.name||'').trim())
        .map(x=>String(x.name).trim())
        .sort((a,b)=>a.localeCompare(b,'hr'));
    }
  }catch(_){}
  return [];
}
function mergedRows(){
  const stats=statsRows();
  const byName=new Map(stats.filter(Boolean).map(x=>[String(x.name||'').trim(),x]));

  return allSupplierNames().map(name=>{
    const x=byName.get(name);
    if(x)return x;
    return {
      name,
      reliability:null,
      score10:null,
      evaluated:0,
      total:0,
      noInfo:true
    };
  }).sort((a,b)=>{
    /* Suppliers without information start on the left at zero.
       Rated suppliers then rise naturally from weakest to strongest. */
    const ai=a.reliability==null?-1:Number(a.reliability);
    const bi=b.reliability==null?-1:Number(b.reliability);
    return ai-bi || String(a.name).localeCompare(String(b.name),'hr');
  });
}
function bindHorizontalWheel(){
  if(wheelBound)return;
  const scroller=document.getElementById('overviewFullChartScroll');
  if(!scroller)return;
  wheelBound=true;

  scroller.addEventListener('wheel',e=>{
    /* Normal mouse wheel moves this wide supplier graph horizontally.
       Ctrl+wheel is left untouched for browser zoom conventions. */
    if(e.ctrlKey)return;
    const max=scroller.scrollWidth-scroller.clientWidth;
    if(max<=0)return;

    const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
    if(!delta)return;

    e.preventDefault();
    scroller.scrollLeft+=delta;
  },{passive:false});
}
function renderNow(){
  raf=0;
  const host=document.getElementById('overviewFullSupplierBars');
  if(!host)return;

  const sel=document.getElementById('overviewSupplierSelect');
  const selected=sel?.value||'';
  const data=mergedRows();

  const subtitle=document.getElementById('overviewFullChartSubtitle');
  if(subtitle){
    const rated=data.filter(x=>x.reliability!=null).length;
    const noInfo=data.length-rated;
    subtitle.textContent=
      `${data.length} dobavljača u sustavu · ${rated} s izračunatom pouzdanošću · ${noInfo} bez podataka · kotačić miša = lijevo/desno`;
  }

  if(!data.length){
    host.innerHTML='<div class="overview-empty">Nema dobavljača za prikaz.</div>';
    return;
  }

  /* One physical column for every supplier in the system; never truncate. */
  host.style.minWidth=Math.max(1200,data.length*92)+'px';
  host.innerHTML=data.map(x=>{
    const hasInfo=x.reliability!=null && Number.isFinite(Number(x.reliability));
    const r=hasInfo?Math.max(0,Math.min(100,Number(x.reliability))):0;
    const c=color(hasInfo?r:null);
    const pct=hasInfo?`${Math.round(r)}%`:'NEMA INFO';
    const score=hasInfo && x.score10!=null?`${x.score10}/10`:'—';
    const cls=(selected===x.name?' selected':'')+(hasInfo?' has-info':' no-info');

    return `<div class="overview-full-bar-item${cls}" data-overview-full-supplier="${esc(x.name)}"
      title="${esc(x.name)} · ${hasInfo?(Math.round(r)+'% · '+score):'Nema info / nema obrađenih najava'}">
      <div class="overview-full-bar-value" style="color:${c}">${pct}</div>
      <div class="overview-full-bar-track" aria-label="${esc(x.name)}">
        <div class="overview-full-bar" style="height:${r}%;--bar:${c};background:${c}"></div>
        ${hasInfo?'':'<div class="overview-full-no-info-zero">0</div>'}
      </div>
      <div class="overview-full-bar-score">${score}</div>
      <div class="overview-full-bar-name">${esc(x.name)}</div>
    </div>`;
  }).join('');

  host.querySelectorAll('[data-overview-full-supplier]').forEach(el=>{
    el.addEventListener('click',()=>{
      const name=el.dataset.overviewFullSupplier||'';
      if(sel && [...sel.options].some(o=>o.value===name)){
        sel.value=name;
        try{window.YardivoOverviewMaster?.render?.()}catch(_){}
        schedule();
      }
    });
  });

  bindHorizontalWheel();
}
function schedule(){
  if(raf)return;
  raf=requestAnimationFrame(renderNow);
}

window.addEventListener('load',()=>setTimeout(schedule,900),{once:true});
window.addEventListener('yardivo:data-synced',schedule);
window.addEventListener('yardivo:overview-refresh',schedule);
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="overview"],[data-home-target="overview"]'))setTimeout(schedule,80);
},true);
document.addEventListener('change',e=>{
  if(e.target?.id==='overviewSupplierSelect')schedule();
},true);

window.YardivoOverviewFullChart={render:schedule,rows:mergedRows};
})();
