
(function(){
'use strict';
const BASE_KEY='yardivo_dark_style_v1';

function role(){
 let r=String(window.currentSession?.role||window.currentSession?.app_role||'').trim().toLowerCase();
 if(r==='zalihe'||r==='upravljanje zalihama')r='inventory';
 if(r==='prijam')r='reception';
 if(r==='porta'||r==='portir')r='gate';
 return r;
}
function user(){
 return String(window.currentSession?.username||window.currentSession?.user||'guest').trim().toLowerCase()||'guest';
}
function key(){return BASE_KEY+'_'+user()}
function getChoice(){
 try{
   const v=localStorage.getItem(key())||localStorage.getItem(BASE_KEY)||'blue';
   return v==='graphite'?'graphite':'blue';
 }catch(_){return 'blue'}
}
function saveChoice(v){
 v=['blue','graphite','original'].includes(v)?v:'original';
 try{localStorage.setItem(key(),v)}catch(_){}
 apply(v);
}
function apply(v=getChoice()){
 const graphite=v==='graphite';
 document.body.classList.toggle('yardivo-dark-graphite',graphite);
 document.body.dataset.yardivoDarkStyle=graphite?'graphite':'blue';
 const box=document.getElementById('yardivoDarkStyleSettings');
 if(box){
   box.querySelectorAll('.yardivo-dark-style-option').forEach(el=>{
     const yes=el.dataset.darkStyle===v;
     el.classList.toggle('selected',yes);
     const input=el.querySelector('input');
     if(input)input.checked=yes;
   });
   const state=box.querySelector('#yardivoDarkStyleState');
   if(state)state.textContent=v==='graphite'?'CRNO-SIVI':'PLAVI';
 }
}
function ensureSettings(){
 const r=role();
 if(!['admin','inventory','reception'].includes(r)){
   document.getElementById('yardivoDarkStyleSettings')?.remove();
   return;
 }
 if(document.getElementById('yardivoDarkStyleSettings')){apply();return}
 const settings=document.getElementById('settings');
 if(!settings)return;

 const panel=document.createElement('section');
 panel.id='yardivoDarkStyleSettings';
 panel.className='panel';
 panel.innerHTML=`
   <div class="panel-head">
     <div>
       <h2>IZGLED DARK MODEA</h2>
       <small>Odaberi stil tamne teme. Light mode ostaje potpuno svijetli.</small>
     </div>
     <span class="master-sync-state ok" id="yardivoDarkStyleState"></span>
   </div>
   <div class="master-settings-body">
     <div class="yardivo-dark-style-options">
       <label class="yardivo-dark-style-option blue" data-dark-style="blue">
         <input type="radio" name="yardivoDarkStyle" value="blue">
         <strong>ORIGINAL PLAVI</strong>
         <small>Originalni YARDIVO tamnoplavi izgled.</small>
       </label>
       <label class="yardivo-dark-style-option graphite" data-dark-style="graphite">
         <input type="radio" name="yardivoDarkStyle" value="graphite">
         <strong>DARK GREY</strong>
         <small>Crna i grafitno-siva tema bez plavih površina.</small>
       </label>
       <label class="yardivo-dark-style-option original" data-dark-style="original">
         <input type="radio" name="yardivoDarkStyle" value="original">
         <strong>ORIGINAL PLAVI</strong>
         <small>Prvotni YARDIVO izgled: duboki tamno-plavi tonovi i originalni plavi naglasci.</small>
       </label>
     </div>
     <div class="yardivo-dark-style-note">Postavka se pamti posebno za prijavljenog korisnika na ovom uređaju.</div>
   </div>`;

 /* Place it near the top of Settings, after the font section when possible. */
 const fontRange=document.getElementById('fontRange');
 const fontPanel=fontRange?.closest('section.panel');
 if(fontPanel?.parentNode)fontPanel.insertAdjacentElement('afterend',panel);
 else settings.prepend(panel);

 panel.addEventListener('change',e=>{
   const input=e.target.closest('input[name="yardivoDarkStyle"]');
   if(input)saveChoice(input.value);
 });
 panel.querySelectorAll('.yardivo-dark-style-option').forEach(el=>{
   el.addEventListener('click',()=>saveChoice(el.dataset.darkStyle));
 });
 apply();
}
function refresh(){
 apply();
 ensureSettings();
}
window.YardivoDarkStyle={apply,refresh,getChoice,set:saveChoice};

if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,120),{once:true});
}else setTimeout(refresh,120);
window.addEventListener('load',()=>setTimeout(refresh,200));
window.addEventListener('yardivo:login',()=>setTimeout(refresh,50));
document.addEventListener('click',e=>{
 if(e.target?.closest?.('[data-view="settings"],[data-home-target="settings"]'))setTimeout(refresh,60);
});
/* Settings is dynamically rebuilt by older modules, so recreate only when needed. */
new MutationObserver(()=>{
 if(document.getElementById('settings') && ['admin','inventory','reception'].includes(role()) &&
    !document.getElementById('yardivoDarkStyleSettings')){
   setTimeout(ensureSettings,20);
 }
}).observe(document.body,{childList:true,subtree:true});
})();
