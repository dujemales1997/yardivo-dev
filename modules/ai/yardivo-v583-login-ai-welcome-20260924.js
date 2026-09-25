
(()=>{'use strict';
if(window.__YARDIVO_LOGIN_AI_WELCOME_20260924__)return;
window.__YARDIVO_LOGIN_AI_WELCOME_20260924__=true;
let seq=0;
function role(){let r=String(window.currentSession?.app_role||window.currentSession?.role||'').trim().toLowerCase();if(r==='voditelj'||r==='management')r='manager';if(r==='zalihe'||r.includes('zalih'))r='inventory';if(r==='prijam')r='reception';if(r==='porta'||r==='portir')r='gate';return r}
function today(){const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
function visibleLocalToday(){try{const d=today(),arr=Array.isArray(window.announcements)?window.announcements:(typeof announcements!=='undefined'&&Array.isArray(announcements)?announcements:[]),s=window.currentSession||{},allowed=new Set(Array.isArray(s.warehouses)?s.warehouses.map(String):[]);return arr.filter(a=>{const date=String(a?.date||a?.appointment_date||a?.payload?.date||'').slice(0,10),wh=String(a?.warehouse||a?.payload?.warehouse||''),scoped=s.all_warehouses===true||role()==='admin'||!allowed.size||allowed.has(wh),st=String(a?.status||a?.payload?.status||'').toLowerCase();return date===d&&scoped&&!['obrisano','deleted','cancelled','canceled'].includes(st)}).length}catch(_){return 0}}
async function supplierToday(){try{const raw=await window.YardivoSupplierLiveSync?.call?.('list_mine');if(!Array.isArray(raw))return visibleLocalToday();const d=today();return raw.filter(x=>String(x?.delivery_date||'').slice(0,10)===d&&!['deleted','cancelled','canceled'].includes(String(x?.effective_status||x?.status||'').toLowerCase())).length}catch(_){return visibleLocalToday()}}
async function countToday(){if(role()==='supplier')return await supplierToday();await new Promise(r=>setTimeout(r,700));return visibleLocalToday()}
async function greet(mySeq){if(mySeq!==seq||!window.currentSession)return;try{if(localStorage.getItem('yardivo_notification_sound_mode_v2')==='off')return;const n=await countToday();if(mySeq!==seq||!window.currentSession)return;const word=n===1?'najavu':'najava',body='Dobrodošli u YARDIVO. Danas imate '+n+' '+word+'.',api=window.YardivoAIVoiceNotifications;if(api?.readNow)api.readNow({id:'YARDIVO-LOGIN-'+Date.now(),title:'',body});else if(api?.test)await api.test(body)}catch(e){console.warn('[YARDIVO login AI welcome]',e)}}
window.addEventListener('yardivo:login',()=>{const my=++seq;setTimeout(()=>greet(my),900)});
window.addEventListener('yardivo:logout',()=>{seq++});
})();
