
(function(){
  const toggle=document.getElementById('themeToggle');
  if(!toggle)return;

  function storageGet(k){
    try{
      if(typeof safeStorage!=='undefined'&&safeStorage?.getItem)return safeStorage.getItem(k);
      return localStorage.getItem(k);
    }catch(e){return null}
  }
  function storageSet(k,v){
    try{
      if(typeof safeStorage!=='undefined'&&safeStorage?.setItem)return safeStorage.setItem(k,v);
      localStorage.setItem(k,v);
    }catch(e){}
  }
  function applyTheme(theme){
    const light=theme==='light';
    document.body.classList.toggle('light-mode',light);
    toggle.checked=light;
    document.documentElement.style.colorScheme=light?'light':'dark';
    storageSet('yardivo_theme',light?'light':'dark');
  }

  const saved=storageGet('yardivo_theme');
  const initial=saved==='light'?'light':'dark';
  applyTheme(initial);

  toggle.addEventListener('change',()=>applyTheme(toggle.checked?'light':'dark'));
})();
