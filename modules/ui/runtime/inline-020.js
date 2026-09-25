(function(){
  function makeSafeStorage(kind){
    const fallback = new Map();
    function native(){
      try{
        const s = window[kind];
        const test='__yardivo_storage_test__';
        s.setItem(test,'1'); s.removeItem(test);
        return s;
      }catch(e){ return null; }
    }
    return {
      getItem(key){
        const s=native();
        if(s){ try{return s.getItem(key)}catch(e){} }
        return fallback.has(String(key)) ? fallback.get(String(key)) : null;
      },
      setItem(key,value){
        const s=native();
        if(s){ try{s.setItem(key,String(value));return}catch(e){} }
        fallback.set(String(key),String(value));
      },
      removeItem(key){
        const s=native();
        if(s){ try{s.removeItem(key)}catch(e){} }
        fallback.delete(String(key));
      },
      clear(){
        const s=native();
        if(s){ try{s.clear()}catch(e){} }
        fallback.clear();
      },
      key(index){
        const s=native();
        if(s){ try{return s.key(index)}catch(e){} }
        return Array.from(fallback.keys())[index] ?? null;
      },
      get length(){
        const s=native();
        if(s){ try{return s.length}catch(e){} }
        return fallback.size;
      }
    };
  }
  window.safeStorage=makeSafeStorage('localStorage');
  window.safeSessionStorage=makeSafeStorage('sessionStorage');
})();
