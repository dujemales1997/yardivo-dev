
document.addEventListener('DOMContentLoaded',()=>{
  const infoCandidates=[...document.querySelectorAll('.panel,.card')];
  const target=infoCandidates.find(el=>/terminal|info/i.test(el.textContent||''));
  if(target){
    const note=document.createElement('div');
    note.style.marginTop='10px';
    note.style.opacity='.85';
    note.innerHTML='<strong>Zaprimanje robe:</strong> 06:00–13:00 &nbsp; • &nbsp; <strong>Broj rampi:</strong> 6';
    target.appendChild(note);
  }
});
