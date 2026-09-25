
(function(){
'use strict';
window.yardivoLocalDateV583=function(input){
  const d=input instanceof Date?input:new Date(input==null?Date.now():input);
  if(Number.isNaN(d.getTime()))return '';
  return String(d.getFullYear()).padStart(4,'0')+'-'+
         String(d.getMonth()+1).padStart(2,'0')+'-'+
         String(d.getDate()).padStart(2,'0');
};
})();
