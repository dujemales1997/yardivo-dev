
(()=>{'use strict';
if(window.__YARDIVO_NOTIFICATION_LOGIN_AI_VOICE_GUARD_20260924__)return;
window.__YARDIVO_NOTIFICATION_LOGIN_AI_VOICE_GUARD_20260924__=true;
function stopVoice(){
 try{window.speechSynthesis?.cancel?.()}catch(_){}
 try{window.YardivoAIVoiceNotifications?.setMode?.('off')}catch(_){}
}
window.addEventListener('yardivo:logout',()=>{
 try{sessionStorage.setItem('yardivo_ai_voice_resume_after_login',localStorage.getItem('yardivo_notification_sound_mode_v2')==='off'?'0':'1')}catch(_){}
 stopVoice();
});
window.addEventListener('yardivo:login',()=>{
 try{
   const resume=sessionStorage.getItem('yardivo_ai_voice_resume_after_login');
   if(resume==='1'){
     sessionStorage.removeItem('yardivo_ai_voice_resume_after_login');
     window.YardivoAIVoiceNotifications?.setMode?.('ai')
   }
 }catch(_){}
});
})();
