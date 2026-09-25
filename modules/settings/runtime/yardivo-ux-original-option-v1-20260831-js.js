(function(){
'use strict';
const KEY='yardivo_ux_style_v1';
function mode(){return localStorage.getItem(KEY)||'professional'}
function apply(v){
 v=(v==='original')?'original':'professional';
 localStorage.setItem(KEY,v);
 document.documentElement.dataset.yardivoUx=v;
 // Disable/enable the actual style sheets so original CSS is truly restored.
 ['yardivo-professional-redesign-v1-20260831','yardivo-professional-redesign-v2-20260831'].forEach(id=>{
   const s=document.getElementById(id);if(s)s.disabled=(v==='original');
 });
 document.querySelectorAll('#yardivoUxStyleSetting button[data-ux]').forEach(b=>b.classList.toggle('active',b.dataset.ux===v));
}
function inject(){
 const settings=document.getElementById('settings');if(!settings||document.getElementById('yardivoUxStyleSetting'))return;
 // Place in appearance/theme area when available; otherwise inside Settings.
 const anchors=[...settings.querySelectorAll('h2,h3,h4,label,div')];
 let target=anchors.find(x=>/izgled|appearance|tema|dark|svijetl/i.test((x.textContent||'').trim()) && x.children.length<12);
 let parent=target?.closest('.settings-card,.card,.panel')||settings.querySelector('.settings-card,.card,.panel')||settings;
 const box=document.createElement('div');box.id='yardivoUxStyleSetting';
 box.innerHTML='<div class="yv-ux-title">UX IZGLED</div><div class="yv-ux-options"><button type="button" data-ux="professional">PROFESSIONAL UX</button><button type="button" data-ux="original">ORIGINAL YARDIVO</button></div><div style="margin-top:7px;font-size:9px;opacity:.68">Original YARDIVO vraća originalne boje i izgled, uključujući originalni Dark Mode.</div>';
 parent.appendChild(box);
 box.addEventListener('click',e=>{const b=e.target.closest('button[data-ux]');if(b)apply(b.dataset.ux)});
 apply(mode());
}
apply(mode());
window.addEventListener('load',()=>setTimeout(inject,350));
document.addEventListener('click',e=>{if(e.target.closest('[data-view="settings"],[data-home-target="settings"]'))setTimeout(inject,100)},true);
/* stability: settings inject is load/click driven */
window.YardivoUxStyle={apply,mode};
})();
