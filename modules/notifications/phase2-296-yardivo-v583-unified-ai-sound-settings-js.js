
(()=>{'use strict';
if(window.__YARDIVO_UNIFIED_AI_SOUND_SETTINGS_V583__)return;window.__YARDIVO_UNIFIED_AI_SOUND_SETTINGS_V583__=true;
const MODE='yardivo_notification_sound_mode_v2',LEGACY='yardivo_notification_sound_v1',VOL='yardivo_notification_voice_volume_v583';
const $=id=>document.getElementById(id);
function mode(){try{return localStorage.getItem(MODE)==='off'?'off':'ai'}catch(_){return'ai'}}
function volume(){let v=85;try{v=Number(localStorage.getItem(VOL)||85)}catch(_){}return Math.max(0,Math.min(100,Number.isFinite(v)?v:85))}
function setMode(v){v=v==='off'?'off':'ai';try{localStorage.setItem(MODE,v);localStorage.setItem(LEGACY,'off')}catch(_){};try{window.YardivoAIVoiceNotifications?.setMode?.(v)}catch(_){};render()}
function setVolume(v){v=Math.max(0,Math.min(100,Number(v)||0));try{localStorage.setItem(VOL,String(v))}catch(_){};try{window.YardivoAIVoiceNotifications?.setVolume?.(v)}catch(_){};render()}
function ensure(){
 const grid=$('settings')?.querySelector('.settings-grid');if(!grid)return;
 let d=$('yardivoVoiceSettingsV583');
 if(!d){d=document.createElement('section');d.id='yardivoVoiceSettingsV583';d.className='panel';d.dataset.yvOrdinarySetting='1';d.innerHTML=`<div class="yv-title">ZVUK · AI GLAS</div><div class="yv-sub">Nova vidljiva YARDIVO notifikacija čita se odmah Gemini AI glasom. Jedina zvučna postavka je AI glas — stari klasični zvuk je uklonjen.</div><div class="yv-row"><div><label>AI GLAS</label><div id="yardivoVoiceStatusV583"></div></div><div class="yv-toggle"><button type="button" data-yv-ai-sound="ai">ON</button><button type="button" data-yv-ai-sound="off">OFF</button></div></div><div class="yv-row"><label>GLASNOĆA</label><div style="display:flex;align-items:center;gap:8px"><input id="yardivoVoiceVolumeV583" type="range" min="0" max="100" step="5"><span id="yardivoVoiceVolumeValueV583"></span></div></div><div class="yv-row"><label>TEST AI GLASA</label><button type="button" id="yardivoVoiceTestV583">▶ TEST</button></div>`;grid.appendChild(d);
   d.addEventListener('click',e=>{const b=e.target.closest?.('[data-yv-ai-sound]');if(b){setMode(b.dataset.yvAiSound);return}if(e.target.closest?.('#yardivoVoiceTestV583')){const st=$('yardivoVoiceStatusV583');if(st)st.textContent='Pokrećem Gemini AI glas…';window.YardivoAIVoiceNotifications?.test?.('YARDIVO test glas.').then(()=>{if(st)st.textContent='AI glas je spreman.'}).catch((err)=>{if(st)st.textContent='AI glas trenutno nije dostupan'+(err?.message?' · '+err.message:'')})}});
   d.querySelector('#yardivoVoiceVolumeV583')?.addEventListener('input',e=>setVolume(e.target.value));
 }
 if(d.parentElement!==grid)grid.appendChild(d);d.hidden=false;d.style.setProperty('display','block','important');render();
}
function render(){const d=$('yardivoVoiceSettingsV583');if(!d)return;const m=mode(),v=volume();d.querySelectorAll('[data-yv-ai-sound]').forEach(b=>b.classList.toggle('active',b.dataset.yvAiSound===m));const r=$('yardivoVoiceVolumeV583'),rv=$('yardivoVoiceVolumeValueV583'),st=$('yardivoVoiceStatusV583');if(r&&document.activeElement!==r)r.value=String(v);if(rv)rv.textContent=v+'%';if(st)st.textContent=m==='ai'?'UKLJUČENO · GEMINI AI GLAS':'ISKLJUČENO'}
function migrate(){try{const m=localStorage.getItem(MODE);if(!m||m==='classic')localStorage.setItem(MODE,'ai');localStorage.setItem(LEGACY,'off');localStorage.removeItem('yardivo_voice_notifications_v583')}catch(_){};document.querySelectorAll('#yardivoNotifSoundToggle').forEach(x=>x.remove());ensure()}
window.addEventListener('yardivo:login',()=>setTimeout(migrate,80));document.addEventListener('click',e=>{if(e.target?.closest?.('[data-view="settings"],[data-home-target="settings"],#navSettings'))setTimeout(ensure,40)},true);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(migrate,300),{once:true});else setTimeout(migrate,50);setInterval(()=>{document.querySelectorAll('#yardivoNotifSoundToggle').forEach(x=>x.remove())},3000);
window.YardivoUnifiedAISoundSettingsV583={ensure,render,setMode,setVolume,mode,volume};
})();
