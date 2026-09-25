
(()=>{'use strict';
if(window.__YARDIVO_ANNOUNCEMENT_NUMBER_DISPLAY_20260923__)return;
window.__YARDIVO_ANNOUNCEMENT_NUMBER_DISPLAY_20260923__=true;
function hash6(v){
  const s=String(v||'');let h=2166136261;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
  return String(100000+((h>>>0)%900000)).padStart(6,'0')
}
function displayId(v){
  const s=String(v||'').trim();
  if(/^NAJ\d{6}$/i.test(s))return s.toUpperCase();
  if(/^SUP(?:-|$)/i.test(s))return 'NAJ'+hash6(s);
  return s;
}
window.YardivoAnnouncementNumberV583={displayId};
})();
