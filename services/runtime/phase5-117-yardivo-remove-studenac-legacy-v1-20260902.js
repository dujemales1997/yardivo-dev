
(function(){
 try{
   const migrations=[
     ['studenac'+'_yms_announcements','yardivo_yms_announcements_v1'],
     ['studenac'+'_yms_incidents','yardivo_yms_incidents_v1']
   ];
   for(const [oldKey,newKey] of migrations){
     const oldValue=localStorage.getItem(oldKey);
     if(oldValue!=null && localStorage.getItem(newKey)==null)localStorage.setItem(newKey,oldValue);
     localStorage.removeItem(oldKey);
   }
   for(const qk of ['yardivo_supabase_offline_queue_v1','yardivo_supabase_offline_queue_v2']){
     localStorage.removeItem(qk);
   }
 }catch(_){}
})();
