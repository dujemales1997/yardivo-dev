
(function(){
'use strict';
const EXPORT_VIEWS=[['dashboard','Dashboard'],['dailyMap','Dnevna mapa'],['weeklyMap','Tjedna mapa'],['receiving','Prijam robe'],['overview','Overview'],['announcements','Najave'],['suppliers','Dobavljači'],['orderSearch','Pretraga narudžbi'],['unannounced','Nenajavljeni'],['epal','EPAL'],['incidents','Incidenti'],['incidentArchive','Arhiva incidenata'],['controlTower','Control Tower'],['myYard','My Yard'],['docks','Rampe'],['operations','Operativa'],['reports','Izvještaji']];
function safe(v){return v==null?'':v}
function anns(){try{return Array.isArray(announcements)?announcements:[]}catch(e){return []}}
function incs(){try{return Array.isArray(incidents)?incidents:[]}catch(e){return []}}
function locName(){try{return currentSession?.location==='DU'?'Lokacija 2':'Lokacija 1'}catch(e){return ''}}
function fmt(v){if(!v)return '';const d=new Date(v);return isNaN(d)?String(v):d.toLocaleString('hr-HR')}
function delay(a){try{const d=delayMinutes(a);return d==null?'':Math.round(Number(d))}catch(e){return ''}}
function stat(a){try{return operationalPlanStatus(a)||normalizedPlanStatus(a)||a.status||''}catch(e){return a.status||''}}
function headers(){return ['ID','Datum','Planirano vrijeme','Stvarni dolazak','Skladište','Rampa','Dobavljač','Narudžba','Tablice','Vozač','Palete','SKU','Status','Tip dolaska','Kašnjenje min','Ulaz u dvorište','Dolazak na rampu','Zaprimljeno','Odbijeno','Odgovorna osoba','Napomena']}
function row(a){return [safe(a.id),safe(a.date),safe(a.time),[safe(a.actualDate),safe(a.actualTime)].filter(Boolean).join(' '),safe(a.warehouse),safe(a.dock),safe(a.supplier),safe(a.orderNumber),safe(a.plannedPlate||a.vehiclePlate||a.plate||a.registration),safe(a.plannedDriver||a.driverNameCanonical||a.driver||a.driverName),Number(a.pallets||0),Number(a.sku||0),stat(a),a.arrivalType==='UNANNOUNCED'?'Nenajavljeni':'Najavljeni',delay(a),fmt(a.yardArrivalAt),fmt(a.dockArrivalAt),fmt(a.receivedAt),fmt(a.rejectedAt),safe(a.responsible||a.owner),safe(a.note||a.notes||a.unannouncedNote)]}
function annSheet(name,data,meta){return {name,headers:headers(),rows:data.map(row),meta:meta||[]}}
function supplierNames(){
  try{if(YardivoOverviewSupplierLock?.masterSupplierNames)return YardivoOverviewSupplierLock.masterSupplierNames()}catch(e){}
  const s=new Set();anns().forEach(a=>a.supplier&&s.add(a.supplier));incs().forEach(i=>i.supplier&&s.add(i.supplier));return [...s].sort((a,b)=>String(a).localeCompare(String(b),'hr'));
}
function overviewSheet(){
  const rows=supplierNames().map(name=>{
    let s=null;try{s=YardivoOverviewMaster?.supplierStat?.(name,anns(),incs())}catch(e){}
    return s?[name,s.score10==null?'':s.score10,s.reliability==null?'':s.reliability,s.arrived,s.on,s.late,s.avgLate,s.incidents,s.noShow,s.rejected,s.unannounced,s.pallets]:[name,'','','','','','','','','','',''];
  });
  return {name:'Dobavljači',headers:['Dobavljač','Score 1-10','Pouzdanost %','Dolasci','Na vrijeme','Kašnjenja','Avg kašnjenje min','Incidenti','No-show','Odbijeno','Nenajavljeni','Palete'],rows,meta:[['YARDIVO','Overview dobavljača'],['Lokacija',locName()],['Generirano',new Date().toLocaleString('hr-HR')]]};
}
function incidentSheet(){return {name:'Incidenti',headers:['ID','Datum','Dobavljač','Tip','Težina','Palete','SKU','Najava ID','Opis','Kreirao','Kreirano'],rows:incs().map(i=>[safe(i.id),safe(i.date),safe(i.supplier),safe(i.type||i.reason),safe(i.severity),Number(i.pallets||0),Number(i.sku||0),safe(i.announcementId),safe(i.note||i.description),safe(i.createdBy),fmt(i.createdAt)])}}
function epalSheets(){
  let tx=[];try{tx=JSON.parse(localStorage.getItem('yardivo_epal_transactions_v1')||'[]');if(!Array.isArray(tx))tx=[]}catch(e){}
  const m=new Map();tx.forEach(t=>{const k=[t.supplier,t.location,t.warehouse].join('|||');if(!m.has(k))m.set(k,{supplier:t.supplier,location:t.location,warehouse:t.warehouse,received:0,returned:0});const x=m.get(k);x.received+=Number(t.received||0);x.returned+=Number(t.returned||0)});
  return [
    {name:'EPAL Stanje',headers:['Dobavljač','Lokacija','Skladište','Primljeno','Vraćeno','Saldo'],rows:[...m.values()].map(x=>[x.supplier,x.location,x.warehouse,x.received,x.returned,x.received-x.returned]),meta:[['YARDIVO','Stanje europaleta']]},
    {name:'EPAL Transakcije',headers:['Datum','Dobavljač','Lokacija','Skladište','Najava ID','Primljeno','Vraćeno','Saldo promjena','Napomena','Korisnik'],rows:tx.map(t=>[fmt(t.createdAt||t.date),safe(t.supplier),safe(t.location),safe(t.warehouse),safe(t.announcementId),Number(t.received||0),Number(t.returned||0),Number(t.received||0)-Number(t.returned||0),safe(t.note),safe(t.createdBy)])}
  ];
}
function weekDates(){try{const m=mondayOfIsoWeek(weeklyMapSelection.year,weeklyMapSelection.week),f=new Date(m);f.setDate(f.getDate()+4);return [m,f]}catch(e){return [null,null]}}
function dailyData(){const d=document.getElementById('dailyMapDate')?.value||'',w=document.getElementById('dailyMapWarehouseSelect')?.value||'';return anns().filter(a=>(!d||a.date===d)&&(!w||a.warehouse===w))}
function weeklyData(){const [m,f]=weekDates(),w=document.getElementById('weeklyMapWarehouse')?.value||'';if(!m||!f)return [];return anns().filter(a=>{const d=new Date((a.date||'')+'T12:00:00');return (!w||a.warehouse===w)&&d>=m&&d<=f})}
function receivingData(){try{return receivingFilteredData()}catch(e){return anns()}}

function objSheet(name,list){
  const a=Array.isArray(list)?list.filter(Boolean):[];
  const keys=[...new Set(a.flatMap(o=>Object.keys(o||{})))];
  return {name,headers:keys,rows:a.map(o=>keys.map(k=>{
    const v=o?.[k];
    if(v==null)return '';
    if(typeof v==='object'){try{return JSON.stringify(v)}catch(_){return String(v)}}
    return v;
  }))};
}
function supplierSheet(){
  const names=supplierNames();
  return {name:'Dobavljači',headers:['Dobavljač','Broj najava','Palete','Incidenti','Nenajavljeni','Lokacija'],rows:names.map(n=>{
    const aa=anns().filter(a=>String(a.supplier||'')===String(n));
    const ii=incs().filter(i=>String(i.supplier||'')===String(n));
    return [n,aa.length,aa.reduce((s,a)=>s+Number(a.pallets||0),0),ii.length,aa.filter(a=>a.arrivalType==='UNANNOUNCED').length,locName()];
  })};
}
function notificationsSheet(){
  let x=[];try{x=JSON.parse(localStorage.getItem('yardivo_live_notifications_v1')||'[]');if(!Array.isArray(x))x=[]}catch(_){}
  return objSheet('Notifikacije',x);
}
function dockSheet(){
  const rows=[];
  try{
    document.querySelectorAll('#dockGrid .dock-live-card,#docks .dock-live-card,#docks [data-dock]').forEach((el,i)=>{
      rows.push([el.dataset.dock||el.dataset.ramp||i+1,(el.querySelector('strong,h3,.dock-title')?.textContent||'').trim(),(el.textContent||'').replace(/\s+/g,' ').trim()]);
    });
  }catch(_){}
  return {name:'Rampe',headers:['Rampa','Naziv','Stanje / sadržaj'],rows};
}

function payload(view){
  const d=new Date(),stamp=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  if(view==='dashboard'){
 const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,A=anns().filter(a=>a.date===iso),I=incs().filter(i=>i.date===iso);
 const arrived=A.filter(a=>a.actualDate||a.actualTime||a.yardArrivalAt||a.dockArrivalAt||a.receivedAt||a.rejectedAt);
 const received=A.filter(a=>a.receivedAt||/zaprim|zavr|received/i.test(String(a.status||''))),rejected=A.filter(a=>a.rejectedAt||/odbij|reject/i.test(String(a.status||'')));
 const pending=A.filter(a=>!received.includes(a)&&!rejected.includes(a)),late=arrived.filter(a=>{try{return Number(delayMinutes(a)||0)>yardivoDelayGraceMinutes()}catch(_){return false}}),onTime=Math.max(0,arrived.length-late.length);
 const noShow=A.filter(a=>{try{return ['NIJE DOŠAO','NO-SHOW'].includes(operationalPlanStatus(a))}catch(_){return false}}),pallets=A.reduce((n,a)=>n+Number(a.pallets||0),0),sku=A.reduce((n,a)=>n+Number(a.sku||0),0);
 const avgLate=late.length?Math.round(late.reduce((n,a)=>{try{return n+Number(delayMinutes(a)||0)}catch(_){return n}},0)/late.length):0;
 const summary={name:'Dnevni izvještaj',headers:['POKAZATELJ','REZULTAT'],rows:[['Planirano danas',A.length],['Stiglo',arrived.length],['Zaprimljeno',received.length],['Odbijeno',rejected.length],['Još čeka / nije završeno',pending.length],['Na vrijeme',onTime],['Točnost dolazaka',arrived.length?Math.round(onTime/arrived.length*100)+'%':'0%'],[`Kašnjenja > ${Number(window.YardivoDelayRulesV1?.get?.().graceMinutes??TOLERANCE_MIN)} min`,late.length],[`No-show nakon ${String(window.YardivoDelayRulesV1?.get?.().noShowAt||'14:00')}`,noShow.length],['Prosječno kašnjenje',avgLate+' min'],['Palete',pallets],['SKU',sku],['Dobavljači',new Set(A.map(a=>a.supplier).filter(Boolean)).size],['Incidenti',I.length]],meta:[['YARDIVO','DNEVNO STANJE PRIJAMA'],['Datum',iso],['Lokacija',locName()],['Generirano',new Date().toLocaleString('hr-HR')]]};
 const detail=annSheet('Detalj prijama',A,[['YARDIVO','Dnevni detalj prijama'],['Datum',iso],['Lokacija',locName()]]);
 const incidentToday={...incidentSheet(),name:'Incidenti danas',rows:I.map(i=>[safe(i.id),safe(i.date),safe(i.supplier),safe(i.type||i.reason),safe(i.severity),Number(i.pallets||0),Number(i.sku||0),safe(i.announcementId),safe(i.note||i.description),safe(i.createdBy),fmt(i.createdAt)])};
 return {fileName:`YARDIVO_Dnevno_stanje_prijama_${iso}.xlsx`,sheets:[summary,detail,incidentToday],dashboardReport:true};
}
  if(view==='announcements')return {fileName:`YARDIVO_Najave_${stamp}.xlsx`,sheets:[annSheet('Najave',anns(),[['YARDIVO','Sve najave'],['Lokacija',locName()]])]};
  if(view==='suppliers')return {fileName:`YARDIVO_Dobavljaci_${stamp}.xlsx`,sheets:[supplierSheet(),annSheet('Najave dobavljača',anns()),incidentSheet()]};
  if(view==='orderSearch')return {fileName:`YARDIVO_Narudzbe_${stamp}.xlsx`,sheets:[annSheet('Narudžbe',anns().filter(a=>a.orderNumber),[['YARDIVO','Pretraga narudžbi']])]};
  if(view==='incidentArchive')return {fileName:`YARDIVO_Arhiva_incidenata_${stamp}.xlsx`,sheets:[incidentSheet()]};
  if(view==='myYard')return {fileName:`YARDIVO_My_Yard_${stamp}.xlsx`,sheets:[annSheet('My Yard',anns(),[['YARDIVO','My Yard'],['Lokacija',locName()]])]};
  if(view==='docks')return {fileName:`YARDIVO_Rampe_${stamp}.xlsx`,sheets:[dockSheet(),annSheet('Najave po rampama',anns())]};
  if(view==='operations')return {fileName:`YARDIVO_Operativa_${stamp}.xlsx`,sheets:[notificationsSheet(),annSheet('Najave',anns()),incidentSheet()]};
  if(view==='reports')return {fileName:`YARDIVO_Izvjestaji_${stamp}.xlsx`,sheets:[supplierSheet(),annSheet('Sve najave',anns()),incidentSheet(),notificationsSheet()]};
  if(view==='dailyMap'){const date=document.getElementById('dailyMapDate')?.value||'',w=document.getElementById('dailyMapWarehouseSelect')?.value||'';return {fileName:`YARDIVO_Dnevna_mapa_${date||stamp}.xlsx`,sheets:[annSheet('Dnevna mapa',dailyData(),[['YARDIVO','Dnevna mapa'],['Datum',date],['Skladište',w],['Lokacija',locName()]])]}}
  if(view==='weeklyMap'){const [m,f]=weekDates(),w=document.getElementById('weeklyMapWarehouse')?.value||'',a=m?localIsoDate(m):'',b=f?localIsoDate(f):'';return {fileName:`YARDIVO_Tjedna_mapa_${a||stamp}.xlsx`,sheets:[annSheet('Tjedna mapa',weeklyData(),[['YARDIVO','Tjedna mapa'],['Period',`${a} - ${b}`],['Skladište',w],['Lokacija',locName()]])]}}
  if(view==='receiving')return {fileName:`YARDIVO_Prijam_${stamp}.xlsx`,sheets:[annSheet('Prijam robe',receivingData(),[['YARDIVO','Prijam robe'],['Lokacija',locName()]])]}
  if(view==='overview')return {fileName:`YARDIVO_Overview_${stamp}.xlsx`,sheets:[overviewSheet(),annSheet('Sve najave',anns()),incidentSheet()]}
  if(view==='unannounced')return {fileName:`YARDIVO_Nenajavljeni_${stamp}.xlsx`,sheets:[annSheet('Nenajavljeni',anns().filter(a=>a.arrivalType==='UNANNOUNCED'),[['YARDIVO','Nenajavljeni dolasci']])]}
  if(view==='epal')return {fileName:`YARDIVO_EPAL_${stamp}.xlsx`,sheets:epalSheets()}
  if(view==='incidents')return {fileName:`YARDIVO_Incidenti_${stamp}.xlsx`,sheets:[incidentSheet()]}
  if(view==='controlTower')return {fileName:`YARDIVO_Control_Tower_${stamp}.xlsx`,sheets:[annSheet('Control Tower',anns(),[['YARDIVO','Control Tower'],['Lokacija',locName()]])]}
  return null;
}
function download(res){const bin=atob(res.base64),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);const blob=new Blob([bytes],{type:res.mimeType}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=res.fileName||'YARDIVO_Export.xlsx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function exportView(view,btn){
  const p=payload(view);if(!p)return;
  if(!window.XLSX){alert('XLSX biblioteka nije učitana.');return}
  try{
    if(btn){btn.classList.add('yardivo-exporting');btn.textContent='GENERIRAM XLSX...'}
    const wb=XLSX.utils.book_new();
    const sheets=Array.isArray(p.sheets)&&p.sheets.length?p.sheets:[{name:p.sheetName||view,headers:p.headers||[],rows:p.rows||[]}];
    sheets.forEach(s=>{
      const body=[...(Array.isArray(s.meta)?s.meta:[])];
      if(body.length)body.push([]);
      body.push(Array.isArray(s.headers)?s.headers:[]);
      (s.rows||[]).forEach(r=>body.push(r));
      const ws=XLSX.utils.aoa_to_sheet(body);
      if(p.dashboardReport){
        const hr=(Array.isArray(s.meta)?s.meta.length+1:0);
        ws['!freeze']={xSplit:0,ySplit:hr+1,topLeftCell:'A'+(hr+2),activePane:'bottomLeft',state:'frozen'};
        if((s.headers||[]).length)ws['!autofilter']={ref:XLSX.utils.encode_range({s:{r:hr,c:0},e:{r:Math.max(hr,body.length-1),c:Math.max(0,s.headers.length-1)}})};
        for(let c=0;c<(s.headers||[]).length;c++){const cell=ws[XLSX.utils.encode_cell({r:hr,c})];if(cell)cell.s={font:{bold:true},alignment:{vertical:'center',wrapText:true}}}
      }
      const maxCols=Math.max(1,...body.map(r=>r.length));
      ws['!cols']=Array.from({length:maxCols},(_,c)=>{
        let n=10;
        for(let r=0;r<Math.min(body.length,500);r++)n=Math.max(n,String(body[r]?.[c]??'').length);
        return {wch:Math.min(42,n+2)};
      });
      XLSX.utils.book_append_sheet(wb,ws,String(s.name||view||'YARDIVO').slice(0,31));
    });
    XLSX.writeFile(wb,p.fileName||('YARDIVO_'+view+'_'+window.yardivoLocalDateV583()+'.xlsx'));
  }catch(e){alert('Greška XLSX exporta: '+(e?.message||e))}
  finally{if(btn){btn.classList.remove('yardivo-exporting');btn.innerHTML='📊 EXPORT XLSX'}}
}
function add(view,label){
  const root=document.getElementById(view);if(!root)return;
  const title=root.querySelector(':scope > .section-title')||root.querySelector('.section-title')||root.querySelector('.overview-hero');
  if(!title||title.querySelector(`[data-xlsx-view="${view}"]`))return;
  const b=document.createElement('button');b.type='button';b.className='yardivo-export-btn';b.dataset.xlsxView=view;b.innerHTML='📊 EXPORT XLSX';b.title=`Izvezi ${label} u Excel`;b.onclick=()=>exportView(view,b);title.appendChild(b);
}
function init(){EXPORT_VIEWS.forEach(x=>add(x[0],x[1]))}
window.YardivoXlsxExport={init,exportView,payload};
document.addEventListener('DOMContentLoaded',init);window.addEventListener('load',()=>setTimeout(init,700));setInterval(init,3000);
})();
