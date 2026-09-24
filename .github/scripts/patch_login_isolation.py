from pathlib import Path
import re, subprocess

p=Path("index.html")
s=p.read_text(encoding="utf-8")

helper="""<script id="yardivo-tab-auth-isolation-v583">
(function(){
'use strict';
if(window.YardivoTabAuthV583)return;
let id='';
try{
  id=String(window.name||'').match(/^yardivo-auth-tab-(.+)$/)?.[1]||'';
  if(!id){
    id=(crypto?.randomUUID?.()||('t'+Date.now().toString(36)+Math.random().toString(36).slice(2)));
    window.name='yardivo-auth-tab-'+id;
  }
}catch(_){id='t'+Date.now().toString(36)+Math.random().toString(36).slice(2)}
const safe=id.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80)||('t'+Date.now());
window.YardivoTabAuthV583={id:safe,storageKey:'yardivo-auth-'+safe};
})();
</script>"""
anchor='<script id="yardivo-auth-driver-role-final-fix">'
if 'id="yardivo-tab-auth-isolation-v583"' not in s:
    if anchor not in s: raise SystemExit("auth anchor missing")
    s=s.replace(anchor,helper+"\n"+anchor,1)

old="{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storage:window.sessionStorage}}"
new="{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storage:window.sessionStorage,storageKey:(window.YardivoTabAuthV583?.storageKey||('yardivo-auth-'+Math.random().toString(36).slice(2)))}}"
if old not in s: raise SystemExit("auth client option anchor missing")
s=s.replace(old,new)

old_fetch="""async function fetchJSON(url,options={},timeoutMs=10000){
  let lastError=null;
  for(let attempt=0;attempt<2;attempt++){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const res=await fetch(url,{...options,signal:controller.signal});
      const data=await res.json().catch(()=>({}));
      return {res,data};
    }catch(e){
      lastError=e;
      const transient=e?.name==='AbortError'||/Failed to fetch|NetworkError|Load failed/i.test(String(e?.message||e));
      if(!transient||attempt>=1)throw e;
      await new Promise(r=>setTimeout(r,300));
    }finally{
      clearTimeout(timer);
    }
  }
  throw lastError||new Error('NETWORK_REQUEST_FAILED');
}"""
new_fetch="""async function fetchJSON(url,options={},timeoutMs=12000){
  let lastError=null;
  for(let attempt=0;attempt<3;attempt++){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const res=await fetch(url,{...options,cache:'no-store',signal:controller.signal});
      const data=await res.json().catch(()=>({}));
      return {res,data};
    }catch(e){
      lastError=e;
      const transient=e?.name==='AbortError'||/Failed to fetch|NetworkError|Load failed|network request failed/i.test(String(e?.message||e));
      if(!transient||attempt>=2)throw e;
      await new Promise(r=>setTimeout(r,350*(attempt+1)));
    }finally{
      clearTimeout(timer);
    }
  }
  throw lastError||new Error('NETWORK_REQUEST_FAILED');
}"""
if old_fetch not in s: raise SystemExit("canonical fetchJSON anchor missing")
s=s.replace(old_fetch,new_fetch,1)

old_signout="""const c=await authClient();
    await c.auth.signOut({scope:'local'}).catch(()=>{});
    const {data,error}=await c.auth.signInWithPassword"""
new_signout="""const c=await authClient();
    try{await Promise.race([c.auth.signOut({scope:'local'}),new Promise(r=>setTimeout(r,1200))])}catch(_){}
    const {data,error}=await c.auth.signInWithPassword"""
if old_signout not in s: raise SystemExit("signout anchor missing")
s=s.replace(old_signout,new_signout,1)

p.write_text(s,encoding="utf-8")

assert 'yardivo-tab-auth-isolation-v583' in s
assert 'storageKey:(window.YardivoTabAuthV583?.storageKey' in s
assert 'for(let attempt=0;attempt<3;attempt++)' in s
assert "cache:'no-store'" in s
assert "Promise.race([c.auth.signOut({scope:'local'})" in s

for sid in ["yardivo-tab-auth-isolation-v583","yardivo-auth-driver-role-final-fix","yardivo-canonical-login-router-v2-20260901"]:
    m=re.search(r'<script[^>]+id="'+re.escape(sid)+r'"[^>]*>(.*?)</script>',s,re.S)
    if not m: raise SystemExit("missing "+sid)
    q=Path("/tmp")/(sid+".js")
    q.write_text(m.group(1),encoding="utf-8")
    subprocess.check_call(["node","--check",str(q)])
subprocess.check_call(["git","diff","--check"])
