
(function(){
'use strict';
const CFG_KEY='yardivo_auto_replan_cfg_v1';
function role(){try{return String(window.currentSession?.role||'').toLowerCase().trim()}catch(_){return''}}
function cfg(){try{return {enabled:true,mode:'AUTO_SAFE',lateThreshold:20,horizonMinutes:240,maxShiftMinutes:240,scanSeconds:30,...JSON.parse(localStorage.getItem(CFG_KEY)||'{}')}}catch(_){return {enabled:true,mode:'AUTO_SAFE'}}}
function isOn(c=cfg()){return c.enabled!==false&&c.mode!=='PAUSED'}
function apply(c){
  const on=isOn(c);
  document.documentElement.classList.toggle('yardivo-smart-off',!on);
  document.documentElement.classList.toggle('yardivo-smart-on',on);
  try{window.YardivoSmartReplanning?.applyState?.()}catch(_){}
  const nav=document.querySelector('.nav-btn[data-view="smartReplanning"]');
  if(nav)nav.style.setProperty('display',on?'':'none',on?'':'important');
  if(!on){
    const v=document.getElementById('smartReplanning');
    if(v){v.classList.remove('active');v.style.setProperty('display','none','important')}
    document.getElementById('yardivoAutoReplanAlertStack')?.replaceChildren();
  }
}
function save(on){
  if(role()!=='admin')return;
  const c=cfg();c.enabled=!!on;c.mode=on?'AUTO_SAFE':'PAUSED';
  localStorage.setItem(CFG_KEY,JSON.stringify(c));
  apply(c);
  window.dispatchEvent(new StorageEvent('storage',{key:CFG_KEY,newValue:JSON.stringify(c)}));
}
function render(){
  const p=document.getElementById('yardivoSmartAdminSettings');if(!p)return;
  const on=isOn();
  const x=document.getElementById('yardivoSmartAdminToggle'),s=document.getElementById('yardivoSmartAdminStatus');
  if(x)x.checked=on;
  if(s){s.textContent=on?'UKLJUČENO':'ISKLJUČENO';s.style.color=on?'#61d98c':'#ff7078'}
}
function inject(){
  const root=document.querySelector('#settings .settings-grid');if(!root)return;
  let p=document.getElementById('yardivoSmartAdminSettings');
  if(role()!=='admin'){if(p)p.remove();return}
  if(!p){
    p=document.createElement('section');p.className='panel';p.id='yardivoSmartAdminSettings';
    p.innerHTML='<div class="panel-head"><div><h2>YARDIVO SMART PREPORUKE</h2><small>Admin kontrola automatskih preporuka i preplaniranja</small></div><span id="yardivoSmartAdminStatus"></span></div><div class="master-settings-body"><div class="ysas-row"><div class="ysas-copy"><strong>Automatske Smart preporuke</strong><small>Kada je isključeno, YARDIVO ne prikazuje Smart preporuke, ne pokreće automatsko preplaniranje i ne generira Smart upozorenja. Samo Admin može promijeniti ovu postavku.</small></div><label class="ysas-switch" title="Uključi / isključi YARDIVO Smart preporuke"><input id="yardivoSmartAdminToggle" type="checkbox"><span class="ysas-slider"></span></label></div></div>';
    root.prepend(p);
    document.getElementById('yardivoSmartAdminToggle').addEventListener('change',e=>{save(e.target.checked);render()});
  }
  render();
}
document.addEventListener('click',e=>{if(e.target.closest('[data-view="settings"],[data-home-target="settings"]'))setTimeout(inject,30)});
window.addEventListener('load',()=>setTimeout(()=>{apply(cfg());inject()},1900));

window.YardivoSmartAdminSettings={inject,save,render};
})();
