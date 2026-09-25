(()=>{'use strict';
 const pad=n=>String(n).padStart(2,'0');
 const opt=(n,max,selected)=>Array.from({length:max},(_,i)=>`<option value="${pad(i)}"${i===selected?' selected':''}>${pad(i)}</option>`).join('');
 function upgrade(input){
  if(!input||input.dataset.yv583TimeUpgraded==='1')return;
  const val=/^\\d{2}:\\d{2}$/.test(input.value)?input.value:'00:00', parts=val.split(':').map(Number);
  input.dataset.yv583TimeUpgraded='1'; input.classList.add('yv583-time-native');
  const box=document.createElement('div');box.className='yv583-time-control';
  box.innerHTML=`<div class="yv583-time-pair-label"><span>SAT (00–23)</span><span>MINUTA (00–59)</span></div><div class="yv583-time-pair"><select aria-label="Sat">${opt(0,24,parts[0])}</select><span class="yv583-colon">:</span><select aria-label="Minuta">${opt(0,60,parts[1])}</select></div>`;
  input.insertAdjacentElement('afterend',box); const sels=box.querySelectorAll('select');
  const sync=()=>{input.value=`${sels[0].value}:${sels[1].value}`;input.setAttribute('value',input.value);input.dispatchEvent(new Event('input',{bubbles:true}));};
  sels.forEach(x=>x.addEventListener('change',sync));
 }
 function upgradeAll(){document.querySelectorAll('input[type="time"][data-sm-wh-from],input[type="time"][data-sm-wh-to]').forEach(upgrade);}
 function removeNNN(){document.querySelectorAll('body *').forEach(el=>{if(el.children.length===0&&el.textContent.trim()==='NNN')el.remove();});}
 const refresh=()=>{upgradeAll();removeNNN();};
 /* NO-FLICKER: no full Master rescan on every click/cloud event. */
 refresh(); setTimeout(refresh,0);
 document.addEventListener('click',e=>{if(e.target.closest?.('#yardivoMasterPopupLaunchV583,[data-sm-ramp-delta],[data-sm-add-wh],[data-sm-save-ops],[data-sm-save-ramp]'))setTimeout(refresh,0)},true);
 document.addEventListener('change',e=>{if(e.target?.id==='smConfigWarehouse')setTimeout(refresh,0)},true);
})();
