from pathlib import Path
import re

p = Path("index.html")
s = p.read_text(encoding="utf-8")
before = len(s)
changes = []

def script_bounds(script_id):
    marker = f'id="{script_id}"'
    pos = s.find(marker)
    if pos < 0:
        marker = f"id='{script_id}'"
        pos = s.find(marker)
    if pos < 0:
        return None
    a = s.rfind("<script", 0, pos)
    z = s.find("</script>", pos)
    if a < 0 or z < 0:
        return None
    z += len("</script>")
    while z < len(s) and s[z] in "\r\n":
        z += 1
    return a, z

def remove_script(script_id):
    global s
    bounds = script_bounds(script_id)
    if not bounds:
        return 0
    a, z = bounds
    s = s[:a] + s[z:]
    changes.append("remove:" + script_id)
    return 1

def replace_once(old, new, label, required=False):
    global s
    n = s.count(old)
    if n == 1:
        s = s.replace(old, new, 1)
        changes.append(label)
        return True
    if required and n == 0:
        raise SystemExit(f"{label}: missing expected text")
    if n > 1:
        raise SystemExit(f"{label}: ambiguous ({n} matches)")
    return False

def replace_in_script(script_id, old, new, label, required=False):
    global s
    bounds = script_bounds(script_id)
    if not bounds:
        if required:
            raise SystemExit(f"{label}: script not found: {script_id}")
        return False
    a, z = bounds
    block = s[a:z]
    n = block.count(old)
    if n == 1:
        block = block.replace(old, new, 1)
        s = s[:a] + block + s[z:]
        changes.append(label)
        return True
    if required and n == 0:
        raise SystemExit(f"{label}: missing expected text in {script_id}")
    if n > 1:
        raise SystemExit(f"{label}: ambiguous inside {script_id} ({n} matches)")
    return False

dead_ids = [
    "yardivo-live-yard-digital-twin-v1","yardivo-live-yard-tv-v5","yardivo-live-yard-v5-4-dock-clean",
    "yardivo-real-webgl-yard-v1","yardivo-native-yard-v3",
    "yardivo-v572-supplier-approval-bridge","yardivo-v573-supplier-request-notification-fix",
    "yardivo-inventory-supplier-active-warehouse-final-v583","yardivo-v583-master-header-location-capacity-authority",
    "yardivo-v583-supplier-linear-announcement-inventory-authority","yardivo-v583-supplier-canonical-master-ramps-map-final",
    "yardivo-v583-supplier-announcement-total-authority","yardivo-v583-supplier-no-flicker-canonical-authority",
    "yardivo-v583-supplier-center-calendar-authority","yardivo-v583-supplier-premium-ux-final-authority",
    "yardivo-v583-shared-ramp-hours-centered-supplier-map-authority","yardivo-v583-supplier-true-location-placeholder-authority",
    "yardivo-v583-supplier-single-authority-final","yardivo-v583-supplier-right-map-final",
    "yardivo-v583-supplier-inventory-style-authority","yardivo-v583-supplier-rebuilt-zero-authority",
    "yardivo-v583-capacity-visible-all-sections-authority","yardivo-v583-supplier-daily-map-after-date-final",
    "yardivo-v583-location-dropdowns-master-binding-final","yardivo-v583-master-popup-admin-final",
    "yardivo-v583-supplier-popup-header-multiwarehouse-final-authority","yardivo-v583-settings-master-deep-structure-final-js",
    "yardivo-v583-master-dwell-single-section-final-js","yardivo-v583-master-single-owner-smart-settings-final-js",
    "yardivo-v583-settings-master-exact-contract-js","yardivo-v583-admin-role-master-entry-authoritative-js",
    "yardivo-v583-settings-ordinary-visible-master-isolated-js","yardivo-v583-master-close-x-fix-js",
    "yardivo-v583-login-always-home-menu-final-js","yardivo-v583-settings-single-page-master-first-js",
    "yardivo-v583-admin-home-context-settings-authority-js","yardivo-v583-wh-time-supplier-calendar-hotfix-final",
    "yardivo-v583-supplier-booking-wizard-final","yardivo-v583-supplier-step-unlock-hotfix",
    "yardivo-v583-supplier-inbox-visibility-final-authority","yardivo-v583-inventory-supplier-inbox-notification-final-authority",
    "yardivo-v583-supabase-connection-watchdog-final","yardivo-v583-inventory-supplierrequests-rbac-final-guard",
    "yardivo-v583-inventory-supplier-filter-authority-final"
]
for script_id in dead_ids:
    remove_script(script_id)

