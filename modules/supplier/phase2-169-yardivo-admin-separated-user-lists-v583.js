
(function(){
'use strict';

function isAdmin(){
  return String(window.currentSession?.role||'').trim().toLowerCase()==='admin';
}
function roleOf(el){
  const direct=String(
    el.dataset?.role||
    el.dataset?.userRole||
    el.getAttribute?.('data-app-role')||
    ''
  ).trim().toLowerCase();
  if(direct)return direct;
  const txt=String(el.textContent||'').toLowerCase();
  if(txt.includes('dobavljač')||txt.includes('dobavljac')||txt.includes('supplier'))return'supplier';
  return '';
}
function ensure(){
  if(!isAdmin())return;
  const panel=document.getElementById('masterUserAdmin');
  const original=document.getElementById('masterUserList');
  if(!panel||!original)return;

  let wrap=document.getElementById('yardivoSeparatedUsers');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='yardivoSeparatedUsers';
    wrap.innerHTML=`
      <section class="yasu-box">
        <div class="yasu-head"><strong>YARDIVO KORISNICI</strong><span class="yasu-count" id="yasuRegularCount">0</span></div>
        <div id="yardivoRegularUsersList"></div>
      </section>
      <section class="yasu-box">
        <div class="yasu-head"><strong>DOBAVLJAČI</strong><span class="yasu-count" id="yasuSupplierCount">0</span></div>
        <div id="yardivoSupplierUsersList"></div>
      </section>`;
    original.insertAdjacentElement('beforebegin',wrap);
  }

  // Keep original server-rendered list as source, but not as a third visible list.
  original.style.setProperty('display','none','important');
  split();
}
function candidateRows(){
  const original=document.getElementById('masterUserList');
  if(!original)return[];
  let rows=[...original.children].filter(x=>x.nodeType===1);
  if(rows.length<=1){
    rows=[...original.querySelectorAll(
      '[data-user-id],[data-username],[data-role],[data-user-role],.master-user-row,.user-row,.account-row,tr'
    )].filter(x=>x.nodeType===1);
  }
  return [...new Set(rows)].filter(x=>{
    const t=String(x.textContent||'').trim();
    return t && !/username|korisnik|rola|role/i.test(t.replace(/\s+/g,' ').slice(0,35));
  });
}
function split(){
  const regular=document.getElementById('yardivoRegularUsersList');
  const suppliers=document.getElementById('yardivoSupplierUsersList');
  if(!regular||!suppliers)return;

  regular.innerHTML='';suppliers.innerHTML='';
  const rows=candidateRows();
  let rc=0,sc=0;

  rows.forEach(row=>{
    const clone=row.cloneNode(true);
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
    const r=roleOf(row);
    if(r==='supplier'){
      suppliers.appendChild(clone);sc++;
    }else{
      regular.appendChild(clone);rc++;
    }
  });

  if(!rc)regular.innerHTML='<div class="yasu-empty">Nema ostalih korisnika.</div>';
  if(!sc)suppliers.innerHTML='<div class="yasu-empty">Nema dobavljača.</div>';
  const a=document.getElementById('yasuRegularCount');if(a)a.textContent=String(rc);
  const b=document.getElementById('yasuSupplierCount');if(b)b.textContent=String(sc);
}
function refresh(){
  if(!isAdmin())return;
  ensure();split();
}
window.YardivoSeparatedUserListsV583={refresh};

window.addEventListener('load',()=>setTimeout(refresh,1500));
window.addEventListener('yardivo:login',()=>setTimeout(refresh,250));
window.addEventListener('yardivo:data-synced',()=>setTimeout(refresh,100));
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-view="settings"],[data-home-target="settings"],#yardivoAdminAddUserBtn'))
    setTimeout(refresh,250);
},true);

let timer=0;
new MutationObserver(muts=>{
  if(!isAdmin())return;
  const relevant=muts.some(m=>m.target?.id==='masterUserList'||m.target?.closest?.('#masterUserList'));
  if(!relevant)return;
  clearTimeout(timer);timer=setTimeout(refresh,80);
}).observe(document.documentElement,{childList:true,subtree:true});
})();
