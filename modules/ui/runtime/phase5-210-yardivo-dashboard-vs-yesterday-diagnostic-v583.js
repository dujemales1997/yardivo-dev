
(function(){
'use strict';
window.YardivoDashboardVsYesterdayV583={
  previousDate:function(date){
    try{return dashboardPreviousDate(date||window.yardivoLocalDateV583())}catch(_){return null}
  },
  refresh:function(){try{renderDashboardSimple()}catch(_){}}
};
})();