# This active legacy block was loaded before the final authority flag existed, so its 1.5s
# list_mine poll kept running. The later server-authority module fully supersedes it.
remove_script("yardivo-v583-supplier-qr-history-live-20260923")

marker_ids = [
    "yardivo-v575-build-marker","yardivo-v576-build-marker","yardivo-v582-build-marker",
    "yardivo-v583-final-integrity-marker","yardivo-stability-hard-fix-marker-v1",
    "yardivo-v583-supplier-stability-marker","yardivo-v583-supplier-inbox-master-persistence-recovery-final",
    "yardivo-v583-supplier-global-scope-connected-final","yardivo-v583-master-warehouse-dropdown-config-fix-marker",
    "yardivo-v583-supplier-visible-warehouse-name-only-marker","yardivo-v583-master-full-warehouse-config-marker",
    "yardivo-v583-fullstack-reset-supplier-accounts-final-marker","yardivo-v583-supplier-calendar-strictmode-fix-marker",
    "yardivo-v583-supplier-map-fullscreen-duration-weekend-marker","yardivo-v583-qr-switch-scanner-only-marker",
    "yardivo-v583-no-flicker-bell-qr-whname-marker","yardivo-v583-inbox-no-flicker-root-permission-marker",
    "yardivo-v583-inventory-ui-master-names-final-marker","yardivo-v583-supabase-inbox-stable-final-marker",
    "yardivo-v583-notification-delete-filter-final-marker","yardivo-v583-deep-ui-stability-notif-delete-final-marker",
    "yardivo-v583-notification-sidebar-smooth-final-marker","yardivo-analytics-build-marker",
    "yardivo-v15-qa-smooth-theme-marker","yardivo-self-gate-admin-buttons-v2",
    "yardivo-qr-role-server-confirm-v587"
]
for script_id in marker_ids:
    remove_script(script_id)

# SupplierLiveSync becomes the sole periodic backend owner for list_internal/list_mine.
replace_once(
    "let __yardivoInternalSupplierFingerprint='';",
    "let __yardivoInternalSupplierFingerprint='';\nlet __yardivoInternalSupplierRows=null;\nlet __yardivoSupplierMineRows=null;",
    "add-supplier-caches",
    required=True,
)

replace_once(
"""  const rows=Array.isArray(rowsRaw)?rowsRaw:[];
  if(!Array.isArray(rows))return;
  try{""",
"""  const rows=Array.isArray(rowsRaw)?rowsRaw:[];
  if(!Array.isArray(rows))return;
  __yardivoSupplierMineRows=rows;
  try{window.dispatchEvent(new CustomEvent('yardivo:supplier-mine-rows',{detail:{rows}}))}catch(_){}
  try{""",
    "publish-mine-rows",
    required=True,
)

replace_once(
"""  const rows=(Array.isArray(rowsRaw)?rowsRaw:[]).filter(x=>!validWarehouseIds||!validWarehouseIds.size||validWarehouseIds.has(String(x?.warehouse||'').trim()));
  if(!Array.isArray(rows))return false;
  const fp=__yardivoSupplierRowsFingerprint(rows);""",
"""  const rows=(Array.isArray(rowsRaw)?rowsRaw:[]).filter(x=>!validWarehouseIds||!validWarehouseIds.size||validWarehouseIds.has(String(x?.warehouse||'').trim()));
  if(!Array.isArray(rows))return false;
  __yardivoInternalSupplierRows=rows;
  try{window.dispatchEvent(new CustomEvent('yardivo:supplier-internal-rows',{detail:{rows}}))}catch(_){}
  const fp=__yardivoSupplierRowsFingerprint(rows);""",
    "publish-internal-rows",
    required=True,
)

