from pathlib import Path
import json,re,shutil

manifest_path=Path("app/module-manifest.json")
m=json.loads(manifest_path.read_text(encoding="utf-8"))

def target_group(sid):
    s=sid.lower()
    if "supplier" in s:return ("modules/supplier","supplier")
    if any(x in s for x in ("master","warehouse","location","ramp")):return ("modules/master-data","master-data")
    if "notification" in s:return ("modules/notifications","notifications")
    if any(x in s for x in ("operational-chat","help-chat","chat")):return ("modules/chat","chat")
    if any(x in s for x in ("self-gate","gate","qr")):return ("modules/gate","gate")
    if any(x in s for x in ("receiving","reception")):return ("modules/receiving","receiving")
    if "inventory" in s:return ("modules/inventory","inventory")
    if any(x in s for x in ("analytics","overview","control-tower")):return ("modules/analytics","analytics")
    if any(x in s for x in ("ai-","voice","assistant")):return ("modules/ai","ai")
    if any(x in s for x in ("settings","theme","light-mode","dark-")):return ("modules/settings","settings")
    if any(x in s for x in ("supabase","online-sync","auth","login","session","user-scope","sync")):return ("services","services")
    return ("modules/core","core")

html=Path("index.html").read_text(encoding="utf-8")
seen=set()
for item in m["scripts"]:
    old=Path(item["path"])
    folder,cat=target_group(item["id"])
    new=Path(folder)/old.name
    key=str(new)
    if key in seen:
        base=new.stem
        n=2
        while str(new.with_name(f"{base}-{n}{new.suffix}")) in seen:n+=1
        new=new.with_name(f"{base}-{n}{new.suffix}")
    seen.add(str(new))
    new.parent.mkdir(parents=True,exist_ok=True)
    if old.resolve()!=new.resolve():
        shutil.move(str(old),str(new))
    old_url=item["path"]+"?v=20260925"
    new_url=str(new).replace("\\","/")+"?v=20260925"
    assert old_url in html, item["id"]
    html=html.replace(old_url,new_url,1)
    item["path"]=str(new).replace("\\","/")
    item["category"]=cat

# remove empty generated dirs
for d in sorted(Path("modules").glob("*"),reverse=True):
    if d.is_dir() and not any(d.iterdir()):
        d.rmdir()

Path("index.html").write_text(html,encoding="utf-8")
manifest_path.write_text(json.dumps(m,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")

# invariants
required={
 "yardivo-online-sync-v2-20260902":"services/",
 "yardivo-v560-supplier-live-sync":"modules/supplier/",
 "yardivo-master-data-registry-final-v583":"modules/master-data/",
 "yardivo-v583-operational-chat":"modules/chat/",
 "yardivo-v583-help-chat-js":"modules/chat/",
 "yardivo-analytics-v1":"modules/analytics/",
 "yardivo-self-gate-pass-v1":"modules/gate/",
 "yardivo-receiving-header-warehouse-qr-v583":"modules/receiving/"
}
byid={x["id"]:x for x in m["scripts"]}
for sid,prefix in required.items():
    assert byid[sid]["path"].startswith(prefix),(sid,byid[sid]["path"])
    assert Path(byid[sid]["path"]).exists()
print({k:byid[k]["path"] for k in required})
