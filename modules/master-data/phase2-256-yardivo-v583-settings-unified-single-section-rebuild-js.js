
(()=>{'use strict';
const $=id=>document.getElementById(id),SMART='yardivo_auto_replan_cfg_v1';
function dark(){return document.body.classList.contains('dark-mode')||document.documentElement.getAttribute('data-theme')==='dark'||document.documentElement.getAttribute('data-yardivo-main-theme')==='dark'}
function cfg(){try{return {...{enabled:false,mode:'PAUSED'},...JSON.parse(localStorage.getItem(SMART)||'{}')}}catch(_){return{enabled:false,mode:'PAUSED'}}}
function card(id,title,desc,button){
 const x=document.createElement('section');x.id=id;x.className='yv-unified-card';
 x.innerHTML=`<div class="yv-unified-row"><div><h3>${title}</h3><p>${desc}</p></div><button type="button" class="yv-unified-switch" id="${button}">OFF</button></div>`;
 return x;
}
function move(host,id){const x=$(id);if(x&&x.parentElement!==host)host.appendChild(x);if(x){x.hidden=false;x.style.setProperty('display','block','important')}return x}
function build(){
 const grid=$('settings')?.querySelector('.settings-grid');if(!grid)return;
 let host=$('yardivoUnifiedSettingsV583');
 if(!host){host=document.createElement('div');host.id='yardivoUnifiedSettingsV583';grid.prepend(host)}
 if(host.parentElement!==grid)grid.prepend(host);

 /* Ordinary Settings only. MASTER PODACI are owned by the Master workspace. */
 move(host,'yardivoFontSettings');
 if(!$('yardivoUnifiedThemeV583'))host.appendChild(card('yardivoUnifiedThemeV583','IZGLED APLIKACIJE','Original / Dark mode','yardivoUnifiedThemeSwitchV583'));
 move(host,'qrMobileSettingsPanel');
 move(host,'yardivoNonWorkingDaysSettings');
 move(host,'yardivoVoiceSettingsV583');
 if(!$('yardivoVoiceSettingsV583')&&!$('yardivoUnifiedVoiceV583'))host.appendChild(card('yardivoUnifiedVoiceV583','GLASOVNE NOTIFIKACIJE','Uključi ili isključi glasovne notifikacije.','yardivoUnifiedVoiceSwitchV583'));
 move(host,'yardivoSmartEngineSettingsV583');

 /* Master launcher stays visible for Admin; do not hide it. */
 const launch=$('yardivoMasterPopupLaunchV583');
 [...grid.children].forEach(x=>{
   if(x===host||x===launch||x.id==='yardivoMasterPopupV583')x.style.removeProperty('display');
 });
 render();
}
function render(){
 const t=$('yardivoUnifiedThemeSwitchV583');if(t){t.textContent=dark()?'DARK':'ORIGINAL';t.classList.toggle('on',dark())}
 
}
function toggleTheme(){
 const sw=document.querySelector('.theme-switch-wrap button,.theme-switch-wrap input');
 if(sw){sw.click();setTimeout(render,60);return}
 const d=!dark();document.body.classList.toggle('dark-mode',d);document.body.classList.toggle('light-mode',!d);document.documentElement.setAttribute('data-theme',d?'dark':'light');render()
}
function toggleSmart(){
 const c=cfg(),on=!!c.enabled&&c.mode!=='PAUSED';c.enabled=!on;c.mode=!on?'ASSIST':'PAUSED';
 localStorage.setItem(SMART,JSON.stringify(c));
 try{if(typeof putCloudState==='function')putCloudState(SMART,JSON.stringify(c))}catch(_){}
 try{window.YardivoSmartEngineSettingsV583?.applyState?.()}catch(_){}
 render()
}
document.addEventListener('click',e=>{
 if(e.target?.closest?.('#yardivoUnifiedThemeSwitchV583')){e.preventDefault();toggleTheme();return}

 if(e.target?.closest?.('[data-home-target="settings"],[data-view="settings"],[data-target="settings"],#navSettings'))setTimeout(build,0)
},true);
['yardivo:login','yardivo:data-synced','yardivo:master-data-ready','yardivo:master-data-changed'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(build,40)));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(build,1400),{once:true});else setTimeout(build,700);
window.YardivoUnifiedSettingsV583={build,render};
window.YARDIVO_DEV_BUILD='20260917-dev-v5.8.3-settings-unified-single-section-rebuild-final';
})();
