from pathlib import Path
import re, json, hashlib

p=Path("index.html")
original=p.read_text(encoding="utf-8")
html=original

# CSS: move active style blocks to one cacheable stylesheet, keep disabled media blocks in place.
style_re=re.compile(r'<style([^>]*)>([\s\S]*?)</style>',re.I)
active=[]
for m in style_re.finditer(original):
    attrs,body=m.group(1),m.group(2)
    if re.search(r'\bmedia=["\']not all["\']',attrs,re.I):
        continue
    sidm=re.search(r'\bid=["\']([^"\']+)',attrs,re.I)
    sid=sidm.group(1) if sidm else ""
    active.append((m.start(),m.end(),sid,attrs,body))

Path("styles").mkdir(exist_ok=True)
css="".join(f"\n/* YARDIVO STYLE: {sid or 'anonymous'} */\n{body}\n" for _,_,sid,_,body in active)
Path("styles/yardivo-runtime.css").write_text(css,encoding="utf-8")
if active:
    link='<link id="yardivo-runtime-styles" rel="stylesheet" href="styles/yardivo-runtime.css?v=20260925">'
    for a,b,_,_,_ in reversed(active[1:]):
        html=html[:a]+html[b:]
    a,b=active[0][0],active[0][1]
    html=html[:a]+link+html[b:]

# JS: behavior-preserving externalization of large classic scripts.
script_re=re.compile(r'<script([^>]*)>([\s\S]*?)</script>',re.I)
def slug(v):
    return (re.sub(r'[^a-zA-Z0-9._-]+','-',v).strip('-').lower()[:150] or "script")
def category(sid,body):
    t=(sid+" "+body[:800]).lower()
    if "supplier" in t:return "supplier"
    if any(x in t for x in ("supabase","online-sync","auth","login","session","user-scope")):return "services"
    if any(x in t for x in ("master","warehouse","location","ramp")):return "master-data"
    if "notification" in t:return "notifications"
    if any(x in t for x in ("operational-chat","help-chat","chat")):return "chat"
    if any(x in t for x in ("self-gate","gate","qr")):return "gate"
    if any(x in t for x in ("receiving","reception")):return "receiving"
    if "inventory" in t:return "inventory"
    if any(x in t for x in ("analytics","overview","control-tower")):return "analytics"
    if any(x in t for x in ("ai-","voice","assistant")):return "ai"
    if any(x in t for x in ("settings","theme","light-mode","dark-")):return "settings"
    return "legacy"

selected=[]
for idx,m in enumerate(script_re.finditer(html),1):
    attrs,body=m.group(1),m.group(2)
    if re.search(r'\bsrc\s*=',attrs,re.I): continue
    tm=re.search(r'\btype=["\']([^"\']+)',attrs,re.I)
    typ=tm.group(1) if tm else ""
    if typ and typ.lower() not in ("text/javascript","application/javascript","module"):continue
    if len(body)<5000 or "document.currentScript" in body:continue
    sm=re.search(r'\bid=["\']([^"\']+)',attrs,re.I)
    sid=sm.group(1) if sm else f"script-{idx:03d}"
    if sid=="yardivo-delay-settings-v1":continue
    out=Path("modules")/category(sid,body)/(slug(sid)+".js")
    selected.append((m.start(),m.end(),attrs,body,sid,out))

seen={}
norm=[]
for a,b,attrs,body,sid,out in selected:
    key=str(out)
    seen[key]=seen.get(key,0)+1
    if seen[key]>1: out=out.with_name(out.stem+f"-{seen[key]}"+out.suffix)
    norm.append((a,b,attrs,body,sid,out))
selected=norm
manifest=[]
for _,_,attrs,body,sid,out in selected:
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(body,encoding="utf-8")
    manifest.append({"id":sid,"path":str(out).replace("\\","/"),"bytes":len(body.encode()),"sha256":hashlib.sha256(body.encode()).hexdigest(),"category":out.parent.name})
for a,b,attrs,body,sid,out in reversed(selected):
    src=str(out).replace("\\","/")
    html=html[:a]+f'<script{attrs} src="{src}?v=20260925"></script>'+html[b:]

html=html.replace("</head>","\n<!-- YARDIVO MODULAR WEBAPP PHASE 1 · 2026-09-25 -->\n</head>",1)
p.write_text(html,encoding="utf-8")

Path("app").mkdir(exist_ok=True)
Path("app/module-manifest.json").write_text(json.dumps({
    "version":"2026-09-25-phase1",
    "strategy":"behavior-preserving externalization",
    "scripts":manifest,
    "css":{"path":"styles/yardivo-runtime.css","source_style_blocks":len(active),"bytes":len(css.encode())}
},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")

Path("docs").mkdir(exist_ok=True)
Path("docs/architecture.md").write_text("""# YARDIVO web architecture

YARDIVO remains a browser web application on the same public URL.

## Migration rule
Production behavior comes first. The monolithic HTML is decomposed incrementally. Phase 1 externalizes large runtime blocks without changing script order and without adding async/defer behavior.

## Directories
- app/ — module registry and bootstrap metadata
- modules/ — feature runtime split by domain
- styles/ — cacheable application styles
- docs/ — architecture and migration notes

## Ownership target
Every feature converges to one runtime owner. New fixes should modify that owner instead of appending another final/fix/hotfix/authority script.

## Next phases
1. Consolidate Supplier into one public feature API.
2. Consolidate Supabase/Auth/Realtime into one service layer.
3. Consolidate Master Data owners.
4. Move large static view markup into templates/components.
5. Emit a small number of cacheable production bundles.
""",encoding="utf-8")

# invariants
new=p.read_text(encoding="utf-8")
assert len(manifest)>=80, len(manifest)
assert len(new.encode())<3000000, len(new.encode())
for key in ("yardivo-online-sync-v2-20260902","yardivo-v560-supplier-live-sync","yardivo-v583-supplier-history-status-server-authority-20260923","yardivo-v583-operational-chat"):
    assert key in new,key
assert 'media="not all"' in new
for item,src in zip(manifest,selected):
    disk=Path(item["path"]).read_text(encoding="utf-8")
    assert disk==src[3]
    assert hashlib.sha256(disk.encode()).hexdigest()==item["sha256"]
for src in re.findall(r'<script[^>]+src=["\']([^"\']+)["\']',new,re.I):
    clean=src.split("?",1)[0]
    if clean.startswith(("http://","https://","//")):continue
    assert Path(clean).exists(),clean
print(json.dumps({"before_bytes":len(original.encode()),"after_bytes":len(new.encode()),"externalized_scripts":len(manifest),"script_bytes":sum(x["bytes"] for x in manifest),"css_blocks":len(active),"css_bytes":len(css.encode())}))
