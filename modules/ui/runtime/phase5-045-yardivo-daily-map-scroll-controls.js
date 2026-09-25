
(function(){
  function shell(){
    const b=document.getElementById('dailyMapBoard');
    return b?.closest('.daily-map-shell')||b?.parentElement;
  }
  // Shift + mouse wheel also moves the timeline horizontally.
  document.addEventListener('wheel',e=>{
    const s=shell(); if(!s||!s.contains(e.target)||!e.shiftKey)return;
    if(s.scrollWidth<=s.clientWidth)return;
    e.preventDefault();s.scrollLeft+=e.deltaY||e.deltaX;
  },{passive:false});
  window.YardivoDailyMapScroll={
    start:()=>{const s=shell();if(s)s.scrollLeft=0},
    end:()=>{const s=shell();if(s)s.scrollLeft=s.scrollWidth}
  };
})();
