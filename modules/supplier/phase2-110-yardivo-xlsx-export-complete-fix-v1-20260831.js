
(function(){
'use strict';
function fullObjectSheet(name,items){
 const list=Array.isArray(items)?items:[];
 const keys=[...new Set(list.flatMap(o=>Object.keys(o||{})))];
 const rows=list.map(o=>keys.map(k=>{
   const v=o?.[k];
   if(v==null)return '';
   if(typeof v==='object'){try{return JSON.stringify(v)}catch(_){return String(v)}}
   return v;
 }));
 return {name,headers:keys,rows};
}
function appendSheet(wb,s){
 const meta=Array.isArray(s.meta)?s.meta:[];
 const body=[...meta];
 if(meta.length)body.push([]);
 body.push(Array.isArray(s.headers)?s.headers:[]);
 (s.rows||[]).forEach(r=>body.push(r));
 const ws=XLSX.utils.aoa_to_sheet(body);
 // Practical widths so every export opens legibly.
 const maxCols=Math.max(1,...body.map(r=>r.length));
 ws['!cols']=Array.from({length:maxCols},(_,c)=>{
   let n=10;for(let r=0;r<Math.min(body.length,500);r++)n=Math.max(n,String(body[r]?.[c]??'').length);
   return {wch:Math.min(42,n+2)};
 });
 XLSX.utils.book_append_sheet(wb,ws,String(s.name||'YARDIVO').slice(0,31));
}
function exportOverview(btn){
 if(!window.XLSX){alert('XLSX biblioteka nije učitana.');return}
 try{
  if(btn){btn.classList.add('yardivo-exporting');btn.textContent='GENERIRAM XLSX...'}
  const A=(()=>{try{return Array.isArray(announcements)?announcements:[]}catch(_){return[]}})();
  const I=(()=>{try{return Array.isArray(incidents)?incidents:[]}catch(_){return[]}})();
  const wb=XLSX.utils.book_new();
  const names=window.YardivoOverviewMaster?.allSupplierNames?.()||[...new Set([...A.map(a=>a.supplier),...I.map(i=>i.supplier)].filter(Boolean))];
  const stats=names.map(n=>window.YardivoOverviewMaster?.supplierStat?.(n,A,I)).filter(Boolean);
  appendSheet(wb,{name:'Overview',headers:['Dobavljač','Score 1-10','Pouzdanost %','Evaluirano','Dolasci','Na vrijeme','Kašnjenja','Avg kašnjenje min','Točnost %','Incidenti','No-show','Odbijeno','Zaprimljeno','Nenajavljeni','Promjene termina','Avg istovar min','Palete'],
   rows:stats.map(s=>[s.name,s.score10??'',s.reliability??'',s.evaluated??'',s.arrived??'',s.on??'',s.late??'',s.avgLate??'',s.punctuality??'',s.incidents??'',s.noShow??'',s.rejected??'',s.received??'',s.unannounced??'',s.changes??'',s.avgUnload??'',s.pallets??'']),
   meta:[['YARDIVO','Kompletan Overview export'],['Generirano',new Date().toLocaleString('hr-HR')],['Broj dobavljača',stats.length],['Broj najava',A.length],['Broj incidenata',I.length]]});
  appendSheet(wb,fullObjectSheet('Sve najave - sva polja',A));
  appendSheet(wb,fullObjectSheet('Svi incidenti - sva polja',I));
  const stamp=window.yardivoLocalDateV583();
  XLSX.writeFile(wb,`YARDIVO_Overview_SVE_${stamp}.xlsx`);
 }catch(e){alert('Greška XLSX exporta: '+(e?.message||e))}
 finally{if(btn){btn.classList.remove('yardivo-exporting');btn.innerHTML='📊 EXPORT XLSX'}}
}
function hook(){
 const b=document.querySelector('#overview [data-xlsx-view="overview"],#overview .yardivo-export-btn');
 if(b&&!b.dataset.completeOverview){b.dataset.completeOverview='1';b.onclick=()=>exportOverview(b);b.title='Izvezi kompletan Overview, sve najave i sve incidente u Excel'}
}
window.addEventListener('load',()=>setTimeout(hook,1000));
document.addEventListener('click',e=>{if(e.target.closest('[data-view="overview"],[data-home-target="overview"]'))setTimeout(hook,150)},true);
setInterval(hook,3000);
window.YardivoOverviewFullXlsx={export:exportOverview};
})();