replace_once(
"window.YardivoSupplierLiveSync={call,pushSupplierRow,pushVehicle,pullSupplier,pullInternal,syncNow,busy:()=>__yardivoSupplierSyncBusy};",
"""window.YardivoSupplierLiveSync={
  call,pushSupplierRow,pushVehicle,pullSupplier,pullInternal,syncNow,
  busy:()=>__yardivoSupplierSyncBusy,
  internalRows:()=>Array.isArray(__yardivoInternalSupplierRows)?__yardivoInternalSupplierRows:null,
  mineRows:()=>Array.isArray(__yardivoSupplierMineRows)?__yardivoSupplierMineRows:null
};""",
    "expose-supplier-caches",
    required=True,
)

replace_once(
"""window.addEventListener('load',()=>setTimeout(syncNow,650));
window.addEventListener('yardivo:server-change',()=>setTimeout(syncNow,80));""",
"""window.addEventListener('load',()=>setTimeout(syncNow,650));
window.addEventListener('focus',()=>setTimeout(syncNow,120));
window.addEventListener('yardivo:server-change',()=>setTimeout(syncNow,80));""",
    "supplier-owner-focus-refresh",
    required=True,
)

# Stable inbox reads the shared cache instead of making its own list_internal request.
replace_once(
"""async function loadRows(){
 if(!window.YardivoSupplierLiveSync?.call)throw new Error('Supplier backend nije spreman.');
 const rows=await window.YardivoSupplierLiveSync.call('list_internal',{});
 return Array.isArray(rows)?rows:[];
}""",
"""async function loadRows(){
 const live=window.YardivoSupplierLiveSync;
 if(!live)throw new Error('Supplier backend nije spreman.');
 let rows=live.internalRows?.();
 if(!Array.isArray(rows)){
   await live.pullInternal?.(true);
   rows=live.internalRows?.();
 }
 return Array.isArray(rows)?rows:[];
}""",
    "inbox-cache-read",
    required=True,
)

replace_once(
"""window.addEventListener('yardivo:login',()=>setTimeout(()=>{bind();refresh(true);healOnline()},120));
window.addEventListener('yardivo:supplier-request-updated',()=>setTimeout(()=>{bind();refresh(true);healOnline()},120));
window.addEventListener('yardivo:gate-qr-issued',()=>setTimeout(()=>{bind();refresh(true);healOnline()},120));""",
"""window.addEventListener('yardivo:login',()=>setTimeout(()=>{bind();healOnline()},120));
window.addEventListener('yardivo:supplier-internal-rows',()=>setTimeout(()=>{bind();refresh(false)},0));
window.addEventListener('yardivo:supplier-request-updated',()=>setTimeout(()=>{bind();window.YardivoSupplierLiveSync?.pullInternal?.(true);healOnline()},120));
window.addEventListener('yardivo:gate-qr-issued',()=>setTimeout(()=>{bind();window.YardivoSupplierLiveSync?.pullInternal?.(true);healOnline()},120));""",
    "inbox-event-driven",
    required=True,
)

# Inventory notification/delete helper reads cache and no longer owns a second API polling loop.
replace_in_script(
    "yardivo-v583-inventory-supplier-notif-delete-20260923",
"""    const rows=await window.YardivoSupplierLiveSync.call('list_internal');
    if(!Array.isArray(rows))return;""",
"""    const rows=window.YardivoSupplierLiveSync.internalRows?.();
    if(!Array.isArray(rows))return;""",
    "inventory-cache-read",
    required=True,
)

replace_once(
"""      try{await window.YardivoSupplierRequests?.load?.()}catch(_){}
      try{window.dispatchEvent(new CustomEvent('yardivo:supplier-inbox-changed',{detail:{pending:rows.filter(x=>x.status==='pending').length}}))}catch(_){}""",
"""      try{window.dispatchEvent(new CustomEvent('yardivo:supplier-inbox-changed',{detail:{pending:rows.filter(x=>x.status==='pending').length}}))}catch(_){}""",
    "remove-duplicate-inbox-load",
    required=True,
)

