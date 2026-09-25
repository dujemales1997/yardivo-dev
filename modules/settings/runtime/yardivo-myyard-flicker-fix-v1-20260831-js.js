(function(){
'use strict';
let last='';
function desired(){
 return document.documentElement.dataset.yardivoUx==='original' ? 'original' : 'professional';
}
function apply(force){
 const m=desired();if(!force&&m===last)return;
 const e=window.__YARDIVO_MYYARD_ENGINE__,T=window.__YARDIVO_THREE_MODULE__;if(!e||!T)return;
 last=m;
 const col=m==='original'?0xcfdad3:0x263c31;
 e.scene.background=new T.Color(col);
 e.scene.fog=new T.FogExp2(col,.0065);
 e.renderer.toneMappingExposure=m==='original'?1.22:1.18;
}
window.YardivoMyYardStableLighting={apply};
window.addEventListener('load',()=>setTimeout(()=>apply(true),1600));
document.addEventListener('click',e=>{
 if(e.target.closest('[data-view="myYard"],[data-home-target="myYard"],#yardivoUxStyleSetting'))setTimeout(()=>apply(true),180);
},true);
new MutationObserver(()=>apply(false)).observe(document.documentElement,{attributes:true,attributeFilter:['data-yardivo-ux']});
})();
