
(()=>{
  const root=document.documentElement;
  const isOn=()=>root.dataset.yardivoMainTheme==='dark' && ['black','silver','steel'].includes(root.dataset.yardivoDarkPalette||'');
  const palette=()=>{
    const v=root.dataset.yardivoDarkPalette;
    return v==='black'?{s1:'#0d0f11',s2:'#111315',line:'#30353a',accent:'#707981',muted:'#9da5ab'}:
      v==='silver'?{s1:'#23292e',s2:'#2a3137',line:'#4b555e',accent:'#a5b0b8',muted:'#b8c0c6'}:
      {s1:'#172028',s2:'#1c2730',line:'#374852',accent:'#7897a8',muted:'#a2b2bb'};
  };
  const blueish=(c)=>{
    const m=String(c||'').match(/rgba?\((\d+)[, ]+(\d+)[, ]+(\d+)/i);if(!m)return false;
    const [r,g,b]=m.slice(1).map(Number);return b>=55 && b>r*1.18 && b>g*1.06;
  };
  const touched=new WeakMap();
  const touchedEls=new Set();
  function paint(el){
    if(!isOn()||!el||el.nodeType!==1)return;
    if(el.matches?.('.success,.danger,.warning,.error,.destructive,[data-status="success"],[data-status="danger"],[data-status="warning"],.status-green,.status-red,.status-amber'))return;
    const cs=getComputedStyle(el), p=palette();
    const rec=touched.get(el)||{};
    let changed=false;
    const set=(prop,val)=>{if(!(prop in rec))rec[prop]=el.style.getPropertyValue(prop);el.style.setProperty(prop,val,'important');changed=true};
    if(blueish(cs.backgroundColor)) set('background-color',p.s1);
    if(blueish(cs.borderTopColor)||blueish(cs.borderRightColor)||blueish(cs.borderBottomColor)||blueish(cs.borderLeftColor)) set('border-color',p.line);
    if(blueish(cs.color) && !el.closest?.('.status,.badge,.pill,.legend')) set('color',p.muted);
    if(changed){touched.set(el,rec);touchedEls.add(el)}
  }
  function restore(el){
    const rec=touched.get(el);if(!rec)return;
    for(const [prop,val] of Object.entries(rec)){if(val)el.style.setProperty(prop,val);else el.style.removeProperty(prop)}
    touched.delete(el);touchedEls.delete(el);
  }
  function sweep(){
    if(!document.body)return;
    if(isOn()){
      paint(document.body);
      document.body.querySelectorAll('*').forEach(paint);
    }else{
      Array.from(touchedEls).forEach(restore);
    }
  }
  const obs=new MutationObserver(ms=>{if(!isOn())return;for(const m of ms)for(const n of m.addedNodes){if(n.nodeType===1){paint(n);n.querySelectorAll?.('*').forEach(paint)}}});
  function boot(){if(!document.body)return;obs.observe(document.body,{childList:true,subtree:true});sweep()}
  const mo=new MutationObserver(()=>requestAnimationFrame(sweep));
  mo.observe(root,{attributes:true,attributeFilter:['data-yardivo-main-theme','data-yardivo-dark-palette']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.YardivoFullPalettePaint={apply:sweep};
})();
