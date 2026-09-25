
(function(){
'use strict';
/*
 YARDIVO DEV V5.8.3
 Server-authoritative storage boundary.
 Business/operational state is virtualized in RAM and synchronized through
 the existing authenticated YARDIVO online sync / Supabase layer.
 Browser persistence remains only for harmless UX/auth bootstrap preferences.
*/
if(window.__yardivoBrowserlessStorageInstalled)return;
window.__yardivoBrowserlessStorageInstalled=true;

const memLocal=new Map(),memSession=new Map(),legacy=new Map();
const native={
 get:Storage.prototype.getItem,
 set:Storage.prototype.setItem,
 remove:Storage.prototype.removeItem,
 key:Storage.prototype.key,
 clear:Storage.prototype.clear
};

const LOCAL_ONLY_EXACT=new Set([
 'yardivo_theme_preset_v1','yardivo_ux_style_v1','yardivo_first_theme_initialized_v1',
 'yardivo_font_scale','yardivo_master_font_v1','yardivo_dark_style_v1',
 'yardivo_light_style_v1','yardivo_main_theme_v1','yardivo_notification_sound_v1',
 'yardivo_voice_notifications_v583',
 'yardivo_remembered_session','yardivo_session','yardivo_custom_session',
 'yardivo_real_auth_cutover_v1','yardivo_rbac_session_migrated_20260831',
 'yardivo_client_id_v1','yardivo_active_warehouse','yardivo_master_boot_cache_v583'
]);

function isAuthProviderKey(k){
 k=String(k||'');
 return /^sb-[a-z0-9_-]+-auth-token$/i.test(k) || /^supabase\.auth\./i.test(k);
}
function isLocalOnly(k){
 k=String(k||'');
 return LOCAL_ONLY_EXACT.has(k) || isAuthProviderKey(k);
}
function isYardivoKey(k){
 k=String(k||'');
 return /^(yardivo_|studenac_|yms_)/i.test(k);
}
function isServerKey(k){
 k=String(k||'');
 return isYardivoKey(k) && !isLocalOnly(k);
}
function mapFor(st){return st===window.sessionStorage?memSession:memLocal}

function captureAndPurge(st){
 let keys=[];
 try{for(let i=0;i<st.length;i++){const k=native.key.call(st,i);if(k)keys.push(k)}}catch(_){}
 for(const k of keys){
   if(!isServerKey(k))continue;
   try{
     const v=native.get.call(st,k);
     if(v!==null){
       mapFor(st).set(k,String(v));
       if(st===window.localStorage)legacy.set(k,String(v));
     }
     native.remove.call(st,k);
   }catch(_){}
 }
}
try{captureAndPurge(window.localStorage)}catch(_){}
try{captureAndPurge(window.sessionStorage)}catch(_){}

Storage.prototype.getItem=function(k){
 k=String(k);
 if((this===window.localStorage||this===window.sessionStorage)&&isServerKey(k)){
   const m=mapFor(this); return m.has(k)?m.get(k):null;
 }
 return native.get.apply(this,arguments);
};
Storage.prototype.setItem=function(k,v){
 k=String(k);
 if((this===window.localStorage||this===window.sessionStorage)&&isServerKey(k)){
   mapFor(this).set(k,String(v));
   try{window.dispatchEvent(new CustomEvent('yardivo:memory-state-changed',{detail:{key:k,storage:this===window.localStorage?'local':'session'}}))}catch(_){}
   return;
 }
 return native.set.apply(this,arguments);
};
Storage.prototype.removeItem=function(k){
 k=String(k);
 if((this===window.localStorage||this===window.sessionStorage)&&isServerKey(k)){
   mapFor(this).delete(k); return;
 }
 return native.remove.apply(this,arguments);
};

function purgeAgain(){
 for(const st of [window.localStorage,window.sessionStorage]){
   let keys=[];try{for(let i=0;i<st.length;i++){const k=native.key.call(st,i);if(k)keys.push(k)}}catch(_){}
   for(const k of keys)if(isServerKey(k)){try{native.remove.call(st,k)}catch(_){}}
 }
}
setInterval(purgeAgain,15000);

/* One-time migration of legacy browser-only state:
   after authenticated server bootstrap, only keys that the server did NOT
   replace are re-emitted so the existing online sync can persist them. */
let migrated=false;
window.addEventListener('yardivo:data-synced',()=>{
 if(migrated)return;
 migrated=true;
 setTimeout(()=>{
   for(const [k,v] of legacy){
     if(k==='yardivo_yms_announcements_v1'||k==='yardivo_yms_incidents_v1')continue;
     try{
       if(memLocal.get(k)===v)localStorage.setItem(k,v);
     }catch(_){}
   }
   legacy.clear();
   purgeAgain();
 },50);
});

window.YardivoBrowserlessStorageV583={
 isServerKey,isLocalOnly,
 businessKeys:()=>[...memLocal.keys()],
 browserPersistentBusinessKeys:()=>{
   const out=[];try{for(let i=0;i<localStorage.length;i++){const k=native.key.call(localStorage,i);if(isServerKey(k))out.push(k)}}catch(_){}
   return out;
 },
 purge:purgeAgain
};
})();
