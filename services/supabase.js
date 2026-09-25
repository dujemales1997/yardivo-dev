(function(){
'use strict';
if(window.YardivoSupabaseClient)return;

const BASE='https://rskticdbiovvgyocpzoc.supabase.co';
const KEY='sb_publishable_NWRcS2n-8GxF8qL7wXbZ-Q_-jIyfGoy';

function options(){
  return {
    auth:{
      persistSession:true,
      autoRefreshToken:true,
      detectSessionInUrl:false,
      storage:window.sessionStorage,
      storageKey:(window.YardivoTabAuthV583?.storageKey||('yardivo-auth-'+Math.random().toString(36).slice(2))),
      lock:async(_name,_timeout,fn)=>await fn()
    }
  };
}

async function client(){
  if(window.__yardivoAuthClient)return window.__yardivoAuthClient;
  if(!window.supabase?.createClient)throw new Error('Supabase biblioteka nije učitana.');
  window.__yardivoAuthClient=window.supabase.createClient(BASE,KEY,options());
  return window.__yardivoAuthClient;
}

window.YardivoSupabaseClient={
  base:BASE,
  publishableKey:KEY,
  options,
  client
};
})();
