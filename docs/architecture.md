# YARDIVO web architecture

YARDIVO remains a browser web application served through the same public link.

## Migration rule

Production behavior comes first. The legacy monolithic HTML is being decomposed incrementally.
Phase 1 externalizes large runtime blocks without changing their execution order or adding
async/defer semantics.

## Directories

- `app/` — bootstrap metadata and module registry
- `modules/` — feature runtime split by domain
- `styles/` — cacheable application styles
- `services/` / `modules/services/` — Supabase/Auth/sync runtime during transition
- `docs/` — architecture and migration notes

## Ownership target

Every feature should converge to one runtime owner. New fixes must modify the owner module
instead of appending another `final/fix/hotfix/authority` script to `index.html`.

## Next phases

1. Consolidate Supplier into one public feature API.
2. Consolidate Supabase/Auth/Realtime into one service layer.
3. Consolidate Master Data owners.
4. Move large static view markup to view templates/components.
5. Add a production build that emits a small number of cacheable bundles.