replace_once(
"""window.addEventListener('yardivo:data-synced',()=>setTimeout(()=>{syncSupplierBadge();poll()},120));
window.addEventListener('yardivo:supplier-request-updated',()=>setTimeout(poll,80));""",
"""window.addEventListener('yardivo:data-synced',()=>setTimeout(syncSupplierBadge,120));
window.addEventListener('yardivo:supplier-internal-rows',()=>setTimeout(poll,0));
window.addEventListener('yardivo:supplier-request-updated',()=>setTimeout(()=>window.YardivoSupplierLiveSync?.pullInternal?.(true),80));""",
    "inventory-event-driven",
    required=True,
)

replace_once(
"""setInterval(()=>{if(!document.hidden)poll()},60000);
setInterval(syncSupplierBadge,700);""",
"""/* SupplierLiveSync is the sole list_internal polling owner. */
setInterval(syncSupplierBadge,3000);""",
    "remove-inventory-api-interval",
    required=True,
)

# Server-authoritative Supplier status/history consumes cached list_mine rows.
replace_once(
"""    const raw=await window.YardivoSupplierLiveSync?.call?.('list_mine');
    if(Array.isArray(raw)){""",
"""    const live=window.YardivoSupplierLiveSync;
    if(force)await live?.pullSupplier?.();
    let raw=live?.mineRows?.();
    if(!Array.isArray(raw)){
      await live?.pullSupplier?.();
      raw=live?.mineRows?.();
    }
    if(Array.isArray(raw)){""",
    "history-cache-read",
    required=True,
)

replace_once(
"""['yardivo:login','yardivo:data-synced','yardivo:supplier-qr-ready'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{hideFloatingSupplierUi();pull(true)},180)));""",
"""['yardivo:login','yardivo:supplier-qr-ready'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(()=>{hideFloatingSupplierUi();pull(true)},180)));
window.addEventListener('yardivo:supplier-mine-rows',()=>setTimeout(()=>{hideFloatingSupplierUi();pull(false)},0));
window.addEventListener('yardivo:data-synced',()=>setTimeout(()=>{hideFloatingSupplierUi();renderAll()},180));""",
    "history-event-driven",
    required=True,
)

# Chat traffic was small, but the old polling cadence generated unnecessary function calls.
for old, new, label in [
    ("chatTimer=setInterval(()=>{if(opened)loadMessages(true)},2500)", "chatTimer=setInterval(()=>{if(opened)loadMessages(true)},10000)", "help-chat-open"),
    ("badgeTimer=setInterval(pollBadge,6000)", "badgeTimer=setInterval(pollBadge,30000)", "help-chat-badge"),
    ("timer=setInterval(poll,3500)", "timer=setInterval(poll,30000)", "help-chat-admin"),
    ("timer=setInterval(()=>{if(opened)refreshThreads(false).then(loadMessages)},3000)", "timer=setInterval(()=>{if(opened)refreshThreads(false).then(loadMessages)},10000)", "op-chat-open"),
    ("setInterval(()=>{if(!document.hidden&&!opened)refreshThreads(true)},4000)", "setInterval(()=>{if(!document.hidden&&!opened)refreshThreads(true)},30000)", "op-chat-background"),
]:
    replace_once(old, new, label)

p.write_text(s, encoding="utf-8")

# Safety assertions: these are the architectural properties this cleanup is meant to enforce.
assert '<script id="yardivo-early-session">' in s
assert 'setInterval(refreshNow,1500)' not in s
assert 'yardivo-v583-supplier-qr-history-live-20260923' not in s
assert 'yardivo:supplier-internal-rows' in s
assert 'yardivo:supplier-mine-rows' in s
assert 'internalRows:' in s and 'mineRows:' in s

print(f"YARDIVO cleanup: {before} -> {len(s)} bytes ({before-len(s)} removed)")
print(f"changes={len(changes)}")
