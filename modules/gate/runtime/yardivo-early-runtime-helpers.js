(function(){
  if(typeof window.isoLocal!=='function'){
    window.isoLocal=function(d){
      d=d instanceof Date?d:new Date(d);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    };
  }
  // Some first-paint renderers execute before the later identity module is parsed.
  // The real implementation replaces this fallback later in the document.
  if(typeof window.syncAllAnnouncementIdentities!=='function'){
    window.syncAllAnnouncementIdentities=function(){ return true; };
  }
  if(typeof window.effectivePlate!=='function'){
    window.effectivePlate=function(a){return String(a?.arrivalPlate||a?.plannedPlate||a?.plate||a?.vehiclePlate||'').trim();};
  }
  if(typeof window.effectiveDriver!=='function'){
    window.effectiveDriver=function(a){return String(a?.arrivalDriver||a?.plannedDriver||a?.driverNameCanonical||a?.driver||a?.driverName||'').trim();};
  }
  if(typeof window.identityDisplayHtml!=='function'){
    window.identityDisplayHtml=function(a){
      const p=window.effectivePlate(a)||'—',d=window.effectiveDriver(a)||'—';
      return `${p}<br><small>${d}</small>`;
    };
  }
  if(typeof window.isNoShow!=='function'){
    window.isNoShow=function(a){return /NO.?SHOW|NIJE DOŠAO/i.test(String(a?.status||''));};
  }
})();
