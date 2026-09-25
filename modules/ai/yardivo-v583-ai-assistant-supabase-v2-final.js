
(()=>{'use strict';
if(window.__YV_AI_ASSISTANT_SUPABASE_V2_FINAL__)return;
window.__YV_AI_ASSISTANT_SUPABASE_V2_FINAL__=true;

let clearedForSession=false;

function clearAutomaticContent(){
  const box=document.getElementById('yardivoAssistantMessages');
  if(!box)return;
  if(!clearedForSession){
    box.replaceChildren();
    clearedForSession=true;
  }
  document.querySelectorAll('#yardivoSmartAssistant .yv-ai-suggestions').forEach(x=>x.remove());
  const input=document.getElementById('yardivoAssistantInput');
  if(input){
    input.placeholder='Napiši poruku YARDIVO Assistantu...';
    input.removeAttribute('readonly');
    input.removeAttribute('disabled');
  }
}

function translateAiError(text){
  const t=String(text||'');
  if(/AI provider nije konfiguriran|AI provider not configured|AI_PROVIDER_NOT_CONFIGURED|AI_NOT_CONFIGURED/i.test(t)){
    return 'YARDIVO AI backend je aktivan, ali AI provider još nije konfiguriran u Supabase secrets.';
  }
  if(/AI_PROVIDER_ERROR/i.test(t)){
    return 'YARDIVO AI provider trenutno nije odgovorio. Pokušaj ponovno.';
  }
  return t;
}

function patchMessages(){
  const box=document.getElementById('yardivoAssistantMessages');
  if(!box||box.dataset.yvAiV2Observer)return;
  box.dataset.yvAiV2Observer='1';
  const obs=new MutationObserver(()=>{
    box.querySelectorAll('.yv-ai-msg.assistant').forEach(el=>{
      const text=String(el.textContent||'');
      const translated=translateAiError(text);
      if(translated!==text)el.textContent=translated;
    });
  });
  obs.observe(box,{childList:true,subtree:true,characterData:true});
}

function ensure(){
  clearAutomaticContent();
  patchMessages();
}

window.addEventListener('yardivo:login',()=>setTimeout(()=>{clearedForSession=false;ensure()},80));
document.addEventListener('DOMContentLoaded',ensure,{once:true});
window.addEventListener('load',()=>setTimeout(ensure,350),{once:true});
setTimeout(ensure,250);

window.YardivoAiAssistantSupabaseV2Final={clear:()=>{clearedForSession=false;clearAutomaticContent()}};
})();
