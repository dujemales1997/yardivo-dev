
(function(){
 const SEEN='yardivo_daily_forecast_seen_v1_';
 function role(){let r='';try{r=String(currentSession?.role||'').toLowerCase().trim()}catch(e){};if(r==='prijam')r='reception';return r}
 function load(){try{return window.YardivoCleanCore?.load?.()||announcements||[]}catch(e){return []}}
 function date(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
 function startTime(a){
   const raw=a.yardArrivalAt||a.gateCheckedAt||a.arrivalRecordedAt;
   if(raw){const x=new Date(raw);if(!isNaN(x))return x}
   if(a.actualDate&&a.actualTime){const x=new Date(`${a.actualDate}T${a.actualTime}:00`);if(!isNaN(x))return x}
   return null;
 }
 function duration(a){
   const s=startTime(a);if(!s)return null;
   const end=(['Zaprimljeno','Odbijen'].includes(a.status)&&a.statusUpdatedAt)?new Date(a.statusUpdatedAt):new Date();
   return Math.max(0,Math.floor((end-s)/60000));
 }
 function fmt(m){return m==null?'—':`${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}`}
 function timerHTML(a){
   const m=duration(a);if(m==null||['Zaprimljeno','Odbijen'].includes(a.status))return '';
   const c=m>=60?'critical':m>=30?'warn':'';
   return `<span class="yard-live-timer ${c}" title="Vrijeme od ulaska u dvorište">⏱ ${fmt(m)} u krugu</span>`;
 }
 window.YardivoTruckTimer={duration,fmt,html:timerHTML};

 // Decorate visible truck cards/icons without replacing the existing yard renderer.
 function decorateYard(){
   const active=load().filter(a=>['U dvorištu','Na rampi'].includes(a.status));
   if(!active.length)return;
   const candidates=document.querySelectorAll('#yard [data-announcement-id],#yard .truck,#yard .yard-truck,#yard .vehicle-card,#yard3d [data-announcement-id]');
   candidates.forEach(el=>{
     let id=el.dataset?.announcementId;
     let a=id?active.find(x=>String(x.id)===String(id)):null;
     if(!a){
       const txt=(el.textContent||'').toUpperCase();
       a=active.find(x=>{const p=String(x.plannedPlate||x.vehiclePlate||x.plate||x.registration||'').toUpperCase();return p&&txt.includes(p)});
     }
     if(!a)return;
     let badge=el.querySelector('.yard-live-timer');
     const tmp=document.createElement('div');tmp.innerHTML=timerHTML(a);const fresh=tmp.firstElementChild;
     if(!fresh){badge?.remove();return}
     if(badge)badge.replaceWith(fresh);else el.appendChild(fresh);
   });
 }
 setInterval(decorateYard,30000);
 document.addEventListener('click',e=>{if(e.target.closest('[data-view="yard"],[data-home-target="yard"]'))setTimeout(decorateYard,80)},true);

 function forecast(){
   const all=load().filter(a=>String(a.date||'')===date());
   const arrivals=all.filter(a=>a.actualTime||a.yardArrivalAt||a.gateCheckedAt);
   const late=arrivals.filter(a=>{
     if(!a.time||!a.actualTime)return false;
     const tm=v=>{const [h,m]=String(v).split(':').map(Number);return h*60+m};
     return tm(a.actualTime)-tm(a.time)>yardivoDelayGraceMinutes();
   }).length;
   const noShow=all.filter(a=>['NO-SHOW','Nije došao','No-show'].includes(a.status)).length;
   const pallets=all.reduce((s,a)=>s+Number(a.pallets||0),0);
   const inYard=all.filter(a=>['U dvorištu','Na rampi'].includes(a.status)).length;
   const byHour={};all.forEach(a=>{const h=String(a.time||'').slice(0,2);if(h)byHour[h]=(byHour[h]||0)+1});
   const peak=Object.entries(byHour).sort((a,b)=>b[1]-a[1])[0];
   return {total:all.length,pallets,late,noShow,inYard,peak:peak?`${peak[0]}:00–${String(Number(peak[0])+1).padStart(2,'0')}:00 (${peak[1]} najava)`:'—'};
 }
 function showForecast(force=false){
   if(!['admin','reception'].includes(role()))return;
   const key=SEEN+date()+'_'+role();if(!force&&sessionStorage.getItem(key))return;
   const f=forecast();let ov=document.getElementById('yardivoForecastOverlay');
   if(!ov){ov=document.createElement('div');ov.id='yardivoForecastOverlay';ov.innerHTML=`<div id="yardivoForecastCard"></div>`;document.body.appendChild(ov)}
   const msg=f.total
    ? `Danas je planirano <strong>${f.total} najava</strong> i <strong>${f.pallets} paleta</strong>. Peak termin: <strong>${f.peak}</strong>. Trenutno u operaciji: <strong>${f.inYard} kamiona</strong>. Evidentirana kašnjenja: <strong>${f.late}</strong>${f.noShow?`, NO-SHOW: <strong>${f.noShow}</strong>`:''}.`
    : 'Za danas još nema spremljenih najava.';
   document.getElementById('yardivoForecastCard').innerHTML=`<div class="yf-head"><div><h2>✦ OPERATIVNA PROGNOZA ZA DANAS</h2><div class="yf-sub">${new Date().toLocaleDateString('hr-HR',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})}</div></div><button id="yfClose">ZATVORI ×</button></div>
    <div class="yf-grid"><div class="yf-kpi"><strong>${f.total}</strong><span>NAJAVA</span></div><div class="yf-kpi"><strong>${f.pallets}</strong><span>PALETA</span></div><div class="yf-kpi"><strong>${f.inYard}</strong><span>U OPERACIJI</span></div><div class="yf-kpi"><strong>${f.late}</strong><span>KAŠNJENJA</span></div></div>
    <div class="yf-message">${msg}</div>`;
   ov.classList.add('show');sessionStorage.setItem(key,'1');
   document.getElementById('yfClose').onclick=()=>ov.classList.remove('show');
 }
 window.YardivoDailyForecast={show:()=>showForecast(true),data:forecast};

 // Forecast remains available through window.YardivoDailyForecast.show(),
 // but never blocks or interrupts the login/Home transition automatically.
 let last='';
 window.addEventListener('yardivo:login',()=>{
   let u='';try{u=String(currentSession?.username||currentSession?.user||currentSession?.name||'')}catch(e){}
   last=role()+'|'+u;
 });
})();
