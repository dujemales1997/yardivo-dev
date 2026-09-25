
(()=>{'use strict';
if(window.YardivoDbStatusAuthorityV583)return;
let lastText='',lastCls='',lastOk=0;
function ensureEl(){
 let el=document.getElementById('yardivoDbStatus');
 if(!el){
   el=document.createElement('div');
   el.id='yardivoDbStatus';
   el.setAttribute('aria-live','polite');
   document.body?.appendChild(el);
 }
 return el;
}
function set(text,cls='',detail='',source='sync'){
 const now=Date.now();if(cls==='ok')lastOk=now;
 if((cls==='warn'||cls==='bad')&&source!=='health'&&now-lastOk<12000)return;
 const el=ensureEl();if(!el)return;
 text=String(text||'');cls=String(cls||'');detail=String(detail||'');
 if(text===lastText&&cls===lastCls&&el.title===detail)return;
 lastText=text;lastCls=cls;el.className=cls;el.textContent=text;el.title=detail;
}
window.YardivoDbStatusAuthorityV583={set,ensureEl,lastOk:()=>lastOk};
})();
