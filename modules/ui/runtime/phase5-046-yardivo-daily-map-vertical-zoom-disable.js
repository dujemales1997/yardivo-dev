
(function(){
 const old=window.applyDailyMapZoom;
 window.applyDailyMapZoom=function(){
   const board=document.getElementById('dailyMapBoard');
   if(board?.querySelector('.daily-map-vertical-grid')){
     const inner=board.closest('.daily-map-inner');
     if(inner){inner.style.transform='none';inner.style.zoom='1'}
     return;
   }
   if(typeof old==='function')return old.apply(this,arguments);
 };
})();
