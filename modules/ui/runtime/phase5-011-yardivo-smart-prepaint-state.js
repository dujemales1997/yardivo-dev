
(function(){
  try{
    const c=JSON.parse(localStorage.getItem('yardivo_auto_replan_cfg_v1')||'{}');
    const on=c.enabled===true && c.mode!=='PAUSED';
    document.documentElement.classList.toggle('yardivo-smart-off',!on);
    document.documentElement.classList.toggle('yardivo-smart-on',on);
  }catch(e){
    document.documentElement.classList.add('yardivo-smart-off');
  }
})();
