
(function(){
'use strict';

function normRole(r){
  r=String(r||'').toLowerCase().trim();
  if(r==='zalihe'||r.includes('zalih'))return'inventory';
  if(r==='prijam')return'reception';
  if(r==='porta'||r==='portir')return'gate';
  return r;
}
function role(){
  try{return normRole(window.currentSession?.role||currentSession?.role||'')}catch(e){return''}
}
function user(){
  try{return String(window.currentSession?.user||window.currentSession?.username||currentSession?.user||currentSession?.username||'').trim().toLowerCase()}catch(e){return''}
}
function esc(v){
  return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))
}
function isMine(a){
  const u=user();
  if(!u)return false;
  return String(a?.createdBy||'').trim().toLowerCase()===u;
}
function ensureRefs(){
  let changed=false;
  (Array.isArray(window.announcements)?window.announcements:(typeof announcements!=='undefined'&&Array.isArray(announcements)?announcements:[])).forEach(a=>{
    if(!a.announcementRef && typeof yardivoGenerateAnnouncementRef==='function'){
      a.announcementRef=yardivoGenerateAnnouncementRef();
      changed=true;
    }
  });
  if(changed)try{saveAnnouncements?.()}catch(e){}
}
function ensureView(){
  let view=document.getElementById('yardivoMyAnnouncements');
  if(!view){
    const main=document.querySelector('.main');if(!main)return null;
    view=document.createElement('section');
    view.id='yardivoMyAnnouncements';
    view.className='view';
    view.innerHTML=`<section class="panel">
      <div class="panel-head">
        <div><h2>MOJE NAJAVE</h2><small id="ymaOwnerNote">Samo najave prijavljenog korisnika</small></div>
      </div>
      <div style="padding:14px">
        <div class="data-wrap"><table>
          <thead><tr><th>Broj najave</th><th>Datum</th><th>Skladište</th><th>Dobavljač</th><th>Rampa</th><th>Termin</th><th>Status</th><th>Kreirao</th></tr></thead>
          <tbody id="ymaBody"></tbody>
        </table></div>
      </div>
    </section>`;
    main.appendChild(view);
  }

  let navBtn=document.querySelector('.nav-btn[data-view="yardivoMyAnnouncements"]');
  if(!navBtn){
    const nav=document.querySelector('.nav');
    const anchor=nav?.querySelector('[data-view="announcements"]');
    if(nav){
      navBtn=document.createElement('button');
      navBtn.type='button';
      navBtn.className='nav-btn';
      navBtn.dataset.view='yardivoMyAnnouncements';
      navBtn.innerHTML='<span>▤</span> Moje najave';
      if(anchor)anchor.insertAdjacentElement('afterend',navBtn);
      else nav.appendChild(navBtn);
    }
  }
  return view;
}
function render(){
  if(role()!=='inventory')return;
  ensureRefs();
  const body=document.getElementById('ymaBody');if(!body)return;
  const all=(Array.isArray(window.announcements)?window.announcements:(typeof announcements!=='undefined'&&Array.isArray(announcements)?announcements:[]));
  const a=[...all].filter(isMine).sort((x,y)=>String(y.createdAt||y.date||'').localeCompare(String(x.createdAt||x.date||'')));
  const note=document.getElementById('ymaOwnerNote');
  if(note)note.textContent=`Samo najave korisnika: ${user()||'—'}`;
  body.innerHTML=a.length
    ? a.map(x=>`<tr>
        <td class="yma-ref">NAJAVA ${esc(typeof announcementNumber==='function'?announcementNumber(x):(x.announcementRef||x.id||'—'))}</td>
        <td>${esc(x.date||'—')}</td><td>${esc(x.warehouse||yardivoCanonicalWarehouseV583())}</td>
        <td><strong>${esc(x.supplier||'—')}</strong></td>
        <td>${x.dock?'Rampa '+esc(x.dock):'—'}</td><td>${esc(x.time||'—')}</td>
        <td>${esc(x.status||'U dolasku')}</td><td>${esc(x.createdBy||'—')}</td>
      </tr>`).join('')
    : '<tr><td colspan="8"><div class="yma-empty">Još nema najava koje je kreirao ovaj korisnik.</div></td></tr>';
}
function apply(){
  const view=ensureView();
  const btn=document.querySelector('.nav-btn[data-view="yardivoMyAnnouncements"]');
  const ok=role()==='inventory';

  if(btn){
    btn.classList.toggle('role-hidden',!ok);
    btn.style.setProperty('display',ok?'flex':'none','important');
    btn.style.setProperty('visibility',ok?'visible':'hidden','important');
    btn.style.setProperty('opacity',ok?'1':'0','important');
    btn.style.setProperty('pointer-events',ok?'auto':'none','important');
  }
  if(view){
    if(!ok){
      view.classList.remove('active');
      view.style.setProperty('display','none','important');
    }else{
      view.style.removeProperty('display');
      if(view.classList.contains('active'))render();
    }
  }
}
function open(){
  if(role()!=='inventory')return false;
  ensureView();
  document.body.classList.remove('home-menu-mode');
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('yardivoMyAnnouncements')?.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.view==='yardivoMyAnnouncements'));
  const pt=document.getElementById('pageTitle');if(pt)pt.textContent='MOJE NAJAVE';
  const sub=document.getElementById('pageSubtitle');if(sub)sub.textContent='Najave prijavljenog korisnika zaliha';
  render();
  return true;
}

document.addEventListener('click',e=>{
  const b=e.target.closest('[data-view="yardivoMyAnnouncements"]');
  if(!b)return;
  e.preventDefault();e.stopImmediatePropagation();
  open();
},true);

window.addEventListener('yardivo:login',()=>{ensureView();apply();render()});
window.addEventListener('load',()=>setTimeout(()=>{ensureView();apply()},80));

/* No interval toggling: role changes are handled by the final RBAC/login events.
   This prevents the old appear/disappear flicker. */
window.YardivoMyAnnouncements={render,apply,open,isMine};
})();
