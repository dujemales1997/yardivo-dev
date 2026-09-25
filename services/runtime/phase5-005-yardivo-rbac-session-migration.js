
(function(){
  try{
    const K='yardivo_rbac_session_migrated_20260831';
    if(localStorage.getItem(K)!=='1'){
      localStorage.removeItem('yardivo_custom_session');
      localStorage.removeItem('yardivo_remembered_session');
      sessionStorage.removeItem('studenac_demo_session');
      localStorage.setItem(K,'1');
    }
  }catch(e){}
})();
