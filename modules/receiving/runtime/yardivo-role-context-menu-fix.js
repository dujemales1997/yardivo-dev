(function(){
  function role(){
    let r='';try{r=String(currentSession?.role||'').toLowerCase().trim()}catch(e){}
    if(r==='upravljanje zalihama'||r==='zalihe')r='inventory';
    if(r==='prijam')r='reception';
    if(r==='porta'||r==='portir')r='gate';
    return r;
  }
  function closeAllMenus(){
    const ids=['announcementContextMenu','contextMenu','appointmentContextMenu'];
    ids.forEach(id=>{const el=document.getElementById(id);if(el){el.style.display='none';el.classList.remove('show','open','visible')}});
    document.querySelectorAll('.context-menu.show,.context-menu.open,[data-announcement-context-menu]').forEach(el=>{
      el.style.display='none';el.classList.remove('show','open','visible');
    });
    // Clear legacy selection from previous role.
    try{window.contextAnnouncementId=null}catch(e){}
    try{window.selectedAnnouncementId=null}catch(e){}
  }

  // Inventory-only actions may only be exposed while actually logged in as Inventory.
  function enforceMenuPermissions(){
    const r=role();
    const menu=document.getElementById('announcementContextMenu');
    if(!menu)return;
    if(r!=='inventory'){
      menu.querySelectorAll('[data-action="edit"],[data-action="plates"],[data-action="driver"],.inventory-only,.stock-only').forEach(el=>el.style.display='none');
    }
  }

  // Any navigation closes the old role's contextual UI.
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view],[data-home-target],#logoutBtn,.logout,.btn-logout,[data-action="logout"]'))closeAllMenus();
  },true);

  // Critical fix: context menu opening is role-checked every time, not only when the page was initially rendered.
  const oldOpen=window.openAnnouncementContextMenu;
  if(typeof oldOpen==='function'){
    window.openAnnouncementContextMenu=function(ev,id){
      closeAllMenus();
      const r=role();
      // Reception should use its status buttons/cards, not Inventory's appointment editing menu.
      if(r==='reception'||r==='gate'){
        ev?.preventDefault?.();ev?.stopPropagation?.();
        return false;
      }
      const result=oldOpen.apply(this,arguments);
      enforceMenuPermissions();
      return result;
    };
  }

  // Detect login role/session changes and clean transient UI immediately.
  function onRoleChanged(){
    document.body.classList.add('yardivo-role-switching');
    closeAllMenus();
    setTimeout(()=>document.body.classList.remove('yardivo-role-switching'),80);
  }
  window.addEventListener('yardivo:login',onRoleChanged);
  window.addEventListener('yardivo:view-opened',closeAllMenus);

  window.addEventListener('storage',closeAllMenus);
  window.YardivoRoleMenuFix={close:closeAllMenus,enforce:enforceMenuPermissions};
})();
