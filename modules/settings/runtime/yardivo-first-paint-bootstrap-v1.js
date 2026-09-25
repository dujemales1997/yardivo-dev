(function(){
 try{
   var main=localStorage.getItem('yardivo_main_theme_v2')||'dark';
   var dark=localStorage.getItem('yardivo_dark_look_v2')||'original';
   if(main!=='light'&&main!=='dark')main='dark';
   if(['graphite','blue','original'].indexOf(dark)<0)dark='original';
   document.documentElement.classList.add('yardivo-booting');
   document.documentElement.classList.toggle('light-mode',main==='light');
   document.documentElement.classList.toggle('dark-mode',main==='dark');
   document.documentElement.setAttribute('data-yardivo-main-theme',main);
   document.documentElement.setAttribute('data-theme',main);
   document.documentElement.setAttribute('data-yardivo-theme',main);
   document.documentElement.setAttribute('data-yardivo-dark-look',dark);
   document.documentElement.style.colorScheme=main;
 }catch(e){
   document.documentElement.classList.add('yardivo-booting');
   document.documentElement.setAttribute('data-yardivo-main-theme','dark');
   document.documentElement.setAttribute('data-yardivo-dark-look','original');
 }
})();
