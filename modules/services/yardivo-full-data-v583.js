
(function(){'use strict';if(window.__yardivoFullDataV583)return;window.__yardivoFullDataV583=true;
const enc=new TextEncoder(),str=o=>JSON.stringify(o,null,2);
async function hash(t){const b=await crypto.subtle.digest('SHA-256',enc.encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function stat(t,k){const e=document.getElementById('yardivoFullDataStatus');if(e){e.textContent=t;e.style.borderColor=k==='e'?'rgba(248,113,113,.5)':k==='o'?'rgba(45,212,191,.5)':'rgba(148,163,184,.18)'}}
const cnt=p=>({announcements:p.announcements?.length||0,incidents:p.incidents?.length||0,state:p.state?.length||0,audit_log:p.audit_log?.length||0});
async function exp(){stat('ČITAM KOMPLETNE PODATKE SA SERVERA…');const d=await window.YardivoSupabase.fullDataSnapshot(),c=cnt(d),core={...d,manifest:{format:'YARDIVO FULL DATA',schema:'yardivo-full-data-v1',version:'YARDIVO DEV V5.8.3',exportedAt:d.exportedAt,source:'SERVER / DATABASE',counts:c}},checksum=await hash(str(core)),pack={...core,integrity:{algorithm:'SHA-256',checksum}},blob=new Blob([str(pack)],{type:'application/json;charset=utf-8'}),a=document.createElement('a'),stamp=new Date().toISOString().replace(/[:.]/g,'-');a.href=URL.createObjectURL(blob);a.download=`YARDIVO_FULL_DATA_${stamp}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);stat(`EXPORT USPJEŠAN · ${c.announcements} najava · ${c.incidents} incidenata · ${c.state} state · ${c.audit_log} audit · SHA-256 OK`,'o')}
async function verify(p){if(!p||p.schema!=='yardivo-full-data-v1'||!p.integrity?.checksum)throw new Error('Neispravan YARDIVO FULL DATA backup.');const x={...p};delete x.integrity;if(await hash(str(x))!==p.integrity.checksum)throw new Error('CHECKSUM NIJE ISPRAVAN — backup je oštećen ili promijenjen.');return true}
async function restore(file){stat('PROVJERAVAM BACKUP I CHECKSUM…');let p;try{p=JSON.parse(await file.text())}catch(_){throw new Error('Datoteka nije valjani JSON.')}await verify(p);const c=cnt(p);if(!confirm(`RESTORE FULL DATA?\n\n${p.exportedAt||''}\nNajave: ${c.announcements}\nIncidenti: ${c.incidents}\nState: ${c.state}\nAudit: ${c.audit_log}\n\nPostojeći poslovni podaci bit će zamijenjeni. Korisnici ostaju.`))return stat('RESTORE OTKAZAN');if((prompt('Za konačnu potvrdu upiši: RESTORE YARDIVO')||'').trim().toUpperCase()!=='RESTORE YARDIVO')return stat('RESTORE OTKAZAN');stat('VRAĆAM PODATKE NA SERVER… NE ZATVARAJ YARDIVO.');const r=await window.YardivoSupabase.restoreFullData(p);stat(`RESTORE USPJEŠAN · ${r.announcements} najava · ${r.incidents} incidenata · ${r.state} state`,'o');setTimeout(()=>location.reload(),900)}
function install(){
 const settings=document.getElementById('settings');
 if(!settings)return;

 /* Never allow FULL DATA card outside Settings. Remove legacy misplaced instance. */
 const existing=document.getElementById('yardivoFullDataBackupCard');
 if(existing && !existing.closest('#settings .danger-zone')){
   existing.remove();
 }
 const already=document.querySelector('#settings .danger-zone #yardivoFullDataBackupCard');
 if(already){bind();return}

 /* Authoritative target: Settings -> actual .danger-zone panel only. */
 const danger=settings.querySelector('.settings-grid > .danger-zone, .danger-zone');
 if(!danger)return;

 const body=danger.querySelector('.danger-body,.panel-body')||danger;
 const card=document.createElement('div');
 card.id='yardivoFullDataBackupCard';
 card.className='dangerCard';
 card.style.cssText='margin:0 0 14px;border:1px solid rgba(45,212,191,.28);border-radius:14px;padding:16px;background:rgba(8,31,39,.72)';
 card.innerHTML='<div class="dangerTitle" style="color:#5eead4;font-weight:1000">FULL DATA BACKUP / RESTORE</div><p><strong>EXPORT FULL DATA</strong> povlači svježi snapshot direktno sa servera/baze. Browser cache nije izvor backupa.</p><div id="yardivoFullDataStatus" style="margin:12px 0;padding:10px 12px;border:1px solid rgba(148,163,184,.18);border-radius:10px;font-size:12px;font-weight:800">SPREMNO ZA SERVER EXPORT</div><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="action primary" id="yardivoExportFullDataBtn">EXPORT FULL DATA</button><button type="button" class="action" id="yardivoRestoreFullDataBtn">IMPORT / RESTORE FULL DATA</button><input type="file" id="yardivoRestoreFullDataFile" accept=".json,application/json" hidden></div><p style="margin-top:10px;font-size:11px;opacity:.72">Backup ima manifest, broj zapisa i SHA-256 checksum. Restore provjerava datoteku prije upisa. Korisnički računi ostaju sačuvani.</p>';

 body.insertBefore(card,body.firstChild);
 bind();
}
function bind(){const e=document.getElementById('yardivoExportFullDataBtn'),r=document.getElementById('yardivoRestoreFullDataBtn'),f=document.getElementById('yardivoRestoreFullDataFile');if(e&&!e.dataset.b){e.dataset.b=1;e.onclick=async()=>{e.disabled=true;try{await exp()}catch(x){stat('EXPORT NIJE USPIO · '+(x.message||x),'e');alert(x.message||x)}finally{e.disabled=false}}}if(r&&!r.dataset.b){r.dataset.b=1;r.onclick=()=>f?.click()}if(f&&!f.dataset.b){f.dataset.b=1;f.onchange=async()=>{const z=f.files?.[0];if(!z)return;r.disabled=true;try{await restore(z)}catch(x){stat('RESTORE NIJE USPIO · '+(x.message||x),'e');alert(x.message||x)}finally{r.disabled=false;f.value=''}}}}
new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',install);install();window.YardivoFullDataV583={export:exp,verify,restore};
})();