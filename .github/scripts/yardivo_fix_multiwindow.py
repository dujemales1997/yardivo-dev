from pathlib import Path
import re, subprocess

p=Path("index.html")
s=p.read_text(encoding="utf-8")

old="{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storage:window.sessionStorage,storageKey:(window.YardivoTabAuthV583?.storageKey||('yardivo-auth-'+Math.random().toString(36).slice(2)))}}"
new="{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storage:window.sessionStorage,storageKey:(window.YardivoTabAuthV583?.storageKey||('yardivo-auth-'+Math.random().toString(36).slice(2))),lock:async(_name,_timeout,fn)=>await fn()}}"
cnt=s.count(old)
if cnt < 2:
    raise SystemExit(f"Expected >=2 auth configs, found {cnt}")
s=s.replace(old,new)

anchor="async function authenticate(){\n  const username="
if anchor not in s:
    raise SystemExit("canonical authenticate anchor missing")
helper="""function withLoginTimeout(promise,ms,label){
  let timer;
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(label||'SERVER NIJE ODGOVORIO — pokušaj ponovno.')),ms)})
  ]).finally(()=>clearTimeout(timer))
}

async function authenticate(){
  const username="""
s=s.replace(anchor,helper,1)

oldset="""      const {error:setSessionError}=await authClient.auth.setSession({
        access_token:auth.access_token,
        refresh_token:auth.refresh_token
      });"""
newset="""      const {error:setSessionError}=await withLoginTimeout(authClient.auth.setSession({
        access_token:auth.access_token,
        refresh_token:auth.refresh_token
      }),7000,'AUTH SESSION NIJE ODGOVORIO — pokušaj ponovno.');"""
if oldset not in s:
    raise SystemExit("canonical setSession anchor missing")
s=s.replace(oldset,newset,1)

oldonline="    const connected=await window.YardivoSupabase.authenticate(auth.access_token,auth.refresh_token);"
newonline="    const connected=await withLoginTimeout(window.YardivoSupabase.authenticate(auth.access_token,auth.refresh_token),10000,'ONLINE BAZA NIJE ODGOVORILA — pokušaj ponovno.');"
if oldonline not in s:
    raise SystemExit("online authenticate anchor missing")
s=s.replace(oldonline,newonline,1)

# Supplier history must keep waiting rows out.
required="const history=rows.filter(x=>!['pending','revision_requested','proposal_sent'].includes(statusKey(x.status)))"
if required not in s:
    raise SystemExit("supplier history filter missing")

p.write_text(s,encoding="utf-8")

# Syntax-check the touched canonical scripts.
for sid in [
    "yardivo-auth-driver-role-final-fix",
    "yardivo-canonical-login-router-v2-20260901",
    "yardivo-v583-supplier-history-status-server-authority-20260923",
]:
    m=re.search(r'<script[^>]+id="'+re.escape(sid)+r'"[^>]*>(.*?)</script>',s,re.S)
    if not m:
        raise SystemExit("missing script "+sid)
    q=Path("/tmp")/(sid+".js")
    q.write_text(m.group(1),encoding="utf-8")
    subprocess.check_call(["node","--check",str(q)])

# Remove temporary/broken automation files so they no longer run on future pushes.
for q in [
    Path(".github/workflows/yardivo-login-multiwindow-inspect.yml"),
    Path(".github/workflows/yardivo-supplier-settings-clean.yml"),
    Path(".github/scripts/yardivo_fix_multiwindow.py"),
]:
    if q.exists():
        q.unlink()
