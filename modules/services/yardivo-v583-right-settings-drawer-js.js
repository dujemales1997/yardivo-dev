
(()=>{'use strict';
if(window.__YV_RIGHT_SETTINGS_DRAWER_V583__)return;
window.__YV_RIGHT_SETTINGS_DRAWER_V583__=true;

const SOUND_KEY='yardivo_notification_sound_v1';
const SOUND_MODE_KEY='yardivo_notification_sound_mode_v2';
const SOUND_VOLUME_KEY='yardivo_notification_voice_volume_v583';
const FONT_KEY='yardivo_master_font_v1';
const THEME_KEY='yardivo_main_theme_v2';
const PALETTE_KEY='yardivo_dark_palette_v583';
let closeTimer=0;

function normRole(v){
  v=String(v||'').trim().toLowerCase();
  if(v==='prijam')return'reception';
  if(v==='porta'||v==='portir')return'gate';
  if(v==='zalihe'||v.includes('zalih'))return'inventory';
  if(v==='voditelj'||v==='management')return'manager';
  return v;
}
function role(){
  return normRole(window.currentSession?.app_role||window.currentSession?.role||document.body.dataset.yardivoRole||'');
}
function isAdmin(){return role()==='admin'}
function openDrawer(){
  if(isAdmin())return;
  clearTimeout(closeTimer);
  document.body.classList.add('yv-right-settings-open');
}
function closeDrawerSoon(){
  clearTimeout(closeTimer);
  closeTimer=setTimeout(()=>document.body.classList.remove('yv-right-settings-open'),110);
}
function esc(v){
  return String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function soundMode(){
  try{
    const v=localStorage.getItem(SOUND_MODE_KEY);
    if(v==='off'||v==='ai')return v;
    if(v==='classic'||localStorage.getItem(SOUND_KEY)!=='off')return'ai';
    return'off';
  }catch(_){return'ai'}
}
function soundEnabled(){return soundMode()==='ai'}
function soundVolume(){
  let v=85;
  try{v=Number(localStorage.getItem(SOUND_VOLUME_KEY)||85)}catch(_){}
  return Math.max(0,Math.min(100,Number.isFinite(v)?v:85));
}
function applySoundVolume(v){
  v=Math.max(0,Math.min(100,Number(v)||0));
  try{localStorage.setItem(SOUND_VOLUME_KEY,String(v))}catch(_){}
  try{window.YardivoAIVoiceNotifications?.setVolume?.(v)}catch(_){}
}
function fontValue(){
  let p=100;try{p=Number(localStorage.getItem(FONT_KEY)||100)}catch(_){}
  return Math.max(80,Math.min(150,p||100));
}
function themeValue(){
  try{
    const v=localStorage.getItem(THEME_KEY);
    if(v==='light'||v==='dark')return v;
  }catch(_){}
  return document.body.classList.contains('light-mode')?'light':'dark';
}
function paletteValue(){
  try{
    const v=localStorage.getItem(PALETTE_KEY)||'original';
    return ['original','black','silver','steel'].includes(v)?v:'original';
  }catch(_){return 'original'}
}
function paletteLabel(v=paletteValue()){
  return ({original:'DARK BLUE',black:'DARK BLACK',silver:'GREY SILVER',steel:'GRAPHITE STEEL'})[v]||'DARK BLUE';
}
function applyPalette(v){
  v=['original','black','silver','steel'].includes(v)?v:'original';
  try{
    localStorage.setItem(PALETTE_KEY,v);
    /* Keep legacy controller fixed on original; this palette layer owns paint only. */
    localStorage.setItem('yardivo_dark_look_v2','original');
    localStorage.setItem('yardivo_dark_style','original');
  }catch(_){}
  try{window.YardivoDarkPaletteIsolation?.apply?.()}catch(_){}
  const html=document.documentElement,body=document.body;
  html.dataset.yardivoDarkPalette=v;
  if(body) body.dataset.yardivoDarkPalette=v;

  /* Hard paint variables: no dimensions/layout are touched. This defeats older theme layers
     that were winning on specificity and made palette clicks look like they did nothing. */
  const palettes={
    black:{bg:'#050607',bg2:'#090a0b',surface:'#0d0f11',surface2:'#111315',line:'#30353a',text:'#f4f6f7',muted:'#9aa1a7',brand:'#5f7f98',brand2:'#3e5c73',soft:'#151a1e'},
    silver:{bg:'#171b1f',bg2:'#1d2227',surface:'#23292e',surface2:'#2a3137',line:'#4b555e',text:'#f5f7f8',muted:'#b3bbc2',brand:'#8da3b2',brand2:'#657b8a',soft:'#30373d'},
    steel:{bg:'#0d1216',bg2:'#12191f',surface:'#172028',surface2:'#1c2730',line:'#374852',text:'#eef3f5',muted:'#9dafb8',brand:'#5f8da6',brand2:'#3f687d',soft:'#22303a'}
  };
  const varNames=['--yv-bg','--yv-surface','--yv-surface2','--yv-line','--yv-text','--yv-muted','--yv-brand','--yv-brand2','--yv-soft','--bg','--bg2','--panel','--panel2','--line','--line2','--text','--muted','--theme-bg','--theme-bg-2','--theme-panel','--theme-panel-2','--theme-card','--theme-border','--theme-border-soft','--theme-text','--theme-muted'];
  if(body){
    if(v==='original'){
      varNames.forEach(n=>body.style.removeProperty(n));
      html.style.removeProperty('--yv-bg');html.style.removeProperty('--yv-surface');html.style.removeProperty('--yv-surface2');html.style.removeProperty('--yv-line');html.style.removeProperty('--yv-text');html.style.removeProperty('--yv-muted');
    }else{
      const p=palettes[v];
      const vars={
        '--yv-bg':p.bg,'--yv-surface':p.surface,'--yv-surface2':p.surface2,'--yv-line':p.line,'--yv-text':p.text,'--yv-muted':p.muted,'--yv-brand':p.brand,'--yv-brand2':p.brand2,'--yv-soft':p.soft,
        '--bg':p.bg,'--bg2':p.bg2,'--panel':p.surface,'--panel2':p.surface2,'--line':p.line,'--line2':p.line,'--text':p.text,'--muted':p.muted,
        '--theme-bg':p.bg,'--theme-bg-2':p.bg2,'--theme-panel':p.surface,'--theme-panel-2':p.surface2,'--theme-card':p.surface,'--theme-border':p.line,'--theme-border-soft':p.line,'--theme-text':p.text,'--theme-muted':p.muted
      };
      Object.entries(vars).forEach(([n,val])=>body.style.setProperty(n,val,'important'));
      ['--yv-bg','--yv-surface','--yv-surface2','--yv-line','--yv-text','--yv-muted'].forEach(n=>html.style.setProperty(n,vars[n],'important'));
    }
  }
  updateThemePaletteVisibility();
  try{window.YardivoThemeFullAuthorityV4?.apply?.()}catch(_){}
  try{window.YardivoFullPalettePaint?.apply?.()}catch(_){}
}
function applySoundMode(v){
  v=v==='ai'?'ai':'off';
  try{
    localStorage.setItem(SOUND_MODE_KEY,v);
    localStorage.setItem(SOUND_KEY,'off');
  }catch(_){}
  try{window.YardivoAIVoiceNotifications?.setMode?.(v)}catch(_){}
  try{window.YardivoNotificationSound?.setEnabled?.(false)}catch(_){}
}
function applySound(v){applySoundMode(v?'ai':'off')}
function applyFont(p){
  p=Math.max(80,Math.min(150,Number(p)||100));
  try{localStorage.setItem(FONT_KEY,String(p))}catch(_){}
  document.documentElement.style.setProperty('--yardivo-ui-scale',String(p/100));
  document.documentElement.dataset.yardivoFontScale=String(p);
}
function applyTheme(theme){
  theme=theme==='light'?'light':'dark';
  if(window.YardivoMainTheme?.apply){
    window.YardivoMainTheme.apply(theme,true);
  }else{
    try{
      localStorage.setItem(THEME_KEY,theme);
      localStorage.setItem('yardivo_theme_v3',theme);
      localStorage.setItem('yardivo_theme_v2',theme);
      localStorage.setItem('yardivo_theme',theme);
      localStorage.setItem('theme',theme);
    }catch(_){}
    const html=document.documentElement,body=document.body;
    html.dataset.yardivoMainTheme=theme;html.dataset.theme=theme;html.dataset.yardivoTheme=theme;
    html.style.colorScheme=theme;
    html.classList.toggle('light-mode',theme==='light');html.classList.toggle('dark-mode',theme==='dark');
    body.classList.toggle('light-mode',theme==='light');body.classList.toggle('dark-mode',theme==='dark');
    body.classList.remove('yardivo-light-green');
  }
  if(theme==='dark')applyPalette(paletteValue());
  updateThemePaletteVisibility();
}
function statusText(type){
  if(type==='sound')return soundMode()==='ai'?'ON · AI GLAS':'OFF';
  if(type==='font')return fontValue()+'%';
  if(type==='theme')return themeValue()==='light'?'LIGHT':'DARK';
  if(type==='palette')return paletteLabel();
  return '';
}
function ensureDrawer(){
  let zone=document.getElementById('yardivoRightSettingsZone');
  if(!zone){
    zone=document.createElement('div');
    zone.id='yardivoRightSettingsZone';
    zone.setAttribute('aria-hidden','true');
    document.body.appendChild(zone);
  }
  let drawer=document.getElementById('yardivoRightSettingsDrawer');
  if(!drawer){
    drawer=document.createElement('aside');
    drawer.id='yardivoRightSettingsDrawer';
    drawer.setAttribute('aria-label','Brze postavke');
    drawer.innerHTML=`
      <div class="yv-rs-head">
        <strong>BRZE POSTAVKE</strong>
        <small>Osobne postavke ovog korisnika</small>
      </div>
      <div class="yv-rs-list">
        <button type="button" class="yv-rs-item" data-yv-setting="sound">
          <span class="yv-rs-icon">🔊</span>
          <span class="yv-rs-copy"><strong>ZVUK</strong><small data-yv-setting-status="sound"></small></span>
          <span class="yv-rs-arrow">›</span>
        </button>
        <button type="button" class="yv-rs-item" data-yv-setting="font">
          <span class="yv-rs-icon">Aa</span>
          <span class="yv-rs-copy"><strong>VELIČINA SLOVA</strong><small data-yv-setting-status="font"></small></span>
          <span class="yv-rs-arrow">›</span>
        </button>
        <button type="button" class="yv-rs-item" data-yv-setting="theme">
          <span class="yv-rs-icon">◐</span>
          <span class="yv-rs-copy"><strong>LIGHT / DARK MODE</strong><small data-yv-setting-status="theme"></small></span>
          <span class="yv-rs-arrow">›</span>
        </button>
        <button type="button" class="yv-rs-item" data-yv-setting="palette">
          <span class="yv-rs-icon">◈</span>
          <span class="yv-rs-copy"><strong>THEME</strong><small data-yv-setting-status="palette"></small></span>
          <span class="yv-rs-arrow">›</span>
        </button>
        <button type="button" class="yv-rs-item yv-help-chat-menu-item" data-yv-help-chat-open>
          <span class="yv-rs-icon">💬</span>
          <span class="yv-rs-copy"><strong>HELP CHAT</strong><small>dujemales · Yard Manager</small></span>
          <span class="yv-help-chat-menu-badge" data-yv-help-badge hidden>0</span>
          <span class="yv-rs-arrow">›</span>
        </button>
      </div>
      <div class="yv-rs-foot">Pomakni miš izvan panela za zatvaranje.</div>`;
    document.body.appendChild(drawer);
  }

  if(!zone.dataset.bound){
    zone.dataset.bound='1';
    zone.addEventListener('pointerenter',openDrawer,{passive:true});
    zone.addEventListener('mousemove',openDrawer,{passive:true});
  }
  if(!drawer.dataset.bound){
    drawer.dataset.bound='1';
    drawer.addEventListener('pointerenter',openDrawer,{passive:true});
    drawer.addEventListener('pointerleave',closeDrawerSoon,{passive:true});
    drawer.addEventListener('click',e=>{
      const b=e.target.closest?.('[data-yv-setting]');
      if(!b)return;
      openSetting(b.dataset.yvSetting);
    });
  }
  updateStatuses();
}
function ensureModal(){
  let modal=document.getElementById('yardivoQuickSettingModal');
  if(modal)return modal;
  modal=document.createElement('div');
  modal.id='yardivoQuickSettingModal';
  modal.setAttribute('role','dialog');
  modal.setAttribute('aria-modal','true');
  modal.innerHTML=`
    <div class="yv-qsm-card">
      <div class="yv-qsm-head"><strong id="yardivoQuickSettingTitle">POSTAVKA</strong><button type="button" class="yv-qsm-close" aria-label="Zatvori">×</button></div>
      <div class="yv-qsm-body" id="yardivoQuickSettingBody"></div>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector('.yv-qsm-close').onclick=closeModal;
  modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
  return modal;
}
function closeModal(){
  document.getElementById('yardivoQuickSettingModal')?.classList.remove('open');
}
function optionButton(label,value,active,kind){
  return `<button type="button" class="yv-qsm-option ${active?'active':''}" data-yv-qsm-kind="${esc(kind)}" data-yv-qsm-value="${esc(value)}">${esc(label)}</button>`;
}
function openSetting(type){
  if(isAdmin())return;
  const modal=ensureModal();
  const title=document.getElementById('yardivoQuickSettingTitle');
  const body=document.getElementById('yardivoQuickSettingBody');
  if(!title||!body)return;

  if(type==='sound'){
    const m=soundMode(),vol=soundVolume();
    title.textContent='ZVUK';
    body.innerHTML=`<p class="yv-qsm-help">Kad je uključeno, YARDIVO odmah pročita novu notifikaciju Gemini AI glasom.</p>
      <div class="yv-qsm-options">
        ${optionButton('🔊 ON','ai',m==='ai','sound')}
        ${optionButton('🔇 OFF','off',m==='off','sound')}
      </div>
      <div class="yv-voice-volume">
        <div class="yv-voice-volume-head"><strong>GLASNOĆA</strong><span data-yv-volume-label>${vol}%</span></div>
        <input type="range" min="0" max="100" step="5" value="${vol}" data-yv-volume aria-label="Glasnoća glasovnih notifikacija">
      </div>
      <div class="yv-voice-test-row">
        <button type="button" class="yv-qsm-option" data-yv-voice-test>▶ TEST AI GLASA</button>
        <small data-yv-voice-test-status>Pročitat će kratku testnu YARDIVO najavu.</small>
      </div>`;
    const range=body.querySelector('[data-yv-volume]');
    const label=body.querySelector('[data-yv-volume-label]');
    range?.addEventListener('input',()=>{const v=Number(range.value)||0;if(label)label.textContent=v+'%';applySoundVolume(v)});
  }else if(type==='font'){
    const p=fontValue();
    title.textContent='VELIČINA SLOVA';
    body.innerHTML=`<p class="yv-qsm-help">Promjena vrijedi kroz cijelo YARDIVO sučelje na ovom uređaju.</p><div class="yv-qsm-options">
      ${optionButton('MANJE · 90%','90',p===90,'font')}
      ${optionButton('NORMALNO · 100%','100',p===100,'font')}
      ${optionButton('VEĆE · 115%','115',p===115,'font')}
      ${optionButton('NAJVEĆE · 130%','130',p===130,'font')}
    </div>`;
  }else if(type==='theme'){
    const t=themeValue();
    title.textContent='LIGHT / DARK MODE';
    body.innerHTML=`<p class="yv-qsm-help">Odaberi izgled YARDIVO sučelja. Odabrani izgled primjenjuje se kroz cijeli YARDIVO.</p><div class="yv-qsm-options">
      ${optionButton('☀️ LIGHT MODE','light',t==='light','theme')}
      ${optionButton('🌙 DARK MODE','dark',t==='dark','theme')}
    </div>`;
  }else if(type==='palette'){
    if(themeValue()!=='dark'){closeModal();return}
    const v=paletteValue();
    title.textContent='THEME';
    body.innerHTML=`<p class="yv-qsm-help">Odaberi punu paletu tamnog YARDIVO sučelja. Cijeli UI koristi odabranu paletu; operativne statusne boje ostaju sačuvane radi sigurnog čitanja statusa.</p><div class="yv-qsm-options yv-theme-palette-options">
      ${optionButton('DARK BLUE · ORIGINAL','original',v==='original','palette')}
      ${optionButton('DARK BLACK','black',v==='black','palette')}
      ${optionButton('GREY SILVER','silver',v==='silver','palette')}
      ${optionButton('GRAPHITE STEEL','steel',v==='steel','palette')}
    </div>`;
  }else{return}
  body.onclick=e=>{
    const test=e.target.closest?.('[data-yv-voice-test]');
    if(test){
      const st=body.querySelector('[data-yv-voice-test-status]');
      if(st)st.textContent='Pokrećem Gemini AI glas…';
      window.YardivoAIVoiceNotifications?.test?.('YARDIVO test glas.')
        .then(()=>{if(st)st.textContent='Test je završen.'})
        .catch(()=>{if(st)st.textContent='AI glas trenutačno nije dostupan.'});
      return;
    }
    const b=e.target.closest?.('[data-yv-qsm-kind]');
    if(!b)return;
    const kind=b.dataset.yvQsmKind,val=b.dataset.yvQsmValue;
    if(kind==='sound')applySoundMode(val);
    else if(kind==='font')applyFont(Number(val));
    else if(kind==='theme')applyTheme(val);
    else if(kind==='palette')applyPalette(val);
    updateStatuses();
    /* Theme selection is an immediate action: close overlay + drawer so it never blocks YARDIVO. */
    if(kind==='theme'||kind==='palette'){
      closeModal();
      document.body.classList.remove('yv-right-settings-open');
    }else{
      openSetting(kind);
    }
  };
  modal.classList.add('open');
}
function updateThemePaletteVisibility(){
  const item=document.querySelector('#yardivoRightSettingsDrawer [data-yv-setting="palette"]');
  if(!item)return;
  const show=themeValue()==='dark';
  item.style.display=show?'grid':'none';
  item.setAttribute('aria-hidden',show?'false':'true');
}
function updateStatuses(){
  document.querySelectorAll('[data-yv-setting-status]').forEach(el=>{
    el.textContent=statusText(el.dataset.yvSettingStatus);
  });
  updateThemePaletteVisibility();
}
function applyRoleUi(){
  const admin=isAdmin();
  document.body.classList.toggle('yv-right-settings-disabled',admin);
  const zone=document.getElementById('yardivoRightSettingsZone');
  const drawer=document.getElementById('yardivoRightSettingsDrawer');
  if(zone)zone.style.display=admin?'none':'block';
  if(drawer)drawer.style.display=admin?'none':'flex';
  if(admin)document.body.classList.remove('yv-right-settings-open');

  /* Admin keeps the original theme switch and original Settings section unchanged. */
  const sw=document.getElementById('yardivoThemeSwitch');
  if(sw&&admin){
    sw.style.removeProperty('display');
    sw.style.removeProperty('visibility');
    sw.style.removeProperty('pointer-events');
  }
}
function ensure(){
  ensureDrawer();
  applyRoleUi();
  applyPalette(paletteValue());
  updateStatuses();
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeModal();document.body.classList.remove('yv-right-settings-open')}
});
window.addEventListener('yardivo:login',()=>setTimeout(ensure,0));
window.addEventListener('yardivo:logout',()=>document.body.classList.remove('yv-right-settings-open'));
document.addEventListener('DOMContentLoaded',ensure,{once:true});
window.addEventListener('load',ensure,{once:true});
setTimeout(ensure,120);

window.YardivoQuickSettingsV583={
  open:openSetting,
  sound:applySound, soundMode:applySoundMode, soundVolume:applySoundVolume,
  font:applyFont,
  theme:applyTheme,
  palette:applyPalette,
  refresh:updateStatuses
};
})();
