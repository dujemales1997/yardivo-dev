
(function(){
 const input=document.getElementById('annOrderSuffix');
 if(input){
   input.addEventListener('change',()=>{input.value=String(input.value||'').trim()});
 }
})();
